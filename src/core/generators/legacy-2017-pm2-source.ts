/** Current original question2, visually reviewed p9–12; no arbitrary source code execution. */
export const legacy2017Pm2Source={
  "source": "2017h29h-fe-pm-2",
  "status": "source_only_visual_transcription_not_implementation",
  "physicalPages": [
    9,
    10,
    11,
    12
  ],
  "selectionNotice": "次の問2から問7までの6問については，この中から4問を選択し，選択した問題については，答案用紙の選択欄の選をマークして解答してください。なお，5問以上マークした場合には，はじめの4問について採点します。",
  "selectionNoticeTypography": "選 is circled in source; preserve original image and metadata, not a new instruction to mark in private client.",
  "pages": [
    {
      "page": 9,
      "blocks": [
        {
          "kind": "paragraph",
          "id": "major",
          "text": "問2 温度モニタに関する次の記述を読んで，設問1，2に答えよ。"
        },
        {
          "kind": "paragraph",
          "id": "intro",
          "text": "図1に，ある温度モニタのシステム構成図の一部を示す。"
        },
        {
          "kind": "paragraph",
          "id": "context1",
          "text": "タイマ割込み発生時に起動される割込みプログラムが，温度検出器の出力値をA/D変換器を介して取り込み，対応した値を7セグメントLED（以下，LEDという）に表示するシステムである。温度の検出範囲は0～70℃とし，検出された温度（以下，検出温度という）を8段階のレベルに対応させて，“1”～“8”の数字で表示する。割込みプログラムが起動されてから表示処理の完了までの時間は，タイマ割込み間隔に比べて十分に短いものとする。"
        },
        {
          "kind": "paragraph",
          "id": "context2",
          "text": "LEDの各セグメントは，対応する出力ポートのビットの値が1のとき点灯し，0のとき消灯する。LEDに“1”～“8”の数字を表示するために，数字の字形に合わせて，対応する8ビットのデータを出力ポートのビット0～7に設定する。このデータを形状データといい，出力ポートのビット7を最上位ビットとする2桁の16進数で表記する。"
        },
        {
          "kind": "figure",
          "id": "figure1",
          "caption": "図1 温度モニタのシステム構成図の一部"
        },
        {
          "kind": "note",
          "id": "figure1-note",
          "text": "注記 “2”を表示した例である。ここで，出力ポートのビット0には常に0が設定され，小数点を表示するセグメントは消灯している。"
        }
      ]
    },
    {
      "page": 10,
      "blocks": [
        {
          "kind": "paragraph",
          "id": "sub1",
          "text": "設問1 次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。"
        },
        {
          "kind": "paragraph",
          "id": "quantization",
          "text": "検出温度は，A/D変換器によって，表1に示す10℃ごとの温度基準値の中の最も近い値に近似される。温度基準値の刻み幅の中央の値は高い側の温度基準値に近似される。例えば，検出温度14℃は10℃に，15℃は20℃に，16℃は20℃に近似される。温度基準値，A/D変換器出力，レベルの関係を，表1に示す。"
        },
        {
          "kind": "table",
          "id": "table1",
          "caption": "表1 温度基準値，A/D変換器出力，レベルの関係",
          "columns": [
            "温度基準値（℃）",
            "A/D変換器出力（2進表記）",
            "レベル"
          ],
          "rows": [
            [
              "0",
              "000",
              "1"
            ],
            [
              "10",
              "001",
              "2"
            ],
            [
              "⋮",
              "⋮",
              "⋮"
            ],
            [
              "70",
              "111",
              "8"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "id": "abc",
          "text": "LEDの表示が図2のとき，出力ポートに設定されている形状データは［a］，A/D変換器出力（2進表記）は［b］，検出温度の範囲は［c］である。"
        },
        {
          "kind": "figure",
          "id": "figure2",
          "caption": "図2 LEDの表示",
          "digit": 6
        },
        {
          "kind": "choiceGroup",
          "id": "a",
          "label": "aに関する解答群",
          "choices": [
            "66",
            "BE",
            "DA",
            "F2",
            "FE"
          ]
        },
        {
          "kind": "choiceGroup",
          "id": "b",
          "label": "bに関する解答群",
          "choices": [
            "010",
            "011",
            "100",
            "101",
            "110"
          ]
        }
      ]
    },
    {
      "page": 11,
      "blocks": [
        {
          "kind": "choiceGroup",
          "id": "c",
          "label": "cに関する解答群",
          "choices": [
            "40℃以上50℃未満",
            "45℃以上55℃未満",
            "50℃以上60℃未満",
            "55℃以上65℃未満",
            "60℃以上70℃未満"
          ]
        },
        {
          "kind": "paragraph",
          "id": "sub2",
          "text": "設問2 タイマ割込み発生時に起動される割込みプログラムについて，その処理の流れを，図3に示す。図3中の空欄に入れる正しい答えを，解答群の中から選べ。"
        },
        {
          "kind": "paragraph",
          "id": "io-context",
          "text": "各機器にはI/Oポート番号が割り当てられており，割込みプログラムは，各機器に対する制御，データの読込み及び書込みを，I/Oポート番号を指定して行う。LEDに接続されている出力ポートにはI/Oポート番号1が，A/D変換器にはI/Oポート番号2と3が，それぞれ割り当てられている。表2にLEDとA/D変換器の動作概要を示す。また，図3で使用している擬似命令の形式と動作は，表3のとおりとする。"
        },
        {
          "kind": "table",
          "id": "table2",
          "caption": "表2 LEDとA/D変換器の動作概要",
          "columns": [
            "機器",
            "I/Oポート番号",
            "動作概要"
          ],
          "rows": [
            [
              "LED",
              "1",
              "番号1のI/Oポートに形状データを書き込むと，出力ポートの各ビットに値が設定され，LEDの各セグメントの点灯と消灯が行われる。"
            ],
            [
              "A/D変換器",
              "2",
              "番号2のI/Oポートに値1を書き込むと，A/D変換が開始される。"
            ],
            [
              "A/D変換器",
              "2",
              "番号2のI/Oポートから読み込んだ値が0ならば，変換中を示す。"
            ],
            [
              "A/D変換器",
              "2",
              "番号2のI/Oポートから読み込んだ値が0以外ならば，A/D変換が完了して出力値が確定していることを示す。"
            ],
            [
              "A/D変換器",
              "3",
              "A/D変換完了後に番号3のI/Oポートから読み込むと，A/D変換器の出力値（0～7）が得られる。"
            ]
          ],
          "mergeCells": [
            {
              "column": 0,
              "rowStart": 1,
              "rowSpan": 4
            },
            {
              "column": 1,
              "rowStart": 1,
              "rowSpan": 3
            }
          ],
          "note": "JSON logical rows repeat merged labels for independent reading only; intended visible source keeps exact2 merged cells rather than unmerging."
        },
        {
          "kind": "table",
          "id": "table3",
          "caption": "表3 擬似命令の形式と動作",
          "columns": [
            "命令の形式",
            "命令の動作"
          ],
          "rows": [
            [
              "INPUT I/Oポート番号",
              "番号で指定したI/Oポートに接続されている機器からデータを読み込み，GRに設定する。"
            ],
            [
              "OUTPUT I/Oポート番号",
              "GRに設定したデータを，番号で指定したI/Oポートに接続されている機器に書き込む。"
            ]
          ]
        },
        {
          "kind": "note",
          "id": "gr-note",
          "text": "注記 GRはCPUの8ビットのレジスタ"
        }
      ]
    },
    {
      "page": 12,
      "blocks": [
        {
          "kind": "figure",
          "id": "figure3",
          "caption": "図3 割込みプログラムの処理の流れ"
        },
        {
          "kind": "choiceGroup",
          "id": "d",
          "label": "dに関する解答群",
          "choices": [
            "GR＜0",
            "GR＝0",
            "GR＝1",
            "GR＞1"
          ]
        },
        {
          "kind": "choiceGroup",
          "id": "e",
          "label": "eに関する解答群",
          "choices": [
            "INPUT 1",
            "INPUT 2",
            "INPUT 3",
            "OUTPUT 1",
            "OUTPUT 2"
          ]
        }
      ]
    }
  ],
  "officialKeys": [
    {
      "subquestion": 1,
      "slot": "a",
      "symbol": "イ",
      "content": "BE"
    },
    {
      "subquestion": 1,
      "slot": "b",
      "symbol": "エ",
      "content": "101"
    },
    {
      "subquestion": 1,
      "slot": "c",
      "symbol": "イ",
      "content": "45℃以上55℃未満"
    },
    {
      "subquestion": 2,
      "slot": "d",
      "symbol": "イ",
      "content": "GR＝0"
    },
    {
      "subquestion": 2,
      "slot": "e",
      "symbol": "エ",
      "content": "OUTPUT 1"
    }
  ],
  "counts": {
    "pages": 4,
    "subquestions": 2,
    "parts": 5,
    "choiceGroups": 5,
    "uniqueChoices": 24,
    "partChoiceReferences": 24,
    "groupCounts": [
      5,
      5,
      5,
      4,
      5
    ],
    "figures": 3,
    "tables": 3,
    "sourceTable2MergedCells": 2,
    "flowNodes": 10
  },
  "typographyReview": [
    "a/b/c/d/e are rectangular blank boxes in narrative/flow, not raw underscore gaps.",
    "Literal α appears in flow comment and GR←α assignment; it is shape data, not answerblank a.",
    "Yes left return/No downward labels. Flow comment connectors dashed with brackets, not execution arrows.",
    "Digit2 in figure1 remains a fixed example; figure2 digit6 is the variable target.",
    "Source 温度の検出範囲0～70℃, 8levels1～8, bit7MSB, bit0always0, midpoint-to-higher and timerintervalassumption are answer-before visible."
  ]
} as const;
