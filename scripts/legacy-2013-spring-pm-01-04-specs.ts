import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2013SpringPm01To04Definitions as definitions } from '../src/core/generators/legacy-2013-spring-pm-01-04';
import { spring2013Pm1Pages } from '../src/core/generators/legacy-2013-spring-pm-1';
import { spring2013Pm2Pages } from '../src/core/generators/legacy-2013-spring-pm-2';
import { spring2013Pm3Pages } from '../src/core/generators/legacy-2013-spring-pm-3';
import { spring2013Pm4Pages } from '../src/core/generators/legacy-2013-spring-pm-4';
import { pageAlt } from '../src/core/generators/legacy-2013-spring-pm-01-04-shared';

const firstPages = [5, 9, 13, 18];
const pagesFor = [spring2013Pm1Pages, spring2013Pm2Pages, spring2013Pm3Pages, spring2013Pm4Pages];
const topics = [['マルチメディア', '色と画像メモリ'], ['オペレーティングシステム', '仮想記憶'], ['データベース', '関係データベース', 'SQL'], ['情報セキュリティ', '入退室管理']];
const keywords = [
  ['RGB', 'CMY', '加法混色', '減法混色', 'ビットプレーン', 'ビデオRAM'],
  ['ページング', 'ページテーブル', 'ページフォールト', 'FIFO', 'LRU'],
  ['関数従属性', '第1正規形', '主キー', '外部キー', 'GROUP BY', '副問合せ'],
  ['ICカード', '耐タンパ性', 'パスワード', 'ログ', '状態遷移'],
];

export const spring2013Pm01To04Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition, index) => {
  const first = firstPages[index];
  const blocks = pagesFor[index](0);
  return {
    number: index + 1, title: definition.title, definition,
    pages: blocks.map((_, offset) => first + offset),
    original: definition.build([...definition.reference]), originalPageAlt: pageAlt(blocks, first),
    topics: topics[index], keywords: keywords[index],
  };
});
