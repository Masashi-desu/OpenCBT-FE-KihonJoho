/** Source-image review, independent of the runtime producer and renderer.
 * Original material reviewed20Oct; complete source/image/form recheck21Oct. */
export const legacy2019PmChangeReview={
  "source": "2019h31h-fe-pm-6",
  "title": "社内システムの仕様変更の取扱い",
  "pages": [
    30,
    31,
    32,
    33,
    34
  ],
  "sharedGroups": [
    "a",
    "b",
    "c",
    "d",
    "e",
    "fg",
    "fg",
    "h"
  ],
  "originalA": [
    [
      "開発チーム",
      "担当PM",
      "プロジェクト管理チーム"
    ],
    [
      "担当PM",
      "開発チーム",
      "プロジェクト管理チーム"
    ],
    [
      "担当PM",
      "プロジェクト管理チーム",
      "開発チーム"
    ],
    [
      "プロジェクト管理チーム",
      "担当PM",
      "開発チーム"
    ]
  ],
  "originalB": [
    "仕様変更依頼の内容に対する影響調査を指示",
    "仕様変更依頼の内容をプロジェクト計画に反映させて更新",
    "仕様変更依頼票の起票に至る経緯をプロジェクト管理チームに確認",
    "仕様変更依頼票の起票に至る経緯を利用部門に確認"
  ],
  "originalC": [
    "開発チーム1",
    "開発チーム2",
    "開発チーム3",
    "開発チーム1及び開発チーム2",
    "開発チーム1及び開発チーム3",
    "開発チーム2及び開発チーム3",
    "全ての開発チーム"
  ],
  "originalD": [
    19,
    23,
    190,
    230
  ],
  "originalE": [
    17,
    31,
    32,
    36
  ],
  "originalFG": [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8
  ],
  "originalH": [
    "計画1だけが実現可能である",
    "計画2だけが実現可能である",
    "両計画とも実現可能である",
    "両計画とも実現不可能である"
  ],
  "roles": {
    "プロジェクト管理チーム": "利用部門との依頼受渡し/担当PM・開発チームとの書類・情報取まとめ/変更管理会議の運営",
    "担当PM": "依頼票の確認/採否の判断/プロジェクト計画更新",
    "開発チーム": "依頼内容に基づく影響調査"
  },
  "procedure": [
    "利用部門が目的/内容/効果を記した依頼票をa1へ提出",
    "a1受付番号を記入し管理簿記録",
    "a2が妥当性確認し受領ならa3へ影響調査を依頼するようa1へ指示。受領しなければ理由を付けて返却するようa1へ指示",
    "プログラム開発以降の工程ではシステム全体への影響を迅速に把握するため全てのa3へ依頼",
    "a3は自チームの機能への影響/追加変更設計ページ数/対象プログラム/開発規模等を調査し回答",
    "a1が取まとめ、利用部門/a2/影響するa3メンバの変更管理会議を開催",
    "担当PMが重要度/緊急性/納期遅延可能性/工数増/品質影響を総合評価し採否判断",
    "管理チームが結果を利用部門へ回答",
    "採用なら担当PMがb"
  ],
  "calendar": {
    "weeksPerMonth": 4,
    "stageMonths": {
      "設計": [
        1,
        2
      ],
      "プログラム開発": [
        3,
        6
      ],
      "結合試験": [
        7,
        8
      ],
      "総合試験": [
        9,
        10
      ]
    },
    "requestWeek": 13,
    "additionalStartWeek": 17,
    "plan1SystemStartWeek": 33,
    "plan2SystemStartWeek": 37,
    "plan2IntegrationDeadlineEndWeek": 36,
    "projectEndWeek": 40
  },
  "functionL": {
    "sizeKsteps": 400,
    "additionalPercent": 10,
    "originalProgramUnchanged": true,
    "team": 1,
    "otherTeams": {
      "M": 2,
      "N": 3
    },
    "productivityKstepsPerPersonMonth": {
      "設計": 10,
      "プログラム開発": 4,
      "結合試験": 8,
      "総合試験": 10
    },
    "originalPersonMonths": {
      "設計": 40,
      "プログラム開発": 100,
      "結合試験": 50,
      "総合試験": 40
    }
  },
  "checkedOn": "2026-10-21",
  "questionSha256": "bfd415139913f156ea36b5de5f3d8a6fba7efd721b67c1be12ec45cc693df0dd",
  "answerSha256": "8085576c2b5d6db18c9b9ecb00c7b0b9b120eb2be8ac977961b4c81e8c3a52d8",
  "parts": [
    {
      "id": "a",
      "choices": 4,
      "subquestion": 1,
      "answer": "エ"
    },
    {
      "id": "b",
      "choices": 4,
      "subquestion": 1,
      "answer": "イ"
    },
    {
      "id": "c",
      "choices": 7,
      "subquestion": 2,
      "answer": "キ"
    },
    {
      "id": "d",
      "choices": 4,
      "subquestion": 2,
      "answer": "ア"
    },
    {
      "id": "e",
      "choices": 4,
      "subquestion": 2,
      "answer": "ウ"
    },
    {
      "id": "f",
      "choices": 8,
      "subquestion": 2,
      "answer": "オ"
    },
    {
      "id": "g",
      "choices": 8,
      "subquestion": 2,
      "answer": "エ"
    },
    {
      "id": "h",
      "choices": 4,
      "subquestion": 2,
      "answer": "イ"
    }
  ],
  "productivities": [
    [
      4,
      5,
      8,
      10
    ],
    [
      8,
      5,
      10,
      20
    ]
  ],
  "aRoles": [
    "プロジェクト管理チーム",
    "担当PM",
    "開発チーム"
  ],
  "bFacts": [
    {
      "correct": false,
      "reason": "影響調査は採否決定に先行し、採用された変更の計画反映とは異なる。"
    },
    {
      "correct": true,
      "reason": "担当PMが採用済み変更を計画へ反映して更新する役割を持つ。"
    },
    {
      "correct": false,
      "reason": "管理チームへの起票経緯の確認は計画更新を行わない。"
    },
    {
      "correct": false,
      "reason": "利用部門への起票経緯の確認は計画更新を行わない。"
    }
  ],
  "cTeamSets": [
    [
      1
    ],
    [
      2
    ],
    [
      3
    ],
    [
      1,
      2
    ],
    [
      1,
      3
    ],
    [
      2,
      3
    ],
    [
      1,
      2,
      3
    ]
  ],
  "hPossibilities": [
    [
      true,
      false
    ],
    [
      false,
      true
    ],
    [
      true,
      true
    ],
    [
      false,
      false
    ]
  ],
  "materials": {
    "status": "reviewed_IPA_educational_use_candidate_only",
    "notes": "原p30のIPA作問の役割/背景/手順前半、p31の全手順後半とa組合せ表、p32のb4択/工程月図/調査依頼、p33の全4行生産性/工数表と全注記/2計画、p34のc〜h全群/採用結末を画像で個別確認。原5頁を隣接問のない大問全頁として保持する。第三者の引用/図表/規格本文や外部文献の出典を特定していない。個々の文の短さや©表示の不在だけで許諾を推定していない。共通擬似言語/CASL/JIS符号表/Java API等の付録は不要で同梱しない。この判断を他大問/付録へ拡張しない。IPA FAQの教育利用・出典/改変明示の条件をGit同梱/ブラウザ表示/数値差替えと独自作図へ適用するプロジェクト判断であり、第三者著作物全体の包括許諾ではない。独自解説/実装はrights-original。外部問い合わせなし。",
    "pages": [
      {
        "page": 30,
        "scope": "背景/役割/手順1〜3前半"
      },
      {
        "page": 31,
        "scope": "手順3後半〜8/a全4行"
      },
      {
        "page": 32,
        "scope": "b全4択/図1全軸/設問2条件"
      },
      {
        "page": 33,
        "scope": "表1全4工程/生産性/当初工数/計画/前提"
      },
      {
        "page": 34,
        "scope": "設問2続き/c〜hの27固有択（全大問35固有/43参照）との対応"
      }
    ]
  },
  "numericReview": {
    "precision": "生産性1〜2桁整数、全当初工数20〜100/追加2〜10は整数。原の4工程表と3追加工数の四則演算、最少人数の切上げを維持。新丸めなし。",
    "dRoles": "基準19/23/190/230は追加前三工程/追加全工程/当初前三工程/当初全工程の合計と数値上対応する。原作者の誤答意図を確認したものではない。各生成条件で同じ範囲の数量を使い、選択肢最小間隔4を保持する。",
    "burden": "400又は40を4/5/8/10/20で割る。割算結果は整数であり、同じ原手順で解ける。f/gは原共用1〜8を保持する。",
    "limits": "受験者データによる難易度/識別力の統計的等価性は未評価。"
  },
  "capacity": {
    "raw": 16,
    "distinctD": 11,
    "maximumSameAnswer": 3,
    "precedingMinimum": 13,
    "limits": "基準入力を自動除外しない。直前の複合正答値と同じ条件を除く場合は13〜15条件。u種類の入力除外後16−u、有限全履歴で枯渇可能。128有限再試行の偶然失敗を保証しない。modern mixはlegacy除外、旧午後設定/実Run/seed samplerは共有統合後に検証する。"
  }
} as const;
