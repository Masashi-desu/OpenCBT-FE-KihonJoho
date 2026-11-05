(() => {
  "use strict";
  const E = window.LockingEngine, api = window.OpenCBTDetail, $ = id => document.getElementById(id), choices = E.choices(api?.context);
  let choice = choices.find(c => /(?:value-)?3$/.test(c.id)), snapshots = E.trace(choice.order), position = 0, selected = null;
  if (api) { document.documentElement.dataset.theme = api.context.theme; api.onThemeChange(theme => { document.documentElement.dataset.theme = theme; }); }
  else { $("standalone-title").hidden = false; $("standalone-credit").hidden = false; window.OpenCBTLockingScrollbars?.installOverlayScrollbars(document); }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const label = (x, y, value, cls = "", anchor = "middle") => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(value)}</text>`;
  const phaseName = { growing: "獲得相", shrinking: "解放相", done: "終了" };
  $("scenario").replaceChildren(...choices.map(c => new Option(`${c.label}：${c.order.map(E.operation).join(" → ")}`, c.id)));
  $("scenario").value = choice.id;
  function opStatus(s, tx, i) {
    if (i < s.pc[tx]) return "実行済";
    if (i >= s.issued[tx]) return "未発行";
    if (i > s.pc[tx]) return "前命令待ち";
    return s.waiting[tx]?.blockers.length ? "ロック待ち" : "再開可能";
  }
  function draw() {
    const s = snapshots[position], view = E.presentation(s), focused = document.activeElement?.dataset.target;
    let svg = '<defs><marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path class="arrow" d="M0 0L8 4L0 8Z"/></marker></defs>';
    svg += '<path class="wire" d="M30 78V370" marker-end="url(#arrow)"/>' + label(32, 60, "発行順", "small", "start");
    for (const tx of ["A", "B"]) {
      const x = tx === "A" ? 100 : 465, y0 = tx === "A" ? 90 : 125, program = tx === "A" ? E.a : choice.order;
      const active = view.active.includes(tx), phase = `${phaseName[s.phase[tx]]}${active ? phaseName[s.phase[tx]] === view.action ? "" : "・" + view.action : s.waiting[tx] ? s.waiting[tx].blockers.length ? "・待機中" : "・再開可能" : ""}`;
      svg += `<g class="transaction ${active ? "active" : ""} ${s.deadlock ? "stopped" : ""}" data-transaction="${tx}" data-active="${active}" role="group" aria-label="トランザクション${tx}${active ? '、今回の対象、' + view.action : ''}"><rect class="transaction-frame" x="${x - 24}" y="5" width="314" height="375" rx="10"/>`;
      svg += label(x + 4, 29, active ? `今回：${tx}` : `${tx}：トランザクション`, "lane-title", "start") + label(x + 135, 56, phase, "phase");
      for (let i = 0; i < 4; i++) {
        const y = y0 + 70 * i, id = `${tx}-${i}`, d = program[i], status = opStatus(s, tx, i), current = view.cursors[tx] === i;
        if (i < 3) svg += `<path class="wire" d="M${x + 135} ${y + 26}V${y + 44}" marker-end="url(#arrow)"/>`;
        svg += `<g role="button" tabindex="0" data-target="${id}" aria-label="${tx}の${i + 1}番目、${E.operation(d)}、${status}${current ? '、現在位置' : ''}" ${current ? 'aria-current="step"' : ''} aria-pressed="${selected === id}" class="operation ${current ? "current-query" : ""} ${status === "ロック待ち" ? "waiting" : ""} ${selected === id ? "selected" : ""}"><rect class="shape" x="${x}" y="${y - 26}" width="270" height="52" rx="7"/>${current ? label(x - 12, y + 6, "▶", "cursor-marker") : ""}${label(x + 16, y + 6, `${tx === "B" ? "①②③④"[i] + " " : ""}${E.operation(d)}`, "operation-name", "start")}${label(x + 255, y + 6, status, "small", "end")}</g>`;
      }
      svg += "</g>";
    }
    const waits = ["A", "B"].filter(tx => s.waiting[tx]?.blockers.length).map(tx => `${tx} → ${s.waiting[tx].blockers[0]}（${s.waiting[tx].data}待ち）`);
    svg += label(410, 415, waits.length ? waits.join("　／　") : "待ち関係なし", s.deadlock ? "danger" : "wait-label");
    svg += label(410, 447, s.deadlock ? "循環待ち：どちらも先へ進めない" : s.kind === "done" ? "両方が終了・全ロック解放" : "矢印：待つ側 → ロックを持つ側", "small");
    svg += label(26, 480, "現在のロック保持者　S：共有 ／ X：専有", "small", "start");
    E.data.forEach((d, i) => {
      const x = 26 + i * 196, owners = s.locks[d], id = `data-${d}`, current = s.data === d;
      svg += `<g role="button" tabindex="0" data-target="${id}" aria-label="データ${d}、${owners.length ? owners.join('と') + 'が' + (E.mode(d) === 'S' ? '共有' : '専有') + 'ロックを保持' : '保持者なし'}" aria-pressed="${selected === id}" class="lock ${current ? "current" : ""} ${selected === id ? "selected" : ""}"><rect class="shape" x="${x}" y="498" width="180" height="70" rx="7"/>${label(x + 90, 522, `データ ${d}`, "operation-name")}${label(x + 90, 550, owners.length ? `${owners.join('・')} ［${E.mode(d)}］` : "保持者なし", "owner")}</g>`;
    });
    svg += label(410, 596, `${s.deadlock ? "赤枠：両方が停止" : "青枠：今回の対象"}　／　▶：各トランザクションの現在位置`, "small");
    $("scene").innerHTML = svg;
    if (focused) target(focused)?.focus({ preventScroll: true });
    $("seek").max = String(snapshots.length - 1); $("seek").value = String(position);
    $("prev").disabled = position === 0; $("next").disabled = position === snapshots.length - 1;
    $("counter").textContent = `${position} / ${snapshots.length - 1} ステップ`;
    $("next-event").textContent = snapshots[position + 1] ? `次：${snapshots[position + 1].title}` : "選択肢の切替で比較できます。";
    $("close-selection").hidden = !selected;
    let title = s.title, text = s.text;
    if (selected?.startsWith("data-")) {
      const d = selected.slice(5), owners = s.locks[d], waiters = ["A", "B"].filter(tx => s.waiting[tx]?.data === d);
      title = `データ ${d}：${owners.length ? owners.join('・') + 'が保持' : '保持者なし'}`;
      text = `${E.operation(d)}は${E.mode(d) === "S" ? "共有ロックを要求します。共有同士ならAとBが同時に保持できます。" : "専有ロックを要求します。同じデータの専有ロックは同時に二者へ与えられません。"}${waiters.length ? ` ${waiters.join('・')}がこのデータを待っています${owners.length ? '。' : 'が、解放されたので再開可能です。'}` : " 現在、このデータへのロック待ちはありません。"}`;
    } else if (selected) {
      const [tx, index] = selected.split("-"), i = Number(index), d = (tx === "A" ? E.a : choice.order)[i], status = opStatus(s, tx, i);
      title = `${tx}：${E.operation(d)}（${status}）`;
      text = status === "未発行" ? "まだこの命令の発行位置に達していません。上から順に進めて確認できます。" : status === "前命令待ち" ? "命令の発行位置には達しましたが、先の命令がロック待ちです。先の命令を飛ばして、この命令のロックを要求することはありません。" : status === "ロック待ち" ? `${s.waiting[tx].blockers[0]}の${d}の専有ロックが解放されるまで待ちます。獲得済みのロックを持ったまま、ここで実行が止まります。` : status === "再開可能" ? "必要なロックが解放されました。次にこの待機命令のロックを獲得し、実行を再開します。" : `この命令は実行済みです。${s.locks[d].includes(tx) ? `${tx}は${d}のロックを引き続き保持しています。` : `${tx}は${d}のロックを既に解放しました。`}`;
    }
    $("step-title").textContent = title; $("step-text").textContent = text;
  }
  const target = id => $("scene").querySelector(`[data-target="${id}"]`);
  function reveal() {
    const s = snapshots[position], view = E.presentation(s);
    const node = selected ? target(selected) : s.tx ? view.cursors[s.tx] !== null ? target(`${s.tx}-${view.cursors[s.tx]}`) : $("scene").querySelector(`[data-transaction="${s.tx}"]`) : s.kind === "start" ? target("A-0") : null;
    if (!node) return;
    const r = node.getBoundingClientRect(), v = $("scene").closest(".diagram-viewport"), b = v.getBoundingClientRect();
    // A magnified command can exceed the viewport. Keep its cursor visible;
    // horizontal scrolling still exposes the remainder of that command.
    if (r.width > v.clientWidth - 8) v.scrollLeft += r.left - b.left - 4;
    else if (r.left < b.left + 4 || r.right > b.right - 4) v.scrollLeft += r.left + r.width / 2 - b.left - b.width / 2;
  }
  function clear(restore = true) { const id = selected; selected = null; draw(); if (restore && id) target(id)?.focus({ preventScroll: true }); }
  function select(id) { if (selected === id) clear(); else { selected = id; draw(); reveal(); } }
  function move(n) { position = Math.max(0, Math.min(snapshots.length - 1, n)); selected = null; draw(); reveal(); }
  $("scenario").addEventListener("change", () => { choice = choices.find(c => c.id === $("scenario").value); snapshots = E.trace(choice.order); move(0); });
  $("reset").addEventListener("click", () => move(0));
  $("prev").addEventListener("click", () => move(position - 1)); $("next").addEventListener("click", () => move(position + 1));
  $("seek").addEventListener("input", () => move(Number($("seek").value)));
  $("scene").addEventListener("click", event => { const n = event.target.closest("[data-target]"); if (n) select(n.dataset.target); });
  $("scene").addEventListener("keydown", event => { const n = event.target.closest("[data-target]"); if (n && ["Enter", " "].includes(event.key)) { event.preventDefault(); select(n.dataset.target); } });
  $("close-selection").addEventListener("click", () => clear());
  document.addEventListener("keydown", event => { if (event.key === "Escape" && selected) { event.preventDefault(); clear(); } });
  for (const name of ["rules", "compare"]) $(name + "-toggle").addEventListener("click", () => {
    const open = $(name).hidden;
    for (const other of ["rules", "compare"]) { $(other).hidden = other !== name || !open; $(other + "-toggle").setAttribute("aria-expanded", String(other === name && open)); }
  });
  $("comparison").innerHTML = choices.map(c => {
    const last = E.trace(c.order).at(-1);
    return `<p><strong>${esc(c.label)}：</strong>${c.order.map(E.operation).join(" → ")}<br>${last.deadlock ? `A → B（${last.waiting.A.data}）、B → A（${last.waiting.B.data}）の循環待ち。` : "一方が終了して解放し、もう一方が再開。デッドロックなし（正答）。"}</p>`;
  }).join("");
  draw(); api?.ready();
})();
