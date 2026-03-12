export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.text();

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

      // ============================================================
      // STEP 1: Create user in Supabase Auth (so magic link works)
      // ============================================================
      let authUserId = null;
      try {
        const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            email_confirm: true
          })
        });
        const createData = await createRes.json();
        
        if (createData && createData.id) {
          authUserId = createData.id;
        } else {
          // User already exists — find ID from profiles
          const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id`, {
            method: 'GET',
            headers
          });
          const profiles = await profileRes.json();
          if (profiles && profiles.length > 0) {
            authUserId = profiles[0].id;
          }
        }
      } catch (e) {
        console.log('Auth user creation error:', e);
      }

      // ============================================================
      // STEP 2: Upsert email_leads
      // ============================================================
      try {
        const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/email_leads?email=eq.${encodeURIComponent(email)}`, {
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
        const patchData = await patchRes.json();
        
        if (!patchData || patchData.length === 0) {
          await fetch(`${SUPABASE_URL}/rest/v1/email_leads`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
              email: email,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan: plan,
              paid_at: new Date().toISOString(),
              source: 'stripe_webhook'
            })
          });
        }
      } catch (e) {
        console.log('email_leads upsert error:', e);
      }

      // ============================================================
      // STEP 3: Update or create profile
      // ============================================================
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

      if (userProfile) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userProfile.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              plan: plan,
              paid_at: new Date().toISOString(),
              stripe_customer_id: customerId,
              subscription_status: 'active'
            })
          });
        } catch (e) {
          console.log('profile update error:', e);
        }
      } else if (authUserId) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
              id: authUserId,
              email: email,
              plan: plan,
              paid_at: new Date().toISOString(),
              stripe_customer_id: customerId,
              subscription_status: 'active',
              referral_code: 'ns' + Math.random().toString(36).substr(2, 8)
            })
          });
          userProfile = { id: authUserId, referred_by: null };
        } catch (e) {
          console.log('profile create error:', e);
        }
      }

      // ============================================================
      // STEP 4: REFERRAL BONUS
      // ============================================================
      if (userProfile && userProfile.referred_by) {
        const bonusDays = plan === 'annual' ? 10 : plan === 'full' ? 5 : 3;

        try {
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

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
