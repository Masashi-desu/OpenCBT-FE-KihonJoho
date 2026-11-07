import type { GeneratedBody, GenerationDefinition } from './definition';
import { code, field, figure, p, strings, variableNotes } from './definition';
import { legacy2018TechnicalTraceDefinitions } from './legacy-2018-technical-traces';
import { legacy2019QuantitativeDefinitions } from './legacy-2019-quantitative';
import { decemberAKnowledgeDefinitions } from './sample-2022-dec-a-knowledge';
import { decemberANumericalDefinitions } from './sample-2022-dec-a-numerical';
import { arrayAlt, logicAlt, memoryAlt, memoryCases, profiles } from './legacy-2015-autumn-am-01-26-figures';
import { knowledgeDefinitions } from './legacy-2015-autumn-am-01-26-knowledge';

type Answer = 'ア' | 'イ' | 'ウ' | 'エ';

function indexed(number: number, title: string, answer: Answer, label: string, count: number,
  notes: string, build: (index: number) => GeneratedBody): GenerationDefinition {
  return {
    source: `2015h27a-fe-am-${number}`, title, sourceAnswer: answer, version: '3.2.0',
    fields: [field(label, 0, count - 1)], reference: [0], notes: variableNotes + ' ' + notes,
    build(values) {
      if (values.length !== 1 || !Number.isSafeInteger(values[0]) || values[0] < 0 || values[0] >= count)
        throw new Error('PARAMETER_CONSTRAINT');
      return build(values[0]);
    },
  };
}

function reuse(number: number, family: readonly GenerationDefinition[], canonical: string,
  notes: string, adapt?: (body: GeneratedBody, values: number[]) => GeneratedBody): GenerationDefinition {
  const owner = family.find(definition => definition.source === canonical);
  if (!owner) throw new Error('2015_AUTUMN_AM_CANONICAL_REQUIRED');
  return {
    ...owner, source: `2015h27a-fe-am-${number}`,
    fields: owner.fields.map(value => ({ ...value })), reference: [...owner.reference],
    notes: owner.notes + ' ' + notes,
    build(values) {
      if (values.length !== owner.fields.length || owner.fields.some(({ minimum, maximum }, i) =>
        !Number.isSafeInteger(values[i]) || values[i] < minimum || values[i] > maximum))
        throw new Error('PARAMETER_CONSTRAINT');
      const body = owner.build(values);
      return adapt ? adapt(body, values) : body;
    },
  };
}

function ordered(values: number[], correct: number, format: (value: number) => string = String) {
  if (new Set(values).size !== 4 || values.length !== 4 || !values.includes(correct))
    throw new Error('PARAMETER_CONSTRAINT');
  const sorted = [...values].sort((a, b) => a - b);
  return { choices: strings(sorted.map(value => format(value))), correctIndex: sorted.indexOf(correct) };
}

const transformChoices = [
  'A(i, j) → B(7−i, 7−j)', 'A(i, j) → B(7−j, i)',
  'A(i, j) → B(i, 7−j)', 'A(i, j) → B(j, 7−i)',
];

const rateCases = [50, 20, 10, 100] as const;
const cacheCases = [
  ['減少', '低下', '減少', '低下'],
  ['増加', '上昇', '減少', '低下'],
  ['減少', '上昇', '増加', '低下'],
  ['減少', '上昇', '減少', '上昇'],
] as const;
const fileCases = [
  [500, 8, 2000, 9000], [500, 8, 2500, 5500],
  [400, 8, 1400, 4300], [500, 6, 1200, 6600], [400, 6, 1600, 5300],
] as const;

const tupleCases = [
  [['*', 'B', 'C'], ['/', 'T1', 'D'], ['+', 'A', 'T2']],
  [['+', 'B', 'C'], ['*', 'T1', 'D'], ['−', 'A', 'T2']],
  [['−', 'B', 'C'], ['/', 'T1', 'D'], ['*', 'A', 'T2']],
  [['/', 'B', 'C'], ['+', 'T1', 'D'], ['−', 'A', 'T2']],
] as const;
const tupleChoices = [
  ['A+B*C/D', 'A+B*C/T2', 'B*C+A/D', 'B*C+T1/D'],
  ['A−(B+C)*T2', 'A−(B+C)*D', 'A−B+C*D', '(B+C)*D−A'],
  ['(B−C)*A/T2', 'A*((B−C)/D)', '(A*B−C)/D', '(B−C)*T1/D'],
  ['A−B/C+D', 'A−(B/C+D)', 'B/(C+D)−A', 'A−(B/T2+D)'],
] as const;
const logicChoices = ['(A+B)・(C+D)', 'A+B+C+D', 'A・B+C・D', 'A・B・C・D'];

const numericalDefinitions: GenerationDefinition[] = [
  reuse(1, legacy2019QuantitativeDefinitions, '2019h31h-fe-am-1',
    '2015年p.4と2019年春午前問1の本文・7÷32・全4択・順序を原画像で照合。元の4択はそのまま、他の入力では4択を同じ桁数へ揃える。整数の分数に戻して全入力を検算。',
    (body, [n, power]) => {
      const explanation = body.explanation + ' 最初の二つは末尾のビットの重みを足しても元の分数より小さく、最後の候補は元の分数の2倍になる。';
      if (n === 7 && power === 5) return { ...body, explanation };
      const alternatives = body.choices.map(([block]) => {
        if (block.type !== 'paragraph') throw new Error('2015_BINARY_CHOICES');
        return block.text;
      });
      const width = Math.max(...alternatives.map(value => value.length));
      const padded = alternatives.map(value => value.padEnd(width, '0'));
      return {
        ...body, choices: strings(padded),
        explanation: explanation + ` 末尾の0で桁を揃えると正答は${padded[body.correctIndex!]}になる。`,
      };
    }),
  reuse(2, legacy2018TechnicalTraceDefinitions, '2018h30h-fe-am-2',
    '2015年p.4と2018年春午前問2の図・原値・4択を照合。2015年側は数値の昇順を保つため、各誤答モデルの数値を並べて正答を追従する。',
    body => {
      const values = body.choices.map(choice => {
        const block = choice[0];
        if (block.type !== 'paragraph') throw new Error('2015_GRID_CHOICES');
        return Number(block.text);
      });
      return { ...body, ...ordered(values, values[body.correctIndex!]) };
    }),
  indexed(3, '反復の固定点', 'エ', '前回出力から次の引数への補正', 5,
    '実数型、5手順、表示値の変化がなくなること、4関係式を維持。④の補正を0、+1、−1、+2、−2と変える。誤答は初回引数での値、出力が0、出力が初回引数。収束と厳密な不変を区別する。',
    index => {
      const offset = ['', '＋1', '−1', '＋2', '−2'][index];
      const input = `y${offset}`;
      return {
        prompt: [
          p('関数f(x)は、引数も戻り値も実数型である。この関数を使った、①〜⑤から成る手続を考える。手続の実行を開始してから②〜⑤を十分に繰り返した後に、③で表示されるyの値に変化がなくなった。このとき成立する関係式はどれか。'),
          code(`① x←a\n② y←f(x)\n③ yの値を表示する。\n④ x←${input}\n⑤ ②に戻る。`, 'text'),
        ],
        choices: strings(['f(a)=y', `f(${input})=0`, `f(${input})=a`, `f(${input})=y`]),
        correctIndex: 3,
        explanation: `表示値yが変化しない段階では、④でxに${input}を入れた次の反復でも、②の戻り値はyになる。したがってf(${input})=yが成立する。初回の引数aで同じ値になることも、yが0やaになることも必要ない。`,
      };
    }),
  reuse(6, decemberANumericalDefinitions, 'sample-2022-dec-a-6',
    '2015年p.6のループ端・星印の位置・全択を原画像で照合。代入の向きは2015年のA→B表記を保持し、図題を原資料にそろえる。4変換×3模様で図の全64マスを照合。',
    (body, values) => ({
      ...body,
      prompt: [
        p('配列Aが図2の状態のとき、図1の流れ図を実行すると、配列Bが図3の状態になった。図1のaに入れるべき操作はどれか。ここで、配列A、Bの要素をそれぞれA(i, j)、B(i, j)とする。'),
        figure(profiles.array, values, '図1 流れ図、図2 配列Aの状態、図3 実行後の配列Bの状態', arrayAlt(values)),
        p('（注）ループ端の繰返し指定は、変数名：初期値，増分，終値を示す。'),
      ],
      choices: strings(transformChoices),
    })),
  reuse(8, decemberANumericalDefinitions, 'sample-2022-dec-a-8',
    '2015年p.7と2022年12月科目A問8の自然数・再帰式・基準f(5)・昇順の全4択を照合。'),
  indexed(9, 'MIPSから平均命令実行時間', 'ア', '毎秒の百万命令数', rateCases.length,
    'MIPSから平均時間を求める方向とns・µs各2択を維持。逆数と位取り誤りで原4択を再現し、単位換算後に昇順。正答の表示に丸めを入れない。',
    index => {
      const rate = rateCases[index], time = 1000 / rate;
      // The two families model a rate treated as a time and a two-place unit shift.
      const wrong = rate;
      const options = ordered([time, wrong, time * 100, wrong * 100], time,
        n => n < 1000 ? `${n}ナノ秒` : `${n / 1000}マイクロ秒`);
      return {
        prompt: [p(`${rate}MIPSのプロセッサの平均命令実行時間は幾らか。`)],
        ...options,
        explanation: `${rate}MIPSは毎秒${rate}百万命令。1秒は10億ナノ秒なので、1命令当たり1000÷${rate}=${time}ナノ秒となる。MIPSの数値を時間として使うと、毎秒の命令数と1命令当たりの時間を混同する。残りの二つは単位を換算するとそれぞれ100倍の時間である。`,
      };
    }),
  indexed(10, '平均メモリアクセス時間の変化', 'イ', 'メモリアクセスの評価場面', cacheCases.length,
    '増加原因を選ぶ4文を維持し、ヒット率・ミス率・ヒット時時間・追加ミスペナルティの変化を区別。原問に条件の追記はせず、可変版では一候補ずつ比較し正のペナルティ・ヒット率を明示する。',
    index => {
      const [hitTime, hitRate, penalty, missRate] = cacheCases[index];
      const stem = [
        'キャッシュメモリをもつメモリシステムにおいて、平均メモリアクセス時間が増加する原因となるものはどれか。',
        '命令キャッシュの方式変更を検討している。命令を読み出す平均メモリアクセス時間が増加する原因となるものはどれか。',
        'データキャッシュの下位にある主記憶の構成を見直す。データを読み出す平均メモリアクセス時間が増加する原因となるものはどれか。',
        '参照の局所性が異なるプログラムをキャッシュ付きメモリで実行する。平均メモリアクセス時間が増加する原因となるものはどれか。',
      ][index];
      const choices = [`キャッシュメモリへのアクセス時間の${hitTime}`, `ヒット率の${hitRate}`, `ミスペナルティの${penalty}`, `ミス率の${missRate}`];
      const correctIndex = [1, 0, 2, 3][index];
      const premise = 'ここで、ヒット率とミス率はともに0より大きい。ミスペナルティはキャッシュにない場合の正の追加時間であり、各選択肢では示された変化だけが生じるとする。';
      return {
        prompt: [p(index ? stem + premise : stem)],
        choices: strings(choices), correctIndex,
        explanation: `平均時間はキャッシュのアクセス時間＋ミス率×ミスペナルティで表せる。ミス率は1−ヒット率。候補の変化を一つずつ入れると、増加につながるのは「${choices[correctIndex]}」であり、残りの三候補では平均時間が減少する。`,
      };
    }),
  indexed(12, 'ファイルの割当てセクタ数', 'エ', 'セクタ・ブロックと二つのファイル容量', fileCases.length,
    '元の2ファイル・ブロック割当て・管理情報除外を保持。全択は両方をセクタ単位、片方ずつブロック単位、両方をブロック単位で丸めた結果。ブロック丸め差が同じになる条件を除く。昇順。',
    index => {
      const [sectorSize, sectors, first, second] = fileCases[index];
      const firstSectors = Math.ceil(first / sectorSize), secondSectors = Math.ceil(second / sectorSize);
      const firstBlocks = Math.ceil(firstSectors / sectors), secondBlocks = Math.ceil(secondSectors / sectors);
      const options = ordered([
        firstSectors + secondSectors, firstBlocks * sectors + secondSectors,
        firstSectors + secondBlocks * sectors, (firstBlocks + secondBlocks) * sectors,
      ], (firstBlocks + secondBlocks) * sectors);
      return {
        prompt: [p(`${sectorSize}バイトのセクタ${sectors}個を1ブロックとして、ブロック単位でファイルの領域を割り当てて管理しているシステムがある。${first.toLocaleString('en-US')}バイト及び${second.toLocaleString('en-US')}バイトのファイルを保存するとき、これら二つのファイルに割り当てられるセクタ数の合計は幾らか。ここで、ディレクトリなどの管理情報が占めるセクタは考慮しないものとする。`)],
        ...options,
        explanation: `1ブロックは${sectorSize * sectors}バイト。各ファイルは別々に丸めて${firstBlocks}ブロックと${secondBlocks}ブロックを必要とする。1ブロックは${sectors}セクタなので、合計${(firstBlocks + secondBlocks) * sectors}セクタとなる。どちらか又は両方をセクタ単位だけで切り上げると、割当てを過小評価する。`,
      };
    }),
  reuse(15, legacy2019QuantitativeDefinitions, '2019r01a-fe-am-16',
    '2015年p.9と2019年秋午前問16の原条件・数値・昇順4択を照合。原文には独立故障の明記がなく、生成側だけで同前提を解答前に明示する改変。'),
  indexed(18, 'セグメントの動的再配置時間', 'エ', 'メモリマップの区画容量', memoryCases.length,
    '2017年秋午前問19と原問一致。500/100/800/800kバイトを基準として区画サイズを変え、元の図と単位・注記を保つ。セグメント3の移動が必要で、その移動だけで連続空きが得られる。片道、セグメント1又は2の移動との誤りを維持。小数第1位に正確で昇順。',
    index => {
      const [first, freed, moving] = memoryCases[index];
      // 1 kB × 30 ns / 4 B = 7.5 µs. Work in tenths of a millisecond.
      const cost = (kb: number, accesses: number) => kb * accesses * 75 / 1000;
      const answer = cost(moving, 2);
      return {
        prompt: [
          p('図のメモリマップで、セグメント2が解放されたとき、セグメントを移動（動的再配置）し、分散する空き領域を集めて一つの連続領域にしたい。1回のメモリアクセスは4バイト単位で行い、読取り、書込みがそれぞれ30ナノ秒とすると、動的再配置をするのに必要なメモリアクセス時間は合計何ミリ秒か。ここで、1kバイトは1,000バイトとし、動的再配置に要する時間以外のオーバヘッドは考慮しないものとする。'),
          figure(profiles.memory, [index], 'メモリマップ', memoryAlt([index])),
        ],
        ...ordered([cost(freed, 2), cost(moving, 1), cost(first, 2), answer], answer, value => (value / 10).toFixed(1)),
        explanation: `セグメント2の空きの直後にあるセグメント3を左へ詰めると、後方の空きとつながる。移動するのはセグメント3の${moving}kバイト全体。4バイトの組${moving * 250}個をそれぞれ1回読み取り1回書き込むので、${moving * 250}×(30＋30)ナノ秒＝${(answer / 10).toFixed(1)}ミリ秒となる。解放したセグメント2の大きさは移動量ではない。`,
      };
    }),
  indexed(19, '四つ組から式を復元', 'ア', '四つ組の演算と依存関係', tupleCases.length,
    '3命令、被演算子の順序、一時変数3個、四つ組→式の4択を保持。演算の構成を変え、未展開の一時変数、優先順位、交換できない演算の順序を誤答として区別する。',
    index => {
      const operations = tupleCases[index].map(([op, left, right], i) => `(${op}, ${left}, ${right}, T${i + 1})`);
      const choices = [...tupleChoices[index]];
      const correctIndex = [0, 1, 1, 1][index];
      return {
        prompt: [
          p('コンパイラで構文解析した結果の表現方法の一つに四つ組形式がある。'),
          code('（演算子, 被演算子1, 被演算子2, 結果）', 'text'),
          p('この形式は、被演算子1と被演算子2に演算子を作用させたものが結果であることを表す。次の一連の四つ組は、どの式を構文解析したものか。ここで、T1、T2、T3は一時変数を表す。'),
          code(operations.join('\n'), 'text'),
        ],
        choices: strings(choices), correctIndex,
        explanation: `第1行からT1=(${tupleCases[index][0][1]}${tupleCases[index][0][0]}${tupleCases[index][0][2]})を得る。第2行でT1を代入してT2を求め、第3行でその式を代入すると ${choices[correctIndex]} になる。減算・除算では左右の被演算子を入れ替えず、必要な括弧を残す。`,
      };
    }),
  reuse(21, decemberAKnowledgeDefinitions, 'sample-2022-dec-a-19',
    '2015年p.11と2022年12月科目A問19のDRAMの問い・全4択と順序を原画像で照合。基準では2015年の助動詞・表記を保持する。各半導体メモリの記憶・消去・刷新の固有条件を独立査読。',
    (body, [index]) => index ? body : ({
      ...body,
      choices: strings([
        '書込み及び消去を一括又はブロック単位で行う。',
        'データを保持するためのリフレッシュ操作又はアクセス操作が不要である。',
        '電源が遮断された状態でも、記憶した情報を保持することができる。',
        'メモリセル構造が単純なので高集積化することができ、ビット単価を安くできる。',
      ]),
      explanation: 'DRAMはコンデンサの電荷を使う単純なセルで高密度に集積しやすく、ビット単価を下げやすい。電荷は時間とともに失われるのでリフレッシュが必要で、電源を切れば保持できない。ブロック消去はフラッシュメモリの特徴であり、通電中のリフレッシュ不要はSRAMの特徴である。',
    })),
  indexed(23, 'NAND組合せ回路の論理式', 'ウ', '三つの論理ゲートの組合せ', 4,
    '4入力・3ゲート・1出力の図から論理式を選ぶ方向、元のゲート記号、接続と式4択を保持。基準は全NAND。可変版は同じ接続の一部のゲートを実際に変え、NANDを含む組合せとして出題。第4条件の否定記号は本文で定義する。',
    index => {
      const choices = index === 3 ? ['¬(A+B)・(C+D)', 'A+B+C+¬(D)', '¬(A・B)+C・D', 'A・B+¬(C・D)'] : [...logicChoices];
      const correctIndex = [2, 1, 3, 3][index];
      return {
        prompt: [
          p(`図の${index ? 'NANDゲートを含む組合せ回路' : 'NANDゲートの組合せ回路'}で、入力A、B、C、Dに対する出力Xの論理式はどれか。ここで、論理式中の「・」は論理積、「+」は論理和を表す。${index === 3 ? '「¬」は直後の括弧で囲んだ式の否定を表す。' : ''}`),
          figure(profiles.logic, [index], 'ゲートの組合せ回路', logicAlt([index])),
        ],
        choices: strings(choices), correctIndex,
        explanation: [
          '左側でA・BとC・Dをそれぞれ否定する。その2値の論理積を右側でさらに否定するため、ド・モルガンの法則でX=A・B＋C・Dとなる。',
          '左の2個のNORの出力は、A＋BとC＋Dをそれぞれ否定した値。右のNANDでそれらの積を否定すると、X=A＋B＋C＋Dとなる。',
          '左の2個のNANDの出力は、A・BとC・Dをそれぞれ否定した値。右のNORでそれらの和を否定すると、X=A・B・C・Dとなる。',
          '左の上側のNANDはA・Bの否定を出力し、下側のANDはC・Dを出力する。右のNANDがその積を否定するので、X=A・B＋¬(C・D)となる。',
        ][index],
      };
    }),
];

const numberOf = (definition: GenerationDefinition) => Number(definition.source.split('-').at(-1));
export const legacy2015AutumnAm0126Definitions: GenerationDefinition[] =
  [...numericalDefinitions, ...knowledgeDefinitions].sort((a, b) => numberOf(a) - numberOf(b));
