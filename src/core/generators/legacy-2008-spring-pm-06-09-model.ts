/** Finite, reviewed inputs shared by the question and its code-owned figures. */
export const surveyCases = [
  { group: 1, limit: 2, events: ['工場見学', '健康チェック', 'ミニSL', '動物コーナー', 'PK合戦'], codes: ['FACTORY', 'HEALTH', 'MINI-SL', 'ANIMAL', 'PK'], counts: [265, 141, 238, 59, 97] },
  { group: 2, limit: 3, events: ['設備見学', '実験', '模型運転', '動物コーナー', '球技'], codes: ['PLANT', 'SCIENCE', 'MODEL', 'ANIMAL', 'SPORT'], counts: [151, 124, 97, 63, 108] },
  { group: 3, limit: 1, events: ['展示', '写真撮影', '模型運転', '手芸', '球技'], codes: ['EXHIBIT', 'PHOTO', 'MODEL', 'CRAFT', 'SPORT'], counts: [115, 67, 84, 100, 51] },
  { group: 4, limit: 2, events: ['工場見学', '講演', '工作', '動物コーナー', '球技'], codes: ['FACTORY', 'TALK', 'CRAFT', 'ANIMAL', 'SPORT'], counts: [94, 72, 131, 38, 120] },
] as const;
export function surveyDisplay(index: number): string {
  const { codes, counts, group } = surveyCases[index];
  return codes.map((name, i) => name.padEnd(8) + ': ' + String(counts[i] * group).padStart(4, '0')).join('\n');
}
export function surveyChanges(index: number): [string, string][] {
  return [
    ['行番号19と20の間に追加', '77  INV-CNT     PIC 9(4) VALUE ZERO.'],
    ['行番号40と41の間に追加', 'ELSE\n        ［c］'],
    ['［d］に追加', 'DISPLAY "INVALID DATA : " INV-CNT.'],
  ];
}

export const kettleCases = [
  { min: 1, first: 10, second: 0, message: 'No Water!' },
  { min: 3, first: 3, second: 2, message: 'Add Water!' },
  { min: 5, first: 9, second: 4, message: 'Water Too Low!' },
  { min: 8, first: 12, second: 1, message: 'Refill Pot!' },
] as const;
export const kettleOutput = (index: number) => 'Idle -> Heating\nHeating -> Idle\n' + kettleCases[index].message;
export const kettleEmpty = (index: number) => index === 0 ? '水がない場合' : '水量が' + kettleCases[index].min + '未満';
export const kettleHasWater = (index: number) => index === 0 ? '水がある場合' : '水量が' + kettleCases[index].min + '以上';

export const tokenCases = [
  { address: 100, terminal: '.', padding: 0, input: '  THIS 1234  AN9999.' },
  { address: 120, terminal: '!', padding: 1, input: ' C12  709 LAB!' },
  { address: 140, terminal: ':', padding: 2, input: '88  a7   ZX 1:' },
  { address: 168, terminal: ';', padding: 3, input: '  CODE 9  0a0;' },
] as const;
export function tokenExample(index: number): { characters: string[]; result: string[] } {
  const { input, address, padding } = tokenCases[index];
  const characters = [...input].map(character => character === ' ' ? '△' : character);
  const result: string[] = [];
  let end = 0;
  while (end < input.length - 1) {
    if (input[end] === ' ') { end++; continue; }
    const first = end;
    let hasLetter = false;
    do {
      if (input[end] < '0' || input[end] > '9') hasLetter = true;
      end++;
    } while (end < input.length - 1 && input[end] !== ' ');
    result.push(String(address + first), String(end - first), hasLetter ? '1' : '0', ...Array<string>(padding).fill('空欄'));
  }
  result.push('-1');
  return { characters, result };
}
