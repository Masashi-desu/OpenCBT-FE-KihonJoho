import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { displayedAnswerParts, gradeAnswer, validateAnswerDefinition } from '../../../src/core/answers';
import type { Block, Question } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2008AutumnPm01To05Definitions as definitions } from '../../../src/core/generators/legacy-2008-autumn-pm-01-05';
import { legacy2008AutumnPm0105Figures as figures } from '../../../src/core/generators/legacy-2008-autumn-pm-01-05-figures';
import { legacy2008AutumnPm0105FigureRenderers as renderers } from '../../../src/ui/Legacy2008AutumnPm0105Figures';
import { autumn2008Pm01To05Specs as specs } from '../../../scripts/legacy-2008-autumn-pm-01-05-specs';
import official from '../../fixtures/legacy-2008-autumn-pm-01-05-review.json';

const marks = 'アイウエオカキクケコ';
const cases = (number: number) => [0, 1, 2, 3].map(index => definitions[number - 1].build([index]));
const paragraphs = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const textOf = (block: Block) => { assert(block.type === 'paragraph' || block.type === 'code'); return block.text; };
const tableOf = (block: Block) => { assert(block.type === 'table'); return block; };
const diagram = (body: GeneratedBody, suffix: string) => body.prompt.flatMap(block =>
  block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith(suffix) ? [block] : []);
const choiceIndex = (id: string) => Number(id.slice('choice-value-'.length)) - 1;
function field(body: GeneratedBody, position: number) {
  const answer = body.partAnswers![position];
  assert(answer && answer.kind !== 'no_correct_answer');
  const slot = body.answerParts!.find(part => part.id === (answer.kind === 'choice' ? answer.partId : answer.partIds[0]));
  assert(slot);
  const correct = answer.kind === 'choice' ? [answer.choiceId] : answer.choiceIds;
  return {
    answer, slot, options: slot.choiceIds.map(id => textOf(body.choices[choiceIndex(id)][0])),
    correct: correct.map(id => slot.choiceIds.indexOf(id)),
  };
}
function unique(body: GeneratedBody, position: number, accepts: (option: string, index: number) => boolean) {
  const { slot, options, correct } = field(body, position);
  assert.deepEqual(options.flatMap((choice, index) => accepts(choice, index) ? [index] : []), correct, slot.label);
}
function numberOf(text: string) { return Number(text.replaceAll(',', '')); }

function contentStructure(blocks: readonly Block[]) {
  return blocks.map(block => {
    if (block.type === 'diagram' && block.scene.kind === 'source_figure') return [block.type, block.scene.profile];
    if (block.type === 'image') return [block.type, block.assetId];
    if (block.type === 'code') return [block.type, block.language];
    return [block.type];
  });
}
function bodyStructure(body: GeneratedBody) {
  return {
    prompt: contentStructure(body.prompt),
    contexts: (body.contexts ?? []).map(({ presentation, blocks }) => ({ presentation, blocks: contentStructure(blocks) })),
    choices: body.choices.map(contentStructure),
  };
}

test('5大問の公式キー、20条件と基準本文・参照資料・解答群の構成を照合する', () => {
  assert.deepEqual(specs.map(spec => spec.pages), official.questions.map(question => question.pages));
  assert.match(specs[0].originalPageAlt[4], /^次の問1から問5までの5問については，全問解答/);
  assert.match(specs[2].originalPageAlt[11], /解答群の中から三つ選べ/);
  for (const spec of specs) for (const page of spec.pages) assert(spec.originalPageAlt[page].length > 100);
  let count = 0;
  for (const [i, definition] of definitions.entries()) {
    const facts = official.questions[i], bodies = cases(facts.number), original = bodies[0];
    assert.equal(definition.source, official.collection + '-' + facts.number);
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(original.partAnswers!.map((_, pos) => field(original, pos).correct.map(n => marks[n]).join('')), facts.keys);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, 4);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.partAnswers!.map((_, p) => {
      const { options, correct } = field(body, p);
      return correct.map(n => options[n]);
    })))).size, 4);
    for (const [index, body] of bodies.entries()) {
      assert.deepEqual(body, definition.build([index]));
      assert.deepEqual(body.partAnswers!.map((_, pos) => field(body, pos).options.length), facts.counts);
      assert.deepEqual(bodyStructure(body), bodyStructure(original), definition.source + ' 条件' + index);
      assert(body.explanation.length > 100);
      assert(body.partAnswers!.every((_, pos) => {
        const { options } = field(body, pos);
        return options.length === new Set(options).size;
      }));
      count += body.choices.length;
    }
    for (const invalid of [[-1], [4], [NaN], [0.5], [], [0, 0], Array<number>(1)]) assert.throws(() => definition.build(invalid), /PARAMETER_CONSTRAINT/);
  }
  assert.equal(count, 412);
});

type Traffic = { from: string; to: string; count: number };
function allLinkTraffic(calls: readonly Traffic[], rate: number, branchDirect: boolean) {
  const totals = new Map<string, number>();
  for (const { from, to, count } of calls) {
    for (const [a, b] of [[from, to], [to, from]]) {
      const via = a !== '本社' && b !== '本社' && !branchDirect;
      const route = via ? [a, '網', '本社', '網', b] : [a, '網', b];
      for (let i = 1; i < route.length; i++) {
        const key = route[i - 1] + '→' + route[i];
        totals.set(key, (totals.get(key) ?? 0) + count * rate);
      }
    }
  }
  return totals;
}

test('問1は各通話の送受話パケットを経路に流し、向き別の負荷を全候補と照合する', () => {
  for (const body of cases(1)) {
    const { columns, rows } = tableOf(body.prompt.find(block => block.type === 'table')!);
    const calls = rows.flatMap(([from, ...values]) => values.flatMap((value, i) => value ? [{ from, to: columns[i + 1], count: Number(value) }] : []));
    assert.equal(calls.length, 6);
    const prompt = paragraphs(body), rate = Number(prompt.match(/送話，受話ともに(\d+)kビット/)![1]);
    const before = allLinkTraffic(calls, rate, false), after = allLinkTraffic(calls, rate, true);
    const xy = allLinkTraffic(calls.filter(({ from, to }) => from === '支店X' && to === '支店Y'), rate, false);
    assert.equal(numberOf(prompt.match(/上り下りとも([\d,]+)kビット/)![1]), before.get('本社→網'));
    unique(body, 0, option => ({ '1/4': 0.25, '1/2': 0.5 }[option] ?? Number(option)) === xy.get('本社→網')! / xy.get('支店X→網')!);
    unique(body, 1, option => numberOf(option) === before.get('支店X→網'));
    unique(body, 2, option => numberOf(option) === after.get('本社→網'));
    unique(body, 3, option => option === '同じ' && ['支店X', '支店Y', '支店Z'].every(site =>
      before.get(site + '→網') === after.get(site + '→網') && before.get('網→' + site) === after.get('網→' + site)));
    assert.match(diagram(body, '-topology')[1].alt, /本社内のルータを経由/);
  }
});

type PrintInput = { text: string; margin: number; width: number; height: number };
function referencePrint({ text, margin, width, height }: PrintInput, separator: string) {
  if (!text) return '';
  const segments = text.split(separator);
  if (text.endsWith(separator)) segments.pop();
  const lines = segments.flatMap(segment => segment.match(new RegExp('.{1,' + width + '}', 'g')) ?? ['']);
  return lines.map((line, i) => ' '.repeat(margin) + line + '\n' + ((i + 1) % height === 0 ? '\f' : '')).join('');
}
function checkCondition(left: string, right: string, operator: string) {
  return operator === '=' ? left === right : left !== right;
}
function candidatePrint({ text, margin, width, height }: PrintInput, program: readonly string[], base: number, separator: string) {
  const eos = 'EOS', input = [...Array<string>(base).fill('PAD'), ...text.split('').map(c => c === '|' ? separator : c), eos];
  const line: string[] = [];
  for (let n = 0; n < margin; n++) line[n + base] = ' ';
  let source = base, lines = 0, output = '';
  const [a, b, c, d] = program;
  const printStart = d.match(/CurrentP: (\d+)/)![1];
  const bCondition = b.match(/Str\[StartP\] ([=≠]) (\w+)/)!;
  const dCondition = d.match(/Line\[CurrentP\] ([=≠]) (\w+)/)!;
  for (let step = 0; input[source] !== eos; step++) {
    if (step > 128 || input[source] === undefined) return undefined;
    let end = source;
    const value = (term: string) => ({ StartP: source, EndP: end, MaxC: width,
      '(StartP + MaxC)': source + width, '(EndP + MaxC)': end + width })[term]!;
    const [l, r] = c.split(' < ');
    while (input[end] !== eos && input[end] !== separator && value(l) < value(r)) {
      if (input[end++] === undefined) return undefined;
    }
    let current = a.startsWith('CurrentP: Margin') || a.startsWith('CurrentP: (Margin') ? base + margin : base;
    while (a.includes('StartP < EndP') ? source < end : current < width) {
      if (input[source] === undefined) return undefined;
      line[current++] = input[source++];
    }
    line[current] = eos;
    for (let print = Number(printStart); checkCondition(line[print], dCondition[2], dCondition[1]); print++) {
      if (line[print] === undefined) return undefined;
      output += line[print];
    }
    output += '\n';
    if (++lines >= height) { output += '\f'; lines = 0; }
    if (checkCondition(input[source], bCondition[2], bCondition[1])) source++;
  }
  return output;
}

test('問2は全空欄候補を実行し、改行単位に分割する独立解と境界まで照合する', () => {
  for (const body of cases(2)) {
    const source = body.prompt.find(block => block.type === 'code' && block.text.startsWith('○PrintOut'));
    assert(source?.type === 'code');
    const base = Number(source.text.match(/StartP ← ([01])/)![1]);
    const separator = source.text.match(/Str\[EndP\] ≠ (NL|LB)/)![1];
    assert.match(paragraphs(body), /1≦\(Margin＋MaxC\)≦100|配列の添字は[01]から始まる/);
    assert.match(source.text, /│  ■ ［a］\n│  │  ・Line\[CurrentP\]/);
    assert.deepEqual(body.contexts?.[0].blocks.map(block => block.type === 'image' ? block.assetId : ''),
      ['asset-ipa-2008h20a-fe-pm-page-002', 'asset-ipa-2008h20a-fe-pm-page-003']);
    const samples: PrintInput[] = [
      { text: '', margin: 0, width: 3, height: 3 },
      { text: '|AB||C|', margin: 2, width: 3, height: 3 },
      { text: 'ABCDEF|GH', margin: 1, width: 3, height: 2 },
      { text: 'ABCDEFGH', margin: 3, width: 2, height: 2 },
      { text: 'A'.repeat(101) + '|', margin: 1, width: 99, height: 1 },
      { text: 'A'.repeat(100), margin: 0, width: 100, height: 1 },
    ];
    const banks = body.partAnswers!.map((_, pos) => field(body, pos));
    const answers = banks.map(bank => bank.options[bank.correct[0]]);
    for (let blank = 0; blank < 4; blank++) unique(body, blank, candidate => samples.every(sample => {
      const program = answers.map((item, pos) => pos === blank ? candidate : item);
      return candidatePrint(sample, program, base, separator) === referencePrint(sample, '|');
    }));
  }
});

function asQuestion(body: GeneratedBody) {
  return { id: 'test-question', choices: body.choices.map((blocks, i) => ({ id: 'choice-value-' + (i + 1), content: { blocks } })),
    answerParts: body.answerParts, correctAnswer: { parts: body.partAnswers } } as Question;
}

test('問3はSQLiteで3条件の全20通りと役職SQLの全5候補を実行し、チェックリストは1欄として採点する', () => {
  for (const body of cases(3)) {
    const query = body.prompt.find(block => block.type === 'code' && block.text.startsWith('SELECT DISTINCT'));
    assert(query?.type === 'code');
    const match = query.text.match(/BETWEEN '(\d+)-04-01' AND '(\d+)-03-31'/)!;
    const year = Number(match[1]), next = Number(match[2]);
    assert.equal(next, year + 1);
    const role = paragraphs(body).match(/役職名の中に“([^”]+)”/)![1];
    const db = new DatabaseSync(':memory:');
    try {
      db.exec(`CREATE TABLE 社員表 (社員コード TEXT PRIMARY KEY, 入社年月日 TEXT, 退職年月日 TEXT, 部署コード TEXT);
        CREATE TABLE 研修実施表 (年度 TEXT, 研修コード TEXT, 研修名 TEXT, 研修日数 INT, PRIMARY KEY(年度, 研修コード));
        CREATE TABLE 受講表 (年度 TEXT, 研修コード TEXT, 社員コード TEXT, 受講日数 INT, PRIMARY KEY(年度,研修コード,社員コード));
        CREATE TABLE 役職表 (役職コード TEXT PRIMARY KEY, 役職名 TEXT);`);
      const employee = db.prepare('INSERT INTO 社員表 VALUES (?, ?, ?, ?)');
      const employees: [string, string, string | null, string][] = [
        ['a', year + '-04-01', null, 'D1'], ['b', next + '-03-31', null, 'D1'],
        ['c', year + '-07-21', next + '-02-01', 'D2'], ['d', year + '-03-31', null, 'D3'], ['e', next + '-04-01', null, 'D3'],
      ];
      employees.forEach(row => employee.run(...row));
      const course = db.prepare('INSERT INTO 研修実施表 VALUES (?, ?, ?, ?)');
      const courses: [string, string, string, number][] = [
        [String(year), 'T', '初年度研修', 3], [String(next), 'T', '翌年度研修', 4],
        [String(year), 'U', '受講なし', 2], [String(next), 'V', '退職者研修', 2],
        [String(next), 'W', '範囲外研修', 3], [String(next), 'X', '翌年度個別研修', 3], [String(next + 1), 'T', '同じコードの別年度研修', 2],
      ];
      courses.forEach(row => course.run(...row));
      const receipt = db.prepare('INSERT INTO 受講表 VALUES (?, ?, ?, ?)');
      const attendance: [string, string, string, number][] = [
        [String(year), 'T', 'a', 1], [String(next), 'T', 'a', 2], [String(year), 'U', 'a', 0], [String(next), 'V', 'c', 2],
        [String(next), 'W', 'd', 1], [String(next), 'W', 'e', 2], [String(next), 'X', 'b', 1],
      ];
      attendance.forEach(row => receipt.run(...row));
      const roleInsert = db.prepare('INSERT INTO 役職表 VALUES (?, ?)');
      const roles: [string, string][] = [['a', role], ['b', '副' + role], ['c', role + '代理'], ['d', '副' + role + '代理'], ['e', '管理職']];
      roles.forEach(row => roleInsert.run(...row));
      const lo = year + '-04-01', hi = next + '-03-31';
      const eligible = new Set(employees.filter(([, joined, retired]) => joined >= lo && joined <= hi && retired === null).map(([id]) => id));
      const expected = [...new Set(attendance.filter(([, , employee, days]) => eligible.has(employee) && days > 0)
        .map(([year, code]) => courses.find(row => row[0] === year && row[1] === code)![2]))].sort();
      const checklist = field(body, 0);
      assert(checklist.answer.kind === 'unordered' && checklist.answer.presentation === 'checklist');
      const candidates = checklist.options;
      const matches: number[][] = [];
      for (let a = 0; a < candidates.length; a++) {
        for (let b = a + 1; b < candidates.length; b++) {
          for (let c = b + 1; c < candidates.length; c++) {
            const combo = [a, b, c];
            let i = 0;
            const completed = query.text.replaceAll('［空欄］', () => candidates[combo[i++]]);
            const rows = db.prepare(completed).all().map(row => String(row.研修名)).sort();
            if (rows.join('|') === expected.join('|')) matches.push(combo);
          }
        }
      }
      assert.deepEqual(matches, [checklist.correct]);
      const roleIds = roles.filter(([, name]) => name.includes(role)).map(([id]) => id).sort();
      unique(body, 1, choice => db.prepare(choice).all().map(row => String(row.役職コード)).sort().join(',') === roleIds.join(','));
      const schema = diagram(body, '-training-schema')[0].alt;
      assert.match(schema, /受講表（年度，研修コード，社員コード，受講日数）/);
      assert.match(schema, /社員表（社員コード，氏名，入社年月日，部署コード/);
      const sharedPersonIdentifier = [...new Set(['社員コード', '部署コード'])].find(field =>
        schema.includes('受講表（年度，研修コード，' + field + '，'));
      const groupingColumn = [...new Set(['社員コード', '部署コード'])].find(field => employees.filter(row =>
        row[field === '社員コード' ? 0 : 3] === (field === '社員コード' ? 'a' : 'D1')).length === 2);
      unique(body, 2, choice => choice === sharedPersonIdentifier);
      unique(body, 3, choice => choice === groupingColumn);
      unique(body, 4, choice => choice === '社員表' && schema.includes(choice + '（' + sharedPersonIdentifier) && schema.includes(groupingColumn!));
      const q = asQuestion(body);
      validateAnswerDefinition(q);
      assert.equal(displayedAnswerParts(q).length, 5);
      const reverse = [...checklist.answer.choiceIds].reverse();
      const selected = Object.fromEntries(body.partAnswers!.flatMap(answer => answer.kind === 'choice' ? [[answer.partId, answer.choiceId]] : []));
      const fill = (values: readonly string[]) => ({ selectedPartChoices: {
        ...selected, ...Object.fromEntries(values.map((id, i) => [checklist.answer.kind === 'unordered' ? checklist.answer.partIds[i] : '', id])),
      } });
      assert.equal(gradeAnswer(q, fill(reverse)).outcome, 'correct');
      assert.equal(gradeAnswer(q, fill(reverse.slice(0, 2))).outcome, 'unanswered');
      assert.equal(gradeAnswer(q, fill([reverse[0], reverse[1], checklist.slot.choiceIds.find(id => !reverse.includes(id))!])).outcome, 'incorrect');
    } finally { db.close(); }
  }
});

type Edge = [number, number, number];
type Route = { points: number[]; weight: number };
function paths(edges: readonly Edge[]) {
  const results: Route[] = [];
  function visit(route: Route) {
    results.push(route);
    for (const [start, end, weight] of edges) {
      if (start !== route.points.at(-1) || route.points.includes(end)) continue;
      visit({ points: [...route.points, end], weight: route.weight + weight });
    }
  }
  visit({ points: [1], weight: 0 });
  return results;
}
function edgesIn(alt: string): Edge[] {
  return [...alt.matchAll(/([1-6])→([1-6])：([\d]+)/g)].map(match => [Number(match[1]), Number(match[2]), Number(match[3])]);
}
function least(routes: readonly Route[], node: number, settled: readonly number[]) {
  return Math.min(...routes.filter(route => route.points.at(-1) === node &&
    route.points.slice(0, -1).every(n => settled.includes(n))).map(route => route.weight));
}

test('問4は経路の全列挙で8図の距離と処理順、全6欄の候補を検算する', () => {
  for (const body of cases(4)) {
    const graphs = diagram(body, '-shortest-graph');
    assert.equal(graphs.length, 8);
    const teaching = edgesIn(graphs[0].alt), problem = edgesIn(graphs[7].alt);
    assert.equal(teaching.length, 9);
    assert.equal(problem.length, 9);
    const teachingRoutes = paths(teaching), problemRoutes = paths(problem);
    const nodes = [1, 2, 3, 4, 5, 6], settled: number[] = [1];
    for (let step = 1; step <= 6; step++) {
      const graph = graphs[step];
      assert.deepEqual(edgesIn(graph.alt), teaching);
      if (step > 1) {
        const remaining = nodes.filter(node => !settled.includes(node));
        const next = remaining.map(node => ({ node, weight: least(teachingRoutes, node, settled) }))
          .sort((a, b) => a.weight - b.weight || a.node - b.node)[0];
        settled.push(next.node);
      }
      assert.deepEqual(graph.alt.match(/網掛け地点は([1-6，]+)。/)![1].split('，').map(Number), settled);
      const shown = [...graph.alt.matchAll(/(?:で|，)([2-6])：(\d+|∞|［b］)/g)];
      assert.equal(shown.length, 5);
      for (const [, node, value] of shown) {
        if (Number(node) === 6 && step >= 5) assert.equal(value, '［b］');
        else assert.equal(value === '∞' ? Infinity : Number(value), least(teachingRoutes, Number(node), settled));
      }
    }
    unique(body, 0, choice => {
      const [first, from, to] = choice.match(/^Sd\[([ik])\] \+ Dt\[([ik])\]\[([ik])\]$/)!.slice(1);
      return [3, 5].every(i => {
        const k = 2, values = { i, k }, label = (key: string) => values[key as keyof typeof values];
        const addend = teaching.find(([a, b]) => a === label(from) && b === label(to))?.[2] ?? Infinity;
        return least(teachingRoutes, label(first), [1]) + addend === least(teachingRoutes, i, [1, 2]);
      });
    });
    unique(body, 1, choice => Number(choice) === least(teachingRoutes, 6, nodes));
    const distances = nodes.slice(1).map(node => ({ node, distance: least(problemRoutes, node, nodes) }));
    const rank = distances.sort((a, b) => a.distance - b.distance || a.node - b.node).map(item => item.node);
    unique(body, 2, choice => choice === rank.slice(0, -1).map(node => '地点' + node).join('，'));
    [3, 5, 6].forEach((node, i) => unique(body, i + 3, choice => Number(choice) === least(problemRoutes, node, nodes)));
  }
});

test('問5は日付をまたぐモジュールと照会キー、重複可否、分類集計を実例で検算する', () => {
  for (const body of cases(5)) {
    const prompt = paragraphs(body), once = prompt.includes('同じ会員による同じ楽曲のダウンロード完了は1回');
    const records = [
      { 会員番号: 'A', 楽曲番号: '101', ダウンロード日付: '2008-11-02' },
      { 会員番号: 'A', 楽曲番号: '102', ダウンロード日付: '2008-11-03' },
      { 会員番号: 'B', 楽曲番号: '101', ダウンロード日付: '2008-11-03' },
      { 会員番号: 'B', 楽曲番号: '102', ダウンロード日付: '2008-11-04' },
      ...(once ? [] : [{ 会員番号: 'A', 楽曲番号: '101', ダウンロード日付: '2008-11-03' }]),
    ];
    const date = '2008-11-03';
    unique(body, 0, key => ['A', 'B'].every(member => {
      const matched = records.filter(row => row.ダウンロード日付 === date && row[key as keyof typeof row] === member);
      return matched.length === records.filter(row => row.ダウンロード日付 === date && row.会員番号 === member).length;
    }));
    const modules = [
      ['会員ファイルの検索', -9], ['楽曲検索画面の表示', -7], ['楽曲管理ファイルの検索', -5],
      ['楽曲選択画面の表示', -1], ['楽曲のダウンロード', 4],
    ] as const;
    const midnight = 0; // Minutes relative to midnight; the day changes after results are displayed.
    const tree = diagram(body, '-module-tree')[0].alt;
    assert.match(tree, /ダウンロード主処理の下は楽曲のダウンロード，ダウンロード実績ファイルへのレコード追加/);
    unique(body, 1, label => modules.find(([module]) => module === label)![1] >= midnight);
    unique(body, 2, keys => records.every(sample => {
      const request = { ...sample, ダウンロード日付: date };
      const actual = records.filter(row => keys.split('と').every(key =>
        row[key as keyof typeof row] === request[key as keyof typeof row]));
      const wanted = records.filter(row => row.会員番号 === sample.会員番号 && row.楽曲番号 === sample.楽曲番号);
      return actual.length === wanted.length && actual.every(row => wanted.includes(row));
    }));
    const limits: Record<string, [number, number]> = {
      '0件': [0, 0], '0件以上': [0, Infinity], '0件又は1件': [0, 1], '1件': [1, 1], '2件以上': [2, Infinity],
    };
    const range = [0, 1, 2, 3].filter(n => !once || n <= 1);
    unique(body, 3, option => {
      const [min, max] = limits[option];
      return [0, 1, 2, 3].filter(n => n >= min && n <= max).join(',') === range.join(',');
    });
    const flow = diagram(body, '-report-flow')[0].alt, report = diagram(body, '-report')[0].alt;
    const group = report.match(/^([^。]+)別ダウンロード件数表/)![1];
    assert(flow.includes(group + '別ダウンロード件数表'));
    assert.match(flow, /ファイル［e］は上から処理4へ入る/);
    const table = tableOf(body.prompt.find(block => block.type === 'table')!);
    assert.equal(table.rows.length, 7);
    assert.match(table.rows[0][2], /会員番号をキーとして.*入会後(1週間|2週間|10日間|3週間)以内/);
    assert.match(table.rows[3][2], /楽曲番号をキーとして/);
    assert(table.rows[5][2].includes(group + 'ごとに'));
    const definitions = diagram(body, '-record');
    const files: Record<string, string> = {
      楽曲管理ファイル: definitions[0].alt, 会員ファイル: definitions[1].alt, ダウンロード実績ファイル: definitions[2].alt,
    };
    unique(body, 4, file => files[file].includes(group) && files[file].includes('楽曲番号'));
    const songs = [
      { 楽曲番号: '101', 分類: 'G1', 会員番号: 'A', 楽曲データの大きさ: '128', ダウンロード件数: '2' },
      { 楽曲番号: '102', 分類: 'G2', 会員番号: 'A', 楽曲データの大きさ: '128', ダウンロード件数: '2' },
      { 楽曲番号: '103', 分類: 'G1', 会員番号: 'B', 楽曲データの大きさ: '512', ダウンロード件数: '1' },
    ];
    unique(body, 5, candidate => songs.every(a => songs.every(b => {
      const key = candidate === group ? '分類' : candidate as keyof typeof a;
      return (a[key] === b[key]) === (a.分類 === b.分類);
    })));
  }
});

test('全9種52状態の図をSSRし、アクセシブルなタイトルと全状態の媒体を確認する', () => {
  assert.equal(figures.length, 9);
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  let count = 0;
  for (const figure of figures) {
    const renderer = renderers.find(candidate => candidate.profile === figure.profile)!;
    const [[start, end]] = figure.domain;
    assert.equal(start, 0);
    assert.throws(() => figure.validate([end + 1]), /FIGURE_PROFILE/);
    for (let value = start; value <= end; value++) {
      const values = [value], alt = figure.alt(values);
      const html = renderToStaticMarkup(createElement(renderer.component, { values, caption: '検証図' }));
      assert.match(html, /role="img".*aria-labelledby="[^"]+".*aria-describedby="[^"]+"/);
      assert(html.includes('<desc') && html.includes(alt));
      if (figure.profile.endsWith('-shortest-graph')) {
        assert.equal([...html.matchAll(/data-graph-edge=/g)].length, 9);
        assert.equal([...html.matchAll(/data-graph-point=/g)].length, 6);
        const graphStep = value % 8;
        assert.equal([...html.matchAll(/data-settled="true"/g)].length, graphStep === 7 ? 0 : graphStep);
      }
      if (figure.profile.endsWith('-training-schema')) assert.equal([...html.matchAll(/text-decoration="underline"/g)].length, 5);
      if (figure.profile.endsWith('-5-record')) assert.equal([...html.matchAll(/data-key-field="true"/g)].length, value === 2 ? 3 : 1);
      if (figure.profile.endsWith('-5-module-tree')) assert.equal([...html.matchAll(/data-module-edge=/g)].length, 17);
      if (figure.profile.endsWith('-5-report')) assert.equal([...html.matchAll(/data-report-row=/g)].length, 5);
      count++;
    }
  }
  assert.equal(count, 52);
});
