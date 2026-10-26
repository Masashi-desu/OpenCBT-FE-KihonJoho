import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readdirSync, readFileSync } from "node:fs";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { Attribution, Block, Bundle } from "../src/core/types";
import { legacy2018SpringAfternoonDefinitions } from "../src/core/generators/legacy-2018-spring-afternoon-definitions";
import { readLegacyAfternoonFigure } from "../src/core/legacy-afternoon-figures";
import { LegacyAfternoonFigure } from "../src/ui/LegacyAfternoonFigure";
import { Content } from "../src/ui/Content";

// The input counts follow the individually reviewed source-domain contracts.
// Semantic expectations live in the independent per-major oracle tests.
const expectedCounts = [4,24,4,16,2,64,60,48,9,18,40,12,4];
const ajv = new Ajv({ strict: false }); addFormats(ajv);
for (const file of readdirSync("docs/public/schemas").filter(f=>f.endsWith(".schema.json")))
  ajv.addSchema(JSON.parse(readFileSync(`docs/public/schemas/${file}`,"utf8")));
const validateDiagram = ajv.getSchema("https://opencbt-fe-kihonjoho.example/schemas/3.0.0/diagram.schema.json")!;
const bundle = { sources: [], rights: [], assets: [] } as unknown as Bundle;
function credit(number: number): Attribution {
  return { origin: "adapted", creatorIds: ["ipa", "codex"], rightsRefs: ["rights-original"],
    sourceRefs: [{ sourceId: `source-ipa-2018h30h-fe-pm-${number}-qs`,
      locator: { section: `午後 問${number}`, year: 2018, period: "春期", timeSlot: "午後", questionNumber: String(number) } }] };
}
function render(blocks: Block[], attribution: Attribution) {
  return renderToStaticMarkup(createElement(Content, {
    content: { blocks, attribution }, bundle, assetUrls: {}, showAttribution: false,
  }));
}

test("2018 spring all 305 valid inputs reach the shared schema and real figure dispatcher; 12 coupled invalid inputs stay rejected", () => {
  const profiles = new Set<string>(); let validTotal = 0, rejectedTotal = 0;
  for (const [index, definition] of legacy2018SpringAfternoonDefinitions.entries()) {
    let valid = 0, rejected = 0;
    const visit = (values: number[]) => {
      if (values.length < definition.fields.length) {
        const f = definition.fields[values.length];
        for (let value=f.minimum; value<=f.maximum; value++) visit([...values,value]);
        return;
      }
      let body;
      try { body = definition.build(values); }
      catch (error) {
        assert(error instanceof Error && error.message === "PARAMETER_CONSTRAINT");
        assert.equal(index+1, 7); rejected++; return;
      }
      valid++;
      const blocks = [...body.prompt, ...body.choices.flat(), ...(body.contexts ?? []).flatMap(c=>c.blocks)];
      for (const block of blocks) {
        if (block.type !== "diagram" || block.scene.kind !== "source_figure") continue;
        assert(validateDiagram(block),JSON.stringify(validateDiagram.errors));
        const { profile, values: figureValues } = block.scene;
        profiles.add(profile);
        assert.deepEqual(readLegacyAfternoonFigure(profile,figureValues), {alt:block.alt,caption:block.caption});
        const html = renderToStaticMarkup(createElement(LegacyAfternoonFigure, {profile,values:figureValues,caption:block.caption}));
        assert(html.length > 0 && !html.includes("undefined"));
        assert.throws(()=>renderToStaticMarkup(createElement(LegacyAfternoonFigure,{profile,values:figureValues,caption:block.caption+"変更"})));
      }
    };
    visit([]); assert.equal(valid,expectedCounts[index]);
    assert.equal(rejected,index===6?12:0); validTotal+=valid; rejectedTotal+=rejected;
  }
  assert.deepEqual([validTotal,rejectedTotal,profiles.size],[305,12,61]);
  assert.throws(()=>readLegacyAfternoonFigure("legacy-2018-spring-pm14-unknown",[0]));
  // Sparse numeric bounds do not admit an unregistered point between 1 and 3.
  assert.throws(()=>readLegacyAfternoonFigure("legacy-2018-spring-pm9-records",[2]));
});

test("source-owned spring native blanks and underlines require every exact source locator", () => {
  const body = legacy2018SpringAfternoonDefinitions[3].build([0,0]);
  const block = body.prompt.find(b=>b.type==="paragraph" && b.text.includes("二つ選べ"));
  assert(block?.type === "paragraph");
  const good = credit(4);
  assert.match(render([block],good),/spring2018-native-underline/);
  const foreign = structuredClone(good); foreign.sourceRefs[0].locator.year = 2017;
  const autumn = structuredClone(good); autumn.sourceRefs[0].locator.period = "秋期";
  const morning = structuredClone(good); morning.sourceRefs[0].locator.timeSlot = "午前";
  const wrongMajor = structuredClone(good); wrongMajor.sourceRefs[0].locator.questionNumber = "3";
  const mixed = structuredClone(good); mixed.sourceRefs.push(...foreign.sourceRefs);
  const own = structuredClone(good); own.origin = "original";
  for (const attribution of [foreign,autumn,morning,wrongMajor,mixed,own])
    assert.doesNotMatch(render([block],attribution),/spring2018-native-underline/);
  assert.doesNotMatch(render([{...block,text:block.text+"変更"}],good),/spring2018-native-underline/);
});

test("EVM two-level header is selected by the complete owned source table, not a caption alone", () => {
  const definition = legacy2018SpringAfternoonDefinitions[5];
  const body = definition.build([...definition.reference]);
  const block = body.prompt.find(b=>b.type==="table" && b.caption.startsWith("表5"));
  assert(block?.type === "table");
  assert.match(render([block],credit(6)),/colSpan="3"/i);
  assert.doesNotMatch(render([block],credit(5)),/legacy-2018-spring-source-table/);
  const changed = structuredClone(block); changed.rows[0][0]+="変更";
  assert.doesNotMatch(render([changed],credit(6)),/legacy-2018-spring-source-table/);
});
