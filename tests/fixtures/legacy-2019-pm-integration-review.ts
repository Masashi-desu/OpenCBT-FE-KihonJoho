/** Independent original-image and parent-approved finite-domain review. */
export const legacy2019PmIntegrationReview={
  "source": "2019h31h-fe-pm-7",
  "title": "製造業における情報システムの統合",
  "pages": [
    35,
    36,
    37,
    38
  ],
  "parts": [
    {
      "id": "a",
      "choices": 3,
      "answer": "ア",
      "subquestion": 1
    },
    {
      "id": "b",
      "choices": 5,
      "answer": "イ",
      "subquestion": 1
    },
    {
      "id": "c",
      "choices": 4,
      "answer": "ア",
      "unorderedWith": "d",
      "subquestion": 1
    },
    {
      "id": "d",
      "choices": 4,
      "answer": "ウ",
      "unorderedWith": "c",
      "subquestion": 1
    },
    {
      "id": "e",
      "choices": 4,
      "answer": "ウ",
      "subquestion": 2
    },
    {
      "id": "f",
      "choices": 4,
      "answer": "ウ",
      "subquestion": 2
    },
    {
      "id": "g",
      "choices": 4,
      "answer": "イ",
      "subquestion": 3
    }
  ],
  "sharedGroups": [
    "a",
    "b",
    "cd",
    "cd",
    "e",
    "f",
    "g"
  ],
  "originalA": [
    "A",
    "B",
    "C"
  ],
  "originalB": [
    2,
    3,
    4,
    5,
    6
  ],
  "originalCD": [
    "V",
    "W",
    "X",
    "Y"
  ],
  "originalE": [
    "19.0",
    "20.2",
    "21.7",
    "25.2"
  ],
  "originalF": [
    "6.0",
    "6.2",
    "7.7",
    "9.7"
  ],
  "originalG": [
    "Eシステムだけである",
    "Fシステムだけである",
    "Eシステム及びFシステムである",
    "ない"
  ],
  "premises": [
    "各工場は一つ以上の事業部の製品を製造",
    "表1の−は当該工場で当該事業部製品を製造していないこと",
    "同じシステム名なら複数事業部/工場が同一システムを共用する意味",
    "調達システムは在庫管理/発注を行い、その工場で製造する製品の事業部の設計/需要予測とデータ連携",
    "設計と需要予測の間にはデータ連携がない",
    "複数工場で共用する調達システムは同じ相手への連携経路を重複計上しない",
    "新規連携先も1経路年間0.1億円増加",
    "統合後も取扱高等前提は不変、共用システム費は単独利用時と同じ",
    "設問3は新規経路を作らずGの既存接続先を代替できるかを判定"
  ],
  "checkedOn": "2026-10-21",
  "questionSha256": "bfd415139913f156ea36b5de5f3d8a6fba7efd721b67c1be12ec45cc693df0dd",
  "answerSha256": "8085576c2b5d6db18c9b9ecb00c7b0b9b120eb2be8ac977961b4c81e8c3a52d8",
  "learningArea": "strategy",
  "materials": {
    "notes": "原p35の架空企業/製造条件/取扱高表の二段見出し・全7行/横線注記、p36のシステム配置2表全行と同名共用/連携条件、p37の全a/b/cd群と固定費/取扱高比例費/経路費/新経路も同額、p38の全e/f/g群と統合後不変/共有費同額/G代替の新経路禁止を画像で個別確認。第三者規格文/引用/外部図の出所を特定していない。短文又は権利注記の不在のみで許諾を推定していない。IPA FAQ教育利用条件を原画像同梱/ブラウザ表示/出典改変明示の派生へ適用するプロジェクト判断であり包括許諾ではない。原4頁のみを使い、共通擬似言語/CASL/JIS/Java付録は不要。他大問/付録へ適用を広げない。独自解説/実装はrights-originalで区別。外部問い合わせなし。"
  },
  "domain": {
    "raw": 27,
    "topologies": 9,
    "volumeFactors": [
      5,
      4,
      6
    ],
    "denominator": 5,
    "reference": [
      0,
      0
    ],
    "correctPayloads": 18,
    "maximumSameAnswer": 3,
    "minimumAfterPreviousAnswerExclusion": 24,
    "limit": "基準を自動除外しない。有限履歴/128有限再試行/未登録legacyRun/mix/choiceorderの容量保証は未完。"
  },
  "numericReview": {
    "e25_2": "4×2+4×3+4×1+12×0.1とも数値上等しい。設計側の複合誤モデルとして明示するが、公式作問者の誤答意図とは断定しない。",
    "f9_7": "統合後の正値7.7に設計固定費2.0を余分に足した値と等しいが公式意図とは断定しない。",
    "precision": "費用は小数第1位で0も維持。全7正セル2〜3桁整数。整数0.1億円/円で演算し追加丸めなし。正答誤答の最小差1.2（原1.5）、e全択最小1.0（原1.2）、f全択最小0.2（原0.2）。統計的難易度等価性は未測定。"
  }
} as const;
