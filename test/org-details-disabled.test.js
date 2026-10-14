import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
function extract(name){
 const start=html.indexOf(`function ${name}(`);
 const indent=html.slice(html.lastIndexOf('\n',start)+1,start);
 return html.slice(start,html.indexOf(`\n${indent}}`,start)+indent.length+2);
}
test('organization distance ignores exact coordinates and old distances',()=>{
 const context=vm.createContext({});
 vm.runInContext(extract('programDistance'),context);
 assert.equal(vm.runInContext('programDistance({lat:40,lng:-74,dist:1})',context),null);
});
test('organization contacts cannot become primary actions even with stale API data',()=>{
 const context=vm.createContext({sourceWithUrl:()=>null});
 vm.runInContext(extract('primaryCta'),context);
 assert.equal(vm.runInContext('primaryCta({phone:"555-0100",email:"private@example.test"})',context),null);
 assert.equal(vm.runInContext('primaryCta({website:"https://example.test"}).label',context),'Visit website');
});
test('homepage scripts remain syntactically valid with disabled sections',()=>{
 for(const [,script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  if(script.trim().startsWith('{'))continue;
  new vm.Script(script);
 }
});
