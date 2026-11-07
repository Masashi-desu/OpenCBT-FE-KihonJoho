import { code, field, p, type GeneratedBody } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { answerBody, choiceBankText, heading, pageAlt, selectCase, selectionInstruction, springLanguageDiagram } from './legacy-2016-spring-pm-09-13-support';
import { blockText, type SourcePage } from './legacy-2016-autumn-pm-09-13-support';

const originalPattern = [[1, 1], [1, 0]];
const patterns = [
  [[0, 1, 0], [1, 0, 1]],
  [[1, 1, 1], [1, 0, 1]],
  [[0, 1, 0], [1, 1, 1], [1, 0, 1]],
  [[1, 1, 1], [1, 0, 1], [1, 0, 1]],
];
const patternOrder = [1, 0, 2, 3];
const areas = [
  { label: '①', row: 2, column: 1, size: 1 },
  { label: '②', row: 4, column: 0, size: 2 },
  { label: '③', row: 4, column: 2, size: 2 },
  { label: '④', row: 6, column: 1, size: 1 },
];

function patternProgram(pattern: number[][]) {
  return `int pat[${pattern.length}][${pattern[0].length}] = {\n` +
    pattern.map(row => '    { ' + row.join(', ') + ' }').join(',\n') + '\n};';
}
const optionsA = [
  'p_rn += rn;\np_cn += cn;', 'p_rn *= rn;\np_cn *= cn;',
  'rn += p_rn;\ncn += p_cn;', 'rn *= p_rn;\ncn *= p_cn;',
];
const optionsBCD = ['0', '1', 'pat[i][j]', 'pat[i % d][j % d]', 'pat[i / d][j / d]', 'pat[i % p_rn][j % p_cn]', 'pat[i / p_rn][j / p_cn]'];

export function spring2016Pm9Grid(pattern: number[][], depth: number): string[] {
  const rows = pattern.length, columns = pattern[0].length;
  function star(row: number, column: number, level: number): boolean {
    return level === 0 || (
      pattern[row % rows][column % columns] === 1 &&
      star(Math.floor(row / rows), Math.floor(column / columns), level - 1)
    );
  }
  return Array.from({length: rows ** depth}, (_, r) =>
    Array.from({length: columns ** depth}, (_, c) => star(r, c, depth) ? '*' : ' ').join(''));
}
const example = [0, 1, 2, 3].map(depth => spring2016Pm9Grid(originalPattern, depth));
const describe = (grid: string[]) => grid.map(row => row.replaceAll(' ', '□')).join('／');
export const spring2016Pm9Profiles = ['depth-examples', 'replacement-rule', 'substitution-choice', 'new-pattern-result'] as const;

export function spring2016Pm9Figure(profile: string, values: number[]) {
  const index = selectCase(values, 8);
  const target = { row: 2, column: index < 4 ? 1 : 0 };
  const replacement = patternOrder[index % 4];
  const result = spring2016Pm9Grid(patterns[replacement], 3);
  switch (profile) {
    case 'depth-examples':
      return {kind: profile, grids: example, alt: '□は空白文字。' + example.map((grid, i) => `深さ${i}：${describe(grid)}`).join('。')};
    case 'replacement-rule':
      return {kind: profile, grid: example[1], alt: '生成パターン例は上段**、下段*□。深さd−1の*はこの生成パターンへ、空白文字は同じ2行2列のすべて空白の行列へ置換する。'};
    case 'substitution-choice':
      return {kind: profile, before: example[2], after: example[3], target, areas,
        alt: `□は空白文字。深さ2は${describe(example[2])}、斜線は上から${target.row + 1}行目、左から${target.column + 1}列目の1マス。深さ3は${describe(example[3])}。` +
          areas.map(({label, row, column, size}) => `${label}は上から${row + 1}行目・左から${column + 1}列目を左上とする${size}行${size}列。`).join('')};
    case 'new-pattern-result':
      return {kind: profile, grid: result, alt: `深さ3、${result.length}行${result[0].length}列。□は空白文字。` + describe(result)};
    default: throw new Error('FIGURE_PROFILE');
  }
}

const program = `#include <stdio.h>

${patternProgram(originalPattern)}
int p_rn = sizeof pat / sizeof pat[0];
int p_cn = sizeof pat[0] / sizeof pat[0][0];

void print_frac(int);
int exists_at(int, int, int);

void print_frac(int d) {
    int i, j, rn, cn;

    rn = cn = 1;
    for (i = 0; i < d; i++) {
        [a]
    }
    for (i = 0; i < rn; i++) {
        for (j = 0; j < cn; j++) {
            putchar(exists_at(i, j, d) ? '*' : ' ');
        }
        putchar('\\n');
    }
}

int exists_at(int i, int j, int d) {
    if (d == 0) {
        return [b];
    } else if (exists_at(i / p_rn, j / p_cn, d - 1) == 0) {
        return [c];
    } else {
        return [d];
    }
}`;

function pages(index: number): SourcePage[] {
  const fig = (name: typeof spring2016Pm9Profiles[number], caption: string) =>
    springLanguageDiagram(9, name, index, caption, spring2016Pm9Figure(name, [index]).alt);
  return [
    { page: 41, blocks: [
      p(selectionInstruction),
      p('問9 次のCプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
      heading('〔プログラムの説明〕'),
      p('図形の一部を拡大すると，再び同じパターンの図形が現れる自己相似性をもつ図形を，フラクタル図形と呼ぶ。関数print_fracは，文字“*”及び空白文字を二次元の格子状に並べてフラクタル図形を描画するプログラムである。'),
      p('(1) 関数print_fracが描画するフラクタル図形の例を，図1に示す。'),
      fig('depth-examples', '図1 関数print_fracが描画するフラクタル図形の例'),
      p('① 深さが0の図形は，1行1列の文字“*”から成る図形である。'),
      p('② 深さが1以上の図形は，深さが0の図形に対して，(2)で説明する生成規則を，深さの回数だけ繰り返し適用して得られる図形である。'),
      p('(2) 深さがd（1以上）の図形は，深さがd−1の図形を構成する一つ一つの文字を，文字“*”であるか空白文字であるかに応じて，図2に示す生成規則のとおりに，文字の行列で置換したものである。'),
    ] },
    { page: 42, blocks: [
      fig('replacement-rule', '図2 フラクタル図形の生成規則'),
      p('① 文字“*”の部分は，生成パターンと呼ぶ文字の行列で置換する。'),
      p('② 空白文字の部分は，生成パターンと同じ大きさで全ての要素が空白文字の行列で置換する。'),
      p('(3) 生成パターンは，二次元の配列変数patによって与える。patの各要素の値は，空白文字を表す0，又は文字“*”を表す1である。patの行数，列数及び内容を変更することで，異なるフラクタル図形を描画することができる。'),
      p('(4) 関数print_fracの仕様：深さがdのフラクタル図形を描画する。引数dはフラクタル図形の深さ。'),
      p('(5) 関数print_fracで使用している関数exists_atの仕様：深さがdのフラクタル図形のi行j列目が空白文字であるか文字“*”であるかを判定する。引数iは行数（一番上の行を0行目とする），jは列数（一番左の列を0列目とする），dはフラクタル図形の深さ。返却値は判定結果（0：空白文字，1：文字“*”）。'),
      p('ここで，関数の引数に誤りはないものとする。'),
    ] },
    { page: 43, blocks: [heading('〔プログラム〕'), code(program, 'c')] },
    { page: 44, blocks: [
      p('設問1 深さが2の図形と深さが3の図形は次のとおりである。深さが3の図形において，深さが2の図形の斜線部を置換した部分として正しい答えを，解答群の中から選べ。'),
      fig('substitution-choice', '深さ2の斜線部と深さ3の解答候補'),
      p('設問2 配列変数patを変更して，深さが3の図形を描画したところ，次のとおりになった。配列変数patの変更内容として正しい答えを，解答群の中から選べ。'),
      fig('new-pattern-result', '変更後のpatで描画した深さ3の図形'),
    ], banks: [choiceBankText('設問1', areas.map(area => area.label))] },
    { page: 45, blocks: [p('設問3 プログラム中の［a］〜［d］に入れる正しい答えを，解答群の中から選べ。')],
      banks: [choiceBankText('設問2', patterns.map(patternProgram)), choiceBankText('a', optionsA), choiceBankText('b〜d', optionsBCD)] },
  ];
}
export function spring2016Pm9OriginalPageAlt() {
  const original = pages(0), alt = pageAlt(original);
  const [question, diagram, nextQuestion, nextDiagram] = original[3].blocks.map(blockText);
  alt[44] = [question, diagram, ...original[3].banks!, nextQuestion, nextDiagram].join('\n\n');
  return alt;
}

function build(values: number[]): GeneratedBody {
  const index = selectCase(values, 8);
  const patternIndex = patternOrder[index % 4];
  const target = { row: 2, column: index < 4 ? 1 : 0 };
  const areaIndex = areas.findIndex(area => area.row === target.row * 2 && area.column === target.column * 2 && area.size === 2);
  const selected = patterns[patternIndex];
  return answerBody(pages(index).flatMap(page => page.blocks), [
    {names: ['section1'], labels: ['設問1'], options: areas.map(area => area.label), keys: [areaIndex]},
    {names: ['section2'], labels: ['設問2'], options: patterns.map(patternProgram), keys: [patternIndex], language: 'c'},
    {names: ['a'], labels: ['設問3 a'], options: optionsA, keys: [3], language: 'c'},
    {names: ['b', 'c', 'd'], labels: ['設問3 b', '設問3 c', '設問3 d'], options: optionsBCD, keys: [1, 0, 5], language: 'c'},
  ], `設問1：上から${target.row + 1}行目、左から${target.column + 1}列目の1マスは，縦横とも2倍の範囲へ展開される。左上は0始まりで(${2 * target.row}, ${2 * target.column})、範囲は2行2列なので${areas[areaIndex].label}。①と④は1マスだけである。\n設問2：図は${selected.length ** 3}行${selected[0].length ** 3}列なので，1回分は${selected.length}行${selected[0].length}列。図をその行数・列数に沿って大きなブロックに分け，星のあるブロックを1と読むと，生成パターンは${selected.map(row => row.join(' ')).join('／')}になる。\n設問3：aは深さ1段ごとに行数と列数をパターンのサイズで乗算する。p_rnとp_cnそのものは変更しない。bは深さ0の唯一の文字*なので1。cは親が空白なら子も空白なので0。dは親が*のとき，余りでパターン内の行・列を得る。商は親の位置を求めるのに使う。`);
}
export const legacy2016SpringPm9Definition: AfternoonBookletDefinition = {
  source: '2016h28h-fe-pm-9', title: '旧制度・午後：Cによるフラクタル図形の描画',
  fields: [field('描画条件の番号', 0, 7)], reference: [0],
  sourceAnswer: '設問1 ウ／設問2 イ／設問3 a=エ，b=イ，c=ア，d=カ', version: '3.6.0',
  publicNotes: '再帰プログラムと解答群の順序を保ち，斜線マスと変更後の生成パターンを変えて図形を描き直します。',
  notes: 'PDF p41–45、原6欄。深さ0の*、親空白、0始まり、引数に誤りなしを保持。8条件は斜線座標2種×行列4種。図形を展開する独立置換モデルとC11の全プログラム択を照合する。番号と図中の候補順序を固定。原図の行・列の刻みを保持し，最大27×27、深さ3。追加の丸めなし。',
  build,
};
