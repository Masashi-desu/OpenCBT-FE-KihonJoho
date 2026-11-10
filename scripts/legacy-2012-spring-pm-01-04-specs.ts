import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2012SpringPm01To04Definitions as definitions } from '../src/core/generators/legacy-2012-spring-pm-01-04';
import { spring2012Pm1Pages } from '../src/core/generators/legacy-2012-spring-pm-1';
import { spring2012Pm2Pages } from '../src/core/generators/legacy-2012-spring-pm-2';
import { spring2012Pm3Pages } from '../src/core/generators/legacy-2012-spring-pm-3';
import { spring2012Pm4Pages } from '../src/core/generators/legacy-2012-spring-pm-4';
import { pageAlt } from '../src/core/generators/legacy-2012-spring-pm-01-04-shared';

const firstPages = [5, 8, 12, 16];
const pagesFor = [spring2012Pm1Pages, spring2012Pm2Pages, spring2012Pm3Pages, spring2012Pm4Pages];
const topics = [['ハードウェア', '浮動小数点数'], ['ソフトウェア', 'コンパイラ最適化'],
  ['データベース', '社員食堂', 'SQL'], ['ネットワーク', 'フロー制御']];
const keywords = [
  ['32ビット', '単精度', '正規化', '仮数部', '指数部', '減算', '乗算'],
  ['インライン展開', 'ループのアンローリング', '共通部分式', '定数の畳込み', '情報落ち'],
  ['社員食堂', '精算表', '明細表', '料理表', 'カロリー', 'GROUP BY', 'SUM'],
  ['受信バッファ', 'パケット', 'ACK', '転送時間', 'フロー制御'],
];

export const spring2012Pm01To04Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition, index) => {
  const first = firstPages[index], blocks = pagesFor[index](0);
  const originalPageAlt = pageAlt(blocks, first);
  if (first === 5) originalPageAlt[first] =
    '次の問1から問7までの7問については，この中から5問を選択し，選択した問題については，答案用紙の選択欄の（選）をマークして解答してください。なお，6問以上マークした場合には，はじめの5問について採点します。\n' +
    originalPageAlt[first];
  return {
    number: index + 1, title: definition.title, definition,
    pages: blocks.map((_, offset) => first + offset), original: definition.build([...definition.reference]),
    originalPageAlt, topics: topics[index], keywords: keywords[index],
  };
});
