import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { gradeAnswer, validateAnswerDefinition } from '../../../src/core/answers';
import type { Attribution, Block, Question } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2011SpecialPm01To04Definitions as definitions } from '../../../src/core/generators/legacy-2011-special-pm-01-04';
import { legacy2011SpecialPm0104Figures as figures } from '../../../src/core/generators/legacy-2011-special-pm-01-04-figures';
import { legacy2011SpecialPm0104FigureRenderers as renderers } from '../../../src/ui/Legacy2011SpecialPm0104Figures';
import { special2011Pm01To04Specs as specs } from '../../../scripts/legacy-2011-special-pm-01-04-specs';

const official = [
  { marks: 'アエオエ', labels: ['設問1 a', '設問1 b', '設問1 c', '設問2'], counts: [6, 6, 6, 5] },
  { marks: 'オウウオ', labels: ['設問1 a', '設問1 b', '設問2 c', '設問2 d'], counts: [5, 5, 6, 6] },
  { marks: 'イエウイエイ', labels: ['設問1 a', '設問1 b', '設問2', '設問3 c', '設問3 d', '設問4'], counts: [5, 5, 5, 5, 5, 4] },
  { marks: 'エウイカア', labels: ['a', 'b', 'c', 'd', 'e'], counts: [5, 5, 4, 6, 6] },
];
const cases = (q: number) => [0, 1, 2, 3].map(index => definitions[q - 1].build([index]));
const prose = (body: GeneratedBody) => body.prompt.filter(block => block.type === 'paragraph').map(block => block.text).join('\n');
const choiceValue = ([block]: Block[]) => {
  if (block.type === 'table') return block.rows;
  assert(block.type === 'paragraph');
  return block.text;
};
const choiceIndex = (id: string) => +id.slice('choice-value-'.length) - 1;

function part(body: GeneratedBody, slot: number) {
  const part = body.answerParts![slot];
  const definition = body.partAnswers!.find(answer => answer.kind === 'unordered'
    ? answer.partIds.includes(part.id) : answer.partId === part.id);
  assert(definition?.kind === 'choice' || definition?.kind === 'unordered');
  const id = definition.kind === 'choice' ? definition.choiceId : definition.choiceIds[definition.partIds.indexOf(part.id)];
  return { ...part, values: part.choiceIds.map(choice => choiceValue(body.choices[choiceIndex(choice)])), correct: part.choiceIds.indexOf(id) };
}
function checks(body: GeneratedBody, slot: number, testValue: (value: string | string[][], index: number) => boolean) {
  const answer = part(body, slot);
  assert.deepEqual(answer.values.flatMap((value, i) => testValue(value, i) ? [i] : []), [answer.correct], answer.label);
}
const tableRows = (body: GeneratedBody, caption: string) => {
  const block = body.prompt.find(block => block.type === 'table' && block.caption.startsWith(caption));
  assert(block?.type === 'table');
  return block.rows;
};

function render(block: Block) {
  assert(block.type === 'diagram' && block.scene.kind === 'source_figure');
  const { values, profile } = block.scene;
  const figure = figures.find(figure => figure.profile === profile), renderer = renderers.find(renderer => renderer.profile === profile);
  assert(figure && renderer);
  figure.validate(values);
  assert.equal(figure.alt(values), block.alt);
  const drawing = renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
  assert.match(drawing, /tabindex="0"/);
  assert.match(drawing, /aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
  assert.match(drawing, /<desc\b[^>]*>[\s\S]+<\/desc>/);
  assert(drawing.includes('var(--diagram-ink)') && drawing.includes('var(--image-scale, 1)'));
  return drawing;
}

function diagram(body: GeneratedBody, suffix: string) {
  const block = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith(suffix));
  assert(block?.type === 'diagram');
  return block;
}

test('問1〜4の公式19欄、全原頁、16条件と400選択肢の形式・再現性を照合する', () => {
  assert.deepEqual(specs.flatMap(spec => spec.pages), Array.from({ length: 17 }, (_, i) => i + 5));
  assert.match(specs[0].originalPageAlt[5], /6問以上マークした場合には，はじめの5問/);
  let checked = 0;
  for (const [i, definition] of definitions.entries()) {
    const row = official[i], all = cases(i + 1), spec = specs[i];
    assert.equal(definition.source, '2011h23tokubetsu-fe-pm-' + (i + 1));
    assert.equal(definition.version, '3.2.0');
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(field => [field.minimum, field.maximum]), [[0, 3]]);
    assert.deepEqual(spec.original, all[0]);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), spec.pages);
    assert(Object.values(spec.originalPageAlt).every(alt => alt.length > 100));
    const answerMarks = all[0].answerParts!.map((_, j) => 'アイウエオカ'[part(all[0], j).correct]).join('');
    assert.equal(answerMarks, row.marks);
    const signatures = new Set<string>(), prompts = new Set<string>();
    for (const [input, body] of all.entries()) {
      assert.deepEqual(body, definition.build([input]));
      assert.deepEqual(body.prompt.map(block => block.type), all[0].prompt.map(block => block.type));
      assert.deepEqual(body.choices.map(blocks => blocks.map(block => block.type)), all[0].choices.map(blocks => blocks.map(block => block.type)));
      assert.deepEqual(body.answerParts!.map(slot => slot.label), row.labels);
      assert(body.explanation.length > 150);
      prompts.add(JSON.stringify(body.prompt));
      signatures.add(JSON.stringify(body.answerParts!.map((_, j) => {
        const answer = part(body, j);
        assert.equal(answer.values.length, row.counts[j]);
        assert.equal(new Set(answer.values.map(value => JSON.stringify(value))).size, row.counts[j]);
        checked += answer.values.length;
        return answer.values[answer.correct];
      })));
    }
    assert.equal(signatures.size, 4);
    assert.equal(prompts.size, 4);
    for (const bad of [[], [0, 0], [-1], [4], [1.2], [Number.NaN], Array(1)])
      assert.throws(() => definition.build(bad), /PARAMETER_CONSTRAINT/);
  }
  assert.equal(checked, 400);
});

function decode(word: string) {
  const bits = Number.parseInt(word, 16).toString(2).padStart(16, '0');
  return {
    code: Number.parseInt(bits.slice(0, 8), 2),
    register: Number.parseInt(bits.slice(8, 10), 2),
    operand: Number.parseInt(bits.slice(10, 12), 2),
    directRegister: bits.endsWith('10'),
    indexed: bits.at(-2) === '0',
    indirect: bits.at(-1) === '1',
  };
}
test('問1のビット列と全命令語を16ビットの文字列で解釈し，全択を検算する', () => {
  for (const body of cases(1)) {
    const registers = tableRows(body, '図2　レジスタ').map(([, value]) => +value);
    const code = tableRows(body, '図3　プログラム').map(([, word]) => word);
    const memory = Array<number>(1000), snapshots = [];
    for (let pc = 0; pc < code.length;) {
      const instruction = decode(code[pc++]);
      if (instruction.code === 0xff) break;
      const address = instruction.indexed ? Number.parseInt(code[pc++], 16) : 0;
      const adjusted = address + (instruction.operand === 0 && instruction.indexed ? 0 : registers[instruction.operand]);
      const effective = instruction.indexed && instruction.indirect ? memory[adjusted] : adjusted;
      const target = instruction.register;
      if (instruction.code === 0x30) memory[effective] = registers[target];
      else {
        const value = instruction.directRegister ? registers[instruction.operand] : memory[effective];
        assert(Number.isFinite(value));
        registers[target] = (instruction.code === 0x10 ? registers[target] : 0) + value;
      }
      snapshots.push([...registers]);
    }
    for (const [i, value] of [snapshots[1][1], snapshots[4][1], snapshots[4][3]].entries()) checks(body, i, answer => +answer === value);
    const initial = new Map(tableRows(body, '図4　レジスタと主記憶の内容（レジスタ）').map(([r, value]) => [+r, +value]));
    const cells = new Map(tableRows(body, '図4　レジスタと主記憶の内容（主記憶）').map(([r, value]) => [+r, +value]));
    const statement = /レジスタ番号(\d)のレジスタに(\d+)を設定する命令語の記述として誤り/.exec(prose(body));
    assert(statement);
    checks(body, 3, answer => {
      assert(typeof answer !== 'string');
      const [[op, dst, operand, d, i, adr]] = answer;
      assert.equal(dst, statement[1]);
      assert.equal(op, '20h');
      const src = initial.get(+operand)!;
      if (d === '1') assert.equal(adr, '／');
      const adjusted = (d === '0' ? Number.parseInt(adr, 16) : 0) + src;
      const value = d === '1' ? (i === '0' ? src : cells.get(src)) :
        i === '0' ? cells.get(adjusted) : cells.get(cells.get(adjusted)!);
      return value !== Number(statement[2]);
    });
    const drawing = render(diagram(body, 'instruction-bits'));
    assert.deepEqual([...drawing.matchAll(/data-first-bit="(\d+)" data-last-bit="(\d+)"/g)].map(([, a, b]) => [+a, +b]),
      [[15, 8], [7, 6], [5, 4], [3, 2], [1, 1], [0, 0]]);
  }
});

type CpuJob = { name: string; arrival: number; remaining: number; priority: number; elapsed: number };
function cpuTicks(input: CpuJob[], mode: 'fcfs' | 'rr' | 'priority', quantum: number) {
  const jobs = input.map(job => ({ ...job })), finishes: CpuJob[] = [], finishTimes: number[] = [];
  const waiting: CpuJob[] = [];
  let running: CpuJob | undefined, slice = 0;
  for (let time = 0; finishes.length < jobs.length && time < 1_000; time++) {
    waiting.push(...jobs.filter(job => job.arrival === time));
    if (!running) {
      if (mode === 'priority') waiting.sort((a, b) => b.priority - a.priority);
      running = waiting.shift();
      slice = 0;
    }
    if (!running) continue;
    running.remaining--;
    running.elapsed++;
    slice++;
    if (mode === 'priority' && running.elapsed % quantum === 0 && running.priority > 1) running.priority--;
    if (running.remaining === 0) {
      finishes.push(running);
      finishTimes.push(time + 1);
      running = undefined;
    } else if ((mode === 'rr' && slice === quantum) ||
      (mode === 'priority' && waiting.some(job => job.priority > running!.priority))) {
      waiting.push(running);
      running = undefined;
    }
  }
  assert.equal(finishes.length, jobs.length);
  return { order: finishes.map(job => job.name).join(', '), priorities: Object.fromEntries(finishes.map(job => [job.name, job.priority])),
    average: finishes.reduce((sum, job, i) => sum + finishTimes[i] - job.arrival, 0) / jobs.length };
}

test('問2は1ミリ秒ずつCPUを進めて到着順・ラウンドロビン・優先度順の全候補を照合する', () => {
  for (const [i, body] of cases(2).entries()) {
    const q = Number(prose(body).match(/タイムクウォンタムが(\d+)ミリ秒/)?.[1]);
    assert(q > 0);
    const jobs = tableRows(body, '表1　プロセスの到着時刻').map(([name, arrival, duration]) =>
      ({ name, arrival: +arrival, remaining: +duration, priority: 0, elapsed: 0 }));
    const first = cpuTicks(jobs, 'fcfs', q), robin = cpuTicks(jobs, 'rr', q);
    const prioritized = tableRows(body, '表2　プロセスの処理時間').map(([name, duration, priority]) =>
      ({ name, arrival: 0, remaining: +duration, priority: +priority, elapsed: 0 }));
    const priority = cpuTicks(prioritized, 'priority', q);
    if (i === 0) assert.deepEqual([first.average, robin.average, priority.order, priority.priorities.B], [242.5, 182.5, 'B, A, C', 5]);
    [first.average, robin.average, priority.order, priority.priorities.B].forEach((value, j) =>
      checks(body, j, answer => typeof value === 'number' ? +answer === value : answer === value));
  }
});

function outcomeStocks(initial: number, changes: number[]) {
  const outputs = new Set<number>();
  function step(stock: number, stage: number[], local: number[]) {
    if (stage.every(n => n === 3)) {
      outputs.add(stock);
      return;
    }
    stage.forEach((n, i) => {
      if (n === 3) return;
      const next = [...stage], copies = [...local];
      next[i]++;
      if (n === 0) copies[i] = stock;
      else if (n === 1) copies[i] += changes[i];
      step(n === 2 ? copies[i] : stock, next, copies);
    });
  }
  step(initial, [0, 0], [0, 0]);
  outputs.delete(initial + changes[0] + changes[1]);
  return [...outputs].sort((a, b) => a - b);
}

function canBlockForever(data: string[][]) {
  const orders = data.reduce<string[][][]>((combinations, colors) => combinations.flatMap(order => [[...order, colors], [...order, [...colors].reverse()]]), [[]]);
  return orders.some(order => {
    function run(steps: number[]): boolean {
      if (steps.every(step => step === 2)) return false;
      const canAdvance = steps.flatMap((step, i) => {
        if (step === 2) return [];
        return steps.some((state, j) => j !== i && state === 1 && order[j][0] === order[i][step]) ? [] : [i];
      });
      if (!canAdvance.length) return true;
      return canAdvance.some(i => run(steps.map((step, j) => step + Number(i === j))));
    }
    return run(order.map(() => 0));
  });
}

function scoringQuestion(body: GeneratedBody) {
  const attribution: Attribution = { origin: 'original', sourceRefs: [], rightsRefs: ['rights-original'], creatorIds: ['codex'] };
  return {
    choices: body.choices.map((blocks, i) => ({ id: 'choice-value-' + (i + 1), content: { attribution, blocks } })),
    answerParts: body.answerParts, correctAnswer: { parts: body.partAnswers, attribution },
  } as Pick<Question, 'choices' | 'answerParts' | 'correctAnswer'> as Question;
}

test('問3の順不同は全読込み・計算・書込みの順列から検算し，両方向で2欄を採点する', () => {
  for (const [i, body] of cases(3).entries()) {
    const initial = Number(prose(body).match(/白絵の具の在庫数が(\d+)だった/)?.[1]);
    const amounts = tableRows(body, '表1　トランザクション').map(([kind, detail]) =>
      Number(detail.match(/(\d+)本/)?.[1]) * (kind.startsWith('出荷') ? -1 : 1));
    const expected = outcomeStocks(initial, amounts);
    assert.equal(expected.length, 2);
    if (!i) assert.deepEqual(expected, [45, 60]);
    const question = scoringQuestion(body);
    validateAnswerDefinition(question);
    const left = part(body, 0), right = part(body, 1), group = question.correctAnswer.parts![0];
    assert(group.kind === 'unordered');
    assert.equal(group.presentation, undefined);
    const correct = Object.fromEntries(question.correctAnswer.parts!.flatMap(entry =>
      entry.kind === 'choice' ? [[entry.partId, entry.choiceId]] : []));
    for (const [a, first] of left.values.entries()) {
      for (const [b, second] of right.values.entries()) {
        const selected = { ...correct, [left.id]: left.choiceIds[a], [right.id]: right.choiceIds[b] };
        const expectedPair = [+first, +second].sort((x, y) => x - y);
        const result = gradeAnswer(question, { selectedPartChoices: JSON.parse(JSON.stringify(selected)) });
        assert.equal(result.outcome, expected.every((value, j) => value === expectedPair[j]) ? 'correct' : 'incorrect');
        assert.equal(result.parts?.length, 6);
      }
    }
    const selected = group.choiceIds.map(choice => +choiceValue(body.choices[choiceIndex(choice)]));
    assert.deepEqual(selected.sort((a, b) => a - b), expected);
  }
});

test('問3はロック要求時系列、挿入位置の制約と全トランザクションの循環待ちを照合する', () => {
  const waitSets = ['T4T5T6', '', 'T4T5', 'T4', 'T6'];
  for (const body of cases(3)) {
    const drawing = render(diagram(body, 'lock-timeline'));
    const transactions = tableRows(body, '表2　トランザクション');
    const requests = [...drawing.matchAll(/data-lock-transaction="(T\d)" data-request="(\d+)"/g)]
      .sort((a, b) => +a[2] - +b[2]).map(row => row[1]);
    let exclusive = false, shared = 0;
    const waits: string[] = [];
    for (const id of requests) {
      const isRead = transactions.find(([name]) => name.endsWith(id))![0].startsWith('照会');
      if (exclusive || !isRead && shared > 0) waits.push(id);
      else if (isRead) shared++;
      else exclusive = true;
    }
    checks(body, 2, (_, i) => waitSets[i] === waits.sort().join(''));
    const stepRows = diagram(body, 'lock-insertion-steps').alt.split('\n');
    const redRead = stepRows.findIndex(line => line.includes('赤絵の具の在庫数データを読み込む'));
    const whiteWrite = stepRows.findIndex(line => line.includes('白絵の具の在庫数データを書き込む'));
    assert(redRead >= 0 && whiteWrite >= 0);
    const nearestBefore = stepRows.slice(0, redRead).reverse().find(line => line.startsWith('左向き矢印'))?.at(-1);
    const nearestAfter = stepRows.slice(whiteWrite + 1).find(line => line.startsWith('左向き矢印'))?.at(-1);
    checks(body, 3, value => value === nearestBefore);
    checks(body, 4, value => value === nearestAfter);
    const resources = new Map(tableRows(body, '表4　トランザクション').map(([name, details]) =>
      [name.match(/T\d+$/)?.[0], [...details.matchAll(/(.)絵の具/g)].map(row => row[1])]));
    checks(body, 5, choice => {
      assert(typeof choice === 'string');
      return canBlockForever(choice.split(', ').map(tx => resources.get(tx)!));
    });
  }
});

test('問4の3台を1秒刻みで起動・送信させ，経路時刻，次ホップ，距離，観測時の全択を照合する', () => {
  for (const [index, body] of cases(4).entries()) {
    const text = prose(body);
    const period = Number(text.match(/以後(\d+)秒間隔/)?.[1]);
    const gap = Number(text.match(/2，3を順に，(\d+)秒間隔/)?.[1]);
    const observations = /から(\d+)秒後には，ルータ3のテーブル.*?，(\d+)秒後には/.exec(text);
    assert(period && gap && observations);
    const drawing = render(diagram(body, 'network-structure'));
    const networks = [...drawing.matchAll(/data-subnet="([^"]+)"/g)].map(row => row[1]);
    const ports = [...drawing.matchAll(/data-ip-left="([^"]+)" data-ip-right="([^"]+)"/g)].map(([, left, right]) => [left, right]);
    assert.equal(networks.length, 4);
    assert.equal(ports.length, 3);
    if (index === 0) assert.deepEqual(ports, [
      ['10.0.0.1', '10.0.1.1'], ['10.0.1.2', '10.0.2.1'], ['10.0.2.2', '10.0.3.1'],
    ]);
    const states = Array.from({ length: 3 }, () => [Infinity, Infinity, Infinity, Infinity]);
    const hops = Array.from({ length: 3 }, () => ['―', '―', '―', '―']);
    let a = -1, b = -1, c: string[][] = [];
    const observed: string[] = [];
    for (let now = 0; now <= 150; now++) {
      for (let router = 0; router < 3; router++) {
        if (now === router * gap) states[router][router] = states[router][router + 1] = 0;
      }
      const snapshots = states.map(row => [...row]);
      for (let sender = 0; sender < 3; sender++) {
        if (now < sender * gap || (now - sender * gap) % period) continue;
        for (let receiver = 0; receiver < 3; receiver++) {
          if (now < receiver * gap || Math.abs(sender - receiver) !== 1) continue;
          for (let network = 0; network < 4; network++) {
            const distance = snapshots[sender][network] + 1;
            if (states[receiver][network] <= distance) continue;
            states[receiver][network] = distance;
            hops[receiver][network] = ports[sender][+(receiver > sender)];
          }
        }
      }
      if (a < 0 && states[0][3] < Infinity) a = now;
      if (b < 0 && states[1][0] < Infinity) {
        b = now;
        c = states[1].flatMap((distance, network) =>
          Number.isFinite(distance) ? [[networks[network], hops[1][network], String(distance)]] : []);
      }
      if ([+observations[1], +observations[2]].includes(now))
        observed.push(states[2].flatMap((distance, n) => Number.isFinite(distance) ? ['ABCD'[n]] : []).join(''));
    }
    checks(body, 0, value => +value === a);
    checks(body, 1, value => +value === b);
    checks(body, 2, value => JSON.stringify(value) === JSON.stringify(c));
    for (const [i, known] of observed.entries()) checks(body, 3 + i, value =>
      typeof value === 'string' && (value.match(/[ABCD]/g) ?? []).join('') === known);
  }
});

test('実コンポーネントの全7プロフィールと21描画に図形、キャプション、フォーカス、共通色がある', () => {
  const rendered = new Set<string>();
  for (const spec of specs) {
    for (const body of cases(spec.number)) {
      for (const block of body.prompt) {
        if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
        const drawing = render(block);
        assert.match(drawing, /data-source-figure="legacy-2011-special-pm-/);
        rendered.add(block.scene.profile + ':' + block.scene.values.join(','));
      }
    }
  }
  assert.equal(figures.length, 7);
  assert.equal(rendered.size, 21);
});
