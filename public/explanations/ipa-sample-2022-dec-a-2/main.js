(() => {
  "use strict";
  const E = window.BinaryEngine, api = window.OpenCBTDetail, $ = id => document.getElementById(id);
  const initial = E.initial(api?.context), choices = E.choices(api?.context);
  let { width, input, option } = initial, model = E.trace(input, width, option), position = 0, selected = null;
  if (api) { document.documentElement.dataset.theme = api.context.theme; api.onThemeChange(theme => { document.documentElement.dataset.theme = theme; }); }
  else { $("standalone-title").hidden = false; $("standalone-credit").hidden = false; window.OpenCBTBinaryScrollbars?.installOverlayScrollbars(document); }
  $("input-help").textContent = `jは1〜${E.maximum(width)}。13は解説用の例です。有効な入力と選択肢の変更で最初に戻ります。`;
  $("option").replaceChildren(...choices.map(c => new Option(c.label, String(c.index))));
  $("option").value = String(option); $("input-j").value = String(input);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const label = (x, y, text, cls = "", anchor = "middle") => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(text)}</text>`;
  function node(id, y, text, shape) {
    const s = model.states[position], current = id === s.phase;
    return `<g role="button" tabindex="0" data-node="${id}" aria-label="${esc(text)}" aria-pressed="${selected === id}" class="${current ? "current" : ""} ${selected === id ? "selected" : ""}">${shape ?? `<rect class="shape" x="76" y="${y}" width="324" height="48"/>`}${label(238, y + 30, text)}${current ? label(52, y + 30, "▶") : ""}</g>`;
  }
  function draw() {
    const s = model.states[position], a = s.action, ops = E.operations[option];
    let svg = '<defs><marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path class="arrow" d="M0 0L8 4L0 8Z"/></marker></defs>';
    svg += '<path class="wire" d="M238 48V438" marker-end="url(#arrow)"/><path class="wire" d="M400 388H430V132H400" marker-end="url(#arrow)"/>';
    svg += node("start", 6, "開始", '<rect class="shape" x="151" y="6" width="174" height="44" rx="22"/>');
    svg += node("input", 65, `jを入力：${input}`);
    svg += node("loop", 130, `変換　k：1，1，${width}`, '<path class="shape" d="M90 130H386L400 144V182H76V144Z"/>');
    svg += node("a", 212, `a　${ops[0]}`);
    svg += node("b", 294, `b　${ops[1]}`);
    svg += node("repeat", 366, "変換（ループ端）", '<path class="shape" d="M76 366H400V402L386 416H90L76 402Z"/>');
    svg += node("end", 434, "終了", '<rect class="shape" x="151" y="434" width="174" height="44" rx="22"/>');
    svg += label(444, 272, "繰返し", "small", "start");
    svg += label(667, 48, `現在のj ＝ ${s.j}`, "value") + label(667, 80, s.k ? `k ＝ ${s.k} ／ ${width}` : "まだループに入っていません", "small");
    if (s.phase === "end") {
      svg += label(667, 148, model.validBits ? `上位から読むと ${model.output}` : "0・1以外の値があります", "value");
      svg += label(667, 184, model.validBits ? `10進数では ${model.decoded} ${model.matches ? "＝" : "≠"} ${input}` : "2進数の1桁には0又は1を使います", "small");
      svg += label(667, 255, model.matches ? "入力と一致：変換完了" : "入力を復元できません", "value emphasis");
      svg += label(667, 289, model.matches ? "余りを先に保存し、商を次のjにする" : "a・bの代入先と処理順を見直す", "small");
      svg += label(667, 367, "「戻る」で処理を見比べる");
      svg += label(667, 401, "入力や選択肢を変えてもう一度試せます", "small");
    } else {
      svg += label(667, 148, a ? `${a.before} ÷ 2 ＝ ${a.quotient} 余り ${a.remainder}` : "j ＝ 2 × 商 ＋ 余り", "value");
      svg += label(667, 184, a ? `${a.mod ? "mod：余り" : "div：商の整数部分"}を使う` : "div は商の整数部分、mod は余り", "small");
      svg += label(667, 255, a ? `${a.store ? `NISHIN(${s.k})` : "j"} ← ${a.result}` : "a → b の順で実行", "value emphasis");
      svg += label(667, 289, a ? (a.store ? "↓ 配列の1要素に格納" : `j：${a.before} → ${a.result}`) : "「次へ」で一つずつ確かめる", "small");
      svg += label(667, 367, "配列は下位の桁から埋まる");
      svg += label(667, 401, "通常の2進表記は配列を逆順に読む", "small");
    }
    svg += label(76, 514, "NISHIN：左が下位桁 → 右が上位桁", "", "start");
    for (let i = 0; i < width; i++) {
      const id = `cell-${i}`, x = 76 + i * 102, value = s.cells[i], changed = a?.store && a.index === i + 1;
      svg += `<g role="button" tabindex="0" data-node="${id}" aria-label="NISHIN(${i + 1})：${value ?? "未格納"}、重み${2 ** i}" aria-pressed="${selected === id}" class="${changed ? "changed" : ""} ${value > 1 ? "invalid" : ""} ${selected === id ? "selected" : ""}"><rect class="shape" x="${x}" y="528" width="88" height="48"/>${label(x + 44, 560, value ?? "—", "value")}${label(x + 44, 600, `(${i + 1}) ×${2 ** i}`, "small")}</g>`;
    }
    const focused = document.activeElement?.dataset.node;
    $("scene").innerHTML = svg;
    if (focused) $("scene").querySelector(`[data-node="${focused}"]`)?.focus({ preventScroll: true });
    $("seek").max = String(model.states.length - 1); $("seek").value = String(position);
    $("prev").disabled = position === 0; $("next").disabled = position === model.states.length - 1;
    $("counter").textContent = `${position + 1} / ${model.states.length} ステップ`;
    $("next-step").textContent = model.states[position + 1] ? `次：${model.states[position + 1].title}` : "完了。戻る・入力変更で確かめられます。";
    $("step-title").textContent = s.title; $("step-text").textContent = s.text;
    showSelection();
  }
  function showSelection() {
    $("selection").hidden = selected === null;
    if (!selected) return;
    const s = model.states[position]; let title, text;
    if (selected.startsWith("cell-")) {
      const i = Number(selected.slice(5)), v = s.cells[i]; title = `NISHIN(${i + 1})：重み2の${i}乗＝${2 ** i}`;
      text = v === null ? "まだ値を格納していません。「次へ」でこの要素に書き込むところまで進められます。" : v > 1 ? `${v}は0又は1ではないため、2進数の1桁として扱えません。選択肢の処理を確認してください。` : `${v} × ${2 ** i} ＝ ${v * 2 ** i}。通常の2進表記ではNISHIN(${width})から逆順に読み、各要素×重みを足すと10進数へ戻せます。`;
    } else {
      title = {start:"開始",input:"jの入力",loop:"ループの開始",a:`a：${E.operations[option][0]}`,b:`b：${E.operations[option][1]}`,repeat:"ループ端",end:"終了"}[selected];
      text = selected === "a" || selected === "b" ? "aの後にbを実行します。bはaで更新された後のjを使います。右側の除算と、実行後のj・配列を見比べてください。" : selected === "loop" || selected === "repeat" ? `kは1から${width}まで1ずつ増えます。j＝0になっても繰返しを終えず、残りの配列要素にも値を格納します。` : selected === "input" ? `この問題の入力域は1〜${E.maximum(width)}、出力は${width}桁です。現在の${input}は解説用に選んだ例で、問題に固定された入力ではありません。` : selected === "end" ? "全ての桁を格納してから終了します。一つの入力でたまたま正しく動くことと、全入力で正しい処理であることは区別します。" : "10進整数を、余りと商に分けて2進数へ変換する処理を追跡します。";
    }
    $("selection-title").textContent = title; $("selection-text").textContent = text;
  }
  function close() { const from = selected; selected = null; draw(); if (from) $("scene").querySelector(`[data-node="${from}"]`)?.focus({ preventScroll: true }); }
  function move(value) { position = Math.max(0, Math.min(model.states.length - 1, value)); draw(); }
  function configure(event) {
    if (event?.isComposing) return;
    let value;
    try { value = E.integer($("input-j").value, width); }
    catch (error) { $("input-error").hidden = false; $("input-error").textContent = error.message; $("input-j").setAttribute("aria-invalid", "true"); $("option").value = String(option); return; }
    $("input-error").hidden = true; $("input-j").removeAttribute("aria-invalid");
    const nextOption = Number($("option").value);
    if (value === input && nextOption === option) return;
    input = value; option = nextOption; model = E.trace(input, width, option); position = 0; selected = null; draw();
  }
  $("input-j").addEventListener("input", configure); $("input-j").addEventListener("compositionend", configure);
  $("option").addEventListener("change", configure);
  $("prev").addEventListener("click", () => move(position - 1)); $("next").addEventListener("click", () => move(position + 1));
  $("seek").addEventListener("input", event => move(Number(event.target.value)));
  $("reset").addEventListener("click", () => { $("input-j").value = String(input); $("input-error").hidden = true; $("input-j").removeAttribute("aria-invalid"); selected = null; move(0); });
  $("close-selection").addEventListener("click", close);
  $("scene").addEventListener("click", event => { const node = event.target.closest("[data-node]"); if (node) { if (selected === node.dataset.node) close(); else { selected = node.dataset.node; draw(); } } });
  $("scene").addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); event.target.closest("[data-node]")?.dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && selected) { close(); return; } if (event.target.closest("input,select,button,summary")) return; if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(position + (event.key === "ArrowLeft" ? -1 : 1)); } });
  draw(); api?.ready();
})();
