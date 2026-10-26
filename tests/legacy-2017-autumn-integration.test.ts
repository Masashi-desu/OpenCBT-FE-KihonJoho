import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Bundle, Content as ContentData } from "../src/core/types";
import { schema } from "../src/core/validation";
import { contentHash } from "../src/core/hash";
import { bindQuestion } from "../src/core/generation";
import { validateSourceFormat } from "../src/core/generation-formats";
import { legacy2017AutumnAfternoonDefinitions as definitions } from "../src/core/generators/legacy-2017-autumn-afternoon-definitions";
import { legacyAfternoonSourceChoices } from "../src/core/generators/legacy-afternoon-definitions";
import { readLegacyAfternoonFigure } from "../src/core/legacy-afternoon-figures";
import { Content } from "../src/ui/Content";
import { legacy2017AutumnNativeTextContracts } from "../src/ui/Legacy2017AutumnNativeText";
import { assertAutumn2017OriginalAnswers } from "../scripts/legacy-2017-autumn-afternoon-booklet";
import { prepared2017AutumnAfternoon } from "./fixtures/prepared-2017-autumn-afternoon";

const prepared = prepared2017AutumnAfternoon();
test("2017 autumn complete13 local factories: actual schemas/official75 fields/90 materials stay excluded", async () => {
  const rows = await prepared; let fields = 0, assets = 0;
  assert.equal(rows.length,13);
  for (const { number, records } of rows) {
    const original = records.questions.find(q => q.origin.kind === "official_reprint")!;
    const base = records.questions.find(q => q.origin.kind === "official_adaptation")!;
    assertAutumn2017OriginalAnswers(original,number); fields += original.answerParts!.length; assets += records.assets.length;
    for (const q of records.questions) { schema("question",q); assert.equal(q.distribution,"excluded"); }
    const template = records.templates[0]; schema("template",template);
    assert.equal(template.distribution,"excluded"); assert.equal(template.originalContentSha256,await contentHash(base));
    assert.doesNotThrow(() => validateSourceFormat(base,template),`Q${number} prepared base format`);
    assert(legacyAfternoonSourceChoices(base)); assert(!legacyAfternoonSourceChoices(original));
  }
  assert.equal(fields,75); assert.equal(assets,90);
});
test("2017 autumn real shared binder/Content: all enumerated conditions render every registered figure and exact text boxes", async () => {
  const rows = await prepared; let generated = 0; const profiles = new Set<string>();
  const contracts = legacy2017AutumnNativeTextContracts(); let textBoxes = 0;
  for (const { number, records } of rows) {
    const definition = definitions[number-1], base = records.questions.find(q => q.origin.kind === "official_adaptation")!;
    const template = records.templates[0];
    // Rendering consumes only these real source/rights/assets; other bundle
    // registries are not used by Content in this test.
    const bundle = records as Bundle;
    const assetUrls = Object.fromEntries(records.assets.map(a => [a.id,`/${a.path}`]));
    for (let value = definition.fields[0].minimum; value <= definition.fields[0].maximum; value++) {
      const question = bindQuestion(base,template,[value],`autumn-${number}-${value}`,"2026-10-26T18:00:00Z");
      schema("question",question);
      assert.doesNotThrow(() => validateSourceFormat(question,template),`Q${number}/${value} bound format`);
      assert.equal(question.distribution,"excluded"); assert.equal(question.choiceShuffleAllowed,false);
      for (const content of [question.prompt,...question.choices.map(c => c.content),...question.contexts.map(c => c.content)]) {
        const html = renderToStaticMarkup(createElement(Content,{ content,bundle,assetUrls }));
        for (const block of content.blocks) {
          if (block.type === "diagram" && block.scene.kind === "source_figure") {
            assert.equal(readLegacyAfternoonFigure(block.scene.profile,block.scene.values).caption,block.caption);
            profiles.add(block.scene.profile);
          }
          if (block.type === "paragraph" || block.type === "code") {
            const contract = contracts.find(row => row.number === number && row.kind === block.type && row.text === block.text);
            if (contract) {
              const isolated: ContentData = { attribution: content.attribution, blocks: [block] };
              const actual = renderToStaticMarkup(createElement(Content,{ content:isolated,bundle,assetUrls }));
              assert.equal((actual.match(/data-autumn-blank=/g) ?? []).length,contract.regions.filter(r => r.type === "blank").length,
                `ordinary Content boxes Q${number}/${value}/${block.text}`);
              textBoxes += (actual.match(/data-autumn-blank=/g) ?? []).length;
            }
          }
        }
        assert(!html.includes("undefined"),`undefined native text Q${number}/${value}`);
      }
      generated++;
    }
  }
  assert.equal(generated,60); assert.equal(profiles.size,113); assert(textBoxes >= 80);
});
test("2017 autumn source-specific text presentation cannot decorate unrelated source or altered locator", async () => {
  const rows = await prepared, records = rows[0].records;
  const base = records.questions.find(q => q.origin.kind === "official_adaptation")!;
  const contract = legacy2017AutumnNativeTextContracts().find(c => c.number === 1 && c.kind === "paragraph" && c.regions.some(r => r.type === "blank"))!;
  const content: ContentData = { attribution:structuredClone(base.prompt.attribution),blocks:[{ type:"paragraph",text:contract.text }] };
  const render = (data: ContentData) => renderToStaticMarkup(createElement(Content,{ content:data,bundle:records as Bundle,assetUrls:{} }));
  assert(render(content).includes("data-autumn-blank="));
  for (const mode of ["source", "period", "number", "origin", "text"]) {
    const changed = structuredClone(content);
    if (mode === "source") changed.attribution.sourceRefs[0].sourceId = "source-unrelated";
    if (mode === "period") changed.attribution.sourceRefs[0].locator.period = "春期";
    if (mode === "number") changed.attribution.sourceRefs[0].locator.questionNumber = "2";
    if (mode === "origin") changed.attribution.origin = "original";
    if (mode === "text") { assert(changed.blocks[0].type === "paragraph"); changed.blocks[0].text += "変更"; }
    assert(!render(changed).includes("data-autumn-blank="),mode);
  }
});
test("2017 autumn fixed appendices keep exact independent credits, image scope and order through the real shared binder", async () => {
  for (const { number,records } of await prepared) {
    if (![5,8,11,12,13].includes(number)) continue;
    const base = records.questions.find(q => q.origin.kind === "official_adaptation")!, template = records.templates[0];
    const good = bindQuestion(base,template,[0],`material-${number}`,"2026-10-26T18:00:00Z");
    assert.deepEqual(good.contexts,base.contexts); assert.deepEqual(good.contextRefs,base.contextRefs);
    for (const mode of ["context", "right", "page", "asset", "block"]) {
      const changed = structuredClone(base);
      if (mode === "context") changed.contextRefs[0] += "-foreign";
      if (mode === "right") changed.contexts[0].content.attribution.rightsRefs[0] = "rights-original";
      if (mode === "page") changed.contexts[0].content.attribution.sourceRefs[0].locator.page!++;
      if (mode === "asset") changed.assetRefs[0] += "-unreviewed-full-page";
      if (mode === "block") changed.contexts[0].content.blocks.push({ type:"paragraph",text:"未確認の付属資料" });
      assert.throws(() => bindQuestion(changed,template,[0],`material-${number}`,"2026-10-26T18:00:00Z"),
        { code:"SOURCE_MATERIAL" },`Q${number} ${mode}`);
      assert.throws(() => validateSourceFormat(changed,template),{ code:"SOURCE_MATERIAL" },`Q${number} ${mode} saved data`);
    }
  }
});
