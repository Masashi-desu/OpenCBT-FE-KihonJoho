import assert from 'node:assert/strict';
import type {GeneratedBody} from '../../src/core/generators/definition';
import fixed from './legacy-2019-autumn-remaining-am-knowledge-review.json';
/** Reviewed correspondence belongs to test evidence and is never imported by
 * producer. No generated answer/explanation is used to derive the expected key. */
export function assertLegacy2019AutumnRemainingAm(source:string,body:GeneratedBody,values:number[]){
 assert.equal(values.length,1);const r=fixed.rows.find(r=>r.source===source&&r.values[0]===values[0]);assert(r,'REVIEWED_QUERY_REQUIRED');
 assert.deepEqual(body.prompt,r.query.split('\n').map(text=>({type:'paragraph',text})),'SOURCE_QUERY_AND_ALL_PREMISES');
 assert.equal(body.choices.length,4);const truth=body.choices.map((blocks,i)=>{assert.deepEqual(blocks,[{type:'paragraph',text:r.findings[i].text}],'REVIEWED_CHOICE_MEANING');assert(r.findings[i].reason.length>0);return r.findings[i].satisfiesQuery;});
 assert.equal(truth.filter(Boolean).length,1,'UNIQUE_SATISFYING_CHOICE');assert.equal(body.correctIndex,truth.indexOf(true),'INDEPENDENT_KEY');
 for(const required of r.explanationRequired)assert(body.explanation.includes(required),'EXPLANATION_MEANING:'+required);
 return truth;
}
