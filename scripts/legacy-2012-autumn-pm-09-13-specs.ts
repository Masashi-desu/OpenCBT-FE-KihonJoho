import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2012PmJavaReferenceTitle, autumn2012PmLanguageDrafts } from '../src/core/generators/legacy-2012-autumn-pm-09-13';

const metadata = [
  { topics: ['プログラミング', 'C', '文字列'], keywords: ['くじ', '末尾照合', 'ポインタ', '前後賞', '繰上り'] },
  { topics: ['プログラミング', 'COBOL', '整列'], keywords: ['利用時間', '月次請求', '索引ファイル', '超過料金', 'SORT'] },
  { topics: ['プログラミング', 'Java', 'スレッド'], keywords: ['タイマ', 'コールバック', 'volatile', '割込み', 'Thread'],
    editorialContextTitles: [autumn2012PmJavaReferenceTitle] },
  { topics: ['プログラミング', 'CASL II', '再帰'], keywords: ['多項式', '乗算', 'ビットシフト', 'ホーナー法', 'COMET II'] },
  { topics: ['プログラミング', '表計算', '最適化'], keywords: ['メッシュ', '小学校', '絶対参照', '照合検索', '最大最小'] },
];

export const autumn2012Pm09To13Specs: Stage3AfternoonQuestionSpec[] = autumn2012PmLanguageDrafts.map((draft, index) => {
  const { definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  return { number: index + 9, title: definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[index], definition, original: definition.build(definition.reference), originalPageAlt };
});
