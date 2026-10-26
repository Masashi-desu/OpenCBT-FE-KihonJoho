import fs from "node:fs";
import { readDistributionBundle } from "./distribution-files";
import type { Bundle, Block } from "../src/core/types";
import { generationCoverage } from "../src/core/generation-coverage";
import { additionalDefinition } from "../src/core/generators";
import { sourceFigureDomains } from "../src/core/source-figures";

import autumn2017FigureMeaning from "./source-evidence/2017-autumn-figure-meaning.json";
import spring2018FigureMeaning from "./source-evidence/2018-spring-figure-meaning.json";

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
const sourceCountDescription = ([
  ["科目A", c.rows.filter(r => r.original.subject === "A" && !r.original.origin.sourceRefs.some(ref => ref.locator.timeSlot)).length, "問"],
  ["科目B", c.rows.filter(r => r.original.subject === "B" && !r.original.origin.sourceRefs.some(ref => ref.locator.timeSlot)).length, "問"],
  ["旧午前", c.rows.filter(r => r.original.origin.sourceRefs.some(ref => ref.locator.timeSlot === "午前")).length, "問"],
  ["旧午後", c.rows.filter(r => r.original.origin.sourceRefs.some(ref => ref.locator.timeSlot === "午後")).length, "大問"],
] as const).filter(([, count]) => count > 0).map(([label, count, unit]) => `${label}${count}${unit}`).join("、");
let md = `# 全問題の生成対応\n\n<!-- scripts/generation-reference.ts が生成する。手編集しない。 -->\n\n## 対象と対応条件\n\n本システムでは、収録した公式公開問題・大問${c.total}件すべてに、原問題とは別の改変済み基準問題と登録生成器を一対一で用意する。${sourceCountDescription}をそれぞれの問題集に対応したランダムミックスの候補にする。2025年度科目B問6は第三者のJIS文言の利用条件が未確認であり、原問題・生成版とも対象外とする。非公開問題を含めた全FE問題という意味ではない。\n\n年度別オリジナルは公式本文・図・数値・正答を維持した原資料画像を表示する。生成版ではその学習対象と媒体の形式を基に、文章を文章、表を表、図を作図、疑似言語を空欄付きコードとして構造化する。問いの方向・正誤条件・解答対象・選択肢の役割と数は固定する。知識問題では用語・対象・状況、計算問題では数値・条件、アルゴリズムでは引数・添字・処理条件、長文では規則・状況を変数とする。本文・図・選択肢・正答・独自解説は同じ入力から確定する。選択肢の並べ替えだけで生成対応とは扱わない。\n\n生成用基準問題も改変問題であり、原文そのものの再録ではない。元の学習対象を維持しつつ、生成可能にする文言や条件の明示、問う対象の切替を含む。知識問題には数値が存在しないため、数値変更を一律に追加しない。原問題で与えられた数式や変換例の図は生成時も維持し、解答を導く補助表を追加しない。公式再録の不変参照と改変内容を保存し、原資料にない条件は改変として表示する。\n\nカタログのgenerationCoverage=completeでは、含まれる各公式問題から派生する有効なテンプレートが一つあり、対応する科目のミックス枠へ一つ登録されることを検査する。不足・重複はGENERATION_COVERAGEで配布検証を拒否する。これで内容の真実性や利用条件の法的適合を保証するものではない。省略又はpartialの旧カタログはこの全問対応宣言を持たない。\n\n## 問題別の対応一覧\n\n表は配布カタログ・基準問題・登録契約から生成する。入力は整数の順序付き列で、各欄は「名称：下限〜上限（基準値）」を表す。追加の入力間制約は生成器で検査し、不成立なら再抽選の上限内で選び直す。生成器のID・版・入力域をJSONだけで追加しても実行できない。原資料のリンクは該当PDFページを示す。\n`;
const sourceGroup = (q: Bundle["questions"][number]) => {
  const l = q.origin.sourceRefs[0].locator;
  return l.timeSlot ? `${l.year}年度 ${l.period}・${l.timeSlot}` : l.year ? `${l.year}年度` : l.period!;
};
const groups = [...new Set(c.rows.map(r => sourceGroup(r.original)))].sort().reverse();
for (const group of groups) {
  md += `\n### ${group}\n\n| 原問題 | 登録生成器・版 | 学習対象／生成入力 | 表示形式・選択肢数 |\n| --- | --- | --- | --- |\n`;
  for (const r of c.rows
    .filter((r) => sourceGroup(r.original) === group)
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
    md += `| [${ref.locator.timeSlot ? `旧${ref.locator.timeSlot}` : `科目${q.subject}`}問${ref.locator.questionNumber} p.${ref.locator.page}](${s.url}#page=${ref.locator.page}) | ${t.generatorRef.id}@${t.generatorRef.version} | ${escape(d?.title ?? t.title)}。${escape(inputs)} | ${media}／${q.choices.length}択${q.answerParts ? `・${q.answerParts.length}解答欄` : ""} |\n`;
  }
}
md +=
  "\n## 登録図の入力契約\n\nrenderer-source-figures@1.0.0はsource_figureのprofileとvaluesだけを受け取る。登録済みの形状を固定React/SVGコードで描き、値の個数と位置ごとの整数域を検査する。既存図の入力域はsrc/core/source-figure-domains.json、管理図はsrc/core/managed-legacy-figures.ts及びsrc/core/legacy-afternoon-figures.tsの有限契約を結合して生成する。旧午後の位置別上下限は外接域であり、許可する入力は後掲の査読済み有限組合せに限る。描画器の登録だけで問題集の素材条件・配布を承認したとは扱わない。未登録形状・不足・過剰・域外はFIGURE_PROFILEで拒否する。原図の凡例・円・線種・配列の網掛けを保持し、内部IDや接続説明表を通常画面へ追加しない。読み上げ用説明はSVGのtitle／descに保持する。\n\n| profile | valuesの位置別の下限〜上限（0始まり） | 入力の意味・描画との対応 |\n| --- | --- | --- |\n";
const figureMeaning: Record<string, string> = {
  ...autumn2017FigureMeaning,
  ...spring2018FigureMeaning,
  "legacy-2017-pm13-a-equation": "0：数値の8条件。原の式全文とaの矩形空欄を元の式位置へ表示。可視見出しは追加しない。",
  "legacy-2017-pm13-b-equation": "0：数値の8条件。原の式全文とbの矩形空欄を元の式位置へ表示。可視見出しは追加しない。",
  "legacy-2017-pm13-cd-equation": "0：数値の8条件。原の式全文とc/dの矩形空欄を元の式位置へ表示。可視見出しは追加しない。",
  "legacy-2017-pm13-rate-sheet": "0：重量・箱・数量・発送先の8条件。原料金表の区分・セル位置を保持。",
  "legacy-2017-pm13-product-sheet": "0：重量・箱・数量・発送先の8条件。原商品表の同じセルへ値を対応。",
  "legacy-2017-pm13-weight-sheet": "0：重量・箱・数量・発送先の8条件。原重量区分の表を同じ条件で表示。",
  "legacy-2017-pm13-calculation-sheet": "0：重量・箱・数量・発送先の8条件。原計算例のセルと参照関係を同期。",
  "legacy-2017-pm13-packing-sheet": "0：重量・箱・数量・発送先の8条件。原梱包指示例を同じ条件で表示。",
  "legacy-2017-pm13-macro": "0：重量・箱・数量・発送先の8条件。原31行・7ループ・1条件分岐・e/f空欄を持つマクロを実行せず表示。",
  "legacy-2017-pm13-a-bank": "0：数値の8条件。aの原6択を単列で常時表示。",
  "legacy-2017-pm13-b-bank": "0：数値の8条件。bの原4択を単列で常時表示。",
  "legacy-2017-pm13-c-bank": "0：数値の8条件。cの原4択を単列で常時表示。",
  "legacy-2017-pm13-d-bank": "0：数値の8条件。dの原4択を単列で常時表示。",
  "legacy-2017-pm13-e-bank": "0：数値の8条件。eの原4択を単列で常時表示。",
  "legacy-2017-pm13-f-bank": "0：数値の8条件。fの原4択を単列で常時表示。",
  "legacy-2017-pm11-tariffs": "0：料金・使用量の3条件。原料金表の区分と項目を同期。",
  "legacy-2017-pm11-output": "0：料金・使用量の3条件。原出力例を同じ計算条件で表示。",
  "legacy-2017-pm11-discounts": "0：料金・使用量の3条件。原割引表の区分と項目を保持。",
  "legacy-2017-pm11-program": "0：料金・使用量の3条件、1：6個のJavaプログラムの位置。原の行・空欄を保持し、実行せず表示。",
  "legacy-2017-pm11-choice-group": "0：料金・使用量の3条件、1：6解答群の位置。原の列・記号を常時表示。",
  "legacy-2017-pm9-abc-bank": "0：採点条件の8入力。a〜c共通8択を原の2列で常時表示。",
  "legacy-2017-pm9-d-bank": "0：採点条件の8入力。dの原4択を原の2列で常時表示。",
  "legacy-2017-pm9-e-bank": "0：採点条件の8入力。eの原3択の文章を常時表示。",
  "legacy-2017-pm9-g-bank": "0：採点条件の8入力。gの原4択を原の2列で常時表示。",
  "legacy-2017-pm12-ab-bank": "0：数値の8入力。a/b共通5択を原の3列、末尾2択として常時表示。",
  "legacy-2017-pm12-c-bank": "0：数値の8入力。cの原3択を3列で常時表示。",
  "legacy-2017-pm12-d-bank": "0：数値の8入力。dの原6択を3列で表示し、数値条件と同期。",
  "legacy-2017-pm12-ef-bank": "0：数値の8入力。e/f共通8択を3列、末尾2択として常時表示。",
  "legacy-2017-pm12-program-add64": "0：数値の8入力。原ADD64の24行・番号・a2個/b/c各1個の矩形空欄を保持。",
  "legacy-2017-pm12-program-mul32": "0：数値の8入力。原MUL32の41非空行・e/f矩形空欄・右側注記とまとめ括弧を保持。",
  "legacy-2017-pm10-slip-record": "0：四半期開始月の3条件。原伝票レコードの欄と順を保持。",
  "legacy-2017-pm10-master-record": "0：四半期開始月の3条件。原マスタレコードの欄と順を保持。",
  "legacy-2017-pm10-output": "0：四半期開始月の3条件。4四半期と月境界、原出力項目を同期。",
  "legacy-2017-pm10-changes": "0：四半期開始月の3条件。原のプログラム変更箇所を保持。",
  "legacy-2017-pm10-program": "0：四半期開始月の3条件。原54行のCOBOLと行番号・空欄を表示。実行しない。",
  "legacy-2017-pm10-choice-group": "0：四半期開始月の3条件、1：6解答群の位置。原の記号・列構成を保持。",
  "legacy-2017-pm12-storage64": "0：加算する数値の8条件。原の64bit整数の4語の格納方法は固定。",
  "legacy-2017-pm12-values": "0：加算する4語の数値8条件。上位/下位語と桁上がり有無を原の欄へバインド。",
  "legacy-2017-pm12-storage32": "0：加算する数値の8条件。原の32bit整数の2語の格納方法は固定。",
  "legacy-2017-pm2-temperature-monitor": "0：LED条件0〜2、1：原資料の単位0〜4（選択注意・構成図・LED・I/O動作表・割込み流れ）。登録した組合せだけを描く。",
  "legacy-2017-pm4-wireless-timing": "0：固定の通信時系列図。W1/W2の位置と送受信・ACKの矢印、手順の注記を保持。",
  "legacy-2017-pm5-relations": "0：固定の購買システム関係図。発注登録と注文書出力、担当範囲と矢印を保持。",
  "legacy-2017-pm5-operation": "0：固定の購買システム操作の流れ。業務担当と順序を保持。",
  "legacy-2017-pm5-screen": "0：固定の一覧画面。原の欄・配置・ページ指定を保持。",
  "legacy-2017-pm5-order": "0：1ページの出力件数（4〜6）。原の用紙と出力項目を同じ位置へバインド。",
  "legacy-2017-pm5-flow": "0：固定の出力準備処理の流れ図。原の同じ空欄・分岐を保持。",
  "legacy-2017-pm5-testdata": "0：グループ件数の2条件。原の段付き表とテストデータ項目を保持。",
  "legacy-2017-pm6-unit": "0：原33単位のうち登録した14単位の位置、1：外部設計工数の4条件、2：表3の独立与件4条件。表・網掛け・分数・全解答群を同じ条件で表示。",
  "legacy-2017-pm7-inventory": "0：決定表/単一択/在庫表/本文枠/全解答群のkind0〜6、1：単位内の項目、2：商品群の3条件、3：数量の2条件。登録済み結合tupleだけを許す。",
  "legacy-2017-pm8-graph": "0：7地点9双方向辺の距離8条件。図・距離行列・追跡値を同期。",
  "legacy-2017-pm8-program": "0：固定48行の空欄付き疑似言語と制御枠。プログラムを実行せず表示する。",
  "legacy-2017-pm8-common-notation": "0：共通疑似言語の原p3、宣言・注釈・処理の固定資料。問題本文とは素材条件を分ける。",
  "legacy-2017-pm8-common-operators": "0：共通疑似言語の原p4、演算子と優先順位の固定資料。問題本文とは素材条件を分ける。",
  "legacy-2017-pm9-mark-sheet": "0：C言語の採点プログラムの8入力条件。原マークシートの欄と選択状態を表示。",
  "legacy-2017-pm9-bit-layout": "0：16bitの入力と配置の8条件。原のビット位置と前提を保持。",
  "legacy-2017-pm9-unordered-example": "0：順不同回答を採点する処理例の8条件。原解答形式と採点の題材を区別する。",
  "legacy-2017-pm9-marking-trace": "0：採点処理追跡の8条件。無効・過剰マークの条件を同期。",
  "legacy-2017-pm9-result-options": "0：採点結果の8条件。原の縦3セル配列・全6択を保持。",
  "legacy-2017-pm3-waste-database": "図の入力[0]は固定の4表・14見出し・14データセル・5主キー下線を表す。問題の4条件と4正答署名は別の問題パラメータで切り替える。",
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
const sceneText = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll("|", "&#124;").replaceAll("*", "&#42;").replaceAll("_", "&#95;").replaceAll("`", "&#96;").replaceAll("\n", " ");

for (const [profile, domain] of Object.entries(sourceFigureDomains)) {
  if (!figureMeaning[profile]) throw Error("図の入力意味の記録がない: " + profile);
  md += `| ${profile} | ${domain.map(([min, max], i) => `${i}：${min}〜${max}`).join("、")} | ${sceneText(figureMeaning[profile])} |\n`;
}
md += "\n旧午後の管理図は src/core/legacy-afternoon-figures.ts が登録された問題定義の有限入力から作る厳密なtuple辞書で検査する。上の上下限は外接域であり、個々の整数が範囲内でも未登録の組合せは拒否する。素材の出典と権利は基準問題の同じ本文・図・付属資料の単位から継承する。固定の問題本文画像は生成へ流用せず、登録された公式付属資料（正誤表・共通記法・API・言語仕様）だけを個別の素材条件・厳密なIDと位置で保持する。\n";
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
