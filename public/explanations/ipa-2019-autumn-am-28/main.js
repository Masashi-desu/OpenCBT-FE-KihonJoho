(() => {
  "use strict";
  const E = window.TransactionEngine, api = window.OpenCBTDetail, $ = id => document.getElementById(id);
  const choices = E.choices(api?.context);
  let scenario = "normal", snapshots = E.trace(scenario), position = 0, selected = null;
  if (api) { document.documentElement.dataset.theme = api.context.theme; api.onThemeChange(theme => { document.documentElement.dataset.theme = theme; }); }
  else { $("standalone-title").hidden = false; $("standalone-credit").hidden = false; window.OpenCBTTransactionScrollbars?.installOverlayScrollbars(document); }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const label = (x, y, value, cls = "") => `<text x="${x}" y="${y}" class="${cls}" text-anchor="middle">${esc(value)}</text>`;
  const coordinates = { active: [110, 190], committing: [410, 90], committed: [710, 90], aborting: [410, 280], aborted: [710, 280] };
  const paths = { request: "M200 190H245V90H320", cancel: "M200 190H245V280H320", commit: "M500 90H620", failure: "M410 126V244", rollback: "M500 280H620" };
  const forbiddenPaths = {
    "aborting-committing": ["M475 244C545 200 545 170 475 126", 520, 191],
    "aborting-committed": ["M500 260L645 126", 570, 199],
    "aborted-committed": ["M710 244V126", 710, 192],
    "committed-aborting": ["M620 110L500 260", 560, 194],
  };
  $("scenario").replaceChildren(...E.scenarios.map(s => new Option(s.name, s.id)));
  $("choice-list").innerHTML = choices.map(c => `<button type="button" class="choice" data-choice="${esc(c.id)}" aria-label="${esc(c.label)}：${E.states[c.from].name}から${E.states[c.to].name}への遷移" aria-pressed="false"><strong>${esc(c.label)}</strong><span>${E.states[c.from].name}</span><span aria-hidden="true">→</span><span>${E.states[c.to].name}</span></button>`).join("");
  function selectedChoice() { return selected?.kind === "choice" ? choices.find(c => c.id === selected.id) : null; }
  function draw() {
    const s = snapshots[position], choice = selectedChoice(), focused = document.activeElement?.dataset.node;
    let svg = '<defs>' + ["arrow", "choice-arrow", "forbidden-arrow"].map(id => `<marker id="${id}" viewBox="0 0 8 8" refX="7" refY="4" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto"><path class="${id}" d="M0 0L8 4L0 8Z"/></marker>`).join("") + '</defs>';
    for (const edge of E.edges) svg += `<path data-edge="${edge.id}" class="wire ${s.passed.includes(edge.id) ? "passed" : ""} ${s.edge === edge.id ? "recent" : ""}" d="${paths[edge.id]}" marker-end="url(#arrow)"/>`;
    svg += label(230, 64, "コミット要求", "small") + label(230, 321, "中止・障害", "small") + label(560, 69, "確定完了", "small") + label(560, 316, "取消完了", "small") + label(466, 187, "障害等", "small");
    if (choice) {
      const edge = E.edges.find(e => e.from === choice.from && e.to === choice.to), attempt = forbiddenPaths[`${choice.from}-${choice.to}`];
      svg += `<path class="choice-edge ${choice.possible ? "" : "forbidden"}" d="${edge ? paths[edge.id] : attempt[0]}" marker-end="url(#${choice.possible ? "choice-arrow" : "forbidden-arrow"})"/>`;
      if (!choice.possible) svg += label(attempt[1], attempt[2], "×", "cross");
    }
    for (const [id, state] of Object.entries(E.states)) {
      const [x, y] = coordinates[id], current = s.state === id, isSelected = selected?.kind === "state" && selected.id === id;
      // The aborting state's incoming vertical edge occupies its top centre.
      // Its badge has a fixed position to the left of that edge.
      svg += `<g role="button" tabindex="0" data-node="${id}" aria-label="${state.name}${current ? "、現在の状態" : ""}" aria-pressed="${isSelected}" class="${current ? "current" : ""} ${isSelected ? "selected" : ""}"><rect class="shape" x="${x - 90}" y="${y - 36}" width="180" height="72" rx="10"/>${label(x, y - 2, state.name, "state-name")}${label(x, y + 23, state.short, "small")}${current ? label(id === "aborting" ? x - 56 : x, y - 46, "▶ 現在", "current-label") : ""}</g>`;
    }
    svg += label(420, 360, choice ? `選択肢${choice.label}：${choice.possible ? "実線＝起こり得る遷移" : "破線と×＝起こらない遷移"}` : "▶ 現在の状態　／　太い矢印：直前の遷移", "small");
    $("scene").innerHTML = svg;
    if (focused) $("scene").querySelector(`[data-node="${focused}"]`)?.focus({ preventScroll: true });
    $("seek").max = String(snapshots.length - 1); $("seek").value = String(position);
    $("prev").disabled = position === 0; $("next").disabled = position === snapshots.length - 1;
    $("counter").textContent = `${position} / ${snapshots.length - 1} 遷移`;
    $("next-event").textContent = snapshots[position + 1] ? `次：${snapshots[position + 1].title}` : "完了。戻る・経路の変更で比べられます。";
    $("close-selection").hidden = !selected;
    if (choice) {
      $("step-title").textContent = `${choice.label}：${E.states[choice.from].name} → ${E.states[choice.to].name}（${choice.possible ? "起こり得る" : "起こらない・本問の正答"}）`;
      $("step-text").textContent = E.explainChoice(choice);
    } else if (selected) { $("step-title").textContent = E.states[selected.id].name; $("step-text").textContent = E.states[selected.id].text; }
    else { $("step-title").textContent = `${s.title}${position === snapshots.length - 1 ? "：" + E.states[s.state].name : ""}`; $("step-text").textContent = s.text; }
    for (const button of $("choice-list").children) button.setAttribute("aria-pressed", String(choice?.id === button.dataset.choice));
  }
  function clearSelection(restore = true) {
    const previous = selected; selected = null; draw(); revealCurrent();
    if (restore && previous) (previous.kind === "state" ? $("scene").querySelector(`[data-node="${previous.id}"]`) : $("choice-list").querySelector(`[data-choice="${previous.id}"]`))?.focus({ preventScroll: true });
  }
  function select(kind, id) {
    if (selected?.kind === kind && selected.id === id) clearSelection();
    else {
      selected = { kind, id }; draw();
      if (kind === "choice") {
        const choice = selectedChoice(), viewport = $("scene").closest(".diagram-viewport"), diagram = $("scene").getBoundingClientRect();
        const centre = (coordinates[choice.from][0] + coordinates[choice.to][0]) / 2 / 840 * diagram.width;
        viewport.scrollLeft = centre - viewport.clientWidth / 2;
      }
    }
  }
  function revealCurrent() {
    const viewport = $("scene").closest(".diagram-viewport"), node = $("scene").querySelector(`[data-node="${snapshots[position].state}"]`), r = node.getBoundingClientRect(), v = viewport.getBoundingClientRect();
    if (r.left < v.left || r.right > v.right) viewport.scrollLeft += r.left + r.width / 2 - v.left - v.width / 2;
  }
  function move(value) { position = Math.max(0, Math.min(snapshots.length - 1, value)); selected = null; draw(); revealCurrent(); }
  $("scenario").addEventListener("change", () => { scenario = $("scenario").value; snapshots = E.trace(scenario); move(0); });
  $("reset").addEventListener("click", () => { scenario = "normal"; $("scenario").value = scenario; snapshots = E.trace(scenario); move(0); });
  $("prev").addEventListener("click", () => move(position - 1)); $("next").addEventListener("click", () => move(position + 1));
  $("seek").addEventListener("input", () => move(Number($("seek").value)));
  $("scene").addEventListener("click", event => { const node = event.target.closest("[data-node]"); if (node) select("state", node.dataset.node); });
  $("scene").addEventListener("keydown", event => { const node = event.target.closest("[data-node]"); if (node && ["Enter", " "].includes(event.key)) { event.preventDefault(); select("state", node.dataset.node); } });
  $("choice-list").addEventListener("click", event => { const button = event.target.closest("[data-choice]"); if (button) select("choice", button.dataset.choice); });
  $("close-selection").addEventListener("click", () => clearSelection());
  document.addEventListener("keydown", event => { if (event.key === "Escape" && selected) { event.preventDefault(); clearSelection(); } });
  draw(); api?.ready();
})();
