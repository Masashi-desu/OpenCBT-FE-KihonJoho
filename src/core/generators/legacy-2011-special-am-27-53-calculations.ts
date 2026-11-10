import { code, figure, p, strings, table } from './definition';
import {
  multiplicityAlt, multiplicityAt, profiles2011SpecialAm2753 as profiles, scheduleAlt, scheduleAt,
} from './legacy-2011-special-am-27-53-figures';
import { finite2011SpecialAm2753 as finite, grouped, original } from './legacy-2011-special-am-27-53-shared';

const quarters = ['第1期', '第2期', '第3期', '第4期'];
const salesCases = [
  { mean: 40000, floor: 30000, figures: [[29600, 31900, 36600, 41500], [43500, 45300, 30400, 46400], [49600, 39400, 42300, 51100]] },
  { mean: 35000, floor: 25000, figures: [[25000, 35000, 39000, 41000], [24900, 40000, 41000, 45100], [26000, 30000, 37500, 46000]] },
  { mean: 45000, floor: 32000, figures: [[32000, 45000, 48000, 55000], [31800, 50000, 51000, 56000], [34000, 43000, 50000, 52500]] },
  { mean: 50000, floor: 36000, figures: [[36000, 49000, 54000, 61000], [35800, 51000, 52000, 61300], [38100, 46300, 54100, 61000]] },
];

const productCases = [
  { margin: 40000, amounts: [[150000, 100000], [200000, 170000], [140000, 80000]], updates: [130000, 150000, 130000, 90000] },
  { margin: 35000, amounts: [[155000, 100000], [200000, 160000], [140000, 85000]], updates: [135000, 175000, 130000, 95000] },
  { margin: 50000, amounts: [[150000, 100000], [200000, 160000], [140000, 80000]], updates: [155000, 150000, 125000, 90000] },
  { margin: 45000, amounts: [[155000, 100000], [205000, 160000], [140000, 80000]], updates: [145000, 145000, 135000, 100000] },
];
const products = [['S001', 'T', 'T2003'], ['S003', 'S', 'S2003'], ['S005', 'R', 'R2003']];
const updateLocations = [[0, 0], [1, 1], [2, 0], [2, 1]] as const;
const serverCases = [
  ['Webサーバ', 80, 1024], ['HTTPSサーバ', 443, 49152],
  ['SSHサーバ', 22, 40000], ['SMTPサーバ', 25, 32768],
] as const;

function projectDays(values: number[], after: boolean) {
  const edges = scheduleAt(values, after);
  const remaining = new Set(edges.flatMap(({ from, to }) => [from, to]));
  const earliest = new Map<number, number>();
  while (remaining.size) {
    const next = [...remaining].find(node => edges.every(edge => edge.to !== node || !remaining.has(edge.from)));
    if (next === undefined) throw new Error('作業の依存関係に循環があります。');
    const end = Math.max(0, ...edges.filter(edge => edge.to === next).map(edge => earliest.get(edge.from)! + edge.days));
    earliest.set(next, end);
    remaining.delete(next);
  }
  return earliest.get(7)!;
}

export const calculationDefinitions = [
  finite(27, '受注額と担当者を対応付けるマスタ', 2,
    '当月の明細と過去3か月の集計値の粒度を固定する。担当者が結び付く顧客又は商品を変え，四つの明細構成から集計可能なものを求める。', index => {
      const source = original(27);
      const owner = index === 0 ? '顧客' : '商品';
      const monthlyFields = '前月受注額，2か月前受注額，3か月前受注額';
      const master = (name: string) => [name + 'マスタファイル',
        name + 'コード，名称，' + (owner === name ? '担当者コード，' : '') + monthlyFields,
        owner === name ? '各' + name + 'の担当者は1人' : '―'];
      return {
        prompt: [p(source.prompt + (index === 0 ? '' : ' 表にある担当者の対応は，対象の4か月間で変わらないものとする。')),
          table('各ファイルの項目', ['ファイル', '項目', '備考'], [
            master('顧客'), master('商品'), ['担当者マスタファイル', '担当者コード，氏名', '―'],
            ['当月受注ファイル', '顧客コード，商品コード，受注額', '当月の合計受注額'],
          ])],
        choices: strings(source.choices),
        correctIndex: owner === '顧客' ? 3 : 2,
        explanation: '当月には顧客と商品の組合せ別の受注額がある。過去3か月の額は顧客別と商品別の合計だけで，顧客と商品の組合せ別には戻せない。' +
          owner + 'のマスタに担当者コードがあるので，' + owner + '別の額に担当者を対応付けることができる。もう一方の区分と担当者を組み合わせた過去実績は復元できない。',
      };
    }),
  finite(29, '関連両端の多重度', 4, '組織と社員の関連で，下限0と1，上限1と*を組み合わせて変える。', index => {
    const source = original(29);
    const [organization, employee] = multiplicityAt([index]);
    const criteria = [
      employee.startsWith('1'), organization.startsWith('0'), organization.endsWith('*'), employee.endsWith('1'),
    ];
    return {
      prompt: [p(source.prompt), figure(profiles.multiplicity, [index], '組織と社員の関連', multiplicityAlt([index]))],
      choices: strings(source.choices), correctIndex: criteria.indexOf(true),
      explanation: '関連端の多重度は反対側の要素1件から見た対応数である。社員1人に対応する組織数は' + organization +
        '，組織1件に対応する社員数は' + employee + 'なので，アからエの判定は順に' +
        criteria.map(value => value ? '正' : '誤').join('，') + 'となる。',
    };
  }),
  finite(30, '平均・各期の販売金額の基準', salesCases.length,
    '万円で提示する二つの下限と千円の売上を連動させる。四半期とSQLの条件行・継続行・四つの論理式を保持する。', index => {
      const source = original(30);
      const { mean, floor, figures } = salesCases[index];
      const employees = [['123', '山田 一郎'], ['594', '鈴木 太郎'], ['612', '佐藤 花子']];
      return {
        prompt: [p(source.prompt.replace('4,000万円', grouped(mean / 10) + '万円').replace('3,000万円', grouped(floor / 10) + '万円')),
          table('販売実績', ['番号', '名前', ...quarters],
            [...figures.map((amounts, i) => [...employees[i], ...amounts.map(grouped)]), ['⋮', '⋮', '⋮', '⋮', '⋮', '⋮']])],
        choices: source.choices.map(statement => [code(statement.replace(/160000|40000|30000/g, token =>
          String(token === '160000' ? 4 * mean : token === '40000' ? mean : floor)), 'sql')]),
        correctIndex: 3,
        explanation: '金額の単位は千円である。4期の平均が' + grouped(mean) + '以上である条件は，4期の合計が' + grouped(mean * 4) +
          '以上であることと同じである。さらに各期が' + grouped(floor) +
          '以上でなければならないので，5条件をANDで結ぶ。アは一部を満たすだけで通過し，イは合計を平均の基準と比較し，ウはORによる別の条件になる。',
      };
    }),
  finite(31, '収益条件と商品表の更新値', productCases.length,
    '更新前の表，利益の下限，4種類の更新値を同時に変更し，行数の増加・不変・減少と下限ちょうどを扱う。', index => {
      const { margin, amounts, updates } = productCases[index];
      const included = (sale: number, cost: number) => Number(sale - cost >= margin);
      const before = amounts.reduce((count, [sale, cost]) => count + included(sale, cost), 0);
      const after = updateLocations.map(([row, column], i) => {
        const [sale, cost] = amounts[row];
        const newSale = column === 0 ? updates[i] : sale;
        const newCost = column === 1 ? updates[i] : cost;
        return before - included(sale, cost) + included(newSale, newCost);
      });
      const view = 'CREATE VIEW 収益商品\n     AS SELECT * FROM 商品\n       WHERE 売値 - 仕入値 >= ' + margin;
      return {
        prompt: [p(original(31).prompt), table('商品', ['商品コード', '品名', '型式', '売値', '仕入値'],
          products.map((product, i) => [...product, ...amounts[i].map(grouped)])), p('〔ビュー定義〕'), code(view, 'sql')],
        choices: strings(updateLocations.map(([row, column], i) =>
          '商品コードが' + products[row][0] + 'の' + (column === 0 ? '売値' : '仕入値') + 'を' + grouped(updates[i]) + 'に更新する。')),
        correctIndex: after.findIndex(count => count < before),
        explanation: '収益商品には売値から仕入値を引いた額が' + grouped(margin) + '以上の行が入る。更新前は' + before +
          '行で，それぞれを独立して更新するとアからエの順に' + after.join('，') + '行になる。条件に入っていた行が外れる更新だけで行数が減る。',
      };
    }),
  finite(44, 'サーバとクライアントのポート範囲', serverCases.length,
    'アクセス先のサービスとTCPのポート番号，クライアント側の許容範囲を変更する。4候補の送受信方向と2行の表構成を保持する。', index => {
      const source = original(44);
      const [server, port, clientMinimum] = serverCases[index];
      const serverPort = String(port), clientRange = clientMinimum + '以上';
      const rules = [
        [serverPort, clientRange, serverPort, clientRange],
        [serverPort, clientRange, clientRange, serverPort],
        [clientRange, serverPort, serverPort, clientRange],
        [clientRange, serverPort, clientRange, serverPort],
      ];
      return {
        prompt: [p(source.prompt.replace('Webサーバ（ポート番号80）', server + '（ポート番号' + port + '）') +
          (index === 0 ? '' : ' ここで，PCはTCPのポート番号' + clientRange + 'を使って通信を開始する。'))],
        choices: rules.map(([requestSource, requestDestination, replySource, replyDestination]) => [
          table('許可するルール', ['送信元', 'あて先', '送信元ポート番号', 'あて先ポート番号'], [
            ['PC', server, requestSource, requestDestination],
            [server, 'PC', replySource, replyDestination],
          ]),
        ]),
        correctIndex: 2,
        explanation: '要求ではPCのポート（' + clientRange + '）からサーバのポート（' + serverPort + '）へ送る。応答では送信元とあて先が逆になる。アとイは要求の向きが違い，エは応答の向きが違う。',
      };
    }),
  finite(51, '作業Eと分割作業の所要日数', 4,
    '元の作業Eの所要日数をE1・E2・E3へ配分する。E2の終了点からE1の終了点へのダミー作業を両作業の完了を待つ条件として維持する。数字の選択肢は昇順。', index => {
      const source = original(51);
      const before = projectDays([index], false), after = projectDays([index], true);
      const byName = new Map(scheduleAt([index], true).map(edge => [edge.name, edge.days]));
      return {
        prompt: [p(source.prompt),
          figure(profiles.before, [index], '図1 当初の計画', scheduleAlt([index], false)),
          figure(profiles.after, [index], '図2 変更後の計画', scheduleAlt([index], true))],
        choices: strings(source.choices), correctIndex: before - after - 1,
        explanation: 'ダミー作業の日数は0で，E3の開始にはE1とE2の両方の完了が必要である。したがって分割部分はmax(' +
          byName.get('E1') + '，' + byName.get('E2') + ')＋' + byName.get('E3') +
          '日となる。変更前後で全経路の最長所要日数を取り直すと，' + before + '日から' + after + '日となり，' +
          (before - after) + '日短縮される。',
      };
    }),
];
