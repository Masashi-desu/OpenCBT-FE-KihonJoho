import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2013SpringAm01To26Definitions as definitions } from '../src/core/generators/legacy-2013-spring-am-01-26';
import { legacy2013SpringAm0126Figures as figures } from '../src/core/generators/legacy-2013-spring-am-01-26-figures';
import originals from '../src/core/generators/legacy-2013-spring-am-01-26-source.json';
import { legacy2013SpringAm0126FigureRenderers as renderers } from '../src/ui/Legacy2013SpringAm0126Figures';
import { knowledgeReview } from './fixtures/legacy-2013-spring-am-01-26-knowledge-review';

const marks = 'アイウエ';
const officialKeys = 'イウウアウアイイアアイイエアアアエウアウエエエウイイ';
const cases = (number: number) => {
  const definition = definitions[number - 1];
  return Array.from({ length: definition.fields[0].maximum + 1 }, (_, index) => definition.build([index]));
};

type Block = GeneratedBody['prompt'][number];
const prompt = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
function choices(body: GeneratedBody) {
  return body.choices.map(([block]) => {
    if (block.type === 'paragraph') return block.text;
    assert(block.type === 'table' && block.rows.length === 1);
    return block.rows[0].join('／');
  });
}
function table(body: GeneratedBody) {
  const block = body.prompt.find(item => item.type === 'table');
  assert(block?.type === 'table');
  return block;
}
function truth(body: GeneratedBody, flags: boolean[]) {
  assert.equal(flags.length, 4);
  assert.deepEqual(flags.flatMap((flag, i) => flag ? [i] : []), [body.correctIndex]);
}
const numeric = (text: string) => Number(text.replaceAll(',', ''));
function ascending(values: number[]) {
  assert(values.every((value, i) => i === 0 || value > values[i - 1]), values.join(', '));
}
function svg(block: Block) {
  assert(block.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const semantic = figures.find(figure => figure.profile === profile), renderer = renderers.find(entry => entry.profile === profile);
  assert(semantic && renderer);
  semantic.validate(values);
  assert.equal(semantic.alt(values), block.alt);
  const markup = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
  assert.match(markup, /aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
  assert(markup.includes('<desc') && markup.includes('var(--diagram-ink)') && markup.includes('var(--image-scale, 1)'));
  return markup;
}
function labels(markup: string) {
  return [...markup.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map(match =>
    match[1].replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&'));
}

test('2013春期午前問1〜26の公式解答・原形式・全有限入力・本文の可変性', () => {
  assert.equal(originals.length, 26);
  assert.equal(definitions.length, 26);
  assert.equal(originals.map(row => row.sourceKey).join(''), officialKeys);
  let count = 0;
  for (const [i, definition] of definitions.entries()) {
    const number = i + 1, original = originals[i], variants = cases(number), reference = variants[0];
    count += variants.length;
    assert.equal(original.number, number);
    assert.equal(definition.source, '2013h25h-fe-am-' + number);
    assert.equal(definition.sourceAnswer, officialKeys[i]);
    assert.deepEqual(definition.reference, [0]);
    assert.equal(marks[reference.correctIndex!], officialKeys[i]);
    assert(prompt(reference).startsWith(original.prompt), definition.source);
    if (number !== 24) assert.deepEqual(choices(reference), original.choices);
    for (const [value, body] of variants.entries()) {
      assert.deepEqual(body, definition.build([value]));
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(choice => JSON.stringify(choice))).size, 4);
      assert(Number.isInteger(body.correctIndex) && body.correctIndex! >= 0 && body.correctIndex! < 4, definition.source);
      assert(body.explanation.length >= 28);
    }
    const signatures = variants.map(body => JSON.stringify(body.prompt.map(block => block.type === 'diagram' ?
      svg(block).replace(/<desc[^>]*>[^<]+<\/desc>/, '') : block)));
    assert.equal(new Set(signatures).size, variants.length, definition.source);
    assert.equal(new Set(variants.map(body => JSON.stringify(body.choices[body.correctIndex!]))).size, variants.length, definition.source);
    for (const invalid of [[], [0,0], [-1], [definition.fields[0].maximum + 1], [0.5], Array(1)])
      assert.throws(() => definition.build(invalid), /PARAMETER_CONSTRAINT/);
  }
  assert.equal(count, 97);
});

test('問1〜4は桁・情報量・標本時間・パリティの全候補を独立に判定する', () => {
  for (const body of cases(1)) {
    const input = /^(\d+)ビット.*手順を(\d+)回/.exec(prompt(body));
    assert(input);
    const [, width, iterations] = input.map(Number);
    assert.equal(width, iterations * 4);
    assert.match(prompt(body), /［a］をxに代入する。\n（2）xをスタックにプッシュする。/);
    assert.match(prompt(body), /nを［b］論理シフトする/);
    // Shift and mask are linear bit maps. Each single-bit basis plus zero
    // completely identifies the map; mixed patterns exercise the word width.
    const words = [0, 2 ** width - 1, ...Array.from({ length: width }, (_, i) => 2 ** i)];
    truth(body, choices(body).map(option => {
      const match = /^n AND ([\dA-F]+)₁₆／([左右])に4ビット$/.exec(option);
      assert(match && match[1].length === iterations);
      const mask = parseInt(match[1], 16).toString(2).padStart(width, '0');
      return words.every(word => {
        let register = word.toString(2).padStart(width, '0');
        const pushes = [];
        for (let i = 0; i < iterations; i++) {
          pushes.push(parseInt([...register].map((bit, position) => mask[position] === '1' ? bit : '0').join(''), 2));
          register = match[2] === '右' ? '0000' + register.slice(0, -4) : register.slice(4) + '0000';
        }
        return pushes.join() === [...word.toString(16).padStart(iterations, '0')].reverse().map(digit => parseInt(digit, 16)).join();
      });
    }));
    assert.match(body.explanation, /右に4ビット/);
  }
  for (const body of cases(2)) {
    const match = /(\d+)個のパルス.*通信路を使って，([^。]+?)の(\d+)種類/.exec(prompt(body));
    assert(match);
    const rate = Number(match[1]), count = Number(match[3]);
    const symbols = [...match[2].matchAll(/([0-9A-Z])〜([0-9A-Z])/g)].reduce((n, range) => n + range[2].charCodeAt(0) - range[1].charCodeAt(0) + 1, 0);
    assert.equal(symbols, count);
    assert.match(prompt(body), /1ビットは1個のパルス.*圧縮は行わない/);
    const lengths = Array.from({ length: 9 }, (_, i) => i);
    const bits = lengths.find(length => new Set(Array.from({ length: 2 ** length }, (_, n) => n.toString(2).padStart(length, '0'))).size >= count)!;
    const values = choices(body).map(Number);
    ascending(values);
    truth(body, values.map(value => value * bits <= rate && (value + 1) * bits > rate));
    assert(body.explanation.includes('＝' + Math.floor(rate / bits) + '文字'));
  }
  for (const body of cases(3)) {
    const match = /([\d,]+)ビットであった。量子化ビット数を(\d+)ビットとする/.exec(prompt(body));
    assert(match);
    const data = numeric(match[1]), bits = Number(match[2]), values = choices(body).map(Number);
    ascending(values);
    truth(body, values.map(interval => interval * data === bits * 1000000));
    assert(body.explanation.includes(values[body.correctIndex!] + 'マイクロ秒'));
  }
  const parityFacts = [
    [/^1ビットの誤りを検出/, /1ビットの誤りを訂正.*2ビット/, /偶数パリティでは1ビット.*検出できない/, /偶数パリティならば偶数個/],
    [/2ビットの誤りを検出/, /3ビットの誤りを検出/, /1ビットの誤りを訂正/, /偶数個のビット誤りだけ/],
    [/2ビットの誤りを検出/, /1ビットの誤りを訂正/, /4ビットの誤りを検出/, /奇数個のビット誤りを検出/],
  ];
  for (const [i, body] of cases(4).entries()) {
    assert.match(prompt(body), i === 0 ? /方式（垂直パリティ）の記述/ : i === 1 ? /偶数パリティ/ : /奇数パリティ/);
    choices(body).forEach((option, j) => assert.match(option, parityFacts[i][j]));
    for (const expected of [0,1]) {
      const clean = expected ? '1000' : '0000';
      const received = Array.from({ length: 16 }, (_, mask) =>
        [...clean].map((bit, k) => Number(bit) ^ ((mask >> k) & 1)));
      received.forEach((word, mask) => {
        const flips = mask.toString(2).replaceAll('0', '').length;
        assert.equal(word.reduce((a,b) => a+b) % 2 !== expected, flips % 2 === 1);
      });
      assert.equal(received.filter(word => word.filter((bit, k) => bit !== Number(clean[k])).length === 1).length, 4);
    }
    truth(body, [[true,false,false,false],[false,true,false,false],[false,false,false,true]][i]);
    assert.match(body.explanation, /反転.*検出/);
  }
});

test('問5〜7は表示された二分探索木・スタック・配列と独立結果を照合する', () => {
  for (const body of cases(5)) {
    const target = Number(/要素(\d+)を削除/.exec(prompt(body))?.[1]), markup = svg(body.prompt[1]);
    assert(markup.includes('data-tree-node="' + target + '" data-tree-target="true"'));
    const edges = [...markup.matchAll(/data-tree-edge="(\d+)-(\d+)"/g)].map(match => [Number(match[1]), Number(match[2])]);
    assert.equal(edges.length, 14);
    const values = choices(body).map(Number);
    ascending(values);
    truth(body, values.map(replacement => {
      const descend = (node: number): number[] => {
        if (node === replacement) return [];
        const children = edges.filter(([parent]) => parent === node).map(([, child]) => child);
        return [...(children[0] ? descend(children[0]) : []), node === target ? replacement : node,
          ...(children[1] ? descend(children[1]) : [])];
      };
      if (edges.some(([parent]) => parent === replacement)) return false;
      const inorder = descend(6);
      return inorder.length === 14 && inorder.every((value, i) => i === 0 || value > inorder[i - 1]);
    }));
  }
  for (const body of cases(6)) {
    const match = /式 ([a-z+]+)を.*最大で(\d+)/.exec(prompt(body).replace('式a', '式 a'));
    assert(match);
    const max = (expression: string) => Math.max(...[...expression].map((_, i) => {
      const prefix = expression.slice(0, i + 1);
      return prefix.replaceAll('+', '').length - prefix.replace(/[a-z]/g, '').length;
    }));
    assert.equal(max(match[1]), Number(match[2]));
    const depths = choices(body).map(option => {
      assert.equal(option.replaceAll('+', ''), match[1].replaceAll('+', ''));
      return max(option);
    });
    truth(body, depths.map(depth => depth === Math.min(...depths)));
    const frames = [...svg(body.prompt[1]).matchAll(/data-stack-frame="([^"]+)"/g)].map(row => row[1].split(','));
    const operands = [...match[1].replaceAll('+', '')];
    assert.deepEqual(frames, operands.map((_, i) =>
      [...operands.slice(0, operands.length - 1 - i), operands.slice(operands.length - 1 - i).join('+')]));
    assert(body.explanation.includes(depths.join('，')));
  }
  for (const body of cases(7)) {
    const match = /a₁＋a₂＋a₃＋a₄＋a₅，(\d+).*，(\d{5})は配列/.exec(prompt(body));
    assert(match);
    const divisor = Number(match[1]), values = choices(body).map(Number), markup = svg(body.prompt[1]);
    const positions = [...markup.matchAll(/data-array-position="([^"]+)"/g)].map(row => row[1]);
    assert.deepEqual(positions, ['0','1','2','⋮',String(divisor - 2),String(divisor - 1)]);
    assert(prompt(body).includes('xを' + divisor + 'で割った余り'));
    let sum = [...match[2]].flatMap(digit => Array(Number(digit)).fill(1)).length;
    while (sum >= divisor) sum -= divisor;
    ascending(values);
    truth(body, values.map(option => option === sum));
    assert(body.explanation.includes('位置' + sum + 'の要素'));
  }
});

test('問8〜10は流れ図の具体入力、命令頻度と表示されたアドレス参照経路を照合する', () => {
  for (const body of cases(8)) {
    const markup = svg(body.prompt[1]), visible = labels(markup).join(';');
    const match = /([qr]) ← 0;([qr]) ← ([xy]);\2 ＜ ([xy]);Yes;終了;No;\2 ← \2 − \4;\1 ← \1 ＋ 1/.exec(visible);
    assert(match && match[1] !== match[2] && match[3] !== match[4]);
    assert(markup.includes('M180 262V273H73V132H180'));
    const scenarios = [1,2,3,4,5,9,16].flatMap(x => [1,2,3,4,5,9,16].map(y => ({x,y})));
    truth(body, choices(body).map(option => scenarios.every(input => {
      const divisor = input[match[4] as 'x'|'y'], initial = input[match[3] as 'x'|'y'];
      let residual = initial, counter = 0;
      while (residual >= divisor) { residual -= divisor; counter++; }
      const output = match[1] === 'q' ? [counter,residual] : [residual,counter];
      return option.split('／').every((part, i) => {
        const formula = /^([xy])÷([xy])の(商|余り)$/.exec(part);
        assert(formula);
        const a = input[formula[1] as 'x'|'y'], b = input[formula[2] as 'x'|'y'];
        return output[i] === (formula[3] === '商' ? Math.trunc(a/b) : a % b);
      });
    })));
    assert.match(body.explanation, /商.*余り/);
  }
  for (const body of cases(9)) {
    const rate = Number(/^(\d+)MIPS/.exec(prompt(body))?.[1]), time = choices(body).map(text =>
      Number.parseFloat(text) * (text.endsWith('マイクロ秒') ? 1000 : 1));
    assert.deepEqual(choices(body).map(text => /^\d+(ナノ秒|マイクロ秒)$/.exec(text)?.[1]), ['ナノ秒','ナノ秒','マイクロ秒','マイクロ秒']);
    ascending(time);
    truth(body, time.map(nanos => nanos * rate === 1000));
    assert(body.explanation.includes(time[body.correctIndex!] + 'ナノ秒'));
  }
  for (const body of cases(10)) {
    const markup = svg(body.prompt[1]), visible = labels(markup);
    const instr = Number(visible[2]), dataAddr = Number(visible[visible.length - 2]);
    assert.equal(visible[visible.length - 1], 'データ');
    const indirect = markup.includes('M488 89Q488 121');
    const addition = visible.includes('＋'), pc = visible.includes('プログラムカウンタ');
    const options = choices(body);
    if (indirect) assert.deepEqual(visible.slice(8,10), [String(instr),String(dataAddr)]);
    else if (addition) assert.equal(instr + Number(visible[visible.indexOf('＋') - 1]), dataAddr);
    else assert.equal(instr, dataAddr);
    truth(body, options.map(option =>
      option === '間接アドレス指定' && indirect ||
      option === '指標アドレス指定' && addition && !pc ||
      option === '相対アドレス指定' && addition && pc ||
      option === '直接アドレス指定' && !indirect && !addition));
    assert(body.explanation.includes(options[body.correctIndex!]));
  }
});

test('問11・13・14・16・20・22・23・25は査読した全選択肢の概念と出題条件を照合する', () => {
  for (const [key, rows] of Object.entries(knowledgeReview)) {
    const variants = cases(Number(key));
    assert.equal(variants.length, rows.length);
    for (const [i, body] of variants.entries()) {
      const row = rows[i];
      assert.match(prompt(body), row.stem);
      assert.match(body.explanation, row.explanation);
      truth(body, choices(body).map((choice, index) => {
        assert.match(choice, row.options[index][1]);
        const matches = row.options.filter(([, pattern]) => pattern.test(choice));
        assert.equal(matches.length, 1);
        return matches[0][0] === row.trueConcept;
      }));
    }
  }
});

test('問12・15は表のアクセス数と直列機器の全状態から、原の小数精度で全択を照合する', () => {
  for (const body of cases(12)) {
    const [cacheX, cacheY, memoryX, memoryY] = table(body).rows.flatMap(row => row.slice(1).map(Number));
    const options = choices(body);
    assert.match(prompt(body), /アクセス時間だけが異なり.*両者の処理時間が等しかった.*CPUの処理以外の影響はない/);
    assert.match(table(body).caption, /単位 ナノ秒/);
    assert.deepEqual(table(body).columns, ['', 'CPU X', 'CPU Y']);
    assert(labels(svg(body.prompt[1])).includes('256kバイト'));
    assert(labels(svg(body.prompt[1])).includes('256Mバイト'));
    ascending(options.map(Number));
    truth(body, options.map(option => {
      assert.match(option, /^0\.\d{2}$/);
      const hits = Number(option.slice(2)), misses = 100 - hits;
      return hits * cacheX + misses * memoryX === hits * cacheY + misses * memoryY;
    }));
    assert(body.explanation.includes('h＝' + options[body.correctIndex!]));
  }
  for (const body of cases(15)) {
    const match = /MTBFが(\d+)時間でMTTRが(\d+)時間/.exec(prompt(body));
    assert(match && prompt(body).includes('二つ直列に接続'));
    const up = Number(match[1]), total = up + Number(match[2]);
    const states = Array.from({ length: total ** 2 }, (_, n) => Number(n % total < up && Math.trunc(n / total) < up));
    const productive = states.reduce((a,b) => a+b);
    const options = choices(body);
    ascending(options.map(Number));
    truth(body, options.map(option => {
      assert.match(option, /^0\.\d{2}$/);
      return Number(option.slice(2)) * total ** 2 === productive * 100;
    }));
    assert(body.explanation.includes('＝' + options[body.correctIndex!]));
  }
});

test('問17・19は表示された原因表と記憶管理・多重度の全組合せを照合する', () => {
  const causeToInvestigation = [
    [/同一マシンに他のシステム.*接続クライアント数/s, '外的要因の変化の確認'],
    [/非定型検索.*SQL文/, '遅い処理の特定'],
    [/フラグメンテーション.*ディスクI\/O/, 'データの格納状況の確認'],
    [/データベースバッファの容量の不足/, 'キャッシュメモリのヒット率の調査'],
  ] as const;
  for (const body of cases(17)) {
    const selected = /調査項目([abcd])として/.exec(prompt(body))?.[1];
    assert(selected);
    assert.deepEqual(table(body).columns, ['想定原因', '調査項目']);
    const alternatives = choices(body);
    const row = table(body).rows.find(([, label]) => label === selected);
    assert(row);
    const expected = causeToInvestigation.find(([cause]) => cause.test(row[0]))?.[1];
    assert(expected);
    truth(body, alternatives.map(choice => choice === expected));
    assert(body.explanation.includes(expected.replace('の調査', 'を調査').replace('の確認', 'を確認').replace('の特定', 'を特定')) ||
      body.explanation.includes(expected));
  }

  const models = [
    [/スラッシングが発生しやすい/, true, true],
    [/ページを主記憶と補助記憶の間で入れ替え.*ページ枠を奪い合いにくい/, true, false],
    [/プログラムの全体を主記憶に配置.*多数並行/, false, true],
    [/プログラムの全体を主記憶に配置.*少数だけ/, false, false],
  ] as const;
  for (const body of cases(19)) {
    const conditions = models.filter(([pattern]) => pattern.test(prompt(body)));
    assert.equal(conditions.length, 1);
    const [, virtual, many] = conditions[0];
    truth(body, choices(body).map(option => {
      const [method, degree] = option.split('／');
      assert(['仮想記憶方式','実記憶方式'].includes(method) && ['大きい','小さい'].includes(degree));
      return (method === '仮想記憶方式') === virtual && (degree === '大きい') === many;
    }));
    assert(body.explanation.includes(virtual ? '仮想記憶方式' : '実記憶方式'));
  }
});

test('問18は1ミリ秒刻みの優先度シミュレーションでCPU遊休時間を検算する', () => {
  for (const body of cases(18)) {
    assert.match(prompt(body), /同時に実行可能.*I\/Oは競合せず.*オーバヘッドは考慮しない/);
    assert(table(body).caption.includes('単位 ミリ秒'));
    const rows = table(body).rows;
    assert.deepEqual(rows.map(([priority]) => priority), ['高','中','低']);
    const processes = rows.map(([, condition]) => [...condition.matchAll(/(?:CPU|I\/O)（(\d+)）/g)].map(match => Number(match[1])));
    const timeline: string[] = [];
    let clock = 0;
    const stages = processes.map(([first]) => ({ phase: 0, left: first, wake: 0 }));
    while (stages.some(stage => stage.phase < 2)) {
      assert(clock < 50);
      const index = stages.findIndex(stage => stage.phase < 2 && stage.wake <= clock);
      if (index === -1) timeline.push('休');
      else {
        timeline.push(rows[index][0]);
        const item = stages[index];
        if (--item.left === 0 && ++item.phase === 1) {
          item.wake = clock + 1 + processes[index][1];
          item.left = processes[index][2];
        }
      }
      clock++;
    }
    const idle = timeline.filter(state => state === '休').length;
    truth(body, choices(body).map(choice => Number(choice) === idle));
    assert(body.explanation.includes('開始から' + timeline.length + 'ミリ秒'));
    assert(body.explanation.includes('遊休時間は' + idle + 'ミリ秒'));
  }
});

test('問21は日曜から装着中テープまでの物理交換と容量を逐次集計する', () => {
  for (const body of cases(21)) {
    const match = /([月火水木金土])曜日に変更されたデータ/.exec(prompt(body));
    assert(match && prompt(body).includes(match[1] + '曜日に変更されたデータの増分バックアップを取得した磁気テープは取り付けられた状態'));
    assert.match(prompt(body), /直前に行ったバックアップとの差分.*1本ごとに取り替える.*以外の時間は無視/);
    const mountedDay = '日月火水木金土'.indexOf(match[1]);
    const specs = new Map(table(body).rows as [string,string][]);
    assert.equal(specs.get('フルバックアップを行う曜日'), '毎週日曜日');
    assert.equal(specs.get('増分バックアップを行う曜日'), '月曜日〜土曜日の毎日');
    const full = Number.parseInt(specs.get('フルバックアップのデータ量')!), perUnit = Number.parseInt(specs.get('磁気テープからのリストア時間')!);
    const changes = Number.parseInt(specs.get('変更されるデータ量')!), perSwap = Number.parseInt(specs.get('磁気テープの取替え時間')!);
    let current = mountedDay, elapsed = 0, swaps = 0;
    for (let day = 0; day <= mountedDay; day++) {
      if (day !== current) { elapsed += perSwap; swaps++; current = day; }
      for (let gb = 0; gb < (day === 0 ? full : changes); gb++) elapsed += perUnit;
    }
    const options = choices(body);
    ascending(options.map(numeric));
    truth(body, options.map(option => numeric(option) === elapsed));
    assert(body.explanation.includes('計' + swaps + '回交換'));
    assert(body.explanation.includes('合計は' + options[body.correctIndex!] + '秒'));
  }
});

test('問24は表示された四素子の配線を全入力組合せで評価し、全図の素子と比較する', () => {
  const gateBits: Record<string, string> = { AND:'0001', NAND:'1110', OR:'0111', NOR:'1000', XOR:'0110' };
  const output = (gate: string, a: number, b: number) => Number(gateBits[gate][a * 2 + b]);
  for (const body of cases(24)) {
    const markup = svg(body.prompt[1]);
    const gates = [...markup.matchAll(/data-gate-kind="([A-Z]+)"/g)].map(match => match[1]);
    assert.equal(gates.length, 4);
    assert.match(markup, /M32 67H85M32 83H85M64 67V26H172M64 83V124H172/);
    assert.match(markup, /75H151V42H172M151 75V108H172/);
    assert.match(markup, /34H247V67H278M\d+ 116H247V83H278/);
    const answers = [0,1,2,3].map(n => {
      const a = n >> 1, b = n % 2, split = output(gates[0], a, b);
      return output(gates[3], output(gates[1], a, split), output(gates[2], split, b));
    });
    const options = body.choices.map(([block]) => {
      const rendered = svg(block);
      assert.deepEqual(labels(rendered), ['A','B','Y']);
      assert.equal((rendered.match(/data-gate-kind=/g) ?? []).length, 1);
      return /data-gate-kind="([A-Z]+)"/.exec(rendered)?.[1];
    });
    assert.deepEqual(options, ['OR','AND','XOR','NOR']);
    truth(body, options.map(option => gateBits[option!] === answers.join('')));
    assert(body.explanation.includes(answers.join('，')));
    assert(body.explanation.includes(options[body.correctIndex!]!));
  }
});

test('問26は図の多重度・制約に合う小さな関係モデルを全列挙して各説明を評価する', () => {
  for (const body of cases(26)) {
    const visible = labels(svg(body.prompt[1]));
    assert.equal(visible.filter(label => label === 'プロジェクト').length, 2);
    assert(visible.includes('役割分担') && visible.includes('社員') && visible.includes('部門'));
    const relation = visible.indexOf('所属する▶');
    assert.equal(visible[relation - 2], '1..*');
    const optional = visible[relation - 4] === '0..*', multipleDepartments = visible[relation - 1] === '1..*';
    assert.match(visible[relation - 4], /^[01]\.\.\*$/);
    assert.match(visible[relation - 1], /^(1|1\.\.\*)$/);
    const constraint = visible.slice(visible.indexOf('制約：') + 1).join('');
    assert.match(constraint, /^プロジェクト・社員(?:・プロジェクト内役割分担)?で一意に定まる$/);
    const roleInKey = constraint.includes('役割分担');
    const valid = Array.from({ length: 16 }, (_, n) => [...n.toString(2).padStart(4, '0')].map(Number))
      .filter(([p1r1,p1r2,p2r1,p2r2]) => (optional || p1r1 + p1r2 + p2r1 + p2r2 > 0) &&
        (roleInKey || (p1r1 + p1r2 <= 1 && p2r1 + p2r2 <= 1)));
    const crossProjectDifferentRoles = valid.some(([p1r1,p1r2,p2r1,p2r2]) => (p1r1 && p2r2) || (p1r2 && p2r1));
    const sameProjectDifferentRoles = valid.some(([p1r1,p1r2,p2r1,p2r2]) => (p1r1 && p1r2) || (p2r1 && p2r2));
    const allHaveParticipation = valid.every(scenario => scenario.some(Boolean));
    const reviewed = [/全て同じ役割分担/, /同じプロジェクトに異なる役割分担/, /一つ以上のプロジェクト/, /複数の部門に所属/];
    choices(body).forEach((choice, i) => assert.match(choice, reviewed[i]));
    truth(body, [!crossProjectDifferentRoles, sameProjectDifferentRoles, allHaveParticipation, multipleDepartments]);
    assert.match(body.explanation, /多重度は，反対側の一つの要素を基準/);
  }
});
