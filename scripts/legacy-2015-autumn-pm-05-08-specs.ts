import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import pageAlt from './source-evidence/legacy-2015-autumn-pm-05-08-page-alt.json';
import { legacy2015AutumnPm5Definition as q5 } from '../src/core/generators/legacy-2015-autumn-pm-5';
import { legacy2015AutumnPm6Definition as q6 } from '../src/core/generators/legacy-2015-autumn-pm-6';
import { legacy2015AutumnPm7Definition as q7 } from '../src/core/generators/legacy-2015-autumn-pm-7';
import { legacy2015AutumnPm8Definition as q8 } from '../src/core/generators/legacy-2015-autumn-pm-8';

function spec(number: number, definition: Stage3AfternoonQuestionSpec['definition'], pages: number[], topics: string[], keywords: string[]): Stage3AfternoonQuestionSpec {
  return {
    number, title: definition.title, pages, topics, keywords, definition,
    original: definition.build([...definition.reference]),
    originalPageAlt: Object.fromEntries(pages.map(page => [page, (pageAlt as Record<string, string>)[String(page)]])),
  };
}

export const autumn2015Pm05To08Specs = [
  spec(5, q5, [21, 22, 23, 24, 25], ['システム設計', 'ソフトウェア'], ['決定表', '注文機能', '入力チェック', '在庫', '割引']),
  spec(6, q6, [26, 27, 28], ['プロジェクトマネジメント'], ['見積り', '生産性基準値', '工程', '所要工数', 'コスト']),
  spec(7, q7, [29, 30, 31, 32, 33], ['経営戦略', '財務会計'], ['営業利益率', '構成比', 'パレート図', '決定木', '期待値']),
  spec(8, q8, [34, 35, 36, 37, 38, 39], ['アルゴリズム', 'プログラミング'], ['疑似言語', '文字列検索', 'Boyer-Moore-Horspool', 'Skip', '配列']),
];
