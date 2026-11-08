import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2015SpringPm1Definition, spring2015Pm1Pages } from '../src/core/generators/legacy-2015-spring-pm-1';
import { legacy2015SpringPm2Definition, spring2015Pm2Pages } from '../src/core/generators/legacy-2015-spring-pm-2';
import { legacy2015SpringPm3Definition, spring2015Pm3Pages } from '../src/core/generators/legacy-2015-spring-pm-3';
import { legacy2015SpringPm4Definition, spring2015Pm4Pages } from '../src/core/generators/legacy-2015-spring-pm-4';
import { originalPageAlt } from '../src/core/generators/legacy-2015-spring-pm-01-04-shared';

const originalBlocks = [spring2015Pm1Pages, spring2015Pm2Pages, spring2015Pm3Pages, spring2015Pm4Pages];
function spec(number: number, definition: Stage3AfternoonQuestionSpec['definition'], topics: string[], keywords: string[]): Stage3AfternoonQuestionSpec {
  const physicalFirst = 6 + (number - 1) * 4;
  return {
    number, title: definition.title, definition, topics, keywords,
    pages: Array.from({ length: 4 }, (_, i) => physicalFirst + i),
    original: definition.build([...definition.reference]),
    originalPageAlt: originalPageAlt(originalBlocks[number - 1](0), physicalFirst),
  };
}

export const spring2015Pm01To04Specs = [
  spec(1, legacy2015SpringPm1Definition, ['情報セキュリティ', 'Webアプリケーション'], ['HTTPS', 'SQLインジェクション', 'クロスサイトスクリプティング', 'ファイル', '認証']),
  spec(2, legacy2015SpringPm2Definition, ['ソフトウェア', '言語処理系'], ['コンパイラ', 'インタプリタ', '仮想計算機', '動的コンパイル']),
  spec(3, legacy2015SpringPm3Definition, ['データベース', '関係データベース'], ['正規化', 'SQL', '主キー', 'GROUP BY', 'ビュー']),
  spec(4, legacy2015SpringPm4Definition, ['ネットワーク', '名前解決'], ['DNS', 'TLD', 'サーチリスト', 'ホスト名', '情報漏えい']),
];
