export type Vote = readonly [district: string, name: string, votes: number];
/** Follow the displayed COBOL operations, including the three coverage targets. */
export function runVoteProgram(input: readonly Vote[], direction: '<' | '>', answers: readonly string[]) {
  type Row = { name: string; votes?: number };
  const records: Row[] = [];
  const outputs: [string, number][] = [];
  const visited = new Set<number>();
  let last = -1, found = -1, i = -1, j = -1, active = 0;
  function perform(text: string) {
    if (text === 'MOVE K-TOKUHYO-SU TO S-TOKUHYO-SU(S-MAX)') {
      records[last].votes = active;
      return;
    }
    const addition = /^ADD K-TOKUHYO-SU TO S-TOKUHYO-SU\((S-IDX|S-MAX)\)$/.exec(text);
    if (addition) {
      const row = records[addition[1] === 'S-IDX' ? found : last];
      if (!row || row.votes === undefined) throw Error('Non-numeric/uninitialized COBOL field');
      row.votes += active;
      return;
    }
    if (text === 'MOVE S-TBL(W-I) TO S-TBL(W-J)') {
      if (i < 0 || j < 0 || !records[i] || !records[j]) throw Error('Invalid COBOL index');
      records[j] = { ...records[i] };
      return;
    }
    if (text === 'MOVE S-TBL(W-J) TO S-TBL(W-I)') {
      if (i < 0 || j < 0 || !records[i] || !records[j]) throw Error('Invalid COBOL index');
      records[i] = { ...records[j] };
      return;
    }
    throw Error('Unexpected COBOL instruction');
  }
  for (const [, name, value] of input) {
    active = value;
    found = records.findIndex(row => row.name === name);
    if (found === -1) {
      records.push({ name });
      last++;
      perform(answers[0]);
      visited.add(1);
    } else {
      perform(answers[1]);
      visited.add(2);
    }
  }
  for (i = 0; i < records.length; i++) {
    for (j = i + 1; j < records.length; j++) {
      const first = records[i].votes, second = records[j].votes;
      if (first === undefined || second === undefined) throw Error('Uninitialized COBOL field');
      if (direction === '<' ? first < second : first > second) {
        const saved = { ...records[i] };
        perform(answers[2]);
        records[j] = saved;
        visited.add(3);
      }
    }
    const row = records[i];
    if (row.votes === undefined) throw Error('Uninitialized COBOL field');
    outputs.push([row.name, row.votes]);
  }
  return { outputs, visited: [...visited].sort() };
}

type Step = { number: number; command: string; args: string[] };
export function prepareSymmetry(listing: string) {
  const program: Step[] = [], labels = new Map<string, number>();
  for (const raw of listing.split('\n')) {
    const line = raw.split(';', 1)[0].trimEnd();
    const fields = /^(\s*\d+) {2}(?:(\w+)\s+|\s+)(\w+)(?:\s+(\S+))?$/.exec(line);
    if (!fields) throw Error('Invalid CASL II listing');
    const [, number, label, command, args] = fields;
    if (label) labels.set(label, program.length);
    if (command !== 'START' && command !== 'END') program.push({ number: Number(number), command, args: args?.split(',') ?? [] });
  }
  return (word: number) => {
    const initial = [0x4567, word, 32, 876, 9, 7, 355, 16], registers = [...initial];
    const stack: number[] = [];
    let pc = 0, fourthOF = false, zero = false, negative = false, line10 = 0, beforeRestore = -1;
    const register = (name: string) => Number(name.slice(2));
    const value = (source: string) => source.startsWith('GR') ? registers[register(source)] : Number(source.replace(/^=/,''));
    const jump = (label: string) => {
      const next = labels.get(label);
      if (next === undefined) throw Error('Unknown CASL II label');
      pc = next;
    };
    function flags(result: number, overflow = false) {
      fourthOF = overflow;
      zero = result === 0;
      negative = (result & 0x8000) !== 0;
      return result;
    }
    for (let count = 0; count < 96; count++) {
      const { number, command, args: [first, second] } = program[pc++];
      const front = register(first ?? 'GR0'), left = registers[front];
      if (number === 10) line10++;
      switch (command) {
        case 'RPUSH': stack.push(...registers.slice(1)); break;
        case 'RPOP':
          beforeRestore = registers[2];
          for (let i = 7; i >= 1; i--) registers[i] = stack.pop()!;
          break;
        case 'LD': registers[front] = flags(value(second)); break;
        case 'SLL': registers[front] = flags((left * 2) % 65536, left >= 32768); break;
        case 'SRL': registers[front] = flags(Math.floor(left / 2), left % 2 === 1); break;
        case 'SUBA': {
          const result = (left >= 32768 ? left - 65536 : left) - value(second);
          registers[front] = flags((result + 65536) % 65536, result < -32768 || result > 32767);
          break;
        }
        case 'JOV': if (fourthOF) jump(first); break;
        case 'JMI': if (negative) jump(first); break;
        case 'JPL': if (!negative && !zero) jump(first); break;
        case 'JZE': if (zero) jump(first); break;
        case 'JUMP': jump(first); break;
        case 'RET':
          if (stack.length || initial.slice(1).some((item, i) => item !== registers[i + 1])) throw Error('Non-preserved registers');
          return { symmetric: registers[0], beforeRestore, line10 };
        default: throw Error('Unimplemented CASL II command');
      }
    }
    throw Error('Non-terminating CASL II command');
  };
}
