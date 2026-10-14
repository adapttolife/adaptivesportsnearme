// Assemble the exact export projection from one read of each input table.
// SQLite NOCASE folds ASCII only, not locale/Unicode case; keep its byte ordering.
export function sqliteNoCase(a,b){
 if(a===null||a===undefined)return b===null||b===undefined?0:-1;
 if(b===null||b===undefined)return 1;
 const x=Buffer.from(String(a)),y=Buffer.from(String(b));
 const fold=c=>c>=65&&c<=90?c+32:c;
 for(let i=0;i<Math.min(x.length,y.length);i++){const diff=fold(x[i])-fold(y[i]);if(diff)return diff;if(x[i]===0)break;}
 return x.length-y.length;
}
const SNAPSHOT=Symbol('organization snapshot');
export function beginProjection(env){return {...env,[SNAPSHOT]:undefined};}
export async function readOrganizations(db,env){
 const cached=env[SNAPSHOT];
 if(cached){if(cached.db!==db)throw Error('Cross-database snapshot refused');const r=await cached.promise;return {...r,meta:{...r.meta,rows_read:0,rows_written:0}};}
 const entry={db,promise:db.prepare('SELECT * FROM organizations').all()};env[SNAPSHOT]=entry;
 try{return await entry.promise;}catch(e){if(env[SNAPSHOT]===entry)delete env[SNAPSHOT];throw e;}
}
export function assembleDirectory(orgRows,sourceRows,links,queueRows,changeRows){
 const sourcesById=new Map(sourceRows.filter(s=>s.source_id!=null).map(s=>[s.source_id,s]));
 const names=new Map(),counts=new Map(),orgById=new Map(orgRows.filter(o=>o.id!=null).map(o=>[o.id,o]));
 // links arrive in (organization_id,source_id) primary-index order, matching the old correlated lookup.
 for(const link of links){
  if(link.source_id!=null)counts.set(link.source_id,(counts.get(link.source_id)||0)+1);
  const name=sourcesById.get(link.source_id)?.source_name;
  if(link.organization_id!=null&&name!=null){if(!names.has(link.organization_id))names.set(link.organization_id,[]);names.get(link.organization_id).push(name);}
 }
 const orgs=orgRows.map(o=>({...o,sources:names.has(o.id)?names.get(o.id).join('; '):null})).sort((a,b)=>sqliteNoCase(a.name,b.name));
 const sources=sourceRows.map(s=>({...s,orgs_linked:s.source_id==null?0:counts.get(s.source_id)||0}));
 const attach=rows=>rows.map(r=>({...r,org_name:r.organization_id==null?null:orgById.get(r.organization_id)?.name??null}));
 return {orgs,sources,queue:attach(queueRows),changes:attach(changeRows)};
}
