// Listing art and trust words: one module (public/listing-art.js) shared by the
// app and the Worker, so both renderers pick the same symbol and say the same
// thing about whether a person has verified a listing.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import "../public/listing-art.js";
import { BETA_MESSAGE } from "../src/site-chrome.js";

const L = globalThis.ListingArt;
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("a sport key picks its sport; older keys map onto the sports table", () => {
  assert.equal(L.symbolKey({ sport: "tennis" }), "tennis");
  assert.equal(L.symbolKey({ sport: "equine-therapy" }), "equine-therapy");
  assert.equal(L.symbolKey({ sport: "wheelchair_basketball" }), "basketball");
  assert.equal(L.symbolKey({ sport: "beepbaseball" }), "beepbaseball");
  assert.equal(L.symbolKey({ sport: "softball" }), "softball");
  // Every sport has its own dedicated file, even when the picture is shared.
  assert.equal(L.symbolSrc("wheelchairracing"), "/emblems/sports/wheelchairracing.svg");
  assert.equal(L.symbolSrc("equine-therapy"), "/emblems/sports/equine-therapy.svg");
  assert.deepEqual([...L.ART].sort(), [...L.SPORTS].sort());
});

test("most listings have only a label, and the label picks the symbol", () => {
  const cases = {
    "Adaptive tennis": "tennis",
    "Wheelchair Tennis": "tennis",
    "TOPSoccer adaptive soccer training and team participation": "soccer",
    "Wheelchair Basketball": "basketball",
    "Sled Hockey": "sledhockey",
    "Adaptive Rowing": "rowing",
    "Adaptive Skiing": "skiing",
    "Adaptive water skiing": "waterskiing",
    "Miracle League Baseball": "baseball",
    "Adaptive baseball using accessible fields and a buddy system": "baseball",
    "Equine therapy": "equine-therapy",
    "Therapeutic riding": "equestrian",
    "Adaptive martial arts": "martialarts",
    "Track & Field": "trackfield",
    "Beep Baseball": "beepbaseball",
    "Wheelchair Fencing": "fencing",
    "Art therapy": "art-therapy",
    "Veteran meetup": "veteran-meetup",
    "Adaptive Cycling": "cycling",
    "Adaptive Swimming": "swimming",
    "Adaptive Golf": "golf",
    "Adaptive Rock Climbing": "climbing",
    "Power Soccer": "soccer",
  };
  for (const [label, key] of Object.entries(cases)) {
    assert.equal(L.symbolKey({ sportLabel: label }), key, label);
  }
});

test("words that only look like a sport do not pick one", () => {
  for (const label of [
    "Life skills and recreation", // skills is not skiing
    "Grow with us",                // grow is not rowing
    "Adaptive sports and recreation",
    "Multi-Sport",
  ]) {
    assert.equal(L.symbolKey({ sportLabel: label }), null, label);
  }
});

test("a Multi-Sport listing falls back to its name, label first", () => {
  assert.equal(L.symbolKey({ sportLabel: "Multi-Sport", name: "Lake Tahoe Adaptive Ski Club" }), "skiing");
  assert.equal(L.symbolKey({ sportLabel: "Adaptive Tennis", name: "Ski and Tennis Club" }), "tennis");
  assert.equal(L.symbolKey({ sportLabel: "Multi-Sport", name: "Achilles Chicago" }), "running"); // Achilles is a running club
  assert.equal(L.symbolKey({ sportLabel: "Multi-Sport", name: "Tri-County Adaptive Sports" }), null);
  assert.equal(L.symbolKey({ sportLabel: "Multi-Sport", name: "Clay County Adaptive Sports" }), null);
});

test("Alec's flat set: every image has an SVG and a PNG, no orphan files, every sport has a tone", () => {
  const dir = new URL("../public/emblems/sports/", import.meta.url);
  const files = readdirSync(dir);
  const keys = [...L.ART, "grant", "event"].sort();
  assert.deepEqual(files.filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4)).sort(), keys);
  assert.deepEqual(files.filter((f) => f.endsWith(".png")).map((f) => f.slice(0, -4)).sort(), keys);
  // Every borrowed image and every older symbol still exists.
  const old = readdirSync(new URL("../public/emblems/", import.meta.url));
  for (const k of L.SYMBOLS) assert.ok(old.includes(`athlete-${k}.svg`), k);
  const css = read("public/styles.css");
  for (const key of L.SPORTS.filter((k) => k !== "multi")) {
    const family = L.FAMILY[key];
    assert.ok(family, `no family for ${key}`);
    assert.ok(css.includes(`.tone-${family} {`), `no .tone-${family} rule`);
  }
  assert.ok(css.includes(".tone-house {"));
});

test("every sport in the sports table resolves to an image file on disk", () => {
  const dir = new URL("../public/", import.meta.url);
  const exists = (src) => readdirSync(new URL("." + src.slice(0, src.lastIndexOf("/") + 1), dir)).includes(src.slice(src.lastIndexOf("/") + 1));
  for (const k of [...L.SPORTS, null]) assert.ok(exists(L.symbolSrc(k)), `${k} -> ${L.symbolSrc(k)}`);
  assert.ok(exists(L.GRANT_ART) && exists(L.EVENT_ART));
});

test("art: the program's own photo wins; otherwise a symbol, never an empty tile", () => {
  assert.deepEqual(L.art({ photo: "/p/x.jpg", sport: "tennis" }), { kind: "photo", src: "/p/x.jpg", key: null, tone: null });
  assert.deepEqual(L.art({ sportLabel: "Adaptive tennis" }), { kind: "symbol", src: "/emblems/sports/tennis.svg", key: "tennis", tone: "racquet" });
  assert.deepEqual(L.art({}), { kind: "symbol", src: "/emblems/sports/multi.svg", key: null, tone: "house" });
});

test("Verified means verification_status = verified, and nothing else earns the word", () => {
  assert.deepEqual(L.trustLine({ verification: "verified" }), { cls: "is-verified", text: "Verified" });
  for (const v of ["unverified", "pending", null, undefined, "Verified"]) {
    assert.deepEqual(L.trustLine({ verification: v }), { cls: "is-unverified", text: "Not yet verified" }, String(v));
  }
  // A recent automatic website check is not a person verifying it.
  assert.equal(L.isVerified({ verification: "unverified", lastChecked: "2026-10-12T00:00:00Z", freshness: 100 }), false);
});

test("a date on every listing: last checked, else the day it was listed, never invented", () => {
  assert.deepEqual(L.checkedRow({ lastChecked: "2026-10-05T23:30:00Z" }), ["Last checked", "Oct 5, 2026"]);
  assert.deepEqual(L.checkedRow({ listedAt: "2026-06-10T05:54:41Z" }), ["Listed", "Jun 10, 2026 · not checked yet"]);
  assert.deepEqual(L.checkedRow({}), ["Last checked", "Not checked yet"]);
  assert.deepEqual(L.checkedRow({ lastChecked: "not a date" }), ["Last checked", "Not checked yet"]);
  assert.equal(L.monthLabel("2026-09"), "September 2026");
  assert.equal(L.monthLabel("2026-13"), null);
  assert.equal(L.monthLabel(null), null);
});

test("our own research files never reach a visitor as a name or a link", () => {
  const research = { name: "Adaptive Sports Near Me research", url: null };
  assert.deepEqual(L.publicSource({ name: "10_georgia_adaptive_sports_organizations.csv (verified September 2026)", url: "https://drive.google.com/file/d/x/view" }), research);
  assert.deepEqual(L.publicSource({ name: "csv-verified-2026-09:1lLGFuCjzt", url: null }), research);
  assert.deepEqual(L.publicSource({ name: "Karen 2026-09-02 state research", url: null }), research);
  assert.deepEqual(L.publicSource({ name: "Builder web search 2026-08-21", url: "https://usapickleball.org/adaptive/" }), research);
  assert.deepEqual(L.publicSource({ name: "US Paralympics Club Finder", url: "https://www.teamusa.org" }), { name: "US Paralympics Club Finder", url: "https://www.teamusa.org" });
  // A public directory hosted on Google keeps its name and loses the link.
  assert.deepEqual(L.publicSource({ name: "Move United Member Directory", url: "https://docs.google.com/x" }), { name: "Move United Member Directory", url: null });
  assert.equal(L.isInternalSource({ name: "US Paralympics Club Finder", url: "https://drive.google.com/x" }), true);
  // Only plain web links ever reach an href.
  assert.deepEqual(L.publicSource({ name: "Odd Directory", url: "javascript:alert(1)" }), { name: "Odd Directory", url: null });
  assert.deepEqual(L.publicSource({ name: "Odd Directory", url: "data:text/html,hi" }), { name: "Odd Directory", url: null });
  assert.equal(L.publicSource(null), null);
});

test("the app loads listing-art.js before its own script, and both beta bars say the same thing", () => {
  const index = read("public/index.html");
  const art = index.indexOf('<script src="/listing-art.js"></script>');
  const main = index.indexOf("/* ============================ DATA ============================ */");
  assert.ok(art > 0 && art < main, "listing-art.js must load before the inline app script");
  assert.ok(index.includes('id="betaBar"'));
  assert.ok(index.replace(/\s+/g, " ").includes(BETA_MESSAGE), "app beta bar matches src/site-chrome.js");
  assert.ok(index.includes('localStorage.getItem("asnm-beta-hidden")'));
});

test("listing sentences only name a source we know, and say schedules change", () => {
  assert.equal(L.unverifiedText(null, false), "No one on our team has confirmed this listing yet. Check the website or call before you go.");
  assert.match(L.unverifiedText("US Paralympics Club Finder", false), /^This listing comes from US Paralympics Club Finder, and no one/);
  assert.match(L.unverifiedText(null, true), /^We found this program in our own research/);
  assert.equal(L.verifiedText("September 2026"), "A person on our team checked this program against an official source in September 2026. Schedules change, so check the website before you go.");
  assert.ok(!/public directory/.test(L.unverifiedText(null, false)), "never guess where a listing came from");
});
