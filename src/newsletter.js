// Signup owns capture + consent + a durable at-most-once welcome claim.
// Port of the live gate's consent/claim contract into the reviewed source tree.
import { sendSignupWelcome } from './email.js';
import { mailConfigured } from './mail-transport.js';
import { notifyIntake } from './intake.js';
export const PUBLICATION = 'pub_fb930d38-568a-4d98-b9d2-5f403d117a00';
const LEGACY = 'pub_d1bfe66c-074f-464a-a94a-d0cce6d21943';
const fail = { ok: false, status: 502, error: 'Sign-up is temporarily unavailable. Please try again soon.' };
const suppressed = { ok: false, status: 409, error: 'Your existing subscription preferences were preserved. Please manage your subscription in the newsletter.' };
const acceptedStates = ['active', 'pending', 'validating'];
export function beehiivCustomFields({name, beta} = {}) {
  const fields=[];
  if (typeof name === 'string' && name.trim()) fields.push({name:'First Name',value:name.trim().slice(0,60)});
  if (beta === true) fields.push({name:'Beta Tester',value:'true'});
  return fields;
}
export async function safeNewsletterSubscribe(env, input, campaign, extra = {}) {
  const db = env.INTAKE;
  if (!db || !env.BEEHIIV_API_KEY || env.BEEHIIV_PUBLICATION_ID !== PUBLICATION) return { ...fail, status: 503 };
  const email = input.trim().toLowerCase();
  const name = typeof extra.name === 'string' ? extra.name.trim().slice(0, 60) : '';
  const beta = extra.beta === true;
  const headers = { Authorization: `Bearer ${env.BEEHIIV_API_KEY}`, 'Content-Type': 'application/json' };
  const root = `https://api.beehiiv.com/v2/publications/${PUBLICATION}/subscriptions`;
  async function lookup(pub) {
    const r = await fetch(`https://api.beehiiv.com/v2/publications/${pub}/subscriptions/by_email/${encodeURIComponent(email)}?expand[]=newsletter_lists`, { headers, signal: AbortSignal.timeout(10000) });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('Subscription lookup failed');
    const sub = (await r.json()).data;
    if (!sub?.id || typeof sub.status !== 'string') throw new Error('Invalid subscription lookup response');
    return sub;
  }
  let key;
  try {
    const old = await lookup(PUBLICATION);
    // Existing consent is authoritative. Never reactivate or resend on repeat.
    if (old) return acceptedStates.includes(old.status) ? { ok: true, existing: true } : suppressed;
    const candidate = await lookup(LEGACY);
    const legacy = candidate?.utm_source === 'asnm-prelaunch' ? candidate : null;
    if (legacy && legacy.status !== 'active') return suppressed;
    key = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(PUBLICATION + '\n' + email))), x => x.toString(16).padStart(2, '0')).join('');
    const intakeId = 'newsletter:' + key;
    const now = new Date().toISOString();
    // Both inserts are one D1 transaction. A repeat/concurrent request cannot
    // rewrite captured answers or manufacture a second house notification.
    await db.batch([
      db.prepare("INSERT OR IGNORE INTO newsletter_delivery_claims (claim_key,publication_id,state) VALUES (?,?,'pending')").bind(key, PUBLICATION),
      db.prepare(`INSERT OR IGNORE INTO intake (id,received_at,site,kind,name,email,summary,payload,source,is_canary) VALUES (?,?,'adaptivesportsnearme.com','newsletter',?,?,?,?,?,0)`)
        .bind(intakeId, now, name || null, email, 'ASNM newsletter signup', JSON.stringify({ name, beta }), campaign || 'asnm-prelaunch'),
      db.prepare("INSERT OR IGNORE INTO intake_delivery_claims (intake_id,state) VALUES (?,'pending')").bind(intakeId),
    ]);
    const claim = await db.prepare("UPDATE newsletter_delivery_claims SET state='creating' WHERE claim_key=? AND state='pending' RETURNING claim_key").bind(key).first();
    if (!claim) return { ...fail, status: 409, error: 'This signup is already being processed. Please try again later.' };
    const custom_fields = beehiivCustomFields({name,beta});
    const res = await fetch(root, {
      method: 'POST', headers, signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ email, reactivate_existing: false, send_welcome_email: false,
        automation_ids: [], newsletter_list_ids: [], skip_newsletter_list_auto_subscribe: true,
        double_opt_override: 'not_set', utm_source: 'asnm-prelaunch', utm_medium: 'website',
        utm_campaign: campaign, referring_site: 'adaptivesportsnearme.com', custom_fields }),
    });
    if (!res.ok) throw new Error('Subscription creation rejected');
    const sub = (await res.json()).data;
    if (!sub?.id || typeof sub.status !== 'string') throw new Error('Invalid creation response');
    const state = legacy ? 'legacy-no-welcome' : extra.noWelcome ? 'no-welcome-requested' : 'awaiting-validation';
    await db.prepare('UPDATE newsletter_delivery_claims SET subscription_id=?,state=? WHERE claim_key=?').bind(sub.id, state, key).run();
    const welcomeJob = (async () => {
      if (legacy || extra.noWelcome) return;
      try {
        let current;
        for (const delay of [0, 1000, 2000, 4000, 8000]) {
          if (delay) await new Promise(r => setTimeout(r, delay));
          current = await lookup(PUBLICATION);
          if (current?.status !== 'validating') break;
        }
        if (!current || current.id !== sub.id || current.status !== 'active') {
          await db.prepare("UPDATE newsletter_delivery_claims SET state='not-active-no-welcome' WHERE claim_key=? AND state='awaiting-validation'").bind(key).run();
          return;
        }
        if (!mailConfigured(env)) {
          await db.prepare("UPDATE newsletter_delivery_claims SET state='waiting-for-mail' WHERE claim_key=? AND state='awaiting-validation'").bind(key).run();
          return;
        }
        const sendClaim = await db.prepare("UPDATE newsletter_delivery_claims SET state='sending' WHERE claim_key=? AND state='awaiting-validation' RETURNING claim_key").bind(key).first();
        if (!sendClaim) return;
        const receipt = await sendSignupWelcome(env, email, { name, beta });
        const messageId = receipt?.messageId || receipt?.id;
        if (!messageId) throw new Error('No provider acceptance ID');
        await db.batch([
          db.prepare('INSERT INTO newsletter_send_receipts (claim_key,provider,provider_message_id,accepted_at) VALUES (?,?,?,?)').bind(key, receipt.provider || 'cloudflare', messageId, new Date().toISOString()),
          db.prepare("UPDATE newsletter_delivery_claims SET state='sent' WHERE claim_key=? AND state='sending'").bind(key),
        ]);
      } catch {
        await db.prepare("UPDATE newsletter_delivery_claims SET state='needs-review' WHERE claim_key=?").bind(key).run();
        console.error('Newsletter welcome needs review', key);
      }
    })();
    // Neither correspondence path holds the other. Capture already committed.
    const background = Promise.allSettled([welcomeJob, notifyIntake(env, intakeId)]);
    return { ok: true, existing: !!legacy, welcomeJob: background };
  } catch {
    if (key) {
      try { await db.prepare("UPDATE newsletter_delivery_claims SET state='needs-review' WHERE claim_key=? AND state='creating'").bind(key).run(); } catch { /* creating remains visible */ }
    }
    console.error('Newsletter signup failed closed');
    return fail;
  }
}
