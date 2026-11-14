import { p, strings, table } from './definition';
import { finite, original } from './legacy-2007-spring-am-27-53-shared';

const layoutCases = [
  { sizes: [200, 100, 150, 80, 90], options: ['3','4','5','6'] },
  { sizes: [170, 60, 200, 70, 30], options: ['1','2','3','4'] },
  { sizes: [150, 190, 140, 30, 160], options: ['2','3','4','5'] },
  { sizes: [150, 90, 190, 80, 110], options: ['2','3','4','5'] },
] as const;
const operations = ['Aのロード','Bのロード','Cのロード','Bの解放','Dのロード','Aの解放','Eのロード'] as const;
const operationLine = operations.join(' → ');
const modules = ['A', 'B', 'C', 'D', 'E'] as const;
type Range = { begin: number; end: number };
const ordered = (a: Range, b: Range) => a.begin - b.begin;
const gaps = (total: number, occupied: Iterable<Range>) => {
  const sorted = [{ begin: 0, end: 0 }, ...[...occupied].sort(ordered), { begin: total, end: total }];
  return sorted.slice(1).flatMap(({ begin }, i) => sorted[i].end < begin ? [{ begin: sorted[i].end, end: begin }] : []);
};
const layout = finite(30, 'モジュールA〜Eの大きさ',
  '可変区画、初期空、空き区画先頭からの配置と固定の7動作を維持。毎回十分な大きさの区画が1か所だけとなる。元の手順を維持したまま、1/2/3区画の成立例を作り、各基準で昇順4択を保持。重複する結果値の条件では配置と区画サイズが異なる。',
  index => {
    const { sizes, options } = layoutCases[index];
    const occupied = new Map<string, Range>(), points: string[] = [];
    for (const action of operations) {
      const id = action[0];
      if (action.endsWith('解放')) {
        occupied.delete(id);
      } else {
        const size = sizes[modules.findIndex(name => name === id)];
        const [seat] = gaps(500, occupied.values()).filter(range => range.end - range.begin >= size);
        occupied.set(id, { begin: seat.begin, end: seat.begin + size });
        points.push(id + 'は' + seat.begin + ' kバイト位置');
      }
    }
    const final = gaps(500, occupied.values()), answer = final.length.toString();
    return {
      prompt: [p(original(30).prompt), p('〔ロードと解放の順序〕'), p(operationLine),
        table('モジュールの大きさ', ['モジュール','大きさ（kバイト）'], modules.map((id, i) => [id, String(sizes[i])]))],
      choices: strings([...options]), correctIndex: options.findIndex(candidate => candidate === answer),
      explanation: '各ロード時に十分な連続空き領域の先頭から配置する。先頭からの位置は，' + points.join('，') +
        'である。最後に残る空き区画の大きさは' + final.map(region => region.end - region.begin).join('，') +
        ' kバイトで，区画数は' + answer + 'か所である。',
    };
  });

const digitsCases = [
  { input: '2131', options: ['1','3','5','7'] },
  { input: '1253', options: ['1','3','5','7'] },
  { input: '1354', options: ['1','3','5','7'] },
  { input: '1324', options: ['1','3','5','X'] },
] as const;
const checkDigit = finite(47, '4けたの数値データ',
  '係数4,3,2,1、規則4項、mod 11と余り10のX、4候補の昇順を保持。積の和が18,23,27,21となる短い計算に制限し、余り10の例では対応するXも示す。',
  index => {
    const { input, options } = digitsCases[index];
    const digits = [...input].map(Number), weighted = digits.reduce((sum, digit, at) => sum + digit * (4 - at), 0);
    const remainder = weighted % 11, character = remainder === 10 ? 'X' : String(remainder);
    return {
      prompt: [p(original(47).prompt.replace('2131', input)), p('〔規則〕'),
        p('（1）与えられたデータの各けたに，先頭から係数4，3，2，1を割り当てる。'),
        p('（2）各けたの数値と割り当てた係数とのそれぞれの積の和を求める。'),
        p('（3）（2）で求めた和を11で割って余りを求める。'),
        p('（4）（3）で求めた余りの数字を検査文字とする。ただし，余りが10のときは，“X”を検査文字とする。')],
      choices: strings([...options]), correctIndex: options.findIndex(candidate => candidate === character),
      explanation: '先頭から係数を掛けて足すと ' + digits.map((digit, at) => digit + '×' + (4 - at)).join('＋') +
        '＝' + weighted + '。11で割った余りは' + remainder + 'なので，検査文字は' + character + 'となる。',
    };
  });

const addresses = ['192.168.10.10', '10.14.22.3', '172.16.5.7', '239.14.8.21'] as const;
const addressClass = finite(53, 'IPv4アドレスの先頭オクテット',
  '歴史的なIPv4のクラスA〜Dを4択の固定順で問う。各入力は先頭ビットでの区分が異なる。',
  index => {
    const address = addresses[index], first = Number(address.split('.')[0]);
    const correctIndex = first < 128 ? 0 : first < 192 ? 1 : first < 224 ? 2 : 3;
    return {
      prompt: [p(original(53).prompt.replace(addresses[0], address) + (index === 0 ? '' : ' 従来のクラス分類で答える。'))],
      choices: strings(original(53).choices), correctIndex,
      explanation: '先頭は' + first + '（2進数' + first.toString(2).padStart(8, '0') + '）。先頭ビットの並びが ' +
        ['0','10','110','1110'][correctIndex] + ' なので，従来のクラスは' + 'ABCD'[correctIndex] + 'である。',
    };
  });
export const calculationDefinitions = [layout, checkDigit, addressClass];
