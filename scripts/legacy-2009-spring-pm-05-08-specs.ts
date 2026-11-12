import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2009SpringPm05To08Definitions,spring2009Pm0508OriginalPageAlt } from '../src/core/generators/legacy-2009-spring-pm-05-08';

const learning=[
  {topics:['ソフトウェア設計','データベース','トランザクション'],keywords:['銀行','ATM','手数料','残高','月末処理']},
  {topics:['プロジェクトマネジメント','見積り','リスク管理'],keywords:['開発','3点見積法','悲観値','最頻値','楽観値','正規分布']},
  {topics:['経営戦略','需要予測','時系列分析'],keywords:['傾向変動','季節変動','不規則変動','移動平均','指数平滑化']},
  {topics:['データ構造とアルゴリズム','スタック','疑似言語'],keywords:['画像','塗替え','番兵','連結領域','CheckAndStack','無限ループ']},
];
export const spring2009Pm05To08Specs:Stage3AfternoonQuestionSpec[]=legacy2009SpringPm05To08Definitions.map((definition,i)=>{
  const number=([5,6,7,8] as const)[i],originalPageAlt=spring2009Pm0508OriginalPageAlt(number);
  if (number === 7) originalPageAlt[28] = '冊子28ページ。問7 設問3の続き。設問本文と表は前のページに掲載。dとeには共通の解答群を使う。解答群は二行三列で、上の行はア（98）、イ（101）、ウ（104）。下の行はエ（106）、オ（109）、カ（110）。';
  return {number,title:definition.title,definition,original:definition.build([...definition.reference]),
    pages:Object.keys(originalPageAlt).map(Number),originalPageAlt,...learning[i]};
});
