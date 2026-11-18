import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { pageAlt } from '../src/core/generators/legacy-2006-spring-pm-01-05-shared';
import { legacy2006SpringPm01To05Definitions as definitions } from '../src/core/generators/legacy-2006-spring-pm-01-05';
import { spring2006Pm1Pages } from '../src/core/generators/legacy-2006-spring-pm-1';
import { spring2006Pm2Pages } from '../src/core/generators/legacy-2006-spring-pm-2';
import { spring2006Pm5Pages } from '../src/core/generators/legacy-2006-spring-pm-5';

const source = [
  { number: 1, first: 6, pages: spring2006Pm1Pages, topics: ['データベース', 'SQL'],
    keywords: ['関係データベース', '相関副問合せ', '集合関数', 'AVG', 'MIN', 'ALL', 'NOT EXISTS'] },
  { number: 2, first: 9, pages: spring2006Pm2Pages, topics: ['セキュリティ', '認証'],
    keywords: ['ログイン管理', 'ワンタイムパスワード', 'OTP', 'ハッシュ鎖', '一方向性関数', '使い捨てパスワード'] },
  { number: 5, first: 21, pages: spring2006Pm5Pages, topics: ['プログラム設計', 'ファイル処理'],
    keywords: ['プログラム設計', '中間ファイル', '突合せ処理', '前処理', '昇順', 'モジュール構造図'] },
];

export const spring2006Pm01To05Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition, i) => {
  const { number, first, pages, topics, keywords } = source[i];
  const blocks = pages(0), originalPageAlt = pageAlt(blocks, first);
  if (number === 1) originalPageAlt[first] = '次の問1から問5までの5問については，全問解答してください。\n' + originalPageAlt[first];
  return { number, title: definition.title, definition, pages: blocks.map((_, i) => first + i), original: definition.build([...definition.reference]),
    originalPageAlt, topics, keywords };
});
