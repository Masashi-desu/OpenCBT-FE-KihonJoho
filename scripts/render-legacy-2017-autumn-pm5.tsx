/** Static isolated component proof, not a normal-App/Run acceptance harness. */
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {createElement,Fragment,type ReactNode} from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {legacy2017AutumnPm5Definition as definition} from '../src/core/generators/legacy-2017-autumn-pm5';
import {Legacy2017AutumnPm5Figure} from '../src/ui/Legacy2017AutumnPm5Figure';
import type {Block} from '../src/core/types';
export function renderAutumnPm5Proof(folder:string) {
  const css=fs.readFileSync('src/ui/tokens.css','utf8')+'\n'+fs.readFileSync('src/ui/legacy-2017-autumn-pm5.css','utf8');
  const block=(b:Block,key:number):ReactNode=>{if(b.type==='paragraph')return createElement('p',{key},b.text);if(b.type==='image')return createElement('img',{key,src:'../pm5-raw-candidate/assets/2017h29a-fe-pm-5-p2.webp',alt:'公式正誤表の原画像',style:{maxWidth:'100%'}});assert(b.type==='diagram'&&b.scene.kind==='source_figure');return createElement(Legacy2017AutumnPm5Figure,{key,profile:b.scene.profile,values:b.scene.values,caption:b.caption});};
  fs.mkdirSync(folder,{recursive:true});
  for(let v=0;v<4;v++){
    const body=definition.build([v]);const html=renderToStaticMarkup(createElement(Fragment,null,createElement('h1',null,'問5 専用実component確認'),createElement('p',null,'通常App/Run/配布登録は未実施。独立した描画確認用。'),...body.contexts!.map((c,i)=>createElement('section',{key:'context'+i,'data-source-context':i},createElement('h2',null,c.title),...c.blocks.map(block))),createElement('article',{'data-source-prompt':true},...body.prompt.map(block))));
    fs.writeFileSync(path.join(folder,'v'+v+'.html'),'<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>'+css+'\nbody{margin:16px;background:var(--surface);color:var(--ink);font-family:var(--font);font-size:20px;line-height:1.8}section{margin-bottom:2em}article>p{margin:1em 0}*{scrollbar-width:none}*::-webkit-scrollbar{display:none}h1{font-size:1.4em}h2{font-size:1.2em}</style></head><body>'+html+'</body></html>');
  }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert(process.argv[2]);renderAutumnPm5Proof(path.resolve(process.argv[2]));}
