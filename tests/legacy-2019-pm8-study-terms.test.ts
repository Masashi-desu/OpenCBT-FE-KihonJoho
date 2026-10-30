/** Source-local extraction: original test title, oracle, loops and non-annual assertions retained. Annual-only aggregate assertions are listed verbatim in HISTORICAL-BOUNDARIES.json and remain in F original tests. */
import test from "node:test";
import assert from "node:assert/strict";
import {legacy2019Pm8StudyTerms as terms,legacy2019Pm8RelatedTerms as related} from "../src/core/generators/legacy-2019-pm8-study-terms";
import {legacy2019Pm8TermReview as review} from "./fixtures/legacy-2019-pm8-study-terms-review";
test("2019 PM8 source-scoped12 terms preserve source-specific bit direction, denominator, tie order and recursion return facts",()=>{assert.equal(terms.length,12);assert.deepEqual(related[review.source],review.facts.map(f=>f.term));for(const fact of review.facts){const term=terms.find(t=>t.term===fact.term);assert(term);assert.deepEqual(term.sources,[review.source]);for(const part of fact.must)assert(term.meaning.includes(part),`${term.term}: ${part}`);}});
