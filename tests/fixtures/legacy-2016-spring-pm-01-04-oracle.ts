import assert from 'node:assert/strict';
import type { GeneratedBody } from '../../src/core/generators/definition';
import type { Block } from '../../src/core/types';

export function bodyText(block: Block): string {
  if ('text' in block) return block.text;
  if (block.type === 'table') return [block.caption, ...block.columns, ...block.rows.flat()].join('\n');
  return block.type === 'diagram' ? block.alt : block.type === 'image' ? block.caption : block.items.join('\n');
}

export function answerChoices(body: GeneratedBody, partId: string) {
  const part = body.answerParts?.find(item => item.id === 'part-' + partId);
  const answer = body.partAnswers?.find(item => item.kind === 'choice' && item.partId === part?.id);
  assert(part && answer?.kind === 'choice');
  return {
    blocks: part.choiceIds.map(id => {
      const index = Number(id.replace('choice-value-', '')) - 1;
      assert.equal(id, 'choice-value-' + (index + 1));
      return body.choices[index];
    }),
    correct: part.choiceIds.indexOf(answer.choiceId),
  };
}

export function uniqueChoice(body: GeneratedBody, partId: string, truths: readonly boolean[]) {
  const { blocks, correct } = answerChoices(body, partId);
  assert.equal(blocks.length, truths.length);
  assert.deepEqual(truths.flatMap((value, index) => value ? [index] : []), [correct], '解答欄 ' + partId);
}

export function textChoices(body: GeneratedBody, partId: string) {
  return answerChoices(body, partId).blocks.map(blocks => blocks.map(bodyText).join('\n'));
}

function integerExpression(expression: string): bigint {
  const mul = /^([0-9]+)×([0-9]+)$/.exec(expression);
  if (mul) return BigInt(mul[1]) * BigInt(mul[2]);
  const pow = /^([0-9]+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/.exec(expression);
  if (pow) return BigInt(pow[1]) ** BigInt([...pow[2]].map(digit => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(digit)).join(''));
  assert.match(expression, /^[0-9]+$/);
  return BigInt(expression);
}

function countsOfStrings(alphabet: number, length: number): bigint {
  let count = 1n;
  for (let position = 0; position < length; position++) count *= BigInt(alphabet);
  return count;
}

// The two security checklists are ordered by the four original options,
// reviewed against their complete wording and the requirements in PDF p.7.
const keyChecklist = [
  [/TLSの使用を直ちに中止/, false, false],
  [/新たな秘密鍵と公開鍵を生成.*証明書の発行手続/, true, true],
  [/証明書の再発行手続.*同じ秘密鍵/, true, false],
  [/再発行は行わず.*保管場所/, true, false],
] as const;
const portChecklist = [
  [/HTTPのポートを開放/, ['Telnet', 'SSH', 'HTTP']],
  [/インターネットからのアクセスをFWで禁止.*TelnetやSSHのポートは閉じる/, []],
  [/TelnetやSSHのポートの開放は継続/, ['Telnet', 'SSH']],
  [/Telnetのポートは閉じ，SSHに限定してポートを開放/, ['SSH']],
] as const;
const expectedQ1 = [
  [6, 8, false], [5, 9, true], [7, 10, false], [8, 11, true],
] as const;

export function verifyIncident(body: GeneratedBody, index: number) {
  const tables = body.prompt.filter(block => block.type === 'table');
  assert.equal(tables.length, 2);
  const [{ rows: damage }, { rows: strength }] = tables;
  const visible = body.prompt.map(bodyText).join('\n');
  assert.match(visible, /リモートメンテナンスの必要性はなくなっている/);
  assert.match(damage[0][0], /秘密鍵への不正アクセスがあったかは確認できなかった/);
  assert.match(visible, /管理者IDと管理者パスワードを使ってWebサーバに不正侵入/);
  uniqueChoice(body, 'a', textChoices(body, 'a').map((option, k) => {
    const [text, encrypted, independentKey] = keyChecklist[k];
    assert.match(option, text);
    return encrypted && independentKey;
  }));
  uniqueChoice(body, 'b', textChoices(body, 'b').map((option, k) => {
    const [text, externalServices] = portChecklist[k];
    assert.match(option, text);
    return externalServices.length === 0;
  }));
  const complete = damage[2][0].includes('それ以外の会員情報は漏えいしていないことを確認した');
  const [oldLength, newLength, expectedComplete] = expectedQ1[index];
  assert.equal(complete, expectedComplete);
  const confirmed = new Set([1, 2]), members = [1, 2, 3, 4];
  const potentiallyLeaked = members.filter(id => !complete || confirmed.has(id));
  uniqueChoice(body, 'c', textChoices(body, 'c').map(option => {
    assert.match(option, /管理者パスワードは(?:変更し|そのままにし)，(?:全会員|漏えいした会員だけ)にパスワードの変更を依頼する。/);
    const requested = option.includes('全会員') ? members : [...confirmed];
    return option.includes('管理者パスワードは変更し') &&
      JSON.stringify(requested) === JSON.stringify(potentiallyLeaked);
  }));
  const lengths = strength.map(([description]) => Number(/(\d+)文字/.exec(description)?.[1]));
  assert.deepEqual(lengths, [oldLength, newLength, newLength, newLength]);
  assert.match(strength[0][0], /英小文字/);
  assert.match(strength[1][0], /英小文字/);
  assert.match(strength[2][0], /英大文字・英小文字/);
  const [before, longer, bothCases] = [26, 26, 52].map((alphabet, k) => countsOfStrings(alphabet, lengths[k]));
  for (const [part, left, right] of [['d', before, longer], ['e', longer, bothCases]] as const) {
    const candidates = textChoices(body, part).map(integerExpression);
    assert.equal(new Set(candidates).size, 6);
    uniqueChoice(body, part, candidates.map(multiplier => multiplier * left === right));
  }
  assert(body.explanation.includes('＝' + textChoices(body, 'd')[5] + ' 倍'));
  assert(body.explanation.includes('＝' + textChoices(body, 'e')[4] + ' 倍'));
}

export function verifyGcCounts(body: GeneratedBody) {
  const models: Record<string, (live: number, total: number) => number> = {
    L: live => live, 'L−M': (live, total) => live - total, M: (_live, total) => total,
    'M＋L': (live, total) => total + live, 'M−L': (live, total) => total - live,
  };
  const actual = [0, 1, 2].map(() => [] as number[]);
  const inputs = Array.from({ length: 24 }, (_, k) => k + 1)
    .flatMap(total => Array.from({ length: total + 1 }, (_, live) => ({ live, total })));
  for (const { live, total } of inputs) {
    const allCells = Array.from({ length: total }, (_, cell) => ({ reachable: cell < live, marked: false }));
    let scanned = 0, marked = 0, returned = 0;
    for (const cell of allCells.filter(cell => cell.reachable)) {
      cell.marked = true;
      marked++;
    }
    for (const cell of allCells) {
      scanned++;
      if (!cell.marked) returned++;
    }
    actual[0].push(marked);
    actual[1].push(scanned);
    actual[2].push(returned);
  }
  for (const [partIndex, part] of ['a', 'b', 'c'].entries()) {
    uniqueChoice(body, part, textChoices(body, part).map(option => {
      assert(option in models);
      return inputs.every(({ live, total }, n) => models[option](live, total) === actual[partIndex][n]);
    }));
  }
  const stateAssertions = [
    [/供給源の管理下/, false], [/プログラムが使用中/, true],
    [/LIVEリストから切り離された/, false], [/スイープで，供給源に返却/, false],
  ] as const;
  uniqueChoice(body, 'q2', textChoices(body, 'q2').map((option, k) => {
    assert.match(option, stateAssertions[k][0]);
    return stateAssertions[k][1];
  }));
}

export function verifyDatabase(
  body: GeneratedBody,
  index: number,
  db: import('node:sqlite').DatabaseSync,
) {
  const obtainable = [
    ['アトラクションの待ち時間', []],
    ['休園日', []],
    ['入園者数', ['入園者番号']],
    ['入園者のアトラクション利用状況', ['入園者番号', '利用時刻', 'アトラクション番号']],
    ['入園者の滞在時間', ['入園時刻', '退園時刻']],
  ] as const;
  const before = new Set(['入園者番号', '券種', '入園日', '入園時刻']);
  const additions = [new Set(['退園時刻']), new Set(['利用時刻', 'アトラクション番号'])];
  for (const [k, part] of ['a', 'b'].entries()) {
    uniqueChoice(body, part, textChoices(body, part).map((option, choice) => {
      const [name, requires] = obtainable[choice];
      assert.equal(option, name);
      return requires.some(column => !before.has(column)) &&
        requires.every(column => before.has(column) || additions[k].has(column));
    }));
  }
  const queries = body.prompt
    .filter(block => block.type === 'code' && block.language === 'sql' && block.text.startsWith('SELECT'))
    .map(block => block.type === 'code' ? block.text : '');
  assert.equal(queries.length, 3);
  const threshold = [2000, 2400, 1800, 3000][index], year = [2016, 2015, 2014, 2013][index];
  const cutoff = String(year) + '0101';
  assert(body.prompt.map(bodyText).join('\n').includes(threshold.toLocaleString('en-US') + '円以上'));
  assert(queries[2].endsWith("'" + cutoff + "'"));
  assert.match(body.explanation, new RegExp(threshold + '円以上'));
  assert.match(body.explanation, new RegExp(year + '年1月1日'));
  db.exec(`
    CREATE TABLE 入園者表(入園者番号 INTEGER PRIMARY KEY, 会員番号 INTEGER, 券種 TEXT, 入園日 TEXT);
    CREATE TABLE 利用表(入園者番号 INTEGER NOT NULL, 利用時刻 INTEGER NOT NULL, アトラクション番号 INTEGER,
      PRIMARY KEY(入園者番号, 利用時刻));
    CREATE TABLE アトラクション表(アトラクション番号 INTEGER PRIMARY KEY, アトラクション名 TEXT, 料金 INTEGER);
    CREATE TABLE 会員表(会員番号 INTEGER PRIMARY KEY, 氏名 TEXT);
  `);
  const visitors = [
    [101, 1, '01', String(year - 1) + '1231'],
    [102, 2, '01', cutoff],
    [103, 3, '01', String(year - 1) + '1230'],
    [104, 3, '02', String(year) + '0111'],
    [105, 4, '01', String(year) + '0120'],
    [106, 4, '01', String(year) + '0210'],
    [107, null, '01', cutoff],
    [108, 5, '01', String(year - 2) + '1120'],
  ] as const;
  const rides = [
    [4, 'リフト', threshold / 2], [5, '観覧車', threshold - 1],
    [6, '急流', threshold + 500], [9, '未利用', 650],
  ] as const;
  const uses = [
    [101, 900, 4], [101, 920, 4], [102, 930, 6], [103, 910, 5],
    [104, 905, 6], [104, 920, 4], [105, 990, 5], [107, 905, 4],
  ] as const;
  const insertVisitor = db.prepare('INSERT INTO 入園者表 VALUES (?, ?, ?, ?)');
  const insertRide = db.prepare('INSERT INTO アトラクション表 VALUES (?, ?, ?)');
  const insertUse = db.prepare('INSERT INTO 利用表 VALUES (?, ?, ?)');
  const insertMember = db.prepare('INSERT INTO 会員表 VALUES (?, ?)');
  for (const row of visitors) insertVisitor.run(...row);
  for (const row of rides) insertRide.run(...row);
  for (const row of uses) insertUse.run(...row);
  for (const member of [1, 2, 3, 4, 5]) insertMember.run(member, 'member' + member);
  assert.throws(() => insertUse.run(101, 900, 5));
  assert.throws(() => insertUse.run(null, 900, 5));

  const rows = (sql: string) => db.prepare(sql).all().map(row => Object.values(row));
  const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  const expectedCounts = rides.flatMap(([id, name]) => {
    const count = uses.filter(use => use[2] === id).length;
    return count ? [[id, name, count]] : [];
  });
  uniqueChoice(body, 'c', textChoices(body, 'c').map(option =>
    equal(rows(queries[0].replace('［c］', option) + ' ORDER BY 利用表.アトラクション番号'), expectedCounts)));
  const expectedAmounts = visitors.flatMap(([id, , ticket]) => {
    const amount = uses.filter(use => use[0] === id)
      .reduce((sum, use) => sum + rides.find(ride => ride[0] === use[2])![2], 0);
    return ticket === '01' && amount >= threshold ? [[id, amount]] : [];
  }).sort((a, b) => b[1] - a[1]);
  assert.deepEqual(expectedAmounts, [[102, threshold + 500], [101, threshold]]);
  uniqueChoice(body, 'd', textChoices(body, 'd').map(option =>
    equal(rows(queries[1].replace('［d］', option)), expectedAmounts)));

  const dateCandidates = [
    [(year - 1) + '年以前に1回も入園していない会員', (before: number) => before === 0],
    [year + '年以降に1回以上，入園した会員', (_before: number, after: number) => after >= 1],
    [year + '年以降に1回だけ，入園した会員', (_before: number, after: number) => after === 1],
    [year + '年以降に1回も入園していない会員', (_before: number, after: number) => after === 0],
  ] as const;
  const results = rows(queries[2] + ' ORDER BY 会員表.会員番号');
  uniqueChoice(body, 'q4', textChoices(body, 'q4').map((option, choice) => {
    const [text, criterion] = dateCandidates[choice];
    assert.equal(option, text);
    const expected = [1, 2, 3, 4, 5].flatMap(member => {
      const dates = visitors.filter(visitor => visitor[1] === member).map(visitor => visitor[3]);
      const beforeCutoff = dates.filter(date => date < cutoff).length;
      return criterion(beforeCutoff, dates.length - beforeCutoff) ? [[member, 'member' + member]] : [];
    });
    return equal(results, expected);
  }));
}

export function verifyEthernet(body: GeneratedBody, markup: string, index: number) {
  const placement = new Map([
    ['宛先として格納', 'header-dst'], ['送信元として格納', 'header-src'], ['データ部に格納', 'payload'],
    ['プリアンブルに格納', 'sync'], ['ヘッダ部に格納', 'header'],
  ]);
  const arpTransport = new Map([
    ['TCPセグメントとして送信', 'tcp'], ['UDPデータグラムとして送信', 'udp'],
    ['ブロードキャスト', 'all local hosts'], ['ホストBのMACアドレス宛てに送信', 'known-b'],
    ['ユニキャスト', 'known-single'],
  ]);
  uniqueChoice(body, 'a', textChoices(body, 'a').map(option => {
    assert(placement.has(option));
    return placement.get(option) === 'payload';
  }));
  const bitWidth = Number(/MACアドレスの長さは(\d+)ビット/.exec(body.prompt.map(bodyText).join('\n'))?.[1]);
  assert.equal(bitWidth, 48);
  let addresses = 1n;
  for (let octet = 0; octet < bitWidth / 8; octet++) addresses *= 256n;
  uniqueChoice(body, 'b', textChoices(body, 'b').map(option => integerExpression(option) === addresses));
  uniqueChoice(body, 'c', textChoices(body, 'c').map(option => {
    assert(arpTransport.has(option));
    return arpTransport.get(option) === 'all local hosts';
  }));
  const devices = new Map([...markup.matchAll(/data-device="([^"]+)" data-subnet="([01])"/g)]
    .map(([, name, subnet]) => [name, Number(subnet)]));
  assert.deepEqual([...devices.keys()].sort(), ['ブリッジC', 'ホストD', 'ホストE', 'ホストF', 'ルータG', 'ルータH']);
  const source = 'ホスト' + ['D', 'E', 'D', 'E'][index];
  const near = index < 2 ? 0 : 1;
  assert.equal(devices.get(source), near);
  assert.equal(devices.get('ホストF'), 1 - near);
  assert.equal(devices.get('ブリッジC'), near);
  assert.equal(devices.get('ルータG'), 0);
  assert.equal(devices.get('ルータH'), 1);
  const destinations = body.prompt.flatMap(block => {
    const query = /^(ホスト[DEF])に対してIPデータグラムを送信しようとするとき，(ホスト[DEF])は［([de])］のIPアドレス/.exec(bodyText(block));
    return query ? [{ target: query[1], sender: query[2], part: query[3] }] : [];
  });
  assert.equal(destinations.length, 2);
  assert.deepEqual(destinations.map(query => query.target), ['ホスト' + (source.endsWith('D') ? 'E' : 'D'), 'ホストF']);
  for (const { target, sender, part } of destinations) {
    assert.equal(sender, source);
    const originSubnet = devices.get(sender);
    const local = originSubnet === devices.get(target);
    uniqueChoice(body, part, textChoices(body, part).map(option => {
      assert(devices.has(option));
      return local ? option === target : option.startsWith('ルータ') && devices.get(option) === originSubnet;
    }));
  }
}
