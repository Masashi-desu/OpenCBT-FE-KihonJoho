import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2006Pm0609Drafts } from '../src/core/generators/legacy-2006-spring-pm-06-09';

const meta = [
  {number: 6, topics: ['プログラミング', 'C', '再帰'], keywords: ['コッホ曲線', 'フラクタル', '座標', '始点', '自己相似']},
  {number: 7, topics: ['プログラミング', 'COBOL', '順編成ファイル'], keywords: ['駐輪場', '空き区画', '連番', 'ファイル末尾']},
  {number: 8, topics: ['プログラミング', 'Java', '継承'], keywords: ['パッチ', '暗号化ツール', '集合', '適用状況', '抽象クラス']},
  {number: 9, topics: ['プログラミング', 'CASL II', 'シフト'], keywords: ['長方形', '面積', '絶対値', 'ビット', '論理右シフト']},
];

export const spring2006Pm06To09Specs: Stage3AfternoonQuestionSpec[] = spring2006Pm0609Drafts.map((draft, index) => {
  const originalPageAlt = draft.originalPageAlt();
  for (const [page, alt] of Object.entries(originalPageAlt)) {
    const length = [...alt].length;
    if (length <= 100 || length > 2000) throw Error('原資料p.' + page + 'の代替テキストが規定外です（' + length + '字）');
  }
  return {
    ...meta[index],
    title: draft.definition.title,
    pages: Object.keys(originalPageAlt).map(Number),
    definition: draft.definition,
    original: draft.original(),
    originalPageAlt,
  };
});
