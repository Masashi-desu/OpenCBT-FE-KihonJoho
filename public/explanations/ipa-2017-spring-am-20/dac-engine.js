/* D/A conversion lesson. MIT: repository LICENSE. */
(() => {
  "use strict";
  const defaults = Object.freeze({ bits: 8, reference: 128, volts: "2.5" });
  function integer(raw, min, max) {
    const s = String(raw).trim(), n = Number(s);
    if (!/^\d+$/.test(s) || !Number.isSafeInteger(n) || n < min || n > max) throw Error(`${min}〜${max}の整数を入力してください。`);
    return n;
  }
  function ratio(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (d <= 0n) throw Error("分母は正の整数にしてください。");
    let a = n < 0n ? -n : n, b = d;
    while (b) [a, b] = [b, a % b];
    return { n: n / a, d: d / a };
  }
  function decimal(raw) {
    const s = String(raw).trim();
    if (!/^\d+(?:\.\d{1,3})?$/.test(s) || Number(s) <= 0 || Number(s) > 100) throw Error("電圧は0より大きく100以下、小数第3位までで入力してください。");
    const [whole, part = ""] = s.split(".");
    return ratio(BigInt(whole + part), 10n ** BigInt(part.length));
  }
  function display(r) {
    let rest = r.n % r.d, digits = "";
    for (let i = 0; rest && i < 8; i++) { rest *= 10n; digits += rest / r.d; rest %= r.d; }
    return rest ? `${r.n}/${r.d}` : `${r.n / r.d}${digits ? "." + digits : ""}`;
  }
  function settings(raw) {
    const bits = integer(raw.bits, 2, 12), reference = integer(raw.reference, 1, 2 ** bits - 1);
    return { bits, reference, volts: display(decimal(raw.volts)) };
  }
  function solve(raw, code = 0) {
    const data = settings(raw), voltage = decimal(data.volts), max = 2 ** data.bits - 1;
    code = integer(code, 0, max);
    const unit = ratio(voltage.n, voltage.d * BigInt(data.reference));
    const output = ratio(unit.n * BigInt(code), unit.d);
    const weights = Array.from({ length: data.bits }, (_, i) => 2 ** (data.bits - i - 1));
    return { data, code, max, levels: max + 1, voltage, unit, output, weights,
      binary: code.toString(2).padStart(data.bits, "0"),
      contributions: weights.map(weight => ratio(unit.n * BigInt(weight), unit.d)) };
  }
  function initialState(context) {
    if (!context?.generation) return { ...defaults };
    const g = context.generation, v = g.parameters?.values;
    if (g.generatorRef?.id !== "generator-source-2017h29h-fe-am-20" || g.generatorRef.version !== "3.2.0" || !Array.isArray(v) || v.length !== 2 ||
        !v.every(Number.isSafeInteger) || v[0] < 7 || v[0] > 10 || v[1] < 1 || v[1] > 6) throw Error("保存されたD/A変換の条件を読み取れません。");
    return settings({ bits: v[0], reference: 2 ** (v[0] - 1), volts: String(v[1] / 2) });
  }
  function choices(context) {
    const fallback = [128, 255, 256, 512].map((d, i) => ({ id: `choice-${i + 1}`, text: `2.5/${d}` }));
    const records = context?.generation ? context.question.choices.map(c => ({ id: c.id, text: c.content.blocks.filter(b => b.type === "paragraph").map(b => b.text).join("") })) : fallback;
    const order = context?.choiceOrder ?? records.map((c, i) => ({ id: c.id, label: "アイウエ"[i] }));
    return order.map(item => {
      const c = records.find(c => c.id === item.id), match = c?.text.match(/^(\d+(?:\.\d{1,3})?)\/(\d+)$/);
      if (!match || !Number.isSafeInteger(Number(match[2])) || Number(match[2]) < 1) throw Error("保存された選択肢を読み取れません。");
      const v = decimal(match[1]);
      return { ...item, text: c.text, denominator: Number(match[2]), value: ratio(v.n, v.d * BigInt(match[2])) };
    });
  }
  const outputFor = (unit, code) => ratio(unit.n * BigInt(code), unit.d);
  const same = (a, b) => a.n * b.d === b.n * a.d;
  window.DacEngine = Object.freeze({ defaults, integer, ratio, decimal, display, settings, solve, initialState, choices, outputFor, same });
})();
