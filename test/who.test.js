import test from "node:test";
import assert from "node:assert/strict";
import {
  whoTags,
  whoText,
  whoCode,
  whoSay,
  whoChips,
  whoLine,
  isWho,
  WHO_ORDER,
  WHO_LABELS,
} from "../public/app/who.js";

// Served text from live listings (adaptivesportsnearme.com/api/organizations/:id, 2026-10-21).
const REAL = [
  [
    "Children and adults with physical, cognitive, visual and hearing disabilities, and veterans.",
    ["veterans", "kids", "adults", "blind", "deaf", "intellectual", "physical"],
  ],
  ["People of all ages who are blind or have low vision", ["blind"]],
  ["Youth and adults with autism", ["kids", "adults", "autism"]],
  [
    "Disabled veterans, people who are blind or have low vision, and people with other disabilities.",
    ["veterans", "blind"],
  ],
  [
    "People who are deaf, blind, deafblind or have additional disabilities.",
    ["blind", "deaf"],
  ],
  [
    "Students in grades 1-12 with physical disabilities and qualifying health or sensory impairments.",
    ["kids", "physical"],
  ],
  [
    "Children and/or adults with physical, intellectual or developmental disabilities who face barriers to conventional baseball.",
    ["kids", "adults", "intellectual", "physical"],
  ],
  [
    "Children and adults with disabilities; veterans.",
    ["veterans", "kids", "adults"],
  ],
  [
    "People with intellectual and developmental disabilities.",
    ["intellectual"],
  ],
  [
    "People with cognitive/developmental disabilities; People with physical/recovery disabilities; People with emotional/social disabilities, mental health conditions, or PTSD.",
    ["intellectual", "physical"],
  ],
  [
    "People with physical, intellectual or emotional challenges; veterans; at-risk youth; abuse and trauma survivors.",
    ["veterans", "kids", "intellectual", "physical"],
  ],
  ["Veterans, active-duty military and military families.", ["veterans"]],
  [
    "Adults with spinal cord injury, amputation, stroke or traumatic brain injury (TBI).",
    ["adults", "physical", "brain"],
  ],
  ["Kids ages 5 to 17 who use a wheelchair", ["kids", "physical"]],
];

test("who it's for: real served text gives exact codes, in chip order", () => {
  for (const [text, want] of REAL) assert.deepEqual(whoTags(text), want, text);
});

test("who it's for: word boundaries keep look-alike words out", () => {
  assert.deepEqual(
    whoTags("Insight sessions after public hearings."),
    [],
    "insight is not sight, hearings is not hearing",
  );
  assert.deepEqual(
    whoTags("Open to everyone; adulthood not required"),
    [],
    "adulthood is not adults",
  );
  assert.deepEqual(whoTags("All."), []);
  assert.deepEqual(
    whoTags("First responders and their families."),
    [],
    "first responders are not veterans",
  );
  assert.deepEqual(
    whoTags("Skidmore campus paddlers"),
    [],
    "Skidmore is not kids",
  );
  assert.deepEqual(
    whoTags("Physicians welcome"),
    [],
    "physicians is not physical",
  );
  assert.deepEqual(whoTags("Sighted guides and blind runners"), ["blind"]);
  assert.deepEqual(
    whoTags("Sighted guides welcome"),
    [],
    "a bare 'sighted' (the guides) is not blind",
  );
  assert.deepEqual(
    whoTags("Visual arts for adults"),
    ["adults"],
    "visual on its own is not blind",
  );
  assert.deepEqual(whoTags(""), []);
  assert.deepEqual(whoTags(null), []);
});

test("who it's for: a veteran meetup serves veterans even when its text doesn't say", () => {
  assert.deepEqual(whoTags("", "veteran-meetup"), ["veterans"]);
  assert.deepEqual(
    whoTags("Open to all; families welcome.", "veteran-meetup"),
    ["veterans"],
  );
  assert.deepEqual(whoTags("", "tennis"), []);
});

test("who it's for: read from the served part only, never the sports or the name", () => {
  const d =
    "Sports and activities: blind hockey; deaf soccer; wheelchair basketball. Athletes served: Youth and adults with autism";
  assert.equal(whoText(d), "Youth and adults with autism");
  assert.deepEqual(whoTags(whoText(d)), ["kids", "adults", "autism"]);
  assert.equal(
    whoText("Sports and activities: blind hockey."),
    "",
    "a sport named for blind athletes does not say who it serves",
  );
  assert.equal(
    whoText("Wounded Warrior Project chapter"),
    "",
    "no served part: nothing, even when the name sounds like it",
  );
});

test("who it's for: veteran research rows read every 'Who it's for:' part", () => {
  const meet =
    "Coffee and conversation. When: Second Tuesday, 9 a.m. Who it's for: Veterans and first responders and their families.";
  assert.equal(
    whoText(meet),
    "Veterans and first responders and their families.",
  );
  assert.deepEqual(whoTags(whoText(meet), "veteran-meetup"), ["veterans"]);
  const two =
    "Programs: Art therapy. Painting together. Who it's for: Veterans with disabilities. Also equine therapy: Grooming and riding. Who it's for: Youth from military families.";
  assert.equal(
    whoText(two),
    "Veterans with disabilities. Youth from military families.",
  );
  assert.deepEqual(whoTags(whoText(two), "art-therapy"), ["veterans", "kids"]);
});

test("who it's for: every code has a label, in one order", () => {
  assert.deepEqual(Object.keys(WHO_LABELS), WHO_ORDER);
  assert.equal(WHO_LABELS.blind, "Blind or low vision");
  for (const l of Object.values(WHO_LABELS))
    assert.ok(!/[–—]/.test(l), "no dashes in labels");
});

test("who it's for: visual or vision next to a disability or impairment is blind or low vision", () => {
  for (const t of [
    "People with vision impairments",
    "Athletes with a vision impairment",
    "Visually impaired skiers",
    "Visual disabilities",
    "Hearing or visual impairments",
    "Visual, hearing, and physical disabilities",
    "Visual or physical impairments",
    "Partially sighted swimmers",
    "Partially-sighted swimmers",
    "Sight impaired swimmers",
    "Sight-impaired runners",
    "Vision disabilities",
    "Sight loss support",
  ])
    assert.ok(whoTags(t).includes("blind"), t);
  assert.deepEqual(
    whoTags("Physical, cognitive and hearing disabilities"),
    ["deaf", "intellectual", "physical"],
    "no visual, no blind",
  );
});

test("who it's for: school-age ranges up to 21 are kids and teens", () => {
  assert.deepEqual(whoTags("Students ages 5-21"), ["kids"]);
  assert.deepEqual(whoTags("Ages 3 through 21 with autism"), [
    "kids",
    "autism",
  ]);
  assert.deepEqual(whoTags("Ages 5 to 17"), ["kids"]);
  assert.deepEqual(whoTags("Ages 18-25"), [], "past 21 is not kids");
});

test("who it's for: ?w= takes only the nine codes, never an inherited key", () => {
  for (const c of WHO_ORDER) {
    assert.equal(whoCode(c), c);
    assert.ok(isWho(c));
  }
  for (const bad of [
    "constructor",
    "__proto__",
    "toString",
    "hasOwnProperty",
    "valueOf",
    "Blind",
    "",
    null,
    undefined,
    ["blind"],
  ]) {
    assert.equal(whoCode(bad), "", String(bad));
    assert.equal(whoSay(bad), "", String(bad));
    assert.equal(whoLine(bad, 2, 1), "", String(bad));
  }
  const bad = whoChips({
    pool: [{ who: ["kids"] }, { who: [] }],
    active: "constructor",
    hrefFor: (c) => (c ? "/x?w=" + c : "/x"),
  });
  assert.ok(
    !bad.includes("constructor") && !bad.includes("function"),
    "an inherited key never shows",
  );
  assert.match(
    bad,
    /href="\/x" data-replace aria-current="page"><span>Anyone<\/span>/,
    "an unknown active code is no filter: Anyone is current",
  );
  assert.equal((bad.match(/aria-current/g) || []).length, 1);
});

const pool = [
  { who: ["veterans", "kids"] },
  { who: ["veterans", "blind"] },
  { who: ["veterans"] },
];
const hrefFor = (c) => (c ? "/near/Denver?w=" + c : "/near/Denver");
const codesIn = (html) => [...html.matchAll(/w=(\w+)"/g)].map((m) => m[1]);

test("who it's for: whoChips offers only codes that filter something, plus the active one", () => {
  const html = whoChips({ pool, hrefFor, label: "Who it's for near Denver" });
  assert.deepEqual(
    codesIn(html),
    ["kids", "blind"],
    "veterans: every listing here has it, so it filters nothing",
  );
  assert.match(
    html,
    /^<nav class="who" aria-label="Who it&#39;s for near Denver">/,
  );
  assert.match(
    html,
    /href="\/near\/Denver" data-replace aria-current="page"><span>Anyone<\/span>/,
    "no filter: Anyone is current",
  );
  assert.ok(
    html.indexOf(">Kids and teens<") < html.indexOf(">Blind or low vision<"),
    "chip order",
  );
  const on = whoChips({ pool, active: "deaf", hrefFor, check: "<i>ok</i>" });
  assert.deepEqual(
    codesIn(on),
    ["kids", "blind", "deaf"],
    "the active code always shows, even when no listing here has it",
  );
  assert.match(
    on,
    /href="\/near\/Denver\?w=deaf" data-replace aria-current="page"><i>ok<\/i><span>Deaf or hard of hearing<\/span>/,
  );
  assert.ok(
    !/href="\/near\/Denver" data-replace aria-current/.test(on),
    "Anyone is not current while filtering",
  );
  assert.equal(
    whoChips({ pool: [{ who: ["veterans"] }, { who: ["veterans"] }], hrefFor }),
    "",
    "nothing to filter by: no row",
  );
  assert.equal(whoChips({ pool: [], hrefFor }), "");
  assert.deepEqual(
    codesIn(
      whoChips({
        pool: [{ who: ["constructor", "kids"] }, { who: [] }],
        hrefFor,
      }),
    ),
    ["kids"],
    "unknown codes in data are ignored",
  );
});

test("who it's for: whoLine counts, singular and plural, people first", () => {
  assert.equal(
    whoLine("veterans", 22, 45, " nearby"),
    '<p class="who-line">Showing <b class="num">22</b> that say they serve veterans. <b class="num">45</b> more nearby don\'t say who they serve yet.</p>',
  );
  assert.equal(
    whoLine("blind", 1, 1),
    '<p class="who-line">Showing <b class="num">1</b> that says it serves people who are blind or have low vision. <b class="num">1</b> more doesn\'t say who they serve yet.</p>',
  );
  assert.equal(
    whoLine("autism", 3, 0),
    '<p class="who-line">Showing <b class="num">3</b> that say they serve people with autism.</p>',
    "no tail when every listing says",
  );
  assert.equal(
    whoLine("kids", 0, 4, " nearby"),
    '<p class="who-line">None nearby say they serve kids and teens yet. <b class="num">4</b> more nearby don\'t say who they serve yet.</p>',
  );
  assert.equal(
    whoLine("deaf", 2, 1, '"<x>'),
    '<p class="who-line">Showing <b class="num">2</b> that say they serve people who are deaf or hard of hearing. <b class="num">1</b> more&quot;&lt;x&gt; doesn\'t say who they serve yet.</p>',
    "where is escaped",
  );
});
