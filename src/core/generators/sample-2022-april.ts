import { code, field, figure, p, pairs, table, strings, variableNotes, type GenerationDefinition } from "./definition";
import { sampleBigramCases } from "./sample-2022-data";

const def = (number: number, title: string, sourceAnswer: string, fields: GenerationDefinition["fields"], reference: number[],
  build: GenerationDefinition["build"], notes: string): GenerationDefinition => ({
  source: `sample-2022-apr-b-${number}`, title, sourceAnswer, fields, reference, build, notes: variableNotes + " " + notes,
});
const array = (values: readonly number[]) => "{" + values.join(", ") + "}";
const rightIndex = (offset: number) => "arrayの要素数 − left" + (offset > 0 ? ` ＋ ${offset}` : offset < 0 ? ` − ${-offset}` : "");
const directions = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
];
export const april2022Definitions: GenerationDefinition[] = [
  def(1, "入場料の条件分岐", "カ",
    [field("最初の年齢上限", 0, 7), field("次の上限までの年齢差", 4, 8), field("最小料金の百円単位", 1, 3), field("料金差の百円単位", 1, 3)], [3, 6, 1, 2],
    ([low, gap, fee, step]) => {
      const high = low + gap, start = low + 1, fees = [fee, fee + step, fee + step * 2].map(n => n * 100);
      return {
        prompt: [p("次のプログラム中の空欄に入れる正しい答えを、解答群の中から選べ。"),
          p(`ある施設の入場料は、0歳から${low}歳までは${fees[0]}円、${start}歳から${high}歳までは${fees[1]}円、${high + 1}歳以上は${fees[2]}円である。関数feeは、年齢を表す0以上の整数を引数として受け取り、入場料を返す。`),
          code(`○整数型: fee(整数型: age)\n  整数型: ret\n  if (age が ${low} 以下)\n    ret ← ${fees[0]}\n  elseif (空欄)\n    ret ← ${fees[1]}\n  else\n    ret ← ${fees[2]}\n  endif\n  return ret`)],
        choices: strings([`(age が ${start} 以上) and (age が ${high} より小さい)`, `(age が ${start} と等しい) or (age が ${high} と等しい)`,
          `(age が ${start} より大きい) and (age が ${high} 以下)`, `age が ${start} 以上`, `age が ${start} より大きい`, `age が ${high} 以下`, `age が ${high} より小さい`]),
        correctIndex: 5,
        explanation: `最初のifを通らなかったときはageが${start}以上である。その中でageが${high}以下なら${fees[1]}円、${high + 1}以上なら${fees[2]}円となる。下限を再判定する必要はない。上限を含めない条件は${high}歳を、下限を含めない条件は${start}歳を誤る。端点だけの条件は途中の年齢を誤り、下限だけでは大人の区分も通してしまう。`,
      };
    }, "元の三段階料金・7条件を維持。年齢の中間区分は4歳分以上を確保し、端点だけの誤答が全域で正答になる条件を除く。料金は百円単位で正の等差。全360入力を料金仕様から独立検算する。"),
  def(2, "配列の逆順化", "ウ",
    [field("配列添字の開始位置", 0, 1), field("要素数", 5, 7), field("配列値の差", 0, 2)], [1, 5, 0],
    ([base, length, shift]) => {
      const data = Array.from({ length }, (_, i) => i + shift + 1), offset = 2 * base - 1;
      const stop = base === 1 ? "(arrayの要素数 ÷ 2 の商)" : "(arrayの要素数 ÷ 2 の商) − 1";
      return {
        prompt: [p("次のプログラム中の空欄aとbに入れる正しい答えの組合せを、解答群の中から選べ。"),
          p(`ここで、配列の要素番号は${base}から始まる。次のプログラムは、整数型の配列arrayの要素の並びを逆順にする。`),
          code(`整数型の配列: array ← ${array(data)}\n整数型: right, left\n整数型: tmp\nfor (left を ${base} から ${stop} まで 1 ずつ増やす)\n  right ← 空欄a\n  tmp ← array[right]\n  array[right] ← array[left]\n  空欄b ← tmp\nendfor`)],
        choices: pairs([[rightIndex(offset - 1), "array[left]"], [rightIndex(offset - 1), "array[right]"], [rightIndex(offset), "array[left]"], [rightIndex(offset), "array[right]"]]),
        correctIndex: 2,
        explanation: `要素番号が${base}から${base + length - 1}なので、左右の添字の和は${length + 2 * base - 1}になる。rightは「${rightIndex(offset)}」。元の右の値をtmpに保存し、右へ左の値を代入済みなので、最後はarray[left]へtmpを戻す。逆順化後は${array([...data].reverse())}となる。`,
      };
    }, "0始まり／1始まりを同じ反転処理へバインドし、開始・終了・対称添字を同時更新。左右の交換を2〜3回で追跡でき、要素は1桁のまま。誤答は対称位置の一つ手前、又は元の右位置への再代入。全18入力を反転した期待配列と比較する。"),
  def(3, "単方向リストの末尾追加", "ア",
    [field("終端の表現", 0, 1), field("既存ノードを指す誤答", 0, 1)], [0, 0],
    ([sentinel, oldReference]) => {
      const empty = sentinel ? "endNode" : "未定義の値";
      const equal = sentinel ? "endNodeと等しい" : "未定義", notEqual = sentinel ? "endNodeと等しくない" : "未定義でない";
      const terminal = sentinel ? "endNodeと等しくない" : "未定義でない";
      return {
        prompt: [p("次のプログラム中の空欄aとbに入れる正しい答えの組合せを、解答群の中から選べ。"),
          p("手続appendは、引数で与えられた文字を単方向リストに追加する。各要素はクラスListElementで表現し、ListElement型の変数はインスタンスの参照を格納する。大域変数listHeadは先頭の要素の参照を格納する。"),
          p(sentinel ? "大域変数endNodeは、データ要素と区別された終端専用のListElementインスタンスを参照する。endNodeのnextは未定義であり、正しい処理では参照しない。空リストのlistHeadと、データ要素の末尾のnextはendNodeを参照する。"
            : "リストが空のときは、listHeadは未定義である。"),
          figure("list-element-class", [sentinel], "図 クラスListElementの説明", ""),
          code(`大域: ListElement: listHead ← ${empty}\n○append(文字型: qVal)\n  ListElement: prev, curr\n  curr ← ListElement(qVal)\n  if (listHead が 空欄a)\n    listHead ← curr\n  else\n    prev ← listHead\n    while (prev.next が ${terminal})\n      prev ← prev.next\n    endwhile\n    prev.next ← 空欄b\n  endif`)],
        choices: pairs([[equal, "curr"], [equal, "curr.next"], [equal, oldReference ? "prev" : "listHead"],
          [notEqual, "curr"], [notEqual, "curr.next"], [notEqual, oldReference ? "prev" : "listHead"]]),
        correctIndex: 0,
        explanation: `空リストは${sentinel ? "listHeadがendNodeと等しい場合" : "listHeadが未定義の場合"}であり、新規要素currを先頭にする。空でなければ、nextが${sentinel ? "endNode" : "未定義"}である末尾へ移動し、そのnextへcurrを代入する。新規要素のnextは${sentinel ? "endNode" : "未定義"}なので末尾の条件を保つ。curr.nextをつなぐだけでは文字を追加できず、既存ノードをつなぐと循環する。終端専用のノードはデータ要素に含めない。`,
      };
    }, "元のappend・クラス図・二空欄・6組を保持。未定義終端と実体を持つ終端専用ノードの二表現を扱い、空状態・新規nextの初期値・ループ停止条件を連動する。名称だけの差し替えではなく、空のheadが未定義か既存オブジェクトかを変える。4入力を空・1要素・複数要素の独立した参照モデルで全検算する。"),
  def(4, "疎行列の座標リスト", "イ",
    [field("行の循環移動", 0, 4), field("列の循環移動", 0, 4), field("非零値の置換", 0, 2)], [0, 0, 0],
    ([rowShift, columnShift, phase]) => {
      const points = [[1, 1, 3], [2, 2, 2], [2, 3, 2], [3, 4, 1], [3, 5, 3], [4, 4, 2], [5, 5, 1]]
        .map(([r, c, n], tag) => ({ r: (r - 1 + rowShift) % 5 + 1, c: (c - 1 + columnShift) % 5 + 1, n: (n - 1 + phase) % 3 + 1, tag }))
        .sort((a, b) => a.r - b.r || a.c - b.c);
      const matrix = Array.from({ length: 5 }, () => Array<number>(5).fill(0));
      points.forEach(point => { matrix[point.r - 1][point.c - 1] = point.n; });
      const rows = points.map(p => p.r), cols = points.map(p => p.c), values = points.map(p => p.n), wrong = [...values];
      const first = points.findIndex(p => p.tag === 4), second = points.findIndex(p => p.tag === 5);
      [wrong[first], wrong[second]] = [wrong[second], wrong[first]];
      const row = rows.join(", "), col = cols.join(", "), val = values.join(", "), bad = wrong.join(", ");
      return {
        prompt: [p("次の記述中の空欄a〜cに入れる正しい答えの組合せを、解答群の中から選べ。ここで、配列の要素番号は1から始まる。"),
          p("要素の多くが0の行列を疎行列という。次のプログラムは、二次元配列に格納された行列を、データ量を削減するために疎行列に適した整数型配列の配列に変換する。"),
          p(`関数transformSparseMatrixをtransformSparseMatrix({${matrix.map(array).join(", ")}})として呼び出したときの戻り値は、{{空欄a}, {空欄b}, {空欄c}}である。`),
          code("○整数型配列の配列: transformSparseMatrix(整数型の二次元配列: matrix)\n  整数型: i, j\n  整数型配列の配列: sparseMatrix\n  sparseMatrix ← {{}, {}, {}} /* 要素数0の配列を三つ要素にもつ配列 */\n  for (i を 1 から matrixの行数 まで 1 ずつ増やす)\n    for (j を 1 から matrixの列数 まで 1 ずつ増やす)\n      if (matrix[i, j] が 0 でない)\n        sparseMatrix[1]の末尾に iの値を追加する\n        sparseMatrix[2]の末尾に jの値を追加する\n        sparseMatrix[3]の末尾に matrix[i, j]の値を追加する\n      endif\n    endfor\n  endfor\n  return sparseMatrix")],
        choices: pairs([[row, col, bad], [row, col, val], [col, row, bad], [col, row, val]], ["a", "b", "c"]), correctIndex: 1,
        explanation: `行を外側、列を内側に走査し、0でない要素だけを追加する。行番号は{${row}}、列番号は{${col}}、値は{${val}}。三つの配列の同じ位置が一つの非零要素に対応し、元の行列を復元できる。`,
      };
    }, "5×5・非零7要素・1〜3の値と四つの三列表を維持。行列の循環移動と値の全単射置換だけを使い、行／列の混同と異なる二要素の値の入れ替えを誤答にする。全75入力を座標の再構成・復元で独立検算する。"),
  def(5, "後続文字の出現割合", "ウ",
    [field("英単語群の例", 0, 3), field("頻度APIの仕様", 0, 1)], [0, 0],
    ([example, internal]) => {
      const sample = sampleBigramCases[example], { words, first, second } = sample;
      let total = 0, hits = 0;
      for (const word of words) for (let i = 0; i + 1 < word.length; i++) if (word[i] === first) { total++; if (word[i + 1] === second) hits++; }
      const denominator = (s: string) => internal ? `words.freqI(${s})` : `(words.freq(${s}) − words.freqE(${s}))`;
      return {
        prompt: [p("次のプログラム中の空欄に入れる正しい答えを、解答群の中から選べ。"),
          p("任意の異なる2文字をc1、c2とするとき、英小文字だけから成る英単語群においてc1の次にc2が出現する割合を求める。語末のc1は割合の計算に含めない。c1とc2の並びが一度も出現しない場合、c1の出現回数によらず割合を0と定義する。"),
          p(`例えば、図の4語${words.map(word => "“" + word + "”").join("、")}でc1を“${first}”、c2を“${second}”とすると、語末以外の“${first}”は${total}個、その次が“${second}”であるものは${hits}個なので、割合は${hits}÷${total}＝${hits / total}である。`),
          figure("bigram-example", [example], "図 4語から成る英単語群の例", ""),
          p("英単語群はWords型の大域変数wordsに格納されている。文字列に対する＋は連結を表す。整数に対する÷は実数として計算する。"),
          table("クラスWordsのメソッドの説明", ["メソッド", "戻り値", "説明"], [["freq(文字列型: str)", "整数型", "英単語群中の文字列strの出現回数を返す。"],
            internal ? ["freqI(文字列型: str)", "整数型", "単語の末尾以外で終わる文字列strの出現回数を返す。"] : ["freqE(文字列型: str)", "整数型", "文字列strで終わる英単語の数を返す。"]]),
          code("大域: Words: words /* 英単語群が格納されている */\n/* c1の次にc2が出現する割合を返す */\n○実数型: prob(文字型: c1, 文字型: c2)\n  文字列型: s1 ← c1の1文字だけから成る文字列\n  文字列型: s2 ← c2の1文字だけから成る文字列\n  if (words.freq(s1 ＋ s2) が 0 より大きい)\n    return 空欄\n  else\n    return 0\n  endif")],
        choices: strings([`${denominator("s1")} ÷ words.freq(s1 ＋ s2)`, `${denominator("s2")} ÷ words.freq(s1 ＋ s2)`,
          `words.freq(s1 ＋ s2) ÷ ${denominator("s1")}`, `words.freq(s1 ＋ s2) ÷ ${denominator("s2")}`]), correctIndex: 2,
        explanation: `分子はc1c2の出現回数。分母は次の文字をもつc1の数なので、${internal ? "freqI(s1)" : "freq(s1)から語末の数freqE(s1)を引いた値"}を用いる。例では${hits}/${total}＝${hits / total}。逆数やc2の数で割る式は別の意味になり、全ての英単語群では成り立たない。並びが0回のときはelseで0を返すため、分母が0の場合も割算しない。`,
      };
    }, "4語の文字図・API表・条件付きの一空欄・四式を維持。freqEによる語末数の減算と、語末以外の出現数を返すfreqIの二APIを条件としてバインドする。全8入力の図と例を確認し、任意入力の関数仕様は独立した文字走査と全選択肢の反例で検算する。"),
  def(6, "クラウドと委託先の責任分担", "オ",
    [field("サービスと委託の範囲", 0, 2), field("指摘事項の順序", 0, 5)], [0, 0],
    ([scenario, ordering]) => {
      const platform = [
        "AサイトはB社のPaaSで稼働しており、PaaS上のDBMSとアプリケーションサーバを利用している。",
        "AサイトのDBMSはB社のDBaaSを利用する。アプリケーションサーバはB社のIaaSの仮想サーバ上に構築し、OSの導入と運用もC社に委託している。",
        "AサイトはB社のPaaSのアプリケーション実行環境を利用する。このPaaSにDBMSは含まれず、DBMSはC社がユーザープログラムとして導入・運用している。",
      ][scenario], order = directions[ordering];
      const issues = ["Aサイトで利用しているDBMSに既知の脆弱性があり、攻撃を受けるおそれがある。", "アプリケーションサーバのOSに既知の脆弱性があり、攻撃を受けるおそれがある。", "ログイン機能の脆弱性によって、会員には非公開の情報を閲覧されるおそれがある。"];
      const options = [["A社", "A社", "A社"], ["A社", "A社", "C社"], ["A社", "B社", "B社"], ["B社", "B社", "B社"], ["B社", "B社", "C社"],
        ["B社", "C社", "B社"], ["B社", "C社", "C社"], ["C社", "B社", "B社"], ["C社", "B社", "C社"], ["C社", "C社", "B社"]];
      const correctIndex = [4, 6, 8][scenario];
      return {
        contexts: [{ title: "A社のECサイトと委託契約", blocks: [
          p("製造業のA社はECサイト（Aサイト）を使用して個人向け製品を販売している。Aサイトは製品やサービスの検索とログイン機能を備え、利用登録した会員の氏名やメールアドレスなどの会員情報を管理する。"),
          p(platform), p("A社はAサイトの開発・運用をC社に委託している。委託契約では、Webアプリケーションプログラムの脆弱性対策はC社が実施するとしている。"),
          p("同業他社でWebサイトの脆弱性による個人情報漏えいが発生したため、A社はセキュリティ診断サービスを行うD社へ脆弱性診断を依頼した。図1に対策が必要とされた指摘事項を示す。"),
        ] }, { title: "図1 D社からの指摘事項", presentation: "text_figure", blocks: order.map((i, position) => p(`(${["一", "二", "三"][position]}) ${issues[i]}`)) }],
        prompt: [p("図1中の項番(一)〜(三)それぞれに対処する組織の適切な組合せを、解答群の中から選べ。")],
        choices: pairs(options.map(option => order.map(i => option[i])), ["(一)", "(二)", "(三)"]), correctIndex,
        explanation: `DBMSは${options[correctIndex][0]}、OSは${options[correctIndex][1]}、Webアプリケーションのログイン機能はC社が対処する。${scenario === 0 ? "PaaSのDBMSとOSはサービス提供者B社の管理範囲である。" : scenario === 1 ? "DBaaSはB社の管理範囲、IaaS上のOSは利用側で扱い、本文の運用委託によりC社が対処する。" : "PaaSのOSはB社の範囲だが、PaaSに含まれずC社が導入したDBMSはC社が対処する。"}図1の項番に対応させると、${order.map((i, position) => `(${["一", "二", "三"][position]})${options[correctIndex][i]}`).join("、")}となる。単にサイト所有者であることだけで全てをA社の責任とはしない。`,
      };
    }, "ECサイト・診断・三つの脆弱性・三組織の10組を保持。PaaS、IaaS＋DBaaS、利用者導入DBMSのPaaSで、サービスと委託の範囲を変える。指摘の並びと選択肢列を同時更新。全18入力を査読して固定した役割対応で検証する。"),
];
