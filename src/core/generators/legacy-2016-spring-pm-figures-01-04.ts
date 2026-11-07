import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { spring2016PmCase } from './legacy-2016-spring-pm-01-04-shared';

const prefix = 'legacy-2016-spring-pm-';
export const spring2016Pm0104Profiles = {
  q1Network: prefix + '1-network',
  q2Cell: prefix + '2-cell',
  q2Memory: prefix + '2-memory',
  q2Live: prefix + '2-live',
  q2Marked: prefix + '2-marked',
  q2Sweep: prefix + '2-sweep',
  q2Graph: prefix + '2-efficiency',
  q3Tables: prefix + '3-tables',
  q4Network: prefix + '4-network',
} as const;

export const spring2016Pm2Cases = [
  { target: 4, extraPointer: false, markingCost: 1 },
  { target: 5, extraPointer: false, markingCost: 2 },
  { target: 6, extraPointer: false, markingCost: 3 },
  { target: 4, extraPointer: true, markingCost: 4 },
] as const;

export function spring2016Pm2Links(index: number): [number | null, number | null][] {
  return [
    [1, null], [null, 2], [null, null], [4, 5],
    [spring2016Pm2Cases[index].extraPointer ? 5 : null, 6], [null, null], [null, null],
  ];
}

export function spring2016Pm2Label(index: number, cell: number): string {
  return ['', '', '', 'セルA', 'セルC', 'セルB', index === 2 ? 'セルD' : ''][cell];
}

export function spring2016Pm2Live(index: number, after: boolean): Set<number> {
  const links = spring2016Pm2Links(index), live = new Set<number>();
  const visit = (cell: number | null) => {
    if (cell === null || live.has(cell)) return;
    live.add(cell);
    links[cell].forEach(visit);
  };
  visit(0);
  visit(after ? spring2016Pm2Cases[index].target : 3);
  return live;
}

export function spring2016Pm2Memory(index: number, afterMarking: boolean) {
  const live = spring2016Pm2Live(index, true);
  return [0, 3, 1, 5, 2, 4, 6, null].map(cell => afterMarking && (cell === null || live.has(cell)) ? 1 : 0);
}

export function spring2016Pm2GraphValue(index: number, choice: number, x: number): number {
  switch (choice) {
    case 0: return 1 - 1 / (1 + 5 * x);
    case 1: return x <= 0.72 ? 1 : (1 - x) / 0.28;
    case 2: return (1 - x) / (1 + spring2016Pm2Cases[index].markingCost * x);
    case 3: return (2 * x - 1) ** 2;
    default: throw Error('PARAMETER_CONSTRAINT');
  }
}

export const spring2016Pm3Cases = [
  { threshold: 2000, cutoff: 2016, passFee: 2000, entranceFee: 500, rideFee: 500, closing: '150851' },
  { threshold: 2400, cutoff: 2015, passFee: 2300, entranceFee: 600, rideFee: 600, closing: '160851' },
  { threshold: 1800, cutoff: 2014, passFee: 2200, entranceFee: 400, rideFee: 450, closing: '140851' },
  { threshold: 3000, cutoff: 2013, passFee: 2500, entranceFee: 700, rideFee: 750, closing: '170851' },
] as const;

type SourceTable = { name: string; columns: string[]; keys: number[]; rows: string[][] };

export function spring2016Pm3Tables(index: number, stage: number): SourceTable[] {
  const c = spring2016Pm3Cases[index];
  const rideDate = String(c.cutoff - 1) + '0115';
  const visitor = (columns: string[], row: string[]): SourceTable => ({ name: '入園者表', columns, keys: [0], rows: [row] });
  const ticket: SourceTable = { name: '券種表', columns: ['券種', '券種名', '料金'], keys: [0],
    rows: [['01', '入園券', String(c.entranceFee)], ['02', '小学生パスポート', String(c.passFee)]] };
  const columns = ['入園者番号', '券種', '入園日', '入園時刻'];
  const visit = ['00025987', '02', rideDate, '084517'];
  if (stage === 0) return [visitor(columns, visit), ticket];
  if (stage === 1) return [
    visitor([...columns, '退園時刻'], [...visit, c.closing]),
    ticket,
    { name: '利用表', columns: ['入園者番号', '利用時刻', 'アトラクション番号'], keys: [0, 1],
      rows: [['00025987', '091806', '04'], ['00025987', '102611', '05'], ['00025992', '102757', '05']] },
    { name: 'アトラクション表', columns: ['アトラクション番号', 'アトラクション名', '料金'], keys: [0],
      rows: [['01', 'ジェットコースター', String(c.rideFee)]] },
  ];
  return [
    { name: '会員表', columns: ['会員番号', '氏名', '住所', '生年月日', '入会日'], keys: [0],
      rows: [['000108', '情報太郎', '東京都文京区○○○', '19920901', String(c.cutoff) + '0114']] },
    visitor(['入園者番号', '会員番号', ...columns.slice(1), '退園時刻'],
      ['00028707', '000108', '04', String(c.cutoff) + '0218', '100555', '182021']),
  ];
}

export const spring2016Pm4Cases = [
  { sender: 'D', local: 'E', senderNetwork: 0, remote: 'F' },
  { sender: 'E', local: 'D', senderNetwork: 0, remote: 'F' },
  { sender: 'D', local: 'E', senderNetwork: 1, remote: 'F' },
  { sender: 'E', local: 'D', senderNetwork: 1, remote: 'F' },
] as const;
export const spring2016Pm4Networks = ['192.168.1.0/24', '172.16.1.0/24'];
export const spring2016Pm4Routers = ['G', 'H'];

export function spring2016Pm0104FigureAlt(profile: string, values: number[]): string {
  const [index, subindex] = values;
  const f = spring2016Pm0104Profiles;
  switch (profile) {
    case f.q1Network:
      return '利用者枠の利用者端末はインターネットを介してA社枠のFW（ファイアウォール）につながる。FWはDMZ（破線枠）内のWebサーバとLAN（破線枠）に接続する。LAN内のDBサーバ（データベース）には，会員情報（氏名，メールアドレス，訪れた飲食店情報，ログイン情報（IDとパスワード）など）と公開情報（飲食店情報，評価情報）がある。';
    case f.q2Cell:
      return '左からマークビット1欄、ポインタ2欄（それぞれから下向きの矢印）、固定長データ領域1欄。';
    case f.q2Memory:
      return 'マークビット0と斜線で示すNULLポインタ2欄をもつセルが連続する。途中を波線で省略。';
    case f.q2Live:
    case f.q2Marked: {
      const links = spring2016Pm2Links(index);
      const names = ['左上', '左下', '左下の先', 'セルA', 'セルC', 'セルB', index === 2 ? 'セルD' : 'セルCの先'];
      const describe = (after: boolean) => {
        const live = spring2016Pm2Live(index, after);
        const marked = profile === f.q2Marked;
        return 'LIVEから左上と' + names[after ? spring2016Pm2Cases[index].target : 3] + '（ポインタX）に接続。' +
          links.map((next, cell) => names[cell] + '：' + (live.has(cell) ? '実線' : '破線') +
            '、マークビット' + (marked && live.has(cell) ? 1 : 0) +
            '、ポインタは左が' + (next[0] === null ? 'NULL' : names[next[0]]) +
            '、右が' + (next[1] === null ? 'NULL' : names[next[1]]) + '。').join('');
      };
      return profile === f.q2Live ? '(a) ' + describe(false) + ' (b) ' + describe(true) : describe(true) + '図中の1はマーキングされたことを示す。';
    }
    case f.q2Sweep: {
      const bits = spring2016Pm2Memory(index, true);
      return 'メモリ領域のセルのマークビットは順に' + bits.slice(0, 6).join('、') +
        '、省略後は' + bits.slice(6).join('、') + '。0のセルの輪郭は破線、1のセルは実線。';
    }
    case f.q2Graph:
      return '横軸はL/M（0〜1）、縦軸はGCの効率。' + [
        '0から増加して傾きが緩やかになる。',
        '途中まで水平で、その後は直線で減少し、1で0になる。',
        '初めから減少し、傾きの絶対値が次第に小さくなり、1で0になる。',
        '途中まで減少して0に達した後、1に向けて増加する。',
      ][subindex];
    case f.q3Tables:
      return spring2016Pm3Tables(index, subindex).map(t => t.name + '。列は' + t.columns.join('、') +
        '。主キーは' + t.keys.map(i => t.columns[i]).join('、') + '。' +
        t.rows.map(r => r.join('、') + '。').join('') + '以下省略。').join('\n');
    case f.q4Network: {
      const c = spring2016Pm4Cases[index], near = c.senderNetwork, far = 1 - near;
      return '基幹ネットワークにはルータGとルータHが接続する。' + spring2016Pm4Networks[near] +
        'では，ブリッジCでつないだ2本のリンクのうち片方にホストE，他方にホストDとルータ' +
        spring2016Pm4Routers[near] + 'が接続する。' + spring2016Pm4Networks[far] +
        'にはルータ' + spring2016Pm4Routers[far] + 'とホストFが接続する。';
    }
    default: throw Error('FIGURE_PROFILE');
  }
}

const f = spring2016Pm0104Profiles;
const make = (profile: string, domain: BookletFigureDefinition['domain']): BookletFigureDefinition => ({
  profile, domain, validate: () => {}, alt: values => spring2016Pm0104FigureAlt(profile, values),
});
export const legacy2016SpringPm0104Figures: BookletFigureDefinition[] = [
  make(f.q1Network, [[0, 0]]), make(f.q2Cell, [[0, 0]]), make(f.q2Memory, [[0, 0]]),
  make(f.q2Live, [[0, 3]]), make(f.q2Marked, [[0, 3]]), make(f.q2Sweep, [[0, 3]]),
  make(f.q2Graph, [[0, 3], [0, 3]]), make(f.q3Tables, [[0, 3], [0, 2]]),
  make(f.q4Network, [[0, 3]]),
];

export function spring2016Pm0104Diagram(profile: string, values: number[], caption: string) {
  const input = values.length === 1 ? [spring2016PmCase(values)] : values;
  return figure(profile, input, caption, spring2016Pm0104FigureAlt(profile, input));
}
