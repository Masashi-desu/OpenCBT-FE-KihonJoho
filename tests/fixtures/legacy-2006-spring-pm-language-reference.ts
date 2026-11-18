export const officialLanguageKeys = {
  10: 'アウイアエ', 11: 'イカカアウオ', 12: 'エイイイエ', 13: 'カイイエア',
} as const;

export const dictionaryInputs = [
  { terms: [['man', '男，人間'], ['main', '主な'], ['mail', '郵便物'], ['mailer', '電子メールソフト'], ['name', '名前']], initials: ['m', 'n'] },
  { terms: [['car', '自動車'], ['care', '世話'], ['case', '事例'], ['cases', '事例の複数形'], ['tone', '音色']], initials: ['c', 't'] },
  { terms: [['tea', '茶'], ['team', 'チーム'], ['tear', '涙'], ['term', '用語'], ['toast', 'トースト']], initials: ['t', 'to'] },
  { terms: [['be', 'である'], ['bee', 'ハチ'], ['bend', '曲げる'], ['bent', '曲がった'], ['seed', '種']], initials: ['b', 's'] },
];

export function searchWords(terms: readonly string[][], input: string, autocomplete: boolean) {
  let displayed = '', translation = '', failed = false;
  for (const c of input) {
    if (!/^[a-z]$/.test(c)) break;
    displayed += c;
    const matching = terms.filter(([word]) => word.startsWith(displayed));
    if (!matching.length) {
      failed = true;
      translation = '単語が見つかりません';
      break;
    }
    if (autocomplete) {
      const shortest = Math.min(...matching.map(([word]) => word.length));
      while (displayed.length < shortest && matching.every(([word]) => word[displayed.length] === matching[0][0][displayed.length]))
        displayed += matching[0][0][displayed.length];
    }
    translation = terms.find(([word]) => word === displayed)?.[1] ?? '';
  }
  return { displayed, translation, failed };
}

export const railInputs = [
  { start: 2, finish: 4, time: 415, fixed: 10, durations: [8, 6, 11, 7, 10, 9, 8, 10, 13] },
  { start: 5, finish: 2, time: 400, fixed: 20, durations: [12, 8, 7, 10, 15, 9, 7, 11, 8] },
  { start: 1, finish: 3, time: 416, fixed: 8, durations: [7, 9, 5, 11, 10, 8, 9, 12, 6] },
  { start: 4, finish: 1, time: 469, fixed: 15, durations: [11, 8, 6, 12, 10, 7, 10, 9, 12] },
];

export function intervalTrip(start: number, finish: number, time: number, elapsed: readonly number[]) {
  const direction = Math.sign(finish - start);
  const firstSection = Math.min(start, finish), lastSection = Math.max(start, finish);
  const segmentSequence = Array.from({ length: lastSection - firstSection }, (_, i) => firstSection + i);
  if (direction < 0) segmentSequence.reverse();
  return segmentSequence.map((section, i) => {
    const minutes = segmentSequence.slice(0, i).reduce((sum, prior) => sum + elapsed[prior - 1], time);
    return [Math.floor(minutes / 60), direction > 0 ? 'UP' : 'DOWN', section] as const;
  });
}

export const solitaireInputs = [
  { width: 4, cards: [3, 8, 3, 1, 2, 4, 7, 8, 3, 7] },
  { width: 5, cards: [6, 1, 3, 4, 7, 2, 4, 6, 5, 3, 3, 2] },
  { width: 6, cards: [5, 3, 5, 7, 2, 4, 1, 2, 1, 4, 5, 7, 7, 1] },
  { width: 5, cards: [6, 4, 6, 1, 2, 7, 2, 3, 4, 6, 3, 6, 5, 3] },
];

export function gridPairs(cards: number[], width: number) {
  const valid: (readonly [number, number])[] = [];
  for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) {
    const rowDistance = Math.floor(j / width) - Math.floor(i / width);
    const columnDistance = Math.abs(j % width - i % width);
    if (Math.max(rowDistance, columnDistance) === 1 && cards[i] === cards[j]) valid.push([i, j]);
  }
  return valid;
}
