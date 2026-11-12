import {p,strings,table} from './definition';
import {finite,original} from './legacy-2008-spring-am-27-53-shared';
import {architectureCases,branchCases,chargeIds,drawing,lanCases} from './legacy-2008-spring-am-27-53-figures';

const pageCases=[
  {access:[1,2,3,4,5,2,1,3,2,6],choices:[1,2,4,5]},
  {access:[2,3,5,7,8,5,2,8,5,9],choices:[2,5,7,8]},
  {access:[1,4,6,7,2,4,1,6,4,8],choices:[1,2,4,7]},
  {access:[2,4,6,8,3,8,2,4,3,9],choices:[2,4,6,8]},
] as const;
const lru=finite(27,'アクセス順序と置換え直前の常駐ページ',
  '初期状態空・4ページ枠・最後の参照時の置換え・昇順4択を保持。途中の再参照と置換えを変えて対象を変える。',index=>{
    const {access,choices}=pageCases[index],last=access.at(-1)!;
    const resident:number[]=[];
    let victim:number|undefined;
    for(const page of access) {
      const prior=resident.indexOf(page);
      if(prior>=0)resident.splice(prior,1);
      else if(resident.length===4)victim=resident.shift();
      resident.push(page);
    }
    const stem=index===0?original(27).prompt:'ページング方式の仮想記憶において，ページ置換えアルゴリズムにLRU方式を採用する。'+
      '主記憶に割り当てられるページ枠が4のとき，ページ'+access.join('，')+'の順にアクセスすると，ページ'+last+
      'をアクセスする時点で置き換えられるページはどれか。ここで，初期状態では主記憶にどのページも存在しないものとする。';
    return {prompt:[p(stem)],choices:strings(choices.map(String)),correctIndex:choices.findIndex(choice=>choice===victim),
      explanation:'LRUでは各参照のたびに，そのページを最も新しく参照したものとして扱う。ページ'+last+'の直前に常駐するページを参照時点の古い順に並べると'+
      [victim,...resident.slice(0,-1)].join('，')+'である。ページ'+last+'を入れるために最も古いページ'+victim+'を置き換える。'};
  });

const architecture=finite(31,'CPUの運転方式・系統間の役割と構成図',
  '構成図の説明から名称を選ぶ問い、4つの元用語を保持。待機、単系、同時実行と照合、仕事分割を切り替える。',index=>{
    const source=original(31),{mode}=architectureCases[index];
    const explanations={
      duplex:'通常は現用系がオンライン処理を行い，待機系が障害時に引き継ぐ。通常時に待機系で別の処理も行える構成はデュプレックスである。',
      simplex:'一つの系統で処理を行い，その故障を引き継ぐ別の系統を備えない構成はシンプレックスである。',
      dual:'二系統に同じ処理を同時に行わせ，結果を照合する構成はデュアルである。',
      parallel:'一つの仕事を分け，複数のCPUが分担して同時に処理するので，パラレルプロセッサ構成である。',
    };
    const cases=[
      source.prompt,
      '図に示すように，通信制御装置，CPU，周辺装置をそれぞれ1台ずつ接続し，1系統でオンライン処理を行う。障害時に切り替える別の系統は備えない。このようなシステム構成を何と呼ぶか。',
      '図に示すように，二つの系統が同じオンライン処理を同時に行う。通信制御装置から同じデータを送り，二つの処理結果を照合する。このようなシステム構成を何と呼ぶか。',
      '図に示すように，一つの仕事を部分に分け，複数のCPUが異なる部分を同時に処理し，結果を統合する。待機系として働くCPUはない。このようなシステム構成を何と呼ぶか。',
    ];
    return {prompt:[p(cases[index]),drawing('31-system',index)],choices:strings(source.choices),correctIndex:[2,0,1,3][index],explanation:explanations[mode]};
  });

const superscripts='⁰¹²³⁴⁵⁶⁷⁸⁹';
const reliability=finite(32,'クライアント数・プリンタ数とLAN構成',
  '同じLAN上でサーバ1台・端末群・プリンタ群を使用。各群少なくとも1台・LAN稼働率1・元の式の4役割を保持し，台数を変更。',index=>{
    const {clients,printers}=lanCases[index],b=superscripts[clients],c=superscripts[printers];
    const originalStem=original(32).prompt;
    const stem=index===0?originalStem:'図のように，1台のサーバ，'+clients+'台のクライアント及び'+printers+'台のプリンタがLANで接続されている。'+
      'このシステムはクライアントからの指示に基づいて，サーバにあるデータをプリンタに出力する。各装置の稼働率が表のとおりであり，'+
      '装置の稼働状態が互いに独立であるとき，このシステムの稼働率を表す計算式はどれか。ここで，クライアントは'+clients+
      '台のうち1台でも稼働していれば正常とみなし，プリンタは'+printers+'台のうち1台でも稼働していれば正常とみなす。';
    return {prompt:[p(stem),drawing('32-lan',index),table('各装置の稼働率',['装置','稼働率'],[
      ['サーバ','a'],['クライアント','b'],['プリンタ','c'],['LAN','1'],
    ])],choices:strings(['ab'+b+'c'+c,'a(1−b'+b+')(1−c'+c+')','a(1−b)'+b+'(1−c)'+c,'a(1−(1−b)'+b+')(1−(1−c)'+c+')']),correctIndex:3,
      explanation:'クライアント'+clients+'台がすべて停止する確率は (1−b)'+b+' なので，1台以上稼働する確率は 1−(1−b)'+b+
        '。プリンタ'+printers+'台についても 1−(1−c)'+c+'。装置の状態を独立に扱い，サーバの稼働率aとLANの1を掛ける。'};
  });

const failureCases=[
  {drives:5,hours:100,mtbf:10000},{drives:4,hours:100,mtbf:9600},
  {drives:6,hours:80,mtbf:14400},{drives:4,hours:75,mtbf:12000},
] as const;
const show=(value:number)=>value.toLocaleString('en-US');
const failures=finite(33,'ディスクの台数・週間運転時間・単体MTBF',
  '全台が必要・MTTR無視・他要素無故障・平均週間数の4択を保持。元と同じ直列系の近似で整数になる条件。',index=>{
    const {drives,hours,mtbf}=failureCases[index],hoursBetween=mtbf/drives,weeks=hoursBetween/hours;
    const stem=index===0?original(33).prompt:drives+'台の磁気ディスクをすべて使用し，1週間に'+hours+
      '時間連続運転するシステムがある。磁気ディスク1台のMTBFが'+show(mtbf)+'時間のとき，このシステムは平均何週間に1回の割合で故障が発生するか。'+
      'ここで，各ディスクの故障率は一定で故障は互いに独立とし，MTTRはMTBFに対して無視できるほど小さく，磁気ディスク以外の構成要素の故障は考慮しないものとする。';
    return {prompt:[p(stem)],choices:strings([weeks,mtbf/hours,drives*mtbf/hours,hoursBetween].map(show)),correctIndex:0,
      explanation:'どれか1台が故障するとシステムが止まるので，稼働中の故障率は単体の'+drives+'倍。平均故障間隔は '+show(mtbf)+
      '÷'+drives+'＝'+show(hoursBetween)+'時間。1週間当たり'+hours+'時間なので '+show(hoursBetween)+'÷'+hours+'＝'+weeks+'週間である。'};
  });

const dataFlow=finite(42,'DFD上の処理と参照するデータストア',
  '外部実体・2処理・参照ストアA・矢印・4ファイル候補を保持。処理内容に必要な入力データを変更。',index=>{
    const source=original(42),notes=[
      '',
      '請求対象として指定された取引について，実際に計上された売上金額を使って請求額を計算する。',
      '出荷情報に含まれる注文番号と出荷数量を，元の注文の内容と照合する。',
      '請求情報にある請求額から，実際に受領した入金額を差し引いて残高を計算する。',
    ];
    const keys=[2,0,1,3],answers=[
      '受注情報の数量に品目の単価を掛けて売上を求めるため，計算が参照するのは単価ファイルである。',
      '計上済みの売上金額が必要なので，その記録をもつ売上ファイルを参照する。',
      '出荷情報と比べる元の受注内容は，受注ファイルに記録されている。',
      '残高を求めるには，請求とは別に実際の入金額が必要なので入金ファイルを参照する。',
    ];
    const stem=index===0?source.prompt:'図に示す売上関連システムのDFDの中で，Aに該当する項目として，適切なものはどれか。'+notes[index];
    return {prompt:[p(stem),drawing('42-dfd',index)],choices:strings(source.choices),correctIndex:keys[index],explanation:answers[index]};
  });

const formatPairs=(pairs:readonly (readonly [number,number])[])=>pairs.map(([a,b])=>'(A＝'+a+'，B＝'+b+')').join('，');
const conditionCoverage=finite(48,'二つの条件・既存テストの真偽・追加テスト値',
  '処理1・二条件式・Yes/No・処理2・合流・既存2件と追加2件の四択を保持。複数条件網羅に必要な真偽対が変わる。',index=>{
    const {a,b,existing,options,statement}=branchCases[index];
    const encode=([left,right]:readonly [number,number])=>Number(a(left))*2+Number(b(right));
    const correctIndex=options.findIndex(pair=>new Set([...existing,...pair].map(encode)).size===4);
    const formatTruth=(i:number)=>(i&2?'真':'偽')+'・'+(i&1?'真':'偽');
    return {prompt:[p(original(48).prompt),drawing('48-flow',index),p('・判定条件網羅（分岐網羅）によるテストデータ'),p(formatPairs(existing))],
      choices:strings(options.map(formatPairs)),correctIndex,
      explanation:'複数条件網羅では '+statement+' を構成する二つの条件について，真偽の全4組を実行する。既存の二組は '+
        existing.map(pair=>formatTruth(encode(pair))).join(' と ')+'。正答の二組で '+options[correctIndex].map(pair=>formatTruth(encode(pair))).join(' と ')+' を補う。'};
  });

const tariff=finite(50,'使用量に応じた請求額の方式',
  '使用量と料金の軸、0、四つのグラフ選択肢を保持。増分単価の逓減・上限・逓増と総額割引を見分ける。',index=>{
    const source=original(50);
    const stems=[
      source.prompt,
      'コンピュータシステムの利用料金を，従量単価は一定で，請求額が所定の上限に達した後は追加料金が発生しない方式にしたときのグラフはどれか。ここで，横軸を使用量，縦軸を利用料金とする。',
      'コンピュータシステムの利用料金を逓増課金方式にしたときのグラフはどれか。ここで，横軸を使用量，縦軸を利用料金とする。',
      'コンピュータシステムの利用料金を，固定額から使用量に応じた割引を差し引き，使用量が増えるほど割引後の請求額が下がる方式にしたときのグラフはどれか。ここで，横軸を使用量，縦軸を利用料金とする。',
    ];
    const explanations=[
      '逓減課金では使用量が増えるほど追加単位の料金が小さくなる。合計は増えるがグラフの傾きは小さくなる。',
      '上限までは一定の追加単価で直線的に増加する。上限を超えても請求額は増えないため，その先は水平である。',
      '逓増課金では使用量が増えるほど追加単位の料金が高くなるため，グラフの傾きが大きくなる。',
      '固定額から使用量に応じた割引を引くので，使用量が0のとき縦軸の正の位置から始まり，使用量が増えると請求額が下がる。',
    ];
    return {prompt:[p(stems[index])],choices:chargeIds.map(id=>[drawing(id,index)]),correctIndex:[2,1,3,0][index],explanation:explanations[index]};
  });

const ipv4Cases=[
  {ip:[200,170,70,19],mask:[255,255,255,240],broad:24},
  {ip:[192,168,9,78],mask:[255,255,255,192],broad:24},
  {ip:[172,19,4,181],mask:[255,255,255,224],broad:24},
  {ip:[10,21,13,22],mask:[255,255,252,0],broad:16},
] as const;
const subnet=finite(53,'IPv4アドレス・サブネットマスク',
  'IPアドレス・マスクの2行、ネットワークアドレスを求める問い、広域先頭・正答・ブロードキャスト・広域末尾の4択を維持。',index=>{
    const {ip,mask,broad}=ipv4Cases[index],address=ip.map((byte,i)=>byte&mask[i]);
    const network=address.join('.'),broadcast=address.map((byte,i)=>byte|(255^mask[i])).join('.');
    const broadStart=ip.map((byte,i)=>i<broad/8?byte:0).join('.');
    const broadEnd=ip.map((byte,i)=>i<broad/8?byte:255).join('.');
    return {prompt:[p(original(53).prompt),p('IPアドレス：'+ip.join('.')),p('サブネットマスク：'+mask.join('.'))],
      choices:strings([broadStart,network,broadcast,broadEnd]),correctIndex:1,
      explanation:'IPアドレスとサブネットマスクのビットごとの論理積を取ると，ホスト部分が0になる。この場合は '+network+
        '。同じサブネットのホスト部分を全て1にした '+broadcast+' はブロードキャストアドレスである。'};
  });
export const calculationDefinitions=[lru,architecture,reliability,failures,dataFlow,conditionCoverage,tariff,subnet];
