/* Managed CPM engine. MIT: repository LICENSE. Exact integer arithmetic. */
(() => {
  "use strict";
  const patterns = {
    "2024-a-13": {
      title: "2024年度 科目A 問13", year: 2024, questionNumber: 13,
      nodes: ["start", "branch", "upper", "middle", "lower", "merge", "end"],
      names: { start: "開始", branch: "分岐点", upper: "上側結合点", middle: "中央結合点", lower: "下側結合点", merge: "合流点", end: "終了" },
      definitions: [
        ["A", "start", "branch"], ["B", "branch", "upper"], ["C", "branch", "middle"], ["D", "branch", "lower"],
        ["E", "upper", "merge"], ["F", "middle", "merge"], ["G", "lower", "merge"], ["H", "merge", "end"],
        ["dummy-upper", "upper", "middle"], ["dummy-lower", "middle", "lower"],
      ],
      initial: { A: 30, B: 5, C: 30, D: 20, E: 40, F: 25, G: 30, H: 30 },
      dummyNames: { "dummy-upper": "上→中央のダミー", "dummy-lower": "中央→下のダミー" },
      arrivals: ["merge"],
      points: { start: [70, 235], branch: [235, 235], upper: [460, 90], middle: [485, 235], lower: [510, 380], merge: [755, 235], end: [940, 235] },
      labels: { A: [150, 220], B: [326, 150], C: [360, 220], D: [332, 326], E: [610, 139], F: [620, 220], G: [640, 328], H: [850, 220], "dummy-upper": [526, 149], "dummy-lower": [554, 314] },
      bends: {}, generator: "generator-critical-path", versions: ["2.1.0", "2.2.0"],
    },
    "2025-a-14": {
      title: "2025年度 科目A 問14", year: 2025, questionNumber: 14,
      nodes: ["start", "branch", "lower", "join", "upper", "merge", "preend", "end"],
      names: { start: "開始", branch: "分岐点", lower: "E完了点", join: "B・E合流点", upper: "G完了点", merge: "C・F・G合流点", preend: "D・H合流点", end: "終了" },
      definitions: [
        ["A", "start", "branch"], ["B", "branch", "join"], ["C", "join", "merge"], ["D", "merge", "preend"],
        ["E", "branch", "lower"], ["F", "branch", "merge"], ["G", "join", "upper"], ["H", "join", "preend"], ["I", "preend", "end"],
        ["dummy-e", "lower", "join"], ["dummy-g", "upper", "merge"],
      ],
      initial: { A: 3, B: 6, C: 8, D: 6, E: 5, F: 14, G: 11, H: 15, I: 5 },
      dummyNames: { "dummy-e": "E→B終点のダミー", "dummy-g": "G→C終点のダミー" },
      arrivals: ["join", "merge", "preend"],
      points: { start: [65, 235], branch: [210, 235], lower: [305, 375], join: [400, 235], upper: [525, 115], merge: [640, 235], preend: [800, 235], end: [945, 235] },
      labels: { A: [140, 220], B: [310, 220], C: [520, 220], D: [720, 220], E: [230, 322], F: [425, 45], G: [430, 160], H: [600, 390], I: [875, 220], "dummy-e": [380, 340], "dummy-g": [620, 155] },
      bends: { F: [[260, 60], [580, 60]], H: [[460, 405], [740, 405]] },
      nameOffsets: { join: 70, preend: 65 },
      generator: "generator-source-2025-a-14", versions: ["3.2.0", "3.3.0"],
    },
  };
  for (const pattern of Object.values(patterns)) Object.freeze(pattern.initial);
  function parseDays(raw) {
    if (typeof raw === "bigint") { if (raw >= 0n) return raw; }
    else if (typeof raw === "number") { if (Number.isSafeInteger(raw) && raw >= 0) return BigInt(raw); }
    else if (typeof raw === "string" && /^\d+$/.test(raw.trim())) return BigInt(raw.trim());
    throw Error("0以上の整数を入力してください。小数・負数・空欄・指数表記は使えません。");
  }
  function forPattern(id = "2024-a-13") {
    const pattern = Object.hasOwn(patterns, id) ? patterns[id] : null;
    if (!pattern) throw Error("未対応のアローダイアグラムです。");
    const { nodes, names, definitions, initial } = pattern, official = initial;
    const edgeName = id => pattern.dummyNames[id] ?? `作業${id}`;
    const defaultEnabled = () => Object.fromEntries(Object.keys(pattern.dummyNames).map(id => [id, true]));
    function calculate(values, enabled = defaultEnabled()) {
      const durations = Object.fromEntries(Object.keys(initial).map(id => [id, parseDays(values[id])]));
      const edges = definitions.map(([id, from, to]) => ({ id, from, to, dummy: id.startsWith("dummy-"),
        duration: id.startsWith("dummy-") ? 0n : durations[id], enabled: !id.startsWith("dummy-") || enabled[id] !== false }));
      const active = edges.filter(e => e.enabled);
      const incoming = Object.fromEntries(nodes.map(n => [n, active.filter(e => e.to === n)]));
      const outgoing = Object.fromEntries(nodes.map(n => [n, active.filter(e => e.from === n)]));
      const degrees = Object.fromEntries(nodes.map(n => [n, incoming[n].length])), queue = nodes.filter(n => degrees[n] === 0), order = [];
      for (let i = 0; i < queue.length; i++) {
        const n = queue[i]; order.push(n);
        for (const e of outgoing[n]) if (--degrees[e.to] === 0) queue.push(e.to);
      }
      if (order.length !== nodes.length) throw Error("依存関係が循環しています。");
      const earliest = Object.fromEntries(nodes.map(n => [n, 0n]));
      for (const n of order) for (const e of incoming[n]) {
        const arrival = earliest[e.from] + e.duration;
        if (arrival > earliest[n]) earliest[n] = arrival;
      }
      // Removing a dummy can leave E or G as a terminal task. Project completion
      // still waits for every task, even without that downstream dependency.
      const completionNodes = nodes.filter(n => outgoing[n].length === 0);
      const total = completionNodes.reduce((max, n) => earliest[n] > max ? earliest[n] : max, 0n);
      earliest.end = total;
      const latest = Object.fromEntries(nodes.map(n => [n, total]));
      for (const n of [...order].reverse()) for (const e of outgoing[n]) {
        const candidate = latest[e.to] - e.duration;
        if (candidate < latest[n]) latest[n] = candidate;
      }
      for (const e of edges) {
        e.es = earliest[e.from]; e.ef = e.es + e.duration;
        e.lf = latest[e.to]; e.ls = e.lf - e.duration; e.float = e.ls - e.es;
        e.critical = e.enabled && e.float === 0n;
      }
      const paths = [];
      function walk(node, path) {
        if (outgoing[node].length === 0) { if (earliest[node] === total) paths.push(path); return; }
        for (const e of outgoing[node]) if (e.critical) walk(e.to, [...path, e.id]);
      }
      walk("start", []);
      return { durations, edges, active, incoming, outgoing, order, earliest, latest, total, paths, completionNodes };
    }
    function formula(result, node) {
      const terms = result.incoming[node].map(e => `${result.earliest[e.from]} + ${e.duration}`);
      if (node === "end") for (const terminal of result.completionNodes) if (terminal !== "end") terms.push(`${names[terminal]} ${result.earliest[terminal]}`);
      return terms.length === 0 ? "開始 = 0日" : terms.length === 1 ? `${terms[0]} = ${result.earliest[node]}日`
        : `max(${terms.join(", ")}) = ${result.earliest[node]}日`;
    }
    function steps(result) {
      const trace = [];
      for (const node of result.order) {
        if (pattern.arrivals.includes(node)) trace.push({ kind: "arrivals", node, edges: result.incoming[node].map(e => e.id),
          title: `${result.incoming[node].map(e => e.dummy ? "ダミー" : e.id).join("・")}の到達時刻を比べる` });
        trace.push({ kind: "node", node, edges: result.incoming[node].map(e => e.id), title: `${names[node]}の最早時刻` });
      }
      trace.push({ kind: "critical", node: "end", edges: result.edges.filter(e => e.critical).map(e => e.id), title: "クリティカルパスを確認" });
      return trace;
    }
    return Object.freeze({ pattern, nodes, names, initial, official, parseDays, calculate, formula, steps, edgeName, defaultEnabled });
  }
  function initialState(context, requestedPattern) {
    const generation = context?.generation;
    const patternId = requestedPattern ?? (Object.hasOwn(patterns, context?.initialParameters?.pattern) ? context.initialParameters.pattern
      : generation?.generatorRef?.id === "generator-source-2025-a-14" ||
        ["question-ipa-2025-a-14", "question-template-source-2025-a-14"].includes(context?.question?.id) ? "2025-a-14" : "2024-a-13");
    const pattern = patterns[patternId];
    // Use the saved parameter contract; never parse the prompt or regenerate it.
    if (generation?.generatorRef?.id === pattern.generator && pattern.versions.includes(generation.generatorRef.version) &&
        Array.isArray(generation.parameters?.values) && generation.parameters.values.length === Object.keys(pattern.initial).length) {
      try {
        return { pattern: patternId, values: Object.fromEntries(Object.keys(pattern.initial).map((id, i) => [id, parseDays(generation.parameters.values[i])])), label: "この問題の保存済み条件" };
      } catch { /* An unsupported context falls back to the reviewed original values. */ }
    }
    return { pattern: patternId, values: { ...pattern.initial }, label: "元の問題" };
  }
  window.ArrowEngine = Object.freeze({ ...forPattern(), patterns: Object.freeze(patterns), forPattern, initialState });
})();
