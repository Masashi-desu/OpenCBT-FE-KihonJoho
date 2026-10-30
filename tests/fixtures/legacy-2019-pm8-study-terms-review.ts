/** Primary evidence is the source's explicit definitions and specified procedure,
 * physical39–46. Explanations are original Japanese, no external prose copied. */
export const legacy2019Pm8TermReview={source:"2019h31h-fe-pm-8",pages:[39,40,41,42,43,44,45,46],checkedOn:"2026-10-20",facts:[
 {term:"ハフマン符号化",must:["回数の小さい二つ","総和を最小","とは限らない"]},
 {term:"ハフマン木",must:["二分木","二つの子","値の和","全文字数"]},
 {term:"符号語",must:["一つの文字","左枝を0","右枝を1","連結"]},
 {term:"接頭語",must:["列の先頭","0は01","他の符号語","区切り"]},
 {term:"固定長符号",must:["同じ長さ","4文字","2ビット","13文字","26"]},
 {term:"可変長符号",must:["長さを変えられる","頻出文字","区切り","とは限らない"]},
 {term:"根",must:["親をもたない","parent","−1","再帰呼出しを止め"]},
 {term:"葉",must:["子をもたない","leftとright","−1","出現回数"]},
 {term:"配列の添字",must:["0から","parent[i]","親の要素番号","別である"]},
 {term:"安定ソート",must:["値が等しい","整列前の順序","要素番号が小さい"]},
 {term:"再帰呼出し",must:["自身を呼び出す","まず親","戻ってから","根から葉","終了条件"]},
 {term:"圧縮率",must:["圧縮後","固定長","小数第3位を四捨五入","削減した割合とは区別"]},
],limits:"年度source別の12語。共有questionStudyTerms・原画像からのsource解決/実Runは未統合。公開範囲や原問題の条件は用語説明から拡張しない。"}as const;
