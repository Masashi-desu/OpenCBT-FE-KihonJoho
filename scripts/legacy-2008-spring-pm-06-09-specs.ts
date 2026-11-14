import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2008Pm0609Drafts } from '../src/core/generators/legacy-2008-spring-pm-06-09';

const metadata = [
  { topics: ['プログラミング','COBOL','順ファイル'], keywords: ['イベント', 'アンケート', '有効票', '無効票', 'ファイル集計'] },
  { topics: ['プログラミング','Java','状態遷移'], keywords: ['水量', '電気ポット', '継承', '例外', '委譲'] },
  { topics: ['プログラミング','CASL II','文字列'], keywords: ['トークン', '単語管理テーブル', '英数字', 'アセンブラ', 'レジスタ'] },
];

export const spring2008Pm06To09Specs: Stage3AfternoonQuestionSpec[] = spring2008Pm0609Drafts.map((draft, i) => {
  const originalPageAlt = draft.originalPageAlt();
  for (const [page, alt] of Object.entries(originalPageAlt)) {
    const length = [...alt].length;
    if (length <= 100 || length > 2000) throw Error(`原資料p.${page}の代替テキストが規定外です（${length}字）`);
  }
  return { number: i + 7, title: draft.definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[i], definition: draft.definition, original: draft.original(), originalPageAlt };
});
