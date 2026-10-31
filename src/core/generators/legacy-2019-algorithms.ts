import { code, field, figure, p, strings, variableNotes, type GenerationDefinition } from "./definition";

export const legacy2019GcdInputs = [[876,204],[720,252],[630,180],[468,132],[924,252],[936,204]];
export const legacy2019StackOrders = ["STACK", "TACKS", "ACKST", "TSKCA", "CSATK", "KATCS", "SACKT", "CKSTA"];

/** These four base choices are separately transcribed in the review fixture. */
const treeBase = [[1,2,3,4,5,6,7,8,9],[4,2,8,1,3,6,9,5,7],[7,6,8,4,5,3,9,1,2],[9,7,8,1,2,5,6,3,4]];
export function legacy2019Tree(variant: number, candidate: number, offset: number) {
  if (![variant,candidate,offset].every(n => Number.isInteger(n) && n >= 0 && n <= 3)) throw new Error("PARAMETER_CONSTRAINT");
  let values = [...treeBase[candidate]], parent = 5;
  if (variant > 0 && candidate === 1) [values[1],values[4]] = [values[4],values[1]];
  if (variant === 1 && candidate === 0) { parent = 3; values = [6,4,8,2,5,7,9,1,3]; }
  if (variant === 2 && candidate === 2) { parent = 4; values = [6,2,8,1,4,7,9,3,5]; }
  if (variant === 3 && candidate === 3) { parent = 6; values = [4,2,6,1,3,5,8,7,9]; }
  const edges: [number,number][] = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[parent,7],[parent,8]];
  return { values: values.map(n => n + offset), edges, parent };
}
export function legacy2019FigureAlt(profile: string, values: number[]) {
  if (profile === "legacy-2019-gcd-flow") return "開始しLをA、SをBにする。LとSを比較し、L>SならL−SをLに代入、L<SならS−LをSに代入して比較へ戻る。等しければA、B、Lを出力して終了する。";
  if (profile !== "legacy-2019-bst") throw new Error("UNKNOWN_LEGACY_2019_FIGURE");
  const tree = legacy2019Tree(values[0],values[1],values[2]);
  const sentences = [`根の値は${tree.values[0]}。`];
  for (let parent = 0; parent < 9; parent++) {
    const children = tree.edges.filter(e => e[0] === parent).map(e => tree.values[e[1]]);
    if (children.length) sentences.push(`値${tree.values[parent]}の左の子は${children[0]}、右の子は${children[1]}。`);
  }
  return sentences.join("");
}

function minimumStacks(order: string) {
  const input = "ACKST";
  for (let count = 1; count <= 4; count++) {
    const seen = new Set<string>();
    const search = (at: number, consumed: number, stacks: string[]): boolean => {
      stacks = [...stacks];
      for (;;) {
        const match = stacks.findIndex(s => s.endsWith(order[consumed] ?? "\0"));
        if (match < 0) break;
        stacks[match] = stacks[match].slice(0,-1); consumed++;
      }
      if (consumed === input.length) return true;
      if (at === input.length) return false;
      stacks.sort(); const key = `${at}:${consumed}:${stacks.join("|")}`;
      if (seen.has(key)) return false; seen.add(key);
      const identical = new Set<string>();
      for (let i = 0; i < stacks.length; i++) {
        if (identical.has(stacks[i])) continue; identical.add(stacks[i]);
        const next = [...stacks]; next[i] += input[at];
        if (search(at+1,consumed,next)) return true;
      }
      return false;
    };
    if (search(0,0,Array(count).fill(""))) return count;
  }
  throw new Error("PARAMETER_CONSTRAINT");
}
function define(period: "spring" | "autumn", n: number, title: string, sourceAnswer: string,
  fields: GenerationDefinition["fields"], reference: number[], build: GenerationDefinition["build"], notes: string, fixed = false): GenerationDefinition {
  return { source: `${period === "spring" ? "2019h31h" : "2019r01a"}-fe-am-${n}`, title, sourceAnswer, fields, reference,
    notes: variableNotes + " " + notes, ...(fixed ? { answerVariation: "fixed" as const } : {}),
    build: values => {
      if (values.length !== fields.length || values.some((v,i) => !Number.isInteger(v) || v < fields[i].minimum || v > fields[i].maximum)) throw new Error("PARAMETER_CONSTRAINT");
      return build(values);
    },
  };
}
export const legacy2019AlgorithmDefinitions: GenerationDefinition[] = [
  define("spring", 5, "九つの節を持つ二分探索木", "イ", [field("treeCondition",0,3),field("valueOffset",0,3)], [0,0], ([variant,offset]) => ({
    prompt: [p(`2分探索木として適切なものはどれか。ここで、数字${1+offset}〜${9+offset}は、各ノード（節）の値を表す。`)],
    choices: [0,1,2,3].map(candidate => [figure("legacy-2019-bst",[variant,candidate,offset],"2分木",legacy2019FigureAlt("legacy-2019-bst",[variant,candidate,offset]))]),
    correctIndex: [1,0,2,3][variant],
    explanation: "各ノードの左部分木にある全ての値はそのノードより小さく、右部分木の全ての値は大きくなければならない。直下の子だけでなく祖先からの大小条件もたどる。選んだ木だけが、この条件を根から全ての葉まで満たす。",
  }), "原資料は各候補9節、値1〜9。2022サンプルの5〜7節の木へ置換しない。四役の図形式を保ち、下段の枝が付く親と値の大小条件を変更する。正しい木も異なる枝構造にし、choiceの移動や数値の名前差替えだけにしない。オフセットは0〜3で全値を正の1〜2桁整数とし、全16条件×4候補を独立した上下限伝播で検証。"),

  define("spring", 7, "引算版ユークリッド法の比較回数", "エ", [field("inputCase",0,5)], [0], ([inputCase]) => {
    const [A,B] = legacy2019GcdInputs[inputCase]; let left = A, right = B, comparisons = 1;
    while (left !== right) { if (left > right) left -= right; else right -= left; comparisons++; }
    let a = A, b = B, divisions = 0; while (b) { [a,b] = [b,a%b]; divisions++; }
    return { prompt: [p(`次の流れ図は、2数A、Bの最大公約数を求めるユークリッドの互除法を、引き算の繰返しによって計算するものである。Aが${A}、Bが${B}のとき、何回の比較で処理は終了するか。`),
      figure("legacy-2019-gcd-flow",[0],"流れ図",legacy2019FigureAlt("legacy-2019-gcd-flow",[0]))],
      choices: strings([divisions,comparisons-2,comparisons-1,comparisons].map(String)), correctIndex: 3,
      explanation: `L>S又はL<Sのときに引算し、もう一度比較へ進む。引算を${comparisons-1}回行った後、L=S=${left}を確かめる最後の比較も必要なので合計${comparisons}回である。剰余を用いる通常の互除法の段数${divisions}とは区別する。` };
  }, "原A876/B204、選択肢4/9/10/11。各3桁の6入力を使い、図の開始/二代入/比較/大小二分岐/等値出力/終了と矢印の戻り先を保持。最後の等値比較も数える。誤答は剰余法段数、最後の二比較又は一比較の欠落。全入力を商・余りから独立検算。"),

  define("autumn", 4, "有理関数の比の極限", "ア", [field("constantInF",1,3),field("coefficientInG",1,3)], [1,1], ([c,k]) => ({
    prompt: [p(`a及びbを定数とする関数 f(t)=a/(t＋${c}) 及び g(t)=b/(t²−${k}t) に対して、t→∞のときのg(t)/f(t)の極限はどれか。ここで、a≠0、b≠0、t>${k}とする。`)],
    choices: strings(["0","1","b/a","∞"]), correctIndex: 0,
    explanation: `g(t)/f(t)=(b/a)×(t＋${c})/(t²−${k}t)。分子分母をt²で割ると、(b/a)×(1/t＋${c}/t²)/(1−${k}/t)となる。tが無限に大きくなると分子は0、分母は1へ近づくので、比の極限は0である。`,
  }), "原f=a/(t+1)、g=b/(t²−t)、a/b非零、t>1、選択肢0/1/b/a/∞。分子一次対分母二次を固定し、関数の定数項・一次係数を各1〜3へ変更、定義域の下限も連動。正答0は固定と宣言し、極限を定数値の代入や別の問いへ変えない。図表なし・丸めなし。", true),

  define("autumn", 8, "所望の出力列に必要な最少スタック数", "ウ", [field("outputOrder",0,7)], [0], ([caseIndex]) => {
    const order = legacy2019StackOrders[caseIndex], needed = minimumStacks(order);
    return { prompt: [p(`A、C、K、S、Tの順に文字が入力される。スタックを利用して、${[...order].join("、")}という順に文字を出力するために、最小限必要となるスタックは何個か。ここで、どのスタックにおいてもポップ操作が実行されたときには必ず文字を出力する。また、スタック間の文字の移動は行わない。`)],
      choices: strings(["1","2","3","4"]), correctIndex: needed-1,
      explanation: `スタックは後から入れた文字を先に取り出す。指定された出力列では、同じスタックで逆転できない待機中の文字を分ける必要がある。入力とポップの順序を追跡すると${needed}個で実現でき、${needed-1}個以下の全ての割当てでは指定順に出せない。スタック間の移動や、出力しないポップは使わない。` };
  }, "原入力ACKST、出力STACK、四択1/2/3/4。入力は固定し、出力の順序条件を8通りへ変更。popは即出力・スタック間移動不可という前提を表示。生成器は状態探索、独立検算は入力文字ごとの全スタック割当て列挙。全8入力、より少数での不成立と最少数での成立を検証。"),
];
