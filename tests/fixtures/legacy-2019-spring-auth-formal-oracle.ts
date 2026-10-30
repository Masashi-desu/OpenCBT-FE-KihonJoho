/** Independent formal oracle facet extracted from the unchanged historical oracle. No old prompt/DOM is synthesized. Only source-form-only structural checks are delegated to separately reviewed source gold; actual choices/answers/computation/displayed conditions below remain live. */
/** Independent fixed-concept and reachability checks; imports no producer or
 * renderer. A generic LDAP capability never overrides the source's password
 * premise, and a signature is not treated as encryption or an availability test. */
import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2019PmAuthReview as review} from "./legacy-2019-pm-auth-review";
export function legacy2019PmAuthInputs(){return Array.from({length:64},(_,n)=>Array.from({length:6},(_,i)=>(n>>i)&1));}
export function legacy2019PmAuthFirstExternalFailure(){
 const location:Record<string,"internet"|"lan">={browser:"internet",cloud:"internet",idp:"lan",auth:"lan"};
 for(const event of review.sequence){
  // A reply is permitted only after its request; the first blocked send ends
  // this successful-authentication sequence before any subsequent event.
  if(location[event.from]==="internet"&&location[event.to]==="lan")return event.step;
 }
 throw Error("No forbidden inbound request");
}
const textOf=(blocks:GeneratedBody["prompt"])=>blocks.map(b=>{assert(b.type==="paragraph");return b.text.replaceAll("，","、");}).join("\n");
const includes=(text:string,parts:readonly string[])=>parts.forEach(s=>assert(text.includes(s),"Missing reviewed meaning: "+s));
const reasons:Readonly<Record<string,readonly string[]>>={
 "PKI":["公開鍵を運用する基盤","IdPの公開鍵そのもの"],"認証局（CA）":["証明書を発行する主体","公開検証鍵の値"],
 "改ざん":["署名後に書き換え","署名検証"],"公開鍵":["IdPが署名を作り","B社が対応する公開検証鍵"],
 "サービス妨害":["サービスの利用を妨げる","可用性を保証しない"],"通信経路の障害":["経路上の通信不能","経路の正常動作を保証することはできない"],
 "生体情報":["身体の特徴","認証には用いない"],"ICカード":["所持する物理的な認証器","カード内の利用者IDやパスワードの総称ではない","この認証器を用いる方式ではない"],
 "パスワード":["A社の本人認証は利用者IDとパスワード","三項目であり、パスワードは含めない"],
 "秘密鍵":["IdPが署名を作るために管理する鍵","登録する公開検証鍵とは異なる"],"共通鍵":["同じ秘密を共有する暗号方式","ディジタル署名の公開検証鍵ではない"],
 "利用者ID":["A社の本人認証にも使うが","認証済情報の一部としてB社へ送信"],"認証有効期限":["B社へ送信される項目","本人認証に使う秘密値ではない"],
 "漏えい":["情報を第三者に知られる","情報を秘匿しない"],"盗聴":["通信を第三者に読み取られる","通信内容の読取りを防がない"],
};
export function assertLegacy2019PmAuthBody(body:GeneratedBody,values:number[]){
 assert.equal(values.length,6);assert(values.every(n=>Number.isInteger(n)&&n>=0&&n<=1));assert.equal(body.correctIndex,undefined);assert.equal(body.contexts,undefined);
 assert.equal(body.choices.length,18);const choices=body.choices.map(textOf);assert.equal(new Set(choices).size,18);
 const expected=[...review.originalShared]as string[];review.roles.forEach((r,i)=>expected[r.index]=r.terms[values[i]]);
 assert.deepEqual(choices,[...expected,...review.originalD,...review.originalE]);
 const slotTruth:Record<string,boolean[]>={};
 for(const slot of["a","b","c"]as const){
  slotTruth[slot]=choices.slice(0,9).map(term=>{const fact=review.facts.find(r=>r.term===term);assert(fact,"Unknown unaudited concept: "+term);return fact[slot];});
  assert.equal(slotTruth[slot].filter(Boolean).length,1,"Unique correct concept per source blank");
 }
 // d is the browser-to-internal-IdP prerequisite; the other three descriptions
 // contradict the fixed credential recipient or direction in the ten events.
 const dTruth=choices.slice(9,13).map(text=>{const fact=review.dFacts.find(f=>f.text===text);assert(fact);assert(fact.reason.length>40);return fact.correct;}),eTruth=review.originalE.map(mark=>Number("①②③④⑤⑥⑦⑧⑨⑩".indexOf(mark)+1)===legacy2019PmAuthFirstExternalFailure());
 assert.deepEqual(dTruth,[false,false,false,true]);assert.deepEqual(eTruth,[false,true,false,false,false]);
 const expectedParts=review.parts.map((r,i)=>({id:`part-${r.id}`,label:`設問${r.subquestion} ${r.id}`,choiceIds:Array.from({length:r.choices},(_,j)=>`choice-value-${(i<3?0:i===3?9:13)+j+1}`)}));
 assert.deepEqual(body.answerParts,expectedParts);assert.deepEqual(body.answerParts![0].choiceIds,body.answerParts![1].choiceIds);assert.deepEqual(body.answerParts![0].choiceIds,body.answerParts![2].choiceIds);
 const truths=[slotTruth.a,slotTruth.b,slotTruth.c,dTruth,eTruth];
 assert.deepEqual(body.partAnswers,truths.map((truth,i)=>({kind:"choice",partId:expectedParts[i].id,choiceId:expectedParts[i].choiceIds[truth.indexOf(true)]})));
 expected.forEach(term=>{assert(body.explanation.includes(term),"Unexplained alternative "+term);includes(body.explanation,reasons[term]);});
 includes(body.explanation,["単に送信されない物ではなく","A社の本人認証に実際に使う","dはWebブラウザがIdPと通信する","B社とIdPが直接利用者認証を行ったり","利用者認証情報を代わりにB社へ送るわけではない","eは③","①のB社への要求と②の転送指示","③の社内IdPへの要求","⑤の入力情報送信・⑥のA社認証サーバへの送信・⑨の認証済情報送信へは進めない","HTTPSを用いるだけでこの到達制限が解除されるわけではなく","LDAPには複数の認証方式"]);
 assert(!/選択肢[アイウエオカキクケ]|選択肢は順に|左から順に/.test(body.explanation),"Explanation must not depend on shuffled choice labels");
 return{truthChecks:27,correctChoiceIds:body.partAnswers!.map(a=>{assert(a.kind==="choice");return a.choiceId;})};
}
