import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { caseCount } from './legacy-2013-autumn-pm-09-13-support';
import { courtConditions, courtProcedureUpdate, dictionaryConditions, directoryOutput } from './legacy-2013-autumn-pm-09-13-models';
import { groupingSheet } from './legacy-2013-autumn-pm-13-sheet';

export type Cell = string | { text: string; cols?: number; rows?: number; omitted?: boolean };
export type FigureTable = { label?: string; rows: Cell[][]; head?: number; sheet?: boolean };
type Panel =
  | { kind: 'tables'; tables: FigureTable[]; note?: string }
  | { kind: 'fence'; left: number[]; right: number[] }
  | { kind: 'tree'; names: string[]; edges: number[][] }
  | { kind: 'output'; lines: string[] }
  | { kind: 'conversion' };
type Figure = BookletFigureDefinition & { panel: (values: number[]) => Panel };

const cell = (text: string, cols?: number, rows?: number): Cell => ({ text, cols, rows });
const columns = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCharCode(65 + from + i));
const fmt = (score: number) => score <= 0 ? String(score) : (score / 1000).toFixed(3);
function blankCells(count: number) { return Array<string>(count).fill(''); }

function similarityTable(index: number): FigureTable {
  const { lastColumn, penultimateColumn, matrix, displayed, displayNames } = groupingSheet(index);
  return { sheet: true, head: 1, rows: [
    ['', 'A', 'B', 'C', 'D', 'E', 'F', '…', penultimateColumn, lastColumn],
    ['1', '', '受講者番号', ...displayed.slice(0, 4).map(String), '…', ...displayed.slice(4).map(String)],
    ['2', '受講者番号', '氏名', ...displayNames.slice(0, 4), '…', ...displayNames.slice(4)],
    ...displayed.slice(0, 4).map((student, i) => similarityRow(student, i)),
    Array<string>(10).fill('⋮'),
    ...displayed.slice(4).map((student, i) => similarityRow(student, i + 4)),
  ] };

  function similarityRow(student: number, i: number) {
    const row = matrix[student - 1];
    const values = displayed.map(id => fmt(row[id - 1]));
    return [String(student + 2), String(student), displayNames[i], ...values.slice(0, 4), '…', ...values.slice(4)];
  }
}

function recommendationTable(index: number): FigureTable {
  const { leaders, capacity, seats, assigned, eligible, maxima, ranks, groups, displayed, displayNames,
    recommendation, recommendationRow, fullRow } = groupingSheet(index);
  const groupNumbers = leaders.map((_, i) => String(i + 1));
  return { sheet: true, head: 1, rows: [
    ['', ...columns(0, 16)],
    ['1', '', 'グループ番号', ...groupNumbers, '', '', ...groupNumbers, '', '', ''],
    ['2', '', 'グループ長', ...leaders.map(String), '済', '', ...leaders.map(String), '', '', ''],
    ...displayed.slice(0, 4).map((student, i) => groupRow(student, i)),
    Array<string>(18).fill('⋮'),
    ...displayed.slice(4).map((student, i) => groupRow(student, i + 4)),
    [String(fullRow), '', '定員充足', ...seats.map(seat => seat === capacity ? '1' : '0'), ...blankCells(10)],
    [String(fullRow + 1), ...blankCells(17)],
    [String(recommendationRow), '', '受講者番号', String(recommendation), cell('の学生をグループ', 3),
      String(groups[recommendation - 1]), cell('に推薦する', 3), ...blankCells(7)],
  ] };

  function groupRow(student: number, i: number) {
    const membership = assigned.get(student);
    return [String(student + 2), String(student), displayNames[i],
      ...leaders.map((_, group) => membership === group + 1 ? '1' : '0'),
      membership ? '1' : '0', '', ...eligible[student - 1].map(fmt), fmt(maxima[student - 1]),
      String(ranks[student - 1]), String(groups[student - 1])];
  }
}

const layouts: Record<string, { page: number; load: (index: number) => Panel }> = {
  '9-word-encoding': { page: 46, load: () => ({ kind: 'tables', tables: [{ rows: [
    ['基本文字列', 'f', 'r', 'i'], ['文字情報列', '大文字', '小文字', '小文字\n“.”付き'],
  ] }] }) },
  '9-invalid-input': { page: 49, load: index => ({
    kind: 'tables', tables: [{ head: 1, rows: [
      ['条件', '条件を満たさない場合', 'プログラムの動作'],
      ['①', '文字列中に英字，“-”，“.”以外の文字がある。', { text: '原資料で非表示の部分', omitted: true }],
      [cell('②', 1, 2), '文字列の長さが0である。', '［e］。'],
      ['文字列の長さが' + (dictionaryConditions[index].limit + 1) + '以上である。', '［f］までを有効とし，後続の文字を無視する。'],
      ['③', '先頭の文字が英字でない。', '［g］。'],
      ['④', '“-”及び“.”の直前の文字が英字でない。', { text: '原資料で非表示の部分', omitted: true }],
    ] }], note: '注記　網掛けの部分は表示していない。',
  }) },
  '10-parameters': { page: 50, load: () => ({ kind: 'tables', tables: [
    { label: '予約情報', head: 1, rows: [
      ['予約番号', '希望面数', '希望日', '希望時刻', '希望時間'], ['6桁', '1桁', '8桁', '2桁', '1桁'],
    ] },
    { label: '予約結果', head: 1, rows: [['結果', '予約コート'], ['1桁', '1桁（4回繰返し）']] },
  ] }) },
  '10-reservation-record': { page: 51, load: index => {
    const { opening } = courtConditions[index];
    const hours = [opening + '時台\n6桁', (opening + 1) + '時台\n6桁', '…', (opening + 8) + '時台\n6桁'];
    return { kind: 'tables', tables: [{ head: 1, rows: [
      [cell('日付\n8桁', 1, 2), cell('予約状況（1番コート）', 4), cell('…', 1, 2), cell('予約状況（4番コート）', 4)],
      [...hours, ...hours],
    ] }] };
  } },
  '10-fence-layout': { page: 54, load: index => {
    const { left, right } = courtConditions[index];
    return { kind: 'fence', left, right };
  } },
  '10-program-changes': { page: 54, load: index => ({ kind: 'tables', tables: [{ head: 1, rows: [
    ['処置', '変更内容'],
    ['行番号25と26の\n間に追加', '02 PRM-NEXT      PIC 9(1).\n   88 NEXT-OFF   VALUE 0.\n   88 NEXT-ON    VALUE 1.'],
    ['行番号29と30の\n間に追加', '88 RSV-NOTE  VALUE ' + courtConditions[index].resultCode + '.'],
    ['行番号74と75の\n間に追加', courtProcedureUpdate],
  ] }] }) },
  '11-directory-tree': { page: 55, load: () => ({
    kind: 'tree', names: ['', 'usr', 'opt', 'local', 'bin', 'local', 'bin', 'lib'],
    edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [3, 6], [3, 7]],
  }) },
  '11-execution-output': { page: 56, load: index => ({ kind: 'output', lines: directoryOutput(index, false).lines }) },
  '11-leaf-output': { page: 59, load: index => ({ kind: 'output', lines: directoryOutput(index, true).lines }) },
  '12-time-conversion': { page: 60, load: () => ({ kind: 'conversion' }) },
  '12-runner-addresses': { page: 63, load: () => ({
    kind: 'tables', tables: [{ rows: Array.from({ length: 4 }, (_, i) =>
      [i === 0 ? '(GR1)＋0' : '＋' + i, '選手' + (i + 1) + 'のタイムが格納されている領域の先頭アドレス']) }],
  }) },
  '13-similarity-sheet': { page: 65, load: index => ({ kind: 'tables', tables: [similarityTable(index)] }) },
  '13-grouping-sheet': { page: 66, load: index => ({ kind: 'tables', tables: [recommendationTable(index)] }) },
};

function describe(panel: Panel): string {
  switch (panel.kind) {
    case 'tables': return [...panel.tables.flatMap(table => [
      ...(table.label ? [table.label] : []),
      ...table.rows.map(row => row.map(cell => typeof cell === 'string' ? cell : cell.text).join('｜')),
    ]), ...(panel.note ? [panel.note] : [])].join('\n');
    case 'fence': return '左の上から' + panel.left.join('、') + '番コート。フェンスの右の上から' + panel.right.join('、') + '番コート。';
    case 'tree': return '名前が空文字列のルートの子はusrとopt。usrの子はlocalとbin、optの子はlocal。usrの子localの子はbinとlib。';
    case 'output': return panel.lines.join('\n');
    case 'conversion': return '時間の4桁m₁、m₂、s₁、s₂から数値の秒へ向かう矢印はTOSEC。数値の秒から時間の4桁に戻る矢印はTOTIME。';
  }
}

const prefix = 'legacy-2013-autumn-pm-';
export const legacy2013AutumnPm0913Figures: Figure[] = Object.entries(layouts).map(([name, layout]) => {
  const panel = (values: number[]) => layout.load(selectCase(values, caseCount));
  return {
    profile: prefix + name,
    domain: [[0, caseCount - 1]],
    validate: values => { panel(values); },
    alt: values => describe(panel(values)),
    panel,
  };
});

export function languageFigure(number: number, name: string, index: number, caption: string) {
  const key = number + '-' + name;
  const profile = prefix + key;
  const registered = legacy2013AutumnPm0913Figures.find(figure => figure.profile === profile);
  if (!registered) throw Error('FIGURE_PROFILE');
  const block = figure(profile, [index], caption, registered.alt([index]));
  if (block.type !== 'diagram') throw Error('FIGURE_PROFILE');
  const source = '2013h25a-fe-pm-' + number;
  block.attribution = { origin: 'adapted', sourceRefs: [{
    sourceId: 'source-ipa-' + source + '-qs', locator: { section: '問題', year: 2013, period: '秋期',
      exam: '基本情報技術者試験', timeSlot: '午後', subject: '旧制度・午後', questionNumber: String(number),
      page: layouts[key].page },
  }], rightsRefs: ['rights-ipa-' + source], creatorIds: ['ipa', 'codex'] };
  return block;
}
