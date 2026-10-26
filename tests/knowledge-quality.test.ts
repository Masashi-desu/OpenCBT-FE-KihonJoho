import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture } from "./fixtures";
import facts from "./fixtures/knowledge-pairs.json";
import { bindQuestion } from "../src/core/generation";
import { Content } from "../src/ui/Content";
import { questionStudyTerms } from "../src/core/study-terms";
import type { Block } from "../src/core/types";

const blockText = (blocks: Block[]) => blocks.map(b => "text" in b ? b.text : "").join("");

test("all knowledge subjects render without copying a distinctive answer phrase into the stem", () => {
  const bundle = fixture();
  for (const fact of facts) {
    const template = bundle.templates.find(t => t.id === `template-source-${fact.source}`)!;
    const base = bundle.questions.find(q => q.id === template.baseQuestionRef.questionId)!;
    for (let target = 0; target < fact.pairs.length; target++) {
      for (let rotation = 0; rotation < 3; rotation++) {
        const q = bindQuestion(base, template, [target, rotation], `quality-${fact.source}`, "2026-10-16T00:00:00Z");
        const stem = blockText(q.prompt.blocks);
        const options = q.choices.map(c => blockText(c.content.blocks));
        const answer = options[q.choices.findIndex(c => c.id === q.correctAnswer.choiceId)];
        assert(!stem.includes(answer), `${fact.source}/${target}: answer appears in stem`);
        // A long shared phrase is a warning only when it distinguishes one
        // option. Necessary common context and the requested term stay valid.
        for (let i = 0; i <= answer.length - 12; i++) {
          const phrase = answer.slice(i, i + 12);
          if (options.filter(option => option.includes(phrase)).length === 1)
            assert(!stem.includes(phrase), `${fact.source}/${target}: distinctive phrase ${phrase}`);
        }
        const html = renderToStaticMarkup(createElement(Content, {
          content: q.prompt, bundle, assetUrls: {}, credit: false,
        }));
        assert(html.replace(/<\/?span(?:\s[^>]*)?>/g, "").includes(stem), `${fact.source}/${target}: visible stem, allowing inline layout spans`);
        assert.equal(options.length, 4);
      }
    }
  }
});

test("model terms are asked without defining the requested concept beforehand", () => {
  const bundle = fixture();
  const template = bundle.templates.find(t => t.id === "template-source-2025-a-1")!;
  const base = bundle.questions.find(q => q.id === template.baseQuestionRef.questionId)!;
  for (let target = 0; target < 4; target++) {
    const q = bindQuestion(base, template, [target, 0], "model-quality", "2026-10-16T00:00:00Z");
    const stem = blockText(q.prompt.blocks);
    assert.match(stem, /に関する記述として、最も適切なものはどれか。$/);
    assert.doesNotMatch(stem, /表現や規則|大量のデータ|報酬|外部資料|追加学習/);
    assert.equal(stem.includes("事前学習済みのモデル"), target === 0);
  }
});

test("countermeasure questions supply the problem, without naming the intervention", () => {
  const bundle = fixture();
  for (const source of ["2024-a-10", "2026-a-11"]) {
    const fact = facts.find(f => f.source === source)!;
    assert("promptSubjects" in fact && fact.promptSubjects);
    const template = bundle.templates.find(t => t.id === `template-source-${source}`)!;
    const base = bundle.questions.find(q => q.id === template.baseQuestionRef.questionId)!;
    for (let target = 0; target < 4; target++) {
      const q = bindQuestion(base, template, [target, 0], "intervention-quality", "2026-10-16T00:00:00Z");
      const stem = blockText(q.prompt.blocks);
      assert(stem.includes(fact.promptSubjects[target]));
      for (const [intervention] of fact.pairs) assert(!stem.includes(intervention));
      assert.doesNotMatch(stem, /プレースホルダ|許可した識別子|コーディング規約|セキュアプログラミング|網羅度|管理レビュー/);
    }
  }
});

test("mashup choices describe concrete cases with distinct service relationships", () => {
  const fact = facts.find(f => f.source === "2024-a-5")!;
  // Independently reviewed evidence: output-to-input, embedded content,
  // merged datasets, and page-local updating rather than a copied definition.
  const evidence = [
    /経路検索サービス.*到着予定時刻.*飲食店予約サービスへ渡し/,
    /案内ページ.*地図サービス.*地図を埋め込/,
    /複数の不動産情報サービス.*物件データ.*一つの一覧/,
    /検索欄.*サーバから候補を非同期に取得.*候補欄だけ/,
  ];
  for (const [target, [, description]] of fact.pairs.entries())
    assert.deepEqual(evidence.flatMap((pattern, i) => pattern.test(description) ? [i] : []), [target]);
});

test("chart targets use established names instead of a label that states the answer", () => {
  const fact = facts.find(f => f.source === "2026-a-12")!;
  assert.deepEqual(fact.pairs.map(([name]) => name), [
    "バーンダウンチャート", "バーンアップチャート", "累積フロー図", "ガントチャート",
  ]);
  assert.match(fact.pairs[2][1], /工程別の帯の幅.*滞留/);
  assert.match(fact.pairs[3][1], /縦軸を作業項目.*開始と終了を横棒/);
  const bundle = fixture();
  const base = structuredClone(bundle.questions.find(q => q.id === "question-template-source-2026-a-12")!);
  base.prompt.blocks = [{ type: "paragraph", text: fact.pairs.map(([name]) => name).join("、") }];
  base.choices = [];
  base.explanation.blocks = [];
  const terms = questionStudyTerms(base, bundle.assets);
  for (const [name, meaning] of fact.pairs)
    assert.equal(terms.find(term => term.term === name)?.meaning, meaning + "。");
});
