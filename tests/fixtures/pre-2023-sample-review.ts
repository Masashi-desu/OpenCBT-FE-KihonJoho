// Manually transcribed from IPA's 2022-04 sample, pp.2–11, and visually
// compared on 2026-10-19. This is a review fixture, not a runtime question bank
// or a generated expectation. The algorithms in the test are independent.
// 出典：基本情報技術者試験 科目B試験サンプル問題
// ©2022 独立行政法人情報処理推進機構（IPA）
// choices/answer/inputは公式部分。premisesは査読用の要約、explanationは
// 独自の検算メモであり、IPAの公式解説ではない。公式部分へMIT/CC0を適用
// しない。教育目的利用の個別条件はtermsを参照。アプリ配布データには含めない。
export const aprilBReview = {
  collectionId: "2022-apr-sample-b",
  checkedOn: "2026-10-19",
  questionPaper: {
    url: "https://www.ipa.go.jp/shiken/syllabus/ps6vr7000000oett-att/fe_kamoku_b_sample.pdf",
    sha256: "2fd7381d998d44cba7f53a8603051a8a1ded63ca05c63c35b2ec0ed5db774ef4",
  },
  terms: "https://www.ipa.go.jp/shiken/syllabus/henkou/2022/20220425.html",
  attribution: "出典：基本情報技術者試験 科目B試験サンプル問題",
  scope: "原問題の入力・全選択肢・正答の検算。改変生成器、配布用転記、UI表示の検証には流用しない。",
  materialReview: "p.1〜12のうち問題p.2〜10・解答p.11・末尾p.12を目視確認。第三者の引用・出所表示は特定しなかった。権利の不存在保証ではなく、サンプル全般の改変許諾を取得したことにもならない。",
  questions: [
    {
      number: 1, pages: [2], answer: "カ", choices: [
        "(age が 4 以上) and (age が 9 より小さい)",
        "(age が 4 と等しい) or (age が 9 と等しい)",
        "(age が 4 より大きい) and (age が 9 以下)",
        "age が 4 以上", "age が 4 より大きい", "age が 9 以下", "age が 9 より小さい",
      ],
      premises: ["ageは0以上の整数", "0〜3歳は100円、4〜9歳は300円、10歳以上は500円", "最初のifはageが3以下"],
      input: { boundaries: [3, 9], fees: [100, 300, 500] },
      explanation: "最初の分岐を通らなかった時点でageは4以上である。9以下なら300円、それ以外なら500円になる。両端の4・9と10以上を区別する。",
    },
    {
      number: 2, pages: [3], answer: "ウ", choices: [
        ["arrayの要素数 − left", "array[left]"],
        ["arrayの要素数 − left", "array[right]"],
        ["arrayの要素数 − left ＋ 1", "array[left]"],
        ["arrayの要素数 − left ＋ 1", "array[right]"],
      ],
      premises: ["配列の要素番号は1から始まる", "leftは1から要素数÷2の商まで", "tmp←array[right]の後にarray[right]←array[left]を実行する"],
      input: [1, 2, 3, 4, 5],
      explanation: "1始まりで対称な位置はn−left＋1。右側の元の値をtmpへ保存済みなので、最後はarray[left]へtmpを代入する。",
    },
    {
      number: 3, pages: [4, 5], answer: "ア", choices: [
        ["未定義", "curr"], ["未定義", "curr.next"], ["未定義", "listHead"],
        ["未定義でない", "curr"], ["未定義でない", "curr.next"], ["未定義でない", "listHead"],
      ],
      premises: ["単方向リストへの文字の追加", "ListElement型はインスタンスの参照", "空リストのlistHeadは未定義", "新規要素のnextは未定義", "curr←ListElement(qVal)", "prev.nextが未定義でない間prev←prev.next"],
      explanation: "空なら新規ノードcurrを先頭にする。空でなければ末尾へ移動し、末尾のnextへcurrをつなぐ。curr.nextは未定義なのでつながらず、listHeadをつなぐと循環する。",
    },
    {
      number: 4, pages: [6], answer: "イ", choices: [
        [[1, 2, 2, 3, 3, 4, 5], [1, 2, 3, 4, 5, 4, 5], [3, 2, 2, 1, 2, 3, 1]],
        [[1, 2, 2, 3, 3, 4, 5], [1, 2, 3, 4, 5, 4, 5], [3, 2, 2, 1, 3, 2, 1]],
        [[1, 2, 3, 4, 5, 4, 5], [1, 2, 2, 3, 3, 4, 5], [3, 2, 2, 1, 2, 3, 1]],
        [[1, 2, 3, 4, 5, 4, 5], [1, 2, 2, 3, 3, 4, 5], [3, 2, 2, 1, 3, 2, 1]],
      ],
      premises: ["配列の要素番号は1から始まる", "sparseMatrixは空配列三つで初期化", "行iを外側、列jを内側に走査", "0以外を行番号・列番号・値の三つの配列に追加"],
      input: [[3, 0, 0, 0, 0], [0, 2, 2, 0, 0], [0, 0, 0, 1, 3], [0, 0, 0, 2, 0], [0, 0, 0, 0, 1]],
      explanation: "行を優先して非零要素を読むと、(1,1)=3、(2,2)=2、(2,3)=2、(3,4)=1、(3,5)=3、(4,4)=2、(5,5)=1となる。行番号、列番号、値をそれぞれ同じ順に並べる。",
    },
    {
      number: 5, pages: [7, 8], answer: "ウ", choices: [
        "(words.freq(s1) − words.freqE(s1)) ÷ words.freq(s1 ＋ s2)",
        "(words.freq(s2) − words.freqE(s2)) ÷ words.freq(s1 ＋ s2)",
        "words.freq(s1 ＋ s2) ÷ (words.freq(s1) − words.freqE(s1))",
        "words.freq(s1 ＋ s2) ÷ (words.freq(s2) − words.freqE(s2))",
      ],
      premises: ["c1とc2は異なる英小文字", "末尾のc1は分母に含めない", "二文字の並びが0回ならc1の出現回数によらず0", "＋は文字列の連結", "÷は実数として計算", "freqは出現回数、freqEはその文字列で終わる単語数"],
      input: { words: ["importance", "inflation", "information", "innovation"], c1: "n", c2: "f" },
      explanation: "c1の総出現数から語末のc1を引いたものが次の文字をもつc1の数。そのうちc1c2の出現数が分子になる。例では2/5＝0.4。並びがなければifを通らず0となる。",
    },
    {
      number: 6, pages: [9, 10], answer: "オ", choices: [
        ["A社", "A社", "A社"], ["A社", "A社", "C社"], ["A社", "B社", "B社"],
        ["B社", "B社", "B社"], ["B社", "B社", "C社"], ["B社", "C社", "B社"],
        ["B社", "C社", "C社"], ["C社", "B社", "B社"], ["C社", "B社", "C社"], ["C社", "C社", "B社"],
      ],
      premises: ["AサイトはB社のPaaS上のDBMSとアプリケーションサーバを利用", "A社が開発・運用をC社に委託", "委託契約でWebアプリケーションプログラムの脆弱性対策をC社が実施", "指摘の順はDBMS、アプリケーションサーバのOS、ログイン機能"],
      // Reviewed from the explicit contract and PaaS scope in the question.
      // These correspondences are fixed by the review, not by a generator.
      responsibilities: { "DBMS": "B社", "OS": "B社", "Webアプリケーション": "C社" },
      issues: ["DBMS", "OS", "Webアプリケーション"],
      explanation: "PaaS基盤のDBMSとOSは提供者B社、ログイン機能のWebアプリケーションは委託契約によりC社が対処する。A社が利用者であることだけで、全ての対処組織をA社にはしない。",
    },
  ],
} as const;
