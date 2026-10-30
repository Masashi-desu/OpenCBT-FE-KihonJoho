import type { Block } from "../types";
import { code, field, figure, p, strings, variableNotes, type GenerationDefinition } from "./definition";

/** Four reviewed indirect-addressing conditions. Candidate order and cells are
 * source roles, rather than a shuffle of the reference condition. */
export const legacy2019IpCases = [
  { prefix: [1,2,3,4,5], suffixes: [[1,2,8,9,10],[5,6,7,8,9],[6,7,4,9,10],[6,7,8,9,10]] },
  { prefix: [2,4,6,8,10], suffixes: [[1,3,5,7,9],[1,3,5,7,10],[2,3,5,7,9],[1,3,4,7,9]] },
  { prefix: [1,3,5,7,9], suffixes: [[2,4,5,8,10],[2,4,6,8,10],[1,4,6,8,10],[2,4,6,9,10]] },
  { prefix: [1,2,4,8,10], suffixes: [[1,5,6,7,9],[3,4,6,7,9],[3,5,6,7,9],[3,5,6,8,9]] },
  { prefix: [1,1,2,2,3], suffixes: [[4,4,3,5,6],[2,4,5,5,6],[4,4,5,1,6],[4,4,5,5,6]] },
] as const;
const fractions = [[1,6],[1,4],[1,3],[1,2],[2,3]] as const;
const limits = [2,3,4,6,8];
function reduce(n: number, d: number): string {
  let x = n, y = d; while (y) [x,y] = [y,x%y];
  return d/x === 1 ? String(n/x) : `${n/x}/${d/x}`;
}
export function legacy2019ParallelProgram(program: number, halfIndex: number) {
  if (!Number.isInteger(program) || program < 1 || program > 4 || !Number.isInteger(halfIndex) || halfIndex < 0 || halfIndex > 2)
    throw new Error("PARAMETER_CONSTRAINT");
  const half = program === 4 ? 5 : 40 + 10 * halfIndex, start = program === 3 ? 2 : 1, end = 2 * half + start - 1;
  const statement = (i: string) => program === 1 ? `a[${i}] ← b[${i}] ＋ c[${i}]`
    : program === 2 ? `a[${i}] ← a[${i} ＋ 1] ＋ b[${i}]`
    : program === 3 ? `a[${i}] ← a[${i} − 1] ＋ b[${i}]` : `a[ip[${i}]] ← b[${i}]`;
  return { program, start, end, half, leftEnd: start+half-1, rightStart: start+half,
    loops: [
      { index: "i", start, end, control: `i: ${start}, i ≦ ${end}, 1`, statement: statement("i") },
      { index: "i₁", start, end: start+half-1, control: `i₁: ${start}, i₁ ≦ ${start+half-1}, 1`, statement: statement("i₁") },
      { index: "i₂", start: start+half, end, control: `i₂: ${start+half}, i₂ ≦ ${end}, 1`, statement: statement("i₂") },
    ],
  };
}
export function legacy2019PmFigureAlt(profile: string, values: number[]): string {
  if (profile === "legacy-2019-autumn-pm2-parallel-split") {
    const { program,loops } = legacy2019ParallelProgram(values[0],values[1]);
    return `実線の四角はプログラム${program}、破線の四角は繰返しの処理。プログラムの前後には他の処理がある。二つの矢印は、元の繰返し「${loops[0].control}、${loops[0].statement}」を、スレッド${program}-1の「${loops[1].control}、${loops[1].statement}」とスレッド${program}-2の「${loops[2].control}、${loops[2].statement}」へ分割することを示す。`;
  }
  const item = legacy2019IpCases[values[0]];
  if (!item) throw new Error("PARAMETER_CONSTRAINT");
  if (profile === "legacy-2019-autumn-pm2-parallel-ip") return `配列ipの要素番号は1〜10。ip[1]〜ip[5]は順に${item.prefix.join("、")}。ip[6]〜ip[10]の五つの要素の値を空欄eとする。`;
  if (profile === "legacy-2019-autumn-pm2-parallel-ip-option") return `左から順に${item.suffixes[values[1]].join("、")}の五つのセル。`;
  throw new Error("UNKNOWN_LEGACY_2019_FIGURE");
}
const diagram = (profile: string, values: number[], caption: string) => figure(profile,values,caption,legacy2019PmFigureAlt(profile,values));
const splitFigure = (program: number, halfIndex: number, caption: string) => diagram("legacy-2019-autumn-pm2-parallel-split",[program,halfIndex],caption);
const choiceId = (n: number) => `choice-value-${n}`;
const eventChoices = (program: number, seam: number): Block[][] => [
  ["更新","更新"],["更新","参照"],["参照","更新"],["参照","参照"],
].map(([first,second]) => [p(`a[${seam}]の値をスレッド${program}-1で${first}するより先にスレッド${program}-2で${second}する`)]);

/** Whole five-page legacy major question. It deliberately remains a compound
 * question with five independent answer groups, rather than a modern B item. */
export const legacy2019AutumnParallelDefinitions: GenerationDefinition[] = [{
  source: "2019r01a-fe-pm-2", title: "旧制度・午後：スレッド並列実行と高速化率",
  sourceAnswer: "設問1 a=オ、b=ウ／設問2 c=ウ、d=イ／設問3 e=エ",
  fields: [field("threadCount",2,4),field("parallelFractionCase",0,4),field("limitCase",0,4),field("halfRangeCase",0,2),field("indirectAddressCase",0,4)],
  reference: [2,4,2,1,0],
  notes: variableNotes + " 旧制度2019秋午後問2全5頁、設問1〜3のa〜e・5/5/4/4/4択を維持。式、同一性能・異なるプロセッサの前提、三つの直接アクセス例と間接参照例、全ループ範囲と図の凡例を保持する。Aのスレッド数と高速化率、Bの並列化割合、配列の分割境界、ipの実際のアクセス集合を変える。c/dは同じ依存方向を問う固定正答、a/b/eは条件で変わる。全1,125入力を原生成器とは別の有理数計算・プログラムアクセス解析・252通りのスレッド間実行順で検算する。ipは同一スレッド内で書込み先が重複しても安全な条件を含み、10値一意を不要な前提にしない。元の有理数と整数の計算を保ち丸めを加えない。共通疑似言語p3〜4の扱いと本番の任意選択方式は別途統合が必要。",
  build: values => {
    const domain = [[2,4],[0,4],[0,4],[0,2],[0,4]];
    if (values.length !== domain.length || values.some((v,i) => !Number.isInteger(v) || v < domain[i][0] || v > domain[i][1])) throw new Error("PARAMETER_CONSTRAINT");
    const [n,a,b,halfCase,ipCase] = values, [num,den] = fractions[a], limit = limits[b], half = 40+10*halfCase;
    const speedup = reduce(n*den,n*(den-num)+num), rB = reduce(limit-1,limit), data = legacy2019IpCases[ipCase];
    const eCorrect = data.suffixes.findIndex(suffix => !suffix.some(v => (data.prefix as readonly number[]).includes(v)));
    const prompt: Block[] = [
      p("旧制度・午後 問2。スレッドを使用した並列実行に関する次の記述を読んで、設問1〜3に答えよ。"),
      p("プログラム中の並列実行が可能な部分を取り出し、その部分を分割して複数のスレッドで並列に実行する方法（以下、スレッド並列法という）がある。マルチプロセッサシステムでは、スレッド並列法を適用することによって、プログラムの実行時間を短縮できることがある。"),
      p("プログラムにおいて、スレッド並列法を適用しないで実行したときの実行時間を、スレッド並列法を適用したときの実行時間で割った値を、プログラム実行時間の高速化率という。"),
      p("プログラムをスレッド並列法を適用しないで実行したときの、プログラム全体の実行時間に対する、並列実行可能な部分の実行時間の割合をr（0≦r≦1）とする。スレッドの個数をn（n≧1）にして、プログラムにスレッド並列法を適用すると、マルチプロセッサシステムでは、プログラム実行時間の高速化率Eは、次の式で求められる。ここで、各スレッドはそれぞれ異なるプロセッサに割り当てられるものとし、プログラムの実行に使用する全てのプロセッサの性能は同じとする。"),
      code("E = 1 / ((1 − r) ＋ r/n)","text"),
      p("この式は、並列実行可能な部分のプログラム実行時間がスレッド並列法の適用によって1/nになり、その他の部分のプログラム実行時間は変化しないときの高速化率を計算するものである。"),
      p(`プログラム中に並列実行が可能な部分をもつプログラムAに対してスレッドの個数を${n}にしてスレッド並列法を適用すると、高速化率は${speedup}になった。この場合、rは［a］である。`),
      p(`rが${rB}であるプログラムBの場合、スレッドの個数を増やしても、高速化率の上限は［b］である。`),
      p("設問1 本文中の［a］、［b］に入れる正しい答えを、それぞれの解答群の中から選べ。"),
      p("設問2 次の記述中の［c］、［d］に入れる正しい答えを、それぞれの解答群の中から選べ。"),
      p("配列の操作を行う繰返しの処理において、図1、図2のように繰返しの範囲を分割して、スレッド並列法を適用することを考える。このとき、操作の内容によって、正しい結果が得られる場合と得られない場合があるので、十分に検討することが必要である。"),
      p("図中で使用する疑似言語の記述形式：『変数: 初期値、条件式、増分』は繰返し処理を表す。開始時に変数へ初期値を格納し、条件式が真の間、二つの■を縦線で結んだ範囲の処理を繰り返す。繰り返すごとに変数へ増分を加える。『変数 ← 式』は式の値を変数に代入する。a[i]は配列aの添字iの要素を表す。"),
      p("正しい結果が得られる場合の例を、図1に示す。図1に示すプログラム1は、制御変数iの取る範囲を分けることによって繰返し範囲を分割した繰返しの処理を、それぞれ異なるスレッドで実行できる。"),
      p("なお、図1、図2において、実線の四角はプログラム、破線の四角は繰返しの処理、破線の四角から出る二つの矢印は分割を示す。"),
      splitFigure(1,halfCase,"図1 正しい結果が得られる場合の例"),
      p("正しい結果が得られない場合の二つの例を、図2に示す。"),
      p("プログラム2の繰返しの処理を、スレッド2-1とスレッド2-2の二つに分割すると、［c］ことがあるので、スレッド並列法を適用しない場合の実行結果と等しくなることを保証できない。したがって、プログラム2に対しては、繰返しの範囲の分割によるスレッド並列法を適用できない。"),
      p("また、プログラム3の繰返しの処理を、スレッド3-1とスレッド3-2の二つに分割すると、［d］ことがあるので、スレッド並列法を適用しない場合の実行結果と等しくなることを保証できない。したがって、プログラム3に対しても、繰返しの範囲の分割によるスレッド並列法を適用できない。"),
      splitFigure(2,halfCase,"図2（上） 正しい結果が得られない場合の例：プログラム2"),
      splitFigure(3,halfCase,"図2（下） 正しい結果が得られない場合の例：プログラム3"),
      p("設問3 図3に示すプログラム4では、配列aにおける更新対象の位置を配列ipの要素の値で指定している。このプログラムでは、配列ipの要素の値によって、スレッド並列法を適用できる場合とできない場合がある。図4に示す配列ipであれば、スレッド並列法を適用できる。図4中の［e］に入れる正しい答えを、解答群の中から選べ。"),
      p("なお、図3において、実線の四角はプログラム、破線の四角は繰返しの処理、破線の四角から出る二つの矢印は分割を示す。"),
      splitFigure(4,0,"図3 プログラム4へのスレッド並列法の適用"),
      diagram("legacy-2019-autumn-pm2-parallel-ip",[ipCase],"図4 スレッド並列法を適用できる配列ip"),
    ];
    const choices: Block[][] = [...strings(fractions.map(([x,y]) => `${x}/${y}`)),...strings(limits.map(String)),
      ...eventChoices(2,half+1),...eventChoices(3,half+1),
      ...[0,1,2,3].map(candidate => [diagram("legacy-2019-autumn-pm2-parallel-ip-option",[ipCase,candidate],"eに関する解答群")])];
    const counts = [5,5,4,4,4], offsets = [0,5,10,14,18], labels = ["設問1 a","設問1 b","設問2 c","設問2 d","設問3 e"];
    return { prompt,choices,
      answerParts: counts.map((count,i) => ({id:`part-${"abcde"[i]}`,label:labels[i],choiceIds:Array.from({length:count},(_,j) => choiceId(offsets[i]+j+1))})),
      partAnswers: [a,b,2,1,eCorrect].map((answer,i) => ({kind:"choice" as const,partId:`part-${"abcde"[i]}`,choiceId:choiceId(offsets[i]+answer+1)})),
      explanation: `a：Eの逆数から1−r＋r/${n}=1/(${speedup})を立てて解くとr=${num}/${den}。b：nを増やすとr/nは0へ近づくので、上限は1/(1−${rB})=${limit}。c：プログラム2ではスレッド2-1の最後の反復がa[${half+1}]を参照する。一方、スレッド2-2は同じ要素を更新するため、参照前に更新が起きると逐次実行の値と異なり得る。d：プログラム3ではスレッド3-1の最後の反復がa[${half+1}]を更新する。スレッド3-2がその更新前の値を参照すると、逐次実行と異なり得る。e：二つのスレッドが更新するaの添字集合を調べる。前半は{${data.prefix.join(",")}}、正しい後半は{${data.suffixes[eCorrect].join(",")}}で共通要素がないので、どのスレッド間実行順でも結果は変わらない。他の候補には前半との共通添字があり、別々のbの値で同じaを上書きする順が変わり得る。`,
    };
  },
}];
