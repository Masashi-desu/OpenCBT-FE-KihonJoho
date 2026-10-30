/** Expected state comes from this checkout's actual schema enum, never a
 * producer answer or the diagnostic under test. A future registered profile is
 * expected to pass; unknown profiles remain strict native-schema failures. */
import type{Question}from'../../src/core/types';
import diagram from'../../docs/public/schemas/diagram.schema.json';
const branch=diagram.properties.scene.oneOf.find(b=>b.properties.kind.const==='source_figure') as unknown as{properties:{profile:{enum:string[]}}};
const ownProfiles=new Set(branch.properties.profile.enum);
export function expectedLegacy2019Diagnostic(q:Question){let missing=0;const walk=(v:unknown):void=>{if(!v||typeof v!=='object')return;const r=v as Record<string,unknown>,s=r.scene as Record<string,unknown>|undefined;if(r.type==='diagram'&&s?.kind==='source_figure'&&!ownProfiles.has(String(s.profile)))missing++;for(const child of Object.values(r))walk(child);};walk(q);return{status:missing?'pending_shared_figure_registration' as const:'pass' as const,pendingFigureCount:missing||undefined};}
