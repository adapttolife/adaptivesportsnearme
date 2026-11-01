/* Shared helpers for the site: state names, place parsing, small text tools.
   Loaded as a classic script before app.js (window.Proto). No framework. */
(function () {
  const STATE_NAMES = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    DC: "District of Columbia",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
  };
  // First three ZIP digits → state (USPS allocations; enough to place a visitor).
  const ZIP3 = [
    [10, 27, "MA"],
    [28, 29, "RI"],
    [30, 38, "NH"],
    [39, 49, "ME"],
    [50, 59, "VT"],
    [60, 69, "CT"],
    [70, 89, "NJ"],
    [100, 149, "NY"],
    [150, 196, "PA"],
    [197, 199, "DE"],
    [200, 200, "DC"],
    [201, 201, "VA"],
    [202, 205, "DC"],
    [206, 219, "MD"],
    [220, 246, "VA"],
    [247, 268, "WV"],
    [270, 289, "NC"],
    [290, 299, "SC"],
    [300, 319, "GA"],
    [320, 349, "FL"],
    [350, 369, "AL"],
    [370, 385, "TN"],
    [386, 397, "MS"],
    [398, 399, "GA"],
    [400, 427, "KY"],
    [430, 459, "OH"],
    [460, 479, "IN"],
    [480, 499, "MI"],
    [500, 528, "IA"],
    [530, 549, "WI"],
    [550, 567, "MN"],
    [570, 577, "SD"],
    [580, 588, "ND"],
    [590, 599, "MT"],
    [600, 629, "IL"],
    [630, 658, "MO"],
    [660, 679, "KS"],
    [680, 693, "NE"],
    [700, 714, "LA"],
    [716, 729, "AR"],
    [730, 749, "OK"],
    [750, 799, "TX"],
    [800, 816, "CO"],
    [820, 831, "WY"],
    [832, 838, "ID"],
    [840, 847, "UT"],
    [850, 865, "AZ"],
    [870, 884, "NM"],
    [885, 885, "TX"],
    [889, 898, "NV"],
    [900, 961, "CA"],
    [967, 968, "HI"],
    [970, 979, "OR"],
    [980, 994, "WA"],
    [995, 999, "AK"],
  ];
  const BIG_CITIES = {
    "new york": "NY",
    "los angeles": "CA",
    chicago: "IL",
    houston: "TX",
    phoenix: "AZ",
    philadelphia: "PA",
    "san antonio": "TX",
    "san diego": "CA",
    dallas: "TX",
    austin: "TX",
    jacksonville: "FL",
    "fort worth": "TX",
    columbus: "OH",
    charlotte: "NC",
    indianapolis: "IN",
    "san francisco": "CA",
    seattle: "WA",
    denver: "CO",
    nashville: "TN",
    boston: "MA",
    detroit: "MI",
    portland: "OR",
    "las vegas": "NV",
    memphis: "TN",
    louisville: "KY",
    baltimore: "MD",
    milwaukee: "WI",
    albuquerque: "NM",
    tucson: "AZ",
    atlanta: "GA",
    miami: "FL",
    tampa: "FL",
    orlando: "FL",
    minneapolis: "MN",
    "st. louis": "MO",
    "saint louis": "MO",
    "kansas city": "MO",
    cleveland: "OH",
    pittsburgh: "PA",
    raleigh: "NC",
    richmond: "VA",
    "salt lake city": "UT",
    boise: "ID",
    omaha: "NE",
    "new orleans": "LA",
    birmingham: "AL",
    madison: "WI",
    "green bay": "WI",
    evanston: "IL",
    naperville: "IL",
    rockford: "IL",
    springfield: "IL",
    "des moines": "IA",
    anchorage: "AK",
    honolulu: "HI",
    sacramento: "CA",
    "oklahoma city": "OK",
    tulsa: "OK",
    charleston: "SC",
  };

  const FAMILY_LABEL = {
    basketball: "Basketball",
    tennis: "Tennis",
    pickleball: "Pickleball",
    rugby: "Rugby",
    football: "Football",
    baseball: "Baseball and softball",
    soccer: "Soccer",
    volleyball: "Volleyball",
    goalball: "Goalball",
    boccia: "Boccia",
    skiing: "Skiing and snow sports",
    sledhockey: "Sled hockey",
    waterskiing: "Water skiing",
    rowing: "Rowing and paddling",
    swimming: "Swimming",
    cycling: "Cycling",
    golf: "Golf",
    climbing: "Climbing",
    "equine-therapy": "Equine therapy",
    "art-therapy": "Art therapy",
    "veteran-meetup": "Veteran meetups",
    track: "Track and running",
    archery: "Archery",
    sailing: "Sailing and surfing",
    curling: "Curling",
    bowling: "Bowling",
    fencing: "Fencing",
    multi: "Multi-sport and recreation",
  };
  const EXTRA = [
    [/track|running|marathon|\brun\b|triathlon|paratri/i, "track"],
    [/archery/i, "archery"],
    [/sail|surf/i, "sailing"],
    [/curling/i, "curling"],
    [/bowling/i, "bowling"],
    [/fenc/i, "fencing"],
  ];

  function familyOf(p) {
    const k = window.ListingArt ? window.ListingArt.symbolKey(p) : null;
    if (k) return k;
    const text = (p.sportLabel || "") + " " + (p.name || "");
    for (const [re, key] of EXTRA) if (re.test(text)) return key;
    return "multi";
  }

  function esc(s) {
    return s == null
      ? ""
      : String(s).replace(
          /[&<>"']/g,
          (c) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[c],
        );
  }

  function cleanCity(city) {
    if (!city) return null;
    const c = String(city).trim();
    if (!c || /^statewide$/i.test(c)) return null;
    return c.length > 34 ? c.split(/[,/–(]/)[0].trim() : c;
  }

  function place(p) {
    const city = cleanCity(p.city);
    const st = p.state;
    if (city && st) return city + ", " + st;
    if (st)
      return (
        (STATE_NAMES[st] || st) +
        (p.geoPrecision === "state" ? " · statewide" : "")
      );
    return "Nationwide";
  }

  function host(u) {
    try {
      return new URL(u).hostname.replace(/^www\./, "");
    } catch (_) {
      return null;
    }
  }

  // "Chicago", "Chicago, IL", "60614", "Illinois", "IL" → { state, city, label }
  function parsePlace(q, items) {
    const raw = String(q || "").trim();
    if (!raw) return null;
    const zip = raw.match(/^\d{5}/);
    if (zip) {
      const n = Number(zip[0].slice(0, 3));
      const hit = ZIP3.find(([a, b]) => n >= a && n <= b);
      return hit ? { state: hit[2], city: null, label: zip[0] } : null;
    }
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const up = raw.toUpperCase();
    if (STATE_NAMES[up])
      return { state: up, city: null, label: STATE_NAMES[up] };
    const byName = Object.entries(STATE_NAMES).find(
      ([, n]) => n.toLowerCase() === raw.toLowerCase(),
    );
    if (byName) return { state: byName[0], city: null, label: byName[1] };
    let city = parts[0],
      st = parts[1] ? parts[1].toUpperCase().slice(0, 2) : null;
    if (st && !STATE_NAMES[st]) {
      const n = Object.entries(STATE_NAMES).find(
        ([, nm]) => nm.toLowerCase() === parts[1].toLowerCase(),
      );
      st = n ? n[0] : null;
    }
    if (!st) st = BIG_CITIES[city.toLowerCase()] || null;
    if (!st) {
      const counts = {};
      for (const p of items)
        if (
          p.city &&
          p.state &&
          p.city.toLowerCase().includes(city.toLowerCase())
        )
          counts[p.state] = (counts[p.state] || 0) + 1;
      st = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || null;
    }
    if (!st) return null;
    const nice = city.replace(/\b\w/g, (c) => c.toUpperCase());
    return { state: st, city: nice, label: nice + ", " + st };
  }

  const byTrust = (a, b) =>
    b.verified - a.verified || a.name.localeCompare(b.name);

  // The honest "near": your city first, then the rest of your state, then
  // programs in your state with no city on file. No invented distances.
  function groupFor(where, items, family) {
    const pool = items.filter(
      (p) => p.state === where.state && (!family || p.family === family),
    );
    const cityRe = where.city
      ? new RegExp(where.city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
      : null;
    const inCity = cityRe
      ? pool.filter((p) => p.city && cityRe.test(p.city)).sort(byTrust)
      : [];
    const rest = pool
      .filter((p) => !inCity.includes(p) && cleanCity(p.city))
      .sort(byTrust);
    const noCity = pool
      .filter((p) => !inCity.includes(p) && !cleanCity(p.city))
      .sort(byTrust);
    return {
      total: pool.length,
      verified: pool.filter((p) => p.verified).length,
      inCity,
      rest,
      noCity,
    };
  }

  window.Proto = {
    esc,
    place,
    host,
    parsePlace,
    groupFor,
    cleanCity,
    STATE_NAMES,
    FAMILY_LABEL,
    byTrust,
  };
})();
