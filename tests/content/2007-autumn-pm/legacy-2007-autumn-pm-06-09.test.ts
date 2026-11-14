import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { autumn2007Pm06To09Specs as specs } from '../../../scripts/legacy-2007-autumn-pm-06-09-specs';
import { compoundAnswerSignature, gradeAnswer, validateAnswerDefinition } from '../../../src/core/answers';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2007AutumnPm0609Figures as figures } from '../../../src/core/generators/legacy-2007-autumn-pm-06-09-figures';
import type { Attribution, Block, Question } from '../../../src/core/types';
import { legacy2007AutumnPm0609FigureRenderers as renderers } from '../../../src/ui/Legacy2007AutumnPm0609Figures';
import { executeHealth, parityMachine } from '../../fixtures/legacy-2007-autumn-pm-06-09-oracle';

const indices = [0, 1, 2, 3];
const forQuestion = (number: number, index: number) => specs[number - 7].definition.build([index]);
const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const blank = (text: string, answers: readonly string[]) =>
  text.replaceAll(/［([a-d])］/g, (_, part: string) => answers[part.charCodeAt(0) - 97]);
const listings = (body: GeneratedBody, language: string) => body.prompt.flatMap(block =>
  block.type === 'code' && block.language === language ? [block.text] : []);
const prose = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
function figure(body: GeneratedBody, suffix: string) {
  const found = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' &&
    block.scene.profile.endsWith('-' + suffix));
  assert(found?.type === 'diagram' && found.scene.kind === 'source_figure');
  return found;
}
function alternatives(body: GeneratedBody, field: number): string[] {
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
const correctValues = (body: GeneratedBody) => body.answerParts!.map((_, field) => alternatives(body, field)[answerIndex(body, field)]);
const replace = (choices: readonly string[], target: number, value: string) => choices.map((choice, i) => i === target ? value : choice);
const selections = (body: GeneratedBody) => body.answerParts!.map((_, i) => alternatives(body, i));
function oneMatch(body: GeneratedBody, part: number, works: (value: string) => boolean) {
  assert.deepEqual(alternatives(body, part).flatMap((choice, i) => works(choice) ? [i] : []), [answerIndex(body, part)]);
}

test('公式10頁の順序、選択肢と採点欄、Javaの独自参考資料及びCASL IIの抜粋を照合する', () => {
  const pages = [[26, 27, 28], [29, 30, 31, 32], [33, 34, 35]];
  const keys = ['オウエウ', 'イエイア', 'カカウ'];
  const widths = [[7, 7, 4, 4], [6, 4, 4, 4], [6, 8, 6]];
  const labels = [['設問1 a','設問1 b','設問2 c','設問2 d'], ['設問1 a','設問1 b','設問1 c','設問2'], ['設問1 a','設問1 b','設問2']];
  assert.deepEqual(specs.map(spec => spec.number), [7, 8, 9]);
  for (const [index, spec] of specs.entries()) {
    assert.deepEqual(spec.pages, pages[index]);
    assert.equal(spec.definition.source, '2007h19a-fe-pm-' + spec.number);
    assert.equal(spec.original.answerParts!.map((_, field) => 'アイウエオカキク'[answerIndex(spec.original, field)]).join(''), keys[index]);
    assert.deepEqual(spec.original.answerParts!.map(part => part.choiceIds.length), widths[index]);
    assert.deepEqual(spec.original.answerParts!.map(part => part.label), labels[index]);
    for (const value of Object.values(spec.originalPageAlt)) assert(value.length > 100 && value.length <= 2000);
  }
  assert.match(specs[0].originalPageAlt[27], /26 {6}PERFORM UNTIL YEAR-EOF\n27 {8}READ YEAR-FILE/);
  assert.match(specs[0].originalPageAlt[28], /設問1[\s\S]*オ　MOVE YEAR-ENO TO MAST-ENO[\s\S]*設問2[\s\S]*昨年の体重/);
  assert.match(specs[1].originalPageAlt[29], /冊子の末尾を参照/);
  assert.match(specs[1].originalPageAlt[30], /for \(pos = queue\.size\(\); pos > 0; pos--\) \{\n {12}sum \+= queue\.get\(［a］\)/);
  assert.match(specs[1].originalPageAlt[31], /private class QueueElement[\s\S]*\{3, 2, 4, 8\}/);
  assert.match(specs[2].originalPageAlt[34], /LP2 {5}SLL {3}GR1,1\n 9 {10}JZE {3}CONT/);
  assert.ok(!specs[1].definition.fixedReferenceAssetIds?.length);
  for (const item of [specs[1].original, ...indices.map(index => forQuestion(8, index))]) {
    assert.equal(item.contexts?.length, 1);
    assert.equal(item.contexts[0].presentation, 'text');
    assert.ok(item.contexts[0].blocks.every(block => block.type === 'paragraph' || block.type === 'table'));
    const operations = item.contexts[0].blocks.find(block => block.type === 'table');
    assert(operations?.type === 'table');
    assert.deepEqual(operations.rows.map(row => row[0]),
      ['new LinkedList<E>()','add(index, element)','get(index)','poll()','size()']);
  }
  assert.deepEqual(specs[2].definition.fixedReferenceAssetIds, ['056', '057', '058-casl-excerpt', '059', '060', '061']
    .map(page => 'asset-ipa-2007h19a-fe-pm-page-' + page));
});

test('3系列の各4条件は有限な入力を持ち、同じ欄と四つの正答署名を保持する', () => {
  const attribution: Attribution = { origin: 'original', sourceRefs: [], rightsRefs: ['rights-original'], creatorIds: ['codex'] };
  for (const { definition } of specs) {
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(definition.fields.map(field => [field.minimum, field.maximum]), [[0, 3]]);
    for (const invalid of [[], [-1], [4], [.5], [NaN], [0, 1], Array<number>(1), Object.assign([0], { wrong: 2 })])
      assert.throws(() => definition.build(invalid), { code: 'PARAMETER_CONSTRAINT' });
    const signatures = new Set<string>(), prompts = new Set<string>();
    const shape = definition.build([0]).prompt.map(block => block.type);
    for (const index of indices) {
      const body = definition.build([index]);
      assert.deepEqual(body, definition.build([index]));
      assert.deepEqual(body.prompt.map(block => block.type), shape);
      prompts.add(JSON.stringify(body.prompt));
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
        assert.equal(new Set(alternatives(body, field)).size, part.choiceIds.length);
        for (const choiceId of part.choiceIds.filter(id => id !== selected[part.id]))
          assert.equal(gradeAnswer(question, { selectedPartChoices: { ...selected, [part.id]: choiceId } }).outcome, 'incorrect');
      });
    }
    assert.equal(prompts.size, 4);
    assert.equal(signatures.size, 4);
  }
});

test('問7のCOBOL全784択組を、今年の照合・履歴の後送・表示対象の絶対差を基に検算する', () => {
  for (const [index, { years, kg }] of [{ years: 5, kg: 5 }, { years: 4, kg: 4 }, { years: 3, kg: 6 }, { years: 6, kg: 7 }].entries()) {
    const body = forQuestion(7, index), [listing] = listings(body, 'cobol');
    const edit = figure(body, '7-change').alt;
    assert.match(prose(body), new RegExp('過去' + years + '年分'));
    assert.match(prose(body), new RegExp(kg + ' kg以上の増減'));
    assert.match(figure(body, '7-master').alt, new RegExp(years + '回繰り返す'));
    const previous = [
      Array.from({ length: years }, (_, n) => 550 + 10 * n),
      Array.from({ length: years }, (_, n) => n ? null : 720),
      Array.from({ length: years }, (_, n) => n ? 680 - n * 30 : 550),
    ];
    const cases = previous.flatMap(record => [-kg * 10 - 1, -kg * 10, -kg * 10 + 1, 0, kg * 10 - 1, kg * 10, kg * 10 + 1]
      .flatMap(delta => [true, false].map(found => ({ record, current: record[0]! + delta, found }))));
    function passed(choices: readonly string[]) {
      return cases.every(({ record, current, found }) => {
        const expected = { master: found ? [current, ...record.slice(0, -1)] : record,
          outputs: !found ? ['MISSING'] : Math.abs(current - record[0]!) >= kg * 10 ? ['HEALTH'] : [] };
        try { return same(executeHealth(listing, edit, choices, record, current, found), expected); }
        catch { return false; }
      });
    }
    const combinations = selections(body).reduce<string[][]>((vectors, set) =>
      vectors.flatMap(prior => set.map(option => [...prior, option])), [[]]);
    assert.equal(combinations.length, 784);
    assert.deepEqual(combinations.filter(passed), [correctValues(body)]);
    assert.match(body.explanation, new RegExp('差が' + kg + ' kgちょうど'));
  }
});

function queueOracle(weights: readonly bigint[], inclusive: boolean) {
  const queue: { label: string; weight: bigint }[] = [];
  for (const [i, weight] of weights.entries()) {
    const suffix = (first: number) => queue.slice(first).reduce((sum, item) => sum + item.weight, 0n);
    const at = Array.from({ length: queue.length + 1 }, (_, at) => at).find(at => inclusive ? suffix(at) <= weight : suffix(at) < weight)!;
    queue.splice(at, 0, { label: String.fromCharCode(97 + i), weight });
  }
  return queue.map(item => item.label);
}
const probe = `public class Probe {
    public static void main(String[] args) {
        for (String sequence : args) {
            WeightedQueue<String> queue = new WeightedQueue<String>();
            System.out.println(queue.poll() == null);
            String[] values = sequence.split(",");
            for (int i = 0; i < values.length; i++) {
                queue.offer(Character.toString((char)('a' + i)), Long.parseLong(values[i]));
            }
            for (int i = 0; i < values.length; i++) {
                System.out.print(queue.poll());
            }
            System.out.println(":" + (queue.poll() == null));
            try {
                queue.offer(null, 1);
                System.out.println("accepted null");
            } catch (NullPointerException error) {
                System.out.println("rejected null");
            }
        }
    }
}`;
function executeJava(folder: string, code: string, tester: string, sequences: readonly bigint[][]) {
  for (const [name, listing] of Object.entries({ WeightedQueue: code, WeightedQueueTester: tester, Probe: probe }))
    writeFileSync(join(folder, name + '.java'), listing);
  const javac = spawnSync('javac', ['--release', '8', '-encoding', 'UTF-8', 'WeightedQueue.java', 'WeightedQueueTester.java', 'Probe.java'],
    { encoding: 'utf8', cwd: folder, timeout: 25000 });
  assert.ifError(javac.error);
  if (javac.status !== 0) { assert.equal(javac.status, 1, javac.stderr); return null; }
  const java = (cls: string, args: string[]) => {
    const command = spawnSync('java', ['-cp', folder, cls, ...args], { encoding: 'utf8', cwd: folder, timeout: 25000 });
    assert.ifError(command.error);
    return command.status === 0 && !command.stderr ? command.stdout.trimEnd() : null;
  };
  return { tester: java('WeightedQueueTester', []), probe: java('Probe', sequences.map(weights => weights.join(','))) };
}
test('問8の全候補をJava 8互換で実コンパイルし、等号境界、重み保存、空及びnullと比較する', () => {
  const sequences = [[1n], [1n,1n], [1n,2n,1n], [2n,1n,3n,3n], [2n,2n,2n,1n,2n],
    [1n,4n,1n,5n,6n,3n], [9223372036854775804n,2n,1n]];
  const folder = mkdtempSync(join(tmpdir(), 'opencbt-2007-autumn-weightedqueue-'));
  try {
    for (const [index, weights] of [[3, 2, 4, 8], [4, 3, 5, 8], [5, 4, 7, 9], [6, 3, 5, 8]].entries()) {
      const body = forQuestion(8, index), [front, back, tester] = listings(body, 'java'), answers = correctValues(body);
      const inclusive = index % 2 === 1;
      assert.match(prose(body), new RegExp('重み' + (inclusive ? '以下' : '未満')));
      assert.match(tester, new RegExp('long\\[\\] w = \\{' + weights.join(', ') + '\\}'));
      const wanted = queueOracle(weights.map(BigInt), inclusive).join('\n');
      assert.equal(figure(body, '8-output').alt, wanted);
      assert.match(figure(body, '8-insert').alt, new RegExp('挿入後は先頭から' + wanted.split('\n')
        .map(label => label + '：' + weights['abcd'.indexOf(label)]).join('，')));
      const expected = { tester: wanted, probe: sequences.map(values => 'true\n' + queueOracle(values, inclusive).join('')
        + ':true\nrejected null').join('\n') };
      for (const part of [0, 1, 2]) oneMatch(body, part, choice => {
        const candidate = blank([front, back].join('\n\n'), replace(answers, part, choice));
        return same(executeJava(folder, candidate, tester, sequences), expected);
      });
      oneMatch(body, 3, option => {
        const destructive = /取得及び削除/.test(option);
        const empty = /nullを返す/.test(option);
        assert(destructive || /削除はしない/.test(option));
        assert(empty || /例外を投げる/.test(option));
        return destructive && empty;
      });
    }
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

const high = 0x8000;
function parityOracle(words: readonly number[], odd: boolean) {
  const adjusted = words.map(word => {
    const ones = [...word.toString(2)].filter(bit => bit === '1').length;
    return word + (ones % 2 === Number(odd) ? 0 : high);
  });
  const parity = Array.from({ length: 16 }, (_, bit) => {
    const populated = adjusted.filter(number => Math.floor(number / 2 ** bit) % 2 === 1).length;
    return populated % 2 * (2 ** bit);
  }).reduce((sum, word) => sum + word, 0);
  return [...adjusted, parity];
}
test('問9のCASL II全48択組を独立命令器と列別偶奇で照合し、全32768語の15ビットを確認する', () => {
  const cases = [[0], [1], [2], [9], [0x4000], [0x2001], [0x7FFF], [0x3FFF], [0x5555, 0x2AAA],
    [0, 17, 58, 127, 0x4000], [0x7FFF,0x7FFF,0x7FFF], [21,0x4300,37]];
  const everyWord = Array.from({ length: 32768 }, (_, index) => index);
  for (const index of indices) {
    const body = forQuestion(9, index), [listing] = listings(body, 'casl2');
    const answers = correctValues(body), options = selections(body);
    const filled = (choices: readonly string[]) => blank(listing, choices);
    const initialized = (program: string, immediate: string) => program.replace(/^( 7\s+LAD\s+GR\d,)0$/m, '$1' + immediate);
    const works = (program: string, inputs: number[], odd: boolean) => {
      try { return same(parityMachine(program, inputs), parityOracle(inputs, odd)); }
      catch { return false; }
    };
    const programs = options[0].flatMap(a => options[1].map(b => [a,b,answers[2]]));
    assert.equal(programs.length, 48);
    assert.deepEqual(programs.filter(choices => cases.every(input => works(filled(choices), input, false))), [answers]);
    oneMatch(body, 2, choice => cases.every(input => works(initialized(filled(answers), choice), input, true)));
    assert(works(filled(answers), everyWord, false));
    assert(works(initialized(filled(answers), answers[2]), everyWord, true));
    const diagram = figure(body, '9-parity').alt;
    assert.match(diagram, /ビット番号13の列は網掛け/);
    const sample = [...diagram.matchAll(/語(?:[0-3]|N−1|N)：([01]) ([01]) ([01]) … ([01])/g)];
    assert.equal(sample.length, 6);
    // The official example has unspecified intervening words. The edited examples set them to zero.
    if (index === 0) {
      assert.deepEqual(sample.at(-1)!.slice(1).map(Number), [0, 1, 1, 0]);
    } else {
      assert.match(diagram, /省略した中間の語は全ビットが0/);
      for (let column = 1; column <= 4; column++) {
        const visibleOnes = sample.slice(0, -1).filter(row => row[column] === '1').length;
        assert.equal(visibleOnes % 2, Number(sample.at(-1)![column]));
      }
    }
  }
});

test('全24図状態に固有の意味があり、原資料の図表の構造と読み上げを保つ', () => {
  assert.equal(figures.length, 6);
  assert.deepEqual(figures.map(item => item.profile), renderers.map(item => item.profile));
  let count = 0;
  for (const index of indices) for (const { definition } of specs) {
    const body = definition.build([index]);
    for (const block of body.prompt.filter((item): item is Extract<Block, { type: 'diagram' }> => item.type === 'diagram')) {
      assert(block.scene.kind === 'source_figure');
      const { profile, values } = block.scene;
      const checker = figures.find(candidate => candidate.profile === profile);
      const renderer = renderers.find(candidate => candidate.profile === profile);
      assert(checker && renderer);
      assert.doesNotThrow(() => checker.validate(values));
      assert.throws(() => checker.validate([4]), { code: 'PARAMETER_CONSTRAINT' });
      assert.equal(checker.alt(values), block.alt);
      const html = renderToStaticMarkup(createElement(renderer.component, { values, caption: block.caption }));
      assert.match(html, /role="group"[\s\S]*aria-description=/);
      assert.match(html, /class="diagram-scroll" tabindex="0"/);
      if (!profile.endsWith('-8-output')) assert.match(html, /<table/);
      if (profile.endsWith('-9-parity')) assert.match(html, /破線列.*パリティビット/);
      count++;
    }
  }
  assert.equal(count, 24);
});
