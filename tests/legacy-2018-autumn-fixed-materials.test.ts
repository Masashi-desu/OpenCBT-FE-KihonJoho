import test from "node:test";
import assert from "node:assert/strict";
import type { Question } from "../src/core/types";
import { DataError } from "../src/core/errors";
import { autumn2018AllSpecs } from "../scripts/legacy-2018-autumn-all-specs";
import { autumn2018TestBundle } from "./fixtures/legacy-2018-autumn-prepared-fixture";
import { bindAutumn2018PreparedBody } from "../scripts/import-legacy-2018-autumn-pm-preparation";
import { bindLegacyAfternoonQuestion, validateLegacyAfternoonFormat } from "../src/core/generators/legacy-afternoon-binding";
import { validate2018AutumnFixedMaterials } from "../src/core/generators/legacy-2018-autumn-material-validation";

const numbers = [8, 11, 12, 13] as const;
const specFor = (n: number) => { const spec = autumn2018AllSpecs.find(s => s.number === n); assert(spec); return spec; };
const baseFor = (n: number) => { const bundle = autumn2018TestBundle(n); return { base: bundle.questions[1], template: bundle.templates[0] }; };
const isMaterialError = (error: unknown) => error instanceof DataError && error.code === "SOURCE_MATERIAL";

// These are current factory metadata identities, not complete Question gold or
// permission fixtures. Original body images are deliberately outside this guard.
test("four current appendix identities preserve source order, content, captions and credits", () => {
  for (const n of numbers) {
    const { base } = baseFor(n), definition = specFor(n).definition, before = structuredClone(base);
    assert.doesNotThrow(() => validate2018AutumnFixedMaterials(base, definition));
    assert.doesNotThrow(() => validateLegacyAfternoonFormat(base, definition));
    assert.deepEqual(base, before);
  }
  assert.deepEqual(baseFor(13).base.contextRefs, ["context-2018h30a-fe-pm-13-common", "context-2018h30a-fe-pm-13-sheet"]);
  assert.deepEqual(baseFor(11).base.contextRefs, ["context-2018h30a-fe-pm-11-erratum", "context-2018h30a-fe-pm-11-api"]);
});

test("every fixed appendix reference, page, caption and individual credit rejects replacement or omission", t => {
  let rejected = 0, groups = 0, imagePages = 0, sourcePages = 0;
  for (const n of numbers) {
    const { base, template } = baseFor(n), definition = specFor(n).definition;
    const changes: { name: string; change: (q: Question) => void }[] = [
      { name: "missing-context-ref", change: q => { q.contextRefs = q.contextRefs.slice(1); } },
      { name: "duplicate-context-ref", change: q => { q.contextRefs.push(q.contextRefs[0]); } },
      { name: "missing-context", change: q => { q.contexts.pop(); } },
      { name: "extra-context", change: q => { q.contexts.push(structuredClone(q.contexts[0])); } },
      { name: "missing-asset-ref", change: q => { q.assetRefs.pop(); } },
      { name: "reordered-asset-refs", change: q => { q.assetRefs.reverse(); } },
      { name: "extra-asset-ref", change: q => { q.assetRefs.push("asset-unrelated"); } },
    ];
    if (base.contexts.length > 1) changes.push({ name: "reordered-groups-with-synced-refs", change: q => { q.contexts.reverse(); q.contextRefs = q.contexts.map(c => c.id); } });
    for (const [i, context] of base.contexts.entries()) {
      groups++;
      changes.push(
        { name: `group${i}-identity`, change: q => { q.contexts[i].id += "-foreign"; q.contextRefs[i] = q.contexts[i].id; } },
        { name: `group${i}-title`, change: q => { q.contexts[i].title += "別資料"; } },
        { name: `group${i}-presentation`, change: q => { delete q.contexts[i].presentation; } },
        { name: `group${i}-origin`, change: q => { q.contexts[i].content.attribution.origin = "adapted"; } },
        { name: `group${i}-body-right-inheritance`, change: q => { q.contexts[i].content.attribution.rightsRefs = [`rights-ipa-2018h30a-fe-pm-${n}`]; } },
        { name: `group${i}-original-right`, change: q => { q.contexts[i].content.attribution.rightsRefs = ["rights-original"]; } },
        { name: `group${i}-creator`, change: q => { q.contexts[i].content.attribution.creatorIds = ["codex"]; } },
      );
      if (context.content.blocks.length > 1) changes.push({ name: `group${i}-page-order`, change: q => { q.contexts[i].content.blocks.reverse(); } });
      for (const [j] of context.content.attribution.sourceRefs.entries()) {
        sourcePages++;
        changes.push(
          { name: `group${i}-source${j}-omit`, change: q => { q.contexts[i].content.attribution.sourceRefs.splice(j, 1); } },
          { name: `group${i}-source${j}-body-source`, change: q => { q.contexts[i].content.attribution.sourceRefs[j].sourceId = `source-ipa-2018h30a-fe-pm-${n}-qs`; } },
          { name: `group${i}-source${j}-locator`, change: q => { q.contexts[i].content.attribution.sourceRefs[j].locator.page = 1; } },
        );
      }
      for (const [j] of context.content.blocks.entries()) {
        imagePages++;
        changes.push(
          { name: `group${i}-page${j}-omit`, change: q => { q.contexts[i].content.blocks.splice(j, 1); } },
          { name: `group${i}-page${j}-replace`, change: q => { const b = q.contexts[i].content.blocks[j]; assert(b.type === "image"); b.assetId += "-other"; } },
          { name: `group${i}-page${j}-caption`, change: q => { const b = q.contexts[i].content.blocks[j]; assert(b.type === "image"); b.caption += "変更"; } },
        );
      }
    }
    for (const { name, change } of changes) {
      const bad = structuredClone(base); change(bad); assert.notDeepEqual(bad, base, `${n}/${name}: meaningful mutation`);
      const before = structuredClone(bad);
      assert.throws(() => validate2018AutumnFixedMaterials(bad, definition), isMaterialError, `${n}/${name}/guard`);
      assert.throws(() => validateLegacyAfternoonFormat(bad, definition), isMaterialError, `${n}/${name}/format`);
      assert.throws(() => bindLegacyAfternoonQuestion(bad, template, definition, [...definition.reference], "bad-fixed-appendix", "2026-10-28T00:00:00Z"), isMaterialError, `${n}/${name}/before-bind`);
      assert.deepEqual(bad, before, `${n}/${name}: no repair or mutation`);
      rejected++;
    }
  }
  assert.deepEqual([groups, imagePages, sourcePages], [6, 20, 20]);
  assert.equal(rejected, 197);
  t.diagnostic(JSON.stringify({ rejectedMutants: rejected, guardCalls: rejected * 3, groups, imagePages, sourcePages }));
});

test("actual shared binder keeps fixed metadata exact for every finite input of the four generated sources", t => {
  const counts: Record<number, number> = {};
  for (const n of numbers) {
    const spec = specFor(n), { base, template } = baseFor(n); let checked = 0;
    function visit(values: number[]) {
      if (values.length < spec.definition.fields.length) {
        const field = spec.definition.fields[values.length];
        for (let value = field.minimum; value <= field.maximum; value++) visit([...values, value]);
        return;
      }
      const generated = bindLegacyAfternoonQuestion(base, template, spec.definition, values, `fixed-material-${n}-${checked}`, "2026-10-28T00:00:00Z");
      validate2018AutumnFixedMaterials(generated, spec.definition);
      assert.deepEqual(generated.contexts, base.contexts); assert.deepEqual(generated.contextRefs, base.contextRefs); assert.deepEqual(generated.assetRefs, base.assetRefs);
      checked++;
    }
    visit([]); counts[n] = checked;
    const boundary = bindAutumn2018PreparedBody(base, spec.definition.build(spec.definition.fields.map(f => f.maximum)), spec);
    validateLegacyAfternoonFormat(boundary, spec.definition);
  }
  assert.deepEqual(counts, { 8: 128, 11: 8, 12: 8, 13: 1081 });
  t.diagnostic(JSON.stringify({ finiteMetadataInputs: Object.values(counts).reduce((a, b) => a + b, 0), counts }));
});

test("unrelated sources are untouched and object key order does not change fixed identities", () => {
  for (const n of [1, 2, 3, 4, 5, 6, 7, 9, 10]) {
    const { base } = baseFor(n), before = structuredClone(base);
    validate2018AutumnFixedMaterials(base, specFor(n).definition); assert.deepEqual(base, before);
  }
  const { base } = baseFor(11), reversedObjectKeys = JSON.parse(JSON.stringify(base), (_key, value) =>
    value && typeof value === "object" && !Array.isArray(value) ? Object.fromEntries(Object.entries(value).reverse()) : value);
  assert.doesNotThrow(() => validate2018AutumnFixedMaterials(reversedObjectKeys, specFor(11).definition));
});

// A deliberately text-only carrier isolates shared binder before/after wiring.
// It is not an official question, independent answer oracle, or App run proof.
test("shared binder checks fixed references again after a body is built", () => {
  for (const n of numbers) {
    const { base, template } = baseFor(n), definition = specFor(n).definition;
    const carrier = structuredClone(base); carrier.prompt.blocks = [];
    carrier.choices.forEach(c => { c.content.blocks = [{ type: "paragraph", text: "固定資料ガードの配線用入力" }]; });
    const body = definition.build([...definition.reference]); body.prompt = [];
    body.choices = carrier.choices.map(c => structuredClone(c.content.blocks));
    const carrierDefinition = { ...definition, build: () => structuredClone(body) };
    const result = bindLegacyAfternoonQuestion(carrier, template, carrierDefinition, [...definition.reference], "fixed-material-carrier", "2026-10-28T00:00:00Z");
    validate2018AutumnFixedMaterials(result, definition);
    assert.deepEqual(result.contexts, base.contexts); assert.deepEqual(result.contextRefs, base.contextRefs); assert.deepEqual(result.assetRefs, base.assetRefs);
    const swappedBody = structuredClone(body); swappedBody.contexts![0].title += "別資料";
    assert.throws(() => bindLegacyAfternoonQuestion(carrier, template, { ...carrierDefinition, build: () => structuredClone(swappedBody) }, [...definition.reference], "changed-after-build", "2026-10-28T00:00:00Z"), isMaterialError);
    assert.deepEqual(carrier.contexts, base.contexts);
  }
});
