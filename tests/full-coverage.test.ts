import { legacyAfternoonDefinitions } from "../src/core/generators/legacy-afternoon-definitions";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture, installFixtureGenerators } from "./fixtures";
import { additionalDefinitions } from "../src/core/generators";
import amCapacity from "./fixtures/stage1-am-capacity-review.json";
const amCapacityBySource = new Map(amCapacity.rows.map(r => [r.source, r]));
import {
  bindQuestion,
  parametersForSeed,
  answerSignature,
  answerCanVary,
} from "../src/core/generation";
import { schema, validateBundle } from "../src/core/validation";
import { validateSourceFormat } from "../src/core/generation-formats";
import { generationCoverage } from "../src/core/generation-coverage";
import { prepareRun, validateRun } from "../src/core/session";
import { selectQuestions } from "../src/core/selection";
import { Diagram } from "../src/ui/Content";
import { validateSourceFigure } from "../src/core/source-figures";
import { type Block } from "../src/core/types";
import fs from "node:fs";
import { sourceFigureDomains } from "../src/core/source-figures";
import { activityNetworkRenderer, readActivityNetwork } from "../src/core/activity-network";
import morningFigureDomains from "../src/core/legacy-morning-figure-domains.json";
import {
  partitionFirst,
  doubleHash,
  mergeTailCount,
  matchingPrefixCount,
  expectedCounts,
} from "../src/core/generators/subject-b";
import {
  circuitValue,
  projectDuration,
  scatterPoints,
} from "../src/core/generators/subject-a";

// This file declares tests for the actual installed registry, including AM.
// Initialize here before enumerating it; shared raw fixtures stay side-effect free.
await installFixtureGenerators();

type DiagramBlock = Extract<Block, { type: "diagram" }>;
const escapeHTML = (text: string) => text.replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" }[char]!));
function diagramMarkup(block: DiagramBlock): string {
  // Match Content's actual source-material boundary instead of dropping notices.
  return renderToStaticMarkup(createElement(Diagram, { ...block, materialAttribution: block.attribution }));
}
function assertDiagramMarkup(block: DiagramBlock, html: string, nativeAM: boolean): void {
  assert(!html.includes("<img"));
  assert(!html.includes("<details"));
  assert(!html.includes("diagram-alt"));
  const scene = block.scene;
  const profile = scene.kind === "source_figure" ? scene.profile : "";
  const namedHTML = nativeAM && ["legacy-2019-database-diagnosis", "legacy-2019-data-feedback",
    "legacy-2019-truth-table", "legacy-2019-score-relation"].includes(profile);
  if (namedHTML) {
    assert(scene.kind === "source_figure");
    assert(html.startsWith('<figure class="managed-diagram source-figure profile-' + profile + '"'));
    assert(!html.includes("<svg"), "native source table/relation remains semantic HTML");
    const scrollNames: Record<string, string> = {
      "legacy-2019-database-diagnosis": "原因の表。幅が足りない場合は左右にスクロールできます。",
      "legacy-2019-data-feedback": "分析結果の分類表。幅が足りない場合は左右にスクロールできます。",
      "legacy-2019-truth-table": "入力と出力の真理値表。幅が足りない場合は左右にスクロールできます。",
      "legacy-2019-score-relation": "得点表の列。学生番号と科目を組み合わせた主キーは実線下線で示します。",
    };
    assert(html.includes('<div class="diagram-scroll" tabindex="0" aria-label="' + scrollNames[profile] + '">'));
    const captions = [...html.matchAll(/<(?:figcaption|caption)\b[^>]*>([\s\S]*?)<\/(?:figcaption|caption)>/g)];
    assert.deepEqual(captions.map(m => m[1]), [escapeHTML(block.caption)]);
    if (profile === "legacy-2019-score-relation") {
      assert(!html.includes("<table"));
      const p = /<p\b[^>]*>([\s\S]*?)<\/p>/.exec(html)![1];
      assert.equal(p.replace(/<[^>]*>/g, ""), "得点（学生番号、科目、点数）");
      const keys = [...p.matchAll(/<span\b([^>]*)>([^<]*)<\/span>/g)];
      assert.deepEqual(keys.map(m => m[2]), ["学生番号", "科目"]);
      for (const key of keys) {
        assert(key[1].includes("text-decoration-line:underline"));
        assert(key[1].includes("text-decoration-style:solid"));
      }
    } else {
      assert.equal([...html.matchAll(/<table\b/g)].length, 1);
      const tbody = /<tbody>([\s\S]*?)<\/tbody>/.exec(html)![1];
      const rows = [...tbody.matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/g)];
      if (profile === "legacy-2019-database-diagnosis") {
        assert(html.includes('<table data-diagnosis-table="2019h31h-am15"'));
        assert(html.includes('<th scope="col">想定原因</th><th scope="col">調査項目</th>'));
        assert.deepEqual(rows.map(m => /data-investigation="([^"]+)"/.exec(m[1])![1]), [..."abcd"]);
        const causes = [
          ["同一サーバに他のシステムを共存させたことによる負荷の増加", "接続クライアント数の増加による通信量の増加"],
          ["非定型検索による膨大な処理時間を要するSQL文の実行"],
          ["フラグメンテーションによるディスクI/Oの増加"], ["データベースバッファの容量の不足"],
        ];
        rows.forEach((row, i) => {
          assert.deepEqual([...row[2].matchAll(/<li>([^<]*)<\/li>/g)].map(m => m[1]), causes[i]);
          const cells = [...row[2].matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/g)];
          assert.equal(cells.length, 2);
          assert.equal(cells[1][2], "abcd"[i]);
          assert.equal(cells[1][1].includes('data-questioned="true"'), i === scene.values[0]);
          if (i === scene.values[0]) assert(cells[1][1].includes("border:2px solid var(--line)"));
        });
      } else if (profile === "legacy-2019-data-feedback") {
        assert(html.includes('<table data-feedback-table="2019h31h-am64"'));
        assert(html.includes('<th scope="colgroup" colSpan="2">分析結果の反映タイミング</th>'));
        assert(html.includes('<th scope="col">一定期間ごと</th><th scope="col">即時</th>'));
        assert(html.includes('<th scope="rowgroup" rowSpan="2">分析結果の<br/>フィードバック先</th>'));
        assert.deepEqual(rows.map(row => /<th scope="row">([^<]*)<\/th>/.exec(row[2])![1]), ["顧客全体", "顧客個々"]);
        const cells = [...tbody.matchAll(/<td\b([^>]*)>([^<]*)<\/td>/g)];
        assert.deepEqual(cells.map(m => m[2]), [..."abcd"]);
        cells.forEach((cell, i) => {
          assert(cell[1].includes('data-feedback-cell="' + "abcd"[i] + '"'));
          assert.equal(cell[1].includes('data-questioned="true"'), i === scene.values[0]);
          if (i === scene.values[0]) {
            assert(cell[1].includes('aria-label="' + "abcd"[i] + '、問うセル、太枠"'));
            assert(cell[1].includes("border:3px solid var(--text-primary)"));
          }
        });
      } else {
        assert.equal(profile, "legacy-2019-truth-table");
        assert(html.includes('<th scope="colgroup" colSpan="2">入力</th><th scope="col">出力</th>'));
        assert(html.includes('<th scope="col">A</th><th scope="col">B</th><th scope="col">X</th>'));
        // Independently evaluate AND, XOR, NOR and NAND in the source's 00→11 order.
        const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
        const operations = [(a: number, b: number) => a & b, (a: number, b: number) => a ^ b,
          (a: number, b: number) => Number(!(a | b)), (a: number, b: number) => Number(!(a & b))];
        assert.deepEqual(rows.map(row => [...row[2].matchAll(/<td>([01])<\/td>/g)].map(m => Number(m[1]))),
          inputs.map(([a, b]) => [a, b, operations[scene.values[0]](a, b)]));
      }
    }
    return;
  }
  const compositeHTML = nativeAM && /<(?:table|ol|ul)\b/.test(html);
  if (!compositeHTML) {
    assert(html.includes("<desc"));
    return;
  }
  // Common pages retain independently named glyphs and visible source explanations.
  if (html.includes('data-common-reference="')) {
    assert(scene.kind === "source_figure" && scene.profile.endsWith("-am-common-gates"));
    assert(html.includes('<table aria-label="' + escapeHTML(block.caption) + '"'));
    assert(html.includes('<th scope="col">図記号</th><th scope="col">説明</th>'));
    assert.deepEqual([...html.matchAll(/data-common-gate="([^"]+)"/g)].map(m => m[1]),
      ["and", "nand", "or", "nor", "xor", "xnor", "buffer", "not", "tristate"]);
    const glyphRows = [...html.matchAll(/<tr><td><svg\b([^>]*)>[\s\S]*?<\/svg><\/td><td>([^<]+)<\/td><\/tr>/g)]
      .filter(m => m[1].includes('data-common-gate="'));
    assert.equal(glyphRows.length, 9);
    for (const row of glyphRows) {
      assert(row[1].includes('role="img"'));
      assert(row[1].includes('aria-label="' + row[2] + '"'), "glyph name equals its visible source explanation");
    }
    assert(html.includes("○") && html.includes("論理状態の反転又は否定"));
  } else {
    assert(html.includes('role="group"'));
    assert(html.includes('aria-description="' + escapeHTML(block.alt) + '"'));
    assert(/<(?:table|ol|ul)\b/.test(html), "HTML drawing retains its source table/flow structure");
  }
}


test("native AM semantic drawings reject missing names, cells, source marks and headers", () => {
  const b = fixture();
  const profiles = ["legacy-2019-database-diagnosis", "legacy-2019-data-feedback",
    "legacy-2019-truth-table", "legacy-2019-score-relation"];
  for (const profile of profiles) {
    const source = profile === "legacy-2019-database-diagnosis" ? "2019h31h-fe-am-15" :
      profile === "legacy-2019-data-feedback" ? "2019h31h-fe-am-64" :
      profile === "legacy-2019-truth-table" ? "2019r01a-fe-am-22" : "2019r01a-fe-am-26";
    const t = b.templates.find(t => t.generatorRef.id === `generator-source-${source}`)!;
    const base = b.questions.find(q => q.id === t.baseQuestionRef.questionId)!;
    const q = bindQuestion(base, t, t.referenceParameters.values, "native-markup-negative", "2026-10-31T00:00:00Z");
    const block = [q.prompt, ...q.contexts.map(c => c.content), ...q.choices.map(c => c.content)]
      .flatMap(c => c.blocks).find((block): block is DiagramBlock => block.type === "diagram" &&
        block.scene.kind === "source_figure" && block.scene.profile === profile)!;
    assert(block);
    const html = diagramMarkup(block);
    assertDiagramMarkup(block, html, true);
    const mutations = [html.replace('aria-label="', 'data-lost-name="'),
      html.replace(/(<(?:figcaption|caption)\b[^>]*>)[\s\S]*?(<\/(?:figcaption|caption)>)/, "$1欠落した表題$2")];
    if (profile === "legacy-2019-score-relation") {
      mutations.push(html.replace("text-decoration-line:underline", "text-decoration-line:none"));
      mutations.push(html.replace(">学生番号</span>", ">点数</span>"));
    } else {
      mutations.push(html.replace('scope="col"', 'scope="row"'));
      mutations.push(html.replace(/<tr\b[^>]*>[\s\S]*?<\/tr>(?=<\/tbody>)/, ""));
      if (profile !== "legacy-2019-truth-table") mutations.push(html.replace('data-questioned="true"', 'data-questioned="false"'));
      else mutations.push(html.replace(/<td>([01])<\/td>/, "<td>2</td>"));
    }
    for (const corrupt of mutations) {
      assert.notEqual(corrupt, html, profile + " mutation must alter its intended source feature");
      assert.throws(() => assertDiagramMarkup(block, corrupt, true), Error, profile + " must reject corrupted source structure");
    }
  }
});

test("source figure profiles match Schema and reject wrong shapes and parameter bounds", () => {
  const diagramSchema = JSON.parse(
    fs.readFileSync("docs/public/schemas/diagram.schema.json", "utf8"),
  );
  const source = diagramSchema.properties.scene.oneOf.find(
    (x: any) => x.properties.kind.const === "source_figure",
  );
  assert.deepEqual(
    [...source.properties.profile.enum].sort(),
    Object.keys(sourceFigureDomains).sort(),
  );
  for (const [profile, domain] of Object.entries(sourceFigureDomains)) {
    // Legacy AM drawings include correlated finite tuples, whose coordinate
    // minima need not form a valid drawing together.
    const morning = Object.hasOwn(morningFigureDomains, profile) ?
      morningFigureDomains[profile as keyof typeof morningFigureDomains] : undefined;
    const afternoon = legacyAfternoonDefinitions.flatMap(definition => {
      const body = definition.build(definition.fields.map(field => field.minimum));
      return [...body.prompt, ...body.choices.flat(), ...(body.contexts ?? []).flatMap(context => context.blocks)];
    }).find(block => block.type === "diagram" && block.scene.kind === "source_figure" && block.scene.profile === profile);
    const values = morning?.[0].values ?? (afternoon?.type === "diagram" && afternoon.scene.kind === "source_figure"
      ? [...afternoon.scene.values] : domain.map(([minimum]) => minimum));
    validateSourceFigure({ kind: "source_figure", profile, values });
    assert.throws(
      () =>
        validateSourceFigure({
          kind: "source_figure",
          profile,
          values: [...values, 0],
        }),
      { code: "FIGURE_PROFILE" },
    );
    assert.throws(
      () =>
        validateSourceFigure({
          kind: "source_figure",
          profile,
          values: [domain[0][1] + 1, ...values.slice(1)],
        }),
      { code: "FIGURE_PROFILE" },
    );
  }
  assert.throws(
    () =>
      validateSourceFigure({
        kind: "source_figure",
        profile: "unknown",
        values: [0],
      }),
    { code: "FIGURE_PROFILE" },
  );
});

test("every one of 734 official sources has exactly one generator and is a mix candidate", async () => {
  const b = fixture();
  await validateBundle(b);
  const c = generationCoverage(b);
  assert.equal(c.total, 734);
  assert.equal(c.covered, 734);
  assert(
    c.rows.every((r) => r.templates.length === 1 && r.linked.length === 1),
  );
  for (const subject of ["A", "B"] as const) {
    const prepared = selectQuestions(b, {
      subject,
      kind: "mix",
      year: 2026,
      mode: "study",
      size: "full",
      bindingMode: "generated_values",
    });
    assert.equal(prepared.set.questionRefs.length, subject === "A" ? 607 : 49);
  }
  const missing = structuredClone(b);
  missing.templates = missing.templates.filter(
    (t) => t.id !== "template-source-2026-a-1",
  );
  missing.sets = missing.sets.map((s) => ({
    ...s,
    generationBindings: s.generationBindings.filter(
      (g) => g.templateRef.id !== "template-source-2026-a-1",
    ),
  }));
  await assert.rejects(validateBundle(missing), {
    code: "GENERATION_COVERAGE",
  });
});
test("installed registry retains all467 reviewed AM families and their variable/fixed contracts", () => {
  const admitted = additionalDefinitions.filter(d => amCapacityBySource.has(d.source));
  assert.equal(amCapacity.rows.length, 467);
  assert.equal(new Set(admitted.map(d => d.source)).size, 467);
  assert.deepEqual(admitted.map(d => d.source).sort(), amCapacity.rows.map(r => r.source).sort());
  assert.equal(amCapacity.rows.filter(r => r.answerCanVary).length, 322);
  assert.equal(amCapacity.rows.filter(r => !r.answerCanVary).length, 145);
});
for (const d of additionalDefinitions)
  test(`${d.source}: baseline, source answer and 64 seeded parameter sets`, async () => {
    const b = fixture(),
      t = b.templates.find(
        (t) => t.generatorRef.id === `generator-source-${d.source}`,
      )!,
      base = b.questions.find((q) => q.id === t.baseQuestionRef.questionId)!,
      original = b.questions.find((q) => q.id === `question-ipa-${d.source}`)!;
    const correctOriginal = original.choices.find(
      (c) => c.id === original.correctAnswer.choiceId,
    )!.content.blocks[0];
    assert(correctOriginal.type === "paragraph");
    assert.equal(correctOriginal.text, d.sourceAnswer);
    assert.equal(base.choices.length, original.choices.length);
    assert.equal(base.origin.derivedFrom[0].questionId, original.id);
    const before = JSON.stringify(base),
      answers = new Set<string>();
    for (let i = 0; i < 64; i++) {
      const seed = i.toString(16).padStart(32, "0"),
        params = await parametersForSeed(seed, t);
      assert.deepEqual(params, await parametersForSeed(seed, t));
      const q = bindQuestion(
        base,
        t,
        params.values,
        `instance-${d.source}-${i}`,
        "2026-10-06T16:00:00Z",
      );
      schema("question", q);
      validateSourceFormat(q, t);
      assert.equal(q.choices.length, original.choices.length);
      assert.equal(
        new Set(q.choices.map((c) => JSON.stringify(c.content.blocks))).size,
        q.choices.length,
      );
      assert(q.origin.isModified);
      assert.equal(q.assetRefs.length, 0);
      assert(q.explanation.blocks.length > 0);
      answers.add(answerSignature(q));
      for (const content of [
        q.prompt,
        ...q.contexts.map((c) => c.content),
        ...q.choices.map((c) => c.content),
      ])
        for (const block of content.blocks)
          if (block.type === "diagram") {
            if (block.scene.kind === "source_figure") {
              assert.equal(block.rendererRef.id, "renderer-source-figures");
              assert.equal(block.rendererRef.version, "1.0.0");
              validateSourceFigure(block.scene);
            } else {
              assert.equal(block.rendererRef.id, activityNetworkRenderer.id);
              assert.equal(block.rendererRef.version, activityNetworkRenderer.version);
              readActivityNetwork(block.scene);
            }
            assertDiagramMarkup(block, diagramMarkup(block), amCapacityBySource.has(d.source));
          }
    }
    const reviewedAM = amCapacityBySource.get(d.source);
    if (reviewedAM) assert.equal(answerCanVary(t), reviewedAM.answerCanVary, d.source);
    if (answerCanVary(t))
      assert(
        answers.size >= 2,
        `${d.source} must change answer content, not only option order`,
      );
    else if (reviewedAM) {
      // A fixed answer-variation policy can still bind different objects or
      // operands in the rendered correct choice. Compare its exact reviewed
      // finite signatures; source-specific all-choice meaning is separate.
      assert.equal(d.answerVariation, "fixed");
      assert.equal(reviewedAM.answerCanVary, false);
      const finiteAnswers = new Set<string>(), displays = new Set<string>();
      let valid = 0, rejected = 0, retainedReference = false;
      function visit(values: number[]) {
        if (values.length < d.fields.length) {
          const field = d.fields[values.length];
          for (let n = field.minimum; n <= field.maximum; n++) visit([...values, n]);
          return;
        }
        try { d.build(values); } catch (e) {
          assert((e as Error).message === "PARAMETER_CONSTRAINT" || (e as {code?: string}).code === "PARAMETER_CONSTRAINT");
          rejected++; return;
        }
        const q = bindQuestion(base, t, values, "fixed-am-capacity", "2026-10-31T00:00:00.000Z");
        finiteAnswers.add(answerSignature(q));
        displays.add(JSON.stringify([q.prompt, q.contexts, q.choices]));
        retainedReference ||= JSON.stringify(values) === JSON.stringify(t.referenceParameters.values);
        valid++;
      }
      visit([]);
      assert.equal(valid, reviewedAM.validInputCount, d.source);
      assert.equal(rejected, reviewedAM.rejectedInputCount, d.source);
      assert.equal(finiteAnswers.size, reviewedAM.distinctAnswerSignatures, d.source);
      assert(finiteAnswers.size >= 1);
      assert([...answers].every(signature => finiteAnswers.has(signature)), d.source + " seeded answers remain inside reviewed finite capacity");
      assert(valid >= 2 && displays.size >= 2 && retainedReference, d.source + " must retain substantive conditions and reference");
    } else if (d.source === "2024-a-20") {
      assert.equal(d.source, "2024-a-20");
      assert.equal(answers.size, 1);
      assert(
        new Set(
          Array.from({ length: 8 }, (_, i) =>
            JSON.stringify(d.build([i]).choices),
          ),
        ).size === 8,
      );
    } else if (["sample-2022-dec-a-16","sample-2022-dec-a-18"].includes(d.source)) {
      assert.equal(d.answerVariation,"fixed");assert.equal(answers.size,1);
      const variants=Array.from({length:d.fields[0].maximum+1},(_,i)=>d.build([i]));
      assert.equal(new Set(variants.map(b=>JSON.stringify(b.choices))).size,variants.length);
      assert(variants.length>=3);
    } else {
      assert(["sample-2022-dec-a-2", "sample-2022-dec-b-7", "sample-2022-dec-b-10", "sample-2022-dec-b-12", "sample-2022-dec-b-16"].includes(d.source));
      assert.equal(d.answerVariation, "fixed");
      assert.equal(answers.size, 1);
      const low=d.fields.map(f=>f.minimum), high=d.fields.map(f=>f.maximum);
      assert.notDeepEqual(d.build(low).prompt,d.build(high).prompt,"fixed-answer algorithms must vary meaningful problem conditions");
    }
    assert.equal(JSON.stringify(base), before);
  });

test("new mixed runs bind every slot and preserve issued content across validation", async () => {
  const b = fixture();
  for (const subject of ["A", "B"] as const) {
    const run = await prepareRun(
      b,
      {
        subject,
        kind: "mix",
        year: 2026,
        mode: "study",
        size: "full",
        bindingMode: "generated_values",
      },
      {},
    );
    assert.equal(run.issued.length, subject === "A" ? 60 : 20);
    const before = JSON.stringify(run.issued);
    await validateRun(structuredClone(run));
    assert.equal(JSON.stringify(run.issued), before);
  }
});

test("source numeric baselines independently match the public examples", () => {
  const b = fixture();
  const signature = (source: string) =>
    answerSignature(
      b.questions.find((q) => q.id === `question-template-source-${source}`)!,
    );
  assert.equal(signature("2024-a-3"), "0.90");
  assert.equal(signature("2025-a-4"), "0.92");
  assert.equal(signature("2025-a-7"), "80");
  assert.equal(signature("2025-a-14"), "31");
  assert.equal(signature("2023-a-2"), "a，f");
  assert.equal(signature("2023-a-10"), "c");
  assert.equal(signature("2023-a-11"), "3a＝2b");
  assert.equal(signature("2023-a-13"), "E");
  assert.equal(signature("2023-b-2"), "C，B，A，C");
  assert.equal(signature("2023-b-3"), "2 1 3 5 4");
  assert.equal(signature("2023-b-4"), "{-1, 18, -1, 3, 11}");
  assert.equal(signature("2024-b-4"), "1");
  assert.equal(signature("2025-b-4"), "8");
  assert.deepEqual(expectedCounts([82, 6, 58, 8]), [80, 6]);
});

test("project network, scatter and logic are checked by independent calculations", () => {
  const edges = [
    [0, 1, 0],
    [1, 2, 1],
    [2, 3, 2],
    [3, 4, 3],
    [1, 6, 4],
    [1, 3, 5],
    [2, 7, 6],
    [2, 4, 7],
    [4, 5, 8],
    [6, 2, -1],
    [7, 3, -1],
  ];
  const paths = (v: number[], node = 0): number[] =>
    node === 5
      ? [0]
      : edges
          .filter(([from]) => from === node)
          .flatMap(([, to, index]) =>
            paths(v, to).map((n) => n + (index < 0 ? 0 : v[index])),
          );
  for (let seed = 0; seed < 100; seed++) {
    const v = Array.from(
      { length: 9 },
      (_, i) => 1 + ((seed * 7 + i * 13) % 20),
    );
    assert.equal(projectDuration(v), Math.max(...paths(v)));
  }
  for (let mask = 0; mask < 16; mask++)
    for (const a of [0, 1])
      for (const b of [0, 1]) {
        const invert = (value: boolean, bit: number) =>
          mask & (1 << bit) ? !value : value;
        const first = invert(Boolean(a), 0),
          second = invert(Boolean(b), 1),
          third = invert(first && second, 2),
          expected = invert(third, 3);
        assert.equal(circuitValue(mask, a, b), Number(expected));
      }
  assert.deepEqual(
    [0, 0, 1, 1].map((a, i) => circuitValue(15, a, [0, 1, 0, 1][i])),
    [1, 0, 0, 0],
  );
  for (let kind = 0; kind < 3; kind++)
    for (let noise = 0; noise < 3; noise++) {
      const points = scatterPoints(kind, noise),
        xm = points.reduce((n, p) => n + p[0], 0) / points.length,
        ym = points.reduce((n, p) => n + p[1], 0) / points.length,
        cov = points.reduce((n, [x, y]) => n + (x - xm) * (y - ym), 0);
      assert.equal(Math.sign(Math.abs(cov) < 1e-9 ? 0 : cov), [-1, 1, 0][kind]);
    }
});

test("algorithm traces and expected frequencies agree with independent reference procedures", () => {
  const permutations = (a: number[]): number[][] =>
    a.length
      ? a.flatMap((n, i) =>
          permutations(a.filter((_, j) => j !== i)).map((r) => [n, ...r]),
        )
      : [[]];
  for (const input of permutations([1, 2, 3, 4, 5])) {
    const result = partitionFirst(input),
      pivot = input[2];
    let left = 0,
      right = 4,
      expected = [...input];
    while (left < right) {
      while (expected[left] < pivot) left++;
      while (expected[right] > pivot) right--;
      if (left >= right) break;
      const x = expected[left];
      expected[left] = expected[right];
      expected[right] = x;
      left++;
      right--;
    }
    assert.deepEqual(result, expected);
  }
  for (let n = 5; n <= 9; n++)
    for (let off = 1; off <= 4; off++)
      for (let start = 1; start <= 20; start++) {
        const input = [start, start + 5, start + 13],
          expected = Array(n).fill(-1);
        for (const value of input) {
          for (const pos of [value % n, (value + off) % n])
            if (expected[pos] === -1) {
              expected[pos] = value;
              break;
            }
        }
        assert.deepEqual(doubleHash(n, off, input), expected);
      }
  for (const a of [
    [1, 2],
    [2, 3],
    [3, 4],
  ])
    for (const b of [
      [1, 4],
      [2, 4],
      [3, 5],
    ]) {
      const combined = [
        ...a.map((n) => ({ n, source: 0 })),
        ...b.map((n) => ({ n, source: 1 })),
      ].sort((x, y) => x.n - y.n || x.source - y.source);
      let tail = 0;
      for (const value of combined.slice(
        combined.map((x) => x.source).lastIndexOf(0) + 1,
      ))
        if (value.source === 1) tail++;
      assert.equal(mergeTailCount(a, b), tail);
    }
  assert.equal(matchingPrefixCount("ababcabc", "abc"), 8);
  assert.equal(matchingPrefixCount("aaaaaaaa", "aaa"), 18);
  assert.equal(matchingPrefixCount("abababab", "cab"), 0);
  for (let a = 20; a <= 100; a += 13)
    for (let b = 1; b <= 20; b += 3)
      for (let c = 20; c <= 100; c += 17) {
        const d = 8,
          total = BigInt(a + b + c + d),
          expected = [
            Number(BigInt(a + b) * BigInt(a + c)) / Number(total),
            Number(BigInt(c + d) * BigInt(b + d)) / Number(total),
          ];
        assert.deepEqual(expectedCounts([a, b, c, d]), expected);
      }
});
