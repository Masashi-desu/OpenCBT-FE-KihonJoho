/* Development effort lesson. MIT: repository LICENSE. */
(() => {
  "use strict";
  const names = Object.freeze(["入力処理", "出力処理", "計算処理"]);
  const defaults = Object.freeze({ count0: 20, unit0: 1, count1: 10, unit1: 3, count2: 5, unit2: 9, other: 8, days: 95 });
  const keys = Object.freeze(Object.keys(defaults));
  function integer(value, min, max) {
    const s = String(value).trim(), n = Number(s);
    if (!/^\d+$/.test(s) || !Number.isSafeInteger(n) || n < min || n > max) throw Error(`${min}〜${max}の整数を入力してください。`);
    return n;
  }
  function settings(raw) {
    return Object.fromEntries(keys.map(k => [k, integer(raw[k], k === "other" ? 0 : 1, k === "other" ? 20 : k === "days" ? 9999 : 999)]));
  }
  function solve(raw) {
    const data = settings(raw), rows = names.map((name, i) => ({ name, count: data[`count${i}`], unit: data[`unit${i}`], effort: data[`count${i}`] * data[`unit${i}`] }));
    const coding = rows.reduce((sum, r) => sum + r.effort, 0), extra = coding * data.other, total = coding + extra;
    const people = Math.floor((total + data.days - 1) / data.days);
    return { data, rows, coding, extra, total, people, whole: Math.floor(total / data.days), remainder: total % data.days,
      lower: (people - 1) * data.days, capacity: people * data.days, shortage: total - (people - 1) * data.days, surplus: people * data.days - total };
  }
  function initialState(context) {
    if (!context?.generation) return { ...defaults };
    const g = context.generation, v = g.parameters?.values;
    if (g.generatorRef?.id !== "generator-source-2019h31h-fe-am-54" || g.generatorRef.version !== "3.2.0" || !Array.isArray(v) || v.length !== 3 ||
      !v.every(Number.isSafeInteger) || v[0] < 1 || v[0] > 3 || v[1] < 0 || v[1] > 2 || v[2] < 7 || v[2] > 9) throw Error("保存された開発工数の条件を読み取れません。");
    return settings({ ...defaults, count0: 20 * v[0], count1: 10 * v[0], count2: 5 * v[0], days: [85, 95, 105][v[1]], other: v[2] });
  }
  function choices(context) {
    const records = context?.generation ? context.question.choices.map(c => ({ id: c.id, value: integer(c.content.blocks.filter(b => b.type === "paragraph").map(b => b.text).join(""), 1, 100000000) })) :
      [8, 9, 12, 13].map((value, i) => ({ id: context?.question?.choices[i]?.id ?? `choice-${i + 1}`, value }));
    const order = context?.choiceOrder ?? records.map((c, i) => ({ id: c.id, label: "アイウエ"[i] }));
    if (order.length !== 4 || new Set(order.map(o => o.id)).size !== 4) throw Error("保存された選択肢の順序を読み取れません。");
    return order.map(o => { const c = records.find(c => c.id === o.id); if (!c) throw Error("保存された選択肢を読み取れません。"); return { ...o, value: c.value }; });
  }
  function compare(model, people) {
    people = integer(people, 1, 100000000);
    const capacity = people * model.data.days;
    return { people, capacity, difference: capacity - model.total, kind: capacity < model.total ? "short" : people === model.people ? "minimum" : "extra" };
  }
  window.EffortEngine = Object.freeze({ names, defaults, keys, integer, settings, solve, initialState, choices, compare });
})();
