/* Independently authored sorting trace engine. MIT: repository LICENSE. */
(() => {
  "use strict";
  const algorithms = ["quick", "bubble", "selection", "insertion", "merge", "heap", "shell"];
  const defaultInput = [8, 3, 5, 1, 7, 2, 6, 4];
  const clone = value => structuredClone(value);
  function freeze(value) {
    if (value && typeof value === "object") { Object.freeze(value); Object.values(value).forEach(freeze); }
    return value;
  }
  function parseInput(text) {
    const parts = text.trim().split(/[,，、]/u).map(part => part.trim());
    if (parts.length < 4 || parts.length > 10) throw Error("数列は4〜10個の整数で指定してください。");
    if (parts.some(part => !part)) throw Error("区切りの間や末尾に空の値があります。整数を入力してください。");
    if (parts.some(part => !/^[+-]?\d+$/u.test(part))) throw Error("整数だけをカンマで区切って入力してください。小数や文字は使えません。");
    const values = parts.map(Number);
    if (values.some(value => !Number.isSafeInteger(value) || value < 0 || value > 99))
      throw Error("値は0〜99の整数にしてください。");
    return values;
  }
  const indices = (lo, hi, stride = 1) => {
    const result = []; for (let i = lo; i <= hi; i += stride) result.push(i); return result;
  };
  function generateTrace(algorithm, input) {
    if (!algorithms.includes(algorithm)) throw Error("未対応のアルゴリズムです。");
    if (!Array.isArray(input) || input.length < 4 || input.length > 10 ||
      input.some(value => !Number.isInteger(value) || value < 0 || value > 99)) throw Error("入力値が不正です。");
    const a = input.map((value, id) => ({ id, value })), n = a.length, steps = [];
    const counts = { comparisons: 0, swaps: 0, shifts: 0, insertions: 0, mergeWrites: 0, copyBackWrites: 0, holds: 0 };
    const state = { phase: "開始", range: [0, n - 1], fixed: [], sortedRanges: [],
      groups: [], pivot: null, held: null, candidate: null, merge: null, heap: null, gap: null, depth: 0 };
    const emit = (operation, description, extra = {}) => {
      steps.push(clone({ ...state, array: a, counts, operation, description,
        compared: [], moving: [], comparison: null, transition: null, ...extra }));
    };
    const locate = (index, location = "array", item = a[index]) => ({ index, location, id: item.id, value: item.value });
    const compare = (left, right, relation, explanation) => {
      const result = relation === "<" ? left.value < right.value : relation === ">" ? left.value > right.value : left.value <= right.value;
      counts.comparisons++;
      const comparison = { left, right, relation, result };
      const compared = [left, right].filter(side => side.location === "array").map(side => side.index);
      emit("compare", `${left.value}と${right.value}を比較します。${explanation}`, { comparison, compared });
      emit("judge", `${left.value} ${relation} ${right.value} は${result ? "成立" : "不成立"}です。${explanation}`, { comparison, compared });
      return result;
    };
    const swap = (from, to, description) => {
      if (from === to) { emit("judge", `${description} 同じ位置なので交換は不要です。`); return; }
      const items = [a[from].id, a[to].id];
      [a[from], a[to]] = [a[to], a[from]]; counts.swaps++;
      emit("swap", description, { moving: [from, to], transition: { type: "swap", from, to, items } });
    };
    const fix = (index, description) => {
      if (!state.fixed.includes(index)) state.fixed.push(index);
      emit("fix", description);
    };
    emit("start", "入力数列を昇順に整列します。位置は0から数えます。まだ確定した位置はありません。");

    function quick(lo, hi, depth = 0) {
      if (lo > hi) return;
      Object.assign(state, { phase: "大小への分割", range: [lo, hi], depth, groups: [], pivot: null });
      emit("range", `位置${lo}〜${hi}を処理します。再帰の深さは${depth}です。`);
      if (lo === hi) { fix(lo, `位置${lo}は要素が一つだけなので、その位置を確定します。`); return; }
      const pivot = a[hi]; state.pivot = { ...pivot, index: hi };
      emit("pivot", `末尾の${pivot.value}をピボットに選びます。小さい値と、同じ値を含むそれ以上の値に分けます。`);
      let cut = lo;
      const groups = scanned => { state.groups = [
        { label: `ピボット${pivot.value}未満`, indices: indices(lo, cut - 1) },
        { label: `ピボット${pivot.value}以上（調査済み）`, indices: indices(cut, scanned) },
        { label: "未調査", indices: indices(scanned + 1, hi - 1) },
      ]; };
      groups(lo - 1);
      for (let j = lo; j < hi; j++) {
        const smaller = compare(locate(j), locate(hi), "<", "小さい値を左側のグループへ集めるための判定です。");
        if (smaller) { state.groups = []; swap(cut, j, `${a[j].value}を左側グループの次の位置${cut}へ配置します。`); cut++; }
        groups(j);
        emit("group", `位置${j}まで調べました。左側はピボット未満、右側の調査済み部分はピボット以上です。`);
      }
      state.pivot.index = cut; state.groups = [];
      swap(cut, hi, `ピボット${pivot.value}を境界の位置${cut}へ配置します。`);
      state.groups = [{ label: "左の部分配列", indices: indices(lo, cut - 1) }, { label: "右の部分配列", indices: indices(cut + 1, hi) }];
      fix(cut, `左は${pivot.value}未満、右は${pivot.value}以上なので、ピボットの最終位置${cut}が確定しました。`);
      quick(lo, cut - 1, depth + 1); quick(cut + 1, hi, depth + 1);
    }
    function bubble() {
      state.phase = "隣接比較";
      for (let end = n - 1; end > 0; end--) {
        state.range = [0, end]; emit("range", `未確定の位置0〜${end}を左から調べます。`);
        for (let j = 0; j < end; j++) {
          if (compare(locate(j), locate(j + 1), ">", "左が大きければ隣同士を交換し、大きい値を右へ送ります。"))
            swap(j, j + 1, `${a[j].value}は${a[j + 1].value}より大きいので、隣接する位置${j}と${j + 1}を交換します。`);
          else emit("keep", "左の値は右以下なので交換せず、次の隣接する組へ進みます。");
        }
        fix(end, `この周回の最大値${a[end].value}が未確定部分の末尾${end}へ到達し、位置が確定しました。`);
      }
      fix(0, "残った先頭の要素も位置が確定しました。");
    }
    function selection() {
      state.phase = "最小値の探索";
      for (let i = 0; i < n - 1; i++) {
        state.range = [i, n - 1]; state.candidate = i;
        emit("candidate", `未確定部分の先頭${i}の値${a[i].value}を最小値候補にします。`);
        for (let j = i + 1; j < n; j++) {
          if (compare(locate(j), locate(state.candidate), "<", "未確定部分の最小値候補を更新するための比較です。")) {
            state.candidate = j; emit("candidate", `${a[j].value}の方が小さいので、位置${j}を新しい最小値候補にします。`);
          }
        }
        const minimum = a[state.candidate].value;
        const destination = state.candidate; state.candidate = i;
        swap(i, destination, `最小値${minimum}を未確定部分の先頭${i}へ配置します。`);
        state.candidate = i; fix(i, `残りの中で最小の${minimum}を置いた位置${i}が確定しました。`);
      }
      state.candidate = null; fix(n - 1, "最後に残った要素の位置も確定しました。");
    }
    function insertionPass(gap, shell) {
      state.gap = shell ? gap : null;
      state.phase = shell ? `間隔${gap}の挿入` : "整列済み部分への挿入";
      for (let i = gap; i < n; i++) {
        const residue = i % gap;
        state.range = shell ? [residue, i] : [0, i];
        state.groups = shell ? [{ label: `間隔${gap}・グループ${residue + 1}`, indices: indices(residue, n - 1, gap) }] : [];
        emit("range", `位置${i}の値を、${gap === 1 ? "左側の整列済み部分" : `間隔${gap}の同じグループ`}へ挿入します。`);
        const held = a[i]; a[i] = null; state.held = { ...held, from: i }; counts.holds++;
        state.sortedRanges = [];
        emit("hold", `値${held.value}を一時保持し、位置${i}を空き領域にします。値は失われていません。`);
        let hole = i;
        for (let j = i - gap; j >= residue; j -= gap) {
          if (!compare(locate(j), locate(i, "held", held), ">", `大きい値だけを${gap}位置右へずらし、挿入場所を空けます。`)) break;
          const moved = a[j]; a[hole] = moved; a[j] = null; counts.shifts++;
          emit("shift", `${moved.value}を位置${j}から${hole}へ${gap}位置ずらします。空き領域は${j}へ移ります。`,
            { moving: [j, hole], transition: { type: "shift", from: j, to: hole, items: [moved.id], gap } });
          hole = j;
        }
        a[hole] = held; state.held = null; counts.insertions++;
        state.sortedRanges = [{ lo: residue, hi: i, stride: gap }];
        emit("insert", `一時保持していた${held.value}を位置${hole}へ挿入します。${gap === 1 ? `位置0〜${i}` : "このグループの処理済み部分"}は整列済みですが、最終位置はまだ確定していません。`,
          { moving: [hole], transition: { type: "insert", from: "held", to: hole, items: [held.id] } });
      }
    }
    function insertion() {
      state.sortedRanges = [{ lo: 0, hi: 0, stride: 1 }];
      emit("sorted", "先頭の一つを整列済みとみなします。後の挿入で移動するので、位置はまだ確定ではありません。");
      insertionPass(1, false);
    }
    function merge(lo, hi, depth = 0) {
      state.range = [lo, hi]; state.depth = depth; state.phase = "グループの分割";
      state.merge = { left: [], right: [], output: [], leftCursor: 0, rightCursor: 0, lo, hi, mode: "split" };
      state.sortedRanges = []; state.groups = [];
      emit("range", `位置${lo}〜${hi}のグループを処理します。`);
      if (lo === hi) {
        state.sortedRanges = [{ lo, hi, stride: 1 }];
        emit("sorted", "要素数が1なので、このグループ内では整列済みです。全体での最終位置はまだ確定しません。"); return;
      }
      const mid = Math.floor((lo + hi) / 2);
      state.groups = [{ label: "左グループ", indices: indices(lo, mid) }, { label: "右グループ", indices: indices(mid + 1, hi) }];
      emit("split", `位置${lo}〜${mid}と${mid + 1}〜${hi}へ分割します。基準値による大小の分割ではありません。`);
      merge(lo, mid, depth + 1); merge(mid + 1, hi, depth + 1);
      state.range = [lo, hi]; state.depth = depth; state.phase = "整列しながら併合";
      state.groups = [{ label: "左（整列済み）", indices: indices(lo, mid) }, { label: "右（整列済み）", indices: indices(mid + 1, hi) }];
      state.sortedRanges = [{ lo, hi: mid, stride: 1 }, { lo: mid + 1, hi, stride: 1 }];
      const left = a.slice(lo, mid + 1), right = a.slice(mid + 1, hi + 1), output = [];
      let l = 0, r = 0;
      state.merge = { left, right, output, leftCursor: l, rightCursor: r, lo, hi, mode: "merge" };
      emit("merge", "整列済みの左右グループの先頭を比較し、小さい順に補助領域へ書き込みます。");
      while (l < left.length || r < right.length) {
        let chosen, side, cursor;
        if (l === left.length) { side = "right"; cursor = r; chosen = right[r++]; }
        else if (r === right.length) { side = "left"; cursor = l; chosen = left[l++]; }
        else if (compare(locate(lo + l, "left", left[l]), locate(mid + 1 + r, "right", right[r]), "<=", "小さい値を併合結果へ追加します。同じ値なら左を先にして順序を保ちます。")) {
          side = "left"; cursor = l; chosen = left[l++];
        } else { side = "right"; cursor = r; chosen = right[r++]; }
        output.push(chosen); counts.mergeWrites++;
        state.merge.leftCursor = l; state.merge.rightCursor = r;
        emit("merge-write", `${side === "left" ? "左" : "右"}グループの${chosen.value}を併合結果の位置${output.length - 1}へ書き込みます。元の配列にはまだ反映していません。`,
          { transition: { type: "merge-write", from: { side, cursor }, to: output.length - 1, items: [chosen.id] } });
      }
      state.phase = "併合結果の書戻し"; state.merge.mode = "copy-back"; state.sortedRanges = [];
      for (let k = 0; k < output.length; k++) {
        a[lo + k] = output[k]; counts.copyBackWrites++;
        emit("copy-back", `補助領域の${output[k].value}を配列の位置${lo + k}へ書き戻します。元の値は順に上書きされます。`,
          { moving: [lo + k], transition: { type: "copy-back", from: k, to: lo + k, items: [output[k].id] } });
      }
      state.sortedRanges = [{ lo, hi, stride: 1 }]; state.merge.mode = "merged";
      emit("sorted", `位置${lo}〜${hi}のグループの併合が終わり、グループ内で整列済みになりました。`);
    }
    function heap() {
      state.heap = { size: n, mode: "building", root: null, children: [] };
      state.phase = "最大ヒープの構築";
      function sift(root, size, building) {
        state.heap = { size, mode: building ? "building" : "repairing", root, children: [] };
        state.range = [0, size - 1];
        emit("range", `位置${root}から下へ調べ、親が子以上になるように${building ? "部分木を構築" : "ヒープを修復"}します。`);
        while (root * 2 + 1 < size) {
          let child = root * 2 + 1;
          const right = child + 1;
          state.heap.root = root; state.heap.children = right < size ? [child, right] : [child];
          if (right < size && compare(locate(child), locate(right), "<", "左右の子のうち、大きい方を親との比較対象に選びます。")) child = right;
          state.candidate = child;
          if (!compare(locate(root), locate(child), "<", "親が大きい方の子以上なら交換不要です。小さければ下へ交換します。")) break;
          swap(root, child, `親の${a[root].value}と大きい方の子${a[child].value}を交換し、最大値を上へ送ります。`);
          root = child;
        }
        state.candidate = null;
        emit("heap-repaired", "この部分木の親子関係を修復しました。最大ヒープは配列全体が昇順であることを意味しません。");
      }
      for (let root = Math.floor(n / 2) - 1; root >= 0; root--) sift(root, n, true);
      state.heap = { size: n, mode: "valid", root: 0, children: [] };
      emit("heap-valid", `全体が最大ヒープになりました。ルートの${a[0].value}が最大値です。`);
      for (let end = n - 1; end > 0; end--) {
        state.phase = "最大値の取出し"; state.range = [0, end];
        state.heap.mode = "repairing";
        swap(0, end, `ルートの最大値${a[0].value}を未確定部分の末尾${end}へ移します。`);
        state.heap = { size: end, mode: "repairing", root: 0, children: [] };
        fix(end, `位置${end}が確定したので、ヒープの有効要素数を${end}へ縮めます。残りは修復が必要です。`);
        state.phase = "ヒープの修復"; sift(0, end, false);
        state.heap = { size: end, mode: "valid", root: 0, children: [] };
        emit("heap-valid", "残った有効範囲が最大ヒープになり、次の最大値を取り出せます。");
      }
      fix(0, "最後の要素の位置も確定しました。");
    }
    function shell() {
      for (let gap = Math.floor(n / 2); gap >= 1; gap = Math.floor(gap / 2)) {
        state.gap = gap; state.range = [0, n - 1]; state.sortedRanges = [];
        state.groups = indices(0, gap - 1).map(residue => ({ label: `グループ${residue + 1}`, indices: indices(residue, n - 1, gap) }));
        emit("gap", `比較間隔を${gap}にします。${gap === 1 ? "最後は通常の挿入ソートと同じ隣接比較です。" : "離れた要素を同じグループとして挿入整列します。"}`);
        insertionPass(gap, true);
        state.range = [0, n - 1];
        state.sortedRanges = indices(0, gap - 1).map(lo => ({ lo, hi: n - 1, stride: gap }));
        state.groups = indices(0, gap - 1).map(residue => ({ label: `間隔${gap}・グループ${residue + 1}`, indices: indices(residue, n - 1, gap) }));
        emit("gap-complete", `間隔${gap}の各グループが整列済みになりました。${gap > 1 ? "配列全体の整列や最終位置の確定とは異なります。" : "配列全体が昇順になりました。"}`);
      }
    }
    ({ quick: () => quick(0, n - 1), bubble, selection, insertion,
      merge: () => merge(0, n - 1), heap, shell })[algorithm]();
    Object.assign(state, { phase: "整列完了", range: [0, n - 1], fixed: indices(0, n - 1),
      sortedRanges: [{ lo: 0, hi: n - 1, stride: 1 }], groups: [], pivot: null,
      held: null, candidate: null, merge: null, heap: null, gap: null });
    emit("complete", `全${n}要素が昇順になり、すべての位置が確定しました。`);
    return freeze({ algorithm, input: [...input], steps });
  }
  globalThis.SortEngine = Object.freeze({ algorithms: Object.freeze(algorithms), defaultInput: Object.freeze(defaultInput), parseInput, generateTrace });
})();
