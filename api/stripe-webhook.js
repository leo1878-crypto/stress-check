import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response('Webhook Error: ' + err.message, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email  session.metadata?.email  '';
    const plan = session.metadata?.plan || 'base';
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    if (email) {
      // 1. Update email_leads with subscription info
      try {
        await supabase.from('email_leads').update({
          stripe_customer_id: customerId,
          plan: plan,
          subscribed_at: new Date().toISOString()
        }).eq('email', email);
      } catch (e) {
        console.error('Failed to update email_leads:', e);
      }

      // 2. Insert into subscriptions table
      try {
        const expiresAt = plan === 'yearly'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await supabase.from('subscriptions').upsert({
          email: email,
          plan: plan,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          expires_at: expiresAt
        }, { onConflict: 'email' });
      } catch (e) {
        console.error('Failed to insert subscription:', e);
      }

      // 3. Process referral bonus
      try {
        const { data: lead } = await supabase
          .from('email_leads')
          .select('referrer_code')
          .eq('email', email)
          .single();

        if (lead && lead.referrer_code) {
          const bonusDays = plan === 'yearly' ? 14 : plan === 'full' ? 7 : 5;

          await supabase.from('referral_bonuses').insert({
            referrer_code: lead.referrer_code,
            referred_email: email,
            referred_plan: plan,
            bonus_days: bonusDays
          });
        }
      } catch (e) {
        console.error('Failed to process referral:', e);
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    try {
      await supabase.from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', subscription.id);
    } catch (e) {
      console.error('Failed to cancel subscription:', e);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
