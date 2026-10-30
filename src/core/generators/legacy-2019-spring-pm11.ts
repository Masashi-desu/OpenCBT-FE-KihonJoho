import{field,p,figure,strings,type GenerationDefinition}from'./definition';
import{spring2019Pm11Profiles as profiles,spring2019Pm11Maze,spring2019Pm11Figure,spring2019Pm11Banks as banks,spring2019Pm11BankCaptions as captions}from'./legacy-2019-spring-pm11-model';
export const legacy2019SpringPm11Definition:GenerationDefinition={source:'2019h31h-fe-pm-11',title:'旧制度・午後：Javaによる迷路上の駒の操作',version:'3.2.0',answerVariation:'fixed',fields:[field('開始地点の北側の枝の長さ',0,2),field('途中の北側の枝の長さ',0,3)],reference:[2,3],sourceAnswer:'aウ bア cエ dア eウ fウ',notes:'原58〜63全6頁/全5classと挿入処理/6欄22固有択30refsを保持。外周壁/0起点x東y南/初期北/enum定義順/履歴copy/反対二歩削除/巻戻しを固定。原図1/Program5で実際に与える7×7迷路の二つの行き止まり枝の長さを変える12入力。迷路図とProgram5の全文字列は同じ入力から変わり、未短縮の移動履歴と削除traceが変わる。最後の主経路/一般算法の正答は固定で、別形式で答えを差し替えない。原mazeは[2,3]。API77〜78/3型8操作11項目は当該年度のroot素材scope645dcb7b…で固定の短い試験用要約として限定採用された。別source/rightと原word/signature/順を保持し，Oracle全文又は他年度の許可へ拡張しない。通常App/冊子配布は別受入。',
 build(values){spring2019Pm11Maze(values);const draw=(kind:number,group:number,caption:string)=>{const m=spring2019Pm11Figure(profiles[kind],[...values,group]);const alt=m.kind==='program'?m.text:m.kind==='maze'?m.rows.map((r,i)=>`${i}: ${r}`).join('。'):m.kind==='history'?m.directions.join('、'):m.entries.join('。');const b=figure(profiles[kind],[...values,group],caption||'プログラム5へ挿入する処理',caption?caption+'。'+alt:alt);return !caption&&b.type==='diagram'?{...b,captionPresentation:'accessible' as const}:b;},program=(n:number)=>draw(1,n,n<5?`〔プログラム${n+1}〕`:''),bank=(n:number)=>draw(2,n,captions[n]);
  return{prompt:[
   p('選択した問題は，選択欄の選をマークしてください。マークがない場合は，採点されません。'),
   p('問11 次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
   p('（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）'),p('〔プログラムの説明〕'),
   p('升目を用いて表現された迷路と，迷路上に置かれて外部から操作される駒を表すプログラムである。'),
   p('迷路は，駒が通れる升（以下，通路という）と通れない升（以下，壁という）から成る。迷路の外周は壁である。通路のうちの一つが開始地点であり，開始地点でない通路のうちの一つがゴール地点である。本問で扱う迷路を，図1に示す。'),draw(0,0,'図1 本問で扱う迷路'),
   p('迷路上の升の位置は，2次元の座標(x, y)で表す。xとyはともに非負整数である。ある位置を基準として，xの値が大きくなる方角を東，小さくなる方角を西，yの値が大きくなる方角を南，小さくなる方角を北とする。'),
   p('駒は，東西南北のいずれかを向いており，向いている方角を基準として，次の三つの操作を外部から受け付ける。'),
   p('① 左の方向に向きを変える。'),p('② 右の方向に向きを変える。'),p('③ 隣接する前方の升が通路なら，1升前進する。'),
   p('(1) クラスMazeは迷路を表す。コンストラクタの引数には，文字列で表現した迷路と，迷路の西端から東端までの升の個数を指定する。迷路を表現する文字列は，1升を表す文字を西から東に向かって順に並べた1行分の文字列を，北から南に向かって順に連結したものである。升の種類は，char型の値で表す。“*”は壁を，それ以外の値は通路を表し，“S”は開始地点を，“G”はゴール地点を表す。引数に誤りはないものとする。'),
   p('メソッドgetStartLocationは開始地点の座標を返す。メソッドisGoalは指定された座標の升がゴール地点であればtrueを，それ以外はfalseを返す。メソッドisBlankは指定された座標の升が通路ならばtrueを，壁ならばfalseを返す。'),
   p('(2) クラスPieceは，迷路上に置かれた駒を表す。コンストラクタの引数で迷路を指定する。インスタンスは，最初は，開始地点に位置し，北を向いている。'),
   p('メソッドturnLeftは左の方向に，turnRightは右の方向に向きを変える。'),
   p('メソッドtryStepForwardは，隣接する前方の升が通路なら1升前進し，前進した方角を履歴リストに追加してからtrueを返す。通路でなければ，前進せずにfalseを返す。'),
   p('メソッドisAtGoalは，ゴール地点にいればtrueを，それ以外はfalseを返す。'),
   p('メソッドgetHistoryは，履歴リストを返す。'),
   p('(3) 列挙Directionは，方角を表す。'),p('メソッドleftは列挙定数が表す方角に向かって左の方角を，rightは右の方角を返す。'),
   p('(4) クラスLocationは，迷路上の升の位置を示す座標を表す。'),p('(5) クラスPlayMazeは，図1に示す開始地点からゴール地点に至るまで駒を操作し，その後，履歴リストを表示する。'),
   program(0),program(1),program(2),program(3),program(4),
   p('設問1 プログラム中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),bank(0),bank(1),bank(2),
   p('設問2 プログラム5のαの位置に次の処理を挿入し，実行結果として，図2に示す方角のリストを得た。駒は，開始地点からリストの方角の順に1升ずつ進むと，直前の升に戻る（正反対の方角に向きを変えて進む）ことなく，ゴール地点に至ることができる。［空欄］に入れる正しい答えを，解答群の中から選べ。'),
   program(5),draw(3,0,'図2 方角のリスト'),bank(3),bank(4)
  ],contexts:[{title:'Javaプログラムで使用するAPIの説明（原p77〜78）',presentation:'text_figure',blocks:[77,78].map(page=>({type:'image' as const,assetId:`asset-ipa-2019h31h-fe-pm-11-p${page}`,caption:`平成31年度春期 Java API参考 物理p.${page}`}))}],choices:strings(banks.flat()),answerParts:[8,8,4,4,3,3].map((n,i)=>({id:`part-${'abcdef'[i]}`,label:`設問${i<4?1:2} ${'abcdef'[i]}`,choiceIds:Array.from({length:n},(_,j)=>`choice-value-${[0,0,8,12,16,19][i]+j+1}`)})),partAnswers:[2,0,3,0,2,2].map((a,i)=>({kind:'choice' as const,partId:`part-${'abcdef'[i]}`,choiceId:`choice-value-${[0,0,8,12,16,19][i]+a+1}`})),explanation:'a：1行にwidth個の升を西から東へ並べ，行を北から南へ連結するので，座標(x,y)の文字の位置はy*width+xとなる。b：文字位置indexから列を求めるにはwidthで割った余りindex%widthを使う。c：現在位置に，向いている方角のdxとdyをそれぞれ加える。d：NORTH/EAST/SOUTH/WESTの左隣は，定義順を3進めて4で割った余りで求める。0から1を引いた値をそのまま剰余へ入れるとJavaでは負の添字になる。e：直前の要素i-1を参照するので開始値は1。f：相反する隣接二歩のうち先頭i-1を削除すると，元のiが同じi-1へ詰まるため，同じ添字i-1でもう一度削除する。削除後は再び相反する隣接が生じることがあるので，iを戻し，次のfor増分後に新しい隣接を検査する。getHistoryはnew ArrayList<>(history)による複写なので，取り出したリストの削除でPieceの内部履歴を直接書き換えることはない。'};
 }};
