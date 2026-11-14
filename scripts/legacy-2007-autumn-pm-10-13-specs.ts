import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2007PmLanguageDrafts } from '../src/core/generators/legacy-2007-autumn-pm-10-13';

const metadata = {
  10: { topics: ['プログラミング', 'C', '配送物の分類と料金'], keywords: ['重量', '大きさ', '距離区分', '配送料金', '配列', '境界'] },
  11: { topics: ['プログラミング', 'COBOL', 'ファイル突合せ'], keywords: ['振込', '請求書コード', 'マージ', '入金照合', '手数料'] },
  12: { topics: ['プログラミング', 'Java', '反復子'], keywords: ['Iterable', 'Iterator', '接頭辞', '抽出', '文字列', '重複'] },
  13: { topics: ['プログラミング', 'CASL II', 'ビット配列'], keywords: ['COMET II', '行', '列', '対角線', 'シフト', '論理積'] },
};
const selection = '次の問10から問13までの4問については，この中から1問を選択し，答案用紙の選択欄の「選」をマークして解答してください。なお，2問以上選択した場合には，はじめの1問について採点します。';

export const autumn2007Pm10To13Specs: Stage3AfternoonQuestionSpec[] = autumn2007PmLanguageDrafts.map(draft => {
  const { number, definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  if (number === 10) {
    originalPageAlt[36] = selection + '\n\n' + originalPageAlt[36];
    originalPageAlt[39] = '問10 設問2（p.38の続き）。b〜dは配送種別，e，fは配送料金（円）を選ぶ。\n\n' + originalPageAlt[39];
  }
  return { number, title: definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[number as keyof typeof metadata], definition, original: draft.original(), originalPageAlt };
});
