import { code, p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2005-autumn-pm-01-05-shared';
import { draw } from './legacy-2005-autumn-pm-01-05-figures';
import { network } from './legacy-2005-autumn-pm-01-05-models';

const zone='example.co.jp';
const fqdn=(host:string)=>host+'.'+zone;
const blanks = ['［a］','［b］'];

function answerBanks(index:number) {
  const {gateway,web,ips,webIps}=network(index);
  return [['127.0.0.1',webIps[0],ips[1],gateway,'localhost',web],
    [gateway+'-1',gateway+'-2',gateway,'localhost',web]];
}

export function autumn2005Pm1Pages(index:number,print=true) {
  const {gateway,web,ips,webIps,clientRows}=network(index);
  const [main,treatment]=answerBanks(index);
  const aRecord=(name:string,address:string)=>fqdn(name)+'. IN A  '+address;
  return [
    [p('DNS（Domain Name System）に関する次の記述を読んで，設問1，2に答えよ。'),
      p('ある企業では，社内のネットワーク上の各コンピュータを，ドメイン名を用いて管理している。この企業のネットワーク構成を次に示す。'),
      draw('dns-network',index,'社内のネットワーク構成'),
      p('各コンピュータのドメイン名とIPアドレスの対応は，表のとおりである。'),
      table('表　ドメイン名とIPアドレスの対応（PC）',['ドメイン名','IPアドレス'],clientRows.flatMap(group=>[
        ...group.map(([id,ip])=>[fqdn(id),ip]),['⋮','⋮'],
      ])),
      table('表　ドメイン名とIPアドレスの対応（サーバ）',['ドメイン名','IPアドレス'],[
        [fqdn(gateway),ips.join('\n')],...webIps.map(ip=>[fqdn(web),ip]),
      ])],
    [p('設問1　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('ネームサーバは，ドメイン名からIPアドレスを検索するための定義ファイルをもつ。このファイルでは，ネームサーバを次のとおりに定義する。'),
      code('<定義するドメイン名>. IN NS <ネームサーバのドメイン名>.','text'),
      p('また，ドメイン名とIPアドレスの対応は，次のとおりに定義する。'),
      code('<ドメイン名>. IN A <IPアドレス>','text'),
      p(fqdn(gateway)+'をネームサーバとするとき，このネームサーバがもつ定義ファイルの記述の一部を次に示す。'),
      code([
        zone+'. IN NS '+fqdn(blanks[0])+'.','',aRecord('localhost','127.0.0.1'),
        ...clientRows[0].map(([host,ip])=>aRecord(host,ip)),'   ⋮',
        aRecord(gateway,ips[0]),aRecord(gateway,blanks[1]),'',
        ...clientRows[1].map(([host,ip])=>aRecord(host,ip)),'   ⋮',
        aRecord(gateway+'-1',ips[0]),aRecord(gateway+'-2',ips[1]),'',
        ...webIps.map(ip=>aRecord(web,ip)),
      ].join('\n'),'text'),
      ...(print?bank('解答群',main):[])],
    [p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('DNSでは，ネームサーバに問合せを行うクライアントをリゾルバと呼ぶ。'),
      p('同じドメイン名に対して異なるサブネットワークに属するIPアドレスが定義されている場合，ネームサーバは，リゾルバと同じサブネットワークに属するIPアドレスを優先して返す。この仕組みが適用されるのは'+fqdn('［c］')+'の定義である。'),
      p('一方，同じドメイン名に対して同じサブネットワークに属する異なるIPアドレスが定義されている場合，ネームサーバは，IPアドレスを定義順に巡回しながら返す。この仕組みをラウンドロビンと呼び，サーバへのアクセスを分散するために用いられる。この仕組みが適用されるのは'+fqdn('［d］')+'の定義である。'),
      ...(print?bank('解答群',treatment):[])],
  ];
}

export const autumn2005Pm1=define(
  1,'ネームサーバの定義とラウンドロビン','a=エ／b=ウ／c=ウ／d=オ','二つのサブネットのアドレスとWebサーバ群の設置側',
  '図・アドレス表・DNS定義例のサブネットとホストを同じ値で更新する。',
  '原紙の二つのネットワークを接続するネームサーバ、複数Aレコード、ローカル優先とラウンドロビンの別、名称末尾のピリオドとタグを保持。4条件で別アドレス、別解答値、Web群の配置を検証。ここでのアドレス返却順をDNS一般に拡張しない。',
  index=>{
    const [main,treatment]=answerBanks(index),{gateway,web,ips,webIps}=network(index);
    return {prompt:autumn2005Pm1Pages(index,false).flat(),
      ...answers([strings(main),strings(treatment)],[single('a','a',0,3),single('b','b',0,2),single('c','c',1,2),single('d','d',1,4)]),
      explanation:'DNS（Domain Name System、ドメイン名を管理する仕組み）のNS（Name Server、ネームサーバ）レコードには'+fqdn(gateway)+
        'を指定する。IPv4アドレスを表すAレコードでは，同じサーバにつながるもう一方のアドレス'+ips[1]+'を登録する。'+
        gateway+'には二つのサブネットに属する'+ips.join('、')+'がある。一方，'+web+'に対応する'+webIps.join('、')+
        'は同じサブネットにあるので，問題で定めたラウンドロビンが適用される。各別名とlocalhostにはAレコードが一つしかない。'};
  },{answerVariation:'fixed'},
);
