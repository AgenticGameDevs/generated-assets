import fs from 'node:fs';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const inline=s=>escape(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,url)=>`<a href="${url.replaceAll('"','&quot;').replace(/^\.\.\//,'')}">${label}</a>`).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
for(const [source,target,title] of [['workflows/README.md','workflows.html','Workflows'],['LICENSE.md','licenses.html','Licenses']]){
 const lines=fs.readFileSync(source,'utf8').split('\n');let body='',code=false,list=false;
 for(const line of lines){
  if(line.startsWith('```')){if(list){body+='</ul>';list=false;}code=!code;body+=code?'<pre><code>':'</code></pre>';continue;}
  if(code){body+=escape(line)+'\n';continue;}
  if(/^[-*] |^\d+\. /.test(line)){if(!list){body+='<ul>';list=true;}body+='<li>'+inline(line.replace(/^[-*] |^\d+\. /,''))+'</li>';continue;}
  if(list){body+='</ul>';list=false;}
  const heading=line.match(/^(#{1,3}) (.*)$/);body+=heading?`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`:line?`<p>${inline(line)}</p>`:'';
 }
 fs.writeFileSync(target,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Generated Assets</title><link rel="stylesheet" href="gallery.css"><style>article{max-width:850px;margin:50px auto;padding:0 5vw 60px;line-height:1.85}article h1{font-size:48px}article h2{font:30px Georgia,serif;margin-top:42px}pre{overflow:auto;padding:20px;background:#e8ebe2;border-radius:6px;font-size:12px}code{font-size:12px;overflow-wrap:anywhere}</style></head><body><header><a class="wordmark" href="./">GA<span> / FIELD COLLECTION</span></a><nav><a href="./">Gallery</a><a href="workflows.html">Workflows</a><a href="licenses.html">Licenses</a></nav></header><article>${body}</article></body></html>`);
}
