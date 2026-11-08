import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, table } from './definition';
import {
  autumn2014Pm0508Banks as banks, q7Day, q7OrderHead, q7Orders, q7OrderTail, q7Tables, type Q7Order,
} from './legacy-2014-autumn-pm-05-08-source';
import { answerField, body, choiceBank, choices, promptPages, selectInput } from './legacy-2014-autumn-pm-05-08-shared';

const lead = 7, reorder = 90, lot = 300;
const closingOrder: Q7Order = [130175, 25, 25, 25];
const earlierClosingOrders = [...q7Orders.slice(0, -1), closingOrder];
const settings = [
  { initial: 270, orders: q7Orders },
  { initial: 280, orders: earlierClosingOrders },
  { initial: 260, orders: earlierClosingOrders },
] as const;

type Pending = { id: number; left: number };
function runStock(orders: readonly Q7Order[], initial: number, individual: boolean) {
  let stock = initial, arrives: number | undefined;
  const dates: number[] = [], fulfilled = new Map<number, number>(), balances = new Map<number, number>();
  const pending: Pending[] = [];
  function allocate(order: Pending, day: number) {
    const taken = Math.min(stock, order.left);
    stock -= taken;
    order.left -= taken;
    if (!order.left) fulfilled.set(order.id, day);
  }
  for (let day = 1; day <= 31; day++) {
    if (arrives === day) {
      stock += lot;
      arrives = undefined;
      while (stock && pending.length) {
        allocate(pending[0], day);
        if (pending[0].left) break;
        pending.shift();
      }
    }
    for (const [id, order, quantity, due] of orders) {
      if (order !== day) continue;
      if (individual && due - order >= lead) fulfilled.set(id, day + lead);
      else {
        const item = { id, left: quantity };
        allocate(item, day);
        if (item.left) pending.push(item);
      }
      balances.set(id, stock);
    }
    if (stock <= reorder && arrives === undefined) {
      dates.push(day);
      arrives = day + lead;
    }
  }
  return { dates, balances, late: orders.flatMap(([id, , , due]) => (fulfilled.get(id) ?? Infinity) > due ? [id] : []) };
}

function build(values: number[]) {
  const s = selectInput(values, settings);
  const current = runStock(s.orders, s.initial, false), improved = runStock(s.orders, s.initial, true);
  const [order] = current.dates, after = improved.balances.get(130168)!;
  if (current.dates.length !== 1 || improved.late.length || !current.late.length) throw new Error('PARAMETER_CONSTRAINT');
  const tables = q7Tables(s.orders, s.initial);
  const prompt = promptPages(36, 40, id => {
    if (id === 'q7-order-head') return undefined;
    if (id === 'q7-order-tail') return p(q7OrderHead + q7OrderTail);
    if (id === 'q7-before' || id === 'q7-after') {
      const t = tables[id];
      return table(t.caption, t.columns, t.rows);
    }
    throw new Error('SOURCE_FORMAT');
  }, text => text.replace('在庫の数量は270個', '在庫の数量は' + s.initial + '個'));
  const e = [0, after - 25, after, after + 35];
  return body(prompt, [...['71', '7a', '7b', '7c', '7d'].map(choiceBank), { id: 'e', choices: choices(e) }], [
    answerField('1', '71', banks['71'][1]), answerField('a', '7a', q7Day(order)),
    answerField('b', '7b', current.late.join('と')), answerField('c', '7c', banks['7c'][1]),
    answerField('d', '7d', banks['7d'][0]), answerField('e', '7e', after, e),
  ], '現状では納入リードタイムに関係なく受注を登録し，利用可能な数を引き当てる（設問1）。' +
    '在庫が発注点以下になるのは' + q7Day(order) + 'の受付後で，' + q7Day(order + lead) + 'に' + lot +
    '個入庫する（a）。入庫までに全数を引き当てられず要求納期に間に合わないのは' + current.late.join('と') + '（b）。' +
    '在庫として残っている商品でも先に受けた注文へ引き当てると，入庫より早い納期の別注文には使えない（c）。' +
    '改修後は納入リードタイムが調達リードタイム以上の注文を受注登録した上で，通常の在庫引当てはせず個別に発注する（d）。' +
    '該当は' + s.orders.filter(([, day, , due]) => due - day >= lead).map(([id]) => id).join('，') +
    'で，それらを除く受注130168までの在庫引当てを合計すると' + (s.initial - after) + '個である。したがって' +
    s.initial + '−' + (s.initial - after) + '＝' + after + '個（e）。個別発注で入庫した商品は共通在庫に加えない。');
}

export const legacy2014AutumnPm7Definition: AfternoonBookletDefinition = {
  source: '2014h26a-fe-pm-7', title: '受発注システムの改修',
  version: '3.7.0', reference: [0], fields: [field('6月末の在庫と最後の受注・納期', 0, settings.length - 1)],
  sourceAnswer: 'イ／ウ／ア／イ／ア／ウ',
  notes: '物理・冊子p36–40。受付・発注・入庫時刻、FIFO・部分引当、要求と約束、調達リードタイム・発注点、2表の網掛けと空欄、3件の個別発注と長期評価の但し書きを保持。初期在庫と最後の納期を三条件で変更し、整数個・日付・遅配集合を検算。',
  publicNotes: '6月末の在庫と最後の注文の日付を変更し，改修前後の在庫を同じ方法で追跡します。',
  build,
};
