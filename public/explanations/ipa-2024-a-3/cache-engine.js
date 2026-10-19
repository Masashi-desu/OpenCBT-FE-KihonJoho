/* Cache hit-rate lesson calculations. MIT: repository LICENSE. */
(() => {
  "use strict";
  const defaults = Object.freeze({ xh: 40, xm: 400, yh: 20, ym: 580, cache: 256, main: 256 });
  const keys = Object.keys(defaults);
  function integer(raw, key) {
    const text = String(raw).trim(), n = Number(text), min = ["cache", "main"].includes(key) ? 1 : 0;
    if (!/^\d+$/.test(text) || !Number.isSafeInteger(n) || n < min || n > 100000000) throw Error(`${key}：${min}〜100000000の整数を入力してください。`);
    return n;
  }
  function settings(raw) { return Object.fromEntries(keys.map(key => [key, integer(raw[key], key)])); }
  function ratio(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (!d) throw Error("分母は0にできません。");
    if (d < 0n) { n = -n; d = -d; }
    let a = n < 0n ? -n : n, b = d;
    while (b) [a, b] = [b, a % b];
    return { n: n / a, d: d / a };
  }
  function display(r, minimumPlaces = 0) {
    const negative = r.n < 0n, n = negative ? -r.n : r.n, prefix = negative ? "−" : "";
    let remainder = n % r.d, decimal = "";
    for (let i = 0; remainder && i < 6; i++) { remainder *= 10n; decimal += remainder / r.d; remainder %= r.d; }
    // Keep the exact fraction when six decimal places cannot represent the value.
    if (remainder) return `${prefix}${n}/${r.d}`;
    decimal = decimal.padEnd(minimumPlaces, "0");
    return `${prefix}${n / r.d}${decimal ? "." + decimal : ""}`;
  }
  function average(hit, miss, h) { return ratio(BigInt(hit) * h.n + BigInt(miss) * (h.d - h.n), h.d); }
  function solve(input) {
    const data = settings(input), { xh, xm, yh, ym } = data;
    const left = xh - xm, right = yh - ym, coefficient = left - right, constant = ym - xm;
    const h = coefficient === 0 ? null : ratio(constant, coefficient);
    const kind = !h ? (constant === 0 ? "any" : "none") : (h.n < 0n || h.n > h.d ? "outside" : "unique");
    return { data, left, right, coefficient, constant, h, kind,
      miss: h ? ratio(h.d - h.n, h.d) : null,
      percent: h ? ratio(h.n * 100n, h.d) : null,
      xavg: h ? average(xh, xm, h) : null, yavg: h ? average(yh, ym, h) : null };
  }
  function initialState(context) {
    if (!context?.generation) return { data: { ...defaults }, saved: false };
    const g = context.generation, v = g.parameters?.values;
    if (g.generatorRef?.id !== "generator-source-2024-a-3" || g.generatorRef.version !== "3.3.0" || !Array.isArray(v) || v.length !== 4 ||
      !v.every(Number.isSafeInteger) || v[0] < 70 || v[0] > 96 || v[1] < 1 || v[1] > 5 || v[2] < 5 || v[2] > 30 || v[3] < 100 || v[3] > 600) throw Error("保存されたアクセス時間の条件を読み取れません。");
    const [percent, scale, cy, mx] = v;
    return { data: settings({ ...defaults, xh: cy + (100 - percent) * scale, yh: cy, xm: mx, ym: mx + percent * scale }), saved: true };
  }
  function choices(context) {
    const fallback = [.75, .90, .95, .96].map((h, i) => ({ id: `choice-${i + 1}`, label: ["ア", "イ", "ウ", "エ"][i], h: ratio(Math.round(h * 100), 100) }));
    if (!context?.generation) return fallback.map(c => ({ ...c, label: context?.choiceOrder?.find(item => item.id === c.id)?.label ?? c.label }));
    const order = context.choiceOrder ?? context.question.choices.map((c, i) => ({ id: c.id, label: ["ア", "イ", "ウ", "エ"][i] }));
    return order.map(item => {
      const choice = context.question.choices.find(c => c.id === item.id);
      const raw = choice?.content.blocks.filter(b => b.type === "paragraph").map(b => b.text).join("").trim();
      if (!/^(?:0\.\d{2}|1\.00)$/.test(raw ?? "")) throw Error("保存された選択肢のヒット率を読み取れません。");
      return { ...item, h: ratio(Number(raw.replace(".", "")), 100) };
    });
  }
  window.CacheEngine = Object.freeze({ defaults, keys, integer, settings, ratio, display, average, solve, initialState, choices });
})();
