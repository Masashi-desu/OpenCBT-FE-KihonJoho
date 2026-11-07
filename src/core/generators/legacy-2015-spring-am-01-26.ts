import { field, p, strings, table, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { decemberANumericalDefinitions } from './sample-2022-dec-a-numerical';
import {
  spring2015Am0126Diagram as diagram, spring2015Am0126Profiles as profiles, spring2015AmAddressCases,
} from './legacy-2015-spring-am-01-26-figures';
import { spring2015Am0126Source as source } from './legacy-2015-spring-am-01-26-source';

const marks = 'アイウエ';
type BodyBuilder = (index: number) => GeneratedBody;

function define(number: number, label: string, count: number, build: BodyBuilder, notes: string, fixed = false): GenerationDefinition {
  const original = source[number];
  return {
    source: '2015h27h-fe-am-' + number,
    title: original.title, sourceAnswer: original.key, version: '3.2.0', fields: [field(label, 0, count - 1)], reference: [0],
    ...(fixed ? { answerVariation: 'fixed' as const } : {}),
    notes: variableNotes + ' ' + notes,
    build(values) {
      if (!Array.isArray(values) || values.length !== 1 || Reflect.ownKeys(values).length !== 2)
        throw Error('PARAMETER_CONSTRAINT');
      const input = Object.getOwnPropertyDescriptor(values, '0');
      if (!input || !('value' in input) || !Number.isSafeInteger(input.value) || input.value < 0 || input.value >= count)
        throw Error('PARAMETER_CONSTRAINT');
      return build(input.value);
    },
  };
}

function text(number: number, prompt: string, correctIndex: number, explanation: string, choices = source[number].choices): GeneratedBody {
  return { prompt: [p(prompt)], choices: strings(choices), correctIndex, explanation };
}

function chooseDescription(number: number, label: string, concepts: readonly string[], originalIndex: number,
  makePrompt: (term: string) => string, explanations: readonly string[]) {
  const sequence = [originalIndex, ...concepts.map((_, i) => i).filter(i => i !== originalIndex)];
  return define(number, label, sequence.length, index => {
    const correct = sequence[index];
    return text(number, index === 0 ? source[number].prompt : makePrompt(concepts[correct]), correct, explanations[correct]);
  }, '原の説明を選ぶ形式と四つの説明の役割を保ち、本文が問う概念を変える。原の全択を照合し、説明の指す概念を独立に確認する。');
}

const bitSteps = [
  'AとBの排他的論理和（XOR）を求め，結果をCとする。',
  'Bの各ビットを反転し，Aと同じ長さのビット列Cを求める。',
  'AとBの論理積（AND）を求め，結果をCとする。',
  'AとBの否定論理積（NAND）を同じビット幅で求め，結果をCとする。',
];
const bitReasons = [
  'Aから1を引くと右端の1が0に変わり、その右側の0が1になる。XORを取ったCの1とAの1が重なる位置は右端の1だけなので、論理積を使う。',
  'Bを反転したCとAの論理積を取る。右端の1より左ではAとBが同じ、右ではAが全て0なので、右端の1だけ残る。',
  'C＝A AND Bは、Aのうち右端の1だけを消した値になる。AとCで相違するその1を選ぶために排他的論理和を使う。',
  'C＝NOT(A AND B)は、AとBの共通する左側の1を0にする。A AND Cは左側を落とし、元の右端の1を保つ。',
];

const decimals = [
  { min: -9, max: 9, shift: 5 }, { min: -8, max: 9, shift: 5 },
  { min: -9, max: 8, shift: 3 }, { min: -8, max: 8, shift: 6 },
  { min: -9, max: 9, shift: 7 }, { min: -9, max: 7, shift: 4 },
] as const;
const decimal = (t: number) => (t / 10).toFixed(1).replace('-', '−');
function floorQuestion(index: number): GeneratedBody {
  const c = decimals[index], n = c.max - c.min + 1;
  const negative = Math.max(0, -c.shift - c.min), positive = Math.max(0, c.max - (10 - c.shift) + 1);
  const sum = positive - negative;
  const exact = sum < 0 ? '−' + Math.abs(sum) + '/' + n : sum + '/' + n;
  const other = n + 1;
  const order = (choice: string) => {
    const [numerator, denominator = '1'] = choice.split('/');
    return [Number(numerator.replace('−', '-')), Number(denominator)];
  };
  const choices = index === 0 ? source[3].choices : ['−' + Math.abs(sum) + '/' + other, '0',
    Math.abs(sum) + '/' + other, exact].sort((a,b) => {
      const [left, leftDivisor] = order(a), [right, rightDivisor] = order(b);
      return left * rightDivisor - right * leftDivisor;
    });
  const values = Array.from({ length: n }, (_, i) => c.min + i);
  const split = source[3].prompt.indexOf('。') + 1;
  const prompt = index === 0 ? source[3].prompt.slice(split) :
    values.slice(0, 2).map(decimal).join('，') + '，…，−0.1，0.0，0.1，…，' + values.slice(-2).map(decimal).join('，') +
    'の小数点以下1桁の小数からxを等確率で選ぶとき，f(x＋' + decimal(c.shift) + ')の期待値（平均値）は幾らか。';
  return {
    prompt: [p(source[3].prompt.slice(0, split)), p('f(1.0)＝1'), p('f(0.9)＝0'), p('f(−0.4)＝−1'), p(prompt)],
    choices: choices.map(choice => {
      const [numerator, denominator] = choice.split('/');
      if (denominator === undefined) return [{ type: 'formula', format: 'latex', text: numerator, alt: numerator }];
      return [{
        type: 'formula', format: 'latex',
        text: (numerator.startsWith('−') ? '-' : '') + '\\frac{' + numerator.replace('−', '') + '}{' + denominator + '}',
        alt: (numerator.startsWith('−') ? 'マイナス' : '') + denominator + '分の' + numerator.replace('−', ''),
      }];
    }),
    correctIndex: choices.indexOf(exact),
    explanation: '−1となる値は' + negative + '個、1となる値は' + positive + '個、残りは0。和は' + sum +
      'で、入力は' + n + '個を等確率で選ぶので期待値は' + exact + '。負の値も0方向へ丸めず、入力の端点を含める。',
  };
}

const ecc = decemberANumericalDefinitions.find(d => d.source === 'sample-2022-dec-a-11')!;
const degraded = decemberANumericalDefinitions.find(d => d.source === 'sample-2022-dec-a-13')!;
const eccIndices = [7, 4, 5, 6, 8, 9];
const degradedInputs = [[20,7],[16,7],[22,7],[18,6],[21,6],[24,5]];
const degradedRules = [
  '〔運用条件〕',
  '(1) 物理マシンが停止すると，そこで稼働していた仮想マシンは他の全ての物理マシンで均等に稼働させ，使用していた資源も同様に配分する。',
  '(2) 物理マシンが20台のときに使用する資源は，全ての物理マシンにおいて70％である。',
  '(3) 1台の物理マシンで使用している資源が90％を超えた場合，システム全体が縮退運転となる。',
  '(4) (1)〜(3)以外の条件は考慮しなくてよい。',
];
const rotations = [[4200,5],[6000,4],[7500,6],[3000,7],[10000,5],[3600,6]] as const;
const queueingConditions = [
  '',
  '到着したトランザクションは，対象のCPUが処理中であれば別のCPUへの転送を開始し，転送後は待たずに処理を開始する。転送に掛かる時間は平均処理時間と同じ一定値で，どちらのCPUの平均処理時間も等しい。到着時に対象のCPUが処理中である確率は，そのCPUの使用率に等しいものとする。',
  'CPUが処理中に到着したトランザクションは受け付けない。待ち行列はなく，受け付けたトランザクションだけの平均応答時間を考える。',
];
const responseReasons = [
  '待ち行列の利用率ρが1未満のとき、平均処理時間をSとすると平均応答時間はS/(1−ρ)。ρが1に近づくと待ち時間が急増する。直線、増え方が緩やかになる曲線、一定値ではない。',
  '平均処理時間をSとすると、通常の処理はS、転送を要する場合は待ちSと処理Sで2S。確率を使用率ρとすると平均は(1−ρ)S＋2ρS＝S(1＋ρ)。正の傾きの直線。',
  '受け付けたものは到着後すぐ処理を始めるため、平均応答時間は平均処理時間そのもの。CPU使用率に依存しない。',
];
const availabilityRates = [[70,80,90,99],[80,80,90,99],[70,78,93,99],[65,75,87,99]];
const parallelSystems = [4,3,2,1];
const parallelWords = ['四つ', '三つ', '二つ'];
const safetyCases = [
  { stem: source[16].prompt, choices: source[16].choices, index:3, reason:'予防保守は故障を未然に防ぎ、MTBFを長くするために行う。遠隔保守でMTTRは短くする方向。MTBF/(MTBF＋MTTR)はMTTRを増やすと低下し、システムが複雑なだけではMTBFの長さは決まらない。' },
  { stem:'システムに故障が起きたときの復旧と稼働率に関する記述のうち，適切なものはどれか。', choices:[
    '平均故障間隔を変えず，遠隔保守で平均修復時間を短縮すると，稼働率は向上する。','稼働率は故障間隔によらず平均修復時間だけで決まる。',
    '平均修復時間を延長すると，稼働率が高くなる。','予防保守は故障発生後の修理作業だけを指す。',
  ], index:0, reason:'MTBFを固定してMTTRを下げれば、稼働率MTBF/(MTBF＋MTTR)は上がる。故障間隔も分子・分母に入る。予防保守は故障前に行う。' },
  { stem:'コンピュータシステムの平均故障間隔と平均修復時間を比較する。稼働率について適切なものはどれか。', choices:[
    '平均修復時間が一定なら，平均故障間隔が短い方の稼働率が高い。','平均故障間隔が平均修復時間と同じとき，稼働率は50％になる。',
    '平均故障間隔と平均修復時間の和が同じなら，稼働率も同じである。','二つの平均時間を同じ倍率で伸ばせば，稼働率も同じ倍率になる。',
  ], index:1, reason:'MTBF/(MTBF＋MTTR)で両者が等しければ1/2。同じ和でも分子が変われば稼働率は変わり、分子・分母を同じ倍率で変えても比は同じ。' },
];

const pagingAccesses = [
  [1,2,3,4,5,2,1,3,2,6], [1,2,3,4,5,2,5,3,2,6],
  [3,1,2,4,5,2,5,4,2,6], [3,2,1,4,5,4,1,5,1,6],
  [1,2,4,3,5,3,5,4,3,6],
];
function lru(accesses: readonly number[]) {
  const resident: number[] = [];
  let evicted: number | undefined;
  for (const page of accesses) {
    evicted = undefined;
    const existing = resident.indexOf(page);
    if (existing >= 0) resident.splice(existing, 1);
    else if (resident.length === 4) evicted = resident.shift();
    resident.push(page);
  }
  return evicted;
}

const printerJobs = [[5,12,4,3,10,4],[2,3,4,5,10,2],[2,3,4,3,10,5],[4,10,5,8,12,4]];
function printTotals(jobs: readonly number[]) {
  const finishAt = [0,0,0], totals = [0,0,0], assignments: string[] = [];
  let cursor = 0;
  for (const duration of jobs) {
    const time = Math.min(...finishAt);
    const next = [0,1,2].map(offset => (cursor + offset) % 3).find(printer => finishAt[printer] === time)!;
    finishAt[next] = time + duration;
    totals[next] += duration;
    assignments.push('ABC'[next] + duration + '分');
    cursor = (next + 1) % 3;
  }
  return { totals, assignments };
}

export const legacy2015SpringAm0126Definitions: GenerationDefinition[] = [
  define(1, '手順2のビット演算', 4, index => {
    const b = text(1,source[1].prompt,index===2?0:2,bitReasons[index]);
    b.prompt.push(p('手順1 与えられたビット列Aを符号なしの2進数と見なし，Aから1を引き，結果をBとする。'),
      p('手順2 '+bitSteps[index]),p('手順3 AとCの［a］を求め，結果をAとする。'));
    return b;
  }, '原の非零・符号なし・3手順と4演算択を保持。例の値を変えるだけでなく、中間結果Cを作る実演算を変える。各条件の全非零入力を幅別に検算。'),
  chooseDescription(2,'浮動小数点演算の誤差・例外',['桁落ち','オーバフロー','丸め誤差','情報落ち'],0,
    term=>term+'の説明として，適切なものはどれか。',[
      'ほぼ等しい値を引くと先頭の有効桁が相殺される。これが桁落ち。表現可能範囲、丸めの実施、大小の加算で小さい方が消える現象とは区別する。',
      '計算結果が表現できる最大値を超えたエラーがオーバフロー。誤差が出るだけの丸め・桁落ち・情報落ちとは異なる。',
      '表現できる最小の桁より細かな値を丸めるために生じる誤差が丸め誤差。値域を超える現象や演算前後の有効桁の消失とは区別する。',
      '大きさが大きく違う値を足すと、小さい値の下位桁が結果へ反映されないことがある。これは情報落ちで、近い値の減算で生じる桁落ちではない。',
    ]),
  define(3,'有限列の端点と平行移動',decimals.length,floorQuestion,'小数1桁の等確率の有限列と床関数を保持。端点・加算値を変更し、丸めず分数の分母と分子を検算する。'),
  define(4,'条件付き確率の入力軸',2,index=>{
    const b=text(4,source[4].prompt,index===0?1:2,index===0
      ?'入力が行にあるため、入力0のa＋bと入力1のc＋dがそれぞれ1。列や対角線には異なる入力の条件が混ざる。'
      :'入力が列にあるため、入力0のa＋cと入力1のb＋dがそれぞれ1。行や対角線には異なる入力の条件が混ざる。');
    b.prompt.push(table('遷移確率',[index===0?'入力＼出力':'出力＼入力','0','1'],[['0','a','b'],['1','c','d']]));
    return b;
  },'原の表の斜め見出し、4文字と四関係式の原順を保持。列と行の意味だけを変え、同一入力で和1となる組が変わる。'),
  chooseDescription(5,'データ構造',['スタック','キュー','配列','子へのポインタをもつ木構造'],1,
    term=>term+'に関する記述として，最も適切なものはどれか。',[
      'スタックは最後に入れた要素から取り出すLIFO。最初に入れた要素から取り出すFIFOはキュー。',
      'キューは最初に入れた要素から取り出すFIFO。最後に入れた要素からのLIFO、添字参照、階層表現とは区別する。',
      '配列は添字で要素を指定できる。取出し順を規定するスタックやキュー、親子関係を表す木とは異なる。',
      '子へのポインタを用いる木では、要素間の階層関係を表現する。追加・取出しの順序や配列の添字は別の性質。',
    ]),
  define(6,'整列済みデータの探索手順',2,index=>text(6,index===0?source[6].prompt:
    '整列されたn個のデータの中から，求める要素を先頭から1個ずつ順に比較して探索する。最悪時のこの処理の計算量のオーダを表す式はどれか。',
    index===0?0:1,index===0?'2分探索では一度比較するたびに候補範囲がほぼ半分になるので、必要な比較回数のオーダはlog n。整列の処理は含めない。':
    '末尾だけにある場合などはn個を順に比較するので、最悪時の比較回数のオーダはn。候補範囲を半分にはしない。'),
  '原の整列済み入力・探索と4オーダ式を維持し、探索アルゴリズムを変える。'),
  chooseDescription(7,'プログラムの特性',['再配置可能プログラム','再帰的な手続','オーバレイ方式','再入可能プログラム'],3,
    term=>term+'の特徴はどれか。',[
      '再配置可能ならロード先のアドレスに合わせて参照先が調整され、置かれた位置で実行できる。',
      '再帰的な手続はその定義中で自分自身を呼び出す。異なるタスクからの同時呼出しに安全かどうかとは別である。',
      'オーバレイでは主記憶の同じ領域を必要なプログラム部分に使い回し、補助記憶から必要に応じてロードする。',
      '再入可能なコードは複数の呼出しが重なっても各呼出しの作業状態を混同せず、正しい結果を返す。',
    ]),
  define(8,'利用場面に対応するJava関連技術',4,index=>text(8,[
    source[8].prompt,
    'WebページのHTMLに組み込まれ，ブラウザ側で動作するスクリプトを記述する言語はどれか。',
    'Java仮想マシン上でmainメソッドを起点として単独で起動するJavaプログラムの形態はどれか。',
    '当時，Javaに対応するブラウザのWebページなどに組み込んで実行するJavaプログラムの形態はどれか。',
  ][index],index,[
    'JavaBeansは再利用可能なJavaコンポーネントのための仕様。JavaScriptは別の言語。アプリケーションやアプレットはプログラムの実行形態。',
    'ブラウザのスクリプトを記述するJavaScriptは、名前が似ていてもJavaとは別の言語。',
    'mainメソッドを入口として単独で起動する形態はJavaアプリケーション。JavaBeansはコンポーネント、アプレットは当時の組込実行形態。',
    '当時の対応ブラウザ等の実行環境へ組み込むものがJavaアプレット。単独起動するJavaアプリケーションやスクリプトのJavaScriptと異なる。',
  ][index]),'2015年当時の用語と四択を保持。現在のブラウザがJavaアプレットを実行するとの主張はしない。'),
  define(9,'命令アドレス部からの参照経路',spring2015AmAddressCases.length,index=>{
    const b = text(9,source[9].prompt,index,[
      'アドレス部の20をアドレスとする記憶内容が25で、その25を次のアドレスとしてデータを読み出すため間接アドレス指定。',
      'アドレス部の値と指標レジスタの値を加えた結果を実効アドレスにするため指標アドレス指定。',
      'プログラムカウンタの値にアドレス部の値を加えた位置を実効アドレスにするため相対アドレス指定。',
      '命令のアドレス部の値がそのままデータのアドレスとなるため直接アドレス指定。',
    ][index]);
    b.prompt.push(diagram(profiles.memory, [index], '主記憶の参照'));
    return b;
  },'2016年秋午前問9の原図・択と一致。値と描画を再利用し、2015年の図profileで登録する。4方式の読出し回数・レジスタと加算の違いを検算。'),
  define(10,'データバス幅の2の指数',eccIndices.length,index=>{
    const b=ecc.build([eccIndices[index]]);
    return index===0?{...b,prompt:[p(source[10].prompt)]}:b;
  },'2022年12月科目A問11と一致。原128ビットと昇順4択を照合し、当該冊子の出典に分離。'),
  define(11,'複数ディスクに格納するビットの配置',2,index=>{
    const b=text(11,index===0?source[11].prompt:
      '図に示すように，データを複数台の磁気ディスクに格納することを何と呼ぶか。ここで，b₀〜b₃は各データディスクに格納されるビットを表し，同じ添字は同じデータを示す。',
    index===0?0:3,index===0?
      '連続したビットを4台の異なるディスクへ交互に分散するのでストライピング。キャッシュは一時保持、ブロック化は単位のまとめ、ミラーリングは同じ内容の複製。':
      '全てのディスクへ同じビット列を複製するのでミラーリング。異なるビットを分散するストライピングではない。');
    b.prompt.push(diagram(profiles.disks,[index],'制御装置とデータディスク'));
    return b;
  },'制御装置・4台・4行の原図を保持。異なるデータの分散と同一内容の複製を図で切り替える。'),
  define(12,'回転数と平均位置決め時間',rotations.length,index=>{
    const [rpm,seek]=rotations[index], half=30000/rpm, expected=Math.round(seek+half);
    const choices=index===0?source[12].choices:[Math.round(half), Math.round(half*2),expected,Math.round(seek+half*2)]
      .sort((a,b)=>a-b).map(String);
    if (new Set(choices).size!==4 || !choices.includes(String(expected))) throw Error('PARAMETER_CONSTRAINT');
    const prompt=source[12].prompt.replace('4,200',rpm.toLocaleString('en-US')).replace('5ミリ秒',seek+'ミリ秒');
    return text(12,prompt,choices.indexOf(String(expected)),
      '1回転は60,000÷'+rpm+'ミリ秒。平均回転待ちは半回転で30,000÷'+rpm+'ミリ秒。位置決めの'+seek+
      'ミリ秒を加えた値に最も近いのは'+expected+'ミリ秒。転送時間は含めない。',choices);
  },'平均待ちを位置決め＋半回転のままにして、毎分回転数と位置決め時間を変える。全回転だけ／位置決めの加え忘れ／全回転加算を混同する択を分ける。'),
  define(13,'物理マシンの台数と通常使用率',degradedInputs.length,index=>{
    const [machines, utilization] = degradedInputs[index];
    const b = degraded.build([machines, utilization]);
    const stem = source[13].prompt.replace('20台', machines + '台');
    const rules = degradedRules.map(rule => rule.replace('20台', machines + '台').replace('70％', utilization * 10 + '％'));
    return { ...b, prompt: [p(stem), ...rules.map(p)] };
  },'2022年12月科目A問13と運用条件・原値・四択一致。閾値の厳密な超過条件は維持。'),
  define(14,'トランザクションの待ち方',queueingConditions.length,index=>({
    prompt:[p([source[14].prompt, queueingConditions[index]].filter(Boolean).join('\n'))],
    choices:marks.split('').map((_,j)=>[diagram(profiles.curves,[j],'CPU使用率と平均応答時間')]),
    correctIndex:[0,1,3][index],explanation:responseReasons[index],
  }),'4曲線と0〜1のCPU使用率の尺度、ポアソン到着・指数処理を保持。通常待ち行列、一定遅延で別CPU、待ちなしの受入処理という差で曲線が変わる。'),
  define(15,'並列構成の稼働条件',availabilityRates.length,index=>{
    const rates=availabilityRates[index];
    const rules=[
      source[15].prompt,
      '稼働率が最も高いシステム構成はどれか。ここで，並列に接続したシステムは，全ての構成機が稼働していればよいものとする。各構成機の故障は互いに独立とする。',
      '稼働率が最も高いシステム構成はどれか。ここで，並列に接続したシステムは，少なくとも2台が稼働していればよいものとする。各構成機の故障は互いに独立とする。',
      source[15].prompt+' 並列の構成では、構成機とは独立した接続装置（稼働率98％）も稼働している必要がある。各装置の故障は互いに独立とする。単一システムでは接続装置を必要としない。',
    ];
    const scores=rates.map((rate,j)=>{
      const count=parallelSystems[j], down=100-rate;
      const operating=index===1 ? rate**count :
        index===2&&count>1 ? 100**count-down**count-count*rate*down**(count-1) : 100**count-down**count;
      const requiredConnection=index===3&&count>1 ? 98 : 100;
      return operating * 100**(4-count) * requiredConnection;
    });
    const max=Math.max(...scores);
    if(scores.filter(n=>n===max).length!==1)throw Error('PARAMETER_CONSTRAINT');
    const choices=rates.map((rate,j)=>'稼働率'+rate+'％の'+(j===3?'単一システム':'同一システムを'+parallelWords[j]+'並列に接続'));
    const method=[
      '全てが停止する確率を1から引く。99.19％と99.20％の差も丸めず判定する。',
      '並列構成の全てが稼働する確率は、各構成機の稼働率の積。',
      '並列構成の全停止と1台だけ稼働する確率を1から引く。単一構成は1台自身の稼働率。',
      '並列構成では、全停止の補数に独立した接続装置の稼働率98％を掛ける。単一には掛けない。',
    ][index];
    return text(15,rules[index],scores.indexOf(max),method+' 4構成の稼働率は順に'+
      scores.map(n=>(n/1e8).toFixed(6).replace(/0+$/,'').replace(/\.$/,'')+'％').join('，')+'。',choices);
  },'原4構成の台数と各選択肢の役割を保つ。並列の必要稼働台数と接続装置の条件を本文で変更。比較は100⁵の共通分母で途中丸めなし。'),
  define(16,'故障間隔・修復時間の比較場面',safetyCases.length,index=>{
    const c=safetyCases[index];return text(16,c.stem,c.index,c.reason,c.choices);
  },'信頼性の適切な記述を選ぶ四択。予防・遠隔保守や比率の条件を変えて、稼働率の同じ意味を問う。'),
  chooseDescription(17,'入出力・ジョブ管理の機能',['キーボード入力のバッファリング','ジョブスケジューリング','プロキシを利用した通信','スプーリング'],3,
    term=>term+'の説明として，適切なものはどれか。',[
      'キーボード入力のバッファリングは、入力を処理側が受け取るまで主記憶上のキューに一時保存する。',
      'ジョブスケジューリングでは優先度や処理特性からどのジョブを先に実行するか決める。',
      '代理への転送では通信データを直接相手へ送らず、事前に指定した中継先へ渡す。',
      'スプーリングでは出力を高速な補助記憶に一旦蓄え、低速なプリンタ等へ後から順に出力する。',
    ]),
  define(18,'主記憶と仮想記憶の処理・現象',4,index=>text(18,[
    source[18].prompt,
    '主記憶が限られるので，プログラムを幾つかに分割しておき，その時に必要な部分だけを同じ主記憶領域へ入れ替えながら実行する。このような処理を何というか。',
    '主記憶上の使用中の領域を移動して散在する空き領域をまとめ，連続した空き領域を得る。このような処理を何というか。',
    '実行中のプログラムを一時的に中断し，その主記憶の内容を補助記憶へ退避する。このような処理を何というか。',
  ][index],[1,0,2,3][index],[
    '多重度の増加で実メモリが不足し、ページ入替えが頻発して実処理が進まない現象はスラッシング。',
    '必要なプログラムの一部分だけを同じ領域へ順に読み込む方式がオーバレイ。',
    '占有領域を移して散在する空きをまとめる処理がメモリコンパクション。',
    '実行を一時中断したプログラムの主記憶内容を補助記憶へ出す操作がロールアウト。',
  ][index]),'2026年科目A問5の原形式と一致。別の記憶管理処理を実際に本文に記述し、当該版の4択順を固定。'),
  chooseDescription(19,'実行中のタスクの中断方式',['残りの処理時間の短いタスクを優先するプリエンプティブ方式','ラウンドロビン方式','ノンプリエンプティブなスケジューリング方式','優先度に基づくプリエンプティブなスケジューリング方式'],2,
    term=>term+'の説明として，適切なものはどれか。',[
      '新規到着のたびに残り処理時間を比較して最も短いものに切り替える方式は、到着による中断が起こる。',
      '割り当てられた時間片を使い切っても実行が終わらなければ、中断して実行待ち行列の次に切り替える。',
      'ノンプリエンプティブ方式では実行中のタスクを外部から中断して他へCPUを割り当てず、自ら待つか終了するまで実行する。',
      '高い優先度のタスクが実行可能になったときに、低い方を中断するのが優先度プリエンプション。',
    ]),
  define(20,'ページの参照順',pagingAccesses.length,index=>{
    const a=pagingAccesses[index], target=lru(a);
    const choices=source[20].choices;
    const correct=choices.indexOf(String(target));
    if(correct<0)throw Error('PARAMETER_CONSTRAINT');
    const prompt=source[20].prompt.replace('1，2，3，4，5，2，1，3，2，6',a.join('，'));
    return text(20,prompt,correct,'各参照でそのページを最も最近に使ったものとして扱う。初めは全枠空き。最後の6が未格納で枠が埋まっているため、直前までに最後の参照が最も古い'+target+'を置換する。最初に入った時刻とは区別する。',choices);
  },'4枠と空の初期状態、最終ミスで追い出すページと昇順4択を保持。実際の参照順を変える。'),
  define(21,'6件の印刷時間の並び',printerJobs.length,index=>{
    const jobs=printerJobs[index],{totals,assignments}=printTotals(jobs);
    const order=[0,1,2].sort((a,b)=>totals[b]-totals[a]).map(i=>'ABC'[i]).join('，');
    const correct=source[21].choices.indexOf(order);
    if(correct<0||new Set(totals).size!==3)throw Error('PARAMETER_CONSTRAINT');
    const prompt=source[21].prompt.replace('5，12，4，3，10，4',jobs.join('，'));
    return text(21,prompt,correct,'空いたプリンタに出力待ちの順に割り当てる。割り当ては'+assignments.join('，')+'。A・B・Cの印刷時間合計は順に'+totals.join('，')+
      '分なので、長い順は'+order+'。待機していた時間は印刷時間に加えない。');
  },'初期全空き・3台循環・6件・印刷時間合計。初回以外の同時解放と同順位を避ける。'),
  define(22,'DRAMとSRAMを比較する属性',3,index=>text(22,[
    source[22].prompt,
    'DRAMと比較した場合のSRAMの特徴のうち，メモリセルの構成に関する記述として適切なものはどれか。',
    'DRAMと比較した場合のSRAMの特徴のうち，データ保持のための動作に関する記述として適切なものはどれか。',
  ][index],[2,3,1][index],[
    'DRAMは1ビットのセル構造が単純で、ビット当たりの単価を低くしやすい。電荷が失われるためリフレッシュが必要で、フリップフロップ相当を用いるのはSRAM。',
    'SRAMのセルはフリップフロップ相当の回路で状態を保持する。キャッシュへの用途やリフレッシュ要否を尋ねる問題ではない。',
    'SRAMは給電している間、記憶状態を保持するための周期的なリフレッシュが不要。DRAMは電荷が時間とともに失われるのでリフレッシュが必要。',
  ][index]),'比較対象・比較方向・評価する属性を本文へ表示し、SRAM側の複数正答を避けるため変種はセル構成又はデータ保持に限定。'),
  define(23,'最後のゲートの反転',2,index=>({
    prompt:[p(source[23].prompt),diagram(profiles.logic,[index,0],'デジタル回路')],
    choices:marks.split('').map((_,j)=>[diagram(profiles.logic,[index,j+1],'論理式')]),
    correctIndex:index===0?2:1,
    explanation:index===0?'二つのNOTの出力のORは¬A＋¬B。これをA，BそれぞれとANDに入れてからORで結ぶと，AとBが異なるときだけ1になる。':
      '最終ゲートの小円はOR出力の否定。反転前はAとBが異なるときだけ1なので、反転後は同じときだけ1。両方が1のときのA・Bと、両方が0のときの¬A・¬Bの論理和が対応する。',
  }),'2017年秋午前問23の同型図と選択肢の描画を再利用。最後のOR出力の反転の有無を変え、全4入力を検算。原基準のイ・エは論理的に同値だが共に誤答。可変版ではエの式を修正し、真理値の重複を解消。'),
  define(24,'字体を選ぶ表示場面',2,index=>text(24,index===0?source[24].prompt:
    '拡大や縮小を行わない固定サイズの表示装置で，アウトラインフォントよりもビットマップフォントの利用が適しているケースはどれか。',
  index===0?3:2,index===0?'アウトラインフォントは輪郭を指定倍率で計算し直せるので任意倍率の拡大に適している。漢字表示や固定幅は方式の決め手にならない。':
    '同じ表示サイズで必要な画素をあらかじめ保持していれば、輪郭から画素へ変換する計算を省ける。倍率を変える用途では輪郭を再計算できるアウトラインフォントが適する。'),
  'フォント方式と利用ケースの適否を維持。表示寸法を固定したビットマップと任意倍率の輪郭の利点を区別。'),
  chooseDescription(25,'CGで行う処理',['レイトレーシング','シェーディング','クリッピング','テクスチャマッピング'],3,
    term=>term+'を説明したものはどれか。',[
      '光線を追跡して反射・屈折・透過を計算するのがレイトレーシング。',
      '光の向きや面の形状に応じて明るさや色を求め、陰影を付けるのがシェーディング。',
      '表示範囲の外へ出る部分を除外するのがクリッピング。',
      'テクスチャマッピングは物体の表面へ画像を対応させ、模様や質感を表現する。',
    ]),
  define(26,'データベース機構とその目的',3,index=>text(26,[
    source[26].prompt,
    'DBMSが，関係演算で定義したビューを提供する目的として，適切なものはどれか。',
    'DBMSが，埋込みSQLを提供する目的として，適切なものはどれか。',
  ][index],[2,0,1][index],[
    '外部・概念・内部のスキーマを分離して物理データ独立性を得る。物理的な格納構造を変えても外部のアプリケーションに影響しにくい。',
    'ビューは元の表から関係演算で導出したデータを、表のように扱えるようにする。',
    '埋込みSQLはプログラムからSQLを使うための方式。対話だけでなくアプリケーションからSQLを実行できる。',
  ][index]),'機構の目的を選ぶ原形式と四択の役割を維持。誤答のうち実在する別機構だけを問いの対象にする。'),
];
