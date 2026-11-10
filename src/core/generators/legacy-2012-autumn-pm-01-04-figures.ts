import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { incidentResponseRows, mimeLines, purchaseTables } from './legacy-2012-autumn-pm-01-04-models';

export const profiles = {
  shared: 'legacy-2012-autumn-pm-1-shared-memory',
  sync: 'legacy-2012-autumn-pm-1-lock-memory',
  purchase: 'legacy-2012-autumn-pm-2-purchasing-tables',
  message: 'legacy-2012-autumn-pm-3-mime-message',
  mimeLines: 'legacy-2012-autumn-pm-3-content-lines',
  incident: 'legacy-2012-autumn-pm-4-incident-response',
} as const;

export function sharedAlt() {
  return 'コンピュータXの左にプロセスp1、右にプロセスp2、中央の共有メモリに共有データyがある。'
    + '各プロセスの破線枠内に①共有データyからの読込み、②計算、③共有データyへの書込みがある。'
    + '読込みの矢印はyから両プロセスへ、書込みの矢印は各プロセスからyへ向かう。'
    + '注記　実線矢印は共有データへのアクセス（読込み又は書込み）を表す。';
}
export function syncAlt() {
  return 'コンピュータXの中央の共有メモリに同期変数sと共有データy、左右にプロセスp1とp2がある。'
    + '両プロセスは上からℓ(s)、破線枠の計算処理、u(s)を実行する。'
    + '注記　実線の両矢印は各計算処理とyとのアクセス、点から始まる破線矢印はℓ(s)及びu(s)からsへの操作を表す。';
}
export function purchaseAlt([index, group]: number[]) {
  return purchaseTables(index, group).map(item => [
    item.title,
    item.columns.map((name, i) => item.keys.includes(i) ? name + '（下線）' : name).join('｜'),
    ...item.rows.map(row => row.join('｜')),
  ].join('\n')).join('\n');
}
export const mimeMessageLines = [
  ['通常の電子メールのヘッダ', true],
  ['MIME-Version: 1.0', false],
  ['Content-Type: multipart/mixed; boundary="delimiter"', false],
  ['', false],
  ['--delimiter', false],
  ['コンテンツごとの属性を示すヘッダ', true],
  ['', false],
  ['コンテンツ1', true],
  ['--delimiter', false],
  ['コンテンツごとの属性を示すヘッダ', true],
  ['', false],
  ['コンテンツ2', true],
  ['--delimiter--', false],
] as const;
export function messageAlt() {
  return mimeMessageLines.map(([line, shaded]) => shaded ? '（網掛け）' + line : line).join('\n')
    + '\n注記　網掛けは，その位置に格納される情報の種類を表している。';
}
export function linesAlt([index]: number[]) { return mimeLines(index).lines.join('\n'); }

export function incidentAlt() {
  return ['対象｜対策と対応', ...incidentResponseRows.map(([target, actions]) => target + '｜' + actions)].join('\n');
}

export const legacy2012AutumnPm0104Figures: BookletFigureDefinition[] = [
  { profile: profiles.shared, domain: [[0, 0]], validate() {}, alt: sharedAlt },
  { profile: profiles.sync, domain: [[0, 0]], validate() {}, alt: syncAlt },
  { profile: profiles.purchase, domain: [[0, 3], [0, 2]], validate() {}, alt: purchaseAlt },
  { profile: profiles.message, domain: [[0, 0]], validate() {}, alt: messageAlt },
  { profile: profiles.mimeLines, domain: [[0, 3]], validate() {}, alt: linesAlt },
  { profile: profiles.incident, domain: [[0, 0]], validate() {}, alt: incidentAlt },
];

export function draw(profile: keyof typeof profiles, values: number[], caption: string) {
  const definition = legacy2012AutumnPm0104Figures.find(item => item.profile === profiles[profile])!;
  return figure(definition.profile, values, caption, definition.alt(values));
}
