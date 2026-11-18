import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { spring2006Pm10To13Specs as specs } from '../../../scripts/legacy-2006-spring-pm-10-13-specs';
import { dictionaryFigure, autocompleteFigure } from '../../../src/core/generators/legacy-2006-spring-pm-10';
import { countedTrip, timeTableChanges } from '../../../src/core/generators/legacy-2006-spring-pm-11';
import { solitaireFigure } from '../../../src/core/generators/legacy-2006-spring-pm-12';
import { legacy2006SpringPm1013FigureRenderers as renderers } from '../../../src/ui/Legacy2006SpringPm1013Figures';
import { dictionaryInputs, gridPairs, intervalTrip, officialLanguageKeys, railInputs, searchWords, solitaireInputs }
  from '../../fixtures/legacy-2006-spring-pm-language-reference';
import { assembleArithmetic } from '../../fixtures/legacy-2006-spring-pm-casl-reference';

const cases = [0, 1, 2, 3];
const kana = 'アイウエオカキク';
function checks(body: GeneratedBody) {
  assert(body.answerParts && body.partAnswers);
  return body.answerParts.map(part => {
    const answer = body.partAnswers!.find(answer => answer.kind === 'choice' && answer.partId === part.id);
    assert(answer && answer.kind === 'choice');
    const options = part.choiceIds.map(choiceId => {
      const index = Number(choiceId.split('-').at(-1)) - 1;
      const block = body.choices[index][0];
      assert(block.type === 'code' || block.type === 'paragraph');
      return block.text;
    });
    assert.equal(new Set(options).size, options.length);
    const selected = part.choiceIds.indexOf(answer.choiceId);
    assert(selected >= 0);
    return { part: part.id, options, selected, text: options[selected] };
  });
}

function codeBlocks(body: GeneratedBody) {
  return body.prompt.filter((block): block is Extract<Block,{type:'code'}> => block.type === 'code').map(block => block.text);
}

test('問10〜13は原資料18ページ、公式の21欄、原問と生成側の形式を保持する', () => {
  const pages = [39, 43, 48, 53, 57];
  for (const [i, spec] of specs.entries()) {
    assert.deepEqual(spec.pages, Array.from({ length: pages[i + 1] - pages[i] }, (_, n) => pages[i] + n));
    assert.equal(checks(spec.original).map(part => kana[part.selected]).join(''), officialLanguageKeys[spec.number as keyof typeof officialLanguageKeys]);
    assert.equal(spec.definition.sourceAnswer, officialLanguageKeys[spec.number as keyof typeof officialLanguageKeys]);
    assert(spec.pages.every(page => spec.originalPageAlt[page].length > 100 && spec.originalPageAlt[page].length <= 2000));
    const bodies = cases.map(index => spec.definition.build([index]));
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, 4);
    const partTemplate = checks(spec.original).map(part => [part.part, part.options.length]);
    for (const body of bodies) {
      assert.deepEqual(checks(body).map(part => [part.part, part.options.length]), partTemplate);
    }
    for (const values of [[], [-1], [4], [0.5], [0, 1]]) assert.throws(() => spec.definition.build(values));
  }
});

type SearchNode = { c: string; follow: SearchNode | null; other: SearchNode | null; trans: string | null };
function referenceLinks(terms: string[][]) {
  const words = new Map(terms.map(([word, translation]) => [word, translation]));
  const prefixes = [...new Set(terms.flatMap(([word]) => Array.from({ length: word.length }, (_, i) => word.slice(0, i + 1))))];
  const nodes = new Map(prefixes.map(prefix => [prefix,
    { c: prefix.at(-1), follow: null, other: null, trans: words.get(prefix) ?? null } as SearchNode]));
  for (const prefix of prefixes) {
    const node = nodes.get(prefix)!;
    const peers = prefixes.filter(other => other.length === prefix.length && other.slice(0, -1) === prefix.slice(0, -1));
    node.other = nodes.get(peers[peers.indexOf(prefix) + 1]) ?? null;
    node.follow = nodes.get(prefixes.find(other => other.length === prefix.length + 1 && other.startsWith(prefix)) ?? '') ?? null;
  }
  return nodes.get(prefixes[0])!;
}

function checkedPointer(p: SearchNode | null, path: string) {
  const elements = path.split('->').slice(1) as (keyof SearchNode)[];
  let value: SearchNode | string | null = p;
  for (const key of elements) {
    if (!value || typeof value === 'string') throw Error('NULL参照');
    value = value[key];
  }
  return value;
}
function checkPointerCondition(node: SearchNode | null, expression: string) {
  const match = /^(.+) (!=|==) NULL$/.exec(expression);
  assert(match);
  return (checkedPointer(node, match[1]) === null) === (match[2] === '==');
}

function runSearch(terms: string[][], input: string, keys: string[], autocomplete: boolean) {
  let p: SearchNode | null = referenceLinks(terms);
  let displayed = '', translation = '';
  try {
    for (const c of input) {
      if (!/^[a-z]$/.test(c)) break;
      translation = '';
      displayed += c;
      let cycles = 0;
      while (checkPointerCondition(p, keys[0]) && p!.c !== c) {
        p = checkedPointer(p, keys[1]) as SearchNode | null;
        if (++cycles > 12) throw Error('探索が循環');
      }
      if (checkPointerCondition(p, keys[2])) return { displayed, translation: '単語が見つかりません', failed: true };
      if (!p) throw Error('NULL参照');
      while (autocomplete && p.trans === null && checkPointerCondition(p, keys[4])) {
        p = p.follow!;
        displayed += p.c;
        if (++cycles > 12) throw Error('補完が循環');
      }
      translation = p.trans ?? '';
      p = checkedPointer(p, keys[3]) as SearchNode | null;
    }
    return { displayed, translation, failed: false };
  } catch {
    return null;
  }
}

test('問10は全解答候補を辞書の接頭辞フィルタリングと照合する', () => {
  for (const [i, { terms, initials }] of dictionaryInputs.entries()) {
    const body = specs[0].definition.build([i]), result = checks(body), correct = result.map(part => part.text);
    const letters = [...new Set(terms.flatMap(([word]) => [...word]))];
    const shortInputs = letters.flatMap(first => letters.flatMap(second => [first + second, ...letters.map(third => first + second + third)]));
    const probes = [...new Set(['', 'z', 'a', '!', ...shortInputs, ...initials, ...terms.flatMap(([word]) =>
      Array.from({ length: word.length }, (_, n) => word.slice(0, n + 1)).flatMap(prefix => [prefix, prefix + 'z', prefix + '!']))])];
    const trials = probes.flatMap(input => [false, true].map(autocomplete =>
      ({ input, autocomplete, expected: searchWords(terms, input, autocomplete) })));
    const passes = (keys: string[]) => trials.every(trial =>
      JSON.stringify(runSearch(terms, trial.input, keys, trial.autocomplete)) === JSON.stringify(trial.expected));
    assert(passes(correct));
    for (const [position, bank] of result.entries()) {
      assert.deepEqual(bank.options.map((option, j) => passes(correct.map((key, k) => k === position ? option : key)) ? j : -1)
        .filter(j => j >= 0), [bank.selected], '条件' + i + ' ' + bank.part);
    }
    assert(body.prompt.some(block => block.type === 'paragraph' && terms.every(([word]) => block.text.includes('“' + word + '”'))));
    const nodes: string[][] = [];
    const visit = (list: ReturnType<typeof dictionaryFigure.panel>['roots'], prefix: string) => {
      for (const node of list) {
        if (node.translation) nodes.push([prefix + node.letter, node.translation]);
        visit(node.children, prefix + node.letter);
      }
    };
    visit(dictionaryFigure.panel([i]).roots, '');
    assert.deepEqual(nodes.sort(), [...terms].sort());
    assert.deepEqual(autocompleteFigure.panel([i]).rows, initials.map(initial => [initial, searchWords(terms, initial, true).displayed]));
    assert(initials.every(initial => body.explanation.includes(searchWords(terms, initial, true).displayed)));
  }
});

function packTime(hour: number, minute: number) {
  return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
}

test('問11の到着前通過時刻と区間添字を各選択肢と比較する', () => {
  for (const [i, scenario] of railInputs.entries()) {
    const body = specs[1].definition.build([i]), parts = checks(body), sample = intervalTrip(scenario.start, scenario.finish, scenario.time, Array(9).fill(scenario.fixed));
    const diagram = countedTrip.panel([i]);
    const seen: (readonly [number, string, number])[] = [];
    const sections = [1, 2, 3, 4, -1, 9];
    let hour = 0;
    for (const row of diagram.rows) {
      if (row.title !== '' && row.title !== '…') hour = Number(row.title.slice(0, 2));
      row.cells.forEach((cell, k) => { if (cell.highlight) seen.push([hour, row.way, sections[k]]); });
    }
    assert.deepEqual(seen.sort(), sample.slice().sort());
    assert(body.explanation.includes('TIME-CNTが60以上'));
    const code = codeBlocks(body).join('\n');
    assert(code.includes('COMPUTE TIME-CNT = TIME-CNT + ' + scenario.fixed));
    const modification = timeTableChanges.panel([i]).rows[0][1];
    const durations = /TIME-DATA PIC X\(18\) VALUE "(\d+)"/.exec(modification)![1].match(/../g)!.map(Number);
    assert.deepEqual(durations, scenario.durations);
    const witnesses: { from: number; to: number; timeIdx: number; sectionIdx: number; timeCount: number; down: boolean }[] = [];
    for (let from = 1; from <= 10; from++) for (let to = 1; to <= 10; to++) if (from !== to) {
      for (const time of [360, 405, 419, 420, 474, 839, 921, 1320]) {
        const expected = intervalTrip(from, to, time, durations);
        let at = time;
        for (const [hour, direction, section] of expected) {
          assert.equal(Math.floor(at / 60), hour);
          witnesses.push({ from, to, timeIdx: hour - 5, sectionIdx: section + Number(direction === 'DOWN'),
            timeCount: at % 60, down: direction === 'DOWN' });
          at += durations[section - 1];
        }
      }
    }
    const comparator = (choice: string, from: number, to: number, t: number, h: number) => {
      switch (choice) {
        case 'IN-STATION < 5': return from < 5;
        case 'IN-STATION < OUT-STATION': return from < to;
        case 'IN-STATION > 5': return from > 5;
        case 'IN-STATION > OUT-STATION': return from > to;
        case 'TIME-CNT = 60': return t === 60;
        case 'TIME-CNT >= 60': return t >= 60;
        case 'TIME-IDX = 0': return h === 0;
        case 'TIME-IDX NOT = 0': return h !== 0;
      }
      throw Error(choice);
    };
    const evaluateIndex = (option: string, t: number, s: number) => option.split(',').map(item => {
      const matched = /^(TIME-IDX|SECT-IDX)(?: ([+-]) 1)?$/.exec(item);
      assert(matched);
      return (matched[1] === 'TIME-IDX' ? t : s) + (matched[2] === '+' ? 1 : matched[2] === '-' ? -1 : 0);
    });
    const accepted = (index: number, predicate: (choice: string) => boolean) => {
      const part = parts[index];
      assert.deepEqual(part.options.map((choice, j) => predicate(choice) ? j : -1).filter(j => j >= 0), [part.selected]);
    };
    accepted(0, choice => witnesses.every(({ from, to, timeCount, timeIdx }) =>
      comparator(choice, from, to, timeCount, timeIdx) === (from < to)));
    accepted(1, choice => witnesses.filter(example => example.down).every(({ timeIdx, sectionIdx }) =>
      String(evaluateIndex(choice, timeIdx, sectionIdx)) === String([timeIdx, sectionIdx - 1])));
    accepted(2, choice => witnesses.every(({ from, to, timeCount, timeIdx }) => {
      const after = timeCount + scenario.fixed;
      return comparator(choice, from, to, after, timeIdx) === (after >= 60);
    }));
    accepted(3, choice => witnesses.every(({ timeIdx, sectionIdx }) =>
      String(evaluateIndex(choice, timeIdx, sectionIdx)) === String([sectionIdx])));
    for (const partIndex of [4, 5]) accepted(partIndex, choice => witnesses.filter(w => w.down === (partIndex === 5)).every(w => {
      const expression = /^(60 -|TIME-CNT \+) SECT-MM\((.+)\)$/.exec(choice);
      assert(expression);
      const [source] = evaluateIndex(expression[2], w.timeIdx, w.sectionIdx);
      const minutes = durations[source - 1];
      const result = expression[1] === '60 -' ? 60 - minutes : w.timeCount + minutes;
      return result === w.timeCount + durations[w.sectionIdx - 1 - Number(w.down)];
    }));
    assert(code.includes('IN-HH - 5') && body.prompt.some(block => block.type === 'paragraph' && block.text.includes(packTime(Math.floor(scenario.time / 60), scenario.time % 60).replace(':', '時'))));
  }
});

test('問12は列の折返し、古いペアの優先順位、全候補の意味を検証する', () => {
  for (const [index, { width, cards }] of solitaireInputs.entries()) {
    const body = specs[2].definition.build([index]), figure = solitaireFigure.panel([index]), parts = checks(body);
    assert.equal(figure.width, width);
    assert.equal(gridPairs(cards.slice(0, -1), width).length, 0);
    let packed = [...cards];
    for (const board of figure.boards) {
      const pairs = gridPairs(packed, width);
      assert.deepEqual(board.values, packed);
      assert.deepEqual(board.chosen, pairs[0]);
      assert.deepEqual(board.alternatives, pairs.slice(1));
      if (pairs.length) packed = packed.filter((_, position) => !pairs[0].includes(position));
    }
    const code = codeBlocks(body).find(text => text.includes('class Game'))!;
    const relative = /indexDiff = \{\n([\s\S]+?)\n    \};/.exec(code)![1]
      .split('\n').map(row => [...row.matchAll(/\d+/g)].map(match => Number(match[0])));
    assert.equal(relative.length, width);
    assert(code.includes('indexDiff[currentIndex % ' + width + ']') && code.includes('currentIndex < list.size();\n'));
    for (const [column, offsets] of relative.entries()) {
      const coords = (position: number) => [Math.floor(position / width), position % width];
      const [r, c] = coords(column);
      const expected = Array.from({ length: 2 * width }, (_, j) => j).filter(j => {
        const [row, col] = coords(j);
        return j > column && Math.max(Math.abs(row - r), Math.abs(col - c)) === 1;
      }).map(j => j - column);
      assert.deepEqual(offsets, expected);
    }
    const accepted = (partIndex: number, compare: (option: string, j: number) => boolean) =>
      assert.deepEqual(parts[partIndex].options.map((option, j) => compare(option, j) ? j : -1).filter(j => j >= 0), [parts[partIndex].selected]);
    accepted(0, option => /^static \{$/.test(option));
    const register = [(i: number, j: number) => i * 13 + j, (i: number, j: number) => i * 13 + j - 1,
      (i: number, j: number) => i * 4 + j - 1, (i: number, j: number) => j * 13 + i,
      (i: number, j: number) => j * 13 + i - 1, (i: number, j: number) => j * 4 + i - 1];
    assert.deepEqual(parts[1].options, ['i * 13 + j', 'i * 13 + j - 1', 'i * 4 + j - 1', 'j * 13 + i', 'j * 13 + i - 1', 'j * 4 + i - 1']);
    accepted(1, (_, j) => {
      const addresses = Array.from({ length: 52 }, (_, n) => register[j](Math.floor(n / 13), n % 13 + 1));
      return new Set(addresses).size === 52 && addresses.every(address => address >= 0 && address < 52);
    });
    const adjacentIndexes = [
      (at: number, di: number, diff: number[]) => at * diff[di],
      (at: number, di: number, diff: number[]) => at + diff[di],
      (at: number, di: number, diff: number[]) => at - diff[di],
      (at: number, di: number, diff: number[]) => di * diff[at],
      (at: number, di: number, diff: number[]) => di + diff[at],
      (at: number, di: number, diff: number[]) => di - diff[at],
    ];
    assert.deepEqual(parts[2].options, ['currentIndex * diffList[i]', 'currentIndex + diffList[i]', 'currentIndex - diffList[i]',
      'i * diffList[currentIndex]', 'i + diffList[currentIndex]', 'i - diffList[currentIndex]']);
    accepted(2, (_, j) => Array.from({ length: 52 }, (_, at) => at).every(at =>
      relative[at % width].every((offset, di, diff) => adjacentIndexes[j](at, di, diff) === at + offset)));
    const ranges = [(a: number, b: number) => a !== b, (a: number, b: number) => a < b, (a: number, b: number) => a <= b,
      (a: number, b: number) => a === b, (a: number, b: number) => a > b, (a: number, b: number) => a >= b];
    assert.deepEqual(parts[3].options, ['!=', '<', '<=', '==', '>', '>='].map(symbol => 'adjacentIndex ' + symbol + ' list.size()'));
    accepted(3, (_, j) => [3, 4, 5].every(size => [2, 3, 4, 5, 6].every(at => ranges[j](at, size) === (at < size))));
    const survivors = [(i: number, j: number, n: number) => 0, (i: number, j: number, n: number) => j,
      (i: number, j: number, n: number) => j - 1, (i: number, j: number, n: number) => i,
      (i: number, j: number, n: number) => i - 1, (i: number, j: number, n: number) => n - 1];
    assert.deepEqual(parts[4].options, ['0', 'adjacentIndex', 'adjacentIndex - 1', 'currentIndex', 'currentIndex - 1', 'list.size() - 1']);
    accepted(4, (_, candidate) => {
      let observed = [...cards];
      for (const board of figure.boards) {
        if (String(observed) !== String(board.values)) return false;
        if (board.chosen) {
          const [i, j] = board.chosen;
          observed.splice(j, 1);
          const removeAt = survivors[candidate](i, j, observed.length);
          if (removeAt !== i) return false;
          observed.splice(removeAt, 1);
        }
      }
      return true;
    });
    assert(body.explanation.includes('横幅' + width + '枚'));
  }
});

test('問13はCASL IIの全候補を実行して32ビット整数モデルと比較する', () => {
  const operands = [0, 1, 2, 3, 0x100, 0x4000, 0x4001, 0x7fff, 0x8000, 0xc000, 0x8001, 0xffff];
  const words = [0, 1, 0x7fff, 0x8000, 0x10001, 0x20001, 0xffff, 0xfffeffff, 0xffffffff, 0x55555555, 0xaaaaaaaa];
  const target = (mode: 'add' | 'mul', n: number, m: number) =>
    Number((mode === 'add' ? BigInt(n) + BigInt(m) : BigInt(n) * BigInt(m)) & 0xffffffffn);
  for (const i of cases) {
    const body = specs[3].definition.build([i]), parts = checks(body);
    const code = codeBlocks(body), trialKeys = { a: parts[0].text, b: parts[1].text, 設問2: parts[2].text };
    const core = [code[0], code[1]];
    const extend = (lines: string[]) => [lines[0], lines[1]
      .replace(/^\s*10  .*\n\s*11  .*$/m, code[2])
      .replace(/^\s*16  .*\n\s*17  .*$/m, code[3])];
    const exact = assembleArithmetic([...core, code[4]], trialKeys);
    const match = (result: ReturnType<typeof exact>, expected: number) => result?.word === expected && result.preserved;
    for (const [position, key] of ['a', 'b', '設問2'].entries()) {
      const valid = parts[position].options.map((value, j) => {
        const run = assembleArithmetic(key === '設問2' ? extend(core) : core, { ...trialKeys, [key]: value });
        const operation = key === 'b' ? 'ADD32' : 'MULT32';
        const testedOperands = key === 'b' ? words : key === 'a' ? operands.filter(v => v <= 0x7fff) : operands;
        return words.every(n => testedOperands.every(m => match(run(operation, n, m), target(key === 'b' ? 'add' : 'mul', n, m)))) ? j : -1;
      }).filter(j => j >= 0);
      assert.deepEqual(valid, [parts[position].selected], key);
    }
    const n = Number(body.prompt.filter(block => block.type === 'paragraph').at(-1)!.text.match(/^F\((\d+)\)/)![1]);
    assert.equal(n, [3, 2, 4, 5][i]);
    for (let input = 1; input <= 12; input++) {
      const expected = Array.from({ length: input }, (_, j) => j + 1).reduce((total, j) => total * j, 1);
      const result = exact('FACT', 0, input);
      assert(match(result, expected));
      if (input === n) {
        assert.deepEqual(parts[3].options.map(Number), [1, 2, 3, 4, 5, 6]);
        assert.equal(Number(parts[3].text), result!.entries);
        assert.equal(Number(parts[4].text), result!.terminalReturns);
      }
    }
    assert.equal(body.contexts?.[0].blocks.length, 6);
    assert(body.contexts?.[0].blocks.some(block => block.type === 'image' && block.assetId.endsWith('059-casl-excerpt')));
  }
});

test('問10〜12の全生成図は出題に必要なラベル、名前と説明を持つ', () => {
  for (const spec of specs) for (const i of cases) {
    const body = spec.definition.build([i]);
    for (const block of body.prompt) {
      if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
      const scene = block.scene;
      const renderer = renderers.find(item => item.profile === scene.profile);
      assert(renderer);
      const html = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values: [...scene.values] }));
      assert(html.includes('class="diagram-scroll" tabindex="0"'));
      assert(html.includes('role="img"') && html.includes('<title') && html.includes('<desc'));
      assert(html.includes(block.caption) && !/undefined|NaN|Infinity/.test(html));
    }
  }
});
