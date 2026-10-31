/** Independently fixed source/form/choice truths from original313 + peer93 + correctedD04. Never imports producer. */
export const legacy2018PendingAmReview=[
  {
    "source": "2018h30a-fe-am-62",
    "number": 62,
    "page": 29,
    "title": "BPO",
    "officialKey": "ウ",
    "originalPrompt": "BPOを説明したものはどれか。",
    "originalChoices": [
      "自社ではサーバを所有せずに，通信事業者などが保有するサーバの処理能力や記憶容量の一部を借りてシステムを運用することである。",
      "自社ではソフトウェアを所有せずに，外部の専門事業者が提供するソフトウェアの機能をネットワーク経由で活用することである。",
      "自社の管理部門やコールセンタなど特定部門の業務プロセス全般を，業務システムの運用などと一体として外部の専門業者に委託することである。",
      "自社よりも人件費が安い派遣会社の社員を活用することによって，ソフトウェア開発の費用を低減させることである。"
    ],
    "originalExtra": {},
    "fullAlt": "平成30年度秋期 基本情報技術者試験 旧午前 問62。BPOを説明したものはどれか。 ア 自社ではサーバを所有せずに，通信事業者などが保有するサーバの処理能力や記憶容量の一部を借りてシステムを運用することである。 イ 自社ではソフトウェアを所有せずに，外部の専門事業者が提供するソフトウェアの機能をネットワーク経由で活用することである。 ウ 自社の管理部門やコールセンタなど特定部門の業務プロセス全般を，業務システムの運用などと一体として外部の専門業者に委託することである。 エ 自社よりも人件費が安い派遣会社の社員を活用することによって，ソフトウェア開発の費用を低減させることである。",
    "crop": {
      "source": "2018h30a-fe-am-62",
      "input": "accepted-inputs/renders/autumn-am-29.png",
      "inputSHA256": "1893c24c4838fe3489d373b778fdbb237a7156e8590d2c8652d91277673ec4e2",
      "sourcePixels": [
        788,
        1115
      ],
      "pixelBox": [
        0,
        490,
        788,
        825
      ],
      "relativeY": [
        0.43946188340807174,
        0.7399103139013453
      ],
      "diagnosticFile": "diagnostic-crops-v4/2018h30a-fe-am-62.png",
      "sha256": "3d1bc3fc79cc6c80c2091fa59eb4db5a3a01a79302b2b6f580573db4b52e5685",
      "cropBytes": 116930,
      "inkBoundsInCrop": [
        85,
        20,
        693,
        310
      ],
      "status": "research crop proposal only; text/figure/all4 retained and adjacent questions excluded by full-page visual reading; future actual asset requires fresh view",
      "authority": "official full page is canonical; this diagnostic is not a staged Asset"
    },
    "metadata": {
      "source": "2018h30a-fe-am-62",
      "status": "proposed_allowed13_not_implemented",
      "storedReferenceRows": 1,
      "proposedRawConditionCount": 2,
      "implementedCapacity": 0,
      "sourceReference": [
        0
      ],
      "denseValues": [
        [
          0
        ],
        [
          1
        ]
      ],
      "fields": [
        {
          "name": "条件profile",
          "minimum": 0,
          "maximum": 1
        }
      ],
      "versionProposal": "3.2.0",
      "generatorWillBeCreated": true,
      "answerVariationMetadata": {
        "ownProperty": true,
        "value": "fixed"
      },
      "samplingPolicy": "fixed_meaning",
      "correctConceptSignatures": [
        "BPO",
        "BPO"
      ],
      "correctFactSignatures": [
        "BPO",
        "BPO"
      ],
      "expectedCoreAnswerTextSignatures": [
        "自社の管理部門やコールセンタなど特定部門の業務プロセス全般を，業務システムの運用などと一体として外部の専門業者に委託することである。",
        "請求書の受付から内容確認，支払用データの作成までの業務と，それを支えるシステム運用をまとめて外部事業者に委託する。"
      ],
      "expectedCoreLiteralSignatureCount": 2,
      "meaningClassCount": 1,
      "factSignatureCount": 1,
      "expectedCorrectPositionClasses": 1,
      "usedInputPolicy": "exclude whole-session/most-recent used input by exact source+template version+values, include source0 as a valid normal value",
      "previousAnswerPolicy": "ignore last answer exclusion under fixed flag; still exclude used input",
      "failurePolicy": "all eligible excluded -> FINITE_CAPACITY_EXHAUSTED in source-local helper; actual prepareRun remains bounded128 and GENERATION_CAPACITY, no hidden reuse"
    },
    "conditions": [
      {
        "values": [
          0
        ],
        "prompt": "BPOを説明したものはどれか。",
        "choices": [
          "自社ではサーバを所有せずに，通信事業者などが保有するサーバの処理能力や記憶容量の一部を借りてシステムを運用することである。",
          "自社ではソフトウェアを所有せずに，外部の専門事業者が提供するソフトウェアの機能をネットワーク経由で活用することである。",
          "自社の管理部門やコールセンタなど特定部門の業務プロセス全般を，業務システムの運用などと一体として外部の専門業者に委託することである。",
          "自社よりも人件費が安い派遣会社の社員を活用することによって，ソフトウェア開発の費用を低減させることである。"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          false,
          true,
          false
        ],
        "independentReasons": [
          "サーバ資源を使って自社が実行するので，業務プロセス全体の遂行を引き受ける契約でない。",
          "外部ソフトを自社で操作する利用であり，業務遂行自体の委託ではない。",
          "外部者が一連の業務を担い支援IT運用も担うため，BPOの対象に合う。",
          "派遣人員を自社の指揮で用いる要員補充と，外部者へ業務遂行を委ねることは異なる。"
        ],
        "independentInputSHA": "f46f055e96aa9aac3396ae8d26a715263b353658c35662f159eba73c43d3a849"
      },
      {
        "values": [
          1
        ],
        "prompt": "BPOを説明したものはどれか。",
        "choices": [
          "計算能力と記憶領域を外部の事業者から借り，自社の担当者がその上で業務システムを運用する。",
          "事業者がネットワークで提供する給与計算ソフトウェアを，自社の担当者が操作して給与計算業務を行う。",
          "請求書の受付から内容確認，支払用データの作成までの業務と，それを支えるシステム運用をまとめて外部事業者に委託する。",
          "派遣会社のプログラマへ自社が作業指示を行い，自社のソフトウェア開発の要員を補う。"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          false,
          true,
          false
        ],
        "independentReasons": [
          "サーバ資源を使って自社が実行するので，業務プロセス全体の遂行を引き受ける契約でない。",
          "外部ソフトを自社で操作する利用であり，業務遂行自体の委託ではない。",
          "外部者が一連の業務を担い支援IT運用も担うため，BPOの対象に合う。",
          "派遣人員を自社の指揮で用いる要員補充と，外部者へ業務遂行を委ねることは異なる。"
        ],
        "independentInputSHA": "6f5bbe2960876525459e124734fe3bb5fd6008eac5677da2a5bc2c3e192c1b1d"
      }
    ]
  },
  {
    "source": "2018h30a-fe-am-63",
    "number": 63,
    "page": 30,
    "title": "SOA",
    "officialKey": "イ",
    "originalPrompt": "SOAを説明したものはどれか。",
    "originalChoices": [
      "業務体系，データ体系，適用処理体系，技術体系の四つの主要概念から構成され，業務とシステムの最適化を図る。",
      "サービスというコンポーネントからソフトウェアを構築することによって，ビジネス変化に対応しやすくする。",
      "データフローダイアグラムを用い，情報に関するモデルと機能に関するモデルを同時に作成する。",
      "連接，選択，反復の三つの論理構造の組合せで，コンポーネントレベルの設計を行う。"
    ],
    "originalExtra": {},
    "fullAlt": "平成30年度秋期 基本情報技術者試験 旧午前 問63。SOAを説明したものはどれか。 ア 業務体系，データ体系，適用処理体系，技術体系の四つの主要概念から構成され，業務とシステムの最適化を図る。 イ サービスというコンポーネントからソフトウェアを構築することによって，ビジネス変化に対応しやすくする。 ウ データフローダイアグラムを用い，情報に関するモデルと機能に関するモデルを同時に作成する。 エ 連接，選択，反復の三つの論理構造の組合せで，コンポーネントレベルの設計を行う。",
    "crop": {
      "source": "2018h30a-fe-am-63",
      "input": "accepted-inputs/renders/autumn-am-30.png",
      "inputSHA256": "d9ad0f753eda6e8a80d232731e0a008c2559911defd6365469a7e81d91ea857a",
      "sourcePixels": [
        788,
        1115
      ],
      "pixelBox": [
        0,
        90,
        788,
        425
      ],
      "relativeY": [
        0.08071748878923767,
        0.3811659192825112
      ],
      "diagnosticFile": "diagnostic-crops-v4/2018h30a-fe-am-63.png",
      "sha256": "da79fb96464ed41583853782ac0e0f28da8de9776927090f1a04e2672db1963a",
      "cropBytes": 94575,
      "inkBoundsInCrop": [
        91,
        18,
        699,
        308
      ],
      "status": "research crop proposal only; text/figure/all4 retained and adjacent questions excluded by full-page visual reading; future actual asset requires fresh view",
      "authority": "official full page is canonical; this diagnostic is not a staged Asset"
    },
    "metadata": {
      "source": "2018h30a-fe-am-63",
      "status": "proposed_allowed13_not_implemented",
      "storedReferenceRows": 1,
      "proposedRawConditionCount": 2,
      "implementedCapacity": 0,
      "sourceReference": [
        0
      ],
      "denseValues": [
        [
          0
        ],
        [
          1
        ]
      ],
      "fields": [
        {
          "name": "条件profile",
          "minimum": 0,
          "maximum": 1
        }
      ],
      "versionProposal": "3.2.0",
      "generatorWillBeCreated": true,
      "answerVariationMetadata": {
        "ownProperty": true,
        "value": "fixed"
      },
      "samplingPolicy": "fixed_meaning",
      "correctConceptSignatures": [
        "SOA",
        "SOA"
      ],
      "correctFactSignatures": [
        "SOA",
        "SOA"
      ],
      "expectedCoreAnswerTextSignatures": [
        "サービスというコンポーネントからソフトウェアを構築することによって，ビジネス変化に対応しやすくする。",
        "業務機能を実装の詳細から独立したサービスとして公開し，それらを組み合わせて業務の変更に対応する。"
      ],
      "expectedCoreLiteralSignatureCount": 2,
      "meaningClassCount": 1,
      "factSignatureCount": 1,
      "expectedCorrectPositionClasses": 1,
      "usedInputPolicy": "exclude whole-session/most-recent used input by exact source+template version+values, include source0 as a valid normal value",
      "previousAnswerPolicy": "ignore last answer exclusion under fixed flag; still exclude used input",
      "failurePolicy": "all eligible excluded -> FINITE_CAPACITY_EXHAUSTED in source-local helper; actual prepareRun remains bounded128 and GENERATION_CAPACITY, no hidden reuse"
    },
    "conditions": [
      {
        "values": [
          0
        ],
        "prompt": "SOAを説明したものはどれか。",
        "choices": [
          "業務体系，データ体系，適用処理体系，技術体系の四つの主要概念から構成され，業務とシステムの最適化を図る。",
          "サービスというコンポーネントからソフトウェアを構築することによって，ビジネス変化に対応しやすくする。",
          "データフローダイアグラムを用い，情報に関するモデルと機能に関するモデルを同時に作成する。",
          "連接，選択，反復の三つの論理構造の組合せで，コンポーネントレベルの設計を行う。"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          true,
          false,
          false
        ],
        "independentReasons": [
          "全社の業務・データ・アプリ・技術を整理する全体最適化で，サービスインタフェースによる部品化の説明でない。",
          "再利用可能なサービスを疎結合で組み合わせるため，SOAに合う。",
          "処理・データ流をモデル化する分析で，サービス部品の相互運用・再利用とは異なる。",
          "順次・分岐・反復で制御を組むことは，サービス単位の組合せという構成方式とは異なる。"
        ],
        "independentInputSHA": "40cf69b597c1a3b60b25dd0a1deb36294c2f1ab554aafc78a1d8b112a169ae65"
      },
      {
        "values": [
          1
        ],
        "prompt": "SOAを説明したものはどれか。",
        "choices": [
          "業務，データ，アプリケーション及び技術を全社的に整理し，組織全体のシステムの最適化を図る。",
          "業務機能を実装の詳細から独立したサービスとして公開し，それらを組み合わせて業務の変更に対応する。",
          "処理とデータの流れを図で分析し，機能と情報のモデルを作成する。",
          "処理の流れを順次実行，条件による分岐及び繰返しの組合せで設計する。"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          true,
          false,
          false
        ],
        "independentReasons": [
          "全社の業務・データ・アプリ・技術を整理する全体最適化で，サービスインタフェースによる部品化の説明でない。",
          "再利用可能なサービスを疎結合で組み合わせるため，SOAに合う。",
          "処理・データ流をモデル化する分析で，サービス部品の相互運用・再利用とは異なる。",
          "順次・分岐・反復で制御を組むことは，サービス単位の組合せという構成方式とは異なる。"
        ],
        "independentInputSHA": "faa27abdf7d97cf95338fdca66c8eaf7b5964a6dfb1d87d80916b457cfa1a81c"
      }
    ]
  },
  {
    "source": "2018h30a-fe-am-64",
    "number": 64,
    "page": 30,
    "title": "システム化計画",
    "officialKey": "イ",
    "originalPrompt": "システム化計画の立案において実施すべき事項はどれか。",
    "originalChoices": [
      "画面や帳票などのインタフェースを決定し，設計書に記載するために，要件定義書を基に作業する。",
      "システム構築の組織体制を策定するとともに，業務部門，情報システム部門の役割分担を明確にし，費用の検討においては開発費，運用及び保守の費用の算出基礎を明確にしておく。",
      "システムの起動・終了，監視，ファイルメンテナンスなどを計画的に行い，業務が円滑に遂行していることを確認する。",
      "システムを業務及び環境に適合するように維持管理を行い，修正依頼が発生した場合は，その内容を分析し，影響を調べる。"
    ],
    "originalExtra": {},
    "fullAlt": "平成30年度秋期 基本情報技術者試験 旧午前 問64。システム化計画の立案において実施すべき事項はどれか。 ア 画面や帳票などのインタフェースを決定し，設計書に記載するために，要件定義書を基に作業する。 イ システム構築の組織体制を策定するとともに，業務部門，情報システム部門の役割分担を明確にし，費用の検討においては開発費，運用及び保守の費用の算出基礎を明確にしておく。 ウ システムの起動・終了，監視，ファイルメンテナンスなどを計画的に行い，業務が円滑に遂行していることを確認する。 エ システムを業務及び環境に適合するように維持管理を行い，修正依頼が発生した場合は，その内容を分析し，影響を調べる。",
    "crop": {
      "source": "2018h30a-fe-am-64",
      "input": "accepted-inputs/renders/autumn-am-30.png",
      "inputSHA256": "d9ad0f753eda6e8a80d232731e0a008c2559911defd6365469a7e81d91ea857a",
      "sourcePixels": [
        788,
        1115
      ],
      "pixelBox": [
        0,
        455,
        788,
        825
      ],
      "relativeY": [
        0.4080717488789238,
        0.7399103139013453
      ],
      "diagnosticFile": "diagnostic-crops-v4/2018h30a-fe-am-64.png",
      "sha256": "09a855bae9976b2dba192be99e751f00fa9496537f881116882f7187c2e24eb8",
      "cropBytes": 124906,
      "inkBoundsInCrop": [
        91,
        21,
        700,
        342
      ],
      "status": "research crop proposal only; text/figure/all4 retained and adjacent questions excluded by full-page visual reading; future actual asset requires fresh view",
      "authority": "official full page is canonical; this diagnostic is not a staged Asset"
    },
    "metadata": {
      "source": "2018h30a-fe-am-64",
      "status": "proposed_allowed13_not_implemented",
      "storedReferenceRows": 1,
      "proposedRawConditionCount": 2,
      "implementedCapacity": 0,
      "sourceReference": [
        0
      ],
      "denseValues": [
        [
          0
        ],
        [
          1
        ]
      ],
      "fields": [
        {
          "name": "条件profile",
          "minimum": 0,
          "maximum": 1
        }
      ],
      "versionProposal": "3.2.0",
      "generatorWillBeCreated": true,
      "answerVariationMetadata": {
        "ownProperty": true,
        "value": "fixed"
      },
      "samplingPolicy": "fixed_meaning",
      "correctConceptSignatures": [
        "system-planning",
        "system-planning"
      ],
      "correctFactSignatures": [
        "system-planning",
        "system-planning"
      ],
      "expectedCoreAnswerTextSignatures": [
        "システム構築の組織体制を策定するとともに，業務部門，情報システム部門の役割分担を明確にし，費用の検討においては開発費，運用及び保守の費用の算出基礎を明確にしておく。",
        "対象業務のシステム化の範囲，開発の順序と推進体制を定め，開発から運用・保守までの費用を見積もる根拠を整理する。"
      ],
      "expectedCoreLiteralSignatureCount": 2,
      "meaningClassCount": 1,
      "factSignatureCount": 1,
      "expectedCorrectPositionClasses": 1,
      "usedInputPolicy": "exclude whole-session/most-recent used input by exact source+template version+values, include source0 as a valid normal value",
      "previousAnswerPolicy": "ignore last answer exclusion under fixed flag; still exclude used input",
      "failurePolicy": "all eligible excluded -> FINITE_CAPACITY_EXHAUSTED in source-local helper; actual prepareRun remains bounded128 and GENERATION_CAPACITY, no hidden reuse"
    },
    "conditions": [
      {
        "values": [
          0
        ],
        "prompt": "システム化計画の立案において実施すべき事項はどれか。",
        "choices": [
          "画面や帳票などのインタフェースを決定し，設計書に記載するために，要件定義書を基に作業する。",
          "システム構築の組織体制を策定するとともに，業務部門，情報システム部門の役割分担を明確にし，費用の検討においては開発費，運用及び保守の費用の算出基礎を明確にしておく。",
          "システムの起動・終了，監視，ファイルメンテナンスなどを計画的に行い，業務が円滑に遂行していることを確認する。",
          "システムを業務及び環境に適合するように維持管理を行い，修正依頼が発生した場合は，その内容を分析し，影響を調べる。"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          true,
          false,
          false
        ],
        "independentReasons": [
          "画面や帳票の具体設計は，計画で定めた方針に従う後段の作業。",
          "構築対象・推進体制・費用効果と運用保守までを含む計画は企画段階に属する。",
          "起動停止・監視の実行は運用段階。",
          "稼働後の変更依頼を分析するのは保守段階。"
        ],
        "independentInputSHA": "099e1017a62350c11d9da02278063fc9f1c753682e23dc73b952d0fe40b6bd26"
      },
      {
        "values": [
          1
        ],
        "prompt": "システム化計画の立案において実施すべき事項はどれか。",
        "choices": [
          "要件を基に入力画面の項目配置やエラー表示方法を具体化し，画面設計書を作成する。",
          "対象業務のシステム化の範囲，開発の順序と推進体制を定め，開発から運用・保守までの費用を見積もる根拠を整理する。",
          "稼働中のシステムで日々の起動・停止を行い，監視記録を確認する。",
          "稼働後に受け付けた修正依頼を分析し，変更が既存の機能に及ぼす影響を調べる。"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          true,
          false,
          false
        ],
        "independentReasons": [
          "画面や帳票の具体設計は，計画で定めた方針に従う後段の作業。",
          "構築対象・推進体制・費用効果と運用保守までを含む計画は企画段階に属する。",
          "起動停止・監視の実行は運用段階。",
          "稼働後の変更依頼を分析するのは保守段階。"
        ],
        "independentInputSHA": "61d4e57ba8c9a09e7000d545c9aa87ee2be33e89c7976fdd597d1f82ef7e75aa"
      }
    ]
  },
  {
    "source": "2018h30a-fe-am-66",
    "number": 66,
    "page": 31,
    "title": "調達手順の空欄",
    "officialKey": "イ",
    "originalPrompt": "図に示す手順で情報システムを調達するとき，bに入れるものはどれか。",
    "originalChoices": [
      "RFI",
      "RFP",
      "供給者の選定",
      "契約の締結"
    ],
    "originalExtra": {
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
    "fullAlt": "平成30年度秋期 基本情報技術者試験 旧午前 問66。図に示す手順で情報システムを調達するとき，bに入れるものはどれか。 図は上からa，b，c，dの4箱が縦に並び，aからb，bからc，cからdへそれぞれ1本の下向き矢印で接続される。各箱の右の説明は，a：発注元はベンダにシステム化の目的や業務内容などを示し，情報提供を依頼する。 b：発注元はベンダに調達対象システム，調達条件などを示し，提案書の提出を依頼する。 c：発注元はベンダの提案書，能力などに基づいて，調達先を決定する。 d：発注元と調達先の役割や責任分担などを，文書で相互に確認する。 ア RFI イ RFP ウ 供給者の選定 エ 契約の締結",
    "crop": {
      "source": "2018h30a-fe-am-66",
      "input": "accepted-inputs/renders/autumn-am-31.png",
      "inputSHA256": "0edeb75492f10f8fe8abaf825aed985f1f65fc0e01f811588e79f5817f4a122a",
      "sourcePixels": [
        788,
        1115
      ],
      "pixelBox": [
        0,
        490,
        788,
        930
      ],
      "relativeY": [
        0.43946188340807174,
        0.8340807174887892
      ],
      "diagnosticFile": "diagnostic-crops-v4/2018h30a-fe-am-66.png",
      "sha256": "92591349cd4795ce0a9d84476917a1d1840dc06c05c3a7b5d6f22433c3a47d0f",
      "cropBytes": 97395,
      "inkBoundsInCrop": [
        83,
        20,
        621,
        412
      ],
      "status": "research crop proposal only; text/figure/all4 retained and adjacent questions excluded by full-page visual reading; future actual asset requires fresh view",
      "authority": "official full page is canonical; this diagnostic is not a staged Asset"
    },
    "metadata": {
      "source": "2018h30a-fe-am-66",
      "status": "proposed_allowed13_not_implemented",
      "storedReferenceRows": 1,
      "proposedRawConditionCount": 4,
      "implementedCapacity": 0,
      "sourceReference": [
        0
      ],
      "denseValues": [
        [
          0
        ],
        [
          1
        ],
        [
          2
        ],
        [
          3
        ]
      ],
      "fields": [
        {
          "name": "条件profile",
          "minimum": 0,
          "maximum": 3
        }
      ],
      "versionProposal": "3.2.0",
      "generatorWillBeCreated": true,
      "answerVariationMetadata": {
        "ownProperty": false,
        "reason": "omit property; existing answerCanVary defaults true"
      },
      "samplingPolicy": "varying_correct_fact",
      "correctConceptSignatures": [
        "RFP",
        "RFI",
        "supplier-selection",
        "contract"
      ],
      "correctFactSignatures": [
        "RFP",
        "RFI",
        "supplier-selection",
        "contract"
      ],
      "expectedCoreAnswerTextSignatures": [
        "RFP",
        "RFI",
        "供給者の選定",
        "契約の締結"
      ],
      "expectedCoreLiteralSignatureCount": 4,
      "meaningClassCount": 4,
      "factSignatureCount": 4,
      "expectedCorrectPositionClasses": 4,
      "usedInputPolicy": "exclude whole-session/most-recent used input by exact source+template version+values, include source0 as a valid normal value",
      "previousAnswerPolicy": "exclude last actual correct-answer text signature as existing core; distinct reviewed fact signatures/literals are separately checked",
      "failurePolicy": "all eligible excluded -> FINITE_CAPACITY_EXHAUSTED in source-local helper; actual prepareRun remains bounded128 and GENERATION_CAPACITY, no hidden reuse"
    },
    "conditions": [
      {
        "values": [
          0
        ],
        "prompt": "図に示す手順で情報システムを調達するとき，bに入れるものはどれか。",
        "choices": [
          "RFI",
          "RFP",
          "供給者の選定",
          "契約の締結"
        ],
        "extra": {
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
        "truthIndependent": [
          false,
          true,
          false,
          false
        ],
        "independentReasons": [
          "情報を求める段階aにRFIを対応させる。",
          "提案書を求める段階bにRFPを対応させる。",
          "供給者を比較して決定する段階cに選定を対応させる。",
          "責任や役割を文書で合意する段階dに契約を対応させる。"
        ],
        "independentInputSHA": "641311e7be0091d9bb54e6e46fdf4d0cc252d1e11263e5426c382e531a084290"
      },
      {
        "values": [
          1
        ],
        "prompt": "図に示す手順で情報システムを調達するとき，aに入れるものはどれか。",
        "choices": [
          "RFI",
          "RFP",
          "供給者の選定",
          "契約の締結"
        ],
        "extra": {
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
        "truthIndependent": [
          true,
          false,
          false,
          false
        ],
        "independentReasons": [
          "情報を求める段階aにRFIを対応させる。",
          "提案書を求める段階bにRFPを対応させる。",
          "供給者を比較して決定する段階cに選定を対応させる。",
          "責任や役割を文書で合意する段階dに契約を対応させる。"
        ],
        "independentInputSHA": "daefd31a7bc207be2c7a60041a054a51a5bf35208ed46d6a3f230d294672d751"
      },
      {
        "values": [
          2
        ],
        "prompt": "図に示す手順で情報システムを調達するとき，cに入れるものはどれか。",
        "choices": [
          "RFI",
          "RFP",
          "供給者の選定",
          "契約の締結"
        ],
        "extra": {
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
        "truthIndependent": [
          false,
          false,
          true,
          false
        ],
        "independentReasons": [
          "情報を求める段階aにRFIを対応させる。",
          "提案書を求める段階bにRFPを対応させる。",
          "供給者を比較して決定する段階cに選定を対応させる。",
          "責任や役割を文書で合意する段階dに契約を対応させる。"
        ],
        "independentInputSHA": "12a24acf06beb9b8635ee00db93920d23c769ad3d422cebc7c2d0dd774863a64"
      },
      {
        "values": [
          3
        ],
        "prompt": "図に示す手順で情報システムを調達するとき，dに入れるものはどれか。",
        "choices": [
          "RFI",
          "RFP",
          "供給者の選定",
          "契約の締結"
        ],
        "extra": {
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
        },
        "truthIndependent": [
          false,
          false,
          false,
          true
        ],
        "independentReasons": [
          "情報を求める段階aにRFIを対応させる。",
          "提案書を求める段階bにRFPを対応させる。",
          "供給者を比較して決定する段階cに選定を対応させる。",
          "責任や役割を文書で合意する段階dに契約を対応させる。"
        ],
        "independentInputSHA": "de9c3b4ebbf8297845fe73ea99496c20a42b573aed4df932ce83fd3c6f5a8c8f"
      }
    ]
  },
  {
    "source": "2018h30a-fe-am-67",
    "number": 67,
    "page": 32,
    "title": "製品ライフサイクルの成長期",
    "officialKey": "ア",
    "originalPrompt": "プロダクトライフサイクルにおける成長期の特徴はどれか。",
    "originalChoices": [
      "市場が製品の価値を理解し始める。製品ラインもチャネルも拡大しなければならない。この時期は売上も伸びるが，投資も必要である。",
      "需要が大きくなり，製品の差別化や市場の細分化が明確になってくる。競争者間の競争も激化し，新品種の追加やコストダウンが重要となる。",
      "需要が減ってきて，撤退する企業も出てくる。この時期の強者になれるかどうか判断し，代替市場への進出なども考える。",
      "需要は部分的で，新規需要開拓が勝負である。特定ターゲットに対する信念に満ちた説得が必要である。"
    ],
    "originalExtra": {},
    "fullAlt": "平成30年度秋期 基本情報技術者試験 旧午前 問67。プロダクトライフサイクルにおける成長期の特徴はどれか。 ア 市場が製品の価値を理解し始める。製品ラインもチャネルも拡大しなければならない。この時期は売上も伸びるが，投資も必要である。 イ 需要が大きくなり，製品の差別化や市場の細分化が明確になってくる。競争者間の競争も激化し，新品種の追加やコストダウンが重要となる。 ウ 需要が減ってきて，撤退する企業も出てくる。この時期の強者になれるかどうか判断し，代替市場への進出なども考える。 エ 需要は部分的で，新規需要開拓が勝負である。特定ターゲットに対する信念に満ちた説得が必要である。",
    "crop": {
      "source": "2018h30a-fe-am-67",
      "input": "accepted-inputs/renders/autumn-am-32.png",
      "inputSHA256": "3acdd611e03e69da42768f867592a1e74ce1c73b6f52f46f7a8de994debd313d",
      "sourcePixels": [
        788,
        1115
      ],
      "pixelBox": [
        0,
        90,
        788,
        420
      ],
      "relativeY": [
        0.08071748878923767,
        0.37668161434977576
      ],
      "diagnosticFile": "diagnostic-crops-v4/2018h30a-fe-am-67.png",
      "sha256": "77030bcbc2e45a591c0382ec2cda48f4b02fcf48bf1af2ce5ac093b87f2e3299",
      "cropBytes": 124627,
      "inkBoundsInCrop": [
        93,
        18,
        701,
        304
      ],
      "status": "research crop proposal only; text/figure/all4 retained and adjacent questions excluded by full-page visual reading; future actual asset requires fresh view",
      "authority": "official full page is canonical; this diagnostic is not a staged Asset"
    },
    "metadata": {
      "source": "2018h30a-fe-am-67",
      "status": "proposed_allowed13_not_implemented",
      "storedReferenceRows": 1,
      "proposedRawConditionCount": 2,
      "implementedCapacity": 0,
      "sourceReference": [
        0
      ],
      "denseValues": [
        [
          0
        ],
        [
          1
        ]
      ],
      "fields": [
        {
          "name": "条件profile",
          "minimum": 0,
          "maximum": 1
        }
      ],
      "versionProposal": "3.2.0",
      "generatorWillBeCreated": true,
      "answerVariationMetadata": {
        "ownProperty": true,
        "value": "fixed"
      },
      "samplingPolicy": "fixed_meaning",
      "correctConceptSignatures": [
        "growth",
        "growth"
      ],
      "correctFactSignatures": [
        "growth",
        "growth"
      ],
      "expectedCoreAnswerTextSignatures": [
        "市場が製品の価値を理解し始める。製品ラインもチャネルも拡大しなければならない。この時期は売上も伸びるが，投資も必要である。",
        "製品が広く知られるようになって購入が増え，販売店や販路を増やしながら需要の拡大に対応する。"
      ],
      "expectedCoreLiteralSignatureCount": 2,
      "meaningClassCount": 1,
      "factSignatureCount": 1,
      "expectedCorrectPositionClasses": 1,
      "usedInputPolicy": "exclude whole-session/most-recent used input by exact source+template version+values, include source0 as a valid normal value",
      "previousAnswerPolicy": "ignore last answer exclusion under fixed flag; still exclude used input",
      "failurePolicy": "all eligible excluded -> FINITE_CAPACITY_EXHAUSTED in source-local helper; actual prepareRun remains bounded128 and GENERATION_CAPACITY, no hidden reuse"
    },
    "conditions": [
      {
        "values": [
          0
        ],
        "prompt": "プロダクトライフサイクルにおける成長期の特徴はどれか。",
        "choices": [
          "市場が製品の価値を理解し始める。製品ラインもチャネルも拡大しなければならない。この時期は売上も伸びるが，投資も必要である。",
          "需要が大きくなり，製品の差別化や市場の細分化が明確になってくる。競争者間の競争も激化し，新品種の追加やコストダウンが重要となる。",
          "需要が減ってきて，撤退する企業も出てくる。この時期の強者になれるかどうか判断し，代替市場への進出なども考える。",
          "需要は部分的で，新規需要開拓が勝負である。特定ターゲットに対する信念に満ちた説得が必要である。"
        ],
        "extra": {},
        "truthIndependent": [
          true,
          false,
          false,
          false
        ],
        "independentReasons": [
          "認知・購入が増加して販路と供給を拡大する成長局面。",
          "市場の需要伸長が落ち着き差別化・シェア維持へ向かう成熟局面。",
          "代替への移行などで需要が減り退出・残存市場集中を検討する衰退局面。",
          "新製品を市場へ知らせ試用・新需要開拓を図る導入局面。"
        ],
        "independentInputSHA": "9f846d350275cfd197d2a9aa6da3f528d72d2b07278e8f73228844de772ebb7a"
      },
      {
        "values": [
          1
        ],
        "prompt": "プロダクトライフサイクルにおける成長期の特徴はどれか。",
        "choices": [
          "製品が広く知られるようになって購入が増え，販売店や販路を増やしながら需要の拡大に対応する。",
          "市場での需要の伸びが鈍り，既存製品の差別化やコスト削減によってシェアの維持を図る。",
          "代替製品に需要が移り，売上の減少に応じて撤退や残存市場への集中を検討する。",
          "新しい製品を市場に紹介し，まだ利用経験のない顧客へ認知と試用を促す。"
        ],
        "extra": {},
        "truthIndependent": [
          true,
          false,
          false,
          false
        ],
        "independentReasons": [
          "認知・購入が増加して販路と供給を拡大する成長局面。",
          "市場の需要伸長が落ち着き差別化・シェア維持へ向かう成熟局面。",
          "代替への移行などで需要が減り退出・残存市場集中を検討する衰退局面。",
          "新製品を市場へ知らせ試用・新需要開拓を図る導入局面。"
        ],
        "independentInputSHA": "8c3efdb512fb1adc698199962ad9eb722c2596eb8b7211c2e5453661ca592977"
      }
    ]
  },
  {
    "source": "2018h30a-fe-am-69",
    "number": 69,
    "page": 33,
    "title": "商品体系変更の顧客数予測",
    "officialKey": "エ",
    "originalPrompt": "T社では3種類の商品A，B，Cを販売している。現在のところ，それぞれの商品には毎月10,000人，20,000人，80,000人の購入者がいる。来年から商品体系を変更して，4種類の新商品P，Q，R，Sを販売する予定である。そこで，既存の顧客が新商品を購入する割合と新規の顧客数を試算した。この試算について，適切な記述はどれか。ここで，表の各行に記載されている小数第1位までの数値が，該当する旧商品から新商品に乗り換える人の割合を表す。",
    "originalChoices": [
      "商品Aの購入者のうち，1,000人が新商品Qを購入すると予想している。",
      "商品Bの購入者は，新商品P，Q，R，Sのどれかを購入すると予想している。",
      "新商品Pの購入見込者の5割は，商品Aの購入者であると予想している。",
      "新商品Sの新規顧客数は，商品Cの購入者のうち新商品Sを購入する人数より少ないと予想している。"
    ],
    "originalExtra": {
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
      "bottomLabelColSpan": 2,
      "reviewOnlyNotes": [
        "小数第1位の各行は該当旧商品から新商品への乗換割合。",
        "行の率の合計が1未満でも原表を補完しない。",
        "既存顧客数行と新規顧客数行を別の数として保持。"
      ]
    },
    "fullAlt": "平成30年度秋期 基本情報技術者試験 旧午前 問69。T社では3種類の商品A，B，Cを販売している。現在のところ，それぞれの商品には毎月10,000人，20,000人，80,000人の購入者がいる。来年から商品体系を変更して，4種類の新商品P，Q，R，Sを販売する予定である。そこで，既存の顧客が新商品を購入する割合と新規の顧客数を試算した。この試算について，適切な記述はどれか。ここで，表の各行に記載されている小数第1位までの数値が，該当する旧商品から新商品に乗り換える人の割合を表す。 表。上端の列見出しは人数，P，Q，R，Sの順で，行名欄の上は開いている。 A行。人数10,000。P 0.5。Q 0.3。R 0.1。S 0.1。 B行。人数20,000。P 0.1。Q 0.6。R 0.1。S 0.1。 C行。人数80,000。P 0.1。Q 0.1。R 0.3。S 0.3。 既存顧客数行の見出しは行名と人数の2列を結合。P 15,000。Q 23,000。R 27,000。S 27,000。 新規顧客数行の見出しは行名と人数の2列を結合。P 5,000。Q 7,000。R 13,000。S 23,000。 ア 商品Aの購入者のうち，1,000人が新商品Qを購入すると予想している。 イ 商品Bの購入者は，新商品P，Q，R，Sのどれかを購入すると予想している。 ウ 新商品Pの購入見込者の5割は，商品Aの購入者であると予想している。 エ 新商品Sの新規顧客数は，商品Cの購入者のうち新商品Sを購入する人数より少ないと予想している。",
    "crop": {
      "source": "2018h30a-fe-am-69",
      "input": "accepted-inputs/renders/autumn-am-33.png",
      "inputSHA256": "13513c62c767150412c494f1d505f94436e2a0c74cdf0a6dbca512f36623ad2f",
      "sourcePixels": [
        788,
        1115
      ],
      "pixelBox": [
        0,
        90,
        788,
        675
      ],
      "relativeY": [
        0.08071748878923767,
        0.6053811659192825
      ],
      "diagnosticFile": "diagnostic-crops-v4/2018h30a-fe-am-69.png",
      "sha256": "a61466f7ff2c7d6f81155ec0d76661826613e864ff5de81964976902aeaaead5",
      "cropBytes": 209425,
      "inkBoundsInCrop": [
        85,
        18,
        693,
        557
      ],
      "status": "research crop proposal only; text/figure/all4 retained and adjacent questions excluded by full-page visual reading; future actual asset requires fresh view",
      "authority": "official full page is canonical; this diagnostic is not a staged Asset"
    },
    "metadata": {
      "source": "2018h30a-fe-am-69",
      "status": "proposed_allowed13_not_implemented",
      "storedReferenceRows": 1,
      "proposedRawConditionCount": 4,
      "implementedCapacity": 0,
      "sourceReference": [
        0
      ],
      "denseValues": [
        [
          0
        ],
        [
          1
        ],
        [
          2
        ],
        [
          3
        ]
      ],
      "fields": [
        {
          "name": "条件profile",
          "minimum": 0,
          "maximum": 3
        }
      ],
      "versionProposal": "3.2.0",
      "generatorWillBeCreated": true,
      "answerVariationMetadata": {
        "ownProperty": false,
        "reason": "omit property; existing answerCanVary defaults true"
      },
      "samplingPolicy": "varying_correct_fact",
      "correctConceptSignatures": [
        "newS-less-than-CtoS",
        "AtoQ-count",
        "all-B-retained",
        "A-share-of-total-P"
      ],
      "correctFactSignatures": [
        "newS-less-than-CtoS",
        "AtoQ-count",
        "all-B-retained",
        "A-share-of-total-P"
      ],
      "expectedCoreAnswerTextSignatures": [
        "新商品Sの新規顧客数は，商品Cの購入者のうち新商品Sを購入する人数より少ないと予想している。",
        "商品Aの購入者のうち，3,000人が新商品Qを購入すると予想している。",
        "商品Bの購入者は，新商品P，Q，R，Sのどれかを購入すると予想している。",
        "新商品Pの購入見込者の5割は，商品Aの購入者であると予想している。"
      ],
      "expectedCoreLiteralSignatureCount": 4,
      "meaningClassCount": 4,
      "factSignatureCount": 4,
      "expectedCorrectPositionClasses": 4,
      "usedInputPolicy": "exclude whole-session/most-recent used input by exact source+template version+values, include source0 as a valid normal value",
      "previousAnswerPolicy": "exclude last actual correct-answer text signature as existing core; distinct reviewed fact signatures/literals are separately checked",
      "failurePolicy": "all eligible excluded -> FINITE_CAPACITY_EXHAUSTED in source-local helper; actual prepareRun remains bounded128 and GENERATION_CAPACITY, no hidden reuse"
    },
    "conditions": [
      {
        "values": [
          0
        ],
        "prompt": "T社では3種類の商品A，B，Cを販売している。現在のところ，それぞれの商品には毎月10,000人，20,000人，80,000人の購入者がいる。来年から商品体系を変更して，4種類の新商品P，Q，R，Sを販売する予定である。そこで，既存の顧客が新商品を購入する割合と新規の顧客数を試算した。この試算について，適切な記述はどれか。ここで，表の各行に記載されている小数第1位までの数値が，該当する旧商品から新商品に乗り換える人の割合を表す。",
        "choices": [
          "商品Aの購入者のうち，1,000人が新商品Qを購入すると予想している。",
          "商品Bの購入者は，新商品P，Q，R，Sのどれかを購入すると予想している。",
          "新商品Pの購入見込者の5割は，商品Aの購入者であると予想している。",
          "新商品Sの新規顧客数は，商品Cの購入者のうち新商品Sを購入する人数より少ないと予想している。"
        ],
        "extra": {
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
        "truthIndependent": [
          false,
          false,
          false,
          true
        ],
        "independentReasons": [
          "A人数とQ率の積を記述人数と照合。",
          "B行の4率を加算し全員移行か照合。",
          "A→PをP列既存数と新規数の合計で除して1/2か照合。",
          "S新規人数とC→S人数を厳密な大小で照合。"
        ],
        "independentInputSHA": "1ba298b19fe34d2ab6e209e5e3e2b002f29beed223c5e47dfb684b9c1075fc59"
      },
      {
        "values": [
          1
        ],
        "prompt": "T社では3種類の商品A，B，Cを販売している。現在のところ，それぞれの商品には毎月10,000人，20,000人，80,000人の購入者がいる。来年から商品体系を変更して，4種類の新商品P，Q，R，Sを販売する予定である。そこで，既存の顧客が新商品を購入する割合と新規の顧客数を試算した。この試算について，適切な記述はどれか。ここで，表の各行に記載されている小数第1位までの数値が，該当する旧商品から新商品に乗り換える人の割合を表す。",
        "choices": [
          "商品Aの購入者のうち，3,000人が新商品Qを購入すると予想している。",
          "商品Bの購入者は，新商品P，Q，R，Sのどれかを購入すると予想している。",
          "新商品Pの購入見込者の5割は，商品Aの購入者であると予想している。",
          "新商品Sの新規顧客数は，商品Cの購入者のうち新商品Sを購入する人数より少ないと予想している。"
        ],
        "extra": {
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
        "truthIndependent": [
          true,
          false,
          false,
          false
        ],
        "independentReasons": [
          "A人数とQ率の積を記述人数と照合。",
          "B行の4率を加算し全員移行か照合。",
          "A→PをP列既存数と新規数の合計で除して1/2か照合。",
          "S新規人数とC→S人数を厳密な大小で照合。"
        ],
        "independentInputSHA": "1e28df9435bc777e05b58c1060c193714296d5bdeecf2362d996d3f22ab262fd"
      },
      {
        "values": [
          2
        ],
        "prompt": "T社では3種類の商品A，B，Cを販売している。現在のところ，それぞれの商品には毎月10,000人，20,000人，80,000人の購入者がいる。来年から商品体系を変更して，4種類の新商品P，Q，R，Sを販売する予定である。そこで，既存の顧客が新商品を購入する割合と新規の顧客数を試算した。この試算について，適切な記述はどれか。ここで，表の各行に記載されている小数第1位までの数値が，該当する旧商品から新商品に乗り換える人の割合を表す。",
        "choices": [
          "商品Aの購入者のうち，1,000人が新商品Qを購入すると予想している。",
          "商品Bの購入者は，新商品P，Q，R，Sのどれかを購入すると予想している。",
          "新商品Pの購入見込者の5割は，商品Aの購入者であると予想している。",
          "新商品Sの新規顧客数は，商品Cの購入者のうち新商品Sを購入する人数より少ないと予想している。"
        ],
        "extra": {
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
        "truthIndependent": [
          false,
          true,
          false,
          false
        ],
        "independentReasons": [
          "A人数とQ率の積を記述人数と照合。",
          "B行の4率を加算し全員移行か照合。",
          "A→PをP列既存数と新規数の合計で除して1/2か照合。",
          "S新規人数とC→S人数を厳密な大小で照合。"
        ],
        "independentInputSHA": "c7087911f2bcd369a0bd9f078bc2e996ff4c6f94025dd3b17087ebe8fe96b897"
      },
      {
        "values": [
          3
        ],
        "prompt": "T社では3種類の商品A，B，Cを販売している。現在のところ，それぞれの商品には毎月30,000人，20,000人，10,000人の購入者がいる。来年から商品体系を変更して，4種類の新商品P，Q，R，Sを販売する予定である。そこで，既存の顧客が新商品を購入する割合と新規の顧客数を試算した。この試算について，適切な記述はどれか。ここで，表の各行に記載されている小数第1位までの数値が，該当する旧商品から新商品に乗り換える人の割合を表す。",
        "choices": [
          "商品Aの購入者のうち，1,000人が新商品Qを購入すると予想している。",
          "商品Bの購入者は，新商品P，Q，R，Sのどれかを購入すると予想している。",
          "新商品Pの購入見込者の5割は，商品Aの購入者であると予想している。",
          "新商品Sの新規顧客数は，商品Cの購入者のうち新商品Sを購入する人数より少ないと予想している。"
        ],
        "extra": {
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
        },
        "truthIndependent": [
          false,
          false,
          true,
          false
        ],
        "independentReasons": [
          "A人数とQ率の積を記述人数と照合。",
          "B行の4率を加算し全員移行か照合。",
          "A→PをP列既存数と新規数の合計で除して1/2か照合。",
          "S新規人数とC→S人数を厳密な大小で照合。"
        ],
        "independentInputSHA": "ae20819e22a1ad46a176708bfb1f574d56fe072d47565827014bc7de07f2ecec"
      }
    ]
  },
  {
    "source": "2018h30a-fe-am-70",
    "number": 70,
    "page": 33,
    "title": "技術進化の曲線",
    "officialKey": "ア",
    "originalPrompt": "技術は，理想とする技術を目指す過程において，導入期，成長期，成熟期，衰退期，そして次の技術フェーズに移行するという進化の過程をたどる。この技術進化過程を表すものはどれか。",
    "originalChoices": [
      "技術のSカーブ",
      "需要曲線",
      "バスタブ曲線",
      "ラーニングカーブ"
    ],
    "originalExtra": {},
    "fullAlt": "平成30年度秋期 基本情報技術者試験 旧午前 問70。技術は，理想とする技術を目指す過程において，導入期，成長期，成熟期，衰退期，そして次の技術フェーズに移行するという進化の過程をたどる。この技術進化過程を表すものはどれか。 ア 技術のSカーブ イ 需要曲線 ウ バスタブ曲線 エ ラーニングカーブ",
    "crop": {
      "source": "2018h30a-fe-am-70",
      "input": "accepted-inputs/renders/autumn-am-33.png",
      "inputSHA256": "13513c62c767150412c494f1d505f94436e2a0c74cdf0a6dbca512f36623ad2f",
      "sourcePixels": [
        788,
        1115
      ],
      "pixelBox": [
        0,
        700,
        788,
        920
      ],
      "relativeY": [
        0.6278026905829597,
        0.8251121076233184
      ],
      "diagnosticFile": "diagnostic-crops-v4/2018h30a-fe-am-70.png",
      "sha256": "f60438c6e660a78580958ce47e83b20df177fe6e8c864f876cd7203b5dc49a12",
      "cropBytes": 55502,
      "inkBoundsInCrop": [
        85,
        24,
        693,
        193
      ],
      "status": "research crop proposal only; text/figure/all4 retained and adjacent questions excluded by full-page visual reading; future actual asset requires fresh view",
      "authority": "official full page is canonical; this diagnostic is not a staged Asset"
    },
    "metadata": {
      "source": "2018h30a-fe-am-70",
      "status": "proposed_allowed13_not_implemented",
      "storedReferenceRows": 1,
      "proposedRawConditionCount": 2,
      "implementedCapacity": 0,
      "sourceReference": [
        0
      ],
      "denseValues": [
        [
          0
        ],
        [
          1
        ]
      ],
      "fields": [
        {
          "name": "条件profile",
          "minimum": 0,
          "maximum": 1
        }
      ],
      "versionProposal": "3.2.0",
      "generatorWillBeCreated": true,
      "answerVariationMetadata": {
        "ownProperty": false,
        "reason": "omit property; existing answerCanVary defaults true"
      },
      "samplingPolicy": "varying_correct_fact",
      "correctConceptSignatures": [
        "technology-S-curve",
        "learning-curve"
      ],
      "correctFactSignatures": [
        "technology-S-curve",
        "learning-curve"
      ],
      "expectedCoreAnswerTextSignatures": [
        "技術のSカーブ",
        "ラーニングカーブ"
      ],
      "expectedCoreLiteralSignatureCount": 2,
      "meaningClassCount": 2,
      "factSignatureCount": 2,
      "expectedCorrectPositionClasses": 2,
      "usedInputPolicy": "exclude whole-session/most-recent used input by exact source+template version+values, include source0 as a valid normal value",
      "previousAnswerPolicy": "exclude last actual correct-answer text signature as existing core; distinct reviewed fact signatures/literals are separately checked",
      "failurePolicy": "all eligible excluded -> FINITE_CAPACITY_EXHAUSTED in source-local helper; actual prepareRun remains bounded128 and GENERATION_CAPACITY, no hidden reuse"
    },
    "conditions": [
      {
        "values": [
          0
        ],
        "prompt": "技術は，理想とする技術を目指す過程において，導入期，成長期，成熟期，衰退期，そして次の技術フェーズに移行するという進化の過程をたどる。この技術進化過程を表すものはどれか。",
        "choices": [
          "技術のSカーブ",
          "需要曲線",
          "バスタブ曲線",
          "ラーニングカーブ"
        ],
        "extra": {},
        "truthIndependent": [
          true,
          false,
          false,
          false
        ],
        "independentReasons": [
          "技術の進歩が加速し限界へ近づき次技術へ移る現象で，原題のSカーブ。",
          "需要曲線は価格と需要量の関係で，技術進化の段階でない。",
          "初期・偶発・摩耗の故障率推移で，技術性能向上を表さない。",
          "反復経験と単位作業時間・費用の低下で，原の技術進化と異なる。"
        ],
        "independentInputSHA": "963e6b07ca74808f6ae0e087e22f0f6d78667ab631b51e08fe471fcd136ace16"
      },
      {
        "values": [
          1
        ],
        "prompt": "同じ作業を繰り返すことによって，経験の蓄積に伴い1個当たりの作業時間が短くなる。この経験の蓄積と作業時間との関係を表すものはどれか。",
        "choices": [
          "技術のSカーブ",
          "需要曲線",
          "バスタブ曲線",
          "ラーニングカーブ"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          false,
          false,
          true
        ],
        "independentReasons": [
          "技術性能の進化であって，同じ作業の習熟に伴う単位時間の関係ではない。",
          "価格を変えたときの需要量を示すので，反復経験の説明ではない。",
          "経過時間と機器故障率の関係で，経験による作業時間の短縮を表さない。",
          "累積する反復経験により単位作業時間が減る学習効果なのでラーニングカーブ。"
        ],
        "independentInputSHA": "6c228b002b11354d845dcc3602648944b2586ff91c0cb887407b1a95a37e9a52"
      }
    ]
  },
  {
    "source": "2018h30a-fe-am-71",
    "number": 71,
    "page": 34,
    "title": "IoTの構成要素",
    "officialKey": "イ",
    "originalPrompt": "IoTの構成要素に関する記述として，適切なものはどれか。",
    "originalChoices": [
      "アナログ式の機器を除く，ディジタル式の機器が対象となる。",
      "インターネット又は閉域網に接続できる全てのものが対象となる。",
      "自律的にデータを収集してデータ分析を行う機器だけが対象となる。",
      "人や生物を除く，形のある全てのものが対象となる。"
    ],
    "originalExtra": {},
    "fullAlt": "平成30年度秋期 基本情報技術者試験 旧午前 問71。IoTの構成要素に関する記述として，適切なものはどれか。 ア アナログ式の機器を除く，ディジタル式の機器が対象となる。 イ インターネット又は閉域網に接続できる全てのものが対象となる。 ウ 自律的にデータを収集してデータ分析を行う機器だけが対象となる。 エ 人や生物を除く，形のある全てのものが対象となる。",
    "crop": {
      "source": "2018h30a-fe-am-71",
      "input": "accepted-inputs/renders/autumn-am-34.png",
      "inputSHA256": "9f727fd9c2038fffb8b101b1bb196ab0e57345046647968f51758728eff2f281",
      "sourcePixels": [
        788,
        1115
      ],
      "pixelBox": [
        0,
        90,
        788,
        300
      ],
      "relativeY": [
        0.08071748878923767,
        0.26905829596412556
      ],
      "diagnosticFile": "diagnostic-crops-v4/2018h30a-fe-am-71.png",
      "sha256": "da051a0f1a8897c75b0a985d0a0dca8ea070b3f8eeb44eb984b66ac0bd5cfe4c",
      "cropBytes": 69064,
      "inkBoundsInCrop": [
        92,
        17,
        618,
        185
      ],
      "status": "research crop proposal only; text/figure/all4 retained and adjacent questions excluded by full-page visual reading; future actual asset requires fresh view",
      "authority": "official full page is canonical; this diagnostic is not a staged Asset"
    },
    "metadata": {
      "source": "2018h30a-fe-am-71",
      "status": "proposed_allowed13_not_implemented",
      "storedReferenceRows": 1,
      "proposedRawConditionCount": 2,
      "implementedCapacity": 0,
      "sourceReference": [
        0
      ],
      "denseValues": [
        [
          0
        ],
        [
          1
        ]
      ],
      "fields": [
        {
          "name": "条件profile",
          "minimum": 0,
          "maximum": 1
        }
      ],
      "versionProposal": "3.2.0",
      "generatorWillBeCreated": true,
      "answerVariationMetadata": {
        "ownProperty": true,
        "value": "fixed"
      },
      "samplingPolicy": "fixed_meaning",
      "correctConceptSignatures": [
        "broad-networked-IoT",
        "broad-networked-IoT"
      ],
      "correctFactSignatures": [
        "broad-networked-IoT",
        "broad-networked-IoT"
      ],
      "expectedCoreAnswerTextSignatures": [
        "インターネット又は閉域網に接続できる全てのものが対象となる。",
        "ゲートウェイを介してネットワークに接続するセンサーも，構成要素となり得る。"
      ],
      "expectedCoreLiteralSignatureCount": 2,
      "meaningClassCount": 1,
      "factSignatureCount": 1,
      "expectedCorrectPositionClasses": 1,
      "usedInputPolicy": "exclude whole-session/most-recent used input by exact source+template version+values, include source0 as a valid normal value",
      "previousAnswerPolicy": "ignore last answer exclusion under fixed flag; still exclude used input",
      "failurePolicy": "all eligible excluded -> FINITE_CAPACITY_EXHAUSTED in source-local helper; actual prepareRun remains bounded128 and GENERATION_CAPACITY, no hidden reuse"
    },
    "conditions": [
      {
        "values": [
          0
        ],
        "prompt": "IoTの構成要素に関する記述として，適切なものはどれか。",
        "choices": [
          "アナログ式の機器を除く，ディジタル式の機器が対象となる。",
          "インターネット又は閉域網に接続できる全てのものが対象となる。",
          "自律的にデータを収集してデータ分析を行う機器だけが対象となる。",
          "人や生物を除く，形のある全てのものが対象となる。"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          true,
          false,
          false
        ],
        "independentReasons": [
          "アナログ量も変換器や通信機器経由で取得でき，それだけでIoT対象から除けない。",
          "機器等が直接又はゲートウェイ経由でネットワークにつながる構成を含む。閉域網も原問の広義範囲。",
          "収集・通信して遠隔で分析する構成もあり，各端末の自律分析は必要条件でない。",
          "人や動物の状態を取得する装着機器もあり，それらを対象にしないという制限はない。"
        ],
        "independentInputSHA": "d3393b9330a34eeb36fef3fe318413cc1a4863976291edc1505752d77b95bce9"
      },
      {
        "values": [
          1
        ],
        "prompt": "IoTの構成要素に関する記述として，適切なものはどれか。",
        "choices": [
          "アナログ信号を出力するセンサーは，変換器や通信装置を介しても構成要素には含められない。",
          "ゲートウェイを介してネットワークに接続するセンサーも，構成要素となり得る。",
          "収集したデータを端末自身が分析する場合だけ，その端末は構成要素となる。",
          "動物に装着して位置や状態を取得する端末は，構成要素には含められない。"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          true,
          false,
          false
        ],
        "independentReasons": [
          "アナログ量も変換器や通信機器経由で取得でき，それだけでIoT対象から除けない。",
          "機器等が直接又はゲートウェイ経由でネットワークにつながる構成を含む。閉域網も原問の広義範囲。",
          "収集・通信して遠隔で分析する構成もあり，各端末の自律分析は必要条件でない。",
          "人や動物の状態を取得する装着機器もあり，それらを対象にしないという制限はない。"
        ],
        "independentInputSHA": "d61e699759383c5f26b8601f6b518da9de5575ab3b119704e0ea316c6c16f8bb"
      }
    ]
  },
  {
    "source": "2018h30a-fe-am-72",
    "number": 72,
    "page": 34,
    "title": "RFIDの特徴",
    "officialKey": "エ",
    "originalPrompt": "ICタグ（RFID）の特徴はどれか。",
    "originalChoices": [
      "GPSを利用し，現在地の位置情報や属性情報を表示する。",
      "専用の磁気読取り装置に挿入して使用する。",
      "大量の情報を扱うので，情報の記憶には外部記憶装置を使用する。",
      "汚れに強く，記録された情報を梱包の外から読むことができる。"
    ],
    "originalExtra": {},
    "fullAlt": "平成30年度秋期 基本情報技術者試験 旧午前 問72。ICタグ（RFID）の特徴はどれか。 ア GPSを利用し，現在地の位置情報や属性情報を表示する。 イ 専用の磁気読取り装置に挿入して使用する。 ウ 大量の情報を扱うので，情報の記憶には外部記憶装置を使用する。 エ 汚れに強く，記録された情報を梱包の外から読むことができる。",
    "crop": {
      "source": "2018h30a-fe-am-72",
      "input": "accepted-inputs/renders/autumn-am-34.png",
      "inputSHA256": "9f727fd9c2038fffb8b101b1bb196ab0e57345046647968f51758728eff2f281",
      "sourcePixels": [
        788,
        1115
      ],
      "pixelBox": [
        0,
        330,
        788,
        550
      ],
      "relativeY": [
        0.29596412556053814,
        0.49327354260089684
      ],
      "diagnosticFile": "diagnostic-crops-v4/2018h30a-fe-am-72.png",
      "sha256": "30a51c68fe978e4f99c90c9ff7f23915d670ec61ba7534eca9156746d14cd952",
      "cropBytes": 64612,
      "inkBoundsInCrop": [
        92,
        23,
        603,
        192
      ],
      "status": "research crop proposal only; text/figure/all4 retained and adjacent questions excluded by full-page visual reading; future actual asset requires fresh view",
      "authority": "official full page is canonical; this diagnostic is not a staged Asset"
    },
    "metadata": {
      "source": "2018h30a-fe-am-72",
      "status": "proposed_allowed13_not_implemented",
      "storedReferenceRows": 1,
      "proposedRawConditionCount": 2,
      "implementedCapacity": 0,
      "sourceReference": [
        0
      ],
      "denseValues": [
        [
          0
        ],
        [
          1
        ]
      ],
      "fields": [
        {
          "name": "条件profile",
          "minimum": 0,
          "maximum": 1
        }
      ],
      "versionProposal": "3.2.0",
      "generatorWillBeCreated": true,
      "answerVariationMetadata": {
        "ownProperty": false,
        "reason": "omit property; existing answerCanVary defaults true"
      },
      "samplingPolicy": "varying_correct_fact",
      "correctConceptSignatures": [
        "RFID",
        "RFID"
      ],
      "correctFactSignatures": [
        "rfid-nonvisual-packaging",
        "rfid-bulk-noncontact"
      ],
      "expectedCoreAnswerTextSignatures": [
        "汚れに強く，記録された情報を梱包の外から読むことができる。",
        "複数のタグに記録された識別情報を，電波を使って非接触で読み取ることができる。"
      ],
      "expectedCoreLiteralSignatureCount": 2,
      "meaningClassCount": 1,
      "factSignatureCount": 2,
      "expectedCorrectPositionClasses": 1,
      "usedInputPolicy": "exclude whole-session/most-recent used input by exact source+template version+values, include source0 as a valid normal value",
      "previousAnswerPolicy": "exclude last actual correct-answer text signature as existing core; distinct reviewed fact signatures/literals are separately checked",
      "failurePolicy": "all eligible excluded -> FINITE_CAPACITY_EXHAUSTED in source-local helper; actual prepareRun remains bounded128 and GENERATION_CAPACITY, no hidden reuse"
    },
    "conditions": [
      {
        "values": [
          0
        ],
        "prompt": "ICタグ（RFID）の特徴はどれか。",
        "choices": [
          "GPSを利用し，現在地の位置情報や属性情報を表示する。",
          "専用の磁気読取り装置に挿入して使用する。",
          "大量の情報を扱うので，情報の記憶には外部記憶装置を使用する。",
          "汚れに強く，記録された情報を梱包の外から読むことができる。"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          false,
          false,
          true
        ],
        "independentReasons": [
          "タグは無線の識別媒体で，衛星測位が必須機能ではない。",
          "磁気媒体の接触・挿入方式と電波による非接触通信は異なる。",
          "タグ側が記録用メモリをもつ。外部DB併用とタグに記憶領域がないことは同じでない。",
          "電波を使うので目視できない梱包内や表面の汚れでも読める特徴がある。金属等の影響がない保証にはしない。"
        ],
        "independentInputSHA": "51b34f4ff30c20c498a846c17fa1b6de4fe2a0cab87a4085ee2199887737cc2d"
      },
      {
        "values": [
          1
        ],
        "prompt": "ICタグ（RFID）の特徴はどれか。",
        "choices": [
          "衛星からの信号を用い，タグ自体が現在位置を必ず算出する。",
          "磁気ヘッドに接触させ，タグの磁気パターンを読み取る。",
          "識別情報は全て読取り装置だけに保存され，タグの内部には記憶する領域をもたない。",
          "複数のタグに記録された識別情報を，電波を使って非接触で読み取ることができる。"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          false,
          false,
          true
        ],
        "independentReasons": [
          "RFIDタグ自体がGPS位置を必ず求めるという必要条件はない。",
          "磁気ヘッドで磁気パターンを読む方式はRFIDの電波通信ではない。",
          "タグに識別情報の記憶領域があり，読取器のみが情報を保持するとは限らない。",
          "非接触で複数タグを読み取る仕組みは実装される特徴。全規格・全環境で必ず一括成功するという主張はしていない。"
        ],
        "independentInputSHA": "849825926835c6d6b970e5fff5b3358f7fbbe628278be02d4c107e76ea6c1c35"
      }
    ]
  },
  {
    "source": "2018h30a-fe-am-73",
    "number": 73,
    "page": 34,
    "title": "O to O",
    "officialKey": "エ",
    "originalPrompt": "ネットビジネスでのO to Oの説明はどれか。",
    "originalChoices": [
      "基本的なサービスや製品を無料で提供し，高度な機能や特別な機能については料金を課金するビジネスモデルである。",
      "顧客仕様に応じたカスタマイズを実現するために，顧客からの注文後に最終製品の生産を始める方式である。",
      "電子商取引で，代金を払ったのに商品が届かない，商品を送ったのに代金が支払われないなどのトラブルが防止できる仕組みである。",
      "モバイル端末などを利用している顧客を，仮想店舗から実店舗に，又は実店舗から仮想店舗に誘導しながら，購入につなげる仕組みである。"
    ],
    "originalExtra": {},
    "fullAlt": "平成30年度秋期 基本情報技術者試験 旧午前 問73。ネットビジネスでのO to Oの説明はどれか。 ア 基本的なサービスや製品を無料で提供し，高度な機能や特別な機能については料金を課金するビジネスモデルである。 イ 顧客仕様に応じたカスタマイズを実現するために，顧客からの注文後に最終製品の生産を始める方式である。 ウ 電子商取引で，代金を払ったのに商品が届かない，商品を送ったのに代金が支払われないなどのトラブルが防止できる仕組みである。 エ モバイル端末などを利用している顧客を，仮想店舗から実店舗に，又は実店舗から仮想店舗に誘導しながら，購入につなげる仕組みである。",
    "crop": {
      "source": "2018h30a-fe-am-73",
      "input": "accepted-inputs/renders/autumn-am-34.png",
      "inputSHA256": "9f727fd9c2038fffb8b101b1bb196ab0e57345046647968f51758728eff2f281",
      "sourcePixels": [
        788,
        1115
      ],
      "pixelBox": [
        0,
        575,
        788,
        920
      ],
      "relativeY": [
        0.515695067264574,
        0.8251121076233184
      ],
      "diagnosticFile": "diagnostic-crops-v4/2018h30a-fe-am-73.png",
      "sha256": "f0d6fa1f6074d6da53835a6b7c6f7ed125d2e2d75a15ff10cf081717123f1f48",
      "cropBytes": 116709,
      "inkBoundsInCrop": [
        92,
        23,
        701,
        315
      ],
      "status": "research crop proposal only; text/figure/all4 retained and adjacent questions excluded by full-page visual reading; future actual asset requires fresh view",
      "authority": "official full page is canonical; this diagnostic is not a staged Asset"
    },
    "metadata": {
      "source": "2018h30a-fe-am-73",
      "status": "proposed_allowed13_not_implemented",
      "storedReferenceRows": 1,
      "proposedRawConditionCount": 2,
      "implementedCapacity": 0,
      "sourceReference": [
        0
      ],
      "denseValues": [
        [
          0
        ],
        [
          1
        ]
      ],
      "fields": [
        {
          "name": "条件profile",
          "minimum": 0,
          "maximum": 1
        }
      ],
      "versionProposal": "3.2.0",
      "generatorWillBeCreated": true,
      "answerVariationMetadata": {
        "ownProperty": true,
        "value": "fixed"
      },
      "samplingPolicy": "fixed_meaning",
      "correctConceptSignatures": [
        "O2O",
        "O2O"
      ],
      "correctFactSignatures": [
        "O2O",
        "O2O"
      ],
      "expectedCoreAnswerTextSignatures": [
        "モバイル端末などを利用している顧客を，仮想店舗から実店舗に，又は実店舗から仮想店舗に誘導しながら，購入につなげる仕組みである。",
        "ネットで発行したクーポンで実店舗への来店を促し，店頭でもネットの購入サイトを案内して購買につなげる。"
      ],
      "expectedCoreLiteralSignatureCount": 2,
      "meaningClassCount": 1,
      "factSignatureCount": 1,
      "expectedCorrectPositionClasses": 1,
      "usedInputPolicy": "exclude whole-session/most-recent used input by exact source+template version+values, include source0 as a valid normal value",
      "previousAnswerPolicy": "ignore last answer exclusion under fixed flag; still exclude used input",
      "failurePolicy": "all eligible excluded -> FINITE_CAPACITY_EXHAUSTED in source-local helper; actual prepareRun remains bounded128 and GENERATION_CAPACITY, no hidden reuse"
    },
    "conditions": [
      {
        "values": [
          0
        ],
        "prompt": "ネットビジネスでのO to Oの説明はどれか。",
        "choices": [
          "基本的なサービスや製品を無料で提供し，高度な機能や特別な機能については料金を課金するビジネスモデルである。",
          "顧客仕様に応じたカスタマイズを実現するために，顧客からの注文後に最終製品の生産を始める方式である。",
          "電子商取引で，代金を払ったのに商品が届かない，商品を送ったのに代金が支払われないなどのトラブルが防止できる仕組みである。",
          "モバイル端末などを利用している顧客を，仮想店舗から実店舗に，又は実店舗から仮想店舗に誘導しながら，購入につなげる仕組みである。"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          false,
          false,
          true
        ],
        "independentReasons": [
          "無料基本機能と有料追加機能の料金モデルであり，オンラインと店舗への誘導でない。",
          "注文後に顧客仕様を組み立てる生産方式で，チャネル間誘導ではない。",
          "代金等の受渡しを第三者が仲介して取引を成立させる役割。",
          "オンラインと店頭を連携して来店・購買につなぐので2018原の双方向O2Oの範囲に合う。"
        ],
        "independentInputSHA": "0e3d54ae90ad5bf49890cc917f68df632e7fb501784423baf9cafde2711f7cd6"
      },
      {
        "values": [
          1
        ],
        "prompt": "ネットビジネスでのO to Oの説明はどれか。",
        "choices": [
          "基本的な保存機能を無料とし，保存容量を増やす機能は有料で提供する。",
          "注文を受けた後に，指定された構成に合わせて製品を組み立てる。",
          "第三者が代金を一時的に預かり，商品の受領確認後に売手へ支払う。",
          "ネットで発行したクーポンで実店舗への来店を促し，店頭でもネットの購入サイトを案内して購買につなげる。"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          false,
          false,
          true
        ],
        "independentReasons": [
          "無料基本機能と有料追加機能の料金モデルであり，オンラインと店舗への誘導でない。",
          "注文後に顧客仕様を組み立てる生産方式で，チャネル間誘導ではない。",
          "代金等の受渡しを第三者が仲介して取引を成立させる役割。",
          "オンラインと店頭を連携して来店・購買につなぐので2018原の双方向O2Oの範囲に合う。"
        ],
        "independentInputSHA": "dce807498b7562d4d609d37dc16d23739c1f27a38d7f5cc359688c34cdd59cec"
      }
    ]
  },
  {
    "source": "2018h30a-fe-am-78",
    "number": 78,
    "page": 37,
    "title": "コンピュータウイルス作成の処罰法",
    "officialKey": "ア",
    "originalPrompt": "コンピュータウイルスを作成する行為を処罰の対象とする法律はどれか。",
    "originalChoices": [
      "刑法",
      "不正アクセス禁止法",
      "不正競争防止法",
      "プロバイダ責任制限法"
    ],
    "originalExtra": {},
    "fullAlt": "平成30年度秋期 基本情報技術者試験 旧午前 問78。コンピュータウイルスを作成する行為を処罰の対象とする法律はどれか。 ア 刑法 イ 不正アクセス禁止法 ウ 不正競争防止法 エ プロバイダ責任制限法",
    "crop": {
      "source": "2018h30a-fe-am-78",
      "input": "accepted-inputs/renders/autumn-am-37.png",
      "inputSHA256": "295a31e4bcd78f608d301dd74d91e47e67c80bab96199a6b60b62b0bfc5881de",
      "sourcePixels": [
        788,
        1115
      ],
      "pixelBox": [
        0,
        90,
        788,
        240
      ],
      "relativeY": [
        0.08071748878923767,
        0.21524663677130046
      ],
      "diagnosticFile": "diagnostic-crops-v4/2018h30a-fe-am-78.png",
      "sha256": "7b41a5f1edecdf309dda735bb2b34b26067d8953fee16930d54cb99d18ea520d",
      "cropBytes": 32951,
      "inkBoundsInCrop": [
        85,
        17,
        626,
        125
      ],
      "status": "research crop proposal only; text/figure/all4 retained and adjacent questions excluded by full-page visual reading; future actual asset requires fresh view",
      "authority": "official full page is canonical; this diagnostic is not a staged Asset"
    },
    "metadata": {
      "source": "2018h30a-fe-am-78",
      "status": "proposed_allowed13_not_implemented",
      "storedReferenceRows": 1,
      "proposedRawConditionCount": 2,
      "implementedCapacity": 0,
      "sourceReference": [
        0
      ],
      "denseValues": [
        [
          0
        ],
        [
          1
        ]
      ],
      "fields": [
        {
          "name": "条件profile",
          "minimum": 0,
          "maximum": 1
        }
      ],
      "versionProposal": "3.2.0",
      "generatorWillBeCreated": true,
      "answerVariationMetadata": {
        "ownProperty": true,
        "value": "fixed"
      },
      "samplingPolicy": "fixed_meaning",
      "correctConceptSignatures": [
        "刑法",
        "刑法"
      ],
      "correctFactSignatures": [
        "刑法",
        "刑法"
      ],
      "expectedCoreAnswerTextSignatures": [
        "刑法",
        "刑法"
      ],
      "expectedCoreLiteralSignatureCount": 1,
      "meaningClassCount": 1,
      "factSignatureCount": 1,
      "expectedCorrectPositionClasses": 1,
      "usedInputPolicy": "exclude whole-session/most-recent used input by exact source+template version+values, include source0 as a valid normal value",
      "previousAnswerPolicy": "ignore last answer exclusion under fixed flag; still exclude used input",
      "failurePolicy": "all eligible excluded -> FINITE_CAPACITY_EXHAUSTED in source-local helper; actual prepareRun remains bounded128 and GENERATION_CAPACITY, no hidden reuse"
    },
    "conditions": [
      {
        "values": [
          0
        ],
        "prompt": "コンピュータウイルスを作成する行為を処罰の対象とする法律はどれか。",
        "choices": [
          "刑法",
          "不正アクセス禁止法",
          "不正競争防止法",
          "プロバイダ責任制限法"
        ],
        "extra": {},
        "truthIndependent": [
          true,
          false,
          false,
          false
        ],
        "independentReasons": [
          "2011年に刑法168条の2へ作成・提供等の罪が設けられている。正当理由・実行供用目的・不正指令性等を前提とし，ウイルス研究全ての処罰という説明にしない。",
          "アクセス規制であり，不正指令記録の作成・提供罪を置く法名ではない。",
          "営業秘密等の公正な競争を保護する法で，この罪の設置先でない。",
          "情報流通の媒介者責任等に関する当時の法名で，この罪の設置先でない。"
        ],
        "independentInputSHA": "39b5695331ea869d4d17c7ed3d95ba9c600e084eb7977fb1b4283dc548d27051"
      },
      {
        "values": [
          1
        ],
        "prompt": "正当な理由なく，他人のコンピュータで実行させる目的でコンピュータウイルスを提供する行為を処罰の対象とする法律はどれか。",
        "choices": [
          "刑法",
          "不正アクセス禁止法",
          "不正競争防止法",
          "プロバイダ責任制限法"
        ],
        "extra": {},
        "truthIndependent": [
          true,
          false,
          false,
          false
        ],
        "independentReasons": [
          "2011年に刑法168条の2へ作成・提供等の罪が設けられている。正当理由・実行供用目的・不正指令性等を前提とし，ウイルス研究全ての処罰という説明にしない。",
          "アクセス規制であり，不正指令記録の作成・提供罪を置く法名ではない。",
          "営業秘密等の公正な競争を保護する法で，この罪の設置先でない。",
          "情報流通の媒介者責任等に関する当時の法名で，この罪の設置先でない。"
        ],
        "independentInputSHA": "068b224cc94073d14f7aef9282320f9a010e93c9c06084c1279cdf0af26feddc"
      }
    ]
  },
  {
    "source": "2018h30a-fe-am-79",
    "number": 79,
    "page": 37,
    "title": "旧個人情報保護ガイドライン",
    "officialKey": "エ",
    "originalPrompt": "個人情報保護委員会“個人情報の保護に関する法律についてのガイドライン（通則編）平成28年11月（平成29年3月一部改正）”によれば，個人情報に該当しないものはどれか。",
    "originalChoices": [
      "受付に設置した監視カメラに録画された，本人が判別できる映像データ",
      "個人番号の記載がない，社員に交付する源泉徴収票",
      "指紋認証のための指紋データのバックアップデータ",
      "匿名加工情報に加工された利用者アンケート情報"
    ],
    "originalExtra": {},
    "fullAlt": "平成30年度秋期 基本情報技術者試験 旧午前 問79。個人情報保護委員会“個人情報の保護に関する法律についてのガイドライン（通則編）平成28年11月（平成29年3月一部改正）”によれば，個人情報に該当しないものはどれか。 ア 受付に設置した監視カメラに録画された，本人が判別できる映像データ イ 個人番号の記載がない，社員に交付する源泉徴収票 ウ 指紋認証のための指紋データのバックアップデータ エ 匿名加工情報に加工された利用者アンケート情報",
    "crop": {
      "source": "2018h30a-fe-am-79",
      "input": "accepted-inputs/renders/autumn-am-37.png",
      "inputSHA256": "295a31e4bcd78f608d301dd74d91e47e67c80bab96199a6b60b62b0bfc5881de",
      "sourcePixels": [
        788,
        1115
      ],
      "pixelBox": [
        0,
        270,
        788,
        545
      ],
      "relativeY": [
        0.242152466367713,
        0.48878923766816146
      ],
      "diagnosticFile": "diagnostic-crops-v4/2018h30a-fe-am-79.png",
      "sha256": "21eb5e039960ef26838d567b435c823358b6c33ec9785b7e9a73d0dc0be1399e",
      "cropBytes": 90356,
      "inkBoundsInCrop": [
        84,
        23,
        692,
        252
      ],
      "status": "research crop proposal only; text/figure/all4 retained and adjacent questions excluded by full-page visual reading; future actual asset requires fresh view",
      "authority": "official full page is canonical; this diagnostic is not a staged Asset"
    },
    "metadata": {
      "source": "2018h30a-fe-am-79",
      "status": "proposed_allowed13_not_implemented",
      "storedReferenceRows": 1,
      "proposedRawConditionCount": 2,
      "implementedCapacity": 0,
      "sourceReference": [
        0
      ],
      "denseValues": [
        [
          0
        ],
        [
          1
        ]
      ],
      "fields": [
        {
          "name": "条件profile",
          "minimum": 0,
          "maximum": 1
        }
      ],
      "versionProposal": "3.2.0",
      "generatorWillBeCreated": true,
      "answerVariationMetadata": {
        "ownProperty": true,
        "value": "fixed"
      },
      "samplingPolicy": "fixed_meaning",
      "correctConceptSignatures": [
        "legally-anonymized",
        "legally-anonymized"
      ],
      "correctFactSignatures": [
        "legally-anonymized",
        "legally-anonymized"
      ],
      "expectedCoreAnswerTextSignatures": [
        "匿名加工情報に加工された利用者アンケート情報",
        "匿名加工情報に加工された購買履歴情報"
      ],
      "expectedCoreLiteralSignatureCount": 2,
      "meaningClassCount": 1,
      "factSignatureCount": 1,
      "expectedCorrectPositionClasses": 1,
      "usedInputPolicy": "exclude whole-session/most-recent used input by exact source+template version+values, include source0 as a valid normal value",
      "previousAnswerPolicy": "ignore last answer exclusion under fixed flag; still exclude used input",
      "failurePolicy": "all eligible excluded -> FINITE_CAPACITY_EXHAUSTED in source-local helper; actual prepareRun remains bounded128 and GENERATION_CAPACITY, no hidden reuse"
    },
    "conditions": [
      {
        "values": [
          0
        ],
        "prompt": "個人情報保護委員会“個人情報の保護に関する法律についてのガイドライン（通則編）平成28年11月（平成29年3月一部改正）”によれば，個人情報に該当しないものはどれか。",
        "choices": [
          "受付に設置した監視カメラに録画された，本人が判別できる映像データ",
          "個人番号の記載がない，社員に交付する源泉徴収票",
          "指紋認証のための指紋データのバックアップデータ",
          "匿名加工情報に加工された利用者アンケート情報"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          false,
          false,
          true
        ],
        "independentReasons": [
          "本人識別可能な映像・氏名入り音声は生存する個人の識別情報である。",
          "社員票や氏名付き勤務名簿は本人を識別でき，個人番号を欠くだけで対象外にはならない。",
          "本人認証用に抽出した指紋・虹彩の識別特徴を符号化した情報は個人識別符号を含む。バックアップでも識別性は変わらない。",
          "法定基準に従い特定個人を識別できず復元できないように加工した匿名加工情報という指定であり，単なる氏名消去や仮名置換ではない。"
        ],
        "independentInputSHA": "12f3d0a8d09aaba1294be879eb5de6beac6361aa716e92d7757cf3a360cb1541"
      },
      {
        "values": [
          1
        ],
        "prompt": "個人情報保護委員会“個人情報の保護に関する法律についてのガイドライン（通則編）平成28年11月（平成29年3月一部改正）”によれば，個人情報に該当しないものはどれか。",
        "choices": [
          "本人の氏名が含まれ，特定の個人を識別できる音声録音情報",
          "個人番号を記載していないが，氏名と勤務記録を記載した社員の名簿",
          "本人認証のために抽出した虹彩の特徴情報のバックアップデータ",
          "匿名加工情報に加工された購買履歴情報"
        ],
        "extra": {},
        "truthIndependent": [
          false,
          false,
          false,
          true
        ],
        "independentReasons": [
          "本人識別可能な映像・氏名入り音声は生存する個人の識別情報である。",
          "社員票や氏名付き勤務名簿は本人を識別でき，個人番号を欠くだけで対象外にはならない。",
          "本人認証用に抽出した指紋・虹彩の識別特徴を符号化した情報は個人識別符号を含む。バックアップでも識別性は変わらない。",
          "法定基準に従い特定個人を識別できず復元できないように加工した匿名加工情報という指定であり，単なる氏名消去や仮名置換ではない。"
        ],
        "independentInputSHA": "2ec0c8d23c2b415e5b02fde036fe985155795f54c60bddc728de35ddc99ee1ee"
      }
    ]
  },
  {
    "source": "2018h30a-fe-am-80",
    "number": 80,
    "page": 37,
    "title": "請負と労働者派遣",
    "officialKey": "ア",
    "originalPrompt": "請負契約を締結していても，労働者派遣とみなされる受託者の行為はどれか。",
    "originalChoices": [
      "休暇取得の承認を発注者側の指示に従って行う。",
      "業務の遂行に関する指導や評価を自ら実施する。",
      "勤務に関する規律や職場秩序の保持を実施する。",
      "発注者の業務上の要請を受託者側の責任者が窓口となって受け付ける。"
    ],
    "originalExtra": {},
    "fullAlt": "平成30年度秋期 基本情報技術者試験 旧午前 問80。請負契約を締結していても，労働者派遣とみなされる受託者の行為はどれか。 ア 休暇取得の承認を発注者側の指示に従って行う。 イ 業務の遂行に関する指導や評価を自ら実施する。 ウ 勤務に関する規律や職場秩序の保持を実施する。 エ 発注者の業務上の要請を受託者側の責任者が窓口となって受け付ける。",
    "crop": {
      "source": "2018h30a-fe-am-80",
      "input": "accepted-inputs/renders/autumn-am-37.png",
      "inputSHA256": "295a31e4bcd78f608d301dd74d91e47e67c80bab96199a6b60b62b0bfc5881de",
      "sourcePixels": [
        788,
        1115
      ],
      "pixelBox": [
        0,
        575,
        788,
        825
      ],
      "relativeY": [
        0.515695067264574,
        0.7399103139013453
      ],
      "diagnosticFile": "diagnostic-crops-v4/2018h30a-fe-am-80.png",
      "sha256": "957b62391ff170de90a78d054708e72ade4e65f1784a7e9fd9e50a07eae60a31",
      "cropBytes": 73034,
      "inkBoundsInCrop": [
        83,
        25,
        655,
        193
      ],
      "status": "research crop proposal only; text/figure/all4 retained and adjacent questions excluded by full-page visual reading; future actual asset requires fresh view",
      "authority": "official full page is canonical; this diagnostic is not a staged Asset"
    },
    "metadata": {
      "source": "2018h30a-fe-am-80",
      "status": "proposed_allowed13_not_implemented",
      "storedReferenceRows": 1,
      "proposedRawConditionCount": 2,
      "implementedCapacity": 0,
      "sourceReference": [
        0
      ],
      "denseValues": [
        [
          0
        ],
        [
          1
        ]
      ],
      "fields": [
        {
          "name": "条件profile",
          "minimum": 0,
          "maximum": 1
        }
      ],
      "versionProposal": "3.2.0",
      "generatorWillBeCreated": true,
      "answerVariationMetadata": {
        "ownProperty": true,
        "value": "fixed"
      },
      "samplingPolicy": "fixed_meaning",
      "correctConceptSignatures": [
        "client-labor-control",
        "client-labor-control"
      ],
      "correctFactSignatures": [
        "client-labor-control",
        "client-labor-control"
      ],
      "expectedCoreAnswerTextSignatures": [
        "休暇取得の承認を発注者側の指示に従って行う。",
        "受託者の労働者の始業・終業時刻を，発注者からの具体的な指示に従って決める。"
      ],
      "expectedCoreLiteralSignatureCount": 2,
      "meaningClassCount": 1,
      "factSignatureCount": 1,
      "expectedCorrectPositionClasses": 1,
      "usedInputPolicy": "exclude whole-session/most-recent used input by exact source+template version+values, include source0 as a valid normal value",
      "previousAnswerPolicy": "ignore last answer exclusion under fixed flag; still exclude used input",
      "failurePolicy": "all eligible excluded -> FINITE_CAPACITY_EXHAUSTED in source-local helper; actual prepareRun remains bounded128 and GENERATION_CAPACITY, no hidden reuse"
    },
    "conditions": [
      {
        "values": [
          0
        ],
        "prompt": "請負契約を締結していても，労働者派遣とみなされる受託者の行為はどれか。",
        "choices": [
          "休暇取得の承認を発注者側の指示に従って行う。",
          "業務の遂行に関する指導や評価を自ら実施する。",
          "勤務に関する規律や職場秩序の保持を実施する。",
          "発注者の業務上の要請を受託者側の責任者が窓口となって受け付ける。"
        ],
        "extra": {},
        "truthIndependent": [
          true,
          false,
          false,
          false
        ],
        "independentReasons": [
          "発注者の具体指示で休暇又は始終業を管理する行為は，受託側が労働時間管理を自らする37号告示2条1号ロと反する。",
          "受託者自身が方法指導・評価を管理する行為は同イの独立管理に合う。",
          "受託者自身の規律・配置管理は同ハの独立管理に合う。",
          "納期・成果等の注文を責任者が受けることは労働者個々への直接指揮と別で，その記述だけを派遣としない。"
        ],
        "independentInputSHA": "1812ac1525b2256d5ae2587ec05c4c2a5ab596dbf832291cc6c80519a7913a10"
      },
      {
        "values": [
          1
        ],
        "prompt": "請負契約を締結していても，労働者派遣とみなされる受託者の行為はどれか。",
        "choices": [
          "受託者の労働者の始業・終業時刻を，発注者からの具体的な指示に従って決める。",
          "受託者が業務の遂行方法を決め，自ら労働者に指導する。",
          "受託者が労働者の配置や服務規律を自ら管理する。",
          "発注者からの納期や成果物に関する要請を，受託者側の責任者が受け付ける。"
        ],
        "extra": {},
        "truthIndependent": [
          true,
          false,
          false,
          false
        ],
        "independentReasons": [
          "発注者の具体指示で休暇又は始終業を管理する行為は，受託側が労働時間管理を自らする37号告示2条1号ロと反する。",
          "受託者自身が方法指導・評価を管理する行為は同イの独立管理に合う。",
          "受託者自身の規律・配置管理は同ハの独立管理に合う。",
          "納期・成果等の注文を責任者が受けることは労働者個々への直接指揮と別で，その記述だけを派遣としない。"
        ],
        "independentInputSHA": "1dff44e9680990a181ca7eb64f66d7027a85584862de6a1f78195302162f7452"
      }
    ]
  }
] as const;

/** Fixed D04 independent term statements; not emitted by a producer. */
export const pendingAmTermFacts=[
  {
    "term": "BPO",
    "originalCandidateName": "BPO",
    "action": "new_own",
    "source": "2018h30a-fe-am-62",
    "expectedExpansion": "Business Process Outsourcing",
    "facts": [
      {
        "statement": "業務プロセスの遂行を外部へ委託する。",
        "truth": true
      },
      {
        "statement": "基盤資源の借用やソフト機能の利用だけではBPOといえない。",
        "truth": true
      },
      {
        "statement": "派遣社員の単なる補充が常にBPOである。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "IaaS",
    "originalCandidateName": "IaaS",
    "action": "append_reuse_mapping",
    "source": "2018h30a-fe-am-62",
    "expectedExpansion": "Infrastructure as a Service",
    "facts": [
      {
        "statement": "サーバ等の計算・記憶基盤をサービスとして利用する。",
        "truth": true
      },
      {
        "statement": "利用者がOSやアプリを管理する形態を含む。",
        "truth": true
      },
      {
        "statement": "提供者の業務アプリ機能を利用することだけをIaaSという。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [
      {
        "module": "src/core/study-acronyms.ts",
        "index": 61,
        "record": {
          "term": "IaaS",
          "expansion": "Infrastructure as a Service",
          "meaning": "計算資源をサービスとして提供する形態。仮想サーバなどを借り、利用者がOSやアプリケーションを管理する。",
          "related": [
            "OS"
          ]
        },
        "byteSHA256": "bad11886fa0d577ae94d8fae9b885147a3e69692caffd28f987128a03b2e070c"
      }
    ],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "SaaS",
    "originalCandidateName": "SaaS",
    "action": "append_reuse_mapping",
    "source": "2018h30a-fe-am-62",
    "expectedExpansion": "Software as a Service",
    "facts": [
      {
        "statement": "提供者が用意するアプリ機能をネットワーク経由で利用する。",
        "truth": true
      },
      {
        "statement": "業務を自社で行いソフトだけ利用する場合を含む。",
        "truth": true
      },
      {
        "statement": "SaaSなら業務プロセスの遂行責任も必ず外部委託される。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [
      {
        "module": "src/core/study-acronyms.ts",
        "index": 62,
        "record": {
          "term": "SaaS",
          "expansion": "Software as a Service",
          "meaning": "ソフトウェアをサービスとして提供する形態。提供者が用意したアプリケーションをネットワーク経由で利用する。"
        },
        "byteSHA256": "d5e19551a7978a6530aed909e1db3409030012fa9ccdebd49835db4a37a7103a"
      }
    ],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "SOA",
    "originalCandidateName": "SOA",
    "action": "append_reuse_mapping",
    "source": "2018h30a-fe-am-63",
    "expectedExpansion": "Service-Oriented Architecture",
    "facts": [
      {
        "statement": "業務機能をサービス単位で扱い組み合わせる。",
        "truth": true
      },
      {
        "statement": "サービスの組合せによって業務変化への対応を図る。",
        "truth": true
      },
      {
        "statement": "SOAの定義は特定製品のESB導入を必須とする。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [
      {
        "module": "src/core/generators/legacy-2018-study-terms.ts",
        "index": 274,
        "record": {
          "term": "SOA",
          "expansion": "Service-Oriented Architecture",
          "meaning": "サービス指向アーキテクチャ。業務機能を独立性のあるサービスとして扱い、その組合せで業務システムを構成する考え方。営業支援のSFAや、業務自体を見直すBPRとは対象が異なる。",
          "sources": [
            "2018h30h-fe-am-62"
          ]
        },
        "byteSHA256": "490cc48ae2230ac05ddaf5c155fc1e253fdc2f0256f5bfb67c892939a3758f70"
      }
    ],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "EA",
    "originalCandidateName": "EA",
    "action": "append_reuse_mapping",
    "source": "2018h30a-fe-am-63",
    "expectedExpansion": "Enterprise Architecture",
    "facts": [
      {
        "statement": "業務とシステムの全体の構造と最適化を扱う。",
        "truth": true
      },
      {
        "statement": "サービス指向の実装構成とEAは併用し得る。",
        "truth": true
      },
      {
        "statement": "EAとSOAは必ず互いに排他的である。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [
      {
        "module": "src/core/sample-2022-a-study-terms.ts",
        "index": 42,
        "record": {
          "term": "EA",
          "expansion": "Enterprise Architecture",
          "meaning": "エンタープライズアーキテクチャ。業務とシステムの全体最適化を図るための体系。",
          "aliases": [
            "エンタープライズアーキテクチャ"
          ],
          "sources": [
            "sample-2022-dec-a-1",
            "sample-2022-dec-a-2",
            "sample-2022-dec-a-3",
            "sample-2022-dec-a-4",
            "sample-2022-dec-a-5",
            "sample-2022-dec-a-6",
            "sample-2022-dec-a-7",
            "sample-2022-dec-a-8",
            "sample-2022-dec-a-9",
            "sample-2022-dec-a-10",
            "sample-2022-dec-a-11",
            "sample-2022-dec-a-12",
            "sample-2022-dec-a-13",
            "sample-2022-dec-a-14",
            "sample-2022-dec-a-15",
            "sample-2022-dec-a-16",
            "sample-2022-dec-a-17",
            "sample-2022-dec-a-18",
            "sample-2022-dec-a-19",
            "sample-2022-dec-a-20",
            "sample-2022-dec-a-21",
            "sample-2022-dec-a-22",
            "sample-2022-dec-a-23",
            "sample-2022-dec-a-24",
            "sample-2022-dec-a-25",
            "sample-2022-dec-a-26",
            "sample-2022-dec-a-27",
            "sample-2022-dec-a-28",
            "sample-2022-dec-a-29",
            "sample-2022-dec-a-30",
            "sample-2022-dec-a-31",
            "sample-2022-dec-a-32",
            "sample-2022-dec-a-33",
            "sample-2022-dec-a-34",
            "sample-2022-dec-a-35",
            "sample-2022-dec-a-36",
            "sample-2022-dec-a-37",
            "sample-2022-dec-a-38",
            "sample-2022-dec-a-39",
            "sample-2022-dec-a-40",
            "sample-2022-dec-a-41",
            "sample-2022-dec-a-42",
            "sample-2022-dec-a-43",
            "sample-2022-dec-a-44",
            "sample-2022-dec-a-45",
            "sample-2022-dec-a-46",
            "sample-2022-dec-a-47",
            "sample-2022-dec-a-48",
            "sample-2022-dec-a-49",
            "sample-2022-dec-a-50",
            "sample-2022-dec-a-51",
            "sample-2022-dec-a-52",
            "sample-2022-dec-a-53",
            "sample-2022-dec-a-54",
            "sample-2022-dec-a-55",
            "sample-2022-dec-a-56",
            "sample-2022-dec-a-57",
            "sample-2022-dec-a-58",
            "sample-2022-dec-a-59",
            "sample-2022-dec-a-60"
          ]
        },
        "byteSHA256": "505f3cd01545767e4039bb1f8bfa3fbebbe1ec24c383e8cdbf6b99bec0272858"
      }
    ],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "DFD",
    "originalCandidateName": "DFD",
    "action": "new_own",
    "source": "2018h30a-fe-am-63",
    "expectedExpansion": "Data Flow Diagram",
    "facts": [
      {
        "statement": "処理とデータの流れを図として表す。",
        "truth": true
      },
      {
        "statement": "構造化分析で情報と機能のモデルを整理する役割がある。",
        "truth": true
      },
      {
        "statement": "DFDというだけでサービス単位のソフト構築を意味する。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "RFI",
    "originalCandidateName": "RFI",
    "action": "new_own",
    "source": "2018h30a-fe-am-66",
    "expectedExpansion": "Request for Information",
    "facts": [
      {
        "statement": "調達の検討のために技術や製品などの情報提供を求める。",
        "truth": true
      },
      {
        "statement": "原66ではaの情報提供依頼に対応する。",
        "truth": true
      },
      {
        "statement": "原66の提案書提出を求めるbがRFIに対応する。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "RFP",
    "originalCandidateName": "RFP",
    "action": "new_own",
    "source": "2018h30a-fe-am-66",
    "expectedExpansion": "Request for Proposal",
    "facts": [
      {
        "statement": "調達対象や条件を示して実現方法などの提案を求める。",
        "truth": true
      },
      {
        "statement": "原66ではbの提案書提出依頼に対応する。",
        "truth": true
      },
      {
        "statement": "RFPの発行自体が契約締結である。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "PLC（製品ライフサイクル）",
    "originalCandidateName": "PLC（製品ライフサイクル）",
    "action": "append_reuse_mapping",
    "source": "2018h30a-fe-am-67",
    "expectedExpansion": "Product Life Cycle",
    "facts": [
      {
        "statement": "市場導入から成長・成熟・衰退という製品の段階を捉える。",
        "truth": true
      },
      {
        "statement": "ここではPower Line Communicationとは別の意味である。",
        "truth": true
      },
      {
        "statement": "このモデルは全製品が必ず同じ期間で遷移する法則である。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [
      {
        "module": "src/core/generators/legacy-2018-study-terms.ts",
        "index": 277,
        "record": {
          "term": "PLC（製品ライフサイクル）",
          "expansion": "Product Life Cycle",
          "meaning": "製品ライフサイクル。製品の市場導入から成長・成熟・衰退へ至る段階を捉える考え方。各段階の売上や競争などに着目する。同じPLCという略字を用いる電力線通信とは別の概念。",
          "aliases": [
            "PLC",
            "製品ライフサイクル",
            "プロダクトライフサイクル"
          ],
          "sources": [
            "2018h30h-fe-am-68"
          ]
        },
        "byteSHA256": "33ef747d2689fc4603cb9e15314520d2ac82a9c584276988d5f3fb5af95dce22"
      }
    ],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "技術のSカーブ",
    "originalCandidateName": "技術のSカーブ",
    "action": "new_own",
    "source": "2018h30a-fe-am-70",
    "expectedExpansion": null,
    "facts": [
      {
        "statement": "技術性能の改善と限界へ近づく進歩のモデルである。",
        "truth": true
      },
      {
        "statement": "初期の緩やかな進歩から加速しその後鈍る形を扱う。",
        "truth": true
      },
      {
        "statement": "価格と需要量の関係を示す曲線である。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "需要曲線",
    "originalCandidateName": "需要曲線",
    "action": "append_reuse_mapping",
    "source": "2018h30a-fe-am-70",
    "expectedExpansion": null,
    "facts": [
      {
        "statement": "他の条件を一定とした価格と需要量の関係を扱う。",
        "truth": true
      },
      {
        "statement": "時間に伴う故障率の推移とは軸が異なる。",
        "truth": true
      },
      {
        "statement": "機器の初期故障・偶発故障・摩耗故障を表す曲線である。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [
      {
        "module": "src/core/generators/legacy-2018-study-terms.ts",
        "index": 119,
        "record": {
          "term": "需要曲線",
          "meaning": "他の条件を一定としたときの、商品の価格と需要量の関係を表す曲線。時間に伴う故障率の変化や、検査でロットを受け入れる確率を表すものとは異なる量を扱う。",
          "sources": [
            "2018h30h-fe-am-76"
          ]
        },
        "byteSHA256": "67070abf41a0f799e0d0d4cc7720a6dbc48530ee4962610144e3378d142cf93b"
      }
    ],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "バスタブ曲線",
    "originalCandidateName": "バスタブ曲線",
    "action": "append_reuse_mapping",
    "source": "2018h30a-fe-am-70",
    "expectedExpansion": null,
    "facts": [
      {
        "statement": "機器の使用時間と故障率の代表的な推移を扱う。",
        "truth": true
      },
      {
        "statement": "初期故障・偶発故障・摩耗故障を区別する。",
        "truth": true
      },
      {
        "statement": "縦軸は必ず累積故障確率である。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [
      {
        "module": "src/core/generators/legacy-2018-study-terms.ts",
        "index": 116,
        "record": {
          "term": "バスタブ曲線",
          "meaning": "機器などの使用時間に伴う故障率の推移を、初期故障、偶発故障、摩耗故障の期間へ分けて表す曲線。累積の故障確率そのものや、ロットの検査合格確率とは区別する。",
          "sources": [
            "2018h30h-fe-am-76"
          ]
        },
        "byteSHA256": "e0bf0219cd4d9cb817c1525493719d9135d5e145f705bf7c05a488708fc59c02"
      }
    ],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "ラーニングカーブ",
    "originalCandidateName": "ラーニングカーブ",
    "action": "new_own",
    "source": "2018h30a-fe-am-70",
    "expectedExpansion": null,
    "facts": [
      {
        "statement": "経験や累積生産と作業時間又は単位費用などの関係を扱う。",
        "truth": true
      },
      {
        "statement": "習熟による効率向上を表すモデルとして用いる。",
        "truth": true
      },
      {
        "statement": "Learning Curveは複数語の頭文字を並べた略語である。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "IoT",
    "originalCandidateName": "IoT",
    "action": "append_reuse_mapping",
    "source": "2018h30a-fe-am-71",
    "expectedExpansion": "Internet of Things",
    "facts": [
      {
        "statement": "物に通信機能等を組み合わせネットワークで情報を扱う考え方である。",
        "truth": true
      },
      {
        "statement": "直接又は間接にネットワークへつながる原の広い概念を扱う。",
        "truth": true
      },
      {
        "statement": "2018原のIoT概念は現行の特定認証制度の対象機器に限られる。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [
      {
        "module": "src/core/generators/legacy-2018-study-terms.ts",
        "index": 110,
        "record": {
          "term": "IoT",
          "expansion": "Internet of Things",
          "meaning": "物に通信機能やセンサなどを組み合わせてネットワークにつなぎ、状態の収集や監視、制御などへ利用する考え方。単独のコンピュータでファイル処理をするだけの機能とは区別する。",
          "sources": [
            "2018h30h-fe-am-71"
          ]
        },
        "byteSHA256": "f8924609d53c841d9263301923774637d4ab8826126f8ec236c7832ad88fbdeb"
      },
      {
        "module": "src/core/sample-2022-a-study-terms.ts",
        "index": 1,
        "record": {
          "term": "IoT",
          "expansion": "Internet of Things",
          "meaning": "モノのインターネット。センサや機器をネットワークへつなぎ、計測データの収集や機器の制御などに用いる。",
          "sources": [
            "sample-2022-dec-a-1",
            "sample-2022-dec-a-2",
            "sample-2022-dec-a-3",
            "sample-2022-dec-a-4",
            "sample-2022-dec-a-5",
            "sample-2022-dec-a-6",
            "sample-2022-dec-a-7",
            "sample-2022-dec-a-8",
            "sample-2022-dec-a-9",
            "sample-2022-dec-a-10",
            "sample-2022-dec-a-11",
            "sample-2022-dec-a-12",
            "sample-2022-dec-a-13",
            "sample-2022-dec-a-14",
            "sample-2022-dec-a-15",
            "sample-2022-dec-a-16",
            "sample-2022-dec-a-17",
            "sample-2022-dec-a-18",
            "sample-2022-dec-a-19",
            "sample-2022-dec-a-20",
            "sample-2022-dec-a-21",
            "sample-2022-dec-a-22",
            "sample-2022-dec-a-23",
            "sample-2022-dec-a-24",
            "sample-2022-dec-a-25",
            "sample-2022-dec-a-26",
            "sample-2022-dec-a-27",
            "sample-2022-dec-a-28",
            "sample-2022-dec-a-29",
            "sample-2022-dec-a-30",
            "sample-2022-dec-a-31",
            "sample-2022-dec-a-32",
            "sample-2022-dec-a-33",
            "sample-2022-dec-a-34",
            "sample-2022-dec-a-35",
            "sample-2022-dec-a-36",
            "sample-2022-dec-a-37",
            "sample-2022-dec-a-38",
            "sample-2022-dec-a-39",
            "sample-2022-dec-a-40",
            "sample-2022-dec-a-41",
            "sample-2022-dec-a-42",
            "sample-2022-dec-a-43",
            "sample-2022-dec-a-44",
            "sample-2022-dec-a-45",
            "sample-2022-dec-a-46",
            "sample-2022-dec-a-47",
            "sample-2022-dec-a-48",
            "sample-2022-dec-a-49",
            "sample-2022-dec-a-50",
            "sample-2022-dec-a-51",
            "sample-2022-dec-a-52",
            "sample-2022-dec-a-53",
            "sample-2022-dec-a-54",
            "sample-2022-dec-a-55",
            "sample-2022-dec-a-56",
            "sample-2022-dec-a-57",
            "sample-2022-dec-a-58",
            "sample-2022-dec-a-59",
            "sample-2022-dec-a-60"
          ]
        },
        "byteSHA256": "085a902a71c054f9597df53983fcaf57e3d175ffb2a091386dfc17fee9549050"
      }
    ],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "IC",
    "originalCandidateName": "IC",
    "action": "new_own",
    "source": "2018h30a-fe-am-72",
    "expectedExpansion": "Integrated Circuit",
    "facts": [
      {
        "statement": "集積回路を指す部品名である。",
        "truth": true
      },
      {
        "statement": "ICタグのICと無線識別方式RFIDは指す範囲が異なる。",
        "truth": true
      },
      {
        "statement": "ICはRFIDのような無線識別方式の正式名称である。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "RFID",
    "originalCandidateName": "RFID",
    "action": "new_own",
    "source": "2018h30a-fe-am-72",
    "expectedExpansion": "Radio Frequency Identification",
    "facts": [
      {
        "statement": "電波によってタグの情報を非接触で識別する。",
        "truth": true
      },
      {
        "statement": "電波が通る梱包の外から読み取れる特徴を原の範囲で扱う。",
        "truth": true
      },
      {
        "statement": "金属や液体や遮蔽の条件にかかわらず必ず読み取れる。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "GPS（衛星測位）",
    "originalCandidateName": "GPS",
    "action": "new_own",
    "source": "2018h30a-fe-am-72",
    "expectedExpansion": "Global Positioning System",
    "facts": [
      {
        "statement": "衛星からの信号を用いて位置などを求める。",
        "truth": true
      },
      {
        "statement": "RFIDによるタグ識別とは機能が異なる。",
        "truth": true
      },
      {
        "statement": "RFIDタグは必ずGPSで位置を計算しなければならない。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [
      {
        "module": "src/core/generators/legacy-2018-study-terms.ts",
        "index": 232,
        "record": {
          "term": "GPS",
          "expansion": "Global Positioning System",
          "meaning": "衛星からの信号を用いて位置などを求める測位システム。この問ではSDIOによる周辺入出力機能の例に現れ、記憶容量の分類とは区別する。",
          "sources": [
            "2018h30h-fe-am-12"
          ]
        },
        "byteSHA256": "d2f642441fe8404db0b62c40708220a22eac2cf8b034279989fd47b8a3ceddea"
      }
    ],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "O2O",
    "originalCandidateName": "O2O",
    "action": "new_own",
    "source": "2018h30a-fe-am-73",
    "expectedExpansion": "Online to Offline / Offline to Online（2018原の双方向の用法）",
    "facts": [
      {
        "statement": "2018原ではオンラインと実店舗を結び購入へ誘導する。",
        "truth": true
      },
      {
        "statement": "原の説明は仮想店舗から実店舗及びその逆方向を含む。",
        "truth": true
      },
      {
        "statement": "原のO to Oは受注後に製品を生産する方式である。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "BTO",
    "originalCandidateName": "BTO",
    "action": "new_own",
    "source": "2018h30a-fe-am-73",
    "expectedExpansion": "Build to Order",
    "facts": [
      {
        "statement": "注文後に顧客仕様に応じて製品の生産や組立を始める。",
        "truth": true
      },
      {
        "statement": "オンラインと実店舗への誘導とは異なる役割である。",
        "truth": true
      },
      {
        "statement": "基本無料で高度機能を有料とするモデルをBTOという。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "フリーミアム",
    "originalCandidateName": "フリーミアム",
    "action": "new_own",
    "source": "2018h30a-fe-am-73",
    "expectedExpansion": null,
    "facts": [
      {
        "statement": "基本機能を無料とし高度な機能などを有料にするモデルである。",
        "truth": true
      },
      {
        "statement": "freeとpremiumを組み合わせた語である。",
        "truth": true
      },
      {
        "statement": "複数の英単語の頭文字からなる正式略語である。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "エスクロー",
    "originalCandidateName": "エスクロー",
    "action": "new_own",
    "source": "2018h30a-fe-am-73",
    "expectedExpansion": null,
    "facts": [
      {
        "statement": "第三者が代金等を預かり条件に応じて受け渡す仕組みである。",
        "truth": true
      },
      {
        "statement": "未着や未払いの取引リスクへの対策に用いる。",
        "truth": true
      },
      {
        "statement": "オンラインと実店舗へ顧客を誘導すること自体を指す。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "個人識別符号",
    "originalCandidateName": "個人識別符号",
    "action": "new_own",
    "source": "2018h30a-fe-am-79",
    "expectedExpansion": null,
    "facts": [
      {
        "statement": "原の指定版では認証用に身体の特徴を変換した符号等を含む。",
        "truth": true
      },
      {
        "statement": "認証に用いる指紋特徴のバックアップも同じ識別性を持つ。",
        "truth": true
      },
      {
        "statement": "身体に関係する全ての数値が無条件で個人識別符号になる。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "匿名加工情報",
    "originalCandidateName": "匿名加工情報",
    "action": "new_own",
    "source": "2018h30a-fe-am-79",
    "expectedExpansion": null,
    "facts": [
      {
        "statement": "原では法に従い本人を識別できず復元できない加工がされた前提である。",
        "truth": true
      },
      {
        "statement": "氏名の削除や仮名への置換だけとは区別する。",
        "truth": true
      },
      {
        "statement": "氏名を消しただけなら必ず法の匿名加工情報である。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  },
  {
    "term": "労働者派遣/請負",
    "originalCandidateName": "労働者派遣/請負",
    "action": "new_own",
    "source": "2018h30a-fe-am-80",
    "expectedExpansion": null,
    "facts": [
      {
        "statement": "契約名だけでなく指揮命令や独立した業務・労務管理の実態を区別する。",
        "truth": true
      },
      {
        "statement": "原80では発注者が休暇承認を指示する点が独立管理と相反する。",
        "truth": true
      },
      {
        "statement": "請負という契約名であれば発注者が休暇を直接指示しても常に請負となる。",
        "truth": false
      }
    ],
    "matchedCanonicalObjects": [],
    "basis": "original-sourcefacts/primary meaning review retained by original313 and peer93; manually authored independent term facts here. Production new term code does not exist.",
    "scopeNegative": "all other source keys are excluded; same alias never widens autumn target scope",
    "sameAbbreviationRule": "PLC=Product Life Cycle distinct from power-line communication/control; GPS new meaning identity distinct from spring12 SDIO-specific term; no invented expansion for ordinary words; O2O dual-direction note is historical usage not a new universal formal expansion"
  }
] as const;
export const pendingAmTermExpectedMeaning={
  "BPO": "業務プロセスの遂行を外部の専門業者に委託すること。業務を支えるシステムの運用などを一体で委託する場合を含み、ソフトウェア機能の利用、計算資源の借用、派遣による人員補充だけとは区別する。",
  "DFD": "データフローダイアグラム。データの流れと、それを処理する機能などを表す図。構造化分析で情報と機能を捉えることと、サービスを組み合わせてソフトウェアを構成するSOAとは目的が異なる。",
  "RFI": "情報提供依頼書。システム化の目的や業務内容などを示して、ベンダが提供できる技術・製品などの情報を求める。実現方法や費用を記した提案書を求めるRFPとは段階を区別する。",
  "RFP": "提案依頼書。調達するシステムや条件を示して、供給候補者へ実現方法などの提案を求める。情報提供を求めるRFI、供給者の選定、役割と責任を合意する契約締結とは段階が異なる。",
  "技術のSカーブ": "技術性能の進歩を、初期の緩やかな改善、成長による加速、限界に近づく停滞などの過程として捉えるモデル。技術性能を扱い、価格と需要量や経験と作業時間を直接表す曲線とは区別する。",
  "ラーニングカーブ": "経験や累積生産の増加に伴って、1個当たりの作業時間や単位費用が低下する関係を表す学習曲線。learningは英語の語であり、頭字語ではない。",
  "IC": "集積回路。多数の素子や回路を基板上などに集積した電子部品を指す名称。電波を用いてタグを識別する方式を表すRFIDとは、部品の名称と仕組みの名称という範囲が異なる。",
  "RFID": "電波を用いてICタグなどに記憶された情報を非接触に読み取る識別方式。タグの種類によって書込みなども行う。梱包越しや複数タグの読取りは利用条件に依存し、金属や液体の影響を無条件に受けないという意味ではない。",
  "GPS（衛星測位）": "衛星からの信号によって位置などを求める測位システム。RFIDが電波でタグの情報を識別する仕組みとは機能が異なり、RFIDタグ自体がGPSで現在位置を算出することを必須とはしない。",
  "O2O": "ネット上と実店舗との間で顧客を誘導して購買につなげる仕組み。2018年の原問題では、ネットから店舗への誘導と、店舗からネットへの誘導の両方向を含む用法である。",
  "BTO": "注文を受けた後に、顧客の指定する仕様に合わせて製品の生産や組立てを行う方式。オンラインと実店舗との顧客誘導を指すO2Oとは、受注と生産の関係を扱う点が異なる。",
  "フリーミアム": "基本的なサービスや機能を無料で提供し、高度な機能や追加の利用に料金を課すビジネスモデル。freeとpremiumを組み合わせた語であり、頭字語ではない。",
  "エスクロー": "売買当事者の間に第三者が入り、代金などを一時的に預かり、商品の受領確認などの条件に応じて受け渡す仕組み。ネットと実店舗との顧客誘導だけを指すものではない。",
  "個人識別符号": "指定された2016年制定・2017年3月一部改正の通則編では、本人認証に用いる身体的特徴を変換した符号などを扱う。生体に関する全ての数値を無条件に同じ区分へ入れる説明ではない。",
  "匿名加工情報": "指定された2016年制定・2017年3月一部改正の通則編で、特定の個人を識別できず、元の個人情報を復元できないように法定の加工を行った情報。氏名だけを削除することや仮名への置換と同一視しない。",
  "労働者派遣/請負": "契約の名称だけでなく、誰が労働者に指揮命令を行い、労働時間・配置などを自ら管理するかという実態を区別する。問題に示した行為を比較する補足であり、現実の契約全体を一つの条件だけで判定する説明ではない。"
} as const;

/** Candidate resource contract awaiting parent legal/provenance review.
 * Freezes the explicitly inspected nodes, not a machine proof of permission. */
export const pendingAmProvenanceContract={
  "status": "candidate_provenance_review_pending",
  "sources": [
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-faq-stage1-2026-10-24",
      "title": "試験の過去問題の使用方法・留意点",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/faq.html",
      "checkedOn": "2026-10-24",
      "type": "policy",
      "availability": "officially_published",
      "dateNote": "2026年10月24日の実GETで現在の条件を確認。公式問題の公開日とは別。",
      "scope": "本13問のIPA作問部分の教育目的の同梱・ブラウザ表示・改変。別主体部分を包括的に許諾する記録ではない。",
      "sections": [
        "その他／試験の過去問題の使用方法・留意点"
      ],
      "facts": [
        "教育目的など試験制度の意義に反しない使用、出典と部分改変の明示を要する。著作権放棄ではない。"
      ],
      "supports": [
        "rights"
      ],
      "limits": "法令の特別の定め及び第三者権利を別に確認する。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ppc-pdl-stage1-2026-10-24",
      "title": "個人情報保護委員会 利用規約",
      "publisher": "個人情報保護委員会",
      "url": "https://www.ppc.go.jp/notice/kiyaku/",
      "sha256": "8a19c08e762a7f2a38727679838044862866b89776bae20ae67307223bd9e11e",
      "checkedOn": "2026-10-24",
      "type": "policy",
      "availability": "officially_published",
      "dateNote": "現在の規約を確認した日。2018年当時の許諾を遡及証明する記録ではない。",
      "scope": "本問が参照するPPC作成部分の現在の再利用条件。第三者部分及び東京都サイト全体へ広げない。",
      "sections": [
        "コンテンツの利用について／PDL1.0に関する重要事項"
      ],
      "facts": [
        "PPCの公開コンテンツの利用はPDL1.0に準拠し、出典と加工の明示、適用対象外の第三者権利等を区別する。"
      ],
      "supports": [
        "rights"
      ],
      "limits": "引用先全102頁を同梱しない。PPCからの個別許諾取得を意味しない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ppc-guideline-2017-specified-copy",
      "title": "個人情報保護法ガイドライン 通則編 平成28年11月／平成29年3月一部改正 指定版",
      "publisher": "個人情報保護委員会（東京都公式ポータルの頒布コピー）",
      "url": "https://www.shougaifukushi.metro.tokyo.lg.jp/Lib/Download.php?sqid=2877",
      "sha256": "4e0f1010be85f46458f16dd70720ca4db43a6fe70f975250a56049e2f669fc7d",
      "checkedOn": "2026-10-24",
      "type": "policy",
      "availability": "officially_published",
      "dateNote": "版年月と現在の配信確認日を区別。PPC直接配信のbytes又は公開日の確認ではない。",
      "scope": "問79の指定版の定義意味の検証。関係7頁はPPC掲載案との空白正規化text一致を別証拠で確認。",
      "sections": [
        "物理9〜14頁・25頁（限定比較）"
      ],
      "facts": [
        "表紙は平成28年11月、平成29年3月一部改正。本人識別の情報、生体認証用の特徴、匿名加工情報の意味を指定版で検証した。"
      ],
      "supports": [
        "answer-validation"
      ],
      "limits": "全102頁の内容や配置の同一性、東京都サイト全体の再利用許諾とは扱わない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-62-pending-qs",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問62 問題部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf",
      "sha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
      "checkedOn": "2026-10-24",
      "type": "official_problem",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "QS物理p29"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-62-pending-ans",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問62 解答例部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_ans.pdf",
      "sha256": "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d",
      "checkedOn": "2026-10-24",
      "type": "official_answer",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "ANS物理p1"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-63-pending-qs",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問63 問題部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf",
      "sha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
      "checkedOn": "2026-10-24",
      "type": "official_problem",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "QS物理p30"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-63-pending-ans",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問63 解答例部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_ans.pdf",
      "sha256": "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d",
      "checkedOn": "2026-10-24",
      "type": "official_answer",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "ANS物理p1"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-64-pending-qs",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問64 問題部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf",
      "sha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
      "checkedOn": "2026-10-24",
      "type": "official_problem",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "QS物理p30"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-64-pending-ans",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問64 解答例部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_ans.pdf",
      "sha256": "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d",
      "checkedOn": "2026-10-24",
      "type": "official_answer",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "ANS物理p1"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-66-pending-qs",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問66 問題部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf",
      "sha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
      "checkedOn": "2026-10-24",
      "type": "official_problem",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "QS物理p31"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-66-pending-ans",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問66 解答例部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_ans.pdf",
      "sha256": "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d",
      "checkedOn": "2026-10-24",
      "type": "official_answer",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "ANS物理p1"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-67-pending-qs",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問67 問題部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf",
      "sha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
      "checkedOn": "2026-10-24",
      "type": "official_problem",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "QS物理p32"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-67-pending-ans",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問67 解答例部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_ans.pdf",
      "sha256": "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d",
      "checkedOn": "2026-10-24",
      "type": "official_answer",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "ANS物理p1"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-69-pending-qs",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問69 問題部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf",
      "sha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
      "checkedOn": "2026-10-24",
      "type": "official_problem",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "QS物理p33"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-69-pending-ans",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問69 解答例部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_ans.pdf",
      "sha256": "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d",
      "checkedOn": "2026-10-24",
      "type": "official_answer",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "ANS物理p1"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-70-pending-qs",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問70 問題部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf",
      "sha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
      "checkedOn": "2026-10-24",
      "type": "official_problem",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "QS物理p33"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-70-pending-ans",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問70 解答例部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_ans.pdf",
      "sha256": "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d",
      "checkedOn": "2026-10-24",
      "type": "official_answer",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "ANS物理p1"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-71-pending-qs",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問71 問題部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf",
      "sha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
      "checkedOn": "2026-10-24",
      "type": "official_problem",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "QS物理p34"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-71-pending-ans",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問71 解答例部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_ans.pdf",
      "sha256": "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d",
      "checkedOn": "2026-10-24",
      "type": "official_answer",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "ANS物理p1"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-72-pending-qs",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問72 問題部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf",
      "sha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
      "checkedOn": "2026-10-24",
      "type": "official_problem",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "QS物理p34"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-72-pending-ans",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問72 解答例部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_ans.pdf",
      "sha256": "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d",
      "checkedOn": "2026-10-24",
      "type": "official_answer",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "ANS物理p1"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-73-pending-qs",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問73 問題部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf",
      "sha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
      "checkedOn": "2026-10-24",
      "type": "official_problem",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "QS物理p34"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-73-pending-ans",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問73 解答例部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_ans.pdf",
      "sha256": "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d",
      "checkedOn": "2026-10-24",
      "type": "official_answer",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "ANS物理p1"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-78-pending-qs",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問78 問題部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf",
      "sha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
      "checkedOn": "2026-10-24",
      "type": "official_problem",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "QS物理p37"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-78-pending-ans",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問78 解答例部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_ans.pdf",
      "sha256": "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d",
      "checkedOn": "2026-10-24",
      "type": "official_answer",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "ANS物理p1"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-79-pending-qs",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問79 問題部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf",
      "sha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
      "checkedOn": "2026-10-24",
      "type": "official_problem",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "QS物理p37"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-79-pending-ans",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問79 解答例部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_ans.pdf",
      "sha256": "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d",
      "checkedOn": "2026-10-24",
      "type": "official_answer",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "ANS物理p1"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-80-pending-qs",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問80 問題部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_qs.pdf",
      "sha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
      "checkedOn": "2026-10-24",
      "type": "official_problem",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "QS物理p37"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "source-ipa-2018h30a-fe-am-80-pending-ans",
      "title": "平成30年度 秋期 基本情報技術者試験 旧午前 問80 解答例部分",
      "publisher": "独立行政法人情報処理推進機構（IPA）",
      "url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_fe_am_ans.pdf",
      "sha256": "b47e7a18180365a68355c7b4757ff91786d26c80ec39d233bc9616389e25655d",
      "checkedOn": "2026-10-24",
      "type": "official_answer",
      "availability": "officially_published",
      "dateNote": "公式PDFを2026年10月24日に再取得しhash一致。個別添付PDFの公開/更新日を確認していないためpublishedOn/updatedOnを省略。",
      "scope": "本問の全本文・図表・注記・全4択と公式正答。残80問や他冊子の素材判断を代替しない。",
      "sections": [
        "ANS物理p1"
      ],
      "facts": [
        "通常期・旧制度の午前問題。原条件・公式正答と独立査読を問題別に照合。"
      ],
      "supports": [
        "source-format",
        "answer-validation"
      ],
      "limits": "source-local準備。共有profile・normalApp・catalog・保存/配布の成功ではない。"
    }
  ],
  "rights": [
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ppc-pdl-source79",
      "holders": [
        "個人情報保護委員会"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ppc-pdl-stage1-2026-10-24",
          "locator": {
            "section": "コンテンツの利用について／PDL1.0"
          }
        },
        {
          "sourceId": "source-ppc-guideline-2017-specified-copy",
          "locator": {
            "page": 9,
            "section": "指定版の関係定義"
          }
        }
      ],
      "scope": "問79で参照するPPC作成部分だけの限定評価。指定版の意味と現在のPPC公開コンテンツのPDL条件を分離し、外部PDF全体は配布しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-PPC-PDL-1.0",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：個人情報保護委員会「個人情報の保護に関する法律についてのガイドライン（通則編）」平成28年11月（平成29年3月一部改正）。改変した設問・解説は本プロジェクト作成。",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "none_identified",
        "rightsRefs": [],
        "notes": "当該PPC作成の関係部分に限定。他主体部分・東京都サイトのコンテンツ全体を包括しない。"
      },
      "assessmentNotes": "PPC現在規約と指定版の限定7頁比較を基にした本project用途別判断。MIT/CC0へ変換しない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ipa-2018h30a-fe-am-62-pending-cohort",
      "holders": [
        "独立行政法人情報処理推進機構（IPA）"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ipa-faq-stage1-2026-10-24",
          "locator": {
            "section": "試験の過去問題の使用方法・留意点"
          }
        }
      ],
      "scope": "問62の当該原画像・原文・全択・公式正答と、それに基づく同形式改変のIPA原部分。独自解説・用語・実装を分け、他問の素材保留を解除しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-IPA-Public-Questions",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：平成30年度 秋期 基本情報技術者試験 午前 問62／©2018 独立行政法人情報処理推進機構（IPA）",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "none_identified",
        "rightsRefs": [],
        "notes": "原本文・全択・図表・注記を個別画像で確認した範囲で別主体の転載表示等を認めない。一般概念への言及だけで第三者原文の転載としない。"
      },
      "assessmentNotes": "IPA FAQの教育目的・出典・部分改変の明示に沿う用途限定のproject判断。第三者資料そのものの包括許諾又は外部法的評価ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ipa-2018h30a-fe-am-63-pending-cohort",
      "holders": [
        "独立行政法人情報処理推進機構（IPA）"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ipa-faq-stage1-2026-10-24",
          "locator": {
            "section": "試験の過去問題の使用方法・留意点"
          }
        }
      ],
      "scope": "問63の当該原画像・原文・全択・公式正答と、それに基づく同形式改変のIPA原部分。独自解説・用語・実装を分け、他問の素材保留を解除しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-IPA-Public-Questions",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：平成30年度 秋期 基本情報技術者試験 午前 問63／©2018 独立行政法人情報処理推進機構（IPA）",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "none_identified",
        "rightsRefs": [],
        "notes": "原本文・全択・図表・注記を個別画像で確認した範囲で別主体の転載表示等を認めない。一般概念への言及だけで第三者原文の転載としない。"
      },
      "assessmentNotes": "IPA FAQの教育目的・出典・部分改変の明示に沿う用途限定のproject判断。第三者資料そのものの包括許諾又は外部法的評価ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ipa-2018h30a-fe-am-64-pending-cohort",
      "holders": [
        "独立行政法人情報処理推進機構（IPA）"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ipa-faq-stage1-2026-10-24",
          "locator": {
            "section": "試験の過去問題の使用方法・留意点"
          }
        }
      ],
      "scope": "問64の当該原画像・原文・全択・公式正答と、それに基づく同形式改変のIPA原部分。独自解説・用語・実装を分け、他問の素材保留を解除しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-IPA-Public-Questions",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：平成30年度 秋期 基本情報技術者試験 午前 問64／©2018 独立行政法人情報処理推進機構（IPA）",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "none_identified",
        "rightsRefs": [],
        "notes": "原本文・全択・図表・注記を個別画像で確認した範囲で別主体の転載表示等を認めない。一般概念への言及だけで第三者原文の転載としない。"
      },
      "assessmentNotes": "IPA FAQの教育目的・出典・部分改変の明示に沿う用途限定のproject判断。第三者資料そのものの包括許諾又は外部法的評価ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ipa-2018h30a-fe-am-66-pending-cohort",
      "holders": [
        "独立行政法人情報処理推進機構（IPA）"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ipa-faq-stage1-2026-10-24",
          "locator": {
            "section": "試験の過去問題の使用方法・留意点"
          }
        }
      ],
      "scope": "問66の当該原画像・原文・全択・公式正答と、それに基づく同形式改変のIPA原部分。独自解説・用語・実装を分け、他問の素材保留を解除しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-IPA-Public-Questions",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：平成30年度 秋期 基本情報技術者試験 午前 問66／©2018 独立行政法人情報処理推進機構（IPA）",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "none_identified",
        "rightsRefs": [],
        "notes": "原本文・全択・図表・注記を個別画像で確認した範囲で別主体の転載表示等を認めない。一般概念への言及だけで第三者原文の転載としない。"
      },
      "assessmentNotes": "IPA FAQの教育目的・出典・部分改変の明示に沿う用途限定のproject判断。第三者資料そのものの包括許諾又は外部法的評価ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ipa-2018h30a-fe-am-67-pending-cohort",
      "holders": [
        "独立行政法人情報処理推進機構（IPA）"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ipa-faq-stage1-2026-10-24",
          "locator": {
            "section": "試験の過去問題の使用方法・留意点"
          }
        }
      ],
      "scope": "問67の当該原画像・原文・全択・公式正答と、それに基づく同形式改変のIPA原部分。独自解説・用語・実装を分け、他問の素材保留を解除しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-IPA-Public-Questions",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：平成30年度 秋期 基本情報技術者試験 午前 問67／©2018 独立行政法人情報処理推進機構（IPA）",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "none_identified",
        "rightsRefs": [],
        "notes": "原本文・全択・図表・注記を個別画像で確認した範囲で別主体の転載表示等を認めない。一般概念への言及だけで第三者原文の転載としない。"
      },
      "assessmentNotes": "IPA FAQの教育目的・出典・部分改変の明示に沿う用途限定のproject判断。第三者資料そのものの包括許諾又は外部法的評価ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ipa-2018h30a-fe-am-69-pending-cohort",
      "holders": [
        "独立行政法人情報処理推進機構（IPA）"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ipa-faq-stage1-2026-10-24",
          "locator": {
            "section": "試験の過去問題の使用方法・留意点"
          }
        }
      ],
      "scope": "問69の当該原画像・原文・全択・公式正答と、それに基づく同形式改変のIPA原部分。独自解説・用語・実装を分け、他問の素材保留を解除しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-IPA-Public-Questions",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：平成30年度 秋期 基本情報技術者試験 午前 問69／©2018 独立行政法人情報処理推進機構（IPA）",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "none_identified",
        "rightsRefs": [],
        "notes": "原本文・全択・図表・注記を個別画像で確認した範囲で別主体の転載表示等を認めない。一般概念への言及だけで第三者原文の転載としない。"
      },
      "assessmentNotes": "IPA FAQの教育目的・出典・部分改変の明示に沿う用途限定のproject判断。第三者資料そのものの包括許諾又は外部法的評価ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ipa-2018h30a-fe-am-70-pending-cohort",
      "holders": [
        "独立行政法人情報処理推進機構（IPA）"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ipa-faq-stage1-2026-10-24",
          "locator": {
            "section": "試験の過去問題の使用方法・留意点"
          }
        }
      ],
      "scope": "問70の当該原画像・原文・全択・公式正答と、それに基づく同形式改変のIPA原部分。独自解説・用語・実装を分け、他問の素材保留を解除しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-IPA-Public-Questions",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：平成30年度 秋期 基本情報技術者試験 午前 問70／©2018 独立行政法人情報処理推進機構（IPA）",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "none_identified",
        "rightsRefs": [],
        "notes": "原本文・全択・図表・注記を個別画像で確認した範囲で別主体の転載表示等を認めない。一般概念への言及だけで第三者原文の転載としない。"
      },
      "assessmentNotes": "IPA FAQの教育目的・出典・部分改変の明示に沿う用途限定のproject判断。第三者資料そのものの包括許諾又は外部法的評価ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ipa-2018h30a-fe-am-71-pending-cohort",
      "holders": [
        "独立行政法人情報処理推進機構（IPA）"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ipa-faq-stage1-2026-10-24",
          "locator": {
            "section": "試験の過去問題の使用方法・留意点"
          }
        }
      ],
      "scope": "問71の当該原画像・原文・全択・公式正答と、それに基づく同形式改変のIPA原部分。独自解説・用語・実装を分け、他問の素材保留を解除しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-IPA-Public-Questions",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：平成30年度 秋期 基本情報技術者試験 午前 問71／©2018 独立行政法人情報処理推進機構（IPA）",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "none_identified",
        "rightsRefs": [],
        "notes": "原本文・全択・図表・注記を個別画像で確認した範囲で別主体の転載表示等を認めない。一般概念への言及だけで第三者原文の転載としない。"
      },
      "assessmentNotes": "IPA FAQの教育目的・出典・部分改変の明示に沿う用途限定のproject判断。第三者資料そのものの包括許諾又は外部法的評価ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ipa-2018h30a-fe-am-72-pending-cohort",
      "holders": [
        "独立行政法人情報処理推進機構（IPA）"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ipa-faq-stage1-2026-10-24",
          "locator": {
            "section": "試験の過去問題の使用方法・留意点"
          }
        }
      ],
      "scope": "問72の当該原画像・原文・全択・公式正答と、それに基づく同形式改変のIPA原部分。独自解説・用語・実装を分け、他問の素材保留を解除しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-IPA-Public-Questions",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：平成30年度 秋期 基本情報技術者試験 午前 問72／©2018 独立行政法人情報処理推進機構（IPA）",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "none_identified",
        "rightsRefs": [],
        "notes": "原本文・全択・図表・注記を個別画像で確認した範囲で別主体の転載表示等を認めない。一般概念への言及だけで第三者原文の転載としない。"
      },
      "assessmentNotes": "IPA FAQの教育目的・出典・部分改変の明示に沿う用途限定のproject判断。第三者資料そのものの包括許諾又は外部法的評価ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ipa-2018h30a-fe-am-73-pending-cohort",
      "holders": [
        "独立行政法人情報処理推進機構（IPA）"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ipa-faq-stage1-2026-10-24",
          "locator": {
            "section": "試験の過去問題の使用方法・留意点"
          }
        }
      ],
      "scope": "問73の当該原画像・原文・全択・公式正答と、それに基づく同形式改変のIPA原部分。独自解説・用語・実装を分け、他問の素材保留を解除しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-IPA-Public-Questions",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：平成30年度 秋期 基本情報技術者試験 午前 問73／©2018 独立行政法人情報処理推進機構（IPA）",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "none_identified",
        "rightsRefs": [],
        "notes": "原本文・全択・図表・注記を個別画像で確認した範囲で別主体の転載表示等を認めない。一般概念への言及だけで第三者原文の転載としない。"
      },
      "assessmentNotes": "IPA FAQの教育目的・出典・部分改変の明示に沿う用途限定のproject判断。第三者資料そのものの包括許諾又は外部法的評価ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ipa-2018h30a-fe-am-78-pending-cohort",
      "holders": [
        "独立行政法人情報処理推進機構（IPA）"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ipa-faq-stage1-2026-10-24",
          "locator": {
            "section": "試験の過去問題の使用方法・留意点"
          }
        }
      ],
      "scope": "問78の当該原画像・原文・全択・公式正答と、それに基づく同形式改変のIPA原部分。独自解説・用語・実装を分け、他問の素材保留を解除しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-IPA-Public-Questions",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：平成30年度 秋期 基本情報技術者試験 午前 問78／©2018 独立行政法人情報処理推進機構（IPA）",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "none_identified",
        "rightsRefs": [],
        "notes": "原本文・全択・図表・注記を個別画像で確認した範囲で別主体の転載表示等を認めない。一般概念への言及だけで第三者原文の転載としない。"
      },
      "assessmentNotes": "IPA FAQの教育目的・出典・部分改変の明示に沿う用途限定のproject判断。第三者資料そのものの包括許諾又は外部法的評価ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ipa-2018h30a-fe-am-79-pending-cohort",
      "holders": [
        "独立行政法人情報処理推進機構（IPA）"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ipa-faq-stage1-2026-10-24",
          "locator": {
            "section": "試験の過去問題の使用方法・留意点"
          }
        }
      ],
      "scope": "問79の当該原画像・原文・全択・公式正答と、それに基づく同形式改変のIPA原部分。独自解説・用語・実装を分け、他問の素材保留を解除しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-IPA-Public-Questions",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：平成30年度 秋期 基本情報技術者試験 午前 問79／©2018 独立行政法人情報処理推進機構（IPA）",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "present_cleared",
        "rightsRefs": [
          "rights-ppc-pdl-source79"
        ],
        "notes": "PPC通則編の指定版の題名と関係意味を参照。現在PDL条件・出典加工表示と版証拠を別記。"
      },
      "assessmentNotes": "IPA FAQの教育目的・出典・部分改変の明示に沿う用途限定のproject判断。第三者資料そのものの包括許諾又は外部法的評価ではない。"
    },
    {
      "schemaVersion": "3.0.0",
      "id": "rights-ipa-2018h30a-fe-am-80-pending-cohort",
      "holders": [
        "独立行政法人情報処理推進機構（IPA）"
      ],
      "basis": "official_policy",
      "evidence": [
        {
          "sourceId": "source-ipa-faq-stage1-2026-10-24",
          "locator": {
            "section": "試験の過去問題の使用方法・留意点"
          }
        }
      ],
      "scope": "問80の当該原画像・原文・全択・公式正答と、それに基づく同形式改変のIPA原部分。独自解説・用語・実装を分け、他問の素材保留を解除しない。",
      "uses": {
        "repositoryRedistribution": "allowed",
        "browserDisplay": "allowed",
        "adaptation": "allowed"
      },
      "licenseId": "LicenseRef-IPA-Public-Questions",
      "checkedOn": "2026-10-24",
      "attributionText": "出典：平成30年度 秋期 基本情報技術者試験 午前 問80／©2018 独立行政法人情報処理推進機構（IPA）",
      "modificationNoticeRequired": true,
      "thirdParty": {
        "status": "none_identified",
        "rightsRefs": [],
        "notes": "原本文・全択・図表・注記を個別画像で確認した範囲で別主体の転載表示等を認めない。一般概念への言及だけで第三者原文の転載としない。"
      },
      "assessmentNotes": "IPA FAQの教育目的・出典・部分改変の明示に沿う用途限定のproject判断。第三者資料そのものの包括許諾又は外部法的評価ではない。"
    }
  ],
  "pins": [
    {
      "kind": "sources",
      "id": "source-ipa-faq-stage1-2026-10-24",
      "contentHash": "54ce4144fe1309baff5e2ebfa8e3d64a84af03f6dd7c6a00d3655ba001d71da0"
    },
    {
      "kind": "sources",
      "id": "source-ppc-pdl-stage1-2026-10-24",
      "contentHash": "f3076d2e97a806cf3436c5b1dc4487b27721de26a0581a3e5b6bd9ccb7076755"
    },
    {
      "kind": "sources",
      "id": "source-ppc-guideline-2017-specified-copy",
      "contentHash": "375c72ca3ffb54ebb89341f071f71fa4cdc442c2ea4ab3ee6aa00843197110a5"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-62-pending-qs",
      "contentHash": "ff51aa47bcbcd98254403c7c701e34dbb3f04de470ab185aaf9e83ad2ae62d24"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-62-pending-ans",
      "contentHash": "19d9b30088ab6a8412a451b9ec4bb9407ff1e594a379a7258925c5b16079cbb9"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-63-pending-qs",
      "contentHash": "0801ab007dd2b3b3a257437b96ff42f82a6c52b7dc76d93d9221c4d45ecd6b82"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-63-pending-ans",
      "contentHash": "4ef94e6b50eef97c77cfef17ef3d236dd8cec87ebcdc1d0166c382d6c1b45f6b"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-64-pending-qs",
      "contentHash": "1d68a25355b8048505f6681b564a6ea962405bc029c01f2711b4fb28a1a49af5"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-64-pending-ans",
      "contentHash": "eee92ad1c5953aa7287797b792ece04905741169bd82cab4b1a63a28cc223be6"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-66-pending-qs",
      "contentHash": "0bab53705609d629f1a3f4382f2154655f693963e20ca873bb6d50ee274f5c75"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-66-pending-ans",
      "contentHash": "3067ab160d2aa68883296be85b446cade8c8acc5eb87fe1f7fae47c837b346d7"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-67-pending-qs",
      "contentHash": "d4bc3b0cf45a84ba14501770e5feb3ad9f999c7fb102358ba330d0b2de79ca21"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-67-pending-ans",
      "contentHash": "140fc8fd0f87cb38ae2d7018a8570bd7ac4df5804b08e4d53bf3efb457779de8"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-69-pending-qs",
      "contentHash": "1300577ca1084bb2f134c83586f5a71144932c02ef7aa94294b2b4e8e0ad94e7"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-69-pending-ans",
      "contentHash": "f4a8f0ce50c9cef57b1b78da258fa88eb9ca7c40960b7979ea63924694ee70fb"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-70-pending-qs",
      "contentHash": "33524a3b9e325a1aae36e0f575635e14b36f08910329b7ada7774f7b7c0f1017"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-70-pending-ans",
      "contentHash": "2384c9885d916465050988ce3652ab0bef4cca309ef62498c2378c84b2b2a295"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-71-pending-qs",
      "contentHash": "8b0b99bf1efe3b6fe836d064f7988877498cfba62d3c2bd17e35f836b50c4bc9"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-71-pending-ans",
      "contentHash": "b617b1595d20ea7756e6698f762bb6760eaa3cd0bf038bf52321163bfa37d6ec"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-72-pending-qs",
      "contentHash": "d5ecb448557929a469449223fae9c57b78ebe435cdd55efe08661098e48fba90"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-72-pending-ans",
      "contentHash": "5c3053288b77f6392a04d17f54d1524a98e6c6475a05b29e1bfcd2c217445eec"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-73-pending-qs",
      "contentHash": "579320fdb67ffb86c7f41c2e4cb1dcff596754206c0e3103c63a2bea27bd40ca"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-73-pending-ans",
      "contentHash": "bacb38e8ac9b0a74e258faaca89ac9d4dbbc817276d88ae28b534991275f58df"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-78-pending-qs",
      "contentHash": "d97dd1e10e62f95d61cc525b8b2122c730ddba054de4fbad8af0592edd9f5feb"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-78-pending-ans",
      "contentHash": "e29eb2b2c175e37d268fbb1ac8b0d843e0fbf6c11cafc9f284c01924b275abf6"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-79-pending-qs",
      "contentHash": "116f4c618cf03cd2d9fa7db04a9dd5a42b7723205b035334f14fe630324c21b6"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-79-pending-ans",
      "contentHash": "3c004e6186486295e0ec00d5aa372234bbe42e7b97da7c9380ef27230823fd4e"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-80-pending-qs",
      "contentHash": "e9a8a67fa7245a3e2b26ef23b549274528936de96ac725804ea573a56f148ecc"
    },
    {
      "kind": "sources",
      "id": "source-ipa-2018h30a-fe-am-80-pending-ans",
      "contentHash": "1f89adee3fdf88a4ca9a8fe036b54b2827568f07382a37b9e0d4a4093bff3022"
    },
    {
      "kind": "rights",
      "id": "rights-ppc-pdl-source79",
      "contentHash": "b77361d40edfd5c1ba448828d4e3cf253522cfb68b74c9c16a152bd6c753ea48"
    },
    {
      "kind": "rights",
      "id": "rights-ipa-2018h30a-fe-am-62-pending-cohort",
      "contentHash": "65cbeacb188dbac509418bf8eb604ceb57f3e6af754f648ba3a8b2463752210f"
    },
    {
      "kind": "rights",
      "id": "rights-ipa-2018h30a-fe-am-63-pending-cohort",
      "contentHash": "d3fa7f8de242ffda08ca2dbed128b9f63b0f3da1cae072c045e0d9e3ec222e8b"
    },
    {
      "kind": "rights",
      "id": "rights-ipa-2018h30a-fe-am-64-pending-cohort",
      "contentHash": "3cea183638a1db20d62897844ecd9698862a8c5e448fa70c325d2c0146c88a06"
    },
    {
      "kind": "rights",
      "id": "rights-ipa-2018h30a-fe-am-66-pending-cohort",
      "contentHash": "2d8bae5a869d7af5cb0fa42e9491fe4b8861e0ace298736ee46e621b547a67b1"
    },
    {
      "kind": "rights",
      "id": "rights-ipa-2018h30a-fe-am-67-pending-cohort",
      "contentHash": "276e3d21aeae0c22dc203c48d12220ad66c91663b4f969295e321be3162ec062"
    },
    {
      "kind": "rights",
      "id": "rights-ipa-2018h30a-fe-am-69-pending-cohort",
      "contentHash": "9c7103cffabcef24356c48b34a37d4947cf71f1d950980dec34bf450fdde3352"
    },
    {
      "kind": "rights",
      "id": "rights-ipa-2018h30a-fe-am-70-pending-cohort",
      "contentHash": "395b5d31873eda8b060c3b2412944e32ae08dd97ebd0c66a41568b616cb79f26"
    },
    {
      "kind": "rights",
      "id": "rights-ipa-2018h30a-fe-am-71-pending-cohort",
      "contentHash": "8eb4f95ca1beabf43d67796c7bd53ce9f707c365c563d0ec80ed5ff34c226434"
    },
    {
      "kind": "rights",
      "id": "rights-ipa-2018h30a-fe-am-72-pending-cohort",
      "contentHash": "9199c6fc4d19e858c0a4af2350c40733c2b8ffc8dc50d6b2d27e4f01c04f998e"
    },
    {
      "kind": "rights",
      "id": "rights-ipa-2018h30a-fe-am-73-pending-cohort",
      "contentHash": "5198a0823c904c47f013ba8baac8b400e3664180d64e1f28f1afb05e813de6d2"
    },
    {
      "kind": "rights",
      "id": "rights-ipa-2018h30a-fe-am-78-pending-cohort",
      "contentHash": "221f7471113be23c79db8152d310468d91d3c1650e8236eb093ca6caaffc9945"
    },
    {
      "kind": "rights",
      "id": "rights-ipa-2018h30a-fe-am-79-pending-cohort",
      "contentHash": "544cad95a8fa4b76c59abfbc968b392e67264b7c2a9038843d1010ffe894c84a"
    },
    {
      "kind": "rights",
      "id": "rights-ipa-2018h30a-fe-am-80-pending-cohort",
      "contentHash": "bed36f878452e3d305553bf0aeaae67c3ede33ce768dd69d8aacc4283d59bd64"
    }
  ],
  "external": [
    {
      "path": "public/data/rights/original.json",
      "sha256": "ffb764faee25934fdc7a1bdd54868a01294f5749af8bbcc9f2e6b6f3bb40af15",
      "value": {
        "schemaVersion": "3.0.0",
        "id": "rights-original",
        "holders": [
          "OpenCBT-FE-KihonJoho の独自記述部分"
        ],
        "basis": "own_work",
        "evidence": [],
        "scope": "本プロジェクトが独立に作成した追加記述・計算による正答・独自解説・独自の図表表現部分。公式原問題に依存する構造・表現には対応するIPA資料のrightsも適用し、公式の本文・正答・図、依存ライブラリへCC0を適用しない。",
        "uses": {
          "repositoryRedistribution": "allowed",
          "browserDisplay": "allowed",
          "adaptation": "allowed"
        },
        "attributionText": "本プロジェクトの独自記述（AI作成）。公式解説ではありません。",
        "modificationNoticeRequired": false,
        "licenseId": "CC0-1.0",
        "thirdParty": {
          "status": "none_identified",
          "notes": "独立に作成した追加記述と解説の範囲。IPA原問題に基づく図・表・問題にはrights-ipa-年度-科目の参照を併記して適用する。第三者教材の解説や図へ本条件を拡張しない。",
          "rightsRefs": []
        },
        "checkedOn": "2026-10-06",
        "assessmentNotes": "この資料の独自部分に対する再利用方針。AI生成物の著作物性や権利帰属を一律に保証する記録ではない。将来の投稿コンテンツには投稿者による権利確認が必要。"
      },
      "usage": "explicit_readonly_external_reference"
    },
    {
      "path": "public/data/sources/ipa-faq.json",
      "sha256": "b424f1873a1735b4ba6e5a8b30e09e4ac2e8ef3fb5da14b3ada5cf5e6004336b",
      "value": {
        "schemaVersion": "3.0.0",
        "id": "source-ipa-faq",
        "title": "試験に関するよくある質問",
        "publisher": "独立行政法人情報処理推進機構（IPA）",
        "url": "https://www.ipa.go.jp/shiken/faq.html",
        "dateNote": "ページに公開日の明示はない。FAQの最終更新日は2026-09-02。",
        "checkedOn": "2026-10-07",
        "type": "policy",
        "scope": "FE。2025年度の公開問題又はその利用条件に関係するIPA公開資料。",
        "availability": "officially_published",
        "sections": [
          "その他／過去問題の使用方法／留意点"
        ],
        "facts": [
          "教育目的等での公表過去問題の利用、出典の記載、改変の明示について案内している。"
        ],
        "supports": [
          "ingestion",
          "attribution"
        ],
        "limits": "GitHubという媒体を名指しした許可や第三者素材の包括的再許諾、画面資産の転載許可は明示していない。",
        "updatedOn": "2026-09-02"
      },
      "usage": "baseline_only_new13_uses_new_scope_specific_FAQ_Source"
    }
  ],
  "scope": "new13_collection_only_held39_58_65_absent; old public records unchanged; no normal admission"
} as const;

/** Independent explanation roles and numeric conclusions, peer-v1 correction. */
export const pendingAmExplanationRequirements={
  "basis": "Original313 allFour independent reasons + peer93 + independent v1 peer explanation requirements. Required semantic clauses were fixed without computing them from producer.",
  "peerRequirementsSHA256": "53cea59603b41179e7c4885c2574ce42bbc2ff752f7a12da40224c32bbae3f8d",
  "peerRequirements": {
    "status": "independent_review_requirements_for_v2_not_implemented_or_run",
    "basis": "independent-probe.jsonの30条件120truthと各allFour.independentReason、D04の正答概念/実回答意味区分。producerのcorrectIndex/explanationを期待値の根拠にしない。",
    "common": [
      "正しい本文/選択肢/正答を保ち、解説だけを50字超の誤説明へ置換した負例を全13系列で拒否する。",
      "単なる長さ、真偽配列の存在、producer同士の一致を意味の検査としない。",
      "30全入力を対象とし、正答の意味、各誤答の異なる役割、当入力の必要な値と結論を独立固定の要件へ照合する。",
      "表示記号ア/イ/ウ/エではなく実際の対象/内容を根拠にする。",
      "意味要件/許容表現を独立fixtureへ固定し、数字や対象/肯否の変異で検出能力を示す。"
    ],
    "series": [
      {
        "number": 62,
        "meaning": [
          "BPOは業務遂行をシステム運用等と一体で外部委託する。",
          "計算資源だけの借用、ソフト機能だけの利用、自社が指揮する人員補充とは異なる。"
        ],
        "negative": "BPOをSaaSのソフトウェア利用だけ又は派遣人員の利用と同一視する。"
      },
      {
        "number": 63,
        "meaning": [
          "SOAは独立したサービスの組合せで業務変更へ対応する。",
          "EAの全体体系、DFDの機能/情報モデル、順次・選択・反復の構造化設計を区別。"
        ],
        "negative": "サービス組合せをDFD又はEAと取り違える。"
      },
      {
        "number": 64,
        "meaning": [
          "計画の段階でシステム化範囲/順序/体制・役割分担/開発から運用保守までの費用根拠を整理。",
          "具体的画面設計、日々の運用、稼働後の修正依頼影響分析と区別。"
        ],
        "negative": "画面配置の具体化を当問のシステム化計画の正答として説明する。"
      },
      {
        "number": 66,
        "meaning": [
          "a=情報を求めるRFI、b=提案を求めるRFP、c=供給者選定、d=契約締結。",
          "各入力で問われるboxと、そのboxに表示する説明に結合する。"
        ],
        "expectedByValue": [
          {
            "values": [
              0
            ],
            "target": "b",
            "answer": "RFP"
          },
          {
            "values": [
              1
            ],
            "target": "a",
            "answer": "RFI"
          },
          {
            "values": [
              2
            ],
            "target": "c",
            "answer": "供給者の選定"
          },
          {
            "values": [
              3
            ],
            "target": "d",
            "answer": "契約の締結"
          }
        ],
        "negative": "解説のa/b又はRFI/RFPを交換しても本文と正答を変更しない。"
      },
      {
        "number": 67,
        "meaning": [
          "成長期は需要/売上の拡大に伴い製品ラインや販路を拡張し投資を要する。",
          "成熟期の差別化/競争・コスト、衰退期の撤退/残存市場、導入期の認知/新規需要を区別。"
        ],
        "negative": "導入期又は成熟期の説明を成長期の根拠として置換する。"
      },
      {
        "number": 69,
        "meaning": [
          "A→Q、B行率の合計、P全見込者とA→Pの割合、C→SとS新規の比較を実入力の数値から導く。",
          "行合計不足を正規化せず、既存と新規を分離する。",
          "下記の独立分数計算と、4claimの真偽/正答内容に解説の数値と結論を照合。"
        ],
        "expectedByValue": [
          {
            "values": [
              0
            ],
            "AtoQ": 3000,
            "BRateSum": "0.9",
            "Ptotal": 20000,
            "AtoP": 5000,
            "PshareInWari": "2.5",
            "CtoS": 24000,
            "freshS": 23000,
            "truth": [
              false,
              false,
              false,
              true
            ]
          },
          {
            "values": [
              1
            ],
            "AtoQ": 3000,
            "BRateSum": "0.9",
            "Ptotal": 20000,
            "AtoP": 5000,
            "PshareInWari": "2.5",
            "CtoS": 24000,
            "freshS": 27000,
            "truth": [
              true,
              false,
              false,
              false
            ]
          },
          {
            "values": [
              2
            ],
            "AtoQ": 3000,
            "BRateSum": "1.0",
            "Ptotal": 20000,
            "AtoP": 5000,
            "PshareInWari": "2.5",
            "CtoS": 24000,
            "freshS": 30000,
            "truth": [
              false,
              true,
              false,
              false
            ]
          },
          {
            "values": [
              3
            ],
            "AtoQ": 9000,
            "BRateSum": "0.9",
            "Ptotal": 30000,
            "AtoP": 15000,
            "PshareInWari": "5",
            "CtoS": 3000,
            "freshS": 23000,
            "truth": [
              false,
              false,
              true,
              false
            ]
          }
        ],
        "negative": "解説のA→Qだけを別値へ、率合計を常に1へ、P割合の分母から新規を除く、又はSの大小関係を反転する。"
      },
      {
        "number": 70,
        "meaning": [
          "profile0は技術性能のS字的進歩、profile1は経験蓄積と単位作業時間低下のラーニングカーブ。",
          "需要曲線は価格/需要量、バスタブは使用期間/故障率。"
        ],
        "negative": "ラーニングカーブと需要曲線の意味を交換する。"
      },
      {
        "number": 71,
        "meaning": [
          "センサー/機器は直接又はゲートウェイ経由でネットワークへ接続できる。",
          "アナログ検知器や動物の装着端末を一律除外せず、端末自身の自律的データ分析を必須としない。"
        ],
        "negative": "アナログ検知器又は動物に装着した端末を無条件に除外する。"
      },
      {
        "number": 72,
        "meaning": [
          "RFIDはタグ内部に記憶された情報を電波で非接触読取りする。",
          "原は条件が合う梱包越しの読取り、profile1は複数タグの非接触読取り。GPS測位・接触磁気読取り・記憶領域なしとの違い。",
          "金属や液体の影響を受けない等の無条件の一般化をしない。"
        ],
        "negative": "タグが記憶領域をもたず全ての情報を読取り側だけに保存するとする。"
      },
      {
        "number": 73,
        "meaning": [
          "2018原のO to Oはネット/実店舗の双方向の誘導を含み購買へ結ぶ。",
          "無料/追加課金のフリーミアム、受注後生産BTO、第三者預託エスクローと区別。"
        ],
        "negative": "注文後生産又は代金預託をO to Oの意味とする。"
      },
      {
        "number": 78,
        "meaning": [
          "当問の法律は刑法の不正指令電磁的記録に関する罪。",
          "作成/提供を正当理由なし・他人の電子計算機で実行させる目的等の条件と区別し、全研究/全作成を無条件に処罰するとしない。",
          "不正アクセス、営業秘密等、当時のプロバイダ責任の法律と区別。"
        ],
        "negative": "全ての研究用作成を無条件に不正アクセス禁止法が処罰するとする。"
      },
      {
        "number": 79,
        "meaning": [
          "平成28年11月/平成29年3月一部改正の通則編に限定。",
          "本人が識別できる映像/音声、氏名等がある社員情報、本人認証用生体特徴は個人番号がないだけで個人情報から外れない。",
          "法定の匿名加工を行った情報は個人情報と区別し、氏名だけ削除又は仮名化と同一視しない。"
        ],
        "negative": "現在法へ版を無断変更する又は個人番号がない情報は個人情報でないとする。"
      },
      {
        "number": 80,
        "meaning": [
          "請負では受託者が自ら業務遂行・労働時間・配置/規律を管理する。",
          "発注者の具体的指示に従う休暇承認/始終業時刻は当問の請負の独立性を満たさない。",
          "受託者責任者が納期/成果物の要請を受ける窓口と労働者への直接指揮を同一視しない。現実の契約全体を1条件だけで断定しない。"
        ],
        "negative": "責任者が納期要請を受けるだけで労働者派遣の正答と説明する。"
      }
    ],
    "normalGate": "通常Appの表示・用語・ライセンスの到達性・履歴互換の検証を別途保持。ここでcore/runtimeのcapacityを緩めない。"
  },
  "requiredSemanticClauses": {
    "62": [
      "業務の遂行を、それを支えるシステム運用などと一体として専門業者へ委託する。",
      "基盤資源だけの借用、ソフトウェア機能だけの利用、派遣による人員補充とは区別する。"
    ],
    "63": [
      "業務機能をサービスとして構成し、その組合せによって業務の変化に対応する。",
      "全社全体の体系を整理するEA",
      "データの流れを用いる分析",
      "順次・選択・反復による構造化とは対象と構成方法が異なる。"
    ],
    "64": [
      "システム化計画では、システム化の範囲・順序・推進体制と役割分担",
      "開発・運用・保守に必要な費用の算出根拠などを整理する。",
      "画面や帳票を具体化する設計、稼働中の運転・監視、稼働後の変更依頼の影響分析は別の作業である。"
    ],
    "66": [
      "aは情報を求めるRFI（Request for Information：情報提供依頼書）",
      "bは提案を求めるRFP（Request for Proposal：提案依頼書）",
      "cは提案・能力を評価して供給者を選定する段階",
      "dは役割と責任を文書で確認して契約を締結する段階"
    ],
    "67": [
      "成長期は、製品への理解と需要が拡大し、売上の伸びに対応して製品や販路を増やす時期である。",
      "差別化とコスト削減が重くなる成熟期",
      "需要減少に対応する衰退期",
      "認知と新規需要を開拓する導入期と区別する。"
    ],
    "69": [
      "各行の率が1未満でも、表にない購入を補って正規化しない。"
    ],
    "70": [
      "技術のSカーブは技術の導入から成長・成熟などへ進む性能向上の過程を表す。",
      "需要曲線は価格と需要量",
      "バスタブ曲線は使用期間と故障率",
      "ラーニングカーブは経験の蓄積と単位作業時間などの関係を扱う。"
    ],
    "71": [
      "機器やセンサーなどが直接又はゲートウェイなどを介してネットワークにつながる。",
      "アナログの検知器や動物に装着する端末を一律に除外せず",
      "端末自体が自律的に分析することも必須条件ではない。"
    ],
    "72": [
      "ICタグの記憶領域にある情報を電波で非接触に読み取る。",
      "条件が合えば梱包越しや複数タグの読取りもできる。",
      "衛星測位のGPS、接触する磁気読取り、タグが記憶領域をもたないという説明と区別する。"
    ],
    "73": [
      "ネット上と実店舗との間で顧客を誘導して購買につなげる。",
      "無料と有料を組み合わせるフリーミアム",
      "注文を受けてから生産する受注生産",
      "第三者が代金を預かるエスクローとは仕組みが異なる。"
    ],
    "78": [
      "刑法の不正指令電磁的記録に関する罪である。",
      "正当な理由がなく人の電子計算機で実行させる目的などの成立条件",
      "あらゆる研究・作成行為を無条件に処罰する説明ではない。",
      "不正アクセス、営業秘密等の不正競争、当時のプロバイダ責任に関する法律とは対象が異なる。"
    ],
    "79": [
      "平成28年11月・平成29年3月一部改正の通則編を対象とする。",
      "本人を識別できる映像・音声や氏名等のある社員情報、本人認証用の生体の特徴情報",
      "個人番号の有無だけで個人情報から外れない。",
      "法定の加工を行った匿名加工情報は、元の個人を識別できる個人情報と区別される。",
      "現在の法や別の版へ置き換えて判断しない。"
    ],
    "80": [
      "請負では、受託者が自ら業務の遂行、労働時間、配置や服務規律などを管理する。",
      "休暇承認や始業・終業を発注者の具体的な指示に従って決める条件は、問題が求める請負の独立性を満たさない行為である。",
      "受託者の責任者が納期・成果物などの要請を窓口で受けることを、労働者への直接の指揮と同一視しない。"
    ]
  }
} as const;
