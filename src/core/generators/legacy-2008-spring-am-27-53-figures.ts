import {DataError} from '../errors';
import type {BookletFigureDefinition} from '../booklet-figure-extension-contract';
import {figure} from './definition';

export const architectureCases=[
  {mode:'duplex',left:'切替装置',right:'切替装置',ends:['現用系周辺装置','待機系周辺装置'],processors:['CPU','CPU']},
  {mode:'simplex',left:'',right:'',ends:['周辺装置'],processors:['CPU']},
  {mode:'dual',left:'同報装置',right:'結果照合',ends:['処理結果'],processors:['CPU','CPU']},
  {mode:'parallel',left:'作業分割',right:'結果統合',ends:['処理結果'],processors:['CPU','CPU']},
] as const;
export const lanCases=[
  {clients:3,printers:2},{clients:2,printers:3},{clients:4,printers:2},{clients:2,printers:4},
] as const;
export const dfdCases=[
  {sender:'受注システム',input:'受注情報',task:['売上計算'],output:'売上情報',next:['売上台帳','の作成']},
  {sender:'請求受付',input:'請求対象',task:['請求額計算'],output:'請求情報',next:['請求書','の作成']},
  {sender:'出荷システム',input:'出荷情報',task:['受注照合'],output:'照合結果',next:['出荷記録','の作成']},
  {sender:'請求システム',input:'請求情報',task:['残高計算'],output:'残高情報',next:['残高台帳','の作成']},
] as const;
type Pair=readonly [a:number,b:number];
type BranchCase={
  statement:string;existing:readonly Pair[];options:readonly (readonly Pair[])[];
  a:(value:number)=>boolean;b:(value:number)=>boolean;
};
export const branchCases:readonly BranchCase[]=[
  {statement:'A > 6 or B = 0',a:value=>value>6,b:value=>value===0,
    existing:[[4,1],[5,0]],options:[[[3,0],[7,2]],[[3,2],[8,0]],[[4,0],[8,0]],[[7,0],[8,2]]]},
  {statement:'A ≥ 5 and B = 2',a:value=>value>=5,b:value=>value===2,
    existing:[[6,2],[4,2]],options:[[[3,0],[7,1]],[[3,2],[8,0]],[[4,0],[8,2]],[[7,1],[8,0]]]},
  {statement:'A < 4 or B ≠ 1',a:value=>value<4,b:value=>value!==1,
    existing:[[2,1],[5,1]],options:[[[3,1],[7,2]],[[5,2],[1,0]],[[4,1],[2,2]],[[6,2],[8,0]]]},
  {statement:'A > 7 and B = 3',a:value=>value>7,b:value=>value===3,
    existing:[[9,3],[8,0]],options:[[[8,3],[5,0]],[[3,3],[8,0]],[[4,0],[7,3]],[[3,2],[5,0]]]},
];
export const chargePlots={
  '50-a':{points:[[0,82],[2,45],[5,30],[10,22]],description:'縦軸の正の位置から右下がりに進む。下がり方は右へ行くほど緩やか。'},
  '50-i':{points:[[0,0],[5,62],[10,62]],description:'原点から右上がりに進み，途中から水平になる。'},
  '50-u':{points:[[0,0],[2,37],[5,62],[10,73]],description:'原点から右上がりに進む。上がり方は右へ行くほど緩やか。'},
  '50-e':{points:[[0,0],[4,13],[7,35],[10,82]],description:'原点から右上がりに進む。上がり方は右へ行くほど急になる。'},
} as const;
export type ChargeId=keyof typeof chargePlots;
export const chargeIds=Object.keys(chargePlots) as ChargeId[];
export const drawingIds=['31-system','32-lan','42-dfd','48-flow',...chargeIds] as const;
export type DrawingId=typeof drawingIds[number];
export const profile=(id:DrawingId)=>'legacy-2008-spring-am-'+id;
export function drawingCaption(id:DrawingId) {
  if(id==='31-system')return 'システム構成';
  if(id==='32-lan')return 'LANへの装置接続';
  if(id==='42-dfd')return '売上関連のデータフロー図';
  if(id==='48-flow')return 'テスト対象の流れ図';
  return '使用量と利用料金のグラフ';
}
export function drawingAlt(id:DrawingId,index:number) {
  if(id==='31-system') {
    const {mode,left,right,processors,ends}=architectureCases[index];
    if(mode==='simplex') return '左の3本の回線から通信制御装置，CPU1台，周辺装置へ順に接続。切替装置と待機系はない。';
    return '左の3本の回線から通信制御装置と'+left+'へ。そこから上下の'+processors.join('・')+'に分かれ，'+right+'を経て'+
      (ends.length===1?ends[0]:'上の'+ends[0]+'と下の'+ends[1])+'につながる。';
  }
  if(id==='32-lan') {
    const {clients,printers}=lanCases[index];
    return '横のLANに，上側のサーバ1台，下側のクライアント'+clients+'台とプリンタ'+printers+'台をそれぞれ接続。';
  }
  if(id==='42-dfd') {
    const d=dfdCases[index];
    return '左の'+d.sender+'から「'+d.input+'」が'+d.task.join('')+'へ。下のデータストアAからも'+d.task.join('')+'へ。'+
      d.task.join('')+'から「'+d.output+'」が'+d.next.join('')+'へ進み，そこから右の外へ矢印。';
  }
  if(id==='48-flow')return '処理1の後に'+branchCases[index].statement+'を判定。Yesは下の処理2へ，Noは右へ迂回。二つは処理2の直後で合流。';
  return '横軸は使用量，縦軸は利用料金，原点に0。'+chargePlots[id].description;
}
export const drawing=(id:DrawingId,index:number)=>figure(profile(id),[index],drawingCaption(id),drawingAlt(id,index));
export const legacy2008SpringAm2753Figures:readonly BookletFigureDefinition[]=drawingIds.map(id=>({
  profile:profile(id),domain:[[0,3]],
  validate(values) {
    if(values.length!==1||!Number.isSafeInteger(values[0])||values[0]<0||values[0]>3)throw new DataError('FIGURE_PROFILE','図の値が登録された入力域と一致しません。');
  },
  alt:([index])=>drawingAlt(id,index),
}));
