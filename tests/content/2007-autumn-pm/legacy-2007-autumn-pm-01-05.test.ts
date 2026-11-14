import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2007AutumnPm01To05Definitions as definitions } from '../../../src/core/generators/legacy-2007-autumn-pm-01-05';
import { legacy2007AutumnPm0105Figures as figures } from '../../../src/core/generators/legacy-2007-autumn-pm-01-05-figures';
import { legacy2007AutumnPm0105FigureRenderers as renderers } from '../../../src/ui/Legacy2007AutumnPm0105Figures';
import { autumn2007Pm01To05Specs as specs } from '../../../scripts/legacy-2007-autumn-pm-01-05-specs';
import review from '../../fixtures/legacy-2007-autumn-pm-01-05-review.json';

const cases = [0, 1, 2, 3];
const build = (major: number, condition: number) => definitions[major - 2].build([condition]);
const stem = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const codeBlocks = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'code' ? [block.text] : []);
const diagrams = (body: GeneratedBody) => body.prompt.filter((block): block is Extract<Block, {type: 'diagram'}> => block.type === 'diagram');
function bank(body: GeneratedBody, index: number) {
  const part = body.answerParts?.[index], answer = body.partAnswers?.[index];
  assert(part && answer?.kind === 'choice');
  const choices = part.choiceIds.map(id => body.choices[Number(id.split('-').at(-1)) - 1][0]);
  return { part, answer, choices };
}
function values(body: GeneratedBody, index: number) {
  return bank(body, index).choices.map(block => {
    if (block.type === 'table') return block.rows[0].join('／');
    assert(block.type === 'paragraph' || block.type === 'code');
    return block.text;
  });
}
function verify(body: GeneratedBody, partIndex: number, predicate: (option: string) => boolean) {
  const {part, answer} = bank(body, partIndex);
  const options = values(body, partIndex);
  assert.deepEqual(options.flatMap((option, i) => predicate(option) ? [part.choiceIds[i]] : []), [answer.choiceId],
    part.id + '  ' + options.join(' ｜ '));
}

test('公式冊子の全採用ページ、20欄、各4条件、択順と構成を検査する', () => {
  assert.deepEqual(specs.map(spec => spec.number), [2, 3, 4, 5]);
  assert.deepEqual(review.held.map(question => question.number), [1]);
  assert.equal(review.questions.reduce((sum, q) => sum + q.parts.length, 0), 20);
  for (const q of review.questions) {
    const spec = specs[q.number - 2];
    assert.deepEqual(spec.pages, q.pages);
    assert.deepEqual(spec.definition.reference, [0]);
    for (const page of q.pages) assert(spec.originalPageAlt?.[page].length > 68, String(page));
    const result = build(q.number, 0);
    assert.equal(q.parts.map((_, index) => {
      const { part, answer } = bank(result, index);
      return 'アイウエオカキク'[part.choiceIds.indexOf(answer.choiceId)];
    }).join(''), q.marks);
    const bodies = cases.map(condition => build(q.number, condition));
    const shape = (body: GeneratedBody) => [body.prompt.map(block => block.type), body.choices.map(blocks => blocks.map(block => block.type)), body.answerParts];
    for (const item of bodies) {
      assert.deepEqual(shape(item), shape(result));
      assert.deepEqual(item.answerParts?.map(part => part.id), q.parts.map(mark => 'part-' + mark));
      assert.deepEqual(q.parts.map((_, i) => values(item, i).length), q.bankSizes);
      for (let i = 0; i < q.parts.length; i++) {
        const options = values(item, i);
        assert.equal(new Set(options).size, options.length);
      }
      assert(item.explanation.length > 50);
    }
    assert.equal(new Set(bodies.map(item => JSON.stringify(item.prompt))).size, 4);
    for (const invalid of [[], [-1], [4], [0.5], [0, 1], Array<number>(1)]) {
      assert.throws(() => spec.definition.build(invalid), /PARAMETER_CONSTRAINT/);
    }
  }
  assert.equal(specs[2].definition.fixedReferenceAssetIds?.length, 2);
});

test('問2のSQLは実データに対し、集計と8³の空欄候補を独立参照結果で照合する', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`
      CREATE TABLE 支店表(支店コード TEXT PRIMARY KEY, 集配センタコード TEXT);
      CREATE TABLE 配達地域表(管轄地区 TEXT PRIMARY KEY, 支店コード TEXT);
      CREATE TABLE 配達品表(預り番号 TEXT, 受付支店コード TEXT, 届け先管轄地区 TEXT, 届け先住所 TEXT, 届け先氏名 TEXT);
      CREATE TABLE 移送履歴表(預り番号 TEXT, 通過日時 INTEGER, 通過店コード TEXT, 入出区分 TEXT, PRIMARY KEY (預り番号, 通過日時));
    `);
    for (const index of cases) {
      db.exec('DELETE FROM 支店表; DELETE FROM 配達地域表; DELETE FROM 配達品表; DELETE FROM 移送履歴表');
      const body = build(2, index), paragraph = stem(body), [fill, lookup] = codeBlocks(body);
      const center = paragraph.match(/設問1　集配センタ (A\d+) /)![1];
      const branch = paragraph.match(/支店 (S\d+) で/)![1];
      const parcel = lookup.match(/預り番号 = '(\d+)'/)![1];
      const line = diagrams(body)[0].alt;
      const groups = Array.from(line.matchAll(/(A\d+)は(S\d+(?:、S\d+)*)の[23]支店/g),
        groups => [groups[1], groups[2].split('、')] as const);
      assert.equal(groups.length, 2);
      const offices = groups.flatMap(([hub, locations]) => locations.map(location => ({hub, location})));
      for (const {hub, location} of offices) db.prepare('INSERT INTO 支店表 VALUES (?, ?)').run(location, hub);
      const doesManage = !paragraph.includes('管理していない');
      const candidates = values(body, 0);
      const count = offices.filter(({hub}) => (hub === center) === doesManage).length;
      verify(body, 0, query => {
        const statement = db.prepare(query);
        const actual = Object.values(statement.all()[0] ?? {});
        return actual.length === 1 && actual[0] === count;
      });
      assert.equal(candidates.length, 5);

      const other = offices.find(item => item.location !== branch)!.location;
      for (const [area, office] of [['地区一', branch], ['地区二', branch], ['地区三', other]]) {
        db.prepare('INSERT INTO 配達地域表 VALUES (?, ?)').run(area, office);
      }
      const deliveries = [
        [branch, '地区一', '一番地', '田中'],
        [branch, '地区二', '二番地', '高橋'],
        [branch, '地区三', '三番地', '鈴木'],
        [other, '地区一', '四番地', '斉藤'],
        [other, '地区三', '五番地', '木村'],
      ];
      for (const [i, row] of deliveries.entries()) db.prepare('INSERT INTO 配達品表 VALUES (?, ?, ?, ?, ?)').run(String(i), ...row);
      const local = paragraph.includes('直接配達を受けもった');
      const expected = deliveries.filter(([office, area]) => office === branch && (area !== '地区三') === local)
        .map(row => row.slice(1).join('／')).sort();
      const alternatives = values(body, 1), accepted: string[][] = [];
      for (const a of alternatives) for (const b of alternatives) for (const c of alternatives) {
        const executable = fill.replace('［a］', a).replace('［b］', b).replace('［c］', c);
        let output: string[];
        try { output = db.prepare(executable).all().map(value => Object.values(value).join('／')).sort(); }
        catch { continue; }
        if (JSON.stringify(output) === JSON.stringify(expected)) accepted.push([a, b, c]);
      }
      assert.equal(accepted.length, 1);
      for (let offset = 0; offset < 3; offset++) verify(body, offset + 1, option => option === accepted[0][offset]);

      const history = [[31, branch, 'I'], [42, branch, 'O'], [56, center, 'I']] as const;
      for (const [stamp, location, direction] of history) {
        db.prepare('INSERT INTO 移送履歴表 VALUES (?, ?, ?, ?)').run(parcel, stamp, location, direction);
      }
      db.prepare('INSERT INTO 移送履歴表 VALUES (?, ?, ?, ?)').run('1234567', 99, other, 'I');
      const actual = db.prepare(lookup).all().map(value => Object.values(value));
      const latest = lookup.includes('MAX('), target = latest ? history.at(-1) : history[0];
      assert.deepEqual(actual, [target]);
      verify(body, 4, option => option.includes((latest ? '最新' : '最初') + 'の集配場所と日時'));
      assert.deepEqual(db.prepare(lookup.replaceAll(parcel, '7654321')).all(), []);
    }
  } finally {
    db.close();
  }
});

test('問3の期間と修復時間は年度の連続列と故障・稼働時間の集計で照合する', () => {
  for (const condition of cases) {
    const body = build(3, condition), text = stem(body), table = body.prompt.find(block => block.type === 'table');
    assert(table);
    const yearX = Number(text.match(/年経過し，(\d+)年目/)![1]);
    const [yearY, stableY] = text.match(/Yは，導入後(\d+)年目.+?（(\d+)年目）から故障頻度/)!.slice(1).map(Number);
    const yearZ = Number(text.match(/Zは，導入後(\d+)年目/)![1]);
    const earlierWear = yearX - 2, multiplier = Number(text.match(/合計はYの(\d+)倍/)![1]);
    const years = Array.from({length: 20}, (_, relative) => relative);
    const shared = years.filter(relative => [yearY, yearZ].every(start => start + relative >= stableY && start + relative < earlierWear));
    const [x, y] = table.rows.map(row => row.map(cell => Number(cell.replaceAll(',', ''))));
    const elapsedY = Array<number>(y[3]).fill(y[2]).reduce((total, hours) => total + hours, 0);
    const failedHoursX = Array<number>(multiplier).fill(elapsedY).reduce((total, hours) => total + hours, 0);
    assert.equal(failedHoursX % x[2], 0);
    const ops = failedHoursX / x[2], step = (x[1] - failedHoursX) / ops;
    verify(body, 0, value => Number(value) === shared[0] + 1);
    verify(body, 1, value => Number(value) === shared.length);
    verify(body, 2, value => Number(value.replaceAll(',', '')) === step);
    verify(body, 3, value => Number(value.replaceAll(',', '')) === elapsedY);
  }
});

test('問4は全式と条件の候補を実行し、拡大整数で求めた独立の期待文字列と比較する', () => {
  const inputs = ['0', '0.012', '-0.012', '2.375', '-2.375', '7.75', '12.345', '25.25', '41.75', '-43.125', '98.875'];
  for (const condition of cases) {
    const body = build(4, condition);
    const base = Number(stem(body).match(/実数値を(\d+)進/)![1]), start = Number(stem(body).match(/配列の添字は(\d)から/)![1]);
    const source = codeBlocks(body)[0];
    assert.match(source, /│  ・Fint ← ［a］\n■/);
    assert.match(source, /│  ・Fdec ← ［c］  ← β\n│/);
    const a = values(body, 0), b = values(body, 1), c = values(body, 2), d = values(body, 3);
    const before = a.map(term => {
      if (term === 'Fint ÷ ' + base) return (n: number) => Math.floor(n / base);
      if (term.startsWith('(Fint')) return (n: number) => Math.floor(n / base) * base;
      if (term.includes('(')) return (n: number) => n % base;
      if (term.includes('÷')) return (n: number) => n - Math.floor(n / base);
      return (n: number) => n - base;
    });
    const after = c.map(term => {
      if (term.endsWith('× ' + base) && !term.includes('Int')) return (n: number) => n * base;
      if (term.endsWith('÷ ' + base) && !term.includes('Int')) return (n: number) => n / base;
      if (term.includes('×')) return (n: number) => n - Math.floor(n * base);
      if (term.includes('÷')) return (n: number) => n - Math.floor(n / base);
      return (n: number) => n - Math.floor(n);
    });
    const preserveZero = b.map(term => {
      if (term.includes('or (')) return (size: number, negative: boolean) => size === 0 || (size === 1 && negative);
      if (term.includes('or')) return (size: number, negative: boolean) => size === 0 || negative;
      if (term.includes('and')) return (size: number, negative: boolean) => size === 1 && negative;
      return (size: number) => size + start === Number(term.split(' = ')[1]);
    });
    function oracle(input: string, digits: number) {
      const [integer, fraction = ''] = input.replace('-', '').split('.');
      const scaled = BigInt(integer + fraction) * BigInt(base) ** BigInt(digits) / (10n ** BigInt(fraction.length));
      const fixed = scaled.toString(base).padStart(digits + 1, '0');
      return (input.startsWith('-') ? '−' : '') + fixed.slice(0, -digits) + '.' + fixed.slice(-digits);
    }
    function simulate(input: string, digits: number, selections: number[]) {
      const negative = input.startsWith('-'), stack: number[] = [];
      const value = Math.abs(Number(input)), out: string[] = negative ? ['−'] : [];
      let whole = Math.floor(value), fractional = value - whole;
      for (let iteration = 0; whole > 0; iteration++) {
        if (iteration > 7) return undefined;
        stack.push(whole - Math.floor(whole / base) * base);
        whole = before[selections[0]](whole);
      }
      while (stack.length) out.push(String(stack.pop()));
      if (preserveZero[selections[1]](out.length, negative)) out.push('0');
      out.push('.');
      for (let index = 0; index < digits; index++) {
        fractional = after[selections[2]](fractional);
        const digit = Math.floor(fractional + 1e-10);
        if (digit < 0 || digit >= base) return undefined;
        out.push(String(digit));
        fractional = after[selections[3]](fractional + 1e-12);
      }
      return out.join('');
    }
    const expected = [3, 2, 3, 0];
    [a, b, c, d].forEach((options, part) => verify(body, part, answer => {
      const attempt = expected.map((correct, index) => index === part ? options.indexOf(answer) : correct);
      return inputs.every(input => [1, 2, 3, 4].every(digits => simulate(input, digits, attempt) === oracle(input, digits)));
    }));
    for (const pair of diagrams(body)[0].alt.matchAll(/(−?[\d.]+)，(\d+)：([^。]+)/g)) {
      const input = pair[1].replace('−', '-');
      assert.equal(pair[3].replaceAll('｜', ''), oracle(input, Number(pair[2])));
    }
    const [, float, parsedDigits] = stem(body).match(/Float ＝ (−?[\d.]+)，Num ＝ (\d+)/)!;
    const out = oracle(float.replace('−', '-'), Number(parsedDigits)), hexadecimal = out.replace('−', '').split('.')[0];
    verify(body, 4, value => Number(value) === (hexadecimal === '0' ? 0 : hexadecimal.length));
    verify(body, 5, value => value === parsedDigits);
    assert(body.explanation.includes('「' + out + '」'));
  }
});

test('問5は購入・明細・商品のデータから、項目の依存と抽出条件の全候補を評価する', () => {
  const products = [
    { '商品コード': 'X01', '商品カテゴリ': '甲', '商品名': '計算機', '商品価格': 200 },
    { '商品コード': 'X02', '商品カテゴリ': '乙', '商品名': '計算機', '商品価格': 150 },
    { '商品コード': 'X03', '商品カテゴリ': '甲', '商品名': '端末', '商品価格': 150 },
    { '商品コード': 'X04', '商品カテゴリ': '丙', '商品名': 'ケーブル', '商品価格': 120 },
  ];
  const purchased = [
    { '購入番号': 'T01', '会員 ID': 'M1', date: 11, total: 380, amount: 2 },
    { '購入番号': 'T02', '会員 ID': 'M1', date: 32, total: 680, amount: 1 },
    { '購入番号': 'T03', '会員 ID': 'M1', date: 37, total: 440, amount: 3 },
    { '購入番号': 'T04', '会員 ID': 'M1', date: 28, total: 250, amount: 5 },
    { '購入番号': 'T05', '会員 ID': 'M1', date: 21, total: 350, amount: 12 },
    { '購入番号': 'T06', '会員 ID': 'M2', date: 39, total: 820, amount: 2 },
  ];
  const details = [
    { '購入番号': 'T01', '商品コード': 'X02' }, { '購入番号': 'T02', '商品コード': 'X04' },
    { '購入番号': 'T03', '商品コード': 'X01' }, { '購入番号': 'T04', '商品コード': 'X01' },
    { '購入番号': 'T05', '商品コード': 'X04' }, { '購入番号': 'T06', '商品コード': 'X03' },
  ];
  for (const condition of cases) {
    const body = build(5, condition), text = stem(body);
    const filter = (/① 最新購入実績/.test(text) ? 'latest' : /① 最古購入実績/.test(text) ? 'earliest' :
      /① 最高額購入実績/.test(text) ? 'highest' : 'lowest');
    const records = purchased.filter(row => row['会員 ID'] === 'M1');
    const best = records.reduce((current, next) => {
      const improve = {latest: next.date > current.date, earliest: next.date < current.date,
        highest: next.total > current.total, lowest: next.total < current.total};
      return improve[filter] ? next : current;
    });
    const detail = details.find(row => row['購入番号'] === best['購入番号'])!;
    const matched = products.find(row => row['商品コード'] === detail['商品コード'])!;
    const visible = products.filter(item => item['商品カテゴリ'] === matched['商品カテゴリ']);
    verify(body, 0, option => {
      const [join, category] = option.split('／') as [keyof typeof matched, keyof typeof matched];
      if (!(join in detail)) return false;
      const selected = products.filter(product =>
        product[join] === detail[join as keyof typeof detail]).map(product => product[category]);
      const output = products.filter(product => selected.includes(product['商品カテゴリ']));
      return JSON.stringify(output) === JSON.stringify(visible);
    });
    verify(body, 1, option => {
      const compare = option.includes('新しい') ? (x: typeof best) => x.date - 50 :
        option.includes('古い') ? (x: typeof best) => -x.date :
        option.includes('大きい') ? (x: typeof best) => x.total :
        option.includes('小さい') ? (x: typeof best) => -x.total : (x: typeof best) => x.amount;
      return [...records].sort((a, b) => compare(b) - compare(a))[0] === best;
    });
    const registry: Record<string, readonly Record<string, string | number>[]> = {'商品表': products, '購入表': purchased, '購入明細表': details};
    const candidates = [values(body, 2), values(body, 3), values(body, 4)];
    const truth = products.map(p => records.some(r => details.some(d => r['購入番号'] === d['購入番号'] && d['商品コード'] === p['商品コード'])));
    const matches: string[][] = [];
    for (const b of candidates[0]) for (const c of candidates[1]) for (const d of candidates[2]) {
      if ([...registry[b]].some(row => !('商品コード' in row) || !(c in row)) ||
          [...registry[d]].some(row => !('会員 ID' in row) || !(c in row))) continue;
      const actual = products.map(product => registry[b].some(detail => detail['商品コード'] === product['商品コード'] &&
        registry[d].some(record => record[c] === detail[c] && record['会員 ID'] === 'M1')));
      if (JSON.stringify(actual) === JSON.stringify(truth)) matches.push([b,c,d]);
    }
    assert.equal(matches.length, 1);
    for (let slot = 0; slot < 3; slot++) verify(body, slot + 2, option => option === matches[0][slot]);
    const reportExisting = text.includes('未購入商品');
    assert.equal(reportExisting, diagrams(body).at(-1)!.alt.includes('未購入商品'));
  }
});

test('8プロフィールの全20図をSSRし、参照と代替説明、キー下線と図中の記号を照合する', () => {
  let tested = 0;
  for (const {profile, component} of renderers) {
    const figure = figures.find(item => item.profile === profile);
    assert(figure);
    const [[first, last]] = figure.domain;
    assert.throws(() => figure.alt([last + 1]));
    for (let index = first; index <= last; index++) {
      const markup = renderToStaticMarkup(createElement(component, { caption: '採用図', values: [index] }));
      assert(markup.includes(figure.alt([index])));
      assert.match(markup, /aria-describedby=/);
      assert.match(markup, /tabindex="0"/i);
      assert(!markup.includes('NaN'));
      if (profile.endsWith('-schema')) assert.equal((markup.match(/text-decoration="underline"/g) ?? []).length, 5);
      if (profile.endsWith('-related')) assert.match(markup, /商品コードを突き合わせ.*>b<.*>d<|>b<.*>d<.*商品コードを突き合わせ/s);
      tested++;
    }
  }
  assert.equal(tested, 20);
});
