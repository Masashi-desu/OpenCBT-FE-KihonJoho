export const networkCases=[
  {prefix:'172.16',core:1,y:10,z:20},
  {prefix:'10.10',core:5,y:12,z:30},
  {prefix:'172.20',core:2,y:20,z:40},
  {prefix:'192.168',core:3,y:15,z:25},
] as const;
export function network(index:number) {
  const {prefix,core,y,z}=networkCases[index], ip=(branch:number,host:number)=>prefix+'.'+branch+'.'+host;
  const assignable=[ip(core-1,1),ip(core-1,2),ip(core,1),ip(core+1,2),ip(y,1),ip(y,2),ip(y,255),ip(z,1),ip(z,2),ip(z,255)];
  return {assignable,routerE:[ip(core,10),ip(y,1)],routerG:[ip(core,20),ip(z,1)]};
}
export const addressAnswerRows=[
  [['WebサーバH','パソコンF'],['WebサーバP','関門サーバ']],
  [['WebサーバH','パソコンF'],['WebサーバP','パソコンF']],
  [['WebサーバH','パソコンF'],['関門サーバ','パソコンF']],
  [['ルータE','パソコンF'],['関門サーバ','パソコンF']],
  [['ルータE','パソコンF'],['ルータE','関門サーバ']],
] as const;
export const permissions=[
  {game:'netgame',host:'games.example.jp',devices:['keyboard','mouse'],direction:'out',generated:false,
    filter:'kkinput',dictionary:'kkdict.dat',personal:'mydict.dat',extension:'dat'},
  {game:'matchgame',host:'arena.example.jp',devices:['mouse'],direction:'in',generated:false,
    filter:'kanafilter',dictionary:'conversion.tbl',personal:'learning.tbl',extension:'tbl'},
  {game:'linegame',host:'match.example.jp',devices:['keyboard'],direction:'both',generated:false,
    filter:'kanainput',dictionary:'base.lex',personal:'personal.lex',extension:'lex'},
  {game:'boardgame',host:'players.example.jp',devices:['keyboard','mouse'],direction:'out',generated:true,
    filter:'kkswitch',dictionary:'kanji.dic',personal:'learn.dic',extension:'dic'},
] as const;
export const radixCases=[
  {from:[2,16],to:[2,16]},
  {from:[2,8],to:[9,16]},
  {from:[9,16],to:[2,8]},
  {from:[3,12],to:[4,14]},
] as const;
export const salesCases=[
  {branches:30,total:8000,mean:6000,limit:50,branchCode:'0023'},
  {branches:24,total:7200,mean:5400,limit:60,branchCode:'0017'},
  {branches:36,total:9600,mean:7200,limit:40,branchCode:'0031'},
  {branches:20,total:7000,mean:5000,limit:75,branchCode:'0009'},
] as const;
const common=[['002411','芳香剤','298','8','3,360','1','3,112','1,307,040'],
  ['002245','シャンプー','14','68','20,264','50','1,472','438,656']];
const local=[['001203','石けん','1','314','30,772','523','510','49,980'],
  ['010204','歯ブラシ','50','221','15,028','238','1,477','100,436']];
export const salesColumns=['商品コード','商品名称','順位','販売数量','売上金額','順位','販売数量','売上金額'] as const;
export const salesLayout=['年月日','支店コード','商品コード','販売数量','売上金額'] as const;
export const rankLayout=['支店コード','商品コード','順位','販売数量','売上金額','順位','販売数量','売上金額'] as const;
export const fLayouts=[
  ['年月日','支店コード','商品コード','販売数量','売上金額'],
  ['年月日','販売数量合計','売上金額合計'],
  ['支店コード','商品コード','販売数量合計','売上金額合計'],
  ['支店コード','販売数量合計','売上金額合計'],
  ['商品コード','販売数量合計','売上金額合計'],
] as const;
export function salesReport(index:number,branchFirst:boolean) {
  const {limit,branchCode}=salesCases[index];
  const values=(branchFirst?local:common).map(row=>[...row]);
  values[1][branchFirst?2:5]=String(limit);
  return {branchCode,rows:[values[0],Array(8).fill('⋮') as string[],values[1]]};
}
