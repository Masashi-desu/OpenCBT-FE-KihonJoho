import {field,figure,p,strings,variableNotes,type GenerationDefinition} from './definition';
import {legacy2017AutumnPm6Model as model,legacy2017AutumnPm6Banks as banks,legacy2017AutumnPm6Profiles as profiles,legacy2017AutumnPm6Figure as inspect,legacy2017AutumnPm6Format as fmt} from './legacy-2017-autumn-pm6-data';
export const legacy2017AutumnPm6Definition:GenerationDefinition={
 source:'2017h29a-fe-pm-6',title:'旧制度・午後：運用サービスの予算策定と提示価格',version:'3.2.0',fields:[field('同じ費目/年度に対応する経済規模',0,3)],reference:[0],sourceAnswer:'カオエエアウエ',
 notes:variableNotes+' 原5頁・7欄36択・2表/非表示2セル・全段落/5予算規則・利益率の分母/最終丸めを保持。全4条件は経済規模1,3/5,4/5,6/5を各金額・全数値択へ同率で対応させる。金額整数/予算の平均/5%15%10%計算中間額/提示価格を整数に保ち，計算数と正答/誤答の比/間隔を原と同じにする。率系の問いを交換せず，比率の正答文が固定する理由を記録する。正答の選択記号は原順固定だがa/cの正答額は変わる。body内に全解答群を保持しchoiceShuffleAllowed=false。新16profilesの通常schema/dispatcher/registry/App受入れは未完。',
 build(values){const m=model(values),g=banks(values),draw=(i:number)=>{const f=inspect(profiles[i],values);return figure(profiles[i],values,f.caption,f.alt);};const offsets=[0,6,12,18,22,25,30],counts=[6,6,6,4,3,5,6],answers=[5,4,3,3,0,2,3],labels=['設問1','設問2 a','設問2 b','設問3 c','設問3 d','設問3 e','設問3 f'];return {
 prompt:[draw(0),p('問6　情報システム運用サービスの予算策定と提示価格の計算に関する次の記述を読んで，設問1〜3に答えよ。'),
 p('A社は，顧客であるB社に対して，情報システムの運用サービス（以下，B社サービスという）を提供している。A社の運用サービス部では，B社サービスの提供に必要な次年度の費用を見積もり，見積もった費用（以下，予算という）を営業部に提出している。毎年度，営業部では，運用サービス部で作成した予算を基に，所定の利益率が維持できるようにB社サービスの提示価格を算出してB社と交渉している。近年は，B社から価格を下げるよう要求されることが多くなってきている。'),
 p('B社サービスに関する2015〜2017年度の3年度分の予算と実際に掛かった費用（以下，実績という）は，表1のとおりである。ただし，2017年度の実績は見込みであるが，ここでは実績と呼ぶ。'),draw(1),
 p('設問1　運用サービス部では，B社サービスに関する2018年度の予算を作成するに当たって，表1を用いて2015〜2017年度の3年度分の予算と実績に関する傾向を分析した。正しい答えを，解答群の中から選べ。'),draw(9),draw(2),
 p('運用サービス部では，B社サービスに関する2018年度の予算を次のとおり作成した。'),
 p('(1) 人件費の予算は，2016年度の人件費の実績と同じとする。'),
 p('(2) サーバ費の予算は，2015〜2017年度のサーバ費の実績の平均とする。'),
 p('(3) PC費の予算は，2017年度のPC費の実績と同じとする。'),
 p('(4) ネットワーク費の予算は，ネットワーク費の実績を用いて，2016年度に対する2017年度の増分を2017年度の実績に加えたものとする。'),
 p('(5) その他経費の予算は，2015〜2017年度のその他経費の実績の平均とする。'),
 p('運用サービス部で作成したB社サービスに関する2018年度の予算を，表2に示す。'),draw(3),draw(4),draw(10),draw(11),draw(5),draw(6),
 p('営業部がB社にB社サービスの提示価格を提案したところ，提示価格から10%低い価格（以下，要求価格という）を要求された。'),draw(7),draw(8),draw(12),draw(13),draw(14),draw(15)],
 choices:strings(g.flat()),answerParts:counts.map((count,i)=>({id:'part-'+i,label:labels[i],choiceIds:Array.from({length:count},(_,j)=>'choice-value-'+(offsets[i]+j+1))})),partAnswers:answers.map((answer,i)=>({kind:'choice' as const,partId:'part-'+i,choiceId:'choice-value-'+(offsets[i]+answer+1)})),
 explanation:[
 `設問1：3年度の実績合計は${m.totals.filter((_,i)=>i%2===1).map(fmt).join('，')}千円で，それぞれ予算合計${m.totals.filter((_,i)=>i%2===0).map(fmt).join('，')}千円を上回る。人件費が過半ではない年度があり，サーバ実績は最後の年度に下がる。PC費は最初の増分が0で次の増分は正，ネットワーク予算も2年度連続減少ではない。その他経費は2015年度も第3位なので第2位という候補は誤り。`,
 `a：2017年度のネットワーク実績${fmt(m.costs[3][5])}に，前年度からの増分${fmt(m.costs[3][5])}−${fmt(m.costs[3][3])}を加えるので，${fmt(m.budget[3])}千円。前年実績/当年実績だけを使うことや，過去増分を取り違えることと区別する。`,
 `b：2018年度予算は費目順に${m.budget.map(fmt).join('，')}千円，合計${fmt(m.total)}千円。2017年度実績と各金額を各年度の合計で割って比較すると，人件費だけ割合が下がり，他の4費目は上がる。単なる金額の増減と構成比を混同しない。`,
 `c：提示価格をPとすると(P−${fmt(m.total)})÷P＝0.10。予算は提示価格の90%なので，P＝${fmt(m.total)}÷0.90＝${fmt(m.price)}千円。予算の90%の${fmt(m.scale(5670))}や，予算そのものの${fmt(m.total)}，予算へ10%を足す${fmt(m.scale(6930))}とは異なる。`,
 `d，e：削減額は人件費${fmt(m.budget[0])}×5%＋その他経費${fmt(m.budget[4])}×10%＝${fmt(m.total-m.firstTotal)}千円で，全体${fmt(m.total)}千円の10%未満である。要求価格${fmt(m.request)}千円から費用${fmt(m.firstTotal)}千円を引いた利益は正だが，率は元の10%より下がる。全費目を一律5%や10%で減らす計算ではない。`,
 `f：自動化後の費用は${m.automated.map(fmt).join('＋')}＝${fmt(m.automatedTotal)}千円。利益率の%表示は(${fmt(m.request)}−${fmt(m.automatedTotal)})÷${fmt(m.request)}×100。途中では丸めず，最後に小数第2位を四捨五入して${m.roundedMargin.toFixed(1)}%となる。15%は先の5%と合わせた人件費の総削減率であり，更に15%を掛けたり，サーバ費5%増やその他経費10%減を落としたりしない。`,
 'PCはPersonal Computer（パーソナルコンピュータ）で，本問のPC費はサーバ費やネットワーク費とは別の費目である。予算は予定費用，実績は実際の費用を指す。利益率は費用を分母とする上乗せ率とは異なる。',
 ].join('\n'),
 };},
};
