/** Formal source-local adapter draft; excluded until whole-booklet admission. */
import type {GenerationDefinition} from './definition';
import {spring2018LegacyDefinitions,spring2018Prepare,spring2018ValidTuples,spring2018NativeFragment} from './legacy-2018-spring-pm5-8-native';
const prior=spring2018LegacyDefinitions[8];
export const legacy2018SpringPm8Definition:GenerationDefinition={...prior,version:'3.6.0',notes:"原6頁と共通記法2頁、5欄24択。7値/7節の集合を固定し内部2子の左右×4葉24配置を同位置へ束縛する48入力。maxheap/昇順、0始まり、hnum>0、整数商、同値時右子、全4手続/コメント/制御/行番号/α/引数4表/親子矢印/領域と全群を保持する。48本文と8正答位置署名は区別し、固定共通資料だけを生成contextへ提供する。",build:values=>spring2018Prepare(8,values).body};
export const legacy2018SpringPm8ValidTuples=spring2018ValidTuples[8];
export const legacy2018SpringPm8NativeText=(text:string)=>spring2018NativeFragment(8,text).known;
export const legacy2018SpringPm8BankData=(values:number[])=>spring2018Prepare(8,values).banks;
