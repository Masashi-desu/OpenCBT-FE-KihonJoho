/** Original pages 13,14,15 and answer page1 were visually checked. Full source
 * options are frozen separately from production for baseline-role review. */
export const legacy2019DataQueryReview=[
  {source:"2019h31h-fe-am-27",page:13,answer:"イ",reference:[0,0],capacity:16,media:["paragraph","paragraph","code"],
    roles:["集約値で並べ替える誤り","クラス/教科で集約し同二列で整列","学生ごとの余計な集約","集約値の別名をグループキーにする誤り"],
    originalChoices:["GROUP BY クラス名, 教科名 ORDER BY クラス名, AVG(点数)","GROUP BY クラス名, 教科名 ORDER BY クラス名, 教科名","GROUP BY クラス名, 教科名, 学生番号 ORDER BY クラス名, 教科名, 平均点","GROUP BY クラス名, 平均点 ORDER BY クラス名, 教科名"],
    premises:["クラスごと、教科ごと","クラス名、教科名の昇順","中間テスト（クラス名、教科名、学生番号、名前、点数）"],precision:"SQL集約条件と昇降順を実際に変更。小数の手計算や丸めを課さない。原問は列定義のみでデータ行を提示していない。検算用8行は本文に追加せず、誤答の反例としてのみ使う。NULLや一意制約を原問の前提へ追加しない。16条件の全SQLを固定反例行と別の句評価で判定。"},
  {source:"2019h31h-fe-am-29",page:14,answer:"ウ",reference:[2,5],capacity:64,media:["paragraph","table","table","code"],
    roles:["応用花子のみ","応用花子/午前桜子","応用花子/情報太郎","応用花子/情報太郎/午前桜子"],
    originalChoices:["応用花子","応用花子|午前桜子","応用花子|情報太郎","応用花子|情報太郎|午前桜子"],premises:["“学生”表と“学部”表","所属 = 学部名","学部.住所 = '新宿'"],precision:"4行の2表と4結果表を維持。学生の住所と学部の所在地を別条件として変更。原表と同じ非NULL/学部名の重複なしの実データ域を保ち、NULLや行追加/重複へ入力域を広げない。行順はORDER BYがないため採点根拠にせず、全64入力の全行/全候補を直積から検算。"},
  {source:"2019h31h-fe-am-32",page:15,answer:"エ",reference:[23],capacity:6,media:["paragraph","paragraph"],
    roles:["prefix値を個数と混同","1増やしたprefix値","ホスト部の幅を1ビット少なく数える","通常サブネットの利用可ホスト数"],originalChoices:["23","24","254","510"],premises:["192.168.0.0/23","255.255.254.0","IPv4ネットワーク","ホストとして使用できる","上限","全て0のネットワークアドレス","全て1のブロードキャストアドレス"],precision:"prefix22〜27、mask連動、整数4択で丸めなし。原本文には明示されていない通常のホスト割当の除外条件を生成版の解答前に明記する改変とし、原問の注意書きの転記とは称さない。原択23と24の間隔1を原役割として保持するが、全択を正答±1にしない。最終2octetを全列挙してnetwork/broadcastを除き、他3候補との衝突と表記を検査。"},
] as const;
export const legacy2019DataQuerySource={
  checkedOn:"2026-10-19",collection:"2019h31h-fe-am",questionSha256:"55210d293f5fd96673cc1131acea3f8237209b4599d95d48bad02964abe62eb6",answerSha256:"0f871ce45cf3824b208591be14f7898b21bf4109b59aa82833d3693302f033df",
  rights:{material:"午前問27/29/32の本文・表・コード・全選択肢・公式正答",source:"https://www.ipa.go.jp/shiken/faq.html",assessment:"各原ページと設問の範囲を目視し、第三者の図・規格定義の引用転載は特定しなかった。IPA教育用途条件に基づく同梱/ブラウザ表示/改変表示付き生成の候補。独自説明はrights-originalで区別する。未査読の隣接問や年度全体にこの確認を広げない。",status:"source_reviewed_pending_crop_and_parent_distribution_integration"},
  references:["https://www.postgresql.org/docs/18/queries-table-expressions.html","https://www.postgresql.org/docs/18/queries-order.html","https://www.rfc-editor.org/rfc/rfc1878"],
  referenceUse:"処理規則の独立確認に使った一次資料。本文・表の転載は行わず、本問をPostgreSQL固有の構文や現在の運用推奨へ変更しない。RFC1878は情報提供文書であることを保持し、最新規格や/31特例の説明へ流用しない。",
} as const;
/** Crops were viewed as images after the full source-page review. All original
 * questions, notes and four choices fit; no adjacent question is included. */
export const legacy2019DataQueryCrops=[
  {source:"2019h31h-fe-am-27",page:13,pixelRect:[46,327,735,1001],width:689,height:674,sha256:"177784fe54d187fcfc4c66fc61f0e64a5d233a1e2b697f2f2a3d2dc683695047"},
  {source:"2019h31h-fe-am-29",page:14,pixelRect:[46,492,735,1001],width:689,height:509,sha256:"c53b9e768a6a49e88e5a50532e8c57f6ee65fb6feac96fc1f410a3fdaa767922"},
  {source:"2019h31h-fe-am-32",page:15,pixelRect:[46,630,735,814],width:689,height:184,sha256:"a65a3e64d2eaa336d90c1a7342e0c06766b0ca1b0c3b0453782c3dcd4633ca65"},
] as const;
