import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import { DataError } from '../src/core/errors';
import { readBookletFigure } from '../src/core/booklet-figure-extension-contract';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2015SpringPm5Definition as q5 } from '../src/core/generators/legacy-2015-spring-pm-5';
import { legacy2015SpringPm6Definition as q6 } from '../src/core/generators/legacy-2015-spring-pm-6';
import { legacy2015SpringPm7Definition as q7, spring2015Pm7Round as round } from '../src/core/generators/legacy-2015-spring-pm-7';
import { legacy2015SpringPm8Definition as q8, spring2015Pm8Select as select } from '../src/core/generators/legacy-2015-spring-pm-8';
import { legacy2015SpringPm0508Figures as figures } from '../src/core/generators/legacy-2015-spring-pm-05-08-figures';
import { legacy2015SpringPm0508FigureRenderers as renderers } from '../src/ui/Legacy2015SpringPm0508Figures';
import { spring2015Pm05To08Specs as specs } from '../scripts/legacy-2015-spring-pm-05-08-specs';

const definitions = [q5, q6, q7, q8];
const symbols = 'アイウエオカキクケコ';
const sum = (numbers: readonly number[]) => numbers.reduce((total, number) => total + number, 0);
const integer = (value: string) => Number(value.replaceAll(',', '').replaceAll('−', '-'));
const bodyText = (blocks: readonly Block[]) => blocks.map(block =>
  block.type === 'paragraph' || block.type === 'heading' || block.type === 'code' ? block.text
    : block.type === 'table' ? block.rows.flat().join('／') : block.type === 'diagram' ? block.alt : '').join('\n');

function part(body: GeneratedBody, id: string) {
  const field = body.answerParts!.find(candidate => candidate.id === 'part-' + id);
  assert(field);
  return field;
}
function choices(body: GeneratedBody, id: string) {
  return part(body, id).choiceIds.map(choice => body.choices[Number(choice.slice(13)) - 1]);
}
const bank = (body: GeneratedBody, id: string) => choices(body, id).map(bodyText);
function selected(body: GeneratedBody, id: string) {
  const field = part(body, id);
  const answer = body.partAnswers!.find(answer => answer.kind === 'choice' && answer.partId === field.id);
  assert(answer?.kind === 'choice');
  return field.choiceIds.indexOf(answer.choiceId);
}
function unique(body: GeneratedBody, id: string, predicate: (choice: string, index: number) => boolean) {
  const values = bank(body, id);
  assert.equal(new Set(values).size, values.length, id + ' duplicate choices');
  assert.deepEqual(values.flatMap((choice, index) => predicate(choice, index) ? [index] : []), [selected(body, id)], id);
}
function diagram(blocks: readonly Block[], suffix: string) {
  const block = blocks.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' && block.scene.profile.endsWith(suffix));
  assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
  return { ...block, scene: block.scene };
}
function render(block: ReturnType<typeof diagram>) {
  const component = renderers.find(item => item.profile === block.scene.profile)?.component;
  assert(component);
  return renderToStaticMarkup(createElement(component, { values: block.scene.values, caption: block.caption }));
}

test('2015春午後問5〜8は冊子物理頁・公式24欄・全有限条件・図の描画を保持する', () => {
  const keys = ['ウクカエカキ', 'アエウウイイウ', 'ウアアウア', 'アウイエオエ'];
  const counts = [[8, 8, 8, 8, 9, 9], [4, 4, 4, 3, 3, 2, 4], [4, 5, 4, 4, 3], [6, 6, 6, 6, 5, 5]];
  assert.deepEqual(specs.flatMap(spec => spec.pages), Array.from({ length: 20 }, (_, i) => i + 22));
  let total = 0;
  for (const [i, def] of definitions.entries()) {
    const { original, pages, originalPageAlt } = specs[i];
    assert.deepEqual(Object.keys(originalPageAlt).map(Number), pages);
    for (const page of pages) assert(originalPageAlt[page].endsWith('冊子' + (page - 1) + '頁。'));
    assert.equal(original.answerParts!.map(field => symbols[selected(original, field.id.slice(5))]).join(''), keys[i]);
    const seen = new Set(), max = def.fields[0].maximum;
    for (let value = 0; value <= max; value++) {
      total++;
      const body = def.build([value]);
      assert.deepEqual(body.answerParts!.map(field => field.choiceIds.length), counts[i]);
      assert.deepEqual(def.build([value]), body);
      const prompt = bodyText(body.prompt);
      assert(!seen.has(prompt), def.source);
      seen.add(prompt);
      assert.deepEqual(body.contexts?.flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])),
        def.fixedReferenceAssetIds);
      for (const block of [...body.prompt, ...body.choices.flat()]) {
        if (block.type !== 'diagram' || block.scene.kind !== 'source_figure') continue;
        const scene = block.scene;
        const spec = figures.find(figure => figure.profile === scene.profile);
        assert(spec);
        assert.equal(readBookletFigure(spec, scene.values), block.alt);
        assert.match(render({ ...block, scene }), /<p|<svg|<table|<code/);
      }
    }
    for (const bad of [[], [-1], [max + 1], [.5], [NaN], [0, 0]])
      assert.throws(() => def.build(bad), error => error instanceof DataError && error.code === 'PARAMETER_CONSTRAINT');
  }
  assert.equal(total, 15);
  assert.deepEqual(q8.fixedReferenceAssetIds, ['asset-ipa-2015h27h-fe-pm-p004', 'asset-ipa-2015h27h-fe-pm-p005']);
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
});

const originalKeysByRole = { a: '契約番号', b: '保全受付番号', c: '帳票出力番号', d: '顧客ID' };
const crudFunctions = [
  { create: ['契約'], read: ['保険種類マスタ'] },
  { create: ['契約担当'], read: ['社員マスタ', '契約'] },
  { create: ['顧客', '関係顧客'], read: ['契約', '顧客'], update: ['顧客'] },
  { create: ['保全手続'], read: ['契約', '保全手続'] },
  { read: ['契約', '保全手続'], update: ['契約'] },
  { create: ['関係顧客'], read: ['顧客', '関係顧客', '保全手続'], update: ['顧客'], remove: ['顧客', '関係顧客'] },
  { create: ['帳票出力'], read: ['社員マスタ', '契約担当', '契約', '顧客', '関係顧客', '保全手続', '保険種類マスタ'] },
  { update: ['保全手続'] },
] as const;
const verbs = [['create', 'C'], ['read', 'R'], ['update', 'U'], ['remove', 'D']] as const;
type Actions = Partial<Record<(typeof verbs)[number][0], readonly string[]>>;
const requiredMarks = (entity: string, rule: Actions) => verbs.flatMap(([operation, mark]) => rule[operation]?.includes(entity) ? [mark] : []).join(', ') || '―';

test('問5のa〜dは主外部キーの意味、e/fは実際の全CRUDセルと操作の合成で独立に検算する', () => {
  for (let input = 0; input <= q5.fields[0].maximum; input++) {
    const body = q5.build([input]), rendered = render(diagram(body.prompt, '-er'));
    const expectedCounts = { a: 3, b: 2, c: 1, d: 2 };
    for (const [id, name] of Object.entries(originalKeysByRole)) {
      unique(body, id, value => value === name);
      assert.equal((rendered.match(new RegExp('data-blank="' + id + '"', 'g')) ?? []).length, expectedCounts[id as keyof typeof expectedCounts]);
    }
    for (const edge of ['社員マスタ→契約担当', '契約→契約担当', '顧客→関係顧客', '契約→関係顧客',
      '保険種類マスタ→契約', '契約→保全手続', '保全手続→帳票出力'])
      assert(rendered.includes('data-er-edge="' + edge + '"'), edge);
    const table = diagram(body.prompt, '-crud');
    const rows = table.alt.split('。').slice(1, 9).map(row => row.split('：'));
    assert.equal(rows.length, 8);
    const blanks = new Set();
    for (const [entity, marks] of rows) {
      const columns = marks.split('／');
      assert.equal(columns.length, crudFunctions.length);
      for (const [i, entry] of columns.entries()) {
        const expected = requiredMarks(entity, crudFunctions[i]);
        if (/^［[ef]］$/.test(entry)) {
          unique(body, entry[1], option => option === expected);
          blanks.add(entry[1]);
        } else assert.equal(entry, expected, entity + ' ' + i);
      }
    }
    assert.deepEqual(blanks, new Set(['e', 'f']));
    assert.match(render(table), /空欄 e/);
    assert.match(render(table), /空欄 f/);
    const prose = bodyText(body.prompt);
    for (const condition of ['全ての名寄せ項目', '1日1回', '契約者として', '関係顧客情報は変更しない', '参照して更新'])
      assert(prose.includes(condition), condition);
    const example = render(diagram(body.prompt, '-customer-example'));
    assert.match(example, /<u>XX県YY市ZZ区2-28-8<\/u>/);
    assert.match(example, /<u>AA県BB市CC区4-1<\/u>/);
  }
});

test('問6の全欄は原の会議表、実メンバ間の辺、議事録の保管とアクセス権で照合する', () => {
  for (let input = 0; input <= q6.fields[0].maximum; input++) {
    const body = q6.build([input]);
    const table = body.prompt.find(block => block.type === 'table' && block.caption.startsWith('表1'));
    assert(table?.type === 'table');
    const names = table.columns.slice(1), leaders = table.rows[0].slice(1).map(Number), members = table.rows[1].slice(1).map(Number);
    assert.deepEqual(leaders, [1, 1, 1]);
    const plan = diagram(body.prompt, '-plan').alt;
    const wholeCount = Number(plan.match(/全体進捗会議／PM／月(\d+)回/)?.[1]);
    const teamCount = Number(plan.match(/チーム進捗会議／PM／チームごとに月(\d+)回/)?.[1]);
    assert(Number.isInteger(wholeCount) && Number.isInteger(teamCount));
    const participants = names.map((team, i) => [team + 'TL', ...Array.from({ length: members[i] }, (_, j) => team + ':' + j)]);
    const indirect = new Set(participants.flatMap(([lead, ...staff]) => ['PM→' + lead, ...staff.map(person => lead + '→' + person)]));
    const direct = new Set(participants.flat().map(person => 'PM→' + person));
    assert.deepEqual(indirect.size, direct.size);
    assert.notDeepEqual(indirect, direct);
    unique(body, 'a', choice => plan.includes('プロジェクト会議議事録／' + choice + '／全チームのメンバ／電子メール'));
    unique(body, 'b', choice => integer(choice) === [...Array(wholeCount), ...participants.flatMap(() => Array.from({ length: teamCount }, () => 1))].length);
    unique(body, 'c', choice => integer(choice) === indirect.size);
    unique(body, 'd', choice => choice === (indirect.size > direct.size ? '多い' : indirect.size < direct.size ? '少ない' : '変わらない'));
    unique(body, 'e', choice => choice.includes('TLが担当者全員から内容を確認した旨の電子メールを受け') && choice.includes('TLからPMに電子メールで報告'));
    unique(body, 'f', choice => choice === '全チームのメンバ' && plan.includes('プロジェクト計画書／PM／全チームのTL'));
    const optionRows = choices(body, 'g').map(blocks => diagram(blocks, '-permissions-choice'));
    unique(body, 'g', (_, i) => {
      const html = render(optionRows[i]);
      const marks = [...html.matchAll(/>([●○×])<\/td>/g)].map(match => match[1]);
      assert.equal(marks.length, 7);
      return marks.every((mark, j) => mark === (j === 0 ? '●' : '○'));
    });
    const matrix = render(diagram(body.prompt, '-gw'));
    assert.match(matrix, /colSpan="7".*空欄 g/);
    assert.equal((matrix.match(/omitted-cell/g) ?? []).length, 16);
  }
});

function flows(text: string) {
  const capture = [...text.matchAll(/([AB])案。キャッシュアウト：([^。]+)。キャッシュイン：([^。]+)。キャッシュフロー：([^。]+)(?:。キャッシュフローの現在価値：([^。]+))?/g)];
  assert.deepEqual(capture.map(match => match[1]), ['A', 'B']);
  return capture.map(match => ({
    out: match[2].split('，').map(integer),
    in: match[3].split('，').map(value => value === '空欄' ? null : integer(value)),
    flow: match[4].split('，').map(integer),
    pv: match[5]?.split('，').map(value => value === '網掛け' ? null : integer(value)),
  }));
}
const cash = (row: ReturnType<typeof flows>[number]) => row.out.map((value, i) => (row.in[i] ?? 0) - value);
const positiveYear = (values: number[]) => values.findIndex((_, i) => sum(values.slice(0, i + 1)) > 0);

test('問7の全択は表示された費用、厳密に正の回収時点、指定係数での正味現在価値から照合する', () => {
  assert.deepEqual([-151, -150, -149, -49, 0, 49, 149, 150, 151].map(round), [-2, -2, -1, 0, 0, 0, 1, 2, 2]);
  assert.equal(positiveYear([-100, 100, 0, 1]), 3);
  for (let input = 0; input <= q7.fields[0].maximum; input++) {
    const body = q7.build([input]), text = bodyText(body.prompt);
    const [a, b] = flows(diagram(body.prompt, '-flow').alt);
    const [beforeA, beforeB] = flows(diagram(body.prompt, '-pv').alt);
    const outline = diagram(body.prompt, '-outline').alt;
    assert.match(text, /5年間.*年度末/);
    assert.match(text, /千円の位を四捨五入/);
    const aInitial = integer(outline.match(/初期開発費／（平成27年度に発生） ([\d,]+)／/)![1]);
    const bAdditional = integer(outline.match(/追加開発費／0／（平成30年度に発生） ([\d,]+)/)![1]);
    assert.equal(aInitial, a.out[0]);
    assert.equal(bAdditional + 600, b.out[3]);
    assert.equal(a.out.length, 6);
    for (const row of [a, b, beforeA, beforeB]) assert.deepEqual(row.flow, cash(row));
    const analysis = Number(text.match(/初期開発費とは別に(\d+)万円/)?.[1]);
    assert.equal(analysis, 100);
    for (const [raw, before] of [[a, beforeA], [b, beforeB]]) {
      assert.deepEqual(before.out, [raw.out[0] + analysis, ...raw.out.slice(1)]);
      assert.deepEqual(before.in, raw.in);
    }
    const yearsA = positiveYear(cash(a)), yearsB = positiveYear(cash(b));
    assert(text.includes('A案の投資回収期間は' + yearsA + '年'));
    unique(body, 'a', choice => integer(choice) === yearsB);
    unique(body, 'b', choice => yearsA === yearsB ? choice.includes('同じなので') :
      yearsB > yearsA ? choice.includes('B案の方が回収期間は長く') && choice.includes('A案を採用する')
        : choice.includes('B案の方が回収期間は短く') && choice.includes('B案を採用する'));

    const coefficients = [100n, ...[...text.matchAll(/＝0\.(\d{2})/g)].map(match => BigInt(match[1]))];
    assert.deepEqual(coefficients, [100n, 91n, 83n, 75n, 68n, 62n]);
    const value = (cashFlows: readonly number[]) => {
      const hundredths = cashFlows.reduce((total, flow, i) => total + BigInt(flow) * coefficients[i], 0n);
      const magnitude = hundredths < 0n ? -hundredths : hundredths;
      const rounded = (2n * magnitude + 100n) / 200n;
      return Number(hundredths < 0n ? -rounded : rounded);
    };
    for (const row of [beforeA, beforeB]) {
      assert.equal(row.pv?.length, 6);
      assert.deepEqual(row.pv, cash(row).map((v, i) => i === 2 || i === 3 ? null : v * Number(coefficients[i]) / 100));
    }
    assert.equal((render(diagram(body.prompt, '-pv')).match(/omitted-cell/g) ?? []).length, 4);
    const beforeAv = value(cash(beforeA)), beforeBv = value(cash(beforeB));
    assert(beforeAv > beforeBv);
    assert.equal(integer(text.match(/A案のNPVが([\d,]+)万円/)![1]), beforeAv);
    const [afterAInitial, afterBAdditional] = text.match(/初期開発費は([\d,]+)万円，B案の追加開発費は([\d,]+)万円/)!.slice(1).map(integer);
    const afterA = cash(beforeA), afterB = cash(beforeB);
    afterA[0] = -(afterAInitial + analysis);
    afterB[3] += bAdditional - afterBAdditional;
    const aResult = value(afterA), bResult = value(afterB);
    assert.equal(integer(text.match(/B案のNPVは([\d,]+)万円/)![1]), bResult);
    assert.deepEqual(bank(body, 'c').map(integer), [beforeBv, aResult, bResult, value([afterA[0] + analysis, ...afterA.slice(1)])].sort((a, b) => a - b));
    assert.deepEqual(bank(body, 'c'), bank(body, 'd'));
    unique(body, 'c', option => integer(option) === beforeBv);
    unique(body, 'd', option => integer(option) === aResult);
    unique(body, 'e', option => option === (aResult > bResult ? 'A案を採用する' : aResult < bResult ? 'B案を採用する'
      : 'A案とB案のどちらを採用しても同じ'));
    if (input === 0) assert.deepEqual([yearsA, yearsB, beforeAv, beforeBv, aResult, bResult], [4, 5, 818, 79, 1318, 754]);
  }
});

function traceOracle(x: readonly number[], rank: number, broken = false) {
  const a = [NaN, ...x], n = x.length;
  let lo = 1, hi = n, alpha = 0, gamma = 0;
  const seen = new Set();
  const states: { top: number; last: number; pivot: number; values: number[] }[] = [];
  while (lo < hi) {
    const pivot = a[rank], key = JSON.stringify([lo, hi, a.slice(1)]);
    if (seen.has(key)) return { failure: 'cycle', lo, hi, states, alpha, gamma };
    seen.add(key);
    alpha++;
    let i = lo, j = hi;
    while (true) {
      const left = a.slice(i).findIndex(v => broken ? v > pivot : v >= pivot);
      const right = a.slice(1, j + 1).reverse().findIndex(v => v <= pivot);
      if (left < 0) return { failure: 'outside', index: n + 1, states, alpha, gamma };
      if (right < 0) return { failure: 'outside', index: 0, states, alpha, gamma };
      i += left;
      j -= right;
      if (i >= j) break;
      const rightValue = a[j];
      a[j] = a[i];
      a[i] = rightValue;
      i += 1;
      j -= 1;
      gamma++;
    }
    lo = rank >= i ? j + 1 : lo;
    hi = rank <= j ? i - 1 : hi;
    states.push({ top: lo, last: hi, pivot, values: a.slice(1) });
  }
  return { result: a[rank], states, alpha, gamma };
}
const numbers = (value: string) => value.split('，').map(Number);
const binary = (length: number): number[][] => length === 0 ? [[]] :
  binary(length - 1).flatMap(xs => [-1, 0, 1].map(v => [...xs, v]));

test('問8の表示された配列・順位・分割・カウンタと誤変更を独立追跡する', () => {
  let tested = 0;
  for (let n = 1; n <= 6; n++) for (const row of binary(n)) for (let k = 1; k <= n; k++) {
    const expected = traceOracle(row, k), actual = select({ x: row, k });
    assert(actual.status === 'returned');
    assert.equal(actual.value, [...row].sort((a, b) => a - b)[k - 1]);
    assert.deepEqual([actual.value, actual.alpha, actual.gamma], [expected.result, expected.alpha, expected.gamma]);
    assert.deepEqual(actual.rounds.map(({ top, last, pivot, array }) => ({ top, last, pivot, values: array })), expected.states);
    tested++;
  }
  assert.equal(tested, 6015);
  for (let input = 0; input <= q8.fields[0].maximum; input++) {
    const body = q8.build([input]), prose = bodyText(body.prompt);
    assert.match(prose, /配列xの要素番号は1から始まる.*数値の個数分だけ確保/);
    const matched = prose.match(/関数Selectの引数で与えられた配列xの要素番号1〜7の内容が([\d，]+)であり，nが7，kが(\d+)/);
    assert(matched);
    const trace = traceOracle(numbers(matched[1]), Number(matched[2]));
    assert(trace.states.length >= 3);
    const [first, second] = trace.states;
    const panes = [...prose.matchAll(/その結果，配列xの内容は次のとおりになる。\n([\d，]+)/g)].map(match => numbers(match[1]));
    assert.deepEqual(panes, [first.values, second.values]);
    assert.match(prose, new RegExp('要素x\\[' + matched[2] + '\\]の値' + first.pivot + 'を設定'));
    assert.match(prose, new RegExp('基準値Pivotにx\\[' + matched[2] + '\\]の値' + second.pivot + 'を設定'));
    for (const [i, row] of [first, second].entries())
      unique(body, 'ab'[i], option => option === 'Topに値' + row.top + '，Lastに値' + row.last);

    const countInput = prose.match(/引数で与えられた配列xの要素番号1〜7の内容が([\d，]+)であり，nが7，kが(\d+)のとき，選択処理が終了/);
    assert(countInput);
    const count = traceOracle(numbers(countInput[1]), Number(countInput[2]));
    unique(body, 'c', option => Number(option) === count.alpha);
    unique(body, 'd', option => Number(option) === count.gamma);
    assert.match(prose, /βの行x\[i\]＜Pivotを誤ってx\[i\]≦Pivot/);
    const faulty = [...prose.matchAll(/要素番号1〜6の内容が([\d，]+)であり，nが6，kが(\d+)のとき，［([ef])］/g)];
    assert.equal(faulty.length, 2);
    for (const [, array, k, field] of faulty) {
      const values = numbers(array), result = traceOracle(values, Number(k), true);
      const actual = select({ x: values, k: Number(k) }, true);
      if (result.failure === 'outside') {
        assert(actual.status === 'outside');
        assert.equal(actual.subscript, result.index);
      } else {
        assert.equal(result.failure, 'cycle');
        assert(actual.status === 'cycle');
        assert.deepEqual([actual.top, actual.last], [result.lo, result.hi]);
      }
      unique(body, field, option => option === (result.failure === 'outside' ? '配列の範囲を越えて参照する' : '処理が終了しない'));
    }
    const html = render(diagram(body.prompt, '-program'));
    assert.equal((html.match(/grid-column:1;grid-row:/g) ?? []).length, 32);
    for (const term of ['data-code-marker="α"', 'data-code-marker="β"', 'data-code-marker="γ"', 'break', 'Top ← j ＋ 1', 'Last ← i − 1'])
      assert(html.includes(term), term);
    if (input === 0) {
      assert.deepEqual([first.top, first.last, second.top, second.last, count.alpha, count.gamma], [1, 5, 2, 5, 2, 4]);
      assert.equal(traceOracle([1, 3, 2, 4, 2, 2], 3, true).hi, 4);
    }
  }
});
