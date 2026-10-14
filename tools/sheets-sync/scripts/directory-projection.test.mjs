import test from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {assembleDirectory,readOrganizations,beginProjection,sqliteNoCase} from './directory-projection.mjs';
const fixture=`import sqlite3,json,sys
x=json.load(sys.stdin);d=sqlite3.connect(':memory:');d.row_factory=sqlite3.Row
d.executescript('CREATE TABLE organizations(id TEXT PRIMARY KEY,name TEXT,note TEXT);CREATE TABLE data_sources(source_id TEXT PRIMARY KEY,source_name TEXT);CREATE TABLE organization_data_sources(organization_id TEXT,source_id TEXT,PRIMARY KEY(organization_id,source_id));')
d.executemany('INSERT INTO organizations VALUES (?,?,?)',x['orgs']);d.executemany('INSERT INTO data_sources VALUES (?,?)',x['sources']);d.executemany('INSERT INTO organization_data_sources VALUES (?,?)',x['links'])
def q(s):return [dict(r) for r in d.execute(s)]
print(json.dumps({'orgRows':q('SELECT * FROM organizations'),'sourceRows':q('SELECT * FROM data_sources ORDER BY source_name COLLATE NOCASE'),'links':q('SELECT organization_id,source_id FROM organization_data_sources ORDER BY organization_id,source_id'),'expectedOrgs':q("SELECT o.*, (SELECT group_concat(s.source_name, '; ') FROM organization_data_sources ods JOIN data_sources s ON s.source_id=ods.source_id WHERE ods.organization_id=o.id) AS sources FROM organizations o ORDER BY o.name COLLATE NOCASE"),'expectedSources':q('SELECT d.*, (SELECT count(*) FROM organization_data_sources ods WHERE ods.source_id=d.source_id) AS orgs_linked FROM data_sources d ORDER BY source_name COLLATE NOCASE')}))`;
test('single-read projection is identical to SQLite joins, counts and NOCASE, including nulls, orphans and Unicode',()=>{
 const names=['Alpha','alpha','École','école','\ue000','😀','A\0z','a\0b','a\0zz',null,'','İ','ß','Z'];
 for(let i=0;i<100;i++)names.push(String.fromCodePoint(i*421)+String.fromCharCode(65+i%26));
 const f={orgs:names.map((n,i)=>[String(i),n,'verified field retained']),sources:[['a','Source A'],['b',''],['c',null],[null,'Null key'],['z','Unused']],links:[['0','b'],['0','a'],['0','c'],['1','missing'],['2','c'],['missing','a'],[null,'a'],['4',null]]};
 const data=JSON.parse(execFileSync('python3',['-c',fixture],{input:JSON.stringify(f),encoding:'utf8'}));
 const q=[{organization_id:'0',extra:'retained'},{organization_id:'missing'},{organization_id:null}];
 const r=assembleDirectory(data.orgRows,data.sourceRows,data.links,q,q);
 assert.deepEqual(r.orgs,data.expectedOrgs);assert.deepEqual(r.sources,data.expectedSources);
 assert.deepEqual(r.queue,[{organization_id:'0',extra:'retained',org_name:'Alpha'},{organization_id:'missing',org_name:null},{organization_id:null,org_name:null}]);assert.deepEqual(r.changes,r.queue);
});
test('empty inputs stay empty',()=>assert.deepEqual(assembleDirectory([],[],[],[],[]),{orgs:[],sources:[],queue:[],changes:[]}));
test('read once within run; reset on next run, isolate environments, never cache failure',async()=>{
 let n=0;const db={prepare:sql=>{assert.equal(sql,'SELECT * FROM organizations');return{all:async()=>{n++;return {results:[{id:n}],meta:{rows_read:1,rows_written:0}};}};}};
 const env=beginProjection({});const first=await readOrganizations(db,env),second=await readOrganizations(db,env);
 assert.equal(n,1);assert.deepEqual(first.results,second.results);assert.equal(first.meta.rows_read,1);assert.equal(second.meta.rows_read,0);
 await readOrganizations(db,beginProjection(env));await readOrganizations(db,beginProjection({}));assert.equal(n,3);
 await assert.rejects(readOrganizations({},env),/Cross-database/);
 let fail=true;const bad={prepare:()=>({all:async()=>{if(fail)throw Error('fixture failure');return {results:[],meta:{rows_read:0}};}})};const e=beginProjection({});
 await assert.rejects(readOrganizations(bad,e));fail=false;assert.deepEqual((await readOrganizations(bad,e)).results,[]);
});
