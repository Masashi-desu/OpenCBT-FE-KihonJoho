const sorted = (values: number[]) => [...values].sort((a, b) => a - b);
const mean = (values: number[]) => values.reduce((total, n) => total + n, 0) / values.length;
export const hexWord = (value: number) => value.toString(16).toUpperCase().padStart(4, '0') + 'h';

const registerCases = [[100, 200, 300, 400], [90, 180, 360, 270], [110, 220, 220, 440], [120, 240, 600, 360]];
const loadCases = [
  { base: 100, dst: 1, src: 2, other: 3 }, { base: 140, dst: 0, src: 1, other: 3 },
  { base: 162, dst: 0, src: 1, other: 2 }, { base: 198, dst: 3, src: 2, other: 1 },
];
const program = [0x2042, 0x10d2, 0x3090, 0x0000, 0x1013, 0x2042, 0xff02];
type Instruction = { op: number; dst: number; operand: number; oneWord: boolean; indirect: boolean; address: number };
function execute(instruction: Instruction, registers: number[], memory: Map<number, number>) {
  const { op, dst, operand, oneWord, indirect, address } = instruction;
  if (op === 0xff) return;
  let target = address + (operand ? registers[operand] : 0);
  if (oneWord) target = registers[operand];
  else if (indirect) target = memory.get(target)!;
  if (op === 0x30) memory.set(target, registers[dst]);
  else {
    const data = oneWord && !indirect ? registers[operand] : memory.get(target)!;
    if (op === 0x10) registers[dst] += data;
    else registers[dst] = data;
  }
}
export const loadColumns = ['op', 'r₁', 'r₂又はX', 'D', 'I', 'adr'];
export function cpuCase(index: number) {
  const initial = registerCases[index], registers = [...initial], memory = new Map<number, number>();
  const trace: number[][] = [];
  for (let pc = 0; pc < program.length;) {
    const word = program[pc++];
    const oneWord = Boolean(word & 2);
    execute({ op: word >> 8, dst: (word >> 6) & 3, operand: (word >> 4) & 3,
      oneWord, indirect: Boolean(word & 1), address: oneWord ? 0 : program[pc++] }, registers, memory);
    trace.push([...registers]);
  }
  const { base, dst, src, other } = loadCases[index];
  const rows: [number, number][] = [[src, base], [other, base + 1]];
  rows.sort((a, b) => a[0] - b[0]);
  const cells: [number, number][] = [[base, base + 1], [base + 1, base]];
  const choices: Instruction[] = [[src, 0, 1], [src, 1, 0], [other, 0, 0], [other, 0, 1], [other, 1, 1]]
    .map(([operand, oneWord, indirect]) => ({ op: 0x20, dst, operand, oneWord: !!oneWord, indirect: !!indirect, address: 0 }));
  const results = choices.map(instruction => {
    const registers = [0, 0, 0, 0];
    for (const [register, value] of rows) registers[register] = value;
    execute(instruction, registers, new Map(cells));
    return registers[dst];
  });
  const loadOptions = choices.map(({ operand, oneWord, indirect, address }) =>
    ['20h', String(dst), String(operand), oneWord ? '1' : '0', indirect ? '1' : '0', oneWord ? '／' : hexWord(address)]);
  const values = Array.from({ length: 6 }, (_, i) => (i + 1) * initial[0]);
  return { index, initial, trace, program: program.map(hexWord), values, base, dst, loadRegisters: rows, loadMemory: cells, results, loadOptions };
}

type Job = { name: string; arrival: number; duration: number; priority: number };
const arrivalCases = [
  [[0, 10, 30, 50], [180, 80, 40, 20], 20],
  [[0, 10, 35, 55], [160, 90, 50, 30], 20],
  [[0, 7, 29, 50], [200, 70, 50, 40], 20],
  [[0, 12, 37, 57], [150, 90, 60, 30], 20],
] as const;
const priorityCases = [
  [[60, 70, 100], [6, 8, 5]], [[50, 90, 70], [8, 7, 5]],
  [[100, 110, 45], [8, 6, 7]], [[80, 50, 70], [7, 6, 9]],
] as const;
function scheduleTurnaround(jobs: Job[], quantum: number) {
  const arrived = [...jobs], ready: Job[] = [], finish = new Map<string, number>();
  let time = 0;
  while (arrived.length || ready.length) {
    if (!ready.length) time = Math.max(time, arrived[0].arrival);
    while (arrived.length && arrived[0].arrival <= time) ready.push({ ...arrived.shift()! });
    const current = ready.shift()!, interval = Math.min(quantum, current.duration);
    time += interval;
    current.duration -= interval;
    while (arrived.length && arrived[0].arrival <= time) ready.push({ ...arrived.shift()! });
    if (current.duration) ready.push(current);
    else finish.set(current.name, time);
  }
  return jobs.map(job => finish.get(job.name)! - job.arrival);
}
function priorityFinish(jobs: Job[], quantum: number) {
  const ready = jobs.map(job => ({ ...job })), order: string[] = [], finishPriority = new Map<string, number>();
  let current: Job | undefined;
  while (current || ready.length) {
    if (!current) {
      ready.sort((a, b) => b.priority - a.priority);
      current = ready.shift()!;
    }
    const step = Math.min(quantum, current.duration);
    current.duration -= step;
    if (step === quantum) current.priority = Math.max(1, current.priority - 1);
    if (!current.duration) {
      order.push(current.name);
      finishPriority.set(current.name, current.priority);
      current = undefined;
    } else if (ready.some(job => job.priority > current!.priority)) {
      ready.push(current);
      current = undefined;
    }
  }
  return { order, finishPriority };
}

export const orderOptions = ['A, B, C', 'A, C, B', 'B, A, C', 'B, C, A', 'C, A, B', 'C, B, A'];
export const priorityOptions = [1, 2, 3, 4, 5, 6];
export function schedulingCase(index: number) {
  const [arrivals, durations, quantum] = arrivalCases[index];
  const jobs = arrivals.map((arrival, i) => ({ name: 'ABCD'[i], arrival, duration: durations[i], priority: 0 }));
  const fcfs = scheduleTurnaround(jobs, Infinity), roundRobin = scheduleTurnaround(jobs, quantum);
  const a = mean(fcfs), b = mean(roundRobin), service = mean([...durations]);
  const opts = index === 0 ? [80, 102.5, 182.5, 192.5, 242.5] :
    sorted([service, b - service, a, b, b + mean([...arrivals])]);
  const avgChoices = opts.map(value => value.toFixed(1));
  const [cpu, priority] = priorityCases[index];
  const priorityJobs = cpu.map((duration, i) => ({ name: 'ABC'[i], arrival: 0, duration, priority: priority[i] }));
  const { order, finishPriority } = priorityFinish(priorityJobs, quantum);
  return { jobs, quantum, fcfs, roundRobin, a, b, avgChoices, priorityJobs, order: order.join(', '), d: finishPriority.get('B')! };
}

const stockCases = [[50, 5, 10], [60, 8, 12], [42, 6, 9], [72, 7, 11]];
type TxKind = '照会' | '入荷' | '出荷';
const requestKinds: readonly TxKind[][] = [
  ['照会', '入荷', '出荷', '照会'], ['照会', '照会', '照会', '出荷'],
  ['入荷', '出荷', '照会', '照会'], ['照会', '出荷', '照会', '照会'],
];
const white = '白', red = '赤', blue = '青', black = '黒', yellow = '黄';
const txResources = [
  [[white, red], [red, blue], [blue, white], [blue, black]],
  [[white, yellow], [red, blue], [blue, white], [white, red]],
  [[white, red], [red, blue], [blue, black], [black, blue]],
  [[white, red], [red, white], [blue, white], [blue, black]],
];
const txGroups = [
  [[8, 9], [8, 9, 10], [9, 10, 11], [10, 11]], [[8, 9], [8, 9, 10], [9, 10, 11], [10, 11]],
  [[8, 9], [8, 9, 10], [8, 9, 11], [10, 11]], [[8, 9], [8, 10, 11], [9, 10, 11], [10, 11]],
];
const txOrder = ['LWRwXrYU', 'LWwRrXYU', 'LRWwXrYU', 'LWRrYwXU'];
const circled = '①②③④⑤⑥⑦⑧';
export const positions = [0, 2, 3, 5, 7];
export const positionLetters = ['α', 'β', 'γ', 'δ', 'ε'];
export const lockTimes = [[0, 10], [23, 39], [34, 47], [16, 29]] as const;
export const waitingOptions = [
  'T4，T5，T6とも待ち状態となる。', 'T4，T5，T6とも待ち状態とならない。', 'T4，T5は待ち状態となるが，T6は待ち状態とならない。',
  'T4は待ち状態となるが，T5，T6は待ち状態とならない。', 'T6は待ち状態となるが，T4，T5は待ち状態とならない。',
];
function canDeadlock(group: number[], resources: string[][]) {
  const supports = group.map(id => resources[id - 8]);
  const test = (index: number, first: string[], next: string[]): boolean => {
    if (index < group.length) return supports[index].some((color, i) => !first.includes(color) &&
      test(index + 1, [...first, color], [...next, supports[index][1 - i]]));
    return first.every((_, start) => {
      const visited = new Set<number>();
      let current = start;
      while (current >= 0 && !visited.has(current)) {
        visited.add(current);
        current = first.indexOf(next[current]);
      }
      return current >= 0;
    });
  };
  return test(0, [], []);
}
export function transactionCase(index: number) {
  const [stock, out, inbound] = stockCases[index];
  const redOut = index ? out - 2 : 3;
  const labels: Record<string, string> = {
    L: '白絵の具の在庫数データをロックする。', W: '白絵の具の在庫数データを読み込む。',
    R: '赤絵の具の在庫数データを読み込む。', w: '白絵の具の在庫数データ ＝ 白絵の具の在庫数データ−' + out,
    X: '白絵の具の在庫数データを書き込む。', r: '赤絵の具の在庫数データ ＝ 赤絵の具の在庫数データ−' + redOut,
    Y: '赤絵の具の在庫数データを書き込む。', U: '赤絵の具の在庫数データのロックを解除する。',
  };
  const steps = [...txOrder[index]].map((step, i) => circled[i] + labels[step]);
  const c = positions.filter(pos => pos <= txOrder[index].indexOf('R')).length - 1;
  const d = positions.findIndex(pos => pos > txOrder[index].indexOf('X'));
  const acquired: TxKind[] = [], waits: string[] = [];
  for (const { i } of lockTimes.map(([, request], i) => ({ request, i })).sort((a, b) => a.request - b.request)) {
    const kind = requestKinds[index][i];
    if (acquired.some(existing => existing !== '照会' || kind !== '照会')) waits.push('T' + (i + 3));
    else acquired.push(kind);
  }
  const waiting = ['T4T5T6', '', 'T4T5', 'T4', 'T6'].indexOf(waits.sort().join(''));
  const resources = txResources[index], groups = txGroups[index];
  const deadlock = groups.findIndex(group => canDeadlock(group, resources));
  return { stock, out, inbound, redOut, steps, c, d, kinds: requestKinds[index], waiting, waits, resources, groups, deadlock,
    stockChoices: [stock - 2 * out, stock - out, stock, stock + inbound, stock + inbound + out] };
}

const routeCases = [
  { prefix: '10.0', gap: 5, period: 30, observe: [20, 40] },
  { prefix: '10.16', gap: 8, period: 12, observe: [18, 26] },
  { prefix: '172.16', gap: 6, period: 24, observe: [32, 38] },
  { prefix: '10.24', gap: 7, period: 35, observe: [17, 36] },
] as const;
export const routeColumns = ['送信先ネットワークアドレス', '転送先ルータのIPアドレス', '距離'];
export const routeSetOptions = [
  'ネットワークA，B，C及びD', 'ネットワークA，B及びC', 'ネットワークA，B及びD',
  'ネットワークA，C及びD', 'ネットワークB，C及びD', 'ネットワークC及びD',
];
type Route = { distance: number; hop: string };
export function routingCase(index: number) {
  const { prefix, gap, period, observe } = routeCases[index];
  const subnet = (network: number) => prefix + '.' + network + '.0/24';
  const ip = (router: number, network: number) => prefix + '.' + network + '.' + (router === network && router > 0 ? 2 : 1);
  const events = [0, 1, 2].flatMap(router =>
    [0, 1, 2, 3, 4].map(cycle => ({ router, cycle, time: gap * router + period * cycle }))).sort((a, b) => a.time - b.time);
  const tables = Array.from({ length: 3 }, () => new Map<number, Route>());
  const aNetwork = 0, dNetwork = 3;
  let a = -1, b = -1, bTable = new Map<number, Route>();
  const answers = ['', ''];
  for (const { time, router, cycle } of events) {
    if (cycle === 0) for (const network of [router, router + 1]) tables[router].set(network, { distance: 0, hop: '―' });
    for (const neighbor of [router - 1, router + 1]) {
      if (neighbor < 0 || neighbor >= 3 || neighbor * gap > time) continue;
      const table = tables[neighbor];
      for (const [network, route] of tables[router]) {
        const distance = route.distance + 1;
        if ((table.get(network)?.distance ?? Infinity) > distance) table.set(network, { distance, hop: ip(router, Math.max(router, neighbor)) });
      }
    }
    if (a < 0 && tables[0].has(dNetwork)) a = time;
    if (b < 0 && tables[1].has(aNetwork)) {
      b = time;
      bTable = new Map(tables[1]);
    }
    observe.forEach((t, i) => {
      if (time <= t) answers[i] = [...tables[2].keys()].sort().map(network => 'ABCD'[network]).join('');
    });
  }
  const cRows = (aHop: string, aDistance: string, dHop?: string) => [
    [subnet(0), aHop, aDistance], [subnet(1), '―', '0'], [subnet(2), '―', '0'], ...(dHop ? [[subnet(3), dHop, '1']] : []),
  ];
  const candidates = [
    cRows(ip(0, 1), '1'), cRows(ip(0, 1), '1', ip(2, 2)),
    cRows(ip(2, 2), '1', ip(1, 1)), cRows(ip(2, 2), '2', ip(2, 2)),
  ];
  const bTableRows = [...bTable].sort(([left], [right]) => left - right)
    .map(([network, { hop, distance }]) => [subnet(network), hop, String(distance)]);
  const c = candidates.findIndex(rows => JSON.stringify(rows) === JSON.stringify(bTableRows));
  return { subnet, ip, gap, period, observe, a, b, c, candidates, bTableRows, d: answers[0], e: answers[1],
    seconds: sorted([gap, 2 * gap, period, gap + period, 2 * gap + period]) };
}
