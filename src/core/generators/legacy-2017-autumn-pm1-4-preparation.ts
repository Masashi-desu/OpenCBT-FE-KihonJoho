/** S2-02 Q1-4 pure local preparation helpers; not imported by the registry. */
import type {AnswerPart,Attribution,Block,PartAnswer,SourceRef} from '../types';
export const autumn2017Papers={collectionId:'2017h29a-fe-pm',questionPaper:{url:'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_qs.pdf',sha256:'787ad5492b60949988e7e39ca532ac7c1c78ebfe5b3cbd9af4e6f621793ddd9a',byteLength:14044358,pageCount:93},answerPaper:{url:'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_fe_pm_ans.pdf',sha256:'7bbf8eff0464a05ae1f65c9ecff1ee978c946fb1bd28ef13858e710b9d3678c1',byteLength:190582,pageCount:4}} as const;
export const autumnLabels='アイウエオカキクケコサシスセソ';
export function autumnParameter(values:number[],maximum:number){
 if(!Array.isArray(values)||Object.getPrototypeOf(values)!==Array.prototype||values.length!==1||Reflect.ownKeys(values).length!==2)throw Error('PARAMETER_CONSTRAINT');
 const descriptor=Object.getOwnPropertyDescriptor(values,'0');if(!descriptor||!('value'in descriptor)||!Number.isInteger(descriptor.value)||descriptor.value<0||descriptor.value>maximum)throw Error('PARAMETER_CONSTRAINT');return descriptor.value as number;
}
export function autumnRef(number:number,page:number,answer=false):SourceRef{return{sourceId:`source-ipa-2017h29a-fe-pm-${number}-${answer?'ans':'qs'}`,locator:{section:`平成29年度 秋期 基本情報技術者試験 午後 問${number}${answer?' 解答例':''}`,page,year:2017,period:'秋期',exam:'基本情報技術者試験',subject:'午後',timeSlot:'午後',questionNumber:String(number)}};}
export function autumnAttribution(number:number,pages:number[],origin:'official'|'adapted',answer=false):Attribution{return{origin,sourceRefs:pages.map(page=>autumnRef(number,page,answer)),rightsRefs:[`rights-ipa-2017h29a-fe-pm-${number}`,...origin==='adapted'?['rights-original']:[]],creatorIds:[origin==='official'?'ipa':'codex']};}
export function autumnFigure(number:number,page:number,profile:string,values:number[],caption:string,alt:string):Block{return{type:'diagram',id:'diagram-'+profile,rendererRef:{id:'renderer-source-figures',version:'1.0.0'},caption,alt,scene:{kind:'source_figure',profile,values:[...values]},attribution:autumnAttribution(number,[page],'adapted')};}
export function autumnAnswers(groups:{id:string;choices:Block[][]}[],parts:{id:string;label:string;group:string;correct:number}[]){
 const choices:Block[][]=[],bank=new Map<string,{offset:number;length:number}>();
 for(const group of groups){if(bank.has(group.id)||!group.choices.length)throw Error('AUTUMN_CHOICE_GROUP');bank.set(group.id,{offset:choices.length,length:group.choices.length});choices.push(...structuredClone(group.choices));}
 const answerParts:AnswerPart[]=[],partAnswers:PartAnswer[]=[];
 for(const part of parts){const group=bank.get(part.group);if(!group||!Number.isInteger(part.correct)||part.correct<0||part.correct>=group.length)throw Error('AUTUMN_PART_GROUP');answerParts.push({id:part.id,label:part.label,choiceIds:Array.from({length:group.length},(_,i)=>'choice-value-'+(group.offset+i+1))});partAnswers.push({kind:'choice',partId:part.id,choiceId:'choice-value-'+(group.offset+part.correct+1)});}
 return{choices,answerParts,partAnswers};
}
