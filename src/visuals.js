// ASNM visual language.
// Program listings: a real photo or logo of the program wins; otherwise the
// listing wears its sport's symbol on a tinted ground (public/listing-art.js,
// shared with the app so both renderers pick the same art). Alec, 2026-10-13:
// launch on symbols and icons, never wait on images.
// Grants and events keep their scenes and photos below.

import "../public/listing-art.js";

const ListingArt = globalThis.ListingArt;

export const SPORT_SCENES = {
  basketball: "/scenes/basketball-gym.jpg",
  cycling: "/scenes/cycling-road.jpg",
  skiing: "/scenes/skiing-mountain.jpg",
  baseball: "/scenes/baseball-diamond.jpg",
  boccia: "/scenes/boccia-court.jpg",
  climbing: "/scenes/climbing-gym.jpg",
  football: "/scenes/football-field.jpg",
  goalball: "/scenes/goalball-gym.jpg",
  golf: "/scenes/golf-fairway.jpg",
  rowing: "/scenes/rowing-lake.jpg",
  rugby: "/scenes/rugby-pitch.jpg",
  pickleball: "/scenes/pickleball-court.jpg",
  sledhockey: "/scenes/sledhockey-rink.jpg",
  swimming: "/scenes/swimming-pool.jpg",
  tennis: "/scenes/tennis-court.jpg",
  volleyball: "/scenes/volleyball-court.jpg",
  waterskiing: "/scenes/waterskiing-lake.jpg",
};

// The launch sports that have a real photoreal action photo on disk
// (public/assets/sport-photos). These win over the scene composite.
export const SPORT_PHOTOS = new Set([
  "basketball", "tennis", "pickleball", "rugby", "football", "baseball",
  "cycling", "sledhockey", "skiing", "waterskiing", "goalball",
]);

export const GRANT_TRACK_SCENE = "/scenes/grant-track.jpg";
export const PROGRAM_GRANT_SCENE = "/scenes/program-grant-gym.jpg";
export const EVENT_SCENE = "/scenes/event-field.jpg";

// No sport art (no scene, no emblem) and no photo: the house mark still gives the
// card a picture instead of an empty tile. 840 of 1,478 live orgs carry no sport.
export const GENERIC_STAMP = "/emblems/adaptive.svg";

export function scenePath(sport) {
  return (sport && SPORT_SCENES[sport]) || null;
}

export function sportPhotoPath(sport) {
  return sport && SPORT_PHOTOS.has(sport) ? `/assets/sport-photos/${sport}.jpg` : null;
}

// role: "program" | "grant" | "event"
export function listingVisual(item, role = "program") {
  if (item && item.photo) return { kind: "photo", src: item.photo };
  if (role === "grant") {
    if (item && item.audience === "program") {
      return { kind: "scene", src: PROGRAM_GRANT_SCENE };
    }
    return { kind: "scene", src: GRANT_TRACK_SCENE };
  }
  if (role === "event") {
    const shot = sportPhotoPath(item && item.sport);
    if (shot) return { kind: "photo", src: shot };
    const scene = scenePath(item && item.sport);
    if (scene) return { kind: "scene", src: scene };
    return { kind: "scene", src: EVENT_SCENE };
  }
  return programArt(item);
}

// { kind: "photo", src } for a program's own photo, else
// { kind: "symbol", src, key, tone }.
export function programArt(item) {
  const a = ListingArt.art(item || {});
  return a.kind === "photo"
    ? { kind: "photo", src: a.src }
    : { kind: "symbol", src: a.src, key: a.key, tone: a.tone };
}

// Cover images carry the stamp they fall back to (index.html swaps it in on img error).
export function stampAttr(item, role = "program") {
  if (role === "grant") return ` data-stamp="${ListingArt.GRANT_ART}"`;
  if (role === "event") return ` data-stamp="${ListingArt.EVENT_ART}"`;
  return ` data-stamp="${ListingArt.art({ ...(item || {}), photo: null }).src}"`;
}

// The symbol tile markup both server renderers use. `cls` is the frame class
// (pcard-media for cards, dhero for the listing hero).
export function symbolTile(v, cls, inner = "") {
  const tone = v && v.tone ? ` tone-${v.tone}` : "";
  const img = v && v.src ? `<img class="art-symbol" src="${v.src}" alt="" decoding="async">` : "";
  return `<div class="${cls} has-symbol${tone}">${img}${inner}</div>`;
}

export function isCoverVisual(v) {
  return !!(v && (v.kind === "photo" || v.kind === "scene") && v.src);
}
