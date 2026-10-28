import{figure,p,code,type GeneratedBody}from'./definition';
export const selectedLanguageNotice='選択した問題は，選択欄の選をマークしてください。マークがない場合は，採点されません。';
export const languageSelectionNotice='次の問9から問13までの5問については，この中から1問を選択し，選択した問題については，解答用紙の選択欄の選をマークして解答してください。なお，2問以上マークした場合には，はじめの1問について採点します。';
export const languageLabels='アイウエオカキクケコサシスセソタチツテト';
export function languageAnswers(banks:string[][],fields:{id:string;bank:number;label:string;answer:number}[]){const offsets=banks.map((_,i)=>banks.slice(0,i).reduce((n,b)=>n+b.length,0));return{choices:banks.flatMap(b=>b.map(text=>[code(text,'text')])),answerParts:fields.map(f=>({id:'part-'+f.id,label:f.label,choiceIds:banks[f.bank].map((_,i)=>'choice-value-'+(offsets[f.bank]+i+1))})),partAnswers:fields.map(f=>({kind:'choice' as const,partId:'part-'+f.id,choiceId:'choice-value-'+(offsets[f.bank]+f.answer+1)}))};}
export type LanguageFigure={kind:'program'|'bank'|'route'|'record'|'example'|'changes';caption:string;alt:string;routePart?:'graph'|'table';lineNumbersLabel?:boolean;text?:string;columns?:string[];rows?:string[][];template?:string;replacement?:string;output?:string;route?:{next:number[][];trains:(null|{id:number;dest:number})[]}};
export function languageDrawing(number:number,kind:string,values:number[],group:number,caption:string,alt:string){return figure(`legacy-2018-autumn-pm${number}-${kind}`,[...values,group],caption,alt);}
export function materialContexts(number:number,groups:{id:string;title:string;pages:number[]}[]):NonNullable<GeneratedBody['contexts']>{return groups.map(g=>({title:g.title,presentation:'text_figure' as const,blocks:g.pages.map(page=>({type:'image' as const,assetId:`asset-ipa-2018h30a-fe-pm-${number}-p${page}`,caption:`平成30年度秋期 付属資料 物理p.${page}`}))}));}
export {p,code};
