import {contentHash,sortedJson} from "../hash";
import type {AdapterNode,DefinitionContract,DefinitionMetadata,NativeDefinition} from "./composition";
import reviewed from "./reviewed-contracts/legacy-2017-computing.json";
import type {GenerationDefinition} from "./definition";
/** Same original problem as 2018 autumn AM9. Caller injects the reviewed
 * effective canonical definition; this module does not import another year
 * or the shared registry at runtime. */
export const legacy2017ComputingCanonicalBinding={source:"2017h29h-fe-am-8",canonicalSource:"2018h30a-fe-am-9",sourceAnswer:"エ",version:"3.2.0",fields:[{name:"命令構成",minimum:0,maximum:1},{name:"動作クロックの倍率",minimum:1,maximum:3}],reference:[0,2]} as const;
function canonicalFrom(pool:readonly GenerationDefinition[]):GenerationDefinition{
 const c=legacy2017ComputingCanonicalBinding,matches=pool.filter(d=>d.source===c.canonicalSource);
 if(matches.length!==1)throw Error("LEGACY_2017_MIPS_CANONICAL_REQUIRED");
 const d=matches[0],{build:_,...metadata}=d;
 if(JSON.stringify(Object.keys(metadata).sort())!==JSON.stringify(Object.keys(reviewed.canonical.metadata).sort())||JSON.stringify(sortedJson(metadata))!==JSON.stringify(sortedJson(reviewed.canonical.metadata)))throw Error("LEGACY_2017_MIPS_CANONICAL_REVIEW_REQUIRED");
 return d;
}
/** Shared lazy identity reader; no body/metadata sampling and no version fallback. */
function adaptedDefinition(dependency:Pick<GenerationDefinition,"build">):GenerationDefinition{
 const c=legacy2017ComputingCanonicalBinding;
 return {...structuredClone(reviewed.adapter.metadata) as DefinitionMetadata,build:values=>{
  if(values.length!==c.fields.length||values.some((v,i)=>!Number.isInteger(v)||v<c.fields[i].minimum||v>c.fields[i].maximum))throw Error("PARAMETER_CONSTRAINT");
  return dependency.build(values);
 }};
}
export function makeLegacy2017ComputingCanonicalDefinitions(pool:readonly GenerationDefinition[]):GenerationDefinition[]{
 return [adaptedDefinition(canonicalFrom(pool))];
}
function contract(row:typeof reviewed.canonical|typeof reviewed.adapter):DefinitionContract{
 return {metadata:structuredClone(row.metadata) as DefinitionMetadata,inputs:row.outputs.map(r=>({values:[...r.values],expected:{kind:"body",sha256:r.sha256}}))};
}
export async function makeLegacy2017ComputingCompositionInput(pool:readonly GenerationDefinition[]):Promise<{native:NativeDefinition[];adapters:AdapterNode[]}>{
 const canonical=canonicalFrom(pool),c=legacy2017ComputingCanonicalBinding;
 for(const row of[reviewed.canonical,reviewed.adapter])if(await contentHash(row.metadata)!==row.metadataSha256)throw Error("LEGACY_2017_MIPS_CONTRACT_REVIEW_REQUIRED");
 return {native:[{definition:canonical,contract:contract(reviewed.canonical)}],adapters:[{source:c.source,dependencies:[c.canonicalSource],dependencyInputs:structuredClone(reviewed.dependencyInputs),contract:contract(reviewed.adapter),create:dependencies=>adaptedDefinition(dependencies.get(c.canonicalSource))}]};
}
