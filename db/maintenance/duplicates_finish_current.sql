WITH duplicate_names AS (
  SELECT lower(trim(name)) AS name_key
  FROM programs
  GROUP BY lower(trim(name))
  HAVING COUNT(*) > 1
), renamed AS (
  SELECT
    id,
    trim(name) || ' (' ||
      CASE
        WHEN trim(COALESCE(city, '')) <> '' AND trim(COALESCE(state, '')) <> '' THEN trim(city) || ', ' || trim(state)
        WHEN trim(COALESCE(city, '')) <> '' THEN trim(city)
        WHEN trim(COALESCE(state, '')) <> '' THEN trim(state)
        ELSE 'Location'
      END || ')' ||
      CASE
        WHEN COUNT(*) OVER (
          PARTITION BY lower(trim(name)), lower(trim(COALESCE(city, ''))), upper(trim(COALESCE(state, '')))
        ) > 1
        THEN ' ' || ROW_NUMBER() OVER (
          PARTITION BY lower(trim(name)), lower(trim(COALESCE(city, ''))), upper(trim(COALESCE(state, '')))
          ORDER BY id
        )
        ELSE ''
      END AS new_name
  FROM programs
  WHERE lower(trim(name)) IN (SELECT name_key FROM duplicate_names)
)
UPDATE programs
SET name = (SELECT new_name FROM renamed WHERE renamed.id = programs.id)
WHERE id IN (SELECT id FROM renamed);
