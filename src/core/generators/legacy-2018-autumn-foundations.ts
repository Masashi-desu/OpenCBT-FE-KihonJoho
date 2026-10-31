import type {GenerationDefinition} from "./definition";
import {legacy2018AutumnFoundationsKnowledgeDefinitions} from "./legacy-2018-autumn-foundations-knowledge";
import {legacy2018AutumnFoundationsMathDefinitions} from "./legacy-2018-autumn-foundations-math";
import {makeLegacy2018AutumnCanonicalDefinitions} from "./legacy-2018-autumn-foundations-alias";
export const legacy2018AutumnLocalDefinitions=[...legacy2018AutumnFoundationsKnowledgeDefinitions,...legacy2018AutumnFoundationsMathDefinitions];
export function makeLegacy2018AutumnFoundationsDefinitions(effectiveCanonicalPool:readonly GenerationDefinition[]){return [...legacy2018AutumnLocalDefinitions,...makeLegacy2018AutumnCanonicalDefinitions(effectiveCanonicalPool)];}
