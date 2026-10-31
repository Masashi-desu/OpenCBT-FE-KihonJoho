import assert from 'node:assert/strict';
import type {GeneratedBody} from '../../src/core/generators/definition';
import {legacy2018PendingAmReview as facts,pendingAmExplanationRequirements as explanationFacts} from './legacy-2018-pending-am-review';
function fraction(decimal:string){assert.match(decimal,/^\d+\.\d$/);const [a,b]=decimal.split('.');return{n:BigInt(a)*10n+BigInt(b),d:10n};}
function number(text:string){assert.match(text,/^\d{1,3}(?:,\d{3})*$/);return BigInt(text.replaceAll(',',''));}
function cells(markup:string,row:string){const match=markup.match(new RegExp('<tr[^>]*data-pending-row="'+row+'"[^>]*>([\\s\\S]*?)</tr>'));assert(match,'actual displayed row '+row);return [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(x=>x[1]);}
function htmlText(value:string){return value.replace(/<[^>]*>/g,'').replaceAll('&quot;','"').replaceAll('&#x27;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');}
function explanationMeaning(n:number,text:string){const required=explanationFacts.requiredSemanticClauses[String(n) as keyof typeof explanationFacts.requiredSemanticClauses];assert(required,'independent explanation roles');for(const clause of required)assert(text.includes(clause),'independent explanation meaning '+n+': '+clause);}
export function pendingAmOracle(source:string,body:GeneratedBody,values:number[],markup=''){
 const f=facts.find(f=>f.source===source);assert(f,'independent source facts');assert.equal(values.length,1);const r=f.conditions.find(c=>c.values[0]===values[0]);assert(r,'independently fixed condition');
 const first=body.prompt[0];assert(first.type==='paragraph');assert.equal(first.text,r.prompt);assert.equal(body.choices.length,4);const texts=body.choices.map(c=>{assert.equal(c.length,1);const b=c[0];assert(b.type==='paragraph');return b.text;});assert.deepEqual(texts,r.choices);const extra=r.extra as Record<string,unknown>;
 let truth=[...r.truthIndependent];
 if(f.number===66){
  assert.equal(body.prompt.length,2);const target=first.text.match(/，([abcd])に入れるもの/);assert(target);assert.equal((markup.match(/data-pending-step=/g)||[]).length,4);assert.equal((markup.match(/data-pending-edge=/g)||[]).length,3);
  const steps=[...markup.matchAll(/<li[^>]*data-pending-step="([abcd])"[^>]*>([\s\S]*?)<\/li>/g)];assert.deepEqual(steps.map(s=>s[1]),[...'abcd'],'actual displayed box order');assert.deepEqual([...markup.matchAll(/data-pending-edge="([^"]+)"/g)].map(e=>e[1]),['a-b','b-c','c-d'],'actual edges with direction');
  for(const[i,label]of[...'abcd'].entries()){const step=steps[i][2],box=step.match(/<div[^>]*class="pending-am-flow-node"[^>]*>([\s\S]*?)<\/div>/),description=step.match(/<p[^>]*data-pending-description="([abcd])"[^>]*>([\s\S]*?)<\/p>/);assert(box&&description);assert.equal(htmlText(box[1]),label);assert.equal(description[1],label);assert.equal(htmlText(description[2]),(extra.descriptions as readonly string[])[i],'label-specific displayed description');assert.equal((step.match(/data-pending-edge=/g)||[]).length,i<3?1:0);if(i<3)assert(step.includes('data-pending-edge="'+label+'-'+'abcd'[i+1]+'"'));}
  const index='abcd'.indexOf(target[1]);truth=[0,1,2,3].map(i=>i===index);assert.deepEqual(truth,r.truthIndependent);
  assert(body.explanation.includes(target[1]+'の箱の説明は「'+(extra.descriptions as readonly string[])[index]+'」。'),'explanation target and actual displayed description');
 }else if(f.number===69){
  assert.equal(body.prompt.length,2);assert(markup.includes('pending-am-open-corner'));assert.equal((markup.match(/colSpan="2"|colspan="2"/g)||[]).length,2);
  const rows=[...'ABC'].map(label=>cells(markup,label));const populations=rows.map(row=>number(row[0])),rates=rows.map(row=>row.slice(1).map(fraction));assert(rows.every(row=>row.length===5));
  const old=cells(markup,'既存顧客数').map(number),fresh=cells(markup,'新規顧客数').map(number);assert.equal(old.length,4);assert.equal(fresh.length,4);
  for(let col=0;col<4;col++){const n=populations.reduce((sum,pop,row)=>sum+pop*rates[row][col].n,0n);assert.equal(n%10n,0n);assert.equal(old[col],n/10n);}
  const claimA=texts[0].match(/([\d,]+)人が新商品Q/),claimShare=texts[2].match(/(\d+)割/);assert(claimA&&claimShare);
  const aQ=populations[0]*rates[0][1].n/10n,aP=populations[0]*rates[0][0].n/10n,cS=populations[2]*rates[2][3].n/10n;
  truth=[aQ===number(claimA[1]),rates[1].reduce((sum,x)=>sum+x.n,0n)===10n,aP*10n===(old[0]+fresh[0])*BigInt(claimShare[1]),fresh[3]<cS];
  assert.deepEqual(truth,r.truthIndependent,'actual displayed table Fraction truth');assert.equal(truth.filter(Boolean).length,1);
  const e=extra;assert.deepEqual(populations.map(String),(e.population! as readonly number[]).map(String));assert.deepEqual(rows.map(row=>row.slice(1)),(e.rateNumerators! as readonly (readonly number[])[]).map(row=>row.map(n=>(n/10).toFixed(1))));
  assert.equal(Number(rates[2].reduce((sum,x)=>sum+x.n,0n)),8,'C is not normalized to one');
  const peer=explanationFacts.peerRequirements.series.find(s=>s.number===69);assert(peer);const numeric=peer.expectedByValue.find(c=>c.values[0]===values[0]);assert(numeric);assert.deepEqual(truth,[...numeric.truth]);
  const ex=body.explanation,aq=ex.match(/^AからQは([\d,]+)×(\d+\.\d)＝([\d,]+)人。/),bs=ex.match(/Bの乗換割合の合計は(\d+\.\d)。/),ps=ex.match(/Pの購入見込者は既存([\d,]+)＋新規([\d,]+)＝([\d,]+)人、そのうちAからは([\d,]+)人で([\d.]+)割。/),cs=ex.match(/CからSは([\d,]+)人で、Sの新規([\d,]+)人と比較する。/);assert(aq&&bs&&ps&&cs,'all four independent calculation roles are explained');
  assert.equal(number(aq[1]),populations[0]);assert.equal(fraction(aq[2]).n,rates[0][1].n);assert.equal(number(aq[3]),aQ);assert.equal(Number(number(aq[3])),numeric.AtoQ);assert.equal(bs[1],numeric.BRateSum);
  assert.equal(number(ps[1]),old[0]);assert.equal(number(ps[2]),fresh[0]);assert.equal(number(ps[3]),old[0]+fresh[0]);assert.equal(Number(number(ps[3])),numeric.Ptotal);assert.equal(number(ps[4]),aP);assert.equal(Number(number(ps[4])),numeric.AtoP);assert.equal(ps[5],numeric.PshareInWari);assert.equal(number(cs[1]),cS);assert.equal(Number(number(cs[1])),numeric.CtoS);assert.equal(number(cs[2]),fresh[3]);assert.equal(Number(number(cs[2])),numeric.freshS);
 }else assert.equal(body.prompt.length,1);
 assert.equal(truth.filter(Boolean).length,1);assert.equal(body.correctIndex,truth.indexOf(true));explanationMeaning(f.number,body.explanation);assert(body.explanation.length>50);assert(!/[アイウエ]が正答/.test(body.explanation),'explanation must not depend on shuffled letter');
 return truth;
}
