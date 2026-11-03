-- Reviewed 2026-11-03. Two confirmed wheelchair events from the 13-row brief.
-- Full evidence, held candidates and run/read-back instructions:
-- docs/data-fixes/wheelchair-tournaments-2026-2027.md
-- Insert-only; repeatable; never changes an existing, hidden or cancelled row.
-- Uses the existing events table, not organization/program listings. No migration.
-- Dates cover each whole tournament; the Las Vegas description gives wheelchair days.
-- Sources:
-- https://usapickleball.org/tournaments/usap-golden-ticket-las-vegas-2027/
-- https://pva.org/sports-recreation/pickleball/
-- https://events.blackthorn.io/en/Ho1cSeR7/2027-pva-wheelchair-pickleball-tournament-5a2FUi1TjM9/overview

WITH candidates (id, title, description, venue, city, state, url, starts_at, ends_at, alternate_url) AS (
  VALUES
    ('4e5606d8-3fd4-5b13-8f42-537dc05b96ca',
     'USA Pickleball Golden Ticket Las Vegas 2027',
     'Wheelchair coed doubles on February 26, coed singles on February 27, and hybrid on February 28. The full tournament runs February 23–28 at Sunset Park. USA Pickleball lists a $50 flat fee covering all wheelchair events, using code WC50 at checkout. Registration is through PickleballTournaments.com and closes February 15. A current USA Pickleball Challenger or Champion membership is required. Check the organizer page for final brackets, times and registration terms.',
     'Sunset Park Pickleball Complex', 'Las Vegas', 'NV',
     'https://pickleballtournaments.com/tournaments/usa-pickleball-golden-ticket-las-vegas-1',
     '2027-02-23', '2027-02-28',
     'https://usapickleball.org/tournaments/usap-golden-ticket-las-vegas-2027/'),
    ('cfee537a-7f69-588e-a0e4-898a73e7c090',
     'PVA Wheelchair Pickleball Tournament 2027',
     'An indoor wheelchair pickleball tournament for athletes of all experience levels. The organizer lists adaptive wheelchair, hybrid (one standing and one seated player), mixed wheelchair (one seated player and an ambulatory player playing seated), and a non-medal exhibition division with both ambulatory players seated. Team and individual registration options are available through PVA’s registration page. Bring a sports chair; a limited number are available to borrow. Check the organizer for fees and the final competition schedule.',
     'Midwest Orthopedic Specialty Hospital Performance Center', 'Franklin', 'WI',
     'https://events.blackthorn.io/en/Ho1cSeR7/2027-pva-wheelchair-pickleball-tournament-5a2FUi1TjM9/overview',
     '2027-04-24', '2027-04-25',
     'https://events.blackthorn.io/Ho1cSeR7/5a2FUi1TjM9')
), existing AS (
  SELECT *, lower(trim(title)) AS normalized_title,
    lower(rtrim(CASE WHEN instr(url, '?') > 0 THEN substr(url, 1, instr(url, '?') - 1) ELSE url END, '/')) AS normalized_url
  FROM events
)
INSERT INTO events
  (id, title, description, sport_key, venue, city, state, url, starts_at,
   ends_at, all_day, status, is_public, source, created_at, updated_at)
SELECT c.id, c.title, c.description, 'pickleball', c.venue, c.city, c.state,
  c.url, c.starts_at, c.ends_at, 1, 'scheduled', 1, 'admin',
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
FROM candidates c
WHERE NOT EXISTS (
  SELECT 1 FROM existing e
  WHERE e.id = c.id
    OR (substr(e.starts_at, 1, 4) = '2027' AND (
      e.normalized_url IN (lower(rtrim(c.url, '/')), lower(rtrim(c.alternate_url, '/')))
      OR (upper(trim(e.state)) = c.state AND lower(trim(e.city)) = lower(c.city)
        AND substr(e.starts_at, 1, 10) <= c.ends_at
        AND coalesce(nullif(substr(e.ends_at, 1, 10), ''), substr(e.starts_at, 1, 10)) >= c.starts_at
        AND (
        (c.state = 'NV' AND e.normalized_title LIKE '%golden ticket%' AND e.normalized_title LIKE '%las vegas%')
        OR (c.state = 'WI' AND e.normalized_title LIKE '%pva%' AND e.normalized_title LIKE '%wheelchair%' AND e.normalized_title LIKE '%pickleball%')
      ))
    ))
);
