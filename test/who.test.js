import test from "node:test";
import assert from "node:assert/strict";
import { whoTags, whoText, WHO_ORDER, WHO_LABELS } from "../public/app/who.js";

// Served text from live listings (adaptivesportsnearme.com/api/organizations/:id, 2026-10-21).
const REAL = [
  ["Children and adults with physical, cognitive, visual and hearing disabilities, and veterans.", ["veterans", "kids", "adults", "deaf", "intellectual", "physical"]],
  ["People of all ages who are blind or have low vision", ["blind"]],
  ["Youth and adults with autism", ["kids", "adults", "autism"]],
  ["Disabled veterans, people who are blind or have low vision, and people with other disabilities.", ["veterans", "blind"]],
  ["People who are deaf, blind, deafblind or have additional disabilities.", ["blind", "deaf"]],
  ["Students in grades 1-12 with physical disabilities and qualifying health or sensory impairments.", ["kids", "physical"]],
  ["Children and/or adults with physical, intellectual or developmental disabilities who face barriers to conventional baseball.", ["kids", "adults", "intellectual", "physical"]],
  ["Children and adults with disabilities; veterans.", ["veterans", "kids", "adults"]],
  ["People with intellectual and developmental disabilities.", ["intellectual"]],
  ["People with cognitive/developmental disabilities; People with physical/recovery disabilities; People with emotional/social disabilities, mental health conditions, or PTSD.", ["intellectual", "physical"]],
  ["People with physical, intellectual or emotional challenges; veterans; at-risk youth; abuse and trauma survivors.", ["veterans", "kids", "intellectual", "physical"]],
  ["Veterans, active-duty military and military families.", ["veterans"]],
  ["Adults with spinal cord injury, amputation, stroke or traumatic brain injury (TBI).", ["adults", "physical", "brain"]],
  ["Kids ages 5 to 17 who use a wheelchair", ["kids", "physical"]],
];

test("who it's for: real served text gives exact codes, in chip order", () => {
  for (const [text, want] of REAL) assert.deepEqual(whoTags(text), want, text);
});

test("who it's for: word boundaries keep look-alike words out", () => {
  assert.deepEqual(whoTags("Insight sessions after public hearings."), [], "insight is not sight, hearings is not hearing");
  assert.deepEqual(whoTags("Open to everyone; adulthood not required"), [], "adulthood is not adults");
  assert.deepEqual(whoTags("All."), []);
  assert.deepEqual(whoTags("First responders and their families."), [], "first responders are not veterans");
  assert.deepEqual(whoTags("Skidmore campus paddlers"), [], "Skidmore is not kids");
  assert.deepEqual(whoTags("Physicians welcome"), [], "physicians is not physical");
  assert.deepEqual(whoTags("Sighted guides and blind runners"), ["blind"]);
  assert.deepEqual(whoTags(""), []);
  assert.deepEqual(whoTags(null), []);
});

test("who it's for: a veteran meetup serves veterans even when its text doesn't say", () => {
  assert.deepEqual(whoTags("", "veteran-meetup"), ["veterans"]);
  assert.deepEqual(whoTags("Open to all; families welcome.", "veteran-meetup"), ["veterans"]);
  assert.deepEqual(whoTags("", "tennis"), []);
});

test("who it's for: read from the served part only, never the sports or the name", () => {
  const d = "Sports and activities: blind hockey; deaf soccer; wheelchair basketball. Athletes served: Youth and adults with autism";
  assert.equal(whoText(d), "Youth and adults with autism");
  assert.deepEqual(whoTags(whoText(d)), ["kids", "adults", "autism"]);
  assert.equal(whoText("Sports and activities: blind hockey."), "", "a sport named for blind athletes does not say who it serves");
  assert.equal(whoText("Wounded Warrior Project chapter"), "", "no served part: nothing, even when the name sounds like it");
});

test("who it's for: veteran research rows read every 'Who it's for:' part", () => {
  const meet = "Coffee and conversation. When: Second Tuesday, 9 a.m. Who it's for: Veterans and first responders and their families.";
  assert.equal(whoText(meet), "Veterans and first responders and their families.");
  assert.deepEqual(whoTags(whoText(meet), "veteran-meetup"), ["veterans"]);
  const two = "Programs: Art therapy. Painting together. Who it's for: Veterans with disabilities. Also equine therapy: Grooming and riding. Who it's for: Youth from military families.";
  assert.equal(whoText(two), "Veterans with disabilities. Youth from military families.");
  assert.deepEqual(whoTags(whoText(two), "art-therapy"), ["veterans", "kids"]);
});

test("who it's for: every code has a label, in one order", () => {
  assert.deepEqual(Object.keys(WHO_LABELS), WHO_ORDER);
  assert.equal(WHO_LABELS.blind, "Blind or low vision");
  for (const l of Object.values(WHO_LABELS)) assert.ok(!/[–—]/.test(l), "no dashes in labels");
});
