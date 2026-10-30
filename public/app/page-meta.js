/* Every page's title and description, in one place (Alec, 2026-10-18: "be intentional
   about every bit of content"). The Worker (src/pages.js) writes them for crawlers and
   link previews; the page (public/app/views/*.js) sets the same words once it loads.
   Titles here are short; site() adds " · Adaptive Sports Near Me". No DOM, no fetch:
   both sides import this file. */

import { GUIDES } from "./sport-guides.js";

export const SITE = "Adaptive Sports Near Me";
export const site = (title) => `${title} · ${SITE}`;

/** The product line: how to use the site and what to expect. The footer says it too. */
export const PRODUCT_LINE =
  "Find adaptive sports programs, grants and events by place or sport. Free, no account needed. Every listing shows when we last checked it.";

const CHECKED = "Every listing shows when we last checked it.";

export const HOME = {
  title: `${SITE}: find your place in adaptive sports`,
  description: PRODUCT_LINE,
};

export const PAGES = {
  sports: {
    title: "Sports",
    description:
      "Pick a sport to see its programs, grants and events, and how to get started.",
  },
  states: {
    title: "States",
    description:
      "Pick a state to see its adaptive sports programs, city by city.",
  },
  organizations: {
    title: "Organizations",
    description:
      "Every organization in the directory, and the programs it runs.",
  },
  programs: {
    title: "Programs",
    description:
      "Every program in the directory, with the organization that runs it.",
  },
  blog: {
    title: "Blog",
    description:
      "Stories, updates and guides from the adaptive sports community.",
  },
  grants: {
    title: "Grants",
    description:
      "Money for adaptive sports gear, travel and fees, for athletes and organizations. You apply on the grant maker's site.",
  },
  events: {
    title: "Events",
    description:
      "Adaptive sports clinics, tryouts, games and meetups. A person checks every event before it goes up.",
  },
  addProgram: {
    title: "Add a program",
    description:
      "Tell us about an adaptive sports program we're missing. A person checks it before it goes up.",
  },
  addOrganization: {
    title: "Add an organization",
    description:
      "Tell us about an organization that runs adaptive sports programs. A person checks it before it goes up.",
  },
  addEvent: {
    title: "Add an event",
    description:
      "Tell us about a clinic, tryout, game or meetup. A person checks it before it goes up.",
  },
  manage: {
    title: "Manage your organization",
    description: "Sign in to review and update your organization's details.",
  },
  admin: {
    title: "Admin",
    description: "Administrative tools for Adaptive Sports Near Me.",
  },
  account: {
    title: "Saved items",
    description: "Save organizations, programs, events and grants for later.",
  },
  update: {
    title: "Suggest a fix",
    description: "Tell us what to fix on a listing. A person reads every note.",
  },
  help: {
    title: "Help build this",
    description:
      "Add a program or an event, suggest a fix, or confirm your organization's listing.",
  },
  about: {
    title: "How we check listings",
    description:
      "What Verified, Checked by our team and Not verified yet mean, and how we keep every listing current.",
  },
  guides: {
    title: "Guides",
    description:
      "Every adaptive sport explained, and help beyond sports, like veteran-owned business directories by state.",
  },
  veteranBusinesses: {
    title: "Support Veteran-Owned Businesses",
    description:
      "Find veteran-owned businesses in your state, with directories for all 50 states and nationwide.",
  },
  build: {
    title: "Build with us",
    description:
      "Adaptive Sports Near Me is open source. See where we're going, share an idea, and help build tools for the adaptive sports community.",
  },
  letter: {
    title: "Get updates by email",
    description:
      "New programs, grants and events by email, only when there's something worth sending.",
  },
  letterConfirmed: {
    title: "You're on the list",
    description:
      "New programs, grants and events by email, only when there's something worth sending.",
  },
  privacy: {
    title: "Privacy policy",
    description:
      "What Adaptive Sports Near Me collects, why, and the choices you have.",
  },
  terms: {
    title: "Terms of use",
    description:
      "The terms for using Adaptive Sports Near Me, a free directory run by Adapt To Life.",
  },
  placeNotFound: {
    title: "We couldn't find that place",
    description: "Search by city and state, or a 5-digit ZIP code.",
  },
  notFound: {
    title: "Page not found",
    description:
      "That page isn't here. Search adaptive sports near you instead.",
  },
  listingNotFound: {
    title: "Listing not found",
    description: "It may have been removed or merged with another listing.",
  },
  grantNotFound: {
    title: "Grant not found",
    description: "It may have been removed or renamed.",
  },
  seriesNotFound: {
    title: "Event not found",
    description:
      "It may have been removed or renamed. See every event, dated and yearly.",
  },
};

/** /near/<place>. sport: { name, low } or null. */
export function nearMeta(place, sport, miles = 25) {
  return {
    title: `${sport ? sport.name : "Programs"} near ${place}`,
    description: `Adaptive ${sport ? sport.low : "sports"} programs near ${place}: in town first, then within about ${miles} miles, then across the state.`,
  };
}

/** /sports/<key>, optionally narrowed to a state. The description opens with the first
    sentence of the sport's guide (public/app/sport-guides.js), when it has one. */
export function sportMeta({ key, name, low, state = "" }) {
  const lead = GUIDES[key] ? GUIDES[key].what.split(/(?<=\.)\s+/)[0] : "";
  return {
    title: `${name}${state ? ` in ${state}` : ""}: adaptive programs, grants and events`,
    description: `${lead ? lead + " " : ""}Find adaptive ${low} programs, grants and events ${state ? `in ${state}` : "near you"}. ${CHECKED}`,
  };
}

/** /states/<st>, optionally narrowed to a sport (lower-case name). */
export function stateMeta(state, sportLow = "") {
  return {
    title: `Adaptive ${sportLow || "sports"} in ${state}`,
    description: `Adaptive ${sportLow || "sports"} programs, grants and events in ${state}, city by city. ${CHECKED}`,
  };
}

/** /organizations/<id>. sport: its label ("Wheelchair basketball"); place: "Tampa, FL" or "Florida". */
export function organizationMeta({ name, sport, place = "" }) {
  const where = place ? ` in ${place}` : "";
  return {
    title: `${name}: ${sport}${where}`,
    description: `${name}${where}. ${sport}. See its website, when we last checked it, and suggest a fix.`,
  };
}

/** /programs/<id>. */
export function programMeta({ name, sport, place = "" }) {
  return {
    title: name,
    description: `${name}. ${sport}${place ? ` in ${place}` : ""}.`,
  };
}

/** /grants/<id>. */
export function grantMeta({ name, source = "" }) {
  return {
    title: `${name}${source ? `, from ${source}` : ""}`,
    description: `${name}: an adaptive sports grant${source ? ` from ${source}` : ""}. See who can apply, the amount, the deadline and how to apply.`,
  };
}

/** /events/<slug>, a yearly event. sport: its name ("Pickleball"); host: who runs it; place: "Cincinnati, OH";
    usual: "late October" (public/app/yearly.js seriesState). */
export function seriesMeta({
  name,
  sport = "",
  host = "",
  place = "",
  usual = "",
}) {
  const what = `a yearly ${sport ? `adaptive ${sport.toLowerCase()} ` : "adaptive sports "}event`;
  return {
    title: `${name}${place ? `, ${place}` : ""}`,
    description: `${name} is ${what}${host ? ` hosted by ${host}` : ""}${place ? ` in ${place}` : ""}${usual ? `, usually in ${usual}` : ""}. See the next dates, past years and where to register.`,
  };
}
