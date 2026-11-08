import { code, p, strings } from './definition';
import allBanks from './legacy-2014-autumn-pm-01-04-banks.json';
import { answers, bank, define, single, sqlBank, unordered } from './legacy-2014-autumn-pm-01-04-shared';
import { autumn2014Pm0104Diagram as diagram, autumn2014Pm0104Profiles as f } from './legacy-2014-autumn-pm-01-04-figures';

const choices=allBanks[3] as {unavailable:string[];overdue:string[];count:string[];index:string[]};
const overdueQuery='SELECT 貸出表.社員番号, 書籍表.書籍名\n  FROM 書籍表, 貸出表\n  WHERE ［a］\n  ORDER BY 貸出表.社員番号';
const equality='書籍表.書籍番号 = 貸出表.書籍番号 AND\n';
const returned='貸出表.返却日', due='貸出表.返却予定日', today='CURRENT_DATE';
const scopeText=[
  '運用開始後に延滞したことがある利用者の社員番号と，延滞した書籍名',
  '運用開始後の貸出のうち，返却予定日を過ぎても現在返却されていない貸出の利用者の社員番号と，その書籍名',
  '運用開始後の貸出のうち，返却済みで，返却予定日より後に返した利用者の社員番号と，その書籍名',
];
const indexText=[
  '資料室に設置されている端末からだけでなく，利用者が自席のPCからも書籍を検索できるようにしたところ，貸出実績の増加と利用者からのアクセスの急増に伴い，書籍名を入力して貸出中か否かを表示する処理で，レスポンスの低下が顕在化した。レコード件数を確認したところ，書籍表が865件，貸出表が10,382件だった。',
  '利用者が自席のPCからログインしたときに，その本人の過去及び現在の貸出を表示する処理で，レスポンスの低下が顕在化した。この処理では，ログイン情報から1人の利用者を特定する。書籍表の主キーの索引は既にあり，書籍表は910件，貸出表は12,480件で，1人の貸出は30件以下である。',
  '窓口の終業処理で，当日に返却された書籍をまとめて確認する処理のレスポンスが低下した。書籍表は940件，貸出表は13,560件で，当日の返却は40件以下である。書籍表の主キーの索引は既にあり，当日の返却時に記録した日付を基準に貸出行を絞る。',
];
function dataFor(i:number){
  const baseCount='SELECT 書籍表.書籍番号, 書籍表.書籍名, ［b］ AS 貸出回数\n  FROM 書籍表, 貸出表\n  WHERE 書籍表.書籍番号 = 貸出表.書籍番号';
  const countQuery=baseCount+(i===0?'':i===1?"\n    AND 貸出表.貸出日 BETWEEN DATE '2014-09-01' AND DATE '2014-09-30'":'\n    AND 貸出表.返却日 IS NOT NULL')+
    '\n  GROUP BY 書籍表.書籍番号, 書籍表.書籍名\n  ORDER BY 貸出回数 DESC';
  const lateOpen=returned+' IS NULL AND '+due+' < '+today;
  const lateClosed=returned+' > '+due;
  const options=i===0?choices.overdue:i===1?[
    equality+lateClosed,equality+returned+' IS NULL',equality+lateOpen,equality+due+' < '+today,
  ]:[
    equality+lateOpen,equality+returned+' IS NOT NULL',equality+returned+' != '+due,equality+lateClosed,
  ];
  return {countQuery,options};
}

export function autumn2014Pm4Pages(i:number){
  const d=dataFor(i);
  return [
    [
      p('問4　書籍を管理する関係データベースの設計及び運用に関する次の記述を読んで，設問1〜4に答えよ。'),
      p('ある会社の資料室では，社員（以下，利用者という）と窓口担当者の利便性を向上する目的で，所蔵する書籍を管理するデータベースを再構築することにした。この会社の資料室では，業務に関連する書籍を管理しており，利用者への貸出しも実施している。'),
      p('従来のデータベースは，図1に示すとおり，所蔵する書籍と現在の貸出状況を管理する書籍表で構成されている。下線付きの項目は，主キーを表す。'),
      diagram(f.oldBooks,i,'図1　書籍表のデータ格納例'),
      p('〔書籍表に関する説明〕'),
      p('(1) 利用者に貸出中の書籍には，貸出日と返却予定日が格納されている。これらの項目がnullの書籍は，貸し出されていないことを表す。'),
      p('(2) 社員番号には，その書籍を貸し出している利用者の社員番号が格納されている。人事系のシステムで管理している社員表と結合することで，氏名と連絡先が検索できる。'),
      p('(3) 返却されたら，貸出日，返却予定日及び社員番号にはnullを設定する。'),
      p('設問1　データベースの再構築に当たり，利用者と窓口担当者から要望を提出してもらった。解答群に示した要望のうち，従来の書籍表（図1）及び社員表からは検索できない情報を二つ選べ。'),
    ],
    [
      ...bank('解答群',choices.unavailable),
      p('設問2　利用者と窓口担当者からの要望を踏まえ，データベースを図2に示す表構成で再構築して，運用を始めた。'+
        scopeText[i]+'を，社員番号の昇順に表示したい。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。ここで，SQL文中のCURRENT_DATE値関数は，現在の日付をDATE型で返却する。'),
      diagram(f.newBooks,i,'図2　再構築したデータベースの表構成とデータ格納例'),
      p('〔貸出表に関する説明〕'),
      p('(1) 1冊の貸出しに対して一意の貸出番号を付与し，貸出表に情報を記録する。'),
      p('(2) 返却日には，返却された日付を格納する。返却日がnullの書籍は，貸出中であることを表す。'),
      p('(3) 書籍が返却された後も，貸出表に記録された情報は残す。'),
      p('(4) 貸出日，返却予定日及び返却日はDATE型である。'),
    ],
    [
      code(overdueQuery,'sql'), ...sqlBank(d.options),
      p('設問3　'+['貸出回数','2014年9月1日から9月30日まで（両端を含む）の貸出回数','返却済みの行だけを対象とした貸出回数'][i]+
        'が多い順に書籍番号，書籍名及び貸出回数を表示したい。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。'),
      code(d.countQuery,'sql'), ...sqlBank(choices.count),
    ],
    [
      p('設問4　'+indexText[i]),
      p('そこで，インデックスを設定して検索性能の向上を図ることにした。インデックスの設定によって最も効果が期待できる項目として適切なものを，解答群の中から選べ。'),
      ...bank('解答群',choices.index),
    ],
  ];
}

export const legacy2014AutumnPm4Definition=define(4,'書籍を管理する関係データベースの設計及び運用',
  '設問1=エ・カ、設問2 a=ア、設問3 b=ア、設問4=イ','延滞抽出と集計の範囲・検索の起点',3,
  '書籍・貸出表の関係を保ち、延滞や集計の対象と、索引を検討する利用状況を変えています。',
  '印刷・物理p.20〜23。検索できない情報を二つ、原の4・5・5択を保持。NULL・期日境界と表の結合、COUNTと索引の対象を独立検算。',
  i=>{
    const d=dataFor(i);
    const countScope=['等価結合後の全行','等価結合後の貸出日が2014年9月1日〜30日の行','等価結合後の返却済み行'][i];
    return {
      prompt:autumn2014Pm4Pages(i).flat(),
      ...answers([strings(choices.unavailable),d.options.map(text=>[code(text,'sql')]),
        choices.count.map(text=>[code(text,'sql')]),strings(choices.index)],[
        unordered(['s1-1','s1-2'],['設問1（1つ目）','設問1（2つ目）'],0,[3,5]),
        single('a','設問2 a',1,[0,2,3][i]),single('b','設問3 b',2,0),single('s4','設問4',3,[1,2,4][i]),
      ]),
      explanation:'設問1：旧書籍表は返却時に貸出日・予定日・社員番号を消す。現在の貸出状況や連絡先は参照できるが、過去行がなく書籍の累積回数と利用者別の履歴は検索できない。\n'+
        ['a：書籍番号で結合し、返却済みで返却日が予定日より後、又は未返却で予定日が今日より前の行を選ぶ。当日の返却や期限内の貸出は延滞ではない。',
          'a：書籍番号で結合し、返却日がNULLで返却予定日が今日より前の行を選ぶ。返却済みの行や期限当日の未返却は対象外。',
          'a：書籍番号で結合し、返却日が返却予定日より後の行を選ぶ。未返却のNULLとの大小比較は真にならず、予定日までに返したものも対象外。'][i]+
        '\nb：'+countScope+'を同じ書籍ごとにCOUNT(*)で数える。一意の貸出番号や書籍番号の最大・合計・単独の値は回数ではない。\n'+
        ['設問4：書籍名から小さい書籍表で書籍番号を得て、その番号で件数の多い貸出表を絞る。貸出表の書籍番号の索引で全行を調べずに済む。',
          '設問4：ログインした一人に対応する貸出を大きい貸出表から絞る。貸出表の社員番号の索引で対象が30件以下になる。書籍情報は既存の主キー索引で結合できる。',
          '設問4：当日の返却行を大きい貸出表から絞る。貸出表の返却日の索引で対象が40件以下になる。貸出日を条件にすると別の日付で絞ってしまう。'][i],
    };
  });
