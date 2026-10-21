// The "when" fields on Add an event (Alec, 2026-10-17, on an iPhone: "too squished and
// sloppy"). Phones get one field per row like the rest of the form; from 600px the start
// date and time share a row. Date and time boxes drop the iPhone's native drawing, which
// made them wider than their field, 28px tall and centered.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compactCss, cssIncludes } from "./helpers/css.js";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const forms = read("public/app/views/forms.js");
const formsCss = read("public/app/views/forms.css");
const appCss = read("public/app/app.css");

test("the labels say which date is which, and when the end date is needed", () => {
  const when = forms.slice(forms.indexOf('<div class="fm-when">'), forms.indexOf("</div>", forms.indexOf('<div class="fm-when">')));
  assert.match(when, /name: "ed", label: "Start date", type: "date", required: true/);
  assert.match(when, /name: "et", label: "Start time", type: "time"/);
  assert.match(when, /name: "ee", label: "End date", type: "date", hint: "Only if it runs more than one day\."/);
});

test("phones get one field per row; the start date and time pair up from 600px", () => {
  assert.ok(cssIncludes(formsCss, ".v-forms .fm-when { display: grid; grid-template-columns: minmax(0, 1fr);"), "one column by default");
  assert.ok(cssIncludes(formsCss, "@media (min-width: 600px) { .v-forms .fm-when { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); } }"), "two columns from 600px");
  assert.ok(cssIncludes(formsCss, ".v-forms .fm-two { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);"), "on the same column lines as City and State");
  assert.doesNotMatch(compactCss(formsCss), /\.fm-when>\.field:first-child/, "no field spans or reflows by position");
});

test("date and time boxes take the shared box style on iPhones", () => {
  assert.ok(cssIncludes(appCss, 'input[type="date"], input[type="time"], input[type="datetime-local"] { appearance: none; -webkit-appearance: none; display: block; min-width: 0; max-width: 100%; padding-top: 13px; padding-bottom: 13px; line-height: 26px; text-align: left; }'));
  assert.ok(cssIncludes(appCss, 'input[type="date"]::-webkit-date-and-time-value, input[type="time"]::-webkit-date-and-time-value, input[type="datetime-local"]::-webkit-date-and-time-value { min-height: 1.5em; text-align: left; }'));
  // The shared box rule still sets the height every field shares.
  assert.ok(cssIncludes(appCss, 'input[type="date"], input[type="time"], input[type="datetime-local"], input:not([type]), select, textarea { width: 100%; min-height: 56px;'));
});
