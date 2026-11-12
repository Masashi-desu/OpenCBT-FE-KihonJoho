import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { exampleRows, printCases } from './legacy-2008-autumn-pm-2-model';
import { points, stage } from './legacy-2008-autumn-pm-4-model';
import { musicCases, musicFields, musicKeyCounts, musicModules, musicScreenResult } from './legacy-2008-autumn-pm-5-model';

export const profiles = {
  topology: 'legacy-2008-autumn-pm-1-topology',
  printExample: 'legacy-2008-autumn-pm-2-print-example',
  trainingSchema: 'legacy-2008-autumn-pm-3-training-schema',
  shortestGraph: 'legacy-2008-autumn-pm-4-shortest-graph',
  musicRecord: 'legacy-2008-autumn-pm-5-record',
  musicScreen: 'legacy-2008-autumn-pm-5-screen',
  musicTree: 'legacy-2008-autumn-pm-5-module-tree',
  musicReport: 'legacy-2008-autumn-pm-5-report',
  musicFlow: 'legacy-2008-autumn-pm-5-report-flow',
} as const;
export const trainingTables = [
  { name: '社員表', keys: ['社員コード'], other: ['氏名', '入社年月日', '部署コード', '役職コード', '退職年月日', '生年月日', '住所', '電話番号'] },
  { name: '部署表', keys: ['部署コード'], other: ['部署名'] },
  { name: '役職表', keys: ['役職コード'], other: ['役職名'] },
  { name: '研修実施表', keys: ['年度', '研修コード'], other: ['研修名', '研修開始年月日', '研修終了年月日', '研修日数'] },
  { name: '受講表', keys: ['年度', '研修コード', '社員コード'], other: ['受講日数'] },
];

export const siteLegend = '白丸はアクセスポイント。両向き矢印は通信経路。w，x，y，zは拠点とその拠点に対応したアクセスポイントとの接続。';
export const flowNote = 'ファイルX，Yは，楽曲管理ファイル，会員ファイル又はダウンロード実績ファイルのいずれかを表す。なお，各処理間の中間ファイルは省略している。';
export const underlinedKey = '注　下線はキー項目を表す。';
export const topologyConnections = '本社はwで上側のアクセスポイントに，支店Xはxで左側，支店Yはyで下側，支店Zはzで右側のアクセスポイントに接続する。';

type Kind = keyof typeof profiles;
const descriptors: Record<Kind, { count: number; alt: (index: number) => string }> = {
  topology: { count: 2, alt: index => index === 0 ? siteLegend + topologyConnections :
    topologyConnections + 'X・Y・Z各支店同士の通信経路は，本社内のルータを経由する。' },
  printExample: { count: 4, alt: index => {
    const { margin, width } = printCases[index];
    const [one, two, three, four] = exampleRows(index);
    return '左の余白はMargin' + (index === 0 ? '' : '＝' + margin) + '，本文の最大行長はMaxC' +
      (index === 0 ? '' : '＝' + width) + '。1行目「' + one + '」はMaxC文字印字したことによる改行。2行目「' +
      two + '」と3行目「' + three + '」は文字列に含まれていた改行文字による改行。4行目は「' + four + '」。';
  } },
  trainingSchema: { count: 1, alt: () => trainingTables.map(({ name, keys, other }) =>
    name + '（' + [...keys, ...other].join('，') + '）。下線のキー項目は' + keys.join('，') + '。').join(' ') + underlinedKey },
  shortestGraph: { count: 32, alt: value => {
    const { edges, state, stageNumber } = stage(value);
    const routes = edges.map(([from, to, weight]) => from + '→' + to + '：' + weight).join('，');
    if (!state) return '地点1が出発地。各矢印は「始点→終点：距離」。' + routes + '。';
    const settled = state.settled.join('，');
    const distances = points.slice(1).map(point => point + '：' + (point === 6 && stageNumber >= 5 ? '［b］' :
      Number.isFinite(state.distances[point]) ? state.distances[point] : '∞')).join('，');
    const highlighted = state.settled.slice(1).map(point => state.predecessor[point] + '→' + point);
    return '各矢印は「始点→終点：距離」。' + routes + '。処理済の網掛け地点は' + settled +
      '。仮最短距離は「地点：距離」で' + distances + '。' + (highlighted.length ? '太線の矢印は' + highlighted.join('，') + '。' : '');
  } },
  musicRecord: { count: 3, alt: index => '左から' + musicFields[index].join('，') + '。下線のキー項目は' +
    musicFields[index].slice(0, musicKeyCounts[index]).join('，') + '。' + underlinedKey },
  musicScreen: { count: 1, alt: () => 'ログイン画面には会員番号12345，伏字のパスワード欄，ログインと終了ボタン。下の楽曲検索画面と上下の両向き矢印で結ぶ。' +
    '楽曲検索画面には検索項目・検索内容・検索条件。曲名「情報処理」「を含む」，演奏者名「i.n.f.o」「と等しい」，演奏時間・制作会社・ジャンルは空欄。検索とログアウトボタン。' +
    '右の楽曲選択画面と左右の両向き矢印で結ぶ。楽曲選択画面には楽曲番号・曲名・演奏者名。' +
    musicScreenResult.map(row => row.join('，')).join('。') + '。以下省略。再検索ボタン。' },
  musicTree: { count: 1, alt: () => musicModules.flatMap(module => {
    const children = musicModules.filter(node => node.parent === module.key).map(node => node.label.replaceAll('|', ''));
    return children.length ? [module.label.replaceAll('|', '') + 'の下は' + children.join('，') + '。'] : [];
  }).join(' ') },
  musicReport: { count: 4, alt: index => {
    const { field, date, rows } = musicCases[index];
    return field + '別ダウンロード件数表。日付は' + date + '。左から' + field + '，ダウンロード件数，楽曲数。各行は' +
      rows.map(row => row.join('，')).join('。') + '。以下省略。';
  } },
  musicFlow: { count: 4, alt: index => 'ファイルXとファイルYから処理1に入力。処理1→処理2→処理3→処理4→処理5→処理6→処理7→' +
    musicCases[index].field + '別ダウンロード件数表。ファイル［e］は上から処理4へ入る。' + flowNote },
};

function validate(kind: Kind, values: number[]) {
  const item = Object.getOwnPropertyDescriptor(values, '0');
  if (values.length !== 1 || Reflect.ownKeys(values).length !== 2 || !item || !('value' in item) ||
      !Number.isSafeInteger(item.value) || item.value < 0 || item.value >= descriptors[kind].count) throw Error('FIGURE_PROFILE');
}

export const legacy2008AutumnPm0105Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as Kind[]).map(kind => ({
  profile: profiles[kind], domain: [[0, descriptors[kind].count - 1]],
  validate: values => validate(kind, values),
  alt: values => { validate(kind, values); return descriptors[kind].alt(values[0]); },
}));

export function draw(kind: Kind, index: number, caption: string) {
  const values = [index];
  validate(kind, values);
  return figure(profiles[kind], values, caption, descriptors[kind].alt(index));
}
