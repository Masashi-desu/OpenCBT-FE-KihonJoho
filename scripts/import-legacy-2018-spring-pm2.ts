import pageAlts from '../tests/fixtures/legacy-2018-spring-pm2-source-alts.json';
import assert from 'node:assert/strict';
import pins from '../tests/fixtures/legacy-2018-spring-pm2-original-metadata.json';
import {legacy2018SpringPm2Definition as definition} from '../src/core/generators/legacy-2018-spring-pm2';
import {spring2018PreparedRecords,bindSpring2018PreparedBody,type Spring2018PreparedInput,type Spring2018PreparedSpec} from './import-legacy-2018-spring-pm-preparation';
export const legacy2018SpringPm2Spec:Spring2018PreparedSpec={number:2,area:'technology',originalPageAlt:page=>{const text=pageAlts[String(page) as keyof typeof pageAlts];assert(text);return text;},pages:[11,12,13],definition,choicePages:[...Array(9).fill(12),...Array(6).fill(13)],officialMarks:['エ','オ','ア','オ','ア'],fieldChoiceCounts:[4,5,5,6,6],sharedBanks:[[1,2],[3,4]],topics:['論理演算','論理回路'],keywords:['半加算器','XOR','NAND','しきい値'],diagramPages:b=>{if(b.scene.kind!=='source_figure')throw Error('SPRING2018_SCENE');return b.scene.profile.endsWith('bank')?[b.scene.values.at(-1)===2?13:12]:b.scene.profile.includes('table')?[b.scene.profile.endsWith('2')?13:11]:[12];}};
export async function legacy2018SpringPm2Records(input:Spring2018PreparedInput){assert.deepEqual(input,pins);return spring2018PreparedRecords(legacy2018SpringPm2Spec,input);}
export const bindLegacy2018SpringPm2Body=(base:Parameters<typeof bindSpring2018PreparedBody>[0],body:Parameters<typeof bindSpring2018PreparedBody>[1])=>bindSpring2018PreparedBody(base,body,legacy2018SpringPm2Spec);
