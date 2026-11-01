import assert from 'node:assert/strict';
import type { Asset, Attribution, Bundle, Question, Rights, Source, SourceRef, Template } from '../src/core/types';
import { contentHash } from '../src/core/hash';
import { bindBodyAnswers, ownContexts, type GenerationDefinition } from '../src/core/generators/definition';

export type Stage3MorningFact = {
  source: string; number: number; page: number; officialKey: string; alt: string;
  crop: { path: string; sha256: string; width: number; height: number; byteLength: number; cropBox: number[] };
};
export type Stage3MorningRecords = Pick<Bundle,'questions'|'templates'|'assets'|'sets'|'exams'|'sources'|'rights'>;
const collection = '2016h28h-fe-am', sourceId = 'source-ipa-'+collection;
export function spring2016SourceRef(n?: number, page?: number, answer=false): SourceRef {
  return {sourceId:sourceId+(answer?'-ans':'-qs'),locator:{year:2016,period:'春期',exam:'基本情報技術者試験',timeSlot:'午前',subject:'旧制度・午前',
    section:`平成28年度 春期 基本情報技術者試験 午前${n?' 問'+n:''}${answer?' 解答例':''}`,
    ...(page?{page}:{}),...(n?{questionNumber:String(n)}:{})}};
}
/** Constructs an excluded review candidate. It never writes public data or
 * grants release admission. The caller must supply independently reviewed
 * source facts and actual material metadata for each selected original. */
export async function makeStage3MorningRecords(input: {
  facts: readonly Stage3MorningFact[]; definitions: readonly GenerationDefinition[];
  commonAssets: readonly Asset[]; sources: Source[]; rights: Rights[];
  checkedOn: string; supplementaryRights?: Readonly<Record<number, string[]>>;
}): Promise<Stage3MorningRecords> {
  const numbers=input.facts.map(f=>f.number);
  assert(numbers.length>0 && new Set(numbers).size===numbers.length);
  assert.deepEqual(numbers,[...numbers].sort((a,b)=>a-b));
  assert(input.commonAssets.length===2);
  const own:Attribution={origin:'original',sourceRefs:[],rightsRefs:['rights-original'],creatorIds:['codex']};
  const official=(n:number,page:number,answer=false):Attribution=>({origin:'official',sourceRefs:[spring2016SourceRef(n,page,answer)],
    rightsRefs:['rights-ipa-'+collection,...(input.supplementaryRights?.[n]??[])],creatorIds:['ipa']});
  const records:Stage3MorningRecords={questions:[],templates:[],assets:[...structuredClone(input.commonAssets)],sets:[],exams:[],sources:structuredClone(input.sources),rights:structuredClone(input.rights)};
  for(const fact of input.facts){
    assert(Number.isInteger(fact.number)&&fact.number>=1&&fact.number<=80);
    assert.equal(fact.source,collection+'-'+fact.number);
    assert(fact.alt.length>30 && fact.crop.width>0 && fact.crop.height>0 && fact.crop.byteLength>0);
    const candidates=input.definitions.filter(d=>d.source===fact.source);assert.equal(candidates.length,1);
    const definition=candidates[0],body=definition.build([...definition.reference]);
    assert.equal(body.choices.length,4);assert.equal(definition.sourceAnswer,fact.officialKey);
    assert.equal('アイウエ'[body.correctIndex!],fact.officialKey,'reference must match the separate official key');
    const asset:Asset={schemaVersion:'3.0.0',id:'asset-ipa-'+fact.source,path:'assets/stage3-'+fact.source+'.png',
      mediaType:'image/png',sha256:fact.crop.sha256,width:fact.crop.width,height:fact.crop.height,byteLength:fact.crop.byteLength,
      alt:fact.alt,attribution:official(fact.number,fact.page)};
    const attribution=official(fact.number,fact.page), adapted:Attribution={...structuredClone(attribution),origin:'adapted',creatorIds:['codex'],
      sourceRefs:[...structuredClone(attribution.sourceRefs),spring2016SourceRef(undefined,2),spring2016SourceRef(undefined,3)],
      rightsRefs:[...attribution.rightsRefs,'rights-original']};
    const original:Question={schemaVersion:'3.0.0',id:'question-ipa-'+fact.source,revision:1,lifecycle:'active',subject:'A',
      learning:{area:fact.number<=50?'technology':fact.number<=61?'management':'strategy',tags:['legacy-2016'],topics:[definition.title],keywords:[definition.title]},
      origin:{kind:'official_reprint',sourceRefs:[spring2016SourceRef(fact.number,fact.page),spring2016SourceRef(undefined,2),spring2016SourceRef(undefined,3)],derivedFrom:[],isModified:false,modificationBasis:'official_source',
        changes:[{at:input.checkedOn+'T00:00:00Z',actorId:'codex',kind:'layout',summary:'原画像・原問番号・全選択肢・注記と共通表記を保持',details:`原PDF p${fact.page}。画像切出し座標${fact.crop.cropBox.join(',')}。構造化した完全な代替説明を保持。`,affectsAnswer:false}]},
      contributors:[{actorId:'ipa',role:'author'},{actorId:'codex',role:'editor'},{actorId:'codex',role:'verifier'}],
      prompt:{attribution,blocks:[{type:'image',assetId:asset.id,caption:'問'+fact.number}]},
      contexts:input.commonAssets.map((a,i)=>({id:`context-${collection}-common-${i+2}`,title:`問題文中で共通に使用される表記ルール（p.${i+2}）`,presentation:'text_figure',
        content:{attribution:structuredClone(a.attribution),blocks:[{type:'image',assetId:a.id,caption:'問題文中で共通に使用される表記ルール'}]}})),
      contextRefs:[],choices:Array.from('アイウエ',(label,i)=>({id:'choice-original-'+(i+1),content:{attribution:structuredClone(attribution),blocks:[{type:'paragraph',text:label}]}})),
      correctAnswer:{choiceId:'choice-original-'+('アイウエ'.indexOf(fact.officialKey)+1),attribution:official(fact.number,1,true)},
      explanation:{attribution:structuredClone(own),blocks:[{type:'paragraph',text:body.explanation}]},
      assetRefs:[asset.id,...input.commonAssets.map(a=>a.id)],choiceShuffleAllowed:false,distribution:'excluded',
      review:{checkedOn:input.checkedOn,reviewerIds:['codex'],checks:{publication:'pass',terms:'pass',thirdParty:'pass',transcription:'pass',answer:'pass',explanation:'pass'},
        notes:'原画像・全注記・全択・公式正答と照合。独立内容検証は当該問の査読資料とテスト、素材条件・通常Appの統合受入はS3-001の配布査読記録に対応付ける。確認主体はCodex AI。'}};
    original.contextRefs=original.contexts.map(c=>c.id);
    const base=structuredClone(original);base.id='question-template-source-'+fact.source;base.origin.kind='official_adaptation';base.origin.isModified=true;
    base.origin.derivedFrom=[{questionId:original.id,revision:1}];base.origin.changes.push({at:input.checkedOn+'T00:00:00Z',actorId:'codex',kind:'wording',summary:'原形式を保った可変条件の基準問題を作成',details:definition.notes,affectsAnswer:true,answerDetails:body.explanation});
    let diagram=0;
    const blocks=(xs:Question['prompt']['blocks'])=>structuredClone(xs).map(b=>b.type==='diagram'?{...b,id:`diagram-${fact.source}-${++diagram}`,attribution:structuredClone(adapted)}:b);
    base.prompt={attribution:structuredClone(adapted),blocks:blocks(body.prompt)};
    base.choices=body.choices.map((xs,i)=>({id:'choice-value-'+(i+1),content:{attribution:structuredClone(adapted),blocks:blocks(xs)}}));
    base.contexts=ownContexts(body,adapted);base.contextRefs=base.contexts.map(c=>c.id);base.assetRefs=[];
    bindBodyAnswers(base,body,own);base.choiceShuffleAllowed=fact.number!==8;base.learning.tags.push('parameterized');
    const template:Template={schemaVersion:'3.0.0',id:'template-source-'+fact.source,revision:1,title:definition.title,
      baseQuestionRef:{questionId:base.id,revision:1},generatorRef:{id:'generator-source-'+fact.source,version:definition.version??'3.2.0'},
      parameterDomain:{values:{length:definition.fields.length,minimum:Math.min(...definition.fields.map(f=>f.minimum)),maximum:Math.max(...definition.fields.map(f=>f.maximum))},fields:structuredClone(definition.fields)},
      referenceParameters:{values:[...definition.reference]},attribution:adapted,editorIds:['codex'],lifecycle:'active',distribution:'excluded',bindingBasis:'official_source',originalContentSha256:await contentHash(base)};
    records.questions.push(original,base);records.templates.push(template);records.assets.push(asset);
  }
  const count=numbers.length;
  records.exams.push(...(['study','practice'] as const).map(mode=>({schemaVersion:'3.0.0',id:`exam-${collection}-${mode}`,revision:1,title:`2016年度 春期 旧午前（${mode==='study'?'学習・復習':'時間付き練習'}）`,subject:'A' as const,mode,
    questionCount:count,...(mode==='practice'?{timeLimitSeconds:9000,practiceScope:count===80?'full_exam' as const:'public_subset' as const}:{}),
    questionOrder:'set' as const,choiceOrder:'fixed' as const,duplicatePolicy:'lineage_unique' as const,shortagePolicy:'block' as const})));
  records.sets.push({schemaVersion:'3.0.0',id:'set-annual-'+collection,revision:1,title:'2016年度 春期 午前',subject:'A',
    questionRefs:numbers.map(n=>({questionId:`question-ipa-${collection}-${n}`,revision:1})),examConfigRefs:records.exams.map(e=>({id:e.id,revision:1})),distribution:'excluded',generationBindings:[]});
  return records;
}
