import type{Question}from'../types';import type{StudyTerm}from'../study-acronyms';
import{legacy2018AutumnPm1StudyTerms}from'./legacy-2018-autumn-pm1-study-terms';
import{autumn2018OwnerStudyTerms}from'./legacy-2018-autumn-owner-study-terms';
import{autumn2018Pm5To7StudyTerms}from'./legacy-2018-autumn-pm5-7-study-terms';
import{legacy2018ExpressionStudyTerms}from'./legacy-2018-pm-expression-study-terms';
import{legacy2018AutumnPm9StudyTerms}from'./legacy-2018-autumn-pm9-study-terms';
import{legacy2018AutumnPm10StudyTerms}from'./legacy-2018-autumn-pm10-study-terms';
import{legacy2018AutumnPm11StudyTerms}from'./legacy-2018-autumn-pm11-study-terms';
import{legacy2018AutumnPm12StudyTerms}from'./legacy-2018-autumn-pm12-study-terms';
const fixed:Record<string,StudyTerm[]>={'1':legacy2018AutumnPm1StudyTerms,'8':legacy2018ExpressionStudyTerms,'9':legacy2018AutumnPm9StudyTerms,'10':legacy2018AutumnPm10StudyTerms,'11':legacy2018AutumnPm11StudyTerms,'12':legacy2018AutumnPm12StudyTerms};
/** Source locators select the reviewed glossary for original, base and generated
 * IDs alike. All refs must belong to this exact question paper and major. */
export function autumn2018AfternoonStudyTerms(q:Question):StudyTerm[]|undefined{
 const refs=q.origin.sourceRefs,n=refs[0]?.locator.questionNumber;
 if(q.subject!=='B'||!n||!Array.from({length:13},(_,i)=>String(i+1)).includes(n)||!refs.length||!refs.every(r=>r.sourceId===`source-ipa-2018h30a-fe-pm-${n}-qs`&&r.locator.year===2018&&r.locator.period==='秋期'&&r.locator.timeSlot==='午後'&&r.locator.questionNumber===n))return undefined;
 const scoped=autumn2018OwnerStudyTerms(q)??autumn2018Pm5To7StudyTerms(q);
 if(scoped!==undefined)return scoped;
 const terms=fixed[n];if(!terms)throw Error('AUTUMN2018_GLOSSARY_REQUIRED:'+n);
 return structuredClone(terms);
}
