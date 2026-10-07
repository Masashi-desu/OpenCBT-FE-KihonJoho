import {
  type GenerationDefinition,
  field,
  p,
  code,
  table,
  list,
  figure,
  strings,
  programs,
  pairs,
  alternatives,
  numbers,
  variableNotes,
} from "./definition";
import { permutations } from "./subject-a";

function def(
  source: string,
  title: string,
  sourceAnswer: string,
  fields: GenerationDefinition["fields"],
  reference: number[],
  build: GenerationDefinition["build"],
): GenerationDefinition {
  return {
    source,
    title,
    sourceAnswer,
    fields,
    reference,
    build,
    notes: variableNotes,
  };
}
const indexOf = (name: string, offset: number) =>
  offset ? `${name} − ${offset}` : name;
export function partitionFirst(data: number[]) {
  const a = [...data],
    pivot = a[2];
  let i = 0,
    j = 4;
  for (let n = 0; n < 20; n++) {
    while (a[i] < pivot) i++;
    while (a[j] > pivot) j--;
    if (i >= j) return a;
    [a[i], a[j]] = [a[j], a[i]];
    i++;
    j--;
  }
  throw Error("Partition bound");
}
export function doubleHash(size: number, offset: number, input: number[]) {
  const out = Array(size).fill(-1) as number[];
  for (const n of input) {
    const i = n % size;
    if (out[i] === -1) out[i] = n;
    else {
      const j = (n + offset) % size;
      if (out[j] === -1) out[j] = n;
    }
  }
  return out;
}
export function mergeTailCount(a: number[], b: number[]) {
  let i = 0,
    j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) i++;
    else j++;
  }
  return b.length - j;
}
export function matchingPrefixCount(data: string, key: string) {
  let count = 0;
  for (let i = 0; i <= data.length - key.length; i++)
    for (let j = 0; j < key.length; j++) {
      if (data[i + j] !== key[j]) break;
      count++;
    }
  return count;
}
export function graphEdges(variant: number): number[][] {
  return variant === 0
    ? [
        [1, 3],
        [1, 4],
        [3, 4],
        [2, 4],
        [4, 5],
      ]
    : variant === 1
      ? [
          [1, 3],
          [1, 4],
          [3, 5],
          [2, 4],
          [4, 5],
        ]
      : [
          [1, 2],
          [2, 3],
          [3, 4],
          [2, 4],
          [4, 5],
        ];
}
export function adjacency(offset: number, variant: number) {
  const matrix = Array.from({ length: 5 }, () => Array(5).fill(0) as number[]);
  for (const [a, b] of graphEdges(variant)) {
    matrix[a - 1][b - 1] = 1;
    matrix[b - 1][a - 1] = 1;
  }
  return matrix;
}
export const palettes = [
  ["Red", "Green", "Blue", "Red"],
  ["Blue", "Red", "Blue", "Green"],
  ["Green", "Green", "Red", "Blue"],
  ["Blue", "Green", "Red", "Green"],
];
export function onehot(input: string[]) {
  const names = [...new Set(input)];
  return input.map((item) => names.map((name) => Number(item === name)));
}
export function expectedCounts(data: number[]) {
  const [a, b, c, d] = data,
    total = a + b + c + d;
  return [((a + b) * (a + c)) / total, ((c + d) * (b + d)) / total];
}
const clean = (n: number) => Number(n.toFixed(2)).toString();

export const subjectBDefinitions: GenerationDefinition[] = [
  def(
    "2023-b-1",
    "素数列挙の空欄",
    "ア",
    [field("上限から引く値", 0, 4), field("説明例のmaxNum", 10, 50)],
    [0, 20],
    ([offset, max]) => {
      const upper = indexOf("maxNum", offset),
        correct = [upper, "i mod j が 0 と等しい"],
        wrong = [`${upper} ＋ 1`, "i ÷ j の商が 1 と等しくない"];
      const primes = Array.from(
        { length: Math.max(0, max - offset - 1) },
        (_, i) => i + 2,
      ).filter((n) =>
        Array.from({ length: Math.max(0, n - 2) }, (_, i) => i + 2).every(
          (d) => n % d !== 0,
        ),
      );
      return {
        prompt: [
          p("次のプログラム中の空欄【a】と【b】に入る正しい組合せを選べ。"),
          p(
            `findPrimeNumbersは${upper}以下の全ての素数を返す。maxNumは${offset + 2}以上の整数である。`,
          ),
          code(
            `○整数型の配列: findPrimeNumbers(整数型: maxNum)\n    整数型の配列: pnList ← {}\n    整数型: i, j\n    論理型: divideFlag\n    for (i を 2 から 【a】まで 1 ずつ増やす)\n        divideFlag ← true\n        for (j を 2 から floor(sqrt(i)) まで 1 ずつ増やす)\n            if (【b】)\n                divideFlag ← false\n                内側の繰返しを終了する\n            endif\n        endfor\n        if (divideFlag が true と等しい)\n            pnListの末尾にiを追加する\n        endif\n    endfor\n    return pnList`,
          ),
        ],
        choices: pairs([
          correct,
          [upper, wrong[1]],
          [wrong[0], correct[1]],
          wrong,
        ]),
        explanation: `上限は${upper}であり、2以上の除数で割り切れれば素数でない。従ってa=${upper}、b=${correct[1]}。maxNum=${max}という独自の確認例では{${primes.join(", ")}}を返す。`,
      };
    },
  ),
  def(
    "2023-b-2",
    "手続の呼出し順",
    "ク",
    [field("proc2の処理順", 0, 3), field("proc1の処理順", 0, 1)],
    [0, 0],
    ([order, reverse]) => {
      const first = reverse ? ["C", "A"] : ["A", "C"],
        actions = [
          ["proc3()", '"B"を出力する', "proc1()"],
          ["proc1()", '"B"を出力する', "proc3()"],
          ['"B"を出力する', "proc1()", "proc3()"],
          ["proc1()", "proc3()", '"B"を出力する'],
        ][order];
      const result = actions.flatMap((action) =>
          action === "proc1()" ? first : action === "proc3()" ? ["C"] : ["B"],
        ),
        correct = result.join("，"),
        pool = permutations(["A", "B", "C", "C"]).map((a) => a.join("，"));
      return {
        prompt: [
          p(
            "次の記述中の空欄に入る答えを選べ。proc2を呼び出すと【空欄】の順に出力される。",
          ),
          code(
            `○proc1()\n    ${reverse ? 'proc3()\n    "A"を出力する' : '"A"を出力する\n    proc3()'}\n○proc2()\n    ${actions.join("\n    ")}\n○proc3()\n    "C"を出力する`,
          ),
        ],
        choices: strings(
          alternatives(correct, [...pool, "A，C", "C，B", "C，B，A"], 8),
        ),
        explanation: `proc1の呼出しは${first.join("→")}、proc3はCを出力する。proc2の各行をその順に展開すると${result.join("→")}となる。関数名の順だけを見て出力を判断しない。`,
      };
    },
  ),
  def(
    "2023-b-3",
    "クイックソートの初回出力",
    "エ",
    [field("配列の並び", 0, 119), field("各値への加算値", 0, 20)],
    [25, 0],
    ([pattern, offset]) => {
      const input = permutations([1, 2, 3, 4, 5])[pattern].map(
          (n) => n + offset,
        ),
        result = partitionFirst(input),
        answer = result.join(" ");
      return {
        prompt: [
          p(
            "次の記述中の空欄に入る答えを選べ。配列の要素番号は1から始まる。sort(1, 5)を呼び出し、/*** α ***/を最初に実行した時の出力は【空欄】となる。",
          ),
          code(
            `大域: 整数型の配列: data ← {${input.join(", ")}}\n○sort(整数型: first, 整数型: last)\n    整数型: pivot ← data[floor((first + last) / 2)]\n    整数型: i ← first, j ← last\n    while (true)\n        while (data[i] < pivot)\n            i ← i + 1\n        endwhile\n        while (pivot < data[j])\n            j ← j - 1\n        endwhile\n        if (i ≧ j)\n            繰返しを終了する\n        endif\n        data[i]とdata[j]を交換する\n        i ← i + 1\n        j ← j - 1\n    endwhile\n    dataの全要素を空白区切りで出力する /*** α ***/\n    if (first < i - 1)\n        sort(first, i - 1)\n    endif\n    if (j + 1 < last)\n        sort(j + 1, last)\n    endif`,
          ),
        ],
        choices: strings(
          alternatives(
            answer,
            permutations(input).map((a) => a.join(" ")),
          ),
        ),
        explanation: `中央の基準値${input[2]}に対し左右から走査・交換する。初回の分割結果は${answer}であり、再帰呼出しによる全体の整列が完了した時の出力を問うものではない。`,
      };
    },
  ),
  def(
    "2023-b-4",
    "二つのハッシュ関数への格納",
    "エ",
    [
      field("表の要素数", 5, 9),
      field("第2ハッシュの加算値", 1, 4),
      field("第1入力", 1, 99),
      field("第2入力", 1, 99),
      field("第3入力", 1, 99),
    ],
    [5, 3, 3, 18, 11],
    ([size, offset, ...input]) => {
      const result = doubleHash(size, offset, input),
        correct = `{${result.join(", ")}}`,
        distractors = Array.from(
          { length: size },
          (_, i) =>
            `{${result.map((_, j) => result[(j + i) % size]).join(", ")}}`,
        );
      return {
        prompt: [
          p(
            "次の記述中の空欄に入る答えを選べ。配列の添字は1から始まる。test終了直後のhashArrayは【空欄】となる。",
          ),
          p(
            "addは第1候補が空なら格納し、空でなければ第2候補へ格納する。両方が使用中ならfalseを返す。−1は空を表す。",
          ),
          code(
            `大域: 整数型の配列: hashArray\n○論理型: add(整数型: value)\n    整数型: i ← calcHash1(value)\n    if (hashArray[i] = -1)\n        hashArray[i] ← value\n        return true\n    endif\n    i ← calcHash2(value)\n    if (hashArray[i] = -1)\n        hashArray[i] ← value\n        return true\n    endif\n    return false\n○整数型: calcHash1(整数型: value)\n    return (value mod hashArrayの要素数) + 1\n○整数型: calcHash2(整数型: value)\n    return ((value + ${offset}) mod hashArrayの要素数) + 1\n○test()\n    hashArray ← {${size}個の -1}\n    ${input.map((n) => `add(${n})`).join("\n    ")}`,
          ),
        ],
        choices: strings(alternatives(correct, distractors, 5)),
        explanation: `${input.join("、")}を呼出し順に処理し、各候補が空かを確認する。格納済みの値を上書きせず、結果は${correct}となる。`,
      };
    },
  ),
  def(
    "2023-b-5",
    "コサイン類似度の空欄",
    "エ",
    [field("走査添字の基準差", 0, 3), field("分母の保持方式", 0, 1)],
    [0, 0],
    ([offset, reciprocal]) => {
      const a = `vector1[${indexOf("i", offset)}] × vector2[${indexOf("i", offset)}]`,
        b = reciprocal
          ? "denominator ÷ sqrt(temp)"
          : "denominator × sqrt(temp)",
        wrongA = [
          `sqrt(vector1[${indexOf("i", offset)}] × vector2[${indexOf("i", offset)}])`,
          `vector1[${indexOf("i", offset)}]の2乗`,
        ],
        otherB = [
          b,
          "denominator ＋ sqrt(temp)",
          reciprocal ? "denominator × sqrt(temp)" : "sqrt(temp)",
        ];
      return {
        prompt: [
          p(
            "プログラム中の空欄a・bに入る組合せを選べ。vector1とvector2は同じ要素数nで、どちらも零ベクトルではない。配列の添字は1から始まる。",
          ),
          {
            type: "formula",
            format: "latex",
            text: "\\frac{\\sum_{i=1}^{n} a_i b_i}{\\sqrt{\\sum_{i=1}^{n} a_i^2}\\sqrt{\\sum_{i=1}^{n} b_i^2}}",
            alt: "コサイン類似度は内積を二つのベクトルの長さの積で割った値。",
          },
          p(`走査用のiは配列添字に${offset}を加えた値である。`),
          code(
            `○実数型: calcCosineSimilarity(実数型の配列: vector1, vector2)\n    実数型: numerator ← 0, denominator, temp ← 0\n    整数型: i\n    for (iを${1 + offset}からvector1の要素数 + ${offset}まで増やす)\n        numerator ← numerator + 【a】\n    endfor\n    for (iを1からvector1の要素数まで増やす)\n        temp ← temp + vector1[i]の2乗\n    endfor\n    denominator ← ${reciprocal ? "1 / sqrt(temp)" : "sqrt(temp)"}\n    temp ← 0\n    for (iを1からvector2の要素数まで増やす)\n        temp ← temp + vector2[i]の2乗\n    endfor\n    denominator ← 【b】\n    return numerator ${reciprocal ? "×" : "÷"} denominator`,
          ),
        ],
        choices: pairs([
          [a, b],
          ...wrongA.flatMap((x) => otherB.map((y) => [x, y])),
          [a, otherB[1]],
          [a, otherB[2]],
        ]),
        explanation: `aでは実際の添字i−${offset}の要素の積を足す。最初のdenominatorは第1ベクトルの長さ${reciprocal ? "の逆数" : ""}なので、bは${b}。最後の${reciprocal ? "乗算" : "除算"}で、提示した式と同じ値になる。`,
      };
    },
  ),
  def(
    "2024-b-1",
    "最大又は最小を返す条件",
    "イ",
    [field("返す値の種類", 0, 1), field("最初に比較する変数", 0, 2)],
    [0, 0],
    ([minimum, first]) => {
      const vars = ["x", "y", "z"],
        a = vars[first],
        b = vars[(first + 1) % 3],
        c = vars[(first + 2) % 3],
        op = minimum ? "<" : ">",
        correct = `${a} ${op} ${b} and ${a} ${op} ${c}`;
      return {
        prompt: [
          p(
            `プログラム中の空欄に入る答えを選べ。関数selectValueは異なる三つの整数から${minimum ? "最小" : "最大"}値を返す。`,
          ),
          code(
            `○整数型: selectValue(整数型: x, 整数型: y, 整数型: z)\n    if (【空欄】)\n        return ${a}\n    elseif (${b} ${op} ${c})\n        return ${b}\n    else\n        return ${c}\n    endif`,
          ),
        ],
        choices: programs(
          alternatives(
            correct,
            [
              `${a} ${op} ${b}`,
              `${a} ${op} ${b} and ${b} ${op} ${c}`,
              `${a} ${op} ${c}`,
              `${a} ${op} ${c} and ${c} ${op} ${b}`,
              `${c} ${op} ${b}`,
              `${a} ${op} ${b} or ${a} ${op} ${c}`,
            ],
            6,
          ),
        ),
        explanation: `${a}を返すのは、${a}が他の二つの値の両方より${minimum ? "小さい" : "大きい"}場合だけである。片方だけとの比較やorでは保証できない。`,
      };
    },
  ),
  def(
    "2024-b-2",
    "文字列の基数変換",
    "エ",
    [
      field("基数", 2, 8),
      field("走査する向き", 0, 1),
      field("説明例の整数", 1, 255),
    ],
    [2, 0, 18],
    ([radix, reverse, value]) => {
      const digit = reverse
          ? "int(digitsの(length − i ＋ 1)文字目)"
          : "int(digitsのi文字目)",
        correct = reverse
          ? `result ＋ ${digit} × ${radix}^(i − 1)`
          : `result × ${radix} ＋ ${digit}`,
        sample = value.toString(radix);
      return {
        prompt: [
          p(
            `空欄に入る式を選べ。convDecimalは0〜${radix - 1}の数字だけで構成した符号なし${radix}進数の文字列を整数へ変換する。intは一文字の数字をその整数値へ変換する。例として${sample}は${value}になる。`,
          ),
          code(
            `○整数型: convDecimal(文字列型: digits)\n    整数型: result ← 0, i, length ← digitsの文字数\n    for (iを1からlengthまで1ずつ増やす)\n        result ← 【空欄】\n    endfor\n    return result`,
          ),
        ],
        choices: programs(
          alternatives(correct, [
            `result ＋ int(digitsのi文字目)`,
            `result × ${radix} ＋ int(digitsの(length − i ＋ 1)文字目)`,
            `result ＋ int(digitsの(length − i ＋ 1)文字目)`,
            `result × ${radix} ＋ int(digitsのi文字目)`,
          ]),
        ),
        explanation: `${reverse ? "下位桁から読むので、各桁の値へ基数のi−1乗を掛けて加える" : "上位桁から読むので、蓄積値を基数倍して次の桁を加える"}。基数${radix}でも同じ位置記数法の規則を使う。`,
      };
    },
  ),
  def(
    "2024-b-3",
    "辺リストと隣接行列",
    "エ",
    [field("頂点番号の基準差", 0, 3), field("グラフの接続例", 0, 2)],
    [0, 0],
    ([offset, variant]) => {
      const u = indexOf("u", offset),
        v = indexOf("v", offset),
        correct = `adjMatrix[${u}, ${v}] ← 1\nadjMatrix[${v}, ${u}] ← 1`;
      return {
        prompt: [
          p(
            "プログラム中の空欄に入る答えを選べ。無向グラフの辺リストを対称な隣接行列に変換する。自己接続はなく、配列の添字は1から始まる。",
          ),
          p(
            `頂点番号は${1 + offset}〜${5 + offset}であり、行列の行・列の添字は頂点番号から${offset}を引いた値である。`,
          ),
          figure(
            "undirected-graph",
            [offset, variant],
            "図1　グラフの例",
            "5頂点の無向グラフ。辺の端点を同じ値で辺リストと行列へ対応させる。",
          ),
          figure(
            "adjacency-matrix",
            [offset, variant],
            "図2　隣接行列",
            "行列の対角は0で、辺のある二つの対称な位置に1を置く。",
          ),
          code(
            `○整数型の二次元配列: edgesToMatrix(整数型配列の配列: edgeList, 整数型: nodeNum)\n    整数型の二次元配列: adjMatrix ← {nodeNum行nodeNum列の0}\n    整数型: i, u, v\n    for (iを1からedgeListの要素数まで増やす)\n        u ← edgeList[i][1]\n        v ← edgeList[i][2]\n        【空欄】\n    endfor\n    return adjMatrix`,
          ),
        ],
        choices: programs(
          alternatives(
            correct,
            [
              `adjMatrix[${u}, ${u}] ← 1`,
              `adjMatrix[${u}, ${u}] ← 1\nadjMatrix[${v}, ${v}] ← 1`,
              `adjMatrix[${u}, ${v}] ← 1`,
              `adjMatrix[${v}, ${u}] ← 1`,
              `adjMatrix[${v}, ${v}] ← 1`,
            ],
            6,
          ),
        ),
        explanation: `頂点番号を添字へ変換し、u→vとv→uの両方を1にする。片方だけでは対称にならず、対角へ書くと自己接続になる。例の辺は${graphEdges(
          variant,
        )
          .map((a) => a.map((n) => n + offset).join("−"))
          .join("、")}。`,
      };
    },
  ),
  def(
    "2024-b-4",
    "併合処理の末尾コピー回数",
    "イ",
    [field("二つの配列の配置", 0, 5), field("値の加算値", 0, 20)],
    [0, 0],
    ([pattern, offset]) => {
      const raw = [
          [
            [2, 3],
            [1, 4],
          ],
          [
            [1, 2],
            [3, 4],
          ],
          [
            [3, 4],
            [1, 2],
          ],
          [
            [1, 4],
            [2, 3],
          ],
          [
            [1, 3],
            [2, 4],
          ],
          [
            [2, 4],
            [1, 3],
          ],
        ][pattern],
        a = raw[0].map((n) => n + offset),
        b = raw[1].map((n) => n + offset),
        count = mergeTailCount(a, b);
      return {
        prompt: [
          p(
            `空欄に入る答えを選べ。merge({${a.join(", ")}}, {${b.join(", ")}})として呼び出したとき、/*** α ***/は【空欄】回実行される。配列は昇順で、添字は1から始まる。`,
          ),
          code(
            `○整数型の配列: merge(整数型の配列: data1, data2)\n    整数型: n1 ← data1の要素数, n2 ← data2の要素数\n    整数型の配列: work ← {(n1 + n2)個の未定義の値}\n    整数型: i ← 1, j ← 1, k ← 1\n    while ((i ≦ n1) and (j ≦ n2))\n        if (data1[i] ≦ data2[j])\n            work[k] ← data1[i]\n            i ← i + 1\n        else\n            work[k] ← data2[j]\n            j ← j + 1\n        endif\n        k ← k + 1\n    endwhile\n    while (i ≦ n1)\n        work[k] ← data1[i]\n        i ← i + 1\n        k ← k + 1\n    endwhile\n    while (j ≦ n2)\n        work[k] ← data2[j] /*** α ***/\n        j ← j + 1\n        k ← k + 1\n    endwhile\n    return work`,
          ),
        ],
        choices: strings(["0", "1", "2", "3"]),
        correctIndex: count,
        explanation: `比較するループが終わった時点で、data2に残った要素数がαの実行回数である。この入力では${count}個残る。併合した全体の要素数を答えるのではない。`,
      };
    },
  ),
  def(
    "2024-b-5",
    "購買データの関連度の空欄",
    "オ",
    [field("求める指標", 0, 3), field("注文の例", 0, 2)],
    [0, 0],
    ([metric, variant]) => {
      const orders = [
        ["A", "B", "D"],
        ["A", "D"],
        ["A"],
        ["A", "B", "E"],
        ["B"],
        ["C", "E"],
      ];
      if (variant === 1) orders[2] = ["A", "E"];
      if (variant === 2) orders[4] = ["B", "D"];
      const names = [
          "リフト",
          "itemを購入した条件で他商品を買う確率",
          "両商品が同時に買われる支持度",
          "他商品を購入した条件でitemを買う確率",
        ],
        formula = [
          "\\frac{M N}{K_x K_y}",
          "\\frac{M}{K_x}",
          "\\frac{M}{N}",
          "\\frac{M}{K_y}",
        ],
        c = [
          "ordersの要素数",
          "arrayK[i]",
          "itemCount × arrayK[i] ÷ ordersの要素数",
          "itemCount",
        ][metric];
      const correct = ["arrayM[i]", "arrayK[i]", c],
        cs = alternatives(
          c,
          [
            "ordersの要素数",
            "arrayK[i]",
            "itemCount",
            "1",
            "otherItemsの要素数",
            "allItemsの要素数",
          ],
          3,
        );
      return {
        prompt: [
          p(
            `空欄a〜cに入る正しい組合せを選べ。注文データから${names[metric]}を計算する。Mは同時購入数、Nは全注文数、Kx・Kyはそれぞれの商品を含む注文数。計算は実数として行う。`,
          ),
          table(
            "注文データの例",
            ["注文番号", "購入された商品のリスト"],
            orders.map((row, i) => [String(i + 1), row.join(", ")]),
          ),
          {
            type: "formula",
            format: "latex",
            text: formula[metric],
            alt: `指標は${names[metric]}。M、N、Kx、Kyの定義に従って計算する。`,
          },
          code(
            `大域: 文字列型配列の配列: orders ← {${orders.map((a) => `{${a.map((s) => `"${s}"`).join(", ")}}`).join(", ")}}\n○putRelatedItem(文字列型: item)\n    文字列型の配列: otherItems ← orders中の異なる商品からitemを除く\n    整数型: itemCount ← 0, i\n    整数型の配列: arrayK ← {otherItemsの要素数個の0}\n    整数型の配列: arrayM ← {otherItemsの要素数個の0}\n    for (orderにordersの要素を順に代入する)\n        if (orderにitemが含まれる)\n            itemCount ← itemCount + 1\n        endif\n        for (iを1からotherItemsの要素数まで増やす)\n            if (orderにotherItems[i]が含まれる)\n                if (orderにitemが含まれる)\n                    【a】の値を1増やす\n                endif\n                【b】の値を1増やす\n            endif\n        endfor\n    endfor\n    for (iを1からotherItemsの要素数まで増やす)\n        valueL ← (arrayM[i] × 【c】) ÷ (itemCount × arrayK[i])\n        最大のvalueLと対応する商品を記録する\n    endfor\n    記録した商品とvalueLを出力する`,
          ),
        ],
        choices: pairs(
          [
            correct,
            [correct[0], correct[1], cs[1]],
            [correct[0], correct[1], cs[2]],
            ...cs.map((x) => ["arrayK[i]", "arrayM[i]", x]),
          ],
          ["a", "b", "c"],
        ),
        explanation: `arrayMは同時購入数、arrayKは他商品の購入数。c=${c}を代入して、提示した${names[metric]}の式へ整理する。Nを掛けるのはリフトの場合であり、別の指標では正規化が異なる。`,
      };
    },
  ),
  def(
    "2025-b-3",
    "スタックの添字と位置管理",
    "イ",
    [
      field("位置変数の基準差", 0, 3),
      field("スタックの容量", 4, 8),
      field("最初の値", 1, 9),
      field("二つ目の値", 1, 9),
    ],
    [0, 4, 4, 3],
    ([offset, cap, x, y]) => {
      const at = indexOf("stackPos", offset),
        a = at,
        b = "stackPos − 1";
      return {
        prompt: [
          p(
            "空欄a・bへ入る正しい組合せを選べ。pushは格納に成功するとtrue、満杯ならfalseを返す。popは最後に格納した値を取り出し、空なら未定義の値を返す。配列の添字は1から始まる。",
          ),
          p(
            `stackPosには次の空き位置に${offset}を加えた値を保持する。図は初期状態で、網掛けは未定義の要素。`,
          ),
          figure(
            "stack",
            [offset, cap, x, y],
            "図　スタックの初期状態",
            "先頭の二つの要素が格納済みで、それ以外は未定義。位置変数が示す空き位置と基準差を区別する。",
          ),
          code(
            `大域: 整数型: stackPos ← ${3 + offset}\n大域: 整数型の配列: stack ← {${x}, ${y}, ${cap - 2}個の未定義の値}\n○論理型: push(整数型: inputData)\n    if (${at} ≦ stackの要素数)\n        stack[【a】] ← inputData\n        stackPos ← stackPos + 1\n        return true\n    endif\n    return false\n○整数型: pop()\n    整数型: popData ← 未定義の値\n    if (${at} > 1)\n        stackPos ← 【b】\n        popData ← stack[${at}]\n        stack[${at}] ← 未定義の値\n    endif\n    return popData`,
          ),
        ],
        choices: pairs([
          [a, b],
          [a, "stackPos ＋ 1"],
          [`${at} − 1`, b],
          [`${at} − 1`, "stackPos ＋ 1"],
        ]),
        explanation: `物理的な添字はstackPosから基準差${offset}を引いた値。pushは次の空きへ格納し、popは先に位置変数を1戻してから読む。`,
      };
    },
  ),
  def(
    "2025-b-4",
    "文字列検索の比較回数",
    "ク",
    [field("検索対象の並び", 0, 5), field("検索キー", 0, 5)],
    [0, 0],
    ([dataIndex, keyIndex]) => {
      const data = [
          "ababcabc",
          "abcabcab",
          "aaaaaaaa",
          "bcabcbca",
          "cbacbacb",
          "abababab",
        ][dataIndex],
        key = ["abc", "aba", "aaa", "bca", "cab", "bac"][keyIndex],
        answer = matchingPrefixCount(data, key);
      return {
        prompt: [
          p(
            `記述中の空欄に入る答えを選べ。searchはdataにあるkeyと同じ並びの先頭の要素番号を全て返す。search({${[...data].map((s) => `"${s}"`).join(", ")}}, {${[...key].map((s) => `"${s}"`).join(", ")}})では、βの条件式が真になる回数は【空欄】回である。`,
          ),
          code(
            `○整数型の配列: search(文字型の配列: data, key)\n    整数型の配列: result ← {}\n    整数型: i, j\n    for (iを1からdataの要素数 − keyの要素数 + 1まで増やす)\n        for (jを1からkeyの要素数まで増やす) // α\n            if (data[i + j - 1] = key[j]) /*** β ***/\n                if (j = keyの要素数)\n                    resultの末尾にiを追加する\n                endif\n            else\n                αから始まる繰返しを終了する\n            endif\n        endfor\n    endfor\n    return result`,
          ),
        ],
        choices: strings(
          alternatives(
            String(answer),
            Array.from({ length: 19 }, (_, i) => String(i)),
            10,
          ),
        ),
        explanation: `開始位置ごとに、最初の不一致までの一致した比較を数える。完全一致した出現回数だけではなく、部分的に一致した比較も含める。この入力では合計${answer}回。`,
      };
    },
  ),
  def(
    "2025-b-5",
    "分割表の理論度数",
    "オ",
    [
      field("接種あり・罹患なし", 20, 100),
      field("接種あり・罹患あり", 1, 20),
      field("接種なし・罹患なし", 20, 100),
      field("接種なし・罹患あり", 1, 20),
    ],
    [82, 6, 58, 8],
    (v) => {
      const [a, b, c, d] = v,
        answer = expectedCounts(v),
        correct = answer.map(clean);
      const choices = [
        correct,
        ...[
          [-2, -1],
          [-1, 1],
          [1, -1],
          [2, 1],
          [1, 2],
          [2, -2],
        ].map(([x, y]) => [clean(answer[0] + x), clean(answer[1] + y)]),
      ];
      return {
        prompt: [
          p(
            "記述中のa・bに入る組合せを選べ。病気にかかるかどうかと予防接種の有無が独立だと仮定した理論度数を計算する。端数は小数第3位を四捨五入する。医学的な予防効果を判定する設問ではない。",
          ),
          table(
            "表1　集計結果（人）",
            ["", "かからなかった", "かかった"],
            [
              ["接種あり", String(a), String(b)],
              ["接種なし", String(c), String(d)],
            ],
          ),
          table(
            "表2　理論度数（人）",
            ["", "かからなかった", "かかった"],
            [
              ["接種あり", "a", "非表示"],
              ["接種なし", "非表示", "b"],
            ],
          ),
          code(
            "○実数型の二次元配列: f(実数型の二次元配列: data)\n    実数型: t ← dataの要素の和\n    実数型の二次元配列: result ← {dataと同じ大きさ}\n    for (rを1からdataの行数まで増やす)\n        for (cを1からdataの列数まで増やす)\n            result[r,c] ← (行rの合計) × (列cの合計) ÷ t\n        endfor\n    endfor\n    return result",
          ),
        ],
        choices: pairs(choices),
        explanation: `総数=${a + b + c + d}。aは接種ありの行合計×非罹患の列合計÷総数=${correct[0]}、bは接種なしの行合計×罹患の列合計÷総数=${correct[1]}。実測の人数とは分けて計算する。`,
      };
    },
  ),
  def(
    "2026-b-1",
    "配列の右への回転",
    "エ",
    [field("右へ移動する要素数", 1, 4), field("配列の要素数", 6, 12)],
    [1, 9],
    ([shift, len]) => {
      const correct = `${len}から${shift + 1}まで1ずつ減らす`,
        input = Array.from({ length: len }, (_, i) => i + 1);
      return {
        prompt: [
          p(
            `空欄に入る答えを選べ。末尾${shift}個の要素を先頭へ移し、残りを${shift}要素分だけ後ろへ移動する。添字は1から始まり、領域外を参照しない。`,
          ),
          code(
            `整数型の配列: data ← {${input.join(", ")}}\n${shift === 1 ? `整数型: top ← data[${len}]` : `整数型の配列: top ← dataの末尾${shift}個の複製`}\n整数型: i\nfor (iを【空欄】)\n    data[i] ← data[i − ${shift}]\nendfor\n${shift === 1 ? "data[1] ← top" : `for (iを1から${shift}まで増やす)\n    data[i] ← top[i]\nendfor`}`,
          ),
        ],
        choices: programs([
          correct,
          `${shift + 1}から${len}まで1ずつ増やす`,
          `${len - 1}から${shift + 1}まで1ずつ減らす`,
          `${shift + 1}から${len - 1}まで1ずつ増やす`,
        ]),
        explanation: `後ろからコピーすることで、まだ使う元の値を上書きしない。正しい範囲は${len}〜${shift + 1}の降順。結果は{${[...input.slice(-shift), ...input.slice(0, -shift)].join(", ")}}。移動個数を増やす版では一時保存も同じ個数へ改変している。`,
      };
    },
  ),
  def(
    "2026-b-4",
    "配列による単方向リスト",
    "エ",
    [field("次ポインタの基準差", 0, 3), field("格納値の倍率", 1, 5)],
    [0, 1],
    ([offset, scale]) => {
      const a = "pointerList[p]",
        b = indexOf("pointerList[p]", offset),
        values = [10, 30, 20, 40].map((n) => n * scale);
      return {
        prompt: [
          p(
            "空欄a・bへ入る組合せを選べ。dataListに値、pointerListに次の要素へのポインタを保持する。先頭は要素1、末尾のポインタは未定義である。",
          ),
          p(
            `次ポインタは実際の要素番号に${offset}を加えた値で保存する。orderListは先頭からたどった順の値を返す。`,
          ),
          figure(
            "linked-arrays",
            [offset, scale],
            "図1　dataListとpointerList",
            "dataListは10、30、20、40を倍率で調整して格納。ポインタをたどる順は1→3→2→4。",
          ),
          figure(
            "ordered-array",
            [scale],
            "図2　返す配列",
            "ポインタをたどった順に値を格納した配列。",
          ),
          code(
            `大域: 整数型の配列: dataList ← {${values.join(", ")}, 未定義の値}\n大域: 整数型の配列: pointerList ← {${3 + offset}, ${4 + offset}, ${2 + offset}, 未定義の値, 未定義の値}\n○整数型の配列: orderList()\n    整数型: i, p ← 1\n    整数型の配列: linearList ← {}\n    for (iを1からdataListの要素数まで増やす)\n        linearListの末尾にdataList[p]を追加する\n        if (【a】が未定義)\n            繰返しを終了する\n        endif\n        p ← 【b】\n    endfor\n    return linearList`,
          ),
        ],
        choices: pairs([
          [a, b],
          ["dataList[p]", "i"],
          ["dataList[p]", b],
          [a, "i"],
        ]),
        explanation: `末尾判定は値ではなくpointerList[p]で行う。次の実際の添字は基準差${offset}を引いて求める。1→3→2→4の順に、{${[10, 20, 30, 40].map((n) => n * scale).join(", ")}}を返す。`,
      };
    },
  ),
  def(
    "2026-b-5",
    "One-Hot表現への変換",
    "イ",
    [field("走査添字の基準差", 0, 3), field("色の並び", 0, 3)],
    [0, 0],
    ([offset, which]) => {
      const input = palettes[which],
        a = `colors[${indexOf("i", offset)}]`,
        b = `colors[${indexOf("j", offset)}] が colorVector[k] と等しい`,
        membership = "colorsの要素のいずれかにcolorVector[k]が格納されている";
      return {
        prompt: [
          p(
            "空欄a・bへ入る組合せを選べ。色の名前を初出順に名前一覧へ追加し、その一覧の中の位置だけが1となるOne-Hot表現へ変換する。配列の添字は1から始まる。",
          ),
          p(`走査変数i・jには実際の要素番号に${offset}を加えた値を使う。`),
          figure(
            "onehot",
            [which],
            "図　関数oneHotEncodingの変換例",
            "初出順の色の一覧に対応して各色をOne-Hotベクトルへ変換する。",
          ),
          code(
            `○整数型配列の配列: oneHotEncoding(文字列型の配列: colors)\n    文字列型の配列: colorVector ← {}\n    整数型配列の配列: oneHotVector ← {}\n    整数型: i, j, k\n    for (iを${offset + 1}からcolorsの要素数 + ${offset}まで増やす)\n        if (colorVectorにcolors[${indexOf("i", offset)}]が含まれない)\n            colorVectorの末尾に【a】を追加する\n        endif\n    endfor\n    for (jを${offset + 1}からcolorsの要素数 + ${offset}まで増やす)\n        tempVector ← {}\n        for (kを1からcolorVectorの要素数まで増やす)\n            if (【b】)\n                tempVectorの末尾に1を追加する\n            else\n                tempVectorの末尾に0を追加する\n            endif\n        endfor\n        oneHotVectorの末尾にtempVectorを追加する\n    endfor\n    return oneHotVector`,
          ),
        ],
        choices: pairs([
          [a, b],
          [a, membership],
          ["未定義の値", membership],
          ["未定義の値", b],
        ]),
        explanation: `aで現在の名前を記録し、bで現在変換する一つの色と一覧のk番目を比較する。入力{${input.join(", ")}}の結果は{${onehot(
          input,
        )
          .map((a) => `{${a.join(", ")}}`)
          .join(
            ", ",
          )}}。全体のどこかに色があるかを調べる条件では全ての位置が1になる。`,
      };
    },
  ),
];
