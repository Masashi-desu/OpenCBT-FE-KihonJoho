import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture } from "./fixtures";
import { calculationReviews } from "./fixtures/calculation-options";
import {
  bindQuestion,
  checkParameters,
  parametersForSeed,
  contractFor,
  answerSignature,
} from "../src/core/generation";
import { contentHash } from "../src/core/hash";
import {
  prepareRun,
  startRun,
  validateRun,
  appendRunQuestion,
  updateAnswer,
  finishRun,
} from "../src/core/session";
import { Content } from "../src/ui/Content";
import { refOf, type Question, type Block } from "../src/core/types";

const bundle = fixture();
const text = (block: Block) =>
  "text" in block
    ? block.text
    : block.type === "table"
      ? block.rows[0].join(":")
      : "";
const options = (q: Question) =>
  q.choices.map((c) =>
    c.content.blocks
      .map(text)
      .join("\n")
      .split(":")
      .map((s) => Number.parseFloat(s)),
  );
const template = (source: string) =>
  bundle.templates.find((t) => {
    const base = bundle.questions.find(
      (q) => q.id === t.baseQuestionRef.questionId,
    )!;
    return base.origin.derivedFrom[0].questionId === `question-ipa-${source}`;
  })!;
const base = (source: string) =>
  bundle.questions.find(
    (q) => q.id === template(source).baseQuestionRef.questionId,
  )!;
const generate = (source: string, values: number[]) =>
  bindQuestion(
    base(source),
    template(source),
    values,
    "instance-calculation",
    "2026-10-08T00:00:00Z",
  );
const tableRows = (q: Question) =>
  q.prompt.blocks.filter(
    (b): b is Extract<Block, { type: "table" }> => b.type === "table",
  );
const cleanText = (q: Question) =>
  q.prompt.blocks.map(text).join("\n").replaceAll(",", "");

// BigInt arithmetic and graph path enumeration do not call the generators'
// calculators, correctIndex or explanation to compute expected answers.
function reference(source: string, v: number[], q: Question): number[] {
  const n = v.map(BigInt);
  switch (source) {
    case "2023-a-1":
      return [Number((n[0] * 1000n) / 16n ** n[1]) / 1000];
    case "2024-a-3": {
      const rows = tableRows(q)[0].rows.map((r) => r.slice(1).map(Number));
      assert.deepEqual(rows, [
        [v[2] + (100 - v[0]) * v[1], v[2]],
        [v[3], v[3] + v[0] * v[1]],
      ]);
      // Equal average access times: solve the linear equation from the table.
      const memoryDifference = rows[1][1] - rows[1][0];
      return [memoryDifference / (memoryDifference + rows[0][0] - rows[0][1])];
    }
    case "2024-a-4": {
      const available = n[0] * (100n + n[2]),
        repair = n[1] * (100n - n[3]);
      return [
        Number(
          (available * 200n + available + repair) / (2n * (available + repair)),
        ),
      ];
    }
    case "2024-a-13":
    case "2025-a-14": {
      const edges =
        source === "2024-a-13"
          ? [
              [0, 1, v[0]],
              [1, 2, v[1]],
              [1, 3, v[2]],
              [1, 4, v[3]],
              [2, 5, v[4]],
              [3, 5, v[5]],
              [4, 5, v[6]],
              [5, 6, v[7]],
              [2, 3, 0],
              [3, 4, 0],
            ]
          : [
              [0, 1, v[0]],
              [1, 2, v[1]],
              [2, 3, v[2]],
              [3, 4, v[3]],
              [1, 6, v[4]],
              [1, 3, v[5]],
              [2, 7, v[6]],
              [2, 4, v[7]],
              [4, 5, v[8]],
              [6, 2, 0],
              [7, 3, 0],
            ];
      const end = source === "2024-a-13" ? 6 : 5;
      const paths = (node: number, days: number): number[] =>
        node === end
          ? [days]
          : edges
              .filter(([from]) => from === node)
              .flatMap(([, to, duration]) => paths(to, days + duration));
      return [Math.max(...paths(0, 0))];
    }
    case "2025-a-4": {
      const repair = n[1] - n[2] * n[3],
        total = n[0] + n[1];
      assert.equal((repair * 100n) % total, 0n, "source-sized exact rate");
      return [1 - Number((repair * 100n) / total) / 100];
    }
    case "2025-a-7": {
      const bits = n[0] * 8000n * (100n + n[3]),
        capacity = n[1] * n[2] * 60n;
      return [Number((2n * bits + capacity) / (2n * capacity))];
    }
    case "2025-a-19": {
      const rows = tableRows(q)[0].rows.map((r) =>
        Number.parseInt(r[1].replaceAll(",", "")),
      );
      assert.deepEqual(rows, [v[0], v[1], v[2], v[4], v[5]]);
      assert.match(cleanText(q), new RegExp(`月${v[3]}円の利益`));
      const denominator = (n[0] - n[1]) * n[4] * n[5];
      assert.equal(((n[2] + n[3]) * 4n) % denominator, 0n);
      const quarters = ((n[2] + n[3]) * 4n) / denominator;
      // Substitute every choice into the profit equality, independently of
      // the generator's division/rounding and correct answer metadata.
      const winners = options(q).filter(([option]) => {
        const candidate = BigInt(Math.round(option * 100));
        return candidate * denominator === (n[2] + n[3]) * 100n;
      });
      assert.deepEqual(winners, [[Number(quarters) / 4]]);
      assert(!/切り上げ|以上|小数第/.test(cleanText(q)));
      return [Number(quarters) / 4];
    }
    case "2026-a-14": {
      const before = ((n[0] - n[1]) * 10000n) / n[0],
        after = ((n[0] * 60n - n[2]) * 10000n) / (n[0] * 60n);
      return [Number(after - before) / 100];
    }
    case "2025-b-4": {
      const program = q.prompt.blocks.map(text).join("\n");
      const data = /search\(\{([^}]+)\}, \{([^}]+)\}\)/.exec(program)!;
      const characters = (s: string) =>
        [...s.matchAll(/"([abc])"/g)].map((m) => m[1]);
      const haystack = characters(data[1]),
        key = characters(data[2]);
      let count = 0;
      for (let start = 0; start + key.length <= haystack.length; start++) {
        for (let i = 0; i < key.length && haystack[start + i] === key[i]; i++)
          count++;
      }
      return [count];
    }
    case "2025-b-5": {
      const rows = tableRows(q)[0].rows.map((r) => r.slice(1).map(Number));
      assert.deepEqual(rows.flat(), v);
      const total = n.reduce((a, b) => a + b, 0n),
        x = (n[0] + n[1]) * (n[0] + n[2]),
        y = (n[2] + n[3]) * (n[1] + n[3]);
      assert.equal(x % total, 0n);
      assert.equal(y % total, 0n);
      assert(!/四捨五入|切り上げ/.test(cleanText(q)));
      return [Number(x / total), Number(y / total)];
    }
    default:
      throw Error(`Missing independent calculation review: ${source}`);
  }
}
function verify(source: string, v: number[], q = generate(source, v)) {
  const review = calculationReviews.find((r) => r.source === source)!;
  const expected = reference(source, v, q).map((n) => Number(n.toFixed(8)));
  const cs = options(q);
  const winners = q.choices.filter(
    (_, i) => JSON.stringify(cs[i]) === JSON.stringify(expected),
  );
  assert.equal(winners.length, 1, `${source} ${v}`);
  assert.equal(winners[0].id, q.correctAnswer.choiceId);
  assert.equal(cs.length, review.options.length);
  assert.equal(new Set(cs.map((c) => c.join(":"))).size, cs.length);
  for (const [i, row] of cs.entries()) {
    assert(
      row.every(
        (n) =>
          Number.isFinite(n) &&
          n >= 0 &&
          (!review.maximum || n <= review.maximum),
      ),
    );
    assert(
      q.choices[i].content.blocks.every((b) => !/\d+\.\d{4,}/.test(text(b))),
    );
    assert(
      row.every(
        (n) =>
          Math.abs(
            n * 10 ** review.digits - Math.round(n * 10 ** review.digits),
          ) < 1e-7,
      ),
    );
    if (JSON.stringify(row) === JSON.stringify(expected)) continue;
    if (source === "2025-b-5") {
      assert(
        Math.max(
          ...row.map((n, j) => Math.abs(n - expected[j]) / expected[j]),
        ) +
          1e-8 >=
          0.0125,
      );
    } else if (source !== "2025-b-4") {
      const nearest = Math.min(
        ...review.options
          .filter(([n]) => n !== review.correct[0])
          .map(([n]) => Math.abs(n - review.correct[0])),
      );
      assert(
        Math.abs(row[0] - expected[0]) + 1e-8 >=
          ((nearest / review.correct[0]) * expected[0]) / 2,
      );
    }
  }
  const explanation = q.explanation!.blocks.map(text).join("\n");
  assert(
    expected.every(
      (n) =>
        explanation.includes(String(n)) ||
        explanation.includes(n.toFixed(review.digits)),
    ),
    source,
  );
  return q;
}

for (const review of calculationReviews)
  test(`${review.source}: source options, display precision and 256 seeds retain the reviewed calculation level`, async () => {
    const t = template(review.source),
      baseline = base(review.source);
    assert(["2.2.0", "3.3.0"].includes(t.generatorRef.version));
    verify(review.source, t.referenceParameters.values, baseline);
    assert.deepEqual(
      options(baseline)
        .map((c) => c.join(":"))
        .sort(),
      review.options.map((c) => c.join(":")).sort(),
    );
    const origin = baseline.origin.sourceRefs[0];
    assert.equal(origin.locator.page, review.page);
    for (let seed = 0; seed < 256; seed++) {
      const s = seed.toString(16).padStart(32, "0");
      const values = (await parametersForSeed(s, t)).values;
      assert.deepEqual((await parametersForSeed(s, t)).values, values);
      if (review.source === "2025-a-19") assert.equal(values[2] % 2500, 0);
      const q = verify(review.source, values);
      if (seed < 4) {
        for (const content of [q.prompt, ...q.choices.map((c) => c.content)]) {
          const html = renderToStaticMarkup(
            createElement(Content, {
              content,
              bundle,
              assetUrls: {},
              credit: false,
            }),
          );
          assert(!/NaN|Infinity|undefined/.test(html));
        }
      }
    }
  });

test("exact cafe calculations cover every candidate in the finite clean-input sampler", (ctx) => {
  let count = 0;
  for (const price of [400, 500, 600, 800, 1000])
    for (const cost of [100, 200])
      for (const days of [15, 20, 25])
        for (const seats of [10, 15, 20])
          for (let quarters = 8; quarters <= 32; quarters++)
            for (let profit = 50000; profit <= 200000; profit += 25000) {
              const v = [
                price,
                cost,
                ((price - cost) * days * seats * quarters) / 4 - profit,
                profit,
                days,
                seats,
              ];
              if (v[2] < 50000 || v[2] > 500000 || v[2] % 2500 !== 0) continue;
              verify("2025-a-19", v);
              count++;
            }
  assert.equal(count, 6002);
  ctx.diagnostic(
    `${count} accepted clean cafe inputs checked by profit substitution.`,
  );
});

test("annual availability and theoretical counts cover the sampler's finite combinations", (ctx) => {
  let rates = 0,
    tables = 0;
  for (let bf = 1000; bf <= 8000; bf += 500)
    for (let tr = 500; tr <= 2000; tr += 500)
      for (let delta = 50; delta <= 150; delta += 50)
        for (let years = 1; years <= 6; years++) {
          const v = [bf, tr, delta, years];
          if (
            tr <= delta * years ||
            ((bf + delta * years) * 100) % (bf + tr) !== 0
          )
            continue;
          verify("2025-a-4", v);
          rates++;
        }
  for (const r1 of [4, 6, 8, 10])
    for (const r2 of [4, 6, 8, 10])
      for (const c1 of [6, 8, 10])
        for (const c2 of [1, 2])
          for (let delta = -4; delta <= 4; delta++) {
            const v = [
              r1 * c1 + delta,
              r1 * c2 - delta,
              r2 * c1 - delta,
              r2 * c2 + delta,
            ];
            if (
              delta === 0 ||
              v[0] < 20 ||
              v[0] > 100 ||
              v[2] < 20 ||
              v[2] > 100 ||
              v[1] < 1 ||
              v[1] > 20 ||
              v[3] < 1 ||
              v[3] > 20
            )
              continue;
            verify("2025-b-5", v);
            tables++;
          }
  assert.equal(rates, 291);
  assert.equal(tables, 592);
  ctx.diagnostic(
    `${rates} exact availability inputs and ${tables} exact contingency tables checked.`,
  );
});

test("precision regressions reject the screenshot's cent-person arithmetic and non-exact theoretical counts", () => {
  assert.throws(
    () =>
      checkParameters(
        template("2025-a-19"),
        [1471, 402, 478596, 252540, 17, 7],
      ),
    { code: "PARAMETER_CONSTRAINT" },
  );
  assert.throws(
    () => checkParameters(template("2025-a-4"), [4001, 1000, 100, 6]),
    { code: "PARAMETER_CONSTRAINT" },
  );
  assert.throws(() => checkParameters(template("2025-b-5"), [82, 6, 58, 9]), {
    code: "PARAMETER_CONSTRAINT",
  });
  assert.throws(() => checkParameters(template("2023-a-1"), [12, 2]), {
    code: "PARAMETER_DOMAIN",
  });
});

test("source spacing survives bounded rates, rounding ties and shortest graph inputs", () => {
  for (const v of [
    [100, 2000, 0, 1],
    [6000, 100, 40, 40],
    [900, 1100, 0, 10],
  ])
    verify("2024-a-4", v);
  for (const v of [Array(8).fill(5), Array(8).fill(60)]) verify("2024-a-13", v);
  for (const v of [Array(9).fill(1), Array(9).fill(20)]) verify("2025-a-14", v);
  for (const v of [
    [5000, 10, 570],
    [10000, 10, 1],
    [500, 200, 1],
  ])
    verify("2026-a-14", v);
  assert.throws(() => checkParameters(template("2026-a-14"), [5000, 10, 599]), {
    code: "PARAMETER_CONSTRAINT",
  });
  for (const v of [
    [1, 40, 5, 0],
    [1, 80, 5, 25],
  ])
    verify("2025-a-7", v);
  for (const v of [
    [96, 5, 30, 600],
    [70, 1, 5, 100],
  ])
    verify("2024-a-3", v);
});

test("retention keeps its service choices and generates clean member counts with distinct rates", async () => {
  const source = "2026-a-17",
    t = template(source);
  assert.equal(t.generatorRef.version, "2.2.0");
  for (let seed = 0; seed < 256; seed++) {
    const v = (await parametersForSeed(seed.toString(16).padStart(32, "0"), t))
      .values;
    const q = generate(source, v),
      rows = tableRows(q)[0].rows;
    let best = 0;
    for (let i = 0; i < 4; i++) {
      const [previous, joined, retained] = v.slice(i * 3, i * 3 + 3);
      assert.equal(previous % 500, 0);
      assert.equal(joined % 100, 0);
      assert.equal((retained * 100) % (previous * 10), 0);
      assert.deepEqual(rows[i], [
        "ABCD"[i],
        String(previous),
        String(joined),
        String(joined + retained),
      ]);
      if (retained * v[best * 3] > v[best * 3 + 2] * previous) best = i;
    }
    const cs = q.choices.map((c) => c.content.blocks.map(text).join(""));
    assert.deepEqual(cs.slice().sort(), [
      "サービスA",
      "サービスB",
      "サービスC",
      "サービスD",
    ]);
    assert.equal(
      cs[q.choices.findIndex((c) => c.id === q.correctAnswer.choiceId)],
      `サービス${"ABCD"[best]}`,
    );
  }
});

test("published calculation versions preserve stored content, answers and continuation", async () => {
  const previous = fixture();
  for (const source of [
    ...calculationReviews.map((r) => r.source),
    "2026-a-17",
  ]) {
    const t = previous.templates.find((t) => t.id === template(source).id)!;
    t.generatorRef.version = t.generatorRef.id.startsWith("generator-source-")
      ? "3.2.0"
      : "2.1.0";
    const c = contractFor(t)!;
    assert(c);
    t.parameterDomain = {
      values: {
        length: c.fields.length,
        minimum: Math.min(...c.fields.map((f) => f.minimum)),
        maximum: Math.max(...c.fields.map((f) => f.maximum)),
      },
      fields: structuredClone(c.fields),
    };
    const original = previous.questions.find(
      (q) => q.id === `question-ipa-${source}`,
    )!;
    const old = bindQuestion(
      original,
      t,
      c.reference,
      t.baseQuestionRef.questionId.replace("question-", ""),
      "2026-10-07T00:00:00Z",
    );
    old.revision = t.baseQuestionRef.revision;
    previous.questions[previous.questions.findIndex((q) => q.id === old.id)] =
      old;
    t.originalContentSha256 = await contentHash(old);
    if (source === "2025-a-19") {
      const screenshot = bindQuestion(
        old,
        t,
        [1471, 402, 478596, 252540, 17, 7],
        "instance-published",
        "2026-10-07T00:00:00Z",
      );
      assert.equal(answerSignature(screenshot), "5.75人");
      assert.deepEqual(options(screenshot), [[5.75], [5.74], [5.76], [5.78]]);
    }
    if (source === "2025-a-4") {
      const rounded = bindQuestion(
        old,
        t,
        [4001, 1000, 100, 6],
        "instance-published-rate",
        "2026-10-07T00:00:00Z",
      );
      assert.equal(answerSignature(rounded), "0.92");
      assert(cleanText(rounded).includes("小数第5位を四捨五入"));
    }
  }
  for (const subject of ["A", "B"] as const) {
    const saved = startRun(
      await prepareRun(
        previous,
        {
          subject,
          kind: "mix",
          mode: "endless",
          bindingMode: "generated_values",
        },
        {},
        100000,
      ),
      101000,
    );
    const before = JSON.stringify(saved);
    await validateRun(saved);
    assert.equal(JSON.stringify(saved), before);
    let next = saved,
      at = 102000;
    for (const source of [
      ...calculationReviews.map((r) => r.source),
      "2026-a-17",
    ].filter((source) => source.split("-")[1] === subject.toLowerCase()))
      next = await appendRunQuestion(
        next,
        template(source).baseQuestionRef,
        (at += 1000),
      );
    await validateRun(next);
    assert.deepEqual(next.issued.slice(0, saved.issued.length), saved.issued);
  }
});

test("individual hexadecimal bookmark practice outlives its finite pool and preserves every answer", async () => {
  const original = bundle.questions.find(
    (q) => q.id === "question-ipa-2023-a-1",
  )!;
  const selection = {
    subject: "A" as const,
    kind: "bookmark" as const,
    mode: "study" as const,
    bookmarkQuestionRef: refOf(original),
    bindingMode: "generated_values" as const,
  };
  for (const previousPolicy of [false, true]) {
    let run = startRun(await prepareRun(bundle, selection, {}, 100000), 101000);
    assert.equal(run.exam.duplicatePolicy, "random_reuse");
    // Old saved individual runs used uniqueness across the whole session.
    // Keep those questions and answers while migrating only future draws.
    if (previousPolicy) run.exam.duplicatePolicy = "instance_unique";
    run = updateAnswer(run, run.issued[0].correctAnswer.choiceId, 102000);
    const saved = structuredClone(run),
      sessionId = run.session.id;
    const conditions = new Set<string>();
    for (let i = 0; i < 70; i++) {
      if (i) {
        const before = structuredClone(run);
        run = await appendRunQuestion(run, undefined, 103000 + i * 1000);
        assert.deepEqual(run.issued.slice(0, i), before.issued);
        assert.deepEqual(
          run.session.entries.slice(0, i),
          before.session.entries,
        );
        assert.notDeepEqual(
          run.instances[i].parameters,
          before.instances[i - 1].parameters,
        );
        assert.notEqual(
          answerSignature(run.issued[i]),
          answerSignature(before.issued[i - 1]),
        );
        run = updateAnswer(
          run,
          run.issued[i].correctAnswer.choiceId,
          104000 + i * 1000,
        );
      }
      conditions.add(JSON.stringify(run.instances[i].parameters.values));
      assert.equal(run.session.id, sessionId);
    }
    assert(
      conditions.size <= 7,
      "the finite pool is reused without adjacent repeats",
    );
    assert.deepEqual(run.issued[0], saved.issued[0]);
    assert.deepEqual(run.session.entries[0], saved.session.entries[0]);
    const result = finishRun(run, "completed", 200000);
    assert.equal(result.result!.total, 70);
    assert.equal(result.result!.correct, 70);
    await validateRun(result);
  }
});
