/* Managed development effort lesson. MIT: repository LICENSE. */
(() => {
  "use strict";
  const E = window.EffortEngine, api = window.OpenCBTDetail, $ = id => document.getElementById(id);
  const initial = E.initialState(api?.context), choices = E.choices(api?.context);
  const headings = ["表の本数と1本当たり工数を読む", "入力処理の工数を求める", "出力処理の工数を求める", "計算処理の工数を求める", "コーディング工数を合計する", "設計・テストを加える", "開発日数で割り、人数を切り上げる", "1人少ない場合と検算する"];
  let data = { ...initial }, model = E.solve(data), position = 0, selected = null, sourceElement = null, sourceIndex = null, restoring = false;
  const token = (key, value) => `<button type="button" data-source="${key}" aria-pressed="${selected === key}">${key}：${value}</button>`;
  if (api) { document.documentElement.dataset.theme = api.context.theme; api.onThemeChange(theme => { document.documentElement.dataset.theme = theme; }); }
  else { $("standalone-title").hidden = false; $("standalone-credit").hidden = false; window.OpenCBTEffortScrollbars?.installOverlayScrollbars(document); }
  $("programs").innerHTML = E.names.map((name, i) => `<tr data-group="${"ABC"[i]}"><th scope="row"><button type="button" data-source="${"ABC"[i]}">${"ABC"[i]} ${name}</button></th><td><input id="count${i}" type="text" inputmode="numeric" aria-label="${name}の本数" aria-describedby="input-help input-error"></td><td><input id="unit${i}" type="text" inputmode="numeric" aria-label="${name}の1本当たり工数（人日）" aria-describedby="input-help input-error"></td><td><span class="row-result" id="row${i}"></span></td></tr>`).join("");
  $("step-select").replaceChildren(...headings.map((title, i) => new Option(`${i + 1}. ${title}`, String(i))));
  const fields = Object.fromEntries(E.keys.map(k => [k, $(k)]));
  function formulas(step) {
    const m = model, d = m.data;
    if (!step) return '<p class="math-label">「次へ」で、処理ごとに 本数 × 1本当たり工数 を計算します。</p>';
    if (step < 4) { const i = step - 1, r = m.rows[i]; return `<p class="math-label">${E.names[i]}の本数 × 1本当たり工数</p><p>${token("ABC"[i], r.count)} 本 × ${token("ABC"[i], r.unit)} 人日／本 ＝ ${token("ABC"[i], r.effort)} 人日</p>`; }
    if (step === 4) return `<p class="math-label">3種類の工数を足す</p><p>${token("A", m.rows[0].effort)} ＋ ${token("B", m.rows[1].effort)} ＋ ${token("C", m.rows[2].effort)} ＝ ${token("D", m.coding)} 人日</p>`;
    if (step === 5) return `<p>${token("D", m.coding)} 人日 × ${token("E", d.other + "倍")} ＝ ${token("E", m.extra)} 人日</p><p>${token("D", m.coding)} ＋ ${token("E", m.extra)} ＝ ${token("F", m.total)} 人日</p>`;
    if (step === 6) return `<p class="math-label">総工数 ÷ 開発日数（人数は整数に切り上げ）</p><p>${token("F", m.total)} 人日 ÷ ${token("G", d.days)} 日 ${m.remainder ? `＝ (${m.whole} ＋ ${m.remainder}/${d.days}) 人 → ` : "＝ "}${token("H", m.people)} 人</p>`;
    return `<p>${m.people - 1} 人 × ${token("G", d.days)} 日 ＝ ${m.lower} 人日 ＜ ${token("F", m.total)} 人日</p><p>${token("H", m.people)} 人 × ${token("G", d.days)} 日 ＝ ${m.capacity} 人日 ≧ ${token("F", m.total)} 人日</p>`;
  }
  function explanations() {
    const m = model, d = m.data;
    return [
      "表の本数と、1本をコーディングする工数を掛けます。同じA・B・Cの記号を図と式で対応させてください。数値は直接編集できます。",
      ...m.rows.map((r, i) => `${"ABC"[i]}の${r.name}は${r.count}本で、1本に${r.unit}人日掛かるので、${r.count}×${r.unit}＝${r.effort}人日です。${i < 2 ? "次は次の処理を計算します。" : "これで3種類の工数が揃いました。"}`),
      `Dは表のA・B・Cの工数を合計した${m.coding}人日です。本文の開発日数G＝${d.days}日とは単位も役割も異なります。`,
      `Eの設計・テストはDの${d.other}倍で${m.extra}人日です。D自身の1倍分も含め、Fの総工数は${m.coding}×(1＋${d.other})＝${m.total}人日となります。`,
      m.remainder ? `${m.total}÷${d.days}は${m.whole}余り${m.remainder}です。${m.whole}人では${m.remainder}人日分が残るので、もう1人必要です。最少要員Hは${m.people}人です。余りは人数ではなく、まだ確保できない工数です。` : `${m.total}÷${d.days}＝${m.people}と割り切れるので、最少要員Hは${m.people}人です。割り切れた場合はもう1人を加えません。`,
      `${m.people - 1}人では${m.shortage}人日不足し、${m.people}人なら${m.capacity}人日を確保できます。${m.surplus ? `総工数を${m.surplus}人日上回ります。` : "総工数にちょうど一致します。"}1人少ないと足りないので、${m.people}人が最少です。`,
    ];
  }
  function selectionText(key) {
    const m = model, d = m.data, i = "ABC".indexOf(key);
    if (i >= 0) { const r = m.rows[i]; return [`${key} ${r.name}の数値`, `元の表の「本数」${r.count}本と「1本当たり工数」${r.unit}人日です。この行を掛けると${r.effort}人日。合計Dの一部になります。`]; }
    return {
      D: ["D コーディング合計", `表のA・B・Cから、${m.rows.map(r => r.effort).join("＋")}＝${m.coding}人日です。Eの倍率を掛ける基準はこの作業量で、開発日数Gの${d.days}日ではありません。`],
      E: ["E 追加する設計・テスト", `本文の「コーディング所要工数の${d.other}倍」に対応します。Dの${m.coding}人日×${d.other}＝${m.extra}人日。総工数Fを求めるには、コーディング分Dを別に加えます。`],
      F: ["F 全工程の総工数", `Dの${m.coding}人日とEの${m.extra}人日を足した${m.total}人日です。これをGの${d.days}日で分担します。`],
      G: ["G 本文の開発日数", `全体を${d.days}日間で開発するという期限です。1人が確保できる工数は${d.days}人日なので、総工数Fをこの日数で割って人数を求めます。`],
      H: ["H 必要な最少の整数人数", `${m.total}人日÷${d.days}日から${m.people}人を得ます。${m.people - 1}人では${m.shortage}人日不足することまで確かめると、最少と判断できます。`],
    }[key];
  }
  function reserveFormula() {
    // Measure all finite stages at the actual width/font; explanation stays in normal flow.
    const probe = document.createElement("div"); probe.className = "formula"; probe.inert = true; probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = `position:absolute;visibility:hidden;width:${$("formula").getBoundingClientRect().width}px;min-height:0;pointer-events:none`;
    $("diagram").append(probe); let max = 0;
    for (let i = 0; i < 8; i++) { probe.innerHTML = formulas(i); max = Math.max(max, probe.getBoundingClientRect().height); }
    probe.remove(); $("formula").style.minHeight = Math.ceil(max) + "px";
  }
  function draw() {
    const m = model;
    m.rows.forEach((r, i) => { $("row" + i).textContent = position > i ? `${r.effort} 人日` : "— 人日"; });
    $("coding-value").textContent = position >= 4 ? `${m.coding} 人日` : "— 人日";
    $("extra-value").textContent = position >= 5 ? `${m.extra} 人日` : "— 人日";
    $("total-value").textContent = position >= 5 ? `${m.total} 人日` : "— 人日";
    $("people-value").textContent = position >= 6 ? `${m.people} 人` : "— 人";
    $("coding-bar").style.width = `${100 / (1 + data.other)}%`; $("extra-bar").style.width = `${100 * data.other / (1 + data.other)}%`;
    $("coding-bar").setAttribute("aria-label", `コーディング1倍分`); $("extra-bar").setAttribute("aria-label", `設計・テスト${data.other}倍分`);
    const focused = document.activeElement?.closest("#formula [data-source]"), focusedKey = focused?.dataset.source, ordinal = focused ? [...$("formula").querySelectorAll(`[data-source=${focusedKey}]`)].indexOf(focused) : -1;
    $("formula").innerHTML = formulas(position);
    if (focused) $("formula").querySelectorAll(`[data-source=${focusedKey}]`)[ordinal]?.focus({ preventScroll: true });
    const active = position === 0 ? [] : position < 4 ? ["ABC"[position - 1]] : position === 4 ? ["A", "B", "C", "D"] : position === 5 ? ["D", "E", "F"] : ["F", "G", "H"];
    document.querySelectorAll("[data-group]").forEach(el => { el.classList.toggle("active", active.includes(el.dataset.group)); el.classList.toggle("selected", selected === el.dataset.group); });
    document.querySelectorAll("[data-source]").forEach(el => el.setAttribute("aria-pressed", String(selected === el.dataset.source)));
    $("counter").textContent = `${position + 1} / 8 ステップ`;
    $("seek").value = $("step-select").value = String(position); $("prev").disabled = position === 0; $("next").disabled = position === 7;
    const [title, text] = selected ? selectionText(selected) : [headings[position], explanations()[position]];
    $("step-title").textContent = title; $("step-text").textContent = text; $("close-selection").hidden = !selected;
    $("capacity-check").hidden = position !== 7;
    const max = m.capacity;
    $("capacities").innerHTML = [m.people - 1, m.people].map(p => { const cap = p * data.days; return `<div class="capacity-row"><p><strong>${p}人</strong> × ${data.days}日 ＝ ${cap}人日 ／ 必要な工数 ${m.total}人日</p><div class="capacity-track" aria-hidden="true"><div class="capacity-fill ${cap < m.total ? "short" : "enough"}" style="width:${cap / max * 100}%"></div></div><p>${cap < m.total ? `${m.total - cap}人日不足` : m.surplus ? `${m.surplus}人日余る（最少）` : "ちょうど足りる（最少）"}</p></div>`; }).join("");
    const changed = E.keys.some(k => data[k] !== initial[k]);
    $("multiplier-rule").textContent = `「設計・テストがコーディングの${data.other}倍」は追加分の倍率です。コーディング自身の1倍分を加えて、全体は${data.other + 1}倍になります。`;
    $("choice-note").textContent = changed ? "解説内で変更した条件での比較です。問題の選択肢は元のままなので、最少人数が選択肢にない場合もあります。" : "この問題の条件と表示順で比較します。「足りる」だけでなく「最少」を確認します。";
    $("comparison").replaceChildren(...choices.map(c => { const r = E.compare(m, c.value), div = document.createElement("div"); div.className = "choice-row"; div.textContent = `${c.label}：${c.value}人 × ${data.days}日 ＝ ${r.capacity}人日。${r.kind === "short" ? `${-r.difference}人日不足` : r.kind === "minimum" ? `最少（${r.difference ? r.difference + "人日余る" : "ちょうど足りる"}）` : `足りるが最少ではない（最少は${m.people}人）`}`; return div; }));
  }
  function clear(restore = true) {
    const origin = sourceElement, key = selected, ordinal = sourceIndex; selected = null; sourceElement = null; sourceIndex = null; draw();
    if (restore && key) { restoring = true; const el = ordinal !== null ? $("formula").querySelectorAll(`[data-source=${key}]`)[ordinal] : origin; el?.focus({ preventScroll: true }); restoring = false; }
  }
  function move(value) { position = Math.max(0, Math.min(7, value)); selected = null; sourceElement = null; sourceIndex = null; draw(); }
  function select(key, origin) { if (selected === key) clear(); else { selected = key; sourceElement = origin; sourceIndex = origin.closest("#formula") ? [...$("formula").querySelectorAll(`[data-source=${key}]`)].indexOf(origin) : null; draw(); } }
  $("diagram").addEventListener("click", event => { const el = event.target.closest("[data-source]"); if (el) select(el.dataset.source, el); });
  $("close-selection").addEventListener("click", () => clear());
  document.addEventListener("keydown", event => { if (event.key === "Escape" && selected) { event.preventDefault(); clear(); } });
  for (const [key, field] of Object.entries(fields)) {
    field.value = String(data[key]);
    field.addEventListener("focus", () => { if (restoring) return; selected = key === "days" ? "G" : key === "other" ? "E" : "ABC"[Number(key.at(-1))]; sourceElement = field; sourceIndex = null; draw(); });
    const update = () => {
      const raw = Object.fromEntries(E.keys.map(k => [k, fields[k].value]));
      try {
        const next = E.settings(raw); $("input-error").hidden = true; Object.values(fields).forEach(f => f.removeAttribute("aria-invalid"));
        if (E.keys.every(k => next[k] === data[k])) return;
        data = next; model = E.solve(data); reserveFormula(); draw();
      } catch (error) {
        for (const k of E.keys) { try { E.integer(raw[k], k === "other" ? 0 : 1, k === "other" ? 20 : k === "days" ? 9999 : 999); fields[k].removeAttribute("aria-invalid"); } catch { fields[k].setAttribute("aria-invalid", "true"); } }
        $("input-error").textContent = `${error.message} 図と計算は直前の有効な値を保持しています。入力を修正するか「問題の初期値に戻す」を選んでください。`; $("input-error").hidden = false;
      }
    };
    field.addEventListener("input", event => { if (!event.isComposing) update(); }); field.addEventListener("compositionend", update);
  }
  $("prev").addEventListener("click", () => move(position - 1)); $("next").addEventListener("click", () => move(position + 1));
  $("seek").addEventListener("input", () => move(Number($("seek").value))); $("step-select").addEventListener("change", () => move(Number($("step-select").value)));
  $("reset").addEventListener("click", () => { data = { ...initial }; model = E.solve(data); E.keys.forEach(k => { fields[k].value = String(data[k]); fields[k].removeAttribute("aria-invalid"); }); $("input-error").hidden = true; reserveFormula(); move(0); });
  for (const name of ["compare", "rules"]) $(name + "-toggle").addEventListener("click", () => { const open = $(name).hidden; for (const id of ["compare", "rules"]) { $(id).hidden = id !== name || !open; $(id + "-toggle").setAttribute("aria-expanded", String(id === name && open)); } });
  let measureFrame = 0;
  new ResizeObserver(() => {
    if (!measureFrame) measureFrame = requestAnimationFrame(() => { measureFrame = 0; reserveFormula(); });
  }).observe($("diagram"));
  new MutationObserver(() => reserveFormula()).observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
  draw(); reserveFormula(); document.fonts.ready.then(reserveFormula); api?.ready();
})();
