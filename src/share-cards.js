// Share cards: the picture a phone or a feed shows when someone sends a link to the site
// (og:image). Alec, 2026-10-17: "Let's design a new open graph image... let's level up",
// then "B: Four colours" for the home card and "Yes, every page" for the rest.
//
// Every card is built from the site's own parts (Laura Lian's four colours each paired
// with black, Alec's athlete drawings, Sofia Sans Extra Condensed caps, the mark) by
// scripts/og/build.mjs into public/og/. The words on a card are its page's headline, word
// for word. A sport page shows its sport, a state page its state, and a listing wears its
// sport's card with its own name in the link's title underneath.
import { SPORT_NAMES } from "./sport-names.js";
import "../public/listing-art.js";

const ListingArt = globalThis.ListingArt;

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;
export const HOME_CARD = "/og/home.png";
export const PAGE_CARDS = {
  grants: "/og/grants.png",
  events: "/og/events.png",
  "veteran-owned-businesses": "/og/veteran-owned-businesses.png",
};

/** A sport page's card; a key with no page of its own wears the multi-sport card. */
export const sportCard = (key) => `/og/sports/${SPORT_NAMES[key] ? key : "multi"}.png`;
export const stateCard = (st) => `/og/states/${st}.png`;
/** A listing wears the card of the sport its art shows (public/listing-art.js symbolKey). */
export const listingCard = (item) => sportCard(ListingArt.symbolKey(item) || "multi");
