import type { Block } from '../types';
import { p, table } from './definition';
import { renderFigure } from './legacy-2010-autumn-pm-05-08-figures';
import {
  accountLabels, accountRow, binary, circles, companies, financeAt, inventoryAt, multiplyAt, num, privacyAt,
} from './legacy-2010-autumn-pm-05-08-model';

export const officialKeys = {5:'オカカオウ',6:'ウエアアアイ',7:'エエイアイカウイ',8:'エオイウオウア'} as const;
export type Major = keyof typeof officialKeys;
type Choice = string | { columns:readonly string[]; row:readonly string[] };
type Entry = Block | { bank:Bank; heading:string } | { continuation:string };
type Page = readonly [page:number, entries:readonly Entry[]];
const bankAt = (bank:Bank,heading='解答群'):Entry => ({bank,heading});
const joins = (rows:readonly (readonly string[])[])=>rows.map(row=>row.join('，'));
const issueDate='払出日付', date='受入日付', quantity='受入数量', issue='払出数量';
export function answerBanks(index:number) {
  const {key}=inventoryAt(index), {client}=privacyAt(index), {m}=multiplyAt(index);
  const combinations=[['＝','＜'],['＝','＞'],['＜','＝'],['＜','＞'],['＞','＝'],['＞','＜']];
  const pair=(row:readonly string[]):Choice=>({columns:['C1','C2'],row});
  return {
    '51':joins([[date],[date,quantity],[date,key],[key],[key,date],[key,'購入単価']]),
    '52':joins([[date,issue],[date,issue,issueDate],[date,issue,key],[issue,issueDate],[issue,issueDate,key],[issue,key]]),
    '53':joins([[date],[date,issueDate],[date,key],[issueDate],[issueDate,key],[key]]),
    '54':joins([['P1'],['P2'],['P3'],['P1','P2'],['P1','P3'],['P2','P3'],['P1','P2','P3']]),
    '55':combinations.map(pair),
    '6ab':['委託先の運用担当者を任命','委託先の従業者を監督','契約を締結','個人データの取扱状況を監督'],
    '6c':[
      client+'内の個人データを委託先からアクセスする際の安全性を確保するためにシステムを改修する',
      client+'の管理水準を満たす専用作業室を委託先に新たに確保する',
      client+'の従業者が委託先の個人情報保護管理者となるために委託先で常駐する',
      client+'の従業者が委託先のシステム運用方法の指揮・命令体制を整備する',
    ],
    '6d':[...circles],
    '6ef':['個人情報を含む媒体を持ち出せる','誤操作や不正操作の発見が困難になる','システム障害の原因となる','利用者認証機能をう回できる'],
    '7a':[...companies],
    '7b':['財務レバレッジ（総資産／自己資本）','自己資本比率（自己資本／総資産）','総資産回転期間（総資産／売上高）','総資産回転率（売上高／総資産）'],
    '7c':['安全性','効率性','生産性','成長性'],
    '7d':['売上高及び営業利益が上がって','売上高は上がっているが，営業利益は下がって','売上高は下がっているが，営業利益は上がって'],
    '7ef':['売上高及びROA','売上高及び営業利益','売上高及び営業利益率','営業利益及びROA','営業利益及び営業利益率','営業利益率及びROA'],
    '7gh':[...companies,'該当なし'],
    '8a':[m,32-m,32+m,-m].map(value=>binary(value,6)),
    '8bc':[m-1,m,3*m,4*m-3,-3*m,-m].map(value=>binary(value,7)),
    '8d':[
      '与えられたMの値が1のとき，ループ内の加算処理の実行回数を0にできる',
      '与えられたNの値が1のとき，ループ内の加算処理の実行回数を0にできる',
      '中間結果のシフトとNのビットの順次取出しを，1回のシフトで済ませる',
      '中間結果のシフトによって，与えられたNの値の符号検査をなくせる',
    ],
    '8ef':['1','2','3','4','5','6'],
    '8g':['−2⁰＋2³','−2⁰＋2⁴','−2¹＋2³','−2¹＋2⁴'],
  } satisfies Record<string,readonly Choice[]>;
}
export type Bank = keyof ReturnType<typeof answerBanks>;
export const slots: Record<Major,readonly (readonly [id:string,bank:Bank])[]> = {
  5:[['1','51'],['2','52'],['3','53'],['4','54'],['5','55']],
  6:[['a','6ab'],['b','6ab'],['c','6c'],['d','6d'],['e','6ef'],['f','6ef']],
  7:[['a','7a'],['b','7b'],['c','7c'],['d','7d'],['e','7ef'],['f','7ef'],['g','7gh'],['h','7gh']],
  8:[['a','8a'],['b','8bc'],['c','8bc'],['d','8d'],['e','8ef'],['f','8ef'],['g','8g']],
};

function inventoryPages(i:number):readonly Page[]{
  const {company,item,key,site}=inventoryAt(i);
  return [[21,[
    p('問5　'+item+'の棚卸金額計算に関する次の記述を読んで，設問1～5に答えよ。'),
    p('製造業が製品製造のために購入する'+item+'は，同じ品目であっても調達時期によって購入時の単価が変動する場合がある。期末時点で在庫となっている'+item+'の棚卸金額は，個々の購入単価と数量を用いて計算する。'),
    p('大量生産を行う'+company+'では，必要な'+item+'の種類と数量が非常に多い。受入れから払出しまで一つ一つを追跡して，実際に在庫となっている品目の購入単価から金額を計算することは困難である。'),
    p('受け入れた日付を受入日付，受け入れた数量を受入数量，払い出した日付を払出日付，払い出した数量を払出数量という。'),
    p(company+'は先入先出法を用いる。同じ'+key+'の中で，受入日付が最も古いものから順に払出しが行われたとみなして，棚卸金額を計算する。'+site),
    p('〔棚卸金額計算の処理〕　図1に処理の流れを示す。処理で扱うファイルはすべて順ファイルである。'),
    renderFigure('5-input-output',i),
  ]],[22,[
    p('(1) 受入情報作成処理では，期首在庫ファイルと期中受入れファイルを整列して併合し，受入情報ファイルを出力する。'+item+'は'+key+'で管理する。'),
    renderFigure('5-record',i),
    p('なお，同じ'+key+'の'+item+'を同じ日に複数回受け入れることはない。'),
    p('(2) 払出情報作成処理では，期中払出しファイルを用いて払出数量を集計し，払出情報ファイルを出力する。'),
    p('(3) 棚卸計算処理では，突合せを行い，期末在庫ファイルと棚卸金額ファイルを作成する。'),
    p('図3のとおり，払出情報ファイルのレコードの払出数量分を，受入日付の古い受入情報レコードから順に引き当てる。引き当てられずに残った数量と購入単価で期末在庫と棚卸金額のレコードを作る。数量が0のレコードは期末在庫に出力しない。期末在庫は次期の期首在庫となり，両者のレコード様式は受入情報ファイルと同じである。'),
  ]],[23,[renderFigure('5-flow',i)]],[24,[
    p('設問1　図1の受入情報作成処理では，期首在庫ファイルと期中受入れファイルを昇順に整列して併合し，受入情報ファイルとして出力する。整列に最低限必要なキー項目とその並びを選べ。解答群では左の項目の方が整列の優先度が高い。'),bankAt('51'),
    p('設問2　図1の払出情報ファイルに最低限必要な項目を選べ。'),bankAt('52'),
    p('設問3　図1の払出情報作成処理で，払出数量の集計に最低限必要なキー項目を選べ。'),bankAt('53'),
  ]],[25,[
    p('設問4　図3中のP1～P3のうち，「受入情報読込み」が入るすべての箇所の組合せを選べ。'),bankAt('54'),
    p('設問5　図3中の条件C1，C2に入れる組合せを選べ。'),bankAt('55'),
  ]]];
}
const measures = [
  ['組織的安全管理措置','規程等の整備と規程等に従った運用，安全管理措置の評価・見直し・改善'],
  ['人的安全管理措置','非開示契約の締結，教育・訓練の実施'],
  ['物理的安全管理措置','入退館・入退室管理，盗難等の防止，機器・装置等の物理的な保護'],
  ['技術的安全管理措置','情報システムへのアクセス制御，不正ソフトウェア対策，情報システムの監視'],
];
export const privacyFindings=[
  '印字不良などで廃棄する個人情報入り印刷物を鍵付きの専用廃棄箱で保管し，定期的に廃棄する。しかし鍵の保管管理が不十分で，管理者の帰宅後は誰でも鍵を使える。',
  'ファイルサーバの設定変更などの特権操作は電算室内の運用管理者席にあるシステム保守用端末だけで実行できる。しかしこの端末で行った特権操作の内容を記録していない。',
  'ファイルサーバへのログインを利用者IDとパスワードで認証するが，認証後はサーバ内のどのファイルも参照できる。',
  'ファイルサーバへのログインはすべて記録するが，機能上の理由で個々のファイルへのアクセスは記録しない。',
] as const;
function privacyPages(i:number):readonly Page[]{
  const {client,vendor,service,reports,members,order}=privacyAt(i);
  const [physical,ops,,file]=([0,1,2,3] as const).map(n=>circles[order.indexOf(n)]);
  return [[26,[
    p('問6　ITサービスマネジメントにおける個人情報の保護に関する記述を読んで，設問1，2に答えよ。'),
    p(client+'は'+members+'の個人顧客向けに'+service+'を行う。インターネットや電話で販売部が注文を受け付け，商品と請求書を宅配便で発送する。問合せも販売部で一括して受け付け，顧客情報は基幹サーバで一括管理する。'),
    p('顧客管理部は次の業務①～③を行う。①は顧客への定期報告である。②と③は販売部で対応できず，顧客管理部へ転送された問合せである。'),
    p('業務①　'+reports+'など顧客あて郵便物の印刷・発送\n業務②　取引の詳細や会員登録状況など顧客からの問合せへの対応\n業務③　住所変更や退会など顧客からの訂正・削除・利用停止などの依頼への対応'),
    p('業務①で用いる印刷・発送の機器の老朽化で故障が増えた。役員は機器更新を含む業務①～③の外部委託の検討を指示した。顧客管理部長をリーダーとし，顧客管理部，システム部及びリスク管理部の管理者による委託検討プロジェクトを発足した。'),
    p('設問1　委託元である'+client+'内での対応を検討する。［a］～［c］に入れる正しい答えを選べ。'),
    p('試験当時の「個人情報の保護に関する法律についての経済産業分野を対象とするガイドライン」に沿った管理水準で検討する。個人データの取扱いを委託する際には，安全管理措置（概要は表参照）を委託先に遵守させるために必要な［a］し，業務開始後は委託元が［b］する必要がある。'),
  ]],[27,[
    table('表　安全管理措置の概要',['安全管理措置','安全管理措置の内容（概要）'],measures),
    p('業務①～③をリスクに対する費用対効果から検討し，業務①は機器の買換えでなく外部委託とする。業務②及び③は社内処理を継続する。技術的安全管理措置について［c］などの対応が必要だからである。この結論を役員に報告した。'),
    bankAt('6ab','a，bに関する解答群'),bankAt('6c','cに関する解答群'),
  ]],[28,[
    p('設問2　委託先の安全管理措置を調査する。［d］～［f］に入れる正しい答えを選べ。'),
    p('役員の承認後，業務①の委託先を印刷・発送業の'+vendor+'に内定した。印刷・発送に必要なデータだけを'+client+'の基幹サーバから抽出し，ネットワーク経由で暗号化して'+vendor+'のファイルサーバに送信する。'),
    p('安全管理措置は'+client+'の管理水準を'+vendor+'でも維持する。プロジェクトは規程や手続の要件を文書にして'+vendor+'の運用管理者に提示した。サービス開始前に'+vendor+'の作業現場で現状調査を行うことで合意した。調査は'+vendor+'の運用管理者と一緒に実施し，問題点①～④を発見した。'),
    p('〔問題点〕'), ...order.map((finding,j)=>p(circles[j]+'　'+privacyFindings[finding])),
    p('(1) 問題点①～④のうち，問題点［d］を除くほかの三つは，技'),
  ]],[29,[
    {continuation:'術的安全管理措置の問題である。'},
    p('(2) 問題点'+physical+'を放置しておくと［e］というリスクがある。'),
    p('(3) 問題点'+ops+'及び'+file+'を放置しておくと［f］というリスクがある。'),
    p(vendor+'は，調査結果をガイドラインに沿ってまとめ，改善計画を作成し，実施結果を'+client+'に報告することを確約した。'),
    bankAt('6d','dに関する解答群'),bankAt('6ef','e，fに関する解答群'),
  ]]];
}

function financePages(i:number):readonly Page[]{
  const {year:[prior,current],yen,fx}=financeAt(i);
  const financialTable=(j:number,year:number)=>table('表'+(j+1)+'　子会社の'+year+'年度の業績（単位　百万円）',
    ['項目',...companies],accountLabels.map((name,k)=>[name,...yen[j].map(row=>num(accountRow(row)[k]))]));
  return [[30,[
    p('問7　子会社の業績評価に関する記述を読んで，設問1～3に答えよ。'),
    p('持株会社A社には，国内外で製造業を営む4社の子会社がある。B社とC社は日本国内，D社はY国，E社はZ国にある。A社は1年間の業績を評価し，良好な子会社には経営優秀賞を授与し，業績が落ち込んでいる子会社を要調査対象として詳細に経営分析する。'),
    p('経営優秀賞は，当該年度の営業利益と経常利益がともに黒字で，前年度より売上高，営業利益率及び総資産利益率ROA（Return on Assets）のすべてが向上した子会社に授与する。要調査対象は，当該年度の売上高と営業利益がともに前年度より10％以上減少した子会社である。'),
    p(current+'年度について，決算用資料から'+prior+'年度と'+current+'年度の業績を表1と表2にまとめた。D社とE社の業績は日本円換算である。'),
    financialTable(0,prior),p('注　販管費は，販売費と一般管理費の略称である。'),financialTable(1,current),
  ]],[31,[
    p('設問1　経営優秀賞の選出について［a］～［c］に入れる正しい答えを選べ。'),
    p('当該年度の営業利益と経常利益がともに黒字であるという条件で各社を評価すると，［a］が候補から除外される。売上高，営業利益率，ROAの指標値を前年度と対比して子会社の業績を評価する。'),
    p('営業利益率＝営業利益／売上高\nROA＝経常利益／総資産\n経常利益率＝経常利益／売上高'),
    p('ROAは経常利益率と［b］の積で表すことができる。営業利益率とROAの値を前年度と対比することで，営業利益率と経常利益率の変化によって会社の収益性を，［b］の変化によって会社の［c］を評価できる。'),
    bankAt('7a','aに関する解答群'),bankAt('7b','bに関する解答群'),bankAt('7c','cに関する解答群'),
    p('設問2　在外子会社の業績に関する記述中の［d］～［f］に入れる正しい答えを選べ。Y国の現地通貨はYドル，Z国の現地通貨はZドルである。各通貨を円に換算するときの為替レートを表3に示す。'),
    table('表3　日本円とYドル，Zドルの為替レート',['国',prior+'年度',current+'年度'],
      ['Y','Z'].map((currency,j)=>[currency+'国',...fx.map(rates=>rates[j+2]+'円／'+currency+'ドル')])),
  ]],[32,[
    p('D社の'+current+'年度の業績を'+prior+'年度と比べると，日本円換算では売上高及び営業利益の両方が下がっているが，現地通貨で比較すると［d］いる。為替レートの変動によって現地通貨と日本円換算とで［e］の指標値は変化する。A社では在外子会社の業績評価に現地通貨を用いる。'),
    p('なお，経常利益率，［f］は為替レートが変動しても指標値は変わらず，現地通貨でも日本円換算でも同じ値になる。'),
    bankAt('7d','dに関する解答群'),bankAt('7ef','e，fに関する解答群'),
    p('設問3　'+current+'年度の経営優秀賞及び要調査対象の選出に関する記述中の［g］と［h］に入れる正しい答えを選べ。日本国内の子会社は日本円で，在外子会社は現地通貨で評価した結果，経営優秀賞は［g］，要調査対象は［h］となった。'),
    bankAt('7gh'),
  ]]];
}
function multiplyPages(i:number):readonly Page[]{
  const {m,n}=multiplyAt(i);
  return [[34,[
    p('次の問8は必須問題です。必ず解答してください。'),
    p('問8　次のプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
    p('プログラム1及び2は二つの整数M，Nを受け取り，その積M×Nを返す。積は加減算とシフト演算で求める。M，N及び積はいずれも符号付き2進整数で，負数は2の補数で表現する。'),
    p('〔プログラム1の説明〕　M，Nは4ビットで，値の範囲は−8～7である。積は8ビットで返す。ただし処理中はMを5ビット，Nを8ビットに拡張する。'),
    p('Rは13ビットの作業用変数で，最下位をビット番号0，最上位の符号ビットを12とする。指定範囲だけを符号付き2進数とみなして部分的な算術演算ができ，指定したビット番号の内容を取り出せる。⑥行の加算でけたあふれが起きても無視する。'),
    p('N＝'+n+'，M＝'+m+'の場合とM＝−'+m+'の場合の処理をそれぞれ図1，2に示す。図中の①～⑧はプログラム1の各行と対応する。'),
    renderFigure('8-program-1',i),
  ]],[35,[renderFigure('8-trace-1',i),renderFigure('8-trace-2',i)]],[36,[
    p('〔プログラム2の説明〕　M，Nは4ビットで，値の範囲は−8～7である。積は8ビットで返す。ただし処理中はMを5ビットに拡張する。'),
    p('Rは10ビットの作業用変数で，最下位をビット番号0，最上位の符号ビットを9とする。指定範囲だけを符号付き2進数とみなして部分的な算術演算ができ，指定したビット番号の内容を取り出せる。⑤行の加算と⑦行の減算でけたあふれが起きても無視する。'),
    p('M＝−'+m+'，N＝'+n+'の場合の処理を図3に示す。図中の①～⑨はプログラム2の各行と対応する。'),
    renderFigure('8-program-2',i),
  ]],[37,[
    renderFigure('8-trace-3',i),
    p('設問1　図2と図3中の［a］～［c］に入れる正しい答えを選べ。'),
    bankAt('8a','aに関する解答群'),bankAt('8bc','b，cに関する解答群'),
  ]],[38,[
    p('設問2　次の記述中の［d］～［g］に入れる正しい答えを選べ。'),
    p('(1) プログラム1の③行で積を求めるためのRの下位8ビットにNを設定するのは，効率を考えて［d］ためである。'),
    p('(2) プログラム2はプログラム1より加減算の回数が少なくて済む場合がある。特にN＜0のとき，プログラム1の⑥行の加算は最低でも［e］回実行するが，プログラム2の⑤行の加算と⑦行の減算の合計は最高でも［f］回で済む。'),
    p('(3) プログラム1ではNのビットが1の位置で加算する。N＝7（2進数で0111）なら3回の加算が必要である。プログラム2ではNを最下位から順に調べ，1が現れた位置で減算し，連続する1が途切れて0が現れた位置で加算する。N＝7（2進数で0111）ならM×7をM×（［g］）として計算し，2進数の加減算が2回で済む。'),
    bankAt('8d','dに関する解答群'),bankAt('8ef','e，fに関する解答群'),bankAt('8g','gに関する解答群'),
  ]]];
}
const source = {5:inventoryPages,6:privacyPages,7:financePages,8:multiplyPages};
export const sourcePages = (major:Major,index:number)=>source[major](index);
const letters='アイウエオカキ';
export function autumn2010Pm0508OriginalPageAlt(major:Major):Record<number,string>{
  const banks=answerBanks(0);
  return Object.fromEntries(sourcePages(major,0).map(([page,entries])=>[page,[
    '2010年度秋期・旧午後 問'+major+' p.'+page,
    ...entries.map(entry=>{
      if('bank' in entry)return entry.heading+'\n'+banks[entry.bank].map((item,i)=>
        letters[i]+'　'+(typeof item==='string'?item:item.columns.map((label,j)=>label+' '+item.row[j]).join('，'))).join('\n');
      if('continuation' in entry)return entry.continuation;
      switch(entry.type){
        case 'paragraph':return entry.text;
        case 'diagram':return entry.caption+'\n'+entry.alt;
        case 'table':return [entry.caption,...[entry.columns,...entry.rows].map(row=>row.join('｜'))].join('\n');
        default:throw new Error('未対応の原資料ブロック');
      }
    }),
  ].join('\n')]));
}
