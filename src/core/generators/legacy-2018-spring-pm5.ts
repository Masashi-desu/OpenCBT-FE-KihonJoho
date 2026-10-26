/** Formal source-local adapter draft; excluded until whole-booklet admission. */
import type {GenerationDefinition} from './definition';
import {spring2018LegacyDefinitions,spring2018Prepare,spring2018ValidTuples,spring2018NativeFragment} from './legacy-2018-spring-pm5-8-native';
const prior=spring2018LegacyDefinitions[5];
export const legacy2018SpringPm5Definition:GenerationDefinition={...prior,version:'3.6.0',notes:"原6頁、5欄25固有択35参照、共有a/bは同順の独立解答。管理職の使用有無を表1の同じコース決定セルへ束縛する2入力。現在在勤地、対象年/実施年月、初期空白、再検査後否、原の全4図/主キー/抽出条件を維持する。全解答群を原位置に保持し順固定。入力容量2と履歴除外後の残0を区別する。",build:values=>spring2018Prepare(5,values).body};
export const legacy2018SpringPm5ValidTuples=spring2018ValidTuples[5];
export const legacy2018SpringPm5NativeText=(text:string)=>spring2018NativeFragment(5,text).known;
export const legacy2018SpringPm5BankData=(values:number[])=>spring2018Prepare(5,values).banks;
