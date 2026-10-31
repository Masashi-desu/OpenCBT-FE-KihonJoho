import {field,figure,p,strings,variableNotes,type GenerationDefinition,type GeneratedBody} from './definition';
import cases from './legacy-2017-autumn-quality-cases.json';
import {legacy2017AutumnQualityProfile,qualityCriticalAlt,qualityCriticalSolution} from './legacy-2017-autumn-quality-model';
/** Approved source design, unregistered annual candidates. */
export const legacy2017AutumnQualityDefinitions:GenerationDefinition[]=cases.map(r=>({
 source:`2017h29a-fe-am-${r.number}`,title:r.title,sourceAnswer:r.sourceAnswer,version:'3.2.0',
 fields:r.number===58?['記録確認の不備','記録保管の不備','例外記録の不備','計画自己承認'].map(n=>field(n,0,1)):[field('対象・実条件',0,r.scenarios.length-1)],
 reference:r.number===58?[0,0,0,1]:[0],...(r.fixed?{answerVariation:'fixed' as const}:{}),notes:variableNotes+r.notes,
 build(values){let v:number;if(r.number===58){if(values.length!==4||values.some(x=>!Number.isInteger(x)||x<0||x>1)||values.reduce((a,b)=>a+b,0)!==1)throw Error('PARAMETER_CONSTRAINT');v=[3,0,1,2].indexOf(values.indexOf(1));}else{if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>=r.scenarios.length)throw Error('PARAMETER_CONSTRAINT');v=values[0];}
 const s=r.scenarios[v],prompt:GeneratedBody['prompt']=[p(s.stem)];let correctIndex=s.correctIndex,explanation=s.explanation;
 if(r.number===53){const solved=qualityCriticalSolution([v]);if(solved.paths.length!==1)throw Error('PARAMETER_CONSTRAINT');correctIndex=s.choices.findIndex(c=>c.replaceAll('→','')===solved.paths[0]);if(correctIndex<0)throw Error('PARAMETER_CONSTRAINT');prompt.push(figure(legacy2017AutumnQualityProfile,[v],'プロジェクト活動と所要日数',qualityCriticalAlt([v])));explanation=s.choices.map(c=>{const total=c.replaceAll('→','').split('').reduce((t,k)=>t+solved.weights[k],0);return `経路${c}の合計は${total}日。`;}).join(' ')+`全7経路で最長の${s.choices[correctIndex]}は${solved.days}日となり、先行関係を保ったプロジェクトの完了時点を決める。`;}
 return {prompt,choices:strings([...s.choices]),correctIndex,explanation};}
}));
