type Point = readonly [number, number];
type Mesh = { x: number; y: number; id: number };
type SchoolCase = { base: number; schools: readonly Point[]; sample: Point; capacities: readonly number[] };
export const schoolCases: readonly SchoolCase[] = [
  { base: 100, schools: [[6.327, 7.765], [3.292, 4.088], [3.002, 1.621]], sample: [5.527, 5.412], capacities: [1200, 950, 600, 1000] },
  { base: 80, schools: [[7.63, 7.31], [2.19, 5.82], [2.38, 1.77]], sample: [4.562, 5.422], capacities: [850, 750, 725, 1225] },
  { base: 60, schools: [[6.77, 7.31], [3.81, 4.23], [2.08, 1.56]], sample: [3.462, 3.328], capacities: [825, 675, 800, 1225] },
  { base: 90, schools: [[7.62, 8.14], [2.17, 3.23], [8.37, 1.32]], sample: [6.159, 6.072], capacities: [900, 775, 750, 1275] },
];
export const schools = ['A小学校', 'B小学校', 'C小学校', '新設小学校'];

const range = (first: number, last: number) => Array.from({ length: last - first + 1 }, (_, i) => first + i);
const meshRows = [
  [8, 9], [1, 2, 3, 4, 8, 9], [0, 1, 2, 3, 4, 7, 8, 9], range(0, 9), range(0, 9),
  range(0, 8), range(0, 9), range(2, 9), range(6, 9), range(7, 9),
];
const rowLabelXs = [
  [8, 9], [1, 2, 3, 4, 8, 9], [0, 1, 4, 7, 8, 9], [0, 4, 5, 6, 7, 9], [0, 8, 9],
  [0, 8], [0, 1, 2, 8, 9], [2, 3, 4, 5, 6, 9], [6, 7, 9], [7, 8, 9],
];

export function schoolMesh(base: number) {
  return meshRows.flatMap((row, y) => row.map(x => ({ x, y, id: x + base * y, label: rowLabelXs[y].includes(x) })));
}

function pupils(mesh: Mesh, index: number) {
  const { x, y } = mesh;
  return {
    ...mesh,
    count: 17 + (x * 11 + y * 17 + index * 13) % 52,
    attending: (x * 7 + y * 13 + index) % 3,
    site: (x * 3 + y * 5 + index) % 5 !== 1,
  };
}
const originalPupilSamples = [
  { x: 8, y: 0, count: 17, attending: 1, site: true }, { x: 9, y: 0, count: 9, attending: 1, site: true },
  { x: 1, y: 1, count: 41, attending: 2, site: true }, { x: 2, y: 1, count: 67, attending: 2, site: true },
  { x: 3, y: 1, count: 63, attending: undefined, site: true }, { x: 4, y: 1, count: 15, attending: undefined, site: false },
  { x: 9, y: 9, count: 41, attending: 0, site: false },
];
const distance = (mesh: Mesh, [x, y]: Point) => Math.hypot(mesh.x + .5 - x, mesh.y + .5 - y);
const schoolId = ([x, y]: Point, base: number) => Math.floor(x) + base * Math.floor(y);
const sampleRows = [0, 1, 2, 3, 69];
const pupilSampleRows = [0, 1, 2, 3, 4, 5, 69];
const ellipsis = (size: number) => Array<string>(size).fill('⋮');

export function pupilSheet(index: number): string[][] {
  const { base } = schoolCases[index];
  const points = schoolMesh(base);
  const rows = pupilSampleRows.map((row, sampleIndex) => {
    const mesh = points[row];
    const { count, site } = index ? pupils(mesh, index) : originalPupilSamples[sampleIndex];
    return [String(row + 2), String(mesh.id), (mesh.x + .5).toFixed(1), (mesh.y + .5).toFixed(1), String(count), site ? '*' : ''];
  });
  return [
    ['', 'A', 'B', 'C', 'D', 'E'], ['1', 'ID', 'x', 'y', '児童数（人）', '設置可能'],
    ...rows.slice(0, -1), ellipsis(6), rows.at(-1)!,
  ];
}

export function placementSheet(index: number): string[][] {
  const { base, schools: old, sample, capacities } = schoolCases[index];
  const positions = [...old, sample];
  const ids = positions.map(point => schoolId(point, base));
  const mesh = schoolMesh(base);
  const totals = [0, 0, 0, 0];
  const projected = mesh.map(entry => {
    const pupil = pupils(entry, index);
    const distances = positions.map(position => distance(entry, position));
    const target = distances[3] < distances[pupil.attending] ? 3 : pupil.attending;
    totals[target] += pupil.count;
    return { pupil, distances, target };
  });
  const assigned = index ? totals : [753, 986, 506, 1096];
  const ratios = assigned.map((count, i) => {
    const capacity = capacities[i];
    const thousandths = Math.floor((2 * count * 1000 + capacity) / (2 * capacity));
    return Math.floor(thousandths / 1000) + '.' + String(thousandths % 1000).padStart(3, '0');
  });
  const flags = index ? assigned.map((count, i) => count > capacities[i] ||
      (i === 3 && (!projected.find(row => row.pupil.id === ids[3])?.pupil.site || ids.slice(0, 3).includes(ids[3]))) ? '×' : '')
    : ['', '×', '', '×'];
  const rows = sampleRows.map((row, sampleIndex) => {
    const entry = projected[row];
    const original = originalPupilSamples[sampleIndex === 4 ? 6 : sampleIndex];
    const attending = index ? entry.pupil.attending : original.attending!;
    const target = entry.distances[3] < entry.distances[attending] ? 3 : attending;
    return [String(row + 12), String(entry.pupil.id), ...entry.distances.map(value => value.toFixed(3)), schools[attending], schools[target]];
  });
  return [
    ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
    ['1', '小学校名', ...schools, '全体', ''],
    ['2', 'x', ...positions.map(point => point[0].toFixed(3)), '', ''],
    ['3', 'y', ...positions.map(point => point[1].toFixed(3)), '', ''],
    ['4', 'メッシュのID', ...ids.map(String), '', ''],
    ['5', '対象児童数', ...assigned.map(String), '', ''],
    ['6', '定員', ...capacities.map(String), '', ''],
    ['7', '充足率', ...ratios, '', ''],
    ['8', '', '', '', '', '', '', ''],
    ['9', '制約条件', ...flags, flags.includes('×') ? '×' : '', ''],
    ['10', '', '', '', '', '', '', ''],
    ['11', 'ID', ...schools.map(name => name + '\nまでの距離'), '現通学小学校', '新通学小学校'],
    ...rows.slice(0, -1), ellipsis(8), rows.at(-1)!,
  ];
}
