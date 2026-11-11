import type { Block } from '../types';
import { p, table } from './definition';
import { answerProgramAlts, bitText, renderFigure } from './legacy-2011-special-pm-05-08-figures';
import { campaignAt, combinationAt, evmAt, formatted, marketAt, marketTargets, stages, storefronts } from './legacy-2011-special-pm-05-08-model';

export type Major = 5|6|7|8;
export const marks = 'アイウエオカキクケコ';
export const pageRanges = {5:[22,26],6:[27,31],7:[32,35],8:[36,39]} as const;
export const officialKeys = {5:'ウカオウウ',6:'ウウアイウイイイ',7:'イエカキエアウ',8:'アエエアイアイ'} as const;
export const slots = {
  5:[['a','5a'],['b','5b'],['2','52'],['c','5c'],['d','5d']],
  6:[['a','6a'],['b','6b'],['c','6c'],['d','6de'],['e','6de'],['f','6f'],['g','6g'],['h','6h']],
  7:[['a','7ab'],['b','7ab'],['c','7cde'],['d','7cde'],['e','7cde'],['f','7fg'],['g','7fg']],
  8:[['a','8a'],['b','8b'],['c','8c'],['d','8d'],['e','8ef'],['f','8ef'],['g','8g']],
} as const;
export const bankTitles = {
  '5a':'aに関する解答群','5b':'bに関する解答群','52':'解答群','5c':'cに関する解答群','5d':'dに関する解答群',
  '6a':'aに関する解答群','6b':'bに関する解答群','6c':'cに関する解答群','6de':'d，eに関する解答群',
  '6f':'fに関する解答群','6g':'gに関する解答群','6h':'hに関する解答群',
  '7ab':'解答群','7cde':'c～eに関する解答群','7fg':'f，gに関する解答群',
  '8a':'aに関する解答群','8b':'bに関する解答群','8c':'cに関する解答群','8d':'dに関する解答群',
  '8ef':'e，fに関する解答群','8g':'gに関する解答群',
} as const;
export type Bank = keyof typeof bankTitles;
const bank = (name: Bank) => ({bank:name});
const uniqueSorted = (values: number[], expected: number) => {
  const result = [...new Set(values)].sort((a,b)=>a-b);
  if (result.length !== expected) throw Error('PARAMETER_CONSTRAINT');
  return result.map(formatted);
};

const purchase = '作業ファイルレコードの購入金額', quantity = '作業ファイルレコードの購入個数';
const application = '応募券枚数 ＞ 0', invitation = '招待券枚数 ＞ 0';
export const svOptions = [
  '外部設計と実装はSVがともに0で，計画どおりのスケジュールで進捗している',
  '外部設計と実装はSVがともに正で，計画よりもスケジュールが早まっている',
  '外部設計はSVが負でスケジュール遅延であるが，実装はSVが0で計画どおりのスケジュールで進捗している',
  '外部設計はSVが負でスケジュール遅延であるが，実装はSVが正で計画よりもスケジュールが早まっている',
  '外部設計はSVが0で計画どおりであり，実装はSVが正で計画よりもスケジュールが早まっている',
];
export const openingOptions = [
  'A社が駅ビル内店舗を，B社が駅前商店街店舗を',
  'A社が郊外ショッピングモール内店舗を，B社が駅ビル内店舗を',
  'A社が郊外ショッピングモール内店舗を，B社が駅前商店街店舗を',
  'A社，B社ともに駅ビル内店舗を',
];

export function answerBanks(index: number): Record<Bank,string[]> {
  const c = campaignAt(index), evm = evmAt(index), m = marketAt(index), bits = combinationAt(index);
  const product = c.firstProduct+' ≦ 作業ファイルレコードの商品コード ≦ '+c.lastProduct;
  const amount = purchase+' ≧ '+c.threshold, total = '購入金額合計 ≧ '+c.threshold;
  const gauss = '['+purchase+'／'+c.threshold+']';
  const [,inside] = evm.march, [outsideFeb,insideFeb] = evm.feb;
  const remaining = [evm.total - evm.complete[1][1] - evm.complete[1][2], evm.total-evm.complete[2][2]];
  const costByRates = [evm.rates[1],evm.actualRates[1]].flatMap(a =>
    [evm.rates[2],evm.actualRates[2]].map(b => remaining[0]*a+remaining[1]*b));
  const marchActual = evm.march.reduce((total,row)=>total+row.ac,0);
  const marchEarned = evm.march.reduce((total,row)=>total+row.ev,0);
  const [marketB,marketNone,marketMall] = [m.matrix[0][1][0],m.matrix[0][2][0],m.matrix[1][1][0]];
  const values = new Set([0,marketB,marketNone,marketMall,m.matrix[0][0][0],m.matrix[1][0][0],m.matrix[1][1][1]]);
  for (const value of [5,10,15,20,25,30,35]) if (values.size<7) values.add(value);
  return {
    '5a':[product,product+' 又は\n'+total,total,quantity+' ＞ 0',invitation],
    '5b':[product,product+' かつ\n'+amount,product+' 又は\n'+amount,application,
      application+' かつ '+invitation,application+' 又は '+invitation,amount,quantity+' ＞ 0'],
    '52':[gauss,'1','応募券枚数＋'+gauss,'応募券枚数＋1','応募券枚数＋'+quantity,quantity],
    '5c':Array.from({length:10},(_,i)=>String(i+1)),
    '5d':(index===1?[3,4,5,6,7,9,10,11,12,14]:[3,4,5,7,9,10,11,12,13,14]).map(String),
    '6a':uniqueSorted([insideFeb.ev,insideFeb.ac,outsideFeb.ev,outsideFeb.pv],4),
    '6b':index===0?['1,200','1,400','1,600','1,800']:
      uniqueSorted([inside.ev,outsideFeb.pv,inside.pv,inside.pv+5*evm.rates[1]],4),
    '6c':svOptions,'6de':stages.slice(0,3),'6f':['1.01','1.02','1.03','1.04'],
    '6g':uniqueSorted(costByRates,4),
    '6h':index===0?['5,320','5,480','5,560','5,600']:
      uniqueSorted([evm.prediction - evm.april + Math.min(...costByRates) - marchActual + marchEarned,
        evm.prediction,evm.prediction - evm.april + Math.max(...costByRates),evm.budget],4),
    '7ab':openingOptions,
    '7cde':index===0?['0','5','10','15','20','25','30']:uniqueSorted([...values],7),
    '7fg':['駅ビル内店舗を出店する','駅前商店街店舗を出店する','郊外ショッピングモール内店舗を出店する','Y地区への出店を見送る'],
    '8a':answerProgramAlts,
    '8b':['0，1で最後','0，1で最初','1，0で最後','1，0で最初'],
    '8c':['及びその後','及びその前','より後','より前'],
    '8d':bits.wrong.map(bitText),
    '8ef':[[0,bits.k-1],[0,bits.n-2],[1,bits.n-2],[1,bits.n-1],[2,bits.n-1],[2,bits.n]].map(([min,max])=>min+'～'+max),
    '8g':[Array(bits.n).fill(0),bits.last,Array.from({length:bits.n},(_,i)=>Number(i<bits.k)),Array(bits.n).fill(1)].map(bitText),
  };
}

const moduleRows = [
  ['初期処理','各ファイルを開く。\n応募券総枚数←0，招待券総枚数←0，あて先ファイルレコード件数←0\n作業ファイルを読む（期間中以外のレコードは，読み飛ばす）。'],
  ['前処理','応募券枚数←0，招待券枚数←0，購入金額合計←0，\nW顧客番号←作業ファイルレコードの顧客番号'],
  ['金額集計処理','購入金額合計を求める。'],['応募券処理','応募券枚数←［　］'],
  ['売上伝票処理','作業ファイルを読む（期間中以外のレコードは，読み飛ばす）。'],
  ['招待券処理','招待券枚数を求めるための計算を行う。'],
  ['あて先処理','顧客マスタファイルを読む（顧客番号の値がW顧客番号の値と異なる場合は，読み飛ばす）。\nあて先ファイルのレコードを編集し，あて先ファイルに出力する。\n応募券総枚数を求めるための計算を行う。\n招待券総枚数を求めるための計算を行う。\nあて先ファイルレコード件数を求めるための計算を行う。'],
  ['終了処理','合計表を出力する。\n各ファイルを閉じる。'],
];
const months = ['1月','2月','3月','4月','5月'];

export type PageEntry = Block | {bank: Bank};
export function bookletPages(index: number): Record<number,PageEntry[]> {
  const c = campaignAt(index), e = evmAt(index), m = marketAt(index), s = combinationAt(index);
  const value = (n:number) => n ? formatted(n) : '';
  const eachMonth = months.map((_,i)=>e.plan.reduce((total,counts,j)=>total+counts[i]*e.rates[j],0));
  const planRows = stages.map((name,j)=>[name,String(e.rates[j]),...e.plan[j].flatMap(count=>[value(count),value(count*e.rates[j])])]);
  planRows.push(['合計工数','',...eachMonth.flatMap(n=>['',value(n)])],
    ['累積工数','',...eachMonth.flatMap((_,i)=>['',value(eachMonth.slice(0,i+1).reduce((a,b)=>a+b,0))])]);
  const phaseRows = (yearPart: 'feb'|'march') => e[yearPart].map(({pv,ac,ev},j) => [
    stages[j],yearPart==='march'&&j===1?'［b］':formatted(pv),formatted(ac),yearPart==='feb'&&j===0?'［a］':formatted(ev),
  ]);
  const salesRows = m.sales.map((sale,j)=>['セグメント'+(j+1),formatted(sale*100)+'万円',...marketTargets[j].map(target=>target?'○':'×')]);
  const payoffRows = m.matrix.map((row,i)=>[storefronts[i*2],...row.map(([a,b],j)=>{
    const label = i===0&&j===1?'c':i===0&&j===2?'d':i===1&&j===1?'e':undefined;
    return '（'+(label?'［'+label+'］':a)+'，'+b+'）';
  })]);
  const n = s.n,k = s.k, count = s.combinations;
  return {
    22:[
      p('問5　あて先作成プログラムに関する次の記述を読んで，設問1～3に答えよ。'),
      p('通信販売会社のZ社では，顧客に対して顧客番号を発行し，顧客マスタファイルで管理している。'),
      p('このたび，2011年'+c.startMonth+'月'+c.startDay+'日から'+c.endMonth+'月'+c.endDay+'日までの販売促進キャンペーン期間中（以下，期間中という）の顧客の購入状況に応じて，懸賞応募券（以下，応募券という）と催物招待券（以下，招待券という）を郵送することになった。そこで，売上伝票ファイルから応募券と招待券を送る顧客を選び，あて先ファイルを出力するあて先作成プログラムを作成することにした。'),
      p('このプログラムに必要な機能は，次のとおりである。'),
      p('（1）顧客ごとの応募券の枚数は，この販売促進キャンペーンの対象商品である商品コード'+c.firstProduct+'～'+c.lastProduct+'の商品を期間中に購入した個数と同数とする。'),
      p('（2）顧客ごとの招待券の枚数は，期間中に購入したすべての商品の購入金額の合計が'+c.threshold/10000+'万円以上の顧客に対して1枚とする。'),
      p('（3）応募券又は招待券を送る顧客ごとに，あて先ファイルに1件のレコードを作成する。応募券と招待券の両方を送る場合でも1顧客に対して1件のレコードを作成する。'),
      p('（4）応募券の総枚数，招待券の総枚数及びあて先ファイルのレコードの件数を，合計表に印字する。'),
      p('顧客マスタファイル，売上伝票ファイル，あて先ファイルは順ファイルである。これらのレコード様式を，図1に示す。'),
      renderFigure('5-files',index),
      p('顧客マスタファイルは，顧客番号の昇順に整列されている。売上伝票ファイルを，顧客番号の昇順に整列した作業ファイルを作り，このプログラムに入力する。'),
      p('このプログラムの入出力関連を図2に，プログラムの流れを図3に，主なモジュールの処理内容を表1に示す。また，このプログラムのテストに用いる作業ファイルのテストデータを表2に，このテストデータを用いた場合の合計表の出力結果を図4に示す。'),
    ],
    23:[renderFigure('5-input-output',index),renderFigure('5-flow',index)],
    24:[
      table('表1　主なモジュールの処理内容',['モジュール名','処理内容'],moduleRows),
      p('注　応募券枚数，招待券枚数，購入金額合計，W顧客番号，応募券総枚数，招待券総枚数及びあて先ファイルレコード件数は作業領域である。'),
      table('表2　作業ファイルのテストデータ',['購入日付 年','購入日付 月','購入日付 日','顧客番号','商品コード','購入個数','購入金額（円）'],
        c.transactions.map(row=>['2011',...row.map(String)])),
    ],
    25:[renderFigure('5-output',index),p('設問1　図3中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),bank('5a'),bank('5b')],
    26:[
      p('設問2　表1中の［空欄］に入れる正しい答えを，解答群の中から選べ。解答群中の[ ]はガウス記号であり，[x]は，xを超えない最大の整数値を表す。'),
      bank('52'),p('設問3　図4中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),bank('5c'),bank('5d'),
    ],
    27:[
      p('問6　EVMによるプロジェクトの進捗管理に関する次の記述を読んで，設問1～3に答えよ。'),
      p('ソフトウェア開発会社のD社では，Webアプリケーション開発プロジェクト（以下，プロジェクトPという）の進捗管理にEVM（Earned Value Management）を活用することにした。'),
      p('〔EVMについての説明〕'),
      p('（1）EVMでは，出来高計画値PV（Planned Value），コスト実績値AC（Actual Cost）及び出来高実績値EV（Earned Value）といった三つの指標を用いて，プロジェクトのコスト及びスケジュールを管理する。'),
      p('（2）PVは，計画時にプロジェクトの各工程での作業に割り当てられたコストの計画値であり，ACは，各工程での作業実行後のコストの実績値である。EVは，各工程の実行過程での進捗度をコストに換算した実績値であり，その時点での計画作業の完成率にPVを乗じた値である。'),
      p('（3）EVとAC，EVとPVそれぞれの差をとることで，プロジェクトのある時点での計画値と実績値との差異を把握できる。EVとACとの差（EV－AC）をコスト差異CV（Cost Variance）といい，EVとPVとの差（EV－PV）をスケジュール差異SV（Schedule Variance）という。'),
      p('（4）プロジェクトのある時点での計画値と実績値との差異を測る別の指標として，コスト効率指数CPI（Cost Performance Index）とスケジュール効率指数SPI（Schedule Performance Index）の二つがあり，次の式で求められる。'),
      p('CPI = EV／AC'),p('SPI = EV／PV'),
      p('（5）“CVが0，すなわちCPIが1の場合は，計画どおりのコストでプロジェクトが進捗している。”，“CVが正，すなわちCPIが1を超える場合は，計画よりも少ないコストで進捗している。”，そして，“CVが負，すなわちCPIが1未満の場合にはコスト超過である。”と判断できる。'),
      p('同様に，“SVが0，すなわちSPIが1の場合は，プロジェクトが計画どおりのスケジュールで進捗している。”，“SVが正，すなわちSPIが1を超える場合は，計画よりもスケジュールが早まっている。”，そして，“SVが負，すなわちSPIが1未満の場合は，スケジュール遅延である。”と判断できる。'),
    ],
    28:[
      p('〔プロジェクトPの説明〕'),
      p('（1）プロジェクトPでは'+e.total+'個の機能の開発が必要であり，その開発スケジュール及びコスト計画は，表1のとおりである。なお，ここではコストを表す単位として工数を使用する。'),
      table('表1　プロジェクトPの開発スケジュール及びコスト計画',['工程','標準工数',...months.flatMap(month=>[month+' 機能数',month+' 計画工数'])],planRows),
      p('（2）表1中の機能数とは，各月に作業を予定している機能の個数である。なお，各機能はそれぞれ独立している。'),
      p('（3）表1中の標準工数とは，開発するアプリケーションの1機能当たりに予定される工数である。計画工数は，標準工数×機能数で算出する。'),
      p('（4）プロジェクトPの1～3月の開発実績は，表2のとおりであった。'),
      table('表2　1～3月の開発実績',['工程','完了機能数 1月','完了機能数 2月','完了機能数 3月'],
        e.complete.map((counts,i)=>[stages[i],...counts.map(value)])),
      p('2月に計画していた外部設計'+e.external[1]+'機能のうち，'+e.completedFebruary+'機能は計画どおりに2月に完了した。しかし，残り'+e.late+'機能については，2月途中に要件見直しの要請があり，外部設計が計画よりも遅れ，3月末に完了した。'),
    ],
    29:[
      p('設問1　表3及び表4は，プロジェクトPの途中段階での各指標（PV，AC，EV）の値を，工程別に示したものである。表3は2月末時点の値（1月と2月の合計）であり，表4は3月末時点の値（1～3月の合計）である。表中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
      p('なお，ACは各月での工程別の工数の実績値を基に算出している。'),
      table('表3　2月末時点での各指標の値',['','PV','AC','EV'],phaseRows('feb')),
      table('表4　3月末時点での各指標の値',['','PV','AC','EV'],phaseRows('march')),
      bank('6a'),bank('6b'),
    ],
    30:[
      p('設問2　次の記述は，プロジェクトPの3月末時点でのスケジュール差異及びコスト差異の分析について述べたものである。［空欄］に入れる正しい答えを，解答群の中から選べ。なお，各値は小数第3位を四捨五入するものとする。'),
      p('スケジュールの進捗に関して，表2の結果から，内部設計はスケジュール遅延を起こしていることが明らかである。残りの外部設計と実装に関して，SVを用いてスケジュール差異の分析を行うと，［c］ことが分かる。'),
      p('次に，工程別のコスト差異を分析する。CVの値は，［d］が負であり，コスト超過になっているが，［e］が正であり，計画よりもコスト低減されている。プロジェクト全体では，CPIが［f］であり，計画よりもコスト低減になっていることが分かる。'),
      bank('6c'),bank('6de'),bank('6f'),
    ],
    31:[
      p('設問3　プロジェクトPの今後の予測に関する次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
      p('プロジェクトメンバの努力で開発の遅れは順調に改善し，内部設計は4月半ばに完了し，実装も4月末までに完了した。その結果，4月のテストも順調に進捗し，スケジュールに関しては，プロジェクト全体として計画どおりに完了できる見込みである。'),
      p('次に，コストについて予測する。4月の内部設計及び実装における1機能当たりの工数の実績値は，それぞれの1月から3月までの実績値と等しく，4月の1か月間での内部設計及び実装の工数の合計は［g］であった。4月のテストは計画どおりの工数で進捗した。そこで，5月のテストも計画どおりの工数で進捗すると仮定すると，プロジェクト全体での総コスト（総工数）の予測値は［h］となり，コストに関しても当初の計画値以下で完了できる見込みである。'),
      bank('6g'),bank('6h'),
    ],
    32:[
      p('問7　ゲーム理論を活用した出店戦略に関する次の記述を読んで，設問1，2に答えよ。'),
      p('A社はドラッグストアチェーンで，地方都市X市を中心に20店舗を展開している。A社の店舗には，駅ビル内店舗と，郊外ショッピングモール内店舗の2種類がある。'),
      p('A社のライバルであるB社は，同じく地方都市X市を中心に12店舗を展開しているドラッグストアチェーンである。B社の店舗には，駅ビル内店舗と，駅前商店街店舗の2種類がある。A社とB社の各店舗の種類と立地は，表1のとおりである。なお，A社とB社が各店舗で取り扱う商品には，大きな相違点はない。'),
      table('表1　店舗の種類と立地',['店舗の種類','立地'],[
        [storefronts[0],'駅に直結する建物内'],[storefronts[1],'駅前の商店街'],[storefronts[2],'郊外にあるショッピングモール内'],
      ]),
      p('X市内のY地区は，私鉄のY駅を中心に開発が活発に進められている地区である。従って，表1に示すどの種類の店舗でも出店のための店舗スペースの確保が十分可能である。A社は来年度の事業展開としてY地区への1店舗の出店を計画している。A社は出店の方針として，駅ビル内店舗又は郊外ショッピングモール内店舗の2種類の店舗に絞っている。A社はY地区について，どちらの種類の店舗を出店すべきか戦略を立案することになった。'),
      p('A社は，Y地区への出店に関して外部の調査機関に依頼して，Y地区に店舗を出店した場合の売上見込みなどの調査結果を得た。'),
      p('〔市場環境〕'),
      p('購買動機などの基準によって，消費者全体を幾つかの独立した小部分に区分したものを消費者セグメントと呼ぶ。Y地区における，ドラッグストアを利用する消費者全体を，利用する店舗の種類で四つの独立した消費者セグメントに区分した。それぞれのセグメントに対する月間売上見込みと，各セグメントが利用する店舗の種類を表2に示す。例えば，セグメント2に対する月間売上見込みは，駅ビル内店舗と駅前商店街店舗との合計で'+formatted(m.sales[1]*100)+'万円となる。'),
    ],
    33:[
      table('表2　Y地区の消費者セグメント別の売上見込みと利用する店舗の種類',
        ['消費者セグメント','セグメントに対する月間売上見込み',...storefronts.slice(0,3)],salesRows),
      p('注　○：対象となる消費者セグメント　×：対象とならない消費者セグメント'),
      p('Y地区における競合環境に関して，次のような情報が得られている。'),
      p('〔競合環境〕'),
      p('（1）X市のY地区は，これまでドラッグストアチェーン店が出店したことはない。しかし，最近のY地区の人口増加傾向を受けて，A社のライバルであるB社も来年度，Y地区に駅ビル内店舗又は駅前商店街店舗のいずれか1店舗を出店する可能性が高い。B社がどちらの種類の店舗を出店するのか，又は出店しないのかに関しての情報は入手できていない。'),
      p('（2）A社とB社が競合する他地区での売上実績から推測して，Y地区でA社とB社の店舗が同じ消費者セグメントを対象として販売する場合，対象とする消費者セグメントに対する売上は，双方の店舗で50％ずつ獲得するものと予想される。'),
      p('設問1　調査結果に基づいて，Y地区へのA社が採り得る出店戦略とB社が採り得る出店戦略との組合せによって，売上高がどうなるかの予測に関する次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
      p('（1）［a］出店した場合，セグメント1及びセグメント2で見込まれる売上はB社が，セグメント3及びセグメント4で見込まれる売上はA社が独占して獲得する。'),
      p('（2）［b］出店した場合，セグメント1及びセグメント2で見込まれる売上の合計額を，両社が50％ずつ獲得する。'),
    ],
    34:[
      bank('7ab'),
      p('A社では，Y地区への出店戦略の検討に当たって，B社との競合が発生する可能性があることから，B社が採り得る出店戦略を考慮した上で，A社の売上を最大化すべく，ゲーム理論を活用することとした。そこで，調査結果に基づいて，A社が採り得る出店戦略とB社が採り得る出店戦略との組合せによって，売上がどうなるか利得行列を使って整理した。'),
      p('利得行列とは，ゲームの要素である“プレイヤ”，“戦略”，“利得”の3要素を，表3のような行列の形で表したものである。例えば，プレイヤAが戦略A-1，プレイヤBが戦略B-1を採ったときのプレイヤA及びプレイヤBの利得は，網掛け部分で表される。'),
      renderFigure('7-matrix-example',index),
    ],
    35:[
      p('設問2　市場環境及び競合環境の記述に基づいて作成された，表4の利得行列の中，及び次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
      p('単位　百万円'),
      table('表4　Y地区のA社並びにB社の月間売上高予測の利得行列',['A社＼B社',storefronts[0],storefronts[1],storefronts[3]],payoffRows),
      p('ゲーム理論では，相手がどのような戦略を採ったとしても，自分にとって最も有利となる戦略を支配戦略と呼ぶ。表4で予測した利得行列をB社の立場からみると，A社がどの戦略を採った場合でも，B社は［f］ことによって自社の売上を最大とすることができる。'),
      p('そこで，B社が自社の売上を最大とすることができる戦略である［f］ことを仮定した場合，A社として自社の売上を最大とすることができる戦略は［g］ことであることが分かる。'),
      bank('7cde'),bank('7fg'),
    ],
    36:[
      p('次の問8は必須問題です。必ず解答してください。'),
      p('問8　次のプログラムの説明及びプログラムを読んで，設問に答えよ。'),
      p('N個の要素中からK個の要素を選ぶ組合せをすべて求める。例えば，'+n+'個の要素中から'+k+'個の要素を選ぶ組合せの場合，計'+count+'通りある組合せをすべて求める。'),
      p('プログラムでは，N個の要素（要素番号1～N）からなる配列Sを用意し，このうちK個の要素には1を，残りの要素には0を設定することによって，組合せの一つを表現する。例えば，図1（1）のように'+n+'個の要素1～'+n+'中から'+k+'個の要素'+s.selected.join('，')+'を選んだ状態は，プログラム中では図1（2）のとおりに表現する。'),
      renderFigure('8-bits',index),
      p('〔プログラムの説明〕'),
      p('プログラムは，主プログラムMain並びに組合せを求めるための関数Init及びNextからなる。'),
      p('主プログラム Main\n　機能：N＝'+n+'，K＝'+k+'として，'+n+'個の要素中から'+k+'個の要素を選ぶ組合せ計'+count+'通りを順次求めて，配列Sに設定する。'),
      p('整数型関数：Init(整数型: S[], 整数型: N, 整数型: K)\n　引数：S[]は出力用，N及びKは入力用の引数である。\n　機能：1≦K≦Nの場合，配列Sの先頭からK個の要素に1を，続くN－K個の要素に0をそれぞれ設定し，返却値として0を返す。それ以外の場合，配列Sには値を設定せずに，返却値として－1を返す。'),
      p('整数型関数：Next(整数型: S[], 整数型: N)\n　引数：S[]は入出力用，Nは入力用の引数である。\n　機能：渡された配列Sの先頭からN個の要素には，直近に求めた組合せの状態が設定されている。この渡された組合せの状態に対して所定の操作を行い，次の組合せの状態を求めて配列Sに設定し，返却値として0を返す。ただし，渡された組合せの状態が，この関数のアルゴリズムで得られる最終形である場合，配列Sには値を設定せずに，返却値として－1を返す。'),
    ],
    37:[renderFigure('8-code',index)],
    38:[
      p('設問　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
      p('（1）主プログラムMainで，配列Sに組合せの一つの状態が得られるたびに，配列Sの内容を印字したい。印字には次の副プログラムを用いる。'),
      p('副プログラム Dump(整数型: S[], 整数型: N)\n　引数：S[]及びNは入力用の引数である。\n　機能：配列Sの先頭からN個の要素に格納されている値を，1行に印字する。'),
      p('そのためには，主プログラムMainのαの部分を［a］に示す部分と入れ替えればよい。'),
      p('（2）関数Nextは，受け取った配列Sを要素番号の小さい方から検査し，連続する2要素の値が［b］に見つかったものについて，その内容を入れ替える。続いて，配列Sの一部でその2要素［c］の部分について関数Initを呼ぶ。'),
      p('例えば，関数Nextの実行開始時点で，配列Sの要素番号1～'+n+'の内容が'+bitText(s.example)+'であったとき，実行終了時点での配列Sの要素番号1～'+n+'の内容は［d］となる。'),
      p('（3）このプログラムを実行して，関数Initが関数Nextから呼ばれるとき，関数Initが受け取るNの値の範囲は［e］，Kの値の範囲は［f］である。したがって，関数Initが受け取るNとKの値は，1≦K≦Nを満たさない場合がある。'),
      p('（4）主プログラムMainの実行終了時点において，配列Sの要素番号1～'+n+'の内容は［g］となっている。'),
    ],
    39:[bank('8a'),bank('8b'),bank('8c'),bank('8d'),bank('8ef'),bank('8g')],
  };
}

export function sourcePages(major: Major,index: number) {
  const pages = bookletPages(index);
  const [start,end] = pageRanges[major];
  return Array.from({length:end-start+1},(_,offset)=>[start+offset,pages[start+offset]] as const);
}

export function special2011Pm0508OriginalPageAlt(major: Major): Record<number,string> {
  const banks = answerBanks(0);
  const describe = (entry: PageEntry) => {
    if ('bank' in entry) {
      const name = entry.bank;
      const options = name==='8a'?banks[name]:banks[name].map((text,i)=>marks[i]+'　'+text);
      return [bankTitles[name],...options].join('\n');
    }
    if (entry.type==='paragraph') return entry.text;
    if (entry.type==='table') return [entry.caption,entry.columns.join('｜'),...entry.rows.map(row=>row.join('｜'))].join('\n');
    if (entry.type==='diagram') return entry.caption+'\n'+entry.alt;
    throw Error('未定義の紙面ブロックです。');
  };
  return Object.fromEntries(sourcePages(major,0).map(([page,entries])=>[page,entries.map(describe).join('\n\n')]));
}
