import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2010AutumnPm01To04Definitions as definitions } from '../src/core/generators/legacy-2010-autumn-pm-01-04';
import { autumn2010Pm1Pages } from '../src/core/generators/legacy-2010-autumn-pm-1';
import { autumn2010Pm2Pages } from '../src/core/generators/legacy-2010-autumn-pm-2';
import { autumn2010Pm3Pages } from '../src/core/generators/legacy-2010-autumn-pm-3';
import { autumn2010Pm4Pages } from '../src/core/generators/legacy-2010-autumn-pm-4';
import { pageAlt } from '../src/core/generators/legacy-2010-autumn-pm-01-04-shared';

const firstPages = [5, 9, 13, 16];
const pagesFor = [autumn2010Pm1Pages, autumn2010Pm2Pages, autumn2010Pm3Pages, autumn2010Pm4Pages];
const topics = [['ハードウェア', '入出力'], ['データベース', '正規化'], ['ネットワーク', '誤り検出'], ['セキュリティ', '認証']];
const keywords = [
  ['7セグメントLED', 'I/Oポート', 'A/D変換器', 'BCD', '割込み'],
  ['第1正規形', '第2正規形', '第3正規形', 'SQL', 'LIKE', 'GROUP BY', 'ALTER TABLE'],
  ['CRC', '再送', '排他的論理和', 'マスク', '誤り検出符号'],
  ['共通鍵暗号', 'チケット', '認証子', 'セッション鍵', 'シングルサインオン'],
];
export const autumn2010Pm01To04Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition, index) => {
  const first = firstPages[index], blocks = pagesFor[index](0), originalPageAlt = pageAlt(blocks, first);
  if (first === 5) originalPageAlt[first] =
    '次の問1から問7までの7問については，この中から5問を選択し，選択した問題については，答案用紙の選択欄の（選）をマークして解答してください。なお，6問以上選択した場合には，はじめの5問について採点します。\n' + originalPageAlt[first];
  return { number: index + 1, title: definition.title, definition,
    pages: blocks.map((_, offset) => first + offset), original: definition.build([...definition.reference]),
    originalPageAlt, topics: topics[index], keywords: keywords[index] };
});
