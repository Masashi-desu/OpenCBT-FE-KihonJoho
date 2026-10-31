import type {AdapterNode,DefinitionContract,DefinitionMetadata,NativeDefinition} from "./composition";
import reviewed from "./reviewed-contracts/legacy-2019-information.json";
import type {GenerationDefinition} from "./definition";
import {contentHash,sortedJson} from "../hash";
/** Caller injects the effective canonical pool. No runtime import of another
 * year, its factory or the shared registry is allowed in this module. */
export const legacy2019InformationBinding={source:"2019h31h-fe-am-31",canonicalSource:"2017h29h-fe-am-31",sourceAnswer:"ア",version:"3.2.0",fields:[{name:"層と中継機能",minimum:0,maximum:3}],reference:[0],domain:[[0,3]],answerVariation:"variable"} as const;
/** Frozen after both source images, independent meanings and the final
 * 2017 effective contract were compared. These are change detectors. */
export const legacy2019InformationHashes=["dba01a3d065a1a437d67731f082417a33be2dff2c7fea24fa5fe9d260c98adb3","849bfbcc68bbf668b2a0a5486cb91310359de728de3941f4aab8026b4f5dd532","c9d3503078771f6a86564947b613a592be76f4459afb764db501592ad2d56326","a5d1c9c8980428e439ad7dd14e57d6af638c0cfedc2577069918c15a28609d51"] as const;
function canonicalFrom(pool:readonly GenerationDefinition[]):GenerationDefinition{
 const b=legacy2019InformationBinding,matches=pool.filter(d=>d.source===b.canonicalSource);
 if(matches.length!==1)throw Error("LEGACY_2019_INFORMATION_CANONICAL_REQUIRED");
 const d=matches[0],{build:_,...metadata}=d;
 // The binding's default variable/domain are not definition properties.
 if(JSON.stringify(Object.keys(metadata).sort())!==JSON.stringify(Object.keys(reviewed.canonical.metadata).sort())||JSON.stringify(sortedJson(metadata))!==JSON.stringify(sortedJson(reviewed.canonical.metadata)))throw Error("LEGACY_2019_INFORMATION_CANONICAL_REVIEW_REQUIRED");
 return d;
}
function adaptedDefinition(dependency:Pick<GenerationDefinition,"build">):GenerationDefinition{
 return {...structuredClone(reviewed.adapter.metadata) as DefinitionMetadata,build:values=>{
  if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>3)throw Error("PARAMETER_CONSTRAINT");return dependency.build(values);
 }};
}
export async function makeLegacy2019InformationAliases(pool:readonly GenerationDefinition[]):Promise<GenerationDefinition[]>{
 const d=canonicalFrom(pool);
 for(let v=0;v<4;v++)if(await contentHash(d.build([v]))!==legacy2019InformationHashes[v])throw Error("LEGACY_2019_INFORMATION_BODY_REVIEW_REQUIRED");
 return [adaptedDefinition(d)];
}
function contract(row:typeof reviewed.canonical|typeof reviewed.adapter):DefinitionContract{
 return {metadata:structuredClone(row.metadata) as DefinitionMetadata,inputs:row.outputs.map(r=>({values:[...r.values],expected:{kind:"body",sha256:r.sha256}}))};
}
export async function makeLegacy2019InformationCompositionInput(pool:readonly GenerationDefinition[]):Promise<{native:NativeDefinition[];adapters:AdapterNode[]}>{
 const canonical=canonicalFrom(pool),b=legacy2019InformationBinding;
 for(const row of[reviewed.canonical,reviewed.adapter])if(await contentHash(row.metadata)!==row.metadataSha256)throw Error("LEGACY_2019_INFORMATION_CONTRACT_REVIEW_REQUIRED");
 return {native:[{definition:canonical,contract:contract(reviewed.canonical)}],adapters:[{source:b.source,dependencies:[b.canonicalSource],dependencyInputs:structuredClone(reviewed.dependencyInputs),contract:contract(reviewed.adapter),create:dependencies=>adaptedDefinition(dependencies.get(b.canonicalSource))}]};
}
