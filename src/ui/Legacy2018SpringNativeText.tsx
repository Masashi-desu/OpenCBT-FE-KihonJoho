import {Fragment} from 'react';
import type {GenerationDefinition} from '../core/generators/definition';
import {spring2018FirstDefinition,spring2018FirstSelectionNotice,spring2018FirstGeneralNotice} from '../core/generators/legacy-2018-spring-pm1-4-model';
import {legacy2018SpringPm13Definition} from '../core/generators/legacy-2018-spring-pm13';
type Region={start:number;end:number;kind:'blank'|'underline'|'circle';token:string};
const contracts=new Map<string,Region[]>(),key=(number:number,kind:string,text:string)=>number+'\0'+kind+'\0'+text;
/** Only the four independently read source-leading notices are registered.
 * Their existing producer spelling remains unchanged in question JSON. */
const languageNotices:Record<number,{text:string;mark:string;frame:'general'|'selection'}>={
 9:{text:'次の問9から問13までの5問については，この中から1問を選択し，選択した問題については，答案用紙の選択欄の○選をマークして解答してください。なお，2問以上マークした場合には，はじめの1問について採点します。',mark:'○選',frame:'general'},
 10:{text:'選択した問題は，選択欄の○選をマークしてください。マークがない場合は，採点されません。',mark:'○選',frame:'selection'},
 11:{text:'選択した問題は、選択欄の（選）をマークしてください。マークがない場合は、採点されません。',mark:'（選）',frame:'selection'},
 12:{text:'選択した問題は、選択欄の（選）をマークしてください。マークがない場合は、採点されません。',mark:'（選）',frame:'selection'},
};
const defs:[number,GenerationDefinition][]=[[1,spring2018FirstDefinition(1)],[2,spring2018FirstDefinition(2)],[3,spring2018FirstDefinition(3)],[4,spring2018FirstDefinition(4)],[13,legacy2018SpringPm13Definition]];
function visit(number:number,d:GenerationDefinition,values:number[]){if(values.length<d.fields.length){const f=d.fields[values.length];for(let v=f.minimum;v<=f.maximum;v++)visit(number,d,[...values,v]);return;}for(const b of d.build(values).prompt){if(b.type!=='paragraph'&&b.type!=='code')continue;const regions:Region[]=[...b.text.matchAll(/［(?:[a-g][1-3]?|　|選)］/g)].map(m=>({start:m.index!,end:m.index!+m[0].length,kind:m[0]==='［選］'?'circle':'blank',token:m[0]}));if(number===4&&b.type==='paragraph'&&b.text.startsWith('設問2 ')){const token='二つ選べ',start=b.text.indexOf(token);if(start<0)throw Error('SPRING_NATIVE_UNDERLINE_SOURCE');regions.push({start,end:start+token.length,kind:'underline',token});}regions.sort((a,b)=>a.start-b.start);for(let i=1;i<regions.length;i++)if(regions[i].start<regions[i-1].end)throw Error('SPRING_NATIVE_OVERLAP');if(regions.length||spring2018NativeNotice(number,b.text))contracts.set(key(number,b.type,b.text),regions);}}
export function spring2018NativeNotice(number:number,text:string){if(languageNotices[number]?.text===text)return languageNotices[number].frame;return number===1&&text==='次の問1は必須問題です。必ず解答してください。'?'required':number===2&&text===spring2018FirstGeneralNotice?'general':[3,4,13].includes(number)&&text===spring2018FirstSelectionNotice?'selection':undefined;}
for(const[n,d]of defs)visit(n,d,[]);
for(const [number,notice]of Object.entries(languageNotices)){const start=notice.text.indexOf(notice.mark);if(start<0||notice.text.indexOf(notice.mark,start+notice.mark.length)!==-1)throw Error('SPRING_NATIVE_NOTICE_MARK');contracts.set(key(Number(number),'paragraph',notice.text),[{start,end:start+notice.mark.length,kind:'circle',token:notice.mark}]);}
export function isLegacy2018SpringNativeText(number:number,kind:'paragraph'|'code',text:string){return contracts.has(key(number,kind,text));}
export function legacy2018SpringNativeTextContracts(){return[...contracts].map(([k,regions])=>{const[n,kind,text]=k.split('\0');return{number:Number(n),kind:kind as 'paragraph'|'code',text,regions:structuredClone(regions)};});}
/** Caller must also verify the exact official source identity/year/period. */
export function Legacy2018SpringNativeText({number,kind,text}:{number:number;kind:'paragraph'|'code';text:string}){const regions=contracts.get(key(number,kind,text));if(!regions)throw Error('SPRING_NATIVE_TEXT_SOURCE');const out=[];let position=0;for(const region of regions){if(region.start>position)out.push(<Fragment key={'t'+position}>{text.slice(position,region.start)}</Fragment>);const label=region.token.slice(1,-1).trim();out.push(region.kind==='underline'?<u className="spring2018-native-underline" key={'u'+region.start}>{region.token}</u>:region.kind==='circle'?<span className="spring2018-native-circle" data-spring2018-circle="選" key={'c'+region.start} aria-label="丸で囲まれた選">選</span>:<span className="spring2018-native-blank" data-spring2018-blank={label||'anonymous'} data-source-token={region.token} aria-label={'空欄'+label} key={'b'+region.start}>{label||'\u00a0'}</span>);position=region.end;}if(position<text.length)out.push(<Fragment key={'t'+position}>{text.slice(position)}</Fragment>);return <>{out}</>;}

/** Full paragraph wrapper keeps the original notice frame outside inline fragments. */
export function Legacy2018SpringNativeParagraph({number,text}:{number:number;text:string}){const notice=spring2018NativeNotice(number,text);return <p className={notice?"spring2018-native-notice spring2018-native-notice-"+notice:undefined} data-spring2018-notice={notice}><Legacy2018SpringNativeText number={number} kind="paragraph" text={text}/></p>;}
