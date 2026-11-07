import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2016SpringPm9Definition, spring2016Pm9OriginalPageAlt } from '../src/core/generators/legacy-2016-spring-pm-9';
import { legacy2016SpringPm10Definition, spring2016Pm10OriginalPageAlt } from '../src/core/generators/legacy-2016-spring-pm-10';
import { legacy2016SpringPm11Definition, spring2016Pm11OriginalPageAlt, spring2016Pm11EditorialTitle } from '../src/core/generators/legacy-2016-spring-pm-11';
import { legacy2016SpringPm12Definition, spring2016Pm12OriginalPageAlt } from '../src/core/generators/legacy-2016-spring-pm-12';
import { legacy2016SpringPm13Definition, spring2016Pm13OriginalPageAlt } from '../src/core/generators/legacy-2016-spring-pm-13';

export const spring2016Pm09To13Specs: Stage3AfternoonQuestionSpec[] = [
  { number: 9, title: 'Cによるフラクタル図形の描画', pages: [41, 42, 43, 44, 45],
    topics: ['プログラミング', 'C', 'アルゴリズム'], keywords: ['フラクタル', '自己相似', '再帰', '二次元配列'],
    original: legacy2016SpringPm9Definition.build([0]), definition: legacy2016SpringPm9Definition, originalPageAlt: spring2016Pm9OriginalPageAlt() },
  { number: 10, title: 'COBOLによる宿泊予約の管理', pages: [46, 47, 48, 49, 50],
    topics: ['プログラミング', 'COBOL', 'ファイル処理'], keywords: ['索引ファイル', '予約', '前月', '閏年'],
    original: legacy2016SpringPm10Definition.build([0]), definition: legacy2016SpringPm10Definition, originalPageAlt: spring2016Pm10OriginalPageAlt() },
  { number: 11, title: 'JavaによるToDo管理', pages: [51, 52, 53, 54, 55, 56],
    topics: ['プログラミング', 'Java', 'オブジェクト指向'], keywords: ['ToDo', 'ArrayList', 'UUID', '検索条件'],
    original: legacy2016SpringPm11Definition.build([0]), definition: legacy2016SpringPm11Definition, originalPageAlt: spring2016Pm11OriginalPageAlt(),
    editorialContextTitles: [spring2016Pm11EditorialTitle] },
  { number: 12, title: 'CASL IIによる競走のチーム別順位', pages: [57, 58, 59, 60],
    topics: ['プログラミング', 'CASL II', 'アルゴリズム'], keywords: ['チーム別順位', '整数除算', '反復減算', '選択ソート'],
    original: legacy2016SpringPm12Definition.build([0]), definition: legacy2016SpringPm12Definition, originalPageAlt: spring2016Pm12OriginalPageAlt() },
  { number: 13, title: '表計算による販売分析', pages: [61, 62, 63, 64, 65, 66, 67, 68],
    topics: ['プログラミング', '表計算', '販売分析'], keywords: ['構成比率', '条件付合計', '水平照合', '売上高'],
    original: legacy2016SpringPm13Definition.build([0]), definition: legacy2016SpringPm13Definition, originalPageAlt: spring2016Pm13OriginalPageAlt() },
];
