/* Managed Huffman lesson. MIT: repository LICENSE. */
(() => {
  "use strict";
  const api = window.OpenCBTDetail, engine = window.HuffmanEngine;
  const $ = id => document.getElementById(id);

  if (api) {
    document.documentElement.dataset.theme = api.context.theme;
    api.onThemeChange(theme => { document.documentElement.dataset.theme = theme; });
    api.setPresentation("huffman");
  } else {
    $("standalone-title").hidden = $("standalone-credit").hidden = false;
    window.OpenCBTHuffmanScrollbars?.installOverlayScrollbars(document);
  }

  let model, choices, sourceRows;
  try {
    const input = engine.initial(api?.context);
    sourceRows = input.rows;
    model = engine.model(input.rows);
    choices = input.choices;
    if (choices.filter(choice => engine.compare(model, choice.code).matches).length !== 1) {
      throw Error("Dの符号と選択肢が一致しません。");
    }
  } catch (error) {
    $("lesson").hidden = true;
    $("error").textContent = error.message;
    $("error").hidden = false;
    api?.ready();
    return;
  }

  const { root, nodes, merges, letters, fixedWidth, fixedBits, huffmanBits } = model;
  const readStep = merges.length + 1, encodeStep = readStep + 1, totalStep = encodeStep + 1;
  const target = letters.find(letter => letter.symbol === "D");
  const exampleBits = letters.reduce((sum, letter) => sum + letter.code.length, 0);
  const nodeButtons = new Map(), branches = new Map(), linkedButtons = new Map(), sourceCells = new Map();
  let step = 0, selection = null, leafIndex = 0;

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function toggle(button, type, value) {
    button.addEventListener("click", () => {
      selection = selection?.type === type && selection.value === value ? null : { button, type, value };
      draw();
    });
  }

  for (const [index, { symbol, weight, code: knownCode }] of sourceRows.entries()) {
    const { code } = letters[index];
    const button = element("button", symbol, "source-letter");
    button.type = "button";
    button.setAttribute("aria-label", symbol + "の葉を選ぶ");
    toggle(button, "node", code);
    const heading = element("th");
    heading.scope = "col";
    heading.append(button);
    $("source-symbols").append(heading);

    const frequency = element("span", weight + "%");
    const word = knownCode ? element("code", knownCode) : element("var", "a", "source-blank");
    for (const [row, value] of [["source-weights", frequency], ["source-codes", word]]) {
      const cell = element("td");
      cell.append(value);
      $(row).append(cell);
    }
    sourceCells.set(code, { button, frequency, word });
  }

  const nodeLabel = node => node === root ? "根" : node.label;

  function position(element, x, y) {
    element.style.setProperty("--x", x + "%");
    element.style.setProperty("--y", y + "%");
  }

  function place(node) {
    const children = node.children.map(place);
    const x = node.symbol ? (leafIndex++ + .5) * 100 / letters.length : (children[0].x + children[1].x) / 2;
    const y = node.symbol ? 85 : 12 + node.code.length * 23;
    const button = element("button", "", "node");
    button.type = "button";
    button.dataset.code = node.code;
    button.append(element("strong", nodeLabel(node)), element("span", node.weight + "%"));
    button.setAttribute("aria-label", nodeLabel(node) + "、" + node.weight + "%");
    position(button, x, y);
    toggle(button, "node", node.code);
    nodeButtons.set(node.code, button);
    $("tree").append(button);
    for (const [index, child] of children.entries()) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.classList.add("edge");
      for (const [attr, value] of Object.entries({ x1: x, y1: y, x2: child.x, y2: child.y })) line.setAttribute(attr, value);
      $("edges").append(line);
      const bit = element("span", String(index), "branch");
      bit.setAttribute("aria-hidden", "true");
      position(bit, (x + child.x) / 2, (y + child.y) / 2);
      $("tree").append(bit);
      branches.set(node.children[index].code, { line, bit });
    }
    return { x, y };
  }
  place(root);

  const choiceButtons = choices.map(choice => {
    const button = element("button", choice.label + " " + choice.code);
    button.type = "button";
    toggle(button, "choice", choice);
    $("comparison").append(button);
    return button;
  });
  for (const letter of letters) {
    const buttons = [];
    for (const [group, value] of [
      ["chunks", letter.code],
      ["terms", letter.weight + "×" + letter.code.length],
    ]) {
      const button = element("button", "", "letter-button");
      button.type = "button";
      button.append(element("span", letter.symbol), element(group === "chunks" ? "code" : "b", value));
      button.setAttribute("aria-label", letter.symbol + (group === "chunks" ? " の符号 " + value : "、" + letter.weight + "文字 × " + letter.code.length + "ビット"));
      toggle(button, "node", letter.code);
      $(group).append(button);
      buttons.push(button);
    }
    linkedButtons.set(letter.code, buttons);
  }
  $("fixed-bits").textContent = fixedBits + " ビット";
  $("huffman-bits").textContent = huffmanBits + " ビット";
  $("huffman-bar").style.setProperty("--ratio", 100 * huffmanBits / fixedBits + "%");

  function markedTerm(text, mark) {
    const term = element("span", text);
    term.dataset.mark = mark;
    return term;
  }
  const mergeTerm = (node, mark) => markedTerm(nodeLabel(node) + " " + node.weight + "%", mark);
  const pathFormula = code => [markedTerm([...code].join(" → "), "path"), " ⇒ ", element("code", code)];
  const mark = (node, value) => {
    if (value) node.dataset.mark = value;
    else delete node.dataset.mark;
  };

  function explain(merge, node, choice, comparison, tieRows) {
    if (choice) {
      const prefix = element("span", comparison.path);
      prefix.dataset.mark = comparison.matches ? "path" : "conflict";
      if (comparison.matches) return ["選択肢" + choice.label + "はDに到達", [prefix, " → D"], "根から枝を順にたどると、Dの葉に着きます。"];
      const rest = choice.code.slice(comparison.path.length);
      const candidate = rest ? [prefix, element("span", rest, "unread-bits")] : [prefix];
      const reasons = comparison.collisions.map(({ row, kind }) => {
        if (kind === "same") return row.symbol + "の符号 " + row.code + " と一致します。";
        if (kind === "known-prefix") return row.symbol + "の符号 " + row.code + " が先頭に現れ、" + row.symbol + "として読まれます。";
        return row.symbol + "の符号 " + row.code + " の先頭と重なります。";
      });
      return ["選択肢" + choice.label + "は符号が衝突", candidate, reasons.join("")];
    }
    if (node) {
      if (node.symbol && step === totalStep) {
        return [node.symbol + "が占めるビット数", [markedTerm(node.weight + " × " + node.code.length, "path"), " ＝ " + node.weight * node.code.length + " ビット"],
          "100文字中の出現回数に、根から葉までの枝の本数（1文字の符号長）を掛けます。"];
      }
      if (node.symbol && step >= readStep) {
        return [node.symbol + "の符号を読む", pathFormula(node.code),
          "根から選んだ葉に向かって枝の0と1を読みます。枝" + node.code.length + "本で" + node.code.length + "ビットです。"];
      }
      if (node.children.length) {
        return [node === root ? "根に全体の頻度が集まる" : node.label + "の出現頻度", [
          ...node.children.flatMap((child, i) => [i ? " ＋ " : "", mergeTerm(child, i ? "second" : "first")]),
          " ＝ ", mergeTerm(node, "result"),
        ], "親の出現頻度は、左右の子の出現頻度の合計です。"];
      }
      return [node.symbol + "の出現頻度", [markedTerm(node.weight + "%", "path")],
        "表の" + node.symbol + "の値です。この頻度で100文字あるとすると、" + node.weight + "回出現します。"];
    }
    if (merge) {
      const [first, second] = merge.operands;
      const formula = [mergeTerm(first, "first"), " ＋ ", mergeTerm(second, "second"), " ＝ ", mergeTerm(merge.parent, "result")];
      if (merge.parent === root) {
        return ["根に5文字をまとめる", formula,
          "重ならない2組の出現頻度を足すと、表の5文字全体で100%になります。次はこの根からDへの経路を読みます。"];
      }
      if (merge.ties.length) {
        const tied = merge.ties.map(node => node.label).join("と") + "は同じ重み（" + second.weight + "%）です。";
        const evidence = tieRows.map(row => row.symbol + "の " + row.code).join(" と ");
        const reason = tieRows.length === 2
          ? "表の " + evidence + " はどちらも " + merge.parent.code + " で始まるので、" + second.label + "を選びます。"
          : "与えられた符号表に合う" + second.label + "を選びます。";
        return ["同じ重みは符号表で見分ける", formula, tied + reason];
      }
      const note = step === 1
        ? "表で頻度が小さい2文字から結合します。先に結合した文字は木の深い位置に入り、頻度の高い文字に短い符号を割り当てられます。"
        : "親のない節のうち小さい2節を結合します。複数の文字を含む節の重みは、それらの出現頻度の合計です。";
      return ["小さい2節を結合", formula, note];
    }
    if (step === readStep) {
      const answer = choices.find(choice => choice.code === target.code);
      return ["根からDまでの枝を読む", pathFormula(target.code),
        "左の枝は0、右の枝は1です。Dに着くのは選択肢" + answer.label + "。ほかの選択肢がどこで衝突するか、下で試せます。"];
    }
    if (step === encodeStep) {
      return ["ABCDEをビット列に置き換える", [element("code", letters.map(letter => letter.code).join(""))],
        "下の各区間は1文字分です。実際は区切りを送らずにつなげます。この5文字で固定長は" +
          letters.length * fixedWidth + "ビット、ハフマン符号は" + exampleBits + "ビットです。"];
    }
    if (step === totalStep) {
      return ["出題の頻度で100文字を符号化", [letters.map(letter => letter.weight * letter.code.length).join(" ＋ ") + " ＝ " + huffmanBits + " ビット"],
        "表の頻度を100文字中の出現回数として、文字ごとに符号長を掛けて足します。固定長は5種類を区別する" + fixedWidth + "ビット×100文字で" + fixedBits + "ビットです。出現しやすい文字に短い符号を割り当てると、" +
          (fixedBits - huffmanBits) + "ビット（" + 100 * (fixedBits - huffmanBits) / fixedBits + "%）減ります。符号表などの付加情報は計算に含めません。"];
    }
    return ["5文字を葉に置く", [], "表の出現頻度を対応する葉に置きます。太枠はまだ親がない節です。「次へ」で、その中の小さい2節を結合します。"];
  }

  function draw() {
    const merge = merges[step - 1];
    const node = selection?.type === "node" ? nodes.get(selection.value) : null;
    const choice = selection?.type === "choice" ? selection.value : null;
    const comparison = choice ? engine.compare(model, choice.code) : null;
    const path = comparison?.path ?? (step >= readStep && node?.symbol ? node.code : step === readStep && !node ? target.code : "");
    const operands = node?.children.length ? node.children : node ? [] : merge?.operands ?? [];
    const parent = node?.children.length ? node : node ? null : merge?.parent;
    const tieRows = !selection && merge?.ties.length
      ? operands.map(operand => sourceRows.find(row => row.code && row.code.startsWith(operand.code))).filter(Boolean)
      : [];
    const highlight = new Map(operands.map((child, index) => [child.code, index ? "second" : "first"]));
    if (parent) highlight.set(parent.code, "result");
    if (path) highlight.set(path, comparison && !comparison.matches ? "conflict" : "path");
    else if (node?.symbol) highlight.set(node.code, "path");
    for (const { row } of comparison?.collisions ?? []) highlight.set(row.code, "conflict");

    for (const [code, { button, frequency, word }] of sourceCells) {
      const chosen = node?.code === code;
      const operand = operands.find(child => code.startsWith(child.code));
      const weightMark = chosen && (step < readStep || step === totalStep) ? "path" : highlight.get(operand?.code);
      const traceMark = highlight.get(code);
      const codeMark = tieRows.some(row => row.code === code) ? weightMark
        : traceMark === "path" || traceMark === "conflict" ? traceMark : null;
      button.setAttribute("aria-pressed", String(chosen));
      mark(frequency, weightMark);
      mark(word, step >= readStep || tieRows.length ? codeMark : null);
    }

    for (const [code, button] of nodeButtons) {
      button.hidden = nodes.get(code).born > step;
      button.dataset.active = String(step <= merges.length && !button.hidden &&
        (code === "" || nodes.get(code.slice(0, -1)).born > step));
      button.setAttribute("aria-pressed", String(node?.code === code));
      mark(button, highlight.get(code));
    }
    for (const [code, { line, bit }] of branches) {
      const visible = nodes.get(code.slice(0, -1)).born <= step;
      line.toggleAttribute("hidden", !visible);
      bit.hidden = !visible || step < readStep;
      const edgeMark = path.startsWith(code) ? comparison && !comparison.matches ? "conflict" : "path" :
        highlight.has(code) && code.slice(0, -1) === parent?.code ? highlight.get(code) : null;
      mark(line, edgeMark);
      mark(bit, edgeMark);
    }
    for (const [index, button] of choiceButtons.entries()) button.setAttribute("aria-pressed", String(choice === choices[index]));
    for (const [code, buttons] of linkedButtons) for (const button of buttons) button.setAttribute("aria-pressed", String(node?.code === code));

    const [title, formula, note] = explain(merge, node, choice, comparison, tieRows);
    $("step-title").textContent = title;
    $("formula").replaceChildren(...formula);
    $("formula").hidden = !formula.length;
    $("step-note").textContent = note;
    $("comparison").hidden = step !== readStep;
    $("example").hidden = step !== encodeStep;
    $("totals").hidden = step !== totalStep;
    $("prev").setAttribute("aria-disabled", String(step === 0));
    $("next").setAttribute("aria-disabled", String(step === totalStep));
    $("counter").textContent = (step + 1) + " / " + (totalStep + 1);
    $("seek").value = step;
    $("seek").setAttribute("aria-valuetext", (step + 1) + " / " + (totalStep + 1) + " " + title);
  }

  function move(next) {
    if (next < 0 || next > totalStep || next === step) return;
    step = next;
    selection = null;
    draw();
  }
  $("seek").max = totalStep;
  $("seek").addEventListener("input", event => move(event.currentTarget.valueAsNumber));
  $("prev").addEventListener("click", () => move(step - 1));
  $("next").addEventListener("click", () => move(step + 1));
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !selection) return;
    const button = selection.button;
    selection = null;
    draw();
    button.focus();
  });
  draw();
  api?.ready();
})();
