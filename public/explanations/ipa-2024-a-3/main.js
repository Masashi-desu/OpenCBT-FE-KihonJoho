/* Managed cache hit-rate lesson UI. MIT: repository LICENSE. */
(() => {
  "use strict";
  const api = window.OpenCBTDetail, E = window.CacheEngine, $ = id => document.getElementById(id);
  const initial = E.initialState(api?.context), options = E.choices(api?.context);
  const fields = Object.fromEntries(E.keys.map(key => [key, $(key)]));
  let data = { ...initial.data }, index = 0, activeCpu = "x", invalid = false;
  const headings = ["表から4つの数値を読み取る", "ヒット率を h と置く", "CPU Xの平均時間を作る", "CPU Yの平均時間を作る", "処理時間が等しい式を立てる", "括弧を展開する", "h の項をまとめる", "移項する", "ヒット率を求める", "答えを代入して検算する"];
  const phases = ["数値の読み取り", "確率を置く", "CPU Xの式", "CPU Yの式", "平均時間の等式", "分配法則", "同類項を整理", "移項して整理", "未知数を解く", "元の式に戻す"];
  const fmt = n => String(n).replace(/^-/, "−"), r = E.display;
  const token = key => `<span class="math-token" data-key="${key}">${data[key]}</span>`;
  const memoryTerm = (memory, text) => `<span class="memory-term" data-memory="${memory}">${text}</span>`;
  const expr = cpu => `${memoryTerm("cache", `${token(cpu + "h")} × h`)} ＋ ${memoryTerm("main", `${token(cpu + "m")} × (1−h)`)}`;
  const averageGuide = () => `<section class="formula-guide" aria-label="平均アクセス時間の公式の解説"><h3>公式の見方</h3><p>${memoryTerm("cache", "ヒット時の時間 × h")} ＋ ${memoryTerm("main", "ミス時の時間 × (1−h)")}</p><p>hはヒット率、1−hはミス率。各時間を割合で重み付けした平均です。</p></section>`;
  const line = (text, cls = "") => `<div class="formula-line ${cls}">${text}</div>`;
  const label = text => `<span class="expr-label">${text}</span>`;
  const term = n => n < 0 ? ` − ${-n}h` : n > 0 ? ` ＋ ${n}h` : "";
  const equal = line("＝", "big equals");
  const title = (id, text) => { $(id).textContent = text; };
  function explanations(m) {
    const common = [
      "キャッシュメモリはヒット時、主記憶はミス時の時間です。図・表・式の同じ色を対応させて読みます。",
      "hは両CPUに共通のヒット率です。ヒットとミスを合わせた割合は1なので、ミス率は1−hです。0≦h≦1の範囲で考えます。",
      `CPU Xの平均は、ヒット時の${data.xh}nsにh、ミス時の${data.xm}nsに1−hを掛けた重み付き平均です。`,
      `CPU Yにも同じhを使い、${data.yh}nsと${data.ym}nsをヒット率・ミス率で重み付けします。`,
      "同じプログラムを実行し、アクセス時間以外の条件は同じです。処理時間が等しいという条件から、両CPUの平均アクセス時間を等号で結びます。",
      `${data.xm}(1−h)＝${data.xm}−${data.xm}h、${data.ym}(1−h)＝${data.ym}−${data.ym}hと展開します。符号に注意します。`,
      `hの係数はCPU Xで${data.xh}−${data.xm}＝${fmt(m.left)}、CPU Yで${data.yh}−${data.ym}＝${fmt(m.right)}です。`,
      `hの項を左、定数を右へ移します。係数は(${fmt(m.left)})−(${fmt(m.right)})＝${fmt(m.coefficient)}、定数は${data.ym}−${data.xm}＝${fmt(m.constant)}です。`,
    ];
    const result = m.kind === "unique" ? `両辺を${fmt(m.coefficient)}で割るとh＝${r(m.h, 2)}（${r(m.percent)}%）です。0〜1に収まるので、ヒット率として成立します。` :
      m.kind === "any" ? "0h＝0なので、0〜100%のすべてのヒット率で一致します。この条件だけではhを一つに決められません。" :
      m.kind === "none" ? `0h＝${fmt(m.constant)}は矛盾します。両CPUの平均アクセス時間が等しくなるヒット率はありません。` :
      `数式上はh＝${r(m.h)}ですが、0〜1の範囲外なのでヒット率として成立しません。`;
    common.push(result, m.kind === "unique" ? `ヒット率${r(m.h, 2)}とミス率${r(m.miss)}を元の式に戻すと、両CPUとも${r(m.xavg)}nsです。条件が一致することを検算できました。` :
      m.kind === "any" ? "例としてh＝0.5を代入しています。どのヒット率でも一致するため、0.5だけが正答ではありません。" : "0〜100%で一致する解がないため、成立するヒット率の検算はできません。表の数値を変更するか、問題の初期値へ戻して比較できます。");
    return common[index];
  }
  function markup(m) {
    if (index === 0) return ["x", "y"].map(cpu => line(label(`CPU ${cpu.toUpperCase()}`) + `${token(cpu + "h")} ns（ヒット） ／ ${token(cpu + "m")} ns（ミス）`)).join("");
    if (index === 1) return line(label("ヒット率") + "h", "big") + line(label("ミス率") + "1 − h", "big") + line("h ＋ (1−h) ＝ 1", "small");
    if (index === 2) return line(label("CPU Xの平均アクセス時間（ns）") + `T<sub>X</sub> ＝ ${expr("x")}`) + averageGuide();
    if (index === 3) return line(`CPU X：${memoryTerm("cache", `${data.xh}h`)} ＋ ${memoryTerm("main", `${data.xm}(1−h)`)}`, "small muted") + line(label("CPU Yの平均アクセス時間（ns）") + `T<sub>Y</sub> ＝ ${expr("y")}`) + averageGuide();
    if (index === 4) return line(label("CPU X") + expr("x")) + equal + line(label("CPU Y") + expr("y"));
    if (index === 5) return line(`${token("xh")}h ＋ ${token("xm")} − ${token("xm")}h`) + equal + line(`${token("yh")}h ＋ ${token("ym")} − ${token("ym")}h`);
    if (index === 6) return line(`${data.xm}${term(m.left)}`, "big") + equal + line(`${data.ym}${term(m.right)}`, "big");
    if (index === 7) return line(`${data.xm}${term(m.left)} ＝ ${data.ym}${term(m.right)}`, "small muted") + line(`${fmt(m.coefficient)}h ＝ ${fmt(m.constant)}`, "big");
    if (index === 8) {
      const equation = line(`${fmt(m.coefficient)}h ＝ ${fmt(m.constant)}`);
      if (m.kind === "unique") return equation + line(`h ＝ ${fmt(m.constant)} ÷ (${fmt(m.coefficient)})`) + `<div class="answer">h ＝ ${r(m.h, 2)}（${r(m.percent)}%）</div>`;
      if (m.kind === "outside") return equation + line(`h ＝ ${r(m.h)}`) + '<p class="warning">0〜1の範囲外です</p>';
      return equation + `<p class="${m.kind === "any" ? "answer" : "warning"}">${m.kind === "any" ? "すべてのヒット率で一致" : "一致するヒット率なし"}</p>`;
    }
    if (m.kind === "unique") {
      const verification = ["x", "y"].map(cpu => `<div class="verify-row"><strong>CPU ${cpu.toUpperCase()}</strong><br>${memoryTerm("cache", `${token(cpu + "h")} × (${r(m.h)})`)} ＋ ${memoryTerm("main", `${token(cpu + "m")} × (${r(m.miss)})`)}<br>＝ <strong>${r(cpu === "x" ? m.xavg : m.yavg)} ns</strong></div>`).join("");
      return verification + `<div class="ratio" aria-hidden="true"><span class="ratio-hit" style="width:${Number(m.h.n) / Number(m.h.d) * 100}%"></span></div><div class="ratio-label"><span class="memory-name" data-memory="cache">ヒット ${r(m.percent)}%</span><span class="memory-name" data-memory="main">ミス ${r(E.ratio((m.h.d - m.h.n) * 100n, m.h.d))}%</span></div>`;
    }
    if (m.kind === "any") return line("例：h＝0.5 のとき") + line(`CPU X：${r(E.average(data.xh, data.xm, E.ratio(1, 2)))} ns<br>CPU Y：${r(E.average(data.yh, data.ym, E.ratio(1, 2)))} ns`) + '<p class="muted">すべてのヒット率で一致します</p>';
    return '<p class="warning">0〜100%の範囲に、一致するヒット率はありません。</p>';
  }
  function chosenKeys() { return [0, 4, 5, 9].includes(index) ? ["xh", "xm", "yh", "ym"] : index === 2 ? ["xh", "xm"] : index === 3 ? ["yh", "ym"] : []; }
  function renderCpu() {
    title("arch-cpu", activeCpu.toUpperCase());
    for (const [id, key, name] of [["arch-cache-time", activeCpu + "h", "キャッシュ"], ["arch-main-time", activeCpu + "m", "主記憶"]]) {
      title(id, `${data[key]} ns ↗`); $(id).dataset.focus = key; $(id).setAttribute("aria-label", `CPU ${activeCpu.toUpperCase()}の${name}時間 ${data[key]}nsを表で編集`);
    }
    document.querySelectorAll("[data-cpu]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.cpu === activeCpu)));
  }
  function renderChoices() {
    $("choice-check").hidden = index !== 9;
    if (index !== 9) return;
    const changed = ["xh", "xm", "yh", "ym"].some(key => data[key] !== initial.data[key]);
    title("choice-note", changed ? "現在のアクセス時間での比較です。問題の選択肢は保持していますが、元の正答とは一致しない場合があります。" : "両CPUの平均アクセス時間が等しい選択肢を確認します。");
    $("choice-rows").replaceChildren(...options.map(option => {
      const x = E.average(data.xh, data.xm, option.h), y = E.average(data.yh, data.ym, option.h), same = x.n * y.d === y.n * x.d;
      const row = document.createElement("tr"); if (same) row.className = "matches";
      for (const text of [`${option.label}：${r(option.h, 2)}`, r(x), r(y), same ? "一致" : "不一致"]) { const td = document.createElement("td"); td.textContent = text; row.append(td); }
      return row;
    }));
  }
  function render() {
    const m = E.solve(data), keys = chosenKeys();
    title("counter", `STEP ${String(index + 1).padStart(2, "0")} / 10`); title("step-title", headings[index]); title("phase", phases[index]);
    $("formula-box").innerHTML = markup(m); title("ex-title", `ステップ${index + 1}：${headings[index]}`); title("explain", explanations(m));
    $("prev").disabled = index === 0; $("next").disabled = index === 9; title("next", index === 9 ? "完了" : "次へ");
    $("seek").value = index; $("seek").setAttribute("aria-valuetext", `${index + 1} / 10：${headings[index]}`); $("step-select").value = index;
    document.querySelectorAll("[data-cell]").forEach(cell => cell.classList.toggle("highlighted", keys.includes(cell.dataset.cell)));
    renderCpu(); renderChoices();
  }
  function go(i) { index = Math.max(0, Math.min(9, i)); if (index === 2) activeCpu = "x"; if (index === 3) activeCpu = "y"; render(); }
  function collect(event) {
    if (event?.isComposing) return;
    const values = {}, errors = [];
    for (const [key, field] of Object.entries(fields)) {
      try { values[key] = E.integer(field.value, key); field.removeAttribute("aria-invalid"); }
      catch { field.setAttribute("aria-invalid", "true"); errors.push(field.getAttribute("aria-label")); }
    }
    invalid = errors.length > 0; $("input-error").hidden = !invalid;
    title("input-error", invalid ? `${errors.join("、")}を確認してください。アクセス時間は0〜100000000、容量は1〜100000000の整数です。図・式・比較は直前の有効な入力を保持しています。修正するか「問題の初期値に戻す」で戻せます。` : "");
    if (invalid) return;
    if (E.keys.some(key => values[key] !== data[key])) { data = values; render(); }
  }
  headings.forEach((heading, i) => { const option = document.createElement("option"); option.value = i; option.textContent = `${i + 1}：${heading}`; $("step-select").append(option); });
  for (const [key, field] of Object.entries(fields)) { field.value = data[key]; field.addEventListener("input", collect); field.addEventListener("compositionend", collect); }
  document.querySelectorAll("[data-cpu]").forEach(button => button.addEventListener("click", () => { activeCpu = button.dataset.cpu; renderCpu(); }));
  document.querySelectorAll(".time-link").forEach(button => button.addEventListener("click", () => { const field = fields[button.dataset.focus]; field.focus(); field.select(); }));
  $("prev").addEventListener("click", () => go(index - 1)); $("next").addEventListener("click", () => go(index + 1));
  $("seek").addEventListener("input", event => go(Number(event.target.value))); $("step-select").addEventListener("change", event => go(Number(event.target.value)));
  $("reset").addEventListener("click", () => { data = { ...initial.data }; for (const [key, field] of Object.entries(fields)) { field.value = data[key]; field.removeAttribute("aria-invalid"); } invalid = false; $("input-error").hidden = true; activeCpu = "x"; go(0); });
  document.addEventListener("keydown", event => { if (event.target.closest("input,button,select,summary,a")) return; if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); go(index + (event.key === "ArrowLeft" ? -1 : 1)); } });
  if (api) { document.documentElement.dataset.theme = api.context.theme; api.onThemeChange(theme => { document.documentElement.dataset.theme = theme; }); }
  else { $("standalone-title").hidden = false; $("standalone-credit").hidden = false; window.OpenCBTCacheScrollbars?.installOverlayScrollbars(document); }
  render(); api?.ready();
})();
