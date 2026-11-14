import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { spring2008Pm06To09Specs as specs } from '../../../scripts/legacy-2008-spring-pm-06-09-specs';
import { compoundAnswerSignature, gradeAnswer, validateAnswerDefinition } from '../../../src/core/answers';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2008SpringPm0609Figures as figures } from '../../../src/core/generators/legacy-2008-spring-pm-06-09-figures';
import type { Attribution, Block, Question } from '../../../src/core/types';
import { legacy2008SpringPm0609FigureRenderers as renderers } from '../../../src/ui/Legacy2008SpringPm0609Figures';
import { executeSurvey, executeTokens } from '../../fixtures/legacy-2008-spring-pm-06-09-oracle';

const indices = [0, 1, 2, 3];
const official = ['アエアエ', 'ウエウア', 'イウエ'];
const widths = [[6, 6, 4, 4], [6, 4, 6, 4], [6, 6, 6]];
const pages = [[25, 26, 27, 28], [29, 30, 31], [32, 33, 34]];
const getBody = (major: number, index: number) => specs[major - 7].definition.build([index]);
const blank = (code: string, answers: readonly string[]) =>
  code.replaceAll(/［([a-d])］/g, (_, part: string) => answers[part.charCodeAt(0) - 97]);
const codeListings = (body: GeneratedBody, language: string) => body.prompt.flatMap(block =>
  block.type === 'code' && block.language === language ? [block.text] : []);
const prose = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');

function choices(body: GeneratedBody, field: number): string[] {
  return body.answerParts![field].choiceIds.map(id => {
    const [block] = body.choices[Number(id.split('-').at(-1)) - 1];
    assert(block.type === 'code' || block.type === 'paragraph');
    return block.text;
  });
}
function answerIndex(body: GeneratedBody, field: number): number {
  const answer = body.partAnswers![field];
  assert.equal(answer.kind, 'choice');
  return body.answerParts![field].choiceIds.indexOf(answer.choiceId);
}
function correctValues(body: GeneratedBody): string[] {
  return body.answerParts!.map((_, field) => choices(body, field)[answerIndex(body, field)]);
}
function withCandidate(correct: readonly string[], field: number, value: string) {
  return correct.map((choice, index) => index === field ? value : choice);
}
function oneMatch(body: GeneratedBody, field: number, matches: (value: string, index: number) => boolean) {
  const result = choices(body, field).flatMap((value, index) => matches(value, index) ? [index] : []);
  assert.deepEqual(result, [answerIndex(body, field)], body.answerParts![field].label);
}
function figure(body: GeneratedBody, suffix: string) {
  const diagram = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' &&
    block.scene.profile.endsWith('-' + suffix));
  assert(diagram?.type === 'diagram' && diagram.scene.kind === 'source_figure');
  return diagram;
}

test('問7〜9の公式10頁と11の採点欄の順、択数、正答記号、参照資料が一致する', () => {
  assert.deepEqual(specs.map(spec => spec.number), [7, 8, 9]);
  for (const [index, spec] of specs.entries()) {
    assert.deepEqual(spec.pages, pages[index]);
    assert.equal(spec.definition.source, '2008h20h-fe-pm-' + spec.number);
    assert.equal(spec.original.answerParts!.map((_, field) => 'アイウエオカ'[answerIndex(spec.original, field)]).join(''), official[index]);
    assert.deepEqual(spec.original.answerParts!.map(part => part.choiceIds.length), widths[index]);
    for (const alt of Object.values(spec.originalPageAlt)) assert(alt.length > 100 && alt.length <= 2000);
  }
  assert.deepEqual(specs[0].original.answerParts!.map(part => part.label), ['設問1 a', '設問1 b', '設問2 c', '設問2 d']);
  assert.match(specs[0].originalPageAlt[26], /24 {8}READ RESULT-FILE AT END {5}SET DATA-EOF TO TRUE\n25 {25}NOT AT END/);
  assert.match(specs[0].originalPageAlt[27], /設問1[\s\S]*COMPUTE CHOICE-CNT[\s\S]*設問2[\s\S]*プログラムの変更内容/);
  assert.match(specs[0].originalPageAlt[28], /dに関する解答群[\s\S]*エ　行番号45の次/);
  assert.match(specs[1].originalPageAlt[30], /if \(［a］\)\n {12}［b］;/);
  assert.match(specs[1].originalPageAlt[31], /pot\.setContent\(0\);/);
  assert.match(specs[2].originalPageAlt[33], /CPL {3}GR4,='A' {3}; 検査対象文字は数字？/);
  assert.deepEqual(specs[2].definition.fixedReferenceAssetIds, ['055', '056', '057-casl-excerpt', '058', '059', '060']
    .map(page => 'asset-ipa-2008h20h-fe-pm-page-' + page));
  assert.deepEqual(specs[2].original.contexts?.flatMap(context =>
    context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])), specs[2].definition.fixedReferenceAssetIds);
});

test('対象3系列の4条件は同じ設問構造で異なる出題及び正答を発行できる', () => {
  const attribution: Attribution = { origin: 'original', sourceRefs: [], rightsRefs: ['rights-original'], creatorIds: ['codex'] };
  for (const { definition } of specs) {
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(({ minimum, maximum }) => [minimum, maximum]), [[0, 3]]);
    for (const invalid of [[], [-1], [4], [.5], [NaN], [0, 1], Array<number>(1), Object.assign([0], { wrong: 2 })])
      assert.throws(() => definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
    const signatures = new Set<string>(), visible = new Set<string>(), prompts = new Set<string>();
    const structure = (body: GeneratedBody) => body.prompt.map(block => block.type);
    const baseStructure = structure(definition.build([0]));
    for (const index of indices) {
      const body = definition.build([index]);
      assert.deepEqual(body, definition.build([index]));
      assert.deepEqual(structure(body), baseStructure);
      prompts.add(JSON.stringify(body.prompt));
      visible.add(JSON.stringify(correctValues(body)));
      const question = {
        id: definition.source, answerParts: body.answerParts, correctAnswer: { parts: body.partAnswers, attribution },
        choices: body.choices.map((blocks, i) => ({ id: 'choice-value-' + (i + 1), content: { blocks, attribution } })),
      } as Question;
      validateAnswerDefinition(question);
      signatures.add(compoundAnswerSignature(question));
      const selected = Object.fromEntries(body.partAnswers!.map(answer => {
        assert.equal(answer.kind, 'choice');
        return [answer.partId, answer.choiceId];
      }));
      assert.equal(gradeAnswer(question, { selectedPartChoices: selected }).outcome, 'correct');
      body.answerParts!.forEach((part, field) => {
        assert.equal(new Set(choices(body, field)).size, part.choiceIds.length);
        for (const choiceId of part.choiceIds.filter(id => id !== selected[part.id]))
          assert.equal(gradeAnswer(question, { selectedPartChoices: { ...selected, [part.id]: choiceId } }).outcome, 'incorrect');
      });
    }
    assert.equal(prompts.size, 4);
    assert.equal(visible.size, 4);
    assert.equal(signatures.size, 4);
  }
});

const surveyParameters = [
  { limit: 2, points: 1, labels: ['FACTORY', 'HEALTH', 'MINI-SL', 'ANIMAL', 'PK'], printed: [265, 141, 238, 59, 97] },
  { limit: 3, points: 2, labels: ['PLANT', 'SCIENCE', 'MODEL', 'ANIMAL', 'SPORT'], printed: [302, 248, 194, 126, 216] },
  { limit: 1, points: 3, labels: ['EXHIBIT', 'PHOTO', 'MODEL', 'CRAFT', 'SPORT'], printed: [345, 201, 252, 300, 153] },
  { limit: 2, points: 4, labels: ['FACTORY', 'TALK', 'CRAFT', 'ANIMAL', 'SPORT'], printed: [376, 288, 524, 152, 480] },
];
const ballots = Array.from({ length: 32 }, (_, pattern) => Array.from({ length: 5 }, (_, at) => Math.floor(pattern / 2 ** at) % 2));
const take = (ballot: readonly number[], limit: number) => ballot.filter(Boolean).length <= limit;

test('問7は5欄の全32パターンを使いCOBOLの全候補を独立集計と比較する', () => {
  const inputSets = [[], ...ballots.map(ballot => [ballot]), ballots, [...ballots, ...ballots.slice(1)]];
  for (const [index, { limit, points, labels, printed }] of surveyParameters.entries()) {
    const body = getBody(7, index), [listing] = codeListings(body, 'cobol'), correct = correctValues(body);
    assert.match(prose(body), new RegExp('イベントは' + limit + '件まで'));
    assert.match(listing, new RegExp('IF CHOICE-CNT <= ' + limit));
    const row = /17 +"([^"]+)"/.exec(listing)?.[1].padEnd(40);
    assert.deepEqual(row?.match(/.{8}/g)?.map(name => name.trim()), labels);
    assert.deepEqual(figure(body, '7-output').alt.split('\n').map(line => Number(line.split(':')[1])), printed);
    assert.match(figure(body, '7-record').alt, /従業員番号：6けた/);
    assert.match(figure(body, '7-changes').alt, /40と41の間[\s\S]*ELSE[\s\S]*INVALID DATA/);
    for (const label of labels) assert(figure(body, '7-record').alt.includes(label));
    const expected = (input: readonly number[][]) => {
      const usable = input.filter(ballot => take(ballot, limit));
      const totals = Array.from({ length: 5 }, (_, place) => usable.filter(ballot => ballot[place]).length * points);
      return [totals, input.length - usable.length];
    };
    for (const [field] of correct.entries()) oneMatch(body, field, option => inputSets.every(input => {
      try { return JSON.stringify(executeSurvey(listing, withCandidate(correct, field, option), input)) ===
        JSON.stringify(expected(input)); }
      catch { return false; }
    }));
    const max = Math.trunc(9999 / points), repeated = Array<number[]>(max).fill(ballots[1]);
    assert.deepEqual(executeSurvey(listing, correct, repeated), expected(repeated));
    assert.match(body.explanation, new RegExp(String(limit)));
  }
});

const kettleParameters = [{ low: 0, high: 10, limit: 1, warning: 'No Water!' }, { low: 2, high: 3, limit: 3, warning: 'Add Water!' },
  { low: 4, high: 9, limit: 5, warning: 'Water Too Low!' }, { low: 1, high: 12, limit: 8, warning: 'Refill Pot!' }];
function javaAttempt(state: string, pot: string, directory: string, args: readonly string[], probe: string) {
  writeFileSync(join(directory, 'State.java'), state);
  writeFileSync(join(directory, 'ElectricPot.java'), pot);
  writeFileSync(join(directory, 'Probe.java'), probe);
  const compile = spawnSync('javac', ['--release', '8', '-encoding', 'UTF-8', 'State.java', 'ElectricPot.java', 'Probe.java'],
    { cwd: directory, encoding: 'utf8', timeout: 30000 });
  assert.ifError(compile.error);
  if (compile.status !== 0) {
    assert.equal(compile.status, 1, compile.stderr);
    return null;
  }
  const execute = (cls: string) => {
    const result = spawnSync('java', ['-cp', directory, cls, ...args], { cwd: directory, encoding: 'utf8', timeout: 30000 });
    assert.ifError(result.error);
    return result.status === 0 ? result.stdout.trimEnd() : null;
  };
  return { officialTest: execute('ElectricPot'), boundaryTest: execute('Probe') };
}
const javaProbe = `public class Probe {
    public static void main(String[] args) {
        for (int i = 0; i < args.length; i++) {
            int water = Integer.parseInt(args[i]);
            System.out.println("#" + water);
            ElectricPot pot = new ElectricPot(water);
            try {
                pot.heat();
                pot.boiled();
            } catch (Exception error) {
                System.out.println(error.getMessage());
            }
        }
    }
}`;
test('問8は基準と生成の表示コード・全候補をJava 8互換でコンパイルし状態遷移を比較する', () => {
  const directory = mkdtempSync(join(tmpdir(), 'opencbt-2008-spring-java-'));
  try {
    for (const [index, { low, high, limit, warning }] of kettleParameters.entries()) {
      const body = getBody(8, index), [state, pot, main] = codeListings(body, 'java'), correct = correctValues(body);
      assert.equal(figure(body, '8-result').alt, 'Idle -> Heating\nHeating -> Idle\n' + warning);
      assert.match(prose(body), index === 0 ? /水がない場合/ : new RegExp('水量が' + limit + '未満'));
      assert.match(main, new RegExp('new ElectricPot\\(' + high + '\\)'));
      assert.match(main, new RegExp('setContent\\(' + low + '\\)'));
      const input = [...new Set([0, low, limit - 1, limit, high, limit + 1])];
      const boundaryTest = input.map(water => '#' + water + '\n' +
        (water < limit ? warning : 'Idle -> Heating\nHeating -> Idle')).join('\n');
      const expected = { officialTest: figure(body, '8-result').alt, boundaryTest };
      for (const [field] of correct.entries()) oneMatch(body, field, value => {
        const candidate = withCandidate(correct, field, value);
        const observed = javaAttempt(blank(state, candidate), blank([pot, main].join('\n\n'), candidate), directory, input.map(String), javaProbe);
        return JSON.stringify(observed) === JSON.stringify(expected);
      });
    }
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

const tokenParameters = [
  { base: 100, output: 300, terminal: '.', reserved: 0, sample: '  THIS 1234  AN9999' },
  { base: 120, output: 500, terminal: '!', reserved: 1, sample: ' C12  709 LAB' },
  { base: 140, output: 620, terminal: ':', reserved: 2, sample: '88  a7   ZX 1' },
  { base: 168, output: 760, terminal: ';', reserved: 3, sample: '  CODE 9  0a0' },
];
function tokenOracle(input: string, base: number, reserved: number): (number | null)[] {
  const expected: (number | null)[] = [];
  for (const match of input.matchAll(/[^ ]+/g))
    expected.push(base + match.index!, match[0].length, /^\d+$/.test(match[0]) ? 0 : 1, ...Array<null>(reserved).fill(null));
  return [...expected, -1];
}

test('問9は表示されたCASL IIの全候補を命令実行し、字句分割結果及びレジスタ復元と等価か判定する', () => {
  const inputs = Array.from({ length: 5 }, (_, length) => Array.from({ length: 4 ** length }, (_, value) =>
    Array.from({ length }, (_, index) => ' A0z'[Math.floor(value / 4 ** index) % 4]).join(''))).flat();
  for (const [index, { base, output, terminal, reserved, sample }] of tokenParameters.entries()) {
    const body = getBody(9, index), [listing] = codeListings(body, 'casl2'), correct = correctValues(body);
    const example = figure(body, '9-execution').alt;
    assert(example.includes('(GR1)→' + [...sample + terminal].map(char => char === ' ' ? '△' : char).join(' ')));
    assert(example.includes('(GR2)→' + tokenOracle(sample, base, reserved).map(value => value === null ? '空欄' : String(value)).join('｜')));
    assert.match(prose(body), new RegExp((3 + reserved) + '語からなる要素'));
    assert.match(listing, /RPUSH[\s\S]*RPOP/);
    for (const [field] of correct.entries()) oneMatch(body, field, value => {
      const program = blank(listing, withCandidate(correct, field, value));
      return [...inputs, sample, '00 123 999 A AZaZ  '].every(text => {
        try { return JSON.stringify(executeTokens(program, text + terminal, base, output, reserved)) ===
          JSON.stringify(tokenOracle(text, base, reserved)); }
        catch { return false; }
      });
    });
    assert.match(body.explanation, new RegExp('GR2だけを' + (3 + reserved) + '進める'));
  }
});

test('問7〜9の全24図状態を同じ可変値で描画し図表の意味と読み上げを揃える', () => {
  assert.equal(figures.length, 6);
  assert.deepEqual(figures.map(item => item.profile), renderers.map(item => item.profile));
  for (const index of indices) for (const spec of specs) {
    const body = spec.definition.build([index]);
    for (const block of body.prompt.filter((block): block is Extract<Block, { type: 'diagram' }> => block.type === 'diagram')) {
      assert(block.scene.kind === 'source_figure');
      const { profile, values } = block.scene;
      const figure = figures.find(candidate => candidate.profile === profile);
      const renderer = renderers.find(candidate => candidate.profile === profile);
      assert(figure && renderer);
      assert.equal(figure.alt(values), block.alt);
      assert.doesNotThrow(() => figure.validate(values));
      assert.throws(() => figure.validate([4]), { code: 'PARAMETER_CONSTRAINT' });
      const html = renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
      assert.match(html, /role="group"[\s\S]*aria-description=/);
      assert.match(html, /class="diagram-scroll" tabindex="0"/);
      if (profile.endsWith('8-state')) {
        assert.match(html, /<svg[\s\S]*role="img"/);
        assert.match(html, /沸騰ボタン押下/);
        assert.match(html, /沸点に到達/);
      }
      if (/(7-record|7-changes|9-execution)$/.test(profile)) assert.match(html, /<table/);
    }
  }
});
