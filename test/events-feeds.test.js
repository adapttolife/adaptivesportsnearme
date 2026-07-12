// events feed generator tests (Lane A) — pure functions only, no D1 mocking.
import test from "node:test";
import assert from "node:assert/strict";
import { eventsToRss, eventsToIcs } from "../src/events.js";

const SITE = "https://adaptivesportsnearme.com";

const BASIC = {
  id: "evt-1",
  title: "Adaptive Ski Day",
  description: "Sit ski and stand ski lessons on the mountain.",
  url: "https://example.org/ski-day",
  venue: "Winter Park Resort",
  city: "Winter Park",
  state: "CO",
  starts_at: "2026-12-05T17:00:00.000Z",
  ends_at: "2026-12-05T21:00:00.000Z",
  all_day: 0,
  created_at: "2026-11-01T12:00:00.000Z",
};

// title/description exercise every char the brief calls out: & < > " ' , ; \ and a newline.
const SPECIAL = {
  id: "evt-2",
  title: "Rugby & Racquets <Open> \"Play\" 'Day', Round 1\nSecond line",
  description: "Bring \\ your gear; RSVP by 5pm, seats < 20, \"limited\" & 'first come'.",
  url: null,
  venue: null,
  city: null,
  state: null,
  starts_at: "2026-09-20T14:30:00.000Z",
  ends_at: null,
  all_day: 0,
  created_at: "2026-08-01T00:00:00.000Z",
};

const ALL_DAY = {
  id: "evt-3",
  title: "Handcycle Century",
  description: "",
  url: null,
  venue: "Bear Creek Trail",
  city: "Lakewood",
  state: "CO",
  starts_at: "2026-09-05T00:00:00.000Z",
  ends_at: "2026-09-06T00:00:00.000Z",
  all_day: 1,
  created_at: "2026-07-01T00:00:00.000Z",
};

// ---- RSS 2.0 -----------------------------------------------------------------

test("eventsToRss: empty list still produces a valid, item-less channel", () => {
  const xml = eventsToRss([], SITE);
  assert.match(xml, /<rss version="2\.0">/);
  assert.match(xml, /<title>Adaptive Sports Near Me · Events<\/title>/);
  assert.doesNotMatch(xml, /<item>/);
});

test("eventsToRss: item link uses the event's own url when set", () => {
  const xml = eventsToRss([BASIC], SITE);
  assert.match(xml, /<link>https:\/\/example\.org\/ski-day<\/link>/);
});

test("eventsToRss: item link falls back to {siteUrl}/events when no event url", () => {
  const xml = eventsToRss([SPECIAL], SITE);
  assert.match(xml, /<link>https:\/\/adaptivesportsnearme\.com\/events<\/link>/);
});

test("eventsToRss: guid is the event id, not a permalink", () => {
  const xml = eventsToRss([BASIC], SITE);
  assert.match(xml, /<guid isPermaLink="false">evt-1<\/guid>/);
});

test("eventsToRss: pubDate is derived from created_at (RFC 822 via toUTCString)", () => {
  const xml = eventsToRss([BASIC], SITE);
  assert.match(xml, /<pubDate>Sun, 01 Nov 2026 12:00:00 GMT<\/pubDate>/);
});

test("eventsToRss: XML-escapes special characters in title and description", () => {
  const xml = eventsToRss([SPECIAL], SITE);
  assert.match(
    xml,
    /<title>Rugby &amp; Racquets &lt;Open&gt; &quot;Play&quot; &apos;Day&apos;, Round 1\nSecond line<\/title>/
  );
  assert.match(
    xml,
    /<description>Bring \\ your gear; RSVP by 5pm, seats &lt; 20, &quot;limited&quot; &amp; &apos;first come&apos;\.<\/description>/
  );
});

// ---- iCalendar (RFC 5545) ------------------------------------------------------

test("eventsToIcs: empty list still produces a valid, event-less calendar", () => {
  const ics = eventsToIcs([]);
  assert.equal(
    ics,
    "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Adaptive Sports Near Me//Events//EN\r\n" +
      "CALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:Adaptive Sports Near Me\r\nEND:VCALENDAR\r\n"
  );
});

test("eventsToIcs: uses CRLF line endings throughout, never a bare LF", () => {
  const ics = eventsToIcs([BASIC, ALL_DAY]);
  assert.ok(ics.includes("\r\n"));
  assert.ok(!/[^\r]\n/.test(ics), "found a bare LF not preceded by CR");
});

test("eventsToIcs: includes X-WR-CALNAME", () => {
  assert.match(eventsToIcs([]), /X-WR-CALNAME:Adaptive Sports Near Me/);
});

test("eventsToIcs: UID is {id}@adaptivesportsnearme.com", () => {
  const ics = eventsToIcs([BASIC]);
  assert.match(ics, /UID:evt-1@adaptivesportsnearme\.com/);
});

test("eventsToIcs: timed event — DTSTART/DTEND/DTSTAMP in UTC basic format", () => {
  const ics = eventsToIcs([BASIC]);
  assert.match(ics, /DTSTAMP:20261101T120000Z/);
  assert.match(ics, /DTSTART:20261205T170000Z/);
  assert.match(ics, /DTEND:20261205T210000Z/);
});

test("eventsToIcs: timed event — LOCATION composes venue, city, state; URL passes through", () => {
  const ics = eventsToIcs([BASIC]);
  assert.match(ics, /LOCATION:Winter Park Resort\\, Winter Park\\, CO/);
  assert.match(ics, /URL:https:\/\/example\.org\/ski-day/);
});

test("eventsToIcs: all-day event uses DTSTART;VALUE=DATE and an exclusive DTEND one day past ends_at", () => {
  const ics = eventsToIcs([ALL_DAY]);
  assert.match(ics, /DTSTART;VALUE=DATE:20260905/);
  assert.match(ics, /DTEND;VALUE=DATE:20260907/); // ends_at (9/6) + 1 day, RFC 5545 exclusive end
});

test("eventsToIcs: blank description and null url are omitted, not emitted empty", () => {
  const ics = eventsToIcs([ALL_DAY]);
  assert.ok(!ics.includes("DESCRIPTION:"));
  assert.ok(!ics.includes("URL:"));
});

test("eventsToIcs: escapes backslash, semicolon, comma and newline in text fields", () => {
  const ics = eventsToIcs([SPECIAL]);
  assert.match(ics, /SUMMARY:Rugby & Racquets <Open> "Play" 'Day'\\, Round 1\\nSecond line/);
  assert.match(
    ics,
    /DESCRIPTION:Bring \\\\ your gear\\; RSVP by 5pm\\, seats < 20\\, "limited" & 'first come'\./
  );
});
