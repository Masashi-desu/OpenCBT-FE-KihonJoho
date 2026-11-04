/* Independently authored teaching simulator. Code: MIT; explanations: CC0-1.0. */
(() => {
  "use strict";
  const operations = [
    ["j ← j div 2", "NISHIN(k) ← j mod 2"],
    ["j ← j mod 2", "NISHIN(k) ← j div 2"],
    ["NISHIN(k) ← j div 2", "j ← j mod 2"],
    ["NISHIN(k) ← j mod 2", "j ← j div 2"],
  ];
  const maximum = width => width === 8 ? 99 : 2 ** width - 1;
  function integer(raw, width) {
    if (!/^[0-9]+$/.test(String(raw)) || !Number.isSafeInteger(Number(raw)) || Number(raw) < 1 || Number(raw) > maximum(width))
      throw Error(`jは1〜${maximum(width)}の整数で入力してください。最後の有効な値とステップを保持しています。`);
    return Number(raw);
  }
  function initial(context) {
    let width = 8;
    if (context?.generation) {
      const g = context.generation, values = g.parameters?.values;
      if (g.generatorRef?.id !== "generator-source-sample-2022-dec-a-2" || g.generatorRef.version !== "3.2.0" ||
          !Array.isArray(values) || values.length !== 1 || !Number.isInteger(values[0]) || values[0] < 5 || values[0] > 8)
        throw Error("保存された生成条件に対応していません。");
      width = values[0];
    }
    // j is an explanation example, never a fixed input from the official question.
    return { width, input: 13, option: 3 };
  }
  function choices(context) {
    const generated = Boolean(context?.generation);
    return operations.map((ops, i) => {
      const id = `choice-${generated ? "value-" : ""}${i + 1}`;
      return { id, index: i, label: context?.choiceOrder?.find(c => c.id === id)?.label ?? "アイウエ"[i], a: ops[0], b: ops[1] };
    });
  }
  function trace(input, width, option) {
    if (!Number.isInteger(width) || width < 5 || width > 8 || !Number.isInteger(option) || option < 0 || option > 3) throw Error("不正な処理条件です。");
    input = integer(input, width);
    let j = input, cells = Array(width).fill(null);
    const states = [];
    const push = (phase, k, title, text, action = null) => states.push({ phase, k, j, cells: [...cells], title, text, action });
    push("input", 0, "まず、入力したjを確認", `j＝${input}から始めます。「次へ」でループに入り、aとbを一つずつ実行します。配列の「—」はまだ格納していない要素です。`);
    for (let k = 1; k <= width; k++) {
      push("loop", k, `k＝${k}：${k}回目の変換`, `k：1，1，${width}は、1から1ずつ増やし${width}まで繰り返す指定です。今回はNISHIN(${k})を扱います。jが0になっても指定回数まで続けます。`);
      for (let p = 0; p < 2; p++) {
        const phase = p === 0 ? "a" : "b", before = j;
        const store = option >= 2 ? p === 0 : p === 1;
        const mod = option === 0 || option === 3 ? store : !store;
        const result = mod ? before % 2 : Math.floor(before / 2);
        const action = { before, quotient: Math.floor(before / 2), remainder: before % 2, result, store, mod, index: k };
        if (store) cells[k - 1] = result; else j = result;
        let text = `${before} ÷ 2 の${mod ? "余り" : "商の整数部分"}は${result}。`;
        text += store ? `NISHIN(${k})に${result}を保存し、jは${j}のままです。` : `jを${before}から${j}へ更新します。配列は変更しません。`;
        if (option === 0 && !store) text += "余りを保存する前にjが変わるため、次の処理では元のjの余りを取り出せません。";
        if ((option === 1 || option === 2) && !store) text += "jを余りの0又は1にすると、それより上の桁の情報を失います。";
        if (store && result > 1) text += "2進数の1桁には0又は1しか使えません。この値は2進数の桁になりません。";
        push(phase, k, `${phase}：${operations[option][p]}`, text, action);
      }
      push("repeat", k, k === width ? "指定回数に到達" : "次の桁へ", k === width ? `${width}回の変換が終わったので、ループを抜けます。` : `a、bを実行しました。次はkを${k + 1}にして、次の配列要素へ進みます。`);
    }
    const validBits = cells.every(n => n === 0 || n === 1);
    const decoded = validBits ? cells.reduce((sum, n, i) => sum + n * 2 ** i, 0) : null;
    const matches = decoded === input;
    const output = validBits ? [...cells].reverse().join("") : null;
    push("end", width, option === 3 ? "変換完了：余りを先に、商を後に" : "この処理順の結果を確認", option === 3
      ? `NISHIN(${width})からNISHIN(1)の順に読むと${output}。10進数へ戻すと${decoded}です。先に余りを保存してから商へ更新するため、各桁が失われません。j＝0になった後の桁には0が入ります。`
      : !validBits ? "配列に0・1以外が入りました。商は次に処理するjへ、余りは配列の1桁へ保存する必要があります。"
      : `配列を上位から読むと${output}で、10進数では${decoded}。入力の${input}と一致しません。余りを保存する前の更新や、余りを次のjにする処理を見直してください。`);
    return { states, output, decoded, matches, validBits };
  }
  window.BinaryEngine = { operations, maximum, integer, initial, choices, trace };
})();
