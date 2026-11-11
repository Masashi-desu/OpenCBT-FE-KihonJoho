import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';

export const ledgers = [
  { name:'受注台帳', tables:['注文','顧客'], key:'注文番号', shared:'顧客ID', attribute:'顧客名',
    first:['注文年月日','顧客ID','顧客名','顧客住所','品目','数量'], second:['送付先','支払方法','受注金額'], item:'支払方法', premise:'送付先と支払方法は注文ごとに決める' },
  { name:'貸出台帳', tables:['貸出','利用者'], key:'貸出番号', shared:'利用者ID', attribute:'利用者氏名',
    first:['貸出年月日','利用者ID','利用者氏名','利用者住所','資料名','冊数'], second:['返却場所','返却予定日','貸出料'], item:'返却予定日', premise:'返却場所と返却予定日は貸出ごとに決める' },
  { name:'発注台帳', tables:['発注','仕入先'], key:'発注番号', shared:'仕入先ID', attribute:'仕入先名',
    first:['発注年月日','仕入先ID','仕入先名','仕入先住所','品目','数量'], second:['納品先','納入予定日','発注金額'], item:'納入予定日', premise:'納品先と納入予定日は発注ごとに決める' },
] as const;

const baseCustomers = [['C005','福島'],['D010','千葉'],['K001','長野'],['L035','宮崎']] as const;
const recordCases = [
  {orders:[['0001','C005'],['0002','K001'],['0003','C005'],['0004','D010']],customers:baseCustomers},
  {orders:[['0001','F020'],['0002','K001'],['0003','L035'],['0004','D010']],customers:[['F020','福井'],...baseCustomers.slice(1)]},
  {orders:[['0001','C005'],['0002','K001'],['0003','C005'],['0004','F020']],customers:[baseCustomers[0],['F020','福井'],...baseCustomers.slice(2)]},
] as const;
export const orderColumns = ['伝票番号','顧客番号'], customerColumns = ['顧客番号','顧客名'];
export const operations = [
  {table:'顧客', action:'削除', row:['L035','宮崎']},
  {table:'注文', action:'追加', row:['0005','D010']},
  {table:'注文', action:'追加', row:['0006','F020']},
  {table:'注文', action:'削除', row:['0002','K001']},
] as const;

export const subnets = [
  { mask:'255.255.255.128',ports:['172.16.0.1','172.16.1.5'], hosts:['172.16.0.10','172.16.0.130','172.16.1.140','172.16.1.20'] },
  { mask:'255.255.255.192',ports:['192.168.4.65','192.168.5.129'], hosts:['192.168.4.70','192.168.4.110','192.168.5.90','192.168.5.220'] },
  { mask:'255.255.255.224',ports:['10.20.4.33','10.20.5.97'], hosts:['10.20.4.70','10.20.4.55','10.20.5.110','10.20.5.135'] },
  { mask:'255.255.255.128',ports:['172.20.8.129','172.20.9.1'], hosts:['172.20.8.30','172.20.8.90','172.20.9.100','172.20.9.110'] },
] as const;

export const trees = [
  ['システム開発','企画プロセス','要件定義プロセス','プロセス開始\nの準備','利害関係者\n要件の定義'],
  ['業務移行','移行計画','データ移行','移行対象の\n選定','データの\n変換'],
  ['機器更新','調達','設置作業','設置場所の\n確保','機器の\n配置'],
  ['教材制作','企画','原稿作成','構成の\n決定','各章の\n執筆'],
] as const;
const durations = [
  [30,5,30,20,40,25,30,30], [25,30,20,25,35,30,30,25],
  [30,15,35,25,45,25,30,30], [35,20,20,35,40,30,30,30],
] as const;
export const connections = [[1,2],[2,3],[2,4],[2,5],[3,6],[4,6],[5,6],[6,7]] as const;
export const dummy = [[3,4],[4,5]] as const;

function check<T>(values: number[], items: readonly T[]) {
  if(values.length!==1||!Number.isSafeInteger(values[0])||values[0]<0||values[0]>=items.length)
    throw new DataError('FIGURE_PROFILE','図の値が登録された入力域と一致しません');
  return items[values[0]];
}
export const ledgerAt = (values:number[]) => check(values,ledgers);
export const recordsAt = (values:number[]) => check(values,recordCases);
export const subnetAt = (values:number[]) => check(values,subnets);
export const treeAt = (values:number[]) => check(values,trees);
export const projectAt = (values:number[]) => check(values,durations);

export const optionIds = ['33-option-a','33-option-i','33-option-u','33-option-e'] as const;
export const drawings = {
  '29-ledger': {caption:'分解前の表',count:ledgers.length,alt:(v:number[])=>{
    const row=ledgerAt(v);
    return row.name+'（'+[row.key,...row.first].join('，')+'，\n　　　　　'+row.second.join('，')+'）。'+row.key+'に下線。';
  }},
  '33-records': {caption:'注文表と顧客表',count:recordCases.length,alt:(v:number[])=>{
    const {orders,customers}=recordsAt(v);
    return '注文。'+orderColumns.join('｜')+'。'+orders.map(row=>row.join('｜')).join('。')+
      '。顧客。'+customerColumns.join('｜')+'。'+customers.map(row=>row.join('｜')).join('。')+'。';
  }},
  ...Object.fromEntries(optionIds.map((id,i)=>[id,{caption:'操作の対象行',count:recordCases.length,alt:()=>{
    const {table,action,row}=operations[i];
    return '“'+table+'”表'+(action==='追加'?'に行':'の行')+'（'+row.join('｜')+'）を'+action+'する。';
  }}])) as Record<typeof optionIds[number],{caption:string;count:number;alt:()=>string}>,
  '37-network': {caption:'ルータの両ポートと接続端末',count:subnets.length,alt:(v:number[])=>{
    const {ports,hosts}=subnetAt(v);
    return 'ルータの左側ポート'+ports[0]+'から左側LANへ接続。左側LANの端末Aは'+hosts[0]+'，Bは'+hosts[1]+
      '。ルータの右側ポート'+ports[1]+'から右側LANへ接続。右側LANの端末Cは'+hosts[2]+'，Dは'+hosts[3]+'。';
  }},
  '38-ftth': {caption:'宅内LANとFTTHの接続',count:1,alt:()=>
    '利用者宅内。複数のPCがハブへ接続され，ハブから装置A，装置AからONUに接続される。ONUから宅外へ光ファイバケーブル（FTTH）が延びる。'},
  '51-breakdown': {caption:'プロジェクト作業の階層図',count:trees.length,alt:(v:number[])=>{
    const [top,left,right,child1,child2]=treeAt(v).map(text=>text.replaceAll('\n',''));
    return top+'の下に'+left+'，'+right+'，ほかの作業。'+right+'の下に'+child1+'，'+child2+
      '，ほかの作業。'+left+'と'+child2+'の下にも点線で作業の続きが示される。';
  }},
  '52-network': {caption:'プロジェクトのアローダイアグラム',count:durations.length,alt:(v:number[])=>{
    const times=projectAt(v);
    return '実作業の矢印と所要日数は'+connections.map(([from,to],i)=>from+'→'+to+'が'+times[i]+'日').join('，')+
      '。3→4と4→5の破線矢印はダミー作業。凡例は矢印下の数が所要日数，破線の矢印がダミー作業。';
  }},
};
export type DrawingId = keyof typeof drawings;
export const drawingIds=Object.keys(drawings) as DrawingId[];
export const profile=(id:DrawingId)=>'legacy-2010-autumn-am-'+id;
export const renderFigure=(id:DrawingId,v:number)=>figure(profile(id),[v],drawings[id].caption,drawings[id].alt([v]));
export const legacy2010AutumnAm2753Figures:readonly BookletFigureDefinition[]=drawingIds.map(id=>({
  profile:profile(id),domain:[[0,drawings[id].count-1]],
  validate(values){check(values,Array(drawings[id].count).fill(true));},
  alt(values){return drawings[id].alt(values);},
}));
