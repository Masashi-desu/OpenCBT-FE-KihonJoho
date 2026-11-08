import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import {
  formatSpring2014Text, spring2014Pm9Model, spring2014Pm10Model, spring2014Pm11Model,
  spring2014Pm12Model, spring2014Pm13Model, spring2014Pm0913CaseCount, subscriptionDisplay,
} from './legacy-2014-spring-pm-09-13-models';
import { spring2014Pm10Edits } from './legacy-2014-spring-pm-10-source';

type LanguageTable = { label?:string; columns?:string[]; rows:string[][]; mono?:boolean; worksheet?:boolean };
export type Spring2014PmLanguagePanel = { tables:LanguageTable[]; notes?:string[] };
type Loader = (index:number) => Spring2014PmLanguagePanel;
const spaces = (text:string) => text.replaceAll(' ','△');
const textLine = (text:string) => spaces(text).replaceAll('\n','↓\n').trimEnd();
const id4 = (id:number) => String(id).padStart(4,'0');

const profiles: Record<number,Record<string,Loader>> = {
  9:{
    words(index) {
      const {words}=spring2014Pm9Model(index);
      return {tables:[{label:'テキスト',rows:[[spaces(words)],['単語 → '+words.split(/ +/).join(' ｜ ')]],mono:true}],
        notes:['注記 “△”は空白文字を表す。']};
    },
    wrapping:index=>textPanel(index,false),
    indenting:index=>textPanel(index,true),
    edits(index) {
      const {punctuation}=spring2014Pm9Model(index);
      return {tables:[{columns:['処置','変更内容'],mono:true,rows:[
        ['行番号8と9の間に追加',`int lch = '${punctuation}';`],
        ['行番号26と27の間に追加','if ([e]) {'],
        ['行番号28と29の間に追加','}'],
        ['行番号34と35の間に追加',`if ((lpos == 0) && (sp == 0) && (lch == '${punctuation}')) {
    fputc(' ', ofp);
    lpos++;
}
[f];`],
      ]}]};
    },
  },
  10:{
    master(index) {
      return {tables:[{columns:['従業員番号','平均得点','得点履歴：受検日','得点履歴：得点'],
        rows:[['6桁','3桁','8桁','3桁']]}],notes:['得点履歴の2項目は'+spring2014Pm10Model(index).history+'回分繰返し。']};
    },
    scoring() {
      return {tables:[{label:'様式1',columns:['受検日','未使用域'],rows:[['8桁','1桁']]},
        {label:'様式2',columns:['従業員番号','得点'],rows:[['6桁','3桁']]}]};
    },
    ranking:()=>({tables:[{columns:['処置','変更内容'],rows:spring2014Pm10Edits,mono:true}]}),
  },
  11:{subscription:index=>({tables:[{rows:subscriptionDisplay(spring2014Pm11Model(index).articles).map(line=>[line])}]})},
  12:{
    'get-tokens'(index) {
      const {example,table,base}=spring2014Pm12Model(index);
      return {tables:[{label:'文字列（GR1）→',rows:[[...spaces(example)]],mono:true},
        {label:'単語管理テーブル（GR2）→',rows:[[...table.flatMap(({address,length,kind})=>[address,length,kind]).map(String),'−1']],mono:true}],
        notes:['最後の−1は終端マーク。注記 文字列の先頭アドレスは'+base+'番地とし，数字は10進数表記とする。']};
    },
    'trace-tokens':index=>({tables:[{label:'（GR1）→',rows:[[...spaces(spring2014Pm12Model(index).trace)]],mono:true}]}),
    'calc-string':()=>({tables:[{label:'（GR1）→',rows:[['数字文字列1 △ 演算子 △ 数字文字列2 △ .']],mono:true}]}),
    dtob:()=>({tables:[{label:'（GR1）→',rows:[['アドレス','文字数'],['↓',''],['数字文字列（アドレスが指す領域）','']],mono:true}]}),
  },
  13:{
    customers(index) {
      const {input}=spring2014Pm13Model(index);
      const rows=input.map(({id,name,post,address,phone,age,job})=>
        [String(id+1),id4(id),name,String(post).padStart(7,'0'),address,phone,String(age),String(job)]);
      rows.splice(4,0,Array<string>(8).fill('⋮'));
      return {tables:[{columns:['','A','B','C','D','E','F','G'],worksheet:true,
        rows:[['1','ID','氏名','郵便番号','住所','電話番号','年齢','職業コード'],...rows]}]};
    },
    anonymous(index) {
      const {ages,marked,minimum,jobs,anonymous}=spring2014Pm13Model(index);
      const borders=[...ages,1000];
      const rows=anonymous.map(([id,post,age,job])=>[String(id+1),id4(id),'*',String(post),'*','*',String(age),String(job),'','','',
        String(borders[id-1]??''),id<=11?String(jobs[id-1]):'',id<=11&&marked.includes(jobs[id-1])?'*':'',id===1?String(minimum):'']);
      rows.splice(11,0,Array<string>(15).fill('⋮'));
      return {tables:[{columns:['',...'ABCDEFGHIJKLMN'],worksheet:true,
        rows:[['1','ID','氏名','郵便番号','住所','電話番号','年齢','職業コード','マーキング','評価値','','表示年齢','職業コード変換','','多重度'],...rows]}]};
    },
    ages(index) {
      const {ages}=spring2014Pm13Model(index);
      return {tables:[{columns:['年齢区分','表示年齢'],rows:ages.map((age,i)=>
        [i===ages.length-1?age+'歳以上':age+'～'+(ages[i+1]-1)+'歳',String(age)])}]};
    },
    'job-layout':()=>({tables:[{columns:['大分類','中分類','小分類'],rows:[['1桁','1桁','1桁']]}]}),
    published(index) {
      return {tables:[{columns:['','A','B','C','D'],worksheet:true,rows:[
        ['1','郵便番号','年齢','職業コード','多重度'],...spring2014Pm13Model(index).provided],
      }],notes:['注記 郵便番号は2桁で表示している。']};
    },
    packing() {
      return {tables:[{columns:['マーキングの値','郵便番号','年齢','職業コード'],rows:[['1','12','20','420']]}],
        notes:['左から1桁、2桁、2桁、3桁の計8桁。マクロで処理済の場合は最上位桁に1、未処理の場合は0が入る。']};
    },
  },
};

function textPanel(index:number,modified:boolean):Spring2014PmLanguagePanel {
  const {width,input,punctuation}=spring2014Pm9Model(index);
  const output=formatSpring2014Text(input,width,modified?punctuation:undefined);
  const marker=Array.from({length:width},(_,i)=>(i+1)%10===0?'+':'-').join('');
  const positions='1'+Array.from({length:Math.floor(width/10)},(_,i)=>String((i+1)*10).padStart(i===0?9:10)).join('');
  return {tables:[{columns:['入力テキスト'],rows:[[textLine(input)]],mono:true},
    {columns:['出力テキスト'],rows:[[textLine(output)],[marker+'\n'+positions+'\n印字したときの文字位置']],mono:true}],
    notes:['注記 “△”は空白文字を，“↓”は改行文字を表す。']};
}

function describe(panel:Spring2014PmLanguagePanel) {
  return [...panel.tables.flatMap(table=>[
    ...(table.label?[table.label]:[]),...(table.columns?[table.columns.join('｜')]:[]),
    ...table.rows.map(row=>row.join('｜')),
  ]),...(panel.notes??[])].join('\n');
}
type Figure = BookletFigureDefinition & { panel(values:number[]):Spring2014PmLanguagePanel };
export const legacy2014SpringPm0913Figures:Figure[] = Object.entries(profiles).flatMap(([question,loaders])=>
  Object.entries(loaders).map(([name,load])=>{
    const panel=(values:number[])=>load(selectCase(values,spring2014Pm0913CaseCount));
    return {
      profile:'legacy-2014-spring-pm-'+question+'-'+name,
      domain:[[0,spring2014Pm0913CaseCount-1]],panel,alt:(values:number[])=>describe(panel(values)),
      validate:(values:number[])=>{ panel(values); },
    };
  }),
);
