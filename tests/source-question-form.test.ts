import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import facts from "./fixtures/knowledge-pairs.json";
import {
  bindQuestion,
  parametersForSeed,
  validateTemplateContract,
} from "../src/core/generation";
import { validateSourceFormat } from "../src/core/generation-formats";
import type { Block, Question } from "../src/core/types";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Content } from "../src/ui/Content";

// Original question intents reviewed independently from the generators. The
// remaining 53 conceptual questions are fixed in knowledge-pairs.json.
const originalIntents: Record<string, RegExp> = {
  "2023-a-1": /10進/,
  "2023-a-2": /変わるポインタ.*全て/,
  "2023-a-6": /推移的関数従属.*成立/,
  "2023-a-10": /WAFの設置場所/,
  "2023-a-11": /初期値の関係/,
  "2023-a-13": /追加費用.*最少.*作業/,
  "2024-a-1": /真理値表.*どれ/,
  "2024-a-2": /衝突が起こるキーの組合せ/,
  "2024-a-3": /キャッシュのヒット率/,
  "2024-a-4": /翌年度の稼働率/,
  "2024-a-13": /最少.*日/,
  "2024-a-19": /図から読み取れる/,
  "2024-a-20": /産業財産権と総称される四つの権利/,
  "2025-a-3": /大小関係/,
  "2025-a-4": /年後の稼働率/,
  "2025-a-6": /同じ結果.*SELECT/,
  "2025-a-7": /回線利用率/,
  "2025-a-14": /最短所要日数/,
  "2025-a-19": /1客席.*1日平均/,
  "2026-a-1": /a、b、c、dの関係/,
  "2026-a-6": /出力Yのタイミングチャート/,
  "2026-a-7": /制約違反で実行エラー/,
  "2026-a-9": /2要素認証/,
  "2026-a-14": /パーセントポイント.*向上/,
  "2026-a-17": /(?:リテンション率|会員の割合)が最も高い/,
  "2026-a-18": /事例として適切でない/,
  "2026-a-20": /利用を行う上で生じる制約/,
  "2023-b-1": /空欄.*a.*b.*組合せ/,
  "2023-b-2": /空欄.*順に出力/,
  "2023-b-3": /空欄.*最初に実行.*出力/,
  "2023-b-4": /空欄.*終了直後/,
  "2023-b-5": /空欄a・b.*組合せ/,
  "2023-b-6": /残るリスク.*最も適切/,
  "2024-b-1": /空欄.*答え/,
  "2024-b-2": /空欄に入る式/,
  "2024-b-3": /空欄.*答え/,
  "2024-b-4": /空欄.*回実行/,
  "2024-b-5": /空欄a〜c.*組合せ/,
  "2024-b-6": /依頼する対策/,
  "2025-b-1": /空欄.*a.*b.*組合せ/,
  "2025-b-2": /空欄.*総数/,
  "2025-b-3": /空欄a・b.*組合せ/,
  "2025-b-4": /空欄.*真になる回数/,
  "2025-b-5": /a・b.*組合せ/,
  "2026-b-1": /空欄.*答え/,
  "2026-b-2": /空欄.*式/,
  "2026-b-3": /空欄.*式/,
  "2026-b-4": /空欄a・b.*組合せ/,
  "2026-b-5": /空欄a・b.*組合せ/,
  "2026-b-6": /ルール3.*違反/,
};
const descriptionIntent: Record<string, RegExp> = {
  "2024-a-5": /例はどれか/,
  "2024-a-10": /対策として、有効/,
  "2024-a-14": /ための方法として、適切/,
  "2024-a-15": /処理を記述している事例/,
  "2025-a-11": /特徴はどれか/,
  "2025-a-18": /必要な施策/,
  "2026-a-2": /の処理方法を説明したものはどれか/,
  "2026-a-3": /特徴として、適切/,
  "2026-a-11": /ための対策として、最も適切/,
  "2026-a-12": /使い方として、適切/,
  "2026-a-15": /ための行為として、適切/,
  "2026-a-16": /IT活用事例/,
};
const blockText = (b: Block) =>
  "text" in b ? b.text : b.type === "list" ? b.items.join(" ") : "";
function assertIntent(source: string, q: Question) {
  const prompt = [
    ...q.prompt.blocks,
    ...q.contexts.flatMap((c) => c.content.blocks),
  ]
    .map(blockText)
    .join(" ");
  const fact = facts.find((f) => f.source === source);
  const expected = !fact
    ? originalIntents[source]
    : fact.answerForm === "comparison"
      ? /HTTPとHTTPSを比較.*HTTPSだけがもつ特徴/
      : fact.answerForm === "audit"
        ? /指摘事項として監査報告書に記載すべき/
        : fact.answerForm === "statements"
          ? /LAN間接続装置に関する記述.*適切/
          : fact.answerForm === "purpose"
            ? /有効な目的/
            : fact.answerForm === "term"
              ? /特性はどれか|ものはどれか|イベントはどれか|手法はどれか|モジュールはどれか|何と呼ぶか|役割.*誰か|分析手法はどれか|何というか/
              : (descriptionIntent[source] ?? /説明|記述|該当|特徴/);
  assert(expected, `Missing original intent: ${source}`);
  assert.match(prompt, expected, source);
  if (fact) assert(!prompt.includes("誤っている"), source);
}

test("all 103 original question intents survive abstraction at baseline and changed inputs", async () => {
  const b = fixture();
  assert.equal(Object.keys(originalIntents).length + facts.length, 103);
  for (const t of b.templates) {
    const base = b.questions.find(
      (q) => q.id === t.baseQuestionRef.questionId,
    )!;
    const source = base.origin.derivedFrom[0].questionId.replace(
      "question-ipa-",
      "",
    );
    const original = b.questions.find(
      (q) => q.id === `question-ipa-${source}`,
    )!;
    assert.equal(base.choices.length, original.choices.length, source);
    assertIntent(source, base);
    for (const seed of ["1".repeat(32), "e".repeat(32)]) {
      const parameters = await parametersForSeed(seed, t);
      const q = bindQuestion(
        base,
        t,
        parameters.values,
        `instance-form-${source}`,
        "2026-10-07T00:00:00Z",
      );
      assert.equal(q.choices.length, original.choices.length, source);
      assertIntent(source, q);
      validateSourceFormat(q, t);
    }
  }
});

test("a description question cannot become reverse identification or an incorrect correspondence", () => {
  const b = fixture();
  const t = b.templates.find((t) => t.id === "template-source-2026-a-2")!;
  const base = b.questions.find((q) => q.id === t.baseQuestionRef.questionId)!;
  assert.equal(t.generatorRef.version, "3.2.0");
  assert.equal(
    base.prompt.blocks.map(blockText).join(""),
    "クイックソートの処理方法を説明したものはどれか。",
  );
  const html = renderToStaticMarkup(
    createElement(Content, {
      content: base.prompt,
      bundle: b,
      assetUrls: {},
      credit: true,
    }),
  );
  assert(
    html.includes("<p>クイックソートの処理方法を説明したものはどれか。</p>"),
  );
  assert(html.includes("原資料 p.4"));
  assert(!html.includes("誤っている"));
  for (const prompt of [
    "この処理方法に該当する名称はどれか。",
    "次の名称と方法の対応のうち、誤っているものはどれか。",
  ]) {
    const bad = structuredClone(base);
    bad.prompt.blocks = [{ type: "paragraph", text: prompt }];
    assert.throws(() => validateSourceFormat(bad, t), {
      code: "SOURCE_FORMAT",
    });
  }
  const bad = structuredClone(base);
  bad.choices[0].content.blocks = [
    { type: "paragraph", text: "クイックソート" },
  ];
  assert.throws(() => validateSourceFormat(bad, t), { code: "SOURCE_FORMAT" });
  const old = structuredClone(t);
  old.generatorRef.version = "3.0.0";
  assert.throws(() => validateTemplateContract(old), { code: "GENERATOR_REF" });
});

test("changing a knowledge subject also changes subject-specific premises", () => {
  const b = fixture();
  const cases = [
    {
      source: "2024-a-5",
      target: 3,
      expected: /Webページにおける部分更新による画面操作の例はどれか/,
      incorrect: /複数のWebサービスを組み合わせる部分更新/,
    },
    {
      source: "2025-a-1",
      target: 1,
      expected: /基礎となる表現や規則を学ぶ段階で行う事前学習/,
      incorrect: /事前学習済みのモデルに対して行う事前学習/,
    },
    {
      source: "2025-a-5",
      target: 3,
      expected: /RPAを用いた業務の自動化の説明/,
      incorrect: /RPAを用いたソフトウェア開発/,
    },
    {
      source: "2025-a-18",
      target: 1,
      expected: /「多数のブランドを集めた買物場所を提供する」という目的/,
      incorrect: /提供するを実現/,
    },
    {
      source: "2026-a-4",
      target: 3,
      expected: /データセンタサービスの提供形態としてのハウジング/,
      incorrect: /クラウドサービスの提供形態としてのハウジング/,
    },
  ];
  for (const { source, target, expected, incorrect } of cases) {
    const t = b.templates.find((t) => t.id === `template-source-${source}`)!;
    const base = b.questions.find((q) => q.id === t.baseQuestionRef.questionId)!;
    for (let rotation = 0; rotation < 3; rotation++) {
      const q = bindQuestion(
        base,
        t,
        [target, rotation],
        `instance-context-${source}`,
        "2026-10-07T00:00:00Z",
      );
      const prompt = q.prompt.blocks.map(blockText).join(" ");
      assert.match(prompt, expected, source);
      assert.doesNotMatch(prompt, incorrect, source);
      assertIntent(source, q);
      validateSourceFormat(q, t);
    }
  }
});
