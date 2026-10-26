import test from 'node:test';
import assert from 'node:assert/strict';
import {contentHash} from '../src/core/hash';
import {legacy2018SpringPm12Definition as definition} from '../src/core/generators/legacy-2018-spring-pm12';
import {legacy2018SpringPm12Records as records,bindLegacy2018SpringPm12Body as bind} from '../scripts/import-legacy-2018-spring-pm12';
import input from './fixtures/legacy-2018-spring-pm12-original-metadata.json';

const materialSummary='必要資料の明示抜粋と独立参考の追加';
const domain=definition.fields.reduce<number[][]>((rows,f)=>rows.flatMap(row=>Array.from({length:f.maximum-f.minimum+1},(_,i)=>[...row,f.minimum+i])),[[]]);

test('Q12 factory retains current explanation and material history without past explanation payloads',async()=>{
 const {bundle}=await records(input),[original,base]=bundle.questions;
 assert.equal(domain.length,12);
 assert.equal(bundle.templates[0].originalContentSha256,await contentHash(base));
 for(const q of [original,base]){
  assert(q.origin.changes.some(change=>change.kind==='diagram'&&change.summary===materialSummary&&!change.affectsAnswer));
  assert.equal(q.origin.changes.filter(change=>change.summary===materialSummary).length,1);
  for(const change of q.origin.changes.slice(0,-1))assert.equal(change.answerDetails,undefined,'past question text must not remain in Q12 change records');
 }
 assert.deepEqual(base.explanation.blocks,[{type:'paragraph',text:definition.build(definition.reference).explanation}]);
 const before=structuredClone(base);
 for(const values of domain){
  const body=definition.build(values),q=bind(base,body);
  assert.deepEqual(q.explanation.blocks,[{type:'paragraph',text:body.explanation}]);
  assert.deepEqual(q.origin,base.origin,'binding must preserve the material and diagram history');
  assert.deepEqual(q.contexts,base.contexts);
  assert.deepEqual(q.contextRefs,base.contextRefs);
  assert.deepEqual(q.assetRefs,base.assetRefs);
  assert.deepEqual(q.correctAnswer.parts,body.partAnswers);
  assert.deepEqual(JSON.parse(JSON.stringify(q)),q);
 }
 assert.deepEqual(base,before,'the factory base is immutable across generated bindings');
});

test('Q12 binding removes an injected earlier explanation while retaining current answer and every change metadata field',async()=>{
 const {bundle}=await records(input),base=bundle.questions[1],contaminated=structuredClone(base);
 assert(contaminated.origin.changes.length>=2);
 for(const change of contaminated.origin.changes.slice(0,-1))change.answerDetails='obsolete explanation must never survive in a past change';
 const before=structuredClone(contaminated),values=domain.at(-1)!,body=definition.build(values),q=bind(contaminated,body);
 const expectedOrigin=structuredClone(before.origin);
 for(const change of expectedOrigin.changes.slice(0,-1))delete change.answerDetails;
 assert.deepEqual(q.origin,expectedOrigin);
 for(const change of q.origin.changes.slice(0,-1))assert(!Object.hasOwn(change,'answerDetails'));
 assert.deepEqual(q.explanation.blocks,[{type:'paragraph',text:body.explanation}]);
 assert.deepEqual(q.correctAnswer.parts,body.partAnswers);
 assert.deepEqual(q.contexts,base.contexts);
 assert.deepEqual(q.assetRefs,base.assetRefs);
 assert.deepEqual(contaminated,before,'cleanup must not mutate its supplied base');
 assert.deepEqual(bind(q,body),q,'the material attachment and history cleanup are idempotent');
});
