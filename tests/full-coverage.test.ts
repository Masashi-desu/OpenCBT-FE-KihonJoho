import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture } from "./fixtures";
import { additionalDefinitions } from "../src/core/generators";
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
    const values = domain.map(([minimum]) => minimum);
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

test("every one of 103 official sources has exactly one generator and is a mix candidate", async () => {
  const b = fixture();
  await validateBundle(b);
  const c = generationCoverage(b);
  assert.equal(c.total, 103);
  assert.equal(c.covered, 103);
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
    assert.equal(prepared.set.questionRefs.length, subject === "A" ? 80 : 23);
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
            validateSourceFigure(block.scene);
            const html = renderToStaticMarkup(createElement(Diagram, block));
            assert(!html.includes("<img"));
            assert(!html.includes("<details"));
            assert(!html.includes("diagram-alt"));
            assert(html.includes("<desc"));
          }
    }
    if (answerCanVary(t))
      assert(
        answers.size >= 2,
        `${d.source} must change answer content, not only option order`,
      );
    else {
      assert.equal(d.source, "2024-a-20");
      assert.equal(answers.size, 1);
      assert(
        new Set(
          Array.from({ length: 8 }, (_, i) =>
            JSON.stringify(d.build([i]).choices),
          ),
        ).size === 8,
      );
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
