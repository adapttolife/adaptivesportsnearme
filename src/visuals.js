// Locked ASNM visual language (Alec, 2026-08-21).
// Real listing photo → keep it.
// Else a matching ChatGPT photoreal scene when we have one.
// Else the black stamp on a quiet paper card. Not the old sand block.

export const SPORT_SCENES = {
  basketball: "/scenes/basketball-gym.png",
  cycling: "/scenes/cycling-road.png",
  skiing: "/scenes/skiing-mountain.png",
  baseball: "/scenes/baseball-diamond.png",
  boccia: "/scenes/boccia-court.png",
  climbing: "/scenes/climbing-gym.png",
  football: "/scenes/football-field.png",
  goalball: "/scenes/goalball-gym.png",
  golf: "/scenes/golf-fairway.png",
  rowing: "/scenes/rowing-lake.png",
  rugby: "/scenes/rugby-pitch.png",
  pickleball: "/scenes/pickleball-court.png",
  sledhockey: "/scenes/sledhockey-rink.png",
  swimming: "/scenes/swimming-pool.png",
  tennis: "/scenes/tennis-court.png",
  volleyball: "/scenes/volleyball-court.png",
  waterskiing: "/scenes/waterskiing-lake.png",
};

export const GRANT_TRACK_SCENE = "/scenes/grant-track.png";
export const PROGRAM_GRANT_SCENE = "/scenes/program-grant-gym.png";
export const EVENT_SCENE = "/scenes/event-field.png";

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

export function isCoverVisual(v) {
  return !!(v && (v.kind === "photo" || v.kind === "scene") && v.src);
}
