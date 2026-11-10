import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2013AutumnAm01To26Definitions as definitions } from '../src/core/generators/legacy-2013-autumn-am-01-26';
import { legacy2013AutumnAm0126Figures as figures } from '../src/core/generators/legacy-2013-autumn-am-01-26-figures';
import source from '../src/core/generators/legacy-2013-autumn-am-01-26-source.json';
import { legacy2013AutumnAm0126FigureRenderers as renderers } from '../src/ui/Legacy2013AutumnAm0126Figures';
import { knowledgeCases, type ReviewedCase } from './fixtures/legacy-2013-autumn-am-01-26-knowledge-review';

const marks = 'アイウエ';
const officialKeys = 'ウアウウウアエアイウイイアイウエアウアアウアエウイウ';
const cases = (number: number) => {
  const def = definitions[number - 1];
  return Array.from({ length: def.fields[0].maximum + 1 }, (_, index) => def.build([index]));
};
function promptOf(body: GeneratedBody) {
  return body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
}
function choicesOf(body: GeneratedBody) {
  return body.choices.map(([block]) => {
    assert(block.type === 'paragraph');
    return block.text;
  });
}
function uniquelyCorrect(body: GeneratedBody, truth: boolean[]) {
  assert.equal(truth.length, 4);
  assert.deepEqual(truth.flatMap((correct, index) => correct ? [index] : []), [body.correctIndex]);
}
function scale(options: number[]) {
  assert(options.every((value, i) => i === 0 || value > options[i - 1]), options.join(', '));
}
function markup(block: GeneratedBody['prompt'][number]) {
  assert(block.type === 'diagram' && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const semantic = figures.find(figure => figure.profile === profile), renderer = renderers.find(item => item.profile === profile);
  assert(semantic && renderer);
  semantic.validate(values);
  assert.equal(block.alt, semantic.alt(values));
  const html = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
  assert.match(html, /aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
  assert(html.includes('<desc') && html.includes('var(--diagram-ink)') && html.includes('var(--image-scale, 1)'));
  return html;
}

test('2013秋期午前問1〜26は公式キー、原選択肢、有限域、問いの可変性を保持する', () => {
  assert.equal(definitions.length, 26);
  assert.equal(source.length, 26);
  assert.equal(source.map(row => row.sourceKey).join(''), officialKeys);
  let count = 0;
  for (const [index, def] of definitions.entries()) {
    const number = index + 1, original = source[index];
    assert.equal(def.source, '2013h25a-fe-am-' + number);
    assert.equal(def.sourceAnswer, officialKeys[index]);
    assert.deepEqual(def.reference, [0]);
    const variants = cases(number), reference = variants[0];
    count += variants.length;
    assert.equal(marks[reference.correctIndex!], officialKeys[index]);
    assert(promptOf(reference).startsWith(original.prompt));
    if (![1,8,25,26].includes(number)) assert.deepEqual(choicesOf(reference), original.choices);
    for (const [value, body] of variants.entries()) {
      assert.deepEqual(body, def.build([value]));
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(choice => JSON.stringify(choice))).size, 4);
      assert(Number.isInteger(body.correctIndex) && body.correctIndex! >= 0 && body.correctIndex! < 4);
      assert(body.explanation.length >= 28);
    }
    // The flowchart is a visible premise, not just an accessibility string.
    const visible = variants.map(body => JSON.stringify(body.prompt.map(block => block.type === 'diagram' ?
      markup(block) : block)));
    assert.equal(new Set(visible).size, variants.length, def.source);
    assert.equal(new Set(variants.map(body => JSON.stringify(body.choices[body.correctIndex!]))).size, variants.length, def.source);
    for (const invalid of [[], [0,0], [-1], [def.fields[0].maximum + 1], [0.5], Array(1)]) {
      assert.throws(() => def.build(invalid), /PARAMETER_CONSTRAINT/);
    }
  }
  assert.equal(count, 82);
});

test('問1は表示式を8領域で評価し、全ベン図の実描画の網掛けと比較する', () => {
  for (const body of cases(1)) {
    const expression = /^集合(.*?)を網掛け/.exec(promptOf(body))?.[1];
    assert(expression);
    const terms = expression.split('∪').map(term => term.replace(/[（）]/g, '').split('∩'));
    const target = Array.from({ length: 8 }, (_, i) => i.toString(2).padStart(3, '0')).filter(membership =>
      terms.some(term => term.every(literal => {
        const position = 'ABC'.indexOf(literal[0]);
        assert(position >= 0);
        return membership[position] === (literal.includes('̄') ? '0' : '1');
      })));
    uniquelyCorrect(body, body.choices.map(([block]) => {
      const rendered = markup(block);
      const regions = [...rendered.matchAll(/data-venn-region="([01]{3})"/g)].map(match => match[1]);
      assert(regions.length > 0 && /clip-rule="evenodd"/.test(rendered) && /<pattern /.test(rendered));
      return regions.slice().sort().join() === target.join();
    }));
  }
});

test('問2〜5の全条件を二進桁、剰余全列挙、標本周波数、FIFOで独立に照合する', () => {
  for (const body of cases(2)) {
    const match = /32ビット.*16進数([\dA-F]{4}).*?(\d)ビットだけ右に論理シフト/.exec(promptOf(body));
    assert(match);
    const register = parseInt(match[1], 16).toString(2).padStart(32, '0'), shift = Number(match[2]);
    const correct = parseInt(register.slice(0, -shift), 2), low = register.slice(-16);
    const options = choicesOf(body).map(text => parseInt(text, 16));
    scale(options);
    const fillers = ['0'.repeat(shift - 1) + '1', '1'.repeat(shift)];
    const roleValues = [correct, parseInt((low + '0'.repeat(shift)).slice(-16), 2),
      ...fillers.map(prefix => parseInt(prefix + low.slice(0, -shift), 2))].sort((a, b) => a - b);
    assert.deepEqual(options, roleValues);
    uniquelyCorrect(body, options.map(option => option === correct));
    assert(body.explanation.includes(correct.toString(16).toUpperCase()));
  }
  for (const body of cases(3)) {
    const prompt = promptOf(body);
    const match = /C＝(\d).*N₂＝(\d)，N₃＝(\d)，N₄＝(\d)/.exec(prompt);
    assert(match);
    assert.match(prompt, /N₁×1＋N₂×2＋N₃×3＋N₄×4/);
    const [check, ...suffix] = match.slice(1).map(Number);
    const accepts = (n: number) => [n, ...suffix].reduce((sum, digit, i) => sum + digit * (i + 1), 0) % 10 === check;
    const solutions = Array.from({ length: 9 }, (_, i) => i + 1).filter(accepts);
    assert.equal(solutions.length, 1);
    const options = choicesOf(body).map(Number);
    scale(options);
    uniquelyCorrect(body, options.map(n => n !== 0 && accepts(n)));
    assert(body.explanation.endsWith('値は' + solutions[0] + 'である。'));
  }
  for (const body of cases(4)) {
    const match = /(\d)ビットのディジタルデータに変換し，圧縮しないで転送.*([\d,]+)ビット／秒/.exec(promptOf(body));
    assert(match);
    const rate = Number(/転送速度は([\d,]+)ビット／秒/.exec(promptOf(body))![1].replaceAll(',', ''));
    const width = Number(match[1]), options = choicesOf(body).map(Number);
    scale(options);
    uniquelyCorrect(body, options.map(option => option * (rate / width) === 1e6));
    assert(body.explanation.endsWith(options[body.correctIndex!] + 'マイクロ秒である。'));
  }
  for (const body of cases(5)) {
    const prompt = promptOf(body), text = /空の待ち行列に対し，(.+?)の操作を行った/.exec(prompt)?.[1];
    assert(text);
    assert.match(prompt, /ENQ n：待ち行列にデータnを挿入する。\nDEQ：待ち行列からデータを取り出す。/);
    const operations = text.split('，'), pushed = operations.filter(op => /^ENQ \d+$/.test(op)).map(op => Number(op.slice(4)));
    const removed = operations.length - pushed.length;
    assert.equal(pushed.length, 6);
    assert.equal(removed, 4);
    for (const [i] of operations.entries()) {
      const done = operations.slice(0, i + 1);
      assert(done.filter(op => op === 'DEQ').length <= done.filter(op => op.startsWith('ENQ')).length);
    }
    const options = choicesOf(body).map(Number);
    scale(options);
    uniquelyCorrect(body, options.map(option => option === pushed[removed]));
    assert(body.explanation.endsWith('次のDEQは' + pushed[removed] + 'を取り出す。'));
  }
});

test('問7は全3格納分岐と問8は全16組合せを表示された配列・枝から追跡する', () => {
  const exercised = new Set<number>();
  for (const body of cases(7)) {
    const prompt = promptOf(body);
    const match = /kとして([\d，]+)を順に格納したとき，(\d+)が格納される/.exec(prompt);
    assert(match);
    assert.match(prompt, /A\[0\]，A\[1\]，…，A\[9\]/);
    assert.match(prompt, /全て0に初期化/);
    const attempted = match[1].split('，').map(Number);
    assert.equal(attempted.at(-1), Number(match[2]));
    const slots = new Set<number>();
    for (const input of attempted) {
      const remainder = (n: number) => n - 10 * Math.floor(n / 10);
      const sequence = [input, input + 1, input + 4].map(remainder);
      const i = sequence.findIndex(slot => !slots.has(slot));
      assert(i >= 0);
      if (input === attempted.at(-1)) {
        exercised.add(i);
        const options = choicesOf(body).map(choice => Number(/^A\[(\d)\]$/.exec(choice)![1]));
        scale(options);
        uniquelyCorrect(body, options.map(option => option === sequence[i]));
        assert(body.explanation.endsWith('A[' + sequence[i] + ']である。'));
      }
      slots.add(sequence[i]);
    }
  }
  assert.deepEqual([...exercised].sort(), [0,1,2]);
  for (const body of cases(8)) {
    const chart = body.prompt.find(block => block.type === 'diagram')!;
    const printed = markup(chart);
    assert.match(printed, /data-flow-branch="a-shortcut-to-process"/);
    assert.match(printed, /data-flow-branch="b-bypass-process"/);
    const left = /<text [^>]*>(P(?:でない)? 又は Q(?:でない)?)<\/text>/.exec(printed)?.[1];
    assert(left);
    const want = left.split(' 又は ');
    const table = body.prompt.find(block => block.type === 'table')!;
    assert.deepEqual(table.columns, ['', 'a', 'b']);
    assert.deepEqual(table.rows, [['ア','No','No'], ['イ','No','Yes'], ['ウ','Yes','No'], ['エ','Yes','Yes']]);
    uniquelyCorrect(body, body.choices.map(([block], i) => {
      assert(block.type === 'table');
      assert.deepEqual(block.columns, ['a','b']);
      assert.deepEqual(block.rows[0], table.rows[i].slice(1));
      const [a,b] = block.rows[0].map(value => value === 'Yes');
      return [false,true].every(p => [false,true].every(q => {
        const left = (want[0].endsWith('でない') ? !p : p) || (want[1].endsWith('でない') ? !q : q);
        const right = p === a ? true : q !== b;
        return left === right;
      }));
    }));
  }
});

test('問9・11・14・22・24は紙面の単位・差分と全候補を独立した積の等式で検算する', () => {
  for (const body of cases(9)) {
    const m = /(\d+)万ステップ.*?(\d+) MIPS.*?(\d+)％/.exec(promptOf(body))!;
    const [instructions, mips, percent] = m.slice(1).map(Number), options = choicesOf(body).map(Number);
    scale(options);
    uniquelyCorrect(body, options.map(option => option * instructions * 10000 * 100 === mips * 1e6 * percent));
    assert(body.explanation.includes(options[body.correctIndex!] + '件／秒'));
  }
  for (const body of cases(11)) {
    const prompt = promptOf(body), m = /縦(\d+)ドット，横(\d+)ドット.*?([\d,]+)種類/.exec(prompt)!;
    const [height, width, count] = m.slice(1).map(value => Number(value.replaceAll(',', '')));
    assert.match(prompt, /1 Mバイト＝1,024 kバイト，1 kバイト＝1,024バイト.*圧縮しない/);
    const options = choicesOf(body).map(option => {
      const [, number, unit] = /^(\d+(?:\.\d+)?) ([kM])$/.exec(option)!;
      return Number(number) * (unit === 'k' ? 1024 : 1024 * 1024);
    });
    scale(options);
    uniquelyCorrect(body, options.map(option => option * 8 === height * width * count));
    assert(body.explanation.includes(options[body.correctIndex!].toLocaleString('en-US') + 'バイト'));
  }
  for (const body of cases(14)) {
    const prompt = promptOf(body), m = /MTBFが(\d+)万時間.*装置(\d+)台.*?1週間に(\d+)時間/.exec(prompt)!;
    const [mtbf, disks, hours] = m.slice(1).map(Number), options = choicesOf(body).map(Number);
    assert.match(prompt, /冗長構成は採っていない/);
    scale(options);
    uniquelyCorrect(body, options.map(option => option * disks * hours === mtbf * 10000));
    assert(body.explanation.includes(options[body.correctIndex!] + '週間'));
  }
  for (const body of cases(22)) {
    const m = [...promptOf(body).matchAll(/ディジタル値(\d+)を入力したときの出力電圧が([\d.]+) V/g)];
    assert.equal(m.length, 2);
    const difference = Number(m[1][1]) - Number(m[0][1]), tenths = Number(m[1][2]) * 10 - Number(m[0][2]) * 10;
    const choices = choicesOf(body), options = choices.map(choice => choice.split('／').map(Number));
    scale(options.map(option => option[1]));
    uniquelyCorrect(body, options.map(([num, den]) => 10 * num * difference === tenths * den));
    assert(body.explanation.includes(choices[body.correctIndex!] + ' V'));
  }
  for (const body of cases(24)) {
    const m = /定格出力電力(\d+) Wで効率(\d+)％.*から(\d+) Wの出力電力/.exec(promptOf(body))!;
    const [rated, percent, output] = m.slice(1).map(Number), options = choicesOf(body).map(Number);
    assert.equal(rated, output);
    scale(options);
    uniquelyCorrect(body, options.map(option => option * percent === output * 100));
    assert(body.explanation.includes(options[body.correctIndex!] + ' W'));
  }
});

test('問15は前提に合う依存関係、問26は明示された有限の入力域から全候補を判定する', () => {
  const dependencies = [
    { context: /キャパシティプランニング/, roles: [/増設.*検討/, /限界時期/, /基礎数値/, /利用者数の増加/],
      pairs: [[3,4], [4,2], [2,1]] },
    { context: /注文システム/, roles: [/採用する増設案を決める/, /ピーク負荷を予測/, /実績を収集/, /応答時間を比較/],
      pairs: [[3,2], [2,4], [4,1]] },
    { context: /新規サービス/, roles: [/処理可能件数を測定/, /試験で再現するピーク負荷を決める/, /設備台数を決める/, /集中時間帯を把握/],
      pairs: [[4,2], [2,1], [1,3]] },
  ];
  for (const [index, body] of cases(15).entries()) {
    const lines = promptOf(body).split('\n'), rules = dependencies[index];
    assert.match(lines[0], rules.context);
    assert.equal(lines[1], '〔作業項目〕');
    for (const [i, line] of lines.slice(2).entries()) {
      assert(line.startsWith('①②③④'[i]));
      assert.match(line, rules.roles[i]);
    }
    uniquelyCorrect(body, choicesOf(body).map(option => {
      const order = option.split('，').map(label => '①②③④'.indexOf(label) + 1);
      assert.deepEqual([...order].sort(), [1,2,3,4]);
      return rules.pairs.every(([prerequisite, next]) => order.indexOf(prerequisite) < order.indexOf(next));
    }));
  }
  for (const body of cases(26)) {
    const fields = body.prompt.find(block => block.type === 'table')!;
    assert.deepEqual(fields.columns, ['', '項目', '様式と規則']);
    assert.equal(fields.rows.length, 4);
    assert.deepEqual(fields.rows.map(row => row[0]), [...marks]);
    assert.deepEqual(fields.rows.map(row => row[1]), choicesOf(body));
    uniquelyCorrect(body, fields.rows.map(row => /(?:5区分ある|固定の3分館|いずれかに限る)/.test(row[2])));
    assert(body.explanation.includes(fields.rows[body.correctIndex!][1]));
  }
});

function evaluateLogic(expression: string, a: boolean, b: boolean) {
  let cursor = 0;
  function value(): boolean {
    if (expression[cursor] === '（') {
      cursor++;
      const nested = or();
      assert.equal(expression[cursor++], '）');
      return nested;
    }
    const name = expression[cursor++];
    assert(name === 'A' || name === 'B');
    const direct = name === 'A' ? a : b;
    if (expression[cursor] === '̄') {
      cursor++;
      return !direct;
    }
    return direct;
  }
  function and() {
    const factors = [value()];
    while (expression[cursor] === '・') {
      cursor++;
      factors.push(value());
    }
    return factors.every(Boolean);
  }
  function or() {
    const terms = [and()];
    while (expression[cursor] === '＋') {
      cursor++;
      terms.push(and());
    }
    return terms.some(Boolean);
  }
  const result = or();
  assert.equal(cursor, expression.length);
  return result ? '1' : '0';
}
test('問25は4通りの論理式の入力を表示した各ゲートの真理値表と照合する', () => {
  const truthTable: Record<string, string> = { AND: '0001', NAND: '1110', OR: '0111', NOR: '1000' };
  for (const body of cases(25)) {
    const expression = /論理式X＝(.*?)と同じ結果/.exec(promptOf(body))?.[1];
    assert(expression);
    assert.match(promptOf(body), /・は論理積，＋は論理和，ĀはAの否定/);
    const truth = [false, true].flatMap(a => [false, true].map(b => evaluateLogic(expression, a, b))).join('');
    uniquelyCorrect(body, body.choices.map(([block], i) => {
      const printed = markup(block);
      const gate = /data-gate-kind="([A-Z]+)"/.exec(printed)?.[1];
      assert(gate);
      assert.equal(gate, ['AND','NAND','OR','NOR'][i]);
      assert.equal(printed.includes('data-output-inversion="true"'), gate === 'NAND' || gate === 'NOR');
      assert.match(printed, />A<\/text>.*>B<\/text>.*>X<\/text>/);
      return truthTable[gate] === truth;
    }));
  }
});

function reviewKnowledge(body: GeneratedBody, review: ReviewedCase) {
  const prompt = promptOf(body), options = choicesOf(body);
  assert.match(prompt, review.prompt);
  const roles = options.map(option => {
    const matches = review.choices.filter(([, witness]) => witness.test(option));
    assert.equal(matches.length, 1, option);
    return matches[0][0];
  });
  assert.equal(new Set(roles).size, 4);
  uniquelyCorrect(body, roles.map(role => role === review.correct));
  assert.match(body.explanation, review.explanation);
}
test('知識選択11系列の本文・全選択肢・解説を原資料と独立した査読対応に照合する', () => {
  assert.deepEqual(Object.keys(knowledgeCases).map(Number), [6,10,12,13,16,17,18,19,20,21,23]);
  for (const [number, reviews] of Object.entries(knowledgeCases)) {
    const variants = cases(Number(number));
    assert.equal(variants.length, reviews.length);
    for (const [i, variant] of variants.entries()) reviewKnowledge(variant, reviews[i]);
  }
});

test('担当範囲の図契約は固定3プロファイルをそれぞれ全域で読み上げ・描画する', () => {
  assert.deepEqual(figures.map(figure => figure.profile).sort(), renderers.map(renderer => renderer.profile).sort());
  for (const figure of figures) {
    assert.deepEqual(figure.domain, [[0,3]]);
    for (const i of [0,1,2,3]) {
      figure.validate([i]);
      const renderer = renderers.find(candidate => candidate.profile === figure.profile)!;
      assert(figure.alt([i]).length > 20);
      assert(renderToStaticMarkup(createElement(renderer.component, { caption: '試験図', values: [i] })).includes('data-source-figure'));
    }
    for (const invalid of [[], [-1], [4], [1,1], [0.5], Array(1)]) assert.throws(() => figure.validate(invalid), /FIGURE_DOMAIN/);
  }
});
