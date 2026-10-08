// Frozen published 3.2.0 calculations. Keep these for saved snapshots and
// continuation of old runs; current distribution templates use 3.3.0.
import {
  type GenerationDefinition,
  field,
  p,
  code,
  table,
  figure,
  strings,
  pairs,
  alternatives,
  variableNotes,
} from "./definition";
// Freeze supporting calculations as well as the option builders.
function projectDuration(v: number[]) {
  const [a, b, c, d, e, f, g, h, i] = v;
  const t2 = a + Math.max(b, e),
    t3 = Math.max(t2 + c, a + f, t2 + g);
  return Math.max(t3 + d, t2 + h) + i;
}
function matchingPrefixCount(data: string, key: string) {
  let count = 0;
  for (let i = 0; i <= data.length - key.length; i++)
    for (let j = 0; j < key.length; j++) {
      if (data[i + j] !== key[j]) break;
      count++;
    }
  return count;
}
function expectedCounts(data: number[]) {
  const [a, b, c, d] = data,
    total = a + b + c + d;
  return [((a + b) * (a + c)) / total, ((c + d) * (b + d)) / total];
}
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
    version: "3.2.0",
  };
}
const clean = (n: number) => Number(n.toFixed(2)).toString();
const ratioChoices = (answer: number) =>
  alternatives(
    answer.toFixed(4).replace(/0+$/, ""),
    [
      answer + 0.01,
      answer - 0.01,
      answer + 0.05,
      answer - 0.05,
      answer + 0.1,
      answer - 0.1,
    ]
      .filter((x) => x >= 0 && x <= 1)
      .map((x) => x.toFixed(4).replace(/0+$/, "")),
  );
function numbers(correct: number): string[] {
  return alternatives(
    String(correct),
    Array.from({ length: 12 }, (_, i) =>
      String(correct + (i % 2 ? -1 : 1) * (Math.floor(i / 2) + 1)),
    ),
  );
}
export const publishedCalculationDefinitions: GenerationDefinition[] = [
  def(
    "2024-a-3",
    "CPU間の処理時間とヒット率",
    "イ",
    [
      field("ヒット率の百分率", 70, 96),
      field("アクセス時間差の倍率", 1, 5),
      field("CPU Yのキャッシュ時間", 5, 30),
      field("CPU Xの主記憶時間", 100, 600),
    ],
    [90, 2, 20, 400],
    ([percent, scale, cy, mx]) => {
      const cx = cy + (100 - percent) * scale,
        my = mx + percent * scale,
        h = percent / 100;
      return {
        prompt: [
          p(
            "図の構成で、表のアクセス時間だけが異なるCPU XとCPU Yがある。同じプログラムの処理時間が等しいとき、キャッシュのヒット率は幾らか。他の条件の差やCPU以外の影響はない。",
          ),
          figure(
            "cache-layout",
            [256, 256],
            "図　構成",
            "CPU内の256kバイトのキャッシュと256Mバイトの主記憶が接続される。",
          ),
          table(
            "アクセス時間（ナノ秒）",
            ["対象", "CPU X", "CPU Y"],
            [
              ["キャッシュメモリ", `${cx}`, `${cy}`],
              ["主記憶", `${mx}`, `${my}`],
            ],
          ),
        ],
        choices: strings(ratioChoices(h)),
        explanation: `ヒット率をhとすると${cx}h+${mx}(1−h)＝${cy}h+${my}(1−h)。従ってh＝(${my}−${mx})／(${cx}−${cy}+${my}−${mx})＝${h}。`,
      };
    },
  ),
  def(
    "2025-a-4",
    "毎年の保守改善と稼働率",
    "ウ",
    [
      field("初年度MTBF", 1000, 8000),
      field("初年度MTTR", 500, 2000),
      field("毎年の改善時間", 20, 150),
      field("経過年数", 1, 6),
    ],
    [4000, 1000, 100, 6],
    ([mtbf, mttr, delta, years]) => {
      const b = mtbf + delta * years,
        r = mttr - delta * years;
      if (r <= 0) throw new Error("PARAMETER_CONSTRAINT");
      const rate = b / (b + r);
      return {
        prompt: [
          p(
            `MTBFが${mtbf}時間、MTTRが${mttr}時間の装置である。今後${years}年間、MTBFは毎年${delta}時間増加し、MTTRは毎年${delta}時間減少する。${years}年後の稼働率は幾らか。小数第5位を四捨五入する。`,
          ),
        ],
        choices: strings(ratioChoices(rate)),
        explanation: `改善後はMTBF=${b}、MTTR=${r}時間。稼働率=${b}／(${b}+${r})=${rate.toFixed(4)}。毎年の増減を年数分だけ積み重ねる。`,
      };
    },
  ),
  def(
    "2025-a-7",
    "回線利用率",
    "エ",
    [
      field("動画のGバイト数", 1, 5),
      field("回線速度Mビット毎秒", 40, 400),
      field("経過分", 3, 15),
      field("制御情報の百分率", 0, 25),
    ],
    [1, 40, 5, 20],
    ([gb, mbps, minutes, overhead]) => {
      const rate =
        ((gb * 8000 * (100 + overhead)) / 100 / (mbps * minutes * 60)) * 100;
      if (rate > 100) throw new Error("PARAMETER_CONSTRAINT");
      const rounded = Math.round(rate);
      return {
        prompt: [
          p(
            `${gb}Gバイトの動画を${mbps}Mビット／秒の回線でダウンロードし、${minutes}分かかった。動画には${overhead}％の制御情報が付加される。回線利用率はおよそ何％か。ここではG=10の9乗、M=10の6乗とし、整数％へ四捨五入する。`,
          ),
        ],
        choices: strings(numbers(rounded)),
        explanation: `データ量を8倍してビットへ変換し、制御情報を加える。利用率は${gb}×8000×${1 + overhead / 100}／(${mbps}×${minutes}×60)×100=${rounded}％。`,
      };
    },
  ),
  def(
    "2025-a-14",
    "ダミーを含むプロジェクトの所要日数",
    "エ",
    "ABCDEFGHI".split("").map((c) => field(`作業${c}の日数`, 1, 20)),
    [3, 6, 8, 6, 5, 14, 11, 15, 5],
    (v) => ({
      prompt: [
        p(
          "図はプロジェクトの作業A〜Iと作業日数を示す。全てが完了する最短所要日数は何日か。",
        ),
        figure(
          "project-network",
          v,
          "作業ネットワーク",
          "A後にBとEとFが分岐。E完了後にB終点へダミー、B終点からC・G・Hへ進む。G後にC終点へダミー。CとFとGが合流してD、DとHが合流してI。",
        ),
      ],
      choices: strings(numbers(projectDuration(v))),
      explanation: `BとEが合流する時刻は${v[0] + Math.max(v[1], v[4])}。C・F・Gの合流、DとHの合流で流入時刻の最大を採用し、Iを加える。最少日数は${projectDuration(v)}日。ダミーの依存関係も含める。`,
    }),
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
            `記述中の空欄に入る答えを選べ。配列の要素番号は1から始まる。keyは要素数1以上の文字型の配列である。searchはdataにあるkeyと同じ並びの先頭の要素番号を全て返し、見つからなければ要素数0の配列を返す。search({${[...data].map((s) => `"${s}"`).join(", ")}}, {${[...key].map((s) => `"${s}"`).join(", ")}})では、βの条件式が真になる回数は【空欄】回である。`,
          ),
          code(
            `○整数型の配列: search(文字型の配列: data, key)\n    整数型の配列: result ← {}\n    整数型: i, j\n    /* dataの要素数 − keyの要素数 + 1が0以下のときは、繰返し処理を実行しない */\n    for (iを1からdataの要素数 − keyの要素数 + 1まで増やす)\n        for (jを1からkeyの要素数まで増やす) // α\n            if (data[i + j - 1] = key[j]) /*** β ***/\n                if (j = keyの要素数)\n                    resultの末尾にiを追加する\n                endif\n            else\n                αから始まる繰返しを終了する\n            endif\n        endfor\n    endfor\n    return result`,
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
            "記述中のa・bに入る組合せを選べ。病気にかかるかどうかと予防接種の有無が独立だと仮定した理論度数を計算する。配列の要素番号は1から始まる。関数fの引数と戻り値は二次元配列で、行と列は表の行と列に対応する。表2の『非表示』は値を表示していない部分を示す。端数は小数第3位を四捨五入する。",
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
];
