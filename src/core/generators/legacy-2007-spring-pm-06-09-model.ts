export const boardCases = [
  { players: 4, move: [[3,9],[5,0],[7,0],[8,2],[19,0],[21,6]], rest: [9,15], figures: [2,9,6] },
  { players: 3, move: [[3,8],[5,0],[7,0],[8,4],[19,0],[21,6]], rest: [9,14], figures: [2,9,6] },
  { players: 5, move: [[3,9],[5,0],[7,0],[8,4],[19,0],[21,1]], rest: [9,15], figures: [2,9,6] },
  { players: 6, move: [[3,7],[5,0],[7,0],[8,2],[19,0],[21,6]], rest: [9,16], figures: [2,9,6] },
] as const;
export const boardGoal = 23;
export const shownSquares = [0,1,2,3,4,5,6,7,8,9,21,22,23] as const;
export function boardInstruction(index: number, cell: number): string {
  const { move, rest } = boardCases[index];
  const target = move.find(([from]) => from === cell)?.[1];
  return target === 0 ? 'ふりだしへ' : target !== undefined ? target + 'へ飛ぶ' :
    rest.some(item => item === cell) ? '1回休み' : '';
}

export type Votes = readonly [district: string, candidate: string, votes: number][];
const rawVotes: readonly Votes[] = [
  [['AAAAAA','WWWWWW',1000],['AAAAAA','XXXXXX',2000],['CCCCCC','XXXXXX',3000],
    ['CCCCCC','ZZZZZZ',4000],['EEEEEE','VVVVVV',3000],['EEEEEE','WWWWWW',5000]],
  [['AAAAAA','UUUUUU',1000],['BBBBBB','UUUUUU',2000],['CCCCCC','UUUUUU',3000],
    ['DDDDDD','UUUUUU',4000],['EEEEEE','UUUUUU',5000],['FFFFFF','UUUUUU',3000]],
  [['BBBBBB','UUUUUU',1000],['BBBBBB','VVVVVV',2000],['BBBBBB','WWWWWW',3000],
    ['BBBBBB','XXXXXX',4000],['BBBBBB','YYYYYY',2000],['BBBBBB','ZZZZZZ',9000]],
  [['BBBBBB','UUUUUU',1000],['BBBBBB','XXXXXX',2000],['CCCCCC','WWWWWW',3000],
    ['CCCCCC','VVVVVV',4000],['DDDDDD','YYYYYY',7000],['DDDDDD','ZZZZZZ',3000]],
  [['BBBBBB','WWWWWW',1000],['BBBBBB','XXXXXX',2000],['DDDDDD','XXXXXX',3000],
    ['DDDDDD','YYYYYY',4000],['FFFFFF','WWWWWW',3000],['FFFFFF','YYYYYY',5000]],
];
export const voteCases = [
  { max: 50, multiplier: 1, ascending: false }, { max: 45, multiplier: 2, ascending: true },
  { max: 60, multiplier: 3, ascending: false }, { max: 55, multiplier: 4, ascending: true },
] as const;
const voteOrders = [[0,1,2,3,4], [2,0,1,3,4], [0,1,3,2,4], [0,1,2,4,3]] as const;
export function voteOptions(index: number): { rows: Votes[]; correctIndex: number } {
  const { multiplier, ascending } = voteCases[index];
  return {
    rows: voteOrders[index].map(source => rawVotes[source].map(([district,candidate,votes]) =>
      [district, candidate, votes * multiplier])),
    correctIndex: voteOrders[index].indexOf(ascending ? 0 : 4),
  };
}

export const months = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const;
export const monthCases = [
  { start: 0, descending: false, input: ['December','July','DEC','June','April','May'] },
  { start: 1, descending: true, input: ['JAN','May','November','janUARY','Feb','OCT'] },
  { start: 0, descending: true, input: ['Aug','April','October','AUGUST','MAR','Feb'] },
  { start: 1, descending: false, input: ['June','JUN','November','January','Apr','SEP'] },
] as const;
export function monthOutput(index: number) {
  const { input, descending } = monthCases[index];
  const asText = (labels: readonly string[]) => '[' + labels.join(', ') + ']';
  const ranks = (name: string) => months.findIndex(month => month.startsWith(name.slice(0, 3).toLowerCase())) + 1;
  const alphabetical = [...input].sort((left,right) => left.toLowerCase() < right.toLowerCase() ? -1 : left.toLowerCase() > right.toLowerCase() ? 1 : 0);
  const chronological = [...input].sort((left,right) => (ranks(left) - ranks(right)) * (descending ? -1 : 1));
  return [asText(input), asText(alphabetical), asText(chronological)].join('\n');
}

export const symmetryCases = [
  { half: '10110101', mismatch: 4 }, { half: '10010110', mismatch: 2 },
  { half: '11100110', mismatch: 3 }, { half: '10001100', mismatch: 5 },
] as const;
const invert = (bit: string) => bit === '1' ? '0' : '1';
export function bitExamples(index: number) {
  const { half, mismatch } = symmetryCases[index];
  const second = [...half].reverse().join('');
  const pair = 16 - mismatch;
  const flipped = [...second].map((bit, i) => i + 8 === pair ? invert(bit) : bit).join('');
  return { symmetric: half + second, asymmetric: half + flipped, markers: [mismatch - 1, pair] };
}
export function registerExamples(index: number) {
  const { half } = symmetryCases[index];
  return ['0000000000000000','00000000'+half,'0000101101011010',half+'00000000'];
}
