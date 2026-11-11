import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { autumn2012Pm01To04Specs as specs } from '../../../scripts/legacy-2012-autumn-pm-01-04-specs';
import { displayedAnswerParts, gradeAnswer, validateAnswerDefinition } from '../../../src/core/answers';
import { legacy2012AutumnPm0104Figures as figures, profiles } from '../../../src/core/generators/legacy-2012-autumn-pm-01-04-figures';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import type { Block, Question } from '../../../src/core/types';
import { legacy2012AutumnPm0104FigureRenderers as renderers } from '../../../src/ui/Legacy2012AutumnPm0104Figures';
import review from '../../fixtures/legacy-2012-autumn-pm-01-04-review.json';

const variants = [0, 1, 2, 3];
const marks = 'アイウエオカキクケコ';
type Diagram = Extract<Block, { type: 'diagram' }>;
type Figure = Diagram & { scene: Extract<Diagram['scene'], { kind: 'source_figure' }> };
const text = (body: GeneratedBody) => body.prompt.flatMap(block => 'text' in block ? [block.text] : []).join('\n');

function diagram(body: GeneratedBody, profile: string, group?: number) {
  const block = body.prompt.find((item): item is Figure => item.type === 'diagram' && item.scene.kind === 'source_figure' &&
    item.scene.profile === profile && (group === undefined || item.scene.values[1] === group));
  assert(block, profile);
  return block;
}
function choices(body: GeneratedBody, part: number) {
  return body.answerParts![part].choiceIds.map(id => {
    const item = body.choices[Number(id.slice('choice-value-'.length)) - 1];
    assert.equal(item.length, 1);
    return item[0];
  });
}
function options(body: GeneratedBody, part: number) {
  return choices(body, part).map(item => {
    assert(item.type === 'paragraph' || item.type === 'code');
    return item.text;
  });
}
function keys(body: GeneratedBody, part: number) {
  const field = body.answerParts![part], answer = body.partAnswers!.find(key =>
    key.kind === 'unordered' ? key.partIds.includes(field.id) : key.partId === field.id);
  assert(answer && answer.kind !== 'no_correct_answer');
  const ids = answer.kind === 'unordered' ? answer.choiceIds : [answer.choiceId];
  return ids.map(id => field.choiceIds.indexOf(id)).sort((a, b) => a - b);
}
function expectUnique(body: GeneratedBody, part: number, truth: (option: string) => boolean) {
  const shown = options(body, part);
  assert.equal(new Set(shown).size, shown.length);
  assert.deepEqual(shown.flatMap((item, i) => truth(item) ? [i] : []), keys(body, part));
}
function question(body: GeneratedBody) {
  return {
    choices: body.choices.map((blocks, index) => ({ id: 'choice-value-' + (index + 1), content: { blocks } })),
    answerParts: body.answerParts, correctAnswer: { parts: body.partAnswers },
  } as Question;
}

test('2012秋期旧午後問1〜4の全条件で、公式解答の並び、空欄、候補数、問番号、資料頁を照合する', () => {
  for (const [index, spec] of specs.entries()) {
    const source = review.questions[index];
    assert.equal(spec.number, source.number);
    assert.equal(spec.definition.source, review.booklet + '-' + spec.number);
    assert.deepEqual(spec.pages, source.pages);
    assert.deepEqual(spec.definition.reference, [0]);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), source.pages);
    assert(Object.values(spec.originalPageAlt).every(alt => alt.length > 100));
    const shape = (body: GeneratedBody) => body.prompt.map(block =>
      block.type === 'diagram' && block.scene.kind === 'source_figure' ? block.scene.profile : block.type);
    const output = variants.map(variant => {
      const body = spec.definition.build([variant]);
      assert.deepEqual(shape(body), shape(spec.original));
      assert.deepEqual(body.answerParts!.map(part => part.label), source.labels);
      assert.deepEqual(body.answerParts!.map(part => part.choiceIds.length), source.counts);
      assert(body.explanation.length > 100);
      validateAnswerDefinition(question(body));
      if (variant === 0) {
        assert.deepEqual(body, spec.original);
        const fieldMarks = body.partAnswers!.map(answer => {
          assert(answer.kind !== 'no_correct_answer');
          const id = answer.kind === 'unordered' ? answer.partIds[0] : answer.partId;
          const field = body.answerParts!.findIndex(item => item.id === id);
          return keys(body, field).map(i => marks[i]).join('');
        });
        assert.deepEqual(fieldMarks, source.marks);
      }
      return [text(body), JSON.stringify(body.partAnswers)] as const;
    });
    assert.equal(new Set(output.map(([input]) => input)).size, 4);
    assert(new Set(output.map(([, answer]) => answer)).size >= 2);
    for (const invalid of [[], [4], [-1], [0.5], [NaN], [0, 1], new Array<number>(1)])
      assert.throws(() => spec.definition.build(invalid), /PARAMETER_CONSTRAINT/);
  }
  const original = specs.map(spec => question(spec.original));
  assert.equal(original.reduce((sum, q) => sum + displayedAnswerParts(q).length, 0), 21);
  assert.equal(original.reduce((sum, q) => sum + q.answerParts!.length, 0), 23);
});

function interleave(initial: number, deltas: [number, number]) {
  const finals = new Set<number>();
  function visit(next: [number, number], local: [number, number], shared: number) {
    if (next[0] === 3 && next[1] === 3) { finals.add(shared); return; }
    for (const i of [0, 1] as const) {
      if (next[i] === 3) continue;
      const counters: [number, number] = [...next], copies: [number, number] = [...local];
      const op = counters[i]++;
      if (op === 0) copies[i] = shared;
      if (op === 1) copies[i] += deltas[i];
      visit(counters, copies, op === 2 ? copies[i] : shared);
    }
  }
  visit([0, 0], [0, 0], initial);
  return finals;
}
type LockAction = { resource: number; acquire: boolean };
function actions(value: string) {
  return [...value.matchAll(/y([12])の(確保|解放)/g)].map(match => ({ resource: +match[1] - 1, acquire: match[2] === '確保' }));
}
function deadlockExists(plans: [LockAction[], LockAction[]]) {
  function visit(next: [number, number], owners: [number, number]): boolean {
    if (next.every((i, p) => i === plans[p].length)) return false;
    let movable = false;
    for (const i of [0, 1] as const) {
      const action = plans[i][next[i]];
      if (!action || (action.acquire ? owners[action.resource] !== -1 : owners[action.resource] !== i)) continue;
      movable = true;
      const following: [number, number] = [...next], locks: [number, number] = [...owners];
      following[i]++;
      locks[action.resource] = action.acquire ? i : -1;
      if (visit(following, locks)) return true;
    }
    return !movable;
  }
  return visit([0, 0], [-1, -1]);
}

test('問1の全共有値・更新幅、取得／解放状態、二資源の全スケジュールを独立に検算する', () => {
  const transitions = [
    [/^sの状態が解放状態ならば確保状態にし，確保状態ならば解放状態になるまで待ってから確保状態にする$/, 'take,wait-take'],
    [/^sの状態が解放状態ならば確保状態にし，確保状態ならば何もしない$/, 'take,unchanged'],
    [/^sの状態が解放状態ならば確保状態になるまで待ち，確保状態ならば解放状態になるまで待つ$/, 'wait,wait'],
    [/^sの状態が解放状態ならば確保状態になるまで待ち，確保状態ならば何もしない$/, 'wait,unchanged'],
    [/^sの状態が確保状態ならば解放状態にし，解放状態ならば何もしない$/, 'unchanged,release'],
    [/^sの状態が確保状態ならば解放状態になるまで待ち，解放状態ならば何もしない$/, 'unchanged,wait'],
  ] as const;
  for (const variant of variants) {
    const body = specs[0].definition.build([variant]), visible = text(body);
    const add = +/p1：yの値を(\d+)だけ増加/.exec(visible)![1];
    const subtract = +/p2：yの値を(\d+)だけ減少/.exec(visible)![1];
    const initial = +/実行前の共有データyの値が(\d+)/.exec(visible)![1];
    const results = interleave(initial, [add, -subtract]);
    assert.equal(results.size, 3);
    assert.match(visible, /CPUが一つ[\s\S]*排他制御をしない[\s\S]*1回だけ/);
    assert.match(visible, /状態を調べて，変更する処理[\s\S]*中断のない処理[\s\S]*CPUは別のプロセス/);
    const values = options(body, 0).map(Number);
    assert.deepEqual(values, [...values].sort((a, b) => a - b));
    assert(values.every((value, i) => i === 0 || value - values[i - 1] <= 2));
    expectUnique(body, 0, value => !results.has(Number(value)));
    for (const [part, target] of [[1, 'take,wait-take'], [2, 'unchanged,release']] as const) {
      expectUnique(body, part, option => {
        const transition = transitions.find(([pattern]) => pattern.test(option));
        assert(transition, option);
        return transition[1] === target;
      });
    }
    const p1 = actions(/プロセスp1が，(.+?)の順序/.exec(visible)![1]);
    assert.equal(p1.length, 4);
    expectUnique(body, 3, option => {
      const p2 = actions(option); assert.equal(p2.length, 4);
      return deadlockExists([p1, p2]);
    });
    for (const value of results) assert(body.explanation.includes(String(value)));
    assert.match(body.explanation, /循環待ち/);
  }
});

function purchaseReference(product: string, category: string, minimum: number) {
  const db = new DatabaseSync(':memory:');
  db.exec(`CREATE TABLE 発注表(発注コード TEXT PRIMARY KEY, 取引先コード TEXT);
    CREATE TABLE 商品表(商品コード TEXT PRIMARY KEY, 品目コード TEXT, 商品名 TEXT UNIQUE, 定価 INTEGER);
    CREATE TABLE 品目表(品目コード TEXT PRIMARY KEY, 品目名 TEXT);
    CREATE TABLE 明細表(発注コード TEXT, 商品コード TEXT, 数量 INTEGER, 購入額 INTEGER, PRIMARY KEY(発注コード, 商品コード));`);
  const items = [{ code: 'P0001', category: 'S1', name: product, listPrice: 57 },
    { code: 'P0002', category: 'S1', name: '別商品', listPrice: 151 }, { code: 'P0003', category: 'S2', name: '別品目商品', listPrice: 86 }];
  const item = db.prepare('INSERT INTO 商品表 VALUES (?, ?, ?, ?)');
  for (const entry of items) item.run(entry.code, entry.category, entry.name, entry.listPrice);
  db.prepare('INSERT INTO 品目表 VALUES (?, ?)').run('S1', category);
  db.prepare('INSERT INTO 品目表 VALUES (?, ?)').run('S2', '別品目');
  const sellers = [
    { name: 'ちょうど', count: minimum, unit: 30, sku: 'P0001' },
    { name: '不足', count: minimum - 1, unit: 45, sku: 'P0001' },
    { name: '超過', count: minimum + 1, unit: 60, sku: 'P0001' },
    { name: '別分類', count: minimum, unit: 90, sku: 'P0003' },
  ];
  const rows: { id: string; name: string; sku: string; quantity: number; amount: number }[] = [];
  const order = db.prepare('INSERT INTO 発注表 VALUES (?, ?)');
  const detail = db.prepare('INSERT INTO 明細表 VALUES (?, ?, ?, ?)');
  for (const seller of sellers) {
    for (let n = 0; n < seller.count; n++) {
      const id = seller.name + n;
      order.run(id, seller.name);
      const quantity = minimum + (n % 3);
      rows.push({ id, name: seller.name, sku: seller.sku, quantity, amount: quantity * seller.unit });
      if (seller.sku === 'P0001') rows.push({ id, name: seller.name, sku: 'P0002', quantity: 1, amount: 100 });
    }
  }
  for (const row of rows) detail.run(row.id, row.sku, row.quantity, row.amount);
  const average = sellers.flatMap(seller => {
    const target = rows.filter(row => row.sku === 'P0001' && row.name === seller.name);
    const sum = (field: 'quantity' | 'amount') => target.reduce((total, row) => total + row[field], 0);
    return target.length ? [{ 取引先コード: seller.name, 平均購入単価: sum('amount') / sum('quantity') }] : [];
  }).sort((a, b) => a.平均購入単価 - b.平均購入単価);
  const sum = sellers.flatMap(seller => {
    const qualifying = rows.filter(row => row.name === seller.name && row.sku !== 'P0003');
    return new Set(qualifying.map(row => row.id)).size >= minimum
      ? [{ 取引先コード: seller.name, 合計購入金額: qualifying.reduce((total, row) => total + row.amount, 0) }] : [];
  }).sort((a, b) => b.合計購入金額 - a.合計購入金額);
  return { db, average, sum };
}
function sqlRows(db: DatabaseSync, sql: string) { return db.prepare(sql).all().map(row => ({ ...row })); }

test('問2の名寄せ、順不同2組、全WHERE／HAVING候補を表列と独立SQLite実行で検算する', () => {
  for (const variant of variants) {
    const body = specs[1].definition.build([variant]), visible = text(body);
    const parts = body.partAnswers!.filter(answer => answer.kind === 'unordered');
    assert.deepEqual(parts.map(answer => answer.partIds), [['part-a', 'part-b'], ['part-e', 'part-f']]);
    assert(parts.every(answer => !answer.presentation));
    expectUnique(body, 0, value => value === '更新すべきデータが更新されない' || value === '削除すべきデータが残る');
    const x = diagram(body, profiles.purchase, 1).alt.split('\n');
    const y = diagram(body, profiles.purchase, 2).alt.split('\n');
    const columns = x[1].split('｜').map(column => column.replace('（下線）', ''));
    const pairs = x.slice(2).map(row => row.split('｜')).flatMap(a => y.slice(2).map(row => [a, row.split('｜')] as const));
    const shared = columns.filter((_, i) => pairs.some(([a, b]) => a[i] === b[i]));
    assert.equal(shared.length, 1);
    expectUnique(body, 2, value => shared.includes(value));
    const layout = diagram(body, profiles.purchase, 0).alt.split('\n');
    const names = options(body, 4);
    const fields = (name: string) => layout[layout.indexOf(name) + 1].split('｜').map(field => field.replace('（下線）', ''));
    const eligible = names.flatMap((left, i) => names.slice(i + 1).map(right => [left, right]));
    const valid = eligible.filter(([left, right]) => fields(left).includes('商品コード') && fields(right).includes('商品コード') &&
      ['定価', '数量', '購入額'].every(field => [...fields(left), ...fields(right)].includes(field)));
    assert.deepEqual(valid, [keys(body, 4).map(i => names[i])]);
    expectUnique(body, 6, value => ['発注コード', '取引先コード', '発注日'].every(field => fields(value).includes(field)));
    const product = /商品名“([^”]+)”について/.exec(visible)![1], category = /品目表.品目名 = '([^']+)'/.exec(visible)![1];
    const minimum = +/について(\d+)回以上の発注実績/.exec(visible)![1];
    assert.match(visible, /商品名は一意/);
    const sourceSql = body.prompt.filter(block => block.type === 'code' && block.text.startsWith('SELECT'));
    assert.equal(sourceSql.length, 2);
    const { db, average, sum } = purchaseReference(product, category, minimum);
    try {
      for (const [slot, blank, expected, block] of [[3, '［d］', average, sourceSql[0]], [7, '［h］', sum, sourceSql[1]]] as const) {
        assert(block.type === 'code');
        expectUnique(body, slot, value => JSON.stringify(sqlRows(db, block.text.replace(blank, value))) === JSON.stringify(expected));
      }
    } finally { db.close(); }
    const q = question(body), reversed = Object.fromEntries(body.partAnswers!.flatMap(answer => answer.kind === 'choice' ?
      [[answer.partId, answer.choiceId]] : answer.kind === 'unordered' ? answer.partIds.map((id, i) => [id, answer.choiceIds[1 - i]]) : []));
    assert(gradeAnswer(q, { selectedPartChoices: reversed }).parts?.every(part => part.outcome === 'correct'));
    assert.equal(displayedAnswerParts(q).length, 8);
    assert(body.explanation.includes(shared[0]));
    assert.match(body.explanation, /COUNT\(DISTINCT 発注表.発注コード\)/);
  }
});

function qpDecode(value: string) {
  return Buffer.from(value.replaceAll('△', ' ').replace(/=([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))), 'latin1');
}

test('問3の符号化例を逆復号し、UTF-8の表示文字数と全9候補の境界衝突を独立検算する', () => {
  for (const variant of variants) {
    const body = specs[2].definition.build([variant]), visible = text(body);
    const encoded = /テキスト“([^”]+)”[\s\S]*?［a1］でエンコードすると“([^”]+)”[\s\S]*?［a2］でエンコードすると“([^”]+)”/.exec(visible)!;
    const original = Buffer.from(encoded[1].replaceAll('△', ' '), 'utf8');
    const aChoices = choices(body, 0);
    const matching = aChoices.flatMap((option, i) => {
      assert(option.type === 'table' && option.rows.length === 1);
      assert.deepEqual(option.columns, ['a1', 'a2', 'a3', 'a4']);
      const [a1, a2, a3, a4] = option.rows[0];
      const decode = (mode: string, sample: string) => mode === 'base64' ? Buffer.from(sample, 'base64') : qpDecode(sample);
      // A representative ASCII-heavy input passes through QP, while every octet in binary sample expands.
      const ascii = Buffer.from('Text mostly ASCII'), binary = Buffer.from([0xff, 0x00, 0x80]);
      const shorter = (data: Buffer, qpLength: number) => data.toString('base64').length < qpLength ? 'base64' : 'quoted-printable';
      return decode(a1, encoded[2]).equals(original) && decode(a2, encoded[3]).equals(original) &&
        a3 === shorter(ascii, ascii.length) && a4 === shorter(binary, binary.length * 3) ? [i] : [];
    });
    assert.deepEqual(matching, keys(body, 0));
    const length = +/書かれた(\d+)文字の平仮名/.exec(visible)![1];
    const bytes = Buffer.from('あ'.repeat(length), 'utf8');
    assert(bytes.every(byte => byte >> 7));
    assert.match(visible, /空白（符号は16進数で20）/);
    expectUnique(body, 1, option => +option === [...bytes].map(byte => '=' + byte.toString(16)).join('').length);
    const lines = diagram(body, profiles.mimeLines).alt.split('\n');
    const recognized = new Set<string>();
    for (const line of lines) {
      if (!line.startsWith('--')) continue;
      const opened = line.slice(2);
      recognized.add(opened);
      if (opened.endsWith('--')) recognized.add(opened.slice(0, -2));
    }
    assert.equal(recognized.size, 3);
    expectUnique(body, 2, candidate => recognized.has(candidate));
    assert([...recognized].every(candidate => body.explanation.includes(candidate)));
  }
});

test('問3の同一欄3項選択は全84組で集合採点し、順序、未完、重複、採点分母を確認する', () => {
  for (const variant of variants) {
    const body = specs[2].definition.build([variant]), q = question(body);
    const checklist = body.partAnswers!.find(answer => answer.kind === 'unordered');
    assert(checklist && checklist.presentation === 'checklist');
    assert.deepEqual(checklist.partIds, ['part-s2-choice-1', 'part-s2-choice-2', 'part-s2-choice-3']);
    const part = q.answerParts![2];
    const lines = diagram(body, profiles.mimeLines).alt.split('\n');
    const valid = options(body, 2).flatMap((value, i) => lines.some(line => line.startsWith('--') &&
      (line.slice(2) === value || line.slice(2).endsWith('--') && line.slice(2, -2) === value)) ? [i] : []);
    const grade = (indices: number[]) => gradeAnswer(q, {
      selectedPartChoices: Object.fromEntries(indices.map((index, i) => [checklist.partIds[i], part.choiceIds[index]])),
    }).parts?.find(answer => answer.partId === part.id)?.outcome;
    assert.equal(displayedAnswerParts(q).length, 3);
    assert.equal(q.answerParts!.length, 5);
    let total = 0, correct = 0;
    for (let a = 0; a < 9; a++) for (let b = a + 1; b < 9; b++) for (let c = b + 1; c < 9; c++) {
      const expected = valid.includes(a) && valid.includes(b) && valid.includes(c);
      assert.equal(grade([c, a, b]), expected ? 'correct' : 'incorrect');
      total++;
      if (expected) correct++;
    }
    assert.equal(total, 84);
    assert.equal(correct, 1);
    assert.equal(grade(valid.slice(0, 2)), 'unanswered');
    assert.throws(() => grade([valid[0], valid[0], valid[1]]), /複数選択の解答が重複/);
  }
});

test('問4の全選択肢の効果を照合し、漏えい範囲・SQL注入・通信と保存・追跡を区別する', () => {
  const effects = [
    [[/DNS.*フィッシング/, 'dns-credential-theft'], [/入力項目.*命令文.*データベース/, 'sql-text-injection'],
      [/管理ツール経由/, 'direct-db-tool'], [/盗聴.*管理者/, 'sniffed-admin']],
    [[/8文字以上/, 'complexity-only'], [/パスワードの再設定を全会員/, 'rotate-all'],
      [/商品の購入を行う会員だけ/, 'rotate-subset'], [/利用目的に事故の対応を追加/, 'request-consent'],
      [/カードの停止及び番号変更/, 'stop-card']],
    [[/Webサーバの増設/, 'scale-compute'], [/サービスの停止/, 'shutdown-assumption'],
      [/SQLインジェクション攻撃を防ぐ対策にならない/, 'unrelated-to-sql'], [/侵入経路の特定に時間/, 'logging-assumption']],
    [[/担当者の職務を分離/, 'roles'], [/端末を分離/, 'workstation'], [/保険に加入/, 'transfer-risk'],
      [/誓約書/, 'confidentiality-pledge'], [/セキュアプログラミング/, 'code-safety'], [/負荷分散装置/, 'availability']],
    [[/時刻を同期/, 'event-time'], [/会員情報を暗号化/, 'data-confidentiality'], [/社内からのインターネット利用/, 'egress'],
      [/共有ID/, 'shared-account'], [/RAID構成/, 'storage-availability']],
    [[/アクセスログやエラーログの保管/, 'investigative-records'], [/外部記憶媒体/, 'removable-media'],
      [/情報の共有/, 'sharing'], [/教育の実施/, 'education'], [/罰則の強化/, 'discipline']],
  ] as const;
  for (const variant of variants) {
    const body = specs[3].definition.build([variant]), visible = text(body);
    const allPasswords = /利用者IDとパスワードの漏えいが，商品購入の有無にかかわらず全会員/.test(visible);
    assert.equal(allPasswords, /カード番号などは決済代行会社の画面だけで入力/.test(visible));
    assert.match(visible, /DMZ[\s\S]*社内LAN[\s\S]*平文で保存[\s\S]*ネットワーク経路の暗号化/);
    const response = diagram(body, profiles.incident).alt;
    assert.match(response, /対象｜対策と対応\n会員｜①[\s\S]+Webサイト｜④/);
    assert.deepEqual([...response.matchAll(/[①-⑦]/g)].map(item => item[0]), ['①', '②', '③', '④', '⑤', '⑥', '⑦']);
    assert.match(response, /⑦.*負荷上昇.*二重化/);
    const expected = ['sql-text-injection', allPasswords ? 'rotate-all' : 'stop-card',
      'unrelated-to-sql', 'code-safety', 'data-confidentiality', 'investigative-records'];
    for (const [part, roles] of effects.entries()) expectUnique(body, part, option => {
      const match = roles.filter(([pattern]) => pattern.test(option));
      assert.equal(match.length, 1, option);
      return match[0][1] === expected[part];
    });
    assert.match(body.explanation, /入力値を分離するパラメータ化[\s\S]*接続そのものを止める策ではない[\s\S]*アクセス・エラーログ/);
  }
});

test('問1〜4の全図入力で見えるラベル、図の凡例、原表の下線と代替説明を照合する', () => {
  assert.deepEqual(renderers.map(item => item.profile), figures.map(item => item.profile));
  for (const variant of variants) for (const spec of specs) {
    const body = spec.definition.build([variant]);
    for (const block of body.prompt) {
      if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
      const { profile, values } = block.scene;
      const render = renderers.find(item => item.profile === profile);
      const data = figures.find(item => item.profile === profile);
      assert(render && data);
      assert(values.every((value, i) => value >= data.domain[i][0] && value <= data.domain[i][1]));
      assert.equal(block.alt, data.alt(values));
      const markup = renderToStaticMarkup(createElement(render.component, { values, caption: block.caption }));
      assert(markup.includes('<figcaption>' + block.caption + '</figcaption>'));
      if (profile === profiles.purchase) {
        assert.match(markup, /role="group"[^>]*aria-description/);
        assert.equal([...markup.matchAll(/data-primary-key="true"/g)].length, values[1] === 0 ? 7 : 1);
        assert.equal([...markup.matchAll(/<table\b/g)].length, values[1] === 0 ? 6 : 1);
      } else if (profile === profiles.incident) {
        assert.match(markup, /role="group"[^>]*aria-description/);
        assert.equal([...markup.matchAll(/<th scope="row"/g)].length, 2);
        assert.deepEqual([...markup.matchAll(/<div>([①-⑦]) /g)].map(match => match[1]), ['①', '②', '③', '④', '⑤', '⑥', '⑦']);
      } else {
        assert.match(markup, /<svg[^>]*role="img"[^>]*aria-labelledby/);
        assert.match(markup, /<desc[^>]*>/);
        if (profile === profiles.shared || profile === profiles.sync) {
          assert.match(markup, /共有メモリ/);
          assert.match(markup, /プロセスp1[\s\S]*プロセスp2/);
          assert.match(markup, /注記[\s\S]*共有データへのアクセス/);
          assert.match(markup, /stroke-dasharray/);
        }
        if (profile === profiles.message) {
          assert.equal([...markup.matchAll(/fill="var\(--selected-surface\)"/g)].length, 5);
          assert.equal([...markup.matchAll(/text-decoration="underline"/g)].length, 4);
          assert.match(markup, /注記　網掛け/);
        }
        if (profile === profiles.mimeLines) for (const line of block.alt.split('\n')) assert(markup.includes('>' + line + '</text>'));
      }
    }
  }
});
