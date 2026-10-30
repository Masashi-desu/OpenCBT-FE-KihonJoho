/** Managed finite PM5 data; no displayed API/pseudocode is evaluated. */
export const legacy2019InspectionSource={
  "page23": {
    "heading": "問5 農産物の検査管理システムに関する次の記述を読んで、設問1〜3に答えよ。",
    "selectionNotice": "選択した問題は、選択欄の選をマークしてください。マークがない場合は、採点されません。",
    "introduction": "K社は、農産物を検査し、結果を報告する検査業務を実施している。検査の申込者の情報、検査を依頼された農産物（以下、検査農産物という）の情報、及び検査項目ごとの検査結果の情報は、検査管理システムで管理する。",
    "workflow": [
      "担当者は、申込者から検査農産物と検査項目を受け付ける。一つの検査農産物に対して五つまでの検査項目を受け付ける。",
      "担当者は、申込者が新規の場合、申込者の情報を検査管理システムに登録する。",
      "担当者は、検査農産物の情報を検査管理システムに登録する。ただし、検査項目は登録しない。",
      "担当者は、受け付けた検査項目の検査を実施する。受け付けた全ての検査項目の検査が終了した後、検査結果の情報を、検査項目ごとに検査管理システムに一括で登録する。",
      "担当者は、検査管理システムに登録された検査結果を確認し、申込者に検査結果を報告する。"
    ],
    "system": "検査管理システムは3台のサーバから構成し、各サーバは個別のデータベース（DB）をもつ。各DBへの情報の登録には、各サーバの申込情報登録ツール、利用者情報登録ツール及び検査結果登録ツールを利用する。報告用アプリケーションは、各サーバが提供する情報取得用WebAPIと認証関連WebAPIだけを利用して各DBへアクセスする。"
  },
  "page24": {
    "authentication": "担当者は、自分の利用者IDとパスワードでログインする。ログイン処理には認証関連WebAPIを利用し、成功したら認証サーバからアクセスIDを取得する。アクセスIDは認証情報として認証DBに格納され、ログアウトするまで管理される。報告用アプリケーションはアクセスIDを情報取得用WebAPIの引数に指定する。",
    "figure1": {
      "servers": [
        {
          "server": "申込情報管理サーバ",
          "db": "申込DB",
          "tool": "申込情報登録ツール",
          "api": "情報取得用WebAPI"
        },
        {
          "server": "認証サーバ",
          "db": "認証DB",
          "tool": "利用者情報登録ツール",
          "api": "認証関連WebAPI"
        },
        {
          "server": "検査結果管理サーバ",
          "db": "検査結果DB",
          "tool": "検査結果登録ツール",
          "api": "情報取得用WebAPI"
        }
      ],
      "application": "報告用アプリケーション",
      "accessEdges": [
        [
          "申込情報登録ツール",
          "申込情報管理サーバ"
        ],
        [
          "利用者情報登録ツール",
          "認証サーバ"
        ],
        [
          "検査結果登録ツール",
          "検査結果管理サーバ"
        ],
        [
          "報告用アプリケーション",
          "申込情報管理サーバ.情報取得用WebAPI"
        ],
        [
          "報告用アプリケーション",
          "認証サーバ.認証関連WebAPI"
        ],
        [
          "報告用アプリケーション",
          "検査結果管理サーバ.情報取得用WebAPI"
        ],
        [
          "申込情報管理サーバ.情報取得用WebAPI",
          "認証サーバ.認証関連WebAPI"
        ],
        [
          "検査結果管理サーバ.情報取得用WebAPI",
          "認証サーバ.認証関連WebAPI"
        ]
      ],
      "legend": "→：アクセスを示す。記載がないアクセスは発生しない。",
      "caption": "図1 検査管理システムの構成"
    },
    "ownership": "各情報は個別のIDを付与され、いずれかのDBだけに格納される。各DBは、そのサーバの情報取得用WebAPI及び認証関連WebAPIと登録ツールだけからアクセスできる。申込DBに格納される情報は図2のうち［a］。"
  },
  "page25": {
    "figure2": {
      "entities": [
        {
          "name": "認証情報",
          "fields": [
            "アクセスID",
            "利用者ID",
            "ログイン日時",
            "最終アクセス日時"
          ],
          "primaryKey": "アクセスID"
        },
        {
          "name": "利用者情報",
          "fields": [
            "利用者ID",
            "パスワード"
          ],
          "primaryKey": "利用者ID"
        },
        {
          "name": "申込者情報",
          "fields": [
            "申込者ID",
            "団体名",
            "住所",
            "電話番号"
          ],
          "primaryKey": "申込者ID"
        },
        {
          "name": "検査農産物情報",
          "fields": [
            "検査農産物ID",
            "［b］",
            "検査農産物名"
          ],
          "primaryKey": "検査農産物ID"
        },
        {
          "name": "検査結果情報",
          "fields": [
            "検査ID",
            "［c］",
            "検査項目名",
            "検査結果",
            "検査日"
          ],
          "primaryKey": "検査ID"
        }
      ],
      "note": "項目名の下線は主キーを示す。",
      "caption": "図2 検査管理システムが管理する情報と項目"
    },
    "apiPremises": [
      "情報取得用WebAPIは指定引数に基づいて処理し、取得した情報を戻り値とする。",
      "引数の指定方法は、個別のID、IDのリスト、開始番号の3種類。",
      "開始番号を使う場合、格納されている情報を整列し、整列後の先頭を1件目とする。開始番号の位置から最多10件を取得する。",
      "検査結果が25件の場合、開始番号1なら1〜10件目、11なら11〜20件目、21なら21〜25件目を返す。",
      "各情報取得用WebAPIは処理開始時に認証関連WebAPIでアクセスIDが認証情報として管理されているか確認する。管理されていなければ受け付けない。表1の処理説明ではアクセスID確認処理を省略する。"
    ]
  },
  "apis": [
    {
      "server": "申込情報管理サーバ",
      "name": "getOffererInfo",
      "args": [
        "アクセスID",
        "申込者IDのリスト（10件まで指定可）"
      ],
      "returns": "申込者情報のリスト",
      "processing": "指定された申込者IDの申込者情報を申込DBから取得する。"
    },
    {
      "server": "申込情報管理サーバ",
      "name": "listOffererInfo",
      "args": [
        "アクセスID",
        "開始番号"
      ],
      "returns": "申込者情報のリスト",
      "processing": "申込DBの申込者情報を申込者IDの昇順に整列し、開始番号から最多10件を取得する。"
    },
    {
      "server": "申込情報管理サーバ",
      "name": "getProductInfo",
      "args": [
        "アクセスID",
        "検査農産物IDのリスト（10件まで指定可）"
      ],
      "returns": "検査農産物情報のリスト",
      "processing": "指定された検査農産物IDの検査農産物情報を申込DBから取得する。"
    },
    {
      "server": "申込情報管理サーバ",
      "name": "listProductInfo",
      "args": [
        "アクセスID",
        "開始番号"
      ],
      "returns": "検査農産物情報のリスト",
      "processing": "申込DBの検査農産物情報を検査農産物IDの昇順に整列し、開始番号から最多10件を取得する。"
    },
    {
      "server": "検査結果管理サーバ",
      "name": "getResultInfo",
      "args": [
        "アクセスID",
        "検査IDのリスト（10件まで指定可）"
      ],
      "returns": "検査結果情報のリスト",
      "processing": "指定された検査IDの検査結果情報を検査結果DBから取得する。"
    },
    {
      "server": "検査結果管理サーバ",
      "name": "getResultInfoForProduct",
      "args": [
        "アクセスID",
        "検査農産物ID"
      ],
      "returns": "検査結果情報のリスト",
      "processing": "指定された検査農産物IDに対応する検査農産物の全ての検査結果情報を検査結果DBから取得する。"
    },
    {
      "server": "検査結果管理サーバ",
      "name": "listResultInfo",
      "args": [
        "アクセスID",
        "開始番号"
      ],
      "returns": "検査結果情報のリスト",
      "processing": "検査結果DBの検査結果情報を検査日、検査IDの降順に整列し、開始番号から最多10件を取得する。"
    }
  ],
  "table1": {
    "columns": [
      "サーバ",
      "WebAPI名",
      "WebAPI仕様"
    ],
    "specSubrows": [
      "引数",
      "戻り値",
      "処理"
    ],
    "serverRowGroups": [
      {
        "name": "申込情報管理サーバ",
        "apis": 4,
        "subrows": 12
      },
      {
        "name": "検査結果管理サーバ",
        "apis": 3,
        "subrows": 9
      }
    ],
    "actualLogicalColumns": 4,
    "note": "引数に指定した申込者ID、検査農産物ID又は検査IDに対応する情報のうち、各DBに存在するものだけを戻り値とする。",
    "caption": "表1 情報取得用WebAPIの説明"
  },
  "page27": {
    "question2": "報告用アプリケーションには農産物検査結果表示機能があり、この機能は、1件の検査農産物IDを入力して表示ボタンをクリックすると、画面に情報を表示する。農産物検査結果表示機能が表示する画面の例を、図3に示す。検査結果の情報が全て登録済みの検査農産物の検査農産物IDを入力した場合、表示ボタンをクリックしてから画面の表示が完了するまでには、表1に示す情報取得用WebAPIの実行が最低［d］回必要である。ここで、実行時にエラーは発生しないものとする。",
    "figure3": {
      "caption": "図3 農産物検査結果表示機能が表示する画面の例",
      "productId": "20190301-001",
      "productName": "水稲うるち玄米",
      "offerer": {
        "団体名": "○○団体",
        "住所": "○○県○○市○○町1−1",
        "電話番号": "○○○−○○○○−○○○○"
      },
      "columns": [
        "検査ID",
        "検査項目名",
        "検査結果",
        "検査日"
      ],
      "rowLabels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ],
      "rows": [
        [
          "0000984501",
          "形質",
          "一等標準品",
          "2019-03-05"
        ],
        [
          "0000984502",
          "整粒（%）",
          "70",
          "2019-03-05"
        ],
        [
          "0000984503",
          "水分（%）",
          "15.0",
          "2019-03-06"
        ],
        [
          "",
          "",
          "",
          ""
        ],
        [
          "",
          "",
          "",
          ""
        ]
      ]
    }
  },
  "page28and29": {
    "question3": "検査農産物IDの検査結果を個別に閲覧するのではなく、一覧形式で閲覧したいという要望を受け、報告用アプリケーションに検査結果リスト表示機能を追加する。表1の情報取得用WebAPIを利用し、登録済みの検査結果の情報（農産物検査結果情報）を全て一覧表示する。1行は、一覧全体の位置を示す番号、団体名、検査農産物ID、検査ID、検査項目名、検査結果及び検査日である。最近実施した検査の結果が先に表示されるように、検査日の降順に整列する。実行時にエラーは発生しない。",
    "figure4": {
      "caption": "図4 検査結果リスト表示機能が表示する画面の例",
      "startLabel": "開始番号：1",
      "buttons": [
        "前へ",
        "次へ"
      ],
      "columns": [
        "番号",
        "団体名",
        "検査農産物ID",
        "検査ID",
        "検査項目名",
        "検査結果",
        "検査日"
      ],
      "firstRow": [
        "1",
        "□□□団体",
        "20190401-001",
        "0000989587",
        "形質",
        "一等標準品",
        "2019-04-02"
      ],
      "remainingRowLabels": [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10"
      ],
      "remainingCells": "各列の縦の省略記号を原図どおり保持",
      "note": "番号の列には、開始番号から始まる連番を表示する。"
    },
    "paging": "1画面に最多10件を表示する。画面に表示されていない情報を表示するときは前へ又は次へボタンをクリックし、表示を切り替える。初期表示の開始番号は1。前へ又は次へをクリックすると開始番号に−10又は10を加算して再表示する。画面表示のたびに、開始番号と情報取得用WebAPIを利用して表示する情報を取得する場合、情報取得用WebAPIを［e］という順番で1回ずつ実行する。"
  },
  "originalChoices": {
    "a": [
      "認証情報及び申込者情報",
      "認証情報及び利用者情報",
      "認証情報、申込者情報及び検査農産物情報",
      "検査農産物情報",
      "申込者情報",
      "申込者情報及び検査農産物情報"
    ],
    "bc": [
      "アクセスID",
      "検査ID",
      "検査項目名",
      "検査農産物ID",
      "申込者ID",
      "利用者ID"
    ],
    "d": [
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ],
    "e": [
      [
        "listOffererInfo",
        "listProductInfo",
        "getResultInfoForProduct"
      ],
      [
        "listProductInfo",
        "getOffererInfo",
        "getResultInfoForProduct"
      ],
      [
        "listProductInfo",
        "listOffererInfo",
        "getResultInfoForProduct"
      ],
      [
        "listResultInfo",
        "getOffererInfo",
        "getProductInfo"
      ],
      [
        "listResultInfo",
        "getProductInfo",
        "getOffererInfo"
      ]
    ]
  }
} as const;
export function legacy2019InspectionModel(values:readonly number[]){
 if(values.length!==2||!values.every(n=>Number.isInteger(n)&&n>=0&&n<=1))throw Error('PARAMETER_CONSTRAINT');
 const a:string[]=[...legacy2019InspectionSource.originalChoices.a],e:string[][]=legacy2019InspectionSource.originalChoices.e.map(s=>[...s]);
 if(values[0]){a[0]='利用者情報及び申込者情報';a[2]='利用者情報、申込者情報及び検査農産物情報';}
 if(values[1])e[0][0]='getOffererInfo';
 return{a,bc:[...legacy2019InspectionSource.originalChoices.bc],d:[...legacy2019InspectionSource.originalChoices.d],e};
}
export const legacy2019InspectionProfiles=['architecture','entities','api-table','product-report','results-list'].map(n=>'legacy-2019-inspection-'+n);
export function legacy2019InspectionFigureAlt(name:string){
 const s=legacy2019InspectionSource;
 if(name==='architecture')return '図1 検査管理システムの構成。'+s.page24.figure1.servers.map(x=>`${x.server}に${x.db}と${x.api}がある。${x.tool}がアクセスする。`).join('')+'報告用アプリケーションから各サーバのAPIへアクセスする。申込情報管理サーバ及び検査結果管理サーバの情報取得用WebAPIから認証関連WebAPIへアクセスする。'+s.page24.figure1.legend;
 if(name==='entities')return '図2 検査管理システムが管理する情報と項目。'+s.page25.figure2.entities.map(e=>`${e.name}：${e.fields.join('、')}。主キーは${e.primaryKey}（下線）。`).join('')+s.page25.figure2.note;
 if(name==='api-table')return '表1 情報取得用WebAPIの説明。'+s.apis.map(a=>`${a.server}、${a.name}。引数：${a.args.join('、')}。戻り値：${a.returns}。処理：${a.processing}`).join('')+s.table1.note;
 if(name==='product-report')return '図3 農産物検査結果表示機能が表示する画面の例。'+s.page27.figure3.productId+'、'+s.page27.figure3.productName+'。'+Object.entries(s.page27.figure3.offerer).map(([k,v])=>k+':'+v).join('、')+'。列：'+s.page27.figure3.columns.join('、')+'。'+s.page27.figure3.rows.map((row,i)=>`${i+1}行：${row.every(x=>x==='')?'全欄空白':row.join('、')}`).join('。');
 if(name==='results-list')return '図4 検査結果リスト表示機能が表示する画面の例。開始番号1、前へ、次へ。列：'+s.page28and29.figure4.columns.join('、')+'。第1行：'+s.page28and29.figure4.firstRow.join('、')+'。第2〜10行は番号2〜10と各データ欄の縦の省略記号。'+s.page28and29.figure4.note;
 throw Error('PARAMETER_CONSTRAINT');
}
