import { p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2010-autumn-pm-01-04-shared';
import { draw } from './legacy-2010-autumn-pm-01-04-figures';
import { crcCase, divideBits } from './legacy-2010-autumn-pm-01-04-models';

const remainders = ['00', '01', '10', '11'];
const clean = ['すべてのビットが0', 'すべてのビットが1', '符号と同じ', '符号の各ビットを反転させたものと同じ'];
const expression = ['2ⁿ−1', 'C', 'C⊕（2ⁿ−1）', 'C⊕C'];
const verdicts = ['誤りが含まれる', '誤りは含まれない', '誤りが含まれるか否かは判断できない'];

export function autumn2010Pm3Pages(index: number) {
  const { accepted, errorPercent, counts, mask, demo, input, received } = crcCase(index);
  const [, d1, d2, d3] = divideBits(demo + '00', mask).rows;
  return [[
    p('問3　CRC（巡回冗長検査）に関する次の記述を読んで，設問1〜3に答えよ。'),
    p('CRCは，誤り検出方式の一つである。送信側でデータに誤り検出符号（以下，符号という）を付加して送信し，受信側で検査することによって，転送の際の誤りの有無を判断する。'),
    p('設問1　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('CRCを採用したパケット転送システムでは，送信側でパケットに符号が付加され，受信側で誤りの有無を検査する。受信側で誤りが検出されると，送信側に対して該当パケットの再送を要求する。' +
      accepted + '個のパケットに格納されたデータの転送において，受信側が実際に受信したパケットが，再送されたパケットも含めて［空欄］個であったとすると，受信したパケットの' +
      errorPercent + '%から誤りが検出されたことになる。ここで，送信したパケットは必ず相手に届くものとする。また，パケットの再送要求は誤りなく届き，再送要求には必ず応じるものとする。'),
    ...bank('解答群', counts),
    p('設問2　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('任意の長さのビット列の符号を求める計算手順を次に示す。ここで，符号の長さはnビットとする。'),
    p('〔nビットの符号を求める計算手順〕'),
    p('（1） 左端及び右端のビットが1である（n＋1）ビットのビットパターン（以下，マスクという）を定める。'),
    p('（2） 符号計算対象のビット列の右端にnビットの0を付加したビット列を作る。'),
    p('（3） （2）で作ったビット列に対して次の操作を行う。'),
    p('① ビット列の左端から調べ，最初に値が1であるビットの位置pを見つける。'),
    p('② pを左端としp＋nを右端とする部分ビット列に対し，マスクで排他的論理和（XOR）を取る。'),
    p('③ ビット列の右端nビット以外がすべて0になるまで，①及び②を繰り返す。'),
  ], [
    p('（4） （3）の操作で得られたビット列の右端nビットが符号となる。'),
    p('図に，マスクが' + mask + 'のときの符号（2ビット）を計算する例を示す。'),
    draw('crc', index, '図　マスクが' + mask + 'のときの符号（2ビット）を計算する例'),
    p('マスク' + mask + 'で計算した，符号計算対象のビット列' + input.slice(0, 4) + ' ' + input.slice(4) + 'の2ビットの符号は［空欄］である。'),
    ...bank('解答群', remainders),
    p('設問3　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('誤りの有無の検査は，次の手順で行う。'),
    p('〔誤りの有無の検査手順〕'),
    p('（1） 受信したビット列に対して，送信側で符号の計算に利用したものと同じマスクを使い，〔nビットの符号を求める計算手順〕の（3）と同じ処理を行う。'),
    p('（2） 右端nビットの値によって，誤りの有無を判断する。'),
  ], [
    p('受信したビット列（符号が付加されたビット列）を，誤りの有無の検査手順に従って検査すると，誤りがなければ最後に残った右端nビットの値は［a］になる。このことは次の手順で説明できる。'),
    p('〔手順〕'),
    p('（1） 符号計算対象のビット列を一つの数値Dと見ると，符号Cは次の式で表せる。'),
    p('式① （D×2ⁿ）⊕d₁⊕d₂⊕…⊕dₘ＝C'),
    p('ここで，⊕はXORを表し，mはXORの繰返し回数とする。dᵢ（1≦i≦m）はマスクに対応するビット列である。図の例では，d₁＝' +
      d1.aligned + '，d₂＝' + d2.aligned + '，d₃＝' + d3.aligned + 'である。'),
    p('（2） 〔誤りの有無の検査手順〕で得られた結果の右端nビットの値Tは，次の式で表せる。'),
    p('式② （D×2ⁿ）⊕C⊕d₁⊕d₂⊕…⊕dₘ＝T'),
    p('（3） 式②を変形すると次の式となる。'),
    p('式③ （D×2ⁿ）⊕d₁⊕d₂⊕…⊕dₘ⊕C＝T'),
    p('（4） 式①と式③によって，［b］＝Tとなる。'),
    p('マスク' + mask + 'で計算した符号を右端に付加したビット列' + received + 'を受信した。このビット列には［c］。'),
    ...bank('aに関する解答群', clean),
    ...bank('bに関する解答群', expression),
    ...bank('cに関する解答群', verdicts),
  ]];
}

export const legacy2010AutumnPm3Definition = define(3, 'CRC（巡回冗長検査）',
  '設問1=エ・設問2=イ・設問3 a=ア・b=エ・c=ア', '到着パケットの検出率、符号マスクとビット列',
  '受信パケットの条件、CRCのマスクと計算するビット列、受信したビット列を変えます。',
  'p.13〜15。再送を含む全受信の分母、マスクの端点、n桁の0、左からのXOR、終了条件、図の行とdᵢ、XORの式①②③、余りゼロと誤りなしの関係を保持。', index => {
    const { accepted, errorPercent, counts, mask, input, received } = crcCase(index);
    const correct = accepted * 100 / (100 - errorPercent);
    const remainder = divideBits(input + '00', mask).remainder, receivedRemainder = divideBits(received, mask).remainder;
    return {
      prompt: autumn2010Pm3Pages(index).flat(),
      ...answers([strings(counts.map(String)), strings(remainders), strings(clean), strings(expression), strings(verdicts)], [
        single('1', '設問1', 0, counts.indexOf(correct)), single('2', '設問2', 1, remainders.indexOf(remainder)),
        single('3a', '設問3 a', 2, 0), single('3b', '設問3 b', 3, 3),
        single('3c', '設問3 c', 4, receivedRemainder === '00' ? 2 : 0),
      ]),
      explanation: 'CRCはCyclic Redundancy Checkの略で，巡回冗長検査を意味する。XORはExclusive ORの略で，両ビットが異なるときに1になる排他的論理和である。誤りが検出されなかった' + accepted + '個が全受信の' + (100 - errorPercent) +
        '%なので，全受信数は' + correct + '個。' + input + 'に00を付け，左端の1をマスク' + mask +
        'とのXORで消していくと，右端2ビットは' + remainder + 'になる。' +
        '式③のD×2ⁿとd₁〜dₘを式①のCに置き換えると，T＝C⊕C＝0となる。受信列には既に符号があるため，0を付け加えずに割る。余りは' +
        receivedRemainder + 'で，' + (receivedRemainder === '00' ?
          '符号で誤りは検出されない。マスクの倍数に当たる誤りも検出できないので，誤りが含まれるか否かは判断できない。' :
          '0でないため誤りが含まれる。'),
    };
  });
