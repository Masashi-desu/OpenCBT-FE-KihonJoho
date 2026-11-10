export const adcCases = [
  { samples: [8, 34, 33, 17, 32, 69, 64, 48, 32, 28, 53], fsrV: 9, analog: '7.49…', readingHundredths: 749,
    cd: ['0.5625', '0.6', '1.2', '2.25', '5.5', '7.0', '7.2', '7.5', '7.8', '8.0'],
    fsrMv: 1022, periodMs: 50, durationS: 5, bitLimit: 1000, f: ['0.1', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0'] },
  { samples: [7, 34, 30, 17, 29, 69, 57, 47, 30, 26, 44], fsrV: 12, analog: '8.74…', readingHundredths: 874,
    cd: ['0.75', '0.8', '1.6', '3.0', '6.5', '8.0', '8.8', '9.0', '9.6', '10.4'],
    fsrMv: 2047, periodMs: 40, durationS: 4, bitLimit: 1200, f: ['0.1', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0'] },
  { samples: [8, 31, 27, 18, 31, 69, 66, 48, 31, 29, 56], fsrV: 15, analog: '12.55…', readingHundredths: 1255,
    cd: ['0.9375', '1.0', '2.0', '3.75', '7.5', '11.0', '12.0', '12.5', '13.0', '14.0'],
    fsrMv: 381, periodMs: 60, durationS: 6, bitLimit: 800, f: ['0.1', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0'] },
  { samples: [8, 32, 30, 19, 32, 68, 61, 46, 28, 24, 35], fsrV: 18, analog: '11.52…', readingHundredths: 1152,
    cd: ['1.125', '1.2', '2.4', '4.5', '6.0', '10.8', '11.5', '12.0', '12.6', '13.2'],
    fsrMv: 1020, periodMs: 50, durationS: 6, bitLimit: 1080, f: ['0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '4.0'] },
] as const;
export const binaryWord = (value: number, width: number) => value.toString(2).padStart(width, '0');
export function adcModel(index: number) {
  const input = adcCases[index], levels = input.samples.map(value => Math.floor((value + 5) / 10));
  const step = input.fsrV / 15, number = Math.floor((input.readingHundredths + step * 50) / (step * 100));
  const sampleCount = input.durationS * 1000 / input.periodMs + 1;
  const bits = Math.floor(input.bitLimit / sampleCount), minStep = input.fsrMv / (2 ** bits - 1);
  const codeRow = levels.map((value, i) => i < 4 ? binaryWord(value, 3) : i === 6 ? '［a］' : i === 10 ? '［b］' : '');
  return { ...input, levels, step, number, sampleCount, bits, minStep, codeRow };
}

export const organizationCases = [
  { company: 'C社', departments: ['総務部', '営業部', '開発部'], sections: [['人事課', '経理課'], ['海外課', '国内課'], ['企画課', '開発課']],
    employee: ['2005012', '情報太郎', '211', '20020401', '東京都…', '03-123…', '31'],
    firstDepartment: 'D001', firstSection: 'S001', searchSection: 'S101', begin: '20110701', end: '20110930',
    aggregate: 'AVG', aggregateText: '平均年齢' },
  { company: 'G社', departments: ['管理部', '販売部', '制作部'], sections: [['総務課', '会計課'], ['法人課', '店舗課'], ['編集課', '制作課']],
    employee: ['2006014', '学習花子', '224', '20030401', '大阪府…', '06-234…', '32'],
    firstDepartment: 'D011', firstSection: 'S011', searchSection: 'S111', begin: '20110801', end: '20111031',
    aggregate: 'MIN', aggregateText: '最も低い年齢' },
  { company: 'H社', departments: ['庶務部', '調達部', '技術部'], sections: [['人事課', '財務課'], ['資材課', '設備課'], ['設計課', '評価課']],
    employee: ['2004013', '試験次郎', '315', '20010401', '愛知県…', '052-34…', '34'],
    firstDepartment: 'D021', firstSection: 'S021', searchSection: 'S121', begin: '20110501', end: '20110731',
    aggregate: 'MAX', aggregateText: '最高年齢' },
  { company: 'J社', departments: ['事務部', '営業部', '保守部'], sections: [['庶務課', '経理課'], ['法人課', '地域課'], ['点検課', '運用課']],
    employee: ['2007016', '演習美咲', '238', '20050401', '福岡県…', '092-45…', '29'],
    firstDepartment: 'D031', firstSection: 'S031', searchSection: 'S131', begin: '20110901', end: '20111130',
    aggregate: 'AVG', aggregateText: '平均年齢' },
] as const;
export const japaneseDate = (value: string) => Number(value.slice(0, 4)) + '年' + Number(value.slice(4, 6)) + '月' + Number(value.slice(6)) + '日';

export function organizationRelations(index: number, group: number) {
  const data = organizationCases[index];
  const employeeColumns = ['従業員番号', '氏名', ['部コード', '部署コード', '課コード'][group], '内線', '入社年月日', '住所', '自宅電話', '年齢'];
  const employee = [...data.employee.slice(0, 2), group === 1 ? data.firstDepartment : data.firstSection, ...data.employee.slice(2)];
  if (group === 0) return [
    { name: '部表', columns: ['部コード', '部名'], row: [] },
    { name: '従業員表', columns: employeeColumns, row: [] },
  ];
  if (group === 1) return [
    { name: '部署表', columns: ['部署コード', '部署名'], row: [data.firstDepartment, data.departments[0] + data.sections[0][0]] },
    { name: '従業員表', columns: employeeColumns, row: employee },
  ];
  if (group === 2) return [
    { name: '部表', columns: ['部コード', '部名'], row: [data.firstDepartment, data.departments[0]] },
    { name: '課表', columns: ['課コード', '課名', '部コード'], row: [data.firstSection, data.sections[0][0], data.firstDepartment] },
    { name: '従業員表', columns: employeeColumns, row: employee },
  ];
  return [{ name: '受注表', columns: ['伝票番号', '受注日', '従業員番号', '顧客コード', '受注額', '納品日'], row: [] }];
}

const networkingCases = [
  { prefix: '10.0', backbone: 0, a: 1, b: 2, routerA: 1, routerB: 1, server1: 200,
    candidates: [[0, 2], [0, 3], [0, 4], [1, 1], [1, 2], [1, 3], [2, 1], [2, 2], [2, 3], [2, 4]], hit: 30, miss: 110 },
  { prefix: '10.1', backbone: 20, a: 21, b: 21, routerA: 1, routerB: 129, server1: 90,
    candidates: [[20, 2], [20, 3], [21, 1], [21, 2], [21, 3], [21, 4], [21, 90], [21, 127], [21, 129], [21, 132]], hit: 20, miss: 120 },
  { prefix: '172.16', backbone: 6, a: 7, b: 8, routerA: 7, routerB: 1, server1: 180,
    candidates: [[6, 2], [6, 3], [7, 0], [7, 1], [7, 7], [7, 180], [7, 200], [7, 254], [7, 255], [8, 1]], hit: 15, miss: 115 },
  { prefix: '192.168', backbone: 31, a: 32, b: 32, routerA: 129, routerB: 1, server1: 230,
    candidates: [[31, 2], [31, 3], [32, 1], [32, 127], [32, 128], [32, 129], [32, 130], [32, 230], [32, 240], [32, 255]], hit: 30, miss: 130 },
] as const;
export const masks = ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.128'] as const;
const uint = (address: string) => address.split('.').reduce((value, octet) => (value << 8) | Number(octet), 0) >>> 0;
export function networkModel(index: number) {
  const data = networkingCases[index];
  const ip = (octet: number, host: number) => data.prefix + '.' + octet + '.' + host;
  const ports = [ip(data.backbone, 2), ip(data.backbone, 3), ip(data.a, data.routerA), ip(data.b, data.routerB), ip(data.a, data.server1)];
  const subnetIndex = masks.findIndex(text => {
    const mask = uint(text), ranges = ports.map(address => uint(address) & mask);
    return ranges[0] === ranges[1] && ranges[2] === ranges[4] && new Set([ranges[0], ranges[2], ranges[3]]).size === 3;
  });
  const mask = uint(masks[subnetIndex]), network = (uint(ports[2]) & mask) >>> 0, broadcast = (network | ~mask) >>> 0;
  const candidates = data.candidates.map(([octet, host]) => ip(octet, host));
  const usable = candidates.filter(address => !ports.includes(address) && uint(address) > network && uint(address) < broadcast);
  const threshold = (data.miss - 50) * 100 / (data.miss - data.hit);
  return { ...data, ports, subnetIndex, candidates, usable, threshold };
}

export const riskNames = ['ウイルス感染', '不正アクセス', '故障', 'なりすまし', '盗聴'];
export const vulnerabilities = ['ウイルス対策ソフト未導入', 'アクセスコントロールの不備', 'メンテナンス不足', 'パスワード管理の不備', '最新推奨暗号の未使用'];
export const riskClasses = ['機密性', '完全性', '可用性'];
const riskCases = [
  { xC: 2, xI: 2, yC: 3, yI: 3, stop: '4時間', stopMinutes: 240,
    ratings: [[3, 3], [3, 2], [2, 3], [2, 2], [2, 1]], acceptable: [13, 15, 10] },
  { xC: 2, xI: 2, yC: 2, yI: 2, stop: '30分', stopMinutes: 30,
    ratings: [[2, 2], [2, 2], [2, 3], [3, 3], [2, 1]], acceptable: [13, 15, 10] },
  { xC: 3, xI: 2, yC: 4, yI: 2, stop: '12時間', stopMinutes: 720,
    ratings: [[3, 3], [3, 1], [2, 3], [2, 3], [2, 1]], acceptable: [13, 12, 10] },
  { xC: 4, xI: 1, yC: 3, yI: 1, stop: '10分', stopMinutes: 10,
    ratings: [[2, 3], [3, 2], [2, 3], [3, 3], [2, 1]], acceptable: [13, 6, 10] },
] as const;
export function riskModel(index: number) {
  const data = riskCases[index], factors = data.ratings.map(([threat, vulnerability]) => threat * vulnerability);
  const integrity = [0, 1, 3].map(item => factors[item] * data.xI);
  const riskValues = [data.xC * factors[3], data.yC * factors[1], data.yI * factors[0]];
  const availability = [1440, 300, 60, 10, 1].findIndex(minutes => minutes < data.stopMinutes) + 1;
  const mitigation = integrity.findIndex(value => value > data.acceptable[1]) === 0 ? 1 : 4;
  return { ...data, integrity, riskValues, availability, mitigation };
}
