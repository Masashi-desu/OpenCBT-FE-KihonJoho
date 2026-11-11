import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { binary, caseCount, caseIndex, inventoryAt, inventoryRecordFields, multiplyAt } from './legacy-2010-autumn-pm-05-08-model';

type ProgramLine = { text:string; depth:number; operation?:number; continuation?:string };
type Rail = { start:number; end:number; depth:number; kind:'loop'|'branch' };
type Program = { lines:readonly ProgramLine[]; rails:readonly Rail[] };
const line = (text:string,depth=0,operation?:number,continuation?:string):ProgramLine =>
  ({text,depth,operation,continuation});
export const programSheets:readonly Program[] = [
  {lines:[
    line('○プログラム1（M，N）'),line('○符号付き2進整数型： M，N，R'),line('○整数型： L'),
    line('・ Mを5ビットの符号付き2進整数に拡張',0,1),
    line('・ Nを8ビットの符号付き2進整数に拡張',0,2),
    line('・ Rのビット番号7～0にNを複写',0,3),line('・ Rのビット番号12～8を0で初期化',0,4),
    line('L: 1，L ≦ 8，1',1),line('Rのビット番号0のビットが1',2,5),
    line('・ Rのビット番号12～8の内容にMの値を加算',2,6),line('',2),
    line('・ Rの全13ビットを右に1ビット算術シフト',1,7,'/* 空いたビット位置には */'),
    line('',1,undefined,'/* 符号と同じものが入る */'),
    line('・ return（ Rのビット番号7～0の内容 ）',0,8,'/* 返却値（括弧内）を返す */'),
  ],rails:[{start:7,end:12,depth:0,kind:'loop'},{start:8,end:10,depth:1,kind:'branch'}]},
  {lines:[
    line('○プログラム2（M，N）'),line('○符号付き2進整数型： M，N，R'),line('○整数型： L'),
    line('・ Mを5ビットの符号付き2進整数に拡張',0,1),line('・ Rのビット番号4～1にNを複写',0,2),
    line('・ Rのビット番号9～5及び0を0で初期化',0,3),line('L: 1，L ≦ 4，1',1),
    line('Rのビット番号1のビットが0 かつ Rのビット番号0のビットが1',2,4),
    line('・ Rのビット番号9～5の内容にMの値を加算',2,5),line('',2),
    line('Rのビット番号1のビットが1 かつ Rのビット番号0のビットが0',2,6),
    line('・ Rのビット番号9～5の内容からMの値を減算',2,7),line('',2),
    line('・ Rの全10ビットを右に1ビット算術シフト',1,8,'/* 空いたビット位置には */'),
    line('',1,undefined,'/* 符号と同じものが入る */'),
    line('・ return（ Rのビット番号8～1の内容 ）',0,9,'/* 返却値（括弧内）を返す */'),
  ],rails:[{start:6,end:14,depth:0,kind:'loop'},{start:7,end:9,depth:1,kind:'branch'},{start:10,end:12,depth:1,kind:'branch'}]},
];
const marks = '①②③④⑤⑥⑦⑧⑨';
export const operationLabel = (op:number) => marks[op-1];
export function programText(index:number) {
  const {lines,rails}=programSheets[index];
  return lines.map(({text,depth,operation,continuation},i)=>{
    const opening=rails.find(rail=>rail.start===i), ending=rails.find(rail=>rail.end===i);
    const symbol=opening?.kind==='loop'?'■':opening?.kind==='branch'?'▲':ending?.kind==='loop'?'■':ending?.kind==='branch'?'▼':'';
    return (operation?operationLabel(operation)+' → ':'     ')+'  '.repeat(depth)+symbol+text+
      (continuation?(text?'  ':'                                  ')+continuation:'');
  }).join('\n');
}

type TraceRow = { bits:string; split?:number; operation?:number; test?:number; mask?:number; blank?:'a'|'b'|'c'; before?:'M'; gap?:number };
export function traceAt(index:number,kind:1|2|3) {
  const c=multiplyAt(index), m=kind===1?c.m:-c.m;
  if(kind!==3){
    const {initial,rows,result}=kind===1?c.positive:c.negative, hidden=kind===2;
    const trace:TraceRow[]=[
      {bits:initial,split:5,operation:3,test:5,before:'M'},
      {bits:rows[0].afterAdd,split:5,operation:6,mask:hidden?5:undefined},
      {bits:rows[0].shifted,split:6,operation:7,test:5,blank:hidden?'a':undefined,before:'M'},
      {bits:rows[1].afterAdd,split:6,operation:6,mask:hidden?6:undefined},
      {bits:rows[1].shifted,split:7,operation:7,test:5,blank:hidden?'b':undefined},
      {bits:rows[2].shifted,split:8,operation:7,mask:hidden?8:undefined},
      {bits:rows[6].shifted,split:12,gap:36,test:5,mask:hidden?12:undefined},
      {bits:rows[7].shifted,operation:7,mask:hidden?13:undefined},
      {bits:result,operation:8,mask:hidden?8:undefined},
    ];
    return {m,n:c.n,width:13,trace};
  }
  const {initial,rows,result}=c.booth;
  const trace:TraceRow[]=[
    {bits:'     '+binary(c.n,4)+' ',split:5,operation:2},
    {bits:initial,split:5,operation:3,test:6,before:'M'},
    {bits:rows[0].updated,split:5,operation:7,mask:5},
    {bits:rows[0].shifted,split:6,operation:8,mask:6},
    {bits:rows[1].shifted,split:7,operation:8,test:4,blank:'c',before:'M'},
    {bits:rows[2].updated,split:7,operation:5,mask:7},
    {bits:rows[2].shifted,split:8,operation:8,mask:8},
    {bits:rows[3].shifted,split:9,operation:8,mask:9},
    {bits:result,operation:9,mask:8},
  ];
  return {m,n:c.n,width:10,trace};
}
export const traceTitle = (index:number,kind:1|2|3) => {
  const {m,n}=traceAt(index,kind);
  return '図'+kind+'　プログラム'+(kind===3?2:1)+'の実行例（M＝'+m+'，N＝'+n+'）';
};
export const traceMaskNote = '注　網掛けの部分は，表示していない。';
const traceAlt = (index:number,kind:1|2|3) => {
  const {m,n,width,trace}=traceAt(index,kind);
  return '最上位からのビット番号 '+Array.from({length:width},(_,i)=>width-i-1).join('，')+
    '。初期のRは空欄。Mは'+binary(m,4)+'，Nは'+binary(n,4)+'。①でMを'+binary(m,5)+
    'へ符号拡張。'+(kind===3?'②でNをRのビット4～1に複写。':'②でNを'+binary(n,8)+'へ符号拡張。③でNをRの下位8ビットに複写し，④で上位5ビットを0にする。')+
    '\n'+trace.map((row,i)=>{
      const cut=row.blank?row.split??0:row.mask??0;
      const shown=(row.blank?'［'+row.blank+'］':row.mask?'網掛け'+row.mask+'ビット｜':'')+
        (cut?row.bits.slice(cut):row.split?row.bits.slice(0,row.split)+'｜'+row.bits.slice(row.split):row.bits);
      return (row.gap?'途中の行を省略。':'')+(row.operation?operationLabel(row.operation)+' ':'')+
        (i===trace.length-1?'返却値：':'R：')+shown.replace(/ /g,'・')+
        (row.test?'　右端を'+operationLabel(row.test)+'で確認。':'')+
        (row.before?'　次の加減算で使うMは'+binary(m,5)+'。':'');
    }).join('\n')+(kind===1?'':'\n'+traceMaskNote);
};

const drawings = {
  '5-input-output': {caption:()=>'図1　棚卸金額計算処理の流れ',alt:(i:number)=>{
    const c=inventoryAt(i);
    return c.company+'が購入した'+c.item+'の棚卸金額計算処理。期首在庫と期中受入れを受入情報作成に入力し，受入情報を得る。期中払出しを払出情報作成に入力し，払出情報を得る。受入情報と払出情報を棚卸計算に入力し，期末在庫と棚卸金額を得る。';
  }},
  '5-record':{caption:()=>'図2　受入情報ファイルのレコード様式',alt:(i:number)=>
    '受入情報ファイルの1レコードを左から順に示す。'+inventoryRecordFields(i).join('｜')+'。'},
  '5-flow': {caption:()=>'図3　棚卸計算処理の流れ',alt:(i:number)=>{
    const {reverse,processes:[first,second,third]}=inventoryAt(i);
    return '棚卸計算。変数の初期化，各ファイルを開く，受入情報読込み，払出情報読込み。KHとKUがともに最大値になるまで引当てを反復。'+
      'KU＜KH：期末在庫書込み，金額集計，'+first+'。KU＞KH：誤り処理，KUとKHを最大値にする。KU＝KH：H ← H−U，'+
      (reverse?'0とH':'Hと0')+'をこの順に比較。C1では期末在庫書込み，'+second+'を経てC2の経路に合流。C2の経路は'+third+'，払出情報読込み。残りの条件は受入情報読込み。'+
      '引当て終了後に棚卸金額書込み，各ファイルを閉じる，終了。受入情報読込み：ファイル終端ならKUを最大値，それ以外はUに受入数量，KUに突合せキー。'+
      '払出情報読込み：ファイル終端ならKHを最大値，それ以外はHに払出数量，KHに突合せキー。注　KH，KU，H，Uは作業領域である。最大値は突合せキーが取り得る値よりも大きい。';
  }},
  '8-program-1': {caption:()=>'〔プログラム1〕',alt:()=>programText(0)},
  '8-program-2': {caption:()=>'〔プログラム2〕',alt:()=>programText(1)},
  '8-trace-1': {caption:(i:number)=>traceTitle(i,1),alt:(i:number)=>traceAlt(i,1)},
  '8-trace-2': {caption:(i:number)=>traceTitle(i,2),alt:(i:number)=>traceAlt(i,2)},
  '8-trace-3': {caption:(i:number)=>traceTitle(i,3),alt:(i:number)=>traceAlt(i,3)},
};
export type DrawingId = keyof typeof drawings;
export const drawingIds=Object.keys(drawings) as DrawingId[];
export const drawingCaption=(id:DrawingId,index:number)=>drawings[id].caption(index);
export const drawingAlt=(id:DrawingId,index:number)=>drawings[id].alt(index);
export const profile=(id:DrawingId)=>'legacy-2010-autumn-pm-'+id;
export const renderFigure=(id:DrawingId,index:number)=>figure(profile(id),[index],drawingCaption(id,index),drawingAlt(id,index));
export const legacy2010AutumnPm0508Figures:readonly BookletFigureDefinition[]=drawingIds.map(id=>({
  profile:profile(id),domain:[[0,caseCount-1]],
  validate(values){
    try{caseIndex(values);}catch{throw new DataError('FIGURE_PROFILE','図と入力域が一致しません');}
  },
  alt(values){return drawingAlt(id,caseIndex(values));},
}));
