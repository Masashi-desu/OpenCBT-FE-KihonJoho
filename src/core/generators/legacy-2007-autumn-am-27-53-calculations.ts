import { list, p, strings } from './definition';
import { legacy2017DirectoryChoices, legacy2017DirectoryTargets } from './legacy-2017-computing-models';
import { drawing, projectCases, projectEdges, projectActivities } from './legacy-2007-autumn-am-27-53-figures';
import { finite, original } from './legacy-2007-autumn-am-27-53-shared';

const printerCases = [[5, 12, 4, 3, 10, 4], [5, 3, 4, 9, 3, 6], [5, 3, 4, 9, 6, 3], [5, 3, 4, 6, 9, 3]] as const;
const printerOrders = original(28).choices;
const printer = finite(28, '出力待ち6件を割り当てる印刷時間',
  '初期状態は全台空き。同一3台，Aから循環順，6件，総印刷時間の順位と元の順位選択肢を維持。最初の割当て以後に複数候補が同時に空く例を外し，循環順を開始ごとに読む場合と再開する場合でも選択肢の順位が同じ。',
  index => {
    const durations = printerCases[index];
    const freeAt = [0, 0, 0], totals = [0, 0, 0];
    const steps: string[] = [];
    let currentTime = 0, cursor = 0;
    for (const duration of durations) {
      currentTime = Math.max(currentTime, Math.min(...freeAt));
      const offset = [0, 1, 2].find(step => freeAt[(cursor + step) % 3] <= currentTime)!;
      const device = (cursor + offset) % 3;
      steps.push('ABC'[device] + '（' + currentTime + '分）');
      freeAt[device] = currentTime + duration;
      totals[device] += duration;
      cursor = (device + 1) % 3;
    }
    const order = [0, 1, 2].sort((a, b) => totals[b] - totals[a]).map(device => 'ABC'[device]).join('，');
    return { prompt: [p(original(28).prompt.replace('5，12，4，3，10，4', durations.join('，')))], choices: strings(printerOrders),
      correctIndex: printerOrders.indexOf(order), explanation: '順に印刷を開始する機器と開始時刻は' + steps.join('，') +
        'である。各機器の印刷時間の合計はAが' + totals[0] + '分，Bが' + totals[1] + '分，Cが' + totals[2] + '分なので，長い順は' + order + '。' };
  });

const directoryRules = [
  '“ディレクトリ名¥…¥ディレクトリ名”のように，経路上のディレクトリ名と目的のディレクトリ名を，順に“¥”で区切って指定する。',
  'カレントディレクトリは，“.”で表す。',
  '1階層上のディレクトリは，“..”で表す。',
  '始まりが“¥”のときは，左端にルートディレクトリが省略されているものとする。',
  '始まりが“¥”，“.”，“..”のいずれでもないときは，左端にカレントディレクトリ配下であることを示す“.¥”が省略されているものとする。',
];
const directory = finite(30, '移動後の絶対ディレクトリ',
  '図の三階層の木，元の移動列と5規則を保持する。移動目標を変え，同じ名前でも親が異なる点を検算する。',
  index => {
    const target = legacy2017DirectoryTargets[index];
    return { prompt: [p(original(30).prompt.replace('¥B¥A¥B', target)), p('〔ディレクトリ指定方法〕'), list(directoryRules, true), drawing('directory', 0)],
      choices: strings(legacy2017DirectoryChoices), correctIndex: index,
      explanation: '“¥”はルートからの指定，“.”は現在の位置，“..”は現在位置の一つ上を表す。各移動列の終点は左から順に' +
        legacy2017DirectoryTargets.join('，') + 'となる。このうち指定の' + target + 'に一致するものを選ぶ。' };
  });

const ratioCases = [
  { mtbf: '1.5', mttr: '1.5', order: [2, 0, 3, 1] },
  { mtbf: '1.5', mttr: '0.5', order: [2, 0, 3, 1] },
  { mtbf: '0.5', mttr: '1.5', order: [3, 0, 1, 2] },
  { mtbf: '0.5', mttr: '0.5', order: [0, 1, 2, 3] },
] as const;
const ratio = finite(33, '平均故障間隔・平均修理時間の倍率',
  'x時間とy時間を保ったまま変更倍率だけを変え，同じ・上昇・低下・倍率を直掛けする誤りを比べる。',
  index => {
    const { mtbf, mttr, order } = ratioCases[index];
    const stem = index === 0 ? original(33).prompt : '平均故障間隔がx時間，平均修理時間がy時間のシステムがある。使用条件が変わったので，平均故障間隔が従来の' +
      mtbf + '倍，平均修理時間が従来の' + mttr + '倍になった。新しい使用条件での稼働率はどうなるか。ここで，xとyはともに正とする。';
    const answers = [index === 3 ? '従来の稼働率は維持される。' : '従来の稼働率と同じ値である。', '従来の稼働率より必ず大きい値になる。', '従来の稼働率より必ず小さい値になる。',
      'x，yの値にかかわらず，従来の稼働率に平均故障間隔の倍率を掛けた値になる。'];
    const relation = Number(mtbf) === Number(mttr) ? 0 : Number(mtbf) > Number(mttr) ? 1 : 2;
    return { prompt: [p(stem)], choices: strings(index === 0 ? original(33).choices : order.map(key => answers[key])),
      correctIndex: index === 0 ? 1 : order.findIndex(key => key === relation),
      explanation: '元の稼働率は x／(x＋y)，新しい稼働率は ' + mtbf + 'x／(' + mtbf + 'x＋' + mttr + 'y)。新しい式の分子・分母を' +
        mtbf + 'で割ると，x／(x＋(' + mttr + '／' + mtbf + ')y)となる。したがって' + answers[relation] };
  });

const availability = finite(34, '各コンピュータの共通の稼働率',
  'A・Bの並列，Cの直列と4択の接続解釈を維持。生成で装置の稼働と停止が独立であることを明示する。原問は依存関係の指定を欠くが，0.6〜0.8の実現可能範囲に入る提示選択肢はイだけ。',
  index => {
    const up = [8, 7, 9, 6][index], down = 10 - up;
    const values = [up ** 3, (100 - down ** 2) * up, 1000 - (100 - up ** 2) * down, 1000 - down ** 3];
    const choices = values.map(value => (value / 1000).toFixed(3));
    return { prompt: [p(original(34).prompt.replace('0.8', String(up / 10)) + ' 各コンピュータの稼働・停止は互いに独立とする。'),
      drawing('availability', 0)], choices: strings(choices), correctIndex: 1,
      explanation: 'AとBの少なくとも一方が稼働し，かつCが稼働することが必要である。独立ならA・Bが共に停止する確率は' +
        (down / 10) + '²なので，システム全体は {1−' + (down / 10) + '²}×' + (up / 10) + '＝' + choices[1] + '。' +
        (index === 0 ? '原問題では独立条件が明示されていないが，全体稼働はCの稼働に含まれて0.8以下であり，少なくともAとCが稼働する確率以上なので0.6以上である。この範囲に入る元の選択肢は0.768だけである。' : '') };
  });

const recovery = finite(35, 'バックアップサイトの順序を決める条件',
  'ホット・ウォーム・コールドの3項順序を答える4択を保持し，復旧時間の昇降と，非常時の機材・回線条件を変える。',
  index => {
    const source = original(35);
    const cases = [
      [source.prompt, 3, 'ホットサイトは切替えに必要な設備や環境を整えている。ウォームサイトは一部の準備が必要で，コールドサイトは環境の構築から始めるため一般に最も時間がかかる。'],
      [source.prompt.replace('時間が短い順', '時間が長い順'), 2, '長い順では，環境の準備から始めるコールド，一部が用意されたウォーム，すぐ切替えやすいホットの順になる。'],
      ['ウォームサイト，コールドサイト，ホットサイトから災害復旧先を選ぶ。切替えに掛かる作業全体に加え，今回だけホットサイトに2時間の起動待ち，ウォームサイトに1時間の機材移送，コールドサイトに5時間の設備設置が必要となる。残りの復旧作業時間は3サイトで等しい。復旧時間が短い順に並べたものはどれか。', 1, '共通の復旧作業時間を加えるので，前作業の1時間，2時間，5時間の順で比較できる。ウォーム，ホット，コールドの順である。'],
      ['バックアップサイトをウォームサイト，コールドサイト，ホットサイトの3種類に分類する。今回の障害に限り，ウォームサイトは4時間，コールドサイトは機材搬入に7時間，ホットサイトは仮設回線到着まで18時間を要し，残りの切替時間は各サイトで等しい。復旧までの時間が短い順に並べたものはどれか。', 0,
        '共通の切替時間を足す前の待ち時間で比較できる。4時間のウォーム，7時間のコールド，18時間のホットの順である。'],
    ] as const;
    const [stem, correctIndex, explanation] = cases[index];
    return { prompt: [p(stem)], choices: strings(source.choices), correctIndex, explanation };
  });

const chartOptions = [
  original(47).choices,
  ['未消化項目も未解決バグも残り，テストは止まっている。', 'テスト項目の消化を続けている間に，新しいバグの検出はなくなり，未解決バグが減っている。', 'バグが多発し，テスト項目を消化できない状態である。', 'バグを解決していないので，未解決バグが増えている。'],
  ['解決が進まず，新しいバグも検出されていない。', '未消化項目が減少しているが，バグは検出されていない。', '新たに検出するバグが増えている一方，未消化テスト項目が減らず，未解決バグも増えている。', '検出したバグを全て解決できており，未解決バグは0である。'],
  ['未消化項目が残り，新しいテストは進んでいない。', '未消化項目は減っているが，バグの検出は止まっている。', '新しいバグの検出と一緒に，未解決バグも増えている。', 'テストを消化しながら新しいバグも検出しているが，解決も進み，未解決バグは残っていない。'],
] as const;
const chart = finite(47, '管理図の右端で変化する三つの系列',
  '二つの縦軸と時間，三つの曲線，曲線の推移から状況を推測する4択を保持。未消化，検出，未解決の右端に異なる傾向を与える。',
  index => {
    const explanation = [
      '未消化項目が残ったまま減らず，検出されたバグの累計も変わらない。未解決バグも残るので，提示された中ではバグ解決待ちで試験が止まった可能性が整合する。図だけから停止の原因までは確定できない。',
      '未消化項目が減るので試験は進んでいる。検出バグ累計が横ばいで未解決が減るので，新たに検出せず既存バグを解決している。',
      '検出バグ累計と未解決バグが増加するが，未消化の項目数は変わらない。テストの進捗が止まり，検出に解決が追い付いていない。',
      '未消化項目は減少し，累計の検出バグ数は増加している。未解決数は0のままなので，増えたバグも解決されている。',
    ][index];
    return { prompt: [p(index === 0 ? original(47).prompt : 'プログラムテストの管理図が図のように推移した。図の右端の状況から推測できることとして，適切なものはどれか。'),
      drawing('control-chart', index)], choices: strings([...chartOptions[index]]), correctIndex: index, explanation };
  });

function projectDuration(days: readonly number[]): { total: number; path: string } {
  const current = Array.from({ length: 7 }, () => ({ finish: 0, path: '' }));
  for (const event of [0, 1, 3, 2, 4, 5]) for (const [before, after, activity] of projectEdges) {
    if (before !== event) continue;
    const duration = activity === -1 ? 0 : days[activity];
    const finish = current[before].finish + duration;
    if (finish > current[after].finish)
      current[after] = { finish, path: current[before].path + (activity === -1 ? '→ダミー' : (current[before].path ? '→' : '') + projectActivities[activity]) };
  }
  return { total: current[6].finish, path: current[6].path };
}
const project = finite(48, '標準日数と短縮後の作業Dの所要日数',
  'A〜Hとダミーによる先行関係，Dだけ短縮する条件，総工期の短縮幅の昇順4択を保持。',
  index => {
    const { days, newD } = projectCases[index];
    const before = projectDuration(days), after = projectDuration(days.map((days, activity) => activity === 3 ? newD : days));
    const choices = original(48).choices;
    return { prompt: [p(original(48).prompt.replace('6日間', newD + '日間')), drawing('arrow-diagram', index)], choices: strings(choices),
      correctIndex: choices.indexOf(String(before.total - after.total)),
      explanation: '結節点は，そこに入る全作業が終わってから先へ進める。ダミーの所要日数は0日。全体の最長経路は変更前が' + before.path + 'の' +
        before.total + '日，変更後が' + after.path + 'の' + after.total + '日。差の' + (before.total - after.total) + '日だけ短縮できる。' };
  });
export const calculationDefinitions = [printer, directory, ratio, availability, recovery, chart, project];
