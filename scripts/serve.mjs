import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.glb':'model/gltf-binary','.wav':'audio/wav','.mp3':'audio/mpeg'};
http.createServer((req,res)=>{
 let target;try{target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;}
 if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403).end();return;}
 if(target.split(path.sep).some(p=>p.startsWith('.')&&p!=='.')){res.writeHead(403).end();return;}
 if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
 if(!fs.existsSync(target)){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',types[path.extname(target)]??'application/octet-stream');
 fs.createReadStream(target).pipe(res);
}).listen(4178,'127.0.0.1',()=>console.log('Gallery: http://127.0.0.1:4178'));
