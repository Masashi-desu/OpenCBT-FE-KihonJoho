import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { caseCount } from './legacy-2012-autumn-pm-09-13-support';
import { firstLotteryChanges, lotteryCases, secondLotteryChanges } from './legacy-2012-autumn-pm-9-data';
import { clubCases, clubRecordLayouts, firstClubChanges, sortedClubProgram } from './legacy-2012-autumn-pm-10-data';
import { timerOutput } from './legacy-2012-autumn-pm-11-data';
import { placementSheet, pupilSheet, schoolCases, schoolMesh } from './legacy-2012-autumn-pm-13-data';

export type RecordCell = { label: string; width: number; group?: string };
type Panel =
  | { kind: 'pointers'; tiers: readonly (readonly string[])[] }
  | { kind: 'record'; cells: readonly RecordCell[] }
  | { kind: 'program-changes'; rows: string[][] }
  | { kind: 'output'; text: string }
  | { kind: 'mesh'; points: ReturnType<typeof schoolMesh> }
  | { kind: 'sheet'; rows: string[][] };
type Figure = BookletFigureDefinition & { panel: (values: number[]) => Panel };
const layouts: Record<string, (index: number) => Panel> = {
  '9-winner-pointers': index => ({ kind: 'pointers', tiers: [0, 1, 5].map(i => lotteryCases[index].numbers[i]) }),
  '9-program-changes-first': () => ({ kind: 'program-changes', rows: firstLotteryChanges }),
  '9-program-changes-second': () => ({ kind: 'program-changes', rows: secondLotteryChanges }),
  ...Object.fromEntries(Object.entries(clubRecordLayouts).map(([key, cells]) => ['10-' + key, () => ({ kind: 'record', cells })])),
  '10-program-changes-first': () => ({ kind: 'program-changes', rows: firstClubChanges }),
  '10-program-changes-second': index => ({ kind: 'program-changes', rows: [['', sortedClubProgram(clubCases[index].hours * 60)]] }),
  '11-original-output': index => ({ kind: 'output', text: timerOutput(index, false) }),
  '11-modified-output': index => ({ kind: 'output', text: timerOutput(index, true) }),
  '13-city-mesh': index => ({ kind: 'mesh', points: schoolMesh(schoolCases[index].base) }),
  '13-pupil-distribution': index => ({ kind: 'sheet', rows: pupilSheet(index) }),
  '13-school-placement': index => ({ kind: 'sheet', rows: placementSheet(index) }),
};
function describe(panel: Panel): string {
  switch (panel.kind) {
    case 'pointers':
      return '左のwin_listの添字0，1，5からそれぞれ1等，2等，6等の番号表へ矢印が伸びる。各表の要素の添字から当選番号へ矢印が伸び，末尾はNULL。' +
        panel.tiers.map((tier, i) => [1, 2, 6][i] + '等：' +
          tier.map((n, j) => j + '→“' + n + '”').concat(tier.length + '：NULL').join('，')).join('。');
    case 'record':
      return panel.cells.map(({ label, width, group }) => (group ? group + 'の' : '') + label + '：' + width + '桁').join('｜');
    case 'program-changes':
      return '処置｜変更内容\n' + panel.rows.map(row => row.join('｜')).join('\n');
    case 'output':
      return panel.text;
    case 'mesh':
      return '左上の原点から右がx軸の正，下がy軸の正。S市を覆う70個の升目。行ごとの表示ID：' +
        Array.from({ length: 10 }, (_, y) => 'y＝' + y + '：' +
          panel.points.filter(point => point.label && point.y === y).map(point => point.id).join('，')).join('。');
    case 'sheet':
      return panel.rows.map(row => row.map(cell => cell.replaceAll('\n', '')).join('｜')).join('\n');
  }
}

const prefix = 'legacy-2012-autumn-pm-';
export const legacy2012AutumnPm0913Figures: Figure[] = Object.entries(layouts).map(([name, layout]) => {
  const panel = (values: number[]) => layout(selectCase(values, caseCount));
  return { profile: prefix + name, domain: [[0, caseCount - 1]], validate: values => { panel(values); },
    alt: values => describe(panel(values)), panel };
});
export function languageFigure(question: number, name: string, index: number, caption: string) {
  const profile = prefix + question + '-' + name;
  const drawing = legacy2012AutumnPm0913Figures.find(item => item.profile === profile);
  if (!drawing) throw Error('FIGURE_PROFILE');
  return figure(profile, [index], caption, drawing.alt([index]));
}
