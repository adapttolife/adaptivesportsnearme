-- Spec 72 T02: sports taxonomy seed data. Idempotent (INSERT OR REPLACE keyed on
-- sport_key) — safe to re-run after every gazetteer edit.
--   cfrun wrangler d1 execute <db> --remote --file data/sports-seed.sql
--
-- icon_key is NON-NULL for exactly the 11 site icon keys (sport_key = icon_key for
-- them): basketball, tennis, pickleball, rugby, football, baseball, cycling,
-- sledhockey, skiing, waterskiing, goalball. Every other row is icon_key NULL —
-- classification can never invent an unknown icon and break card imagery.
--
-- super_type is the RCOS rollup (DataFields.md sport_super_type): variant sports
-- (Beep Baseball, Handcycling, Wheelchair Racing, ...) share their family's
-- super_type without sharing a sport_key or an icon. name/synonym matching for
-- each sport_key lives in data/gazetteer.js, not here.

INSERT OR REPLACE INTO sports (sport_key, name, super_type, category, is_paralympic, is_team, icon_key) VALUES
  ('basketball',         'Wheelchair Basketball',     'Basketball',    'Indoor',  1, 1, 'basketball'),
  ('sledhockey',         'Sled Hockey',                'Hockey',        'Indoor',  1, 1, 'sledhockey'),
  ('skiing',             'Adaptive Skiing',            'Skiing',        'Outdoor', 1, 0, 'skiing'),
  ('rowing',             'Adaptive Rowing',            'Rowing',        'Water',   1, 1, NULL),
  ('trackfield',         'Track & Field',               'Track & Field', 'Outdoor', 1, 0, NULL),
  ('sailing',            'Adaptive Sailing',           'Sailing',       'Water',   1, 0, NULL),
  ('tennis',             'Wheelchair Tennis',          'Tennis',        'Outdoor', 1, 0, 'tennis'),
  ('running',            'Running',                     'Running',       'Outdoor', 0, 0, NULL),
  ('archery',            'Archery',                     'Archery',       'Outdoor', 1, 0, NULL),
  ('swimming',           'Adaptive Swimming',          'Swimming',      'Water',   1, 0, NULL),
  ('cycling',            'Adaptive Cycling',           'Cycling',       'Outdoor', 1, 0, 'cycling'),
  ('equestrian',         'Equestrian',                  'Equestrian',    'Outdoor', 1, 0, NULL),
  ('curling',            'Wheelchair Curling',         'Curling',       'Indoor',  1, 1, NULL),
  ('golf',               'Adaptive Golf',               'Golf',          'Outdoor', 0, 0, NULL),
  ('surfing',            'Adaptive Surfing',           'Surfing',       'Water',   0, 0, NULL),
  ('rugby',              'Wheelchair Rugby',           'Rugby',         'Indoor',  1, 1, 'rugby'),
  ('shooting',           'Shooting Sports',             'Shooting',      'Outdoor', 1, 0, NULL),
  ('volleyball',         'Sitting Volleyball',         'Volleyball',    'Indoor',  1, 1, NULL),
  ('martialarts',        'Martial Arts',                'Martial Arts',  'Indoor',  0, 0, NULL),
  ('boccia',             'Boccia',                      'Boccia',        'Indoor',  1, 0, NULL),
  ('blindsports',        'Blind Sports',                'Blind Sports',  'Indoor',  0, 0, NULL),
  ('fencing',            'Wheelchair Fencing',         'Fencing',       'Indoor',  1, 0, NULL),
  ('baseball',           'Adaptive Baseball',           'Baseball',      'Outdoor', 0, 1, 'baseball'),
  ('lacrosse',           'Wheelchair Lacrosse',        'Lacrosse',      'Outdoor', 0, 1, NULL),
  ('waterskiing',        'Adaptive Water Skiing',      'Water Skiing',  'Water',   0, 0, 'waterskiing'),
  ('climbing',           'Adaptive Climbing',           'Climbing',      'Outdoor', 0, 0, NULL),
  ('pickleball',         'Adaptive Pickleball',        'Pickleball',    'Outdoor', 0, 0, 'pickleball'),
  ('football',           'Adaptive Football',           'Football',      'Outdoor', 0, 1, 'football'),
  ('goalball',           'Goalball',                     'Goalball',      'Indoor',  1, 1, 'goalball'),
  ('softball',           'Wheelchair Softball',        'Softball',      'Outdoor', 0, 1, NULL),
  ('soccer',             'Power Soccer',                'Soccer',        'Indoor',  0, 1, NULL),
  ('dance',              'Wheelchair Dance',            'Dance',         'Indoor',  0, 0, NULL),
  ('powerlifting',       'Para Powerlifting',           'Powerlifting',  'Indoor',  1, 0, NULL),
  ('triathlon',          'Para Triathlon',              'Triathlon',     'Outdoor', 1, 0, NULL),
  ('wheelchairracing',   'Wheelchair Racing',           'Track & Field', 'Outdoor', 1, 0, NULL),
  ('handcycling',        'Handcycling',                  'Cycling',       'Outdoor', 1, 0, NULL),
  ('nordicskiing',       'Para Nordic Skiing',          'Skiing',        'Outdoor', 1, 0, NULL),
  ('equestrianvaulting', 'Para Equestrian Vaulting',    'Equestrian',    'Indoor',  0, 0, NULL),
  ('beepbaseball',       'Beep Baseball',                'Baseball',      'Outdoor', 0, 1, NULL),
  ('amputeesports',      'Amputee Sports',               'Amputee Sports','Outdoor', 0, 0, NULL),
  ('handball',           'Wheelchair Handball',         'Handball',      'Indoor',  1, 1, NULL);
