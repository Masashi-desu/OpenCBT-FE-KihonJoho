import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import pageAlt from './source-evidence/legacy-2015-spring-pm-05-08-page-alt.json';
import { legacy2015SpringPm5Definition as q5 } from '../src/core/generators/legacy-2015-spring-pm-5';
import { legacy2015SpringPm6Definition as q6 } from '../src/core/generators/legacy-2015-spring-pm-6';
import { legacy2015SpringPm7Definition as q7 } from '../src/core/generators/legacy-2015-spring-pm-7';
import { legacy2015SpringPm8Definition as q8 } from '../src/core/generators/legacy-2015-spring-pm-8';

function spec(number: number, definition: Stage3AfternoonQuestionSpec['definition'], pages: number[], topics: string[], keywords: string[]): Stage3AfternoonQuestionSpec {
  return {
    number, title: definition.title, pages, topics, keywords, definition,
    original: definition.build([...definition.reference]),
    originalPageAlt: Object.fromEntries(pages.map(page => [page, (pageAlt as Record<string, string>)[String(page)]])),
  };
}

export const spring2015Pm05To08Specs = [
  spec(5, q5, [22, 23, 24, 25, 26, 27], ['ソフトウェア設計', 'データベース'], ['E-R図', '営業支援', 'CRUD', '主キー', '名寄せ']),
  spec(6, q6, [28, 29, 30, 31, 32], ['プロジェクトマネジメント'], ['コミュニケーション', '会議', '議事録', 'グループウェア', '権限']),
  spec(7, q7, [33, 34, 35, 36], ['システム戦略', '投資評価'], ['正味現在価値', 'NPV', 'キャッシュフロー', '割引率', '投資回収期間']),
  spec(8, q8, [37, 38, 39, 40, 41], ['データ構造', 'アルゴリズム'], ['疑似言語', '選択アルゴリズム', 'クイックソート', '基準値', '配列']),
];
