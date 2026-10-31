import {p,strings,field,type GenerationDefinition,type GeneratedBody} from './definition';

const prompt='JIS Q 27001:2014（情報セキュリティマネジメントシステム－要求事項）に基づいてISMS内部監査を行った結果として判明した状況のうち，監査人が指摘事項として監査報告書に記載すべきものはどれか。';
// These are source-local audit examples. No JIS/JIPDEC passage or figure is
// used as generated content. Each changed condition has independent review.
const media=[
 'USBメモリの使用を，定められた手順に従って許可していた。',
 '定めた手順に従い，業務用USBメモリへの書込みを禁止し，読取りだけを許可していた。',
];
const incident=[
 '個人情報の誤廃棄事故を主務官庁などに，規定されたとおりに報告していた。',
 '個人情報の誤廃棄事故を，規定された期限内に主務官庁などへ報告し，再発防止策を実施していた。',
];
const malware=[
 'マルウェアスキャンでスパイウェアが検知され，駆除されていた。',
 'スパイウェアを検知した端末をネットワークから隔離し，駆除と安全確認後に接続を戻していた。',
];
const risk=[
 'リスクアセスメントを実施した後に，リスク受容基準を決めた。',
 '事前に定めたリスク受容基準に合うかどうかを確認せず，リスクを受容すると決めていた。',
];
function ownValues(values:number[]):number[]{
 if(!Array.isArray(values)||Object.getPrototypeOf(values)!==Array.prototype||values.length!==4||Reflect.ownKeys(values).length!==5)throw Error('PARAMETER_CONSTRAINT');
 return Array.from({length:4},(_,i)=>{const d=Object.getOwnPropertyDescriptor(values,String(i));if(!d||!d.enumerable||!('value'in d)||!Number.isInteger(d.value)||Object.is(d.value,-0)||d.value<0||d.value>1)throw Error('PARAMETER_CONSTRAINT');return d.value as number;});
}
function build(input:number[]):GeneratedBody{
 const v=ownValues(input);
 const safe=[
  v[0]?'USBメモリは組織が定めた書込み禁止・読取り許可の範囲で運用されている。':'USBメモリは定められた許可手順に従って使われている。',
  v[1]?'誤廃棄事故は規定の期限内に報告され，再発防止策も実施されている。':'誤廃棄事故は規定に従って報告されている。',
  v[2]?'スパイウェアへの対応では，端末の隔離，駆除，安全確認を経て接続を戻している。':'検知したスパイウェアは駆除されている。',
 ];
 const issue=v[3]?'受容基準を先に定めても，個々のリスクがその基準に合うかを確かめずに受容すれば，受容判断の根拠を示せない。':'評価結果を比べる基準は，評価を始める前に決めておく必要がある。評価を終えてから受容基準を決めると，結果に都合よく合わせるおそれがある。';
 return{prompt:[p(prompt)],choices:strings([media[v[0]],incident[v[1]],malware[v[2]],risk[v[3]]]),correctIndex:3,
  explanation:issue+' '+safe.join('')+' これら三つの記述自体には手順違反を示す状況がないため，リスクの評価・受容の進め方が指摘対象となる。USBの利用やマルウェアの検知だけで直ちに不適合と決めるのではなく，表示された手順と対応を確認する。'};
}
export const legacy2018Autumn58Definition:GenerationDefinition={source:'2018h30a-fe-am-58',title:'ISMS内部監査とリスク受容基準',version:'3.2.0',
 fields:['USB媒体管理','事故報告','マルウェア対応','リスク評価・受容'].map(name=>field(name,0,1)),reference:[0,0,0,0],sourceAnswer:'エ',answerVariation:'fixed',
 notes:'JIS Q 27001:2014の版，監査指摘の方向，4つの文章事例と役割を維持する。USBの読書き許可，報告期限と再発防止，隔離と復帰確認，評価前の基準設定又は受容時の照合という実条件を各位置へbindする。16条件は選択肢順の変更や同義語の置換ではない。規格本文・第三者の図表/定義を追加せず，解説は独自記述。',build};
export const legacy2018Autumn58Definitions=[legacy2018Autumn58Definition];
