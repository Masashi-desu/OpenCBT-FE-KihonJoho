import type {StudyTerm} from '../study-acronyms';
export const legacy2017AutumnPm3StudyTerms:StudyTerm[]=[
 {term:'SQL',expansion:'Structured Query Language',meaning:'関係データベースを定義・問い合わせ・更新するための言語。本問では抽出と集約，結合，ビューを扱う。'},
 {term:'主キー',meaning:'表の各行を一意に識別する列，又は複数列の組。販売明細表では伝票番号と商品番号の組が主キーである。'},
 {term:'WHERE',meaning:'集約する前の行を条件で絞り込むSQLの句。対象期間と商品分類を購入集約の前に絞る。'},
 {term:'GROUP BY',meaning:'同じ列値の行を一つのグループに分ける句。集約結果そのものをグループキーへ含めない。'},
 {term:'HAVING',meaning:'集約したグループに対する条件を指定する句。合計額や購入回数の条件を適用する。'},
 {term:'SUM',meaning:'グループ内の数値を合計する集約関数。本問は販売時単価と個数の積を合計する。'},
 {term:'COUNT',meaning:'行数などを数える集約関数。COUNT(*)は行を数え，本問の明細1行=購入1回という定義に対応する。'},
 {term:'ビュー',meaning:'問い合わせの結果を表のように利用する仕組み。本問の必要表数には指定されたビュー自身も1表として数える。'},
 {term:'外部結合',meaning:'対応する行が片側になくても，指定した側の行を残す結合。未販売の商品も入荷側から在庫へ残すために使える。'},
 {term:'販売時単価',meaning:'商品表の現在価格とは別に，実際に販売した時点の価格を明細へ保存する値。販売のない日の価格変更履歴までは保存しない。'},
];
