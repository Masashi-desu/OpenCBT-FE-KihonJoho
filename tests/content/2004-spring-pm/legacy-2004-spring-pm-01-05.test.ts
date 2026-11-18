import assert from 'node:assert/strict';
import test from 'node:test';
import { displayedAnswerParts, gradeAnswer, validateAnswerDefinition } from '../../../src/core/answers';
import type { Question, Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { spring2004Pm01To05Specs } from '../../../scripts/legacy-2004-spring-pm-01-05-specs';

const [adder, news] = spring2004Pm01To05Specs;
const conditions = [0, 1, 2, 3];
const numeral = 'アイウエオカキクケコ';

function answerBank(body: GeneratedBody, field: string) {
  const part = body.answerParts!.find(item => item.id === 'part-' + field);
  assert(part);
  const details = body.partAnswers!.find(item =>
    item.kind === 'unordered' ? item.partIds.includes(part.id) : item.partId === part.id);
  assert(details);
  const texts = part.choiceIds.map(id => {
    const block = body.choices[Number(id.split('-').at(-1)) - 1][0];
    assert(block.type === 'paragraph' || block.type === 'code');
    return block.text;
  });
  const correctIds = details.kind === 'unordered' ? details.choiceIds : details.kind === 'choice' ? [details.choiceId] : [];
  return { texts, correct: correctIds.map(id => texts[part.choiceIds.indexOf(id)]),
    keys: correctIds.map(id => numeral[part.choiceIds.indexOf(id)]), part, details };
}
function figureAlt(body: GeneratedBody, suffix: string, subcase?: number) {
  const block = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' &&
    block.scene.profile.endsWith(suffix) && (subcase === undefined || subcase === block.scene.values[1]));
  assert(block?.type === 'diagram');
  return block.alt;
}
const paragraphs = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');

for (const [spec, parts, keys, pages] of [
  [adder, 'sabc', 'エアキク', [3, 4, 5]], [news, 'abcdefghi', 'オイアカケクキウア', [19, 20, 21, 22, 23, 24, 25]],
] as const) {
  test('問' + spec.number + 'の公式頁・操作欄・解答ロケータと各生成条件を確認する', () => {
    assert.deepEqual(spec.pages, pages);
    assert.equal(spec.definition.sourceAnswer, keys);
    const asWritten = [...parts].map(field => {
      const bank = answerBank(spec.original, field);
      assert.equal(bank.part.id, 'part-' + field);
      return bank.keys[field === 'd' ? 1 : 0];
    }).join('');
    assert.equal(asWritten, keys);
    assert.equal(spec.original.answerParts?.length, parts.length);
    assert.deepEqual(spec.definition.build([0]), spec.original);
    const display = conditions.map(index => spec.definition.build([index]).prompt.map((block: Block) => {
      if (block.type === 'diagram') return block.alt;
      if (block.type === 'table') return block.rows;
      if (block.type === 'paragraph' || block.type === 'code') return block.text;
      throw Error(block.type);
    }));
    assert.equal(new Set(display.map(value => JSON.stringify(value))).size, 4);
    for (const invalid of [[], [0, 1], [NaN], [1.5], [-1], [4], Array(1)])
      assert.throws(() => spec.definition.build(invalid), /PARAMETER_CONSTRAINT/);
  });
}

test('問1の状態遷移図の全入力、演算表、実際の4桁の加算を独立に照合する', () => {
  conditions.forEach(index => {
    const body = adder.definition.build([index]);
    const matches = /“([01]{4})＋([01]{4})”の計算を行ったとき/.exec(paragraphs(body));
    assert(matches);
    const x = Number.parseInt(matches[1], 2), y = Number.parseInt(matches[2], 2);
    const carry = Array.from({ length: 5 }, (_, i) => {
      const factor = 2 ** i;
      return (x % factor) + (y % factor) >= factor ? 'q₁' : 'q₀';
    }).join(' → ');
    const bank = answerBank(body, 's');
    assert.equal(bank.texts.length, 5);
    assert.deepEqual(bank.texts.filter(value => value === carry), bank.correct);
    assert.deepEqual(bank.keys, [['エ'], ['ア'], ['イ'], ['オ']][index]);
    const iso = figureAlt(body, '1-states');
    const lines = [...iso.matchAll(/q([₀₁])からq([₀₁])への入力x・yと出力sは([^。]+)/gu)];
    assert.equal(lines.length, 4);
    const independentTable = new Map<string, string>();
    for (const [, from, to, entries] of lines)
      for (const entry of entries.split('，')) {
        const [xy, s] = entry.split('/');
        independentTable.set((from === '₁' ? 1 : 0) + xy, (to === '₁' ? 1 : 0) + s);
      }
    const table = body.prompt.find(block => block.type === 'table');
    assert(table?.type === 'table');
    assert.equal(table.rows.length, 8);
    for (const [c, xBit, yBit, next, digit] of table.rows) {
      assert.equal(Number(c) + Number(xBit) + Number(yBit), 2 * Number(next) + Number(digit));
      assert.equal(independentTable.get(c + xBit + yBit), next + digit);
    }
  });
});

test('問1 a〜cの全512組を1ビットの算術に照合し、実効ビット幅の境界も検証する', () => {
  conditions.forEach(index => {
    const body = adder.definition.build([index]);
    const banks = [...'abc'].map(field => answerBank(body, field));
    assert.deepEqual(banks.map(bank => bank.texts.length), [8, 8, 8]);
    const carryTerms: Record<string, (c: number, x: number, y: number, s: number) => number> = {
      'sw ← 0': () => 0, 'sw ← 1': () => 1, 'sw ← s[i]': (_c, _x, _y, s) => s,
      'sw ← x[i] and y[i]': (_c, x, y) => x * y,
      'sw ← x[i] or y[i]': (_c, x, y) => Math.min(1, x + y),
    };
    const predicates: Record<string, (c: number, s: number) => boolean> = {
      'sw = 0': c => c === 0, 'sw = 1': c => c === 1, 'sw = s[i]': (c, s) => c === s,
    };
    const solutions: string[][] = [];
    for (const a of banks[0].texts) for (const b of banks[1].texts) for (const c of banks[2].texts) {
      if (!Object.hasOwn(predicates, a) || !Object.hasOwn(carryTerms, b) || !Object.hasOwn(carryTerms, c)) continue;
      let passes = true;
      for (let state = 0; state <= 1; state++) for (let x = 0; x <= 1; x++) for (let y = 0; y <= 1; y++) for (let old = 0; old <= 1; old++) {
        const first = predicates[a](state, old);
        const parity = Number(x !== y), digit = first ? parity : 1 - parity;
        const carry = carryTerms[first ? b : c](state, x, y, digit);
        if (digit !== (x + y + state) % 2 || carry !== Math.floor((x + y + state) / 2)) passes = false;
      }
      if (passes) solutions.push([a, b, c]);
    }
    assert.deepEqual(solutions, [banks.map(bank => bank.correct[0])]);
    const width = [16, 8, 12, 24][index];
    const program = body.prompt.find(block => block.type === 'code' && block.text.includes('論理型：x'));
    assert(program?.type === 'code');
    assert.match(program.text, new RegExp('x\\[' + width + '\\]，y\\[' + width + '\\]，s\\[' + width + '\\]'));
    assert.match(program.text, new RegExp('i ＜ ' + width));
    assert(figureAlt(body, '1-bit-array').includes((width - 1) + '，' + (width - 2) + '，…，3，2，1，0'));
    const base = 2 ** width;
    for (const [x, y] of [[0, 0], [base - 1, 1], [base - 1, base - 1], [base / 2, 13], [31, 17]]) {
      let total = 0, carry = 0;
      for (let i = 0; i < width; i++) {
        const a = (x >> i) & 1, b = (y >> i) & 1;
        const first = predicates[banks[0].correct[0]](carry, 0);
        const digit = first ? Number(a !== b) : Number(a === b);
        carry = carryTerms[banks[first ? 1 : 2].correct[0]](carry, a, b, digit);
        total += digit * 2 ** i;
      }
      assert.equal(total, (x + y) % base);
    }
  });
});

const newsFixture = [
  { cutoff: '20040402 1700', categories: ['政治', '経済', 'スポーツ'], numbers: [19, 24, 7], rows: 50, shown: 27 },
  { cutoff: '20040403 0905', categories: ['スポーツ', 'サイエンス', '社会'], numbers: [7, 17, 18], rows: 42, shown: 25 },
  { cutoff: '20040403 1610', categories: ['政治', '芸能', '教育'], numbers: [19, 7, 2], rows: 28, shown: 17 },
  { cutoff: '20040402 2330', categories: ['経済', 'スポーツ', '医療'], numbers: [20, 6, 1], rows: 27, shown: 14 },
] as const;
const minutes = (value: string) => Number(value.slice(6, 8)) * 1440 + Number(value.slice(9, 11)) * 60 + Number(value.slice(11, 13));

test('問5は24時間の境界と全分類の登録件数を、表示された各小問の入力から独立に集計する', () => {
  conditions.forEach(index => {
    const body = news.definition.build([index]), expect = newsFixture[index];
    const previous = /｜(\d{8})｜(\d{4})。$/.exec(figureAlt(body, '5-record-layout', 6));
    const now = /この利用者が2004年4月(\d+)日の(\d+)時(\d+)分に/.exec(paragraphs(body));
    assert(previous && now);
    const pad = (digit: string) => digit.padStart(2, '0');
    const today = '200404' + pad(now[1]) + ' ' + pad(now[2]) + now[3];
    const threshold = Math.max(minutes(previous[1] + ' ' + previous[2]), minutes(today) - 1440);
    const a = answerBank(body, 'a'), b = answerBank(body, 'b');
    assert.deepEqual([a.texts.length, b.texts.length], [6, 6]);
    assert(body.prompt.length <= 100, '通常アプリの本文ブロック上限に収める');
    const displayedParagraphs = paragraphs(body).split('\n');
    for (const field of ['a', 'c', 'e', 'h']) {
      const choices = answerBank(body, field).texts;
      const labels = 'アイウエオカキクケコ';
      assert(choices.every((choice, option) => displayedParagraphs.includes(labels[option] + '　' + choice)));
    }
    const candidates: string[][] = [];
    for (const date of a.texts) for (const time of b.texts) {
      const normalized = (date + ' ' + time).replace(/[“”]/g, '');
      if (/^200404\d{2} \d{4}$/.test(normalized) && minutes(normalized) === threshold) candidates.push([date, time]);
    }
    assert.deepEqual(candidates, [[...a.correct, ...b.correct]]);
    assert.equal([...a.correct, ...b.correct].join(' ').replace(/[“”]/g, ''), expect.cutoff);
    assert.match(paragraphs(body), /24時間を超える場合.*24時間前から.*24時間以内の場合.*最後に利用した日時以降/);
    const categoryRecord = figureAlt(body, '5-record-layout', 8);
    const row = /DT512｜([^｜]+)｜([^｜]+)｜([^｜]+)｜NIL｜NIL｜20040401｜(\d{2})00。/.exec(categoryRecord);
    assert(row);
    assert.deepEqual(row.slice(1, 4), expect.categories);
    const cap = Number(/分類ごとに最大(\d+)件/.exec(paragraphs(body))?.[1]);
    const table = body.prompt.find(block => block.type === 'table');
    assert(table?.type === 'table');
    assert.equal(table.rows.length, 8);
    const time = Number(row[4]);
    const counts = row.slice(1, 4).map(kind => {
      const source = table.rows.find(([label]) => label === kind)!;
      const starting = table.columns.findIndex(column => column.startsWith(String(time).padStart(2, '0') + ':00'));
      const hourly = source.slice(starting).flatMap(amount => Array<true>(Number(amount)).fill(true));
      return hourly.length;
    });
    assert.deepEqual(counts, expect.numbers);
    const numbers = counts.flatMap((amount, category) => Array<number>(amount).fill(category));
    const ranked = numbers.filter((category, i) => numbers.slice(0, i).filter(other => other === category).length < cap);
    assert.deepEqual([numbers.length, ranked.length], [expect.rows, expect.shown]);
    for (const [letter, desired] of [['h', numbers.length], ['i', ranked.length]] as const) {
      const bank = answerBank(body, letter);
      assert.equal(bank.texts.length, 7);
      assert.deepEqual(bank.texts.filter(value => Number(value) === desired), bank.correct);
    }
  });
  const exactlyOneDay = minutes('20040402 1100') - minutes('20040401 1100');
  assert.equal(exactlyOneDay, 1440);
});

test('問5の一時ファイルBと三段の整列の全候補を検証し、c/dは両順を単一選択欄で採点する', () => {
  const samples = ['A', 'B'].flatMap(分類 => ['20040402', '20040403'].flatMap(発生年月日 => ['0800', '1159'].map(発生時刻 => ({
    id: 分類 + 発生年月日[7] + '-' + 発生時刻, 分類, 発生年月日, 発生時刻, 登録年月日: '20040404', 登録時刻: '0700',
    概要: '同じ概要', 詳細: '同じ詳細', 画像ファイルのアドレス: '/image',
  }))));
  const expectedOrder = 'A3-1159 A3-0800 A2-1159 A2-0800 B3-1159 B3-0800 B2-1159 B2-0800';
  conditions.forEach(index => {
    const body = news.definition.build([index]);
    assert.match(figureAlt(body, '5-flow'), /ニュース抽出処理→一時ファイルB→ニュース整列処理→一時ファイルC→結果出力処理/);
    assert.match(figureAlt(body, '5-record-layout', 7), /発生年月日｜発生時刻｜［c］.*画像ファイルのアドレス｜［d］/);
    assert.match(paragraphs(body), /各処理間の情報受渡しは，図に示すファイルだけ/);
    const c = answerBank(body, 'c'), d = answerBank(body, 'd');
    assert.deepEqual(c.part.choiceIds, d.part.choiceIds);
    const acceptablePairs: string[][] = [];
    for (const first of c.texts) for (const second of d.texts) {
      const present = new Set([first, second]);
      if (present.has('端末種別') && present.has('分類')) acceptablePairs.push([first, second]);
    }
    assert.deepEqual(acceptablePairs, [c.correct, [...c.correct].reverse()]);
    const a = answerBank(body, 'e'), b = answerBank(body, 'f'), g = answerBank(body, 'g');
    const sortKeys: string[][] = [];
    for (const first of a.texts) for (const second of b.texts) for (const third of g.texts) {
      const fields = [first, second, third];
      // Only the relation fields, not the request's or not-yet-passed fields, can be keys.
      const comparator = (x: typeof samples[number], y: typeof samples[number]) => {
        for (const [i, name] of fields.entries()) {
          const property = name as keyof typeof x;
          const left = x[property], right = y[property];
          if (left && right && left !== right) return (left < right ? -1 : 1) * (i === 0 ? 1 : -1);
        }
        return 0;
      };
      const valid = (items: readonly typeof samples[number][]) =>
        [...items].sort(comparator).map(item => item.id).join(' ') === expectedOrder;
      if (valid(samples) && valid([...samples].reverse()) && valid([...samples.slice(3), ...samples.slice(0, 3)])) sortKeys.push(fields);
    }
    assert.deepEqual(sortKeys, [[a.correct[0], b.correct[0], g.correct[0]]]);
    const question = {
      answerParts: body.answerParts!, choices: body.choices.map((blocks, i) => ({ id: 'choice-value-' + (i + 1), blocks })),
      correctAnswer: { parts: body.partAnswers }, id: 'review-q5',
    } as unknown as Question;
    validateAnswerDefinition(question);
    assert.equal(displayedAnswerParts(question).length, 9);
    const pair = body.partAnswers!.find(part => part.kind === 'unordered');
    assert(pair?.kind === 'unordered');
    assert.equal(pair.presentation, undefined);
    const allSelections: Record<string, string> = Object.fromEntries(body.partAnswers!.flatMap(answer => {
      if (answer.kind === 'choice') return [[answer.partId, answer.choiceId]];
      assert(answer.kind === 'unordered');
      return answer.partIds.map((partId, idx) => [partId, answer.choiceIds[idx]]);
    }));
    for (const first of c.part.choiceIds) for (const second of d.part.choiceIds) {
      const actual = gradeAnswer(question, { selectedPartChoices: { ...allSelections, 'part-c': first, 'part-d': second } });
      const uniquePair = new Set([first, second]);
      const intended: boolean = pair.choiceIds.every(id => uniquePair.has(id));
      assert.equal(actual.outcome, intended ? 'correct' : 'incorrect');
    }
    const missing = { ...allSelections };
    delete missing['part-d'];
    assert.equal(gradeAnswer(question, { selectedPartChoices: missing }).outcome, 'unanswered');
  });
});
