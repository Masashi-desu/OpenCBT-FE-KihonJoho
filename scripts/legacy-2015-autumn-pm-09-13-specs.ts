import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import pageAlt from './source-evidence/legacy-2015-autumn-pm-09-13-page-alt.json';
import { legacy2015AutumnPm9Definition as q9 } from '../src/core/generators/legacy-2015-autumn-pm-9';
import { legacy2015AutumnPm10Definition as q10 } from '../src/core/generators/legacy-2015-autumn-pm-10';
import { legacy2015AutumnPm11Definition as q11 } from '../src/core/generators/legacy-2015-autumn-pm-11';
import { legacy2015AutumnPm12Definition as q12 } from '../src/core/generators/legacy-2015-autumn-pm-12';
import { legacy2015AutumnPm13Definition as q13 } from '../src/core/generators/legacy-2015-autumn-pm-13';
import { autumn2015PmJavaTitle } from '../src/core/generators/legacy-2015-autumn-pm-materials';

function spec(
  number: number, definition: Stage3AfternoonQuestionSpec['definition'], pages: number[],
  topics: string[], keywords: string[],
): Stage3AfternoonQuestionSpec {
  return {
    number, title: definition.title, pages, topics, keywords, definition,
    original: definition.build([...definition.reference]),
    originalPageAlt: Object.fromEntries(pages.map(page => [page, (pageAlt as Record<number, string>)[page]])),
  };
}

export const autumn2015Pm09To13Specs = [
  spec(9, q9, [40, 41, 42, 43, 44, 45, 46], ['プログラミング', 'C', 'ファイル処理'],
    ['入退室', '固定長レコード', 'EOF', '入退室順序', '文字列比較']),
  spec(10, q10, [47, 48, 49, 50, 51, 52], ['プログラミング', 'COBOL', '集計'],
    ['ヒストグラム', 'PICTURE', 'ソート', 'アンケート', '数字編集']),
  { ...spec(11, q11, [53, 54, 55, 56, 57, 58], ['プログラミング', 'Java', 'データ構造'],
    ['キャッシュ', 'FIFO', 'LRU', 'ArrayList', '継承']), editorialContextTitles: [autumn2015PmJavaTitle] },
  spec(12, q12, [59, 60, 61, 62, 63], ['プログラミング', 'CASL II', 'ビット演算'],
    ['ビット列の挿入', '論理シフト', 'OR', '符号付き比較', '副プログラム']),
  spec(13, q13, [64, 65, 66, 67, 68, 69, 70], ['プログラミング', '表計算', '在庫管理'],
    ['セット値引き', '垂直照合', '照合検索', '相対参照', '条件付合計']),
];
