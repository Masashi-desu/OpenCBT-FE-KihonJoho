import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2008SpringPm01To05Definitions as definitions } from '../src/core/generators/legacy-2008-spring-pm-01-05';
import { spring2008Pm1Pages } from '../src/core/generators/legacy-2008-spring-pm-1';
import { spring2008Pm2Pages } from '../src/core/generators/legacy-2008-spring-pm-2';
import { spring2008Pm3Pages } from '../src/core/generators/legacy-2008-spring-pm-3';
import { spring2008Pm4Pages } from '../src/core/generators/legacy-2008-spring-pm-4';
import { spring2008Pm5Pages } from '../src/core/generators/legacy-2008-spring-pm-5';
import { pageAlt } from '../src/core/generators/legacy-2008-spring-pm-01-05-shared';

const firstPages = [4, 6, 9, 12, 16];
const pagesFor = [spring2008Pm1Pages, spring2008Pm2Pages, spring2008Pm3Pages, spring2008Pm4Pages, spring2008Pm5Pages];
const topics = [['補助記憶装置', 'ディスクキャッシュ'], ['プログラミング', '文字列検索'], ['運用', 'バックアップ'],
  ['アルゴリズム', 'リスト'], ['プログラム設計', 'ファイル処理']];
const keywords = [
  ['ハードディスク', '平均回転待ち時間', '平均位置決め時間', 'データ転送速度', 'ヒット率'],
  ['擬似言語', '部分文字列', 'MatchCounter', '出現回数', '非重複'],
  ['差分バックアップ', '増分バックアップ', 'フルバックアップ', 'リストア', '磁気テープ'],
  ['単方向リスト', '構造体', 'MakeList', 'OrganizingSearch', '先頭移動', 'ポインタ'],
  ['販売構成一覧', '流れ図', '整列', '集計項目', '順位の付与', '構成比率'],
];
export const spring2008Pm01To05Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition, index) => {
  const first = firstPages[index], blocks = pagesFor[index](0), originalPageAlt = pageAlt(blocks, first);
  if (index === 0) originalPageAlt[first] = '次の問1から問5までの5問については，全問解答してください。\n' + originalPageAlt[first];
  return {
    number: index + 1, title: definition.title, definition, pages: blocks.map((_, offset) => first + offset),
    original: definition.build([...definition.reference]), originalPageAlt, topics: topics[index], keywords: keywords[index],
  };
});
