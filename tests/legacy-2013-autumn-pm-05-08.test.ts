import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { autumn2013Pm05To08Specs as specs } from '../scripts/legacy-2013-autumn-pm-05-08-specs';
import { legacy2013AutumnPm0508Figures as figures } from '../src/core/generators/legacy-2013-autumn-pm-05-08-figures';
import { legacy2013AutumnPm0508FigureRenderers as renderers } from '../src/ui/Legacy2013AutumnPm0508Figures';
import review from './fixtures/legacy-2013-autumn-pm-05-08-review.json';

const marks = 'アイウエオカキクケコ';
const generated = (major: number) => {
  const spec = specs.find(item => item.number === major);
  assert(spec);
  return Array.from({ length: spec.definition.fields[0].maximum + 1 }, (_, i) => spec.definition.build([i]));
};
function options(body: GeneratedBody, index: number) {
  const part = body.answerParts![index];
  return part.choiceIds.map(id => body.choices[Number(id.split('-').at(-1)) - 1][0]);
}
function onlyText(block: Block) {
  if (block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith('-schedule-option')) {
    return [...block.alt.matchAll(/第[456]週：([0-9]+)本/g)].map(match => match[1]).join('｜');
  }
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
}
function chosen(body: GeneratedBody, index: number) {
  const answer = body.partAnswers![index], part = body.answerParts![index];
  assert(answer.kind === 'choice' && answer.partId === part.id);
  const position = part.choiceIds.indexOf(answer.choiceId);
  assert(position >= 0);
  return position;
}
function exact(body: GeneratedBody, index: number, valid: readonly boolean[]) {
  assert.equal(valid.filter(Boolean).length, 1, 'slot ' + body.answerParts![index].label);
  assert.deepEqual(valid, options(body, index).map((_, i) => i === chosen(body, index)));
}
function panel(body: GeneratedBody, suffix: string) {
  const block = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith(suffix));
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  return { scene: block.scene, caption: block.caption, alt: block.alt };
}
function html(block: ReturnType<typeof panel>) {
  const renderer = renderers.find(renderer => renderer.profile === block.scene.profile);
  assert(renderer);
  return renderToStaticMarkup(createElement(renderer.component, { values: block.scene.values, caption: block.caption }));
}
function byCaption(body: GeneratedBody, start: string) {
  const block = body.prompt.find(block => block.type === 'table' && block.caption.startsWith(start));
  assert(block?.type === 'table');
  return block.rows;
}
function stem(body: GeneratedBody) {
  return body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
}

test('2013秋午後問5〜8：原冊子の22頁・公式26欄と解答群の順・共有範囲を保持', () => {
  assert.deepEqual(specs.map(spec => spec.number), [5, 6, 7, 8]);
  assert.deepEqual(review.held, []);
  assert.equal(specs.flatMap(spec => spec.pages).length, 22);
  assert.equal(specs.flatMap(spec => spec.original.answerParts!).length, 26);
  const domains = [3, 3, 3, 4];
  for (const [i, spec] of specs.entries()) {
    const facts = review.questions[i], bodies = generated(spec.number);
    assert.equal(facts.number, spec.number);
    assert.deepEqual(spec.pages, facts.pages);
    assert(spec.pages.every(page => spec.originalPageAlt[page].trim().length > 100));
    assert.equal(spec.definition.sourceAnswer, [...facts.keys].join('／'));
    assert.equal(bodies.length, domains[i]);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, domains[i]);
    assert(new Set(bodies.map(body => body.answerParts!.map((_, j) => onlyText(options(body, j)[chosen(body, j)])).join('|'))).size >= 2);
    assert.equal(spec.original.answerParts!.map((_, j) => marks[chosen(spec.original, j)]).join(''), facts.keys);
    for (const body of bodies) {
      const parts = body.answerParts!;
      assert.deepEqual(parts.map(part => part.choiceIds.length), facts.bankSizes);
      assert.deepEqual(parts.map(part => part.label).join(''), 'abcdefgh'.slice(0, facts.keys.length));
      assert.equal(parts.length, body.partAnswers!.length);
      assert(body.explanation.length > 100);
      for (const [j, part] of parts.entries()) {
        assert.equal(new Set(options(body, j).map(onlyText)).size, part.choiceIds.length);
        parts.forEach((other, k) => {
          if (facts.banksByPart[j] === facts.banksByPart[k]) assert.deepEqual(other.choiceIds, part.choiceIds);
          else assert(!other.choiceIds.some(id => part.choiceIds.includes(id)));
        });
      }
      assert.deepEqual(body.contexts?.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])) ?? [],
        spec.definition.fixedReferenceAssetIds ?? []);
    }
    for (const bad of [[], [-1], [bodies.length], [.5], [1, 0], Array(1)]) {
      assert.throws(() => spec.definition.build(bad), { code: 'PARAMETER_CONSTRAINT' });
    }
  }
});

test('2013秋午後問5：実際の2行のテストデータを左から条件評価し全選択肢を検算', () => {
  for (const body of generated(5)) {
    const displayed = html(panel(body, '-5-test-cases'));
    const rows = [...displayed.matchAll(/<tr data-test-case="[12]">([\s\S]+?)<\/tr>/g)].map(row =>
      [...row[1].matchAll(/<td[^>]*>([0-9]+)<\/td>/g)].map(cell => Number(cell[1])));
    assert.equal(rows.length, 2);
    assert(rows.every(row => row.length === 5));
    assert.match(stem(body), /左から右へ向かって順に評価.*結果が確定したら/);
    const numbered = panel(body, '-5-program-numbered');
    assert.match(numbered.alt, /③ \(a ＜ 10\) or ④ \(b ＜ 20\)/);
    assert.match(numbered.alt, /⑦ \(c ＞ 10\) and ⑧ \(d ＞ 10\)/);
    for (const [i, row] of rows.entries()) {
      const [x, a, b, c, d] = row;
      assert(x > 10);
      const evaluated: string[] = [];
      const condition = (key: string, yes: boolean) => { evaluated.push(key); return yes; };
      const left = condition('a＜10', a < 10) || condition('b＜20', b < 20);
      const right = condition('c＞10', c > 10) && condition('d＞10', d > 10);
      assert.equal(left, a < 10 || b < 20);
      assert.equal(right, c > 10 && d > 10);
      const missing = ['a＜10', 'b＜20', 'c＞10', 'd＞10'].filter(key => !evaluated.includes(key));
      exact(body, i, options(body, i).map(block => {
        const claim = onlyText(block);
        if (claim === '全ての単独条件が評価される') return missing.length === 0;
        return claim.replace('が評価されない', '').split('と').sort().join('|') === missing.slice().sort().join('|');
      }));
      for (const key of missing) assert(body.explanation.includes(key));
    }
  }
});

function permutations(values: number[]): number[][] {
  if (!values.length) return [[]];
  return values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index)).map(row => [value, ...row]));
}

test('2013秋午後問5：描画した分岐グラフのノードと矢印から遮蔽欄・網羅数を独立検算', () => {
  const canonical = [
    'S→1','1→2','1→E','2→3','3→4','3→5','4→5','4→6','5→7','6→7',
    '7→8','7→10','8→9','8→10','9→E','10→11','11→1',
  ].sort().join('|');
  const masked = ['c','upper','middle','d','e','left','f'];
  for (const body of generated(5)) {
    const picture = html(panel(body, '-5-control-flow'));
    const renderedNodes = [...picture.matchAll(/data-flow-node="([^"]+)"/g)].map(match => match[1]);
    const edges = [...picture.matchAll(/<path[^>]+marker-end="[^"]+" data-flow-edge="([^"]+)"/g)].map(match => match[1]);
    assert.equal(renderedNodes.length, 13);
    assert.equal(edges.length, 17);
    assert.equal([...picture.matchAll(/data-flow-shaded="true"/g)].length, 3);
    const solutions = permutations([3,4,5,6,8,10,11]).filter(row => {
      const renaming = Object.fromEntries(masked.map((id, i) => [id, row[i]]));
      return edges.map(edge => edge.split('→').map(id => renaming[id] ?? id).join('→')).sort().join('|') === canonical;
    });
    assert.equal(solutions.length, 1);
    const byNode = ['','①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪'];
    for (const [index, blank] of ['c','d','e','f'].entries()) {
      const label = byNode[solutions[0][masked.indexOf(blank)]];
      exact(body, index + 2, options(body, index + 2).map(block => onlyText(block) === label));
    }
    // Case masks independently enumerate non-entry and both outcomes of each
    // combined condition on entry. The six flags describe the source criterion.
    const testCases = [0b000001, 0b010110, 0b100110, 0b011010, 0b101010];
    let minimum = testCases.length;
    for (let subset = 1; subset < 1 << testCases.length; subset++) {
      const selected = testCases.filter((_, i) => subset & (1 << i));
      if (selected.reduce((covered, next) => covered | next, 0) === 0b111111) minimum = Math.min(minimum, selected.length);
    }
    exact(body, 6, options(body, 6).map(block => Number(onlyText(block)) === minimum));
    exact(body, 7, options(body, 7).map(block => Number(onlyText(block)) === edges.length - renderedNodes.length + 2));
    assert.match(body.explanation, /最少3例.*17−13＋2＝6/);
  }
});

test('2013秋午後問6：実績表から二元の工数を分離し、週別全候補を列挙', () => {
  for (const body of generated(6)) {
    const originalPlan = html(panel(body, '-6-work-plan'));
    assert.match(originalPlan, /data-project-plan/);
    assert.match(originalPlan, /<td[^>]*>50<\/td><td[^>]*>50<\/td><td[^>]*>20<\/td>/);
    assert.match(stem(body), /1日の作業時間の上限は8時間.*1週間の作業日数は5日/);
    const [[, w1Text, w2Text], [, h1Text, h2Text]] = byCaption(body, '表2 内部設計');
    const w1 = Number(w1Text), w2 = Number(w2Text), h1 = Number(h1Text), h2 = Number(h2Text);
    const total = 120, common = 30, limit = 400;
    const remaining = total - w1 - w2;
    const uniqueRate = h2 / w2, commonRate = (h1 - (w1 - common) * uniqueRate) / common;
    const rateCategory = [commonRate > 8 && uniqueRate <= 8, commonRate > 8 && uniqueRate > 8, commonRate <= 8 && uniqueRate > 8];
    assert(h1 <= limit && h2 <= limit && (h1 + h2) / (w1 + w2) > 8);
    assert(remaining * uniqueRate <= limit);
    const gap = (100 - w1 - w2) / total * 100;
    const approx = options(body, 0).map(block => Math.abs(Number(onlyText(block)) - gap));
    exact(body, 0, approx.map(distance => distance === Math.min(...approx)));
    exact(body, 1, rateCategory);
    exact(body, 2, options(body, 2).map(block => Number(onlyText(block)) === remaining * uniqueRate));

    const workPerProgram = [...Array(30).fill(8), ...Array(90).fill(9)] as number[];
    const actualWork = workPerProgram.reduce((total, rate) => total + rate, 0);
    exact(body, 3, options(body, 3).map(block => Number(onlyText(block)) === total * 10 - actualWork));
    const upcoming = workPerProgram.slice(10);
    const available = [];
    for (let week4 = 1; week4 < upcoming.length - 1; week4++) {
      for (let week5 = 1; week4 + week5 < upcoming.length; week5++) {
        const week6 = upcoming.length - week4 - week5;
        const weeks = [week4, week5, week6];
        let next = 0;
        const hours = weeks.map(count => upcoming.slice(next, next += count).reduce((sum, rate) => sum + rate, 0));
        if (hours.every(value => value <= limit)) available.push({ weeks, spread: Math.max(...hours) - Math.min(...hours) });
      }
    }
    assert(available.length > 1);
    const fastest = available.reduce((left, right) => {
      if (left.weeks[0] !== right.weeks[0]) return left.weeks[0] > right.weeks[0] ? left : right;
      return left.weeks[1] > right.weeks[1] ? left : right;
    });
    exact(body, 4, options(body, 4).map(block => onlyText(block) === fastest.weeks.join('｜')));
    const balanced = byCaption(body, '表4 テスト')[0].slice(2).map(Number);
    const displayed = available.find(candidate => candidate.weeks.join() === balanced.join());
    assert(displayed);
    assert.equal(displayed.spread, Math.min(...available.map(candidate => candidate.spread)));
    exact(body, 5, options(body, 5).map(block => Number(onlyText(block)) === displayed.spread));
    assert(body.explanation.includes(remaining + '×' + uniqueRate + '＝' + remaining * uniqueRate));
    assert(body.explanation.includes('最大の差は' + displayed.spread + '人時'));
  }
});

test('2013秋午後問7：全ての業務上の候補と表示された需要比率・在庫から各択を検算', () => {
  const ledger = review.questions[2];
  assert(ledger.workflowChoices && ledger.workflowDecisions);
  for (const body of generated(7)) {
    const statement = stem(body);
    for (const evidence of ['注文内容を電子情報にして物流担当に伝える', '物流担当がまとめて行う',
      '顧客に商品を届ける方法は従来どおり', '事務担当が受発注処理や在庫管理に費やす時間']) assert(statement.includes(evidence));
    for (let slot = 0; slot < 4; slot++) {
      assert.deepEqual(options(body, slot).map(onlyText), ledger.workflowChoices[slot]);
      exact(body, slot, ledger.workflowDecisions[slot]);
    }
    const view = html(panel(body, '-7-stock-table'));
    const rows = [...view.matchAll(/<tr data-stock-office="営業所[P-T]">([\s\S]+?)<\/tr>/g)].map(match =>
      [...match[1].matchAll(/<td[^>]*>([0-9.]+)<\/td>/g)].map(cell => Number(cell[1])));
    assert.equal(rows.length, 5);
    assert(rows.every(row => row.length === 6));
    assert.equal([...view.matchAll(/aria-label="網掛けの部分は表示していない"/g)].length, 2);
    const root = (ratio: number) => ratio ? Number(new RegExp('√' + ratio.toFixed(1).replace('.', '\\.') + '＝(0\\.\\d{2})').exec(statement)![1]) : 0;
    const total = (index: number) => {
      const sum = (col: number) => rows.map(row => row[col]).reduce((total, value) => total + value, 0);
      const rotate = sum(index), safety = sum(index + 1);
      assert(Math.abs(sum(index + 2) - 1) < 0.0001);
      const scale = rows.map(row => root(row[index + 2])).reduce((total, value) => total + value, 0);
      const consolidated = rotate + safety / scale;
      return { rotate, safety, consolidated, original: rotate + safety, scale };
    };
    const k = total(0), l = total(3);
    assert.deepEqual([k.rotate, k.safety], [l.rotate, l.safety]);
    assert(k.scale > l.scale && k.consolidated < l.consolidated);
    assert.match(statement, new RegExp('商品Lの総在庫数は ' + Math.floor(l.consolidated + 0.5)));
    exact(body, 4, options(body, 4).map(block => Number(onlyText(block)) === Math.floor(k.consolidated + 0.5)));
    const outcome = k.original - k.consolidated > l.original - l.consolidated;
    const possibilities = [outcome, !outcome, false, k.consolidated === l.consolidated];
    exact(body, 5, possibilities);
    assert.match(html(panel(body, '-7-stock-formula')), /<mfrac>.*<msqrt>/);
    assert.match(body.explanation, new RegExp('四捨五入すると' + Math.floor(k.consolidated + 0.5)));
  }
});

function independentCompression(text: string): string[] {
  const result: string[] = [];
  for (let at = 0; at < text.length;) {
    let selected: string | undefined;
    // Descending lengths, with the latest possible earlier occurrence chosen
    // among equal lengths. Slices use disjoint ranges, not the generator loop.
    for (let width = Math.min(26, at, text.length - at); width >= 4; width--) {
      const word = text.slice(at, at + width);
      const before = text.slice(Math.max(0, at - 26), at);
      const location = before.lastIndexOf(word);
      if (location < 0) continue;
      const distance = before.length - location;
      selected = '$' + String.fromCharCode(64 + distance, 64 + width);
      at += width;
      break;
    }
    result.push(selected ?? text[at++]);
  }
  return result;
}

function referenceDecode(chunks: string[]) {
  let text = '';
  for (const chunk of chunks) {
    if (chunk.length === 1) text += chunk;
    else {
      const [distance, width] = [chunk.charCodeAt(1) - 64, chunk.charCodeAt(2) - 64];
      const origin = text.length - distance;
      assert(origin >= 0 && origin + width <= text.length);
      text += text.slice(origin, origin + width);
    }
  }
  return text;
}

type Registers = Record<string, number>;
function operand(word: string, values: Registers) {
  if (/^[0-9]+$/.test(word)) return Number(word);
  assert(Object.hasOwn(values, word), word);
  return values[word];
}
function expression(value: string, values: Registers) {
  const tokens = value.trim().split(/\s+/);
  assert(tokens.length % 2 === 1);
  let amount = operand(tokens[0], values);
  for (let i = 1; i < tokens.length; i += 2) {
    assert(tokens[i] === '+' || tokens[i] === '−');
    amount += (tokens[i] === '+' ? 1 : -1) * operand(tokens[i + 1], values);
  }
  return amount;
}
function evaluateReference(option: string, arrays: Record<string, readonly string[]>, values: Registers) {
  const match = /^([A-Za-z]+)\[(.+)\]$/.exec(option);
  assert(match);
  const index = expression(match[2], values);
  const array = arrays[match[1]];
  assert(array && index >= 0 && index < array.length);
  return array[index];
}
function assign(option: string, registers: Registers) {
  const [name, source] = option.split(' ← ');
  assert(Object.hasOwn(registers, name));
  registers[name] = expression(source, registers);
}

function paperCompress(text: string, [a, b, c, d]: string[]) {
  const env = { Pindex: 0, Cindex: 0, Plength: text.length, Distance: 4, Fitnum: 0, Maxfitnum: 0, Maxdistance: 0 };
  const plain = [...text], result: string[] = [];
  const [left, right] = a.split(' ≥ ');
  let steps = 0;
  while (env.Pindex < env.Plength && env.Pindex < 4) {
    result[env.Cindex++] = plain[env.Pindex++];
  }
  while (env.Pindex < env.Plength) {
    assert(++steps <= text.length * 27);
    env.Maxfitnum = -1;
    env.Maxdistance = -1;
    env.Distance = 4;
    while (env.Distance <= 26 && expression(left, env) >= expression(right, env)) {
      assert(++steps <= text.length * 27);
      env.Fitnum = 0;
      while (env.Fitnum < env.Distance && env.Pindex + env.Fitnum < env.Plength) {
        if (plain[env.Pindex + env.Fitnum] !== evaluateReference(b, { Plaindata: plain }, env)) break;
        env.Fitnum++;
      }
      if (env.Fitnum >= 4 && env.Maxfitnum < env.Fitnum) {
        env.Maxfitnum = env.Fitnum;
        env.Maxdistance = env.Distance;
      }
      assign(c, env);
    }
    if (env.Maxfitnum < 0) result[env.Cindex++] = plain[env.Pindex++];
    else {
      result[env.Cindex++] = '$';
      result[env.Cindex++] = String.fromCharCode(64 + env.Maxdistance);
      result[env.Cindex++] = String.fromCharCode(64 + env.Maxfitnum);
      assign(d, env);
    }
    assert(env.Pindex <= text.length);
  }
  return result.join('');
}

function paperDecompress(stream: string, e: string) {
  const plain: string[] = [], compressed = [...stream];
  const env = { Pindex: 0, Start: 0, Fitcnt: 0 };
  for (let cursor = 0; cursor < compressed.length;) {
    if (compressed[cursor] !== '$') plain[env.Pindex++] = compressed[cursor++];
    else {
      env.Start = compressed[cursor + 1].charCodeAt(0) - 64;
      const width = compressed[cursor + 2].charCodeAt(0) - 64;
      for (env.Fitcnt = 0; env.Fitcnt < width; env.Fitcnt++) {
        plain[env.Pindex + env.Fitcnt] = evaluateReference(e, { Plaindata: plain, Compresseddata: compressed }, env);
      }
      env.Pindex += width;
      cursor += 3;
    }
  }
  return plain.join('');
}

test('2013秋午後問8：a〜eの全ての式と代入を独立実行し誤答ごとの反例を確認', () => {
  const [original] = generated(8);
  const candidates = Array.from({ length: 5 }, (_, index) => options(original, index).map(onlyText));
  const known = ['Pindex − Distance ≥ 0', 'Plaindata[Pindex − Distance + Fitnum]', 'Distance ← Distance + 1',
    'Pindex ← Pindex + Maxfitnum', 'Plaindata[Pindex − Start + Fitcnt]'];
  const inputs = [
    'A','ABC','ABCD','ABCDE','ABCDEFGABCDEABCDFEFGABCD','ABCDABCDABCD','ABCDABCDEFABCDABCDEF',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ','ABCDEFGHIJKLMNOPQRSTUVWXYZAABCDEFGHIJKLMNOPQRSTUVWXYZA',
    'AAAAABAAAAABAAAAACAAAAABAAAAAC','AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'ABCDEFABCABCDEFABCDEFABCABCDEFABCC',
  ];
  for (const [index, bank] of candidates.entries()) {
    const succeeds = bank.map(option => inputs.every(input => {
      const attempts = known.slice();
      attempts[index] = option;
      const expected = independentCompression(input);
      try {
        const compressed = paperCompress(input, attempts);
        return compressed === expected.join('') && paperDecompress(compressed, attempts[4]) === input;
      } catch { return false; }
    }));
    for (const body of generated(8)) {
      assert.deepEqual(options(body, index).map(onlyText), bank);
      exact(body, index, succeeds);
    }
  }
});

test('2013秋午後問8：全英字列の圧縮・復元と実際のα回数を全択・解説と照合', () => {
  const observed = [];
  for (const body of generated(8)) {
    const source = /^文字列：([A-Z]+)$/m.exec(stem(body));
    assert(source);
    const chunks = independentCompression(source[1]);
    assert.equal(referenceDecode(chunks), source[1]);
    const copies = chunks.filter(chunk => chunk.length === 1).length;
    observed.push(copies);
    exact(body, 5, options(body, 5).map(block => Number(onlyText(block)) === copies));
    assert(body.explanation.includes(chunks.join('')));
    assert(body.explanation.endsWith('αは' + copies + '回実行される。'));
    assert.match(stem(body), /各配列の添字は，0から始まる/);
    assert.match(stem(body), /距離と文字数の最大値は26/);
    assert.match(stem(body), /一致する文字数が4以上/);
  }
  assert.deepEqual(observed, [8,7,6,5]);
});

test('2013秋午後問5〜8：管理図全入力・共通色・凡例・制御線・継続行とαの点線枠を描画', () => {
  assert.equal(figures.length, 18);
  assert.deepEqual(renderers.map(renderer => renderer.profile).sort(), figures.map(figure => figure.profile).sort());
  let count = 0;
  for (const entry of figures) {
    const [[first, last]] = entry.domain;
    for (let value = first; value <= last; value++) {
      entry.validate([value]);
      const alt = entry.alt([value]);
      assert(alt.length > 8);
      const drawing = html({ scene: { kind: 'source_figure', profile: entry.profile, values: [value] }, caption: '原形式図表', alt });
      assert.match(drawing, /class="diagram-scroll" tabindex="0"/);
      assert.match(drawing, /var\(--diagram-ink\)/);
      assert.match(drawing, /(?:aria-description|aria-describedby)=/);
      assert(!drawing.includes('NaN'));
      count++;
    }
  }
  assert.equal(count, 28);
  const body = generated(8)[0];
  const signature = panel(body, '-8-compress-signature');
  assert.match(signature.alt, /Plength，\n {26}文字型：Compresseddata/);
  const code = panel(body, '-8-compress-program');
  assert.match(code.alt, /│  │  ■ \(Distance ≤ 26\).*［a］[\s\S]*│  │  │  ■ \(Fitnum ＜ Distance\)/);
  assert.deepEqual([...html(code).matchAll(/data-source-blank="([a-d])"/g)].map(match => match[1]), ['a','b','c','d']);
  const decomp = panel(body, '-8-decompress-program');
  assert.match(decomp.alt, /Clength，\n {28}文字型：Plaindata/);
  assert.match(html(decomp), /data-alpha-region="" aria-label="αの部分".*border:1px dashed var\(--diagram-ink\)/);
  assert.match(html(decomp), /data-source-blank="e"/);
  assert.match(html(panel(generated(5)[0], '-5-program-numbered')), /⑨ • func4\(\)\n│  │     • exit[\s\S]*⑩ • func5\(\)/);
});
