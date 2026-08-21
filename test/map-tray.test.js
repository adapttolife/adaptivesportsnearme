// Apple-Maps tray: pin select opens, a second pin updates in place,
// empty-map tap dismisses. Also locks the homepage wiring (fat targets,
// bottom sheet, no full-page jump from a pin).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  PIN_HIT_PX, TRAY_MS, SWIPE_DISMISS_PX,
  createTrayState, selectPin, dismissTray, mapClickAction, classifyHit,
  swipeDismisses, trayAction, trayPeekHtml,
} from "../src/map-tray.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const index = readFileSync(join(root, "public/index.html"), "utf8");

const RENO = {
  id: "fc478a1c-b3a0-4828-84bf-3dd45f6dec82",
  name: "3rd Shot Pickleball Reno Adaptive",
  sport: "pickleball",
  sportLabel: "Adaptive Pickleball",
  city: "Reno",
  state: "NV",
  website: "https://3rdshotpickleball.com/home-reno",
  verification: "unverified",
  lastChecked: "2026-08-21T19:55:06Z",
};

const KANSAS = {
  id: "abf56b30-95cf-45b1-a8fd-6d56248b4199",
  name: "Adaptive Cycling Omnium",
  sport: "cycling",
  sportLabel: "Adaptive Cycling",
  city: null,
  state: "KS",
  stateName: "Kansas",
  geoPrecision: "state",
  website: null,
};

test("tray opens on pin select", () => {
  const next = selectPin(createTrayState(), RENO.id);
  assert.equal(next.open, true);
  assert.equal(next.programId, RENO.id);
  assert.equal(next.swapped, false);
  assert.equal(mapClickAction("pin"), "select");
});

test("second pin updates the tray in place (no close/reopen)", () => {
  const open = selectPin(createTrayState(), RENO.id);
  const next = selectPin(open, KANSAS.id);
  assert.equal(next.open, true);
  assert.equal(next.programId, KANSAS.id);
  assert.equal(next.swapped, true);
  // Same pin again is still open, not a swap-flash.
  const again = selectPin(next, KANSAS.id);
  assert.equal(again.open, true);
  assert.equal(again.programId, KANSAS.id);
  assert.equal(again.swapped, false);
});

test("empty-map dismiss closes the tray; pin/cluster/tray do not", () => {
  const open = selectPin(createTrayState(), RENO.id);
  const gone = dismissTray(open, "empty-map");
  assert.equal(gone.open, false);
  assert.equal(gone.programId, null);
  assert.equal(gone.dismissed, true);
  assert.equal(gone.reason, "empty-map");

  assert.equal(mapClickAction("empty"), "dismiss");
  assert.equal(mapClickAction("pin"), "select");
  assert.equal(mapClickAction("cluster"), "cluster");
  assert.equal(mapClickAction("tray"), "ignore");
  assert.equal(mapClickAction("control"), "ignore");

  assert.equal(classifyHit("mdot"), "pin");
  assert.equal(classifyHit("mpin"), "pin");
  assert.equal(classifyHit("mpill"), "cluster");
  assert.equal(classifyHit("map-tray"), "tray");
  assert.equal(classifyHit("maplibregl-canvas"), "empty");

  const still = dismissTray(open, "empty-map");
  assert.equal(still.dismissed, true);
  const already = dismissTray(createTrayState(), "empty-map");
  assert.equal(already.dismissed, false);
});

test("swipe-down past the threshold dismisses", () => {
  assert.equal(swipeDismisses(SWIPE_DISMISS_PX), true);
  assert.equal(swipeDismisses(SWIPE_DISMISS_PX - 1), false);
  const gone = dismissTray(selectPin(createTrayState(), RENO.id), "swipe");
  assert.equal(gone.dismissed, true);
  assert.equal(gone.reason, "swipe");
});

test("peek HTML reuses name, sport, city, Visit/Open listing — no trust copy", () => {
  const reno = trayPeekHtml(RENO);
  assert.ok(reno.includes("3rd Shot Pickleball Reno Adaptive"));
  assert.ok(reno.includes("Reno, NV"));
  assert.ok(reno.includes("Adaptive Pickleball"));
  assert.ok(reno.includes(">Visit<"));
  assert.ok(reno.includes("3rdshotpickleball.com"));
  assert.ok(reno.includes("tray-photo"));
  assert.ok(!reno.includes("Unverified"));
  assert.ok(!reno.includes("Last checked"));
  assert.ok(!reno.includes("Visit website"));

  const ks = trayPeekHtml(KANSAS);
  assert.ok(ks.includes("Adaptive Cycling Omnium"));
  assert.ok(ks.includes("statewide"));
  assert.ok(ks.includes(">Open listing<"));
  assert.ok(ks.includes(`/programs/${KANSAS.id}`));
  assert.ok(!ks.includes("Unverified"));
  assert.ok(!ks.includes("Last checked"));

  assert.equal(trayAction(RENO).label, "Visit");
  assert.equal(trayAction(KANSAS).label, "Open listing");
});

test("pins are 44px hit targets; tray slides up 280ms; pin tap stays on /maps", () => {
  assert.equal(PIN_HIT_PX, 44);
  assert.equal(TRAY_MS, 280);
  assert.ok(index.includes("width:var(--tap)") && index.includes("height:var(--tap)"));
  assert.ok(index.includes(".mdot-mark") || index.includes("mdot-mark"));
  assert.ok(index.includes("id=\"mapTray\"") || index.includes("id='mapTray'"));
  assert.ok(index.includes("function openMapTray("));
  assert.ok(index.includes("function closeMapTray("));
  assert.ok(index.includes("function selectMapPin("));
  assert.ok(index.includes("transform") && index.includes("280ms"));
  // Pins no longer jump the whole view to the listing sheet.
  assert.ok(!index.includes("d.addEventListener('click',()=>{ state.section='program'; state.programId=p.id; render(); });"));
  assert.ok(index.includes("selectMapPin(p"));
  // Directory cards still open the listing.
  assert.ok(index.includes("state.section='program'; state.programId=t.getAttribute('data-prog')"));
  // Zip/city search and nearby stay wired.
  assert.ok(index.includes("function resolveNear("));
  assert.ok(index.includes("state.nearZip") && index.includes("state.nearCity"));
});
