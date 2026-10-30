// Share cards (src/share-cards.js, scripts/og/build.mjs, public/og). Alec, 2026-10-17:
// "Let's design a new open graph image... let's level up", "B: Four colours" for the
// home card and "Yes, every page" for the rest. Every page family has its card, each card
// is a small 1200x630 PNG carrying its page's headline word for word, and each page's
// Open Graph tags name its own card.
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { servePage, injectMeta, STATE_NAMES } from "../src/pages.js";
import { SPORT_NAMES } from "../src/sport-names.js";
import {
  HOME_CARD,
  PAGE_CARDS,
  sportCard,
  stateCard,
  listingCard,
  CARD_WIDTH,
  CARD_HEIGHT,
} from "../src/share-cards.js";
import { VETERAN_BUSINESS_COPY } from "../src/resources/veteran-businesses.js";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const file = (path) => new URL(`../public${path}`, import.meta.url);
const SHELL = read("public/index.html");
const ORIGIN = "https://adaptivesportsnearme.com";
const ALL = [
  HOME_CARD,
  ...Object.values(PAGE_CARDS),
  ...Object.keys(SPORT_NAMES).map(sportCard),
  ...Object.keys(STATE_NAMES).map(stateCard),
];

test("every page family has its card: a 1200x630 PNG under 300 KB", () => {
  assert.equal(ALL.length, 1 + 3 + 45 + 51);
  for (const path of ALL) {
    assert.ok(
      existsSync(file(path)),
      `${path} is missing: run node scripts/og/build.mjs`,
    );
    const png = readFileSync(file(path));
    assert.equal(png.subarray(1, 4).toString(), "PNG", `${path} is a PNG`);
    assert.deepEqual(
      [png.readUInt32BE(16), png.readUInt32BE(20)],
      [CARD_WIDTH, CARD_HEIGHT],
      `${path} is 1200x630`,
    );
    // WhatsApp drops a preview image over 300 KB without a word.
    assert.ok(
      statSync(file(path)).size < 300 * 1024,
      `${path} is under 300 KB`,
    );
  }
});

test("each card carries its page's headline, word for word, and is the file the build made", () => {
  const cards = JSON.parse(read("public/og/cards.json"));
  const want = new Map([
    [
      HOME_CARD,
      (h) =>
        read("public/app/views/home.js").includes(
          `<span class="hb-title">${h}</span>`,
        ),
    ],
    [
      PAGE_CARDS.grants,
      (h) =>
        read("public/app/views/grants.js").includes(
          `<h1 tabindex="-1">${h}</h1>`,
        ),
    ],
    [
      PAGE_CARDS.events,
      (h) =>
        read("public/app/views/events.js").includes(
          `<h1 tabindex="-1">${h}</h1>`,
        ),
    ],
    [
      PAGE_CARDS["veteran-owned-businesses"],
      (h) => h === VETERAN_BUSINESS_COPY.title,
    ],
    ...Object.entries(SPORT_NAMES).map(([k, name]) => [
      sportCard(k),
      (h) => h === name,
    ]),
    ...Object.entries(STATE_NAMES).map(([st, name]) => [
      stateCard(st),
      (h) => h === name,
    ]),
  ]);
  assert.deepEqual(
    cards.map((c) => c.path).sort(),
    [...want.keys()].sort(),
    "cards.json lists every card once",
  );
  for (const c of cards) {
    assert.ok(
      want.get(c.path)(c.headline),
      `${c.path}: "${c.headline}" is not its page's headline any more; run node scripts/og/build.mjs`,
    );
    const sha = createHash("sha256")
      .update(readFileSync(file(c.path)))
      .digest("hex")
      .slice(0, 16);
    assert.equal(
      sha,
      c.sha256,
      `${c.path} changed outside the build; run node scripts/og/build.mjs`,
    );
  }
});

test("a listing wears the card of the sport its art shows, else the multi-sport card", () => {
  assert.equal(listingCard({ sport: "tennis" }), "/og/sports/tennis.png");
  assert.equal(
    listingCard({
      sport: null,
      sportLabel: "Wheelchair Basketball",
      name: "Atlanta Wolfpack",
    }),
    "/og/sports/basketball.png",
  );
  assert.equal(
    listingCard({ sport: null, name: "Adaptive Adventures" }),
    "/og/sports/multi.png",
  );
  assert.equal(sportCard("not-a-sport"), "/og/sports/multi.png");
  for (const k of Object.keys(SPORT_NAMES))
    assert.equal(listingCard({ sport: k }), sportCard(k), k);
});

// env.ASSETS serves the shell at "/"; env.DB is an in-memory D1 with the real schema.
function env() {
  const sql = new DatabaseSync(":memory:");
  sql.exec(read("db/schema.sql"));
  sql.exec(read("db/migrations/0004_grants.sql"));
  sql
    .prepare(
      `INSERT INTO organizations (id,name,sport,sport_key,website_url,city,state,is_public,status,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,1,'active','2026','2026')`,
    )
    .run(
      "11111111-2222-4333-8444-555555555555",
      "Atlanta Wolfpack",
      "Wheelchair Basketball",
      "basketball",
      "https://adaptedsports.org/",
      "Atlanta",
      "GA",
    );
  sql
    .prepare(
      `INSERT INTO grants (id,name,source,audience,is_public,created_at,updated_at) VALUES (?,?,?,?,1,'2026','2026')`,
    )
    .run(
      "b0298125-6d6a-4114-b0a2-5275750c09ae",
      "Hustle & Heart Fund",
      "Adapt To Life",
      "athlete",
    );
  const DB = {
    prepare(query) {
      const st = sql.prepare(query);
      let args = [];
      return {
        bind(...v) {
          args = v;
          return this;
        },
        async first() {
          return st.get(...args) ?? null;
        },
        async all() {
          return { results: st.all(...args) };
        },
      };
    },
  };
  return {
    ENV_NAME: "production",
    DB,
    ASSETS: {
      fetch: async () =>
        new Response(SHELL, { headers: { "content-type": "text/html" } }),
    },
  };
}
const imageOf = async (path, e = env(), origin = ORIGIN) => {
  const url = new URL(origin + path);
  const html = await (await servePage(new Request(url), e, url)).text();
  return (html.match(/<meta property="og:image" content="([^"]+)">/) || [])[1];
};

test("each page's Open Graph tags name its own card", async () => {
  const pages = {
    "/sports/tennis": "/og/sports/tennis.png",
    "/sports/veteran-meetup": "/og/sports/veteran-meetup.png",
    "/states/FL": "/og/states/FL.png",
    "/organizations/11111111-2222-4333-8444-555555555555":
      "/og/sports/basketball.png",
    "/grants": "/og/grants.png",
    "/grants/b0298125-6d6a-4114-b0a2-5275750c09ae": "/og/grants.png",
    "/events": "/og/events.png",
    "/resources/veteran-owned-businesses": "/og/veteran-owned-businesses.png",
    "/sports": HOME_CARD,
    "/help": HOME_CARD,
    "/near/Tampa%2C%20FL": HOME_CARD,
    "/no-such-page": HOME_CARD,
  };
  for (const [path, card] of Object.entries(pages))
    assert.equal(await imageOf(path), ORIGIN + card, path);
  const html = injectMeta(
    SHELL,
    {},
    { url: new URL(ORIGIN + "/"), production: true },
  );
  assert.ok(
    html.includes(`<meta property="og:image:width" content="1200">`) &&
      html.includes(`<meta property="og:image:height" content="630">`),
  );
});

test("a review copy's previews show its own cards; production's show production's", async () => {
  const review = { ...env(), ENV_NAME: "review" };
  assert.equal(
    await imageOf(
      "/sports/tennis",
      review,
      "https://asnm-review.example.workers.dev",
    ),
    "https://asnm-review.example.workers.dev/og/sports/tennis.png",
  );
  assert.equal(
    await imageOf("/sports/tennis", env(), ORIGIN),
    `${ORIGIN}/og/sports/tennis.png`,
  );
});

// A redesigned card needs a new address: platforms keep a scraped image for weeks, so the
// old /og-image.jpg would go on showing the old photo card.
test("the home page shell and every page point at the new cards, not /og-image.jpg", () => {
  assert.ok(
    SHELL.includes(
      `<meta property="og:image" content="${ORIGIN}${HOME_CARD}">`,
    ),
  );
  for (const src of ["public/index.html", "src/pages.js", "src/blog.js"])
    assert.ok(!read(src).includes("og-image.jpg"), src);
});
