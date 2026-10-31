import {legacy2019AutumnQualityDefinitions} from "./legacy-2019-autumn-quality";
import {legacy2019AutumnNetworkDefinitions} from "./legacy-2019-autumn-network";
import {legacy2019AutumnStructuresDefinitions} from "./legacy-2019-autumn-structures";
import {legacy2019AutumnComputingDefinitions} from "./legacy-2019-autumn-computing";
import {legacy2019PlatformDefinitions} from "./legacy-2019-platform";
import {legacy2019StrategyDefinitions} from "./legacy-2019-strategy";
import {legacy2019ManagementDefinitions} from "./legacy-2019-management";
import {makeLegacy2019InformationAliases,legacy2019InformationBinding} from "./legacy-2019-information-alias";
import type {GenerationDefinition} from "./definition";
import { legacy2019QuantitativeDefinitions } from "./legacy-2019-quantitative";
import { legacy2019AlgorithmDefinitions } from "./legacy-2019-algorithms";
import {legacy2019SecurityDefinitions} from "./legacy-2019-security";
import { legacy2019KnowledgeDefinitions } from "./legacy-2019-knowledge";
import { legacy2019DataQueryDefinitions } from "./legacy-2019-data-queries";
import { makeLegacy2019CanonicalDefinitions } from "./legacy-2019-aliases";
import {legacy2019CanonicalBindings as decemberBindings} from "./legacy-2019-aliases";
/** Morning-only accepted prepared composition. No afternoon/year wrapper is
 * imported. Effective public/cross-year dependencies are supplied by the caller. */
export async function makeLegacy2019MorningDefinitions(effectivePool:readonly GenerationDefinition[]):Promise<GenerationDefinition[]>{
 const bindings=[...decemberBindings,legacy2019InformationBinding];
 for(const binding of bindings)if(effectivePool.filter(d=>d.source===binding.canonicalSource).length!==1)throw Error("LEGACY_2019_EFFECTIVE_CANONICAL_REQUIRED");
 const aliases=await makeLegacy2019InformationAliases(effectivePool);
 const all=[...legacy2019AutumnQualityDefinitions,...legacy2019AutumnNetworkDefinitions,...legacy2019AutumnStructuresDefinitions,...legacy2019AutumnComputingDefinitions,...legacy2019PlatformDefinitions,...legacy2019StrategyDefinitions,...legacy2019ManagementDefinitions,...legacy2019QuantitativeDefinitions,...legacy2019AlgorithmDefinitions,...legacy2019DataQueryDefinitions,...legacy2019KnowledgeDefinitions,...legacy2019SecurityDefinitions,...makeLegacy2019CanonicalDefinitions(effectivePool),...aliases];
 if(new Set(all.map(d=>d.source)).size!==all.length)throw Error("DUPLICATE_LEGACY_2019_DEFINITION");
 return all;
}
