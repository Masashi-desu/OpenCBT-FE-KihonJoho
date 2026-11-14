export const healthCases = [{ years: 5, threshold: 5 }, { years: 4, threshold: 4 }, { years: 3, threshold: 6 }, { years: 6, threshold: 7 }] as const;
export const healthFields = [['身長','4けた'],['体重','4けた'],['最高血圧','3けた'],['最低血圧','3けた']] as const;

export const queueCases = [
  { weights: [3, 2, 4, 8], inclusive: false, zeroCursor: false },
  { weights: [4, 3, 5, 8], inclusive: true, zeroCursor: false },
  { weights: [5, 4, 7, 9], inclusive: false, zeroCursor: true },
  { weights: [6, 3, 5, 8], inclusive: true, zeroCursor: true },
] as const;
export type Entry = { label: string; weight: number };
export function insertWeighted(entries: readonly Entry[], entry: Entry, inclusive: boolean) {
  let consumed = 0, position = entries.length;
  while (position > 0) {
    const combined = consumed + entries[position - 1].weight;
    if (combined > entry.weight || (!inclusive && combined === entry.weight)) break;
    consumed = combined;
    position--;
  }
  return [...entries.slice(0, position), entry, ...entries.slice(position)];
}
export function queueIllustration(index: number) {
  const { weights, inclusive } = queueCases[index];
  const entries = weights.map((weight, i) => ({ label: 'abcd'[i], weight }));
  const before = entries.slice(0, -1).reduce<Entry[]>((state, entry) => insertWeighted(state, entry, inclusive), []);
  const after = insertWeighted(before, entries[3], inclusive);
  const comparisons = before.map((_, position) => {
    const addends = before.slice(position).map(entry => entry.weight).reverse();
    const total = addends.reduce((sum, item) => sum + item, 0);
    const relation = index === 0 && position === 0 ? ' ≦ '
      : entries[3].weight === total ? ' ＝ ' : entries[3].weight > total ? ' ＞ ' : ' ＜ ';
    return entries[3].weight + relation + addends.join(' ＋ ');
  });
  return { before, after, inserted: entries[3], comparisons };
}

export const parityCases = [
  { horizontal: 4, word: 7, rows: ['011…1','101…0','010…0','111…1','101…1','011…0'] },
  { horizontal: 3, word: 7, rows: ['011…1','110…0','100…1','001…1','111…0','111…1'] },
  { horizontal: 4, word: 5, rows: ['001…1','100…0','010…1','111…0','010…0','010…0'] },
  { horizontal: 3, word: 5, rows: ['110…1','001…1','011…1','100…1','101…0','101…0'] },
] as const;
