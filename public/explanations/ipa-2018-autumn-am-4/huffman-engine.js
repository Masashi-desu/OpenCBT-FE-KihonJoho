/* Managed Huffman lesson model. MIT: repository LICENSE. */
(() => {
  "use strict";

  // IPA 2018 autumn AM p.4. The original question stores the table as an image.
  const originalRows = [["A", "26", "00"], ["B", "25", "01"], ["C", "24", "10"], ["D", "13", ""], ["E", "12", "111"]];
  const originalCodes = { "choice-1": "001", "choice-2": "010", "choice-3": "101", "choice-4": "110" };

  function initial(context) {
    const table = context?.question.prompt.blocks.find(block => block.type === "table");
    const rows = (table?.rows ?? originalRows).map(([symbol, weight, code]) => ({
      symbol, weight: Number(weight), code: symbol === "D" ? "" : code,
    }));
    const order = context?.choiceOrder ?? Object.keys(originalCodes).map((id, index) => ({ id, label: "アイウエ"[index] }));
    const choices = order.map(({ id, label }) => {
      const choice = context?.question.choices.find(choice => choice.id === id);
      const code = table ? choice?.content.blocks.find(block => block.type === "paragraph")?.text : originalCodes[id];
      return { id, label, code };
    });
    if (rows.map(row => row.symbol).join("") !== "ABCDE" ||
        rows.some(row => !Number.isInteger(row.weight) || row.weight <= 0 || (row.symbol !== "D" && !/^[01]{2,3}$/.test(row.code))) ||
        rows.reduce((sum, row) => sum + row.weight, 0) !== 100 ||
        choices.length !== 4 || choices.some(choice => !/^[01]{2,3}$/.test(choice.code))) {
      throw Error("符号表または選択肢を読み取れません。");
    }
    return { rows, choices };
  }

  function model(rows) {
    const known = rows.filter(row => row.code);
    const missing = [];
    function findMissing(prefix) {
      if (known.some(row => row.code === prefix)) return;
      if (known.some(row => row.code.startsWith(prefix))) {
        findMissing(prefix + "0");
        findMissing(prefix + "1");
      } else missing.push(prefix);
    }
    findMissing("");
    if (missing.length !== 1) throw Error("空欄の枝を特定できません。");

    const letters = rows.map(row => ({ ...row, code: row.code || missing[0] }));
    const nodes = new Map();
    function build(code) {
      const leaf = letters.find(row => row.code === code);
      const children = leaf ? [] : [build(code + "0"), build(code + "1")];
      const node = {
        code, children, symbol: leaf?.symbol,
        label: leaf?.symbol ?? children.map(child => child.label).join(""),
        weight: leaf?.weight ?? children.reduce((sum, child) => sum + child.weight, 0),
        born: 0,
      };
      nodes.set(code, node);
      return node;
    }
    const root = build("");
    const active = new Set([...nodes.values()].filter(node => node.symbol));
    const merges = [];
    while (active.size > 1) {
      const weights = [...active].map(node => node.weight).sort((a, b) => a - b);
      const parent = [...nodes.values()].find(node => node.children.length &&
        node.children.every(child => active.has(child)) &&
        node.children.some(child => child.weight === weights[0]) &&
        node.weight === weights[0] + weights[1]);
      if (!parent) throw Error("出現頻度と符号表が一致しません。");
      const operands = [...parent.children].sort((a, b) => a.weight - b.weight);
      const ties = weights[1] === weights[2] ? [...active].filter(node => node.weight === weights[1]) : [];
      for (const child of operands) active.delete(child);
      active.add(parent);
      parent.born = merges.length + 1;
      merges.push({ parent, operands, ties });
    }
    const fixedWidth = Math.ceil(Math.log2(letters.length));
    return {
      root, nodes, merges, letters, fixedWidth,
      fixedBits: root.weight * fixedWidth,
      huffmanBits: letters.reduce((sum, row) => sum + row.weight * row.code.length, 0),
    };
  }

  function compare(model, code) {
    const collisions = model.letters.filter(row => row.symbol !== "D").flatMap(row => {
      if (code === row.code) return [{ row, kind: "same" }];
      if (code.startsWith(row.code)) return [{ row, kind: "known-prefix" }];
      if (row.code.startsWith(code)) return [{ row, kind: "candidate-prefix" }];
      return [];
    });
    let path = code;
    while (!model.nodes.has(path)) path = path.slice(0, -1);
    return { path, collisions, matches: model.nodes.get(code)?.symbol === "D" };
  }

  window.HuffmanEngine = Object.freeze({ initial, model, compare });
})();
