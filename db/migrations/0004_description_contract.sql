-- 0004 — the description contract.
--
-- `description` is public copy shown to an athlete. The pipeline's verification
-- memos ("Official ... is still that program", "Do not invent a gym", "Not
-- SEWASP") are real, useful engineering artifacts, but they were landing in the
-- same column. An RCOS student found 282 of 356 populated descriptions were
-- memos rather than copy (Aug 2026).
--
-- Give the memos their own home so neither field has to compromise:
--   description    -> what a person reads
--   internal_notes -> what the pipeline remembers between passes
ALTER TABLE organizations ADD COLUMN internal_notes TEXT;

-- Records touched by the repair, so the change is auditable rather than silent.
ALTER TABLE organizations ADD COLUMN notes_split_at TEXT;
