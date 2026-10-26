import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture } from "./fixtures/legacy-afternoon-main-preservation";
import { bindQuestion } from "../src/core/generation";
import { validateSourceFormat } from "../src/core/generation-formats";
import { SourceFigure } from "../src/ui/SourceFigure";
import { managedLegacyFigure } from "../src/core/managed-legacy-figures";

test("PM3 source credits cannot be detached from their managed generator in any attributed material", () => {
  const bundle = fixture();
  const template = bundle.templates.find(row => row.id === "template-source-2023-a-10")!;
  const base = bundle.questions.find(row => row.id === template.baseQuestionRef.questionId)!;
  const source = { sourceId: "source-ipa-2017h29h-fe-pm-3-qs", locator: { section: "問3 図1", page: 13,
    year: 2017, period: "春期", timeSlot: "午後", questionNumber: "3" } };
  for (const place of ["prompt", "choice", "explanation", "answer", "template"] as const) {
    const question = structuredClone(base), altered = structuredClone(template);
    const attribution = place === "prompt" ? question.prompt.attribution : place === "choice" ? question.choices[0].content.attribution
      : place === "explanation" ? question.explanation.attribution : place === "answer" ? question.correctAnswer.attribution : altered.attribution;
    attribution.sourceRefs.push(source);
    assert.throws(() => bindQuestion(question, altered, altered.referenceParameters.values, "detached-material", "2026-10-26T00:00:00Z"), { code: "SOURCE_MATERIAL" });
    assert.throws(() => validateSourceFormat(question, altered), { code: "SOURCE_MATERIAL" });
  }
  assert.doesNotThrow(() => bindQuestion(base, template, template.referenceParameters.values, "ordinary-source", "2026-10-26T00:00:00Z"));
});

test("PM3's managed renderer rejects a different visible caption", () => {
  assert.throws(() => renderToStaticMarkup(createElement(SourceFigure, {
    scene: { kind: "source_figure", profile: managedLegacyFigure.profile, values: [0] }, caption: "別の見出し",
  })), { code: "SOURCE_MATERIAL" });
});
