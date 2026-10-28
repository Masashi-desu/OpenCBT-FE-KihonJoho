import{Fragment}from'react';
import{languageSelectionNotice}from'../core/generators/legacy-2018-autumn-language-common';
import{autumn2018Pm8MandatoryNotice}from'../core/generators/legacy-2018-autumn-existing-bank';
import{autumn2018GeneralNotice,autumn2018SelectedNotice}from'../core/generators/legacy-2018-autumn-pm2';
/** Proposed Content hook only for this booklet's source-owned paragraphs. */
export function isLegacy2018AutumnNativeText(text:string){return text===autumn2018GeneralNotice||text===autumn2018SelectedNotice||text===autumn2018Pm8MandatoryNotice||text===languageSelectionNotice||/［(?:[a-g]|c[1-3]|　)］/.test(text);}
export function Legacy2018AutumnNativeText({text}:{text:string}){
 const notice=text===autumn2018GeneralNotice||text===autumn2018SelectedNotice||text===autumn2018Pm8MandatoryNotice||text===languageSelectionNotice,parts=text.split(/(［(?:[a-g]|c[1-3]|　)］|選択欄の選)/g);
 return<p className={notice?'autumn2018-source-notice':undefined}>{parts.map((part,i)=>part==='選択欄の選'?<Fragment key={i}>選択欄の<span className="autumn2018-selection-mark">選</span></Fragment>:/^［/.test(part)?<span key={i} className="autumn2018-blank" data-source-blank={part.slice(1,-1).trim()||'anonymous'} aria-label={part.slice(1,-1).trim()?'空欄'+part.slice(1,-1):'空欄'}>{part.slice(1,-1)}</span>:<Fragment key={i}>{part}</Fragment>)}</p>;
}
