/* Listing art and trust lines, shared by the app (public/index.html loads this
   file) and the Worker (src/visuals.js imports it). No network or DOM.

   Why symbols (Alec, 2026-10-13: "How can we just launch and not get bottlenecked
   by images. Just use symbols and icons?"): a listing should never wait on a
   photo. Every program wears its sport's image from Alec's flat vector set
   (public/emblems/sports, one file per sport key; see the README there), on a
   ground tinted by sport family. A real photo or logo of the program itself,
   once we have one, still wins.

   Stock action photos stay off listings by default: the same photo on every
   basketball card reads as a picture of each program. USE_SPORT_PHOTOS = true
   puts them back on the eleven launch sports without touching any renderer. */
globalThis.ListingArt = (() => {
  const USE_SPORT_PHOTOS = false;
  const SPORT_PHOTOS = new Set([
    'baseball', 'basketball', 'cycling', 'football', 'goalball', 'pickleball',
    'rugby', 'skiing', 'sledhockey', 'tennis', 'waterskiing'
  ]);

  // The sport keys in the D1 sports table (44) plus 'multi'.
  const SPORTS = [
    'amputeesports', 'archery', 'art-therapy', 'baseball', 'basketball', 'beepbaseball',
    'blindsports', 'boccia', 'climbing', 'curling', 'cycling', 'dance', 'equestrian',
    'equestrianvaulting', 'equine-therapy', 'fencing', 'football', 'goalball', 'golf',
    'handball', 'handcycling', 'lacrosse', 'martialarts', 'multi', 'nordicskiing',
    'pickleball', 'powerlifting', 'rowing', 'rugby', 'running', 'sailing', 'shooting',
    'skiing', 'sledhockey', 'soccer', 'softball', 'surfing', 'swimming', 'tennis',
    'trackfield', 'triathlon', 'veteran-meetup', 'volleyball', 'waterskiing',
    'wheelchairracing'
  ];
  const IS_SPORT = new Set(SPORTS);

  // Alec's flat vector set: public/emblems/sports/<key>.svg (+ .png). 'grant'
  // and 'event' are in the same folder for grant and event cards.
  const ART = [
    'amputeesports', 'archery', 'art-therapy', 'baseball', 'basketball', 'beepbaseball',
    'boccia', 'climbing', 'curling', 'cycling', 'dance', 'equestrian', 'fencing', 'football',
    'goalball', 'golf', 'handball', 'lacrosse', 'martialarts', 'multi', 'nordicskiing',
    'pickleball', 'powerlifting', 'rowing', 'rugby', 'running', 'sailing', 'shooting',
    'skiing', 'sledhockey', 'soccer', 'softball', 'swimming', 'tennis', 'trackfield',
    'triathlon', 'veteran-meetup', 'volleyball', 'waterskiing'
  ];
  const HAS_ART = new Set(ART);
  // A sport without its own image borrows the closest one (Alec, 2026-10-14:
  // handcycling shares cycling, wheelchair racing shares track and field; vaulting
  // and surfing get none of their own).
  const ART_ALIAS = {
    handcycling: 'cycling', wheelchairracing: 'trackfield', equestrianvaulting: 'equestrian',
    'equine-therapy': 'equestrian', blindsports: 'goalball'
  };
  // Older athlete + prop symbols (scripts/emblem-series.py) for any sport the
  // flat set does not cover: public/emblems/athlete-<key>.svg. None needed now.
  const SYMBOLS = [];
  const HAS_OLD = new Set(SYMBOLS);
  const artSrc = (k) => '/emblems/sports/' + k + '.svg';

  // Older or narrower sport keys in the data.
  const KEY_ALIAS = {
    wheelchair_basketball: 'basketball', wheelchair_rugby: 'rugby', kickball: 'baseball',
    topsoccer: 'soccer', sled_hockey: 'sledhockey', water_skiing: 'waterskiing',
    track_and_field: 'trackfield', martial_arts: 'martialarts'
  };

  // Most listings carry a sport label but no key, so the label picks the sport.
  // First match wins, so the order matters: sled hockey before hockey, water
  // ski before ski, beep baseball before baseball, softball before baseball.
  const WORDS = [
    [/sled\s*hockey|sledge|para\s*ice\s*hockey|ice\s*sled/i, 'sledhockey'],
    [/water\s*-?\s*ski|wakeboard/i, 'waterskiing'],
    [/wheelchair\s*racing|racing\s*chair/i, 'wheelchairracing'],
    [/hand\s*cycl/i, 'handcycling'],
    [/nordic|cross[- ]country\s*ski|biathlon/i, 'nordicskiing'],
    [/\bski(?:ing|ers?|s)?\b|snowboard|snow\s*sports?|alpine/i, 'skiing'],
    [/beep\s*-?\s*baseball/i, 'beepbaseball'],
    [/basketball/i, 'basketball'],
    [/pickleball/i, 'pickleball'],
    [/tennis/i, 'tennis'],
    [/rugby/i, 'rugby'],
    [/goalball/i, 'goalball'],
    [/softball/i, 'softball'],
    [/baseball|miracle\s*league|\bt-?ball\b|kickball/i, 'baseball'],
    [/soccer|futsal/i, 'soccer'],
    [/football/i, 'football'],
    [/volleyball/i, 'volleyball'],
    [/boccia|bocce/i, 'boccia'],
    [/handball/i, 'handball'],
    [/lacrosse/i, 'lacrosse'],
    [/curling/i, 'curling'],
    [/\bfenc/i, 'fencing'],
    [/archery/i, 'archery'],
    [/shooting|\brifle|\bpistol|trap\s*shoot/i, 'shooting'],
    [/powerlift|weight\s*-?\s*lift/i, 'powerlifting'],
    [/triathlon|paratri|duathlon/i, 'triathlon'],
    [/track|field\s*events|javelin|discus|shot\s*put/i, 'trackfield'],
    [/running|marathon|\brun\b|\b5k\b|road\s*race|\bachilles\b/i, 'running'],
    [/cycl|\bbik(?:e|es|ing)\b|tandem/i, 'cycling'],
    [/\brow(?:ing|ers?)?\b|kayak|canoe|paddl|dragon\s*boat/i, 'rowing'],
    [/\bsail/i, 'sailing'],
    [/surf/i, 'surfing'],
    [/swim|aquatic/i, 'swimming'],
    [/\bgolf/i, 'golf'],
    [/climb/i, 'climbing'],
    [/equine\s*therap|equine[- ]assisted/i, 'equine-therapy'],
    [/equestrian|therapeutic\s*riding|\briding\b|horse|hippotherapy/i, 'equestrian'],
    [/art\s*therap|creative\s*arts?/i, 'art-therapy'],
    [/meet\s*-?up|peer\s*support/i, 'veteran-meetup'],
    [/martial|karate|judo|taekwondo|jiu[- ]?jitsu|self[- ]defen|boxing/i, 'martialarts'],
    [/\bdanc/i, 'dance'],
    [/amputee/i, 'amputeesports'],
    [/\bblind|visually\s*impaired/i, 'blindsports']
  ];

  // Ground colour by sport family (classes in public/styles.css).
  const FAMILY = {
    basketball: 'court', volleyball: 'court', boccia: 'court', goalball: 'court',
    handball: 'court', curling: 'court', fencing: 'court', martialarts: 'court',
    dance: 'court', powerlifting: 'court', blindsports: 'court',
    tennis: 'racquet', pickleball: 'racquet',
    football: 'field', rugby: 'field', soccer: 'field', baseball: 'field', softball: 'field',
    beepbaseball: 'field', lacrosse: 'field', archery: 'field', shooting: 'field',
    trackfield: 'field', running: 'field', wheelchairracing: 'field', amputeesports: 'field',
    skiing: 'snow', sledhockey: 'snow', nordicskiing: 'snow',
    swimming: 'water', rowing: 'water', waterskiing: 'water', sailing: 'water', surfing: 'water',
    cycling: 'trail', handcycling: 'trail', triathlon: 'trail', climbing: 'trail', golf: 'trail',
    equestrian: 'calm', equestrianvaulting: 'calm',
    'equine-therapy': 'calm', 'art-therapy': 'calm', 'veteran-meetup': 'calm'
  };

  function fromWords(text) {
    const s = String(text || '');
    if (!s.trim()) return null;
    for (const [re, key] of WORDS) if (re.test(s)) return key;
    return null;
  }

  // The sport a listing is filed under: its sport key, else its sport label,
  // else its name ("Lake Tahoe Adaptive Ski Club" filed as Multi-Sport), else
  // null (a multi-sport program).
  function symbolKey(item) {
    if (!item) return null;
    const raw = item.sport ? String(item.sport).toLowerCase() : '';
    const key = KEY_ALIAS[raw] || raw;
    if (IS_SPORT.has(key) && key !== 'multi') return key;
    return fromWords(item.sportLabel) || fromWords(item.name);
  }

  // The image file for a sport key: its own flat image, a borrowed one, an
  // older symbol, else the multi-sport image. Never an empty tile.
  function symbolSrc(key) {
    if (key && HAS_ART.has(key)) return artSrc(key);
    if (key && ART_ALIAS[key]) return artSrc(ART_ALIAS[key]);
    if (key && HAS_OLD.has(key)) return '/emblems/athlete-' + key + '.svg';
    return artSrc('multi');
  }

  // { kind: 'photo' | 'symbol', src, key, tone } for a program listing.
  function art(item) {
    if (item && item.photo) return { kind: 'photo', src: item.photo, key: null, tone: null };
    const key = symbolKey(item);
    if (USE_SPORT_PHOTOS && key && SPORT_PHOTOS.has(key)) {
      return { kind: 'photo', src: '/assets/sport-photos/' + key + '.jpg', key, tone: null };
    }
    return { kind: 'symbol', src: symbolSrc(key), key, tone: (key && FAMILY[key]) || 'house' };
  }

  // Grant and event cards.
  const GRANT_ART = artSrc('grant');
  const EVENT_ART = artSrc('event');

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

  // The sentences under "Verified." / "Not yet verified." on a listing page.
  // Only say where a listing came from when we know; the app draws the sheet
  // before the record's sources arrive, so "unknown" must read true as well.
  function verifiedText(monthText) {
    return 'A person on our team checked this program against an official source' +
      (monthText ? ' in ' + monthText : '') + '. Schedules change, so check the website before you go.';
  }
  function unverifiedText(sourceHtml, isResearch) {
    if (isResearch) {
      return 'We found this program in our own research, and no one on our team has confirmed it yet. Check the website or call before you go.';
    }
    if (sourceHtml) {
      return 'This listing comes from ' + sourceHtml +
        ', and no one on our team has confirmed it yet. Check the website or call before you go.';
    }
    return 'No one on our team has confirmed this listing yet. Check the website or call before you go.';
  }

  // Opening-day bar: a date on every listing, never a 0-100 score. last_ok_at is
  // the last time our automatic check reached the program's website; a listing
  // that has never been checked shows the day it entered the directory instead.
  // The date row for the listing page: [label, value].
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
    SPORTS, ART, ART_ALIAS, SYMBOLS, FAMILY, symbolKey, symbolSrc, art, GRANT_ART, EVENT_ART, isVerified, trustLine,
    shortDate, monthLabel, checkedRow, verifiedText, unverifiedText, sourceLabel, isInternalSource, publicSource,
    RESEARCH
  };
})();
