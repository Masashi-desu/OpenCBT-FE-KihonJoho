import {assertMainPreservation} from './fixtures/legacy-afternoon-main-preservation';
import test from'node:test';import assert from'node:assert/strict';import{createHash}from'node:crypto';
import{legacy2017Pm1Definition as d}from'../src/core/generators/legacy-2017-pm1';
import{legacy2017Pm1Model}from'../src/core/generators/legacy-2017-pm1-model';
import{assertLegacy2017Pm1,pm1Facts}from'./fixtures/legacy-2017-pm1-oracle';
import{legacy2017Pm1StudyTerms as terms}from'../src/core/generators/legacy-2017-pm1-study-terms';import termReview from'./fixtures/legacy-2017-pm1-term-review.json';
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
test('PM1全4条件/324配置/162適格/全88択を独立反復加算・全列挙と原資料で検査',()=>{const results=[0,1,2,3].map(v=>assertLegacy2017Pm1(d.build([v]),v));assert.equal(results.reduce((s,r)=>s+r.allocations,0),324);assert.equal(results.reduce((s,r)=>s+r.eligible,0),162);assert.equal(results.reduce((s,r)=>s+r.predicates,0),88);assert.deepEqual(results.map(r=>[r.methodGap,r.numericGap]),[[50000,50000],[160000,160000],[450000,350000],[200000,200000]]);assert.equal(new Set([0,1,2,3].map(v=>hash(d.build([v])))).size,4);assert.equal(Object.hasOwn(d,'answerVariation'),false);assert.deepEqual(d.reference,[0]);assert.equal(d.version,'3.2.0');assert.deepEqual(d.fields,[{name:'参加人数・期間・機密度の条件',minimum:0,maximum:3}]);});
test('PM1条件域外・分数・非数・余分引数を拒否する',()=>{for(const values of[[],[4],[-1],[0.5],[NaN],[Infinity],[0,1]])assert.throws(()=>d.build(values));for(const v of[-1,4,0.5,NaN,Infinity])assert.throws(()=>legacy2017Pm1Model(v));});
test('PM1全条件で本文の欠落/順序/前提/網掛け漏出/印字解答群の不一致を拒否する',()=>{let rejected=0;for(let v=0;v<4;v++){for(const change of[
 (b:ReturnType<typeof d.build>)=>{b.prompt.splice(22,1);},(b:ReturnType<typeof d.build>)=>{b.prompt.splice(24,1);},(b:ReturnType<typeof d.build>)=>{b.prompt.splice(25,1);},
 (b:ReturnType<typeof d.build>)=>{[b.prompt[22],b.prompt[23]]=[b.prompt[23],b.prompt[22]];},(b:ReturnType<typeof d.build>)=>{[b.prompt[25],b.prompt[26]]=[b.prompt[26],b.prompt[25]];},
 (b:ReturnType<typeof d.build>)=>{b.prompt[24]=structuredClone(b.prompt[22]);},(b:ReturnType<typeof d.build>)=>{b.prompt[22]={type:'paragraph',text:'参加人数と機密度を示す。'};},
 (b:ReturnType<typeof d.build>)=>{const p=b.prompt[24];assert(p.type==='paragraph');b.explanation+='\n'+p.text;b.prompt[24]={type:'paragraph',text:''};},
 (b:ReturnType<typeof d.build>)=>{b.prompt.splice(28,1);},(b:ReturnType<typeof d.build>)=>{b.prompt[34]={type:'paragraph',text:'網掛けの部分は表示していない。'};},
 (b:ReturnType<typeof d.build>)=>{const t=b.prompt[33];assert(t.type==='table');t.rows[2][2]='300,000';},(b:ReturnType<typeof d.build>)=>{const t=b.prompt[33];assert(t.type==='table');t.rows[2][1]='オンラインストレージサービス';},
 (b:ReturnType<typeof d.build>)=>{const l=b.prompt[21];assert(l.type==='list');l.items[4]='オンラインストレージは利用できる。';},(b:ReturnType<typeof d.build>)=>{const t=b.prompt[23];assert(t.type==='table');t.rows[1][1]='1';},
 (b:ReturnType<typeof d.build>)=>{b.prompt.push({type:'paragraph',text:'補助表：全社合計費用は最小。'});},(b:ReturnType<typeof d.build>)=>{b.choices[12]=[{type:'paragraph',text:'30,001'}];},
 ]){const b=structuredClone(d.build([v]));change(b);assert.throws(()=>assertLegacy2017Pm1(b,v));rejected++;}}assert.equal(rejected,64);});
test('PM1共通bcの重複選択を禁じる改変/別欄正答/解説の意味誤りを全条件で拒否する',()=>{let n=0;for(let v=0;v<4;v++)for(const mutate of[
 (b:ReturnType<typeof d.build>)=>{b.answerParts![3].choiceIds=b.answerParts![3].choiceIds.slice(0,2);},
 (b:ReturnType<typeof d.build>)=>{const p=b.partAnswers![0];assert(p.kind==='choice');p.choiceId='choice-value-1';},
 (b:ReturnType<typeof d.build>)=>{b.explanation=b.explanation.replace('受信者の公開鍵','送信者の秘密鍵');},
 (b:ReturnType<typeof d.build>)=>{b.explanation=b.explanation.replace('利用禁止','利用可能');},
 (b:ReturnType<typeof d.build>)=>{b.explanation=b.explanation.replace('全参加者','代表者1人');},
 (b:ReturnType<typeof d.build>)=>{b.explanation=b.explanation.replace('両方のメールが盗聴される可能性が残る。','別送なら鍵は必ず秘匿される。');},
 (b:ReturnType<typeof d.build>)=>{b.explanation=b.explanation.replace('形式や設定により異なり','常に非暗号化され');},
 (b:ReturnType<typeof d.build>)=>{b.explanation+=' ただし全てのクラウド保存は安全である。';},
 ]){const b=structuredClone(d.build([v]));mutate(b);assert.throws(()=>assertLegacy2017Pm1(b,v));n++;}assert.equal(n,32);assert.equal(pm1Facts.truths.length,4);});
test('PM1用語12件の正式名・意味・全択との差を独立資料に固定する',()=>{assert.equal(terms.length,12);assert.deepEqual(terms.map(t=>t.term),termReview.terms);for(const t of terms)assert.equal(t.meaning,termReview.requiredFacts[t.term as keyof typeof termReview.requiredFacts]);for(const t of terms){assert.deepEqual(t.sources,['2017h29h-fe-pm-1']);assert.doesNotMatch(t.meaning,/fixture|査読|未登録|共有hook|原形式を保持/);}assert.deepEqual(terms.filter(t=>t.expansion).map(t=>[t.term,t.expansion]),[['VPN','Virtual Private Network'],['TLS','Transport Layer Security'],['HTTP','Hypertext Transfer Protocol']]);});

test('合流対象のmain canonical176と既存189系列の全record/hashを保持する',async()=>{await assertMainPreservation();});
