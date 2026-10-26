/** Pure excluded records. No FS/CLI/public effects or material admission. */
import assert from 'node:assert/strict';
import healthFacts from '../tests/fixtures/legacy-2018-pm-health-facts.json';
import type {Question} from '../src/core/types';
import type {GeneratedBody} from '../src/core/generators/definition';
import {legacy2018SpringPm5Definition as definition} from '../src/core/generators/legacy-2018-spring-pm5';
import metadata from '../tests/fixtures/legacy-2018-spring-pm5-original-metadata.json';
import {spring2018PreparedRecords,bindSpring2018PreparedBody,type Spring2018PreparedInput,type Spring2018PreparedSpec} from './import-legacy-2018-spring-pm-preparation';
const diagramPages:Record<string,number[]>={"legacy-2018-health-system-relation":[24],"legacy-2018-health-record-layout":[25],"legacy-2018-health-master-layouts":[25],"legacy-2018-health-missing-flow":[27]};
export const legacy2018SpringPm5Spec:Spring2018PreparedSpec={number:5,area:'technology',pages:[23,24,25,26,27,28],definition,choicePages:[26,26,26,26,26,26,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],officialMarks:["キ","ウ","ウ","ア","エ"],fieldChoiceCounts:[10,10,6,4,5],sharedBanks:[[0,1]],originalPageAlt(page){const alts:Record<string,string>=healthFacts.pageAlt;const value=alts[String(page)];assert(value);return value;},topics:["情報参照","未受診者抽出"],keywords:["主キー","最小参照","整列","現在の在勤地"],diagramPages(block){assert(block.scene.kind==='source_figure');const pages=diagramPages[block.scene.profile];assert(pages,'unknown source-local figure');return pages;}};
export function legacy2018SpringPm5Records(input:Spring2018PreparedInput){assert.deepEqual(input,metadata,'exact fresh raw/source metadata; no synthetic or omitted page accepted');return spring2018PreparedRecords(legacy2018SpringPm5Spec,input);}
export function bindLegacy2018SpringPm5Body(base:Question,body:GeneratedBody){return bindSpring2018PreparedBody(base,body,legacy2018SpringPm5Spec);}
