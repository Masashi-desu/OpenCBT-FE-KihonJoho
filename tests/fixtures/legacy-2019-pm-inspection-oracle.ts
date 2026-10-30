/** Independent source/typed-information oracle; imports no runtime producer/model. */
import assert from'node:assert/strict';import type{GeneratedBody}from'../../src/core/generators/definition';import{legacy2019InspectionReview as r}from'./legacy-2019-pm-inspection-review';
export const legacy2019InspectionInputs=()=>[[0,0],[0,1],[1,0],[1,1]];
export function legacy2019InspectionExpectedChoices(values:readonly number[]){
 const a:string[]=[...r.originalChoices.a],e:string[][]=r.originalChoices.e.map(v=>[...v]);
 if(values[0]){a[0]='利用者情報及び申込者情報';a[2]='利用者情報、申込者情報及び検査農産物情報';}if(values[1])e[0][0]='getOffererInfo';
 return{a,bc:[...r.originalChoices.bc],d:[...r.originalChoices.d],e};
}
export function legacy2019InspectionMinimum(){
 const actions:[string,string[],string[]][]=[['getProductInfo',['product-id'],['product-data','offerer-id']],['getOffererInfo',['offerer-id'],['offerer-data']],['getResultInfoForProduct',['product-id'],['all-product-results']],['getResultInfo',['result-id'],['one-result','product-id']],['listResultInfo',['start'],['arbitrary-result-page']],['listProductInfo',['start'],['arbitrary-product-page']],['listOffererInfo',['start'],['arbitrary-offerer-page']]],goal=['product-data','offerer-data','all-product-results'],queue:{have:Set<string>;calls:string[]}[]=[{have:new Set(['product-id','start']),calls:[]}],found:string[][]=[];
 let best=Infinity;while(queue.length){const {have,calls}=queue.shift()!;if(calls.length>best)break;if(goal.every(s=>have.has(s))){best=calls.length;found.push(calls);continue;}for(const[name,need,give]of actions){if(!need.every(s=>have.has(s))||give.every(s=>have.has(s)))continue;queue.push({have:new Set([...have,...give]),calls:[...calls,name]});}}return{minimum:best,paths:found};
}
export function legacy2019InspectionSequence(sequence:readonly string[]){
 const have=new Set(['start','access-id']);const trace:{name:string;available:boolean;have:string[]}[]=[];
 for(const name of sequence){let need:string[],give:string[];
 if(name==='listResultInfo'){need=['start'];give=['ordered-results','product-ids'];}
 else if(name==='getProductInfo'){need=['product-ids'];give=['product-data','offerer-ids'];}
 else if(name==='getOffererInfo'){need=['offerer-ids'];give=['offerer-data'];}
 else if(name==='listProductInfo'){need=['start'];give=['some-products','product-ids','offerer-ids','one-product-id'];}
 else if(name==='listOffererInfo'){need=['start'];give=['some-offerers'];}
 else if(name==='getResultInfoForProduct'){need=['one-product-id'];give=['one-product-results'];}
 else throw Error('Unknown source API');
 const available=need.every(s=>have.has(s));trace.push({name,available,have:[...have]});if(!available)return{correct:false,trace};give.forEach(s=>have.add(s));}
 return{correct:['ordered-results','product-data','offerer-data'].every(s=>have.has(s)),trace};
}
const text=(blocks:GeneratedBody['prompt'])=>blocks.map(b=>{assert.equal(b.type,'paragraph');return b.type==='paragraph'?b.text:'';}).join('\n');
export function assertLegacy2019InspectionBody(body:GeneratedBody,values:readonly number[]){
 assert(values.length===2&&values.every(n=>Number.isInteger(n)&&n>=0&&n<=1));const exp=legacy2019InspectionExpectedChoices(values),all=[...exp.a,...exp.bc,...exp.d.map(String),...exp.e.map(v=>v.join(', '))];assert.equal(body.choices.length,24);assert.deepEqual(body.choices.map(b=>text(b)),all);
 const paras=body.prompt.filter(b=>b.type==='paragraph'),prompt=text(paras),must=[r.page23.introduction,...r.page23.workflow,r.page23.system,r.page24.authentication,r.page24.ownership,...r.page25.apiPremises,r.page27.question2,r.page28and29.question3,r.page28and29.paging];for(const s of must)assert(prompt.includes(s),'missing source premise:'+s);
 assert(!prompt.includes('検査IDを入力'));assert(!prompt.includes('最悪の場合'));assert.equal(body.contexts,undefined);assert.equal(body.correctIndex,undefined);
 const figures=body.prompt.filter(b=>b.type==='diagram');assert.equal(figures.length,5);assert.deepEqual(figures.map(f=>{assert(f.scene.kind==='source_figure');assert.deepEqual(f.scene.values,[0]);assert(f.alt.length>0&&f.alt.length<=2000);return f.scene.profile;}),['architecture','entities','api-table','product-report','results-list'].map(n=>'legacy-2019-inspection-'+n));
 const entityAlt=figures[1].alt;for(const e of r.page25.figure2.entities){assert(entityAlt.includes(e.name));for(const f of e.fields)assert(entityAlt.includes(f));}assert(entityAlt.includes('主キー'));assert(entityAlt.includes('下線'));assert(!entityAlt.includes('外部キー'));
 const offsets=[0,6,6,12,19],counts=[6,6,6,7,5];assert.equal(body.answerParts?.length,5);assert.equal(body.partAnswers?.length,5);
 body.answerParts!.forEach((part,i)=>{assert.equal(part.id,'part-'+'abcde'[i]);assert.deepEqual(part.choiceIds,Array.from({length:counts[i]},(_,j)=>'choice-value-'+(offsets[i]+j+1)));});
 assert.deepEqual(body.answerParts![1].choiceIds,body.answerParts![2].choiceIds);
 const sets=exp.a.map(t=>['認証情報','利用者情報','申込者情報','検査農産物情報'].filter(x=>t.includes(x)).sort()),target=['申込者情報','検査農産物情報'].sort(),minimum=legacy2019InspectionMinimum();assert.equal(minimum.minimum,3);assert.equal(minimum.paths.length,3);
 const truths=[sets.map(s=>JSON.stringify(s)===JSON.stringify(target)),exp.bc.map(s=>s==='申込者ID'),exp.bc.map(s=>s==='検査農産物ID'),exp.d.map(n=>n===minimum.minimum),exp.e.map(s=>legacy2019InspectionSequence(s).correct)];
 truths.forEach((v,i)=>{assert.equal(v.filter(Boolean).length,1);const answer=body.partAnswers![i];assert(answer.kind==='choice');assert.equal(answer.partId,body.answerParts![i].id);assert.equal(answer.choiceId,body.answerParts![i].choiceIds[v.indexOf(true)]);});
 // No claim that product-first cannot supply offerer IDs.
 assert(legacy2019InspectionSequence(exp.e[1]).trace.every(t=>t.available));assert(!legacy2019InspectionSequence(exp.e[1]).correct);
 const mustExplain=['申込者情報及び検査農産物情報','認証情報はログイン後の状態','利用者情報は利用者IDとパスワード','b：検査農産物の申込者IDがgetOffererInfo','c：検査結果の検査農産物IDがgetProductInfo','3回で揃う','最短順は3通り','2回では三種類を揃えられず','4〜8回は最低ではない','認証確認は情報取得用WebAPIの実行回数に加算しない','各最多10件','getOffererInfoを呼ぶこと自体はできる','申込者IDが未取得','get系の戻り値の順序は指定されていない'];
 mustExplain.push(values[0]?'利用者情報（利用者IDとパスワード）を申込者情報に加えた':'認証情報（アクセスID、利用者ID、ログイン日時、最終アクセス日時）を申込者情報に加えた');
 mustExplain.push(values[1]?'getOffererInfoを先頭にすると、必要な申込者IDリストがまだ得られていない':'listOffererInfoを先頭にしても、申込者ID順の頁');
 for(const s of mustExplain)assert(body.explanation.includes(s),'missing/wrong explanation:'+s);
 assert(!/選択肢は順に|正解は[アイウエオカ]|原の[アイウエオカ]が/.test(body.explanation));
 return{truths,minimum};
}
/** Concrete record model, separate from typed closure. No return-order promise is added. */
export function legacy2019InspectionApi(rows:{offerers:Record<string,string>[];products:Record<string,string>[];results:Record<string,string>[]},name:string,arg:string|string[]|number,valid=true){
 if(!valid)throw Error('ACCESS_REJECTED');const kind=name.includes('Offerer')?'offerers':name.includes('Product')&&name!=='getResultInfoForProduct'?'products':'results';if(name==='getResultInfoForProduct')return rows.results.filter(r=>r.product===arg);
 if(name.startsWith('get')){assert(Array.isArray(arg)&&arg.length<=10);return rows[kind].filter(r=>arg.includes(r.id));}
 assert(typeof arg==='number'&&arg>=1);return [...rows[kind]].sort((a,b)=>name==='listResultInfo'?(b.date.localeCompare(a.date)||b.id.localeCompare(a.id)):a.id.localeCompare(b.id)).slice(arg-1,arg+9);
}
