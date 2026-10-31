/** Next batch: source images physical30–35, ten raw crops reviewed; nine candidates, Q67 material pending, official answer1
 * personally viewed. This fixture does not register or distribute the batch. */
export const legacy2019StrategySource={collection:"2019h31h-fe-am",checkedOn:"2026-10-19",questionSha256:"55210d293f5fd96673cc1131acea3f8237209b4599d95d48bad02964abe62eb6",answerSha256:"0f871ce45cf3824b208591be14f7898b21bf4109b59aa82833d3693302f033df",reviewMethod:"原物理30/31/32/33/34/35・公式答p1と問66/67/68/69/70/73/74/75/76/80のcropを画像確認。原77の図も読んだが、配置/ラベルだけの改変を生成容量とせず別途設計。OCRだけで転記しない。",listing:"https://www.ipa.go.jp/shiken/mondai-kaiotu/2019h31.html",policy:"https://www.ipa.go.jp/shiken/faq.html",
 rights:{ipa:"IPAの教育目的利用条件で、出典/改変を明記した学習用の原問・生成候補を準備する。",thirdParty:"Q67ウはHammer/ChampyのBPR定義の語順・要素と強く対応する可能性があり、原注記がないことだけで許諾を推定せず素材を保留。本実装へ原文・全択・生成定義を入れず、ignoredの原crop/全択/草稿から追跡する。他9問には原画像上の第三者引用注記や規格図表を特定しなかった。一般的な概念定義や組織名を用いることと、第三者の説明文そのものの転載を区別し、単に©表示なしだけを許諾根拠としない。将来実文の転載が判明した場合は素材判定を再開する。",limits:"新バッチは未登録の準備候補。共有のsourceKey/Run/ミックス/保存参照/用語は未統合。186全体/共有登録/配布完了ではない。原77の図条件や原79の法務問題を今回の未検証候補へ紛れ込ませない。"},
 facts:[
  {id:"requirements",url:"https://www.ipa.go.jp/archive/publish/qv6pgp0000000wrt-att/000079352.pdf",supports:"機能/非機能と業務の関連。非機能の検討にも業務の視点が関わるので、無関係と一般化しない。引用文や図は同梱しない。"},
  {id:"nonfunctional",url:"https://www.ipa.go.jp/digital/kaihatsu/link/planning.html",supports:"非機能要求の網羅的な項目分類と段階的な要求レベル。可用性/性能/拡張性/運用保守/移行の実品質条件を独立に分類。"},
  {id:"core",url:"https://www.jpo.go.jp/support/example/document/chizai_senryaku_2020/all.pdf",supports:"競争優位をもたらす自社能力としてのコアコンピタンスと、技術として支えるコア技術。政策本文は事実検証だけで転載しない。"},
  {id:"innovation",url:"https://www.meti.go.jp/policy/economy/jinzai/diversity/kigyo100sen/practice/pdf/130515_bestpractice.pdf",supports:"工程・方法の革新と製品の革新の区別。全ての製造委託を革新と扱わない。"},
  {id:"green",url:"https://www.env.go.jp/policy/hozen/green/g-law/net/index.html",supports:"環境負荷を考慮した製品・サービスの購入という行為。法令全文や特定物品の現行基準を問題へ追加しない。"},
  {id:"ietf",url:"https://www.ietf.org/about/introduction/",supports:"IETFの技術仕様・運用とRFCという成果。RFC全てがIETF発行又は標準とは限らない。"},
  {id:"rfc",url:"https://www.rfc-editor.org/series/rfc/",supports:"RFCには標準・仕様・手順・研究等の種類があり、全てがインターネット標準ではない。"},
  {"id":"metrics-roas","url":"https://support.google.com/google-ads/answer/6268637?hl=en","supports":"広告価値を広告費で割るROAS。原問のconversionは訪問者人数を分母とし、広告interactionへ置換しない。"},
  {"id":"metrics-ctr","url":"https://support.google.com/google-ads/answer/9451527?hl=en","supports":"広告表示に対するクリックの割合。人数と表示回数を混同しない。"},
  {"id":"metrics-views","url":"https://support.google.com/analytics/answer/13391283?hl=en","supports":"ページの繰返し表示を延べ回数として数える。"},
  {"id":"competitive-strategies","url":"https://www.jove.com/business-education/v/17325/designing-competitive-marketing-strategies","supports":"著者の教育説明でleader/challenger/follower/nicherの対象と行動を確認。企業規模のみで必然的に行動が決まるとしない。原文や事例は転載しない。"},
  {"id":"sharing","url":"https://www.digital.go.jp/policies/sharing_economy","supports":"遊休資産等の共有・貸借という仕組み。"},
  {"id":"smart-city","url":"https://www.mlit.go.jp/toshi/tosiko/toshi_tosiko_tk_000040.html","supports":"都市の管理・運営への技術活用。"},
  {"id":"omnichannel","url":"https://www.ibm.com/think/topics/omnichannel-customer-service","supports":"チャネルを連携した顧客接点という概念。"},
  {"id":"new-economy","url":"https://www.federalreserve.gov/boarddocs/speeches/2000/20000606.htm","supports":"当時の情報技術・生産性・物価に関する議論。現実の無条件の成長保証として説明しない。"},
  {"id":"digital-divide","url":"https://www.itu.int/en/mediacentre/backgrounders/Pages/skills-development-digital-economy.aspx","supports":"技術利用の機会・能力の差。"},
  {"id":"digital-signature","url":"https://csrc.nist.gov/glossary/term/digital_signature","supports":"作成者やデータの完全性の確認。内容の真実性の無条件保証とは異なる。"},
  {"id":"company","url":"https://news.panasonic.com/jp/press/data/2019/08/jn190830-11/jn190830-11-1.pdf","supports":"2019年の実企業一次資料による社内カンパニー。別会社化や特定の株式配分方式と混同しない。"},
  {"id":"ansi","url":"https://www.ansi.org/about/roles","supports":"ANSIは標準開発組織そのものとは異なり民間標準化の調整・承認等に関わる。"},
  {"id":"ieee","url":"https://europe.ieee.org/about/","supports":"IEEE公式Europe aboutのHistory of IEEE節に、1963年のAIEE/IRE統合による正式名成立が明記されていることを確認。Proceedings公式historyの1963節でも照合。本部aboutはrobots制限、ieee802の直接取得はtimeoutであり未読と区別。"},
  {id:"nist",url:"https://www.nist.gov/about-nist",supports:"National Institute of Standards and Technologyの名称と米国の計量・標準・技術研究。"},
 ],
} as const;
export const legacy2019StrategyReview=[
 {number:66,page:30,answer:"エ",capacity:3,roles:["業務手順/組織","アプリ機能","経営ニーズ/成果","基盤品質条件"],notes:"他三つの分類名を曖昧に入替えず原の非機能方向を固定。可用性/性能/拡張等から実際に求める品質条件を変更する。正答の番号が同じでも意味は変わる。"},
 {number:67,page:30,answer:"イ",capacity:4,roles:["経営資源統合","中核能力","業務プロセス再設計","他社比較"],notes:"四つの説明を原の役割で保持。強み自体/管理仕組み/抜本改革/比較行為という異なる概念を問う。"},
 {number:68,page:30,answer:"イ",capacity:4,roles:["上位へ対抗","狭い分野へ集中","追随","最大シェアの需要拡大"],notes:"特定顧客/特定製品segment/集中専門化を基準で保持。企業規模のみから必然的に戦略が定まるとしない。"},
 {number:69,page:31,answer:"イ",capacity:4,roles:["広告売上/支出","購入人数/アクセス総人数","クリック/広告表示回数","延べページ表示"],notes:"見直し前後で目的へ直接対応する指標を選ぶ原方向を保持し、目的/分母/分子を同時に変える。人数と回数を混ぜない。数値計算は足さない。"},
 {number:70,page:31,answer:"イ",capacity:4,roles:["事実上標準","工程革新","新製品革新","外部製造委託"],notes:"工程を持つ会社への委託という原条件を保持。単に他社へ委託しただけで革新とはしない。"},
 {number:73,page:32,answer:"エ",capacity:4,roles:["ニューエコノミー論","都市管理","販売チャネル連携","個人の遊休資産共有"],notes:"原の主に個人間/ソーシャルメディア/遊休資産共有貸借を保持。経済論を当時の議論として扱いインフレ無き成長の現実の無条件保証にしない。"},
 {number:74,page:33,answer:"ウ",capacity:4,roles:["利用機会/能力格差","電子的署名","電子看板","識別情報埋込み"],notes:"原四説明を保持し、各技術・社会課題の機能/対象を問う。署名を内容の真実性まで保証すると説明しない。"},
 {number:75,page:33,answer:"イ",capacity:4,roles:["株主への透明性","環境調達体制","災害ボランティア支援","倫理ヘルプライン"],notes:"全四施策は企業責任の異なる観点に関係する。対象観点を変え、他施策が全く責任と無関係とはしない。"},
 {number:76,page:33,answer:"エ",capacity:4,roles:["別会社独立","合併/買収","自社研究開発","事業別の仮想企業"],notes:"仮想企業/独立会社を区別し、経営資源の内外獲得と社内権限配分の機構を問う。"},
 {number:80,page:35,answer:"ウ",capacity:4,roles:["米国民間標準活動","電気電子等専門家団体","Internet技術仕様","米国標準技術研究所"],notes:"原四組織とRFCを保持。仕様の標準化と全RFCが標準という誤った同一視を区別。"},
].map(r=>({...r,source:`2019h31h-fe-am-${r.number}`,reference:0,precision:"全四択。数値計算/丸めなし。元の割合の分母分子や主体/対象/制約は問いと全択へ保持。"}));

export const legacy2019StrategyPendingMaterial={source:"2019h31h-fe-am-67",page:30,choice:"ウ",status:"pending",issue:"BPRの定義がHammer/Champyの根本的見直し/抜本再設計/四つの評価軸/劇的改善という表現と対応する可能性。成立・一次文献/出版社条件とIPAの教育利用範囲を別に確認。",implementation:"none;full draft and full independent transcription kept in ignored output/source-import/legacy-2019/strategy-pending",scope:"全186に保持、原crop/全択の素材追跡対象。外部問い合わせなし。",research:[{url:"https://www.ncbi.nlm.nih.gov/nlmcatalog/100941034",checked:"1993年の著者/出版社の書誌に対応。本文や日本語翻訳の一致/利用条件の確認ではない。"},{url:"https://www.hachette.com.au/michael-hammer-james-champy/reengineering-the-corporation-a-manifesto-for-business-revolution",checked:"出版社の著者/書名/版の入口。転載許諾を確認したとはしない。"},{url:"https://books.google.com/books?id=mjvGTXgFl6cC",checked:"2009年版の書誌/目次を読めた。1993年原版の定義本文や日本語翻訳の版/文言/権利者を直接確認したとはしない。"},{url:"https://www.harpercollins.com/pages/permissions",checked:"toolでは取得不能。転載許諾の根拠を確認できていない。"}]} as const;

export const legacy2019StrategyCrops=[
  {
    "source": "2019h31h-fe-am-66",
    "pixelRect": [
      46,
      88,
      735,
      453
    ],
    "width": 689,
    "height": 365,
    "sha256": "2eac6472d2f49e41a771b38bfd37204c4bfcffe6fb2a30c37df23e0118995d97"
  },
  {
    "source": "2019h31h-fe-am-68",
    "pixelRect": [
      46,
      812,
      735,
      1001
    ],
    "width": 689,
    "height": 189,
    "sha256": "2555fdefd8be6207ed8e590281e74674b9a8db29e426f45a56b143e20c390bfc"
  },
  {
    "source": "2019h31h-fe-am-69",
    "pixelRect": [
      46,
      88,
      735,
      390
    ],
    "width": 689,
    "height": 302,
    "sha256": "a547d8fc0fc0744c3950ab4439c6828f924d9cea184b162cc45e1167fe8b489d"
  },
  {
    "source": "2019h31h-fe-am-70",
    "pixelRect": [
      46,
      390,
      735,
      631
    ],
    "width": 689,
    "height": 241,
    "sha256": "2e0669969b225679ed7d38b6f98cad92ec87dbcad4739b184b0538cf8e70c32c"
  },
  {
    "source": "2019h31h-fe-am-73",
    "pixelRect": [
      46,
      448,
      735,
      1001
    ],
    "width": 689,
    "height": 553,
    "sha256": "e9290852f953661ea194cc7aeba35598a6558dde1d5bbdda7fc02f009acbc064"
  },
  {
    "source": "2019h31h-fe-am-74",
    "pixelRect": [
      46,
      89,
      735,
      359
    ],
    "width": 689,
    "height": 270,
    "sha256": "8099df00073fafad91335ab25a867ab72e9c63f60a06a98dbdf416a9bb544f9d"
  },
  {
    "source": "2019h31h-fe-am-75",
    "pixelRect": [
      46,
      359,
      735,
      632
    ],
    "width": 689,
    "height": 273,
    "sha256": "1ea350429a190d8c5bc350f5d4d9abec3e48ba90ac1dd2e97adb6c3b8aa62d35"
  },
  {
    "source": "2019h31h-fe-am-76",
    "pixelRect": [
      46,
      632,
      735,
      1001
    ],
    "width": 689,
    "height": 369,
    "sha256": "b7858fe6b0d8c646a04a30c82b2577c39b64d55946358e1e8d259c2d2650611b"
  },
  {
    "source": "2019h31h-fe-am-80",
    "pixelRect": [
      46,
      330,
      735,
      1001
    ],
    "width": 689,
    "height": 671,
    "sha256": "e0a7c994e88f01b8cdf33085d7bb4d59f3d19dfafb9ef791dd942cf9c2ab7bd7"
  }
];
