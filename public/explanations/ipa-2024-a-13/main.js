/* Managed interactive lesson. MIT: repository LICENSE. */
(() => {
  "use strict";
  const api = window.OpenCBTDetail, engines = window.ArrowEngine, $ = id => document.getElementById(id);
  let origin = engines.initialState(api?.context), engine = engines.forPattern(origin.pattern);
  let values = { ...origin.values }, enabled = engine.defaultEnabled();
  let result = engine.calculate(values, enabled), trace = engine.steps(result), position = -1, selected = null, focusedTerm = null;
  let timer = null, playing = false, zoom = 1, lastReason = "", returnTarget = null, disposed = false;
  let points = engine.pattern.points, labelPoints = engine.pattern.labels;
  const states = new Map();
  const namespace = "http://www.w3.org/2000/svg", controls = new Map();
  const text = (id, value) => { $(id).textContent = value; };
  const el = (tag, className, value) => { const n = document.createElement(tag); if (className) n.className = className; if (value !== undefined) n.textContent = value; return n; };
  const svg = (tag, attributes = {}, value) => { const n = document.createElementNS(namespace, tag); for (const [key, val] of Object.entries(attributes)) n.setAttribute(key, String(val)); if (value !== undefined) n.textContent = value; return n; };
  const short = value => { const raw = String(value); return raw.length > 12 ? `${raw.slice(0, 9)}…` : raw; };
  const day = value => `${value}日`;
  const signed = value => value > 0n ? `+${value}` : String(value);
  const pathText = path => path.map(id => id.startsWith("dummy-") ? "ダミー(0日)" : id).join(" → ");
  function pause() { clearTimeout(timer); timer = null; playing = false; playback(); }
  function playback() {
    text("play", playing ? "一時停止" : "自動再生"); $("play").setAttribute("aria-pressed", String(playing));
    $("play").disabled = $("next").disabled = position >= trace.length - 1;
    $("previous").disabled = position <= 0;
    text("step-label", position < 0 ? "未開始" : `${position + 1} / ${trace.length} · ${trace[position].title}`);
  }
  function schedule() {
    timer = setTimeout(() => { if (!playing || disposed) return; seek(position + 1, true); if (position >= trace.length - 1) pause(); else schedule(); }, 2400);
  }
  function seek(index, automatic = false) {
    if (!automatic) pause();
    position = Math.max(0, Math.min(trace.length - 1, index)); focusedTerm = null;
    const step = trace[position]; selected = { kind: step.kind, id: step.node }; returnTarget = controls.get(step.node);
    if (step.kind === "critical") $("show-critical").checked = true;
    revealTarget(); render(); showInspection(false, true); playback();
  }
  function select(kind, id) {
    pause(); position = -1;
    if (selected?.id === id) { closeInspection(); playback(); return; }
    focusedTerm = null; selected = { kind, id }; returnTarget = controls.get(id);
    revealTarget(); render(); showInspection(true, true); playback();
  }
  function closeInspection(restore = true) {
    selected = null; focusedTerm = null; $("inspection-panel").hidden = true; $("inspection-placeholder").hidden = false;
    render(); if (restore) returnTarget?.focus({ preventScroll: true });
  }
  function accessibleControl(group, kind, id) {
    group.setAttribute("role", "button"); group.setAttribute("tabindex", "0"); group.dataset.id = id; controls.set(id, group);
    group.addEventListener("click", () => select(kind, id));
    group.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); select(kind, id); } });
  }
  function buildDiagram() {
    controls.clear(); $("edge-layer").replaceChildren(); $("node-layer").replaceChildren();
    text("diagram-title", `${engine.pattern.title}のアローダイアグラム`);
    for (const edge of result.edges) {
      const vertices = [points[edge.from], ...(engine.pattern.bends[edge.id] ?? []), points[edge.to]];
      const inset = (a, b, distance) => { const length = Math.hypot(b[0] - a[0], b[1] - a[1]); return a.map((v, i) => v + (b[i] - v) / length * distance); };
      vertices[0] = inset(vertices[0], vertices[1], 24);
      vertices[vertices.length - 1] = inset(vertices.at(-1), vertices.at(-2), 26);
      const path = vertices.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
      const g = svg("g", { class: edge.dummy ? "edge dummy" : "edge" }); accessibleControl(g, "edge", edge.id);
      const [lx, ly] = labelPoints[edge.id];
      g.append(svg("path", { class: "edge-line", d: path }), svg("path", { class: "edge-hit", d: path }),
        svg("rect", { class: "edge-label-hit", x: lx - 45, y: ly - 25, width: 90, height: 50 }),
        svg("rect", { class: "edge-label-bg", x: lx - 45, y: ly - 22, width: 90, height: 40, rx: 7 }),
        svg("text", { class: "edge-label", x: lx, y: ly + 3 }), svg("text", { class: "edge-change", x: lx, y: ly + 32 }), svg("title"));
      $("edge-layer").append(g);
    }
    engine.nodes.forEach((id, i) => {
      const [x, y] = points[id], g = svg("g", { class: "event-node" }); accessibleControl(g, "node", id);
      g.append(svg("circle", { class: "event-hit", cx: x, cy: y, r: 25 }), svg("circle", { class: "event-circle", cx: x, cy: y, r: 23 }), svg("text", { class: "event-number", x, y: y + 5 }, i + 1),
        svg("text", { class: "event-name", x: x + (engine.pattern.nameOffsets?.[id] ?? 0), y: y + 49 }, engine.names[id]), svg("text", { class: "event-time", x, y: y - 37 }));
      $("node-layer").append(g);
    });
  }
  function render() {
    api?.setPresentation?.(origin.pattern);
    const showCritical = $("show-critical").checked, showTimes = $("show-times").checked;
    const related = selected?.kind === "edge" ? [selected.id] : selected?.kind === "critical" ? result.edges.filter(e => e.critical).map(e => e.id)
      : selected ? result.incoming[selected.id].map(e => e.id) : [];
    for (const edge of result.edges) {
      const g = controls.get(edge.id), isRelated = related.includes(edge.id);
      g.classList.toggle("critical", showCritical && edge.critical); g.classList.toggle("dummy-emphasis", edge.dummy && $("show-dummies").checked);
      g.classList.toggle("disabled-edge", !edge.enabled); g.classList.toggle("selected", selected?.kind === "edge" && selected.id === edge.id);
      g.classList.toggle("related", isRelated); g.classList.toggle("dimmed", Boolean(selected && !isRelated));
      g.classList.toggle("determining", focusedTerm === edge.id || Boolean(selected && selected.kind === "node" && isRelated && edge.ef === result.earliest[selected.id]));
      g.setAttribute("aria-pressed", String(selected?.kind === "edge" && selected.id === edge.id));
      const full = `${engine.edgeName(edge.id)}、${day(edge.duration)}${edge.enabled ? "" : "、無効"}${edge.critical ? "、クリティカルパス" : ""}`;
      g.setAttribute("aria-label", full); g.querySelector("title").textContent = full;
      g.querySelector(".edge-label").textContent = edge.dummy ? (edge.enabled ? "0日" : "0日・無効") : `${edge.id}  ${short(edge.duration)}日`;
      const delta = edge.dummy ? "" : edge.duration - engine.parseDays(origin.values[edge.id]);
      g.querySelector(".edge-change").textContent = delta === "" || delta === 0n ? "" : `初期から${short(signed(delta))}日`;
      const width = edge.dummy ? 82 : Math.max(80, Math.min(190, g.querySelector(".edge-label").textContent.length * 12));
      for (const rect of g.querySelectorAll("rect")) { rect.setAttribute("width", width); rect.setAttribute("x", labelPoints[edge.id][0] - width / 2); }
    }
    for (const id of engine.nodes) {
      const g = controls.get(id); g.classList.toggle("selected", selected && selected.kind !== "edge" && selected.id === id);
      g.setAttribute("aria-pressed", String(Boolean(selected && selected.kind !== "edge" && selected.id === id)));
      g.setAttribute("aria-label", `${engine.names[id]}、最早${day(result.earliest[id])}、計算を確認`);
      const t = g.querySelector(".event-time"); t.textContent = `最早 ${short(result.earliest[id])}日`; t.style.display = showTimes ? "" : "none";
    }
    text("diagram-status", `完了時刻は${day(result.total)}。クリティカルパスは${result.paths.length}本です。`);
    text("diagram-description", `実線は作業、破線は0日の依存関係、円は作業を結ぶ地点です。矢印の長さは日数を表しません。${result.edges.map(e => `${engine.edgeName(e.id)}は${engine.names[e.from]}から${engine.names[e.to]}へ${e.dummy ? `、${e.enabled ? "有効" : "無効"}` : `、${day(e.duration)}`}`).join("。")}。有効な先行作業がすべて終わると接続先を開始できます。最短完了は${day(result.total)}。矢印と結合点はEnterまたはSpaceで選択できます。`);
    $("path-summary").hidden = !showCritical;
    text("path-summary", `クリティカルパス ${result.paths.length}本：${result.paths.map(pathText).join(" ／ ")}`);
  }
  function addParagraph(value, className, parent = $("inspection-content")) { parent.append(el("p", className, value)); }
  function showInspection(focus, reveal = false) {
    if (!selected) return;
    const content = $("inspection-content"); content.replaceChildren(); content.dataset.kind = selected.kind; $("inspection-panel").hidden = false; $("inspection-reservation").scrollTop = 0; $("inspection-placeholder").hidden = true;
    const extra = el("details", "extra"); extra.append(el("summary", "", "意味・変更理由を確認"));
    if (selected.kind === "edge") {
      const edge = result.edges.find(e => e.id === selected.id); text("inspection-title", `${engine.edgeName(edge.id)} · 全体${day(result.total)}`);
      addParagraph(`${engine.names[edge.from]} → ${engine.names[edge.to]}`);
      if (edge.dummy) {
        addParagraph("ダミー作業は0日。時間を消費せず、先行側の作業がすべて終わるまで接続先を待たせる依存関係です。");
        addParagraph(`${engine.names[edge.to]}は${engine.names[edge.from]}の完了を${edge.enabled ? "待ちます" : "待ちません"}。無効時はこの矢印を計算から除外します。`);
        if (!edge.enabled) addParagraph("依存を外しても、この作業の完了はプロジェクト全体の完了条件に含めます。");
        const button = el("button", "primary", edge.enabled ? "この依存関係を無効にする" : "この依存関係を有効にする"); button.type = "button";
        button.setAttribute("aria-pressed", String(edge.enabled)); button.id = "toggle-dummy";
        button.addEventListener("click", () => { enabled[edge.id] = !edge.enabled; update(`${engine.edgeName(edge.id)}を${enabled[edge.id] ? "有効" : "無効"}にしました。`); $("toggle-dummy").focus({ preventScroll: true }); }); content.append(button);
      } else {
        const editor = el("div", "editor"), label = el("label", "", "所要日数（日）"), input = el("input");
        input.id = "duration"; input.type = "number"; input.min = "0"; input.step = "1"; input.inputMode = "numeric"; input.value = String(edge.duration); input.setAttribute("aria-describedby", "input-error");
        label.append(input); const apply = el("button", "primary", "適用"); apply.type = "button"; apply.id = "apply-duration";
        const error = el("p", "error"); error.id = "input-error"; error.setAttribute("role", "alert");
        const commit = () => {
          try { const parsed = engine.parseDays(input.value); values[edge.id] = parsed; update(`作業${edge.id}を${day(parsed)}に変更しました。`); $("duration").focus({ preventScroll: true }); }
          catch (err) { error.textContent = err.message; input.setAttribute("aria-invalid", "true"); input.focus({ preventScroll: true }); }
        };
        input.addEventListener("input", () => { pause(); error.textContent = ""; input.removeAttribute("aria-invalid"); });
        input.addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); commit(); } }); apply.addEventListener("click", commit);
        editor.append(label, apply); content.append(editor, error);
        const dl = el("dl", "times");
        for (const [name, val] of [["最早開始", edge.es], ["最早終了", edge.ef], ["最遅開始", edge.ls], ["最遅終了", edge.lf], ["余裕時間", edge.float], ["所要日数", edge.duration]]) {
          const row = el("div"); row.append(el("dt", "", name), el("dd", "", day(val))); dl.append(row);
        }
        content.append(dl);
        addParagraph(`余裕時間（トータルフロート） = ${edge.lf} − ${edge.es} − ${edge.duration} = ${day(edge.float)}。この作業だけをこの範囲内で遅らせても、全体の完了日は変わりません。`, "", extra);
        addParagraph(edge.critical ? "余裕0日の作業です。この作業が遅れると、プロジェクトの完了も遅れます。" : "ほかの作業も同時に遅れる場合、余裕をそれぞれ独立に使えるとは限りません。", "", extra);
        const timeline = el("div", "timeline"); timeline.setAttribute("aria-label", "最早と最遅の作業時間帯。余裕時間は右に動かせる幅です。");
        timeline.append(el("p", "", `時間軸：0日 → ${day(result.total)}`));
        const percent = val => result.total === 0n ? 0 : Number(val * 10000n / result.total) / 100;
        for (const [name, start] of [["最早", edge.es], ["最遅", edge.ls]]) {
          const row = el("div", "timeline-row"), track = el("div", "timeline-track"), bar = el("div", "timeline-bar");
          bar.style.left = `${percent(start)}%`; bar.style.width = `${percent(edge.duration)}%`; track.append(bar); row.append(el("span", "", name), track); timeline.append(row);
        }
        extra.append(timeline);
        addParagraph(edge.critical ? "余裕0日 · クリティカルパス上の作業" : `完了日を遅らせずに${day(edge.float)}まで延長できます。`);
      }
    } else if (selected.kind === "critical") {
      text("inspection-title", `クリティカルパス · ${result.paths.length}本`);
      for (const path of result.paths) addParagraph(`${pathText(path)} = ${day(result.total)}`, "formula");
      addParagraph("終了から最遅時刻を逆算し、最遅終了 − 最早開始 − 所要日数 = 0日の矢印をつなぎます。最短完了日数を決める経路はすべて強調しています。ダミーを外して後続がなくなった作業も、全体の完了条件に含めます。");
      addParagraph("この経路の作業が遅れると、プロジェクト全体の完了も遅れます。0日のダミーも、依存関係として経路に含まれます。");
    } else {
      const node = selected.id, arrivals = selected.kind === "arrivals"; text("inspection-title", arrivals ? `${engine.names[node]}への到達時刻` : `${engine.names[node]} · 最早${day(result.earliest[node])}`);
      if (!arrivals) addParagraph(engine.formula(result, node), "formula");
      const list = el("div", "term-list");
      for (const edge of result.incoming[node]) {
        const determining = edge.ef === result.earliest[node], button = el("button", "term", `${engine.edgeName(edge.id)}：${result.earliest[edge.from]} + ${edge.duration} = ${day(edge.ef)}${determining ? " · 最大の到達時刻" : ""}`);
        button.type = "button"; button.dataset.term = edge.id; button.setAttribute("aria-pressed", String(focusedTerm === edge.id));
        button.addEventListener("click", () => { focusedTerm = focusedTerm === edge.id ? null : edge.id; render(); for (const term of list.children) term.setAttribute("aria-pressed", String(term.dataset.term === focusedTerm)); }); list.append(button);
      }
      if (node === "end") for (const terminal of result.completionNodes) if (terminal !== "end")
        list.append(el("p", "", `${engine.names[terminal]}：${day(result.earliest[terminal])}。ダミーを外した後も、この作業の完了を待ちます。`));
      content.append(list);
      addParagraph(node === "start" ? "開始地点を0日とします。"
        : arrivals ? "この地点では、表示した先行作業の完了をすべて待ちます。次のステップで最大値を選びます。"
        : result.incoming[node].length > 1 ? "すべての先行作業を待ち、到達時刻の最大値を採用します。計算項目を選ぶと矢印を強調します。"
        : node === "branch" ? `Aの完了後、${result.outgoing.branch.filter(e => !e.dummy).map(e => e.id).join("・")}は並行して開始できます。` : "先行作業の開始可能時刻に、その作業の日数を加えます。");
      if (node === "start") addParagraph("矢印は作業、円は作業が完了して次へ進める地点を表します。", "", extra);
      else if (arrivals || result.incoming[node].length > 1 || node === "branch") addParagraph("並行する作業の日数を足し合わせる必要はありません。合流先では、すべての先行作業が完了するまで先へ進めません。", "", extra);
      if (!arrivals) addParagraph(`最遅時刻：${day(result.latest[node])}。全体の完了を遅らせないために、この地点までを完了させる期限です。`, "", extra);
    }
    if (lastReason) addParagraph(lastReason, "", extra);
    if (extra.children.length > 1) content.append(extra);
    if (focus) (selected.kind === "edge" && !selected.id.startsWith("dummy-") ? $("duration") : $("close-inspection"))?.focus({ preventScroll: true });
    const target = selected;
    if (reveal) requestAnimationFrame(() => {
      if (selected === target && !$("inspection-panel").hidden) $("inspection-reservation").scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    });
  }
  function revealTarget() {
    if (!selected) return;
    const viewport = $("diagram-viewport"), canvas = $("diagram-canvas"), x = selected.kind === "edge" ? labelPoints[selected.id][0] : points[selected.id][0];
    const at = x / 1000 * canvas.offsetWidth;
    if (at < viewport.scrollLeft + 60 || at > viewport.scrollLeft + viewport.clientWidth - 60)
      viewport.scrollLeft = Math.max(0, at - viewport.clientWidth / 2);
  }
  function update(reason) {
    pause(); const previous = result; result = engine.calculate(values, enabled); trace = engine.steps(result); position = -1; focusedTerm = null;
    const changedNodes = engine.nodes.filter(id => previous.earliest[id] !== result.earliest[id]).map(id => engine.names[id]);
    lastReason = `${reason} ${previous.total === result.total ? `最短完了は${day(result.total)}のままです。` : `最短完了は${day(previous.total)}から${day(result.total)}へ変わりました。`}${changedNodes.length ? `最早時刻が変わった地点：${changedNodes.join("・")}。` : "各地点の最早時刻は変わりません。"} クリティカルパスは${result.paths.length}本です。`;
    render(); if (selected) { if (!["edge", "node"].includes(selected.kind)) selected = { kind: "node", id: selected.id }; showInspection(false); } playback();
  }
  function reset() {
    values = { ...origin.values }; enabled = engine.defaultEnabled(); selected = null;
    update("すべての作業とダミーを初期化しました。");
    closeInspection(false);
  }
  function placeholder() {
    text("inspection-placeholder", `${origin.label === "元の問題" ? "元の問題の数値です。" : "この問題の保存済み条件です。"}図の作業・結合点・破線を選択すると、ここで編集・計算を確認できます。破線は0日の依存関係です。`);
  }
  $("pattern").value = origin.pattern;
  $("pattern").addEventListener("change", () => {
    pause();
    states.set(origin.pattern, { values, enabled, position, selected, focusedTerm, lastReason, zoom, scrollLeft: $("diagram-viewport").scrollLeft });
    origin = engines.initialState(api?.context, $("pattern").value); engine = engines.forPattern(origin.pattern);
    const saved = states.get(origin.pattern);
    values = saved?.values ?? { ...origin.values }; enabled = saved?.enabled ?? engine.defaultEnabled();
    position = saved?.position ?? -1; selected = saved?.selected ?? null; focusedTerm = saved?.focusedTerm ?? null; lastReason = saved?.lastReason ?? "";
    points = engine.pattern.points; labelPoints = engine.pattern.labels;
    result = engine.calculate(values, enabled); trace = engine.steps(result); buildDiagram();
    returnTarget = selected ? controls.get(selected.id) : null;
    $("inspection-panel").hidden = !selected; $("inspection-placeholder").hidden = Boolean(selected);
    placeholder(); render(); if (selected) showInspection(false); playback(); setZoom(saved?.zoom ?? 1);
    $("diagram-viewport").scrollLeft = saved?.scrollLeft ?? 0;
  });
  $("close-inspection").addEventListener("click", () => { pause(); closeInspection(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && selected) { event.preventDefault(); pause(); closeInspection(); } });
  for (const id of ["show-critical", "show-times", "show-dummies"]) $(id).addEventListener("change", () => { pause(); render(); });
  $("reset").addEventListener("click", reset);
  $("first").addEventListener("click", () => seek(0)); $("previous").addEventListener("click", () => seek(position - 1)); $("next").addEventListener("click", () => seek(position + 1));
  $("play").addEventListener("click", () => { if (playing) pause(); else { if (position < 0) seek(0); playing = true; playback(); schedule(); } });
  function setZoom(next) { zoom = Math.max(1, Math.min(2, next)); $("diagram-canvas").style.width = `${zoom * 100}%`; $("diagram-canvas").style.minWidth = `${900 * zoom}px`; text("zoom-value", `${Math.round(zoom * 100)}%`); $("zoom-out").disabled = zoom === 1; $("zoom-in").disabled = zoom === 2; }
  $("zoom-in").addEventListener("click", () => setZoom(zoom + .25)); $("zoom-out").addEventListener("click", () => setZoom(zoom - .25));
  let cleanupTheme = () => {}, cleanupScrollbars = () => {};
  if (api) { document.documentElement.dataset.theme = api.context.theme; cleanupTheme = api.onThemeChange(theme => { document.documentElement.dataset.theme = theme; }); }
  else {
    $("standalone-credit").hidden = false;
    const system = matchMedia("(prefers-color-scheme: dark)"), apply = () => { document.documentElement.dataset.theme = system.matches ? "dark" : "light"; };
    apply(); system.addEventListener("change", apply); cleanupTheme = () => system.removeEventListener("change", apply);
    cleanupScrollbars = window.OpenCBTArrowScrollbars.installOverlayScrollbars();
  }
  placeholder(); buildDiagram(); render(); playback(); setZoom(1); api?.ready();
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  window.addEventListener("pagehide", () => { disposed = true; pause(); cleanupTheme(); cleanupScrollbars(); });
})();
