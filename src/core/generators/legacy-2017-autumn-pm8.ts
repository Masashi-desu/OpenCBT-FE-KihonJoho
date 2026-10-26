import {field,figure,p,strings,table,variableNotes,type GenerationDefinition} from './definition';
import {legacy2017AutumnPm8Model as model,legacy2017AutumnPm8Banks as banks,legacy2017AutumnPm8Profiles as profiles,legacy2017AutumnPm8Figure as inspect,legacy2017AutumnPm8Visible as show,legacy2017AutumnPm8Valid as valid} from './legacy-2017-autumn-pm8-data';
export const legacy2017AutumnPm8CommonAssets=[4,5].map(n=>'asset-ipa-2017h29a-fe-pm-8-common-notation-p'+n);
export const legacy2017AutumnPm8Definition:GenerationDefinition={source:'2017h29a-fe-pm-8',title:'旧制度・午後：検査文字の生成と文字列・表の検証',version:'3.2.0',fields:[field('原と同じ役割の5文字×4行入力',0,3)],reference:[0],sourceAnswer:'エウエオウカ',
 notes:variableNotes+' 原8頁・6欄28択・a1/a2一組4択・全4表/3図/疑似言語2関数/1始まり/最短長/30文字割当を保持。N=30と割当表は固定。5文字4行の全4条件を，同じ位置の元文字列/生成例/4エラーcase/行と列の全検査文字/未知e/4文字択/説明へ同期する。case1は3文字目を隣の符号へ置換，case2は1/3交換，case3は1/2交換，case4は逆順とし，dの問いを変えず2/4が通る条件を独立確認する。fは元1行を除いて差替え，検査対象は末行を除く行と末列を除く列のままとする。図の未記入セルと網掛けe/最後右下セルを保持。共通疑似言語p4/5は問8専用固定context2画像から単独利用でも参照可能。原/基準/生成choiceShuffleAllowed=false。全28択・全生成条件・短い全入力/1文字変更は独立した固定重み表と検査文字候補総当たりで検算する。22新profilesは通常schema/dispatcher/registry/App受入れ未完。',
 build(values){const m=model(values),g=banks(values),draw=(i:number)=>{const f=inspect(profiles[i],values);return figure(profiles[i],values,f.caption,f.alt);};
  const gridValid=(first:string)=>{const grid=m.grid.map(r=>[...r]);grid[0]=[...first];return grid.slice(0,4).every(r=>valid(r.join('')))&&Array.from({length:5},(_,c)=>grid.map(r=>r[c]).join('')).every(valid);};
  const setText=(yes:boolean[])=>{const ids=yes.flatMap((b,i)=>b?[i+1]:[]);return ids.length?ids.join('と')+'である':'ない';};
  const dIndex=g.d.indexOf(setText(m.cases.map(valid))),fIndex=g.f.indexOf(setText(m.cases.map(gridValid)));if(dIndex<0||fIndex<0)throw Error('UNREPRESENTABLE_SOURCE_BANK');
  const counts=[4,4,4,6,4,6],offsets=[0,4,8,12,18,22],answers=[3,2,3,dIndex,g.e.indexOf(m.e),fIndex];return {
  contexts:[{title:'共通の擬似言語記法（原PDF物理4〜5頁）',presentation:'text_figure',blocks:[4,5].map((page,i)=>({type:'image' as const,assetId:legacy2017AutumnPm8CommonAssets[i],caption:'共通疑似言語記法 原物理p'+page}))}],
  prompt:[draw(0),p('問8　次のプログラムの説明及びプログラムを読んで，設問1〜4に答えよ。'),
  p('文字列の誤りを検出するために，N種類の文字に，0，1，…，N−1の整数値を重複なく割り当て，検査文字を生成するプログラムと，元となる文字列の末尾に検査文字を追加した検査文字付文字列を検証するプログラムである。ここで扱う30種類の文字，及び文字に割り当てた数値を，表1に示す。空白文字は“␣”と表記する。'),draw(1),
  p('〔プログラムの説明〕'),p('検査文字の生成と検査文字付文字列の検証の手順を示す。'),p('(1) 検査文字の生成'),
  p('① 文字列の末尾の文字を1番目の文字とし，文字列の先頭に向かって奇数番目の文字に割り当てた数値を2倍してNで割り，商と余りの和を求め，全て足し合わせる。'),p('② 偶数番目の文字に割り当てた数値は，そのまま全て足し合わせる。'),p('③ ①と②の結果を足し合わせる。'),p('④ Nから，③で求めた総和をNで割った余りを引く。さらにその結果を，Nで割り，余りを求める。求めた数値に対応する文字を検査文字とする。'),
  p('(2) 検査文字付文字列の検証'),p('① 検査文字付文字列の末尾の文字を1番目の文字とし，文字列の先頭に向かって偶数番目の文字に割り当てた数値を2倍してNで割り，商と余りの和を求め，全て足し合わせる。'),p('② 奇数番目の文字に割り当てた数値は，そのまま全て足し合わせる。'),p('③ ①と②の結果を足し合わせる。'),p('④ ③で求めた総和がNで割り切れる場合は，検査文字付文字列に誤りがないと判定する。Nで割り切れない場合は，検査文字付文字列に誤りがあると判定する。'),
  p('〔検査文字付文字列の生成例〕'),p(`表1及び検査文字の生成の手順を用いることによって，文字列${show(m.payload)}に対し，生成される検査文字は${show(m.check)}である。`),p(`検査文字付文字列は，文字列の末尾に検査文字を追加し，${show(m.payload+m.check)}となる。`),
  p('〔プログラムの仕様〕'),p('各関数の仕様を(1)〜(4)に示す。ここで，配列の添字は1から始まるものとする。'),
  p('(1) 関数calcCheckCharacterは，文字列及び文字列長を用いて生成した検査文字を返す。関数calcCheckCharacterの引数及び返却値の仕様は，表2のとおりである。'),draw(2),p('関数calcCheckCharacterは，関数getValue，関数getCharを使用する。'),
  p('(2) 関数validateCheckCharacterは，検査文字付文字列を検証し，検証結果を返す。関数validateCheckCharacterの引数及び返却値の仕様は，表3のとおりである。'),draw(3),p('関数validateCheckCharacterは，関数getValueを使用する。'),p('(3) 関数getValueは，表1に従い，引数として与えられた文字に割り当てた数値を返す。'),p('(4) 関数getCharは，表1に従い，引数として与えられた数値に対応する文字を返す。'),
  draw(4),draw(5),draw(6),draw(7),draw(8),draw(9),draw(10),draw(11),draw(12),draw(13),
  p('本プログラムを文字列長が同じである複数の文字列に対して適用することを考える（図1参照）。'),draw(14),p('〔考え方〕'),p('文字列長がnであるm個の文字列について考える。文字列に対して，(m＋1)行(n＋1)列の表を用意する。以後，この表を検査文字付表という。'),p('(1) 検査文字の生成'),draw(15),draw(16),
  p('(2) 検査文字付表の検証'),p('(1)で作成した検査文字付表の，最下行を除く各行と最右列を除く各列を文字列とみなし，それぞれ関数validateCheckCharacterで検証した結果，全て誤りがないと判定された場合には，検査文字付表に誤りがないと判定する。一つでも誤りがあると判定された場合には，検査文字付表に誤りがあると判定する。'),draw(17),draw(18),draw(19),draw(20),draw(21)],
  choices:[...g.a.map(row=>[table('aに関する解答群',['a1','a2'],[row])]),...strings(g.b),...strings(g.c),...strings(g.d),...strings(g.e),...strings(g.f)],
  answerParts:counts.map((count,i)=>({id:'part-'+'abcdef'[i],label:`設問${i<3?1:i-1} ${'abcdef'[i]}`,choiceIds:Array.from({length:count},(_,j)=>'choice-value-'+(offsets[i]+j+1))})),partAnswers:answers.map((a,i)=>({kind:'choice' as const,partId:'part-'+'abcdef'[i],choiceId:'choice-value-'+(offsets[i]+a+1)})),
  explanation:[
  'a1，a2：生成では右端が奇数番目なので2倍後の商と余りを足す。初期is_even=falseで，is_even=trueのときだけ元のvalueを加えるからa1はtrue。検証では追加した検査文字が右端の奇数番目なので元のvalueを加える。初期is_odd=trueで，is_odd=trueのときだけ元のvalueを加えるからa2もtrueとなる。二つの関数で文字列長が1違うことに注意する。',
  'b：(N−sum % N) % Nで，総和と検査文字の値の合計をNの倍数にする。単にN−sum % Nだけでは余り0のときNを返してしまい，0〜N−1の割当範囲から外れる。sum % Nをそのまま返す式は余りの補数にならない。',
  'c：sum % N≠0のときに誤りとしてret_valueをfalseにする。商が0かどうかは割り切れることとは異なる。sum % N＝0を条件にすると正しい文字列を誤りと判定してしまう。',
  `d：生成例${show(m.payload+m.check)}の先頭3文字の1番目/3番目は同じ重みなので，この2文字を交換したケース2は総和が変わらない。5文字全体の逆順でも奇偶位置が保たれ，ケース4も通る。ケース1の1文字変更とケース3の異なる重み位置の交換は，今回の文字では検出される。実際の検証結果は${m.cases.map((s,i)=>(i+1)+':'+(valid(s)?'誤りなし':'誤りあり')).join('，')}となる。全ての複数文字誤りを検出できるという意味ではない。`,
  `e：第5列の元4文字は${show(m.rows.map(r=>r[4]).join(''))}である。この列だけを上から下への文字列とし，末尾から交互の重みを適用して検査文字を求めると${show(m.e)}となる。全行の末尾文字を使う計算や，文字を上から1番目として生成の奇偶を逆にする計算とは異なる。`,
  'f：ケース2と4は行の検査には通るが，元と異なる文字のある列は，列内で1文字だけが変更される。列の検査はこれを検出する。ケース1と3は行の検査でも誤りとなるので，行と列の全ての検査を通るケースはない。最下行を行として検証したり，最右列を列として検証したりする追加条件は使わない。',
  '検査文字は誤りの検出用に付ける文字であり，内容の正しさや改ざんの不存在を保証する署名ではない。本問の0〜29の文字値は表1独自の割当を使う。',
  ].join('\n'),
 };},
};
