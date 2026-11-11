import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { cacheDirectory, cacheExample, cacheTimeline } from './legacy-2010-spring-pm-01-04-cache';
import { relations, teacherNote } from './legacy-2010-spring-pm-01-04-database';
import { capacities, probabilities, streamingCase, trafficTable } from './legacy-2010-spring-pm-01-04-queue';
import { exampleTree, firstTrees, secondTrees, treeText } from './legacy-2010-spring-pm-01-04-syntax';

export const profiles = {
  cacheLayer: 'legacy-2010-spring-pm-1-cache-layer',
  cacheExample: 'legacy-2010-spring-pm-1-cache-example',
  cacheAfterLoad: 'legacy-2010-spring-pm-1-cache-after-load',
  cacheAfterStore: 'legacy-2010-spring-pm-1-cache-after-store',
  cacheTimeline: 'legacy-2010-spring-pm-1-cache-timeline',
  treeWalk: 'legacy-2010-spring-pm-2-tree-walk',
  firstTree: 'legacy-2010-spring-pm-2-first-tree',
  secondTree: 'legacy-2010-spring-pm-2-second-tree',
  stack: 'legacy-2010-spring-pm-2-stack',
  database: 'legacy-2010-spring-pm-3-database',
  relation: 'legacy-2010-spring-pm-3-relation',
  requirements: 'legacy-2010-spring-pm-4-requirements',
  queue: 'legacy-2010-spring-pm-4-queue',
} as const;

const directoryHeading = 'ディレクトリ｜ブロック番号｜順位｜フラグ';
const directoryAlt = (index: number, at: 0 | 6) => directoryHeading + '\n' +
  cacheDirectory(index, at).map((row, i) => (i + 1) + '｜' + row.join('｜')).join('\n');
export const relationChoices = [relations.gradesA, relations.exams, relations.gradesB, relations.subjects];
const relationAlt = ({ name, columns, keys }: typeof relationChoices[number]) =>
  name + '：' + columns.join('｜') + '。主キーの下線は' + columns.slice(0, keys).join('・') + '。';

export function requirementRows(index: number) {
  const { rateTenths, requests, duration, stored, allowed } = streamingCase(index);
  return [
    ['動画のビット速度', rateTenths / 10 + 'Mビット／秒'],
    ['クライアントから1分当たりに要求される動画の本数', requests + '本／分'],
    ['動画1本の平均再生時間（再生時間は指数分布に従い，動画の再生時間と送信時間は等しいものとする）', duration + '分'],
    ['サーバに格納する動画の本数', stored.toLocaleString('en-US') + '本'],
    ['クライアントからの要求が待たされる確率', allowed + '％以下'],
  ];
}
const descriptors = {
  cacheLayer: { count: 1, alt: () => '上からCPU，キャッシュメモリ，主記憶。CPUとキャッシュメモリの間は語単位で転送（高速）。キャッシュメモリと主記憶の間はブロック単位で転送（低速）。いずれも双方向。' },
  cacheExample: { count: 4, alt: (index: number) => directoryHeading + '\n' +
    cacheExample(index).map(({ block, rank, flag }, i) => (i + 1) + '｜' + [block, rank, flag].join('｜') + '。対応するバッファ' +
      (i + 1) + 'は' + (block ? 'ブロック番号' + block + 'の主記憶の内容。' : '未使用。')).join('\n') },
  cacheAfterLoad: { count: 4, alt: (index: number) => directoryAlt(index, 0) },
  cacheAfterStore: { count: 4, alt: (index: number) => directoryAlt(index, 6) },
  cacheTimeline: { count: 4, alt: (index: number) => '実行命令の番地。ディレクトリ1・2・3ごとにブロック番号とフラグ。' +
    '\n' + cacheTimeline(index).map(({ address, cells }, i) => (i === 2 ? '1回目のループ\n' : i === 9 ? '2回目のループ\n' : '') +
      address + '｜' + cells.map(pair => pair.join('，') || '網掛け').join('｜')).join('\n') },
  treeWalk: { count: 1, alt: () => '根のopの左の子はop(a, b)，右の子はc。探索順の矢印は左の葉aとbをたどって左のopに戻り，cをたどって根のopに戻る。' },
  firstTree: { count: 5, alt: (index: number) => treeText(firstTrees[index]) },
  secondTree: { count: 5, alt: (index: number) => treeText(secondTrees[index]) },
  stack: { count: 2, alt: (index: number) => index === 0 ? 'push(x)：上からy，zのスタックにxを積むと，上からx，y，zになる。' :
    'add：上からx，y，zのスタックからxとyを取り出して加算し，上からy＋x，zになる。' },
  database: { count: 1, alt: () => [relationAlt(relations.students), relationAlt(relations.history), teacherNote, relationAlt(relations.teachers)].join('\n') },
  relation: { count: 4, alt: (index: number) => relationAlt(relationChoices[index]) },
  requirements: { count: 4, alt: (index: number) => requirementRows(index).map(row => row.join('｜')).join('\n') },
  queue: { count: 1, alt: () => '列はP（％），行はn（本）。網掛けの数値はT。\nn＼P｜' +
    probabilities.join('｜') + '\n' + trafficTable.map((row, i) => capacities[i] + '｜' + row.map(value => value.toFixed(1)).join('｜')).join('\n') },
} as const;
type Kind = keyof typeof profiles;
function validate(kind: Kind, values: number[]) {
  const item = Object.getOwnPropertyDescriptor(values, '0');
  if (values.length !== 1 || Reflect.ownKeys(values).length !== 2 || !item || !('value' in item) ||
    !Number.isInteger(item.value) || item.value < 0 || item.value >= descriptors[kind].count) throw Error('FIGURE_PROFILE');
}
export const legacy2010SpringPm0104Figures: readonly BookletFigureDefinition[] = (Object.keys(profiles) as Kind[]).map(kind => ({
  profile: profiles[kind], domain: [[0, descriptors[kind].count - 1]], validate: values => validate(kind, values),
  alt: values => descriptors[kind].alt(values[0]),
}));
export function draw(kind: Kind, index: number, caption: string, accessible = false) {
  const values = [index];
  validate(kind, values);
  const block = figure(profiles[kind], values, caption, descriptors[kind].alt(index));
  return accessible ? { ...block, captionPresentation: 'accessible' as const } : block;
}

export { exampleTree };
