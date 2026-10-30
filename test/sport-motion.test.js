// Alec's sport drawings in motion. public/app/motion.js plays data built from
// scripts/motion/specs by scripts/motion/build.py (one file per drawing in
// public/emblems/motion). These checks hold that data to the drawings: every sport
// has a move, each move is made of its drawing as the drawing is today, every move
// starts and ends exactly as drawn, and the player stays out of the page's way.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { MOTION } from "../public/app/motion-index.js";

const sports = new URL("../public/emblems/sports/", import.meta.url);
const motion = new URL("../public/emblems/motion/", import.meta.url);
const read = (url) => readFileSync(url, "utf8");
const keys = read(new URL("SOURCES.tsv", sports))
  .trim()
  .split("\n")
  .slice(1)
  .map((l) => l.split("\t")[0]);
const drawingHash = (key) =>
  createHash("sha256")
    .update(
      [...read(new URL(`${key}.svg`, sports)).matchAll(/\sd="([^"]+)"/g)]
        .map((m) => m[1])
        .join(""),
    )
    .digest("hex");
const names = readdirSync(motion).filter((f) => f.endsWith(".json"));
const files = Object.fromEntries(
  names.map((f) => [f, JSON.parse(read(new URL(f, motion)))]),
);

// A transform list as one 2D matrix [a, b, c, d, e, f], so rotate(720deg) and
// "rotate(x) scale(1,1) rotate(-x)" count as rest the way the browser sees them.
function matrix(t) {
  let m = [1, 0, 0, 1, 0, 0];
  if (t === "none") return m;
  for (const [, name, args] of t.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const v = args.split(/[ ,]+/).filter(Boolean).map(parseFloat);
    let n;
    if (name === "translate") n = [1, 0, 0, 1, v[0], v[1] || 0];
    else if (name === "rotate") {
      const a = (v[0] * Math.PI) / 180;
      n = [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0];
    } else if (name === "scale")
      n = [v[0], 0, 0, v.length > 1 ? v[1] : v[0], 0, 0];
    else if (name === "scaleX") n = [v[0], 0, 0, 1, 0, 0];
    else throw new Error(`unexpected transform ${name}`);
    m = [
      m[0] * n[0] + m[2] * n[1],
      m[1] * n[0] + m[3] * n[1],
      m[0] * n[2] + m[2] * n[3],
      m[1] * n[2] + m[3] * n[3],
      m[0] * n[4] + m[2] * n[5] + m[4],
      m[1] * n[4] + m[3] * n[5] + m[5],
    ];
  }
  return m;
}
const isRest = (t) => {
  const m = matrix(t);
  return (
    [1, 0, 0, 1].every((v, i) => Math.abs(m[i] - v) < 2e-3) &&
    Math.abs(m[4]) < 0.05 &&
    Math.abs(m[5]) < 0.05
  );
};

test("every sport key has a move, and every move file is used", () => {
  assert.equal(
    names.length,
    41,
    `${names.length} move files (one per distinct drawing)`,
  );
  assert.deepEqual(Object.keys(MOTION).sort(), [...keys].sort());
  assert.deepEqual(
    [...new Set(Object.values(MOTION).map((v) => v.split("?")[0]))].sort(),
    [...names].sort(),
  );
});

test("each move is made of its sport's drawing as it is today", () => {
  for (const key of keys) {
    const [file, v] = MOTION[key].split("?v=");
    assert.equal(
      files[file].src,
      drawingHash(key),
      `${key}: the drawing changed since its move was built; run scripts/motion/build.py`,
    );
    // The URL carries the file's own hash: a changed move is a new URL, never a stale cache.
    assert.equal(
      createHash("sha256")
        .update(read(new URL(file, motion)).trimEnd())
        .digest("hex")
        .slice(0, 10),
      v,
      `${key}: motion-index.js is stale; run scripts/motion/build.py`,
    );
  }
});

test("every move starts and ends exactly as drawn", () => {
  for (const [file, d] of Object.entries(files)) {
    assert.ok(d.dur >= 1000 && d.dur <= 5000, `${file}: ${d.dur} ms`);
    d.m.forEach(([, delay, frames], i) => {
      const hidden = new RegExp(`data-m="${i}" style="opacity:0"`).test(d.svg); // a part that only shows in motion
      const restOpacity = hidden ? 0 : 1;
      assert.ok(frames.length >= 2 && delay >= 0, `${file} move ${i}`);
      frames.forEach((f, j) =>
        assert.ok(
          f[0] >= 0 && f[0] <= 1 && (j === 0 || f[0] >= frames[j - 1][0]),
          `${file} move ${i}: offsets in order`,
        ),
      );
      for (const f of [frames[0], frames[frames.length - 1]]) {
        assert.ok(
          f[0] === 0 || f[0] === 1,
          `${file} move ${i}: starts at 0 and ends at 1`,
        );
        assert.ok(
          isRest(f[1]),
          `${file} move ${i} at ${f[0]}: ${f[1]} is not the drawing at rest`,
        );
        if (f[2] != null)
          assert.equal(
            f[2],
            restOpacity,
            `${file} move ${i} at ${f[0]}: opacity`,
          );
      }
    });
    d.b.forEach(([rig, k], i) => {
      for (const row of [k[0], k[k.length - 1]])
        assert.ok(
          row.slice(1).every((v) => Math.abs(v) < 1e-6),
          `${file} bend ${i}: starts and ends unbent`,
        );
      assert.equal(
        rig.pts.length,
        rig.w.length,
        `${file} bend ${i}: a weight for every point`,
      );
      assert.equal(
        1 + [...rig.segs].reduce((n, s) => n + (s === "C" ? 3 : 1), 0),
        rig.pts.length,
        `${file} bend ${i}: points match the outline`,
      );
    });
  }
});

test("moves are only the drawing's shapes: no scripts, images, links or outside references", () => {
  for (const [file, d] of Object.entries(files)) {
    assert.ok(
      !/<script|<image|<foreignObject|<style|<a\b|href=|\son\w+=|@import/i.test(
        d.svg,
      ),
      `${file}: markup is shapes only`,
    );
    for (const [, ref] of d.svg.matchAll(/url\(([^)]*)\)/g)) {
      assert.match(ref, /^#@c\d+$/, `${file}: only its own clip paths`);
      assert.ok(
        d.svg.includes(`id="${ref.slice(1)}"`),
        `${file}: ${ref} is defined`,
      );
    }
    assert.equal(
      d.m.length,
      (d.svg.match(/data-m="/g) || []).length,
      `${file}: a move for every moving group`,
    );
    assert.equal(
      d.b.length,
      (d.svg.match(/data-b="/g) || []).length,
      `${file}: a bend for every bending shape`,
    );
    assert.ok(
      read(new URL(file, motion)).length < 48 * 1024,
      `${file}: keep each move small`,
    );
  }
});

test("the player loads after the page draws and never moves anything for reduced motion", () => {
  const app = read(new URL("../public/app/app.js", import.meta.url));
  const player = read(new URL("../public/app/motion.js", import.meta.url));
  const shell = read(new URL("../public/index.html", import.meta.url));
  assert.ok(
    !/^import .*motion/m.test(app),
    "app.js must not import the player up front",
  );
  assert.match(
    app,
    /import\("\.\/motion\.js"\)/,
    "app.js loads the player on demand",
  );
  assert.match(
    app,
    /function sportMotion[\s\S]{0,200}prefers-reduced-motion: reduce/,
    "no player at all for reduced motion",
  );
  assert.ok(
    !shell.includes("motion"),
    "the page shell does not preload the player",
  );
  assert.match(player, /prefers-reduced-motion: reduce/);
  assert.match(player, /saveData/);
  assert.match(player, /forced-colors: active/);
});
