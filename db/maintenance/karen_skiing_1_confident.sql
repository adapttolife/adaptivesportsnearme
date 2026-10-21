-- docs/data-fixes/karen-skiing.md, part 1. Safe to run twice: every UPDATE matches the row's current value.

-- Karen's list (2026-10-21). Each line is checked on the organization's own website.
-- Vermont Adaptive Ski and Sports: Vermont Adaptive, HQ at Pico Mountain, Killington. Had no link, so it was hidden.
UPDATE organizations SET website_url = 'https://www.vermontadaptive.org/', city = 'Killington', last_ok_at = NULL
  WHERE id = '18a9facb-61f3-4246-8031-79a32a57e54d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Adaptive Sports Foundation: Adaptive Sports Foundation, Windham NY. Had no link, so it was hidden.
UPDATE organizations SET website_url = 'https://www.adaptivesportsfoundation.org/', city = 'Windham', last_ok_at = NULL
  WHERE id = '90485a4a-7a41-45b9-8d59-ede3ac7e3cae' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- New England Disabled Sports: New England Disabled Sports, Loon Mountain, Lincoln NH. Had no link, so it was hidden.
UPDATE organizations SET website_url = 'https://nedisabledsports.org/', city = 'Lincoln', last_ok_at = NULL
  WHERE id = 'd2c13bb9-edc8-412e-845e-730e8fe50bb4' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- New England Healing Sports Association (NEHSA): NEHSA, Mount Sunapee, Newbury NH.
UPDATE organizations SET website_url = 'https://nehsa.org/', city = 'Newbury', last_ok_at = NULL
  WHERE id = '8f21c7f6-8403-4792-978e-a83899d83921' AND website_url = 'http://www.nehsa.org' AND (city IS NULL OR city = '');

-- Adaptive Sports at Mount Snow | ASMS: Adaptive Sports at Mount Snow, West Dover (town of Dover) VT. Had no link or state, so it was hidden.
UPDATE organizations SET website_url = 'https://www.adaptiveatsnow.org/', city = 'Dover', state = 'VT', state_name = 'Vermont', last_ok_at = NULL
  WHERE id = '34380ebf-bf06-4de7-800f-d4f4a60d6d0b' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- National Ability Center – Park City: NAC, Park City UT. discovernac.org now redirects here.
UPDATE organizations SET website_url = 'https://nationalabilitycenter.org/', city = 'Park City', last_ok_at = NULL
  WHERE id = '7f66bd7e-f782-4908-be5d-0d9317f35d37' AND website_url = 'http://www.discovernac.org' AND (city IS NULL OR city = '');

-- Steamboat Adaptive Recreational Sports ‘STARS’: STARS, Steamboat Springs CO.
UPDATE organizations SET city = 'Steamboat Springs'
  WHERE id = '91660598-fbb3-4f51-9400-d15b743d5a02' AND (city IS NULL OR city = '');

-- Challenge Aspen: Challenge Aspen, Snowmass Village CO. CAMO is its veterans program, not a separate organization.
UPDATE organizations SET website_url = 'https://challengeaspen.org/', city = 'Snowmass Village', last_ok_at = NULL
  WHERE id = 'f28a3bb7-6e25-42b0-90af-db583ffd0673' AND website_url = 'http://www.challengeaspen.com' AND (city IS NULL OR city = '');

-- Eagle Mount Bozeman: Eagle Mount Bozeman. It also runs the adaptive program at Big Sky (Big Sky Resort says so).
UPDATE organizations SET city = 'Bozeman'
  WHERE id = 'c7cccde6-1b05-46d5-9f80-ce501f45799a' AND (city IS NULL OR city = '');

-- Aspen Valley Ski and Snowboard Club (AVSC): Aspen Valley Ski and Snowboard Club is in Aspen, CO, not Utah (the footer of its own site). See the look-first file: it may not be adaptive at all.
UPDATE organizations SET city = 'Aspen', state = 'CO', state_name = 'Colorado'
  WHERE id = 'ac064049-e8cc-4a71-a371-cb8d73f55a57' AND (city IS NULL OR city = '') AND state = 'UT';

-- Other ski programs: town on file (so distance works) and current link.
-- Cannonsburg Challenged Ski Association: Now Adaptive Ski Association of West Michigan. skiccsa.org is a parked ad page.
UPDATE organizations SET website_url = 'https://www.asa-wm.org/', city = 'Ada', last_ok_at = NULL
  WHERE id = 'adbc8084-0adf-45d6-81a0-4232ed6779b8' AND website_url = 'http://www.skiccsa.org' AND (city IS NULL OR city = '');

-- Boise Adaptive Snowsport Education | BASE: BASE, Boise ID (Bogus Basin). Had no link or state.
UPDATE organizations SET website_url = 'https://www.baseidaho.net/', city = 'Boise', state = 'ID', state_name = 'Idaho', last_ok_at = NULL
  WHERE id = 'f991223c-e3af-4148-a918-5f09e0b19c88' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Greek Peak Adaptive Snowsports: Greek Peak Adaptive Snowsports, at Greek Peak in Virgil NY.
UPDATE organizations SET city = 'Virgil'
  WHERE id = 'cb639492-5bd8-49a5-97c5-a1f8f71fbb4b' AND (city IS NULL OR city = '');

-- Leaps Of Faith Disabled Skiers – Paralympic Sport Connecticut: LOF Adaptive Skiers, lessons at Mount Southington CT.
UPDATE organizations SET city = 'Southington'
  WHERE id = '37759c33-9686-477f-8aab-c4be9e49e553' AND (city IS NULL OR city = '');

-- Foresight Ski Guides, Inc.: Foresight Ski Guides, Vail and Beaver Creek. Had no link.
UPDATE organizations SET website_url = 'https://www.foresightskiguides.org/', city = 'Vail', last_ok_at = NULL
  WHERE id = 'ad159233-f344-4ec6-b937-2a3057547716' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Special Outdoor Leisure Opportunities (SOLO, Inc.): SOLO, based in South Bend IN (skis at Swiss Valley, Jones MI).
UPDATE organizations SET city = 'South Bend'
  WHERE id = '7e35c388-e29d-4429-bc56-3c684db25179' AND (city IS NULL OR city = '');

-- Blue Ridge Adaptive Snow Sports (BRASS): BRASS, Fairfield PA (Liberty Mountain).
UPDATE organizations SET city = 'Fairfield'
  WHERE id = '84a1a725-593d-49e1-9b5d-7c2b46373cd8' AND (city IS NULL OR city = '');

-- Black Hills Regional Ski for Light, Inc.: Black Hills Regional Ski for Light, Rapid City SD.
UPDATE organizations SET city = 'Rapid City'
  WHERE id = '728c099c-a7d8-4d8d-ac11-3ee14ab6b071' AND (city IS NULL OR city = '');

-- Wintergreen Adaptive Sports: skiwas.org now redirects here.
UPDATE organizations SET website_url = 'https://www.wintergreenadaptivesports.org/', city = 'Wintergreen', last_ok_at = NULL
  WHERE id = 'c73b0784-b96a-4754-8962-7807dd896e76' AND website_url = 'http://www.skiwas.org' AND (city IS NULL OR city = '');

-- Central Cross Country Ski Association – Madison: CXC adaptive Nordic, Middleton WI.
UPDATE organizations SET city = 'Middleton'
  WHERE id = '9d37cd88-0261-4f84-9f1b-a9698acee719' AND (city IS NULL OR city = '');

-- Two Top Mountain Adaptive Sports Foundation: Two Top Mountain, Whitetail Resort, Mercersburg PA.
UPDATE organizations SET city = 'Mercersburg'
  WHERE id = '88c8136f-9289-4911-abf8-0bb622a71845' AND (city IS NULL OR city = '');

-- Eagle Mount Great Falls: Eagle Mount Great Falls.
UPDATE organizations SET city = 'Great Falls'
  WHERE id = 'dad64d2f-9967-4c69-b3cf-e2b46e138dc4' AND (city IS NULL OR city = '');

-- Eagle Mount Billings: Eagle Mount Billings. Had no link.
UPDATE organizations SET website_url = 'https://eaglemountbillings.org/', city = 'Billings', last_ok_at = NULL
  WHERE id = 'feb18991-7382-4f49-bcac-dc84b26f0582' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Adaptive Ski Program: Now Adaptive Sports Program New Mexico (Ski Santa Fe, Sandia Peak). adaptiveski.org redirects here.
UPDATE programs SET website_url = 'https://www.adaptivesportsprogram.org/', city = 'Santa Fe', last_ok_at = NULL
  WHERE id = '7b8db43e-1900-4e92-81e6-3c696a476b21' AND website_url = 'http://www.adaptiveski.org' AND (city IS NULL OR city = '');

-- Ski Apache Disabled Skiers Program: Now All Season Adaptive Sports, at Ski Apache near Ruidoso NM. Had no link.
UPDATE programs SET website_url = 'https://www.allseasonadaptivesports.com/', city = 'Ruidoso', last_ok_at = NULL
  WHERE id = '6ba84180-b7fc-4387-80f5-3942b5fa2e00' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Lounsbury Adaptive Ski Program: Its old Wix page says "This site has moved to lounsburyadaptive.org". Holiday Valley, Ellicottville NY.
UPDATE programs SET website_url = 'https://lounsburyadaptive.org/', city = 'Ellicottville', last_ok_at = NULL
  WHERE id = 'd81f31e3-378f-4dfd-ae0b-aeb85207374e' AND website_url = 'https://skilasp1.wixsite.com/lounsburyadaptive' AND (city IS NULL OR city = '');

-- Southeastern Wisconsin Adaptive Ski Program: SEWASP, Alpine Valley, East Troy WI.
UPDATE programs SET website_url = 'https://sewasp.org/', city = 'East Troy', last_ok_at = NULL
  WHERE id = 'f6dad335-a0e3-4daf-a2e1-2de726f0f8f7' AND website_url = 'http://www.sewasp.org' AND (city IS NULL OR city = '');
