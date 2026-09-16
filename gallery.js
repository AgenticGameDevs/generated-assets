const $=id=>document.getElementById(id);
const assets=await fetch('catalog.json').then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json();}).catch(e=>{$('summary').textContent='The collection could not load. Serve this folder over HTTP (npm start).';throw e;});
let kind='';
const size=b=>b<1024?`${b} B`:b<1024**2?`${(b/1024).toFixed(0)} KB`:`${(b/1024**2).toFixed(1)} MB`;
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
$('summary').textContent=`${assets.length} assets · 2 worlds · Open licenses · ${size(assets.reduce((n,a)=>n+a.bytes,0))}`;
function open(a){
 $('preview').replaceChildren();
 if(a.kind==='model'){
  const iframe=document.createElement('iframe');iframe.title=`Interactive preview of ${a.name}`;iframe.src=`viewer.html?asset=${encodeURIComponent(a.path)}`;$('preview').append(iframe);
 }else if(a.kind==='sound'){
  const audio=document.createElement('audio');audio.controls=true;audio.src=a.path;$('preview').append(audio);
 }else{const img=document.createElement('img');img.src=a.path;img.alt=a.name;$('preview').append(img);}
 $('detail-kind').textContent=`${a.sourceProject.toUpperCase()} / ${a.kind.toUpperCase()}`;
 $('detail-name').textContent=a.name;$('provenance').textContent=a.provenance;
 $('metadata').textContent=`${size(a.bytes)} · ${a.license} · ${a.path.split('.').at(-1).toUpperCase()}`;
 $('download').href=a.path;$('detail').showModal();
}
function render(){
 const query=$('search').value.trim().toLowerCase(),world=$('world').value;
 const rows=assets.filter(a=>(!kind||a.kind===kind)&&(!world||a.sourceProject===world)&&`${a.name} ${a.provenance}`.toLowerCase().includes(query));
 const fragment=document.createDocumentFragment();
 for(const a of rows){
  const card=node('article',null,`card ${a.kind}`),button=node('button');button.type='button';button.setAttribute('aria-label',`Preview ${a.name}`);button.onclick=()=>open(a);
  if(a.kind==='model'||a.kind==='sound'){
   button.append(node('span',a.kind==='model'?'◇':'∿','placeholder'));
   if(a.kind==='model'){const img=document.createElement('img');img.loading='lazy';img.src=`thumbnails/${a.sourceProject}-${a.path.split('/').at(-1)}.png`;img.alt=a.name;img.onload=()=>button.querySelector('.placeholder')?.remove();img.onerror=()=>img.remove();button.append(img);}
  }else{const img=document.createElement('img');img.src=a.path;img.alt=a.name;img.loading='lazy';button.append(img);}
  button.append(node('span',a.kind.toUpperCase(),'type'));card.append(button);
  const copy=node('div',null,'card-copy');copy.append(node('h3',a.name));const meta=node('div',null,'card-meta');meta.append(node('span',a.sourceProject.toUpperCase()),node('span',`${a.license} · ${size(a.bytes)}`));copy.append(meta);card.append(copy);fragment.append(card);
 }
 $('grid').replaceChildren(fragment);$('count').textContent=`${rows.length} assets`;$('empty').hidden=rows.length>0;
}
document.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{kind=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();});
$('search').oninput=render;$('world').onchange=render;$('close').onclick=()=>$('detail').close();
$('detail').addEventListener('close',()=>{if(!$('detail').open)$('preview').replaceChildren();});
render();
