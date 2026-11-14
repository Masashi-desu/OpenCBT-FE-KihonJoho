import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2007AutumnPm01To05Definitions as definitions } from '../src/core/generators/legacy-2007-autumn-pm-01-05';
import { autumn2007Pm2Pages } from '../src/core/generators/legacy-2007-autumn-pm-2';
import { autumn2007Pm3Pages } from '../src/core/generators/legacy-2007-autumn-pm-3';
import { autumn2007Pm4Pages } from '../src/core/generators/legacy-2007-autumn-pm-4';
import { autumn2007Pm5Pages } from '../src/core/generators/legacy-2007-autumn-pm-5';
import { pageAlt } from '../src/core/generators/legacy-2007-autumn-pm-01-05-shared';

const firstPages = [7, 10, 12, 16];
const pagesFor = [autumn2007Pm2Pages, autumn2007Pm3Pages, autumn2007Pm4Pages, autumn2007Pm5Pages];
const topics = [['データベース', 'SQL'], ['信頼性', '通信回線'], ['プログラミング', 'スタック'], ['プログラム設計', 'データ処理']];
const keywords = [
  ['集配センタ', '関係データベース', '主キー', 'COUNT', '副問合せ', '移送履歴'],
  ['バスタブ曲線', '平均故障間隔', '平均修復時間', 'MTBF', 'MTTR', '偶発故障期間'],
  ['FloatFormat', 'スタック', '基数変換', '添字', '小数の切捨て'],
  ['通信販売', '流れ図', '中間表', '購入番号', '商品カテゴリ', '購入済商品'],
];
export const autumn2007Pm01To05Specs: Stage3AfternoonQuestionSpec[] = definitions.map((definition, index) => {
  const first = firstPages[index], blocks = pagesFor[index](0);
  return {
    number: index + 2, title: definition.title, definition, pages: blocks.map((_, offset) => first + offset),
    original: definition.build([...definition.reference]), originalPageAlt: pageAlt(blocks, first),
    topics: topics[index], keywords: keywords[index],
  };
});
