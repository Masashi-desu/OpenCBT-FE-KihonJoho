import { p, strings, table } from './definition';
import { finite, original } from './legacy-2005-spring-am-27-53-shared';

const numberText = (value: number) => value.toLocaleString('en-US');

const selections = [
  { a: 5000, b: 10000, remaining: 30 },
  { a: 6000, b: 8000, remaining: 40 },
  { a: 7000, b: 10000, remaining: 50 },
  { a: 12000, b: 10000, remaining: 50 },
];

const durations = [
  { emphasized: 0, weight: 4, rows: [[2.0, 1.5, 4.5], [2.3, 1.8, 6.0], [3.3, 2.8, 5.2]] },
  { emphasized: 0, weight: 3, rows: [[2.4, 1.8, 4.0], [3.0, 2.4, 5.1], [4.1, 3.7, 5.5]] },
  { emphasized: 1, weight: 4, rows: [[2.4, 1.7, 4.0], [3.2, 2.3, 5.6], [4.5, 3.1, 6.5]] },
  { emphasized: 2, weight: 3, rows: [[2.2, 1.8, 4.5], [3.4, 2.6, 5.0], [4.5, 3.5, 6.5]] },
];
const fields = ['平均的な作業時間', '順調なときの作業時間', '作業が遅れたときの作業時間'];
const durationTable = (rows: number[][]) => table('作業時間のワークシート', ['', 'A', 'B', 'C', 'D', 'E'], [
  ['1', '作業名称', ...fields, '標準作業時間'],
  ...rows.map((row, i) => [String(i + 2), '作業' + 'PQR'[i], ...row.map(value => value.toFixed(1)), '']),
  ['5', '⋮', '⋮', '⋮', '⋮', '⋮'],
]);

const transferRates = [
  { record: 256, batch: 10, overhead: 80, tickets: 10800, speed: 9600 },
  { record: 160, batch: 8, overhead: 64, tickets: 14400, speed: 12800 },
  { record: 192, batch: 12, overhead: 96, tickets: 14400, speed: 12800 },
  { record: 224, batch: 8, overhead: 64, tickets: 14400, speed: 12800 },
];

export const calculationDefinitions = [
  finite(30, '検索条件別の件数と絞込み後の割合', 'ア',
    'Aを満たす件数、Bを満たす件数、Aを先に適用したときの残存割合を変える。整数件数・整数％を保持し、共通部分を計算してBを分母にする。同じ昇順の四候補を使う。', index => {
      const { a, b, remaining } = selections[index];
      const intersection = a * remaining / 100;
      const answer = intersection * 100 / b;
      const stem = '検索システムにおいて，最初にAという条件で検索したところ，検索結果は' + numberText(a) +
        '件であった。更にBという条件で絞り込むと，その' + remaining + '％が残った。最初にBという条件で検索した結果が' +
        numberText(b) + '件である場合，更にAという条件で絞り込むと何％が残ることになるか。';
      const options = original(30).choices;
      return { prompt: [p(stem)], choices: strings(options), correctIndex: options.indexOf(String(answer)),
        explanation: '両方の条件を満たすのは' + numberText(a) + '×' + remaining + '％＝' + numberText(intersection) +
          '件で、適用順を変えても同じ。Bを先に適用したときの' + numberText(b) + '件を分母にするので、残る割合は' +
          numberText(intersection) + '÷' + numberText(b) + '×100＝' + answer + '％。' };
    }),
  finite(35, 'サブネットマスクのホスト部の長さ', 'イ',
    'クラスCの連続マスクを/30・/29・/28・/27とし、ネットワーク・ブロードキャストを予約する通常のサブネットを扱う。元の昇順・四つの候補位置を保持する。', index => {
      const hostBits = index + 2, total = 2 ** hostBits, mask = 256 - total;
      const options = [total - 3, total - 2, total - 1, total].map(String);
      const stem = 'クラスCのIPアドレスで，サブネットマスクを255.255.255.' + mask + 'としたとき，使用できるホスト数は幾つか。';
      return { prompt: [p(stem)], choices: strings(options), correctIndex: 1,
        explanation: 'マスク末尾の' + mask + 'は2進で' + mask.toString(2) + '。0の' + hostBits + 'ビットで' + total +
          '個のアドレスを表す。ホスト部が全て0のネットワークアドレスと全て1のブロードキャストアドレスの2個を除くので、使用できるのは' + (total - 2) + '個。' };
    }),
  finite(39, '三つの作業時間の重みと測定値', 'エ',
    '表の列と行、空白のE列、E2から下への相対参照の複写、分母の有無・単純平均・件数で割る誤りを保持する。原付録p37のセルと四則演算、p38の優先順位、p39の複写から、生成で使う操作だけを独立記述する。', index => {
      const { emphasized, weight, rows } = durations[index];
      const stem = original(39).prompt.replace('“平均的な作業時間”には4', '“' + fields[emphasized] + '”には' + weight);
      const columns = ['B2', 'C2', 'D2'];
      const unweighted = columns.join('+');
      const numerator = columns.map((ref, i) => i === emphasized ? ref + '*' + weight : ref).join('+');
      const totalWeight = weight + 2;
      const formula = '(' + numerator + ')/' + totalWeight;
      const copied = formula.replace(/([BCD])2/g, (_, column: string) => column + '3');
      return {
        prompt: [p(stem), durationTable(rows)],
        choices: strings([numerator, '(' + unweighted + ')/3', '(' + numerator + ')/3', formula]),
        correctIndex: 3,
        explanation: '各時間に重みを掛けた合計を、重みの総和' + weight + '＋1＋1＝' + totalWeight + 'で割る。E2は' + formula +
          '。E3へ複写すると各参照の行が1増え、' + copied + 'になる。',
        contexts: [{
          title: '表計算ソフトの機能・用語',
          presentation: 'text',
          blocks: [
            p('セルの番地は列の文字と行番号の組合せで表す。例えばC4は列Cの4行目で、式中のC4はそのセルの値を使う。'),
            p('演算記号の + は加算、* は乗算、/ は除算を表す。括弧内を先に計算し、同じ括弧の中では乗算・除算を加算より先に計算する。'),
            p('この問題で使う相対参照は、計算式を複写すると式を移した分だけ移動する。同じ列の1行下へ複写すると、参照しているセルの列はそのままで行番号が1増える。例えばD4の式にあるA4は、D5に複写した式ではA5になる。'),
          ],
        }],
      };
    }),
  finite(53, '伝票の大きさ・まとめる件数・ヘッダと送信条件', 'ウ',
    '伝票をまとめる単位、ヘッダ量、時間当たり件数、回線速度を変え、整数秒換算かつ余りなし、バイトとビットを含む四候補で追加の丸めを行わない。昇順を固定する。', index => {
      const { record, batch, overhead, tickets, speed } = transferRates[index];
      const stem = '本社と工場との間を専用線で接続してデータを伝送するシステムがある。このシステムでは' + record +
        'バイト／件の伝票データを' + batch + '件ごとにまとめて，それに' + overhead + 'バイトのヘッダ情報を付加して送っている。伝票は1時間に平均' +
        numberText(tickets) + '件発生している。回線速度を' + numberText(speed) + 'ビット／秒としたとき，回線利用率は何％か。';
      const packets = tickets / batch;
      const bytes = (record * batch + overhead) * packets;
      const asPercent = (size: number, bitsPerByte = 8) => size * bitsPerByte * 100 / (speed * 3600);
      const answer = asPercent(bytes);
      return {
        prompt: [p(stem)], choices: strings([asPercent(bytes, 1), asPercent(record * tickets), answer, asPercent((record + overhead) * tickets)].map(String)),
        correctIndex: 2,
        explanation: '1時間に送るまとまりは' + numberText(tickets) + '÷' + batch + '＝' + numberText(packets) +
          '個。' + record + '×' + batch + '＋' + overhead + '＝' + numberText(record * batch + overhead) +
          'バイトを各まとまりが使い、1時間当たり' + numberText(bytes) + 'バイト。1バイトは8ビットなので、回線容量の' +
          numberText(speed) + '×3,600ビットで割ると、利用率は' + answer + '％。' };
    }),
];
