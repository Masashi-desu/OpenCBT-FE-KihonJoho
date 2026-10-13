// Independently authored study aids. Evidence and review scope: docs/verification.md.
// These are not generated question content and must never change saved snapshots.
export type StudyTerm = {
  term: string;
  expansion?: string;
  meaning: string;
  aliases?: string[];
  related?: string[];
  sources?: string[];
};

export const studyAcronyms: StudyTerm[] = [
  {
    term: "CPU",
    expansion: "Central Processing Unit",
    meaning: "中央処理装置。プログラムの命令を解釈し、演算や装置の制御を行う。",
  },
  {
    term: "GPU",
    expansion: "Graphics Processing Unit",
    meaning:
      "画像処理装置。多数の演算を並列に行う構造をもち、画像処理や大規模な数値計算に使われる。",
  },
  {
    term: "DMA",
    expansion: "Direct Memory Access",
    meaning:
      "直接記憶アクセス。CPUがデータを一つずつ転送することなく、主記憶と入出力装置などの間でデータを転送する方式。",
    related: ["CPU"],
  },
  {
    term: "TPM",
    expansion: "Trusted Platform Module",
    meaning:
      "暗号鍵などを保護するセキュリティ機能。演算の高速化を目的とするGPUとは役割が異なる。",
    related: ["GPU"],
  },
  {
    term: "FPGA",
    expansion: "Field Programmable Gate Array",
    meaning:
      "製造後に内部の論理回路の構成を設定できる半導体。用途に応じた回路を作れる。",
  },
  {
    term: "OS",
    expansion: "Operating System",
    meaning:
      "オペレーティングシステム。CPU・主記憶・入出力装置などの資源を管理し、アプリケーションの実行を支える基本ソフトウェア。",
    related: ["CPU"],
  },
  {
    term: "PC",
    expansion: "Personal Computer",
    meaning: "個人用コンピュータ。利用者が手元で使う汎用のコンピュータを指す。",
  },
  {
    term: "GUI",
    expansion: "Graphical User Interface",
    meaning:
      "図形を使う利用者向けの操作画面。ウィンドウやアイコン、ボタンなどで操作する。",
  },
  {
    term: "3D",
    expansion: "Three Dimensional",
    meaning:
      "三次元。縦・横・奥行きの三つの軸で形状や位置を表す。3D画像の表示では、その形状を画面上の二次元画像へ描画する。",
  },
  {
    term: "CG",
    expansion: "Computer Graphics",
    meaning:
      "コンピュータで画像を生成・加工する技術。形状から画像を作るレンダリングや、陰影を付けるシェーディングなどを含む。",
  },
  {
    term: "ASCII",
    expansion: "American Standard Code for Information Interchange",
    meaning:
      "英字・数字・記号・制御文字などに数値を対応させる7ビットの文字コード。大文字と小文字には異なる値が割り当てられる。",
  },
  {
    term: "DBMS",
    expansion: "Database Management System",
    meaning:
      "データベース管理システム。データの検索・更新、同時実行や障害時の回復などを管理する。",
  },
  {
    term: "ACID",
    expansion: "Atomicity / Consistency / Isolation / Durability",
    meaning:
      "トランザクションの原子性・一貫性・独立性（隔離性）・耐久性の頭文字。処理を全部実行又は取消し、整合性を保ち、並行処理の中間状態を分離し、確定した結果を保持する。",
  },
  {
    term: "SQL",
    expansion: "Structured Query Language",
    meaning:
      "データベースの表の定義、データの検索・挿入・更新・削除などを記述する言語。",
  },
  {
    term: "E-R",
    expansion: "Entity-Relationship",
    meaning:
      "実体と関連。E-Rモデルは、管理する対象を実体、その性質を属性、実体間の結び付きを関連として表す。",
    aliases: ["ERモデル", "ER図"],
  },
  {
    term: "MTBF",
    expansion: "Mean Time Between Failures",
    meaning:
      "平均故障間動作時間。修復して使うシステムが、故障と故障の間に正常に動作する時間の平均。長いほど故障しにくいことを表す。",
  },
  {
    term: "MTTR",
    expansion: "Mean Time To Repair",
    meaning:
      "平均修復時間。故障してから修復するまでにかかる時間の平均。短いほど早く復旧する。稼働率はMTBF÷（MTBF＋MTTR）で求める。",
    related: ["MTBF"],
  },
  {
    term: "LAN",
    expansion: "Local Area Network",
    meaning: "建物や敷地など、比較的限られた範囲の機器を接続するネットワーク。",
  },
  {
    term: "IP",
    expansion: "Internet Protocol",
    meaning:
      "ネットワーク間でパケットを届けるためのプロトコル。IPアドレスで送信元や宛先を指定する。",
  },
  {
    term: "IPv4",
    expansion: "Internet Protocol version 4",
    meaning:
      "IPの第4版。32ビットのIPアドレスを使う。通信規約そのものと、設定を配布するDHCPなどの機能を区別する。",
    related: ["IP", "DHCP"],
  },
  {
    term: "MAC",
    expansion: "Media Access Control",
    meaning:
      "媒体アクセス制御。MACアドレスはデータリンク層で通信インタフェースを識別するために使い、IPアドレスと役割が異なる。",
    related: ["IP"],
  },
  {
    term: "OSI",
    expansion: "Open Systems Interconnection",
    meaning:
      "開放型システム間相互接続。OSI基本参照モデルは通信機能を物理層から応用層までの7層に分ける。",
  },
  {
    term: "ICMP",
    expansion: "Internet Control Message Protocol",
    meaning:
      "IP通信のエラーや制御情報を通知するプロトコル。pingはその要求・応答を使って到達性を確認する。",
    related: ["IP"],
  },
  {
    term: "DHCP",
    expansion: "Dynamic Host Configuration Protocol",
    meaning:
      "ホストのネットワーク設定を動的に配布するプロトコル。IPアドレス、サブネットマスク、既定のゲートウェイなどを設定する。",
  },
  {
    term: "BOOTP",
    expansion: "Bootstrap Protocol",
    meaning:
      "起動時のホストにIPアドレスや起動に必要な情報を提供するプロトコル。疎通確認のpingとは目的が異なる。",
  },
  {
    term: "MIB",
    expansion: "Management Information Base",
    meaning:
      "管理情報ベース。ネットワーク機器の状態など、管理対象となる情報の項目を定義したもの。疎通確認用の命令ではない。",
  },
  {
    term: "IPFIX",
    expansion: "IP Flow Information Export",
    meaning:
      "IP通信のフロー情報を観測装置から収集装置へ送るための規格。通信の記録・分析に使い、実際の侵入可否を試すテストとは異なる。",
  },
  {
    term: "CSMA/CA",
    expansion: "Carrier Sense Multiple Access with Collision Avoidance",
    meaning:
      "搬送波を確認して通信媒体を共同利用し、衝突を回避する方式。無線LANでは送信前の確認や待機を行う。CAはCollision Avoidanceの意味で、認証局のCAとは別の用法。",
  },
  {
    term: "SSID",
    expansion: "Service Set Identifier",
    meaning:
      "無線LANのネットワークを識別する名前。通信の衝突回避や暗号化を行う方式ではない。",
  },
  {
    term: "HTTP",
    expansion: "Hypertext Transfer Protocol",
    meaning:
      "Webの要求と応答をやり取りするプロトコル。HTTPだけでは通信内容の暗号化は保証されない。",
  },
  {
    term: "HTTPS",
    expansion: "Hypertext Transfer Protocol Secure",
    meaning:
      "TLSで保護したHTTP通信。通信内容の暗号化・改ざん検出と、証明書による通信相手の確認を行う。",
    related: ["HTTP", "TLS"],
  },
  {
    term: "TLS",
    expansion: "Transport Layer Security",
    meaning:
      "通信相手の認証、暗号化、改ざん検出などを行うプロトコル。HTTPSはHTTPをTLSで保護して使う。",
    related: ["HTTPS", "HTTP"],
  },
  {
    term: "SSL",
    expansion: "Secure Sockets Layer",
    meaning:
      "TLSの前身となった通信保護プロトコル。現在のHTTPSの保護ではTLSを使う。",
    related: ["TLS"],
  },
  {
    term: "URL",
    expansion: "Uniform Resource Locator",
    meaning:
      "資源の場所とアクセス方法を示す文字列。httpsなどのスキーム、ホスト名、パスなどで構成される。",
  },
  {
    term: "WAF",
    expansion: "Web Application Firewall",
    meaning:
      "Webアプリケーション用のファイアウォール。HTTPの要求内容などを検査し、SQLインジェクションなどの攻撃を検知・遮断する。",
    related: ["HTTP", "SQL"],
  },
  {
    term: "WPA2",
    expansion: "Wi-Fi Protected Access 2",
    meaning:
      "無線LANを保護する認証・暗号化の方式。Webアプリケーションへの攻撃を検査するWAFとは対象が異なる。",
    related: ["WAF"],
  },
  {
    term: "AES",
    expansion: "Advanced Encryption Standard",
    meaning:
      "共通鍵を使うブロック暗号の規格。無線LANの保護などにも使われるが、ログの収集や攻撃の検査を行う製品名ではない。",
  },
  {
    term: "SIEM",
    expansion: "Security Information and Event Management",
    meaning:
      "セキュリティ情報・イベント管理。複数システムのログを集約して関連付け、脅威の検知や分析を行う。",
  },
  {
    term: "UTM",
    expansion: "Unified Threat Management",
    meaning:
      "統合脅威管理。ファイアウォール、マルウェア対策、侵入検知などのセキュリティ機能をまとめて管理する。",
  },
  {
    term: "CA",
    expansion: "Certification Authority",
    meaning: "認証局。公開鍵とその持主の対応を確認し、電子証明書を発行する。",
  },
  {
    term: "CSIRT",
    expansion: "Computer Security Incident Response Team",
    meaning:
      "コンピュータセキュリティのインシデント対応チーム。発生した事故の分析、被害の抑制、復旧や関係者との調整を行う。",
  },
  {
    term: "PSIRT",
    expansion: "Product Security Incident Response Team",
    meaning:
      "製品セキュリティのインシデント対応チーム。提供する製品・サービスの脆弱性に関する報告を受け、調査や対策を調整する。",
  },
  {
    term: "SOC",
    expansion: "Security Operations Center",
    meaning:
      "セキュリティ運用センタ。システムの監視やログ分析によって脅威を検知する。事故への対応を中心とするCSIRTと役割を区別する。",
    related: ["CSIRT"],
  },
  {
    term: "J-CRAT",
    expansion: "Cyber Rescue and Advice Team against Targeted Attack of Japan",
    meaning:
      "IPAのサイバーレスキュー隊。標的型攻撃を受けた組織の相談に対応し、被害低減と攻撃の連鎖の遮断を支援する。",
  },
  {
    term: "BYOD",
    expansion: "Bring Your Own Device",
    meaning:
      "個人が所有する端末を業務に使うこと。組織の端末と同様に、認証・端末管理・業務データの保護などのルールが必要になる。",
  },
  {
    term: "PIN",
    expansion: "Personal Identification Number",
    meaning:
      "本人確認用の暗証番号。覚えている情報による知識要素であり、指紋などの生体要素とは異なる。",
  },
  {
    term: "ID",
    expansion: "Identifier",
    meaning:
      "対象を識別するための名前や番号。利用者IDは利用者を特定する情報であり、それを知っていることだけで本人確認が済むとは限らない。",
  },
  {
    term: "IT",
    expansion: "Information Technology",
    meaning:
      "情報技術。コンピュータやソフトウェアなどを用いて情報を処理・利用する技術。",
  },
  {
    term: "ICT",
    expansion: "Information and Communication Technology",
    meaning:
      "情報通信技術。情報処理に加え、ネットワークによる通信や情報共有も含む。",
  },
  {
    term: "AI",
    expansion: "Artificial Intelligence",
    meaning:
      "人工知能。推論や学習など、知的な処理をコンピュータで実現する技術。具体的な設問では、学習型など問題文で指定された範囲を確認する。",
  },
  {
    term: "RPA",
    expansion: "Robotic Process Automation",
    meaning:
      "ソフトウェアによる定型業務の自動化。画面への入力など、決まった手順を繰り返す作業を自動実行する。",
  },
  {
    term: "HR",
    expansion: "Human Resources",
    meaning:
      "人材・人事。HRテックは人事領域に情報技術を活用し、採用・育成・評価・配属などを支援する。",
    aliases: ["HRテック"],
    related: ["IT"],
  },
  {
    term: "HEMS",
    expansion: "Home Energy Management System",
    meaning:
      "家庭のエネルギー管理システム。住宅内のエネルギー使用を見えるようにし、機器の制御などで省エネルギーを支援する。",
  },
  {
    term: "ERP",
    expansion: "Enterprise Resource Planning",
    meaning:
      "企業資源計画。会計・販売・生産・人事などの情報を統合し、企業全体の経営資源を計画・管理する。",
  },
  {
    term: "SFA",
    expansion: "Sales Force Automation",
    meaning:
      "営業活動の自動化・支援。顧客への訪問、商談、案件の進捗などを管理し、営業の効率を高める。",
  },
  {
    term: "CIO",
    expansion: "Chief Information Officer",
    meaning:
      "最高情報責任者。情報管理・情報システムの戦略と実行を統括する。経営全体のCEO、財務のCFO、技術のCTOと担当領域が異なる。",
    related: ["CEO", "CFO", "CTO"],
  },
  {
    term: "CEO",
    expansion: "Chief Executive Officer",
    meaning: "最高経営責任者。経営戦略と業務執行を統括する。",
  },
  {
    term: "CFO",
    expansion: "Chief Financial Officer",
    meaning:
      "最高財務責任者。資金調達、財務報告などの財務戦略と実行を統括する。",
  },
  {
    term: "CTO",
    expansion: "Chief Technology Officer",
    meaning: "最高技術責任者。技術戦略や研究開発計画を統括する。",
  },
  {
    term: "PaaS",
    expansion: "Platform as a Service",
    meaning:
      "開発・実行基盤をサービスとして提供する形態。提供者が管理するミドルウェアなどを使って、利用者がアプリケーションを開発・運用する。",
  },
  {
    term: "IaaS",
    expansion: "Infrastructure as a Service",
    meaning:
      "計算資源をサービスとして提供する形態。仮想サーバなどを借り、利用者がOSやアプリケーションを管理する。",
    related: ["OS"],
  },
  {
    term: "SaaS",
    expansion: "Software as a Service",
    meaning:
      "ソフトウェアをサービスとして提供する形態。提供者が用意したアプリケーションをネットワーク経由で利用する。",
  },
  {
    term: "EDI",
    expansion: "Electronic Data Interchange",
    meaning:
      "電子データ交換。受発注・出荷・請求などの取引データを、取り決めた形式で企業間で交換する。",
  },
  {
    term: "POS",
    expansion: "Point Of Sale",
    meaning:
      "販売時点。POSシステムは商品を販売した時点の情報を記録し、売上や在庫の管理、購買傾向の分析に使う。",
    aliases: ["POS分析"],
  },
  {
    term: "3C",
    expansion: "Customer / Competitor / Company",
    meaning:
      "顧客・競合・自社の三つのC。顧客のニーズ、競合の状況、自社の強みなどから事業環境を分析する。",
    aliases: ["3C分析"],
  },
  {
    term: "PID",
    expansion: "Proportional / Integral / Derivative",
    meaning:
      "比例・積分・微分の頭文字。目標値との差、その積算、その変化を基に操作量を調整するフィードバック制御。固定した制御則によるPID制御だけで学習型AIとは判断しない。",
  },
  {
    term: "UTC",
    expansion: "Coordinated Universal Time",
    meaning:
      "協定世界時。世界共通の時刻の基準で、日本標準時はUTCより9時間進んでいる。",
  },
  {
    term: "PDF",
    expansion: "Portable Document Format",
    meaning: "文書の文字や図の配置を保持して配布するためのファイル形式。",
  },
  {
    term: "DVD",
    expansion: "Digital Versatile Disc",
    meaning:
      "データを記録する光ディスクの一種。問題中では商品の種類などとして使われる。",
  },
];
