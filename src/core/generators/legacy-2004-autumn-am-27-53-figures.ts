import { code, figure, p, strings } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { finite, original } from './legacy-2004-autumn-am-27-53-shared';

function managed<T extends { alt: string }>(profile: string, caption: string, make: (index: number) => T) {
  const panel = (values: number[]) => make(selectCase(values, 4));
  const validate = (values: number[]) => { selectCase(values, 4); };
  const alt = (values: number[]) => panel(values).alt;
  const definition = { profile, domain: [[0, 3]], validate, alt } as const satisfies BookletFigureDefinition;
  return { ...definition, panel, block: (index: number) => figure(profile, [index], caption, alt([index])) };
}

const csvCases = [
  { rows: [[2, 2, 4], [1, 3, 4], [2, 1, 1]], first: ['A1', 'C3'], second: ['B1', 'B3'] },
  { rows: [[1, 2, 4], [3, 2, 1], [3, 1, 4]], first: ['C2', 'A3'], second: ['A1', 'B2'] },
  { rows: [[2, 4, 1], [1, 2, 3], [3, 1, 2]], first: ['B1', 'C3'], second: ['A2', 'B3'] },
  { rows: [[3, 1, 2], [4, 2, 3], [2, 1, 1]], first: ['A2', 'C1'], second: ['B2', 'C3'] },
] as const;

export const csvWorksheet = managed('legacy-2004-autumn-am-46-csv-worksheet', 'ワークシート', () => ({
  columns: ['A', 'B', 'C', 'D'], rows: ['1', '2', '3'],
  alt: '行番号1、2、3、列見出しA、B、C、Dのワークシート。各セルは空欄で、答えを表示するセルD3の枠が太い。',
}));

type Count = '1' | '*';
type Relationship = readonly [Count, Count];
type Schema = readonly [Relationship, Relationship];
const oneToOne: Schema = [['1', '1'], ['1', '1']];
const schoolSchemas: readonly Schema[] = [
  [['1', '*'], ['*', '1']],
  [['1', '1'], ['*', '1']],
  [['1', '1'], ['1', '*']],
  [['*', '1'], ['*', '1']],
];
export const schoolEntityFigure = managed('legacy-2004-autumn-am-49-school-entity', '学校のE-R図 (a)・(b)', index => {
  const schemas = [oneToOne, schoolSchemas[index]];
  return { schemas, alt: schemas.map(([left, right], at) => '(' + 'ab'[at] + ') 教師 ' + left.join('―') +
    ' クラス ' + right.join('―') + ' 教室。').join('\n') };
});

export const legacy2004AutumnAm2753Figures = [csvWorksheet, schoolEntityFigure] as const;
const schoolReasons = [
  '(b)では教師一人に複数のクラスが対応し、クラス一つの教師は一人である。教師と教室を同時に固定しても、同じ教室で複数クラスを担当できるため一つに決まるとは限らない。',
  '(b)でも教師からクラスへの対応は1対1で、対応するクラスは一つに決まる。教室が複数のクラスに使われても、教師まで分かればクラスの候補は増えない。',
  '(b)ではクラス一つに複数の教室が対応できる。一つのクラスに対応する教師は一人で、教師からクラスへの対応も1対1である。',
  '(b)ではクラス一つに複数の教師が対応できる。教師一人から見た担当クラスは一つなので、教師を決めればクラスを特定できる。',
];

export const figureDefinitions = [
  finite(46, 'CSVの三行の数字とD列の参照先', 'ア',
    '改行コードによる左端への移動、列A〜Cの入力、D1・D2の計算とD3の再計算、正誤判定と昇順4択を保持する。公式付録p.36〜38からセル番地と再計算の規則だけを独立した参照本文で記述する。', index => {
      const { rows, first, second } = csvCases[index];
      const valueAt = (address: string) => rows[Number(address[1]) - 1][address.charCodeAt(0) - 'A'.charCodeAt(0)];
      const left = first.map(valueAt).reduce<number>((a, b) => a + b, 0), right = second.map(valueAt).reduce<number>((a, b) => a + b, 0);
      const d3 = left + right;
      const csv = rows.map(row => row.join(',')).join(' Cᵣ ') + ' Cᵣ';
      const listing = [
        'CSV形式のデータ：' + csv,
        'セルD1の計算式：' + first.join('+'),
        'セルD2の計算式：' + second.join('+'),
        'セルD3の計算式：D1+D2',
      ].join('\n');
      return { prompt: [p(original(46).prompt), code(listing, 'text'), csvWorksheet.block(index)], choices: strings(original(46).choices),
        correctIndex: original(46).choices.indexOf(String(d3)),
        explanation: 'カンマで右の列へ、Cᵣで次の行のA列へ移る。入力順にセルへ割り当てると、D1は' +
          first.map(valueAt).join('＋') + '＝' + left + '、D2は' + second.map(valueAt).join('＋') + '＝' + right +
          'となる。D3はD1とD2を参照するため、' + left + '＋' + right + '＝' + d3 + 'を表示する。',
        contexts: [{ title: '表計算ソフトの機能・用語', presentation: 'text', blocks: [
          p('列名（A、B、C、…）と行番号（1、2、3、…）の組でセルを表す。例えばB2はB列2行目で、式にB2を書くとそのセルの値を参照する。+ は参照先の数値を加える演算である。'),
          p('この問題のCSVでは行の途中のカンマで一列右へ進み、Cᵣが現れると次の行のA列へ移る。'),
          p('式を入力すると直ちに結果を表示する。参照するセルの値が変わると式も再計算される。列の左から右へ進み、各列の中では上から下へ一度ずつ処理する。このためD列ではD1、D2、D3の順に再計算される。'),
        ] }] };
    }),
  finite(49, '教師・クラス・教室間の多重度', 'イ',
    '教師・クラス・教室の三つの実体と二つの図、1と*の多重度を維持し、(b)の関係を組み替えて元の四種類の読み方を検査する。', index => {
      const choices = [...original(49).choices];
      if (index === 1) choices[0] = '(a)では教師か教室から対応するクラスを一つに特定でき，(b)では教師から対応するクラスを一つに特定できる。';
      if (index >= 2) choices[0] = '(a)では教師か教室から対応するクラスを一つに特定できるが，(b)では教師だけでは対応するクラスを一つに特定できない。';
      return { prompt: [p(original(49).prompt), schoolEntityFigure.block(index)], choices: strings(choices),
        correctIndex: [1, 0, 2, 3][index], explanation: schoolReasons[index] };
    }),
];
