import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2006PmLanguageDrafts } from '../src/core/generators/legacy-2006-spring-pm-10-13';

const descriptors: Record<number, Pick<Stage3AfternoonQuestionSpec, 'topics' | 'keywords'>> = {
  10: { topics: ['プログラミング', 'C', '木構造'], keywords: ['英単語検索', '入力補完', 'ポインタ', '短絡評価'] },
  11: { topics: ['プログラミング', 'COBOL', '鉄道利用者集計'], keywords: ['順ファイル', '時間帯', '区間', 'OCCURS', 'REDEFINES'] },
  12: { topics: ['プログラミング', 'Java', 'トランプ'], keywords: ['隣接カード', '二次元配置', '静的初期化', '配列', 'List'] },
  13: { topics: ['プログラミング', 'CASL II', 'ビット演算'], keywords: ['COMET II', '32ビット乗算', 'けた上がり', '階乗', '再帰'] },
};

export const spring2006Pm10To13Specs: Stage3AfternoonQuestionSpec[] = spring2006PmLanguageDrafts.map(draft => {
  const { number, definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  return { number, title: definition.title, pages: Object.keys(originalPageAlt).map(Number), definition,
    ...descriptors[number], original: draft.original(), originalPageAlt };
});
