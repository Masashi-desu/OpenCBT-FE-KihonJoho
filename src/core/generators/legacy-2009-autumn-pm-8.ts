import { code, p } from './definition';
import { bankAt, common, indexOfCase, pairedAnswers, pseudoAssets, pseudoReference, readPrompt, type Banks, type Page } from './legacy-2009-autumn-pm-05-08-shared';
import { drawing } from './legacy-2009-autumn-pm-05-08-figures';
import { newtonAt } from './legacy-2009-autumn-pm-8-model';

const lineSubscript = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈'];

function newtonBanksFor([first, second]: readonly [number, number]): Banks {
  const left = 'x' + lineSubscript[first], right = 'x' + lineSubscript[second];
  return [
    [left + '＝' + right + 'である', left + '≠' + right + 'である', left + '＝' + right + 'とも' + left + '≠' + right + 'ともいえない'],
    ['b[k−1] ← (k−1) × a[k]','b[k−1] ← k × a[k]','b[k] ← k × a[k+1]','b[k] ← (k+1) × a[k+1]'].map(value => code(value)),
    ['b[k−1]','b[k]','b[k+1]','b[n−1]','b[n−1] × x','b[n−1] × x + b[n−2]'].map(value => code(value)),
    ['けたあふれ','けた落ち','指数下位けたあふれ','丸め誤差'],
  ];
}

export const newtonBanks = newtonBanksFor(newtonAt(0).comparison);

function shownPolynomial(coefficients: readonly number[]) {
  const exponents = ['','x','x²','x³','x⁴'];
  return coefficients.flatMap((value,i) => {
    if (value === 0) return [];
    const degree = coefficients.length - i - 1;
    const magnitude = Math.abs(value);
    const term = (magnitude === 1 && degree > 0 ? '' : magnitude)+exponents[degree];
    return [i === 0 ? term : (value < 0 ? ' − ' : ' ＋ ')+term];
  }).join('');
}
const subscript = ['₀','₁','₂','₃','₄'];
const written = (value: number) => String(value).replace('-', '−');
const coefficientText = (coefficients: readonly number[]) =>
  coefficients.map((value,i)=>'a'+subscript[coefficients.length-i-1]+'＝'+written(value)).join('，');
export function newtonPages(index: number): readonly Page[] {
  const c = newtonAt(index);
  const [first, second] = c.comparison;
  const left = 'x' + lineSubscript[first], right = 'x' + lineSubscript[second];
  return [[33, [
    p('次の問8は必須問題です。必ず解答してください。'),
    p('問8　次のアルゴリズムの説明及びプログラムを読んで，設問に答えよ。'),
    p('方程式の解の一つを求めるアルゴリズムである。任意に定めた解の予測値から始めて，計算を繰り返しながらその値を真の値に近づけていく。この方法は，ニュートン法と呼ばれる。'),
    p('〔アルゴリズム1の説明〕'),
    p('3次方程式 a₃x³＋a₂x²＋a₁x＋a₀＝0 の解の一つを，次の手順で求める。'),
    p('(1) 解の予測値x，係数a₃，a₂，a₁，a₀を読み込む。'),
    p('(2) 3×a₃の値をb₂に，2×a₂の値をb₁に，1×a₁の値をb₀に，それぞれ求める。'),
    p('(3) 次の①～④の処理を一定の回数繰り返す。'),
    p('① a₃x³＋a₂x²＋a₁x＋a₀の値を求め，これをfとする。'),
    p('② b₂x²＋b₁x＋b₀の値を求め，これをdとする。'),
    p('③ x，f，dの値を印字する。'),
    p('④ x − f/d の値（解の一つにより近い値となる）を求め，これを新たなxとする。'),
    p('プログラム1は，このアルゴリズム1を実装したものである。'),
    p('〔アルゴリズム2の説明〕'),
    p('アルゴリズム1を一般化して，n次方程式 aₙxⁿ＋aₙ₋₁xⁿ⁻¹＋…＋a₁x＋a₀＝0 の解の一つを，次の手順で求める。なお，方程式によっては解が求められない場合がある。'),
    p('(1) 次数n，解の予測値x，係数aₙ，aₙ₋₁，…，a₁，a₀を読み込む。'),
    p('(2) n×aₙの値をbₙ₋₁に，(n−1)×aₙ₋₁の値をbₙ₋₂に，…，2×a₂の値をb₁に，1×a₁の値をb₀に，それぞれ求める。'),
    p('(3) 次の①～④の処理を一定の回数繰り返す。'),
    p('① aₙxⁿ＋aₙ₋₁xⁿ⁻¹＋…＋a₁x＋a₀の値を求め，これをfとする。'),
    p('② bₙ₋₁xⁿ⁻¹＋bₙ₋₂xⁿ⁻²＋…＋b₁x＋b₀の値を求め，これをdとする。'),
    p('③ x，f，dの値を印字する。'),
    p('④ x − f/d の値（解の一つにより近い値となる）を求め，これを新たなxとする。'),
    p('プログラム2は，このアルゴリズム2を実装したものである。'),
  ]],[34, [drawing('8-program-1',index),drawing('8-program-2',index)]],[35, [
    p('設問　次の記述中の［a］～［e］に入れる正しい答えを，解答群の中から選べ。'),
    p('(1) 解の予測値x＝'+c.start+'，係数'+coefficientText(c.cubic)+'を与えて，3次方程式 '+shownPolynomial(c.cubic)+
      '＝0 の解の一つを求める（解は'+c.roots.map(written).join('，')+'）。プログラム1をある処理系で実行した結果，図1に示すとおり解の一つであるx＝'+c.roots[0]+'が近似的に得られた。'),
    drawing('8-printed-1',index),
    p('注1　数値の後の(−k)は，×10⁻ᵏを示す。例えば，5.548452(−2)は5.548452×10⁻²，すなわち0.05548452を表す。'),
    p('注2　表示は有効数字7けた（8けた目を四捨五入）'+
      (index === 0 ? '' : '。処理系がfを0.000000と印字するのは，保持したfが0の場合だけとする。')),
    p('この印字結果の行番号'+first+'，'+second+'のxの値（網掛けの部分）はいずれも'+c.cubicRows[first - 1][0]+
      'である。行番号'+first+'，'+second+'を印字した時点で変数xに保持されていた実際の値をそれぞれ'+left+'，'+right+'で表すと，［a］。'),
    p('なお，この処理系では，実数型は2進数の浮動小数点形式であって，有効けた数は10進数で十数けた程度であることが分かっている。'),
    p('(2) プログラム2では，係数aₖ（k：n，n−1，…，1，0）の値を配列aの要素a[k]に，bₖ（k：n−1，n−2，…，1，0）の値を配列bの要素b[k]に，それぞれ図2のように格納している。'),
    drawing('8-coefficients',index),
  ]],[36, [
    p('プログラム2の行番号9～11は，アルゴリズム2の手順(2)の処理である。この部分のプログラムは，次のようになる。'),
    drawing('8-b',index),
    p('また，行番号13～18は，アルゴリズム2の手順(3)の①と②の処理である。プログラム1では，例えばfの値 a₃x³＋a₂x²＋a₁x＋a₀ を求める式を，'),
    code('f ← ((a3 × x + a2) × x + a1) × x + a0'),
    p('と変形して，演算回数を減らす工夫をしている。この部分にも同様の工夫をすると，プログラムは次のようになる。'),
    drawing('8-cd',index),
    p('(3) 次数n＝4，係数'+coefficientText(c.quartic)+'として，4次方程式 '+shownPolynomial(c.quartic)+
      '＝0 の解を求める（4個の解がすべて'+c.quarticRoot+'）。解の予測値をx＝'+c.near+
      'として，ある処理系でプログラム2を実行したところ，図3に示すとおりの印字結果となった。'),
  ]],[37, [
    drawing('8-printed-2',index),
    p('この印字結果の行番号2では，xの値（網掛けの部分）が解である'+c.quarticRoot+
      'から遠ざかってしまっている。その原因を調べるため，fを求める式に実際の数値を当てはめて，'),
    drawing('8-partial',index),
    p('として，(A)の部分の中間結果を印字するプログラムを作り，同じ処理系で実行した。印字結果は'+c.intermediate+
      'であり，正確な値'+c.exactA+'と有効数字7けたで一致した。しかし，行番号1で印字されたfの値は，正確な値である'+c.exactF+'（印字の表記では'+
      c.fNotation+'）とは異なっている。'),
    p('これらのことから判断して，(A)の部分では演算の過程で［e］が徐々に累積し，(A)の計算結果に'+c.quartic[4].toFixed(1)+
      'を加算するときに，けた落ちが発生したと考えられる。'),
    bankAt(0,'aに関する解答群'),bankAt(1,'bに関する解答群'),
  ]],[38,[bankAt(2,'c，dに関する解答群'),bankAt(3,'eに関する解答群')]]];
}

export const newtonDefinition = {
  ...common(8,'ニュートン法と浮動小数点の計算誤差','3次方程式・重根をもつ4次方程式・初期値',
    '公式p33–38。原問題のp36は訂正後の現行版。別のIPA訂正通知は試験当日のc/dを全員正解とした。生成条件では訂正済みの処理を通常採点し，公式の初出表示も別の記録に保持する。疑似言語の共通資料はp3–4。元の図3は処理系固有の印字を保持する。aの比較行と初期値を変え，表示の一致だけでは判定できない差と，fが0になった反復を含める。',
    'ニュートン法の疑似言語と空欄を保ち，方程式・初期値・印字結果を変更しました。c，dはIPA訂正後の処理を問います。', values => {
      const index = indexOfCase(values), c = newtonAt(index);
      const [first, second] = c.comparison;
      const firstRow = c.cubicRows[first - 1], secondRow = c.cubicRows[second - 1];
      const unchanged = firstRow[1] === '0.000000';
      return {
        prompt: readPrompt(newtonPages(index)),
        ...pairedAnswers(newtonBanksFor(c.comparison), [0,1,2,2,3], [unchanged ? 0 : 1,1,3,1,3]),
        contexts:[pseudoReference()],
        explanation:[
          unchanged
            ? 'a：行'+first+'のfは処理系で0，dは0以外。更新量f/dが0なので，行'+second+'でも保持されたxの値は変わらない。'
            : 'a：xの7けた表示は行'+first+'・'+second+'でともに'+firstRow[0]+'だが，fは'+firstRow[1]+'と'+secondRow[1]+
              'で異なる。同じ式を同じ実数値で評価すれば同じ値になるので，実際に保持されたxは異なる。',
          'b：a[k]×xᵏを微分した係数k×a[k]を，次数が一つ下がったb[k−1]に入れる。kはnから1までなので全ての係数を埋められる。',
          'c，d：導関数の最高次の係数b[n−1]でdを初期化する。次はn−2から0へ順にdへxを掛けてb[k]を加える。n＝1では繰返しを実行せず，dはb[0]のままである。',
          'e：有限けたの浮動小数点演算では各演算の丸め誤差が累積する。(A)に'+c.quartic[4].toFixed(1)+
            'を加えたときは，大きさがほぼ同じで符号が逆の値が打ち消し合い，有効けたが減る。正確なfの値は'+c.fNotation+'である。',
        ].join('\n'),
      };
    }),
  fixedReferenceAssetIds:pseudoAssets,
};
