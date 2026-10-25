-- Spooky Spokes: the first yearly event page (docs/specs/programs-that-come-back.md).
-- Needs db/migrations/0015_programs_that_come_back.sql first. Safe to run twice
-- (fixed ids, INSERT OR IGNORE). Adds The Pickle Lodge (the host), Spooky Spokes
-- (a program with kind 'event') and its three years. Changes nothing else.
-- Links only, never athletes' names (Alec, 2026-10-25).
--
-- Sources, checked 2026-10-25:
--   1st annual, Oct 2024: https://local12.com/news/local/pickle-lodge-pickleball-wheelchair-tournament-disabled-competition-sport-ball-tennis-single-double-hybrid-winner-food-drink-event-ticket
--   2nd annual, Oct 2025: https://www.local12.com/news/local/pickle-lodge-hosts-second-annual-wheelchair-pickleball-tournament
--   Monster Smash pages with dates and venues: https://pickleballtournaments.com/tournaments/monster-smash-2024 ,
--     .../monster-smash-2025 , .../monster-smash-2026-a-frighteningly-fun-tournament
--   Host: https://thepicklelodge.com (Lunken Landing, Cincinnati; North Shore, West Chester; Factory 52, Norwood)
-- Monster Smash itself began in 2020 (7th annual in 2026); Spooky Spokes, its wheelchair
-- division, began in 2024, so 2026 was its 3rd.
-- If The Pickle Lodge is already in the directory under another id, point the
-- program's organization_id at that id instead and skip the organization row.
--
-- npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/maintenance/yearly_spooky_spokes.sql
-- npx wrangler d1 execute asnm-db --config wrangler.json --remote --file db/maintenance/yearly_spooky_spokes.sql

INSERT OR IGNORE INTO organizations
  (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description,
   verification_status, status, is_public, created_at, updated_at)
VALUES
  ('5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e00', 'The Pickle Lodge', 'Pickleball club', 'Pickleball', 'pickleball', '["pickleball"]',
   'https://thepicklelodge.com', 'Cincinnati', 'OH', 'Ohio', 'United States',
   'The Pickle Lodge is a pickleball club with three locations in the Cincinnati area. Every October it hosts Spooky Spokes, the wheelchair division of its Monster Smash tournament.',
   'unverified', 'active', 1, '2026-10-25T00:00:00.000Z', '2026-10-25T00:00:00.000Z');

INSERT OR IGNORE INTO programs
  (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, description,
   kind, listing, usual_month, first_year, slug, verification_status, status, is_public, created_at, updated_at)
VALUES
  ('5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e01', '5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e00', 'Spooky Spokes', 'Pickleball', 'pickleball',
   'https://thepicklelodge.com/blogs/programming-at-the-pickle-lodge/tournaments', 'Cincinnati', 'OH', 'Ohio',
   'Spooky Spokes is the wheelchair division of Monster Smash, The Pickle Lodge''s Halloween pickleball tournament in the Cincinnati area. It has wheelchair singles and doubles, plus hybrid doubles that pair a wheelchair player with a standing partner, and is run with the US Wheelchair Pickleball Association.',
   'event', 'own', 10, 2024, 'spooky-spokes', 'unverified', 'active', 1, '2026-10-25T00:00:00.000Z', '2026-10-25T00:00:00.000Z');

INSERT OR IGNORE INTO events
  (id, title, description, org_id, sport_key, venue, city, state, url, starts_at, ends_at, all_day, status, is_public, source, created_at, updated_at, program_id, recap_url)
VALUES
  ('5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e24', 'Spooky Spokes 2024', '', '5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e00', 'pickleball', 'The Pickle Lodge North Shore', 'West Chester', 'OH',
   'https://pickleballtournaments.com/tournaments/monster-smash-2024', '2024-10-25', '2024-10-27', 1, 'scheduled', 1, 'admin',
   '2026-10-25T00:00:00.000Z', '2026-10-25T00:00:00.000Z', '5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e01',
   'https://local12.com/news/local/pickle-lodge-pickleball-wheelchair-tournament-disabled-competition-sport-ball-tennis-single-double-hybrid-winner-food-drink-event-ticket'),
  ('5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e25', 'Spooky Spokes 2025', '', '5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e00', 'pickleball', 'The Pickle Lodge North Shore', 'West Chester', 'OH',
   'https://pickleballtournaments.com/tournaments/monster-smash-2025', '2025-10-24', '2025-10-26', 1, 'scheduled', 1, 'admin',
   '2026-10-25T00:00:00.000Z', '2026-10-25T00:00:00.000Z', '5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e01',
   'https://www.local12.com/news/local/pickle-lodge-hosts-second-annual-wheelchair-pickleball-tournament'),
  ('5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e26', 'Spooky Spokes 2026', '', '5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e00', 'pickleball', 'The Pickle Lodge', 'Cincinnati', 'OH',
   'https://pickleballtournaments.com/tournaments/monster-smash-2026-a-frighteningly-fun-tournament', '2026-10-23', '2026-10-25', 1, 'scheduled', 1, 'admin',
   '2026-10-25T00:00:00.000Z', '2026-10-25T00:00:00.000Z', '5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e01',
   'https://pickleballtournaments.com/tournaments/monster-smash-2026-a-frighteningly-fun-tournament');
