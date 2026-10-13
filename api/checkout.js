export const config = { runtime: 'edge' };

const PRODUCT = 'metod4r_usd';
const DEFAULT_AMOUNT = 7000; // $70.00

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
  if (!STRIPE_KEY) {
    return json(503, { error: 'Stripe is not configured (STRIPE_SECRET_KEY).' });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return json(400, { error: 'Invalid JSON body.' });
  }

  const first = String(body.first_name || '').trim();
  const last = String(body.last_name || '').trim();
  const phone = String(body.phone || '').trim();
  const email = String(body.email || '').trim();

  if (!first || !last || !phone || !email) {
    return json(422, { error: 'First name, last name, phone, and email are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(422, { error: 'Invalid email.' });
  }

  const origin = (process.env.SITE_ORIGIN || 'https://www.drdangeli.com').replace(/\/$/, '');
  const successUrl = process.env.STRIPE_SUCCESS_URL || (origin + '/payment/success.html?session_id={CHECKOUT_SESSION_ID}');
  const cancelUrl = process.env.STRIPE_CANCEL_URL || (origin + '/payment/cancel.html');
  const priceId = String(process.env.STRIPE_PRICE_ID || '').trim();
  const unitAmount = Number.parseInt(process.env.STRIPE_UNIT_AMOUNT || String(DEFAULT_AMOUNT), 10);
  const amount = Number.isFinite(unitAmount) && unitAmount > 0 ? unitAmount : DEFAULT_AMOUNT;

  // Flow markers: bot + check-in webhook both receive Stripe events on this account.
  // Landing payments MUST set these so handlers can split streams reliably.
  const metadata = {
    product: PRODUCT,
    source: 'metod4r_landing',
    flow: 'landing_metod4r',
    site: 'drdangeli.com/metod4r',
    first_name: first.slice(0, 120),
    last_name: last.slice(0, 120),
    phone: phone.slice(0, 64),
    email: email.slice(0, 254),
  };

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('customer_email', email);
  params.append('client_reference_id', 'metod4r-' + Date.now());
  params.append('success_url', successUrl);
  params.append('cancel_url', cancelUrl);
  Object.keys(metadata).forEach((k) => {
    params.append('metadata[' + k + ']', metadata[k]);
    params.append('payment_intent_data[metadata][' + k + ']', metadata[k]);
  });

  if (priceId) {
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');
  } else {
    params.append('line_items[0][quantity]', '1');
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][unit_amount]', String(amount));
    params.append('line_items[0][price_data][product_data][name]', 'Method 4R — self-paced course');
    params.append('line_items[0][price_data][product_data][metadata][product]', PRODUCT);
    params.append('line_items[0][price_data][product_data][metadata][source]', 'metod4r_landing');
  }

  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + STRIPE_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      const msg = (data && data.error && data.error.message) ? data.error.message : 'Stripe error';
      return json(502, { error: String(msg).slice(0, 200) });
    }
    return json(200, { url: data.url, id: data.id });
  } catch (e) {
    return json(502, { error: 'Network error talking to Stripe.' });
  }
}
