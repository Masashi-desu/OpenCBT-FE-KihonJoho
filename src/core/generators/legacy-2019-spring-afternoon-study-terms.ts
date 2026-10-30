import type{Question}from'../types';import{studyAcronyms,type StudyTerm}from'../study-acronyms';
import{spring2019OwnerStudyTerms}from'./legacy-2019-spring-owner-study-terms';
import{legacy2019PmAuthStudyTerms}from'./legacy-2019-pm-auth-study-terms';
import{legacy2019InspectionStudyTerms}from'./legacy-2019-pm-inspection-study-terms';
import{legacy2019PmChangeStudyTerms}from'./legacy-2019-pm-change-study-terms';
import{legacy2019PmIntegrationStudyTerms}from'./legacy-2019-pm-integration-study-terms';
import{legacy2019Pm8StudyTerms}from'./legacy-2019-pm8-study-terms';
import{legacy2019RankingStudyTerms}from'./legacy-2019-pm-ranking-study-terms';
const inherited:Readonly<Record<string,readonly string[]>>={'1':['PC','LAN','IP','HTTP','HTTPS','TLS','ID'],'4':['IP','HTTP','OSI','PC']};
const q8=legacy2019Pm8StudyTerms.map(t=>t.term==='固定長符号'?{...t,meaning:'全ての文字などを同じ長さの符号語で表す方式。原例は4文字A〜Dに各2ビットを使い，13文字の総ビット長は26となる。生成例の文字数はその例の出現回数から求める。'}:t);
const fixed:Readonly<Record<string,StudyTerm[]>>={'1':legacy2019PmAuthStudyTerms,'5':legacy2019InspectionStudyTerms,'6':legacy2019PmChangeStudyTerms,'7':legacy2019PmIntegrationStudyTerms,'8':q8,'10':legacy2019RankingStudyTerms};
/** Exact source locators apply to original/base/generated IDs alike. Static
 * metadata never imports questionStudyTerms, avoiding initialization cycles. */
export function spring2019AfternoonStudyTerms(q:Question):StudyTerm[]|undefined{
 const refs=q.origin.sourceRefs,n=refs[0]?.locator.questionNumber;
 if(q.subject!=='B'||!n||!refs.length||!Array.from({length:13},(_,i)=>String(i+1)).includes(n)||!refs.every(r=>r.sourceId===`source-ipa-2019h31h-fe-pm-${n}-qs`&&r.locator.year===2019&&r.locator.period==='春期'&&r.locator.timeSlot==='午後'&&r.locator.questionNumber===n))return undefined;
 const source=`2019h31h-fe-pm-${n}`,local=fixed[n]??spring2019OwnerStudyTerms[n];if(!local)throw Error('SPRING2019_GLOSSARY_REQUIRED:'+n);
 const canonical=(inherited[n]??[]).map(name=>{const term=studyAcronyms.find(t=>t.term===name);if(!term)throw Error('SPRING2019_CANONICAL_TERM_REQUIRED:'+name);return{...term,sources:[source]};});
 const terms=[...local,...canonical].map(t=>({...t,sources:[source]}));if(new Set(terms.map(t=>t.term)).size!==terms.length)throw Error('SPRING2019_DUPLICATE_GLOSSARY:'+n);return structuredClone(terms);
}
