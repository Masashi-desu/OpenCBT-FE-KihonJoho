import type{StudyTerm}from'../study-acronyms';
export const legacy2017Pm11StudyTerms:StudyTerm[]=[
{term:'抽象クラス・abstract',meaning:'共通のデータと処理を定め、一部の処理をサブクラスへ委ねるクラス。この問題のTierTableはペア配列を作る一方、mapの具体的な変換処理を各サブクラスに委ねている。'},
{term:'可変長引数',meaning:'同じ型の値を可変個数受け取る引数。double... tiersは配列として扱われ、この問題では2個ずつを一組にするので、長さが奇数の場合は例外にする。'},
{term:'継承・extends',meaning:'既存のクラスの性質を受け継いで新しいクラスを定義する仕組み。DiscountPlanはRatePlanのプラン名や料金計算を引き継ぎ、割引を加えたgetPriceへ拡張する。'},
{term:'super・動的ディスパッチ',meaning:'superは直接の上位クラスの実装を指定する。thisを上位型へキャストしても実際のインスタンスに対応するオーバーライド先が選ばれるため、この問題では自分のgetPriceを繰り返し呼んでしまう。'},
{term:'段階料金',meaning:'使用量を料金帯に分け、各帯の使用量にその帯の単価を掛けて合計する料金。この問題では、次の帯の下限と現在の帯の下限の差が、完了した帯の使用量になる。'},
{term:'intへの変換',meaning:'この問題では正の料金を整数へ変換するとき、小数点以下を切り捨てる。元の電気料金を整数にしてから割引率を求め、割引後の金額を返すときにもう一度整数にする。'},
].map(t=>({...t,sources:['2017h29h-fe-pm-11']}));
