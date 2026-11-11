import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2009AutumnAm27To53Definitions } from '../../../src/core/generators/legacy-2009-autumn-am-27-53';
import { legacy2009AutumnAm2753Figures } from '../../../src/core/generators/legacy-2009-autumn-am-27-53-figures';
import source from '../../../src/core/generators/legacy-2009-autumn-am-27-53-source.json';
import { legacy2009AutumnAm2753FigureRenderers } from '../../../src/ui/Legacy2009AutumnAm2753Figures';
import { knowledgeReview } from '../../fixtures/legacy-2009-autumn-am-27-53-review';

const officialAnswers = 'ウウウウアウイエアエイウエエアウウイウアイアイイエアウ';
const officialSource: Record<string, { prompt: string; choices: string[] }> = source;
const text = (blocks: Block[]) => blocks.map(block => {
  assert.ok(block.type === 'paragraph' || block.type === 'code');
  return block.text;
}).join('\n');

function sourceChoice(blocks: Block[]) {
  if (blocks.length === 1 && blocks[0].type === 'table') {
    return blocks[0].rows.map(row => row.join('｜')).join('\n');
  }
  return text(blocks);
}

function table(blocks: Block[]) {
  const [block] = blocks;
  assert.equal(blocks.length, 1);
  assert.equal(block.type, 'table');
  return block;
}

function figure(body: GeneratedBody) {
  const block = body.prompt.find(block => block.type === 'diagram');
  assert.ok(block && block.scene.kind === 'source_figure');
  const { profile, values } = block.scene;
  const definition = legacy2009AutumnAm2753Figures.find(entry => entry.profile === profile);
  const renderer = legacy2009AutumnAm2753FigureRenderers.find(entry => entry.profile === profile);
  assert.ok(definition && renderer);
  definition.validate(values);
  assert.equal(block.alt, definition.alt(values));
  const markup = renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
  assert.match(markup, /role="img" aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
  assert.ok(markup.includes(block.alt));
  assert.match(markup, /tabindex="0"/i);
  return { alt: block.alt, markup, definition };
}

function checkKnowledge(body: GeneratedBody, number: number, index: number) {
  const review = knowledgeReview[number];
  const [targetCue, targetKind] = review.conditions[index];
  const prompt = text(body.prompt);
  assert.ok(prompt.includes(targetCue), '本文の査読語句 ' + targetCue);
  if (number === 50) assert.match(prompt, /構成管理に起因しない/);
  const facts = typeof review.options[0][0] === 'string'
    ? review.options as readonly (readonly [string, string])[]
    : (review.options as readonly (readonly (readonly [string, string])[])[])[index];
  const matching: number[] = [];
  body.choices.forEach((blocks, choice) => {
    const display = text(blocks);
    const [evidence, meaning] = facts[choice];
    assert.ok(display.includes(evidence), '選択肢の査読語句 ' + evidence);
    if (meaning === targetKind) matching.push(choice);
  });
  assert.deepEqual(matching, [body.correctIndex]);
}

function checkAudio(body: GeneratedBody) {
  const match = text(body.prompt).match(/1秒間に([\d,]+)回.*それぞれ(\d+)ビット.*?(\d+)×10⁶バイト/);
  assert.ok(match);
  const [, frequency, width, capacity] = match;
  const totalBits = BigInt(capacity) * 8_000_000n;
  const perMinute = BigInt(frequency.replaceAll(',', '')) * BigInt(width) * 60n;
  const minutes = totalBits / perMinute;
  const choices = body.choices.map(text).map(BigInt);
  assert.deepEqual(choices, [totalBits / (perMinute * 10n), totalBits / (perMinute * 8n), minutes, totalBits * 5n / (perMinute * 4n)]);
  const fits = choices.filter(candidate => candidate * perMinute <= totalBits && (candidate + 1n) * perMinute > totalBits);
  assert.deepEqual(fits, [choices[body.correctIndex!]]);
  assert.ok(body.explanation.includes(String(minutes) + '分'));
}

const sqlInputs = [
  ['注文明細', '注文日', '数量', 5],
  ['入庫明細', '入庫日', '個数', 8],
  ['点検記録', '点検日', '作業時間', 2],
  ['検品記録', '検品日', '不良数', 10],
] as const;
function checkSql(body: GeneratedBody, index: number) {
  const [relation, grouping, value, expectedForX] = sqlInputs[index];
  if (index > 0) assert.ok(text(body.prompt).includes(relation + '（' + grouping + '，' + value + '）'));
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE ' + relation + ' (' + grouping + ' TEXT, ' + value + ' INTEGER);' +
      'INSERT INTO ' + relation + " VALUES ('X', 2), ('X', 8), ('Y', 3);");
    const accepted: number[] = [];
    body.choices.forEach(([block], choice) => {
      assert.equal(block.type, 'code');
      assert.equal(block.language, 'sql');
      assert.ok(block.text.split('\n').slice(1).every(line => /^ {4}\S/.test(line)));
      const selectedBareColumn = /^SELECT ([^ ,\n]+), [A-Z]+\(/.exec(block.text)?.[1];
      const groupedColumn = /^ {4}GROUP BY (\S+)$/m.exec(block.text)?.[1];
      // SQLite permits a bare ungrouped column as an extension. The original
      // question uses the SQL grouping rule and must reject that option.
      if (selectedBareColumn && selectedBareColumn !== groupedColumn) {
        assert.equal(choice, 0);
        assert.equal(groupedColumn, undefined);
        return;
      }
      let rows;
      try {
        rows = db.prepare(block.text).all();
      } catch (error) {
        assert.match(String(error), /misuse of aggregate/);
        assert.equal(choice === 2 || choice === 3, true);
        return;
      }
      accepted.push(choice);
      const values = Object.fromEntries(rows.map(row => Object.values(row)));
      assert.deepEqual(values, { X: expectedForX, Y: 3 });
    });
    assert.deepEqual(accepted, [body.correctIndex]);
  } finally {
    db.close();
  }
}

function checkMac(body: GeneratedBody, index: number) {
  const match = /(?:[\dA-F]{2}-){5}[\dA-F]{2}/.exec(text(body.prompt));
  const candidates = body.choices.map(table);
  const values = candidates.map(({ columns, rows }) => {
    assert.deepEqual(columns, ['先頭24ビット', '後続24ビット']);
    assert.equal(rows.length, 1);
    return rows[0];
  });
  if (index > 0) {
    assert.ok(match);
    const octets = match[0].split('-');
    const address = octets.reduce((value, next) => (value << 8n) + BigInt('0x' + next), 0n);
    const format = (part: bigint) => part.toString(16).toUpperCase().padStart(6, '0').match(/../g)!.join('-');
    values.forEach(([upper, lower]) => {
      assert.ok(upper.endsWith('（' + format(address >> 24n) + '）'));
      assert.ok(lower.endsWith('（' + format(address & 0xFFFFFFn) + '）'));
    });
  } else {
    assert.equal(match, null);
  }
  const roles = values.map(([upper, lower]) => [upper.startsWith('OUI（ベンダID）'), lower.startsWith('固有製造番号')]);
  assert.deepEqual(roles, [[false, false], [false, true], [true, false], [true, true]]);
  assert.deepEqual(roles.flatMap(([upper, lower], choice) => upper && lower ? [choice] : []), [body.correctIndex]);
}

const ipv4 = (address: string) => address.split('.').reduce((total, octet) => total * 256n + BigInt(octet), 0n);
function checkSubnet(body: GeneratedBody, index: number) {
  const match = /IPアドレス([\d.]+)，サブネットマスク([\d.]+)/.exec(text(body.prompt));
  assert.ok(match);
  const ip = ipv4(match[1]), mask = ipv4(match[2]), network = ip & mask;
  const maskBits = mask.toString(2).padStart(32, '0');
  assert.match(maskBits, /^1+0+$/);
  const prefix = maskBits.indexOf('0');
  const labels = body.choices.map(text);
  const wrongPrefixes = [26, 24, 27, 25];
  assert.deepEqual(labels.map(label => Number(label.split('/')[1])), [wrongPrefixes[index], prefix, wrongPrefixes[index], prefix]);
  const alternativeMask = ((1n << BigInt(wrongPrefixes[index])) - 1n) << BigInt(32 - wrongPrefixes[index]);
  const wrongNetwork = index === 0 ? ipv4('10.1.2.132') : ip & alternativeMask;
  assert.notEqual(wrongNetwork, network);
  assert.deepEqual(labels.map(label => ipv4(label.split('/')[0])), [wrongNetwork, wrongNetwork, network, network]);
  assert.deepEqual(labels.flatMap((label, i) => {
    const [address, bits] = label.split('/');
    return ipv4(address) === network && Number(bits) === prefix ? [i] : [];
  }), [body.correctIndex]);
  assert.ok(body.explanation.includes(labels[body.correctIndex!]));
}

function checkEncryption(body: GeneratedBody, index: number) {
  const prompt = text(body.prompt.filter(block => block.type === 'paragraph'));
  const route = /([AB])さんから([AB])さんへ/.exec(prompt);
  assert.ok(route);
  const [, sender, recipient] = route;
  assert.notEqual(sender, recipient);
  const senderMessage = ['来月転居する予定です。', '受取日は来週です。', '集合場所を変更します。', '資料を金曜に渡します。'][index];
  const { alt, markup } = figure(body);
  assert.ok(alt.includes(sender + 'さんは「' + senderMessage));
  assert.ok(alt.includes(recipient + 'さんは同じ暗号文を受信し，自分の秘密鍵'));
  assert.ok(markup.includes(recipient + 'さんの秘密鍵</text>'));
  const candidates = body.choices.map(text);
  const meanings = candidates.map(candidate => /([AB])さんの(公開|秘密)鍵/.exec(candidate));
  assert.deepEqual(meanings.map(match => match?.slice(1) ?? null), [['A', '公開'], ['A', '秘密'], ['B', '公開'], null]);
  assert.deepEqual(meanings.flatMap((match, i) => match?.[1] === recipient && match[2] === '公開' ? [i] : []), [body.correctIndex]);
}

function checkAccess(body: GeneratedBody, index: number) {
  const list = body.prompt.find(block => block.type === 'list');
  assert.ok(list);
  assert.deepEqual(list.items.map(item => item.split('：')[0]), ['参照権限', '更新権限', '管理者権限']);
  assert.match(list.items[0], /レコードの参照が可能/);
  assert.match(list.items[1], /レコードの登録，変更，削除が可能/);
  assert.match(list.items[2], /テーブルの参照，登録，変更，削除が可能/);
  const prompt = text(body.prompt.filter(block => block.type === 'paragraph'));
  const cases = [
    { cue: '検索結果を表示', operations: ['record-read'] },
    { cue: 'レコードの内容を変更', operations: ['record-read', 'record-edit'] },
    { cue: '新しいレコードを登録するだけ', operations: ['record-insert'] },
    { cue: '新しいテーブルを作成', operations: ['table-create', 'table-drop'] },
  ];
  const requirements = cases[index];
  assert.ok(prompt.includes(requirements.cue));
  const allowed: Record<string, string[]> = {
    参照権限: ['record-read'],
    更新権限: ['record-edit', 'record-insert', 'record-delete'],
    管理者権限: ['table-create', 'table-drop', 'table-read', 'table-edit'],
  };
  const candidates = body.choices.map(blocks => text(blocks).split('と').flatMap(privilege => allowed[privilege]));
  const fits = candidates.map((capabilities, choice) => ({ capabilities, choice }))
    .filter(({ capabilities }) => requirements.operations.every(action => capabilities.includes(action)))
    .sort((a, b) => a.capabilities.length - b.capabilities.length);
  assert.ok(fits.length > 0 && (fits.length === 1 || fits[0].capabilities.length < fits[1].capabilities.length));
  assert.equal(fits[0].choice, body.correctIndex);
}

const packetInputs = [
  ['PC', 'Webサーバ', 80, 1024, 65535],
  ['PC', 'HTTPSサーバ', 443, 49152, 65535],
  ['監視端末', '監視サーバ', 8080, 32768, 60999],
  ['端末', '認証サーバ', 8443, 55000, 55999],
] as const;
function checkFirewall(body: GeneratedBody, index: number) {
  const [client, server, servicePort, lower, upper] = packetInputs[index];
  const prompt = text(body.prompt);
  assert.ok(prompt.includes(client) && prompt.includes(server) && prompt.includes('ポート番号' + servicePort));
  if (index > 0) assert.ok(prompt.includes(lower + '〜' + upper));
  const permits = (port: number, rule: string) => {
    if (rule.endsWith('以上')) return port >= Number(rule.slice(0, -2));
    if (rule.includes('〜')) {
      const [from, to] = rule.split('〜').map(Number);
      return port >= from && port <= to;
    }
    return port === Number(rule);
  };
  const outcomes = body.choices.map(blocks => {
    const { columns, rows } = table(blocks);
    assert.deepEqual(columns, ['方向', '送信元', 'あて先', '送信元ポート番号', 'あて先ポート番号']);
    assert.deepEqual(rows.map(row => row[0]), ['発信', '応答']);
    const packets = [lower, upper].map(ephemeral => [
      ['発信', client, server, ephemeral, servicePort],
      ['応答', server, client, servicePort, ephemeral],
    ] as const).flat();
    const authorize = ([direction, from, to, fromPort, toPort]: (typeof packets)[number]) => rows.some(row =>
      row[0] === direction && row[1] === from && row[2] === to && permits(fromPort, row[3]) && permits(toPort, row[4]));
    return packets.map(authorize);
  });
  assert.deepEqual(outcomes, [
    [false, false, false, false], [true, true, true, true],
    [false, false, false, false], [false, false, false, false],
  ]);
  assert.deepEqual(outcomes.flatMap((decisions, i) => decisions.every(Boolean) ? [i] : []), [body.correctIndex]);
}

const waterfallFacts = [
  ['調査・分析', '機能を定義する', 'プログラムに分割', '構造設計を行う', '詳細な処理手順', 'テストを行う'],
  ['要求を定義', '機能を定義', 'プログラムに分け', '内部構造', 'コードにする', 'テストする'],
  ['求める事項を定義', '機能を定義', 'プログラムに分割', '構造を設計', '実装する', 'テストする'],
  ['要求を定義', '必要な機能を定義', 'プログラムに分割', '内部構造', 'コーディング', 'テストする'],
];
function checkWaterfall(body: GeneratedBody, index: number) {
  const list = body.prompt.find(block => block.type === 'list');
  assert.ok(list);
  assert.deepEqual(list.items.map(item => item[0]), Array.from('abcdef'));
  const tasks = waterfallFacts[index].map(evidence => {
    const matches = list.items.filter(item => item.includes(evidence));
    assert.equal(matches.length, 1, evidence);
    return matches[0][0];
  });
  const options = body.choices.map(text).map(option => option.split(', '));
  assert.deepEqual(options, [
    [tasks[0], tasks[2], tasks[1], tasks[4], tasks[3], tasks[5]],
    tasks,
    [tasks[0], tasks[1], tasks[2], tasks[3], tasks[5], tasks[4]],
    [tasks[0], tasks[1], tasks[3], tasks[2], tasks[4], tasks[5]],
  ]);
  assert.deepEqual(options[body.correctIndex!], tasks);
}

const projectFacts = [
  { days: [3, 6, 8, 6, 5, 14, 11, 15, 5], options: [27, 28, 29, 31] },
  { days: [4, 6, 7, 5, 4, 17, 10, 14, 6], options: [26, 28, 30, 32] },
  { days: [3, 4, 8, 6, 7, 13, 10, 15, 5], options: [26, 27, 29, 31] },
  { days: [5, 7, 6, 7, 4, 11, 10, 16, 4], options: [26, 29, 32, 33] },
];
const projectEdges = [
  [0, 1, 'A'], [1, 2, 'B'], [2, 3, 'C'], [3, 4, 'D'], [1, 6, 'E'],
  [1, 3, 'F'], [2, 7, 'G'], [2, 4, 'H'], [4, 5, 'I'], [6, 2, ''], [7, 3, ''],
] as const;
function checkProject(body: GeneratedBody, index: number) {
  const { days, options } = projectFacts[index];
  const { alt, markup } = figure(body);
  const elapsed = new Map(days.map((duration, i) => [String.fromCharCode(65 + i), duration]));
  function paths(from: number): number[] {
    if (from === 5) return [0];
    return projectEdges.filter(edge => edge[0] === from)
      .flatMap(([, to, work]) => paths(to).map(remainder => remainder + (elapsed.get(work) ?? 0)));
  }
  const totals = paths(0);
  const duration = Math.max(...totals);
  const actual = body.choices.map(text).map(Number);
  assert.deepEqual(actual, options);
  assert.ok(actual.every(value => totals.includes(value)));
  assert.deepEqual(actual.flatMap((value, i) => value === duration ? [i] : []), [body.correctIndex]);
  for (const [work, day] of elapsed) {
    assert.match(alt, new RegExp(work + 'は[^，。]*' + day + '日'));
    assert.match(markup, new RegExp('data-work="' + work + '"[^]*?<text[^>]*>' + work + '</text><text[^>]*>' + day + '</text>'));
  }
  assert.match(markup, /stroke-dasharray="5 4"/);
  assert.match(markup, /開始<\/text>/);
  assert.match(markup, /終了<\/text>/);
  assert.match(markup, /作業日数/);
  assert.match(markup, /ダミー作業/);
  assert.ok(body.explanation.endsWith(duration + '日となる。'));
}

function checkEffort(body: GeneratedBody) {
  const match = /ところ(\d+)人月.*投入工数は(\d+)人月.*全体の(\d+)割/.exec(text(body.prompt));
  assert.ok(match);
  const [budget, spent, completion] = match.slice(1).map(Number);
  // Search whole person-months for the first completion at the stated rate.
  const complete = Array.from({ length: 1_000 }, (_, n) => n).find(n => n * completion >= spent * 10);
  assert.ok(complete !== undefined && complete * completion === spent * 10);
  const needed = complete - budget;
  const alternatives = new Set([needed, budget - spent, budget - budget * completion / 10, complete - spent]);
  const choices = body.choices.map(text).map(Number);
  assert.deepEqual(new Set(choices), alternatives);
  assert.equal(choices[body.correctIndex!], needed);
  assert.deepEqual(choices, [...choices].sort((a, b) => a - b));
  assert.ok(body.explanation.endsWith(needed + '人月である。'));
}

const calculations: Record<number, (body: GeneratedBody, index: number) => void> = {
  30: checkAudio, 33: checkSql, 36: checkMac, 39: checkSubnet, 42: checkEncryption, 43: checkAccess,
  44: checkFirewall, 49: checkWaterfall, 51: checkProject, 52: checkEffort,
};

test('2009秋午前 問27〜53は公式番号・正答・作図定義と一対一で対応する', () => {
  assert.equal(legacy2009AutumnAm27To53Definitions.length, 27);
  assert.deepEqual(legacy2009AutumnAm27To53Definitions.map(definition => definition.source),
    Array.from({ length: 27 }, (_, i) => '2009h21a-fe-am-' + (i + 27)));
  assert.equal(legacy2009AutumnAm27To53Definitions.map(definition => definition.sourceAnswer).join(''), officialAnswers);
  assert.deepEqual(legacy2009AutumnAm2753Figures.map(definition => definition.profile),
    legacy2009AutumnAm2753FigureRenderers.map(renderer => renderer.profile));
  for (const definition of legacy2009AutumnAm2753Figures) {
    assert.deepEqual(definition.domain, [[0, 3]]);
    for (const invalid of [[], [4], [-1], [0.5], [1, 1]]) assert.throws(() => definition.validate(invalid));
  }
});

for (const definition of legacy2009AutumnAm27To53Definitions) {
  const number = Number(definition.source.split('-').at(-1));
  test('2009秋午前 問' + number + ' 公式原形式と全4条件の内容・正答を独立検証', () => {
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(field => [field.minimum, field.maximum]), [[0, 3]]);
    for (const invalid of [[], [4], [-1], [0.5], [1, 1]]) assert.throws(() => definition.build(invalid));
    const reference = definition.build(definition.reference);
    assert.equal('アイウエ'[reference.correctIndex!], officialAnswers[number - 27]);
    assert.equal(text(reference.prompt.slice(0, 1)), officialSource[number].prompt);
    assert.deepEqual(reference.choices.map(sourceChoice), officialSource[number].choices);
    const prompts = new Set<string>();
    const answers = new Set<number>();
    for (let condition = 0; condition < 4; condition++) {
      const body = definition.build([condition]);
      assert.equal(body.choices.length, 4);
      assert.equal(new Set(body.choices.map(sourceChoice)).size, 4);
      assert.ok(body.explanation.length > 20);
      assert.equal(body.correctIndex !== undefined && body.correctIndex >= 0 && body.correctIndex < 4, true);
      prompts.add(JSON.stringify(body.prompt));
      answers.add(body.correctIndex!);
      if (calculations[number]) calculations[number](body, condition);
      else checkKnowledge(body, number, condition);
    }
    assert.equal(prompts.size, 4);
    if (definition.answerVariation === 'fixed') assert.equal(answers.size, 1);
    else assert.ok(answers.size > 1);
  });
}
