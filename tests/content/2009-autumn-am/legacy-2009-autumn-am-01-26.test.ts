import assert from 'node:assert/strict';
import { win32 } from 'node:path';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2009AutumnAm01To26Definitions as definitions } from '../../../src/core/generators/legacy-2009-autumn-am-01-26';
import { legacy2009AutumnAm0126Figures as figures } from '../../../src/core/generators/legacy-2009-autumn-am-01-26-figures';
import { legacy2009AutumnAm0126FigureRenderers as renderers } from '../../../src/ui/Legacy2009AutumnAm0126Figures';
import { autumn2009AmFacts } from '../../fixtures/legacy-2009-autumn-am-01-26-facts';

const officialKeys = 'エアウアアウウエウイウアエアアイエウエアウアウイウウ';
const cases = (number: number) => {
  const definition = definitions[number - 1];
  return Array.from({ length: definition.fields[0].maximum + 1 }, (_, index) => definition.build([index]));
};
const paragraphs = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const blockText = (block: Block) => {
  assert(block.type === 'paragraph' || block.type === 'formula');
  return block.text;
};
const promptDiagram = (body: GeneratedBody) => {
  const block = body.prompt.find(block => block.type === 'diagram');
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  return block;
};
function unique(body: GeneratedBody, accepts: (block: Block, index: number) => boolean) {
  const matches = body.choices.flatMap(([block], index) => accepts(block, index) ? [index] : []);
  assert.deepEqual(matches, [body.correctIndex], paragraphs(body));
}

test('公式正答、26系列、108条件、432選択肢、媒体、決定性と範囲外拒否を確認する', () => {
  assert.equal(definitions.length, 26);
  let states = 0;
  for (const [i, definition] of definitions.entries()) {
    const bodies = cases(i + 1);
    const first = bodies[0];
    assert.equal(definition.source, '2009h21a-fe-am-' + (i + 1));
    assert.equal(definition.sourceAnswer, officialKeys[i]);
    assert.equal('アイウエ'[first.correctIndex!], officialKeys[i]);
    assert.deepEqual(definition.reference, [0]);
    assert.equal(definition.version, '3.7.0');
    assert.equal(definition.fields[0].minimum, 0);
    assert.equal(bodies.length, i === 24 ? 8 : 4);
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, bodies.length);
    assert.equal(new Set(bodies.map(body => body.correctIndex)).size === 1, definition.answerVariation === 'fixed');
    for (const [index, body] of bodies.entries()) {
      assert.deepEqual(body, definition.build([index]));
      assert.deepEqual(body.prompt.map(block => block.type), first.prompt.map(block => block.type));
      assert.deepEqual(body.choices.map(choice => choice.map(block => block.type)), first.choices.map(choice => choice.map(block => block.type)));
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(choice => JSON.stringify(choice))).size, 4);
      assert(body.explanation.length > 35);
      states++;
    }
    for (const values of [[-1], [bodies.length], [0.5], [NaN], [], [0, 0], Array<number>(1)]) {
      assert.throws(() => definition.build(values), { code: 'PARAMETER_CONSTRAINT' });
    }
  }
  assert.equal(states, 108);
});

test('問1の床関数は正の有理数の桁処理を保ち、全補正を整数で判定する', () => {
  for (const body of cases(1)) {
    const prompt = paragraphs(body);
    const position = Number(prompt.match(/小数第(\d+)位を四捨五入/)![1]);
    const scale = 10 ** (position - 1);
    assert(prompt.includes('S＞0') && prompt.includes('[X]はX以下で最大の整数'));
    const offsets = body.choices.map(([block]) => {
      assert(block.type === 'formula' && block.format === 'latex');
      const [, sign, digit] = block.alt.match(/([＋－])0\.([45])\]/)!;
      return Number(digit) * (sign === '－' ? -1 : 1);
    });
    assert.deepEqual(offsets, [-5, -4, 4, 5]);
    unique(body, (block, index) => {
      assert(block.type === 'formula' && block.format === 'latex');
      if (scale === 1) assert.match(block.alt, /^\[S\/N[＋－]0\.[45]\]$/);
      else assert(block.alt.startsWith('[(S/N)×' + scale) && block.alt.endsWith(']/' + scale));
      const offset = offsets[index] * 10;
      const signedDecimal = offsets[index] < 0 ? String(offsets[index] / 10) : '+' + offsets[index] / 10;
      const factor = scale === 1 ? '' : '\\times ' + scale;
      const floor = '\\left[\\frac{S}{N}' + factor + signedDecimal + '\\right]';
      assert.equal(block.text, scale === 1 ? floor : '\\frac{' + floor + '}{' + scale + '}');
      for (let numerator = 1; numerator <= 300; numerator++) {
        const retained = Math.trunc(numerator / 100);
        const nextDigit = Math.trunc(numerator / 10) % 10;
        const expected = retained + Number(nextDigit >= 5);
        if (Math.floor((numerator + offset) / 100) !== expected) return false;
      }
      return true;
    });
    assert.match(body.explanation, /0\.5以上/);
  }
});

test('問2の浮動小数点式の各記号と全候補の対応を照合する', () => {
  for (const body of cases(2)) {
    const [, multiplier, base, raised] = paragraphs(body).match(/a＝([fre])×([fre])([ᶠʳᵉ])/)!;
    const power = { 'ᶠ': 'f', 'ʳ': 'r', 'ᵉ': 'e' }[raised];
    const roles = { 仮数: multiplier, 基数: base, 指数: power };
    unique(body, block => {
      const claims = [...blockText(block).matchAll(/([fre])を(仮数|基数|指数)/g)];
      assert.equal(claims.length, 3);
      return claims.every(([, symbol, role]) => roles[role as keyof typeof roles] === symbol);
    });
    assert(body.explanation.includes(multiplier + 'が仮数') && body.explanation.includes(base + 'が基数') &&
      body.explanation.includes(power + 'が指数'));
  }
});

function toPostfix(infix: string) {
  const precedence: Record<string, number> = { '＋': 1, '－': 1, '÷': 2 };
  const operators: string[] = [];
  let output = '';
  for (const token of infix) {
    if (/^[A-G]$/.test(token)) output += token;
    else if (token === '(') operators.push(token);
    else if (token === ')') {
      while (operators.at(-1) !== '(') {
        assert(operators.length);
        output += operators.pop();
      }
      operators.pop();
    } else {
      assert(precedence[token]);
      while (operators.length && (precedence[operators.at(-1)!] ?? 0) >= precedence[token]) output += operators.pop();
      operators.push(token);
    }
  }
  return output + operators.reverse().join('');
}

test('問3は中置式から後置式に変換して全候補を逆方向に検算する', () => {
  for (const body of cases(3)) {
    const postfix = paragraphs(body).match(/“([^”]+)”/)![1];
    assert.equal([...postfix].filter(token => /[A-G]/.test(token)).sort().join(''), 'ABCDEFG');
    unique(body, block => toPostfix(blockText(block)) === postfix);
    assert.match(body.explanation, /右辺.*左辺/);
  }
});

test('問5は逆順にpopを相殺して残る二件を求める', () => {
  for (const body of cases(5)) {
    const steps = paragraphs(body).split('\n').at(-1)!.split(' → ');
    assert.equal(steps.filter(step => step.startsWith('push')).length, 5);
    assert.equal(steps.filter(step => step === 'pop').length, 3);
    let outstanding = 0;
    const remaining: number[] = [];
    for (const step of [...steps].reverse()) {
      if (step === 'pop') outstanding++;
      else if (outstanding) outstanding--;
      else remaining.push(Number(step.match(/^push ([1-5])$/)![1]));
    }
    assert.equal(outstanding, 0);
    assert.equal(remaining.length, 2);
    const result = remaining.sort((a, b) => a - b).join('と');
    assert.deepEqual(body.choices.map(([block]) => blockText(block)), ['1と3', '2と4', '2と5', '4と5']);
    unique(body, block => blockText(block) === result);
    assert(body.explanation.includes(result + 'が残る'));
  }
});

test('問12は実際のビット並びと格納先の数からストライピングを判定する', () => {
  const bitNumber = (text: string) => Number([...text].map(symbol => '₀₁₂₃₄₅₆₇₈₉'.indexOf(symbol)).join(''));
  for (const body of cases(12)) {
    const diagram = promptDiagram(body);
    const diskColumns = [...diagram.alt.matchAll(/データディスク(\d+)は([b₀-₉・]+)/g)].map(([_, disk, bits]) =>
      ({ disk: Number(disk), bits: bits.split('・').map(bit => bitNumber(bit.slice(1))) }));
    assert(diskColumns.length >= 3);
    const order = new Map<number, number>();
    for (const { disk, bits } of diskColumns) for (const bit of bits) {
      assert(!order.has(bit));
      order.set(bit, disk);
    }
    const end = bitNumber(paragraphs(body).match(/b₀〜b([₀-₉]+)/)![1]);
    assert.equal(order.size, end + 1);
    const distributes = [...Array(end + 1).keys()].every(bit => order.get(bit) === (bit % diskColumns.length) + 1);
    assert(distributes);
    unique(body, block => ({
      ストライピング: distributes,
      ディスクキャッシュ: /キャッシュ/.test(diagram.alt),
      ブロック化: diskColumns.length === 1,
      ミラーリング: diskColumns.every(column => column.bits.length === end + 1),
    })[blockText(block)] === true);
    assert.match(body.explanation, /複数台で並行/);
  }
});

test('問13はファイルごとに空きセクタをブロックずつ加えて独立検算する', () => {
  for (const body of cases(13)) {
    const prompt = paragraphs(body).replace(/,/g, '');
    const [, sector, block, first, second] = prompt.match(/(\d+)バイトのセクタ(\d+)個.*?(\d+)バイト及び(\d+)バイト/)!.map(Number);
    assert.match(prompt, /管理情報が占めるセクタは考慮しない/);
    const blocks = [first, second].map(file => {
      let sectors = 0;
      while (sector * sectors < file) sectors += block;
      return sectors;
    });
    const total = blocks[0] + blocks[1];
    const options = body.choices.map(([choice]) => Number(blockText(choice)));
    assert.deepEqual(options, [...options].sort((a, b) => a - b));
    assert(options.every((option, index) => index === 0 || option - options[index - 1] >= 1));
    unique(body, choice => Number(blockText(choice)) === total);
    assert(body.explanation.includes('合計は' + total + 'セクタ'));
  }
});

test('問14はサービス提供側、密結合の不要、端末とサーバの役割を全候補で確認する', () => {
  const roles = [
    /サーバがサービスを提供|サーバが.+の機能を提供/,
    /密結合システムを採用|密結合の構成が必要/,
    /サーバからの要求.+サービス(?:を|として)提供/,
    /サービスを提供するクライアント.+データベース|サービスを提供する側は利用端末.+データベース/,
  ];
  for (const body of cases(14)) {
    const patterns = body.choices.map(([block]) => roles.filter(role => role.test(blockText(block))));
    assert(patterns.every(matches => matches.length === 1));
    assert.equal(new Set(patterns.flat()).size, 4);
    unique(body, block => roles[0].test(blockText(block)));
    assert.match(body.explanation, /クライアントは要求を送り.*サーバがサービスを提供/);
  }
});

test('問16はA・B・Cの8状態を列挙し、各接続モデルの稼働率を確かめる', () => {
  for (const body of cases(16)) {
    const prompt = paragraphs(body);
    const working = Number(prompt.match(/稼働率は，すべて(0\.\d)/)![1]) * 10;
    assert.match(prompt, /いずれか1台でも稼働.*互いに独立/);
    assert.match(promptDiagram(body).alt, /AとBの右で合流.*Cを直列/);
    const results = [0, 0, 0, 0];
    for (const a of [false, true]) for (const b of [false, true]) for (const c of [false, true]) {
      const weight = [a, b, c].reduce((product, up) => product * (up ? working : 10 - working), 1);
      const functioning = [a && b && c, (a || b) && c, (a && b) || c, a || b || c];
      functioning.forEach((up, index) => { if (up) results[index] += weight; });
    }
    const options = body.choices.map(([block]) => blockText(block));
    assert.deepEqual(options, results.map(value => (value / 1000).toFixed(3)));
    assert.deepEqual(options, [...options].sort());
    unique(body, block => Number(blockText(block)) === results[1] / 1000);
    assert(body.explanation.includes(options[1]));
  }
});

test('問17は1秒当たりの命令数と回数分のアクセスを別計算して比較する', () => {
  for (const body of cases(17)) {
    const prompt = paragraphs(body);
    const [, instructions, times, mips, each] = prompt.match(/平均(\d+)万命令.*平均(\d+)回.*CPU性能が(\d+)MIPS.*平均アクセス時間は(\d+)ミリ秒/)!.map(Number);
    const cpu = (instructions * 10_000) / (mips * 1_000_000) * 1_000;
    const disk = Array(times).fill(each).reduce((total, time: number) => total + time, 0);
    const result = cpu + disk;
    assert.match(prompt, /当該トランザクション以外の処理は発生しない/);
    const options = body.choices.map(([block]) => Number(blockText(block)));
    assert.deepEqual(options, [...options].sort((a, b) => a - b));
    unique(body, block => Number(blockText(block)) === result);
    assert(body.explanation.includes('合計は' + result + 'ミリ秒'));
  }
});

test('問19はWindows形式の経路解決で、図の実在パスと五つの指定方法を照合する', () => {
  const tree = new Set(['¥', '¥A', '¥B', '¥A¥A', '¥A¥B', '¥B¥A', '¥B¥B', '¥A¥A¥A', '¥A¥B¥A', '¥A¥B¥B']);
  for (const body of cases(19)) {
    const text = paragraphs(body);
    assert.equal([...text.matchAll(/（[1-5]）/g)].length, 5);
    const sequence = text.match(/カレントディレクトリを(.+)の順に移動/)![1].split(' → ');
    let current = 'C:\\';
    for (const part of sequence) {
      current = win32.resolve(current, part.replaceAll('¥', '\\'));
      assert(tree.has(current.slice(2).replaceAll('\\', '¥')));
    }
    const destination = current.slice(2).replaceAll('\\', '¥');
    assert.deepEqual(body.choices.map(([block]) => blockText(block)), ['¥A', '¥A¥A', '¥A¥B¥A', '¥B¥A']);
    unique(body, block => blockText(block) === destination);
    assert(body.explanation.includes(destination + 'へ移動'));
  }
});

test('問21はGPL対象実行物の対外提供の有無と条件を全候補で確認する', () => {
  const facts = [
    /独立して動き.*別のプロセス.*インタフェースだけを販売/,
    /自社内でだけ使用|自社の指示・管理下.*契約関係の外への複製を禁止/,
    /実行形式だけで自社外の顧客へ販売/,
    /性能測定にだけ利用.*別に開発したソフトウェアだけを販売/,
  ];
  for (const body of cases(21)) {
    const prompt = paragraphs(body);
    assert.match(prompt, /ライセンス違反となる/);
    assert.match(prompt, /対応するソースコードを配布先に提供せず.*取得できる案内も付けなかった/);
    const roles = body.choices.map(([block]) => facts.filter(fact => fact.test(blockText(block))));
    assert(roles.every(matches => matches.length === 1));
    assert.equal(new Set(roles.flat()).size, 4);
    unique(body, block => facts[2].test(blockText(block)));
    assert.match(body.explanation, /受領者が対応するソースコードを取得.*受領者への提供とインターネットへの一般公開は別/);
  }
});

test('問24は4入力行を各候補の論理演算に代入し、指定された出力条件を検算する', () => {
  const gates: Record<string, (a: number, b: number) => number> = {
    AND回路: (a, b) => a & b, NAND回路: (a, b) => 1 ^ (a & b),
    OR回路: (a, b) => a | b, XOR回路: (a, b) => a ^ b,
  };
  for (const body of cases(24)) {
    const [, condition, out] = paragraphs(body).match(/A，Bが(ともに[01]|異なる)(?:の)?ときだけ，出力Xが([01])/)!;
    unique(body, block => {
      const gate = gates[blockText(block)];
      assert(gate);
      return [[0, 0], [0, 1], [1, 0], [1, 1]].every(([a, b]) => {
        const applicable = condition === '異なる' ? a !== b : a === Number(condition.at(-1)) && b === a;
        return (gate(a, b) === Number(out)) === applicable;
      });
    });
    assert(body.explanation.includes(blockText(body.choices[body.correctIndex!][0]).replace('回路', '')));
  }
});

test('問25は全8入力を多数決と排他的論理和で検算し、全選択肢の列と順を保つ', () => {
  const inputs = new Set<string>();
  for (const body of cases(25)) {
    const [x, y, z] = paragraphs(body).match(/xに([01])，yに([01])，zに([01])/)!.slice(1).map(Number);
    inputs.add('' + x + y + z);
    const expected = [String((x & y) | (y & z) | (z & x)), String(x ^ y ^ z)];
    const values = body.choices.map(([block]) => {
      assert(block.type === 'table');
      assert.deepEqual(block.columns, ['c', 's']);
      assert.equal(block.rows.length, 1);
      return block.rows[0];
    });
    assert.deepEqual(values, [['0', '0'], ['0', '1'], ['1', '0'], ['1', '1']]);
    unique(body, (_, index) => values[index].join('') === expected.join(''));
    assert(body.explanation.includes('商' + expected[0]) && body.explanation.includes('余り' + expected[1]));
  }
  assert.equal(inputs.size, 8);
});

for (const [number, facts] of Object.entries(autumn2009AmFacts)) {
  test('問' + number + 'の問いと全候補の真偽を査読済みの知識対応表から判定する', () => {
    const targets = new Set<RegExp>();
    for (const body of cases(Number(number))) {
      const prompt = paragraphs(body);
      const match = facts.filter(fact => fact.target.test(prompt));
      assert.equal(match.length, 1);
      targets.add(match[0].target);
      const classified = body.choices.map(([block]) => facts.filter(fact => fact.description.test(blockText(block))));
      assert(classified.every(matches => matches.length === 1));
      assert.equal(new Set(classified.flat()).size, 4);
      unique(body, block => match[0].description.test(blockText(block)));
    }
    assert.equal(targets.size, Number(number) === 18 ? 2 : 4);
  });
}

test('5図の登録・表示・代替説明とストライピングの描画全条件を確認する', () => {
  assert.equal(figures.length, 5);
  assert.deepEqual(figures.map(item => item.profile), renderers.map(item => item.profile));
  for (const number of [12, 16, 19, 24, 25]) {
    for (const body of cases(number)) {
      const block = promptDiagram(body);
      assert(block.scene.kind === 'source_figure');
      const { profile, values } = block.scene;
      const definition = figures.find(item => item.profile === profile);
      const renderer = renderers.find(item => item.profile === profile);
      assert(definition && renderer);
      definition.validate(values);
      assert.throws(() => definition.validate([definition.domain[0][1] + 1]), { code: 'FIGURE_PROFILE' });
      assert.equal(definition.alt(values), block.alt);
      const markup = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
      assert(markup.includes('data-source-figure="' + definition.profile + '"'));
      assert(markup.includes('role="img"') && markup.includes('aria-labelledby=') && markup.includes('aria-describedby=') && markup.includes('tabindex="0"'));
      assert(markup.includes('class="diagram-scroll"') && markup.includes('<desc'));
      assert(markup.includes('var(--diagram-ink)'));
      assert(!markup.includes('<figcaption'));
      if (number === 12) {
        const expectedDisks = [...block.alt.matchAll(/データディスク\d+は/g)].length;
        assert.equal([...markup.matchAll(/data-disk="/g)].length, expectedDisks);
        for (const bit of block.alt.match(/b[₀-₉]+/g)!) assert(markup.includes('>' + bit + '</text>'));
      }
    }
  }
});
