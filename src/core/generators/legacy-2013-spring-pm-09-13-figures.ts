import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { caseCount } from './legacy-2013-spring-pm-09-13-support';
import { decimalY, ladderCases, ladderPath } from './legacy-2013-spring-pm-09-13-models';
import { productionSheet } from './legacy-2013-spring-pm-13-sheet';

export type Cell = string | { text: string; cols: number; rows?: number };
type Ladder = { kind: 'ladder'; size: number; bottom: number; top: number;
  rungs: (readonly [number, number, number])[]; path: [number, number][] };
type Panel = { kind: 'sheet'; rows: Cell[][] } | { kind: 'code-table'; rows: [string, string][] } | Ladder | { kind: 'bit-replacement' };
type Figure = BookletFigureDefinition & { panel: (values: number[]) => Panel };
type Layout = { page: number; load: (index: number) => Panel };

const span = (text: string, cols: number, rows?: number): Cell => ({ text, cols, rows });
const columns = (length: number) => ['', ...Array.from({ length }, (_, i) => String.fromCharCode(65 + i))];
const count = (value: number) => value.toLocaleString('ja-JP');
const blank = (size: number) => Array<string>(size).fill('');
const sum = (items: number[]) => items.reduce((total, item) => total + item, 0);
const mean = (items: number[]) => count(Math.round(sum(items) / items.length));

function management(index: number): Cell[][] {
  const { setup, dates, assembly, plans } = productionSheet(index);
  const partColumns = ['納品\n数', '納品\n後在\n庫', '生産\n数', '生産\n後在\n庫'];
  const rates = (label: string, values: string[]) => values.flatMap(value => [span(label, 3), value]);
  return [
    columns(16),
    ['1', '生産管理表', span(dates[0], 2), 'から', span(dates.at(-1)!, 2), span('まで', 10)],
    ['2', span('', 16)],
    ['3', '日付', span('PA1', 4), span('PA2', 4), span('PA3', 4), span('AS1', 3)],
    ['4', '', ...partColumns, ...partColumns, ...partColumns, '納品\n数', '生産\n数', '在庫\n数'],
    ['5', '前週繰越', ...setup.carry.slice(0, 3).flatMap(value => [...blank(3), count(value)]), '', '', count(setup.carry[3])],
    ...dates.map((date, day) => [
      String(6 + day), date,
      ...plans.flatMap(plan => {
        const { delivery, delivered, output, stock } = plan.days[day];
        return [delivery, delivered, output, stock].map(count);
      }),
      ...[assembly[day].delivery, assembly[day].output, assembly[day].stock].map(count),
    ]),
    ['20', '合計', ...plans.flatMap(plan => [count(plan.total), '', count(sum(plan.days.map(day => day.output))), '']), span('', 3, 5)],
    ['21', '平均', ...plans.flatMap(plan => (['delivery', 'delivered', 'output', 'stock'] as const).map(key =>
      mean(plan.days.map(day => day[key]))))],
    ['22', span('', 1, 3), ...rates('生産基準数', setup.base.map(count))],
    ['23', ...rates('欠品日数', plans.map(plan => String(plan.shortages)))],
    ['24', ...rates('生産基準数\nの妥当性', plans.map(plan => String(plan.valid)))],
  ];
}

function demands(index: number): Cell[][] {
  const { dates, demand, demandTotals } = productionSheet(index);
  const visible = [0, 1, 2, 3, 4, 5, 18, 19, 20];
  const row = (i: number) => [String(5 + i), demand[i].date, demand[i].product, ...demand[i].parts.map(count)];
  return [
    columns(6), ['1', span('部品需要表', 6)], ['2', dates[0], span('から1週間', 5)], ['3', span('', 6)],
    ['4', '日付', '製品コード', '部品1', '部品2', '部品3', '部品4'],
    ...visible.slice(0, 6).map(row), Array<string>(7).fill('⋮'), ...visible.slice(6).map(row),
    ['26', span('合計', 2), ...demandTotals.map(count)],
  ];
}

const layouts: Record<string, Layout> = {
  '10-program-changes': { page: 52, load: () => ({
    kind: 'code-table', rows: [
      ['行番号30と31の間に追加', [
        '01 CUR-TBL-X REDEFINES CUR-VALUE.',
        '   02 CUR-KIND-X  PIC X(5) OCCURS 5.',
        '01 TOTAL-TBL.',
        '   02 CUR-TOTAL   PIC 9(8) OCCURS 5 VALUE ZERO.',
        '01 TOTAL-TBL-X REDEFINES TOTAL-TBL.',
        '   02 CUR-TOTAL-X PIC X(8) OCCURS 5.',
      ].join('\n')],
      ['［d］', 'PERFORM VARYING CNT FROM 1 BY 1 UNTIL CNT > 5\n   DISPLAY CUR-KIND-X(CNT) " : " CUR-TOTAL-X(CNT)\nEND-PERFORM.'],
      ['行番号77の後ろに追加', 'PERFORM VARYING CNT FROM 1 BY 1 UNTIL CNT > 5\n   ［e］\nEND-PERFORM.'],
    ],
  }) },
  '11-ladder': { page: 53, load: index => {
    const { size, bottom, top, rungs } = ladderCases[index];
    const positions = new Set<string>();
    const accepted = rungs.filter(([left, right, y]) => {
      const first = left + ':' + y, second = right + ':' + y;
      if (left === right || positions.has(first) || positions.has(second)) return false;
      positions.add(first);
      positions.add(second);
      return true;
    });
    return { kind: 'ladder', size, bottom, top, rungs: accepted, path: ladderPath(index, 0) };
  } },
  '12-bit-replacement': { page: 58, load: () => ({ kind: 'bit-replacement' }) },
  '13-components': { page: 63, load: index => {
    const { setup } = productionSheet(index);
    return { kind: 'sheet', rows: [
      columns(9),
      ['1', '製品コード・部品名', '部品1', '部品2', '部品3', '部品4', 'PA1', 'PA2', 'PA3', '最大生産数'],
      ...setup.bom.map((parts, i) => [String(i + 2), 'PA' + (i + 1),
        ...parts.map(value => value ? String(value) : ''), '', '', '', count(setup.cap[i])]),
      ['5', 'AS1', ...blank(4), ...setup.ratio.map(String), count(setup.cap[3])],
    ] };
  } },
  '13-orders': { page: 63, load: index => {
    const { orders } = productionSheet(index);
    return { kind: 'sheet', rows: [
      columns(6), ['1', '受注日', '得意先コード', '製品コード', '数量', '納品予定日', '作業コード'],
      ...orders.slice(0, 4), Array<string>(7).fill('⋮'), ...orders.slice(4),
    ] };
  } },
  '13-management': { page: 64, load: index => ({ kind: 'sheet', rows: management(index) }) },
  '13-demand': { page: 69, load: index => ({ kind: 'sheet', rows: demands(index) }) },
};

function description(panel: Panel): string {
  switch (panel.kind) {
    case 'ladder':
      return '縦線の番号は上端と下端とも左から' + Array.from({ length: panel.size }, (_, i) => i).join('，') + '。横線（接続する番号と縦軸座標）は' +
        panel.rungs.map(([left, right, height]) => left + '—' + right + '（' + decimalY(height) + '）').join('，') +
        '。太線で示す左端からの経路は' + panel.path.map(([position, height]) => position + '番・' + decimalY(height)).join(' → ') + '。';
    case 'bit-replacement':
      return 'ビット位置は左端から0，…，p，p+q，…，31。ビット列αのうちpからp+qの境界までのqビットを網掛けにしている。長さqビットのビット列βから，αの網掛けに向かう矢印がある。';
    case 'code-table':
      return '処置｜変更内容\n' + panel.rows.map(row => row.join('｜')).join('\n');
    case 'sheet':
      return panel.rows.map(row => row.map(cell => typeof cell === 'string' ? cell.replaceAll('\n', '') : cell.text.replaceAll('\n', '')).join('｜')).join('\n');
  }
}

const prefix = 'legacy-2013-spring-pm-';
export const legacy2013SpringPm0913Figures: Figure[] = Object.entries(layouts).map(([name, layout]) => {
  const panel = (values: number[]) => layout.load(selectCase(values, caseCount));
  return {
    profile: prefix + name,
    domain: [[0, caseCount - 1]],
    validate: values => { panel(values); },
    alt: values => description(panel(values)),
    panel,
  };
});

export function languageFigure(number: number, name: string, index: number, caption: string) {
  const key = number + '-' + name;
  const profile = prefix + key;
  const registered = legacy2013SpringPm0913Figures.find(figure => figure.profile === profile);
  if (!registered) throw Error('FIGURE_PROFILE');
  const block = figure(profile, [index], caption, registered.alt([index]));
  if (block.type !== 'diagram') throw Error('FIGURE_PROFILE');
  const source = '2013h25h-fe-pm-' + number;
  block.attribution = { origin: 'adapted', sourceRefs: [{
    sourceId: 'source-ipa-' + source + '-qs', locator: { section: '問題', year: 2013, period: '春期',
      exam: '基本情報技術者試験', timeSlot: '午後', subject: '旧制度・午後', questionNumber: String(number),
      page: layouts[key].page },
  }], rightsRefs: ['rights-ipa-' + source], creatorIds: ['ipa', 'codex'] };
  return block;
}
