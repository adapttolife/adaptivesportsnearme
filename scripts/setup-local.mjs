// `npm run setup`: builds the local database a fresh clone needs, then loads the
// sample listings (db/sample/sample.sql), so `npm run dev` shows a working site.
// Local only: it never touches a Cloudflare account or a remote database, and you
// can run it again any time to start over.
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";

const DB = "asnm-db-staging"; // the binding name in wrangler.json's staging environment, stored on your machine
const files = ["db/schema.sql", "db/intake-schema.sql",
  ...readdirSync("db/migrations").filter((f) => f.endsWith(".sql")).sort().map((f) => "db/migrations/" + f),
  "db/sample/sample.sql"];

for (const file of files) {
  try {
    execFileSync("npx", ["wrangler", "d1", "execute", DB, "--env", "staging", "--local", "--file", file], { stdio: "pipe", encoding: "utf8" });
    console.log("ok      " + file);
  } catch (e) {
    const out = String(e.stdout || "") + String(e.stderr || "");
    // db/schema.sql is the current shape, so older migrations that it already contains say so.
    if (/duplicate column name|already exists/.test(out)) { console.log("skipped " + file + " (already in the schema)"); continue; }
    console.error(out);
    throw new Error("setup stopped at " + file);
  }
}
console.log("\nDone. Run `npm run dev` and open http://localhost:8787");
