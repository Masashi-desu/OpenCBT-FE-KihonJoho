import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {decAGeneratorOracle} from "./dec-a-generator-oracle";
import {developmentOperationsOracle} from "./development-operations-review";
/** Independent test-only semantic criteria; these do not import the annual
 * bindings or production calculation. Source identity is intentionally fixed. */
const reviewed:Record<string,number>={"2017h29h-fe-am-17":15,"2017h29h-fe-am-44":37,"2017h29h-fe-am-52":43,"2017h29h-fe-am-67":52,"2017h29a-fe-am-48":39};
export function legacy2017AliasOracle(source:string,body:GeneratedBody,values:number[]){
 if(source==="2017h29h-fe-am-56"){developmentOperationsOracle(body,values);return;}
 assert(source in reviewed,`Missing 2017 alias semantic oracle: ${source}`);
 decAGeneratorOracle(reviewed[source],body,values);
}
export function legacy2017AliasInputAllowed(source:string,values:number[]){return source!=="2017h29h-fe-am-56"||[[0,0,0,1],[0,0,1,0],[0,1,0,0],[1,0,0,0]].some(v=>JSON.stringify(v)===JSON.stringify(values));}
