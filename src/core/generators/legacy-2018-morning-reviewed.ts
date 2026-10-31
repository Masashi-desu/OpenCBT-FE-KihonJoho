import {legacy2018PendingAmDefinitions} from "./legacy-2018-pending-am";
import {legacy2018AutumnRemainingAmDefinitions} from './legacy-2018-autumn-remaining-am';
import {legacy2018AutumnDevelopmentDefinitions} from "./legacy-2018-autumn-development";
import {legacy2018AutumnLteDefinitions} from "./legacy-2018-autumn-lte";
import {legacy2018AutumnNetworkDefinitions} from "./legacy-2018-autumn-network";
import {legacy2018AutumnSystemsDefinitions} from "./legacy-2018-autumn-systems";
import {legacy2018TechnicalDefinitions} from "./legacy-2018-technical";
import {legacy2018StrategyDefinitions} from "./legacy-2018-strategy";
import {legacy2018DevelopmentDefinitions} from "./legacy-2018-development";
import { legacy2018NumericDefinitions } from "./legacy-2018-numeric";
import { legacy2018TraceDefinitions } from "./legacy-2018-traces";
import { legacy2018AliasDefinitions } from "./legacy-2018-aliases";
import {legacy2018DecemberDefinitions} from "./legacy-2018-dec-aliases";
import {legacy2018ReviewedKnowledgeDefinitions} from "./legacy-2018-knowledge-reviewed";
import {legacy2018FundamentalDefinitions} from "./legacy-2018-fundamentals";
import {legacy2018SystemDefinitions} from "./legacy-2018-systems";
import {legacy2018NetworkSecurityDefinitions} from "./legacy-2018-network-security";
import {legacy2018ComputingDefinitions} from "./legacy-2018-computing";
import type {GenerationDefinition} from "./definition";
import {makeLegacy2018AutumnFoundationsDefinitions} from "./legacy-2018-autumn-foundations";
import {legacy2018AutumnCanonicalAliases} from "./legacy-2018-autumn-foundations-alias";
/** Morning-only accepted prepared composition. The six stage1 collections
 * retain their full80 denominators; this factory is not release admission. */
const earlierMorningDefinitions=(knowledge:readonly GenerationDefinition[])=>[...legacy2018NumericDefinitions,...legacy2018TraceDefinitions,...legacy2018AliasDefinitions,...legacy2018DecemberDefinitions,...knowledge,...legacy2018FundamentalDefinitions,...legacy2018SystemDefinitions,...legacy2018ComputingDefinitions,...legacy2018NetworkSecurityDefinitions,...legacy2018DevelopmentDefinitions,...legacy2018StrategyDefinitions,...legacy2018TechnicalDefinitions];
/** Required pool injection, matching the pending shared registry. No default
 * raw-year import can replace a wrapped effective canonical definition. */
export function makeLegacy2018ReviewedMorningDefinitions(effectiveCanonicalPool:readonly GenerationDefinition[],knowledge:readonly GenerationDefinition[]=legacy2018ReviewedKnowledgeDefinitions){return [...earlierMorningDefinitions(knowledge),...makeLegacy2018AutumnFoundationsDefinitions(effectiveCanonicalPool),...legacy2018AutumnSystemsDefinitions,...legacy2018AutumnNetworkDefinitions,...legacy2018AutumnLteDefinitions,...legacy2018AutumnDevelopmentDefinitions,...legacy2018AutumnRemainingAmDefinitions,...legacy2018PendingAmDefinitions];}
