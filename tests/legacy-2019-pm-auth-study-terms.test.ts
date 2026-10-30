/** Source-local extraction: original test title, oracle, loops and non-annual assertions retained. Annual-only aggregate assertions are listed verbatim in HISTORICAL-BOUNDARIES.json and remain in F original tests. */
import test from "node:test";
import assert from "node:assert/strict";
import {legacy2019PmAuthStudyTerms as terms,legacy2019PmAuthInheritedTerms as inherited,legacy2019PmAuthRelatedTerms as related} from "../src/core/generators/legacy-2019-pm-auth-study-terms";
import {legacy2019PmAuthTermReview as review} from "./fixtures/legacy-2019-pm-auth-study-terms-review";
import {studyAcronyms} from "../src/core/study-acronyms";
test("2019 spring PM1 all22 scoped concepts and7 inherited acronyms keep formal names and source-specific factor,key,payload distinctions",()=>{
 assert.equal(terms.length,22);assert.equal(inherited.length,7);assert.equal(related[review.source].length,29);assert.deepEqual(related[review.source],[...review.facts.map(f=>f.term),...review.inherited.map(f=>f.term)]);
 for(const fact of review.facts){const t=terms.find(t=>t.term===fact.term);assert(t);assert.deepEqual(t.sources,[review.source]);if("expansion"in fact)assert.equal(t.expansion,fact.expansion);for(const part of fact.must)assert(t.meaning.includes(part),`${t.term}: ${part}`);}
 for(const fact of review.inherited){assert(inherited.some(t=>t.source===review.source&&t.term===fact.term));const t=studyAcronyms.find(t=>t.term===fact.term);assert(t);assert.equal(t.expansion,fact.expansion);assert(t.meaning.length>10);}
});
