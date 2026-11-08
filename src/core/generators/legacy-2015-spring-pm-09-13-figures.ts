import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { spring2015Pm9Model, spring2015Pm10Model, spring2015Pm13Model, spring2015PmCipherTable, spring2015Pm0913CaseCounts } from './legacy-2015-spring-pm-09-13-models';

export type SpringPmCell = {
  text: string;
  colSpan?: number;
  rowSpan?: number;
  code?: boolean;
  shaded?: boolean;
};
export type SpringPmTable = {
  label?: string;
  headers?: SpringPmCell[];
  rows: SpringPmCell[][];
  rowHeading?: boolean;
};
export type SpringPmPanel = { tables: SpringPmTable[]; note?: string };
const cell = (value: string | number | null): SpringPmCell => ({ text: value == null ? '' : String(value) });
const cells = (values: (string | number | null)[]) => values.map(cell);
const blank = (): SpringPmCell => ({ text: '', shaded: true });
const character = (text: string) => text === ' ' ? '△' : text;
const quotedCharacter = (text: string) => text === ' ' ? '空白文字' : "'" + text + "'";
const ellipsis = (length: number) => Array<string>(length).fill('⋮');
const profiles: Record<number, string[]> = {
  9: ['pairing','cipher-table','cipher-trace'],
  10: ['attendance-input','attendance-output','attendance-change'],
  13: ['unit-sheet','item-sheet'],
};

function loadCipher(name: string, index: number): SpringPmPanel {
  const {plain, first} = spring2015Pm9Model(index);
  switch(name) {
    case 'pairing':
      return { tables: [{ rowHeading: true, rows: [
        cells(['平文','F　E','-','E　X','A　M','.']),
        cells(['','↓','↓','↓','↓','↓']),
        [cell('暗号文'),blank(),cell('-'),blank(),blank(),blank()],
      ] }], note:'注記　網掛けの部分には置換された文字が入る。' };
    case 'cipher-table':
      return { tables: [
        { label: '文字列［位置］', rowHeading: true,
          headers: [cell(''), ...[...plain].map((_,i) => cell(i % 10 === 0 || i === plain.length - 1 ? i : ''))],
          rows: [[cell('平文'), ...[...plain].map(c => cell(character(c)))]] },
        { label: '換字表［行位置］［列位置］', rowHeading: true,
          headers: cells(['', ...Array.from({length:13},(_,i) => i)]),
          rows: spring2015PmCipherTable.map((row,i) => [cell(i), ...[...row].map(c => cell(character(c)))]) },
      ], note:'注記　“△”は空白文字を表す。' };
    case 'cipher-trace':
      return { tables: [
        { headers: cells(['添字',0,1,2,'…']), rowHeading: true,
          rows: [[cell('str'),blank(),cell('[c]'),cell(quotedCharacter(plain[2])),cell('…')]] },
        { headers: cells(['添字',0,1]), rowHeading: true,
          rows: [cells(['cp','[a]',first.second.column]),cells(['rp','[b]',first.second.row]),cells(['pos',...first.positions])] },
      ], note:'注記　網掛けの部分は表示していない。' };
    default: throw new Error('FIGURE_PROFILE');
  }
}

function loadAttendance(name: string, index: number): SpringPmPanel {
  const {dateWidth, cutoff} = spring2015Pm10Model(index);
  switch(name) {
    case 'attendance-input':
      return { tables: [{ headers: cells(['日付','時刻','出退勤フラグ','従業員番号']), rows:[cells([dateWidth+'桁','4桁','1桁','6桁'])] }] };
    case 'attendance-output':
      return { tables: [{ headers:[
        {text:'従業員番号 6桁',rowSpan:2},{text:'勤務履歴1',colSpan:2},{text:'…',rowSpan:2},
        {text:'勤務履歴31',colSpan:2},{text:'勤務時間 5桁',rowSpan:2}],
        rows:[cells(['出社時刻 4桁','退社時刻 4桁','出社時刻 4桁','退社時刻 4桁'])] }],
        note:'勤務履歴1から勤務履歴31は，出社時刻と退社時刻の2項目を31回繰り返す。' };
    case 'attendance-change':
      return { tables: [{ headers: cells(['処置','変更内容']), rowHeading: true,
        rows: [
          [cell('行番号18と19の間に追加'),{text:'02 ATD-NIGHTSUM PIC 9(5).',code:true}],
          [cell('行番号19と20の間に追加'),{text:'77 NIGHT-TIME PIC 9(4) VALUE '+cutoff+'00.',code:true}],
          [cell('行番号62を変更'),{text:'MOVE ZERO TO ATD-SUM ATD-NIGHTSUM',code:true}],
          [cell('行番号73と74の間に追加'),{text:[
            'IF ATD-OUT(IDX) > NIGHT-TIME THEN',
            '    MOVE [e] TO W-TIME-FROM',
            '    MOVE [f] TO W-TIME-ACCUM',
            '    PERFORM CALC-PROC',
            '    MOVE [d] TO ATD-NIGHTSUM',
            'END-IF',
          ].join('\n'),code:true}],
        ] }] };
    default: throw new Error('FIGURE_PROFILE');
  }
}

function loadWorksheet(name: string,index: number): SpringPmPanel {
  const {unitRows,itemRows,unitColumns,itemColumns,unitHeaders,itemHeaders} = spring2015Pm13Model(index);
  const isUnit = name === 'unit-sheet';
  if (!isUnit && name !== 'item-sheet') throw new Error('FIGURE_PROFILE');
  const columns = isUnit ? unitColumns : itemColumns;
  const headers = isUnit ? unitHeaders : itemHeaders;
  const rows = isUnit ? unitRows : itemRows;
  return { tables:[{ headers:cells(['',...columns]), rowHeading:true, rows:[
    cells(['1',...headers]),
    ...rows.flatMap((row,i) => i === rows.length - 1 ? [cells(ellipsis(columns.length + 1)),cells(row)] : [cells(row)]),
  ] }], note:isUnit ? '注記　列Cは設問2で使用する。' : '注記　列Oは設問3で使用する。' };
}

export function spring2015Pm0913PanelAlt(panel: SpringPmPanel) {
  const describe = (row: SpringPmCell[]) => row.map(value => value.shaded ? '網掛け' : value.text).join('｜');
  return [...panel.tables.map(table => [table.label, table.headers && describe(table.headers), ...table.rows.map(describe)].filter(Boolean).join('\n')),
    panel.note].filter(Boolean).join('\n');
}

type Figure = BookletFigureDefinition & { panel(values: number[]): SpringPmPanel };
export const legacy2015SpringPm0913Figures: Figure[] = Object.entries(profiles).flatMap(([question,names]) => {
  const n = Number(question), count = spring2015Pm0913CaseCounts[n];
  const load = n === 9 ? loadCipher : n === 10 ? loadAttendance : loadWorksheet;
  return names.map(name => {
    const panel = (values: number[]) => load(name,selectCase(values,count));
    return { profile:'legacy-2015-spring-pm-' + n + '-' + name, domain:[[0,count - 1]],
      panel, validate(values) { panel(values); }, alt:values => spring2015Pm0913PanelAlt(panel(values)) };
  });
});
