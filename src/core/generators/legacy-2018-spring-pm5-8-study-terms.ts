/** After-answer aids for four exact majors. No whole-year private glossary
 * import: unrelated AM/Autumn/other-major terms must not enter the app bundle. */
import type{StudyTerm}from'../study-acronyms';
import{legacy2018HealthStudyTerms}from'./legacy-2018-pm-health-study-terms';
import{legacy2018HeapStudyTerms}from'./legacy-2018-pm-heap-study-terms';
const scope=(n:6|7,items:Omit<StudyTerm,'sources'>[]):StudyTerm[]=>items.map(t=>({...t,sources:[`2018h30h-fe-pm-${n}`]}));
/** These ten authored meanings are copied byte-for-byte from the existing
 * narrowly scoped PM6 entries after comparing them with primary p31–34.
 * Keeping the broad old module unimported preserves the public content scope. */
export const legacy2018SpringPm6StudyTerms=scope(6,[
 {term:'EVM',expansion:'Earned Value Management',meaning:'出来高管理。計画した作業量、完了した作業に割り当てた計画値、実際に費やした工数などを比較し、進捗と費用の状況を管理する。この問では費用に対応する値も人月で表す。'},
 {term:'BAC',expansion:'Budget at Completion',meaning:'完了までの総予算。この問では、プロジェクト計画時点で見積もった全作業の予定総工数。PVがプロジェクト完了時点で達する計画値であり、実際に費やした工数ACとは異なる。'},
 {term:'PV',expansion:'Planned Value',meaning:'出来高計画値。評価時点までに実施する予定だった作業へ、計画時点で割り当てた工数。計画の進捗を表し、既に完了した作業に対応するEVや、実際に使ったACと区別する。'},
 {term:'EV',expansion:'Earned Value',meaning:'出来高実績値。評価時点までに完了した作業に対して、当初の計画で割り当てていた工数。完了した仕事量を計画の尺度へ換算した値であり、実際に使った工数ACではない。'},
 {term:'AC',expansion:'Actual Cost',meaning:'コスト実績値。この問では評価時点までに完了した作業へ実際に費やした工数。仕事量の計画上の価値であるEVと比較し、費用の状況を判断する。'},
 {term:'SV',expansion:'Schedule Variance',meaning:'スケジュール差異。EV−PVで求める符号付きの差で、負なら計画より完了した作業が少ない。この問では人月の差であり、遅れの日数そのものや、図の区間の正の長さと同一視しない。'},
 {term:'CV',expansion:'Cost Variance',meaning:'コスト差異。EV−ACで求める符号付きの差で、負なら完了した作業の計画値より実際の工数が大きい。図で示すEVとAC間の正の距離と、指標自体の負の値を区別する。'},
 {term:'SPI',expansion:'Schedule Performance Index',meaning:'スケジュール効率指数。EV／PVで計画に対する出来高を比較する。1未満なら進捗遅延、1なら計画どおりを表す。この問の外部設計の予測では、この効率がその後も同等と仮定する。'},
 {term:'CPI',expansion:'Cost Performance Index',meaning:'コスト効率指数。EV／ACで実際の工数に対する出来高を比較し、1未満ならコスト超過を表す。今後も同じ効率とする予測と、今後は計画どおりの工数とする予測を区別する。'},
 {term:'KLOC',expansion:'Kilo Lines Of Code',meaning:'ソースコード1,000行を単位とする開発規模の指標。この問では、開発規模KLOCを工程の生産性KLOC／人月で割り、必要な人月を求める。'},
]);
export const legacy2018SpringPm7StudyTerms=scope(7,[
 {term:'変動費と変動費率',meaning:'この問の変動費は販売数に応じて変わる費用で、変動費率は変動費を売上高で割った比率である。二つのケースでは同じ比率を使う。販売単価だけを変えるときは、変動費総額を変えないという別の条件に注意する。'},
 {term:'固定費',meaning:'この問で比較する販売数の範囲では、販売数が変わっても同額として扱う費用。1個当たりの固定費が同じという意味ではなく、二つのケースで固定費の総額が等しい。'},
 {term:'限界利益率',meaning:'売上高から変動費を引いた額の、売上高に対する比率。変動費率をrとすると1−rである。固定費を差し引く前の比率なので、固定費控除後の利益率とは区別する。'},
 {term:'損益分岐点売上高',meaning:'利益が0となり、売上高と費用の合計が一致する売上高。この問の一定の変動費率rと固定費Fでは、F÷(1−r)で求める。固定費を変動費率そのもので割る式ではない。'},
 {term:'値下げと利益の関係',meaning:'この問では販売数と変動費総額を変えないので、値下げによる売上高の減少分だけ利益が減る。利益を負にしない最大の値下げ率は、値下げ前の利益を値下げ前の売上高で割った比率になる。数量を増やす条件とは分けて考える。'},
 {term:'費用直線の傾きと切片',meaning:'変動費率と固定費が一定なら、費用は変動費率×売上高＋固定費となる。横軸が売上高、縦軸が費用のグラフでは、傾きが変動費率、縦軸との切片が固定費に対応する。線の高さだけで傾きを判断しない。'},
]);
export const legacy2018SpringPm5To8StudyTerms:StudyTerm[]=[...legacy2018HealthStudyTerms,...legacy2018SpringPm6StudyTerms,...legacy2018SpringPm7StudyTerms,...legacy2018HeapStudyTerms];
