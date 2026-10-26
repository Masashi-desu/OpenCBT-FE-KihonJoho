import pageAlts from '../tests/fixtures/legacy-2018-spring-pm4-source-alts.json';
import assert from 'node:assert/strict';
import pins from '../tests/fixtures/legacy-2018-spring-pm4-original-metadata.json';
import {legacy2018SpringPm4Definition as definition} from '../src/core/generators/legacy-2018-spring-pm4';
import {spring2018PreparedRecords,bindSpring2018PreparedBody,type Spring2018PreparedInput,type Spring2018PreparedSpec} from './import-legacy-2018-spring-pm-preparation';
export const legacy2018SpringPm4Spec:Spring2018PreparedSpec={number:4,area:'technology',originalPageAlt:page=>{const text=pageAlts[String(page) as keyof typeof pageAlts];assert(text);return text;},pages:[18,19,20,21,22],definition,choicePages:Array(17).fill(22),officialMarks:['イ','イ','ウ','ア','ウ'],fieldChoiceCounts:[4,4,4,5,5],sharedBanks:[[3,4]],topics:['クラウド','可用性','性能'],keywords:['仮想マシン','レプリケーション','負荷分散','通信処理量'],diagramPages:b=>[b.scene.kind==='source_figure'&&b.scene.profile.endsWith('bank')?22:18]};
export async function legacy2018SpringPm4Records(input:Spring2018PreparedInput){assert.deepEqual(input,pins);return spring2018PreparedRecords(legacy2018SpringPm4Spec,input);}
export const bindLegacy2018SpringPm4Body=(base:Parameters<typeof bindSpring2018PreparedBody>[0],body:Parameters<typeof bindSpring2018PreparedBody>[1])=>bindSpring2018PreparedBody(base,body,legacy2018SpringPm4Spec);
