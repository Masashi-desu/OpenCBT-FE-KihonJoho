/** Original images p17–21 and all ten isolated crops visually reviewed.
 * The answer letters below are independently transcribed from official ans p1. */
export const legacy2019SecuritySource={
  collection:"2019h31h-fe-am",checkedOn:"2026-10-19",listing:"https://www.ipa.go.jp/shiken/mondai-kaiotu/2019h31.html",policy:"https://www.ipa.go.jp/shiken/faq.html",
  questionSha256:"55210d293f5fd96673cc1131acea3f8237209b4599d95d48bad02964abe62eb6",answerSha256:"0f871ce45cf3824b208591be14f7898b21bf4109b59aa82833d3693302f033df",answerPage:1,
  reviewMethod:"原物理p17/18/19/20/21と公式正答p1を画像確認。10問の安全crop全ての本文/全択/上下境界も目視。OCRは検索補助。Q41のJIS定義は問42/43のcropへ含めない。",
  rights:{ipa:"本文・選択肢・原画像のIPA作問部分と公式答は、教育教材のFAQ条件で同梱/表示/改変を判断。原問単位の出典と改変表示を保持。",thirdParty:"問42イはFSA2011内部統制基準『情報と伝達』定義と対応する編集表現。IPA部分とは別の素材/right/sourceで管理し、全体をIPA独自文とは扱わない。",explanation:"独自説明。RFC/W3C/NIST/OMG/ISTQB/METI/IPA資料は事実の検証に用い、説明文・規格図表・仕様全文を転載しない。",limits:"問41のJIS素材、他年度の引用文、CASL/Java付録への許諾を推定しない。外部問い合わせなし。共有登録と実アプリ統合は未完。"},
  facts:[
    {id:"attacks",url:"https://www.ipa.go.jp/security/10threats/ps6vr7000000becd-att/10threats2013.pdf",supports:"原37の辞書/全組合せ/漏えい認証対。逆総当たりはpassword固定/ID総当たりの原説明から区別。"},
    {id:"ecc",url:"https://www.rfc-editor.org/info/rfc5349/",supports:"古典計算機に対する同等強度のECC/RSA鍵長比較。量子耐性・情報理論的不能証明とは別。"},
    {id:"ecc-key",url:"https://csrc.nist.gov/Projects/elliptic-curve-cryptography",supports:"公開鍵暗号としての署名/鍵確立と秘密値管理。"},
    {id:"financing",url:"https://www.meti.go.jp/policy/economy/keiei_innovation/sangyokinyu/g60630a02j.pdf",supports:"2006年リスクファイナンス報告の資金準備。保有の準備金/コミットメントライン、移転の保険。支出全般と混ぜず融資の返済も区別。"},
    {id:"triangle",url:"https://www.ipa.go.jp/security/10threats/ps6vr70000009r2f-att/kaisetsu_2023.pdf",supports:"機会/動機・圧力/正当化の意味。単独で必ず不正が発生する因果保証とはしない。"},
    {id:"fsa-2011",url:"https://www.fsa.go.jp/singi/singi_kigyou/tosin/20110330/01.pdf",supports:"2019以前の2011-03-30版、物理17（下段印刷11、本文5）及び49（印刷42、本文11）で情報と伝達定義を画像照合。"},
    {id:"ipsec-name",url:"https://csrc.nist.gov/glossary/term/ipsec",supports:"IP Security及びInternet Protocol Securityの正式名を掲載。本候補はIP Security表記に統一。"},
    {id:"w3c",url:"https://www.w3.org/press-releases/2002/xenc/",supports:"World Wide Web Consortiumの略語とXML暗号の発行主体。"},
    {id:"ipsec",url:"https://www.rfc-editor.org/info/rfc4301/",supports:"3.1/3.2 IP層、Authentication Header/Encapsulating Security Payload。AHだけが機密性を提供するとはしない。"},
    {id:"smime",url:"https://www.rfc-editor.org/info/rfc5751/",supports:"S/MIMEのMIMEデータと署名/暗号化。電子メールの形式は対象データ。"},
    {id:"ssh",url:"https://www.rfc-editor.org/info/rfc4251/",supports:"暗号化したremote loginとSecure Shellの正式名。"},
    {id:"xml",url:"https://www.w3.org/TR/xmlenc-core1/",supports:"XML全体/要素/内容を暗号化し記述する対象。"},
    {id:"dmz",url:"https://csrc.nist.gov/glossary/term/dmz",supports:"外部と内部を分離するperimeter networkとDemilitarized Zone。"},
    {id:"honeypot",url:"https://csrc.nist.gov/glossary/term/honeypot",supports:"intruderを誘引するおとり。本文翻訳の転載はしない。"},
    {id:"siem",url:"https://csrc.nist.gov/glossary/term/security_information_and_event_management_tool",supports:"Security Information and Event Management、複数componentのsecurity data収集。ログ相関はIPA原45でも確認。"},
    {id:"fuzz",url:"https://www.ipa.go.jp/security/vuln/fuzzing/contents.html",supports:"異常になり得る入力を多数送り挙動から脆弱性を検出。自動修復保証ではない。"},
    {id:"uml",url:"https://www.omg.org/spec/UML/2.5.1",supports:"2017年12月版の活動/相互作用/状態/ユースケースの機能の事実。規格の図/本文は同梱しない。"},
    {id:"testing",url:"https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf",supports:"3.1/4.1/6.1静的解析と実行、black-box外部仕様/white-box内部構造、ツール種別。原2019に新しい試験形式を遡及させない。"},
  ],
} as const;
export const legacy2019SecurityReview=[
  {number:37,page:17,answer:"ウ",capacity:3,fixed:false,roles:["辞書語","パスワード総当たり","漏えい認証対","ID総当たり"],notes:"原利用者の使い回し/ID固定/候補定義を全4択に保持。辞書・全候補・漏えい組で問いの対象を変更。"},
  {number:39,page:18,answer:"ア",capacity:3,fixed:true,roles:["RSAとの鍵長比較","共通鍵の誤認","解読不能の過大保証","秘密鍵管理の逆転"],notes:"同水準/短い鍵という原A固定、誤った方式/鍵空間/公開範囲の実条件を変える。新規では正答だけが最短/最長とならない。"},
  {number:40,page:18,answer:"ア",capacity:3,fixed:false,roles:["事故後資金","予防","廃止による回避","被害低減"],notes:"financingの方向固定。保険移転/積立保有/融資枠準備は資金の賄い方が異なる。番号固定でも正答内容が変わる。原以外で正答だけが最長になるcueを避ける。"},
  {number:42,page:19,answer:"ア",capacity:3,fixed:true,roles:["機会の正しい定義","非triangle要素","動機を正当化と呼ぶ","正当化を動機と呼ぶ"],notes:"三要素全てという原本文を保持。イは定義が正しくても集合外、ウ/エは名称と意味の対応が誤りという二段判定。FSA素材を別rightsで保持。新規の長さは正答だけ最長にしない。"},
  {number:43,page:19,answer:"ア",capacity:4,fixed:false,roles:["IPsec","S/MIME","SSH","XML暗号"],notes:"原のネットワーク層/二プロトコルを基準で保持。mail/remote/XMLではその実対象条件を表示。OSIはnetworkのscopeで継承しAM20団体との混同を拒否。"},
  {number:44,page:20,answer:"ウ",capacity:4,fixed:false,roles:["DMZ","SIEM","おとり","botnet"],notes:"原アDMZを画像確認。侵入者・malware調査という原の状況を基準に保持し、各候補は機能を変える。"},
  {number:45,page:20,answer:"イ",capacity:3,fixed:false,roles:["自動修正","脆弱性検出","複数ログ相関","ID政策"],notes:"効果を選ぶ方向固定。fuzzingから検出後の修正まで保証しない。自動修復を名前だけで正答にする条件は含めない。"},
  {number:46,page:20,answer:"ア",capacity:4,fixed:false,roles:["制御フロー","相互作用時系列","機能とactor","状態遷移"],notes:"原の4振る舞い説明の役割を保持。図を問う元の文章へ図や対応表を追加しない。"},
  {number:47,page:21,answer:"イ",capacity:3,fixed:true,roles:["構造網羅基準","外部同値の冗長コード","内部実行観測","内部経路組合せ"],notes:"最も適切/black固定。原エをあらゆる場合に偽とはしない。原基準の最短正答は保持。新規は誤答の不要な冗長化を避け、正答だけが長短で突出しない。誤答変更は内部の判定機構を実際に変える。"},
  {number:48,page:21,answer:"ウ",capacity:4,fixed:false,roles:["入力生成","動的coverage","静的source解析","動的profile"],notes:"対象機能と静的/動的の修飾を同じ条件から更新。全論理誤り検出/全正しさ保証を推定しない。"},
].map(r=>({...r,source:`2019h31h-fe-am-${r.number}`,reference:0,precision:"数値計算/丸めなし。全4択/文章形式。別のただし/なお注記なし。原の条件を全択とともに保持。"}));
export const legacy2019FsaMaterialReview={
  sourceId:"source-fsa-internal-control-2011",rightsId:"rights-fsa-2011-information-communication",checkedOn:"2026-10-19",publisher:"金融庁／企業会計審議会",
  title:"財務報告に係る内部統制の評価及び監査の基準等の改訂について（意見書、平成23年3月30日）",publishedOn:"2011-03-30",url:"https://www.fsa.go.jp/singi/singi_kigyou/tosin/20110330/01.pdf",sha256:"62f682c2616bede3a1809044eb30381037fbfbcab5ff5722d09e25a90a208ea0",pages:[17,49],
  policy:"https://www.fsa.go.jp/rules/",policyUpdatedOn:"2025-10-09",terms:"https://www.digital.go.jp/resources/open_data/public_data_license_v1.0",
  originalRange:"2019春午前42イの『情報と伝達』の一文のみ。FSA原文の『ことを確保することをいう』に対して原択では『ようにすることである』と編集されている。IPAからの原画像を再録する場合もこの編集の由来を明記。FSA PDF画像は教材へ同梱しない。",
  finding:"2011原PDF表紙/物理17/49を目視、作成主体と該当定義及び周辺を確認。該当段落は企業会計審議会の基準本文であり、引用符・別の権利者/文献からの引用表示はない。理論の影響一般を特定の第三者文章の転載と同一視せず、この段落に適用可能なFSA公開条件を記録する。単なる©表示なしだけを根拠としない。",
  decision:"FSAの現行サイト利用ルール1によりPDL1.0に準拠。PDL1.0本文1で複製/公衆送信/翻案可、1.1(1)出典、1.1(2)加工/主体明記、1.2第三者権利、1.4logo等除外を確認。出典と加工の由来を素材別表示した教育教材の同梱/表示/改変へ適用する判断。2019当時の許諾を遡って推定せず、今回2026年の再利用に対する現行条件を使う。",
  limits:"金融庁の全資料又はCOSO等の原著作物への包括許諾ではない。別の第三者文言が判明すればこの素材の判定を再開する。外部問い合わせなし。親レビューと共有配布条件の統合待ち。",
  attribution:"出典：財務報告に係る内部統制の基準等（金融庁・企業会計審議会、平成23年3月30日）『情報と伝達』。IPA平成31年度春期午前問42イにおいて表現を編集。生成問題ではOpenCBTが再編集。",
} as const;

export const legacy2019SecurityCrops=[
  {
    "source": "2019h31h-fe-am-37",
    "pixelRect": [
      46,
      422,
      735,
      1001
    ],
    "width": 689,
    "height": 579,
    "sha256": "f7f81d1583284aaf71c598665930886c539b82f3d59a219e7e0e0eecd6f2eb0a"
  },
  {
    "source": "2019h31h-fe-am-39",
    "pixelRect": [
      46,
      325,
      735,
      571
    ],
    "width": 689,
    "height": 246,
    "sha256": "773329984e25753961b27fe8f3b051a5973212154cc13bf0f9176c01ab7953dd"
  },
  {
    "source": "2019h31h-fe-am-40",
    "pixelRect": [
      46,
      571,
      735,
      1001
    ],
    "width": 689,
    "height": 430,
    "sha256": "fc78c58b3c038789731845640a6672767b150f985ec87ed7fcee935bf0db1549"
  },
  {
    "source": "2019h31h-fe-am-42",
    "pixelRect": [
      46,
      357,
      735,
      746
    ],
    "width": 689,
    "height": 389,
    "sha256": "755bc817094ba559524c75af057beec0069c72313fc275253c9e8f6a7b161f42"
  },
  {
    "source": "2019h31h-fe-am-43",
    "pixelRect": [
      46,
      746,
      735,
      1001
    ],
    "width": 689,
    "height": 255,
    "sha256": "ca7fe93710d702c87031186ca0b9fbe5bcd83043d2163bc30b602bf7223395a5"
  },
  {
    "source": "2019h31h-fe-am-44",
    "pixelRect": [
      46,
      88,
      735,
      298
    ],
    "width": 689,
    "height": 210,
    "sha256": "ce52bcdb5bb4431226e22e2435fa8d4fe56ae1f33081e6784cdce93d7a007412"
  },
  {
    "source": "2019h31h-fe-am-45",
    "pixelRect": [
      46,
      298,
      735,
      542
    ],
    "width": 689,
    "height": 244,
    "sha256": "4ec16aa85c91bc3930fa6deef5d8d0c430981d322923df4ac5255994a63955fe"
  },
  {
    "source": "2019h31h-fe-am-46",
    "pixelRect": [
      46,
      542,
      735,
      1001
    ],
    "width": 689,
    "height": 459,
    "sha256": "8b7fc091403fa33850f40e198276dcd2085b586e79ddb4b20674971678845b12"
  },
  {
    "source": "2019h31h-fe-am-47",
    "pixelRect": [
      46,
      88,
      735,
      358
    ],
    "width": 689,
    "height": 270,
    "sha256": "0ef9a131ebae1c26c89c5f97a54ac41a278a4b1fa1d2b88df9bd7be484986907"
  },
  {
    "source": "2019h31h-fe-am-48",
    "pixelRect": [
      46,
      358,
      735,
      1001
    ],
    "width": 689,
    "height": 643,
    "sha256": "0811989d300e904bfc8816a3698789ca40851b0ada659a8dec3e4265672c7a7e"
  }
];
