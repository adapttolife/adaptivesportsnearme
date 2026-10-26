// The one-minute check-up (docs/specs/community-kept-directory.md, phase 1), in the browser:
// "Here's what families see" and its three answers, the reasons for "Something's wrong?",
// what each one posts, the facts strip and the one freshness line on a listing page, and what
// the admin queue says each item would change. The real app (public/app/app.js) runs here on a
// do-nothing page, the same harness as test/yearly-pages.test.js.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const file = (p) => new URL(p, ROOT);

/* ---------- a page that accepts anything and draws nothing ---------- */
function any() {
  const f = function () {};
  return new Proxy(f, {
    get(t, k) {
      if (k === Symbol.toPrimitive) return () => "";
      if (k === "then") return undefined;
      if (k === Symbol.iterator) return function* () {};
      if (k === "length") return 0;
      return any();
    },
    apply: () => any(), construct: () => any(), set: () => true,
  });
}
const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };
const doc = any();
const g = globalThis;
g.window = g;
g.addEventListener = () => {};
g.document = new Proxy({}, {
  get(t, k) {
    if (k === "createElement") return () => new Proxy({ firstChild: null }, { get: (o, j) => (j in o ? o[j] : any()), set: () => true });
    if (k === "querySelectorAll") return () => [];
    return doc[k];
  },
});
g.location = { pathname: "/__test", search: "", hash: "", href: "https://adaptivesportsnearme.com/__test", origin: "https://adaptivesportsnearme.com" };
g.history = any();
g.localStorage = mem();
g.sessionStorage = mem();
g.matchMedia = () => ({ matches: true, addEventListener() {} });
g.requestAnimationFrame = () => 0;
g.scrollTo = () => {};
g.scrollY = 0;
g.CSS = { escape: (s) => s };

const reply = (body, status = 200) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
const ORG = "9c6141d8-5d5d-472d-a0ca-a0a1de7651f6";
const CLUB = "11111111-2222-4333-8444-555555555555";
const LISTINGS = {
  items: [
    { id: ORG, name: "Maine Adaptive", key: "multi", trio: ["skiing", "sailing"], city: "Newry", state: "ME", checked: "2026-10-12", who: ["kids", "adults", "physical"],
      seasons: [{ key: "skiing", seasons: ["winter"] }, { key: "sailing", seasons: ["summer"] }] },
    { id: CLUB, name: "River City Tennis", key: "tennis", city: "Louisville", state: "KY", prog: false, seasons: [{ key: "tennis", seasons: ["summer"] }] },
  ],
};
let ROUTE = () => null;
g.fetch = (u) => {
  const hit = ROUTE(String(u));
  if (hit) return hit;
  if (u === "/api/listings") return reply(LISTINGS);
  if (u === `/api/organizations/${ORG}`) return reply({ organization: { id: ORG, name: "Maine Adaptive", website: "https://www.maineadaptive.org/", cost: "Free for athletes", ages: "5 and up" } });
  if (u === `/api/event-series?org=${ORG}`) return reply({ ok: true, items: [{ id: "s1", slug: "ski-fest", name: "Ski Fest", usual_month: 2, editions: [] }] });
  if (u === "/data/states.json") return reply(JSON.parse(readFileSync(file("public/data/states.json"), "utf8")));
  if (u === "/data/sports.json") return reply(JSON.parse(readFileSync(file("public/data/sports.json"), "utf8")));
  return reply({ items: [] });
};

await import(file("public/listing-art.js"));
await import(file("public/app/core.js"));
const A = await import(file("public/app/app.js"));
const SC = await import(file("public/app/sport-checklist.js"));
const F = await import(file("public/app/listing-facts.js"));
const forms = await import(file("public/app/views/forms.js"));
const admin = await import(file("public/app/views/admin.js"));
const programDetail = await import(file("public/app/views/program-detail.js"));
const D = await A.loadData();

const DASH = /[\u2013\u2014]/;
const text = (html) => html.replace(/<[^>]+>/g, (tag) => (/^<\/?(span|b|a|svg|path|small)\b/.test(tag) ? "" : " ")).replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
const between = (s, a, b) => { const i = s.indexOf(a); assert.ok(i >= 0, a); return s.slice(i, s.indexOf(b, i + a.length)); };
const step = (h, name) => between(h, `data-step="${name}"`, "</section>");
const update = (id, query = {}) => forms.render({ path: `/update/${id}`, params: { id }, query, data: D });

test("the check-up's first screen shows what families see and the three answers", async () => {
  const out = await update(ORG, { rel: "run" });
  const first = step(out.html, "summary");
  assert.match(out.html, /<section class="ck-step" data-step="summary" aria-labelledby="ck-summary-h">/, "it's the screen that shows");
  assert.match(out.html, /<section class="ck-step" data-step="website" hidden/, "the rest wait their turn");
  const t = text(first);
  assert.match(t, /Here's what families see/);
  assert.match(t, /Maine Adaptive/);
  assert.match(t, /Website maineadaptive\.org/, "the host only");
  assert.match(t, /Where Newry, ME/);
  assert.match(first, /<dd><span class="ck-line">Skiing · Winter<\/span><span class="ck-line">Sailing · Summer<\/span><\/dd>/);
  assert.match(t, /Who it's for Kids and teens, Adults, Physical disabilities · Ages: 5 and up/);
  assert.match(t, /Cost Free for athletes/);
  assert.match(t, /Yearly events Ski Fest, usually in February/);
  assert.match(first, /<button type="button" class="btn btn--ink ck-big" data-verdict="all_right">[\s\S]*?<span>Yes, it's all still right<\/span>/);
  assert.match(first, /class="btn btn--line ck-big" data-verdict="changed"><span>Something changed<\/span>/);
  assert.match(first, /class="btn btn--text ck-stop" data-verdict="stopped"><span>We don't run this anymore<\/span>/);
  // The heading takes focus on every step, and says the step.
  assert.match(first, /<h2 class="ck-h" id="ck-summary-h" tabindex="-1"><span class="ck-count" data-count><\/span>/);
  // One question per screen: every fact has its own screen, in order, each Still right / Change it.
  const order = [...out.html.matchAll(/data-step="([a-z-]+)"/g)].map((m) => m[1]);
  assert.deepEqual(order, ["summary", "website", "place", "sports", "who", "cost", "yearly", "stopped", "send", "fix", "fix-send"]);
  for (const k of forms.FACTS) assert.match(step(out.html, k), /data-fact="right"><span>Still right<\/span>[\s\S]*data-fact="change" aria-expanded="false"/);
  assert.match(out.html, /<input type="hidden" name="rel" value="run">/);
  assert.match(out.html, /<input type="hidden" name="pn" value="Maine Adaptive">/);
  assert.match(out.html, /name="company" tabindex="-1"/, "the honeypot");
  assert.match(out.html, /data-send="\/api\/submit-program" data-source="asnm-checkup"/);
  assert.match(out.html, /<div class="ts-box"><\/div>/, "the spam check has its place from the start");
  assert.ok(!DASH.test(text(out.html)), "no dashes");
});

test("rel=run never asks how they know it; no rel asks first; attend and ?fix=1 start at the reasons", async () => {
  const run = (await update(ORG, { rel: "run" })).html;
  assert.doesNotMatch(run, /How do you know this organization/);
  assert.match(run, /<h1 tabindex="-1">Confirm your listing<\/h1>/);
  const ask = (await update(ORG)).html;
  assert.match(step(ask, "who-asks"), /How do you know this organization\?/);
  assert.match(step(ask, "who-asks"), /data-rel="run"><span>I&#39;m with this organization<\/span>/);
  assert.match(ask, /data-step="summary" hidden/, "the check-up waits for I'm with this organization");
  for (const q of [{ rel: "attend" }, { fix: "1" }]) {
    const fix = (await update(ORG, q)).html;
    assert.match(fix, /<section class="ck-step" data-step="fix" aria-labelledby/);
    assert.doesNotMatch(fix, /How do you know/);
    assert.match(fix, /<h1 tabindex="-1">Something&#39;s wrong\?<\/h1>/);
  }
});

test("the sports screen: each sport with its seasons already set, and Add a sport searches as you type", async () => {
  const sports = step((await update(ORG, { rel: "run" })).html, "sports");
  assert.match(sports, /<fieldset class="sck-row ck-pick" data-row="skiing"><legend>Skiing<\/legend><input type="checkbox" data-sport="skiing" checked hidden><button type="button" class="ck-x" data-remove="skiing" aria-label="Remove Skiing">/);
  assert.match(sports, /data-of="skiing" data-season="winter" checked/);
  assert.doesNotMatch(sports, /data-of="skiing" data-season="summer" checked/);
  assert.match(sports, /<label for="(ckq\d+)">Add a sport<\/label>[\s\S]*id="\1" type="search" data-sport-search/);
  assert.doesNotMatch(sports, /\sname="/, "nothing on the screen posts on its own");
  const keys = D.sports.map((s) => s.key);
  const ski = SC.matchSports(keys, "ski", { nameOf: A.sportName });
  assert.equal(ski[0], "skiing");
  assert.ok(ski.includes("waterskiing") || ski.includes("nordicskiing"), ski.join());
  assert.ok(!SC.matchSports(keys, "ski", { nameOf: A.sportName, chosen: ["skiing"] }).includes("skiing"), "a sport already there isn't offered again");
  assert.deepEqual(SC.matchSports(keys, "", { nameOf: A.sportName }), []);
});

test("what the check-up posts: all still right, changed (website and sports), and stopped", () => {
  assert.deepEqual(forms.checkupPayload({ verdict: "all_right", facts: { website: { status: "right" } } }), { checkup: '{"verdict":"all_right","facts":{}}' });
  const changed = forms.checkupPayload({
    verdict: "changed",
    facts: { website: { status: "change", value: "https://maineadaptive.org/new" }, place: { status: "right" }, sports: { status: "change" }, cost: { status: "change", value: "fee", note: "" } },
    sports: [{ key: "skiing", seasons: ["winter"] }, { key: "pickleball", seasons: ["summer", "fall"] }],
    yearly: [{ name: "Ski Fest", month: 2, url: null }],
  });
  assert.deepEqual(JSON.parse(changed.checkup), { verdict: "changed", facts: { website: { status: "change", value: "https://maineadaptive.org/new" }, place: { status: "right" }, sports: { status: "change" }, cost: { status: "change", value: "fee" } } });
  assert.equal(changed.sports, '{"skiing":["winter"],"pickleball":["summer","fall"]}');
  assert.equal(changed.yearly, undefined, "yearly events weren't changed, so they don't post");
  const who = JSON.parse(forms.checkupPayload({ verdict: "changed", facts: { who: { status: "change", value: ["kids", "physical"] }, yearly: { status: "change" } }, yearly: [{ name: "Ski Fest", month: 2, url: null }] }).checkup);
  assert.deepEqual(who.facts, { who: { status: "change", value: ["kids", "physical"] }, yearly: { status: "change" } });
  // Sports that weren't changed don't post, even with the screen read.
  assert.equal(forms.checkupPayload({ verdict: "changed", facts: { sports: { status: "right" } }, sports: [{ key: "skiing", seasons: [] }] }).sports, undefined);
  assert.deepEqual(JSON.parse(forms.checkupPayload({ verdict: "stopped", stopped: { reason: "closed_for_good" }, facts: { website: { status: "right" } } }).checkup), { verdict: "stopped", facts: {}, stopped: { reason: "closed_for_good" } });
  assert.deepEqual(forms.STOP_REASONS.map(([v]) => v), ["closed_for_now", "closed_for_good", "merged", "moved"]);
  const done = forms.finishText("checkup", { verdict: "all_right", now: new Date(2026, 9, 26) });
  assert.equal(done, "Thanks. A person on our team checks it, usually within a week. Families will then see: Confirmed by the organization · October 2026.");
  assert.match(forms.finishText("checkup", { verdict: "stopped" }), /hides the listing\. Nothing is deleted/);
});

test("Something's wrong?: one tap for the reason, a note only for Something else, the email optional", async () => {
  const h = (await update(CLUB, { rel: "other" })).html;
  const reasons = [...step(h, "fix").matchAll(/data-reason="([a-z_]+)"><span>([^<]+)<\/span>/g)].map((m) => [m[1], m[2].replace(/&#39;/g, "'")]);
  assert.deepEqual(reasons, [["website", "Website moved or broken"], ["closed_for_now", "Closed for now"], ["closed_for_good", "Closed for good"], ["place", "Wrong place"], ["sport", "Wrong sport"], ["duplicate", "Listed twice"], ["other", "Something else"]]);
  const send = step(h, "fix-send");
  assert.match(send, /Your email \(optional\)/);
  assert.match(text(send), /Only if you'd like to hear back\. Never shown\./);
  assert.doesNotMatch(between(send, "<textarea", ">"), /required/, "a note is needed only for Something else (mount() asks then)");
  assert.deepEqual(forms.fixPayload({ reason: "website", rel: "attend" }), { reason: "website", rel: "attend" });
  assert.deepEqual(forms.fixPayload({ reason: "duplicate" }), { reason: "duplicate" });
  assert.deepEqual(forms.fixPayload({ reason: "nonsense", rel: "x" }), { reason: "other" });
  assert.match(forms.finishText("fix", { email: true }), /We'll write to tell you what we did\./);
});

test("the facts strip: when it runs, and Off season isn't closed", () => {
  const nov = new Date(2026, 10, 10), jan = new Date(2027, 0, 10), jul = new Date(2026, 6, 4);
  const summer = { seasons: [{ key: "sailing", seasons: ["summer"] }], cost: "Free", who: ["physical", "kids", "veterans", "blind"], equipment: "Provided" };
  assert.equal(F.seasonOf(nov), "fall");
  assert.equal(F.seasonOf(jan), "winter");
  assert.equal(F.whenText(summer, jul), "Summer");
  assert.equal(F.whenText(summer, nov), "Off season · back in summer");
  assert.equal(F.whenText({ seasons: [{ key: "skiing", seasons: ["winter"] }, { key: "sailing", seasons: ["summer"] }] }, nov), "Off season · back in winter", "the next one round");
  assert.equal(F.whenText({ seasons: [{ key: "tennis", seasons: ["year-round"] }] }, nov), "Year-round");
  assert.equal(F.whenText({ seasons: [{ key: "golf", seasons: [] }] }, nov), "");
  const strip = F.factsStrip(summer, nov);
  assert.equal(text(strip), "When Off season · back in summer Cost Free Who it's for Veterans, Kids and teens, Blind or low vision Equipment Provided");
  assert.match(strip, /<div class="is-off"><dt>When<\/dt>/);
  assert.equal(F.factsStrip({ seasons: null, who: [] }, nov), "", "nothing to say, no strip");
  assert.equal(F.equipmentText("Bring your own"), "Bring your own");
});

test("one freshness line: confirmed by the organization, else the website check, else when it was listed", () => {
  assert.equal(F.freshness({ history: { updatedByOrganization: "2026-10" }, lastChecked: "2026-10-12", listedAt: "2025-03-01" }), "Confirmed by the organization · Oct 2026");
  assert.equal(F.freshness({ history: { updatedByOrganization: null }, lastChecked: "2026-10-12T08:00:00Z", listedAt: "2025-03-01" }), "Checked Oct 12");
  assert.equal(F.freshness({ listedAt: "2026-10-03" }), "Listed Oct 3");
  assert.equal(F.freshness({}), "");
});

test("a program page leads with the facts, and Something's wrong? sits beside Visit website", async () => {
  ROUTE = (u) => (u === "/api/programs/p9" ? reply({ program: { id: "p9", name: "Summer sailing", sport: "sailing", sportLabel: "Sailing", city: "Portland", state: "ME", website: "https://example.org/sail", cost: "$20", seasons: [{ key: "sailing", seasons: ["summer"] }], lastChecked: "2026-10-12", kind: "program" } }) : null);
  const page = await programDetail.render({ params: { id: "p9" }, now: new Date(2026, 10, 10) });
  const h = page.html;
  assert.match(h, /<div class="pg-act-row"><a class="btn btn--ink pg-full" href="https:\/\/example\.org\/sail"[\s\S]*?<a class="btn btn--line pg-wrong" href="\/update\/p9\?fix=1" ><span>Something&#39;s wrong\?<\/span><\/a><\/div>/);
  assert.ok(h.indexOf("pg-strip") < h.indexOf("About this program"), "the facts come before the description");
  assert.match(text(h), /When Off season · back in summer Cost \$20/);
  assert.match(text(h), /Checked Oct 12/);
  assert.doesNotMatch(h, /Suggest a fix/);
  ROUTE = () => null;
});

test("the admin queue says plainly what each item would change", () => {
  const org = { id: ORG, name: "Maine Adaptive", city: "Newry", state: "ME", website: "https://maineadaptive.org", cost: null };
  const lines = (payload, extra = {}) => admin.changeLines({ kind: "listing_update", payload: { relation: "run", update_of: ORG, ...payload }, organization: org, ...extra });
  assert.deepEqual(lines({ checkup: { verdict: "all_right", facts: {} } }), ["Confirms everything is still right"]);
  assert.deepEqual(lines({ checkup: { verdict: "changed", facts: { website: { status: "change", value: "https://maineadaptive.org/ski" }, place: { status: "right" }, sports: { status: "change" } } }, sports: { skiing: ["winter"], pickleball: ["summer", "fall"] } }),
    ["Website: maineadaptive.org → maineadaptive.org/ski", "Sports and seasons: Skiing (winter), Pickleball (summer and fall)", "Nothing else changed."]);
  // With the sports it has now, it says what's added and what's gone.
  assert.deepEqual(lines({ checkup: { verdict: "changed", facts: { sports: { status: "change" } } }, sports: { skiing: ["winter", "spring"], pickleball: ["summer"] } }, { organization: { ...org, sports: [{ key: "skiing", seasons: ["winter"] }, { key: "sailing", seasons: ["summer"] }] } }),
    ["Skiing: spring and winter", "Adds Pickleball (summer)", "Removes Sailing", "Nothing else changed."]);
  assert.deepEqual(lines({ checkup: { verdict: "stopped", facts: {}, stopped: { reason: "closed_for_good" } } }), ["Stopped: closed for good, hides the listing"]);
  assert.deepEqual(lines({ checkup: { verdict: "changed", facts: { cost: { status: "change", value: "free", note: "Donations welcome" }, who: { status: "change", value: ["kids", "physical"] } } } }),
    ["Who it's for: Kids and teens, Physical disabilities", "Cost: none → Free (Donations welcome)", "Nothing else changed."]);
  assert.deepEqual(admin.changeLines({ kind: "listing_update", payload: { relation: "attend", reason: "website", notes: "It moved" } }), ["Reported: website moved or broken"]);
  // The older confirm form (no check-up) still reads.
  assert.deepEqual(lines({ sports: { skiing: ["winter"] }, yearly: [{ name: "Ski Fest", month: 2 }] }), ["Sports and seasons: Skiing (winter)", "Adds yearly event Ski Fest (usually February)"]);
  for (const l of lines({ checkup: { verdict: "changed", facts: { website: { status: "change", value: "https://a.org" } } } })) assert.ok(!DASH.test(l), l);
});
