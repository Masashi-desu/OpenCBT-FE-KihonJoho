/** Visual source transcription; no runtime HTML or source-code execution. */
const source={
  "status": "visual_transcription_source_only_pending_parent_review",
  "source": "2017h29h-fe-pm-4",
  "title": "無線LANにおけるデータの送信",
  "physicalAndPrintedPages": [
    17,
    18,
    19,
    20
  ],
  "previousQuestionEnd": 16,
  "nextQuestionStart": 21,
  "units": [
    {
      "id": "selection-note",
      "kind": "paragraph",
      "page": 17,
      "text": "選択した問題は，選択欄の選をマークしてください。マークがない場合は，採点されません。"
    },
    {
      "id": "title",
      "kind": "paragraph",
      "page": 17,
      "text": "問4 無線LANにおけるデータの送信に関する次の記述を読んで，設問1〜3に答えよ。"
    },
    {
      "id": "intro",
      "kind": "paragraph",
      "page": 17,
      "text": "無線LANではフレームを使用してデータを送信する。フレームにはデータフレームやACKフレームがあり，データはデータフレームに格納して送信する。データフレームには，フレームの制御情報とTCP/IPパケットが含まれる。一つのデータフレームに格納できるデータ長には上限があり，上限を超えるデータを送信したいときは，データを複数のデータフレームに分けて送信する。無線LANでは，複数の機器から送信されるフレームがなるべく衝突しないように工夫して，フレームを送信する。"
    },
    {
      "id": "flow-lead",
      "kind": "paragraph",
      "page": 17,
      "text": "無線LANにおけるデータフレーム送信の大まかな流れを，(1)〜(7)に示す（図1参照）。ここで，W1，W2は待機時間を表す量である。W2はあらかじめ定められた値で，W1はW2を超えるように毎回決められるランダムな値である。"
    },
    {
      "id": "flow",
      "kind": "ordered-list",
      "page": 17,
      "items": [
        "データフレームを送信しようとする機器は，送信前に他の機器がフレームを送信しているかどうかを調べる。",
        "他の機器がフレームを送信していれば，そのフレームの送信が終了するまで待機する。",
        "他の機器がフレームを送信していなければ，W1だけ待機する。",
        "W1の間に，他の機器がフレームの送信を開始しなければ，データフレームを送信し，受信側機器からのACKフレームの到着を待つ。",
        "W1の間に，他の機器がフレームの送信を開始したときは，(2)に戻る。",
        "データフレームを受信した機器は，データフレームを受信後，W2だけ待機した後，ACKフレームを送信する。",
        "複数のデータフレームを送信する必要があるときは，(1)〜(6)を繰り返す。"
      ],
      "sourceMarkers": [
        "(1)",
        "(2)",
        "(3)",
        "(4)",
        "(5)",
        "(6)",
        "(7)"
      ],
      "ordered": true
    },
    {
      "id": "figure1",
      "kind": "figure",
      "page": 18,
      "caption": "図1 データフレーム送信の例",
      "note": "注記 矢印はフレームの送信方向を表す。"
    },
    {
      "id": "rate",
      "kind": "paragraph",
      "page": 18,
      "text": "一つのデータフレームに格納できる最大データ長（フレームの制御情報やTCP/IPパケットのヘッダなどの情報を除くデータ本体）を1,460バイトとする。物理層の通信速度が54Mビット／秒のとき，最大データ長のデータを格納したデータフレームの送信時間は248マイクロ秒，ACKフレームの送信時間は24マイクロ秒である。W1の平均とW2が，物理層の通信速度に関係なく，それぞれ101.5マイクロ秒と16マイクロ秒であるとき，データ送信速度（単位時間に送信できるデータ量）は，最大で［a］Mビット／秒程度になる。"
    },
    {
      "id": "comparison",
      "kind": "paragraph",
      "page": 18,
      "text": "次に，三台の機器A，B及びCがある場合について考える。①機器Aだけが機器Cに対して1Mバイトのデータの送信処理を行ったときと，②機器Aと機器Bのそれぞれが機器Cに対して，それぞれ1Mバイトのデータの送信処理を同時に開始したときを比較すると，機器Aから機器Cへのデータの送信処理に掛かる時間は，平均的には［b］。ここで，機器Aと機器Cの間，及び機器Bと機器Cの間それぞれの物理層の通信速度は54Mビット／秒とする。また，フレームの衝突はなく，フレームの再送信も行われなかったものとする。",
      "underlined": [
        "①機器Aだけが機器Cに対して1Mバイトのデータの送信処理を行ったとき",
        "②機器Aと機器Bのそれぞれが機器Cに対して，それぞれ1Mバイトのデータの送信処理を同時に開始したとき"
      ]
    },
    {
      "id": "q1",
      "kind": "paragraph",
      "page": 18,
      "text": "設問1 本文中の［ ］に入れる正しい答えを，解答群の中から選べ。"
    },
    {
      "id": "a-group",
      "kind": "choice-group",
      "page": 18,
      "group": "a",
      "caption": "aに関する解答群"
    },
    {
      "id": "b-group",
      "kind": "choice-group",
      "page": 18,
      "group": "b",
      "caption": "bに関する解答群"
    },
    {
      "id": "q2-instruction",
      "kind": "paragraph",
      "page": 19,
      "text": "設問2 次の記述中の［ ］に入れる適切な答えを，解答群の中から選べ。ここで，c1とc2に入れる答えは，cに関する解答群の中から組合せとして適切なものを選ぶものとする。"
    },
    {
      "id": "q2",
      "kind": "paragraph",
      "page": 19,
      "text": "無線LANの物理層の通信速度は，機器間の距離や障害物の有無などによって変化する。機器Bを機器Cから離すことによって，機器Bと機器Cの間の物理層の通信速度が24Mビット／秒になった。機器Aと機器Cの間の物理層の通信速度は54Mビット／秒のままである。機器Aと機器Bのそれぞれが，機器Cに対して，それぞれ1Mバイトのデータの送信処理を同時に開始した。このとき，機器Bと機器Cの間の物理層の通信速度が54Mビット／秒から24Mビット／秒になったことによって，［c1］。したがって，機器Aから機器Cへのデータ送信速度は，機器Bと機器Cの間の物理層の通信速度が54Mビット／秒だったときと比較して，［c2］。"
    },
    {
      "id": "c-group",
      "kind": "choice-table",
      "page": 19,
      "group": "c",
      "caption": "cに関する解答群",
      "columns": [
        "",
        "c1",
        "c2"
      ],
      "rows": [
        [
          "ア",
          "機器Aが，機器Bによるフレーム送信終了まで待機する時間が長くなる",
          "低下する"
        ],
        [
          "イ",
          "機器Aが，W1だけ待機する回数が多くなる",
          "低下する"
        ],
        [
          "ウ",
          "機器Aと機器Cの間の物理層の通信速度が，機器Bと機器Cの間の物理層の通信速度と比べて向上する",
          "向上する"
        ],
        [
          "エ",
          "機器Aと機器Cの間の物理層の通信速度に与える影響はない",
          "変わらない"
        ],
        [
          "オ",
          "機器BのW1が長くなり，機器Aの通信が優先される",
          "向上する"
        ],
        [
          "カ",
          "送信されるデータの量は変わらない",
          "変わらない"
        ]
      ]
    },
    {
      "id": "q3-instruction",
      "kind": "paragraph",
      "page": 20,
      "text": "設問3 無線LANにおける，データ送信速度を向上させる工夫を三つ，次に示す。これらのうち，伝送効率（データ送信速度÷物理層の通信速度）の向上に寄与するものだけを全て挙げたものとして適切な答えを，解答群の中から選べ。"
    },
    {
      "id": "technique-heading",
      "kind": "paragraph",
      "page": 20,
      "text": "［データ送信速度を向上させる工夫］"
    },
    {
      "id": "techniques",
      "kind": "ordered-list",
      "page": 20,
      "items": [
        "複数のデータフレームに対応する一つのACKを返すことによって，ACKフレームの個数を削減する。",
        "複数のデータフレームをまとめて送信することによって，W1だけ待機する回数を削減する。",
        "物理層の通信速度を向上させる。"
      ],
      "sourceMarkers": [
        "(Ⅰ)",
        "(Ⅱ)",
        "(Ⅲ)"
      ],
      "ordered": true
    },
    {
      "id": "q3-group",
      "kind": "choice-group",
      "page": 20,
      "group": "q3",
      "caption": "解答群"
    }
  ],
  "groups": [
    {
      "id": "a",
      "page": 18,
      "choices": [
        "4",
        "6",
        "30",
        "47"
      ],
      "kind": "numeric_about_Mbit_per_second"
    },
    {
      "id": "b",
      "page": 18,
      "choices": [
        "①の方が短い",
        "②の方が短い",
        "等しい"
      ],
      "kind": "relative_average_time"
    },
    {
      "id": "c",
      "page": 19,
      "columns": [
        "c1",
        "c2"
      ],
      "choices": [
        [
          "機器Aが，機器Bによるフレーム送信終了まで待機する時間が長くなる",
          "低下する"
        ],
        [
          "機器Aが，W1だけ待機する回数が多くなる",
          "低下する"
        ],
        [
          "機器Aと機器Cの間の物理層の通信速度が，機器Bと機器Cの間の物理層の通信速度と比べて向上する",
          "向上する"
        ],
        [
          "機器Aと機器Cの間の物理層の通信速度に与える影響はない",
          "変わらない"
        ],
        [
          "機器BのW1が長くなり，機器Aの通信が優先される",
          "向上する"
        ],
        [
          "送信されるデータの量は変わらない",
          "変わらない"
        ]
      ],
      "kind": "one_combined_table_row_not_two_answers"
    },
    {
      "id": "q3",
      "page": 20,
      "choices": [
        "(Ⅰ)",
        "(Ⅰ)と(Ⅱ)",
        "(Ⅰ)と(Ⅲ)",
        "(Ⅱ)",
        "(Ⅱ)と(Ⅲ)",
        "(Ⅲ)"
      ],
      "kind": "enumerate_all_and_only_improving_efficiency_techniques"
    }
  ],
  "answerParts": [
    {
      "id": "a",
      "label": "設問1 a",
      "group": "a"
    },
    {
      "id": "b",
      "label": "設問1 b",
      "group": "b"
    },
    {
      "id": "c",
      "label": "設問2 c",
      "group": "c"
    },
    {
      "id": "q3",
      "label": "設問3",
      "group": "q3"
    }
  ],
  "official": {
    "answerPDFPhysicalPage": 1,
    "labels": [
      "ウ",
      "ア",
      "ア",
      "イ"
    ],
    "indexes": [
      2,
      0,
      0,
      1
    ],
    "partModes": [
      "choice",
      "choice",
      "choice",
      "choice"
    ],
    "c1c2IsOnePairedChoice": true,
    "unorderedAnswerGroups": false,
    "noCorrectAnswerParts": false
  },
  "allChoiceCount": 19,
  "logicalUnitCount": 18,
  "sourceNoCode": true,
  "commonPagesReview": {
    "candidateBefore": [
      3,
      4
    ],
    "needed": [],
    "reason": "No pseudocode, operations, language/API/JIS/CASL/COMET or spreadsheet appendix reference in the entire question. The7steps are ordinary numbered prose, not common pseudolanguage."
  },
  "visualReadScope": [
    "QS1/2/3/4/16/17/18/19/20/21/88",
    "ANS1/2"
  ],
  "transcriptionPolicy": "Layout-space normalization, source style of numeric/Latin labels shown in images remains authoritative. Bracket placeholders represent visible boxes. Preserve comparison source underlines as two spans, not explanatory text. Parent must recheck full source before implementation."
};
const scenarios=[
  {
    "input": [
      0
    ],
    "w1MeanMicroseconds": "101.5",
    "aChoices": [
      4,
      6,
      30,
      47
    ],
    "correctA": 30
  },
  {
    "input": [
      1
    ],
    "w1MeanMicroseconds": "144.5",
    "aChoices": [
      3,
      6,
      27,
      47
    ],
    "correctA": 27
  },
  {
    "input": [
      2
    ],
    "w1MeanMicroseconds": "198.5",
    "aChoices": [
      3,
      6,
      24,
      47
    ],
    "correctA": 24
  },
  {
    "input": [
      3
    ],
    "w1MeanMicroseconds": "326.5",
    "aChoices": [
      2,
      6,
      19,
      47
    ],
    "correctA": 19
  }
];
export const legacy2017Pm4Profile='legacy-2017-pm4-wireless-timing';
export const legacy2017Pm4Source=()=>structuredClone(source);
export function legacy2017Pm4Scenario(index:number){if(!Number.isInteger(index)||index<0||index>3)throw Error('PARAMETER_CONSTRAINT');return structuredClone(scenarios[index]);}
export function legacy2017Pm4FigureAlt(){return '図1 データフレーム送信の例。送信側と受信側の2本の時系列。送信側は(2)待機、(3)W1待機、(4)データフレーム送信の順。受信側は(6)W2待機、(6)ACKフレーム送信の順。ACK後に送信側の(3)、(4)が続く。3本の中空矢印の向きは、データが送信側から受信側、ACKが受信側から送信側、次のデータが送信側から受信側。注記：矢印はフレームの送信方向を表す。';}
