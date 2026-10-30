/** Formal booklet leaves only. Existing private producers/canonical176 are
 * reused without changing their original registry or metadata. */
import type{GenerationDefinition}from'./definition';
import{legacy2019SpringExistingDefinitions}from'./legacy-2019-spring-pm-existing';
import{legacy2019SpringPm9Definition}from'./legacy-2019-spring-pm9';
import{legacy2019SpringPm11Definition}from'./legacy-2019-spring-pm11';
import{legacy2019SpringPm12Definition}from'./legacy-2019-spring-pm12';
import{legacy2019SpringPm13Definition}from'./legacy-2019-spring-pm13';
export const legacy2019SpringAfternoonDefinitions:GenerationDefinition[]=[...legacy2019SpringExistingDefinitions,legacy2019SpringPm9Definition,legacy2019SpringPm11Definition,legacy2019SpringPm12Definition,legacy2019SpringPm13Definition].sort((a,b)=>Number(a.source.split('-').at(-1))-Number(b.source.split('-').at(-1)));
