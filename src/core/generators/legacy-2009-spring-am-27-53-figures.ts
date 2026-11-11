import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';

export const normalizationCases = [
  {relation:'従業員', columns:['従業員番号','従業員氏名','技能コード','技能名','技能経験年数'], owner:'pair',
    premise:''},
  {relation:'貸出機器', columns:['機器番号','機器名','利用部署コード','利用部署名','導入年度'], owner:'left',
    premise:'機器番号で機器名と導入年度が一意に決まり，利用部署コードで利用部署名が決まる。一つの機器は複数の部署で使われる。'},
  {relation:'講師', columns:['講師番号','講師氏名','講座コード','講座名','標準時間'], owner:'right',
    premise:'講師番号で講師氏名が決まり，講座コードで講座名と標準時間が決まる。一人の講師は複数の講座を担当する。'},
  {relation:'仕入先', columns:['仕入先コード','仕入先名','商品コード','商品名','契約単価'], owner:'pair',
    premise:'仕入先コードで仕入先名，商品コードで商品名が決まる。契約単価は仕入先と商品の組合せで決まる。'},
] as const;

type Cell = {label:string; primary:boolean};
export function normalizationTables(index:number, option:number): Cell[][] {
  const {columns,owner}=normalizationCases[index];
  const cell=(column:number,primary=false):Cell=>({label:columns[column],primary});
  const first=[cell(0,true),cell(1)];
  const second=[cell(2,true),cell(3)];
  const extra=cell(4);
  const candidates=[
    [first,[...second,extra]],
    [[cell(0,true),cell(1),cell(2,true),extra],second],
    [[cell(0,true),cell(2,true),extra],first,second],
    [[cell(0,true),cell(2,true)],owner==='right'?first:[...first,extra],owner==='right'?[...second,extra]:second],
  ];
  return candidates[option];
}

const mailCases = [
  {server:'メールサーバ',client:'メールクライアント',receive:'POP3'},
  {server:'社内メールサーバ',client:'メールクライアント',receive:'IMAP4'},
  {server:'メールサーバ',client:'外出先のメールクライアント',receive:'IMAP4'},
  {server:'メールサーバ',client:'保管用メールクライアント',receive:'POP3'},
] as const;
export const mailAt=(index:number)=>mailCases[index];

export const arrowEdges = [['A','B'],['A','C'],['A','F'],['B','E'],['C','D'],['D','E'],['D','H'],['F','G'],['G','H'],['E','I'],['H','I']] as const;
export const arrowCases = [
  [3,1,2,4,6,1,1,3,2,5,4],
  [4,2,2,5,4,1,1,3,3,5,3],
  [2,2,3,3,3,2,1,3,3,6,2],
  [3,2,2,6,4,1,2,2,1,5,3],
] as const;

export const drawingIds=['32-a','32-i','32-u','32-e','39-mail','51-arrow'] as const;
export type DrawingId=typeof drawingIds[number];
export const profile=(id:DrawingId)=>'legacy-2009-spring-am-'+id;
export function drawingCaption(id:DrawingId) {
  if(id==='39-mail') return 'メール送信・受信・転送の経路';
  if(id==='51-arrow') return '作業A～Iのアローダイアグラム';
  return '第3正規形の候補';
}
export function drawingAlt(id:DrawingId,index:number) {
  if(id==='39-mail') {
    const {server,client}=mailAt(index);
    return '左上に'+server+'、右上にメールサーバ、左下に'+client+'。①メール送信は'+client+'→左のサーバ。②メール受信は左のサーバ→'+
      client+'。③メール転送は両サーバ間の双方向の矢印。';
  }
  if(id==='51-arrow') return 'Aの作業開始時を0日とする。矢線と作業所要日数は'+arrowEdges.map(([from,to],i)=>
    from+'→'+to+' '+arrowCases[index][i]+'日').join('，')+'。';
  const option=drawingIds.indexOf(id);
  return normalizationTables(index,option).map(row=>row.map(({label,primary})=>label+(primary?'（主キー）':'')).join('，')).join('｜');
}
export const drawing=(id:DrawingId,index:number)=>figure(profile(id),[index],drawingCaption(id),drawingAlt(id,index));

export const legacy2009SpringAm2753Figures:readonly BookletFigureDefinition[]=drawingIds.map(id=>({
  profile:profile(id), domain:[[0,3]],
  validate(values) {
    if(values.length!==1||!Number.isSafeInteger(values[0])||values[0]<0||values[0]>3)
      throw new DataError('FIGURE_PROFILE','図の値が登録された入力域と一致しません。');
  },
  alt:([index])=>drawingAlt(id,index),
}));
