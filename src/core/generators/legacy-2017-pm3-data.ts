/** Current original-source transcription. Each caller receives detached data. */
const source = {
  "status": "source-only human-readable review transcription; not an issued Question",
  "source": "2017h29h-fe-pm-3",
  "pages": [
    13,
    14,
    15,
    16
  ],
  "printedPages": [
    13,
    14,
    15,
    16
  ],
  "pageBoundaryNextQuestion": 17,
  "officialAnswer": {
    "page": 1,
    "parts": [
      "設問1",
      "設問2 a",
      "設問2 b",
      "設問3 c",
      "設問3 d"
    ],
    "labels": [
      "ア",
      "エ",
      "ア",
      "ア",
      "ア"
    ]
  },
  "groups": [
    {
      "id": "q1",
      "label": "設問1",
      "page": 14,
      "choices": [
        "同じ区分IDの同じ対象物IDに対する出し方のルールを複数件登録できるようにする。",
        "同じ区分IDの異なる対象物IDに対する出し方のルールを登録できるようにする。",
        "異なる区分IDの同じ対象物IDに対する出し方のルールを登録できるようにする。"
      ],
      "correctLabel": "ア"
    },
    {
      "id": "a",
      "label": "設問2 a",
      "page": 15,
      "choices": [
        "非NULL",
        "NULL",
        "UNIQUE",
        "参照",
        "検査",
        "主キー"
      ],
      "correctLabel": "エ"
    },
    {
      "id": "b",
      "label": "設問2 b",
      "page": 15,
      "choices": [
        "非NULL制約は適用できない",
        "UNIQUE制約を適用する",
        "更新操作を行うことはできない",
        "主キー制約を適用する"
      ],
      "correctLabel": "ア"
    },
    {
      "id": "c",
      "label": "設問3 c",
      "page": 16,
      "choices": [
        "区分IDの項目及び対象物IDの項目のUNIQUE制約",
        "対象物IDの項目の非NULL制約",
        "対象物IDの項目の参照制約",
        "ルールIDの項目の主キー制約"
      ],
      "correctLabel": "ア"
    },
    {
      "id": "d",
      "label": "設問3 d",
      "page": 16,
      "choices": [
        "CHECK(登録状態 IN('未公開','公開'))",
        "CHECK(登録状態 IS NULL)",
        "UNIQUE('未公開','公開')",
        "WHERE 登録状態 IN('未公開','公開')"
      ],
      "correctLabel": "ア"
    }
  ],
  "orderedBlocks": [
    {
      "id": "selection-notice",
      "page": 13,
      "kind": "notice",
      "text": "選択した問題は，選択欄の選をマークしてください。マークがない場合は，採点されません。",
      "styleNote": "「選」は丸囲み、注意文は二重罫枠。"
    },
    {
      "id": "heading",
      "page": 13,
      "kind": "paragraph",
      "text": "問3 住民からの問合せに回答するためのデータベースに関する次の記述を読んで，設問1〜3に答えよ。"
    },
    {
      "id": "operation-1",
      "page": 13,
      "kind": "paragraph",
      "text": "W市役所の生活環境課では，職員は住民からのごみの出し方に関する問合せがあったとき，対象物（ごみ）を検索条件としてルール表を検索し，出し方のルールを回答する業務を行っている。"
    },
    {
      "id": "operation-2",
      "page": 13,
      "kind": "paragraph",
      "text": "問合せごとに一意な受付Noを割り当て，受付日，回答日，回答したルールの区分ID及び対象物IDを入力したレコードを問合せ記録表に登録する。問合せがあった対象物が対象物表になかった場合，回答日，区分ID及び対象物IDはNULLにして，メモ欄に当該対象物をテキストで入力したレコードを登録する。後日，問合せ記録表から，回答日，区分ID及び対象物IDがNULLのレコードを選択し，メモ欄に入力されている当該対象物の分別区分を決定し，一意な対象物IDを割り当て，対象物表に新たな対象物のレコードを登録する。ルール表に新たなルールのレコードを登録して，問合せ記録表の選択したレコードに，追加したルールの区分IDと対象物IDを設定する。"
    },
    {
      "id": "figure1-intro",
      "page": 13,
      "kind": "paragraph",
      "text": "データベースの表構成とデータ格納例は，図1のとおりである。下線付きの項目は主キーを表す。"
    },
    {
      "id": "figure1",
      "page": 13,
      "kind": "figure",
      "caption": "図1 データベースの表構成とデータ格納例",
      "tables": [
        {
          "caption": "区分表",
          "headers": [
            "区分ID",
            "分別区分"
          ],
          "rows": [
            [
              "L0008",
              "可燃物"
            ]
          ],
          "primaryKeyColumns": [
            0
          ]
        },
        {
          "caption": "対象物表",
          "headers": [
            "対象物ID",
            "対象物"
          ],
          "rows": [
            [
              "S0123",
              "植木の枝"
            ]
          ],
          "primaryKeyColumns": [
            0
          ]
        },
        {
          "caption": "ルール表",
          "headers": [
            "区分ID",
            "対象物ID",
            "更新日",
            "出し方のルール"
          ],
          "rows": [
            [
              "L0008",
              "S0123",
              "2015-03-01",
              "乾燥させ，ひもで束にする。"
            ]
          ],
          "primaryKeyColumns": [
            0,
            1
          ]
        },
        {
          "caption": "問合せ記録表",
          "headers": [
            "受付No",
            "受付日",
            "回答日",
            "区分ID",
            "対象物ID",
            "メモ欄"
          ],
          "rows": [
            [
              "C003456",
              "2016-05-14",
              "NULL",
              "NULL",
              "NULL",
              "自転車のタイヤチューブ"
            ]
          ],
          "primaryKeyColumns": [
            0
          ]
        }
      ],
      "layout": "区分表と対象物表を上段横並び、ルール表を中段、問合せ記録表を下段。主キー下線5本。ER図・接続矢印ではない。"
    },
    {
      "id": "table1-intro",
      "page": 14,
      "kind": "paragraph",
      "text": "業務を行っている過程で幾つかの課題が明らかになった。これらのうちから対策すべき課題を選び，それを実現するために，データベースの表構成の見直し案を作成した。その結果を，表1に示す。"
    },
    {
      "id": "table1",
      "page": 14,
      "kind": "table",
      "caption": "表1 対策する課題とデータベースの表構成の見直し案",
      "headers": [
        "課題",
        "表構成の見直し案"
      ],
      "rows": [
        [
          "同じ対象物でも，大きさなどによって出し方を分ける必要が出てきた。",
          "ルール表に主キーとしてルールIDの項目を追加し，区分IDと対象物IDの項目を主キーではなくする。問合せ記録表にルールIDの項目を追加する。"
        ],
        [
          "新たに登録したルールについて，不都合があり，修正などをしたことが何度かあった。",
          "ルール表に登録状態の項目を追加する。登録状態の項目の値は，“未公開”，“公開”のいずれかである。\n理由は，ルール表に新たなルールを追加する場合，住民からの問合せに対する検索の対象とならない（未公開）状態で一旦登録し，課内でレビューした後，問題がなければ検索の対象（公開）とするためである。"
        ]
      ]
    },
    {
      "id": "q1-stem",
      "page": 14,
      "kind": "paragraph",
      "text": "設問1 ルールIDの項目を追加する理由として適切な答えを，解答群の中から選べ。"
    },
    {
      "id": "q1-choices",
      "page": 14,
      "kind": "choice-group",
      "group": "q1"
    },
    {
      "id": "q2-stem",
      "page": 14,
      "kind": "paragraph",
      "text": "設問2 次の記述中の□に入れる適切な答えを，解答群の中から選べ。"
    },
    {
      "id": "q2-body",
      "page": 14,
      "kind": "paragraph",
      "text": "ルール表のレコードを特定するために，問合せ記録表にルールIDの項目を追加するとき，ルールIDを外部キーとしたルール表に対する［a］制約を設定する。追加するルールIDの項目には，［b］。"
    },
    {
      "id": "a-choices",
      "page": 15,
      "kind": "choice-group",
      "group": "a",
      "sourceLayout": "3列2行（ア/イ/ウ、エ/オ/カ）"
    },
    {
      "id": "b-choices",
      "page": 15,
      "kind": "choice-group",
      "group": "b"
    },
    {
      "id": "q3-stem",
      "page": 15,
      "kind": "paragraph",
      "text": "設問3 ルール表作成用DDLの見直しについて，次の記述中の□に入れる適切な答えを，解答群の中から選べ。"
    },
    {
      "id": "q3-body",
      "page": 15,
      "kind": "paragraph",
      "text": "図2に示す，ルールIDの項目と登録状態の項目追加後のルール表作成用DDLのレビュー時に，［c］は削除すべきとの指摘を受けた。また，登録状態の項目に対する制約が不足しているとの指摘もあり，［d］を追加することになった。"
    },
    {
      "id": "figure2",
      "page": 15,
      "kind": "code",
      "language": "sql",
      "text": "CREATE TABLE ルール (\n  ルールID CHAR(6) PRIMARY KEY,\n  区分ID CHAR(5) NOT NULL,\n  対象物ID CHAR(5) NOT NULL,\n  登録状態 VARCHAR(10) NOT NULL,\n  更新日 DATE NOT NULL,\n  出し方のルール VARCHAR(2048),\n  FOREIGN KEY (区分ID) REFERENCES 区分(区分ID),\n  FOREIGN KEY (対象物ID) REFERENCES 対象物(対象物ID),\n  UNIQUE (区分ID, 対象物ID)\n)",
      "caption": "図2 ルール表作成用DDL"
    },
    {
      "id": "c-choices",
      "page": 16,
      "kind": "choice-group",
      "group": "c"
    },
    {
      "id": "d-choices",
      "page": 16,
      "kind": "choice-group",
      "group": "d"
    }
  ],
  "counts": {
    "parts": 5,
    "uniqueChoices": 21,
    "choiceReferences": 21,
    "groups": 5,
    "figure1Tables": 4,
    "figure1HeaderCells": 14,
    "figure1DataCells": 14,
    "figure1KeyUnderlines": 5,
    "table1Columns": 2,
    "table1DataRows": 2,
    "ddlLines": 11,
    "sourceOrderBlocks": 19
  },
  "transcriptionNotes": [
    "原画像が正本。ASCII/Japanese間の印刷上の字間をテキストでは詰め、表のキー下線はprimaryKeyColumnsで明示した。NULLは原表の可視文字列であり未定義値と混同しない。",
    "図2のルールID等の語内字間は識別子の一部と解釈せず組版上の字間とした。数値/桁/条件/列順/句順/選択順は原画像と照合した。",
    "原の□とa/b/c/dの空欄を区別し、設問1に存在しない原空欄文字を追加しない。内部part IDと元問題の印刷空欄を混同しない。",
    "解答後だけに必要な前提を補わない。主キー下線とNULL運用は解答前に必要。"
  ]
} as const;
export const legacy2017Pm3Profile='legacy-2017-pm3-waste-database';
export const legacy2017Pm3Source=()=>structuredClone(source);
export function legacy2017Pm3Scenario(index:number){
 if(!Number.isInteger(index)||index<0||index>3)throw Error('PARAMETER_CONSTRAINT');
 const review=Boolean(index&1),suspend=Boolean(index&2);
 const states=['未公開',...(review?['審査中']:[]),'公開',...(suspend?['公開停止']:[])];
 const literals=states.map(s=>"'"+s+"'").join(',');
 let reason='理由は，ルール表に新たなルールを追加する場合，住民からの問合せに対する検索の対象とならない（未公開）状態で一旦登録し，';
 if(review)reason+='課内でレビューを開始したら審査中とし，';
 reason+='課内でレビューした後，問題がなければ検索の対象（公開）とするためである。';
 if(suspend)reason+='公開後に不都合が見つかって検索の対象から外す場合は，登録状態を公開停止とする。';
 return {index,states,cell:'ルール表に登録状態の項目を追加する。登録状態の項目の値は，'+states.map(s=>'“'+s+'”').join('，')+'のいずれかである。\n'+reason,
 dChoices:['CHECK(登録状態 IN('+literals+'))','CHECK(登録状態 IS NULL)','UNIQUE('+literals+')','WHERE 登録状態 IN('+literals+')']};
}
export function legacy2017Pm3FigureAlt(){
 const b=source.orderedBlocks.find(b=>b.kind==='figure');if(!b||!('tables'in b))throw Error('SOURCE');
 return '図1。下線付き項目は主キー。'+b.tables.map(t=>t.caption+'。列は'+t.headers.join('、')+'。主キーは'+t.primaryKeyColumns.map(i=>t.headers[i]).join('と')+'。格納例は'+t.rows.map(r=>r.join('、')).join('。')).join('。');
}
