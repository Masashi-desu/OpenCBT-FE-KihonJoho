import type{Attribution,Question,Template}from'../types';
import{DataError}from'../errors';
import{sortedJson}from'../hash';
import type{GenerationDefinition}from'./definition';
const sources=['2017h29h-fe-am-65','2019r01a-fe-am-65'];
export const commonFramework65GuideSource='source-ipa-cf2013-guidance-q65-20261025';
export const commonFramework65GuideRight='rights-ipa-cf2013-guidance-q65-cc-by-sa-21jp-20261025';
export const commonFramework65AdaptationRight='rights-common-framework65-adaptations-cc-by-sa-21jp';
const equal=(a:unknown,b:unknown)=>JSON.stringify(sortedJson(a))===JSON.stringify(sortedJson(b));
const denied=():never=>{throw new DataError('SOURCE_MATERIAL','問65の査読済み本文・素材条件・生成参照が一致しません');};
export function commonFramework65GuideRefs(){return[12,13].map(page=>({sourceId:commonFramework65GuideSource,locator:{page,section:'2.2.3.1 項1(3)及び項1(4)技術要件(c)(d)の対応説明'}}));}
export function commonFramework65ExplanationAttribution():Attribution{return{origin:'adapted',sourceRefs:commonFramework65GuideRefs(),rightsRefs:[commonFramework65GuideRight,commonFramework65AdaptationRight],creatorIds:['codex']};}
function target(t:Template){return sources.find(source=>t.generatorRef.id==='generator-source-'+source);}
function credits(t:Template,d:GenerationDefinition){
 const source=target(t);if(!source)return;if(d.source!==source||(d.version??'3.2.0')!=='3.2.0')denied();
 const spring=d.source.startsWith('2017'),collection=d.source.replace(/-65$/,''),year=spring?2017:2019,period=spring?'春期':'秋期',page=spring?31:32,section=`${year}年度 ${period} 基本情報技術者試験 午前 問65`;
 const exam={sourceId:'source-ipa-'+collection+'-65-qs',locator:{year,period,exam:'基本情報技術者試験',subject:'午前',timeSlot:'午前',questionNumber:'65',page,section}};
 const prompt:Attribution={origin:'adapted',sourceRefs:[exam],rightsRefs:['rights-ipa-'+collection+'-65-preparation'],creatorIds:['codex']},choices:Attribution={origin:'adapted',sourceRefs:[exam,...commonFramework65GuideRefs()],rightsRefs:[...prompt.rightsRefs,commonFramework65GuideRight,commonFramework65AdaptationRight],creatorIds:['codex']};const common={sourceId:'source-ipa-2019r01a-fe-am-common-p2',locator:{page:2,year:2019,period:'秋期',exam:'基本情報技術者試験',subject:'午前',timeSlot:'午前',section:'問題文中で共通に使用される表記ルール'}};return{d,prompt,choices,origin:[exam,...commonFramework65GuideRefs(),...(spring?[]:[common])],commonId:spring?undefined:'context-2019r01a-fe-am-common'};
}
function frame(q:Question,t:Template,d:GenerationDefinition){const c=credits(t,d);if(!c)return;
 if(t.id!=='template-source-'+c.d.source||t.revision!==1||t.baseQuestionRef.questionId!=='question-template-source-'+c.d.source||t.baseQuestionRef.revision!==1||t.generatorRef.version!=='3.2.0'||t.bindingBasis!=='official_source'||!equal(t.referenceParameters,{values:[0]})||!equal(t.editorIds,['codex'])||!equal(t.attribution,c.choices)||
 !equal(q.prompt.attribution,c.prompt)||q.choices.length!==4||q.choices.some(x=>!equal(x.content.attribution,c.choices))||!equal(q.explanation.attribution,commonFramework65ExplanationAttribution())||
 !equal(q.origin.sourceRefs,c.origin)||!equal(q.contextRefs,c.commonId?[c.commonId]:[])||q.contexts.length!==(c.commonId?1:0)||q.contexts.some(x=>x.id!==c.commonId))denied();return c;
}
/** Exactly two source IDs, current version, canonical reference body, and
 * exact material credits. No arbitrary base attribution is trusted or copied. */
export function bindCommonFramework65Explanation(q:Question,base:Question,t:Template,d:GenerationDefinition){
 const c=frame(base,t,d);if(!c)return;
 const r=c.d.build([...c.d.reference]);if(base.id!==t.baseQuestionRef.questionId||base.revision!==1||base.origin.kind!=='official_adaptation'||!base.origin.isModified||base.origin.modificationBasis!=='official_source'||!equal(base.choices.map(x=>x.id),['choice-value-1','choice-value-2','choice-value-3','choice-value-4'])||!equal(base.origin.derivedFrom,[{questionId:'question-ipa-'+c.d.source,revision:1}])||
 !equal(base.prompt.blocks,r.prompt)||!equal(base.choices.map(x=>x.content.blocks),r.choices)||!equal(base.explanation.blocks,[{type:'paragraph',text:r.explanation}])||base.correctAnswer.choiceId!=='choice-value-2')denied();
 q.explanation.attribution=commonFramework65ExplanationAttribution();
}
/** Only the four complete reviewed bodies may issue through this route. */
export function validateCommonFramework65Materials(q:Question,t:Template,d:GenerationDefinition){
 const c=frame(q,t,d);if(!c)return;
 if(![0,1,2,3].some(v=>{const body=c.d.build([v]);return equal(q.prompt.blocks,body.prompt)&&equal(q.choices.map(x=>x.content.blocks),body.choices)&&equal(q.explanation.blocks,[{type:'paragraph',text:body.explanation}])&&q.correctAnswer.choiceId==='choice-value-2';}))denied();
}
