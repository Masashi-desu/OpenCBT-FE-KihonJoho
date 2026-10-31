/** Six annual preparation definitions. Shared runtime registration is pending. */
import {field,p,figure,strings,variableNotes,type GenerationDefinition} from './definition';

export const legacy2019GraphEdges=[['ab','bc','bd','cd','ce','ef'],['ab','bc','bd','ce','de','ef'],['ab','bc','bd','cd','ce','de','ef']] as const;
export function legacy2019GraphChoice(v:number,choice:number):string[]{
 const edges=[...legacy2019GraphEdges[v]] as string[],extra=['de','cd','be'][v];
 if(choice===0)return edges.filter(e=>e!=='bc').concat(extra).sort();
 if(choice===1)return edges.filter(e=>e!==['cd','ce','cd'][v]).concat(extra).sort();
 return(choice===2?edges:edges.concat(extra)).sort();
}
export const legacy2019CriticalDurations=[
 [1,5,3,3,4,5,4],[1,3,3,3,2,5,3],[1,3,3,3,2,5,4],[1,3,3,3,2,7,3],
 [1,3,1,6,2,3,3],[1,3,1,6,2,3,4],[1,3,1,6,2,3,6],[1,3,1,3,2,5,3],
 [1,3,1,3,2,5,4],[1,3,1,3,2,3,6],[1,3,1,3,2,5,6],[1,3,1,3,4,3,4],
] as const;
export const legacy2019HttpPacketChoices=[
 [['AB_request','CB_response'],['AB_request'],['BA_response'],['BC_request','CB_response']],
 [['BC_request','BA_response'],['BC_request'],['CB_response'],['AB_request','BA_response']],
] as const;
const packetText:Record<string,string>={AB_request:'AからBへのHTTP要求',BC_request:'BからCへのHTTP要求',BA_response:'BからAへのHTTP応答',CB_response:'CからBへのHTTP応答'};
export const legacy2019BnfLines=(v:number)=>['<数字> ::= 0|1|2|3|4|5|6|7|8|9','<英字> ::= A|B|C|D|E|F','<英数字> ::= <英字>|<数字>|_','<変数名> ::= <英字>|'+(v===0?'<変数名><英数字>':'<英数字><変数名>')];
const dfdAlt='左の長方形から上左の丸へ右向き矢印。上左の丸から中央の二本の横平行線へ右下向き矢印。平行線から下の丸へ右下向き矢印。下の丸から上右の丸へ右上向き矢印。上右の丸から右の長方形へ右向き矢印。丸3個、長方形2個、二本平行線1組、矢印5本。';
export function legacy2019AutumnStructuresAlt(profile:string,values:number[]):string{
 if(profile==='legacy-2019-bnf-rules')return `BNFの4定義。${legacy2019BnfLines(values[0]).join('；')}。`;
 if(profile==='legacy-2019-adjacency-matrix'){const es=legacy2019GraphEdges[values[0]],names='abcdef';return`隣接行列。行と列はともにa,b,c,d,e,fの順。角括弧内の6行は、${[...names].map(a=>[...names].map(b=>es.some(e=>e===[a,b].sort().join(''))?'1':'0').join(',')).join('；')}。`;}
 if(profile==='legacy-2019-adjacency-graph')return`横にa,b,c,d,e,fの丸。結ぶ線は${legacy2019GraphChoice(values[0],values[1]).map(e=>`${e[0]}と${e[1]}`).join('、')}。離れた丸の間は弧で結び、途中の丸とは接続しない。`;
 if(profile==='legacy-2019-density-plot'){const [m,s,r]=values,mu=60+m*10,sd=10+s*2;return[
 `横軸${mu}を中心に左右対称の一つの山。${mu}と${mu+sd}に破線垂線、二つの垂線間の幅は${sd}。`,
 `横軸${mu}を中心に左右対称の細い一つの山。${mu-sd/2},${mu},${mu+sd/2}に破線垂線、両外側の垂線間の幅は${sd}。`,
 `横軸${mu-50}の小さい山と${mu}付近の大きい山の二つの山。${mu-50}と${mu}に破線垂線。`,
 `横軸${mu}に頂点のある一つの山。左側の裾が右側より長い。${mu-sd}と${mu}に破線垂線、垂線間の幅は${sd}。`,
 ][r];}
 if(profile==='legacy-2019-dfd-symbols')return dfdAlt;
 if(profile==='legacy-2019-critical-network'){const d=legacy2019CriticalDurations[values[0]];return`空の丸6個。左端から上左へA ${d[0]}日、左端から下左へB ${d[1]}日、上左から下左へC ${d[2]}日、上左から上右へD ${d[3]}日、下左から下右へE ${d[4]}日、下右から右端へF ${d[5]}日、上右から右端へG ${d[6]}日の実線矢印。下右から上右へ破線のダミー作業。凡例は実線矢印の上に作業名、下に所要日数、破線矢印はダミー作業。`;}
 throw Error('UNKNOWN_LEGACY_2019_STRUCTURES_FIGURE');
}
const f=(profile:string,values:number[],caption:string)=>figure(profile,values,caption,legacy2019AutumnStructuresAlt(profile,values));
const make=(n:number,title:string,answer:string,fields:GenerationDefinition['fields'],reference:number[],build:GenerationDefinition['build'],notes:string):GenerationDefinition=>({source:`2019r01a-fe-am-${n}`,title,sourceAnswer:answer,fields,reference,version:'3.2.0',notes:variableNotes+' '+notes,build(v){if(v.length!==fields.length||v.some((n,i)=>!Number.isInteger(n)||n<fields[i].minimum||n>fields[i].maximum))throw Error('PARAMETER_CONSTRAINT');return build(v);}});
export const legacy2019AutumnStructuresDefinitions:GenerationDefinition[]=[
 make(3,'隣接行列と無向グラフ','ウ',[field('実接続の条件',0,2)],[0],([v])=>{const edges=legacy2019GraphEdges[v];return{prompt:[p('ノードとノードの間のエッジの有無を、隣接行列を用いて表す。ある無向グラフの隣接行列が次の場合、グラフで表現したものはどれか。ここで、ノードを隣接行列の行と列に対応させて、ノード間にエッジが存在する場合は1で、エッジが存在しない場合は0で示す。'),f('legacy-2019-adjacency-matrix',[v],'隣接行列')],choices:[0,1,2,3].map(c=>[f('legacy-2019-adjacency-graph',[v,c],'無向グラフ')]),correctIndex:2,explanation:`行列は行と列の両方をノードに対応させ、1の組を結ぶ。無向なので対称位置の1は同じ辺を指し、二重には数えない。この条件の辺は${edges.map(e=>`${e[0]}―${e[1]}`).join('、')}の${edges.length}本である。これらに過不足なく一致する図を選ぶ。他の二つの図は必要な辺を一本欠いて別の辺を一本加え、残る図は必要な辺に余分な一本を加えている。見た目の形が似ていてもa〜fのラベルとの対応を変えて比較してはいけない。弧が別のノードの上下を通るだけでは、その途中のノードとの接続を意味しない。`};},'6×6の角括弧行列/6ノード/4図/全注記を保持。3条件は名前変更でない非同型接続。二つの一辺置換/完全一致/余分一辺という四役割。'),
 make(5,'平均と標準偏差から正規分布を選ぶ','ア',[field('平均の条件',0,2),field('標準偏差の条件',0,2)],[0,0],([m,s])=>{const mu=60+m*10,sd=10+s*2;return{prompt:[p(`平均が${mu}、標準偏差が${sd}の正規分布を表すグラフはどれか。`)],choices:[0,1,2,3].map(r=>[f('legacy-2019-density-plot',[m,s,r],'分布のグラフ')]),correctIndex:0,explanation:`正規分布は平均${mu}を中心として左右対称の単峰の密度曲線であり、中心から左右それぞれ標準偏差${sd}だけ離れた位置に変曲点がある。中心${mu}から右の${mu+sd}までの幅が${sd}の対称な曲線が該当する。${mu-sd/2}から${mu+sd/2}までの全幅が${sd}の細い対称曲線では、中心から片側の変曲点までの距離は${sd/2}である。二つの山をもつ曲線と、左の裾が右より長い非対称の曲線は、いずれも正規分布の形ではない。高さだけでなく中心、対称性、広がりを合わせて読む。`};},'平均3×標準偏差3。原の4図の定性的役割と整数マーカを保持。C/Dは独自構成密度であり原の未公開の厳密な関数を復元したとはしない。'),
 make(7,'BNFで定義した変数名','エ',[field('再帰生成の方向',0,1)],[0],([v])=>({prompt:[p('次のBNFで定義される＜変数名＞に合致するものはどれか。'),f('legacy-2019-bnf-rules',[v],'BNFの定義')],choices:strings(v===0?['_B39','246','3E5','F5_1']:['93B_','642','5E3','1_5F']),correctIndex:3,explanation:v===0?'最初に<変数名>を<英字>で置き換え、再帰規則で右側へ<英数字>を追加できる。したがって先頭はA〜Fの英字で、その後はA〜F、0〜9、_を並べられる。F5_1はFの後ろへ5、_、1を追加して導出できる。_B39は_、246と3E5は数字から始まり、先頭の英字という条件を満たさない。ここで使う定義は提示したBNFであり、他のプログラム言語の識別子規則ではない。':'最初に<変数名>を<英字>で置き換え、再帰規則で左側へ<英数字>を追加できる。したがって末尾はA〜Fの英字で、それより前にはA〜F、0〜9、_を並べられる。1_5FはFの左へ5、_、1を追加して導出できる。93B_は_、642と5E3は数字で終わり、末尾の英字という条件を満たさない。ここで使う定義は提示したBNFであり、他のプログラム言語の識別子規則ではない。'}),'4定義行/4語の長さと境界違反役割を保持。appendとprependという実際の言語条件2件。'),
 make(34,'HTTPプロキシの宛先ポート','イ',[field('対象のTCP接続',0,1)],[0],([v])=>{const port=v===0?8080:80;return{prompt:[p(`クライアントAがポート番号8080のHTTPプロキシサーバBを経由してポート番号80のWebサーバCにアクセスしているとき、宛先ポート番号が常に${port}になるTCPパケットはどれか。`)],choices:strings(legacy2019HttpPacketChoices[v].map(ps=>ps.map(p=>packetText[p]).join('及び')+(ps.length===1?'だけ':''))),correctIndex:1,explanation:`AとBの間、BとCの間には別々のTCP接続がある。AからBへのHTTP要求の宛先はBの待受ポート8080、BからCへのHTTP要求の宛先はCの待受ポート80となる。このため常に${port}になるのは${v===0?'AからB':'BからC'}へのHTTP要求だけである。BからAへの応答はA側の接続のローカルポートへ、CからBへの応答はBが外向き接続に使ったローカルポートへ戻る。その番号が偶然${port}と等しい場合はあっても、問題の条件から常に等しいとはいえない。要求の待受ポートと応答の戻り先を区別し、複数パケットを列挙した候補は全てが指定番号になるかを調べる。`};},'8080/80の対象接続を切替え、原4群の通信役割と2/1/1/2パケット数を対称バインド。応答が指定番号に絶対ならないとは説明しない。'),
 make(45,'DFDの記号の意味','エ',[field('対象の図形',0,2)],[0],([v])=>({prompt:[p(`図は、構造化分析法で用いられるDFDの例である。図中の“${['○','二本の平行線','矢印'][v]}”が表しているものはどれか。`),f('legacy-2019-dfd-symbols',[0],'DFDの例')],choices:strings(['アクティビティ','データストア','データフロー','プロセス']),correctIndex:[3,1,2][v],explanation:['本図のDFDの記法では、丸はデータを入力して加工し出力するプロセスを表す。','本図のDFDの記法では、二本の平行線はデータを保存するデータストアを表す。','本図のDFDの記法では、矢印はデータの移動と向きを表すデータフローである。'][v]+' 丸、二本の平行線、矢印、外部との入出力を示す長方形を区別する。アクティビティは一般には活動を表す語として使われるが、本図の丸に対応する形式上の名称はプロセスである。一般語としての活動と処理が全面的に排他的だという意味ではない。別種の図で使われる記号名を、そのままこのDFDへ当てはめない。'}),'原の丸3/長方形2/平行線1/5矢印を固定。対象図形だけを3条件へ変え、altは可視形状/接続だけで正答概念名を含めない。'),
 make(52,'クリティカルパス','ウ',[field('作業日数の条件',0,11)],[0],([v])=>{const [a,b,c,d,e,fv,g]=legacy2019CriticalDurations[v],totals=[a+c+e+fv,a+d+g,b+e+fv,b+e+g],unlisted=a+c+e+g,max=Math.max(...totals,unlisted),correctIndex=totals.indexOf(max);return{prompt:[p('あるプロジェクトの日程計画をアローダイアグラムで示す。クリティカルパスはどれか。'),f('legacy-2019-critical-network',[v],'プロジェクトの日程計画')],choices:strings(['A，C，E，F','A，D，G','B，E，F','B，E，G']),correctIndex,explanation:`開始から終了までの経路の所要日数を比較する。A→C→E→Fは${a}+${c}+${e}+${fv}=${totals[0]}日、A→D→Gは${a}+${d}+${g}=${totals[1]}日、B→E→Fは${b}+${e}+${fv}=${totals[2]}日、B→E→ダミー→Gは${b}+${e}+${g}=${totals[3]}日である。候補にないA→C→E→ダミー→Gも${a}+${c}+${e}+${g}=${unlisted}日となる。ダミー作業は先行関係を示し、所要日数を加算しない。全経路のうち最長の${max}日となる${['A→C→E→F','A→D→G','B→E→F','B→E→ダミー→G'][correctIndex]}が、この条件で一意のクリティカルパスである。短い経路を最短工期と取り違えず、全ての先行作業の終了を待ってプロジェクトを完了させる。`};},'原の空円6/実作業7/破線ダミー/全凡例/原4パスを保持。候補にない第5経路も検算。1桁正整数工期、最長10〜19日、一意最長、次点差1〜2日。数値誤答の公式意図は推定しない。'),
];
