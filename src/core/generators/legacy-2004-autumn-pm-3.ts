import { code, p, table } from './definition';
import { answers, asCode, bankBlocks, define, single } from './legacy-2004-autumn-pm-01-05-shared';
import { permissions } from './legacy-2004-autumn-pm-01-05-models';

const operations=['accept,connect','connect','create','create,listen','listen','read','read,write','write'];
const operationRules=(i:number)=>operations.map((value,index)=>i===1&&index===5?'accept':value);
const quote=(value:string)=>'"'+value+'"';
function fileRules(i:number) {
  const {extension,dictionary,personal}=permissions[i];
  return ['*.'+extension,dictionary,personal].flatMap(name=>['read','read,write','write'].map(op=>quote(name)+' '+op));
}

export function autumn2004Pm3Pages(i:number,print=true) {
  const {game,host,devices,direction,generated,filter,dictionary,personal}=permissions[i];
  const dirText=direction==='out'?game+'からホスト'+host+'へのネットワーク接続':
    direction==='in'?'ホスト'+host+'から'+game+'へのネットワーク接続の受入れ':
      game+'とホスト'+host+'の双方から始められるネットワーク接続';
  const deviceText=devices.map(device=>device==='keyboard'?'キーボード':'マウス').join('と')+'からの入力イベントの受取り';
  const netText=i===0?
    '例えば，GUI（グラフィカルユーザインタフェース）とゲームサーバ用のホストgames.example.jpを使用し，ネットワークを通じて行う対戦型ゲームプログラムnetgameを考える。GUI操作に必要なキーボードとマウスからの入力イベントの受取り及びnetgameからホストgames.example.jpへのネットワーク接続に限って許可するとき，次のとおりに記述する。':
    '例えば，GUI（グラフィカルユーザインタフェース）とホスト'+host+'を使用し，ネットワークを通じて行う対戦型ゲームプログラム'+game+'を考える。GUI操作に必要な'+deviceText+
    (generated?'と同じ装置の入力イベントの生成':'')+'及び'+dirText+
    'に限って許可するとき，次のとおりに記述する。';
  const dictionaries=i===0&&print?
    '学習及び単語登録用の個人辞書mydict.datが使用できる。':
    '学習及び単語登録で個人辞書'+personal+'を読み書きし，その登録内容を変換で使用する。';
  return [
    [p('コンピュータ資源へのアクセス権の設定に関する次の記述を読んで，設問に答えよ。'),
      p('あるプログラム実行環境では，プログラムが実行時に使用できるコンピュータ資源（以下，資源と呼ぶ）へのアクセス権をテキストファイルに記述する。プログラム実行環境は，プログラムの実行時に，資源へのアクセス要求があるごとに記述されたアクセス権を評価し，要求された資源へのアクセスを許可するかどうかを決める。テキストファイルはgrant文の並びであり，grant文の形式は次のとおりである。'),
      code('grant プログラム名 資源の種類 資源名 アクセス権 ;','text'),
      p('（1）grant文はキーワードgrantで始まり，;（セミコロン）で終わる。'),
      p('（2）プログラム名，ファイル名及びホスト名は "（二重引用符）で囲み，*をワイルドカード文字として使用できる。例えば，"a*n"はaで始まりnで終わる任意の長さの文字列を表し，"an"，"afternoon"などと一致する。'),
      p('（3）資源は，資源の種類と資源名で指定する。指定できる資源の種類及び資源名は，次のとおりである。'),
      table('資源の種類と資源名',['区分','資源の種類','資源名'],[
        ['ローカルファイル','file','ファイル名を " で囲む。複数あるときは "file A","file B" のようにコンマで区切る。'],
        ['ネットワーク','network','ホスト名を " で囲む。複数あるときは "example.jp","example.ne.jp" のようにコンマで区切る。'],
        ['入力イベント（注）','inputevent','"keyboard"でキーボードからの入力イベントを，"mouse"でマウスからの入力イベントを表す。"keyboard","mouse"で両方を表す。'],
      ]),p('注　プログラム実行環境では，入力装置から発生する入力イベントを資源とみなす。'),
      p('（4）アクセス権は，資源の種類ごとに次のとおり指定する。アクセス権はキーワードで示し，複数あるときはコンマで区切る。')],
    [table('資源の種類とアクセス権',['資源の種類','キーワード','意味'],[
      ['file','read','ファイルの読出しを許可する。'],['file','write','ファイルの作成，削除及びファイルへの書込みを許可する。'],
      ['network','accept','指定されたホストからのネットワーク接続を許可する。'],['network','connect','指定されたホストへのネットワーク接続を許可する。'],
      ['inputevent','create','入力イベントの生成を許可する。'],['inputevent','listen','入力イベントの受取りを許可する。'],
    ]),
      p('例えば，texteditorというプログラムにすべてのテキストファイル（ファイル名は.txtで終わるものとする）の読み書きとキーボードからの入力イベントの受取りを許可するとき，次のとおりに記述する。'),
      code('grant "texteditor" file "*.txt" read,write;\ngrant "texteditor" inputevent "keyboard" listen;','text'),
      p('設問　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('あるサイトからダウンロードしたプログラムを実行する場合を想定する。ダウンロードしたプログラムが信頼できるかどうかわからないときに，そのプログラムを試用するために必要な最小限のアクセス権の設定を行いたい。'+netText),
      code('grant '+quote(game)+' inputevent '+devices.map(quote).join(',')+' ［a］;\n'+
        'grant '+quote(game)+' network '+quote(host)+' ［b］;','text')],
    [p('同様に，かな漢字変換入力プログラム'+filter+'とその辞書'+dictionary+'をダウンロードしたとする。'+filter+
      'は，入力イベントフィルタとして働き，キーボードから入力イベントとして受け取った平仮名やローマ字を，辞書を参照して漢字に変換し，キーボードからの入力イベントを破棄し，新たにキーボードの入力イベントを生成してアプリケーションに通知する。'+dictionaries+
      '実行に必要な最小限のアクセス権を設定してこのプログラムを試用したいときは，次のとおりに記述する。ただし，'+filter+'は'+game+'と組み合わせて使用しないものとする。'),
      code('grant '+quote(filter)+' inputevent "keyboard" ［c］;\n'+
        'grant '+quote(filter)+' file ［d］;\ngrant '+quote(filter)+' file ［e］;','text'),
      ...(print?[...bankBlocks('a～cに関する解答群',asCode(operationRules(i),'text')),...bankBlocks('d，eに関する解答群',asCode(fileRules(i),'text'))]:[])],
  ];
}

export const autumn2004Pm3=define(
  3,'プログラムに設定する最小限のアクセス権','a=オ／b=イ／c=エ／d・e=エ・ク（順不同）',
  '必要な入力装置、接続の向き、個人辞書のファイル名',
  'プログラム名や接続相手、イベントと接続の向きを変更し、生成版で個人辞書の参照と更新に必要な権限を明記する。',
  '資源、キーワード、ワイルドカード、必要最小限を保持する。d・eの二つの欄は順不同の同一グループ。',
  i=>{
    const {generated,direction,dictionary,personal}=permissions[i];
    const event=generated?'create,listen':'listen';
    const outbound=direction==='in'?'accept':direction==='both'?'accept,connect':'connect';
    return {prompt:autumn2004Pm3Pages(i,false).flat(),...answers([asCode(operationRules(i),'text'),asCode(fileRules(i),'text')],[
      single('a','a',0,operationRules(i).indexOf(event)),single('b','b',0,operationRules(i).indexOf(outbound)),
      single('c','c',0,3),{ids:['d','e'],labels:['d','e'],bank:1,correct:[3,7]},
    ]),explanation:'ゲームが求める入力イベントは'+event+'，接続は指定方向なので'+outbound+'を許可する。かな漢字変換はキーボード入力を受け取り，変換結果のイベントを生成するためcreate,listenが必要。'+
      dictionary+'は読み出しだけ，学習・登録に使う'+personal+'は読み書きを許す。ファイル名を指定して他の辞書へ広げない。二つのgrant文の順番は権限に影響しない。'};
  },
);
