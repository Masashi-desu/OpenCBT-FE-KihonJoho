/** Formal source-local adapter draft; excluded until whole-booklet admission. */
import type {GenerationDefinition} from './definition';
import {spring2018LegacyDefinitions,spring2018Prepare,spring2018ValidTuples,spring2018NativeFragment} from './legacy-2018-spring-pm5-8-native';
const prior=spring2018LegacyDefinitions[7];
export const legacy2018SpringPm7Definition:GenerationDefinition={...prior,version:'3.6.0',notes:"原3頁、8欄34択。率2×利益率3×数量金額倍率3×傾き4の72宣言中60有効。75%かつ利益率12%の12入力は原比で誤答間隔が半分未満になるため拒否する。正答は整数で追加丸めなし。c誤答2本だけ千円整数へ四捨五入する生成表示を原の明示条件とは称さない。非表示4セル、同額固定費、同一変動費率、値下げ時の数量/変動費総額一定、固定費一定の施策、原4線種/軸/原点/全群を維持する。",build:values=>spring2018Prepare(7,values).body};
export const legacy2018SpringPm7ValidTuples=spring2018ValidTuples[7];
export const legacy2018SpringPm7NativeText=(text:string)=>spring2018NativeFragment(7,text).known;
export const legacy2018SpringPm7BankData=(values:number[])=>spring2018Prepare(7,values).banks;
