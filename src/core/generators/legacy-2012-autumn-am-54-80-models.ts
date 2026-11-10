// Point centres were read from the axes of the official p.34 raster to the nearest unit.
const sourcePlots = [
  [[-18,-8],[-15,-12],[-15,-4],[-13,-8],[-10,-5],[-9,2],[-8,-8],[-8,7],[-6,-1],[-5,5],[-5,10],[-2,5],[3,4],[3,7],[3,11],[4,-2],[5,9],[6,0],[7,-3],[9,-8],[9,3],[10,-5],[13,-4],[15,-8],[15,-4],[19,-10]],
  [[2,15],[2,20],[5,13],[5,18],[7,12],[7,16],[7,20],[10,13],[10,17],[11,9],[13,8],[13,11],[13,17],[16,7],[16,10],[16,13],[16,15],[18,5],[18,8],[20,13],[22,4],[22,6],[22,10],[24,7],[26,5],[27,2]],
  [[-18,-1],[-16,-7],[-14,-10],[-14,5],[-9,10],[-8,-11],[-7,-2],[-7,5],[-4,-13],[-4,-5],[-4,12],[-3,5],[3,-2],[3,2],[4,-11],[4,12],[7,0],[7,7],[9,-5],[11,9],[13,-8],[13,-2],[13,3],[16,-4],[18,2],[18,6]],
  [[-26,-21],[-25,-17],[-24,-19],[-22,-15],[-21,-11],[-20,-21],[-20,-18],[-20,-8],[-19,-12],[-18,-16],[-18,-10],[-17,-7],[-16,-14],[-15,-16],[-14,-10],[-13,-12],[-13,-7],[-12,-4],[-10,-12],[-10,-8],[-8,-10],[-7,-6],[-6,-2],[-4,-7],[-4,-3],[-2,-4]],
] as const;

export const backupIntervals = [
  { interval: '2倍', inverse: '半分' },
  { interval: '3倍', inverse: '3分の1' },
  { interval: '半分', inverse: '2倍' },
  { interval: '3分の1', inverse: '3倍' },
] as const;

export const investments = [100, 200, 300, 400] as const;
export const profitSeries = [
  [[15, 30, 45, 30, 15], [105, 75, 45, 15, 0], [60, 75, 90, 75, 60], [105, 105, 105, 105, 105]],
  [[15, 25, 45, 25, 15], [110, 80, 55, 20, 5], [60, 80, 80, 80, 60], [100, 100, 100, 100, 100]],
  [[15, 25, 40, 25, 15], [105, 75, 50, 15, 5], [65, 85, 105, 85, 65], [100, 100, 100, 100, 100]],
  [[10, 25, 40, 25, 10], [105, 75, 45, 15, 0], [70, 75, 85, 75, 70], [108, 108, 108, 108, 108]],
] as const;

export const quantities = [4, 5, 6, 7] as const;
export const demandCases = [
  { probabilities: [30, 30, 30, 10], margin: 1000, waste: 300 },
  { probabilities: [80, 10, 5, 5], margin: 1000, waste: 400 },
  { probabilities: [40, 40, 10, 10], margin: 900, waste: 300 },
  { probabilities: [10, 10, 20, 60], margin: 1000, waste: 400 },
] as const;

export function sellingProbabilities(index: number) {
  const { probabilities } = demandCases[index];
  return quantities.map((_, stock) => quantities.map((__, sold) => sold < stock
    ? probabilities[sold] : sold === stock ? probabilities.slice(sold).reduce<number>((sum, value) => sum + value, 0) : null));
}

export const scatterCases = [
  { relationship: '負', direction: 1, xShift: 0, yShift: 0, axes: null },
  { relationship: '正', direction: 1, xShift: -2, yShift: 1,
    axes: ['来客数の前年差（十人）', '売上高の前年差（万円）'] },
  { relationship: '負', direction: -1, xShift: -1, yShift: 0,
    axes: ['気温の平年差（0.1℃）', '暖房電力使用量の平年差（kWh）'] },
  { relationship: '正', direction: -1, xShift: 0, yShift: 2,
    axes: ['注文数の前月差（件）', '梱包数の前月差（箱）'] },
] as const;

export function scatterPoints(index: number, panel: number): readonly (readonly [number, number])[] {
  const { direction, xShift, yShift } = scatterCases[index];
  return sourcePlots[panel].map(([x, y]) => [x + xShift, y * direction + yShift]);
}

export function scatterDescription(index: number, panel: number): string {
  const pairs = scatterPoints(index, panel).map(([x, y]) => `(${x},${y})`).join('、');
  const { axes } = scatterCases[index];
  const labels = axes ? `横軸は${axes[0]}，縦軸は${axes[1]}。` : '';
  return labels + '横軸と縦軸は0で交差し，主目盛は−20，−10，0，10，20。点の座標（横，縦）：' + pairs + '。';
}
