/** Fixed source/reviewer facts; do not import producers or refresh from output. */
export const remainingAmOriginals={
  "44": {
    "title": "公衆無線LANの対策と効果",
    "prompt": "公衆無線LANのアクセスポイントを設置するときのセキュリティ対策と効果の組みのうち，適切なものはどれか。",
    "choices": [
      [
        "MACアドレスフィルタリングを設定する。",
        "正規の端末のMACアドレスに偽装した攻撃者の端末からの接続を遮断し，利用者のなりすましを防止する。"
      ],
      [
        "SSIDを暗号化する。",
        "SSIDを秘匿して，SSIDの盗聴を防止する。"
      ],
      [
        "自社がレジストラに登録したドメインを，アクセスポイントのSSIDに設定する。",
        "正規のアクセスポイントと同一のSSIDを設定した，悪意のあるアクセスポイントの設置を防止する。"
      ],
      [
        "同一のアクセスポイントに無線で接続している端末同士の通信を，アクセスポイントで遮断する。",
        "同一のアクセスポイントに無線で接続している他の端末に，公衆無線LANの利用者がアクセスポイントを経由して無断でアクセスすることを防止する。"
      ]
    ],
    "officialKey": "エ",
    "page": 22,
    "columns": [
      "セキュリティ対策",
      "効果"
    ]
  },
  "45": {
    "title": "第三者中継を示すメールログ",
    "prompt": "自社の中継用メールサーバで，接続元IPアドレス，電子メールの送信者のメールアドレスのドメイン名，及び電子メールの受信者のメールアドレスのドメイン名から成るログを取得するとき，外部ネットワークからの第三者中継と判断できるログはどれか。ここで，AAA.168.1.5とAAA.168.1.10は自社のグローバルIPアドレスとし，BBB.45.67.89とBBB.45.67.90は社外のグローバルIPアドレスとする。a.b.cは自社のドメイン名とし，a.b.dとa.b.eは他社のドメイン名とする。また，IPアドレスとドメイン名は詐称されていないものとする。",
    "choices": [
      [
        "AAA.168.1.5",
        "a.b.c",
        "a.b.d"
      ],
      [
        "AAA.168.1.10",
        "a.b.c",
        "a.b.c"
      ],
      [
        "BBB.45.67.89",
        "a.b.d",
        "a.b.e"
      ],
      [
        "BBB.45.67.90",
        "a.b.d",
        "a.b.c"
      ]
    ],
    "officialKey": "ウ",
    "page": 23,
    "columns": [
      "接続元IPアドレス",
      "電子メールの送信者のメールアドレスのドメイン名",
      "電子メールの受信者のメールアドレスのドメイン名"
    ]
  },
  "55": {
    "title": "キャパシティ管理の傾向分析",
    "prompt": "キャパシティ管理における将来のコンポーネント，並びにサービスの容量・能力及びパフォーマンスを予想する活動のうち，傾向分析はどれか。",
    "choices": [
      "特定の資源の利用状況を時系列に把握して，将来における利用の変化を予測する。",
      "待ち行列理論などの数学的技法を利用して，サービスの応答時間及びスループットを予測する。",
      "模擬的にトランザクションを発生させて，サービスの応答時間及びスループットを予測する。",
      "モデル化の第一段階として，現在達成されているパフォーマンスを正確に反映したモデルを作成する。"
    ],
    "officialKey": "ア",
    "page": 27,
    "columns": []
  },
  "56": {
    "title": "コールドスタートと回復方式",
    "prompt": "システム障害が発生したときにシステムを初期状態に戻して再開する方法であり，更新前コピー又は更新後コピーの前処理を伴わないシステム開始のことであって，初期プログラムロードとも呼ばれるものはどれか。",
    "choices": [
      "ウォームスタート",
      "コールドスタート",
      "ロールバック",
      "ロールフォワード"
    ],
    "officialKey": "イ",
    "page": 27,
    "columns": []
  },
  "59": {
    "title": "外部保管媒体の引渡し監査",
    "prompt": "外部保管のために専門業者に機密情報を含むバックアップ媒体を引き渡す際の安全性について，情報セキュリティ監査を実施した。その結果として判明した状況のうち，監査人が指摘事項として監査報告書に記載すべきものはどれか。",
    "choices": [
      "委託元責任者が，一定期間ごとに，専門業者における媒体保管状況を確認する契約を結んだ上で引き渡している。",
      "委託元責任者が，専門業者との間で，機密保持条項を盛り込んだ業務委託契約を結んだ上で引き渡している。",
      "委託元担当者が，専用の記録簿に，引渡しの都度，日付と内容を記入し，専門業者から受領印をもらっている。",
      "委託元担当者が，バックアップ媒体を段ボール箱に入れ，それを専門業者に引き渡している。"
    ],
    "officialKey": "エ",
    "page": 28,
    "columns": []
  },
  "60": {
    "title": "上場企業の内部統制最終責任",
    "prompt": "我が国の証券取引所に上場している企業において，内部統制の整備及び運用に最終的な責任を負っている者は誰か。",
    "choices": [
      "株主",
      "監査役",
      "業務担当者",
      "経営者"
    ],
    "officialKey": "エ",
    "page": 28,
    "columns": []
  },
  "61": {
    "title": "IT投資の事前評価",
    "prompt": "IT投資評価を，個別プロジェクトの計画，実施，完了に応じて，事前評価，中間評価，事後評価を行う。事前評価について説明したものはどれか。",
    "choices": [
      "計画と実績との差異及び原因を詳細に分析し，投資額や効果目標の変更が必要かどうかを判断する。",
      "事前に設定した効果目標の達成状況を評価し，必要に応じて目標を達成するための改善策を検討する。",
      "投資効果の実現時期と評価に必要なデータ収集方法を事前に計画し，その時期に合わせて評価を行う。",
      "投資目的に基づいた効果目標を設定し，実施可否判断に必要な情報を上位マネジメントに提供する。"
    ],
    "officialKey": "エ",
    "page": 29,
    "columns": []
  }
} as const;
export const remainingAmCases=[
  {
    "number": 44,
    "values": [
      0,
      0,
      0
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      [
        "mac_filter",
        "spoof_resistance"
      ],
      [
        "ssid_encryption_label",
        "ssid_secrecy"
      ],
      [
        "domain_as_ssid",
        "exclusive_ssid"
      ],
      [
        "isolate_ap_clients",
        "drop_client_access_via_ap"
      ]
    ]
  },
  {
    "number": 44,
    "values": [
      0,
      0,
      1
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      [
        "mac_filter",
        "spoof_resistance"
      ],
      [
        "ssid_encryption_label",
        "ssid_secrecy"
      ],
      [
        "domain_as_ssid",
        "certificate_auth"
      ],
      [
        "isolate_ap_clients",
        "drop_client_access_via_ap"
      ]
    ]
  },
  {
    "number": 44,
    "values": [
      0,
      1,
      0
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      [
        "mac_filter",
        "spoof_resistance"
      ],
      [
        "hide_ssid",
        "ssid_secrecy"
      ],
      [
        "domain_as_ssid",
        "exclusive_ssid"
      ],
      [
        "isolate_ap_clients",
        "drop_client_access_via_ap"
      ]
    ]
  },
  {
    "number": 44,
    "values": [
      0,
      1,
      1
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      [
        "mac_filter",
        "spoof_resistance"
      ],
      [
        "hide_ssid",
        "ssid_secrecy"
      ],
      [
        "domain_as_ssid",
        "certificate_auth"
      ],
      [
        "isolate_ap_clients",
        "drop_client_access_via_ap"
      ]
    ]
  },
  {
    "number": 44,
    "values": [
      1,
      0,
      0
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      [
        "mac_filter",
        "data_encryption"
      ],
      [
        "ssid_encryption_label",
        "ssid_secrecy"
      ],
      [
        "domain_as_ssid",
        "exclusive_ssid"
      ],
      [
        "isolate_ap_clients",
        "drop_client_access_via_ap"
      ]
    ]
  },
  {
    "number": 44,
    "values": [
      1,
      0,
      1
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      [
        "mac_filter",
        "data_encryption"
      ],
      [
        "ssid_encryption_label",
        "ssid_secrecy"
      ],
      [
        "domain_as_ssid",
        "certificate_auth"
      ],
      [
        "isolate_ap_clients",
        "drop_client_access_via_ap"
      ]
    ]
  },
  {
    "number": 44,
    "values": [
      1,
      1,
      0
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      [
        "mac_filter",
        "data_encryption"
      ],
      [
        "hide_ssid",
        "ssid_secrecy"
      ],
      [
        "domain_as_ssid",
        "exclusive_ssid"
      ],
      [
        "isolate_ap_clients",
        "drop_client_access_via_ap"
      ]
    ]
  },
  {
    "number": 44,
    "values": [
      1,
      1,
      1
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      [
        "mac_filter",
        "data_encryption"
      ],
      [
        "hide_ssid",
        "ssid_secrecy"
      ],
      [
        "domain_as_ssid",
        "certificate_auth"
      ],
      [
        "isolate_ap_clients",
        "drop_client_access_via_ap"
      ]
    ]
  },
  {
    "number": 45,
    "values": [
      0,
      0
    ],
    "truth": [
      false,
      false,
      true,
      false
    ],
    "meanings": [
      [
        "own",
        "own",
        "foreign"
      ],
      [
        "own",
        "own",
        "own"
      ],
      [
        "foreign",
        "foreign",
        "foreign"
      ],
      [
        "foreign",
        "foreign",
        "own"
      ]
    ]
  },
  {
    "number": 45,
    "values": [
      0,
      1
    ],
    "truth": [
      false,
      false,
      true,
      false
    ],
    "meanings": [
      [
        "own",
        "own",
        "foreign"
      ],
      [
        "own",
        "foreign",
        "own"
      ],
      [
        "foreign",
        "foreign",
        "foreign"
      ],
      [
        "foreign",
        "foreign",
        "own"
      ]
    ]
  },
  {
    "number": 45,
    "values": [
      1,
      0
    ],
    "truth": [
      false,
      false,
      true,
      false
    ],
    "meanings": [
      [
        "own",
        "foreign",
        "foreign"
      ],
      [
        "own",
        "own",
        "own"
      ],
      [
        "foreign",
        "foreign",
        "foreign"
      ],
      [
        "foreign",
        "foreign",
        "own"
      ]
    ]
  },
  {
    "number": 45,
    "values": [
      1,
      1
    ],
    "truth": [
      false,
      false,
      true,
      false
    ],
    "meanings": [
      [
        "own",
        "foreign",
        "foreign"
      ],
      [
        "own",
        "foreign",
        "own"
      ],
      [
        "foreign",
        "foreign",
        "foreign"
      ],
      [
        "foreign",
        "foreign",
        "own"
      ]
    ]
  },
  {
    "number": 56,
    "values": [
      0
    ],
    "truth": [
      false,
      true,
      false,
      false
    ],
    "meanings": [
      "resume_retained_state",
      "2018_question_full_initialization",
      "undo_uncommitted_before_images",
      "restore_backup_reapply_later_logs"
    ]
  },
  {
    "number": 56,
    "values": [
      1
    ],
    "truth": [
      false,
      false,
      true,
      false
    ],
    "meanings": [
      "resume_retained_state",
      "2018_question_full_initialization",
      "undo_uncommitted_before_images",
      "restore_backup_reapply_later_logs"
    ]
  },
  {
    "number": 56,
    "values": [
      2
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "resume_retained_state",
      "2018_question_full_initialization",
      "undo_uncommitted_before_images",
      "restore_backup_reapply_later_logs"
    ]
  },
  {
    "number": 59,
    "values": [
      0
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "periodic_storage_check_contracted",
      "confidentiality_agreed",
      "date_contents_and_receipt_stamp",
      "original_packaging_case"
    ]
  },
  {
    "number": 59,
    "values": [
      1
    ],
    "truth": [
      true,
      false,
      false,
      false
    ],
    "meanings": [
      "monitoring_not_defined_or_performed",
      "confidentiality_agreed",
      "date_contents_and_receipt_stamp",
      "locked_container_authorized_handover_and_stated_procedure_met"
    ]
  },
  {
    "number": 59,
    "values": [
      2
    ],
    "truth": [
      false,
      true,
      false,
      false
    ],
    "meanings": [
      "periodic_storage_check_contracted",
      "confidentiality_not_agreed",
      "date_contents_and_receipt_stamp",
      "locked_container_authorized_handover_and_stated_procedure_met"
    ]
  },
  {
    "number": 59,
    "values": [
      3
    ],
    "truth": [
      false,
      false,
      true,
      false
    ],
    "meanings": [
      "periodic_storage_check_contracted",
      "confidentiality_agreed",
      "handover_record_and_receipt_not_retained",
      "locked_container_authorized_handover_and_stated_procedure_met"
    ]
  },
  {
    "number": 60,
    "values": [
      0,
      0
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "shareholder",
      "statutory_auditor",
      "operator",
      "management"
    ]
  },
  {
    "number": 60,
    "values": [
      0,
      1
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "shareholder",
      "statutory_auditor",
      "internal_auditor",
      "management"
    ]
  },
  {
    "number": 60,
    "values": [
      1,
      0
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "shareholder",
      "accounting_auditor",
      "operator",
      "management"
    ]
  },
  {
    "number": 60,
    "values": [
      1,
      1
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "shareholder",
      "accounting_auditor",
      "internal_auditor",
      "management"
    ]
  },
  {
    "number": 61,
    "values": [
      0,
      0,
      0
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "mid_execution",
      "post_realized_effect",
      "post_planned_effect_measurement",
      "pre_investment_decision"
    ]
  },
  {
    "number": 61,
    "values": [
      0,
      0,
      1
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "mid_execution",
      "post_realized_effect",
      "post_planned_effect_measurement",
      "pre_investment_decision"
    ]
  },
  {
    "number": 61,
    "values": [
      0,
      1,
      0
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "mid_execution",
      "post_realized_effect",
      "post_planned_effect_measurement",
      "pre_investment_decision"
    ]
  },
  {
    "number": 61,
    "values": [
      0,
      1,
      1
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "mid_execution",
      "post_realized_effect",
      "post_planned_effect_measurement",
      "pre_investment_decision"
    ]
  },
  {
    "number": 61,
    "values": [
      1,
      0,
      0
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "mid_execution",
      "post_realized_effect",
      "post_planned_effect_measurement",
      "pre_investment_decision"
    ]
  },
  {
    "number": 61,
    "values": [
      1,
      0,
      1
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "mid_execution",
      "post_realized_effect",
      "post_planned_effect_measurement",
      "pre_investment_decision"
    ]
  },
  {
    "number": 61,
    "values": [
      1,
      1,
      0
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "mid_execution",
      "post_realized_effect",
      "post_planned_effect_measurement",
      "pre_investment_decision"
    ]
  },
  {
    "number": 61,
    "values": [
      1,
      1,
      1
    ],
    "truth": [
      false,
      false,
      false,
      true
    ],
    "meanings": [
      "mid_execution",
      "post_realized_effect",
      "post_planned_effect_measurement",
      "pre_investment_decision"
    ]
  },
  {
    "number": 55,
    "values": [
      0
    ],
    "truth": [
      true,
      false,
      false,
      false
    ],
    "meanings": [
      "特定の資源の利用状況を時系列に把握して，将来における利用の変化を予測する。",
      "待ち行列理論などの数学的技法を利用して，サービスの応答時間及びスループットを予測する。",
      "模擬的にトランザクションを発生させて，サービスの応答時間及びスループットを予測する。",
      "モデル化の第一段階として，現在達成されているパフォーマンスを正確に反映したモデルを作成する。"
    ]
  },
  {
    "number": 55,
    "values": [
      1
    ],
    "truth": [
      false,
      false,
      true,
      false
    ],
    "meanings": [
      "特定の資源の利用状況を時系列に把握して，将来における利用の変化を予測する。",
      "待ち行列モデルの式を解析的に解いて，サービスの応答時間及びスループットを予測する。",
      "モデル上でトランザクションの到着や処理完了のたびに状態を更新し，サービスの応答時間及びスループットを予測する。",
      "モデル化の第一段階として，現在達成されているパフォーマンスを正確に反映したモデルを作成する。"
    ]
  }
] as const;
export const remainingAm55Independent={
  "status": "independent_source_design_acceptance_for_separate_new_proposal_only",
  "independentExpectationOrigin": "raw Q55 full image and IBM printed173–174 / NPTEL3–4 read first; expected text/truth manually fixed, no producer exists and no author answer used to derive truth",
  "proposalID": "2018-autumn-AM55-native-discrete-events-v2-54844c4",
  "reference0Literal": {
    "profile": 0,
    "prompt": "キャパシティ管理における将来のコンポーネント，並びにサービスの容量・能力及びパフォーマンスを予想する活動のうち，傾向分析はどれか。",
    "choices": [
      "特定の資源の利用状況を時系列に把握して，将来における利用の変化を予測する。",
      "待ち行列理論などの数学的技法を利用して，サービスの応答時間及びスループットを予測する。",
      "模擬的にトランザクションを発生させて，サービスの応答時間及びスループットを予測する。",
      "モデル化の第一段階として，現在達成されているパフォーマンスを正確に反映したモデルを作成する。"
    ],
    "truth": [
      true,
      false,
      false,
      false
    ],
    "key": "ア"
  },
  "native1Literal": {
    "profile": 1,
    "prompt": "キャパシティ管理における将来のコンポーネント，並びにサービスの容量・能力及びパフォーマンスを予想する活動のうち，離散事象シミュレーションはどれか。",
    "choices": [
      "特定の資源の利用状況を時系列に把握して，将来における利用の変化を予測する。",
      "待ち行列モデルの式を解析的に解いて，サービスの応答時間及びスループットを予測する。",
      "モデル上でトランザクションの到着や処理完了のたびに状態を更新し，サービスの応答時間及びスループットを予測する。",
      "モデル化の第一段階として，現在達成されているパフォーマンスを正確に反映したモデルを作成する。"
    ],
    "truth": [
      false,
      false,
      true,
      false
    ],
    "key": "ウ"
  },
  "all8Truths": [
    {
      "profile": 0,
      "choice": "ア",
      "literal": "特定の資源の利用状況を時系列に把握して，将来における利用の変化を予測する。",
      "satisfiesAskedActivity": true,
      "reason": "時系列の実測利用を外挿する説明が直接に傾向分析を述べる。"
    },
    {
      "profile": 0,
      "choice": "イ",
      "literal": "待ち行列理論などの数学的技法を利用して，サービスの応答時間及びスループットを予測する。",
      "satisfiesAskedActivity": false,
      "reason": "待ち行列等による数学的な性能算定は、時系列の利用変化を外挿する説明ではない。数学一般とtrendが実務で併用される可能性から、この原説明をtrendそのものとは判定しない。"
    },
    {
      "profile": 0,
      "choice": "ウ",
      "literal": "模擬的にトランザクションを発生させて，サービスの応答時間及びスループットを予測する。",
      "satisfiesAskedActivity": false,
      "reason": "模擬トランザクションに対する応答・処理量の推定で、履歴外挿を述べない。"
    },
    {
      "profile": 0,
      "choice": "エ",
      "literal": "モデル化の第一段階として，現在達成されているパフォーマンスを正確に反映したモデルを作成する。",
      "satisfiesAskedActivity": false,
      "reason": "現在性能を表すモデルの準備・校正で、将来の利用推移を予想する実行を述べない。"
    },
    {
      "profile": 1,
      "choice": "ア",
      "literal": "特定の資源の利用状況を時系列に把握して，将来における利用の変化を予測する。",
      "satisfiesAskedActivity": false,
      "reason": "実測資源利用の時系列把握と外挿を述べ、モデル内の離散事象に伴う状態遷移を実行する説明ではない。"
    },
    {
      "profile": 1,
      "choice": "イ",
      "literal": "待ち行列モデルの式を解析的に解いて，サービスの応答時間及びスループットを予測する。",
      "satisfiesAskedActivity": false,
      "reason": "新イは式を解析的に解く活動へ限定した。待ち行列の数学一般という旧イの広さと区別する。解析モデルの求解はモデル内の到着・完了イベントを実行して状態を進める活動とは異なる。DESも数式や待ち行列を使うのであり、数学を用いないと断言しない。"
    },
    {
      "profile": 1,
      "choice": "ウ",
      "literal": "モデル上でトランザクションの到着や処理完了のたびに状態を更新し，サービスの応答時間及びスループットを予測する。",
      "satisfiesAskedActivity": true,
      "reason": "新ウはモデル上の到着・処理完了という離散事象と状態更新、その実行に基づく性能予想を述べる。単なる人工負荷の実機計測からモデル実行へ具体化されている。到着/完了に応じる状態変化はDESの中心的な挙動であり、解答に時刻ジャンプの定義文を追加する必要はない。"
    },
    {
      "profile": 1,
      "choice": "エ",
      "literal": "モデル化の第一段階として，現在達成されているパフォーマンスを正確に反映したモデルを作成する。",
      "satisfiesAskedActivity": false,
      "reason": "現在性能に合うモデルの作成だけで、離散事象による状態更新・将来性能の実行予想ではない。DESの準備にも使えるという理由で活動そのものと同一視しない。"
    }
  ],
  "uniqueCorrectEach": true,
  "changedContentSlots": [
    "prompt",
    "choice1",
    "choice2"
  ],
  "sourceOriginalQuestionChanged": false,
  "shapeAndRoles": {
    "direction": "named future-capacity prediction activity -> four explanatory descriptions",
    "positiveWhichPreserved": true,
    "original予想Retained": true,
    "newStemDefinitionsOr最もOrHiddenExclusions": false,
    "slots": "A history extrapolation / B analytic performance calculation / C synthetic model execution / D model preparation",
    "noNewTableDiagramOrComputation": true,
    "threeSlotsBoundTogetherInNativeProfile1": true,
    "approvedDesignTuplesOnly": [
      0,
      1
    ],
    "notIndependentCrossProductOfTargetBAndC": true
  },
  "primaryInterpretation": {
    "IBMPrinted173": "analytic queue mathematical forecasting vs discrete next-event model behavior",
    "IBMPrinted174": "uses analytic simulation terminology too; no global claim simulation=DES or DES has no formulas",
    "NPTEL3": "analysis vs simulation models; queue state changes at discrete times",
    "NPTEL4": "arrival/departure event state changes and event-to-event simulation",
    "sourceDateLimits": "本査読はIBM実本文printed173–174とNPTEL3–4の方法記述を照合。個別の正確な公表日未確定を保持し、NPTELをIPAの2018公式分類定義へ同一視しない。"
  },
  "counterexampleAudit": {
    "oldCounterexampleStillValidForOldBroadB": true,
    "oldRecurrenceNotProofOfNewAnalyticSolutionClaim": "computing max/recurrence at each arrival/completion is event execution; the new B states analytical solution of model equations. Evaluating arithmetic in a DES does not turn its described activity into analytic model solution.",
    "coexistingTools": "A hybrid product can use both techniques. The four choices describe performed activities, not mutually exclusive product brands; no new classification premise is inserted.",
    "CSpecificity": "model + transaction arrival/completion + state updates + performance prediction identifies event simulation in this task; no claim that this short description defines every clock algorithm"
  },
  "burdenAndCue": {
    "choiceChars": [
      37,
      41,
      55,
      46
    ],
    "arithmeticAdded": 0,
    "nativeCLongerBy": 13,
    "finding": "新ウは13字長いが方法名を反復せず、到着/処理完了を活動内容として説明する。語数だけで正答を識別する新ルールや補助定義は追加していない。読み負担は記述選択の同程度を保つ設計判断。実layout/FE統計的等価性は未検証。",
    "futureActualGate": "全2body/8truth/bind/grade/seed/history/actual renderと解説/用語は実装後に独立固定資料で検証"
  },
  "materials": "IPA由来の原文と改変を別帰属。IBM/NPTELは概念研究のみで本文・図表をQuestion/alt/解説へ転載しない。教育Git/表示/改変の問別条件を継承、MIT扱いにしない。",
  "oldHoldsRemain": [
    "old analytic input1 D05",
    "old generic simulation two-input AM55-D01",
    "old37 historical proposal",
    "Q58all4 material/version",
    "spring62BPR separate hold"
  ],
  "actualGeneratorBodies": 0,
  "actualPreparedIncrease": 0,
  "six31Unchanged": true,
  "missingAM25Unchanged": true,
  "productionLegacy": 0,
  "wholeScopeNotReady": true
} as const;
export const remainingAmDomains={
  "44": [
    [
      0,
      1
    ],
    [
      0,
      1
    ],
    [
      0,
      1
    ]
  ],
  "45": [
    [
      0,
      1
    ],
    [
      0,
      1
    ]
  ],
  "55": [
    [
      0,
      1
    ]
  ],
  "56": [
    [
      0,
      1,
      2
    ]
  ],
  "59": [
    [
      0,
      1,
      2,
      3
    ]
  ],
  "60": [
    [
      0,
      1
    ],
    [
      0,
      1
    ]
  ],
  "61": [
    [
      0,
      1
    ],
    [
      0,
      1
    ],
    [
      0,
      1
    ]
  ]
} as const;
export const legacy2018AutumnRemainingAmReview: {collection:"2018h30a-fe-am";number:number;page:number;title:string;answer:string;reference:number[];premises:string[];precision:string;materialReview:string}[]=[
  {
    "collection": "2018h30a-fe-am",
    "number": 44,
    "page": 22,
    "title": "公衆無線LANの対策と効果",
    "answer": "エ",
    "reference": [
      0,
      0,
      0
    ],
    "premises": [
      "公衆無線LANのアクセスポイントを設置する場面",
      "同じAPを経由する端末同士の通信を対象とする正答効果"
    ],
    "precision": "原の文章/共有見出し/全四択を保持。数値計算・丸めを追加せず，独立全選択肢判定と有限全域を検証する。",
    "materialReview": "当該問題別原画像と公式ANS1及び素材境界を個別に査読。IPA教育目的の出典/改変表示条件に基づく候補判断。第三者一次資料は概念確認だけで本文図を転載しない。正常App/共有admission/配布を承認しない。"
  },
  {
    "collection": "2018h30a-fe-am",
    "number": 45,
    "page": 23,
    "title": "第三者中継を示すメールログ",
    "answer": "ウ",
    "reference": [
      0,
      0
    ],
    "premises": [
      "自社中継用メールサーバの接続元/送信者/受信者という3欄",
      "外部ネットワークからの第三者中継を問う",
      "AAA.168.1.5/AAA.168.1.10は自社グローバルIP",
      "BBB.45.67.89/BBB.45.67.90は社外グローバルIP",
      "a.b.cは自社、a.b.d/a.b.eは他社",
      "IP/ドメインとも詐称なし"
    ],
    "precision": "原の文章/共有見出し/全四択を保持。数値計算・丸めを追加せず，独立全選択肢判定と有限全域を検証する。",
    "materialReview": "当該問題別原画像と公式ANS1及び素材境界を個別に査読。IPA教育目的の出典/改変表示条件に基づく候補判断。第三者一次資料は概念確認だけで本文図を転載しない。正常App/共有admission/配布を承認しない。"
  },
  {
    "collection": "2018h30a-fe-am",
    "number": 55,
    "page": 27,
    "title": "キャパシティ管理の傾向分析",
    "answer": "ア",
    "reference": [
      0
    ],
    "premises": [
      "将来のコンポーネント及びサービスの容量・能力・パフォーマンスを予想する活動",
      "対象は傾向分析"
    ],
    "precision": "原の文章/共有見出し/全四択を保持。数値計算・丸めを追加せず，独立全選択肢判定と有限全域を検証する。",
    "materialReview": "当該問題別原画像と公式ANS1及び素材境界を個別に査読。IPA教育目的の出典/改変表示条件に基づく候補判断。第三者一次資料は概念確認だけで本文図を転載しない。正常App/共有admission/配布を承認しない。"
  },
  {
    "collection": "2018h30a-fe-am",
    "number": 56,
    "page": 27,
    "title": "コールドスタートと回復方式",
    "answer": "イ",
    "reference": [
      0
    ],
    "premises": [
      "システム障害時",
      "初期状態に戻して再開",
      "更新前/更新後コピーの前処理を伴わないシステム開始",
      "初期プログラムロードとも呼ばれる"
    ],
    "precision": "原の文章/共有見出し/全四択を保持。数値計算・丸めを追加せず，独立全選択肢判定と有限全域を検証する。",
    "materialReview": "当該問題別原画像と公式ANS1及び素材境界を個別に査読。IPA教育目的の出典/改変表示条件に基づく候補判断。第三者一次資料は概念確認だけで本文図を転載しない。正常App/共有admission/配布を承認しない。"
  },
  {
    "collection": "2018h30a-fe-am",
    "number": 59,
    "page": 28,
    "title": "外部保管媒体の引渡し監査",
    "answer": "エ",
    "reference": [
      0
    ],
    "premises": [
      "外部保管の専門業者への引渡し",
      "機密情報を含むバックアップ媒体",
      "安全性の情報セキュリティ監査",
      "指摘事項として監査報告書へ記載すべき状況"
    ],
    "precision": "原の文章/共有見出し/全四択を保持。数値計算・丸めを追加せず，独立全選択肢判定と有限全域を検証する。",
    "materialReview": "当該問題別原画像と公式ANS1及び素材境界を個別に査読。IPA教育目的の出典/改変表示条件に基づく候補判断。第三者一次資料は概念確認だけで本文図を転載しない。正常App/共有admission/配布を承認しない。"
  },
  {
    "collection": "2018h30a-fe-am",
    "number": 60,
    "page": 28,
    "title": "上場企業の内部統制最終責任",
    "answer": "エ",
    "reference": [
      0,
      0
    ],
    "premises": [
      "我が国の証券取引所に上場している企業",
      "内部統制の整備及び運用",
      "最終的な責任を問う（監視・検証の担当を問わない）"
    ],
    "precision": "原の文章/共有見出し/全四択を保持。数値計算・丸めを追加せず，独立全選択肢判定と有限全域を検証する。",
    "materialReview": "当該問題別原画像と公式ANS1及び素材境界を個別に査読。IPA教育目的の出典/改変表示条件に基づく候補判断。第三者一次資料は概念確認だけで本文図を転載しない。正常App/共有admission/配布を承認しない。"
  },
  {
    "collection": "2018h30a-fe-am",
    "number": 61,
    "page": 29,
    "title": "IT投資の事前評価",
    "answer": "エ",
    "reference": [
      0,
      0,
      0
    ],
    "premises": [
      "個別プロジェクトの計画/実施/完了という3時点",
      "事前/中間/事後評価の区別",
      "事前評価の説明を選ぶ（評価名を答える逆方向へしない）"
    ],
    "precision": "原の文章/共有見出し/全四択を保持。数値計算・丸めを追加せず，独立全選択肢判定と有限全域を検証する。",
    "materialReview": "当該問題別原画像と公式ANS1及び素材境界を個別に査読。IPA教育目的の出典/改変表示条件に基づく候補判断。第三者一次資料は概念確認だけで本文図を転載しない。正常App/共有admission/配布を承認しない。"
  }
];
export const legacy2018AutumnRemainingAmCrops:Record<string,readonly[number,number]>={"2018h30a-fe-am-44": [0.08, 0.52], "2018h30a-fe-am-45": [0.08, 0.55], "2018h30a-fe-am-55": [0.08, 0.4], "2018h30a-fe-am-56": [0.45, 0.64], "2018h30a-fe-am-59": [0.31, 0.72], "2018h30a-fe-am-60": [0.75, 0.87], "2018h30a-fe-am-61": [0.08, 0.41]};
export const remainingAmAuthoredAt="2026-10-24T06:44:12.841691Z";

/** Independently stated terminology facts for new scope verification. */
export const remainingAmTermFacts=[
  {
    "term": "AP（アクセスポイント）",
    "expansion": "Access Point",
    "sources": [
      "2018h30a-fe-am-44"
    ],
    "mustExplain": "アクセスポイント",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "端末間通信の分離",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-44"
    ],
    "mustExplain": "端末間通信",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "第三者中継",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-45"
    ],
    "mustExplain": "第三者中継",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "キャパシティ管理",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-55"
    ],
    "mustExplain": "キャパシティ管理",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "傾向分析",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-55"
    ],
    "mustExplain": "傾向分析",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "解析式による性能予測",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-55"
    ],
    "mustExplain": "解析式による性能予測",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "離散事象シミュレーション",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-55"
    ],
    "mustExplain": "離散事象シミュレーション",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "性能モデルの作成",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-55"
    ],
    "mustExplain": "性能モデル",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "IPL",
    "expansion": "Initial Program Load",
    "sources": [
      "2018h30a-fe-am-56"
    ],
    "mustExplain": "初期プログラムロード",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "コールドスタート",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-56"
    ],
    "mustExplain": "コールドスタート",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "ウォームスタート",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-56"
    ],
    "mustExplain": "ウォームスタート",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "ロールバック",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-56"
    ],
    "mustExplain": "ロールバック",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "媒体の受渡管理",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-59"
    ],
    "mustExplain": "媒体",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "機密保持条項",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-59"
    ],
    "mustExplain": "機密保持条項",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "内部統制の責任と監査",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-60"
    ],
    "mustExplain": "内部統制",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "IT投資の事前評価",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-61"
    ],
    "mustExplain": "IT投資",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "IT投資の中間評価",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-61"
    ],
    "mustExplain": "IT投資",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  },
  {
    "term": "IT投資の事後評価",
    "expansion": null,
    "sources": [
      "2018h30a-fe-am-61"
    ],
    "mustExplain": "IT投資",
    "falseClaim": "原問のウは無条件に離散事象シミュレーション"
  }
];

export const remainingAmSourceAssets=[
  {
    "collection": "2018h30a-fe-am",
    "number": 44,
    "page": 22,
    "crop": [
      0.08,
      0.52
    ],
    "name": "ipa-2018h30a-fe-am-44-p22.png",
    "width": 788,
    "height": 490,
    "byteLength": 183301,
    "sha256": "973b41be2510e2667bff34112689b5e4d1bda6977e385519a83d5734d3a3e168",
    "questionSha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
    "text": ""
  },
  {
    "collection": "2018h30a-fe-am",
    "number": 45,
    "page": 23,
    "crop": [
      0.08,
      0.55
    ],
    "name": "ipa-2018h30a-fe-am-45-p23.png",
    "width": 788,
    "height": 524,
    "byteLength": 167449,
    "sha256": "fec6d6e2a02668316622097144f8daa6ac90b5b685fd90d7f6d30473d4b50225",
    "questionSha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
    "text": ""
  },
  {
    "collection": "2018h30a-fe-am",
    "number": 55,
    "page": 27,
    "crop": [
      0.08,
      0.4
    ],
    "name": "ipa-2018h30a-fe-am-55-p27.png",
    "width": 788,
    "height": 357,
    "byteLength": 104933,
    "sha256": "4ab75d218b15e7fa55daba534f21ae790c51c1db86c861d930337fa75c224df7",
    "questionSha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
    "text": ""
  },
  {
    "collection": "2018h30a-fe-am",
    "number": 56,
    "page": 27,
    "crop": [
      0.45,
      0.64
    ],
    "name": "ipa-2018h30a-fe-am-56-p27.png",
    "width": 788,
    "height": 212,
    "byteLength": 56587,
    "sha256": "5df721ae9a1bc202b992f36191761da18b6ed17f5d4f277ed6ec12f8108ac93e",
    "questionSha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
    "text": ""
  },
  {
    "collection": "2018h30a-fe-am",
    "number": 59,
    "page": 28,
    "crop": [
      0.31,
      0.72
    ],
    "name": "ipa-2018h30a-fe-am-59-p28.png",
    "width": 788,
    "height": 457,
    "byteLength": 144031,
    "sha256": "4483b3a8052522d1e18f44185b5d677d7dff486dc7ed6e9963ad1d9bbeec5579",
    "questionSha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
    "text": ""
  },
  {
    "collection": "2018h30a-fe-am",
    "number": 60,
    "page": 28,
    "crop": [
      0.75,
      0.87
    ],
    "name": "ipa-2018h30a-fe-am-60-p28.png",
    "width": 788,
    "height": 134,
    "byteLength": 36586,
    "sha256": "f074b3d9191205881f7ba3db49c3c1438854fa25b337509425a0a3bdcb52d5f9",
    "questionSha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
    "text": ""
  },
  {
    "collection": "2018h30a-fe-am",
    "number": 61,
    "page": 29,
    "crop": [
      0.08,
      0.41
    ],
    "name": "ipa-2018h30a-fe-am-61-p29.png",
    "width": 788,
    "height": 368,
    "byteLength": 121932,
    "sha256": "2c8fe38b9b691d1593e154d93bca8659493c83d2f9ee9ec30f489a6135c09e69",
    "questionSha256": "15c0f1776ba5c22802089c4a74e2ba5484ff2c7f0015212929b0218cc7bbc62e",
    "text": ""
  }
];
export const remainingAmOldPins={
  "annual": 147,
  "AM": 135,
  "PM": 12,
  "finiteBodies": 1504,
  "finiteErrors": 277,
  "rawRecords": 1928,
  "own": 409,
  "inherited": 100,
  "aliases": 15,
  "ownFullJSONSHA256": "ef5223b220b04d502a85e583d494cdd38801cea263c7547d847aa78beb8c27af",
  "inheritedFullJSONSHA256": "debf39166b28804960be802862f0315d4645e2500c70960ddb93585dbf519067",
  "aliasesFullJSONSHA256": "3f9dd9ec74a2404729a9b733f4a7837a758bfa1ef6306ce305c2dca133c3d9f1",
  "sourceOrderSHA256": "08d8a060d1b0b4dc33ba5fa8d93bc60e6f11b1d18896607ba3a5971c1bedcd97",
  "AMOrderSHA256": "a0b7f345f56b77969486c2b0c9d4d0bb0ebd8c4d2c0d3f10489a48e897f559dd",
  "PMOrderSHA256": "f33dc3f447c1bac56b7fc1671b79b79baeb82996b075108ea4b3068447403a83",
  "inventorySHA256": "5a3ef6f6fb9438abbdd38b00f6a2692d2a9d51fea04583f9848c45b999ad941c",
  "missing25": [
    "2018h30h-fe-am-39",
    "2018h30h-fe-am-47",
    "2018h30a-fe-am-39",
    "2018h30a-fe-am-44",
    "2018h30a-fe-am-45",
    "2018h30a-fe-am-55",
    "2018h30a-fe-am-56",
    "2018h30a-fe-am-58",
    "2018h30a-fe-am-59",
    "2018h30a-fe-am-60",
    "2018h30a-fe-am-61",
    "2018h30a-fe-am-62",
    "2018h30a-fe-am-63",
    "2018h30a-fe-am-64",
    "2018h30a-fe-am-65",
    "2018h30a-fe-am-66",
    "2018h30a-fe-am-67",
    "2018h30a-fe-am-69",
    "2018h30a-fe-am-70",
    "2018h30a-fe-am-71",
    "2018h30a-fe-am-72",
    "2018h30a-fe-am-73",
    "2018h30a-fe-am-78",
    "2018h30a-fe-am-79",
    "2018h30a-fe-am-80"
  ],
  "oldSpring62BPRAlreadyPrepared": true,
  "status": "independently_recomputed_from_git_da933ab_actual_old_code",
  "sameOwnerExceptPMOrderProjection": true,
  "ownerPMOrderKnownIncorrect": "819d5ab71ebd600449c444b403274c871a2833a90e110004df1b75fb30abbcae",
  "newAM6Bodies": 0,
  "newPrepared": 0,
  "oldRaw1928SHA256": "37cca5980477aeb0f8503f3a8ad5157f951d65c22e02888f3218e0d91a1d2c7d"
};
