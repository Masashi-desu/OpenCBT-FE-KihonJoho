import {field,figure,p,strings,type GenerationDefinition,type GeneratedBody} from './definition';
/** Reviewed source-local finite bindings. Held39/58 and material-pending65 are absent.
 * Static text/geometry is managed code, never question-supplied executable markup. */
type Form={title:string;prompts:string[];choices:string[][];extras:Record<string,unknown>[];explanation:string;sourceAnswer:string};
const forms:Record<number,Form>={
  "62": {
    "title": "BPO",
    "prompts": [
      "BPOを説明したものはどれか。",
      "BPOを説明したものはどれか。"
    ],
    "choices": [
      [
        "自社ではサーバを所有せずに，通信事業者などが保有するサーバの処理能力や記憶容量の一部を借りてシステムを運用することである。",
        "自社ではソフトウェアを所有せずに，外部の専門事業者が提供するソフトウェアの機能をネットワーク経由で活用することである。",
        "自社の管理部門やコールセンタなど特定部門の業務プロセス全般を，業務システムの運用などと一体として外部の専門業者に委託することである。",
        "自社よりも人件費が安い派遣会社の社員を活用することによって，ソフトウェア開発の費用を低減させることである。"
      ],
      [
        "計算能力と記憶領域を外部の事業者から借り，自社の担当者がその上で業務システムを運用する。",
        "事業者がネットワークで提供する給与計算ソフトウェアを，自社の担当者が操作して給与計算業務を行う。",
        "請求書の受付から内容確認，支払用データの作成までの業務と，それを支えるシステム運用をまとめて外部事業者に委託する。",
        "派遣会社のプログラマへ自社が作業指示を行い，自社のソフトウェア開発の要員を補う。"
      ]
    ],
    "extras": [
      {},
      {}
    ],
    "explanation": "BPO（Business Process Outsourcing：業務プロセスの外部委託）は、業務の遂行を、それを支えるシステム運用などと一体として専門業者へ委託する。基盤資源だけの借用、ソフトウェア機能だけの利用、派遣による人員補充とは区別する。",
    "sourceAnswer": "ウ"
  },
  "63": {
    "title": "SOA",
    "prompts": [
      "SOAを説明したものはどれか。",
      "SOAを説明したものはどれか。"
    ],
    "choices": [
      [
        "業務体系，データ体系，適用処理体系，技術体系の四つの主要概念から構成され，業務とシステムの最適化を図る。",
        "サービスというコンポーネントからソフトウェアを構築することによって，ビジネス変化に対応しやすくする。",
        "データフローダイアグラムを用い，情報に関するモデルと機能に関するモデルを同時に作成する。",
        "連接，選択，反復の三つの論理構造の組合せで，コンポーネントレベルの設計を行う。"
      ],
      [
        "業務，データ，アプリケーション及び技術を全社的に整理し，組織全体のシステムの最適化を図る。",
        "業務機能を実装の詳細から独立したサービスとして公開し，それらを組み合わせて業務の変更に対応する。",
        "処理とデータの流れを図で分析し，機能と情報のモデルを作成する。",
        "処理の流れを順次実行，条件による分岐及び繰返しの組合せで設計する。"
      ]
    ],
    "extras": [
      {},
      {}
    ],
    "explanation": "SOA（Service-Oriented Architecture：サービス指向アーキテクチャ）は、業務機能をサービスとして構成し、その組合せによって業務の変化に対応する。全社全体の体系を整理するEA、データの流れを用いる分析、順次・選択・反復による構造化とは対象と構成方法が異なる。",
    "sourceAnswer": "イ"
  },
  "64": {
    "title": "システム化計画",
    "prompts": [
      "システム化計画の立案において実施すべき事項はどれか。",
      "システム化計画の立案において実施すべき事項はどれか。"
    ],
    "choices": [
      [
        "画面や帳票などのインタフェースを決定し，設計書に記載するために，要件定義書を基に作業する。",
        "システム構築の組織体制を策定するとともに，業務部門，情報システム部門の役割分担を明確にし，費用の検討においては開発費，運用及び保守の費用の算出基礎を明確にしておく。",
        "システムの起動・終了，監視，ファイルメンテナンスなどを計画的に行い，業務が円滑に遂行していることを確認する。",
        "システムを業務及び環境に適合するように維持管理を行い，修正依頼が発生した場合は，その内容を分析し，影響を調べる。"
      ],
      [
        "要件を基に入力画面の項目配置やエラー表示方法を具体化し，画面設計書を作成する。",
        "対象業務のシステム化の範囲，開発の順序と推進体制を定め，開発から運用・保守までの費用を見積もる根拠を整理する。",
        "稼働中のシステムで日々の起動・停止を行い，監視記録を確認する。",
        "稼働後に受け付けた修正依頼を分析し，変更が既存の機能に及ぼす影響を調べる。"
      ]
    ],
    "extras": [
      {},
      {}
    ],
    "explanation": "システム化計画では、システム化の範囲・順序・推進体制と役割分担、開発・運用・保守に必要な費用の算出根拠などを整理する。画面や帳票を具体化する設計、稼働中の運転・監視、稼働後の変更依頼の影響分析は別の作業である。",
    "sourceAnswer": "イ"
  },
  "66": {
    "title": "調達手順の空欄",
    "prompts": [
      "図に示す手順で情報システムを調達するとき，bに入れるものはどれか。",
      "図に示す手順で情報システムを調達するとき，aに入れるものはどれか。",
      "図に示す手順で情報システムを調達するとき，cに入れるものはどれか。",
      "図に示す手順で情報システムを調達するとき，dに入れるものはどれか。"
    ],
    "choices": [
      [
        "RFI",
        "RFP",
        "供給者の選定",
        "契約の締結"
      ],
      [
        "RFI",
        "RFP",
        "供給者の選定",
        "契約の締結"
      ],
      [
        "RFI",
        "RFP",
        "供給者の選定",
        "契約の締結"
      ],
      [
        "RFI",
        "RFP",
        "供給者の選定",
        "契約の締結"
      ]
    ],
    "extras": [
      {
        "boxes": [
          "a",
          "b",
          "c",
          "d"
        ],
        "edges": [
          [
            "a",
            "b"
          ],
          [
            "b",
            "c"
          ],
          [
            "c",
            "d"
          ]
        ],
        "descriptions": [
          "発注元はベンダにシステム化の目的や業務内容などを示し，情報提供を依頼する。",
          "発注元はベンダに調達対象システム，調達条件などを示し，提案書の提出を依頼する。",
          "発注元はベンダの提案書，能力などに基づいて，調達先を決定する。",
          "発注元と調達先の役割や責任分担などを，文書で相互に確認する。"
        ],
        "blankTarget": "b"
      },
      {
        "boxes": [
          "a",
          "b",
          "c",
          "d"
        ],
        "edges": [
          [
            "a",
            "b"
          ],
          [
            "b",
            "c"
          ],
          [
            "c",
            "d"
          ]
        ],
        "descriptions": [
          "発注元は新システムで扱う業務と導入目的を示し，各ベンダが提供できる技術や製品などの情報を求める。",
          "発注元は必要な機能，納期及び調達条件を示し，実現方法と費用を記載した提案書を各ベンダに求める。",
          "発注元は提出された提案書とベンダの遂行能力を比較評価し，調達先を決定する。",
          "発注元と調達先は，提供する業務の範囲，役割及び責任分担を文書で合意する。"
        ],
        "blankTarget": "a"
      },
      {
        "boxes": [
          "a",
          "b",
          "c",
          "d"
        ],
        "edges": [
          [
            "a",
            "b"
          ],
          [
            "b",
            "c"
          ],
          [
            "c",
            "d"
          ]
        ],
        "descriptions": [
          "発注元は新システムで扱う業務と導入目的を示し，各ベンダが提供できる技術や製品などの情報を求める。",
          "発注元は必要な機能，納期及び調達条件を示し，実現方法と費用を記載した提案書を各ベンダに求める。",
          "発注元は提出された提案書とベンダの遂行能力を比較評価し，調達先を決定する。",
          "発注元と調達先は，提供する業務の範囲，役割及び責任分担を文書で合意する。"
        ],
        "blankTarget": "c"
      },
      {
        "boxes": [
          "a",
          "b",
          "c",
          "d"
        ],
        "edges": [
          [
            "a",
            "b"
          ],
          [
            "b",
            "c"
          ],
          [
            "c",
            "d"
          ]
        ],
        "descriptions": [
          "発注元は新システムで扱う業務と導入目的を示し，各ベンダが提供できる技術や製品などの情報を求める。",
          "発注元は必要な機能，納期及び調達条件を示し，実現方法と費用を記載した提案書を各ベンダに求める。",
          "発注元は提出された提案書とベンダの遂行能力を比較評価し，調達先を決定する。",
          "発注元と調達先は，提供する業務の範囲，役割及び責任分担を文書で合意する。"
        ],
        "blankTarget": "d"
      }
    ],
    "explanation": "",
    "sourceAnswer": "イ"
  },
  "67": {
    "title": "製品ライフサイクルの成長期",
    "prompts": [
      "プロダクトライフサイクルにおける成長期の特徴はどれか。",
      "プロダクトライフサイクルにおける成長期の特徴はどれか。"
    ],
    "choices": [
      [
        "市場が製品の価値を理解し始める。製品ラインもチャネルも拡大しなければならない。この時期は売上も伸びるが，投資も必要である。",
        "需要が大きくなり，製品の差別化や市場の細分化が明確になってくる。競争者間の競争も激化し，新品種の追加やコストダウンが重要となる。",
        "需要が減ってきて，撤退する企業も出てくる。この時期の強者になれるかどうか判断し，代替市場への進出なども考える。",
        "需要は部分的で，新規需要開拓が勝負である。特定ターゲットに対する信念に満ちた説得が必要である。"
      ],
      [
        "製品が広く知られるようになって購入が増え，販売店や販路を増やしながら需要の拡大に対応する。",
        "市場での需要の伸びが鈍り，既存製品の差別化やコスト削減によってシェアの維持を図る。",
        "代替製品に需要が移り，売上の減少に応じて撤退や残存市場への集中を検討する。",
        "新しい製品を市場に紹介し，まだ利用経験のない顧客へ認知と試用を促す。"
      ]
    ],
    "extras": [
      {},
      {}
    ],
    "explanation": "プロダクトライフサイクルの成長期は、製品への理解と需要が拡大し、売上の伸びに対応して製品や販路を増やす時期である。差別化とコスト削減が重くなる成熟期、需要減少に対応する衰退期、認知と新規需要を開拓する導入期と区別する。",
    "sourceAnswer": "ア"
  },
  "69": {
    "title": "商品体系変更の顧客数予測",
    "prompts": [
      "T社では3種類の商品A，B，Cを販売している。現在のところ，それぞれの商品には毎月10,000人，20,000人，80,000人の購入者がいる。来年から商品体系を変更して，4種類の新商品P，Q，R，Sを販売する予定である。そこで，既存の顧客が新商品を購入する割合と新規の顧客数を試算した。この試算について，適切な記述はどれか。ここで，表の各行に記載されている小数第1位までの数値が，該当する旧商品から新商品に乗り換える人の割合を表す。",
      "T社では3種類の商品A，B，Cを販売している。現在のところ，それぞれの商品には毎月10,000人，20,000人，80,000人の購入者がいる。来年から商品体系を変更して，4種類の新商品P，Q，R，Sを販売する予定である。そこで，既存の顧客が新商品を購入する割合と新規の顧客数を試算した。この試算について，適切な記述はどれか。ここで，表の各行に記載されている小数第1位までの数値が，該当する旧商品から新商品に乗り換える人の割合を表す。",
      "T社では3種類の商品A，B，Cを販売している。現在のところ，それぞれの商品には毎月10,000人，20,000人，80,000人の購入者がいる。来年から商品体系を変更して，4種類の新商品P，Q，R，Sを販売する予定である。そこで，既存の顧客が新商品を購入する割合と新規の顧客数を試算した。この試算について，適切な記述はどれか。ここで，表の各行に記載されている小数第1位までの数値が，該当する旧商品から新商品に乗り換える人の割合を表す。",
      "T社では3種類の商品A，B，Cを販売している。現在のところ，それぞれの商品には毎月30,000人，20,000人，10,000人の購入者がいる。来年から商品体系を変更して，4種類の新商品P，Q，R，Sを販売する予定である。そこで，既存の顧客が新商品を購入する割合と新規の顧客数を試算した。この試算について，適切な記述はどれか。ここで，表の各行に記載されている小数第1位までの数値が，該当する旧商品から新商品に乗り換える人の割合を表す。"
    ],
    "choices": [
      [
        "商品Aの購入者のうち，1,000人が新商品Qを購入すると予想している。",
        "商品Bの購入者は，新商品P，Q，R，Sのどれかを購入すると予想している。",
        "新商品Pの購入見込者の5割は，商品Aの購入者であると予想している。",
        "新商品Sの新規顧客数は，商品Cの購入者のうち新商品Sを購入する人数より少ないと予想している。"
      ],
      [
        "商品Aの購入者のうち，3,000人が新商品Qを購入すると予想している。",
        "商品Bの購入者は，新商品P，Q，R，Sのどれかを購入すると予想している。",
        "新商品Pの購入見込者の5割は，商品Aの購入者であると予想している。",
        "新商品Sの新規顧客数は，商品Cの購入者のうち新商品Sを購入する人数より少ないと予想している。"
      ],
      [
        "商品Aの購入者のうち，1,000人が新商品Qを購入すると予想している。",
        "商品Bの購入者は，新商品P，Q，R，Sのどれかを購入すると予想している。",
        "新商品Pの購入見込者の5割は，商品Aの購入者であると予想している。",
        "新商品Sの新規顧客数は，商品Cの購入者のうち新商品Sを購入する人数より少ないと予想している。"
      ],
      [
        "商品Aの購入者のうち，1,000人が新商品Qを購入すると予想している。",
        "商品Bの購入者は，新商品P，Q，R，Sのどれかを購入すると予想している。",
        "新商品Pの購入見込者の5割は，商品Aの購入者であると予想している。",
        "新商品Sの新規顧客数は，商品Cの購入者のうち新商品Sを購入する人数より少ないと予想している。"
      ]
    ],
    "extras": [
      {
        "population": [
          10000,
          20000,
          80000
        ],
        "rateNumerators": [
          [
            5,
            3,
            1,
            1
          ],
          [
            1,
            6,
            1,
            1
          ],
          [
            1,
            1,
            3,
            3
          ]
        ],
        "rateDenominator": 10,
        "newExisting": [
          15000,
          23000,
          27000,
          27000
        ],
        "newCustomers": [
          5000,
          7000,
          13000,
          23000
        ],
        "tableHeader": [
          "人数",
          "P",
          "Q",
          "R",
          "S"
        ],
        "rowHeaders": [
          "A",
          "B",
          "C",
          "既存顧客数",
          "新規顧客数"
        ],
        "openTopLeftCorner": true,
        "bottomLabelColSpan": 2
      },
      {
        "population": [
          10000,
          20000,
          80000
        ],
        "rateNumerators": [
          [
            5,
            3,
            1,
            1
          ],
          [
            1,
            6,
            1,
            1
          ],
          [
            1,
            1,
            3,
            3
          ]
        ],
        "rateDenominator": 10,
        "newExisting": [
          15000,
          23000,
          27000,
          27000
        ],
        "newCustomers": [
          5000,
          7000,
          13000,
          27000
        ],
        "tableHeader": [
          "人数",
          "P",
          "Q",
          "R",
          "S"
        ],
        "rowHeaders": [
          "A",
          "B",
          "C",
          "既存顧客数",
          "新規顧客数"
        ],
        "openTopLeftCorner": true,
        "bottomLabelColSpan": 2,
        "claimA": 3000,
        "claimPShare": 5
      },
      {
        "population": [
          10000,
          20000,
          80000
        ],
        "rateNumerators": [
          [
            5,
            3,
            1,
            1
          ],
          [
            1,
            6,
            1,
            2
          ],
          [
            1,
            1,
            3,
            3
          ]
        ],
        "rateDenominator": 10,
        "newExisting": [
          15000,
          23000,
          27000,
          29000
        ],
        "newCustomers": [
          5000,
          7000,
          13000,
          30000
        ],
        "tableHeader": [
          "人数",
          "P",
          "Q",
          "R",
          "S"
        ],
        "rowHeaders": [
          "A",
          "B",
          "C",
          "既存顧客数",
          "新規顧客数"
        ],
        "openTopLeftCorner": true,
        "bottomLabelColSpan": 2,
        "claimA": 1000,
        "claimPShare": 5
      },
      {
        "population": [
          30000,
          20000,
          10000
        ],
        "rateNumerators": [
          [
            5,
            3,
            1,
            1
          ],
          [
            1,
            6,
            1,
            1
          ],
          [
            1,
            1,
            3,
            3
          ]
        ],
        "rateDenominator": 10,
        "newExisting": [
          18000,
          22000,
          8000,
          8000
        ],
        "newCustomers": [
          12000,
          7000,
          13000,
          23000
        ],
        "tableHeader": [
          "人数",
          "P",
          "Q",
          "R",
          "S"
        ],
        "rowHeaders": [
          "A",
          "B",
          "C",
          "既存顧客数",
          "新規顧客数"
        ],
        "openTopLeftCorner": true,
        "bottomLabelColSpan": 2,
        "claimA": 1000,
        "claimPShare": 5
      }
    ],
    "explanation": "",
    "sourceAnswer": "エ"
  },
  "70": {
    "title": "技術進化の曲線",
    "prompts": [
      "技術は，理想とする技術を目指す過程において，導入期，成長期，成熟期，衰退期，そして次の技術フェーズに移行するという進化の過程をたどる。この技術進化過程を表すものはどれか。",
      "同じ作業を繰り返すことによって，経験の蓄積に伴い1個当たりの作業時間が短くなる。この経験の蓄積と作業時間との関係を表すものはどれか。"
    ],
    "choices": [
      [
        "技術のSカーブ",
        "需要曲線",
        "バスタブ曲線",
        "ラーニングカーブ"
      ],
      [
        "技術のSカーブ",
        "需要曲線",
        "バスタブ曲線",
        "ラーニングカーブ"
      ]
    ],
    "extras": [
      {},
      {}
    ],
    "explanation": "技術のSカーブは技術の導入から成長・成熟などへ進む性能向上の過程を表す。需要曲線は価格と需要量、バスタブ曲線は使用期間と故障率、ラーニングカーブは経験の蓄積と単位作業時間などの関係を扱う。",
    "sourceAnswer": "ア"
  },
  "71": {
    "title": "IoTの構成要素",
    "prompts": [
      "IoTの構成要素に関する記述として，適切なものはどれか。",
      "IoTの構成要素に関する記述として，適切なものはどれか。"
    ],
    "choices": [
      [
        "アナログ式の機器を除く，ディジタル式の機器が対象となる。",
        "インターネット又は閉域網に接続できる全てのものが対象となる。",
        "自律的にデータを収集してデータ分析を行う機器だけが対象となる。",
        "人や生物を除く，形のある全てのものが対象となる。"
      ],
      [
        "アナログ信号を出力するセンサーは，変換器や通信装置を介しても構成要素には含められない。",
        "ゲートウェイを介してネットワークに接続するセンサーも，構成要素となり得る。",
        "収集したデータを端末自身が分析する場合だけ，その端末は構成要素となる。",
        "動物に装着して位置や状態を取得する端末は，構成要素には含められない。"
      ]
    ],
    "extras": [
      {},
      {}
    ],
    "explanation": "IoT（Internet of Things：モノのインターネット）では、機器やセンサーなどが直接又はゲートウェイなどを介してネットワークにつながる。アナログの検知器や動物に装着する端末を一律に除外せず、端末自体が自律的に分析することも必須条件ではない。",
    "sourceAnswer": "イ"
  },
  "72": {
    "title": "RFIDの特徴",
    "prompts": [
      "ICタグ（RFID）の特徴はどれか。",
      "ICタグ（RFID）の特徴はどれか。"
    ],
    "choices": [
      [
        "GPSを利用し，現在地の位置情報や属性情報を表示する。",
        "専用の磁気読取り装置に挿入して使用する。",
        "大量の情報を扱うので，情報の記憶には外部記憶装置を使用する。",
        "汚れに強く，記録された情報を梱包の外から読むことができる。"
      ],
      [
        "衛星からの信号を用い，タグ自体が現在位置を必ず算出する。",
        "磁気ヘッドに接触させ，タグの磁気パターンを読み取る。",
        "識別情報は全て読取り装置だけに保存され，タグの内部には記憶する領域をもたない。",
        "複数のタグに記録された識別情報を，電波を使って非接触で読み取ることができる。"
      ]
    ],
    "extras": [
      {},
      {}
    ],
    "explanation": "RFID（Radio Frequency Identification：電波による識別）では、ICタグの記憶領域にある情報を電波で非接触に読み取る。光学式の印字のように汚れで隠れた文字を読む方式ではなく、条件が合えば梱包越しや複数タグの読取りもできる。衛星測位のGPS、接触する磁気読取り、タグが記憶領域をもたないという説明と区別する。",
    "sourceAnswer": "エ"
  },
  "73": {
    "title": "O to O",
    "prompts": [
      "ネットビジネスでのO to Oの説明はどれか。",
      "ネットビジネスでのO to Oの説明はどれか。"
    ],
    "choices": [
      [
        "基本的なサービスや製品を無料で提供し，高度な機能や特別な機能については料金を課金するビジネスモデルである。",
        "顧客仕様に応じたカスタマイズを実現するために，顧客からの注文後に最終製品の生産を始める方式である。",
        "電子商取引で，代金を払ったのに商品が届かない，商品を送ったのに代金が支払われないなどのトラブルが防止できる仕組みである。",
        "モバイル端末などを利用している顧客を，仮想店舗から実店舗に，又は実店舗から仮想店舗に誘導しながら，購入につなげる仕組みである。"
      ],
      [
        "基本的な保存機能を無料とし，保存容量を増やす機能は有料で提供する。",
        "注文を受けた後に，指定された構成に合わせて製品を組み立てる。",
        "第三者が代金を一時的に預かり，商品の受領確認後に売手へ支払う。",
        "ネットで発行したクーポンで実店舗への来店を促し，店頭でもネットの購入サイトを案内して購買につなげる。"
      ]
    ],
    "extras": [
      {},
      {}
    ],
    "explanation": "O to O（Online to Offline又はOffline to Online）は、ネット上と実店舗との間で顧客を誘導して購買につなげる。無料と有料を組み合わせるフリーミアム、注文を受けてから生産する受注生産、第三者が代金を預かるエスクローとは仕組みが異なる。",
    "sourceAnswer": "エ"
  },
  "78": {
    "title": "コンピュータウイルス作成の処罰法",
    "prompts": [
      "コンピュータウイルスを作成する行為を処罰の対象とする法律はどれか。",
      "正当な理由なく，他人のコンピュータで実行させる目的でコンピュータウイルスを提供する行為を処罰の対象とする法律はどれか。"
    ],
    "choices": [
      [
        "刑法",
        "不正アクセス禁止法",
        "不正競争防止法",
        "プロバイダ責任制限法"
      ],
      [
        "刑法",
        "不正アクセス禁止法",
        "不正競争防止法",
        "プロバイダ責任制限法"
      ]
    ],
    "extras": [
      {},
      {}
    ],
    "explanation": "問われているのは刑法の不正指令電磁的記録に関する罪である。作成・提供には、正当な理由がなく人の電子計算機で実行させる目的などの成立条件があり、あらゆる研究・作成行為を無条件に処罰する説明ではない。不正アクセス、営業秘密等の不正競争、当時のプロバイダ責任に関する法律とは対象が異なる。",
    "sourceAnswer": "ア"
  },
  "79": {
    "title": "旧個人情報保護ガイドライン",
    "prompts": [
      "個人情報保護委員会“個人情報の保護に関する法律についてのガイドライン（通則編）平成28年11月（平成29年3月一部改正）”によれば，個人情報に該当しないものはどれか。",
      "個人情報保護委員会“個人情報の保護に関する法律についてのガイドライン（通則編）平成28年11月（平成29年3月一部改正）”によれば，個人情報に該当しないものはどれか。"
    ],
    "choices": [
      [
        "受付に設置した監視カメラに録画された，本人が判別できる映像データ",
        "個人番号の記載がない，社員に交付する源泉徴収票",
        "指紋認証のための指紋データのバックアップデータ",
        "匿名加工情報に加工された利用者アンケート情報"
      ],
      [
        "本人の氏名が含まれ，特定の個人を識別できる音声録音情報",
        "個人番号を記載していないが，氏名と勤務記録を記載した社員の名簿",
        "本人認証のために抽出した虹彩の特徴情報のバックアップデータ",
        "匿名加工情報に加工された購買履歴情報"
      ]
    ],
    "extras": [
      {},
      {}
    ],
    "explanation": "指定された平成28年11月・平成29年3月一部改正の通則編を対象とする。本人を識別できる映像・音声や氏名等のある社員情報、本人認証用の生体の特徴情報は、個人番号の有無だけで個人情報から外れない。法定の加工を行った匿名加工情報は、元の個人を識別できる個人情報と区別される。現在の法や別の版へ置き換えて判断しない。",
    "sourceAnswer": "エ"
  },
  "80": {
    "title": "請負と労働者派遣",
    "prompts": [
      "請負契約を締結していても，労働者派遣とみなされる受託者の行為はどれか。",
      "請負契約を締結していても，労働者派遣とみなされる受託者の行為はどれか。"
    ],
    "choices": [
      [
        "休暇取得の承認を発注者側の指示に従って行う。",
        "業務の遂行に関する指導や評価を自ら実施する。",
        "勤務に関する規律や職場秩序の保持を実施する。",
        "発注者の業務上の要請を受託者側の責任者が窓口となって受け付ける。"
      ],
      [
        "受託者の労働者の始業・終業時刻を，発注者からの具体的な指示に従って決める。",
        "受託者が業務の遂行方法を決め，自ら労働者に指導する。",
        "受託者が労働者の配置や服務規律を自ら管理する。",
        "発注者からの納期や成果物に関する要請を，受託者側の責任者が受け付ける。"
      ]
    ],
    "extras": [
      {},
      {}
    ],
    "explanation": "請負では、受託者が自ら業務の遂行、労働時間、配置や服務規律などを管理する。休暇承認や始業・終業を発注者の具体的な指示に従って決める条件は、問題が求める請負の独立性を満たさない行為である。受託者の責任者が納期・成果物などの要請を窓口で受けることを、労働者への直接の指揮と同一視しない。",
    "sourceAnswer": "ア"
  }
};

export const pendingAmNumbers=[62,63,64,66,67,69,70,71,72,73,78,79,80] as const;
export const pendingAmProfiles={flow:'legacy-2018-autumn-procurement-flow',migration:'legacy-2018-autumn-customer-migration-table'} as const;
export const pendingAmFigureDomains:Record<string,[number,number][]>=Object.fromEntries(Object.values(pendingAmProfiles).map(name=>[name,[[0,3]]]));
const fixedMeaning=new Set([62,63,64,67,71,73,78,79,80]);
function indexFor(n:number,values:number[]){const f=forms[n];if(!f||!Array.isArray(values)||values.length!==1||!Number.isSafeInteger(values[0])||values[0]<0||values[0]>=f.prompts.length)throw Error('PARAMETER_CONSTRAINT');return values[0];}
export function pendingAmFigureModel(profile:string,values:number[]){const n=profile===pendingAmProfiles.flow?66:profile===pendingAmProfiles.migration?69:0;if(!n)throw Error('FIGURE_PROFILE');const i=indexFor(n,values);return structuredClone(forms[n].extras[i]);}
export function pendingAmFigureAlt(profile:string,values:number[]){const model=pendingAmFigureModel(profile,values);
 if(profile===pendingAmProfiles.flow){const labels=model.boxes as string[],descriptions=model.descriptions as string[];return labels.map((label,i)=>`${label}の箱：${descriptions[i]}`).join('。')+'。aからb、bからc、cからdへ下向きの矢印。';}
 const pop=model.population as number[],rates=model.rateNumerators as number[][],existing=model.newExisting as number[],fresh=model.newCustomers as number[];
 return '左上角は開いており、見出しは人数、P、Q、R、S。'+pop.map((n,i)=>`${'ABC'[i]}は${n.toLocaleString('ja-JP')}人、乗換割合は${rates[i].map(x=>(x/10).toFixed(1)).join('、')}`).join('。')+'。既存顧客数は'+existing.map(x=>x.toLocaleString('ja-JP')).join('、')+'。新規顧客数は'+fresh.map(x=>x.toLocaleString('ja-JP')).join('、')+'。末尾2行の見出しは左2列を結合。';
}
function migrationResult(i:number){
 const e=forms[69].extras[i],pop=e.population as number[],rates=e.rateNumerators as number[][],fresh=e.newCustomers as number[],existing=Array.from({length:4},(_,col)=>pop.reduce((sum,n,row)=>sum+n*rates[row][col]/10,0));
 const claimA=Number(e.claimA??1000),claimPShare=Number(e.claimPShare??5),aQ=pop[0]*rates[0][1]/10,aP=pop[0]*rates[0][0]/10,cS=pop[2]*rates[2][3]/10;
 const truths=[aQ===claimA,rates[1].reduce((a,b)=>a+b,0)===10,aP*10===(existing[0]+fresh[0])*claimPShare,fresh[3]<cS];
 if(truths.filter(Boolean).length!==1||JSON.stringify(existing)!==JSON.stringify(e.newExisting))throw Error('PARAMETER_CONSTRAINT');
 return {correctIndex:truths.indexOf(true),explanation:`AからQは${pop[0].toLocaleString('ja-JP')}×${(rates[0][1]/10).toFixed(1)}＝${aQ.toLocaleString('ja-JP')}人。Bの乗換割合の合計は${(rates[1].reduce((a,b)=>a+b,0)/10).toFixed(1)}。Pの購入見込者は既存${existing[0].toLocaleString('ja-JP')}＋新規${fresh[0].toLocaleString('ja-JP')}＝${(existing[0]+fresh[0]).toLocaleString('ja-JP')}人、そのうちAからは${aP.toLocaleString('ja-JP')}人で${aP*10/(existing[0]+fresh[0])}割。CからSは${cS.toLocaleString('ja-JP')}人で、Sの新規${fresh[3].toLocaleString('ja-JP')}人と比較する。各行の率が1未満でも、表にない購入を補って正規化しない。`};
}
const ordinaryAnswer:Record<number,number>={62:2,63:1,64:1,67:0,71:1,72:3,73:3,78:0,79:3,80:0};
function build(n:number,values:number[]):GeneratedBody{
 const i=indexFor(n,values),f=forms[n],prompt=[p(f.prompts[i])];let correctIndex=ordinaryAnswer[n],explanation=f.explanation;
 if(n===66){const e=f.extras[i],label=String(e.blankTarget);correctIndex='abcd'.indexOf(label);prompt.push(figure(pendingAmProfiles.flow,[i],'情報システムを調達する手順',pendingAmFigureAlt(pendingAmProfiles.flow,[i])));explanation=`${label}の箱の説明は「${(e.descriptions as string[])[correctIndex]}」。aは情報を求めるRFI（Request for Information：情報提供依頼書）、bは提案を求めるRFP（Request for Proposal：提案依頼書）、cは提案・能力を評価して供給者を選定する段階、dは役割と責任を文書で確認して契約を締結する段階である。`;}
 else if(n===69){const result=migrationResult(i);correctIndex=result.correctIndex;explanation=result.explanation;prompt.push(figure(pendingAmProfiles.migration,[i],'顧客が新商品を購入する割合と顧客数',pendingAmFigureAlt(pendingAmProfiles.migration,[i])));}
 else if(n===70)correctIndex=i===0?0:3;
 return {prompt,choices:strings([...f.choices[i]]),correctIndex,explanation};
}
export const legacy2018PendingAmDefinitions:GenerationDefinition[]=pendingAmNumbers.map(n=>({source:`2018h30a-fe-am-${n}`,title:forms[n].title,sourceAnswer:forms[n].sourceAnswer,version:'3.2.0',fields:[field('条件profile',0,forms[n].prompts.length-1)],reference:[0],...(fixedMeaning.has(n)?{answerVariation:'fixed' as const}:{}),notes:'原参照0を含む有限な同形式の条件をバインドする。問いの方向、肯否、全4択の役割と原注記を保持する。概念固定と実回答事実の変化は系列別に区別し、選択肢順だけを内容容量に数えない。'+(n===79?'指定版は平成28年11月／平成29年3月一部改正のPPC通則編。現在法へ置き換えない。':''),build:values=>build(n,values)}));
