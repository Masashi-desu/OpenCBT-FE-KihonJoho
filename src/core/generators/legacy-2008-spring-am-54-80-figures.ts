import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { DataError } from '../errors';

function drawing(suffix: string, alt: BookletFigureDefinition['alt']): BookletFigureDefinition {
  return {
    profile: 'legacy-2008-spring-am-' + suffix,
    domain: [[0, 3]],
    validate(values) {
      if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2008年度春期旧午前の図の入力が範囲外です');
    },
    alt,
  };
}

type FunctionalDependency = { left: string[]; right: string };
export function functionalDependencies(index: number): FunctionalDependency[] {
  const split = [
    { single: 'b', leaves: 'fg' }, { single: 'b', leaves: 'f' },
    { single: 'c', leaves: 'gh' }, { single: 'b', leaves: 'g' },
  ][index];
  return [
    ...[...'bcde'].map(right => ({ left: ['a'], right })),
    ...[...'fgh'].map(right => ({ left: split.leaves.includes(right) ? [split.single] : ['b', 'c'], right })),
  ];
}
export const dependencyFigure = drawing('56-functional-dependencies', ([index]) =>
  '関数従属：' + functionalDependencies(index).map(({ left, right }) => '［' + left.join('，') + '］→［' + right + '］').join('，') + '。bとcを囲む枠から出る矢印は二属性の組による。');

type Column = { label: string; key?: 'primary' | 'foreign' | 'both' };
type Relation = { name?: string; columns: Column[] };
const column = (label: string, key?: Column['key']): Column => ({ label, key });
const department = '診療科コード', doctor = '医師番号', patient = '患者番号', date = '診察日時';
export const clinicSchema: Relation[] = [
  { name: '診療科', columns: [column(department, 'primary'), column('診療科名称')] },
  { name: '医師', columns: [column(doctor, 'primary'), column('医師名'), column(department, 'foreign')] },
  { name: '患者', columns: [column(patient, 'primary'), column('患者名')] },
];
export const clinicChoices: Relation[] = [
  { columns: [column(doctor, 'both'), column(patient, 'both'), column(date, 'primary')] },
  { columns: [column(doctor, 'both'), column(date, 'primary')] },
  { columns: [column(department, 'both'), column(doctor, 'both'), column(date, 'primary')] },
  { columns: [column(department, 'both'), column(patient, 'both'), column(date, 'primary')] },
];
function tableAlt({ name, columns }: Relation) {
  const meaning = { primary: '主キーの項目', foreign: '外部キーの項目', both: '主キーと外部キーの項目' };
  return (name ? name + '：' : '') + columns.map(({ label, key }) => label + (key ? '（' + meaning[key] + '）' : '')).join('｜') + '。';
}
export const clinicSchemaFigure = drawing('57-clinic-schema', () => clinicSchema.map(tableAlt).join(''));
export const clinicChoiceFigures = [...'abcd'].map((letter, position) =>
  drawing('57-clinic-relation-' + letter, () => tableAlt(clinicChoices[position])));

export const connectionThreats = [
  '攻撃者による盗聴', '未承認クライアントからの接続', '運用権限のない利用者による停止', '既定ポートだけを対象とする自動試行',
];
export const databaseLinkFigure = drawing('65-database-connection', ([index]) =>
  'クライアント内のアプリケーションがクライアント側データベース接続プログラムに接続する。通信経路でつながるサーバ側データベース接続プログラムが，サーバ内のデータベースに接続する。点線矢印：' + connectionThreats[index] + '。');

export const salesAxisFigure = drawing('71-sales-quadrants', () =>
  '横軸は自社との年間取引実績金額で右ほど多い。縦軸は取引先企業の年間購買推定金額で上ほど多い。領域Aは左上，Bは右上，Cは左下，Dは右下。');

const nodeEdges = [
  ['A', 1, 2], ['B', 1, 4], ['C', 1, 3], ['D', 4, 5], ['E', 2, 7], ['F', 5, 7], ['G', 5, 6],
] as const;
const durations = [
  [5, 4, 3, 2, 5, 2, 5], [6, 3, 4, 3, 7, 3, 4],
  [4, 5, 2, 3, 5, 4, 2], [7, 4, 5, 3, 3, 6, 4],
];
export function activityEdges(index: number) {
  return [...nodeEdges.map(([name, from, to], position) => ({ name: String(name), from, to, days: durations[index][position] })),
    { name: '', from: 3, to: 4, days: 0 }, { name: '', from: 6, to: 7, days: 0 }];
}
export const criticalPathFigure = drawing('75-critical-path', ([index]) =>
  '節点1〜7。' + activityEdges(index).map(({ name, from, to, days }) => from + '→' + to + '：' +
    (name ? '作業' + name + '，' + days + '日' : 'ダミー作業（0日）')).join('。') + '。');

export const qualityCounts = [
  [37, 25, 12, 6, 6], [30, 22, 13, 9, 6], [26, 23, 19, 8, 4], [34, 19, 16, 7, 4],
];
const chartPositions = [[0, 1, 2, 3], [1, 0, 2, 3], [2, 1, 0, 3], [3, 2, 1, 0]];
export function qualityChart(index: number, position: number) {
  const ordered = qualityCounts[index].slice();
  const type = chartPositions[index][position];
  const categories = [...'PQRST'];
  const order = [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [4, 3, 2, 1, 0], [4, 1, 0, 2, 3]][type];
  const values = order.map(i => ordered[i]);
  const bars = index === 0 ? [
    [37, 25, 12, 6, 6], [71, 36, 24, 12, 12], [6, 6, 17, 31, 62], [18, 36, 73, 36, 20],
  ][type] : values;
  const overall = bars.reduce((sum, count) => sum + count, 0);
  const cumulative = bars.map((_, i) => bars.slice(0, i + 1).reduce((sum, count) => sum + count, 0) * 100 / overall);
  const line = type === 0 || type === 2 ? [0, ...cumulative] : type === 1 ?
    [100, ...cumulative.map(percent => 100 - percent)] : [0, ...bars.map(count => 100 * count / Math.max(...bars)), 0];
  return { type, bars, line, labels: index === 0 ? [] : order.map(i => categories[i]) };
}
export const qualityChoiceFigures = [...'abcd'].map((letter, position) =>
  drawing('76-quality-chart-' + letter, ([index]) => {
    const { type, bars, line, labels } = qualityChart(index, position);
    const shapes = ['棒は左から非増加，折れ線は0から右上がり。',
      '棒は左から非増加，折れ線は右下がり。', '棒は左から非減少，折れ線は0から右上がり。',
      '棒と折れ線は中央付近が高く，右端に向けて下がる。'];
    const measured = labels.length ? ' 要因の順：' + labels.join('，') + '。各棒の件数：' + bars.join('，') +
      '。折れ線の相対的な高さ：' + line.map(value => Math.round(value * 10) / 10).join('，') + '。' : '';
    return shapes[type] + measured;
  }));

export const legacy2008SpringAm5480Figures = [
  dependencyFigure, clinicSchemaFigure, ...clinicChoiceFigures, databaseLinkFigure,
  salesAxisFigure, criticalPathFigure, ...qualityChoiceFigures,
];
