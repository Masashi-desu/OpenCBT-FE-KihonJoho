import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { legacy2009AutumnPm09To13Definitions } from '../../../src/core/generators/legacy-2009-autumn-pm-09-13';
import { legacy2009AutumnPm0913Figures } from '../../../src/core/generators/legacy-2009-autumn-pm-09-13-figures';
import { legacy2009AutumnPm0913FigureRenderers } from '../../../src/ui/Legacy2009AutumnPm0913Figures';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { auditShiftSheets } from '../../fixtures/legacy-2009-autumn-pm-13-oracle';

const officialKeys = ['オウイエオイエ', 'キアウエウウオ', 'イアエエウエイカオ', 'ウエイウイキ', 'オイイウイキイキ'];
const kana = 'アイウエオカキクケコ';
const indices = [0, 1, 2, 3];
const getBody = (number: number, index: number) => legacy2009AutumnPm09To13Definitions[number - 9].build([index]);

function choiceText(body: GeneratedBody, id: string) {
  const choice = body.choices[Number(id.replace('choice-value-', '')) - 1][0];
  assert.ok(choice.type === 'code' || choice.type === 'paragraph');
  return choice.text;
}
function part(body: GeneratedBody, field: string) {
  const part = body.answerParts!.find(part => part.id === 'part-' + field);
  assert.ok(part);
  return part;
}
function selectedId(body: GeneratedBody, field: string) {
  const id = 'part-' + field;
  const entry = body.partAnswers!.find(answer => answer.kind === 'unordered' ? answer.partIds.includes(id) : answer.partId === id);
  assert.ok(entry?.kind === 'choice' || entry?.kind === 'unordered');
  return entry.kind === 'choice' ? entry.choiceId : entry.choiceIds[entry.partIds.indexOf(id)];
}
function check(body: GeneratedBody, field: string, options: (option: string, index: number) => boolean) {
  const matches = part(body, field).choiceIds.filter((id, i) => options(choiceText(body, id), i));
  assert.equal(matches.length, 1, field + 'に適合する候補は一つ');
  assert.equal(selectedId(body, field), matches[0]);
}
const text = (body: GeneratedBody) => body.prompt.flatMap(block => 'text' in block ? [block.text] : []).join('\n');
function figure(body: GeneratedBody, profileEnd: string) {
  const block = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith(profileEnd));
  assert.equal(block?.type, 'diagram');
  if (block?.type !== 'diagram') assert.fail('Missing reviewed figure');
  return block.alt;
}
function keyString(body: GeneratedBody) {
  return body.answerParts!.map(part => kana[part.choiceIds.indexOf(selectedId(body, part.id.slice(5)))]).join('');
}

test('問9〜13の公式正答37欄、元の本文形式、独立する共有解答群を維持する', () => {
  assert.equal(legacy2009AutumnPm09To13Definitions.length, 5);
  for (const [i, definition] of legacy2009AutumnPm09To13Definitions.entries()) {
    assert.equal(definition.source, '2009h21a-fe-pm-' + (i + 9));
    const reference = definition.build(definition.reference);
    assert.equal(keyString(reference), officialKeys[i]);
    assert.throws(() => definition.build([-1]));
    assert.throws(() => definition.build([4]));
    assert.throws(() => definition.build([1.5]));
    assert.throws(() => definition.build([1, 2]));
    assert.throws(() => definition.build([]));
    const stems = new Set<string>();
    for (const index of indices) {
      const body = definition.build([index]);
      assert.deepEqual(body.prompt.map(block => block.type), reference.prompt.map(block => block.type));
      assert.deepEqual(body.answerParts, reference.answerParts);
      assert.deepEqual(body.contexts, reference.contexts);
      stems.add(JSON.stringify(body.prompt));
      assert.ok(body.explanation.length >= 100);
      for (const part of body.answerParts!) {
        const choices = part.choiceIds.map(id => choiceText(body, id));
        assert.equal(choices.length, new Set(choices).size, '候補は同じ表示内容を重複させない');
        assert.ok(part.choiceIds.includes(selectedId(body, part.id.slice(5))));
      }
      const unordered = body.partAnswers!.filter(answer => answer.kind === 'unordered');
      const fields = i === 3 ? ['part-e', 'part-f'] : i === 4 ? ['part-g', 'part-h'] : undefined;
      assert.equal(unordered.length, fields ? 1 : 0);
      if (fields) {
        assert.deepEqual(unordered[0].partIds, fields);
        assert.equal(unordered[0].presentation, undefined);
        assert.equal(new Set(unordered[0].choiceIds).size, 2);
      }
    }
    assert.equal(stems.size, 4, '解答前に読める条件を4通り用意する');
  }
});

function digitTrace(left: string, right: string) {
  const columns = Math.max(left.length, right.length);
  const sum: string[] = [];
  let carry = 0, groupCarries = 0;
  for (let digit = 1; digit <= columns; digit++) {
    const value = Number(left.at(-digit) ?? 0) + Number(right.at(-digit) ?? 0) + carry;
    carry = Math.floor(value / 10);
    sum.unshift(String(value % 10));
    if (digit % 9 === 0) groupCarries += carry;
  }
  if (carry) sum.unshift(String(carry));
  assert.equal(BigInt(sum.join('')), BigInt(left) + BigInt(right));
  return { groups: Math.ceil(columns / 9), groupCarries };
}
test('問9 C：十進一けたずつの加算からα・βの実行回数を検算する', () => {
  for (const index of indices) {
    const body = getBody(9, index);
    const panel = figure(body, 'addition-pairs').split('\n\n');
    assert.equal(panel.length, 2);
    const [first, second] = panel.map(pair => {
      const terms = pair.split('\n').map(row => row.split('｜').slice(1).join(''));
      assert.ok(terms.length === 2 && terms.every(term => /^\d{18,54}$/.test(term)));
      return digitTrace(terms[0], terms[1]);
    });
    check(body, 'e', option => Number(option) === first.groups);
    check(body, 'f', option => Number(option) === first.groupCarries);
    check(body, 'g', option => Number(option) === second.groupCarries);
    const example = figure(body, 'decimal-chunks').split('\n').filter(Boolean).map(row => row.split('｜').slice(1));
    const input = /例えば，(\d+)という整数/.exec(text(body))?.[1];
    assert.equal(example[0].join(''), input);
    assert.deepEqual(example[2], example[0].map(group => String(Number(group))));
    assert.deepEqual(example[1], example[0].map((_, i) => String(example[0].length - i - 1)));
    assert.match(body.explanation, new RegExp('αは長い方の要素数と同じ' + first.groups + '回'));
    const allowed = (state: number, operation: number) => [state !== 0, state < 0, state <= 0, state > 0, state >= 0][operation];
    check(body, 'a', (option, i) => {
      assert.equal(option, ['str_idx != 0', 'str_idx < 0', 'str_idx <= 0', 'str_idx > 0', 'str_idx >= 0'][i]);
      return [-1, 0, 1, 53].every(state => allowed(state, i) === (state >= 0));
    });
    check(body, 'b', (option, i) => {
      const predicates = [
        (short: boolean) => short, (short: boolean, remaining: number) => short && remaining <= 0,
        (short: boolean, remaining: number) => short && remaining >= 0,
        (short: boolean, remaining: number) => short || remaining <= 0,
        (short: boolean, remaining: number) => short || remaining >= 0,
      ];
      assert.match(option, /i < NUM_DIGIT/);
      return [false, true].every(short => [-1, 0, 1].every(remaining =>
        predicates[i](short, remaining) === (short && remaining >= 0)));
    });
    check(body, 'c', option => [1, 10, 100000000].every(weight => {
      const result: Record<string, number> = { '%': weight % 10, '*': weight * 10, '+': weight + 10, '-': weight - 10, '/': Math.trunc(weight / 10) };
      return result[option[0]] === weight * 10;
    }));
    check(body, 'd', (option, i) => {
      assert.match(option, /i = .*num->length/);
      return [1, 2, 4, 6].every(length => {
        const next = Array.from({ length: length - Number(i % 2 === 1) }, (_, n) => i < 2 ? n : length - 1 - (i % 2) - n);
        return JSON.stringify(next) === JSON.stringify(Array.from({ length: length - 1 }, (_, n) => length - 2 - n));
      });
    });
  }
});

const months = [
  { prior: [23720000, 10310000, 28410000, 18540000, 10550000], order: 'CADBE' },
  { prior: [25000000, 16000000, 30000000, 10000000, 20000000], order: 'DBEAC' },
  { prior: [0, 26000000, 10000000, 25100000, 15900000], order: 'ABCDE' },
  { prior: [0, 0, 0, 0, 0], order: 'EDCBA' },
];
const runInstruction = (instruction: string, registers: Readonly<Record<string, number>>) => {
  const parsed = /^(MOVE|ADD) (\S+) TO (\S+)$/.exec(instruction);
  assert.ok(parsed);
  const [, command, from, to] = parsed;
  const value = registers[from];
  return { ...registers, [to]: command === 'ADD' ? (registers[to] ?? 0) + value : value };
};
test('問10 COBOL：レコード処理・SORTの全候補と表示例の対前年同月比', () => {
  for (const index of indices) {
    const body = getBody(10, index);
    const program = text(body);
    const numberedLines = [...program.matchAll(/^ *(\d+) {2,}(?=\S)/gm)].map(match => Number(match[1]));
    assert.deepEqual(numberedLines, Array.from({ length: 80 }, (_, i) => i + 1));
    const current = new Map<string, number>();
    const before = figure(body, 'monthly-output').split('\n');
    for (const line of before.slice(0, 5)) {
      const [, branch, sale] = /^([A-E])-BRANCH\s+([\d,]+)$/.exec(line)!;
      current.set(branch, Number(sale.replaceAll(',', '')));
    }
    const total = [...current.values()].reduce((sum, value) => sum + value, 0);
    assert.equal([...current.keys()].join(''), months[index].order);
    assert.equal(Number(before.at(-1)!.replace(/[^0-9]/g, '')), total);
    const prev = months[index].prior;
    const totalPrevious = prev.reduce((sum, value) => sum + value, 0);
    const ratios = figure(body, 'comparative-output').split('\n').filter(line => /\(/.test(line));
    for (const [i, row] of ratios.entries()) {
      const [_, label, shown] = /^([A-E]-BRANCH|TOTAL)\s+[\d,]+\s+\(\s*([\d-]+)\s*%\)$/.exec(row)!;
      assert.equal(label, i === 5 ? 'TOTAL' : months[index].order[i] + '-BRANCH');
      const previous = label === 'TOTAL' ? totalPrevious : prev[label.charCodeAt(0) - 65];
      const sale = label === 'TOTAL' ? total : current.get(label[0])!;
      assert.equal(shown, previous === 0 ? '-' : String(BigInt(sale) * 100n / BigInt(previous)));
    }
    assert.equal(ratios.length, 6);
    const registers = { 'MAST-YYYYMM': 0, 'SALES-YYYYMM': 200911, 'SALES-BR': 4, 'SALES-AMOUNT': 927,
      'MAST-AMOUNT(CNT)': 50638, 'MAST-TOTAL': 34120, 'SORT-BR': 2, 'SORT-AMOUNT': 1200,
      'THIS-TOTAL': 0, 'W-MAST': 173, 'MAST-REC': 414 };
    check(body, 'a', candidate => runInstruction(candidate, registers)['MAST-YYYYMM'] === 200911);
    check(body, 'b', candidate => runInstruction(candidate, registers)['MAST-TOTAL'] === 84758);
    check(body, 'd', candidate => runInstruction(candidate, registers)['SORT-AMOUNT'] === 50638);
    check(body, 'e', candidate => runInstruction(candidate, registers)['THIS-TOTAL'] === 34120);
    check(body, 'c', candidate => {
      const match = /^(ASCENDING|DESCENDING) KEY SORT-(AMOUNT|BR)$/.exec(candidate);
      assert.ok(match);
      const order = [...current.keys()].sort((a, b) => {
        const base = match[2] === 'BR' ? a.localeCompare(b) : current.get(a)! - current.get(b)!;
        return match[1] === 'ASCENDING' ? base : -base;
      });
      return order.join('') === months[index].order;
    });
    const ratioRegisters: Readonly<Record<string, number>> = {
      'MAST-AMOUNT(SORT-BR)': 140, 'SORT-AMOUNT': 250, 'MAST-TOTAL': 850, 'THIS-TOTAL': 610,
    };
    const ratio = (candidate: string) => {
      const match = /^COMPUTE RATIO = (\S+) \* 100 \/ (\S+)$/.exec(candidate);
      assert.ok(match);
      return BigInt(ratioRegisters[match[1]]) * 100n / BigInt(ratioRegisters[match[2]]);
    };
    check(body, 'f', candidate => ratio(candidate) === 178n);
    check(body, 'g', candidate => ratio(candidate) === 71n);
    assert.match(figure(body, 'program-changes'), /KEY-YYYYMM = MAST-YYYYMM - 100[\s\S]*INVALID KEY     INITIALIZE W-MAST/);
  }
});

const yen = (value: string) => Number(value.replaceAll(',', ''));
function independentlyRoundPackets(packets: number) {
  return Math.floor(packets / 100) + (packets % 100 === 0 ? 0 : 1);
}
test('問11 Java：通話、切上げ、最小値探索、継承、S2上限を別計算で照合する', () => {
  for (const index of indices) {
    const body = getBody(11, index);
    const program = text(body);
    const plans = [...program.matchAll(/new CallingPlan\("([AB])", (\d+), (\d+), (\d+)\)/g)].map(match => ({
      name: match[1], fee: +match[2], free: +match[3], unit: +match[4],
    }));
    assert.equal(plans.length, 2);
    const measured = Number(/new Measured\((\d+)\)/.exec(program)?.[1]);
    const s1 = /new Tiered\("S1", (\d+), (\d+), (\d+)\)/.exec(program);
    assert.ok(s1);
    const [fee, allowance, rate] = s1.slice(1).map(Number);
    const usageRows = figure(body, 'usage-test').split('\n').slice(1).map(row => row.split('｜').map(yen));
    const logs = figure(body, 'recommendation-output').split('\n');
    assert.equal(logs.length, 4);
    const planTable = figure(body, 'phone-plans');
    assert.ok(planTable.includes('単位') || planTable.includes('基本料金'));
    for (const [i, [minutes, packets]] of usageRows.entries()) {
      const list = plans.flatMap(({ name, fee: base, free, unit }) => {
        const fullMinutes = Math.floor(free / unit);
        const allowanceRemainder = free % unit;
        const chargedMinutes = Math.max(minutes - fullMinutes, 0);
        const call = base + (chargedMinutes === 0 ? 0 : unit * chargedMinutes - allowanceRemainder);
        return [
          { name, total: call + measured * independentlyRoundPackets(packets) },
          { name: name + ' S1', total: call + fee + (packets <= allowance ? 0 : rate * independentlyRoundPackets(packets - allowance)) },
        ];
      }).reverse().sort((left, right) => left.total - right.total);
      const match = /minutes:\s+(\d+), packets:\s+(\d+) => ([AB](?: S1)?)\s+\(\s*(\d+)\)/.exec(logs[i]);
      assert.deepEqual(match?.slice(1), [String(minutes), String(packets), list[0].name, String(list[0].total)]);
    }
    check(body, 'a', (candidate, i) => {
      assert.equal(candidate, ['callingRate * minutes', 'callingRate * minutes - included', 'included', 'included - callingRate * minutes'][i]);
      return plans.every(({ free, unit }) => [0, 1, 50, 250, 300].every(minutes =>
        Math.max(0, [unit * minutes, unit * minutes - free, free, free - unit * minutes][i]) === Math.max(unit * minutes - free, 0)));
    });
    check(body, 'b', (candidate, i) => {
      assert.equal(candidate, ['callingCharge < 0', 'callingCharge < included', 'callingCharge > 0', 'callingCharge > included'][i]);
      return [-101, 0, 1, 1200, 20000].every(value => {
        const clamp = [value < 0, value < 1000, value > 0, value > 1000][i];
        return (clamp ? 0 : value) === Math.max(value, 0);
      });
    });
    assert.match(program, /interface PacketPlan[\s\S]*class Measured ［c］[\s\S]*class Tiered ［c］/);
    check(body, 'c', option => option === 'implements PacketPlan');
    check(body, 'd', (option, i) => {
      assert.match(option, / \+ 99$/);
      return [allowance + 1, allowance + 100, allowance + 101, allowance * 2].every(packets =>
        Math.trunc([allowance + 99, packets + 99, packets + allowance + 99, packets - allowance + 99][i] / 100)
          === independentlyRoundPackets(packets - allowance));
    });
    check(body, 'e', option => option === 'Integer.MAX_VALUE');
    check(body, 'f', option => option === 'cellPhonePlan.calculateCharge(minutes, packets)');
    check(body, 'g', option => option === 'extends Tiered');
    check(body, 'h', option => option === 'super.calculateCharge(packets)');
    check(body, 'i', option => option === 'maxCharge');
    const cap = /サービス料金([\d,]+)円を支払うと，([\d,]+)パケットまで[\s\S]*?超えて([\d,]+)パケットまでは，100パケット当たり(\d+)円[\s\S]*?合計([\d,]+)円/.exec(figure(body, 'capped-discount'));
    assert.ok(cap);
    const [capFee, capFree, limit, capRate, max] = cap.slice(1).map(yen);
    assert.equal(max, capFee + independentlyRoundPackets(limit - capFree) * capRate);
    assert.match(body.explanation, new RegExp(max.toLocaleString('en-US') + '円'));
    assert.ok(capFee + independentlyRoundPackets(limit + 1 - capFree) * capRate > max);
    assert.ok(program.includes('if (charge > ［i］)\n         charge = maxCharge;'));
  }
});

test('問12 CASL II：ビット位置から値を再構成し、全命令の組合せを検算する', () => {
  const instructions = ['ADDL', 'AND', 'LD', 'OR', 'SLL', 'SRL', 'XOR'];
  function apply(instruction: string, to: number, from: number) {
    const byInstruction: Record<string, number> = { ADDL: (to + from) & 0xffff, AND: to & from, LD: from, OR: to | from, XOR: to ^ from };
    return byInstruction[instruction];
  }
  const correctPairs = instructions.flatMap(first => instructions.flatMap(second => {
    const valid = Array.from({ length: 16 }, (_, i) => i).every(word =>
      Array.from({ length: 16 }, (_, i) => i).every(mask => {
        const step = apply(first, mask, word);
        if (step === undefined) return false;
        const output = apply(second, word, step);
        const bits = [...word.toString(2).padStart(4, '0')].map((bit, i) =>
          [...mask.toString(2).padStart(4, '0')][i] === '1' ? '0' : bit);
        return output === Number.parseInt(bits.join(''), 2);
      }));
    return valid ? [first + ':' + second] : [];
  }));
  assert.deepEqual(correctPairs, ['AND:XOR', 'XOR:AND']);
  for (const index of indices) {
    const body = getBody(12, index);
    const match = /p：\s+(\d+)\nq：\s+(\d+)\nGR0： ([01]{16})/.exec(text(body));
    assert.ok(match);
    const [, p, q, initial] = match;
    const skip = Number(p) - Math.floor(Number(p) / 16) * 16;
    const remaining = 16 - skip;
    assert.match(initial.slice(Number(q)), /^0*$/);
    check(body, 'a', option => Number(option) === skip);
    check(body, 'b', option => Number(option) === remaining);
    const target1 = '0'.repeat(skip) + initial.slice(0, remaining);
    const target2 = initial.slice(remaining) + '0'.repeat(remaining);
    check(body, 'c', option => option === target1);
    check(body, 'd', option => option === target2);
    assert.equal(part(body, 'e').choiceIds.map(id => choiceText(body, id)).join(':'), instructions.join(':'));
    assert.deepEqual(part(body, 'e').choiceIds, part(body, 'f').choiceIds);
    const selected = [choiceText(body, selectedId(body, 'e')), choiceText(body, selectedId(body, 'f'))].join(':');
    assert.ok(correctPairs.includes(selected));
    for (const source of ['0'.repeat(32), '1'.repeat(32), '0101'.repeat(8), '1100'.repeat(8)]) {
      const logical = source.slice(0, skip) + initial.slice(0, Number(q)) + source.slice(skip + Number(q));
      const expectedFromWords = [target1, target2].map((value, word) =>
        [...source.slice(word * 16, word * 16 + 16)].map((before, bit) => {
          const position = word * 16 + bit;
          return position >= skip && position < skip + Number(q) ? value[bit] : before;
        }).join('')).join('');
      assert.equal(expectedFromWords, logical);
    }
    assert.match(body.explanation, new RegExp(target1 + '[\\s\\S]*' + target2));
    const assets = body.contexts?.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : []));
    assert.equal(assets?.length, 6);
    assert.ok(assets?.includes('asset-ipa-2009h21a-fe-pm-p068-casl-excerpt'));
    assert.ok(!assets?.includes('asset-ipa-2009h21a-fe-pm-p068'));
  }
});

test('問13 表計算：勤務時刻・欠勤・固定参照・順位と順不同欄を独立検算する', () => {
  for (const index of indices) {
    const body = getBody(13, index);
    auditShiftSheets({
      index, source: text(body), explanation: body.explanation,
      attendance: figure(body, 'attendance-sheet'), availability: figure(body, 'availability-sheet'),
      assigned: figure(body, 'assignment-sheet'), digits: figure(body, 'rank-digits'),
      getOptions: field => part(body, field).choiceIds.map(id => choiceText(body, id)),
      getSelected: field => choiceText(body, selectedId(body, field)),
    });
    assert.deepEqual(body.contexts?.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])),
      [72, 73, 74].map(page => 'asset-ipa-2009h21a-fe-pm-p0' + page));
  }
});

test('問9〜13の管理図19種・全76条件を描画し、表示と代替説明を維持する', () => {
  assert.deepEqual(legacy2009AutumnPm0913Figures.map(figure => figure.profile),
    legacy2009AutumnPm0913FigureRenderers.map(renderer => renderer.profile));
  assert.equal(legacy2009AutumnPm0913Figures.length, 19);
  for (const [i, figure] of legacy2009AutumnPm0913Figures.entries()) {
    assert.throws(() => figure.validate([4]));
    assert.throws(() => figure.validate([1.5]));
    for (const index of indices) {
      const caption = '図表';
      const values = [index];
      const html = renderToStaticMarkup(createElement(legacy2009AutumnPm0913FigureRenderers[i].component, { values, caption }));
      assert.ok(html.includes('data-figure-profile="' + figure.profile + '"'));
      assert.match(html, /tabindex="0"/);
      assert.match(html, /aria-description=/);
      assert.match(html, /<table|<svg/);
      assert.doesNotMatch(html, /<img\b/);
      assert.equal(figure.panel(values).kind === 'bits' || figure.panel(values).kind === 'digits', html.includes('<svg'));
      const panel = figure.panel(values);
      if (panel.kind === 'tables') {
        for (const table of panel.tables) {
          const width = table.showHeaders === false ? table.rows[0].length : table.headers.length;
          assert.ok(table.rows.every(row => row.length === width));
        }
      }
    }
  }
});
