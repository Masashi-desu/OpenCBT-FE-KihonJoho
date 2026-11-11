import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { readBookletFigure } from '../../../src/core/booklet-figure-extension-contract';
import { legacy2014SpringPm5Definition as q5 } from '../../../src/core/generators/legacy-2014-spring-pm-5';
import { legacy2014SpringPm6Definition as q6 } from '../../../src/core/generators/legacy-2014-spring-pm-6';
import { legacy2014SpringPm7Definition as q7 } from '../../../src/core/generators/legacy-2014-spring-pm-7';
import { legacy2014SpringPm8Definition as q8 } from '../../../src/core/generators/legacy-2014-spring-pm-8';
import { legacy2014SpringPm0508Figures as figures } from '../../../src/core/generators/legacy-2014-spring-pm-05-08-figures';
import { legacy2014SpringPm0508FigureRenderers as renderers } from '../../../src/ui/Legacy2014SpringPm0508Figures';

const labels = 'アイウエオカキク';
type Body = GeneratedBody;
const paragraph = (body: Body) => body.prompt.flatMap(b => b.type === 'paragraph' ? [b.text] : []).join('\n');
function table(body: Body, title: string) {
  const result = body.prompt.find(b => b.type === 'table' && b.caption?.startsWith(title));
  assert(result?.type === 'table', title);
  return result;
}
function fixture(body: Body, part: string) {
  const result = body.answerParts!.find(p => p.id === 'part-' + part);
  assert(result, part);
  return result;
}
function partIndices(body: Body, part: string) {
  const item = fixture(body, part);
  const actual = body.partAnswers!.find(answer => answer.kind === 'choice' ? answer.partId === item.id : answer.kind === 'unordered' && answer.partIds.includes(item.id));
  assert(actual && (actual.kind === 'choice' || actual.kind === 'unordered'));
  return actual.kind === 'choice' ? [item.choiceIds.indexOf(actual.choiceId)] : actual.choiceIds.map(id => item.choiceIds.indexOf(id));
}
function options(body: Body, part: string): string[] {
  return fixture(body, part).choiceIds.map(id => {
    const [block] = body.choices[Number(id.match(/\d+$/)![0]) - 1];
    if (block.type === 'diagram') return block.alt;
    assert(block.type === 'paragraph');
    return block.text;
  });
}
function checkChoices(body: Body, part: string, predicate: (value: string, index: number) => boolean) {
  const values = options(body, part);
  assert.equal(new Set(values).size, values.length);
  assert.deepEqual(values.flatMap((value, index) => predicate(value, index) ? [index] : []), partIndices(body, part), part);
}
function drawing(block: Block) {
  assert(block.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const definition = figures.find(f => f.profile === profile), renderer = renderers.find(r => r.profile === profile);
  assert(definition && renderer);
  assert.equal(readBookletFigure(definition, values), block.alt);
  return renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
}
function promptFigure(body: Body, suffix: string) {
  const figure = body.prompt.find(b => b.type === 'diagram' && b.scene.kind === 'source_figure' && b.scene.profile.endsWith(suffix));
  assert(figure?.type === 'diagram', suffix);
  return figure;
}
function checkAll(def: typeof q5, check: (body: Body, input: number) => void) {
  for (let input = def.fields[0].minimum; input <= def.fields[0].maximum; input++) check(def.build([input]), input);
}

test('2014春旧午後問5–8の公式解答と全12条件を原解答欄に対応させる', () => {
  const keys = ['イアキエカイ', 'ウエウウイ', 'アエエウアウアオ', 'アエイウウアエイ'];
  assert.deepEqual(figures.map(f => f.profile), renderers.map(r => r.profile));
  [q5, q6, q7, q8].forEach((def, i) => {
    assert.equal(def.source, '2014h26h-fe-pm-' + (i + 5));
    assert.equal(def.sourceAnswer.replace(/[／・]/g, ''), keys[i]);
    const baseline = def.build([...def.reference]);
    const official = baseline.answerParts!.flatMap(p => partIndices(baseline, p.id.slice(5)).map(index => labels[index]));
    if (i === 2) {
      assert.deepEqual(official.slice(-4), ['ア', 'オ', 'ア', 'オ']);
      official.splice(-2);
    }
    assert.equal(official.join(''), keys[i]);
    const prompts = new Set<string>();
    checkAll(def, (body, input) => {
      assert.deepEqual(body, def.build([input]));
      assert.equal(body.answerParts?.length, keys[i].length);
      assert(body.explanation.length > 100);
      for (const b of [...body.prompt, ...body.choices.flat()]) if (b.type === 'diagram') drawing(b);
      prompts.add(JSON.stringify(body.prompt));
    });
    assert.equal(prompts.size, 3);
    for (const bad of [[], [-1], [3], [0.5], [NaN], [Infinity], [0, 0]])
      assert.throws(() => def.build(bad), /PARAMETER_CONSTRAINT/);
  });
});

test('問5の各選択肢をD社の固有機能、原フロー、在庫移動の種類と数量で独立判定する', () => {
  checkAll(q5, body => {
    const prose = paragraph(body);
    assert.match(prose, /C社は受注生産方式，D社は見込生産方式/);
    assert.match(prose, /D社の社員が端末から受注情報を入力/);
    assert.match(prose, /販売管理システムの売掛情報と，在庫管理システムの在庫情報を参照し，製品ごとの生産計画を日次/);
    assert.match(prose, /D社システムだけにある在庫管理システムはそのまま利用/);
    checkChoices(body, 'a', value => value === '生産管理');
    checkChoices(body, 'b', value => /在庫情報と売掛情報.*生産計画.*日次/.test(value));
    const sourceArrows = [
      '顧客→販売管理：受注', '販売管理→顧客：請求', '販売管理→生産管理：受注情報', '配送管理→販売管理：出荷実績',
      '販売管理→会計：売掛情報', '会計→販売管理：請求情報', '配送管理→会計：配送経費情報', '生産管理→会計：原価情報',
      '調達管理→会計：買掛情報', '生産管理→配送管理：出荷指示', '生産管理→調達管理：調達指示', '調達管理→生産管理：入荷実績',
      '販売管理→顧客：顧客に請求書を郵送', '販売管理→生産管理：売掛情報', '販売管理→在庫管理：出荷指示',
      '在庫管理→販売管理：出荷実績', '在庫管理→会計：配送経費情報', '調達管理→在庫管理：入荷実績',
      '調達管理→在庫管理：発注情報', '生産管理→在庫管理：入庫情報', '生産管理→在庫管理：出庫指示', '在庫管理→生産管理：在庫情報',
    ];
    const c = drawing(promptFigure(body, '-5-c-flow')), d = drawing(promptFigure(body, '-5-d-flow'));
    assert.equal(c.match(/data-flow=/g)?.length, 12);
    assert.equal(d.match(/data-flow=/g)?.length, 14);
    for (const name of sourceArrows) assert((c + d).includes('data-flow="' + name + '"'), name);
    const timing = promptFigure(body, '-5-timing');
    assert.match(drawing(timing), /rowSpan="8"/);
    const independentlyRead: Record<string, readonly [boolean, number, string]> = {
      生産計画時: [false, 1, '生産予定数'], 部品発注時: [false, 1, '発注数'],
      部品納品時: [true, 1, '納品数'], 受注時: [false, -1, '受注数'],
      製品完成時: [true, 1, '完成数'], 製品出荷時: [true, -1, '出荷数'],
    };
    for (const letter of 'cdef') {
      const row = timing.alt.split('\n').find(line => line.endsWith('［' + letter + '］'));
      assert(row);
      const [stock, change, quantity] = independentlyRead[row.split('｜')[1]];
      checkChoices(body, letter, value => {
        const [kind, direction, amount] = value.split('｜');
        return (kind === '実在庫') === stock && (direction === '入庫' ? 1 : -1) === change && amount === quantity;
      });
    }
  });
});

test('問6の処理フローと工数表から各候補の件数、数値、規模、工程範囲を算出する', () => {
  checkAll(q6, body => {
    const prose = paragraph(body), flow = promptFigure(body, '-6-flow');
    assert.match(prose, /A社でアレンジした簡易ファンクションポイント法/);
    assert.match(prose, /1kステップ＝1,000ステップ/);
    const outputs = flow.alt.split('\n').filter(row => row.startsWith('データ抽出→'));
    assert.deepEqual(outputs, ['データ抽出→オンラインストレージ（出力）', 'データ抽出→電子記憶媒体（出力）',
      'データ抽出→授受リスト（出力）', 'データ抽出→ログデータ']);
    assert.equal(drawing(flow).match(/data-flow=/g)?.length, 22);
    const rows = table(body, '表1').rows;
    const names = rows.map(row => row[1]), weights = rows.map(row => Math.round(Number(row[2]) * 10));
    const productivity = Number(table(body, '表2').rows[0][0].split('（')[0]);
    const count = outputs.filter(row => !row.endsWith('授受リスト（出力）')).length;
    checkChoices(body, 'a', v => Number(v) === count);
    const totalAlt = promptFigure(body, '-6-totals').alt;
    const counts = totalAlt.split('\n').filter(s => s.includes('｜上段 ')).map(line =>
      line.split('｜上段 ')[1].split('｜').slice(0, 5).map(v => v === '［a］' ? count : Number(v)));
    assert.deepEqual(counts, [[3, 2, 0, 1, 1], [2, 1, 0, 1, 1], [2, 3, 1, 0, 0], [3, 1, 1, 0, 1]]);
    const effortTenths = counts[1].reduce((sum, n, c) => sum + n * weights[c], 0) / productivity;
    checkChoices(body, 'b', v => Math.round(Number(v) * 10) === effortTenths);
    const totalColumns = names.map((_, i) => counts.map(row => row[i]).reduce((sum, n) => sum + n, 0) * weights[i]);
    checkChoices(body, 'c', v => {
      const col = names.indexOf(v);
      return counts.every(row => row[col] > 0) &&
        totalColumns.every((total, other) => other === col || counts.some(row => !row[other]) || totalColumns[col] > total);
    });
    const stages = promptFigure(body, '-6-stages').alt.split('\n')[0].split('｜').slice(1, -1).map(value => {
      const [stage, percent] = value.split(' ');
      return [stage, parseInt(percent, 10)] as const;
    });
    const threshold = Number(prose.match(/全工程の工数合計の(\d+)%/)![1]);
    checkChoices(body, 'd', v => {
      const chosen = v.split('，');
      return chosen.every((name, i) => stages[i][0] === name) &&
        stages.slice(0, chosen.length).reduce((sum, row) => sum + row[1], 0) === threshold;
    });
    const selected = names.indexOf(options(body, 'c')[partIndices(body, 'c')[0]]);
    const thousandths = counts[2][selected] * weights[selected] * threshold / productivity;
    checkChoices(body, 'e', v => Math.round(Number(v) * 1000) === thousandths);
  });
});

type Task = { time: number; staff: number; pre: number[] };
const ids = (text: string) => [...text.matchAll(/No(\d+)/g)].map(match => Number(match[1]));
function taskGraph(body: Body) {
  const entries = table(body, '表1').rows.map(([label, , duration, people, previous]) =>
    [ids(label)[0], { time: +duration * 60, staff: +people, pre: ids(previous) }] as const);
  return new Map<number, Task>(entries);
}
function timings(tasks: Map<number, Task>, reduce: readonly number[] = []) {
  const starts = new Map<number, number>(), finishes = new Map<number, number>();
  function finish(id: number): number {
    if (finishes.has(id)) return finishes.get(id)!;
    const { time, pre } = tasks.get(id)!;
    const start = Math.max(0, ...pre.map(finish)), end = start + time - (reduce.includes(id) ? 15 : 0);
    starts.set(id, start); finishes.set(id, end);
    return end;
  }
  const deadline = Math.max(...[...tasks.keys()].map(finish));
  return { starts, finishes, deadline };
}
function demand(tasks: Map<number, Task>, starts: Map<number, number>, minute: number) {
  let active = 0;
  for (const [id, task] of tasks) if (starts.get(id)! <= minute && starts.get(id)! + task.time > minute) active += task.staff;
  return active;
}
function possible(tasks: Map<number, Task>, starts: Map<number, number>, deadline: number) {
  for (const [id, task] of tasks) {
    const start = starts.get(id)!;
    if (start + task.time > deadline || task.pre.some(id => starts.get(id)! + tasks.get(id)!.time > start)) return false;
  }
  return true;
}
function minPeakByMinute(tasks: Map<number, Task>, original: ReturnType<typeof timings>) {
  const adjustable = [5, 6, 11];
  const options = adjustable.map(id => {
    const earliest = original.starts.get(id)!;
    const fixedSuccessors = [...tasks].flatMap(([successor, task]) =>
      task.pre.includes(id) && !adjustable.includes(successor) ? [original.starts.get(successor)!] : []);
    const latest = Math.min(original.deadline, ...fixedSuccessors) - tasks.get(id)!.time;
    return Array.from({ length: latest - earliest + 1 }, (_, i) => earliest + i);
  });
  const fixed = [...tasks].filter(([id]) => !adjustable.includes(id));
  const candidateTimes = new Set(fixed.map(([id]) => original.starts.get(id)!));
  const fixedLoad = Array.from({ length: original.deadline }, (_, minute) => fixed.reduce((count, [id, task]) =>
    original.starts.get(id)! <= minute && original.finishes.get(id)! > minute ? count + task.staff : count, 0));
  const variable = adjustable.map(id => tasks.get(id)!);
  let optimum = Infinity;
  for (const a of options[0]) for (const b of options[1]) for (const c of options[2]) {
    const starts = [a, b, c];
    let peak = 0;
    for (const minute of [...candidateTimes, ...starts]) {
      let total = fixedLoad[minute];
      for (let i = 0; i < starts.length; i++) if (starts[i] <= minute && minute < starts[i] + variable[i].time) total += variable[i].staff;
      if (total > peak) peak = total;
    }
    if (peak < optimum) optimum = peak;
  }
  return optimum;
}

test('問7の欠落矢線、13作業の時間と順不同の短縮二択を検算する', () => {
  checkAll(q7, body => {
    const tasks = taskGraph(body), { starts, deadline, finishes } = timings(tasks);
    const network = promptFigure(body, '-7-network'), image = drawing(network);
    assert.equal(image.match(/data-node=/g)?.length, 12);
    assert.equal(image.match(/data-activity=/g)?.length, 12);
    assert(!image.includes('data-activity="No8"'));
    const existing = [...network.alt.matchAll(/(\d+)→(\d+)：No(\d+)/g)].map(([, a, b, id]) => [+a, +b, +id]);
    function ancestors(id: number): Set<number> {
      return new Set(tasks.get(id)!.pre.flatMap(previous => [previous, ...ancestors(previous)]));
    }
    const closure = [...tasks.keys()].map(id => [...ancestors(id)].sort((a, b) => a - b).join(','));
    function represents(a: string, b: string) {
      const [x, y] = a.split('から').map(Number);
      const edges = [...existing, [x, y, 8], ...b.split('と').map(to => [7, Number(to), 0])];
      if (edges.some(([from, to]) => to <= from)) return false;
      const passing = new Map<number, Set<number>>();
      for (let node = 1; node <= 12; node++) {
        const available = new Set<number>();
        for (const [start, end, activity] of edges) if (end === node) {
          for (const item of passing.get(start) ?? []) available.add(item);
          if (activity) available.add(activity);
        }
        passing.set(node, available);
      }
      return edges.every(([from, , activity]) =>
        !activity || [...passing.get(from)!].sort((l, r) => l - r).join(',') === closure[activity - 1]);
    }
    checkChoices(body, 'a', v => options(body, 'b').some(b => represents(v, b)));
    checkChoices(body, 'b', v => options(body, 'a').some(a => represents(a, v)));
    checkChoices(body, 'c', v => Number(v) * 60 === deadline);
    const staffed = [13, 14, 15].map(hour => demand(tasks, starts, (hour - 6) * 60));
    checkChoices(body, 'd', v => v.split('／').join(',') === staffed.join(','));
    const baseline = demand(tasks, starts, 180);
    assert(paragraph(body).includes('9〜10時の必要人数は' + baseline + '人'));
    assert(drawing(promptFigure(body, '-7-schedule')).includes('rowSpan="3">［d］'));
    checkChoices(body, 'e', v => {
      const [, task, hour] = v.match(/^No(\d+)を(\d+)時$/)!;
      const changed = new Map(starts).set(+task, (+hour - 6) * 60);
      return possible(tasks, changed, deadline) && demand(tasks, changed, 180) < baseline;
    });
    const peak = minPeakByMinute(tasks, { starts, deadline, finishes });
    checkChoices(body, 'f', v => Number(v) === peak);
    assert.match(paragraph(body), /二つ選べ/);
    const [left, right] = ['s3-1', 's3-2'].map(id => fixture(body, id));
    const group = body.partAnswers!.find(answer => answer.kind === 'unordered');
    assert(group?.kind === 'unordered');
    assert.deepEqual(group.partIds, [left.id, right.id]);
    assert.deepEqual(left.choiceIds, right.choiceIds);
    checkChoices(body, 's3-1', v => timings(tasks, ids(v)).deadline + 30 === deadline);
    checkChoices(body, 's3-2', v => timings(tasks, ids(v)).deadline + 30 === deadline);
  });
});

type Pair = [number, number];
const free = (mask: readonly boolean[]): Pair[] => {
  const starts: Pair[] = [[-Infinity, Infinity]];
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const last = starts.pop()!;
    starts.push([last[0], i], [i + 2, Infinity]);
    while (i + 1 < mask.length && mask[i + 1]) i++;
    starts[starts.length - 1][0] = i + 2;
  }
  return starts;
};
function exerciseAlloc(input: Pair[], start: number, end: number, c: string, d: string, loop: string): Pair[] {
  const list = input.map(row => [...row] as Pair);
  let i = 0;
  while (end > list[i][1]) i++;
  if (list[i][0] > start) return list;
  function apply(statement: string) {
    const field = statement.startsWith('始点') ? 0 : 1;
    list[i][field] = statement.endsWith('始点P−1') ? start - 1 : end + 1;
  }
  if (list[i][0] === start && end === list[i][1]) {
    for (let j = i + 1; j < list.length; j++) list[j - 1] = [...list[j]];
    list.pop();
  }
  if (list[i][0] === start && end < list[i][1]) apply(c);
  if (list[i][0] < start && end === list[i][1]) apply(d);
  if (list[i][0] < start && end < list[i][1]) {
    const n = list.length;
    const indices = loop.startsWith('I＋1') ? Array.from({ length: n - i - (loop.includes('≦') ? 1 : 2) }, (_, k) => i + k + 1)
      : Array.from({ length: n - i - (loop.includes('≧') ? 1 : 2) }, (_, k) => n - k - 1);
    for (const j of indices) list[j + 1] = [...list[j]];
    list[i + 1] = [end + 1, list[i][1]];
    list[i][1] = start - 1;
    if (list.length !== n + 1) list.push([NaN, NaN]);
  }
  return list;
}
const same = (a: Pair[], b: Pair[]) => a.length === b.length && a.every((row, i) => row[0] === b[i][0] && row[1] === b[i][1]);
const oracles: { old: Pair[]; start: number; end: number; allocation: Pair[]; release: Pair[]; validFree: boolean }[] = [];
for (let size = 1; size <= 7; size++) for (let n = 0; n < 2 ** size; n++) {
  const mask = Array.from({ length: size }, (_, i) => !!(n & (1 << i)));
  const old = free(mask);
  for (let start = 1; start <= size; start++) for (let end = start; end <= size; end++) {
    const selected = mask.slice(start - 1, end);
    const validAlloc = selected.every(v => !v), validFree = selected.every(Boolean);
    oracles.push({
      old, start, end, validFree,
      allocation: validAlloc ? free(mask.map((v, i) => v || (start <= i + 1 && i + 1 <= end))) : old,
      release: validFree ? free(mask.map((v, i) => v && !(start <= i + 1 && i + 1 <= end))) : old,
    });
  }
}
function exerciseFree(old: Pair[], start: number, end: number, target: string, expression: string, body: Body): Pair[] | undefined {
  const i = old.findIndex((left, index) => left[1] < start && end < (old[index + 1]?.[0] ?? -Infinity));
  if (i < 0) return undefined;
  const left = old[i], right = old[i + 1], leftAdjacent = left[1] === start - 1, rightAdjacent = right[0] === end + 1;
  const row = Number(!leftAdjacent) * 2 + Number(!rightAdjacent);
  const description = table(body, '表2').rows[row][1];
  if (!description.includes('［' + target + '］')) return undefined;
  const starts = new Map([['始点ᵢ', left[0]], ['始点ₚ', start]]);
  const ends = new Map([['終点ᵢ₊₁', right[1]], ['終点ₚ', end]]);
  const [lo, hi] = expression.slice(1, -1).split('，');
  const pair: Pair = [starts.get(lo)!, ends.get(hi)!];
  const replaceAt = leftAdjacent ? i : i + 1, deleteCount = Number(leftAdjacent) + Number(rightAdjacent);
  return [...old.slice(0, replaceAt), pair, ...old.slice(replaceAt + deleteCount)];
}

test('問8の全候補をセル状態の全列挙と擬似言語の逐次実行で比較する', () => {
  assert.equal(oracles.length, 5630);
  checkAll(q8, body => {
    const prose = paragraph(body);
    assert.match(prose, /−∞＜始点ₚ≦終点ₚ＜\+∞/);
    assert.match(prose, /配列は，十分に大きい/);
    assert.match(prose, /整数同士の除算では，商の小数点以下を切り捨てる/);
    assert.deepEqual(body.contexts?.map(context => [context.title, context.blocks.map(block => block.type === 'image' && block.assetId)]),
      [['共通に使用される擬似言語の記述形式', ['asset-ipa-2014h26h-fe-pm-p004', 'asset-ipa-2014h26h-fe-pm-p005']]]);
    const code = promptFigure(body, '-8-program');
    assert.equal(code.alt.match(/│ ▲/g)?.length, 4);
    assert.match(code.alt, /L: I＋1, L ≦ N, 1/);
    assert.match(code.alt, /I ← 1/);
    const example = [...prose.matchAll(/(?:Alloc|Free)（(\d+)，(\d+)）/g)].map(([, lo, hi]) => [+lo, +hi]);
    assert.equal(example.length, 3);
    const [allocatedA, allocatedB, released] = example;
    const baselineMask = Array.from({ length: 10 }, (_, i) => [allocatedA, allocatedB].some(([a, b]) => a <= i && i <= b));
    const releasedMask = baselineMask.map((v, i) => v && !(released[0] <= i && i <= released[1]));
    for (const [suffix, state] of [['-8-initial', Array<boolean>(10).fill(false)], ['-8-after-alloc', baselineMask], ['-8-after-free', releasedMask]] as const) {
      const html = drawing(promptFigure(body, suffix));
      assert.deepEqual([...html.matchAll(/data-cell="(\d+)" data-allocated="true"/g)].map(m => +m[1]), state.flatMap((v, i) => v ? [i] : []));
    }
    for (const field of ['a', 'b']) {
      checkChoices(body, field, value => {
        let checked = 0;
        const valid = oracles.every(({ old, start, end, release, validFree }) => {
          if (!validFree) return true;
          const candidate = exerciseFree(old, start, end, field, value, body);
          if (!candidate) return true;
          checked++;
          return same(candidate, release);
        });
        return checked > 0 && valid;
      });
    }
    const selected = (field: string) => options(body, field)[partIndices(body, field)[0]];
    for (const field of ['c', 'd', 'e']) checkChoices(body, field, value =>
      oracles.every(({ old, start, end, allocation }) => same(exerciseAlloc(old, start, end,
        field === 'c' ? value : selected('c'), field === 'd' ? value : selected('d'), field === 'e' ? value : selected('e')), allocation)));
    assert(oracles.every(({ old, allocation, release }) => old.length > 0 && allocation.length > 0 && release.length > 0));
    checkChoices(body, 'f', value => {
      if (value.includes('組の個数が0')) return true;
      if (value.includes('関数Free')) return false; // all-free initial state is an allowed call state even though the operation rejects it
      if (value.includes('始点₁又は終点N')) return false; // allocate every finite cell with both infinite extrema unchanged
      assert(value.includes('幾ら長くても一つの組'));
      return false; // interval encoding has this property even with finite bounds
    });
    const formulas: Record<string, (e: number) => number> = {
      '1': () => 1, '2': () => 2, 'E÷2＋1': e => Math.floor(e / 2) + 1, '(E＋1)÷2＋1': e => Math.floor((e + 1) / 2) + 1,
      'E＋1': e => e + 1, 'E＋2': e => e + 2,
    };
    for (const field of ['g', 'h']) checkChoices(body, field, value => {
      assert(formulas[value], value);
      return [1, 2, 3, 4, 5, 6, 7].every(size => {
        const counts = Array.from({ length: 2 ** size }, (_, n) => free(Array.from({ length: size }, (_, i) => !!(n & (1 << i)))).length);
        return formulas[value](size) === (field === 'g' ? Math.max(...counts) : counts.at(-1));
      });
    });
  });
});
