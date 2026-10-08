import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures";
import {
  type Template,
  type Question,
  type Selection,
} from "../src/core/types";
import {
  parametersForSeed,
  bindQuestion,
  answerSignature,
  answerCanVary,
  generationContracts,
  checkParameters,
  contractFor,
} from "../src/core/generation";
import { schema, validateBundle } from "../src/core/validation";
import { prepareRun, startRun, validateRun } from "../src/core/session";
import { contentHash } from "../src/core/hash";
import { validateSourceFormat } from "../src/core/generation-formats";

const baseFor = (t: Template, b = fixture()) =>
  b.questions.find((q) => q.id === t.baseQuestionRef.questionId)!;
function longestPath(v: number[]) {
  const graph = [
    [[1, v[0]]],
    [
      [2, v[1]],
      [3, v[2]],
      [4, v[3]],
    ],
    [
      [3, 0],
      [5, v[4]],
    ],
    [
      [4, 0],
      [5, v[5]],
    ],
    [[5, v[6]]],
    [[6, v[7]]],
    [],
  ];
  const paths = (node: number, distance: number): number[] =>
    node === 6
      ? [distance]
      : graph[node].flatMap(([next, time]) => paths(next, distance + time));
  return Math.max(...paths(0, 0));
}
function oracle(id: string, v: number[]): string {
  switch (id) {
    case "hex-fraction":
      return String(v[0] / 16 ** v[1]);
    case "logic-table":
      return ["0001", "0111", "0110", "1110", "1000", "1001", "1101"][v[0] - 1];
    case "hash-collision":
      return `${String.fromCharCode(v[1])} と ${String.fromCharCode(v[2])}`;
    case "availability":
      return `${Math.round((100 * v[0] * (100 + v[2])) / (v[0] * (100 + v[2]) + v[1] * (100 - v[3])))}％`;
    case "critical-path":
      return `${longestPath(v)}日`;
    case "service-gain": {
      const [h, b, m] = v.map(BigInt),
        before = ((h - b) * 10000n) / h,
        after = ((h * 60n - m) * 10000n) / (h * 60n);
      return `${(Number(after - before) / 100).toFixed(2)}ポイント`;
    }
    case "cafe-profit":
      return `${Number((BigInt(v[2] + v[3]) * 100n) / (BigInt(v[0] - v[1]) * BigInt(v[4]) * BigInt(v[5]))) / 100}人`;
    case "retention": {
      let max = 0;
      for (let i = 1; i < 4; i++)
        if (v[i * 3 + 2] * v[max * 3] > v[max * 3 + 2] * v[i * 3]) max = i;
      return `サービス${"ABCD"[max]}`;
    }
    case "count-multiples":
      return `${v[2] - 1}:${v[2]}`;
    case "coin-change": {
      return `rest ≧ ${v[1]}`;
    }
    case "complement": {
      return `x XOR ${"1".repeat(v[1])}`;
    }
    case "recurrence": {
      return `${v[1]} × data[1] + data[2]`;
    }
    case "security-log":
      return (
        [...(v[0] < 2 ? ["(二)"] : []), ...(v[1] === 1 ? ["(四)"] : [])].join(
          "、",
        ) || "該当なし"
      );
  }
  throw Error(`No independent oracle ${id}`);
}
function answerValue(q: Question, id: string) {
  const b = q.choices.find((c) => c.id === q.correctAnswer.choiceId)!.content
    .blocks[0];
  if (id === "logic-table") {
    assert.equal(b.type, "table");
    return b.type === "table" ? b.rows.map((r) => r[2]).join("") : "";
  }
  if (id === "count-multiples") {
    assert.equal(b.type, "table");
    if (b.type !== "table") return "";
    return `${/から(\d+)まで/.exec(b.rows[0][0])![1]}:${/範囲で(\d+)ずつ/.exec(b.rows[0][1])![1]}`;
  }
  return answerSignature(q);
}
for (const c of generationContracts)
  test(`${c.id}: image-derived baseline and 64 seeded inputs match independent solution`, async () => {
    const b = fixture(),
      t = b.templates.find((t) => t.generatorRef.id === `generator-${c.id}`)!,
      base = baseFor(t, b),
      before = JSON.stringify(base);
    assert.equal(await contentHash(base), t.originalContentSha256);
    assert.equal(
      base.origin.derivedFrom[0].questionId,
      `question-ipa-${c.source}`,
    );
    assert.equal(answerValue(base, c.id), oracle(c.id, c.reference));
    for (let i = 0; i < 64; i++) {
      const seed = i.toString(16).padStart(32, "0"),
        parameters = await parametersForSeed(seed, t);
      assert.deepEqual(parameters, await parametersForSeed(seed, t));
      checkParameters(t, parameters.values);
      const q = bindQuestion(
        base,
        t,
        parameters.values,
        "instance-test",
        "2026-10-06T13:00:00Z",
      );
      schema("question", q);
      assert.equal(answerValue(q, c.id), oracle(c.id, parameters.values));
      validateSourceFormat(q, t);
      assert.equal(
        new Set(q.choices.map((c) => JSON.stringify(c.content.blocks))).size,
        q.choices.length,
      );
      assert(q.origin.isModified);
      assert.equal(q.origin.kind, "official_adaptation");
      assert.deepEqual(q.assetRefs, []);
      assert(!q.prompt.blocks.some((b) => b.type === "image"));
      assert.deepEqual(q.origin.derivedFrom, [t.baseQuestionRef]);
      if (c.id === "critical-path") {
        const diagram = q.prompt.blocks.find((b) => b.type === "diagram")!;
        assert(diagram.type === "diagram" && diagram.scene.kind === "graph");
        assert.equal(diagram.scene.edges.length, 10);
        assert.deepEqual(
          diagram.scene.edges.slice(0, 8).map((e) => e.label),
          parameters.values.map((n, i) => `${"ABCDEFGH"[i]} ${n}日`),
        );
      }
    }
    assert.equal(JSON.stringify(base), before);
  });

test("full mix generates every slot; originals, values, displayed answer IDs and resume remain consistent", async () => {
  const b = fixture();
  await validateBundle(b);
  for (const subject of ["A", "B"] as const) {
    const s: Selection = {
      subject,
      kind: "mix",
      year: 2026,
      mode: "practice",
      size: "full",
      bindingMode: "original_data",
    };
    const raw = JSON.stringify(b),
      previous = await prepareRun(b, s, {}),
      next = await prepareRun(
        b,
        s,
        {},
        Date.now() + 1000,
        undefined,
        undefined,
        previous.instances,
      );
    assert.equal(JSON.stringify(b), raw);
    for (const run of [previous, next]) {
      assert.equal(run.session.bindingMode, "generated_values");
      assert.equal(run.instances.length, subject === "A" ? 60 : 20);
      assert(
        run.session.entries.every(
          (e) => e.issuedContent.bindingPerformed && e.issuedContent.isModified,
        ),
      );
      const signatures = run.instances.map(
        (i) => `${i.templateRef.id}:${JSON.stringify(i.parameters.values)}`,
      );
      assert.equal(new Set(signatures).size, signatures.length);
      for (const [index, instance] of run.instances.entries()) {
        const t = b.templates.find((t) => t.id === instance.templateRef.id)!;
        assert.notDeepEqual(instance.parameters, t.referenceParameters);
        if (answerCanVary(t))
          assert.notEqual(
            answerSignature(instance.question),
            answerSignature(baseFor(t, b)),
          );
        assert.deepEqual(
          run.session.entries[index].choiceOrder.slice().sort(),
          instance.question.choices.map((c) => c.id).sort(),
        );
        const independently = bindQuestion(
          baseFor(t, b),
          t,
          (await parametersForSeed(instance.seed, t)).values,
          instance.id,
          instance.createdAt,
        );
        assert.equal(await contentHash(independently), instance.contentSha256);
      }
      const started = startRun(run),
        resumed = structuredClone(started);
      await validateRun(resumed);
      assert.deepEqual(resumed.issued, started.issued);
    }
    const before = new Set(
      previous.instances.map(
        (i) => `${i.templateRef.id}:${JSON.stringify(i.parameters.values)}`,
      ),
    );
    assert(
      next.instances.every(
        (i) =>
          !before.has(
            `${i.templateRef.id}:${JSON.stringify(i.parameters.values)}`,
          ),
      ),
    );
    const last = new Map<string, string>();
    for (const i of previous.instances)
      last.set(i.templateRef.id, answerSignature(i.question));
    for (const i of next.instances) {
      const t = b.templates.find((t) => t.id === i.templateRef.id)!;
      if (answerCanVary(t))
        assert.notEqual(
          answerSignature(i.question),
          last.get(i.templateRef.id),
        );
      last.set(i.templateRef.id, answerSignature(i.question));
    }
  }
});

test("image-derived arrow graph includes dummy dependencies and the original 120-day result", () => {
  const b = fixture(),
    t = b.templates.find((t) => t.id === "template-critical-path")!,
    q = baseFor(t, b);
  assert.equal(answerSignature(q), "120日");
  const graph = q.prompt.blocks.find((b) => b.type === "diagram")!;
  assert(graph.type === "diagram" && graph.scene.kind === "graph");
  assert.deepEqual(
    graph.scene.edges.slice(8).map((e) => [e.from, e.to, e.label]),
    [
      ["node-2", "node-3", "ダミー 0日"],
      ["node-3", "node-4", "ダミー 0日"],
    ],
  );
  assert.equal(longestPath([30, 5, 30, 20, 40, 25, 30, 30]), 120);
});

test("generator registry rejects mismatched domains, inconsistent inputs and duplicate persisted instances", async () => {
  const b = fixture(),
    t = b.templates.find((t) => t.id === "template-cafe-profit")!;
  assert.throws(() => checkParameters(t, [100, 200, 300000, 100000, 20, 10]));
  const changed = structuredClone(b);
  changed.templates[0].parameterDomain.fields![0].maximum++;
  await assert.rejects(validateBundle(changed));
  const reordered = structuredClone(b);
  reordered.templates[0].parameterDomain.fields =
    reordered.templates[0].parameterDomain.fields!.map(
      ({ name, minimum, maximum }) => ({ maximum, minimum, name }),
    );
  await validateBundle(reordered);
  const run = await prepareRun(
    b,
    {
      subject: "A",
      kind: "mix",
      year: 2026,
      mode: "study",
      size: "public",
      bindingMode: "generated_values",
    },
    {},
  );
  const repeated = run.instances[0];
  const replacement = structuredClone(repeated);
  replacement.id = "instance-repeated-check";
  replacement.entryIndex = 1;
  run.instances[1] = replacement;
  run.issued[1] = structuredClone(run.issued[0]);
  run.session.entries[1] = structuredClone(run.session.entries[0]);
  run.session.entries[1].generatedInstanceId = replacement.id;

  await assert.rejects(validateRun(run), /重複/);
});

test("prose remains prose, source tables and diagrams remain present, and added aids are rejected", async () => {
  const b = fixture();
  for (const id of ["availability", "hex-fraction", "hash-collision"]) {
    const t = b.templates.find((t) => t.id === `template-${id}`)!;
    const q = baseFor(t, b);
    assert.deepEqual(
      q.prompt.blocks.map((b) => b.type),
      ["paragraph"],
    );
    const bad = structuredClone(q);
    bad.prompt.blocks.push({
      type: "table",
      caption: "added aid",
      columns: ["value"],
      rows: [["1"]],
    });
    assert.throws(() => validateSourceFormat(bad, t), /出題形式/);
  }
  const source = b.questions.find((q) => q.id === "question-ipa-2024-a-4")!;
  const t = b.templates.find((t) => t.id === "template-availability")!;
  const q = bindQuestion(
    baseFor(t, b),
    t,
    [5480, 926, 1, 35],
    "format-test",
    "2026-10-06T14:00:00Z",
  );
  assert(
    q.prompt.blocks[0].type === "paragraph" &&
      q.prompt.blocks[0].text.includes("5,480時間"),
  );
  assert.equal(answerSignature(q), "90％");
  assert(source.prompt.blocks.some((b) => b.type === "image"));
  const securityTemplate = b.templates.find(
    (t) => t.id === "template-security-log",
  )!;
  const security = baseFor(securityTemplate, b);
  const missingFrame = structuredClone(security);
  delete missingFrame.contexts[1].presentation;
  assert.throws(
    () => validateSourceFormat(missingFrame, securityTemplate),
    /文章図/,
  );
  for (const presentation of [null, "html"])
    assert.throws(
      () =>
        schema("question", {
          ...security,
          contexts: security.contexts.map((c) => ({ ...c, presentation })),
        }),
      { code: "SCHEMA" },
    );
  await validateBundle(b);
});

test("blank answers preserve equivalent algorithms across every divisor, offset, word width and coefficient", () => {
  const b = fixture();
  const issue = (id: string, values: number[]) => {
    const t = b.templates.find((t) => t.id === `template-${id}`)!;
    return bindQuestion(
      baseFor(t, b),
      t,
      values,
      "algorithm-test",
      "2026-10-06T14:00:00Z",
    );
  };
  for (let divisor = 2; divisor <= 12; divisor++) {
    const q = issue("count-multiples", [1, 30, divisor]);
    const equivalent = q.choices.map((c) => {
      const block = c.content.blocks[0];
      assert(block.type === "table");
      const [a, b] = block.rows[0];
      const iterations = Number(/から(\d+)まで/.exec(a)![1]);
      for (let n = 1; n <= 2 * divisor; n++)
        for (let m = n + 10; m <= n + 10 + 2 * divisor; m++) {
          let temp = n;
          for (let i = 0; i < iterations; i++) {
            if (temp % divisor === 0) break;
            temp++;
          }
          const start = b.startsWith("jをnから") ? n : temp;
          const step = b.includes("tempNずつ")
            ? temp
            : b.includes("範囲で")
              ? Number(/範囲で(\d+)ずつ/.exec(b)![1])
              : 1;
          let actual = 0;
          for (let j = start; j <= m; j += step) actual++;
          const expected = Array.from(
            { length: m - n + 1 },
            (_, i) => n + i,
          ).filter((x) => x % divisor === 0).length;
          if (actual !== expected) return false;
        }
      return true;
    });
    assert.deepEqual(equivalent, [true, false, false, false, false, false]);
  }
  for (let offset = 0; offset <= 20; offset++) {
    const q = issue("coin-change", [12, offset]);
    const equivalent = q.choices.map((c) => {
      const text = answerText(c.content.blocks[0]);
      const threshold = Number(/(\d+)$/.exec(text)![1]);
      for (let n = 11; n <= 200; n++) {
        let actual = 0;
        for (
          let rest = n + offset;
          text.includes("≧") ? rest >= threshold : rest > threshold;
          rest -= 10
        )
          actual += Math.floor((rest - offset) / 5) + 1;
        let expected = 0;
        for (let tens = 0; tens * 10 <= n; tens++)
          for (let fives = 0; tens * 10 + fives * 5 <= n; fives++) expected++;
        if (actual !== expected) return false;
      }
      return true;
    });
    assert.deepEqual(equivalent, [true, false, false, false, false, false]);
  }
  for (let width = 4; width <= 8; width++) {
    const q = issue("complement", [3, width]);
    const equivalent = q.choices.map((c) => {
      const [, op, maskText] = /^x (AND|OR|XOR) ([01]+)$/.exec(
        answerText(c.content.blocks[0]),
      )!;
      const mask = parseInt(maskText, 2);
      for (let x = 0; x < 2 ** width; x++) {
        const inverted =
          op === "AND" ? x & mask : op === "OR" ? x | mask : x ^ mask;
        if ((x + inverted + 1) % 2 ** width !== 0) return false;
      }
      return true;
    });
    assert.deepEqual(equivalent, [true, false, false, false, false, false]);
  }
  for (let coefficient = 2; coefficient <= 4; coefficient++) {
    const q = issue("recurrence", [5, coefficient]);
    const equivalent = q.choices.map((c) => {
      const text = answerText(c.content.blocks[0]);
      const recursive = (n: number): number =>
        n <= 2 ? 1 : coefficient * recursive(n - 2) + recursive(n - 1);
      for (let n = 1; n <= 14; n++) {
        const data = [1, 1, 1];
        for (let i = 3; i <= n; i++) {
          data[0] = data[1];
          data[1] = data[2];
          const values = text.split(" + ").map((term) => {
            const match = /^(?:(\d+) × )?data\[(1|2|3|i - 1|i - 2)\]$/.exec(
              term,
            )!;
            const index =
              match[2] === "i - 1"
                ? i - 1
                : match[2] === "i - 2"
                  ? i - 2
                  : Number(match[2]);
            return Number(match[1] ?? 1) * data[index - 1];
          });
          data[2] = values.reduce((a, b) => a + b, 0);
        }
        if (data[2] !== recursive(n)) return false;
      }
      return true;
    });
    assert.deepEqual(equivalent, [
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
  }
});
function answerText(block: Question["prompt"]["blocks"][number]) {
  assert("text" in block);
  return block.text;
}

test("version 1 saved runs retain their older tables and numeric questions after version 2 is added", async () => {
  const b = fixture();
  b.templates = b.templates.filter((t) =>
    ["2.1.0", "2.2.0"].includes(t.generatorRef.version),
  );
  b.catalog.generationCoverage = "partial";
  b.sets = b.sets.map((s) => ({
    ...s,
    questionRefs: s.questionRefs.filter(
      (r) => !r.questionId.includes("template-source-"),
    ),
    generationBindings: s.generationBindings.filter(
      (g) => !g.templateRef.id.includes("source-"),
    ),
  }));
  for (const t of b.templates) {
    t.generatorRef.version = "1.0.0";
    const c = contractFor(t)!;
    t.parameterDomain.fields = structuredClone(c.fields);
    t.parameterDomain.values = {
      length: c.fields.length,
      minimum: Math.min(...c.fields.map((f) => f.minimum)),
      maximum: Math.max(...c.fields.map((f) => f.maximum)),
    };
    t.referenceParameters = { values: c.reference.slice() };
    const original = b.questions.find(
      (q) => q.id === `question-ipa-${c.source}`,
    )!;
    const sourceTemplate = {
      ...t,
      baseQuestionRef: { questionId: original.id, revision: original.revision },
    };
    const old = bindQuestion(
      original,
      sourceTemplate,
      c.reference,
      `template-${c.id}`,
      "2026-10-06T13:00:00Z",
    );
    old.revision = t.baseQuestionRef.revision;
    b.questions[b.questions.findIndex((q) => q.id === old.id)] = old;
    t.originalContentSha256 = await contentHash(old);
  }
  await validateBundle(b);
  const t = b.templates.find((t) => t.id === "template-availability")!;
  assert.deepEqual(
    baseFor(t, b).prompt.blocks.map((b) => b.type),
    ["paragraph", "table"],
  );
  const run = startRun(
    await prepareRun(
      b,
      {
        subject: "B",
        kind: "mix",
        year: 2026,
        mode: "study",
        size: "public",
        bindingMode: "generated_values",
      },
      {},
    ),
  );
  const resumed = structuredClone(run);
  await validateRun(resumed);
  assert.deepEqual(resumed.issued, run.issued);
  assert(resumed.instances.every((i) => i.generatorRef.version === "1.0.0"));
});
