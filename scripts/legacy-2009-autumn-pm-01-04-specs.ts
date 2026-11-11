import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2009AutumnPm01To04Definitions as definitions } from '../src/core/generators/legacy-2009-autumn-pm-01-04';
import { autumn2009Pm1Pages } from '../src/core/generators/legacy-2009-autumn-pm-1';
import { autumn2009Pm2Pages } from '../src/core/generators/legacy-2009-autumn-pm-2';
import { autumn2009Pm3Pages } from '../src/core/generators/legacy-2009-autumn-pm-3';
import { autumn2009Pm4Pages } from '../src/core/generators/legacy-2009-autumn-pm-4';
import { pageAlt } from '../src/core/generators/legacy-2009-autumn-pm-01-04-shared';

const firstPages = [6, 10, 14, 17];
const pagesFor = [autumn2009Pm1Pages, autumn2009Pm2Pages, autumn2009Pm3Pages, autumn2009Pm4Pages];
const topics = [['ハードウェア', '論理回路'], ['データベース', '関係データベース'], ['ネットワーク', '符号化'], ['情報セキュリティ', '利用者認証']];
const keywords = [
  ['半加算器', '全加算器', '真理値表', '論理ゲート', '2の補数'],
  ['倉庫', '複合キー', 'E-R図', 'SQL', '副問合せ', 'GROUP BY', '等価結合', 'NULL'],
  ['パケット', 'ヘッダ', '帯域', '差分符号化', '期待値'],
  ['総当たり', 'パスワード', 'チャレンジレスポンス', 'トークン', '盗聴'],
];

export const autumn2009Pm01To04Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition, index) => {
  const first = firstPages[index];
  const blocks = pagesFor[index](0, true);
  const originalPageAlt = pageAlt(blocks, first);
  if (index === 0) originalPageAlt[first] =
    '次の問1から問7までの7問については，この中から5問を選択し，答案用紙の選択欄の（選）をマークして解答してください。なお，6問以上選択した場合には，はじめの5問について採点します。\n' +
    originalPageAlt[first];
  return {
    number: index + 1, title: definition.title, definition, pages: blocks.map((_, offset) => first + offset),
    original: definition.build([...definition.reference]), originalPageAlt, topics: topics[index], keywords: keywords[index],
  };
});
