import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { spring2004Pm10To13Specs as specs } from '../../../scripts/legacy-2004-spring-pm-10-13-specs';
import { legacy2004SpringPm1013Figures as figures } from '../../../src/core/generators/legacy-2004-spring-pm-10-13-figures';
import { legacy2004SpringPm1013FigureRenderers as renderers } from '../../../src/ui/Legacy2004SpringPm1013Figures';
import { boundaries, compileWorkListing, referenceTotals } from '../../fixtures/legacy-2004-spring-pm-cobol-reference';
import { verifyJavaMatrix } from '../../fixtures/legacy-2004-spring-pm-java-reference';

const kana = 'アイウエオカキクケコ';
const cases = (number: number) => {
  const spec = specs.find(row => row.number === number)!;
  return [spec.original, ...[0, 1, 2, 3].map(index => spec.definition.build([index]))];
};
const code = (body: GeneratedBody, language: string) => body.prompt.flatMap(
  block => block.type === 'code' && block.language === language ? [block.text] : []);
function inspect(body: GeneratedBody) {
  const key: Record<string, string> = {}, options: Record<string, string[]> = {};
  const names: string[] = [];
  let letters = '';
  for (const choice of body.partAnswers!) {
    assert(choice.kind === 'choice');
    const part = body.answerParts!.find(item => item.id === choice.partId)!;
    const letter = part.choiceIds.indexOf(choice.choiceId);
    assert(letter >= 0);
    letters += kana[letter];
    const name = part.id.slice(5);
    names.push(name);
    options[name] = part.choiceIds.map(id => {
      const block = body.choices[Number(id.split('-').at(-1)) - 1][0];
      assert(block.type === 'paragraph' || block.type === 'code');
      return block.text;
    });
    key[name] = options[name][letter];
  }
  return { key, options, names, letters };
}

test('問11・12の全12欄の原形式と公式正答、4条件・無効入力・表と出力例を確認する', () => {
  assert.deepEqual(specs.map(row => row.number), [11, 12]);
  const expectedCounts = [[7, 7, 7, 10, 10, 10], [6, 6, 6, 6, 6, 6]];
  for (const [i, spec] of specs.entries()) {
    assert.deepEqual(spec.pages, i === 0 ? [47, 48, 49, 50, 51] : [52, 53, 54, 55, 56]);
    assert.equal(spec.definition.sourceAnswer, ['キエウカイア', 'カエアエエカ'][i]);
    assert.equal(inspect(spec.original).letters, spec.definition.sourceAnswer);
    const variants = cases(spec.number).slice(1);
    assert.equal(new Set(variants.map(body => JSON.stringify(body.prompt))).size, 4);
    assert.equal(new Set(variants.map(body => body.explanation)).size, 4);
    for (const body of variants) {
      const { options, names } = inspect(body);
      assert.deepEqual(names, [...'abcdef']);
      assert.deepEqual(names.map(name => new Set(options[name]).size), expectedCounts[i]);
      const tables = body.prompt.filter(block => block.type === 'table');
      assert.equal(tables.length, i === 0 ? 5 : 0);
      if (i === 1) assert.equal(body.prompt.filter(block => block.type === 'diagram').length, 1);
    }
    for (const invalid of [[], [4], [0, 1], [-1], [0.25]]) assert.throws(() => spec.definition.build(invalid));
  }
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
});

test('問11のCOBOLリストに全候補を差し替え、社員・日・業務の集計、空入力、満杯と月間上限を独立検算する', () => {
  const regular = [8, 8, 6, 7, 9], capacity = [100, 100, 80, 96, 125];
  for (const [i, body] of cases(11).entries()) {
    const listing = code(body, 'cobol').join('\n');
    assert.equal([...listing.matchAll(/^\s*\d+\s/mg)].length, 82);
    assert(listing.includes('OCCURS ' + capacity[i]));
    assert(listing.includes('SAGYO-JIKAN-KEI - ' + regular[i]));
    const data = boundaries(regular[i], capacity[i]);
    const expected = data.map(set => referenceTotals(set, regular[i]));
    assert.deepEqual(expected[0], { work: [], overtime: [] });
    assert.equal(expected[1].overtime[0][1], 0);
    assert.equal(expected[3].work[0][2], 744);
    assert.equal(expected[4].work.length, capacity[i]);
    const { key, names, options } = inspect(body);
    for (const name of names) {
      const works = options[name].filter(option => {
        try {
          const execute = compileWorkListing(listing, { ...key, [name]: option });
          return data.every((set, index) => JSON.stringify(execute(set)) === JSON.stringify(expected[index]));
        } catch { return false; }
      });
      assert.deepEqual(works, [key[name]], '問11：' + i + '/' + name);
    }
  }
});

test('問12の表示Javaをコンパイルし、全コンストラクタ候補・添字更新・例外・null・空行・UTF-16のchar順を独立検算する', () => {
  const expected = ["'H' '1' '6'\n'2' '0' '0' '4'", "'Q' '7'\n'8' '1' '2'",
    "'K' '2'\n'1' '5' '7'", "'8' '2'\n'5' '9' '3'", "'M' 'L' '9'\n'4' '2' '8'"];
  const probes = cases(12).map((body, i) => {
    const { key, options } = inspect(body);
    const listing = code(body, 'java').slice(4);
    assert.equal(listing.length, 4);
    if (i === 0) {
      assert.equal(code(body, 'text')[0], expected[i]);
    } else {
      const figure = body.prompt.find(item => item.type === 'diagram');
      assert(figure?.type === 'diagram' && figure.scene.kind === 'source_figure');
      const [first, second] = expected[i].split('\n');
      assert.equal(figure.alt, '1行目　' + first + '。2行目　' + second + '。');
    }
    return { listing, expected: expected[i].split('\n'), offset: [0, 0, 1, 2, 3][i], key, options };
  });
  const evidence = verifyJavaMatrix(probes);
  assert.deepEqual(evidence, { typeCandidates: 8, runtimeCandidates: 130 });
});

test('問12の出力図を4条件で描画し、titleと2行の出力をdescで伝える', () => {
  for (const body of cases(12).slice(1)) {
    const block = body.prompt.find(item => item.type === 'diagram');
    assert(block?.type === 'diagram' && block.scene.kind === 'source_figure');
    const { profile, values } = block.scene;
    const renderer = renderers.find(entry => entry.profile === profile)!;
    const markup = renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
    assert(markup.includes('role="img"') && markup.includes('aria-labelledby=') && markup.includes('aria-describedby='));
    assert(markup.includes('>' + block.caption + '</title>') && markup.includes('>' + block.alt.replaceAll("'", '&#x27;') + '</desc>'));
  }
});
