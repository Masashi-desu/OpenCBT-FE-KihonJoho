/** Pure excluded staging. Application/catalog admission is a separate whole-booklet step. */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
import assert from "node:assert/strict";
import type {Question, Attribution, SourceRef, Block} from "../src/core/types";
import {schema} from "../src/core/validation";
import {contentHash} from "../src/core/hash";
import {bindBodyAnswers, type GeneratedBody} from "../src/core/generators/definition";
import {validateAnswerDefinition} from "../src/core/answers";
import {legacy2017Pm9Definition as d} from "../src/core/generators/legacy-2017-pm9";
import {legacy2017Pm9Profiles, legacy2017Pm9Figure} from "../src/core/generators/legacy-2017-pm9-model";
import type {Legacy2017Pm4Input, Legacy2017Pm4Bundle} from "./import-legacy-2017-pm4";
const pages=[41,42,43,44,45,46],checkedOn="2026-10-26",at="2026-10-26T08:00:00Z",publisher="独立行政法人情報処理推進機構（IPA）",rightsId="rights-ipa-2017h29h-fe-pm-9";
const ref=(page:number,answer=false):SourceRef=>({sourceId:`source-ipa-2017h29h-fe-pm-9-${answer?'ans':'qs'}`,locator:{section:`平成29年度 春期 基本情報技術者試験 午後 問9${answer?' 解答例':''}`,page,year:2017,period:'春期',exam:'基本情報技術者試験',subject:'午後',timeSlot:'午後',questionNumber:'9'}});
const official=(ps:readonly number[],answer=false):Attribution=>({origin:'official',sourceRefs:ps.map(p=>ref(p,answer)),rightsRefs:[rightsId],creatorIds:['ipa']});
const adapted=(ps:readonly number[]=pages):Attribution=>({origin:'adapted',sourceRefs:ps.map(p=>ref(p)),rightsRefs:[rightsId,'rights-original'],creatorIds:['codex']});
const own:Attribution={origin:'original',sourceRefs:[],rightsRefs:['rights-original'],creatorIds:['codex']};
const choicePage=(i:number)=>i<8?43:i<15?44:46;
function credit(blocks:Block[]) {return blocks.map(b=>{const copy=structuredClone(b);if(copy.type==='diagram'&&copy.scene.kind==='source_figure'){const i=legacy2017Pm9Profiles.indexOf(copy.scene.profile as typeof legacy2017Pm9Profiles[number]);assert(i>=0);copy.attribution=adapted([[41],[42],[45],[46],[46],[43],[44],[44],[46]][i]);}return copy;});}
export function bindLegacy2017Pm9Body(base:Question,body:GeneratedBody){
  assert.equal(base.id,'question-template-source-2017h29h-fe-pm-9');const q=structuredClone(base);
  q.prompt={attribution:adapted(),blocks:credit(body.prompt)};
  q.choices=body.choices.map((blocks,i)=>({id:`choice-value-${i+1}`,content:{attribution:adapted([choicePage(i)]),blocks:credit(blocks)}}));
  q.choiceShuffleAllowed=false;bindBodyAnswers(q,body,structuredClone(own));q.explanation={attribution:structuredClone(own),blocks:[{type:'paragraph',text:body.explanation}]};
  return q;
}
export function assessLegacy2017Pm9Schema(q:Question) {
  validateAnswerDefinition(q);assert.equal(q.choiceShuffleAllowed,false);assert.equal(q.distribution,'excluded');assert.equal(q.choices.length,25);
  assert.deepEqual(q.answerParts!.map(p=>p.choiceIds.length),[8,8,8,4,3,6,4]);
  if(q.origin.kind==='official_reprint'){schema('question',q);return{status:'pass' as const,pendingPaths:[] as string[]};}
  const managedFigurePaths:string[]=[];
  q.prompt.blocks.forEach((b,i)=>{if(b.type!=='diagram')return;assert(b.scene.kind==='source_figure');const f=legacy2017Pm9Figure(b.scene.profile,b.scene.values);assert.equal(b.caption,f.caption);assert.equal(b.alt,f.alt);managedFigurePaths.push(`/prompt/blocks/${i}`);});
  assert.equal(managedFigurePaths.length,9);schema('question',q);
  return{status:'pass' as const,pendingPaths:[] as string[],managedFigurePaths};
}
export async function legacy2017Pm9Records({collection,rendered}:Legacy2017Pm4Input) {
  assert.equal(collection.id,'2017h29h-fe-pm');
  for(const [role,suffix,sha,bytes] of [['questionPaper','qs','7d976c989149a8027c45cce63e420af0b4da8967e563146220dfa1e50eba43c8',13923067],['answerPaper','ans','7d83ed5839b533c1a2bc804698e08eb6bb55865ef1aef3f74e15c42faad7772b',202195]] as const){assert.equal(collection[role].url,`https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fzx1-att/2017h29h_fe_pm_${suffix}.pdf`);assert.equal(collection[role].sha256,sha);assert.equal(collection[role].byteLength,bytes);assert.deepEqual({sha256:rendered.papers[role].sha256,byteLength:rendered.papers[role].byteLength},{sha256:sha,byteLength:bytes});}
  assert.deepEqual(rendered.pages.map(p=>p.page),pages);
  const bundle:Legacy2017Pm4Bundle={sources:[],rights:[],assets:[],questions:[],templates:[]};
  for(const answer of [false,true]){const paper=collection[answer?'answerPaper':'questionPaper'];bundle.sources.push({schemaVersion:'3.0.0',id:`source-ipa-2017h29h-fe-pm-9-${answer?'ans':'qs'}`,title:`平成29年度 春期 基本情報技術者試験 午後 問9 ${answer?'解答例7欄':'C・答案採点全6頁'}`,publisher,url:paper.url,sha256:paper.sha256,checkedOn,type:answer?'official_answer':'official_problem',availability:'officially_published',scope:answer?'ANS物理1頁の問9 a〜g正答。':'QS物理41〜46の全本文・プログラム・表・図・全解答群。C別附属なし。',sections:answer?['p1 問9 設問1 a/b/c・設問2 d/e・設問3 f/g']:pages.map(p=>`p${p} 問9`),dateNote:'年度ページの掲載日を個別PDFの初回公表日と断定しない。',facts:['旧午後150分、問9〜13から1問を選択。現行科目Bの形式と区別。','unsigned intは16bit。末尾の多重マークは順不同集計から除外。'],supports:['annual-sets','random-mix','answer-validation'],limits:'問9局所素材・Cプログラムのみ。CASL/JIS/表計算資料の権利へ広げない。'});}
  bundle.rights.push({schemaVersion:'3.0.0',id:rightsId,holders:[publisher],basis:'official_policy',checkedOn,evidence:[{sourceId:'source-ipa-faq',locator:{section:'その他／試験の過去問題の使用方法／留意点'}},...pages.map(p=>ref(p)),ref(1,true)],scope:'2017春午後問9 p41〜46の全6頁、図1〜4、引数表・採点表、2プログラムと13行差替、全25固有択41参照7解答欄、ANS1の該当7正答。',uses:{repositoryRedistribution:'allowed',browserDisplay:'allowed',adaptation:'allowed'},licenseId:'LicenseRef-IPA-Public-Questions',modificationNoticeRequired:true,attributionText:'出典：平成29年度 春期 基本情報技術者試験 午後 問9／©2017 独立行政法人情報処理推進機構（IPA）',thirdParty:{status:'none_identified',notes:'問9全6頁の説明、独自採点プログラム、図表、全解答群を個別確認。言語C一般の構文説明と外部規格本文の引用を区別し、具体的な第三者資料の転載を確認範囲で特定しなかった。p88注意9でも言語Cの別附属は指定されていない。',rightsRefs:[]},assessmentNotes:'IPA FAQの教育目的・出典・改変表示を満たす用途別プロジェクト判断。同梱・ブラウザ・学習用生成の範囲に限定し、個別許諾取得や包括的法的保証を意味しない。原図と改変図にIPAの権利を保持し、独自解説にrights-originalを分離する。'});
  for(const p of rendered.pages){assert(p.width>0&&p.height>0&&p.byteLength>0);assert.match(p.sha256,/^[a-f0-9]{64}$/);bundle.assets.push({schemaVersion:'3.0.0',id:`asset-ipa-2017h29h-fe-pm-9-p${p.page}`,path:`assets/${p.name}`,mediaType:'image/webp',sha256:p.sha256,width:p.width,height:p.height,byteLength:p.byteLength,alt:`2017春期旧午後問9 C 原資料p${p.page}。全本文・プログラム・図表・注記・解答群を原頁のまま表示。`,attribution:official([p.page])});}
  const body=d.build([0]);const q:Question={schemaVersion:'3.0.0',id:'question-ipa-2017h29h-fe-pm-9',revision:1,lifecycle:'active',subject:'B',learning:{area:'technology',tags:['legacy-2017','legacy-afternoon','language-c'],topics:['C言語','ビット演算','プログラムの追跡'],keywords:['マークシート','unsigned int','論理積','順不同採点']},origin:{kind:'official_reprint',sourceRefs:pages.map(p=>ref(p)),derivedFrom:[],changes:[{at,actorId:'codex',kind:'layout',summary:'原6頁と7独立欄を対応',details:'全図表・16bit前提・全解答群を保持。a/b/cは同8択を同順で独立参照し、重複禁止や欄の順不同を追加しない。',affectsAnswer:false}],isModified:false,modificationBasis:'official_source'},contributors:[{actorId:'ipa',role:'author'},{actorId:'codex',role:'editor'},{actorId:'codex',role:'verifier'}],contexts:[],contextRefs:[],prompt:{attribution:official(pages),blocks:bundle.assets.map(a=>({type:'image',assetId:a.id,caption:`原資料 問9 p${a.id.split('-p').pop()}`}))},choices:body.choices.map((blocks,i)=>({id:`choice-original-${i+1}`,content:{attribution:official([choicePage(i)]),blocks:structuredClone(blocks)}})),answerParts:body.answerParts!.map(p=>({...structuredClone(p),choiceIds:p.choiceIds.map(s=>s.replace('value','original'))})),correctAnswer:{attribution:official([1],true),parts:body.partAnswers!.map(a=>{assert(a.kind==='choice');return{...a,choiceId:a.choiceId.replace('value','original')};})},explanation:{attribution:structuredClone(own),blocks:[{type:'paragraph',text:body.explanation}]},assetRefs:bundle.assets.map(a=>a.id),choiceShuffleAllowed:false,distribution:'excluded',review:{checkedOn,reviewerIds:['codex'],checks:{publication:'pass',terms:'pass',thirdParty:'pass',transcription:'pass',answer:'pass',explanation:'pass'},notes:'局所原資料・独立意味検算の候補。全冊子受入れ・通常App・保存・描画の最終検証は別途必要。'}};
  bundle.questions.push(q);const seed=structuredClone(q);seed.id='question-template-source-2017h29h-fe-pm-9';seed.origin.kind='official_adaptation';seed.origin.isModified=true;seed.origin.derivedFrom=[{questionId:q.id,revision:1}];seed.origin.changes.push({at,actorId:'codex',kind:'wording',summary:'原形式のビット条件と順不同追跡を可変化',details:d.notes,affectsAnswer:true,answerDetails:body.explanation});seed.assetRefs=[];const base=bindLegacy2017Pm9Body(seed,body);base.learning.tags.push('parameterized');bundle.questions.push(base);
  bundle.templates.push({schemaVersion:'3.0.0',id:'template-source-2017h29h-fe-pm-9',revision:1,title:d.title,baseQuestionRef:{questionId:base.id,revision:1},generatorRef:{id:'generator-source-2017h29h-fe-pm-9',version:d.version!},parameterDomain:{values:{length:1,minimum:0,maximum:7},fields:structuredClone(d.fields)},referenceParameters:{values:[0]},attribution:adapted(),editorIds:['codex'],lifecycle:'active',distribution:'excluded',bindingBasis:'official_source',originalContentSha256:await contentHash(base)});
  for(const [kind,rows] of Object.entries(bundle))for(const row of rows)if(kind!=='questions')schema(kind==='rights'?'rights':kind.slice(0,-1),row);
  return{bundle,validation:{status:'excluded_whole_major_candidate',questions:bundle.questions.map(assessLegacy2017Pm9Schema),allAnswerGroupsInPrompt:true,choiceShuffleAllowed:false,ordinaryAppRegistered:false,finalBookletAdmission:false}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const folder=path.resolve(process.argv[2]);assert(process.argv[2]);const rendered=JSON.parse(fs.readFileSync(path.join(folder,'pages.json'),'utf8')),evidence=JSON.parse(fs.readFileSync('scripts/source-evidence/ipa-pre-2023.json','utf8'));
  const result=await legacy2017Pm9Records({collection:evidence.collections.find((c:{id:string})=>c.id==='2017h29h-fe-pm'),rendered});
  for(const a of result.bundle.assets){const bytes=fs.readFileSync(path.join(folder,a.path));assert.equal(bytes.length,a.byteLength);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);}
  fs.writeFileSync(path.join(folder,'records.json'),JSON.stringify(result.bundle,null,2)+'\n');fs.writeFileSync(path.join(folder,'validation.json'),JSON.stringify(result.validation,null,2)+'\n');console.log(result.validation);
}
