import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import test from 'node:test';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { autumn2005Pm10To13Specs as specs } from '../../../scripts/legacy-2005-autumn-pm-10-13-specs';
import { legacy2005AutumnPm1013Figures as figures } from '../../../src/core/generators/legacy-2005-autumn-pm-10-13-figures';
import { legacy2005AutumnPm1013FigureRenderers as renderers } from '../../../src/ui/Legacy2005AutumnPm1013Figures';

const ids = 'アイウエオカキクケコ';
function alternatives(body: GeneratedBody, name: string) {
  const part = body.answerParts!.find(candidate => candidate.id === 'part-' + name)!;
  return part.choiceIds.map(id => body.choices[Number(id.split('-').at(-1)) - 1].map(block => {
    if (block.type === 'table') return block.rows.map(row => row.join('｜')).join('\n');
    assert(block.type === 'code' || block.type === 'paragraph');
    return block.text;
  }).join('\n'));
}
function selected(body: GeneratedBody, name: string) {
  const answer = body.partAnswers!.find(candidate => candidate.kind === 'choice' && candidate.partId === 'part-' + name);
  assert(answer?.kind === 'choice');
  return body.answerParts!.find(part => part.id === answer.partId)!.choiceIds.indexOf(answer.choiceId);
}
function expectUnique(body: GeneratedBody, name: string, predicate: (choice: string) => boolean) {
  const candidates = alternatives(body, name);
  assert.deepEqual(candidates.flatMap((choice, index) => predicate(choice) ? [index] : []), [selected(body, name)], name);
}
const prose = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
const codeBlocks = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'code' ? [block.text] : []);
const figureAlt = (body: GeneratedBody, suffix: string) => body.prompt.flatMap(block =>
  block.type === 'diagram' && block.id.endsWith(suffix) ? [block.alt] : [])[0];

test('公式の17欄と原問別ページ・解答群を保持し、4入力の表示・説明が変化する', () => {
  assert.deepEqual(specs.map(row => [row.number, row.pages]), [
    [11, [46, 47, 48, 49, 50]], [12, [51, 52, 53, 54, 55, 56]], [13, [57, 58, 59, 60, 61]],
  ]);
  const expectedFields = [[4, 3, 6, 5, 6, 4], [5, 5, 5, 10, 10, 10], [6, 7, 5, 6, 6]];
  const originalKeys = ['エアオエウウ', 'エオウエオコ', 'イウオカウ'];
  for (const [i, spec] of specs.entries()) {
    const bodies = [0, 1, 2, 3].map(index => spec.definition.build([index]));
    const fieldIds = spec.original.answerParts!.map(part => part.id.slice(5));
    assert.equal(fieldIds.map(name => ids[selected(spec.original, name)]).join(''), originalKeys[i]);
    assert.equal(spec.definition.sourceAnswer, originalKeys[i]);
    assert.equal(new Set(bodies.map(body => prose(body))).size, 4);
    assert.equal(new Set(bodies.map(body => body.explanation)).size, 4);
    for (const body of [spec.original, ...bodies]) {
      assert.deepEqual(body.answerParts!.map(part => part.choiceIds.length), expectedFields[i]);
      assert.deepEqual(body.answerParts!.map(part => part.id.slice(5)), fieldIds);
      for (const name of fieldIds) {
        const options = alternatives(body, name);
        assert.equal(new Set(options).size, options.length);
      }
    }
    for (const invalid of [[], [-1], [0.5], [4], [0, 0]]) assert.throws(() => spec.definition.build(invalid));
  }
  const assets = specs[2].definition.fixedReferenceAssetIds!;
  assert.deepEqual(assets.map(asset => Number(asset.match(/page-(\d+)/)![1])), [62, 63, 64, 65, 66, 67]);
  assert(assets[2].endsWith('-casl-excerpt'));
});

test('決定表・変更表・走査図・座席語形式が全条件で同じアクセシブルな値を表示する', () => {
  assert.deepEqual(figures.map(figure => figure.profile), renderers.map(renderer => renderer.profile));
  const escaped = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
  for (let index = 0; index < 4; index++) {
    const drawings = specs.flatMap(spec => spec.definition.build([index]).prompt)
      .filter(block => block.type === 'diagram');
    assert.equal(drawings.length, figures.length);
    for (const drawing of drawings) {
      assert(drawing.scene.kind === 'source_figure');
      const { profile, values } = drawing.scene;
      const figure = figures.find(figure => figure.profile === profile)!;
      const renderer = renderers.find(renderer => renderer.profile === profile)!;
      figure.validate(values);
      assert.equal(figure.alt(values), drawing.alt);
      const markup = renderToStaticMarkup(createElement(renderer.component, { caption: drawing.caption, values }));
      assert(markup.includes('role="img"') && markup.includes('aria-labelledby=') && markup.includes('aria-describedby='));
      assert(markup.includes('>' + escaped(drawing.caption) + '</title>'));
      assert(markup.includes('>' + escaped(drawing.alt) + '</desc>'));
    }
  }
});

test('問11: 検索フラグと暦月の条件を使い、COBOLの全候補の真偽を五つの入力版で照合する', () => {
  const spec = specs[0];
  for (const body of [spec.original, ...[0, 1, 2, 3].map(i => spec.definition.build([i]))]) {
    const months = Number(prose(body).match(/(\d+)か月以内/)![1]);
    const decision = figureAlt(body, 'flag-decision-table').split('\n');
    const actions = decision.slice(-4).map(row => row.split('｜'));
    assert(decision[2].includes(months / 12 + '年未満'));
    const expectedFlags = [[' ', ' '], [' ', '1'], [' ', ' '], ['1', ' ']];
    expectUnique(body, 'a', option => expectedFlags.every((flags, column) => {
      const result = [' ', ' '];
      option.split('\n').forEach((text, row) => {
        const match = /^フラグ([12])に/.exec(text)!;
        if (actions[row][column] === 'X') result[Number(match[1]) - 1] = text.includes('空白') ? ' ' : '1';
      });
      return JSON.stringify(result) === JSON.stringify(flags);
    }));
    const usesDateAndNumericView = (option: string) => {
      const [dateField, numericField] = option.split('\n');
      return /W-YEAR1\s+PIC X\(6\)/.test(dateField) &&
        /W-YEAR2 REDEFINES W-YEAR1\s+PIC 9\(6\)/.test(numericField);
    };
    expectUnique(body, 'b', usesDateAndNumericView);
    assert.match(codeBlocks(body).join('\n'), /MOVE M-DATE TO W-YEAR1\.\n\s+36\s+IF L-YEAR - W-YEAR2 < \[c\] THEN/);
    const dates = Array.from({ length: 12 }, (_, i) => i + 1).flatMap(month =>
      Array.from({ length: months + 2 }, (_, age) => {
        const joined = new Date(Date.UTC(2004, month - 1, 10));
        const now = new Date(Date.UTC(2004, month - 1 + age, 1));
        const decimal = (date: Date) => date.toISOString().slice(0, 7).replace('-', '');
        return { age, difference: Number(decimal(now)) - Number(decimal(joined)) };
      }));
    expectUnique(body, 'c', option => dates.every(({ age, difference }) => (age < months) === (difference < Number(option))));
    assert(body.explanation.includes(months + 'か月以内'));
  }
});

test('問11: 修正IDを0〜9で列挙し、対象桁以外の保持、欠番なし、最大9件を全候補で確認する', () => {
  const spec = specs[0];
  for (const body of [spec.original, ...[0, 1, 2, 3].map(i => spec.definition.build([i]))]) {
    const position = Number(figureAlt(body, 'program-changes').match(/IF X NOT = L-NUM\((\d+)\)/)![1]);
    const prosePosition = Number(/左から(\d+)番目/.exec(prose(body))?.[1] ?? '6');
    assert.equal(position, prosePosition);
    const digits = '0123456789';
    const testedIds = [...digits].map(digit => '123456'.slice(0, position - 1) + digit + '123456'.slice(position));
    const replacement = (id: string, start: number, width: number, value: string) =>
      id.slice(0, start - 1) + value.substring(0, width).padEnd(width, ' ') + id.slice(start - 1 + width);
    const independent = (id: string) => [...digits].map(digit => replacement(id, position, 1, digit)).filter(key => key !== id);
    const completes = (candidate: string, x: number) => {
      const [left, op, right] = candidate.split(' ');
      assert.equal(left, 'X');
      return op === '=' ? x === Number(right) : x > Number(right);
    };
    expectUnique(body, 'd', option => testedIds.every(id => {
      const candidates = [];
      for (let x = 0; x < 12 && !completes(option, x); x++) {
        if (String(x) !== id[position - 1]) candidates.push(replacement(id, position, 1, String(x % 10)));
      }
      return JSON.stringify(candidates) === JSON.stringify(independent(id));
    }));
    expectUnique(body, 'e', option => testedIds.every(id => {
      const keys = [...digits].filter(digit => digit !== id[position - 1]).map(digit => {
        // Random READのINVALID後にはレコード領域の値を仮定できない。
        const before = option.includes('MOVE L-ID TO M-ID') ? id : '??????';
        const numeric = /MOVE X TO M-NUM\((\d+|X)\)/.exec(option);
        const alpha = /MOVE X TO M-ID\((\d+):\)/.exec(option);
        if (numeric) {
          const index = numeric[1] === 'X' ? Number(digit) : Number(numeric[1]);
          return index < 1 || index > 6 ? undefined : replacement(before, index, 1, digit);
        }
        return alpha ? replacement(before, Number(alpha[1]), 7 - Number(alpha[1]), '0' + digit) : before;
      });
      return JSON.stringify(keys) === JSON.stringify(independent(id));
    }));
    expectUnique(body, 'f', option => Array.from({ length: 1024 }, (_, mask) => mask).every(mask => {
      const found = [...digits].filter(digit => digit !== '3' && ((1 << Number(digit)) & mask) !== 0);
      return found.every((digit, offset) => {
        const [variable, increment] = option.split(' + ');
        const x = Number(digit), y = offset + 1;
        return (variable === 'X' ? x : y) + Number(increment ?? 0) === offset + 1;
      });
    }));
  }
});

function railConditions(body: GeneratedBody) {
  const text = prose(body);
  const fareTerms = /距離が(\d+) kmまでは(\d+)円.*それを超えると(\d+) kmごとに(\d+)円/.exec(text);
  const example = /例えば，距離が(\d+) kmの場合，運賃は(\d+)円/.exec(text);
  const timing = /発券した時刻から(\d+)時間以内/.exec(text);
  assert(fareTerms && example && timing);
  const [boundary, baseFare, incrementKm, incrementYen] = fareTerms.slice(1).map(Number);
  const expectedFare = (distance: number) => {
    let fare = baseFare;
    for (let covered = boundary; covered < distance; covered += incrementKm) fare += incrementYen;
    return fare;
  };
  assert.equal(expectedFare(Number(example[1])), Number(example[2]));
  return { boundary, baseFare, incrementKm, incrementYen, elapsed: Number(timing[1]), expectedFare };
}

test('問12: 路線・継承・期限条件から各欄の全選択肢を照合する', () => {
  const spec = specs[1];
  for (const body of [spec.original, ...[0, 1, 2, 3].map(i => spec.definition.build([i]))]) {
    const { baseFare, elapsed, expectedFare } = railConditions(body);
    const endpoints = Array.from(codeBlocks(body)[0].matchAll(/new Gate\("([A-D])", (\d+)\)/g));
    assert.equal(endpoints.length, 4);
    const distances = endpoints.map(match => Number(match[2]));
    const maxFare = expectedFare(distances[3] - distances[0]);
    expectUnique(body, 'a', option => endpoints.every(([, station]) => {
      const argument = /setOrigin\((.+)\)/.exec(option)![1];
      return (argument === 'this' ? station : argument.replace('Line.', '')) === station;
    }));
    const permitted: Record<string, (amount: number, fare: number) => boolean> = {
      '<': (amount, fare) => amount < fare, '<=': (amount, fare) => amount <= fare,
      '==': (amount, fare) => amount === fare, '>': (amount, fare) => amount > fare, '>=': (amount, fare) => amount >= fare,
    };
    expectUnique(body, 'b', option => distances.every(from => distances.every(to => {
      const fare = expectedFare(Math.abs(from - to));
      const accept = permitted[/getValue\(\) (.+) fare/.exec(option)![1]];
      return [false, true, true].every((expected, i) => accept(fare + i - 1, fare) === expected);
    })));
    expectUnique(body, 'c', option => /^super\(value\)$/.test(option));
    expectUnique(body, 'd', option => /初期値に，路線の最高運賃.*発券時刻を記録/.test(option));
    expectUnique(body, 'e', option => {
      const value = option === 'スーパクラスで定義されたとおり' ? maxFare :
        option === '常に0を返す。' ? 0 : option.includes('初乗り運賃の値を返す') ? baseFare : undefined;
      return distances.every(from => distances.every(to => value !== undefined && value >= expectedFare(Math.abs(from - to))));
    });
    expectUnique(body, 'f', option => {
      const limit = /発券時刻から(\d+)時間以内/.exec(option);
      const check = (now: number) => limit ? now <= Number(limit[1]) : option.startsWith('valueが') ? true : undefined;
      return [elapsed - 1, elapsed, elapsed + 1].every((now, i) => check(now) === (i < 2));
    });
    assert(body.explanation.includes(maxFare + '円') && body.explanation.includes(elapsed + '時間以内'));
  }
});

function javaClasses(body: GeneratedBody) {
  const [line, gate, ticketStart, ...tail] = codeBlocks(body);
  return {
    Line: line,
    Gate: gate,
    Ticket: [ticketStart, ...tail.slice(0, -2)].join('\n\n'),
    OneWayTicket: tail.at(-2)!,
    PrepaidCard: tail.at(-1)!,
  };
}

function command(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 20000 });
  assert.ifError(result.error);
  return result;
}

test('問12: Java 8互換で原問題と4条件をコンパイルし、改札の状態と期限前・一致・後を実行する', () => {
  const spec = specs[1];
  for (const body of [spec.original, ...[0, 1, 2, 3].map(i => spec.definition.build([i]))]) {
    const { boundary, baseFare, incrementKm, incrementYen, elapsed } = railConditions(body);
    const sources = javaClasses(body);
    const fill = (text: string) => text.replace(/\[([abc])\]/g, (_, blank: string) => alternatives(body, blank)[selected(body, blank)]);
    const distances = [...sources.Line.matchAll(/new Gate\("[A-D]", (\d+)\)/g)].map(position => Number(position[1]));
    const harness = `public class RailwayCheck {
      static long now;
      static final long LIMIT = ${elapsed}L * 60 * 60;
      static final int[] POSITIONS = { ${distances.join(', ')} };
      static final Gate[] STATIONS = { Line.A, Line.B, Line.C, Line.D };
      static int fare(int distance) {
        int yen = ${baseFare};
        for (int covered = ${boundary}; covered < distance; covered += ${incrementKm}) yen += ${incrementYen};
        return yen;
      }
      static class TimedPass extends Ticket {
        final long issuedAt;
        TimedPass(long time) { super(fare(POSITIONS[3] - POSITIONS[0])); issuedAt = time; }
        public void adjustValue(int amount) {}
        public boolean isValid() { return now - issuedAt <= LIMIT; }
      }
      static void check(boolean ok) { if (!ok) throw new AssertionError(); }
      public static void main(String[] args) {
        for (int distance = 0; distance <= POSITIONS[3]; distance++)
          check(Line.getFare(distance) == fare(distance));
        for (int from = 0; from < STATIONS.length; from++) {
          for (int to = 0; to < STATIONS.length; to++) {
            Gate start = STATIONS[from], stop = STATIONS[to];
            int fare = fare(Math.abs(POSITIONS[from] - POSITIONS[to]));
            PrepaidCard empty = new PrepaidCard(0);
            start.enter(empty); check(empty.getOrigin() == null);
            for (int extra = -1; extra <= 1; extra++) {
              PrepaidCard card = new PrepaidCard(fare + extra);
              start.enter(card); check(card.getOrigin() == start);
              stop.enter(card); check(card.getOrigin() == start);
              stop.exit(card);
              check(card.getOrigin() == (extra < 0 ? start : null));
              check(card.getValue() == (extra < 0 ? fare + extra : extra));
              OneWayTicket fixed = new OneWayTicket(fare + extra);
              start.enter(fixed); stop.exit(fixed);
              check(fixed.isValid() == (extra < 0));
              check(fixed.getOrigin() == (extra < 0 ? start : null));
              stop.enter(fixed);
              check(fixed.getOrigin() == (extra < 0 ? start : null));
            }
            for (int offset = -1; offset <= 1; offset++) {
              now = 1000 + LIMIT + offset;
              TimedPass entering = new TimedPass(1000);
              start.enter(entering);
              check(entering.getOrigin() == (offset <= 0 ? start : null));
              TimedPass leaving = new TimedPass(1000);
              now = 1000; start.enter(leaving);
              now = 1000 + LIMIT + offset; stop.exit(leaving);
              check(leaving.getOrigin() == null);
              check(leaving.getValue() == fare(POSITIONS[3] - POSITIONS[0]));
            }
          }
        }
      }
    }`;
    const folder = mkdtempSync(join(tmpdir(), 'opencbt-2005-pm-java-'));
    try {
      const files: Record<string, string> = { ...sources, RailwayCheck: harness };
      for (const [name, source] of Object.entries(files)) writeFileSync(join(folder, name + '.java'), fill(source));
      const compiled = command('javac', ['--release', '8', ...Object.keys(files).map(name => name + '.java')], folder);
      assert.equal(compiled.status, 0, compiled.stderr);
      const tested = command('java', ['-cp', folder, 'RailwayCheck'], folder);
      assert.equal(tested.status, 0, tested.stderr);
      assert(tested.stdout.includes('D: open') && tested.stdout.includes('A: closed'));
    } finally {
      rmSync(folder, { recursive: true, force: true });
    }
  }
});

test('問12: Gate型の不一致と誤った全コンストラクタ候補をjavacで棄却する', () => {
  const body = specs[1].original, sources = javaClasses(body);
  const cases = [
    { sub: 'a', candidates: alternatives(body, 'a').filter(text => text === 'ticket.setOrigin(ticket)') },
    { sub: 'c', candidates: alternatives(body, 'c').filter((_, i) => i !== selected(body, 'c')) },
  ];
  const folder = mkdtempSync(join(tmpdir(), 'opencbt-2005-pm-java-errors-'));
  try {
    for (const row of cases) {
      for (const candidate of row.candidates) {
        for (const [name, source] of Object.entries(sources)) {
          const text = source.replace(/\[([abc])\]/g, (_, blank: string) =>
            blank === row.sub ? candidate : alternatives(body, blank)[selected(body, blank)]);
          writeFileSync(join(folder, name + '.java'), text);
        }
        const result = command('javac', ['--release', '8', ...Object.keys(sources).map(name => name + '.java')], folder);
        assert.equal(result.status, 1, candidate);
        assert(result.stderr.includes(row.sub === 'a' ? 'Gate.java' : 'OneWayTicket.java'));
      }
    }
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

const word16 = 65535;
const fixedBits = (value: number) => value.toString(2).padStart(16, '0');

function shift(instruction: string, registers: number[]) {
  const match = /^(SLL|SRL|SRA) GR([0-7]),(-?\d+)(?:,GR([1-7]))?$/.exec(instruction);
  if (!match) return false;
  const [, operation, destination, address, index] = match;
  const target = Number(destination), count = (Number(address) + (index ? registers[Number(index)] : 0)) & word16;
  const value = registers[target];
  const signed = value >= 32768 ? value - 65536 : value;
  registers[target] = operation === 'SRA' ? Math.floor(signed / 2 ** Math.min(count, 16)) & word16
    : count >= 16 ? 0 : operation === 'SRL' ? Math.floor(value / 2 ** count) : (value << count) & word16;
  return true;
}

function scan(word: number, n: number, pattern: number, mask: string, advance: string) {
  // GR6 starts with n, GR7 with the unexamined width. The masked word and
  // shifted pattern are compared before updating the next comparison position.
  const registers = [65535, 8192, pattern << (16 - n), 0, word16, word, n, 16 - n];
  assert(shift(mask, registers));
  for (let attempts = 0; attempts < 32; attempts++) {
    if ((registers[5] & registers[4]) === registers[2])
      return { bit: 15 - registers[3], gr5: registers[5] };
    registers[3]++;
    if (registers[3] > registers[7]) return { bit: -1, gr5: undefined };
    if (advance === 'LD GR5,1,GR2') {
      const offset = (1 + registers[2] - registers[1]) & word16;
      registers[5] = [word, n, pattern][offset] ?? 0;
    } else assert(shift(advance, registers));
  }
  return undefined;
}

test('問13: 16ビット照合の全命令候補を照合し、4条件のGR5の正答をビット列から求める', () => {
  const spec = specs[2];
  for (const body of [spec.original, ...[0, 1, 2, 3].map(i => spec.definition.build([i]))]) {
    const program = codeBlocks(body)[0];
    assert.match(program, /\s+7\s+SLL\s+GR2,0,GR7[^\n]*\n\s+8\s+LAD\s+GR4,-1[^\n]*\n\s+9\s+\[a\]/);
    assert.match(program, /\s+19\s+JPL\s+EXIT[^\n]*\n\s+20\s+\[b\][^\n]*\n\s+21\s+JUMP\s+LOOP/);
    assert.match(program, /RPUSH[\s\S]*RPOP\s+25\s+RET/);
    expectUnique(body, 'a', option => Array.from({ length: 16 }, (_, i) => i + 1).every(length => {
      const regs = [0, 0, 0, 0, word16, 0, length, 16 - length];
      assert(shift(option, regs));
      return fixedBits(regs[4]) === '1'.repeat(length) + '0'.repeat(16 - length);
    }));
    const masked = alternatives(body, 'a')[selected(body, 'a')];
    const parameters = body.prompt.find(block => block.type === 'table' && block.caption === '設問2のパラメタ');
    assert(parameters?.type === 'table');
    const [wordBits, nBits, patternBits] = parameters.rows.map(row => row[1]);
    const [word, n, pattern] = [wordBits, nBits, patternBits].map(bits => parseInt(bits, 2));
    const vectors = [{ word, n, pattern }];
    for (let width = 1; width <= 16; width++) {
      const ruled = 2 ** width - 1;
      for (const subject of [0, 1, 0x8000, 0x7fff, 0x5555, 0xaaaa, 0xffff, 0x243f, 0xca31]) {
        for (const query of new Set([0, 1, ruled, ruled >> 1, subject & ruled])) {
          if (query <= ruled) vectors.push({ word: subject, n: width, pattern: query });
        }
      }
    }
    const reference = (subject: number, width: number, query: number) =>
      fixedBits(subject).indexOf(fixedBits(query).slice(16 - width));
    expectUnique(body, 'b', option => vectors.every(({ word, n, pattern }) => {
      const left = reference(word, n, pattern), result = scan(word, n, pattern, masked, option);
      return result !== undefined && result.bit === (left < 0 ? -1 : 15 - left);
    }));
    const expectedOffset = reference(word, n, pattern);
    const register = parseInt(wordBits.slice(expectedOffset).padEnd(16, '0'), 2);
    const result = scan(word, n, pattern, masked, alternatives(body, 'b')[selected(body, 'b')]);
    assert.equal(result?.gr5, register);
    expectUnique(body, '2', choice => /^[0-9A-F]{4}$/.test(choice) && parseInt(choice, 16) === register);
    assert(body.explanation.includes(register.toString(16).toUpperCase()) && figureAlt(body, 'comparison-example').includes(wordBits));
  }
});

test('問13: 指定席の予約命令を全候補で照合し、先頭・末尾・境界・全幅と検索失敗を検算する', () => {
  const spec = specs[2];
  for (const body of [spec.original, ...[0, 1, 2, 3].map(i => spec.definition.build([i]))]) {
    const programs = codeBlocks(body);
    const full = programs.slice(-2).join('\n');
    assert.match(full, /RESERVE START\s+RPUSH[\s\S]*EXIT\s+RPOP\s+RET/);
    assert.match(full, /SRA\s+GR7,-1,GR6\s+\[c\]\s+XOR\s+GR7,=#FFFF/);
    assert.match(full, /SUBL\s+GR2,TBLADD[^\n]*\n\s+\[d\]\s+ADDA\s+GR2,GR3/);
    const groupCount = Number(full.match(/LAD\s+GR4,(\d+),GR2/)![1]);
    assert(prose(body).includes(groupCount + '語') && figureAlt(body, 'seat-word-layout').includes(String(groupCount * 16 - 1)));
    const startedAt = (bits: string, length: number) => bits.indexOf('1'.repeat(length));
    const u16 = (bits: string) => parseInt(bits, 2);
    type Reservation = { width: number; inventory: number[]; startWord: number; inWord: number };
    const cases: Reservation[] = [];
    for (let width = 1; width <= 16; width++) {
      for (let offset = 0; offset <= 16 - width; offset++) {
        for (const word of [0, 1, groupCount - 1]) {
          const rows = Array(groupCount).fill(0);
          rows[word] = u16('0'.repeat(offset) + '1'.repeat(width) + '0'.repeat(16 - offset - width));
          cases.push({ width, inventory: rows, startWord: word, inWord: offset });
        }
      }
    }
    const none = Array(groupCount).fill(0);
    const crossed = [...none];
    crossed[0] = 1; crossed[1] = 32768;
    const mixed = [...none];
    mixed[0] = 0x8011;
    mixed[1] = 0x96f1;
    mixed[groupCount - 1] = 0xffff;
    cases.push({ width: 3, inventory: mixed, startWord: 1, inWord: 8 },
      { width: 2, inventory: crossed, startWord: -1, inWord: -1 },
      { width: 1, inventory: none, startWord: -1, inWord: -1 });
    const expected = (entry: Reservation) => {
      const words = entry.inventory.map(fixedBits);
      const first = words.findIndex(bits => startedAt(bits, entry.width) !== -1);
      if (first < 0) return { seat: -1, inventory: entry.inventory };
      const offset = startedAt(words[first], entry.width);
      assert.equal(offset, entry.inWord);
      words[first] = words[first].slice(0, offset) + '0'.repeat(entry.width) + words[first].slice(offset + entry.width);
      return { seat: 16 * first + offset, inventory: words.map(u16) };
    };
    const run = (entry: Reservation, c: string, d: string) => {
      const { width, startWord, inWord } = entry;
      const inventory = [...entry.inventory];
      const scanner = alternatives(body, 'b')[selected(body, 'b')];
      let first = -1, position = -1;
      for (const [i, row] of inventory.entries()) {
        const result = scan(row, width, 2 ** width - 1, 'SLL GR4,0,GR7', scanner);
        if (result && result.bit >= 0) { first = i; position = 15 - result.bit; break; }
      }
      assert.equal(first, startWord);
      assert.equal(position, inWord);
      if (first < 0) return { seat: -1, inventory };
      const regs = [15 - position, 0, first, position, 0, inventory[first], width, 32768];
      assert(shift('SRA GR7,-1,GR6', regs));
      if (!shift(c, regs)) {
        const [, op, rs] = /^(AND|OR) GR5,GR([37])$/.exec(c)!;
        regs[5] = op === 'AND' ? regs[5] & regs[Number(rs)] : regs[5] | regs[Number(rs)];
      }
      inventory[first] = regs[5] & (regs[7] ^ word16);
      assert(shift(d, regs));
      return { seat: regs[2] + regs[3], inventory };
    };
    const same = (a: ReturnType<typeof run>, b: ReturnType<typeof expected>) =>
      a.seat === b.seat && a.inventory.every((word, i) => word === b.inventory[i]);
    const [c, d] = ['c', 'd'].map(blank => alternatives(body, blank)[selected(body, blank)]);
    expectUnique(body, 'c', option => cases.every(entry => same(run(entry, option, d), expected(entry))));
    expectUnique(body, 'd', option => cases.every(entry => same(run(entry, c, option), expected(entry))));
    assert(body.explanation.includes(groupCount + '語×16席'));
  }
});
