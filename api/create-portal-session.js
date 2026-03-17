export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const email = body.email;
  if (!email) {
    return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // 1. Find Stripe customer by email
    const custRes = await fetch(
      'https://api.stripe.com/v1/customers?email=' + encodeURIComponent(email) + '&limit=1',
      { headers: { 'Authorization': 'Bearer ' + STRIPE_KEY } }
    );
    const custData = await custRes.json();

    if (!custData.data || custData.data.length === 0) {
      return new Response(JSON.stringify({ error: 'No subscription found for this email' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const customerId = custData.data[0].id;

    // 2. Check for active, trialing, or past_due subscription
    const subRes = await fetch(
      'https://api.stripe.com/v1/subscriptions?customer=' + customerId + '&limit=10',
      { headers: { 'Authorization': 'Bearer ' + STRIPE_KEY } }
    );
    const subData = await subRes.json();

    const hasActiveSub = subData.data && subData.data.some(function(s) {
      return s.status === 'active' || s.status === 'trialing' || s.status === 'past_due';
    });

    if (!hasActiveSub) {
      return new Response(JSON.stringify({ error: 'No active subscription found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Create portal session
    const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + STRIPE_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'customer=' + encodeURIComponent(customerId) + '&return_url=' + encodeURIComponent(process.env.PORTAL_RETURN_URL || 'https://drdangeli.com')
    });
    const portalData = await portalRes.json();

    if (portalData.url) {
      return new Response(JSON.stringify({ url: portalData.url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({ error: portalData.error && portalData.error.message || 'Failed to create portal session' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
