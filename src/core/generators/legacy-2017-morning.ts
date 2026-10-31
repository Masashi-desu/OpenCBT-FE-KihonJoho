import {legacy2017AutumnRelationsDefinitions} from './legacy-2017-autumn-relations';
import {legacy2017AutumnBusinessDefinitions} from "./legacy-2017-autumn-business";
import {legacy2017AutumnPlanningDefinitions} from "./legacy-2017-autumn-planning";
import {legacy2017AutumnQualityDefinitions} from "./legacy-2017-autumn-quality";
import {legacy2017AutumnSecurityDefinitions} from "./legacy-2017-autumn-security";
import {legacy2017AutumnNetworkDefinitions} from "./legacy-2017-autumn-network";
import {legacy2017AutumnDataDefinitions} from "./legacy-2017-autumn-data";
import {legacy2017AutumnPlatformDefinitions} from "./legacy-2017-autumn-platform";
import {legacy2017AutumnFoundationsDefinitions} from "./legacy-2017-autumn-foundations";
/** Morning-only composition of the accepted prepared cohort. Registration,
 * complete80 collections and material admission are separate responsibilities. */
import {legacy2017BusinessNativeDefinitions} from "./legacy-2017-business";
import {makeLegacy2017BusinessAdaptedDefinitions} from "./legacy-2017-business-adapter";
import type {GenerationDefinition} from "./definition";
import {legacy2017NumericDefinitions} from "./legacy-2017-numeric";
import {makeLegacy2017CanonicalDefinitions} from "./legacy-2017-aliases";
import {legacy2017KnowledgeDefinitions} from "./legacy-2017-knowledge";
import {legacy2017StrategyDefinitions} from "./legacy-2017-strategy";
import {legacy2017ManagementDefinitions} from "./legacy-2017-management";
import {legacy2017ComputingDefinitions} from "./legacy-2017-computing";
import {makeLegacy2017ComputingCanonicalDefinitions} from "./legacy-2017-computing-alias";
import {legacy2017InformationDefinitions} from "./legacy-2017-information";
import {legacy2017SystemsNativeDefinitions} from "./legacy-2017-systems";
import {makeLegacy2017SystemsAdaptedDefinitions} from "./legacy-2017-systems-adapter";
import {legacy2017DevelopmentNativeDefinitions} from "./legacy-2017-development";
import {makeLegacy2017DevelopmentAdaptedDefinitions} from "./legacy-2017-development-adapter";
export async function makeLegacy2017MorningDefinitions(canonicalDefinitions:readonly GenerationDefinition[]):Promise<GenerationDefinition[]>{return [...legacy2017AutumnBusinessDefinitions,...legacy2017AutumnPlanningDefinitions,...legacy2017AutumnQualityDefinitions,...legacy2017AutumnSecurityDefinitions,...legacy2017AutumnNetworkDefinitions,...legacy2017AutumnDataDefinitions,...legacy2017AutumnPlatformDefinitions,...legacy2017AutumnFoundationsDefinitions,...legacy2017BusinessNativeDefinitions,...await makeLegacy2017BusinessAdaptedDefinitions(canonicalDefinitions),...legacy2017DevelopmentNativeDefinitions,...await makeLegacy2017DevelopmentAdaptedDefinitions(canonicalDefinitions),...legacy2017SystemsNativeDefinitions,...await makeLegacy2017SystemsAdaptedDefinitions(canonicalDefinitions),...legacy2017NumericDefinitions,...legacy2017KnowledgeDefinitions,...legacy2017InformationDefinitions,...legacy2017ManagementDefinitions,...legacy2017StrategyDefinitions,...legacy2017ComputingDefinitions,...makeLegacy2017CanonicalDefinitions(canonicalDefinitions),...makeLegacy2017ComputingCanonicalDefinitions(canonicalDefinitions),...legacy2017AutumnRelationsDefinitions];}
