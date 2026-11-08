import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import pageAlt from './source-evidence/legacy-2014-spring-pm-05-08-page-alt.json';
import { legacy2014SpringPm5Definition as q5 } from '../src/core/generators/legacy-2014-spring-pm-5';
import { legacy2014SpringPm6Definition as q6 } from '../src/core/generators/legacy-2014-spring-pm-6';
import { legacy2014SpringPm7Definition as q7 } from '../src/core/generators/legacy-2014-spring-pm-7';
import { legacy2014SpringPm8Definition as q8 } from '../src/core/generators/legacy-2014-spring-pm-8';

function spec(number: number, definition: Stage3AfternoonQuestionSpec['definition'], from: number, to: number,
  topics: string[], keywords: string[]): Stage3AfternoonQuestionSpec {
  const pages = Array.from({ length: to - from + 1 }, (_, i) => i + from);
  return {
    number, title: definition.title, pages, topics, keywords, definition,
    original: definition.build([...definition.reference]),
    originalPageAlt: Object.fromEntries(pages.map(page => [page, (pageAlt as Record<string, string>)[String(page)]])),
  };
}
export const spring2014Pm05To08Specs = [
  spec(5, q5, 25, 30, ['ソフトウェア設計', 'システム統合'], ['在庫管理', '有効在庫', '実在庫', '入出庫', 'EDI']),
  spec(6, q6, 31, 35, ['プロジェクトマネジメント'], ['ファンクションポイント法', '工数見積り', '処理フロー', '工程比率', '共通部品']),
  spec(7, q7, 36, 39, ['プロジェクトマネジメント', 'システム移行'], ['アローダイアグラム', 'クリティカルパス', 'ダミー作業', '要員計画']),
  spec(8, q8, 40, 45, ['データ構造', 'アルゴリズム'], ['空きリスト', '割当て', '解放', '番兵', '疑似言語']),
];
