import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2012PmDigitReferenceTitle, spring2012PmJavaReferenceTitle, spring2012PmLanguageDrafts } from '../src/core/generators/legacy-2012-spring-pm-09-13';

const metadata = [
  { topics: ['プログラミング', 'C', '配列'], keywords: ['会議', '空き時間', '連続区間', '終端', '優先順位'] },
  { topics: ['プログラミング', 'COBOL', '集計'], keywords: ['ICカード', '順ファイル', '索引ファイル', '滞在者', '棒グラフ', '順不同'] },
  { topics: ['プログラミング', 'Java', 'コレクション'], keywords: ['Map', 'List', 'Comparator', 'TreeSet', '反復子', '成績'],
    editorialContextTitles: [spring2012PmJavaReferenceTitle] },
  { topics: ['プログラミング', 'CASL II', '10進加算'], keywords: ['数字列', '桁上げ', 'レジスタ', 'COMET II', 'スタック'],
    editorialContextTitles: [spring2012PmDigitReferenceTitle] },
  { topics: ['プログラミング', '表計算', '推薦'], keywords: ['図書', '垂直照合', '延滞', '貸出し', '類似度', 'マクロ'] },
];

export const spring2012Pm09To13Specs: Stage3AfternoonQuestionSpec[] = spring2012PmLanguageDrafts.map((draft, index) => {
  const { definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  return { number: index + 9, title: definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[index], definition, original: definition.build(definition.reference), originalPageAlt };
});
