import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { readBookletFigure } from '../src/core/booklet-figure-extension-contract';
import { legacy2014AutumnPm5Definition as q5 } from '../src/core/generators/legacy-2014-autumn-pm-5';
import { legacy2014AutumnPm6Definition as q6 } from '../src/core/generators/legacy-2014-autumn-pm-6';
import { legacy2014AutumnPm7Definition as q7 } from '../src/core/generators/legacy-2014-autumn-pm-7';
import { legacy2014AutumnPm8Definition as q8 } from '../src/core/generators/legacy-2014-autumn-pm-8';
import { legacy2014AutumnPm0508Figures as figures } from '../src/core/generators/legacy-2014-autumn-pm-05-08-figures';
import { legacy2014AutumnPm0508FigureRenderers as renderers } from '../src/ui/Legacy2014AutumnPm0508Figures';

const labels = 'アイウエオカキク';
type Def = typeof q5;
function each(def: Def, check: (body: GeneratedBody, input: number) => void) {
  for (let input = def.fields[0].minimum; input <= def.fields[0].maximum; input++) check(def.build([input]), input);
}
function part(body: GeneratedBody, id: string) {
  const p = body.answerParts?.find(part => part.id === 'part-' + id);
  assert(p, id);
  const match = body.partAnswers?.find(answer => answer.kind === 'choice' && answer.partId === p.id);
  assert(match?.kind === 'choice', id);
  return { index: p.choiceIds.indexOf(match.choiceId),
    options: p.choiceIds.map(choice => body.choices[Number(choice.match(/\d+$/)?.[0]) - 1]) };
}
function byText(body: GeneratedBody, id: string, check: (text: string, i: number) => boolean) {
  const { options, index } = part(body, id);
  const rendered = options.map(([b]) => { assert(b.type === 'paragraph'); return b.text; });
  assert.equal(new Set(rendered).size, rendered.length, id);
  assert.deepEqual(rendered.flatMap((text, i) => check(text, i) ? [i] : []), [index], id + ': ' + rendered.join('／'));
}
const paragraphText = (body: GeneratedBody) => body.prompt.flatMap(b => b.type === 'paragraph' ? [b.text] : []).join('\n');
function table(body: GeneratedBody, prefix: string) {
  const block = body.prompt.find(b => b.type === 'table' && b.caption?.startsWith(prefix));
  assert(block?.type === 'table', prefix);
  return block;
}
function diagram(block: Block) {
  assert(block.type === 'diagram' && block.scene.kind === 'source_figure');
  const { scene } = block;
  const fig = figures.find(f => f.profile === scene.profile);
  const renderer = renderers.find(r => r.profile === scene.profile);
  assert(fig && renderer);
  assert.equal(readBookletFigure(fig, scene.values), block.alt);
  return renderToStaticMarkup(createElement(renderer.component, { values: scene.values, caption: block.caption }));
}
function pickFigure(body: GeneratedBody, suffix: string) {
  const selected = body.prompt.find(b => b.type === 'diagram' && b.scene.kind === 'source_figure' && b.scene.profile.endsWith(suffix));
  assert(selected, suffix);
  return diagram(selected);
}

test('2014秋午後問5〜8の26欄・公式キーと12条件の決定性を検査する', () => {
  const expected = ['カオウイエア', 'オオイイエエアイ', 'イウアイアウ', 'アウウウカイ'];
  assert.deepEqual(figures.map(f => f.profile), renderers.map(r => r.profile));
  let count = 0;
  [q5, q6, q7, q8].forEach((def, i) => {
    assert.equal(def.source, '2014h26a-fe-pm-' + (i + 5));
    assert.equal(def.sourceAnswer.replaceAll('／', ''), expected[i]);
    const reference = def.build(def.reference);
    assert.equal(reference.answerParts!.map(p => labels[part(reference, p.id.slice(5)).index]).join(''), expected[i]);
    const prompts = new Set<string>();
    each(def, (body, input) => {
      count++;
      assert.deepEqual(body, def.build([input]));
      assert(!prompts.has(JSON.stringify(body.prompt)));
      prompts.add(JSON.stringify(body.prompt));
      assert.equal(body.answerParts?.length, expected[i].length);
      assert(body.explanation.length > 50);
      for (const block of [...body.prompt, ...body.choices.flat()]) if (block.type === 'diagram') diagram(block);
    });
    for (const value of [[], [-1], [def.fields[0].maximum + 1], [0.5], [NaN], [Infinity], [0, 0]])
      assert.throws(() => def.build(value), /PARAMETER_CONSTRAINT/);
  });
  assert.equal(count, 12);
});

test('問5の集約・汎化・イテレータの全候補をクラスの役割と可能な多重度で判定する', () => {
  each(q5, body => {
    const prose = paragraphText(body);
    const employeeMinimum = /各組織には，少なくとも1人/.test(prose) ? 1 : 0;
    assert.match(prose, /親組織は必ず一つ.*子組織の数に制限はない.*親組織をもたない組織/);
    assert.match(prose, /社員は必ず一つの組織だけに属する/);
    assert.match(prose, /組織階層は木構造/);
    const tree = pickFigure(body, '-analysis'), iterator = pickFigure(body, '-iterator');
    for (const marker of ['data-uml-dependency', 'data-uml-generalization', 'data-uml-aggregation', '［a］', '［b］', '［c］', '［d］'])
      assert(tree.includes(marker), marker);
    assert.match(iterator, /data-uml-realization/);
    assert.match(iterator, /data-uml-creation/);
    assert.match(iterator, /currentPosition/);
    assert.equal([...pickFigure(body, '-traversal').matchAll(/data-traversal=/g)].length, 4);
    byText(body, 'a', value => value === '組織エントリ');
    byText(body, 'b', value => value === '組織');
    const range = (text: string) => {
      const [min, max] = text.split('..');
      return [Number(min), max === '*' ? Infinity : Number(max ?? min)];
    };
    byText(body, 'c', value => {
      const [min, max] = range(value);
      return min === employeeMinimum && max === Infinity;
    });
    byText(body, 'd', value => {
      const [min, max] = range(value);
      return min === 0 && max === 1;
    });
    const descriptions = table(body, '表2').rows;
    const base = descriptions.find(([name]) => name === 'BaseIterator');
    assert(base);
    const reverse = /提供するイテレータは，末尾/.test(prose);
    assert.match(base[1], reverse ? /firstはcurrentPositionを末尾/ : /firstはcurrentPositionを先頭/);
    assert.match(base[1], /走査対象のリストlist/);
    byText(body, 'e', value => value === 'リスト自身');
    byText(body, 'f', value => value.startsWith('BaseListとBaseIterator') && value.includes('を継承して') && value.includes('オーバライド'));
    assert.match(prose, /必ずこのインタフェースを用いて/);
  });
});

test('問6は表示した問い合わせ台帳と週次表から全8欄を独立集計する', () => {
  each(q6, body => {
    const text = paragraphText(body);
    const goal = Number(text.match(/受付から(\d+)分以内/)?.[1]);
    const staffingCap = Number(text.match(/サービスデスク問合せ数が(\d+)以下/)?.[1]);
    const perCase = Number(text.match(/平均(\d+)分短縮/)?.[1]);
    assert(goal && staffingCap && perCase);
    assert.match(text, /小数第3位を四捨五入/);
    assert.match(text, /第4週になって初めて問合せ数条件を満たしたとしても第5週は第4週と同じ/);
    const elapsed = (stamp: string) => Date.parse(stamp.replace('2014/10/4 ', '2014-10-04T').replace(/T(\d):/, 'T0$1:') + ':00Z');
    const entries = table(body, '表2').rows;
    const direct = entries.filter(([, , , c, detail, team]) => /ログイン|操作/.test(c) || team === 'サービスデスク' ||
      (c === '（網掛け）' && /パスワードを変更/.test(detail)));
    assert.deepEqual(direct.map(r => r[0]), ['11842', '11860', '11865', '11866']);
    const met = direct.filter(row => (elapsed(row[2]) - elapsed(row[1])) / 60000 <= goal).length;
    byText(body, '1', v => Number(v) === Math.round(100 * met / direct.length));
    const categories = table(body, '表1').rows;
    const data = table(body, '表3').rows;
    const rows = data.slice(0, -1).map(([name, ...cells]) => ({
      name, cells: cells.map(s => { const m = s.match(/^(\d+)(?:（(\d+)）)?$/)!; return [Number(m[1]), Number(m[2])]; }),
      team: categories.find(row => row[1] === name)?.[2],
    }));
    const totals = data.at(-1)!.slice(1).map(Number);
    assert.deepEqual(totals, [0, 1, 2, 3].map(w => rows.reduce((n, row) => n + row.cells[w][0], 0)));
    const half = rows.filter(row => row.cells[3][0] / row.cells[0][0] <= 0.5).map(row => row.name);
    byText(body, 'a', v => v.split('と').length === half.length && v.split('と').every(s => half.includes(s)));
    const sumTeam = (name: string) => rows.filter(row => row.team === name).reduce((n, row) => n + row.cells[3][0], 0);
    const best = Math.max(...categories.map(([, , name]) => sumTeam(name)));
    byText(body, 'b', v => sumTeam(v) === best);
    const firstEligible = totals.findIndex((n, w) => n <= 150 && sumAtDesk(w) <= staffingCap);
    function sumAtDesk(w: number) { return rows.filter(row => row.team === 'サービスデスク').reduce((n, row) => n + row.cells[w][0], 0); }
    assert(firstEligible >= 1 && firstEligible <= 3);
    const actualReturn = firstEligible === 3 ? 6 : firstEligible + 2;
    byText(body, 'c', v => v.includes('増員したまま') ? actualReturn > 5 : Number(v.match(/第(\d+)週から/)?.[1]) === actualReturn);
    const desc = rows.slice(0, 2).map(row => {
      const rates = row.cells.map(([n, success]) => { assert(success <= n); return success / n; });
      const up = rates.slice(1).map((rate, i) => rate > rates[i]);
      assert(up.some(Boolean));
      return up.every(Boolean);
    });
    byText(body, 'd', v => {
      const semantics: Record<string, boolean[]> = {
        'ログイン，操作とも毎週上がっている': [true, true], 'ログイン，操作とも週によって上がり下がりがある': [false, false],
        'ログインは週によって上がり下がりがあるものの，操作は毎週上がっている': [false, true],
        'ログインは毎週上がっているものの，操作は週によって上がり下がりがある': [true, false],
      };
      return semantics[v].every((value, i) => value === desc[i]);
    });
    const repeats = table(body, '表4').rows.slice(0, -1).map(([name, count, repeat], i) => {
      assert.equal(+count, rows[i].cells[3][0]);
      const next = +count + (['操作', '目標管理', '販売実績'].includes(name) ? Number(count) / 4 : 0);
      return { next, repeated: next * +repeat / +count, direct: rows[i].team === 'サービスデスク' };
    });
    assert(repeats.every(row => Number.isInteger(row.next) && Number.isInteger(row.repeated)));
    const weeklyTotal = repeats.reduce((n, row) => n + row.next, 0);
    const newDeskRepeat = repeats.reduce((n, row) => n + (row.direct ? 0 : row.repeated), 0);
    const allRepeat = repeats.reduce((n, row) => n + row.repeated, 0);
    assert.match(text, /50%がFAQ.*問合せ数が50%に減らせる/);
    byText(body, 'e', v => +v === weeklyTotal);
    byText(body, 'f', v => +v === newDeskRepeat * perCase);
    byText(body, 'g', v => +v === (allRepeat * 0.5) * (1 - 0.5));
  });
});

test('問7は受注累計と到着日による供給累計の照合で全6欄を判定する', () => {
  each(q7, body => {
    const text = paragraphText(body);
    assert.match(text, /9時から16時まで/);
    assert.match(text, /受付時間の終了後/);
    assert.match(text, /欠品による納期遅れはない/);
    assert.match(text, /受注情報を入力した順に在庫引当/);
    assert.match(text, /在庫があるにもかかわらず在庫引当されない/);
    const initial = Number(text.match(/6月末の引当可能在庫の数量は(\d+)個/)?.[1]);
    const lead = Number(text.match(/調達リードタイムは(\d+)日間/)?.[1]);
    const orderPolicy = text.match(/発注点は(\d+)個，発注量は(\d+)個/);
    assert(orderPolicy && initial && lead);
    const [threshold, lot] = orderPolicy.slice(1).map(Number);
    const day = (label: string) => Number(label.match(/7月(\d+)日/)?.[1]);
    const current = table(body, '表1').rows, improved = table(body, '表2').rows;
    assert.deepEqual(improved.map(r => r.slice(0, 4)), current.map(r => r.slice(0, 4)));
    const orders = current.map(([id, at, amount, due]) => ({ id, at: day(at), amount: +amount, due: day(due) }));
    const gross = (prefix: number, predicate: (order: typeof orders[number]) => boolean) =>
      orders.slice(0, prefix).filter(predicate).reduce((n, order) => n + order.amount, 0);
    for (const i of [0, 1, 2]) {
      assert.equal(+current[i][4], initial - gross(i + 1, () => true));
      assert.equal(+improved[i][4], initial - gross(i + 1, order => order.due - order.at < lead));
    }
    assert(current.slice(3).every(r => r[4] === '（網掛け）'));
    assert.equal(improved.find(r => r[0] === '130168')?.[4], '［e］');

    const dispatch = [...new Set(orders.map(order => order.at))]
      .find(date => initial - gross(orders.length, order => order.at <= date) <= threshold);
    assert(dispatch);
    const nextDelivery = dispatch + lead;
    const late = orders.flatMap((order, i) =>
      gross(i + 1, () => true) > initial + (order.due >= nextDelivery ? lot : 0) ? [order.id] : []);
    byText(body, '1', value => {
      if (value.includes('一定の日にち間隔')) return false;
      if (value.includes('納入リードタイムに関係なく')) return true;
      if (value.includes('入力することはできない')) return false;
      assert.match(value, /マイナス/); return false;
    });
    byText(body, 'a', v => day(v) === dispatch);
    byText(body, 'b', v => JSON.stringify(v.split('と')) === JSON.stringify(late));
    // Reserved inventory is still physically present, due dates do not change,
    // and a reservation cannot be reused for a different customer order.
    byText(body, 'c', v => v.includes('入庫日よりも前の要求納期') && v.includes('在庫引当ができない'));
    byText(body, 'd', v => v.includes('受注情報を入力しても') && v.includes('在庫引当を行わない'));
    const eOrder = orders.findIndex(order => order.id === '130168');
    assert.equal(orders.filter(order => order.due - order.at >= lead).length, 3);
    byText(body, 'e', v => +v === initial - gross(eOrder + 1, order => order.due - order.at < lead));
  });
});

function subsequences(text: string): string[] {
  let result = [''];
  for (const char of text) result = [...result, ...result.map(prefix => prefix + char)];
  return result;
}
function byLcs(a: string, b: string) {
  const other = new Set(subsequences(b));
  const length = Math.max(...subsequences(a).filter(s => other.has(s)).map(s => s.length));
  return a.length + b.length - 2 * length;
}
function coordinates(html: string) {
  return [...html.matchAll(/data-edge-x="(\d+)" data-edge-y="(\d+)"/g)].map(([, x, y]) => x + ',' + y);
}

test('問8の図形全候補、実行数、最短距離を文字頻度と部分列の全列挙から検証する', () => {
  const originalChoiceEdges = [
    ['1,0', '2,1', '1,3', '2,5'], ['0,1', '3,1', '0,5', '3,5'], ['0,0', '1,1', '4,1', '0,3', '1,5', '4,5'],
    ['1,0', '4,0', '1,1', '4,1', '1,4', '4,4', '1,5', '4,5'], ['0,0', '0,1', '1,1', '3,1', '4,1', '0,3', '0,5', '1,5', '3,5', '4,5'],
  ];
  each(q8, (body, input) => {
    const text = paragraphText(body);
    assert.match(text, /必須問題/);
    assert.match(text, /追加操作又は削除操作/);
    assert.match(text, /添字は0から/);
    assert.match(text, /移動距離を1.*移動距離を0/);
    assert.deepEqual(table(body, '関数CalcEditDistance').rows.filter(r => r[0].endsWith('Len')).map(row => row[2].slice(-5)), ['（1以上）', '（1以上）']);
    const refs = body.contexts?.[0].blocks;
    assert.deepEqual(refs?.map(b => b.type === 'image' ? b.assetId : ''), ['asset-ipa-2014h26a-fe-pm-p003', 'asset-ipa-2014h26a-fe-pm-p004']);
    const match = text.match(/CalcEditDistance\("([a-z]+)", (\d+), "([a-z]+)", (\d+)\)を実行/);
    assert(match);
    const from = match[1], to = match[3], width = from.length, height = to.length;
    assert.deepEqual([width, height], [Number(match[2]), Number(match[4])]);
    const fromFreq = new Map<string, number>(), toFreq = new Map<string, number>();
    for (const ch of from) fromFreq.set(ch, (fromFreq.get(ch) ?? 0) + 1);
    for (const ch of to) toFreq.set(ch, (toFreq.get(ch) ?? 0) + 1);
    const count = [...fromFreq].reduce((n, [ch, left]) => n + left * (toFreq.get(ch) ?? 0), 0);
    const c = part(body, 'c');
    const target: string[] = [];
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (from[x] === to[y]) target.push(x + ',' + y);
    const possible = c.options.map(([b]) => coordinates(diagram(b)));
    if (!input) assert.deepEqual(possible, originalChoiceEdges);
    const keys = possible.map(edges => [...edges].sort().join(';'));
    assert.equal(new Set(keys).size, 5);
    const expectedEdges = target.sort().join(';');
    assert.deepEqual(keys.flatMap((key, i) => key === expectedEdges ? [i] : []), [c.index]);
    byText(body, 'd', v => +v === count);
    byText(body, 'e', v => +v === width * height - count);
    byText(body, 'f', v => +v === byLcs(from, to));
    const example = pickFigure(body, '-example');
    const segments = [...example.matchAll(/data-shortest-path="" data-step-from="([0-7],[0-6])" data-step-to="([0-7],[0-6])"/g)];
    assert.deepEqual(segments.map(([, start, end]) => start + '→' + end), [
      '0,0→1,0', '1,0→2,0', '2,0→3,1', '3,1→3,2', '3,2→4,3',
      '4,3→5,4', '5,4→6,4', '6,4→7,5', '7,5→7,6',
    ]);
    const exampleFrom = 'abcabba', exampleTo = 'cbabac';
    const diagonals = new Set(coordinates(example));
    let cost = 0;
    for (const [, start, end] of segments) {
      const [x, y] = start.split(',').map(Number), [endX, endY] = end.split(',').map(Number);
      const dx = endX - x, dy = endY - y;
      if (dx === 1 && dy === 1) {
        assert(diagonals.has(start));
        assert.equal(exampleFrom[x], exampleTo[y]);
      } else {
        assert((dx === 1 && dy === 0) || (dx === 0 && dy === 1));
        cost++;
      }
    }
    assert.equal(cost, 5);
    assert.equal(cost, byLcs(exampleFrom, exampleTo));
    const operations = [...pickFigure(body, '-operations').matchAll(/data-edit-operation="(\d)" data-edit-result="([a-z]+)"/g)];
    assert.deepEqual(operations.map(([, , result]) => result), ['bcabba', 'cabba', 'cbabba', 'cbaba', 'cbabac']);
    assert.equal(operations.length, cost);
    assert.match(pickFigure(body, '-program'), /D\[X, Y\].*D\[X − 1, Y − 1\]/);
  });
});

test('問8 a/bの全式を独立な短文字列と末端で検証する', () => {
  const binary = ['a', 'b', 'aa', 'ab', 'ba', 'bb', 'aaa', 'aab', 'aba', 'abb', 'baa', 'bab', 'bba', 'bbb'];
  each(q8, body => {
    const a = part(body, 'a'), b = part(body, 'b');
    const aTruth = a.options.map(([block]) => {
      assert(block.type === 'paragraph');
      return binary.every(s => binary.every(t => {
        for (let x = 1; x <= s.length; x++) for (let y = 1; y <= t.length; y++) {
          const read = (name: string, pos: string, prev: string) => (name === 'Str1' ? s : t)[(pos === 'X' ? x : y) - (prev ? 1 : 0)];
          const clauses = block.text.split(' and ');
          const outcomes = clauses.map(clause => {
            const exp = clause.match(/^(Str[12])\[([XY])( − 1)?\] (=|≠) (Str[12])\[([XY])( − 1)?\]$/);
            assert(exp, clause);
            const left = read(exp[1], exp[2], exp[3]), right = read(exp[5], exp[6], exp[7]);
            if (left === undefined || right === undefined) return undefined;
            return exp[4] === '=' ? left === right : left !== right;
          });
          if (outcomes.includes(undefined) || outcomes.every(Boolean) !== (s[x - 1] === t[y - 1])) return false;
        }
        return true;
      }));
    });
    assert.deepEqual(aTruth.flatMap((correct, i) => correct ? [i] : []), [a.index]);
    const bTruth = b.options.map(([block]) => {
      assert(block.type === 'paragraph');
      const exp = block.text.match(/^D\[(0|Str1Len(?: − 1)?), (0|Str2Len(?: − 1)?)\]( \+ 1)?$/);
      assert(exp, block.text);
      const prefix = (s: string, selector: string) => selector === '0' ? '' : selector.endsWith(' − 1') ? s.slice(0, -1) : s;
      return binary.every(s => binary.every(t =>
        byLcs(prefix(s, exp[1]), prefix(t, exp[2])) + (exp[3] ? 1 : 0) === byLcs(s, t)));
    });
    assert.deepEqual(bTruth.flatMap((correct, i) => correct ? [i] : []), [b.index]);
  });
});
