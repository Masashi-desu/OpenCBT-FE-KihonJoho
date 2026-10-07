import type { Question, Template, Block, Scene, Attribution } from "./types";
import { DataError } from "./errors";
import { preserveSourceFormat } from "./generation-formats";
import { sha256 } from "./hash";
import {
  additionalContracts,
  bindAdditionalQuestion,
  checkAdditionalParameters,
} from "./generators";
export async function parametersForSeed(
  seed: string,
  t: Template,
): Promise<{ values: number[] }> {
  if (!/^[a-f0-9]{32}$/.test(seed))
    throw new DataError("SEED", "不正なシードです");
  validateTemplateContract(t);
  if (t.generatorRef.id !== "generator-array-sum")
    return sampleParameters(seed, t);
  const values: number[] = [];
  for (let counter = 0; counter < 16 && values.length < 3; counter++) {
    const h = await sha256(
      `${seed}\n${t.id}\n${t.revision}\n${t.generatorRef.id}\n${t.generatorRef.version}\n${counter}`,
    );
    for (let i = 0; i < h.length && values.length < 3; i += 2) {
      const byte = parseInt(h.slice(i, i + 2), 16);
      if (byte < 252) values.push((byte % 9) + 1);
    }
  }
  if (values.length !== 3)
    throw new DataError("SEED", "パラメータ抽選の上限に達しました");
  return { values };
}
export function bindArraySum(
  base: Question,
  t: Template,
  values: number[],
  instanceId: string,
  at: string,
): Question {
  if (
    t.generatorRef.id !== "generator-array-sum" ||
    t.generatorRef.version !== "1.0.0" ||
    values.length !== 3 ||
    values.some((v) => !Number.isInteger(v) || v < 1 || v > 9)
  )
    throw new DataError("PARAMETER_DOMAIN", "生成器又は入力値が未対応です");
  const q = structuredClone(base),
    [a, b, c] = values,
    sum = a + b + c,
    attr = t.attribution;
  q.id = `question-${instanceId}`;
  q.revision = 1;
  q.origin.isModified = true;
  q.origin.modificationBasis = t.bindingBasis;
  q.origin.derivedFrom = [t.baseQuestionRef];
  if (q.origin.kind === "official_reprint")
    q.origin.kind = "official_adaptation";
  q.origin.changes.push({
    at,
    actorId: t.editorIds[0],
    kind: "numbers",
    summary: "入力値を生成・バインドした問題",
    details:
      "保持した元データを基準に、本文・表・図・選択肢・正答・解説を同じ入力値から確定した。元の値と一致してもバインド実施を改変ありとして記録する。",
    affectsAnswer: true,
    answerDetails: `入力値[${values.join(", ")}]、総和${sum}。`,
  });
  q.prompt = {
    attribution: attr,
    blocks: [
      {
        type: "paragraph",
        text: `整数配列valuesは[${values.join(",")}]で、添字は1から始まる。次の処理後のtotalを選ぶ。`,
      },
      {
        type: "table",
        caption: "入力値",
        columns: ["添字", "値"],
        rows: values.map((v, i) => [String(i + 1), String(v)]),
      },
      {
        type: "diagram",
        id: "diagram-values",
        rendererRef: { id: "renderer-diagram-basic", version: "1.0.0" },
        caption: "valuesの配列",
        alt: values.map((v, i) => `添字${i + 1}の値は${v}`).join("、") + "。",
        attribution: attr,
        scene: {
          kind: "array",
          cells: values.map((v, i) => ({
            id: `cell-${i + 1}`,
            index: i + 1,
            value: v,
          })),
        },
      },
      {
        type: "code",
        language: "pseudocode",
        text: "整数型: total ← 0\nfor (i を 1 から 3 まで 1 ずつ増やす)\n    total ← total + values[i]\nendfor",
      },
    ],
  };
  q.choices = [
    ["choice-minus-one", sum - 1],
    ["choice-sum", sum],
    ["choice-plus-one", sum + 1],
    ["choice-plus-three", sum + 3],
  ].map(([id, v]) => ({
    id: String(id),
    content: {
      attribution: attr,
      blocks: [{ type: "paragraph", text: String(v) }],
    },
  }));
  q.correctAnswer = { choiceId: "choice-sum", attribution: attr };
  q.explanation = {
    attribution: attr,
    blocks: [
      {
        type: "paragraph",
        text: `初期値0に${a}、${b}、${c}を順に加える。途中値は${a}、${a + b}、${sum}で、最終値は${sum}である。`,
      },
    ],
  };
  return q;
}

type Field = { name: string; minimum: number; maximum: number };
type Contract = {
  id: string;
  title: string;
  source: string;
  fields: Field[];
  reference: number[];
  notes: string;
};
const field = (name: string, minimum: number, maximum: number): Field => ({
  name,
  minimum,
  maximum,
});
const legacyContracts: Contract[] = [
  {
    id: "hex-fraction",
    title: "16進小数の変換",
    source: "2023-a-1",
    fields: [field("16進小数の値", 1, 255), field("16進小数の桁数", 1, 2)],
    reference: [12, 1],
    notes: "原問題の0.Cを基準値とする。",
  },
  {
    id: "logic-table",
    title: "真理値表と論理演算",
    source: "2024-a-1",
    fields: [field("演算種別", 1, 7), field("誤答候補の回転", 0, 6)],
    reference: [7, 0],
    notes:
      "原問題の表は含意の真理値に一致する。生成版では表から演算を選ぶ設問へ変更する。",
  },
  {
    id: "hash-collision",
    title: "ハッシュ表の衝突",
    source: "2024-a-2",
    fields: [
      field("表の大きさ", 5, 13),
      field("第1キーのASCII", 97, 109),
      field("第2キーのASCII", 98, 122),
    ],
    reference: [10, 100, 120],
    notes: "原問題の表の大きさ10と正答のd・xを基準値とする。",
  },
  {
    id: "availability",
    title: "MTBF・MTTRと稼働率",
    source: "2024-a-4",
    fields: [
      field("MTBF（時間）", 100, 6000),
      field("MTTR（時間）", 100, 2000),
      field("MTBFの改善率（％）", 0, 40),
      field("MTTRの改善率（％）", 1, 40),
    ],
    reference: [3000, 1000, 20, 10],
    notes: "原問題の数値を基準とする。生成版では整数％への四捨五入を明記する。",
  },
  {
    id: "critical-path",
    title: "アローダイアグラムの最短完了日数",
    source: "2024-a-13",
    fields: "ABCDEFGH".split("").map((n) => field(`作業${n}の日数`, 1, 60)),
    reference: [30, 5, 30, 20, 40, 25, 30, 30],
    notes: "原問題の作業と2本の0日ダミーを維持し、図を独自描画する。",
  },
  {
    id: "service-gain",
    title: "サービス可用性の改善",
    source: "2026-a-14",
    fields: [
      field("年間提供時間（時間）", 500, 10000),
      field("移行前停止（時間）", 10, 200),
      field("移行後停止（分）", 1, 600),
    ],
    reference: [5000, 100, 30],
    notes: "原問題の数値と小数第3位切捨てを基準とする。",
  },
  {
    id: "cafe-profit",
    title: "喫茶店の利益と必要客数",
    source: "2025-a-19",
    fields: [
      field("1人の売上（円）", 100, 1500),
      field("1人の変動費（円）", 50, 800),
      field("固定費（円）", 50000, 500000),
      field("目標利益（円）", 0, 300000),
      field("営業日数", 10, 30),
      field("客席数", 5, 40),
    ],
    reference: [500, 100, 300000, 100000, 20, 10],
    notes:
      "原問題の数値を基準とする。生成版は必要人数を小数第2位まで切り上げる。",
  },
  {
    id: "retention",
    title: "会員のリテンション率",
    source: "2026-a-17",
    fields: ["A", "B", "C", "D"].flatMap((n) => [
      field(`${n}前月会員`, 100, 5000),
      field(`${n}新規会員`, 0, 2000),
      field(`${n}継続会員`, 1, 5000),
    ]),
    reference: [
      1000, 500, 300, 1000, 200, 600, 1500, 500, 600, 1500, 1000, 800,
    ],
    notes: "原問題の当月末会員から新規会員を引いた継続数を基準値とする。",
  },
  {
    id: "count-multiples",
    title: "区間内の倍数を数える",
    source: "2025-b-1",
    fields: [
      field("下限n", 1, 100),
      field("上限m", 11, 250),
      field("除数", 2, 12),
    ],
    reference: [1, 12, 4],
    notes:
      "原問題にn・mの固定値はない。1・12は本プロジェクトの説明用基準値であり、空欄補充から戻り値を問う設問へ変更する。",
  },
  {
    id: "coin-change",
    title: "硬貨の組合せの総数",
    source: "2025-b-2",
    fields: [field("金額n（円）", 11, 200)],
    reference: [12],
    notes: "原問題の例12円を基準とし、空欄ではなく戻り値を問う。",
  },
  {
    id: "complement",
    title: "8ビットの2の補数",
    source: "2026-b-2",
    fields: [field("8ビットの入力x", 1, 255)],
    reference: [42],
    notes:
      "原問題にxの固定値はない。42は本プロジェクトの説明用基準値であり、戻り値を問う設問へ変更する。",
  },
  {
    id: "recurrence",
    title: "漸化式を追跡する",
    source: "2026-b-3",
    fields: [field("引数n", 3, 14), field("2項前の係数", 1, 4)],
    reference: [5, 2],
    notes:
      "原問題の係数2を維持した説明用基準引数5から、引数・係数・戻り値を変える。",
  },
  {
    id: "security-log",
    title: "ログ管理ルールと運用の照合",
    source: "2026-b-6",
    fields: [
      field("運用担当者数", 0, 4),
      field("一般利用者のログアクセス", 0, 1),
      field("日時が日本標準時", 0, 1),
      field("保存月数", 1, 24),
    ],
    reference: [1, 1, 0, 12],
    notes:
      "原問題のログ管理ルールを基に、担当人数・アクセス・日時・保存期間をパラメータ化し、ルール3違反の組合せを計算する。",
  },
];
// Previous generator contracts remain valid for stored sessions.
export const generationContracts: Contract[] = legacyContracts.map((legacy) => {
  const c = structuredClone(legacy);
  if (c.id === "logic-table")
    c.notes =
      "原問題と同じ合成演算の表から、未知の演算の真理値表を選ぶ形式を維持する。";
  if (c.id === "count-multiples")
    c.notes =
      "原問題と同じ二つの空欄と6組の解答群を維持し、除数へ値をバインドする。n・mの値は独自解説の動作確認例に用いる。";
  if (c.id === "coin-change") {
    c.fields.push(field("残額変数のオフセット", 0, 20));
    c.reference.push(0);
    c.notes =
      "原問題と同じwhile条件の空欄補充と6択を維持する。残額変数をオフセット付きで表し、条件の閾値と計算式を整合して変更する。金額は説明用の例へバインドする。";
  }
  if (c.id === "complement") {
    c.fields.push(field("ビット幅", 4, 8));
    c.reference.push(8);
    c.notes =
      "原問題と同じ式の空欄補充と6択を維持し、ビット幅を4〜8へバインドする。xは独自解説の動作確認例であり、原問題の固定入力ではない。";
  }
  if (c.id === "recurrence") {
    c.fields[1].minimum = 2;
    c.notes =
      "原問題と同じ再帰関数・配列による関数の空欄補充と8択を維持する。係数は2〜4、nは独自解説の動作確認例へバインドする。";
  }
  if (c.id === "security-log") {
    c.fields[3] = field("過去ログの上書き", 0, 1);
    c.reference = [1, 1, 0, 1];
    c.notes =
      "原問題と同じ長文・枠で囲った図1のルール・表1・10択を維持する。担当人数・アクセス・日時・ログ上書きをパラメータ化し、ルール3違反を判定する。";
  }
  return c;
});
export function contractFor(t: Template) {
  return (
    ["3.0.0", "3.0.1"].includes(t.generatorRef.version)
      ? additionalContracts
      : t.generatorRef.version === "2.0.0"
        ? generationContracts
        : legacyContracts
  ).find((c) => `generator-${c.id}` === t.generatorRef.id);
}
export function validateTemplateContract(t: Template) {
  if (!["1.0.0", "2.0.0", "3.0.0", "3.0.1"].includes(t.generatorRef.version))
    throw new DataError("GENERATOR_REF", "未対応の生成器の版です");
  if (t.generatorRef.id === "generator-array-sum") {
    if (
      t.generatorRef.version !== "1.0.0" ||
      t.parameterDomain.values.length !== 3 ||
      t.parameterDomain.values.minimum !== 1 ||
      t.parameterDomain.values.maximum !== 9 ||
      t.parameterDomain.fields !== undefined ||
      t.referenceParameters.values.length !== 3 ||
      t.referenceParameters.values.some((v) => v < 1 || v > 9)
    )
      throw new DataError("PARAMETER_DOMAIN", "配列総和の域が不正です");
    return;
  }
  const c = contractFor(t);
  if (!c) throw new DataError("GENERATOR_REF", "未登録の生成器です");
  if (
    t.parameterDomain.fields?.length !== c.fields.length ||
    c.fields.some((f, i) => {
      const actual = t.parameterDomain.fields?.[i];
      return (
        !actual ||
        actual.name !== f.name ||
        actual.minimum !== f.minimum ||
        actual.maximum !== f.maximum
      );
    }) ||
    t.parameterDomain.values.length !== c.fields.length ||
    t.parameterDomain.values.minimum !==
      Math.min(...c.fields.map((f) => f.minimum)) ||
    t.parameterDomain.values.maximum !==
      Math.max(...c.fields.map((f) => f.maximum))
  )
    throw new DataError("PARAMETER_DOMAIN", "登録生成器と入力域が一致しません");
  checkParameters(t, t.referenceParameters.values);
}
export function checkParameters(t: Template, v: number[]) {
  const d = t.parameterDomain;
  if (
    v.length !== d.values.length ||
    v.some(
      (n, i) =>
        !Number.isInteger(n) ||
        n < (d.fields?.[i].minimum ?? d.values.minimum) ||
        n > (d.fields?.[i].maximum ?? d.values.maximum),
    )
  )
    throw new DataError("PARAMETER_DOMAIN", "生成値が許可域を外れています");
  if (["3.0.0", "3.0.1"].includes(t.generatorRef.version)) {
    checkAdditionalParameters(t, v);
    return;
  }
  const id = contractFor(t)?.id;
  if (
    (id === "hex-fraction" && v[1] === 1 && v[0] > 15) ||
    (id === "hash-collision" &&
      (v[2] <= v[1] || v[1] % v[0] !== v[2] % v[0])) ||
    (id === "cafe-profit" && v[0] <= v[1]) ||
    (id === "count-multiples" && v[1] < v[0] + 10) ||
    (id === "complement" &&
      t.generatorRef.version === "2.0.0" &&
      v[0] >= 2 ** v[1]) ||
    (id === "retention" &&
      (v[2] > v[0] ||
        v[5] > v[3] ||
        v[8] > v[6] ||
        v[11] > v[9] ||
        new Set([v[2] / v[0], v[5] / v[3], v[8] / v[6], v[11] / v[9]]).size !==
          4))
  )
    throw new DataError("PARAMETER_CONSTRAINT", "入力間の条件を満たしません");
}
async function sampleParameters(seed: string, t: Template) {
  const c = contractFor(t)!;
  // Every generator has a bounded, deterministic stream. Four bytes avoid modulo bias for large ranges.
  let counter = 0,
    words: number[] = [];
  const integer = async (min: number, max: number) => {
    const width = max - min + 1,
      limit = Math.floor(0x100000000 / width) * width;
    for (let n = 0; n < 1024; n++) {
      if (!words.length) {
        const h = await sha256(
          `${seed}\n${t.id}\n${t.revision}\n${t.generatorRef.id}\n${t.generatorRef.version}\n${counter++}`,
        );
        words = h.match(/.{8}/g)!.map((w) => parseInt(w, 16));
      }
      const word = words.shift()!;
      if (word < limit) return min + (word % width);
    }
    throw new DataError("SEED", "入力の抽選上限に達しました");
  };
  for (let attempt = 0; attempt < 256; attempt++) {
    const values = [];
    for (const f of c.fields) values.push(await integer(f.minimum, f.maximum));
    try {
      checkParameters(t, values);
      return { values };
    } catch (e) {
      if (!(e instanceof DataError) || e.code !== "PARAMETER_CONSTRAINT")
        throw e;
    }
  }
  throw new DataError("SEED", "条件を満たす入力を生成できませんでした");
}
const p = (text: string): Block => ({ type: "paragraph", text });
const table = (
  caption: string,
  columns: string[],
  rows: string[][],
): Block => ({ type: "table", caption, columns, rows });
const code = (text: string): Block => ({
  type: "code",
  language: "pseudocode",
  text,
});
function numericChoices(answer: number, unit = "", digits = 0) {
  const step = 10 ** -digits;
  return [answer, answer - step, answer + step, answer + 3 * step].map(
    (n) => `${n.toFixed(digits)}${unit}`,
  );
}
export function criticalPathTimes(v: number[]) {
  const [a, b, c, d, e, f, g, h] = v;
  return [
    0,
    a,
    a + b,
    Math.max(a + c, a + b),
    Math.max(a + d, a + c, a + b),
    Math.max(
      a + b + e,
      Math.max(a + c, a + b) + f,
      Math.max(a + d, a + c, a + b) + g,
    ),
    Math.max(
      a + b + e,
      Math.max(a + c, a + b) + f,
      Math.max(a + d, a + c, a + b) + g,
    ) + h,
  ];
}
function diagram(
  attr: Attribution,
  scene: Scene,
  caption: string,
  alt: string,
): Block {
  return {
    type: "diagram",
    id: "diagram-generated",
    rendererRef: { id: "renderer-diagram-basic", version: "1.0.0" },
    caption,
    alt,
    attribution: attr,
    scene,
  };
}
function bindLegacyQuestion(
  base: Question,
  t: Template,
  v: number[],
  instanceId: string,
  at: string,
): Question {
  if (t.generatorRef.id === "generator-array-sum")
    return bindArraySum(base, t, v, instanceId, at);
  validateTemplateContract(t);
  checkParameters(t, v);
  const c = contractFor(t)!,
    q = structuredClone(base),
    attr = t.attribution;
  const own: Attribution = {
    origin: "original",
    sourceRefs: [],
    rightsRefs: ["rights-original"],
    creatorIds: t.editorIds,
  };
  let blocks: Block[] = [],
    explanationMath: Block[] = [],
    answers: string[] = [],
    explanation = "";
  if (c.id === "hex-fraction") {
    const n = v[0],
      digits = v[1],
      den = 16 ** digits,
      hex = n.toString(16).toUpperCase().padStart(digits, "0"),
      a = n / den;
    blocks = [
      p(`16進小数0.${hex}を10進小数へ変換した値を選ぶ。`),
      table(
        "位の値",
        ["桁列", "桁列を整数として読んだ値に掛ける重み"],
        [[hex, `1/${den}`]],
      ),
    ];
    answers = [n, n + 1, n - 1, n + 2].map((x) => (x / den).toFixed(8));
    explanation = `${digits}桁の16進小数は、桁列を整数として読んだ値を16の${digits}乗で割る。${hex}は10進数の${n}なので、${n}÷${den}＝${a}。`;
  } else if (c.id === "logic-table") {
    const funcs = [
      "X AND Y",
      "X OR Y",
      "X XOR Y",
      "NOT (X AND Y)",
      "NOT (X OR Y)",
      "NOT (X XOR Y)",
      "(NOT X) OR Y",
    ];
    const fn = (x: number, y: number) =>
      [x & y, x | y, x ^ y, 1 - (x & y), 1 - (x | y), 1 - (x ^ y), (1 - x) | y][
        v[0] - 1
      ];
    const rows = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ].map(([x, y]) => [String(x), String(y), String(fn(x, y))]);
    answers = [
      funcs[v[0] - 1],
      ...funcs
        .filter((_, i) => i !== v[0] - 1)
        .slice(v[1] % 4)
        .concat(funcs.filter((_, i) => i !== v[0] - 1))
        .slice(0, 3),
    ];
    blocks = [
      p(
        "X・Yは0又は1である。次の出力表を満たす論理式を選ぶ。NOTは0と1を反転する。",
      ),
      table("真理値表", ["X", "Y", "出力"], rows),
    ];
    explanation = `${answers[0]}を各行に適用すると、出力は${rows.map((r) => r[2]).join("、")}となり、全4行が一致する。`;
  } else if (c.id === "hash-collision") {
    const [m, a, b] = v,
      char = (n: number) => String.fromCharCode(n);
    answers = [
      `${char(a)} と ${char(b)}`,
      `${char(a)} と ${char(a + 1)}`,
      `${char(a)} と ${char(a + 2)}`,
      `${char(a)} と ${char(a + 3)}`,
    ];
    blocks = [
      p(
        `小文字1文字を大きさ${m}のハッシュ表へ格納する。ハッシュ値はASCIIコードを${m}で割った余りとする。同じハッシュ値になる組を選ぶ。`,
      ),
      table(
        "使用するキーのASCII",
        ["キー", "ASCII"],
        [...new Set([a, b, a + 1, a + 2, a + 3])].map((n) => [
          char(n),
          String(n),
        ]),
      ),
    ];
    explanation = `${a} mod ${m}＝${a % m}、${b} mod ${m}＝${b % m}で一致する。他の組のコード差1・2・3は表の大きさ${m}の倍数ではない。`;
  } else if (c.id === "availability") {
    const [mtbf, mttr, g, r] = v,
      b = (mtbf * (100 + g)) / 100,
      tr = (mttr * (100 - r)) / 100,
      rate = Math.round((100 * b) / (b + tr));
    blocks = [
      p(
        "翌年度の稼働率を整数％で答える。計算した百分率は小数第1位を四捨五入する。",
      ),
      table(
        "今年度と改善目標",
        ["項目", "値"],
        [
          ["MTBF", `${mtbf}時間`],
          ["MTTR", `${mttr}時間`],
          ["MTBFを増加", `${g}％`],
          ["MTTRを減少", `${r}％`],
        ],
      ),
    ];
    answers = numericChoices(rate, "％");
    explanation = `翌年度MTBF=${b}、MTTR=${tr}。稼働率=MTBF÷(MTBF+MTTR)×100=${((100 * b) / (b + tr)).toFixed(4)}％。四捨五入して${rate}％。`;
    explanationMath = [
      {
        type: "formula",
        format: "latex",
        text: `\\frac{${b}}{${b}+${tr}} \\times 100 \\approx ${((100 * b) / (b + tr)).toFixed(4)}`,
        alt: `稼働率は${b}を${b}と${tr}の和で割り、100を掛けた百分率。四捨五入して${rate}パーセント。`,
      },
    ];
  } else if (c.id === "critical-path") {
    const times = criticalPathTimes(v),
      pairs = [
        [0, 1],
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 5],
        [3, 5],
        [4, 5],
        [5, 6],
      ];
    const nodes = [
      [70, 500],
      [220, 500],
      [430, 150],
      [430, 500],
      [430, 850],
      [680, 500],
      [900, 500],
    ].map(([x, y], i) => ({
      id: `node-${i}`,
      label: i === 0 ? "開始" : i === 6 ? "完了" : `結合点${i}`,
      x,
      y,
      role: "vertex",
    }));
    const edges = pairs.map(([from, to], i) => ({
      id: `edge-${i}`,
      from: `node-${from}`,
      to: `node-${to}`,
      directed: true,
      label: `${"ABCDEFGH"[i]} ${v[i]}日`,
    }));
    edges.push(
      {
        id: "edge-dummy-1",
        from: "node-2",
        to: "node-3",
        directed: true,
        label: "ダミー 0日",
      },
      {
        id: "edge-dummy-2",
        from: "node-3",
        to: "node-4",
        directed: true,
        label: "ダミー 0日",
      },
    );
    blocks = [
      p(
        "次の作業の全てを完了する最少日数を選ぶ。各矢印の作業は始点へ入る作業が全て完了してから開始する。担当者数による並列作業の制限はなく、ダミー作業の日数は0とする。",
      ),
      diagram(
        attr,
        { kind: "graph", nodes, edges },
        "所要日数を生成したアローダイアグラム",
        edges.map((e) => `${e.from}から${e.to}へ${e.label}`).join("。"),
      ),
      table(
        "作業日数",
        ["作業", "所要日数"],
        v.map((n, i) => ["ABCDEFGH"[i], `${n}日`]),
      ),
    ];
    answers = numericChoices(times[6], "日");
    explanation = `各結合点の最早時刻は、流入する各作業の終了時刻の最大値である。結合点1=${times[1]}、2=${times[2]}、3=max(A+C,A+B)=${times[3]}、4=max(A+D,結合点3)=${times[4]}、5=max(結合点2+E,結合点3+F,結合点4+G)=${times[5]}。Hを加え、完了は${times[6]}日。`;
  } else if (c.id === "service-gain") {
    const [hours, before, minutes] = v,
      prior = Math.floor(((hours - before) * 10000) / hours),
      after = Math.floor(((hours * 60 - minutes) * 10000) / (hours * 60)),
      gain = (after - prior) / 100;
    blocks = [
      p(
        "移行前後の可用性をそれぞれ小数第3位で切り捨て、その差をパーセントポイントで答える。",
      ),
      table(
        "年間提供条件",
        ["項目", "値"],
        [
          ["提供時間", `${hours}時間`],
          ["移行前停止", `${before}時間`],
          ["移行後停止", `${minutes}分`],
        ],
      ),
    ];
    answers = numericChoices(gain, "ポイント", 2);
    explanation = `可用性=(提供時間−停止時間)÷提供時間×100。移行前${(prior / 100).toFixed(2)}％、移行後${(after / 100).toFixed(2)}％。差は${gain.toFixed(2)}パーセントポイント。`;
  } else if (c.id === "cafe-profit") {
    const [price, cost, fixed, profit, days, seats] = v,
      den = (price - cost) * days * seats,
      a = Math.ceil(((fixed + profit) * 100) / den) / 100;
    blocks = [
      p(
        `月${profit}円以上の利益を確保するため、1客席当たり1日平均何人以上の客が必要か。人数は小数第2位まで切り上げる。`,
      ),
      table(
        "喫茶店の条件",
        ["項目", "値"],
        [
          ["1人当たり売上", `${price}円`],
          ["1人当たり変動費", `${cost}円`],
          ["月の固定費", `${fixed}円`],
          ["月の営業日", String(days)],
          ["客席数", String(seats)],
        ],
      ),
    ];
    answers = numericChoices(a, "人", 2);
    explanation = `1人当たり限界利益は${price - cost}円。必要客数は(${fixed}+${profit})÷${price - cost}。さらに${days}日×${seats}席で割ると${((fixed + profit) / den).toFixed(6)}人であり、小数第2位まで切り上げて${a.toFixed(2)}人。`;
  } else if (c.id === "retention") {
    const rates = [0, 1, 2, 3].map((i) => v[i * 3 + 2] / v[i * 3]),
      best = rates.indexOf(Math.max(...rates));
    answers = [
      `サービス${"ABCD"[best]}`,
      ...[0, 1, 2, 3]
        .filter((i) => i !== best)
        .map((i) => `サービス${"ABCD"[i]}`),
    ];
    blocks = [
      p(
        "前月末から当月末まで継続した会員の割合が最も高いサービスを選ぶ。新規会員は当月内に退会していない。",
      ),
      table(
        "会員数",
        ["サービス", "前月末", "当月新規", "当月末"],
        [0, 1, 2, 3].map((i) => [
          "ABCD"[i],
          String(v[i * 3]),
          String(v[i * 3 + 1]),
          String(v[i * 3 + 1] + v[i * 3 + 2]),
        ]),
      ),
    ];
    explanation =
      rates
        .map(
          (rate, i) =>
            `${"ABCD"[i]}: (当月末−新規)÷前月末=${(rate * 100).toFixed(4)}％`,
        )
        .join("。") + `。最大はサービス${"ABCD"[best]}。`;
  } else if (c.id === "count-multiples") {
    const [n, m, d] = v,
      a = Math.floor(m / d) - Math.floor((n - 1) / d);
    blocks = [
      p(
        `以下のcountMultiples(${n},${m},${d})の戻り値を選ぶ。modは非負整数の余りであり、繰返しは両端を含む。`,
      ),
      code(
        `○整数型: countMultiples(整数型: n, m, divisor)\n    整数型: count ← 0\n    for (i を n から m まで 1 ずつ増やす)\n        if ((i mod divisor) が 0 と等しい)\n            count ← count + 1\n        endif\n    endfor\n    return count`,
      ),
    ];
    answers = numericChoices(a);
    explanation = `1〜${m}にある${d}の倍数はfloor(${m}/${d})=${Math.floor(m / d)}個。そのうち1〜${n - 1}は${Math.floor((n - 1) / d)}個なので差は${a}個。`;
  } else if (c.id === "coin-change") {
    const n = v[0],
      rows = [];
    let a = 0;
    for (let ten = 0; ten * 10 <= n; ten++) {
      const rest = n - ten * 10,
        count = Math.floor(rest / 5) + 1;
      a += count;
      rows.push([String(ten), String(rest), String(count)]);
    }
    blocks = [
      p(
        `1円・5円・10円硬貨を何枚でも使える。順序を区別せず、${n}円を支払う硬貨枚数の組合せは何通りか。次の関数change(${n})の戻り値を選ぶ。`,
      ),
      code(
        "○整数型: change(整数型: n)\n    整数型: count ← 0\n    整数型: rest ← n\n    while (rest ≧ 0)\n        count ← count + floor(rest / 5) + 1\n        rest ← rest - 10\n    endwhile\n    return count",
      ),
    ];
    answers = numericChoices(a, "通り");
    explanation = `10円玉0〜${Math.floor(n / 10)}枚について、残額に使える5円玉は0〜floor(残額/5)枚。これらを足すと${rows.map((r) => r[2]).join("+")}=${a}通り。`;
  } else if (c.id === "complement") {
    const x = v[0],
      a = (256 - x) % 256,
      bin = (n: number) => n.toString(2).padStart(8, "0");
    answers = [a, x ^ 255, x, (x + 1) % 256].map(bin);
    if (new Set(answers).size !== 4)
      throw new DataError("PARAMETER_CONSTRAINT", "2の補数の誤答が重複します");
    blocks = [
      p(
        `入力xは${bin(x)}（符号なし10進数${x}）である。8ビット加算で桁あふれを無視したとき、x+yが00000000となるyを選ぶ。`,
      ),
      code(
        "○8ビット型: complement(8ビット型: x)\n    8ビット型: y ← x XOR 11111111\n    y ← y + 00000001\n    return y",
      ),
    ];
    explanation = `各ビットを反転すると${bin(x ^ 255)}、1を加えると${bin(a)}。${x}+${a}=256なので8ビットに残る値は0。`;
  } else if (c.id === "recurrence") {
    const [n, k] = v,
      values = [1, 1];
    for (let i = 2; i < n; i++) values.push(k * values[i - 2] + values[i - 1]);
    const a = values[n - 1];
    blocks = [
      p(`func(${n})の戻り値を選ぶ。係数は${k}とする。引数は正の整数である。`),
      code(
        `○整数型: func(整数型: n)\n    if (n ≦ 2)\n        return 1\n    endif\n    return ${k} × func(n - 2) + func(n - 1)`,
      ),
      table(
        "初期条件",
        ["引数", "戻り値"],
        [
          ["1", "1"],
          ["2", "1"],
        ],
      ),
    ];
    answers = numericChoices(a);
    explanation = `引数1〜${n}の戻り値を順に求めると[${values.join(", ")}]。各段階で${k}×2項前+1項前を計算するため、func(${n})=${a}。`;
  } else if (c.id === "security-log") {
    const [operators, access, jst, months] = v,
      violations = [
        ...(operators < 2 ? ["(二)"] : []),
        ...(access ? ["(四)"] : []),
      ],
      a = violations.join("、") || "該当なし";
    answers = [
      a,
      ...["該当なし", "(二)", "(四)", "(二)、(四)"].filter((x) => x !== a),
    ];
    q.contexts = [
      {
        id: "context-security",
        title: "ログ管理のルール",
        content: {
          attribution: attr,
          blocks: [
            p(
              "営業部はクラウドサービスを利用し、部署の運用担当者がログを管理している。一般利用者は業務ファイルを編集できるが、ログへのアクセスは別に管理する。以下は本問で定める管理ルールである。",
            ),
            {
              type: "list",
              ordered: true,
              items: [
                "ログインと重要操作の成否を記録する。",
                "アカウント名・日本標準時の日時・操作内容を記録する。",
                "ログへアクセスできるのは運用担当者だけとし、担当者は2名以上置く。クラウドから保管先へ移したログも同じアクセス制限を維持する。",
                "過去12か月以上のログを保存する。",
                "運用担当者でも過去ログの上書き・消去はできないようにする。",
              ],
            },
          ],
        },
      },
    ];
    q.contextRefs = ["context-security"];
    blocks = [
      p(
        "次の運用のうち、上記のルール3に違反する項番だけを全て選ぶ。ルール2・4への違反をルール3へ混同しない。",
      ),
      table(
        "現在の運用",
        ["項番", "運用"],
        [
          ["(一)", `過去${months}か月分を保存する。`],
          ["(二)", `運用担当者は${operators}名である。`],
          ["(三)", `日時は${jst ? "日本標準時" : "UTC"}で記録する。`],
          [
            "(四)",
            `ログの保管先には${access ? "一般利用者も" : "運用担当者だけが"}アクセスできる。`,
          ],
        ],
      ),
    ];
    explanation = `ルール3の人数条件では${operators}名${operators < 2 ? "は2名未満なので違反" : "は2名以上なので適合"}。保管先へのアクセスは${access ? "一般利用者も可能なので違反" : "担当者に限定され適合"}。日時・保存期間は別のルールである。従って${a}。`;
  }
  if (!blocks.length || answers.length !== 4 || new Set(answers).size !== 4)
    throw new DataError(
      "GENERATOR_OUTPUT",
      "生成結果の選択肢が一意ではありません",
    );
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
    summary: "本文・図・選択肢・正答・解説をパラメータから生成",
    details: `${c.notes} 入力は${c.fields.map((f, i) => `${f.name}=${v[i]}`).join("、")}。`,
    affectsAnswer: true,
    answerDetails: explanation,
  });
  if (c.id !== "security-log") {
    q.contexts = [];
    q.contextRefs = [];
  }
  q.prompt = { attribution: attr, blocks };
  q.choices = answers.map((text, i) => ({
    id: `choice-value-${i + 1}`,
    content: { attribution: attr, blocks: [p(text)] },
  }));
  q.correctAnswer = { choiceId: "choice-value-1", attribution: own };
  q.explanation = {
    attribution: own,
    blocks: [p(explanation), ...explanationMath],
  };
  q.assetRefs = [];
  q.choiceShuffleAllowed = true;
  return q;
}
export function bindQuestion(
  base: Question,
  t: Template,
  v: number[],
  instanceId: string,
  at: string,
): Question {
  validateTemplateContract(t);
  checkParameters(t, v);
  if (["3.0.0", "3.0.1"].includes(t.generatorRef.version))
    return bindAdditionalQuestion(base, t, v, instanceId, at);
  if (t.generatorRef.version !== "2.0.0")
    return bindLegacyQuestion(base, t, v, instanceId, at);
  const id = contractFor(t)!.id;
  const changedAlgorithm = [
    "count-multiples",
    "coin-change",
    "complement",
    "recurrence",
  ].includes(id);
  const q = changedAlgorithm
    ? structuredClone(base)
    : bindLegacyQuestion(base, t, v, instanceId, at);
  if (!changedAlgorithm) q.origin.changes.pop();
  return preserveSourceFormat(q, t, v, contractFor(t)!.notes, instanceId, at);
}
export function answerSignature(q: Question) {
  return q.choices
    .find((c) => c.id === q.correctAnswer.choiceId)!
    .content.blocks.map((b) => ("text" in b ? b.text : JSON.stringify(b)))
    .join("\n");
}
