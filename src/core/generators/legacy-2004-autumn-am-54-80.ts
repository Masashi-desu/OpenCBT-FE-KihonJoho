import { DataError } from '../errors';
import { code, field, figure, p, strings, table, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { arrowCases, arrowDiagram, arrowEdges, relationCases, relationDiagram } from './legacy-2004-autumn-am-54-80-figures';
import { body, knowledge } from './legacy-2004-autumn-am-54-80-knowledge';
import { autumn2004Am5480Source as source } from './legacy-2004-autumn-am-54-80-source';

function only(truth: readonly boolean[]): number {
  const answer = truth.indexOf(true);
  if (answer === -1 || answer !== truth.lastIndexOf(true))
    throw new DataError('ANSWER_REF', '2004年度秋期旧午前の正答を一意に確定できません');
  return answer;
}
const fmt = (n: number) => n.toLocaleString('en-US');
const choicesOf = (number: number) => strings([...source[number].choices]);

function calendar(index: number): GeneratedBody {
  const { shortenedD } = arrowCases[index];
  const edges = arrowEdges(index);
  const projectDays = (shortened: boolean) => {
    const earliest = Array<number>(8).fill(0);
    for (const point of [1, 2, 3, 4, 5, 6]) {
      for (const edge of edges.filter(edge => edge.from === point)) {
        const days = shortened && edge.label === '作業D' ? shortenedD : edge.days;
        earliest[edge.to] = Math.max(earliest[edge.to], earliest[point] + days);
      }
    }
    return earliest[7];
  };
  const before = projectDays(false);
  const after = projectDays(true);
  return {
    prompt: [p(source[54].prompt.replace('6日間に', shortenedD + '日間に')),
      figure(arrowDiagram.profile, [index], '業務のアローダイアグラム', arrowDiagram.alt([index]))],
    choices: choicesOf(54), correctIndex: only(source[54].choices.map(choice => Number(choice) === before - after)),
    explanation: '複数の矢印が入る結合点は，その作業を全部終えるまで待つ。各結合点に最も遅く到着する経路の日数を伝えると，全体は短縮前に' + before + '日，Dの短縮後に' + after +
      '日となる。点線のダミー作業は所要0日で順序だけを表す。したがって短縮は' + (before - after) + '日間である。',
  };
}

const functionCounts = [[1, 2, 1, 0, 0], [2, 2, 1, 0, 2], [1, 2, 2, 2, 0], [3, 2, 2, 2, 1]] as const;
const functionWeights = [4, 5, 10, 7, 4] as const;
const functionTypes = ['外部入力', '外部出力', '内部論理ファイル', '外部インタフェースファイル', '外部照会'];

function functionPoints(index: number): GeneratedBody {
  const counts = functionCounts[index];
  const subtotal = counts.reduce<number>((sum, value, slot) => sum + value * functionWeights[slot], 0);
  const choices = [subtotal * 0.75, subtotal, subtotal * 1.25, subtotal / 0.75];
  return {
    prompt: [p(source[55].prompt), table('ユーザファンクションタイプ別の個数と重み付け係数',
      ['ユーザファンクションタイプ', '個数', '重み付け係数'],
      functionTypes.map((label, slot) => [label, String(counts[slot]), String(functionWeights[slot])]))],
    choices: strings(choices.map(String)), correctIndex: only(choices.map(choice => 4 * choice === 3 * subtotal)),
    explanation: '個数にそれぞれの重みを掛けると' + counts.map((value, i) => value * functionWeights[i]).join('，') +
      'となる。合計は' + subtotal + 'なので，補正係数0.75を掛けると' + choices[0] + 'ファンクションポイントである。',
  };
}

const staffing = [
  { total: 88, observed: 5, team: 10, complete: 40, deadline: 8 },
  { total: 80, observed: 4, team: 10, complete: 32, deadline: 8 },
  { total: 99, observed: 5, team: 12, complete: 45, deadline: 8 },
  { total: 90, observed: 4, team: 10, complete: 36, deadline: 6 },
] as const;
function staff(index: number): GeneratedBody {
  const { total, observed, team, complete, deadline } = staffing[index];
  const efficiency = complete / (observed * team);
  const months = deadline - observed;
  const remaining = total - complete;
  const samePeriod = remaining / months;
  const required = (remaining * observed * team) / (months * complete);
  const choices = [samePeriod - team, required - team, samePeriod, required];
  const original = source[56].prompt;
  return body(index === 0 ? original :
    'ある開発プロジェクトの全体の開発工数の見積りは' + total + '人月である。作業を開始した1月から' + observed +
    '月までは各月' + team + '名を投入したが，' + observed + '月末時点で' + complete +
    '人月分の作業しか完了していない。' + deadline + '月末までにこのプロジェクトを完了するためには，' + (observed + 1) +
    '月以降あと何名の追加要員が必要か。ここで，' + (observed + 1) + '月以降のすべての要員の作業効率は，' +
    observed + '月までの要員と同じであるものとする。',
  choices.map(String), only(choices.map(value => (team + value) * months * complete === remaining * observed * team)),
  '作業効率は' + complete + '÷（' + observed + '×' + team + '）＝' + efficiency + 'である。残り' + remaining +
    '人月を' + months + 'か月で実施するには1か月に' + samePeriod + '人月分を完了する必要がある。そのためには' +
    required + '名が必要なので，既存の' + team + '名を引いて' + (required - team) + '名を追加する。');
}

const characters = ['T', 'R', 'M', 'N'] as const;
function startStop(index: number): GeneratedBody {
  const char = characters[index];
  const bits = char.charCodeAt(0).toString(2).padStart(7, '0');
  const reverse = [...bits].reverse().join('');
  const checkBit = [...bits].filter(bit => bit === '1').length % 2;
  const correct = '0' + reverse + checkBit + '1';
  const choices = ['0' + reverse + '01', '0' + reverse + '11', '1' + reverse + checkBit + '0', '1' + reverse + '11'];
  return body(source[63].prompt.replace('文字T（JIS 7単位符号 1010100）', '文字' + char + '（JIS 7単位符号 ' + bits + '）'),
    choices, only(choices.map(choice => choice === correct)),
    '文字' + char + 'を低位から高位に送ると' + reverse + 'となる。1の個数を偶数にするためパリティビットは' + checkBit +
    'である。先頭にスタートビット0，末尾にストップビット1を付けると' + correct + 'になる。');
}

const lines = [
  { bytes: 400, perHour: 3600, efficiency: 60 },
  { bytes: 240, perHour: 1800, efficiency: 60 },
  { bytes: 240, perHour: 5400, efficiency: 80 },
  { bytes: 600, perHour: 5400, efficiency: 60 },
] as const;
const speeds = [2400, 4800, 9600, 14400] as const;
function transmission(index: number): GeneratedBody {
  const { bytes, perHour, efficiency } = lines[index];
  const payloadRate = bytes * 8 * perHour / 3600;
  const possible = speeds.filter(speed => speed * efficiency >= 100 * payloadRate);
  const correct = possible[0];
  const required = payloadRate / (efficiency / 100);
  return body(
    source[64].prompt.replace('400バイト', bytes + 'バイト').replace('3,600件', fmt(perHour) + '件').replace('60%', efficiency + '%'),
    speeds.map(fmt), only(speeds.map(speed => speed === correct)),
    '1時間は3,600秒である。1秒当たりに運ぶデータ量は' + bytes + '×8×' + fmt(perHour) + '÷3,600＝' + fmt(payloadRate) +
    'ビットであり，制御用符号も' + bytes + 'バイトに含む。伝送効率' + efficiency + '%を考慮した回線速度の下限は' +
    fmt(payloadRate) + '÷' + (efficiency / 100) + '＝' + (Number.isInteger(required) ? fmt(required) : '約' + fmt(Math.round(required))) +
    'ビット／秒。選択肢の中で実際の下限を満たす最も低い速度は' + fmt(correct) + 'ビット／秒である。');
}

const sales = [
  { average: 40000, minimum: 30000, people: [['123', '山田　一郎', 29600, 31900, 36600, 41500], ['594', '鈴木　太郎', 43500, 45300, 30400, 46400], ['612', '佐藤　花子', 49600, 39400, 42300, 51100]] },
  { average: 45000, minimum: 34000, people: [['123', '石井　太一', 33900, 47000, 49800, 51000], ['594', '森　麻衣', 34000, 51000, 49000, 46000], ['612', '田中　渚', 41000, 42000, 44000, 45000]] },
  { average: 50000, minimum: 38000, people: [['123', '木村　稔', 51500, 37000, 57300, 56900], ['594', '井上　綾', 58700, 38000, 42200, 61100], ['612', '林　直樹', 49700, 44000, 51000, 42000]] },
  { average: 36000, minimum: 28000, people: [['123', '佐々木　実', 27800, 39500, 38400, 38400], ['594', '田村　玲', 38900, 36000, 41100, 28000], ['612', '松本　彰', 31000, 32000, 33000, 34000]] },
] as const;
function salesSql(index: number): GeneratedBody {
  const { average, minimum, people } = sales[index];
  const prompt = source[68].prompt.replace('4,000万円', fmt(average / 10) + '万円').replace('3,000万円', fmt(minimum / 10) + '万円');
  const choices = source[68].choices.map(choice => [code(choice.replaceAll('160000', String(4 * average))
    .replaceAll('40000', String(average)).replaceAll('30000', String(minimum)), 'sql')]);
  return {
    prompt: [p(prompt), table('販売実績', ['番号', '名前', '第1期', '第2期', '第3期', '第4期'],
      [...people.map(([number, name, ...periods]) => [number, name, ...periods.map(fmt)]), Array<string>(6).fill('⋮')])],
    choices, correctIndex: 3,
    explanation: '金額の列は千円単位。4期の平均' + fmt(average / 10) + '万円以上は，4期の合計' + fmt(4 * average) +
      '千円以上と同値である。各期' + fmt(minimum) + '千円以上もすべて必要なので，5条件をANDで結ぶ。ORを使うと一部だけを満たす行が残り，合計を平均の基準値と比較すると平均に届かない行も残る。',
  };
}

const databaseOrders = [[0, 2, 1], [2, 1, 0], [1, 0, 2], [1, 2, 0]];
function relationOrder(index: number): GeneratedBody {
  const { situation, tables, references } = relationCases[index];
  const original = source[70].prompt;
  const labels = tables.map(({ label }) => '“' + label + '”表');
  const prompt = index === 0 ? original : situation + labels.join('，') + 'を作成し，各表の関連付けを行った。' +
    original.slice(original.indexOf('新規にデータ'));
  const answer = only(databaseOrders.map(order => references.every(([parent, child]) => order.indexOf(parent) < order.indexOf(child))));
  return {
    prompt: [p(prompt), figure(relationDiagram.profile, [index], '下線でキーを示した3表の項目', relationDiagram.alt([index]))],
    choices: strings(databaseOrders.map(order => order.map(slot => labels[slot]).join(' → '))),
    correctIndex: answer,
    explanation: references.map(([parent, child]) => labels[child] + 'に' + labels[parent] + 'のキーが含まれる').join('。') +
      '。参照先がなければ参照する値を登録できないため，' + databaseOrders[answer].map(slot => labels[slot]).join('，') + 'の順に新規データを入力する。',
  };
}

const encryptedTransfers = [
  { first: '商店', second: '顧客', direction: 'toFirst', text: source[71].prompt },
  { first: '工場', second: '検査会社', direction: 'toSecond',
    text: 'ある工場が，検査会社へネットワークを通じて検査依頼を伝えるために，公開かぎ暗号方式を利用して，依頼の内容が第三者に分からないようにする。工場，検査会社それぞれが利用するかぎの適切な組合せはどれか。' },
  { first: '診療所', second: '分析機関', direction: 'toFirst',
    text: 'ある診療所が，分析機関からネットワークを通じて検査結果を受け取るために，公開かぎ暗号方式を利用して，結果の内容が第三者に分からないようにする。診療所，分析機関それぞれが利用するかぎの適切な組合せはどれか。' },
  { first: '倉庫', second: '小売店', direction: 'toSecond',
    text: 'ある倉庫が，小売店へネットワークを通じて出荷明細を伝えるために，公開かぎ暗号方式を利用して，明細の内容が第三者に分からないようにする。倉庫，小売店それぞれが利用するかぎの適切な組合せはどれか。' },
] as const;
function keys(index: number): GeneratedBody {
  const { first, second, direction, text } = encryptedTransfers[index];
  const secret = direction === 'toFirst' ? first : second;
  const publicUser = direction === 'toFirst' ? second : first;
  const correct = direction === 'toFirst' ? '秘密かぎ｜公開かぎ' : '公開かぎ｜秘密かぎ';
  return {
    prompt: [p(text)], choices: source[71].choices.map(choice => [table('利用するかぎ', [first, second], [choice.split('｜')])]),
    correctIndex: only(source[71].choices.map(choice => choice === correct)),
    explanation: publicUser + 'は受信者である' + secret + 'の公開かぎで暗号化する。復号に使うのは' + secret +
      'だけが管理する対応した秘密かぎである。送信者は復号用の秘密かぎを受け取る必要がない。',
  };
}

const cafes = [
  { sales: 500, variable: 100, fixed: 300000, days: 20, seats: 10, profit: 100000 },
  { sales: 600, variable: 150, fixed: 400000, days: 20, seats: 10, profit: 140000 },
  { sales: 550, variable: 150, fixed: 200000, days: 20, seats: 10, profit: 120000 },
  { sales: 600, variable: 200, fixed: 360000, days: 25, seats: 8, profit: 200000 },
] as const;
function cafe(index: number): GeneratedBody {
  const { sales, variable, fixed, days, seats, profit } = cafes[index];
  const contribution = sales - variable;
  const people = (fixed + profit) / contribution;
  const rate = people / (seats * days);
  const choices = index === 0 ? [...source[75].choices] : [
    (fixed / (contribution * seats * days)).toFixed(2),
    ((fixed + profit) / (sales * seats * days)).toFixed(2),
    (people / (seats * (days + 1))).toFixed(1),
    String(rate),
  ].map(value => String(Number(value)));
  return {
    prompt: [p(source[75].prompt.replace('10万円', (profit / 10000) + '万円')),
      table('喫茶店の条件', ['項目', '値'], [
        ['客1人当たりの売上高', fmt(sales) + '円'],
        ['客1人当たりの変動費', fmt(variable) + '円'],
        ['固定費', fmt(fixed) + '円／月'],
        ['1か月の営業日数', days + '日'],
        ['客席数', seats + '席'],
      ])],
    choices: strings(choices),
    correctIndex: only(choices.map(choice => Number(choice) * seats * days * contribution - fixed === profit)),
    explanation: '客1人当たり売上から変動費を引くと' + fmt(contribution) + '円が固定費と利益に回る。固定費と目標利益の和は' +
      fmt(fixed + profit) + '円であるため，必要客数は月に' + fmt(people) + '人。月に' + days + '日，' + seats +
      '席なので，1客席当たり1日に' + rate + '人が必要となる。',
  };
}

const expectedCases = [
  { tenths: [2, 3, 4, 1], profits: [[40, 10, 0, -6], [7, 18, 10, -10], [8, 18, 12, -5], [2, 4, 12, 30]] },
  { tenths: [5, 2, 2, 1], profits: [[40, 10, 0, -6], [7, 18, 10, -10], [8, 18, 12, -5], [2, 4, 12, 30]] },
  { tenths: [1, 5, 3, 1], profits: [[40, 10, 0, -6], [7, 23, 10, -10], [8, 18, 12, -5], [2, 4, 12, 30]] },
  { tenths: [1, 2, 3, 4], profits: [[40, 10, 0, -6], [7, 18, 10, -10], [8, 18, 12, -5], [2, 4, 12, 30]] },
] as const;
function expectedProfit(index: number): GeneratedBody {
  const { tenths, profits } = expectedCases[index];
  const outcomes = profits.map(row => row.reduce<number>((sum, value, i) => sum + value * tenths[i], 0));
  const answer = only(outcomes.map(value => value === Math.max(...outcomes)));
  return {
    prompt: [p(source[77].prompt), table('経済状況別の予想利益（単位：百万円）',
      ['設備計画案', '状況1', '状況2', '状況3', '状況4'],
      [['予想確率', ...tenths.map(value => (value / 10).toFixed(1))],
        ...profits.map((row, slot) => [source[77].choices[slot], ...row.map(String)])])],
    choices: choicesOf(77), correctIndex: answer,
    explanation: '各案で4状況の予想利益に対応する確率を掛けて合計する。期待利益は' + outcomes.map((outcome, slot) =>
      source[77].choices[slot] + 'が' + (outcome / 10).toFixed(1) + '百万円').join('，') + 'であり，最大は案' + source[77].choices[answer] + 'である。',
  };
}

const factories = [
  { hour: 240, mass: 150, hoursByProduct: [2, 3, 1], massByProduct: [2, 1, 2], profitByProduct: [8, 5, 5] },
  { hour: 180, mass: 120, hoursByProduct: [3, 2, 1], massByProduct: [2, 1, 2], profitByProduct: [9, 6, 4] },
  { hour: 160, mass: 140, hoursByProduct: [2, 4, 2], massByProduct: [3, 2, 1], profitByProduct: [9, 7, 5] },
  { hour: 210, mass: 180, hoursByProduct: [3, 2, 4], massByProduct: [1, 2, 3], profitByProduct: [7, 7, 9] },
] as const;
function production(index: number): GeneratedBody {
  const { hour, mass, hoursByProduct, massByProduct, profitByProduct } = factories[index];
  const term = (coefficients: readonly number[]) => coefficients.map((value, position) => value + 'xyz'[position]).join('＋');
  return {
    prompt: [p(source[78].prompt.replace('240時間', hour + '時間').replace('150kg', mass + 'kg')),
      table('製品の単位量別条件', ['製品', 'A', 'B', 'C'], [
        ['製造時間（時間）', ...hoursByProduct.map(String)],
        ['原料所要量（kg）', ...massByProduct.map(String)],
        ['利益額（千円）', ...profitByProduct.map(String)],
      ])],
    choices: choicesOf(78), correctIndex: 2,
    explanation: 'A，B，Cの生産量をそれぞれ非負のx，y，zと置く。製造時間は' + term(hoursByProduct) + '≦' + hour +
      '，原料は' + term(massByProduct) + '≦' + mass + 'である。この制約の下で利益' + term(profitByProduct) +
      'を最大にしたい。制約と目的はいずれも一次式なので，線形計画法が適切である。移動平均法は時系列を平滑化し，最小二乗法は誤差平方和を最小化し，定量発注法は在庫の発注量を決める方式である。',
  };
}

const computed: Record<number, (index: number) => GeneratedBody> = {
  54: calendar, 55: functionPoints, 56: staff, 63: startStop, 64: transmission, 68: salesSql,
  70: relationOrder, 71: keys, 75: cafe, 77: expectedProfit, 78: production,
};
const changes: Record<number, string> = {
  54: 'Dの短縮後と経路上の作業日数を変え，元の結合点・矢印・ダミー作業を保つ。',
  55: '機能の個数を変え，5機能の係数，補正の条件及び選択肢の昇順を保つ。',
  56: '投入要員，開発工数，作業済人数相当，観測期間・期限を変え，効率と追加人数の関係を保つ。',
  57: '障害復旧の目標時点，全体保存の周期，変更分の保存時刻を変える。',
  58: '運用中のDBの作業目的をデータ再編成・採番・履歴整理・項目追加で変える。',
  59: '説明する移行方式を切替順序・試行範囲・二重稼働の異なる方式から選ぶ。',
  60: '端末管理の対象作業を現況収集，遠隔操作，配信，機器の導入から廃棄までで変える。',
  61: 'IPv4の説明対象をマスク，アドレス共用，クラス識別，ブロードキャストで変える。',
  62: '電子メールの操作の対象を送信，サーバ内の参照・同期，本文・添付の符号化，ダウンロードで変える。',
  63: '送る文字とその7ビットを変え，低位先行・偶数パリティ・スタートとストップビットを保つ。',
  64: '制御用符号を含むバイト数，件数，伝送効率を変え，与えられた速度の最小適合を調べる。',
  65: '説明対象のサーバをDNS，DHCP，フォワードプロキシ，リモートアクセスで変える。',
  66: '機器の役割と対象となる層を変え，ブリッジとレイヤ2スイッチの区別に使うポート数を示す。',
  67: '正規化に対する索引，物理配置，冗長化の目的・条件を個別の事例に対応させる。',
  68: '平均下限，各期下限及び表を同時に変え，4期・千円単位・SQLの句構造を保存する。',
  69: '対象となるパフォーマンス，設計時の異常，参照条件，同時更新で必要なDBの技法を変える。',
  70: '業務と表のキーを変え，親子関係を示す下線と選択肢の4つの順列を保つ。',
  71: '秘匿する文書と送信の向きを変え，送信側と受信側の公開・秘密かぎの組合せを表で問う。',
  72: '通過条件の対象ヘッダを宛先ポート・送信元アドレス・プロトコルで変える。',
  73: '説明対象をASCII，EUC-JP，Unicode，シフトJISとして符号化を区別する。',
  74: '業務プロセスの再設計，同時切替，限られたカスタマイズ，会計先行の条件を変える。',
  75: '固定費，売上，変動費，目標利益，日数と客席を変え，原形式の昇順と計算量を保つ。',
  76: '説明対象を特性要因図，アローダイアグラム，管理図，パレート図で変える。',
  77: '状況の予想確率と予想利益を変え，損失を含む4案の期待利益を比較する。',
  78: '時間・原料の各制約と製品別係数を変え，3製品の最適な生産量に適用する手法を問う。',
  79: '情報機器の利用場面をアクセシビリティ，移動通信，勤務形態，利用場所の連続性で変える。',
  80: '職務著作，アイディアと表現，権利移転，表示と複製に関する出題時の要件を事例で変える。',
};
const fixed = new Set([55, 56, 57, 68, 72, 75, 78]);

export const legacy2004AutumnAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([id, original]) => {
  const number = Number(id);
  return {
    source: '2004h16a-fe-am-' + number, title: original.title, sourceAnswer: original.key,
    version: '3.7.0', fields: [field('対象・判断条件', 0, 3)], reference: [0],
    notes: variableNotes + ' ' + changes[number],
    ...(fixed.has(number) ? { answerVariation: 'fixed' as const } : {}),
    build(values) {
      const descriptor = Array.isArray(values) ? Object.getOwnPropertyDescriptor(values, '0') : undefined;
      const index = descriptor?.value;
      if (!descriptor || !('value' in descriptor) || values.length !== 1 || Reflect.ownKeys(values).length !== 2 ||
          !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2004年度秋期旧午前の入力が範囲外です');
      return computed[number]?.(index) ?? knowledge(number, index);
    },
  };
});
