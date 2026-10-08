import type { Attribution, Block, Question, Template } from "./types";
import { DataError } from "./errors";
import { validateAdditionalFormat } from "./generators";
import {
  activityNetworkAlt,
  activityNetworkPositions,
  activityNetworkRenderer,
  readActivityNetwork,
} from "./activity-network";

const paragraph = (text: string): Block => ({ type: "paragraph", text });
const program = (text: string): Block => ({
  type: "code",
  language: "pseudocode",
  text,
});
const table = (
  caption: string,
  columns: string[],
  rows: string[][],
): Block => ({ type: "table", caption, columns, rows });
const number = (n: number) => n.toLocaleString("ja-JP");
const inputs = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];
const logicValue = (op: number, x: number, y: number) =>
  [x & y, x | y, x ^ y, 1 - (x & y), 1 - (x | y), 1 - (x ^ y), (1 - x) | y][
    op - 1
  ];
const ruleTitle = (text: string): Block => ({
  type: "heading",
  level: 3,
  text,
});
const bullets = (items: string[]): Block => ({
  type: "list",
  ordered: false,
  items,
});
const rules: Block[] = [
  ruleTitle("1. ログの取得"),
  paragraph("次のログを取得すること。"),
  bullets([
    "ログイン及びログアウトのログ",
    "クラウドサービスでの重要な操作及びその成否に関するログ",
  ]),
  ruleTitle("2. ログの項目"),
  paragraph("少なくとも次が記録されること。"),
  bullets(["対象のアカウント名、日本標準時での日時、操作内容"]),
  ruleTitle("3. ログのアクセス管理"),
  bullets([
    "運用担当者だけがログにアクセスできるようにすること。",
    "ログをエクスポートして保存する場合は、社内ネットワークに設置した自部署のファイルサーバへ保存し、運用担当者だけが保存先のログにアクセスできるようにすること。",
    "運用担当者は2名以上にすること。",
    "クラウドサービスへの運用担当者のログインには、2要素認証を必要とすること。",
  ]),
  ruleTitle("4. ログの保存期間"),
  bullets(["少なくとも過去1年間のログが参照できるようにすること。"]),
  ruleTitle("5. 改ざんへの対策"),
  bullets([
    "運用担当者であっても過去ログの上書き及び消去ができないようにすること。",
  ]),
];

// Version 2 retains the source's prose/table/diagram/code and answer format.
// This is a managed generator, never an evaluator for data-supplied code.
export function preserveSourceFormat(
  q: Question,
  t: Template,
  v: number[],
  notes: string,
  instanceId: string,
  at: string,
): Question {
  const id = t.generatorRef.id.replace("generator-", "");
  const adapted = t.attribution;
  const own: Attribution = {
    origin: "original",
    sourceRefs: [],
    rightsRefs: ["rights-original"],
    creatorIds: t.editorIds,
  };
  const choices = (blocks: Block[][]) =>
    blocks.map((blocks, i) => ({
      id: `choice-value-${i + 1}`,
      content: { attribution: adapted, blocks },
    }));
  const explanation = (text: string) => {
    q.explanation = { attribution: own, blocks: [paragraph(text)] };
  };
  if (id === "hex-fraction") {
    q.prompt.blocks = q.prompt.blocks.filter((b) => b.type === "paragraph");
  } else if (id === "logic-table") {
    const [op, rotation] = v;
    const result = inputs.map(([x, y]) => logicValue(op, x, y));
    q.prompt.blocks = [
      paragraph(
        "X及びYは0又は1をとる変数であり、X □ Yは未知の論理演算を表す。次の表が得られたとき、X □ Yの真理値表はどれか。",
      ),
      table(
        "与えられた真理値表",
        ["X", "Y", "X AND (X □ Y)", "X OR (X □ Y)"],
        inputs.map(([x, y], i) => [
          String(x),
          String(y),
          String(x & result[i]),
          String(x | result[i]),
        ]),
      ),
    ];
    const other = [1, 2, 3, 4, 5, 6, 7].filter((n) => n !== op);
    const candidates = [
      op,
      ...[0, 1, 2].map((i) => other[(rotation + i) % other.length]),
    ];
    q.choices = choices(
      candidates.map((n) => [
        table(
          "X □ Y の真理値表",
          ["X", "Y", "X □ Y"],
          inputs.map(([x, y]) => [
            String(x),
            String(y),
            String(logicValue(n, x, y)),
          ]),
        ),
      ]),
    );
    explanation(
      `X=0の行ではOR列が未知の演算値を示し、X=1の行ではAND列が未知の演算値を示す。従って入力00・01・10・11に対する値は${result.join("・")}。この4行がすべて一致する真理値表が正答となる。`,
    );
  } else if (id === "hash-collision") {
    q.prompt.blocks = [
      paragraph(
        `小文字のアルファベット1文字をキーとするデータを、大きさ${v[0]}のハッシュ表に格納する。ハッシュ値にはキーのASCIIコードを${v[0]}で割った余りを用いる。衝突が起こるキーの組合せはどれか。ASCIIコードではaが97で、小文字はアルファベット順に連続している。`,
      ),
    ];
  } else if (id === "availability") {
    q.prompt.blocks = [
      paragraph(
        `あるシステムの今年度のMTBFは${number(v[0])}時間、MTTRは${number(v[1])}時間である。翌年度はMTBFを今年度より${v[2]}％増加させ、MTTRを今年度より${v[3]}％減少させると、翌年度の稼働率は何％になるか。計算した百分率は小数第1位を四捨五入し、整数％で答える。`,
      ),
    ];
  } else if (id === "critical-path") {
    const figure = q.prompt.blocks.find((b) => b.type === "diagram");
    if (!figure || figure.type !== "diagram" || figure.scene.kind !== "graph")
      throw new DataError("SOURCE_FORMAT", "アローダイアグラムがありません");
    figure.rendererRef = { ...activityNetworkRenderer };
    figure.scene.nodes = figure.scene.nodes.map((node, i) => ({
      ...node,
      x: activityNetworkPositions[i][0],
      y: activityNetworkPositions[i][1],
    }));
    figure.caption = "アローダイアグラム";
    figure.alt = activityNetworkAlt(figure.scene);
    q.prompt.blocks = [
      paragraph(
        "アローダイアグラムで表されるプロジェクトは、完了までに最少で何日を要するか。",
      ),
      figure,
    ];
    const paths = [
      [0, 1, 4, 7],
      [0, 2, 5, 7],
      [0, 3, 6, 7],
      [0, 1, 5, 7],
      [0, 2, 6, 7],
      [0, 1, 6, 7],
    ];
    const totals = paths.map((path) => path.reduce((sum, i) => sum + v[i], 0));
    explanation(
      `破線のダミー作業は依存関係を表し、日数は0として計算する。開始から完了までの経路は${paths.map((path, i) => `${path.map((index) => "ABCDEFGH"[index]).join("→")}＝${totals[i]}日`).join("、")}。全ての作業が完了する最少日数は、このうち最大の${Math.max(...totals)}日となる。`,
    );
  } else if (id === "service-gain") {
    q.prompt.blocks = [
      paragraph(
        "ある会社はデータセンタで運用するアプリケーションをクラウドサービスへ移行し、サービス可用性を改善する。次の条件のとき、移行後の可用性は何パーセントポイント向上するか。各可用性の百分率は小数第3位を切り捨てる。",
      ),
      {
        type: "list",
        ordered: false,
        items: [
          `計画保守の時間を除いたサービス提供時間は、移行前後とも年間${number(v[0])}時間である。`,
          `移行前のサービス提供時間内の停止時間は年間${number(v[1])}時間である。`,
          `移行後のサービス提供時間内の停止時間は年間${number(v[2])}分である。`,
        ],
      },
    ];
  } else if (id === "count-multiples") {
    const [n, m, divisor] = v;
    const a = `iを1から${divisor - 1}まで1ずつ増やす`;
    const b = `jをtempNから始めてmを超えない範囲で${divisor}ずつ増やす`;
    const wrongA = `iを1から${divisor - 2}まで1ずつ増やす`;
    const wrongB = [
      `jをnから始めてmを超えない範囲でtempNずつ増やす`,
      "jをtempNからmまで1ずつ増やす",
    ];
    q.prompt = {
      attribution: adapted,
      blocks: [
        paragraph(
          "次のプログラム中の空欄【a】と【b】に入る正しい答えの組合せを選べ。",
        ),
        paragraph(
          `function1とfunction2に同じ引数を与えると、二つの関数は同じ値を返す。nとmは正の整数で、mはnより10以上大きい。modは整数の余りを表す。`,
        ),
        program(
          `○整数型: function1(整数型: n, 整数型: m)\n    整数型: count ← 0\n    整数型: i\n    for (iをnからmまで1ずつ増やす)\n        if ((i mod ${divisor}) が 0 と等しい)\n            count ← count + 1\n        endif\n    endfor\n    return count\n\n○整数型: function2(整数型: n, 整数型: m)\n    整数型: count ← 0\n    整数型: tempN ← n\n    整数型: i, j\n    for (【a】)\n        if ((tempN mod ${divisor}) が 0 と等しい)\n            繰返し処理を終了する\n        endif\n        tempN ← tempN + 1\n    endfor\n    for (【b】)\n        count ← count + 1\n    endfor\n    return count`,
        ),
      ],
    };
    q.choices = choices(
      [
        [a, b],
        [wrongA, wrongB[0]],
        [wrongA, wrongB[1]],
        [wrongA, b],
        [a, wrongB[0]],
        [a, wrongB[1]],
      ].map((row) => [table("空欄の組合せ", ["a", "b"], [row])]),
    );
    const count = Math.floor(m / divisor) - Math.floor((n - 1) / divisor);
    explanation(
      `最初の倍数までの移動は最大${divisor - 1}回である。空欄aでその回数を確保し、空欄bでtempNから${divisor}刻みに数えれば、すべてのn・mでfunction1と一致する。独自の動作確認例n=${n}、m=${m}では、区間内の倍数は${count}個。例の戻り値そのものを選ぶ設問ではない。`,
    );
  } else if (id === "coin-change") {
    const [n, offset] = v;
    q.prompt = {
      attribution: adapted,
      blocks: [
        paragraph("次のプログラム中の空欄【a】に入る正しい条件を選べ。"),
        paragraph(
          `関数changeは10より大きい整数nを受け取り、1円玉・5円玉・10円玉でちょうどn円にする枚数の組合せの総数を返す。順序は区別しない。残額を扱う変数restには、実際の残額に${offset}を加えた値を保持する。floorは小数部を切り捨てた整数を表す。`,
        ),
        paragraph(
          `例えば${n}円では、10円玉を0枚から順に増やし、各残額に対して5円玉を使う枚数を数え上げる。`,
        ),
        program(
          `○整数型: change(整数型: n)\n    整数型: count ← 0\n    整数型: rest ← n + ${offset}\n    while (【a】)\n        count ← count + floor((rest - ${offset}) / 5) + 1\n        rest ← rest - 10\n    endwhile\n    return count`,
        ),
      ],
    };
    q.choices = choices(
      [
        `rest ≧ ${offset}`,
        `rest ≧ ${offset + 5}`,
        `rest ≧ ${offset + 10}`,
        `rest > ${offset}`,
        `rest > ${offset + 5}`,
        `rest > ${offset + 10}`,
      ].map((s) => [program(s)]),
    );
    let count = 0;
    for (let rest = n; rest >= 0; rest -= 10) count += Math.floor(rest / 5) + 1;
    explanation(
      `実際の残額はrest−${offset}であり、0円の場合も1通りとして数えるため、条件はrest≧${offset}。5円玉の枚数は0〜floor(残額/5)、残りは1円玉で支払う。説明用の${n}円では${count}通り。閾値・更新式・枚数計算は同じオフセットを使う。`,
    );
  } else if (id === "complement") {
    const [x, width] = v,
      ones = "1".repeat(width),
      low = "0" + "1".repeat(width - 1);
    const binary = (n: number) => n.toString(2).padStart(width, "0");
    q.prompt = {
      attribution: adapted,
      blocks: [
        paragraph("次のプログラム中の空欄【a】に入る正しい式を選べ。"),
        paragraph(
          `関数complementは${width}ビット型のxを受け取り、xに加算すると${"0".repeat(width)}になる値を返す。加算は符号なし2進数として行い、桁あふれは無視する。AND・OR・XORはビットごとの論理積・論理和・排他的論理和である。`,
        ),
        program(
          `○${width}ビット型: complement(${width}ビット型: x)\n    ${width}ビット型: y\n    y ← 【a】\n    y ← y + ${"0".repeat(width - 1)}1\n    return y`,
        ),
      ],
    };
    q.choices = choices(
      [
        `x XOR ${ones}`,
        `x AND ${low}`,
        `x AND ${ones}`,
        `x OR ${low}`,
        `x OR ${ones}`,
        `x XOR ${low}`,
      ].map((s) => [program(s)]),
    );
    explanation(
      `全${width}ビットを反転してから1を加えると2の補数になる。したがって空欄はx XOR ${ones}。独自の動作確認例x=${binary(x)}では、反転後${binary(x ^ (2 ** width - 1))}、加算後${binary((2 ** width - x) % 2 ** width)}となる。xの具体値を選ぶ設問ではない。`,
    );
  } else if (id === "recurrence") {
    const [n, coefficient] = v;
    q.prompt = {
      attribution: adapted,
      blocks: [
        paragraph(
          "次のプログラム中の空欄【a】に入る正しい式を選べ。配列の要素番号は1から始まる。",
        ),
        paragraph(
          "func1とfunc2に同じ正の整数を与えると、二つの関数は同じ値を返す。配列の領域外を参照してはならない。",
        ),
        program(
          `○整数型: func1(整数型: n)\n    if (n ≦ 2)\n        return 1\n    endif\n    return ${coefficient} × func1(n - 2) + func1(n - 1)\n\n○整数型: func2(整数型: n)\n    整数型の配列: data ← {1, 1, 1}\n    整数型: i\n    /* nが3より小さい場合は繰返し処理を実行しない */\n    for (iを3からnまで1ずつ増やす)\n        data[1] ← data[2]\n        data[2] ← data[3]\n        data[3] ← 【a】\n    endfor\n    return data[3]`,
        ),
      ],
    };
    q.choices = choices(
      [
        `${coefficient} × data[1] + data[2]`,
        `${coefficient} × data[2] + data[1]`,
        `${coefficient} × data[i - 1] + data[i - 2]`,
        `${coefficient} × data[i - 2] + data[i - 1]`,
        `data[3] + ${coefficient} × data[1] + data[2]`,
        `data[3] + ${coefficient} × data[2] + data[1]`,
        `data[3] + ${coefficient} × data[i - 1] + data[i - 2]`,
        `data[3] + ${coefficient} × data[i - 2] + data[i - 1]`,
      ].map((s) => [program(s)]),
    );
    const values = [1, 1];
    for (let i = 2; i < n; i++)
      values.push(coefficient * values[i - 2] + values[i - 1]);
    explanation(
      `更新後のdata[1]は2項前、data[2]は1項前である。従って空欄は${coefficient} × data[1] + data[2]。iを添字にすると繰返し中に配列の範囲を超える。独自の動作確認例n=${n}では[${values.join(", ")}]の順に計算し、戻り値は${values[n - 1]}。`,
    );
  } else if (id === "security-log") {
    const [operators, access, jst, overwrite] = v;
    q.contexts = [
      {
        id: "context-security",
        title: "問題の状況",
        content: {
          attribution: adapted,
          blocks: [
            paragraph(
              "ある会社の営業部は、社内のYサーバと顧客管理用のZサービスを利用する。一般利用者はYサーバ上の業務ファイルを編集でき、運用担当者が管理者アカウントでサーバとサービスを管理している。",
            ),
            paragraph(
              "情報セキュリティ部門は図1のログ管理ルールを整備した。担当者がルールの遵守状況を確認し、現在の運用を表1にまとめた。担当者のログインには2要素認証を用いている。",
            ),
          ],
        },
      },
      {
        id: "context-security-rules",
        title: "図1　ログ管理に関するルール",
        presentation: "text_figure",
        content: {
          attribution: adapted,
          blocks: structuredClone(rules),
        },
      },
    ];
    q.contextRefs = q.contexts.map((c) => c.id);
    q.prompt = {
      attribution: adapted,
      blocks: [
        table(
          "表1　現在の運用",
          ["項番", "運用"],
          [
            [
              "(一)",
              `容量が不足すると、古いログを${overwrite ? "上書きする" : "上書きせず別の保存領域を確保する"}。`,
            ],
            ["(二)", `Zサービスの運用担当者は現在${operators}名である。`],
            ["(三)", `ログの日時は${jst ? "日本標準時" : "UTC"}で記録する。`],
            [
              "(四)",
              `ログを毎月Yサーバへエクスポートする。保存先のログは${access ? "一般利用者も" : "運用担当者だけが"}アクセスできる。`,
            ],
          ],
        ),
        paragraph(
          "表1の運用のうち、図1のルール3に違反する項番だけを全て挙げた組合せを選べ。",
        ),
      ],
    };
    const correctMask = (operators < 2 ? 2 : 0) | (access ? 8 : 0);
    const label = (mask: number) =>
      ["(一)", "(二)", "(三)", "(四)"]
        .filter((_, i) => mask & (1 << i))
        .join("、") || "該当なし";
    q.choices = choices(
      [
        correctMask,
        ...[3, 7, 11, 5, 13, 9, 6, 14, 10, 12, 0, 2, 8, 1, 4, 15]
          .filter((m) => m !== correctMask)
          .slice(0, 9),
      ].map((m) => [paragraph(label(m))]),
    );
    explanation(
      `ルール3は担当者限定のアクセス、エクスポート先の制限、複数担当者と2要素認証を求める。担当者${operators}名${operators < 2 ? "は人数条件に違反" : "は適合"}し、保存先のログは${access ? "一般利用者もアクセスできるため違反" : "担当者限定で適合"}する。上書きはルール5、日時はルール2の論点である。従って${label(correctMask)}。`,
    );
  }
  q.id = `question-${instanceId}`;
  q.revision = 1;
  q.origin.kind = "official_adaptation";
  q.origin.isModified = true;
  q.origin.modificationBasis = "official_source";
  q.origin.derivedFrom = [t.baseQuestionRef];
  q.origin.changes.push({
    at,
    actorId: t.editorIds[0],
    kind: "numbers",
    summary: "原問題の出題形式を維持してパラメータをバインド",
    details: `${notes} 入力は${t.parameterDomain.fields!.map((f, i) => `${f.name}=${v[i]}`).join("、")}。`,
    affectsAnswer: true,
    answerDetails: q.explanation.blocks
      .filter((b) => b.type === "paragraph")
      .map((b) => b.text)
      .join("\n"),
  });
  q.correctAnswer = { choiceId: "choice-value-1", attribution: own };
  q.assetRefs = [];
  q.choiceShuffleAllowed = true;
  validateSourceFormat(q, t);
  return q;
}

export function validateSourceFormat(q: Question, t: Template) {
  if (["3.2.0", "3.3.0"].includes(t.generatorRef.version)) {
    validateAdditionalFormat(q, t);
    return;
  }
  if (!["2.1.0", "2.2.0"].includes(t.generatorRef.version)) return;
  const formats: Record<string, [string[], number, string]> = {
    "hex-fraction": [["paragraph"], 4, "paragraph"],
    "logic-table": [["paragraph", "table"], 4, "table"],
    "hash-collision": [["paragraph"], 4, "paragraph"],
    availability: [["paragraph"], 4, "paragraph"],
    "critical-path": [["paragraph", "diagram"], 4, "paragraph"],
    "service-gain": [["paragraph", "list"], 4, "paragraph"],
    "cafe-profit": [["paragraph", "table"], 4, "paragraph"],
    retention: [["paragraph", "table"], 4, "paragraph"],
    "count-multiples": [["paragraph", "paragraph", "code"], 6, "table"],
    "coin-change": [["paragraph", "paragraph", "paragraph", "code"], 6, "code"],
    complement: [["paragraph", "paragraph", "code"], 6, "code"],
    recurrence: [["paragraph", "paragraph", "code"], 8, "code"],
    "security-log": [["table", "paragraph"], 10, "paragraph"],
  };
  const format = formats[t.generatorRef.id.replace("generator-", "")];
  if (
    !format ||
    JSON.stringify(q.prompt.blocks.map((b) => b.type)) !==
      JSON.stringify(format[0]) ||
    q.choices.length !== format[1] ||
    q.choices.some(
      (c) =>
        c.content.blocks.length !== 1 || c.content.blocks[0].type !== format[2],
    )
  )
    throw new DataError(
      "SOURCE_FORMAT",
      "原問題の出題形式と生成契約が一致しません",
    );
  if (
    t.generatorRef.id === "generator-security-log" &&
    (q.contexts.length !== 2 || q.contexts[1].presentation !== "text_figure")
  )
    throw new DataError(
      "SOURCE_FORMAT",
      "ログ管理の文章図と本文の構成が一致しません",
    );
  if (t.generatorRef.id === "generator-critical-path") {
    const figure = q.prompt.blocks.find((b) => b.type === "diagram");
    if (!figure || figure.type !== "diagram")
      throw new DataError("SOURCE_FORMAT", "アローダイアグラムがありません");
    readActivityNetwork(figure.scene);
  }
}
