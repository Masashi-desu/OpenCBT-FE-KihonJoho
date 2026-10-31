/** Reviewed literal mappings independent of generator models/calculation. */
export const systemsHalfAdderFacts=[
 {name:"排他的論理和",outputs:[0,1,1,0]},
 {name:"論理積",outputs:[0,0,0,1]},
 {name:"否定論理積",outputs:[1,1,1,0]},
 {name:"否定論理和",outputs:[1,0,0,0]},
 {name:"論理和",outputs:[0,1,1,1]},
];
export const systemsHalfAdderChoices=[
 [["排他的論理和","論理積"]],
 [["否定論理積","否定論理和"],["論理和","論理積"]],
 [["否定論理和","排他的論理和"],["論理積","排他的論理和"]],
 [["論理積","論理和"],["排他的論理和","論理和"]],
];
export const systemsDependencyFacts=[
 {edges:["a>b","a>c","a>d","a>e","b>f","b>g","b>h","e>i","e>j"],choices:[["a","bcde","fghij"],["abcde","bfgh","eij"],["abfgh","cd","eij"],["acd","bfgh","eij"]],depth:2,rootDegree:4},
 {edges:["a>b","a>c","a>d","a>e","b>f","b>g","b>h","f>i","f>j"],choices:[["a","bcde","fghij"],["abcde","bfgh","fij"],["abfgh","cde","fij"],["acde","bfgh","fij"]],depth:3,rootDegree:4},
 {edges:["a>b","a>c","a>e","b>d","b>f","b>g","b>h","e>i","e>j"],choices:[["a","bce","dfghij"],["abce","bdfgh","eij"],["abdfgh","c","eij"],["ac","bdfgh","eij"]],depth:2,rootDegree:3},
];
export const systemsLedgerFacts={accounts:[["208","売上"],["510","現金"],["511","預金"],["812","旅費"]],transactions:[["0122","2017-04-04","A社"],["0124","2017-04-04","A社"]],knownMovementRows:[[["208","貸方","50,000","0122"],["510","貸方","50,000","0124"],["812","借方","50,000","0124"]],[["510","借方","50,000","0122"],["510","貸方","50,000","0124"],["812","借方","50,000","0124"]]],targetAccounts:["現金","売上"],invariant:"一つの会計取引に関する借方金額の合計と貸方金額の合計は一致する"};
export const systemsHomeFacts=[
 {purpose:"この1個のグローバルIPアドレスを使って複数のPCがインターネットを利用するのに必要となる装置Aの機能はどれか。",mechanism:"address-and-port-sharing",choice:"NAPT（IPマスカレード）"},
 {purpose:"各PCに、LAN側で使用するIPアドレスなどの通信設定を自動的に割り当てるために必要となる装置Aの機能はどれか。",mechanism:"configuration-distribution",choice:"DHCP"},
 {purpose:"回線事業者がEthernet上でPPPのセッションを用いるアクセスサービスを提供しているとき、そのセッションを確立するために必要となる装置Aの機能はどれか。",mechanism:"ppp-session-over-ethernet",choice:"PPPoE"},
 {purpose:"通信の送信元や宛先のIPアドレス、ポート番号などに応じて通過又は破棄を決めるために必要となる装置Aの機能はどれか。",mechanism:"permit-or-drop-rules",choice:"パケットフィルタリング"},
];
export const systemsRouterFacts=[
 [{text:"宛先IPアドレス",role:"packet-destination-network"}],
 [{text:"宛先MACアドレス",role:"link-destination"},{text:"送信先のポート番号",role:"application-endpoint"}],
 [{text:"発信元IPアドレス",role:"packet-source"},{text:"IPヘッダのプロトコル番号",role:"next-protocol"}],
 [{text:"発信元MACアドレス",role:"link-source"},{text:"IPヘッダのTTL",role:"lifetime-limit"}],
];
export const systemsStakeholderFacts=[
 [{text:"自社が提供する商品及びサービスの個人利用者が行うセキュリティ対策",role:"private-consumer",businessResponsibility:false},{text:"自社から個人顧客向けWebサービスの運用を委託され、その顧客情報を扱う事業者が行うセキュリティ対策",role:"outsourced-web-and-customer-data",businessResponsibility:true}],
 [{text:"自社に出資している株主が行うセキュリティ対策",role:"equity-holder",businessResponsibility:false},{text:"自社に出資するとともに、自社のITシステム管理を委託されている事業者が行うセキュリティ対策",role:"equity-and-it-management-contract",businessResponsibility:true}],
 [{text:"自社と取引や業務委託の関係を持たず、公開された会社案内を私的に閲覧する人が行うセキュリティ対策",role:"private-public-information-reader",businessResponsibility:false},{text:"自社のサプライチェーンのビジネスパートナーが行うセキュリティ対策",role:"business-supply-chain",businessResponsibility:true}],
 [{text:"自社の事業所近隣の地域社会が行うセキュリティ対策",role:"geographical-community",businessResponsibility:false},{text:"自社の事業所の近隣にあり、自社製品の部品供給を担う取引先が行うセキュリティ対策",role:"nearby-component-supplier",businessResponsibility:true}],
];
export const systemsTimestampFacts=[
 [{text:"公式の記録において使われる全世界共通の日時情報を、暗号化通信を用いて安全に表示するWebサービス",mechanism:"current-time-display"},{text:"利用者が指定した基準時刻を、各地域の時差を考慮して現地時刻に変換するサービス",mechanism:"time-zone-conversion"}],
 [{text:"指紋、声紋、静脈パターン、網膜、虹彩などの生体情報を、認証システムに登録した日時を用いて認証するサービス",mechanism:"incorrect-authentication-by-enrolment-time"},{text:"事前に登録された生体の特徴と、認証時に読み取った特徴を照合して本人確認を行うサービス",mechanism:"biometric-comparison"}],
 [{text:"電子データが、ある日時に確かに存在していたこと、及びその日時以降に改ざんされていないことを証明するサービス",mechanism:"existence-and-integrity-evidence"}],
 [{text:"ネットワーク上のPCやサーバの時計を合わせるための日時情報を途中で改ざんされないように通知するサービス",mechanism:"authenticated-clock-synchronisation"},{text:"電子データの作成日時として、端末の利用者が指定した日時をファイルの属性に記録するサービス",mechanism:"user-chosen-file-time-metadata"}],
];
export const systemsPrimaryFactReview=[
 {url:"https://www.rfc-editor.org/rfc/rfc3022.html",date:"2001-01",read:"web全文抽出/2.2と3.1.1",fact:"NAPTの単一addressを複数nodeで共用、address+transportport変換という事実。RFCの本文・図は転載しない。"},
 {url:"https://www.rfc-editor.org/rfc/rfc2131.html",date:"1997-03",read:"web全文抽出/1",fact:"DHCPの設定情報配布とaddressallocation。automaticとdynamicallocationの用語を無造作に同一視しない。原選択肢の機能事実の補助。"},
 {url:"https://www.rfc-editor.org/rfc/rfc2516.html",date:"1999-02",read:"web全文抽出/Abstract",fact:"PPPsessionをEthernet上に構成する機能。規格のpacket図表を取り込まない。"},
 {url:"https://www.rfc-editor.org/rfc/rfc1812.html",date:"1995-06",read:"web全文抽出/5.2.1、5.2.4",fact:"通常の経路判断はpacketdestinationのlookupで次hopを選ぶ。sourcevalidation/portfilter/TTL等の別役割が存在することと区別する。"},
 {url:"https://www.rfc-editor.org/rfc/rfc3161.html",date:"2001-08",read:"web全文抽出/1、2.1、2.2",fact:"TSAによるdata存在の証拠、信頼できる時刻、hash表現、署名と検証という機能だけを補助照合。古い例のMD5/SHA1を現在の推奨として問題へ加えない。"},
 {url:"https://www.meti.go.jp/policy/netsecurity/downloadfiles/CSM_Guideline_v1.1.pdf",read:"web403/curl403で原本全文未到達",fact:"原問が指すVer1.1の版を保持し、読めていない本文を査読済みと記録しない。現行3.0又は2.0へ置換しない。"},
 {url:"https://www.ipa.go.jp/archive/publish/wp-security/qv6pgp0000000uyb-att/000061032.pdf",date:"2017-07",read:"18頁PDFを取得、物理12(印刷11)を画像で読む",sha256:"4d4b81837418b7db18c39fa659fd0d51dc4aa302eb902db520055ecd4ca7d875",fact:"2016年12月改訂の旧ガイドライン説明と3原則図で、⑤系列企業・ビジネスパートナーの対策状況確認、⑦IT管理の外部委託先と、左側の株主等への開示を区別して確認。試験後の同年補助資料であり、Ver1.1原本を全文読んだ記録にはしない。外部図・本文を候補assetへコピーしない。"},
];
export const systemsNetworkingFacts={
 targets:[{text:"OpenFlowを使ったSDN（Software-Defined Networking）の説明として、適切なものはどれか。",mechanism:"forwarding-and-control-separation"},{text:"CDN（Content Delivery Network）を構築する際のサーバ配置の考え方に対応する説明はどれか。",mechanism:"content-delivery-server-placement"},{text:"BPM（Business Process Management）を支援するソフトウェア技術に対応する説明はどれか。",mechanism:"business-process-analysis"}],
 optionMechanisms:["logistics-rfid-iot","content-delivery-server-placement","forwarding-and-control-separation","business-process-analysis"],
 canonicalBodyHashes:["3c4579864de82d2691c936d04eccde3368c9225b70a48335a487ada66ea138a3","1809ad112af40178e8f4e4bf97dc096f1ca390a342ba97ff1f1d183ec099c302","591958b31066e5f578dbd6969d10fedc17c2a0076a634bdded58b20ced6d40a8"],
 review:"Both source images and official answerp1 read. 2017イ has music/videos/games/softwarecontents/efficient phrasing andエ has『などの図を活用して』;2019 doesnot. Current771b8d3 canonical3bodyhashes confirmedby2019agent/root,notcalculatedfrom2017output. Transformchoicesonly,thenindependentlymatch2017literal4texts and3mechanismtargets. Outputbodyhashesmustdifferfromcanonical;same3functionalconditions are not6distinctmixinputs.",
};
