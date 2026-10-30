import type {StudyTerm} from "../study-acronyms";
/** Annual source scope only. The shared lookup is not modified here. */
export const legacy2019PmAuthStudyTerms:StudyTerm[]=[
 {term:"IdP",expansion:"Identity Provider",meaning:"IDプロバイダ。利用者の認証情報や認証結果を扱い、別のサービスとの認証連携を仲介する。本問では社内LANに置き、A社認証サーバの結果に基づく認証済情報をWebブラウザ経由でB社へ渡す。",aliases:["IDプロバイダ"]},
 {term:"LDAP",expansion:"Lightweight Directory Access Protocol",meaning:"ディレクトリ情報へのアクセスに使うプロトコル。認証の仕組みも扱うが、全てのLDAP利用がパスワードだけを使うわけではない。本問はIdPとA社認証サーバの間で用い、A社の明示された利用者IDとパスワードの検証条件に従う。"},
 {term:"シングルサインオン",expansion:"Single Sign-On",meaning:"一度の認証結果を利用して、複数のサービスを利用できるようにする仕組み。全サービスへ同じパスワードを送ることを意味しない。本問ではB社へ署名付きの認証済情報を渡す。",aliases:["SSO"]},
 {term:"PKI",expansion:"Public Key Infrastructure",meaning:"公開鍵基盤。証明書などを使って公開鍵とその所有者の対応を管理し、公開鍵の信頼できる利用を支える仕組み。基盤全体と、個別の公開検証鍵の値とは別である。"},
 {term:"CA",expansion:"Certification Authority",meaning:"認証局。証明書を発行する主体。本問でB社へ登録するIdPの公開鍵の値そのものを指す語ではない。",aliases:["認証局","認証局（CA）"]},
 {term:"ICカード",expansion:"Integrated Circuit",meaning:"ICは集積回路の略で、それを組み込んだカード。認証に使う場合、カードという物理的な認証器の所持を利用できる。本問の選択肢ではカード内の利用者IDやパスワードの総称ではなく、所持する認証器を指す。A社の認証をカード方式へ変更する条件はない。"},
 {term:"ディジタル署名",meaning:"署名者の秘密鍵で作り、対応する公開鍵で検証する仕組み。署名後のデータの改変を検知し、署名者の確認に使う。署名だけで情報を隠したり、通信経路の正常動作を保証したりするものではない。",aliases:["デジタル署名"]},
 {term:"公開鍵",meaning:"公開鍵暗号方式で用いる鍵の組のうち、他者へ渡して利用してもらう鍵。本問はIdPの署名をB社が検証する公開検証鍵として使い、本人認証に使うパスワードとは区別する。"},
 {term:"秘密鍵",meaning:"公開鍵と組になる鍵のうち、所有者が秘密に管理する鍵。本問ではIdPが署名を作るために用い、B社へ配布する検証鍵は公開鍵である。"},
 {term:"共通鍵",meaning:"通信する者などが同じ秘密を共有して用いる鍵。本問で指定されるディジタル署名の公開検証鍵と同じものではない。"},
 {term:"改ざん",meaning:"情報を権限なく書き換えること。本問では、受け取った認証済情報が署名後に変更されていないかを署名検証で確かめる。"},
 {term:"サービス妨害",meaning:"サービスを利用できなくするなど、可用性を損なう行為。情報の署名が正しいことと、サービスが正常に提供され続けることは別である。"},
 {term:"通信経路の障害",meaning:"通信経路上の故障などによって通信が正常に行えなくなること。受信データの署名検証では経路の正常動作を保証できない。"},
 {term:"生体情報",meaning:"指紋など、身体の特徴に基づく情報。認証要素として利用できるが、本問のA社認証は利用者IDとパスワードを検証するという前提である。"},
 {term:"パスワード",meaning:"本人の認証などに使う秘密の文字列。本問ではA社認証サーバで検証し、B社へ渡す三項目の認証済情報には含めない。"},
 {term:"利用者ID",meaning:"利用者を識別する値。本問ではA社の本人認証にパスワードと一緒に使い、認証済情報の一項目としてB社へも送信する。本人認証の秘密値そのものとは区別する。",related:["ID"]},
 {term:"認証有効期限",meaning:"認証結果を有効として扱う期限。本問では認証結果・利用者IDと併せて署名対象になり、B社へ送信する。本人認証に入力するパスワードではない。"},
 {term:"漏えい",meaning:"情報が意図しない相手に知られること。署名は情報を秘密にする機能ではないので、署名検証だけで漏えいの有無を判定できない。"},
 {term:"盗聴",meaning:"通信内容を第三者が読み取ること。ディジタル署名だけでは通信内容を隠せず、盗聴の防止を保証しない。本問はブラウザとの通信にHTTPSを用いる。",related:["HTTPS"]},
 {term:"プロキシサーバ",meaning:"クライアントの通信を仲介するサーバ。本問で社内から社外へ許可される通信は、クライアントPCからこのサーバを経由するHTTPS通信に限る。"},
 {term:"ファイアウォール",meaning:"境界を通過する通信を規則に従って許可・拒否する仕組み。本問では社外から社内LANへの通信を全て禁止し、設定は変更できない。",related:["LAN"]},
 {term:"認証済情報",meaning:"本問で定義された、認証結果・認証有効期限・利用者IDの三項目。IdPが署名を付け、WebブラウザがB社へ運ぶ。利用者IDとパスワードを合わせた利用者認証情報とは異なる。"},
].map(t=>({...t,sources:["2019h31h-fe-pm-1"]}));
export const legacy2019PmAuthInheritedTerms=["PC","LAN","IP","HTTP","HTTPS","TLS","ID"].map(term=>({source:"2019h31h-fe-pm-1",term,canonicalModule:"src/core/study-acronyms.ts"}));
export const legacy2019PmAuthRelatedTerms={"2019h31h-fe-pm-1":[...legacy2019PmAuthStudyTerms.map(t=>t.term),...legacy2019PmAuthInheritedTerms.map(t=>t.term)]};
