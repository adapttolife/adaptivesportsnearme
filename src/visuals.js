// Locked ASNM visual language (Alec, 2026-08-21).
// Real listing photo → keep it.
// Else a matching ChatGPT photoreal scene when we have one.
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

export const GRANT_TRACK_SCENE = "/scenes/grant-track.jpg";
export const PROGRAM_GRANT_SCENE = "/scenes/program-grant-gym.jpg";
export const EVENT_SCENE = "/scenes/event-field.jpg";

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
    const scene = scenePath(item && item.sport);
    if (scene) return { kind: "scene", src: scene };
    return { kind: "scene", src: EVENT_SCENE };
  }
  const scene = scenePath(item && item.sport);
  if (scene) return { kind: "scene", src: scene };
  const stamp = emblemPath(item && item.sport);
  if (stamp) return { kind: "stamp", src: stamp };
  return { kind: "stamp", src: null };
}

// Cover images carry the stamp they fall back to (index.html swaps it in on img error).
export function stampAttr(item, role = "program") {
  let key;
  if (role === "grant") key = item && item.audience === "program" ? "program-grant" : "athlete-grant";
  else if (role === "event") key = "event";
  else key = item && item.sport;
  const p = emblemPath(key);
  return p ? ` data-stamp="${p}"` : "";
}

export function isCoverVisual(v) {
  return !!(v && (v.kind === "photo" || v.kind === "scene") && v.src);
}
