import { DataError } from '../errors';
import { code, field, figure, p, strings, table, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import {
  activityEdges, clinicChoiceFigures, clinicSchemaFigure, criticalPathFigure, databaseLinkFigure,
  dependencyFigure, functionalDependencies, qualityChart, qualityChoiceFigures, qualityCounts, salesAxisFigure,
} from './legacy-2008-spring-am-54-80-figures';
import { spring2008Am5480Knowledge as knowledge } from './legacy-2008-spring-am-54-80-knowledge';
import { spring2008Am5480Source as source } from './legacy-2008-spring-am-54-80-source';

const numberText = (number: number) => number.toLocaleString('en-US');
const letters = 'アイウエ';
function draw(definition: BookletFigureDefinition, index: number, caption: string) {
  return figure(definition.profile, [index], caption, definition.alt([index]));
}
function uniqueIndex(results: boolean[]) {
  const found = results.indexOf(true);
  if (found < 0 || found !== results.lastIndexOf(true))
    throw new DataError('ANSWER_REF', '2008年度春期旧午前の正答を一意に確定できません');
  return found;
}

function normalization(index: number): GeneratedBody {
  const dependencies = functionalDependencies(index);
  const nonKey = dependencies.filter(({ left }) => left[0] !== 'a');
  const one = nonKey.filter(({ left }) => left.length === 1);
  const pair = nonKey.filter(({ left }) => left.length === 2);
  const format = (rows: string[][]) => rows.map((row, i) => '表' + (i + 1) + ' {' + row.join(', ') + '}').join('\n');
  const common = [...'abcde'];
  const options = [
    [['a'], [...'bcde'], [...'fgh']],
    [common, ['a', 'c'], [one[0].left[0], 'e', ...'fgh']],
    [common, [...'bcfgh'], [...'bc', ...pair.map(({ right }) => right)]],
    [common, [one[0].left[0], ...one.map(({ right }) => right)], ['b', 'c', ...pair.map(({ right }) => right)]],
  ];
  const order = [[0, 1, 2, 3], [3, 0, 2, 1], [0, 3, 2, 1], [2, 0, 3, 1]][index];
  return {
    prompt: [p(source[56].prompt), draw(dependencyFigure, index, '属性間の関数従属')],
    choices: strings(order.map(position => format(options[position]))), correctIndex: order.indexOf(3),
    explanation: 'aで決まるb，c，d，eをaの表に置く。属性' + one[0].left[0] + '単独から決まる' +
      one.map(({ right }) => right).join('，') + 'を別の表にし，bとcの組から決まる' +
      pair.map(({ right }) => right).join('，') + 'は複合キーを持つ表に置く。部分従属や推移的な従属を残さず，結合に使うキーも保てる。',
  };
}

function clinic(index: number): GeneratedBody {
  const legend = 'ここで，表定義中の実線は主キーを，破線は外部キーを表す。';
  const common = '“診療科”表，“医師”表及び“患者”表がある。';
  const conditions = [
    source[57].prompt,
    common + '医師ごとの予約枠を設定する。患者を予約に結び付ける前の枠だけを扱い，診察する医師とその日時を特定できる“診察”表はどれか。' + legend,
    common + '医師が所属診療科とは異なる診療科でも当番を担当する。実際に担当する診療科，医師及び日時を特定し，患者をまだ登録しない当番枠に使う“診察”表はどれか。' + legend,
    common + '医師を指名する前に，患者が選んだ診療科での受付予約を記録する。実際の予約先の診療科，患者及び予約日時を特定する“診察”表はどれか。' + legend,
  ];
  const required = ['医師番号・患者番号・診察日時', '医師番号・診察日時', '診療科コード・医師番号・診察日時', '診療科コード・患者番号・診察日時'];
  return {
    prompt: [p(conditions[index]), draw(clinicSchemaFigure, index, '診療科・医師・患者の表定義')],
    choices: clinicChoiceFigures.map((definition, position) => [draw(definition, index, '選択肢' + letters[position] + 'の表定義')]),
    correctIndex: index,
    explanation: 'この記録を特定するには' + required[index] +
      'の組が必要である。番号・コードはそれぞれ対応する表の主キーを参照する外部キーであり，日時と合わせてこの表の主キーを構成する。',
  };
}

function sql(index: number): GeneratedBody {
  const role = ['プログラマ', 'テスト担当', '分析担当', '運用担当'][index];
  const limit = [5, 4, 6, 3][index];
  const start = 'SELECT DISTINCT 部署コード FROM 社員 S1';
  const bind = 'WHERE S1.部署コード = S2.部署コード';
  const conditions = [
    [start, '     WHERE ' + limit + ' > (SELECT COUNT(S2.社員番号) FROM 社員 S2',
      '                ' + bind, "                AND S2.職務 = '" + role + "')"],
    [start, '     WHERE ' + limit + ' < (SELECT COUNT(S2.社員番号) FROM 社員 S2',
      '                ' + bind, "                AND S2.職務 <> '" + role + "')"],
    [start, '     WHERE EXISTS (SELECT * FROM 社員 S2', '                ' + bind,
      "                AND S2.職務 = '" + role + "')", '     GROUP BY S1.部署コード HAVING COUNT(*) < ' + limit],
    [start, '     WHERE S1.部署コード IN (SELECT S2.部署コード FROM 社員 S2',
      '                ' + bind, "                AND S2.職務 = '" + role + "'",
      '                GROUP BY S2.部署コード HAVING COUNT(*) < ' + limit + ')'],
  ];
  return {
    prompt: [p(source[58].prompt.replace('プログラマである社員が5人', role + 'である社員が' + limit + '人') +
      (index === 0 ? '' : ' “社員”表に現れる部署を対象とし，該当する職務の社員が0人の部署も含める。')),
      p('社員（社員番号，社員名，部署コード，職務）')],
    choices: conditions.map(lines => [code(lines.join('\n'), 'sql')]), correctIndex: 0,
    explanation: '相関副問合せでS1と同じ部署の' + role + 'を数える。COUNTは該当0件でも0を返すので，' + limit +
      '人未満の部署を漏らさない。EXISTSとINの案は該当0人の部署を落とし，EXISTSの案の外側のCOUNTは部署全体の社員数である。',
  };
}

const locks = [
  [['S', '－', 'X'], ['S', 'X', '－'], ['X', 'S', '－']],
  [['S', '－', 'X'], ['X', 'X', '－'], ['S', 'S', '－']],
  [['X', '－', 'X'], ['S', 'X', '－'], ['S', '－', '－']],
  [['－', 'S', 'X'], ['S', 'S', '－'], ['X', 'X', '－']],
];
const startOrders = [
  [[1, 3], [2, 1], [2, 3], [3, 1]], [[1, 3], [2, 1], [2, 3], [3, 2]],
  [[1, 3], [2, 1], [2, 3], [3, 1]], [[1, 3], [3, 2], [2, 3], [1, 2]],
];
function locking(index: number): GeneratedBody {
  const model = locks[index];
  const pairs = startOrders[index];
  const noWait = pairs.map(([first, next]) => model[first - 1].every((lock, i) => {
    const requested = model[next - 1][i];
    return lock === '－' || requested === '－' || lock === 'S' && requested === 'S';
  }));
  const correctIndex = uniqueIndex(noWait);
  return {
    prompt: [p(source[59].prompt), table('資源別のロックの種別', ['ジョブ＼資源', 'A', 'B', 'C'],
      model.map((row, i) => [String(i + 1), ...row]))],
    choices: strings(pairs.map(([first, next]) => 'ジョブ' + first + 'の後にジョブ' + next + 'を起動したとき，ジョブ' + next + 'の資源待ちはない。')),
    correctIndex,
    explanation: '同じ資源で，一方が占有ロック，もう一方が共有又は占有ロックなら競合する。共有同士とロックなしは競合しない。表の三資源で競合しない選択肢はジョブ' +
      pairs[correctIndex][0] + 'の後にジョブ' + pairs[correctIndex][1] + 'を起動する組合せである。',
  };
}

function protection(index: number): GeneratedBody {
  const replacement = [
    '',
    '許可していないクライアントから，サーバ側のデータベース接続プログラムへ接続を開始されることに対する対策はどれか。端末の送信元IPアドレスは管理済みとする。',
    '運用権限のないサーバ利用者に，データベース接続プログラムを起動・停止されることに対する対策はどれか。',
    '既定のポート番号だけを対象に接続を繰り返す自動試行を減らす対策はどれか。認証と暗号化は別途実施している。',
  ];
  const why = [
    '通信を暗号化すると，通信経路上でパケットを取得されても内容を読まれにくくなる。接続元制限や起動停止の認証は，経路上で取得した本文を保護しない。',
    '接続元を管理済みIPアドレスに限定すれば，許可されていない端末は接続を開始できない。ポート番号を変えても許可端末を識別できない。',
    '起動・停止に認証を要求すれば，権限を持つ運用担当者だけに操作を制限できる。通信の暗号化やポート番号の変更はサーバ上の操作権限を確認しない。',
    'ポート番号を変更すれば，既定番号だけを狙った自動試行は実際の接続先に届かない。ポートを探索できる相手には認証とアクセス制御が必要になる。',
  ];
  const intro = source[65].prompt.split('。')[0] + '。';
  return {
    prompt: [p(index === 0 ? source[65].prompt : intro + replacement[index]),
      draw(databaseLinkFigure, index, 'クライアントとサーバ間のデータベース接続')],
    choices: strings([...source[65].choices!]), correctIndex: index, explanation: why[index],
  };
}

const protections = [
  [['誤操作によるデータの論理的な破壊', 'ディスクアレイ'], ['地震と火災', 'コンピュータ内で複数の仮想化OSを利用したデータの二重化'],
    ['伝送中のデータへの不正アクセス', 'HDLC手順のCRC'], ['メッセージの改ざん', '公開鍵暗号方式を応用したディジタル署名']],
  [['誤操作によるファイルの削除', '削除前の世代のバックアップからの復元'], ['地震と火災', '同じ建物に置いた装置への複製'],
    ['伝送中のデータの盗聴', '通信内容にCRCを追加'], ['メッセージの改ざん', '通信内容の圧縮']],
  [['誤操作によるデータの削除', '同じ内容を同時に書くディスク二重化'], ['地震で事業所を喪失', '離れた地域に保管する復旧用データ'],
    ['伝送中のデータの盗聴', '送信する内容のハッシュ値を添付'], ['メッセージの改ざん', '通信ポート番号の変更']],
  [['誤操作によるファイルの上書き', '現在の内容だけの同期レプリケーション'], ['火災で設備が全損', '同一設備内でのデータの二重化'],
    ['伝送中のデータの盗聴', 'クライアントとサーバ間の通信の暗号化'], ['メッセージの改ざん', '無署名の送信者名の表示']],
];
function threatPair(index: number): GeneratedBody {
  const explanation = [
    '署名を受信者が検証すればメッセージの改ざんを検出できる。ディスクアレイは論理的な誤操作を戻せず，同一コンピュータ内の二重化は設置場所を失う災害を防げない。CRCは主に伝送誤りの検出に使う。',
    '世代別のバックアップは削除前の内容を残せる。同じ建物への複製は建物全体の災害で失われ，CRCと圧縮は機密性や真正性を提供しない。',
    '離れた地域に復旧用データを保存すると，一つの事業所を失っても復旧できる。同期二重化は削除も反映し，ハッシュ値やポート変更だけでは盗聴・改ざんを防げない。',
    '通信を暗号化すると，経路上で盗聴されたデータの内容を秘匿できる。現在値の同期や同一設備の二重化では誤操作や設備全損に対応できず，無署名の表示は改ざんを検出できない。',
  ][index];
  const context = [
    '',
    'ファイルを共有する情報システムで，ファイルの更新履歴を一定期間保存できる。社外拠点も通信を利用する。',
    '広い地域に拠点を置く事業者の情報システムで，各拠点の機器を独立して運用する。',
    '外部と通信する情報システムで，保守用装置も同じサーバ室に置く。',
  ];
  return { prompt: [p(context[index] + source[66].prompt)], choices: protections[index].map(row =>
    [table('脅威とセキュリティ対策', ['脅威', 'セキュリティ対策'], [row])]), correctIndex: [3, 0, 1, 2][index], explanation };
}

function sales(index: number): GeneratedBody {
  const conditions = [
    '',
    '営業の目的は，年間取引の実績と推定購買規模がともに大きい主要顧客の維持である。',
    '営業支援の調査では，年間取引の実績も推定購買規模も小さい取引先を抽出して，取引開始直後の顧客が含まれるかを確かめる。',
    '年間取引実績が多い一方で推定購買規模が小さい取引先を抽出し，推定データの漏れがないかを調べる。',
  ];
  const choices = index === 0 ? [...source[71].choices!] : [...'ABCD'].map(region => '領域' + region + 'の取引先を優先して確認する。');
  const why = [
    '領域Aでは年間購買推定金額が多いのに，自社との取引実績は少ない。取引を増やせる余地が大きく，営業を強化する対象として適している。',
    '領域Bはグラフの右上で，自社との取引実績と推定購買規模がともに大きい。既存の主要顧客を維持する条件に合う。',
    '領域Cは左下で，二つの金額がともに小さい。対象企業が取引開始直後かどうかは，抽出した後に別の資料で確認する。',
    '領域Dは右下にあり，自社との取引実績が大きく，推定購買規模は小さい。今回の調査条件はこの領域に当たる。',
  ][index];
  return { prompt: [p(source[71].prompt.split('。')[0] + '。' + conditions[index] + '今後の営業方針に関する記述のうち，適切なものはどれか。'),
    draw(salesAxisFigure, index, '購買推定額と取引実績額の四領域')], choices: strings(choices), correctIndex: index, explanation: why };
}

const breakEvenCases = [[5, 10000, 2000, 6000], [4, 8000, 1000, 4000], [6, 12000, 3000, 6000], [5, 15000, 4000, 9000]];
function profit(index: number): GeneratedBody {
  const [unitPrice, sales, fixed, variable] = breakEvenCases[index];
  const previousProfit = sales - fixed - variable;
  const currentCount = sales / unitPrice;
  const margin = unitPrice - variable / currentCount;
  const target = previousProfit * 2;
  const minimum = Math.ceil((target + fixed) / margin);
  const choices = index === 0 ? [...source[73].choices!] : [
    currentCount + previousProfit / unitPrice, Math.ceil(target / margin), minimum, 2 * currentCount,
  ].sort((a, b) => a - b).map(numberText);
  return {
    prompt: [p(source[73].prompt.replace('5千円', unitPrice + '千円') +
      (index === 0 ? '' : ' 来期も固定費と1個当たりの変動費は当期と同じとする。')),
      table('当期の売上高・費用・利益（単位 千円）', ['項目', '金額'], [
        ['売上高', numberText(sales)], ['費用', ''], ['固定費', numberText(fixed)], ['変動費', numberText(variable)], ['利益', numberText(previousProfit)],
      ])],
    choices: strings(choices), correctIndex: uniqueIndex(choices.map(choice => choice === numberText(minimum))),
    explanation: '当期の販売個数は' + numberText(currentCount) + '個で，1個当たりの変動費は' + (variable / currentCount) +
      '千円。販売1個当たりの限界利益は' + margin + '千円である。固定費' + numberText(fixed) + '千円と目標利益' +
      numberText(target) + '千円を賄う最少個数は（' + numberText(fixed) + '＋' + numberText(target) +
      '）÷' + margin + '＝' + numberText(minimum) + '個である。',
  };
}

function criticalPath(index: number): GeneratedBody {
  const edges = activityEdges(index);
  const finish = Array<number>(8).fill(0);
  const path = Array<string>(8).fill('');
  for (let node = 2; node <= 7; node++) {
    for (const edge of edges.filter(edge => edge.to === node)) {
      const end = finish[edge.from] + edge.days;
      if (end > finish[node]) {
        finish[node] = end;
        path[node] = [path[edge.from], edge.name || 'ダミー'].filter(Boolean).join('→');
      }
    }
  }
  const route = (names: string) => [...names].reduce((days, name) => days + edges.find(edge => edge.name === name)!.days, 0);
  const choices = index === 0 ? [...source[75].choices!] :
    [...new Set(['AE', 'BDF', 'CDF', 'BDG', 'CDG'].map(route))].sort((a, b) => a - b).slice(-4).map(String);
  return {
    prompt: [p(source[75].prompt), draw(criticalPathFigure, index, 'アローダイアグラム')],
    choices: strings(choices), correctIndex: uniqueIndex(choices.map(option => Number(option) === finish[7])),
    explanation: '各結合点に入る経路のうち，所要日数が最も大きいものを順に求める。ダミー作業は0日である。終点7までのクリティカルパスは' +
      path[7] + 'で，総所要日数は' + finish[7] + '日になる。',
  };
}

function quality(index: number): GeneratedBody {
  const listing = index === 0 ? '' : ' 要因別の件数は' + qualityCounts[index].map((count, i) =>
    '要因' + 'PQRST'[i] + 'が' + count + '件').join('，') + 'である。';
  return { prompt: [p(source[76].prompt + listing)],
    choices: qualityChoiceFigures.map((definition, position) => [draw(definition, index, '選択肢' + letters[position] + 'の図')]),
    correctIndex: uniqueIndex(qualityChoiceFigures.map((_, position) => qualityChart(index, position).type === 0)),
    explanation: 'パレート図は要因別件数を多い順に棒で並べ，左から加えた累積割合を折れ線で示す。これによって，どの要因が多く，対策を上位に絞ると全体のどれほどになるかを同じ図から読める。',
  };
}

const investments = [
  [[20, 10, 15], [25, 5, 20], [30, 20, 5], [40, 10, -10]],
  [[20, 5, 15], [25, 12, 18], [30, 20, 8], [40, 10, -10]],
  [[15, 8, 14], [24, 10, 16], [26, 20, 12], [38, 15, -5]],
  [[22, 9, 16], [28, 8, 21], [31, 12, 7], [35, 18, 14]],
];
function maximin(index: number): GeneratedBody {
  const stocks = [...'ABCD'];
  const matrix = investments[index];
  const minima = matrix.map(row => Math.min(...row));
  const correctIndex = uniqueIndex(minima.map(minimum => minimum === Math.max(...minima)));
  return {
    prompt: [p(source[77].prompt), table('予想値上がり幅（単位 円）', ['株式＼経済の成長', '高', '中', '低'],
      matrix.map((row, i) => [stocks[i], ...row.map(String)]))],
    choices: strings(stocks), correctIndex,
    explanation: '各株式で最も不利な経済成長時の値上がり幅を求める。A〜Dの最小値は順に' + minima.join('，') +
      '円で，そのうち最大の' + minima[correctIndex] + '円を確保する株式' + stocks[correctIndex] + 'を選ぶ。',
  };
}

const machineTimes = [
  [[7, 3], [5, 6], [4, 2]], [[2, 3], [4, 2], [5, 7]], [[3, 2], [2, 4], [5, 7]], [[3, 2], [5, 3], [7, 4]],
];
function machines(index: number): GeneratedBody {
  const products = [...'ABC'];
  const times = machineTimes[index];
  const choices = source[78].choices!;
  const finished = choices.map(order => {
    let m1 = 0, m2 = 0;
    for (const product of order.split('→')) {
      const [first, second] = times[products.indexOf(product)];
      m1 += first;
      m2 = Math.max(m1, m2) + second;
    }
    return m2;
  });
  const correctIndex = uniqueIndex(finished.map(value => value === Math.min(...finished)));
  return {
    prompt: [p(source[78].prompt), table('各製品の加工に要する時間', ['製品＼機械', 'M1', 'M2'],
      times.map((row, i) => [products[i], ...row.map(String)]))],
    choices: strings([...choices]), correctIndex,
    explanation: 'M2では対象製品のM1加工と，前の製品のM2加工の両方が終わってから開始できる。ア〜エの終了時刻は順に' +
      finished.join('，') + 'であり，最短となる加工順序は' + choices[correctIndex] + 'である。',
  };
}

const structured: Record<number, { notes: string; build(index: number): GeneratedBody }> = {
  56: { notes: '同じ3表と8属性・関数従属図を保持。単独従属と複合従属に割り当てる属性を変更する。', build: normalization },
  57: { notes: '三つの基礎表，実線・破線のキー指定と四つの関係図を保つ。診察記録・医師の予約枠・当番枠・診療科の予約で必要な情報を切り替える。', build: clinic },
  58: { notes: '社員表，非NULL，人数未満の比較と四つのSQL役割を固定。職務と人数のしきい値を変え，0人を含む部署を独立したSQL実行で確認する。', build: sql },
  59: { notes: '3ジョブと3資源を維持し，ロックの組合せと先行・後続ジョブを変更する。', build: locking },
  65: { notes: 'クライアント・サーバ・接続プログラムの経路図と四対策を固定。対策する事象を変える。', build: protection },
  66: { notes: '脅威と対策の2列表と四択を保持。誤操作・災害・盗聴・改ざんごとの状況と対策の組を変える。', build: threatPair },
  71: { notes: '縦軸・横軸・四領域の図と営業判断を保持し，購入見込みと既存取引から抽出する目的を切り替える。', build: sales },
  73: { notes: '千円単位，売上高・固定費・変動費・利益と2倍の目標を保持。販売単価と費用を変更し，丸めを増やさず原問と同程度の計算を行う。', build: profit },
  75: { notes: '同じ7結合点・7作業・2ダミーと整数の日数を保持。作業時間を変え，終点までのクリティカルパスを検算する。', build: criticalPath },
  76: { notes: '棒と折れ線の四つの形を保つ。生成版は件数を本文に表示し，各図の棒・要因順・折れ線を変えて累積割合の妥当性を比較する。', build: quality },
  77: { notes: '4株式・3条件・円単位を保持。負の値も含む値上がり幅を変更し，最悪条件の比較で一意に選ぶ。', build: maximin },
  78: { notes: '3製品のM1→M2順，準備時間なし，機械の並行稼働を保持。加工時間を変え，独立検算で全6順列から最短を確認する。', build: machines },
};

export const legacy2008SpringAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const model = structured[Number(number)];
  const reviewed = knowledge[Number(number)];
  return {
    source: '2008h20h-fe-am-' + number, title: original.title, sourceAnswer: original.key,
    version: '3.7.0', fields: [field('問いの対象・判断条件', 0, 3)], reference: [0],
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (model?.notes ?? reviewed.notes),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2008年度春期旧午前の入力が範囲外です');
      if (model) return model.build(index);
      const selected = index === 0
        ? { ...original, correctIndex: letters.indexOf(original.key), explanation: reviewed.explanation }
        : reviewed.variants[index - 1];
      return { prompt: [p(selected.prompt)], choices: strings([...selected.choices!]),
        correctIndex: selected.correctIndex, explanation: selected.explanation };
    },
  };
});
