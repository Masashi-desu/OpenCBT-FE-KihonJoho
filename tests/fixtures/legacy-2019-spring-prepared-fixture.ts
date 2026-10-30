/** Current factory metadata only: no staged Question snapshots, PDFs, JIS lower
 * table. The exact scoped root material receipt is independent of booklet
 * admission. Gold answers remain a separate fixture. */
import assert from'node:assert/strict';import fs from'node:fs';import{createHash}from'node:crypto';
import metadataJSON from'./legacy-2019-spring-source-metadata.json';
import{spring2019MaterialAssessmentSHA}from'../../scripts/legacy-2019-spring-material-scope';
import evidenceJSON from'./legacy-2019-spring-pm9-reference-evidence.json';
import{spring2019AllSpecs}from'../../scripts/legacy-2019-spring-all-specs';
import{spring2019PreparedRecords,type Spring2019PreparedInput,type Spring2019PreparedSpec,type Spring2019PreparedBundle}from'../../scripts/import-legacy-2019-spring-pm-preparation';
const metadata=metadataJSON as unknown as{collection:Spring2019PreparedInput['collection'];pages:Spring2019PreparedInput['pages']};
assert.equal(createHash('sha256').update(fs.readFileSync(new URL('./legacy-2019-spring-source-metadata.json',import.meta.url))).digest('hex'),'b21c65c25ba49a1d8b7c49a861ed715fc940c0cb908b4bebcfe2ada587cbaf8e');
const receiptBytes=fs.readFileSync(new URL('./legacy-2019-spring-material-assessment.json',import.meta.url));assert.equal(createHash('sha256').update(receiptBytes).digest('hex'),spring2019MaterialAssessmentSHA);
export function spring2019TestInput(spec:Spring2019PreparedSpec):Spring2019PreparedInput{
 const select=(pages:readonly number[])=>pages.map(n=>{const page=metadata.pages.find(p=>p.page===n);assert(page);return structuredClone(page);});
 return{materialReceipt:{sha256:spring2019MaterialAssessmentSHA,assessment:JSON.parse(receiptBytes.toString())},collection:structuredClone(metadata.collection),pages:select(spec.pages),materials:select(spec.materialGroups.flatMap(g=>g.pages)),...(spec.number===9?{referenceEvidence:structuredClone(evidenceJSON)}:{})};
}
const pairs=await Promise.all(spring2019AllSpecs.map(async spec=>[spec.number,(await spring2019PreparedRecords(spec,spring2019TestInput(spec))).bundle]as const));
const bundles=new Map<number,Spring2019PreparedBundle>(pairs);
export function spring2019TestBundle(number:number):Spring2019PreparedBundle{const b=bundles.get(number);assert(b);return structuredClone(b);}
export const spring2019TestRawPages=()=>structuredClone(metadata.pages);
