import { code, p, table } from './definition';
import { body, define, latex, source, textBody } from './legacy-2007-spring-am-01-26-shared';
import { draw } from './legacy-2007-spring-am-01-26-figures';
import { insertions, matches, normalRows, sequences } from './legacy-2007-spring-am-01-26-model';

const h = (n: number) => n.toString(16).padStart(4, '0').toUpperCase();
const format = (n: number) => n.toLocaleString('en-US');
const hexFraction = define(1, '16進小数の整数部と小数部の二桁', 4, '16進の位取りを同じ四つの分数表記で比較。小数部の2桁と約分に必要な整数の桁数を保つ。', index => {
  const inputs = ['3A.5C', '2E.9C', '4B.34', '35.A4'];
  const input = inputs[index], [whole, fraction] = input.split('.');
  const x = Number.parseInt(whole, 16), f = Number.parseInt(fraction, 16), n = x * 256 + f;
  const choices = index ? [[x * 16 + Math.floor(f / 16) + 2, 16], [n / 4, 64], [n - 1, 256], [n + 1, 256]] :
    source[1].choices.map(option => option.split('/').map(Number));
  return body(source[1].prompt.replace('3A.5C', input), choices.map(([a,b]) => [latex('\\frac{' + a + '}{' + b + '}', a + '/' + b)]), 1,
    whole + 'の整数部分は' + x + 'で，小数第1位と第2位の重みは1/16と1/256。' + x + '＋' +
    Number.parseInt(fraction[0], 16) + '/16＋' + Number.parseInt(fraction[1], 16) + '/256＝' + n + '/256＝' + n / 4 + '/64である。');
}, true);

const radixLengths = define(2, '正の整数を表す二つの基数', 4, '整数のけた数の換算近似。D/Bの役割、底の逆転・Bを対数に入れる誤答、約1けたのずれを維持。', index => {
  const [a,b] = ([[10,2],[8,2],[16,4],[10,5]] as const)[index];
  const choices = [
    [`${b}\\log_{${a}} B`, `${b} log_${a} B`], [`${a}\\log_{${b}} B`, `${a} log_${b} B`],
    [`B\\log_{${b}} ${a}`, `B log_${b} ${a}`], [`B\\log_{${a}} ${b}`, `B log_${a} ${b}`],
  ];
  return body(source[2].prompt.replace('10進表示', a + '進表示').replace('2進表示', b + '進表示'),
    choices.map(([tex,alt]) => [latex('D\\approx ' + tex, 'D≒' + alt)]), 3,
    b + '進でBけたの整数nは ' + b + '^(B−1)≦n＜' + b + '^B である。底' + a +
    'の対数を取ると，log nから求めるDはおおむねB×log_' + a + ' ' + b +
    'になる。整数のけた数には切捨てと1の加算が入り，この式は厳密な恒等式ではない。');
}, true);

const overflow = define(3, '符号付き16ビット整数の倍率と限界付近の値', 4, '2の補数16ビット、符号範囲境界の比較。倍率が旧値以外でも正側・負側の境界を同程度の桁数で調べる。', index => {
  const [factor, raw] = ([
    [4, [0x1fff,0xdfff,0xe000,0xffff]], [2, [0x4000,0xc000,0x3fff,0xffff]],
    [8, [0x0fff,0xf000,0x1000,0xffff]], [16, [0x07ff,0xffff,0xf800,0xf7ff]],
  ] as const)[index];
  const values = raw.map(item => item >= 0x8000 ? item - 0x10000 : item);
  const correct = values.findIndex(item => item * factor < -32768 || item * factor > 32767);
  return textBody(source[3].prompt.replace('4倍', factor + '倍'), raw.map(h), correct,
    '符号付き16ビットで表せる範囲は−32,768〜32,767である。' + h(raw[correct]) + 'は' + values[correct] +
    'で，' + factor + '倍すると' + values[correct] * factor + 'になって範囲を越える。');
});

const average = define(5, '平均を四捨五入する最小単位', 4, '正の平均、床関数と四捨五入を保持し、整数・5・10・100の単位で丸める。加算位置・境界・常時切上げを区別。', index => {
  const step = [1,5,10,100][index], half = step / 2;
  const prompt = index ? source[5].prompt.replace('小数部を四捨五入して整数値で', '最も近い' + step +
    'の倍数に四捨五入して（ちょうど中間なら大きい方に）') : source[5].prompt;
  const choices = index ? [
    step + '×［(S＋' + half + ')／(N×' + step + ')］',
    step + '×(［(S−' + step + ')／(N×' + step + ')］＋1)',
    step + '×［S／(N×' + step + ')＋0.5］',
    step + '×(［S／(N×' + step + ')］＋1)',
  ] : source[5].choices;
  return textBody(prompt, choices, 2, '平均S／Nを' + step + 'の単位で数えた値に0.5を加えて切り捨てる。' +
    (index ? 'この個数に' + step + 'を掛けて元の単位に戻す。' : '0.5未満なら下の整数，0.5以上なら上の整数になる。'));
}, true);

const repetition = define(6, '定常時に表示値から次の関数引数を作る処理', 4, '五手順と「表示値が変化しない」条件を固定。④を代入・符号反転・定数加算・移動に変える。', index => {
  const parameters = ['y', '−y', 'y＋1', 'y−2'];
  const choices = index ? ['f(a)＝y','f(' + parameters[index] + ')＝0','f(' + parameters[index] + ')＝a','f(' + parameters[index] + ')＝y'] : source[6].choices;
  const steps = ['① x←a','② y←f(x)','③ yの値を表示する。','④ x←' + parameters[index],'⑤ ②に戻る。'];
  return textBody([p(source[6].prompt), ...steps.map(p)], choices, 3,
    '表示値をyとすると，次のxは④で' + parameters[index] + 'になる。次に②が計算した出力も同じyなので，成立する式は' + choices[3] + 'である。');
}, true);

const stringCount = define(7, '文字の種類・禁止する先頭文字・最大長', 4, '長さ1以上、再使用可能、先頭だけ制限を保持。最大長だけ・空列込み・先頭無制限を判別。', index => {
  const [letterCount, limit, forbidden] = ([[10,3,'A'],[8,3,'A，B'],[6,4,'A'],[12,2,'A，B，C']] as const)[index];
  const validFirst = letterCount - forbidden.split('，').length;
  const allSuffixes = Array.from({ length: limit }, (_, k) => letterCount ** k).reduce((sum,k) => sum+k,0);
  const correct = allSuffixes * validFirst;
  const choices = [validFirst * letterCount ** (limit - 1), correct, correct + 1, allSuffixes * letterCount].map(format);
  const prompt = source[7].prompt.replace('A〜Jの10種類', 'A〜' + String.fromCharCode(64 + letterCount) + 'の' + letterCount + '種類')
    .replace('長さ1以上3以下','長さ1以上' + limit + '以下').replace('先頭はAで','先頭は' + forbidden + 'のいずれかで');
  return textBody(index ? prompt : source[7].prompt, choices, 1,
    '許される先頭は' + validFirst + '種類で，長さℓの残りの位置は各' + letterCount + '種類である。長さ1〜' + limit +
    'を合計すると' + validFirst + '×' + allSuffixes + '＝' + format(correct) + '通りである。');
}, true);

const normal = define(8, '正規分布の平均・標準偏差・規格境界', 4, '右裾の小数3桁の表と図、境界標準化、％換算を保持。原表は正規密度の積分値で独立検算。', index => {
  const [mean, range, cutoff, correct] = ([[5.2,0.1,5.0,2],[6.3,0.2,5.8,1],[8.8,0.2,8.5,3],[6.8,0.2,6.6,3]] as const)[index];
  const choices = index === 3 ? ['0.159','0.6','6.7','15.9'] : source[8].choices;
  const prompt = source[8].prompt.replace('5.2 kg', mean.toFixed(1) + ' kg').replace('0.1 kg', range.toFixed(1) + ' kg')
    .replace('5.0 kg', cutoff.toFixed(1) + ' kg');
  const z = Math.round((mean - cutoff) / range * 2) / 2;
  return textBody([p(prompt), table('標準正規分布表', ['u','P'], normalRows.map(row => [...row])),
    draw('normal', 0, '標準正規分布の右裾')], choices, correct,
    '境界は平均より ' + z + ' 標準偏差だけ低い。正規分布は左右対称なので u＝' + z +
    ' の右裾を表から選び，確率を100倍して％にすると約' + choices[correct] + '％である。');
});

const boolean = define(9, '二変数のどの組合せを真とするか', 4, 'AND／ORの二項条件文・元の四候補を保つ。各組合せを全列挙して同値な式を選ぶ。', index => {
  const expressions = [source[9].material, 'if (A = True AND B = True) then …',
    'if (A = False AND B = False) OR (A = False AND B = True) OR (A = True AND B = False) then …',
    'if (A = True AND B = False) OR (A = False AND B = True) OR (A = True AND B = True) then …'];
  return body([p(source[9].prompt), code(expressions[index])], source[9].choices.map(choice => [code(choice)]), [3,0,1,2][index],
    ['真と偽の組合せが異なるときだけ真なのでXORに等しい。', '二つとも真の組合せだけ成立するのでANDが真である。',
      '二つとも真の組合せだけ成立しないのでANDが偽である。', 'どちらか一方以上が真なら成立するのでORが真である。'][index]);
});

const parity = define(10, 'レジスタ幅と奇数・偶数パリティ', 4, '全ビットの排他的論理和とパリティの判定。原紙のアとイは同値の誤答。偶数版は当該2候補を反例を持つ式に置く。', index => {
  const [width, odd] = ([[8,true],[6,false],[7,true],[9,false]] as const)[index];
  const limit = 'd' + '₀₁₂₃₄₅₆₇₈₉'[width - 1];
  const xor = 'd₀⊕d₁⊕…⊕' + limit;
  const choices = [(odd ? '0⊕' : '1⊕') + xor + '＝p', index === 0 ? xor + '＝p' : xor + (odd ? '＝1' : '＝0'), xor + '⊕p＝0', xor + '⊕p＝1'];
  return textBody(source[10].prompt.replace('8ビット', width + 'ビット').replace('d₇', limit).replace('奇数', odd ? '奇数' : '偶数'),
    choices, odd ? 3 : 2, '排他的論理和は1の個数が奇数なら1，偶数なら0になる。データとパリティをすべて含めるので，結果は' + Number(odd) + 'である。');
});

const tree = define(12, '2分探索木に格納済みの値と挿入する値', 4, '木と四候補の図のまま、比較によって右部分木内の位置が異なる入力を用意。既存の枝を変えない挿入を問う。', index => {
  const value = insertions[index], choice = index < 3 ? 2 : 3;
  return body([p(source[12].prompt.replaceAll('12', String(value))), draw('tree', index * 5, '元の2分探索木')],
    [0,1,2,3].map(k => [draw('tree', index * 5 + k + 1, '追加後の図' + 'アイウエ'[k])]), choice,
    ['8と10より大きいので二度右へ進み，15と13より小さいので二度左へ進む。13の左の空きに加える。',
      '14は8と10より大きく，15より小さい。13より大きいので，13の右の空きに入る。',
      '22は根12，右の15より大きく，23より小さい。21より大きいので21の右の空きに追加する。',
      '30は根16，右の20，さらに右の29より大きい。29の右の空きに追加する。'][index]);
});

const match = define(13, '探索対象の文字列・パターン・添字の起点', 4, '原流れ図の比較・巻戻し・終端の位置とkを保つ。文字列Bの長さとAの一致位置や添字基準を変える。', index => {
  const [input, needle, start] = matches[index];
  const prompt = source[13].prompt.replace('aababx', input).replace('B が “ab△”', 'B が “' + needle + '△”')
    .replace('1番目と数える', start + '番目と数える');
  const startAt = input.indexOf(needle) + start;
  const choices = index === 3 ? ['−1','1','2','4'] : source[13].choices;
  return textBody([p(prompt), draw('search', index, '文字列照合の流れ図')], choices, choices.indexOf(String(startAt)),
    '最初に一致する位置はAの' + startAt + '番目。パターンBの' + needle.length +
    '文字が一致した直後には i が ' + (startAt + needle.length) + ' となる。Bの終端を検出して k＝i−jmax＝' + startAt + 'になる。');
});

const bubble = define(14, '隣接交換の走査方向と比較演算', 4, '3行のループ・1回目の走査・端に移る極値を維持。前進/後退と比較向きの4条件。', index => {
  const forward = index >= 2, up = index % 2 === 0;
  const operator = up ? '＜' : '＞';
  const lines = ['1  i を1から n−1 まで1ずつ増やしながら行2〜3を繰り返す',
    forward ? '2    j を1から n−i まで1ずつ増やしながら行3を繰り返す' :
      '2    j を n から i＋1 まで1ずつ減らしながら行3を繰り返す',
    '3      もし A[' + (forward ? 'j＋1' : 'j') + '] ' + operator + ' A[' + (forward ? 'j' : 'j−1') +
      '] ならば，A[' + (forward ? 'j＋1' : 'j') + '] と A[' + (forward ? 'j' : 'j−1') + '] を交換する'];
  return textBody([p(source[14].prompt), p('〔アルゴリズム〕'), code(['行番号', ...lines].join('\n'))], source[14].choices,
    [0,1,3,2][index], '各交換で対象側の' + (index === 0 || index === 3 ? '小さい' : '大きい') + '値を次の比較へ送る。' +
    (forward ? '先頭から末尾へ' : '末尾から先頭へ') + '走査すると，1回でその極値が' + (forward ? 'A[n]' : 'A[1]') + 'へ移る。');
});

const gate = define(17, '二入力に対しどの組で出力が0又は1になるか', 4, '抽象の回路図とAND、NAND、OR、XORの名称。同じ入力を全列挙して原形式の判定をする。', index => {
  const condition = [source[17].prompt,
    '二つの入力と一つの出力をもつ論理回路で，二つの入力 A，B がともに1のときだけ，出力 X が1になるものはどれか。',
    '二つの入力と一つの出力をもつ論理回路で，二つの入力 A，B がともに0のときだけ，出力 X が0になるものはどれか。',
    '二つの入力と一つの出力をもつ論理回路で，二つの入力 A，B が異なるときだけ，出力 X が1になるものはどれか。'];
  const correct = [1,0,2,3][index], explanations = ['NANDはAND（論理積）の否定なので，両方1の場合は0になる。残りの3組では1になる。',
    'AND（論理積）は両方が1の組だけ1である。NANDはその結果を反転する。',
    'OR（論理和）はどちらか一方以上が1なら1である。両方が0のときだけ0になる。',
    'XOR（排他的論理和）は0と1の順不同の組で1であり，二入力が同じ組では0である。'];
  return textBody([p(condition[index]), draw('gate', 0, '二つの入力と一つの出力')], source[17].choices, correct, explanations[index]);
});

const cycles = define(19, '命令列、CPI、クロック周期', 4, '六ノードの順序図とCPIの4行を保つ。命令数、CPIの単純平均、各一回だけを足す誤答から区別。', index => {
  const {seq,cpi,clock} = sequences[index];
  const totals = Array.from(seq, mark => cpi[mark.charCodeAt(0) - 97]);
  const total = totals.reduce((sum,k) => sum+k,0), each = cpi.reduce((sum,k) => sum+k,0);
  const choices = index ? [total, clock * seq.length, each * clock, total * clock].sort((a,b) => a-b).map(String) : source[19].choices;
  return textBody([p(source[19].prompt), draw('cycles', index, '命令の実行順'),
    p('各命令の実行に必要なクロックサイクル数（CPI：Cycles Per Instruction）は，表のとおりである。CPUの1クロックサイクル時間を' +
      clock + 'ナノ秒とするとき，この命令列の実行時間は何ナノ秒か。'),
    table('各命令のCPI', ['命令','CPI'], cpi.map((c,i) => ['abcd'[i], String(c)]))],
  choices, choices.indexOf(String(total * clock)), '命令が出現する順にCPIを足すと ' + totals.join('＋') + '＝' + total +
    ' サイクルである。1サイクル' + clock + 'ナノ秒なので，実行時間は' + total * clock + 'ナノ秒となる。');
}, true);

const hit = define(20, '主記憶・キャッシュのアクセス時間と実効時間', 4, '原問のモデルは命中10/ミス60（直列探索ではない）。可変版はミス総時間＝主記憶アクセス時間を明示し、0.1〜0.95の固定精度・意味のある四候補を使う。', index => {
  const [memory, cache, effective, correct] = ([[60,10,15,3],[50,10,20,2],[65,15,25,2],[46,6,10,3]] as const)[index];
  const choices = [
    source[20].choices, ['0.25','0.6','0.75','0.8'], ['0.2','0.62','0.8','0.85'], ['0.1','0.78','0.85','0.9'],
  ][index];
  const prompt = source[20].prompt.replace('時間60ナノ秒', '時間' + memory + 'ナノ秒').replace('時間10ナノ秒', '時間' + cache + 'ナノ秒')
    .replace('時間が15ナノ秒', '時間が' + effective + 'ナノ秒') +
    (index ? ' ヒット時はキャッシュメモリの時間，ミス時は主記憶の時間を，それぞれのアクセスの総所要時間とする。' : '');
  return textBody(prompt, choices, correct, 'この問題の実効時間のモデルでは，ヒット時は' + cache + 'ナノ秒，ミス時は' + memory +
    'ナノ秒である。ミス時にキャッシュの時間を別に加える直列モデルとは異なる。ヒット率をhとすると ' + cache +
    'h＋' + memory + '(1−h)＝' + effective + ' なので，h＝' + choices[correct] + 'となる。');
});

const video = define(24, '画素数・色数・フレームレート・再生時間', 4, '色数からビット深度、1分又は2分、MB換算。各生成の桁数を原問準拠に保つ。', index => {
  const [pixels, colors, fps, minutes] = ([[30,256,30,1],[20,16,30,1],[40,256,25,1],[25,16,24,2]] as const)[index];
  const bytes = pixels * 10_000 * Math.log2(colors) * fps * minutes * 60 / 8;
  const mb = bytes / 1_000_000;
  const options = index ? [Math.round(mb / 7), Math.round(mb / 2), mb, Math.round(mb * 4.25)].map(format) : source[24].choices;
  const prompt = source[24].prompt.replace('30万画素', pixels + '万画素').replace('256色', colors + '色')
    .replace('30フレーム', fps + 'フレーム').replace('1分間', minutes + '分間');
  return textBody(prompt, options, 2, colors + '色を表すには1画素に' + Math.log2(colors) +
    'ビット必要である。1画面のバイト数に毎秒' + fps + 'フレームと' + minutes * 60 +
    '秒を掛けると' + format(bytes) + 'バイトで，約' + mb + ' Mバイトになる。');
}, true);

export const asciiParityReference = () => ({
  id: 'context-2007-spring-am-11-ascii',
  title: 'ASCIIコードの参考表（独立編集）',
  presentation: 'text_figure' as const,
  blocks: [table('上位3ビットと下位4ビットから文字を読む（UnicodeData 17.0.0）', ['下位4ビット', '上位3ビット 100', '上位3ビット 101'],
    Array.from({ length: 8 }, (_, row) => [
      row.toString(2).padStart(4, '0'),
      String.fromCharCode(0x40 + row),
      String.fromCharCode(0x50 + row),
    ]))],
});

const asciiParity = define(11, 'ASCIIコードとパリティビット', 4,
  '原の2文字・最上位のパリティビット・16進4桁の四択を維持。符号値はUnicodeData 17.0.0から取り出しRFC 20で照合した独立参考表を参照する。',
  index => {
    const [input, parity] = ([['ET', 0], ['AP', 1], ['CW', 0], ['DV', 1]] as const)[index];
    const raw = Array.from(input, character => character.charCodeAt(0));
    const hexByte = (byte: number) => byte.toString(16).padStart(2, '0').toUpperCase();
    const hexPair = (bytes: number[]) => bytes.map(hexByte).join('');
    const countOnes = (byte: number) => Array.from(byte.toString(2)).filter(bit => bit === '1').length;
    const coded = raw.map(byte => byte | ((countOnes(byte) % 2 ^ parity) << 7));
    const reverse = (byte: number) => Number.parseInt(Array.from(byte.toString(2).padStart(8, '0')).reverse().join(''), 2);
    const represented = [hexPair(raw), hexPair(coded.map(reverse)), hexPair([coded[0], raw[1]]), hexPair(coded)];
    const official = source[11];
    const rotation = index % represented.length;
    const options = index ? [...represented.slice(rotation), ...represented.slice(0, rotation)] : official.choices;
    const prompt = official.prompt.replace('ET', input).replace('偶数パリティ', parity ? '奇数パリティ' : '偶数パリティ');
    const reasons = raw.map((byte, position) =>
      `${input[position]}の7ビット符号は${byte.toString(2).padStart(7, '0')}で1が${countOnes(byte)}個だから，最上位ビットは${coded[position] >>> 7}となり${hexByte(coded[position])}になる。`);
    return {
      ...textBody(prompt, options, options.indexOf(hexPair(coded)),
        'ASCII（American Standard Code for Information Interchange）は文字に7ビットの符号を割り当てる。' +
        reasons.join('') + '文字順に並べると' + hexPair(coded) + 'となる。'),
      contexts: [asciiParityReference()],
    };
  });

export const calculations2007SpringAm0126 = [
  asciiParity,
  hexFraction, radixLengths, overflow, average, repetition, stringCount, normal, boolean, parity, tree, match, bubble, gate, cycles, hit, video,
];
