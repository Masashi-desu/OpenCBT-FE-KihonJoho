import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2008PmLanguageDrafts } from '../src/core/generators/legacy-2008-autumn-pm-10-13';

const metadata = [
  { topics: ['プログラミング', 'C', '換字暗号'], keywords: ['2次元配列', 'ファイル入出力', 'fgetc', 'EOF', '剰余', '改行'] },
  { topics: ['プログラミング', 'COBOL', '論理式'], keywords: ['構文検査', 'OCCURS', 'REDEFINES', '全列挙', '桁上がり', '括弧'] },
  { topics: ['プログラミング', 'Java', '文字列照合'], keywords: ['メタ文字', 'アンカー', 'パターン要素', 'List', 'ArrayList', 'charAt'] },
  { topics: ['プログラミング', 'CASL II', 'ビット列'], keywords: ['COMET II', 'SLL', 'JOV', 'フラグレジスタ', '棒グラフ', '集計'] },
];
const selectionNotice = '次の問10から問13までの4問については，この中から1問を選択し，答案用紙の選択欄の「選」をマークして解答してください。なお，2問以上選択した場合には，はじめの1問について採点します。';

export const autumn2008Pm10To13Specs: Stage3AfternoonQuestionSpec[] = autumn2008PmLanguageDrafts.map((draft, index) => {
  const { definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  if (index === 0) originalPageAlt[38] = selectionNotice + '\n\n' + originalPageAlt[38];
  for (const [page, alt] of Object.entries(originalPageAlt)) {
    const length = [...alt].length;
    if (length <= 100 || length > 2000) throw new Error(`原資料p.${page}の代替テキストが規定外です（${length}字）`);
  }
  return {
    number: index + 10, title: definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[index], definition, original: draft.original(), originalPageAlt,
  };
});
