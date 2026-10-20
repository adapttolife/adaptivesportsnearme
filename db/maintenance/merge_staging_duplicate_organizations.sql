CREATE TABLE merge_map_20261017 (keep_id TEXT PRIMARY KEY, remove_id TEXT UNIQUE NOT NULL);

INSERT INTO merge_map_20261017 (keep_id, remove_id) VALUES
  ('e06dcd42-92d3-4eb6-ac6f-04925a4f29c4', '4fabebde-d0a6-4cc7-aa8d-b68f49cc3959'),
  ('0a952ffb-4765-49fd-a97e-671200072a0d', 'ff63e63c-3380-4f58-88fb-3f1f69bd6f88'),
  ('73f0a2e0-b83f-4ae8-bbc1-a4822e3bcd64', '6ad49992-1af7-417f-a515-7255caf83d39'),
  ('34fe3c5d-724a-4a04-90e1-7e6466965339', '6caf2bd8-db90-45b8-a184-403f445f4a46'),
  ('f28a3bb7-6e25-42b0-90af-db583ffd0673', '38446a79-89a8-4404-9d4e-e75d8260801c'),
  ('e1f57cec-b71b-4e14-bcf6-4f7ccc94d2a9', '2c456c0b-1691-4410-ae6d-e82866799fcd'),
  ('04d3be73-bc24-4581-bf8e-5772c5938a93', '8f8d47d1-98f5-41d9-a4e5-dc58dd14c534'),
  ('2bc7f729-f5b3-4f53-8c13-758d08141486', 'd1e6bbd6-7678-4136-8884-28bacb0c34fd'),
  ('43656adc-0198-431a-9f66-cc583d9a941f', '388c95ca-e0d5-47b7-8189-3b85f666a057'),
  ('c8b74fc0-a596-4e9b-b1ab-892a62534ada', 'f82256f8-c176-40c2-8d10-df64d4fb54d7'),
  ('35b06497-02ed-4130-9ed8-de32929ad371', 'f03f0450-8622-43a3-adfc-cd48117c705d'),
  ('7d040e84-8c6a-4b7d-845e-44b2228e889e', '5459c29e-3441-4838-863c-1ddfa3e3522c'),
  ('cd86ffb5-16df-4f2e-a4db-4d41853a46c7', '02753a11-e3a2-4f8c-af5d-4f14f49f7e96'),
  ('b0edc3ed-dda2-4c3d-8c09-0ae8674512a1', '978e41de-5b7d-4a61-845b-641b5c636b42'),
  ('8b57ceb4-08ec-44b7-9677-12577c7bdbc0', '35f997e0-217e-4a4c-84c7-9d20ff72ab1a'),
  ('efe5ec4d-05ba-4328-813b-ad6440c1b50a', '8779a9e7-71ed-4f6c-a303-17e0055cbf37'),
  ('93b0cd0b-d4b1-48b9-bdf0-ebdfadee8de0', '439f9b6b-e518-4ba0-bbb3-6dbc20d25679'),
  ('92d2b3f5-fa6a-4ca6-9f8e-d71cc3a6d371', '89cc0a1c-606b-474b-894e-4bde0f1782de'),
  ('168f70cf-0a29-45ae-a800-8f69d00ed11c', '31bb0a5a-dab6-4c22-aa1b-d2381a49d54c'),
  ('27f69b0a-f713-48be-8e2c-685e4796033b', 'b8b86c7d-e178-4fa0-befd-508c23119312'),
  ('6f144e78-16c6-42af-b49d-fff4ee685749', 'dc473f15-9e91-419f-abd9-3cfdeeb8ddb5'),
  ('f57bba26-8b72-40d2-a6ee-ed0e33d98fb4', 'b5b5fb6d-f3f3-4ae2-ab7b-4538d48167c2'),
  ('66f4fd28-32b2-48e7-98fe-d1413efeeb0d', 'a5730387-ae37-4ecb-81c3-f9688d316859'),
  ('875d9a90-da72-46a8-af50-25b70921f56a', '405ea773-e3eb-4397-90f9-04b11214cd44'),
  ('66389716-ec48-42f2-8a9d-30fe5e1eb7d3', '330821cf-5fa2-4085-b9ed-2e54211c0d92'),
  ('37ebd2c5-51d4-407c-8feb-e05d51922398', '0d270a1a-5a2a-40e4-a3f1-a58e3275994c'),
  ('387be9ff-5129-4a84-a95f-64809a68863e', '94d2bd1f-2d40-40f2-b01a-c79c7386c5ef'),
  ('14d50344-5dd2-4ae1-92bf-0bac0f87cbd4', 'eaacb362-f349-4e89-8391-31a667802fa0'),
  ('bf46c3d5-6f81-437d-96b3-f1bfa09aad71', 'd5983c92-21bf-40db-8192-937f45d25b86'),
  ('19990746-ef92-4293-bfdd-f6fa1bfb330e', '40a04a70-019a-4061-a4ee-ac9d8b54397f'),
  ('9c9ebcab-d3e0-4bad-aefd-e11ce81803c4', '61e2cad7-fb1f-42c4-9413-95aaee1f9f73');

DELETE FROM organization_data_sources
WHERE organization_id IN (SELECT remove_id FROM merge_map_20261017)
  AND EXISTS (
    SELECT 1 FROM organization_data_sources retained
    JOIN merge_map_20261017 ON retained.organization_id = merge_map_20261017.keep_id
    WHERE retained.source_id = organization_data_sources.source_id
      AND merge_map_20261017.remove_id = organization_data_sources.organization_id
  );

UPDATE organization_data_sources
SET organization_id = (SELECT keep_id FROM merge_map_20261017 WHERE remove_id = organization_data_sources.organization_id)
WHERE organization_id IN (SELECT remove_id FROM merge_map_20261017);

UPDATE programs
SET organization_id = (SELECT keep_id FROM merge_map_20261017 WHERE remove_id = programs.organization_id)
WHERE organization_id IN (SELECT remove_id FROM merge_map_20261017);

UPDATE link_checks
SET organization_id = (SELECT keep_id FROM merge_map_20261017 WHERE remove_id = link_checks.organization_id)
WHERE organization_id IN (SELECT remove_id FROM merge_map_20261017);

UPDATE review_queue
SET organization_id = (SELECT keep_id FROM merge_map_20261017 WHERE remove_id = review_queue.organization_id)
WHERE organization_id IN (SELECT remove_id FROM merge_map_20261017);

UPDATE events
SET org_id = (SELECT keep_id FROM merge_map_20261017 WHERE remove_id = events.org_id)
WHERE org_id IN (SELECT remove_id FROM merge_map_20261017);

DELETE FROM profile_favorites
WHERE org_id IN (SELECT remove_id FROM merge_map_20261017)
  AND EXISTS (
    SELECT 1 FROM profile_favorites retained
    JOIN merge_map_20261017 ON retained.org_id = merge_map_20261017.keep_id
    WHERE retained.profile_id = profile_favorites.profile_id
      AND merge_map_20261017.remove_id = profile_favorites.org_id
  );

UPDATE profile_favorites
SET org_id = (SELECT keep_id FROM merge_map_20261017 WHERE remove_id = profile_favorites.org_id)
WHERE org_id IN (SELECT remove_id FROM merge_map_20261017);

DELETE FROM organizations WHERE id IN (SELECT remove_id FROM merge_map_20261017);

DROP TABLE merge_map_20261017;
