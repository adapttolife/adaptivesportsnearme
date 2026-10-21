-- docs/data-fixes/dead-links.md. Each UPDATE matches the row's id AND its current link, so it is safe to run twice
-- and skips a row someone already changed.

-- Concord Fencing Club: closed or merged. Concord Monitor (July 2020): club at 126D Hall St shut its doors end of June 2020 due to pandemic revenue loss, planned to evaluate reopening. Domain no longer resolves; no evidenc Evidence: https://www.concordmonitor.com/2020/07/08/a-roundup-of-local-sports-briefs-news-and-announcements-35107317/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ce69f3bc-d819-4e04-8664-417d98647c20' AND is_public = 1 AND website_url = 'http://concordfencingclub.org';

-- Team River Runner – Salt Lake City: closed or merged. Team River Runner's current chapter list has no Utah or Salt Lake City chapter (Mountain West shows only Colorado chapters and Boise). Chapter appears inactive. Evidence: https://www.teamriverrunner.org/get-involved/chapters/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9f19f0b9-4436-40e3-9f33-b7648b1427de' AND is_public = 1 AND website_url = 'https://www.teamriverrunner.org/get-involved/chapters/utah-salt-lake-city/';

-- Simple Steps LLC: closed or merged. Company site is live but its locations page now lists only Florida, Texas and Virtual veteran outreach services; the Maryland location page is gone (404). Maryland service appears  Evidence: https://simplestepsllc.com/locations/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd56fff12-184c-5325-a57f-03933bd5570f' AND is_public = 1 AND website_url = 'https://simplestepsllc.com/locations/maryland-veteran-outreach-services/';

-- Bart J Ruggiere Adaptive Sports Center – Manchester: closed or merged. Bart Adaptive Sports Center merged into Vermont Adaptive Ski & Sports (2025); now 'The Bart Center at Vermont Adaptive' at Bromley Mountain. Merger page on vermontadaptive.org. Evidence: https://www.vermontadaptive.org/bart-adaptive-merger/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fa911221-2427-4bcd-8d35-b18d9a48fd45' AND is_public = 1 AND website_url = 'https://www.bartadaptive.org/';

-- Virginia Beach Hockey Club Sled Team: closed or merged. virginiabeachhockeyclub.com now redirects to warriorforlifefund.org/programs/wflf-hockey-club/ (a 404), indicating the club folded into Warrior For Life Fund (Virginia Beach). WFLF Evidence: https://www.virginiabeachhockeyclub.com/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '29bf986f-7137-41b5-91a6-874d7c71b047' AND is_public = 1 AND website_url = 'http://www.virginiabeachhockeyclub.com/vbhc-sled-team';

-- Sarasota Manatee Association for Riding Therapy (SMART): closed or merged. SMART merged with Hooves with HEART (2024) and now operates as SMART with HEART on its Bradenton campus; smartriders.org domain lapsed. New site title confirms the dba. Evidence: https://www.yourobserver.com/news/2024/nov/01/nonprofits-merge-equine-therapy
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5db02ee1-38f0-51b9-813e-9cd8b4cbf3cb' AND is_public = 1 AND website_url = 'https://www.smartriders.org/';

-- STRAPS – San Antonio: closed or merged. Morgan's Sports page states the YMCA of Greater San Antonio began operating Morgan's Sports in April 2026; STRAPS is now part of the Hartman Family YMCA, with its own YMCA page. Evidence: https://morgans.org/morgans-sports/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '256182cd-e48b-462d-bc9a-d64b73090eac' AND is_public = 1 AND website_url = 'https://morganswonderlandsports.sportngin.com/page/show/5555444-south-texas-regional-adaptive-and-para-sports';

-- Wheelchair Bucks: closed or merged. Old link was a GoFundMe. The NWBA team page that was the Milwaukee Wheelchair Bucks now carries the name WASA Marquette Eagles; WASA runs Milwaukee wheelchair basketball (Golden Ea Evidence: https://www.nwba.org/page/show/4318194-milwaukee-wheelchair-bucks
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a0456c20-c3ff-4b37-b043-b1d7e85a65d2' AND is_public = 1 AND website_url = 'https://www.gofundme.com/8hdew&aff=GFMse';
