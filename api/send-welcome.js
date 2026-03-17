export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) {
    return res.status(500).json({ error: 'Resend not configured' });
  }

  const { email, ns_state } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const stateTexts = {
    sympathetic: { name: 'sympathetic activation', icon: '⚡', desc: 'Your nervous system is running in alert mode. Cortisol peaks, shallow breathing, jaw clenching.' },
    dorsal: { name: 'dorsal shutdown', icon: '🌊', desc: 'Your nervous system has pulled the brakes. Heaviness, fog, everything takes twice the effort.' },
    freeze: { name: 'freeze response', icon: '🧊', desc: 'Your system is accelerating and braking simultaneously. Wired but stuck, anxious but unable to act.' },
    ventral: { name: 'ventral regulation', icon: '🌿', desc: 'Your nervous system is regulated. Breathing is even, body feels settled. The question is how often you stay here.' }
  };

  const st = stateTexts[ns_state] || stateTexts.sympathetic;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#2C2825;max-width:560px;margin:0 auto;padding:24px 16px;">
<p style="margin:0 0 14px 0;">Hi,</p>
<p style="margin:0 0 14px 0;">Your account is ready. Here's your nervous system state:</p>
<div style="background:#F8F5F0;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
<div style="font-size:32px;margin-bottom:8px;">${st.icon}</div>
<div style="font-size:18px;font-weight:600;margin-bottom:6px;text-transform:capitalize;">${st.name}</div>
<div style="font-size:14px;color:#666;">${st.desc}</div>
</div>
<p style="margin:0 0 14px 0;">Your data is saved. You can access it anytime from any device.</p>
<p style="margin:0 0 14px 0;text-align:center;"><a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;">Open your app</a></p>
<p style="margin:0 0 14px 0;">Over the next few days, I'll send you insights about your nervous system pattern and what you can do about it.</p>
<p style="margin:0 0 14px 0;">Talk soon,<br>Dr. Tatiana D'Angeli</p>
<hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;">
<p style="font-size:11px;color:#999;">Dr. Tatiana D'Angeli, PhD · Clinical Psychologist<br><a href="https://drdangeli.com" style="color:#C9A87C;">drdangeli.com</a> · <a href="https://instagram.com/dr.dangeli.tatiana" style="color:#C9A87C;">@dr.dangeli.tatiana</a></p>
</body></html>`;

  try {
    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: "Dr. Tatiana D'Angeli <hello@drdangeli.com>",
        to: [email],
        subject: 'Your account is ready',
        html: html
      })
    });

    if (sendRes.ok) {
      return res.status(200).json({ sent: true });
    } else {
      const err = await sendRes.json();
      return res.status(500).json({ error: err.message || 'Send failed' });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
