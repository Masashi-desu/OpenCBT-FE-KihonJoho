export const gateChoices = [
  { first: ['NOT', 'NOT'], combine: 'AND', last: '' },
  { first: ['NOT', 'NOT'], combine: 'OR', last: '' },
  { first: ['NOT', 'NOT'], combine: 'XOR', last: '' },
  { first: ['', ''], combine: 'XOR', last: 'NOT' },
] as const;

export const gateCases = [
  { first: 'NAND', second: 'NOR', halfBlank: 'Z' },
  { first: 'NOR', second: 'XOR', halfBlank: 'C' },
  { first: 'XOR', second: 'XNOR', halfBlank: 'Z' },
  { first: 'XNOR', second: 'NAND', halfBlank: 'C' },
] as const;

const ellipsis = (length: number) => Array<string>(length).fill('⋮');
export const baseballCases = [
  { teams: 8, batting: 'ホームラン', battingCode: '003', runs: [2, 5, 2] },
  { teams: 6, batting: 'ヒット', battingCode: '002', runs: [4, 6, 1] },
  { teams: 10, batting: '三振', battingCode: '001', runs: [1, 7, 3] },
  { teams: 12, batting: 'ホームラン', battingCode: '003', runs: [3, 4, 5] },
] as const;
export const baseballTables = {
  team: { title: 'チーム表', columns: ['チーム番号', 'チーム名', '代表者氏名', '代表者住所', '代表者電話番号'], keys: [0] },
  player: { title: '選手表', columns: ['選手番号', '氏名', '住所', '電話番号', 'チーム番号', '登録日', '抹消日'], keys: [0] },
  schedule: { title: '日程表', columns: ['試合番号', '試合日', '対戦チーム1', '対戦チーム2'], keys: [0] },
  result: { title: '結果表', columns: ['試合番号', 'チーム番号', '得点', '勝点', '勝利投手', '敗戦投手'], keys: [0, 1] },
  plate: { title: '打席表', columns: ['試合番号', '打席番号 注1', '回数', '表裏 注2', '打者', '投手', '打撃結果', '打点'], keys: [0, 1] },
  batting: { title: '打撃表', columns: ['打撃結果', '名称'], keys: [0] },
  membership: { title: '所属選手表', columns: ['チーム番号', '選手番号', '登録日', '抹消日'], keys: [0, 1] },
  revised: { title: '選手表', columns: ['選手番号', '氏名', '住所', '電話番号', '登録日', '抹消日'], keys: [0] },
} as const;

export type BaseballTable = keyof typeof baseballTables;
export const baseballTableKeys = Object.keys(baseballTables) as BaseballTable[];

export function baseballRows(table: BaseballTable, index: number): string[][] {
  const [a, b, tie] = baseballCases[index].runs;
  switch (table) {
    case 'team': return [['01', '巣鴨キッズ', '情報太郎', '東京都豊島区○○○2-28', '03-1111-2222'], ellipsis(5)];
    case 'player': return [['0001', '巣鴨一郎', '東京都豊島区□□1-2', '03-8888-9999', '01', '20080401', 'null'], ellipsis(7)];
    case 'schedule': return [['001', '20130413', '01', '02'], ['002', '20130414', '03', '04'], ellipsis(4)];
    case 'result': return [
      ['001', '01', String(a), '0', 'null', '0038'], ['001', '02', String(b), '3', '0021', 'null'],
      ['002', '03', String(tie), '1', 'null', 'null'], ['002', '04', String(tie), '1', 'null', 'null'], ellipsis(6),
    ];
    case 'plate': return [
      ['001', '001', '01', '1', '0002', '0021', '002', '0'], ['001', '002', '01', '1', '0004', '0021', '003', '2'],
      ellipsis(8), ['001', '008', '01', '2', '0075', '0038', '002', '1'], ellipsis(8),
    ];
    case 'batting': return [['001', '三振'], ['002', 'ヒット'], ['003', 'ホームラン'], ellipsis(2)];
    case 'membership': return [['01', '0001', '20080401', '20100831'], ellipsis(4), ['03', '0001', '20100901', 'null']];
    case 'revised': return [['0001', '巣鴨一郎', '東京都豊島区□□1-2', '03-8888-9999', '20080401', 'null'], ellipsis(6)];
  }
}

export const ipv6Cases = [
  { population: 70, v4: [203, 0, 113, 128], d: ['2', '1'], e: 'cd30', f: '1' },
  { population: 50, v4: [192, 0, 2, 33], d: ['4', '3'], e: 'be20', f: '7' },
  { population: 80, v4: [198, 51, 100, 17], d: ['6', '5'], e: 'ef40', f: 'a' },
  { population: 90, v4: [203, 0, 113, 90], d: ['8', '9'], e: 'ab60', f: 'b' },
] as const;

export const vpnCases = [
  { sender: 'M', receiver: 'N', prime: 11, x: 7, y: 5 },
  { sender: 'N', receiver: 'M', prime: 11, x: 7, y: 3 },
  { sender: 'M', receiver: 'N', prime: 11, x: 6, y: 4 },
  { sender: 'N', receiver: 'M', prime: 11, x: 9, y: 3 },
] as const;
