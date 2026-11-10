import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import {
  legacy2013SpringPm05To08Definitions, spring2013Pm0508OriginalPageAlt,
} from '../src/core/generators/legacy-2013-spring-pm-05-08';

const topics = [
  ['ファイル処理', '突合せ', '歩合給'],
  ['ソフトウェア開発', '品質管理', 'レビュー'],
  ['市場分析', '需要予測', '重回帰分析'],
  ['アルゴリズム', '連結リスト', '疑似言語'],
];
const keywords = [
  ['契約マスタ', '異動ファイル', 'マージ', '証券番号', '月払保険料'],
  ['設計レビュー', 'セルフレビュー', 'ペアレビュー', '摘出欠陥数', '許容範囲'],
  ['折れ線グラフ', '売上金額', '為替レート', 'GDP', '人口'],
  ['選択型特売', 'ポインタ', '購入情報', '値引き', '配列'],
];

export const spring2013Pm05To08Specs: Stage3AfternoonQuestionSpec[] = legacy2013SpringPm05To08Definitions.map((definition, index) => {
  const number = ([5, 6, 7, 8] as const)[index];
  const originalPageAlt = spring2013Pm0508OriginalPageAlt(number);
  return {
    number, title: definition.title, definition, original: definition.build([...definition.reference]),
    pages: Object.keys(originalPageAlt).map(Number), originalPageAlt,
    topics: topics[index], keywords: keywords[index],
  };
});
