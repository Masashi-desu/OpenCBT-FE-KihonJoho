import assert from'node:assert/strict';import type{Question}from'../src/core/types';
if(process.argv[2]==='glossary-first')await import('../src/core/generators/legacy-2018-autumn-pm1-study-terms');
const{questionStudyTerms}=await import('../src/core/study-terms');
if(process.argv[2]==='global-first')await import('../src/core/generators/legacy-2018-autumn-pm1-study-terms');
const q={id:'question-cycle-probe',subject:'B',origin:{sourceRefs:[{sourceId:'source-ipa-2018h30a-fe-pm-1-qs',locator:{section:'初期化順の出典検査',year:2018,period:'秋期',timeSlot:'午後',questionNumber:'1'}}]}}as Question;
const terms=questionStudyTerms(q);assert.equal(terms.length,25);assert.equal(new Set(terms.map(t=>t.term)).size,25);assert(terms.some(t=>t.term==='HTML'));assert(terms.some(t=>t.term==='暗号学的ハッシュ関数'));console.log(JSON.stringify({order:process.argv[2],terms:terms.length}));
