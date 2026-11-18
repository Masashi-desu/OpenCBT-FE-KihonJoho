import { p, strings, table } from './definition';
import { answers, bank, bankBlocks, define, single } from './legacy-2004-autumn-pm-01-05-shared';
import { draw } from './legacy-2004-autumn-pm-01-05-figures';
import { addressAnswerRows, network } from './legacy-2004-autumn-pm-01-05-models';

const ports=['Javaアプレットの使用許可','クッキーの受入れ','サブネットマスク','通過可能なポート番号','ルーティングテーブル'];
const addresses=()=>addressAnswerRows.map((_,i)=>[draw('address-option',i,'アドレスの組合せ')]);
export function autumn2004Pm2Pages(index:number,print=true) {
  const {assignable}=network(index);
  return [
    [p('ネットワークシステムに関する次の記述を読んで，設問1～3に答えよ。'),
      p('X社では，社外とのネットワーク接続にインターネットを利用している。社内の各部門ごとにLANがあり，複数のパソコンやサーバを接続する。パソコンやサーバには固定のプライベートIPアドレスを付与する。各部門のLANは，ルータを介して基幹LANに接続する。インターネットへの接続は，基幹LAN上の関門サーバが行う。関門サーバには，プロキシの機能，コンピュータウイルスを検出する機能，ファイアウォールの機能などが含まれている。'),
      p('X社のネットワーク構成を，Y部門とZ部門を例にとって図に示す。図中の数字は，IPアドレスを表す。'),
      draw('network',index,'図　X社のネットワーク構成')],
    [p('設問1　図中の空欄は，パソコンやサーバのIPアドレスを示す。指定可能なIPアドレスを，解答群の中から選べ。ここで，サブネットマスクは，255.255.255.0とする。'),
      ...(print?bank('解答群',assignable):[]),
      p('設問2　次の表は，パソコンFのブラウザからZ部門のWebサーバHにデータを送信する場合と，同じブラウザからインターネット上のWebサーバPにデータを送信する場合の，データに付加するIPアドレスやMACアドレスがどのコンピュータのものであるかを示したものである。表中の空欄に入れる正しい答えを，解答群の中から選べ。ただし，社内のWebサーバにアクセスする場合には，プロキシの機能を使用しないものとする。'),
      ...(print?[]:[p('表の送信先IPアドレスは，パソコンFが最初に送るパケットのものである。ルータE及びGはアドレスを変換せずに転送し，関門サーバは社外へ送るときに送信元IPアドレスを自身の社外向けIPアドレスへ変換する。')]),
      table('表　データに付加するアドレス',['送信先','Fが送信するデータの送信先IPアドレス','Fが送信するデータの送信先MACアドレス','送信先が受信するデータの送信元IPアドレス'],[
        ['WebサーバH','WebサーバH','［空欄］','［空欄］'],
        ['WebサーバP','WebサーバP','［空欄］','［空欄］']])],
    [...(print?bankBlocks('解答群',addresses()):[]),
      p('設問3　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('パソコンFからインターネット上のFTPサーバQにFTPクライアントソフトで接続を試みたところ，うまく接続できなかった。しかし，パソコンFで，FTPサーバQを指定したpingコマンドを実行したところ，FTPサーバQから応答があった。接続のための操作手順が正しいとすると，関門サーバの空欄の設定に原因がある場合がある。'),
      ...(print?bank('解答群',ports):[])],
  ];
}
export const autumn2004Pm2=define(
  2,'社内LANのIPv4アドレスとルータ・関門サーバ','a=ウ／b=カ／c=ケ／設問2=オ／設問3=エ',
  '基幹LANと各部門のプライベートアドレス',
  '三つのLANのネットワーク番号と各アドレスの選択肢を同期して変更する。生成版は表の宛先IP前提と関門での送信元変換を表示する。',
  'サブネットマスク/24、三LAN、経路とMACの最初のリンク、パソコンFの送信時と結果受信時のIP区別を維持する。',
  i=>{
    const {assignable}=network(i);
    return {prompt:autumn2004Pm2Pages(i,false).flat(),...answers([strings(assignable),addresses(),strings(ports)],[
      single('a','a',0,2),single('b','b',0,5),single('c','c',0,8),single('s2','設問2',1,4),single('s3','設問3',2,3),
    ]),explanation:'マスク255.255.255.0ではLAN内で先頭3オクテットが共通で，末尾0と255，ルータの既使用番地は使えない。a・b・cの候補は'+
      [assignable[2],assignable[5],assignable[8]].join('，')+'。Fが最初に送るフレームは，H宛てでもP宛てでも同じLANのEをMACの宛先にする。'+
      'HはFの送信元IPを受け取り，社外のPが受け取る送信元IPは関門サーバのもの。ICMPによるpingが成功しても，FTP用のポートを通す設定がなければFTP接続はできない。'};
  },{answerVariation:'fixed'},
);
