import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import { materialPages, visibleMaterialPage } from "../src/ui/MaterialViewer";

test("material pages preserve every distributed question's complete reading order and saved data", () => {
  const bundle = fixture();
  for (const question of bundle.questions) {
    const saved = structuredClone(question);
    const pages = materialPages(question);
    const expected = [
      ...question.contextRefs.flatMap((id) =>
        question.contexts.find((context) => context.id === id)!.content.blocks,
      ),
      ...question.prompt.blocks,
    ];
    assert.deepEqual(pages.flatMap((page) => page.content.blocks), expected, question.id);
    assert.deepEqual(
      pages.flatMap((page) => page.context ? [page.context] : []),
      question.contextRefs.map((id) => question.contexts.find((context) => context.id === id)),
      question.id,
    );
    assert.deepEqual(question, saved, question.id);
  }
});

test("multipage originals keep all page images and the supplementary text available", () => {
  const question = fixture().questions.find((q) => q.id === "question-ipa-2026-b-6")!;
  const pages = materialPages(question);
  assert.equal(pages.length, 2);
  assert.deepEqual(
    pages.flatMap((page) => page.content.blocks).filter((block) => block.type === "image"),
    question.prompt.blocks.filter((block) => block.type === "image"),
  );
  assert(pages.at(-1)!.content.blocks.some((block) => block.type === "code"));
  assert(pages.every((page) => page.content.attribution === question.prompt.attribution));
});

test("fitting a shorter final page keeps it selected when scrolling is clamped", () => {
  const viewport = { top: 100, bottom: 576 };
  const pages = [{ top: -320, bottom: 140 }, { top: 150, bottom: 560 }];
  assert.equal(visibleMaterialPage(pages, viewport, 1, 12), 1);
  assert.equal(visibleMaterialPage(pages, viewport, 0, 12), 1);
  assert.equal(visibleMaterialPage(
    [{ top: 100, bottom: 250 }, { top: 260, bottom: 400 }], viewport, 1, 12,
  ), 1);
  assert.equal(visibleMaterialPage(
    [{ top: -300, bottom: 100 }, { top: 110, bottom: 850 }], viewport, 0, 12,
  ), 1);
  assert.equal(visibleMaterialPage([null], viewport, 0, 12), 0);
});
