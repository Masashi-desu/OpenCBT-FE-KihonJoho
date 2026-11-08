import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import pageAlt from './source-evidence/legacy-2014-autumn-pm-05-08-page-alt.json';
import { legacy2014AutumnPm5Definition as q5 } from '../src/core/generators/legacy-2014-autumn-pm-5';
import { legacy2014AutumnPm6Definition as q6 } from '../src/core/generators/legacy-2014-autumn-pm-6';
import { legacy2014AutumnPm7Definition as q7 } from '../src/core/generators/legacy-2014-autumn-pm-7';
import { legacy2014AutumnPm8Definition as q8 } from '../src/core/generators/legacy-2014-autumn-pm-8';

function spec(number: number, definition: Stage3AfternoonQuestionSpec['definition'], first: number, last: number,
  topics: string[], keywords: string[]): Stage3AfternoonQuestionSpec {
  const pages = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  return {
    number, title: definition.title, pages, topics, keywords, definition,
    original: definition.build([...definition.reference]),
    originalPageAlt: Object.fromEntries(pages.map(page => [page, (pageAlt as Record<string, string>)[String(page)]])),
  };
}
export const autumn2014Pm05To08Specs = [
  spec(5, q5, 24, 30, ['ソフトウェア設計'], ['UML', 'クラス図', '多重度', '集約', 'イテレータ']),
  spec(6, q6, 31, 35, ['サービスマネジメント'], ['サービスデスク', '達成率', '問合せ台帳', 'FAQ']),
  spec(7, q7, 36, 40, ['システム戦略'], ['受発注', '調達リードタイム', '在庫引当', '定量発注方式']),
  spec(8, q8, 41, 46, ['データ構造', 'アルゴリズム'], ['疑似言語', '編集距離', 'エディットグラフ', '動的計画法']),
];
