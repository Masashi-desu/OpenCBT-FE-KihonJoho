import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2006AutumnPm01To05Definitions as definitions } from '../src/core/generators/legacy-2006-autumn-pm-01-05';
import { autumn2006Pm1Pages } from '../src/core/generators/legacy-2006-autumn-pm-1';
import { autumn2006Pm2Pages } from '../src/core/generators/legacy-2006-autumn-pm-2';
import { autumn2006Pm3Pages } from '../src/core/generators/legacy-2006-autumn-pm-3';
import { autumn2006Pm4Pages } from '../src/core/generators/legacy-2006-autumn-pm-4';
import { autumn2006Pm5Pages } from '../src/core/generators/legacy-2006-autumn-pm-5';
import { pageAlt } from '../src/core/generators/legacy-2006-autumn-pm-01-05-shared';

const first=[4,6,9,12,16];
const pages=[autumn2006Pm1Pages,autumn2006Pm2Pages,autumn2006Pm3Pages,autumn2006Pm4Pages,autumn2006Pm5Pages];
const topics=[['システム構成','信頼性'],['データベース','正規化'],['アルゴリズム','数値計算'],['アルゴリズム','文字列処理'],['プログラム設計','ファイル処理']];
const keywords=[
 ['ハードディスク','MTTF','故障','計画入替え','維持費'],
 ['第1正規形','繰返し項目','主キー','SELECT DISTINCT','結合','GROUP BY'],
 ['前進消去','連立一次方程式','ピボット','後退代入','疑似言語'],
 ['タブ','終端','境界値','文字型配列','疑似言語'],
 ['流れ図','日付別集計','索引ファイル','誤差補正','論理式'],
];
export const autumn2006Pm01To05Specs:Stage3AfternoonQuestionSpec[]=definitions.map((definition,i)=>{
 const start=first[i], blocks=pages[i](0), originalPageAlt=pageAlt(blocks,start);
 if(!i)originalPageAlt[start]='次の問1から問5までの5問については，全問解答してください。\n'+originalPageAlt[start];
 return {number:i+1,title:definition.title,definition,pages:blocks.map((_,offset)=>start+offset),
  original:definition.build([...definition.reference]),originalPageAlt,topics:topics[i],keywords:keywords[i]};
});
