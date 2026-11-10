import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2011AutumnPm01To04Definitions as definitions } from '../src/core/generators/legacy-2011-autumn-pm-01-04';
import { autumn2011Pm1Pages } from '../src/core/generators/legacy-2011-autumn-pm-1';
import { autumn2011Pm2Pages } from '../src/core/generators/legacy-2011-autumn-pm-2';
import { autumn2011Pm3Pages } from '../src/core/generators/legacy-2011-autumn-pm-3';
import { autumn2011Pm4Pages } from '../src/core/generators/legacy-2011-autumn-pm-4';
import { pageAlt } from '../src/core/generators/legacy-2011-autumn-pm-01-04-shared';

const firstPages = [5, 9, 13, 16];
const pagesFor = [autumn2011Pm1Pages, autumn2011Pm2Pages, autumn2011Pm3Pages, autumn2011Pm4Pages];
const topics = [['ハードウェア', 'A/D変換'], ['データベース', '正規化', 'SQL'],
  ['ネットワーク', 'サブネット', 'キャッシュ'], ['情報セキュリティ', 'リスク評価']];
const keywords = [
  ['標本化', '量子化', '符号化', 'FSR', '刻み幅'],
  ['部と課', '重複更新', 'CREATE VIEW', 'GROUP BY', '受注'],
  ['サブネットマスク', 'DHCP', 'DMZ', 'プロキシ', 'ヒット率'],
  ['機密性', '完全性', '可用性', '脅威', '脆弱性', '受容可能なリスク水準'],
];

export const autumn2011Pm01To04Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition, index) => {
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
