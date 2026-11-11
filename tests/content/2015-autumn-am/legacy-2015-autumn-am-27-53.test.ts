import assert from 'node:assert/strict';
import { createHash, createSign, createVerify, generateKeyPairSync } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2015AutumnAm2753Definitions } from '../../../src/core/generators/legacy-2015-autumn-am-27-53';
import { legacy2015AutumnAm2753Figures } from '../../../src/core/generators/legacy-2015-autumn-am-27-53-figures';
import { legacy2015AutumnAm2753FigureRenderers } from '../../../src/ui/Legacy2015AutumnAm2753Figures';
import { legacy2015AutumnAm2753Reviews, legacy2015AutumnAm52PublishedExample } from '../../fixtures/legacy-2015-autumn-am-27-53-reviewed';
import facts from '../../fixtures/legacy-2015-autumn-am-27-53-source-facts.json';

const definitions = legacy2015AutumnAm2753Definitions();
const numberOf = (source: string) => Number(source.split('-').at(-1));
const label = (index: number | undefined) => 'アイウエ'[index ?? -1];

function read<T extends Block['type']>(block: Block, type: T): Extract<Block, { type: T }> {
  assert.equal(block.type, type);
  return block as Extract<Block, { type: T }>;
}

const paragraph = (body: GeneratedBody) => read(body.prompt[0], 'paragraph').text;
const optionTexts = (body: GeneratedBody) => body.choices.map(choice => {
  assert.equal(choice.length, 1);
  return read(choice[0], 'paragraph').text;
});

function numericChoices(body: GeneratedBody) {
  const choices = optionTexts(body).map(Number);
  assert(choices.every(Number.isSafeInteger));
  assert(choices.every((choice, i) => i === 0 || choice > choices[i - 1]));
  return choices;
}

function assertTruth(body: GeneratedBody, truth: readonly boolean[]) {
  const correct = truth.flatMap((value, index) => value ? [index] : []);
  assert.equal(truth.length, 4);
  assert.equal(correct.length, 1);
  assert.equal(body.correctIndex, correct[0]);
}

const numerical: Record<number, (body: GeneratedBody, candidate: number) => void> = {
  27(body, candidate) {
    const expectedValues = ['販売単価', '商品定価', '注文全体の送料'];
    const expectedDeterminants = [
      ['注文番号', '商品番号'], ['商品番号'], ['注文番号'],
    ];
    const displayed = body.prompt.slice(3).map(block => read(block, 'paragraph').text);
    const dependencies = displayed.flatMap(line => [...line.matchAll(/[①-⑥]\s*(.+?) → (.+?)(?=　　[①-⑥]|$)/gu)].map(([, determinant, value]) =>
      [determinant.replace(/[{}]/g, '').split('，'), value] as const));
    assert.deepEqual(dependencies, [
      [['注文番号'], '注文日'],
      [['注文番号'], '顧客番号'],
      [['顧客番号'], '顧客名'],
      [['注文番号', '商品番号'], '数量'],
      [expectedDeterminants[candidate], expectedValues[candidate]],
      [['商品番号'], '商品名'],
    ]);
    const keys = ['注文番号', '商品番号'];
    const closure = (selected: string[]) => {
      const current = new Set(selected);
      while (true) {
        const size = current.size;
        for (const [determinant, attribute] of dependencies) {
          if (determinant.every(part => current.has(part))) current.add(attribute);
        }
        if (current.size === size) return current;
      }
    };
    const detailOnly = [...closure(keys)].filter(attribute => !keys.includes(attribute) && !keys.some(key => closure([key]).has(attribute)));
    const expectedRelation = new Set([...keys, ...detailOnly]);
    const sourceRelation = read(body.prompt[1], 'diagram');
    assert.match(sourceRelation.alt, new RegExp(`^注文記録（注文番号，注文日，顧客番号，顧客名，商品番号，商品名，数量，${expectedValues[candidate]}）$`));
    const renderer = legacy2015AutumnAm2753FigureRenderers.find(entry => entry.profile === 'legacy-2015-autumn-am-27-relation')!;
    const truth = body.choices.map((blocks, index) => {
      const diagram = read(blocks[0], 'diagram');
      const [raw, marked] = diagram.alt.split('。実線の下線は');
      const columns = raw.match(/^注文明細（(.+)）$/)?.[1].split('，');
      assert(columns && marked);
      const primary = marked.split('，');
      assert.deepEqual(diagram.scene, { kind: 'source_figure', profile: renderer.profile, values: [candidate, index + 1] });
      const markup = renderToStaticMarkup(createElement(renderer.component, { values: [candidate, index + 1], caption: diagram.caption }));
      const underline = [...markup.matchAll(/<u data-primary-key="([^"]+)">([^<]+)<\/u>/g)].map(match => {
        assert.equal(match[1], match[2]);
        return match[1];
      });
      assert.deepEqual(underline, primary);
      assert(markup.includes(diagram.alt));
      return columns.length === expectedRelation.size && columns.every(column => expectedRelation.has(column)) &&
        primary.length === keys.length && keys.every(key => primary.includes(key));
    });
    assertTruth(body, truth);
    assert(body.explanation.includes(expectedValues[candidate]));
    assert.match(body.explanation, /数量は注文番号と商品番号の両方/);
  },
  28(body, candidate) {
    const shown = read(body.prompt[1], 'table');
    assert.deepEqual(shown.columns, ['商品番号', '日付', '数量']);
    assert.deepEqual(shown.rows.map(row => Number(row[2])), [[3, 2, 1, 2], [7, 1, 1, 2], [3, 2, 5, 4], [5, 4, 1, 1]][candidate]);
    assert.equal(shown.rows.length, 4);
    const database = new DatabaseSync(':memory:');
    try {
      database.exec('CREATE TABLE 出庫記録 (商品番号 TEXT, 日付 TEXT, 数量 INTEGER)');
      const insert = database.prepare('INSERT INTO 出庫記録 VALUES (?, ?, ?)');
      for (const [item, date, amount] of shown.rows) insert.run(item, date, Number(amount));
      const values = body.choices.map((blocks, index) => {
        const statement = read(blocks[0], 'code');
        assert.equal(statement.language, 'sql');
        assert.match(statement.text, [/^SELECT AVG\(数量\).*商品番号 = 'NP200'$/, /^SELECT COUNT\(\*\)/, /^SELECT MAX\(数量\)/, /^SELECT SUM\(数量\).*日付 = '2015-10-1[01]'$/][index]);
        return Number(Object.values(database.prepare(statement.text).get()!)[0]);
      });
      assert.deepEqual(values, [[2, 4, 3, 3], [4, 4, 7, 3], [4, 4, 5, 9], [3, 4, 5, 9]][candidate]);
      const highest = values.reduce((best, value) => value > best ? value : best);
      assertTruth(body, values.map(value => value === highest));
      assert.match(body.explanation, new RegExp(`最大は${highest}`));
    } finally {
      database.close();
    }
  },
  30(body, candidate) {
    const stem = paragraph(body);
    const match = stem.match(/^(\d+(?:\.\d+)?)\s*Mビット／秒.*?(\d+)\s*Mバイト.*?50[%％]/);
    assert(match);
    const speedTimes2 = Math.round(Number(match[1]) * 2);
    const megabytes = Number(match[2]);
    assert.deepEqual([speedTimes2, megabytes], [[3, 12], [3, 6], [3, 18], [6, 18]][candidate]);
    // Work in quarter-megabit units so every speed is an integer.
    const sentUnits = megabytes * 8 * 4;
    const answers = numericChoices(body);
    assert(answers.slice(1).every((choice, i) => choice === 2 * answers[i]));
    assertTruth(body, answers.map(seconds => seconds * speedTimes2 === sentUnits));
    assert.match(body.explanation, new RegExp(`＝${sentUnits / speedTimes2}秒`));
  },
  34(body, candidate) {
    const texts = optionTexts(body);
    const number = (address: string) => address.split('.').reduce((result, byte) => result * 256n + BigInt(byte), 0n);
    const network = texts[1].match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)のネットワークアドレスは，([^で]+)である。$/);
    const broadcast = texts[2].match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)のブロードキャストアドレスは，([^で]+)である。$/);
    const loop = texts[3].match(/^(\d+\.\d+\.\d+\.\d+)は，.*ループバックアドレスである。$/);
    assert(network && broadcast && loop);
    const [address, prefix] = network.slice(1, 3);
    assert.deepEqual([address, prefix], [['192.168.0.0', '24'], ['172.16.24.0', '25'], ['10.0.1.64', '26']][candidate]);
    assert.deepEqual(broadcast.slice(1, 3), [address, prefix]);
    const hostMask = (1n << BigInt(32 - Number(prefix))) - 1n;
    const networkAddress = number(address) & ~hostMask;
    const privateRange = ['192.168.0.0〜192.168.255.255', '172.16.0.0〜172.31.255.255', '10.0.0.0〜10.255.255.255'][candidate];
    assert(texts[0].startsWith(privateRange));
    assert.match(texts[0], /JPNICへの届出が必要である。$/);
    assertTruth(body, [false, number(network[3]) === networkAddress, number(broadcast[3]) === (networkAddress | hostMask), number(loop[1]) >> 24n === 127n]);
    assert.match(body.explanation, /ホスト部が全て0.*全て1.*127\.0\.0\.0\/8/);
  },
  36(body, candidate) {
    const subject = ['メッセージ', '配布ファイル', '配布物一覧'][candidate];
    assert.match(paragraph(body), new RegExp(`${subject}の改ざんの検知の他`));
    const steps = body.prompt.slice(1).map(block => read(block, 'paragraph').text);
    assert.equal(steps.length, 8);
    assert.deepEqual(steps.filter(line => /^[（][1-5]/.test(line)).map(line => line[1]), ['1', '2', '3', '4', '5']);
    assert.match(steps[2], new RegExp(`^（1）${subject}から.*ハッシュ関数`));
    assert.match(steps[3], /自分の署名生成鍵.*（1）/);
    assert.match(steps[4], new RegExp(`^（3）${subject}と，（2）.*署名を受信者B`));
    assert.match(steps[6], new RegExp(`^（4）受信した${subject}から`));
    assert.match(steps[7], /（4）.*送信者Aの署名検証鍵.*受信した署名を検証/);
    const options = optionTexts(body);
    assert.deepEqual(options, [
      `${subject}が送信者Aからのものであることの確認`, `${subject}の改ざん部位の特定`,
      `${subject}の盗聴の検知`, `${subject}の漏えいの防止`,
    ]);
    assertTruth(body, [true, false, false, false]);
    assert.match(body.explanation, /改ざん箇所は特定できず.*暗号化しない/);
    if (candidate === 2) assert.match(body.explanation, /個々の配布物の内容は別に検証/);
  },
  44(body, candidate) {
    const displayedRules = read(body.prompt[1], 'table');
    const displayedPacket = read(body.prompt[3], 'table');
    const headers = ['送信元アドレス', '宛先アドレス', 'プロトコル', '送信元ポート番号', '宛先ポート番号'];
    assert.deepEqual(displayedRules.columns, ['番号', ...headers, '動作']);
    assert.deepEqual(displayedPacket.columns, headers);
    assert.equal(displayedPacket.rows.length, 1);
    assert.deepEqual(displayedRules.rows, [
      ['1', '10.1.2.3', '*', '*', '*', '*', '通過禁止'],
      ['2', '*', '10.2.3.*', 'TCP', '*', '25', '通過許可'],
      ['3', '*', '10.1.*', 'TCP', '*', '25', '通過許可'],
      ['4', '*', '*', '*', '*', '*', '通過禁止'],
    ]);
    const [packet] = displayedPacket.rows;
    assert.deepEqual(packet, [
      ['10.1.2.3', '10.2.3.4', 'TCP', '2100', '25'],
      ['10.1.2.8', '10.2.3.4', 'TCP', '2100', '25'],
      ['10.1.2.8', '10.1.3.4', 'TCP', '2100', '25'],
      ['10.1.2.8', '10.2.3.4', 'UDP', '2100', '25'],
    ][candidate]);
    const matching = displayedRules.rows.filter(rule => rule.slice(1, 6).every((pattern, index) => {
      if (pattern === '*') return true;
      const octets = pattern.split('.');
      return octets.every((part, octetIndex) => part === '*' || part === packet[index].split('.')[octetIndex]);
    }));
    assert.deepEqual(matching.map(row => row[0]), [['1', '2', '4'], ['2', '4'], ['3', '4'], ['4']][candidate]);
    const [first] = matching;
    const choices = optionTexts(body);
    assert.deepEqual(choices, facts.questions[44 - 27].choices);
    assertTruth(body, choices.map(choice => choice === `番号${first[0]}によって，通過を${first[6].slice(2)}する。`));
    assert.match(body.explanation, new RegExp(`番号${first[0]}の動作は${first[6]}`));
  },
  47(body, candidate) {
    const diagram = read(body.prompt[1], 'diagram');
    assert.match(diagram.alt, [/(「A OR B」)/, /(「A AND B」)/, /「\(NOT A\) OR B」/][candidate]);
    const truthTable = [
      { '偽偽': '偽', '偽真': '真', '真偽': '真', '真真': '真' },
      { '偽偽': '偽', '偽真': '偽', '真偽': '偽', '真真': '真' },
      { '偽偽': '真', '偽真': '真', '真偽': '偽', '真真': '真' },
    ][candidate] as Record<string, string>;
    const allInputs = body.choices.map((blocks, index) => {
      const option = read(blocks[0], 'table');
      assert.deepEqual(option.columns, ['A', 'B']);
      assert.equal(option.rows.length, [1, 2, 2, 3][index]);
      return option.rows.map(row => row.join(''));
    });
    assert.deepEqual(allInputs, [
      [['偽真'], ['偽真', '真偽'], ['偽偽', '真真'], ['偽真', '真偽', '真真']],
      [['偽真'], ['偽真', '真偽'], ['偽偽', '真偽'], ['偽偽', '真偽', '真真']],
      [['偽偽'], ['偽偽', '真偽'], ['偽真', '真真'], ['偽偽', '偽真', '真真']],
    ][candidate]);
    const truths = allInputs.map(rows => new Set(rows.map(row => truthTable[row])).size === 2);
    assertTruth(body, truths);
    for (const [index, rows] of allInputs.entries()) {
      assert(body.explanation.includes(`${'アイウエ'[index]}は${rows.map(row => truthTable[row]).join('・')}`));
    }
  },
  51(body, candidate) {
    const diagram = read(body.prompt[1], 'diagram');
    const expectedDays = [
      [30, 5, 30, 20, 40, 25, 30, 30], [25, 5, 30, 20, 40, 25, 30, 30],
      [30, 5, 30, 20, 60, 25, 30, 30], [30, 5, 30, 20, 40, 40, 30, 30],
    ][candidate];
    const connections = ['1-2', '2-3', '2-4', '2-5', '3-6', '4-6', '5-6', '6-7'];
    const shown = [...diagram.alt.matchAll(/([1-7])から([1-7])へ(\d+)日/g)];
    assert.deepEqual(shown.map(([, start, end]) => `${start}-${end}`), connections);
    assert.deepEqual(shown.map(([, , , days]) => Number(days)), expectedDays);
    assert.match(diagram.alt, /破線のダミー作業は3から4と4から5/);
    const [a, b, c, d, e, f, g, h] = expectedDays;
    // Enumerate the six complete paths, including the zero-day transitions.
    const paths = [a + b + e + h, a + b + f + h, a + b + g + h, a + c + f + h, a + c + g + h, a + d + g + h];
    const latest = Math.max(...paths);
    const options = numericChoices(body);
    assert.deepEqual(options, [115, 120, 125, 130]);
    assertTruth(body, options.map(day => day === latest));
    assert.match(body.explanation, new RegExp(`完了までは${latest}日`));
  },
  52(body, candidate) {
    const shown = read(body.prompt[1], 'table');
    assert.equal(shown.captionPresentation, 'accessible');
    assert(shown.caption);
    assert.deepEqual(shown.columns, ['ユーザファンクションタイプ', '個数', '重み付け係数']);
    assert.deepEqual(shown.rows.map(row => row[0]), ['外部入力', '外部出力', '内部論理ファイル', '外部インタフェースファイル', '外部照会']);
    assert.deepEqual(shown.rows.map(row => Number(row[2])), [4, 5, 10, 7, 4]);
    assert.deepEqual(shown.rows.map(row => Number(row[1])), [[1, 2, 1, 0, 0], [2, 0, 2, 0, 2], [2, 1, 0, 1, 0], [2, 0, 2, 0, 1]][candidate]);
    const factor = paragraph(body).match(/補正係数は0\.(\d+)とする。/);
    assert(factor);
    const scale = 10 ** factor[1].length;
    const numerator = Number(factor[1]);
    assert.equal(numerator / scale, [0.75, 0.75, 0.8, 0.75][candidate]);
    const weightedUnits = shown.rows.flatMap(([, count, weight]) => Array(Number(count)).fill(Number(weight)) as number[]);
    const unadjusted = weightedUnits.reduce((total, weight) => total + weight, 0);
    if (candidate === 0) {
      const example = legacy2015AutumnAm52PublishedExample;
      assert.deepEqual(shown.rows, example.rows.map(row => row.map(String)));
      assert.deepEqual(numericChoices(body), example.choices);
      assert.equal(numerator / scale, example.coefficient);
    }
    assertTruth(body, numericChoices(body).map(value => value * scale === unadjusted * numerator));
    assert.match(body.explanation, new RegExp(`＝${unadjusted}。.*${unadjusted * numerator / scale}となる`));
  },
  53(body, candidate) {
    const data = paragraph(body).match(/^(\d+)人が(\d\.\d)kステップ／人日の生産性.*?(\d+)日間を要する.*?(\d+)日目が終了.*?(\d+)人の合計で(\d+)kステップ.*?予定の(\d+)日間/);
    assert(data);
    const [, peopleText, plannedText, daysText, elapsedText, currentText, doneText, dueText] = data;
    assert.equal(peopleText, currentText);
    assert.equal(daysText, dueText);
    assert.deepEqual([peopleText, plannedText, daysText, elapsedText, doneText], [
      ['10', '0.5', '30', '10', '30'], ['8', '0.5', '30', '10', '24'],
      ['12', '0.5', '25', '10', '48'], ['10', '0.5', '30', '10', '40'],
    ][candidate]);
    const people = BigInt(peopleText), days = BigInt(daysText), elapsed = BigInt(elapsedText);
    const planned = BigInt(plannedText.replace('.', '')) * 100n;
    const done = BigInt(doneText) * 1000n;
    const workRemaining = planned * people * days - done;
    let extra = 0n;
    while (done * (people + extra) * (days - elapsed) < workRemaining * people * elapsed) extra++;
    assertTruth(body, numericChoices(body).map(value => BigInt(value) === extra));
    assert.match(body.explanation, new RegExp(`追加は${extra}人`));
  },
};

test('2015秋午前27–53 原冊子の27番号と掲載候補25問を照合する', () => {
  assert.deepEqual(facts.questions.map(row => row.number), Array.from({ length: 27 }, (_, index) => index + 27));
  const held = facts.questions.filter(row => row.status === 'material_conditions_hold');
  assert.deepEqual(held.map(row => row.number), [40, 50]);
  for (const hold of held) assert.deepEqual(Object.keys(hold), ['number', 'physicalPage', 'status']);
  assert.deepEqual(definitions.map(entry => numberOf(entry.source)), facts.questions.filter(row => row.officialKey).map(row => row.number));
  assert.match(facts.paperSha256, /^[a-f0-9]{64}$/);
  for (const definition of definitions) {
    const original = facts.questions[numberOf(definition.source) - 27];
    assert.deepEqual(definition.reference, [0]);
    assert.equal(definition.sourceAnswer, original.officialKey);
    const body = definition.build([0]);
    assert.equal(label(body.correctIndex), original.officialKey);
    const compact = (value: string) => value.replace(/\s+/g, '');
    assert.equal(compact(paragraph(body)), compact(original.prompt!));
    if (numberOf(definition.source) === 27) {
      const normalizeMarks = (value: string) => value.replace(/下線は(.+)。$/, (_, keys) => '下線は' + keys.replaceAll('と', '，') + '。');
      assert.deepEqual(body.choices.map(choice => read(choice[0], 'diagram').alt + '。'), original.choices!.map(normalizeMarks));
    } else if (numberOf(definition.source) === 28) {
      assert.deepEqual(body.choices.map(choice => read(choice[0], 'code').text), original.choices);
    } else if (numberOf(definition.source) === 47) {
      assert.deepEqual(body.choices.map(choice => {
        const block = read(choice[0], 'table');
        return '表の列はA，B。' + block.rows.map((row, index) => `${index + 1}行目：${row.join('，')}。`).join('');
      }), original.choices);
    } else {
      assert.deepEqual(optionTexts(body), original.choices);
    }
  }
});

for (const definition of definitions) {
  const number = numberOf(definition.source);
  test(`2015秋午前問${number}の全入力を独立した参照解法で照合する`, () => {
    const original = facts.questions[number - 27];
    const cases = definition.fields[0].maximum + 1;
    const review = legacy2015AutumnAm2753Reviews[number];
    assert.equal(definition.fields.length, 1);
    assert(cases >= 3);
    assert.equal(Boolean(review), !numerical[number]);
    if (review) {
      assert.equal(review.cases.length, cases);
      assert(review.evidence.every(source => source.startsWith('https://')));
    }
    const fingerprints = new Set<string>();
    const answers = new Set<number>();
    for (let candidate = 0; candidate < cases; candidate++) {
      const body = definition.build([candidate]);
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(choice => JSON.stringify(choice))).size, 4);
      assert(body.explanation.length >= 45);
      assert(!body.answerParts && !body.partAnswers);
      assert(!body.prompt.some(block => block.type === 'image'));
      fingerprints.add(JSON.stringify(body.prompt));
      answers.add(body.correctIndex!);
      if (review) {
        const entry = review.cases[candidate];
        assert.match(paragraph(body), entry.prompt);
        assert.match(body.explanation, entry.conclusion);
        const shown = optionTexts(body);
        if (entry.answers) shown.forEach((value, index) => assert.match(value, entry.answers![index]));
        else assert.deepEqual(shown, original.choices);
        assertTruth(body, entry.truths);
      } else numerical[number](body, candidate);
    }
    assert.equal(fingerprints.size, cases, 'visible conditions vary across all candidates');
    if (answers.size === 1) {
      assert.equal(definition.answerVariation, 'fixed');
      assert.match(definition.notes, /固定|位置を維持|役割は変えない/);
    } else assert.equal(definition.answerVariation, undefined);
    for (const invalid of [[], [-1], [cases], [0.5], [0, 1]]) assert.throws(() => definition.build(invalid), /PARAMETER_CONSTRAINT/);
  });
}

test('2015秋午前47・51 すべての図で意味・入力域・描画が対応する', () => {
  assert.deepEqual(legacy2015AutumnAm2753Figures.map(definition => definition.profile),
    legacy2015AutumnAm2753FigureRenderers.map(renderer => renderer.profile));
  for (const number of [47, 51]) {
    const definition = definitions.find(entry => numberOf(entry.source) === number)!;
    for (let i = 0; i <= definition.fields[0].maximum; i++) {
      const body = definition.build([i]);
      const diagram = read(body.prompt[1], 'diagram');
      assert.equal(diagram.scene.kind, 'source_figure');
      if (diagram.scene.kind !== 'source_figure') throw Error('expected source figure');
      const { profile, values } = diagram.scene;
      const figure = legacy2015AutumnAm2753Figures.find(entry => entry.profile === profile)!;
      const renderer = legacy2015AutumnAm2753FigureRenderers.find(entry => entry.profile === profile)!;
      figure.validate(values);
      assert.throws(() => figure.validate([definition.fields[0].maximum + 1]), /PARAMETER_CONSTRAINT/);
      assert.equal(diagram.alt, figure.alt(values));
      const markup = renderToStaticMarkup(createElement(renderer.component, { values, caption: diagram.caption }));
      assert.match(markup, /role="img".*aria-describedby=/);
      if (number === 47) {
        assert.match(markup, /data-branch="true".*data-branch="false"/);
        assert(markup.includes(['A OR B', 'A AND B', '(NOT A) OR B'][i]));
      } else {
        assert.equal((markup.match(/data-activity=/g) ?? []).length, 8);
        assert.equal((markup.match(/data-dummy=/g) ?? []).length, 2);
        assert.match(markup, /data-dummy="3-4".*data-dummy="4-5"/);
        for (const [, from, to, days] of diagram.alt.matchAll(/([1-7])から([1-7])へ(\d+)日/g)) {
          assert.match(markup, new RegExp(`data-activity="${from}-${to}"[^>]*data-days="${days}"`));
        }
      }
    }
  }
});

test('2015秋午前36・43 署名と全ファイルハッシュを無害な入力で別に検算する', () => {
  const bytes = Buffer.from('example-A');
  const modification = Buffer.from('example-B');
  const digest = (data: Buffer) => createHash('sha256').update(data).digest('hex');
  assert.equal(digest(Buffer.from(bytes)), digest(bytes));
  assert.equal(modification.length, bytes.length);
  assert.notEqual(digest(modification), digest(bytes));

  const rsa = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const signature = createSign('SHA256').update(bytes).sign(rsa.privateKey);
  assert(createVerify('SHA256').update(bytes).verify(rsa.publicKey, signature));
  assert(!createVerify('SHA256').update(modification).verify(rsa.publicKey, signature));
  assert(!createVerify('SHA256').update(bytes).verify(other.publicKey, signature));
  assert.equal(bytes.toString(), 'example-A');
});
