/* Managed flowchart UI. MIT: repository LICENSE. */
(() => {
  "use strict";
  const api = window.OpenCBTDetail, E = window.FlowEngine, $ = id => document.getElementById(id);
  const text = (id, value) => { $(id).textContent = value; };
  let settings = E.defaultConfig(), history = [E.create(settings)], position = 0, selected = null;
  const nodes = [...document.querySelectorAll(".node")];
  for (const id of ["exit-op", "subtract-op"]) {
    for (const [value, { label }] of Object.entries(E.operators)) { const option = document.createElement("option"); option.value = value; option.textContent = label; $(id).append(option); }
  }
  $("exit-op").value = settings.exitOp; $("subtract-op").value = settings.subtractOp;
  for (const pattern of E.patterns) {
    const option = document.createElement("option"); option.value = pattern.id; option.textContent = `${pattern.choice}：${pattern.relation}`; $("initial-pattern").append(option);
  }
  const descriptions = {
    1: "aをm、bをnへ代入します。数値例の入力値と、文字式m＝a・n＝bが対応します。初期値は上の設定欄から変更できます。",
    2: "mとnを比較します。指定条件が成立すれば⑥で印字し、不成立なら③へ進みます。反対側の条件は自動的に求めます。",
    3: "②で残った比較結果だけを使います。指定条件が成立すれば⑤、不成立なら④です。②の条件によっては通れない分岐もあります。",
    4: "mからnを引き、その結果をmへ代入します。nは変わりません。数値とa・bの係数を同時に更新し、②へ戻ります。",
    5: "nからmを引き、その結果をnへ代入します。mは変わりません。数値とa・bの係数を同時に更新し、②へ戻ります。",
    6: "その時点のmの値を印字し、終了します。②の条件を変えた設定ではmとnが等しいとは限りません。",
  };
  function closeInspection(focus = true) {
    const old = selected; selected = null; render();
    if (focus && old) nodes.find(n => Number(n.dataset.node) === old)?.focus({ preventScroll: true });
  }
  function select(node) { selected = selected === node ? null : node; render(); }
  nodes.forEach(n => {
    n.addEventListener("click", () => select(Number(n.dataset.node)));
    n.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); select(Number(n.dataset.node)); } });
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && selected && !event.target.matches("input,select")) { event.preventDefault(); closeInspection(); } });
  $("close-inspection").addEventListener("click", () => closeInspection());
  function render() {
    const s = history[position], prefix = history.slice(0, position + 1), branches = E.branches(settings);
    $("initial-pattern").value = E.matchingPattern(settings)?.id ?? "";
    for (const [edge, branch] of Object.entries(branches)) {
      const label = $("label-" + edge); label.textContent = branch.label; label.classList.toggle("unreachable", !branch.reachable);
      $("edge-" + edge).classList.toggle("unreachable", !branch.reachable);
      if (edge === "3-5") {
        label.hidden = branch.label === E.operators[settings.subtractOp].label;
        $("subtract-op").closest(".branch-control").classList.toggle("unreachable", !branch.reachable);
      }
    }
    $("trail").replaceChildren(...s.edges.map(edge => { const path = $("edge-" + edge).cloneNode(); path.removeAttribute("id"); path.removeAttribute("class"); return path; }));
    nodes.forEach(n => {
      const id = Number(n.dataset.node); n.classList.toggle("current", s.node === id); n.classList.toggle("selected", selected === id);
      n.classList.toggle("unreachable", id === 4 ? !branches["3-4"].reachable : id === 5 ? !branches["3-5"].reachable : false);
      n.setAttribute("aria-pressed", String(selected === id));
      if (s.node === id) n.setAttribute("aria-current", "step"); else n.removeAttribute("aria-current");
    });
    $("end-node").classList.toggle("completed", s.status === "completed");
    text("chart-description", `左列に開始・①初期化・②比較・⑥印字・終了。②の右が③、その下が④、④の右が⑤。④⑤から下で合流し右端を通って①と②の間へ戻ります。②から⑥は${branches["2-6"].label}、③へは${branches["2-3"].label}。③から⑤は${branches["3-5"].label}、④へは${branches["3-4"].label}。現在${E.numbers[s.node]}。`);
    $("previous").disabled = position === 0; $("next").disabled = s.status !== "running";
    text("position", `${position + 1} / ${history.length}・${s.status === "completed" ? "終了" : s.status === "stopped" ? "停止" : "実行中"}`);
    text("current-title", `${E.numbers[s.node]} ${E.titles[s.node]}${s.status === "stopped" ? "（停止）" : ""}`);
    text("m-value", `m＝${s.m}`); text("n-value", `n＝${s.n}`);
    text("m-expression", `文字式：${E.expression(s.em)}`); text("n-expression", `文字式：${E.expression(s.en)}`);
    const p = s.comparison;
    text("comparison", p ? `比較：${p.m} ${E.operators[p.op].label} ${p.n} → ${p.holds ? "成立" : "不成立"}。分岐先は${E.numbers[p.next]}。` : s.calculation);
    text("printed", s.printed === null ? `印字：まだありません。${s.next ? `次の処理は${E.numbers[s.next]}。` : ""}` : `印字結果：${s.printed}（終了）`);
    $("stop-reason").hidden = s.status !== "stopped"; text("stop-reason", s.reason);
    $("inspection").hidden = selected === null;
    if (selected) { text("inspection-title", `${E.numbers[selected]} ${E.titles[selected]}`); text("inspection-text", descriptions[selected]); }
    $("explanation").replaceChildren(...E.explain(settings, prefix).map(value => { const p = document.createElement("p"); p.textContent = value; return p; }));
    $("history").replaceChildren(...history.map((s, i) => {
      const li = document.createElement("li"), button = document.createElement("button");
      button.type = "button"; button.textContent = `${i === position ? "▶ " : ""}${E.numbers[s.node]}`;
      button.setAttribute("aria-label", `履歴${i + 1}、${E.numbers[s.node]}、m＝${s.m}、n＝${s.n}${i === position ? "、現在位置" : ""}`);
      if (i === position) button.setAttribute("aria-current", "step");
      if (i > position) li.className = "future";
      button.addEventListener("click", () => { position = i; selected = null; render(); $("history").children[i].querySelector("button").focus({ preventScroll: true }); });
      li.append(button); return li;
    }));
    const historyBox = $("history").getBoundingClientRect(), current = $("history").querySelector('[aria-current="step"]').getBoundingClientRect();
    if (current.left < historyBox.left) $("history").scrollLeft -= historyBox.left - current.left;
    else if (current.right > historyBox.right) $("history").scrollLeft += current.right - historyBox.right;
  }
  $("next").addEventListener("click", () => {
    if (history[position].status !== "running") return;
    if (position === history.length - 1) history.push(E.advance(history, settings));
    position++; selected = null; render();
  });
  $("previous").addEventListener("click", () => { if (position > 0) position--; selected = null; render(); });
  $("reset").addEventListener("click", () => { history = [E.create(settings)]; position = 0; selected = null; render(); });
  function applySettings(event) {
    if (event?.isComposing) return;
    let next; const errors = [];
    for (const [name, id] of [["a", "initial-a"], ["b", "initial-b"]]) {
      try { E.integer($(id).value, name); $(id).removeAttribute("aria-invalid"); }
      catch (error) { $(id).setAttribute("aria-invalid", "true"); errors.push(error.message); }
    }
    if (!errors.length) {
      try { next = E.config({ a: $("initial-a").value, b: $("initial-b").value, exitOp: $("exit-op").value, subtractOp: $("subtract-op").value }); }
      catch (error) { errors.push(error.message); }
    }
    $("input-error").hidden = !errors.length; text("input-error", errors.join(" "));
    if (errors.length) {
      // Keep both the graph and its editors on the last valid conditions.
      $("exit-op").value = settings.exitOp; $("subtract-op").value = settings.subtractOp;
      return;
    }
    if (Object.keys(settings).every(key => settings[key] === next[key])) return;
    settings = next; history = [E.create(settings)]; position = 0; selected = null; render();
  }
  for (const id of ["initial-a", "initial-b"]) {
    $(id).addEventListener("input", applySettings);
    $(id).addEventListener("compositionend", applySettings);
  }
  for (const id of ["exit-op", "subtract-op"]) $(id).addEventListener("change", applySettings);
  $("initial-pattern").addEventListener("change", () => {
    const pattern = E.patterns.find(p => p.id === $("initial-pattern").value);
    if (!pattern) return;
    $("initial-a").value = pattern.a; $("initial-b").value = pattern.b;
    applySettings();
  });
  const unsubscribe = api?.onThemeChange(theme => { document.documentElement.dataset.theme = theme; });
  let cleanupScrollbars = null;
  if (api) document.documentElement.dataset.theme = api.context.theme;
  else {
    $("standalone-title").hidden = false; $("standalone-credit").hidden = false;
    cleanupScrollbars = window.OpenCBTFlowScrollbars?.installOverlayScrollbars();
  }
  window.addEventListener("pagehide", event => { if (!event.persisted) { unsubscribe?.(); cleanupScrollbars?.(); } });
  render(); api?.ready();
})();
