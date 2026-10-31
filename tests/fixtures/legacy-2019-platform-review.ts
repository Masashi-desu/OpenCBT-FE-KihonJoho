/** Nine unregistered sources in the103-injected-candidate checkpoint. Original
 * physical pages/crops and both answer pages personally viewed. */
export const legacy2019PlatformReview=[
 {source:"2019h31h-fe-am-4",page:4,answer:"ウ",capacity:3,roles:["行動への報酬","利用履歴から頻度予測","正解/誤りの教師情報","正解ラベルなし分類"],notes:"原ウは高解像画像でも『正誤を得る』。この表記を原択へ保持。原イの頻度予測だけでは学習方式を特定できないので正答対象へしない。"},
 {source:"2019h31h-fe-am-8",page:6,answer:"ア",capacity:4,roles:["同時呼出し","自己呼出し","再読込みなし再使用","主記憶配置先変更"],notes:"再入可能なら逐次再使用も可能な場合があるが、問いは記述した性質の名称。再使用の説明を同時干渉なしの保証へ広げない。"},
 {source:"2019h31h-fe-am-12",page:7,answer:"ウ",capacity:4,roles:["感熱紙へ印刷","立体物へ投影","立体造形","形状を3Dデータへ変換"],notes:"原アは高解像画像で『押し付けることによって』を確認。原ウの『熱溶解積層方式など』の例示限定を残す。"},
 {source:"2019h31h-fe-am-22",page:11,answer:"イ",capacity:4,roles:["AND","NAND","OR","XOR"],notes:"二入力A/B、一出力Xの内部空白の長方形図。4入力組全ての述語を保持し、原NANDはともに1のときだけ0。図を単独のゲート記号や解答前真理値表に置換しない。"},
 {source:"2019h31h-fe-am-35",page:16,answer:"ウ",capacity:3,roles:["RFID/物流IoT","配信サーバ配置","転送/制御の論理分離","業務分析/可視化"],notes:"OpenFlowを使うSDNという限定を保持。追加はCDNの配置計画とBPM支援であり、CDN全体の定義をサーバ最適配置手法だけとしない。RFIDの選択肢に対し原資料にない固有アーキテクチャ名を推定しない。"},
 {source:"2019h31h-fe-am-36",page:17,answer:"ア",capacity:4,roles:["人間判別","二方式の暗号組合せ","パケット取得解析","暗号の評価調査"],notes:"CAPTCHAは人間の判別であり本人性/常時安全の保証ではない。原のCRYPTREC役割を時点や組織名の推測で増やさない。"},
 {source:"2019h31h-fe-am-79",page:35,answer:"エ",capacity:4,roles:["複製","自動公衆送信","貸与","同一性保持"],notes:"原は著作者人格権を問う。追加で財産権全体を問うと三正答になるため具体的権利を対象へする。原四択の一般的分類と法律上の例外/適用対象を分ける。e-Gov API2で2019-04-21/2026-10-19を指定し、主文17/20/21/23/26の3を直接照合。5条の全文一致と20条2項等の例外を確認。"},
 {source:"2019r01a-fe-am-18",page:11,answer:"ウ",capacity:2,roles:["A→ready/B実行","A→blocked/B実行","B→ready/A実行","B→blocked/A実行"],notes:"優先度ベースのプリエンプティブなリアルタイムOS、二タスク、元はA>B。待ち状態と実行可能状態を混同せず、優先度反転だけを変える。"},
 {source:"2019r01a-fe-am-19",page:11,answer:"ウ",capacity:2,roles:["更新ありのみ/flag保持","全件/flagreset","更新ありのみ/flagreset","全件/flag保持"],notes:"最初は全件取得してOS管理の更新情報をresetする前提を原本文に保持。最初の全件以後の差分/直前以後の増分を独立シミュレーション。全件の二択を一意に区別できないので追加の対象にしない。"},
] as const;
export const legacy2019PlatformSources={
 checkedOn:"2026-10-19",status:"prepared_unregistered_candidates_pending_shared_integration",review:"原春物理4/6/7/11/12/16/17/35、秋物理11、対応する問別cropと両期解答p1を画像確認。春4/12は原PDF3倍拡大で文字を追加照合。原図22のA/B/X/空の箱/入出力線を保持。OCRだけで転記承認しない。",questionSha256:{spring:"55210d293f5fd96673cc1131acea3f8237209b4599d95d48bad02964abe62eb6",autumn:"4cd404654bb4f465befc78a3ac44c79bcd0f019b12b68f93a38d9836710c7cb0"},answerSha256:{spring:"0f871ce45cf3824b208591be14f7898b21bf4109b59aa82833d3693302f033df",autumn:"074c4437b57dc5ba96b6f87da90d4b2fa905d436f4c606690010e1262f32e4e0"},
 material:"原9問には第三者の引用注記や規格本文図表を特定しなかったが、注記がないことだけを許諾根拠としない。原問はIPA教育目的条件/出典/改変表示を前提に素材別判断を継続。以下の一次資料は事実検証用で、説明文/図表を転記する許諾と同一視しない。法律の条文と文化庁の説明文も区別する。",
 facts:[
 {url:"https://www.cs.cmu.edu/scs25/25things",checked:"16.CAPTCHAsで正式名を機関自身の記録から確認。人間判別の説明のみを独自に記述し、記事本文や写真は転載しない。"},
 {url:"https://www.cryptrec.go.jp/about.html",checked:"正式名Cryptography Research and Evaluation Committeesと評価/実装運用の活動を確認。現行の省庁/役職者名は2019問題へ追加しない。"},
 {url:"https://www.nist.gov/additive-manufacturing",checked:"立体物の積層造形と複数の造形方式を確認。熱溶解積層方式だけへ一般化しない。"},
 {url:"https://developers.cloudflare.com/reference-architecture/architectures/cdn/",checked:"配信拠点を利用者へ近付ける等の配信の考え方を一次検索本文で確認。現行の製品機能や図は転記しない。"},
 {url:"https://csrc.nist.gov/glossary/term/rfid",checked:"正式名Radio Frequency Identificationを確認。定義文の引用や規格表の転載に拡張しない。"},
 {url:"https://www.ibm.com/docs/en/baw/25.0.x?topic=overview-business-process-management",checked:"一次検索本文でBPM正式名と既存業務の分析/改善を確認。製品固有の説明文は転載しない。"},
 {url:"https://www.itu.int/en/action/broadband/documents/harnessing-iot-global-development.pdf",checked:"一次検索本文でInternet of ThingsとRFID等の関連技術を確認。IoTを物流用途へ限定せず、ITUの定義文/図は転記しない。"},
 {url:"https://developers.google.com/machine-learning/intro-to-ml/what-is-ml",checked:"supervised/unsupervised/reinforcementの各節で、ラベル/クラスタリング/報酬と方策を確認。生成AI等の現行説明や図は本問へ追加しない。"},
 {url:"https://developers.google.com/machine-learning/intro-to-ml/supervised",checked:"ラベル付きデータと未知入力への予測の事実。教材の例や図はコピーしない。"},
 {url:"https://www.ibm.com/docs/en/zos/3.1.0?topic=modules-module-reusability",checked:"一次検索キャッシュでserialreuseとconcurrentreentrantの範囲を読めた。直接openは403。reentrantがserialreuseを含む場合と概念名を選ぶ原問の意図を分ける。"},
 {url:"https://www.ibm.com/docs/en/cobol-zos/6.3.0?topic=program-identifying-as-recursive",checked:"自己呼出しが前の呼出し中にも可能というrecursive属性の事実。特定COBOL仕様やオプションを一般のFE問題へ増やさない。"},
 {url:"https://opennetworking.org/sdn-definition/",checked:"転送と制御の分離及びOpenFlowの位置付け。SDN方式全てがOpenFlow必須という一般化をしない。"},
 {url:"https://www.ipa.go.jp/security/crypto/index.html",checked:"CRYPTREC暗号リストと評価等の活動。関係省庁の現行名を2019原問へ無条件追加しない。"},
 {url:"https://www.ipa.go.jp/security/10threats/eid2eo0000005231-att/yougoyashikumi_2025.pdf",checked:"人間によるアクセスを確かめるCAPTCHAの機能。2025の追加脅威や図を2019原問へ転載しない。"},
 {url:"https://www.bunka.go.jp/chosakuken/keiyaku_manual/1_1_1.html",checked:"人格権と複製/送信/貸与の分類を確認。保護期間50年などの古い記述は本問へ流用しない。"},
 {url:"https://www.bunka.go.jp/seisaku/bunka_gyosei/kibankyoka/faq/index.html?s=09",checked:"2023年時点FAQで17/20/21/23/26の3等の権利分類を確認。原原問時点と現在の法令本文は下記API2の時点指定で別途確認。"},
 {url:"https://laws.e-gov.go.jp/law/345AC0000000048",checked:"web抽出は本文0行。このHTMLのweb抽出で全文を読めたとはしない。API2の時点指定で対象条文を直接取得し確認した事実とは区別。"},
 {url:"https://www.freertos.org/media/2018/161204_Mastering_the_FreeRTOS_Real_Time_Kernel-A_Hands-On_Tutorial_Guide.pdf",checked:"2018教材Table15のpreemption/ready/runningの事実を一次検索キャッシュで確認。一般の二タスク条件と製品のSMP/タイムスライス等を区別。"},
 {url:"https://www.ibm.com/think/topics/backup-and-restore",checked:"Incremental/Differential節で直前の取得/最後の全件以後という範囲を確認。OS更新情報のflag処理は原問が明示する条件を独立にシミュレーションし、製品一般の必須実装と断定しない。"},
 ],
 limits:"全30条件の意味/解説テスト、図22、用語、staging、隔離SSR表示を確認。法令版の対象5条は時点指定で一次確認済み。103/186は未登録準備候補であり、共有生成/原問/base/mix/run保存/用語lookup統合と残83問/大問は未完。春23/77と素材41/51/67も全186に保持する。",
} as const;

export const legacy2019PlatformCopyrightReview={
  "asofVersions": [
    {
      "date": "2019-04-21",
      "url": "https://laws.e-gov.go.jp/api/2/law_data/345AC0000000048?asof=2019-04-21",
      "revisionId": "345AC0000000048_20190401_430AC0000000039",
      "sha256": "96e0f7655580fedadc22b2013f442e99f1b5ceb25fdd63142ce8527abce86336",
      "enforcedFrom": "2019-04-01"
    },
    {
      "date": "2026-10-19",
      "url": "https://laws.e-gov.go.jp/api/2/law_data/345AC0000000048?asof=2026-10-19",
      "revisionId": "345AC0000000048_20260624_508AC0000000048",
      "sha256": "62cb548beb0a9b3cda78933b942c2df3e1456adc6911290b21aa137b74c73deb",
      "enforcedFrom": "2026-06-24"
    }
  ],
  "articles": [
    "17",
    "20",
    "21",
    "23",
    "26_3"
  ],
  "allFiveFullTextsIdentical": true,
  "review": "主文を取得し17の人格権/財産権の区分、20の同一性保持と2項の例外、21複製、23自動公衆送信を含む公衆送信、26の3映画の著作物等の除外を直接確認。人格権や財産権の存在を全行為の無条件禁止へ一般化しない。法令13の法令等に関する区分を別確認し、文化庁等の解説文の転載根拠とは混同しない。",
  "cachedSource": "output/source-import/legacy-2019/platform-pending/copyright-article-review.json",
  "runtime": "この法令本文を問題データから実行せず、査読した意味分類の根拠に用いる。"
} as const;

export const legacy2019PlatformCrops=[
  {
    "source": "2019h31h-fe-am-4",
    "page": 4,
    "path": "output/source-import/legacy-2019/2019h31h-fe-am/question-crops/q04.webp",
    "pixelRect": [
      46,
      91,
      735,
      453
    ],
    "width": 689,
    "height": 362,
    "sha256": "caa8cfe582924637864907b2dfe5d81210d664362cdd817f69374a40c5be3b14",
    "review": "full_page_and_isolated_crop_visually_reviewed_no_adjacent_question_material"
  },
  {
    "source": "2019h31h-fe-am-8",
    "page": 6,
    "path": "output/source-import/legacy-2019/2019h31h-fe-am/question-crops/q08.webp",
    "pixelRect": [
      46,
      620,
      735,
      827
    ],
    "width": 689,
    "height": 207,
    "sha256": "9edd9763078db73abd7d19c362baecc026b9493b665f0ee69388e16bbdfea324",
    "review": "full_page_and_isolated_crop_visually_reviewed_no_adjacent_question_material"
  },
  {
    "source": "2019h31h-fe-am-12",
    "page": 7,
    "path": "output/source-import/legacy-2019/2019h31h-fe-am/question-crops/q12.webp",
    "pixelRect": [
      46,
      663,
      735,
      1001
    ],
    "width": 689,
    "height": 338,
    "sha256": "11380f54649e68a2d2f99eddae4b5954b2209fe4b5559005e6177fab22a38ce7",
    "review": "full_page_and_isolated_crop_visually_reviewed_no_adjacent_question_material"
  },
  {
    "source": "2019h31h-fe-am-22",
    "page": 11,
    "path": "output/source-import/legacy-2019/2019h31h-fe-am/question-crops/q22.webp",
    "pixelRect": [
      46,
      659,
      735,
      1001
    ],
    "width": 689,
    "height": 342,
    "sha256": "f9c56abc477a2d33eb4c212f010bbeefd63ebbaed32068cb8bc89877fe971da7",
    "review": "full_page_and_isolated_crop_visually_reviewed_no_adjacent_question_material"
  },
  {
    "source": "2019h31h-fe-am-35",
    "page": 16,
    "path": "output/source-import/legacy-2019/2019h31h-fe-am/question-crops/q35.webp",
    "pixelRect": [
      46,
      436,
      735,
      1001
    ],
    "width": 689,
    "height": 565,
    "sha256": "9dce04f741ecd6142008a1c8aecab32584a3182ffb60814546c80ed8f4649192",
    "review": "full_page_and_isolated_crop_visually_reviewed_no_adjacent_question_material"
  },
  {
    "source": "2019h31h-fe-am-36",
    "page": 17,
    "path": "output/source-import/legacy-2019/2019h31h-fe-am/question-crops/q36.webp",
    "pixelRect": [
      46,
      90,
      735,
      422
    ],
    "width": 689,
    "height": 332,
    "sha256": "8b9344d604842b506808531651409e315870b24dd8316357da3578b29b9799f7",
    "review": "full_page_and_isolated_crop_visually_reviewed_no_adjacent_question_material"
  },
  {
    "source": "2019h31h-fe-am-79",
    "page": 35,
    "path": "output/source-import/legacy-2019/2019h31h-fe-am/question-crops/q79.webp",
    "pixelRect": [
      46,
      84,
      735,
      330
    ],
    "width": 689,
    "height": 246,
    "sha256": "411e0358a8d9ab8e654dfecca05f6284f39421864191748abef83606459a0a1a",
    "review": "full_page_and_isolated_crop_visually_reviewed_no_adjacent_question_material"
  },
  {
    "source": "2019r01a-fe-am-18",
    "page": 11,
    "path": "output/source-import/legacy-2019/2019r01a-fe-am/question-crops/q18.webp",
    "pixelRect": [
      46,
      87,
      735,
      390
    ],
    "width": 689,
    "height": 303,
    "sha256": "fdfa8d8f83be68368bea0aa60feaedb4d61304f0dc22821908df80469d888423",
    "review": "full_page_and_isolated_crop_visually_reviewed_no_adjacent_question_material"
  },
  {
    "source": "2019r01a-fe-am-19",
    "page": 11,
    "path": "output/source-import/legacy-2019/2019r01a-fe-am/question-crops/q19.webp",
    "pixelRect": [
      46,
      390,
      735,
      1001
    ],
    "width": 689,
    "height": 611,
    "sha256": "3258fde654584ff06c747eada14f758aad9d74ba40a798e2029cc2cc8bbd4b4e",
    "review": "full_page_and_isolated_crop_visually_reviewed_no_adjacent_question_material"
  }
] as const;
