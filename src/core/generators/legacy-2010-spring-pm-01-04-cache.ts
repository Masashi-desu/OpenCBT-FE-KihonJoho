const cases = [
  { base: 4000, order: 'ABC', target: 'A' },
  { base: 5000, order: 'ABC', target: 'B' },
  { base: 6000, order: 'BCA', target: 'A' },
  { base: 7000, order: 'CAB', target: 'A' },
];

export type Directory = { block: number; rank: number; flag: number };
type Access = { address: number; command: string; operation: string; block: number; store?: true };

export function cacheScenario(index: number) {
  const { base, order, target } = cases[index];
  const memory = (name: string) => base + 100 * 'ABCD'.indexOf(name);
  const blockFor = (address: number) => address / 100 + 1;
  const constantAddress = base + 400, constant = blockFor(constantAddress);
  const [first, second, third] = order;
  const program: Access[] = [
    { address: 1000, command: 'LOAD  R1,' + constantAddress, operation: '－1をR1に設定', block: constant },
    { address: 1001, command: 'LOAD  R2,' + (constantAddress + 1), operation: 'iの初期値（99）をR2に設定', block: constant },
    { address: 1002, command: 'LOAD  R3,' + memory(first) + ',R2', operation: first + '[i]の内容をR3に設定', block: blockFor(memory(first)) },
    { address: 1003, command: 'ADD   R3,' + memory(second) + ',R2', operation: second + '[i]の内容をR3に加算', block: blockFor(memory(second)) },
    { address: 1004, command: 'ADD   R3,' + memory(third) + ',R2', operation: third + '[i]の内容をR3に加算', block: blockFor(memory(third)) },
    { address: 1005, command: 'STORE R3,' + memory(target) + ',R2', operation: 'R3の内容を' + target + '[i]に格納', block: blockFor(memory(target)), store: true },
    { address: 1006, command: 'STORE R3,' + memory('D') + ',R2', operation: 'R3の内容をD[i]に格納', block: blockFor(memory('D')), store: true },
    { address: 1007, command: 'ADDR  R2,R1', operation: 'i ← i － 1', block: 0 },
    { address: 1008, command: 'JNM   1002', operation: 'i ≧ 0ならば1002番地にジャンプ', block: 0 },
  ];
  return { base, order, target, memory, constantAddress, constant, program, blockFor };
}

export function cacheTrace(index: number, lru: boolean): Directory[][] {
  const { program } = cacheScenario(index);
  type BufferEntry = { block: number; flag: number; inserted: number; referenced: number };
  const slots: Array<BufferEntry | undefined> = Array(3).fill(undefined);
  const priority = (entry: BufferEntry) => lru ? entry.referenced : entry.inserted;
  const steps = [...program, ...program.slice(2)];
  return steps.map(({ block, store }, t) => {
    if (block) {
      let i = slots.findIndex(entry => entry?.block === block);
      if (i < 0) {
        i = slots.findIndex(entry => entry === undefined);
        if (i < 0) i = [0, 1, 2].reduce((earlier, later) => priority(slots[earlier]!) < priority(slots[later]!) ? earlier : later);
        slots[i] = { block, flag: 0, inserted: t, referenced: t };
      }
      slots[i]!.referenced = t;
      if (store) slots[i]!.flag = 1;
    }
    return slots.map(entry => entry ? { block: entry.block, flag: entry.flag,
      rank: 1 + slots.filter(other => other && priority(other) < priority(entry)).length } : { block: 0, flag: 0, rank: 0 });
  });
}

export function cacheExample(index: number): Directory[] {
  const { base, constant } = cacheScenario(index);
  return [{ block: base / 100 + 1, rank: 1, flag: 0 }, { block: constant, rank: 2, flag: 1 }, { block: 0, rank: 0, flag: 0 }];
}

export function cacheDirectory(index: number, at: 0 | 6) {
  const blanks = at === 0 ? ['［a］', '', ''] : ['［b］', '', '［c］'];
  return cacheTrace(index, false)[at].map(({ block, rank, flag }, i) => [blanks[i] || String(block), String(rank), String(flag)]);
}

export function cacheTimeline(index: number) {
  const traces = cacheTrace(index, true);
  const { program } = cacheScenario(index), steps = [...program, ...program.slice(2)];
  const masked = new Map([[6, [1, '［d］']], [9, [2, '［e］']], [10, [0, '［f］']]] as const);
  return steps.map(({ address }, i) => ({ address: String(address), cells: traces[i].map(({ block, flag }, j) => {
    if (i < 6) return [String(block), String(flag)];
    const blank = masked.get(i as 6 | 9 | 10);
    return blank?.[0] === j ? [blank[1]] : [];
  }) }));
}
