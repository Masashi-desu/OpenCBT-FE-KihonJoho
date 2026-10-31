import type {Attribution,Question,SourceRef,Rights}from '../types';
export const legacy2017Autumn64Source='2017h29a-fe-am-64';
export const legacy2017Autumn64OriginalSlotD='choice-value-4';
export const legacy2017Autumn64MoeRight='rights-moe-green-purchase-2017-description';
export const legacy2017Autumn64IpaOnlyRight='rights-ipa-2017h29a-fe-am-64-native-ipa-only';
const aggregateIpaRight='rights-ipa-2017h29a-fe-am-moe-planning-candidates';
const moeBook='source-moe-green-purchase-201702',moeSources=new Set([moeBook,'source-moe-terms-20261021','source-pdl-1-moe-20261021']);
const sourceD='品質や価格の要件を満たすだけでなく、環境負荷が小さい製品やサービスを、環境負荷の低減に努める事業者から優先して購入することである。';
const scopedMoeRef:SourceRef={sourceId:moeBook,locator:{page:4,section:'印刷3頁 上段の負荷と供給者選択／基本的考え方1。2017秋午前64エに対応する説明文のみ'}};
const fail=(code:string):never=>{throw Error('LEGACY2017_AM64_MATERIAL_'+code);};
/** Descriptor-only ownership of finite JSON. It never reads getters or retains
 * caller aliases. Internal utility also used by the isolated records adapter. */
export function ownLegacy2017Autumn64Json<T>(v:T,ancestors=new Set<object>()):T{
 if(v===null||typeof v==='string'||typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v)&&!Object.is(v,-0))return v;
 if(!v||typeof v!=='object'||ancestors.has(v))return fail('JSON');ancestors.add(v);let out:unknown;
 if(Array.isArray(v)){if(Object.getPrototypeOf(v)!==Array.prototype||Reflect.ownKeys(v).length!==v.length+1)return fail('JSON');out=Array.from({length:v.length},(_,i)=>{const d=Object.getOwnPropertyDescriptor(v,String(i));if(!d||!d.enumerable||!('value'in d))return fail('JSON');return ownLegacy2017Autumn64Json(d.value,ancestors);});}
 else{if(Object.getPrototypeOf(v)!==Object.prototype&&Object.getPrototypeOf(v)!==null)return fail('JSON');const pairs=[];for(const key of Reflect.ownKeys(v)){const d=Object.getOwnPropertyDescriptor(v,key)!;if(typeof key!=='string'||!d.enumerable||!('value'in d))return fail('JSON');pairs.push([key,ownLegacy2017Autumn64Json(d.value,ancestors)]);}out=Object.fromEntries(pairs);}
 ancestors.delete(v);return out as T;
}
const hasMoe=(a:Attribution)=>a.rightsRefs.includes(legacy2017Autumn64MoeRight)||a.sourceRefs.some(r=>moeSources.has(r.sourceId));
const removeMoe=(a:Attribution):Attribution=>({...a,sourceRefs:a.sourceRefs.filter(r=>!moeSources.has(r.sourceId)),rightsRefs:[...a.rightsRefs.filter(id=>id!==legacy2017Autumn64MoeRight&&id!==aggregateIpaRight&&id!==legacy2017Autumn64IpaOnlyRight),legacy2017Autumn64IpaOnlyRight]});
function independent(a:Attribution){if(a.origin!=='original'||a.sourceRefs.length||a.rightsRefs.length!==1||a.rightsRefs[0]!=='rights-original')return fail('INDEPENDENT_SCOPE');}
/** Run after binding and after any choice reorder. The original slot D is
 * identified by its stable ID and reviewed text, never displayed index3 or
 * the current correct answer. Original composite image Question is unchanged.
 * Existing common contexts remain byte-identical; this helper does not create
 * missing contexts, register profiles, revise versions or admit distribution. */
export function bindLegacy2017Autumn64Material(question:Question,binding:{source:string;originalSlotDChoiceId:string}):Question{
 const b=ownLegacy2017Autumn64Json(binding);if(b.source!==legacy2017Autumn64Source||b.originalSlotDChoiceId!==legacy2017Autumn64OriginalSlotD)return fail('BINDING');
 const q=ownLegacy2017Autumn64Json(question),qs='source-ipa-2017h29a-fe-am-qs';
 const provenance=q.origin.sourceRefs.some(r=>r.sourceId===qs&&r.locator.questionNumber==='64'&&r.locator.page===26);
 const identity=q.id==='question-ipa-'+legacy2017Autumn64Source||q.id==='question-template-source-'+legacy2017Autumn64Source||q.origin.derivedFrom.some(r=>r.questionId==='question-template-source-'+legacy2017Autumn64Source);
 if(!provenance||!identity||q.subject!=='A'||q.answerParts||q.choices.length!==4)return fail('SOURCE_SCOPE');
 if(q.origin.kind==='official_reprint'&&!q.origin.isModified){if(!q.prompt.blocks.some(x=>x.type==='image')||!hasMoe(q.prompt.attribution))return fail('ORIGINAL_IMAGE_SCOPE');return q;}
 if(q.origin.kind!=='official_adaptation'||!q.origin.isModified||q.prompt.blocks.length!==1||q.prompt.blocks[0].type!=='paragraph'||q.prompt.blocks[0].text!=='グリーン調達の説明はどれか。')return fail('GENERATED_SCOPE');
 const ids=q.choices.map(c=>c.id);if(new Set(ids).size!==4||['choice-value-1','choice-value-2','choice-value-3','choice-value-4'].some(id=>!ids.includes(id)))return fail('SLOT_IDS');
 const d=q.choices.find(c=>c.id===b.originalSlotDChoiceId)!;
 if(d.content.blocks.length!==1||d.content.blocks[0].type!=='paragraph'||d.content.blocks[0].text!==sourceD||q.correctAnswer.choiceId!==d.id)return fail('SOURCE_D');
 if(q.choices.some(c=>c.content.blocks.length!==1||c.content.blocks[0].type!=='paragraph')||new Set(q.choices.map(c=>JSON.stringify(c.content.blocks))).size!==4)return fail('CHOICE_SCOPE');
 independent(q.explanation.attribution);independent(q.correctAnswer.attribution);
 for(const c of q.contexts){const attrs=[c.content.attribution,...c.content.blocks.filter(x=>x.type==='diagram').map(x=>(x as Extract<typeof x,{type:'diagram'}>).attribution)];
  if(attrs.some(hasMoe))return fail('CONTEXT_SCOPE');
  if(c.id==='context-2017h29a-fe-am-common')for(const a of attrs)if(!a.sourceRefs.length||a.sourceRefs.some(r=>r.sourceId!==qs||r.locator.page!==2)||!a.rightsRefs.includes('rights-ipa-2017h29a-fe-am-common')||a.rightsRefs.some(id=>!['rights-ipa-2017h29a-fe-am-common','rights-original'].includes(id)))return fail('COMMON_SCOPE');
 }
 const attributions=[q.prompt.attribution,...q.choices.map(c=>c.content.attribution)];if(attributions.some(a=>a.origin!=='adapted'||!a.rightsRefs.includes('rights-original')||!a.rightsRefs.some(id=>id===aggregateIpaRight||id===legacy2017Autumn64IpaOnlyRight)||!a.sourceRefs.some(r=>r.sourceId===qs&&r.locator.questionNumber==='64')))return fail('IPA_SCOPE');
 q.origin.sourceRefs=q.origin.sourceRefs.filter(r=>!moeSources.has(r.sourceId));q.prompt.attribution=removeMoe(q.prompt.attribution);
 for(const c of q.choices)c.content.attribution=removeMoe(c.content.attribution);
 d.content.attribution.sourceRefs.push(ownLegacy2017Autumn64Json(scopedMoeRef));d.content.attribution.rightsRefs.push(legacy2017Autumn64MoeRight);
 return q;
}
/** Same accepted IPA educational-use basis, narrowed to the native IPA portion.
 * Existing aggregate/image and environmental Rights are not overwritten. The
 * short displayed text deliberately credits IPA here; the environmental text
 * is displayed only where the separate MOE Right is directly referenced. */
export function legacy2017Autumn64NativeIpaRights():Rights{return {
 schemaVersion:'3.0.0',id:legacy2017Autumn64IpaOnlyRight,holders:['独立行政法人情報処理推進機構（IPA）'],basis:'official_policy',checkedOn:'2026-10-25',evidence:[{sourceId:'source-ipa-faq-stage1-2026-10-24',locator:{section:'その他／過去問題の使用方法／留意点'}},{sourceId:'source-ipa-2017h29a-fe-am-qs',locator:{page:26,section:'平成29年度秋期 午前 問64：IPA原部分'}}],scope:'2017秋午前64の生成問題の設問・選択肢ア〜ウ及び原文由来選択肢エのIPA構成部分だけ。並べ替え後も原文由来のエに当たる説明文だけへ適用する。環境省冊子p4対応説明文はこのRightに含めず、エの別MOE Rightで追跡する。元の複合画像には既存の複合素材記録を維持する。',uses:{repositoryRedistribution:'allowed',browserDisplay:'allowed',adaptation:'allowed'},licenseId:'LicenseRef-IPA-Public-Questions',modificationNoticeRequired:true,attributionText:'出典：平成29年度 秋期 基本情報技術者試験 午前 問64／©2017 独立行政法人情報処理推進機構（IPA）。この欄のIPA原部分を学習用に再組版・改変。',thirdParty:{status:'none_identified',notes:'既評価のIPA原部分へ範囲を限定した表示上の分割。別管理された環境省の対応説明文・原複合画像・共通p2・独自解説はこの記録の対象外。問題全体に第三者部分がないという保証ではない。',rightsRefs:[]},assessmentNotes:'2026-10-25：既存rights-ipa-2017h29a-fe-am-moe-planning-candidatesのIPA用途評価を素材欄ごとに狭める後続修正。利用権の新規取得・範囲拡大・他問題への一般化をせず、Source/既存Rightsの内容は変更しない。IPA根拠は親のexact source-ipa-faq-stage1-2026-10-24を参照。個別許諾又は外部法律家の判断の取得ではない。'};}
