import source from './legacy-2015-spring-pm-09-13-source-data.json';
import { spring2015PmHtmlEntities, spring2015PmHtmlPunctuation } from './legacy-2015-spring-pm-09-13-source';

const cipherInputs = [
  [source[9].plain,'IPA'],
  ['Code here f(a,b) is ready.','KEY'],
  ['Data list g(p,q) is valid.','CAT'],
  ['X-plus Y z(a,b) is read.','CAB'],
  ['Write-out q(d,e) is done.','RED'],
  ['Show code h(i,j) is ready.','TOP'],
  ['result = u(m,n) is shown.','ARC'],
  ['5 values  p(r,s) are here.','MAP'],
] as const;
export const spring2015PmCipherTable = source[9].table;
type Coordinate = { row: number; column: number; character: string };
type Operation = 'both' | 'swap' | 'column' | 'cross' | 'row' | 'keep' | 'mirror' | 'previous-row' | 'previous-column';
const operations: Operation[] = ['both', 'swap', 'column', 'cross', 'row', 'keep', 'mirror', 'previous-row', 'previous-column'];

function coordinates(character: string): Coordinate | undefined {
  for (const [row, text] of spring2015PmCipherTable.entries()) {
    const column = text.indexOf(character);
    if (column !== -1) return { row, column, character };
  }
}

function transform(current: Coordinate, other: Coordinate, operation: Operation) {
  const { row, column } = current;
  switch (operation) {
    case 'both': return spring2015PmCipherTable[(row + 1) % 5][(column + 1) % 13];
    case 'swap': return other.character;
    case 'column': return spring2015PmCipherTable[row][(column + 1) % 13];
    case 'cross': return spring2015PmCipherTable[other.row][column];
    case 'row': return spring2015PmCipherTable[(row + 1) % 5][column];
    case 'keep': return current.character;
    case 'mirror': return spring2015PmCipherTable[4 - row][12 - column];
    case 'previous-row': return spring2015PmCipherTable[(row + 4) % 5][column];
    case 'previous-column': return spring2015PmCipherTable[row][(column + 12) % 13];
  }
}

function operation(left: Coordinate, right: Coordinate): Operation {
  if (left.character === right.character) return 'both';
  if (left.row === right.row) return 'swap';
  if (left.column === right.column) return 'column';
  return 'cross';
}

function cipher(text: string) {
  const characters = [...text];
  const trace: { first: Coordinate; second: Coordinate; positions: [number, number]; result: [string, string] }[] = [];
  let pending: { coordinate: Coordinate; position: number } | undefined;
  for (const [position, character] of characters.entries()) {
    const here = coordinates(character);
    if (!here) continue;
    if (!pending) {
      pending = { coordinate: here, position };
      continue;
    }
    const { coordinate: first, position: before } = pending;
    const rule = operation(first, here);
    const result: [string, string] = [transform(first, here, rule), transform(here, first, rule)];
    trace.push({ first, second: here, positions: [before, position], result });
    characters[before] = result[0];
    characters[position] = result[1];
    pending = undefined;
  }
  if (pending) characters[pending.position] = transform(pending.coordinate, pending.coordinate, 'mirror');
  return { output: characters.join(''), trace };
}

function characterCandidates(item: ReturnType<typeof cipher>['trace'][number], position: number) {
  const right = item.second, left = item.first;
  const correct = item.result[1];
  const wrong = [...new Set(operations.map(rule => transform(right, left, rule)).concat([left.character]))]
    .filter(character => character !== correct);
  if (wrong.length < 4) throw new Error('CIPHER_CANDIDATES');
  return [...wrong.slice(0, position), correct, ...wrong.slice(position, 4)].map(displayCharacter);
}
const displayCharacter = (character: string) => character === ' ' ? '空白文字' : "'" + character + "'";

function wordCandidates(word: string, correct: string, position: number) {
  const [left, right, last] = [...word].map(character => coordinates(character)!);
  const wrong = [...new Set(operations.flatMap(rule => [
    transform(left, right, rule) + transform(right, left, rule) + transform(last, last, 'mirror'),
    transform(left, right, rule) + transform(right, left, rule) + last.character,
  ]))].filter(candidate => candidate !== correct);
  if (wrong.length < 5) throw new Error('CIPHER_CANDIDATES');
  return [...wrong.slice(0, position), correct, ...wrong.slice(position, 5)];
}

export function spring2015Pm9Model(index: number) {
  const [plain, word] = cipherInputs[index];
  const { output, trace } = cipher(plain);
  const first = trace[0], fifth = trace[4], sixth = trace[5], wordOutput = cipher(word).output;
  const values = { a: String(first.first.column), b: String(first.first.row), c: displayCharacter(first.result[1]),
    d: displayCharacter(fifth.result[1]), e: String(sixth.positions[1]), s2: wordOutput };
  const choices = index === 0 ? {} : {
    c: characterCandidates(first, index % 5), d: characterCandidates(fifth, (index + 2) % 5),
    e: Array.from({ length: 5 }, (_, i) => String(sixth.positions[1] - index % 5 + i)),
    s2: wordCandidates(word, wordOutput, index % 6),
  };
  return { plain, word, first, fifth, sixth, output, values, choices };
}
const attendanceCases = [
  { date: [4,2,2], cutoff: 22, start: 6 }, { date: [2,2,2], cutoff: 21, start: 7 },
  { date: [0,2,2], cutoff: 20, start: 5 }, { date: [4,2,2], cutoff: 21, start: 7 },
  { date: [2,2,2], cutoff: 20, start: 8 }, { date: [0,2,2], cutoff: 23, start: 6 },
  { date: [4,2,2], cutoff: 23, start: 9 }, { date: [2,2,2], cutoff: 22, start: 8 },
] as const;
export function spring2015Pm10Model(index: number) {
  const { date: [year,month,day], cutoff, start } = attendanceCases[index];
  return { year, month, day, dateWidth: year + month + day, cutoff, start,
    filler: 'PIC 9(' + (year + month) + ')', maxHours: (24 - start) * 31 };
}

const javaInputs = [
  "<script>alert('注意!');</script>",
  "<script>alert('注意情報');</script>",
  "<label>確認: 本文</label>",
  "<pre>入力 '項目' & 値</pre>",
  "<p>値=8, 種別: '数値'</p>",
  "<em>合計 'A'&'B' = 100円</em>",
  "<code>値: '雪'、次: '雲'</code>",
  "<i>警告: A/B?</i>",
] as const;
const htmlPass = new Set([...('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + spring2015PmHtmlPunctuation)]);
const htmlEntities = new Map(spring2015PmHtmlEntities.map(([c, encoded]) => [c,encoded]));
export function spring2015Pm11Model(index: number) {
  const input = javaInputs[index];
  const units = input.split('');
  const fallback = units.filter(character => !htmlPass.has(character) && !htmlEntities.has(character));
  const entities = units.filter(character => htmlEntities.has(character)).length;
  const punctuation = units.filter(character => !/[A-Za-z0-9]/.test(character)).length;
  const choices = index === 0 ? [] : [...new Set([0, entities, fallback.length, punctuation, input.length])].sort((a,b) => a-b).map(String);
  if (index && choices.length !== 5) throw new Error('ENCODER_CANDIDATES');
  return { input, fallback, entities, choices };
}

const factorialCases = [[4,3,1],[2,4,1],[3,6,2],[5,5,3],[6,7,3],[7,8,4],[8,4,2],[4,5,2]] as const;
export function spring2015Pm12Model(index: number) {
  const [iterative, recursive, visit] = factorialCases[index];
  const stack = 2 * visit, stored = recursive - visit + 1;
  const first = Math.max(1,stored - (index % 3));
  const beforeRpop = index === 0 ? [] : Array.from({length:5},(_,i) => String(Math.min(4,Math.max(1,iterative - index % 5)) + i));
  const choices = index === 0 ? {} : {
    s2: beforeRpop,
    d: ['B + 1','B + 2','B', ...[stack, stack + (index % 2 ? 1 : -1)].sort((a,b) => a-b).map(offset => 'B - ' + offset)],
    e: [...Array.from({length:3},(_,i) => String(first + i)),
      '行番号4の命令が置かれたアドレス','行番号14の命令が置かれたアドレス'],
  };
  return { iterative, recursive, visit, stack, stored, choices };
}

const worksheetCases = [
  { dayShift: 0, dayOffset: 1, firstStandard: 10, secondStandard: 15, entry: 301 },
  { dayShift: 3, dayOffset: 0, firstStandard: 9, secondStandard: 21, entry: 302 },
  { dayShift: 6, dayOffset: 1, firstStandard: 9, secondStandard: 22, entry: 201 },
  { dayShift: 9, dayOffset: 0, firstStandard: 8, secondStandard: 20, entry: 401 },
  { dayShift: 12, dayOffset: 1, firstStandard: 10, secondStandard: 23, entry: 301 },
  { dayShift: 15, dayOffset: 0, firstStandard: 10, secondStandard: 21, entry: 103 },
  { dayShift: 18, dayOffset: 1, firstStandard: 11, secondStandard: 21, entry: 303 },
  { dayShift: 21, dayOffset: 0, firstStandard: 9, secondStandard: 20, entry: 102 },
] as const;
const worksheets = source[13].worksheets;
const dayMilliseconds = 86_400_000;
const calendar = (date: string, days: number) => new Date(Date.parse(date) + days * dayMilliseconds).toISOString().slice(0,10);
export function spring2015Pm13Model(index: number) {
  const condition = worksheetCases[index];
  const { dayShift, dayOffset, firstStandard, secondStandard, entry } = condition;
  const unitNotStarted = index === 4;
  const firstItemComplete = index === 1 || index === 6;
  const unitRows = worksheets[0].rows.map(([n,id,title,order,originalStandard,originalStart,originalEnd]) => {
    const start = originalStart && !(n === '4' && unitNotStarted) ? calendar(String(originalStart),dayShift) : null;
    const end = originalEnd ? calendar(String(originalEnd),dayShift) : null;
    const standard = n === '2' ? firstStandard : n === '3' ? secondStandard : Number(originalStandard);
    const judgement = start && end ? Number((Date.parse(end) - Date.parse(start)) / dayMilliseconds) + dayOffset <= standard ? '○' : '△' : null;
    return [n,id,title,order,standard,start,end,judgement];
  });
  const itemRows = worksheets[1].rows.map(([n,id,title,possible,originalStart,originalEnd]) => {
    const canStart = firstItemComplete && n === '10' ? '可' : possible;
    const start = originalStart && !(n === '9' && unitNotStarted) ? calendar(String(originalStart),dayShift) : null;
    const end = firstItemComplete && n === '9' ? calendar('2014-06-23',dayShift) :
      originalEnd ? calendar(String(originalEnd),dayShift) : null;
    return [n,id,title,canStart,start,end,null,n === '2' ? entry : null];
  });
  const exampleStart = calendar('2014-05-10',dayShift);
  const exampleEnd = calendar('2014-05-12',dayShift);
  return { ...condition, unitRows, itemRows, unitColumns: worksheets[0].columns, itemColumns: worksheets[1].columns,
    unitHeaders: worksheets[0].headers, itemHeaders: worksheets[1].headers, exampleStart, exampleEnd };
}

export const spring2015Pm0913CaseCounts: Record<number,number> = {
  9:cipherInputs.length, 10:attendanceCases.length, 11:javaInputs.length, 12:factorialCases.length, 13:worksheetCases.length,
};
