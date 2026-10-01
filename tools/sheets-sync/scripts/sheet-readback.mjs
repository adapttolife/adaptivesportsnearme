export function installReadback(fetchImpl=globalThis.fetch){
const originalFetch=fetchImpl;
const writes=new Map();
function fullRange(range,values){
 const m=range.match(/^(.*!)([A-Z]+)([1-9]\d*)/);if(!m||!values?.length)throw Error('Unsupported write range');
 let col=0;for(const c of m[2])col=col*26+c.charCodeAt(0)-64;
 let end=col+Math.max(...values.map(r=>r.length))-1,label='';while(end){end--;label=String.fromCharCode(65+end%26)+label;end=Math.floor(end/26);}
 return `${m[1]}${m[2]}${m[3]}:${label}${Number(m[3])+values.length-1}`;
}
function normalized(rows){const x=rows.map(r=>{const a=[...r];while(a.length&&(a.at(-1)===''||a.at(-1)==null))a.pop();return a;});while(x.length&&!x.at(-1).length)x.pop();return x;}
globalThis.fetch=async(input,init={})=>{
 const url=String(input);const response=await originalFetch(input,{...init,signal:init.signal??AbortSignal.timeout(40000)});
 if(response.ok&&url.startsWith('https://sheets.googleapis.com/v4/spreadsheets/')&&init.method==='POST'&&typeof init.body==='string'){
  const body=JSON.parse(init.body);const sid=new URL(url).pathname.split('/')[3];const auth=new Headers(init.headers).get('Authorization');
  if(url.includes('/values:batchUpdate'))for(const d of body.data||[])writes.set(sid+'|'+d.range,{sid,auth,range:fullRange(d.range,d.values),values:d.values});
  else if(url.includes(':append')&&body.values){const out=await response.clone().json();if(!out.updates?.updatedRange)throw Error('Append response lacks readback range');writes.set(sid+'|'+out.updates.updatedRange,{sid,auth,range:out.updates.updatedRange,values:body.values});}
 }
 return response;
};
async function verify(sids){
 let ranges=0,cells=0;
 for(const sid of sids){const entries=[...writes.values()].filter(x=>x.sid===sid);if(!entries.length)continue;
  for(let i=0;i<entries.length;i+=40){const part=entries.slice(i,i+40);const q=new URLSearchParams({valueRenderOption:'UNFORMATTED_VALUE'});for(const d of part)q.append('ranges',d.range);
   const r=await originalFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sid}/values:batchGet?${q}`,{headers:{Authorization:part[0].auth},signal:AbortSignal.timeout(40000)});if(!r.ok)throw Error('Sheets readback HTTP '+r.status);const out=await r.json();if(out.valueRanges?.length!==part.length)throw Error('Readback range count differs');
   for(let j=0;j<part.length;j++){if(JSON.stringify(normalized(part[j].values))!==JSON.stringify(normalized(out.valueRanges[j].values||[])))throw Error('Sheet readback mismatch: '+part[j].range);ranges++;cells+=part[j].values.reduce((n,row)=>n+row.length,0);}
  }
 }
 if(!ranges)throw Error('No Sheet writes verified');return {ranges,cells};
}

return verify;
}
