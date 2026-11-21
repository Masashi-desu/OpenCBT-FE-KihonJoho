const symbols = [...'△さてっくこがせたとどまんうごそでにはばひもやよれをあいおかきしちぬのぽり'];
const originalFrequencies = [12, 11, 6, 5, 4, 4, ...Array(7).fill(3), ...Array(13).fill(2), ...Array(11).fill(1)];
const transfers = [
  [],
  [['や', 'り'], ['そ', 'れ'], ['△', 'く'], ['て', 'を'], ['た', 'こ']],
  [['く', 'で'], ['ひ', 'ば'], ['も', 'て']],
  [['△', 'さ'], ['く', 'っ']],
] as const;

type SymbolCount = { symbol: string; count: number };
type Node = { count: number; symbol: string; children?: readonly [Node, Node] };

export const huffmanCaseCount = transfers.length;

export function huffmanMaterial(condition: number) {
  const counts = new Map(symbols.map((symbol, index) => [symbol, originalFrequencies[index]]));
  for (const [from, to] of transfers[condition]) {
    counts.set(from, counts.get(from)! - 1);
    counts.set(to, counts.get(to)! + 1);
  }
  const characters = symbols.map(symbol => ({ symbol, count: counts.get(symbol)! }));
  characters.sort((left, right) => right.count - left.count || left.symbol.codePointAt(0)! - right.symbol.codePointAt(0)!);

  // The independent input uses the frequency multiset alone. Walk the symbols
  // in reverse code order, emitting the next available character in each round.
  const independentOrder = [...characters].sort((left, right) => right.symbol.codePointAt(0)! - left.symbol.codePointAt(0)!);
  const text = Array.from({ length: Math.max(...counts.values()) }, (_, round) => independentOrder
    .filter(character => character.count > round).map(character => character.symbol).join('')).join('');
  return { characters, text };
}

export function huffmanModel(characters: readonly SymbolCount[]) {
  const pending: Node[] = characters.map(({ count, symbol }) => ({ count, symbol }));
  const stages = new Map<number, Node[]>();
  while (pending.length > 1) {
    // Sort is stable so a newly appended virtual character follows existing
    // characters of the same weight. Leaf ties start in character code order.
    pending.sort((left, right) => right.count - left.count);
    stages.set(pending.length, [...pending]);
    const second = pending.pop()!;
    const first = pending.pop()!;
    pending.push({ count: first.count + second.count, symbol: '', children: [first, second] });
  }
  const codes = new Map<string, string>();
  function visit(node: Node, prefix: string) {
    if (!node.children) { codes.set(node.symbol, prefix); return; }
    visit(node.children[0], prefix + '1');
    visit(node.children[1], prefix + '0');
  }
  visit(pending[0], '');
  let runningBits = 0;
  const rows = characters.map(({ symbol, count }) => {
    const bits = codes.get(symbol)!;
    const weightedBits = count * bits.length;
    runningBits += weightedBits;
    return { symbol, count, bits, length: bits.length, weightedBits, runningBits };
  });
  return { stages, rows, total: pending[0].count, totalBits: runningBits };
}

export function huffmanCase(condition: number) {
  const material = huffmanMaterial(condition);
  return { ...huffmanModel(material.characters), ...material };
}
