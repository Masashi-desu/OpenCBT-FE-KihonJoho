/** Independent worksheet transition evaluator. Does not call product packing/rounding helpers. */
export type Melon = { id: number; grams: number; shape: number; skin: number };
export type Tuple = [string, string, string];
// Independently transcribed from raw QS76 d-bank, including all seven distractors.
export const sourceTuples: Tuple[] = [
  ['i', 'i', '1'], ['i', 'i', 'i'], ['i', 'i', 'j'], ['i', 'j', 'j'],
  ['j', 'i', '0'], ['j', 'j', '0'], ['j', 'j', 'i'], ['j', 'j', 'j'],
];
export const labels = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク'];
export function parseAssignment(text: string): Tuple {
  const match = /^相対\(F1,([ij]),0\) ← 相対\(F1,([ij]),0\) \+ 相対\(集計表!B1,([ij01]),0\)$/.exec(text);
  if (!match) throw Error('unexpected displayed d assignment');
  return [match[1], match[2], match[3]];
}
export const normalizeState = (cells: Map<string, number>) => [...cells].sort(([a], [b]) => a.localeCompare(b));
const address = (column: number, relativeRow: number) => `${column}/${relativeRow}`;

export function reference(rows: Melon[], unit: number) {
  const boxes: { number: number; ids: number[]; grams: number; saleYen: number }[] = [];
  let buffer: Melon[] = [];
  for (const row of rows) {
    // Grade is lowest of two evaluations. Independent predicate for grade並.
    if (row.shape !== 2 && row.skin !== 2) continue;
    buffer.push(row);
    const grams = buffer.reduce((sum, r) => sum + r.grams, 0);
    if (grams >= 5000 || buffer.length >= 4) {
      const yen = ((BigInt(grams) * BigInt(unit) + 49999n) / 50000n) * 50n;
      boxes.push({ number: boxes.length + 1, ids: buffer.map(r => r.id), grams, saleYen: Number(yen) });
      buffer = [];
    }
  }
  // Unfinished last box is omitted, as source75's final6-cell cleanup specifies.
  const cells = new Map<string, number>();
  for (const box of boxes) {
    cells.set(address(0, box.number), box.number);
    box.ids.forEach((id, i) => cells.set(address(1 + i, box.number), id));
    cells.set(address(5, box.number), box.grams);
  }
  return { boxes, state: normalizeState(cells) };
}

export function executeDisplayedD(rows: Melon[], tuple: Tuple) {
  const cells = new Map<string, number>();
  const trace: { i: number; j: number; target: number; sumRow: number; inputRow: number; sumGrams: number | null; inputGrams: number | string; resultGrams: number | null }[] = [];
  let j = 1, currentColumn = 0;
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index], i = index + 1;
    if (row.shape !== 2 && row.skin !== 2) continue;
    if (currentColumn === 0) { cells.set(address(0, j), j); cells.set(address(5, j), 0); }
    cells.set(address(1 + currentColumn, j), row.id);
    const resolve = (term: string) => term === 'i' ? i : term === 'j' ? j : Number(term);
    const [target, sumRow, inputRow] = tuple.map(resolve);
    const sumGrams = cells.get(address(5, sumRow)) ?? null;
    const inputGrams = inputRow === 0 ? '重量kg見出し' : rows[inputRow - 1]?.grams ?? '入力範囲外';
    if (typeof inputGrams !== 'number') {
      trace.push({ i, j, target, sumRow, inputRow, sumGrams, inputGrams, resultGrams: null });
      return { state: normalizeState(cells), error: 'non-numeric input cell', trace };
    }
    // Correct option reads initialized numeric cells only. For distractors, even
    // permissively treating an empty F cell as0 cannot make their final sheet correct.
    // This does not assert a general null arithmetic rule of the source software.
    const resultGrams = (sumGrams ?? 0) + inputGrams;
    cells.set(address(5, target), resultGrams);
    trace.push({ i, j, target, sumRow, inputRow, sumGrams, inputGrams, resultGrams });
    currentColumn++;
    if ((cells.get(address(5, j)) ?? 0) >= 5000 || currentColumn === 4) { j++; currentColumn = 0; }
  }
  if (cells.has(address(5, j))) for (let column = 0; column <= 5; column++) cells.delete(address(column, j));
  return { state: normalizeState(cells), error: null, trace };
}
