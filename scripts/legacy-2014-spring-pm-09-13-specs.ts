import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import {
  legacy2014SpringPm9Definition,legacy2014SpringPm10Definition,legacy2014SpringPm11Definition,
  legacy2014SpringPm12Definition,legacy2014SpringPm13Definition,spring2014Pm0913OriginalPageAlt,
} from '../src/core/generators/legacy-2014-spring-pm-09-13';
import { spring2014PmJavaReferenceTitle,spring2014PmCaslCodesTitle } from '../src/core/generators/legacy-2014-spring-pm-09-13-reference';

function spec(number:number,definition:Stage3AfternoonQuestionSpec['definition'],topics:string[],keywords:string[]):Stage3AfternoonQuestionSpec {
  const originalPageAlt=spring2014Pm0913OriginalPageAlt(number);
  return {number,definition,title:definition.title,pages:Object.keys(originalPageAlt).map(Number),
    topics,keywords,original:definition.build([...definition.reference]),originalPageAlt};
}
export const spring2014Pm09To13Specs=[
  spec(9,legacy2014SpringPm9Definition,['プログラミング','C','テキスト処理'],['単語の分割','行幅','改行','空白','字下げ']),
  spec(10,legacy2014SpringPm10Definition,['プログラミング','COBOL','結果管理'],['順ファイル','得点履歴','平均点','同順位']),
  {...spec(11,legacy2014SpringPm11Definition,['プログラミング','Java','継承'],['記事購読','TreeMap','TimeZone','アクセス制御']),
    editorialContextTitles:[spring2014PmJavaReferenceTitle]},
  {...spec(12,legacy2014SpringPm12Definition,['プログラミング','CASL II','文字列処理'],['単語管理テーブル','GETTKN','分岐表','論理シフト']),
    editorialContextTitles:[spring2014PmCaslCodesTitle]},
  spec(13,legacy2014SpringPm13Definition,['プログラミング','表計算','マクロ'],['匿名化','照合一致','最小値','多重度','職業分類']),
];
