import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2011PmDigitReferenceTitle, autumn2011PmJavaReferenceTitle, autumn2011PmLanguageDrafts } from '../src/core/generators/legacy-2011-autumn-pm-09-13';

const metadata = [
  { topics: ['プログラミング', 'C', '循環小数'], keywords: ['整数除算', '余り', '配列', '循環節', '桁数', 'putchar'] },
  { topics: ['プログラミング', 'COBOL', '集計'], keywords: ['順ファイル', '表引き', 'SORT', 'RELEASE', 'RETURN', '集計表'] },
  { topics: ['プログラミング', 'Java', '集合'], keywords: ['住所録', '検索条件', 'SearchCriteria', 'HashSet', '和集合', '積集合', '複数選択'],
    editorialContextTitles: [autumn2011PmJavaReferenceTitle] },
  { topics: ['プログラミング', 'CASL II', '基数変換'], keywords: ['符号なし32ビット', '商', '剰余', '借り', '桁上がり', 'DIV', 'BTOD'],
    editorialContextTitles: [autumn2011PmDigitReferenceTitle] },
  { topics: ['プログラミング', '表計算', 'マクロ'], keywords: ['年齢給', '役職給', '垂直照合', '条件付合計', '賞与', '相対セル'] },
];

export const autumn2011Pm09To13Specs: Stage3AfternoonQuestionSpec[] = autumn2011PmLanguageDrafts.map((draft, index) => {
  const { definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  return { number: index + 9, title: definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[index], definition, original: definition.build(definition.reference), originalPageAlt };
});
