import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { gradeAnswer, validateAnswerDefinition } from '../src/core/answers';
import type { AnswerOutcome, Block, Question } from '../src/core/types';
import { readBookletFigure } from '../src/core/booklet-figure-extension-contract';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2016SpringPm5Definition as q5 } from '../src/core/generators/legacy-2016-spring-pm-5';
import { legacy2016SpringPm6Definition as q6 } from '../src/core/generators/legacy-2016-spring-pm-6';
import { legacy2016SpringPm7Definition as q7 } from '../src/core/generators/legacy-2016-spring-pm-7';
import { legacy2016SpringPm8Definition as q8 } from '../src/core/generators/legacy-2016-spring-pm-8';
import { legacy2016SpringPm0508Figures as figures } from '../src/core/generators/legacy-2016-spring-pm-figures-05-08';
import { legacy2016SpringPm0508FigureRenderers as renderers } from '../src/ui/Legacy2016SpringPm0508Figures';
import { spring2016Pm05To08Specs as specs } from '../scripts/legacy-2016-spring-pm-05-08-specs';

const defs = [q5, q6, q7, q8];
const symbols = [...'アイウエオカキクケコ'];
const expectedCounts = [[3, 3, 4, 4, 4, 6, 4], [3, 3, 4, 4, 4], [5, 5, 4, 4, 4, 4, 4], [6, 6, 4, 4, 10, 10, 10]];
const officialKeys = ['ウアアウアアイ', 'ウアエイイ', 'アウイウイエア', 'アウエイウカケ'];
const flatText = (blocks: Block[]) => blocks.map(block =>
  block.type === 'paragraph' || block.type === 'code' ? block.text
    : block.type === 'table' ? block.rows.flat().join('／') : block.type === 'diagram' ? block.alt : '').join('\n');
const integer = (text: string) => Number(text.replaceAll(',', '').replaceAll('－', '-').match(/^-?\d+/)?.[0]);

function part(body: GeneratedBody, id: string) {
  const p = body.answerParts!.find(candidate => candidate.id === 'part-' + id);
  assert(p);
  return p;
}
function bank(body: GeneratedBody, id: string) {
  return part(body, id).choiceIds.map(choice => flatText(body.choices[Number(choice.slice(13)) - 1]));
}
function selected(body: GeneratedBody, id: string) {
  const field = part(body, id);
  const answer = body.partAnswers!.find(answer => answer.kind === 'unordered' ? answer.partIds.includes(field.id) : answer.partId === field.id);
  assert(answer && answer.kind !== 'no_correct_answer');
  return field.choiceIds.indexOf(answer.kind === 'choice' ? answer.choiceId : answer.choiceIds[answer.partIds.indexOf(field.id)]);
}
function unique(body: GeneratedBody, id: string, satisfies: (choice: string, index: number) => boolean) {
  const choices = bank(body, id);
  assert.equal(new Set(choices).size, choices.length, id + ' duplicate choices');
  const matching = choices.flatMap((choice, index) => satisfies(choice, index) ? [index] : []);
  assert.deepEqual(matching, [selected(body, id)], id + ' correct choice');
}
function table(body: GeneratedBody, prefix: string) {
  const block = body.prompt.find(block => block.type === 'table' && block.caption.startsWith(prefix));
  assert(block?.type === 'table');
  return block;
}
function diagram(body: GeneratedBody, suffix: string) {
  const block = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith(suffix));
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  return { ...block, scene: block.scene };
}
function render(body: GeneratedBody, suffix: string) {
  const block = diagram(body, suffix);
  const found = renderers.find(renderer => renderer.profile === block.scene.profile);
  assert(found);
  return renderToStaticMarkup(createElement(found.component, { values: block.scene.values, caption: block.caption }));
}

test('2016春午後の問5〜8は公式各欄・候補数・ページ・正誤表・固定資料を保持する', () => {
  for (const [index, definition] of defs.entries()) {
    const { original, originalPageAlt, pages } = specs[index];
    assert.deepEqual(original.answerParts!.map(p => p.choiceIds.length), expectedCounts[index]);
    assert.equal(original.answerParts!.map(p => symbols[selected(original, p.id.slice(5))]).join(''), officialKeys[index]);
    assert.deepEqual(Object.keys(originalPageAlt).map(Number), pages);
    assert(Object.values(originalPageAlt).every(text => text.length > 150 && text.length <= 2000));
    const max = definition.fields[0].maximum;
    const seen = new Set();
    for (let value = 0; value <= max; value++) {
      const generated = definition.build([value]);
      assert.deepEqual(generated.answerParts!.map(p => p.choiceIds.length), expectedCounts[index]);
      assert.deepEqual(definition.build([value]), generated);
      const result = flatText(generated.prompt);
      assert(!seen.has(result), '各入力は問題資料の条件も変える');
      seen.add(result);
      assert.deepEqual(generated.contexts?.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])),
        definition.fixedReferenceAssetIds);
    }
    for (const bad of [[], [-1], [max + 1], [.5], [NaN], [Infinity], [0, 0]])
      assert.throws(() => definition.build(bad), /PARAMETER_CONSTRAINT/);
  }
  assert.deepEqual(specs.flatMap(spec => spec.pages), Array.from({ length: 20 }, (_, i) => i + 21));
  assert.match(specs[2].originalPageAlt[33], /1,240人[\s\S]+1,240回/);
  assert.deepEqual(q7.fixedReferenceAssetIds, ['asset-ipa-2016h28h-fe-pm-p002']);
  assert.deepEqual(q8.fixedReferenceAssetIds, ['asset-ipa-2016h28h-fe-pm-p004', 'asset-ipa-2016h28h-fe-pm-p005']);
});

test('問5の全条件は接続・処理・実データの最小照合項目を独立に照合し、d/eを順不同で採点する', () => {
  const records = [
    { 店舗番号: '101', 店舗名: '中央店', 市区町村名: '東市' },
    { 店舗番号: '102', 店舗名: '中央店', 市区町村名: '西市' },
    { 店舗番号: '103', 店舗名: '駅前店', 市区町村名: '東市' },
  ];
  const data = '店舗データファイル', favorites = 'お気に入りデータファイル';
  const banks = {
    a: [favorites, data, data + 'と' + favorites],
    c: ['ブラウザがWebサーバに都度要求し，Webサーバが生成する必要がある', 'ブラウザがファイルサーバに都度要求し，ファイルサーバから取得する必要がある',
      'ブラウザが生成するが，生成中に圏外を検知すると停止する', 'ブラウザが生成し，都度表示させる必要がある'],
    d: ['Webサーバ', 'ファイルサーバ', 'ブラウザ', '利用者'],
    s3: ['Webサーバ／Webサーバ', 'Webサーバ／ブラウザ', 'ブラウザ／Webサーバ', 'ブラウザ／ブラウザ'],
  };
  for (let i = 0; i < 6; i++) {
    const body = q5.build([i]);
    for (const [id, expected] of Object.entries(banks)) assert.deepEqual(bank(body, id), expected);
    const favoriteLayout = diagram(body, '-favorite-record').alt;
    const fields = favoriteLayout.match(/^左から(.+)、お気に入り数の順に並ぶ。$/)?.[1].split('、');
    assert(fields);
    const inputs = records.map(row => ({ ...row }));
    if (fields.length === 1 && fields[0] === '店舗名') inputs[1].店舗名 = '西口店';
    const filesFor = (required: string[]) => (choice: string) =>
      choice.split('と').sort().join('/') === [...required].sort().join('/');
    unique(body, 'a', filesFor([data, favorites]));
    const visible = flatText(body.prompt);
    unique(body, 'b', filesFor(visible.includes('表示中の店舗の最新の特売情報も読み込み') ? [favorites, data] : [favorites]));
    const web = render(body, '-web-sequence'), app = render(body, '-app-sequence');
    assert.match(web, /data-pm-sequence="Webサーバ→ファイルサーバ"/);
    assert.match(app, /data-pm-sequence="ブラウザ→ファイルサーバ"/);
    assert.equal(app.includes('最新の特売情報も要求'), i >= 3);
    assert.equal(web.includes('最新の特売情報も要求'), i >= 3);
    unique(body, 'c', choice => choice.includes('都度要求') && choice.includes('Webサーバが生成'));
    unique(body, 's3', choice => choice === 'Webサーバ／ブラウザ');
    unique(body, 's2', choice => {
      const candidate = choice.split('，') as (keyof typeof records[number])[];
      return candidate.length <= fields.length && candidate.every(field => fields.includes(field)) &&
        new Set(inputs.map(row => candidate.map(field => row[field]).join('/'))).size === records.length;
    });
    assert.match(body.explanation, /順は問わない/);
    const pair = body.partAnswers!.find(answer => answer.kind === 'unordered');
    assert(pair?.kind === 'unordered');
    assert.deepEqual(pair.partIds, ['part-d', 'part-e']);
    assert.deepEqual(pair.choiceIds.map(id => bank(body, 'd')[part(body, 'd').choiceIds.indexOf(id)]), ['ブラウザ', 'Webサーバ']);
    assert.deepEqual(part(body, 'a').choiceIds, part(body, 'b').choiceIds);
    assert.deepEqual(part(body, 'd').choiceIds, part(body, 'e').choiceIds);
    const question = {
      answerParts: body.answerParts, correctAnswer: { parts: body.partAnswers },
      choices: body.choices.map((_, index) => ({ id: 'choice-value-' + (index + 1) })),
    } as Question;
    validateAnswerDefinition(question);
    for (const first of part(body, 'd').choiceIds) for (const second of part(body, 'e').choiceIds) {
      const expected: boolean = first !== second && [first, second].every(id => pair.choiceIds.includes(id));
      const result = gradeAnswer(question, { selectedPartChoices: { 'part-d': first, 'part-e': second } });
      const pairResults: { partId: string; outcome: AnswerOutcome }[] = result.parts!.filter(item => pair.partIds.includes(item.partId));
      assert.equal(pairResults.length, 2);
      assert.equal(pairResults.every(item => item.outcome === 'correct'), expected);
      assert.equal(pairResults.filter(item => item.outcome === 'correct').length, new Set([first, second].filter(id => pair.choiceIds.includes(id))).size);
    }
  }
});

test('問6の全条件で表から点数・項番1の備え・再評価を独立に計算する', () => {
  const actions = [
    'C社内のシステムに関するプロジェクトの管理経験を有する，N社以外のベンダ要員を増員する。',
    'C社の会計業務に関する業務マニュアルを整備し，N社の要員に研修を実施する。',
    'パッケージの機能をC社の業務向けにカスタマイズするために，N社の要員を増員する。',
    'パッケージを適用する際のC社の業務プロセス，運用フローの見直しについて，C社内の有識者社員から成る検討要員を増員する。',
  ];
  const signals = ['解決されずに残っている課題の増加', '業務プロセス，運用フローの改訂作業量の増加',
    '業務プロセス，運用フローのレビューでの指摘の増加', '作り込み機能の増加'];
  const pricePoints = (yen: number) => [4000, 5000].filter(limit => yen <= limit).length * 60;
  for (const [yen, score] of [[3999, 120], [4000, 120], [4001, 60], [5000, 60], [5001, 0]])
    assert.equal(pricePoints(yen), score);
  const winners = new Set<string>(), pointVariants = new Set<number>();
  for (let i = 0; i < 5; i++) {
    const body = q6.build([i]);
    const rows = table(body, '表1').rows;
    assert.deepEqual(rows[1].slice(1, 6).map(Number), [20, 10, 30, 20, 30]);
    const estimates = [2, 4, 6].map(row => integer(rows[row][5]));
    const scores = [2, 4, 6].map((row, index) => {
      const [, matches, ext, knowledge, experience] = rows[row];
      const number = Number(matches.split('：')[1]);
      const fit = [30, 40].filter(limit => number >= limit).length * 40;
      const extScore = ext === '有' ? 20 : 0;
      const knowScore = ['低', '中', '高'].indexOf(knowledge) * 60;
      const experienceScore = ['少', '中', '多'].indexOf(experience) * 40;
      const components = [fit, extScore, knowScore, experienceScore, pricePoints(estimates[index])];
      for (const [column, shown] of rows[row + 1].slice(1, 6).entries()) {
        if (!/網掛け|［a］/.test(shown)) assert.equal(Number(shown), components[column]);
      }
      return components.reduce((a, b) => a + b, 0);
    });
    assert.equal(Number(rows[3][6]), scores[0]);
    const matrix = table(body, '表2').rows;
    const priorities = table(body, '表3').rows.map(row =>
      [2, 5, 8].map(col => integer(matrix[['高い', '普通', '低い'].indexOf(row[col])][1 + ['小', '中', '大'].indexOf(row[col + 1])])));
    assert.equal(priorities[0][2], 6);
    const adjustedScores = scores.map((score, company) => {
      const provisions = priorities.filter(row => row[company] >= 6).length;
      return score - pricePoints(estimates[company]) + pricePoints(estimates[company] * (10 + provisions) / 10);
    });
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++)
      assert.equal(Math.sign(scores[a] - scores[b]), Math.sign(adjustedScores[a] - adjustedScores[b]));
    const winner = 'LMN'[scores.indexOf(Math.max(...scores))];
    winners.add(winner);
    pointVariants.add(pricePoints(estimates[1]));
    unique(body, 'a', choice => Number(choice) === pricePoints(estimates[1]));
    unique(body, 'b', choice => choice === winner);
    assert.deepEqual(bank(body, 'c'), actions);
    assert.deepEqual(bank(body, 'd'), signals);
    unique(body, 'c', choice => choice.includes('業務プロセス') && choice.includes('見直し'));
    unique(body, 'd', choice => choice.includes('改訂作業量'));
    unique(body, 'e', choice => Number(choice) * 10 === estimates[2]);
    assert.match(body.explanation, new RegExp('N社' + scores[2]));
  }
  assert.deepEqual(winners, new Set(['L', 'M']));
  assert.deepEqual(pointVariants, new Set([120, 60]));
});

test('問7の全条件は表の比・座標・増分・投資効果を独立に照合する', () => {
  const outcomes = new Set<string>();
  for (let i = 0; i < 6; i++) {
    const body = q7.build([i]), purchaseTable = table(body, '表1');
    const rows = purchaseTable.rows.map(([product, persons, times, sales]) => ({
      product, persons: integer(persons), times: integer(times), sales: integer(sales),
    }));
    const repeatRate = (row: typeof rows[number]) => 1 - row.persons / row.times;
    const a = rows.filter(row => row.persons > 4000 && repeatRate(row) < .2);
    const b = rows.filter(row => row.persons < 2000 && repeatRate(row) > .5);
    assert.equal(a.length, 1);
    assert.equal(b.length, 1);
    unique(body, 'a', choice => choice === a[0].product);
    unique(body, 'b', choice => choice === b[0].product);
    const chart = render(body, '-bubble-chart');
    const coords = [...chart.matchAll(/<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/g)];
    assert.equal(coords.length, rows.length);
    for (const [index, row] of rows.entries()) {
      const [, cx, cy, radius] = coords[index];
      assert(Math.abs((Number(cx) - 83) / .09 - row.persons) < 1e-7);
      assert(Math.abs((409 - Number(cy)) / 360 - repeatRate(row)) < 1e-7);
      assert(Math.abs((Number(radius) / .61) ** 2 - row.sales) < 1e-7);
    }
    assert.match(chart, />a<\/text>/);
    assert.match(chart, />b<\/text>/);
    assert.deepEqual(bank(body, 'c'), ['商品が欠品しないようにする', '商品の素材や味を見直す', '商品の認知度を高める', 'より価格が高い商品を勧める']);
    assert.deepEqual(bank(body, 'e'), ['価格を上げれば', '購入人数が増えれば', '来店客数が増えれば', 'リピート率が上がれば']);
    unique(body, 'c', choice => choice.includes('素材や味'));
    unique(body, 'd', choice => choice.includes('認知度'));
    unique(body, 'e', choice => choice.includes('購入人数'));
    const [, priceText, quantityText] = flatText(body.prompt).match(new RegExp('商品' + b[0].product + 'の価格は(\\d+)円，1回の購入で商品' + b[0].product + 'を平均(\\d+)個'))!;
    const [cost, additionalPersons, additionalTimes] = table(body, '表2').rows.map(row => integer(row[2]));
    const addedMoney = additionalTimes * Number(priceText) * Number(quantityText);
    const result = [(b[0].sales * 1000 + addedMoney) / 1000, (addedMoney - cost * 1000) / 1000];
    assert(result.every(Number.isSafeInteger));
    const improved = additionalTimes * b[0].persons > additionalPersons * b[0].times;
    const worthwhile = addedMoney > cost * 2000;
    outcomes.add(String(improved) + String(worthwhile));
    unique(body, 'f', choice => {
      const [, total, effect] = choice.match(/^売上金額は([0-9,]+)千円となり，効果額は([－0-9,]+)千円$/)!;
      return integer(total) === result[0] && integer(effect) === result[1];
    });
    assert.deepEqual(bank(body, 'g'), ['投資効果はあるが，リピート率は低下', '投資効果はないが，リピート率は向上',
      '投資効果はあり，リピート率も向上', '投資効果はなく，リピート率も低下']);
    unique(body, 'g', choice => /投資効果はあ/.test(choice) === worthwhile && choice.includes('向上') === improved);
    assert(body.explanation.includes(result[0].toLocaleString('ja-JP')));
    assert(body.explanation.includes(result[1].toLocaleString('ja-JP')));
    assert.match(table(body, '表2').rows[2][2], /回$/);
  }
  assert.equal(outcomes.size, 4);
});

test('問8のプログラム全択を、有効な長さ・削除・移動の参照操作と照合する', () => {
  const body = q8.build([0]);
  const expressions = ['DataLen', 'DataLen ＋ 1', 'DataLen ＋ textLen', 'DataLen ＋ textLen ＋ 1', 'textLen', 'textLen ＋ 1'];
  const expressionValues = (len: number, text: number) => [len, len + 1, len + text, len + text + 1, text, text + 1];
  for (const id of ['a', 'b']) assert.deepEqual(bank(body, id), expressions);
  unique(body, 'a', (_, index) => [0, 3, 10].every(end => [0, 1, 8].every(text =>
    expressionValues(end, text)[index] === end)));
  unique(body, 'b', (_, index) => [0, 3, 10].every(end => [0, 1, 8].every(text =>
    expressionValues(end + 1, text)[index] === Buffer.concat([Buffer.alloc(end), Buffer.from([text]), Buffer.alloc(text)]).length)));
  assert.deepEqual(bank(body, 'c'), ['MemoCnt － pos', 'pos － 1', 'pos', 'pos ＋ 1']);
  assert.deepEqual(bank(body, 'd'), ['fromPos，i ≧ toPos － 1，－1', 'fromPos，i ≧ toPos ＋ 1，－1',
    'toPos，i ≦ fromPos － 1，1', 'toPos，i ≦ fromPos ＋ 1，1']);
  const sequences = Array.from({ length: 5 }, (_, n) => Array.from({ length: n + 1 }, (_, i) => i * 2 + 1));
  unique(body, 'c', (_, index) => sequences.every(values => values.every((_, pos) => {
    const expected = values.filter((_, i) => i !== pos);
    const copied = [...values];
    for (let i = [values.length - pos, pos - 1, pos, pos + 1][index]; i < values.length; i++) {
      if (i - 1 < 0) return false;
      copied[i - 1] = copied[i];
    }
    return expected.every((v, i) => copied[i] === v);
  })));
  unique(body, 'd', (_, index) => sequences.every(values => values.every((moved, from) => values.slice(0, from).every((_, to) => {
    const expected = [...values.slice(0, to), moved, ...values.slice(to, from), ...values.slice(from + 1)];
    const actual = [...values];
    const [start, end, step] = [[from, to - 1, -1], [from, to + 1, -1], [to, from - 1, 1], [to, from + 1, 1]][index];
    for (let i = start; step < 0 ? i >= end : i <= end; i += step) {
      if (i < 1 || i >= actual.length) return false;
      actual[i] = actual[i - 1];
    }
    actual[to] = moved;
    return expected.every((v, i) => actual[i] === v);
  }))));
});

test('問8の全編集例は、実バイト列の独立再構成と再配置に一致する', () => {
  for (let value = 0; value < 5; value++) {
    const body = q8.build([value]), source = flatText(body.prompt);
    assert.match(source, /0〜255/);
    assert.match(source, /引数の内容や配列の空き状態などは事前に検査済み/);
    assert.match(source, /i ≦ Data\[d\]/);
    assert.match(source, /MemoCnt ＝ 0[\s\S]+・return/);
    const initial = [...source.matchAll(/addMemo\((\d+)， “([^”]*)”\)/g)].map(([, count, text]) => {
      assert.equal(Buffer.byteLength(text), Number(count));
      return Buffer.concat([Buffer.from([Number(count)]), Buffer.from(text, 'ascii')]);
    });
    assert.equal(initial.length, 4);
    const removed = Number(source.match(/deleteMemo\((\d+)\)を実行した後/)?.[1]);
    const [, changed, length, replacement] = source.match(/changeMemo\((\d+)，(\d+)， “([^”]*)”\)を実行/) ?? [];
    const [, from, to] = source.match(/moveMemo\((\d+)，(\d+)\)を実行した後/) ?? [];
    assert.equal(Buffer.byteLength(replacement), Number(length));
    const retained = initial.filter((_, index) => index !== removed);
    const newMemo = Buffer.concat([Buffer.from([Number(length)]), Buffer.from(replacement, 'ascii')]);
    const edited = retained.map((row, index) => index === Number(changed) ? newMemo : row);
    const slots = edited.filter((_, index) => index !== Number(from));
    const reordered = [...slots.slice(0, Number(to)), edited[Number(from)], ...slots.slice(Number(to))];
    const oldData = Buffer.concat([...initial, newMemo]);
    const compacted = Buffer.concat(reordered);
    const offsets = reordered.map((_, index) => Buffer.concat(reordered.slice(0, index)).byteLength);
    const expected = [offsets[1], offsets[2], compacted.byteLength];
    const wrongDataLen = oldData.byteLength;
    assert(oldData.byteLength <= 25);
    assert(oldData.byteLength > compacted.byteLength);
    for (const [i, id] of ['e', 'f', 'g'].entries())
      unique(body, id, choice => Number(choice) === expected[i]);
    assert(bank(body, 'e').map(Number).includes(wrongDataLen), '旧DataLenを捨て忘れた値も選択肢に含める');
    assert.deepEqual(bank(body, 'e').map(Number), [...bank(body, 'e').map(Number)].sort((a, b) => a - b));
    assert.match(body.explanation, new RegExp('Memo\\[1\\]は' + offsets[1] + '，Memo\\[2\\]は' + offsets[2]));
    const stages: [number, readonly Buffer[], readonly Buffer[]][] = [
      [0, [], []], [1, initial, initial], [2, initial, retained],
      [3, [...initial, newMemo], edited], [4, [...initial, newMemo], reordered],
    ];
    for (const [stage, records, live] of stages) {
      const display = render(body, '-memo-state-' + stage);
      const state = diagram(body, '-memo-state-' + stage).alt;
      const starts = live.map(record => Buffer.concat(records.slice(0, records.indexOf(record))).byteLength);
      const dataLen = Buffer.concat(records).byteLength;
      const expectedCells: string[] = records.flatMap(record => Array.from({ length: record.length }, () => live.includes(record) ? 'live' : 'garbage'));
      while (expectedCells.length < 25) expectedCells.push('empty');
      assert.equal((display.match(/data-memo-cell=/g) ?? []).length, 25);
      assert.deepEqual([...display.matchAll(/data-cell-state="([^"]+)"/g)].map(m => m[1]), expectedCells);
      assert.match(display, new RegExp('DataLen：' + dataLen + '<'));
      assert.match(display, new RegExp('MemoCnt：' + live.length + '<'));
      assert(state.includes('要素0〜4：' + [...starts.map(String), ...Array(5 - live.length).fill('空き')].join('、')));
      const expectedDisplayedBytes = records.flatMap(record => Array.from(record, (byte, i) => i === 0 ? String(byte) : String.fromCharCode(byte)));
      const cells = display.split('data-memo-cell=').slice(1);
      for (const [i, char] of expectedDisplayedBytes.entries()) assert(cells[i].includes('>' + char + '</text>'));
    }
  }
});

test('問5・7・8の管理図は全入力で表示と代替説明が登録契約に一致する', () => {
  assert.equal(figures.length, 14);
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  let verified = 0;
  for (const [i, definition] of defs.entries()) {
    for (let value = 0; value <= definition.fields[0].maximum; value++) {
      for (const block of definition.build([value]).prompt) {
        if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
        const { profile, values } = block.scene;
        const figure = figures.find(figure => figure.profile === profile);
        const renderer = renderers.find(renderer => renderer.profile === profile);
        assert(figure && renderer, '問' + (i + 5) + 'の図が登録されている');
        assert.equal(readBookletFigure(figure, values), block.alt);
        assert.throws(() => readBookletFigure(figure, [-1]), /入力域/);
        const markup = renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
        assert(markup.includes(block.caption));
        assert.match(markup, /<svg/);
        const expectedImage = renderToStaticMarkup(createElement('div', { role: 'img', 'aria-label': block.alt }));
        assert(markup.includes(expectedImage.slice(0, -'</div>'.length)));
        assert.doesNotMatch(markup, /<img|undefined|NaN/);
        verified++;
      }
    }
  }
  assert.equal(verified, 77);
});
