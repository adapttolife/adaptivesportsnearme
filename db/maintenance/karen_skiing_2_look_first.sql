-- docs/data-fixes/karen-skiing.md, part 2. Run only the lines you agree with.

-- Look first. Each needs a judgment call; the line above it says what to look at.
-- Aspen Valley Ski and Snowboard Club: today's site is a youth racing club; a search for 'adaptive' finds nothing. If you agree it is not an adaptive program, hide it:
UPDATE organizations SET is_public = 0 WHERE id = 'ac064049-e8cc-4a71-a371-cb8d73f55a57';

-- Paralympic Alpine Development Program, Aspen: started 2010 with AVSC, no current page anywhere. Its link (adaptiveskiing.net) is a 404. Hide:
UPDATE programs SET is_public = 0 WHERE id = '5b00f6dc-e711-428e-8c6b-56c7837ee6e1';

-- Alpine Alternatives (AK): alpinealternatives.net does not load, no other site found, dropped off the IRS master file. Likely closed. Hide:
UPDATE organizations SET is_public = 0 WHERE id = '9f6074cd-6e08-438b-a346-499b89b33981';

-- Visually Impaired and Blind Skiers (CO): coloradovibes.org no longer resolves and no new site was found. Clearing the link hides it until someone finds one:
UPDATE organizations SET website_url = NULL, last_ok_at = NULL WHERE id = '5c7a5058-7f74-4031-bbc5-9a8ff0cab12e' AND website_url = 'http://www.coloradovibes.org';

-- Gateway Disabled Ski Program: real (Hidden Valley, Eureka MO, per news coverage), but gdsp.org is a parked redirect. Setting the town shows it without a link:
UPDATE programs SET city = 'Eureka', state = 'MO', state_name = 'Missouri'
  WHERE id = '9f9cbffc-ef73-4bfa-ab9f-4d3959f86849' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');
