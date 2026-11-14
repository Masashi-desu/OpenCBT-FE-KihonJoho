import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2007Pm0609Drafts } from '../src/core/generators/legacy-2007-autumn-pm-06-09';

const metadata = [
  { topics: ['プログラミング', 'COBOL', '索引ファイル'], keywords: ['健康診断', '順ファイル', '履歴', 'キー', '体重差'] },
  { topics: ['プログラミング', 'Java', '待ち行列'], keywords: ['重み', 'LinkedList', '累計', '優先度', 'poll'] },
  { topics: ['プログラミング', 'CASL II', 'パリティ'], keywords: ['偶数パリティ', '水平パリティ', 'ビット', 'シフト', 'XOR'] },
];

export const autumn2007Pm06To09Specs: Stage3AfternoonQuestionSpec[] = autumn2007Pm0609Drafts.map((draft, i) => {
  const originalPageAlt = draft.originalPageAlt();
  for (const [page, alt] of Object.entries(originalPageAlt)) {
    const length = [...alt].length;
    if (length <= 100 || length > 2000) throw Error(`原資料p.${page}の代替テキストが規定外です（${length}字）`);
  }
  return { number: i + 7, title: draft.definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[i], definition: draft.definition, original: draft.original(), originalPageAlt };
});
