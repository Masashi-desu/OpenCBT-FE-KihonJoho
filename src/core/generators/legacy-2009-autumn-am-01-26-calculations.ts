import { p } from './definition';
import { body, define, formula, source, textBody } from './legacy-2009-autumn-am-01-26-shared';
import { autumn2009AmDiagram } from './legacy-2009-autumn-am-01-26-figures';

const rounding = define(1, '平均値の表示桁', 4,
  '正の和と床関数を保持する。選択肢は補正量の昇順を保ち、求める小数位と前後の倍率を連動させる。', index => {
    const places = ['整数', '小数第1位までの値', '小数第2位までの値', '小数第3位までの値'];
    const prompt = index === 0 ? source[1].prompt :
      'N個の観測値の平均値を算出する式はどれか。ここで，SはN個の観測値の和（ただし，S＞0）とし，[X]はX以下で最大の整数とする。また，平均値は，小数第' + (index + 1) + '位を四捨五入して' + places[index] + 'として求める。';
    const scale = 10 ** index;
    const choices = ['-0.5', '-0.4', '+0.4', '+0.5'].map(offset => {
      const operator = offset[0] === '-' ? '－' : '＋';
      const visibleOffset = operator + offset.slice(1);
      const scaled = index === 0 ? '' : '\\times ' + scale;
      const term = '\\left[\\frac{S}{N}' + scaled + offset + '\\right]';
      return {
        type: 'formula' as const,
        format: 'latex' as const,
        text: index === 0 ? term : '\\frac{' + term + '}{' + scale + '}',
        alt: index === 0 ? '[S/N' + visibleOffset + ']' : '[(S/N)×' + scale + visibleOffset + ']/' + scale,
      };
    });
    return body(prompt, choices.map(choice => [choice]), 3,
      (index === 0 ? 'S/N' : 'S/Nを' + scale + '倍した値') +
      'に0.5を加えると，元の小数部分が0.5以上の場合に限り次の整数に達する。床関数で端数を切り捨て' +
      (index === 0 ? 'る。' : '，' + scale + 'で割って元の桁に戻す。'));
  }, true);

const floating = define(2, '浮動小数点式の記号配置', 4,
  '仮数・基数・指数の役割と四つの対応候補を維持し、式に入る記号だけを変える。', index => {
    const [significand, radix, exponent] = ([['f', 'r', 'e'], ['e', 'f', 'r'], ['r', 'f', 'e'], ['r', 'e', 'f']] as const)[index];
    const raised = { f: 'ᶠ', r: 'ʳ', e: 'ᵉ' } as const;
    return textBody('実数aを a＝' + significand + '×' + radix + raised[exponent] + ' と表す浮動小数点表示に関する記述として，適切なものはどれか。',
      source[2].choices, index, '累乗に掛ける' + significand + 'が仮数，累乗の底の' + radix +
      'が基数，何乗するかを指定する' + exponent + 'が指数である。');
  });

const postfix = define(3, '後置式', 4,
  '二項演算子4種と変数A〜Gの式を維持し、元の中置候補に対応する後置式を本文に出す。', index => {
    const cases = [
      ['EF－G÷CD－AB＋÷＋', 2], ['AB＋CD－＋G÷EF÷－', 0], ['AB＋CD－÷GEF－÷＋', 1], ['EF－G÷CD－AB＋＋÷', 3],
    ] as const;
    const [postfix, answer] = cases[index];
    const stack: string[] = [];
    for (const symbol of postfix) {
      if (/^[A-G]$/.test(symbol)) { stack.push(symbol); continue; }
      const right = stack.pop();
      const left = stack.pop();
      stack.push('(' + left + symbol + right + ')');
    }
    return body('逆ポーランド表記法（後置表記法）で，“' + postfix + '”と表現される式はどれか。',
      source[3].choices.map(choice => [formula(choice)]), answer,
      '左から読み，変数を積む。演算子のたびに先に取り出したものを右辺，次のものを左辺として合成する。最後に残る式は' + stack[0] + 'になる。');
  });

const stack = define(5, 'スタックの操作列', 4,
  'push五回、pop三回と選択肢の対の並びを保つ。操作列の数字とpop位置を変える。', index => {
    const operations = [
      [1, 2, null, 3, 4, null, 5, null], [2, 1, null, 4, 3, null, 5, null],
      [2, 1, 3, null, null, 5, 4, null], [4, 1, 2, null, null, 5, 3, null],
    ][index];
    const values: number[] = [], removed: number[] = [];
    for (const operation of operations) {
      if (operation === null) removed.push(values.pop()!);
      else values.push(operation);
    }
    const remaining = values.sort((a, b) => a - b).join('と');
    return textBody([p(source[5].prompt), p(operations.map(operation => operation === null ? 'pop' : 'push ' + operation).join(' → '))],
      source[5].choices, source[5].choices.indexOf(remaining), 'スタックは後入れ先出しである。popで取り出される順は' +
      removed.join('，') + 'なので，' + remaining + 'が残る。');
  });

const sectors = define(13, 'セクタ・ブロック・ファイルの条件', 4,
  '管理領域の除外とファイル単位のブロック割当てを維持する。切上げの省略又は片方だけの切上げを誤答にする。', index => {
    const [sectorBytes, perBlock, first, second] = [[500, 8, 2000, 9000], [500, 8, 2500, 12500],
      [500, 8, 6000, 16500], [1000, 4, 3000, 5000]][index];
    const blockBytes = sectorBytes * perBlock;
    const usedFirst = Math.ceil(first / blockBytes) * perBlock;
    const usedSecond = Math.ceil(second / blockBytes) * perBlock;
    const rawFirst = first / sectorBytes, rawSecond = second / sectorBytes;
    const choices = [rawFirst + rawSecond, rawFirst + usedSecond, usedFirst + rawSecond, usedFirst + usedSecond]
      .sort((a, b) => a - b);
    return textBody(sectorBytes.toLocaleString('en-US') + 'バイトのセクタ' + perBlock +
      '個を1ブロックとして，ブロック単位でファイルの領域を割り当てて管理しているシステムがある。' +
      first.toLocaleString('en-US') + 'バイト及び' + second.toLocaleString('en-US') +
      'バイトのファイルを保存するとき，これら二つのファイルに割り当てられるセクタ数の合計は幾らか。ここで，ディレクトリなどの管理情報が占めるセクタは考慮しないものとする。',
    choices, 3, '1ブロックは' + blockBytes + 'バイトである。ファイルごとにブロック数を切り上げると' +
    usedFirst / perBlock + '個と' + usedSecond / perBlock + '個になる。1ブロック当たり' + perBlock +
    'セクタなので，合計は' + (usedFirst + usedSecond) + 'セクタである。');
  }, true);

const availability = define(16, '各コンピュータの稼働率', 4,
  '図の接続と稼働条件を維持し、共通の稼働率を変える。計算の前提として生成版では稼働・停止の独立を明示する。', index => {
    const working = [8, 7, 9, 6][index];
    const down = 10 - working;
    const series = working ** 3;
    const parallelThenSeries = (100 - down ** 2) * working;
    const seriesOrThird = 1000 - (100 - working ** 2) * down;
    const parallel = 1000 - down ** 3;
    const choices = [series, parallelThenSeries, seriesOrThird, parallel].map(thousandths => (thousandths / 1000).toFixed(3));
    const prompt = source[16].prompt.replace('0.8', String(working / 10)) + ' 各コンピュータの稼働・停止は互いに独立とする。';
    return textBody([p(prompt), autumn2009AmDiagram('availability', 0, 'コンピュータA〜Cの接続')], choices, 1,
      'A，Bがともに停止する確率は(' + down / 10 + ')²である。少なくとも一方が稼働する確率はその余事象で，Cも稼働する必要がある。' +
      'したがって，{1－(' + down / 10 + ')²}×' + working / 10 + '＝' + choices[1] + 'である。');
  }, true);

const processing = define(17, '命令・CPU・ファイルアクセスの条件', 4,
  '命令とファイル待ちを別々に計算して合計し、ほかの処理を除外する。単位換算と待ち時間の典型的な誤りを維持する。', index => {
    const [instructions, mips, accesses, latency] = [[60, 30, 2, 30], [80, 40, 3, 30], [50, 50, 2, 25], [120, 40, 3, 30]][index];
    const cpu = instructions * 10 / mips;
    const files = accesses * latency;
    const total = cpu + files;
    const prompt = 'オンラインシステムにおいて，1トランザクションの処理に平均' + instructions + '万命令を実行し，平均' + accesses +
      '回のファイルアクセスが必要であるとき，CPU性能が' + mips + 'MIPSであるコンピュータの1トランザクションの平均処理時間は何ミリ秒か。ここで，ファイルの平均アクセス時間は' +
      latency + 'ミリ秒とし，当該トランザクション以外の処理は発生しないものとする。';
    return textBody(prompt, [total / 10, cpu * 2, cpu / 10 + files, total], 3,
      '1MIPSは1秒当たり100万命令である。CPU処理は(' + instructions + '万÷' + mips + '百万)秒＝' +
      cpu + 'ミリ秒，ファイルアクセスは' + accesses + '×' + latency + '＝' + files +
      'ミリ秒なので，合計は' + total + 'ミリ秒である。');
  }, true);

const directory = define(19, 'ディレクトリ移動の経路', 4,
  '元の木と五つの指定方法を固定する。絶対・相対指定を組み合わせる実在経路を変え、候補は原順で保持する。', index => {
    const routes = [
      ['¥A¥B', '..', '..¥B', '.¥A'], ['¥A¥B¥A', '..', '..', '.'],
      ['¥B¥A', '..', '¥A', 'A'], ['¥A¥A¥A', '..', '..¥B', 'A'],
    ][index];
    const segments: string[] = [];
    const checkpoints = routes.map(route => {
      if (route.startsWith('¥')) segments.length = 0;
      for (const part of route.split('¥').filter(Boolean)) {
        if (part === '..') segments.pop();
        else if (part !== '.') segments.push(part);
      }
      return '¥' + segments.join('¥');
    });
    const material = source[19].material.split('\n').slice(1);
    material[0] = material[0].replace(routesForOriginal(), routes.join(' → '));
    const answer = source[19].choices.indexOf(checkpoints[checkpoints.length - 1]);
    return textBody([p(source[19].prompt), autumn2009AmDiagram('directory', 0, 'ディレクトリ構造'), ...material.map(p)],
      source[19].choices, answer, '先頭の¥はルートからの指定である。「..」で一つ上がり，「.」は現在位置を保つ。順に' +
      checkpoints.join(' → ') + 'へ移動する。');
  });

function routesForOriginal() {
  return '¥A¥B → .. → ..¥B → .¥A';
}

export const calculations2009AutumnAm0126 = [rounding, floating, postfix, stack, sectors, availability, processing, directory];
