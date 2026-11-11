import assert from "node:assert/strict";
import test from "node:test";

import worker from "../src/index.js";
import { maintenanceModeEnabled } from "../src/maintenance-mode.js";

function database(value) {
  return {
    prepare(sql) {
      return {
        async first() {
          return sql.includes("site_settings") ? { value } : null;
        },
      };
    },
  };
}

test("maintenance mode reads the site setting", async () => {
  assert.equal(await maintenanceModeEnabled(database("1")), true);
  assert.equal(await maintenanceModeEnabled(database("0")), false);
});

test("maintenance mode replaces ASNM pages and API responses", async () => {
  const env = { DB: database("true"), ENV_NAME: "staging" };
  const page = await worker.fetch(
    new Request("https://adaptivesportsnearme.com/programs"),
    env,
    {},
  );
  assert.equal(page.status, 503);
  assert.match(await page.text(), /We will be back shortly/);

  const api = await worker.fetch(
    new Request("https://adaptivesportsnearme.com/api/directory"),
    env,
    {},
  );
  assert.equal(api.status, 503);
  assert.deepEqual(await api.json(), {
    ok: false,
    error: "Adaptive Sports Near Me is under maintenance.",
  });

  const status = await worker.fetch(
    new Request("https://adaptivesportsnearme.com/api/maintenance"),
    env,
    {},
  );
  assert.deepEqual(await status.json(), { ok: true, enabled: true });
});
