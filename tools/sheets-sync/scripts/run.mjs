import fs from 'node:fs';
import crypto from 'node:crypto';
import {D1Rest} from './d1-rest.mjs';
import {runSheets as production} from '../assets/production-engine.mjs';
import {runSheets as staging} from '../assets/staging-engine.mjs';
const manifest=JSON.parse(fs.readFileSync(new URL('../assets/manifest.json',import.meta.url),'utf8'));
for(const [file,proof] of Object.entries(manifest.modules))if(crypto.createHash('sha256').update(fs.readFileSync(new URL('../assets/'+file,import.meta.url))).digest('hex')!==proof.host_sha256)throw Error('Engine provenance mismatch');
const targets={production:{db:'055916fd-3e58-4599-b11e-ffaedabe0f0b',sheet:'1vI_080sDNd74g22uucvx2PmC7JSGb7Df-jHX_Vzeo-o',run:production},staging:{db:'d3f67da7-60a3-44b6-9215-28665492d3f9',sheet:'1AGsl9sF_EcsLJZUrFb6QZg2AXmW6SQ5hmJDTbE4rMs4',run:staging}};
import {installReadback} from './sheet-readback.mjs';
const verify=installReadback();
const results={started_at:new Date().toISOString(),status:'running',environments:{}};
for(const [name,t] of Object.entries(targets)){
 const db=new D1Rest({account:manifest.account,database:t.db,token:process.env.CLOUDFLARE_API_TOKEN});
 const env={...manifest.vars,GOOGLE_SA_JSON:process.env.GOOGLE_SA_JSON,DB:db,ASNM_MASTER_SHEET_ID:t.sheet,ENV_NAME:name==='production'?'sheets-prod':'staging'};
 if(name==='staging')env.ATL_CRM_SHEET_ID=manifest.vars.STAGING_CRM_SHEET_ID;
 try{const value=await t.run(env);const verified=await verify([t.sheet,...(name==='staging'?[env.ATL_CRM_SHEET_ID]:[])]);results.environments[name]={status:'healthy',value,verified,metrics:db.metrics};}
 catch(e){results.environments[name]={status:'failed',error:String(e.message),metrics:db.metrics};}
}
results.finished_at=new Date().toISOString();results.cpu_usage_us=process.cpuUsage();results.max_rss_kb=process.resourceUsage().maxRSS;results.total_rows_read=Object.values(results.environments).reduce((n,r)=>n+r.metrics.rows_read,0);
results.status=Object.values(results.environments).every(r=>r.status==='healthy')&&results.total_rows_read<60000?'healthy':'failed';
if(results.total_rows_read>=60000)results.budget_error='Per-run read allowance exceeded; investigate before increasing';
fs.writeFileSync(process.env.ASNM_RESULT_PATH,JSON.stringify(results,null,2),{mode:0o600});
if(results.status!=='healthy')process.exitCode=1;
