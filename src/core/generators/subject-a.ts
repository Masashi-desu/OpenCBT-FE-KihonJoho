import {
  type GenerationDefinition,
  field,
  p,
  code,
  table,
  list,
  figure,
  strings,
  alternatives,
  numbers,
  variableNotes,
} from "./definition";

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
export function permutations<T>(items: T[]): T[][] {
  return items.length
    ? items.flatMap((item, i) =>
        permutations(items.filter((_, j) => j !== i)).map((rest) => [
          item,
          ...rest,
        ]),
      )
    : [[]];
}
export function euclidTrace(a: number, b: number): number[] {
  const trace = [1];
  let m = a,
    n = b;
  for (let i = 0; i < 64; i++) {
    trace.push(2);
    if (m === n) {
      trace.push(6);
      return trace;
    }
    trace.push(3);
    if (m > n) {
      m -= n;
      trace.push(4);
    } else {
      n -= m;
      trace.push(5);
    }
  }
  throw Error("Euclid trace bound");
}
export const projectPairs = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [1, 6],
  [1, 3],
  [2, 7],
  [2, 4],
  [4, 5],
];
export function projectDuration(v: number[]) {
  const [a, b, c, d, e, f, g, h, i] = v;
  const t2 = a + Math.max(b, e),
    t3 = Math.max(t2 + c, a + f, t2 + g);
  return Math.max(t3 + d, t2 + h) + i;
}
export function scatterPoints(sign: number, noise: number) {
  return Array.from({ length: 7 }, (_, i) => i).flatMap((i) =>
    [-0.15, -0.05, 0.05, 0.15].map((dx, j) => [
      i + 1 + dx,
      Math.round(
        ((sign === 2 ? [5, 4, 3, 2, 3, 4, 5][i] : sign === 0 ? 9 - i : 2 + i) +
          [-0.6, 0.6, 0.6, -0.6][j] * (1 + noise * 0.25)) *
          1000,
      ) / 1000,
    ]),
  );
}
export const signalInputs = [
  [0, 1, 0, 0, 0, 1, 0],
  [1, 0, 0, 1, 0, 1, 0],
];
export function circuitValue(mask: number, a: number, b: number) {
  const x = mask & 1 ? 1 - a : a,
    y = mask & 2 ? 1 - b : b,
    z = mask & 4 ? 1 - (x & y) : x & y;
  return mask & 8 ? 1 - z : z;
}
export function signalValues(mask: number, phase: number) {
  const a = signalInputs[0].map((_, i) => signalInputs[0][(i + phase) % 7]),
    b = signalInputs[1].map((_, i) => signalInputs[1][(i + phase) % 7]);
  return [...a, ...b, ...a.map((x, i) => circuitValue(mask, x, b[i]))];
}
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

export const subjectADefinitions: GenerationDefinition[] = [
  def(
    "2023-a-2",
    "双方向リストへの挿入",
    "ウ",
    [field("挿入する位置", 0, 3), field("アドレスの倍率", 1, 5)],
    [0, 1],
    ([position, scale]) => {
      const addresses = [100, 200, 300, 400].map((n) => n * scale),
        location = [
          "社員Aと社員Kの間",
          "社員Kと社員Tの間",
          "社員Aの前（新しい先頭）",
          "社員Tの後（新しい末尾）",
        ][position];
      const changed = ["a，f", "d，e", "b", "c"][position];
      return {
        prompt: [
          p(
            `表の双方向リストへ社員Gを${location}に追加する。追加前と比べて変わるポインタa〜fだけを全て列記したものはどれか。0は参照先がないことを示す。`,
          ),
          table(
            "追加前",
            ["アドレス", "社員名", "次ポインタ", "前ポインタ"],
            [
              [`${addresses[0]}`, "社員A", `${addresses[2]}`, "0"],
              [`${addresses[1]}`, "社員T", "0", `${addresses[2]}`],
              [
                `${addresses[2]}`,
                "社員K",
                `${addresses[1]}`,
                `${addresses[0]}`,
              ],
            ],
          ),
          table(
            "追加後",
            ["アドレス", "社員名", "次ポインタ", "前ポインタ"],
            [
              [`${addresses[0]}`, "社員A", "a", "b"],
              [`${addresses[1]}`, "社員T", "c", "d"],
              [`${addresses[2]}`, "社員K", "e", "f"],
              [`${addresses[3]}`, "社員G", "x", "y"],
            ],
          ),
        ],
        choices: strings(
          alternatives(changed, [
            "a，b，e，f",
            "a，e，f",
            "a，f",
            "b，e",
            "d，e",
            "c，d",
          ]),
        ),
        explanation: `挿入する場所は${location}。前後の既存ノードだけを社員Gへ向け直すので、${changed}だけが変わる。先頭・末尾への挿入では片側の既存ノードだけを更新する。G自身のx・yは新規作成なのでa〜fの変更に含めない。`,
      };
    },
  ),
  def(
    "2023-a-6",
    "推移的関数従属",
    "ウ",
    [field("関数従属の連鎖", 0, 3)],
    [0],
    ([index]) => {
      const triples = [
          ["注文コード", "顧客コード", "顧客住所"],
          ["商品コード", "仕入先コード", "仕入先住所"],
          ["注文コード", "注文担当者コード", "担当者名"],
          ["商品コード", "分類コード", "分類名"],
        ],
        [a, b, c] = triples[index];
      const correct = `${a} → ${b} → ${c}`;
      return {
        prompt: [
          p(
            "次の関数従属が成立するとき、推移的関数従属として成立するものはどれか。ここで、X→YはYがXに関数従属することを表し、X→{Y，Z}はX→YかつX→Zが成立することを表す。記載以外の従属は仮定しない。",
          ),
          list([
            "{注文コード，商品コード} → {顧客注文数量，注文金額}",
            "注文コード → {注文日，顧客コード，注文担当者コード}",
            `商品コード → {商品名，${index === 3 ? "分類コード" : "仕入先コード"}，商品販売価格}`,
            index === 2
              ? "注文担当者コード → {担当者名，説明}"
              : index === 3
                ? "分類コード → {分類名，説明}"
                : "仕入先コード → {仕入先名，仕入先住所，仕入担当者コード}",
            "顧客コード → {顧客名，顧客住所}",
          ]),
        ],
        choices: strings([
          correct,
          `${b} → ${c} → 説明`,
          `${a} → ${c} → ${b}`,
          `${c} → ${b} → ${a}`,
        ]),
        explanation: `${a}から${b}が定まり、${b}から${c}が定まるので、${a}から${c}が推移的に定まる。${c}から他の属性が定まるとは与えられていない。`,
      };
    },
  ),
  def(
    "2023-a-10",
    "WAFの設置場所",
    "ウ",
    [field("TLS復号を行う位置", 0, 1), field("位置記号の配置", 0, 3)],
    [1, 0],
    ([decrypt, rotation]) => {
      const location = ["ファイアウォール", "SSLアクセラレータ"][decrypt],
        labels = ["a", "b", "c", "d"].map((_, i) => "abcd"[(i + rotation) % 4]),
        answer = labels[decrypt + 1];
      return {
        prompt: [
          p(
            `図の構成でWebアプリケーションへの攻撃を検査するWAFは、通信の暗号化・復号を行えない。TLSの復号を${location}で行い、復号後はHTTPでWeb要求を伝送する。WAFの設置場所として適切な箇所はどれか。`,
          ),
          figure(
            "waf-network",
            [decrypt, rotation],
            "ネットワーク構成",
            `利用者、ファイアウォール、SSLアクセラレータ、Webサーバ、データベースサーバの順。位置記号は上から${labels.join("、")}。${location}でTLSを復号し、dに相当する末尾の区間はデータベースアクセス。`,
          ),
        ],
        choices: strings([
          answer,
          ...["a", "b", "c", "d"].filter((x) => x !== answer),
        ]),
        explanation: `暗号化された内容はこのWAFでは検査できない。${location}で復号した直後の${answer}がHTTPの検査対象となる。末尾のデータベースアクセスはWeb要求とは区別する。`,
      };
    },
  ),
  def(
    "2023-a-11",
    "流れ図の実行経路",
    "エ",
    [field("初期値比の候補", 0, 3)],
    [3],
    ([which]) => {
      const values = [
          [2, 1],
          [1, 2],
          [3, 2],
          [2, 3],
        ],
        trace = euclidTrace(...(values[which] as [number, number])),
        relations = ["a＝2b", "2a＝b", "2a＝3b", "3a＝2b"];
      return {
        prompt: [
          p(
            `次の流れ図を${trace.map((n) => "①②③④⑤⑥"[n - 1]).join(" → ")}の順で実行するために、aとbへ与える初期値の関係はどれか。a、bは正の整数である。`,
          ),
          figure(
            "euclid-flow",
            [which],
            "流れ図",
            "mとnを初期化し、等しいなら印字して終了。等しくなければ大きい方から小さい方を引き、比較へ戻る。",
          ),
        ],
        choices: strings(relations),
        correctIndex: which,
        explanation: `比a:b＝${values[which].join(":")}で大小を追跡すると、${trace.join("→")}となる。ほかの比は分岐④・⑤の順序又は回数が異なる。`,
      };
    },
  ),
  def(
    "2023-a-13",
    "作業短縮の最少追加費用",
    "エ",
    [
      field("クリティカルな枝", 0, 2),
      field("上側で安価な作業", 0, 1),
      field("共通作業の日数増分", 0, 5),
    ],
    [0, 1, 0],
    ([branch, cheap, offset]) => {
      const days = [4 + offset, 6, 8, 4, 5, 4, 5 + offset];
      if (branch === 1) days[2] = 12;
      if (branch === 2) {
        days[3] = 7;
        days[5] = 5;
      }
      const costs = [
          4,
          cheap === 0 ? 2 : 6,
          3,
          2,
          cheap === 0 ? 6 : 2.5,
          branch === 2 ? 3 : 2.5,
          5,
        ],
        answer =
          branch === 0 ? (cheap === 0 ? "B" : "E") : branch === 1 ? "C" : "D";
      return {
        prompt: [
          p(
            "図の予定に対し作業Aで1日の遅れが生じた。当初の予定日数で終えるため、1日短縮する追加費用を最少にする作業はどれか。各作業は1日短縮でき、表は1日当たりの増加費用を示す。",
          ),
          figure(
            "crash-network",
            days,
            "作業ネットワーク",
            "Aの後にB→E、C、D→Fの三つの枝があり、合流後にGを行う。実線の上が作業名、下が標準日数。",
          ),
          table(
            "費用増加率",
            ["作業名", "費用増加率"],
            costs.map((n, i) => ["ABCDEFG"[i], String(n)]),
          ),
        ],
        choices: strings(["B", "C", "D", "E"]),
        correctIndex: ["B", "C", "D", "E"].indexOf(answer),
        explanation: `三つの枝の長さはB+E=${days[1] + days[4]}、C=${days[2]}、D+F=${days[3] + days[5]}日。最長の枝を1日短縮する必要があり、共通作業A・Gも含めて費用を比較すると${answer}が最少となる。`,
      };
    },
  ),
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
    "2024-a-19",
    "散布図の相関",
    "エ",
    [field("相関の種類", 0, 2), field("点の散らばり", 0, 2)],
    [0, 0],
    ([sign, noise]) => ({
      prompt: [
        p(
          "製造上の要因xと品質特性yの関係を散布図に示す。この図から読み取れるものはどれか。",
        ),
        figure(
          "scatter",
          [sign, noise],
          "散布図",
          "xが増す方向に対するyの点の並びを示す。線形相関の符号を読み取る。",
        ),
      ],
      choices: strings([
        "xとyの相関係数は負である。",
        "xとyの相関係数は正である。",
        "xとyの線形相関係数は0である。",
        "全ての点でxとyが等しい。",
      ]),
      correctIndex: sign,
      explanation: `点の共分散を計算すると${sign === 0 ? "負" : sign === 1 ? "正" : "0"}である。単に一部の点を見るのでなく、全体の増減の関係を読む。非線形な関係があっても線形相関が0になる場合がある。`,
    }),
  ),
  def(
    "2025-a-3",
    "2分探索木の大小関係",
    "イ",
    [field("ラベルの巡回配置", 0, 6), field("左右の配置", 0, 1)],
    [0, 0],
    ([rotation, mirror]) => {
      const label = (i: number) => "abcdefg"[(i + rotation) % 7],
        indices = mirror ? [6, 2, 5, 0, 4, 1, 3] : [3, 1, 4, 0, 5, 2, 6],
        correct = indices.map(label).join("＜");
      return {
        prompt: [
          p(
            "図の木構造は2分探索木である。各値は重複しない。a〜gの大小関係として適切なものはどれか。",
          ),
          figure(
            "bst",
            [rotation, mirror],
            "2分探索木",
            "各節点の左の部分木は小さく、右の部分木は大きい値をもつ。",
          ),
        ],
        choices: strings(
          alternatives(correct, [
            [...indices].reverse().map(label).join("＜"),
            [0, 1, 2, 3, 4, 5, 6].map(label).join("＜"),
            [3, 4, 5, 6, 1, 2, 0].map(label).join("＜"),
            [1, 3, 4, 0, 2, 5, 6].map(label).join("＜"),
          ]),
        ),
        explanation: `左の部分木、節点、右の部分木の順にたどる中間順走査では${correct}となる。ラベルのアルファベット順で判断しない。`,
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
    "2025-a-6",
    "SQLの条件の等価性",
    "ウ",
    [field("集合条件", 0, 3), field("仕入先の組", 0, 2)],
    [0, 0],
    ([mode, pair]) => {
      const [lo, hi] = [
          ["M002", "M004"],
          ["M001", "M003"],
          ["M001", "M004"],
        ][pair],
        expr = [
          `仕入先ID IN ('${lo}', '${hi}')`,
          `仕入先ID NOT IN ('${lo}', '${hi}')`,
          `仕入先ID BETWEEN '${lo}' AND '${hi}'`,
          `仕入先ID NOT BETWEEN '${lo}' AND '${hi}'`,
        ][mode];
      const equivalents = [
        `仕入先ID = '${lo}' OR 仕入先ID = '${hi}'`,
        `仕入先ID <> '${lo}' AND 仕入先ID <> '${hi}'`,
        `仕入先ID >= '${lo}' AND 仕入先ID <= '${hi}'`,
        `仕入先ID < '${lo}' OR 仕入先ID > '${hi}'`,
      ];
      return {
        prompt: [
          p(
            "商品表に対する次のSQL文と同じ結果になるSELECT文はどれか。仕入先IDはNULLを含まない。",
          ),
          table(
            "商品",
            ["商品ID", "商品名称", "仕入先ID", "単価"],
            [
              ["S001", "冷蔵庫", "M001", "155000"],
              ["S002", "食器洗い機", "M002", "85000"],
              ["S003", "電子レンジ", "M003", "78000"],
              ["S004", "炊飯器", "M003", "32000"],
              ["S005", "コーヒーメーカー", "M004", "15000"],
              ["S006", "ホットプレート", "M004", "12000"],
            ],
          ),
          code(`SELECT * FROM 商品 WHERE ${expr}`, "sql"),
        ],
        choices: equivalents.map((e) => [
          code(`SELECT * FROM 商品 WHERE ${e}`, "sql"),
        ]),
        correctIndex: mode,
        explanation: `この集合条件は${equivalents[mode]}と等価である。INは列挙した値のいずれか、BETWEENは両端を含む範囲であり、間にある値の扱いが異なる。`,
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
    "2026-a-1",
    "遷移確率表の関係",
    "イ",
    [field("入力軸の向き", 0, 1), field("記号の配置", 0, 23)],
    [0, 0],
    ([axis, perm]) => {
      const labels = permutations(["a", "b", "c", "d"])[perm],
        [a, b, c, d] = labels;
      const correct =
        axis === 0
          ? `${a}＋${b}＝1，${c}＋${d}＝1`
          : `${a}＋${c}＝1，${b}＋${d}＝1`;
      return {
        prompt: [
          p(
            "入力ビットが与えられたとき、出力ビットが0又は1となる条件付き確率を表に示す。a、b、c、dの関係として適切なものはどれか。",
          ),
          table(
            "遷移確率",
            [axis === 0 ? "入力＼出力" : "出力＼入力", "0", "1"],
            [
              ["0", a, b],
              ["1", c, d],
            ],
          ),
        ],
        choices: strings(
          alternatives(correct, [
            `${a}＋${b}＋${c}＋${d}＝1`,
            `${a}＋${b}＝1，${c}＋${d}＝1`,
            `${a}＋${c}＝1，${b}＋${d}＝1`,
            `${a}＋${d}＝1，${b}＋${c}＝1`,
          ]),
        ),
        explanation: `入力を一つに固定したときの、全ての出力の確率の和は1。入力が${axis === 0 ? "行" : "列"}で表されるので、${correct}となる。入力が異なる確率をまとめて1とはしない。`,
      };
    },
  ),
  def(
    "2026-a-6",
    "論理回路とタイミングチャート",
    "イ",
    [field("四つのゲートの反転マスク", 0, 15), field("入力信号の位相", 0, 6)],
    [15, 0],
    ([mask, phase]) => {
      const correct = signalValues(mask, phase),
        masks = alternatives(
          JSON.stringify(correct),
          Array.from({ length: 16 }, (_, i) =>
            JSON.stringify(signalValues(i, phase)),
          ),
          4,
        ).map((s) => JSON.parse(s) as number[]);
      return {
        prompt: [
          p(
            "図の回路のAとBへ信号を入力したとき、出力Yのタイミングチャートとして適切なものはどれか。ゲートの出力の小円は論理反転を示す。",
          ),
          figure(
            "logic-circuit",
            [mask],
            "論理回路",
            "四つのAND形ゲートを接続し、小円のある出力を反転する。最初と最後のゲートは同じ信号を両入力へ接続する。",
          ),
        ],
        choices: masks.map((v) => [
          figure(
            "waveform",
            v,
            "タイミングチャート",
            "上からA、B、Y。1と0の値を同じ時間区間で比較する。",
          ),
        ]),
        explanation: `ゲート順に入力と反転を計算すると、Yは${correct.slice(14).join("、")}となる。マスク${mask}は四つのゲートの出力反転の有無であり、データから回路コードを実行するものではない。`,
      };
    },
  ),
  def(
    "2026-a-7",
    "SQLの主キー制約",
    "エ",
    [field("違反する命令の種類", 0, 3), field("商品コードの枝番", 0, 9)],
    [0, 0],
    ([kind, seed]) => {
      const key = (n: number) => (seed ? `B${seed}${n}${n}` : `A${n}${n}${n}`),
        fresh = seed ? `Z${seed}77` : "A777",
        bad = [
          `UPDATE 商品 SET 商品コード = '${fresh}' WHERE 在庫数 >= 20`,
          `INSERT INTO 商品 VALUES ('${key(1)}', '追加商品', 'S005', 60000, 50)`,
          `UPDATE 商品 SET 商品コード = '${key(1)}' WHERE 商品コード = '${key(4)}'`,
          `INSERT INTO 商品 VALUES (NULL, '追加商品', 'S005', 60000, 50)`,
        ][kind];
      const good = [
        "DELETE FROM 商品 WHERE 仕入先コード IS NULL",
        `INSERT INTO 商品 VALUES ('${key(5)}', '空気清浄機', 'S005', 60000, 50)`,
        `UPDATE 商品 SET 商品コード = '${key(6)}' WHERE 商品コード = '${key(4)}'`,
      ];
      return {
        prompt: [
          p(
            "次の定義と商品表に対し、主キー制約違反で実行エラーになるSQL文はどれか。各選択肢は同じ元の表へ独立して実行する。",
          ),
          code(
            "CREATE TABLE 商品\n(商品コード CHAR(4) PRIMARY KEY, 商品名 VARCHAR(21),\n 仕入先コード CHAR(4), 仕入単価 INT, 在庫数 INT)",
            "sql",
          ),
          table(
            "商品",
            ["商品コード", "商品名", "仕入先コード", "仕入単価", "在庫数"],
            [
              [key(1), "テレビ", "S001", "75000", "0"],
              [key(2), "デジタルカメラ", "S002", "50000", "50"],
              [key(3), "DVDプレーヤ", "NULL", "NULL", "NULL"],
              [key(4), "洗濯機", "S004", "45000", "20"],
            ],
          ),
        ],
        choices: [bad, ...good].map((s) => [code(s, "sql")]),
        explanation: `主キーは重複とNULLを認めない。${kind === 0 ? "二つの行に同じ新コードを設定する" : kind === 1 ? "存在するコードをもう一度挿入する" : kind === 2 ? "更新先が別の既存行のコードと重なる" : "主キーへNULLを挿入する"}ため、選択した命令は失敗する。`,
      };
    },
  ),
  def(
    "2026-a-9",
    "認証要素の組合せ",
    "ウ",
    [field("異なる認証要素の組", 0, 8)],
    [0],
    ([index]) => {
      const known = ["パスワード", "PIN", "暗証番号"],
        possessed = [
          "ハードウェアトークン",
          "スマートカード",
          "クライアント証明書",
        ],
        bio = ["静脈", "指紋", "顔"],
        group = Math.floor(index / 3),
        i = index % 3;
      const answer =
        group === 0
          ? `${known[i]}認証、${bio[i]}認証`
          : group === 1
            ? `${known[i]}認証、${possessed[i]}`
            : `${possessed[i]}、${bio[i]}認証`;
      return {
        prompt: [
          p(
            "知識・所持・生体のうち、異なる二種類の要素を組み合わせた2要素認証に該当するものはどれか。",
          ),
        ],
        choices: strings([
          answer,
          "クライアント証明書、ハードウェアトークン",
          "静脈認証、指紋認証",
          "パスワード認証、秘密の質問の答え",
        ]),
        explanation: `${answer}は${["知識と生体", "知識と所持", "所持と生体"][group]}の組合せ。証明書とトークンはともに所持、二つの生体方式はともに生体、パスワードと秘密の質問はともに知識である。`,
      };
    },
  ),
  def(
    "2026-a-18",
    "学習を伴うAIの事例",
    "ア",
    [field("固定処理の事例", 0, 3)],
    [0],
    ([index]) => {
      const fixed = [
        "制御量と目標値との差に対し、固定したPID係数で修正するモーター制御",
        "あらかじめ登録した質問と完全に一致する場合だけ、固定の回答を返す処理",
        "固定した順路をそのまま繰り返し移動する掃除機",
        "全ての合法手を固定の深さだけ列挙し、設定済みの評価式で選ぶ処理",
      ][index];
      return {
        prompt: [
          p(
            "本問では、データからモデルや方策を学習し、その結果を判断へ利用するものを学習型AIとする。この事例として適切でないものはどれか。",
          ),
        ],
        choices: strings([
          fixed,
          "部屋の構造を学習し、移動する経路を選ぶ掃除ロボット",
          "学習した言語モデルで質問の意味を推測し、回答するチャットボット",
          "多数の対局データから学習した方策で手を選ぶゲームソフト",
        ]),
        explanation: `${fixed}は、この問題で定めた学習型AIの条件に該当しない。固定のルールを使う処理全般をAIでないと断定する設問ではなく、対象の定義を問題文で限定した改変問題である。`,
      };
    },
  ),
];
