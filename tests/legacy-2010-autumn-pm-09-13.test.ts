import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { autumn2010PmLanguageDrafts as drafts } from '../src/core/generators/legacy-2010-autumn-pm-09-13';
import { legacy2010AutumnPm0913Figures as figures } from '../src/core/generators/legacy-2010-autumn-pm-09-13-figures';
import { legacy2010AutumnPm0913FigureRenderers as renderers } from '../src/ui/Legacy2010AutumnPm0913Figures';
import { reversedBits, runPart, runWord, runWords } from './fixtures/legacy-2010-autumn-pm-casl-oracle';
import { evaluate, sheetFromAlt } from './fixtures/legacy-2010-autumn-pm-sheet-oracle';

const official = ['アウエイエイ', 'ウオキイイウカケ', 'イカオイイウ', 'ウイアウウア', 'エカウエイオウケエ'];
const ranges = [[39,45], [46,51], [52,58], [59,62], [63,71]];
const uniqueOptions = [34,25,30,18,65];
const optionReferences = [34,57,30,28,65];
const letters = 'アイウエオカキクケコ';

const text = (block: Block) => {
  if (block.type === 'paragraph' || block.type === 'code') return block.text;
  if (block.type === 'diagram') return block.alt;
  return '';
};
function options(body: GeneratedBody, field: string) {
  const part = body.answerParts!.find(part => part.id === 'part-' + field);
  assert.ok(part && part.choiceIds);
  const choices = part.choiceIds.map(id => body.choices[Number(id.split('-').at(-1)) - 1].map(text).join('\n'));
  const answer = body.partAnswers!.find(answer => answer.kind === 'choice' && answer.partId === part.id);
  assert.ok(answer?.kind === 'choice');
  return { choices, answer: part.choiceIds.indexOf(answer.choiceId) };
}
function selects(body: GeneratedBody, field: string, check: (candidate: string, index: number) => boolean) {
  const { choices, answer } = options(body, field);
  const correct = choices.flatMap((choice, index) => {
    try { return check(choice, index) ? [index] : []; }
    catch { return []; }
  });
  assert.deepEqual(correct, [answer], `field ${field}\n${choices.join('\n')}`);
}
function panel(body: GeneratedBody, suffix: string) {
  const figure = body.prompt.find(block => block.type === 'diagram' && block.id.endsWith('-' + suffix));
  assert.ok(figure?.type === 'diagram', suffix);
  return figure.alt;
}
const prompt = (body: GeneratedBody) => body.prompt.map(text).join('\n');

for (const [i, { definition, originalPageAlt }] of drafts.entries()) {
  test(`問${i + 9}は全頁・欄・解答群を保持し，各入力を再現する`, () => {
    const [first, last] = ranges[i];
    const pages = originalPageAlt();
    assert.deepEqual(Object.keys(pages).map(Number), Array.from({ length: last - first + 1 }, (_, n) => first + n));
    assert.ok(Object.values(pages).every(alt => alt.length > 100 && alt.length <= 2000));
    const originals = definition.build([0]);
    assert.equal(originals.answerParts!.map(part => letters[options(originals, part.id.slice(5)).answer]).join(''), official[i]);
    for (const bad of [[], [0, 1], [-1], [4], [0.5], [NaN], [Infinity]]) assert.throws(() => definition.build(bad));
    const variations = [0,1,2,3].map(index => definition.build([index]));
    assert.equal(new Set(variations.map(prompt)).size, 4);
    for (const [index, body] of variations.entries()) {
      assert.deepEqual(body, definition.build([index]));
      assert.equal(body.choices.length, uniqueOptions[i]);
      assert.equal(body.answerParts!.flatMap(part => part.choiceIds!).length, optionReferences[i]);
      assert.equal(body.answerParts!.length, official[i].length);
      assert.ok(body.explanation.length > 140);
    }
  });
}

for (const input of [0,1,2,3]) {
  test(`問9の車体番号・次着車・累積待ち時間・遅延を全択検算（${input}）`, () => {
    const body = drafts[0].definition.build([input]);
    const wording = prompt(body);
    const constants = /#define STPNUM (\d+)[^\n]*\n[^\n]*#define BUSNUM\s+(\d+)/.exec(wording);
    assert.ok(constants);
    const n = Number(constants[1]), vehicleCount = Number(constants[2]);
    const first = 2 + input, last = n - 1;
    const route = panel(body, 'route');
    assert.match(route, new RegExp('バス停0、1、…、' + (last - 1) + '、' + last));
    assert.match(wording, new RegExp(vehicleCount + '台のバス.*' + n + 'か所の停留所'));
    const positioning = /busstop＝(\d+)、preceding＝(\d+)、succeeding＝(\d+)/.exec(panel(body, 'position-example'));
    assert.ok(positioning);
    const [, departure, ahead, behind] = positioning.map(Number);
    assert.ok(behind < departure && departure < ahead && ahead <= last);
    const ids = [27, 81, 93];
    const positions = [behind, departure, ahead];
    const testedA = [
      (id: number, j: number) => id === ids[j], (id: number, j: number) => id !== ids[j],
      (id: number, j: number) => id === j, (id: number, j: number) => id !== j,
    ];
    selects(body, 'a', (choice, i) => ['bus_id == bus[j].id', 'bus_id != bus[j].id', 'bus_id == j', 'bus_id != j'][i] === choice
      && ids.every((id, match) => ids.every((_, j) => testedA[i](id, j) === (match === j))));
    const testedB = [() => -1, () => departure, (j: number) => positions[j], (j: number) => positions[j] + 1, (j: number) => positions[j] - 1, (j: number) => j];
    selects(body, 'b', (choice, i) => ['-1','busstop','bus[j].cur_pos','bus[j].cur_pos + 1','bus[j].cur_pos - 1','j'][i] === choice
      && [0,2].every(j => testedB[i](j) === positions[j]));
    const allowed = [[last, -1], [ahead, behind], [last, 0], [ahead, -1]];
    const cSignatures = ['preceding == -1','preceding == STPNUM - 1','preceding != -1','succeeding == -1','succeeding == 0','succeeding != 0'];
    selects(body, 'c', (choice, i) => cSignatures[i] === choice && allowed.every(([preceding,succeeding]) =>
      [preceding === -1, preceding === last, preceding !== -1, succeeding === -1, succeeding === 0, succeeding !== 0][i] === (succeeding < 0)));
    const times = Array.from({ length: n }, (_, i) => i ? 2 + (i + input) % 6 : 0);
    const wait = times.slice(first, first + 3).reduce((sum, elapsed) => sum + elapsed, 0);
    const prevWait = times[first] + times[first + 1], step = times[first + 2], prevStep = times[first + 1];
    const dSignatures = ['+= route[i - 1].std_time','+= route[i - 1].wait_time','+= route[i].std_time','= route[i - 1].std_time','= route[i - 1].wait_time','= route[i].std_time'];
    selects(body, 'd', (choice, i) => dSignatures[i] === choice
      && [step+prevStep,step+prevWait,step+step,prevStep,prevWait,step][i] === wait);
    const elapsed = [6, 7, 8], planned = [3, 5, 7], previous = elapsed[0] + elapsed[1] - planned[0] - planned[1], stored = 9, foreign = 11;
    const expected = elapsed.reduce((sum,v) => sum + v, 0) - planned.reduce((sum,v) => sum + v, 0);
    const eSignatures = ['= act_time - route[busstop].std_time','= bus[j - 1].cur_delay','= route[busstop].delay_time','+= act_time - route[busstop].std_time','+= bus[j - 1].cur_delay','+= route[busstop].delay_time'];
    selects(body, 'e', (choice, i) => eSignatures[i] === choice
      && [1,foreign,stored,previous+1,previous+foreign,previous+stored][i] === expected);
    const fSignatures = ['= act_time','= bus[j].cur_delay','= route[busstop].delay_time','+= act_time','+= bus[j].cur_delay','+= route[busstop].delay_time'];
    selects(body, 'f', (choice, i) => fSignatures[i] === choice && [4,6,9].every(delay => [elapsed[2],delay,stored,4+elapsed[2],4+delay,4+stored][i] === delay));
  });

  test(`問10の集計・降順同数・割引の全区間を全択検算（${input}）`, () => {
    const body = drafts[1].definition.build([input]);
    const wording = prompt(body);
    const n = Number(/台数の多い順に(\d+)区間まで/.exec(wording)![1]);
    const abcs = options(body, 'a').choices;
    assert.deepEqual(abcs, options(body, 'b').choices);
    assert.deepEqual(abcs, options(body, 'c').choices);
    const records = [[1,6,100], [1,6,500], [6,1,1300], [5,3,700], [5,4,400]];
    const byExit = Array.from({ length: 10 }, (_, i) => records.filter(([,out]) => out === i + 1).reduce((sum, record) => sum + record[2], 0));
    const expectedTotal = records.reduce((sum, [, , value]) => sum + value, 0);
    const parseAction = (choice: string) => /^(ADD|MOVE) (.+) TO (.+)$/.exec(choice)!.slice(1);
    const counts = new Map<string, number>();
    for (const [from,to] of records) counts.set(`${from}:${to}`, (counts.get(`${from}:${to}`) ?? 0) + 1);
    selects(body, 'a', choice => {
      const [action, value, destination] = parseAction(choice);
      const updates = new Map<string, number>();
      if (action !== 'ADD' || destination !== 'SECT-NUM(SAL-IN SAL-OUT)' || !/^\d+$/.test(value)) return false;
      for (const [from,to] of records) updates.set(`${from}:${to}`, (updates.get(`${from}:${to}`) ?? 0) + Number(value));
      return updates.size === counts.size && [...counts].every(([key, count]) => updates.get(key) === count);
    });
    selects(body, 'b', choice => {
      const [action, source, destination] = parseAction(choice);
      return action === 'ADD' && destination === 'TOTAL'
        && byExit.reduce((sum, value) => sum + (source === 'IC-TOTAL(CNT1)' ? value : 0), 0) === expectedTotal;
    });
    selects(body, 'c', choice => {
      const [action, source, destination] = parseAction(choice);
      return action === 'MOVE' && destination === 'SORT-DATA' && [...counts].every(([key, count]) => {
        const from = Number(key.split(':')[0]);
        return (source === 'SECT-NUM(CNT1 CNT2)' ? counts.get(key) : byExit[from - 1]) === count;
      });
    });
    const lists = [[...Array(n - 1).fill(24), 18, 18, 17, 10, 0], [...Array(n).fill(30), 29, 0], [7, 5, 0, 0]];
    selects(body, 'd', choice => lists.every(values => {
      const spec = /^CNT1 > (\d+) AND (?:SORT-DATA (<|<=|>=) PREV-NUM|PREV-NUM <= (\d+))$/.exec(choice);
      const kept: number[] = [];
      for (const [i, count] of values.entries()) {
        const previous = kept.at(-1) ?? 0;
        const qualifies = spec && i + 1 > Number(spec[1]);
        const compare = spec?.[2] === '<' ? count < previous : spec?.[2] === '<=' ? count <= previous
          : spec?.[2] === '>=' ? count >= previous : previous <= Number(spec?.[3]);
        if (!count || (qualifies && compare)) break;
        kept.push(count);
      }
      const answer = values.filter(value => value > 0 && (values.length < n || value >= values[n - 1]));
      return kept.join(',') === answer.join(',');
    }));
    const lines = wording.split('\n');
    selects(body, 'e', choice => {
      const line = Number(/行番号(\d+)と/.exec(choice)![1]);
      const location = lines.findIndex(row => row.startsWith(line + ' '));
      const section = lines.slice(0, location + 1).reverse().find(row => /^(\d+)\s+\w+-PROC SECTION\./.test(row));
      return section?.includes('CNT-PROC') ?? false;
    });
    const expectedX = /プランX：(\d+)区間以上利用した場合は(\d+)％/.exec(wording)!.slice(1).map(Number);
    const expectedY = /プランY：(\d+)〜(\d+)区間利用した場合は(\d+)％，(\d+)区間以上利用した場合は(\d+)％/.exec(wording)!.slice(1).map(Number);
    const groups = ['f','g','h'].map(field => options(body, field));
    const rates = [...panel(body, 'program-change').matchAll(/MOVE (\d\.\d) TO DISCOUNT-/g)].map(match => Number(match[1]));
    assert.equal(rates.length, 6);
    const interval = (option: string, length: number) => {
      const [low, high = low] = option.split(' THRU ').map(Number);
      return low <= length && length <= high;
    };
    const candidates: number[][] = [];
    for (const [f, optionF] of groups[0].choices.entries()) for (const [g, optionG] of groups[1].choices.entries()) for (const [h, optionH] of groups[2].choices.entries()) {
      const valid = Array.from({ length: 9 }, (_, i) => i + 1).every(length => {
        const branch = [optionF,optionG,optionH].findIndex(option => interval(option, length));
        const actual = branch < 0 ? [1,1] : branch === 0 ? rates.slice(0,2) : branch === 1 ? rates.slice(2,4) : [rates[4],rates[4]];
        const expected = [1 - (length >= expectedX[0] ? expectedX[1] : 0)/100,
          1 - (length >= expectedY[3] ? expectedY[4] : length >= expectedY[0] && length <= expectedY[1] ? expectedY[2] : 0)/100];
        return actual.every((value, i) => value === expected[i]);
      });
      if (valid) candidates.push([f,g,h]);
    }
    assert.deepEqual(candidates, [groups.map(group => group.answer)]);
  });

  test(`問11のキュー状態・型・排他を全択検算（${input}）`, () => {
    const body = drafts[2].definition.build([input]);
    const limit = Number(/MAX_SIZE = (\d+)/.exec(prompt(body))![1]);
    const aValues = ['!queue.isEmpty()', 'queue.isEmpty()', 'queue.size() != MAX_SIZE', 'queue.size() < MAX_SIZE', 'queue.size() == MAX_SIZE'];
    selects(body, 'a', (choice, i) => aValues[i] === choice && Array.from({ length: limit + 1 }, (_, count) => count).every(count =>
      [count > 0, count === 0, count !== limit, count < limit, count === limit][i] === (count === 0)));
    const sessions = new Map<string, string>([['session1','山田'], ['session2','佐藤']]);
    selects(body, 'b', choice => {
      const match = /^sessionsTable.get\((message|server|session)\)$/.exec(choice);
      return !!match && [...sessions.keys()].every(key => sessions.get(match[1] === 'session' ? key : match[1]) === sessions.get(key));
    });
    selects(body, 'c', choice => {
      const env: Record<string,string> = { this: 'session2', queue: 'MessageQueue', server: 'ConfServer', sessionsTable: 'Map' };
      const state = new Map(sessions);
      state.delete(env[choice]);
      return state.size === 1 && state.has('session1');
    });
    assert.deepEqual(options(body, 'd').choices, ['abstract','extends','implements','static','throws']);
    selects(body, 'd', choice => choice === 'extends' && /abstract class ConfClient/.test(prompt(body)));
    assert.deepEqual(options(body, 'e').choices, ['super()','super(name)','super(this)','this()','this(name)']);
    selects(body, 'e', choice => choice === 'super(name)' && /public ConfClient\(String name\)/.test(prompt(body)));
    const reasons = options(body, '2').choices;
    assert.match(reasons[0], /負荷がかかりすぎる/);
    assert.match(reasons[1], /セキュリティ上問題/);
    assert.match(reasons[2], /内部状態に矛盾が起きない/);
    assert.match(reasons[3], /インスタンスの個数を制限/);
    selects(body, '2', choice => /操作が同時に実行.*内部状態に矛盾が起きない/.test(choice));
  });

  test(`問12の16ビット反転・交換・部分列を全択検算（${input}）`, () => {
    const body = drafts[3].definition.build([input]);
    const banks = Object.fromEntries([...'abcdef'].map(field => [field, options(body, field)]));
    const key = (field: string) => banks[field].choices[banks[field].answer];
    const alt = panel(body, 'reverse-word');
    const [before, after] = [...alt.matchAll(/実行[前後]：([01 ]+)/g)].map(match => Number.parseInt(match[1].replaceAll(' ', ''), 2));
    assert.equal(reversedBits(before), after);
    const wordSamples = input === 0 ? Array.from({ length: 65536 }, (_, value) => value) : [0, 1, 2, 3, 0x8000, 0x8001, 0xFFFF, before];
    selects(body, 'a', choice => wordSamples.every(word => runWord(word, choice, key('b')) === reversedBits(word)));
    selects(body, 'b', choice => wordSamples.every(word => runWord(word, key('a'), choice) === reversedBits(word)));
    const sequences = [[0x1000], [0x0060,0x0201], [0,1,2], [2,0xFFF0,0x5F00,6], [0,65535,80,0,7], [before,0x81,0x0900,17,0,0x1000]];
    const reversed = (words: readonly number[]) => [...words].reverse().map(word => reversedBits(word)).join(',');
    selects(body, 'c', choice => sequences.every(words => runWords(words, choice, key('d'))?.join(',') === reversed(words)));
    selects(body, 'd', choice => sequences.every(words => runWords(words, key('c'), choice)?.join(',') === reversed(words)));
    const spans = Array.from({ length: 15 }, (_, p) => Array.from({ length: 15-p }, (_, q) => [p, q+2])).flat();
    const checkPart = (e: string, f: string) => spans.every(([p,q]) => [0, 1, 2, 0x8000, 0xAA55, 0xFFFF, before].every(word =>
      runPart(word, p, q, e, f) === reversedBits(word, p, q)));
    selects(body, 'e', choice => checkPart(choice, key('f')));
    selects(body, 'f', choice => checkPart(key('e'), choice));
    assert.doesNotMatch(prompt(body), /JIS X 0201|8ビット符号表/);
  });

  test(`問13の9欄を全選択肢と全複写位置で検算（${input}）`, () => {
    const body = drafts[4].definition.build([input]);
    const elasticity = sheetFromAlt(panel(body, 'elasticity-sheet'));
    const proposal = sheetFromAlt(panel(body, 'proposal-sheet'));
    const advertising = sheetFromAlt(panel(body, 'advertising-sheet'));
    const sheet = { 価格弾力性分析: elasticity, 値上: proposal, 広告: advertising };
    const numeric = (x: unknown) => { assert.equal(typeof x, 'number'); return x as number; };
    const equal = (actual: unknown, expected: number) => typeof actual === 'number' && Math.abs(actual - expected) < 1e-8;
    for (const field of ['a','b','c']) selects(body, field, choice =>
      [0,1].every(dx => Array.from({ length: 9 }, (_, dy) => dy).every(dy => {
        const brand = dx+1;
        const p1 = numeric(elasticity[1][brand]), q1 = numeric(elasticity[2][brand]);
        const p2 = numeric(elasticity[6+dy][0]), q2 = numeric(elasticity[6+dy][brand]);
        const actual = evaluate(choice, sheet, '価格弾力性分析', dx, dy);
        if (field === 'a') return actual === (p2 === p1);
        return equal(actual, field === 'b' ? 1-q2/q1 : p2/p1-1);
      })));
    selects(body, 'd', choice => Array.from({ length: 8 }, (_, dx) => dx).every(dx => [0,1].every(dy => {
      const desired = proposal[9][dx+1];
      const caseIndex = Number(String(desired).slice(1)) - 1;
      return equal(evaluate(`垂直照合(${choice})`, sheet, '値上', dx, dy), numeric(proposal[caseIndex+1][dy+5]));
    })));
    const calculations = [
      { field: 'e', first: 0, expected: (col: number) => numeric(proposal[3][1])*numeric(proposal[12][col]) },
      { field: 'f', first: 4, expected: (col: number) => (numeric(proposal[5][2])*numeric(proposal[10][col])+numeric(proposal[6][2]))*numeric(proposal[13][col]) },
      { field: 'g', first: 0, expected: (col: number) => numeric(proposal[14][col])*(1-numeric(proposal[7][1]))-numeric(proposal[15][col])-numeric(proposal[4][1]) },
    ];
    for (const { field, first, expected } of calculations) selects(body, field, choice =>
      Array.from({ length: 4 }, (_, i) => first + i).every(dx => equal(evaluate(choice, sheet, '値上', dx, 0), expected(dx+1))));
    selects(body, 'h', choice => [0,1].every(brand => [0,1,2,3].every(which => {
      const ad = advertising.map(row => [...row]);
      ad[0][1] = brand ? '高級品' : '普及品';
      ad[1][1] = '案'+(which+1);
      return Array.from({ length: 6 }, (_, dx) => dx).every(dx => equal(evaluate(choice, { ...sheet, 広告: ad }, '広告', dx, 0),
        numeric(proposal[12][1+brand*4+which])*(1+numeric(ad[3][dx+1]))));
    })));
    selects(body, 'i', choice => [0,1,2,3].every(which => {
      const ad = advertising.map(row => [...row]);
      ad[0][1] = '普及品';
      ad[1][1] = '案'+(which+1);
      return Array.from({ length: 6 }, (_, dx) => dx).every(dx => equal(evaluate(choice, { ...sheet, 広告: ad }, '広告', dx, 0),
        (numeric(proposal[5][1])*numeric(proposal[10][which+1])+numeric(proposal[6][1]))*numeric(ad[5][dx+1])));
    }));
    const brand = advertising[0][1] === '普及品' ? 0 : 1;
    const selected = Number(String(advertising[1][1]).slice(1)) - 1;
    const col = 1+brand*4+selected, base = brand+1;
    advertising[3].slice(1).forEach((rate, i) => {
      const interestPercent = Math.round(100 * numeric(proposal[12][col]) * (1+numeric(rate)));
      const quantity = numeric(proposal[3][base])*numeric(proposal[12][col])*(1+numeric(rate));
      const cents = numeric(proposal[11][col]);
      const sales = cents*quantity;
      const variable = (numeric(proposal[5][base])*numeric(proposal[10][col])+numeric(proposal[6][base]))*quantity;
      const profit = sales-variable-numeric(proposal[4][base])-numeric(proposal[7][base])*sales-numeric(advertising[2][i+1]);
      assert.equal(Math.round(100*numeric(advertising[4][i+1])), interestPercent);
      assert.equal(numeric(advertising[5][i+1]), Math.round(quantity*1000)/1000);
      assert.equal(numeric(advertising[6][i+1]), Math.round(sales));
      assert.equal(numeric(advertising[7][i+1]), Math.round(variable));
      assert.equal(numeric(advertising[8][i+1]), Math.round(profit));
    });
  });
}

test('全図の名称・説明・色変数・表とコード枠のSSR表示を確認', () => {
  assert.equal(figures.length, 22);
  assert.deepEqual(figures.map(item => item.profile).sort(), renderers.map(item => item.profile).sort());
  for (const figure of figures) {
    const { component } = renderers.find(entry => entry.profile === figure.profile)!;
    for (let state = 0; state < 4; state++) {
      const html = renderToStaticMarkup(createElement(component, { caption: '資料', values: [state] }));
      assert.match(html, /class="diagram-scroll"/);
      assert.ok(html.includes(figure.profile));
      if (/<svg/.test(html)) {
        const title = /<title id="([^"]+)">資料<\/title>/.exec(html);
        const desc = /<desc id="([^"]+)">/.exec(html);
        assert.ok(title && desc);
        assert.ok(html.includes('aria-labelledby="' + title[1] + '"'));
        assert.ok(html.includes('aria-describedby="' + desc[1] + '"'));
      } else assert.match(html, /aria-description="[^"]+/);
    }
  }
});

test('問13の基準ワークシートの表示値を原冊子p64・66・69と照合', () => {
  const body = drafts[4].definition.build([0]);
  const elastic = sheetFromAlt(panel(body, 'elasticity-sheet'));
  assert.deepEqual(elastic.slice(6).map(row => row.slice(3)), [
    [1.20, -.13], [1.20, .27], ['−', .67], [1.20, .80], [1.32, '−'], [1.28, .27], [1.26, .67], [1.10, .89], [1.00, .80],
  ]);
  const proposal = sheetFromAlt(panel(body, 'proposal-sheet'));
  assert.deepEqual(proposal.slice(10).map(row => row.slice(1)), [
    [600,700,600,500,500,600,500,400],
    [600,800,700,600,800,1000,900,800],
    [.25,.15,.20,.24,.30,.33,.29,.27],
    [120,72,96,115.2,27,29.7,26.1,24.3],
    [72000,57600,67200,69120,21600,29700,23490,19440],
    [30000,20520,24000,24768,9450,12177,9135,7047],
    [19800,16320,21480,22440,830,4583,2657,1505],
  ]);
  const advertising = sheetFromAlt(panel(body, 'advertising-sheet'));
  assert.deepEqual(advertising.slice(4).map(row => row.slice(1)), [
    [.34,.35,.36,.37,.38,.40],
    [30.591,31.185,32.670,33.561,34.452,35.640],
    [30591,31185,32670,33561,34452,35640],
    [12542,12786,13395,13760,14125,14612],
    [4780,4862,5241,5089,4936,4900],
  ]);
});
