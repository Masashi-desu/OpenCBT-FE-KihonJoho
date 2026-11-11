import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { gradeAnswer } from '../../../src/core/answers';
import type { Block, Question } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2009AutumnPm01To04Definitions as definitions } from '../../../src/core/generators/legacy-2009-autumn-pm-01-04';
import { legacy2009AutumnPm0104Figures as figures } from '../../../src/core/generators/legacy-2009-autumn-pm-01-04-figures';
import { legacy2009AutumnPm0104FigureRenderers as renderers } from '../../../src/ui/Legacy2009AutumnPm0104Figures';
import { autumn2009Pm01To04Specs as specs } from '../../../scripts/legacy-2009-autumn-pm-01-04-specs';
import official from '../../fixtures/legacy-2009-autumn-pm-01-04-review.json';

const marks = 'アイウエオカキクケコ';
const cases = (number: number) => [0, 1, 2, 3].map(index => definitions[number - 1].build([index]));
const paragraphs = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const choiceText = (block: Block) => {
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
};
const choiceBlock = (body: GeneratedBody, id: string) => body.choices[Number(id.slice('choice-value-'.length)) - 1][0];
function part(body: GeneratedBody, position: number) {
  const slot = body.answerParts![position];
  const answer = body.partAnswers!.find(answer =>
    answer.kind === 'choice' ? answer.partId === slot.id : answer.kind === 'unordered' && answer.partIds.includes(slot.id));
  assert(answer?.kind === 'choice' || answer?.kind === 'unordered');
  const id = answer.kind === 'choice' ? answer.choiceId : answer.choiceIds[answer.partIds.indexOf(slot.id)];
  return { slot, answer, options: slot.choiceIds.map(value => choiceBlock(body, value)), correct: slot.choiceIds.indexOf(id) };
}
function unique(body: GeneratedBody, position: number, accepts: (option: Block) => boolean) {
  const { slot, options, correct } = part(body, position);
  assert.deepEqual(options.flatMap((choice, index) => accepts(choice) ? [index] : []), [correct], slot.label);
}
function diagram(body: GeneratedBody, suffix: string) {
  const value = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith(suffix));
  assert(value?.type === 'diagram' && value.scene.kind === 'source_figure');
  return value;
}
const asNumber = (value: string) => Number(value.replaceAll(',', '').replace('−', '-'));

test('問1〜4の公式19欄、15頁、16条件、304選択肢、境界と決定性を確認する', () => {
  assert.deepEqual(specs.map(spec => spec.pages), official.questions.map(question => question.pages));
  assert.match(specs[0].originalPageAlt[6], /6問以上選択した場合には，はじめの5問/);
  assert.match(specs[1].originalPageAlt[12], /預かってから1年を超え.*未返却/);
  assert.doesNotMatch(specs[3].originalPageAlt[20], /その場で通信を中継せず/);
  for (const spec of specs) for (const page of spec.pages) assert(spec.originalPageAlt[page].length > 100);
  let conditions = 0, options = 0;
  for (const [i, definition] of definitions.entries()) {
    const question = official.questions[i], bodies = cases(i + 1), base = bodies[0];
    assert.equal(definition.source, official.collection + '-' + (i + 1));
    assert.deepEqual(definition.reference, [0]);
    assert.equal(definition.version, '3.2.0');
    assert.equal(question.keys, base.answerParts!.map((_, position) => marks[part(base, position).correct]).join(''));
    assert.equal(new Set(bodies.map(body => JSON.stringify(body.prompt))).size, 4);
    for (const [index, body] of bodies.entries()) {
      assert.deepEqual(body, definition.build([index]));
      assert.deepEqual(body.answerParts!.map(slot => slot.label), question.labels);
      assert.deepEqual(body.answerParts!.map(slot => slot.choiceIds.length), question.counts);
      assert.deepEqual(body.prompt.map(block => block.type), base.prompt.map(block => block.type));
      const unordered = body.partAnswers!.flatMap(answer => answer.kind === 'unordered' ? answer.partIds : []);
      assert.deepEqual(unordered, 'unordered' in question ? question.unordered : []);
      assert(body.explanation.length > 80);
      body.answerParts!.forEach((_, position) => {
        const { options, correct } = part(body, position);
        assert(correct >= 0);
        assert.equal(new Set(options.map(option => JSON.stringify(option))).size, options.length);
      });
      conditions++;
      options += body.choices.length;
    }
    for (const invalid of [[-1], [4], [NaN], [0.5], [], [0, 0], Array<number>(1)]) {
      assert.throws(() => definition.build(invalid), /PARAMETER_CONSTRAINT/);
    }
  }
  assert.equal(conditions, 16);
  assert.equal(options, 304);
});

test('問1の二つの論理ゲート、全真理値表、2の補数と各段の桁上がりを別方式で検算する', () => {
  const gates: Record<string, (a: number, b: number) => number> = {
    AND: (a, b) => a & b, NAND: (a, b) => (a & b) ^ 1, NOR: (a, b) => (a | b) ^ 1, OR: (a, b) => a | b, XOR: (a, b) => a ^ b,
  };
  const bits = [0, 1], pairs = bits.flatMap(x => bits.map(y => [x, y]));
  for (const body of cases(1)) {
    unique(body, 0, option => pairs.every(([x, y]) => gates[choiceText(option)](x, y) === (x !== y ? 1 : 0)));
    const tableRows = diagram(body, 'carry-table').alt.split('\n').slice(1);
    assert.equal(tableRows.length, 8);
    const triplets = tableRows.map(row => row.split('｜').slice(0, 3).map(Number));
    assert.equal(new Set(triplets.map(row => row.join(''))).size, 8);
    unique(body, 1, option => triplets.every(([c, x, y]) =>
      gates[choiceText(option)](x & y, (x ^ y) & c) === ((x & y) | (y & c) | (x & c))));
    const hidden = tableRows.find(row => row.includes('［c］'))!;
    const [carry, left, right] = hidden.split('｜').slice(0, 3).map(Number);
    const expected = [String(left & right), String((left ^ right) & carry)];
    unique(body, 2, option => {
      assert(option.type === 'table');
      assert.deepEqual(option.columns, ['C₁', 'C₂']);
      return option.rows[0].join('') === expected.join('');
    });
    const [, a, b] = paragraphs(body).match(/Aとして([−\d]+)を，Bとして([−\d]+)（/)!.map(asNumber);
    const carryVector = [2, 4, 8, 16].map(place => Number(((a & (place - 1)) + (b & (place - 1))) >= place));
    unique(body, 3, option => {
      assert(option.type === 'table');
      assert.deepEqual(option.columns, ['C₁', 'C₂', 'C₃', 'C₄']);
      return option.rows[0].join('') === carryVector.join('');
    });
    assert(body.explanation.includes('C₁〜C₄は' + carryVector.join('，')));
  }
});

test('問2はSQLiteに全候補を代入し、棚の集約とc/dの正しい結合を独立した関係モデルで検算する', () => {
  const maintenanceRules = [
    /同一の保管棚の別の箱.*書類預託表の箱番号だけ/,
    /別の保管棚にある箱番号も異なる箱.*書類預託表の棚番号と箱番号/,
    /書類番号を基に書類預託表と棚表を検索できる/,
    /区画名称を変更.*区画表の区画名称を更新/,
    /保管棚の配置を変更.*書類預託表は更新しなくてよい/,
  ];
  for (const body of cases(2)) {
    const prompt = paragraphs(body);
    const sql = body.prompt.flatMap(block => block.type === 'code' && block.language === 'sql' ? [block.text] : []);
    assert.equal(sql.length, 2);
    const cutoff = sql[1].match(/預託日 <= '([0-9]{8})'/)![1];
    const date = prompt.match(/検索日を(\d+)年(\d+)月(\d+)日/)!.slice(1).map(Number);
    const years = Number(prompt.match(/検索日の(\d+)年前/)![1]);
    assert.equal(cutoff, new Date(Date.UTC(date[0] - years, date[1] - 1, date[2])).toISOString().slice(0, 10).replaceAll('-', ''));
    const before = String(Number(cutoff) - 1), after = String(Number(cutoff) + 1);
    const shelves = [
      { id: 10, floor: 1, section: 2 }, { id: 11, floor: 1, section: 2 }, { id: 12, floor: 1, section: 2 },
      { id: 20, floor: 1, section: 3 }, { id: 21, floor: 1, section: 3 }, { id: 22, floor: 1, section: 3 }, { id: 30, floor: 2, section: 3 },
      { id: 31, floor: 2, section: 3 }, { id: 40, floor: 2, section: 2 }, { id: 41, floor: 2, section: 2 },
    ];
    const deposits = [
      { doc: 1, shelf: 10, date: before, end: null }, { doc: 2, shelf: 20, date: cutoff, end: null },
      { doc: 3, shelf: 30, date: after, end: null }, { doc: 4, shelf: 31, date: before, end: after },
      { doc: 5, shelf: 40, date: after, end: null }, { doc: 6, shelf: 10, date: after, end: null },
    ];
    const database = new DatabaseSync(':memory:');
    database.exec('CREATE TABLE 棚表(棚番号 INT PRIMARY KEY, 階番号 INT, 区画番号 INT, 棚配置日 TEXT);' +
      'CREATE TABLE 書類表(書類番号 INT PRIMARY KEY, 書類名称 TEXT);' +
      'CREATE TABLE 書類預託表(書類番号 INT, 棚番号 INT NOT NULL, 預託日 TEXT, 返却日 TEXT, 箱番号 TEXT);');
    const insertShelf = database.prepare('INSERT INTO 棚表 VALUES (?, ?, ?, ?)');
    const insertDoc = database.prepare('INSERT INTO 書類表 VALUES (?, ?)');
    const insertDeposit = database.prepare('INSERT INTO 書類預託表 VALUES (?, ?, ?, ?, ?)');
    for (const shelf of shelves) insertShelf.run(shelf.id, shelf.floor, shelf.section, '20000101');
    for (const deposit of deposits) {
      insertDoc.run(deposit.doc, '書類' + deposit.doc);
      insertDeposit.run(deposit.doc, deposit.shelf, deposit.date, deposit.end, '3-4');
    }
    const query = (text: string) => {
      try { return JSON.stringify(database.prepare(text).all().map(row => Object.values(row)).sort()); }
      catch { return null; }
    };
    const section = Number(prompt.match(/各階の区画番号(\d+)/)?.[1] ?? 0);
    const occupied = /書類を保管している保管棚/.test(prompt);
    const grouped = new Map<number, number>();
    for (const shelf of shelves) {
      if (section && shelf.section !== section) continue;
      const active = deposits.some(deposit => deposit.shelf === shelf.id && deposit.end === null);
      if (active === occupied) grouped.set(shelf.floor, (grouped.get(shelf.floor) ?? 0) + 1);
    }
    const expectedGroups = JSON.stringify([...grouped].sort());
    const searchParts = [part(body, 0), part(body, 1)];
    const legalGroups: number[][] = [];
    for (const [a, left] of searchParts[0].options.entries()) for (const [b, right] of searchParts[1].options.entries()) {
      if (query(sql[0].replace('［a］', choiceText(left)).replace('［b］', choiceText(right))) === expectedGroups) legalGroups.push([a, b]);
    }
    assert.deepEqual(legalGroups, [[searchParts[0].correct, searchParts[1].correct]]);
    const expectedDocuments = JSON.stringify(deposits.filter(deposit => deposit.date <= cutoff && deposit.end === null).map(deposit => {
      const shelf = shelves.find(shelf => shelf.id === deposit.shelf)!;
      return [deposit.doc, '書類' + deposit.doc, deposit.date, shelf.floor, shelf.section, shelf.id, '3-4'];
    }).sort());
    const joinParts = [part(body, 2), part(body, 3)];
    const legalJoins: number[][] = [];
    for (const [c, left] of joinParts[0].options.entries()) for (const [d, right] of joinParts[1].options.entries()) {
      if (query(sql[1].replace('［c］', choiceText(left)).replace('［d］', choiceText(right))) === expectedDocuments) legalJoins.push([c, d]);
    }
    const keys = [joinParts[0].correct, joinParts[1].correct];
    assert.deepEqual(legalJoins, [keys, [...keys].reverse()]);
    assert.equal(joinParts[0].answer.kind, 'unordered');
    const gradingQuestion = { answerParts: body.answerParts, correctAnswer: { parts: body.partAnswers } } as Question;
    const choices = body.answerParts!.map((slot, position) => [slot.id, slot.choiceIds[part(body, position).correct]]);
    const selected = Object.fromEntries(choices);
    [selected['part-c'], selected['part-d']] = [selected['part-d'], selected['part-c']];
    assert.equal(gradeAnswer(gradingQuestion, { selectedPartChoices: selected }).outcome, 'correct');
    selected['part-c'] = selected['part-d'];
    assert.equal(gradeAnswer(gradingQuestion, { selectedPartChoices: selected }).outcome, 'incorrect');
    unique(body, 4, option => maintenanceRules.some(rule => rule.test(choiceText(option))));
    assert(body.explanation.includes(cutoff + '以前'));
    assert.deepEqual(body.contexts?.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])),
      ['asset-ipa-2009h21a-fe-pm-p005']);
    database.close();
  }
});

test('問3は送信シミュレーションと差分分布の全100件で各欄を検算する', () => {
  const expression = (text: string, n: number) => {
    const token = text.replaceAll(',', '');
    if (token === 'n') return n;
    if (/^\d+n$/.test(token)) return parseInt(token, 10) * n;
    if (/^\d+\/n$/.test(token)) return parseInt(token, 10) / n;
    if (/^n\/\d+$/.test(token)) return n / Number(token.slice(2));
    assert.match(token, /^\d+$/);
    return Number(token);
  };
  for (const body of cases(3)) {
    const prompt = paragraphs(body);
    const rate = Number(prompt.match(/1秒当たり(\d+)回/)![1]);
    const [, header, limit] = prompt.match(/(\d+)バイトのヘッダ.*最大長は([\d,]+)バイト/)!.map(asNumber);
    assert(diagram(body, 'packet').alt.includes(String(header)));
    let count = 0, bytes = header;
    while (bytes + 4 <= limit) { bytes += 4; count++; }
    unique(body, 1, option => asNumber(choiceText(option)) * rate === count);
    const samples = [2, 3, 5, 17, count];
    const measure = (n: number) => {
      const observations = new Array(rate * n).fill(4);
      let bits = 0;
      for (let first = 0; first < observations.length; first += n) {
        bits += 8 * (header + observations.slice(first, first + n).reduce((a, b) => a + b, 0));
      }
      return bits / n;
    };
    const sends = samples.map(measure);
    unique(body, 0, option => {
      const statement = choiceText(option);
      if (/送信量は多くなる/.test(statement)) return sends.every((value, i) => i === 0 || value > sends[i - 1]);
      if (/送信量は少なくなる/.test(statement)) return sends.every((value, i) => i === 0 || value < sends[i - 1]);
      assert.match(statement, /送信量は変わらない/);
      return sends.every(value => value === sends[0]);
    });
    const [b, c] = [part(body, 2), part(body, 3)];
    const pairs: number[][] = [];
    for (const [i, left] of b.options.entries()) for (const [j, right] of c.options.entries()) {
      if (samples.every((n, pos) =>
        Math.abs(8 * expression(choiceText(left), n) * (header + expression(choiceText(right), n)) - sends[pos]) < 0.000001)) {
        pairs.push([i, j]);
      }
    }
    assert.deepEqual(pairs, [[b.correct, c.correct]]);
    const coding = body.prompt.find(block => block.type === 'table' && /出現確率/.test(block.caption));
    assert(coding?.type === 'table');
    const lengths = coding.rows[0].slice(1).map(value => {
      const [, prefix, difference] = value.match(/^([01]+)｜差（(\d+)ビット）$/)!;
      return prefix.length + Number(difference);
    });
    assert.deepEqual(coding.rows[1].slice(1).map(Number), lengths);
    const sequence = coding.rows[2].slice(1).flatMap((value, i) => new Array(parseInt(value, 10)).fill(lengths[i]));
    assert.equal(sequence.length, 100);
    const mean = sequence.reduce((total, next) => total + next, 0) / sequence.length;
    unique(body, 4, option => asNumber(choiceText(option)) === mean);
    assert.match(prompt, /パケットの先頭.*これまでどおり格納/);
    assert(body.explanation.includes('＝' + mean + 'ビット'));
  }
});

test('問4は全候補数をBigIntで比較し、漏えい経路別に後日の再認証を検証する', () => {
  const password = 'fixed credential', firstChallenge = 'challenge 1', nextChallenge = 'challenge 2';
  const response = (p: string, challenge: string) => 'H(' + p + ',' + challenge + ')';
  const token = (time: number) => 'time-bound ' + time;
  const derive = (method: number, readKeys: boolean) => {
    if (method === 1) return password;
    if (method === 2) return readKeys ? response(password, nextChallenge) : response(password, firstChallenge);
    return token(0);
  };
  for (const body of cases(4)) {
    const prompt = paragraphs(body);
    const [, base, initial, longer] = prompt.match(/英小文字(\d+)文字だけからなる(\d+)文字.*長さを(\d+)文字/)!.map(Number);
    const originalSearch = BigInt(base) ** BigInt(initial);
    const powers = [BigInt(base) ** BigInt(longer), BigInt(base * 2) ** BigInt(initial)];
    for (const [position, target] of powers.entries()) {
      unique(body, position, option => {
        const hundredths = BigInt(Math.round(asNumber(choiceText(option)) * 100));
        return hundredths * originalSearch === target * 100n;
      });
    }
    const later = [password, response(password, nextChallenge), token(2)];
    for (const [offset, readKeys] of [false, true, false].entries()) {
      const methods = [1, 2, 3].filter((method, pos) => derive(method, readKeys) === later[pos]);
      unique(body, offset + 2, option => {
        const shown = [...choiceText(option).matchAll(/[123]/g)].map(match => Number(match[0]));
        return shown.join(',') === methods.join(',');
      });
    }
    assert(part(body, 2).correct === part(body, 4).correct);
    assert.match(prompt, /解答は，重複して選んでもよい/);
    assert.match(prompt, /その場で通信を中継せず/);
    assert.match(prompt, /通信経路は暗号化されていない/);
    assert.match(body.explanation, /有効時間を過ぎれば使用できない/);
  }
});

test('9登録の全状態を描画し、空欄・接続・代替説明を確認する', () => {
  assert.equal(figures.length, 9);
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  const seen = new Set<string>();
  for (const body of [1, 2, 3, 4].flatMap(cases)) {
    for (const block of body.prompt) {
      if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
      const { profile, values } = block.scene;
      const figure = figures.find(item => item.profile === profile);
      const renderer = renderers.find(item => item.profile === profile);
      assert(figure && renderer);
      assert.equal(figure.alt(values), block.alt);
      figure.validate(values);
      assert.throws(() => figure.validate([figure.domain[0][1] + 1]), /FIGURE_PROFILE/);
      const markup = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
      assert(markup.includes('data-source-figure="' + profile + '"'));
      assert.match(markup, /role="img".+aria-labelledby=.+aria-describedby=/);
      assert.match(markup, /class="diagram-scroll" tabindex="0"/);
      assert.match(markup, /<figcaption/);
      assert(markup.includes('var(--diagram-ink)'));
      if (profile.endsWith('carry-table')) {
        assert.equal([...markup.matchAll(/data-carry-row="/g)].length, 8);
        assert.equal([...markup.matchAll(/>c<\/text>/g)].length, 1);
      }
      if (profile.endsWith('packet')) {
        const [, header, max] = block.alt.match(/ヘッダ（(\d+)バイト）.*最大長は([\d,]+)バイト/)!;
        assert(markup.includes('（' + header + 'バイト）'));
        assert(markup.includes('最大' + max + 'バイト'));
      }
      seen.add(profile + ':' + values.join(','));
    }
  }
  assert.equal(seen.size, 17);
});
