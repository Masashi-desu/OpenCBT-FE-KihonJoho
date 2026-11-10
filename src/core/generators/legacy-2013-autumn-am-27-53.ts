import { code, figure, p, strings, table } from './definition';
import { legacy2013AutumnAm27To53Source as source } from './legacy-2013-autumn-am-27-53-source';
import { finite2013AutumnAm as finite } from './legacy-2013-autumn-am-27-53-shared';
import { legacy2013AutumnAm2753Knowledge } from './legacy-2013-autumn-am-27-53-knowledge';
import { autumn2013Am2753Profiles, autumn2013StaffingAlt, autumn2013UmlAlt, autumn2013WorkCases } from './legacy-2013-autumn-am-27-53-figures';

type ProductRow = readonly [string, string, string];
const products = [
  { rows: [['A010', 'AAA', '2,500'], ['B020', 'BBB', '1,000'], ['C030', 'CCC', '4,500']], target: 1 },
  { rows: [['A015', 'ケース', '3,500'], ['B025', 'スタンド', '1,600'], ['C035', 'フィルタ', '4,300']], target: 0 },
  { rows: [['A018', 'カバー', '2,800'], ['B028', 'レンズ', '4,000'], ['C038', 'ホルダ', '900']], target: 2, update: 1500 },
  { rows: [['A019', 'アダプタ', '2,000'], ['B029', 'ケーブル', '2,500'], ['C039', 'コネクタ', '1,300']], target: 2 },
] as const;
const productTable = (caption: string, rows: readonly ProductRow[]) =>
  table(caption, ['商品コード', '商品名', '販売単価'], rows.map(row => [...row]));

const rollback = finite(31, 'デッドロック発生時のロールバック', '取り消す更新命令と対象行', products.length,
  '商品表、更新SQLと四つの結果表を保持する。異常終了・他のトランザクションは参照のみという条件を維持し、DELETEの対象又はUPDATEの更新内容を変更する。原子性により常に変更前の表が正答となるが、表の値と取り消す操作は異なる。', i => {
    const item = products[i];
    const rows: readonly ProductRow[] = item.rows;
    const [productCode] = rows[item.target];
    const updated = 'update' in item;
    const sql = updated
      ? "UPDATE 商品 SET 販売単価 = " + item.update + " WHERE 商品コード = '" + productCode + "'"
      : "DELETE FROM 商品 WHERE 商品コード = '" + productCode + "'";
    const nullRows = rows.map(([key, name, price], index): ProductRow => [key, index === item.target ? 'NULL' : name, price]);
    const applied = updated
      ? rows.map(([key, name, price], index): ProductRow => [key, name, index === item.target ? item.update.toLocaleString('en-US') : price])
      : rows.filter((_, index) => index !== item.target);
    return {
      prompt: [p(source[31].prompt), productTable('商品', rows), p('〔更新SQL文〕'), code(sql, 'sql')],
      choices: [nullRows, rows, applied, [rows[item.target]]].map(result => [{ ...productTable('商品表の候補', result), captionPresentation: 'accessible' as const }]),
      correctIndex: 1,
      explanation: '異常終了したトランザクションはロールバックされる。更新SQL（Structured Query Language）の対象は' + productCode +
        'だが、' + (updated ? '販売単価を変更する処理' : 'その行を削除する処理') +
        'は確定しない。他のトランザクションは更新しないため、行も各列の値も変更前の「商品」表と同じである。',
    };
  });

type Lock = 'S' | 'X' | '−';
const lockCases: readonly (readonly (readonly Lock[])[])[] = [
  [['S', '−', 'X'], ['S', 'X', '−'], ['X', 'S', '−']],
  [['X', '−', 'X'], ['S', 'X', '−'], ['S', '−', 'S']],
  [['−', 'S', 'X'], ['X', 'S', '−'], ['−', 'X', 'S']],
  [['X', 'X', '−'], ['−', 'S', 'X'], ['S', 'S', '−']],
];
const lockPairs = [[1, 3], [2, 1], [2, 3], [3, 1]] as const;
const resources = ['A', 'B', 'C'] as const;
const lockConflict = (a: Lock, b: Lock) => a !== '−' && b !== '−' && (a === 'X' || b === 'X');
const transactionLocks = finite(32, '共有ロック・専有ロックと待ち', '三つのトランザクションのロック種別', lockCases.length,
  '原のロック表、共有Sと専有Xと未取得の定義、開始時に取得する前提と全候補の開始順を保持する。資源ごとのロックの割当てを変える。', i => {
    const matrix = lockCases[i];
    const conflicts = lockPairs.map(([first, second]) =>
      resources.filter((_, resource) => lockConflict(matrix[first - 1][resource], matrix[second - 1][resource])));
    const correctIndex = conflicts.findIndex(items => !items.length);
    const detail = conflicts.map((items, n) => 'アイウエ'[n] + 'は' +
      (items.length ? '資源' + items.join('・') + 'で競合する' : 'どの資源でも競合しない')).join('、');
    return {
      prompt: [p(source[32].prompt), { ...table('ロックの種別', ['トランザクション＼資源', ...resources],
        matrix.map((row, n) => [String(n + 1), ...row])), captionPresentation: 'accessible' as const }],
      choices: strings([...source[32].choices]),
      correctIndex,
      explanation: '同じ資源にSとSは同時に掛けられるが、XとS又はXとXは同時に掛けられない。どちらかがロックなしなら競合しない。' +
        detail + '。したがって、' + 'アイウエ'[correctIndex] + 'の場合に後から開始した処理の資源待ちはない。',
    };
  });

const transferCases = [
  { rate: 64, size: 1, efficiency: 80 },
  { rate: 80, size: 2, efficiency: 80 },
  { rate: 64, size: 2, efficiency: 50 },
  { rate: 160, size: 2, efficiency: 50 },
] as const;
const transfer = finite(33, '回線効率と伝送時間', '回線速度・ファイル容量・伝送効率', transferCases.length,
  '十進のk、10⁶バイト単位、1バイト8ビット、伝送効率と近似時間の問いを維持。4候補を元の昇順と表示精度で出す。最初の誤答はビット換算漏れを表す近似値で、基準選択肢19.6を保持する。', i => {
    const { rate, size, efficiency } = transferCases[i];
    const capacity = rate * 1000 * efficiency / 100;
    const seconds = size * 8_000_000 / capacity;
    const ideal = size * 8_000_000 / (rate * 1000);
    const choices = i === 0 ? [...source[33].choices] : [
      (seconds / 8).toFixed(1), String(ideal * efficiency / 100), String(ideal), String(Math.round(seconds)),
    ];
    const prompt = i === 0 ? source[33].prompt :
      rate + 'kビット／秒の回線を用いて' + size + '×10⁶バイトのファイルを送信するとき，伝送におよそ何秒掛かるか。ここで，回線の伝送効率は' + efficiency + '％とする。';
    return {
      prompt: [p(prompt)],
      choices: strings(choices),
      correctIndex: 3,
      explanation: 'ファイルは' + size + '×10⁶バイトなので' + size * 8 + '×10⁶ビット。実効速度は' + rate + '×' +
        efficiency + '／100＝' + capacity / 1000 + 'kビット／秒。ファイルのビット数をこれで割ると' +
        seconds + '秒となり、およそ' + choices[3] + '秒である。',
    };
  });

const packetCases = [
  { server: 'Webサーバ', port: 80, dynamic: 1024 },
  { server: 'Webサーバ', port: 443, dynamic: 1024, scheme: 'HTTPS' },
  { server: 'Webサーバ', port: 8080, dynamic: 49152, scheme: 'HTTP' },
] as const;
const filterChoices = [[true, true], [true, false], [false, true], [false, false]] as const;
const packetFilter = finite(45, '双方向パケットフィルタのポート', 'Webサーバの待受ポートとPCの送信元範囲', packetCases.length,
  'クライアント→サーバとサーバ→クライアントの両方向、送信元・宛先とポートの対応を四つの選択肢表で保持する。待受ポートはPCの送信元範囲の外に限定する。', i => {
    const item = packetCases[i];
    const { port, dynamic, server } = item;
    const prompt = 'scheme' in item
      ? source[45].prompt.replace('80番ポート', port + '番ポート') +
        ' Webサーバは' + item.scheme + 'を使用し，このPCは' + dynamic + '以上の送信元ポート番号を使用する。'
      : source[45].prompt;
    const service = String(port);
    const client = dynamic + '以上';
    return {
      prompt: [p(prompt)],
      choices: filterChoices.map(([serviceFirst, serviceBack]) => [{ ...table('フィルタリングで許可するルール', ['送信元', '宛先', '送信元ポート番号', '宛先ポート番号'], [
        ['PC', server, serviceFirst ? service : client, serviceFirst ? client : service],
        [server, 'PC', serviceBack ? service : client, serviceBack ? client : service],
      ]), captionPresentation: 'accessible' as const }]),
      correctIndex: 2,
      explanation: 'PCからの要求の宛先はWebサーバの' + port + '番ポートで、PC側の送信元は' + dynamic +
        '以上である。応答では送信元がWebサーバの' + port + '番、宛先が要求に使ったPC側のポートとなる。両方向とも送信元と宛先を入れ替えて許可する。',
    };
  });

const classTarget = ['汎化', 'コンポジション', '依存', 'コンポジションではない単純な関連'] as const;
const classExplanations = [
  'UML（Unified Modeling Language、統一モデリング言語）の汎化は、特殊なクラスから一般的なクラスへの実線を白抜き三角で終える。スポーツカーは自動車の一種なので、三角形は自動車側にある。',
  'コンポジションでは全体の側を黒塗りのひし形で示す。自動車と部品を接続する図が該当する。白抜き三角の汎化、破線矢印の依存、ひし形のない実線の関連とは異なる。',
  '依存は利用する側から利用される側への破線に、開いた矢印を付けて示す。ドライバから自動車へ向く破線がこの記法である。',
  '単純な関連は、クラス同士を多重度を持つ実線で結んだ図で表す。ここではひし形のない、両端が1の自動車と車検証の図が該当する。',
] as const;
const uml = finite(46, 'UMLクラス間の関係と接続記号', '図から識別するUMLの関係', classTarget.length,
  '関係名から図を選ぶ原形式を保持する。クラスの区画、接続の方向、線種、多重度、終端記号の違いで、汎化・コンポジション・依存・単純な関連を区別する。', i => ({
    prompt: [p(i === 3 ? 'UMLのクラス図のうち，コンポジションではない単純な関連を示したものはどれか。'
      : source[46].prompt.replace('汎化', classTarget[i]))],
    choices: [0, 1, 2, 3].map(index => [{
      ...figure(autumn2013Am2753Profiles.uml, [index], 'クラス間の関係', autumn2013UmlAlt([index])), captionPresentation: 'accessible' as const,
    }]),
    correctIndex: [1, 2, 3, 0][i],
    explanation: classExplanations[i],
  }));

function endOfPair(day: number, left: number, right: number, helperFirst: number, helperLast: number) {
  // Prioritise the longer unfinished activity when only one person is available.
  // When both activities are ready and the helper is present, the two people work separately.
  while (left > 0 || right > 0) {
    if (left > 0 && right > 0 && day >= helperFirst && day <= helperLast) {
      left--;
      right--;
    } else if (left >= right) {
      left--;
    } else {
      right--;
    }
    day++;
  }
  return day;
}

const staffing = finite(53, '助っ人期間を含むアローダイアグラムの短縮', '作業日数と手伝いの開始・終了日', autumn2013WorkCases.length,
  'A・B→C→D・Eの先行関係とダミー作業、全体を一人が担当する条件、期間限定の助っ人を保持。同じ作業に二人を同時に割り当てず、日をまたいだ引継ぎに追加日数は不要。原と同じ昇順の四択を保持する。', i => {
    const { days: [a, b, c, d, e], helperFirst, helperLast } = autumn2013WorkCases[i];
    const prefixEnd = endOfPair(1, a, b, helperFirst, helperLast);
    const suffixStart = prefixEnd + c;
    const finish = endOfPair(suffixStart, d, e, helperFirst, helperLast) - 1;
    const originalDays = a + b + c + d + e;
    const reduced = originalDays - finish;
    const durationText = helperFirst + '日目から' + helperLast + '日目までの' + (helperLast - helperFirst + 1) + '日間';
    return {
      prompt: [p(source[53].prompt.replace('2日目から6日目までの5日間', durationText)),
        { ...figure(autumn2013Am2753Profiles.staffing, [i], '作業A〜Eのアローダイアグラム', autumn2013StaffingAlt([i])),
          captionPresentation: 'accessible' as const }],
      choices: strings([...source[53].choices]),
      correctIndex: source[53].choices.indexOf(String(reduced)),
      explanation: '手伝いがないと各作業を一人で順に行うので' + originalDays + '日。先にA・Bが終わるまで' +
        (prefixEnd - 1) + '日、その後にCを' + c + '日行い、' + suffixStart + '日目からD・Eを行う。各組で二つの作業が残り、手伝いがいる日は別々に進める。一人の日は残りが長い方を先に進めると後で並行作業に使える時間を最大にできる。D・Eの両方が' +
        finish + '日目に終わるので、短縮は' + originalDays + '−' + finish + '＝' + reduced + '日である。',
    };
  });

export const legacy2013AutumnAm27To53Definitions = [
  ...legacy2013AutumnAm2753Knowledge, rollback, transactionLocks, transfer, packetFilter, uml, staffing,
].sort((a, b) => Number(a.source.split('-').at(-1)) - Number(b.source.split('-').at(-1)));
