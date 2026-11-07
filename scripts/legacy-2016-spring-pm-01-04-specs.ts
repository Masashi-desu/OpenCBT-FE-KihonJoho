import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2016SpringPm1Definition } from '../src/core/generators/legacy-2016-spring-pm-1';
import { legacy2016SpringPm2Definition } from '../src/core/generators/legacy-2016-spring-pm-2';
import { legacy2016SpringPm3Definition } from '../src/core/generators/legacy-2016-spring-pm-3';
import { legacy2016SpringPm4Definition } from '../src/core/generators/legacy-2016-spring-pm-4';
import pageAlt from './source-evidence/legacy-2016-spring-pm-01-04-page-alt.json';

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

// The annual route presents the independently transcribed original page
// images. Only the separately checked answer fields and explanation are used
// from the source-reference body on that route.
export const spring2016Pm01To04Specs = [
  spec(1, legacy2016SpringPm1Definition, [6, 7, 8, 9], ['情報セキュリティ', 'インシデント対応'], ['TLS', 'パスワード', '秘密鍵', 'SSH']),
  spec(2, legacy2016SpringPm2Definition, [10, 11, 12, 13], ['ソフトウェア', 'メモリ管理'], ['ガーベジコレクタ', 'マークアンドスイープ', 'LIVEリスト']),
  spec(3, legacy2016SpringPm3Definition, [14, 15, 16, 17], ['データベース', '関係データベース'], ['SQL', '主キー', 'GROUP BY', 'HAVING', '集約']),
  spec(4, legacy2016SpringPm4Definition, [18, 19, 20], ['ネットワーク', 'アドレス解決'], ['ARP', 'イーサネット', 'MACアドレス', 'ルータ']),
];
