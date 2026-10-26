import type {Block} from '../types';
import {type GeneratedBody,type GenerationDefinition,field,variableNotes} from './definition';
import domains from './legacy-2018-order-payment-figure-domains.json';
const referenceBody:GeneratedBody={
  "prompt": [
    {
      "type": "paragraph",
      "text": "選択した問題は，選択欄の○選をマークしてください。マークがない場合は，採点されません。"
    },
    {
      "type": "paragraph",
      "text": "問10 次のCOBOLプログラムの説明及びプログラムを読んで，設問1，2に答えよ。"
    },
    {
      "type": "heading",
      "level": 3,
      "text": "〔プログラムの説明〕"
    },
    {
      "type": "paragraph",
      "text": "Web上でショッピングサイトを運営しているP社では，注文を受けて入金確認の処理を待っている商品の注文情報を注文ファイルに格納し，前日に入金された情報を入金ファイルに格納する。P社では毎朝10時に入金確認の処理を実行し，注文ファイルの情報と入金ファイルの情報を突き合わせて結果リストを印字する。このとき，入金が確認できなかった商品の注文情報は，出荷待ちファイルに格納する。前処理として，注文ファイルには，前日にプログラムを実行した際に出力された出荷待ちファイルの情報と，前日に受け付けた商品の注文情報を格納しておく。"
    },
    {
      "type": "paragraph",
      "text": "このショッピングサイトでは，代金の支払方法として，銀行振込，コンビニ払い，クレジットカード払い（以下，カード払いという），商品着払い（以下，着払いという）のいずれかを，注文時に選択できる。注文時に選択した支払方法と入金方法が異なることはない。銀行振込及びコンビニ払いによる入金の情報が入金ファイルに格納され，入金が確認できた注文を出荷対象とする。支払方法にカード払い又は着払いが選択された場合は，注文を受けた翌日に出荷する。"
    },
    {
      "type": "paragraph",
      "text": "(1) 注文ファイルは，図1に示すレコード様式の順ファイルである。"
    },
    {
      "type": "diagram",
      "id": "diagram-order-payment-1",
      "rendererRef": {
        "id": "renderer-source-figures",
        "version": "1.0.0"
      },
      "caption": "図1 注文ファイルのレコード様式",
      "alt": "{\"fields\": [[\"注文番号\", 8], [\"注文日時\", 14], [\"請求金額\", 7], [\"支払種別\", 1]]}",
      "scene": {
        "kind": "source_figure",
        "profile": "legacy-2018-order-payment-record-layout",
        "values": [
          1
        ]
      },
      "attribution": {
        "origin": "original",
        "sourceRefs": [],
        "rightsRefs": [
          "rights-original"
        ],
        "creatorIds": [
          "codex"
        ]
      }
    },
    {
      "type": "paragraph",
      "text": "① 注文番号には，注文ごとに一意に割り振られた番号が設定されている。注文番号として，99999999が割り振られることはない。"
    },
    {
      "type": "paragraph",
      "text": "② 注文日時には，西暦の年，月，日と，24時間表記の時，分，秒が，それぞれ4桁，2桁，2桁，2桁，2桁，2桁で設定されている。"
    },
    {
      "type": "paragraph",
      "text": "③ 請求金額には，正の整数が設定されている。"
    },
    {
      "type": "paragraph",
      "text": "④ 支払種別には，注文時に選択された支払方法が，銀行振込，コンビニ払い，カード払い，着払いのそれぞれに対応する値，1，2，3，4で設定されている。"
    },
    {
      "type": "paragraph",
      "text": "⑤ レコードは，注文番号の昇順に整列されている。"
    },
    {
      "type": "paragraph",
      "text": "(2) 入金ファイルは，図2に示すレコード様式の順ファイルである。"
    },
    {
      "type": "diagram",
      "id": "diagram-order-payment-2",
      "rendererRef": {
        "id": "renderer-source-figures",
        "version": "1.0.0"
      },
      "caption": "図2 入金ファイルのレコード様式",
      "alt": "{\"fields\": [[\"注文番号\", 8], [\"入金日時\", 14], [\"入金金額\", 7], [\"入金種別\", 1]]}",
      "scene": {
        "kind": "source_figure",
        "profile": "legacy-2018-order-payment-record-layout",
        "values": [
          2
        ]
      },
      "attribution": {
        "origin": "original",
        "sourceRefs": [],
        "rightsRefs": [
          "rights-original"
        ],
        "creatorIds": [
          "codex"
        ]
      }
    },
    {
      "type": "paragraph",
      "text": "① 注文番号には，入金が確認できた注文の注文番号が設定されている。"
    },
    {
      "type": "paragraph",
      "text": "② 入金日時には，西暦の年，月，日と，24時間表記の時，分，秒が，それぞれ4桁，2桁，2桁，2桁，2桁，2桁で設定されている。"
    },
    {
      "type": "paragraph",
      "text": "③ 入金金額には，正の整数が設定されている。"
    },
    {
      "type": "paragraph",
      "text": "④ 入金種別には，入金方法が，銀行振込，コンビニ払いのそれぞれに対応する値，1，2で設定されている。"
    },
    {
      "type": "paragraph",
      "text": "⑤ レコードは，注文番号の昇順に整列されている。同じ注文番号のレコードが複数格納されることはない。"
    },
    {
      "type": "paragraph",
      "text": "(3) 出荷待ちファイルは，図3に示すレコード様式の順ファイルである。支払方法に銀行振込又はコンビニ払いが選択された注文のうち，入金を確認できなかった商品の情報が格納される。"
    },
    {
      "type": "diagram",
      "id": "diagram-order-payment-3",
      "rendererRef": {
        "id": "renderer-source-figures",
        "version": "1.0.0"
      },
      "caption": "図3 出荷待ちファイルのレコード様式",
      "alt": "{\"fields\": [[\"注文番号\", 8], [\"注文日時\", 14], [\"請求金額\", 7], [\"支払種別\", 1]]}",
      "scene": {
        "kind": "source_figure",
        "profile": "legacy-2018-order-payment-record-layout",
        "values": [
          3
        ]
      },
      "attribution": {
        "origin": "original",
        "sourceRefs": [],
        "rightsRefs": [
          "rights-original"
        ],
        "creatorIds": [
          "codex"
        ]
      }
    },
    {
      "type": "paragraph",
      "text": "① 各項目の内容は，注文ファイルのレコード様式と同じである。"
    },
    {
      "type": "paragraph",
      "text": "(4) 結果リストの印字様式を図4に示す。見出しは印刷済みとする。"
    },
    {
      "type": "diagram",
      "id": "diagram-order-payment-4",
      "rendererRef": {
        "id": "renderer-source-figures",
        "version": "1.0.0"
      },
      "caption": "図4 結果リストの印字様式",
      "alt": "{\"headers\": [\"注文番号\", \"結果\", \"請求金額\", \"入金金額\", \"差額\"], \"rows\": [[\"99999999\", \"XX\", \"Z,ZZZ,ZZ9\", \"Z,ZZZ,ZZ9\", \"--,---,--9\"], [\"99999999\", \"XX\", \"Z,ZZZ,ZZ9\", \"Z,ZZZ,ZZ9\", \"--,---,--9\"]]}",
      "scene": {
        "kind": "source_figure",
        "profile": "legacy-2018-order-payment-print-format",
        "values": [
          1
        ]
      },
      "attribution": {
        "origin": "original",
        "sourceRefs": [],
        "rightsRefs": [
          "rights-original"
        ],
        "creatorIds": [
          "codex"
        ]
      }
    },
    {
      "type": "paragraph",
      "text": "① 結果リストには，出荷する注文と，エラーと判定した注文の情報を印字する。結果欄に印字するコードと意味を表1に示す。"
    },
    {
      "type": "table",
      "caption": "表1 結果欄に印字するコードと意味",
      "columns": [
        "コード",
        "判定",
        "意味"
      ],
      "rows": [
        [
          "00",
          "出荷対象",
          "請求金額と入金金額が一致した。又は，支払方法がカード払い，着払いのいずれかであった。"
        ],
        [
          "10",
          "エラー",
          "入金ファイルの注文番号に対応する注文がなかった。"
        ],
        [
          "20",
          "エラー",
          "請求金額と入金金額が一致しなかった。"
        ]
      ]
    },
    {
      "type": "paragraph",
      "text": "② 差額欄には，入金金額から請求金額を減算した金額を印字する。結果欄のコードが10の場合は，請求金額欄と差額欄には，0を印字する。支払方法がカード払い，着払いのいずれかであった場合は，入金金額欄と差額欄には，0を印字する。"
    },
    {
      "type": "paragraph",
      "text": "③ 判定がエラーの場合は，出荷待ちファイルに情報は出力せず，個別に対処する。"
    },
    {
      "type": "heading",
      "level": 3,
      "text": "〔プログラム〕"
    },
    {
      "type": "code",
      "language": "cobol",
      "text": "（行番号）\n01 DATA DIVISION.\n02 FILE SECTION.\n03 FD ORD-FILE.\n04 01 ORD-REC      PIC X(30).\n05 FD RCP-FILE.\n06 01 RCP-REC      PIC X(30).\n07 FD WAT-FILE.\n08 01 WAT-REC      PIC X(30).\n09 FD PRT-FILE.\n10 01 PRT-REC.\n11    02 PRT-NO       PIC 9(8).\n12    02              PIC X(4).\n13    02 PRT-RSLT     PIC X(2).\n14    02              PIC X(6).\n15    02 PRT-ORD      PIC Z,ZZZ,ZZ9.\n16    02              PIC X(4).\n17    02 PRT-RCP      PIC Z,ZZZ,ZZ9.\n18    02              PIC X(4).\n19    02 PRT-DIFF     PIC --,---,--9.\n20 WORKING-STORAGE SECTION.\n21 01 ORD-DATA.\n22    02 ORD-NO       PIC 9(8).\n23       88 ORD-EOF   VALUE 99999999.\n24    02 ORD-DT.\n25       03 ORD-DATE  PIC 9(8).\n26       03 ORD-TIME  PIC 9(6).\n27    02 ORD-AMNT     PIC 9(7).\n28    02 ORD-CODE     PIC 9(1).\n29 01 RCP-DATA.\n30    02 RCP-NO       PIC 9(8).\n31       88 RCP-EOF   VALUE 99999999.\n32    02 RCP-DT.\n33       03 RCP-DATE  PIC 9(8).\n34       03 RCP-TIME  PIC 9(6).\n35    02 RCP-AMNT     PIC 9(7).\n36    02 RCP-CODE     PIC 9(1).\n37 PROCEDURE DIVISION.\n38 MAIN-PROC.\n39     OPEN INPUT ORD-FILE RCP-FILE\n40          OUTPUT WAT-FILE PRT-FILE.\n41     INITIALIZE ORD-DATA RCP-DATA.\n42     PERFORM ORD-PROC.\n43     PERFORM RCP-PROC.\n44     MOVE SPACE TO PRT-REC.\n45     PERFORM UNTIL [a]\n46         INITIALIZE PRT-REC\n47         MOVE ORD-NO TO PRT-NO\n48         EVALUATE TRUE\n49             WHEN ORD-NO < RCP-NO\n50                 IF [b] THEN\n51                     MOVE \"00\" TO PRT-RSLT\n52                 ELSE\n53                     WRITE WAT-REC FROM ORD-DATA\n54                 END-IF\n55                 MOVE ORD-AMNT TO PRT-ORD\n56                 PERFORM ORD-PROC\n57             WHEN ORD-NO = RCP-NO\n58                 IF [c] THEN\n59                     MOVE \"00\" TO PRT-RSLT\n60                 ELSE\n61                     MOVE \"20\" TO PRT-RSLT\n62                     COMPUTE PRT-DIFF = RCP-AMNT - ORD-AMNT\n63                 END-IF\n64                 MOVE ORD-AMNT TO PRT-ORD\n65                 MOVE RCP-AMNT TO PRT-RCP\n66                 PERFORM ORD-PROC\n67                 PERFORM RCP-PROC\n68             WHEN ORD-NO > RCP-NO\n69                 MOVE \"10\" TO PRT-RSLT\n70                 MOVE RCP-AMNT TO PRT-RCP\n71                 MOVE RCP-NO TO PRT-NO\n72                 PERFORM RCP-PROC\n73         END-EVALUATE\n74         IF PRT-RSLT NOT = SPACE THEN\n75             [d]\n76         END-IF\n77     END-PERFORM.\n78     CLOSE ORD-FILE RCP-FILE WAT-FILE PRT-FILE.\n79     STOP RUN.\n80 ORD-PROC.\n81     IF NOT ORD-EOF THEN\n82         READ ORD-FILE INTO ORD-DATA AT END SET ORD-EOF TO TRUE\n83         END-READ\n84     END-IF.\n85 RCP-PROC.\n86     IF NOT RCP-EOF THEN\n87         READ RCP-FILE INTO RCP-DATA AT END SET RCP-EOF TO TRUE\n88         END-READ\n89     END-IF."
    },
    {
      "type": "paragraph",
      "text": "設問1 プログラム中の［空欄］に入れる正しい答えを，解答群の中から選べ。"
    },
    {
      "type": "paragraph",
      "text": "設問2 支払方法に銀行振込又はコンビニ払いが選択された注文のうち，注文日の翌日を1日目として，7日を過ぎても入金が確認できなかった注文の注文番号を表示するようにプログラムを変更する。表2中の［空欄］に入れる正しい答えを，解答群の中から選べ。ここで，組込み関数INTEGER-OF-DATEは，引数に指定されたYYYYMMDD形式の日付を西暦1601年1月1日からの通算の日数に変換して返す。"
    },
    {
      "type": "diagram",
      "id": "diagram-order-payment-change-table",
      "rendererRef": {
        "id": "renderer-source-figures",
        "version": "1.0.0"
      },
      "caption": "表2 プログラムの変更内容",
      "alt": "{\"columns\": [\"処理\", \"変更内容\"], \"rows\": [[\"行番号36と37の間に追加\", \"01 CR-DATE-X.\\n   02 CR-DATE    PIC 9(8).\\n77 W-CNT         PIC 9(3).\"], [\"行番号38と39の間に追加\", \"MOVE FUNCTION CURRENT-DATE TO CR-DATE-X. 1)\"], [\"[e]に追加\", \"COMPUTE W-CNT = FUNCTION INTEGER-OF-DATE(CR-DATE)\\n              - FUNCTION INTEGER-OF-DATE(ORD-DATE)\\nIF [f] THEN\\n    DISPLAY ORD-NO\\nEND-IF\"]]}",
      "scene": {
        "kind": "source_figure",
        "profile": "legacy-2018-order-payment-change-table",
        "values": [
          1
        ]
      },
      "attribution": {
        "origin": "original",
        "sourceRefs": [],
        "rightsRefs": [
          "rights-original"
        ],
        "creatorIds": [
          "codex"
        ]
      }
    },
    {
      "type": "paragraph",
      "text": "注1) プログラムを実行した日付が，YYYYMMDD形式でCR-DATE-Xに格納される。"
    }
  ],
  "choices": [
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "ORD-EOF"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "ORD-EOF AND RCP-EOF"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "ORD-EOF OR RCP-EOF"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "RCP-EOF"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "ORD-AMNT = RCP-AMNT"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "ORD-AMNT = ZERO"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "ORD-AMNT NOT = RCP-AMNT"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "ORD-CODE = 1 OR 2"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "ORD-CODE = 3 OR 4"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "ORD-CODE = RCP-CODE"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "ADD 1 TO PRT-NO"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "MOVE SPACE TO PRT-REC"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "SET ORD-EOF RCP-EOF TO TRUE"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "WRITE PRT-REC"
      }
    ],
    [
      {
        "type": "paragraph",
        "text": "行番号51と52の間"
      }
    ],
    [
      {
        "type": "paragraph",
        "text": "行番号53と54の間"
      }
    ],
    [
      {
        "type": "paragraph",
        "text": "行番号65と66の間"
      }
    ],
    [
      {
        "type": "paragraph",
        "text": "行番号71と72の間"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "W-CNT < 7"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "W-CNT = 7"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "W-CNT > 7"
      }
    ],
    [
      {
        "type": "code",
        "language": "cobol",
        "text": "W-CNT NOT = 7"
      }
    ]
  ],
  "answerParts": [
    {
      "id": "part-a",
      "label": "設問1 a",
      "choiceIds": [
        "choice-value-1",
        "choice-value-2",
        "choice-value-3",
        "choice-value-4"
      ]
    },
    {
      "id": "part-b",
      "label": "設問1 b",
      "choiceIds": [
        "choice-value-5",
        "choice-value-6",
        "choice-value-7",
        "choice-value-8",
        "choice-value-9",
        "choice-value-10"
      ]
    },
    {
      "id": "part-c",
      "label": "設問1 c",
      "choiceIds": [
        "choice-value-5",
        "choice-value-6",
        "choice-value-7",
        "choice-value-8",
        "choice-value-9",
        "choice-value-10"
      ]
    },
    {
      "id": "part-d",
      "label": "設問1 d",
      "choiceIds": [
        "choice-value-11",
        "choice-value-12",
        "choice-value-13",
        "choice-value-14"
      ]
    },
    {
      "id": "part-e",
      "label": "設問2 e",
      "choiceIds": [
        "choice-value-15",
        "choice-value-16",
        "choice-value-17",
        "choice-value-18"
      ]
    },
    {
      "id": "part-f",
      "label": "設問2 f",
      "choiceIds": [
        "choice-value-19",
        "choice-value-20",
        "choice-value-21",
        "choice-value-22"
      ]
    }
  ],
  "partAnswers": [
    {
      "kind": "choice",
      "partId": "part-a",
      "choiceId": "choice-value-2"
    },
    {
      "kind": "choice",
      "partId": "part-b",
      "choiceId": "choice-value-9"
    },
    {
      "kind": "choice",
      "partId": "part-c",
      "choiceId": "choice-value-5"
    },
    {
      "kind": "choice",
      "partId": "part-d",
      "choiceId": "choice-value-14"
    },
    {
      "kind": "choice",
      "partId": "part-e",
      "choiceId": "choice-value-16"
    },
    {
      "kind": "choice",
      "partId": "part-f",
      "choiceId": "choice-value-21"
    }
  ],
  "explanation": "aは両入力の終わりまで処理するAND。bは支払種別3又は4のカード払い・着払い、cは請求金額と入金金額の一致を判定する。dは印字用レコードのWRITE。eは未入金の注文を出荷待ちへ書いた直後、次の注文の読込み前。fは注文日の翌日を1日目とするのでW-CNT > 7。公式訂正に従い、コード10は請求金額と差額を0、カード払い・着払いは入金金額と差額を0とする。W-CNTはPIC 9(3)で0〜999を表現できるが，日数差1000は収まらず，原題には表現不能時の処理は示されていない。",
  "contexts": [
    {
      "title": "問10 公式訂正（冊子51頁②）",
      "presentation": "text",
      "blocks": [
        {
          "type": "paragraph",
          "text": "公式正誤表（問題PDF物理2頁）を適用しています。原問題の冊子51頁（PDF物理52頁）②は次の記述へ訂正されています。原問題のプログラム89行は訂正されていません。"
        },
        {
          "type": "paragraph",
          "text": "② 差額欄には，入金金額から請求金額を減算した金額を印字する。結果欄のコードが10の場合は，請求金額欄と差額欄には，0を印字する。支払方法がカード払い，着払いのいずれかであった場合は，入金金額欄と差額欄には，0を印字する。"
        }
      ]
    }
  ]
};
export const legacy2018OrderPaymentRecordFigures=[
  {
    "id": "source-06",
    "physicalPage": 50,
    "printedPage": 49,
    "kind": "figure",
    "number": 1,
    "caption": "図1 注文ファイルのレコード様式",
    "fields": [
      [
        "注文番号",
        8
      ],
      [
        "注文日時",
        14
      ],
      [
        "請求金額",
        7
      ],
      [
        "支払種別",
        1
      ]
    ],
    "visual": "four adjacent rectangular cells, title and digitcount within each, no arrows"
  },
  {
    "id": "source-13",
    "physicalPage": 51,
    "printedPage": 50,
    "kind": "figure",
    "number": 2,
    "caption": "図2 入金ファイルのレコード様式",
    "fields": [
      [
        "注文番号",
        8
      ],
      [
        "入金日時",
        14
      ],
      [
        "入金金額",
        7
      ],
      [
        "入金種別",
        1
      ]
    ],
    "visual": "four adjacent rectangular cells, no arrows"
  },
  {
    "id": "source-20",
    "physicalPage": 51,
    "printedPage": 50,
    "kind": "figure",
    "number": 3,
    "caption": "図3 出荷待ちファイルのレコード様式",
    "fields": [
      [
        "注文番号",
        8
      ],
      [
        "注文日時",
        14
      ],
      [
        "請求金額",
        7
      ],
      [
        "支払種別",
        1
      ]
    ],
    "visual": "four adjacent rectangular cells, no arrows"
  },
  {
    "id": "source-23",
    "physicalPage": 51,
    "printedPage": 50,
    "kind": "figure",
    "number": 4,
    "caption": "図4 結果リストの印字様式",
    "headers": [
      "注文番号",
      "結果",
      "請求金額",
      "入金金額",
      "差額"
    ],
    "rows": [
      [
        "99999999",
        "XX",
        "Z,ZZZ,ZZ9",
        "Z,ZZZ,ZZ9",
        "--,---,--9"
      ],
      [
        "99999999",
        "XX",
        "Z,ZZZ,ZZ9",
        "Z,ZZZ,ZZ9",
        "--,---,--9"
      ]
    ],
    "visual": "single outerrectangle, header plus2identical patternrows, no internal grid or arrows"
  }
] as const;
export const legacy2018OrderPaymentChangeTable={
  "id": "source-37",
  "physicalPage": 55,
  "printedPage": 54,
  "kind": "table",
  "number": 2,
  "caption": "表2 プログラムの変更内容",
  "columns": [
    "処理",
    "変更内容"
  ],
  "rows": [
    [
      "行番号36と37の間に追加",
      "01 CR-DATE-X.\n   02 CR-DATE    PIC 9(8).\n77 W-CNT         PIC 9(3)."
    ],
    [
      "行番号38と39の間に追加",
      "MOVE FUNCTION CURRENT-DATE TO CR-DATE-X. 1)"
    ],
    [
      "[e]に追加",
      "COMPUTE W-CNT = FUNCTION INTEGER-OF-DATE(CR-DATE)\n              - FUNCTION INTEGER-OF-DATE(ORD-DATE)\nIF [f] THEN\n    DISPLAY ORD-NO\nEND-IF"
    ]
  ],
  "visual": "2columns/3bodyrows; multilineCOBOL within rightcells; e boxed in thirdleftcell and f in condition; footnote below"
} as const;
export const legacy2018OrderPaymentProfiles=[
  "legacy-2018-order-payment-record-layout",
  "legacy-2018-order-payment-print-format",
  "legacy-2018-order-payment-change-table"
] as const;
const manualPairs=[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]] as const;
export function legacy2018OrderPaymentInput(v:number[]){if(v.length!==2||v.some((n,i)=>!Number.isInteger(n)||n<0||n>(i?2:5)))throw Error('PARAMETER_CONSTRAINT');const manual=[...manualPairs[v[0]]],auto=[1,2,3,4].filter(n=>!manual.includes(n as never)),days=[5,7,9][v[1]];return{manual,auto,days};}
export function legacy2018OrderPaymentFigureAllowed(profile:string,values:number[]){return Object.hasOwn(domains,profile)&&(domains[profile as keyof typeof domains]as number[][]).some(row=>JSON.stringify(row)===JSON.stringify(values));}
export function legacy2018OrderPaymentFigureAlt(profile:string,values:number[]){if(!legacy2018OrderPaymentFigureAllowed(profile,values))throw Error('PARAMETER_CONSTRAINT');if(profile===legacy2018OrderPaymentProfiles[0]){const f=legacy2018OrderPaymentRecordFigures[values[0]-1];if(!('fields'in f))throw Error('PARAMETER_CONSTRAINT');return JSON.stringify({fields:f.fields});}if(profile===legacy2018OrderPaymentProfiles[1]){const f=legacy2018OrderPaymentRecordFigures[3];return JSON.stringify({headers:f.headers,rows:f.rows});}return JSON.stringify({columns:legacy2018OrderPaymentChangeTable.columns,rows:legacy2018OrderPaymentChangeTable.rows});}
export const legacy2018OrderPaymentDefinitions:GenerationDefinition[]=[{source:'2018h30h-fe-pm-10',title:'注文と入金の情報の突合せ',fields:[field('classificationOption',0,5),field('overdueOption',0,2)],reference:[0,1],sourceAnswer:'イオアエイウ',notes:variableNotes+' 支払種別の手動2種を固定1〜4から選ぶ6分類と期限5/7/9日を同じ役割へbind。原89行・全注記・公式訂正2経路・6欄22択28参照を保持。PIC9(3)へ999日上限や型変更を加えない。',build(v){const{manual,auto,days}=legacy2018OrderPaymentInput(v),b=structuredClone(referenceBody);const text=(index:number,value:string)=>{const p=b.prompt[index];if(p.type!=='paragraph')throw Error('SOURCE_FORMAT');p.text=value;};text(10,(referenceBody.prompt[10]as Extract<Block,{type:'paragraph'}>).text.replace('1，2，3，4',[...manual,...auto].join('，')));text(17,(referenceBody.prompt[17]as Extract<Block,{type:'paragraph'}>).text.replace('1，2',manual.join('，')));text(31,(referenceBody.prompt[31]as Extract<Block,{type:'paragraph'}>).text.replace('7日',days+'日'));for(const[index,pair]of[[7,manual],[8,auto]]as const){const c=b.choices[index][0];if(c.type!=='code')throw Error('SOURCE_FORMAT');c.text=`ORD-CODE = ${pair[0]} OR ${pair[1]}`;}for(let n=18;n<22;n++){const c=b.choices[n][0];if(c.type!=='code')throw Error('SOURCE_FORMAT');c.text=c.text.replace('7',String(days));}b.explanation=`aは両入力の終わりまで処理するAND。bは支払種別${auto[0]}又は${auto[1]}のカード払い・着払い、cは請求金額と入金金額の一致を判定する。dは印字用レコードのWRITE。eは未入金の注文を出荷待ちへ書いた直後、次の注文の読込み前。fは注文日の翌日を1日目とするのでW-CNT > ${days}。公式訂正に従い、コード10は請求金額と差額を0、カード払い・着払いは入金金額と差額を0とする。W-CNTはPIC 9(3)で0〜999を表現できるが，日数差1000は収まらず，原題には表現不能時の処理は示されていない。`;return b;}}];
