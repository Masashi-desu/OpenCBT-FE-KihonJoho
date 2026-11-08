import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import {
  legacy2014AutumnPm9Definition, legacy2014AutumnPm10Definition, legacy2014AutumnPm11Definition,
  legacy2014AutumnPm12Definition, legacy2014AutumnPm13Definition, autumn2014Pm0913OriginalPageAlt,
} from '../src/core/generators/legacy-2014-autumn-pm-09-13';
import { autumn2014PmJavaTitle, autumn2014PmCaslCharacterCodesTitle } from '../src/core/generators/legacy-2014-autumn-pm-09-13-reference';

function spec(number:number,definition:Stage3AfternoonQuestionSpec['definition'],topics:string[],keywords:string[]):Stage3AfternoonQuestionSpec {
  const originalPageAlt = autumn2014Pm0913OriginalPageAlt(number);
  return {number,definition,title:definition.title,pages:Object.keys(originalPageAlt).map(Number),topics,keywords,
    original:definition.build([...definition.reference]),originalPageAlt};
}
export const autumn2014Pm09To13Specs = [
  spec(9,legacy2014AutumnPm9Definition,['プログラミング','C','利用者ID管理'],['ソート済みファイル','EOF','ビットマスク','最終使用日']),
  spec(10,legacy2014AutumnPm10Definition,['プログラミング','COBOL','売上集計'],['順ファイル','月別集計','Zチャート','移動年計']),
  {...spec(11,legacy2014AutumnPm11Definition,['プログラミング','Java','可変オブジェクト'],['Date','期間','半開区間','防御的コピー','例外']),
    editorialContextTitles:[autumn2014PmJavaTitle]},
  {...spec(12,legacy2014AutumnPm12Definition,['プログラミング','CASL II','バブルソート'],['CPL','条件分岐','2進化10進数','文字コード']),
    editorialContextTitles:[autumn2014PmCaslCharacterCodesTitle]},
  spec(13,legacy2014AutumnPm13Definition,['プログラミング','表計算','マクロ'],['鉄道運賃','照合一致','条件付合計','区分距離','相対参照']),
];
