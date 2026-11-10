import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2013AutumnPm01To04Definitions as definitions } from '../src/core/generators/legacy-2013-autumn-pm-01-04';
import { autumn2013Pm1Pages } from '../src/core/generators/legacy-2013-autumn-pm-1';
import { autumn2013Pm2Pages } from '../src/core/generators/legacy-2013-autumn-pm-2';
import { autumn2013Pm3Pages } from '../src/core/generators/legacy-2013-autumn-pm-3';
import { autumn2013Pm4Pages } from '../src/core/generators/legacy-2013-autumn-pm-4';
import { pageAlt } from '../src/core/generators/legacy-2013-autumn-pm-01-04-shared';

const firstPages = [5, 10, 15, 19];
const pagesFor = [autumn2013Pm1Pages, autumn2013Pm2Pages, autumn2013Pm3Pages, autumn2013Pm4Pages];
const topics = [['論理演算', '加算器'], ['データベース', '正規化', 'SQL'], ['ネットワーク', 'IPv6', '6to4'], ['情報セキュリティ', 'VPN', 'IPsec']];
const keywords = [
  ['真理値表', '半加算器', '全加算器', '2の補数', '桁あふれ', 'ゼロ検出'],
  ['主キー', '総当たり', '第1正規化', '集約', '所属履歴'],
  ['アドレス空間', 'プレフィックス', '圧縮形', 'カプセル化'],
  ['Diffie-Hellman', '鍵交換', '共通鍵', 'RSA', 'ディジタル署名'],
];

export const autumn2013Pm01To04Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition, index) => {
  const first = firstPages[index], blocks = pagesFor[index](0);
  return {
    number: index + 1, title: definition.title, definition,
    pages: blocks.map((_, offset) => first + offset),
    original: definition.build([...definition.reference]), originalPageAlt: pageAlt(blocks, first),
    topics: topics[index], keywords: keywords[index],
  };
});
