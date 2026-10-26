/** Formal source-local adapter draft; excluded until whole-booklet admission. */
import type {GenerationDefinition} from './definition';
import {spring2018LegacyDefinitions,spring2018Prepare,spring2018ValidTuples,spring2018NativeFragment} from './legacy-2018-spring-pm5-8-native';
const prior=spring2018LegacyDefinitions[6];
export const legacy2018SpringPm6Definition:GenerationDefinition={...prior,version:'3.6.0',notes:"原6頁、6欄28固有択34参照。倍率2×予測8×図傾向4の64入力。c/d共用6ID、e1/e2/e3は原の6行組合せを選ぶ1欄。表5は倍率後の正確な7/8を小数2桁へ一度丸める。SPI/CPI一定の予測と残作業を計画どおりとする予測を分離する。原の未記名実績点を精密転記とは称さず管理SVGで改変・再作図する。軸/全3線種/marker/αβ/工程/非表示セル/全定義を保持する。",build:values=>spring2018Prepare(6,values).body};
export const legacy2018SpringPm6ValidTuples=spring2018ValidTuples[6];
export const legacy2018SpringPm6NativeText=(text:string)=>spring2018NativeFragment(6,text).known;
export const legacy2018SpringPm6BankData=(values:number[])=>spring2018Prepare(6,values).banks;
