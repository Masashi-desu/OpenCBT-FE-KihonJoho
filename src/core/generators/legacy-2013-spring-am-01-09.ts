import { p, pairs, strings, table } from './definition';
import { flowCases, hashCases, postfixCases, postfixTrace, spring2013AmDiagram, treeCases, treeEdges } from './legacy-2013-spring-am-01-26-figures';
import { define, source, textBody } from './legacy-2013-spring-am-01-26-shared';

const widths = [16, 8, 12, 20];
const nibble = define(1, '2進数のビット数と桁数', widths.length,
  '下位から1桁ずつ取り出す手順とa・bの空欄を固定する。語長と反復回数を連動させ、下位4ビット又はそれ以外のマスクと、左右の4ビットシフトを比較する。', index => {
    const width = widths[index], digits = width / 4;
    const low = '0'.repeat(digits - 1) + 'F', rest = 'F'.repeat(digits - 1) + '0', example = 'X'.repeat(digits);
    const prompt = source[1].prompt.replace('16ビット', width + 'ビット').replace('4回', digits + '回')
      .replaceAll('XXXX', example);
    return {
      prompt: [p(prompt), p('〔手順〕'), p('（1）［a］をxに代入する。'), p('（2）xをスタックにプッシュする。'),
        p('（3）nを［b］論理シフトする。')],
      choices: pairs([low, rest].flatMap(mask => ['左', '右'].map(direction => ['n AND ' + mask + '₁₆', direction + 'に4ビット']))),
      correctIndex: 1,
      explanation: '16進数の1桁は4ビットである。' + low + '₁₆との論理積で下位4ビットだけを取り出し，' +
        '右に4ビット論理シフトして次の桁を下位に移す。この操作を' + digits + '回繰り返すと，下位の桁から順にプッシュできる。',
    };
  });

const pulseCases = [[16, '0〜9，A〜F', 16], [24, '0〜7', 8], [20, 'A〜D', 4], [30, '0〜9，A〜V', 32]] as const;
const pulse = define(2, 'パルス数と符号化する文字の集合', pulseCases.length,
  '1ビット1パルス、非圧縮、等間隔を保持する。文字種別数は2の累乗、パルス数はビット数の倍数。数値選択肢は原問題と同じ2倍刻みの昇順。', index => {
    const [rate, alphabet, symbols] = pulseCases[index], bits = Math.log2(symbols), result = rate / bits;
    const choices = (index === 0 ? [1, 2, 4, 8] : [result / 2, result, result * 2, result * 4]).map(String);
    const prompt = source[2].prompt.replace('16個', rate + '個').replace('0〜9，A〜Fの16種類', alphabet + 'の' + symbols + '種類');
    return textBody(prompt, choices, choices.indexOf(String(result)), symbols + '種類は2の' + bits +
      '乗なので，1文字に' + bits + 'ビット必要。1秒に' + rate + 'ビット送れるので，' + rate + '÷' + bits + '＝' + result + '文字である。');
  });

const pcmCases = [[64000, 8], [80000, 4], [40000, 8], [48000, 12]] as const;
const pcm = define(3, '毎秒データ量と量子化ビット数', pcmCases.length,
  '符号化したビット数から標本周波数を求め、その逆数をマイクロ秒に換算する。答えは整数で丸め不要。桁の換算漏れ・周波数との混同・割算方向の混同を誤答にする。', index => {
    const [rate, bits] = pcmCases[index], samples = rate / bits, result = 1000000 / samples;
    const choices = index === 0 ? source[3].choices :
      [result / 1000, samples / 1000, result, rate * bits / 1000].sort((a,b) => a-b).map(String);
    return textBody(source[3].prompt.replace('64,000', rate.toLocaleString('en-US')).replace('8ビット', bits + 'ビット'),
      choices, choices.indexOf(String(result)), 'PCM（Pulse Code Modulation，パルス符号変調）では，1標本が' + bits +
        'ビットなので，' + rate.toLocaleString('en-US') + '÷' + bits + '＝' + samples.toLocaleString('en-US') +
        '標本／秒。1標本当たりは1,000,000÷' + samples.toLocaleString('en-US') + '＝' + result + 'マイクロ秒である。');
  });

const parity = define(4, 'パリティの方式と生じる反転ビット数', 3,
  '垂直パリティの伝送誤りの検出・訂正について適切な記述を選ぶ。奇数・偶数を別々に扱い、反転数の偶奇を異なる条件で判定する。', index => {
    if (index === 0) return textBody(source[4].prompt, source[4].choices, 0,
      'どちらのパリティでも1ビットの反転で1の個数の偶奇が変わり，誤りを検出できる。偶数個の反転では偶奇が同じなので検出できず，検出時も誤った位置は特定できない。');
    if (index === 1) return textBody('通信回線で偶数パリティによるパリティチェック方式（垂直パリティ）を用いたときの記述として，適切なものはどれか。',
      ['2ビットの誤りを検出できる。', '3ビットの誤りを検出できる。', '1ビットの誤りを訂正できる。', '偶数個のビット誤りだけを検出できる。'], 1,
      '偶数パリティは，符号全体の1の個数が偶数になるようにビットを付加する。3ビットの反転は1の個数を奇数に変えるので検出できる。反転位置は特定できず，偶数個の反転は検出できない。');
    return textBody('通信回線で奇数パリティによるパリティチェック方式（垂直パリティ）を用いたときの記述として，適切なものはどれか。',
      ['2ビットの誤りを検出できる。', '1ビットの誤りを訂正できる。', '4ビットの誤りを検出できる。', '奇数個のビット誤りを検出できる。'], 3,
      '奇数パリティは，符号全体の1の個数が奇数になるようにビットを付加する。奇数個の反転はこの個数を偶数に変えるので検出できる。反転位置は特定できず，偶数個の反転は検出できない。');
  });

function subtree(parent: number, left: boolean) {
  const first = treeEdges.find(([from, to]) => from === parent && (to < parent) === left)?.[1];
  if (!first) return [];
  const values: number[] = [first];
  for (const node of values) values.push(...treeEdges.filter(([from]) => from === node).map(([, to]) => to));
  return values;
}
const searchTree = define(5, '太枠で示す削除要素', treeCases.length,
  '元の枝と全要素の配置を保持し、子を二つ持つ別のノードを削除対象にする。昇順の四択には左右部分木に対する成立候補を必ず一つだけ置く。', index => {
    const { target, choices } = treeCases[index];
    const leftMax = Math.max(...subtree(target, true)), rightMin = Math.min(...subtree(target, false));
    return { prompt: [p(source[5].prompt.replace('要素12', '要素' + target)), spring2013AmDiagram('tree', index, '2分探索木')],
      choices: strings(choices.map(String)), correctIndex: choices.findIndex(value => value === leftMax || value === rightMin),
      explanation: '移動後も左の部分木の全要素より大きく，右の部分木の全要素より小さくする。したがって左の最大値' +
        leftMax + '又は右の最小値' + rightMin + 'を移動できる。このうち選択肢にあるのは' +
        choices.find(value => value === leftMax || value === rightMin) + 'である。' };
  });

const postfix = define(6, '逆ポーランド表記法の被演算子と並び', postfixCases.length,
  '加算だけで同じ順の被演算子を扱う式・スタックの変化・最大深さの最小を問う原形式を保持。項数と演算の順を変え、各式の最大深さに同率最小を作らない。', index => {
    const { example, options } = postfixCases[index], maxDepth = postfixTrace(example).depth;
    const depths = options.map(expression => postfixTrace(expression).depth);
    const correct = Math.min(...depths);
    return { prompt: [p(source[6].prompt.replace('abcd+++', example).replace('最大で4', '最大で' + maxDepth)),
      spring2013AmDiagram('postfix', index, 'スタックの変化')], choices: strings([...options]),
      correctIndex: depths.indexOf(correct),
      explanation: '被演算子はプッシュして深さが1増える。＋は二つをポップして和をプッシュするので深さが1減る。' +
        '四つの式の最大深さは原順に' + depths.join('，') + 'となり，最小は' + correct + 'である。' };
  });

const hash = define(7, '5桁の数とハッシュ関数の法', hashCases.length,
  '十進5桁の桁和の剰余で格納位置を求める。原の省略表記を保持し、配列の末尾位置も法に合わせる。別の桁、法の倍数との距離などを誤答にする。', index => {
    const [value, divisor] = hashCases[index];
    const digits = String(value).split('').map(Number), sum = digits.reduce((a,b) => a+b), correct = sum % divisor;
    const choices = index === 0 ? source[7].choices :
      [digits[4], correct, divisor - correct, Math.floor(sum / divisor)].sort((a,b) => a-b).map(String);
    const prompt = source[7].prompt.replaceAll('13', String(divisor)).replace('54321', String(value));
    return { prompt: [p(prompt), spring2013AmDiagram('hash', index, '配列の位置')], choices: strings(choices),
      correctIndex: choices.indexOf(String(correct)),
      explanation: '各桁の和は' + digits.join('＋') + '＝' + sum + '。' + sum + 'を' + divisor + 'で割った余りは' +
        correct + 'なので，位置' + correct + 'の要素へ格納する。' };
  });

const flow = define(8, '被除数・除数と結果を格納する変数', flowCases.length,
  '開始・初期化、比較、二分岐、反復、終了を保つ。被除数／除数、商／余りを格納する変数の役割を変える。自然数の除数で有限回で止まる。', index => {
    const { dividend, divisor, quotient, remainder } = flowCases[index], correctIndex = (dividend === 'x' ? 0 : 2) + (quotient === 'q' ? 1 : 0);
    return { prompt: [p(source[8].prompt), spring2013AmDiagram('flow', index, '流れ図')],
      choices: source[8].choices.map(choice => [table('結果の組合せ', ['qの値', 'rの値'], [choice.split('／')])]), correctIndex,
      explanation: remainder + 'を' + dividend + 'で初期化し，' + divisor + 'を引くたびに' + quotient + 'を1増やす。' +
        remainder + 'が' + divisor + '未満で終了するので，' + quotient + 'が' + dividend + '÷' + divisor + 'の商，' + remainder + 'が余りである。' };
  });

const mipsCases = [50, 20, 25, 10];
const mips = define(9, 'プロセッサのMIPS値', mipsCases.length,
  '命令数の逆数を時間にする。命令率をそのまま時間にする誤りと、単位の桁を誤る場合を候補にする。原と同じ整数表記でナノ秒二つ・マイクロ秒二つの昇順を保つ。', index => {
    const rate = mipsCases[index], ns = 1000 / rate;
    const choices = index === 0 ? source[9].choices : [rate + 'ナノ秒', ns + 'ナノ秒', ns / 10 + 'マイクロ秒', ns / 5 + 'マイクロ秒']
      .sort((a,b) => Number.parseFloat(a) * (a.includes('マイクロ') ? 1000 : 1) - Number.parseFloat(b) * (b.includes('マイクロ') ? 1000 : 1));
    return textBody(source[9].prompt.replace('50MIPS', rate + 'MIPS'), choices, choices.indexOf(ns + 'ナノ秒'),
      'MIPS（Million Instructions Per Second）は毎秒100万命令を単位とする。1秒は10億ナノ秒なので，' +
      '平均命令実行時間は1,000÷' + rate + '＝' + ns + 'ナノ秒である。');
  });

export const spring2013Am01To09 = [nibble, pulse, pcm, parity, searchTree, postfix, hash, flow, mips];
