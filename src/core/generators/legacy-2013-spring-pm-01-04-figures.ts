import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { colorBitRows, colorCases, databaseTables, pageCases, securityRules, userInfoExtra, userInfoRows } from './legacy-2013-spring-pm-01-04-models';

export const profiles = {
  color: 'legacy-2013-spring-pm-1-color-overlap',
  colorBits: 'legacy-2013-spring-pm-1-color-bit-table',
  vram: 'legacy-2013-spring-pm-1-vram-planes',
  paging: 'legacy-2013-spring-pm-2-page-mapping',
  database: 'legacy-2013-spring-pm-3-database-tables',
  securityPolicy: 'legacy-2013-spring-pm-4-security-policy',
  userInfo: 'legacy-2013-spring-pm-4-user-information',
  security: 'legacy-2013-spring-pm-4-entry-states',
} as const;

export function colorAlt() {
  return '長方形の内側にR（上）、G（左下）、B（右下）の円がある。RとGだけが重なる領域はY、RとBだけが重なる領域はM、GとBだけが重なる領域はC、三つの円が重なる中央はW。円の外側はK。';
}

export function colorBitsAlt([index]: number[]) {
  return ['色｜ビットパターン', ...colorBitRows(index).map(([name, bits]) => name + '｜' + (bits || '（網掛け）')),
    '注記　網掛けの部分は表示していない。'].join('\n');
}

export function vramAlt([index]: number[]) {
  const values = colorCases[index].bytes;
  return '先頭ビットは各プレーンの左端。プレーン1（赤）は' + values[0] +
    '，プレーン2（緑）は' + values[1] + '，プレーン3（青）は' + values[2] +
    'から始まる。各先頭バイトの後には省略した領域が続く。値は16進数。';
}

export function pagingAlt([index]: number[]) {
  const frames = pageCases[index].physical;
  const entries = [1, 2, 3, 4, 5].map(page => {
    const slot = frames.findIndex(candidate => candidate === page);
    return 'a' + page + '（仮想ページ' + page + '）は存在ビット' +
      (slot < 0 ? '0で物理ページ番号の表示なし' : '1で物理ページ' + (slot + 1));
  });
  return '左の仮想記憶にa1〜a5があり、仮想ページ番号は1〜5、その後は省略してmまで。中央のページテーブルと右の主記憶を対応付ける。' +
    entries.join('。') + '。仮想ページmの存在ビットは0。主記憶のページ番号は1、2、3、…、nで、1と2にa' +
    frames[0] + '、a' + frames[1] + 'が格納される。図の下に補助記憶装置があり、プログラムAを分割したa1〜a5が格納され、主記憶との転送を矢印で示す。';
}

export function securityAlt() {
  return '図の各枠は上からICカードの状態、入室許可の状態、入室可能な部屋を示す。①は仮パスワード・網掛け・なし。②は有効・執務室だけ許可・執務室。③は返却・網掛け・なし。④は一時利用停止・網掛け・なし。⑤は有効・開発室許可・執務室と開発室。開始は①、終了は③から。①のパスワード変更は②又は⑤へ。①から④へは空欄a。②から⑤はα、⑤から②はβ、②から③はγ、⑤から③はδ。②・⑤から④へ向かう経路もある。④から①へはセキュリティ管理者によるパスワード初期化。網掛けの部分は表示していない。';
}

export function databaseAlt([index, group]: number[]) {
  return databaseTables(index, group).map(item => [
    item.title,
    item.columns.map((name, col) => item.keys.includes(col) ? name + '（下線）' : name).join('｜'),
    ...item.rows.map(row => row.join('｜')),
  ].filter(Boolean).join('\n')).join('\n');
}

export function securityPolicyAlt([index]: number[]) {
  return '〔J社の入退室管理システムのセキュリティ要件〕\n' +
    securityRules(index).map((rule, i) => '（' + (i + 1) + '）' + rule).join('\n');
}

export function userInfoAlt([index]: number[]) {
  return ['利用者情報｜説明', ...userInfoRows(index).map(row => row.join('｜')), ...userInfoExtra].join('\n');
}

export const legacy2013SpringPm0104Figures: BookletFigureDefinition[] = [
  { profile: profiles.color, domain: [[0, 0]], validate() {}, alt: colorAlt },
  { profile: profiles.colorBits, domain: [[0, 3]], validate() {}, alt: colorBitsAlt },
  { profile: profiles.vram, domain: [[0, 3]], validate() {}, alt: vramAlt },
  { profile: profiles.paging, domain: [[0, 3]], validate() {}, alt: pagingAlt },
  { profile: profiles.database, domain: [[0, 3], [0, 2]], validate() {}, alt: databaseAlt },
  { profile: profiles.securityPolicy, domain: [[0, 3]], validate() {}, alt: securityPolicyAlt },
  { profile: profiles.userInfo, domain: [[0, 3]], validate() {}, alt: userInfoAlt },
  { profile: profiles.security, domain: [[0, 0]], validate() {}, alt: securityAlt },
];

export function draw(profile: keyof typeof profiles, value: number | number[], caption: string) {
  const definition = legacy2013SpringPm0104Figures.find(item => item.profile === profiles[profile])!;
  const values = typeof value === 'number' ? [value] : value;
  return figure(definition.profile, values, caption, definition.alt(values));
}
