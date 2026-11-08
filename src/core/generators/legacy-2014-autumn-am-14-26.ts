import { p, strings, table } from './definition';
import { am2016Circuit } from './legacy-2016-spring-am-09-32-models';
import { contexts, define, marks, numeric, source, text } from './legacy-2014-autumn-am-01-26-shared';
import {
  autumn2014Am0126Diagram as diagram, autumn2014Am0126Profiles as profiles, logicKinds, operationCases, taskCases,
} from './legacy-2014-autumn-am-01-26-figures';

const rateCases = [[90,80,95],[84,75,90],[80,75,92],[75,80,85]] as const;
const fpsCases = [[800,600,24,30],[640,480,24,30],[1280,720,24,25],[1024,768,24,30]] as const;
const ordered = (n:number)=>n.toLocaleString('en-US');
const value = (n:number)=>String(Number(n.toFixed(3)));
const gateNames = ['OR','AND','XOR','NOR'];
const targetTruths = ['0111','0001','0110','1000'];

function resourceOrder(i:number) {
  const tasks=taskCases[i];
  const [first,second]=tasks[0][0]<tasks[1][0]?[0,1]:[1,0];
  if(tasks[0][0]===tasks[1][0])throw Error('PARAMETER_CONSTRAINT');
  const start: number[] = [tasks[0][0],tasks[1][0]], end=[0,0];
  end[first]=start[first]+tasks[first][1];
  start[second]=Math.max(start[second],end[first]);
  end[second]=start[second]+tasks[second][1];
  const finish=end.map((t,j)=>t+tasks[j][2]);
  const answer=Math.max(...finish);
  const noWait=Math.max(...tasks.map(ts=>ts.reduce<number>((a,b)=>a+b,0)));
  const holdToEnd=finish[first]+tasks[second][1]+tasks[second][2];
  const sequential=tasks.flat().reduce<number>((a,b)=>a+b,0);
  const cpuOnly=Math.max(...tasks.map(([before,,after])=>before+after));
  return {start,end,finish,answer, alternatives:i===2?[cpuOnly,noWait,answer,holdToEnd]:[noWait,answer,holdToEnd,sequential]};
}

function orderTable(customerOwner:boolean) {
  const previous='前月受注額，2か月前受注額，3か月前受注額';
  const grouping='担当者コード，';
  return table('ファイルの項目',['ファイル','項目','備考'],[
    ['顧客マスタ','顧客コード，名称，'+(customerOwner?grouping:'')+previous,customerOwner?'各顧客の担当者は1人':'－'],
    ['商品マスタ','商品コード，名称，'+(customerOwner?'':grouping)+previous,customerOwner?'－':'各商品の担当者は1人'],
    ['担当者マスタ','担当者コード，氏名','－'],
    ['当月受注','顧客コード，商品コード，受注額','当月の合計受注額'],
  ]);
}

export const autumn2014Am14To26 = [
  define(14,'直接回線・経由回線・目標稼働率',rateCases.length,'独立回線の直列・並列と最低限の稼働率の問いを維持。生成条件は誤答の精度と桁数も原に合わせる。',i=>{
    const [direct,via,goal]=rateCases[i];
    const answer=(goal-direct)*100/((100-direct)*via);
    const options=[answer,(goal-direct)/via,(goal-direct)/(100-direct),1-(100-goal)/(100-via)];
    return numeric(14,i,'東京〜大阪及び東京〜名古屋がそれぞれ独立した通信回線で接続されている。東京〜大阪の稼働率は'+value(direct/100)+
      '，東京〜名古屋の稼働率は'+value(via/100)+'である。東京〜大阪の稼働率を'+value(goal/100)+
      '以上にするため，大阪〜名古屋に他の回線と独立なバックアップ回線を新設する。新設回線の稼働率は最低限幾ら必要か。',answer,options,
      '直接回線が使える場合に加え，直接回線が停止して経由の2回線が両方使える場合を数える。新設回線をxとすると'+
      value(direct/100)+'＋(1−'+value(direct/100)+')×'+value(via/100)+'×x≧'+value(goal/100)+'。これを解くとx≧'+value(answer)+'。',value);
  }),
  contexts(15,'故障時期と保全の判断根拠',['',
    '遠隔地の装置は月1回だけ予定停止できるが，稼働中も振動計の値から異常の兆候を把握できる。使用開始日や運転時間からは異常の時期を予測できない。この装置の保全として最も適切なものはどれか。',
    '同型の装置を順番に動かす設備では，導入時期が同じでも装置ごとに摩耗が進む速さが異なる。各装置に運転時間のメータはあるが，摩耗を直接測るセンサはない。このとき，装置ごとに保全時期を判断する対策として最も適切なものはどれか。',
  ],[2,0,1],[
    '初期故障の要因である設計・製造のミスを減らすため，設計審査や故障解析を強化する。動作時間による保全や事前交換は主に使用中の劣化へ備える。',
    '時間計画保全と状態監視保全は，予定時期と機器の実際の状態を基準に保全する。累積動作時間だけによる保全，設計審査，又は部品の事前交換だけを示す選択肢とは異なる。',
    '判断の基準としてアイテムの累積動作時間を指定しているのは経時保全の記述。一般的な計画や交換を挙げるだけでは，個々の実動作時間を基準とすることまで示さない。',
  ]),
  contexts(16,'キャッシュブロックの置換方式',['',
    'キャッシュメモリと主記憶との間でブロックを置き換える方式にLFU方式がある。この方式で置換えの対象になるブロックはどれか。',
    'キャッシュメモリと主記憶との間でブロックを置き換える方式にFIFO方式がある。この方式で置換えの対象になるブロックはどれか。',
  ],[1,2,3],[
    'LRU（Least Recently Used）は最後の参照が最も古いブロックを選ぶ。読み込んだ時刻や参照回数による置換ではない。',
    'LFU（Least Frequently Used）は参照頻度が最も低いブロックを選ぶ。直前の参照からの経過時間や最初の読込時刻では決めない。',
    'FIFO（First In, First Out）は先に読み込んだブロックから置き換える。その後に参照されても，最初の読込順は変わらない。',
  ]),
  define(17,'二つのタスクのCPU・資源Rの時間',taskCases.length,'2CPUと排他資源R、CPU→R→CPUの順、同時開始・両資源空きを維持。両タスクの初回CPU時間を常に異なる値にし、同時のR要求を作らない。',i=>{
    const t=resourceOrder(i);
    const body=numeric(17,i,source[17].prompt,t.answer,t.alternatives,
      'CPUは2台なので最初のCPU処理は同時に進む。図の順で資源Rを要求し，Rは排他的なので重なる要求は待つ。'+
      'AがRを使うのは'+t.start[0]+'〜'+t.end[0]+'ミリ秒，Bは'+t.start[1]+'〜'+t.end[1]+'ミリ秒。最後のCPU処理が終わるのはAが'+
      t.finish[0]+'，Bが'+t.finish[1]+'ミリ秒なので，全体の完了は'+t.answer+'ミリ秒。');
    body.prompt.push(diagram(profiles.tasks,i,'タスクAとBのCPU・資源Rの処理順'));
    return body;
  }),
  define(18,'入出力・CPU・記憶の機能',4,
    '2018秋午前問17と同じ原の説明四択。本文は機能名を変え、バッファプールの条件で正答選択肢の同語反復をなくす。',
    i=>text(18,i,[
      '',
      'マルチプログラミングの説明として，適切なものはどれか。',
      '割込みを受け付けた直後の基本動作の説明として，適切なものはどれか。',
      'バッファプールの機能の説明として，適切なものはどれか。',
    ][i],[2,0,1,3][i],[
      'スプーリングは補助記憶にデータを蓄積して低速な入出力装置と処理を切り離す。CPU切替え，割込み，補助記憶へのアクセスを減らすバッファとは異なる。',
      '入出力待ちのタスクがCPUを使わない時間に他のタスクを動かすと，CPUの遊休を減らせる。補助記憶に出力を一時蓄積するのはスプーリング。',
      '割込みを受けると実行中のプログラムから制御プログラムへ実行を移す。出力データの待機や低速装置の読出し頻度の低減とは異なる。',
      'バッファプールの主記憶上のデータを利用できれば，補助記憶装置への読出しを回避できる。CPUの割当てや出力待ちのための補助記憶への書込みではない。',
    ][i],i===3?[
      ...source[18].choices.slice(0,3),
      '主記憶に入出力済みのデータを複数残しておき，再び必要になったデータがそこにあれば補助記憶からの読出しを省く。',
    ]:source[18].choices)),
  contexts(19,'絶対パス名と相対パス名',['',
    'ファイルシステムの相対パス名を説明したものはどれか。ここで，パス名はプロセスがファイルを開くときに指定する文字列とし，シェルによる展開は考えない。',
  ],[3,1],[
    '絶対パス名はルートディレクトリを起点に対象ファイルを指定する。カレントやホーム，文字列が最短かどうかはその定義ではない。',
    '相対パス名はプロセスのカレントディレクトリから解決される。ルートが起点なら絶対パス名。ホームを固定の起点としたり，最短であることを条件にしたりしない。',
  ]),
  contexts(20,'ソフトウェアの権利と配布条件',['',
    'オープンソースライセンスにおいて，著作権表示と免責条件の保持を求める一方，配布する派生版へ同じライセンスの適用は求めないライセンスの一群はどれか。',
    'プログラムの創作に伴い，その表現の複製や公衆送信などに関わる著作者の権利を示す考え方はどれか。',
    '同じプログラムに二つの異なるライセンスを用意し，利用者がいずれか一方の条件を選べるようにする考え方はどれか。',
  ],[2,0,1,3],[
    'コピーレフトは著作権に基づき，改変・再配布等の自由を，派生版の配布先にも同じ条件で維持する。著作権の放棄，寛容なBSD系，複数条件から選ぶ方式とは異なる。',
    'BSD系は著作権表示などの条件の下で利用・再配布を認め，派生版への同じライセンスの適用を求めない。コピーレフトやデュアルライセンスとの区別は条件の継承と選択。',
    'コピーライトは著作権のこと。コピーレフトやBSD系，デュアルライセンスは権利に基づいて許諾条件を設定する際の考え方。',
    'デュアルライセンスでは二つの条件のいずれかを選べる。著作権自体や単一ライセンスでの派生物の条件とは区別する。',
  ]),
  define(21,'4素子の回路構成',logicKinds.length,'2016春午前問23の原図と同一。接続と四つの候補回路図の役割・順を固定し、素子を変えて等価なものを選ぶ。',i=>{
    const kinds=logicKinds[i], combinations=[[false,false],[false,true],[true,false],[true,true]];
    const truth=combinations.map(([a,b])=>Number(am2016Circuit(kinds,a,b))).join('');
    const correct=targetTruths.indexOf(truth);
    if(correct<0)throw Error('PARAMETER_CONSTRAINT');
    return {
      prompt:[p(source[21].prompt),diagram(profiles.logic,i,'論理回路')],
      choices:gateNames.map((_,j)=>[diagram(profiles.gate,j,'等価な回路の候補')]),correctIndex:correct,
      explanation:'入力(A,B)＝(0,0)，(0,1)，(1,0)，(1,1)の順に四つの素子を通して出力を調べると，Yは'+
        [...truth].join('，')+'。候補のORは0，1，1，1，ANDは0，0，0，1，XORは0，1，1，0，NORは1，0，0，0なので，'+
        marks[correct]+'の'+gateNames[correct]+'回路と等価。出力の小円は否定を表す。',
    };
  }),
  {
    ...define(22,'順序回路で保持する1ビットと更新条件',4,
      '入力だけで決まる組合せ回路と区別し、二つの状態を保持する順序回路を選ぶ。クロック、短い入力、異常の記録で保持と更新の条件を変えるが、この4択の正答はフリップフロップに限られる。',
      i=>text(22,i,[
        '',
        '二進数の1桁を，あるクロックの立上りで受け取り，入力が直後に変わっても次のクロックまで前の値を出力する必要がある。この用途に適した順序回路はどれか。',
        '押しボタンを押すと短時間だけ信号が1になる。ボタンを離しても，制御装置が読みに来るまでは出力を1にしておきたい。この用途に適した順序回路はどれか。',
        '装置で一時的に異常が起きたとき，異常信号が0に戻った後も，担当者が解除操作をするまでは出力を1にしておきたい。この用途に適した順序回路はどれか。',
      ][i],3,[
        'フリップフロップは0と1に対応する二つの安定状態を保持する順序回路。',
        'フリップフロップはクロックで取り込んだ1ビットを次の更新まで保持する。',
        'フリップフロップを使えば，短い入力で状態を設定し，ボタン入力が戻った後も読み取るまで出力を保持できる。',
        'フリップフロップなら異常の発生を記憶し，異常信号が戻った後も別の解除操作まで状態を保持できる。',
      ][i]+' NAND単体と加算器は入力で出力が決まる組合せ回路で，コンデンサは受動素子。')),
    answerVariation:'fixed' as const,
  },
  define(23,'消費電流と運転時間の刻み・区間',operationCases.length,'運転・停止の階段図、実効値・停止時電流なし・力率1を保持。電流と運転時刻を変え、分から時間へ換算。',i=>{
    const c=operationCases[i], active=c.on.reduce<number>((a,b)=>a+b,0), tickEnergy=100*c.current*c.tick/60;
    const choices=[tickEnergy,2*tickEnergy,3*tickEnergy,4*tickEnergy], answer=active*tickEnergy;
    const body=numeric(23,i,source[23].prompt.replace('10A',c.current+'A').replace('120分',4*c.tick+'分'),answer,choices,
      '運転区間の合計は'+active+'×'+c.tick+'＝'+active*c.tick+'分。停止時の電流は0。力率1なので運転中の有効電力は100×'+
      c.current+'＝'+100*c.current+'W。時間に換算して消費電力量は'+ordered(answer)+'Wh。',ordered);
    body.prompt.push(diagram(profiles.timeline,i,'機器の運転・停止'));
    return body;
  }),
  define(24,'過去の受注額と担当者の対応を持つファイル',2,'4ファイルの表と出力粒度の4択、当月と直前3か月を保持。担当者の関数従属を顧客から商品へ変更。',i=>({
    prompt:[p(source[24].prompt),orderTable(i===0)],choices:strings(source[24].choices),correctIndex:i===0?3:2,
    explanation:i===0?'過去3か月の受注額が顧客ごとにあり，各顧客は担当者1人なので担当者別の顧客別に出力できる。商品の顧客別内訳は過去のマスタにない。当月の明細だけでは過去分まで計算できない。':
      '商品マスタには過去3か月の商品ごとの額と一意の担当者コードがあるので，商品別の担当者別に出力できる。顧客マスタには担当者との対応がなく，過去の顧客と商品の内訳もない。',
  })),
  define(25,'非圧縮動画の寸法とフレームレート',fpsCases.length,'非圧縮の条件、解像度×ビット深度×フレーム率と概算の4択を保持。桁の取り違えを見分ける。',i=>{
    const [w,h,bits,fps]=fpsCases[i], exact=w*h*bits*fps, near=Math.round(exact/10e6)*10;
    const options=i%2===0?[near,near/100,near/10,near]:[near,near/10,near,near*10];
    const formatted=options.map((n,j)=>value(n)+(j===0?'k':'M')+'ビット／秒');
    return text(25,i,w+'×'+h+'ピクセル，'+bits+'ビットフルカラーで'+fps+
      'フレーム／秒の動画像の配信に最小限必要な帯域幅はおよそ幾らか。ここで，通信時にデータ圧縮は行わないものとする。',i%2===0?3:2,
      '各フレームは'+w+'×'+h+'×'+bits+'ビット。'+fps+'フレームを1秒に送るので'+ordered(exact)+
      'ビット／秒。非圧縮ではおよそ'+near+'Mビット／秒であり，kとMの換算やフレーム数を落とさない。',i===0?source[25].choices:formatted);
  }),
  contexts(26,'RDBMSの概念',['',
    'RDBMSにおけるビューの説明として，適切なものはどれか。',
    'RDBMSにおけるデータ操作の説明として，適切なものはどれか。',
    'RDBMSにおける整合性制約の説明として，適切なものはどれか。',
  ],[1,0,2,3],[
    'スキーマはデータの構造，型，他のデータとの関係などを定義する集合。仮想的な表はビュー，挿入等はデータ操作，一貫性の条件は整合性制約。',
    'ビューは問い合わせの結果から定義した仮想的な表。データ定義の集合や操作の総称，一貫性を守る制約とは役割が異なる。',
    'データ操作にはデータの挿入，更新，削除，検索などが含まれる。定義・仮想表・制約そのものとは区別する。',
    '整合性制約はデータが守る条件の集合で，一貫性を保つ。ビュー，スキーマ全体，データを操作する命令とは区別する。',
  ]),
];
