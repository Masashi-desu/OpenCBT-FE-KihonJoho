import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, table } from './definition';
import { autumn2015PmPageAssetId, autumn2015PmReference } from './legacy-2015-autumn-pm-materials';
import { autumn2015Pm0508Banks as banks, autumn2015Pm0508Source as source } from './legacy-2015-autumn-pm-05-08-source';
import {
  autumn2015Pm0508Body as body, autumn2015Pm0508Choices as choices, autumn2015Pm0508Figure as figure,
  autumn2015Pm0508Index as index, autumn2015Pm0508Prompt as prompt,
} from './legacy-2015-autumn-pm-05-08-shared';

const searchCases = [
  ['ABCXBBACABACADEC', 'ABAC'],
  ['BCXABACBBAACXBCA', 'ABAC'],
  ['XXBCAXXCAACBAXAA', 'ACBA'],
  ['ABCAXBBABACACBDB', 'BABA'],
  ['ACACBXCCABCBAABX', 'CABC'],
] as const;
const reference = autumn2015PmReference('共通に使用される擬似言語の記述形式', [3, 4]);

export function autumn2015Pm8Search(text: string, pattern: string) {
  if (!/^[A-Z]+$/.test(text) || !/^[A-Z]+$/.test(pattern)) throw new Error('PARAMETER_CONSTRAINT');
  const skip = Array<number>(26).fill(pattern.length);
  const letterIndex = (char: string) => char.charCodeAt(0) - 'A'.charCodeAt(0);
  for (let i = 0; i < pattern.length - 1; i++) skip[letterIndex(pattern[i])] = pattern.length - 1 - i;
  let alpha = 0, beta = 0;
  const ends: number[] = [], matches: number[] = [];
  for (let last = pattern.length - 1; last < text.length; last += skip[letterIndex(text[last])]) {
    alpha++;
    ends.push(last + 1);
    let match = 0;
    while (match < pattern.length && text[last - match] === pattern[pattern.length - 1 - match]) match++;
    beta += match;
    matches.push(match);
    if (match === pattern.length) return { alpha, beta, found: last - pattern.length + 2, ends, matches, skip };
  }
  return { alpha, beta, found: -1, ends, matches, skip };
}

export function autumn2015Pm8Model(values: number[]) {
  const [text, pattern] = searchCases[index(values, searchCases.length)];
  return { text, pattern, ...autumn2015Pm8Search(text, pattern) };
}

type ArrayCell = { readonly index: number | null; readonly value: string | number | { readonly kind: 'ellipsis' } };
type ArrayRow = { readonly label: string; readonly alignToTextIndex: number; readonly cells: readonly ArrayCell[] };
export function autumn2015Pm8Rows(values: number[], id: 'q8-f1' | 'q8-f2' | 'q8-f3' | 'q8-f4'): readonly ArrayRow[] {
  const m = autumn2015Pm8Model(values);
  if (id !== 'q8-f4') return source[id].rows;
  return [[m.text, 'Text[]'], [m.pattern, 'Pat[]']].map(([chars, label]) => ({
    label, alignToTextIndex: 1, cells: [...chars].map((value, i) => ({ index: i + 1, value })),
  }));
}

const codeAlt = source['q8-program'].lines.map(line =>
  '　'.repeat(line.depth) +
  (line.kind === 'ifStart' ? '▲ ' : line.kind === 'ifEnd' ? '▼' :
    line.kind.endsWith('Start') || line.kind === 'loopEnd' ? '■ ' : '・') +
  line.text + ('labelArrow' in line ? ' ← ' + line.labelArrow.label : '')).join('\n');
const arraysAlt = (rows: readonly ArrayRow[]) => rows.map(row =>
  (row.label || 'Pat[]') + '、開始位置' + row.alignToTextIndex + '：' + row.cells.map(cell =>
    cell.index === null ? '…' : cell.index + '=' + cell.value).join('、')).join('。') + '。';

function build(values: number[]) {
  const m = autumn2015Pm8Model(values);
  const result = body(prompt(8, values, id => {
    switch (id) {
      case 'q8-signature': return table(source[id].caption, [...source[id].columns], source[id].rows.map(row => [...row]));
      case 'q8-f1':
      case 'q8-f2':
      case 'q8-f3':
      case 'q8-f4': {
        const alt = arraysAlt(autumn2015Pm8Rows(values, id));
        return figure(8, id.slice(3), values, source[id].caption, id === 'q8-f3' ? alt + source[id].arrows.map(arrow =>
          arrow.label + ('textIndex' in arrow ? '比較：Text[' + arrow.textIndex + ']と第' + (arrow.patternRow + 1) +
            '段のPat[' + arrow.patternIndex + ']' : '右へ移動：Text[' + arrow.fromStartTextIndex + ']からText[' +
            arrow.toStartTextIndex + ']へ')).join('。') + '。' : alt);
      }
      case 'q8-program':
        return figure(8, 'program', values, '〔プログラム〕', codeAlt);
      default: throw new Error('SOURCE_FORMAT');
    }
  }, text => text.replace('“ABCXBBACABACADEC”', '“' + m.text + '”').replace('“ABAC”', '“' + m.pattern + '”')), [
    { id: 'ab', choices: choices(banks[8].ab) }, { id: 'cde', choices: choices(banks[8].cde) },
    { id: 'f', choices: choices(banks[8].f) },
  ], [
    { id: 'a', bank: 'ab', correct: 3 }, { id: 'b', bank: 'ab', correct: 5 },
    ...[m.alpha, m.beta, m.found].map((value, i) => ({ id: 'cde'[i], bank: 'cde', correct: value - 3 })),
    { id: 'f', bank: 'f', correct: 1 },
  ],
  '検索文字列の末尾だけにある文字や現れない文字の移動量はPatLenなので，まず26要素全てをPatLenで初期化する（a）。' +
  'その後Pat[1]からPat[PatLen−1]までを昇順に調べ，その文字にPatLen−Iを入れる（b）。重複する文字は末尾に最も近い位置の値で上書きされる。' +
  '照合窓の末尾PLastは' + m.ends.join('→') + 'となり，αは' + m.alpha + '回。右から比較して連続で一致した個数は各窓で' +
  m.matches.join('，') + '，βはその合計' + m.beta + '回である。失敗した比較では内側の反復に入らない。' +
  '完全一致したときのPTextは一致部分の1始まりの先頭位置' + m.found + 'である。ずらす基準は不一致になった位置ではなくText[PLast]。' +
  'γを逆順にすると重複文字で末尾から遠い値が残る。図1の例では本来の窓末尾4→8→9が4→8→11となり，実際には含まれる検索文字列を飛ばして−1を返す。' +
  '全ての文字が一致した場合だけ位置を返す判定は変わらない。BM法はここではBoyer-Moore-Horspool法を指す。');
  result.contexts = [reference];
  return result;
}

export const legacy2015AutumnPm8Definition: AfternoonBookletDefinition = {
  source: '2015h27a-fe-pm-8', title: 'Boyer-Moore-Horspool法を用いた文字列検索',
  version: '3.7.0', reference: [0], fields: [field('実際に照合する対象・検索文字列', 0, searchCases.length - 1)],
  sourceAnswer: 'エ／カ／ア／オ／キ／イ',
  notes: '物理p34–39、6欄、a/b共有6択、c/d/e共有10択、f3択。添字1始まり、英大文字26字、長さ1以上、末尾をSkipの更新から除外、右からの照合、窓末尾Text[PLast]で次の移動、γ/α/βと−1を保持。5条件の図4は文字置換だけでなく照合窓・一致回数・返却位置が変化。全条件の実際の表示値を独立トレースし、素朴な検索・短文字列全列挙、長さ境界、逆順の偽陰性、全択を検査する。',
  publicNotes: '文字列検索の規則，疑似言語と図の形式を保ち，実際に照合する文字列・移動経路・解答を変更しました。',
  fixedReferenceAssetIds: [autumn2015PmPageAssetId(3), autumn2015PmPageAssetId(4)],
  build,
};
