/* Managed radix lesson UI. MIT: repository LICENSE. */
(() => {
  "use strict";
  const api = window.OpenCBTDetail, E = window.RadixEngine, $ = id => document.getElementById(id);
  const initial = E.initialState(api?.context), motion = matchMedia("(prefers-reduced-motion: reduce)");
  let model = null, position = 0, timer = null, playing = false, disposed = false, flight = null, selected = null;
  const text = (id, value) => { $(id).textContent = value; };
  const el = (tag, className, value) => { const n = document.createElement(tag); if (className) n.className = className; if (value !== undefined) n.textContent = value; return n; };
  function weight(base, exponent, side = "input") { const n = el("span", `weight ${side}-weight`, base); n.append(el("sup", "", String(exponent).replace("-", "−"))); return n; }
  function rational(value) {
    if (value.d === 1n) return document.createTextNode(String(value.n));
    const f = el("span", "fraction"); f.setAttribute("role", "math"); f.setAttribute("aria-label", `分子 ${value.n}、分母 ${value.d}`);
    f.append(el("span", "numerator", value.n), el("span", "denominator", value.d)); return f;
  }
  function exact(value) {
    const n = el("span"); n.append(rational(value));
    const decimal = E.expand(value, 10, 12);
    if (value.d !== 1n && decimal.exact) n.append(document.createTextNode(` ＝ ${decimal.text}`));
    return n;
  }
  function calculationValue(value) {
    const decimal = E.expand(value, 10, 12);
    return decimal.exact ? document.createTextNode(decimal.text) : rational(value);
  }
  function flowValue(value, role) {
    const n = el("span", `flow-value ${role}-value`); n.dataset.flow = role;
    n.append(typeof value === "bigint" ? document.createTextNode(String(value)) : calculationValue(value)); return n;
  }
  const p = (parent, value, className = "") => { const n = el("p", className); if (typeof value === "string") n.textContent = value; else n.append(value); parent.append(n); return n; };
  function cancelFlight() {
    if (!flight) return;
    const run = flight; flight = null;
    run.animations.forEach(animation => animation.cancel()); run.nodes.forEach(node => node.remove()); run.restore.forEach(restore => restore());
  }
  function controls() {
    $("previous").disabled = !model || position === 0;
    $("next").disabled = !model || position >= model.steps.length;
    $("play").disabled = !model;
    const label = playing ? "一時停止" : model && position === model.steps.length ? "もう一度再生" : "自動再生";
    $("play").replaceChildren(el("span", "full-label", label), el("span", "compact-label", label === "もう一度再生" ? "もう一度" : label)); $("play").setAttribute("aria-label", label);
    $("play").setAttribute("aria-pressed", String(playing));
    text("step-count", model ? `${position} / ${model.steps.length} ステップ${position === 0 ? "・未開始" : position === model.steps.length ? "・完了" : ""}` : "計算できません");
  }
  function pause() { clearTimeout(timer); timer = null; playing = false; cancelFlight(); controls(); }
  function schedule() {
    timer = setTimeout(() => {
      timer = null;
      if (!playing || disposed || document.hidden || !model) { pause(); return; }
      seek(position + 1, true);
      if (position < model.steps.length) schedule(); else { playing = false; controls(); }
    }, 2600);
  }
  function start() {
    if (playing) { pause(); return; }
    if (!model || disposed || document.hidden) return;
    if (position === model.steps.length) { cancelFlight(); position = 0; selected = null; render(); }
    playing = true; controls(); schedule();
  }
  function fly(step, carry) {
    cancelFlight(); if (motion.matches || disposed || !step || !["add", "repeat-add", "divide", "multiply"].includes(step.kind)) return;
    const run = { animations: [], nodes: [], restore: [] }; flight = run;
    const mark = (node, className) => { node.classList.add(className); run.restore.push(() => node.classList.remove(className)); };
    if (["divide", "multiply"].includes(step.kind)) {
      const target = document.querySelector(`[data-cell="${step.cells[0]}"] .digit-value`);
      if (target) mark(target, "transfer-pending");
    }
    const move = (from, to, content, kind, done) => {
      if (flight !== run || !to) { cancelFlight(); return; }
      const target = to.getBoundingClientRect(), node = el("span", `flying-value ${kind}-flight`);
      node.append(content); node.setAttribute("aria-hidden", "true"); node.dataset.transfer = kind;
      node.style.left = `${from.left}px`; node.style.top = `${from.top}px`; document.body.append(node); run.nodes.push(node);
      const animation = node.animate([{ transform: "translate(0, 0)", opacity: 1 }, { transform: `translate(${target.left - from.left}px, ${target.top - from.top}px)`, opacity: 1 }], { duration: kind === "carry" ? 650 : 800, easing: "ease-in-out" });
      run.animations.push(animation);
      animation.onfinish = () => { node.remove(); if (flight === run) done(); };
    };
    const place = () => {
      const cell = document.querySelector(`[data-cell="${step.cells[0]}"] .digit-value`);
      const adding = ["add", "repeat-add"].includes(step.kind), calculation = $("calculation-detail").querySelector(adding ? '[data-flow="calculation"]' : '[data-flow="digit"]');
      if (!cell || !calculation) { cancelFlight(); return; }
      const source = adding ? cell : calculation, target = adding ? calculation : cell;
      mark(source, "flow-origin");
      const content = adding ? document.createTextNode(step.kind === "repeat-add" ? `(${model.input.repeat})` : step.cell.char) : source.cloneNode(true);
      move(source.getBoundingClientRect(), target, content, adding ? "addition" : "digit", cancelFlight);
    };
    const operand = $("calculation-detail").querySelector('[data-flow="operand"]');
    if (carry && operand) {
      mark(operand, "transfer-pending");
      move(carry.rect, operand, carry.content, "carry", () => { operand.classList.remove("transfer-pending"); mark(operand, "flow-origin"); place(); });
    } else place();
  }
  function seek(next, automatic = false, animate = true) {
    if (!automatic) pause(); else cancelFlight();
    if (!model) return;
    const previous = position, destination = Math.max(0, Math.min(model.steps.length, next)), oldStep = model.steps[previous - 1], nextStep = model.steps[destination - 1];
    const source = $("calculation-detail").querySelector('[data-flow="carry"]');
    const carry = animate && !motion.matches && destination === previous + 1 && source && oldStep?.kind === nextStep?.kind && ["divide", "multiply"].includes(nextStep.kind)
      ? { rect: source.getBoundingClientRect(), content: source.cloneNode(true) } : null;
    position = destination; selected = null; render(); if (animate && position > previous) fly(nextStep, carry);
  }
  function digitSelection(cell) {
    pause();
    if (selected === cell.id) { selected = null; render(); document.querySelector(`[data-cell="${cell.id}"]`)?.focus({ preventScroll: true }); return; }
    seek(cell.step, false, false); selected = cell.id; render(); document.querySelector(`[data-cell="${cell.id}"]`)?.focus({ preventScroll: true });
  }
  function draw(container, cells, base, state) {
    const oldScroll = container.scrollLeft, focused = document.activeElement?.dataset.cell;
    const table = el("table", "digit-grid"), columns = el("colgroup"), head = el("thead"), body = el("tbody");
    const integer = cells.filter(c => c.exponent >= 0), fractional = cells.filter(c => c.exponent < 0), slots = [];
    table.setAttribute("aria-label", `${cells[0].id.startsWith("s") ? "入力" : "出力"}の桁。重み・累乗・数字・10進数の値・状態を縦に対応させた格子`);
    if (model.input.negative) slots.push({ kind: "sign" });
    slots.push(...integer.map(cell => ({ kind: "digit", cell })));
    if (fractional.length) slots.push({ kind: "point" }, ...fractional.map(cell => ({ kind: "digit", cell })));
    columns.append(el("col", "grid-label-column"));
    for (const slot of slots) columns.append(el("col", `grid-${slot.kind}-column`));
    table.style.width = `calc(var(--digit-heading-width) + ${cells.length} * var(--digit-width) + ${fractional.length ? 1 : 0} * var(--digit-point-width) + ${model.input.negative ? 1 : 0} * var(--digit-sign-width))`;
    const header = el("tr"), corner = el("th", "grid-label", "桁の区分"); corner.scope = "col"; header.append(corner);
    if (model.input.negative) { const sign = el("th", "grid-sign", "符号"); sign.scope = "col"; header.append(sign); }
    const integerHeading = el("th", "grid-part", "整数部"); integerHeading.scope = "colgroup"; integerHeading.colSpan = integer.length; header.append(integerHeading);
    if (fractional.length) {
      const point = el("th", "grid-point"); point.scope = "col"; point.setAttribute("aria-label", "小数点");
      const fractionalHeading = el("th", "grid-part", "小数部"); fractionalHeading.scope = "colgroup"; fractionalHeading.colSpan = fractional.length; header.append(point, fractionalHeading);
    }
    head.append(header);
    for (const [kind, label] of [["measure", "重み"], ["power", "累乗"], ["number", "数字"], ["contribution", "10進数の値"], ["status", "状態"]]) {
      const row = el("tr", `grid-row-${kind}`), heading = el("th", "grid-label", label); heading.scope = "row"; row.append(heading);
      for (const slot of slots) {
        if (slot.kind !== "digit") { const n = el("td", `grid-${slot.kind}`, kind === "number" ? slot.kind === "point" ? "." : "−" : ""); row.append(n); continue; }
        const cell = slot.cell, current = state.step?.cells.includes(cell.id), done = cell.step <= position, source = cell.id.startsWith("s"), known = source || done;
        const n = el("td", `grid-cell${current ? " current" : done ? " done" : ""}${cell.recurring ? " recurring" : ""}`); n.dataset.column = cell.id;
        n.addEventListener("click", event => { if (!event.target.closest("button")) digitSelection(cell); });
        if (kind === "power") n.append(weight(base, cell.exponent, source ? "input" : "output"));
        else if (kind === "number") {
          const button = el("button", `digit${current ? " current" : done ? " done" : ""}${cell.recurring ? " recurring" : ""}`);
          button.type = "button"; button.dataset.cell = cell.id;
          button.setAttribute("aria-label", `${source ? "入力" : "出力"}、${base}の${cell.exponent}乗の桁、数字 ${known ? cell.char : "未計算"}、${current ? "現在" : done ? "計算済み" : "未計算"}${cell.recurring ? "、循環部分" : ""}`);
          button.setAttribute("aria-pressed", String(selected === cell.id)); if (current) button.setAttribute("aria-current", "step");
          button.append(el("span", "digit-value", known ? cell.char : "?")); button.addEventListener("click", () => digitSelection(cell)); n.append(button);
        } else if (kind === "status") {
          n.append(el("span", "state", current ? "▶ 現在" : done ? "✓ 済" : "○ 未計算"));
          if (cell.recurring) n.append(el("span", "cycle-mark", "循環の1周期"));
        } else {
          const value = kind === "measure" ? E.rationalText(E.power(base, cell.exponent)) : known ? E.rationalText(cell.contribution) : "?";
          const content = el("span", kind === "measure" ? "weight-value" : "contribution", value.length > 11 ? value.slice(0, 8) + "…" : value); content.title = value; n.append(content);
        }
        row.append(n);
      }
      body.append(row);
    }
    table.append(columns, head, body); container.replaceChildren(table); container.scrollLeft = oldScroll;
    const active = table.querySelector('[aria-current="step"]');
    if (active) {
      const r = active.getBoundingClientRect(), v = container.getBoundingClientRect(), labelWidth = table.querySelector(".grid-label").getBoundingClientRect().width;
      const left = v.left + labelWidth + 1, available = container.clientWidth - labelWidth;
      if (r.left < left || r.right > v.right) container.scrollLeft += r.left - left - Math.max(0, (available - r.width) / 2);
    }
    if (focused) table.querySelector(`[data-cell="${focused}"]`)?.focus({ preventScroll: true });
  }
  function stepContent(step, parent) {
    const line = el("p", "formula"); line.dataset.flow = "calculation";
    if (step.kind === "add") {
      const c = step.cell;
      p(parent, `${c.char} ＝ ${c.digit}（桁の数字を10進数で表した値）`);
      const w = E.power(model.from, c.exponent), product = { n: BigInt(c.digit) * w.n, d: w.d };
      line.append(document.createTextNode(`${c.digit} × `), weight(model.from, c.exponent), document.createTextNode(" ＝ "), rational(product));
      if (product.n !== step.contribution.n || product.d !== step.contribution.d) line.append(document.createTextNode(" ＝ "), exact(step.contribution));
      else if (step.contribution.d !== 1n) { const decimal = E.expand(step.contribution, 10, 12); if (decimal.exact) line.append(document.createTextNode(` ＝ ${decimal.text}`)); }
      parent.append(line);
      const sum = p(parent, "加算前 "); sum.append(exact(step.before), document.createTextNode(" ＋ 今回加える値 "), exact(step.contribution), document.createTextNode(" ＝ 加算後 "), exact(step.after));
    } else if (step.kind === "repeat-add") {
      p(parent, `循環部分 (${model.input.repeat}) 全体の寄与をまとめて加えます。1周期で打ち切る計算ではありません。`);
      const numerator = [...model.input.repeat].reduce((v, c) => v * BigInt(model.from) + BigInt(parseInt(c, 16)), 0n);
      line.append(document.createTextNode(`${numerator} ÷ (`), weight(model.from, model.input.finite.length), document.createTextNode(" × ("), weight(model.from, model.input.repeat.length), document.createTextNode(" − 1)) ＝ "), exact(step.contribution)); parent.append(line);
      const sum = p(parent, "加算前 "); sum.append(exact(step.before), document.createTextNode(" ＋ "), exact(step.contribution), document.createTextNode(" ＝ 加算後 "), exact(step.after));
      p(parent, "循環の1周期を整数とみなした値をR、循環前の小数の桁数をm、周期の長さをkとすると、寄与は R / {基数ᵐ × (基数ᵏ − 1)} です。", "muted");
    } else if (step.kind === "divide") {
      const digit = el("span", "answer-value", step.digit); digit.dataset.flow = "digit";
      line.append(flowValue(step.before, "operand"), document.createTextNode(` ÷ ${model.to} ＝ ${step.next} 余り `), digit); parent.append(line);
      const placement = p(parent, `余り ${step.digit}（数字 ${step.cell.char}）を `); placement.append(weight(model.to, step.cell.exponent, "output"), document.createTextNode(" の桁へ配置。次に使う商："), flowValue(step.next, "carry"));
      p(parent, step.next === 0n ? "商が0になったので整数部は終了です。小数部があれば、次は小数点のすぐ右へ進みます。" : "次の割り算にはこの商を使います。余りは小数点に近い桁から左へ並びます。", "muted");
    } else if (step.kind === "multiply") {
      const product = el("span", "product-value"), digit = el("span", "answer-value", step.digit); digit.dataset.flow = "digit"; product.append(digit);
      const decimal = E.expand(step.product, 10, 12);
      if (decimal.exact) product.append(document.createTextNode(decimal.text.slice(String(step.digit).length)));
      else if (step.next.n !== 0n) product.append(document.createTextNode(" ＋ "), rational(step.next));
      line.append(flowValue(step.before, "operand"), document.createTextNode(` × ${model.to} ＝ `), product); parent.append(line);
      const placement = p(parent, `積の整数部分 ${step.digit}（数字 ${step.cell.char}）を `); placement.append(weight(model.to, step.cell.exponent, "output"), document.createTextNode(" の桁へ配置。次に使う小数部分："), flowValue(step.next, "carry"));
      p(parent, step.next.n === 0n ? "小数部分が0になったので計算は終了です。" : "残った小数部分だけを次の掛け算へ渡し、右隣の桁を求めます。", "muted");
    } else if (step.kind === "cycle") {
      const digits = model.output.digits.slice(step.repeatAt).join("");
      p(parent, `次に使う小数部分 ${E.format(step.next)} が、小数第${step.repeatAt + 1}桁の計算前と一致しました。`);
      p(parent, `小数第${step.repeatAt + 1}桁から「${digits}」が循環します。括弧で示した変換結果は正確です。`);
    } else p(parent, "小数部64桁までを表示して終了します。後続の桁を切り捨てた近似値です。四捨五入はしていません。省略結果からの逆変換はできません。");
  }
  const calculationTitle = step => !step ? "1の位から、桁の重みを確かめる" : step.kind === "add" || step.kind === "repeat-add" ? "入力を10進数の値へ分解" : step.kind === "divide" ? "整数部を割り算で求める" : step.kind === "multiply" ? "小数部を掛け算で求める" : step.kind === "cycle" ? "循環を確認して完了" : "64桁で表示を省略";
  function calculationDetail(detail, step, selection) {
    detail.replaceChildren();
    if (step) stepContent(step, detail);
    else p(detail, `${initial.saved && $("number").value.trim().toUpperCase() === initial.raw && model.from === initial.from && model.to === initial.to ? "この問題の保存済み条件を表示しています。" : ""}「進む」または格子の桁を選び、1の位（0乗）の重みから計算を確認します。`);
    if (model.input.negative) p(detail, "途中計算はすべて絶対値で行っています。最終結果に負の符号を付けます。", "muted");
    if (model.output.repeatAt >= 0 || model.input.repeat) p(detail, "循環する桁の図は最初の1周期分だけです。図の各桁の寄与を足すだけでは、循環全体の値にはなりません。", "muted");
    if (selection) {
      const cell = [...model.source, ...model.target].find(c => c.id === selection);
      // Expand only values abbreviated in the grid; the active addition already shows its full contribution.
      if (E.rationalText(cell.contribution).length > 11 && step?.kind !== "add") {
        const value = p(detail, cell.recurring ? "選んだ桁の寄与（最初の1周期中の1桁）：" : "図で省略した桁の10進数の値："); value.append(exact(cell.contribution));
      }
      const close = el("button", "", "桁の選択を解除"); close.type = "button"; close.onclick = () => { const id = selected; selected = null; render(); document.querySelector(`[data-cell="${id}"]`)?.focus({ preventScroll: true }); }; detail.append(close);
    }
  }
  let calculationSizeKey = "";
  const sizeKey = () => `${$("calculation").getBoundingClientRect().width}/${getComputedStyle($("calculation")).fontSize}`;
  function fitCalculation() {
    if (!model || disposed) return;
    calculationSizeKey = sizeKey();
    const measurement = el("div", "calculation-measure"); measurement.setAttribute("aria-hidden", "true"); measurement.inert = true;
    const fragment = document.createDocumentFragment(), rows = [];
    // Measure this input's real states in one layout pass, including selectable long values.
    for (const step of [null, ...model.steps]) {
      const selections = step && ["add", "repeat-add", "divide", "multiply"].includes(step.kind) ? step.cells : [null];
      for (const selection of selections) {
        const row = el("div", "calculation"), detail = el("div");
        row.append(el("h2", "", calculationTitle(step)), detail); calculationDetail(detail, step, selection);
        fragment.append(row); rows.push(row);
      }
    }
    measurement.append(fragment); $("diagrams").append(measurement);
    const height = Math.ceil(Math.max(...rows.map(row => row.getBoundingClientRect().height)));
    measurement.remove(); $("calculation").style.minHeight = `${height}px`;
  }
  function render() {
    if (!model) { controls(); return; }
    const s = E.snapshot(model, position), step = s.step;
    draw($("source-digits"), model.source, model.from, s); draw($("target-digits"), model.target, model.to, s);
    text("source-base", `${model.from}進数`); text("target-base", `${model.to}進数`);
    text("calculation-title", calculationTitle(step)); calculationDetail($("calculation-detail"), step, selected);
    controls();
  }
  function overview() {
    const decomposition = $("decomposition"), table = $("calculation-table"); decomposition.replaceChildren(); table.replaceChildren();
    if (!model) return;
    for (const step of model.steps) {
      if (["add", "repeat-add"].includes(step.kind)) { const section = el("div"); stepContent(step, section); decomposition.append(section); continue; }
      const row = el("tr"), calculation = el("td"), next = el("td"), placement = el("td");
      if (step.kind === "divide") { calculation.textContent = `${step.before} ÷ ${model.to} ＝ ${step.next} 余り ${step.digit}`; next.textContent = `商 ${step.next}`; }
      else if (step.kind === "multiply") { calculation.append(exact(step.before), document.createTextNode(` × ${model.to} ＝ `), exact(step.product)); next.append(exact(step.next)); }
      else { stepContent(step, calculation); next.textContent = "終了"; placement.textContent = step.kind === "cycle" ? `循環 (${model.output.digits.slice(model.output.repeatAt).join("")})` : "近似・切り捨て"; }
      if (step.cell) placement.append(document.createTextNode(`${step.cell.char}（値 ${step.digit}）→ `), weight(model.to, step.cell.exponent, "output"));
      row.append(calculation, next, placement); table.append(row);
    }
    p(decomposition, `入力の絶対値の合計：${E.format(model.input.magnitude)}${model.input.negative ? "。最終結果には負の符号を付けます。" : ""}`);
  }
  function update() {
    pause(); position = 0; selected = null;
    try {
      model = E.build($("number").value, Number($("from-base").value), Number($("to-base").value));
      text("input-error", ""); $("number").setAttribute("aria-invalid", "false");
      text("result-kind", model.output.exact ? "正確な変換結果" : "小数部64桁で切り捨てた近似値");
      const result = $("result"); result.replaceChildren(el("span", "", model.output.truncated ? "≈" : "="), el("span", "", model.output.text), el("sub", "", model.to));
      result.setAttribute("aria-label", `${model.output.exact ? "正確な変換結果" : "小数部64桁で切り捨てた近似値"}：${model.output.text}、${model.to}進数`);
      const tooLong = (model.output.text.match(/[0-9A-F]/g) ?? []).length > 512;
      $("reverse").disabled = model.output.truncated || tooLong;
      text("result-note", model.output.truncated ? "≈と…は小数部64桁での切り捨てを示します。省略値から逆変換できません。" : tooLong ? "正確な結果ですが、入力上限512桁を超えるため逆変換できません。" : model.output.repeatAt >= 0 ? "括弧内が循環する正確な結果です。そのまま逆変換できます。" : "");
      $("result-note").hidden = !$("result-note").textContent; $("input-help").hidden = !$("result-note").hidden; $("input-error").hidden = true;
      render(); fitCalculation(); overview();
    } catch (error) {
      model = null; text("input-error", error.message); $("number").setAttribute("aria-invalid", "true"); $("reverse").disabled = true;
      $("input-error").hidden = false; $("input-help").hidden = true; $("result-note").hidden = true;
      text("result-kind", "入力を確認してください"); text("result", "—"); $("result").removeAttribute("aria-label"); text("result-note", "入力を直すと、結果・図・計算過程が更新されます。");
      text("source-digits", "入力が不正です。"); text("target-digits", "入力が不正です。"); text("source-base", ""); text("target-base", "");
      text("calculation-title", "入力待ち"); text("calculation-detail", "入力欄の近くに表示された理由を確認してください。");
      for (const id of ["decomposition", "calculation-table"]) $(id).replaceChildren(); controls();
    }
  }
  $("number").addEventListener("input", update); $("from-base").addEventListener("change", update); $("to-base").addEventListener("change", update);
  $("previous").onclick = () => seek(position - 1); $("next").onclick = () => seek(position + 1); $("play").onclick = start;
  $("reverse").onclick = () => { if (!model || $("reverse").disabled) return; const { from, to, output } = model; $("number").value = output.text; $("from-base").value = String(to); $("to-base").value = String(from); update(); };
  $("reset").onclick = () => { $("number").value = initial.raw; $("from-base").value = String(initial.from); $("to-base").value = String(initial.to); update(); };
  const onVisibility = () => { if (document.hidden) pause(); };
  const onMotion = () => { if (motion.matches) cancelFlight(); };
  const onEscape = event => { if (event.key === "Escape" && selected) { const id = selected; pause(); selected = null; render(); document.querySelector(`[data-cell="${id}"]`)?.focus({ preventScroll: true }); } };
  document.addEventListener("visibilitychange", onVisibility); document.addEventListener("keydown", onEscape); motion.addEventListener("change", onMotion);
  const unsubscribe = api?.onThemeChange(theme => { document.documentElement.dataset.theme = theme; });
  const cleanupScrollbars = !api ? window.OpenCBTRadixScrollbars.installOverlayScrollbars() : null;
  let calculationFrame = null;
  const calculationResize = new ResizeObserver(() => {
    if (model && sizeKey() !== calculationSizeKey && calculationFrame === null) calculationFrame = requestAnimationFrame(() => { calculationFrame = null; cancelFlight(); fitCalculation(); });
  });
  calculationResize.observe($("calculation"));
  function dispose() { disposed = true; pause(); calculationResize.disconnect(); if (calculationFrame !== null) cancelAnimationFrame(calculationFrame); unsubscribe?.(); cleanupScrollbars?.(); document.removeEventListener("visibilitychange", onVisibility); document.removeEventListener("keydown", onEscape); motion.removeEventListener("change", onMotion); }
  window.addEventListener("pagehide", event => { if (event.persisted) pause(); else dispose(); });
  if (api) document.documentElement.dataset.theme = api.context.theme;
  else { $("standalone-title").hidden = false; $("standalone-credit").hidden = false; }
  $("number").value = initial.raw; $("from-base").value = String(initial.from); $("to-base").value = String(initial.to);
  update(); api?.ready();
})();
