import pageAlts from '../tests/fixtures/legacy-2018-spring-pm1-source-alts.json';
import assert from 'node:assert/strict';
import pins from '../tests/fixtures/legacy-2018-spring-pm1-original-metadata.json';
import {legacy2018SpringPm1Definition as definition} from '../src/core/generators/legacy-2018-spring-pm1';
import {spring2018PreparedRecords,bindSpring2018PreparedBody,type Spring2018PreparedInput,type Spring2018PreparedSpec} from './import-legacy-2018-spring-pm-preparation';
export const legacy2018SpringPm1Spec:Spring2018PreparedSpec={number:1,area:'technology',originalPageAlt:page=>{const text=pageAlts[String(page) as keyof typeof pageAlts];assert(text);return text;},pages:[6,7,8,9,10],definition,choicePages:[...Array(9).fill(7),...Array(8).fill(9),...Array(4).fill(10)],officialMarks:['エ','イ','イ','エ','エ'],fieldChoiceCounts:[5,4,4,4,4],topics:['情報セキュリティ','パスワード保存'],keywords:['SHA-256','ソルト','ストレッチング'],diagramPages:b=>{if(b.scene.kind!=='source_figure')throw Error('SPRING2018_SCENE');return b.scene.profile.endsWith('bank')?[b.scene.values.at(-1)!<2?7:b.scene.values.at(-1)!<4?9:10]:[b.scene.profile.endsWith('0')?7:9];}};
export async function legacy2018SpringPm1Records(input:Spring2018PreparedInput){assert.deepEqual(input,pins);return spring2018PreparedRecords(legacy2018SpringPm1Spec,input);}
export const bindLegacy2018SpringPm1Body=(base:Parameters<typeof bindSpring2018PreparedBody>[0],body:Parameters<typeof bindSpring2018PreparedBody>[1])=>bindSpring2018PreparedBody(base,body,legacy2018SpringPm1Spec);
