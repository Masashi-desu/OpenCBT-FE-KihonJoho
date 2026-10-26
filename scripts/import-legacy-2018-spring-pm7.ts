/** Pure excluded records. No FS/CLI/public effects or material admission. */
import assert from 'node:assert/strict';
import type {Question} from '../src/core/types';
import type {GeneratedBody} from '../src/core/generators/definition';
import {legacy2018SpringPm7Definition as definition} from '../src/core/generators/legacy-2018-spring-pm7';
import metadata from '../tests/fixtures/legacy-2018-spring-pm7-original-metadata.json';
import {spring2018PreparedRecords,bindSpring2018PreparedBody,type Spring2018PreparedInput,type Spring2018PreparedSpec} from './import-legacy-2018-spring-pm-preparation';
const diagramPages:Record<string,number[]>={"legacy-2018-profit-table":[35],"legacy-2018-cost-curves":[37]};
export const legacy2018SpringPm7Spec:Spring2018PreparedSpec={number:7,area:'strategy',pages:[35,36,37],definition,choicePages:[36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,37,37,37,37,37,37,37,37,37,37,37],officialMarks:["エ","イ","エ","イ","イ","イ","イ","ア"],fieldChoiceCounts:[5,5,5,5,3,4,3,4],sharedBanks:[],topics:["収益","損益分岐点"],keywords:["固定費","変動費率","最大値下げ率"],diagramPages(block){assert(block.scene.kind==='source_figure');const pages=diagramPages[block.scene.profile];assert(pages,'unknown source-local figure');return pages;}};
export function legacy2018SpringPm7Records(input:Spring2018PreparedInput){assert.deepEqual(input,metadata,'exact fresh raw/source metadata; no synthetic or omitted page accepted');return spring2018PreparedRecords(legacy2018SpringPm7Spec,input);}
export function bindLegacy2018SpringPm7Body(base:Question,body:GeneratedBody){return bindSpring2018PreparedBody(base,body,legacy2018SpringPm7Spec);}
