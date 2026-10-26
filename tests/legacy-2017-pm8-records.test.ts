import test from "node:test";
import assert from "node:assert/strict";
import {legacy2017Pm8Records,bindLegacy2017Pm8Figures} from "../scripts/import-legacy-2017-pm8";
import {assessLegacy2017Pm8Schema} from "../scripts/legacy-2017-pm8-schema-review";
import {legacy2017Pm8Definition as d} from "../src/core/generators/legacy-2017-pm8";
import {legacy2017Pm8StudyTerms as terms,legacy2017Pm8StudyTermReview as review} from "../src/core/generators/legacy-2017-pm8-study-terms";
import evidence from "../scripts/source-evidence/ipa-pre-2023.json";
import {legacy2017AfternoonAnswers as officialAnswers} from "./fixtures/legacy-2017-afternoon-answers";
import {legacy2017Pm8OriginalProgram as sourceLines} from "./fixtures/legacy-2017-pm8-source-review";
import rendered from "./fixtures/legacy-2017-pm8-pages.json";
const collection=evidence.collections.find(c=>c.id==="2017h29h-fe-pm")!;
import {contentHash} from "../src/core/hash";
test("PM8実original/完全base/2source/2rights/8原画像/1templateと7公式キーを対応付ける",async()=>{
 const {bundle:b,validation:v}=await legacy2017Pm8Records({collection,rendered});assert.deepEqual(Object.fromEntries(Object.entries(b).map(([k,r])=>[k,r.length])),{sources:2,rights:2,assets:8,questions:2,templates:1});assert.equal(v.baseSchema.status,"pass");assert.deepEqual(v.baseSchema.managedFigurePaths,["/prompt/blocks/4","/prompt/blocks/23","/contexts/0/content/blocks/1","/contexts/0/content/blocks/2"]);assert(b.questions.every(q=>q.distribution==="excluded"));assert.deepEqual(officialAnswers.find(k=>k.source==="2017h29h-fe-pm-8")!.groups.map(g=>g.symbol),["イ","オ","キ","イ","イ","カ","ア"]);assert.equal(b.questions[0].choiceShuffleAllowed,false);assert.equal(b.questions[1].choiceShuffleAllowed,false);assert.equal(b.questions[0].assetRefs.length,8);assert.equal(b.questions[1].assetRefs.length,0);assert.equal(b.templates[0].originalContentSha256,await contentHash(b.questions[1]));const codeAlt=b.assets.filter(a=>/-p38$|-p39$/.test(a.id)).map(a=>a.alt).join("\n");for(const[lineIndex,code]of sourceLines.entries())assert(codeAlt.includes(`${lineIndex+1}行 ${code}`));assert(b.assets.every(a=>a.alt.length<=2000));assert.equal(v.answerVariation.distinctSignatures,8);assert.deepEqual(v.answerVariation.sameFConditions,[]);
});
test("prompt/choice/context図へsource固有adapted creditを非破壊でbindし、raw ownへ戻さない",async()=>{
 const {bundle:b}=await legacy2017Pm8Records({collection,rendered}),base=b.questions[1],body=d.build([0]),before=structuredClone(body);const groups=[base.prompt,...base.contexts.map(c=>c.content),...base.choices.map(c=>c.content)];let diagrams=0;for(const c of groups)for(const block of c.blocks)if(block.type==="diagram"){diagrams++;assert.equal(block.attribution.origin,"adapted");assert.deepEqual(block.attribution,c.attribution);assert(block.attribution.sourceRefs.every(s=>s.sourceId==="source-ipa-2017h29h-fe-pm-qs"));assert(block.attribution.rightsRefs.includes("rights-original"));assert(block.attribution.rightsRefs.some(s=>s.startsWith("rights-ipa-2017h29h-fe-pm")));}assert.equal(diagrams,4);
 const bound=bindLegacy2017Pm8Figures(body.prompt,base.prompt.attribution);assert.deepEqual(body,before);assert.deepEqual(bound.filter(x=>x.type==="diagram").map(x=>x.scene),body.prompt.filter(x=>x.type==="diagram").map(x=>x.scene));const choiceFigure=body.contexts![0].blocks[1];assert.equal(choiceFigure.type,"diagram");const cloned=bindLegacy2017Pm8Figures([choiceFigure],base.prompt.attribution)[0];assert(cloned.type==="diagram"&&choiceFigure.type==="diagram");assert.deepEqual(cloned.attribution,base.prompt.attribution);assert.equal(choiceFigure.attribution.origin,"original");
});
test("4既知profileの保留は本文/資料/choice/版/型/余分属性などの不正を隠さない",async()=>{
 const {bundle:b}=await legacy2017Pm8Records({collection,rendered}),base=b.questions[1];for(const mutate of [
  (q:typeof base)=>{q.prompt.blocks[0]={type:"paragraph",text:17}as never;},
  (q:typeof base)=>{delete(q as Partial<typeof q>).correctAnswer;},
  (q:typeof base)=>{q.contexts[0].content.blocks[0]={type:"paragraph",text:null}as never;},
  (q:typeof base)=>{const x=q.contexts[0].content.blocks[1];assert(x.type==="diagram");delete(x as Partial<typeof x>).alt;},
  (q:typeof base)=>{const x=q.prompt.blocks[4];assert(x.type==="diagram"&&x.scene.kind==="source_figure");x.scene.values=[8];},
  (q:typeof base)=>{const x=q.prompt.blocks[4];assert(x.type==="diagram"&&x.scene.kind==="source_figure");x.scene.profile="unreviewed-profile";},
  (q:typeof base)=>{q.choices[0].content.blocks[0]={type:"code",language:"pseudocode",text:12}as never;},
  (q:typeof base)=>{Object.assign(q,{unexpected:1});},
  (q:typeof base)=>{q.distribution="included";},
  (q:typeof base)=>{const x=q.prompt.blocks[23];assert(x.type==="diagram");x.alt="a".repeat(2001);},
 ]){const q=structuredClone(base);mutate(q);assert.throws(()=>assessLegacy2017Pm8Schema(q));}
});
test("PM8用語18件の配列/添字/共通記法の役割と略語でない英字名をsource限定で説明する",()=>{
 assert.equal(terms.length,18);assert.deepEqual(terms.map(t=>t.term),review.terms);assert.deepEqual(review.formalAbbreviations,[]);for(const t of terms){assert.deepEqual(t.sources,["2017h29h-fe-pm-8"]);assert.equal(t.expansion,undefined);assert(t.meaning.length>45);assert.doesNotMatch(t.meaning,/生成の|fixture|共有hook|未登録|査読|転載|原の.*保持/);}const at=(term:string)=>{const t=terms.find(t=>t.term===term);assert(t);return t.meaning;};for(const[term,facts]of [["距離行列",[/同一地点を0/,/−1/,/加算しない/]],["pRoute",[/直前の経由地/,/初期値0は設問2/]],["sRoute",[/添字jを0から/,/目的地から出発地/ ]],["緩和",[/同じ距離では.*置き換えない/]],["∞",[/最大値.*定数/,/初期値/]],["前判定と後判定の繰返し",[/初めから偽なら.*実行しない/,/後判定.*条件が真の間/]],["ShortestPath",[/略語ではない/]]]as const)for(const re of facts)assert.match(at(term),re);
});
