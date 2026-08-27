#!/usr/bin/env node
/** Read-only compare of live vs tester public lists. */
import { live, staging, count } from "./lib.mjs";

const liveN = count(live("SELECT COUNT(*) AS n FROM organizations WHERE is_public=1 AND STATUS='active'".replace("STATUS","status")));
const testerN = count(staging("SELECT COUNT(*) AS n FROM organizations WHERE is_public=1 AND status='active'"));
const testerDupPublic = count(staging("SELECT COUNT(*) AS n FROM organizations WHERE status='duplicate' AND is_public=1"));
const testerHidden = count(staging("SELECT COUNT(*) AS n FROM organizations WHERE is_public=0"));
const pending = count(staging("SELECT COUNT(*) AS n FROM review_queue WHERE status='pending'"));

console.log(`live public:   ${liveN}  (locked)`);
console.log(`tester public: ${testerN}`);
console.log(`tester hidden: ${testerHidden}  (including twins + inactive)`);
console.log(`tester twins still public: ${testerDupPublic}`);
console.log(`review pile:   ${pending}`);
console.log(`delta (tester − live): ${testerN - liveN}`);
