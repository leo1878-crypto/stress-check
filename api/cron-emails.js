export const config = { runtime: 'nodejs' };

// ============================================================
// EMAIL TEMPLATES
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
    zoneBlock = "Head, jaw, shoulders. This is an activation pattern. Your brainstem is sending a \"stay alert\" signal to the muscles that prepare you to fight or run. The jaw alone burns through an enormous amount of energy when it's clenched all day. Most people don't notice they're doing it until the headache starts around 4 PM.";
  } else if (middle.length >= lower.length) {
    zoneBlock = "Chest, solar plexus, stomach. These areas are packed with vagal nerve endings. When your body registers threat, real or remembered, the gut responds first. That heaviness in the chest, the knot in the stomach, the shallow breathing. Your diaphragm tightens and the whole system shifts into conservation mode.";
  } else {
    zoneBlock = "Pelvis, legs. This pattern usually points to a freeze response. Your body is holding energy in the lower half, ready to run but unable to move. The legs feel heavy or restless, the pelvic floor holds tension you might not even be aware of.";
  }

  const btn = '<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Take the free Stress Check</a>';

  const templates = {
    1: { subject: 'Your body map results', body: `Hi,\n\nYou just mapped where your body holds tension. Here's what that pattern usually means.\n\n${zoneBlock}\n\nThe map shows you where. The question is why your body keeps doing this, and what state your nervous system is stuck in. That's what the full check-in answers. It takes about 3 minutes.\n\n${btn}\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    2: { subject: "Why your body won't let go", body: `Hi,\n\nA couple of days ago you mapped where your body holds tension. Quick question: has anything changed since then? Probably not. And that's the point.\n\nChronic tension doesn't come from what happened today. It comes from your nervous system replaying a pattern it learned years ago. The jaw clenches before you even register stress. The shoulders ride up to your ears during a normal Tuesday.\n\nStretching helps for about 20 minutes. Massage helps for a day. The tension comes back because the command to tense up is still active at the brainstem level.\n\nIf you want to see which state is driving the pattern, the nervous system check-in will show you. Three minutes, seven questions.\n\n${btn}\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    3: { subject: 'One thing you can try today', body: `Hi,\n\nHere's a simple regulation exercise. It works regardless of which nervous system state you're in, because it targets the vagus nerve directly.\n\nSit somewhere comfortable. Put one hand on your chest and one on your stomach. Breathe in through your nose for 4 counts. Breathe out through your mouth for 6 counts. The exhale being longer than the inhale is what matters. Do this for 2 minutes.\n\nWhat you'll probably notice: your shoulders drop, your jaw loosens, your stomach unclenches slightly. Some people feel a wave of tiredness. That's normal. That's your system shifting out of alert mode.\n\nThe Stress Check has 120 exercises like this, each matched to a specific nervous system state. When you know your specific state, the exercises get more precise and they work faster.\n\n${btn}\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    4: { subject: 'What your body is actually telling you', body: `Hi,\n\n${zoneBlock}\n\nThe body map gave you the geography. The Stress Check gives you the mechanism. Together they tell you exactly what's happening and what to do about it.\n\n${btn}\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    5: { subject: 'Last one from me', body: `Hi,\n\nThis is the last email in this series.\n\nYour body map showed a clear pattern. The tension you mapped isn't random. It's your nervous system running a program that was written a long time ago, probably before you had any say in the matter.\n\nIf you want to understand the program, the Stress Check will show you. Three minutes. No sign-up required. Your results are private.\n\n${btn}\n\nIf you've already taken it, or if this isn't the right time, no pressure at all. You know where to find it when you're ready.\n\nTake care of yourself,\nDr. Tatiana D'Angeli` }
  };
  return templates[num] || null;
}

function getSeriesBBody(num, data) {
  const state = data.ns_state || 'sympathetic';
  const stateTexts = {
    sympathetic: { name: 'sympathetic activation', b1: "Your system has been running in alert mode for a while, probably longer than you realize. The 2-4 AM wake-ups, the jaw clenching, the feeling that you can't fully exhale. Your brainstem is keeping you in fight-or-flight when there's nothing to fight. Cortisol peaks between 2 and 4 AM in this pattern.", b2: "When your system is in sympathetic activation, your hypothalamus signals the adrenal glands to produce cortisol and adrenaline. In a healthy cycle this lasts minutes. In your pattern it lasts months or years. Sleep architecture breaks, digestion slows, your prefrontal cortex goes partially offline. You're running your entire life on emergency power.", b3: "Your system needs a downshift signal. The fastest one: the physiological sigh. Two short inhales through the nose, then one long slow exhale through the mouth. Repeat 3 times. The double inhale fully inflates the alveoli, and the long exhale activates the parasympathetic branch through the vagus nerve." },
    dorsal: { name: 'dorsal shutdown', b1: "Your system has pulled the brakes. Your brainstem decided that shutting down is safer than staying engaged. The heaviness, the fog, the way everything takes twice the effort it should. That's dorsal vagal activation. Your body is conserving energy the way it learned to when the world felt like too much.", b2: "Dorsal vagal shutdown is your oldest survival circuit. When the brainstem calculates that fighting or running won't work, it drops the system into conservation mode. Heart rate falls, blood pressure drops, metabolism slows. The flatness, the inability to feel motivated. All of that is your dorsal vagus doing exactly what it was designed to do.", b3: "Your system needs a gentle activation signal. Run cold water over the inside of your wrists for 30 seconds. The skin there is thin and the radial artery is close to the surface. The cold stimulates peripheral nerve endings and sends an alerting signal through the vagus nerve." },
    freeze: { name: 'freeze response', b1: "Your system is doing two things at once, accelerating and braking simultaneously. That's why you feel wired but stuck, anxious but unable to act. Your mind is spinning with things you need to do while your body refuses to move toward any of them.", b2: "Freeze is what happens when sympathetic activation and dorsal shutdown fire simultaneously. Cortisol and adrenaline are elevated, but your dorsal vagus is also pulling the system down. The result is a locked state where energy is high internally but can't be expressed externally.", b3: "Your system needs to complete a movement cycle. Sit comfortably and tap your knees alternately, left-right-left-right, at walking speed. Do this for 60 seconds. This is a simplified version of EMDR bilateral stimulation. The alternating sensory input helps the brainstem process the stuck activation." },
    ventral: { name: 'ventral regulation', b1: "Your system is currently regulated. You have access to your prefrontal cortex, your breathing is even, your body feels relatively settled. This is the baseline your nervous system can sustain when old patterns aren't running the show. The question is how often you stay here, and what pulls you out.", b2: "Ventral vagal regulation is the state where your social engagement system is online. Your facial muscles are relaxed, your breathing is diaphragmatic, and your prefrontal cortex has full access to executive function. The challenge is that most people don't stay here consistently. Triggers can pull your system into sympathetic or dorsal within seconds.", b3: "Your system is regulated right now. Use this moment to build a reference point. Put one hand on your chest. Notice the temperature of your palm against your body. Notice the rhythm of your breathing without changing it. Stay here for 90 seconds. You're creating a somatic marker your body can return to." }
  };
  const st = stateTexts[state] || stateTexts.sympathetic;
  const btn = '<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Continue your check-ins</a>';
  const btnPlan = '<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">See plans</a>';

  const templates = {
    1: { subject: 'Your stress check results', body: `Hi,\n\nYou completed the Stress Check. Your nervous system is currently in a state we call ${st.name}.\n\n${st.b1}\n\nThis pattern didn't start last week. Your nervous system wrote these rules years ago, in response to experiences you may not even consciously remember. The rules made sense then. They kept you safe. The problem is they're still running.\n\nOver the next few days I'll send you three short emails. One on what's happening at the neurological level. One with an exercise matched to your state. And one on what shifts when you work with this consistently.\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    2: { subject: "What's happening inside your nervous system", body: `Hi,\n\n${st.b2}\n\nTomorrow: a specific exercise matched to your state.\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    3: { subject: 'An exercise for your state', body: `Hi,\n\nHere's one exercise matched to your nervous system state. Try it once today, notice what happens.\n\n${st.b3}\n\nThe Stress Check app has 120 exercises like these, each calibrated to one of four nervous system states. A new one matched to your current state every day.\n\n${btn}\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    4: { subject: 'What changes after 2-4 weeks', body: `Hi,\n\nThe first check-in gives you a snapshot. The real information starts emerging around week 2-3, when the pattern becomes visible.\n\nThe first week, you start noticing your state. Not changing it yet. Just noticing. Week two, the awareness itself starts shifting things. You catch the jaw clench 10 seconds earlier.\n\nBy week three or four, people usually report either a specific symptom has clearly reduced, or they have a moment of clarity about where the pattern started. Sometimes both.\n\nThe tracker visualizes this. You see your nervous system states mapped across days.\n\nThree plans, starting at $9.90/month. Cancel anytime.\n\n${btnPlan}\n\nTalk soon,\nDr. Tatiana D'Angeli` },
    5: { subject: 'Your nervous system, one week later', body: `Hi,\n\nA week ago your Stress Check showed ${st.name}. If you repeated it today, it might show the same thing. That's the nature of chronic patterns.\n\nBut here's what can shift: how quickly you notice it. How early you catch it. And how much time you spend there before your system finds its way back to regulation.\n\nThree options:\n\nBasic ($9.90/mo): daily check-in, tracker, one exercise per day.\nFull ($14.90/mo): everything in Basic + self-worth patterns, relationships, finances, crisis protocols.\nAnnual ($99/year): everything in Full + sleep protocols, nutrition by state, audio practices. Works out to $8.25/mo.\n\n${btnPlan}\n\nNo auto-renewal. Cancel anytime.\n\nTake care,\nDr. Tatiana D'Angeli` }
  };
  return templates[num] || null;
}

function wrapHtml(bodyText) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#2C2825;max-width:560px;margin:0 auto;padding:24px 16px;">${bodyText.split('\n').map(l => l.trim() ? '<p style="margin:0 0 14px 0;">' + l + '</p>' : '').join('')}<hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;"><p style="font-size:11px;color:#999;">Dr. Tatiana D'Angeli, PhD · Clinical Psychologist<br><a href="https://drdangeli.com" style="color:#C9A87C;">drdangeli.com</a> · <a href="https://instagram.com/dr.dangeli.tatiana" style="color:#C9A87C;">@dr.dangeli.tatiana</a></p></body></html>`;
}

const DELAY_DAYS = [0, 2, 4, 6, 8];

// ============================================================
// MAIN HANDLER
// ============================================================
export default async function handler(req) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const RESEND_KEY = process.env.RESEND_API_KEY;

  const now = new Date();
  let sent = 0;
  let errors = 0;

  try {
    // Get leads that need emails
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/email_leads?email_number=lt.5&subscribed_at=is.null&select=*`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const leads = await res.json();

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No emails to send' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    for (const lead of leads) {
      const nextNum = (lead.email_number || 0) + 1;
      if (nextNum > 5) continue;

      // Check delay
      const createdAt = new Date(lead.created_at);
      const daysSince = (now - createdAt) / (1000 * 60 * 60 * 24);
      if (daysSince < DELAY_DAYS[nextNum - 1]) continue;

      // Prevent double-send
      if (lead.last_sent_at) {
        const hoursSince = (now - new Date(lead.last_sent_at)) / (1000 * 60 * 60);
        if (hoursSince < 20) continue;
      }

      // Get template
      const template = lead.series === 'B'
        ? getSeriesBBody(nextNum, lead)
        : getSeriesABody(nextNum, lead);
      if (!template) continue;

      const html = wrapHtml(template.body);

      // Send via Resend
      try {
        const sendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: "Dr. Tatiana D'Angeli <hello@send.drdangeli.com>",
            to: [lead.email],
            subject: template.subject,
            html: html
          })
        });

        if (sendRes.ok) {
          await fetch(
            `${SUPABASE_URL}/rest/v1/email_leads?email=eq.${encodeURIComponent(lead.email)}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                email_number: nextNum,
                last_sent_at: now.toISOString()
              })
            }
          );
          sent++;
        } else {
          errors++;
        }
      } catch (e) {
        errors++;
      }
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ sent, errors, timestamp: now.toISOString() }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
