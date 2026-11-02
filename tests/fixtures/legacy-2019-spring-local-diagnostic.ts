/** Strict staging diagnostics. Only a reviewed annual profile identifier may
 * differ from the native schema; no actual record is rewritten for delivery. */
import assert from "node:assert/strict";
import type {Question} from "../../src/core/types";
import {schema} from "../../src/core/validation";
import diagramSchema from "../../docs/public/schemas/diagram.schema.json";
import domains from "./legacy-2019-spring-local-domains.json";
import {validateSourceFigure} from "../../src/core/source-figures";
const sourceBranch=diagramSchema.properties.scene.oneOf.find(b=>b.properties.kind.const==="source_figure") as unknown as {properties:{profile:{enum?:string[];anyOf?:{enum?:string[];pattern?:string}[]}}};
// The namespace branch is a structural reservation, not registration. Keep
// the unchanged legacy enum order for profile-only diagnostic substitution.
const profileSchema=sourceBranch.properties.profile;
const legacyProfiles=profileSchema.enum??profileSchema.anyOf?.[0]?.enum;
assert(Array.isArray(legacyProfiles)&&legacyProfiles.length>0&&legacyProfiles.every(p=>typeof p==='string'),'Native source-figure enum is required');
const registered=new Set(legacyProfiles),diagnosticProfile=legacyProfiles[0];
const reservedPattern=profileSchema.anyOf?.[1]?.pattern;
const reservedNamespace=reservedPattern?new RegExp(reservedPattern):undefined;
assert(diagnosticProfile,"Native diagram profile enum must not be empty");
export function legacy2019CandidateSchema(question:Question){
  const diagnostic=structuredClone(question),pendingFigurePaths:string[]=[];
  const walk=(value:unknown,path:string)=>{
    if(!value||typeof value!=="object")return;
    const record=value as Record<string,unknown>,scene=record.scene as Record<string,unknown>|undefined;
    if(record.type==="diagram"&&scene?.kind==="source_figure"&&typeof scene.profile==="string"){
      // A reserved-but-unregistered name cannot bypass validation merely
      // because the broader structural schema accepts its spelling.
      if(reservedNamespace?.test(scene.profile))validateSourceFigure({kind:'source_figure',profile:scene.profile,values:scene.values as number[]});
      const domain=domains[scene.profile as keyof typeof domains];
      if(domain){const v=scene.values;assert(Array.isArray(v)&&v.length===domain.length,`Invalid reviewed figure arity at ${path}`);assert(v.every((n,i)=>Number.isInteger(n)&&n>=domain[i][0]&&n<=domain[i][1]),`Invalid reviewed figure input at ${path}`);
        if(!registered.has(scene.profile)){pendingFigurePaths.push(path);scene.profile=diagnosticProfile;}
      }
    }
    for(const [key,child] of Object.entries(record))walk(child,`${path}/${key.replaceAll("~","~0").replaceAll("/","~1")}`);
  };walk(diagnostic,"");
  try{schema("question",question);return{status:"pass" as const};}catch(error){
    // A diagnostic clone changes only whitelisted profile strings. Native
    // validation must then fully pass, including values, alt, IDs, credits,
    // answer structure and required fields outside the diagram itself.
    if(!pendingFigurePaths.length)throw error;
    schema("question",diagnostic);
    return{status:"pending_shared_figure_registration" as const,pendingFigurePaths,diagnosticNativeSchema:"pass" as const,diagnosticReplacement:"reviewed_unregistered_profile_identifiers_only" as const};
  }
}
