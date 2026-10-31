import {legacy2018TechnicalKnowledgeDefinitions} from "./legacy-2018-technical-knowledge";
import {legacy2018TechnicalTraceDefinitions,legacy2018TechnicalFigureAllowed,legacy2018TechnicalFigureAlt} from "./legacy-2018-technical-traces";
import {legacy2018TechnicalCircuitDefinitions,legacy2018TechnicalCircuitAllowed,legacy2018TechnicalCircuitAlt} from "./legacy-2018-technical-circuit";
import {legacy2018TechnicalScheduleDefinitions,legacy2018ScheduleFigureAllowed,legacy2018ScheduleFigureAlt} from "./legacy-2018-technical-scheduling";
export const legacy2018TechnicalDefinitions=[...legacy2018TechnicalKnowledgeDefinitions,...legacy2018TechnicalTraceDefinitions,...legacy2018TechnicalCircuitDefinitions,...legacy2018TechnicalScheduleDefinitions];
export const legacy2018TechnicalProfiles=["legacy-2018-shortest-grid","legacy-2018-stack-state","legacy-2018-array-list","legacy-2018-instruction-fetch","legacy-2018-majority-truth-table","legacy-2018-majority-circuit","legacy-2018-priority-chart"];
export function legacy2018AllTechnicalFigureAllowed(profile:string,v:number[]){return legacy2018TechnicalFigureAllowed(profile,v)||legacy2018TechnicalCircuitAllowed(profile,v)||legacy2018ScheduleFigureAllowed(profile,v);}
export function legacy2018AllTechnicalFigureAlt(profile:string,v:number[]){if(legacy2018TechnicalFigureAllowed(profile,v))return legacy2018TechnicalFigureAlt(profile,v);if(legacy2018TechnicalCircuitAllowed(profile,v))return legacy2018TechnicalCircuitAlt(profile,v);return legacy2018ScheduleFigureAlt(profile,v);}
