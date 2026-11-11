import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2010AutumnPm05To08Definitions, autumn2010Pm0508OriginalPageAlt } from '../src/core/generators/legacy-2010-autumn-pm-05-08';
const learning=[
  {topics:['ソフトウェア開発','ファイル処理','在庫管理'],keywords:['先入先出法','棚卸金額','順ファイル','突合せ','整列','受入れ','払出し']},
  {topics:['サービスマネジメント','個人情報保護','委託管理'],keywords:['安全管理措置','監査証跡','アクセス制御','物理的保護','2010年当時のガイドライン']},
  {topics:['経営管理','財務分析','為替'],keywords:['営業利益率','経常利益率','ROA','総資産回転率','現地通貨','子会社評価']},
  {topics:['アルゴリズム','疑似言語','ビット演算'],keywords:['2の補数','算術右シフト','Booth','符号拡張','乗算']},
];
export const autumn2010Pm05To08Specs:Stage3AfternoonQuestionSpec[]=legacy2010AutumnPm05To08Definitions.map((definition,i)=>{
  const number=([5,6,7,8] as const)[i], originalPageAlt=autumn2010Pm0508OriginalPageAlt(number);
  return {number,title:definition.title,definition,original:definition.build([...definition.reference]),
    pages:Object.keys(originalPageAlt).map(Number),originalPageAlt,...learning[i]};
});
