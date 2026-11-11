function signedBranch(mnemonic: string, signed: number, overflow = false) {
  return ({ JMI: signed < 0, JPL: signed > 0, JZE: signed === 0, JNZ: signed !== 0, JOV: overflow })[mnemonic] ?? false;
}
const wordSize = 16;
const mask = 0xFFFF;
const left = (value: number, count: number) => count < 0 || count >= wordSize ? 0 : (value * 2 ** count) & mask;
const right = (value: number, count: number) => count < 0 || count >= wordSize ? 0 : Math.floor(value / 2 ** count);

export function reversedBits(word: number, from = 0, length = wordSize) {
  let result = word;
  for (let i = 0; i < length; i++) {
    const fromBit = wordSize - 1 - (from + i);
    const toBit = wordSize - (from + length) + i;
    const digit = (word >>> fromBit) & 1;
    result = (result & ~(1 << toBit)) | (digit << toBit);
  }
  return result;
}

export function runWord(word: number, a: string, b: string) {
  const overflowBranch = a.trim().split(/\s+/)[0];
  const shift = /^([A-Z]+)\s+GR4,(-?\d+),GR2$/.exec(b);
  if (!shift) return NaN;
  let gr3 = word, gr4 = 0;
  for (let gr2 = 15; gr2 >= 0; gr2--) {
    const overflow = Boolean(gr3 & 1);
    gr3 = right(gr3, 1);
    gr4 = left(gr4, 1);
    if (signedBranch(overflowBranch, gr3, overflow)) gr4 |= 1;
    else if (!gr3) return (shift[1] === 'SLL' ? left : right)(gr4, gr2 + Number(shift[2]));
  }
  return gr4;
}

export function runWords(words: readonly number[], c: string, d: string) {
  const memory = [...words];
  let low = 0, high = words.length - 1, remaining = words.length, cursor = 0;
  let stage = high === low ? 'LOOP2' : 'LOOP1';
  for (let step = 0; step < words.length * 5 + 5; step++) {
    if (stage === 'FIN3') return memory;
    if (stage === 'LOOP1') {
      if (!(low in memory) || !(high in memory)) return null;
      [memory[low], memory[high]] = [memory[high], memory[low]];
      low += 1;
      high -= 1;
      const [mnemonic, label] = c.trim().split(/\s+/);
      stage = signedBranch(mnemonic, low - high) ? label : 'LOOP2';
    } else if (stage === 'LOOP2') {
      if (!(cursor in memory)) return null;
      memory[cursor] = reversedBits(memory[cursor]);
      cursor += 1;
      remaining -= 1;
      const [mnemonic, label] = d.trim().split(/\s+/);
      stage = signedBranch(mnemonic, remaining) ? label : 'FIN3';
    } else return null;
  }
  return null;
}

export function runPart(word: number, p: number, q: number, e: string, f: string) {
  let gr5 = right(reversedBits(word), p);
  let gr6 = wordSize - q;
  const memoryAfterRevrs = reversedBits(word);
  function instruction(value: string) {
    if (/^OR\s+GR6,GR5$/.test(value)) gr6 |= gr5;
    else if (/^OR\s+GR6,0,GR1$/.test(value)) gr6 |= memoryAfterRevrs;
    else if (/^SLL\s+GR5,0,GR6$/.test(value)) gr5 = left(gr5, gr6);
    else if (/^SLL\s+GR5,0,GR3$/.test(value)) gr5 = left(gr5, q);
    else throw new Error(value);
  }
  instruction(e);
  gr5 = right(gr5, p);
  const topOnes = mask - (2 ** (wordSize - q) - 1);
  gr6 = (right(topOnes, p) ^ mask) & word;
  instruction(f);
  return gr6;
}
