import type{Attribution,Block}from'../types';
import{field,p,table,strings,variableNotes,type GenerationDefinition}from'./definition';
import{autumnStressCases,autumnStressConditions,autumnStressBanks,autumnStressIndependentRatingExample,autumnStressModel,autumnStressFigureAlt,autumnStressSource}from'./legacy-2019-autumn-pm5-model';
const attribution:Attribution={origin:'adapted',sourceRefs:[24,25,26,27].map(page=>({sourceId:'source-ipa-'+autumnStressSource+'-qs',locator:{section:'令和元年度 秋期 基本情報技術者試験 旧制度・午後 問5',page,year:2019,period:'秋期',exam:'基本情報技術者試験',subject:'旧制度・午後',timeSlot:'午後',questionNumber:'5'}})),rightsRefs:['rights-ipa-'+autumnStressSource,'rights-original'],creatorIds:['codex']};
function diagram(profile:string,values:number[],caption:string):Block{return{type:'diagram',id:'diagram-'+profile,rendererRef:{id:'renderer-source-figures',version:'1.0.0'},caption,alt:autumnStressFigureAlt(profile,values),scene:{kind:'source_figure',profile,values},attribution};}
export const legacy2019AutumnStressDefinitions:GenerationDefinition[]=[{
 source:autumnStressSource,title:'旧制度・午後：ストレス判定処理の流れ図と最少テスト',version:'3.2.0',fields:[field('testRowsCase',0,autumnStressCases.length-1),field('numericCase',0,2)],reference:[0,0],sourceAnswer:'設問1 aア bオ cク dキ／設問2 eオ fク',
 notes:variableNotes+' 原票の第三者質問文は含めず、原側にも改変を明示する独立採点ID表を使用する候補。57項目/領域別個数/1〜4点/77・63・76/範囲図/三方向と二方向の流れ/6欄/8・10択/最少件数を維持する。判定条件は制度の事実として固定し、6行の数値と役割配置を37×3条件で変更する。医療・制度運用のための質問票ではない。raw QS24〜27は未確認素材を含むため収録しない。',
 build:values=>{const m=autumnStressModel(values);const prompt:Block[]=[
  p('問5。ストレスチェックの判定処理を検査するシステムに関する次の記述を読み、設問1、2に答えよ。'),
  p('K社は、領域ごとの回答の合計点から高ストレスに該当する範囲を判別する処理を開発している。ここでは、原問の数値条件と判定処理を検討するための独立編集資料を用いる。第三者の質問票項目文は収録せず、表1の項目は採点の対応を示す独立した識別子で表す。資料を変更した改変問題であり、実際の質問票を用いたストレスチェックの実施用資料ではない。'),
  p('項目は、仕事上の負担の原因に関する領域Aの17項目、心身の自覚に関する領域Bの29項目、周囲の支援に関する領域Cの9項目、仕事及び生活の満足に関する領域Dの2項目の計57項目とする。全ての項目に四つの回答候補から一つを選ぶ。各候補の点数は1、2、3、4点のいずれかである。'),
  p('表1は領域Aの一部の採点例である。回答候補1〜4は独立編集資料内の候補識別子であり、元の質問票の質問文・回答文ではない。点数の対応と選択例を示している。'),
  table('表1 独立編集した採点の対応・選択例（領域Aの一部）',['項目ID','回答候補1','回答候補2','回答候補3','回答候補4','例の点数'],autumnStressIndependentRatingExample.map(row=>[row.id,...row.scores.map((score,i)=>(i===row.selected?'○ ':'')+String(score)),String(row.score)])),
  p('領域ごとに回答の合計点を求め、次の①又は②を満たす場合に高ストレスに該当すると判別する。領域Dの合計点は判別に利用しない。① 領域Bの合計点が77点以上である。② 領域Bの合計点が63点以上76点以下であり、かつ領域AとCの合計点の和が76点以上である。'),
  diagram('legacy-2019-autumn-pm5-stress-range',values,'図1 高ストレス者と判別する範囲（網掛け、独立作図）'),
  p('設問1 図2中の［a］〜［d］に入れる正しい答えを、a〜dに関する共通の解答群からそれぞれ選べ。判別結果には初期値として0を格納し、高ストレスに該当するときは1を格納する。'),
  diagram('legacy-2019-autumn-pm5-stress-flow',values,'図2 高ストレス者を判別する処理の流れ図（独立作図）'),
  p('設問2 次の記述中の［e］、［f］に入れる適切な答えを、e、fに関する共通の解答群からそれぞれ選べ。'),
  p('各テストデータは、領域A〜Cの合計点が表2の値となるように、全項目への回答を用意したものである。図1の①、②、それ以外の場合を判別できるかをテストするにはテストデータ［e］を用いる。また、図2で分岐による全てのパスを通るテストをするにはテストデータ［f］を用いる。どちらも使用するテストデータの件数が最少となるようにする。'),
  table('表2 用意したテストデータの各領域の合計点',['テストデータ','領域Aの合計点','領域Bの合計点','領域Cの合計点'],m.rows.map((r,i)=>[String(i+1),...r.map(String)])),
 ];const ids=(start:number,count:number)=>Array.from({length:count},(_,i)=>'choice-value-'+(start+i)),ad=ids(1,8),ef=ids(9,10);return{prompt,choices:[...strings([...autumnStressConditions]),...strings(autumnStressBanks.map(b=>b.slice(0,-1).join('、')+'及び'+b.at(-1)))],answerParts:['a','b','c','d','e','f'].map((name,i)=>({id:'part-'+name,label:`設問${i<4?1:2} ${name}`,choiceIds:i<4?ad:ef})),partAnswers:[0,4,7,6,m.e+8,m.f+8].map((answer,i)=>({kind:'choice' as const,partId:'part-'+'abcdef'[i],choiceId:'choice-value-'+(answer+1)})),explanation:`aは62点以下、bは63点以上かつ76点以下、cは76点以上、dは75点以下。これによりBの三つの出口とA+Cの二つの出口が、それぞれ重複も欠落もなく範囲を分ける。表2の各行は順に${m.results.map(r=>r.region===1?'①':r.region===2?'②':'それ以外').join('、')}。領域の三分類には最少${m.regionMinimum}件なのでeは${autumnStressBanks[m.e].join('、')}。経路は${m.paths.join('、')}の四種類を区別する必要があり、最少${m.pathMinimum}件なのでfは${autumnStressBanks[m.f].join('、')}。判定結果が同じ0でも、Bが62以下の経路と、Bが63〜76かつA+Cが75以下の経路は異なる。`};},
}];
