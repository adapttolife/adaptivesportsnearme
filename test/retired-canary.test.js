import { test } from "node:test";
import assert from "node:assert/strict";
import { runIntakeCanary, notifyIntakeRow, sweepIntake } from "../src/intake.js";
test("retired generator has no side effects", async()=>{
 const env=new Proxy({}, {get(){throw Error("unexpected side effect")}});
 assert.equal((await runIntakeCanary(env,"offline")).stage,"disabled-by-owner");
 assert.equal(await notifyIntakeRow(env,{is_canary:1}),false);
});
test("real notifications still send to the canonical inbox; retry excludes canaries", async()=>{
 const sent=[],queries=[];
 const env={SEND_EMAIL:{send:async m=>sent.push(m)},INTAKE:{prepare:q=>{queries.push(q);return {bind:()=>({run:async()=>({success:true}),all:async()=>({results:[]})})};}}};
 const row={id:"offline",is_canary:0,email:"submitter@example.com",summary:"Offline test",payload:"{}"};
 assert.equal(await notifyIntakeRow(env,row),true);
 assert.equal(sent[0].to,"hello@adapttolife.org");
 await sweepIntake(env);
 assert(queries.some(q=>q.includes("COALESCE(is_canary, 0) = 0")));
});
