export type RecordData = { employee: string; day: number; holiday: boolean; work: string; hours: number };
type Output = { work: [string, string, number][]; overtime: [string, number][] };

export function referenceTotals(records: RecordData[], regularHours: number): Output {
  const work = new Map<string, number>(), daily = new Map<string, { hours: number; holiday: boolean }>();
  for (const row of records) {
    const key = row.employee + '/' + row.work;
    work.set(key, (work.get(key) ?? 0) + row.hours);
    const day = row.employee + '/' + row.day, previous = daily.get(day)?.hours ?? 0;
    daily.set(day, { hours: previous + row.hours, holiday: row.holiday });
  }
  const overtime = new Map<string, number>();
  for (const [day, { hours, holiday }] of daily) {
    const [employee] = day.split('/');
    overtime.set(employee, (overtime.get(employee) ?? 0) + hours - (holiday ? 0 : regularHours));
  }
  return {
    work: [...work].map(([key, hours]) => {
      const [employee, job] = key.split('/');
      return [employee, job, hours];
    }),
    overtime: [...overtime],
  };
}

const replacements = {
  a: 'N > GYOMU-SU',
  b: 'N > GYOMU-SU OR GYOMU-CODE(N) = N-GYOMU-CODE',
  c: 'EOF = "E" OR N-SHAIN-CODE NOT = SHAIN-CODE OR N-SAGYO-BI NOT = SAGYO-BI',
};
const insertions = {
  d: 'PERFORM READ-RTN',
  e: 'MOVE ZERO TO SAGYO-JIKAN-KEI',
  f: 'MOVE ZERO TO GYOMU-SU',
};
type Command = (state: Machine) => void;
type Value = string | number;

class Machine {
  readonly values: Record<string, Value> = { EOF: '', 'SAGYO-JIKAN-KEI': 87, 'GYOMU-SU': 11 };
  readonly jobs: { code: Value; hours: Value }[];
  readonly result: Output = { work: [], overtime: [] };
  private scanned = 0;
  private steps = 0;
  constructor(private readonly records: RecordData[], capacity: number) {
    this.jobs = Array.from({ length: capacity }, () => ({ code: '', hours: 0 }));
  }
  tick() { if (++this.steps > 380000) throw Error('COBOLの実行が終了しません'); }
  read() {
    const row = this.records[this.scanned++];
    if (!row) this.values.EOF = 'E';
    else Object.assign(this.values, { 'N-SHAIN-CODE': row.employee, 'N-SAGYO-BI': row.day,
      'N-SHUBETSU': Number(row.holiday), 'N-GYOMU-CODE': row.work, 'N-SAGYO-JIKAN': row.hours });
  }
  at() {
    const place = this.jobs[Number(this.values.N) - 1];
    if (!place) throw Error('業務コードの添字が範囲外');
    return place;
  }
  get(name: string): Value {
    if (/^\d+$/.test(name)) return Number(name);
    if (name === 'ZERO') return 0;
    if (name === 'SPACE') return ' ';
    if (name.startsWith('"')) return name.slice(1, -1);
    if (name === 'GYOMU-CODE(N)') return this.at().code;
    if (name === 'SAGYO-JIKAN(N)') return this.at().hours;
    return this.values[name] ?? '';
  }
  set(name: string, value: Value) {
    if (typeof value === 'number' && (value > 999 || value < 0)) throw Error('3桁の数値項目が範囲外');
    if (name === 'GYOMU-CODE(N)') this.at().code = value;
    else if (name === 'SAGYO-JIKAN(N)') this.at().hours = value;
    else this.values[name] = value;
  }
}

function parseCondition(text: string): (state: Machine) => boolean {
  const alternatives = text.split(' OR ').map(term => {
    const match = /^(\S+) (NOT =|=|>) (\S+)$/.exec(term);
    if (!match) throw Error(term);
    const [, lhs, comparison, rhs] = match;
    return (state: Machine) => {
      const left = state.get(lhs), right = state.get(rhs);
      return comparison === '>' ? left > right : comparison === 'NOT =' ? left !== right : left === right;
    };
  });
  return state => alternatives.some(condition => condition(state));
}

export function compileWorkListing(listing: string, picks: Record<string, string>) {
  const rows = listing.split('\n').map(row => {
    const match = /^\s*(\d+)\s+(\S.*)$/.exec(row);
    if (!match) throw Error(row);
    return { line: Number(match[1]), text: match[2].replace(/\.$/, '') };
  });
  const count = Number(/OCCURS (\d+)/.exec(rows[26].text)![1]);
  const positions = new Set<number>();
  const insertAfter = new Map<number, string>();
  for (const [name, statement] of Object.entries(replacements)) {
    const line = Number(picks[name].match(/\d+/)![0]);
    if (positions.has(line)) throw Error('同じ条件を二度置換');
    positions.add(line);
    const row = rows[line - 1];
    const prefix = /^(PERFORM UNTIL |UNTIL |IF )/.exec(row.text);
    if (!prefix) throw Error('条件の置換位置');
    row.text = prefix[1] + statement + (prefix[1] === 'IF ' ? ' THEN' : '');
    if (line === 40) rows[line].text = '';
  }
  for (const [name, statement] of Object.entries(insertions)) {
    const line = Number(picks[name].match(/\d+/)![0]);
    if (insertAfter.has(line)) throw Error('同じ位置へ二つの処理を挿入');
    insertAfter.set(line, statement);
  }
  const statements: string[] = [];
  for (const { line, text } of rows.slice(30)) {
    if (text) {
      const previous = statements.at(-1);
      if ((previous?.endsWith(' OR') && text.startsWith('N-SHAIN-CODE')) ||
          (previous?.endsWith(' =') && /JIKAN/.test(text)) ||
          (previous === 'PERFORM VARYING N FROM 1 BY 1' && text.startsWith('UNTIL ')) ||
          (previous === 'OPEN INPUT NIPPO-FILE' && text.startsWith('OUTPUT '))) {
        statements[statements.length - 1] += ' ' + text;
      } else statements.push(text);
    }
    if (insertAfter.has(line)) statements.push(insertAfter.get(line)!);
  }

  const routines = new Map<string, Command>();
  let index = 0;
  function block(until: string[]): Command {
    const operations: Command[] = [];
    while (index < statements.length && !until.includes(statements[index])) {
      const item = statements[index++];
      if (item.startsWith('PERFORM UNTIL ') || item.startsWith('PERFORM VARYING N FROM 1 BY 1 UNTIL ')) {
        const varying = item.startsWith('PERFORM VARYING');
        const completed = parseCondition(item.slice(item.indexOf('UNTIL ') + 6));
        const body = block(['END-PERFORM']);
        if (statements[index++] !== 'END-PERFORM') throw Error('PERFORMの終端');
        operations.push(state => {
          if (varying) state.set('N', 1);
          while (!completed(state)) {
            state.tick();
            body(state);
            if (varying) state.set('N', Number(state.get('N')) + 1);
          }
        });
      } else if (item.startsWith('IF ') && item.endsWith(' THEN')) {
        const condition = parseCondition(item.slice(3, -5));
        const yes = block(['ELSE', 'END-IF']);
        const no = statements[index] === 'ELSE' ? (++index, block(['END-IF'])) : undefined;
        if (statements[index++] !== 'END-IF') throw Error('IFの終端');
        operations.push(state => condition(state) ? yes(state) : no?.(state));
      } else if (item === 'READ NIPPO-FILE AT END') {
        if (statements[index++] !== 'MOVE "E" TO EOF' || statements[index++] !== 'END-READ') throw Error(item);
        operations.push(state => state.read());
      } else if (item === 'INITIALIZE CHOKA-REC') {
        operations.push(state => state.set('C-CHOKA-JIKAN', 0));
      } else if (item === 'INITIALIZE GYOMU') {
        operations.push(state => state.jobs.forEach(row => Object.assign(row, { code: '', hours: 0 })));
      } else if (/^(STOP RUN|CONTINUE|OPEN |CLOSE )/.test(item)) {
        continue;
      } else if (item === 'WRITE SAGYO-REC') {
        operations.push(state => state.result.work.push([String(state.get('S-SHAIN-CODE')),
          String(state.get('S-GYOMU-CODE')), Number(state.get('S-SAGYO-JIKAN'))]));
      } else if (item === 'WRITE CHOKA-REC') {
        operations.push(state => state.result.overtime.push([String(state.get('C-SHAIN-CODE')), Number(state.get('C-CHOKA-JIKAN'))]));
      } else if (item.startsWith('COMPUTE ')) {
        const match = /^COMPUTE (\S+) = (\S+) \+ (\S+)(?: - (\d+))?$/.exec(item);
        if (!match) throw Error(item);
        const [, destination, first, second, deducted] = match;
        operations.push(state => state.set(destination, Number(state.get(first)) + Number(state.get(second)) - Number(deducted ?? '0')));
      } else if (/^PERFORM (READ|WRITE)-RTN$/.test(item)) {
        operations.push(state => routines.get(item.slice(8))!(state));
      } else if (item.startsWith('SET ')) {
        const [, destination, , source] = item.split(' ');
        operations.push(state => state.set(destination, state.get(source)));
      } else if (item.startsWith('MOVE ')) {
        const [, source, , ...destinations] = item.split(' ');
        operations.push(state => destinations.forEach(destination => state.set(destination, state.get(source))));
      } else throw Error(item);
    }
    return state => operations.forEach(operation => operation(state));
  }
  while (index < statements.length) {
    const name = statements[index++];
    if (!['MAIN-RTN', 'READ-RTN', 'WRITE-RTN'].includes(name)) throw Error(name);
    routines.set(name, block(['READ-RTN', 'WRITE-RTN']));
  }
  return (records: RecordData[]) => {
    const state = new Machine(records, count);
    routines.get('MAIN-RTN')!(state);
    return state.result;
  };
}

export function boundaries(regularHours: number, limit: number): RecordData[][] {
  const employee = '000001';
  const data = (day: number, work: string, hours: number, holiday = false, person = employee): RecordData =>
    ({ employee: person, day, holiday, work, hours });
  const repeat = [
    data(1, 'A01', 3), data(1, 'B02', regularHours), data(2, 'A01', regularHours),
    data(3, 'Z80', 3, true), data(4, 'B02', regularHours + 2),
    data(4, 'Q23', regularHours, false, '000002'),
    data(4, 'A01', regularHours, false, '000003'),
  ];
  const maxMonth = Array.from({ length: 31 }, (_, i) => data(i + 1, 'A01', 24, i % 7 > 4));
  const full = Array.from({ length: limit }, (_, i) =>
    data(Math.floor(i / 12) + 1, String(i + 1).padStart(3, '0'), 1));
  const finalDayRecords = limit % 12 || 12;
  full[limit - 1].hours += Math.max(0, regularHours - finalDayRecords);
  full.push(data(Math.ceil(limit / 12) + 1, '001', regularHours), data(Math.ceil(limit / 12) + 2, String(limit).padStart(3, '0'), 24));
  return [[], [data(1, 'A01', regularHours)], repeat, maxMonth, full];
}
