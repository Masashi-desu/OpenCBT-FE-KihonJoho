import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import {createElement} from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {legacy2016SpringAm0932Definitions as defs} from '../../../src/core/generators/legacy-2016-spring-am-09-32';
import {Legacy2016SpringAm0932Figure} from '../../../src/ui/legacy-2016-spring-am-09-32-figures';
import {assertAm2016Figure,am2016FigureAlt} from '../../../src/core/generators/legacy-2016-spring-am-09-32-figure-models';
import {assertAm2016Body,oracleDomainSizes} from '../../fixtures/legacy-2016-spring-am-09-32-oracle';
import review from '../../fixtures/legacy-2016-spring-am-09-32-review.json';
import type {Block} from '../../../src/core/types';
import {readDistributionBundle} from '../../../scripts/distribution-files';
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const figure=(b:Block)=>{assert(b.type==='diagram'&&b.scene.kind==='source_figure');return b.scene;};
test('24 source numbers and all128 finite inputs: independent all-choice truth, arithmetic/state/relations and exact source keys',()=>{
 assert.deepEqual(defs.map(d=>d.source),Array.from({length:24},(_,i)=>`2016h28h-fe-am-${i+9}`));let total=0;
 for(const [i,d] of defs.entries()){const n=i+9;assert.deepEqual(d.reference,[0]);assert.equal(d.sourceAnswer,review.rows[i].officialKey);assert.deepEqual(d.fields,[{name:'caseIndex',minimum:0,maximum:oracleDomainSizes[n]-1}]);const signatures=new Set<string>();for(let c=0;c<oracleDomainSizes[n];c++){const body=d.build([c]);assertAm2016Body(n,c,body);assert.deepEqual(d.build([c]),body);signatures.add(JSON.stringify(body));total++;}assert.equal(signatures.size,oracleDomainSizes[n]);for(const bad of[[],[-1],[oracleDomainSizes[n]],[.5],[NaN],[Infinity],[0,0]])assert.throws(()=>d.build(bad),/PARAMETER_CONSTRAINT/);}assert.equal(total,128);
});
test('reference form: all notes/list/table/diagram roles remain before answering and the four official options retain their roles',()=>{
 for(const [i,d] of defs.entries()){const n=i+9,b=d.build([0]),s=review.rows[i];assert.equal(b.prompt[0].type,'paragraph');assert.equal(b.correctIndex,s.officialIndex);if(n!==23){assert.deepEqual(b.choices.map(x=>{assert.equal(x.length,1);assert.equal(x[0].type,'paragraph');return(x[0]as{text:string}).text;}),s.choices);}if(n===10){assert.equal(b.prompt[1].type,'list');assert.deepEqual((b.prompt[1]as{items:string[]}).items,s.list);}if(n===14){assert.equal(b.prompt[3].type,'table');assert.deepEqual((b.prompt[3]as{rows:string[][]}).rows,s.tables![0].rows);}if(n===27)for(let k=0;k<3;k++){assert.equal(b.prompt[k+1].type,'table');const actual=b.prompt[k+1] as Extract<Block,{type:'table'}>;assert.deepEqual({caption:actual.caption,columns:actual.columns,rows:actual.rows},s.tables![k]);}}
});
test('independent oracle rejects changed answer, changed condition/omitted notes and all-option source drift',()=>{
 let rejected=0;
 for(const[i,d]of defs.entries()){const n=i+9;for(let c=0;c<oracleDomainSizes[n];c++){const b=d.build([c]);b.correctIndex=((b.correctIndex??0)+1)%4;assert.throws(()=>assertAm2016Body(n,c,b));rejected++;}const bad=d.build([0]);if(n===23){const sc=figure(bad.prompt[1]);sc.values[0]=3;}else{const b=bad.choices[0][0];assert.equal(b.type,'paragraph');if(b.type==='paragraph')b.text+=' この説明は誤りである。';}assert.throws(()=>assertAm2016Body(n,0,bad));rejected++;}
 for(const n of[12,14,31]){const b=defs[n-9].build([0]);if(n===14)b.prompt.splice(1,1);else {const p=b.prompt[0];assert(p.type==='paragraph');p.text=p.text.replace(n===12?'1kバイト＝1,000バイト':'伝送効率は80%','前提を削除');}assert.throws(()=>assertAm2016Body(n,0,b));rejected++;}const availability=defs[15-9].build([1]);const availabilityPrompt=availability.prompt[0];assert(availabilityPrompt.type==='paragraph');availabilityPrompt.text=availabilityPrompt.text.replace(' MTBF及びMTTRは正の値とする。','');assert.throws(()=>assertAm2016Body(15,1,availability));rejected++;assert.equal(rejected,156);
});
test('all managed figure scenes render accessible native SVG, preserve device counts/gate topology and reject invalid scenes',()=>{
 let count=0;
 for(const n of[14,23])for(let c=0;c<oracleDomainSizes[n];c++){const b=defs[n-9].build([c]);const blocks=[...b.prompt,...b.choices.flat()];for(const block of blocks)if(block.type==='diagram'&&block.scene.kind==='source_figure'){const scene=block.scene;assertAm2016Figure(scene.profile,scene.values);assert.equal(block.alt,am2016FigureAlt(scene.profile,scene.values));const svg=renderToStaticMarkup(createElement(Legacy2016SpringAm0932Figure,{scene,caption:block.caption}));assert.match(svg,/^<svg/);assert.match(svg,/role="img"/);assert.match(svg,/aria-labelledby="[^"]+-title [^"]+-desc"/);assert(svg.includes('<title')&&svg.includes('<desc'));assert(!svg.includes('NaN'));assert(!/(?:fill|stroke)="#[0-9a-f]+"/i.test(svg));
  if(n===14){assert.equal((svg.match(/data-device="server"/g)??[]).length,1);assert.equal((svg.match(/data-device="client"/g)??[]).length,scene.values[0]);assert.equal((svg.match(/data-device="printer"/g)??[]).length,scene.values[1]);assert.equal((svg.match(/data-edge="branch/g)??[]).length,scene.values[0]+scene.values[1]);}
  if(scene.profile.endsWith('-logic')){assert.equal((svg.match(/data-gate=/g)??[]).length,4);assert.equal((svg.match(/data-inversion=/g)??[]).length,scene.values.filter(x=>x%2).length);for(const edge of['A-G1','A-G2','B-G1','B-G3','G1-output','G1-G2','G1-G3','G2-G4','G3-G4','G4-Y'])assert(svg.includes(`data-edge="${edge}"`));assert.equal((svg.match(/data-junction=/g)??[]).length,3);}
  if(scene.profile.endsWith('-gate')){assert.equal((svg.match(/data-gate=/g)??[]).length,1);assert.equal((svg.match(/data-operation="XOR"/g)??[]).length,scene.values[0]===2?1:0);}count++;}}
 assert.equal(count,26);for(const[profile,values]of[['unknown',[0]],['legacy-2016-spring-am-14-lan',[1,2]],['legacy-2016-spring-am-23-logic',[1,2,3,0]],['legacy-2016-spring-am-23-gate',[4]]] as [string,number[]][])assert.throws(()=>assertAm2016Figure(profile,values),/FIGURE_PROFILE/);
});
test('source crop evidence: public original assets are mandatory once the collection is catalogued; unregistered candidates use full private source evidence',()=>{
 assert.equal(review.rows.length,24);assert.equal(review.held.length,0);const bundle=readDistributionBundle(),originals=bundle.questions.filter(q=>q.origin.kind==='official_reprint'&&/^question-ipa-2016h28h-fe-am-[0-9]+$/.test(q.id));
 if(originals.length){
  for(const s of review.rows){const matches=originals.filter(q=>q.id==='question-ipa-'+s.source);assert.equal(matches.length,1,'catalogued collection must contain every member of this admitted24 cohort');const q=matches[0],ref=q.origin.sourceRefs.find(ref=>ref.locator.questionNumber===String(s.number));assert(ref);assert.equal(ref.locator.page,s.page);assert.equal(ref.locator.year,2016);assert.equal(ref.locator.period,'春期');
   const images=q.prompt.blocks.filter(block=>block.type==='image');assert.equal(images.length,1);const image=images[0];assert(image.type==='image');const assets=bundle.assets.filter(a=>a.id===image.assetId);assert.equal(assets.length,1);const asset=assets[0];assert.equal(asset.sha256,s.crop.sha256);assert.equal(asset.alt,s.alt);assert.equal(asset.width,s.crop.width);assert.equal(asset.height,s.crop.height);assert.equal(asset.byteLength,s.crop.byteLength);const raw=readFileSync('public/data/'+asset.path);assert.equal(createHash('sha256').update(raw).digest('hex'),s.crop.sha256);assert.equal(raw.byteLength,s.crop.byteLength);assert.equal(raw.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(raw.readUInt32BE(16),s.crop.width);assert.equal(raw.readUInt32BE(20),s.crop.height);
   const answer=q.choices.find(c=>c.id===q.correctAnswer.choiceId);assert(answer);assert.equal(answer.content.blocks.length,1);assert.deepEqual(answer.content.blocks[0],{type:'paragraph',text:s.officialKey});
  }
 }else{
  // This branch is only the unregistered feature source-design state. Missing
  // source files fail; publication cannot silently fall back after one member exists.
  for(const s of review.rows){assert.equal(hash(s.renderPath),s.renderSha256);assert.equal(hash(s.cropPath),s.cropSha256);const raw=readFileSync(s.crop.path);assert.equal(raw.byteLength,s.crop.byteLength);assert.equal(raw.readUInt32BE(16),s.crop.width);assert.equal(raw.readUInt32BE(20),s.crop.height);}
 }
 for(const s of review.rows){assert(s.fullAlt.includes(s.prompt));assert(!s.fullAlt.includes('正解'));assert.equal(s.noAnswerInAlt,true);assert.equal(s.pdfPage,s.printedPage);assert.equal(s.materialReview.repository,'candidate_pending_root_source_rights_gate');}
});

test('target names do not predefine the correct scheduling or device behavior in the question',()=>{for(const c of[1,2,3]){const b=defs[16-9].build([c]);assert(b.prompt[0].type==='paragraph');assert(!/到着順|短いタスク|時間量ずつ/.test(b.prompt[0].text));}for(const c of[2,3]){const b=defs[17-9].build([c]);assert(b.prompt[0].type==='paragraph');assert(!/仕様を意識せず|ファイルと同じように/.test(b.prompt[0].text));}});

test('Q19 keeps optimization fixed and refuses a stem that predefines its answer for every case',()=>{const d=defs[19-9];assert.equal(d.answerVariation,'fixed');const original=review.rows.find(r=>r.number===19)!;for(let c=0;c<4;c++){const b=d.build([c]);assert.deepEqual(b.prompt,[{type:'paragraph',text:original.prompt}]);assert.deepEqual(b.choices[2],[{type:'paragraph',text:original.choices[2]}]);assertAm2016Body(19,c,b);assert(b.prompt[0].type==='paragraph');b.prompt[0].text+='ここで，最適化は実行時の処理効率を高める変換を指す。';assert.throws(()=>assertAm2016Body(19,c,b));}});
