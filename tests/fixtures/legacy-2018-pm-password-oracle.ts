import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import type {GeneratedBody} from '../../src/core/generators/definition';
import facts from './legacy-2018-pm-password-facts.json';
/** Uses manually source-reviewed predicates and Python-pinned countermodels,
 * never the production correct indices/functions to infer truth. */
export function legacy2018PasswordOracle(body:GeneratedBody,values:readonly number[]){
 assert.equal(values.length,1);const n=values[0];assert(Number.isSafeInteger(n)&&n>=0&&n<=3);
 assert.equal(body.prompt.length,facts.sourceBlocks.length);
 for(const [i,original]of facts.sourceBlocks.entries()){
  const block=body.prompt[i];
  if(original.type==='paragraph'){assert(block.type==='paragraph');assert.equal(block.text,original.text);}
  else{assert(block.type==='diagram');assert(block.scene.kind==='source_figure');assert.equal(block.scene.profile,`legacy-2018-password-${original.kind}`);assert.deepEqual(block.scene.values,values);assert.equal(block.caption,original.caption);assert.equal(block.alt,original.kind==='basic'?facts.sourceFigureAlts.basic:facts.sourceFigureAlts.salted);}
 }
 const groups=facts.originalChoices.map(g=>[...g]);groups[1][0]=facts.falseConditions[n];
 assert.equal(body.choices.length,21);assert.deepEqual(body.choices,groups.flat().map(text=>[{type:'paragraph',text}]));
 assert.equal(body.correctIndex,undefined);assert.equal(body.contexts,undefined);
 const counts=[5,4,4,4,4],offsets=[0,5,9,13,17];
 assert.deepEqual(body.answerParts,facts.partIds.map((id,i)=>({id:`part-${id}`,label:facts.partLabels[i],choiceIds:Array.from({length:counts[i]},(_,j)=>`choice-value-${offsets[i]+j+1}`)})));
 const correct=facts.truth.map(g=>{assert.equal(g.filter(Boolean).length,1);return g.findIndex(Boolean);});
 assert.deepEqual(body.partAnswers,facts.partIds.map((id,i)=>({kind:'choice',partId:`part-${id}`,choiceId:`choice-value-${offsets[i]+correct[i]+1}`})));
 for(const pattern of [/a：SHA-256/,/b：同じハッシュ関数.*同一のパスワード/,/二重にハッシュ化.*逆変換/,/秘密鍵で復号.*でもない/,/c：同じパスワード/,/出力長は変わらない/,/衝突が絶対に起きない.*ではない/,/d：ソルトごとに異なる入力/,/漏えい時に攻撃者も読み出せる/,/保存の都度生成/,/照合ではそのソルトを読み出して/,/e：初回/,/ハッシュ値の後ろへソルトとパスワード/,/各中間値をファイルと比較するわけでもない/,/繰返し回数を保存/])assert.match(body.explanation,pattern);
 assert.match(body.explanation,[/高頻度.*同じ値/,/文字列の順序/,/二回連結.*入力するデータ/,/末尾へ一文字.*入力するデータ/][n]);
 assert(!/[アイウエオ]が正答|原図.*復元した|必ず異なるハッシュ値/.test(body.explanation));
 return {truth:facts.truth.map(g=>[...g]),fixedSignature:body.partAnswers!.map(a=>a.kind==='choice'?a.choiceId:'').join('/'),meaningfulInput:n};
}
const h=(p:string)=>createHash('sha256').update(p,'ascii').digest('hex');
export function independentPasswordCountermodels(){for(const row of facts.countermodels){const q=row.kind==='reorder'?[...row.input].reverse().join(''):row.kind==='double'?row.input.repeat(2):row.input+'0';assert.equal(q,row.transformed);assert.equal(h(row.input),row.inputHash);assert.equal(h(q),row.transformedHash);assert.notEqual(row.inputHash,row.transformedHash);}return facts.countermodels.length;}
/** Finite operational witnesses, not reconstructions of either source figure
 * and not proofs of collision-freedom/preimage resistance. */
export function independentPasswordOperationalStates(){
 const salts=['r8Kp4!Vt7#Mz2@Qx','Z6mN8$Tq2!Rk4@Vx'],password='ab';let saved=0,stretch=0;
 for(const salt of salts)for(const supplied of ['ab','ac'])for(const mode of ['correct','otherSalt','unsalted']){
  const record={salt,hash:mode==='correct'?h(salt+password):mode==='otherSalt'?h(salts.find(s=>s!==salt)!+password):h(password)};
  assert.equal(h(record.salt+supplied)===record.hash,supplied===password&&mode==='correct');saved++;
 }
 for(const salt of salts)for(const rounds of [0,1,2]){
  let current=h(salt+password),calls=1;const messages=[salt+password];
  for(let i=0;i<rounds;i++){const input=current+salt+password;messages.push(input);current=h(input);calls++;}
  assert.equal(calls,rounds+1);assert.equal(current.length,64);assert.equal(messages[0],salt+password);assert(messages.slice(1).every(s=>s.endsWith(salt+password)&&s.length===64+salt.length+password.length));stretch++;
 }
 return{saveStates:saved,stretchStates:stretch,finalComparisonsPerCandidate:1};
}
