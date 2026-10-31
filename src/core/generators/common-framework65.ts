import {field,p,strings,variableNotes,type GenerationDefinition}from './definition';
import input from './common-framework65-cases.json';
/** Logic is MIT. Japanese teaching content in the imported cases, its source
 * phrasing and explanatory adaptations is CC BY-SA 2.1 JP; IPA exam composition
 * also retains its separate conditions. See the content scope notice. */
export const commonFramework65Sources=['2017h29h-fe-am-65','2019r01a-fe-am-65']as const;
export const commonFramework65Definitions:readonly GenerationDefinition[]=commonFramework65Sources.map(source=>({
 source,title:'非機能要件の定義で行う作業',sourceAnswer:'イ',version:'3.2.0',
 fields:[field('開発条件と業務機能の状況',0,3)],reference:[0],
 notes:variableNotes+' 原の短い肯定の問いと文章4択を固定。データの受渡し/実現範囲/外部連携という三つの機能要件の役割と，開発言語・開発標準という技術条件の役割を保つ。4候補では例外・異常通知の記述規則，警告設定とビルド指定，型と共通部品呼出しの規約へ実装時の制約を変え，誤答の作業条件も変える。名称置換/並替は容量に数えない。隣接JISの品質分類や機能要件定義文を取り込まない。教材本文と解説の派生部分はCC BY-SA2.1JPを継承する。',
 build:values=>{if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>3)throw Error('PARAMETER_CONSTRAINT');const row=input.cases[values[0]];return{prompt:[p('非機能要件の定義で行う作業はどれか。')],choices:strings([...row.choices]),correctIndex:1,explanation:row.explanation};},
}));
