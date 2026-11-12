import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2009PmLanguageDrafts } from '../src/core/generators/legacy-2009-spring-pm-09-13';

const metadata = [
  { topics: ['プログラミング', 'C', 'パス変換'], keywords: ['文字列', 'ポインタ演算', '相対パス', '絶対パス', 'strcpy'] },
  { topics: ['プログラミング', 'COBOL', '売上集計'], keywords: ['順ファイル', 'キーブレーク', '累積比率', '整列', 'OCCURS'] },
  { topics: ['プログラミング', 'Java', 'ギャップバッファ'], keywords: ['文字列', 'カーソル', '配列', 'System.arraycopy', '挿入・削除'] },
  { topics: ['プログラミング', 'CASL II', 'ビット演算'], keywords: ['COMET II', '乗算', 'シフト', '繰上がり', 'フラグレジスタ'] },
  { topics: ['プログラミング', '表計算', '生産計画'], keywords: ['在庫', '販売計画', '絶対参照', '照合合計', '切上げ'] },
];

export const spring2009Pm09To13Specs: Stage3AfternoonQuestionSpec[] = spring2009PmLanguageDrafts.map((draft, index) => {
  const { definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  for (const [page, alt] of Object.entries(originalPageAlt)) {
    const length = [...alt].length;
    if (length <= 100 || length > 2000) throw new Error(`原資料p.${page}の代替テキストが規定外です（${length}字）`);
  }
  return {
    number: index + 9, title: definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[index], definition, original: draft.original(), originalPageAlt,
  };
});
