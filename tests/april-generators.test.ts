import test from "node:test";
import assert from "node:assert/strict";
import { april2022Definitions } from "../src/core/generators/sample-2022-april";
import { aprilGeneratorOracle } from "./fixtures/april-generator-oracle";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SourceFigure } from "../src/ui/SourceFigure";

for (const [i, d] of april2022Definitions.entries()) test(`${d.source}: exhaustive independent semantics, displayed inputs and all distractors`, () => {
  let count = 0;
  function visit(values: number[]) {
    if (values.length === d.fields.length) { aprilGeneratorOracle(i + 1, d.build(values), values); count++; return; }
    const f = d.fields[values.length];
    for (let n = f.minimum; n <= f.maximum; n++) visit([...values, n]);
  }
  visit([]);
  assert.equal(count, [360,18,4,75,8,18][i]);
});

test("the sentinel's own undefined next is distinguished from a newly created data node's endNode next", () => {
  const html = renderToStaticMarkup(createElement(SourceFigure, {
    scene: { kind: "source_figure", profile: "list-element-class", values: [1] }, caption: "クラスListElement",
  }));
  assert(html.includes("データ要素の初期状態はendNode。"));
  assert(html.includes("終端専用endNode自身のnextは本文のとおり未定義"));
  const body = april2022Definitions[2].build([1,0]);
  assert(body.prompt.some(b => b.type === "paragraph" && b.text.includes("endNodeのnextは未定義")));
});
