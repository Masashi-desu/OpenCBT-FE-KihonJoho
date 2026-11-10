import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { legacy2011AutumnPm05To08Definitions, autumn2011Pm0508OriginalPageAlt } from '../src/core/generators/legacy-2011-autumn-pm-05-08';
import { topics } from '../src/core/generators/legacy-2011-autumn-pm-05-08-source';

const keywords = [
  ['UML','多重度','汎化','集約','派生属性'],
  ['人月','配分月数','生産性','開発スケジュール','前倒し'],
  ['バブルチャート','市場占有率','前年比','売上数量','市場規模'],
  ['状態遷移','構文解析','算術演算子','代入文','演算優先順位'],
];

export const autumn2011Pm05To08Specs: Stage3AfternoonQuestionSpec[] = legacy2011AutumnPm05To08Definitions.map((definition,i)=>{
  const number=([5,6,7,8] as const)[i], originalPageAlt=autumn2011Pm0508OriginalPageAlt(number);
  return {number,title:definition.title,definition,original:definition.build([...definition.reference]),
    pages:Object.keys(originalPageAlt).map(Number),originalPageAlt,topics:topics[i],keywords:keywords[i]};
});
