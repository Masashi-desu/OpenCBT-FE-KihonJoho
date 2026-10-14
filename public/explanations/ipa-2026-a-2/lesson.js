/* Original educational text: CC0-1.0. Code: MIT (repository LICENSE). */
(() => {
  "use strict";
  const algorithms = {
    quick: { name: "クイックソート", english: "Quick Sort", short: "基準値で大小に分ける", average: "O(n log n)", worst: "O(n²)",
      overview: "ピボットを基準に、小さい値とそれ以上の値に分けます。分けた範囲でも同じ処理を繰り返します。",
      principle: "分割が終わると、ピボットの最終位置が決まります。左右の範囲はまだ整列済みとは限りません。",
      focus: "末尾をピボットとする方式です。調査位置を左から進め、ピボット未満の値を左へ集めます。同じ値は右側に含めます。",
      exam: "「基準値」「大小のグループ」「各グループでも分割」が識別の手掛かりです。",
      difference: "マージソートは位置で分割してから併合時に整列します。クイックソートは値による分割の段階で整列を進めます。",
      note: "分割が偏ると最悪O(n²)です。末尾ピボットでは整列済みや同値の入力で偏りやすくなります。この交換方式は安定ではありません。" },
    bubble: { name: "バブルソート", english: "Bubble Sort", short: "隣同士を比較・交換する", average: "O(n²)", worst: "O(n²)",
      overview: "隣接する2要素を比較し、左が大きければ交換します。大きな値が少しずつ右へ進みます。",
      principle: "左から右への1周が終わると、未確定部分の最大値が右端に確定します。次の周回ではその位置を除きます。",
      focus: "交換しない比較も追ってみましょう。この実装は交換がない周回でも早期終了せず、対象範囲を1要素ずつ縮めます。",
      exam: "「隣り合ったデータの比較と入替え」を繰り返す方式です。向きを逆にすれば小さい値を左へ送る実装もあります。",
      difference: "選択ソートは最小値を探し終えてから配置します。バブルソートは探索中に隣同士を何度も交換します。",
      note: "同じ値は交換しないので、この実装は安定です。交換なしで終了する改良版では、整列済み入力の処理量を減らせます。" },
    selection: { name: "選択ソート", english: "Selection Sort", short: "最小値を探して配置する", average: "O(n²)", worst: "O(n²)",
      overview: "未確定の範囲をすべて調べて最小値を選び、その範囲の先頭へ配置します。",
      principle: "最小値候補を更新しながら探索します。探索後の交換で、左から1要素ずつ最終位置が確定します。",
      focus: "最小値候補と調査中の要素は別です。候補が先頭なら交換は不要で、交換回数に数えません。",
      exam: "「最小値を求め、それを除いた部分でも最小値を求める」が識別の手掛かりです。",
      difference: "隣接交換で値を運ぶバブルソートと異なり、1周で最小値を決めてから交換します。比較は多くても交換は高々n−1回です。",
      note: "離れた位置の交換で、同じ値の元の順序が変わる場合があります。この実装は安定ではありません。" },
    insertion: { name: "挿入ソート", english: "Insertion Sort", short: "整列済み部分へ挿入する", average: "O(n²)", worst: "O(n²)",
      overview: "左側の整列済み部分へ、次の要素を適切な位置に挿入します。整列済み部分を徐々に広げます。",
      principle: "挿入対象を一時保持し、それより大きい値を右へ1位置ずつずらします。空いた場所へ保持した値を戻します。",
      focus: "空き領域と一時保持の値を確認しましょう。整列済み部分の要素も、後から小さい値が来ると移動します。",
      exam: "「既に整列済みのデータ列の正しい位置にデータを追加」が識別の手掛かりです。",
      difference: "シェルソートは離れた要素のグループで先に挿入整列します。通常の挿入ソートの移動間隔は常に1です。",
      note: "整列済み入力では比較が少なく、逆順ではシフトが多くなります。同じ値を追い越さないので、この実装は安定です。" },
    merge: { name: "マージソート", english: "Merge Sort", short: "分割後に整列して併合する", average: "O(n log n)", worst: "O(n log n)",
      overview: "数列を位置で左右に分け、要素数1まで分割します。整列済みの小さなグループを併合して、大きな整列済みグループにします。",
      principle: "左右の先頭を比べ、小さい方を補助領域へ追加します。一方を使い切ったら、他方の残りをそのまま追加します。",
      focus: "上の配列と下の補助領域は役割が異なります。併合後に元の配列へ順に書き戻します。途中の配列に同じ値のコピーが現れるのは上書きの途中です。",
      exam: "「分割」「整列済みの列を併合」「小さい順に取り出す」が識別の手掛かりです。",
      difference: "クイックソートの分割は値の大小が基準です。マージソートの分割は位置が基準で、整列は併合によって進みます。",
      note: "この実装は同値なら左を先に選ぶため安定です。配列の併合にはO(n)の補助領域を使います。途中の整列済みグループは最終位置の確定と区別します。" },
    heap: { name: "ヒープソート", english: "Heap Sort", short: "最大ヒープから取り出す", average: "O(n log n)", worst: "O(n log n)",
      overview: "親の値が子以上になる最大ヒープを作り、ルートの最大値を未確定部分の末尾へ移します。範囲を縮め、残りを修復します。",
      principle: "完全二分木を配列で表します。位置iの左の子は2i+1、右の子は2i+2です。大きい子と親を比較し、必要なら交換して下へ進みます。",
      focus: "構築・修復中はヒープ条件が一時的に崩れます。「最大ヒープ成立」の状態で、ルートが有効範囲の最大値になります。",
      exam: "「ヒープ」「親子の大小関係」「最大値の取出し」が識別の手掛かりです。",
      difference: "二分探索木は左の子孫が小さく右の子孫が大きいという関係を持ちます。最大ヒープは親が子以上という関係だけで、左右の兄弟の大小順を保証しません。",
      note: "最大ヒープは昇順配列ではありません。初期構築はO(n)、取出しと修復を繰り返す全体はO(n log n)。この交換方式は安定ではありません。" },
    shell: { name: "シェルソート", english: "Shell Sort", short: "間隔を縮めて挿入整列する", average: "間隔の設定に依存", worst: "間隔の設定に依存",
      overview: "離れた要素を同じグループとして挿入整列し、間隔を縮めて繰り返します。最後は間隔1で配列全体を整列します。",
      principle: "間隔hでは、位置をhで割った余りが同じ要素を対象にします。大きい値をh位置右へずらし、保持した値を挿入します。",
      focus: "間隔は⌊n/2⌋から始め、整数で半分に縮めます。8要素なら4→2→1、10要素なら5→2→1です。",
      exam: "「一定間隔で取り出す」「挿入ソート」「間隔を狭める」が識別の手掛かりです。",
      difference: "通常の挿入ソートに先立って離れた位置を整列し、大きな移動を行います。間隔1の段階は通常の挿入ソートです。",
      note: "計算量は間隔列によって変わり、一律にO(n log n)とはいえません。本実装の半減間隔列の最悪はO(n²)です。同じ値の順序が変わり得るため安定ではありません。" },
  };
  const generatedOrder = ["quick", "insertion", "selection", "bubble"];
  const originalChoices = { "choice-1": "insertion", "choice-2": "selection", "choice-3": "quick", "choice-4": "bubble" };
  // Direct document viewing has no saved run or host API. Use only the reviewed
  // original question's display mapping, without creating an application session.
  const standaloneContext = Object.freeze({
    question: Object.freeze({ id: "question-ipa-2026-a-2", correctAnswer: Object.freeze({ choiceId: "choice-3" }) }),
    choiceOrder: Object.freeze(["ア", "イ", "ウ", "エ"].map((label, i) => Object.freeze({ id: `choice-${i + 1}`, label }))),
    selectedChoiceId: null, generation: null, initialParameters: Object.freeze({}),
  });
  function choiceAlgorithms(context) {
    if (!context.generation) return context.question.id === "question-ipa-2026-a-2" ? { ...originalChoices } : {};
    const g = context.generation;
    if (g.generatorRef.id !== "generator-source-2026-a-2" || g.generatorRef.version !== "3.2.0") return {};
    const rotation = g.parameters.values[1];
    if (!Number.isInteger(rotation) || rotation < 0 || rotation > 2) return {};
    return Object.fromEntries(generatedOrder.map((_, i) => [`choice-value-${i + 1}`, generatedOrder[(i + rotation) % 4]]));
  }
  function initialAlgorithm(context) {
    const p = context.initialParameters || {}, choices = choiceAlgorithms(context);
    if (Object.hasOwn(choices, p.choiceId)) return choices[p.choiceId];
    if (Object.hasOwn(algorithms, p.algorithm)) return p.algorithm;
    const g = context.generation;
    if (g?.generatorRef.id === "generator-source-2026-a-2" && g.generatorRef.version === "3.2.0")
      return generatedOrder[g.parameters.values[0]] || "quick";
    return "quick";
  }
  globalThis.SortLesson = Object.freeze({ algorithms, choiceAlgorithms, initialAlgorithm, standaloneContext });
})();
