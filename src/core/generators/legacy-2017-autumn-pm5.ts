import { field, figure, p, strings, variableNotes, type GenerationDefinition } from './definition';
import { legacy2017AutumnPm5Erratum as erratum, legacy2017AutumnPm5ErratumAssetId as erratumAsset,
  legacy2017AutumnPm5Figure as drawing, legacy2017AutumnPm5Groups as groups,
  legacy2017AutumnPm5Profiles as profiles, legacy2017AutumnPm5Variant } from './legacy-2017-autumn-pm5-data';

export const legacy2017AutumnPm5Definition: GenerationDefinition = {
  source: '2017h29a-fe-pm-5', title: '旧制度・午後：買上げ・入金の月次消込み処理', version: '3.2.0',
  fields: [field('同役割の誤答候補の組合せ',0,3)], reference:[0], sourceAnswer:'カイイイオイ', answerVariation:'fixed',
  notes: variableNotes+' 原の経済額・正の処理済額・FIFO・7表・2図・2表・6欄27択33参照を固定する。全4条件では複合キー2属性、未処理条件、整列順の誤答の意味だけを同じ役割の候補へ変更する。6正答の内容は普遍的な処理条件として固定で、名前変更/選択肢shuffleだけではない。公式正誤表の旧字面へ「のみ」を足さず、入金が買上げ前にも後にも可能という訂正を採用。本文内に全解答群を表示しchoiceShuffleAllowed=falseを維持する。符号規約の変更案は採用しない。新13profileは共有schema/dispatcher/通常登録の受入待ちであり、専用描画の成功を通常App成功としない。',
  build(values) {
    legacy2017AutumnPm5Variant(values);
    const g=groups(values), draw=(index:number)=>{const d=drawing(profiles[index],values);return figure(profiles[index],values,d.caption,d.alt);};
    const bank=[...g.a.map(x=>x.join('\n')),...g.b,...g.c,...g.d,...g.ef];
    const indexes=[[0,1,2,3,4,5],[6,7,8,9],[10,11,12,13,14,15],[16,17,18,19,20],[21,22,23,24,25,26],[21,22,23,24,25,26]];
    return {
      contexts:[{title:'問5の公式正誤表（原PDF物理2頁）',presentation:'text_figure',blocks:[
        p(erratum.locator),p('訂正前：'+erratum.before),p('訂正後：'+erratum.after),
        {type:'image',assetId:erratumAsset,caption:'公式正誤表　平成29年度 秋期 基本情報技術者試験 午後 問5'},
      ]}],
      prompt:[
        draw(0),
        p('問5　買上げ・入金管理システムを用いた月次集計処理に関する次の記述を読んで，設問1，2に答えよ。'),
        p('E社は，10年以上の取引実績がある得意先とは，双方が合意した上で，得意先の買上げに対する支払を，1回の入金で行うことも，複数回の入金で行うことも許した取引を行っている。'+erratum.after+'E社の担当者は，得意先の買上げ及び入金が発生するたびに，買上げ・入金管理システムに記録している。毎月の最終営業日の取引終了後に，買上げ・入金管理システムを用いて月次集計処理を行っている。月次集計処理の概要は次のとおりである。'),
        p('〔月次集計処理の概要〕'),
        p('月次集計処理は月間買上げ額確定処理と消込み処理から成り，月間買上げ額確定処理の終了後に消込み処理を行う。'),
        p('月間買上げ額確定処理は，得意先ごとに当月1か月分の買上げ金額を合計して，当月の買上げの合計額（以下，月間買上げ額という）を確定する処理である。'),
        p('消込み処理は，充当が完了していない月間買上げ額に対して，得意先からの入金を充当していく処理である。'),
        p('E社の得意先との取引では，過去の月間買上げ額に対する充当が完了していない場合や，逆に得意先から入金された金額が，全ては月間買上げ額に充当されずに残っている場合がある。したがって，消込み処理は，充当が完了していない月間買上げ額に対して，買上げ年月の古い順に，まだ入金額の全てを充当していない入金を，入金日が古い順に充当していく。'),
        p('〔買上げ・入金管理システムのデータベース〕'),
        p('買上げ・入金管理システムでは，関係データベースの表で必要なデータを管理している。関係データベースのE-R図を図1に，各表の説明を表1に，主な表の属性の説明を表2に示す。'),
        draw(1),draw(2),draw(3),draw(4),draw(5),draw(6),
        draw(12),
        draw(7),draw(8),draw(9),draw(10),draw(11),
      ],
      choices:strings(bank),
      answerParts:indexes.map((entries,i)=>({id:'part-'+ 'abcdef'[i],label:`設問${i===0?1:2} ${'abcdef'[i]}`,choiceIds:entries.map(x=>'choice-value-'+(x+1))})),
      partAnswers:[5,7,11,17,25,22].map((x,i)=>({kind:'choice' as const,partId:'part-'+'abcdef'[i],choiceId:'choice-value-'+(x+1)})),
      explanation:[
        'a：消込は一つの入金から一つの月間買上げへの充当を表す。入金は複数の月間買上げへ，月間買上げは複数の入金から充当され得るため，入金番号と月間買上げ番号の組で対象を特定する。得意先だけ，又は一方の番号と得意先IDでは他方を区別できない。消込日や充当金額も同日の複数処理・同額の処理を区別する識別子ではない。原の図1には消込番号という属性を定義していない。',
        'b：まだ入金の全額を充当していないものは入金額＞充当額である。等しいものは全額充当済みであり，≧ではこれを含める。充当額＝0では部分充当済みの未完了入金を漏らし，充当額＞0では充当前の入金を漏らす。',
        'c：まだ月間買上げ額の全額を消し込んでいないものは月間買上げ額＞消込額である。買上げ額が正であることだけでは完了を除外できず，消込額が0か正かだけでも未処理・部分処理・完了を正しく分けられない。等号を含む条件は完了済みを混ぜる。',
        'd：古い買上げから充当するので買上げ年月の昇順である。降順は新しいものからになる。金額・消込額の大小は年月の古さを表さない。同じ得意先IDのレコードだけを既に取得しているため，得意先IDだけの整列では年月順を決められない。',
        'e：変数1には今回の入金でまだ使える残額を入れる。入金額−充当額であり，和や逆順の差ではない。月間買上げの値を使うと入金側の残額にならない。',
        'f：変数2には当該月間買上げの未充当額を入れるので，月間買上げ額−消込額である。変数1＞変数2なら月間買上げを完了させて入金残額を減らし，そうでなければ入金を全額使って当該月間買上げの消込額を増やす。等額は後者で双方完了となる。',
        'E-R図はEntity-Relationship diagram（実体関連図）で，表に管理する対象と関係を表す。FIFOはFirst In, First Out（先入れ先出し）で，本問では古い入金・古い買上げから充当する順序に対応する。公式正誤表を適用し，買上げ前の入金も買上げ後の入金も処理対象になり得る。',
      ].join('\n'),
    };
  },
};
