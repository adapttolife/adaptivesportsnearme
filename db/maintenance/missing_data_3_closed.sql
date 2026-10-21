-- docs/data-fixes/missing-data.md. Every UPDATE matches the row's id and only fills what is empty (or matches the
-- current value it replaces), so it is safe to run twice and skips anything someone already set.

-- Team River Runner – Houston: closed or merged. Listed URL now lands on the TRR home page. TRR's current chapter list shows only one Texas chapter (San Marcos); no Houston chapter. Evidence: https://www.teamriverrunner.org/get-involved/chapters/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a9278bb4-def9-4c96-8d5e-894a6da038b4' AND is_public = 1;

-- Team River Runner – Reno: closed or merged. Listed URL now lands on the TRR home page; current national chapter list has no Nevada/Reno chapter. Evidence: https://www.teamriverrunner.org/get-involved/chapters/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6220f136-f2a4-4424-b93e-ab7c73b95da5' AND is_public = 1;

-- Team River Runner – Battle Creek: closed or merged. The Battle Creek chapter URL now shows the Eaton Rapids, MI chapter; the chapter list's only Michigan entry is Eaton Rapids. Likely relocated/renamed. Evidence: https://www.teamriverrunner.org/get-involved/chapters/michigan-battle-creek/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '91fc7802-ecf8-4b29-9ca8-f5f5dcfd0cba' AND is_public = 1;

-- Team River Runner – San Antonio: closed or merged. Listed URL lands on the TRR home page; current chapter list's only Texas chapter is San Marcos; no San Antonio chapter. Evidence: https://www.teamriverrunner.org/get-involved/chapters/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b244348a-125d-4212-bf55-5f82b5510bd6' AND is_public = 1;

-- Team River Runner – Northport: closed or merged. Old node URL redirects to the TRR homepage; Northport is not on TRR's current chapter list (New York shows only Western NY and Hudson Valley). Likely inactive. Evidence: https://www.teamriverrunner.org/get-involved/chapters/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7414974c-f29a-4b4e-9f30-51a4ff0f92bf' AND is_public = 1;

-- Team River Runner – Raleigh: closed or merged. Old node URL redirects to the TRR homepage; Raleigh is not on TRR's current chapter list. Likely inactive. Evidence: https://www.teamriverrunner.org/get-involved/chapters/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e6357c63-1250-46e3-a0f4-9609725aec35' AND is_public = 1;

-- Recreation Unlimited, Inc.: closed or merged. Recreation Unlimited became BASE (2019); possible duplicate of the BASE listing. Evidence: https://www.baseidaho.net/history
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b071c472-d4b4-44ae-abb0-cb18d65e01b4' AND is_public = 1;

-- United States Quad Rugby Association: closed or merged. USQRA renamed USA Wheelchair Rugby; national governing body, town blank. Evidence: https://usawr.org/about/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2b9ed626-610d-45a4-a9c1-2e0875327e17' AND is_public = 1;

-- Team River Runner – Cincinnati / N. KY: closed or merged. National TRR site marks this chapter inactive. Evidence: https://www.teamriverrunner.org/get-involved/chapters/ohio-cincinnatinorthern-ky/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd05c70a5-ed9d-44fc-96d0-0d024865df99' AND is_public = 1;

-- Team River Runner Cincinnati OH/Northern KY: closed or merged. Same chapter as the 'Team River Runner – Cincinnati / N. KY' listing (likely duplicate). National TRR site marks it inactive. Evidence: https://www.teamriverrunner.org/get-involved/chapters/ohio-cincinnatinorthern-ky/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8216784e-8d3b-4554-8149-05fb7aa55870' AND is_public = 1;

-- Heart Ranch: closed or merged. Own homepage announces closing; co-founders retiring. Evidence: https://www.heartranch.org/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c9c36d61-280c-5743-830c-d50a7b213617' AND is_public = 1;

-- Urbana University Shooting Sports Club: closed or merged. Urbana University (a branch of Franklin University) closed in 2020, so its shooting sports club no longer exists. Evidence: https://apnews.com/general-news-1ee85e5ef2e87072584c52f58f4c5e64
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7bec36e4-467b-48d8-a2d7-adf0a747bb08' AND is_public = 1;

-- Rogue Valley Scorpions Wheelchair Basketball: closed or merged. KTVL news, 2017-07-27. Evidence: https://ktvl.com/news/local/scorpions-wheelchair-basketball-ceases-operations
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '41c6ed48-c7ea-483e-8b23-bf11e5274d1e' AND is_public = 1;

-- Wheelchair Tennis Players Association: closed or merged. Historic national players' body (formed 1981 under the NFWT). Wheelchair tennis governance moved into the USTA in 1998. Not a local program; consider hiding. Evidence: https://assets.tenniscanada.com/production/PDFs/USTA-Grass-Roots-wheelchair-booklet.pdf
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0a2819dd-97bf-4fe0-ada3-5dc1848d94e2' AND is_public = 1;
