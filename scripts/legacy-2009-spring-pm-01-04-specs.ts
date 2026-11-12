import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2009SpringPm1Definition, spring2009Pm1Pages } from '../src/core/generators/legacy-2009-spring-pm-1';
import { legacy2009SpringPm3Definition, spring2009Pm3Pages } from '../src/core/generators/legacy-2009-spring-pm-3';
import { legacy2009SpringPm4Definition, spring2009Pm4Pages } from '../src/core/generators/legacy-2009-spring-pm-4';
import { pageAlt } from '../src/core/generators/legacy-2009-spring-pm-01-04-shared';

const source = [
  { number: 1, first: 6, definition: legacy2009SpringPm1Definition, pages: spring2009Pm1Pages(0),
    topics: ['データ表現', '情報圧縮'], keywords: ['2値画像', 'ランレングス', '符号長', '復号'] },
  { number: 3, first: 12, definition: legacy2009SpringPm3Definition, pages: spring2009Pm3Pages(0),
    topics: ['データベース', 'SQL'], keywords: ['E-R図', '第1正規化', '主キー', '結合', '副問合せ', '在庫'] },
  { number: 4, first: 15, definition: legacy2009SpringPm4Definition, pages: spring2009Pm4Pages(0, true),
    topics: ['ネットワーク', '情報セキュリティ'], keywords: ['ファイアウォール', 'DMZ', 'SMTP', 'POP3', 'パケットフィルタリング'] },
];

export const spring2009Pm01To04Specs: Stage3AfternoonQuestionSpec[] = source.map(({ number, first, definition, pages, topics, keywords }) => {
  const originalPageAlt = pageAlt(pages, first);
  if (number === 1) originalPageAlt[first] =
    '次の問1から問7までの7問については，この中から5問を選択し，答案用紙の選択欄の（選）をマークして解答してください。なお，6問以上選択した場合には，はじめの5問について採点します。\n' +
    originalPageAlt[first];
  if (number === 3) originalPageAlt[first] = originalPageAlt[first]
    .replace('原資料で網掛けされた主キーの項目を，次の表では見出しに示す。', '網掛けした項目は主キーを表す。');
  return { number, title: definition.title, definition, pages: pages.map((_, offset) => first + offset),
    original: definition.build([...definition.reference]), originalPageAlt, topics, keywords };
});
