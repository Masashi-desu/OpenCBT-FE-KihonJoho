export const dictionaryConditions = [
  { limit: 30, left: 'A.D.', right: 'ad-', order: ['CO', 'Co.', 'co-', 'co.'] },
  { limit: 24, left: 'ab.', right: 'A-B-', order: ['be-', 'be.', 'Be.', 'BE'] },
  { limit: 28, left: 'A-R-', right: 'A-R-', order: ['de.', 'de-', 'De.', 'DE'] },
  { limit: 32, left: 'It.', right: 'ix-', order: ['GO', 'Go.', 'go.', 'go-'] },
];

export const courtConditions = [
  { opening: 8, left: [1, 2], right: [3, 4], resultCode: 4 },
  { opening: 7, left: [1, 3], right: [2, 4], resultCode: 5 },
  { opening: 9, left: [1, 4], right: [2, 3], resultCode: 6 },
  { opening: 6, left: [2, 4], right: [1, 3], resultCode: 7 },
];

export const courtProcedureUpdate = `ELSE
    IF ［e］ AND
       ［f］ AND
       ［g］ THEN
        SET RSV-NOTE TO TRUE
        INITIALIZE RET-COURT
    END-IF`;

export const directoryConditions = [
  { additions: ['bin', 'local/bin', 'local/lib', 'opt/local'], rejected: '' },
  { additions: ['bin', 'local//bin/', 'local//bin/', 'opt/local'], rejected: '/opt' },
  { additions: ['bin', 'local/bin', 'local/lib/core', 'srv/local'], rejected: '' },
  { additions: ['tmp/cache', 'local/bin', 'local/lib/docs', 'lib/local'], rejected: '/usr' },
];

export function directoryOutput(index: number, leafWithoutSlash: boolean) {
  const { additions } = directoryConditions[index];
  const paths = new Set<string>();
  for (const path of ['usr', ...additions.slice(0, 3).map(path => 'usr/' + path), additions[3]]) {
    const parts = path.split('/').filter(Boolean);
    for (let length = 1; length <= parts.length; length++) paths.add(parts.slice(0, length).join('/'));
  }
  const names = [...paths];
  return {
    count: paths.size + 1,
    lines: [
      ...names.filter(path => !path.includes('/')),
      ...names.filter(path => path.endsWith('/local') || path === 'local').map(path => {
        const withSlash = !leafWithoutSlash || names.some(other => other.startsWith(path + '/'));
        return '/' + path + (withSlash ? '/' : '');
      }),
      'IllegalArgument',
    ],
  };
}

export const timeConditions = [
  { seconds: 274, event: '10 km走' },
  { seconds: 332, event: '5 km走' },
  { seconds: 498, event: '8 km走' },
  { seconds: 538, event: '12 km走' },
];
