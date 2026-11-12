import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2008AutumnPm01To05Definitions as definitions } from '../src/core/generators/legacy-2008-autumn-pm-01-05';
import { autumn2008Pm1Pages } from '../src/core/generators/legacy-2008-autumn-pm-1';
import { autumn2008Pm2Pages } from '../src/core/generators/legacy-2008-autumn-pm-2';
import { autumn2008Pm3Pages } from '../src/core/generators/legacy-2008-autumn-pm-3';
import { autumn2008Pm4Pages } from '../src/core/generators/legacy-2008-autumn-pm-4';
import { autumn2008Pm5Pages } from '../src/core/generators/legacy-2008-autumn-pm-5';
import { pageAlt } from '../src/core/generators/legacy-2008-autumn-pm-01-05-shared';

const firstPages = [4, 6, 10, 13, 18];
const pagesFor = [autumn2008Pm1Pages, autumn2008Pm2Pages, autumn2008Pm3Pages, autumn2008Pm4Pages, autumn2008Pm5Pages];
const topics = [['ネットワーク', 'IP電話'], ['プログラミング', '文字列処理'], ['データベース', '関係データベース'],
  ['アルゴリズム', '最短経路'], ['プログラム設計', 'ファイル処理']];
const keywords = [
  ['VoIP', 'ルータ', 'アクセス回線', '同時通話', 'トラフィック', '帯域幅'],
  ['疑似言語', '文字列', '配列', '改行', '改ページ', '余白', '制御文字'],
  ['SQL', '複合キー', '結合', 'LIKE', 'NULL', '年度', '研修'],
  ['Dijkstra法', 'ダイクストラ法', '最短経路', '有向グラフ', '緩和', '疑似言語'],
  ['ダウンロード', 'レコード', 'ファイル', '画面遷移', 'モジュール', '集計'],
];
export const autumn2008Pm01To05Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition, index) => {
  const first = firstPages[index], blocks = pagesFor[index](0);
  const originalPageAlt = pageAlt(blocks, first);
  if (index === 0) originalPageAlt[first] = '次の問1から問5までの5問については，全問解答してください。\n' + originalPageAlt[first];
  return {
    number: index + 1, title: definition.title, definition, pages: blocks.map((_, offset) => first + offset),
    original: definition.build([...definition.reference]), originalPageAlt, topics: topics[index], keywords: keywords[index],
  };
});
