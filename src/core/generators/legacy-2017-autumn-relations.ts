import {field,p,strings,variableNotes,type GenerationDefinition} from './definition';
/** Separate one-member group. Do not add this source to the reviewed quality9 export. */
export const legacy2017AutumnRelationsDefinitions:GenerationDefinition[]=[{
 source:'2017h29a-fe-am-47',title:'オブジェクト指向の関係の例',version:'3.2.0',sourceAnswer:'イ',fields:[field('関係の対象',0,1)],reference:[0],
 notes:variableNotes+'原4組の全文と役割を維持し、同じ位置の関係対象を型・個体/全体・構成要素へbindする。通常のOO関係例の読みであり、関連のない型名だけから現実の構成を普遍的に導くものではない。公園の必須設備、排他的所有、削除寿命、一個体一クラスを追加しない。実正答内容2種でfixed宣言なし。有限容量2、直前除外後1、参照0は恒久除外しない。旧quality9/R3閉包は不変の未登録専用group。',
 build(values){if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>1)throw Error('PARAMETER_CONSTRAINT');const v=values[0],targets=['クラスとオブジェクト','全体とその構成要素'];return{prompt:[p(`オブジェクト指向分析を用いてモデリングしたとき，${targets[v]}の関係になる組はどれか。`)],choices:strings(['公園，ぶらんこ','公園，代々木公園','鉄棒，ぶらんこ','中之島公園，代々木公園']),correctIndex:v===0?1:0,explanation:["公園は共通の特徴をもつ対象を表すクラスであり、代々木公園はその特定のオブジェクトである。公園と設備としてのぶらんこは全体と構成要素、鉄棒とぶらんこは異なる種類の遊具、中之島公園と代々木公園は二つの特定のオブジェクトという関係である。", "公園を全体、その設備であるぶらんこを構成要素とする関係が当てはまる。型名で表す場合も、その型の個体間の関係の例を表せる。公園と代々木公園はクラスとそのオブジェクト、鉄棒とぶらんこは異なる種類の遊具、中之島公園と代々木公園は二つの特定のオブジェクトである。全ての公園にぶらんこがあることや、排他的な所有・削除時の寿命を定めるものではない。"][v]};}
}];
