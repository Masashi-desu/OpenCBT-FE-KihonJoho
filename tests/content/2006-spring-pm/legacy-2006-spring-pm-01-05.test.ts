import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2006SpringPm01To05Definitions as definitions } from '../../../src/core/generators/legacy-2006-spring-pm-01-05';
import { legacy2006SpringPm0105Figures as figures } from '../../../src/core/generators/legacy-2006-spring-pm-01-05-figures';
import { legacy2006SpringPm0105FigureRenderers as renderers } from '../../../src/ui/Legacy2006SpringPm0105Figures';
import { spring2006Pm01To05Specs as specs } from '../../../scripts/legacy-2006-spring-pm-01-05-specs';

const [query, otp, campaign] = definitions;
const variants = [0, 1, 2, 3];
const symbols = 'アイウエオカキクケコ';
type Part = NonNullable<GeneratedBody['answerParts']>[number];

function textOf(block: Block): string {
  if (block.type !== 'paragraph' && block.type !== 'code') throw Error('期待した本文又は解答候補ではない');
  return block.text;
}
function bankOf(body: GeneratedBody, part: Part): string[] {
  return part.choiceIds.map(id => textOf(body.choices[Number(id.slice('choice-value-'.length)) - 1][0]));
}
function field(body: GeneratedBody, name: string): Part {
  const part = body.answerParts?.find(item => item.id === 'part-' + name);
  assert(part);
  return part;
}
function marked(body: GeneratedBody, name: string) {
  const part = field(body, name);
  const answer = body.partAnswers?.find(item => item.kind === 'choice' && item.partId === part.id);
  assert(answer?.kind === 'choice');
  return part.choiceIds.indexOf(answer.choiceId);
}
function markText(body: GeneratedBody, name: string) {
  return bankOf(body, field(body, name))[marked(body, name)];
}
function tablesOf(body: GeneratedBody) {
  return body.prompt.filter(block => block.type === 'table');
}
function paragraphOf(body: GeneratedBody) {
  return body.prompt.filter(block => block.type === 'paragraph').map(block => block.text).join('\n');
}

test('原紙と解答例のページ境界・元の解答群・チェックリストと順不同欄の区別を保持する', () => {
  assert.deepEqual(specs.map(spec => spec.number), [1, 2, 5]);
  assert.deepEqual(specs.map(spec => spec.pages), [[6, 7, 8], [9, 10, 11], [21, 22, 23, 24]]);
  for (const spec of specs) {
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number), spec.pages);
    assert(spec.pages.every(page => spec.originalPageAlt[page].length > 100));
  }
  assert.match(specs[0].originalPageAlt[6], /全問解答してください/);
  assert.match(specs[0].originalPageAlt[7], /SELECT 年齢 FROM 家族表/);
  assert.match(specs[0].originalPageAlt[8], /NOT EXISTS/);
  assert.match(specs[1].originalPageAlt[9], /hash をKからn回適用/);
  assert.match(specs[1].originalPageAlt[10], /上から下に向かって進む/);
  assert.match(specs[2].originalPageAlt[21], /同じ顧客番号のレコードが複数存在することはない/);
  assert.match(specs[2].originalPageAlt[22], /二つ選べ/);
  assert.match(specs[2].originalPageAlt[23], /どれか一つだけが成立/);
  assert.match(specs[2].originalPageAlt[24], /どちらもキャンペーン対象期間内/);
  const verifiedKeys = specs.map(spec => spec.original.partAnswers!.map(answer => {
    if (answer.kind === 'choice') return symbols[spec.original.answerParts!.find(part => part.id === answer.partId)!.choiceIds.indexOf(answer.choiceId)];
    assert.equal(answer.kind, 'unordered');
    const group = spec.original.answerParts!.find(part => part.id === answer.partIds[0])!.choiceIds;
    return answer.choiceIds.map(id => symbols[group.indexOf(id)]).join('');
  }));
  assert.deepEqual(verifiedKeys, [['カ','イ','ア','エ'], ['カ','ア','イ'], ['イカ','イケ','イ','ウ']]);
  assert.deepEqual(specs[2].original.partAnswers!.map(answer =>
    answer.kind === 'unordered' ? [answer.presentation, answer.partIds] : [answer.kind, answer.partId]),
  [['checklist', ['part-s1-1','part-s1-2']], [undefined, ['part-a','part-b']], ['choice','part-c'], ['choice','part-d']]);
});

test('全入力域で候補数・順序制約・解答欄が成立し，正答参照と本文の変化を再現する', () => {
  const expectedBankLengths = [[6,6,2,4],[7,7,7],[7,7,9,9,4,4]];
  definitions.forEach((definition, index) => {
    const different = new Set<string>();
    for (const variant of variants) {
      const body = definition.build([variant]);
      assert.deepEqual(definition.build([variant]), body);
      assert.deepEqual(body.answerParts!.map(part => part.choiceIds.length), expectedBankLengths[index]);
      different.add(JSON.stringify(body.prompt));
      for (const part of body.answerParts!) assert.equal(new Set(bankOf(body, part)).size, part.choiceIds.length);
      for (const answer of body.partAnswers!) {
        if (answer.kind === 'choice') assert(body.answerParts!.find(part => part.id === answer.partId)?.choiceIds.includes(answer.choiceId));
        if (answer.kind === 'unordered') {
          assert.equal(new Set(answer.choiceIds).size, answer.partIds.length);
          for (const partId of answer.partIds) assert(answer.choiceIds.every(id => body.answerParts!.find(part => part.id === partId)?.choiceIds.includes(id)));
        }
      }
    }
    assert.equal(different.size, variants.length);
    for (const invalid of [[-1], [4], [1.25], [], [0, 1], new Array(1)]) assert.throws(() => definition.build(invalid), /PARAMETER_CONSTRAINT/);
  });
});

test('問1の表示データ・SQL文を実SQLiteで実行し，全候補と空集合の扱いを別解で照合する', () => {
  const sqlResults = new Set<string>();
  for (const variant of variants) {
    const body = query.build([variant]);
    const [employees, family] = tablesOf(body);
    assert.deepEqual([employees.rows.length, family.rows.length], [7,14]);
    const statements = body.prompt.filter(block => block.type === 'code').map(block => block.text);
    assert.equal(statements.length, 5);
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 社員表(社員ID TEXT PRIMARY KEY, 氏名 TEXT, 年齢 INTEGER); CREATE TABLE 家族表(社員ID TEXT, 家族氏名 TEXT, 年齢 INTEGER, 続柄 TEXT)');
      const addEmployee = db.prepare('INSERT INTO 社員表 VALUES(?,?,?)');
      const addFamily = db.prepare('INSERT INTO 家族表 VALUES(?,?,?,?)');
      employees.rows.forEach(([id, name, age]) => addEmployee.run(id, name, Number(age)));
      family.rows.forEach(([id, name, age, relation]) => addFamily.run(id, name, Number(age), relation));
      const ids = (sql: string) => db.prepare(sql).all().map(row => String(row.社員ID)).sort();
      for (const [i, partName] of ['a','b'].entries()) {
        const result = ids(statements[i]);
        const candidates = bankOf(body, field(body, partName));
        const match = result.length ? result.join('\n') : '問合せ結果0件';
        assert.deepEqual(candidates.flatMap((choice,n) => choice === match ? [n] : []), [marked(body, partName)]);
        assert(body.explanation.includes(result.length ? result.join('、') : '0件'));
        sqlResults.add(result.join(','));
      }
      const all = employees.rows.filter(([id,,age]) =>
        family.rows.every(([relativeId,,relativeAge]) => relativeId !== id || Number(age) < Number(relativeAge)))
        .map(([id]) => id).sort();
      assert.match(statements[3], /年齢 < ALL/);
      const onlyByAll = all.filter(id => !ids(statements[2]).includes(id));
      assert.deepEqual(onlyByAll, ['S048','S052']);
      for (const [index, label] of bankOf(body, field(body, 'c')).entries()) {
        const expected = employees.rows.filter(([id]) => {
          const exists = family.rows.some(([relativeId]) => relativeId === id);
          return label === '家族がいる' ? exists : !exists;
        }).map(([id]) => id).sort();
        assert.equal(JSON.stringify(expected) === JSON.stringify(onlyByAll), index === marked(body, 'c'));
      }
      for (const [index, condition] of bankOf(body, field(body, 'd')).entries()) {
        const result = ids(statements[4].replace('［d］', condition));
        assert.equal(JSON.stringify(result) === JSON.stringify(onlyByAll), index === marked(body, 'd'));
      }
    } finally { db.close(); }
  }
  assert.equal(sqlResults.size, 5);
});

test('問2の図・計算式・検査手順を独立ハッシュ鎖で検算し，各情報を全7候補と比較する', () => {
  const hash = (value: Buffer) => createHash('sha256').update(value).digest();
  const apply = (value: Buffer, repetitions: number) => Array.from({length: repetitions}).reduce<Buffer>(input => hash(input), value);
  const actors = new Map<string, readonly string[]>([
    ['hash', ['server','generator']], ['K', ['user']], ['M', ['generation-limit']], ['n', ['remaining-logins']],
    ['otp(M＋1)', ['initial-verifier']], ['otp(n)', ['client-input', 'wire', 'current-password']], ['利用者ID', ['client-input','wire','identity']],
  ]);
  for (const variant of variants) {
    const body = otp.build([variant]), formula = body.prompt.find(block => block.type === 'formula');
    assert(formula?.format === 'unicode');
    const stem = paragraphOf(body);
    const steps = Number(stem.match(/に，hash を(\d)回適用/)?.[1]);
    assert.equal(steps, variant + 1);
    assert.equal(formula.text, 'otp(n)＝hash(hash(…hash(K)…))　［hash を' + (steps === 1 ? 'n' : steps + '×n') + '回適用］');
    assert(formula.alt.includes(steps === 1 ? 'n回' : steps + '×n回'));
    assert(stem.includes('otp(n＋1)') && stem.includes('次回のパスワード検査用に保持する'));
    assert(body.explanation.includes('hash を'+steps+'回適用'));
    for (const secret of ['k-112', 'k-9', 'k-b2']) {
      for (const maximum of [1,2,7]) {
        const initial = Buffer.from(secret);
        let verifier = apply(initial, steps * (maximum + 1));
        for (let n = maximum; n > 0; n--) {
          const offered = apply(initial, steps*n);
          assert(apply(offered, steps).equals(verifier));
          verifier = offered;
          assert(!apply(offered, steps).equals(verifier), 'ログイン直後の再利用は拒否される');
          assert(!apply(Buffer.from('bad candidate ' + n), steps).equals(verifier));
        }
      }
    }
    const fits = [
      (where: readonly string[]) => where.includes('client-input') && where.includes('wire') && where.includes('current-password'),
      (where: readonly string[]) => where.includes('server') && where.includes('generator'),
      (where: readonly string[]) => where.length === 1 && where[0] === 'user',
    ];
    ['a','b','c'].forEach((partName, index) => {
      const candidates = bankOf(body, field(body, partName));
      assert.deepEqual(new Set(candidates), new Set(actors.keys()));
      const matched = candidates.flatMap((choice, choiceIndex) => fits[index](actors.get(choice)!) ? [choiceIndex] : []);
      assert.deepEqual(matched, [marked(body, partName)]);
    });
  }
});

function tallyBranches(sales: readonly string[], applicants: readonly string[]) {
  const operations = new Set<string>();
  let s = 0, a = 0;
  while (s < sales.length && a < applicants.length) {
    const order = sales[s].localeCompare(applicants[a], 'en');
    if (order === 0) { operations.add('合'); ++s; ++a; }
    else if (order < 0) { operations.add('A'); ++s; }
    else { operations.add('B'); ++a; }
  }
  return operations;
}

test('問5の前処理・終了条件を全択査読し，テストデータの全入力対で突合せを検算する', () => {
  const candidateTruth = new Map<string, boolean>([
    ['応募者のレコードの抽出', false], ['キャンペーン対象期間のレコードの抽出', true],
    ['購入金額をキーとする整列', false], ['購入数量が正数であるレコードの抽出', false], ['購入日付をキーとする整列', false],
    ['顧客番号をキーとする整列', true], ['商品コードをキーとする整列', false],
  ]);
  const filesEndingTheMerge = new Set(['応募者ファイルが終わる','中間ファイルが終わる']);
  const responseSignatures = new Set<string>();
  for (const variant of variants) {
    const body = campaign.build([variant]);
    const stem = paragraphOf(body);
    const limit = Number(stem.match(/購入金額が([\d,]+)円以上/)?.[1].replaceAll(',', ''));
    assert(Number.isInteger(limit) && body.explanation.includes(limit.toLocaleString('en-US')+'円以上'));
    const [plan, sales, applicantTable] = tablesOf(body);
    assert.equal(plan.rows[1][1], '［a］又は［b］まで');
    assert.deepEqual(plan.rows.slice(2,5).map(row => row[2]), ['中間ファイルを読む。','あて先編集，処理C，処理Dを実行する。','応募者ファイルを読む。']);
    assert(sales.rows.every(row => Number(row[5]) >= limit));
    assert.deepEqual(sales.rows.map(row => row[2]), ['［c］','［d］']);
    assert(stem.includes('どちらもキャンペーン対象期間内'));
    const parts = body.partAnswers!;
    const [checklist, unordered] = parts.slice(0,2);
    assert(checklist.kind === 'unordered' && checklist.presentation === 'checklist');
    assert(unordered.kind === 'unordered' && unordered.presentation === undefined);
    const preBank = bankOf(body, field(body, 's1-1')), endBank = bankOf(body, field(body, 'a'));
    const selected = (answer: typeof checklist, partName: string) => answer.choiceIds.map(id => {
      const part = field(body, partName);
      return bankOf(body, part)[part.choiceIds.indexOf(id)];
    });
    assert.deepEqual(new Set(preBank), new Set(candidateTruth.keys()));
    assert.deepEqual(new Set(selected(checklist, 's1-1')), new Set(preBank.filter(choice => candidateTruth.get(choice))));
    assert.deepEqual(new Set(selected(unordered, 'a')), filesEndingTheMerge);
    assert.equal(endBank.filter(choice => filesEndingTheMerge.has(choice)).length, 2);

    const applicants = applicantTable.rows.map(row => row[1]);
    const c = bankOf(body, field(body,'c')), d = bankOf(body, field(body,'d'));
    assert.deepEqual(c, [...c].sort());
    assert.deepEqual(c, d);
    const possible = c.flatMap(one => d.flatMap(two => one <= two && tallyBranches([one,two], applicants).size === 3 ? [[one,two]] : []));
    assert.deepEqual(possible, [[markText(body, 'c'), markText(body, 'd')]]);
    responseSignatures.add(marked(body,'c')+':'+marked(body,'d'));
  }
  assert.equal(responseSignatures.size, 2);
  assert.deepEqual(tallyBranches([], ['410203']), new Set());
  assert.deepEqual(tallyBranches(['410203','410203'], ['410203']), new Set(['合']));
  assert.deepEqual(tallyBranches(['410203'], []), new Set());
});

test('図の再生成は台帳と一対一に対応し，タイトルと読み上げ説明をSVG内へ出す', () => {
  assert.equal(figures.length, 5);
  assert.deepEqual(renderers.map(renderer => renderer.profile).sort(), figures.map(figure => figure.profile).sort());
  for (const definition of definitions) for (const variant of variants) {
    const body = definition.build([variant]);
    const diagrams = body.prompt.filter(block => block.type === 'diagram');
    for (const block of diagrams) {
      assert.equal(block.scene.kind, 'source_figure');
      const { profile, values } = block.scene;
      const figure = figures.find(item => item.profile === profile);
      const renderer = renderers.find(item => item.profile === profile);
      assert(figure && renderer);
      assert.equal(block.alt, figure.alt(values));
      const svg = renderToStaticMarkup(createElement(renderer.component, {caption: block.caption, values}));
      for (const marker of ['<title','<desc','role="img"','aria-labelledby','aria-describedby','tabindex="0"']) assert(svg.includes(marker));
      assert(svg.includes(block.alt));
    }
  }
});
