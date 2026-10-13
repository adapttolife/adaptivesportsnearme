// A search link (/?q=tennis, the header search on every listing page) must show
// live results once the directory loads. The hydration render is skipped while
// a form in #view is half filled in; the hero search box mirrors state.q and is
// put back by the render, so it must not count as one.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const index = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");

function viewFormBusyFrom(doc) {
  const at = index.indexOf("function viewFormBusy(");
  const end = index.indexOf("\n\t\t\t}\n", at) + 5;
  const src = index.slice(at, end);
  // eslint-disable-next-line no-new-func
  return new Function("document", src + "\nreturn viewFormBusy;")(doc);
}

function fakeDocument(inputs, active = null) {
  const view = {
    contains: (el) => inputs.includes(el),
    querySelectorAll: () => inputs,
  };
  return { activeElement: active, getElementById: (id) => (id === "view" ? view : null) };
}

test("a search term in the hero box does not block the live-data render", () => {
  const q = { id: "qHero", type: "text", value: "tennis", tagName: "INPUT" };
  assert.equal(viewFormBusyFrom(fakeDocument([q]))(), false);
});

test("a half-typed email, or any focused field, still blocks it", () => {
  const email = { id: "", type: "email", value: "alex@", tagName: "INPUT" };
  assert.equal(viewFormBusyFrom(fakeDocument([email]))(), true);
  const q = { id: "qHero", type: "text", value: "ten", tagName: "INPUT" };
  assert.equal(viewFormBusyFrom(fakeDocument([q], q))(), true, "typing in the search box is not interrupted");
});
