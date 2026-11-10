import { code, list, p, table } from './definition';
import { autumn2012AmDiagram, nandCases, reliabilityCases, searchCases } from './legacy-2012-autumn-am-01-26-figures';
import { choiceBody, define, formula, source } from './legacy-2012-autumn-am-01-26-shared';

const shiftInputs = [[208, 20], [203, 25], [188, 32], [179, 31]] as const;
const bits8 = (value: number) => (value & 0xff).toString(2).padStart(8, '0');
const arithmeticShift = define(1, '8ビットの被シフト数と被減数', shiftInputs.length,
  '8ビット、右に2ビット、2の補数と減算方向を固定する。全候補は8桁。符号を逆に読む値、減算の2の補数で反転後の1加算を落とす値、算術シフトの差、0埋めとする差の順。', index => {
    const [encoded, minuend] = shiftInputs[index];
    const signed = encoded - 256, shifted = signed >> 2, answer = minuend - shifted;
    const missingIncrement = minuend + ~shifted;
    const choices = [minuend + shifted, missingIncrement, answer, minuend - (encoded >>> 2)].map(bits8);
    const prompt = source[1].prompt.replace('11010000', bits8(encoded)).replace('00010100', bits8(minuend));
    return choiceBody(prompt, choices, bits8(answer),
      '右算術シフトでは符号ビット1を空いた上位に補う。' + bits8(encoded) + 'は2の補数で' + signed + '、右に2ビット移した' +
      bits8(shifted) + 'は' + shifted + 'である。' + minuend + '−(' + shifted + ')＝' + answer + 'なので8ビット表記は' + bits8(answer) + 'となる。');
  });

const gcdInputs = [[175, 77], [124, 84], [147, 91], [120, 67]] as const;
const gcdIterations = define(2, '正の整数x₀とx₁', gcdInputs.length,
  '3桁と2桁の正の整数、x₀＞x₁、代入記号、剰余0で終了する手順を維持する。回数の4択は原問どおりの昇順。', index => {
    const [x0, x1] = gcdInputs[index];
    const remainders: number[] = [];
    let previous: number = x0, current: number = x1;
    while (current !== 0) {
      const remainder = previous % current;
      remainders.push(remainder);
      [previous, current] = [current, remainder];
    }
    const prompt = source[2].prompt.replace('x₀＝175，x₁＝77', 'x₀＝' + x0 + '，x₁＝' + x1);
    return choiceBody([p(prompt), code(source[2].material, 'text')], source[2].choices, remainders.length,
      '手順（2）が求める剰余は順に' + remainders.join('，') + '。0を得た回も実行回数に含むため' +
      remainders.length + '回であり、直前の値' + previous + 'が最大公約数である。');
  });

const complexityCases = [
  {
    columns: ['2分探索', '線形探索', 'ハッシュ探索'],
    orders: [['log₂n', 'n', '1'], ['n log₂n', 'n', 'log₂n'], ['n log₂n', 'n²', '1'], ['n²', '1', 'n']],
    answer: ['log₂n', 'n', '1'],
    detail: '2分探索は候補を半減し、線形探索は全データを順に見る可能性がある。衝突を無視するハッシュ探索は一度の参照で特定できる。',
  },
  {
    columns: ['2分探索（最初に一致）', '線形探索（未発見）', 'ハッシュ探索'],
    orders: [['log₂n', 'n', '1'], ['1', 'n', '1'], ['n', 'n', 'log₂n'], ['1', '1', 'n']],
    answer: ['1', 'n', '1'],
    detail: '2分探索では最初の比較で終了する。線形探索は不一致のままn個を確認し、ハッシュ探索は衝突が無視できるので一定回数で済む。',
  },
  {
    columns: ['2分探索（最大比較回数）', '線形探索（先頭で一致）', 'ハッシュ探索'],
    orders: [['log₂n', 'n', '1'], ['n', '1', 'log₂n'], ['log₂n', '1', '1'], ['n log₂n', 'n²', '1']],
    answer: ['log₂n', '1', '1'],
    detail: '2分探索で候補が1個になるまでの半減回数は対数、先頭で一致する線形探索と衝突を無視できるハッシュ探索は一定である。',
  },
  {
    columns: ['2分探索（最初に一致）', '線形探索（先頭で一致）', 'ハッシュ探索'],
    orders: [['log₂n', 'n', '1'], ['1', 'n', '1'], ['log₂n', '1', '1'], ['1', '1', '1']],
    answer: ['1', '1', '1'],
    detail: '2分探索と線形探索は最初の比較で終了する。ハッシュ探索も衝突が無視できるので、いずれもnに依存しない。',
  },
];
const complexity = define(3, '3種類の探索と一致条件', complexityCases.length,
  'nとcの定義、無視できる衝突確率、探索方法3列と全4択を維持する。比較が終わる条件を変え、関係のないソート時間を加えない。', index => {
    const { columns, orders, answer, detail } = complexityCases[index];
    const conditions = ['', '2分探索では最初に一致し，線形探索では見つからない場合を考える。',
      '2分探索では最大の比較回数を，線形探索では先頭で一致する場合を考える。',
      '2分探索と線形探索のどちらも最初に一致する場合を考える。'];
    const prompt = source[3].prompt + (index ? ' ' + conditions[index] : '');
    return {
      prompt: [p(prompt)], choices: orders.map(row => [table('探索方法と実行時間のオーダ', columns, [row])]),
      correctIndex: orders.findIndex(row => row.every((order, i) => order === answer[i])),
      explanation: detail + '従って列順に' + answer.join('，') + 'である。',
    };
  });

const alphabets = [
  { words: '英字の大文字（A～Z）と数字（0～9）', size: 36, arithmetic: '26＋10' },
  { words: '英字の大文字（A～N）と数字（0～9）', size: 24, arithmetic: '14＋10' },
  { words: '英字の大文字（A～Z）と小文字（a～z）及び数字（0～9）', size: 62, arithmetic: '26＋26＋10' },
  { words: '英字の大文字（A～Z）と小文字（a～z）及び数字（0～9）と記号（！、？、＠、＃、％、＆）', size: 68, arithmetic: '26＋26＋10＋6' },
];
const fixedLength = define(4, '区別する文字種の集合', alphabets.length,
  '固定長の2進符号で一意にコード化する最少ビット数を問う。異なる文字の種類を数えて2の累乗を比較し、昇順5〜8を保つ。', index => {
    const { words, size, arithmetic } = alphabets[index], answer = Math.ceil(Math.log2(size));
    return choiceBody(source[4].prompt.replace(alphabets[0].words, words), source[4].choices, answer,
      '対象は' + arithmetic + '＝' + size + '種類である。' + (answer - 1) + 'ビットの' + 2 ** (answer - 1) +
      '通りでは足りず、' + answer + 'ビットの' + 2 ** answer + '通りで全てを区別できる。');
  });

const queueLengths = [4, 3, 5, 6];
const reverseQueue = define(5, '逆順に並べ替えるキューのデータ数', queueLengths.length,
  '空スタック、キューの先頭から取り出し末尾に入れる規則、二つの手続、逆順、deq_pushの最少回数を固定する。4択は原問の昇順。', index => {
    const length = queueLengths[index];
    const letters = [...'ABCDEF'.slice(0, length)];
    const prompt = source[5].prompt.replace('四つのデータA，B，C，D', length + '個のデータ' + letters.join('，'))
      .replace('D，C，B，Aの順', [...letters].reverse().join('，') + 'の順');
    return choiceBody(index === 0 ? source[5].prompt : prompt, source[5].choices, length - 1,
      '末尾の' + letters.at(-1) + 'より先にあった' + (length - 1) + '個を取り出さなければ、そのデータを先頭にできない。' +
      'この' + (length - 1) + '個をdeq_pushで移し、順にpop_enqで戻すと逆順になるので最少は' + (length - 1) + '回である。');
  });

const midpoint = define(6, '配列の整列方向と探索区間の上端の扱い', searchCases.length,
  '終了時m＝0、整数除算、空欄a、x・yとk・A(m)の比較を保持する。降順のときの枝と、上端を含めないときの境界を同期する。候補式の和・平均・差は固定で、どの区間でも答えは平均になる。', index => {
    const { descending, exclusive } = searchCases[index];
    const prompt = source[6].prompt.replace('昇順', descending ? '降順' : '昇順') +
      (exclusive ? '探索範囲は下端xを含み、上端yを含まない。' : '');
    return choiceBody([p(prompt), autumn2012AmDiagram('binarySearch', index)], source[6].choices, source[6].choices[1],
      '区間の中央を選ぶため、両端の和を2で割った整数部分をmに入れる。' +
      (exclusive ? 'x＜yの間はx≦m＜yであり、不要な上側を捨てる場合はmを含まないようyをmにする。'
        : 'x≦yの間はx≦m≦yであり、不一致なら不要な側とmを捨てる。') +
      'kとA(m)の大小に応じて' + (descending ? '降順' : '昇順') + 'の並びに合う側を調べる。');
  }, true);

const factorialBase = [0, 1, 2, 3];
const recursionCount = define(7, '階乗の再帰が終了するn', factorialBase.length,
  '階乗の再帰、基底と漸化式の2行、乗算の回数を表す式を維持する。基底値は固定の階乗値であり、そこまで引数が1ずつ減る。', index => {
    const base = factorialBase[index], start = [1, 1, 2, 6][index];
    const answer = base === 0 ? 'n' : 'n−' + base;
    const choices = base < 2 ? source[7].choices : ['n−1', answer, 'n²', 'n!'];
    return choiceBody([p(source[7].prompt + (base ? ' ここで，n≧' + base + 'とする。' : '')),
      code('F(n) ＝ ' + start + '         （n＝' + base + '）\n        n×F(n−1)  （n＞' + base + '）', 'text')], choices, answer,
      'nが' + base + 'に達した基底の場合には乗算がない。それ以外は乗算を1回して引数を1減らすので、全体では' + answer + '回である。');
  });

const vectorCases = [
  {
    prompt: source[9].prompt,
    address: '割込み処理ルーチンの開始番地の決定',
    detail: '割込み要因に対応する開始番地を決定する。',
  },
  {
    prompt: '割込みベクタ表を用いるプロセッサで、割込み発生時の処理手順はどれか。',
    address: '割込み要因に対応するベクタ表の項目から開始番地を取得',
    detail: '割込み要因を索引にベクタ表から開始番地を読み出す。',
  },
  {
    prompt: '全ての割込み要因に共通の入口を使用するプロセッサで、割込み発生時の処理手順はどれか。',
    address: '共通の割込み入口の開始番地を選択',
    detail: 'この方式では割込み要因にかかわらず共通の入口の開始番地を使う。',
  },
  {
    prompt: '外部割込みの番号を専用レジスタから得るプロセッサで、割込み発生時の処理手順はどれか。',
    address: '専用レジスタの番号に対応するルーチンの開始番地を選択',
    detail: 'レジスタから得た番号で、対応するルーチンの開始番地を選ぶ。',
  },
];
const interrupt = define(9, '割込み処理ルーチンの開始番地の決め方', vectorCases.length,
  '参照する4個の手順番号と各選択肢の順序を維持する。元のプロセッサモデルに合わせ、開始番地の決定方式を具体化しても特権移行→退避→番地決定→実行の依存は固定。', index => {
    const { prompt, address, detail } = vectorCases[index];
    return choiceBody([p(prompt), list(['① プログラムレジスタ（プログラムカウンタ）などの退避',
      '② ユーザモードから特権モードへの移行', '③ ' + address, '④ 割込み処理ルーチンの実行'])],
    source[9].choices, source[9].choices[2],
    'この問題の手順では、まず特権モードへ移り、割込み前の位置などを再開できるよう退避する。' + detail +
      '開始番地を得てからそのルーチンを実行するため、② → ① → ③ → ④となる。');
  }, true);

const cacheInputs = [[60, 10, 15], [50, 10, 26], [80, 20, 38], [50, 5, 14]] as const;
const cacheHit = define(10, '主記憶・キャッシュ・実効の各アクセス時間', cacheInputs.length,
  'ナノ秒の整数3値、ヒット時とミス時の重み、率の昇順を維持する。正答は有限小数。誤答はミス率、主記憶時間に対するキャッシュ時間とその補数。小数第2位までで区別する。', index => {
    const [memory, cache, effective] = cacheInputs[index];
    const answer = (memory - effective) / (memory - cache);
    const displayed = (value: number) => Number(value.toFixed(2));
    const choices = [1 - answer, cache / memory, 1 - cache / memory, answer].map(displayed).sort((a, b) => a - b);
    const prompt = source[10].prompt.replace('60ナノ秒', memory + 'ナノ秒').replace('10ナノ秒', cache + 'ナノ秒')
      .replace('15ナノ秒', effective + 'ナノ秒');
    return choiceBody(prompt, choices, displayed(answer),
      'ヒット率をhとすると、実効時間は' + cache + 'h＋' + memory + '(1−h)＝' + effective +
      'ナノ秒。h＝(' + memory + '−' + effective + ')／(' + memory + '−' + cache + ')＝' + displayed(answer) + 'である。');
  });

const fontInputs = [[96, 12], [96, 24], [108, 12], [120, 30]] as const;
const fontHeight = define(12, 'ディスプレイのdpiとフォントのポイント数', fontInputs.length,
  '正方フォントの縦、1ポイント＝1／72インチ、整数ドット、4択の昇順を維持する。半分、解像度の逆換算、ポイント値の流用が誤答。', index => {
    const [dpi, point] = fontInputs[index], dots = dpi * point / 72;
    const choices = [dots / 2, point * 72 / dpi, point, dots].sort((a, b) => a - b);
    return choiceBody(source[12].prompt.replace('96dpi', dpi + 'dpi').replace('12ポイント', point + 'ポイント'), choices, dots,
      'dpi（dots per inch）は1インチ当たりのドット数。縦' + point + 'ポイントは' + point + '／72インチなので、' +
      dpi + '×' + point + '／72＝' + dots + 'ドットである。');
  });

const superscripts = ['', '', '²', '³', '⁴', '⁵', '⁶', '⁷'];
const exponent = (base: string, power: number) => base + superscripts[power];
const reliability = define(15, '共通直列部と上下直列枝のシステム数', reliabilityCases.length,
  '入口の共通直列部、直列の上下2枝の並列、各装置の稼働率P、どちらかの枝でよい条件を保持する。全4式の誤答モデルと次数の負担を保つ。', index => {
    const { common, upper, lower } = reliabilityCases[index], commonTerm = exponent('P', common);
    const parallelFailure = upper === lower ? exponent('(1−' + exponent('P', upper) + ')', 2)
      : '(1−' + exponent('P', upper) + ')(1−' + exponent('P', lower) + ')';
    const paired = exponent('{1−(1−P)²}', upper) + (lower > upper ? exponent('P', lower - upper) : '');
    const expressions = [
      '1−(1−' + commonTerm + ')' + parallelFailure,
      commonTerm + '{1−' + exponent('(1−P)', upper + lower) + '}',
      commonTerm + paired,
      commonTerm + '{1−' + parallelFailure + '}',
    ];
    return {
      prompt: [p(source[15].prompt + (index ? ' 各システムの稼働・停止は互いに独立とする。' : '')), autumn2012AmDiagram('reliability', index)],
      choices: expressions.map(expression => [formula(expression)]), correctIndex: 3,
      explanation: '共通部の稼働率は' + commonTerm + '。上枝と下枝の稼働率はそれぞれ' + exponent('P', upper) + 'と' +
        exponent('P', lower) + 'であり、両枝が停止する確率は' + parallelFailure + '。共通部が稼働し、少なくとも一方の枝が稼働する確率は' +
        expressions[3] + 'である。',
    };
  });

const pagingCases = [
  { frames: 4, accesses: [1, 2, 3, 4, 5, 2, 1, 3, 2, 6], choices: [1, 2, 4, 5] },
  { frames: 4, accesses: [1, 2, 3, 4, 5, 4, 2, 5, 4, 6], choices: [1, 2, 3, 4] },
  { frames: 4, accesses: [1, 2, 3, 4, 2, 5, 4, 5, 3, 6], choices: [1, 2, 4, 5] },
  { frames: 3, accesses: [1, 2, 3, 2, 4, 2, 3, 4, 1, 6], choices: [1, 2, 3, 4] },
];
const replacement = define(19, '主記憶のページ枠数と10回の参照順序', pagingCases.length,
  'LRU、空の初期状態、末尾のページ6参照時に追い出すページ、4択の昇順を保持する。直近の参照を更新するか否かで正答を区別できる条件を使う。', index => {
    const { frames, accesses, choices } = pagingCases[index], resident = new Map<number, number>();
    let victim = 0;
    accesses.forEach((page, time) => {
      if (!resident.has(page) && resident.size === frames) {
        victim = [...resident].reduce((oldest, item) => item[1] < oldest[1] ? item : oldest)[0];
        resident.delete(victim);
      }
      resident.set(page, time);
    });
    const prompt = source[19].prompt.replace('ページ枠が4', 'ページ枠が' + frames)
      .replace(pagingCases[0].accesses.join('，'), accesses.join('，'));
    return choiceBody(prompt, choices, victim,
      'LRU（Least Recently Used）は、現在主記憶にあるページのうち最後に参照してから最も長く経ったものを置き換える。' +
      '最後のページ6の直前に残るページは' + [...resident.keys()].filter(page => page !== 6).concat(victim).sort((a, b) => a - b).join('，') +
      '。その中ではページ' + victim + 'の最終参照が最も古いので、これが置き換えられる。');
  });

const truth = ['0001', '0111', '1110', '1000'];
const nandCircuit = define(22, 'NAND素子の入力分岐と接続', nandCases.length,
  'NANDと入力X・Y・出力Z、論理積・論理和・否定の定義、全4式を保つ。入力を両端に入れるNANDを使い、結線と反転段数から出力を決定する。', index => {
    const gates = nandCases[index];
    const bits = [[0, 0], [0, 1], [1, 0], [1, 1]].map(input => {
      const signals = [...input];
      for (const [left, right] of gates) signals.push(1 - signals[left] * signals[right]);
      return signals.at(-1);
    }).join('');
    const explanations = [
      '左右の入力を同じ値にするとNAND（否定論理積）は反転器になる。左の二つの出力はXとYを各々反転した値で、その論理積の否定はド・モルガンの法則よりXとYの論理和になる。',
      '左のNANDの出力を右のNANDの両端へ入れると出力が反転するので、全体はXとYの論理積になる。',
      '最初にXとYの論理積を否定し、その値を後段の二つのNANDで2回反転する。従って最初の出力と同じ否定論理積である。',
      '最初の二つでXとYを各々反転し、その論理積を三つ目で否定するので論理和になる。最後にこの値を反転するため、全体は否定論理和である。',
    ];
    return {
      prompt: [p(source[22].prompt), autumn2012AmDiagram('nand', index)],
      choices: truth.map((_, choice) => [autumn2012AmDiagram('logicChoice', choice)]),
      correctIndex: truth.indexOf(bits), explanation: explanations[index],
    };
  });

const monthlyCases = [
  { byProduct: false, months: 3 }, { byProduct: true, months: 3 },
  { byProduct: false, months: 2 }, { byProduct: true, months: 2 },
] as const;
const orders = define(25, '担当者を対応付けるマスタと過去データの月数', monthlyCases.length,
  '4ファイル、当月は顧客と商品の組、過去は別々の月別合計を保持する。担当者コードをどちらのマスタに持たせるかを変え、4択の次元と表示順を維持。', index => {
    const { byProduct, months } = monthlyCases[index];
    const history = ['前月受注額', '2か月前受注額', '3か月前受注額'].slice(0, months);
    const rows = [
      ['顧客マスタ', ['顧客コード', '名称', ...(byProduct ? [] : ['担当者コード']), ...history].join('，'), byProduct ? '―' : '各顧客の担当者は1人'],
      ['商品マスタ', ['商品コード', '名称', ...(byProduct ? ['担当者コード'] : []), ...history].join('，'), byProduct ? '各商品の担当者は1人' : '―'],
      ['担当者マスタ', '担当者コード，氏名', '―'],
      ['当月受注', '顧客コード，商品コード，受注額', '当月の合計受注額'],
    ];
    return choiceBody([p(source[25].prompt.replace('直前の3か月分', '直前の' + months + 'か月分')), table('ファイルの項目', ['ファイル', '項目', '備考'], rows)],
      source[25].choices, source[25].choices[byProduct ? 2 : 3],
      '当月は顧客と商品を組み合わせて受注額を取得できる。過去' + months + 'か月には顧客別と商品別の合計しかなく、両者を掛け合わせた明細は得られない。' +
      (byProduct ? '商品マスタの担当者コードで商品別の合計と担当者を結合できる。' : '顧客マスタの担当者コードで顧客別の合計と担当者を結合できる。'));
  });

export const calculation2012AutumnAm0126 = [
  arithmeticShift, gcdIterations, complexity, fixedLength, reverseQueue, midpoint, recursionCount,
  interrupt, cacheHit, fontHeight, reliability, replacement, nandCircuit, orders,
];
