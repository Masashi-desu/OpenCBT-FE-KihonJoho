import {field,figure,p,strings,table,variableNotes,type GenerationDefinition} from './definition';
const source=(n:number)=>`2017h29h-fe-am-${n}`;
function checked(v:number[],length:number,maximum:number){if(v.length!==length||v.some(n=>!Number.isInteger(n)||n<0||n>maximum))throw Error('PARAMETER_CONSTRAINT');}
function definition(n:number,title:string,answer:string,capacity:number,build:GenerationDefinition['build'],notes:string,fixed=false):GenerationDefinition{return{source:source(n),title,sourceAnswer:answer,version:'3.2.0',fields:[field(({42:'通信ポートとPC割当て条件',43:'サーバの配置条件',45:'検査手段',46:'外部設計の成果物',49:'網羅基準',53:'曲線の形状条件'}as Record<number,string>)[n],0,capacity-1)],reference:[0],...(fixed?{answerVariation:'fixed' as const}:{}),notes:variableNotes+notes,build:v=>{checked(v,1,capacity-1);return build(v);}};}
export const legacy2017DevelopmentProfiles={coverage:'legacy-2017-coverage-two-decisions',curve:'legacy-2017-cumulative-bug-curve'}as const;
const portConditions=[[80,1024],[443,1024],[80,49152]]as const;
const placements=[
 ['WebサーバとデータベースサーバをDMZに設置する。','Webサーバとデータベースサーバを内部セグメントに設置する。','WebサーバをDMZに、データベースサーバを内部セグメントに設置する。','Webサーバを外部セグメントに、データベースサーバをDMZに設置する。'],
 ['Webサーバとデータベースサーバを外部セグメントに設置する。','Webサーバとデータベースサーバを内部セグメントに設置する。','WebサーバをDMZに、データベースサーバを内部セグメントに設置する。','Webサーバを外部セグメントに、データベースサーバをDMZに設置する。'],
 ['WebサーバとデータベースサーバをDMZに設置する。','Webサーバを内部セグメントに、データベースサーバを外部セグメントに設置する。','WebサーバをDMZに、データベースサーバを内部セグメントに設置する。','Webサーバを外部セグメントに、データベースサーバを内部セグメントに設置する。'],
];
const portPurposes=[
 'Webサーバで稼働しているサービスを列挙して、不要なサービスが稼働していないことを確認する。',
 'Webサーバの利用者IDの管理状況を運用者に確認して、情報セキュリティポリシからの逸脱がないことを調べる。',
 'Webサーバのアクセス履歴を解析して、不正利用を検出する。',
 '正規の利用者IDでログインし、Webサーバのコンテンツを直接確認して、コンテンツの脆弱性を検出する。',
];
const externalArtifacts=[
 ['画面レイアウト','システム開発計画','物理データベース仕様','プログラムの流れ図'],
 ['帳票レイアウト','開発要員計画','物理インデックス仕様','モジュールの内部構造図'],
 ['外部システムとの入出力項目仕様','開発作業の工数見積り','物理ファイル配置仕様','サブルーチンの詳細フロー'],
];
const conceptWrong=[
 ['仮想化、構造化、投影、クラス','正規化、関数従属、射影、クラス'],
 ['具体化、構造化、連続、クラス','具体化、構造化、反復、クラス'],
 ['正規化、カプセル化、分割、クラス','索引付け、カプセル化、結合、クラス'],
];
/** All8 Boolean input states remain feasible in this source's two sequential
 * decisions. The cover criterion changes; the flow/data transformations do not. */
export function legacy2017CoverageMinimum(multiple:boolean){
 const masks:number[]=[];for(let x=0;x<2;x++)for(let a=0;a<2;a++)for(let b=0;b<2;b++)masks.push(multiple?(1<<x)|(1<<(2+a*2+b)):(1<<x)|(1<<(2+Number(Boolean(a||b)))));
 const full=multiple?63:15;let minimum=9;for(let subset=1;subset<256;subset++){let bits=0,count=0;for(let i=0;i<8;i++)if(subset>>i&1){bits|=masks[i];count++;}if(bits===full)minimum=Math.min(minimum,count);}return minimum;
}
export const legacy2017DevelopmentNativeDefinitions:GenerationDefinition[]=[
 definition(42,'往復通信のパケットフィルタリング','ウ',3,([v])=>{const[port,lower]=portConditions[v],server=String(port),client=`${lower}以上`,roles=[[server,client,server,client],[server,client,client,server],[client,server,server,client],[client,server,client,server]];return{prompt:[p(`社内ネットワークとインターネットの接続点にパケットフィルタリング型ファイアウォールを設置して、社内ネットワーク上のPCからインターネット上のWebサーバの${port}番ポートにアクセスできるようにするとき、フィルタリングで許可するルールの適切な組合せはどれか。`),...(v===2?[p('ここで、PC側で使用する送信元ポート番号は49152以上に割り当てるものとする。')]:[])],choices:roles.map(([s1,d1,s2,d2])=>[table('許可するルール',['送信元','宛先','送信元ポート番号','宛先ポート番号'],[['PC','Webサーバ',s1,d1],['Webサーバ','PC',s2,d2]])]),correctIndex:2,explanation:`要求のPC→Webサーバでは、送信元がPC側の${client}、宛先がサーバの${port}番となる。応答のWebサーバ→PCでは両者が入れ替わり、送信元が${port}番、宛先が${client}になる。送信元と宛先のポートは通信方向と一緒に照合する。要求を${port}番の送信元に限定する表、又は応答の宛先まで${port}番とする表では、このPC側の通信口を保持した往復にならない。`};},' 原4表×4列×2方向を保持。server80/443と明示したPC割当て条件の3入力。serverportは全て1024未満として解答群の範囲と曖昧に重ならない。元の1024以上を全OSの現在の既定値だとは説明しない。'),
 definition(43,'DMZと内部セグメントへのサーバ配置','ウ',3,([v])=>({prompt:[p('1台のファイアウォールによって、外部セグメント、DMZ、内部セグメントの三つのセグメントに分割されたネットワークがある。このネットワークにおいて、Webサーバと、重要なデータをもつデータベースサーバから成るシステムを使って、利用者向けのサービスをインターネットに公開する場合、インターネットからの不正アクセスから重要なデータを保護するためのサーバの設置方法のうち、最も適切なものはどれか。ここで、ファイアウォールでは、外部セグメントとDMZとの間及びDMZと内部セグメントとの間の通信は特定のプロトコルだけを許可し、外部セグメントと内部セグメントとの間の直接の通信は許可しないものとする。')],choices:strings(placements[v]),correctIndex:2,explanation:'公開するWebサーバをDMZへ、重要データをもつデータベースサーバを内部セグメントへ分ける。外部からWebまでの通信と、Webからデータベースまでの必要な通信を、二つの境界でそれぞれ制限できる。データベースまでDMZや外部へ配置すると、内部へ分離する保護を失う。Webを内部へ置くと、この前提で禁止された外部と内部との直接通信が必要になる。Webを外部、データベースを内部へ置く案も、その二つの直接通信が禁止されるのでシステムを構成できない。'}),' WebDMZ/DB内部の肯定は固定。3scenarioは両方外部やWeb内部/DB外部等の実際の配置を変える。単なるsegment名の置換ではなく、各配置の公開可能性・データ保護・許可された到達経路を独立判定する。',true),
 definition(45,'Webサーバ検査で使う手段の利用目的','ア',2,([v])=>({prompt:[p(`Webサーバの検査における${v?'アクセスログ解析ツール':'ポートスキャナ'}の利用目的はどれか。`)],choices:strings(portPurposes),correctIndex:v?2:0,explanation:'ポートスキャナは、対象の通信ポートへの応答などから稼働しているサービスを調べ、不要なサービスの公開を確認する。アクセスログ解析は、記録済みのアクセス履歴を調べて不正利用の兆候を検出する。運用者へのID管理状況の確認は管理手順の監査であり、ネットワークのサービス列挙ともアクセス履歴の解析とも異なる。正規IDでログインしてコンテンツを直接確認する検査は、認証後のWebアプリケーションの内容を対象にする。四つの手段が実際に調べる対象を区別する。'}),' 原の手段名の位置にportscanner/accesslog解析という2機能をbindし、同じ利用目的を選ぶ方向と原4記述を保持。曖昧な認証付きscanner等を追加しない。少数2候補は基準を永久除外せず直前回避を使う。'),
 definition(46,'外部設計完了時に顧客が承認する成果物','ア',3,([v])=>({prompt:[p('システムの外部設計を完了させるとき、顧客から承認を受けるものはどれか。')],choices:strings(externalArtifacts[v]),correctIndex:0,explanation:'外部設計では、顧客や利用者から見える画面・帳票・外部との入出力などを具体化し、要求に合うかを顧客が確認する。画面レイアウト、帳票レイアウト、外部システムとの入出力項目仕様はその対象となる。開発計画・要員計画・工数見積りは開発を進めるための計画情報である。物理データベース・インデックス・ファイル配置は内部の実装方法、プログラムの流れ図・モジュール内部構造・サブルーチンの詳細フローは内部の処理設計を示す。この問いは外部設計の成果物を区別しており、顧客が他の文書を承認する場合を一律に否定する意味ではない。'}),' 元の外部設計完了/顧客承認という方向と4短い成果物択を固定し、利用者向け出力/外部interface・開発計画・物理格納・program内部設計を対応位置へbindする3実条件。'),
 {source:source(48),title:'オブジェクト指向の基本概念の組合せ',sourceAnswer:'エ',version:'3.2.0',fields:[0,1,2].map(i=>field(`誤答の概念群${i+1}`,0,1)),reference:[0,0,0],answerVariation:'fixed',notes:variableNotes+' 原の4概念を1組として選ぶ4択を保持。正答の抽象化/カプセル化/継承/クラスは固定し、3誤答へ関係DBや制御構造等の実概念を2通りずつbindする8条件。用語の全体置換や並べ替えを容量にしない。',build:v=>{checked(v,3,1);return{prompt:[p('オブジェクト指向の基本概念の組合せとして、適切なものはどれか。')],choices:strings([...v.map((n,i)=>conceptWrong[i][n]),'抽象化、カプセル化、継承、クラス']),correctIndex:3,explanation:'抽象化は共通する性質を取り出すこと、カプセル化はデータと操作をまとめ内部を隠すこと、継承は既存のクラスの性質を受け継ぐこと、クラスはオブジェクトの共通の構造や振舞いを定めるものである。仮想化・構造化・投影や射影、具体化・連続・反復、正規化・関数従属・索引付け・結合・分割を混ぜた組は、この四つのオブジェクト指向の基本概念の組合せにならない。クラスやカプセル化だけが含まれていても、組全体の適否を確認する。'};}},
 definition(49,'流れ図の網羅基準と最少テストケース数','イ',2,([v])=>({prompt:[p(`流れ図において、${v?'複数条件網羅':'判定条件網羅（分岐網羅）'}を満たす最少のテストケース数は幾つか。`),figure(legacy2017DevelopmentProfiles.coverage,[0],'流れ図','上からX>1を判定し、真なら(X÷2)をXへ代入、偽なら代入を迂回して合流する。次にA=2 or B=0を判定し、真なら(X+1)をXへ代入、偽なら代入を迂回して下で合流する。両方の判定は全ての実行で到達する。')],choices:strings(['1','2','3','4']),correctIndex:legacy2017CoverageMinimum(Boolean(v))-1,explanation:v?'複数条件網羅では、判定中の基本条件の真偽の全組合せをそろえる。A=2とB=0には真真・真偽・偽真・偽偽の4組があり、一つのテストで実現できるのはその一組だけなので、少なくとも4件が必要になる。この4件の中でX>1の真と偽も通せば全てを満たせるので、最少は4件である。判定全体が真と偽になるだけの2件とは網羅する対象が異なる。':'判定条件網羅（分岐網羅）では、二つの判定それぞれについて真と偽の分岐を一度以上通す。一件の実行では一つの判定の両方の分岐を通せないので、少なくとも2件が必要になる。例えば二つの判定がともに真となる場合と、ともに偽となる場合を一件ずつ選べば全分岐を通せるので、最少は2件である。A=2とB=0の四つの真偽の組合せ全てを求める複数条件網羅とは区別する。'}),' 原2判定/2代入/全真偽線/合流/1〜4の4択を固定。対象位置だけ判定条件網羅/複数条件網羅へbindする2実条件。値の単純変更を容量へ数えない。短絡実行の前提を要する条件網羅variantや解答前の解法表を追加しない。'),
 definition(53,'テスト消化件数と累積バグ件数の安定傾向','エ',3,([v])=>({prompt:[p('テスト工程での品質状況を判断するためには、テスト項目消化件数と累積バグ件数との関係を分析し、評価する必要がある。品質が安定しつつあることを表しているグラフはどれか。')],choices:[0,1,2,3].map(i=>[figure(legacy2017DevelopmentProfiles.curve,[v,i],'累積バグ件数とテスト項目消化件数',`縦軸は累積バグ件数、横軸はテスト項目消化件数。${['テスト消化につれて発見の増え方が加速する右上がりの曲線','テスト消化につれて累積件数が減少する右下がりの曲線','テスト消化に比例して累積件数が増え続ける直線','当初増えた後、追加のバグ発見が少なくなり、累積件数が頭打ちへ近づくS字状の曲線'][i]}。`)]),correctIndex:3,explanation:'テストを進めた当初は累積バグ件数が増え、その後に新たな発見が少なくなって曲線が頭打ちへ近づく傾向が、品質が安定しつつある状況を示す。増え方が加速する曲線は発見が増え続けており、一定の傾きの直線も追加発見のペースが落ちていない。右下がりの曲線は累積件数が減ってしまい、発見済み件数を累積する軸の意味に合わない。頭打ちだけで未発見バグがないと証明できるわけではないので、テストの内容や進み方と併せて評価する。'}),' 原4グラフ/両軸の意味/品質が安定する肯定を保持。各曲線の加速・減少・定率増加・S字頭打ちという役割を固定し、3組の実曲率/増加開始位置/到達高さをbindする。グラフ名/並べ替えだけではない。'),
];
