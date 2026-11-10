import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import {
  autumn2013Pm0508OriginalPageAlt, legacy2013AutumnPm05To08Definitions,
} from '../src/core/generators/legacy-2013-autumn-pm-05-08';

const topics = [
  ['テスト設計', 'ホワイトボックステスト', '分岐網羅'],
  ['プロジェクトマネジメント', '進捗率', '作業工数'],
  ['業務改善', '販売管理', '在庫集約'],
  ['アルゴリズム', '文字列圧縮', '疑似言語'],
];
const keywords = [
  ['短絡評価', '制御フローグラフ', 'カバレッジ', 'サイクロマティック複雑度'],
  ['生産性', '実績工数', '人時', '共通プログラム', '前倒し'],
  ['定量発注方式', '回転在庫', '安全在庫', '需要比率'],
  ['Compress', 'Decompress', '比較文字位置', '距離', '最長一致'],
];

export const autumn2013Pm05To08Specs: Stage3AfternoonQuestionSpec[] = legacy2013AutumnPm05To08Definitions.map((definition, index) => {
  const number = ([5, 6, 7, 8] as const)[index];
  const originalPageAlt = autumn2013Pm0508OriginalPageAlt(number);
  return {
    number, title: definition.title, definition, original: definition.build([...definition.reference]),
    pages: Object.keys(originalPageAlt).map(Number), originalPageAlt,
    topics: topics[index], keywords: keywords[index],
  };
});
