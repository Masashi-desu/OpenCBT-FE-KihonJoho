/** IPA 2017 spring PM7, source-owned transcription (QS physical 31–34). */
import{DataError}from'../errors';
export const pm7Profile='legacy-2017-pm7-inventory';
export const pm7Pages=[31,32,33,34] as const;
export const pm7Labels='アイウエオカキクケコ';
export const pm7Source={
 title:'在庫補充方法の変更',
 notice:'選択した問題は，選択欄の選をマークしてください。マークがない場合は，採点されません。',
 heading:'問7　在庫補充方法の変更に関する次の記述を読んで，設問1〜3に答えよ。',
 intro:'食品メーカのM社では，コスト削減やキャッシュフローの改善を目的として，自社の在庫補充方法を変更して在庫量の削減を図ることにした。従来は，毎週月曜日に，保管を委託している全ての配送倉庫の全商品について，配送倉庫ごとに，当該週を含む4週間分の出荷予想量と在庫量を比較し，出荷予想量に満たない量を工場から補充していた。このたびM社では，出荷予想量を算出する期間を見直し，配送倉庫，商品群，賞味期限ごとに在庫基準量を設定し，在庫量が在庫基準量に満たない場合，その差を在庫補充量として補充することにした。この新しい在庫補充方法を次に示す。',
 rules:[
  '販売量が多い商品群A，中程度の商品群B，少ない商品群Cの商品群別に管理する。',
  '賞味期限が短い商品（以下，短期品という）は，全ての商品群について2週間分の出荷予想量を在庫基準量とする。',
  '賞味期限が中程度の商品（以下，中期品という）は，商品群Aについて2週間分の出荷予想量を，商品群B及びCについて3週間分の出荷予想量を在庫基準量とする。',
  '賞味期限が長い商品（以下，長期品という）は，全ての商品群について3週間分の出荷予想量を在庫基準量とする。',
  '配送倉庫の中には，工場から遠く，すぐに在庫を補充できない配送倉庫（以下，遠隔地倉庫という）がある。遠隔地倉庫における商品群Aの商品の在庫基準量は，(2)〜(4)にかかわらず次のとおりとする。',
  '遠隔地倉庫における商品群B及びCの商品は全て，(2)〜(4)にかかわらず4週間分の出荷予想量を在庫基準量とする。',
 ],
 remoteA:['短期品は，2週間分の出荷予想量を在庫基準量とする。','中期品は，3週間分の出荷予想量を在庫基準量とする。','長期品は，4週間分の出荷予想量を在庫基準量とする。'],
 question1:'設問1　在庫量を削減することによって期待される効果に関する次の記述中の【無記名指示枠】に入れる適切な答えを，解答群の中から選べ。',
 effect:'M社では，在庫量を削減することによって，原材料購入から商品販売までの期間を短くできるので【a】できる。また，【b】の削減も期待できる。さらに，在庫として保存する期間が短くなるので，商品の【c】についても期待できる。',
 question2:'設問2　M社では，新しい在庫補充方法に合わせて在庫管理システムの変更を検討している。その準備として，在庫基準量を決定するために表1に示す決定表を作成した。表中の【無記名指示枠】に入れる正しい答えを，解答群の中から選べ。',
 question3:'設問3　M社では，新しい在庫補充方法による在庫量の削減効果を，遠隔地倉庫ではないN配送倉庫について見積もることにした。表2は，ある月曜日におけるN配送倉庫の在庫量及び4週間分の出荷予想量である。N配送倉庫の在庫補充量及び在庫量に関する次の記述中の【無記名指示枠】に入れる適切な答えを，解答群の中から選べ。',
 quantities:'新しい在庫補充方法に基づく商品Pの在庫補充量は【f】百箱となる。また，商品Rの在庫補充量は，従来の在庫補充方法に基づく在庫補充量に比べて【g】百箱の削減となる。商品P，Q，R，S及びTの合計では，新しい在庫補充方法の導入によって従来の在庫補充方法に比べて，補充後の在庫量を【h】百箱削減できる。',
 groups:{
  a:['売掛金の回収期間を短縮','買掛金の支払期間を延長','キャッシュの回収期間を短縮','資金の調達期間を延長'],
  b:['在庫スペースの縮小による保管コスト','商品種類の減少による管理コスト','商品種類の減少による商品開発コスト','フリーキャッシュフローの減少による事務コスト'],
  c:['欠品によって販売機会を逸失するリスクの低減','限界利益率の低下','賞味期限切れが発生するリスクの低減','損益分岐点販売量の増加'],
  d:[['短期品','中期品'],['短期品','長期品'],['中期品','短期品'],['中期品','長期品'],['長期品','短期品'],['長期品','中期品']],
  e:[[['X','−','−','X'],['−','X','X','−'],['−','−','−','−']],[['X','−','−','X'],['−','X','−','−'],['−','−','X','−']],[['−','−','−','X'],['X','X','X','−'],['−','−','−','−']],[['−','−','−','X'],['X','X','−','−'],['−','−','X','−']],[['−','−','−','−'],['X','X','−','X'],['−','−','X','−']],[['−','−','−','−'],['X','−','−','X'],['−','X','X','−']]],
  fgh:[30,60,70,120,170,180,230,300,400,440],
 },
 table1:{remote:['N','N','N','N','N','N','Y','Y','Y','Y'],groupA:['Y','Y','Y','N','N','N','Y','Y','Y','N'],condition1:['Y','N','N','Y','N','N','Y','N','N','−'],condition2:['−','Y','N','−','Y','N','−','Y','N','−'],actions:[['−','−','−',null,null,null,null,'−','−','X'],['X','−','−',null,null,null,null,'X','−','−'],['−','X','X',null,null,null,null,'−','X','−']]},
 rows:[
  {product:'P',group:'A',shelf:'短期品',stock:120,weekly:[100,80,50,70]},
  {product:'Q',group:'A',shelf:'中期品',stock:200,weekly:[120,140,100,120]},
  {product:'R',group:'B',shelf:'中期品',stock:30,weekly:[30,40,40,30]},
  {product:'S',group:'B',shelf:'長期品',stock:10,weekly:[20,20,20,20]},
  {product:'T',group:'C',shelf:'長期品',stock:10,weekly:[10,5,5,10]},
 ],
};
export function pm7Input(v:unknown):asserts v is number[]{
 if(!Array.isArray(v)||Object.getPrototypeOf(v)!==Array.prototype||v.length!==2||Reflect.ownKeys(v).length!==3)throw new DataError('GENERATION_PARAMETERS','PM7は商品群と数量の2条件です');
 for(let i=0;i<2;i++){const d=Object.getOwnPropertyDescriptor(v,String(i));if(!d||!('value'in d)||!d.enumerable||!Number.isSafeInteger(d.value)||Object.is(d.value,-0)||d.value<0||d.value>(i?1:2))throw new DataError('GENERATION_PARAMETERS','PM7の条件は指定された整数域です');}
}
export function pm7Rows(v:number[]){pm7Input(v);const rows=structuredClone(pm7Source.rows),scale=v[1]+1;if(v[0]===1)rows[1].group='B';if(v[0]===2)rows[2].group='A';for(const r of rows){r.stock*=scale;r.weekly=r.weekly.map(x=>x*scale);}return rows;}
export function pm7Figure(profile:string,values:number[]){
 if(profile!==pm7Profile||!Array.isArray(values)||Object.getPrototypeOf(values)!==Array.prototype||values.length!==4||Reflect.ownKeys(values).length!==5)throw new DataError('FIGURE_PROFILE','PM7の管理図条件が不正です');const descriptors=[0,1,2,3].map(j=>Object.getOwnPropertyDescriptor(values,String(j)));if(descriptors.some(d=>!d||!('value'in d)||!d.enumerable||!Number.isSafeInteger(d.value)||Object.is(d.value,-0)||d.value<0))throw new DataError('FIGURE_PROFILE','PM7の管理図条件は整数です');const[k,i,...v]=descriptors.map(d=>d!.value as number);pm7Input(v);
 if(k>6||i>(k===1||k===2||k===4?5:0))throw new DataError('FIGURE_PROFILE','PM7の管理図種別が不正です');
 if(k===0)return{kind:'decision'as const,caption:'表1　新しい在庫補充方法における在庫基準量の決定表',alt:'条件は遠隔地倉庫、A商品群、空欄dの2行。各行10列。遠隔地倉庫 '+pm7Source.table1.remote.join('、')+'。A商品群 '+pm7Source.table1.groupA.join('、')+'。d上行 '+pm7Source.table1.condition1.join('、')+'。d下行 '+pm7Source.table1.condition2.join('、')+'。4週間、3週間、2週間の処理行。4〜7列の3行×4列は一つの空欄e。',data:structuredClone(pm7Source.table1)};
 if(k===1)return{kind:'pair'as const,caption:'dに関する解答群',alt:pm7Source.groups.d[i].join('、'),data:structuredClone(pm7Source.groups.d[i])};
 if(k===2)return{kind:'matrix'as const,caption:'eに関する解答群',alt:pm7Source.groups.e[i].map(r=>r.join('、')).join('。'),data:structuredClone(pm7Source.groups.e[i])};
 if(k===4){const text=[pm7Source.notice,pm7Source.question1,pm7Source.effect,pm7Source.question2,pm7Source.question3,pm7Source.quantities][i];return{kind:'text'as const,caption:i===0?'問題選択の注意書き':'問7の本文',alt:text,data:text};}
 if(k===5)return{kind:'pair-bank'as const,caption:'dに関する解答群',alt:pm7Source.groups.d.map((x,i)=>pm7Labels[i]+' '+x.join('、')).join('。'),data:structuredClone(pm7Source.groups.d)};
 if(k===6)return{kind:'matrix-bank'as const,caption:'eに関する解答群',alt:pm7Source.groups.e.map((x,i)=>pm7Labels[i]+' '+x.map(r=>r.join('、')).join('。')).join('。'),data:structuredClone(pm7Source.groups.e)};
 if(k===3)return{kind:'inventory'as const,caption:'表2　N配送倉庫の在庫量及び4週間分の出荷予想量',alt:'単位：百箱。列は商品、商品群、賞味期限の区分、在庫量、出荷予想量の1週目（当該週）〜4週目。'+pm7Rows(v).map(r=>[r.product,r.group,r.shelf,r.stock,...r.weekly].join('、')).join('。'),data:pm7Rows(v)};
 throw Error('PM7_FIGURE_VALUES');
}
