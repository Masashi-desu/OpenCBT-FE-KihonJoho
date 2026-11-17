import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { spring2007Pm0609Drafts } from '../src/core/generators/legacy-2007-spring-pm-06-09';
const metadata = [
  { topics: ['プログラミング','C','状態遷移'], keywords: ['双六','配列','手番','短絡評価','さいころ'] },
  { topics: ['プログラミング','COBOL','命令網羅'], keywords: ['選挙','得票','集計','並べ替え','作業領域'] },
  { topics: ['プログラミング','Java','比較器'], keywords: ['月名','辞書順','省略形','Comparator','安定ソート'] },
  { topics: ['プログラミング','CASL II','ビット列'], keywords: ['左右対称','シフト','OF','レジスタ','SRL'] },
];
export const spring2007Pm06To09Specs: Stage3AfternoonQuestionSpec[] = spring2007Pm0609Drafts.map((draft,i)=>{
  const originalPageAlt = draft.originalPageAlt();
  for (const [page,alt] of Object.entries(originalPageAlt)) {
    const length = [...alt].length;
    if (length <= 100 || length > 2000) throw Error(`原資料p.${page}の代替テキストが規定外です（${length}字）`);
  }
  return { number:i+6,title:draft.definition.title,pages:Object.keys(originalPageAlt).map(Number),
    ...metadata[i],definition:draft.definition,original:draft.original(),originalPageAlt };
});
