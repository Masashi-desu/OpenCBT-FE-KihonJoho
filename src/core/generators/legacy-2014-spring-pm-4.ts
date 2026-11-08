import { p, strings } from './definition';
import data from './legacy-2014-spring-pm-01-04-banks.json';
import { answers, bank, define, single } from './legacy-2014-spring-pm-01-04-shared';
import { ethernetCases } from './legacy-2014-spring-pm-01-04-models';
import { spring2014Pm0104Diagram as diagram, spring2014Pm0104Profiles as profiles } from './legacy-2014-spring-pm-01-04-figures';

const seconds=(ms:number)=>(Math.floor((ms+5)/10)/100).toFixed(2);
function measurements(i:number) {
  const c=ethernetCases[i];
  const count=c.megabytes*1000/c.blockKB, farWait=count*c.farMs, groups=Math.ceil(count/c.batch), batchWait=groups*c.farMs;
  const size=c.megabytes*8*1000;
  const hiroshimaData=size/Math.min(c.main,c.hiroshima), sapporoData=size/Math.min(c.main,c.sapporo);
  const a=farWait+hiroshimaData, b=batchWait+sapporoData, osakaWait=count*c.osakaMs;
  const speed=c.speeds.find(value=>osakaWait+size/Math.min(c.main,value)<=c.deadline*1000);
  const format=(values:number[])=>values.sort((x,y)=>x-y).map(seconds);
  const options=i===0?data.q4.slice(1):[
    format([hiroshimaData,farWait,hiroshimaData/2+farWait,a]),
    format([batchWait,sapporoData,sapporoData+farWait,b]),
    c.speeds.map(String),
  ];
  return {count,groups,hiroshimaData,sapporoData,farWait,batchWait,osakaWait,a,b,speed,options};
}

export function spring2014Pm4Pages(i:number) {
  const c=ethernetCases[i], {options}=measurements(i);
  const file=c.megabytes+'Mバイトのファイルをブロック長が'+c.blockKB+'kバイトのデータブロックで転送する';
  return [
    [
      p('問4　ネットワークにおけるスループットの改善に関する次の記述を読んで，設問1，2に答えよ。'),
      p('X社は，東京に本社を，札幌，大阪，広島に営業所をもっている。X社は，広域Ethernetを利用した企業ネットワークを構築済みである。X社のネットワーク構成を図1に示す。ここで，本社と営業所との間のファイル転送時間に注目し，本社内及び営業所内のファイル転送時間は考慮しない。'),
      diagram(profiles.network,i,'図1　X社のネットワーク構成'),
      p('〔X社のファイル転送〕\nX社では，各業務システムにおいて，東京本社内にあるファイルサーバ上のファイルを各営業所内の利用者PC（以下，PCという）から利用している。各営業所からファイルサーバには広域Ethernet経由でアクセスしている。①広域Ethernetはデータリンク層で接続するサービスであり，各営業所内のLANは広域Ethernetにアクセスポイントで接続している。'),
      p('ファイルサーバとPCとの間でファイル転送を行う際には，図2に示すように，PCからファイルサーバに対して読出し要求を行う。ファイルサーバは，ファイルを固定サイズのブロック（以下，データブロックという）に区切って，PCへ送信することを繰り返す。2回目以降は，PCからの読出し要求に確認応答が含まれており，ファイルサーバは，PCから確認応答が届くまで次のデータブロックを送信することができない。PCが読出し要求をファイルサーバへ送出し始めてから，ファイルサーバの送信したデータブロックが届き始めるまでを応答時間と呼ぶ。この応答時間は，札幌'),
    ],
    [
      p('又は広島営業所と東京本社との間が'+c.farMs+'ミリ秒，大阪営業所と東京本社との間が'+c.osakaMs+'ミリ秒であった。ここで，通信障害による再送はないものとする。'),
      p('このネットワーク構成では，広島営業所内のPCと東京本社のファイルサーバ間で，'+file+'には，［a］秒掛かる。'),
      diagram(profiles.sequence,0,'図2　ファイルサーバとPC間の通信シーケンス'),
      p('〔接続装置の検討〕\n図3に示すように，ファイル転送の高速化のために，広域Ethernetへの接続装置の導入を検討することになった。接続装置は，本社と各営業所にそれぞれ設置され，'),
    ],
    [
      p('広域Ethernetを挟んで対向して使用される。'),
      diagram(profiles.devices,0,'図3　本社と営業所間における接続装置の設置'),
      p('この接続装置は，PCに代わって読出し要求をファイルサーバへ送ることができ，ファイルサーバは連続してデータブロックを送信できるようになる。この接続装置を利用した場合のファイル転送の通信シーケンスを図4に示す。'),
      diagram(profiles.batch,i,'図4　接続装置を利用したファイル転送の通信シーケンス'),
      p('接続装置を導入すると，札幌営業所内のPCと東京本社のファイルサーバとの間で，'+file+
        'には，［b］秒掛かる。ここで，ファイルサーバと接続装置との間及びPCと接続装置との間の，読出し要求とデータブロックの転送時間は考慮しない。'),
    ],
    [
      p('〔アクセス回線速度の検討〕\nX社では，業務の都合から，大阪営業所内のPCにおいて'+
        file.replace('で転送する','で，'+c.deadline+'秒以内に転送する')+
        '必要がある。接続装置を導入しない場合，大阪営業所のアクセス回線速度は最低でも，［c］Mbpsで広域Ethernetの契約をする必要があることが分かった。'+
        (i===0?'':' 回線速度は整数Mbps単位で契約するものとする。')),
      p('設問1　X社のネットワーク構成において，本文中の下線①の説明文として適切な答えを，解答群の中から選べ。'),
      ...bank('解答群',data.q4[0]),
      p('設問2　本文中の空欄に入れる正しい答えを，解答群の中から選べ。ここで，1Mバイト＝1,000kバイトとし，小数第3位を四捨五入する。'),
      ...bank('aの解答群',options[0]),...bank('bの解答群',options[1]),...bank('cの解答群',options[2]),
    ],
  ];
}

export const legacy2014SpringPm4Definition=define(4,'ネットワークにおけるスループットの改善','設問1=ウ、設問2 a=エ・b=ウ・c=イ',
  'アクセス速度・応答時間・ファイル長・ブロック長・集約単位',ethernetCases.length,
  '図の回線速度、応答時間、ファイルとブロックの長さ、接続装置のまとめ送りの個数を変えて転送時間を求めます。',
  '物理p21〜24、印刷p20〜23。L2の説明、応答と伝送の区別、局所の伝送・再送の扱い、十進単位・四捨五入、回線の最小値を維持。',i=>{
    const c=ethernetCases[i], m=measurements(i);
    return {
      prompt:spring2014Pm4Pages(i).flat(),
      ...answers([data.q4[0],...m.options].map(strings),[
        single('1','設問1',0,2),single('a','設問2 a',1,m.options[0].indexOf(seconds(m.a))),
        single('b','設問2 b',2,m.options[1].indexOf(seconds(m.b))),
        single('c','設問2 c',3,m.options[2].indexOf(String(m.speed))),
      ]),
      explanation:'設問1：広域Ethernetはデータリンク層で接続するので，その上では複数種類のネットワーク層プロトコルを使える。\n'+
        '設問2：'+m.count+'ブロックに分割する。広島では'+m.count+'回分の応答'+m.farWait+'msと，データ伝送'+m.hiroshimaData+
        'msを足して'+seconds(m.a)+'秒。札幌の接続装置は'+c.batch+'個ずつまとめるので応答は'+m.groups+'回、'+m.batchWait+
        'ms。全データの伝送'+m.sapporoData+'msを足し，小数第3位を四捨五入して'+seconds(m.b)+'秒。大阪の応答時間の合計は'+
        m.osakaWait+'ms。'+c.deadline+'秒からこれを引いた時間内に'+(c.megabytes*8)+'Mビットを送り切る。東京側も考慮して条件を満たす最小の候補は'+m.speed+'Mbps。',
    };
  });
