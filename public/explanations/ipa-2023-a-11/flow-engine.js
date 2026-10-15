/* Managed flowchart interpreter. MIT: repository LICENSE. No dynamic evaluation. */
(() => {
  "use strict";
  const MAX = BigInt(Number.MAX_SAFE_INTEGER), STEP_LIMIT = 512;
  const operators = Object.freeze({
    eq: { label: "＝", test: (m, n) => m === n },
    ne: { label: "≠", test: (m, n) => m !== n },
    lt: { label: "＜", test: (m, n) => m < n },
    le: { label: "≦", test: (m, n) => m <= n },
    gt: { label: "＞", test: (m, n) => m > n },
    ge: { label: "≧", test: (m, n) => m >= n },
  });
  const numbers = ["", "①", "②", "③", "④", "⑤", "⑥"];
  const titles = ["", "m ← a、n ← b", "m : n の比較", "m : n の大小比較", "m ← (m − n)", "n ← (n − m)", "mの値を印字"];
  function integer(raw, name) {
    const value = String(raw ?? "").trim();
    if (!/^\+?\d+$/.test(value)) throw Error(`${name}は正の整数を入力してください（未入力・小数は使えません）。`);
    const digits = value.replace(/^\+?0*/, "");
    if (!digits) throw Error(`${name}は1以上にしてください。`);
    if (digits.length > 16 || BigInt(digits) > MAX) throw Error(`${name}は9,007,199,254,740,991以下にしてください。`);
    return Number(digits);
  }
  function config(raw) {
    const a = integer(raw.a, "a"), b = integer(raw.b, "b");
    if (!Object.hasOwn(operators, raw.exitOp) || !Object.hasOwn(operators, raw.subtractOp)) throw Error("比較演算子を選んでください。");
    return Object.freeze({ a, b, exitOp: raw.exitOp, subtractOp: raw.subtractOp });
  }
  const defaultConfig = () => config({ a: 6, b: 9, exitOp: "eq", subtractOp: "lt" });
  // Official answer choices, with small independent example values for tracing.
  const patterns = Object.freeze([
    { id: "choice-1", choice: "ア", relation: "a＝2b", a: 6, b: 3 },
    { id: "choice-2", choice: "イ", relation: "2a＝b", a: 3, b: 6 },
    { id: "choice-3", choice: "ウ", relation: "2a＝3b", a: 9, b: 6 },
    { id: "choice-4", choice: "エ", relation: "3a＝2b", a: 6, b: 9 },
  ].map(Object.freeze));
  const matchingPattern = c => patterns.find(p => BigInt(c.a) * BigInt(p.b) === BigInt(c.b) * BigInt(p.a)) ?? null;
  function relationLabel(outcomes) {
    const key = outcomes.join(",");
    return ({ "-1,0,1": "すべて", "-1,1": "≠", "-1,0": "≦", "0,1": "≧", "-1": "＜", "0": "＝", "1": "＞", "": "到達不能" })[key];
  }
  function branches(c) {
    const all = [-1, 0, 1], yes = (op, r) => operators[op].test(r, 0);
    const exit = all.filter(r => yes(c.exitOp, r)), onward = all.filter(r => !yes(c.exitOp, r));
    return Object.fromEntries([
      ["2-6", exit], ["2-3", onward],
      ["3-5", onward.filter(r => yes(c.subtractOp, r))],
      ["3-4", onward.filter(r => !yes(c.subtractOp, r))],
    ].map(([edge, outcomes]) => [edge, { outcomes, label: relationLabel(outcomes), reachable: outcomes.length > 0 }]));
  }
  function expression(pair) {
    let result = "";
    const terms = pair.map((coefficient, i) => ({ coefficient, i }));
    terms.sort((a, b) => Number(b.coefficient > 0) - Number(a.coefficient > 0));
    terms.forEach(({ coefficient, i }) => {
      if (!coefficient) return;
      const magnitude = Math.abs(coefficient), term = `${magnitude === 1 ? "" : magnitude}${i ? "b" : "a"}`;
      result += coefficient < 0 ? `−${term}` : result ? `＋${term}` : term;
    });
    return result || "0";
  }
  function comparisonRelation(left, right, op) {
    // Differences can exceed safe Number precision even when each coefficient
    // is safe. Keep rearrangement and reduction in BigInt, including formatting.
    let a = BigInt(left[0]) - BigInt(right[0]), b = BigInt(left[1]) - BigInt(right[1]);
    const abs = n => n < 0n ? -n : n;
    let x = abs(a), y = abs(b);
    while (y) [x, y] = [y, x % y];
    if (x) { a /= x; b /= x; }
    if (a < 0n || (a === 0n && b < 0n)) {
      a = -a; b = -b;
      op = ({ eq: "eq", ne: "ne", lt: "gt", le: "ge", gt: "lt", ge: "le" })[op];
    }
    const side = sign => [a, b].flatMap((v, i) => v * sign > 0n ? [`${abs(v) === 1n ? "" : abs(v)}${i ? "b" : "a"}`] : []).join("＋") || "0";
    return `${side(1n)}${operators[op].label}${side(-1n)}`;
  }
  function safe(value) {
    if (value < -MAX || value > MAX) throw Error("整数精度の上限を超えるため、代入前に停止しました。m・nと文字式の係数は安全な整数の範囲で扱います。");
    return Number(value);
  }
  const subtract = (left, right) => safe(BigInt(left) - BigInt(right));
  function create(c) {
    return { node: 1, next: 2, m: c.a, n: c.b, em: [1, 0], en: [0, 1], edges: ["start-1"], comparison: null,
      printed: null, status: "running", reason: "", calculation: `m ← a＝${c.a}、n ← b＝${c.b}` };
  }
  function advance(history, c, limit = STEP_LIMIT) {
    const previous = history.at(-1);
    if (!previous || previous.status !== "running") return previous;
    const s = { ...previous, node: previous.next, em: [...previous.em], en: [...previous.en],
      edges: [...new Set([...previous.edges, `${previous.node}-${previous.next}`])], comparison: null, calculation: "" };
    if (s.node === 2 || s.node === 3) {
      const op = s.node === 2 ? c.exitOp : c.subtractOp, holds = operators[op].test(s.m, s.n);
      s.next = s.node === 2 ? holds ? 6 : 3 : holds ? 5 : 4;
      s.comparison = { m: s.m, n: s.n, op, holds, next: s.next };
    } else if (s.node === 4 || s.node === 5) {
      const isM = s.node === 4, left = isM ? s.m : s.n, right = isM ? s.n : s.m;
      const le = isM ? s.em : s.en, re = isM ? s.en : s.em;
      try {
        // Calculate both results before committing so a precision stop is atomic.
        const value = subtract(left, right), pair = le.map((v, i) => subtract(v, re[i]));
        if (isM) { s.m = value; s.em = pair; } else { s.n = value; s.en = pair; }
        s.calculation = `${isM ? "m" : "n"} ← ${left} − (${right})＝${value}。文字式：(${expression(le)}) − (${expression(re)})＝${expression(pair)}`;
        s.next = 2;
      } catch (error) { s.status = "stopped"; s.next = null; s.reason = error.message; return s; }
    } else if (s.node === 6) {
      s.printed = s.m; s.status = "completed"; s.next = null;
      s.edges.push("6-end"); s.calculation = `m＝${expression(s.em)}＝${s.m} を印字して終了します。`;
      return s;
    }
    const repeated = history.findIndex(old => old.node === s.node && old.m === s.m && old.n === s.n);
    if (repeated >= 0) {
      s.status = "stopped"; s.reason = `循環を検出しました。${numbers[s.node]}・m＝${s.m}・n＝${s.n}が履歴${repeated + 1}と同じ状態です。`; s.next = null;
    } else if (history.length + 1 >= limit) {
      s.status = "stopped"; s.reason = `実行上限の${limit}段階に達したため停止しました。`; s.next = null;
    }
    return s;
  }
  const baselinePath = [1, 2, 3, 5, 2, 3, 4, 2, 6];
  function baselineApplies(c, history) {
    return c.exitOp === "eq" && c.subtractOp === "lt" && 3n * BigInt(c.a) === 2n * BigInt(c.b)
      && history.every((s, i) => s.node === baselinePath[i]);
  }
  function explain(c, history) {
    const s = history.at(-1), result = [];
    if (s.comparison) {
      const p = s.comparison;
      result.push(`${numbers[s.node]}は ${p.m} ${operators[p.op].label} ${p.n} を判定し、${p.holds ? "成立" : "不成立"}。${numbers[p.next]}へ進む分岐です。`);
    } else {
      if (s.node === 6) {
        const decision = history.at(-2)?.comparison;
        if (decision) result.push(`②で ${decision.m} ${operators[decision.op].label} ${decision.n} が成立し、⑥へ進みました。`);
      }
      result.push(s.calculation);
    }
    result.push(`現在は m＝${expression(s.em)}＝${s.m}、n＝${expression(s.en)}＝${s.n}。`);
    if (s.node === 2 || s.node === 6) {
      result.push(`この時点で②から⑥へ進む文字式の条件は ${expression(s.em)}${operators[c.exitOp].label}${expression(s.en)}。移項して整理すると ${comparisonRelation(s.em, s.en, c.exitOp)} です。`);
    }
    if (s.status === "stopped") result.push(s.reason);
    else if (s.status === "completed") result.push(`印字した値は${s.printed}です。`);
    if (baselineApplies(c, history)) {
      if (s.node === 1) result.push("基準問題と同じ経路になる設定です。①の後は m＝a、n＝b。次へ進み、⑤・④の減算を文字式でも追いましょう。");
      else if (history.some(v => v.node === 4)) result.push("④で m＝a−(b−a)＝2a−b、n＝b−a。最後の②から⑥へ進む条件は 2a−b＝b−a。整理すると 3a＝2b となり、基準問題の正解は「エ」です。");
      else if (history.some(v => v.node === 5)) result.push("⑤で n＝b−a となり、m＝a、n＝b−a。③ではこの二つを比べます。");
    } else if (c.exitOp === "eq" && c.subtractOp === "lt") {
      const pattern = matchingPattern(c);
      if (s.node === 1 && pattern) result.push(`公開問題の選択肢「${pattern.choice}：${pattern.relation}」を満たす数値例です。減算の順序と文字式を追って、指定経路と比べましょう。`);
      if (s.status === "completed" || (s.node === 2 && s.next === 6)) {
        const path = history.map(v => numbers[v.node]);
        if (s.node === 2) path.push("⑥");
        result.push(`今回の実行順は ${path.join(" → ")}。公開問題の指定経路とは異なります。終了することだけでなく、⑤→④の順を含む指定の9段階を通る関係を選ぶので、基準問題の正解は「エ：3a＝2b」です。`);
      }
    } else result.push("比較条件を変更した設定の解説です。上の文字式の条件と実際の履歴を確認してください。公開問題の指定経路・正解は、標準の比較条件を前提とします。");
    return result;
  }
  globalThis.FlowEngine = Object.freeze({ operators, numbers, titles, STEP_LIMIT, integer, config, defaultConfig, patterns, matchingPattern, branches, expression, comparisonRelation, create, advance, baselineApplies, explain });
})();
