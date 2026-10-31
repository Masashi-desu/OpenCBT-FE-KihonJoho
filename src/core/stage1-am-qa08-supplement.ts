import type {StudyTerm} from './study-acronyms';
import input from './stage1-am-qa08-supplement.json';

function freeze<T>(value:T):T{
 if(value&&typeof value==='object'){for(const item of Object.values(value))freeze(item);Object.freeze(value);}
 return value;
}
// Independent, post-answer learning notes. No Question, annual producer,
// generator, PM collector, 2016 or held-source definition is imported here.
const owned:StudyTerm[]=structuredClone(input);
export const stage1AmQa08SupplementTerms:readonly StudyTerm[]=freeze(owned);
export const stage1AmQa08SupplementSources:readonly string[]=freeze([...new Set(owned.flatMap(t=>t.sources??[]))].sort());

/** Exact source lookup, also useful for isolated review and parent composition.
 * Returned notes are owned copies; caller edits never change the fixed notes. */
export function stage1AmQa08SupplementForSource(source:string):StudyTerm[]{
 if(!stage1AmQa08SupplementSources.includes(source))return[];
 return owned.filter(t=>t.sources?.includes(source)).map(t=>({...structuredClone(t),sources:[source]}));
}
