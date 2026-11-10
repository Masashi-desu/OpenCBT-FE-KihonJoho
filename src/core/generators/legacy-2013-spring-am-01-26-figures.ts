import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { validIndex } from './legacy-2013-spring-am-01-26-shared';

const prefix = 'legacy-2013-spring-am-';
export const spring2013Am0126Profiles = {
  tree: prefix + '5-search-tree',
  postfix: prefix + '6-postfix-stack',
  hash: prefix + '7-hash-array',
  flow: prefix + '8-division-flow',
  address: prefix + '10-addressing',
  cache: prefix + '12-cache-configuration',
  circuit: prefix + '24-logic-circuit',
  gate: prefix + '24-logic-choice',
  uml: prefix + '26-uml-multiplicity',
} as const;
type FigureKind = keyof typeof spring2013Am0126Profiles;

export const treeEdges = [[6,4],[6,8],[4,2],[4,5],[8,7],[8,12],[2,1],[2,3],[12,10],[12,14],[10,9],[10,11],[14,13],[14,15]] as const;
export const treeCases = [
  { target: 12, choices: [9, 10, 13, 14] },
  { target: 4, choices: [1, 3, 6, 8] },
  { target: 10, choices: [7, 8, 11, 13] },
  { target: 14, choices: [8, 10, 12, 15] },
] as const;
export const postfixCases = [
  { example: 'abcd+++', options: ['ab+c+d+', 'ab+cd++', 'abc++d+', 'abc+d++'] },
  { example: 'abcde++++', options: ['abc++d+e+', 'ab+c+d+e+', 'abcd+++e+', 'ab+cde+++'] },
  { example: 'abcdef+++++', options: ['ab+cdef++++', 'abc++d+e+f+', 'ab+cd++e+f+', 'ab+c+d+e+f+'] },
] as const;
export function postfixTrace(expression: string) {
  const stack: string[] = [], frames: string[][] = [];
  let depth = 0;
  for (const token of expression) {
    if (token === '+') {
      const right = stack.pop(), left = stack.pop();
      if (!left || !right) throw Error('POSTFIX_UNDERFLOW');
      stack.push(left + '+' + right);
    } else {
      stack.push(token);
    }
    depth = Math.max(depth, stack.length);
    frames.push([...stack]);
  }
  if (stack.length !== 1) throw Error('POSTFIX_RESULT');
  return { depth, frames };
}
export function postfixFrames(index: number) {
  const { depth, frames } = postfixTrace(postfixCases[index].example);
  return frames.slice(depth - 1);
}

export const hashCases = [[54321,13],[97310,11],[74213,12],[57329,14]] as const;
export const flowCases = [
  { dividend: 'x', divisor: 'y', quotient: 'q', remainder: 'r' },
  { dividend: 'x', divisor: 'y', quotient: 'r', remainder: 'q' },
  { dividend: 'y', divisor: 'x', quotient: 'q', remainder: 'r' },
  { dividend: 'y', divisor: 'x', quotient: 'r', remainder: 'q' },
] as const;
export const addressCases = [
  { address: 20, target: 25, kind: 'indirect' },
  { address: 18, target: 18, kind: 'direct' },
  { address: 36, target: 50, kind: 'indexed', register: 'レジスタIX' },
  { address: 44, target: 68, kind: 'relative', register: 'プログラムカウンタ' },
] as const;

export type LogicGate = 'AND' | 'NAND' | 'OR' | 'NOR' | 'XOR';
export const circuitCases: readonly (readonly [LogicGate, LogicGate, LogicGate, LogicGate])[] = [
  ['NAND', 'NAND', 'NAND', 'NAND'],
  ['OR', 'NAND', 'NAND', 'NAND'],
  ['OR', 'NAND', 'NAND', 'NOR'],
  ['OR', 'NAND', 'NAND', 'AND'],
];
export const logicChoices = ['OR','AND','XOR','NOR'] as const;
export function operateGate(gate: LogicGate, left: boolean, right: boolean) {
  switch (gate) {
    case 'AND': return left && right;
    case 'NAND': return !(left && right);
    case 'OR': return left || right;
    case 'NOR': return !(left || right);
    case 'XOR': return left !== right;
  }
}
const logicWords: Record<LogicGate, string> = {
  AND: '左辺が直線で右辺が半円，出力端に小円なし',
  NAND: '左辺が直線で右辺が半円，出力端に小円あり',
  OR: '入力側が弧で出力側が尖り，出力端に小円なし',
  NOR: '入力側が弧で出力側が尖り，出力端に小円あり',
  XOR: '入力側に平行な二本の弧があり出力側が尖り，出力端に小円なし',
};
const fullUmlKey = 'プロジェクト・社員・プロジェクト内役割分担で一意に定まる';
const shortUmlKey = 'プロジェクト・社員で一意に定まる';
export const umlCases = [
  { participation: '0..*', department: '1', key: fullUmlKey },
  { participation: '1..*', department: '1', key: shortUmlKey },
  { participation: '0..*', department: '1..*', key: shortUmlKey },
] as const;

const figureInfo: Record<FigureKind, { count: number; alt(index: number): string }> = {
  tree: {
    count: treeCases.length,
    alt: index => '根は6。太枠は' + treeCases[index].target + '。' +
      [6,4,8,2,12,10,14].map(parent => {
        const children = treeEdges.filter(([node]) => node === parent);
        return parent + 'の左は' + children[0][1] + '，右は' + children[1][1] + '。';
      }).join(''),
  },
  postfix: {
    count: postfixCases.length,
    alt: index => '左から右へ矢印でつないだスタック。' +
      postfixFrames(index).map((stack, i) => (i + 1) + '番目は底から順に' + stack.join('，') + '。').join(''),
  },
  hash: {
    count: hashCases.length,
    alt: index => {
      const divisor = hashCases[index][1];
      return '縦の配列。位置は上から0，1，2，省略記号，' + (divisor - 2) + '，' + (divisor - 1) +
        '。各位置の配列要素は空欄で，省略位置のみ縦の省略記号がある。';
    },
  },
  flow: {
    count: flowCases.length,
    alt: index => {
      const { dividend, divisor, quotient, remainder } = flowCases[index];
      return '開始から' + quotient + '←0，' + remainder + '←' + dividend + 'を実行し，' + remainder + '＜' + divisor +
        'を判定する。Yesなら右に進み終了。Noなら下へ進み' + remainder + '←' + remainder + '−' + divisor + '，' +
        quotient + '←' + quotient + '＋1を順に行って左から判定へ戻る。';
    },
  },
  address: {
    count: addressCases.length,
    alt: index => {
      const model = addressCases[index], { address, target, kind } = model;
      const prefix = '命令部の右にあるアドレス部の値は' + address + '。';
      const reference = '主記憶のアドレス' + target + 'の「データ」の行へ矢印が向く。';
      if ('register' in model)
        return prefix + 'アドレス部と' + model.register + '（' + (target - address) + '）から加算記号へ進み，そこから' + reference;
      return prefix + (kind === 'indirect' ? 'アドレス部から主記憶のアドレス' + address + 'の行へ矢印が向く。その行の値' + target + 'から' : 'アドレス部から') +
        reference + '主記憶の上下と各行の間に省略記号。';
    },
  },
  cache: {
    count: 1,
    alt: () => 'CPUの枠内にキャッシュメモリ256kバイト。CPUの右には線で接続された主記憶256Mバイト。',
  },
  circuit: {
    count: circuitCases.length,
    alt: index => {
      const [first, upper, lower, last] = circuitCases[index];
      return '入力A・B，出力Y。左の素子（' + logicWords[first] + '）にAとBが入る。その出力が上と下の素子に分岐する。' +
        'Aの枝は上の素子（' + logicWords[upper] + '）にも入り，Bの枝は下の素子（' + logicWords[lower] + '）にも入る。' +
        '上と下の出力が右の素子（' + logicWords[last] + '）に入り，出力がYに向かう。';
    },
  },
  gate: {
    count: logicChoices.length,
    alt: index => '入力はAとB，出力はY。' + logicWords[logicChoices[index]] + 'の素子。',
  },
  uml: {
    count: umlCases.length,
    alt: index => {
      const { participation, department, key } = umlCases[index];
      return '中央にプロジェクト参画，上にプロジェクト内役割分担，左にプロジェクト，下に社員，社員の右に部門。' +
        '参画と役割分担，参画とプロジェクトの関係は，それぞれ参画側が0..*で，反対の端が1。' +
        '参画と社員の関係は参画側が' + participation + '，社員側が1。社員から部門へ「所属する」の関係があり，社員側は1..*，部門側は' +
        department + '。参画に破線でつながる注記は「制約：' + key + '」。';
    },
  },
};

export const legacy2013SpringAm0126Figures: BookletFigureDefinition[] =
  (Object.keys(spring2013Am0126Profiles) as FigureKind[]).map(kind => {
    const { count, alt } = figureInfo[kind];
    return {
      profile: spring2013Am0126Profiles[kind], domain: [[0, count - 1]],
      validate: values => { validIndex(values, count, 'FIGURE_DOMAIN'); },
      alt: values => alt(validIndex(values, count, 'FIGURE_DOMAIN')),
    };
  });

export function spring2013AmDiagram(kind: FigureKind, value: number, caption: string) {
  const profile = spring2013Am0126Profiles[kind], info = figureInfo[kind];
  const values = [value];
  return { ...figure(profile, values, caption, info.alt(validIndex(values, info.count, 'FIGURE_DOMAIN'))),
    captionPresentation: 'accessible' as const };
}
