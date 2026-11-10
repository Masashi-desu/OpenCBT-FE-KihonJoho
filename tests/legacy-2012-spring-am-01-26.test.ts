import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2012SpringAm01To26Definitions as definitions } from '../src/core/generators/legacy-2012-spring-am-01-26';
import { legacy2012SpringAm0126Figures as figures } from '../src/core/generators/legacy-2012-spring-am-01-26-figures';
import { legacy2012SpringAm0126FigureRenderers as renderers } from '../src/ui/Legacy2012SpringAm0126Figures';
import originals from '../src/core/generators/legacy-2012-spring-am-01-26-source.json';
import { knowledgeFacts } from './fixtures/legacy-2012-spring-am-01-26-facts';

const marks = 'アイウエ';
const official = 'ウアエイエイエイウイアウウアウアイイエウアイウウウウ';
const cases = (n: number) => {
  const definition = definitions[n - 1];
  return Array.from({ length: definition.fields[0].maximum + 1 }, (_, index) => definition.build([index]));
};
const prompt = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const options = (body: GeneratedBody) => body.choices.map(([block]) => {
  if (block.type === 'diagram') return block.alt;
  assert(block.type === 'paragraph' || block.type === 'formula');
  return block.text;
});
const matches = (body: GeneratedBody, predicate: (choice: string, index: number) => boolean) =>
  assert.deepEqual(options(body).flatMap((value, index) => predicate(value, index) ? [index] : []), [body.correctIndex]);

const strictlyAscending = (values: number[]) => values.every((value, index) => !index || values[index - 1] < value);

function renderDiagram(block: Block | undefined) {
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const definition = figures.find(item => item.profile === profile), renderer = renderers.find(item => item.profile === profile);
  assert(definition && renderer);
  definition.validate(values);
  assert.equal(definition.alt(values), block.alt);
  const markup = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
  assert(markup.includes('data-source-figure="' + profile + '"'));
  assert.match(markup, /aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
  assert(markup.includes('<desc') && markup.includes('diagram-scroll') && markup.includes('tabindex="0"') &&
    markup.includes('var(--diagram-ink)') && markup.includes('var(--image-scale, 1)'));
  return { profile, definition, markup };
}

test('2012年春期午前問1〜26の公式キー・参照値・全104条件を照合する', () => {
  assert.equal(definitions.length, 26);
  assert.equal(originals.length, 26);
  assert.equal(originals.map(row => row.sourceKey).join(''), official);
  for (const [index, definition] of definitions.entries()) {
    const number = index + 1, row = originals[index], bodies = cases(number), reference = bodies[0];
    assert.equal(definition.source, '2012h24h-fe-am-' + number);
    assert.equal(row.number, number);
    assert.equal(definition.sourceAnswer, official[index]);
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(field => [field.minimum, field.maximum]), [[0, 3]]);
    assert.equal(marks[reference.correctIndex!], official[index]);
    assert(prompt(reference).startsWith(row.prompt), definition.source);
    assert.deepEqual(options(reference), row.choices, definition.source);
    const visibleStems = bodies.map(body => JSON.stringify(body.prompt.map(block =>
      block.type === 'diagram' ? renderDiagram(block).markup.replace(/<desc[^>]*>.*?<\/desc>/s, '').replace(/:R[0-9]+:/g, '') : block)));
    assert.equal(new Set(visibleStems).size, 4, definition.source);
    const correctContent = new Set(bodies.map(body => JSON.stringify(body.choices[body.correctIndex!])));
    assert(correctContent.size >= 2, definition.source);
    for (const [value, body] of bodies.entries()) {
      assert.deepEqual(definition.build([value]), body);
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(options(body)).size, 4, definition.source);
      assert(body.correctIndex !== undefined && body.correctIndex >= 0 && body.correctIndex < 4);
      assert(body.explanation.length > 30);
    }
    for (const invalid of [[], [0, 0], [-1], [4], [0.5], Array(1), [Number.NaN]])
      assert.throws(() => definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
    const getter = [0];
    Object.defineProperty(getter, '0', { get() { throw Error('入力のgetterを実行した'); } });
    assert.throws(() => definition.build(getter), { code: 'PARAMETER_CONSTRAINT' });
  }
});

test('問1は筆算の剰余が0になるかを全候補で確認する', () => {
  for (const body of cases(1)) {
    const match = /10進小数のうち，(\d+)進数に変換したときに有限小数/.exec(prompt(body));
    assert(match);
    const base = Number(match[1]);
    const isFinite = (choice: string) => {
      assert.match(choice, /^0\.[1-9]$/);
      const seen = new Set<number>();
      let remainder = Number(choice.at(-1));
      while (remainder && !seen.has(remainder)) {
        seen.add(remainder);
        remainder = remainder * base % 10;
      }
      return remainder === 0;
    };
    assert(strictlyAscending(options(body).map(Number)));
    matches(body, isFinite);
    assert(body.explanation.includes(options(body)[body.correctIndex!]));
  }
});

function binaryExpression(expression: string, input: bigint) {
  const symbol = 'b₁b₂⋯bₙ';
  const parts = expression.split(/([＋−])/);
  const operand = (term: string) => {
    if (term === '1') return 1n;
    assert(term.startsWith(symbol));
    const suffix = term.slice(symbol.length);
    assert.match(suffix, /^[01]*$/);
    return BigInt('0b' + input.toString(2) + suffix);
  };
  if (parts.length === 1) return operand(parts[0]);
  assert.equal(parts.length, 3);
  return parts[1] === '＋' ? operand(parts[0]) + operand(parts[2]) : operand(parts[0]) - operand(parts[2]);
}
test('問2は2進数として各式を解釈し，非負整数全体での成立と個別の一致を区別する', () => {
  for (const body of cases(2)) {
    const match = /非負の2進数b₁b₂⋯bₙを(\d+)倍/.exec(prompt(body));
    assert(match);
    const multiple = BigInt(match[1]);
    // 各選択肢はxの一次式。0と1で係数・定数を決め、さらに桁上がりを含む値でも検算。
    matches(body, candidate => [0n, 1n, 2n, 31n, 256n].every(x => binaryExpression(candidate, x) === multiple * x));
    assert(body.explanation.includes(options(body)[body.correctIndex!]));
  }
});

test('問3は隣接行列と全選択肢の辺を実表示から突き合わせる', () => {
  const originalGraphs = [
    ['1-4', '2-3', '2-4', '3-4'], ['1-2', '1-3', '1-4', '2-3', '2-4', '3-4'],
    ['1-2', '1-3', '1-4', '2-3'], ['1-2', '1-3', '2-4', '3-4'],
  ];
  for (const [index, body] of cases(3).entries()) {
    assert.match(prompt(body), /第i行第j列と第j行第i列の要素が1.*存在しないときは0/);
    const matrix = renderDiagram(body.prompt[1]);
    const rows = [...matrix.markup.matchAll(/data-matrix-row="([01]{4})"/g)].map(match => match[1]);
    assert.equal(rows.length, 4);
    if (index === 0) assert.deepEqual(rows, ['0110', '1001', '1001', '0110']);
    const edges: string[] = [];
    for (let i = 0; i < 4; i++) {
      assert.equal(rows[i][i], '0');
      for (let j = i + 1; j < 4; j++) {
        assert.equal(rows[i][j], rows[j][i]);
        if (rows[i][j] === '1') edges.push((i + 1) + '-' + (j + 1));
      }
    }
    const renderEdges = body.choices.map(([block]) => [...renderDiagram(block).markup.matchAll(/data-graph-edge="([1-4]-[1-4])"/g)].map(match => match[1]));
    assert.deepEqual(renderEdges, originalGraphs);
    matches(body, (_, i) => renderEdges[i].join(',') === edges.join(','));
    assert(edges.every(edge => body.explanation.includes('V' + edge.replace('-', 'とV'))));
  }
});

function parseInfix(input: string) {
  let i = 2;
  assert(input.startsWith('Y＝'));
  function atom(): string {
    const current = input[i++];
    if (current !== '(') {
      assert.match(current, /^[A-E]$/);
      return current;
    }
    const value = expression();
    assert.equal(input[i++], ')');
    return value;
  }
  function term(): string {
    let value = atom();
    while (input[i] === '×' || input[i] === '÷') {
      const operation = input[i++];
      value = '(' + value + operation + atom() + ')';
    }
    return value;
  }
  function expression(): string {
    let value = term();
    while (input[i] === '＋' || input[i] === '−') {
      const operation = input[i++];
      value = '(' + value + operation + term() + ')';
    }
    return value;
  }
  const result = expression();
  assert.equal(i, input.length);
  return 'Y＝' + result;
}
function parsePostfix(input: string) {
  const stack: string[] = [];
  for (const token of input) {
    if (/[A-EY]/.test(token)) stack.push(token);
    else {
      const right = stack.pop(), left = stack.pop();
      assert(left && right);
      if (token === '＝') stack.push(left + token + right);
      else {
        assert.match(token, /^[＋−×÷]$/);
        stack.push('(' + left + token + right + ')');
      }
    }
  }
  assert.equal(stack.length, 1);
  return stack[0];
}
test('問4は中置記法と後置記法を別々に構文木へ変換して比較する', () => {
  for (const [i, body] of cases(4).entries()) {
    assert.match(prompt(body), /式Y＝\(A−B\)×CをYAB−C×＝と表現/);
    const infix = body.prompt[1];
    assert(infix.type === 'paragraph');
    if (i === 0) assert.equal(infix.text, 'Y＝(A＋B)×(C−D÷E)');
    const tree = parseInfix(infix.text);
    matches(body, candidate => parsePostfix(candidate) === tree);
    assert(body.explanation.includes(options(body)[body.correctIndex!]));
  }
});

test('問5は硬貨を一枚ずつ投入して到達可能な全遷移を検算する', () => {
  for (const body of cases(5)) {
    const text = prompt(body), priceText = /図は(\d+)円切符/.exec(text), fromText = /状態(Q.)から状態Eへ/.exec(text);
    const acceptedText = /また，自動販売機は(.+)だけを受け付ける/.exec(text);
    assert(priceText && fromText && acceptedText);
    const price = Number(priceText[1]), coins = [...acceptedText[1].matchAll(/(\d+)円硬貨/g)].map(match => Number(match[1]));
    assert.equal(coins.length, 3);
    assert(text.includes('状態Q₀は硬貨が投入されていない') && text.includes('硬貨が1枚投入されるたび') &&
      text.includes(price + '円以上') && text.includes('釣銭が必要な場合には釣銭を返す'));
    const reached = new Set([0]);
    for (const subtotal of reached)
      for (const coin of coins) if (subtotal + coin < price) reached.add(subtotal + coin);
    const amounts = [...reached].sort((a, b) => a - b), labels = [...'₀₁₂₃₄₅₆₇₈₉'].map(subscript => 'Q' + subscript);
    const edges = new Set<string>();
    amounts.forEach((subtotal, state) => coins.forEach(coin => {
      const total = subtotal + coin;
      edges.add(labels[state] + '-' + (total >= price ? 'E' : labels[amounts.indexOf(total)]));
    }));
    const svg = renderDiagram(body.prompt.find(block => block.type === 'diagram')).markup;
    assert.deepEqual(new Set([...svg.matchAll(/data-ticket-edge="([^"]+)"/g)].map(match => match[1])), edges);
    assert.deepEqual([...svg.matchAll(/data-ticket-edge="([^"]+)"[^>]*data-highlighted="true"/g)].map(match => match[1]), [fromText[1] + '-E']);
    const start = amounts[labels.indexOf(fromText[1])];
    const correctCoins = coins.filter(coin => start + coin >= price);
    matches(body, candidate => {
      const proposed = [...candidate.matchAll(/(\d+)円硬貨/g)].map(match => Number(match[1]));
      assert(proposed.length && proposed.every(coin => coins.includes(coin)));
      return proposed.join(',') === correctCoins.join(',');
    });
    assert(correctCoins.every(coin => body.explanation.includes(coin + '円硬貨')));
  }
});

test('問6は実際の関数の挿入位置と削除位置を読み，複数値の取出し順を検算する', () => {
  for (const [index, body] of cases(6).entries()) {
    assert.match(prompt(body), /十分な大きさの配列Aと初期値が0の変数p.*関数f\(x\)とg\(\)だけでアクセス可能/);
    if (index) assert.match(prompt(body), /格納済みデータが1個以上あるときだけ/);
    const program = body.prompt.find(block => block.type === 'code');
    assert(program?.type === 'code');
    if (!index) assert.equal(program.text, originals[5].material);
    const [, f, g] = /^function f\(x\) \{\n([\s\S]+?)\n\}\nfunction g\(\) \{\n([\s\S]+?)\n\}$/.exec(program.text)!;
    const frontF = f.includes('A[1] = x;'), frontG = g.includes('x = A[1];');
    assert.match(f, frontF ? /for \(i = p; i > 0; i = i - 1\) \{\n        A\[i \+ 1\] = A\[i\];\n    \}\n    A\[1\] = x;\n    p = p \+ 1;/ :
      /p = p \+ 1;\n    A\[p\] = x;/);
    assert.match(g, frontG ? /x = A\[1\];\n    for \(i = 1; i < p; i = i \+ 1\) \{\n        A\[i\] = A\[i \+ 1\];\n    \}\n    p = p - 1;/ :
      /x = A\[p\];\n    p = p - 1;/);
    assert(f.endsWith('return None;') && g.endsWith('return x;'));
    for (const values of [[2, 5, 8], [22, 11, 15, 10], [0, -1, 2]]) {
      const active: number[] = [];
      for (const value of values) frontF ? active.unshift(value) : active.push(value);
      const extracted = values.map(() => frontG ? active.shift()! : active.pop()!);
      const expected = (choice: string) => choice === 'スタック' ? [...values].reverse() : choice === 'キュー' ? values : [];
      matches(body, choice => expected(choice).join(',') === extracted.join(','));
    }
    assert(body.explanation.includes(options(body)[body.correctIndex!]));
  }
});

test('問7は単方向リンクをたどる参照回数を二つのリスト長で比較する', () => {
  for (const body of cases(7)) {
    const text = prompt(body);
    assert.match(text, /多数のデータ.*単方向リスト.*末尾ポインタ/);
    const backwards = /先頭方向に隣接/.test(text), checkpoint = /中央付近を指すポインタ/.test(text);
    for (const length of [8, 101]) {
      const direct = checkpoint ? [0, length - 1, Math.floor(length / 2)] : [0, length - 1];
      const stepsTo = (target: number) => Math.min(...direct.map(initial => {
        let cursor = initial, steps = 0;
        while (cursor >= 0 && cursor < length && cursor !== target) {
          cursor += backwards ? -1 : 1;
          steps++;
        }
        return cursor === target ? steps : Infinity;
      }));
      const steps = options(body).map(candidate => {
        assert.match(candidate, /^リストの(先頭|末尾)(にデータを挿入|のデータを削除)する。$/);
        const first = candidate.includes('先頭');
        if (candidate.includes('挿入')) return 1;
        return 1 + stepsTo(first ? 1 : length - 2);
      });
      matches(body, (_, i) => steps[i] === Math.max(...steps));
    }
  }
});

function probabilityExpression(expression: string, d: number, c: number, t: number) {
  const variables: Record<string, number> = { D: d, C: c, T: t, '1': 1 };
  const powers: Record<string, number> = { '²': 2, '³': 3 };
  let pos = 0;
  function atom(): number {
    const token = expression[pos++];
    let value: number;
    if (token === '(') {
      value = sum();
      assert.equal(expression[pos++], ')');
    } else {
      assert(Object.hasOwn(variables, token));
      value = variables[token];
    }
    if (powers[expression[pos]]) value = value ** powers[expression[pos++]];
    return value;
  }
  function product() {
    let value = atom();
    while (pos < expression.length && /^[DCT1(]$/.test(expression[pos])) value *= atom();
    return value;
  }
  function sum() {
    let value = product();
    while (expression[pos] === '−') {
      pos++;
      value -= product();
    }
    return value;
  }
  const result = sum();
  assert.equal(pos, expression.length);
  return result;
}
test('問17は装置の稼働・停止を全列挙して全ての式を照合する', () => {
  for (const [index, body] of cases(17).entries()) {
    const text = prompt(body);
    assert.match(text, /それぞれのサイトで少なくとも1台の端末は正常/);
    if (index) assert.match(text, /CPUは正常でなければならず，各装置の稼働は互いに独立/);
    const disk = /磁気ディスクは(\d+)台(とも|のうち少なくとも1台が)正常/.exec(text);
    assert(disk);
    const allDisks = disk[2] === 'とも', numDisks = Number(disk[1]);
    const svg = renderDiagram(body.prompt[1]).markup;
    assert.equal([...svg.matchAll(/data-system-disk="/g)].length, numDisks);
    assert.deepEqual([...svg.matchAll(/data-device-rate="(.)"/g)].map(match => match[1]), ['D', 'C', 'T']);
    const counts = ['a', 'b'].map(site => [...svg.matchAll(new RegExp('data-system-terminal="' + site + '\\d"', 'g'))].length);
    assert.deepEqual(counts, [[2, 2], [3, 2], [2, 2], [3, 3]][index]);
    const probabilities = [[.4, .8, .3], [.9, .6, .7], [.5, .5, .5], [0, 1, 1], [1, 1, 0], [1, 1, 1]];
    const expected = probabilities.map(([d, c, t]) => {
      const perDevice = [...Array<number>(numDisks).fill(d), c, ...Array<number>(counts[0] + counts[1]).fill(t)];
      let result = 0;
      for (let pattern = 0; pattern < 2 ** perDevice.length; pattern++) {
        const works = perDevice.map((_, j) => (pattern & 2 ** j) !== 0);
        const disks = works.slice(0, numDisks), cpu = works[numDisks];
        const terminals = works.slice(numDisks + 1);
        if (cpu && (allDisks ? disks.every(Boolean) : disks.some(Boolean)) &&
          terminals.slice(0, counts[0]).some(Boolean) && terminals.slice(counts[0]).some(Boolean))
          result += perDevice.reduce((p, rate, j) => p * (works[j] ? rate : 1 - rate), 1);
      }
      return result;
    });
    matches(body, expression => probabilities.every(([d, c, t], i) =>
      Math.abs(probabilityExpression(expression, d, c, t) - expected[i]) < 1e-10));
    assert(body.explanation.includes(options(body)[body.correctIndex!]));
  }
});

test('問19は合計時間に独立の3区間を代入し，符号の4候補を判定する', () => {
  for (const body of cases(19)) {
    const text = prompt(body), target = /，([^，]+時間)を求める式/.exec(text)?.[1];
    assert(target);
    assert(text.includes('一つのトランザクション') && text.includes('他のオーバヘッドは無視'));
    for (const intervals of [[1, 2, 4], [13, 17, 5], [2, 6, 3]]) {
      const measured: Record<string, number> = {
        回線伝送時間: intervals[0], 端末処理時間: intervals[1], サーバ処理時間: intervals[2],
        応答時間: intervals.reduce((total, part) => total + part),
      };
      const values = options(body).map(candidate => {
        const [left, right] = candidate.split('＝');
        assert.equal(left, target);
        const [first, op1, second, op2, third] = right.split(/([＋−])/);
        const names = [first, second, third];
        assert(names.every(name => name !== target && Object.hasOwn(measured, name)));
        assert.equal(new Set(names).size, 3);
        return measured[first] + (op1 === '＋' ? 1 : -1) * measured[second] + (op2 === '＋' ? 1 : -1) * measured[third];
      });
      matches(body, (_, index) => values[index] === measured[target]);
    }
    assert(body.explanation.includes(options(body)[body.correctIndex!]));
  }
});

test('問20は各ジョブの終了イベントをCPUとプリンタで追跡する', () => {
  for (const [index, body] of cases(20).entries()) {
    const text = prompt(body), word = /条件で([三四五])つのジョブ/.exec(text)?.[1];
    assert(word);
    const count = { 三: 3, 四: 4, 五: 5 }[word as '三' | '四' | '五'];
    const cpu = Number(/CPU処理時間は(\d+)分/.exec(text)?.[1]), data = Number(/(\d+)Mバイトの印刷データ/.exec(text)?.[1]);
    const [, throughputData, throughputTime] = /印刷速度は(\d+)Mバイト当たり(\d+)分/.exec(text)!;
    assert(text.includes('多重度1で実行') && text.includes('スプーリング終了後にOSの印刷機能') &&
      text.includes('プリンタは1台') && text.includes('CPU処理と印刷機能は同時に動作可能') && text.includes('条件に記述されていない時間は無視'));
    const print = Number(throughputTime) * data / Number(throughputData);
    assert(Number.isInteger(print) && print > cpu);
    let processorDone = 0, printerDone = 0;
    for (let job = 0; job < count; job++) {
      processorDone += cpu;
      printerDone = Math.max(processorDone, printerDone) + print;
    }
    const candidates = options(body).map(Number);
    assert(strictlyAscending(candidates));
    if (!index) assert.deepEqual(candidates, [120, 160, 180, 240]);
    matches(body, choice => Number(choice) === printerDone);
    assert(body.explanation.includes(printerDone + '分'));
  }
});

test('問25は16進数を各桁のビットへ分けて8本の配線と図の点灯を照合する', () => {
  for (const [index, body] of cases(25).entries()) {
    const text = prompt(body), match = /16進数で([0-9A-F]{2})を出力/.exec(text);
    assert(match);
    if (!index) assert.equal(match[1], '6D');
    assert.match(text, /P7を最上位ビット（MSB），P0を最下位ビット（LSB）.*ポート出力が1のとき，LEDは点灯/);
    const hexDigits = '0123456789ABCDEF';
    const words = ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111',
      '1000', '1001', '1010', '1011', '1100', '1101', '1110', '1111'];
    const bits = [...match[1]].map(digit => words[hexDigits.indexOf(digit)]).join('');
    const circuit = renderDiagram(body.prompt[1]).markup;
    assert(circuit.includes('data-led-ground="true"') && circuit.includes('消灯') && circuit.includes('点灯'));
    const wires = [...circuit.matchAll(/data-led-wire="P([0-7])-(a|b|c|d|e|f|g|Dt)"/g)].map(([, port, segment]) => [Number(port), segment] as const);
    assert.deepEqual(wires.map(([, segment]) => segment), ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'Dt']);
    const active = wires.filter(([port]) => bits[7 - port] === '1').map(([, segment]) => segment);
    const patterns = body.choices.map(([block]) => {
      const choice = renderDiagram(block).markup;
      const rendered = [...choice.matchAll(/data-led-segment="(a|b|c|d|e|f|g|Dt)" data-lit="(true|false)"/g)];
      assert.equal(rendered.length, 8);
      return rendered.filter(([, , lit]) => lit === 'true').map(([, segment]) => segment);
    });
    matches(body, (_, i) => patterns[i].join(',') === active.join(','));
    assert(body.explanation.includes(bits) && body.explanation.includes(active.join('，')));
  }
});

test('問26は1分当たりのデータ量から概数と昇順の全4択を検算する', () => {
  for (const body of cases(26)) {
    const text = prompt(body);
    const input = /(\d+)分の音声信号（モノラル）を，標本化周波数([\d.]+)kHz，量子化ビット数(\d+)ビット/.exec(text);
    assert(input);
    assert.match(text, /PCM方式.*およそ何Mバイト.*圧縮は行わない/);
    const [, minutes, rate, bits] = input.map(Number);
    const perMinute = (60 * bits * rate) / (8 * 1000);
    const distances = options(body).map(Number).map(candidate => Math.abs(candidate - perMinute * minutes));
    assert(strictlyAscending(options(body).map(Number)));
    assert.deepEqual(options(body).map(Number), [80, 160, 320, 640]);
    matches(body, (_, i) => distances[i] === Math.min(...distances));
    assert(body.explanation.includes(options(body)[body.correctIndex!] + 'Mバイト'));
  }
});

test('14知識系列の全56条件・224選択肢の意味を独立した対応資料で検査する', () => {
  assert.equal(Object.keys(knowledgeFacts).length, 14);
  for (const [number, facts] of Object.entries(knowledgeFacts)) {
    const bodies = cases(Number(number));
    assert.equal(bodies.length, facts.length);
    for (const [index, body] of bodies.entries()) {
      const fact = facts[index], context = '問' + number + 'の条件' + index;
      assert.match(prompt(body), fact.prompt, context);
      assert.equal(fact.candidates.length, 4);
      assert.equal(new Set(fact.candidates.map(([meaning]) => meaning)).size, 4);
      options(body).forEach((choice, i) => assert.match(choice, fact.candidates[i][1], context + marks[i]));
      matches(body, (_, i) => fact.candidates[i][0] === fact.target);
    }
  }
});

test('作図6 profileの全入力で描画と代替説明を照合し，範囲外を拒否する', () => {
  assert.equal(figures.length, 6);
  assert.deepEqual(figures.map(item => item.profile).sort(), renderers.map(item => item.profile).sort());
  for (const figure of figures) {
    const renderer = renderers.find(item => item.profile === figure.profile)!;
    const [[min, max]] = figure.domain;
    for (let index = min; index <= max; index++) {
      figure.validate([index]);
      assert(figure.alt([index]).length > 10);
      const markup = renderToStaticMarkup(createElement(renderer.component, { caption: '図', values: [index] }));
      assert(markup.includes(figure.profile));
    }
    for (const bad of [[], [min - 1], [max + 1], [0.5], [min, min]])
      assert.throws(() => figure.validate(bad), { code: 'FIGURE_PROFILE' });
  }
});
