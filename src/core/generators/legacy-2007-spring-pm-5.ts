import { p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2007-spring-pm-01-05-shared';
import { draw } from './legacy-2007-spring-pm-01-05-figures';
import { mergeCases } from './legacy-2007-spring-pm-5-model';

const ab=['M′入力処理','M入力処理','T入力処理'];
const d=['更新区分に誤りがある','削除しようとする会員番号をもつレコードがマスタファイルに存在しない','新規登録しようとする会員番号をもつレコードがマスタファイルに存在する',
  '変更しようとする会員番号をもつレコードがマスタファイルに存在しない'];
const [updateProgram,sortProgram,aggregateProgram]=['更新プログラム','整列プログラム','レコード集約プログラム'];
const pipelines=[
  [updateProgram,sortProgram,aggregateProgram],[updateProgram,aggregateProgram,sortProgram],[sortProgram,updateProgram,aggregateProgram],
  [sortProgram,aggregateProgram,updateProgram],[aggregateProgram,updateProgram,sortProgram],[aggregateProgram,sortProgram,updateProgram],
].map(path=>path.join(' → '));
function variants(index:number) {
  const m=mergeCases[index], desc=m.order==='降順', sentinel=(desc?'0':'9').repeat(m.width);
  const sentinelName=desc?'最小値':'最大値';
  const c=['更新区分＝“'+m.remove+'”','更新区分＝“'+m.update+'”','更新区分≠“'+m.remove+'”','更新区分≠“'+m.update+'”',
    '（更新区分≠“'+m.remove+'”）AND（更新区分≠“'+m.update+'”）','（更新区分≠“'+m.remove+'”）OR（更新区分≠“'+m.update+'”）'];
  return {m,desc,sentinel,sentinelName,c,ef:['会員番号','更新区分','サービス等級',m.orderTime]};
}
export function spring2007Pm5Pages(index:number, print=true) {
  const {m,sentinel,sentinelName,c,ef}=variants(index);
  const pages=[
    [p('プログラム設計に関する次の記述を読んで，設問1〜3に答えよ。'),
      p('ある会員情報が入ったマスタファイルの内容を，毎月末にトランザクションファイルの内容によって更新し，新マスタファイルに出力する更新プログラムを作成する。'),
      p('〔ファイルの説明〕'),
      p('（1）マスタファイル及びトランザクションファイルのレコード様式は同じで，次の項目からなる。'),draw('record',0,'ファイルのレコード様式'),
      p('（2）会員番号は，'+m.width+'けたの数字であり，必須の項目である。'+sentinelName+' '+sentinel+' の会員番号をもつ会員は存在しない。'),
      p('（3）マスタファイル及びトランザクションファイルは，会員番号をキーとして，'+m.order+'に整列されている。'),
      p('（4）マスタファイルには，同一の会員番号をもつレコードが複数存在することはない。トランザクションファイルにも，同一の会員番号をもつレコードが複数存在することはない。'),
      p('（5）トランザクションファイルは，新規会員追加に用いるレコード及び既に登録されている会員の会員情報変更に用いるレコードからなる。'),
      p('（6）会員情報変更に用いるレコードは，変更する項目に空白以外のデータが格納され，変更しない項目には，空白が格納されている。'),
      p('〔処理の説明〕'),
      p('マスタファイルのレコードを M，トランザクションファイルのレコードを T として，次のキー突合せ処理を行う。'),
      p('（1）M と同一の会員番号をもつ T があるとき，T の空白以外の項目で M の対応する項目を更新し，T の空白の項目に対応した M の項目は更新せずに新マスタファイルに出力する。'),
      p('（2）M と同一の会員番号をもつ T がないとき，M をそのまま新マスタファイルに出力する。'),
      p('（3）T と同一の会員番号をもつ M がないとき，T を新マスタファイルに出力する。'),
      p('更新プログラムの流れを図1に示す。')],
    [p('突合せキー Kₘ 及び Kₜ には，それぞれ，M の会員番号の値及び T の会員番号の値，又はそれぞれのファイルを読み終わったことを表す'+
      sentinelName+' '+sentinel+' を格納する。'),draw('merge',index,'図1　更新プログラムの流れ')],
    [p('設問1　図1において，キー突合せによるマスタファイルの更新処理は，破線で囲んだ部分で実現している。図1中の空欄 a，b に入れる正しい答えを，解答群の中から選べ。')],
    [draw('change',index,'図2　変更後の更新プログラムの流れ'),
      p('設問3　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('トランザクションファイル中に同一の会員番号をもつレコードが複数あってもよいようにする。複数ある場合，レコードの発生順に処理する。そのために，次の（1），（2）の変更を行うことにした。'),
      p('（1）トランザクションファイルのレコード様式に'+m.orderTime+'という項目を追加する。'),
      p('（2）図2の更新プログラムとは別にトランザクションファイルの処理に，整列プログラムとレコード集約プログラムを追加して，新たにトランザクションファイルを生成する。')],
    [p(index < 2 ? '整列プログラムは，レコードを整列キーの昇順に並べ替える。ここで，第1整列キーは［e］，第2整列キーは［f］である。' :
        '整列プログラムは，第1整列キーを降順，第2整列キーを昇順としてレコードを並べ替える。ここで，第1整列キーは［e］，第2整列キーは［f］である。'),
      p('レコード集約プログラムの主な機能は，次の二つである。'),
      p('① 会員番号が同じ入力レコードで，更新区分がすべて“'+m.update+'”のときには，空白以外の変更項目の内容を作業領域に上書きし，最後の状態を出力する。'),
      p('② 更新区分が“'+m.remove+'”のレコードが見つかったときには，そのレコードを出力する。それ以降にも同一の会員番号のレコードが存在したときには，それらは処理せずエラーとする。'),
      p('これらのプログラムの実行順序は，次のとおりである。'),p('実行順序：［g］')],
  ];
  if(print) pages[2].push(...bank('解答群',ab));
  pages[2].push(p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
    p('この更新プログラムに会員情報の削除処理を追加するため，次の（1）〜（5）を行う。'),
    p('（1）トランザクションファイルのレコード様式に，更新区分という項目を追加する。'),
    p('（2）更新区分が“'+m.update+'”の場合を新規登録及び変更とし，“'+m.remove+'”の場合を削除とする。'),
    p('（3）図1のαとβの処理を，（1）のレコード様式の変更に対応するように変更する。'),
    p('（4）主処理を図2のとおりに変更する。'),
    p('（5）T 入力処理については，ファイルを読み終わったとき，更新区分に“'+m.update+'”を代入する処理を追加する。'),
    p('ここで，図2のエラー処理1及び2は，エラーとなったレコードに関する情報を表示する。条件 X2 は，［c］である。エラー処理2は，［d］場合に実行される。'));
  if(print) {
    pages[2].push(...bank('cに関する解答群',c),...bank('dに関する解答群',d));
    pages[4].push(...bank('e，fに関する解答群',ef),...bank('gに関する解答群',pipelines));
  }
  return pages;
}
export const spring2007Pm5=define(5,'キー突合せによる会員マスタの更新','a=イ／b=ウ／c=オ／d=イ／e=ア／f=エ／g=エ',
  '会員番号のけた数・終端番兵・キーの順序・更新/削除コード','二つのファイルを突き合わせ，更新・削除・集約の条件を確認する。',
  'ファイルのレコード形式、空白、終端番兵、α／β、主処理とM/T副処理、図2と7欄の択順を維持。昇順と降順の比較、番兵、随伴する更新記号を同時に変える。',index=>{
    const {m,c,ef}=variants(index);
    return {prompt:spring2007Pm5Pages(index,false).flat(),
      ...answers([strings(ab),strings(c),strings(d),strings(ef),strings(pipelines)],[
        single('a','設問1 a',0,1),single('b','設問1 b',0,2),
        single('c','設問2 c',1,4),single('d','設問2 d',2,1),single('e','設問3 e',3,0),single('f','設問3 f',3,3),single('g','設問3 g',4,3)]),
      explanation:'M′を出力した後はMを，Tを単独出力した後はTを読み進める。X2は更新（'+m.update+'）でも削除（'+m.remove+
        '）でもない区分である。削除対象のTがMより先に並ぶなら，対応する会員のMが存在しない。会員番号で同じ会員をまとめ，'+m.orderTime+
        'で順序を定めてから空白以外の変更を集約する。集約結果を更新処理へ渡す。',
    };
  });
