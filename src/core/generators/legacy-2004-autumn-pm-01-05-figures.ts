import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2004-autumn-pm-01-05-shared';
import { addressAnswerRows, fLayouts, network, rankLayout, salesCases, salesColumns, salesLayout, salesReport } from './legacy-2004-autumn-pm-01-05-models';

export const profiles={
  network:'legacy-2004-autumn-pm-2-network',
  'address-option':'legacy-2004-autumn-pm-2-address-option',
  'sales-layout':'legacy-2004-autumn-pm-5-sales-layout',
  'joined-layout':'legacy-2004-autumn-pm-5-joined-layout',
  'report-all':'legacy-2004-autumn-pm-5-report-all',
  'report-branch':'legacy-2004-autumn-pm-5-report-branch',
  'pipeline-all':'legacy-2004-autumn-pm-5-pipeline-all',
  'pipeline-branch':'legacy-2004-autumn-pm-5-pipeline-branch',
  'f-option':'legacy-2004-autumn-pm-5-f-option',
} as const;
export type FigureKind=keyof typeof profiles;

function report(index:number,branchFirst:boolean) {
  const {branchCode,rows}=salesReport(index,branchFirst);
  return '支店コード'+branchCode+'。左から'+salesColumns.slice(0,2).join('、')+
    '、支店データの順位・販売数量・売上金額、全支店データの順位・販売数量・売上金額。'+
    rows.map(row=>row.every(value=>value==='⋮')?'中間行を省略':row.join('｜')).join('。')+'。';
}
const rules:Record<FigureKind,{count:number;alt:(index:number)=>string}>={
  network:{count:4,alt:i=>{
    const {routerE,routerG}=network(i);
    return 'インターネットにはWebサーバPとFTPサーバQが接続される。'+
      'X社内では基幹LANに関門サーバ（空欄a）、ルータE（基幹側'+routerE[0]+'）とルータG（基幹側'+routerG[0]+'）が接続される。'+
      'ルータEは基幹LANとY部門LANを接続する。Y部門側は'+routerE[1]+'。Y部門LANにはパソコンFのほか，空欄bのパソコンなどがある。'+
      'ルータGは基幹LANとZ部門LANを接続する。Z部門側は'+routerG[1]+'。Z部門LANには空欄cのWebサーバHとその他のパソコンがある。';
  }},
  'address-option':{count:5,alt:i=>addressAnswerRows[i].map((row,n)=>
    'Webサーバ'+(n?'P':'H')+'の場合 '+row.join('｜')).join('。')+'。'},
  'sales-layout':{count:1,alt:()=> '左から'+salesLayout.join('、')+'の五項目。'},
  'joined-layout':{count:1,alt:()=> '左から'+rankLayout.slice(0,2).join('、')+
    '、支店データの順位・販売数量・売上金額、全支店データの順位・販売数量・売上金額。'},
  'report-all':{count:4,alt:i=>report(i,false)},
  'report-branch':{count:4,alt:i=>report(i,true)},
  'pipeline-all':{count:4,alt:i=>'売上実績ファイルは、売上上位'+salesCases[i].limit+'商品の抽出→Fファイルと、支店ごとの順位付け→Gファイルに分かれる。'+
    'FとGを照合してHファイル。Hと商品マスタファイルから支店別売上実績表を作成し、売上実績表を出力する。'},
  'pipeline-branch':{count:1,alt:()=> '売上実績ファイルは、売上合計の計算→Lファイル→ステップ1→L1ファイル→ステップ2→L2ファイルと、'+
    '売上上位商品の抽出→Mファイル→商品コードで整列→M1ファイルに分かれる。L2とM1を照合してNファイル。'+
    'Nと商品マスタファイルから支店別売上実績表を作成し、売上実績表を出力する。'},
  'f-option':{count:5,alt:i=>fLayouts[i].join('｜')+'。'},
};
export const legacy2004AutumnPm0105Figures:readonly BookletFigureDefinition[]=(Object.keys(profiles) as FigureKind[]).map(kind=>{
  const {count,alt}=rules[kind];
  return {profile:profiles[kind],domain:[[0,count-1]],validate(values){selectCase(values,count-1);},alt(values){return alt(selectCase(values,count-1));}};
});
export function draw(kind:FigureKind,index:number,caption:string) {
  const {count,alt}=rules[kind];
  selectCase([index],count-1);
  return {...figure(profiles[kind],[index],caption,alt(index)),captionPresentation:'accessible' as const};
}
