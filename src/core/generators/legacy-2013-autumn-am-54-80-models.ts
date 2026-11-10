export const autumn2013AmScreenEffort = [[4, 6, 8], [6, 9, 10], [8, 10, 12]] as const; // tenths of a person-day
export const autumn2013AmEffortCases = [
  { counts: [30, 40, 20, 10], review: 5, managementPercent: 20 },
  { counts: [40, 30, 20, 10], review: 5, managementPercent: 20 },
  { counts: [20, 50, 20, 10], review: 5, managementPercent: 40 },
  { counts: [50, 20, 20, 10], review: 10, managementPercent: 30 },
] as const;

export const autumn2013AmChargeLines = [
  [[0, 5], [1, 2.9], [3, 1.7], [6, 1.25]],
  [[0, 0], [3, 4], [6, 4]],
  [[0, 0], [1, 2.2], [3, 4], [6, 4.8]],
  [[0, 0], [2, 0.7], [4, 2.2], [6, 5.1]],
] as const;

export const autumn2013AmProductionCases = [
  { availableA: 100, availableB: 80, profitX: 100, profitY: 150 },
  { availableA: 120, availableB: 90, profitX: 100, profitY: 160 },
  { availableA: 160, availableB: 110, profitX: 100, profitY: 160 },
  { availableA: 90, availableB: 60, profitX: 120, profitY: 150 },
] as const;

export const autumn2013AmFishbone = [
  { head: 'a', branch: 'b' },
  { head: 'b', branch: 'a' },
  { head: 'a', branch: 'b' },
] as const;

export const autumn2013AmReceiptCount = 9;
export function autumn2013AmReceiptRows(index: number) {
  const scale = 1 + Math.floor(index / 3), add = 5 * (index % 3);
  return [
    { date: '1日', action: '前月繰越', received: 100 * scale, issued: null, price: 200 + add },
    { date: '5日', action: '仕入', received: 50 * scale, issued: null, price: 215 + add },
    { date: '15日', action: '売上', received: null, issued: 70 * scale, price: null },
    { date: '20日', action: '仕入', received: 100 * scale, issued: null, price: 223 + add },
    { date: '25日', action: '売上', received: null, issued: 60 * scale, price: null },
    { date: '30日', action: '翌月繰越', received: null, issued: 120 * scale, price: null },
  ] as const;
}
