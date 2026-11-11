import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2010AutumnPm01To04Definitions as definitions } from '../src/core/generators/legacy-2010-autumn-pm-01-04';
import { legacy2010AutumnPm0104Figures as figures } from '../src/core/generators/legacy-2010-autumn-pm-01-04-figures';
import { legacy2010AutumnPm0104FigureRenderers as renderers } from '../src/ui/Legacy2010AutumnPm0104Figures';
import { autumn2010Pm01To04Specs as specs } from '../scripts/legacy-2010-autumn-pm-01-04-specs';

const official = [
  { marks: 'イエイウウ', counts: [5, 5, 5, 5, 5], labels: ['設問1', '設問2 a', '設問2 b', '設問3 c', '設問3 d'] },
  { marks: 'アオエオエア', counts: [5, 5, 5, 6, 4, 4], labels: ['設問1 a', '設問1 b', '設問1 c', '設問2', '設問3', '設問4'] },
  { marks: 'エイアエア', counts: [4, 4, 4, 4, 3], labels: ['設問1', '設問2', '設問3 a', '設問3 b', '設問3 c'] },
  { marks: 'ウエイイ', counts: [4, 5, 5, 4], labels: ['a', 'b', 'c', 'd'] },
];
const cases = (q: number) => [0, 1, 2, 3].map(index => definitions[q - 1].build([index]));
const text = (block: Block) => {
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
};
const prose = (body: GeneratedBody) => body.prompt.filter(b => b.type === 'paragraph').map(b => b.text).join('\n');
const choiceIndex = (id: string) => +id.slice('choice-value-'.length) - 1;
function part(body: GeneratedBody, slot: number) {
  const part = body.answerParts![slot], answer = body.partAnswers!.find(a => a.kind === 'choice' && a.partId === part.id);
  assert(answer?.kind === 'choice');
  return { ...part, values: part.choiceIds.map(id => text(body.choices[choiceIndex(id)][0])), correct: part.choiceIds.indexOf(answer.choiceId) };
}
function checks(body: GeneratedBody, slot: number, predicate: (value: string) => boolean) {
  const answer = part(body, slot);
  assert.deepEqual(answer.values.flatMap((value, i) => predicate(value) ? [i] : []), [answer.correct], answer.label);
}
function table(body: GeneratedBody, caption: string) {
  const block = body.prompt.find(block => block.type === 'table' && block.caption === caption);
  assert(block?.type === 'table');
  return block.rows;
}

test('問1〜4の原紙面16頁と公式20欄、16条件、全候補の形式と決定性を照合する', () => {
  assert.deepEqual(specs.flatMap(s => s.pages), Array.from({ length: 16 }, (_, i) => i + 5));
  assert.match(specs[0].originalPageAlt[5], /6問以上選択した場合には，はじめの5問/);
  let candidateCount = 0;
  definitions.forEach((definition, q) => {
    assert.equal(definition.source, '2010h22a-fe-pm-' + (q + 1));
    assert.equal(definition.version, '3.2.0');
    assert.deepEqual(definition.reference, [0]);
    const source = definition.build([0]), original = official[q];
    assert.deepEqual(source.answerParts!.map(part => part.label), original.labels);
    for (let field = 0; field < original.marks.length; field++) {
      const parsed = part(source, field);
      assert.equal(parsed.correct, 'アイウエオカ'.indexOf(original.marks[field]));
      assert.equal(parsed.values.length, original.counts[field]);
    }
    const signatures = new Set<string>();
    for (let index = 0; index < 4; index++) {
      const body = definition.build([index]);
      assert.deepEqual(body, definition.build([index]));
      assert.deepEqual(body.prompt.map(block => block.type), source.prompt.map(block => block.type));
      assert.equal(body.answerParts!.length, original.marks.length);
      assert.equal(body.partAnswers!.length, original.marks.length);
      for (let field = 0; field < original.marks.length; field++) {
        const parsed = part(body, field);
        assert.equal(parsed.values.length, original.counts[field]);
        assert.equal(new Set(parsed.values).size, parsed.values.length);
        assert(parsed.correct >= 0);
        candidateCount += parsed.values.length;
      }
      signatures.add(JSON.stringify(body.prompt));
      assert(body.explanation.length > 100);
    }
    assert.equal(signatures.size, 4);
    for (const bad of [[-1], [4], [0.5], [], [0, 1]]) assert.throws(() => definition.build(bad));
  });
  assert.equal(candidateCount, 364);
});

const lit = [
  new Set([0, 1, 2, 3, 4, 5]), new Set([1, 2]), new Set([0, 1, 3, 4, 6]),
  new Set([0, 1, 2, 3, 6]), new Set([1, 2, 5, 6]), new Set([0, 2, 3, 5, 6]),
  new Set([0, 2, 3, 4, 5, 6]), new Set([0, 1, 2]), new Set([0, 1, 2, 3, 4, 5, 6]), new Set([0, 1, 2, 3, 5, 6]),
];
const decode = (byte: number) => lit.findIndex(set => Array.from({ length: 8 }, (_, segment) =>
  Number(set.has(segment)) === ((byte >> (7 - segment)) & 1)).every(Boolean));

test('問1の図の結線と点灯から全形状・BCD・2進数、入出力命令を独立に復元する', () => {
  for (const body of cases(1)) {
    const paragraphs = prose(body);
    const digit = Number(paragraphs.match(/図2のように“(\d)”/)![1]);
    checks(body, 0, value => decode(parseInt(value, 16)) === digit);
    const ports = table(body, '表1　出力ポートとA/D変換器の動作概要');
    const control = Number(ports[1][1]);
    checks(body, 1, value => value === 'OUTPUT ' + control);
    checks(body, 2, value => value === 'INPUT ' + control);
    const word = parseInt(paragraphs.match(/内容が16進数表記で([0-9A-F]{4})/)![1], 16);
    const high = decode(word >> 8), low = decode(word & 255);
    assert(high >= 0 && low >= 0);
    checks(body, 3, value => value === '0' + high + '0' + low);
    checks(body, 4, value => parseInt(value, 16) === 10 * high + low);
    assert(body.explanation.includes('OUTPUT ' + control) && body.explanation.includes('INPUT ' + control));
    assert(body.explanation.includes('0' + high + '0' + low));
    assert(body.explanation.includes((10 * high + low).toString(16).toUpperCase().padStart(4, '0')));
    assert.match(paragraphs, /ビット0とビット8には常に0/);
    assert.match(paragraphs, /読込みデータ及び書込みデータはすべて16ビット/);
    assert.match(paragraphs, /割込み間隔に比べて十分短い/);
    const wiring = body.prompt.find(b => b.type === 'diagram' && b.caption.startsWith('図1'));
    assert(wiring?.type === 'diagram');
    for (const n of Array.from({ length: 8 }, (_, i) => i)) assert(wiring.alt.includes('ビット' + (n + 8) + 'と' + n));
    assert.match(wiring.alt, /ビット14と6はそれぞれ上位・下位の右上/);
    assert.match(wiring.alt, /ビット10と2はそれぞれ上位・下位の左上/);
  }
});

function executePredicate(predicate: string, values: string[]) {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE 対応表 (質問 TEXT)');
    const insert = db.prepare('INSERT INTO 対応表 VALUES (?)');
    values.forEach(value => insert.run(value));
    try { return db.prepare('SELECT rowid FROM 対応表 WHERE ' + predicate + ' ORDER BY rowid').all().map(row => Number(row.rowid)); }
    catch { return null; }
  } finally { db.close(); }
}
function countRows(condition: string, reception: boolean) {
  const db = new DatabaseSync(':memory:');
  try {
    const category = condition.match(/種別 = '([^']+)'/)![1];
    db.exec('CREATE TABLE 対応表 (受付番号 INTEGER, 種別ID INTEGER); CREATE TABLE 種別表 (種別ID INTEGER, 種別 TEXT); CREATE TABLE 類似表 (受付番号 INTEGER, 類似受付番号 INTEGER);');
    const categories = db.prepare('INSERT INTO 種別表 VALUES (?, ?)');
    categories.run(1, category); categories.run(2, 'その他');
    db.exec('INSERT INTO 対応表 VALUES (1,1),(2,1),(3,1),(4,2); INSERT INTO 類似表 VALUES (1,11),(1,12),(2,11),(3,11),(4,13);');
    const column = reception ? '類似表.受付番号' : '類似受付番号';
    try { return db.prepare('SELECT ' + column + ' AS id, COUNT(*) AS n FROM 対応表, 種別表, 類似表 WHERE ' + condition + ' ORDER BY id').all().map(row => [Number(row.id), Number(row.n)]); }
    catch { return null; }
  } finally { db.close(); }
}
test('問2の正規化は主キーの従属性を査読固定し、全SQL選択肢を実DBで判定する', () => {
  for (const body of cases(2)) {
    const reviewedRoles = [
      /組合せを主キーとし，繰返し要素を排除/, /適用は不要/, /処理性能を考慮/,
      /主キー以外の項目における関数従属性/, /主キーの一部における関数従属性/,
    ];
    for (const value of part(body, 0).values) assert.equal(reviewedRoles.filter(role => role.test(value)).length, 1);
    [0, 4, 3].forEach((role, slot) => checks(body, slot, value => reviewedRoles[role].test(value)));
    const paragraphs = prose(body), keyword = paragraphs.match(/“([^”]+)”というキーワード/)![1];
    const exact = paragraphs.includes('それだけで全文');
    const words = ['', keyword, '前' + keyword, keyword + '後', '前' + keyword + '後', '長い前' + keyword + '後です', '無関係'];
    const expected = words.flatMap((word, i) => (exact ? word === '前' + keyword + '後' : word.includes(keyword)) ? [i + 1] : []);
    checks(body, 3, value => JSON.stringify(executePredicate(value, words)) === JSON.stringify(expected));
    const reception = paragraphs.includes('現在の質問の受付番号ごとに');
    const target = reception ? [[1, 2], [2, 1], [3, 1]] : [[11, 3], [12, 1]];
    checks(body, 4, value => JSON.stringify(countRows(value, reception)) === JSON.stringify(target));
    const model = paragraphs.match(/列にはすべて“([^”]+)”/)![1];
    assert(body.explanation.includes('既存行の値を' + model));
    assert(body.explanation.includes(reception ? '類似表の受付番号を' : '類似受付番号を'));
    checks(body, 5, value => {
      const db = new DatabaseSync(':memory:');
      try {
        db.exec('CREATE TABLE 対応表 (受付番号 INTEGER); INSERT INTO 対応表 VALUES (1),(2);');
        try { db.exec(value); } catch { return false; }
        const columns = db.prepare('PRAGMA table_info(対応表)').all();
        const column = columns.find(row => row.name === '製品型番');
        if (!column || column.type !== 'CHAR(' + model.length + ')' || column.notnull !== 1) return false;
        return db.prepare('SELECT 製品型番 FROM 対応表').all().every(row => row.製品型番 === model);
      } finally { db.close(); }
    });
  }
});

// Enumerate polynomial multiples directly. No division routine or generator case data is used.
function multipleSet(mask: string, width: number) {
  const polynomial = parseInt(mask, 2), coefficientWidth = width - mask.length + 1;
  const multiples = new Set<number>();
  for (let coefficients = 0; coefficients < 2 ** coefficientWidth; coefficients++) {
    let value = 0;
    for (let power = 0; power < coefficientWidth; power++) if ((coefficients & (1 << power)) !== 0) value ^= polynomial << power;
    multiples.add(value);
  }
  return multiples;
}
test('問3をGF(2)多項式の倍数全列挙で検算し、再送の分母・全CRC択・検出不能な誤りを照合する', () => {
  for (const body of cases(3)) {
    const paragraphs = prose(body);
    const accepted = Number(paragraphs.match(/(\d+)個のパケットに格納/)![1]);
    const rate = Number(paragraphs.match(/パケットの(\d+)%/)![1]);
    checks(body, 0, value => Number(value) * (100 - rate) === accepted * 100);
    const target = paragraphs.match(/マスク([01]{3})で計算した，符号計算対象のビット列([01]{4}) ([01]{4})/)!;
    const multiples = multipleSet(target[1], 10), padded = parseInt(target[2] + target[3] + '00', 2);
    checks(body, 1, value => multiples.has(padded ^ parseInt(value, 2)));
    checks(body, 2, value => value === 'すべてのビットが0');
    const evaluated: Record<string, (c: number) => number> = {
      '2ⁿ−1': () => 3, 'C': c => c, 'C⊕（2ⁿ−1）': c => c ^ 3, 'C⊕C': c => c ^ c,
    };
    checks(body, 3, value => [0, 1, 2, 3].every(code => evaluated[value](code) === 0));
    const received = parseInt(paragraphs.match(/付加したビット列([01]{10})を受信/)![1], 2);
    const verdict = multiples.has(received) ? '誤りが含まれるか否かは判断できない' : '誤りが含まれる';
    checks(body, 4, value => value === verdict);
    const payloadCheck = [0, 1, 2, 3].find(suffix => multiples.has(padded ^ suffix))!;
    assert(body.explanation.includes('右端2ビットは' + payloadCheck.toString(2).padStart(2, '0')));
    assert(body.explanation.includes(verdict));
    // All 256 8-bit payloads have exactly one 2-bit suffix in the code.
    for (let input = 0; input < 256; input++) {
      assert.equal([0, 1, 2, 3].filter(suffix => multiples.has(input * 4 + suffix)).length, 1);
    }
    assert(multiples.has(parseInt(target[1], 2)));
    assert.match(paragraphs, /受信したビット列に対して/);
    assert.match(paragraphs, /右端nビット以外がすべて0/);
  }
});
const expectedKeys: Record<string, string> = {
  'enc(KEY_CT)': 'KEY_C', 'enc(TICKET_CT)': 'KEY_T', 'enc(AUTH_C1)': 'KEY_CT', 'enc(ID_S)': 'KEY_CT',
  'enc(KEY_CS)': 'KEY_CT', 'enc(TICKET_CS)': 'KEY_S', 'enc(AUTH_C2)': 'KEY_CS',
};
test('問4の全通信を鍵の保有者と配送段階から追跡し、全空欄・全候補を判定する', () => {
  for (const body of cases(4)) {
    const rows = ['通信②', '通信③', '通信④', '通信⑤'].flatMap(caption => table(body, caption));
    for (let slot = 0; slot < 4; slot++) {
      const label = 'abcd'[slot];
      const targets = rows.filter(row => row[1] === '［' + label + '］').map(row => expectedKeys[row[0]]);
      assert(targets.length > 0 && targets.every(target => target === targets[0]));
      checks(body, slot, value => value.match(/KEY_[A-Z]+$/)?.[0] === targets[0]);
      const conclusion = body.explanation.slice(body.explanation.lastIndexOf('したがって'));
      assert(conclusion.match(new RegExp(label + 'は([^，。]+)'))?.[1].replace(/である$/, '').endsWith(targets[0]));
    }
    for (const [payload, key] of Object.entries(expectedKeys)) {
      for (const row of rows.filter(row => row[0] === payload && !row[1].startsWith('［'))) assert.equal(row[1].match(/KEY_[A-Z]+$/)?.[0], key);
    }
    // Independently follow who can learn each session key from the ciphertext envelopes.
    const known = { C: new Set(['KEY_C']), T: new Set(['KEY_T']), S: new Set(['KEY_S']) };
    assert(known.C.has(expectedKeys['enc(KEY_CT)']));
    known.C.add('KEY_CT');
    assert(known.T.has(expectedKeys['enc(TICKET_CT)']));
    known.T.add('KEY_CT');
    assert(known.C.has(expectedKeys['enc(AUTH_C1)']) && known.T.has(expectedKeys['enc(AUTH_C1)']));
    assert(known.C.has(expectedKeys['enc(KEY_CS)']));
    known.C.add('KEY_CS');
    assert(known.S.has(expectedKeys['enc(TICKET_CS)']));
    known.S.add('KEY_CS');
    assert(known.C.has(expectedKeys['enc(AUTH_C2)']) && known.S.has(expectedKeys['enc(AUTH_C2)']));
    assert(!known.C.has('KEY_T') && !known.C.has('KEY_S'));
    assert.match(prose(body), /利用を終了するまで，一時的に保持/);
    assert.match(prose(body), /直接関連しない仕様については，その記述を省略/);
  }
});
test('全10図プロフィールと22描画を実コンポーネントで描き、alt・枠・配線・キーボード領域を確認する', () => {
  const seen = new Set<string>();
  for (const definition of definitions) for (let index = 0; index < 4; index++) {
    for (const block of definition.build([index]).prompt) {
      if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
      const { profile, values } = block.scene, key = profile + ':' + values;
      if (seen.has(key)) continue;
      seen.add(key);
      const figure = figures.find(item => item.profile === profile), renderer = renderers.find(item => item.profile === profile);
      assert(figure && renderer);
      figure.validate(values);
      assert.equal(figure.alt(values), block.alt);
      const svg = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
      assert.match(svg, /tabindex="0"/); assert.match(svg, /<desc\b[^>]*>[\s\S]+<\/desc>/);
      const titleId = svg.match(/aria-labelledby="([^"]+)"/)?.[1], descId = svg.match(/aria-describedby="([^"]+)"/)?.[1];
      assert(titleId && descId && svg.includes('<title id="' + titleId + '"') && svg.includes('<desc id="' + descId + '"'));
      assert.match(svg, /role="img"/); assert(svg.includes("<figcaption>" + block.caption + "</figcaption>")); assert.match(svg, /var\(--diagram-ink\)/);
      if (profile.endsWith('thermometer')) for (let bit = 0; bit < 16; bit++) assert(svg.includes('data-output-bit="' + bit + '"'));
      for (const bad of [[-1], [4], [0, 0], [], [NaN]]) assert.throws(() => figure.validate(bad));
    }
  }
  assert.equal(figures.length, 10);
  assert.equal(seen.size, 22);
});
