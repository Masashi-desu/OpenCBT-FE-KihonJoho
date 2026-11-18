import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2005PmLanguageDrafts } from '../src/core/generators/legacy-2005-autumn-pm-10-13';

const descriptors: Record<number, Pick<Stage3AfternoonQuestionSpec, 'topics' | 'keywords'>> = {
  11: { topics: ['プログラミング', 'COBOL', '会員ファイル'], keywords: ['索引ファイル', '会員ID', '決定表', 'REDEFINES', 'OCCURS'] },
  12: { topics: ['プログラミング', 'Java', '自動改札機'], keywords: ['運賃', '乗車券', '抽象クラス', '継承', 'オーバーライド'] },
  13: { topics: ['プログラミング', 'CASL II', 'ビット演算'], keywords: ['COMET II', '論理シフト', 'マスク', '照合', '指定席予約'] },
};

export const autumn2005Pm10To13Specs: Stage3AfternoonQuestionSpec[] = autumn2005PmLanguageDrafts.map(draft => {
  const { number, definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  return { number, title: definition.title, pages: Object.keys(originalPageAlt).map(Number), definition,
    ...descriptors[number], original: draft.original(), originalPageAlt };
});
