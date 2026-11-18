/** Check the displayed statements against individual household records. */
export type Interval = { channel: number; start: number; end: number };
type RecordData = Interval & { home: number };
type Specification = { slots: number; channelCount: number; sample: number; step: number };
type Dataset = { views: RecordData[]; programs: Interval[] };

export function readListing(listing: string): Specification {
  const sample = Number(/SAMPLE-SIZE\s+PIC 9\(4\) VALUE (\d+)/.exec(listing)![1]);
  const channelCount = Number(/CHANNEL\s+OCCURS (\d+)/.exec(listing)![1]);
  const slots = Number(/COUNT-OF-MINUTE\s+OCCURS (\d+)/.exec(listing)![1]);
  const step = 1440 / slots;
  const starts = [...listing.matchAll(/COMPUTE [A-Z-]+\s+= (.*?)\./g)].map(match => match[1]);
  for (const [index, expression] of starts.entries()) {
    const prefix = index < 2 ? 'VIEW' : 'PROG';
    const bound = index % 2 === 0 ? 'START' : 'END';
    const minute = `${prefix}-${bound}-HH * 60 + ${prefix}-${bound}-MM`;
    if (expression !== (step === 1 ? minute + ' + 1' : '(' + minute + ') / ' + step + ' + 1'))
      throw Error('入力時刻と配列位置が対応しません');
  }
  if (starts.length !== 4) throw Error('時刻変換の命令数が一致しません');
  return { slots, channelCount, sample, step };
}

export function datasets(spec: Specification): Dataset[] {
  const { sample, channelCount, step } = spec;
  const last = 1440 - step;
  const program = (channel: number, start: number, end: number) => ({ channel, start, end });
  const low = program(1, 0, step), high = program(channelCount, last, last), middle = program(channelCount, step * 2, step * 4);
  const testViews = [
    { home: 1, ...low }, { home: 2, ...low }, { home: 3, ...program(1, step, step) },
    ...Array.from({ length: sample }, (_, index) => ({ home: index + 1, ...high })),
    { home: 1, ...middle }, { home: 2, ...program(channelCount, step * 3, step * 3) },
  ];
  const evenSlots = Array.from({ length: 32 }, (_, index) => index + 1).find(count => sample * count % 32 === 0)!;
  const halfway = Array.from({ length: sample * evenSlots / 16 }, (_, index) => {
    const t = Math.floor(index / sample) * step;
    return { home: index % sample + 1, ...program(2, t, t) };
  });
  return [
    { views: testViews, programs: [low, middle, high, program(2, 0, last), program(channelCount, 0, last), low] },
    { views: [], programs: [low, high] },
    { views: testViews, programs: [] },
    { views: testViews.slice(0, 2), programs: [program(1, 0, step * 2)] },
    { views: halfway, programs: [program(2, 0, (evenSlots - 1) * step)] },
  ];
}

export function referenceRatings(spec: Specification, data: Dataset) {
  return data.programs.map(program => {
    let sampled = 0n, exposures = 0n;
    for (let minute = program.start; minute <= program.end; minute += spec.step) {
      const homes = new Set(data.views.filter(record => record.channel === program.channel &&
        record.start <= minute && minute <= record.end).map(record => record.home));
      sampled += BigInt(homes.size);
      exposures += BigInt(spec.sample);
    }
    return Number((2000n * sampled + exposures) / (2n * exposures));
  });
}

export function runRatings(spec: Specification, data: Dataset, answers: Record<string, string>) {
  const { sample, slots, channelCount, step } = spec;
  const at = (time: number) => (Math.floor(time / 60) * 60 + time % 60) / step + 1;
  const grid = Array.from({ length: channelCount + 1 }, () => Array<number>(slots + 1).fill(23));
  let endOfFile = '';
  let sum = 17, first = 0, last = 0, lastChannel = 0;
  const get = (channel: number, index: number) => {
    if (channel < 1 || channel > channelCount || index < 1 || index > slots) throw Error('集計表の範囲外');
    return grid[channel][index];
  };
  function run(command: string, index = 0, view = 0, program = 0) {
    const slot = (offset?: string) => index + Number(Boolean(offset));
    const channel = (name: string) => name === 'VIEW' ? view : program;
    const arithmetic = /^ADD 1 TO COUNT-OF-MINUTE\((VIEW|PROG)-CHANNEL M( \+ 1)?\)$/.exec(command);
    if (arithmetic) {
      const row = channel(arithmetic[1]), col = slot(arithmetic[2]);
      grid[row][col] = get(row, col) + 1;
      return;
    }
    const move = /^MOVE "([NY])" TO END-OF-FILE$/.exec(command);
    if (move) { endOfFile = move[1]; return; }
    switch (command) {
      case 'COMPUTE SUMMATION = END-MMMM - START-MMMM': sum = last - first; break;
      case 'INITIALIZE VIEW-COUNT-TABLE': grid.forEach(row => row.fill(0)); break;
      case 'MOVE ZERO TO VIEW-COUNT-TABLE': grid.forEach(row => row.fill(0x3030)); break;
      case 'MOVE SAMPLE-SIZE TO SUMMATION': sum = sample; break;
      case 'MOVE ZERO TO SUMMATION': sum = 0; break;
      case 'ADD 1 TO SUMMATION': sum++; break;
      case 'ADD COUNT-OF-MINUTE(PROG-CHANNEL M) TO SUMMATION': sum += get(program, index); break;
      case 'COMPUTE SUMMATION = COUNT-OF-MINUTE(PROG-CHANNEL M + 1)': sum = get(program, index + 1); break;
      case 'COMPUTE SUMMATION = COUNT-OF-MINUTE(VIEW-CHANNEL M) + 1': sum = get(view, index) + 1; break;
      case 'MOVE 1 TO COUNT-OF-MINUTE(VIEW-CHANNEL M)': get(view, index); grid[view][index] = 1; break;
      default: throw Error(command);
    }
  }
  run(answers.a);
  endOfFile = 'N';
  for (const view of data.views) {
    lastChannel = view.channel;
    [first, last] = [at(view.start), at(view.end)];
    for (let i = first; i <= last; ++i) run(answers.c, i, view.channel);
  }
  endOfFile = 'Y';
  run(answers.b);
  const evaluate = (expression: string) => {
    const variables: Record<string, number> = { SUMMATION: sum, 'START-MMMM': first, 'END-MMMM': last, 'SAMPLE-SIZE': sample };
    const tokens = expression.match(/START-MMMM|END-MMMM|SAMPLE-SIZE|SUMMATION|\d+|[()+*/-]/g)!;
    let i = 0;
    function factor(): number {
      const token = tokens[i++];
      if (token === '(') {
        const value = calc(0);
        if (tokens[i++] !== ')') throw Error('括弧');
        return value;
      }
      return variables[token] ?? Number(token);
    }
    function calc(level: number): number {
      if (level === 2) return factor();
      let value = calc(level + 1);
      const operators = level === 0 ? '+-' : '*/';
      while (i < tokens.length && operators.includes(tokens[i])) {
        const op = tokens[i++], next = calc(level + 1);
        value = op === '+' ? value + next : op === '-' ? value - next : op === '*' ? value * next : value / next;
      }
      return value;
    }
    const value = calc(0);
    if (!Number.isFinite(value)) throw Error('視聴率を計算できません');
    return Math.round(value * 10);
  };
  const result: number[] = [];
  for (const program of data.programs) {
    if (endOfFile === 'Y') break;
    [first, last] = [at(program.start), at(program.end)];
    run(answers.d);
    for (let i = first; i <= last; i++) run(answers.e, i, lastChannel, program.channel);
    result.push(evaluate(answers.f));
  }
  return result;
}
