-- Additive. Safe to apply while older builds are still writing (they omit the column).
ALTER TABLE intake ADD COLUMN lane TEXT;
