import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2012AutumnPm01To04Definitions as definitions } from '../src/core/generators/legacy-2012-autumn-pm-01-04';
import { autumn2012Pm1Pages } from '../src/core/generators/legacy-2012-autumn-pm-1';
import { autumn2012Pm2Pages } from '../src/core/generators/legacy-2012-autumn-pm-2';
import { autumn2012Pm3Pages } from '../src/core/generators/legacy-2012-autumn-pm-3';
import { autumn2012Pm4Pages } from '../src/core/generators/legacy-2012-autumn-pm-4';
import { pageAlt } from '../src/core/generators/legacy-2012-autumn-pm-01-04-shared';

const firstPages = [5, 8, 13, 17];
const pagesFor = [autumn2012Pm1Pages, autumn2012Pm2Pages, autumn2012Pm3Pages, autumn2012Pm4Pages];
const topics = [['ソフトウェア', 'プロセスの排他制御'], ['データベース', '購買情報', '名寄せ', 'SQL'],
  ['ネットワーク', '電子メール', 'MIME'], ['情報セキュリティ', 'セキュリティ事故への対応']];
const keywords = [
  ['共有メモリ', '並行処理', '同期変数', 'クリティカルセクション', 'デッドロック'],
  ['主キー', '名寄せ', '平均購入単価', 'GROUP BY', 'COUNT DISTINCT', 'HAVING'],
  ['MIME', 'base64', 'quoted-printable', 'UTF-8', 'multipart/mixed', 'boundary'],
  ['SQLインジェクション', 'DMZ', 'SSL', '個人情報', 'セキュアプログラミング', 'ログ'],
];

export const autumn2012Pm01To04Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition, index) => {
  const first = firstPages[index];
  const blocks = pagesFor[index](0);
  return {
    number: index + 1, title: definition.title, definition,
    pages: blocks.map((_, offset) => first + offset), original: definition.build([...definition.reference]),
    originalPageAlt: pageAlt(blocks, first), topics: topics[index], keywords: keywords[index],
  };
});
