import test from 'node:test';
import assert from 'node:assert/strict';
import {installReadback} from './sheet-readback.mjs';
const original=globalThis.fetch;
for(const bad of [false,true])test('expanded RAW readback '+bad,async()=>{
 const verify=installReadback(async(url,init)=>{
  if(String(url).includes('batchGet')){
   assert.equal(new URL(url).searchParams.get('ranges'),'Organizations!A1:C2');
   return Response.json({valueRanges:[{values:bad?[['wrong']]:[['ID','Name'],['fixture',42]]}]});
  }
  return Response.json({});
 });
 try{
  await fetch('https://sheets.googleapis.com/v4/spreadsheets/fixture-sheet/values:batchUpdate',{method:'POST',headers:{Authorization:'Bearer fixture'},body:JSON.stringify({data:[{range:'Organizations!A1',values:[['ID','Name',''],['fixture',42,'']]}]})});
  if(bad)await assert.rejects(verify(['fixture-sheet']),/mismatch/);else assert.deepEqual(await verify(['fixture-sheet']),{ranges:1,cells:6});
 }finally{globalThis.fetch=original;}
});
test('absence of written ranges cannot pass',async()=>{const verify=installReadback(async()=>Response.json({}));try{await assert.rejects(verify(['none']),/No Sheet writes/);}finally{globalThis.fetch=original;}});
