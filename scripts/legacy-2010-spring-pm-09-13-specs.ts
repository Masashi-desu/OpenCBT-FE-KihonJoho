import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2010PmLanguageDrafts } from '../src/core/generators/legacy-2010-spring-pm-09-13';

const metadata = [
  { topics: ['プログラミング', 'C', '文字列処理'], keywords: ['行長', 'ワードラップ', 'cpos', 'gapp', 'strlen', 'キーワード'] },
  { topics: ['プログラミング', 'COBOL', 'ログ'], keywords: ['入室', '退室', '従業員番号', '配列', '索引ファイル'] },
  { topics: ['プログラミング', 'Java', '再帰'], keywords: ['リバーシ', '方向', '盤面', '列挙型', '隣接'] },
  { topics: ['プログラミング', 'CASL II', '浮動小数点'], keywords: ['仮数', '指数', '正規化', '符号', 'COMET II'] },
  { topics: ['プログラミング', '表計算', '割引'], keywords: ['伝票', 'メニュー', '照合合計', '絶対参照', '最適割引', '数量割引'] },
];

export const spring2010Pm09To13Specs: Stage3AfternoonQuestionSpec[] = spring2010PmLanguageDrafts.map((draft, index) => {
  const { definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  for (const [page, alt] of Object.entries(originalPageAlt)) {
    const length = [...alt].length;
    if (length <= 100 || length > 2000) throw new Error(`原資料p.${page}の代替テキストが規定外です（${length}字）`);
  }
  return {
    number: index + 9, title: definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[index], definition, original: draft.original(), originalPageAlt,
  };
});
