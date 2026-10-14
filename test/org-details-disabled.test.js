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
test('organization distance uses exact coordinates only supplied by the public API',()=>{
 const context=vm.createContext({state:{near:{lat:42.7,lng:-73.7}},visitorLocation:null,milesBetween:()=>100});
 vm.runInContext(extract('programDistance'),context);
 assert.equal(vm.runInContext('programDistance({publicityConsent:true,lat:40,lng:-74})',context),100);
 assert.equal(vm.runInContext('programDistance({lat:null,lng:null,dist:1})',context),null);
});
test('organization contacts supplied by the public API become actions',()=>{
 const context=vm.createContext({sourceWithUrl:()=>null});
 vm.runInContext(extract('primaryCta'),context);
 assert.equal(vm.runInContext('primaryCta({publicityConsent:true,phone:"555-0100",email:"public@example.test"}).label',context),'Call');
 assert.equal(vm.runInContext('primaryCta({phone:"555-0100",email:"private@example.test"})',context),null);
 assert.equal(vm.runInContext('primaryCta({website:"https://example.test"}).label',context),'Visit website');
});
test('homepage scripts remain syntactically valid with disabled sections',()=>{
 for(const [,script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  if(script.trim().startsWith('{'))continue;
  new vm.Script(script);
 }
});
