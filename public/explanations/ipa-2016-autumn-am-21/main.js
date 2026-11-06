/* Managed seven-segment LED lesson. MIT: repository LICENSE. */
(() => {
  "use strict";
  const E = window.LedEngine, api = window.OpenCBTDetail, $ = id => document.getElementById(id);
  const initial = E.initial(api?.context), choices = E.choices(api?.context);
  const field = $("hex");
  let byte = initial, step = 0, compared = null, composing = false;
  const points = [
    "20,0 80,0 88,8 80,16 20,16 12,8", "84,18 92,10 100,18 100,72 92,80 84,72",
    "84,92 92,84 100,92 100,146 92,154 84,146", "20,148 80,148 88,156 80,164 20,164 12,156",
    "0,92 8,84 16,92 16,146 8,154 0,146", "0,18 8,10 16,18 16,72 8,80 0,72",
    "20,74 80,74 88,82 80,90 20,90 12,82",
  ];
  function face(mask) {
    const attrs = (label, i) => `class="segment" data-segment="${label}" data-state="${mask === null ? "pending" : mask & (1 << i) ? "on" : "off"}"`;
    return `<svg class="led-face" viewBox="-3 -3 135 170" aria-hidden="true">${points.map((p, i) => `<polygon ${attrs(E.labels[i], i)} points="${p}"/>`).join("")}<circle ${attrs("Dt", 7)} cx="118" cy="154" r="8"/></svg>`;
  }
  const name = segment => segment === "Dt" ? "Dt（小数点）" : segment;
  const status = on => on === null ? "未判定" : on ? "点灯" : "消灯";
  if (api) {
    document.documentElement.dataset.theme = api.context.theme;
    api.setPresentation("led");
    api.onThemeChange(theme => { document.documentElement.dataset.theme = theme; });
  } else {
    $("standalone-title").hidden = $("standalone-credit").hidden = false;
    window.OpenCBTLedScrollbars?.installOverlayScrollbars(document);
  }
  $("bits").innerHTML = ["上位", "下位"].map((part, i) => {
    const start = i ? 3 : 7;
    const bits = Array.from({ length: 4 }, (_, j) => {
      const n = start - j;
      return `<span class="bit" id="bit-${n}"><span>P${n}</span><strong></strong></span>`;
    }).join("");
    return `<div class="nibble"><p>${part}4ビット <small>（P${i ? "0がLSB" : "7がMSB"}）</small></p><div class="bit-group">${bits}</div></div>`;
  }).join("");
  $("ports").innerHTML = E.labels.map((segment, n) => {
    return `<button id="port-${n}" class="wire-row" type="button" data-port="${n}" data-terminal="${segment}">
      <span class="wire-port">P${n} <strong></strong></span>
      <svg class="wire" viewBox="0 0 140 24" preserveAspectRatio="none" aria-hidden="true">
        <path class="wire-line" d="M0 12H49l3.5-7 7 14 7-14 7 14 7-14 7 14 3.5-7H140"/>
        <path class="wire-arrow" d="M18 6l-8 6 8 6"/>
      </svg>
      <span class="wire-terminal">${segment}</span>
    </button>`;
  }).join("");
  const display = $("led-display");
  display.innerHTML = face(null) + E.labels.map((label, i) =>
    `<button type="button" class="segment-button terminal-${label}" id="terminal-${i}" data-port="${i}">${label}</button>`).join("");
  const terminals = E.labels.map((segment, i) => ({
    port: $("port-" + i), bitCell: $("bit-" + i), button: $("terminal-" + i),
    shape: display.querySelector(`[data-segment="${segment}"]`),
  }));
  const choiceButtons = choices.map(({ label, mask }, i) => {
    const button = document.createElement("button");
    button.type = "button"; button.className = "choice"; button.dataset.choice = i;
    button.setAttribute("aria-pressed", "false");
    const title = document.createElement("strong");
    title.textContent = label;
    button.append(title);
    button.insertAdjacentHTML("beforeend", face(mask));
    const lit = E.labels.filter((_, bit) => mask & (1 << bit)).map(name);
    button.setAttribute("aria-label", `選択肢${label}、点灯：${lit.join("・") || "なし"}`);
    $("choices").append(button);
    return button;
  });
  function explain(model) {
    const { bits, active, mask } = model, code = E.hex(byte);
    if (step === 0) return ["回路図の読み方", "左のポートから抵抗を横にたどると、右のLED端子につながります。回路図は上からP0〜P7、ビット列はP7〜P0の順です。VccはLEDに共通の＋側です。「次へ」で上位の桁から変換します。"];
    if (step <= 2) {
      const upper = step === 1, digit = code[step - 1], binary = bits.slice(upper ? 0 : 4, upper ? 4 : 8);
      const weights = [8, 4, 2, 1].filter((_, i) => binary[i] === "1");
      const total = Number.parseInt(digit, 16), sum = weights.length > 1 ? `＝${weights.join("＋")}` : "";
      return [`${upper ? "上位" : "下位"}の桁を4ビットに直す`,
        `${digit}₁₆＝${total}${sum} → ${binary}₂。左から重みは8・4・2・1です。${upper ? "回路図の下側にあるP7〜P4に割り当てます。" : `回路図の上側にあるP3〜P0に割り当て、${code}₁₆＝${bits.slice(0, 4)} ${binary}₂になります。`}`];
    }
    if (active) {
      const terminal = name(active.segment), port = `P${active.number}`;
      const reason = active.on
        ? `Vccから${terminal}のLEDと抵抗を通って${port}へ電流が流れます。`
        : "点灯に必要な電位差ができず、LEDに電流が流れません。";
      return [`${port} → ${terminal}を判定`, `${port}は${active.bit}なので、${terminal}は${status(active.on)}します。${reason}`];
    }
    const lit = E.labels.filter((_, bit) => mask & (1 << bit)).map(name);
    const matching = choices.filter(choice => choice.mask === mask).map(choice => choice.label);
    return ["点灯判定の結果",
      `${lit.length ? `点灯：${lit.join("・")}。` : "すべて消灯。"}${matching.length ? `選択肢${matching.join("・")}の図と一致します。` : "現在の出力と一致する選択肢はありません。"}`];
  }
  function draw() {
    const model = E.snapshot(byte, step);
    const diff = compared === null ? [] : E.differences(model.mask, choices[compared].mask);
    $("supply").dataset.active = String(step === 0 || model.active?.on === true);
    for (const { number, segment, bit, converted, current, on } of model.ports) {
      const { port, bitCell, button, shape } = terminals[number];
      const converting = (step === 1 && number >= 4) || (step === 2 && number < 4);
      const phase = current ? "current" : converting ? "conversion" : "";
      const state = on === null ? "pending" : on ? "on" : "off";
      const digit = converted ? String(bit) : "–";
      port.querySelector("strong").textContent = bitCell.lastElementChild.textContent = digit;
      port.dataset.phase = bitCell.dataset.phase = phase;
      port.dataset.state = shape.dataset.state = state;
      port.dataset.flow = String(current && on === true);
      port.setAttribute("aria-label", `P${number}から${name(segment)}、${converted ? `ビット${bit}` : "変換前"}、${status(on)}`);
      button.setAttribute("aria-label", `${name(segment)}、P${number}、${status(on)}`);
      for (const control of [port, button]) {
        if (current) control.setAttribute("aria-current", "step"); else control.removeAttribute("aria-current");
      }
      shape.dataset.active = String(current);
      port.dataset.different = button.dataset.different = shape.dataset.different = String(diff.includes(segment));
    }
    const [title, message] = explain(model);
    $("step-title").textContent = title;
    $("step-text").textContent = message;
    $("counter").textContent = `${step + 1} / ${E.lastStep + 1}`;
    $("seek").value = step;
    $("seek").setAttribute("aria-valuetext", `${step + 1} / ${E.lastStep + 1}：${title}`);
    $("prev").setAttribute("aria-disabled", String(step === 0));
    $("next").setAttribute("aria-disabled", String(step === E.lastStep));
    $("comparison").hidden = step !== E.lastStep;
    choiceButtons.forEach((button, i) => {
      button.setAttribute("aria-pressed", String(i === compared));
      for (const shape of button.querySelectorAll(".segment")) {
        shape.dataset.different = String(i === compared && diff.includes(shape.dataset.segment));
      }
    });
    $("choice-note").textContent = compared === null ? "選択肢を押すと、現在の点灯図と異なる箇所を確認できます。"
      : diff.length ? `選択肢${choices[compared].label}と異なる箇所：${diff.map(name).join("・")}。`
      : `選択肢${choices[compared].label}と全8箇所が一致します。`;
  }
  function move(value) {
    if (value < 0 || value > E.lastStep || value === step) return;
    step = value; compared = null; draw();
  }
  function input() {
    if (composing) return;
    const value = E.parseHex(field.value), error = $("hex-error");
    error.hidden = value !== null;
    field.setAttribute("aria-invalid", String(value === null));
    error.textContent = value === null ? `00〜FFの2桁で入力してください。図は最後に有効だった出力 ${E.hex(byte)} を表示しています。` : "";
    if (value === null || value === byte) return;
    byte = value; compared = null; draw();
  }
  field.value = E.hex(initial);
  field.addEventListener("input", input);
  field.addEventListener("compositionstart", () => { composing = true; });
  field.addEventListener("compositionend", () => { composing = false; input(); });
  $("reset").addEventListener("click", () => {
    field.value = E.hex(initial); input(); move(0);
  });
  $("prev").addEventListener("click", () => move(step - 1));
  $("next").addEventListener("click", () => move(step + 1));
  $("seek").addEventListener("input", event => move(Number(event.target.value)));
  $("diagram").addEventListener("click", event => {
    const port = event.target.closest("[data-port]"), segment = event.target.closest("[data-segment]")?.dataset.segment;
    if (!port && !segment) return;
    const n = port ? Number(port.dataset.port) : E.labels.indexOf(segment);
    move(10 - n);
    if (segment) terminals[n].button.focus({ preventScroll: true });
  });
  $("choices").addEventListener("click", event => {
    const button = event.target.closest("[data-choice]");
    if (!button) return;
    const i = Number(button.dataset.choice);
    compared = compared === i ? null : i;
    draw();
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || compared === null || composing) return;
    const button = choiceButtons[compared];
    compared = null; draw(); button.focus({ preventScroll: true });
    event.preventDefault();
  });
  draw(); api?.ready();
})();
