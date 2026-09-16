// Google Maps two-height tray: peek opens, expand, dismiss, second pin updates.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  PIN_HIT_PX, TRAY_MS, SWIPE_DISMISS_PX, PEEK_VH, EXPANDED_VH,
  DESKTOP_MIN_PX, DESKTOP_PANEL_WIDTH_PX, DESKTOP_PANEL_INSET_PX, DESKTOP_PANEL_CLASS,
  createTrayState, selectPin, dismissTray, setTrayHeight, mapClickAction, classifyHit,
  swipeDismisses, snapHeight, trayAction, trayPills, trayMetaLine, trayChrome,
  trayPeekHtml, trayExpandedHtml, trayHtml,
} from "../src/map-tray.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const index = readFileSync(join(root, "public/index.html"), "utf8");

const RENO = {
  id: "fc478a1c-b3a0-4828-84bf-3dd45f6dec82",
  name: "3rd Shot Pickleball Reno Adaptive",
  sport: "pickleball",
  sportLabel: "Adaptive Pickleball",
  type: "inclusive_club",
  city: "Reno",
  state: "NV",
  website: "https://3rdshotpickleball.com/home-reno",
  desc: "Indoor pickleball club at 6895 Sierra Center Pkwy, Reno. Listed by USA Pickleball for Sunday adaptive/wheelchair pickleball (11am–1pm, $5).",
  cost: "$5 adaptive session (USA Pickleball listing)",
  ages: "Adult",
  phone: "775-467-2025",
  email: "reno@3rdshotpickleball.com",
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

const NEARBY = [
  { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", name: "Sunflower Adaptive Cycling", sport: "cycling", sportLabel: "Adaptive Cycling", city: "Wichita", state: "KS", dist: 42 },
];

test("peek open", () => {
  const next = selectPin(createTrayState(), RENO.id);
  assert.equal(next.open, true);
  assert.equal(next.programId, RENO.id);
  assert.equal(next.height, "peek");
  assert.equal(next.swapped, false);
  assert.equal(mapClickAction("pin"), "select");
  assert.equal(PEEK_VH, 35);
});

test("expand", () => {
  const open = selectPin(createTrayState(), RENO.id);
  const exp = setTrayHeight(open, "expanded");
  assert.equal(exp.open, true);
  assert.equal(exp.height, "expanded");
  assert.equal(exp.programId, RENO.id);
  assert.equal(EXPANDED_VH, 90);
  // Midpoint snap: 800px viewport → peek 280, expanded 720, mid 220.
  assert.equal(snapHeight("peek", -220, 800), "expanded");
  assert.equal(snapHeight("peek", -100, 800), "peek");
  assert.equal(snapHeight("expanded", 220, 800), "peek");
  assert.equal(snapHeight("expanded", 50, 800), "expanded");
});

test("dismiss", () => {
  const open = selectPin(createTrayState(), RENO.id);
  const gone = dismissTray(open, "empty-map");
  assert.equal(gone.open, false);
  assert.equal(gone.programId, null);
  assert.equal(gone.dismissed, true);
  assert.equal(gone.reason, "empty-map");
  assert.equal(gone.height, "peek");

  assert.equal(mapClickAction("empty"), "dismiss");
  assert.equal(mapClickAction("pin"), "select");
  assert.equal(mapClickAction("cluster"), "cluster");
  assert.equal(mapClickAction("tray"), "ignore");
  assert.equal(mapClickAction("control"), "ignore");

  assert.equal(classifyHit("mdot"), "pin");
  assert.equal(classifyHit("mpin"), "pin");
  assert.equal(classifyHit("mpill"), "cluster");
  assert.equal(classifyHit("map-tray"), "tray");
  assert.equal(classifyHit("tray-handle"), "tray");
  assert.equal(classifyHit("tray-x"), "tray");
  assert.equal(classifyHit("maplibregl-canvas"), "empty");

  const already = dismissTray(createTrayState(), "empty-map");
  assert.equal(already.dismissed, false);
});

test("second pin updates the tray in place and keeps expanded height", () => {
  const open = selectPin(createTrayState(), RENO.id);
  const exp = setTrayHeight(open, "expanded");
  const next = selectPin(exp, KANSAS.id);
  assert.equal(next.open, true);
  assert.equal(next.programId, KANSAS.id);
  assert.equal(next.swapped, true);
  assert.equal(next.height, "expanded");
  const again = selectPin(next, KANSAS.id);
  assert.equal(again.open, true);
  assert.equal(again.programId, KANSAS.id);
  assert.equal(again.swapped, false);
  assert.equal(again.height, "expanded");
  // A closed tray always opens at peek.
  const fresh = selectPin(createTrayState(), KANSAS.id);
  assert.equal(fresh.height, "peek");
});

test("swipe down from peek dismisses; swipe down from expanded returns to peek", () => {
  assert.equal(swipeDismisses(SWIPE_DISMISS_PX), true);
  assert.equal(swipeDismisses(SWIPE_DISMISS_PX - 1), false);
  assert.equal(snapHeight("peek", SWIPE_DISMISS_PX, 800), "closed");
  assert.equal(snapHeight("peek", SWIPE_DISMISS_PX - 1, 800), "peek");
  const gone = dismissTray(selectPin(createTrayState(), RENO.id), "swipe");
  assert.equal(gone.dismissed, true);
  assert.equal(gone.reason, "swipe");
});

test("peek HTML: title, city · sport, Visit/Call/Email pills, handle — no photo, no trust copy", () => {
  const reno = trayPeekHtml(RENO);
  assert.ok(reno.includes("3rd Shot Pickleball Reno Adaptive"));
  assert.ok(reno.includes("Reno, NV · Adaptive Pickleball"));
  assert.ok(reno.includes(">Visit<"));
  assert.ok(reno.includes(">Call<"));
  assert.ok(reno.includes(">Email<"));
  assert.ok(reno.includes("3rdshotpickleball.com"));
  assert.ok(reno.includes("tel:7754672025"));
  assert.ok(reno.includes("mailto:reno@3rdshotpickleball.com"));
  assert.ok(reno.includes("tray-handle"));
  assert.ok(reno.includes("tray-x"));
  assert.ok(reno.includes("tray-pills"));
  assert.ok(!reno.includes("tray-photo"));
  assert.ok(!reno.includes("Unverified"));
  assert.ok(!reno.includes("Last checked"));
  assert.ok(!reno.includes("Visit website"));
  assert.ok(!reno.includes("Overview"));
  assert.ok(!reno.includes("Photos"));

  const ks = trayPeekHtml(KANSAS);
  assert.ok(ks.includes("Adaptive Cycling Omnium"));
  assert.ok(ks.includes("Kansas · statewide · Adaptive Cycling"));
  assert.ok(ks.includes(">Open listing<"));
  assert.ok(ks.includes(`/programs/${KANSAS.id}`));
  assert.ok(!ks.includes(">Call<"));
  assert.ok(!ks.includes(">Email<"));
  assert.ok(!ks.includes("Unverified"));
  assert.ok(!ks.includes("Last checked"));

  assert.equal(trayMetaLine(RENO), "Reno, NV · Adaptive Pickleball");
  assert.equal(trayAction(RENO).label, "Visit");
  assert.equal(trayAction(KANSAS).label, "Open listing");
  assert.deepEqual(trayPills(RENO).map((p) => p.label), ["Visit", "Call", "Email"]);
  assert.deepEqual(trayPills(KANSAS).map((p) => p.label), ["Open listing"]);
});

test("expanded HTML reuses the listing sheet: photo, title, city, desc, facts, Visit, nearby rail", () => {
  const html = trayExpandedHtml(RENO, NEARBY);
  assert.ok(html.includes("/assets/sport-photos/pickleball.jpg"));
  assert.ok(html.includes("has-dphoto"));
  assert.ok(html.includes("<h1>3rd Shot Pickleball Reno Adaptive</h1>"));
  assert.ok(html.includes("Reno, NV"));
  assert.ok(html.includes("Sunday adaptive"));
  assert.ok(html.includes(">Cost</span>"));
  assert.ok(html.includes(">Ages</span>"));
  assert.ok(html.includes("775-467-2025"));
  assert.ok(html.includes("reno@3rdshotpickleball.com"));
  assert.ok(html.includes("Visit website"));
  assert.ok(html.includes("class=\"nearby\""));
  assert.ok(html.includes("class=\"frow-scroll\""));
  assert.ok(html.includes("Sunflower Adaptive Cycling"));
  assert.ok(!html.includes("Unverified"));
  assert.ok(!html.includes("Last checked"));
  assert.ok(!html.includes("Overview"));
  assert.ok(!html.includes(">Photos<"));
  assert.ok(!html.includes("← Directory"));

  const full = trayHtml(RENO, NEARBY);
  assert.ok(full.includes("tray-peek"));
  assert.ok(full.includes("tray-full"));
  assert.ok(full.includes("Reno, NV · Adaptive Pickleball"));
  assert.ok(full.includes("<h1>3rd Shot Pickleball Reno Adaptive</h1>"));
});

test("pins are 44px hit targets; tray slides 280ms; two heights are wired on /maps", () => {
  assert.equal(PIN_HIT_PX, 44);
  assert.equal(TRAY_MS, 280);
  assert.equal(PEEK_VH, 35);
  assert.equal(EXPANDED_VH, 90);
  assert.ok(index.includes("width:var(--tap)") && index.includes("height:var(--tap)"));
  assert.ok(index.includes(".mdot-mark") || index.includes("mdot-mark"));
  assert.ok(index.includes("id=\"mapTray\"") || index.includes("id='mapTray'"));
  assert.ok(index.includes("function openMapTray("));
  assert.ok(index.includes("function closeMapTray("));
  assert.ok(index.includes("function selectMapPin("));
  assert.ok(index.includes("function expandMapTray("));
  assert.ok(index.includes("function setMapTrayHeight("));
  assert.ok(index.includes("function snapMapTray("));
  assert.ok(index.includes("PEEK_VH=35"));
  assert.ok(index.includes("EXPANDED_VH=90"));
  assert.ok(index.includes("height:35%"));
  assert.ok(index.includes("height:90%"));
  assert.ok(index.includes("transform") && index.includes("280ms"));
  assert.ok(index.includes("tray-pills"));
  assert.ok(index.includes("tray-full sheet"));
  assert.ok(index.includes("sheetHero(p)"));
  assert.ok(index.includes("denseRows(p)"));
  assert.ok(index.includes("relatedRow(p)"));
  assert.ok(!index.includes("d.addEventListener('click',()=>{ state.section='program'; state.programId=p.id; render(); });"));
  assert.ok(index.includes("selectMapPin(p"));
  assert.ok(index.includes("state.section='program'; state.programId=t.getAttribute('data-prog')"));
  assert.ok(index.includes("function resolveNear("));
  assert.ok(index.includes("state.nearZip") && index.includes("state.nearCity"));
  assert.ok(!index.includes("Unverified"));
  assert.ok(!index.includes("Last checked"));
  assert.ok(!index.includes("class=\"overview\""));
});

test("desktop is a full-height left column (420px), phone stays a bottom tray", () => {
  assert.equal(DESKTOP_MIN_PX, 721);
  assert.equal(DESKTOP_PANEL_WIDTH_PX, 420);
  assert.equal(DESKTOP_PANEL_INSET_PX, 24);
  assert.equal(DESKTOP_PANEL_CLASS, "panel");
  assert.equal(trayChrome(720), "sheet");
  assert.equal(trayChrome(721), "panel");
  assert.equal(trayChrome(1280), "panel");

  assert.ok(index.includes('class="map-tray panel"'));
  assert.ok(index.includes("width:420px"));
  assert.ok(index.includes("function isDesktopTray("));
  assert.ok(index.includes("function resizeLiveMap("));
  assert.ok(index.includes("class=\"tray-x\"") || index.includes("class='tray-x'") || index.includes('class="tray-x"'));
  assert.ok(index.includes("tray-pills-full"));
  assert.ok(index.includes("desktop ? 'expanded' : 'peek'"));

  // Default (phone) rules stay a full-width bottom sheet. Do not change.
  const mobile = index.match(/\.map-tray\{([^}]+)\}/);
  assert.ok(mobile, "base .map-tray rule");
  assert.match(mobile[1], /left:0/);
  assert.match(mobile[1], /right:0/);
  assert.match(mobile[1], /bottom:0/);
  assert.match(mobile[1], /height:35%/);
  assert.ok(index.includes(".map-tray.expanded{height:90%;}"));
  assert.ok(index.includes(".map-tray.expanded .tray-peek{display:none;}"));
  assert.ok(index.includes(".map-tray:not(.expanded) .tray-full{display:none;}"));

  // Desktop media query is a FULL-HEIGHT left sidebar, not a 160px floating card.
  const deskStart = index.indexOf("/* Desktop: Google Maps WEB left column.");
  assert.ok(deskStart >= 0, "desktop column comment");
  const desk = index.slice(deskStart, deskStart + 4000);
  assert.ok(desk.includes("@media(min-width:721px)"));
  assert.ok(desk.includes("width:420px"));
  assert.ok(desk.includes("height:100%"));
  assert.ok(desk.includes("left:0"));
  assert.ok(desk.includes("right:auto"));
  assert.ok(desk.includes("top:0"));
  assert.ok(desk.includes("bottom:0"));
  assert.ok(desk.includes("border-radius:0"));
  assert.ok(!desk.includes("height:auto"));
  assert.ok(!desk.includes("max-height:calc(100% - 48px)"));
  assert.ok(desk.includes(".map-tray .tray-x{display:flex;}"));
  assert.ok(desk.includes(".map-tray .tray-handle{display:none;}"));
  assert.ok(desk.includes(".map-tray.open .tray-peek{display:none;}"));
  assert.ok(desk.includes(".map-tray.open .tray-full"));
  assert.ok(desk.includes("padding:0 var(--space-page)"));
  assert.ok(desk.includes("flex-direction:column"));
  assert.ok(desk.includes("#livemap{left:420px;}"));
  assert.ok(desk.includes("tray-expanded::after{display:none;}"));
  assert.ok(!desk.includes("left:0;right:0;bottom:0"));
});
