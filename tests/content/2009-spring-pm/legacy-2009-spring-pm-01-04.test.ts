import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { displayedAnswerParts, gradeAnswer } from '../../../src/core/answers';
import type { Block, Question } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2009SpringPm01To04Definitions as definitions } from '../../../src/core/generators/legacy-2009-spring-pm-01-04';
import { legacy2009SpringPm0104Figures as figures } from '../../../src/core/generators/legacy-2009-spring-pm-01-04-figures';
import { legacy2009SpringPm0104FigureRenderers as renderers } from '../../../src/ui/Legacy2009SpringPm0104Figures';
import { spring2009Pm01To04Specs as specs } from '../../../scripts/legacy-2009-spring-pm-01-04-specs';
import official from '../../fixtures/legacy-2009-spring-pm-01-04-review.json';

const marks = 'アイウエオカキクケコ';
const cases = (number: number) => [0, 1, 2, 3].map(index => definitions.find(d => d.source.endsWith('-' + number))!.build([index]));
const paragraphs = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const textOf = (block: Block) => { assert(block.type === 'paragraph' || block.type === 'code'); return block.text; };
const tableOf = (block: Block) => { assert(block.type === 'table'); return block; };
const pictureOf = (block: Block) => { assert(block.type === 'diagram' && block.scene.kind === 'source_figure'); return block; };
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
function findFigure(body: GeneratedBody, suffix: string) {
  return pictureOf(body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' &&
    block.scene.profile.endsWith(suffix))!);
}

test('問1・3・4の公式14欄、原資料9頁、12条件と184候補を照合する', () => {
  assert.deepEqual(specs.map(spec => spec.number), [1, 3, 4]);
  assert.deepEqual(specs.map(spec => spec.pages), official.questions.map(question => question.pages));
  assert.match(specs[0].originalPageAlt[6], /6問以上選択した場合には，はじめの5問/);
  assert.match(specs[2].originalPageAlt[17], /解答群の中から二つ選べ/);
  for (const spec of specs) for (const page of spec.pages) assert(spec.originalPageAlt[page].length > 100);
  let count = 0;
  for (const [i, definition] of definitions.entries()) {
    const facts = official.questions[i], bodies = cases(facts.number), original = bodies[0];
    assert.equal(definition.source, official.collection + '-' + facts.number);
    assert.equal(definition.version, '3.2.0');
    assert.deepEqual(definition.reference, [0]);
    assert.equal(facts.keys, original.answerParts!.map((_, position) => marks[part(original, position).correct]).join(''));
    const uniqueSignatures = new Set<string>();
    for (const [index, body] of bodies.entries()) {
      assert.deepEqual(body, definition.build([index]));
      assert.deepEqual(body.answerParts!.map(slot => slot.label), facts.labels);
      assert.deepEqual(body.answerParts!.map(slot => slot.choiceIds.length), facts.counts);
      assert.deepEqual(body.prompt.map(block => block.type), original.prompt.map(block => block.type));
      const checklist = body.partAnswers!.flatMap(answer => answer.kind === 'unordered' && answer.presentation === 'checklist' ? answer.partIds : []);
      assert.deepEqual(checklist, 'checklist' in facts ? facts.checklist : []);
      assert(body.explanation.length > 100);
      const correctContent = body.answerParts!.map((_, position) => {
        const { options, correct } = part(body, position);
        assert.equal(new Set(options.map(option => JSON.stringify(option))).size, options.length);
        return options[correct];
      });
      uniqueSignatures.add(JSON.stringify(correctContent));
      count += body.choices.length;
    }
    assert.equal(uniqueSignatures.size, 4, definition.source);
    for (const invalid of [[-1], [4], [NaN], [0.5], [], [0, 0], Array<number>(1)]) assert.throws(() => definition.build(invalid), /PARAMETER_CONSTRAINT/);
  }
  assert.equal(count, 184);
});

function decode(symbols: string): number[] | null {
  const lengths: number[] = [];
  for (let index = 0; index < symbols.length;) {
    const stop = symbols.indexOf('0', index);
    if (stop < 0) return null;
    const width = stop - index + 2;
    const digits = symbols.slice(stop + 1, stop + 1 + width);
    if (digits.length !== width || width > 2 && digits.startsWith('0')) return null;
    let value = 0;
    for (const digit of digits) value = value * 2 + (digit === '1' ? 1 : 0);
    lengths.push(value);
    index = stop + width + 1;
  }
  return lengths;
}
const bitRows = (alt: string) => alt.match(/各行：([01／]+)/)![1].split('／');

test('問1は画素列・全符号候補・4枚の復号図を、区切り位置から復号する別解で確認する', () => {
  const baseline = cases(1)[0];
  const baselineEncoded = baseline.prompt.find(block => block.type === 'code');
  assert(baselineEncoded?.type === 'code');
  assert.equal(baselineEncoded.text, '000111011111111011111010');
  for (const body of cases(1)) {
    const prose = paragraphs(body);
    assert.match(prose, /左から右へ.*白を0，黒を1/);
    assert.match(prose, /先頭に0個の白/);
    assert.match(prose, /m≧2.*00.*01/);
    const exampleBits = bitRows(findFigure(body, 'bit-grid').alt).join('');
    assert.equal(exampleBits.length, 64);
    const lengths = (exampleBits.match(/0+|1+/g) ?? []).map(run => run.length);
    if (exampleBits.startsWith('1')) lengths.unshift(0);
    const table = tableOf(body.prompt.find(block => block.type === 'table')!);
    const first = Number(table.rows.find(row => row[2] === '［a］')![0]);
    const secondCode = table.rows.find(row => row[0] === '［b］')![2];
    const decodedSecond = decode(secondCode);
    assert.equal(decodedSecond?.length, 1);
    unique(body, 0, block => {
      const candidate = decode(textOf(block));
      return candidate?.length === 1 && candidate[0] === first;
    });
    unique(body, 1, block => Number(textOf(block)) === decodedSecond![0]);
    const encodedLength = lengths.reduce((bits, length) => {
      let width = 2;
      while (2 ** width <= length) width++;
      return bits + 2 * width - 1;
    }, 0);
    unique(body, 2, block => Number(textOf(block)) === encodedLength);
    const codes = body.prompt.filter(block => block.type === 'code');
    assert.equal(codes.length, 1);
    const decoded = decode(textOf(codes[0]));
    assert(decoded?.length && decoded.slice(1).every(length => length > 0));
    const pictured = decoded.flatMap((length, i) => Array.from({ length }, () => i % 2)).join('');
    unique(body, 3, block => bitRows(pictureOf(block).alt).join('') === pictured);
    assert.deepEqual(part(body, 3).options.map(block => bitRows(pictureOf(block).alt).length), [5, 5, 8, 8]);
    assert(body.explanation.includes('＝' + encodedLength + 'ビット'));
  }
});

test('問3は実データの多対多・正規化・抽出を関係モデルで構成し、全SQL候補を実行する', () => {
  for (const body of cases(3)) {
    unique(body, 0, option => {
      const text = pictureOf(option).alt;
      return /料理と商品の間を両方向矢印.*関連名は分量.*多対多/.test(text);
    });
    unique(body, 1, option => /商品とその分量という繰返しの要素を排除/.test(textOf(option)));
    const prompt = paragraphs(body);
    const ingredient = prompt.match(/来店客が“([^”]+)”を選択/)![1];
    assert.match(prompt, /4人分のレシピ/);
    assert.match(prompt, /使用する食材すべてについて在庫がある料理名だけ/);
    const inventory = tableOf(body.prompt.find(block => block.type === 'table' && block.caption.includes('変更した商品表'))!);
    assert.deepEqual(inventory.columns, ['商品ID（主キー）', '商品名', '種別', '在庫']);
    const goods = inventory.rows.filter(row => row[0] !== '⋮').map(([id, name, type, stock]) => ({ id, name, type, stock: Number(stock) }));
    const target = goods.find(good => good.name === ingredient && good.stock === 1);
    const present = goods.find(good => good.name !== ingredient && good.stock === 1);
    const absent = goods.find(good => good.stock === 0);
    assert(target && present && absent);
    const dishes = [
      { id: 'A', name: '在庫のある対象料理', goods: [target, present] },
      { id: 'B', name: '欠品のある対象料理', goods: [target, absent] },
      { id: 'C', name: '対象外の料理', goods: [present] },
      { id: 'D', name: '欠品のある対象外の料理', goods: [absent] },
    ];
    const sqlite = new DatabaseSync(':memory:');
    try {
      sqlite.exec('CREATE TABLE 料理表(料理ID TEXT PRIMARY KEY, 料理名 TEXT);' +
        'CREATE TABLE 商品表(商品ID TEXT PRIMARY KEY, 商品名 TEXT, 種別 TEXT, 在庫 INT);' +
        'CREATE TABLE 分量表(料理ID TEXT NOT NULL, 商品ID TEXT NOT NULL, PRIMARY KEY(料理ID, 商品ID));');
      const insertRecipe = sqlite.prepare('INSERT INTO 料理表 VALUES (?, ?)');
      const insertIngredient = sqlite.prepare('INSERT INTO 商品表 VALUES (?, ?, ?, ?)');
      const insertQuantity = sqlite.prepare('INSERT INTO 分量表 VALUES (?, ?)');
      for (const good of goods) insertIngredient.run(good.id, good.name, good.type, good.stock);
      for (const dish of dishes) {
        insertRecipe.run(dish.id, dish.name);
        for (const good of dish.goods) insertQuantity.run(dish.id, good.id);
      }
      const queries = body.prompt.filter(block => block.type === 'code' && block.text.startsWith('SELECT 料理表.料理名'));
      assert.equal(queries.length, 2);
      const includesTarget = (dish: typeof dishes[number]) => dish.goods.some(good => good.name === ingredient);
      const expected = [
        dishes.filter(includesTarget),
        dishes.filter(dish => includesTarget(dish) && dish.goods.every(good => good.stock === 1)),
      ].map(rows => rows.map(dish => dish.name).sort());
      for (const [i, query] of queries.entries()) {
        unique(body, i + 2, option => {
          const statement = textOf(query).replace('［空欄］', textOf(option));
          const actual = sqlite.prepare(statement).all().map(row => String(row['料理名'])).sort();
          return JSON.stringify(actual) === JSON.stringify(expected[i]);
        });
      }
    } finally {
      sqlite.close();
    }
    assert.deepEqual(body.contexts?.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])),
      ['asset-ipa-2009h21h-fe-pm-p005']);
    assert(body.explanation.includes(ingredient));
  }
});

test('問4は先勝ちフィルタの全候補を実行し、5候補中2つを一つの複数選択欄で採点する', () => {
  for (const body of cases(4)) {
    const proto = tableOf(body.prompt.find(block => block.type === 'table' && block.caption.startsWith('表1'))!);
    const policyA = tableOf(body.prompt.find(block => block.type === 'table' && block.caption.startsWith('表2'))!);
    const policyB = tableOf(body.prompt.find(block => block.type === 'table' && block.caption.startsWith('表3'))!);
    const services = Object.fromEntries(proto.rows.map(([, name, number]) => [name, number]));
    const web = 'Webサーバ', mail = 'メールサーバ', admin = '管理用PC', db = 'DBサーバ', external = '社外';
    const dmz = [web, mail], internal = [admin, db];
    const ports = [...Object.values(services), '21', '443'];
    const allowedA = [[external, web, services.HTTP], [external, mail, services.SMTP], [mail, external, services.SMTP]];
    const allowedB = [
      [web, db, services.DB専用], [mail, db, services.DB専用], [admin, mail, services.POP3], [admin, mail, services.SSH],
      [admin, mail, services.SMTP], [admin, web, services.HTTP], [admin, web, services.SSH],
    ];
    const links = (left: string[], right: string[]) => [
      ...left.flatMap(src => right.flatMap(dest => ports.map(port => [src, dest, port]))),
      ...right.flatMap(src => left.flatMap(dest => ports.map(port => [src, dest, port]))),
    ];
    const permits = (rows: string[][], packet: string[], response = false) => response ||
      rows.find(row => row.slice(0, 3).every((value, i) => value === '任意' || value === packet[i]))?.[3] === '許可';
    const exercise = (rules: string[][], blanks: string[], inputs: string[][], expected: string[][], start: number) => {
      const keys = [part(body, start), part(body, start + 1)];
      const candidates: number[][] = [];
      for (const [x, first] of keys[0].options.entries()) for (const [y, second] of keys[1].options.entries()) {
        const fields = Object.fromEntries([[blanks[0], textOf(first)], [blanks[1], textOf(second)]]);
        const compiled = rules.map(row => row.map(value => fields[value] ?? value));
        if (inputs.every(packet => permits(compiled, packet) === expected.some(row => row.join('|') === packet.join('|')))) candidates.push([x, y]);
      }
      assert.deepEqual(candidates, [[keys[0].correct, keys[1].correct]]);
      const fields = Object.fromEntries(blanks.map((blank, i) => [blank, textOf(keys[i].options[keys[i].correct])]));
      return rules.map(row => row.map(value => fields[value] ?? value));
    };
    const tableA = exercise(policyA.rows, ['［a］', '［b］'], links([external], dmz), allowedA, 0);
    const tableB = exercise(policyB.rows, ['［c］', '［d］'], links(dmz, internal), allowedB, 2);
    assert(permits(tableA, [external, mail, '63000'], true) && permits(tableB, [mail, admin, '63001'], true));
    const threatChecks = [
      [/盗聴や改ざん/, !permits(tableA, [external, web, services.HTTP])],
      [/SQLインジェクション/, !permits(tableA, [external, web, services.HTTP])],
      [/DMZ内.*許可されていないポート/, !permits(tableA, [external, web, '21'])],
      [/社内LANへの不正アクセス/, !permits(tableA, [external, db, services.DB専用]) && !permits(tableB, [external, db, services.DB専用])],
      [/メールによる.*ファイル流出/, !permits(tableA, [mail, external, services.SMTP])],
    ] as const;
    const checklist = part(body, 4);
    assert(checklist.answer.kind === 'unordered' && checklist.answer.presentation === 'checklist');
    const prevented = checklist.options.flatMap((option, i) => {
      const matches = threatChecks.filter(([pattern]) => pattern.test(textOf(option)));
      assert.equal(matches.length, 1);
      return matches[0][1] ? [i] : [];
    });
    assert.deepEqual(prevented, checklist.answer.choiceIds.map(id => checklist.slot.choiceIds.indexOf(id)));
    const q = { answerParts: body.answerParts, correctAnswer: { parts: body.partAnswers } } as Question;
    assert.deepEqual(displayedAnswerParts(q).map(slot => slot.label), ['設問1 a', '設問1 b', '設問1 c', '設問1 d', '設問2']);
    const selected = Object.fromEntries(body.answerParts!.map((slot, i) => [slot.id, slot.choiceIds[part(body, i).correct]]));
    const [first, second] = checklist.answer.partIds;
    [selected[first], selected[second]] = [selected[second], selected[first]];
    assert.equal(gradeAnswer(q, { selectedPartChoices: selected }).outcome, 'correct');
    assert.equal(gradeAnswer(q, { selectedPartChoices: { ...selected, [second]: checklist.slot.choiceIds[0] } }).outcome, 'incorrect');
    const missing = { ...selected };
    delete missing[second];
    assert.equal(gradeAnswer(q, { selectedPartChoices: missing }).outcome, 'unanswered');
    assert.throws(() => gradeAnswer(q, { selectedPartChoices: { ...selected, [second]: selected[first] } }), { code: 'ANSWER_REF' });
    assert.match(paragraphs(body), /最初に条件が合致した行.*応答パケットについては動的フィルタリング.*自動的に許可/);
    assert.match(paragraphs(body), /解答群の中から二つ選べ/);
    assert(body.explanation.includes('SMTP') && body.explanation.includes('POP3'));
  }
});

test('5図の29状態とすべての画像・ビット列を描画し、形状と読み上げを検証する', () => {
  assert.equal(figures.length, 5);
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  const seen = new Set<string>();
  for (const body of [1, 3, 4].flatMap(cases)) {
    for (const block of [...body.prompt, ...body.choices.flat()]) {
      if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
      const { profile, values } = block.scene;
      const definition = figures.find(figure => figure.profile === profile);
      const renderer = renderers.find(item => item.profile === profile);
      assert(definition && renderer);
      assert.equal(definition.alt(values), block.alt);
      definition.validate(values);
      assert.throws(() => definition.validate([definition.domain[0][1] + 1]), /FIGURE_PROFILE/);
      const markup = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values }));
      assert(markup.includes('data-source-figure="' + profile + '"'));
      assert.match(markup, /role="img".+aria-labelledby=.+aria-describedby=/);
      assert.match(markup, /class="diagram-scroll" tabindex="0"/);
      assert(markup.includes('var(--diagram-ink)'));
      if (profile.endsWith('pixel-picture') || profile.endsWith('bit-grid')) {
        const prefix = profile.endsWith('pixel-picture') ? 'pixel' : 'bit';
        const drawn = [...markup.matchAll(new RegExp('data-' + prefix + '-row="([01]+)"', 'g'))].map(match => match[1]);
        assert.deepEqual(drawn, bitRows(block.alt));
      }
      seen.add(profile + ':' + values[0]);
    }
  }
  assert.equal(seen.size, 29);
});
