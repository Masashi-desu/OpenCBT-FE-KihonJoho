import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';

export const taskStates=['実行状態','実行可能状態','待ち状態'] as const;
export const taskEdges=[
  ['外部','実行可能状態'],['実行可能状態','実行状態'],['実行状態','実行可能状態'],
  ['実行状態','待ち状態'],['待ち状態','実行可能状態'],['実行状態','外部'],
] as const;
type Segment=readonly [kind:'稼働'|'修理',label:string,complete:boolean];
const run=(label:string,complete=true):Segment=>['稼働',label,complete];
const repair=(label:string,complete=true):Segment=>['修理',label,complete];
export const systemObservations=[
  [run('t₁'),repair('r₁'),run('t₂'),repair('r₂'),run('t₃'),repair('r₃'),run('t₄',false)],
  [run('t₁'),repair('r₁'),run('t₂'),repair('r₂'),run('t₃'),repair('r₃',false)],
  [repair('r₁'),run('t₁'),repair('r₂'),run('t₂'),repair('r₃')],
  [run('t₁'),repair('r₁'),run('t₂'),repair('r₂'),run('t₃'),repair('r₃'),run('t₄'),repair('r₄',false)],
] as const;
export const branchOperators=['A OR B','A AND B','A XOR B','A AND (NOT B)'] as const;
export const scheduleCases=[
  {duration:10,effort:200,work:[16,33,42,9],time:[20,30,40,10],choices:[18,20,21,22]},
  {duration:10,effort:200,work:[24,27,42,7],time:[20,30,40,10],choices:[18,20,21,24]},
  {duration:20,effort:600,work:[14,27,48,11],time:[20,30,40,10],choices:[27,30,33,36]},
  {duration:10,effort:400,work:[16,24,33,27],time:[20,30,30,20],choices:[32,40,44,54]},
] as const;
export const schedulePhases=['要件定義','設計','開発・テスト','システムテスト'] as const;

export const drawingIds=['29-state','34-uptime','44-branch','46-allocation'] as const;
export type DrawingId=typeof drawingIds[number];
export const profile=(id:DrawingId)=>'legacy-2008-autumn-am-'+id;
const captions:Record<DrawingId,string>={
  '29-state':'タスクの状態遷移図','34-uptime':'システムの稼働モデル','44-branch':'判定条件を含む処理の流れ','46-allocation':'工程ごとの工数と期間の配分',
};
export function drawingAlt(id:DrawingId,index:number) {
  if(id==='29-state') return '上に実行状態，左下に実行可能状態，右下に待ち状態。矢印の向きは'+taskEdges.map(edge=>edge.join('→')).join('，')+'。';
  if(id==='34-uptime') return '左から'+systemObservations[index].map(([kind,label,complete])=>kind+' '+label+
    (!complete&&index!==0?'（観測終了時は継続中）':'')).join('，')+'。稼働から修理に変わる境に故障発生の下向き矢印。各区間の下に時間範囲と添字。';
  if(id==='44-branch') return '上から判定 '+branchOperators[index]+' に入る。真なら下の命令を実行し，偽なら命令を実行せず右を通る。二つの経路は命令の後で合流する。';
  const {work,time}=scheduleCases[index];
  return '配分表。列の工程名は'+schedulePhases.join('，')+'。工数配分は順に'+work.map(value=>value+'%').join('，')+
    '。期間配分は順に'+time.map(value=>value+'%').join('，')+'。';
}
export const drawing=(id:DrawingId,index:number)=>figure(profile(id),[index],captions[id],drawingAlt(id,index));
export const legacy2008AutumnAm2753Figures:readonly BookletFigureDefinition[]=drawingIds.map(id=>({
  profile:profile(id),domain:[[0,3]],
  validate(values) {
    if(values.length!==1||!Number.isSafeInteger(values[0])||values[0]<0||values[0]>3)
      throw new DataError('FIGURE_PROFILE','図の値が登録された入力域と一致しません。');
  },
  alt:([index])=>drawingAlt(id,index),
}));
