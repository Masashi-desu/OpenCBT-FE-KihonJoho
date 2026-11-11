export const digits = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
export const segments = ['上', '右上', '右下', '下', '左下', '左上', '中央', '小数点'];
export const hex = (value: number, width: number) => value.toString(16).toUpperCase().padStart(width, '0');
export const shape = (digit: number) => [...'abcdefgh'].reduce((bits, segment) => bits * 2 + Number(digits[digit].includes(segment)), 0);

const thermometerCases = [
  { demo: '82', digit: 5, interval: 60, ports: [1, 2, 3], temperature: 80, shapes: ['66', 'B6', 'BE', 'DA', 'F2'], bcd: ['0008', '0309', '0800', '0903', '0907'], binary: ['0008', '0027', '0050', '005D', '0061'] },
  { demo: '35', digit: 2, interval: 45, ports: [3, 1, 2], temperature: 62, shapes: ['B6', 'BE', 'DA', 'EE', 'F2'], bcd: ['0206', '0302', '0602', '0605', '0802'], binary: ['000E', '001A', '003E', '0041', '0052'] },
  { demo: '64', digit: 4, interval: 30, ports: [2, 3, 1], temperature: 73, shapes: ['60', '66', '76', 'B6', 'F2'], bcd: ['0307', '0503', '0703', '0706', '0903'], binary: ['000A', '0025', '0049', '004C', '005D'] },
  { demo: '79', digit: 9, interval: 90, ports: [2, 1, 3], temperature: 94, shapes: ['B6', 'BE', 'F2', 'F6', 'FE'], bcd: ['0409', '0704', '0903', '0904', '0908'], binary: ['000D', '0040', '0054', '005E', '0062'] },
];
export const thermometerCase = (index: number) => thermometerCases[index];

export const rawDatabaseRows = [
  ['受付番号', '受付日時', '利用者ID', '利用者名', '電話番号', 'メールアドレス', '質問'],
  ['回答日時', 'サポート員ID', 'サポート員名', '回答', '種別ID', '種別', '類似受付番号'],
];
export const normalizedTables = [
  { title: '利用者表', columns: ['利用者ID', '利用者名', '電話番号', 'メールアドレス'], keys: 1 },
  { title: 'サポート員表', columns: ['サポート員ID', 'サポート員名'], keys: 1 },
  { title: '種別表', columns: ['種別ID', '種別'], keys: 1 },
  { title: '類似表', columns: ['受付番号', '類似受付番号'], keys: 2 },
  { title: '対応表', columns: ['受付番号', '受付日時', '利用者ID', '質問', '回答日時', 'サポート員ID', '回答', '種別ID'], keys: 1 },
];

const databaseCases = [
  { company: 'F', examples: ['マニュアル不備', '使用法誤解'], topic: 'オプションの指定方法', keyword: 'オプション', category: '使用法誤解', model: 'A001', width: 4, whole: false, similarGroup: true },
  { company: 'G', examples: ['接続設定不備', '権限設定不備'], topic: '接続先の指定方法', keyword: '接続', category: '接続設定不備', model: 'N1402', width: 5, whole: false, similarGroup: false },
  { company: 'H', examples: ['帳票仕様不備', '操作手順誤解'], topic: '保存先の指定方法', keyword: '保存', category: '操作手順誤解', model: 'R20001', width: 6, whole: true, similarGroup: true },
  { company: 'J', examples: ['認証方式不明', '入力形式不明'], topic: '形式の指定方法', keyword: '形式', category: '入力形式不明', model: 'X708', width: 4, whole: true, similarGroup: false },
];
export const databaseCase = (index: number) => databaseCases[index];

const crcCases = [
  { accepted: 100, errorPercent: 20, counts: [100, 102, 120, 125], mask: '101', demo: '01000110', input: '00100110', received: '1001001101' },
  { accepted: 120, errorPercent: 25, counts: [120, 123, 150, 160], mask: '111', demo: '00111110', input: '01001011', received: '1010010010' },
  { accepted: 90, errorPercent: 10, counts: [90, 91, 99, 100], mask: '101', demo: '00111001', input: '01010011', received: '0110101100' },
  { accepted: 80, errorPercent: 20, counts: [80, 82, 96, 100], mask: '111', demo: '01001111', input: '00110001', received: '0011000100' },
];
export const crcCase = (index: number) => crcCases[index];
export function divideBits(value: string, mask: string) {
  const bits = [...value].map(Number), divisor = [...mask].map(Number);
  const rows = [{ value, position: -1, aligned: '' }];
  for (let position = 0; position <= bits.length - divisor.length; position++) {
    if (bits[position] === 0) continue;
    divisor.forEach((bit, offset) => { bits[position + offset] ^= bit; });
    rows.push({ value: bits.join(''), position, aligned: mask.padStart(position + mask.length, '0').padEnd(bits.length, '0') });
  }
  return { rows, remainder: bits.slice(1 - mask.length).join('') };
}

const authentications = [
  { target: '', client: 'C', auth: 'A', db: 'D', issuer: 'T', app: 'S', exchange: false, firstKey: false },
  { target: '在庫管理用の', client: 'C', auth: 'A', db: 'D', issuer: 'T', app: 'S', exchange: true, firstKey: false },
  { target: '勤怠管理用の', client: 'C', auth: 'A', db: 'D', issuer: 'T', app: 'S', exchange: false, firstKey: true },
  { target: '文書管理用の', client: 'C', auth: 'A', db: 'D', issuer: 'T', app: 'S', exchange: true, firstKey: true },
];
export const authenticationCase = (index: number) => authentications[index];
