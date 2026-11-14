import { code, p, table } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2007-autumn-pm-10-13-support';

const rates = [
  { limits1: [25, 60, 100], price1: [50, 80, 150], limits2: [50, 100, 500, 1000], size: [60, 100, 150], mag: [1, 3, 4], standard: [20, 40], cap: 10000, prices: [2, 600, 100],
    tests: [[600, 180], [3000, 180], [12000, 180], [80, 30], [400, 30]] },
  { limits1: [30, 65, 125], price1: [60, 90, 180], limits2: [60, 125, 450, 900], size: [50, 90, 140], mag: [1, 2, 5], standard: [20, 35], cap: 9000, prices: [3, 650, 150],
    tests: [[900, 160], [2500, 120], [10000, 80], [40, 30], [125, 50]] },
  { limits1: [20, 50, 100], price1: [40, 70, 130], limits2: [50, 150, 400, 800], size: [55, 90, 130], mag: [1, 3, 4], standard: [15, 40], cap: 8000, prices: [2, 550, 100],
    tests: [[50, 26], [2400, 145], [8000, 100], [95, 20], [320, 40]] },
  { limits1: [30, 75, 120], price1: [60, 100, 170], limits2: [75, 150, 600, 1200], size: [65, 105, 160], mag: [1, 2, 4], standard: [25, 45], cap: 12000, prices: [2, 700, 150],
    tests: [[550, 180], [3100, 180], [13000, 180], [26, 36], [1190, 40]] },
];
const num = (value: number) => value.toLocaleString('en-US');
const kana = 'アイウエオカ';

export const q10 = createLanguageDefinition(10, 'C：配送物の種別と料金の計算', '重量・サイズ区分・距離別料金', 'abcdef', 'aエ bエ cイ dア eイ fオ',
  'p36〜39。重量・三辺の計、距離区分、1・2・3・−1・−2の判定と四つの料金経路を維持。境界・単価・倍率・配送例を変え、表の網掛けは値を伏せる。C実行を独立表引きと照合する。',
  index => {
    const { limits1, price1, limits2, size, mag, standard, cap, prices: [unit, base, extension], tests } = rates[index];
    const standardWeight = limits1.at(-1)!;
    const heavyWeight = limits2.at(-1)!;
    const cost = (dist: number, multiplier: number) => (base + dist * extension) * multiplier;
    const delivery = ([weight, extent]: readonly number[]) => {
      if (weight > cap) return [-2, 0];
      if (weight > heavyWeight) {
        const bracket = size.findIndex(max => max >= extent);
        return bracket === -1 ? [-1, 0] : [3, cost(1, mag[bracket])];
      }
      if (weight <= standardWeight && extent >= standard[0] && extent <= standard[1])
        return [1, price1[limits1.findIndex(max => max >= weight)]];
      return [2, limits2[limits2.findIndex(max => max >= weight)] * unit];
    };
    const parsed = tests.map(delivery);
    const mid = cost(1, mag[1]);
    const typeOptions = [-2, -1, 1, 2, 3];
    const priceOptions = [price1.at(-2)!, price1.at(-1)!, limits2.at(-2)! / 2, limits2.at(-2)!, limits2.at(-2)! * unit, limits2.at(-1)! * unit];
    const changedPriceOptions = Array.from(new Set([...price1, ...limits2.map(limit => limit * unit), parsed[3][1], parsed[4][1]]))
      .sort((a, b) => a - b).filter(value => ![parsed[3][1], parsed[4][1]].includes(value)).slice(0, 4)
      .concat(parsed[3][1], parsed[4][1]).sort((a, b) => a - b);
    const allPrices = index === 0 ? priceOptions : changedPriceOptions;
    const aOptions = index === 0 ? [1600, 1750, 1900, 2100, 2300] :
      [cost(0, mag[1]), cost(1, mag[1]) - extension, mid, mid + extension, cost(2, mag[1])].sort((a, b) => a - b);
    const priceKey = (amount: number) => kana[allPrices.indexOf(amount)];
    const c = `#define NUM1 3
#define NUM2 4
#define NUM3 3

                             /* 各重量範囲での上限重量（規定サイズ内） */
const int Weight_tbl1[NUM1] = {${limits1.join(', ')}},
          Price_tbl[NUM1]   = {${price1.join(', ')}};

                             /* 各重量範囲での上限重量（規定サイズ外） */
const int Weight_tbl2[NUM2] = {${limits2.join(', ')}};

const int Size_tbl[NUM3]    = {${size.join(', ')}},
          Mag_tbl[NUM3]     = {${mag.join(', ')}};

const int Min_size = ${standard[0]}, Max_size = ${standard[1]}, Max_weight = ${cap};
const int Unit_price = ${unit}, Base_price = ${base}, Ext_price = ${extension};

void calc_carriage(int, int, int, int *, int *);

void calc_carriage(int weight, int size, int dist_mode,
                   int *class, int *price){
    int i;

    if(weight <= Weight_tbl2[NUM2 - 1]){
        if((size >= Min_size) && (size <= Max_size) &&
                    (weight <= Weight_tbl1[NUM1 - 1])){
            *class = 1;
            for(i = 0; weight > Weight_tbl1[i]; i++);
            *price = Price_tbl[i];
        }else{
            *class = 2;
            for(i = 0; weight > Weight_tbl2[i]; i++);
            *price = Weight_tbl2[i] * Unit_price;
        }
    }else if(weight <= Max_weight){
        if(size <= Size_tbl[NUM3 - 1]){
            *class = 3;
            for(i = 0; size > Size_tbl[i]; i++);
            *price = (Base_price + dist_mode * Ext_price) * Mag_tbl[i];
        }else{
            *class = -1;
            *price = 0;
        }
    }else{
        *class = -2;
        *price = 0;
    }
}`;
    const title = '重量が' + num(heavyWeight) + 'グラムを超えて' + num(cap) + 'グラム以下の配送物の配送料金';
    return {
      pages: [
        page(36, [
          p('問10 次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕\n関数calc_carriageは，直方体の配送物の配送種別及び配送料金を求めるプログラムである。'),
          p('（1）関数calc_carriageの引数は，次のとおりである。'),
          p('weight：配送物の重量（単位はグラム）\nsize：配送物の大きさ（縦，横，高さの合計，単位はcm）\ndist_mode：配送先までの距離区分（0：近距離，1：中距離，2：遠距離）\nclass：配送種別\nprice：配送料金（単位は円）'),
          p('（2）配送種別は，配送物の重量及び大きさから，1，2，3，−1，−2のいずれか一つの値に定まる。配送種別が−1又は−2の配送物は，受け付けない。\n（3）配送料金は，配送種別ごとに用意された計算式によって求められる。'),
        ]),
        page(37, [p('〔プログラム〕'), code(c, 'c')]),
        page(38, [
          p('設問1 重量が' + num(heavyWeight) + 'グラム（Weight_tbl2[NUM2 - 1]）を超えて' + num(cap) +
            'グラム（Max_weight）以下の配送物の配送料金は表のとおりになる。表中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          table('表 ' + title + '（単位 円）', ['大きさ（size）＼距離区分（dist_mode）', '近距離', '中距離', '遠距離'], [
            [size[0] + 'cm（Size_tbl[0]）以下', num(cost(0, mag[0])), '非表示', num(cost(2, mag[0]))],
            [size[0] + 'cmを超えて' + size[1] + 'cm（Size_tbl[1]）以下', '非表示', '［a］', '非表示'],
            [size[1] + 'cmを超えて' + size[2] + 'cm（Size_tbl[2]）以下', num(cost(0, mag[2])), '非表示', num(cost(2, mag[2]))],
          ]),
          p('注 網掛けの部分は，表示していない。'),
          p('設問2 配送種別及び配送料金に関する次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          ...tests.map(([weight, extent], i) => p('（' + (i + 1) + '）重量' + num(weight) + 'グラム，大きさ' + extent + 'cmの配送物を' +
            (i < 3 ? '送る場合，配送種別は［' + 'bcd'[i] + '］となる。' : '中距離の場所に送る場合，配送料金は［' + 'ef'[i - 3] + '］円となる。'))),
        ], [{ ...bank(1, 'a', aOptions.map(num), kana[aOptions.indexOf(mid)]), label: '解答群' }], [2]),
        page(39, [], [
          { ...bank(2, 'bcd', typeOptions.map(String), parsed.slice(0, 3).map(([value]) => kana[typeOptions.indexOf(value)]).join('')), label: 'b〜dに関する解答群' },
          bank(2, 'ef', allPrices.map(num), priceKey(parsed[3][1]) + priceKey(parsed[4][1])),
        ]),
      ],
      explanation: 'a：中距離では基本額' + num(base) + '円に' + extension + '円を足してから，大きさに応じた倍率' + mag[1] +
        'を掛け，' + num(mid) + '円になる。b〜d：重量が' + num(heavyWeight) + 'グラム以下なら規定サイズと軽い重量の条件を先に確認し，1又は2を選ぶ。' +
        '重量が' + num(cap) + 'グラム以下の重い荷物ならサイズで3又は−1，さらに重ければ−2となる。今回の種別は順に' +
        parsed.slice(0, 3).map(([value]) => value).join('，') + '。e，f：種別1はPrice_tbl，種別2は該当上限の重量に' + unit +
        '円を掛ける。種別3は距離別の価格に大きさの倍率を掛ける。今回の金額は順に' + num(parsed[3][1]) + '円，' + num(parsed[4][1]) + '円である。',
    };
  });
