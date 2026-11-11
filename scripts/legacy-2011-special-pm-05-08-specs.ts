import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2011SpecialPm05To08Definitions, special2011Pm0508OriginalPageAlt } from '../src/core/generators/legacy-2011-special-pm-05-08';

const learning = [
  { topics:['システム開発','ファイル処理','集計'], keywords:['順ファイル','あて先作成','売上伝票','顧客番号','ガウス記号'] },
  { topics:['プロジェクト管理','進捗管理','EVM'], keywords:['PV','AC','EV','SV','CV','CPI','SPI','工数'] },
  { topics:['経営戦略','ゲーム理論','出店戦略'], keywords:['消費者セグメント','利得行列','支配戦略','市場環境'] },
  { topics:['アルゴリズム','組合せ','疑似言語'], keywords:['Main','Init','Next','Dump','配列S','二値','全組合せ'] },
];
export const special2011Pm05To08Specs: Stage3AfternoonQuestionSpec[] = legacy2011SpecialPm05To08Definitions.map((definition,i)=>{
  const number=([5,6,7,8] as const)[i], originalPageAlt=special2011Pm0508OriginalPageAlt(number);
  return {
    number,title:definition.title,definition,original:definition.build([...definition.reference]),
    pages:Object.keys(originalPageAlt).map(Number),originalPageAlt,...learning[i],
  };
});
