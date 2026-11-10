import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import {
  autumn2013PmCaslCodesTitle,
  autumn2013PmJavaReferenceTitle,
  autumn2013PmLanguageDrafts,
} from '../src/core/generators/legacy-2013-autumn-pm-09-13';

const metadata = [
  { topics: ['プログラミング', 'C', '文字列処理'], keywords: ['辞書順', '文字情報列', 'strcmp', '配列境界'] },
  { topics: ['プログラミング', 'COBOL', '索引ファイル'], keywords: ['予約', 'コート', '復元', '順不同'] },
  { topics: ['プログラミング', 'Java', '木構造'], keywords: ['再帰', '相対パス', 'ディレクトリ', '子ノード'],
    editorialContextTitles: [autumn2013PmJavaReferenceTitle] },
  { topics: ['プログラミング', 'CASL II', '時間変換'], keywords: ['TOSEC', 'TOTIME', 'COMET II', 'ビットシフト'],
    editorialContextTitles: [autumn2013PmCaslCodesTitle] },
  { topics: ['プログラミング', '表計算', 'グループ分け'], keywords: ['類似度', '推薦', '表引き', '相対参照'] },
];

export const autumn2013Pm09To13Specs: Stage3AfternoonQuestionSpec[] = autumn2013PmLanguageDrafts.map((draft, index) => {
  const { definition } = draft, originalPageAlt = draft.originalPageAlt();
  return {
    number: index + 9, title: definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[index], definition, original: definition.build(definition.reference), originalPageAlt,
  };
});
