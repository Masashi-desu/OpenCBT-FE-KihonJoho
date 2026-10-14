/* Managed CPM engine. MIT: repository LICENSE. Exact integer arithmetic. */
(() => {
  "use strict";
  const nodes = ["start", "branch", "upper", "middle", "lower", "merge", "end"];
  const names = { start: "開始", branch: "分岐点", upper: "上側結合点", middle: "中央結合点", lower: "下側結合点", merge: "合流点", end: "終了" };
  const definitions = [
    ["A", "start", "branch"], ["B", "branch", "upper"], ["C", "branch", "middle"], ["D", "branch", "lower"],
    ["E", "upper", "merge"], ["F", "middle", "merge"], ["G", "lower", "merge"], ["H", "merge", "end"],
    ["dummy-upper", "upper", "middle"], ["dummy-lower", "middle", "lower"],
  ];
  const initial = Object.freeze({ A: 30, B: 5, C: 30, D: 20, E: 40, F: 25, G: 30, H: 30 });
  const official = initial;
  function parseDays(raw) {
    if (typeof raw === "bigint") { if (raw >= 0n) return raw; }
    else if (typeof raw === "number") { if (Number.isSafeInteger(raw) && raw >= 0) return BigInt(raw); }
    else if (typeof raw === "string" && /^\d+$/.test(raw.trim())) return BigInt(raw.trim());
    throw Error("0以上の整数を入力してください。小数・負数・空欄・指数表記は使えません。");
  }
  const edgeName = id => id === "dummy-upper" ? "上→中央のダミー" : id === "dummy-lower" ? "中央→下のダミー" : `作業${id}`;
  function calculate(values, enabled = { "dummy-upper": true, "dummy-lower": true }) {
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
    const total = earliest.end, latest = Object.fromEntries(nodes.map(n => [n, total]));
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
      if (node === "end") { paths.push(path); return; }
      for (const e of outgoing[node]) if (e.critical) walk(e.to, [...path, e.id]);
    }
    walk("start", []);
    return { durations, edges, active, incoming, outgoing, order, earliest, latest, total, paths };
  }
  function formula(result, node) {
    const terms = result.incoming[node].map(e => `${result.earliest[e.from]} + ${e.duration}`);
    return terms.length === 0 ? "開始 = 0日" : terms.length === 1 ? `${terms[0]} = ${result.earliest[node]}日`
      : `max(${terms.join(", ")}) = ${result.earliest[node]}日`;
  }
  function steps(result) {
    const trace = [];
    for (const node of result.order) {
      if (node === "merge") trace.push({ kind: "arrivals", node, edges: result.incoming[node].map(e => e.id),
        title: "E・F・Gの到達時刻を比べる" });
      trace.push({ kind: "node", node, edges: result.incoming[node].map(e => e.id), title: `${names[node]}の最早時刻` });
    }
    trace.push({ kind: "critical", node: "end", edges: result.edges.filter(e => e.critical).map(e => e.id), title: "クリティカルパスを確認" });
    return trace;
  }
  function initialState(context) {
    const generation = context?.generation;
    // Use the saved parameter contract; never parse the prompt or regenerate it.
    if (generation?.generatorRef?.id === "generator-critical-path" &&
        ["2.1.0", "2.2.0"].includes(generation.generatorRef.version) &&
        Array.isArray(generation.parameters?.values) && generation.parameters.values.length === 8) {
      try {
        return { values: Object.fromEntries(Object.keys(initial).map((id, i) => [id, parseDays(generation.parameters.values[i])])), label: "この問題の保存済み条件" };
      } catch { /* An unsupported context falls back to the reviewed original values. */ }
    }
    return { values: { ...initial }, label: "元の問題" };
  }
  window.ArrowEngine = Object.freeze({ nodes: Object.freeze(nodes), names: Object.freeze(names), initial, official, parseDays, calculate, formula, steps, edgeName, initialState });
})();
