import { field } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { autumn2015Pm10Data, type HistogramSeries, type TotalIdRow } from './legacy-2015-autumn-pm-09-13-source';
import { buildAutumn2015LanguageBody, selectCase, type LanguagePanel } from './legacy-2015-autumn-pm-09-13-support';

const conditions = [[20, 10], [25, 8], [40, 12], [20, 8], [25, 12], [40, 10], [25, 10], [40, 8], [20, 12]];
const headings = ['Price', 'Function', 'Design'];
const steps = [37, 73, 137];
export const autumn2015Pm10CaseCount = conditions.length;

export function autumn2015Pm10Survey(index: number) {
  const [starUnit, rowLimit] = conditions[index];
  const responses = Array.from({ length: 1000 }, (_, row) => {
    const marks = steps.map((step, item) => {
      const selector = ((row + 1) * step + index * 19 + item * 23) % 1000;
      const bounds = [80 + index * 5, 290 + item * 12, 655 + index * 7, 920 - item * 12];
      return 1 + bounds.filter(bound => selector >= bound).length;
    });
    return { id: String(row + 1).padStart(4, '0'), marks };
  });
  return { starUnit, rowLimit, responses };
}

export function autumn2015Pm10Examples(index: number) {
  const { starUnit, rowLimit, responses } = autumn2015Pm10Survey(index);
  if (index === 0) return { starUnit, rowLimit, histogram: autumn2015Pm10Data.histogram, totals: autumn2015Pm10Data.totals };
  const histogram: HistogramSeries[] = headings.map((label, item) => ({
    label,
    rows: [5, 4, 3, 2, 1].map(rating => {
      const count = responses.filter(({ marks }) => marks[item] === rating).length;
      return { rating, count, stars: Math.floor(count / starUnit) };
    }),
  }));
  const groups = new Map<number, string[]>();
  for (const { id, marks } of responses) {
    const score = marks.reduce((sum, mark) => sum + mark, 0);
    if (!groups.has(score)) groups.set(score, []);
    groups.get(score)!.push(id);
  }
  const fullTotals = [...groups.entries()].sort(([left], [right]) => left - right).flatMap(([score, ids]) =>
    Array.from({ length: Math.ceil(ids.length / rowLimit) }, (_, row) => ({
      score: row === 0 ? score : null, ids: ids.slice(row * rowLimit, (row + 1) * rowLimit),
    })));
  const tail = fullTotals.slice(fullTotals.map(row => row.score !== null).lastIndexOf(true));
  const totals: TotalIdRow[] = [...fullTotals.slice(0, 10), { omitted: '（中略）' }, ...tail];
  return { starUnit, rowLimit, histogram, totals };
}

export const autumn2015Pm10Profiles = ['record-layout', 'histogram', 'total-output', 'changes'] as const;
export function autumn2015Pm10Panel(profile: string, index: number): LanguagePanel {
  const { rowLimit, histogram, totals } = autumn2015Pm10Examples(index);
  switch (profile) {
    case 'record-layout': return { kind: 'grid', columns: ['回答ID', '価格満足度', '機能満足度', 'デザイン満足度'], rows: [['4桁', '1桁', '1桁', '1桁']] };
    case 'histogram': return { kind: 'code', lines: histogram.flatMap(({ label, rows }) =>
      [label, ...rows.map(({ rating, count, stars }) => rating + ' ' + String(count).padStart(4) + ' ' + '*'.repeat(stars))]) };
    case 'total-output': return { kind: 'code', lines: ['Total', ...totals.map(row =>
      'omitted' in row ? row.omitted : String(row.score ?? '').padStart(2) + ' ' + row.ids.join(' '))] };
    case 'changes': return { kind: 'change-table', columns: ['処置', '変更内容'],
      rows: autumn2015Pm10Data.changes.map(([action, text]) => [action, text.replace('OCCURS 10.', 'OCCURS ' + rowLimit + '.')]) };
    default: throw new Error('FIGURE_PROFILE');
  }
}

export const legacy2015AutumnPm10Definition: AfternoonBookletDefinition = {
  source: '2015h27a-fe-pm-10', title: '旧制度・午後：COBOLによるアンケート結果の分析',
  fields: [field('満足度分布・棒の尺度・改行の条件番号', 0, autumn2015Pm10CaseCount - 1)], reference: [0], version: '3.7.0',
  sourceAnswer: '設問1 a=ウ，b=エ，c=ア，d=ウ／設問2 e=イ，f=キ，g=ウ',
  publicNotes: '各1,000件の回答から満足度の分布を作り，棒の尺度と回答IDの改行件数を変更します。',
  notes: '印刷・PDF p47–52の7欄。1,000件、一意の4桁ID、1〜5の3項目、0の数字編集、切捨て、2桁点数と4桁ID、改行と見出しの条件を保持。棒の尺度20/25/40、ID行幅8/10/12を出題条件・表示・コード・該当候補に反映。正答は同じ数値編集と論理式の役割であり，尺度変更だけを独立した正答変更として扱わない。原図3の中略部分は補っていない。',
  build(values) {
    const index = selectCase(values, autumn2015Pm10CaseCount);
    const { starUnit, rowLimit } = autumn2015Pm10Survey(index);
    return buildAutumn2015LanguageBody({ number: 10, index, panel: autumn2015Pm10Panel,
      prose: text => text.replace('選択数20ごと', '選択数' + starUnit + 'ごと').replace('選択数が20に', '選択数が' + starUnit + 'に')
        .replace('10件ごと', rowLimit + '件ごと'),
      program: (id, text) => id === 'q10-program-2' ? text.replace('BY 20 GIVING', 'BY ' + starUnit + ' GIVING') : text,
      choices: (id, options) => id === 'f,g' ? options.map(option => option.replace('POS > 10', 'POS > ' + rowLimit)) : options,
      explanation: 'aはZ(3)9。右端の9が0のときも一桁を残す。bは項目I・満足度Jの件数。cの1:PLOT-NUMは横棒の先頭から切り捨てた商の長さだけを埋める。' +
        'この条件では' + starUnit + '件につき*を一つ使い，dのHIST-RECで値・件数・棒を同じ行に表示する。' +
        'eのSRT-RECは先頭2桁が総合満足度，後ろ4桁がIDである。固定桁の昇順は両項目の順序を保つ。' +
        'fでは点数が変化したとき又はPOSが' + rowLimit + 'を超えたときに前行を出力して新しい行を始める。gでは点数の変化だけを調べるので，同じ点数の続きを表示する行に見出しを繰り返さない。' });
  },
};
