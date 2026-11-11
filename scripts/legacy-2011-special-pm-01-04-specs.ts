import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2011SpecialPm01To04Definitions as definitions } from '../src/core/generators/legacy-2011-special-pm-01-04';
import { special2011Pm1Pages } from '../src/core/generators/legacy-2011-special-pm-1';
import { special2011Pm2Pages } from '../src/core/generators/legacy-2011-special-pm-2';
import { special2011Pm3Pages } from '../src/core/generators/legacy-2011-special-pm-3';
import { special2011Pm4Pages } from '../src/core/generators/legacy-2011-special-pm-4';
import { pageAlt } from '../src/core/generators/legacy-2011-special-pm-01-04-shared';

const firstPages = [5, 9, 13, 18];
const pagesFor = [special2011Pm1Pages, special2011Pm2Pages, special2011Pm3Pages, special2011Pm4Pages];
const topics = [['ハードウェア', '機械語'], ['オペレーティングシステム', 'スケジューリング'],
  ['データベース', 'トランザクション'], ['ネットワーク', '経路制御']];
const keywords = [
  ['指標レジスタ修飾', '間接アドレス指定', '実効アドレス', '主記憶'],
  ['到着順', 'ラウンドロビン', 'タイムクウォンタム', 'ターンアラウンドタイム', '優先度'],
  ['ACID', '共有ロック', '占有ロック', '排他制御', 'デッドロック'],
  ['ブロードキャスト', '経路制御テーブル', 'ルータ', 'IPアドレス', '距離'],
];
export const special2011Pm01To04Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition, index) => {
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
