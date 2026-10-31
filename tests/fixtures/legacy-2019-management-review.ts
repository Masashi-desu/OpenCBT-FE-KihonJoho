/** Independent image review of physical p15 and p22–28, official answer p1.
 * Q51 is deliberately metadata-only until its quoted standard text is cleared. */
export const legacy2019ManagementSource={collection:"2019h31h-fe-am",checkedOn:"2026-10-19",listing:"https://www.ipa.go.jp/shiken/mondai-kaiotu/2019h31.html",policy:"https://www.ipa.go.jp/shiken/faq.html",questionSha256:"55210d293f5fd96673cc1131acea3f8237209b4599d95d48bad02964abe62eb6",answerSha256:"0f871ce45cf3824b208591be14f7898b21bf4109b59aa82833d3693302f033df",answerPage:1,
 reviewMethod:"原物理15/22/23/24/25/26/27/28と解答p1を画像確認。31と50/52/56/58/60〜64の切出し全本文/全選択肢/上下境界を目視。原問51本文は本fixtureへ転載しない。OCRは検索補助。",
 rights:{ipa:"IPAの事例問題と公式正答。FAQの教育目的利用条件に従い問題別出典/改変を表示。隣接問51の素材は切出しへ含めない。",thirdParty:"Q60は経済産業省基準の名称を参照する監査事例。原四択を、一次検索で読めた同基準12.3の管理目的・取得/試験・保管の表現と比較した範囲では、条文そのものではなくIPAの監査事例と判断。基準の全PDFは403で直接取得できず、版の表紙/物理ページ画像/hashを確認できていないため、全条文との完全一致照合済みとはしない。原Aは担当と手順を定めた個別状況、Bは媒体からDBを復旧する個別試験、Cは倉庫会社との契約、Dはサーバ近傍という不適切な保管状況であり、読めた一般管理要求の条文を引用符付きで再録した構成ではない。とりわけCの全表現が基準の他箇所にもないと完全保証するものではない。基準PDFの図表・本文画像は同梱しない。規格名だけを理由に許諾未確認とはしない。",explanation:"参照資料は事実照合のみ。第三者の説明文・仕様書・図表を転載しない。独自解説はrights-original。",limits:"Q51の規格本文らしい段落、Q41、CASL/Java付録へ許諾を拡張しない。外部問い合わせなし。年度と共有登録は未完了。"},
 facts:[
 {id:"ajax",url:"https://developer.mozilla.org/en-US/docs/Glossary/AJAX",supports:"非同期要求で全ページの再読込なしに一部更新。名称にXMLを含むがXML必須ではない。"},
 {id:"css",url:"https://www.w3.org/Style/CSS/Overview.en.html",supports:"Cascading Style Sheets、文書の色/字体/間隔等の表示。"},
 {id:"rss",url:"https://www.rssboard.org/rss-specification",supports:"RSS2.0のReally Simple Syndicationと更新情報の配信。版ごとの略語差を保つ。"},
 {id:"sns",url:"https://www.ipa.go.jp/archive/files/000010376.pdf",supports:"IPAのWebコミュニケーション調査資料にSNS=Social Networking Service。正式名の事実のみ照合し資料本文や図を再録しない。"},
 {id:"pdm",url:"https://support.microsoft.com/en-gb/project/link-tasks-in-a-project?nochrome=true",supports:"SS/FS/FF/SFは起点と依存先の開始終了事象の対。開始終了では後続の終了が先行の開始に依存。名称の登場順は方向の根拠でない。"},
 {id:"test",url:"https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf",supports:"テスト目的と機能/非機能/統合の区別。移行の具体的切替え手順はIPA原56本文と全択から独立に確認。"},
 {id:"audit",url:"https://www.ipa.go.jp/shiken/syllabus/ps6vr7000000ivab-att/syllabus_au_ver5_0.pdf",supports:"監査意見を裏付ける証拠・インタビューと記録。監査実務を実運用の担当から区別。"},
 {id:"backup",url:"https://www.meti.go.jp/policy/netsecurity/downloadfiles/IS_Management_Standard_H28.pdf",supports:"平成28年版12.3のデータ損失からの保護/バックアップ方針に基づく取得・テスト、遠隔保管等。直接PDF取得は403だったため検索で提供された公式URL本文の該当条項を読む範囲に限定。PDF全体の画像査読とは記録しない。"},
 {id:"offsite",url:"https://www.keishicho.metro.tokyo.lg.jp/kurashi/cyber/security/bkup.html",supports:"火災や地震等のためデータ/媒体を別の場所にも保管する考え方。"},
 {id:"ea",url:"https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000003ojp-att/youkou_ver1_4.pdf",supports:"EAを業務/データ/アプリケーション/技術の四観点へ分ける試験範囲。各説明は原61全択と独立の意味対応資料で固定。"},
 {id:"cloud",url:"https://csrc.nist.gov/pubs/sp/800/145/final",supports:"On-demand self-serviceによる利用者からの資源要求/割当て。"},
 {id:"pod",url:"https://canon.jp/biz/solution/finance/lineup/for-commercial-banks/prospectus-print",supports:"必要な時に必要部数のみを印刷するオンデマンド提供の実例。文書・図は同梱しない。"},
 {id:"bi",url:"https://www.ibm.com/think/topics/business-intelligence",supports:"意思決定にデータを分析。内部・外部データを用いうるため、外部情報であれば一律BIではないという説明を拒否。"},
 ],
} as const;
export const legacy2019ManagementReview=[
 {number:50,page:22,answer:"ア",capacity:4,reference:0,fixed:false,roles:["非同期更新","表示スタイル","更新情報","利用者間交流"],notes:"4名称と説明から選ぶ形式を維持。"},
 {number:52,page:23,answer:"エ",capacity:4,reference:0,fixed:false,roles:["受付開始→試験開始30分","受付終了→試験開始10分","受付終了→試験終了45分","試験開始→受付終了20分"],notes:"SFは試験の開始が起点。受付を常に先行と置かない。四ラグ全て原値。"},
 {number:56,page:25,answer:"ア",capacity:4,reference:0,fixed:false,roles:["切替え手順","性能","外部システムとのインタフェース","要求全機能"],notes:"主要な目的の4説明。実データcopyだけで移行としない。"},
 {number:58,page:26,answer:"ア",capacity:3,reference:0,fixed:true,roles:["裏付け証拠","監査人の運用介入","知識以外で面談者を選定","複数/記録確認回避"],notes:"最も適切、証拠裏付け固定。その他の実不適切条件を変える。"},
 {number:60,page:27,answer:"エ",capacity:4,reference:0,fixed:false,roles:["取得手順と担当","復旧試験","外部保管の合意","同時被災防止"],notes:"指摘すべき不備を選ぶ。原以外は適切な他三条件を明示。基準名と条文転載を区別。"},
 {number:61,page:27,answer:"イ",capacity:4,reference:0,fixed:false,roles:["データ","アプリケーション","技術","業務"],notes:"EAの観点から説明を選ぶ四択を維持。"},
 {number:62,page:27,answer:"エ",capacity:3,reference:0,fixed:false,roles:["購入済み媒体","部数予測先行印刷","定刻配信","要求時提供"],notes:"映像配信/受注印刷/資源割当で提供機構を変える。正答の番号ではなく内容が変わる。"},
 {number:63,page:28,answer:"イ",capacity:3,reference:0,fixed:true,roles:["競合情報の収集","膨大蓄積データ分析","学習","手続遂行"],notes:"広義BIで競合情報も使える限界を明示。原のデータ分析趣旨を固定して反転しない。"},
 {number:64,page:28,answer:"イ",capacity:4,reference:3,fixed:false,roles:["個々/定期","個々/即時","全体/定期","全体/即時"],notes:"2×2表の全見出し・a〜d位置と対象太枠を保持。対象だけを四セル間で変更。"},
].map(r=>({...r,source:`2019h31h-fe-am-${r.number}`,precision:"数値計算/丸めなし。文章4択。Q52の分単位四値とQ64の前月/翌月/月/現在を原の役割で維持。"}));
export const legacy2019ManagementPendingMaterial={source:"2019h31h-fe-am-51",page:23,status:"pending",reason:"二つの目的段落がJIS Q21500:2018の4.3.11/4.3.14に対応する可能性。規格名だけの参照とは区別し、本文の再利用根拠が未確定。原文章はtrackedのproduction/fixtureへ投入しない。",scope:"186件に残し、素材確認後に原形式・生成器・独立検証を揃える。永久除外ではない。"} as const;

/** Pixel rectangles/hash are metadata from image output, not OCR text approval. */
export const legacy2019ManagementCrops=[
  {
    "source": "2019h31h-fe-am-31",
    "pixelRect": [
      46,
      453,
      735,
      630
    ],
    "width": 689,
    "height": 177,
    "sha256": "fbb0f60484a88e579aaba0e3ae85b4527016e9881bd60dee045c895b376f2c65"
  },
  {
    "source": "2019h31h-fe-am-50",
    "pixelRect": [
      46,
      571,
      735,
      1001
    ],
    "width": 689,
    "height": 430,
    "sha256": "942206ce021635943740d6b69b62de5fe2011417ff01a4d293903d73a44b2583"
  },
  {
    "source": "2019h31h-fe-am-52",
    "pixelRect": [
      46,
      445,
      735,
      1001
    ],
    "width": 689,
    "height": 556,
    "sha256": "b771f43c82336d4ac1c3f334628559e9e82ee9edfacb32226d8242c602a0af42"
  },
  {
    "source": "2019h31h-fe-am-56",
    "pixelRect": [
      46,
      418,
      735,
      748
    ],
    "width": 689,
    "height": 330,
    "sha256": "907fc7fb2c2e5b59c894a41d2aa07fd20313d5d8d3f64f857f4e8188cb0c644d"
  },
  {
    "source": "2019h31h-fe-am-58",
    "pixelRect": [
      46,
      88,
      735,
      481
    ],
    "width": 689,
    "height": 393,
    "sha256": "f5cc1895acad52a9d74b7c403f786534940a7fe2b1c958f73d3d7b8a8f88b207"
  },
  {
    "source": "2019h31h-fe-am-60",
    "pixelRect": [
      46,
      88,
      735,
      511
    ],
    "width": 689,
    "height": 423,
    "sha256": "4fb85af125c914701d0b749aa30790c251be094ce5ac1f2d16ef47a4d272527b"
  },
  {
    "source": "2019h31h-fe-am-61",
    "pixelRect": [
      46,
      511,
      735,
      783
    ],
    "width": 689,
    "height": 272,
    "sha256": "78d717b8e2206d756178f7ee30495b2bd366b8383ce6b16f8f7ace4471565382"
  },
  {
    "source": "2019h31h-fe-am-62",
    "pixelRect": [
      46,
      783,
      735,
      1001
    ],
    "width": 689,
    "height": 218,
    "sha256": "0ef7b77f37a115623cfb599880772def406ad5b8520ac9b896948088a01eadbc"
  },
  {
    "source": "2019h31h-fe-am-63",
    "pixelRect": [
      46,
      87,
      735,
      453
    ],
    "width": 689,
    "height": 366,
    "sha256": "d19bd91f05ce9771c7a8faecebd82110fd072a9dbb58a72a1336cfa8bd56dcbf"
  },
  {
    "source": "2019h31h-fe-am-64",
    "pixelRect": [
      46,
      453,
      735,
      1001
    ],
    "width": 689,
    "height": 548,
    "sha256": "336504aea8c61098ccb95bf0ededd44c18a3a207fa5fce4d79277e605246f3de"
  }
];
