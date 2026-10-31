import{field,p,figure,table,strings,variableNotes,type GenerationDefinition,type GeneratedBody}from'./definition';
import cases from'./legacy-2017-autumn-business-cases.json';
import{legacy2017AutumnBusinessProfile,employmentDiagramAlt}from'./legacy-2017-autumn-business-model';
/** Annual candidates only; explicit source-specific diagram remains unregistered. */
export const legacy2017AutumnBusinessDefinitions:GenerationDefinition[]=cases.map(r=>({source:`2017h29a-fe-am-${r.number}`,title:r.title,sourceAnswer:r.sourceAnswer,version:'3.2.0',fields:[field('対象・実条件',0,r.scenarios.length-1)],reference:[0],...(r.fixed?{answerVariation:'fixed' as const}:{}),notes:variableNotes+r.notes,
 build(values){if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>=r.scenarios.length)throw Error('PARAMETER_CONSTRAINT');const s=r.scenarios[values[0]],prompt:GeneratedBody['prompt']=[p(s.stem)];if(r.number===71)prompt.push(table('基本要素とデバイス・サービスの例', ['基本要素','デバイス・サービスの例'],[['データの収集','a'],['データの伝送','b'],['データの解析','c'],['データの活用','d']]));if(r.number===79)prompt.push(figure(legacy2017AutumnBusinessProfile,[0],'企業と労働者の関係',employmentDiagramAlt));return{prompt,choices:strings(s.choices),correctIndex:s.correctIndex,explanation:s.explanation};}
}));
