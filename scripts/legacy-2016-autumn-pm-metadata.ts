/** Source-owned metadata factory. Pure: it neither writes nor admits records. */
import assert from 'node:assert/strict';
import type { Attribution, Asset, Rights, Source, Question, SetRecord, Exam } from '../src/core/types';
import { autumn2016PmPageAssetId } from '../src/core/generators/legacy-2016-autumn-pm-materials';
import type { Stage3AfternoonQuestionSpec } from './legacy-2016-autumn-pm-spec';

const book='2016h28a-fe-pm', scope='2016-autumn-pm';
const title='平成28年度 秋期 基本情報技術者試験 午後';
const qs='https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_fe_pm_qs.pdf';
export const S3_003_QUESTION_SHA='ab1a696e3580ab6f0c30389e10ee133a312d6a432db7f5ac34375e0a03054bf1';
export const S3_003_ANSWER_SHA='90511ce7b5c4ebff1817b0b1ebf7a8e73c0ba097a3e46728577943cb7502c51f';
const range=(first:number,last:number)=>Array.from({length:last-first+1},(_,i)=>first+i);
export const S3_003_REFERENCE_PAGES=[2,4,5,...range(69,82)];
export const S3_003_ASSET_PAGES=[2,...range(4,82)];

export function autumn2016PmMetadata(input:{specs:readonly Stage3AfternoonQuestionSpec[];checkedOn:string;
  faqSHA256:string; commonAlt:Readonly<Record<number,string>>;
  images:Readonly<Record<number,{sha256:string;byteLength:number;width:number;height:number}>>;
  reviews:Readonly<Record<number,Question['review']>>}) {
 assert.deepEqual(input.specs.map(s=>s.number),range(1,13));
 const policyId=`source-ipa-${book}-usage`,commonId=`source-ipa-${book}-common-qs`;
 const policy:Source={schemaVersion:'3.0.0',id:policyId,title:'IPA 試験の過去問題の使用方法・留意点',publisher:'独立行政法人情報処理推進機構（IPA）',url:'https://www.ipa.go.jp/shiken/faq.html',sha256:input.faqSHA256,type:'policy',scope:'公表された試験問題の利用条件。第三者の素材の包括許諾ではない。',sections:['試験の過去問題の使用方法／留意点'],facts:['出典と改変を明示した教材としての利用条件を確認。'],checkedOn:input.checkedOn,availability:'officially_published',dateNote:'確認日と公開日を区別する。',supports:['annual-sets','random-mix','answer-validation'],limits:'第三者の著作物・JIS規格文言等には適用を拡張しない。'};
 const source=(id:string,label:string,pages:number[],answer=false):Source=>({schemaVersion:'3.0.0',id,title:title+' '+label,publisher:'独立行政法人情報処理推進機構（IPA）',url:answer?qs.replace('_qs.pdf','_ans.pdf'):qs,sha256:answer?S3_003_ANSWER_SHA:S3_003_QUESTION_SHA,type:answer?'official_answer':'official_problem',scope:label,sections:pages.map(p=>`PDF p.${p} ${label}`),facts:[answer?'公式の各解答欄の正答を確認。':'本文・図表・前提・注意書き・解答群を原頁と照合。'],checkedOn:input.checkedOn,availability:'officially_published',dateNote:'個別資料の公開日・更新日の明記は未確認。試験日・PDFメタデータ・取得日を公開日として補わない。',supports:['annual-sets','random-mix','answer-validation'],limits:'当該年度・期・午後・指定範囲のみ。物理73頁のJIS X0201原表は含めない。'});
 const sources:Source[]=[policy,source(commonId,'選択方法・正誤表・擬似言語・言語別参考資料（JIS原表を除く）',[1,...S3_003_REFERENCE_PAGES])];
 const makeRights=(id:string,label:string):Rights=>({schemaVersion:'3.0.0',id,holders:['独立行政法人情報処理推進機構（IPA）'],basis:'official_policy',checkedOn:input.checkedOn,evidence:[{sourceId:policyId,locator:{section:'試験の過去問題の使用方法／留意点'}}],scope:title+' '+label+'の確認済みIPA部分。未確認素材には適用しない。',uses:{repositoryRedistribution:'allowed',browserDisplay:'allowed',adaptation:'allowed'},licenseId:'LicenseRef-IPA-Public-Questions',modificationNoticeRequired:true,attributionText:`出典：${title} ${label}／©2016 独立行政法人情報処理推進機構（IPA）`,thirdParty:{status:'none_identified',rightsRefs:[],notes:'掲載部分を個別に確認。物理73頁下部のJIS X0201原表・規格文言は配布しない。'},assessmentNotes:'公式原資料・IPAの利用条件と原頁別素材査読に基づく限定判断。出典と改変を表示する。独自解説は別帰属とし、IPA部分へMIT/CC0を適用しない。'});
 const rights:Rights[]=[makeRights('rights-ipa-'+book+'-common','必要な付属資料（物理73頁は上部のCASL II仕様だけ）')];
 for(const spec of input.specs){assert(input.reviews[spec.number]);const s=book+'-'+spec.number;sources.push(source('source-ipa-'+s+'-qs','問'+spec.number,spec.pages),source('source-ipa-'+s+'-ans','問'+spec.number+' 解答例',[1],true));rights.push(makeRights('rights-ipa-'+s,'問'+spec.number));}
 const assets:Asset[]=S3_003_ASSET_PAGES.map(page=>{
   const owner=input.specs.find(spec=>spec.pages.includes(page)),image=input.images[page],crop=page===73;
   assert(image&&image.width===1432&&image.height===(crop?1230:2026));assert.match(image.sha256,/^[a-f0-9]{64}$/);
   const alt=owner?owner.originalPageAlt[page]:input.commonAlt[page];assert(alt&&alt.length>80,'complete reviewed alt page '+page);
   const attribution:Attribution={origin:crop?'adapted':'official',sourceRefs:[{sourceId:owner?'source-ipa-'+book+'-'+owner.number+'-qs':commonId,locator:{year:2016,period:'秋期',exam:'基本情報技術者試験',timeSlot:'午後',subject:'旧制度・午後',...(owner?{questionNumber:String(owner.number)}:{}),page,section:crop?'CASL II仕様の上部抜粋。下部の1.3文字の符号表を除外。':`原資料 PDF p.${page}`}}],rightsRefs:['rights-ipa-'+book+(owner?'-'+owner.number:'-common')],creatorIds:crop?['ipa','codex']:['ipa']};
   return {schemaVersion:'3.0.0',id:autumn2016PmPageAssetId(page,crop),path:`assets/${book}-page-${String(page).padStart(3,'0')}${crop?'-casl-excerpt':''}.webp`,mediaType:'image/webp',...image,alt,attribution};
 });
 return {sources,rights,assets};
}

/** Official cover fixes 1&8, choose4 of2–7 and1 of9–13,150 minutes. */
export function autumn2016PmSets():{sets:SetRecord[];exams:Exam[]} {
 const ref=(n:number,base=false)=>({questionId:(base?'question-template-source-':'question-ipa-')+book+'-'+n,revision:1});
 const refs=range(1,13).map(n=>ref(n)),bases=range(1,13).map(n=>ref(n,true));
 const sets:SetRecord[]=[],exams:Exam[]=[];
 for(const kind of ['annual','mix']as const){const prefix=kind==='annual'?'年度別':'ランダムミックス',setId=`set-${kind}-${scope}`;
  const examConfigRefs=(['study','practice']as const).map(mode=>({id:`exam-${kind}-${scope}-${mode}`,revision:1}));
  const set:SetRecord={schemaVersion:'3.0.0',id:setId,revision:1,title:`2016年度 秋期・旧午後${kind==='mix'?' ランダムミックス':''}`,subject:'B',questionRefs:kind==='annual'?refs:bases,examConfigRefs,distribution:'excluded',generationBindings:kind==='annual'?[]:bases.map((questionRef,i)=>({questionRef,templateRef:{id:`template-source-${book}-${i+1}`,revision:1}}))};
  if(kind==='annual')set.questionSelection={requiredQuestionRefs:[ref(1),ref(8)],optionalGroups:[{id:'group-2-7',label:'問2〜7から4問',questionRefs:range(2,7).map(n=>ref(n)),choose:4},{id:'group-9-13',label:'問9〜13から1問',questionRefs:range(9,13).map(n=>ref(n)),choose:1}],sourceRefs:[{sourceId:`source-ipa-${book}-common-qs`,locator:{year:2016,period:'秋期',subject:'旧制度・午後',timeSlot:'午後',page:1,section:'表紙の試験時間と問題選択方法'}}],excessPolicy:'paper_order'};
  sets.push(set);
  for(const mode of ['study','practice']as const)exams.push({schemaVersion:'3.0.0',id:`exam-${kind}-${scope}-${mode}`,revision:1,title:`2016年度 秋期・旧午後 ${prefix} ${mode==='study'?'学習':'時間付き練習'}`,subject:'B',mode,questionCount:mode==='study'?13:7,...(mode==='practice'?{timeLimitSeconds:9000,practiceScope:'learning_set' as const}:{}),questionOrder:'set',choiceOrder:'fixed',duplicatePolicy:'lineage_unique',shortagePolicy:'block'});
 }
 return{sets,exams};
}
