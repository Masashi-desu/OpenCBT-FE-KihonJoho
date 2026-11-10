import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import {
  spring2013PmJavaReferenceTitle,
  spring2013PmLanguageDrafts,
} from '../src/core/generators/legacy-2013-spring-pm-09-13';

const metadata = [
  { topics: ['プログラミング', 'C', '配列'], keywords: ['料金表', '有料放送', 'チャンネル', '境界'] },
  { topics: ['プログラミング', 'COBOL', '決定表'], keywords: ['勤続年数', '特別給', '金種', 'テストデータ'] },
  { topics: ['プログラミング', 'Java', 'マップ'], keywords: ['あみだくじ', 'SortedMap', '例外', '横線'],
    editorialContextTitles: [spring2013PmJavaReferenceTitle] },
  { topics: ['プログラミング', 'CASL II', 'ビット演算'], keywords: ['BREP', 'XBREP', 'COMET II', 'マスク'] },
  { topics: ['プログラミング', '表計算', '生産管理'], keywords: ['在庫', '部品需要', '照合一致', '相対参照'] },
];

export const spring2013Pm09To13Specs: Stage3AfternoonQuestionSpec[] = spring2013PmLanguageDrafts.map((draft, index) => {
  const { definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  return {
    number: index + 9, title: definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[index], definition, original: definition.build(definition.reference), originalPageAlt,
  };
});
