import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2011AutumnAm01To26Definitions as definitions } from '../src/core/generators/legacy-2011-autumn-am-01-26';
import { legacy2011AutumnAm0126Figures as figures } from '../src/core/generators/legacy-2011-autumn-am-01-26-figures';
import { legacy2011AutumnAm0126FigureRenderers as renderers } from '../src/ui/Legacy2011AutumnAm0126Figures';
import originals from '../src/core/generators/legacy-2011-autumn-am-01-26-source.json';
import { knowledgeFacts } from './fixtures/legacy-2011-autumn-am-01-26-facts';

const official = 'イウウウイエアエアエイイイイエウウエウアアウアエエイ';
const cases = (number: number) => [0, 1, 2, 3].map(value => definitions[number - 1].build([value]));
const prompt = (body: GeneratedBody) => body.prompt.flatMap(block => 'text' in block ? [block.text] : []).join('\n');
const options = (body: GeneratedBody) => body.choices.map(([block]) => {
  if (block.type === 'table') return block.rows[0].join('／');
  if (block.type === 'diagram') return block.alt;
  assert(block.type === 'paragraph');
  return block.text;
});
const matches = (body: GeneratedBody, predicate: (choice: string, index: number) => boolean) =>
  assert.deepEqual(options(body).flatMap((value, index) => predicate(value, index) ? [index] : []), [body.correctIndex]);
const ascending = (values: number[]) => values.every((value, i) => i === 0 || values[i - 1] < value);

function renderDiagram(block: Block | undefined) {
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const figure = figures.find(item => item.profile === profile), renderer = renderers.find(item => item.profile === profile);
  assert(figure && renderer);
  figure.validate(values);
  assert.equal(figure.alt(values), block.alt);
  const markup = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
  assert(markup.includes('data-source-figure="' + profile + '"'));
  assert.match(markup, /tabindex="0"/);
  assert.match(markup, /var\(--image-scale, 1\)/);
  if (markup.includes('<svg')) {
    assert.match(markup, /aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
    assert.match(markup, /<desc\b[^>]*>.+?<\/desc>/s);
    assert(markup.includes('var(--diagram-ink)'));
  } else {
    assert.match(markup, /<figure[^>]*aria-description="[^"]+"/);
    assert.match(markup, /<table[^>]*aria-label="[^"]+"/);
  }
  return markup;
}

test('2011年度秋期午前問1〜26の公式キー・原前提・参照条件と104派生条件を照合する', () => {
  assert.equal(definitions.length, 26);
  assert.equal(originals.map(row => row.sourceKey).join(''), official);
  for (const [i, definition] of definitions.entries()) {
    const row = originals[i], bodies = cases(i + 1), reference = bodies[0];
    assert.equal(row.number, i + 1);
    assert.equal(definition.source, '2011h23a-fe-am-' + row.number);
    assert.equal(definition.sourceAnswer, official[i]);
    assert.equal(definition.version, '3.7.0');
    assert.equal(definition.answerVariation, undefined);
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(field => [field.minimum, field.maximum]), [[0, 3]]);
    assert.equal('アイウエ'[reference.correctIndex!], official[i]);
    assert(prompt(reference).startsWith(row.prompt), definition.source);
    assert.deepEqual(options(reference), row.choices, definition.source);
    const stems = bodies.map(body => JSON.stringify(body.prompt.map(block => block.type === 'diagram' ?
      renderDiagram(block).replace(/<desc[^>]*>.*?<\/desc>/s, '').replace(/aria-description="[^"]*"/g, '') : block)));
    assert.equal(new Set(stems).size, 4, definition.source);
    assert.equal(new Set(bodies.map(body => options(body)[body.correctIndex!])).size, 4, definition.source);
    for (const [value, body] of bodies.entries()) {
      assert.deepEqual(definition.build([value]), body);
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(options(body)).size, 4, definition.source);
      assert(body.explanation.length > 30, definition.source);
    }
    for (const invalid of [[], [0, 0], [-1], [4], [0.5], Array(1), [Number.NaN]])
      assert.throws(() => definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
    const getter = [0];
    Object.defineProperty(getter, '0', { get() { throw Error('入力のgetterを実行した'); } });
    assert.throws(() => definition.build(getter), { code: 'PARAMETER_CONSTRAINT' });
  }
});

test('問1はマスク・シフトの全4組で実際に得る桁を各基数の剰余列と比較する', () => {
  for (const body of cases(1)) {
    const stem = prompt(body), rule = /(\d+)ビットの2進数nを(\d+)進数の各桁.*手順を(\d+)回/.exec(stem);
    assert(rule);
    assert.match(stem, /下位の桁から.*XXXX₁₆は16進数XXXX/);
    assert.match(stem, /［a］をxに代入.*xをスタックにプッシュ.*nを［b］論理シフト/s);
    const [, bits, radix, repetitions] = rule.map(Number);
    const width = Math.log2(radix), limit = 2 ** bits;
    assert.equal(repetitions * width, bits);
    const candidates = options(body);
    assert.deepEqual(candidates.map(value => /／([左右])/.exec(value)?.[1]), ['左', '右', '左', '右']);
    matches(body, choice => {
      const option = /AND ([A-F0-9]{4})₁₆／([左右])に(\d+)ビット/.exec(choice);
      assert(option);
      const mask = parseInt(option[1], 16).toString(2).padStart(16, '0'), distance = Number(option[3]);
      assert.equal(distance, width);
      return [0, 1, radix, 0x3A9C, limit - 1].every(value => {
        let bin = (value % limit).toString(2).padStart(16, '0'), quotient = value % limit;
        for (let i = 0; i < repetitions; i++) {
          const out = parseInt([...bin].map((digit, j) => digit === '1' && mask[j] === '1' ? '1' : '0').join(''), 2);
          if (out !== quotient % radix) return false;
          quotient = Math.floor(quotient / radix);
          bin = option[2] === '左' ? bin.slice(distance) + '0'.repeat(distance) : '0'.repeat(distance) + bin.slice(0, -distance);
        }
        return true;
      });
    });
  }
});

test('問2はビット列の表示位置と符号付き重みから全候補の正確な値を復元する', () => {
  for (const body of cases(2)) {
    const stem = /10進数(−\d+\.\d+).*8ビット固定小数点形式.*3ビット目と4ビット目.*2の補数/.exec(prompt(body));
    assert(stem);
    const desired = Number(stem[1].replace('−', '-')), markup = renderDiagram(body.prompt[1]);
    assert.deepEqual([...markup.matchAll(/data-point-bit="(\d)"/g)].map(match => Number(match[1])), [7, 6, 5, 4, 3, 2, 1, 0]);
    assert.match(markup, /data-point-between="4-3"/);
    matches(body, choice => {
      assert.match(choice, /^[01]{8}$/);
      return [...choice].reduce((sum, bit, i) => sum + Number(bit) * [-8, 4, 2, 1, 0.5, 0.25, 0.125, 0.0625][i], 0) === desired;
    });
  }
});

test('問3は未知数の個数の三乗と実行速度を整数の交差積で検算する', () => {
  const integer = (value: string) => BigInt(value.replaceAll(',', ''));
  for (const body of cases(3)) {
    const stem = /未知数の個数の3乗に比例.*?([\d,]+)元連立一次方程式.*?(\d+)秒.*?(\d+)倍の演算速度.*?([\d,]+)元連立一次方程式/.exec(prompt(body));
    assert(stem);
    const [before, seconds, speed, after] = stem.slice(1).map(integer);
    assert(ascending(options(body).map(value => Number(integer(value)))));
    matches(body, choice => integer(choice) * speed * before ** 3n === seconds * after ** 3n);
  }
});

test('問4は表示された生成規則を部分文字列へ適用し全候補を判定する', () => {
  for (const body of cases(4)) {
    const rule = /＜式＞ ::= ＜変数＞ \| \(＜式＞([＋＊−])＜式＞\) \| ＜式＞([＋＊−])＜式＞\n＜変数＞ ::= (\w) \| (\w) \| (\w) \| (\w)/.exec(prompt(body));
    assert(rule);
    const [, enclosed, bare, ...variables] = rule;
    function derives(text: string): boolean {
      if (variables.includes(text)) return true;
      for (let i = 1; i < text.length - 1; i++) {
        if (text[i] === bare && derives(text.slice(0, i)) && derives(text.slice(i + 1))) return true;
        if (text[0] === '(' && text.at(-1) === ')' && text[i] === enclosed &&
          derives(text.slice(1, i)) && derives(text.slice(i + 1, -1))) return true;
      }
      return false;
    }
    matches(body, derives);
  }
});

test('問5は図のスタック先頭から全操作列を一つずつ実行する', () => {
  for (const body of cases(5)) {
    const stem = /([a-d](?:，[a-d]){3})の順番に出力/.exec(prompt(body));
    assert(stem);
    assert.match(prompt(body), /関数fはスタック1からポップ.*スタック2にプッシュ.*関数gはスタック2からポップ.*出力/);
    const markup = renderDiagram(body.prompt[1]);
    const initial = [...markup.matchAll(/data-stack-value="([a-d])"/g)].map(match => match[1]);
    assert.equal(new Set(initial).size, 4);
    assert.deepEqual([...markup.matchAll(/data-stack="([12])"/g)].map(match => match[1]), ['1', '2']);
    matches(body, choice => {
      const stack1 = [...initial], stack2: string[] = [], result: string[] = [];
      const ops = choice.split('，');
      assert.equal(ops.filter(op => op === 'f').length, 4);
      assert.equal(ops.filter(op => op === 'g').length, 4);
      for (const op of ops) {
        const item = (op === 'f' ? stack1 : stack2).shift();
        assert(item);
        if (op === 'f') stack2.unshift(item);
        else result.push(item);
      }
      return result.join('，') === stem[1];
    });
  }
});

test('問6は0で初期化した10区画に下1桁を使って順に挿入する', () => {
  for (const body of cases(6)) {
    const stem = /kとして(\d+(?:，\d+){4})を順に格納したとき，(\d+)が格納/.exec(prompt(body));
    assert(stem);
    assert.match(prompt(body), /x mod yはxをyで割った剰余.*全て0に初期化/);
    const deltas = [...prompt(body).matchAll(/A\[\(?k(?:＋(\d+))?\)? mod 10\]＝0/g)].map(match => Number(match[1] ?? 0));
    assert.deepEqual(deltas, [0, 1, 4]);
    const slots = Array<number>(10).fill(0);
    const input = stem[1].split('，').map(Number);
    assert.equal(input.at(-1), Number(stem[2]));
    for (const value of input) {
      const free = deltas.map(delta => Number(String(value + delta).at(-1))).find(slot => slots[slot] === 0);
      assert.notEqual(free, undefined);
      slots[free!] = value;
    }
    matches(body, choice => {
      const slot = /^A\[(\d)\]$/.exec(choice);
      assert(slot);
      return slots[Number(slot[1])] === Number(stem[2]);
    });
  }
});

test('問7は図の退避とループを表示どおりに実行し，すべての選択肢を回転結果と比較する', () => {
  for (const body of cases(7)) {
    const stem = /n個の単語がTANGO\[(\d+)\]からTANGO\[n(?:＋(\d+))?\]/.exec(prompt(body));
    assert(stem);
    const width = Number(stem[1]);
    assert.equal(Number(stem[2] ?? 0), width - 1);
    if (width > 1) assert(prompt(body).includes('n＞' + width));
    const markup = renderDiagram(body.prompt[1]);
    assert.match(markup, /data-loop-initial="n-1" data-loop-step="-1" data-loop-end="0"/);
    assert.match(markup, /変数名：初期値，増分，終値/);
    const readIndices = (text: string) => {
      const pattern = /^TANGO\[([\d＋−in]+)\] → TANGO\[([\d＋−in]+)\]$/;
      const match = pattern.exec(text);
      assert(match);
      return match.slice(1);
    };
    const initialCopies = [...markup.matchAll(/data-copy-index="\d+"><text[^>]*>([^<]+)<\/text>/g)].map(match => readIndices(match[1]));
    assert.equal(initialCopies.length, width);
    const position = (expression: string, i: number, n: number) => {
      const [first, second] = expression.split(/[＋−]/);
      const variable = (term: string) => term === 'i' ? i : term === 'n' ? n : Number(term);
      return second ? variable(first) + (expression.includes('−') ? -1 : 1) * variable(second) : variable(first);
    };
    matches(body, choice => [width + 1, width + 3, 11].every(n => {
      const words = Array.from({ length: n }, (_, j) => String.fromCharCode(65 + j));
      const array = [...Array<string>(width).fill('_'), ...words];
      const copy = ([from, to]: string[], i: number) => {
        const origin = position(from, i, n), dest = position(to, i, n);
        if (origin < 0 || dest < 0 || origin >= array.length || dest >= array.length) return false;
        array[dest] = array[origin];
        return true;
      };
      assert(initialCopies.every(indices => copy(indices, 0)));
      for (let i = n - 1; i >= 0; i--) if (!copy(readIndices(choice), i)) return false;
      return array.slice(width).join('') === [...words.slice(-width), ...words.slice(0, -width)].join('');
    }));
  }
});

test('問9は図でたどる値・レジスタ・メモリ上の参照から全方式のうち一つを判定する', () => {
  for (const body of cases(9)) {
    const markup = renderDiagram(body.prompt[1]);
    const operand = Number(/data-address-operand="(\d+)"/.exec(markup)?.[1]);
    const address = Number(/data-effective-address="(\d+)"/.exec(markup)?.[1]);
    const pointer = /data-memory-pointer="(\d+)"/.exec(markup);
    const register = /data-address-register="([^"]+)" data-register-value="(\d+)"/.exec(markup);
    assert(Number.isInteger(operand) && Number.isInteger(address));
    assert.equal(pointer ? Number(pointer[1]) : register ? operand + Number(register[2]) : operand, address);
    matches(body, choice => ({
      間接アドレス指定: Boolean(pointer), 指標アドレス指定: register?.[1] === '指標レジスタ',
      相対アドレス指定: register?.[1] === 'プログラムカウンタ', 直接アドレス指定: !pointer && !register,
    })[choice] === true);
  }
});

test('問11は二段見出しの実表から100回分のアクセス時間を合計して並べる', () => {
  for (const [index, body] of cases(11).entries()) {
    const markup = renderDiagram(body.prompt[1]);
    assert.match(markup, /colSpan="3" scope="colgroup">キャッシュメモリ/);
    assert.match(markup, /アクセス時間（ナノ秒）.*ヒット率（％）.*アクセス時間（ナノ秒）/);
    const values = [...markup.matchAll(/data-cache-config="([A-D])"[^>]*><th[^>]*>[^<]+<\/th>((?:<td>[^<]+<\/td>){4})/g)]
      .map(match => [match[1], ...[...match[2].matchAll(/<td>([^<]+)<\/td>/g)].map(cell => cell[1])]);
    assert.deepEqual(values.map(row => row[1]), ['なし', 'なし', 'あり', 'あり']);
    const order = (addLookupOnMiss: boolean) => values.map(([name, has, time, hit, memory]) => {
      let sum = 0;
      for (let access = 0; access < 100; access++) {
        sum += has === 'なし' ? Number(memory) : access < Number(hit) ? Number(time) :
          Number(memory) + (addLookupOnMiss ? Number(time) : 0);
      }
      return { name, sum };
    }).sort((a, b) => a.sum - b.sum);
    const counts = order(false);
    assert(ascending(counts.map(row => row.sum)));
    matches(body, choice => choice === counts.map(row => row.name).join('，'));
    if (index === 0) {
      assert.deepEqual(counts.map(row => row.name), order(true).map(row => row.name));
      assert.deepEqual(counts.map(row => [row.name, row.sum]), [['A', 1500], ['D', 1700], ['B', 3000], ['C', 4000]]);
    } else {
      assert.match(prompt(body), /ヒット時はキャッシュメモリの時間，ミス時は主記憶の時間を用いる/);
    }
  }
});

test('問14はシリンダを1本ずつ進め，指定方向に要求がなくなれば反転する', () => {
  for (const body of cases(14)) {
    const stem = /現在シリンダ番号(\d+).*?待ち行列にシリンダ番号(\d+(?:，\d+){6})/.exec(prompt(body));
    assert(stem);
    const direction = /シリンダ番号が(増加|減少)する方向/.exec(prompt(body));
    assert(direction);
    assert.match(prompt(body), /要求がなくなったとき.*移動方向を変える.*処理結果に影響はない.*新たな入出力要求は発生しない/s);
    const requests = new Set(stem[2].split('，').map(Number));
    let at = Number(stem[1]), delta = direction[1] === '増加' ? 1 : -1, movement = 0;
    while (requests.size) {
      requests.delete(at);
      if (!requests.size) break;
      if (![...requests].some(value => delta * (value - at) > 0)) delta *= -1;
      at += delta;
      movement++;
    }
    assert(ascending(options(body).map(Number)));
    matches(body, choice => Number(choice) === movement);
  }
});

test('問15は同一条件で故障後に正常稼働まで掛かる時間の順を全候補で照合する', () => {
  const disruption = ['デュアルシステム', 'ホットスタンバイシステム', 'ウォームスタンバイシステム',
    'コールドスタンバイシステム', 'シンプレックスシステム'];
  for (const [i, body] of cases(15).entries()) {
    const stem = /^(\S+)を，システムの稼働率の高い順.*構成するコンピュータは同一/.exec(prompt(body));
    assert(stem);
    const group = stem[1].split('，');
    assert.equal(group.length, 3);
    if (i) {
      assert.match(prompt(body), /故障の発生間隔は各構成で同じ.*切り替える方が故障機を修理するより短い/);
      assert.match(prompt(body), i === 3 ? /コールドスタンバイより切替停止が短い/ : /正常な側で直ちに処理を続けられ/);
    }
    const desired = disruption.filter(name => group.includes(name)).join('，');
    matches(body, choice => {
      assert.deepEqual(new Set(choice.split('，')), new Set(group));
      return choice === desired;
    });
  }
});

test('問19は三辺の稼働・停止8通りで経路の存在を探索し，確率を整数で合計する', () => {
  for (const [i, body] of cases(19).entries()) {
    const stem = /^(\S+?)〜(\S+?)を結ぶ回線.*?全てが0\.([6-9])とする/.exec(prompt(body));
    assert(stem);
    if (i) assert.match(prompt(body), /各回線の稼働は独立とする/);
    const [, from, to, pText] = stem, p = Number(pText), markup = renderDiagram(body.prompt[1]);
    const links = [...markup.matchAll(/<path[^>]*data-route="([^"]+)"[^>]*>/g)].map(path => path[1].split('-'));
    assert.equal(links.length, 3);
    assert.equal((markup.match(/stroke-dasharray="6 5"/g) ?? []).length, 2);
    let successes = 0;
    for (let mask = 0; mask < 8; mask++) {
      let weight = 1;
      const graph = new Map<string, string[]>();
      for (const [edge, [a, b]] of links.entries()) {
        if ((mask & (1 << edge)) === 0) { weight *= 10 - p; continue; }
        weight *= p;
        graph.set(a, [...graph.get(a) ?? [], b]);
        graph.set(b, [...graph.get(b) ?? [], a]);
      }
      const frontier = [from], reached = new Set(frontier);
      for (const a of frontier) for (const b of graph.get(a) ?? []) {
        if (!reached.has(b)) { reached.add(b); frontier.push(b); }
      }
      if (reached.has(to)) successes += weight;
    }
    assert(options(body).every(value => /^0\.\d{3}$/.test(value)));
    assert(ascending(options(body).map(Number)));
    matches(body, choice => Number(choice.slice(2)) === successes);
  }
});

test('問20は図の状態遷移と，イベントの発生前後の組合せを照合する', () => {
  const lifecycle = [
    [/優先度の高いタスクが実行可能/, 2, 1],
    [/タスクが生成/, 0, 1],
    [/入出力要求による処理が完了/, 3, 1],
    [/入出力要求を行った/, 2, 3],
  ] as const;
  const states = ['図の左側から', '実行可能状態', '実行状態', '待ち状態'];
  for (const body of cases(20)) {
    const markup = renderDiagram(body.prompt[1]);
    assert.deepEqual([...markup.matchAll(/data-state-transition="(\d-\d)"/g)].map(match => match[1]).sort(),
      ['0-1', '1-2', '2-1', '2-3', '2-4', '3-1']);
    matches(body, choice => {
      const event = lifecycle.find(([pattern]) => pattern.test(choice));
      assert(event);
      const [, from, to] = event;
      return prompt(body).includes(states[from] + (from === 0 ? '' : 'のタスクが') + states[to] + 'へ入る') ||
        prompt(body).includes(states[from] + 'のタスクが' + states[to] + 'に遷移');
    });
  }
});

test('問26は3積項の論理式と図のAND・OR・出力反転を独立に真理値表にする', () => {
  for (const body of cases(26)) {
    const expression = /X＝([AB̅・＋]+)と同じ結果/.exec(prompt(body))?.[1];
    assert(expression);
    assert.match(prompt(body), /・は論理積，＋は論理和，X̅はXの否定/);
    const terms = expression.split('＋').map(term => term.split('・'));
    assert.deepEqual(terms.map(term => term.length), [2, 2, 2]);
    matches(body, (_, i) => {
      const markup = renderDiagram(body.choices[i][0]);
      const gate = /data-gate="(and|nand|or|nor)"/.exec(markup)?.[1];
      assert(gate);
      const inverted = /data-output-inverted="true"/.test(markup);
      assert.equal(inverted, gate.startsWith('n'));
      return [false, true].every(a => [false, true].every(b => {
        const value = (token: string) => {
          assert.match(token, /^[AB]̅?$/);
          const input = token.startsWith('A') ? a : b;
          return token.endsWith('̅') ? !input : input;
        };
        const logic = terms.some(term => term.every(value)), circuit = gate.endsWith('and') ? a && b : a || b;
        return logic === (inverted ? !circuit : circuit);
      }));
    });
  }
});

test('知識12系列の192選択肢を査読済みの概念・問い方・真偽と照合する', () => {
  assert.deepEqual(Object.keys(knowledgeFacts).map(Number), [8, 10, 12, 13, 16, 17, 18, 21, 22, 23, 24, 25]);
  for (const [question, expected] of Object.entries(knowledgeFacts)) {
    for (const [index, body] of cases(Number(question)).entries()) {
      const item = expected[index];
      assert.match(prompt(body), item.prompt, '問' + question + ' 条件' + index);
      const optionText = options(body);
      const meanings = optionText.map((option, i) => {
        const [meaning, pattern] = item.candidates[i];
        assert.match(option, pattern, '問' + question + ' 条件' + index + ' 選択肢' + i);
        return meaning;
      });
      assert.deepEqual(meanings.flatMap((meaning, i) => meaning === item.target ? [i] : []), [body.correctIndex]);
    }
  }
});

test('全8図profileを実描画し，26の入力と範囲外・欠落・getter拒否を確認する', () => {
  assert.equal(figures.length, 8);
  assert.deepEqual(figures.map(figure => figure.profile).sort(), renderers.map(renderer => renderer.profile).sort());
  let inputs = 0;
  for (const figure of figures) {
    const [[first, last]] = figure.domain;
    assert.equal(first, 0);
    for (let index = first; index <= last; index++) {
      figure.validate([index]);
      assert(figure.alt([index]).trim());
      const renderer = renderers.find(item => item.profile === figure.profile)!;
      assert.match(renderToStaticMarkup(createElement(renderer.component, { caption: '図の検証', values: [index] })),
        new RegExp('data-source-figure="' + figure.profile + '"'));
      inputs++;
    }
    for (const invalid of [[], [0, 0], [-1], [last + 1], [0.5], Array(1)]) {
      assert.throws(() => figure.validate(invalid), { code: 'FIGURE_PROFILE' });
      assert.throws(() => figure.alt(invalid), { code: 'FIGURE_PROFILE' });
    }
    const getter = [0];
    Object.defineProperty(getter, '0', { get() { throw Error('図入力のgetterを実行した'); } });
    assert.throws(() => figure.alt(getter), { code: 'FIGURE_PROFILE' });
  }
  assert.equal(inputs, 26);
});
