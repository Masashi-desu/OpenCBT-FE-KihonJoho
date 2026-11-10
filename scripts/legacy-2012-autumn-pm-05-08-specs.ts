import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import {
  autumn2012Pm0508OriginalPageAlt, legacy2012AutumnPm05To08Definitions,
} from '../src/core/generators/legacy-2012-autumn-pm-05-08';

const topics=[
  ['通信講座','受講管理','ファイル処理'],
  ['データ管理','棚卸','媒体管理'],
  ['在庫管理','生産管理','棚卸資産'],
  ['アルゴリズム','最短距離','疑似言語'],
];
const keywords=[
  ['修了判定','割引残存期間','提出回数','起算日','索引順編成'],
  ['磁気テープ','外部保管','実地確認','貸出し','機密情報'],
  ['検品中在庫','良品在庫','不良品在庫','出荷予定','キャッシュフロー'],
  ['Warshall-Floyd法','鉄道','基幹駅','距離行列','対称性'],
];

export const autumn2012Pm05To08Specs:Stage3AfternoonQuestionSpec[]=legacy2012AutumnPm05To08Definitions.map((definition,i)=>{
  const number=([5,6,7,8] as const)[i], originalPageAlt=autumn2012Pm0508OriginalPageAlt(number);
  return {number,title:definition.title,definition,original:definition.build([...definition.reference]),pages:Object.keys(originalPageAlt).map(Number),
    originalPageAlt,topics:topics[i],keywords:keywords[i]};
});
