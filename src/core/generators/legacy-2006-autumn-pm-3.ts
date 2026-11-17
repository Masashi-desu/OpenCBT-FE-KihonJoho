import { code, p, table } from './definition';
import type { Block } from '../types';
import { answers, bankBlocks, define, single } from './legacy-2006-autumn-pm-01-05-shared';
import { autumn2006PmPageAssetId, autumn2006PmReference } from './legacy-2006-autumn-pm-materials';

const referencePages=[2,3];

const formula=(text:string, alt:string):Block=>({type:'formula',text,alt,format:'latex'});
const equations=(lines:string[], alt:string)=>formula('\\left\\{\\begin{aligned}'+lines.join('\\\\')+'\\end{aligned}\\right.',alt);

const values = [[1,2,-1],[2,1,-1],[0,2,3],[-2,1,1]] as const;
const pivotOptions=['Pivot ← a[1,1]','Pivot ← a[1,k]','Pivot ← a[k,k]','Pivot ← a[n,n]'];
const loopOptions=[
 'i: 1, i ≦ n, 1','i: n−1, i ≧ 1, −1','j: 1, j ≦ i, 1','j: 1, j ≦ n−1, 1','j: i＋1, j ≦ n, 1',
];
function numeric(index:number) {
 const [x1,x2,x3]=values[index];
 const [b1,b2,b3]=[2*x1+x2+2*x3,3*x1+2*x2+x3,2*x1+4*x2+x3];
 return {x1,x2,x3,b1,b2,b3,f2:b2-3*b1/2,f3:b3-b1,last:11*x3};
}
const exampleProgram=[
 '○Gauss(整数型: n, 実数型: a[,], 実数型: b[], 実数型: x[])',
 '○整数型: k, i, j',
 '○実数型: Pivot, Factor, Sum',
 '/* ---------------- 前進消去 ---------------- */',
 '■ k: 1, k ≦ n−1, 1',
 '│  ・［a］',
 '│  ■ i: k＋1, i ≦ n, 1',
 '│  │  ・Factor ← a[i,k] ÷ Pivot',
 '│  │  ■ j: k＋1, j ≦ n, 1',
 '│  │  │  ・a[i,j] ← a[i,j] − a[k,j] × Factor',
 '│  │  ■',
 '│  │  ・b[i] ← b[i] − b[k] × Factor',
 '│  ■',
 '■',
 '/* ---------------- 後退代入 ---------------- */',
 '・x[n] ← b[n] ÷ a[n,n]',
 '■ ［b］',
 '│  ・Sum ← 0.0',
 '│  ■ ［c］',
 '│  │  ・Sum ← Sum ＋ a[i,j] × x[j]',
 '│  ■',
 '│  ・x[i] ← (b[i] − Sum) ÷ a[i,i]',
 '■',
].join('\n');

export function autumn2006Pm3Pages(index:number, print=true){
 const {x1,x2,x3,b1,b2,b3,f2,f3,last}=numeric(index);
 return [
  [p('次のプログラムの説明及びプログラムを読んで，設問に答えよ。'),
   p('〔プログラムの説明〕'),
   p('次の n 元連立1次方程式の解，すなわち xᵢ（i＝1，2，…，n）の値を求める副プログラム Gauss である。'),
   equations(['a_{11}x_1+a_{12}x_2+\\cdots+a_{1n}x_n&=b_1','a_{21}x_1+a_{22}x_2+\\cdots+a_{2n}x_n&=b_2','&\\cdot','&\\cdot','&\\cdot','a_{n1}x_1+a_{n2}x_2+\\cdots+a_{nn}x_n&=b_n'],
    '第1行から第n行まで、各行iは a[i,1]x₁＋a[i,2]x₂＋…＋a[i,n]xₙ＝bᵢ。'),
   p('（1）Gauss は，前進消去と後退代入の二つの段階からなる。'),
   p('①　前進消去'),
   p('次の計算を k＝1，2，…，n−1 の順に行う。k は前進消去の計算回数であり，変数の右肩に括弧付きの添字で示す。ここで，aᵢⱼ⁽⁰⁾＝aᵢⱼ，bᵢ⁽⁰⁾＝bᵢ とする。第k行第k列の a⁽ᵏ⁻¹⁾ をピボット（Pivot）と呼び，計算の途中で0にならないものとする。'),
   formula('a_{ij}^{(k)}=a_{ij}^{(k-1)}-a_{kj}^{(k-1)}\\times\\left(a_{ik}^{(k-1)}/a_{kk}^{(k-1)}\\right)\\quad(i=k+1,\\cdots,n;\\ j=k+1,\\cdots,n)',
    '第k段階のa[i,j]は、直前のa[i,j]から、直前のa[k,j]と直前のa[i,k]÷a[k,k]の積を引く。iとjはk＋1からn。'),
   formula('b_i^{(k)}=b_i^{(k-1)}-b_k^{(k-1)}\\times\\left(a_{ik}^{(k-1)}/a_{kk}^{(k-1)}\\right)\\quad(i=k+1,\\cdots,n)',
    '第k段階のb[i]は、直前のb[i]から、直前のb[k]と直前のa[i,k]÷a[k,k]の積を引く。iはk＋1からn。'),
   p('この計算の結果，n 元連立1次方程式は次の形になる。'),
   equations(['a_{11}^{(0)}x_1+a_{12}^{(0)}x_2+\\cdots+a_{1n}^{(0)}x_n&=b_1^{(0)}','a_{22}^{(1)}x_2+\\cdots+a_{2n}^{(1)}x_n&=b_2^{(1)}','&\\cdot','&\\cdot','&\\cdot','a_{nn}^{(n-1)}x_n&=b_n^{(n-1)}'],
     '第1行はx₁からxₙ、第2行はx₂からxₙ、最終行はxₙだけが残る。第i行には段階i−1の係数と定数を用いる。'),
   p('②　後退代入'),p('①の結果から，n 元連立1次方程式の解を i＝n，n−1，…，1 の順に求める。'),
   formula('x_n=b_n^{(n-1)}/a_{nn}^{(n-1)}','xₙ は最終行の定数を最終行対角の係数で割った値。'),
   formula('x_i=\\left(b_i^{(i-1)}-\\sum_{j=i+1}^n(a_{ij}^{(i-1)}\\times x_j)\\right)/a_{ii}^{(i-1)}\\quad(i=n-1,\\cdots,1)',
    'xᵢ は，第i行の定数から添字jをi＋1からnまで変えた係数a[i,j]と解xⱼの積の和を引き，第i行対角の係数で割る。iはn−1から1。')],
  [p('（2）次の連立方程式を例として，前進消去と後退代入の計算を示す。'),
   equations(['2x_1+x_2+2x_3&='+b1,'3x_1+2x_2+x_3&='+b2,'2x_1+4x_2+x_3&='+b3],
    '第1行 2x₁＋x₂＋2x₃＝'+b1+'。第2行 3x₁＋2x₂＋x₃＝'+b2+'。第3行 2x₁＋4x₂＋x₃＝'+b3+'。'),
   p('①　前進消去の計算を k＝1，2 の順に行う。k＝1のとき，a₂₂⁽¹⁾は次のとおりに計算される。'),
   formula('a_{22}^{(1)}=a_{22}^{(0)}-a_{12}^{(0)}\\times\\left(a_{21}^{(0)}/a_{11}^{(0)}\\right)=2-1\\times(3/2)=0.5',
    'a₂₂⁽¹⁾＝a₂₂⁽⁰⁾−a₁₂⁽⁰⁾×（a₂₁⁽⁰⁾÷a₁₁⁽⁰⁾）＝2−1×（3÷2）＝0.5。'),
   p('同様に a₂₃⁽¹⁾，b₂⁽¹⁾，a₃₂⁽¹⁾，a₃₃⁽¹⁾，b₃⁽¹⁾ を計算すると，連立方程式は次のとおりになる。'),
   equations(['2x_1+x_2+2x_3&='+b1,'0.5x_2-2x_3&='+f2,'3x_2-x_3&='+f3],
    '第1行 2x₁＋x₂＋2x₃＝'+b1+'。第2行 0.5x₂−2x₃＝'+f2+'。第3行 3x₂−x₃＝'+f3+'。'),
   p('k＝2のとき，a₃₃⁽²⁾，b₃⁽²⁾ を計算すると，連立方程式は次のとおりになる。'),
   equations(['2x_1+x_2+2x_3&='+b1,'0.5x_2-2x_3&='+f2,'11x_3&='+last],
    '第1行 2x₁＋x₂＋2x₃＝'+b1+'。第2行 0.5x₂−2x₃＝'+f2+'。第3行 11x₃＝'+last+'。'),
   p('②　後退代入によって，x₃，x₂，x₁ の値を得る。'),
   equations(['x_3&='+last+'/11='+x3,'x_2&=('+f2+'+2\\times('+x3+'))/0.5='+x2,
    'x_1&=('+b1+'-1\\times('+x2+')-2\\times('+x3+'))/2='+x1],
    'x₃＝'+last+'÷11＝'+x3+'。x₂＝（'+f2+'＋2×（'+x3+'））÷0.5＝'+x2+'。x₁＝（'+b1+'−1×（'+x2+'）−2×（'+x3+'））÷2＝'+x1+'。'),
   p('（3）Gauss の引数の仕様を表に示す。なお，各配列の添字は1から始まる。'),
   table('表　Gauss の引数の仕様',['引数','データ型','入力／出力','意味'],[
    ['n','整数型','入力','連立方程式の元数（未知数の個数）'],['a[,]','実数型','入力','係数 aᵢⱼ が格納されている2次元配列'],
    ['b[]','実数型','入力','定数 bᵢ が格納されている1次元配列'],['x[]','実数型','出力','解 xᵢ の値を格納する1次元配列'],
   ])],
  [p('〔プログラム〕'),code(exampleProgram,'pseudocode'),
   p('設問　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
   ...(print?bankBlocks('aの解答群',pivotOptions.map(x=>[code(x,'pseudocode')])):[]),
   ...(print?bankBlocks('b，cの解答群',loopOptions.map(x=>[code(x,'pseudocode')])):[])],
 ];
}
export const autumn2006Pm3=define(3,'ガウスの消去法の前進消去と後退代入','a=ウ／b=イ／c=オ',
 '連立方程式の定数項・消去途中の値及び解','行列の対角要素をピボットに使い，解が確定済みの項だけを後ろから代入する。',
 '元の3元例、一般n、1始まり、ピボットは0にならないという条件、制御線と添字を保持。右辺の値を変えて前進消去・後退代入の全例式を更新する。一般n用のループや係数の参照を変えない理由は、特定例だけを解くコードではなく同じ消去法を完成させる発問であるため。',
 index=>{
  const {x1,x2,x3}=numeric(index);
  return {prompt:autumn2006Pm3Pages(index,false).flat(),contexts:[autumn2006PmReference('共通擬似言語の記述形式',referencePages)],...answers([pivotOptions.map(x=>[code(x,'pseudocode')]),loopOptions.map(x=>[code(x,'pseudocode')])],[
   single('a','a',0,2),single('b','b',1,1),single('c','c',1,4),
  ]),explanation:'前進消去はk列を消去するため、同じ段階における第k行第k列 a[k,k] を基準にする。x[n] は後退代入の冒頭で計算済みなので i は n−1 から1へ下がる。各行の既知の解は i＋1 から n までで、その部分だけ加算する。この表示例の (x₁, x₂, x₃) は ('+x1+', '+x2+', '+x3+') となる。'};
 },{answerVariation:'fixed',fixedReferenceAssetIds:referencePages.map(autumn2006PmPageAssetId)});
