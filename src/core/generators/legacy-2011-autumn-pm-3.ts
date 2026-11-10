import { p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2011-autumn-pm-01-04-shared';
import { draw } from './legacy-2011-autumn-pm-01-04-figures';
import { masks, networkModel } from './legacy-2011-autumn-pm-01-04-models';

const countChoices = ['1', '2', '3', '4', '5', '6', '7', '8'];
const siteChoices = ['DMZ', '基幹ネットワーク', 'ネットワークA', 'ネットワークB'];
const hitChoices = ['50', '55', '60', '65', '70', '75', '80', '85'];

export function autumn2011Pm3Pages(index: number, clarify = false) {
  const { hit, miss } = networkModel(index);
  return [[
    p('問3　ネットワークの構築に関する次の記述を読んで，設問1，2に答えよ。'),
    p('D社の現在のネットワーク構成を図1に示す。DMZにはメールサーバ，DNSサーバ及び社外公開用Webサーバを接続しており，ネットワークAには社内システムを稼働させるWebサーバを，ネットワークBには社員が通常業務を行うための業務用PCを接続している。'),
    p('ファイアウォールはインターネットから基幹ネットワークへ向けた通信と基幹ネットワークからインターネットに向けた通信を全て遮断している。したがって，業務用PCから社内にある社外公開用Webサーバや社内システムWebサーバへはアクセスできるが，社外のWebサーバへはアクセスできない。'),
    draw('network', [index], '図1　D社の現在のネットワーク構成'),
    p('注記　数字は各ルータ及び社内システムWebサーバ1のそれぞれのネットワークでのIPアドレスである。'),
  ], [
    p('設問1　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('D社の各ネットワークに接続された機器のIPアドレスから，ネットワークAのサブネットマスクは［a］であることが分かる。ネットワークAのネットワークアドレスとサブネットマスクを考慮すると，次に示すIPアドレスのうち，社内システムWebサーバ2に設定可能なものは，［b］個ある。' +
      (clarify ? '基幹ネットワーク，ネットワークA及びBには同じサブネットマスクを用い，三つのアドレス範囲は互いに重複しない。' : '')),
    draw('ipAddresses', [index], '〔IPアドレス〕'),
    ...bank('aに関する解答群', masks),
    ...bank('bに関する解答群', countChoices),
    p('設問2　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('D社は，業務用PCにIPアドレスなどのネットワークの情報を設定するために，DHCPを利用することにした。DHCPを利用するPCは，DHCPサーバを見つけるためのメッセージをブロードキャストする。D社はDHCPのメッセージを中継する装置は設置しないので，PCからのメッセージを受信するために，DHCPサーバは［c］に設置する必要がある。'),
    p('さらに，業務用PCから社外のWebサーバへアクセスするためにプロキシサーバを設置することにした。プロキシサーバはクライアントからの要求に基づき，クライアントの代わりにWebサーバにアクセスし，Webサーバからの応答をクライアントに転送する。インターネットと基幹ネットワーク間の直接の通信は遮'),
  ], [
    p('断したままにしておきたいので，プロキシサーバは［d］に設置する。'),
    p('設置するプロキシサーバはキャッシュサーバの機能を備えている。キャッシュサーバは，クライアントから要求されたWebページや画像などが，既にキャッシュに格納されていれば（キャッシュにヒットすれば），Webサーバに改めてアクセスせずにキャッシュに格納されている内容をクライアントに送るので，応答時間の短縮が見込める。しかし，キャッシュにヒットしなければWebサーバにアクセスし，Webサーバからの応答をクライアントに転送するとともに，内容をキャッシュに格納するのでオーバヘッドが生じる。'),
    p('キャッシュサーバを利用しないときの平均応答時間を100としたときに，キャッシュサーバ利用時の平均応答時間がキャッシュにヒットしたときで' +
      hit + '，ヒットしなかったときで' + miss +
      'だとする。このとき，キャッシュのヒット率が［e］％以上であれば，キャッシュサーバ利用時の平均応答時間はキャッシュサーバを利用しないときの平均応答時間の半分以下になる。' +
      (clarify ? '［e］には，この条件を満たす最小のヒット率を答える。' : '')),
    ...bank('c，dに関する解答群', siteChoices),
    ...bank('eに関する解答群', hitChoices),
  ]];
}

export const legacy2011AutumnPm3Definition = define(3, '社内ネットワークのサブネット・サーバ配置・キャッシュ', '1a=ウ・1b=イ・2c=エ・2d=ア・2e=カ',
  'IPアドレスの区分とキャッシュヒット時・ミス時の応答時間',
  '図とIPアドレス候補を変え，キャッシュヒット時とミス時の応答時間を変えます。',
  'p.13〜15。図の社内外境界、ルータの接続と5アドレス、10アドレス候補、DHCP中継なし、直接通信の遮断維持、キャッシュ有無の応答時間を保持。' +
    '派生に各範囲の非重複と同一マスク、ヒット率の最小閾値を明示し、/24と/25・ホスト/ブロードキャスト境界・予約済みを査読した。',
  index => {
    const { subnetIndex, usable, threshold, hit, miss } = networkModel(index);
    const pages = autumn2011Pm3Pages(index, true);
    const last = pages[1].pop()!, first = pages[2].shift()!;
    if (last.type !== 'paragraph' || first.type !== 'paragraph') throw Error('ORIGINAL_PAGE_CONTINUATION');
    return {
      prompt: [...pages[0], ...pages[1], p(last.text + first.text), ...pages[2]],
      ...answers([strings([...masks]), strings(countChoices), strings(siteChoices), strings(hitChoices)], [
        single('1a', '設問1 a', 0, subnetIndex), single('1b', '設問1 b', 1, countChoices.indexOf(String(usable.length))),
        single('2c', '設問2 c', 2, 3), single('2d', '設問2 d', 2, 0), single('2e', '設問2 e', 3, hitChoices.indexOf(String(threshold))),
      ]),
      explanation: 'ネットワークAのルータとWebサーバ1が同じネットワークアドレスになり，基幹ネットワーク及びネットワークBとは別になるマスクは' +
        masks[subnetIndex] + 'である。範囲内でもネットワークアドレス，ブロードキャストアドレス，利用済みのIPアドレスを除く。設定可能なのは' +
        usable.join('，') + 'の' + usable.length +
        '個。DHCP（Dynamic Host Configuration Protocol）はIPアドレスなどを自動設定する仕組みで，中継がないとPCのブロードキャストは同じネットワークBに届く。' +
        'DMZ（Demilitarized Zone）は内外から必要な通信を受けられるよう分離した領域なので，直接通信の遮断を維持したままプロキシが社外Webサーバへ接続できる。' +
        'ヒット率をhとすると平均は' + hit + '×h＋' + miss + '×(1−h)。これを50以下にする最小のヒット率は' + threshold + '％である。',
    };
  });
