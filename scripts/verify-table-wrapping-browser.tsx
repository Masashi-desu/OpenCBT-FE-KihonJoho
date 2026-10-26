/** Prepare source-backed table layout cases and authored Playwright CLI checks.
 * This prepares review artifacts; only an actual browser run validates layout. */
import fs from "node:fs";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {fixture} from "../tests/fixtures";
import {Content} from "../src/ui/Content";
import type {Content as ContentData,Question} from "../src/core/types";
const out="output/playwright/table-wrapping",base=process.argv[2]??"http://127.0.0.1:5199/";
fs.mkdirSync(out,{recursive:true});
const bundle=fixture(),cases:{id:string;content:ContentData}[]=[];
function collect(q:Question){
  for(const [i,c]of [q.prompt,...q.contexts.map(c=>c.content),...q.choices.map(c=>c.content),q.explanation].entries()){
    const tables=c.blocks.filter(b=>b.type==="table");if(tables.length)cases.push({id:`${q.id}-${i}`,content:{...c,blocks:tables}});
  }
}
bundle.questions.filter(q=>q.lifecycle==="active").forEach(collect);
const stagedPath="output/source-import/legacy-2018/candidates/records.json";
if(fs.existsSync(stagedPath)){const staged=JSON.parse(fs.readFileSync(stagedPath,"utf8"));(staged.questions as Question[]).filter(q=>q.origin.kind==="official_adaptation").forEach(collect);}
cases.push({id:"prose-and-identifiers",content:{attribution:{origin:"original",sourceRefs:[],rightsRefs:["rights-original"],creatorIds:["codex"]},blocks:[{type:"table",caption:"表示検証用：長文と識別子",columns:["識別子","説明","数量"],rows:[["ITEM_A0001","この説明文は狭い画面では自然に折り返し、表全体を一律に折返し禁止にしないことを確認するための長い文章です。","123456"],["CODE_0002","複数の単語を含む英文も通常の空白で折り返す。","1/32"]]}]}});
const rendered=cases.map(c=><article id={c.id} hidden key={c.id}><h1>{c.id}</h1><div className="reading-content"><Content content={c.content} bundle={bundle} assetUrls={{}} showAttribution={false}/></div></article>);
fs.writeFileSync(`${out}/tables.html`,`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/src/ui/style.css"><style>.table-review{max-width:1000px;margin:auto;padding:16px;min-width:0}.table-review article[hidden]{display:none}.table-review h1{font-size:14px;overflow-wrap:anywhere}</style><main class="table-review">${renderToStaticMarkup(<>{rendered}</>)}</main><script type="module">import{installOverlayScrollbars}from'/src/ui/scrollbars.ts';installOverlayScrollbars();document.querySelector('article').hidden=false;</script></html>`);
fs.writeFileSync(`${out}/verify-corpus.js`,`async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(${JSON.stringify(base+out+"/tables.html")});await page.evaluate(()=>document.fonts.ready);const result=[];
 for(const width of [320,390,1440]){await page.setViewportSize({width,height:1000});result.push(...await page.evaluate(()=>{
  const result=[],articles=[...document.querySelectorAll('article')],token=/^(?:[+−-]?\\d[\\d,]*(?:\\.\\d+)?[%％]?|\\d+\\/\\d+|0x[0-9a-f]+|[a-z_][a-z0-9_]*)$/i;
  const lines=e=>{const r=document.createRange();r.selectNodeContents(e);return new Set([...r.getClientRects()].filter(r=>r.width&&r.height).map(r=>r.top.toFixed(2))).size;};
  for(const theme of ['light','dark'])for(const zoom of [1,2]){document.documentElement.dataset.theme=theme;document.body.style.zoom=String(zoom);for(const active of articles){for(const a of articles)a.hidden=a!==active;
   const cells=[...active.querySelectorAll('td,th')],atomic=cells.filter(e=>token.test(e.textContent.trim())),wrapped=atomic.filter(e=>lines(e)>1).map(e=>e.textContent),tables=[...active.querySelectorAll('.table-scroll')];
   const scroll=tables.map(e=>{const before={width:e.clientWidth,height:e.clientHeight},s=getComputedStyle(e);e.scrollLeft=e.scrollWidth;const end=e.scrollLeft>=e.scrollWidth-e.clientWidth-1,stable=e.clientWidth===before.width&&e.clientHeight===before.height;const reservedX=e.offsetHeight-e.clientHeight-parseFloat(s.borderTopWidth)-parseFloat(s.borderBottomWidth),reservedY=e.offsetWidth-e.clientWidth-parseFloat(s.borderLeftWidth)-parseFloat(s.borderRightWidth);e.scrollLeft=0;return {end,stable,reservedX,reservedY,overflow:e.scrollWidth>e.clientWidth+1};});
   const longTextWrap=cells.filter(e=>e.textContent.length>30&&/[一-龠ぁ-んァ-ヶ]/.test(e.textContent)).some(e=>lines(e)>1);
   result.push({id:active.id,width:innerWidth,theme,zoom,atomicCells:atomic.length,wrapped,scroll,longTextWrap,pageOverflow:document.documentElement.scrollWidth>innerWidth+1});
  }}return result;
 }));}
 const failed=result.filter(r=>r.wrapped.length||r.pageOverflow||r.scroll.some(s=>!s.end||!s.stable||s.reservedX>1||s.reservedY>1)),prose=result.filter(r=>r.id==='prose-and-identifiers'&&r.width<400);
 if(failed.length||prose.some(r=>!r.longTextWrap)||errors.length)throw Error(JSON.stringify({failed:failed.slice(0,12),prose,errors}));
 await page.setViewportSize({width:390,height:1000});const screenshotCase=await page.evaluate(()=>{const articles=[...document.querySelectorAll('article')],active=articles.find(a=>a.id.startsWith('question-template-source-2018h30a-fe-am-77-0'))??articles.find(a=>a.id==='prose-and-identifiers');if(!active)throw Error('No table case is available for the review screenshot');for(const a of articles)a.hidden=a!==active;document.documentElement.dataset.theme='dark';document.body.style.zoom='2';return active.id;});await page.screenshot({path:'${out}/'+(screenshotCase==='prose-and-identifiers'?'prose-identifiers':'fifo')+'-390-dark-200.png',fullPage:true});
 return {cases:result.length,tableContents:${cases.length},atomicCellChecks:result.reduce((n,r)=>n+r.atomicCells,0),wrappedAtomicCells:0,pageOverflows:0,longTextWrap:true,scrollEndpointAndNoReservedSpace:true,screenshotCase,errors};
}`);
fs.writeFileSync(`${out}/verify-app.js`,`async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(${JSON.stringify(base+"#/search/question/question-ipa-sample-2022-dec-a-50")});await page.getByRole('button',{name:'類題を解く',exact:true}).click();await page.locator('.answer-choices').waitFor();const result=[];
 const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 for(const width of [320,390,1440]){await page.setViewportSize({width,height:1000});for(const theme of ['light','dark'])for(const zoom of ['自動ズーム','200%']){
  await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);await page.getByRole('combobox',{name:'問題資料のズーム'}).selectOption({label:zoom});await settle();
  const m=await page.evaluate(()=>{const countLines=e=>{const r=document.createRange();r.selectNodeContents(e);return new Set([...r.getClientRects()].map(r=>r.top.toFixed(2))).size;},cells=[...document.querySelectorAll('.reading-scroll td')].filter(e=>/^\\d+(?:[,.]\\d+)*$/.test(e.textContent.trim())),regions=[...document.querySelectorAll('.reading-scroll .table-scroll'),document.querySelector('.reading-scroll')].filter(Boolean);return {numericCells:cells.length,wrapped:cells.filter(e=>countLines(e)>1).map(e=>e.textContent),pageOverflow:document.documentElement.scrollWidth>innerWidth+1,scroll:regions.map(e=>{const w=e.clientWidth,h=e.clientHeight,s=getComputedStyle(e);e.scrollLeft=e.scrollWidth;const end=e.scrollLeft>=e.scrollWidth-e.clientWidth-1,stable=e.clientWidth===w&&e.clientHeight===h,reserved=e.offsetHeight-e.clientHeight-parseFloat(s.borderTopWidth)-parseFloat(s.borderBottomWidth);e.scrollLeft=0;return {end,stable,reserved,overflow:e.scrollWidth>e.clientWidth+1};}),overlayEnabled:document.documentElement.hasAttribute('data-overlay-scrollbars')};});
  if(m.numericCells!==24||m.wrapped.length||m.pageOverflow||!m.overlayEnabled||m.scroll.some(s=>!s.end||!s.stable||s.reserved>1))throw Error(JSON.stringify({width,theme,zoom,...m}));result.push({width,theme,zoom,...m});
  if(width===320&&theme==='light'&&zoom==='自動ズーム')await page.screenshot({path:'${out}/a50-320-light-auto.png',fullPage:true});if(width===390&&theme==='dark'&&zoom==='200%')await page.screenshot({path:'${out}/a50-390-dark-200.png',fullPage:true});
 }}
 await page.setViewportSize({width:320,height:1000});await page.getByRole('combobox',{name:'問題資料のズーム'}).selectOption({label:'自動ズーム'});await page.evaluate(()=>{const s=document.createElement('style');s.id='counterfactual-anywhere';s.textContent='th,td{overflow-wrap:anywhere}';document.head.append(s);});await settle();const before=await page.locator('.reading-scroll td').evaluateAll(nodes=>nodes.filter(e=>/^\\d+$/.test(e.textContent.trim())).filter(e=>{const r=document.createRange();r.selectNodeContents(e);return new Set([...r.getClientRects()].map(r=>r.top.toFixed(2))).size>1;}).length);await page.evaluate(()=>document.getElementById('counterfactual-anywhere').remove());if(before===0)throw Error('Counterfactual did not reproduce numeric wrapping');
 if(errors.length)throw Error(errors.join(','));return {app:'A50',cases:result.length,numericCellsPerCase:24,wrappedAfter:0,counterfactualWrapped:before,scrollEndpoints:true,noReservedScrollbarSpace:true,errors};
}`);
console.log(`Prepared ${cases.length-1} source-backed table contents and one prose/identifier control, corpus and real-app checks under ${out}.`);
