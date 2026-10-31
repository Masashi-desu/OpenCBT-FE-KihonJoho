import {contentHash,sortedJson}from'../hash';
import {p,type GenerationDefinition,type GeneratedBody}from'./definition';
/** A caller supplies a wrapper of the actual current core binding. This module
 * never imports the core registry/generation module, scripts, or another year. */
export const legacy2017DevelopmentCoreBinding={
 dependency:'dependency-core-2024-a-13',wrapperVersion:'3.2.0',coreGenerator:'generator-critical-path',coreVersion:'2.2.0',
 baseSha256:'359628aa995666c3e2d5a44086cd77917873fa320f0a5fc7ae4d4807f9ecffac',templateSha256:'950c29631ba4ed887bc2f6715af00395818696c597fc09ede429af05c11092ca',
 vectors:[[30,5,30,20,40,25,30,30],[25,5,30,20,40,25,30,30],[35,5,30,20,40,25,30,30],[30,5,30,20,40,25,30,40]],
 bodyHashes:['627419289b1ed2787c291258d9fe69f816458439667bf3049b9ac31031a40634','d4dd9699bf0f07705efeb065e88e4720ed71af0631376ecf17c7ea6e948d026a','10cd1a6e287cf260a476f2a6b6628a90903469ed3821f9a844f95646aad6c6c8','8e2e918921bc415e759d9de802e33285b0aed765c00d120ed5e969f4e1c48e16'],
}as const;
import type {AdapterNode,DefinitionContract,DefinitionMetadata,NativeDefinition}from'./composition';
import reviewed from'./reviewed-contracts/legacy-2017-development-core.json';
/** One reviewed core body to the original2017 stem/choice order/numeric format. */
export function adaptLegacy2017DevelopmentCoreBody(raw:GeneratedBody):GeneratedBody{
 const body=structuredClone(raw);if(body.prompt.length!==2||body.prompt[0].type!=='paragraph'||body.prompt[1].type!=='diagram'||body.choices.length!==4||!Number.isInteger(raw.correctIndex)||raw.correctIndex!<0||raw.correctIndex!>3)throw Error('LEGACY_2017_CORE_FORMAT_REQUIRED');
 body.prompt[0]=p('図のアローダイアグラムで表されるプロジェクトは、完了までに最短で何日を要するか。');
 const order=[1,2,0,3];body.choices=order.map(index=>{const blocks=structuredClone(raw.choices[index]);if(blocks.length!==1||blocks[0].type!=='paragraph'||!/^\d{3}日$/.test(blocks[0].text))throw Error('LEGACY_2017_CORE_NUMERIC_CHOICES_REQUIRED');blocks[0].text=blocks[0].text.slice(0,-1);return blocks;});body.correctIndex=order.indexOf(raw.correctIndex!);return body;
}
function canonicalFrom(pool:readonly GenerationDefinition[]):GenerationDefinition{
 const c=legacy2017DevelopmentCoreBinding,found=pool.filter(d=>d.source===c.dependency);if(found.length!==1)throw Error('LEGACY_2017_CORE_BINDING_REQUIRED');const d=found[0],{build:_,...metadata}=d;
 if(JSON.stringify(Object.keys(metadata).sort())!==JSON.stringify(Object.keys(reviewed.canonical.metadata).sort())||JSON.stringify(sortedJson(metadata))!==JSON.stringify(sortedJson(reviewed.canonical.metadata)))throw Error('LEGACY_2017_CORE_BINDING_REVIEW_REQUIRED');return d;
}
function definition(read:GenerationDefinition['build']):GenerationDefinition{
 return{...structuredClone(reviewed.adapter.metadata)as DefinitionMetadata,build:values=>{if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>3)throw Error('PARAMETER_CONSTRAINT');return read(values);}};
}
export async function makeLegacy2017DevelopmentAdaptedDefinitions(pool:readonly GenerationDefinition[]):Promise<GenerationDefinition[]>{
 const c=legacy2017DevelopmentCoreBinding,d=canonicalFrom(pool),bodies:GeneratedBody[]=[];for(let i=0;i<c.vectors.length;i++){const raw=d.build([...c.vectors[i]]);if(await contentHash(raw)!==c.bodyHashes[i])throw Error('LEGACY_2017_CORE_BODY_REVIEW_REQUIRED');bodies.push(adaptLegacy2017DevelopmentCoreBody(raw));}return[definition(values=>structuredClone(bodies[values[0]]))];
}
function contract(row:typeof reviewed.canonical|typeof reviewed.adapter):DefinitionContract{
 return{metadata:structuredClone(row.metadata)as DefinitionMetadata,inputs:row.outputs.map(r=>({values:[...r.values],expected:{kind:'body',sha256:r.sha256}}))};
}
/** Metadata-only preparation/create. Build consumes one declared8-value read. */
export async function makeLegacy2017DevelopmentCompositionInput(pool:readonly GenerationDefinition[]):Promise<{native:NativeDefinition[];adapters:AdapterNode[]}>{
 const canonical=canonicalFrom(pool),c=legacy2017DevelopmentCoreBinding;for(const row of[reviewed.canonical,reviewed.adapter])if(await contentHash(row.metadata)!==row.metadataSha256)throw Error('LEGACY_2017_CORE_CONTRACT_REVIEW_REQUIRED');
 return{native:[{definition:canonical,contract:contract(reviewed.canonical)}],adapters:[{source:reviewed.adapter.metadata.source,dependencies:[c.dependency],dependencyInputs:structuredClone(reviewed.dependencyInputs),contract:contract(reviewed.adapter),create:deps=>{const dependency=deps.get(c.dependency);return definition(values=>adaptLegacy2017DevelopmentCoreBody(dependency.build([...c.vectors[values[0]]])));}}]};
}
