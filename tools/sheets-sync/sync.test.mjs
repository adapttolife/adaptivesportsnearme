import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
const read=name=>fs.readFileSync(new URL(name,import.meta.url),'utf8');
const main=read('index.js');
const marker='import { runSheets as runStagingSheets }';
const wrapper=main.slice(main.lastIndexOf(marker)).replace(/^import[^\n]+\n/,'').replace('export default','return');
const make=(a,b)=>new Function('runSheets','runStagingSheets',wrapper)(a,b);
for(const cron of ['* * * * *','*/20 * * * *','0 */2 * * *','',null])test('reject unexpected cron '+cron,async()=>{
 const w=make(()=>assert.fail('production touched'),()=>assert.fail('staging touched'));
 await w.scheduled({cron},{},{waitUntil:()=>assert.fail('waitUntil touched')});
});
for(const failing of [null,'production','staging'])test('environment isolation, failure='+failing,async()=>{
 const called=[];let done;const db={},stage={};
 const w=make(async env=>{assert.equal(env.DB,db);assert.equal(env.ASNM_MASTER_SHEET_ID,'prod-sheet');called.push('production');if(failing==='production')throw Error('planned');return 'prod';},async env=>{assert.equal(env.DB,stage);assert.equal(env.ASNM_MASTER_SHEET_ID,'stage-sheet');assert.equal(env.ATL_CRM_SHEET_ID,'stage-crm');called.push('staging');if(failing==='staging')throw Error('planned');return 'stage';});
 await w.scheduled({cron:'10,30,50 * * * *'},{DB:db,STAGING_DB:stage,ASNM_MASTER_SHEET_ID:'prod-sheet',STAGING_MASTER_SHEET_ID:'stage-sheet',STAGING_CRM_SHEET_ID:'stage-crm'},{waitUntil:p=>done=p});
 if(failing)await assert.rejects(done,new RegExp(failing));else await done;
 assert.deepEqual(called.sort(),['production','staging']);
});
for(const file of ['index.js','staging-engine.js'])for(const fail of ['sheet-intake',...(file==='staging-engine.js'?['crm-contacts']:[])])test(file+' reports '+fail+' failure',async()=>{
 const s=read(file);const fn=s.slice(s.indexOf('async function runSheets('),s.indexOf('__name(runSheets'));const lanes=[];
 const run=new Function('runLane',fn+';return runSheets;')(async(env,lane)=>{lanes.push(lane);if(lane===fail)throw Error('planned '+fail);return {processed:0,flagged:0,detail:'no new rows'};});
 await assert.rejects(run({ATL_CRM_SHEET_ID:'stage-crm'}),/Sync partially failed/);assert(lanes.includes('sheet-export'));
});
