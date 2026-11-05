/* Independently authored teaching model. Code: MIT; explanation: CC0-1.0. */
(() => {
  "use strict";
  const data = ["W", "X", "Y", "Z"], a = ["W", "X", "Y", "Z"];
  const operation = d => `${d === "W" ? "read" : "update"} ${d}`;
  const mode = d => d === "W" ? "S" : "X";
  function variant(context) {
    if (!context?.generation) return 0;
    const g = context.generation, v = g.parameters?.values;
    if (g.generatorRef?.id !== "generator-source-2019r01a-fe-am-29" || g.generatorRef.version !== "3.2.0" || !Array.isArray(v) || v.length !== 1 || !Number.isInteger(v[0]) || v[0] < 0 || v[0] > 15) throw Error("保存された生成条件に対応していません。");
    return v[0];
  }
  function choices(context) {
    const v = variant(context), rows = [
      ["W", ...(v & 1 ? ["Z", "X", "Y"] : ["Y", "X", "Z"])],
      ["W", ...(v & 2 ? ["Z", "Y", "X"] : ["Y", "Z", "X"])],
      v & 4 ? ["W", "X", "Y", "Z"] : ["X", "W", "Y", "Z"],
      [...(v & 8 ? ["Z", "X", "Y"] : ["Y", "Z", "X"]), "W"],
    ];
    const order = context?.choiceOrder ?? rows.map((_, i) => ({ id: `choice-${i + 1}`, label: "アイウエ"[i] }));
    const indices = order.map(c => /^choice-(?:value-)?([1-4])$/.exec(c.id)?.[1]);
    if (order.length !== 4 || indices.some(i => !i) || new Set(indices).size !== 4) throw Error("選択肢の対応を確認できません。");
    return order.map((c, i) => ({ ...c, order: rows[Number(indices[i]) - 1] }));
  }
  function trace(order) {
    if (!Array.isArray(order) || order.length !== 4 || new Set(order).size !== 4 || order.some(d => !data.includes(d))) throw Error("処理順序を選び直してください。");
    const programs = { A: a, B: [...order] }, pc = { A: 0, B: 0 }, issued = { A: 0, B: 0 }, phase = { A: "growing", B: "growing" };
    const locks = Object.fromEntries(data.map(d => [d, []])), waiting = { A: null, B: null }, result = [];
    let deadlock = false;
    const blockers = (tx, d) => locks[d].filter(owner => owner !== tx && mode(d) === "X");
    function save(kind, title, text, tx = null, d = null, index = null) {
      const waits = Object.fromEntries(["A", "B"].map(t => [t, waiting[t] ? { data: waiting[t], blockers: blockers(t, waiting[t]) } : null]));
      result.push(JSON.parse(JSON.stringify({ kind, title, text, tx, data: d, index, pc, issued, phase, locks, waiting: waits, deadlock })));
    }
    function complete(tx) {
      phase[tx] = "shrinking";
      save("commit", `${tx}：コミット・解放相へ`, "全ての処理に必要なロックを獲得し、更新を確定します。この解説では終了まで保持し、ここから一つずつ解放します。解放相では新しいロックを獲得しません。", tx);
      for (const d of programs[tx]) {
        locks[d] = locks[d].filter(t => t !== tx);
        save("release", `${tx}：${d}の${mode(d) === "S" ? "共有" : "専有"}ロックを解放`, `${tx}が保持していた${d}のロックを解放しました。${d === "W" && locks[d].length ? `もう一方の${locks[d][0]}の共有ロックは残ります。` : "保持者欄と待ち関係の変化を確認してください。"}`, tx, d);
      }
      phase[tx] = "done";
      save("finish", `${tx}：終了`, `${tx}の全ロックを解放しました。待っている相手は、停止した命令から再開できます。`, tx);
    }
    function request(tx) {
      const i = pc[tx], d = programs[tx][i], owners = blockers(tx, d), retry = waiting[tx] !== null;
      if (owners.length) {
        waiting[tx] = d;
        save("wait", `${tx}：${d}の専有ロック待ち`, `${owners[0]}が${d}を専有しているので、${tx}の${operation(d)}は実行できません。${tx}は獲得済みのロックを保持して待ち、後続命令を先に実行しません。`, tx, d, i);
        if (waiting.A && waiting.B && blockers("A", waiting.A).includes("B") && blockers("B", waiting.B).includes("A")) {
          deadlock = true;
          save("deadlock", "デッドロック：互いの解放待ち", `Aは${waiting.A}をBに、Bは${waiting.B}をAに待っています。両者とも後続処理に進めず、通常終了による解放にも到達できません。戻るか選択肢を切り替え、最初の待機から比べてください。`);
        }
        return;
      }
      waiting[tx] = null; locks[d].push(tx); pc[tx]++;
      save(retry ? "resume" : "acquire", `${tx}：${retry ? "再開・" : ""}${d}の${mode(d) === "S" ? "共有" : "専有"}ロックを獲得`, `${operation(d)}を実行します。${d === "W" ? "共有ロック同士は両立するので、相手がWを読んでいても獲得できます。" : "専有ロックを保持する間、相手は同じデータを更新できません。"}${retry ? "待っていた命令から再開し、発行済みの後続命令も順番に処理します。" : ""}`, tx, d, i);
      if (pc[tx] === 4) complete(tx);
    }
    function drain() {
      let progress;
      do {
        progress = false;
        for (const tx of ["A", "B"]) if (pc[tx] < issued[tx] && (!waiting[tx] || !blockers(tx, waiting[tx]).length)) {
          const before = pc[tx]; request(tx); progress ||= pc[tx] !== before;
          if (deadlock) return;
        }
      } while (progress);
    }
    save("start", "「次へ」で命令とロックを追う", "上からA・B交互の発行順で進みます。read Wは共有（S）、update X・Y・Zは専有（X）ロックです。図の命令やデータを選ぶと、現在の状態を確認できます。");
    for (let tick = 0; tick < 8 && !deadlock; tick++) {
      const tx = tick % 2 ? "B" : "A", i = issued[tx]++, d = programs[tx][i];
      if (waiting[tx]) save("queued", `${tx}：${operation(d)}の発行位置`, "図の位置は命令の発行時点です。先の命令がロック待ちのため、この後続命令はまだ実行せず、ロックも要求しません。", tx, d, i);
      drain();
    }
    if (!deadlock) save("done", "両トランザクションが終了：デッドロックなし", "一方が待っていても、相手が全処理を終えて解放できれば、待機中の命令から再開できます。全データの保持者がなくなり、両方が終了しました。この処理順序が本問の正答です。");
    return result;
  }
  // The step's actor and each transaction's execution position are different:
  // a queued issue never moves that transaction past its blocked command.
  function presentation(snapshot) {
    const cursors = Object.fromEntries(["A", "B"].map(tx => [tx,
      snapshot.phase[tx] !== "growing" ? null : snapshot.waiting[tx] ? snapshot.pc[tx] : snapshot.pc[tx] ? snapshot.pc[tx] - 1 : null,
    ]));
    const active = snapshot.deadlock ? ["A", "B"] : snapshot.tx ? [snapshot.tx] : [];
    const action = { acquire: "獲得・実行", resume: "再開・実行", wait: "ロック待ち", queued: "発行のみ", commit: "コミット", release: "ロック解放", finish: "終了", deadlock: "停止" }[snapshot.kind] ?? "";
    return { active, cursors, action };
  }
  function freeze(v) { for (const x of Object.values(v)) if (x && typeof x === "object") freeze(x); return Object.freeze(v); }
  window.LockingEngine = freeze({ data, a, mode, operation, variant, choices, trace, presentation });
})();
