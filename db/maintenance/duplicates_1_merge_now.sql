-- Tier 1, production (asnm-db): the same organization listed more than once at the same place.
-- 71 groups, 75 rows fold into the row that is kept. List and reasons: docs/data-fixes/duplicates-1-merge-now.csv.
-- Same steps as db/maintenance/merge_staging_duplicate_organizations.sql, plus step 1: blanks on the
-- kept row are filled from the rows folded into it, so no web address, place or description is lost.
-- Rehearsed 2026-10-18 on copies of production, locally and on a scratch D1 database (docs/data-fixes/duplicates-and-tables.md).

CREATE TABLE merge_map_20261018 (keep_id TEXT NOT NULL, remove_id TEXT PRIMARY KEY);

INSERT INTO merge_map_20261018 (keep_id, remove_id) VALUES
  ('3d84c995-1d59-4b14-85ca-2a5f7010a10a', '23aa1716-1312-4a8c-8dd0-7c9a9c1a0644'),
  ('b7827006-4eda-47a0-a38d-87ad4d19a73b', '74d1dd4e-2c14-401a-8a9e-fd0853f15ff5'),
  ('96261081-78ae-4a03-bf1d-22a6ad1dc2c4', '2707caa7-72b8-44cb-b131-c7dfab8b4458'),
  ('a00a07e5-617e-4612-923e-05b273422ba3', '0696e01b-dd48-486f-b883-7fcc81216d03'),
  ('a00a07e5-617e-4612-923e-05b273422ba3', '4cd1ac7d-5123-4c5e-8a2e-f20849ff4f7d'),
  ('e06dcd42-92d3-4eb6-ac6f-04925a4f29c4', '4fabebde-d0a6-4cc7-aa8d-b68f49cc3959'),
  ('18256a31-18a5-4d64-9a19-9f80b5b12e16', '7b657898-f74f-45e6-8782-c5762f4dffbd'),
  ('a6006b31-9f9e-4fa0-835f-db1706a420f1', 'caa8a6aa-4075-4007-b126-6fbf1e012234'),
  ('f1963571-1ec3-49f6-ab77-ddfd6c762d6f', '4bb88bc3-d41c-44e7-b92f-e83c5f90f7a1'),
  ('549a71f6-5100-4536-b6dc-7c1993d8cda7', 'bc15e49d-3681-4c30-8c2c-573a21326f24'),
  ('e5712394-2041-4223-80d4-143a50d415a3', '76974b8a-f3a0-4e74-bca1-2403202f6cde'),
  ('5566bec2-14f8-4e08-90ce-c826298e7ac4', 'df906833-865c-40ee-a6df-44af9e1f811f'),
  ('08e621d4-90e5-4618-9cba-897887b666cf', '4756da23-32a6-419b-b007-6d1a78681d44'),
  ('8e778eb0-016e-4937-a7d3-557e6c8f0343', 'cdbd08ed-c7ad-48d1-8018-d4f64750ac8b'),
  ('eaacb362-f349-4e89-8391-31a667802fa0', '14d50344-5dd2-4ae1-92bf-0bac0f87cbd4'),
  ('5c295b56-93de-416a-b56d-0e03b9043f7c', '752a915d-c4de-4df0-b5da-2c955e7d501e'),
  ('83c4022d-d774-4ddb-b9c0-1d97cdf716d9', 'f253fb53-7f73-44a4-8611-595e407d5c19'),
  ('45b412a5-ca12-42ac-bf31-8b783e7e780d', 'dbe9356d-e234-4cb7-8ef0-532992459440'),
  ('11dde9f0-290a-4215-aefd-8efcaef0c2f7', 'e88696f3-7f74-45ad-9db9-ef298c5e3fd1'),
  ('26c4f6ed-5822-4bf6-9089-c42508316882', 'c424c63d-7972-494a-93b4-d47056ff587f'),
  ('26c4f6ed-5822-4bf6-9089-c42508316882', '6bd17a8c-7323-4f8f-a081-6372a09f2c89'),
  ('f5160cce-07c4-4d26-93dd-585c9eb3f1b3', 'd9ecf5ce-2d82-4cf8-90a3-74112e00f2e4'),
  ('35b06497-02ed-4130-9ed8-de32929ad371', 'f03f0450-8622-43a3-adfc-cd48117c705d'),
  ('70771ff4-609d-4f2d-863f-decbb2707c92', '505c314d-2fde-4aef-8c68-f0e5debd77e3'),
  ('b567dc56-1957-4f28-b1a5-27c780e0adf1', 'a7ed650e-82f3-4459-830e-9f0bed026d11'),
  ('feb18991-7382-4f49-bcac-dc84b26f0582', '82842734-e6c0-4421-afb1-ac351adc2c8f'),
  ('14c05816-e943-4f39-8632-c8f4e74b6e0b', '4d3453df-c64c-4d1b-b0bc-fc481c650bf4'),
  ('f0a2a04b-7d3f-44ea-837f-b9f4ecf794d6', '9cacf43e-e11e-41ca-a4c6-bc2ef5be6dc2'),
  ('ad159233-f344-4ec6-b937-2a3057547716', '08e84b16-6fd5-4f25-aba4-ca3e8508f0e6'),
  ('150519ca-3efc-4ebe-b835-b5f802d1973e', 'e821507f-8151-4395-9fcc-16ed82c2290b'),
  ('82c4bec5-30e8-41f6-b5ae-2237c7d3f4e0', 'a5953e2f-c1d2-445a-abb2-e580a4be8041'),
  ('983e3414-6544-4b1f-aff2-4de76b98ed54', '2c7fd877-78ce-444f-a0ad-7c5f674076cf'),
  ('b8a8f78f-8b58-4638-a46f-afa4b5a6f96b', '8445c3e3-d314-45d0-9903-eddb74a7c8e5'),
  ('b8a8f78f-8b58-4638-a46f-afa4b5a6f96b', '37fd5004-1274-4557-ae41-89cb775f7070'),
  ('ddd9e639-96d5-4a9e-9ab8-f99370d4057d', 'a5891f2f-4206-4e13-a69c-2614fea38a3e'),
  ('72e41bee-bca5-45c5-b3b7-37b5bf57dc7c', 'bf46c3d5-6f81-437d-96b3-f1bfa09aad71'),
  ('72e41bee-bca5-45c5-b3b7-37b5bf57dc7c', 'd5983c92-21bf-40db-8192-937f45d25b86'),
  ('197b95eb-17df-4a14-bbe9-b9c060844d75', '7c727c84-7b90-4a74-81f4-2c4661afb9c3'),
  ('449d8205-f59c-4010-b0d9-354c6c1eec00', 'c4560e39-a5f8-4c12-b942-cdbbc421843d'),
  ('c578d4f8-1355-4454-a59c-db3a11c9c43f', 'e1bec532-e4b5-4306-b4e5-a6f5438ac9a1'),
  ('6d8ad4d4-0077-4800-9317-c0e8370acd3c', 'ba39960d-ee44-4fe5-97cb-313636276aae'),
  ('a04151bd-2359-45f9-bf83-518ce2597127', '177183b2-71a2-4db3-8322-ffc4f477b6ec'),
  ('e036ec93-985e-43b2-bef1-8dc7ff0ede1f', 'cbf52e34-582a-4e3c-bf62-10565c32d70d'),
  ('51c78383-ee4c-4a10-8a73-4d1c50e6a00d', 'c32a5e06-ed53-42be-83ed-a474491a5b92'),
  ('d2c13bb9-edc8-412e-845e-730e8fe50bb4', '74dda165-f0cb-4de7-91af-5037afe89ff4'),
  ('8fd01c27-c8c7-4d9f-8666-631f49ecc90a', '8cad7aef-e5f7-485e-bc13-e569de1b2d36'),
  ('823091b0-a3b6-4b71-b6c4-9a375c3f4103', 'ae561ef1-7a1d-47b7-8c48-5ba4fd98be30'),
  ('6d4a554e-4011-438d-823d-e1b9468c59af', '24f680b5-23a2-4b07-9b5e-e02958383a01'),
  ('cbcbbdca-55e5-4ffe-bfdd-13949d1ebd3f', '556dfa14-7626-4808-a33b-abc96f1920ef'),
  ('8e9949dd-f309-4d91-81d9-1295b4587c3f', '561aba60-da02-4fe8-882a-adee81b27efa'),
  ('2bc1110f-e614-4948-bd5d-8d163fb6eb89', 'de856a7e-6492-4936-960f-1b46a56a5a5a'),
  ('ccba8a33-ea16-485c-be18-4748f4ad4f7c', '7f0c9c25-3d80-4e4b-8042-c932ea7ac07e'),
  ('40a04a70-019a-4061-a4ee-ac9d8b54397f', '19990746-ef92-4293-bfdd-f6fa1bfb330e'),
  ('a33bd5c0-0636-4e53-8b27-76cfbee7ec5e', 'd3c473af-f666-46af-9694-8846584fa27a'),
  ('90b97b9e-3684-4d4b-9f51-414f1c27e11f', 'a21dee6b-ccfd-42cd-b113-84b7a7569e87'),
  ('fe5057c2-0f95-491f-a2ed-a5aecf8fa32c', '4bc6ead4-6108-43b4-a0cb-441275aa7530'),
  ('9aa2dc14-3574-4d43-a6a6-04df9a34d66f', 'a021aceb-99e4-497d-a449-78df1397f79e'),
  ('9399efbf-9b24-4925-bc2c-aeb45c759a56', 'b12a5cbc-23b7-4f73-b594-23b9325d0d2d'),
  ('e3014e4f-97a1-4bfe-9c1f-30b465002913', 'a48229c5-5e31-42ec-a80b-c8ddea3d053e'),
  ('7ad4fa0f-3dc0-4a19-8329-7065e944ba98', '48923eba-6ddd-4382-b0c0-240d99ab4fe0'),
  ('88c8136f-9289-4911-abf8-0bb622a71845', '5d62da6c-187f-4974-9a9e-0ccf49936e6d'),
  ('da4bc284-5c3f-406f-a11d-7907fcbd0e71', '52248d83-1197-42f0-87c8-00aa4cbfe7cc'),
  ('4ef34668-47b0-4a5f-b166-d5e79a35ee19', 'd4b621e2-d793-4816-9e25-6db06fa10f42'),
  ('c02a5d7c-9034-4787-a64d-0001879f8e72', 'b8c78d4f-5c25-41c9-b171-10d135cdf296'),
  ('8b6dc9e0-9ffb-4402-8fe1-2813823ee93f', '91048ebd-602a-4912-98d3-078863858abb'),
  ('18a9facb-61f3-4246-8031-79a32a57e54d', '952a7b84-f84e-4f74-927c-b37b80e1fb6c'),
  ('25e53708-62b5-5e98-9a49-45040e2be051', 'eb046b9c-d38e-591a-8bca-5575759de445'),
  ('4f9e1aab-ad5a-5993-a966-690b0442ddaf', '93dfa701-2c1e-574d-8580-cadc7c8c2e0c'),
  ('041a5b47-4e4b-51f4-a14e-593187a35867', '886ed50b-b159-5472-8669-1b7cc3d3ef67'),
  ('9ce4848c-a715-507e-9794-c10f6aac7e4f', '433ee074-e1ef-5192-b44b-28d056b60dc8'),
  ('3e6a6aea-8962-5902-9d0d-1b91e828293f', '71cdd008-2a2c-5f50-94f4-c386a7f4866b'),
  ('25b6c72d-3408-5768-b2b9-29a8ce9027ca', '3ffa984e-fafc-5b62-95ed-5bddb2ff289b'),
  ('4b47289a-5d43-51f2-bc54-f58dc51df88d', '8bc436ee-71bc-5ada-b56a-4e8673ca8796'),
  ('9c4d207b-938b-5727-9cfb-fc96eabd728e', '3311d1b1-2e27-5e89-a80a-4ed3409e5f5e'),
  ('6df9d26d-a973-5002-b20d-fe91cd2c6333', '1c987697-9ad2-5b4f-a150-d2511cbcc0c8');

-- Guard: if a kept row is gone by the time this runs, its pair is skipped, so nothing is moved onto a missing row.
DELETE FROM merge_map_20261018 WHERE keep_id NOT IN (SELECT id FROM organizations);

-- 1. Fill blanks on the kept row from the rows folded into it (oldest folded row first).
UPDATE organizations SET website_url = (SELECT o.website_url FROM organizations o JOIN merge_map_20261018 m ON m.remove_id = o.id WHERE m.keep_id = organizations.id AND COALESCE(o.website_url, '') <> '' ORDER BY o.created_at LIMIT 1)
WHERE COALESCE(website_url, '') = '' AND id IN (SELECT keep_id FROM merge_map_20261018 m JOIN organizations o ON o.id = m.remove_id WHERE COALESCE(o.website_url, '') <> '');

UPDATE organizations SET state = (SELECT o.state FROM organizations o JOIN merge_map_20261018 m ON m.remove_id = o.id WHERE m.keep_id = organizations.id AND COALESCE(o.state, '') <> '' ORDER BY o.created_at LIMIT 1),
  state_name = (SELECT o.state_name FROM organizations o JOIN merge_map_20261018 m ON m.remove_id = o.id WHERE m.keep_id = organizations.id AND COALESCE(o.state, '') <> '' ORDER BY o.created_at LIMIT 1)
WHERE COALESCE(state, '') = '' AND id IN (SELECT keep_id FROM merge_map_20261018 m JOIN organizations o ON o.id = m.remove_id WHERE COALESCE(o.state, '') <> '');

UPDATE organizations SET
  city = (SELECT o.city FROM organizations o JOIN merge_map_20261018 m ON m.remove_id = o.id WHERE m.keep_id = organizations.id AND COALESCE(o.city, '') <> '' AND o.state = organizations.state ORDER BY o.created_at LIMIT 1),
  zip = (SELECT o.zip FROM organizations o JOIN merge_map_20261018 m ON m.remove_id = o.id WHERE m.keep_id = organizations.id AND COALESCE(o.city, '') <> '' AND o.state = organizations.state ORDER BY o.created_at LIMIT 1),
  lat = (SELECT o.lat FROM organizations o JOIN merge_map_20261018 m ON m.remove_id = o.id WHERE m.keep_id = organizations.id AND COALESCE(o.city, '') <> '' AND o.state = organizations.state ORDER BY o.created_at LIMIT 1),
  lng = (SELECT o.lng FROM organizations o JOIN merge_map_20261018 m ON m.remove_id = o.id WHERE m.keep_id = organizations.id AND COALESCE(o.city, '') <> '' AND o.state = organizations.state ORDER BY o.created_at LIMIT 1),
  geo_precision = (SELECT o.geo_precision FROM organizations o JOIN merge_map_20261018 m ON m.remove_id = o.id WHERE m.keep_id = organizations.id AND COALESCE(o.city, '') <> '' AND o.state = organizations.state ORDER BY o.created_at LIMIT 1)
WHERE COALESCE(city, '') = '' AND id IN (SELECT m.keep_id FROM merge_map_20261018 m JOIN organizations o ON o.id = m.remove_id JOIN organizations k ON k.id = m.keep_id WHERE COALESCE(o.city, '') <> '' AND o.state = k.state);

UPDATE organizations SET description = (SELECT o.description FROM organizations o JOIN merge_map_20261018 m ON m.remove_id = o.id WHERE m.keep_id = organizations.id AND COALESCE(o.description, '') <> '' ORDER BY length(o.description) DESC LIMIT 1)
WHERE COALESCE(description, '') = '' AND id IN (SELECT keep_id FROM merge_map_20261018 m JOIN organizations o ON o.id = m.remove_id WHERE COALESCE(o.description, '') <> '');

UPDATE organizations SET sport = (SELECT o.sport FROM organizations o JOIN merge_map_20261018 m ON m.remove_id = o.id WHERE m.keep_id = organizations.id AND o.sport_key IS NOT NULL ORDER BY o.created_at LIMIT 1),
  sport_key = (SELECT o.sport_key FROM organizations o JOIN merge_map_20261018 m ON m.remove_id = o.id WHERE m.keep_id = organizations.id AND o.sport_key IS NOT NULL ORDER BY o.created_at LIMIT 1)
WHERE sport_key IS NULL AND id IN (SELECT keep_id FROM merge_map_20261018 m JOIN organizations o ON o.id = m.remove_id WHERE o.sport_key IS NOT NULL);

-- 2. Move everything that points at a folded row onto the kept row (Faisal's steps).
DELETE FROM organization_data_sources
WHERE organization_id IN (SELECT remove_id FROM merge_map_20261018)
  AND EXISTS (SELECT 1 FROM organization_data_sources kept JOIN merge_map_20261018 ON kept.organization_id = merge_map_20261018.keep_id
              WHERE kept.source_id = organization_data_sources.source_id AND merge_map_20261018.remove_id = organization_data_sources.organization_id);
DELETE FROM organization_data_sources
WHERE organization_id IN (SELECT remove_id FROM merge_map_20261018)
  AND rowid NOT IN (SELECT MIN(ods.rowid) FROM organization_data_sources ods JOIN merge_map_20261018 m ON m.remove_id = ods.organization_id GROUP BY m.keep_id, ods.source_id);
UPDATE organization_data_sources SET organization_id = (SELECT keep_id FROM merge_map_20261018 WHERE remove_id = organization_data_sources.organization_id)
WHERE organization_id IN (SELECT remove_id FROM merge_map_20261018);
UPDATE programs SET organization_id = (SELECT keep_id FROM merge_map_20261018 WHERE remove_id = programs.organization_id)
WHERE organization_id IN (SELECT remove_id FROM merge_map_20261018);
UPDATE link_checks SET organization_id = (SELECT keep_id FROM merge_map_20261018 WHERE remove_id = link_checks.organization_id)
WHERE organization_id IN (SELECT remove_id FROM merge_map_20261018);
UPDATE review_queue SET organization_id = (SELECT keep_id FROM merge_map_20261018 WHERE remove_id = review_queue.organization_id)
WHERE organization_id IN (SELECT remove_id FROM merge_map_20261018);
UPDATE events SET org_id = (SELECT keep_id FROM merge_map_20261018 WHERE remove_id = events.org_id)
WHERE org_id IN (SELECT remove_id FROM merge_map_20261018);
DELETE FROM profile_favorites
WHERE org_id IN (SELECT remove_id FROM merge_map_20261018)
  AND EXISTS (SELECT 1 FROM profile_favorites kept JOIN merge_map_20261018 ON kept.org_id = merge_map_20261018.keep_id
              WHERE kept.profile_id = profile_favorites.profile_id AND merge_map_20261018.remove_id = profile_favorites.org_id);
UPDATE profile_favorites SET org_id = (SELECT keep_id FROM merge_map_20261018 WHERE remove_id = profile_favorites.org_id)
WHERE org_id IN (SELECT remove_id FROM merge_map_20261018);

-- 3. The folded rows go.
DELETE FROM organizations WHERE id IN (SELECT remove_id FROM merge_map_20261018);

DROP TABLE merge_map_20261018;
