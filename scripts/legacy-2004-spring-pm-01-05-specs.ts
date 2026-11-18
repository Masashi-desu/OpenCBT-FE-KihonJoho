import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { originalAlt } from '../src/core/generators/legacy-2004-spring-pm-01-05-shared';
import { spring2004Pm1, spring2004Pm1Pages } from '../src/core/generators/legacy-2004-spring-pm-1';
import { spring2004Pm5, spring2004Pm5Pages } from '../src/core/generators/legacy-2004-spring-pm-5';

const records = [
  { number: 1, first: 3, definition: spring2004Pm1, pages: spring2004Pm1Pages,
    topics: ['基礎理論', '論理演算'], keywords: ['二進数', '全加算', '繰り上がり', '状態遷移図', '排他的論理和'] },
  { number: 5, first: 19, definition: spring2004Pm5, pages: spring2004Pm5Pages,
    topics: ['プログラム設計', 'ファイル処理'], keywords: ['ニュース', '日時', '分類', '端末種別', '整列', '抽出'] },
];

export const spring2004Pm01To05Specs: Stage3AfternoonQuestionSpec[] = records.map(record => {
  const { number, first, definition, pages, topics, keywords } = record;
  const original = definition.build([...definition.reference]);
  const blocks = pages(0);
  const originalPageAlt = originalAlt(blocks, first);
  for (const [page, alt] of Object.entries(originalPageAlt)) {
    if (alt.length < 50 || alt.length > 2000) throw Error('原資料p.' + page + 'の代替テキストが規定外です');
  }
  return { number, pages: blocks.map((_, i) => first + i), title: definition.title, definition, original, originalPageAlt, topics, keywords };
});
