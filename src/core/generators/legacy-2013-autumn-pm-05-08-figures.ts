import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { autumn2013Pm0508Banks } from './legacy-2013-autumn-pm-05-08-source';
import {
  autumn2013Pm5FlowEdges, autumn2013Pm5Tests, autumn2013Pm6DesignPlan, autumn2013Pm6ProgrammingPlan, autumn2013Pm7Stocks,
} from './legacy-2013-autumn-pm-05-08-model';
import {
  autumn2013Pm5Program, autumn2013Pm8CompressSignature, autumn2013Pm8CompressProgram, autumn2013Pm8DecompressSignature,
  autumn2013Pm8DecompressHead, autumn2013Pm8Alpha, autumn2013Pm8DecompressTail,
} from './legacy-2013-autumn-pm-05-08-programs';

export const autumn2013Pm5FlowLabels: Readonly<Record<string, string>> = {
  S: 'S', '1': '①', '2': '②', c: '空欄c', upper: '網掛けの上のノード',
  middle: '網掛けの中央のノード', d: '空欄d', '7': '⑦', e: '空欄e',
  left: '網掛けの左のノード', f: '空欄f', '9': '⑨', E: 'E',
};
export const autumn2013Pm7FormulaAlt =
  '総在庫数＝Σ（拠点iの回転在庫数）＋〔Σ（拠点iの安全在庫数）÷Σ（√拠点iの需要比率）〕。三つの総和はいずれもi＝1からN。';

export const autumn2013Pm8ExamplePlain = 'ABCDEFABCDABCDEF';
const compressAlphaAlt = autumn2013Pm8DecompressHead + '\nαの部分（点線枠）\n' + autumn2013Pm8Alpha + '\n' + autumn2013Pm8DecompressTail;
export const autumn2013Pm8DecompressAlt = autumn2013Pm8DecompressSignature + '\n' + compressAlphaAlt;

export function autumn2013Pm7StockRows(index: number) {
  const { k, l } = autumn2013Pm7Stocks[index];
  return k.map(([kTurn, kSafe, kRatio], i) => [
    '営業所' + 'PQRST'[i], String(kTurn), String(kSafe), kRatio.toFixed(1),
    String(l[i][0]), String(l[i][1]), l[i][2].toFixed(1),
  ]).concat([['合計', '網掛け', '網掛け', '1.0',
    String(l.reduce((sum, row) => sum + row[0], 0)), String(l.reduce((sum, row) => sum + row[1], 0)), '1.0']]);
}

type Details = { caption: string; max?: number; alt: (index: number) => string };
export const autumn2013Pm0508Drawings = {
  '5-condition': { caption: '単独条件と複数条件の例',
    alt: () => '例：（a＞b）and（a＜c）。両端の括弧内がそれぞれ単独条件で，andを含む全体が複数条件。' },
  '5-program-example': { caption: '図1 テスト対象のプログラムの例', alt: () => autumn2013Pm5Program(false) },
  '5-program-numbered': { caption: '図2 図1にノード番号を付与したプログラムの例', alt: () => autumn2013Pm5Program(true) },
  '5-test-cases': { caption: '表1 テストケースの例', max: 2,
    alt: (i: number) => 'テストデータ。変数｜x｜a｜b｜c｜d\n' + autumn2013Pm5Tests[i].map((row, n) =>
      'テストケース' + '①②'[n] + '｜' + row.join('｜')).join('\n') },
  '5-control-flow': { caption: '図3 図2のプログラムの例に対応する制御フローグラフ',
    alt: () => autumn2013Pm5FlowEdges.map(([from, to]) => autumn2013Pm5FlowLabels[from] + 'から' + autumn2013Pm5FlowLabels[to]).join('、') +
      '。凡例：丸はノード、矢印はエッジ。注記：網掛けの部分は表示していない。' },
  '6-work-plan': { caption: '表1 内部設計工程とプログラミング工程の作業計画',
    alt: () => '工程｜項目｜第1週｜第2週｜第3週｜第4週｜第5週｜第6週｜合計\n' +
      '内部設計：線表 第1週から第3週。計画本数 ' + autumn2013Pm6DesignPlan.join('、') + '、空欄3週、合計120本。計画工数 400、400、160、空欄3週、合計960人時。\n' +
      'プログラミング：線表 第3週から第6週。計画本数 空欄2週、' + autumn2013Pm6ProgrammingPlan.join('、') + '、合計120本。計画工数 空欄2週、240、400、400、160、合計1,200人時。' },
  '6-short-plan': { caption: '表3 プログラミング期間を短縮する作業計画',
    alt: () => '週｜第3週｜第4週｜第5週｜第6週。計画本数：第3週は10本，第4週から第6週は［e］。' },
  '6-schedule-option': { caption: '第4週〜第6週の計画本数', max: 6,
    alt: (i: number) => autumn2013Pm0508Banks['6e'][i].split('｜').map((v, j) => '第' + (j + 4) + '週：' + v + '本').join('、') },
  '7-stock-formula': { caption: '在庫拠点を集約したときの総在庫数の算出式', alt: () => autumn2013Pm7FormulaAlt },
  '7-stock-table': { caption: '表1 商品Kと商品Lの各営業所の在庫数及び需要比率', max: 2,
    alt: (i: number) => '営業所｜商品K（回転在庫数｜安全在庫数｜需要比率）｜商品L（回転在庫数｜安全在庫数｜需要比率）\n' +
      autumn2013Pm7StockRows(i).map(row => row.join('｜')).join('\n') },
  '8-compression-example': { caption: '図1 文字列の圧縮例',
    alt: () => '圧縮前（Plaindata）：ABCDEFABCDABCDEF。7文字目からのABCD（s1）は、圧縮後の$FD（s1′）に対応。11文字目からのABCDEF（s2）は、圧縮後の$JF（s2′）に対応。圧縮後（Compresseddata）：ABCDEF$FD$JF。' },
  '8-first-compress-position': { caption: '図2 最初の圧縮文字位置',
    alt: () => '圧縮前の文字列：ABCDEFABCDABCDEF。左から5文字目のEを最初の圧縮文字位置とする矢印。' },
  '8-first-comparison-position': { caption: '図3 最初の比較文字位置',
    alt: () => '圧縮前の文字列：ABCDEFABCDABCDEF。圧縮文字位置は5文字目のE。最初の比較文字位置はその4文字前のA。' },
  '8-comparison-search': { caption: '図4 文字列の比較',
    alt: () => '圧縮前の文字列：ABCDEFABCDABCDEF。圧縮文字位置は7文字目のA。比較文字位置p₁は3文字目のC、p₂は2文字目のB、p₃は1文字目のA。両ABCDに下線。' },
  '8-longest-reference': { caption: '図5 圧縮する文字並びの対応例',
    alt: () => '圧縮前の文字列：ABCDEFABCDABCDEF。先頭から順に（s0）ABCDEF，（s1）ABCD，（s2）ABCDEF。圧縮文字位置は11文字目。10文字前にある（s0）の先頭へ矢印。' },
  '8-compress-signature': { caption: 'プログラム1 Compress の宣言部', alt: () => autumn2013Pm8CompressSignature },
  '8-compress-program': { caption: 'プログラム1 Compress の処理部', alt: () => autumn2013Pm8CompressProgram },
  '8-decompress-program': { caption: 'プログラム2 Decompress', alt: () => autumn2013Pm8DecompressAlt },
} satisfies Record<string, Details>;
export type Autumn2013Pm0508Drawing = keyof typeof autumn2013Pm0508Drawings;

export function autumn2013Pm0508Profile(id: Autumn2013Pm0508Drawing) {
  return 'legacy-2013-autumn-pm-' + id;
}

const drawingIds = Object.keys(autumn2013Pm0508Drawings) as Autumn2013Pm0508Drawing[];
export const legacy2013AutumnPm0508Figures: BookletFigureDefinition[] = drawingIds.map(id => {
  const { alt, max = 0 }: Details = autumn2013Pm0508Drawings[id];
  return {
    profile: autumn2013Pm0508Profile(id), domain: [[0, max]],
    validate([index]) {
      if (!Number.isSafeInteger(index) || index < 0 || index > max) throw Error('FIGURE_PROFILE');
    },
    alt: ([index]) => alt(index),
  };
});

export function autumn2013Pm0508Figure(id: Autumn2013Pm0508Drawing, index = 0) {
  const { caption, alt }: Details = autumn2013Pm0508Drawings[id];
  return figure(autumn2013Pm0508Profile(id), [index], caption, alt(index));
}
