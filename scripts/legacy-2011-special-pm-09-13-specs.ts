import type { Stage3AfternoonQuestionSpec } from './legacy-afternoon-booklet-records';
import { special2011PmLanguageDrafts } from '../src/core/generators/legacy-2011-special-pm-09-13';

const metadata = [
  { topics: ['プログラミング', 'C', '配列'], keywords: ['空席', '構造体', 'ナル文字', '行優先', '座席種別', '連続数'] },
  { topics: ['プログラミング', 'COBOL', '決定表'], keywords: ['株主優待', 'EVALUATE', 'ANY', 'OCCURS', '保有期間', '棒グラフ'] },
  { topics: ['プログラミング', 'Java', '連結リスト'], keywords: ['配列', 'バケット', '末尾参照', 'charAt', 'append', 'クラス'] },
  { topics: ['プログラミング', 'CASL II', 'ビット演算'], keywords: ['論理シフト', 'フラグ', '時計回り', '部分回転', 'レジスタ', 'メモリ'] },
  { topics: ['プログラミング', '表計算', '与信管理'], keywords: ['信用度', '垂直照合', '表引き', '条件付合計', '売掛金', '支払いサイト'] },
];

function compactRotationChoiceAlt(alt: string) {
  const heading = '\n\n解答群\n';
  const boundary = alt.lastIndexOf(heading);
  if (boundary < 0) throw new Error('問12の図形の解答群が見つかりません');
  const before = alt.slice(0, boundary + heading.length);
  const options = alt.slice(before.length).split(/\n(?=[イウエ] 図形\n)/);
  if (options.length !== 4) throw new Error('問12の図形の解答群は4択です');
  const compact = options.map((option, i) => {
    const label = 'アイウエ'[i];
    const rows = [...option.matchAll(/^[01]{16}$/gm)].map(match => match[0]);
    if (!option.startsWith(label + ' 図形\n') || rows.length !== 16)
      throw new Error('問12の図形は1選択肢につき16語です');
    const runs: { first: number; last: number; bits: string }[] = [];
    for (const [index, bits] of rows.entries()) {
      const previous = runs.at(-1);
      if (previous?.bits === bits) previous.last = index;
      else runs.push({ first: index, last: index, bits });
    }
    return [label + ' 図形', ...runs.map(({ first, last, bits }) =>
      '語' + first + (first === last ? '' : '～' + last) + '：' + bits)].join('\n');
  });
  return before + '1＝黒、0＝白。各行は左からビット15〜0。語0が最上段。\n' + compact.join('\n');
}

export const special2011Pm09To13Specs: Stage3AfternoonQuestionSpec[] = special2011PmLanguageDrafts.map((draft, index) => {
  const { definition } = draft;
  const originalPageAlt = draft.originalPageAlt();
  if (index + 9 === 12) originalPageAlt[58] = compactRotationChoiceAlt(originalPageAlt[58]);
  for (const [page, alt] of Object.entries(originalPageAlt)) {
    const length = [...alt].length;
    if (length <= 100 || length > 2000) throw new Error(`原資料p.${page}の代替テキストが規定外です（${length}字）`);
  }
  return { number: index + 9, title: definition.title, pages: Object.keys(originalPageAlt).map(Number),
    ...metadata[index], definition, original: definition.build(definition.reference), originalPageAlt };
});
