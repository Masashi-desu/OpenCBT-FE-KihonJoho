/** Manually fixed geometry/labels and graph for the two source concept figures.
 * Reads actual SVG rectangles, text coordinates, polyline endpoints and defs. */
import assert from 'node:assert/strict';
import facts from './legacy-2018-pm-password-facts.json';
const attrs=(s:string)=>Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const decode=(s:string)=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&#x27;',"'").replaceAll('&quot;','"');
const nodesBasic:Record<string,[number,number,number,string]>={
 'save.browserP':[80,210,180,'i*ejEf/3as'],'save.receivedP':[400,210,180,'i*ejEf/3as'],'file.H':[730,215,190,'a4bde8ac02f7…'],'verify.browserP':[80,560,180,'i*ejEf/3as'],'verify.receivedP':[400,560,180,'i*ejEf/3as'],'verify.storedH':[730,470,190,'a4bde8ac02f7…'],'verify.computedH':[730,640,190,'a4bde8ac02f7…']};
const nodesSalted:Record<string,[number,number,number,string]>={
 'save.browserP':[80,210,180,'ncCr-q$x0w'],'save.receivedP':[790,210,180,'ncCr-q$x0w'],'save.salt':[400,290,160,'cV4Ak#a…'],'save.concatS':[650,290,160,'cV4Ak#a…'],'save.concatP':[810,290,160,'ncCr-q$x0w'],'file.S':[460,500,180,'cV4Ak#a…'],'file.H':[770,500,200,'be8a943a32d…'],'verify.browserP':[80,790,180,'ncCr-q$x0w'],'verify.receivedP':[560,790,200,'ncCr-q$x0w'],'verify.concatS':[400,910,160,'cV4Ak#a…'],'verify.concatP':[560,910,200,'ncCr-q$x0w'],'verify.storedH':[780,750,180,'be8a943a32d…'],'verify.computedH':[780,990,180,'be8a943a32d…']};
const edgesBasic:Record<string,string>={'save.browserP->save.receivedP':'260,232.5 400,232.5','save.receivedP->file.H':'580,232.5 730,237.5','verify.browserP->verify.receivedP':'260,582.5 400,582.5','file.H->verify.storedH':'825,260 825,470','verify.receivedP->verify.computedH':'490,605 490,662.5 730,662.5'};
const edgesSalted:Record<string,string>={'save.browserP->save.receivedP':'260,232.5 790,232.5','save.receivedP->save.concatP':'880,255 880,290','save.salt->save.concatS':'560,312.5 650,312.5','save.concatSP->file.H':'870,370 1035,370 1035,522.5 970,522.5','save.salt->file.S':'480,335 480,500','verify.browserP->verify.receivedP':'260,812.5 560,812.5','verify.receivedP->verify.concatP':'660,835 660,910','file.S->verify.concatS':'550,545 550,665 480,665 480,910','file.H->verify.storedH':'870,545 870,750','verify.concatSP->verify.computedH':'580,1012.5 780,1012.5'};
export function readLegacy2018PasswordSvg(svg:string,profile:string){
 assert(['legacy-2018-password-basic','legacy-2018-password-salted'].includes(profile));const salted=profile.endsWith('salted'),expected=salted?nodesSalted:nodesBasic;
 const nodes=[...svg.matchAll(/<g data-node="([^"]+)">([\s\S]*?)<\/g>/g)];assert.equal(nodes.length,Object.keys(expected).length);
 for(const m of nodes){const n=expected[m[1]];assert(n,m[1]);const r=attrs(m[2].match(/<rect\b([^>]*)/)!?.[1]??''),t=m[2].match(/<text\b([^>]*)>([^<]*)<\/text>/);assert(t);const a=attrs(t[1]);assert.deepEqual([+r.x,+r.y,+r.width,+r.height],[n[0],n[1],n[2],45]);assert.deepEqual([+a.x,+a.y],[n[0]+n[2]/2,n[1]+29]);assert.equal(decode(t[2]),n[3]);}
 const marker=svg.match(/<marker\b([^>]*)>([\s\S]*?)<\/marker>/);assert(marker);const ma=attrs(marker[1]);assert.equal(ma.viewBox,'0 0 12 12');assert.equal(ma.refX,'11');assert.equal(ma.refY,'6');assert.equal(ma.orient,'auto-start-reverse');assert.equal(attrs(marker[2].match(/<path\b([^>]*)/)!?.[1]??'').d,'M 1 1 L 11 6 L 1 11');
 const edges=salted?edgesSalted:edgesBasic,actual=[...svg.matchAll(/<polyline\b([^>]*)/g)].map(m=>attrs(m[1]));assert.equal(actual.length,Object.keys(edges).length);
 for(const e of actual){assert.equal(e.points,edges[decode(e['data-edge'])]);assert.equal(e['marker-end'],`url(#${ma.id})`);}
 const allTexts:(Record<string,string>&{text:string})[]=[...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)].map(m=>({...attrs(m[1]),text:decode(m[2])}));
 for(const [x,y,t]of [[175,56,'パスワードの保存'],[175,salted?636:406,'パスワードの照合'],[700,90,'サーバ'],[175,169,'Webブラウザ'],[175,salted?749:519,'Webブラウザ'],...(salted?[[550,486,'ソルト'],[870,486,'ハッシュ値'],[480,277,'ソルト']]:[[830,204,'ハッシュ値']])] as [number,number,string][])assert(allTexts.some(a=>+a.x===x&&+a.y===y&&a.text===t),`${x},${y}:${t}`);
 const desc=decode(svg.match(/<desc[^>]*>([\s\S]*?)<\/desc>/)![1]);assert.equal(desc,salted?facts.sourceFigureAlts.salted:facts.sourceFigureAlts.basic);
 if(salted){for(const [name,d]of [['save','M650 342 V354 H970 V342 M810 354 V370 H870'],['verify','M400 963 V975 H760 V963 M580 975 V1012.5']])assert(svg.includes(`data-concat="${name}" d="${d}"`));assert(expected['save.concatS'][0]<expected['save.concatP'][0]);assert(expected['verify.concatS'][0]<expected['verify.concatP'][0]);assert(svg.includes('d="M 960 772.5 H 980 V 1012.5 H 960"'));}
 else assert(svg.includes('d="M920 492.5 H980 V662.5 H920"'));
 const comparison=svg.match(/<g data-comparison="stored-and-computed">([\s\S]*?)<\/g>/);assert(comparison);const line=attrs(comparison[1].match(/<line\b([^>]*)/)!?.[1]??'');assert.deepEqual([+line.x1,+line.x2,+line.y1,+line.y2],[980,1020,salted?892.5:577.5,salted?892.5:577.5]);assert.equal(line['marker-end'],`url(#${ma.id})`);
 return{nodes:nodes.length,edges:actual.length,saltThenPassword:salted,comparisonInputs:2,originalAbbreviatedValuesUnchanged:true};
}
