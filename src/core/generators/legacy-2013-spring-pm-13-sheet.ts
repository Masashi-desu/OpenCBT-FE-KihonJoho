const sourceShownOrders = [
  [2, '2013-03-19', '3001', 'PA1', 630, '2013-04-02'],
  [3, '2013-03-20', '3005', 'PA1', 460, '2013-04-03'],
  [4, '2013-03-20', '2012', 'PA2', 450, '2013-04-01'],
  [5, '2013-03-21', '2001', 'PA1', 380, '2013-04-04'],
  [34, '2013-03-31', '1006', 'AS1', 84, '2013-04-14'],
  [35, '2013-03-31', '2005', 'PA1', 420, '2013-04-14'],
  [36, '2013-03-31', '3009', 'PA2', 280, '2013-04-14'],
  [37, '2013-03-31', '2003', 'PA3', 225, '2013-04-12'],
] as const;
const sourceDelivery = [
  [0, 670, 460, 380, 60, 0, 40, 680, 400, 360, 520, 480, 560, 420],
  [450, 80, 0, 480, 470, 0, 80, 480, 290, 200, 0, 210, 380, 280],
  [0, 40, 0, 240, 750, 0, 40, 545, 570, 405, 420, 225, 80, 300],
];
const sourceAssembly = [0, 40, 0, 0, 60, 0, 40, 80, 0, 0, 0, 0, 80, 0];
const baseConfigurations = [
  { shift: 0, adjustment: [0, 0, 0, 0], carry: [460, 600, 550, 8], base: [340, 170, 220], cap: [500, 600, 400, 100],
    ratio: [1, 2, 1], bom: [[1, 2, 0, 0], [1, 3, 2, 0], [0, 2, 0, 3]], paLot: 10, asLot: 20, reserve: 80 },
  { shift: 7, adjustment: [-10, 20, -15, 2], carry: [450, 620, 570, 10], base: [330, 180, 210], cap: [560, 620, 430, 120],
    ratio: [1, 2, 1], bom: [[1, 3, 0, 0], [1, 2, 2, 0], [0, 2, 0, 2]], paLot: 10, asLot: 30, reserve: 70 },
  { shift: 14, adjustment: [15, -20, 10, 4], carry: [480, 610, 575, 14], base: [360, 180, 220], cap: [600, 620, 440, 120],
    ratio: [2, 1, 1], bom: [[2, 2, 0, 0], [1, 3, 3, 0], [0, 1, 0, 3]], paLot: 20, asLot: 20, reserve: 90 },
  { shift: 21, adjustment: [20, 10, -15, -3], carry: [480, 640, 590, 12], base: [360, 190, 210], cap: [620, 650, 460, 120],
    ratio: [1, 2, 1], bom: [[1, 2, 0, 0], [2, 3, 2, 0], [0, 2, 0, 4]], paLot: 10, asLot: 40, reserve: 75 },
] as const;
const originalAssemblyOrders = [0, 0, 36, 0, 0, 60, 0, 48, 75, 0, 0, 0, 0, 84];
const products = ['PA1', 'PA2', 'PA3', 'AS1'];
const dayMillis = 86400000;
const shifted = (date: string, day: number) => new Date(Date.parse(date) + day * dayMillis).toISOString().slice(0, 10);
const serial = (date: string) => String(Date.parse(date) / dayMillis + 1);
const quantity = (source: number, adjustment: number) => source === 0 ? 0 : source + adjustment;
const sum = (items: readonly number[]) => items.reduce((total, item) => total + item, 0);

export function productionSheet(index: number) {
  const setup = baseConfigurations[index];
  const dates = Array.from({ length: 14 }, (_, day) => shifted('2013-04-01', day + setup.shift));
  const external = sourceDelivery.map((rows, i) => rows.map((total, day) =>
    quantity(total - sourceAssembly[day] * baseConfigurations[0].ratio[i], setup.adjustment[i])));
  const assemblyOrders = originalAssemblyOrders.map(total => quantity(total, setup.adjustment[3]));
  const orders = sourceShownOrders.map(([row, ordered, account, product, units, due]) => {
    const dueDate = shifted(due, setup.shift);
    return [String(row), shifted(ordered, setup.shift), account, product,
      String(quantity(units, setup.adjustment[products.indexOf(product)])), dueDate, serial(dueDate) + product];
  });
  let asStock: number = setup.carry[3];
  const assembly = assemblyOrders.map((delivery, day) => {
    const delivered = asStock - delivery;
    const shortage = Math.max(0, (assemblyOrders[day + 1] ?? 0) - delivered);
    const output = Math.ceil(shortage / setup.asLot) * setup.asLot;
    asStock = delivered + output;
    return { delivery, output, stock: asStock };
  });
  const project = (part: number, base: number) => {
    let stock: number = setup.carry[part];
    const days = dates.map((_, day) => {
      const delivery = external[part][day] + assembly[day].output * setup.ratio[part];
      const delivered = stock - delivery;
      const output = base + (assembly[day + 1]?.output ?? 0) * setup.ratio[part];
      stock = delivered + output;
      return { delivery, delivered, output, stock };
    });
    const total = sum(days.map(day => day.delivery));
    const shortages = days.filter(day => day.delivered < 0).length;
    const valid = shortages === 0 && days.every(day => day.stock * 1400 >= total * setup.reserve);
    return { days, total, shortages, valid };
  };
  const plans = setup.base.map((base, part) => project(part, base));
  const minimalBases = setup.base.map((_, part) => {
    for (let base = 0; base <= setup.cap[part]; base += setup.paLot) {
      if (project(part, base).valid) return base;
    }
    return -99;
  });
  const demand = dates.slice(0, 7).flatMap((date, day) => minimalBases.map((base, part) => {
    const output = base + assembly[day + 1].output * setup.ratio[part];
    return { date, product: products[part], output, parts: setup.bom[part].map(units => units * output) };
  }));
  const demandTotals = Array.from({ length: 4 }, (_, part) => sum(demand.map(row => row.parts[part])));
  return { setup, dates, orders, external, assemblyOrders, assembly, plans, minimalBases, demand, demandTotals };
}
