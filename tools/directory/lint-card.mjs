#!/usr/bin/env node
/**
 * Lint a directory card before anyone spends tokens on it.
 *   node lint-card.mjs inbox/foo.json
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { lintCard } from "./lib.mjs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node lint-card.mjs card.json");
  process.exit(1);
}
const card = JSON.parse(readFileSync(resolve(file), "utf8"));
const errors = lintCard(card);
if (errors.length) {
  console.error(`lint-card: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`ok  fills ${(card.fills || []).length}  adds ${(card.adds || []).length}  folds ${(card.folds || []).length}`);
