// ============================================================ 
// EMAIL TEMPLATES — Series A, B, C, D
// ============================================================

function getSeriesABody(num, data) {
  const zones = data.body_zones || [];
  const upper = zones.filter(z => ['head','jaw','shoulders','neck','throat'].includes(z));
  const middle = zones.filter(z => ['chest','solar','stomach'].includes(z));
  const lower = zones.filter(z => ['pelvis','legs'].includes(z));

  let zoneBlock = '';
  if (zones.length >= 6) {
    zoneBlock = 'You selected zones across your whole body. That usually means your nervous system has been running in overdrive long enough that tension has spread beyond the original source. The body stops localizing and just locks up everywhere.';
  } else if (upper.length >= middle.length && upper.length >= lower.length) {
    zoneBlock = "Head, jaw, shoulders. This is an activation pattern. Your brainstem is sending a \"stay alert\" signal to the muscles that prepare you to fight or run. The jaw alone burns through an enormous amount of energy when it's clenched all day.";
  } else if (middle.length >= lower.length) {
    zoneBlock = "Chest, solar plexus, stomach. These areas are packed with vagal nerve endings. When your body registers threat, real or remembered, the gut responds first. That heaviness in the chest, the knot in the stomach, the shallow breathing.";
  } else {
    zoneBlock = "Pelvis, legs. This pattern usually points to a freeze response. Your body is holding energy in the lower half, ready to run but unable to move. The legs feel heavy or restless.";
  }

  const btn = '<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Take the free Stress Check</a>';

  const templates = {
    1: { subject: 'Your body map results', body: `Hi,\n\nYou just mapped where your body holds tension. Here's what that pattern usually means.\n\n${zoneBlock}\n\nThe map shows you where. The question is why your body keeps doing this, and what state your nervous system is stuck in. That's what the full check-in answers. It takes about 3 minutes.\n\n${btn}\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    2: { subject: "Why your body won't let go", body: `Hi,\n\nA couple of days ago you mapped where your body holds tension. Quick question: has anything changed since then? Probably not. And that's the point.\n\nChronic tension doesn't come from what happened today. It comes from your nervous system replaying a pattern it learned years ago.\n\nIf you want to see which state is driving the pattern, the nervous system check-in will show you. Three minutes, seven questions.\n\n${btn}\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    3: { subject: 'One thing you can try today', body: `Hi,\n\nHere's a simple regulation exercise. It targets the vagus nerve directly.\n\nSit somewhere comfortable. Breathe in through your nose for 4 counts. Breathe out through your mouth for 6 counts. The exhale being longer than the inhale is what matters. Do this for 2 minutes.\n\nThe Stress Check has 120 exercises like this, each matched to a specific nervous system state.\n\n${btn}\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    4: { subject: 'What your body is actually telling you', body: `Hi,\n\n${zoneBlock}\n\nThe body map gave you the geography. The Stress Check gives you the mechanism. Together they tell you exactly what's happening and what to do about it.\n\n${btn}\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    5: { subject: 'Last one from me', body: `Hi,\n\nThis is the last email in this series.\n\nYour body map showed a clear pattern. The tension you mapped isn't random. It's your nervous system running a program that was written a long time ago.\n\nIf you want to understand the program, the Stress Check will show you. Three minutes. Your results are private.\n\n${btn}\n\nIf this isn't the right time, no pressure at all.\n\nTake care,\nDr. Tatiana D'Angeli` }
  };
  return templates[num] || null;
}

function getSeriesBBody(num, data) {
  const state = data.ns_state || 'sympathetic';
  const stateTexts = {
    sympathetic: { name: 'sympathetic activation', b1: "Your system has been running in alert mode for a while, probably longer than you realize. The 2-4 AM wake-ups, the jaw clenching, the feeling that you can't fully exhale. Cortisol peaks between 2 and 4 AM in this pattern.", b2: "When your system is in sympathetic activation, your hypothalamus signals the adrenal glands to produce cortisol and adrenaline. In a healthy cycle this lasts minutes. In your pattern it lasts months or years. Sleep architecture breaks, digestion slows, your prefrontal cortex goes partially offline.", b3: "The physiological sigh: two short inhales through the nose, then one long slow exhale through the mouth. Repeat 3 times. The double inhale fully inflates the alveoli, and the long exhale activates the parasympathetic branch through the vagus nerve." },
    dorsal: { name: 'dorsal shutdown', b1: "Your system has pulled the brakes. The heaviness, the fog, the way everything takes twice the effort it should. That's dorsal vagal activation. Your body is conserving energy the way it learned to when the world felt like too much.", b2: "Dorsal vagal shutdown is your oldest survival circuit. When the brainstem calculates that fighting or running won't work, it drops the system into conservation mode. Heart rate falls, blood pressure drops, metabolism slows.", b3: "Run cold water over the inside of your wrists for 30 seconds. The skin there is thin and the radial artery is close to the surface. The cold stimulates peripheral nerve endings and sends an alerting signal through the vagus nerve." },
    freeze: { name: 'freeze response', b1: "Your system is doing two things at once, accelerating and braking simultaneously. That's why you feel wired but stuck, anxious but unable to act.", b2: "Freeze is what happens when sympathetic activation and dorsal shutdown fire simultaneously. Cortisol and adrenaline are elevated, but your dorsal vagus is also pulling the system down. The result is a locked state.", b3: "Sit comfortably and tap your knees alternately, left-right-left-right, at walking speed. Do this for 60 seconds. This is a simplified version of EMDR bilateral stimulation." },
    ventral: { name: 'ventral regulation', b1: "Your system is currently regulated. You have access to your prefrontal cortex, your breathing is even, your body feels relatively settled. The question is how often you stay here, and what pulls you out.", b2: "Ventral vagal regulation is the state where your social engagement system is online. Your facial muscles are relaxed, your breathing is diaphragmatic, and your prefrontal cortex has full access to executive function.", b3: "Put one hand on your chest. Notice the temperature of your palm against your body. Notice the rhythm of your breathing without changing it. Stay here for 90 seconds. You're creating a somatic marker your body can return to." }
  };
  const st = stateTexts[state] || stateTexts.sympathetic;
  const btn = '<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Continue your check-ins</a>';
  const btnPlan = '<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">See plans</a>';

  const templates = {
    1: { subject: 'Your stress check results', body: `Hi,\n\nYou completed the Stress Check. Your nervous system is currently in a state we call ${st.name}.\n\n${st.b1}\n\nThis pattern didn't start last week. Your nervous system wrote these rules years ago. The rules made sense then. They kept you safe. The problem is they're still running.\n\nOver the next few days I'll send you three short emails about what's happening and what you can do.\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    2: { subject: "What's happening inside your nervous system", body: `Hi,\n\n${st.b2}\n\nTomorrow: a specific exercise matched to your state.\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    3: { subject: 'An exercise for your state', body: `Hi,\n\nHere's one exercise matched to your nervous system state. Try it once today, notice what happens.\n\n${st.b3}\n\nThe app has 120 exercises like these, each calibrated to one of four nervous system states. A new one matched to your current state every day.\n\n${btn}\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    4: { subject: 'What changes after 2-4 weeks', body: `Hi,\n\nThe first check-in gives you a snapshot. The real information starts emerging around week 2-3, when the pattern becomes visible.\n\nThe first week, you start noticing your state. Week two, the awareness itself starts shifting things. By week three or four, people usually report either a specific symptom has clearly reduced, or they have a moment of clarity about where the pattern started.\n\nThree plans, starting at $9.90/month. Cancel anytime.\n\n${btnPlan}\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    5: { subject: 'Your nervous system, one week later', body: `Hi,\n\nA week ago your Stress Check showed ${st.name}. If you repeated it today, it might show the same thing. That's the nature of chronic patterns.\n\nBut here's what can shift: how quickly you notice it. How early you catch it. And how much time you spend there before your system finds its way back to regulation.\n\nThree options:\n\nBasic ($9.90/mo): daily check-in, tracker, one exercise per day, self-worth insights.\nFull ($14.90/mo): everything in Basic + subconscious patterns, relationships, finances, crisis protocols.\nAnnual ($99/year): everything in Full + sleep, nutrition, audio practices, daily routine. $8.25/mo.\n\n${btnPlan}\n\nCancel anytime.\n\nTake care,\nDr. Tatiana D'Angeli` }
  };
  return templates[num] || null;
}

// ============================================================
// SERIES C — Cancelled or payment failed subscribers
// ============================================================
function getSeriesCBody(num, data) {
  const plan = data.plan || 'base';
  const planName = plan === 'yearly' ? 'Annual' : plan === 'full' ? 'Full' : 'Basic';
  const btn = '<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Reactivate your subscription</a>';
  const btnAnnual = '<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Switch to Annual — $99/year</a>';

  if (data.subscription_status === 'past_due') {
    return { subject: 'Your payment needs attention', body: `Hi,\n\nWe tried to process your payment for the ${planName} plan, but it didn't go through.\n\nYour access is still active for now, but it will be paused if we can't process the payment in the next few days.\n\nYou can update your payment method in the app: open Account, tap Manage Subscription, then Update card.\n\nIf you have questions, reply to this email.\n\n${btn}\n\nDr. Tatiana D'Angeli` };
  }

  const templates = {
    1: { subject: 'Your subscription has ended', body: `Hi,\n\nYour ${planName} subscription has ended. Your check-in history and body map are still saved in your account.\n\nWhat changes: you won't be able to take new daily check-ins or access your personalized protocols until you resubscribe.\n\nYour data and progress are waiting exactly where you left off.\n\n${btn}\n\nDr. Tatiana D'Angeli` },
    2: { subject: 'What happens when you stop tracking', body: `Hi,\n\nWhen you stop daily check-ins, the patterns don't stop. They just go back to running without your awareness.\n\nThe jaw still clenches. The cortisol still spikes at 3 AM. The nervous system still cycles through the same states. The only difference is you're no longer catching it.\n\nMost of the change comes from consistent awareness over 3-4 weeks.\n\nYour data is still there. Your account is still active.\n\n${btn}\n\nDr. Tatiana D'Angeli` },
    3: { subject: 'A different option', body: `Hi,\n\nThis is the last email about your subscription.\n\nIf the monthly cost was a factor, the Annual plan might work better. It's $99 for the full year ($8.25/month). Everything included: all check-ins, all protocols, nutrition, sleep, daily routine, audio practices, and the book when it's released.\n\n${btnAnnual}\n\nIf now isn't the right time, your account and history will be here whenever you're ready.\n\nTake care,\nDr. Tatiana D'Angeli` }
  };
  return templates[num] || null;
}

// ============================================================
// SERIES D — Upgrade suggestions (1 email, after 14 days)
// ============================================================
function getSeriesDBody(data) {
  const plan = data.plan || 'base';
  const btn = '<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Open the app</a>';

  if (plan === 'base') {
    return { subject: "There's more to your pattern", body: `Hi,\n\nYou've been tracking your nervous system for a couple of weeks now. By now you probably see the pattern forming in your tracker.\n\nThe Basic plan shows you what's happening and gives you an exercise each day. That's the foundation.\n\nBut there's a layer underneath. The subconscious patterns from childhood. How your nervous system shapes your relationships, financial decisions, and sense of self-worth.\n\nThe Full plan ($14.90/mo) opens all of that:\n\n- Subconscious patterns from childhood\n- Relationships: partner, children, the world\n- Finances: why your nervous system blocks certain behaviors\n- Crisis protocol: what to do when everything falls apart\n\nYou can upgrade from the Account tab.\n\n${btn}\n\nDr. Tatiana D'Angeli` };
  }

  if (plan === 'full') {
    return { subject: 'Save $79 with Annual', body: `Hi,\n\nYou've been on the Full plan for a while. If you're planning to continue, the Annual plan saves you $79.80 over the year.\n\nAnnual is $99/year ($8.25/month). Plus extras not in the monthly plan:\n\n- Nutrition protocol matched to your state\n- Sleep protocol (why you wake at 3 AM, what to do)\n- Daily routine: morning, afternoon, evening\n- Guided audio practices by Dr. D'Angeli\n- The book "Why Your Body Won't Let You Earn More"\n\nYou can switch from Account > Manage Subscription.\n\n${btn}\n\nDr. Tatiana D'Angeli` };
  }

  return null;
}


function wrapHtml(bodyText) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#2C2825;max-width:560px;margin:0 auto;padding:24px 16px;">${bodyText.split('\n').map(l => l.trim() ? '<p style="margin:0 0 14px 0;">' + l + '</p>' : '').join('')}<hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;"><p style="font-size:11px;color:#999;">Dr. Tatiana D'Angeli, PhD · Clinical Psychologist<br><a href="https://drdangeli.com" style="color:#C9A87C;">drdangeli.com</a> · <a href="https://instagram.com/dr.dangeli.tatiana" style="color:#C9A87C;">@dr.dangeli.tatiana</a><br><span style="font-size:10px;">Reply "unsubscribe" to stop these emails.</span></p></body></html>`;
}

const DELAY_DAYS = [0, 2, 4, 6, 8];
const CANCEL_DELAY_DAYS = [0, 3, 7];

// ============================================================
// MAIN HANDLER
// ============================================================
export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const RESEND_KEY = process.env.RESEND_API_KEY;
  const now = new Date();
  let sent = 0, errors = 0;

  try {
    // === SERIES A + B ===
    const dbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/email_leads?email_number=lt.5&subscribed_at=is.null&select=*`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const leads = await dbRes.json();
    if (leads && Array.isArray(leads)) {
      for (const lead of leads) {
        const nextNum = (lead.email_number || 0) + 1;
        if (nextNum > 5) continue;
        const daysSince = (now - new Date(lead.created_at)) / (1000*60*60*24);
        if (daysSince < DELAY_DAYS[nextNum - 1]) continue;
        if (lead.last_sent_at && (now - new Date(lead.last_sent_at)) / (1000*60*60) < 20) continue;

        const tpl = lead.series === 'B' ? getSeriesBBody(nextNum, lead) : getSeriesABody(nextNum, lead);
        if (!tpl) continue;
        if (await sendEmail(RESEND_KEY, lead.email, tpl.subject, tpl.body)) {
          await patchTable(SUPABASE_URL, SUPABASE_KEY, 'email_leads', 'email', lead.email, { email_number: nextNum, last_sent_at: now.toISOString() });
          sent++;
        } else errors++;
      }
    }

    // === SERIES C: first email for cancelled/past_due ===
    const cRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?subscription_status=in.(cancelled,past_due)&cancel_email_number=is.null&select=email,plan,subscription_status`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const cList = await cRes.json();
    if (cList && Array.isArray(cList)) {
      for (const p of cList) {
        if (!p.email) continue;
        const tpl = getSeriesCBody(1, p);
        if (!tpl) continue;
        if (await sendEmail(RESEND_KEY, p.email, tpl.subject, tpl.body)) {
          await patchTable(SUPABASE_URL, SUPABASE_KEY, 'profiles', 'email', p.email, { cancel_email_number: 1, cancel_email_sent_at: now.toISOString() });
          sent++;
        } else errors++;
      }
    }

    // === SERIES C: follow-ups 2 and 3 (cancelled only, not past_due) ===
    const cFollowRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?subscription_status=eq.cancelled&cancel_email_number=gt.0&cancel_email_number=lt.3&select=email,plan,subscription_status,cancel_email_number,cancel_email_sent_at`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const cFollowList = await cFollowRes.json();
    if (cFollowList && Array.isArray(cFollowList)) {
      for (const p of cFollowList) {
        if (!p.email) continue;
        const nextNum = (p.cancel_email_number || 0) + 1;
        if (nextNum > 3) continue;
        if (p.cancel_email_sent_at) {
          const daysSince = (now - new Date(p.cancel_email_sent_at)) / (1000*60*60*24);
          if (daysSince < CANCEL_DELAY_DAYS[nextNum - 1]) continue;
        }
        const tpl = getSeriesCBody(nextNum, p);
        if (!tpl) continue;
        if (await sendEmail(RESEND_KEY, p.email, tpl.subject, tpl.body)) {
          await patchTable(SUPABASE_URL, SUPABASE_KEY, 'profiles', 'email', p.email, { cancel_email_number: nextNum, cancel_email_sent_at: now.toISOString() });
          sent++;
        } else errors++;
      }
    }

    // === SERIES D: upgrade (1 email, after 14 days) ===
    const dRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?subscription_status=eq.active&plan=in.(base,full)&upgrade_email_sent=is.null&select=email,plan,paid_at`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const dList = await dRes.json();
    if (dList && Array.isArray(dList)) {
      for (const p of dList) {
        if (!p.email || !p.paid_at) continue;
        if ((now - new Date(p.paid_at)) / (1000*60*60*24) < 14) continue;
        const tpl = getSeriesDBody(p);
        if (!tpl) continue;
        if (await sendEmail(RESEND_KEY, p.email, tpl.subject, tpl.body)) {
          await patchTable(SUPABASE_URL, SUPABASE_KEY, 'profiles', 'email', p.email, { upgrade_email_sent: now.toISOString() });
          sent++;
        } else errors++;
      }
    }

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  return res.status(200).json({ sent, errors, timestamp: now.toISOString() });
}

// ============================================================
// HELPERS
// ============================================================
async function sendEmail(key, to, subject, body) {
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: "Dr. Tatiana D'Angeli <hello@drdangeli.com>", to: [to], subject, html: wrapHtml(body) })
    });
    return r.ok;
  } catch (e) { return false; }
}

async function patchTable(url, key, table, field, value, data) {
  await fetch(`${url}/rest/v1/${table}?${field}=eq.${encodeURIComponent(value)}`, {
    method: 'PATCH',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
    body: JSON.stringify(data)
  });
}
