import {field,p,strings,variableNotes,type GenerationDefinition} from './definition';
import cases from './legacy-2019-autumn-remaining-am-cases.json';
/** Source-local candidates for 2019 autumn AM. No annual/public registration.
 * Q55/Q57/Q65 remain in the full80 inventory with unresolved material conditions. */
export const legacy2019AutumnRemainingAmDefinitions:GenerationDefinition[]=cases.map(row=>{
 const fixedMeaning=[62,70,73,80].some(n=>row.source.endsWith('-'+n));
 return {source:row.source,title:row.title,sourceAnswer:row.sourceAnswer,version:'3.2.0',fields:[field('sourceCondition',0,row.cases.length-1)],reference:[0],...(fixedMeaning?{answerVariation:'fixed' as const}:{}),notes:variableNotes+' 当該原本の文章問題と四択の役割を保持する。対象概念・条件・機構を変更した有限候補。共通表記ルールの通常アプリ統合と権利ノードの最終入場は親工程。',build:values=>{
  if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>=row.cases.length)throw Error('PARAMETER_CONSTRAINT');
  const c=row.cases[values[0]];
  return {prompt:c.stem.split('\n').map(p),choices:strings([...c.choices]),correctIndex:c.correctIndex,explanation:c.explanation};
 }};
});
