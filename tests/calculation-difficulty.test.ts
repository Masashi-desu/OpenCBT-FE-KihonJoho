import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fixture}from'./fixtures';
import{calculationReviews}from'./fixtures/calculation-options';
import{bookletCalculationDifficultyInventory}from'./helpers/booklet-calculation-difficulty';
import{scopeForQuestion}from'../scripts/ci/booklet-scope.mjs';

test('physical calculation wrappers and the CI manifest cover the complete independent per-source work inventory once',()=>{
 const rows=bookletCalculationDifficultyInventory(),manifest=JSON.parse(fs.readFileSync('scripts/ci/public-test-manifest.json','utf8')).files,bundle=fixture(),expected:string[]=[];
 assert.deepEqual(rows.map(r=>[r.scope,r.count]),[['2023-a',4],['2024-a',4],['2025-a',8],['2025-b',4],['2026-a',3]]);
 for(const row of rows){const file=`tests/booklets/${row.scope}/calculation-difficulty.test.ts`;expected.push(file);assert.equal(fs.readFileSync(file,'utf8').split(`registerBookletCalculationDifficultyTests("${row.scope}");`).length,2);assert.deepEqual(manifest[file]?.scopes,[row.scope]);assert.equal(manifest[file]?.count,row.count);assert.deepEqual(manifest[file]?.names,row.names);for(const id of row.sourceIds){const q=bundle.questions.find(q=>q.id==='question-ipa-'+id)!;assert(q);assert.equal(scopeForQuestion(q),row.scope);}}
 assert.deepEqual(Object.keys(manifest).filter(p=>/^tests\/booklets\/[^/]+\/calculation-difficulty\.test\.ts$/.test(p)).sort(),expected.sort());
 const precision=rows.flatMap(r=>r.conditions).filter(c=>c.kind==='source-options-and-seeded-precision');assert.deepEqual(precision.flatMap(c=>c.sourceIds).sort(),calculationReviews.map(r=>r.source).sort());assert(precision.every(c=>c.seeds===256));
});
test('booklet calculation partition preserves the exhaustive domains and saved-history workload without replaying other booklets',()=>{
 const conditions=bookletCalculationDifficultyInventory().flatMap(r=>r.conditions),one=(kind:string)=>{const matches=conditions.filter(c=>c.kind===kind);assert.equal(matches.length,1);return matches[0];};
 assert.equal(one('exhaustive-radix-and-real-sampler').inputs,21504);assert.equal(one('exhaustive-radix-and-real-sampler').samplerSeeds,262144);assert.equal(one('exhaustive-clean-cafe-inputs').inputs,6002);assert.equal(one('exhaustive-exact-availability-inputs').inputs,291);assert.equal(one('exhaustive-exact-contingency-tables').inputs,592);assert.equal(one('bookmark-numeric-adjacency-and-saved-history').policies,2);assert.equal(one('bookmark-numeric-adjacency-and-saved-history').drawsPerPolicy,100);
});
