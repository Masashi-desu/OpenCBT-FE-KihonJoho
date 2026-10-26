import {field,figure,p,programs,strings,variableNotes,type GenerationDefinition} from './definition';
import {legacy2017Pm10Input,legacy2017Pm10Model,legacy2017Pm10Profiles,legacy2017Pm10Figure} from './legacy-2017-pm10-data';
const a=['SRT-AMOUNT','SRT-BRANCH','SRT-DATE','SRT-NO'];
const b=['MST-YYYYMM = SRT-YYYYMM','MST-YYYYMM NOT = SRT-YYYYMM','MST-YYYYMM = ZERO','SRT-YYYYMM = ZERO'];
const cd=['ADD MST-BRANCH(CNT) TO MST-AMOUNT','ADD MST-BRANCH(SRT-BRANCH) TO MST-AMOUNT','ADD SRT-AMOUNT TO MST-BRANCH(CNT)','ADD SRT-AMOUNT TO MST-BRANCH(SRT-BRANCH)','MOVE SRT-AMOUNT TO MST-BRANCH(SRT-BRANCH)'];
const e=['行番号30と31の間','行番号40と41の間','行番号47と48の間','行番号52と53の間'];
const g=['ADD 1 TO CR-QUART','ADD 3 TO CR-QUART','MOVE CNT TO CR-QUART','MOVE ZERO TO CR-QUART'];
export const legacy2017Pm10Definition:GenerationDefinition={
  source:'2017h29h-fe-pm-10',title:'旧制度・午後：COBOLによる月別・四半期別売上集計',version:'3.2.0',fields:[field('事業年度の開始月（4・5・6月）',0,2)],reference:[0],sourceAnswer:'設問1 a=ウ、b=イ、c=エ、d=ア／設問2 e=エ、f=エ、g=ア',
  notes:variableNotes+' 原47〜51頁のCOBOL全54行、7欄25固有択30参照、二つのレコード図・表示例・変更表・全注意を保持。四半期は3か月ずつ/全4回、8支店、桁数、年月の整列、EOF時の最終月処理、2000年度からの既存マスタ、ゼロ件月なしを維持。事業年度開始月4/5/6の3条件で、終了月・四半期範囲・QUART-MONTH選択肢・解説を同期する。同じ四半期末月集合の巡回回転を追加容量へ数えず、3つの異なる月集合と直前回避後2条件を保持する。会社名や並べ替えだけの変更にしない。付属資料なし。本文の全解答群とプログラム空欄を正規rendererで表示し、補助表の追加や解答欄の埋め込みをしない。choiceShuffleAllowedは原/基準/生成すべてfalse。',
  build(values){
    const v=legacy2017Pm10Input(values),m=legacy2017Pm10Model(v),f=['1 THRU 12',`${m.start} THRU ${m.start-1}`,m.starts.join(', '),m.ends.join(', ')];
    const draw=(i:number)=>{const z=legacy2017Pm10Figure(legacy2017Pm10Profiles[i],values);return figure(legacy2017Pm10Profiles[i],values,z.caption,z.alt);};
    const bank=(group:number)=>{const z=legacy2017Pm10Figure(legacy2017Pm10Profiles[5],[v,group]);return figure(legacy2017Pm10Profiles[5],[v,group],z.caption,z.alt);};
    const offsets=[0,4,8,8,13,17,21],counts=[4,4,5,5,4,4,4],answers=[2,1,3,0,3,3,0];
    return{prompt:[
      p('選択した問題は、選択欄の（選）をマークしてください。マークがない場合は、採点されません。'),p('問10 次のCOBOLプログラムの説明及びプログラムを読んで、設問1、2に答えよ。'),p('プログラムの説明'),
      p(`八つの支店をもつZ社は${m.start}月〜翌年${m.end}月を事業年度としており、毎年${m.start}月に前年度の売上データを集計して売上マスタファイルに格納する。このプログラムは、売上伝票ファイルに格納された前年度の売上データを集計して、売上マスタファイルに格納する。`),
      p('(1) 売上伝票ファイルは、図1に示すレコード様式の順ファイルである。'),draw(0),
      p('① 売上伝票ファイルには、前年度の全支店の売上データが、順不同で格納されている。レコード件数がゼロの月はない。'),
      p('② 支店番号には、各支店に対応する01〜08の番号が格納されている。支店1は01、支店2は02、…、支店8は08である。'),
      p('③ 伝票番号には、各支店で一意となる6桁の数字が格納されている。'),p('④ 売上日には、西暦の年、月、日が、それぞれ4桁、2桁、2桁で格納されている。'),
      p('(2) 売上マスタファイルは、図2に示すレコード様式の索引ファイルである。主キーは売上年月である。'),draw(1),
      p('① 売上年月には、西暦の年、月が、それぞれ4桁、2桁で格納される。'),p('② 支店別売上金額には、当該年月における各支店の売上金額が格納される。各支店の月間の売上金額が9桁を超えることはない。'),
      p('③ 売上金額合計には、当該年月における全支店の売上金額の合計が格納される。'),p('④ 売上マスタファイルには、このプログラムを実行する時点で、2000年度から前々年度までのデータが格納されている。'),
      draw(4),
      p('設問1 プログラム中の［a］〜［d］に入れる正しい答えを、解答群の中から選べ。'),bank(0),bank(1),bank(2),
      p(`設問2 前年度の売上データを集計して、売上マスタファイルに格納する際に、第1四半期から第4四半期の順に、当該四半期における全支店の売上金額の合計を表示するようにプログラムを変更する。第1四半期から第4四半期は、それぞれ${m.quarters.map(q=>`${q[0]}月〜${q[1]}月`).join('、')}である。表示例を図3に示す。表1中の［e］〜［g］に入れる正しい答えを、解答群の中から選べ。`),draw(2),draw(3),
      bank(3),bank(4),bank(5),
    ],choices:[...programs(a),...programs(b),...programs(cd),...strings(e),...programs(f),...programs(g)],
    answerParts:counts.map((n,i)=>({id:`part-${'abcdefg'[i]}`,label:`設問${i<4?1:2} ${'abcdefg'[i]}`,choiceIds:Array.from({length:n},(_,j)=>`choice-value-${offsets[i]+j+1}`)})),
    partAnswers:answers.map((n,i)=>({kind:'choice' as const,partId:`part-${'abcdefg'[i]}`,choiceId:`choice-value-${offsets[i]+n+1}`})),
    explanation:`a：売上日SRT-DATEで昇順整列すれば、年月ごとに連続したレコードを返す。金額、支店、支店ごとの伝票番号では年月順を保証しない。b：年月が前の集計キーと異なるとき、直前の月を書き出して領域を初期化し、新しい年月を設定する。初回のゼロ年月はWRI-PROCの年ゼロ検査で書き出さない。一致判定では月の境界を検出できず、ゼロだけの判定でも2月目以降を分離できない。c：伝票の金額をその伝票の支店番号SRT-BRANCHに対応するMST-BRANCHへ加算する。CNTは支店合計用であり、MOVEでは同月同支店の以前の金額を失う。d：月内の各支店CNTの金額をMST-AMOUNTへ加算して全店合計を求める。SRT-BRANCHを固定した加算や伝票金額の支店欄への加算では全支店を合計できない。e：月合計が全て求まった行52の後、WRITEの行53の前に追加する。行30/31間や40/41間では一年分の後に一度だけ、47/48間では伝票ごとに実行されて誤る。f：四半期末の月は${m.ends.join('、')}。開始月${m.starts.join('、')}や1〜12全月ではない。${m.start} THRU ${m.start-1}は年度をまたぐ月集合の指定にならない。g：四半期を表示したら番号を1増やす。3を加える、CNTを代入する、ゼロへ戻すと1ST、2ND、3RD、4THの順を作れない。EOFのAT ENDでもWRI-PROCを実行して最終月・第4四半期を処理する。`,
    };
  },
};
