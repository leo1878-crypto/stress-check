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

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email || (session.metadata && session.metadata.email) || '';
    const plan = (session.metadata && session.metadata.plan) || 'base';
    const customerId = session.customer || '';
    const subscriptionId = session.subscription || '';

    if (email) {
      // 1. Update email_leads with subscription info
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/email_leads?email=eq.${encodeURIComponent(email)}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan: plan,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        });
      } catch (e) {
        console.log('email_leads update error:', e);
      }

      // 2. Find user profile by email
      let userProfile = null;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id,referred_by`, {
          method: 'GET',
          headers
        });
        const profiles = await res.json();
        if (profiles && profiles.length > 0) {
          userProfile = profiles[0];
        }
      } catch (e) {
        console.log('profile lookup error:', e);
      }

      // 3. Update user profile with subscription
      if (userProfile) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userProfile.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              plan: plan,
              paid_at: new Date().toISOString(),
              stripe_customer_id: customerId
            })
          });
        } catch (e) {
          console.log('profile update error:', e);
        }

        // 4. REFERRAL BONUS: if this user was referred, credit the referrer
        if (userProfile.referred_by) {
          const bonusDays = plan === 'annual' ? 10 : plan === 'full' ? 5 : 3;

          try {
            // Get referrer's current bonus info
            const refRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userProfile.referred_by}&select=id,bonus_days,referral_count,bonus_cycle_used`, {
              method: 'GET',
              headers
            });
            const referrers = await refRes.json();

            if (referrers && referrers.length > 0) {
              const referrer = referrers[0];
              const currentBonus = referrer.bonus_days || 0;
              const currentCount = referrer.referral_count || 0;
              const cycleUsed = referrer.bonus_cycle_used || 0;

              // Apply limit: max 30 bonus days per cycle
              const canAdd = Math.min(bonusDays, 30 - cycleUsed);

              if (canAdd > 0) {
                await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userProfile.referred_by}`, {
                  method: 'PATCH',
                  headers,
                  body: JSON.stringify({
                    bonus_days: currentBonus + canAdd,
                    referral_count: currentCount + 1,
                    bonus_cycle_used: cycleUsed + canAdd,
                    updated_at: new Date().toISOString()
                  })
                });
              }
            }
          } catch (e) {
            console.log('referral bonus error:', e);
          }
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
