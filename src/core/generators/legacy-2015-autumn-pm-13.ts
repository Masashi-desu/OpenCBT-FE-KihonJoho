import { field } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { autumn2015PmPageAssetId, autumn2015PmReference } from './legacy-2015-autumn-pm-materials';
import { autumn2015Pm13Worksheets } from './legacy-2015-autumn-pm-09-13-source';
import { buildAutumn2015LanguageBody, selectCase, type LanguagePanel, type Worksheet } from './legacy-2015-autumn-pm-09-13-support';

type Product = { id: number; name: string; code: string; unitPrice: number };
type Set = { name: string; parts: { product: number; required: number }[]; discount: number };
type InvoiceLine = { product: number; quantity: number };
const price = (text: string) => Number(text.replaceAll(',', ''));
const yen = (amount: number) => amount.toLocaleString('en-US');
const referencePages = [3, 4, 79, 80, 81, 82, 83, 84];
const priceTitle = autumn2015Pm13Worksheets.price[0];
const publishedProducts: Product[] = autumn2015Pm13Worksheets.price.slice(1).map(([, id, name, code, amount]) =>
  ({ id: Number(id), name, code, unitPrice: price(amount) }));
const exampleOnlyProducts: Product[] = [
  { id: 17, name: 'ディスプレイ（20インチ）', code: 'DSP200', unitPrice: 26000 },
  { id: 18, name: 'ディスプレイ（24インチ）', code: 'DSP24', unitPrice: 38650 },
  { id: 22, name: '外付けHDD（1TB）', code: 'HD100', unitPrice: 12000 },
];
const originalSets: Set[] = autumn2015Pm13Worksheets.sets.slice(2).map(row => ({
  name: row[2], discount: price(row[9]),
  parts: [0, 1, 2].map(i => ({ product: Number(row[11 + i]), required: Number(row[4 + i * 2]) })),
}));
const purchaseProfiles = [
  [2, 1, 1, 2, 2, 1, 1, 2, 1, 1, 1, 1], [1, 2, 1, 1, 3, 2, 2, 3, 1, 1, 1, 2],
  [3, 1, 2, 3, 1, 1, 1, 3, 2, 2, 1, 2], [2, 2, 1, 1, 1, 2, 2, 4, 1, 2, 2, 1],
  [1, 1, 2, 2, 2, 1, 1, 1, 2, 1, 1, 1], [2, 3, 1, 2, 1, 3, 2, 4, 1, 1, 1, 2],
  [3, 1, 1, 3, 1, 1, 1, 2, 1, 2, 1, 2], [1, 1, 2, 1, 1, 1, 2, 3, 2, 1, 1, 1],
  [2, 2, 1, 3, 2, 1, 1, 3, 2, 2, 1, 2],
];
const invoiceProducts = [1, 4, 18, 12, 15, 14, 5, 6, 8, 10, 50, 15];
export const autumn2015Pm13CaseCount = purchaseProfiles.length;
export const autumn2015Pm13Profiles = ['price-sheet', 'set-sheet', 'invoice-sheet'] as const;

export function autumn2015Pm13Model(index: number) {
  const products = Array.from({ length: 50 }, (_, i): Product => {
    const id = i + 1;
    const original = [...publishedProducts, ...exampleOnlyProducts].find(item => item.id === id);
    if (!original) return { id, name: '周辺機器' + id, code: 'AC' + id, unitPrice: 1500 + id * 100 };
    return { ...original, unitPrice: original.unitPrice + (index && id <= 15 ? 100 * index * (id % 3) : 0) };
  });
  const sets = originalSets.map((set, i) => ({ ...set,
    discount: set.discount - (index && i % 3 === 0 ? 100 * index : 0),
    parts: set.parts.map((part, j) => ({ ...part, required: part.required + (index && i === 0 && j === 2 ? index % 2 : 0) })),
  }));
  if (index % 2 === 0 && index !== 0) [sets[7], sets[8]] = [sets[8], sets[7]];
  const lines: InvoiceLine[] = invoiceProducts.map((product, i) => ({ product, quantity: purchaseProfiles[index][i] }));
  const remaining = Array.from({ length: 50 }, (_, i) =>
    lines.reduce((sum, line) => sum + (line.product === i + 1 ? line.quantity : 0), 0));
  const amounts = sets.map(({ parts }) => {
    const count = Math.min(...parts.map(({ product, required }) => Math.floor(remaining[product - 1] / required)));
    for (const { product, required } of parts) remaining[product - 1] -= count * required;
    return count;
  });
  const subtotal = lines.reduce((sum, { product, quantity }) => sum + products[product - 1].unitPrice * quantity, 0);
  const discount = amounts.reduce((sum, amount, i) => sum + amount * sets[i].discount, 0);
  return { products, sets, lines, amounts, subtotal, discount, total: subtotal + discount };
}

function generatedWorksheets(index: number) {
  const { products, sets, lines, amounts, subtotal, discount, total } = autumn2015Pm13Model(index);
  const priceRows = [priceTitle, ...publishedProducts.map(({ id }) => {
    const { name, code, unitPrice } = products[id - 1];
    return [String(id + 1), String(id), name, code, yen(unitPrice)];
  })];
  const setRows = [...autumn2015Pm13Worksheets.sets.slice(0, 2), ...sets.map(({ name, parts, discount: amount }, i) =>
    [String(i + 3), String(i + 1), name, ...parts.flatMap(({ product, required }) => [products[product - 1].code, String(required)]),
      yen(amount), '', ...parts.map(({ product }) => String(product))])];
  const invoiceRows = autumn2015Pm13Worksheets.invoice.map(row => {
    const rowNumber = Number(row[0]);
    if (rowNumber <= 3) return [...row.slice(0, -1), yen([subtotal, discount, total][rowNumber - 1])];
    const line = lines[rowNumber - 7];
    if (line) {
      const { name, unitPrice } = products[line.product - 1];
      return [row[0], row[1], name, String(line.quantity), yen(unitPrice), yen(unitPrice * line.quantity)];
    }
    if (rowNumber >= 30) {
      const set = sets[rowNumber - 30], amount = amounts[rowNumber - 30];
      return [row[0], row[1], set.name, amount ? String(amount) : '', yen(set.discount), amount ? yen(amount * set.discount) : ''];
    }
    return row;
  });
  return { price: priceRows, sets: setRows, invoice: invoiceRows };
}

const omissionRow = (length: number) => Array<string>(length).fill('⋮');
function worksheet(profile: string, index: number): Worksheet {
  const data = index === 0 ? autumn2015Pm13Worksheets : generatedWorksheets(index);
  switch (profile) {
    case 'price-sheet':
      return { columns: ['', 'A', 'B', 'C', 'D'], widths: [3, 6, 25, 10, 9],
        rows: [...data.price.slice(0, -1), omissionRow(5), data.price.at(-1)!] };
    case 'set-sheet':
      return { columns: ['', ...'ABCDEFGHIJKLM'], widths: [3, 6, 17, 9, 5, 9, 5, 9, 5, 8, 2, 8, 8, 8],
        rows: data.sets, spacerColumn: 10, merges: [
          ...[1, 2, 11, 12, 13].map(column => ({ row: 0, column, rowSpan: 2, colSpan: 1 })),
          ...[3, 5, 7].map(column => ({ row: 0, column, rowSpan: 1, colSpan: 2 })),
        ] };
    case 'invoice-sheet':
      return { columns: ['', 'A', 'B', 'C', 'D', 'E'], widths: [3, 6, 25, 7, 23, 15],
        rows: data.invoice.flatMap(row => ['26', '36'].includes(row[0]) ? [omissionRow(6), row] : [row]) };
    default: throw new Error('FIGURE_PROFILE');
  }
}
export const autumn2015Pm13Panel = (profile: string, index: number): LanguagePanel => ({ kind: 'worksheet', sheet: worksheet(profile, index) });

export const legacy2015AutumnPm13Definition: AfternoonBookletDefinition = {
  source: '2015h27a-fe-pm-13', title: '旧制度・午後：表計算によるセット値引きと購入金額',
  fields: [field('購入内容・価格・セット優先順の条件番号', 0, autumn2015Pm13CaseCount - 1)], reference: [0], version: '3.7.0',
  answerVariation: 'fixed', sourceAnswer: '設問1 a=オ，b=ウ／設問2 c=ウ，d=ア，e=オ，f=ア，g=オ',
  fixedReferenceAssetIds: referencePages.map(autumn2015PmPageAssetId),
  publicNotes: 'セル配置と値引きマクロを保ち，購入数量・単価・必要個数・セット優先順が異なる例を出題します。',
  notes: '印刷・PDF p64–70の7欄。50商品・10セット・20明細枠、三つの商品、重複する購入明細、null、絶対行と相対参照、先着セット順と在庫減算を保持。原図の省略行は補わず，改変例は独立の製品データと数量を使用。欄は式・演算子でありセル配置と判定方向が一定のため正答の意味を固定。生成表は在庫をセットごとに一組ずつ引く独立解で確認。',
  build(values) {
    const index = selectCase(values, autumn2015Pm13CaseCount);
    const { subtotal, discount, total, amounts } = autumn2015Pm13Model(index);
    const selected = amounts.flatMap((amount, i) => amount ? [(i + 1) + '番×' + amount] : []);
    return buildAutumn2015LanguageBody({ number: 13, index, panel: autumn2015Pm13Panel,
      contexts: [autumn2015PmReference('共通に使用する擬似言語の記述形式', [3, 4]),
        autumn2015PmReference('表計算ソフトの機能・用語', [79, 80, 81, 82, 83, 84])],
      explanation: 'aは商品名が左端のB$2:D$51を完全一致で探し，3列目の単価を返す。行を複写しても範囲の上下端は固定する。' +
        'bはI3から値引き額を取り，複写で行を進める。cは商品コードC$2:C$51、dは対応する商品番号A$2:A$51。' +
        'eはB2をI行ずらした商品名を取り，条件付合計で同じ商品を購入した全行の数量を足す。' +
        'fで各商品について作れる個数の最小を残し，gで必要個数にセット数量を掛けた分を在庫から引く。' +
        'この例の適用は' + selected.join('、') + '。合計' + yen(subtotal) + '円、値引き' + yen(discount) + '円、購入金額' + yen(total) + '円。' });
  },
};
