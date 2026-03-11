import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const config = { runtime: 'edge' };

// ============================================================
// EMAIL TEMPLATES
// ============================================================

const SERIES_A = {
  1: {
    subject: 'Your body map results',
    delay_days: 0,
    body: (data) => {
      const zones = data.body_zones || [];
      let zoneBlock = '';
      const upper = zones.filter(z => ['head','jaw','shoulders','neck','throat'].includes(z));
      const middle = zones.filter(z => ['chest','solar','stomach'].includes(z));
      const lower = zones.filter(z => ['pelvis','legs'].includes(z));

      if (zones.length >= 6) {
        zoneBlock = `You selected zones across your whole body. That usually means your nervous system has been running in overdrive long enough that tension has spread beyond the original source. The body stops localizing and just locks up everywhere.`;
      } else if (upper.length >= middle.length && upper.length >= lower.length) {
        zoneBlock = `Head, jaw, shoulders. This is an activation pattern. Your brainstem is sending a "stay alert" signal to the muscles that prepare you to fight or run. The jaw alone burns through an enormous amount of energy when it's clenched all day. Most people don't notice they're doing it until the headache starts around 4 PM.`;
      } else if (middle.length >= lower.length) {
        zoneBlock = `Chest, solar plexus, stomach. These areas are packed with vagal nerve endings. When your body registers threat, real or remembered, the gut responds first. That heaviness in the chest, the knot in the stomach, the shallow breathing. Your diaphragm tightens and the whole system shifts into conservation mode.`;
      } else {
        zoneBlock = `Pelvis, legs. This pattern usually points to a freeze response. Your body is holding energy in the lower half, ready to run but unable to move. The legs feel heavy or restless, the pelvic floor holds tension you might not even be aware of.`;
      }

      return `Hi,

You just mapped where your body holds tension. Here's what that pattern usually means.

${zoneBlock}

The map shows you where. The question is why your body keeps doing this, and what state your nervous system is stuck in. That's what the full check-in answers. It takes about 3 minutes.

<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Take the free Stress Check</a>

Talk soon,
Dr. Tatiana D'Angeli`;
    }
  },
  2: {
    subject: "Why your body won't let go",
    delay_days: 2,
    body: () => `Hi,

A couple of days ago you mapped where your body holds tension. Quick question: has anything changed since then? Probably not. And that's the point.

Chronic tension doesn't come from what happened today. It comes from your nervous system replaying a pattern it learned years ago. The jaw clenches before you even register stress. The shoulders ride up to your ears during a normal Tuesday. The stomach tightens when you open your inbox.

Your body is responding to a signal that has nothing to do with the present moment. The signal is old. The response is automatic. And it will keep running until the underlying nervous system state shifts.

Stretching helps for about 20 minutes. Massage helps for a day. The tension comes back because the command to tense up is still active at the brainstem level. The muscles are doing exactly what they're told.

If you want to see which state is driving the pattern, the nervous system check-in will show you. Three minutes, seven questions.

<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Take the free Stress Check</a>

Talk soon,
Dr. Tatiana D'Angeli`
  },
  3: {
    subject: 'One thing you can try today',
    delay_days: 4,
    body: () => `Hi,

Here's a simple regulation exercise. It works regardless of which nervous system state you're in, because it targets the vagus nerve directly.

Sit somewhere comfortable. Put one hand on your chest and one on your stomach. Breathe in through your nose for 4 counts. Breathe out through your mouth for 6 counts. The exhale being longer than the inhale is what matters. Do this for 2 minutes.

What you'll probably notice: your shoulders drop, your jaw loosens, your stomach unclenches slightly. Some people feel a wave of tiredness. That's normal. That's your system shifting out of alert mode.

This isn't meditation. It's a physiological signal to your brainstem that the threat level has decreased. Your vagus nerve carries the message from your diaphragm to your brain: exhale is long, we must be safe.

The Stress Check has 120 exercises like this, each matched to a specific nervous system state. When you know your specific state, the exercises get more precise and they work faster.

<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Find your state: free Stress Check</a>

Talk soon,
Dr. Tatiana D'Angeli`
  },
  4: {
    subject: 'What your body is actually telling you',
    delay_days: 6,
    body: (data) => {
      const zones = data.body_zones || [];
      const upper = zones.filter(z => ['head','jaw','shoulders','neck','throat'].includes(z));
      const middle = zones.filter(z => ['chest','solar','stomach'].includes(z));
      const lower = zones.filter(z => ['pelvis','legs'].includes(z));
      let detail = '';

      if (zones.length >= 6) {
        detail = `When tension is everywhere, the nervous system has been dysregulated long enough that the body has stopped trying to contain it. Individual zones blur into a general state of being "on edge" or "shut down" all the time.\n\nPeople with this pattern often say "I feel everything and nothing at the same time." They've been running on stress hormones so long that exhaustion and anxiety coexist.`;
      } else if (upper.length >= middle.length && upper.length >= lower.length) {
        detail = `You marked tension in your head, jaw, and shoulders. In clinical practice, this combination almost always maps to sympathetic activation. Your system is stuck in "ready" mode. The muscles in your upper body are preparing for impact that isn't coming.\n\nPeople with this pattern often grind their teeth at night, wake up with headaches, and carry their shoulders near their ears without realizing it.`;
      } else if (middle.length >= lower.length) {
        detail = `You marked tension in your chest, solar plexus, and stomach. This area is where the vagus nerve has its densest network. When your system is in dorsal shutdown or early freeze, digestion slows, breathing gets shallow, and you feel a weight in your center that no amount of deep breathing seems to shift.\n\nPeople with this pattern often have digestive issues their doctor can't fully explain, a constant sense of low-level dread, and difficulty taking a full breath.`;
      } else {
        detail = `You marked tension in your pelvis and legs. In polyvagal terms, this maps to incomplete fight-or-flight. Your body loaded the energy to move and then didn't discharge it. The legs want to run. The pelvis locks. You're stuck between action and shutdown.\n\nPeople with this pattern often feel restless but exhausted at the same time.`;
      }

      return `Hi,

${detail}

The body map gave you the geography. The Stress Check gives you the mechanism. Together they tell you exactly what's happening and what to do about it.

<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Take the free Stress Check</a>

Talk soon,
Dr. Tatiana D'Angeli`;
    }
  },
  5: {
    subject: 'Last one from me',
    delay_days: 8,
    body: () => `Hi,

This is the last email in this series.

Your body map showed a clear pattern. The tension you mapped isn't random. It's your nervous system running a program that was written a long time ago, probably before you had any say in the matter.

The program made sense when it was created. It kept you safe. But your body is still executing it every single day, and that's where the tension, the fatigue, the fog, and the feeling of being stuck come from.

If you want to understand the program, the Stress Check will show you. Three minutes. No sign-up required. Your results are private.

<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Take the free Stress Check</a>

If you've already taken it, or if this isn't the right time, no pressure at all. You know where to find it when you're ready.

Take care of yourself,
Dr. Tatiana D'Angeli`
  }
};

const STATE_TEXTS = {
  sympathetic: {
    b1: `Your system has been running in alert mode for a while, probably longer than you realize. The 2-4 AM wake-ups, the jaw clenching, the feeling that you can't fully exhale. Your brainstem is keeping you in fight-or-flight when there's nothing to fight. Cortisol peaks between 2 and 4 AM in this pattern. That's why you wake up with your heart already racing before your feet hit the floor.`,
    b2: `When your system is in sympathetic activation, your hypothalamus signals the adrenal glands to produce cortisol and adrenaline. In a healthy cycle this lasts minutes. In your pattern it lasts months or years.\n\nThe downstream effects are specific: sleep architecture breaks (you lose deep sleep stages, cortisol wakes you between 2 and 4 AM), digestion slows (your body diverts blood from the gut to the muscles), your prefrontal cortex goes partially offline (that's the brain fog, the inability to think clearly under pressure). Your immune system starts misfiring. Inflammation becomes chronic.\n\nYou're running your entire life on emergency power. It works, until it doesn't.`,
    b3: `Your system needs a downshift signal. The fastest one available is the physiological sigh. Two short inhales through the nose (one to fill the lungs, one more to top them off), then one long slow exhale through the mouth. Repeat 3 times.\n\nThis works because the double inhale fully inflates the alveoli in your lungs, and the long exhale activates the parasympathetic branch through the vagus nerve. You'll probably feel the shoulder drop after the second cycle.`,
    name: 'sympathetic activation'
  },
  dorsal: {
    b1: `Your system has pulled the brakes. Your brainstem decided that shutting down is safer than staying engaged. The heaviness, the fog, the way everything takes twice the effort it should. That's dorsal vagal activation. Your body is conserving energy the way it learned to when the world felt like too much.`,
    b2: `Dorsal vagal shutdown is your oldest survival circuit. It's the one that evolved before fight-or-flight. When the brainstem calculates that fighting or running won't work, it drops the system into conservation mode. Heart rate falls, blood pressure drops, metabolism slows, and you feel like you're moving through water.\n\nThis isn't depression in the clinical sense, though it looks similar. It's a neurological state. Your body has decided that the safest strategy is to use as little energy as possible. The flatness, the inability to feel motivated or excited, the sense that nothing matters much. All of that is your dorsal vagus doing exactly what it was designed to do.`,
    b3: `Your system needs a gentle activation signal. Run cold water over the inside of your wrists for 30 seconds. The skin there is thin and the radial artery is close to the surface. The cold stimulates peripheral nerve endings and sends an alerting signal through the vagus nerve to the brainstem.\n\nDon't use ice. Don't make it shocking. Just cool tap water, 30 seconds. You'll likely notice a slight shift in clarity within a minute or two.`,
    name: 'dorsal shutdown'
  },
  freeze: {
    b1: `Your system is doing two things at once, accelerating and braking simultaneously. That's why you feel wired but stuck, anxious but unable to act. Your mind is spinning with things you need to do while your body refuses to move toward any of them. The neurological equivalent of flooring the gas with the handbrake on.`,
    b2: `Freeze is what happens when sympathetic activation and dorsal shutdown fire simultaneously. Your accelerator and your brake are both pressed to the floor. The subjective experience is a kind of paralyzed anxiety: you feel urgency but can't move, you want to act but your body won't cooperate.\n\nPhysiologically, cortisol and adrenaline are elevated (sympathetic), but your dorsal vagus is also pulling the system down. The result is a locked state where energy is high internally but can't be expressed externally.`,
    b3: `Your system needs to complete a movement cycle. Sit comfortably and tap your knees alternately, left-right-left-right, at a moderate pace. Like walking speed. Do this for 60 seconds while letting your eyes follow the tapping naturally.\n\nThis is a simplified version of EMDR bilateral stimulation. The alternating sensory input helps the brainstem process the stuck activation. Some people feel a release of tension in the chest or stomach. Both mean the freeze is beginning to thaw.`,
    name: 'freeze response'
  },
  ventral: {
    b1: `Your system is currently regulated. You have access to your prefrontal cortex, your breathing is even, your body feels relatively settled. This is the baseline your nervous system can sustain when old patterns aren't running the show. The question is how often you stay here, and what pulls you out.`,
    b2: `Ventral vagal regulation is the state where your social engagement system is online. Your facial muscles are relaxed, your voice has natural prosody, your breathing is diaphragmatic, and your prefrontal cortex has full access to executive function.\n\nThe challenge is that most people don't stay here consistently. Triggers, both external and internal, can pull your system into sympathetic or dorsal within seconds. The brainstem doesn't consult your rational mind before switching. The work is building enough vagal tone that your system returns to ventral faster after activation, and stays there longer.`,
    b3: `Your system is regulated right now. Use this moment to build a reference point. Put one hand on your chest. Notice the temperature of your palm against your body. Notice the rhythm of your breathing without changing it. Stay here for 90 seconds.\n\nWhat you're doing is creating a somatic marker. Your body is storing this particular combination of posture, breath, and sensation as "safe." The more you practice anchoring when you're already regulated, the easier it becomes to find this state when you're not.`,
    name: 'ventral regulation'
  }
};

const SERIES_B = {
  1: {
    subject: 'Your stress check results',
    delay_days: 0,
    body: (data) => {
      const state = data.ns_state || 'sympathetic';
      const st = STATE_TEXTS[state] || STATE_TEXTS.sympathetic;
      return `Hi,

You completed the Stress Check. Your nervous system is currently in a state we call ${st.name}.

Here's what that means in practice.

${st.b1}

This pattern didn't start last week. Your nervous system wrote these rules years ago, in response to experiences you may not even consciously remember. The rules made sense then. They kept you safe. The problem is they're still running.

Over the next few days I'll send you three short emails. One on what's happening at the neurological level. One with an exercise matched to your state. And one on what shifts when you work with this consistently.

Talk soon,
Dr. Tatiana D'Angeli`;
    }
  },
  2: {
    subject: "What's happening inside your nervous system",
    delay_days: 2,
    body: (data) => {
      const state = data.ns_state || 'sympathetic';
      const st = STATE_TEXTS[state] || STATE_TEXTS.sympathetic;
      return `Hi,

${st.b2}

Tomorrow: a specific exercise matched to your state.

Talk soon,
Dr. Tatiana D'Angeli`;
    }
  },
  3: {
    subject: 'An exercise for your state',
    delay_days: 4,
    body: (data) => {
      const state = data.ns_state || 'sympathetic';
      const st = STATE_TEXTS[state] || STATE_TEXTS.sympathetic;
      return `Hi,

Here's one exercise matched to your nervous system state. Try it once today, notice what happens.

${st.b3}

The Stress Check app has 120 exercises like these, each calibrated to one of four nervous system states. A new one matched to your current state every day.

<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Continue your check-ins</a>

Talk soon,
Dr. Tatiana D'Angeli`;
    }
  },
  4: {
    subject: 'What changes after 2-4 weeks',
    delay_days: 6,
    body: () => `Hi,

The first check-in gives you a snapshot. A single data point. The real information starts emerging around week 2-3, when the pattern becomes visible.

Here's what typically happens. The first week, you start noticing your state. Not changing it yet. Just noticing. You realize that the tension in your chest shows up before the meeting, not during it. That the fog hits at 3 PM every day. That your worst nights follow days when you said yes to something you wanted to say no to.

Week two, the awareness itself starts shifting things. You catch the jaw clench 10 seconds earlier. You take the longer exhale before the cortisol spike hits full force. Small margins, but your nervous system registers them.

By week three or four, people usually report one of two things: either a specific symptom has clearly reduced (the 3 AM wake-ups go from five nights a week to two, the stomach knot loosens, the fog lifts earlier in the day), or they have a moment of clarity about where the pattern started. Sometimes both.

The tracker in the app visualizes this. You see your nervous system states mapped across days, and the color pattern tells you more than any single check-in can.

Three plans, starting at $9.90/month. Cancel anytime.

<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">See plans</a>

Talk soon,
Dr. Tatiana D'Angeli`
  },
  5: {
    subject: 'Your nervous system, one week later',
    delay_days: 8,
    body: (data) => {
      const state = data.ns_state || 'sympathetic';
      const st = STATE_TEXTS[state] || STATE_TEXTS.sympathetic;
      return `Hi,

A week ago your Stress Check showed ${st.name}. If you repeated it today, it might show the same thing. That's the nature of chronic patterns. They don't shift in a week.

But here's what can shift: how quickly you notice it. How early you catch it. And how much time you spend there before your system finds its way back to regulation.

That's what daily check-ins do. Three minutes in the morning. An exercise matched to your current state. A tracker that shows you the shape of your nervous system over time.

Three options:

Basic ($9.90/mo): daily check-in, tracker, one exercise per day.
Full ($14.90/mo): everything in Basic + self-worth patterns, relationships, finances, crisis protocols.
Annual ($99/year): everything in Full + sleep protocols, nutrition by state, audio practices, monthly report. Works out to $8.25/mo.

<a href="https://drdangeli.com" style="display:inline-block;padding:14px 28px;background:#C9A87C;color:#0C0B0F;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Choose your plan</a>

No auto-renewal. Cancel anytime. If it's not the right time, that's completely fine. The free check-in is always there.

Take care,
Dr. Tatiana D'Angeli`;
    }
  }
};

// ============================================================
// HTML WRAPPER
// ============================================================
function wrapHtml(bodyText) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#2C2825;max-width:560px;margin:0 auto;padding:24px 16px;">
${bodyText.split('\n').map(line => line.trim() ? `<p style="margin:0 0 14px 0;">${line}</p>` : '').join('\n')}
<hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;">
<p style="font-size:11px;color:#999;line-height:1.5;">Dr. Tatiana D'Angeli, PhD · Clinical Psychologist<br>
<a href="https://drdangeli.com" style="color:#C9A87C;">drdangeli.com</a> · <a href="https://instagram.com/dr.dangeli.tatiana" style="color:#C9A87C;">@dr.dangeli.tatiana</a></p>
</body></html>`;
}

// ============================================================
// MAIN HANDLER
// ============================================================
export default async function handler(req) {
  // Verify this is called by Vercel Cron (or allow manual trigger)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && req.method !== 'GET') {
    return new Response('Unauthorized', { status: 401 });
  }

  const now = new Date();
  let sent = 0;
  let errors = 0;

  try {
    // Get all leads that need emails
    const { data: leads, error } = await supabase
      .from('email_leads')
      .select('*')
      .lt('email_number', 5)
      .is('subscribed_at', null); // Don't email people who already subscribed

    if (error) throw error;
    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No emails to send' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    for (const lead of leads) {
      const nextNum = (lead.email_number || 0) + 1;
      const series = lead.series === 'B' ? SERIES_B : SERIES_A;
      const template = series[nextNum];
      if (!template) continue;

      // Check if enough days have passed
      const createdAt = new Date(lead.created_at);
      const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < template.delay_days) continue;

      // Check if we already sent this number (prevent double-send)
      const lastSentAt = lead.last_sent_at ? new Date(lead.last_sent_at) : null;
      if (lastSentAt) {
        const hoursSinceLastSend = (now - lastSentAt) / (1000 * 60 * 60);
        if (hoursSinceLastSend < 20) continue; // At least 20 hours between emails
      }

      // Generate email body
      const bodyText = typeof template.body === 'function' ? template.body(lead) : template.body;
      const html = wrapHtml(bodyText);

      // Send via Resend
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Dr. Tatiana D\'Angeli <hello@send.drdangeli.com>',
            to: [lead.email],
            subject: template.subject,
            html: html
          })
        });

        if (res.ok) {
          // Update lead record
          await supabase.from('email_leads').update({
            email_number: nextNum,
            last_sent_at: now.toISOString()
          }).eq('email', lead.email);
          sent++;
        } else {
          const errBody = await res.text();
          console.error(`Resend error for ${lead.email}:`, errBody);
          errors++;
        }
      } catch (e) {
        console.error(`Send failed for ${lead.email}:`, e);
        errors++;
      }
    }
  } catch (e) {
    console.error('Cron error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ sent, errors, timestamp: now.toISOString() }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
