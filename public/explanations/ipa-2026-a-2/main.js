/* Independently authored UI. MIT: repository LICENSE. */
(() => {
  "use strict";
  const api = window.OpenCBTDetail, engine = window.SortEngine, lesson = window.SortLesson;
  const context = api?.context ?? lesson.standaloneContext, $ = id => document.getElementById(id);
  const text = (id, value) => { $(id).textContent = value; };
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  document.documentElement.dataset.embedded = String(Boolean(api));
  let disposeStandalone = () => {};
  if (!api) {
    const systemTheme = matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => { document.documentElement.dataset.theme = systemTheme.matches ? "dark" : "light"; };
    applyTheme(); systemTheme.addEventListener("change", applyTheme);
    $("standalone-sources").hidden = false;
    const removeScrollbars = window.OpenCBTSortScrollbars.installOverlayScrollbars();
    disposeStandalone = () => { systemTheme.removeEventListener("change", applyTheme); removeScrollbars(); };
  }
  let algorithm = lesson.initialAlgorithm(context), input = [...engine.defaultInput];
  let trace, position = 0, timer = null, playing = false, selectedIndex = null, previousStep = null, previousPosition = -1, showTree = false;
  const durations = () => Number($("speed").value);
  const names = { comparisons: "比較", swaps: "交換", shifts: "シフト", insertions: "挿入", mergeWrites: "併合書込", copyBackWrites: "書戻し", holds: "一時保持" };
  const algorithms = Object.entries(lesson.algorithms);
  const choiceMap = lesson.choiceAlgorithms(context);
  const sections = ["simulator", "question-choices", "comparison"];
  let section = "simulator";
  const element = (tag, className, value) => { const node = document.createElement(tag); if (className) node.className = className; if (value !== undefined) node.textContent = value; return node; };
  const sequenceIndices = range => { const result = []; for (let i = range.lo; i <= range.hi; i += range.stride) result.push(i); return result; };
  function labels(step, index) {
    const result = [];
    if (!step.array[index]) result.push("空き");
    if (step.compared.includes(index)) result.push("比較");
    if (step.moving.includes(index)) result.push("移動");
    if (step.pivot?.index === index) result.push("基準値");
    if (step.candidate === index) result.push(algorithm === "selection" ? "最小候補" : "比較用の子");
    if (step.fixed.includes(index)) result.push("確定");
    else if (step.sortedRanges.some(range => sequenceIndices(range).includes(index))) result.push("部分整列");
    return result.length ? result : ["通常"];
  }
  function stateColor(step, index) {
    if (!step.array[index]) return "hole";
    if (step.moving.includes(index)) return "moving";
    if (step.compared.includes(index)) return "compare";
    if (step.pivot?.index === index) return "pivot";
    if (step.fixed.includes(index)) return "fixed";
    if (step.sortedRanges.some(range => sequenceIndices(range).includes(index))) return "sorted";
    return "normal";
  }
  function pause() { clearTimeout(timer); timer = null; playing = false; updatePlayback(); }
  function updatePlayback() {
    $("play").textContent = playing ? "Ⅱ 一時停止" : "▶ 再生";
    $("play").setAttribute("aria-label", playing ? "一時停止" : "自動再生");
    $("play").setAttribute("aria-pressed", String(playing));
    $("play").disabled = position === trace.steps.length - 1;
    $("first").disabled = $("previous").disabled = position === 0;
    $("next").disabled = position === trace.steps.length - 1;
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!playing) return;
      position++; render();
      if (position === trace.steps.length - 1) pause(); else schedule();
    }, durations());
  }
  function play() { if (position >= trace.steps.length - 1) return; if (selectedIndex !== null) $("context-pane").scrollTop = 0; selectedIndex = null; inspect(trace.steps[position]); playing = true; updatePlayback(); schedule(); }
  function seek(index) { pause(); if (selectedIndex !== null) $("context-pane").scrollTop = 0; selectedIndex = null; position = Math.max(0, Math.min(trace.steps.length - 1, index)); render(); }
  function reset() {
    clearTimeout(timer); timer = null; playing = false; position = 0; previousStep = null; previousPosition = -1; selectedIndex = null;
    trace = engine.generateTrace(algorithm, input); $("seek").max = String(trace.steps.length - 1);
    showTree = false; $("array-view").hidden = false;
    $("heap-guide").hidden = algorithm !== "heap";
    $("context-pane").scrollTop = $("diagram-stage").scrollTop = $("array-support").scrollTop = 0;
    $("toggle-tree").hidden = algorithm !== "heap"; $("toggle-tree").setAttribute("aria-pressed", "false");
    $("toggle-tree").textContent = "木構造を見る";
    for (const id of ["algorithm-help", "counts-help", "diagram-help"]) $(id).open = false;
    const info = lesson.algorithms[algorithm];
    text("algorithm-name", info.name); text("algorithm-english", info.english);
    for (const key of ["overview", "principle", "focus", "average", "worst", "difference"]) text(key, info[key]);
    text("exam-point", info.exam); text("algorithm-note", info.note);
    $("algorithm-select").value = algorithm;
    for (const button of $("choice-links").children) button.setAttribute("aria-pressed", String(button.dataset.algorithm === algorithm));
    $("bars").replaceChildren();
    $("bars").style.setProperty("--elements", String(input.length));
    input.forEach((_, index) => {
      const slot = element("div", "bar-slot");
      const button = element("button", "bar-button"); button.type = "button"; button.dataset.index = String(index);
      const column = element("span", "bar-column"), value = element("span", "bar-value"); column.append(value); button.append(column);
      button.addEventListener("click", () => { pause(); selectedIndex = selectedIndex === index ? null : index; $("context-pane").scrollTop = 0; inspect(trace.steps[position]); });
      slot.append(button, element("span", "position", `位置 ${index}`), element("span", "state-tag"), element("span", "group-tag")); $("bars").append(slot);
    });
    render();
  }
  function choose(next) { if (Object.hasOwn(lesson.algorithms, next)) { algorithm = next; reset(); } }
  function showSection(next) {
    if (!sections.includes(next)) return;
    if (next !== "simulator") pause();
    section = next;
    for (const id of sections) {
      const active = id === next;
      $(id).hidden = !active;
      $(`tab-${id}`).setAttribute("aria-selected", String(active));
      $(`tab-${id}`).tabIndex = active ? 0 : -1;
    }
  }
  function inspect(step) {
    $("inspection-view").hidden = selectedIndex === null; $("step-view").hidden = selectedIndex !== null;
    for (const slot of $("bars").children) slot.querySelector("button").setAttribute("aria-pressed", String(Number(slot.querySelector("button").dataset.index) === selectedIndex));
    if (selectedIndex === null) { text("inspection", ""); return; }
    const item = step.array[selectedIndex];
    text("inspection", `位置${selectedIndex}：${item ? `値${item.value}（入力時の位置${item.id}）` : "空き領域"}。状態：${labels(step, selectedIndex).join("・")}。`);
  }
  function renderBars(step) {
    const slots = [...$("bars").children], max = Math.max(1, ...input);
    const unique = array => { const counts = new Map(); array.forEach(item => { if (item) counts.set(item.id, (counts.get(item.id) || 0) + 1); }); return counts; };
    const oldCounts = previousStep ? unique(previousStep.array) : new Map(), newCounts = unique(step.array);
    slots.forEach((slot, index) => {
      const item = step.array[index], button = slot.querySelector("button"), column = slot.querySelector(".bar-column");
      column.getAnimations().forEach(animation => animation.cancel());
      slot.classList.toggle("in-range", index >= step.range[0] && index <= step.range[1]);
      button.dataset.state = stateColor(step, index); button.dataset.candidate = String(step.candidate === index);
      button.dataset.pivot = String(step.pivot?.index === index);
      button.dataset.value = item ? String(item.value) : "hole";
      button.setAttribute("aria-label", `位置${index}、${item ? `値${item.value}` : "空き領域"}、${labels(step, index).join("・")}`);
      column.style.height = `${item ? 25 + (item.value / max) * 120 : 40}px`;
      slot.querySelector(".bar-value").textContent = item ? String(item.value) : "空き";
      slot.querySelector(".state-tag").textContent = labels(step, index).join("・");
      const groupIndex = step.groups.findIndex(group => group.indices.includes(index));
      slot.dataset.group = groupIndex >= 0 ? String(groupIndex % 3) : "";
      slot.querySelector(".group-tag").textContent = groupIndex >= 0 ? `群${groupIndex + 1}` : "";
      // Identity-based movement follows the recorded mutation, including repeated values.
      // Copy-back duplicates are copies, so they use a pulse instead of an invented exchange.
      if (!motion.matches && previousStep && Math.abs(previousPosition - position) === 1 && item && oldCounts.get(item.id) === 1 && newCounts.get(item.id) === 1) {
        const oldIndex = previousStep.array.findIndex(old => old?.id === item.id);
        if (oldIndex !== index) {
          const delta = slots[oldIndex].offsetLeft - slot.offsetLeft;
          column.animate([{ transform: `translateX(${delta}px)` }, { transform: "translateX(0)" }], { duration: Math.min(300, durations() * .7), easing: "ease-in-out" });
        }
      }
    });
    $("held-view").hidden = !step.held;
    $("held-view").replaceChildren();
    if (step.held) $("held-view").append(element("strong", "", "一時保持"), element("span", "held-number", step.held.value), element("span", "", `元の位置${step.held.from} · 空き領域に挿入します`));
    $("groups").hidden = algorithm === "merge";
    $("groups").replaceChildren(...step.groups.map((group, index) => group.indices.length ? element("span", `group-chip group-${index % 3}`, `群${index + 1} ${group.label}：位置${group.indices.join("・")}`) : null).filter(Boolean));
    inspect(step);
  }
  function renderMerge(step) {
    const m = step.merge; $("merge-view").hidden = algorithm !== "merge";
    if (algorithm !== "merge") return;
    const rows = $("merge-groups"); rows.replaceChildren();
    if (!m || m.mode === "split") {
      text("merge-status", m ? `分割中：位置${m.lo}〜${m.hi} · 再帰の深さ${step.depth}` : "分割はこれからです。要素数1まで分けてから併合します。");
      for (const group of step.groups.length ? step.groups : [{ label: "対象グループ", indices: Array.from({ length: step.range[1] - step.range[0] + 1 }, (_, i) => i + step.range[0]) }]) {
        const row = element("div", "merge-row"); row.append(element("strong", "", group.label));
        group.indices.forEach(index => row.append(element("span", "number-chip", step.array[index].value))); rows.append(row);
      }
      return;
    }
    text("merge-status", m.mode === "merge" ? "左右の先頭を比較 → 補助領域へ追加" : m.mode === "copy-back" ? "補助領域 → 配列へ順に書戻し（途中の配列にはコピーが残ります）" : "この範囲の併合が完了しました。");
    for (const side of ["left", "right", "output"]) {
      const row = element("div", "merge-row"); row.append(element("strong", "", { left: "左グループ", right: "右グループ", output: "併合結果" }[side]));
      const cursor = side === "left" ? m.leftCursor : m.rightCursor;
      m[side].forEach((item, i) => {
        const chip = element("span", "number-chip", item.value);
        if (side !== "output" && i < cursor) chip.classList.add("consumed");
        if (side !== "output" && i === cursor && m.mode === "merge") { chip.classList.add("head"); chip.setAttribute("aria-label", `${side === "left" ? "左" : "右"}の先頭、値${item.value}`); }
        if (side === "output" && step.operation === "merge-write" && i === m.output.length - 1) chip.classList.add("chosen");
        row.append(chip);
      });
      if (!m[side].length) row.append(element("span", "hint", "まだ空です"));
      else if (side !== "output" && cursor === m[side].length) row.append(element("span", "hint", "全要素を追加済み"));
      rows.append(row);
    }
  }
  function renderHeap(step) {
    $("heap-view").hidden = algorithm !== "heap" || !showTree;
    if (algorithm !== "heap") return;
    const h = step.heap, size = h ? h.size : step.operation === "complete" ? 0 : input.length;
    text("heap-status", h ? `${{ building: "構築中（全体のヒープ条件は未保証）", repairing: "修復中（ヒープ条件は未保証）", valid: "最大ヒープ成立" }[h.mode]} · 有効範囲 0〜${size - 1}${h.root !== null ? ` · 調査する親：位置${h.root}` : ""}` : step.operation === "complete" ? "全要素の位置が確定しました。ヒープの対象はありません。" : "初期配列です。これから最大ヒープを構築します。");
    const svg = (tag, attributes, value) => { const node = document.createElementNS("http://www.w3.org/2000/svg", tag); Object.entries(attributes).forEach(([key, v]) => node.setAttribute(key, String(v))); if (value !== undefined) node.textContent = value; return node; };
    const point = index => { const level = Math.floor(Math.log2(index + 1)), first = 2 ** level - 1; return { x: 640 * (index - first + .5) / 2 ** level, y: 32 + level * 72 }; };
    const root = $("tree-content"); root.replaceChildren();
    step.array.forEach((item, index) => {
      const p = point(index);
      if (index) { const parent = point(Math.floor((index - 1) / 2)); root.append(svg("line", { x1: parent.x, y1: parent.y, x2: p.x, y2: p.y, class: `tree-edge${index >= size ? " outside" : ""}` })); }
    });
    step.array.forEach((item, index) => {
      const p = point(index), group = svg("g", { class: `tree-node ${stateColor(step, index)}${index >= size ? " outside" : ""}`, "data-index": index, "data-value": item.value });
      group.append(svg("circle", { cx: p.x, cy: p.y, r: 23 }), svg("text", { x: p.x, y: p.y + 6, "text-anchor": "middle" }, item.value), svg("text", { x: p.x, y: p.y + 40, "text-anchor": "middle", class: "node-index" }, `位置${index}`)); root.append(group);
    });
    text("tree-description", step.array.map((item, index) => `位置${index}の値${item.value}、${index < size ? "ヒープの対象" : "対象外"}、${labels(step, index).join("・")}`).join("。"));
  }
  function render() {
    const step = trace.steps[position];
    renderBars(step); renderMerge(step); renderHeap(step);
    text("range-label", `処理範囲：位置${step.range[0]}〜${step.range[1]}`);
    text("state-title", step.phase); text("step-number", `ステップ ${position + 1} / ${trace.steps.length}`);
    $("start-guide").hidden = position !== 0; $("step-description").hidden = position === 0;
    $("completion-guide").hidden = step.operation !== "complete";
    text("step-description", step.description);
    text("specific-state", step.pivot ? `ピボット：${step.pivot.value}（位置${step.pivot.index}）` : step.gap ? `現在の比較間隔：${step.gap}${step.gap === 1 ? "（通常の挿入ソートと同じ）" : ""}` : step.held ? `保持値：${step.held.value} · 空き位置：${step.array.indexOf(null)}` : step.candidate !== null ? `候補の位置：${step.candidate}` : step.heap ? `ヒープの有効要素数：${step.heap.size}` : "");
    $("specific-state").hidden = position === 0 || !$("specific-state").textContent;
    for (const key of Object.keys(names)) $(`count-${key}`).textContent = String(step.counts[key]);
    $("seek").value = String(position); $("seek").setAttribute("aria-valuetext", `ステップ${position + 1}、${step.phase}`);
    text("seek-position", `${position + 1} / ${trace.steps.length}`); updatePlayback();
    previousStep = step; previousPosition = position;
  }
  algorithms.forEach(([id, info]) => {
    const option = element("option", "", info.name); option.value = id; $("algorithm-select").append(option);
    const row = element("tr"); const heading = element("th", "", info.name); heading.scope = "row";
    row.append(heading, element("td", "", info.short), element("td", "", info.average), element("td", "", info.worst)); $("comparison-rows").append(row);
  });
  context.choiceOrder.forEach(choice => {
    const id = choiceMap[choice.id]; if (!id) return;
    const info = lesson.algorithms[id], button = element("button"); button.type = "button"; button.dataset.algorithm = id;
    button.append(element("strong", "", `${choice.label} · ${info.name}`), element("small", "", info.short));
    const marks = []; if (choice.id === context.question.correctAnswer.choiceId) marks.push("この問題の正答"); if (choice.id === context.selectedChoiceId) marks.push("あなたの解答");
    if (marks.length) button.append(element("span", "choice-status", marks.join(" · ")));
    button.addEventListener("click", () => { choose(id); showSection("simulator"); $("simulator").scrollIntoView({ behavior: motion.matches ? "instant" : "smooth", block: "start" }); $("algorithm-select").focus({ preventScroll: true }); });
    $("choice-links").append(button);
  });
  text("question-context", context.generation ? "今回の生成問題の対象と、表示された選択肢順に対応しています。" : "元問題の正答はウ（クイックソート）。他の選択肢も、それぞれ別のソートを説明しています。");
  if (!Object.keys(choiceMap).length) text("question-context", "この保存版の選択肢対応は確認できません。「動作を見る」で7方式の解説とシミュレーターを利用できます。");
  Object.entries(names).forEach(([key, name]) => { const div = element("div"); const value = element("dd", "", "0"); value.id = `count-${key}`; div.append(element("dt", "", name), value); $("counts").append(div); });
  function applyInput() {
    pause();
    try { input = engine.parseInput($("sequence").value); $("sequence").setAttribute("aria-invalid", "false"); $("input-error").hidden = true; $("input-help").hidden = false; reset(); }
    catch (error) { text("input-error", error.message); $("input-error").hidden = false; $("input-help").hidden = true; $("sequence").setAttribute("aria-invalid", "true"); }
  }
  $("apply-input").addEventListener("click", applyInput);
  $("algorithm-select").addEventListener("change", () => choose($("algorithm-select").value));
  sections.forEach((id, index) => {
    const tab = $(`tab-${id}`);
    tab.addEventListener("click", () => showSection(id));
    tab.addEventListener("keydown", event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const next = { ArrowRight: (index + 1) % sections.length, ArrowLeft: (index + sections.length - 1) % sections.length, Home: 0, End: sections.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault(); showSection(sections[next]); $(`tab-${sections[next]}`).focus();
    });
  });
  $("sequence").addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); applyInput(); } });
  $("default-input").addEventListener("click", () => { input = [...engine.defaultInput]; $("sequence").value = input.join(","); $("sequence").setAttribute("aria-invalid", "false"); $("input-error").hidden = true; $("input-help").hidden = false; reset(); });
  $("toggle-tree").addEventListener("click", () => {
    showTree = !showTree; $("array-view").hidden = showTree;
    $("toggle-tree").setAttribute("aria-pressed", String(showTree)); $("toggle-tree").textContent = showTree ? "配列を見る" : "木構造を見る";
    selectedIndex = null; inspect(trace.steps[position]); renderHeap(trace.steps[position]);
  });
  $("close-inspection").addEventListener("click", () => { const index = selectedIndex; selectedIndex = null; $("context-pane").scrollTop = 0; inspect(trace.steps[position]); if (index !== null) $("bars").children[index].querySelector("button").focus({ preventScroll: true }); });
  for (const id of ["algorithm-help", "counts-help", "diagram-help"]) $(`toggle-${id}`).addEventListener("click", event => {
    event.preventDefault();
    const open = !$(id).open;
    for (const other of ["algorithm-help", "counts-help", "diagram-help"]) $(other).open = other === id && open;
  });
  document.addEventListener("keydown", event => { if (section === "simulator" && event.key === "Escape" && selectedIndex !== null) { event.preventDefault(); $("close-inspection").click(); } });
  $("first").addEventListener("click", () => seek(0)); $("previous").addEventListener("click", () => seek(position - 1)); $("next").addEventListener("click", () => seek(position + 1));
  $("play").addEventListener("click", () => playing ? pause() : play());
  $("seek").addEventListener("input", () => seek(Number($("seek").value)));
  $("speed").addEventListener("change", () => { if (playing) schedule(); });
  document.addEventListener("keydown", event => {
    if (section !== "simulator" || event.ctrlKey || event.metaKey || event.altKey || event.target.closest("input,select,textarea,button,a,summary")) return;
    const action = { ArrowLeft: () => seek(position - 1), ArrowRight: () => seek(position + 1), Home: () => seek(0), End: () => seek(trace.steps.length - 1), " ": () => playing ? pause() : play() }[event.key];
    if (action) { event.preventDefault(); action(); }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  window.addEventListener("pagehide", event => { pause(); if (!event.persisted) disposeStandalone(); });
  reset(); showSection("simulator"); api?.ready();
})();
