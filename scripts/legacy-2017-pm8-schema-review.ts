import assert from'node:assert/strict';
import type{Block,Question}from'../src/core/types';import{schema}from'../src/core/validation';
import domains from'../src/core/generators/legacy-2017-pm8-figure-domains.json';
/** Real schema validation. No renamed-profile or local schema projection. */
export function assessLegacy2017Pm8Schema(value:unknown){
 const q=value as Question;assert.equal(q.choiceShuffleAllowed,false);assert.equal(q.distribution,'excluded');assert(['question-ipa-2017h29h-fe-pm-8','question-template-source-2017h29h-fe-pm-8'].includes(q.id));
 const paths:string[]=[],profiles:string[]=[];
 const visit=(blocks:Block[],prefix:string)=>blocks.forEach((b,i)=>{if(b.type!=='diagram')return;assert(b.scene.kind==='source_figure');const d=domains[b.scene.profile as keyof typeof domains];assert(d);assert.equal(b.scene.values.length,d.length);assert(b.scene.values.every((n,j)=>Number.isInteger(n)&&n>=d[j][0]&&n<=d[j][1]));paths.push(`${prefix}/${i}`);profiles.push(b.scene.profile);});
 visit(q.prompt.blocks,'/prompt/blocks');q.contexts.forEach((c,i)=>visit(c.content.blocks,`/contexts/${i}/content/blocks`));q.choices.forEach((c,i)=>visit(c.content.blocks,`/choices/${i}/content/blocks`));
 assert.deepEqual(profiles,q.origin.kind==='official_reprint'?[]:['legacy-2017-pm8-graph','legacy-2017-pm8-program','legacy-2017-pm8-common-notation','legacy-2017-pm8-common-operators']);schema('question',q);return{status:'pass'as const,managedFigurePaths:paths};
}
