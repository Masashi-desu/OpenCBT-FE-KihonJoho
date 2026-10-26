import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LegacyAfternoonCode } from "../src/ui/LegacyAfternoonCode";
import { legacy2017Pm9Definition } from "../src/core/generators/legacy-2017-pm9";
import type { Attribution } from "../src/core/types";

const attribution: Attribution = { origin: "adapted", sourceRefs: [{ sourceId: "source-ipa-2017h29h-fe-pm-9-qs",
  locator: { section: "問9", year: 2017, period: "春期", timeSlot: "午後", questionNumber: "9" } }],
  rightsRefs: ["rights-ipa-2017h29h-fe-pm-9", "rights-original"], creatorIds: ["codex"] };
test("the source-reviewed C program retains exactly its three rectangular holes and alpha/beta text", () => {
  for (let value = 0; value < 8; value++) {
    const code = legacy2017Pm9Definition.build([value]).prompt.flatMap(block => block.type === "code" && block.language === "c" ? [block] : []);
    const html = code.map(block => renderToStaticMarkup(createElement(LegacyAfternoonCode, { text: block.text,
      language: block.language, attribution }))).join("\n");
    for (const letter of ["a", "b", "c"]) assert.equal(html.split(`data-source-blank="${letter}"`).length - 1, 1);
    assert.equal(html.split('class="source-code-blank"').length - 1, 3);
    assert(html.includes("α")); assert(html.includes("β"));
  }
});
test("ordinary array subscripts, unknown programs and unrelated source credits stay literal", () => {
  const text = "int result = array[a] + other[b];";
  const ordinary = renderToStaticMarkup(createElement(LegacyAfternoonCode, { text, language: "c", attribution }));
  assert.equal(ordinary, text);
  const program = legacy2017Pm9Definition.build([0]).prompt.find(block => block.type === "code" && block.language === "c")!;
  assert(program.type === "code");
  const other = { ...attribution, sourceRefs: [] };
  assert(!renderToStaticMarkup(createElement(LegacyAfternoonCode, { text: program.text, language: "c", attribution: other })).includes("source-code-blank"));
});
