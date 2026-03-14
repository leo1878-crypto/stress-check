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
    const email = session.customer_email || (session.customer_details && session.customer_details.email) || (session.metadata && session.metadata.email) || '';
    const plan = (session.metadata && session.metadata.plan) || 'base';
    const customerId = session.customer || '';
    const subscriptionId = session.subscription || '';
    const now = new Date();

    // Calculate expires_at based on plan
    const expiresAt = new Date(now);
    if (plan === 'annual' || plan === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    if (email) {

      // ============================================================
      // STEP 1: Create user in Supabase Auth
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
      // STEP 2: Update or create email_leads
      // ============================================================
      try {
        const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/email_leads?email=eq.${encodeURIComponent(email)}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan: plan,
            paid_at: now.toISOString(),
            subscribed_at: now.toISOString(),
            updated_at: now.toISOString()
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
              paid_at: now.toISOString(),
              subscribed_at: now.toISOString(),
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
              paid_at: now.toISOString(),
              stripe_customer_id: customerId,
              subscription_status: 'active',
              updated_at: now.toISOString()
            })
          });
        } catch (e) {
          console.log('profile update error:', e);
        }
      } else {
        // No profile found by email — need to create
        // Wait for handle_new_user trigger if auth user was just created
        if (authUserId) {
          try {
            await new Promise(r => setTimeout(r, 1000));
            // Try to update profile created by trigger
            const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${authUserId}`, {
              method: 'PATCH',
              headers,
              body: JSON.stringify({
                plan: plan,
                paid_at: now.toISOString(),
                stripe_customer_id: customerId,
                subscription_status: 'active',
                updated_at: now.toISOString()
              })
            });
            const patchData = await patchRes.json();

            if (!patchData || patchData.length === 0) {
              // Trigger didn't create it — insert manually
              await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
                method: 'POST',
                headers: { ...headers, 'Prefer': 'return=minimal' },
                body: JSON.stringify({
                  id: authUserId,
                  email: email,
                  plan: plan,
                  paid_at: now.toISOString(),
                  stripe_customer_id: customerId,
                  subscription_status: 'active',
                  referral_code: 'ns' + Math.random().toString(36).substr(2, 8),
                  updated_at: now.toISOString()
                })
              });
            }
            userProfile = { id: authUserId, referred_by: null };
          } catch (e) {
            console.log('profile create error:', e);
          }
        }
      }

      // ============================================================
      // STEP 4: Insert into subscriptions
      // ============================================================
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            email: email,
            plan: plan,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            expires_at: expiresAt.toISOString(),
            created_at: now.toISOString()
          })
        });
      } catch (e) {
        console.log('subscriptions insert error:', e);
      }

      // ============================================================
      // STEP 5: REFERRAL BONUS
      // ============================================================
      if (userProfile && userProfile.referred_by) {
        const bonusDays = (plan === 'annual' || plan === 'yearly') ? 10 : plan === 'full' ? 5 : 3;

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
                  updated_at: now.toISOString()
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

  // Handle subscription cancellation
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer || '';

    if (customerId) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?stripe_customer_id=eq.${encodeURIComponent(customerId)}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString()
          })
        });
        await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?stripe_customer_id=eq.${encodeURIComponent(customerId)}&status=eq.active`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: 'cancelled'
          })
        });
      } catch (e) {
        console.log('subscription cancellation error:', e);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

