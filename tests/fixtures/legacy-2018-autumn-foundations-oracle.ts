import {legacy2018AutumnKnowledgeOracle} from "./legacy-2018-autumn-foundations-knowledge-oracle";
import {legacy2018AutumnMathOracle} from "./legacy-2018-autumn-foundations-math-oracle";
import {legacy2018AutumnUsbOracle} from "./legacy-2018-autumn-foundations-canonical-review";
import type {GeneratedBody} from "../../src/core/generators/definition";
export function legacy2018AutumnFoundationsOracle(source:string,body:GeneratedBody,values:number[]){if(source==="2018h30a-fe-am-12")return legacy2018AutumnUsbOracle(body,values);if([2,15,16].includes(Number(source.split("-").at(-1))))return legacy2018AutumnMathOracle(source,body,values);return legacy2018AutumnKnowledgeOracle(source,body,values);}
