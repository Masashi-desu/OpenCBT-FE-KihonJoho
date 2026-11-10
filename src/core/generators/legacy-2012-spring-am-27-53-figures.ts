import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

export const spring2012Am2753Profiles = {
  relation: 'legacy-2012-spring-am-31-relation',
  redundancy: 'legacy-2012-spring-am-43-redundancy',
  project: 'legacy-2012-spring-am-52-critical-path',
} as const;

export const spring2012Projections = [
  { columns: ['A1', 'A2', 'A3', 'A4', 'A5'], selected: [0, 2, 4] },
  { columns: ['B1', 'B2', 'B3', 'B4', 'B5'], selected: [1, 3] },
  { columns: ['C1', 'C2', 'C3', 'C4', 'C5'], selected: [0, 2, 3, 4] },
] as const;

export const spring2012RedundancyCases = [
  { left: '稼働', right: '待機', monitor: '死活監視', mode: 'standby',
    effect: ['サーバ1が停止しても，サーバ2に', '切り替わってサービス提供を継続する。'] },
  { left: '稼働', right: '稼働', monitor: '相互監視', mode: 'active',
    effect: ['サーバ1とサーバ2は要求を分担する。', '片方が停止しても残りのサーバが応答する。'] },
  { left: '稼働', right: '停止', monitor: '手動切替', mode: 'manual',
    effect: ['サーバ1が停止したら，運用者が', 'サーバ2を起動してサービス提供を再開する。'] },
] as const;

export const spring2012ProjectCases = [
  [1, 5, 3, 3, 4, 5, 4],
  [4, 3, 3, 2, 4, 5, 3],
  [6, 3, 1, 8, 2, 3, 5],
  [1, 7, 3, 3, 4, 2, 5],
] as const;

export const spring2012ProjectEdges = [
  { label: 'A', from: 0, to: 1 }, { label: 'B', from: 0, to: 2 },
  { label: 'C', from: 1, to: 2 }, { label: 'D', from: 1, to: 4 },
  { label: 'E', from: 2, to: 3 }, { label: 'F', from: 3, to: 5 },
  { label: 'G', from: 4, to: 5 },
] as const;

export const spring2012ProjectDummy = { from: 3, to: 4 };

function exactCase<T>(values: readonly number[], cases: readonly T[]): T {
  const index = values[0];
  if (values.length !== 1 || !Number.isInteger(index) || index < 0 || index >= cases.length) {
    throw new DataError('FIGURE_PROFILE', '指定条件の図を表示できません。');
  }
  return cases[index];
}

export const spring2012Projection = (values: readonly number[]) => exactCase(values, spring2012Projections);
export const spring2012Redundancy = (values: readonly number[]) => exactCase(values, spring2012RedundancyCases);
export const spring2012ProjectDurations = (values: readonly number[]) => exactCase(values, spring2012ProjectCases);

export function spring2012RelationAlt(values: readonly number[]) {
  return '表R。列見出しは' + spring2012Projection(values).columns.join('，') + '。';
}

export function spring2012RedundancyAlt(values: readonly number[]) {
  const { left, right, mode, effect } = spring2012Redundancy(values);
  const supervision = mode === 'standby' ? 'サーバ2からサーバ1を死活監視する。'
    : mode === 'active' ? 'サーバ同士を相互監視する。' : '運用者が手動で切り替える。';
  return '元の構成はインターネットとデータにつながる稼働サーバ1台。二重化された構成はサーバ1（' + left + '）とサーバ2（'
    + right + '）がインターネットと同じデータにつながる。' + supervision + effect.join('');
}

export function spring2012ProjectAlt(values: readonly number[]) {
  const durations = spring2012ProjectDurations(values);
  const names = ['開始', '上段左', '下段左', '下段右', '上段右', '終了'];
  return 'アローダイアグラム。凡例では矢印の上が作業名，下が所要日数。' +
    spring2012ProjectEdges.map(({ label, from, to }, index) =>
      names[from] + 'から' + names[to] + 'へ作業' + label + '（' + durations[index] + '日）').join('，') +
    '。下段右から上段右への破線は所要日数0日のダミー作業。';
}

export const legacy2012SpringAm2753Figures: readonly BookletFigureDefinition[] = [
  { profile: spring2012Am2753Profiles.relation, domain: [[0, spring2012Projections.length - 1]],
    validate(values) { spring2012Projection(values); }, alt: spring2012RelationAlt },
  { profile: spring2012Am2753Profiles.redundancy, domain: [[0, spring2012RedundancyCases.length - 1]],
    validate(values) { spring2012Redundancy(values); }, alt: spring2012RedundancyAlt },
  { profile: spring2012Am2753Profiles.project, domain: [[0, spring2012ProjectCases.length - 1]],
    validate(values) { spring2012ProjectDurations(values); }, alt: spring2012ProjectAlt },
];
