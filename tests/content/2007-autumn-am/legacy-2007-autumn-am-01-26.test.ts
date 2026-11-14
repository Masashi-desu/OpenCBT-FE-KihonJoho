import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import { validateFormula } from '../../../src/core/validation';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2007AutumnAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2007-autumn-am-01-26';
import { legacy2007AutumnAm0126Figures as figureDefinitions } from '../../../src/core/generators/legacy-2007-autumn-am-01-26-figures';
import source from '../../../src/core/generators/legacy-2007-autumn-am-01-26-source.json';
import { legacy2007AutumnAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2007AutumnAm0126Figures';
import { concepts, paperAnswers, paperPages } from '../../fixtures/legacy-2007-autumn-am-01-26-facts';

const conditions = [0, 1, 2, 3];
const definition = (question: number) => definitions.find(item => item.source === '2007h19a-fe-am-' + question)!;
const build = (question: number, index: number) => definition(question).build([index]);
const blockText = (blocks: readonly Block[]) => blocks.flatMap(block => 'text' in block ? [block.text] : 'alt' in block ? [block.alt] : []).join('\n');
const options = (body: GeneratedBody) => body.choices.map(blockText);
const stem = (body: GeneratedBody) => blockText(body.prompt);
const asNumber = (text: string) => Number(text.replaceAll(',', ''));
const visibleTable = (blocks: readonly Block[]) => {
  const table = blocks.find(block => block.type === 'table');
  assert(table);
  return table;
};
const diagram = (blocks: readonly Block[]) => {
  const figure = blocks.find(block => block.type === 'diagram');
  assert(figure);
  return figure;
};
function unique(body: GeneratedBody, correct: (index: number) => boolean) {
  assert.deepEqual(body.choices.flatMap((_, i) => correct(i) ? [i] : []), [body.correctIndex]);
}

test('原紙面と全26問の公式キー、4条件の入力域・表示・一意な構成を照合する', () => {
  assert.equal(definitions.length, 26);
  assert.deepEqual(source.map(row => row.printedPage), paperPages);
  assert.equal(source.map(row => row.sourceKey).join(''), paperAnswers);
  for (const [number, item] of definitions.entries()) {
    const question = number + 1;
    assert.equal(item.sourceAnswer, paperAnswers[number], String(question));
    for (const invalid of [[], [4], [-1], [0.5], [0, 1], Array<number>(1)]) {
      assert.throws(() => item.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
    }
    const builds = conditions.map(index => build(question, index));
    assert.equal('アイウエ'[builds[0].correctIndex!], paperAnswers[number], String(question));
    assert.equal(new Set(builds.map(body => JSON.stringify(body.prompt))).size, 4, String(question));
    for (const body of builds) {
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(choice => JSON.stringify(choice))).size, 4);
      assert(body.explanation.trim(), String(question));
    }
  }
});

test('問1・2・3は各桁の重み、非負入力の全候補、負数表現の復号を独立に照合する', () => {
  for (const index of conditions) {
    const hex = build(1, index);
    const digit = stem(hex).match(/0\.([\dA-F])/)![1];
    const digitValue = '0123456789ABCDEF'.indexOf(digit);
    unique(hex, i => digitValue === 16 * asNumber(options(hex)[i]));
    const multiple = build(2, index);
    const factor = Number(stem(multiple).match(/(\d+)倍/)!?.[1]);
    const n = 'b₁b₂…bₙ';
    const terms = (expr: string, value: number) => expr.replaceAll(n, 'B').split(/(?=[＋−])/).map(term => {
      const sign = term.startsWith('−') ? -1 : 1;
      const digits = term.replace(/^[＋−]/, '').replace('B', value.toString(2));
      return sign * Number.parseInt(digits, 2);
    }).reduce((total, value) => total + value);
    unique(multiple, i => Array.from({ length: 256 }, (_, k) => k)
      .every(k => terms(options(multiple)[i], k) === factor * k));
    const negative = build(3, index);
    const bits = stem(negative).match(/パターン([01]{4})/)![1];
    const reverse = bits.replace(/[01]/g, bit => bit === '1' ? '0' : '1');
    const decoded: Record<string, number> = {
      a: -Number.parseInt(reverse, 2), b: -(Number.parseInt(reverse, 2) + 1), c: -Number.parseInt(bits.slice(1), 2),
    };
    unique(negative, i => {
      const [first, second, third] = options(negative)[i].split('，').map(mark => decoded[mark]);
      return first < second && second < third;
    });
  }
});

test('問5・6は計算時間の比例関係と、順序付きの玉の抽出を独立に数える', () => {
  for (const index of conditions) {
    const system = build(5, index);
    const [start, given, speed, end] = Array.from(stem(system).matchAll(/([\d,]+)(?:元|秒|倍)/g), match => asNumber(match[1])).slice(0, 4);
    const asGrid = (width: number) => width * width * width;
    unique(system, i => asNumber(options(system)[i]) * speed * asGrid(start) === given * asGrid(end));
    assert.deepEqual(options(system).map(asNumber), [...options(system).map(asNumber)].sort((a, b) => a - b));

    const draw = build(6, index);
    const [white, red, color] = stem(draw).match(/白玉(\d+)個，赤玉(\d+)個.+2個とも([白赤])/u)!.slice(1);
    const balls = [...Array(Number(white)).fill('白'), ...Array(Number(red)).fill('赤')];
    const samples = balls.flatMap((first, i) => balls.flatMap((second, j) => i === j ? [] : [first === color && second === color]));
    const desired = samples.filter(Boolean).length;
    unique(draw, i => {
      const block = draw.choices[i][0];
      assert(block.type === 'formula');
      const [n, d] = block.alt.split('/').map(Number);
      return n * samples.length === d * desired;
    });
  }
});

test('問8・9は二集合の全所属パターンと、二つの論理和の全真理値を照合する', () => {
  const setParser = (expression: string, a: boolean, b: boolean) => {
    const symbols: Record<string, boolean> = { A: a, B: b, 'A̅': !a, 'B̅': !b };
    const [left, op, right] = expression.replace(/[()]/g, '').trim().split(' ');
    return op === '∩' ? symbols[left] && symbols[right] : op === '∪' ? symbols[left] || symbols[right] : symbols[left];
  };
  const membership = [[false, false], [false, true], [true, false], [true, true]];
  for (const index of conditions) {
    const inclusion = build(8, index), context = stem(inclusion);
    const allowed = membership.filter(([a, b]) => {
      if (context.includes('A ⊆ B とする')) return !a || b;
      if (context.includes('空集合である')) return !(a && b);
      if (context.includes('全体集合である')) return a || b;
      return true;
    });
    unique(inclusion, i => {
      const [left, right] = options(inclusion)[i].split(' ⊆ ');
      return allowed.every(([a, b]) => !setParser(left, a, b) || setParser(right, a, b));
    });

    const logic = build(9, index), prompt = stem(logic);
    const p = prompt.match(/P の真理値は([真偽])/)![1] === '真';
    const expressions = Array.from(prompt.matchAll(/((?:\(not [PQR]\)|[PQR]) or (?:\(not [PQR]\)|[PQR]))/g), match => match[1]).slice(0, 2);
    assert.equal(expressions.length, 2);
    unique(logic, i => {
      const [q, r] = visibleTable(logic.choices[i]).rows[0].map(word => word === '真');
      const truth: Record<string, boolean> = { P: p, Q: q, R: r };
      return expressions.every(expr => expr.split(' or ').some(atom => atom.startsWith('(') ? !truth[atom.at(-2)!] : truth[atom]));
    });
  }
});

test('問10・11は遷移の逐次実行と、探索方式の増加率から全候補を分類する', () => {
  for (const index of conditions) {
    const item = build(10, index), table = visibleTable(item.prompt), prompt = stem(item);
    const input = [...prompt.matchAll(/t[1-4]/g)].map(match => match[0]);
    const transitions = new Map(table.rows.map(row => [row[0], Object.fromEntries(table.columns.slice(1).map((name, j) => [name, row[j+1] || name]))]));
    const start = prompt.match(/状態が (S\d)/)![1];
    const end = input.reduce((state, signal) => transitions.get(signal)![state], start);
    unique(item, i => options(item)[i] === end);
    assert(item.explanation.includes(end + ' となる。'));

    const algorithms = build(11, index);
    const decode = (name: string) => {
      if (/2分探|平衡/.test(name)) return 'log₂n';
      if (/ハッシュ|先頭を照合/.test(name)) return '1';
      assert(/線形|リスト/.test(name));
      return 'n';
    };
    unique(algorithms, i => {
      const { columns, rows } = visibleTable(algorithms.choices[i]);
      return rows[0].every((complexity, j) => complexity === decode(columns[j]));
    });
  }
});

test('問12・13は木の紙面構造の走査と、全短い配列操作で入出力順を検証する', () => {
  const children = [
    { '＋': ['a', '＊'], '＊': ['−', 'd'], '−': ['b', 'c'] },
    { '−': ['＋', 'd'], '＋': ['a', '＊'], '＊': ['b', 'c'] },
    { '＊': ['−', 'd'], '−': ['＋', 'c'], '＋': ['a', 'b'] },
    { '＋': ['−', '＊'], '−': ['a', 'b'], '＊': ['c', 'd'] },
  ] as const;
  const operations = [
    ['p = p＋1', 'A[p] = x', 'x = A[p]', 'p = p−1'],
    ['A[p] = x', 'p = p＋1', 'p = p−1', 'x = A[p]'],
    ['p = p−1', 'A[p] = x', 'x = A[p]', 'p = p＋1'],
    ['A[p] = x', 'p = p＋1', 'x = A[q]', 'q = q＋1'],
  ];
  const sequences = Array.from({ length: 64 }, (_, i) => Array.from({ length: 6 }, (_, j) => (i & (1 << j)) === 0));
  for (const index of conditions) {
    const tree = build(12, index), edges: Record<string, readonly string[]> = children[index];
    const pending: [string, boolean][] = [[Object.keys(edges)[0], false]];
    const written: string[] = [];
    while (pending.length) {
      const [node, visited] = pending.pop()!;
      if (visited || !(node in edges)) { written.push(node); continue; }
      pending.push([node, true], [edges[node][1], false], [edges[node][0], false]);
    }
    unique(tree, i => options(tree)[i] === written.join(''));
    assert(diagram(tree.prompt).alt.startsWith('根：' + Object.keys(edges)[0]));

    const array = build(13, index);
    for (const operation of operations[index]) assert(stem(array).includes(operation));
    const applicable = options(array).map(label => {
      if (label === 'ハッシュ' || label === 'ヒープ') return false;
      return sequences.every(sequence => {
        let p = index === 2 ? 9 : 0, q = 0;
        const actual = new Map<number, number>(), expected: number[] = [];
        for (const [j, insert] of sequence.entries()) {
          if (insert) {
            expected.push(j);
            if (index === 0 || index === 2) p += index === 0 ? 1 : -1;
            actual.set(p, j);
            if (index === 1 || index === 3) p++;
          } else if (expected.length) {
            if (index === 1) p--;
            const read = actual.get(index === 3 ? q++ : p);
            if (index === 0 || index === 2) p += index === 0 ? -1 : 1;
            if (read !== (label === 'キュー' ? expected.shift() : expected.pop())) return false;
          }
        }
        return true;
      });
    });
    unique(array, i => applicable[i]);
  }
});

test('問14・15は両整列方向・添字基準の探索の全候補と、約数の全列挙で検算する', () => {
  for (const index of conditions) {
    const body = build(14, index), desc = /降順/.test(stem(body)), zero = /0から/.test(stem(body));
    assert(diagram(body.prompt).alt.includes(zero ? '0→lo' : '1→lo'));
    unique(body, i => {
      const rule = visibleTable(body.choices[i]).rows[0];
      return [[1], [1, 3], [0, 1, 2, 5, 8], [1, 1, 1, 2, 3, 3]].every(raw => {
        const numbers = desc ? [...raw].reverse() : raw, base = zero ? 0 : 1;
        return [-1, 0, 1, 2, 3, 4, 5, 6, 8, 10].every(target => {
          let low = base, high = base + numbers.length - 1;
          for (let step = 0; step <= numbers.length; step++) {
            const middle = Math.floor((low + high) / 2), actual = numbers[middle - base];
            if (low > high) return !numbers.includes(target);
            if (actual === undefined) return false;
            if (actual === target) return true;
            const operation = rule[actual < target ? 0 : 1], update = middle + (operation.includes('＋') ? 1 : -1);
            if (operation.endsWith('lo')) low = update; else high = update;
          }
          return false;
        });
      });
    });
    const gcd = build(15, index);
    const formula = gcd.prompt.find(block => block.type === 'formula');
    assert(formula && formula.format === 'latex');
    assert.doesNotThrow(() => validateFormula(formula.text));
    assert.deepEqual(Array.from(formula.text.matchAll(/&\(([^)]+)\)/g), match => match[1]), ['y=0', 'y>0']);
    assert.match(formula.alt, /y＝0 なら x、y＞0 なら F\(y, x mod y\)/);
    const [x, y] = stem(gcd).match(/F\((\d+),\s*(\d+)\)/)!.slice(1).map(Number);
    const largest = Array.from({ length: y }, (_, i) => i + 1).filter(d => x % d === 0 && y % d === 0).at(-1);
    unique(gcd, i => asNumber(options(gcd)[i]) === largest);
    assert(gcd.explanation.includes('F(' + largest + ', 0)'));
  }
});

test('問17・18は論理回路の全入力と、番地の値・参照元を図の代替テキストで検証する', () => {
  const byGate: Record<string, (x: boolean, y: boolean) => boolean> = {
    AND: (x, y) => x && y, OR: (x, y) => x || y, NAND: (x, y) => !(x && y), NOR: (x, y) => !(x || y),
  };
  const requirements = [(x: boolean, y: boolean) => x === y, (x: boolean, y: boolean) => x !== y, () => false, () => true];
  for (const index of conditions) {
    const body = build(17, index);
    assert.match(diagram(body.prompt).alt, /NAND又はNOR.*NOT/);
    unique(body, i => {
      const diagramDescription = diagram(body.choices[i]).alt;
      const [, first, second, last] = diagramDescription.match(/上段の(\w+)に.*下段の(\w+)に.*最終段の(\w+)に/)!;
      return [false, true].every(x => [false, true].every(y =>
        byGate[last](byGate[first](x, y), byGate[second](!x, !y)) === requirements[index](x, y)));
    });
    const item = build(18, index), alt = diagram(item.prompt).alt;
    const [reg, address, value, effective] = [
      alt.match(/番号：(\d+)/)?.[1], alt.match(/定数：(\d+)/)?.[1], alt.match(/値は(\d+)/)?.[1], alt.match(/主記憶の(\d+)/)?.[1],
    ].map(s => s === undefined ? 0 : Number(s));
    assert.equal(address + value, effective);
    const mode = alt.includes('プログラムカウンタ') ? '相対' : reg ? address ? '指標付き' : 'レジスタ間接' : '直接';
    unique(item, i => options(item)[i].startsWith(mode));
    assert(item.explanation.endsWith(effective + 'である。'));
  }
});

test('問19・21は命令1万個の時間と、ヒット率の全候補を重み付き実行回数で計算する', () => {
  for (const index of conditions) {
    const body = build(19, index);
    const [GHz, cycles] = stem(body).match(/([\d.]+)GHz.+平均([\d.]+)クロック/)!.slice(1).map(Number);
    unique(body, i => Math.abs(asNumber(options(body)[i]) * 10_000 * cycles - GHz * 1e9) < 1);
    const cache = build(21, index);
    const [, cacheA, cacheB] = visibleTable(cache.prompt).rows[0].map(asNumber);
    const [, memoryA, memoryB] = visibleTable(cache.prompt).rows[1].map(asNumber);
    unique(cache, i => {
      const hits = 10 * asNumber(options(cache)[i]), misses = 10 - hits;
      return hits * cacheA + misses * memoryA === hits * cacheB + misses * memoryB;
    });
  }
});

test('概念問題の全候補は定義を照合した命題に対応し、解説に区別の理由がある', () => {
  for (const [question, facts] of Object.entries(concepts)) {
    assert.equal(facts.length, conditions.length);
    for (const [index, fact] of facts.entries()) {
      const body = build(Number(question), index), choices = options(body);
      assert.match(stem(body), fact.target);
      unique(body, i => fact.correct.test(choices[i]));
      assert.match(body.explanation, fact.cause);
      const incorrect = choices.filter((_, i) => i !== body.correctIndex);
      for (const reject of fact.reject) assert.equal(incorrect.filter(choice => reject.test(choice)).length, 1, question + '-' + index + ' ' + reject);
    }
  }
});

test('全17図について管理描画・代替説明の対応をSSRで照合する', () => {
  let count = 0;
  for (const { profile, component } of renderers) {
    const figure = figureDefinitions.find(item => item.profile === profile);
    assert(figure);
    const [[first, last]] = figure.domain;
    for (let input = first; input <= last; input++) {
      const markup = renderToStaticMarkup(createElement(component, { caption: '原形式', values: [input] }));
      assert.match(markup, /role="img"/);
      assert.match(markup, /aria-describedby=/);
      assert.match(markup, /tabindex="0"/i);
      assert(markup.includes(figure.alt([input])));
      assert(!markup.includes('NaN'));
      if (profile.endsWith('-gate')) {
        assert.equal((markup.match(/data-gate="NOT"/g) ?? []).length, 2);
        assert.equal((markup.match(/data-gate="/g) ?? []).length, 5);
      }
      count++;
    }
  }
  assert.equal(count, 17);
});
