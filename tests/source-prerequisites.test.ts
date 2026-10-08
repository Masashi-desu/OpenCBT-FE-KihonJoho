import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture } from "./fixtures";
import { sourcePrerequisites } from "./fixtures/source-prerequisites";
import {
  bindQuestion,
  checkParameters,
  parametersForSeed,
  validateTemplateContract,
} from "../src/core/generation";
import type { Bundle, Question, Template } from "../src/core/types";
import { Content } from "../src/ui/Content";

// Only the question and referenced contexts count. Explanations, choices,
// attribution, SVG descriptions and accessibility-only text cannot supply notes.
function visibleProblem(q: Question, b: Bundle) {
  return [
    ...q.contextRefs.map((id) => q.contexts.find((c) => c.id === id)!.content),
    q.prompt,
  ]
    .map((content) =>
      renderToStaticMarkup(
        createElement(Content, {
          content,
          bundle: b,
          assetUrls: {},
          credit: false,
        }),
      ),
    )
    .join(" ")
    .replace(/<(title|desc)\b[^>]*>[\s\S]*?<\/\1>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"')
    .replace(/\s+/g, " ");
}
function assertNotes(source: string, q: Question, b: Bundle, values: number[]) {
  const visible = visibleProblem(q, b);
  for (const pattern of sourcePrerequisites[source])
    assert.match(
      visible,
      new RegExp(pattern, "u"),
      `${source}: ${pattern}; inputs ${values}`,
    );
  if (["2023-a-12", "2024-a-12"].includes(source) && values[0] === 0)
    assert.match(visible, /毎日決まった時間と場所.*進捗.*作業/);
  if (source === "2024-a-5" && values[0] === 0)
    assert.match(visible, /入出力処理を連結.*新たなサービス/);
  if (source === "2025-a-1") {
    if (values[0] === 0 || values[0] === 2)
      assert.match(visible, /事前学習済みのモデルに対して行う/);
    else if (values[0] === 1) {
      assert.match(visible, /基礎となる表現や規則を学ぶ段階で行う事前学習/);
      assert(!visible.includes("事前学習済みのモデルに対して行う"));
    } else assert.match(visible, /モデルの利用時に行う検索拡張生成/);
  }
  if (source === "2025-a-5")
    assert.match(
      visible,
      values[0] === 3 ? /RPAを用いた業務の自動化/ : /ソフトウェア開発/,
    );
  if (source === "2026-a-4")
    assert.match(
      visible,
      values[0] === 3
        ? /データセンタサービスの提供形態としてのハウジング/
        : /クラウドサービスの提供形態/,
    );
  if (source === "2026-a-5" && values[0] === 0)
    assert.match(visible, /仮想記憶方式.*処理の多重度.*応答速度が急激に遅く/);
  if (source === "2026-a-8" && values[0] === 0)
    assert.match(visible, /同じ周波数の電波が衝突.*干渉.*復調できない/);
  if (source === "2026-a-13" && values[0] === 0)
    assert.match(visible, /進捗が遅延.*投入工数を増やして/);
  if (source === "2023-b-1")
    assert(visible.includes(`maxNumは${values[0] + 2}以上`));
  if (source === "2023-b-5")
    assert(visible.includes(`配列添字に${values[0]}を加えた値`));
  if (source === "2024-b-3") {
    assert(visible.includes(`頂点番号は${1 + values[0]}〜${5 + values[0]}`));
    assert(visible.includes(`頂点番号から${values[0]}を引いた値`));
  }
  if (source === "2025-b-3")
    assert(visible.includes(`次の空き位置に${values[0]}を加えた値`));
  if (source === "2026-b-4")
    assert(visible.includes(`実際の要素番号に${values[0]}を加えた値`));
  if (source === "2026-b-5")
    assert(visible.includes(`実際の要素番号に${values[0]}を加えた値`));
  if (source === "2026-b-2") assert(visible.includes(`${values[1]}ビット型`));
  if (source === "2025-b-2")
    assert(visible.includes(`実際の残額に${values[1]}を加えた値`));
  if (source === "2023-b-6" && values[0] === 0) {
    assert.match(visible, /初期設定.*誰が実行しても同じ/);
    assert.match(visible, /ベンダーのWebサイトで公開.*誰でも閲覧/);
    assert.match(visible, /初期設定の変更はC社の情報システム部だけ/);
    assert.match(visible, /サーバは担当者ごとのIDとパスワードを必要/);
  }
  if (source === "2026-a-20") {
    const conditions = [
      /著作権を全てA社へ譲渡.*著作者人格権.*特段の合意がない/,
      /著作権を全てA社へ譲渡.*著作者人格権.*特段の合意がない/,
      /著作権をB社に留保.*社内での利用だけ.*未公表の図の公開に同意していない/,
      /著作権をB社に留保.*複製の許諾は与えない/,
    ];
    assert.match(visible, conditions[values[0]]);
  }
}
const sourceOf = (base: Question) =>
  base.origin.derivedFrom[0].questionId.replace("question-ipa-", "");

test("every eligible original has a reviewed premise and notation record", () => {
  const b = fixture();
  const originals = b.questions.filter(
    (q) => q.origin.kind === "official_reprint",
  );
  assert.equal(originals.length, 103);
  assert.deepEqual(
    Object.keys(sourcePrerequisites).sort(),
    originals.map((q) => q.id.replace("question-ipa-", "")).sort(),
  );
  assert(!("2025-b-6" in sourcePrerequisites));
});

test("all 103 sources display their required premises, notation, units and comments at baseline and changed inputs", async (ctx) => {
  const b = fixture();
  let checked = 0;
  for (const t of b.templates) {
    const base = b.questions.find(
      (q) => q.id === t.baseQuestionRef.questionId,
    )!;
    const source = sourceOf(base);
    assertNotes(source, base, b, t.referenceParameters.values);
    const inputs = [t.referenceParameters.values];
    for (let n = 0; n < 16; n++)
      inputs.push(
        (await parametersForSeed(n.toString(16).padStart(32, "0"), t)).values,
      );
    // Small conceptual subjects and form branches are exhaustively covered.
    if (
      ["3.2.0", "3.3.0"].includes(t.generatorRef.version) &&
      t.parameterDomain.fields![0].maximum <= 15
    )
      for (
        let target = t.parameterDomain.fields![0].minimum;
        target <= t.parameterDomain.fields![0].maximum;
        target++
      )
        inputs.push([target, ...t.referenceParameters.values.slice(1)]);
    // Single-field boundaries, subject to the independently enforced domain.
    for (const [i, field] of t.parameterDomain.fields!.entries())
      for (const edge of [field.minimum, field.maximum]) {
        const v = [...t.referenceParameters.values];
        v[i] = edge;
        try {
          checkParameters(t, v);
          inputs.push(v);
        } catch (e) {
          if (
            !(
              e instanceof Error &&
              "code" in e &&
              e.code === "PARAMETER_CONSTRAINT"
            )
          )
            throw e;
        }
      }
    for (const v of inputs) {
      try {
        checkParameters(t, v);
      } catch (e) {
        if (
          e instanceof Error &&
          "code" in e &&
          e.code === "PARAMETER_CONSTRAINT"
        )
          continue;
        throw e;
      }
      const q = bindQuestion(
        base,
        t,
        v,
        `instance-notes-${source}`,
        "2026-10-07T00:00:00Z",
      );
      assertNotes(source, q, b, v);
      checked++;
    }
  }
  assert(checked > 2000);
  ctx.diagnostic(
    `103 baseline questions and ${checked} generated inputs checked in rendered question content.`,
  );
});

test("missing notes cannot be supplied only by an explanation or diagram alternative", () => {
  const b = fixture();
  const t = b.templates.find((t) => t.id === "template-source-2023-a-6")!;
  const base = b.questions.find((q) => q.id === t.baseQuestionRef.questionId)!;
  const bad = structuredClone(base);
  const first = bad.prompt.blocks[0];
  assert(first.type === "paragraph");
  const full = first.text;
  first.text = full.slice(0, full.indexOf("ここで"));
  bad.explanation.blocks = [{ type: "paragraph", text: full }];
  assert.throws(
    () => assertNotes("2023-a-6", bad, b, [0]),
    assert.AssertionError,
  );
  const graphT = b.templates.find((t) => t.id === "template-source-2024-b-3")!;
  const graph = structuredClone(
    b.questions.find((q) => q.id === graphT.baseQuestionRef.questionId)!,
  );
  const p = graph.prompt.blocks[0];
  assert(p.type === "paragraph");
  const diagram = graph.prompt.blocks.find((b) => b.type === "diagram")!;
  assert(diagram.type === "diagram");
  diagram.alt += p.text;
  p.text = "無向グラフの空欄を選べ。";
  assert.throws(
    () => assertNotes("2024-b-3", graph, b, [0, 0]),
    assert.AssertionError,
  );
});

test("unpublished obsolete versions are rejected for new generation", () => {
  const b = fixture();
  for (const t of b.templates) {
    const previous = ["2.1.0", "2.2.0"].includes(t.generatorRef.version)
      ? ["2.0.0"]
      : ["3.0.0", "3.0.1", "3.1.0"];
    for (const version of previous) {
      const old: Template = structuredClone(t);
      old.generatorRef.version = version;
      assert.throws(() => validateTemplateContract(old), {
        code: "GENERATOR_REF",
      });
    }
  }
});
