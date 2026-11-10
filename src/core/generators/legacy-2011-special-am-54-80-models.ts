export const demandCases = [
  { noDemandPrice: 3000, observedPrice: 1000, observedDemand: 60000, targetPrice: 1500, firstChoice: 30000 },
  { noDemandPrice: 3200, observedPrice: 1200, observedDemand: 60000, targetPrice: 1700, firstChoice: 35000 },
  { noDemandPrice: 2400, observedPrice: 1400, observedDemand: 50000, targetPrice: 1800, firstChoice: 30000 },
  { noDemandPrice: 3400, observedPrice: 1400, observedDemand: 40000, targetPrice: 1900, firstChoice: 25000 },
] as const;

export const capacityCases = [
  { target: 1000, durationTenths: [4, 3, 7, 12], machines: [3, 2, 4, 7], hours: [150, 160, 170, 180] },
  { target: 900, durationTenths: [5, 3, 7, 12], machines: [3, 2, 4, 7], hours: [140, 150, 170, 170] },
  { target: 1100, durationTenths: [4, 3, 6, 11], machines: [3, 2, 4, 7], hours: [160, 160, 170, 180] },
  { target: 1200, durationTenths: [4, 3, 6, 11], machines: [3, 2, 4, 7], hours: [170, 190, 185, 180] },
] as const;

export const inspectionCases = [
  { defectTenths: 1, costs: [[0, 1500], [40, 1000], [80, 500], [120, 200]] },
  { defectTenths: 1, costs: [[0, 1200], [50, 900], [90, 480], [130, 220]] },
  { defectTenths: 1, costs: [[0, 1600], [40, 800], [80, 500], [120, 220]] },
  { defectTenths: 2, costs: [[0, 1400], [40, 900], [80, 550], [120, 200]] },
] as const;

const movementDates = [1, 4, 5, 7, 10, 30] as const;
const movementLabels = ['前月繰越', '仕入', '売上', '仕入', '仕入', '売上'] as const;
const inventoryCases = [
  { units: [10, 40, -30, 30, 10, -30], prices: [100, 120, null, 130, 110, null] },
  { units: [20, 30, -30, 30, 10, -30], prices: [150, 140, null, 110, 120, null] },
  { units: [10, 30, -20, 40, 10, -40], prices: [100, 140, null, 120, 110, null] },
  { units: [10, 40, -30, 20, 20, -30], prices: [140, 100, null, 110, 130, null] },
] as const;
export function inventoryMovements(index: number) {
  const { units, prices } = inventoryCases[index];
  return movementDates.map((day, i) => ({ day, label: movementLabels[i], units: units[i], price: prices[i] }));
}

type Point = readonly [number, number];
export const tariffKinds = ['逓減課金', '逓増課金', '上限額を設定した従量課金', '一定の単価による従量課金'] as const;
const tariffCurves = {
  falling: [[0, 88], [16, 50], [45, 31], [91, 22]],
  capped: [[0, 0], [51, 69], [96, 69]],
  diminishing: [[0, 0], [18, 39], [45, 69], [89, 81]],
  growing: [[0, 0], [34, 12], [66, 36], [95, 89]],
  proportional: [[0, 0], [91, 78]],
} as const satisfies Record<string, readonly Point[]>;
export function tariffFigures(index: number) {
  return [
    index === 3 ? tariffCurves.proportional : tariffCurves.falling,
    tariffCurves.capped,
    tariffCurves.diminishing,
    tariffCurves.growing,
  ];
}

export const matrixTargets = ['b', 'a', 'd', 'c'] as const;
export const matrixCells = [
  { label: 'a', highGrowth: true, highShare: false },
  { label: 'b', highGrowth: true, highShare: true },
  { label: 'c', highGrowth: false, highShare: false },
  { label: 'd', highGrowth: false, highShare: true },
] as const;

type OrgNode = { id: string; label: string; x: number; y: number };
type OrgLayout = {
  nodes: readonly OrgNode[];
  links: readonly (readonly [from: string, to: string])[];
};
const node = (id: string, label: string, x: number, y: number): OrgNode => ({ id, label, x, y });
const manager = node('leader', '経営者', 330, 30);
const levels = (parent: string, children: readonly OrgNode[]) =>
  children.map(child => [parent, child.id] as const);

const departments = [
  node('production', '生産', 76, 116), node('sales', '販売', 203, 116),
  node('research', '研究開発', 330, 116), node('accounting', '経理', 457, 116), node('hr', '人事', 584, 116),
];
const products = [node('domestic', '家電事業', 171, 102), node('industrial', '産業機器事業', 489, 102)];
const domesticRoles = [node('domestic-make', '生産', 70, 180), node('domestic-sales', '販売', 171, 180), node('domestic-admin', '経理', 272, 180)];
const industrialRoles = [node('industrial-make', '生産', 388, 180), node('industrial-sales', '販売', 489, 180), node('industrial-admin', '経理', 590, 180)];
const initiatives = [node('renewal', '刷新責任者', 180, 102), node('moving', '移転責任者', 480, 102)];
const renewalRoles = [node('renewal-dev', '開発担当', 65, 180), node('renewal-ops', '運用担当', 180, 180), node('renewal-support', '営業担当', 295, 180)];
const movingRoles = [node('moving-ops', '運用担当', 390, 180), node('moving-assets', '設備担当', 480, 180), node('moving-support', '総務担当', 580, 180)];
const dualManagers = [node('dept', '開発部門長', 175, 102), node('delivery', '刷新責任者', 485, 102)];
const dualRoles = [node('design', '設計担当', 225, 185), node('test', 'テスト担当', 435, 185)];

export const organizationCases = [
  { nodes: [manager, ...departments], links: levels('leader', departments) },
  { nodes: [manager, ...products, ...domesticRoles, ...industrialRoles],
    links: [...levels('leader', products), ...levels('domestic', domesticRoles), ...levels('industrial', industrialRoles)] },
  { nodes: [manager, ...initiatives, ...renewalRoles, ...movingRoles],
    links: [...levels('leader', initiatives), ...levels('renewal', renewalRoles), ...levels('moving', movingRoles)] },
  { nodes: [manager, ...dualManagers, ...dualRoles],
    links: [...levels('leader', dualManagers), ...levels('dept', dualRoles), ...levels('delivery', dualRoles)] },
] as const satisfies readonly OrgLayout[];
