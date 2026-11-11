import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { autumn2009Pm0508OriginalPageAlt, legacy2009AutumnPm05To08Definitions } from '../src/core/generators/legacy-2009-autumn-pm-05-08';

const learning = [
  { topics:['オブジェクト指向設計','UML','業務分析'], keywords:['航空券発券','クラス図','シーケンス図','多重度','操作'] },
  { topics:['サービスマネジメント','インシデント管理','問題管理'], keywords:['障害管理DB','通報','解決予定日時','変更管理','監査'] },
  { topics:['システム戦略','投資効果','損益計算'], keywords:['投資回収期間','営業利益','売上原価','定額償却','相乗効果'] },
  { topics:['アルゴリズム','数値計算','疑似言語'], keywords:['ニュートン法','Horner法','微分','浮動小数点','丸め誤差','けた落ち'] },
];
export const autumn2009Pm05To08Specs: Stage3AfternoonQuestionSpec[] = legacy2009AutumnPm05To08Definitions.map((definition,index) => {
  const number = ([5,6,7,8] as const)[index];
  const originalPageAlt = autumn2009Pm0508OriginalPageAlt(number);
  return {
    number, title:definition.title, definition, original:definition.build([...definition.reference]),
    pages:Object.keys(originalPageAlt).map(Number), originalPageAlt, ...learning[index],
  };
});
