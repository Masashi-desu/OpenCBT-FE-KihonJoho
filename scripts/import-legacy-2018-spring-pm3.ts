import pageAlts from '../tests/fixtures/legacy-2018-spring-pm3-source-alts.json';
import assert from 'node:assert/strict';
import pins from '../tests/fixtures/legacy-2018-spring-pm3-original-metadata.json';
import {legacy2018SpringPm3Definition as definition} from '../src/core/generators/legacy-2018-spring-pm3';
import {spring2018PreparedRecords,bindSpring2018PreparedBody,type Spring2018PreparedInput,type Spring2018PreparedSpec} from './import-legacy-2018-spring-pm-preparation';
export const legacy2018SpringPm3Spec:Spring2018PreparedSpec={number:3,area:'technology',originalPageAlt:page=>{const text=pageAlts[String(page) as keyof typeof pageAlts];assert(text);return text;},pages:[14,15,16,17],definition,choicePages:[...Array(4).fill(15),...Array(8).fill(16),...Array(4).fill(17)],officialMarks:['ウ','エ','イ','エ'],fieldChoiceCounts:[4,4,4,4],topics:['関係データベース','SQL'],keywords:['主キー','DISTINCT','GROUP BY','COUNT','NULL'],diagramPages:b=>{if(b.scene.kind!=='source_figure')throw Error('SPRING2018_SCENE');return b.scene.profile.endsWith('bank')?[[15,16,16,17][b.scene.values.at(-1)!]]:b.scene.profile.endsWith('0')?[14]:[[15,16,17][b.scene.values[0]]];}};
export async function legacy2018SpringPm3Records(input:Spring2018PreparedInput){assert.deepEqual(input,pins);return spring2018PreparedRecords(legacy2018SpringPm3Spec,input);}
export const bindLegacy2018SpringPm3Body=(base:Parameters<typeof bindSpring2018PreparedBody>[0],body:Parameters<typeof bindSpring2018PreparedBody>[1])=>bindSpring2018PreparedBody(base,body,legacy2018SpringPm3Spec);
