import { DataError } from '../errors';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';

export const autumn2012Am2753Profiles = {
  cryptogram: 'legacy-2012-autumn-am-38-public-key',
  project: 'legacy-2012-autumn-am-52-duration',
} as const;

const cryptoCases = [
  { sender: 'A', recipient: 'B', plaintext: '来月転居する予定です。', ciphertext: 'nd359fxj47ac…' },
  { sender: 'A', recipient: 'C', plaintext: '到着は午後の予定です。', ciphertext: 'ja276bgv55eu…' },
  { sender: 'C', recipient: 'A', plaintext: '書類は明日発送します。', ciphertext: 'rk418dyh20pm…' },
  { sender: 'B', recipient: 'C', plaintext: '会場は後で連絡します。', ciphertext: 'sv805kbw64hz…' },
] as const;

export const autumn2012ProjectCases = [
  [6, 3, 4, 2, 4, 1],
  [8, 3, 4, 2, 4, 1],
  [5, 3, 4, 2, 4, 2],
  [6, 3, 4, 3, 4, 1],
] as const;

export const autumn2012ProjectEdges = [
  { label: 'A', from: 0, to: 2 }, { label: 'B', from: 0, to: 1 },
  { label: 'C', from: 1, to: 2 }, { label: 'D', from: 2, to: 4 },
  { label: 'E', from: 1, to: 3 }, { label: 'F', from: 3, to: 4 },
] as const;

function exactCase<T>(values: readonly number[], cases: readonly T[]): T {
  const index = values[0];
  if (values.length !== 1 || !Number.isInteger(index) || index < 0 || index >= cases.length) {
    throw new DataError('FIGURE_PROFILE', '指定条件の図を表示できません。');
  }
  return cases[index];
}

export const autumn2012Cryptogram = (values: readonly number[]) => exactCase(values, cryptoCases);
export const autumn2012ProjectDurations = (values: readonly number[]) => exactCase(values, autumn2012ProjectCases);

export function autumn2012CryptogramAlt(values: readonly number[]) {
  const { sender, recipient, plaintext, ciphertext } = autumn2012Cryptogram(values);
  return '左の' + sender + 'さん側で，平文「' + plaintext + '」を鍵Kによって暗号化し，暗号文「' +
    ciphertext + '」がネットワークを経て右へ渡る。右の' + recipient + 'さん側で，' + recipient +
    'さんの秘密鍵によって復号し，平文「' + plaintext + '」を得る。';
}

export function autumn2012ProjectAlt(values: readonly number[]) {
  const durations = autumn2012ProjectDurations(values);
  const names = ['左上', '左下', '中央上', '中央下', '右上'];
  return 'アローダイアグラム。凡例では矢印の上側が作業名，下側が所要日数。' +
    autumn2012ProjectEdges.map(({label, from, to}, index) =>
      names[from] + 'から' + names[to] + 'へ作業' + label + '（' + durations[index] + '日）').join('，') + '。';
}

export const legacy2012AutumnAm2753Figures: readonly BookletFigureDefinition[] = [
  { profile: autumn2012Am2753Profiles.cryptogram, domain: [[0, cryptoCases.length - 1]],
    validate(values) { autumn2012Cryptogram(values); }, alt: autumn2012CryptogramAlt },
  { profile: autumn2012Am2753Profiles.project, domain: [[0, autumn2012ProjectCases.length - 1]],
    validate(values) { autumn2012ProjectDurations(values); }, alt: autumn2012ProjectAlt },
];
