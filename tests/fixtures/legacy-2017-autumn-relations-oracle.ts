import assert from 'node:assert/strict';
import type {GeneratedBody} from '../../src/core/generators/definition';
import facts from './legacy-2017-autumn-relations-facts.json';
export function legacy2017AutumnRelationsOracle(source:string,body:GeneratedBody,values:number[]):boolean[]{
 assert.equal(source,facts.source);assert.equal(values.length,1);assert(Number.isInteger(values[0])&&values[0]>=0&&values[0]<=1);const r=facts.conditions[values[0]];
 assert.deepEqual(body.prompt,[{type:'paragraph',text:r.stem}]);assert.deepEqual(body.choices,facts.choices.map(text=>[{type:'paragraph',text}]));assert.equal(r.truth.filter(Boolean).length,1);assert.equal(body.correctIndex,r.truth.indexOf(true));assert.equal(body.explanation,r.explanation);assert.equal(body.answerParts,undefined);assert.equal(body.partAnswers,undefined);assert.equal(body.contexts,undefined);return [...r.truth];
}
