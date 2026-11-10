import { p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2013-autumn-pm-01-04-shared';
import { vpnCases } from './legacy-2013-autumn-pm-01-04-models';
import { autumn2013Pm0104Diagram as diagram, autumn2013Pm0104Profiles as f } from './legacy-2013-autumn-pm-01-04-figures';

const dhValues = ['2', '5', '7', '10', '13'];
const rsaKeys = ['共通鍵', '受信側の公開鍵', '受信側の秘密鍵', '送信側の公開鍵', '送信側の秘密鍵'];
const layers = ['アプリケーション', 'データリンク', 'トランスポート', 'ネットワーク'];
const outcomes = ['DoS攻撃の対策', 'ウイルス感染の検知', 'セキュリティホールの修正', '送受信するデータの圧縮', '盗聴の対策', 'なりすましの検知'];

function modPower(base: number, power: number, modulus: number): number {
  let value = 1;
  while (power > 0) {
    if (power % 2 === 1) value = value * base % modulus;
    base = base * base % modulus;
    power = Math.floor(power / 2);
  }
  return value;
}

export function autumn2013Pm4Pages(i: number) {
  const { sender, receiver, prime, x, y } = vpnCases[i];
  return [
    [
      p('問4　VPN（Virtual Private Network）に関する記述を読んで，設問1〜3に答えよ。'),
      p('A社は，関東のN事業所で利用している営業支援システムを，関西のM事業所でも利用することにした。営業支援システムのサーバはN事業所のコンピュータセンタに設置されている。M事業所でN事業所の営業支援システムを利用するために，システム部が中心となってIPsecを利用したVPNの導入を検討し，報告書を作成した。'),
      p('［報告書の内容（抜粋）］\n（1）ネットワーク構成\nM事業所からN事業所の営業支援システムに接続するためのネットワーク構成を図1に示す。VPNの実現には，VPNルータを利用する。'),
      diagram(f.network, 0, '図1　ネットワーク構成'),
      p('（2）IPsecの説明\nIPsecは，暗号技術を用いてインターネットでデータを安全に送受信するための規格である。IPsecには，暗号化に利用する鍵を安全に交換する仕組みや，相手のVPNルータを認証する仕組みがある。'),
    ],
    [
      p('（3）IPsecの要素技術の説明\n① 暗号化に利用する鍵を安全に交換する仕組み\nIPsecでは，VPNルータ間で暗号化に利用する鍵を，安全に交換する仕組みの一つとして，Diffie-Hellman鍵交換法（以下，DH法という）を利用している。DH法の例を図2に示す。DH法で作成された鍵（以下，DH鍵という）を暗号化に利用する。'),
      diagram(f.exchange, 0, '図2　DH法の例'),
    ],
    [
      p('② 相手のVPNルータを認証する仕組み\nIPsecでは，データ受信側のVPNルータがデータ送信側のVPNルータを認証する仕組みの一つとして，RSAアルゴリズムを用いたディジタル署名を利用している。その仕組みを図3に示す。' +
        (i === 0 ? '' : 'ここでは' + sender + '事業所から' + receiver + '事業所へデータを送る場合を考える。')),
      diagram(f.signature, i, '図3　相手のVPNルータを認証する仕組み'),
      p('（4）IPsecを利用したVPNの導入効果\nIPsecは，［d］層でセキュリティを実現するプロトコルであるので，アプリケーションを変更せずに通信のセキュリティを担保できる。そして，パケットを暗号化することによって［e］を行い，RSAアルゴリズムを用いたディジタル署名を利用することによって［f］及び改ざんの検知を行っている。'),
    ],
    [
      p('設問1　図2でZ＝' + prime + '，X＝' + x + '，Y＝' + y + 'の場合，DH鍵として正しい値を，解答群の中から選べ。'),
      ...bank('解答群', dhValues),
      p('設問2　図3中の空欄に入れる適切な答えを，解答群の中から選べ。'),
      ...bank('a〜cに関する解答群', rsaKeys),
      p('設問3　（4）のIPsecを利用したVPNの導入効果に関する記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      ...bank('dに関する解答群', layers), ...bank('e，fに関する解答群', outcomes),
    ],
  ];
}

export const legacy2013AutumnPm4Definition = define(4, 'VPN（Virtual Private Network）', '設問1=エ、設問2 a=オ・b=ア・c=エ、設問3 d=エ・e=オ・f=カ',
  'DHの正整数X・Yと署名通信の方向', vpnCases.length,
  '図2の鍵交換に使う乱数と図3で認証するデータの方向を変えます。共通鍵による暗号化と署名の役割はそれぞれ保持します。',
  '原冊子p.19〜22、VPN構成・DH交換手順・RSA署名の3図と図2の4注記、共通鍵と二種類の公開鍵・秘密鍵、a〜c同一択群とe/f同一択群を原順で保持。公式解答表左段の問4は順不同指定なし、7独立欄。Z=11、基数2、X/Y正整数を維持し、元と同程度の指数と余りで四条件を検算。図のRSA説明は原問の簡略図で、実運用の署名・鍵導出方式を規定しない。', i => {
    const { sender, receiver, x, y, prime } = vpnCases[i];
    const a = modPower(2, x, prime), b = modPower(2, y, prime);
    const secret = modPower(b, x, prime);
    return {
      prompt: autumn2013Pm4Pages(i).flat(),
      ...answers([dhValues, rsaKeys, layers, outcomes].map(strings), [
        single('sub1', '設問1', 0, dhValues.indexOf(String(secret))),
        single('a', '設問2 a', 1, 4), single('b', '設問2 b', 1, 0), single('c', '設問2 c', 1, 3),
        single('d', '設問3 d', 2, 3), single('e', '設問3 e', 3, 4), single('f', '設問3 f', 3, 5),
      ]),
      explanation: '設問1では鍵Aが2^' + x + ' mod ' + prime + '＝' + a + '，鍵Bが2^' + y + ' mod ' + prime + '＝' + b +
        '。鍵B^' + x + ' mod ' + prime + 'と鍵A^' + y + ' mod ' + prime + 'は同じ' + secret + 'になる。\n' +
        '設問2の署名は' + sender + '事業所が送信側の秘密鍵で作成し，' + receiver + '事業所が送信側の公開鍵で検証する。暗号文は共通鍵で復号する。\n' +
        '設問3のIPsecはネットワーク層のプロトコル。パケット暗号化は盗聴への対策となり，署名による送信元の認証と改ざん検知はなりすましを検知する。',
    };
  });
