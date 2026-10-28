/** Current booklet factory inputs for tests. Contains metadata only: no PDF,
 * source image, staged Question snapshot, held JIS material or public admission.
 * Gold answers/source-unit fixtures stay independent of this factory. */
import assert from'node:assert/strict';import fs from'node:fs';import{createHash}from'node:crypto';
import metadataJSON from'./legacy-2018-autumn-source-metadata.json';
import{autumn2018AllSpecs}from'../../scripts/legacy-2018-autumn-all-specs';
import{autumn2018PreparedRecords,autumn2018MaterialAssessmentSHA,type Autumn2018PreparedSpec,type Autumn2018PreparedInput,type Autumn2018PreparedBundle,type Autumn2018RawPage}from'../../scripts/import-legacy-2018-autumn-pm-preparation';
const metadata=metadataJSON as unknown as {collection:Autumn2018PreparedInput['collection'];pages:Autumn2018RawPage[]};
export const autumn2018TestAssessmentBytes=fs.readFileSync(new URL('./legacy-2018-autumn-material-assessment.json',import.meta.url));
assert.equal(createHash('sha256').update(autumn2018TestAssessmentBytes).digest('hex'),autumn2018MaterialAssessmentSHA);
export function autumn2018TestInput(spec:Autumn2018PreparedSpec):Autumn2018PreparedInput{
 const select=(ns:readonly number[])=>ns.map(n=>{const p=metadata.pages.find(p=>p.page===n);assert(p);return structuredClone(p);}),collection=structuredClone(metadata.collection);
 return{collection,rendered:{papers:{questionPaper:collection.questionPaper,answerPaper:collection.answerPaper},pages:select(spec.pages)},materials:select((spec.materialGroups??[]).flatMap(g=>g.pages)),materialReceipt:{sha256:autumn2018MaterialAssessmentSHA,assessment:JSON.parse(autumn2018TestAssessmentBytes.toString())}};
}
const pairs=await Promise.all(autumn2018AllSpecs.map(async spec=>[spec.number,(await autumn2018PreparedRecords(spec,autumn2018TestInput(spec))).bundle]as const));
const bundles=new Map<number,Autumn2018PreparedBundle>(pairs);
export function autumn2018TestBundle(number:number):Autumn2018PreparedBundle{const b=bundles.get(number);assert(b,'missing_current_autumn_factory_'+number);return structuredClone(b);}
export const autumn2018TestRawPages=()=>structuredClone(metadata.pages);
