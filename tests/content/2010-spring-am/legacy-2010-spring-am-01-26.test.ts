import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2010SpringAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2010-spring-am-01-26';
import { legacy2010SpringAm0126Figures as figures } from '../../../src/core/generators/legacy-2010-spring-am-01-26-figures';
import { legacy2010SpringAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2010SpringAm0126Figures';
import { spring2010AmKnowledgeFacts as facts } from '../../fixtures/legacy-2010-spring-am-01-26-facts';

const paperKeys = 'アウウアウイイウイイウウエアウエイイアウウエウウエウ';
const cases = (question: number) => [0, 1, 2, 3].map(condition => definitions[question - 1].build([condition]));
const paragraphs = (body: GeneratedBody) => body.prompt.filter(block => block.type === 'paragraph').map(block => block.text).join('\n');
const textOf = (block: Block) => {
  assert(block.type === 'paragraph');
  return block.text;
};
const diagramOf = (block: Block) => {
  assert(block.type === 'diagram' && block.scene.kind === 'source_figure');
  return block;
};
const tableOf = (block: Block) => {
  assert(block.type === 'table');
  return block;
};
function unique(body: GeneratedBody, verify: (block: Block, i: number) => boolean) {
  const valid = body.choices.flatMap(([block], i) => verify(block, i) ? [i] : []);
  assert.deepEqual(valid, [body.correctIndex], paragraphs(body));
}
const paperInteger = (value: string) => Number(value.replace('－', '-'));
const arithmetic = (op: string, a: number, b: number) => {
  if (op === '＋') return a + b;
  if (op === '－') return a - b;
  if (op === '＊') return a * b;
  assert.equal(op, '／');
  return a / b;
};

test('問1〜26の公式正答、原媒体、104条件、全416選択肢と決定性を照合する', () => {
  assert.equal(definitions.length, 26);
  let checkedChoices = 0;
  for (const [i, def] of definitions.entries()) {
    const states = cases(i + 1), original = states[0];
    assert.equal(def.source, '2010h22h-fe-am-' + (i + 1));
    assert.equal(def.sourceAnswer, paperKeys[i]);
    assert.equal('アイウエ'[original.correctIndex!], paperKeys[i]);
    assert.deepEqual(def.reference, [0]);
    assert.equal(def.version, '3.7.0');
    assert.equal(new Set(states.map(body => JSON.stringify(body.prompt))).size, 4);
    for (const [condition, body] of states.entries()) {
      assert.deepEqual(body, def.build([condition]));
      assert.deepEqual(body.prompt.map(block => block.type), original.prompt.map(block => block.type));
      assert.deepEqual(body.choices.map(choice => choice.map(block => block.type)),
        original.choices.map(choice => choice.map(block => block.type)));
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(choice => JSON.stringify(choice))).size, 4);
      assert(body.correctIndex !== undefined && body.correctIndex >= 0 && body.correctIndex < 4);
      assert(body.explanation.length > 35);
      checkedChoices += body.choices.length;
    }
    for (const values of [[-1], [4], [0.5], [NaN], [], [0, 0]]) assert.throws(() => def.build(values));
  }
  assert.equal(checkedChoices, 416);
});

test('問1は16進数の固定小数表現と2のべき乗を256倍して全候補を整数で比較する', () => {
  for (const body of cases(1)) {
    const literal = paragraphs(body).match(/16進小数([0-9A-F]{2})\.([0-9A-F]{2})/)!.slice(1).join('');
    const scaled = [...literal].reduce((sum, digit) => sum * 16 + parseInt(digit, 16), 0);
    unique(body, block => {
      assert(block.type === 'formula');
      const exponents = block.text.split('+').map(term => +term.match(/^2\^\{(-?\d+)\}$/)![1]);
      assert.equal(exponents.length, 6);
      return exponents.reduce((sum, exponent) => sum + 2 ** (exponent + 8), 0) === scaled;
    });
    assert(body.explanation.includes(literal.slice(0, 2) + '.' + literal.slice(2)));
  }
});

test('問2は候補の真理値表からAND・ORを個別に復元して観測表を満たすものを選ぶ', () => {
  for (const body of cases(2)) {
    const given = tableOf(body.prompt[1]);
    assert.deepEqual(given.rows.map(row => row.slice(0, 2).join('')), ['00', '01', '10', '11']);
    unique(body, block => tableOf(block).rows.every(([x, y, z], row) => {
      const [gx, gy, both, either] = given.rows[row];
      return x === gx && y === gy && String(Number(x === '1' && z === '1')) === both &&
        String(Number(x === '1' || z === '1')) === either;
    }));
  }
});

test('問3は表示する逆ポーランド表記をスタックで解釈して符号付きの全候補と比較する', () => {
  for (const body of cases(3)) {
    const prompt = paragraphs(body), values = Object.fromEntries([...prompt.matchAll(/([A-E])＝(\d)/g)].map(m => [m[1], +m[2]]));
    const stream = prompt.match(/式([A-E＋－／＊]+)の演算結果/)![1], stack: number[] = [];
    for (const token of stream) {
      if (token in values) stack.push(values[token]);
      else {
        const right = stack.pop()!, left = stack.pop()!;
        assert(Number.isInteger(left) && Number.isInteger(right));
        stack.push(arithmetic(token, left, right));
      }
    }
    assert.equal(stack.length, 1);
    unique(body, block => paperInteger(textOf(block)) === stack[0]);
    assert(body.explanation.includes(String(stack[0]) + 'になる'));
  }
});

test('問5はアドレスから双方向リストを復元し挿入前後の既存セルを全件比較する', () => {
  for (const body of cases(5)) {
    const [a, b] = paragraphs(body).match(/社員([A-Z])と社員([A-Z])の間/)!.slice(1);
    const before = tableOf(body.prompt[1]).rows, after = tableOf(body.prompt[2]).rows;
    assert.equal(before.length, 3); assert.equal(after.length, 4);
    const addressByName = Object.fromEntries(after.map(([address, name]) => [name.slice(-1), address]));
    const ordered: string[] = [];
    let current = before.find(([, , , previous]) => previous === '0')!;
    while (current && ordered.length < before.length) {
      ordered.push(current[1].slice(-1));
      current = before.find(([address]) => address === current[2])!;
    }
    assert.equal(ordered.length, 3);
    assert.equal(current, undefined);
    const insertAt = ordered.indexOf(a) + 1;
    assert.equal(ordered[insertAt], b);
    ordered.splice(insertAt, 0, 'G');
    const changed = after.slice(0, -1).flatMap(([address, name, next, previous]) => {
      const pos = ordered.indexOf(name.slice(-1)), old = before.find(row => row[0] === address)!;
      const expected = [addressByName[ordered[pos + 1]] || '0', addressByName[ordered[pos - 1]] || '0'];
      return [next, previous].filter((_, i) => old[i + 2] !== expected[i]);
    }).sort();
    unique(body, block => textOf(block) === changed.join(', '));
  }
});

test('問9は表の命令群の全サイクルを整数で合計して、GHzと小数1桁のミリ秒を照合する', () => {
  for (const body of cases(9)) {
    const prompt = paragraphs(body);
    const count = Number(prompt.match(/合計([0-9,]+)命令/)![1].replaceAll(',', '')), ghz = Number(prompt.match(/(\d+) GHz/)![1]);
    const rows = tableOf(body.prompt[1]).rows;
    assert.equal(rows.reduce((n, row) => n + +row[2], 0), 100);
    const cycles = rows.reduce((sum, [, cpi, ratio]) => sum + BigInt(count / 100 * +ratio * +cpi), 0n);
    unique(body, block => {
      const option = textOf(block);
      assert.match(option, /^\d+\.\d$/);
      return BigInt(option.replace('.', '')) * BigInt(ghz * 1_000_000) === cycles * 10n;
    });
  }
});

test('問10は各候補のヒット率で100回のアクセスを割り振り、両CPUで同じ総時間になるかを判定する', () => {
  for (const body of cases(10)) {
    const [[, cx, cy], [, mx, my]] = tableOf(body.prompt[3]).rows;
    unique(body, block => {
      const ratio = textOf(block);
      assert.match(ratio, /^0\.\d{2}$/);
      const hit = Number(ratio.slice(2));
      return hit * +cx + (100 - hit) * +mx === hit * +cy + (100 - hit) * +my;
    });
    assert.match(paragraphs(body), /CPU処理以外の影響はない/);
    assert.match(paragraphs(body), /単位　ナノ秒/);
  }
});

test('問12は半回転を表す分数を使い、全候補の丸め距離を整数で比較する', () => {
  for (const body of cases(12)) {
    const prompt = paragraphs(body), rpm = Number(prompt.match(/回転数が([0-9,]+)/)![1].replaceAll(',', ''));
    const seek = Number(prompt.match(/平均位置決め時間が(\d+)ミリ秒/)![1]);
    const errors = body.choices.map(([block]) => Math.abs((paperInteger(textOf(block)) - seek) * rpm - 30_000));
    unique(body, (_, index) => errors[index] === Math.min(...errors));
    assert.match(prompt, /平均位置決め時間と平均回転待ち時間の合計/);
  }
});

test('問14は役割と接続条件の両方を四構成図に当てはめる', () => {
  for (const body of cases(14)) {
    const prompt = paragraphs(body);
    unique(body, block => {
      const { alt } = diagramOf(block);
      const hasRoles = /(?:^|[と，に。])APサーバ(?:[，とがはに]|$)/.test(alt) && /(?:^|[と，に。])DBサーバ(?:[，とがはに]|$)/.test(alt);
      if (!hasRoles) return false;
      if (prompt.includes('両方のネットワークに接続するのはAPサーバだけ')) {
        return alt === '上のネットワークにDBサーバとAPサーバ，下のネットワークにAPサーバとクライアントが接続。';
      }
      if (prompt.includes('DBサーバはそのネットワークに接続せず')) {
        return alt === 'APサーバとクライアントは同じネットワークに接続。DBサーバはAPサーバに専用の線で直接接続。';
      }
      if (prompt.includes('クライアントはそのネットワークに接続せず')) {
        return alt === 'DBサーバとAPサーバは同じネットワークに接続。クライアントはAPサーバに専用の線で直接接続。';
      }
      return true;
    });
    assert.match(prompt, /APはアプリケーションを，DBはデータベース/);
  }
});

test('問15は三つの経過区間から実際の終了時刻を構成し、各関係式の符号を照合する', () => {
  const timelines = [[11, 13, 17], [8, 17, 5], [6, 3, 12]];
  for (const body of cases(15)) {
    unique(body, block => timelines.every(([cpu, io, wait]) => {
      const times: Record<string, number> = { 'CPU時間': cpu, '入出力時間': io, '処理待ち時間': wait,
        'ターンアラウンドタイム': cpu + io + wait };
      const [left, expression] = textOf(block).split(' ＝ ');
      const terms = expression.split(' ');
      const computed = terms.slice(1).reduce((n, op, i) => i % 2 === 0 ? arithmetic(op, n, times[terms[i + 2]]) : n, times[terms[0]]);
      return times[left] === computed;
    }));
    assert.match(paragraphs(body), /ほかのオーバヘッド時間は考慮しない/);
  }
});

function upProbability(alt: string, r: number) {
  const double = alt.includes('2組'), devices = double ? 4 : 2;
  const serialFirst = alt.includes('直列にした組'), simpleParallel = alt === '装置2台を並列に接続。';
  let result = 0;
  for (let state = 0; state < 2 ** devices; state++) {
    const [a, b, c, d] = Array.from({ length: devices }, (_, i) => Boolean(state & 1 << i));
    const works = double ? serialFirst ? (a && b) || (c && d) : (a || b) && (c || d) : simpleParallel ? a || b : a && b;
    if (works) {
      const up = state.toString(2).replaceAll('0', '').length;
      result += r ** up * (1 - r) ** (devices - up);
    }
  }
  return result;
}
test('問16は装置の全稼働状態を列挙し各図の稼働確率を加算して順位を求める', () => {
  for (const body of cases(16)) {
    const match = paragraphs(body).match(/稼働率が(0\.\d).*，([1-4])番目/)!, r = +match[1], rank = +match[2];
    const options = body.choices.map(([block]) => upProbability(diagramOf(block).alt, r));
    const target = [...options].sort((a, b) => b - a)[rank - 1];
    unique(body, (_, i) => options[i] === target);
    assert.match(paragraphs(body), /少なくともどちらか一方が稼働/);
  }
});

test('問17は候補台数と1台少ない場合の1秒当たり入出力能力を全候補で判定する', () => {
  for (const body of cases(17)) {
    const prompt = paragraphs(body), rate = Number(prompt.match(/(\d+)件／秒/)![1]), count = Number(prompt.match(/(\d+)回の磁気/)![1]);
    const io = Number(prompt.match(/(\d+)ミリ秒／回/)![1]);
    unique(body, block => {
      const devices = paperInteger(textOf(block));
      return 1000 * devices >= rate * count * io && 1000 * (devices - 1) < rate * count * io;
    });
    assert.match(prompt, /CPU処理時間は十分に短い/);
    assert.match(prompt, /均等にアクセス/);
  }
});

function formulaValue(formula: string, values: Record<string, number>) {
  const precedence: Record<string, number> = { '＊': 4, '／': 3, '＋': 2, '－': 1 };
  const tokens = [...formula.replaceAll(' ', '')];
  let i = 0;
  const parse = (minimum: number): number => {
    const token = tokens[i++];
    let left: number;
    if (token === '(') { left = parse(1); assert.equal(tokens[i++], ')'); }
    else { assert(token in values); left = values[token]; }
    while ((precedence[tokens[i]] ?? 0) >= minimum) {
      const op = tokens[i++];
      left = arithmetic(op, left, parse(precedence[op] + 1));
    }
    return left;
  };
  const result = parse(1);
  assert.equal(i, tokens.length);
  return result;
}
test('問22は5行の3アドレス命令を実行し、原資料の優先順位で解析した四式と比較する', () => {
  const inputs = [[7, 18, 3, 14, 2, 1], [11, 32, 8, 27, 3, 4], [3, 45, 5, 21, 3, 2]];
  for (const body of cases(22)) {
    const block = body.prompt[1]; assert(block.type === 'code');
    const instructions = block.text.split('\n').map(line => line.match(/^([／＋－＊]) \((\w+), (\w+), (\w+)\)$/)!.slice(1));
    assert.equal(instructions.length, 5);
    assert.match(paragraphs(body), /優先順位の高い順に＊，／，＋，－/);
    unique(body, block => inputs.every(input => {
      const registers = Object.fromEntries([... 'bcdefg'].map((name, i) => [name, input[i]]));
      const program = { ...registers };
      for (const [op, a, b, target] of instructions) {
        assert(a in program && b in program);
        program[target] = arithmetic(op, program[a], program[b]);
      }
      return Math.abs(program.x - formulaValue(textOf(block), registers)) < 1e-10;
    }));
  }
});

test('問23は16進数のビットを出力ポートの順に戻し各LED図の点灯・消灯と照合する', () => {
  const ports = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'Dt'];
  for (const body of cases(23)) {
    const prompt = paragraphs(body), value = parseInt(prompt.match(/16進数で([0-9A-F]{2})/)![1], 16);
    const levels = value.toString(2).padStart(8, '0').split('').reverse();
    unique(body, block => {
      const [on, off] = diagramOf(block).alt.match(/^点灯 (.+)。消灯 (.+)。$/)!.slice(1).map(part => part.split('・'));
      assert.equal(new Set([...on, ...off]).size, 8);
      return ports.every((port, i) => (levels[i] === '1' ? on : off).includes(port));
    });
    assert.match(prompt, /P7を最上位ビット（MSB），P0を最下位ビット（LSB）/);
    assert.match(prompt, /ポート出力が1のとき/);
    assert.match(diagramOf(body.prompt[1]).alt, /抵抗を介して順にLEDのa，b，c，d，e，f，g，Dtへ接続/);
  }
});

test('問26は配線のNOT・二段ゲートを全4入力で評価して要求された論理関数を選ぶ', () => {
  const gate: Record<string, (a: boolean, b: boolean) => boolean> = {
    AND: (a, b) => a && b, OR: (a, b) => a || b, NAND: (a, b) => !a || !b, NOR: (a, b) => !a && !b,
  };
  const conditions: Record<string, (a: boolean, b: boolean) => boolean> = {
    '同じ': (a, b) => a === b, '異なる': (a, b) => a !== b,
    'ともに0の': (a, b) => !a && !b, 'ともに1の': (a, b) => a && b,
  };
  for (const body of cases(26)) {
    const condition = paragraphs(body).match(/値が(同じ|異なる|ともに[01]の)とき/)![1];
    unique(body, block => {
      const [up, low, final] = diagramOf(block).alt.match(/上段(\w+)にXとY，下段(\w+)にNOT XとNOT Yを入力。両段の出力を(\w+)に入力/)!.slice(1);
      return [false, true].every(x => [false, true].every(y => gate[final](gate[up](x, y), gate[low](!x, !y)) === conditions[condition](x, y)));
    });
  }
});

for (const [n, rows] of Object.entries(facts)) {
  test('問' + n + 'の全知識条件と四択を査読資料に照合する', () => {
    const used = new Set<RegExp>();
    for (const body of cases(Number(n))) {
      const matches = rows.filter(([condition]) => condition.test(paragraphs(body)));
      assert.equal(matches.length, 1);
      const [condition, answer] = matches[0];
      unique(body, block => answer.test(textOf(block)));
      used.add(condition);
    }
    assert.equal(used.size, 4);
  });
}

test('作図の全6プロフィール・42状態を描き、SVGの実参照と原図の構成要素を照合する', () => {
  const seen = new Set<string>();
  for (const [i] of definitions.entries()) for (const body of cases(i + 1)) {
    for (const block of [...body.prompt, ...body.choices.flat()]) {
      if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
      const { profile, values } = block.scene, key = profile + ':' + values;
      if (seen.has(key)) continue;
      seen.add(key);
      const figure = figures.find(item => item.profile === profile), renderer = renderers.find(item => item.profile === profile);
      assert(figure && renderer);
      figure.validate(values); assert.equal(figure.alt(values), block.alt);
      for (const bad of [[-1], [100], [NaN], [0, 1], []]) assert.throws(() => figure.validate(bad));
      const html = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
      const titleId = html.match(/aria-labelledby="([^"]+)"/)?.[1], descId = html.match(/aria-describedby="([^"]+)"/)?.[1];
      assert(titleId && descId && html.includes('<title id="' + titleId + '"') && html.includes('<desc id="' + descId + '"'));
      assert.match(html, /role="img"/); assert.match(html, /tabindex="0"/);
      assert.match(html, /var\(--diagram-ink\)/);
      if (profile.endsWith('-logic')) {
        assert.equal([...html.matchAll(/data-inverter="true"/g)].length, 2);
        assert.equal([...html.matchAll(/data-gate="[0-3]"/g)].length, 3);
      }
      if (profile.endsWith('-led-wiring')) assert.equal([...html.matchAll(/data-port="[0-7]"/g)].length, 8);
      if (profile.endsWith('-led-state')) assert.equal([...html.matchAll(/data-segment="/g)].length, 8);
    }
  }
  assert.equal(figures.length, 6); assert.equal(renderers.length, 6); assert.equal(seen.size, 42);
});
