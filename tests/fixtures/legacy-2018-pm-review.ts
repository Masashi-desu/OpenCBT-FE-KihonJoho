/** Manually frozen after viewing all three original page images and the
 * official answer image. These expectations are not generated from build(). */
export const legacy2018PmReview={
  checkedOn:"2026-10-19",source:"2018h30h-fe-pm-7",collection:"2018h30h-fe-pm",number:7,pages:[35,36,37],printedPages:[34,35,36],
  questionSha256:"bb172e6225037b05e18aec455f7aec8ec66f3e82838c92a27bb50d2d203dbfb9",answerSha256:"50c0b5defdb6a579048671d6a371e1ecf982ad59d370c08d1909e16d0f7b0777",
  reference:[0,1,1,1],groups:[5,5,5,5,3,4,3,4],labels:["設問1 a","設問1 b","設問1 c","設問1 d","設問1 e","設問2","設問3 f","設問3 g"],sourceAnswer:["エ","イ","エ","イ","イ","イ","イ","ア"],
  originalChoices:[["25","40","60","75","80"],["16,000","34,000","64,000","104,000","134,000"],["45,333","64,000","85,333","136,000","256,000"],["4","8","10","12","16"],["と変わらない","よりも大きい","よりも小さい"],["①","②","③","④"],["上げる","下げる","0にする"],["原材料の単価を下げる","社員の給与を上げる","販売数を増やす","販売単価を下げる"]],
  originalTable:[["ケース","X","Y"],["販売数（千個）","1,000","1,200"],["売上高（千円）","200,000","240,000"],["変動費（千円）","hidden","hidden"],["固定費（千円）","hidden","hidden"],["利益（千円）","16,000","26,000"]],
  premises:["部品Tだけを生産","変動費率という","固定費は同額","網掛けの部分は表示していない","利益が0になる売上高","販売数及び変動費を変えず","値下げ額÷値下げ前の販売単価","利益がマイナスにならない最大","他の3社","変動費率はR社が他社と比べて最も高い","固定費を変えずに変動費率だけを下げる"],
  originalGraph:{axes:["費用","売上高","0"],styles:["solid","dash","dot","longdash"],interceptOrder:[1,3,2,4],slopeOrder:[4,3,1,2],withinPlotCrossings:[[2,3]],outsidePlotCrossings:[[1,2],[1,3],[1,4],[2,4],[3,4]],numericTicks:false},
  domain:{declared:72,valid:60,rejected:12,rejectedReason:"ratioCase=0（75%）かつprofitCase=2（12%）はbの利益24,000と正答26,000の差が原34,000と16,000の差の半分の比率を下回る。難度のための問題自体の除外ではなく候補入力域の品質制約。",acceptedNumericCases:[[0,0],[0,1],[1,0],[1,1],[1,2]],moneyScales:[1,2,3],graphCases:[0,1,2,3]},
  precision:"表と正答は元と同じ整数（千円・千個・%）。数量・金額倍率1〜3で原の4〜6桁の手計算を維持する。aの選択肢は変動費率に対して−50/−35/−15/0/+5ポイント。bは利益の取り違え/正しい固定費/三つの誤った変動費率からの固定費。cは固定費÷変動費率、誤固定費そのもの、誤固定費÷変動費率、正しい固定費÷限界利益率、誤固定費÷限界利益率。cの二つの誤答の非整数だけを千円単位の整数へ四捨五入し、正答の計算に丸めを要求しない。これは生成版の表示設計であり、原資料が丸め方式を指定したとは扱わない。dは正しい値下げ限界の半分/そのまま/1.25/1.5/2倍を比較。各numeric群の正答との相対最小間隔が原の半分以上となる全60有効入力だけを使う。",
  materials:{body:"IPA独自のR社と部品Tの設定、3頁の本文・表・独自の4直線グラフ・全8解答群。原画像と内容を照合し、規格本文、外部図表、引用出所・写真等の第三者素材を特定しなかった。注記の不在だけを包括許諾の根拠にせず、IPA教育用途FAQと素材内容から判断。",answer:"公式解答例p.1の8欄を画像で照合。公式解説ではない。",diagram:"原の4線種・軸・原点・番号を独自のSVGとして再構成。原の線の画素をコピーせず、基本の相対的な切片・傾き・交点関係を維持する。可変ケースは最大傾きの位置を変更する改変。",uses:["repositoryRedistribution","browserDisplay","adaptation"],basis:"https://www.ipa.go.jp/shiken/faq.html",limits:"同一AIによる教材用途の判断。外部専門家や権利者の個別確認ではない。JIS/APIや他大問には流用しない。"},
  pending:["共有source-figureの2profile/domain/alt/UI hook","年度別原問/生成器/ミックスの最終登録","実アプリ保存再開・採点・配布CSPの検証","旧午後の任意選択条件を扱う年度UI","年度186件の未完了項目（件数と全件リストはlegacy-2018-inventory.tsを正本として保持）"],
};
