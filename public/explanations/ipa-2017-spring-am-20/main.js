/* Managed D/A conversion lesson UI. MIT: repository LICENSE. */
(() => {
  "use strict";
  const api = window.OpenCBTDetail, E = window.DacEngine, $ = id => document.getElementById(id), fmt = E.display;
  const initial = E.initialState(api?.context), options = E.choices(api?.context);
  const initialUnit = E.solve(initial).unit;
  const headings = ["入力と電圧の対応を読む", "ビット数とコードの範囲を確認", "最下位ビットの重みは1", "電圧差を段階数で割る", "元の入力へ戻して検算", "全選択肢を比較する"];
  let bits = initial.bits, unit = initialUnit, code = initial.reference;
  let index = 0, selected = null, focus = null, selectionOrigin = null, restoringFocus = false, composition = false;
  const fields = ["bits", "reference", "volts", "code"].map($);
  let codeDraft = $("code"), voltageDraft = false;
  const model = () => E.convert(bits, unit, code);
  const comparisonArea = document.querySelector(".lsb-comparison");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const comparisons = [1, 0].map(lastBit => {
    const row = $("lsb-input-" + lastBit);
    return { lastBit, row, bitRow: row.querySelector(".bit-row") };
  });
  const bitViewports = comparisons.map(({ bitRow }) => bitRow.parentElement);
  const scrollableViewports = new WeakSet();
  const pairedCode = (probe, lastBit) => probe - probe % 2 + lastBit;
  const set = (id, text) => { $(id).textContent = text; };
  const conditionText = m => (m.code === 0
    ? "ディジタル値0を入力したときの出力電圧が0Vとなる場合、"
    : `ディジタル値0を入力したときの出力電圧が0Vとなり、ディジタル値${m.code}を入力したときの出力電圧が${fmt(m.output)}Vとなる場合、`)
    + "最下位の1ビットの変化による当該D/A 変換器の出力電圧の変化は何Vかを求める";
  const line = text => `<div class="formula-line">${text}</div>`;
  const label = text => `<div class="formula-label">${text}</div>`;
  const marks = { voltage: "A", interval: "B", bit: "C", resolution: "D" };
  const term = (key, value, name) => `<button type="button" class="term" data-source="${key}" aria-label="${name}：${value}。図との対応を確認" aria-pressed="false">${marks[key] ? `<span class="mark">${marks[key]}</span>` : ""}<span>${value}</span></button>`;
  function selectSource(key, origin, position = null) {
    if (key === "bit") position = 0;
    const sameCase = selectionOrigin?.closest(".lsb-case") === origin.closest(".lsb-case");
    if (focus === key && selected === position && sameCase) { focus = null; selected = null; }
    else { focus = key; selected = position; }
    selectionOrigin = origin;
    renderSelection(model());
    if (key === "bit") revealLsb();
  }
  function renderSelection(m) {
    const selectedCase = selectionOrigin?.closest(".lsb-case") ?? $("lsb-input-" + (m.code % 2));
    const v = fmt(m.output);
    const related = focus === "weight" ? ["voltage", "interval"] : focus ? [focus] : [
      ["voltage", "interval"], ["resolution"], ["bit", "interval"], ["voltage", "interval"], ["probe"], ["voltage", "interval"]
    ][index];
    document.querySelectorAll("[data-source]").forEach(n => {
      n.classList.toggle("related", related.includes(n.dataset.source));
      if (n.tagName === "BUTTON") n.setAttribute("aria-pressed", String(n.dataset.source === focus));
    });
    document.querySelectorAll(".weight").forEach(b => {
      b.setAttribute("aria-pressed", String(Number(b.dataset.position) === selected && b.closest(".lsb-case") === selectedCase));
    });
    $("close-bit").hidden = !focus;
    $("bit-detail").hidden = selected === null;
    $("explain").hidden = selected !== null;
    if (selected !== null) {
      const sample = pairedCode(m.code, Number(selectedCase.dataset.lastBit));
      const weight = 2 ** selected, on = Math.floor(sample / weight) % 2;
      const perBit = m.code ? `(${v} ÷ ${m.code})` : fmt(m.unit);
      const contribution = fmt(E.outputFor(m.unit, weight));
      set("bit-title", selected === 0 ? "C：最下位ビットの重み1" : `下から${selected + 1}桁目の重み${weight}`);
      set("ex-title", $("bit-title").textContent);
      set("bit-explain", `重みは2の${selected}乗＝${weight}。この桁が0から1になると入力は${weight}増えます。出力の増加は1 LSBの${weight}倍で、${perBit} × ${weight} ＝ ${contribution} Vです。入力コード${sample}では、この桁は${on}なので、出力への寄与は${on ? contribution : "0"} Vです。`);
      return;
    }
    const descriptions = {
      voltage: ["A：入力0から現在の入力までの電圧差", m.code
        ? `${v}−0＝${v} V。右下の電圧を編集すると、この入力に対応する電圧を指定して変換器の1 LSBを調整できます。`
        : "入力0の出力は0 Vです。1 LSBは上の入力0と1の出力差から確認します。"],
      interval: ["B：入力0から現在の入力までの段階数", m.code
        ? `${m.code}−0＝${m.code}段階。両端を含むコードの個数${m.code + 1}では割りません。左下の入力は上の「試す入力」と連動します。`
        : "現在の入力も0なので、入力差は0段階です。1 LSBは上の入力0と1の出力差から確認します。"],
      resolution: ["D：ビット数から分かるのはコードの範囲", `${m.bits}ビットは${m.levels}通り、最大コードは${m.max}です。これは表せる範囲であり、現在の入力B＝${m.code}とは別です。分解能を変えると入力範囲が変わります。`],
      probe: ["試す入力：ビットの重みを足した値", index < 3
        ? `1の桁の重みを足すと入力${m.code}です。比較図の「現在」の行で、この入力に対応する出力を見ます。電圧差はステップ4で計算します。`
        : `入力${m.code}に1 LSBの電圧${fmt(m.unit)} Vを掛けると、「現在」の行の出力${fmt(m.output)} Vになります。`]
    };
    const description = descriptions[focus];
    set("ex-title", description ? description[0] : headings[index]);
    set("explain", description ? description[1] : explain(m));
  }
  function flipBit(weight, origin, input = code) {
    if (hasInvalid()) return;
    code = input ^ weight;
    syncInputs();
    focus = "probe"; selected = null; selectionOrigin = origin;
    render();
  }
  function placeCurrentCard(probe) {
    const active = $("lsb-input-" + (probe % 2));
    if (comparisonArea.firstElementChild === active) return;
    const animate = active.hasAttribute("aria-current") && !reducedMotion.matches;
    const starts = animate ? comparisons.map(({ row }) => row.getBoundingClientRect().top) : [];
    for (const { row } of comparisons) {
      row.style.transition = "none";
      row.style.transform = "";
    }
    const focused = document.activeElement;
    const viewport = active.querySelector(".bit-viewport"), scrollLeft = viewport.scrollLeft;
    comparisonArea.prepend(active);
    viewport.scrollLeft = scrollLeft;
    if (active.contains(focused) && focused !== document.activeElement) focused.focus({ preventScroll: true });
    if (animate) {
      const offsets = comparisons.map(({ row }, i) => starts[i] - row.getBoundingClientRect().top);
      comparisons.forEach(({ row }, i) => { row.style.transform = `translateY(${offsets[i]}px)`; });
      // Commit the start positions before the CSS transitions tracked by the scrollbar overlay.
      void comparisonArea.offsetHeight;
    }
    for (const { row } of comparisons) {
      row.style.transition = "";
      row.style.transform = "";
    }
  }
  function showLsbComparison(m) {
    const { bits } = m;
    placeCurrentCard(m.code);
    const rebuild = comparisons[0].bitRow.children.length !== bits;
    // Reserve space for the symbolic and exact values at the current width.
    const show = (id, symbolic, exact, known) => {
      const node = $(id);
      node.firstElementChild.textContent = known ? exact : symbolic;
      node.dataset.measure = known ? symbolic : exact;
    };
    for (const { lastBit, row, bitRow } of comparisons) {
      const sample = pairedCode(m.code, lastBit);
      if (rebuild) {
        bitRow.replaceChildren(...m.weights.map((weight, i) => {
          const position = bits - i - 1;
          const cell = document.createElement("div");
          cell.className = position === 0 ? "bit lsb" : "bit";
          const toggle = document.createElement("button");
          toggle.type = "button";
          toggle.className = "bit-toggle";
          toggle.addEventListener("click", () => flipBit(weight, toggle, pairedCode(code, lastBit)));
          const detail = document.createElement("button");
          detail.type = "button";
          detail.className = "weight";
          detail.dataset.position = position;
          detail.textContent = position === 0 ? "C 重み1" : `重み${weight}`;
          detail.setAttribute("aria-label", `${position === 0 ? "最下位ビット" : `下から${position + 1}桁目`}、重み${weight}の説明`);
          if (position === 0) detail.dataset.source = "bit";
          else detail.addEventListener("click", () => selectSource("weight", detail, position));
          cell.append(toggle, detail);
          return cell;
        }));
      }
      bitRow.querySelectorAll(".bit-toggle").forEach((toggle, i) => {
        const weight = m.weights[i];
        const value = (sample & weight) ? "1" : "0";
        const name = weight === 1 ? "最下位ビット" : `重み${weight}のビット`;
        toggle.textContent = value;
        toggle.setAttribute("aria-pressed", String(value === "1"));
        toggle.setAttribute("aria-label", `入力コード${sample}の${name}、値${value}。押すと反転`);
      });
      row.setAttribute("aria-current", String(sample === m.code));
      set("lsb-code-" + lastBit, `(${sample})`);
      const known = index >= 3 || sample === 0 || sample === m.code;
      show("lsb-voltage-" + lastBit, "？ V", `${fmt(E.outputFor(m.unit, sample))} V`, known);
    }
    if (rebuild) revealLsb();
    show("lsb-difference", "ΔV", `ΔV = ${fmt(m.unit)} V`, index >= 3);
  }
  function diagram(m) {
    const { code: reference, output } = m, alternate = reference ^ 1;
    const source = (id, mark, values, captions) => {
      const labels = values.map((value, i) => {
        const hidden = i === 1 ? ' aria-hidden="true"' : "";
        return `<span${hidden}><span class="mark">${mark}</span> ＋${value}<span class="source-name">${captions[i]}</span></span>`;
      });
      $(id).innerHTML = `<span class="source-values">${labels.join("")}</span>`;
    };
    set("range", `0〜${m.max} ／ ${m.levels}通り`);
    source("interval-source", "B", [reference, alternate], [`入力差・${reference}段階 ↓`, `入力差・${alternate}段階 ↓`]);
    source("voltage-source", "A", [`${fmt(output)} V`, `${fmt(E.outputFor(m.unit, alternate))} V`], ["電圧差 ↓", "電圧差 ↓"]);
    showLsbComparison(m);
  }
  function formulas(m, step = index) {
    const { code: k, bits } = m, v = fmt(m.output), u = fmt(m.unit);
    const lsb = term("bit", "1 LSB", "求める最下位ビット1段階分");
    const probe = term("probe", k, "ビット列から得た入力");
    const range = line(`${term("resolution", bits, "分解能")}ビット → 2の${bits}乗＝${m.levels}通り`) + line(`最大コード：${m.levels}−1＝${m.max}`);
    const oneStep = line(`1段階の入力差 ＝ ${term("bit", 1, "最下位ビットの重み")}（2の0乗）`);
    if (k === 0) return [
      label("現在の入力0では出力も0 V") + line("入力0と1の出力差を上の図で比べる"),
      range + label("現在の入力0はコード範囲の先頭"),
      label("↑ 最下位ビットの反転で入力0から1へ") + oneStep,
      label("入力1と0の出力差を使う") + line(`${lsb} ＝ V₁ − V₀ ＝ ${u} V`),
      label("↑ 試す入力0での出力を検算する") + line(`${u} × ${probe} ＝ 0 V`),
      line(`${lsb} ＝ V₁ − V₀ ＝ ${u} V`) + label("入力0では全候補の出力が0 V。候補値を1 LSBと直接比較する"),
    ][step];
    const f = `<span class="fraction" aria-label="電圧差を入力差で割る"><span>${term("voltage", v, "分子・電圧差")}</span><span>${term("interval", k, "分母・入力差")}</span></span>`;
    const point = '<span class="source-arrow" aria-hidden="true">←</span>';
    return [
      label(`${point} 二つの対応から、それぞれの差を読む`) + line(`${term("interval", k, "入力差")}段階 ↔ ${term("voltage", v, "電圧差")} V`) + label("同じ区間の入力差Bと電圧差Aを使う"),
      range + label(`${point} 現在の入力${k}はBの端点。コードの範囲とは別に読む。`),
      label("↑ Cの最下位ビットは、入力1段階分") + line(`${term("interval", k, "入力差")} × ΔV ＝ ${term("voltage", v, "電圧差")} V`) + oneStep,
      label(`${point} Aの電圧差を、Bの段階数で等分する`) + line(`${lsb} ＝ ${f} <span>V ＝ ${u} V</span>`),
      label(`${point} 求めたA÷Bを、現在の入力分に戻す`) + line(`${f} × ${probe} ＝ ${v} V`),
      label(`${point} AとBの対応に戻して候補を確かめる`) + line(`${lsb} ＝ ${f} V`) + label(`候補 × Bの${k}段階 ＝ Aの${v} Vになるか、下の表で比較`),
    ][step];
  }
  function explain(m) {
    const { code: k } = m, v = fmt(m.output);
    return [
      k ? `「次へ」で、入力0から${k}までの電圧差${v} Vを何段階で割るか確認します。` : "入力0では段階数が0です。上の図の入力0と1を比べると、1段階の電圧差が分かります。",
      `0も一つのコードに数えるので、${m.levels}通りの最大コードは${m.max}です。現在の入力は${k}です。コードの通り数と、二つのコード間の段階数を区別します。`,
      "最下位ビットの重みは1です。この桁だけを反転すると、入力は1段階変わります。そのときの出力電圧の変化量が1 LSBです。",
      k ? `${k}段階分の電圧差が${v} Vなので、${v} Vを${k}で割ると1段階分の電圧が求まります。` : "入力1と0は1段階だけ離れています。この二つの出力の差が1 LSBです。",
      `1 LSBを${k}回分にすると、「現在」の行の出力${v} Vと一致します。ビットの重みを押すと各桁の寄与も確認できます。`,
      k ? `入力${k}で${v} Vになる候補を表で確認します。` : "入力0では、どの候補でも出力は0 Vです。表の判定は候補値と現在の1 LSBを直接比べた結果です。",
    ][index];
  }
  function renderChoices(m) {
    $("choice-check").hidden = index !== 5;
    if (index !== 5) return;
    const note = m.code ? `各候補を1 LSBと仮定し、現在の入力${m.code}での出力を${fmt(m.output)} Vと比べます。`
      : "入力0での出力は全候補で0 Vです。判定は候補値と現在の1 LSBを直接比べます。";
    set("choice-note", note + (E.same(m.unit, initialUnit) ? "" : "電圧を編集した条件では、一致する候補がない場合もあります。"));
    $("choice-rows").replaceChildren(...options.map(option => {
      const output = E.outputFor(option.value, m.code), same = E.same(option.value, m.unit), row = document.createElement("tr");
      if (same) row.className = "matches";
      const denominator = option.denominator, role = denominator === m.code ? "現在の入力の段階数" : denominator === initial.reference ? "問題の初期入力の段階数" : denominator === m.max ? "最大コード" : denominator === m.levels ? "コードの通り数" : denominator === 2 * m.levels ? "コードの通り数の2倍" : "現在の入力と異なる分母";
      for (const text of [`${option.label}：${option.text}`, `${option.text} × ${m.code} ＝ ${fmt(output)}`, `${same ? "一致" : "不一致"} ／ ${role}`]) { const cell = document.createElement("td"); cell.textContent = text; row.append(cell); }
      return row;
    }));
  }
  function render() {
    const m = model();
    set("known-conditions", conditionText(m));
    diagram(m);
    set("counter", `STEP ${index + 1} / 6`); set("step-title", headings[index]); $("formula").innerHTML = formulas(m);
    renderSelection(m);
    $("prev").disabled = index === 0; $("next").disabled = index === 5; set("next", index === 5 ? "完了" : "次へ");
    $("seek").value = index; $("seek").setAttribute("aria-valuetext", `${index + 1} / 6：${headings[index]}`); $("step-select").value = index;
    renderChoices(m); reserveDiagram(m);
  }
  // Measure all six noninteractive expressions at the actual width/font, then
  // remove the temporary measurement node. No hidden lesson panels remain.
  function reserveDiagram(m = model()) {
    const codes = new Set([0, 1, Math.min(initial.reference, m.max), m.max, m.max - 1, m.code, m.code ^ 1]);
    const samples = [...codes].map(candidate => candidate === m.code ? m : E.convert(m.bits, m.unit, candidate));
    // Reserve the introduction and the steps at the actual width and font size.
    const intro = $("known-conditions"), introProbe = document.createElement("p");
    introProbe.className = "conditions-measure"; introProbe.setAttribute("aria-hidden", "true"); introProbe.inert = true;
    introProbe.style.width = `${intro.getBoundingClientRect().width}px`; intro.parentElement.append(introProbe);
    let introHeight = 0;
    for (const sample of samples) {
      introProbe.textContent = conditionText(sample); introHeight = Math.max(introHeight, introProbe.getBoundingClientRect().height);
    }
    introProbe.remove();
    const introReserved = `${Math.ceil(introHeight)}px`;
    if (intro.style.minHeight !== introReserved) intro.style.minHeight = introReserved;
    const area = document.querySelector(".calculation"), style = getComputedStyle(area);
    const horizontal = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    const vertical = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const probe = document.createElement("div"); probe.className = "formula-measure"; probe.setAttribute("aria-hidden", "true"); probe.inert = true;
    probe.style.width = `${area.getBoundingClientRect().width - horizontal}px`; area.append(probe);
    let height = 0;
    for (const sample of samples) {
      for (let i = 0; i < 6; i++) { probe.innerHTML = formulas(sample, i); height = Math.max(height, probe.getBoundingClientRect().height); }
    }
    probe.remove();
    const reserved = `${Math.ceil(height + vertical)}px`;
    if (area.style.minHeight !== reserved) area.style.minHeight = reserved;
  }
  function hasInvalid() { return fields.some(f => f.getAttribute("aria-invalid") === "true"); }
  function collect(event) {
    if (composition || event?.isComposing) return;
    const target = event.target;
    if (target === $("reference") || target === $("code")) codeDraft = target;
    if (target === $("volts")) voltageDraft = true;
    let error = "";
    fields.forEach(f => f.removeAttribute("aria-invalid"));
    const check = (field, action) => {
      try { return action(); }
      catch (e) { field.setAttribute("aria-invalid", "true"); error += `${field.getAttribute("aria-label")}：${e.message} `; }
    };
    const nextBits = check($("bits"), () => E.integer($("bits").value, 2, 12));
    const nextCode = check(codeDraft, () => E.integer(codeDraft.value, 0, 2 ** (nextBits ?? bits) - 1));
    const nextUnit = voltageDraft && nextCode > 0 ? check($("volts"), () => {
      const text = $("volts").value.trim();
      // The generated output can have more precision than an editable calibration.
      if (text === fmt(E.outputFor(unit, nextCode))) return unit;
      const voltage = E.decimal(text);
      return E.ratio(voltage.n, voltage.d * BigInt(nextCode));
    }) : unit;
    $("input-error").hidden = !error; set("input-error", error ? error + "説明・図・式・比較は直前の有効な条件です。入力を修正するか、問題の初期値に戻してください。" : "");
    if (error) return;
    const changed = nextBits !== bits || nextCode !== code || !E.same(nextUnit, unit);
    if (selected !== null && selected >= nextBits) { selected = null; focus = null; }
    bits = nextBits; code = nextCode; unit = nextUnit; voltageDraft = false;
    syncInputs(target);
    if (changed) render();
  }
  function go(i) {
    index = Math.max(0, Math.min(5, i)); focus = null; selected = null; render();
    if (index === 2) revealLsb();
  }
  function revealLsb(onlyNewOverflow = false) {
    for (const viewport of bitViewports) {
      const max = viewport.scrollWidth - viewport.clientWidth;
      if (!onlyNewOverflow || !scrollableViewports.has(viewport)) viewport.scrollLeft = max;
      if (max > 0) scrollableViewports.add(viewport);
      else scrollableViewports.delete(viewport);
    }
  }
  function closeBit() {
    const origin = selectionOrigin;
    selected = null; focus = null; renderSelection(model());
    restoringFocus = true;
    if (origin?.isConnected) origin.focus();
    else document.querySelector('#formula [data-source]')?.focus();
    restoringFocus = false;
  }
  for (let bits = 2; bits <= 12; bits++) { const option = document.createElement("option"); option.value = bits; option.textContent = bits; $("bits").append(option); }
  headings.forEach((h, i) => { const option = document.createElement("option"); option.value = i; option.textContent = `${i + 1}：${h}`; $("step-select").append(option); });
  function syncInputs(preserve = null) {
    const values = { bits, reference: code, code, volts: fmt(E.outputFor(unit, code)) };
    $("volts").readOnly = code === 0;
    for (const [id, value] of Object.entries(values)) {
      const field = $(id);
      if (field !== preserve || field.readOnly) field.value = value;
    }
  }
  syncInputs();
  fields.forEach(f => { f.addEventListener(f.tagName === "SELECT" ? "change" : "input", collect); f.addEventListener("compositionstart", () => { composition = true; }); f.addEventListener("compositionend", e => { composition = false; collect(e); }); });
  document.querySelector(".lesson").addEventListener("click", event => {
    const source = event.target.closest("button[data-source]");
    if (source) selectSource(source.dataset.source, source);
  });
  fields.forEach(field => field.addEventListener("focus", () => {
    if (restoringFocus) return;
    focus = { bits: "resolution", reference: "interval", volts: "voltage", code: "probe" }[field.id];
    selected = null; selectionOrigin = field; renderSelection(model());
  }));
  $("prev").addEventListener("click", () => go(index - 1)); $("next").addEventListener("click", () => go(index + 1));
  $("seek").addEventListener("input", e => go(Number(e.target.value))); $("step-select").addEventListener("change", e => go(Number(e.target.value)));
  $("close-bit").addEventListener("click", closeBit);
  $("lsb-flip").addEventListener("click", event => flipBit(1, event.currentTarget));
  $("reset").addEventListener("click", () => {
    bits = initial.bits; unit = initialUnit; code = initial.reference;
    selected = null; focus = null; selectionOrigin = null;
    codeDraft = $("code"); voltageDraft = false;
    syncInputs();
    fields.forEach(field => field.removeAttribute("aria-invalid"));
    $("input-error").hidden = true;
    go(0);
    revealLsb();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && focus !== null) { event.preventDefault(); closeBit(); return; }
    if (event.target.closest("input,select,button,summary,a")) return;
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); go(index + (event.key === "ArrowLeft" ? -1 : 1)); }
  });
  if (api) { document.documentElement.dataset.theme = api.context.theme; api.onThemeChange(theme => { document.documentElement.dataset.theme = theme; }); }
  else { $("standalone-title").hidden = false; $("standalone-credit").hidden = false; window.OpenCBTDacScrollbars?.installOverlayScrollbars(document); }
  render();
  let measureFrame = 0;
  const resize = new ResizeObserver(() => {
    if (measureFrame) return;
    measureFrame = requestAnimationFrame(() => { measureFrame = 0; revealLsb(true); reserveDiagram(); });
  });
  resize.observe(document.querySelector(".lesson"));
  bitViewports.forEach(viewport => resize.observe(viewport));
  api?.ready();
})();
