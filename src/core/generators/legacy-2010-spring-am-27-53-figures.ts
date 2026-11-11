import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';

export type Relation = { name:string; columns:readonly string[]; keys:readonly string[] };
const relation=(name:string,columns:readonly string[],keys:readonly string[]):Relation=>({name,columns,keys});
export const normalizeCases=[
  {ledger:'発注伝票',detail:'発注',master:'商品',left:'注文番号',right:'商品番号',attribute:'商品名',quantity:'注文数量',owner:'right'},
  {ledger:'教材利用',detail:'教材利用明細',master:'講座',left:'講座番号',right:'教材番号',attribute:'講座名',quantity:'必要部数',owner:'left'},
  {ledger:'資料貸出',detail:'貸出明細',master:'資料',left:'貸出番号',right:'資料番号',attribute:'資料名',quantity:'貸出冊数',owner:'right'},
  {ledger:'検査記録',detail:'検査明細',master:'検査',left:'検査番号',right:'部品番号',attribute:'検査場所',quantity:'検査数',owner:'left'},
] as const;
export function normalizationRelations(index:number,option?:number):readonly Relation[]{
  const {ledger,detail,master,left,right,attribute,quantity,owner}=normalizeCases[index], key=owner==='left'?left:right;
  if(option===undefined)return [relation(ledger,[left,right,attribute,quantity],[left,right])];
  const row=option<2?relation(detail,[left,quantity],[left]):relation(detail,[left,right,quantity],[left,right]);
  const masterRows=[
    relation(master,[key,attribute],[key]),relation(master,[left,right,attribute],[left,right]),
    relation(master,[key,attribute],[key]),relation(master,[key,attribute,quantity],[key]),
  ];
  return [row,masterRows[option]];
}
export const relationText=(row:Relation)=>row.name+'（'+row.columns.join('，')+'）';
const relationAlt=(rows:readonly Relation[])=>rows.map(row=>relationText(row)+'。主キーの下線：'+row.keys.join('，')+'。').join('\n');

export const queryCases=[
  {outer:'商品',inner:'在庫',match:'商品番号',outerCols:['商品番号','商品名','単価'],innerCols:['在庫番号','商品番号','在庫数'],negated:true},
  {outer:'車両',inner:'点検',match:'車両番号',outerCols:['車両番号','車種','型式'],innerCols:['点検番号','車両番号','点検日'],negated:false},
  {outer:'書籍',inner:'予約',match:'書籍番号',outerCols:['書籍番号','書名','価格'],innerCols:['予約番号','書籍番号','予約日'],negated:true},
  {outer:'設備',inner:'修繕',match:'設備番号',outerCols:['設備番号','設備名','取得日'],innerCols:['修繕番号','設備番号','費用'],negated:false},
] as const;
export function queryRelations(index:number):readonly Relation[]{
  const {outer,inner,outerCols,innerCols}=queryCases[index];
  return [relation(outer,outerCols,[outerCols[0]]),relation(inner,innerCols,[innerCols[0]])];
}

export const accessCases=[
  {top:'電話機',bottom:'PC',device:'ADSLモデム',line:'電話回線'},
  {top:'アナログ電話機',bottom:'PC',device:'シリアル接続機器',line:'ISDN回線'},
  {top:'事務用PC',bottom:'作業用PC',device:'小型ハブ',line:'アナログ電話回線'},
  {top:'PC',bottom:'監視端末',device:'中継器',line:'Ethernet配線'},
] as const;
export const dfdTargets=['○','2本の平行線','矢印','四角'] as const;

export const notation=[
  ['1','0..*','A1件にBが0件以上，B1件にAが1件。'],
  ['0..*','1..*','A1件にBが1件以上，B1件にAが0件以上。'],
] as const;
export const entityNames=['商品','仕入先','発注明細','発注','納品','納品明細'] as const;
type RelationEdge=readonly [left:number,right:number,leftMark:string,rightMark:string];
const relationEdges:readonly RelationEdge[]=[
  [0,1,'0..*','1..*'],[0,2,'1','0..*'],[2,3,'1..*','1'],[1,3,'1','0..*'],
  [1,4,'1','0..*'],[3,4,'1','0..*'],[4,5,'1','1..*'],[0,5,'1','0..*'],
];
export function erEdges(index:number):readonly RelationEdge[]{
  return relationEdges.map(([left,right,lmark,rmark],i)=>{
    if(i===0&&index===1)return [left,right,lmark,'1'];
    if(i===3&&index!==0)return [left,right,'1..*',rmark];
    if(i===2&&index===2)return [left,right,'1',rmark];
    return [left,right,lmark,rmark];
  });
}

export const taskLinks=[[1,2],[2,3],[3,5],[2,4],[4,5],[4,6],[5,7],[6,7],[7,8]] as const;
export const projectCases=[
  {times:[4,7,2,2,9,6,3,5,2],shorter:6},
  {times:[4,8,4,2,9,6,3,5,2],shorter:6},
  {times:[4,7,2,2,9,6,3,4,2],shorter:6},
  {times:[4,6,2,2,9,6,3,3,2],shorter:6},
] as const;

const normalOptions=['30-option-a','30-option-i','30-option-u','30-option-e'] as const;
export { normalOptions };
const normOptions=Object.fromEntries(normalOptions.map((id,i)=>[id,{
  caption:'発注データの表分解',count:normalizeCases.length,alt:(index:number)=>relationAlt(normalizationRelations(index,i)),
}])) as Record<typeof normalOptions[number],{caption:string;count:number;alt:(index:number)=>string}>;
const drawings={
  '30-ledger':{caption:'分解前の表',count:normalizeCases.length,alt:(i:number)=>relationAlt(normalizationRelations(i))},
  ...normOptions,
  '31-relations':{caption:'SQLの対象となる表の構成',count:queryCases.length,alt:(i:number)=>relationAlt(queryRelations(i))},
  '35-access':{caption:'宅内の装置Aと回線の接続',count:accessCases.length,alt:(i:number)=>{
    const {top,bottom,device,line}=accessCases[i];
    return '利用者宅内。'+bottom+'―'+device+'―装置Aと，'+top+'―装置Aが接続される。装置Aから'+line+'が宅外へ延びる。';
  }},
  '45-dfd':{caption:'構造化分析のDFDの例',count:dfdTargets.length,alt:()=>
    '左の四角から左上の円へ，左上の円から平行線へ，平行線から中央下の円へ，中央下の円から右上の円へ，右上の円から右の四角へ矢印が向かう。'},
  '46-notation':{caption:'〔表記法〕',count:3,alt:()=>
    notation.map(([left,right,text])=>'A端 '+left+'―B端 '+right+'。'+text).join('\n')},
  '46-erd':{caption:'〔E-R図〕',count:3,alt:(i:number)=>erEdges(i).map(([left,right,lmark,rmark])=>
    entityNames[left]+lmark+'―'+rmark+entityNames[right]).join('。')+'。'},
  '51-project':{caption:'九つの作業のアローダイアグラム',count:projectCases.length,alt:(i:number)=>
    '実作業の矢印。'+taskLinks.map(([left,right],j)=>'ABCDEFGHI'[j]+' '+left+'→'+right+' '+projectCases[i].times[j]+'日').join('，')+
    '。凡例は矢印上が作業名，下が所要日数。'},
};
export type DrawingId=keyof typeof drawings;
export const drawingIds=Object.keys(drawings) as DrawingId[];
export const profile=(id:DrawingId)=>'legacy-2010-spring-am-'+id;
export const drawingCaption=(id:DrawingId)=>drawings[id].caption;
export const drawingAlt=(id:DrawingId,index:number)=>(drawings[id].alt as (i:number)=>string)(index);
export const renderFigure=(id:DrawingId,index:number)=>figure(profile(id),[index],drawingCaption(id),drawingAlt(id,index));
export const legacy2010SpringAm2753Figures:readonly BookletFigureDefinition[]=drawingIds.map(id=>({
  profile:profile(id),domain:[[0,drawings[id].count-1]],
  validate(values){
    const [index]=values;
    if(values.length!==1||!Number.isSafeInteger(index)||index<0||index>=drawings[id].count)
      throw new DataError('FIGURE_PROFILE','図の値が登録された入力域と一致しません');
  },
  alt(values){return drawingAlt(id,values[0]);},
}));
