// ASNM visual language.
// Real listing photo → keep it.
// Else the sport's photoreal action photo when we have one (Alec, 2026-09-15:
//   the cards show athletes, not the silhouette-object scene).
// Else a matching scene when we have one — that is now the no-photo fallback.
// Else the black stamp on a quiet paper card. Not the old sand block.

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

export const EMBLEM_KEYS = new Set([
  "athlete-grant", "program-grant", "event",
  "basketball", "tennis", "pickleball", "rugby", "football",
  "baseball", "cycling", "sledhockey", "skiing", "waterskiing",
  "goalball", "rowing", "swimming", "golf", "boccia", "volleyball",
  "climbing",
]);

export function emblemPath(key) {
  return key && EMBLEM_KEYS.has(key) ? `/emblems/${key}.png` : null;
}

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
  const shot = sportPhotoPath(item && item.sport);
  if (shot) return { kind: "photo", src: shot };
  const scene = scenePath(item && item.sport);
  if (scene) return { kind: "scene", src: scene };
  return { kind: "stamp", src: emblemPath(item && item.sport) || GENERIC_STAMP };
}

// Cover images carry the stamp they fall back to (index.html swaps it in on img error).
export function stampAttr(item, role = "program") {
  let key;
  if (role === "grant") key = item && item.audience === "program" ? "program-grant" : "athlete-grant";
  else if (role === "event") key = "event";
  else key = item && item.sport;
  return ` data-stamp="${emblemPath(key) || GENERIC_STAMP}"`;
}

export function isCoverVisual(v) {
  return !!(v && (v.kind === "photo" || v.kind === "scene") && v.src);
}
