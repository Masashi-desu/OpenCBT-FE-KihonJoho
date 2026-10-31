import{field,p,figure,strings,variableNotes,type GenerationDefinition,type GeneratedBody}from'./definition';
import cases from'./legacy-2017-autumn-planning-cases.json';
import{legacy2017AutumnPlanningProfile,planningSalesSolution,planningSalesAlt,planningHours}from'./legacy-2017-autumn-planning-model';
/** Dedicated annual candidates only. No shared registry/profile admission. */
export const legacy2017AutumnPlanningDefinitions:GenerationDefinition[]=cases.map(r=>({source:`2017h29a-fe-am-${r.number}`,title:r.title,sourceAnswer:r.sourceAnswer,version:'3.2.0',fields:[field('対象・実条件',0,r.scenarios.length-1)],reference:[0],...(r.fixed?{answerVariation:'fixed' as const}:{}),notes:variableNotes+r.notes,
 build(values){if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>=r.scenarios.length)throw Error('PARAMETER_CONSTRAINT');const s=r.scenarios[values[0]],prompt:GeneratedBody['prompt']=[p(s.stem)];let choices=[...s.choices],correctIndex=s.correctIndex;if(r.number===61){const result=planningSalesSolution(values);choices=result.choices.map(planningHours);correctIndex=result.choices.indexOf(result.correct);prompt.push(figure(legacy2017AutumnPlanningProfile,[...values],'1日の業務活動の時間分析表',planningSalesAlt(values)));}return{prompt,choices:strings(choices),correctIndex,explanation:s.explanation};}
}));
