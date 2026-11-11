import { languageFigure, type LanguageTable } from './legacy-2010-spring-pm-09-13-support';

const drinkNames = ['ブレンド', 'カプチーノ', 'カフェモカ', '抹茶ラテ'];
const dishNames = ['サンドイッチ', 'ハンバーガー', 'カレー', 'ナポリタン'];
const drinkTypes = ['S', 'M', 'L', 'セット割引'];
const dishTypes = ['単品', 'ランチ', '大盛'];
const baseDrinkPrices = [[300, 350, 400], [350, 400, 450], [400, 450, 500], [450, 500, 550]];
const baseDishPrices = [[550, 650], [400, 550], [650, 850, 950], [700, 900, 1050]];

export const discountCases = [
  { priceOffset: 0, discounts: [-150, -200, -250, -300], drinks: [[4, 0, 0, 4], [0, 5, 0, 4], [0, 3, 0, 1], [0, 0, 3, 1]],
    dishes: [0, 3, 0, 3, 0, 2, 1, 1, 2, 1], minimumDrink: 15, minimumDish: 10, minimumTotal: 30, percent: 5 },
  { priceOffset: 20, discounts: [-160, -230, -200, -300], drinks: [[1, 3, 1, 2], [1, 5, 0, 4], [0, 3, 1, 1], [1, 0, 2, 1]],
    dishes: [0, 2, 0, 3, 1, 4, 0, 1, 4, 0], minimumDrink: 20, minimumDish: 9, minimumTotal: 32, percent: 8 },
  { priceOffset: 30, discounts: [-170, -220, -280, -260], drinks: [[0, 2, 0, 1], [1, 1, 2, 3], [1, 0, 1, 2], [1, 2, 3, 4]],
    dishes: [1, 2, 0, 2, 0, 2, 1, 1, 2, 1], minimumDrink: 16, minimumDish: 14, minimumTotal: 28, percent: 10 },
  { priceOffset: 40, discounts: [-180, -260, -210, -320], drinks: [[1, 4, 0, 4], [2, 0, 3, 2], [0, 3, 1, 3], [1, 1, 4, 5]],
    dishes: [0, 4, 1, 3, 0, 2, 1, 1, 3, 1], minimumDrink: 16, minimumDish: 11, minimumTotal: 33, percent: 6 },
];
const display = (value: number) => value.toLocaleString('en-US').replace('-', '−');
type ReceiptItem = { category: string; item: string; type: string; price: number; quantity: number };
const sum = (items: readonly number[]) => items.reduce((acc, value) => acc + value, 0);
const columns = (last: string) => ['行', ...'ABCDEFGHIJ'.slice(0, last.charCodeAt(0) - 64)];

function receipt(index: number) {
  const state = discountCases[index];
  const drinks = drinkNames.flatMap((item, i): ReceiptItem[] =>
    [...baseDrinkPrices[i].map(price => price + state.priceOffset), state.discounts[i]].map((price, j) =>
      ({ category: '飲料', item, type: drinkTypes[j], price, quantity: state.drinks[i][j] })));
  let dishQuantityIndex = 0;
  const dishes = dishNames.flatMap((item, i): ReceiptItem[] => baseDishPrices[i].map((price, j) =>
    ({ category: '料理', item, type: dishTypes[j], price: price + state.priceOffset, quantity: state.dishes[dishQuantityIndex++] })));
  return [...drinks, ...dishes];
}
function receiptTotal(items: ReceiptItem[]) {
  return sum(items.map(item => item.price * item.quantity));
}
export function discountResult(index: number) {
  const state = discountCases[index];
  const orderedDrinks = state.drinks.map(quantities => sum(quantities.slice(0, 3)));
  const orderedSets = state.drinks.map(quantities => quantities[3]);
  const drinks = sum(orderedDrinks);
  const dishes = sum(state.dishes);
  const sets = Math.min(drinks, dishes);
  let remaining = sets;
  const ranks = [...state.discounts.keys()].sort((a, b) => state.discounts[a] - state.discounts[b]);
  const rows = ranks.map(i => {
    const unitDiscount = state.discounts[i];
    const assigned = Math.min(remaining, orderedDrinks[i]);
    const row = [drinkNames[i], unitDiscount, orderedDrinks[i], orderedSets[i], orderedSets[i] * unitDiscount,
      remaining, assigned, assigned * unitDiscount] as const;
    remaining -= assigned;
    return row;
  });
  const originalDiscount = sum(rows.map(row => row[4]));
  const optimalDiscount = sum(rows.map(row => row[7]));
  const total = receiptTotal(receipt(index));
  const optimal = total - originalDiscount + optimalDiscount;
  const qualifies = (drinks >= state.minimumDrink && dishes >= state.minimumDish) || drinks + dishes >= state.minimumTotal;
  const afterQuantity = Math.floor(optimal * (qualifies ? 100 - state.percent : 100) / 100);
  return { rows, total, drinks, dishes, sets, setsInitially: sum(orderedSets), remaining, originalDiscount, optimalDiscount, optimal, afterQuantity };
}
const sheet = (last: string, rows: string[][], merges?: LanguageTable['merges']): LanguageTable => ({
  headers: columns(last), rows: rows.map((row, index) => [String(index + 1), ...row]), merges,
});

export const menuSheet = languageFigure(13, 'menu-sheet', '図1 ワークシート“メニュー”', index => {
  const { priceOffset, discounts } = discountCases[index];
  return { kind: 'tables', tables: [sheet('J', [
    ['飲料メニュー', '', '', '', '', '', '料理メニュー', '', '', ''],
    ['飲料品目', 'サイズ', '', '', '', '', '料理品目', 'オプション', '', ''],
    ['', 'S', 'M', 'L', 'セット割引', '', '', '単品', 'ランチ', '大盛'],
    ...drinkNames.map((name, i) => [name, ...baseDrinkPrices[i].map(price => display(price + priceOffset)), display(discounts[i]), '',
      dishNames[i], ...dishTypes.map((_, j) => baseDishPrices[i][j] === undefined ? '—' : display(baseDishPrices[i][j] + priceOffset))]),
  ], [
    { row: 0, column: 1, rowSpan: 1, colSpan: 5 }, { row: 0, column: 7, rowSpan: 1, colSpan: 4 },
    { row: 1, column: 1, rowSpan: 2, colSpan: 1 }, { row: 1, column: 2, rowSpan: 1, colSpan: 3 },
    { row: 1, column: 7, rowSpan: 2, colSpan: 1 }, { row: 1, column: 8, rowSpan: 1, colSpan: 3 },
  ])] };
});
export const receiptSheet = languageFigure(13, 'receipt-sheet', '図2 ワークシート“伝票”の例', index => {
  const items = receipt(index);
  return { kind: 'tables', tables: [sheet('F', [
    ['種類', '品目', 'タイプ', '単価', '数量', '料金'],
    ...items.map(({ category, item, type, price, quantity }) => [category, item, type, display(price), display(quantity), display(price * quantity)]),
    ['合計料金', '', '', '', '', display(receiptTotal(items))],
  ], [{ row: 27, column: 1, rowSpan: 1, colSpan: 5 }])] };
});
export const discountSheet = languageFigure(13, 'discount-sheet', '図3 ワークシート“割引”の例', index => {
  const result = discountResult(index);
  return { kind: 'tables', tables: [sheet('H', [
    ['セット割引', display(result.setsInitially), '', '', '', '', '', ''],
    ['飲料', display(result.drinks), '', '', '', '', '', ''],
    ['料理', display(result.dishes), '', '', '', '', '', ''],
    ['最適セット数', display(result.sets), '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''], ['', '', '', '', '', '', '', ''],
    ['品目', 'セット割引', '注文時', '', '', '最適割引時', '', ''],
    ['', '単価', '注文数', 'セット数', '割引額', '残数', 'セット数', '割引額'],
    ...result.rows.map(([name, ...values]) => [name, ...values.map(display)]),
    ['合計', '', display(result.drinks), display(result.setsInitially), display(result.originalDiscount),
      display(result.remaining), display(result.sets), display(result.optimalDiscount)],
    ['最適割引時の合計料金', display(result.optimal), '', '', '', '', '', ''],
    ['数量割引後の合計料金', display(result.afterQuantity), '', '', '', '', '', ''],
  ], [
    { row: 0, column: 3, rowSpan: 4, colSpan: 6 }, { row: 4, column: 1, rowSpan: 2, colSpan: 8 },
    { row: 6, column: 1, rowSpan: 2, colSpan: 1 }, { row: 6, column: 3, rowSpan: 1, colSpan: 3 },
    { row: 6, column: 6, rowSpan: 1, colSpan: 3 }, { row: 12, column: 1, rowSpan: 1, colSpan: 2 },
    { row: 13, column: 3, rowSpan: 2, colSpan: 6 },
  ])] };
});
