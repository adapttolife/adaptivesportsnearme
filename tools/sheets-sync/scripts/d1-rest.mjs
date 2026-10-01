// Existing D1 binding surface backed by the documented Cloudflare REST query API.
// No automatic write retries: ambiguous outcomes must remain failures.
export class D1Rest {
 constructor({account,database,token,fetchImpl=globalThis.fetch,metrics={queries:0,rows_read:0,rows_written:0}}){
  if(!/^[a-f0-9]{32}$/.test(account)||!/^[a-f0-9-]{36}$/.test(database)||!token)throw Error('Invalid D1 target/credential');
  Object.assign(this,{account,database,token,fetchImpl,metrics});
 }
 prepare(sql){if(typeof sql!=='string'||!sql.trim())throw Error('Empty SQL');return new Statement(this,sql,[]);}
 async execute(statements){
  if(!statements.length)return [];
  if(statements.some(s=>s.db!==this))throw Error('Cross-database batch refused');
  const body=statements.map(s=>({sql:s.sql,params:s.params}));
  const response=await this.fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${this.account}/d1/database/${this.database}/query`,{method:'POST',headers:{Authorization:`Bearer ${this.token}`,'Content-Type':'application/json'},body:JSON.stringify(body.length===1?body[0]:{batch:body}),signal:AbortSignal.timeout(45000)});
  let result;try{result=await response.json();}catch{throw Error(`D1 non-JSON response (${response.status})`);}
  if(!response.ok||!result.success)throw Error(`D1 API failed (${response.status}): ${JSON.stringify(result.errors||[]).slice(0,800)}`);
  if(!Array.isArray(result.result)||result.result.length!==statements.length||result.result.some(r=>!r.success||!Array.isArray(r.results)))throw Error('D1 result shape or SQL success mismatch');
  for(const [index,r] of result.result.entries()){
   if(typeof r.meta?.rows_read!=='number'||typeof r.meta?.rows_written!=='number')throw Error('D1 cost metadata missing');
   this.metrics.queries++;this.metrics.rows_read+=r.meta.rows_read;this.metrics.rows_written+=r.meta.rows_written;
   (this.metrics.statements??=[]).push({sql:statements[index].sql.replace(/\s+/g,' ').trim(),rows_read:r.meta.rows_read,rows_written:r.meta.rows_written,rows_returned:r.results.length});
  }
  return result.result;
 }
 batch(statements){return this.execute(statements);}
}
class Statement {
 constructor(db,sql,params){Object.assign(this,{db,sql,params});}
 bind(...params){if(params.some(v=>v!==null&&typeof v!=='string'&&typeof v!=='number'))throw Error('Unsupported D1 parameter');return new Statement(this.db,this.sql,params);}
 async all(){return (await this.db.execute([this]))[0];}
 async run(){return this.all();}
 async first(column){const row=(await this.all()).results[0]??null;if(column===undefined||row===null)return row;if(!(column in row))throw Error('D1 column absent');return row[column];}
}
