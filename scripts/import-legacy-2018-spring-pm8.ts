/** Pure excluded records. No FS/CLI/public effects or material admission. */
import assert from 'node:assert/strict';
import {spring2018FixedMaterialGroups} from '../src/core/generators/legacy-2018-spring-fixed-materials';
import type {Question} from '../src/core/types';
import type {GeneratedBody} from '../src/core/generators/definition';
import {legacy2018SpringPm8Definition as definition} from '../src/core/generators/legacy-2018-spring-pm8';
import metadata from '../tests/fixtures/legacy-2018-spring-pm8-original-metadata.json';
import {spring2018PreparedRecords,bindSpring2018PreparedBody,type Spring2018PreparedInput,type Spring2018PreparedSpec} from './import-legacy-2018-spring-pm-preparation';
const diagramPages:Record<string,number[]>={"legacy-2018-heap-tree":[38],"legacy-2018-heap-array":[39],"legacy-2018-heap-program-one":[40],"legacy-2018-heap-regions":[41],"legacy-2018-heap-program-two":[42]};
export const legacy2018SpringPm8Spec:Spring2018PreparedSpec={number:8,area:'technology',pages:[38,39,40,41,42,43],definition,choicePages:[40,40,40,40,40,40,40,40,40,40,43,43,43,43,43,43,43,43,43,43,43,43,43,43],officialMarks:["イ","エ","エ","イ","イ"],fieldChoiceCounts:[6,4,4,4,6],sharedBanks:[],topics:["ヒープ","昇順整列"],keywords:["親子関係","整数商","同値時右子","配列"],materialGroups:spring2018FixedMaterialGroups(8),diagramPages(block){assert(block.scene.kind==='source_figure');const pages=diagramPages[block.scene.profile];assert(pages,'unknown source-local figure');return pages;}};
export function legacy2018SpringPm8Records(input:Spring2018PreparedInput){assert.deepEqual(input,metadata,'exact fresh raw/source metadata; no synthetic or omitted page accepted');return spring2018PreparedRecords(legacy2018SpringPm8Spec,input);}
export function bindLegacy2018SpringPm8Body(base:Question,body:GeneratedBody){return bindSpring2018PreparedBody(base,body,legacy2018SpringPm8Spec);}
