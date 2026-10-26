/** Pure excluded records. No FS/CLI/public effects or material admission. */
import assert from 'node:assert/strict';
import type {Question} from '../src/core/types';
import type {GeneratedBody} from '../src/core/generators/definition';
import {legacy2018SpringPm6Definition as definition} from '../src/core/generators/legacy-2018-spring-pm6';
import metadata from '../tests/fixtures/legacy-2018-spring-pm6-original-metadata.json';
import {spring2018PreparedRecords,bindSpring2018PreparedBody,type Spring2018PreparedInput,type Spring2018PreparedSpec} from './import-legacy-2018-spring-pm-preparation';
const diagramPages:Record<string,number[]>={"legacy-2018-evm-timeline":[29],"legacy-2018-evm-plan-table":[30],"legacy-2018-evm-status":[33]};
export const legacy2018SpringPm6Spec:Spring2018PreparedSpec={number:6,area:'management',pages:[29,30,31,32,33,34],definition,choicePages:[30,30,30,30,32,32,32,32,32,32,32,32,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34],officialMarks:["ウ","ク","ア","カ","オ","イ"],fieldChoiceCounts:[4,8,4,6,6,6],sharedBanks:[[3,4]],topics:["EVM","工数予測"],keywords:["出来高","スケジュール差異","コスト差異"],diagramPages(block){assert(block.scene.kind==='source_figure');const pages=diagramPages[block.scene.profile];assert(pages,'unknown source-local figure');return pages;}};
export function legacy2018SpringPm6Records(input:Spring2018PreparedInput){assert.deepEqual(input,metadata,'exact fresh raw/source metadata; no synthetic or omitted page accepted');return spring2018PreparedRecords(legacy2018SpringPm6Spec,input);}
export function bindLegacy2018SpringPm6Body(base:Question,body:GeneratedBody){return bindSpring2018PreparedBody(base,body,legacy2018SpringPm6Spec);}
