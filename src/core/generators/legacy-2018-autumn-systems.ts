import {legacy2018AutumnSystemsKnowledgeDefinitions} from "./legacy-2018-autumn-systems-knowledge";
import {legacy2018AutumnNandDefinition} from "./legacy-2018-autumn-systems-nand";
import {legacy2018AutumnSystemsDataDefinitions,legacy2018AutumnHistoryProfile,legacy2018AutumnHistoryAlt} from "./legacy-2018-autumn-systems-data";
import {legacy2018AutumnSystemsNandProfile,legacy2018AutumnNandAlt} from "./legacy-2018-autumn-systems-models";
export const legacy2018AutumnSystemsDefinitions=[...legacy2018AutumnSystemsKnowledgeDefinitions,legacy2018AutumnNandDefinition,...legacy2018AutumnSystemsDataDefinitions];
export function legacy2018AutumnSystemsFigureAlt(profile:string,v:number[]){if(profile===legacy2018AutumnHistoryProfile)return legacy2018AutumnHistoryAlt;if(profile===legacy2018AutumnSystemsNandProfile)return legacy2018AutumnNandAlt(v);throw Error("PARAMETER_CONSTRAINT");}
