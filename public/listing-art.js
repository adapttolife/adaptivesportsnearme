/* Listing art and trust lines, shared by the app (public/index.html loads this
   file) and the Worker (src/visuals.js imports it). No network or DOM.

   Why symbols (Alec, 2026-10-13: "How can we just launch and not get bottlenecked
   by images. Just use symbols and icons?"): a listing should never wait on a
   photo. Every program wears the 2026 Adapt To Life athlete holding its sport's
   prop (scripts/emblem-series.py), on a ground tinted by sport family. A real
   photo or logo of the program itself, once we have one, still wins.

   Stock action photos stay off listings by default: the same photo on every
   basketball card reads as a picture of each program. USE_SPORT_PHOTOS = true
   puts them back on the eleven launch sports without touching any renderer. */
globalThis.ListingArt = (() => {
  const USE_SPORT_PHOTOS = false;
  const SPORT_PHOTOS = new Set([
    'baseball', 'basketball', 'cycling', 'football', 'goalball', 'pickleball',
    'rugby', 'skiing', 'sledhockey', 'tennis', 'waterskiing'
  ]);

  // One file per symbol in public/emblems/athlete-<key>.svg.
  const SYMBOLS = [
    'art-therapy', 'baseball', 'basketball', 'boccia', 'climbing', 'cycling',
    'equine-therapy', 'football', 'goalball', 'golf', 'pickleball', 'rowing',
    'rugby', 'skiing', 'sledhockey', 'soccer', 'swimming', 'tennis',
    'veteran-meetup', 'volleyball', 'waterskiing'
  ];
  const HAS = new Set(SYMBOLS);

  // Older or narrower sport keys in the data that share a symbol.
  const KEY_ALIAS = {
    wheelchair_basketball: 'basketball', wheelchair_rugby: 'rugby',
    softball: 'baseball', kickball: 'baseball', beepbaseball: 'baseball',
    topsoccer: 'soccer', sled_hockey: 'sledhockey', water_skiing: 'waterskiing'
  };

  // Most listings carry a sport label but no key, so the label picks the symbol.
  // First match wins, so the order matters: sled hockey before hockey, water
  // ski before ski, baseball before ball games.
  const WORDS = [
    [/sled\s*hockey|para\s*ice\s*hockey|ice\s*sledge/i, 'sledhockey'],
    [/water\s*ski|wakeboard/i, 'waterskiing'],
    [/basketball/i, 'basketball'],
    [/pickleball/i, 'pickleball'],
    [/tennis/i, 'tennis'],
    [/rugby/i, 'rugby'],
    [/goalball/i, 'goalball'],
    [/baseball|softball|miracle\s*league|kickball|\bt-?ball\b/i, 'baseball'],
    [/soccer|futsal/i, 'soccer'],
    [/football/i, 'football'],
    [/volleyball/i, 'volleyball'],
    [/boccia|bocce/i, 'boccia'],
    [/\bski(?:ing|ers?|s)?\b|snowboard|snow\s*sports?|nordic|alpine/i, 'skiing'],
    [/cycl|\bbik(?:e|es|ing)\b|tandem/i, 'cycling'],
    [/\brow(?:ing|ers?)?\b|kayak|canoe|paddl|dragon\s*boat/i, 'rowing'],
    [/swim|aquatic/i, 'swimming'],
    [/\bgolf/i, 'golf'],
    [/climb/i, 'climbing'],
    [/equine|equestrian|horse|hippotherapy|therapeutic\s*riding/i, 'equine-therapy'],
    [/art\s*therap|creative\s*arts?/i, 'art-therapy'],
    [/meet\s*-?up|peer\s*support/i, 'veteran-meetup']
  ];

  // Ground colour by sport family (classes in public/styles.css).
  const FAMILY = {
    basketball: 'court', volleyball: 'court', boccia: 'court', goalball: 'court',
    tennis: 'racquet', pickleball: 'racquet',
    football: 'field', rugby: 'field', soccer: 'field', baseball: 'field',
    skiing: 'snow', sledhockey: 'snow',
    swimming: 'water', rowing: 'water', waterskiing: 'water',
    cycling: 'trail', climbing: 'trail', golf: 'trail',
    'equine-therapy': 'calm', 'art-therapy': 'calm', 'veteran-meetup': 'calm'
  };

  function fromWords(text) {
    const s = String(text || '');
    if (!s.trim()) return null;
    for (const [re, key] of WORDS) if (re.test(s)) return key;
    return null;
  }

  // The symbol a listing wears: its sport key, else its sport label, else its
  // name ("Lake Tahoe Adaptive Ski Club" filed as Multi-Sport), else none.
  function symbolKey(item) {
    if (!item) return null;
    const raw = item.sport ? String(item.sport).toLowerCase() : '';
    const key = KEY_ALIAS[raw] || raw;
    if (HAS.has(key)) return key;
    return fromWords(item.sportLabel) || fromWords(item.name);
  }

  // { kind: 'photo' | 'symbol', src, key, tone } for a program listing.
  function art(item) {
    if (item && item.photo) return { kind: 'photo', src: item.photo, key: null, tone: null };
    const key = symbolKey(item);
    if (USE_SPORT_PHOTOS && key && SPORT_PHOTOS.has(key)) {
      return { kind: 'photo', src: '/assets/sport-photos/' + key + '.jpg', key, tone: null };
    }
    return {
      kind: 'symbol',
      src: '/emblems/athlete' + (key ? '-' + key : '') + '.svg',
      key,
      tone: key ? FAMILY[key] : 'house'
    };
  }

  // ---- Trust: what a person has and has not confirmed ----------------------
  // "Verified" means a person checked the listing against an official source
  // (organizations.verification_status). Nothing else earns the word: not an
  // automatic website check, not a submission, not a directory import.
  function isVerified(item) {
    return !!item && item.verification === 'verified';
  }

  // The one trust line a card carries. Dates live on the listing page.
  function trustLine(item) {
    return isVerified(item)
      ? { cls: 'is-verified', text: 'Verified' }
      : { cls: 'is-unverified', text: 'Not yet verified' };
  }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  // "Oct 5, 2026", read in UTC so the server page and the app agree.
  function shortDate(iso) {
    const t = Date.parse(iso || '');
    if (!Number.isFinite(t)) return null;
    const d = new Date(t);
    return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
  }

  // "2026-09" → "September 2026"
  function monthLabel(ym) {
    const m = /^(\d{4})-(\d{2})/.exec(String(ym || ''));
    if (!m) return null;
    const i = Number(m[2]) - 1;
    return i >= 0 && i < 12 ? MONTHS_LONG[i] + ' ' + m[1] : null;
  }

  // The "not yet verified" sentence, given where the listing came from.
  function unverifiedText(sourceHtml, isResearch) {
    return isResearch
      ? 'We found this program in our own research and no one on our team has confirmed it yet. Check the website or call before you go.'
      : 'This listing comes from ' + (sourceHtml || 'a public directory') +
        ' and no one on our team has confirmed it yet. Check the website or call before you go.';
  }

  // Opening-day bar: a date on every listing, never a 0-100 score. last_ok_at is
  // the last time our automatic check reached the program's website; a listing
  // that has never been checked shows the day it entered the directory instead.
  function checkedLine(item) {
    const [label, value] = checkedRow(item);
    return label === 'Last checked' ? 'Last checked ' + value : value === 'Not checked yet' ? value : 'Listed ' + value;
  }
  // The same fact as a labelled row for the listing page: [label, value].
  function checkedRow(item) {
    const checked = shortDate(item && item.lastChecked);
    if (checked) return ['Last checked', checked];
    const listed = shortDate(item && item.listedAt);
    return listed ? ['Listed', listed + ' · not checked yet'] : ['Last checked', 'Not checked yet'];
  }

  // Where a listing came from, as a visitor may see it. Our own research files
  // (loader tags, CSV names, review piles, a teammate's name, Google Drive
  // links) are internal: they read as "Adaptive Sports Near Me research" and
  // never link anywhere. A public directory keeps its name and its link.
  const RESEARCH = 'Adaptive Sports Near Me research';
  const INTERNAL_NAME = /^csv-|\.csv\b|^karen\b|\bpile\b|builder web search|alec-approved|state research/i;
  const INTERNAL_HOST = /(^|\.)(drive|docs)\.google\.com$/i;
  function hostOf(url) {
    try { return new URL(url).hostname; } catch (_) { return ''; }
  }
  function isInternalSource(src) {
    if (!src) return false;
    return INTERNAL_NAME.test(String(src.name || '')) || INTERNAL_HOST.test(hostOf(src.url || ''));
  }
  function sourceLabel(name) {
    const s = String(name || '').trim();
    if (!s) return null;
    return INTERNAL_NAME.test(s) ? RESEARCH : s;
  }
  // { name, url } safe to show; url is null for anything internal.
  function publicSource(src) {
    if (!src || !String(src.name || '').trim()) return null;
    if (INTERNAL_NAME.test(String(src.name))) return { name: RESEARCH, url: null };
    // Only plain web links: never a javascript: or data: URL in an href.
    const url = /^https?:\/\//i.test(String(src.url || '')) && !INTERNAL_HOST.test(hostOf(src.url))
      ? src.url : null;
    return { name: String(src.name).trim(), url };
  }

  return {
    SYMBOLS, FAMILY, symbolKey, art, isVerified, trustLine,
    shortDate, monthLabel, checkedLine, checkedRow, unverifiedText, sourceLabel, isInternalSource, publicSource,
    RESEARCH
  };
})();
