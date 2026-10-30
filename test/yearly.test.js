import test from "node:test";
import assert from "node:assert/strict";
import {
  seasonsText,
  cleanSeasons,
  parseSportSeasons,
  sportSeasonsJson,
  ordinal,
  partOfMonth,
  dateRange,
  seriesSlug,
  seriesState,
} from "../public/app/yearly.js";

test("seasons read the way a person says them", () => {
  assert.equal(seasonsText(["winter"]), "Winter");
  assert.equal(seasonsText(["fall", "summer"]), "Summer and fall");
  assert.equal(
    seasonsText(["winter", "spring", "fall"]),
    "Spring, fall and winter",
  );
  assert.equal(
    seasonsText(["spring", "summer", "fall", "winter"]),
    "Year-round",
  );
  assert.equal(seasonsText(["year-round"]), "Year-round");
  assert.equal(seasonsText([]), "");
  assert.deepEqual(cleanSeasons(["Winter", "monsoon", "winter"]), ["winter"]);
  assert.deepEqual(cleanSeasons(["year-round"]), [
    "spring",
    "summer",
    "fall",
    "winter",
  ]);
});

test("an organization's sports and seasons parse safely and keep their order", () => {
  const known = (k) => ["skiing", "sailing", "tennis"].includes(k);
  assert.deepEqual(
    parseSportSeasons(
      '{"skiing":["winter"],"sailing":["summer","nope"],"multi":["fall"],"made-up":[]}',
      known,
    ),
    [
      { key: "skiing", seasons: ["winter"] },
      { key: "sailing", seasons: ["summer"] },
    ],
  );
  assert.equal(parseSportSeasons("", known), null);
  assert.equal(parseSportSeasons("not json", known), null);
  assert.equal(parseSportSeasons('["skiing"]', known), null);
  assert.equal(parseSportSeasons('{"made-up":["winter"]}', known), null);
  assert.equal(
    sportSeasonsJson([
      { key: "skiing", seasons: ["winter"] },
      { key: "tennis", seasons: [] },
    ]),
    '{"skiing":["winter"],"tennis":[]}',
  );
  assert.equal(sportSeasonsJson([]), null);
});

test("numbers, months and date ranges", () => {
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 103].map(ordinal), [
    "1st",
    "2nd",
    "3rd",
    "4th",
    "11th",
    "12th",
    "13th",
    "21st",
    "22nd",
    "103rd",
  ]);
  assert.equal(ordinal(0), "");
  assert.equal(partOfMonth("2026-10-23"), "late October");
  assert.equal(partOfMonth("2026-10-11T14:00:00Z"), "mid October");
  assert.equal(partOfMonth("2026-03-02"), "early March");
  assert.equal(dateRange("2026-10-23", "2026-10-25"), "Oct 23 to 25, 2026");
  assert.equal(dateRange("2026-10-30", "2026-11-01"), "Oct 30 to Nov 1, 2026");
  assert.equal(
    dateRange("2026-12-30", "2027-01-02"),
    "Dec 30, 2026 to Jan 2, 2027",
  );
  assert.equal(dateRange("2026-10-23", null), "Oct 23, 2026");
  assert.equal(dateRange("2026-10-23", "2026-10-23"), "Oct 23, 2026");
  // A 7 pm Central start on Oct 31 is stored as Nov 1 in UTC; it still reads as its own day.
  assert.equal(
    dateRange("2026-11-01T00:00:00.000Z", "2026-11-01T03:00:00.000Z"),
    "Oct 31, 2026",
  );
  assert.equal(partOfMonth("2026-11-01T00:00:00Z"), "late October");
});

test("a yearly event's address leaves out the year and the count", () => {
  assert.equal(seriesSlug("3rd Annual Monster Smash 2026"), "monster-smash");
  assert.equal(seriesSlug("Spooky Spokes"), "spooky-spokes");
  assert.equal(
    seriesSlug("Third annual Ski & Snowboard Day"),
    "ski-and-snowboard-day",
  );
  assert.equal(seriesSlug("Café Classic"), "cafe-classic");
  assert.equal(seriesSlug("2026"), "");
});

const SPOKES = { first_year: 2024, usual_month: 10 };
const YEARS = [
  { starts_at: "2024-10-25", ends_at: "2024-10-27", status: "scheduled" },
  { starts_at: "2026-10-23", ends_at: "2026-10-25", status: "scheduled" },
  { starts_at: "2025-10-24", ends_at: "2025-10-26", status: "scheduled" },
];

test("between years, a yearly event says when it usually happens and that the next dates aren't out", () => {
  const s = seriesState(SPOKES, YEARS, new Date(2026, 10, 2)); // Nov 2, 2026
  assert.equal(s.next, null);
  assert.deepEqual(
    s.past.map((e) => e.starts_at.slice(0, 4)),
    ["2026", "2025", "2024"],
  );
  assert.equal(s.usual, "late October");
  assert.equal(s.since, 2024);
  assert.equal(s.lastNth, 3); // 2026 was the 3rd annual
  assert.equal(s.nextYear, 2027);
});

test("once next year's dates are set, they lead and the count goes on", () => {
  const s = seriesState(
    SPOKES,
    [
      ...YEARS,
      {
        starts_at: "2027-10-22",
        ends_at: "2027-10-24",
        url: "https://example.org/2027",
      },
    ],
    new Date(2027, 2, 1),
  );
  assert.equal(s.next.starts_at, "2027-10-22");
  assert.equal(s.nth, 4);
  assert.equal(s.past.length, 3);
});

test("on its days an event is happening, not next: no Register; then it's a past year; a cancelled year is skipped", () => {
  // Alec, 2026-10-25 evening, the last day: "This event already passed".
  const during = seriesState(SPOKES, YEARS, new Date(2026, 9, 25, 19, 51));
  assert.equal(during.next, null);
  assert.equal(during.now.starts_at, "2026-10-23");
  assert.equal(during.nowNth, 3);
  assert.equal(during.nextYear, 2027);
  assert.deepEqual(
    during.past.map((e) => e.starts_at.slice(0, 4)),
    ["2025", "2024"],
  );
  // The day before it starts, it is next.
  assert.equal(
    seriesState(SPOKES, YEARS, new Date(2026, 9, 22)).next.starts_at,
    "2026-10-23",
  );
  // The day after, it's history.
  assert.equal(
    seriesState(SPOKES, YEARS, new Date(2026, 9, 26)).past[0].starts_at,
    "2026-10-23",
  );
  const cancelled = seriesState(
    SPOKES,
    [...YEARS, { starts_at: "2027-10-22", status: "cancelled" }],
    new Date(2027, 2, 1),
  );
  assert.equal(cancelled.next, null);
  assert.equal(cancelled.nextYear, 2027);
});

test("without a first year there is no count, never a guess; without any dates, the usual month speaks", () => {
  const s = seriesState(
    { usual_month: 2 },
    [{ starts_at: "2026-02-14" }],
    new Date(2026, 5, 1),
  );
  assert.equal(s.lastNth, null);
  assert.equal(s.since, 2026);
  const blank = seriesState({ usual_month: 2 }, [], new Date(2026, 5, 1));
  assert.equal(blank.usual, "February");
  assert.equal(blank.nextYear, 2027);
  assert.equal(
    seriesState({ usual_month: 9 }, [], new Date(2026, 5, 1)).nextYear,
    2026,
  );
});
