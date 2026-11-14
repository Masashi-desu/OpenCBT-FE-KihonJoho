import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2008PmLanguageDrafts } from '../src/core/generators/legacy-2008-spring-pm-10-13';

const metadata = {
  10: { topics: ['プログラミング', 'C', '循環小数'], keywords: ['既約分数', '最大公約数', '文字列', '位取り', 'ポインタ', '端数'] },
  12: { topics: ['プログラミング', 'Java', 'インタフェース'], keywords: ['プロパティ形式', 'タグ形式', 'アダプタ', '多態性', 'コメント'] },
  13: { topics: ['プログラミング', 'CASL II', '入出力変換'], keywords: ['アセンブラ', 'COMET II', 'レジスタ', '最大値', '最小値', '平均値', 'シフト'] },
};
const selection = '次の問10から問13までの4問については，この中から1問を選択し，答案用紙の選択欄の「選」をマークして解答してください。なお，2問以上選択した場合には，はじめの1問について採点します。';

export const spring2008Pm10To13Specs: Stage3AfternoonQuestionSpec[] = spring2008PmLanguageDrafts.map(draft => {
  const { number, definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  if (number === 10) originalPageAlt[35] = selection + '\n\n' + originalPageAlt[35];
  return {
    number, title: definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[number as keyof typeof metadata], definition, original: draft.original(), originalPageAlt,
  };
});
