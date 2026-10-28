import{studyAcronyms,type StudyTerm}from'../study-acronyms';
import{sample2022AStudyTerms}from'../sample-2022-a-study-terms';
const source='2018h30a-fe-pm-1';
/** The existing reviewed thirteen source meanings, plus five selected metadata
 * records. No private annual module or questionStudyTerms is imported here. */
const own:StudyTerm[]=[
  {
    "term": "DMZ",
    "meaning": "インターネットへ公開するサーバなどを配置し，内部ネットワークとは分離して扱う領域。本問ではWebサーバを置き，個人情報を保持するDBサーバは社内LANに置く。DBを同じ領域へ移すことがWebアプリの脆弱性対策になるわけではない。",
    "expansion": "Demilitarized Zone"
  },
  {
    "term": "DB（データベース）",
    "meaning": "関連する情報を整理して保持し，検索や更新を行うためのデータの集まり。本問ではカタログ請求者の個人情報をDBサーバで保持する。DBへの不正ログインと，Webアプリ経由でSQL命令を実行させる攻撃は経路が異なる。",
    "expansion": "Database"
  },
  {
    "term": "DNS（ドメイン名の管理）",
    "meaning": "ドメイン名に対応するIPアドレスなどの情報を管理・検索する仕組み。登録情報を改ざんして別のWebサイトへ誘導する手口と，正規のWebアプリへSQL命令を入力する手口は，攻撃する情報と経路が異なる。",
    "expansion": "Domain Name System"
  },
  {
    "term": "ディジタル署名（電子メール）",
    "meaning": "電子メールへ付けた署名を検証することで，作成者や署名後の変更の有無などを確認する仕組み。メールへの署名は，データベースに保管する個人情報の量を減らす対策ではなく，メール本文を暗号化する処理そのものでもない。"
  },
  {
    "term": "アクセスログ",
    "meaning": "誰がいつどの情報へアクセスしたかなどを調べるための記録。本問ではDBへのアクセスを記録することが，事故の原因や流出範囲を調査するための手掛かりになる。記録を取っていなかった過去の操作が後から復元される保証はない。"
  },
  {
    "term": "プレースホルダ",
    "meaning": "SQLの命令の構造と，後から渡す値を分離するための差込み位置。値をSQL命令の一部として文字列連結しない実装につなげる。文字列連結をした後の表示用エスケープと同じ処理として扱わない。"
  },
  {
    "term": "エスケープ処理",
    "meaning": "特別な意味をもつ文字を，使用先の文法や文脈に合った形に置き換える処理。SQL命令文を組み立てる場合と，Webページへ出力する場合では文脈が異なる。同じ置換を全ての用途へ使えば安全になるわけではない。"
  },
  {
    "term": "平文",
    "meaning": "暗号化されていない元の情報。本問ではパスワード以外の情報が平文で格納されている。パスワードのハッシュ化を行っていても，それ以外の個人情報が不正に読み出される危険が解消するわけではない。"
  },
  {
    "term": "脆弱性",
    "meaning": "攻撃などによって悪用される可能性がある，ソフトウェアやシステムの弱点。本問では一部の調査で別の脆弱性も判明しており，Webアプリ全体の調査が必要になる。一つ見つけたことだけで，他に弱点がないとは判断できない。"
  },
  {
    "term": "情報の保管期間",
    "meaning": "利用目的を踏まえて情報を保持する期間。本問では購入支援や再ログインも利用目的であるため，送付後に直ちに一律消去する方法とは区別する。適切な期間と本人の同意を定め，期間後に消去することが保管情報量の低減につながる。"
  },
  {
    "term": "ミドルウェア",
    "meaning": "OSとアプリケーションの間で，データ管理や通信などの共通機能を提供するソフトウェア。必要最小限にすることには管理対象を抑える効果があるが，それだけではDBに誰がアクセスしたかという記録を取得できない。"
  },
  {
    "term": "デフラグメンテーション",
    "meaning": "記憶媒体上で分散して配置されたファイルなどの断片を整理する処理。記憶配置の整理を，データベースへのアクセスの記録や，情報流出範囲を特定するための証跡の取得と混同しない。"
  },
  {
    "term": "冗長化",
    "meaning": "故障に備えて機器や経路などを重複して用意すること。本問の可用性対策では，DBサーバの待機系への切替え，予備電源，通信経路の二重化は，それぞれ異なる障害への備えである。保管情報の削減やアクセスログの取得とは役割が異なる。"
  }
];
/** The three current main canonical extraTerms are private to study-terms.ts.
 * Reuse only those reviewed records, avoiding its glossary routing import cycle. */
const canonicalWebAttackMetadata:StudyTerm[]=[
  {
    "term": "SQLインジェクション",
    "meaning": "外部入力を通して意図しないSQL命令を実行させる攻撃。命令と値を分離し、値をプレースホルダへバインドする対策を取る。",
    "related": [
      "SQL"
    ]
  },
  {
    "term": "クロスサイトスクリプティング",
    "meaning": "不正なスクリプトをWebページに混入させ、閲覧者のブラウザで実行させる攻撃。出力先に応じたエスケープなどで対策する。"
  },
  {
    "term": "ディレクトリトラバーサル",
    "meaning": "パスの指定を悪用し、本来アクセスできないファイルへアクセスする攻撃。許可した識別子からファイルを選ぶなどの対策を取る。"
  }
];
/** Exactly two already-reviewed annual records, scoped here without its AM graph. */
const reviewedSecurityMetadata:StudyTerm[]=[
  {
    "term": "暗号学的ハッシュ関数",
    "meaning": "入力データから固定長の値を得る関数。同じ関数と同じ入力なら同じ値となる。異なる入力が同じ値になる衝突は理論上あり得るが、簡単に衝突や元の入力を求められることを目標とする関数ではない。"
  },
  {
    "term": "バックアップ",
    "meaning": "復元などに備えてデータの複製を保存しておくこと。この問の選択肢では、定期的な保存によって障害前の状態への復旧に備える。障害中も処理を続ける構成とは区別する。"
  }
];
function canonical(pool:readonly StudyTerm[],name:string):StudyTerm{const t=pool.find(t=>t.term===name);if(!t)throw Error('AUTUMN2018_Q1_CANONICAL_TERM_REQUIRED:'+name);return{...structuredClone(t),sources:[source]};}
export const legacy2018AutumnPm1StudyTerms:StudyTerm[]=[
 ...own.map(t=>({...t,sources:[source]})),
 ...['PC','LAN','HTTP','TLS','SQL','WAF'].map(name=>canonical(studyAcronyms,name)),
 ...canonicalWebAttackMetadata.map(t=>({...t,sources:[source]})),
 canonical(sample2022AStudyTerms,'HTML'),
 ...reviewedSecurityMetadata.map(t=>({...t,sources:[source]})),
];
