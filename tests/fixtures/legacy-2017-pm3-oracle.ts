/** Expectations fixed from the official source and design review, no producer imports. */
import assert from 'node:assert/strict';import type {GeneratedBody} from '../../src/core/generators/definition';import review from './legacy-2017-pm3-review.json';
export function assertLegacy2017Pm3(body:GeneratedBody,index:number){
 assert(Number.isInteger(index)&&index>=0&&index<4);assert.equal(body.prompt.length,20);assert.equal(body.choices.length,21);assert.equal(body.correctIndex,undefined);
 const original=review.original,groups=original.groups.map(g=>[...g.choices]);groups[4]=[...review.scenarioDChoices[index]];let cursor=0;
 for(const source of original.orderedBlocks){const actual=body.prompt[cursor++];
  if(source.kind==='figure'){assert(actual.type==='diagram'&&actual.scene.kind==='source_figure');assert.equal(actual.caption,source.caption);assert.equal(actual.scene.profile,review.profile);assert.deepEqual(actual.scene.values,[0]);assert.equal(cursor-1,5);for(const t of source.tables!)for(const text of [...t.headers,...t.rows.flat()])assert(actual.alt.includes(text));assert(actual.alt.includes('下線付き項目は主キー'));continue;}
  if(source.kind==='table'){assert(actual.type==='table');assert.equal(actual.caption,source.caption);assert.deepEqual(actual.columns,source.headers);const rows=structuredClone(source.rows!);rows[1][1]=review.scenarioCells[index];assert.deepEqual(actual.rows,rows);const values=[...actual.rows[1][1].matchAll(/“([^”]+)”/g)].map(m=>m[1]);assert.deepEqual(values,review.expectedStates[index]);continue;}
  if(source.kind==='code'){assert.deepEqual(actual,{type:'code',language:'sql',text:source.text});assert.equal(actual.text.split('\n').length,11);assert(actual.text.includes('UNIQUE (区分ID, 対象物ID)'));assert(!actual.text.includes('CHECK'));assert.deepEqual(body.prompt[cursor++],{type:'paragraph',text:'図2 ルール表作成用DDL'});continue;}
  let expected=source.text;
  if(source.kind==='choice-group'){const i=original.groups.findIndex(g=>g.id===source.group);expected=(i===0?'解答群':original.groups[i].id+'に関する解答群')+'\n'+groups[i].map((c,j)=>'アイウエオカ'[j]+'　'+c).join('\n');}
  assert.deepEqual(actual,{type:'paragraph',text:expected},source.id);
 }
 assert.equal(cursor,20);assert.deepEqual(body.choices,groups.flat().map(text=>[{type:'paragraph',text}]));
 const ids=['q1','a','b','c','d'],offsets=[0,3,9,13,17],labels=['設問1','設問2 a','設問2 b','設問3 c','設問3 d'];
 assert.deepEqual(body.answerParts,ids.map((id,i)=>({id:'part-'+id,label:labels[i],choiceIds:groups[i].map((_,j)=>'choice-value-'+(offsets[i]+j+1))})));
 const correct=review.truth.map(t=>{assert.equal(t.truth.filter(Boolean).length,1);return t.truth.findIndex(Boolean)});
 assert.deepEqual(correct,[0,3,0,0,0]);assert.deepEqual(body.partAnswers,ids.map((id,i)=>({kind:'choice',partId:'part-'+id,choiceId:'choice-value-'+(offsets[i]+correct[i]+1)})));
 // Literal state witnesses independently distinguish every condition. This
 // predicate is membership only; NOT NULL is a separate source requirement.
 const states=review.expectedStates[index],d=groups[4][0],literals=[...d.matchAll(/'([^']+)'/g)].map(m=>m[1]);assert.deepEqual(literals,states);
 const candidates=['未公開','審査中','公開','公開停止','不正',''];for(const v of candidates)assert.equal(literals.includes(v),states.includes(v));
 assert(body.explanation.includes('許容状態は'+states.join('・')));assert(body.explanation.includes(d));
 for(const phrase of ['旧表でも登録可能','非NULLのルールIDが参照先の既存ルール','NULLを保存し，後日','UNIQUEも不要','NOT NULL，対象物表への参照，ルールIDのPRIMARY KEYは保持','CHECK単独はNULL/UNKNOWNを許す','原の登録状態NOT NULLがNULLを別に拒否','CHECKは課内レビューの完了や状態遷移の順序を強制するものではない'])assert(body.explanation.includes(phrase),phrase);
 return {truths:21,correct:correct.map((n,i)=>groups[i][n]),states:[...states],membership:candidates.map(x=>states.includes(x))};
}
