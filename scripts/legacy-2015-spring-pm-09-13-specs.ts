import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import {
  legacy2015SpringPm9Definition, legacy2015SpringPm10Definition, legacy2015SpringPm11Definition,
  legacy2015SpringPm12Definition, legacy2015SpringPm13Definition, spring2015Pm0913OriginalPageAlt,
} from '../src/core/generators/legacy-2015-spring-pm-09-13';
import { spring2015PmJavaTitle } from '../src/core/generators/legacy-2015-spring-pm-09-13-java-reference';

function spec(number:number,definition:Stage3AfternoonQuestionSpec['definition'],topics:string[],keywords:string[]):Stage3AfternoonQuestionSpec {
  const originalPageAlt = spring2015Pm0913OriginalPageAlt(number);
  return {number,definition,title:definition.title,pages:Object.keys(originalPageAlt).map(Number),topics,keywords,
    original:definition.build([...definition.reference]),originalPageAlt};
}
export const spring2015Pm09To13Specs = [
  spec(9,legacy2015SpringPm9Definition,['プログラミング','C','文字列処理'],['換字式暗号','文字列','二次元配列','添字']),
  spec(10,legacy2015SpringPm10Definition,['プログラミング','COBOL','ファイル処理'],['勤務管理','集団項目','索引ファイル','順ファイル','分換算']),
  {...spec(11,legacy2015SpringPm11Definition,['プログラミング','Java','情報セキュリティ'],['サニタイズ','文字列','Map','実体参照','オーバーロード']),
    editorialContextTitles:[spring2015PmJavaTitle]},
  spec(12,legacy2015SpringPm12Definition,['プログラミング','CASL II','再帰'],['階乗','スタック','シフト乗算','フラグ','レジスタ']),
  spec(13,legacy2015SpringPm13Definition,['プログラミング','表計算','マクロ'],['学習進捗管理','照合一致','表引き','相対参照','空値']),
];
