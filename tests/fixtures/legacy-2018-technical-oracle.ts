import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2018TechnicalKnowledgeOracle} from "./legacy-2018-technical-knowledge-oracle";
import {legacy2018TechnicalTraceOracle} from "./legacy-2018-technical-trace-oracle";
import {legacy2018TechnicalCircuitOracle} from "./legacy-2018-technical-circuit-oracle";
import {legacy2018TechnicalScheduleOracle} from "./legacy-2018-technical-schedule-oracle";
export function legacy2018TechnicalOracle(source:string,b:GeneratedBody,v:number[]){const n=Number(source.split("-").at(-1));if([3,28,34,43].includes(n))return legacy2018TechnicalKnowledgeOracle(source,b,v);if([2,5,6,9].includes(n))return legacy2018TechnicalTraceOracle(source,b,v);if(n===23)return legacy2018TechnicalCircuitOracle(b,v);if(n===16)return legacy2018TechnicalScheduleOracle(b,v);throw Error(`UNREVIEWED_TECHNICAL_SOURCE:${source}`);}
