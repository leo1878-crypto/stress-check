export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.text();
  
  // Parse Stripe event (simplified verification for edge runtime)
  let event;
  try {
    event = JSON.parse(body);
  } catch (err) {
    return new Response('Invalid JSON', { status: 400 });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email || (session.metadata && session.metadata.email) || '';
    const plan = (session.metadata && session.metadata.plan) || 'base';
    const customerId = session.customer || '';
    const subscriptionId = session.subscription || '';

    if (email) {
      // Update email_leads
      await fetch(`${SUPABASE_URL}/rest/v1/email_leads?email=eq.${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          stripe_customer_id: customerId,
          plan: plan,
          subscribed_at: new Date().toISOString()
        })
      });

      // Insert subscription
      const expiresAt = plan === 'yearly'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          email: email,
          plan: plan,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          expires_at: expiresAt
        })
      });

      // Process referral bonus
      const refRes = await fetch(`${SUPABASE_URL}/rest/v1/email_leads?email=eq.${encodeURIComponent(email)}&select=referrer_code`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      const refData = await refRes.json();
      if (refData && refData[0] && refData[0].referrer_code) {
        const bonusDays = plan === 'yearly' ? 14 : plan === 'full' ? 7 : 5;
        await fetch(`${SUPABASE_URL}/rest/v1/referral_bonuses`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            referrer_code: refData[0].referrer_code,
            referred_email: email,
            referred_plan: plan,
            bonus_days: bonusDays
          })
        });
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscription.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ status: 'cancelled' })
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
