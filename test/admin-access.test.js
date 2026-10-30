import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { createAdminItem, isAdminEmail } from "../src/admin-access.js";

test("admin sign-in accepts only the two allowed mail domains", () => {
  assert.equal(isAdminEmail("Person@adaptivesportsnearme.com"), "person@adaptivesportsnearme.com");
  assert.equal(isAdminEmail("person@faisaln.com"), "person@faisaln.com");
  assert.equal(isAdminEmail("person@sub.adaptivesportsnearme.com"), "");
  assert.equal(isAdminEmail("person@example.com"), "");
});

function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  return {
    sqlite,
    db: {
      prepare(sql) {
        const statement = sqlite.prepare(sql);
        let values = [];
        return {
          bind(...args) { values = args; return this; },
          async first() { return statement.get(...values) || null; },
          async run() { return { meta: { changes: Number(statement.run(...values).changes) } }; },
        };
      },
    },
  };
}

test("a blog post can be created without an optional subtitle", async () => {
  const { sqlite, db } = database();
  try {
    const post = await createAdminItem(db, "blog", {
      title: "Adaptive tennis guide",
      slug: "adaptive-tennis-guide",
      content_markdown: "# Ready to play",
    });
    assert.equal(post.subtitle, "");
    assert.equal(post.content_markdown, "# Ready to play");
  } finally {
    sqlite.close();
  }
});

test("a blog thumbnail keeps its full data URL", async () => {
  const { sqlite, db } = database();
  try {
    const thumbnail = `data:image/png;base64,${"a".repeat(8_000)}`;
    const post = await createAdminItem(db, "blog", {
      title: "Adaptive tennis guide",
      slug: "adaptive-tennis-guide",
      content_markdown: "# Ready to play",
      thumbnail_data_url: thumbnail,
    });
    assert.equal(post.thumbnail_data_url, thumbnail);
  } finally {
    sqlite.close();
  }
});
