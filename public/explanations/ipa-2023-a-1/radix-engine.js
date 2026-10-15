/* Exact rational radix lesson. MIT: repository LICENSE. No floating point arithmetic. */
(() => {
  "use strict";
  const alphabet = "0123456789ABCDEF", bases = [2, 8, 10, 16];
  const abs = n => n < 0n ? -n : n;
  function fraction(n, d = 1n) {
    if (d === 0n) throw Error("分母は0にできません。");
    if (d < 0n) { n = -n; d = -d; }
    let a = abs(n), b = d;
    while (b) [a, b] = [b, a % b];
    return { n: n / a, d: d / a };
  }
  const add = (a, b) => fraction(a.n * b.d + b.n * a.d, a.d * b.d);
  const equal = (a, b) => a.n * b.d === b.n * a.d;
  const power = (base, exponent) => exponent >= 0 ? fraction(BigInt(base) ** BigInt(exponent)) : fraction(1n, BigInt(base) ** BigInt(-exponent));
  const valueOf = (digits, base) => [...digits].reduce((n, c) => n * BigInt(base) + BigInt(alphabet.indexOf(c)), 0n);
  function parse(raw, base) {
    if (!bases.includes(base)) throw Error("基数は2・8・10・16から選んでください。");
    const text = String(raw).trim().toUpperCase();
    if (!text) throw Error("変換する数値を入力してください。");
    const invalidCharacter = [...text].find(c => !/[0-9A-F.+\-()]/.test(c));
    if (invalidCharacter) throw Error(`「${invalidCharacter}」は使えません。${base}進数の数字は ${alphabet.slice(0, base)} です。符号・小数点・循環部分の括弧を使えます。`);
    const match = /^([+-]?)([0-9A-F]*)(?:\.([0-9A-F]*)(?:\(([0-9A-F]+)\))?)?$/.exec(text);
    if (!match || !(match[2] || match[3] || match[4])) throw Error("小数点は1個、循環部分は小数部の末尾の括弧1組で入力してください。例：0.E(6)");
    const [, sign, integerRaw, finite = "", repeat = ""] = match;
    const digits = integerRaw + finite + repeat;
    if (digits.length > 512) throw Error("入力は整数部・小数部・循環部分を合わせて512桁までです。");
    const invalid = [...digits].find(c => alphabet.indexOf(c) >= base);
    if (invalid) throw Error(`${base}進数では「${invalid}」は使えません。使える数字：${alphabet.slice(0, base)}`);
    const integer = integerRaw || "0", b = BigInt(base), scale = b ** BigInt(finite.length);
    let magnitude = add(fraction(valueOf(integer, base)), fraction(valueOf(finite, base), scale));
    const repeating = repeat ? fraction(valueOf(repeat, base), scale * (b ** BigInt(repeat.length) - 1n)) : fraction(0n);
    magnitude = add(magnitude, repeating);
    const negative = sign === "-" && magnitude.n !== 0n;
    return { base, integer, finite, repeat, repeating, magnitude, negative,
      value: fraction(negative ? -magnitude.n : magnitude.n, magnitude.d) };
  }
  function expand(value, base, limit = 64) {
    if (!bases.includes(base) || !Number.isInteger(limit) || limit < 1 || limit > 64) throw Error("出力条件が不正です。");
    const n = abs(value.n), d = value.d, b = BigInt(base), integer = (n / d).toString(base).toUpperCase();
    let remainder = n % d, repeatAt = -1;
    const digits = [], remainders = new Map(), operations = [];
    // Test the remainder before the cap, including a cycle closing at digit 64.
    while (remainder) {
      if (remainders.has(remainder)) { repeatAt = remainders.get(remainder); break; }
      if (digits.length === limit) break;
      remainders.set(remainder, digits.length);
      const before = remainder, product = before * b, digit = Number(product / d);
      remainder = product % d;
      operations.push({ before: fraction(before, d), product: fraction(product, d), digit, next: fraction(remainder, d) });
      digits.push(alphabet[digit]);
    }
    const truncated = remainder !== 0n && repeatAt < 0;
    const fractional = repeatAt < 0 ? digits.join("") : digits.slice(0, repeatAt).join("") + "(" + digits.slice(repeatAt).join("") + ")";
    const text = (value.n < 0n ? "-" : "") + integer + (digits.length ? "." + fractional : "") + (truncated ? "…" : "");
    return { text, integer, digits, repeatAt, truncated, exact: !truncated, operations, remainder: fraction(remainder, d) };
  }
  const rationalText = v => v.d === 1n ? String(v.n) : `${v.n}/${v.d}`;
  function format(v) {
    const decimal = expand(v, 10, 12);
    return v.d === 1n ? String(v.n) : rationalText(v) + (decimal.exact ? ` ＝ ${decimal.text}` : "");
  }
  function build(raw, from, to) {
    const input = parse(raw, from), output = expand(input.value, to), source = [], target = [], steps = [];
    let sum = fraction(0n);
    function sourceDigit(char, exponent, recurring = false) {
      const weight = power(from, exponent), digit = alphabet.indexOf(char);
      const cell = { id: `s${source.length}`, char, digit, exponent, recurring, contribution: fraction(weight.n * BigInt(digit), weight.d), step: -1 };
      source.push(cell); return cell;
    }
    [...input.integer].forEach((c, i) => sourceDigit(c, input.integer.length - 1 - i));
    [...input.finite].forEach((c, i) => sourceDigit(c, -1 - i));
    [...input.repeat].forEach((c, i) => sourceDigit(c, -1 - input.finite.length - i, true));
    const ordered = [...source.filter(c => c.exponent >= 0).reverse(), ...source.filter(c => c.exponent < 0 && !c.recurring)];
    for (const cell of ordered) {
      cell.step = steps.length + 1;
      const before = sum; sum = add(sum, cell.contribution);
      steps.push({ kind: "add", cells: [cell.id], cell, before, contribution: cell.contribution, after: sum });
    }
    if (input.repeat) {
      const cells = source.filter(c => c.recurring);
      cells.forEach(c => { c.step = steps.length + 1; });
      const before = sum; sum = add(sum, input.repeating);
      steps.push({ kind: "repeat-add", cells: cells.map(c => c.id), before, contribution: input.repeating, after: sum });
    }
    [...output.integer].forEach((c, i) => target.push({ id: `t${target.length}`, char: c, digit: alphabet.indexOf(c), exponent: output.integer.length - 1 - i, recurring: false, step: -1 }));
    output.digits.forEach((c, i) => target.push({ id: `t${target.length}`, char: c, digit: alphabet.indexOf(c), exponent: -1 - i, recurring: output.repeatAt >= 0 && i >= output.repeatAt, step: -1 }));
    let quotient = input.magnitude.n / input.magnitude.d;
    for (const cell of target.filter(c => c.exponent >= 0).reverse()) {
      const before = quotient, digit = Number(quotient % BigInt(to)); quotient /= BigInt(to); cell.step = steps.length + 1;
      steps.push({ kind: "divide", cells: [cell.id], cell, before, digit, next: quotient });
    }
    output.operations.forEach((operation, i) => {
      const cell = target.find(c => c.exponent === -1 - i); cell.step = steps.length + 1;
      steps.push({ kind: "multiply", cells: [cell.id], cell, ...operation });
    });
    if (output.repeatAt >= 0) steps.push({ kind: "cycle", cells: target.filter(c => c.recurring).map(c => c.id), repeatAt: output.repeatAt, next: output.remainder });
    if (output.truncated) steps.push({ kind: "truncate", cells: [], next: output.remainder });
    for (const cell of target) { const w = power(to, cell.exponent); cell.contribution = fraction(w.n * BigInt(cell.digit), w.d); }
    return { input, output, source, target, steps, from, to };
  }
  function snapshot(model, position) {
    const count = Math.max(0, Math.min(model.steps.length, position)), step = model.steps[count - 1] ?? null;
    let sum = fraction(0n), nextInteger = model.input.magnitude.n / model.input.magnitude.d,
      nextFraction = fraction(model.input.magnitude.n % model.input.magnitude.d, model.input.magnitude.d);
    for (const s of model.steps.slice(0, count)) {
      if (s.kind === "add" || s.kind === "repeat-add") sum = s.after;
      if (s.kind === "divide") nextInteger = s.next;
      if (s.kind === "multiply") nextFraction = s.next;
    }
    const known = model.target.filter(c => c.step <= count);
    let represented = fraction(0n);
    known.forEach(c => { represented = add(represented, c.contribution); });
    const pattern = model.target.map(c => (c.exponent === -1 ? "." : "") + (c.step <= count ? c.char : "?")).join("");
    return { count, step, sum, nextInteger, nextFraction, known, represented, pattern,
      done: count === model.steps.length, cycleKnown: model.steps.slice(0, count).some(s => s.kind === "cycle") };
  }
  function initialState(context) {
    const g = context?.generation, values = g?.parameters?.values;
    if (g?.generatorRef?.id === "generator-hex-fraction" && g.generatorRef.version === "2.3.0" &&
      Array.isArray(values) && values.length === 3 && bases.includes(values[0]) && bases.includes(values[1]) && values[0] !== values[1] && Number.isInteger(values[2]) && values[2] >= 1 && values[2] <= 7)
      return { raw: expand(fraction(BigInt(values[2]), 8n), values[0]).text, from: values[0], to: values[1], saved: true };
    if (g?.generatorRef?.id === "generator-hex-fraction" && ["2.1.0", "2.2.0", "2.2.1"].includes(g.generatorRef.version) &&
      Array.isArray(values) && Number.isInteger(values[0]) && Number.isInteger(values[1]) && values[0] > 0 && values[0] < 16 ** values[1] && values[1] >= 1 && values[1] <= 2)
      return { raw: "0." + values[0].toString(16).toUpperCase().padStart(values[1], "0"), from: 16, to: 10, saved: true };
    return { raw: "0.C", from: 16, to: 10, saved: false };
  }
  globalThis.RadixEngine = Object.freeze({ bases, fraction, add, equal, power, parse, expand, build, snapshot, format, rationalText, initialState });
})();
