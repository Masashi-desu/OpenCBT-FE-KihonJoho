import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2005Pm0609Drafts } from '../src/core/generators/legacy-2005-spring-pm-06-09';

const metadata = [
  { number: 7, topics: ['プログラミング', 'COBOL', '集計'], keywords: ['アンケート', '改ページ', '行送り', '索引', '人数表'] },
  { number: 9, topics: ['プログラミング', 'CASL II', '二分探索'], keywords: ['在庫量', '検索キー', 'レジスタ', '論理右シフト', '分岐'] },
];
export const spring2005Pm06To09Specs: Stage3AfternoonQuestionSpec[] = spring2005Pm0609Drafts.map((draft, index) => {
  const originalPageAlt = draft.originalPageAlt();
  for (const [page, alt] of Object.entries(originalPageAlt)) {
    const length = [...alt].length;
    if (length <= 100 || length > 2000) throw Error('原資料p.' + page + 'の代替テキストが規定外です（' + length + '字）');
  }
  return { ...metadata[index], title: draft.definition.title,
    pages: Object.keys(originalPageAlt).map(Number), definition: draft.definition, original: draft.original(), originalPageAlt };
});
