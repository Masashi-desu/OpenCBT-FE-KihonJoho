import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2012SpringPm05To08Definitions, spring2012Pm0508OriginalPageAlt } from '../src/core/generators/legacy-2012-spring-pm-05-08';

const topics = [
  ['ファイル処理','レコードの突合せ','整列と集計'],
  ['プロジェクト管理','工数管理','進捗判定'],
  ['投資採算性','現在価値','減価償却'],
  ['アルゴリズム','ビット演算','疑似言語'],
];
const keywords = [
  ['学校コード','順ファイル','前年度順位','同順位','その他計'],
  ['計画進捗率','実績進捗率','計画実績工数比','残工数','UI設計'],
  ['NPV','割引率','定額償却','法人税','キャッシュフロー'],
  ['BitTest','BitCount','論理積','マスク','論理シフト','処理量'],
];

export const spring2012Pm05To08Specs: Stage3AfternoonQuestionSpec[] = legacy2012SpringPm05To08Definitions.map((definition, i) => {
  const number = ([5,6,7,8] as const)[i], originalPageAlt = spring2012Pm0508OriginalPageAlt(number);
  return {number,title:definition.title,definition,original:definition.build([...definition.reference]),
    pages:Object.keys(originalPageAlt).map(Number),originalPageAlt,topics:topics[i],keywords:keywords[i]};
});
