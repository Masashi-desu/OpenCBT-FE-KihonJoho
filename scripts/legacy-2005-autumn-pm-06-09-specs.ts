import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2005Pm0609Drafts } from '../src/core/generators/legacy-2005-autumn-pm-06-09';

const meta = [
  { number: 7, topics: ['プログラミング', 'COBOL', '順ファイル'], keywords: ['合計点', '平均点', '順ファイル', '表操作', '降順', 'ファイル末尾'] },
  { number: 9, topics: ['プログラミング', 'CASL II', 'ビット演算'], keywords: ['マスク', '論理右シフト', 'ゼロフラグ', 'ビット数', 'レジスタ復元'] },
];

export const autumn2005Pm06To09Specs: Stage3AfternoonQuestionSpec[] = autumn2005Pm0609Drafts.map((draft, index) => {
  const originalPageAlt = draft.originalPageAlt();
  for (const [page, alt] of Object.entries(originalPageAlt)) {
    const length = [...alt].length;
    if (length <= 100 || length > 2000) throw Error('原資料p.' + page + 'の代替テキストが規定外です（' + length + '字）');
  }
  return {
    ...meta[index],
    title: draft.definition.title,
    pages: Object.keys(originalPageAlt).map(Number),
    definition: draft.definition,
    original: draft.original(),
    originalPageAlt,
  };
});
