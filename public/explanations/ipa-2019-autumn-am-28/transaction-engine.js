/* Independently authored teaching model. Code: MIT; explanation: CC0-1.0. */
(() => {
  "use strict";
  const states = {
    active: { name: "アクティブ", short: "更新を実行", text: "トランザクションの処理を実行している状態です。更新はまだ確定していません。ここからコミットを要求するか、中止してアボート処理へ進みます。" },
    committing: { name: "コミット処理中", short: "確定に向けた処理", text: "更新を確定するための処理中です。コミット済とは異なり、まだ確定は完了していません。この段階で障害などが起きると、アボート処理へ進む場合があります。" },
    committed: { name: "コミット済", short: "確定が完了", text: "コミットが完了し、更新結果が確定した状態です。同じトランザクションをアボート処理へ戻しません。確定後に内容を取り消す必要がある場合は、別のトランザクションで補償します。" },
    aborting: { name: "アボート処理中", short: "更新を取り消す", text: "中止が決まり、更新を取り消すロールバックを行っている状態です。同じトランザクションのコミット処理へ切り替えず、取消しを完了してアボート済へ進みます。" },
    aborted: { name: "アボート済", short: "取消しが完了", text: "ロールバックが完了した状態です。このトランザクションをそのままコミット済に変えることはできません。やり直す場合は、新しいトランザクションを開始します。" },
  };
  const edges = [
    { id: "request", from: "active", to: "committing", label: "コミットを要求", text: "処理を終えてコミットを要求し、確定に向けた処理へ進みました。要求しただけではコミット済にはなりません。" },
    { id: "cancel", from: "active", to: "aborting", label: "実行中に中止・障害", text: "処理の中止や障害によって、更新を取り消すアボート処理へ進みました。まずロールバックを行うので、まだアボート済ではありません。" },
    { id: "commit", from: "committing", to: "committed", label: "確定が完了", text: "確定処理が正常に完了し、コミット済になりました。これ以降、このトランザクションからアボート処理へは戻りません。" },
    { id: "failure", from: "committing", to: "aborting", label: "確定完了前に障害", text: "コミット完了前に障害などが起き、アボート処理へ進みました。「コミット処理中」は「コミット済」と異なるため、この遷移は起こり得ます。" },
    { id: "rollback", from: "aborting", to: "aborted", label: "ロールバックが完了", text: "更新の取消しが完了し、アボート済になりました。再実行するときは別のトランザクションを開始します。" },
  ];
  const scenarios = [
    { id: "normal", name: "正常にコミット", events: ["request", "commit"] },
    { id: "cancel", name: "実行中にアボート", events: ["cancel", "rollback"] },
    { id: "failure", name: "コミット処理中に障害", events: ["request", "failure", "rollback"] },
  ];
  const forbidden = [["aborting", "committing"], ["aborting", "committed"], ["aborted", "committed"], ["committed", "aborting"]];
  function canMove(from, to) { return edges.some(e => e.from === from && e.to === to); }
  function trace(id) {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) throw Error("経路を選び直してください。");
    const snapshots = [{ state: "active", edge: null, passed: [], title: "開始後：アクティブ", text: "「次へ」で一つの状態遷移を確認できます。経路を切り替えると、正常終了と二つのアボート経路を比べられます。" }];
    for (const event of scenario.events) {
      const previous = snapshots.at(-1), edge = edges.find(e => e.id === event && e.from === previous.state);
      if (!edge) throw Error("この状態からは実行できません。");
      snapshots.push({ state: edge.to, edge: edge.id, passed: [...previous.passed, edge.id], title: edge.label, text: edge.text });
    }
    return snapshots;
  }
  function variant(context) {
    if (!context?.generation) return 0;
    const g = context.generation, v = g.parameters?.values;
    if (g.generatorRef?.id !== "generator-source-2019r01a-fe-am-28" || g.generatorRef.version !== "3.2.0" || !Array.isArray(v) || v.length !== 1 || !Number.isInteger(v[0]) || v[0] < 0 || v[0] > 3) throw Error("保存された生成条件に対応していません。");
    return v[0];
  }
  function choices(context) {
    const pairs = [["aborting", "aborted"], forbidden[variant(context)], ["committing", "aborting"], ["committing", "committed"]];
    const order = context?.choiceOrder ?? pairs.map((_, i) => ({ id: `choice-${i + 1}`, label: "アイウエ"[i] }));
    const indices = order.map(c => /^choice-(?:value-)?([1-4])$/.exec(c.id)?.[1]);
    if (order.length !== 4 || indices.some(i => !i) || new Set(indices).size !== 4) throw Error("選択肢の対応を確認できません。");
    return order.map(c => {
      const index = Number(/^choice-(?:value-)?([1-4])$/.exec(c.id)[1]) - 1;
      const [from, to] = pairs[index];
      return { ...c, from, to, possible: canMove(from, to) };
    });
  }
  function explainChoice(choice) {
    if (choice.possible) return edges.find(e => e.from === choice.from && e.to === choice.to).text;
    if (choice.from === "committed") return "コミット済は確定が完了した状態です。同じトランザクションをアボート処理へ戻すことはありません。確定後の取消しは別のトランザクションで行います。";
    if (choice.from === "aborted") return "アボート済は更新の取消しが完了した状態です。このトランザクションをコミット済に変えられません。再実行は新しいトランザクションとして扱います。";
    return "アボート処理中では、中止が決まってロールバックを行っています。ここから同じトランザクションの確定へ切り替えることはなく、取消しを完了してアボート済へ進みます。";
  }
  // Freeze the teaching rules; UI selections and playback live in separate state.
  function freeze(value) { for (const v of Object.values(value)) if (v && typeof v === "object") freeze(v); return Object.freeze(value); }
  window.TransactionEngine = freeze({ states, edges, scenarios, canMove, trace, variant, choices, explainChoice });
})();
