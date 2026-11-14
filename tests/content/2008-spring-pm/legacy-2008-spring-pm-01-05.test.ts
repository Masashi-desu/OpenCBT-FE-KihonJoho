import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2008SpringPm01To05Definitions as definitions } from '../../../src/core/generators/legacy-2008-spring-pm-01-05';
import { legacy2008SpringPm0105Figures as figures } from '../../../src/core/generators/legacy-2008-spring-pm-01-05-figures';
import { legacy2008SpringPm0105FigureRenderers as renderers } from '../../../src/ui/Legacy2008SpringPm0105Figures';
import { spring2008Pm01To05Specs } from '../../../scripts/legacy-2008-spring-pm-01-05-specs';
import review from '../../fixtures/legacy-2008-spring-pm-01-05-review.json';

const marks = 'アイウエオカキクケコ';
const build = (major: number, index: number) => definitions[major - 1].build([index]);
const eachCase = [0, 1, 2, 3];
const ownChoices = (body: GeneratedBody, index: number) => {
  const part = body.answerParts?.[index], answer = body.partAnswers?.[index];
  assert(part && answer?.kind === 'choice');
  const options = part.choiceIds.map(id => {
    const [block] = body.choices[Number(id.split('-').at(-1)) - 1];
    assert(block.type === 'paragraph' || block.type === 'code');
    return block.text;
  });
  return { part, answer, options };
};
function pass(body: GeneratedBody, partIndex: number, valid: (text: string) => boolean) {
  const { part, answer, options } = ownChoices(body, partIndex);
  const actual = options.flatMap((option, i) => valid(option) ? [part.choiceIds[i]] : []);
  assert.deepEqual(actual, [answer.choiceId], part.id + ': ' + options.join(' ｜ '));
}
const text = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
function diagram(body: GeneratedBody, name: string) {
  return body.prompt.filter((block): block is Extract<Block, { type: 'diagram' }> =>
    block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith(name));
}
function numbers(line: string) { return [...line.matchAll(/\d+(?:\.\d+)?/g)].map(match => Number(match[0])); }
function shape(body: GeneratedBody) {
  return {
    blocks: body.prompt.map(block => block.type === 'diagram' && block.scene.kind === 'source_figure' ? [block.type, block.scene.profile] : block.type),
    banks: body.choices.map(option => option.map(block => block.type)), parts: body.answerParts, contexts: body.contexts,
  };
}

test('公式の五大問・全25欄・原頁対応と、各四条件の問題・解答群構造を照合する', () => {
  assert.equal(review.questions.reduce((sum, question) => sum + question.parts.length, 0), 25);
  for (const { number, pages, marks: expected, parts, bankSizes } of review.questions) {
    const spec = spring2008Pm01To05Specs[number - 1], reference = build(number, 0);
    assert.deepEqual(spec.pages, pages);
    for (const page of pages) assert(spec.originalPageAlt?.[page]?.length > 75, 'p.' + page);
    assert.deepEqual(spec.definition.reference, [0]);
    assert.deepEqual(reference.answerParts?.map(part => part.id), parts.map(part => 'part-' + part));
    assert.equal(parts.map((_, i) => {
      const { part, answer } = ownChoices(reference, i);
      return marks[part.choiceIds.indexOf(answer.choiceId)];
    }).join(''), expected);
    for (const condition of eachCase) {
      const body = build(number, condition);
      assert.deepEqual(shape(body), shape(reference));
      assert.deepEqual(parts.map((_, i) => ownChoices(body, i).options.length), bankSizes);
      for (let i = 0; i < parts.length; i++) {
        const { options } = ownChoices(body, i);
        assert.equal(new Set(options).size, options.length, number + ': ' + i + '/' + condition);
      }
      assert(body.explanation.length > 40);
    }
    assert.equal(new Set(eachCase.map(index => JSON.stringify(build(number, index).prompt))).size, 4);
    for (const invalid of [[], [-1], [4], [0.5], [0, 1], Array<number>(1)])
      assert.throws(() => definitions[number - 1].build(invalid), /PARAMETER_CONSTRAINT/);
  }
  assert.equal(spring2008Pm01To05Specs[1].definition.fixedReferenceAssetIds?.length, 2);
  assert.equal(spring2008Pm01To05Specs[3].definition.fixedReferenceAssetIds?.length, 2);
});

test('問1の全欄について、半回転・転送・時間差とヒット／ミスの時間を原単位から求める', () => {
  for (const index of eachCase) {
    const body = build(1, index), source = text(body);
    const table = body.prompt.find(block => block.type === 'table');
    assert(table?.type === 'table');
    assert.match(source, /1Gバイト＝1,000Mバイト，1Mバイト＝1,000kバイト/);
    assert.equal([...source.matchAll(/小数第2位以下を切り捨てる/g)].length, 2);
    const values = table.rows.map(row => row.slice(1).map(value => Number(value.replaceAll(',', '').match(/^\d+(\.\d+)?/)?.[0])));
    const loadKb = Number(source.match(/(\d+)kバイトのデータを転送する時間は［b］/)?.[1]);
    const [, rotations, seek, transfer] = values;
    const truncate = (v: number) => Math.floor(10 * v + 1e-7) / 10;
    const waitA = 60000 / rotations[0] / 2, writeA = loadKb * 1000 / (transfer[0] * 1000000) * 1000;
    const [, waitB, writeB] = source.match(/平均回転待ち時間が([.\d]+)ミリ秒であり，\d+kバイトのデータを転送する時間が([.\d]+)ミリ秒/)!.map(Number);
    assert.equal(waitB, truncate(60000 / rotations[1] / 2));
    assert.equal(writeB, truncate(loadKb / transfer[1]));
    const [, lookup, hit, fast, slow] = source.match(/ディスクキャッシュを検索する平均時間は([.\d]+)ミリ秒，ディスクキャッシュの平均ヒット率は([.\d]+)，ディスクキャッシュからの1ブロック当たりのデータの平均読取り時間は([.\d]+)ミリ秒[^\n]+時間も含めて([.\d]+)ミリ秒/)!.map(Number);
    const trials = Array.from({ length: 10 }, (_, i) => lookup + (i < hit * 10 ? fast : slow));
    const actual = [waitA, writeA, seek[0] + waitA + writeA - seek[1] - waitB - writeB, trials.reduce((sum, time) => sum + time, 0) / trials.length];
    actual.forEach((value, part) => pass(body, part, option => Number(option) === truncate(value)));
    for (const part of [0, 3]) {
      const valuesInBank = ownChoices(body, part).options.map(Number);
      assert.deepEqual(valuesInBank, [...valuesInBank].sort((a, b) => a - b));
    }
  }
});

const stringsOver = (n: number): string[] => Array.from({ length: 2 ** n }, (_, index) => index.toString(2).padStart(n, '0'));
const pairs = Array.from({ length: 6 }, (_, i) => stringsOver(i + 1)).flat().flatMap(input =>
  Array.from({ length: input.length }, (_, i) => stringsOver(i + 1)).flatMap(patterns => patterns.map(pattern => [input, pattern] as const)));

function search(text: string, pattern: string, base: number, bound: string, equality: string, branch: string | undefined) {
  let count = 0, i = base, watch = 0;
  while (true) {
    const alternatives = [i + pattern.length <= text.length + base, i + pattern.length < text.length + base,
      i + text.length <= pattern.length, i + text.length < pattern.length];
    const comparison = bound.includes('Textlen ≦ Patlen') ? 2 : bound.includes('Textlen < Patlen') ? 3 : bound.includes(' ≦ ') ? 0 : 1;
    if (!alternatives[comparison]) return count;
    if (++watch > text.length + 1) return NaN;
    let j = i, k = base;
    for (; k < pattern.length + base; j++, k++) {
      const indices = equality.match(/SourceText\[(\w+)\] = Pattern\[(\w+)\]/)!.slice(1);
      const indicesByName: Record<string, number> = { i, j, k };
      const one = text[indicesByName[indices[0]] - base], other = pattern[indicesByName[indices[1]] - base];
      if (one === undefined || other === undefined) return NaN;
      if (one !== other) break;
    }
    const matches = k === pattern.length + base;
    if (matches) count++;
    if (!branch) { i++; continue; }
    const [success, failure] = branch.split('\n├\n');
    const after = branch.split('\n▼\n')[1];
    const chosen = after ?? (matches ? success.split('\n').at(-1) : failure?.split('\n')[0]);
    i += chosen?.includes('i + Patlen') ? pattern.length : chosen?.includes('i + 1') ? 1 : 0;
  }
}
const overlapping = (text: string, pattern: string) => [...text].filter((_, offset) => text.slice(offset, offset + pattern.length) === pattern).length;
const nonOverlapping = (text: string, pattern: string) => text.split(pattern).length - 1;

test('問2の開始条件と比較式を二文字アルファベットの全入力、そしてαの四候補で反例まで検査する', () => {
  for (const condition of eachCase) {
    const body = build(2, condition), base = Number(text(body).match(/配列の添字は(\d)から/)?.[1]);
    const validBound = ownChoices(body, 0).options.find(option => option.includes('Patlen ≦ Textlen') || option.includes('Patlen ≦ (Textlen + 1)'))!;
    const properComparison = 'SourceText[j] = Pattern[k]';
    for (const [part, oracle] of [
      [0, (input: string, pattern: string, option: string) => search(input, pattern, base, option, properComparison, undefined) === overlapping(input, pattern)],
      [1, (input: string, pattern: string, option: string) => search(input, pattern, base, validBound, option, undefined) === overlapping(input, pattern)],
      [2, (input: string, pattern: string, option: string) => search(input, pattern, base, validBound, properComparison, option) === nonOverlapping(input, pattern)],
    ] as const) {
      pass(body, part, option => pairs.every(([input, pattern]) => oracle(input, pattern, option)));
    }
    const [drawing] = diagram(body, '-match');
    assert(drawing);
    const [, line, needle] = drawing.alt.match(/SourceText：([^。]+)。[^。]+。Pattern：([^。]+)。/) ?? [];
    const haystack = line.replaceAll('｜', ''), pattern = needle.replaceAll('｜', '');
    assert.equal(haystack.indexOf(pattern), 1);
    assert.match(drawing.alt, /二重下線/);
    assert(overlapping(haystack, pattern) > nonOverlapping(haystack, pattern));
  }
});

test('問3の曜日別更新集合からバックアップ・復旧時間と最大テープ本数を検算する', () => {
  for (const condition of eachCase) {
    const body = build(3, condition), source = text(body);
    const total = Number(source.match(/全体で(\d+)Gバイト/)?.[1]);
    const update = Number(source.match(/場所は不定で([.\d]+)Gバイト/)?.[1]);
    const speed = Number(source.match(/バックアップの速度は(\d+)Mバイト／秒/)?.[1]);
    const exchange = Number(source.match(/交換時間は(\d+)分/)?.[1]);
    assert.match(source, /最初の磁気テープをセットする時間と最後の磁気テープを取り出す時間は含まない/);
    const records = Array.from({ length: 6 }, (_, day) => new Set(['common', 'day-' + day]));
    const full = total * 1000 / speed / 60;
    const differential = records.map((_, day) => new Set(records.slice(0, day + 1).flatMap(set => [...set])).size * update * 1000 / speed / 60);
    const incremental = records.map(set => set.size * update * 1000 / speed / 60);
    const days = records.map((_, day) => day + 1);
    const result = [Math.max(...differential), incremental[0], Math.max(...days.map(() => 2)),
      Math.max(...days.map(day => day + 1)), Math.max(...differential.map(time => full + time + exchange))];
    assert(incremental.every(time => time === incremental[0]));
    assert.equal(Number(source.match(/フルバックアップに要する時間は(\d+)分/)?.[1]), full);
    result.forEach((value, part) => pass(body, part, option => Number(option) === value));
    assert.match(diagram(body, '-backup')[0].alt, new RegExp('更新領域（' + update.toFixed(1) + 'Gバイト）'));
  }
});

type ListState = { readonly read: (first: number) => number[]; next: Map<number, number>; first: number; size: number; readonly trace: string[] };
function linked(base: number, terms: readonly string[], selectA: string, changes: readonly string[], targets: readonly string[]) {
  const next = new Map<number, number>(), values = new Map<number, string>(), trace: string[] = [];
  let first = -1, size = 0;
  function read(start: number) {
    const result: number[] = [];
    for (let pointer = start; pointer !== -1; pointer = next.get(pointer) ?? -1) {
      if (result.includes(pointer) || !values.has(pointer)) throw Error('bad link');
      result.push(pointer);
    }
    return result;
  }
  for (const term of terms) {
    const newIndex = size + base;
    next.set(newIndex, -1);
    const expressions: Record<string, number> = { First: first, 'First + 1': first + 1, 'First − 1': first - 1,
      Listsize: size, 'Listsize + 1': size + 1, 'Listsize − 1': size - 1 };
    if (size) next.set(newIndex - 1, expressions[selectA]);
    else first = base;
    values.set(newIndex, term);
    size++;
  }
  const returned: number[] = [];
  for (const target of targets) {
    let current = first, temp = NaN, steps = 0;
    while (current !== -1) {
      if (++steps > terms.length || !values.has(current)) throw Error('bad traversal');
      if (values.get(current) === target) {
        if (current !== first) {
          const resolve = (expression: string) => {
            const locals: Record<string, number> = { Current: current, First: first, Temp: temp };
            const pointer = expression.match(/^List\[(\w+)\]\.Next$/)?.[1];
            return pointer ? next.get(locals[pointer]) ?? NaN : locals[expression];
          };
          const successor = next.get(current)!;
          const pointer = changes[0].match(/^List\[(\w+)\]\.Next$/)?.[1];
          if (pointer) {
            const locals: Record<string, number> = { Current: current, First: first, Temp: temp };
            next.set(locals[pointer], successor);
          } else {
            if (changes[0] === 'Current') current = successor;
            if (changes[0] === 'First') first = successor;
            if (changes[0] === 'Temp') temp = successor;
          }
          next.set(current, resolve(changes[1]));
          first = resolve(changes[2]);
        }
        break;
      }
      temp = current;
      trace.push(values.get(temp)!);
      current = next.get(current) ?? NaN;
    }
    returned.push(current);
  }
  const state: ListState = { first, size, next, read, trace };
  return { state, returned };
}

function listFigureTerms(alt: string) {
  return [...alt.matchAll(/\d+：[-\d]+，([a-z]+)。/g)].map(match => match[1]);
}
test('問4の配列とリンクを操作して、各空欄の全候補・実行直後の記録を独立に比較する', () => {
  for (const condition of eachCase) {
    const body = build(4, condition), source = text(body);
    const base = Number(source.match(/配列の添字は(\d)から/)?.[1]);
    const initial = diagram(body, '-list'), terms = listFigureTerms(initial[2].alt);
    assert.equal(terms.length, 5);
    const correctA = base === 0 ? 'Listsize' : 'Listsize + 1';
    pass(body, 0, option => {
      try {
        return [0, 1, 2, 3, 4, 5].every(length => {
          const { state } = linked(base, terms.slice(0, length), option, [], []);
          return JSON.stringify(state.read(state.first)) === JSON.stringify(terms.slice(0, length).map((_, i) => base + i));
        });
      } catch { return false; }
    });
    const changes = ['List[Temp].Next', 'First', 'Current'];
    for (const changeIndex of changes.keys()) {
      pass(body, 1 + changeIndex, option => {
        const proposal = changes.map((term, i) => i === changeIndex ? option : term);
        try {
          return ['unknown', ...terms].every(one => ['unknown', ...terms].every(two => {
            const requested = [one, two], expected = terms.map((_, i) => base + i);
            for (const query of requested) {
              const location = expected.indexOf(terms.indexOf(query) + base);
              if (terms.includes(query)) expected.unshift(...expected.splice(location, 1));
            }
            const { state, returned } = linked(base, terms, correctA, proposal, requested);
            return JSON.stringify(state.read(state.first)) === JSON.stringify(expected) &&
              JSON.stringify(returned) === JSON.stringify(requested.map(term => terms.includes(term) ? terms.indexOf(term) + base : -1));
          }));
        } catch { return false; }
      });
    }
    const targets = [...source.match(/図3に示すリストに対して，文字列 (.+) の順に探索/)![1].matchAll(/'([^']+)'/g)].map(match => match[1]);
    const { state } = linked(base, terms, correctA, changes, targets);
    pass(body, 4, option => option === state.trace.join(', '));
    for (const drawing of initial) {
      const indexes = [...drawing.alt.matchAll(/(\d+)：(-?\d+)，([a-z]+)/g)];
      const first = Number(drawing.alt.match(/First：(\d+)/)?.[1]);
      assert.equal(indexes.length, 5);
      const pointers = new Map(indexes.map(([, index, next]) => [Number(index), Number(next)]));
      const visited = new Set<number>();
      for (let pointer = first; pointer !== -1; pointer = pointers.get(pointer)!) {
        assert(pointers.has(pointer) && !visited.has(pointer));
        visited.add(pointer);
      }
      assert.equal(visited.size, 5);
    }
    const code = body.prompt.filter(block => block.type === 'code');
    assert.match(code[1].text, /│  │  │  ・［b］ ← List\[Current\]\.Next／?\n│  │  │  ・List\[Current\]\.Next ← ［c］/);
    assert.match(code[1].text, /・Temp ← Current +← α/);
  }
});

test('問5の全欄をレコード・集計例・順序・条件の真理値に照合する', () => {
  const initialFields = ['集計開始日付', '集計終了日付', '集計種別'];
  const available = {
    '構成比率の算出': ['構成比率'], '集計': ['合計した販売数', '合計した販売金額'],
    '順位の付与': ['順位'], '整列2': ['集計項目'], '整列3': ['合計後の整列順'],
  };
  for (const condition of eachCase) {
    const body = build(5, condition), source = text(body);
    const mainFlow = diagram(body, '-sale-flow')[0].alt, splice = diagram(body, '-sale-extension')[0].alt;
    const record = diagram(body, '-sale-record')[0].alt, interim = diagram(body, '-interim-records')[0].alt;
    const [, group, code] = source.match(/指定できる集計種別として(\S+)を追加し，(\S+)別販売構成一覧/) ?? [];
    const primary = source.match(/集計項目ごとに合計した(販売金額|販売数)の高い順に/)?.[1];
    assert(group && code && primary);
    assert.match(record, new RegExp(code));
    assert(!interim.includes(code) && interim.includes('中間ファイルB。左から集計項目，販売数，販売金額'));
    assert.match(mainFlow, /整列2→集計→中間ファイルC→整列3→順位の付与→中間ファイルE→構成比率の算出/);
    assert.match(splice, /［d］を判定。Yesでは［c］へ進む。Noでは整列1/);
    assert.match(source, /重複して選んでもよい/);

    pass(body, 0, option => JSON.stringify(option.split('，')) === JSON.stringify(initialFields));
    pass(body, 1, option => [['商品カテゴリ', '商品カテゴリ名'], ['メーカ', 'メーカコード']].every(([, name]) => {
      const activeField = option === '集計項目' ? name : option;
      return activeField === name && interim.includes('中間ファイルB。左から' + option);
    }));
    const [{ alt }] = diagram(body, '-sale-report');
    const rows = [...alt.matchAll(/[1-3]，([^。]+)。/g)].map(match => match[1]);
    assert.match(alt, /販売金額，販売数，構成比率/);
    assert.match(alt, /集計期間：\d{4}-\d\d-\d\d〜\d{4}-\d\d-\d\d/);
    assert(rows.length >= 2);
    pass(body, 2, option => option === '合計した' + primary);
    pass(body, 3, option => option === '中間ファイルBの様式への変換' && splice.includes('両枝は中間ファイルBの手前で合流'));
    const evaluate = (expression: string, input: string) => {
      const check = (term: string) => {
        const [, operator, value] = term.match(/集計種別([＝≠])“([^”]+)”/) ?? [];
        assert(operator && value);
        return operator === '＝' ? input === value : input !== value;
      };
      if (expression.includes('AND')) return expression.split('AND').every(check);
      if (expression.includes('OR')) return expression.split('OR').some(check);
      return check(expression);
    };
    pass(body, 4, option => ['商品カテゴリ', 'メーカ', group].every(input => evaluate(option, input) === (input === group)));

    const top = Number(source.match(/順位が(\d+)位まで/)?.[1]);
    const ratio = Number(source.match(/構成比率で(\d+)％以上/)?.[1]);
    assert.deepEqual([numbers(source.split('\n').find(line => line.startsWith('① 順位が'))!).at(-1),
      numbers(source.split('\n').find(line => line.startsWith('② 構成比率で'))!).at(-1)], [top, ratio]);
    pass(body, 5, option => available[option as keyof typeof available].includes('順位'));
    pass(body, 6, option => available[option as keyof typeof available].includes('構成比率'));
    pass(body, 7, option => {
      const steps = mainFlow.split('。')[0].split('→');
      return steps.indexOf(option) > steps.indexOf('順位の付与') && steps.indexOf(option) <= steps.indexOf('構成比率の算出');
    });
    assert.equal(ownChoices(body, 6).answer.choiceId, ownChoices(body, 7).answer.choiceId);
  }
});

test('問2〜5の全図と代替説明の対応、SVGの構造、キー下線・分岐ラベルを確認する', () => {
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  assert.equal(figures.length, 9);
  const drawn = new Set<string>();
  for (const condition of eachCase) for (const group of [2, 3, 4, 5]) {
    for (const block of diagram(build(group, condition), '')) {
      const { scene } = block;
      assert(scene.kind === 'source_figure');
      const definition = figures.find(figure => figure.profile === scene.profile);
      const renderer = renderers.find(entry => entry.profile === scene.profile);
      assert(definition && renderer);
      definition.validate(scene.values);
      assert.equal(definition.alt(scene.values), block.alt);
      const markup = renderToStaticMarkup(createElement(renderer.component, { values: scene.values, caption: block.caption }));
      assert.match(markup, /<svg[^>]+role="img"[^>]+aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
      const escaped = (value: string) => value.replaceAll('&', '&amp;').replaceAll('>', '&gt;')
        .replaceAll('<', '&lt;').replaceAll("'", '&#x27;').replaceAll('"', '&quot;');
      assert(markup.includes(escaped(block.caption)));
      assert(markup.includes(escaped(block.alt)));
      if (scene.profile.endsWith('-sale-record')) assert.equal([...markup.matchAll(/text-decoration="underline"/g)].length, 2);
      if (scene.profile.endsWith('-product-record')) assert.equal([...markup.matchAll(/text-decoration="underline"/g)].length, 1);
      if (scene.profile.endsWith('-sale-extension')) assert.match(markup, /Yes.*No/);
      drawn.add(scene.profile + scene.values.join(','));
    }
  }
  assert.equal(drawn.size, 32);
});
