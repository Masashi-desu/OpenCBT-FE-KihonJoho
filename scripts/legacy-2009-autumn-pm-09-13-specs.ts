import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2009PmLanguageDrafts } from '../src/core/generators/legacy-2009-autumn-pm-09-13';

const metadata = [
  { topics: ['プログラミング', 'C', '多倍長整数'], keywords: ['配列', '桁上がり', '文字列', 'strlen', '加算'] },
  { topics: ['プログラミング', 'COBOL', '売上集計'], keywords: ['順ファイル', '索引ファイル', '支店', '整列', '前年同月比'] },
  { topics: ['プログラミング', 'Java', 'オブジェクト指向'], keywords: ['携帯電話', '料金プラン', 'インタフェース', '継承', '切上げ'] },
  { topics: ['プログラミング', 'CASL II', 'ビット演算'], keywords: ['COMET II', 'レジスタ', '語境界', 'シフト', 'マスク'] },
  { topics: ['プログラミング', '表計算', '勤怠管理'], keywords: ['早退', '遅刻', '勤務可能調査', '出勤割当て', '絶対参照', '順位'] },
];

export const autumn2009Pm09To13Specs: Stage3AfternoonQuestionSpec[] = autumn2009PmLanguageDrafts.map((draft, index) => {
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
