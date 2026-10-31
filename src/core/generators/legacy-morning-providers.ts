import type {GenerationDefinition} from "./definition";
import {makeDevelopmentOperationsRole} from "./development-operations-model";
import reviewed from "./reviewed-contracts/legacy-2017-modern.json";
import {sortedJson} from "../hash";

/** This is a dependency role used only during AM composition. It is never
 * registered as a public question generator, and never changes the supplied
 * current-subject definitions or their saved-history versions. The descriptor
 * is the already-reviewed AM56 dependency contract, not a compatibility copy. */
export function makeLegacyMorningProviders(publicDefinitions:readonly GenerationDefinition[]):GenerationDefinition[]{
 const source="2024-a-14", selected=publicDefinitions.filter(d=>Object.getOwnPropertyDescriptor(d,"source")?.value===source);
 if(selected.length!==1)throw Error("MORNING_PROVIDER_REQUIRED "+source);
 const row=reviewed.rows.find(r=>r.canonical.metadata.source===source);
 if(!row)throw Error("MORNING_PROVIDER_CONTRACT");
 const metadata=structuredClone(row.canonical.metadata) as Omit<GenerationDefinition,"build">,role=makeDevelopmentOperationsRole();
 const {build,...modelMetadata}=role,{source:_source,notes:_notes,...expected}=metadata,{notes,...actual}=modelMetadata;
 if(JSON.stringify(sortedJson(actual))!==JSON.stringify(sortedJson(expected))||!metadata.notes.startsWith(notes))throw Error("MORNING_PROVIDER_METADATA");
 const dependency={...metadata,build};
 return publicDefinitions.map(d=>d===selected[0]?dependency:d);
}
