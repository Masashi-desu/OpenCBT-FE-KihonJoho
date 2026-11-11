import { autumn2015PmCase } from './legacy-2015-autumn-pm-01-04-shared';

export const caseCount = 4;
export const caseIndex = (values: number[]) => autumn2015PmCase(values, caseCount - 1);
export const formatted = (value: number) => value.toLocaleString('en-US');
export const collection = '2011h23tokubetsu-fe-pm';
export const stages = ['外部設計', '内部設計', '実装', 'テスト'];
export const storefronts = ['駅ビル内店舗', '駅前商店街店舗', '郊外ショッピングモール内店舗', '出店しない'];

const transactions: readonly (readonly [number, number, string, string, number, number])[] = [
  [5,8,'001','A008',3,60000], [5,25,'001','A180',8,44000],
  [6,3,'002','B150',5,25000], [6,18,'002','B125',5,20000],
  [5,25,'005','A007',1,50000], [4,29,'010','B001',1,45000], [5,25,'010','B150',12,60000],
  [6,3,'081','A201',2,52000], [6,12,'081','B002',2,60000], [6,20,'081','A006',2,20000], [7,16,'081','A200',5,48000],
  [5,10,'258','B003',1,2500], [5,18,'386','A182',1,25000], [6,18,'386','A198',2,20000], [6,21,'386','A108',1,50000],
];
const campaigns = [
  [5,10,6,20,50000,'A001','A199'],
  [5,8,6,20,45000,'A001','A199'],
  [5,18,6,18,60000,'A001','A199'],
  [5,10,6,21,50000,'A006','A200'],
] as const;

export function campaignAt(index: number) {
  const [startMonth,startDay,endMonth,endDay,threshold,firstProduct,lastProduct] = campaigns[index];
  const customers = new Map<string, { amount: number; applications: number }>();
  for (const [month,day,customer,product,quantity,amount] of transactions) {
    const date = 100 * month + day;
    if (date < 100 * startMonth + startDay || date > 100 * endMonth + endDay) continue;
    const total = customers.get(customer) ?? { amount: 0, applications: 0 };
    total.amount += amount;
    if (firstProduct <= product && product <= lastProduct) total.applications += quantity;
    customers.set(customer,total);
  }
  const invitations = [...customers.values()].filter(total => total.amount >= threshold).length;
  const addresses = [...customers.values()].filter(total => total.amount >= threshold || total.applications > 0).length;
  return { startMonth,startDay,endMonth,endDay,threshold,firstProduct,lastProduct,transactions,customers,invitations,addresses };
}

const projects = [
  { rates: [40,40,30,30], actualRates: [40,42,25], external: [25,10,5], completedFebruary: 5,
    internal: [25,15], internalMarch: 5, implementation: [25,15], implementationMarch: 25, testing: [20,20] },
  { rates: [40,45,35,30], actualRates: [40,47,29], external: [26,12,6], completedFebruary: 7,
    internal: [26,18], internalMarch: 7, implementation: [26,18], implementationMarch: 26, testing: [22,22] },
  { rates: [40,40,30,25], actualRates: [40,42,25], external: [22,10,4], completedFebruary: 4,
    internal: [22,14], internalMarch: 4, implementation: [22,14], implementationMarch: 24, testing: [18,18] },
  { rates: [45,40,35,30], actualRates: [45,43,29], external: [30,12,6], completedFebruary: 6,
    internal: [30,18], internalMarch: 8, implementation: [28,20], implementationMarch: 28, testing: [24,24] },
];
const sum = (numbers: readonly number[]) => numbers.reduce((total,value) => total + value,0);
export function evmAt(index: number) {
  const p = projects[index], total = sum(p.external), late = p.external[1] - p.completedFebruary;
  const plan = [[...p.external,0,0],[0,...p.internal,0,0],[0,0,...p.implementation,0],[0,0,0,...p.testing]];
  const complete = [[p.external[0],p.completedFebruary,p.external[2]+late],[0,p.internal[0],p.internalMarch],
    [0,0,p.implementationMarch]];
  const metrics = (month: number) => complete.slice(0,month).map((counts,stage) => {
    const actualCount = sum(counts.slice(0,month));
    return { pv: sum(plan[stage].slice(0,month)) * p.rates[stage], ac: actualCount * p.actualRates[stage], ev: actualCount * p.rates[stage] };
  });
  const feb = metrics(2), march = metrics(3);
  const april = (total - sum(complete[1])) * p.actualRates[1] + (total - sum(complete[2])) * p.actualRates[2];
  const marchActual = sum(march.map(({ac}) => ac));
  const prediction = marchActual + april + total * p.rates[3];
  const budget = sum(p.rates) * total;
  const cpi = (sum(march.map(({ev}) => ev)) / marchActual).toFixed(2);
  return { ...p,total,late,plan,complete,feb,march,april,prediction,budget,cpi };
}

export const marketTargets = [[true,false,false],[true,true,false],[false,true,true],[false,false,true]];
const revenues = [[20,10,10,10],[24,8,10,4],[8,16,20,4],[12,8,26,10]];
export function marketAt(index: number) {
  const sales = revenues[index];
  const gains = (a: number,b: number) => {
    let left = 0, right = 0;
    for (const [segment,targets] of marketTargets.entries()) {
      const [x,y] = [Boolean(targets[a]),Boolean(targets[b])];
      if (x) left += sales[segment] / (y ? 2 : 1);
      if (y) right += sales[segment] / (x ? 2 : 1);
    }
    return [left,right];
  };
  const matrix = [0,2].map(a => [0,1,3].map(b => gains(a,b)));
  const bestB = matrix[0].findIndex((_,b) => matrix.every(row => row.every(pair => pair[1] <= row[b][1])));
  const bestA = matrix[1][bestB][0] > matrix[0][bestB][0] ? 2 : 0;
  return { sales,matrix,bestA,bestB };
}

const combinationCases = [
  { n:5,k:3,selected:[2,4,5],example:[1,0,1,0,1],wrong:[[0,1,1,0,1],[1,0,0,1,1],[1,0,1,1,0],[1,1,0,0,1]] },
  { n:6,k:3,selected:[2,4,6],example:[0,1,1,0,1,0],wrong:[[0,1,0,1,1,0],[0,1,1,0,0,1],[1,0,0,1,1,0],[1,1,0,0,1,0]] },
  { n:6,k:4,selected:[1,3,4,6],example:[1,0,1,1,0,1],wrong:[[0,1,1,1,0,1],[1,0,1,0,1,1],[1,1,1,0,0,1],[1,0,1,1,1,0]] },
  { n:5,k:2,selected:[2,5],example:[0,1,1,0,0],wrong:[[0,1,0,1,0],[1,0,0,1,0],[0,0,1,1,0],[1,1,0,0,0]] },
];

export function nextCombination(bits: number[]) {
  const index = bits.findIndex((bit,i) => bit === 1 && bits[i+1] === 0);
  if (index < 0) return null;
  const prefixOnes = sum(bits.slice(0,index));
  const next = bits.slice();
  for (let i = 0; i < index; i++) next[i] = Number(i < prefixOnes);
  next[index] = 0;
  next[index+1] = 1;
  return next;
}

export function combinationAt(index: number) {
  const data = combinationCases[index];
  let combinations = 1;
  for (let i = 1; i <= data.k; i++) combinations = combinations * (data.n - i + 1) / i;
  return {
    ...data,combinations,
    next: nextCombination(data.example)!,
    last: Array.from({length:data.n},(_,i) => Number(i >= data.n - data.k)),
  };
}
