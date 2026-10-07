import test from "node:test";
import assert from "node:assert/strict";
import { additionalDefinitions } from "../src/core/generators";
import { parametersForSeed } from "../src/core/generation";
import { fixture } from "./fixtures";
import type { GeneratedBody } from "../src/core/generators/definition";
import type { Block } from "../src/core/types";
import facts from "./fixtures/knowledge-pairs.json";

const text = (b: Block): string =>
  b.type === "paragraph" || b.type === "code"
    ? b.text
    : b.type === "table"
      ? b.rows[0].join("｜")
      : "";
const choices = (b: GeneratedBody) =>
  b.choices.map((c) => c.map(text).join("\n"));
const code = (b: GeneratedBody) =>
  b.prompt
    .filter((x): x is Extract<Block, { type: "code" }> => x.type === "code")
    .map((x) => x.text)
    .join("\n");
const paragraph = (b: GeneratedBody) => b.prompt.map(text).join("\n");
function unique(
  b: GeneratedBody,
  predicate: (choice: string, i: number) => boolean,
) {
  const winners = choices(b).flatMap((c, i) => (predicate(c, i) ? [i] : []));
  assert.deepEqual(winners, [b.correctIndex ?? 0], paragraph(b));
}
const permutation = <T>(v: T[]): T[][] =>
  v.length
    ? v.flatMap((x, i) =>
        permutation(v.filter((_, j) => i !== j)).map((rest) => [x, ...rest]),
      )
    : [[]];
const tables = (b: GeneratedBody) =>
  b.prompt.filter(
    (x): x is Extract<Block, { type: "table" }> => x.type === "table",
  );
const norm = (s: string) => s.replace(/[\s，、]/g, "");
const exprIndex = (s: string, name: string, offset: number) =>
  s === name || norm(s) === norm(`${name}−${offset}`);

// Frozen, reviewed conceptual correspondences are not recalculated from the
// production bank during tests. Their factual quality remains a manual review.
for (const fact of facts)
  test(`${fact.source}: every knowledge target/direction has one correct correspondence`, () => {
    const d = additionalDefinitions.find((d) => d.source === fact.source)!;
    assert.equal(d.fields[0].maximum + 1, fact.pairs.length);
    for (const [target, pair] of fact.pairs.entries())
      for (let direction = 0; direction < 3; direction++) {
        const b = d.build([target, direction]);
        if (direction === 2)
          unique(
            b,
            (choice) =>
              !fact.pairs.some(
                ([name, meaning]) => choice === `${name}：${meaning}`,
              ),
          );
        else {
          const allTerms = choices(b).every((c) =>
            fact.pairs.some(([name]) => name === c),
          );
          const subject = pair[allTerms ? 1 : 0];
          assert(paragraph(b).startsWith(subject), d.source);
          unique(b, (choice) => choice === pair[allTerms ? 0 : 1]);
        }
      }
  });

function semantic(source: string, b: GeneratedBody, v: number[]) {
  const cs = choices(b),
    t = tables(b),
    program = code(b),
    prompt = paragraph(b);
  switch (source) {
    case "2023-a-2": {
      const before = t[0].rows,
        after = t[1].rows,
        order = before.map((r) => r[1]);
      const insertAt = [1, 2, 0, 3][v[0]],
        linked = [order[0], order[2], order[1]];
      linked.splice(insertAt, 0, "社員G");
      const address = new Map(after.map((r) => [r[1], r[0]])),
        changed: string[] = [];
      for (const row of before) {
        const i = linked.indexOf(row[1]),
          current = after.find((r) => r[1] === row[1])!;
        for (const [col, other] of [
          [2, i + 1],
          [3, i - 1],
        ])
          if ((address.get(linked[other]) ?? "0") !== row[col])
            changed.push(current[col]);
      }
      unique(b, (c) => norm(c) === changed.sort().join(""));
      return;
    }
    case "2023-a-6": {
      const list = b.prompt.find((x) => x.type === "list")!;
      assert(list.type === "list");
      const deps = list.items
        .slice(0, 2)
        .map((s) => s.split(/ → |[{}，]/).filter(Boolean));
      unique(b, (c) => {
        const [a, mid, end] = c.split(" → ");
        return (
          deps.some((r) => r[0] === a && r.includes(mid)) &&
          deps.some((r) => r[0] === mid && r.includes(end))
        );
      });
      return;
    }
    case "2023-a-10": {
      assert(prompt.includes("最初に検査"));
      const labels = Array.from(
        { length: 4 },
        (_, i) => "abcd"[(i + v[1]) % 4],
      );
      unique(b, (c) => c === labels[v[0] + 1]);
      return;
    }
    case "2023-a-11": {
      const target = [...prompt.matchAll(/[①②③④⑤⑥]/g)].map(
        (m) => "①②③④⑤⑥".indexOf(m[0]) + 1,
      );
      const trace = (x: number, y: number) => {
        const path = [1, 2];
        while (x !== y) {
          path.push(3, x > y ? 4 : 5, 2);
          if (x > y) x -= y;
          else y -= x;
        }
        return [...path, 6];
      };
      const values = [
        [2, 1],
        [1, 2],
        [3, 2],
        [2, 3],
      ];
      unique(
        b,
        (_, i) =>
          JSON.stringify(trace(...(values[i] as [number, number]))) ===
          JSON.stringify(target),
      );
      return;
    }
    case "2023-a-13": {
      const diagram = b.prompt.find((x) => x.type === "diagram")!;
      assert(
        diagram.type === "diagram" && diagram.scene.kind === "source_figure",
      );
      const days = diagram.scene.values;
      const duration = (d: number[]) =>
        Math.max(
          d[0] + d[1] + d[4] + d[6],
          d[0] + d[2] + d[6],
          d[0] + d[3] + d[5] + d[6],
        );
      const candidates = "ABCDEFG"
        .split("")
        .map((task, i) => {
          const shorter = [...days];
          shorter[0]++;
          shorter[i]--;
          return {
            task,
            ok: duration(shorter) <= duration(days),
            cost: Number(t[0].rows[i][1]),
          };
        })
        .filter((r) => r.ok);
      const cheapest = Math.min(...candidates.map((r) => r.cost));
      unique(b, (c) =>
        candidates.some((r) => r.task === c && r.cost === cheapest),
      );
      return;
    }
    case "2024-a-3": {
      const [[, cx, cy], [, mx, my]] = t[0].rows;
      const h =
        (Number(my) - Number(mx)) /
        (Number(cx) - Number(cy) + Number(my) - Number(mx));
      unique(b, (c) => Math.abs(Number(c) - h) < 1e-9);
      return;
    }
    case "2024-a-19":
      unique(b, (_, i) => i === v[0]);
      return; // Geometric covariance tested independently in full-coverage.
    case "2024-a-20": {
      const sets = [
        "意匠権実用新案権商標権特許権",
        "特許権実用新案権",
        "意匠権商標権",
        "特許権商標権",
      ];
      unique(b, (c) => norm(c) === sets[v[0]]);
      return;
    }
    case "2025-a-3": {
      // In-order traversal of the drawing's topology, with mirrored children.
      const tree: [number | undefined, number | undefined][] = [
        [1, 2],
        [3, 4],
        [5, 6],
        [undefined, undefined],
        [undefined, undefined],
        [undefined, undefined],
        [undefined, undefined],
      ];
      const visit = (i: number): number[] => {
        const [left, right] = v[1] ? [...tree[i]].reverse() : tree[i];
        return [
          ...(left === undefined ? [] : visit(left)),
          i,
          ...(right === undefined ? [] : visit(right)),
        ];
      };
      const expected = visit(0)
        .map((i) => "abcdefg"[(i + v[0]) % 7])
        .join("＜");
      unique(b, (c) => c === expected);
      return;
    }
    case "2025-a-4": {
      const [bf, tr, delta, years] = v,
        available = bf + delta * years,
        repair = tr - delta * years;
      unique(
        b,
        (c) =>
          Number(c) === Number((1 - repair / (available + repair)).toFixed(4)),
      );
      return;
    }
    case "2025-a-6": {
      const input = program.match(/'M\d+'/g)!.map((x) => x.slice(1, -1));
      const rows = t[0].rows.map((r) => r[2]),
        query = (c: string) => {
          const parts = c.match(/仕入先ID (>=|<=|<>|=|<|>) '(M\d+)'/g)!;
          const truth = (part: string, id: string) => {
            const m = / (>=|<=|<>|=|<|>) '(M\d+)'/.exec(part)!;
            switch (m[1]) {
              case "=":
                return id === m[2];
              case "<>":
                return id !== m[2];
              case ">=":
                return id >= m[2];
              case "<=":
                return id <= m[2];
              case "<":
                return id < m[2];
              default:
                return id > m[2];
            }
          };
          return rows.map((id) =>
            c.includes(" OR ")
              ? parts.some((p) => truth(p, id))
              : parts.every((p) => truth(p, id)),
          );
        };
      const expected = rows.map((id) =>
        v[0] === 0
          ? input.includes(id)
          : v[0] === 1
            ? !input.includes(id)
            : v[0] === 2
              ? id >= input[0] && id <= input[1]
              : id < input[0] || id > input[1],
      );
      unique(b, (c) => JSON.stringify(query(c)) === JSON.stringify(expected));
      return;
    }
    case "2025-a-7": {
      const [gb, rate, minutes, overhead] = v;
      const bits = BigInt(gb) * 8000000000n * BigInt(100 + overhead),
        capacity = BigInt(rate) * 1000000n * BigInt(minutes) * 60n;
      const rounded = Number((bits * 2n + capacity) / (2n * capacity));
      unique(b, (c) => Number(c) === rounded);
      return;
    }
    case "2025-a-14": {
      const edges = [
        [0, 1, v[0]],
        [1, 2, v[1]],
        [2, 3, v[2]],
        [3, 4, v[3]],
        [1, 6, v[4]],
        [6, 2, 0],
        [1, 3, v[5]],
        [2, 7, v[6]],
        [7, 3, 0],
        [2, 4, v[7]],
        [4, 5, v[8]],
      ];
      const paths = (n: number, total: number): number[] =>
        n === 5
          ? [total]
          : edges
              .filter(([from]) => from === n)
              .flatMap(([, next, time]) => paths(next, total + time));
      unique(b, (c) => Number(c) === Math.max(...paths(0, 0)));
      return;
    }
    case "2026-a-1": {
      const [, x, y] = t[0].rows[0],
        [, z, w] = t[0].rows[1];
      const groups = t[0].columns[0].startsWith("入力")
        ? [
            [x, y],
            [z, w],
          ]
        : [
            [x, z],
            [y, w],
          ];
      unique(b, (c) => groups.every(([a, d]) => c.includes(`${a}＋${d}＝1`)));
      return;
    }
    case "2026-a-6": {
      unique(b, (_, i) => {
        const diagram = b.choices[i][0];
        assert(
          diagram.type === "diagram" && diagram.scene.kind === "source_figure",
        );
        const signals = diagram.scene.values;
        return signals.slice(14).every((y, j) => {
          const a = Boolean(signals[j]) !== Boolean(v[0] & 1),
            d = Boolean(signals[j + 7]) !== Boolean(v[0] & 2);
          const mid = (a && d) !== Boolean(v[0] & 4);
          return Number(mid !== Boolean(v[0] & 8)) === y;
        });
      });
      return;
    }
    case "2026-a-7": {
      unique(b, (c) => {
        const rows = t[0].rows.map((r) => [...r]);
        if (c.startsWith("DELETE")) return false;
        if (c.startsWith("INSERT"))
          rows.push([/VALUES \('([^']+)'/.exec(c)?.[1] ?? "NULL"]);
        else {
          const newKey = /SET 商品コード = '([^']+)'/.exec(c)![1];
          for (const row of rows)
            if (
              c.includes("在庫数 >= 20")
                ? Number(row[4]) >= 20
                : c.includes(`WHERE 商品コード = '${row[0]}'`)
            )
              row[0] = newKey;
        }
        const keys = rows.map((r) => r[0]);
        return keys.includes("NULL") || new Set(keys).size !== keys.length;
      });
      return;
    }
    case "2026-a-9": {
      const factor = (s: string) =>
        /パスワード|PIN|暗証番号|秘密の質問/.test(s)
          ? "knowledge"
          : /静脈|指紋|顔/.test(s)
            ? "biometric"
            : "possession";
      unique(b, (c) => new Set(c.split("、").map(factor)).size === 2);
      return;
    }
    case "2026-a-18":
      unique(b, (c) => !c.includes("学習"));
      return;
    case "2026-a-20":
      unique(
        b,
        (c) => c === ["氏名表示権", "複製権", "同一性保持権", "公表権"][v[0]],
      );
      return;
    case "2023-b-1":
      unique(b, (c) => {
        const [upper, condition] = c.split("｜");
        return (
          exprIndex(upper, "maxNum", v[0]) &&
          condition === "i mod j が 0 と等しい"
        );
      });
      return;
    case "2023-b-2": {
      const procedures = new Map(
        program
          .split("○")
          .filter(Boolean)
          .map((s) => {
            const [name, ...lines] = s.trim().split("\n");
            return [name, lines.map((s) => s.trim())] as const;
          }),
      );
      const expand = (name: string): string[] =>
        procedures
          .get(name)!
          .flatMap((s) =>
            s.endsWith("()") ? expand(s) : [/"([ABC])"/.exec(s)![1]],
          );
      unique(b, (c) => norm(c) === expand("proc2()").join(""));
      return;
    }
    case "2023-b-3": {
      const input = /data ← \{([^}]+)\}/
        .exec(program)![1]
        .split(",")
        .map(Number);
      const array = [NaN, ...input],
        pivot = array[3];
      let left = 1,
        right = 5;
      for (let step = 0; step < 20; step++) {
        while (array[left] < pivot) left++;
        while (array[right] > pivot) right--;
        if (left >= right) break;
        [array[left], array[right]] = [array[right], array[left]];
        left++;
        right--;
      }
      unique(b, (c) => c === array.slice(1).join(" "));
      return;
    }
    case "2023-b-4": {
      const slots = new Map<number, number>();
      const size = v[0];
      for (const n of v.slice(2)) {
        const positions = [n % size, (n + v[1]) % size];
        const empty = positions.find((i) => !slots.has(i));
        if (empty !== undefined) slots.set(empty, n);
      }
      const expected = `{${Array.from({ length: size }, (_, i) => slots.get(i) ?? -1).join(", ")}}`;
      unique(b, (c) => c === expected);
      return;
    }
    case "2023-b-5":
      unique(b, (c) => {
        const [a, d] = c.split("｜");
        const index = v[0] ? `i − ${v[0]}` : "i";
        return (
          norm(a) === norm(`vector1[${index}] × vector2[${index}]`) &&
          d === (v[1] ? "denominator ÷ sqrt(temp)" : "denominator × sqrt(temp)")
        );
      });
      return;
    case "2024-b-1": {
      const variables = ["x", "y", "z"],
        returned = variables[v[1]],
        fallback = variables[(v[1] + 1) % 3],
        last = variables[(v[1] + 2) % 3];
      const evalCondition = (s: string, env: Record<string, number>) => {
        const terms = s.split(/ and | or /).map((p) => {
          const [a, op, d] = p.split(" ");
          return op === ">" ? env[a] > env[d] : env[a] < env[d];
        });
        return s.includes(" or ") ? terms.some(Boolean) : terms.every(Boolean);
      };
      unique(b, (c) =>
        permutation([1, 2, 3]).every((values) => {
          const env = Object.fromEntries(
            variables.map((name, i) => [name, values[i]]),
          );
          const result = evalCondition(c, env)
            ? env[returned]
            : (v[0] ? env[fallback] < env[last] : env[fallback] > env[last])
              ? env[fallback]
              : env[last];
          return result === (v[0] ? Math.min(...values) : Math.max(...values));
        }),
      );
      return;
    }
    case "2024-b-2": {
      // A candidate is a correct algorithm only if it converts all witnesses,
      // not merely the displayed example (one-digit/palindrome coincidences).
      const run = (c: string, digits: string) => {
        let result = 0;
        for (let i = 1; i <= digits.length; i++) {
          const digit = Number(
            digits[c.includes("length − i") ? digits.length - i : i - 1],
          );
          if (c.startsWith("result ×")) result = result * v[0] + digit;
          else
            result +=
              digit *
              (c.includes("^i")
                ? v[0] ** i
                : c.includes("^(i − 1)")
                  ? v[0] ** (i - 1)
                  : 1);
        }
        return result;
      };
      unique(b, (c) =>
        Array.from({ length: 256 }, (_, n) => n).every(
          (n) => run(c, n.toString(v[0])) === n,
        ),
      );
      return;
    }
    case "2024-b-3":
      unique(b, (c) => {
        const index = (n: string) => (v[0] ? `${n} − ${v[0]}` : n);
        return (
          c ===
          `adjMatrix[${index("u")}, ${index("v")}] ← 1\nadjMatrix[${index("v")}, ${index("u")}] ← 1`
        );
      });
      return;
    case "2024-b-4": {
      const match = /merge\(\{([^}]+)\}, \{([^}]+)\}\)/.exec(prompt)!;
      const a = match[1].split(",").map(Number),
        d = match[2].split(",").map(Number);
      // Remaining data2 consists exactly of its elements larger than max(data1).
      unique(
        b,
        (c) => Number(c) === d.filter((x) => x > Math.max(...a)).length,
      );
      return;
    }
    case "2024-b-5": {
      const orders = t[0].rows.map((r) => r[1].split(", "));
      unique(b, (c) => {
        const [a, d, scale] = c.split("｜");
        return ["A", "B", "C", "D", "E"].every((item) => {
          const kx = orders.filter((o) => o.includes(item)).length;
          return ["A", "B", "C", "D", "E"]
            .filter((x) => x !== item)
            .every((other) => {
              const ky = orders.filter((o) => o.includes(other)).length,
                m = orders.filter(
                  (o) => o.includes(item) && o.includes(other),
                ).length;
              const countM = a === "arrayM[i]" ? m : ky,
                countK = d === "arrayK[i]" ? ky : m;
              const factor =
                scale === "ordersの要素数"
                  ? orders.length
                  : scale === "arrayK[i]"
                    ? countK
                    : scale === "itemCount"
                      ? kx
                      : scale === "1"
                        ? 1
                        : scale === "otherItemsの要素数"
                          ? 4
                          : scale === "allItemsの要素数"
                            ? 5
                            : (kx * countK) / orders.length;
              const actual = (countM * factor) / (kx * countK),
                expected = [
                  (m * orders.length) / (kx * ky),
                  m / kx,
                  m / orders.length,
                  m / ky,
                ][v[0]];
              return (
                Number.isFinite(actual) && Math.abs(actual - expected) < 1e-9
              );
            });
        });
      });
      return;
    }
    case "2025-b-3":
      unique(b, (c) => {
        const [a, d] = c.split("｜");
        return exprIndex(a, "stackPos", v[0]) && d === "stackPos − 1";
      });
      return;
    case "2025-b-4": {
      const match = /search\(\{([^}]+)\}, \{([^}]+)\}\)/.exec(prompt)!;
      const strings = match
        .slice(1)
        .map((s) => [...s.matchAll(/"([abc])"/g)].map((m) => m[1]).join(""));
      let count = 0;
      for (let i = 0; i <= strings[0].length - strings[1].length; i++)
        for (let prefix = 1; prefix <= strings[1].length; prefix++) {
          if (strings[0].slice(i, i + prefix) !== strings[1].slice(0, prefix))
            break;
          count++;
        }
      unique(b, (c) => Number(c) === count);
      return;
    }
    case "2025-b-5": {
      const rows = t[0].rows.map((r) => r.slice(1).map(Number)),
        total = rows.flat().reduce((a, d) => a + d, 0);
      const expected = rows.map((row, i) =>
        Number(
          (
            (row.reduce((a, d) => a + d, 0) *
              rows.reduce((sum, r) => sum + r[i], 0)) /
            total
          ).toFixed(2),
        ),
      );
      unique(b, (c) =>
        c
          .split("｜")
          .map(Number)
          .every((n, i) => n === expected[i]),
      );
      return;
    }
    case "2026-b-1": {
      unique(b, (c) => {
        const match = /(\d+)から(\d+)まで1ずつ(減らす|増やす)/.exec(c)!;
        const a = Array.from({ length: v[1] }, (_, i) => i + 1),
          top = a.slice(-v[0]);
        const step = match[3] === "減らす" ? -1 : 1;
        for (
          let i = Number(match[1]);
          step < 0 ? i >= Number(match[2]) : i <= Number(match[2]);
          i += step
        )
          a[i - 1] = a[i - v[0] - 1];
        a.splice(0, v[0], ...top);
        return (
          JSON.stringify(a) ===
          JSON.stringify([
            ...top,
            ...Array.from({ length: v[1] - v[0] }, (_, i) => i + 1),
          ])
        );
      });
      return;
    }
    case "2026-b-4":
      unique(b, (c) => {
        const [a, d] = c.split("｜");
        return a === "pointerList[p]" && exprIndex(d, "pointerList[p]", v[0]);
      });
      return;
    case "2026-b-5":
      unique(b, (c) => {
        const [a, d] = c.split("｜");
        const i = v[0] ? `i − ${v[0]}` : "i",
          j = v[0] ? `j − ${v[0]}` : "j";
        return (
          a === `colors[${i}]` &&
          d === `colors[${j}] が colorVector[k] と等しい`
        );
      });
      return;
    case "2023-b-6": {
      const all = b
        .contexts!.flatMap((c) =>
          c.blocks.flatMap((x) => (x.type === "list" ? x.items : [])),
        )
        .join("\n");
      const risks = [
        all.includes("初期設定のまま"),
        all.includes("暗号化せず") &&
          all.includes("配送区間は暗号化されていない"),
        all.includes("平文で社内サーバ") && all.includes("認証しない"),
        all.includes("全社員の配布リスト") &&
          all.includes("復号鍵は業務の担当者以外"),
      ];
      unique(b, (_, i) => risks[i]);
      return;
    }
    case "2024-b-6": {
      const goals = [
          /不正ログイン/,
          /業務データの保存/,
          /本人が特定できない/,
          /通信の盗聴/,
        ],
        protections = [
          /2要素/,
          /ダウンロードとコピーを禁止/,
          /従業員ごとのID/,
          /TLS/,
        ];
      const goal = goals.findIndex((g) => g.test(prompt));
      unique(b, (c) => protections[goal].test(c));
      return;
    }
    default:
      throw Error(`Missing semantic oracle: ${source}`);
  }
}

const knowledgeIds = new Set(facts.map((r) => r.source));
for (const d of additionalDefinitions.filter(
  (d) => !knowledgeIds.has(d.source),
))
  test(`${d.source}: independent solution and uniqueness at baseline/bounds/64 seeds`, async () => {
    const t = fixture().templates.find(
      (t) => t.generatorRef.id === `generator-source-${d.source}`,
    )!;
    const values = [
      d.reference,
      ...d.fields.flatMap((f, i) =>
        [f.minimum, f.maximum].map((n) =>
          d.reference.map((x, j) => (i === j ? n : x)),
        ),
      ),
    ];
    for (let seed = 0; seed < 64; seed++)
      values.push(
        (await parametersForSeed(seed.toString(16).padStart(32, "0"), t))
          .values,
      );
    for (const value of values) {
      let body: GeneratedBody;
      try {
        body = d.build(value);
      } catch (e) {
        if (e instanceof Error && e.message === "PARAMETER_CONSTRAINT")
          continue;
        throw e;
      }
      semantic(d.source, body, value);
    }
  });

test("four corrected generators retain their old builds for saved sessions", () => {
  for (const source of ["2023-a-10", "2024-b-2", "2023-b-6", "2026-b-1"]) {
    const d = additionalDefinitions.find((d) => d.source === source)!;
    assert.equal(d.version, "3.0.1");
    assert(d.legacyBuild);
    const params =
      source === "2024-b-2"
        ? [2, 1, 18]
        : source === "2023-b-6"
          ? [3, 2]
          : source === "2026-b-1"
            ? [4, 8]
            : [0, 0];
    assert.notDeepEqual(d.build(params), d.legacyBuild(params));
  }
});
