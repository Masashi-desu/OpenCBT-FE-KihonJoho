import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2015AutumnPm1Definition } from '../src/core/generators/legacy-2015-autumn-pm-1';
import { legacy2015AutumnPm2Definition } from '../src/core/generators/legacy-2015-autumn-pm-2';
import { legacy2015AutumnPm3Definition } from '../src/core/generators/legacy-2015-autumn-pm-3';
import { legacy2015AutumnPm4Definition } from '../src/core/generators/legacy-2015-autumn-pm-4';
import pageAlt from './source-evidence/legacy-2015-autumn-pm-01-04-page-alt.json';

const sourcePages = pageAlt as Record<number, string>;

function spec(
  number: number,
  definition: Stage3AfternoonQuestionSpec['definition'],
  pages: number[],
  topics: string[],
  keywords: string[],
): Stage3AfternoonQuestionSpec {
  return {
    number, title: definition.title, pages, topics, keywords, definition,
    original: definition.build([...definition.reference]),
    originalPageAlt: Object.fromEntries(pages.map(page => [page, sourcePages[page]])),
  };
}

export const autumn2015Pm01To04Specs = [
  spec(1, legacy2015AutumnPm1Definition, [5, 6, 7, 8, 9], ['情報セキュリティ', 'ログ管理'], ['アクセスログ', '公開鍵', '電子署名', 'ログ集積']),
  spec(2, legacy2015AutumnPm2Definition, [10, 11, 12], ['基礎理論', '数値表現'], ['浮動小数点', '単精度', '仮数', '指数', '切捨て']),
  spec(3, legacy2015AutumnPm3Definition, [13, 14, 15, 16], ['データベース', '関係データベース'], ['SQL', '主キー', 'BETWEEN', 'ANY', 'リコール']),
  spec(4, legacy2015AutumnPm4Definition, [17, 18, 19, 20], ['情報セキュリティ', 'セッション管理'], ['HTTP', 'クッキー', 'Cookie', 'ドメイン', 'セッションID']),
];
