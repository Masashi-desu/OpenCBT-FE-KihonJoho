import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2007SpringPm01To05Definitions as definitions } from '../src/core/generators/legacy-2007-spring-pm-01-05';
import { spring2007Pm1Pages } from '../src/core/generators/legacy-2007-spring-pm-1';
import { spring2007Pm2Pages } from '../src/core/generators/legacy-2007-spring-pm-2';
import { spring2007Pm3Pages } from '../src/core/generators/legacy-2007-spring-pm-3';
import { spring2007Pm4Pages } from '../src/core/generators/legacy-2007-spring-pm-4';
import { spring2007Pm5Pages } from '../src/core/generators/legacy-2007-spring-pm-5';
import { pageAlt } from '../src/core/generators/legacy-2007-spring-pm-01-05-shared';
const first=[5,8,10,13,17];
const pages=[spring2007Pm1Pages,spring2007Pm2Pages,spring2007Pm3Pages,spring2007Pm4Pages,spring2007Pm5Pages];
const topics=[['プロセッサ','ビット演算'],['データベース','正規化'],['プロジェクト管理','日程計画'],['アルゴリズム','整列'],['プログラム設計','ファイル処理']];
const keywords=[
  ['命令語','レジスタ','16進数','論理和','シフト'],
  ['主キー','社員番号','挿入異常','部門コード','関係データベース','兼務'],
  ['アローダイアグラム','クリティカルパス','ダミー','依存関係','最短所要日数'],
  ['挿入ソート','クイックソート','疑似言語','計算量','添字'],
  ['キー突合せ','会員番号','終端','番兵','マスタファイル','更新区分','レコード集約'],
];
export const spring2007Pm01To05Specs:Stage3AfternoonQuestionSpec[]=definitions.map((definition,i)=>{
 const start=first[i], blocks=pages[i](0), originalPageAlt=pageAlt(blocks,start);
 if(!i) originalPageAlt[start]='次の問1から問5までの5問については，全問解答してください。\n'+originalPageAlt[start];
 if (i === 2) originalPageAlt[12] = '問3の設問2の続き。日程を短縮する作業を選ぶ空欄cの4択。\n' + originalPageAlt[12];
 return {number:i+1,title:definition.title,definition,pages:blocks.map((_,offset)=>start+offset),
   original:definition.build([...definition.reference]),originalPageAlt,topics:topics[i],keywords:keywords[i]};
});
