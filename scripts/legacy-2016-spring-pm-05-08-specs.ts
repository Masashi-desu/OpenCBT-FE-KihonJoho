import type { Stage3AfternoonQuestionSpec } from './legacy-2016-autumn-pm-spec';
import pageAlt from './source-evidence/legacy-2016-spring-pm-05-08-page-alt.json';
import { legacy2016SpringPm5Definition as q5 } from '../src/core/generators/legacy-2016-spring-pm-5';
import { legacy2016SpringPm6Definition as q6 } from '../src/core/generators/legacy-2016-spring-pm-6';
import { legacy2016SpringPm7Definition as q7 } from '../src/core/generators/legacy-2016-spring-pm-7';
import { legacy2016SpringPm8Definition as q8 } from '../src/core/generators/legacy-2016-spring-pm-8';

function spec(number: number, definition: Stage3AfternoonQuestionSpec['definition'], pages: number[], topics: string[], keywords: string[]): Stage3AfternoonQuestionSpec {
  return { number, title: definition.title, pages, topics, keywords, definition, original: definition.build([...definition.reference]),
    originalPageAlt: Object.fromEntries(pages.map(page => [page, (pageAlt as Record<string, string>)[String(page)]])) };
}

export const spring2016Pm05To08Specs = [
  spec(5, q5, [21, 22, 23, 24, 25], ['システム設計', 'ネットワーク'], ['シーケンス図', 'Webアプリ', 'ブラウザ', '圏外', '店舗検索']),
  spec(6, q6, [26, 27, 28, 29], ['プロジェクト管理', 'リスク管理'], ['ソフトウェアパッケージ', '加重評価', '概算見積', 'リスクマトリックス']),
  spec(7, q7, [30, 31, 32, 33, 34], ['販売分析', '投資評価'], ['ID-POS', 'バブルチャート', 'リピート率', '購買履歴', '広告']),
  spec(8, q8, [35, 36, 37, 38, 39, 40], ['アルゴリズム', '領域管理'], ['疑似言語', '配列', '簡易メモ帳', 'ガベージコレクション', 'clearGarbage']),
];
