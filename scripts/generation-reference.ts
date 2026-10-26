import fs from "node:fs";
import { readDistributionBundle } from "./distribution-files";
import type { Bundle, Block } from "../src/core/types";
import { generationCoverage } from "../src/core/generation-coverage";
import { additionalDefinition } from "../src/core/generators";
import { sourceFigureDomains } from "../src/core/source-figures";

const b = readDistributionBundle();
const c = generationCoverage(b);
if (c.rows.some((r) => r.templates.length !== 1 || r.linked.length !== 1))
  throw Error("GENERATION_COVERAGE");
const escape = (v: string | number) =>
  String(v).replaceAll("|", "／").replaceAll("\n", " ");
const typeName: Record<Block["type"], string> = {
  paragraph: "文章",
  heading: "見出し",
  list: "箇条書き",
  table: "表",
  diagram: "図",
  image: "画像",
  formula: "数式",
  code: "コード",
};
let md = `# 全問題の生成対応\n\n<!-- scripts/generation-reference.ts が生成する。手編集しない。 -->\n\n## 対象と対応条件\n\n本システムでは、収録した公式公開問題${c.total}問すべてに、原問題とは別の改変済み基準問題と登録生成器を一対一で用意する。科目A${c.rows.filter((r) => r.original.subject === "A").length}問、科目B${c.rows.filter((r) => r.original.subject === "B").length}問をランダムミックスの候補にする。2025年度科目B問6は第三者のJIS文言の利用条件が未確認であり、原問題・生成版とも対象外とする。非公開問題を含めた全FE問題という意味ではない。\n\n年度別オリジナルは公式本文・図・数値・正答を維持した原資料画像を表示する。生成版ではその学習対象と媒体の形式を基に、文章を文章、表を表、図を作図、疑似言語を空欄付きコードとして構造化する。問いの方向・正誤条件・解答対象・選択肢の役割と数は固定する。知識問題では用語・対象・状況、計算問題では数値・条件、アルゴリズムでは引数・添字・処理条件、長文では規則・状況を変数とする。本文・図・選択肢・正答・独自解説は同じ入力から確定する。選択肢の並べ替えだけで生成対応とは扱わない。\n\n生成用基準問題も改変問題であり、原文そのものの再録ではない。元の学習対象を維持しつつ、生成可能にする文言や条件の明示、問う対象の切替を含む。知識問題には数値が存在しないため、数値変更を一律に追加しない。原問題で与えられた数式や変換例の図は生成時も維持し、解答を導く補助表を追加しない。公式再録の不変参照と改変内容を保存し、原資料にない条件は改変として表示する。\n\nカタログのgenerationCoverage=completeでは、含まれる各公式問題から派生する有効なテンプレートが一つあり、対応する科目のミックス枠へ一つ登録されることを検査する。不足・重複はGENERATION_COVERAGEで配布検証を拒否する。これで内容の真実性や利用条件の法的適合を保証するものではない。省略又はpartialの旧カタログはこの全問対応宣言を持たない。\n\n## 問題別の対応一覧\n\n表は配布カタログ・基準問題・登録契約から生成する。入力は整数の順序付き列で、各欄は「名称：下限〜上限（基準値）」を表す。追加の入力間制約は生成器で検査し、不成立なら再抽選の上限内で選び直す。生成器のID・版・入力域をJSONだけで追加しても実行できない。原資料のリンクは該当PDFページを示す。\n`;
const groups = [...new Set(c.rows.map(r => {
  const ref = r.original.origin.sourceRefs[0];
  return ref.locator.year ? `${ref.locator.year}年度` : ref.locator.period!;
}))].sort().reverse();
for (const group of groups) {
  md += `\n### ${group}\n\n| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |\n| --- | --- | --- | --- |\n`;
  for (const r of c.rows
    .filter((r) => { const l = r.original.origin.sourceRefs[0].locator; return (l.year ? `${l.year}年度` : l.period) === group; })
    .sort(
      (a, z) =>
        a.original.subject.localeCompare(z.original.subject) ||
        Number(a.original.origin.sourceRefs[0].locator.questionNumber) -
          Number(z.original.origin.sourceRefs[0].locator.questionNumber),
    )) {
    const t = r.templates[0],
      q = b.questions.find(
        (q) =>
          q.id === t.baseQuestionRef.questionId &&
          q.revision === t.baseQuestionRef.revision,
      )!;
    const ref = r.original.origin.sourceRefs[0],
      s = b.sources.find((s) => s.id === ref.sourceId)!;
    const d = additionalDefinition(t.generatorRef.id);
    const media = [
      ...new Set(
        [
          ...q.contexts.flatMap((c) => c.content.blocks),
          ...q.prompt.blocks,
          ...q.choices.flatMap((c) => c.content.blocks),
        ].map((b) => typeName[b.type]),
      ),
    ].join("・");
    const inputs = t.parameterDomain
      .fields!.map(
        (f, i) =>
          `${f.name}：${f.minimum}〜${f.maximum}（${t.referenceParameters.values[i]}）`,
      )
      .join("、");
    md += `| [科目${q.subject}問${ref.locator.questionNumber} p.${ref.locator.page}](${s.url}#page=${ref.locator.page}) | ${t.generatorRef.id}@${t.generatorRef.version} | ${escape(d?.title ?? t.title)}。${escape(inputs)} | ${media}／${q.choices.length}択 |\n`;
  }
}
md +=
  "\n## 登録図の入力契約\n\nrenderer-source-figures@1.0.0はsource_figureのprofileとvaluesだけを受け取る。登録済みの形状を固定React/SVGコードで描き、値の個数と位置ごとの整数域を検査する。表の入力域はsrc/core/source-figure-domains.jsonの正本から生成する。未登録形状・不足・過剰・域外はFIGURE_PROFILEで拒否する。原図の凡例・円・線種・配列の網掛けを保持し、内部IDや接続説明表を通常画面へ追加しない。読み上げ用説明はSVGのtitle／descに保持する。\n\n| profile | valuesの位置別の下限〜上限（0始まり） | 入力の意味・描画との対応 |\n| --- | --- | --- |\n";
const figureMeaning: Record<string, string> = {
  "dec-a-binary-flow":"0：2進数の出力桁数（5〜8）。1始まりの変換ループと空欄a/b。",
  "dec-a-automaton":"0：固定の3状態6遷移。初期矢印と入力/出力ラベルを保持。",
  "dec-a-bst":"0：値の順序条件、1：4択の木番号、2：全節値への加算（各0〜3）。原辺と左右を保持。",
  "dec-a-array":"0：180度/左90度/左右反転/右90度（0〜3）、1：星印の模様（0〜2）。二重ループとA/Bの8×8表。",
  "dec-a-hash":"0：配列要素数13。位置0〜12の空欄配列。",
  "dec-a-availability":"0：クライアント数2〜4、1：プリンタ数2〜3。サーバと各機器をLANで接続。",
  "dec-a-buffer":"0：固定接続。送信タスク→S→サイズLのバッファ→R→受信タスク。",
  "dec-a-multiplicity":"0：部署側/従業員側の多重度の4条件。関連名・読取方向を維持。",
  "dec-a-network":"0：A、1：Eの日数（各1〜3）。A〜Jの10作業、円と上下ラベルの凡例。",
  "dec-a-dispatch":"0：太線（0=派遣先/労働者、1=派遣元/労働者、2=企業間）。三者の双方向矢印。",
  "list-element-class": "0：終端表現（0=未定義、1=endNode）。クラスのnext初期値を本文の終端条件と連動",
  "bigram-example": "0：査読した4語群の例（0〜3）。対象文字の位置・後続文字・語末を区別して表示",
  "priority-queue-class": "0：優先度の向き（0=小さい数が先、1=大きい数が先）、1：同値時（0=先入れ、1=後入れ）",
  "sample-tree-14": "0：左の子だけをもつ親の節番号（4〜7）。14節の木と配列を連動",
  "sample-minimax": "0：勝敗の評価値の5点単位（1〜3）、1：A/Bを付ける根の二枝（0〜2）。全11盤面と葉の勝敗を保持",
  "waf-network":
    "0：TLS終端（0=FW、1=SSLアクセラレータ）、1：a〜dの循環移動量。末尾はDBアクセス",
  "euclid-flow":
    "0：設問の初期値比の候補（2:1、1:2、3:2、2:3）。流れ図自体の手順は固定",
  "crash-network": "0〜6：作業A〜Gの標準日数。図の枝はB→E、C、D→Fで固定",
  "cache-layout":
    "0：CPU内キャッシュの容量kバイト、1：主記憶の容量Mバイト。時間は本文に保持",
  scatter:
    "0：相関の向き（0=負、1=正、2=共分散0）、1：対称配置の散らばりの段階。28点を生成",
  bst: "0：a〜gの循環移動量、1：左右反転（0=元配置、1=鏡像）。節点のつながりは固定",
  "project-network":
    "0〜8：作業A〜Iの日数。2本のダミー接続は固定し日数を表示しない",
  "logic-circuit":
    "0：出力反転のビットマスク。bit0〜3を第1〜4ゲートの小円に対応。AND形の4ゲートと接続は固定",
  waveform:
    "0〜6：A、7〜13：B、14〜20：Yの同じ7時間区間の0／1。図から値を再計算しない",
  "undirected-graph":
    "0：頂点番号の基準差、1：登録した3辺集合の選択。5頂点の番号と接続を描く",
  "adjacency-matrix":
    "0：対応頂点番号の基準差、1：無向グラフと同じ3辺集合の選択。5行5列の対称行列",
  stack:
    "0：stackPosに保存する位置の基準差、1：配列容量、2・3：先頭2要素の値。3番目以降は網掛け",
  "linked-arrays":
    "0：保存ポインタ値の基準差、1：元dataList値10・30・20・40の倍率。未定義セルを網掛け",
  "ordered-array": "0：整列配列の値10・20・30・40の倍率。添字は1〜4",
  onehot:
    "0：登録4色列の選択。0=Red,Green,Blue,Red、1=Blue,Red,Blue,Green、2=Green,Green,Red,Blue、3=Blue,Green,Red,Green。初出順のOne-Hotと戻り値を描く",
};
for (const [profile, domain] of Object.entries(sourceFigureDomains)) {
  if (!figureMeaning[profile]) throw Error("図の入力意味の記録がない");
  md += `| ${profile} | ${domain.map(([min, max], i) => `${i}：${min}〜${max}`).join("、")} | ${figureMeaning[profile]} |\n`;
}
md +=
  "\n## 再生成と検証\n\n一覧の更新はnpm run doc:generation、鮮度確認はnpm run doc:validateで行う。生成器の変更時には正答・誤答の独立検算と原資料の形式照合を行い、改訂とモジュール版を更新する。保存済みセッションの内容を新しい生成器で作り直さない。詳しい[生成仕様](/diagram-generation)、[出典表示](/attribution)、[検証記録](/verification)を参照する。\n";
const target = "docs/generation-coverage.md";
if (process.argv.includes("--check")) {
  if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== md)
    throw Error("生成対応一覧が古い。npm run doc:generationで更新する");
  console.log(`生成対応一覧 ${c.covered}/${c.total}: 正本との一致を確認`);
} else {
  fs.writeFileSync(target, md);
  console.log(`${target}: ${c.total}件を生成`);
}
