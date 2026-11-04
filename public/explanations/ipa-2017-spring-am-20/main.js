/* Managed D/A conversion lesson UI. MIT: repository LICENSE. */
(() => {
  "use strict";
  const api = window.OpenCBTDetail, E = window.DacEngine, $ = id => document.getElementById(id), fmt = E.display;
  const initial = E.initialState(api?.context), options = E.choices(api?.context);
  const headings = ["入力と電圧の対応を読む", "ビット数とコードの範囲を確認", "最下位ビットの重みは1", "電圧差を段階数で割る", "元の入力へ戻して検算", "全選択肢を比較する"];
  let data = { ...initial }, code = data.reference, index = 0, selected = null, focus = null, selectionOrigin = null, restoringFocus = false, composition = false;
  const fields = ["bits", "reference", "volts", "code"].map($);
  const set = (id, text) => { $(id).textContent = text; };
  const line = text => `<div class="formula-line">${text}</div>`;
  const label = text => `<div class="formula-label">${text}</div>`;
  const changed = () => data.bits !== initial.bits || data.reference !== initial.reference || data.volts !== initial.volts;
  const marks = { voltage: "A", interval: "B", bit: "C", resolution: "D" };
  const term = (key, value, name) => `<button type="button" class="term" data-source="${key}" aria-label="${name}：${value}。図との対応を確認" aria-pressed="false">${marks[key] ? `<span class="mark">${marks[key]}</span>` : ""}<span>${value}</span></button>`;
  const fraction = () => `<span class="fraction" aria-label="電圧差を入力差で割る"><span>${term("voltage", data.volts, "分子・電圧差")}</span><span>${term("interval", data.reference, "分母・入力差")}</span></span>`;
  function selectSource(key, origin, position = null) {
    if (key === "bit") position = 0;
    if (focus === key && selected === position) { focus = null; selected = null; }
    else { focus = key; selected = position; }
    selectionOrigin = origin;
    renderSelection(E.solve(data, code));
    if (key === "bit") revealLsb();
  }
  function renderSelection(m) {
    const related = focus === "weight" ? ["voltage", "interval"] : focus ? [focus] : [
      ["voltage", "interval"], ["resolution"], ["bit", "interval"], ["voltage", "interval"], ["probe"], ["voltage", "interval"]
    ][index];
    document.querySelectorAll("[data-source]").forEach(n => {
      n.classList.toggle("related", related.includes(n.dataset.source));
      if (n.tagName === "BUTTON") n.setAttribute("aria-pressed", String(n.dataset.source === focus));
    });
    document.querySelectorAll(".weight").forEach(b => b.setAttribute("aria-pressed", String(Number(b.dataset.position) === selected)));
    $("close-bit").hidden = !focus;
    $("bit-detail").hidden = selected === null;
    $("explain").hidden = selected !== null;
    if (selected !== null) {
      const weight = 2 ** selected, on = Math.floor(code / weight) % 2;
      set("bit-title", selected === 0 ? "C：最下位ビットの重み1" : `下から${selected + 1}桁目の重み${weight}`);
      set("ex-title", $("bit-title").textContent);
      set("bit-explain", `重みは2の${selected}乗＝${weight}。この桁が0から1になると入力は${weight}増えます。出力の増加は、図のA÷Bで求めた1 LSBの${weight}倍：(${data.volts}/${data.reference}) × ${weight} ＝ ${fmt(E.outputFor(m.unit, weight))} V。現在は${on}なので、この桁の寄与は${on ? fmt(E.outputFor(m.unit, weight)) : "0"} Vです。`);
      return;
    }
    const descriptions = {
      voltage: ["A：分子は、与えられた二点の電圧差", `${data.volts}−0＝${data.volts} V。図の右側で0 Vから${data.volts} Vまで増えた量が、式の分子Aです。右下の電圧を編集すると、Aと1 LSB、試す入力の出力が連動して変わります。`],
      interval: ["B：分母は、二点の入力コードの差", `${data.reference}−0＝${data.reference}段階。図の左側で0から${data.reference}まで1ずつ進む回数が、式の分母Bです。両端を含むコードの個数${data.reference + 1}では割りません。左下の入力を編集して確かめられます。`],
      resolution: ["D：ビット数から分かるのはコードの範囲", `${data.bits}ビットは${m.levels}通り、最大コードは${m.max}です。これは表せる範囲であり、電圧が与えられた二点の差B＝${data.reference}とは別です。分解能だけを変えても、AとBが同じなら1 LSBは変わりません。`],
      probe: ["試す入力：ビットの重みを足した値", `現在のビット列は入力${code}です。1の桁の重みを足した値に、A÷B＝${fmt(m.unit)} Vを掛けると、出力${fmt(m.output)} Vになります。ビットを反転すると、この入力と出力が一緒に変わります。`]
    };
    const description = descriptions[focus];
    set("ex-title", description ? description[0] : headings[index]);
    set("explain", description ? description[1] : explain(m));
  }
  function diagram(m) {
    if ($("bit-row").children.length !== data.bits) {
      $("bit-row").replaceChildren(...m.weights.map((weight, i) => {
        const position = data.bits - i - 1, cell = document.createElement("div"); cell.className = "bit" + (position === 0 ? " lsb" : "");
        const toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "bit-toggle"; toggle.dataset.weight = weight;
        toggle.addEventListener("click", () => { if (hasInvalid()) return; code ^= weight; $("code").value = code; focus = "probe"; selected = null; selectionOrigin = toggle; render(); });
        const detail = document.createElement("button"); detail.type = "button"; detail.className = "weight"; detail.dataset.position = position; detail.textContent = position === 0 ? "C 重み1" : `重み${weight}`;
        detail.setAttribute("aria-label", `${position === 0 ? "最下位ビット" : `下から${position + 1}桁目`}、重み${weight}の説明`);
        detail.addEventListener("click", () => { selectSource(position === 0 ? "bit" : "weight", detail, position); });
        cell.append(toggle, detail); return cell;
      }));
    }
    document.querySelectorAll(".bit-toggle").forEach((b, i) => {
      b.textContent = m.binary[i]; b.setAttribute("aria-pressed", String(m.binary[i] === "1"));
      b.setAttribute("aria-label", `重み${b.dataset.weight}のビット、現在${m.binary[i]}。押すと反転`);
    });
    set("output", index < 3 && code !== 0 && code !== data.reference ? "ステップ4で計算" : `${fmt(m.output)} V`);
    set("range", `0〜${m.max} ／ ${m.levels}通り`);
    $("interval-source").innerHTML = `<span class="mark">B</span> ＋${data.reference}<span class="source-name">入力差・${data.reference}段階 ↓</span>`;
    $("voltage-source").innerHTML = `<span class="mark">A</span> ＋${data.volts} V<span class="source-name">電圧差 ↓</span>`;
  }
  function formulas(m) {
    const v = data.volts, k = data.reference, u = fmt(m.unit), f = fraction();
    const point = '<span class="source-arrow" aria-hidden="true">←</span>';
    return [
      label(`${point} 二つの対応から、それぞれの差を読む`) + line(`${term("interval", k, "入力差")}段階 ↔ ${term("voltage", v, "電圧差")} V`) + label("同じ区間の入力差Bと電圧差Aを使う"),
      line(`${term("resolution", data.bits, "分解能")}ビット → 2の${data.bits}乗＝${m.levels}通り`) + line(`最大コード：${m.levels}−1＝${m.max}`) + label(`${point} 電圧が与えられた入力はBの端点${k}。コードの範囲とは別に読む。`),
      label("↓ Cの最下位ビットは、入力1段階分") + line(`${term("interval", k, "入力差")} × ΔV ＝ ${term("voltage", v, "電圧差")} V`) + line(`1段階の入力差 ＝ ${term("bit", 1, "最下位ビットの重み")}（2の0乗）`),
      label(`${point} Aの電圧差を、Bの段階数で等分する`) + line(`${term("bit", "1 LSB", "求める最下位ビット1段階分")} ＝ ${f} <span>V ＝ ${u} V</span>`),
      label(`${point} 求めたA÷Bを、B段階分に戻すと？`) + line(`${f} × ${term("interval", k, "基準入力の段階数")} ＝ ${v} V`) + line(`↓ 試す入力：${u} × ${term("probe", code, "ビット列から得た入力")} ＝ ${fmt(m.output)} V`),
      label(`${point} AとBの対応に戻して候補を確かめる`) + line(`${term("bit", "1 LSB", "求める最下位ビット1段階分")} ＝ ${f} V`) + label(`候補 × Bの${k}段階 ＝ Aの${v} Vになるか、下の表で比較`),
    ][index];
  }
  function explain(m) {
    return [
      `「次へ」で、${data.volts} Vを何段階で割るか確認します。与えられているのは入力0と${data.reference}の電圧です。上の数値を編集して別の条件も試せます。`,
      `0も一つのコードに数えるので、${m.levels}通りの最大コードは${m.max}です。${data.reference === m.max ? "現在の条件では基準入力が最大コードと一致します。" : `現在の基準入力${data.reference}は最大コードではありません。`}コードの通り数と、二つのコード間の段階数を区別します。`,
      `最下位ビットは重み1を持ちます。入力コードの差が1のときの出力変化が1 LSBです。0から${data.reference}には${data.reference}個の間隔があります。両端のコードを含む個数（${data.reference + 1}個）では割りません。`,
      `${data.reference}段階分の電圧差が${data.volts} Vなので、1段階分は${data.volts}/${data.reference} Vです。分母はビット数そのものでも、機械的に「最大コード」や「コードの通り数」を選んだものでもありません。`,
      `1 LSBを${data.reference}回分に戻すと、与えられた${data.volts} Vと一致します。ビットの重みを押すと各桁の寄与も確認できます。`,
      `入力${data.reference}で${data.volts} Vになる候補を選びます。${changed() ? "解説内で条件を変更しています。保存された選択肢は保持しているため、一致する候補がない場合もあります。" : "一致するのは1候補です。分母だけを暗記せず、与えられた入力との対応で判断します。"}`,
    ][index];
  }
  function renderChoices(m) {
    $("choice-check").hidden = index !== 5;
    if (index !== 5) return;
    set("choice-note", changed() ? "変更した現在の条件で比較しています。問題の選択肢・回答・正答は変更しません。" : `各候補を1 LSBと仮定し、入力${data.reference}での出力を計算します。`);
    $("choice-rows").replaceChildren(...options.map(option => {
      const output = E.outputFor(option.value, data.reference), same = E.same(output, m.voltage), row = document.createElement("tr");
      if (same) row.className = "matches";
      const denominator = option.denominator, role = denominator === data.reference ? "基準入力の段階数" : denominator === m.max ? "最大コード" : denominator === m.levels ? "コードの通り数" : denominator === 2 * m.levels ? "コードの通り数の2倍" : "現在の基準入力と異なる分母";
      for (const text of [`${option.label}：${option.text}`, `${option.text} × ${data.reference} ＝ ${fmt(output)}`, `${same ? "一致" : "不一致"} ／ ${role}`]) { const cell = document.createElement("td"); cell.textContent = text; row.append(cell); }
      return row;
    }));
  }
  function render() {
    const m = E.solve(data, code); diagram(m);
    set("counter", `STEP ${index + 1} / 6`); set("step-title", headings[index]); $("formula").innerHTML = formulas(m);
    renderSelection(m);
    $("prev").disabled = index === 0; $("next").disabled = index === 5; set("next", index === 5 ? "完了" : "次へ");
    $("seek").value = index; $("seek").setAttribute("aria-valuetext", `${index + 1} / 6：${headings[index]}`); $("step-select").value = index;
    renderChoices(m); reserveDiagram(m);
  }
  // Measure all six noninteractive expressions at the actual width/font, then
  // remove the temporary measurement node. No hidden lesson panels remain.
  function reserveDiagram(m = E.solve(data, code)) {
    const area = document.querySelector(".calculation"), style = getComputedStyle(area);
    const horizontal = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    const vertical = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const probe = document.createElement("div"); probe.className = "formula-measure"; probe.setAttribute("aria-hidden", "true"); probe.inert = true;
    probe.style.width = `${area.getBoundingClientRect().width - horizontal}px`; area.append(probe);
    const savedIndex = index, savedCode = code, max = 2 ** data.bits - 1;
    const codes = new Set([0, 1, data.reference, max, max - 1, code]);
    let height = 0;
    for (const candidate of codes) {
      code = candidate;
      const state = candidate === savedCode ? m : E.solve(data, candidate);
      for (let i = 0; i < 6; i++) { index = i; probe.innerHTML = formulas(state); height = Math.max(height, probe.getBoundingClientRect().height); }
    }
    index = savedIndex; code = savedCode; probe.remove();
    const baseline = 0;
    const reserved = `${Math.ceil(Math.max(baseline, height + vertical))}px`;
    if (area.style.minHeight !== reserved) area.style.minHeight = reserved;
    // A one-bit change can wrap the decimal output on narrow screens. Reserve
    // its actual maximum for the same representative codes, without a tall card.
    const output = $("output"), measure = document.createElement("output");
    measure.className = "output-measure"; measure.setAttribute("aria-hidden", "true"); measure.inert = true;
    measure.style.width = `${output.getBoundingClientRect().width}px`; output.parentElement.append(measure);
    let outputHeight = 0;
    for (const text of ["ステップ4で計算", ...[...codes].map(candidate => `${fmt(E.solve(data, candidate).output)} V`)]) {
      measure.textContent = text; outputHeight = Math.max(outputHeight, measure.getBoundingClientRect().height);
    }
    measure.remove();
    const outputReserved = `${Math.ceil(outputHeight)}px`;
    if (output.style.minHeight !== outputReserved) output.style.minHeight = outputReserved;
  }
  function hasInvalid() { return fields.some(f => f.getAttribute("aria-invalid") === "true"); }
  function collect(event) {
    if (composition || event?.isComposing) return;
    let next, nextCode, error = "";
    fields.forEach(f => f.removeAttribute("aria-invalid"));
    const check = (id, action) => { try { return action(); } catch (e) { $(id).setAttribute("aria-invalid", "true"); error += `${$(id).getAttribute("aria-label") ?? "分解能"}：${e.message} `; } };
    const bits = check("bits", () => E.integer($("bits").value, 2, 12));
    const reference = check("reference", () => E.integer($("reference").value, 1, 2 ** (bits ?? data.bits) - 1));
    const volts = check("volts", () => E.display(E.decimal($("volts").value)));
    // Editing the known point starts the probe at that same point. Subsequent
    // bit/decimal edits explore the calibrated converter without moving it.
    const alignProbe = event?.target === $("reference") && reference !== undefined;
    nextCode = alignProbe ? reference : check("code", () => E.integer($("code").value, 0, 2 ** (bits ?? data.bits) - 1));
    $("input-error").hidden = !error; set("input-error", error ? error + "図・式・比較は直前の有効な条件です。入力を修正するか、問題の初期値に戻してください。" : "");
    if (error) return;
    if (alignProbe) $("code").value = nextCode;
    next = { bits, reference, volts };
    if (JSON.stringify(next) === JSON.stringify(data) && nextCode === code) return;
    if (selected !== null && selected >= bits) { selected = null; focus = null; }
    data = next; code = nextCode; render();
  }
  function go(i) {
    index = Math.max(0, Math.min(5, i)); focus = null; selected = null; render();
    if (index === 2) revealLsb();
  }
  function revealLsb() { const viewport = document.querySelector(".bit-viewport"); viewport.scrollLeft = viewport.scrollWidth - viewport.clientWidth; }
  function closeBit() {
    const origin = selectionOrigin;
    selected = null; focus = null; renderSelection(E.solve(data, code));
    restoringFocus = true;
    if (origin?.isConnected) origin.focus();
    else document.querySelector('#formula [data-source]')?.focus();
    restoringFocus = false;
  }
  for (let bits = 2; bits <= 12; bits++) { const option = document.createElement("option"); option.value = bits; option.textContent = bits; $("bits").append(option); }
  headings.forEach((h, i) => { const option = document.createElement("option"); option.value = i; option.textContent = `${i + 1}：${h}`; $("step-select").append(option); });
  function resetFields() { for (const key of ["bits", "reference", "volts"]) $(key).value = data[key]; $("code").value = code; }
  resetFields();
  fields.forEach(f => { f.addEventListener(f.tagName === "SELECT" ? "change" : "input", collect); f.addEventListener("compositionstart", () => { composition = true; }); f.addEventListener("compositionend", e => { composition = false; collect(e); }); });
  document.querySelector(".lesson").addEventListener("click", event => {
    const source = event.target.closest("button[data-source]");
    if (source) selectSource(source.dataset.source, source);
  });
  fields.forEach(field => field.addEventListener("focus", () => {
    if (restoringFocus) return;
    focus = { bits: "resolution", reference: "interval", volts: "voltage", code: "probe" }[field.id];
    selected = null; selectionOrigin = field; renderSelection(E.solve(data, code));
  }));
  $("prev").addEventListener("click", () => go(index - 1)); $("next").addEventListener("click", () => go(index + 1));
  $("seek").addEventListener("input", e => go(Number(e.target.value))); $("step-select").addEventListener("change", e => go(Number(e.target.value)));
  $("close-bit").addEventListener("click", closeBit);
  $("reset").addEventListener("click", () => { data = { ...initial }; code = data.reference; selected = null; focus = null; selectionOrigin = null; resetFields(); fields.forEach(f => f.removeAttribute("aria-invalid")); $("input-error").hidden = true; go(0); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && focus !== null) { event.preventDefault(); closeBit(); return; }
    if (event.target.closest("input,select,button,summary,a")) return;
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); go(index + (event.key === "ArrowLeft" ? -1 : 1)); }
  });
  if (api) { document.documentElement.dataset.theme = api.context.theme; api.onThemeChange(theme => { document.documentElement.dataset.theme = theme; }); }
  else { $("standalone-title").hidden = false; $("standalone-credit").hidden = false; window.OpenCBTDacScrollbars?.installOverlayScrollbars(document); }
  render();
  let measureFrame = 0;
  new ResizeObserver(() => {
    if (measureFrame) return;
    measureFrame = requestAnimationFrame(() => { measureFrame = 0; reserveDiagram(); });
  }).observe(document.querySelector(".lesson"));
  api?.ready();
})();
