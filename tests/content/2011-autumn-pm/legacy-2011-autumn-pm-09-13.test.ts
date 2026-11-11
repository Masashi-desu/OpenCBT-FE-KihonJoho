import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import common from '../../../docs/public/schemas/common.schema.json';
import diagram from '../../../docs/public/schemas/diagram.schema.json';
import formula from '../../../docs/public/schemas/formula.schema.json';
import { compoundAnswerSignature, displayedAnswerParts, gradeAnswer, validateAnswerDefinition } from '../../../src/core/answers';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import type { Block, Question } from '../../../src/core/types';
import { autumn2011PmLanguageDrafts as drafts } from '../../../src/core/generators/legacy-2011-autumn-pm-09-13';
import { legacy2011AutumnPm0913Figures as figures } from '../../../src/core/generators/legacy-2011-autumn-pm-09-13-figures';
import { legacy2011AutumnPm0913FigureRenderers as renderers } from '../../../src/ui/Legacy2011AutumnPm0913Figures';

const indices = [0, 1, 2, 3];
const kana = 'アイウエオカキクケコ';
const official = ['エキオキウアカ', 'エカアウオキイ', 'アオキオアイオ', 'イウイイオイ', 'エエイキエウエウ'];
const widths = [[4,10,10,9,9,6,8], [6,6,6,4,8,8,8], [6,8,8,5,5,6,6], [6,6,5,8,5,5], [8,8,8,8,8,8,8,10]];
const sourcePages = [[39,43], [44,48], [49,55], [56,59], [60,68]];
const reviewedBankFingerprints = [
  [
    "79c2d24bce436c7b90f62256a45af7b6b396b21464a72330ee2c2566a8bf326a",
    "79c2d24bce436c7b90f62256a45af7b6b396b21464a72330ee2c2566a8bf326a",
    "79c2d24bce436c7b90f62256a45af7b6b396b21464a72330ee2c2566a8bf326a",
    "79c2d24bce436c7b90f62256a45af7b6b396b21464a72330ee2c2566a8bf326a"
  ],
  [
    "29474df788e92864512fc4d7dc603b580a850c13d6cf9f80d041df18a9bbf468",
    "29474df788e92864512fc4d7dc603b580a850c13d6cf9f80d041df18a9bbf468",
    "29474df788e92864512fc4d7dc603b580a850c13d6cf9f80d041df18a9bbf468",
    "29474df788e92864512fc4d7dc603b580a850c13d6cf9f80d041df18a9bbf468"
  ],
  [
    "2fa4eb039e2a0f4be63341ba1b7af011ebef125bd63c0f60fcd8615ecd8966f5",
    "2fa4eb039e2a0f4be63341ba1b7af011ebef125bd63c0f60fcd8615ecd8966f5",
    "2fa4eb039e2a0f4be63341ba1b7af011ebef125bd63c0f60fcd8615ecd8966f5",
    "2fa4eb039e2a0f4be63341ba1b7af011ebef125bd63c0f60fcd8615ecd8966f5"
  ],
  [
    "a6a94ccac665c6c147341716a3c53077d7e449b2ea279429609aceafef7ef302",
    "a6a94ccac665c6c147341716a3c53077d7e449b2ea279429609aceafef7ef302",
    "a6a94ccac665c6c147341716a3c53077d7e449b2ea279429609aceafef7ef302",
    "a6a94ccac665c6c147341716a3c53077d7e449b2ea279429609aceafef7ef302"
  ],
  [
    "22e4edfffccf5d3ae3ba6cf0a8882de4fbd529819efaaecaefa0eee09e914d83",
    "22e4edfffccf5d3ae3ba6cf0a8882de4fbd529819efaaecaefa0eee09e914d83",
    "bdd907764870a60d56f4efbd5bf0e5d8b21a5b63588e913e2dd6a918ce4d6d50",
    "bdd907764870a60d56f4efbd5bf0e5d8b21a5b63588e913e2dd6a918ce4d6d50"
  ]
];
const schema = new Ajv({ strict: false });
addFormats(schema);
schema.addSchema([common, diagram, formula]);
const validateBlock = schema.getSchema(common.$id + '#/$defs/block')!;
assert(validateBlock);
const cases = (number: number) => indices.map(index => drafts[number - 9].definition.build([index]));
const blockText = (block: Block) => 'text' in block ? block.text : '';
const sourceText = (body: GeneratedBody) => body.prompt.map(blockText).join('\n');
const programs = (body: GeneratedBody, language: string) => body.prompt.flatMap(block => block.type === 'code' && block.language === language ? [block.text] : []);
const part = (body: GeneratedBody, id: string) => body.answerParts!.find(item => item.id === 'part-' + id)!;
const option = (body: GeneratedBody, id: string) => body.choices[Number(id.split('-').at(-1)) - 1].map(blockText).join('\n');
const options = (body: GeneratedBody, id: string) => part(body, id).choiceIds.map(choice => option(body, choice));
function answerChoices(body: GeneratedBody) {
  return Object.fromEntries(body.partAnswers!.flatMap(answer => answer.kind === 'choice' ? [[answer.partId, answer.choiceId]]
    : answer.kind === 'unordered' ? answer.partIds.map((id, i) => [id, answer.choiceIds[i]]) : []));
}
const selected = (body: GeneratedBody, id: string) => option(body, answerChoices(body)['part-' + id]);
const bind = (text: string, body: GeneratedBody) => text.replace(/［([a-z])］/g, (_, id: string) => selected(body, id));
function accepts(body: GeneratedBody, id: string, predicate: (value: string, index: number) => boolean) {
  assert.deepEqual(options(body, id).filter(predicate), [selected(body, id)], id);
}
function asQuestion(body: GeneratedBody): Question {
  return {
    id: 'question-language-semantic-check',
    choices: body.choices.map((blocks, index) => ({ id: 'choice-value-' + (index + 1), content: { blocks } })),
    answerParts: body.answerParts,
    correctAnswer: { parts: body.partAnswers },
  } as Question;
}
function grid(suffix: string, index: number) {
  const matches = figures.filter(figure => figure.profile.endsWith('-' + suffix));
  assert.equal(matches.length, 1, suffix);
  const panel = matches[0].panel([index]);
  assert.equal(panel.kind, 'grids');
  return panel.tables;
}
function run(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 20_000 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}
function temporary(call: (directory: string) => void) {
  const directory = mkdtempSync(join(tmpdir(), 'opencbt-2011-autumn-pm-'));
  try { call(directory); } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('2011秋午後問9〜13の30原頁・34採点欄・35保存枠・全20条件を公開Block Schemaで検査する', () => {
  const seenProfiles = new Set<string>();
  let scoreFields = 0, savedSlots = 0;
  drafts.forEach(({ definition, originalPageAlt }, i) => {
    const number = i + 9, [first, last] = sourcePages[i];
    assert.equal(definition.source, '2011h23a-fe-pm-' + number);
    assert.equal(definition.sourceAnswer, official[i]);
    assert.deepEqual(definition.reference, [0]);
    assert.deepEqual(Object.keys(originalPageAlt()).map(Number), Array.from({ length: last - first + 1 }, (_, index) => first + index));
    assert(Object.values(originalPageAlt()).every(text => text.length > 100));
    for (const invalid of [[], [-1], [4], [0.1], [0, 0]]) assert.throws(() => definition.build(invalid));
    const prompts = new Set<string>(), signatures = new Set<string>();
    for (const [index, body] of cases(number).entries()) {
      const q = asQuestion(body);
      validateAnswerDefinition(q);
      assert.deepEqual(body.answerParts!.map(item => item.choiceIds.length), widths[i]);
      const blocks = [...body.prompt, ...body.choices.flat(), ...(body.contexts ?? []).flatMap(context => context.blocks)];
      for (const block of blocks) {
        assert(validateBlock(block), definition.source + ': ' + JSON.stringify(validateBlock.errors));
        if (block.type !== 'diagram') continue;
        const scene = block.scene;
        assert.equal(scene.kind, 'source_figure');
        const renderer = renderers.find(item => item.profile === scene.profile)!;
        assert(renderer);
        seenProfiles.add(scene.profile);
        const markup = renderToStaticMarkup(createElement(renderer.component, { caption: block.caption, values: scene.values }));
        assert.match(markup, /<figure[^>]*role="group"[^>]*aria-description=/);
        assert.match(markup, /class="diagram-scroll"/);
        assert.match(markup, /<table/);
        const figure = figures.find(item => item.profile === scene.profile)!;
        assert.equal(block.alt, figure.alt(scene.values));
      }
      const contextAssets = (body.contexts ?? []).flatMap(context => context.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : []));
      assert.deepEqual(contextAssets, definition.fixedReferenceAssetIds ?? []);
      assert(!contextAssets.some(id => /p069|p070|p073$/.test(id)));
      const selectedPartChoices = answerChoices(body);
      assert.equal(gradeAnswer(q, { selectedPartChoices }).outcome, 'correct');
      const signature = compoundAnswerSignature(q);
      signatures.add(signature);
      const banks = body.answerParts!.map(item => item.choiceIds.map(id => body.choices[Number(id.split('-').at(-1)) - 1]));
      assert.equal(createHash('sha256').update(JSON.stringify(banks)).digest('hex'), reviewedBankFingerprints[i][index]);
      if (!index) {
        scoreFields += displayedAnswerParts(q).length;
        savedSlots += body.answerParts!.length;
        const key = body.answerParts!.map(item => kana[item.choiceIds.indexOf(selectedPartChoices[item.id])]).join('');
        assert.equal(key, official[i]);
      }
      prompts.add(JSON.stringify(body.prompt));
    }
    assert.equal(prompts.size, 4);
    assert.equal(signatures.size, definition.answerVariation === 'fixed' ? 1 : 4);
  });
  assert.equal(scoreFields, 34);
  assert.equal(savedSlots, 35);
  assert.equal(figures.length, 13);
  assert.deepEqual([...seenProfiles].sort(), figures.map(figure => figure.profile).sort());
});

function decimalReference(numerator: number, denominator: number) {
  const residues: bigint[] = [];
  const d = BigInt(denominator);
  const n = BigInt(numerator);
  let scaled = n, digits = '';
  for (let i = 0; i <= 100; i++) {
    const residue = scaled % d;
    if (residue === 0n) return '0.' + digits;
    const repeated = residues.indexOf(residue);
    if (repeated >= 0) return '0.' + digits.slice(0, repeated) + '[' + digits.slice(repeated) + ']';
    if (i === 100) break;
    residues.push(residue);
    scaled *= 10n;
    digits += (scaled / d) % 10n;
  }
  return '0.' + digits + '...';
}

test('問9のC原コードと全候補をネイティブ実行し、整数筆算で検算する', () => temporary(directory => {
  for (const body of cases(9)) {
    const calls = [...sourceText(body).matchAll(/(printRational|recurringDecimal)\((\d+), (\d+)\) を実行した場合/g)];
    assert.equal(calls.length, 4);
    const inputs = calls.map(([, , n, d]) => [Number(n), Number(d)]);
    const expected = inputs.map(([n, d]) => decimalReference(n, d));
    assert.deepEqual(programs(body, 'text').map(value => value.replaceAll('\n', '')), expected.slice(1));
    const [first, second] = programs(body, 'c');
    const harness = 'int main(void) {\n' + calls.map(([, fn, n, d]) => '    ' + fn + '(' + n + ', ' + d + ');').join('\n') + '\n    return 0;\n}';
    writeFileSync(join(directory, 'decimal.c'), first.replace(/^ *\d+  /gm, '') + '\n' + bind(second, body) + '\n' + harness + '\n');
    run('cc', ['-std=c11', '-Wall', '-Wextra', '-Werror', 'decimal.c', '-o', 'decimal'], directory);
    assert.deepEqual(run(join(directory, 'decimal'), [], directory).trim().split('\n'), expected);
    accepts(body, 'a', text => text.includes('除算が乗算よりも先') && text.endsWith('出力されない'));
    accepts(body, 'b', value => Number(value) === (10 * inputs[0][0]) % inputs[0][1]);
    accepts(body, 'c', value => Number(value) === expected[0].length - 1);
    accepts(body, 'd', value => /startRepeat == -1/.test(value));
    accepts(body, 'e', value => value === 'i < ri');
    accepts(body, 'f', value => value === 'i == startRepeat');
    accepts(body, 'g', value => value === "'0' + xHistory[i] * 10 / y");
  }
}));

test('問10の順ファイル・添字・整列手続きの全選択肢を別モデルで照合する', () => {
  const sortingInputs = [
    ['A01', 3], ['A02', 11], ['A03', 8], ['B01', 21], ['H20', 4],
  ] as const;
  for (const [index, body] of cases(10).entries()) {
    const visible = grid('count-printout', index)[0].rows.filter(row => row[0] !== '：');
    const records = visible.flatMap(([segment, count], i) => Array.from({ length: Number(count) }, (_, n) => String(10000 + i * 1000 + n) + segment));
    const expected = Object.entries(records.reduce<Record<string, number>>((counts, rec) => {
      const segment = rec.slice(5); counts[segment] = (counts[segment] ?? 0) + 1; return counts;
    }, {}));
    assert.deepEqual(expected, visible.map(([segment, n]) => [segment, Number(n)]));
    const instructions = sourceText(body);
    const ascending = instructions.includes('少ない順') || instructions.includes('昇順');
    const count = instructions.includes('申込者数の');
    const compare = (left: typeof sortingInputs[number], right: typeof sortingInputs[number]) =>
      count ? left[1] - right[1] : left[0].localeCompare(right[0]);
    const ordered = [...sortingInputs].sort((a, b) => (ascending ? 1 : -1) * compare(a, b)).map(row => row[0]);
    accepts(body, 'd', value => {
      const descending = value.startsWith('DESCENDING');
      const byCount = value.endsWith('SORT-S');
      return [...sortingInputs].sort((a, b) => (descending ? -1 : 1) * (byCount ? a[1] - b[1] : a[0].localeCompare(b[0]))).map(row => row[0]).join() === ordered.join();
    });
    accepts(body, 'a', value => value === 'SET TEST-IDX TO 1');
    accepts(body, 'b', value => value === 'TEST-W3');
    accepts(body, 'c', value => value === 'SUM-WK(LOOP1 LOOP2)');
    for (const [id, verb, subject] of [['e','RELEASE','SORT-REC'], ['f','RETURN','TEST-SORT-FILE'], ['g','END-RETURN','']])
      accepts(body, id, value => value === (verb + ' ' + subject).trim());
  }
});

test('問11はJava原コードで全6択を実行し、チェックリストの順序と採点・保存枠を照合する', () => temporary(directory => {
  for (const [index, body] of cases(11).entries()) {
    const java = programs(body, 'java');
    assert.equal(java.length, 10);
    const parts = [java.slice(0, 2), java.slice(2, 4), java.slice(4, 6), [java[6]], [java[7]], java.slice(8)];
    const names = ['Name', 'Address', 'AddressBook', 'SearchCriteria', 'Searchable', 'Test'];
    const samples = options(body, '2');
    parts[5][1] = parts[5][1].replace(/\n    }\n}$/, '\n' + samples.map(expression =>
      '        try { System.out.println(' + expression + '.size()); } catch (NullPointerException e) { System.out.println("null"); }').join('\n') + '\n    }\n}');
    for (const [i, content] of parts.entries()) writeFileSync(join(directory, names[i] + '.java'), bind(content.join('\n'), body) + '\n');
    run('javac', ['-encoding', 'UTF-8', ...names.map(name => name + '.java')], directory);
    const lines = run('java', ['-cp', directory, 'Test'], directory).trim().split('\n');
    const rendered = figures.find(figure => figure.profile.endsWith('-test-output'))!.panel([index]);
    assert.equal(rendered.kind, 'output');
    const unordered = (value: string) => value.slice(1, -1).split(', ').filter(Boolean).sort();
    assert.deepEqual(lines.slice(0, 2).map(unordered), rendered.text.split('\n').map(unordered));
    const group = body.partAnswers!.at(-1)!;
    assert.equal(group.kind, 'unordered');
    assert.equal(group.presentation, 'checklist');
    assert.deepEqual(group.partIds, ['part-2', 'part-3']);
    assert.deepEqual(lines.slice(2), ['0','4','null','0','4','null']);
    assert.deepEqual(samples.filter((_, i) => lines[2 + i] === '4'), group.choiceIds.map(id => option(body, id)));
    accepts(body, 'a', value => value === 'SearchCriteria');
    accepts(body, 'b', value => value === 'result.add(entry)');
    accepts(body, 'c', value => value === 'result.remove(entry)');
    accepts(body, 'd', value => value === 'SearchCriteria');
    accepts(body, 'e', value => value === 'Address.Criteria');
    const q = asQuestion(body), choices = answerChoices(body);
    assert.deepEqual(displayedAnswerParts(q).map(item => item.label), ['設問1 a','設問1 b','設問1 c','設問1 d','設問1 e','設問2']);
    assert.equal(gradeAnswer(q, { selectedPartChoices: { ...choices, 'part-2': choices['part-3'], 'part-3': choices['part-2'] } }).outcome, 'correct');
    assert.equal(gradeAnswer(q, { selectedPartChoices: { ...choices, 'part-3': part(body, '3').choiceIds[0] } }).outcome, 'incorrect');
    assert.throws(() => gradeAnswer(q, { selectedPartChoices: { ...choices, 'part-3': choices['part-2'] } }));
    delete choices['part-3'];
    assert.equal(gradeAnswer(q, { selectedPartChoices: choices }).outcome, 'unanswered');
  }
}));

type Instruction = { command: string; operands: string[] };
function assemble(program: string) {
  const labels = new Map<string, number>(), instructions: Instruction[] = [], data = new Map<number, number>();
  let address = 500;
  for (const line of program.split('\n')) {
    const source = line.split(';')[0].trimEnd();
    if (!source) continue;
    const [label, command, ...operands] = source.trim().split(/ +/);
    const withLabel = !/^\s/.test(source);
    const opcode = withLabel ? command : label;
    const args = (withLabel ? operands : [command, ...operands]).filter(Boolean).join('').split(',').filter(Boolean);
    if (withLabel) labels.set(label, opcode === 'DC' ? address : instructions.length);
    if (opcode === 'DC') data.set(address++, Number(args[0]));
    else if (opcode !== 'START' && opcode !== 'END') instructions.push({ command: opcode, operands: args });
  }
  return { labels, instructions, data };
}
const word = (value: number) => value & 0xFFFF;
function caslMachine(main: string, division: string, initial: [number, number, number], divisor?: number, budget = 1_000_000) {
  const entry = assemble(main), routine = assemble(division);
  const memory = new Map(entry.data);
  if (divisor !== undefined) {
    memory.set(initial[2], divisor >>> 16);
    memory.set(initial[2] + 1, word(divisor));
  }
  const r = [0, ...initial, 0, 0, 0xA120, 0xB320];
  let last = 0, overflow = false;
  const stack: number[] = [];
  const reg = (text: string) => Number(text.slice(2));
  const number = (text: string) => text === "='0'" ? 0x30 : text.startsWith('=#') ? Number.parseInt(text.slice(2), 16) : Number(text.replace(/^=/, ''));
  function execute(program: ReturnType<typeof assemble>) {
    let ip = 0;
    while (ip >= 0 && ip < program.instructions.length) {
      if (--budget < 0) throw Error('CASL test instruction limit');
      const { command, operands: [a,b,c] } = program.instructions[ip++];
      const address = (base: string, index?: string) => word((program.labels.get(base) ?? number(base)) + (index ? r[reg(index)] : 0));
      const source = (value: string, index?: string) => value.startsWith('GR') ? r[reg(value)]
        : value.startsWith('=') ? number(value) : memory.get(address(value, index)) ?? 0;
      const jump = () => { ip = program.labels.get(a)!; };
      switch (command) {
        case 'PUSH': stack.push(address(a, b)); break;
        case 'POP': r[reg(a)] = stack.pop()!; break;
        case 'RPUSH': stack.push(...r.slice(1)); break;
        case 'RPOP': for (let i = 7; i > 0; i--) r[i] = stack.pop()!; break;
        case 'LD': last = r[reg(a)] = source(b, c); overflow = false; break;
        case 'LAD': r[reg(a)] = address(b, c); break;
        case 'ST': memory.set(address(b, c), r[reg(a)]); break;
        case 'ADDL': case 'SUBL': case 'OR': {
          const left = r[reg(a)], right = source(b, c);
          const result = command === 'ADDL' ? left + right : command === 'SUBL' ? left - right : left | right;
          last = r[reg(a)] = word(result);
          overflow = result !== last;
          break;
        }
        case 'CPL': last = r[reg(a)] - source(b, c); overflow = false; break;
        case 'JZE': if (last === 0) jump(); break;
        case 'JOV': if (overflow) jump(); break;
        case 'JMI': if (last < 0 || (last & 0x8000)) jump(); break;
        case 'JPL': if (last > 0 && !(last & 0x8000)) jump(); break;
        case 'JUMP': jump(); break;
        case 'CALL': assert.equal(a, 'DIV'); execute(routine); break;
        case 'RET': return;
        default: throw Error('Unexpected CASL opcode: ' + command);
      }
    }
  }
  execute(entry);
  return { registers: r, memory };
}
function override(program: string, body: GeneratedBody, id: string, value: string) {
  return bind(program.replaceAll('［' + id + '］', value), body);
}

test('問12はCASL II原コードを16ビット機械モデルで実行し、全択と全例を独立検算する', () => {
  for (const [index, body] of cases(12).entries()) {
    const [first, rest, upper, lower] = programs(body, 'casl2');
    const division = [first, rest].join('\n'), div = bind(division, body);
    const runDivision = (program: string, n: number, d: number, budget?: number) => {
      const { registers } = caslMachine(program, program, [n >>> 16, word(n), 1000], d, budget);
      return [registers[1] * 65536 + registers[2], registers[4] * 65536 + registers[5], registers[6], registers[7]];
    };
    const divCases = [[0, 3], [0x10000, 0xFFFF], [0x30001, 0x10003], [0x8000, 0x8000]];
    for (const [n,d] of [...divCases, [0x10001,1]])
      assert.deepEqual(runDivision(div, n, d), [Math.floor(n/d), n%d, 0xA120, 0xB320]);
    for (const id of ['a','b']) accepts(body, id, choice => divCases.every(([n,d]) => {
      try { return runDivision(override(division, body, id, choice), n, d, 3000).slice(0, 2).join() === [Math.floor(n/d), n%d].join(); }
      catch { return false; }
    }));
    const example = grid('conversion-example', index);
    const n = Number.parseInt(example[0].rows.map(row => row[1]).join(''), 16);
    const expected = String(n).padStart(5, '0');
    assert.equal(example[1].rows[0].slice(1).map(value => value[1]).join(''), expected);
    assert(sourceText(body).includes(n.toString(16).toUpperCase().padStart(8, '0')));
    function output(program: string, value: number, budget?: number) {
      const { registers, memory } = caslMachine(program, div, [value >>> 16, word(value), 1200], undefined, budget);
      assert.deepEqual(registers, [0, value >>> 16, word(value), 1200, 0, 0, 0xA120, 0xB320]);
      return String.fromCharCode(...Array.from({ length: 5 }, (_, i) => memory.get(1200+i) ?? 0));
    }
    for (const program of [upper,lower]) assert.equal(output(bind(program, body), n), expected);
    for (const [id, program] of [['c',upper],['d',upper],['e',lower],['f',lower]]) accepts(body, id, choice =>
      [1,24,679,1357].every(value => {
        try { return output(override(program, body, id, choice), value, 3000) === String(value).padStart(5, '0'); }
        catch { return false; }
      }));
  }
});

test('問13の年齢境界・照合・新賞与・反復条件と相対参照を全択検算する', () => {
  const rankSalary = [200,150,100,50,0], evalKeys = [1,21,41,61,81], evalValues = [0.75,0.85,1,1.15,1.25];
  for (const [index, body] of cases(13).entries()) {
    const source = sourceText(body);
    const ageBoundary = Number(source.match(/年齢が(\d+)歳未満/)?.[1]);
    const limitRate = Number(source.match(/本部利益の (\d+)%/)?.[1]);
    assert([47,48,49,50].includes(ageBoundary));
    assert([12,15,18,20].includes(limitRate));
    const amounts = (rank: number, age: number, score: number, points = 0) => {
      const agePay = age >= ageBoundary ? 350 : age * 7;
      const pay = agePay + rankSalary[rank - 1];
      const coefficient = evalValues[evalKeys.filter(key => score >= key).length - 1];
      const roleFactor = 4 - rank / 2;
      const gain = (roleFactor + coefficient) * pay + (pay * points) / (rank <= 3 ? 10 : 20);
      return { agePay, pay, gain, roleFactor, coefficient };
    };
    const baseRows = grid('base-pay-sheet', index)[0].rows.filter(row => /^H\d/.test(row[1]));
    const table = grid('revised-pay-sheet', index)[0];
    const revisedRows = table.rows.filter(row => /^H\d/.test(row[1]));
    assert.equal(baseRows.length, 13);
    const read = (input: string) => Number(input.replaceAll(',', ''));
    for (const [i, row] of baseRows.entries()) {
      const rank = read(row[3]), age = read(row[5]), score = read(row[10]);
      const base = amounts(rank, age, score), revised = amounts(rank, age, score, read(revisedRows[i][10]));
      assert.deepEqual(row.slice(6).map(read), [rankSalary[rank-1], base.agePay, base.pay, base.roleFactor, score, base.coefficient, Math.round(base.gain + 1e-9)]);
      assert.equal(read(revisedRows[i][0]), read(row[0]) + 4);
      assert.equal(read(revisedRows[i].at(-1)!), Math.round(revised.gain + 1e-9));
    }
    assert.deepEqual(table.headers, ['', 'A', 'B', 'C', 'D', '…', 'H', 'I', 'J', 'K', 'L', 'M']);
    const summary = table.rows.slice(1,4);
    assert.deepEqual(summary.map(row => read(row[10])), [20,15,6]);
    for (const row of summary) {
      assert.equal(Math.round(read(row[8]) * limitRate / 100), read(row[9]));
      assert(read(row[11]) <= read(row[9]));
    }
    accepts(body, 'a', value => /垂直照合\(C2, 役職給!B\$2～C\$6, 2, 0\)/.test(value));
    accepts(body, 'b', value => {
      const [, sign, cutoff, cell] = value.match(/E2([＜≦≧])(\d+), (C2|E2)/)!;
      const conditional = (age: number) => sign === '＜' ? age < +cutoff : sign === '≦' ? age <= +cutoff : age >= +cutoff;
      return Array.from({ length: 70 }, (_, i) => i + 18).every(age =>
        (conditional(age) ? (cell === 'C2' ? 3 : age)*7 : 350) === amounts(3,age,55).agePay);
    });
    accepts(body, 'c', value => /垂直照合\(J2, 賞与係数!A\$11～B\$15, 2, 1\)/.test(value));
    accepts(body, 'd', value => {
      const [, sign, first, second] = value.match(/C6(＜|≦)3, L6／(\d+), L6／(\d+)/)!;
      return [1,3,4,5].every(rank => {
        const { pay, gain } = amounts(rank,40,35), plus = 6 / ((sign === '＜' ? rank < 3 : rank <= 3) ? +first : +second);
        const actual = gain + plus * (value.includes('K6＋IF') ? pay : 1);
        return Math.abs(actual - amounts(rank,40,35,6).gain) < 1e-8;
      });
    });
    accepts(body, 'e', value => /^条件付合計\(D\$6～D\$112, ＝I2, M\$6～M\$112\)$/.test(value));
    accepts(body, 'f', value => {
      const [, from, sign, to] = value.match(/row: (\d+), row ([＜≦]) (\d+)/)!;
      const last = +to - Number(sign === '＜');
      return Array.from({ length: last - +from + 1 }, (_, offset) => 1 + +from + offset).join() === '2,3,4';
    });
    const synthetic = [[1,35,22],[3,49,40],[5,52,81]];
    const total = (points: number) => synthetic.reduce((result, [rank,age,score]) => result + amounts(rank,age,score,points).gain, 0);
    for (const limit of [0, total(1), total(7) + 1, total(20), total(30)]) {
      const want = Math.max(0, ...Array.from({ length: 20 }, (_, i) => i+1).filter(p => total(p) <= limit));
      let proposed = 1;
      while (total(proposed) <= limit && proposed <= 20) proposed++;
      assert.equal(proposed - 1, want);
    }
    accepts(body, 'g', value => value === '論理積(相対(L1, row, 1) ≦ 相対(L1, row, −1), DeptPoint ≦ 20)');
    accepts(body, 'h', value => {
      const [, baseRow, column, sign, delta] = value.match(/相対\(L(\d), row, (0|−1)\) ← DeptPoint(?: ([＋−]) (1))?/) ?? [];
      return +baseRow === 1 && +column === 0 && sign === '−' && +delta === 1;
    });
  }
});
