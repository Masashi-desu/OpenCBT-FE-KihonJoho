import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2010SpringPm05To08Definitions,spring2010Pm0508OriginalPageAlt } from '../src/core/generators/legacy-2010-spring-pm-05-08';
const learning=[
  {topics:['ソフトウェア設計','ファイル処理','配送管理'],keywords:['配達サービス','受付ファイル','予約ファイル','突合せ','集計']},
  {topics:['プロジェクトマネジメント','品質管理','バグ管理'],keywords:['バグ摘出率','バグ成長曲線','予測値','実績値','順不同']},
  {topics:['経営戦略','SWOT分析','ファイブフォース分析'],keywords:['健康飲料','資産','業務プロセス','売上総利益率','営業利益率','経常利益率']},
  {topics:['データ構造とアルゴリズム','マージソート','疑似言語'],keywords:['Sort','Merge','整列','再帰','分割','併合']},
];
export const spring2010Pm05To08Specs:Stage3AfternoonQuestionSpec[]=legacy2010SpringPm05To08Definitions.map((definition,i)=>{
  const number=([5,6,7,8] as const)[i], originalPageAlt=spring2010Pm0508OriginalPageAlt(number);
  return {number,title:definition.title,definition,original:definition.build([...definition.reference]),
    pages:Object.keys(originalPageAlt).map(Number),originalPageAlt,...learning[i]};
});
