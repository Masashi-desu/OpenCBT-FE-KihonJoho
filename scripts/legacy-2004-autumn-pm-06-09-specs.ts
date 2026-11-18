import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2004Pm0609Drafts } from '../src/core/generators/legacy-2004-autumn-pm-06-09';

const metadata = [
  { number: 7, topics: ['プログラミング', 'COBOL', '集計'], keywords: ['研修', '申込者', '索引', '人数表'] },
  { number: 8, topics: ['プログラミング', 'Java', 'データ構造'], keywords: ['FIFO', 'LIFO', '抽象クラス', '配列', '例外'] },
  { number: 9, topics: ['プログラミング', 'CASL II', '文字列処理'], keywords: ['空白圧縮', '同一領域', 'レジスタ', '分岐'] },
];
export const autumn2004Pm06To09Specs: Stage3AfternoonQuestionSpec[] = autumn2004Pm0609Drafts.map((draft, index) => {
  const originalPageAlt = draft.originalPageAlt();
  for (const [page, alt] of Object.entries(originalPageAlt)) {
    const length = [...alt].length;
    if (length <= 100 || length > 2000) throw Error('原資料p.' + page + 'の代替テキストが規定外です（' + length + '字）');
  }
  return { ...metadata[index], title: draft.definition.title,
    pages: Object.keys(originalPageAlt).map(Number), definition: draft.definition, original: draft.original(), originalPageAlt };
});
