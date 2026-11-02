import type{Stage3AfternoonQuestionSpec}from'./legacy-2016-autumn-pm-spec';
import{legacy2016AutumnPm9Definition,q9Build,q9OriginalPageAlt}from'../src/core/generators/legacy-2016-autumn-pm-9';
import{legacy2016AutumnPm10Definition,q10OriginalPageAlt}from'../src/core/generators/legacy-2016-autumn-pm-10';
import{legacy2016AutumnPm11Definition,q11OriginalPageAlt}from'../src/core/generators/legacy-2016-autumn-pm-11';
import{legacy2016AutumnPm12Definition,q12OriginalPageAlt}from'../src/core/generators/legacy-2016-autumn-pm-12';
import{legacy2016AutumnPm13Definition,q13Build,q13OriginalPageAlt,q13EditorialTitle}from'../src/core/generators/legacy-2016-autumn-pm-13';
export const specs:Stage3AfternoonQuestionSpec[]=[
 {number:9,title:'Cによる開発作業順序の決定',pages:[41,42,43,44,45,46],topics:['プログラミング','C','アルゴリズム'],keywords:['スケジューリング','遅延日数','隣接交換','前置減分'],original:q9Build([0],true),definition:legacy2016AutumnPm9Definition,originalPageAlt:q9OriginalPageAlt(),editorialContextTitles:['公式訂正の適用について']},
 {number:10,title:'COBOLの健康診断マスタ更新',pages:[47,48,49,50,51,52],topics:['プログラミング','COBOL','ファイル処理'],keywords:['SORT','マッチング','履歴','健康診断'],original:legacy2016AutumnPm10Definition.build([0]),definition:legacy2016AutumnPm10Definition,originalPageAlt:q10OriginalPageAlt()},
 {number:11,title:'Javaの列挙型と電卓',pages:[53,54,55,56,57,58],topics:['プログラミング','Java','オブジェクト指向'],keywords:['enum','Stack','implements','ArithmeticException'],original:legacy2016AutumnPm11Definition.build([0]),definition:legacy2016AutumnPm11Definition,originalPageAlt:q11OriginalPageAlt()},
 {number:12,title:'CASL IIのリスト挿入・削除',pages:[59,60,61,62],topics:['プログラミング','CASL II','データ構造'],keywords:['リスト','GR','EGET','EFREE'],original:legacy2016AutumnPm12Definition.build([0]),definition:legacy2016AutumnPm12Definition,originalPageAlt:q12OriginalPageAlt()},
 {number:13,title:'表計算による作業工程と最短経路',pages:[63,64,65,66,67,68],topics:['プログラミング','表計算','アルゴリズム'],keywords:['表引き','照合検索','相対参照','最短経路'],original:q13Build([0],true),definition:legacy2016AutumnPm13Definition,originalPageAlt:q13OriginalPageAlt(),editorialContextTitles:[q13EditorialTitle]}
];
