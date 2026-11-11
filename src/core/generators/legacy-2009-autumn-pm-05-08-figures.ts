import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { ticketAt } from './legacy-2009-autumn-pm-5-model';
import { coefficientArrays, newtonAt, newtonPrograms, partialFormula, programAlt } from './legacy-2009-autumn-pm-8-model';

export const drawingIds = [
  '5-analysis','5-sequence','5-operations','8-program-1','8-program-2','8-b','8-cd','8-printed-1','8-coefficients','8-printed-2','8-partial',
] as const;
export type DrawingId = typeof drawingIds[number];
export const profile = (id: DrawingId) => 'legacy-2009-autumn-pm-' + id;
export function captions(id: DrawingId, index: number) {
  const c = ticketAt(index);
  const labels: Record<DrawingId, string> = {
    '5-analysis':'図1　分析クラス図',
    '5-sequence':'図2　販売担当者とシステムのオブジェクトとのシーケンス図',
    '5-operations':'図3　'+c.screen+'クラスと'+c.management+'クラス',
    '8-program-1':'プログラム1','8-program-2':'プログラム2','8-b':'プログラム2の一部（行9〜11）','8-cd':'プログラム2の一部（行13〜18）',
    '8-printed-1':'図1　プログラム1の印字結果','8-coefficients':'図2　係数aₖ，bₖの値の格納','8-printed-2':'図3　プログラム2の印字結果','8-partial':'fを求める式と中間結果(A)',
  };
  return labels[id];
}
export function drawingAlt(id: DrawingId, index: number) {
  if (id in newtonPrograms) return programAlt(newtonPrograms[id as keyof typeof newtonPrograms]);
  if (id === '8-coefficients') return coefficientArrays.map(row => row.label+'：要素番号 '+row.columns.join('，')+'。内容 '+row.cells.join('，')).join('\n');
  if (id === '8-partial') {
    const c = newtonAt(index);
    return partialFormula(c.quartic,c.near)+' ＋ '+c.quartic[4].toFixed(1)+'。下の括弧(A)は定数項を加える直前までを示す。';
  }
  if (id === '8-printed-1' || id === '8-printed-2') {
    const c = newtonAt(index);
    const rows = id === '8-printed-1' ? c.cubicRows : c.quarticRows;
    const highlight = id === '8-printed-1' ? '網掛けは'+c.comparison.join('，')+'行目のx。' : '網掛けは2行目のx。';
    return '各行は行番号，x，f，dの順。'+rows.map((row,i)=>(i+1)+'：'+row.join('，')).join('。')+'。'+highlight;
  }
  const c = ticketAt(index);
  if (id === '5-analysis') return [
    '長方形はクラス，直線は関連。関連の多重度は直線の上又は左，役割名は反対側に示す。',
    '顧客（氏名）1―1..*［b］（発券日時）。社員（氏名，役割は販売担当者）1―0..*［b］。［b］0..*―1［c］。',
    '［a］（名称，所在地）は［c］（'+c.service+'名，'+c.departure+'日時，'+c.arrival+'日時）と2本の線で関連する。どちらも［a］側1，［c］側0..*で，［a］側の役割は出発'+c.terminal+'と到着'+c.terminal+'。',
    '［b］0..1―1座席。［c］1―1..*座席。座席の属性は番号，席種，空席状態。座席0..*―1グレード。グレードには価格があり，'+c.grades.join('と')+'の親クラスである。',
    '列挙型の席種は'+c.seats.join('，')+'。凡例ではクラスA（属性と操作）1―0..*クラスB（属性と操作），両端に役割名。',
  ].join('\n');
  if (id === '5-sequence') return [
    '左から，販売担当者のアクタ，'+c.screen+'，'+c.management+'，［c］のライフライン。下に，生成される顧客と'+c.ticket+'がある。',
    '販売担当者→画面：'+c.inputs+'を入力し，発券可否を確認する。画面→管理：［d］。管理→［c］：［e］。［c］→管理：空席状態。管理→画面：可否。画面→自身：発券可否を表示する。',
    '販売担当者→画面→管理→［c］：座席を確保する。［c］→管理→画面：座席。',
    '販売担当者→画面→管理：顧客情報を登録する。管理は顧客を生成し，顧客を画面に返す。',
    '販売担当者→画面→管理：'+c.issue+'管理は'+c.ticket+'を生成する。',
    '凡例では人型はアクタ，「：クラス名」はクラスのインスタンス。',
  ].join('\n');
  return [
    c.screen+'の操作：'+c.inputs+'を入力し，発券可否を確認する。座席を確保する。'+c.issue+'［f］。［g］。',
    c.management+'の操作：［d］。座席を確保する。顧客情報を登録する。'+c.issue,
  ].join('\n');
}

export const drawing = (id: DrawingId, index: number) => figure(profile(id),[index],captions(id,index),drawingAlt(id,index));

export const legacy2009AutumnPm0508Figures: readonly BookletFigureDefinition[] = drawingIds.map(id => ({
  profile: profile(id), domain: [[0,3]],
  validate(values) {
    if (values.length!==1 || !Number.isSafeInteger(values[0]) || values[0]<0 || values[0]>3)
      throw new DataError('FIGURE_PROFILE','図の値が登録された入力域と一致しません。');
  },
  alt: ([index]) => drawingAlt(id,index),
}));
