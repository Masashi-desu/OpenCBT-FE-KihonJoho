import { code, figure, p, strings, table } from './definition';
import { finite2012SpringAm2753 as finite, grouped, original } from './legacy-2012-spring-am-27-53-shared';
import {
  spring2012Am2753Profiles as profiles, spring2012Projection, spring2012Projections, spring2012RelationAlt,
  spring2012Redundancy, spring2012RedundancyCases, spring2012RedundancyAlt, spring2012ProjectAlt,
  spring2012ProjectCases, spring2012ProjectDummy, spring2012ProjectDurations, spring2012ProjectEdges,
} from './legacy-2012-spring-am-27-53-figures';

const productCatalog: [string, string][] = [
  ['P1', 'PC'], ['P2', 'テレビ'], ['P3', '掃除機'], ['P4', '冷蔵庫'], ['P5', 'エアコン'], ['P6', '電話機'], ['P7', '時計'],
];
const dates = ['2011-04-10', '2011-04-15', '2011-04-22', '2011-04-30', '2011-05-06', '2011-05-08'];
const orders = [
  [['P2', 120], ['P1', 100], ['P4', 50], ['P8', 80], ['P1', 100], ['P3', 70]],
  [['P3', 40], ['P2', 80], ['P9', 60], ['P4', 150], ['P2', 80], ['P1', 40]],
  [['P5', 60], ['P7', 50], ['P4', 20], ['P8', 80], ['P5', 60], ['P2', 100]],
  [['P0', 20], ['P1', 50], ['P2', 70], ['P3', 90], ['P4', 110], ['P2', 70]],
] as const;
const orderSql = 'SELECT 製品名, 数量 FROM 注文, 製品\n    WHERE 注文.製品コード = 製品.製品コード';
const resultColumns = ['製品名', '数量'];

export const equijoin = finite(30, '製品コードと注文数量', orders.length,
  '2表の結合列、SQLの条件、表による4候補の構成を保つ。対象行・製品コード・数量を同時に変え，重複を除く・合計する・保持する・不一致をNULLで残すという誤答モデルを保つ。',
  index => {
    const source = original(30);
    const matched = new Map(productCatalog);
    const joined = orders[index].flatMap(([id, quantity]) => {
      const name = matched.get(id);
      return name === undefined ? [] : [[name, quantity]];
    });
    const unique = new Map(joined.map(([name, quantity]) => [String(name), Number(quantity)]));
    const summed = new Map<string, number>();
    for (const [name, quantity] of joined) summed.set(String(name), (summed.get(String(name)) ?? 0) + Number(quantity));
    const leftJoined = orders[index].map(([id, quantity]) => [matched.get(id) ?? 'NULL', quantity]);
    const duplicate = joined.findIndex(([name], row) => joined.findIndex(other => other[0] === name) !== row);
    const [repeatName, repeatQuantity] = joined[duplicate];
    const missing = orders[index].find(([id]) => !matched.has(id))![0];
    return {
      prompt: [p(source.prompt), code(orderSql, 'sql'),
        table('注文', ['日付', '製品コード', '数量'], orders[index].map(([id, quantity], row) => [dates[row], id, String(quantity)])),
        table('製品', ['製品コード', '製品名'], productCatalog)],
      choices: [[...unique], [...summed], joined, leftJoined].map(rows => [
        { ...table('検索結果', resultColumns, rows.map(row => row.map(String))), captionPresentation: 'accessible' },
      ]),
      correctIndex: 2,
      explanation: 'SQL（Structured Query Language、構造化照会言語）の等値結合では，製品コードが一致する注文行だけが残る。'
        + missing + 'には対応する製品がないので除外する。' + repeatName + 'の数量' + repeatQuantity +
        'の行は2件とも残る。重複の除去や数量の集計は指定しておらず，不一致行をNULLにする外部結合でもない。ORDER BYがないので表の行の表示順そのものは保証されない。',
    };
  });

export const projection = finite(31, '投影する列の組合せ', spring2012Projections.length,
  '表Rの列見出しのみの1行とSELECT文を保持し，列集合を変更する。2表が必要な演算に変えると原資料の単一表・見出し1行が崩れるため正答は射影のまま。', index => {
    const { columns, selected } = spring2012Projection([index]);
    const names = selected.map(column => columns[column]);
    return {
      prompt: [p(original(31).prompt), figure(profiles.relation, [index], '表Rの列見出し', spring2012RelationAlt([index])),
        p('〔SQL文〕'), code('SELECT ' + names.join(', ') + ' FROM R', 'sql')],
      choices: strings(original(31).choices),
      correctIndex: 2,
      explanation: 'SQL（Structured Query Language、構造化照会言語）のSELECTで表Rから' + names.join('，')
        + 'の列だけを取り出す演算は射影である。結合・差・直積は表同士を扱う演算である。SQLではDISTINCTを指定しないので重複行を保持する点が，集合としての関係代数と異なる。',
    };
  }, true);

const transfers = [[10, 100000, 50], [12, 160000, 60], [16, 200000, 80], [18, 240000, 50]] as const;
export const transferTime = finite(34, 'データ量・伝送速度・効率', transfers.length,
  '10進のMバイトと1バイト8ビットを維持する。原候補と同じくビット換算漏れ，効率を乗じる誤り，効率を無視する誤り，実効速度による正解の順。計算は整数秒で完結する。', index => {
    const [volume, speed, percent] = transfers[index];
    const rate = speed * percent / 100;
    const theoretical = volume * 8_000_000 / speed;
    const duration = volume * 8_000_000 / rate;
    return {
      prompt: [p(index === 0 ? original(34).prompt
        : volume + 'Mバイトのデータを' + grouped(speed) + 'ビット／秒の回線を使って転送するとき，転送時間は何秒か。ここで，回線の伝送効率を'
          + percent + '％とし，1Mバイト＝10⁶バイトとする。')],
      choices: strings([duration / 8, theoretical * percent / 100, theoretical, duration].map(grouped)),
      correctIndex: 3,
      explanation: '1バイトは8ビットなのでデータ量は' + grouped(volume * 8_000_000) + 'ビットである。実効速度は'
        + grouped(speed) + '×' + percent + '／100＝' + grouped(rate) + 'ビット／秒であり，これで割ると'
        + grouped(duration) + '秒になる。効率を使わないと転送時間を短く見積もってしまう。',
    };
  });

export const redundancy = finite(43, '二重化構成の切替動作', spring2012RedundancyCases.length,
  '元の構成と二重化された構成を並べる。死活監視付きの稼働・待機から同時稼働・停止待機へ構成を変える。二重化の効果を問う限り評価対象は可用性であり，別の特性が正答になる対策は元の構成比較を崩す。', index => {
    const { mode } = spring2012Redundancy([index]);
    const transition = mode === 'standby' ? '稼働側が停止すると待機側へ切り替えて'
      : mode === 'active' ? '片方の停止後も残る稼働サーバが要求に応えて'
      : '運用者が停止待機中の予備サーバを起動して';
    return {
      prompt: [p(original(43).prompt), figure(profiles.redundancy, [index], 'サーバ構成の二重化', spring2012RedundancyAlt([index]))],
      choices: strings(original(43).choices),
      correctIndex: 0,
      explanation: transition + 'サービスを継続・再開できるので，可用性が向上する。図の構成では，データの正確性を守る完全性，秘密を守る機密性，操作主体をたどれる責任追跡性を直接強化していない。',
    };
  }, true);

const projectChoices = original(52).choices;
export const criticalPath = finite(52, '各作業の所要日数', spring2012ProjectCases.length,
  '作業A〜G，ノード，0日のダミー矢印と四つの経路候補を維持する。全5経路の所要日数が整数で，提示候補に最長経路が1本だけある日数の組合せを許す。', index => {
    const durations = spring2012ProjectDurations([index]);
    const graph: { label: string; from: number; to: number; days: number }[] = spring2012ProjectEdges.map(
      ({ label, from, to }, i) => ({ label, from, to, days: durations[i] }),
    );
    graph.push({ label: '', ...spring2012ProjectDummy, days: 0 });
    const paths = (from: number): { work: string[]; days: number }[] => from === 5 ? [{ work: [], days: 0 }]
      : graph.filter(edge => edge.from === from).flatMap(edge => paths(edge.to).map(path => ({
        work: edge.label ? [edge.label, ...path.work] : path.work, days: edge.days + path.days,
      })));
    const routes = paths(0);
    const longest = routes.reduce((best, current) => current.days > best.days ? current : best);
    const label = longest.work.join(' → ');
    return {
      prompt: [p(original(52).prompt), figure(profiles.project, [index], 'アローダイアグラム', spring2012ProjectAlt([index]))],
      choices: strings(projectChoices),
      correctIndex: projectChoices.indexOf(label),
      explanation: 'ダミー作業は依存関係を表し所要日数は0日。開始から終了までの経路の日数は，'
        + routes.map(path => path.work.join(' → ') + 'が' + path.days + '日').join('，') +
        'である。全経路の中で最長の' + label + 'がクリティカルパスとなり，工期は' + longest.days + '日である。',
    };
  });

const designs = ['基本設計書', '概要設計書', '詳細設計書'];
const designColumns = ['設計書', '作成枚数（枚）', '1枚当たりの所要工数（人時）', '現在までの作成済み枚数（枚）'];
const efforts = [
  [[80, 5, 80], [300, 2, 200], [500, 2, 50]],
  [[60, 5, 50], [200, 2, 100], [400, 3, 100]],
  [[80, 4, 70], [260, 3, 200], [350, 2, 50]],
  [[90, 5, 90], [250, 3, 200], [460, 2, 80]],
] as const;
export const remainingEffort = finite(53, '設計書の枚数・作成済み枚数・単価工数', efforts.length,
  '設計書3種，整数枚数と整数人時，所要工数・作成済み枚数の列を固定する。残枚数合計，残工数が最大の種類のみ，残工数の合計，作成済みを控除しない全工数を昇順に保つ。', index => {
    const rows = efforts[index];
    const remaining = rows.map(([planned, , completed]) => planned - completed);
    const subtotals = rows.map(([, hours], i) => remaining[i] * hours);
    const total = subtotals.reduce((sum, hours) => sum + hours);
    return {
      prompt: [p(original(53).prompt), table('設計書の作成状況', designColumns, rows.map((row, i) => [designs[i], ...row.map(String)]))],
      choices: strings([remaining.reduce((sum, pages) => sum + pages), Math.max(...subtotals), total,
        rows.reduce((sum, [pages, hours]) => sum + pages * hours, 0)].map(String)),
      correctIndex: 2,
      explanation: '各設計書で作成済み枚数を引いてから1枚当たりの工数を掛ける。'
        + rows.map(([, hours], i) => designs[i] + 'は' + remaining[i] + '枚×' + hours + '人時＝' + subtotals[i] + '人時').join('，')
        + 'なので，今後必要な工数の合計は' + total + '人時である。',
    };
  });
