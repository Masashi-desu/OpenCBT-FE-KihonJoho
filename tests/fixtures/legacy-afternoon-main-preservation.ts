import assert from "node:assert/strict";
import {readDistributionBundle} from "../../scripts/distribution-files";
import {additionalDefinitions} from "../../src/core/generators";
import {contentHash} from "../../src/core/hash";
import baseline from "./generator-composition-existing.json";
/** Pure current189 test carrier partition, never used by the actual booklet tests.
 * The real S2-01 distribution remains required by legacy-2017-spring-pm-booklet.test.ts.
 */
export function fixture(){
 const b=readDistributionBundle();
 b.questions=b.questions.filter(q=>!q.origin.sourceRefs.some(ref=>ref.locator.timeSlot));
 const ids=new Set(b.questions.map(q=>q.id));
 b.templates=b.templates.filter(t=>ids.has(t.baseQuestionRef.questionId));
 b.sets=b.sets.map(s=>({...s,questionRefs:s.questionRefs.filter(ref=>ids.has(ref.questionId)),generationBindings:s.generationBindings.filter(binding=>ids.has(binding.questionRef.questionId))})).filter(s=>s.questionRefs.length>0);
 b.exams=b.exams.filter(e=>!e.id.includes("2017-spring-pm"));
 const assets=new Set(b.questions.flatMap(q=>q.assetRefs));b.assets=b.assets.filter(a=>assets.has(a.id));
 b.sources=b.sources.filter(s=>!s.id.startsWith("source-ipa-2017h29h-fe-pm"));b.rights=b.rights.filter(r=>!r.id.startsWith("rights-ipa-2017h29h-fe-pm"));
 assert.equal(b.questions.length,378);assert.equal(b.templates.length,189);
 return b;
}
/** Frozen metadata/hash expectations were independently reviewed against main978775a;
 * this never derives an expected value from the newly synchronized implementation.
 */
export async function assertMainPreservation(){
 const b=fixture();assert.equal(additionalDefinitions.length,176);assert.equal(baseline.rows.length,189);
 for(const row of baseline.rows){const t=b.templates.find(t=>t.id===row.template.id)!;assert(t);assert.equal(await contentHash(t),row.template.contentSha256);assert.equal(t.revision,row.template.revision);const base=b.questions.find(q=>q.id===row.base.id&&q.revision===row.base.revision)!;assert(base);assert.equal(await contentHash(base),row.base.contentSha256);assert.deepEqual(t.baseQuestionRef,{questionId:base.id,revision:base.revision});assert.deepEqual(t.generatorRef,row.generator);assert.deepEqual(base.origin.derivedFrom,row.originals.map(o=>o.ref));for(const original of row.originals){const q=b.questions.find(q=>q.id===original.ref.questionId&&q.revision===original.ref.revision)!;assert(q);assert.equal(await contentHash(q),original.contentSha256);assert.equal(q.origin.kind,original.origin);}}
 for(const row of baseline.roots){const d=additionalDefinitions.find(d=>d.source===row.source)!;assert(d);assert.equal(await contentHash(JSON.parse(JSON.stringify(d))),row.metadataSha256);assert.equal(await contentHash(d.build([...d.reference])),row.referenceBodySha256);assert.equal(d.version,row.effectiveVersion);}
}
