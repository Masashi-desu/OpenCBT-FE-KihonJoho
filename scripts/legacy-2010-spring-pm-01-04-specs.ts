import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2010SpringPm01To04Definitions as definitions } from '../src/core/generators/legacy-2010-spring-pm-01-04';
import { spring2010Pm1Pages } from '../src/core/generators/legacy-2010-spring-pm-1';
import { spring2010Pm2Pages } from '../src/core/generators/legacy-2010-spring-pm-2';
import { spring2010Pm3Pages } from '../src/core/generators/legacy-2010-spring-pm-3';
import { spring2010Pm4Pages } from '../src/core/generators/legacy-2010-spring-pm-4';
import { pageAlt } from '../src/core/generators/legacy-2010-spring-pm-01-04-shared';

const firstPages = [5, 12, 17, 22];
const pagesFor = [spring2010Pm1Pages, spring2010Pm2Pages, spring2010Pm3Pages, spring2010Pm4Pages];
const topics = [['ハードウェア', '記憶階層'], ['ソフトウェア', '構文解析'], ['データベース', 'SQL'], ['システム構成', '容量設計']];
const keywords = [
  ['データキャッシュ', 'ディレクトリ', '置換', '書戻し', 'FIFO', 'LRU'],
  ['構文木', '深さ優先探索', '構文規則', '後置表記法', 'スタック'],
  ['主キー', '等価結合', '副問合せ', 'GROUP BY', '同姓同名'],
  ['ストリーミング', 'トラフィック', '待ち行列', '回線容量', '同時送信'],
];

export const spring2010Pm01To04Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition, index) => {
  const first = firstPages[index], blocks = pagesFor[index](0), originalPageAlt = pageAlt(blocks, first);
  if (first === 5) {
    originalPageAlt[first] =
      '次の問1から問7までの7問については，この中から5問を選択し，選択した問題については，答案用紙の選択欄の（選）をマークして解答してください。なお，6問以上選択した場合には，はじめの5問について採点します。\n' +
      originalPageAlt[first];
    const answerGroup = blocks[11 - first].find(block => block.type === 'table' && block.caption === '解答群');
    if (answerGroup?.type !== 'table') throw new Error('問1のp.11に設問2の解答群がありません。');
    originalPageAlt[11] = '設問2の解答群。表の列は，選択肢，ブロック番号，フラグの順。\n' +
      answerGroup.rows.map(([choice, block, flag]) => '選択肢' + choice + 'はブロック番号' + block + '，フラグ' + flag + '。').join('\n');
  }
  return { number: index + 1, title: definition.title, definition, pages: blocks.map((_, offset) => first + offset),
    original: definition.build([...definition.reference]), originalPageAlt, topics: topics[index], keywords: keywords[index] };
});
