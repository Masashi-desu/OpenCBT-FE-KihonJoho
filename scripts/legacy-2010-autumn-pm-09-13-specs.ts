import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2010PmLanguageDrafts } from '../src/core/generators/legacy-2010-autumn-pm-09-13';
import { autumn2010PmJavaRefs } from './legacy-2010-autumn-pm-metadata';

const metadata = [
  { topics: ['プログラミング', 'C', '構造体'], keywords: ['バス', '待ち時間', '累積遅延', '路線', '配列', '番兵'] },
  { topics: ['プログラミング', 'COBOL', '集計'], keywords: ['SORT', 'EVALUATE', '区間', '割引', '同順位', 'レコード'] },
  { topics: ['プログラミング', 'Java', '同期'], keywords: ['LinkedList', 'HashMap', 'セッション', 'wait', 'notifyAll', '排他制御'] },
  { topics: ['プログラミング', 'CASL II', 'ビット演算'], keywords: ['ビット反転', '語交換', 'マスク', 'OF', 'シフト', 'レジスタ'] },
  { topics: ['プログラミング', '表計算', '利益分析'], keywords: ['価格弾力性', '絶対参照', '垂直照合', '水平照合', '広告', '購入意向率'] },
];

export const autumn2010Pm09To13Specs: Stage3AfternoonQuestionSpec[] = autumn2010PmLanguageDrafts.map((draft, index) => {
  const { definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  for (const [page, alt] of Object.entries(originalPageAlt)) {
    const length = [...alt].length;
    if (length <= 100 || length > 2000) throw new Error(`原資料p.${page}の代替テキストが規定外です（${length}字）`);
  }
  return {
    number: index + 9, title: definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[index], definition, original: definition.build(definition.reference), originalPageAlt,
    ...(index === 2 ? {
      editorialContextTitles: ['Java APIの補足（独自作成）'],
      editorialContextSources: { 'Java APIの補足（独自作成）': autumn2010PmJavaRefs },
    } : {}),
  };
});
