export const listCases = [
  { base: 0, initial: ['cpu', 'ram', 'dos', 'vpn', 'dvd'], example: 2, trial: ['usb', 'cgi', 'cpu', 'dos', 'fat'], queries: [1, 2, 3] },
  { base: 0, initial: ['lan', 'hub', 'nic', 'dns', 'wan'], example: 3, trial: ['bus', 'ram', 'rom', 'ssd', 'tape'], queries: [1, 3, 2] },
  { base: 1, initial: ['bmp', 'gif', 'png', 'svg', 'ico'], example: 2, trial: ['csv', 'tsv', 'xml', 'txt', 'log'], queries: [2, 1, 3] },
  { base: 1, initial: ['ssh', 'tls', 'ftp', 'ntp', 'tcp'], example: 4, trial: ['cat', 'dog', 'owl', 'fox', 'cow'], queries: [3, 2, 1] },
] as const;
export function nextAfterMoving(index: number) {
  const { base, initial, example } = listCases[index];
  const indices = initial.map((_, order) => order + base);
  const first = indices[example];
  const moved = [first, ...indices.filter(pointer => pointer !== first)];
  return { first, next: indices.map(pointer => moved[moved.indexOf(pointer) + 1] ?? -1) };
}
export function listTrace(index: number) {
  const { trial, queries } = listCases[index];
  const order: string[] = [...trial];
  const result: string[] = [];
  for (const query of queries) {
    const value = trial[query], found = order.indexOf(value);
    result.push(...order.slice(0, found));
    order.splice(found, 1);
    order.unshift(value);
  }
  return result;
}
