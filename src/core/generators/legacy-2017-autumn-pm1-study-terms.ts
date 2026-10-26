import type {StudyTerm} from '../study-acronyms';
export const legacy2017AutumnPm1StudyTerms:StudyTerm[]=[
 {term:'SSH',expansion:'Secure Shell',meaning:'信頼できないネットワーク上で遠隔ログインなどを行うための仕組み。本問では安全な通信経路の確立，利用者認証，ログインの順を区別する。'},
 {term:'セッション鍵',meaning:'一つの通信セッションでデータの暗号化に使う共通鍵。サーバの署名を検証する公開鍵とは役割が異なる。'},
 {term:'公開鍵認証',meaning:'対応する秘密鍵で作成した署名を公開鍵で検証し，秘密鍵を持つ相手であることを確認する。SSH利用者認証ではクライアントの公開鍵を事前登録する。'},
 {term:'サーバ認証',meaning:'通信先が正当なサーバであることを確認する。本問は事前確認済みのサーバ公開鍵によってサーバの署名を検証する。'},
 {term:'中間者攻撃',expansion:'Man-in-the-Middle Attack',meaning:'通信の間へ割り込み，相手を装って通信を中継・改ざんする攻撃。確認済みの公開鍵によるサーバ認証が相手のなりすましを防ぐ。'},
 {term:'DoS攻撃',expansion:'Denial of Service',meaning:'サービスを利用できない状態へ追い込む攻撃。サーバの署名を検証することだけで妨害通信を止められるわけではない。'},
 {term:'SQLインジェクション',expansion:'Structured Query Language Injection',meaning:'入力を通じて本来意図しないSQLの構造を混入させる攻撃。SSHのサーバ署名確認とは対策の対象が異なる。'},
 {term:'XSS',expansion:'Cross-Site Scripting',meaning:'Webページへ不正なスクリプトを混入させ，閲覧者のブラウザで動作させる攻撃。SSHサーバ認証とは別の防御が必要。'},
 {term:'CSRF',expansion:'Cross-Site Request Forgery',meaning:'利用者が認証済みのWebサービスへ意図しない要求を送らせる攻撃。XSSやSSH通信先のなりすましとは異なる。'},
 {term:'OSコマンドインジェクション',expansion:'Operating System Command Injection',meaning:'アプリケーションへの入力にOSの命令を混入させる攻撃。OSはOperating Systemの略であり，SSHサーバ認証とは別に入力処理などの対策が必要。'},
 {term:'利用者ID',expansion:'Identifier',meaning:'利用者を識別するための値。識別子を知ることだけで，パスワードや秘密鍵の所持を証明したことにはならない。'},
 {term:'パスワード認証',meaning:'送られたパスワードと利用者の登録値をサーバで照合する。本問では先に確立した暗号化経路で送るが，乗っ取られた受信サーバによる取得までは防がない。'},
 {term:'共通鍵暗号方式',meaning:'暗号化と復号で秘密にする共通の鍵を用いる方式。一般に大量データの暗号処理に適し，鍵の安全な共有は別途必要。'},
 {term:'ディジタル署名',meaning:'秘密鍵を用いて作成し，対応する公開鍵で署名者と内容の真正性を確認する。本問ではセッション識別子などへの署名を検証する。'},
];
export const legacy2017AutumnPm1TermReferences=[{url:'https://www.rfc-editor.org/rfc/rfc4251.html',sections:['4.1','9.3.4','9.4.4','9.4.5']},{url:'https://www.rfc-editor.org/rfc/rfc4252.html',sections:['7','8']},{url:'https://www.rfc-editor.org/rfc/rfc4253.html',sections:['6.3','8']}];
