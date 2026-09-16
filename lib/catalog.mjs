export function searchAssets(assets,{query='',kind='',collection='',category='',license='',animated,maxBytes,sort='name',limit=24,offset=0}={}){
 const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 const rows=assets.filter(a=>{const text=`${a.name} ${a.id} ${a.description} ${a.tags.join(' ')} ${a.category}`.toLowerCase();return terms.every(t=>text.includes(t))&&(!kind||a.kind===kind)&&(!collection||a.collection===collection)&&(!category||a.category===category)&&(!license||a.license===license)&&(animated===undefined||Boolean(a.technical?.animations?.length)===animated)&&(maxBytes===undefined||a.bytes<=maxBytes);});
 rows.sort(sort==='size'?(a,b)=>a.bytes-b.bytes:sort==='triangles'?(a,b)=>(a.technical?.triangles??Infinity)-(b.technical?.triangles??Infinity)||a.name.localeCompare(b.name):(a,b)=>a.name.localeCompare(b.name));
 return {total:rows.length,offset,limit,assets:rows.slice(offset,offset+limit)};
}
export function attributionFor(assets){return [...new Set(assets.map(a=>`${a.attribution} ${a.licenseUrl}`))].join('\n');}
