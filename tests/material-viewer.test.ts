import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import { materialPages, visibleMaterialPage } from "../src/ui/MaterialViewer";
import { isAutumn2016CommonContext } from '../src/core/generators/legacy-2016-autumn-am-common';

test("material pages preserve every distributed question's complete reading order and saved data", () => {
  const bundle = fixture();
  assert.equal(bundle.questions.length, 1772);
  let commonCount = 0;
  // These four official booklets have a common page-2 appendix. It follows
  // the question body; question-specific material retains its prior order.
  const commonSources = new Map([
    ["2017h29a-fe-am", "source-ipa-2017h29a-fe-am-qs"],
    ["2018h30h-fe-am", "source-ipa-2018h30h-fe-am-common-p2"],
    ["2018h30a-fe-am", "source-ipa-2018h30a-fe-am-common-p2"],
    ["2019r01a-fe-am", "source-ipa-2019r01a-fe-am-common-p2"],
  ]);
  for (const question of bundle.questions) {
    const saved = structuredClone(question);
    const pages = materialPages(question);
    const contexts = question.contextRefs.map(id => question.contexts.find(context => context.id === id)!);
    const spring2016=question.origin.sourceRefs.some(r=>r.sourceId==='source-ipa-2016h28h-fe-am-qs'&&r.locator.year===2016&&r.locator.timeSlot==='午前');
    const common = contexts.filter(context => isAutumn2016CommonContext(question,context) || spring2016 && [2,3].some(page=>context.title===`問題文中で共通に使用される表記ルール（p.${page}）`) || [...commonSources].some(([book, sourceId]) =>
      context.id === `context-${book}-common` &&
      question.origin.sourceRefs.some(ref => ref.sourceId === sourceId && ref.locator.timeSlot === "午前") &&
      context.content.attribution.sourceRefs.some(ref => ref.sourceId === sourceId && ref.locator.page === 2 && !ref.locator.questionNumber)));
    const native = contexts.filter(context => !common.includes(context));
    commonCount += common.length;
    const expected = [
      ...native.flatMap(context => context.content.blocks),
      ...question.prompt.blocks,
      ...common.flatMap(context => context.content.blocks),
    ];
    assert.deepEqual(pages.flatMap((page) => page.content.blocks), expected, question.id);
    assert.deepEqual(
      pages.flatMap((page) => page.context ? [page.context] : []),
      [...native, ...common],
      question.id,
    );
    assert.deepEqual(question, saved, question.id);
  }
  assert.equal(commonCount, 1232, "all originals and bases retain four prior appendices and both appendices for2016 spring/autumn");
  const withPassage=structuredClone(bundle.questions.find(q=>q.id==='question-ipa-2016h28h-fe-am-1')!);
  withPassage.contexts.unshift({id:'specific-passage',title:'この問題の条件',content:{attribution:structuredClone(withPassage.prompt.attribution),blocks:[{type:'paragraph',text:'この問題だけに必要な条件。'}]}});
  withPassage.contextRefs.unshift('specific-passage');assert.equal(materialPages(withPassage)[0].id,'specific-passage','question-specific material stays before the prompt');
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
