import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2010SpringPm01To04Definitions as definitions } from '../../../src/core/generators/legacy-2010-spring-pm-01-04';
import { legacy2010SpringPm0104Figures as figures } from '../../../src/core/generators/legacy-2010-spring-pm-01-04-figures';
import { legacy2010SpringPm0104FigureRenderers as renderers } from '../../../src/ui/Legacy2010SpringPm0104Figures';
import { spring2010Pm01To04Specs as specs } from '../../../scripts/legacy-2010-spring-pm-01-04-specs';

const official = [
  { marks: 'カエウイクウ', labels: ['設問1 a', '設問1 b', '設問1 c', '設問2 d', '設問2 e', '設問2 f'], counts: [6, 6, 6, 10, 10, 10] },
  { marks: 'オイウウ', labels: ['設問1', '設問2', '設問3', '設問4'], counts: [5, 5, 4, 4] },
  { marks: 'ウウカイイア', labels: ['設問1 a', '設問1 b', '設問1 c', '設問2', '設問3', '設問4'], counts: [4, 8, 8, 4, 4, 4] },
  { marks: 'ウウイイア', labels: ['設問1 a', '設問1 b', '設問2 c', '設問2 d', '設問2 e'], counts: [5, 5, 4, 5, 5] },
];
const cases = (question: number) => [0, 1, 2, 3].map(index => definitions[question - 1].build([index]));
const prose = (body: GeneratedBody) => body.prompt.filter(block => block.type === 'paragraph').map(block => block.text).join('\n');
function choiceText(block: Block) {
  assert(block.type === 'paragraph' || block.type === 'code');
  return block.text;
}
function part(body: GeneratedBody, index: number) {
  const slot = body.answerParts![index];
  const found = body.partAnswers!.find(answer => answer.kind === 'choice' && answer.partId === slot.id);
  assert(found?.kind === 'choice');
  return { label: slot.label, options: slot.choiceIds.map(id => body.choices[Number(id.slice('choice-value-'.length)) - 1][0]),
    correct: slot.choiceIds.indexOf(found.choiceId) };
}
function checks(body: GeneratedBody, slot: number, accepts: (option: Block) => boolean) {
  const { label, options, correct } = part(body, slot);
  assert.deepEqual(options.flatMap((option, index) => accepts(option) ? [index] : []), [correct], label);
}
function diagram(body: GeneratedBody, suffix: string) {
  const block = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith(suffix));
  assert(block?.type === 'diagram');
  return block;
}

test('原紙面20頁の公式21欄と全16条件・488選択肢の形、再現性、一意性を照合する', () => {
  assert.deepEqual(specs.flatMap(spec => spec.pages), Array.from({ length: 20 }, (_, i) => i + 5));
  assert.match(specs[0].originalPageAlt[5], /6問以上選択した場合には，はじめの5問/);
  for (const spec of specs) for (const page of spec.pages) {
    assert(spec.originalPageAlt[page].trim().length > 100, '原資料p.' + page + 'の代替説明');
  }
  const [head, ...choiceRows] = specs[0].originalPageAlt[11].split('\n');
  assert.match(head, /選択肢，ブロック番号，フラグの順/);
  assert.deepEqual(choiceRows, [...'アイウエオカキクケコ'].map((choice, i) =>
    '選択肢' + choice + 'はブロック番号' + (41 + Math.floor(i / 2)) + '，フラグ' + (i % 2) + '。'));
  let count = 0;
  for (const [question, def] of definitions.entries()) {
    const row = official[question], all = cases(question + 1), base = all[0];
    assert.equal(def.source, '2010h22h-fe-pm-' + (question + 1));
    assert.equal(def.version, '3.2.0');
    const fixedAssets = question === 0 ? ['asset-ipa-2010h22h-fe-pm-p003', 'asset-ipa-2010h22h-fe-pm-p004'] : [];
    assert.deepEqual(def.fixedReferenceAssetIds ?? [], fixedAssets);
    assert.deepEqual(def.reference, [0]);
    assert.deepEqual(base.answerParts?.map(slot => slot.label), row.labels);
    assert.equal(row.marks, base.answerParts!.map((_, i) => 'アイウエオカキクケコ'[part(base, i).correct]).join(''));
    const signatures = new Set<string>();
    for (const [index, body] of all.entries()) {
      assert.deepEqual(body, def.build([index]));
      assert.deepEqual(body.prompt.map(block => block.type), base.prompt.map(block => block.type));
      const actualAssets = body.contexts?.flatMap(context => context.blocks.flatMap(block =>
        block.type === 'image' ? [block.assetId] : [])) ?? [];
      assert.deepEqual(actualAssets, fixedAssets);
      assert.equal(body.answerParts?.length, row.labels.length);
      assert.equal(body.partAnswers?.length, row.labels.length);
      for (const [i, expectedCount] of row.counts.entries()) {
        const parsed = part(body, i);
        assert.equal(parsed.options.length, expectedCount);
        assert.equal(new Set(parsed.options.map(option => JSON.stringify(option))).size, expectedCount);
        assert(parsed.correct >= 0);
        count += expectedCount;
      }
      assert(body.explanation.length > 130);
      signatures.add(JSON.stringify(body.prompt));
    }
    assert.equal(signatures.size, 4);
    for (const bad of [[-1], [4], [0.5], [NaN], [], [0, 1]]) assert.throws(() => def.build(bad));
  }
  assert.equal(count, 488);
});

type Snapshot = (string | number)[][];
function cacheReference(body: GeneratedBody, updateHit: boolean) {
  const program = body.prompt.find(block => block.type === 'table' && block.caption.startsWith('表1　プログラム'));
  assert(program?.type === 'table');
  const slots = new Map<number, { slot: number; dirty: boolean }>();
  const oldestFirst: number[] = [], history: Snapshot[] = [], writebacks: number[] = [];
  const work = [...program.rows, ...program.rows.slice(2)];
  for (const [step, [address, command, , stated]] of work.entries()) {
    const memory = command.match(/^(LOAD|ADD|STORE)\s+R[123],(\d+)(,R2)?$/);
    if (memory) {
      const offset: number = memory[3] ? (step < program.rows.length ? 99 : 98) : 0;
      const block: number = Math.floor((Number(memory[2]) + offset) / 100) + 1;
      assert.equal(String(block), stated, address);
      if (slots.has(block)) {
        if (updateHit) { oldestFirst.splice(oldestFirst.indexOf(block), 1); oldestFirst.push(block); }
      } else {
        let slot = [0, 1, 2].find(i => ![...slots.values()].some(item => item.slot === i));
        if (slot === undefined) {
          const removed = oldestFirst.shift()!, entry = slots.get(removed)!;
          if (entry.dirty) writebacks.push(removed);
          slot = entry.slot; slots.delete(removed);
        }
        slots.set(block, { slot, dirty: false }); oldestFirst.push(block);
      }
      if (memory[1] === 'STORE') slots.get(block)!.dirty = true;
    } else assert(address === '1007' && command.startsWith('ADDR') || address === '1008' && command.startsWith('JNM'));
    const records = Array.from({ length: 3 }, () => [0, 0, 0]);
    for (const [block, { slot, dirty }] of slots) records[slot] = [block, 1 + oldestFirst.indexOf(block), Number(dirty)];
    history.push(records);
  }
  return { history, writebacks };
}
test('問1は独立のブロック順リストからFIFO/LRUの全参照、可視セル、フラグと全候補を検算する', () => {
  const snapshotPositions = [[0, 0], [6, 0], [6, 2]], timelinePositions = [[6, 1], [9, 2], [10, 0]];
  for (const [condition, body] of cases(1).entries()) {
    const { history: fifo, writebacks } = cacheReference(body, false);
    const { history: lru } = cacheReference(body, true);
    if (condition === 0) assert.deepEqual(writebacks, [41, 44, 41]);
    snapshotPositions.forEach(([step, slot], field) => checks(body, field, block => +choiceText(block) === fifo[step][slot][0]));
    timelinePositions.forEach(([step, slot], field) => checks(body, field + 3, block => {
      assert(block.type === 'table');
      return Number(block.rows[0][0]) === lru[step][slot][0] && Number(block.rows[0][1]) === lru[step][slot][2];
    }));
    const masks = [/^\d｜［a］/, /^\d｜［[bc]］/];
    for (const [i, suffix] of ['cache-after-load', 'cache-after-store'].entries()) {
      const lines = diagram(body, suffix).alt.split('\n').slice(1);
      assert.equal(lines.length, 3);
      lines.forEach((line, slot) => {
        const [block, rank, flag] = fifo[i === 0 ? 0 : 6][slot];
        const expected = (slot + 1) + '｜' + block + '｜' + rank + '｜' + flag;
        assert.equal(line.replace(masks[i], (slot + 1) + '｜' + block), expected);
      });
    }
    const table = diagram(body, 'cache-timeline').alt.split('\n').filter(line => /^\d{4}｜/.test(line));
    assert.equal(table.length, 16);
    table.slice(0, 6).forEach((line, step) => assert.deepEqual(line.split('｜').slice(1), lru[step].map(([block, , flag]) => block + '，' + flag)));
    assert.match(table[6], /［d］/); assert.match(table[9], /［e］/); assert.match(table[10], /［f］/);
    const text = prose(body);
    assert.match(text, /バッファの中で最も番号が小さい/);
    assert.match(text, /フラグの内容が1だったとき.*主記憶に書き戻/);
    assert.match(text, /キャッシュ内にデータが入っていない/);
  }
});

const weight: Record<string, number> = { op: 1, op1: 1, op2: 2, '＋': 1, '×': 2 };
function referencePostfix(expr: string) {
  const result: string[] = [], held: string[] = [];
  for (const token of expr.match(/op[12]?|[a-e()＋×]/g)!) {
    if (/^[a-e]$/.test(token)) result.push(token);
    else if (token === '(') held.push(token);
    else if (token === ')') {
      while (held.length && held.at(-1) !== '(') result.push(held.pop()!);
      assert.equal(held.pop(), '(');
    } else {
      while (held.length && (weight[held.at(-1)!] ?? 0) >= weight[token]) result.push(held.pop()!);
      held.push(token);
    }
  }
  return [...result, ...held.reverse()].join(' ');
}
function treePostfix(expr: string) {
  const tokens = expr.match(/op[12]?|[a-e(),]/g)!, output: string[] = [];
  let at = 0;
  function walk() {
    const token = tokens[at++];
    if (/^[a-e]$/.test(token)) { output.push(token); return; }
    assert(token in weight); assert.equal(tokens[at++], '(');
    walk(); assert.equal(tokens[at++], ','); walk(); assert.equal(tokens[at++], ')');
    output.push(token);
  }
  walk(); assert.equal(at, tokens.length);
  return output.join(' ');
}
function symbolicStack(sequence: string) {
  const stack: string[] = [];
  for (const command of sequence.split(' → ')) {
    const pushed = command.match(/^push\(([a-e])\)$/);
    if (pushed) { stack.push(pushed[1]); continue; }
    if (stack.length < 2) return null;
    const right = stack.pop()!, left = stack.pop()!;
    assert(command === 'add' || command === 'mul');
    stack.push(left + ' ' + right + ' ' + (command === 'add' ? '＋' : '×'));
  }
  return stack.length === 1 ? stack[0] : null;
}
test('問2は独立の演算子スタックで構文規則を解釈し、構文木・後置表記・操作列の全候補を比較する', () => {
  for (const body of cases(2)) {
    const text = prose(body);
    const expression = [...text.matchAll(/^式：　(.+)$/gm)].map(match => match[1]);
    assert.equal(expression.length, 2);
    expression.forEach((input, slot) => checks(body, slot, block => {
      assert(block.type === 'diagram');
      return treePostfix(block.alt) === referencePostfix(input);
    }));
    const post = text.match(/後置表記法を用いて式 (.+) を表現すると/)![1];
    checks(body, 2, block => choiceText(block) === referencePostfix(post));
    const stack = text.match(/式 (.+) を後置表記法に変換して評価/)![1];
    checks(body, 3, block => symbolicStack(choiceText(block)) === referencePostfix(stack));
    const grammar = body.prompt.find(block => block.type === 'code');
    assert(grammar?.type === 'code');
    assert.match(grammar.text, /式　 → 項 ｜ 式 op1 項\n.*項　 → 因子 ｜ 項 op2 因子/);
    assert.match(text, /左から右に式を評価する/);
  }
});

function query(sql: string, option: string, db: DatabaseSync) {
  // = ANY on these non-NULL scalar fields is equivalent to IN, available in SQLite.
  const statement = sql.replace('［空欄］', option).replace(/= ANY\(/g, 'IN(');
  try { return db.prepare(statement).all().map(row => Object.values(row)); }
  catch { return null; }
}
test('問3は主キーの候補を照合し、年度・教員・同名生徒が交差する実DBで全SQL択を判定する', () => {
  for (const body of cases(3)) {
    const text = prose(body), terms = +text.match(/1年度が(\d)期/)![1], subjects = +text.match(/の(\d)科目である/)![1];
    const examsPerTerm = text.includes('初回試験，中間試験及び期末試験') ? 3 : 2;
    checks(body, 0, block => choiceText(block) === '試験科目の増減');
    checks(body, 1, block => +choiceText(block) === terms * examsPerTerm);
    checks(body, 2, block => +choiceText(block) === terms * examsPerTerm * subjects);
    const [, ys, gs, exam] = text.match(/設問2　(\d{4})年度(\d)学年の(.+?)試験を対象に/)!, totalYear = +ys, totalGrade = +gs;
    const [, ym, gm] = text.match(/設問3　(\d{4})年度(\d)学年を対象に/)!, meanYear = +ym, meanGrade = +gm;
    const name = text.match(/設問4　生徒“([^”]+)”/)![1];
    const db = new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 生徒表(生徒番号 INTEGER PRIMARY KEY, 氏名 TEXT NOT NULL);' +
        'CREATE TABLE 履歴表(生徒番号 INTEGER, 年度 INTEGER, 学年 INTEGER, クラス TEXT, 教員番号 INTEGER, PRIMARY KEY(生徒番号,年度));' +
        'CREATE TABLE 教員表(教員番号 INTEGER PRIMARY KEY, 氏名 TEXT NOT NULL);' +
        'CREATE TABLE 試験表(試験ID INTEGER PRIMARY KEY, 試験名 TEXT NOT NULL);' +
        'CREATE TABLE 成績表(生徒番号 INTEGER, 年度 INTEGER, 試験ID INTEGER, 国語 INTEGER, 数学 INTEGER, 英語 INTEGER, 理科 INTEGER, 社会 INTEGER,' +
        ' PRIMARY KEY(生徒番号,年度,試験ID));');
      const pupils = new Map([[1, '別人0'], [10, name], [20, name], [30, '別人1'], [40, '別人2']]);
      const staff = new Map([[51, '担任甲'], [52, '担任乙'], [53, '担任外']]);
      const exams = new Map([[101, exam], [102, '別の試験']]);
      for (const [id, person] of pupils) db.prepare('INSERT INTO 生徒表 VALUES (?,?)').run(id, person);
      for (const [id, person] of staff) db.prepare('INSERT INTO 教員表 VALUES (?,?)').run(id, person);
      for (const [id, label] of exams) db.prepare('INSERT INTO 試験表 VALUES (?,?)').run(id, label);
      const records: { id: number; year: number; grade: number; className: string; teacher: number }[] = [];
      const scores: { id: number; year: number; examId: number; marks: number[] }[] = [];
      for (const [year, requestedGrade] of [[totalYear, totalGrade], [meanYear, meanGrade]]) {
        for (const id of [10, 20, 30, 40]) {
          if (year === totalYear && id === 20) continue;
          const grade = id === 40 ? requestedGrade % 3 + 1 : requestedGrade;
          const className = id === 20 ? 'B' : id === 40 ? 'C' : 'A';
          const teacher = id === 20 ? 52 : id === 40 ? 53 : 51;
          records.push({ id, year, grade, className, teacher });
          db.prepare('INSERT INTO 履歴表 VALUES (?,?,?,?,?)').run(id, year, grade, className, teacher);
          for (const examId of [101, 102]) {
            const marks = [0, 1, 2, 3, 4].map((_, s) => id + (year === totalYear ? 3 : 11) + (examId - 100) * 5 + s * 2);
            scores.push({ id, year, examId, marks });
            db.prepare('INSERT INTO 成績表 VALUES (?,?,?,?,?,?,?,?)').run(id, year, examId, ...marks);
          }
        }
      }
      const totals = records.filter(row => row.year === totalYear && row.grade === totalGrade).map(row => {
        const entry = scores.find(score => score.year === row.year && score.id === row.id && score.examId === 101)!;
        return [pupils.get(row.id), row.className, entry.marks.reduce((a, b) => a + b, 0)] as const;
      }).sort((a, b) => b[2] - a[2]);
      const byClass = new Map<string, { teacher: string; scores: number[][] }>();
      for (const row of records.filter(row => row.year === meanYear && row.grade === meanGrade)) {
        if (!byClass.has(row.className)) byClass.set(row.className, { teacher: staff.get(row.teacher)!, scores: [] });
        byClass.get(row.className)!.scores.push(...scores.filter(score => score.id === row.id && score.year === row.year).map(row => row.marks));
      }
      const means = [...byClass].sort(([a], [b]) => a.localeCompare(b)).map(([name, group]) =>
        [name, group.teacher, ...Array.from({ length: 5 }, (_, i) => group.scores.reduce((sum, marks) => sum + marks[i], 0) / group.scores.length)]);
      const named = scores.filter(row => pupils.get(row.id) === name)
        .sort((a, b) => a.id - b.id || a.year - b.year || a.examId - b.examId)
        .map(row => [row.id, row.year, exams.get(row.examId), ...row.marks]);
      assert.equal(new Set(named.map(row => row[0])).size, 2);
      const queries = body.prompt.filter(block => block.type === 'code' && block.text.includes('［空欄］'));
      assert.equal(queries.length, 3);
      [totals, means, named].forEach((expected, i) => checks(body, i + 3, option =>
        JSON.stringify(query(choiceText(queries[i]), choiceText(option), db)) === JSON.stringify(expected)));
    } finally { db.close(); }
  }
});

function waitChance(n: number, traffic: number) {
  // Direct Erlang C normalization with terms a^k/k!, independent of the table lookup.
  let term = 1, mass = 1;
  for (let k = 1; k < n; k++) { term *= traffic / k; mass += term; }
  const waitingTail = term * traffic / n / (1 - traffic / n);
  return 100 * waitingTail / (mass + waitingTail);
}
test('問4はビット換算、原表77セル、最小同時数と待ち確率を待ち行列の独立計算で検証する', () => {
  for (const body of cases(4)) {
    const requirements = diagram(body, 'requirements').alt.split('\n').map(row => row.split('｜')[1]);
    const [rate, arrivals, duration, stored, allowed] = requirements.map(value => parseFloat(value.replaceAll(',', '')));
    const observed = +prose(body).match(/仮に，サーバが(\d+)本/)![1];
    const traffic = arrivals * duration;
    const bitsPerVideo = Math.round(rate * 1_000_000) * duration * 60;
    checks(body, 0, block => +choiceText(block) * 1e9 * 8 === bitsPerVideo * stored);
    checks(body, 1, block => Math.abs(+choiceText(block) - rate * traffic) < 1e-10);
    checks(body, 2, block => choiceText(block) === '1分当たりの動画の延べ再生時間');
    const lines = diagram(body, '-queue').alt.split('\n').slice(1).map(line => line.split('｜'));
    const probabilities = lines[0].slice(1).map(Number), values = lines.slice(1).map(line => line.map(Number));
    assert.equal(values.length, 7);
    for (const [n, ...row] of values) {
      assert.equal(row.length, 11);
      row.forEach((traffic, j) => {
        // Printed 65.1 (n=72, P=30%) differs by 0.062 from this analytic model.
        // It is preserved, and none of the four conditions depend on this cell.
        const tolerance = n === 72 && probabilities[j] === 30 ? 0.065 : 0.051;
        assert(waitChance(n, traffic - tolerance) <= probabilities[j] && waitChance(n, traffic + tolerance) >= probabilities[j],
          [n, probabilities[j], traffic].join(' / '));
      });
    }
    const thresholdColumn = 1 + probabilities.indexOf(allowed);
    const tableMinimum = values.find(row => row[thresholdColumn] >= traffic)![0];
    checks(body, 3, block => {
      const n = +choiceText(block);
      return n === tableMinimum && waitChance(n, traffic) <= allowed && waitChance(n - 1, traffic) > allowed;
    });
    const row = values.find(row => row[0] === observed)!;
    const approximate = probabilities[row.indexOf(traffic) - 1];
    const actual = waitChance(observed, traffic);
    const candidates = part(body, 4).options.map(block => +choiceText(block));
    const minDistance = Math.min(...candidates.map(value => Math.abs(value - actual)));
    checks(body, 4, block => +choiceText(block) === approximate && Math.abs(+choiceText(block) - actual) === minDistance);
    assert.match(diagram(body, 'requirements').alt, /再生時間は指数分布に従い.*再生時間と送信時間は等しい/);
    assert.match(prose(body), /回線容量は十分にあり，通信の遅延はない/);
  }
});

test('全13図プロフィールの40状態を実レンダラーで描き、SVGのタイトル・代替説明・構成要素を照合する', () => {
  const seen = new Set<string>();
  for (const definition of definitions) for (let index = 0; index < 4; index++) {
    const body = definition.build([index]);
    for (const block of [...body.prompt, ...body.choices.flat()]) {
      if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
      const { profile, values } = block.scene, key = profile + ':' + values;
      if (seen.has(key)) continue;
      seen.add(key);
      const figure = figures.find(item => item.profile === profile), renderer = renderers.find(item => item.profile === profile);
      assert(figure && renderer); figure.validate(values); assert.equal(figure.alt(values), block.alt);
      const html = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
      const titleId = html.match(/aria-labelledby="([^"]+)"/)?.[1], descId = html.match(/aria-describedby="([^"]+)"/)?.[1];
      assert(titleId && descId && html.includes('<title id="' + titleId + '"') && html.includes('<desc id="' + descId + '"'));
      assert.match(html, /role="img"/); assert.match(html, /tabindex="0"/); assert.match(html, /var\(--diagram-ink\)/);
      if (profile.endsWith('cache-timeline')) assert.equal([...html.matchAll(/data-cache-blank="[def]"/g)].length, 3);
      if (profile.endsWith('-queue')) assert.equal([...html.matchAll(/data-traffic=/g)].length, 77);
      if (profile.endsWith('-database')) assert.equal([...html.matchAll(/data-primary-key="true"/g)].length, 4);
      for (const bad of [[-1], [100], [0, 0], [], [NaN]]) assert.throws(() => figure.validate(bad));
    }
  }
  assert.equal(figures.length, 13); assert.equal(renderers.length, 13); assert.equal(seen.size, 40);
});
