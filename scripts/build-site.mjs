import fs from 'node:fs';import path from 'node:path';
const target='dist';
// Recreate only this script's known generated site directory; no source files are removed.
if(fs.existsSync(target)){if(!fs.existsSync(path.join(target,'.generated-assets-site')))throw Error('Refusing to replace unmarked dist directory');fs.rmSync(target,{recursive:true});}
fs.mkdirSync(target);fs.writeFileSync(path.join(target,'.generated-assets-site'),'generated\n');
for(const file of ['index.html','gallery.css','library.css','gallery.js','viewer.html','viewer.js','catalog.json','excluded.json','licenses.html','workflows.html','contribute.html','governance.html','agents.html','LICENSE','LICENSE.md','README.md','CONTRIBUTING.md','GOVERNANCE.md','AGENTS.md','.nojekyll','assets','metadata','thumbnails','vendor','schemas','skills','workflows','provenance','examples','generators'])fs.cpSync(file,path.join(target,file),{recursive:true});
fs.mkdirSync(path.join(target,'lib'));fs.copyFileSync('lib/catalog.mjs',path.join(target,'lib/catalog.mjs'));
console.log('Built static gallery in dist/');
