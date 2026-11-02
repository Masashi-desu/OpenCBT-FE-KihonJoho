/** Code-owned source figures for H28 autumn afternoon Q1–4. */
import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import type { Block, Attribution } from '../types';

export function autumn2016Pm0104Case(values: readonly number[], count = 4): number {
  if (!Array.isArray(values) || values.length !== 1 || Object.getOwnPropertySymbols(values).length || Object.getOwnPropertyNames(values).sort().join(',') !== '0,length') throw Error('PARAMETER_CONSTRAINT');
  const value = Object.getOwnPropertyDescriptor(values, '0');
  if (!value || !('value' in value) || !Number.isSafeInteger(value.value) || value.value < 0 || value.value >= count) throw Error('PARAMETER_CONSTRAINT');
  return value.value;
}
export const autumn2016Pm1Cases = [
  { dbPort: 1552, monitorPort: 1600, controls: ['DBサーバ中のデータの正規化','RPサーバとWebサーバとの間でのHTTPの利用','Webサーバのクラスタリング','コンテンツが改ざんされていないことの定期的な確認','社員IDとパスワードによるログイン','タブレットの利用'], cia: [4,3,2] },
  { dbPort: 1543, monitorPort: 1620, controls: ['障害時に復旧できるように，DBサーバのバックアップと復元手順を用意する','RPサーバとWebサーバとの間でHTTPを利用する','営業員の担当範囲に応じて，顧客情報を参照できる権限を制限する','DBサーバ中のデータを正規化する','承認された更新内容と登録結果を照合し，不正な書換えを検知する','表示が鮮明なタブレットに交換する'], cia: [2,4,0] },
  { dbPort: 1564, monitorPort: 1630, controls: ['DBサーバ中のデータを正規化する','公開コンテンツのディジタル署名を検証し，変更の有無を確認する','Webサーバをクラスタリングし，1台が故障しても処理を継続する','社員ごとのICカードと暗証番号で本人認証してから機密情報の参照を許可する','RPサーバとWebサーバとの間でHTTPを利用する','タブレットの画面を大型にする'], cia: [3,1,2] },
  { dbPort: 1575, monitorPort: 1640, controls: ['顧客情報を暗号化して保存し，復号鍵を参照権限のある担当者だけに渡す','RPサーバとWebサーバとの間でHTTPを利用する','登録内容を承認済みの原本と照合し，無断の改変を検出する','故障したサーバから待機系へ自動的に切り替えて，サービスを継続する','DBサーバ中のデータを正規化する','タブレットを軽量の機種に交換する'], cia: [0,2,3] },
] as const;
export const autumn2016Pm3Cases = [
  { costs: [4800,5850], method: '合計', aggregate: 'SUM', date: '20160420' },
  { costs: [6000,12000], method: '最大額', aggregate: 'MAX', date: '20160421' },
  { costs: [4000,8000], method: '平均額', aggregate: 'AVG', date: '20160422' },
  { costs: [3000,9000], method: '合計', aggregate: 'SUM', date: '20160423' },
] as const;
export function autumn2016Pm3Allowance(index: number) {
  const c = autumn2016Pm3Cases[index];
  return c.aggregate === 'SUM' ? c.costs[0] + c.costs[1] : c.aggregate === 'MAX' ? Math.max(...c.costs) : (c.costs[0] + c.costs[1]) / 2;
}
export const autumn2016Pm4Cases = [
  { milliseconds:5, speed:1000000, fixedCount:100, fixedBytes:5000, htmlBase:10000, htmlPerItem:500, imageBytes:25000, limit:5 },
  { milliseconds:10, speed:1000000, fixedCount:100, fixedBytes:10000, htmlBase:20000, htmlPerItem:1000, imageBytes:50000, limit:5 },
  { milliseconds:5, speed:2000000, fixedCount:50, fixedBytes:10000, htmlBase:20000, htmlPerItem:1000, imageBytes:50000, limit:5 },
  { milliseconds:10, speed:2000000, fixedCount:50, fixedBytes:20000, htmlBase:20000, htmlPerItem:1000, imageBytes:40000, limit:5 },
] as const;
export type Autumn2016PmTree = string | readonly [string, Autumn2016PmTree, Autumn2016PmTree];
export const autumn2016Pm2Trees: readonly Autumn2016PmTree[] = [
  ['op2','v',['op1','w',['op1',['op2','x','y'],'z']]],
  ['op1',['op2','v','w'],['op1',['op2','x','y'],'z']],
  ['op2','v',['op1',['op1','w',['op2','x','y']],'z']],
  ['op1',['op2','v',['op1','w',['op2','x','y']]],'z'],
];
export function autumn2016PmTreeAlt(tree: Autumn2016PmTree): string {
  return typeof tree === 'string' ? tree : `${tree[0]}（左：${autumn2016PmTreeAlt(tree[1])}，右：${autumn2016PmTreeAlt(tree[2])}）`;
}

const sourceProse:Record<string,string[]>= {
  "1": [
    "設問3 A社では，システムを構築する際に，情報セキュリティの3要素である機密性，完全性及び可用性を確保するための対応を整理して，情報セキュリティ担当者の確認を受けることになっている。そこで，次の(i)〜(vi)に示す販売支援システムに関する対応と情報セキュリティの3要素との関連を表3にまとめた。表3中の[[]]に入れる適切な答えを，解答群の中から選べ。"
  ],
  "2": [
    "設問1 字句解析の処理について，次の記述中の[[]]に入れる正しい答えを，解答群の中から選べ。",
    "設問2 構文解析の処理について，次の記述中の[[]]に入れる正しい答えを，解答群の中から選べ。",
    "例2で示す式を解析したとき，出力される構文木は[[e]]となる。"
  ],
  "3": [
    "設問1 変更後の表を用いて通勤手当に関するデータを集計する。次の記述中の[[]]に入れる正しい答えを，解答群の中から選べ。",
    "従業員ごとの通勤手当を求めるには，[[a]]グループ化して，集合関数[[b]]を用いればよい。また，交通機関ごとの利用者数を求めるには，[[c]]グループ化して，集合関数[[d]]を用いればよい。",
    "設問2 通勤にバスを利用している従業員の従業員番号と交通機関名を表示する。ここで，交通機関コードは3文字の固定長文字列であり，バスの交通機関コードだけが文字“B”で始まる。次のSQL文の[[]]に入れる正しい答えを，解答群の中から選べ。",
    "設問3 従業員の通勤圏内に新しい路線が開通することになった。その影響を確認するために，通勤経路が変わる可能性がある従業員の従業員番号を抽出することにした。同じ従業員番号は一つだけ表示する。新しい路線が影響する交通機関名は“情報都市線”と“駒込バス”であり，いずれも同名の交通機関名は他にないものとする。次のSQL文の[[]]に入れる正しい答えを，解答群の中から選べ。"
  ],
  "4": [
    "固定データの全てがブラウザにキャッシュされているとき，それぞれのデータごとにデータの再転送の要否確認をサーバに要求したところ，全て再転送が不要であるとの応答を受け取った。最初の要求をしてから最後の要求に対する応答を受け取るまでに掛かる時間は[[a]]秒である。",
    "固定データのいずれもがブラウザにキャッシュされていないとき，これらの固定データの総転送時間は[[b]]秒である。このとき，一覧表示画面1ページを構成するデータの転送時間がD社の基準を満たす商品情報の最大数nは，次式を解くことによって求めることができる。ここで，変動データもブラウザにキャッシュされていないものとする。",
    "設問 本文中の[[]]に入る正しい答えを，解答群の中から選べ。"
  ]
};
export function autumn2016Pm0104Prose(number:number,index:number):string {
  if(number===3&&index>=4&&index<=7){const date=autumn2016Pm3Cases[index-4].date;return `通勤に自家用車を利用している従業員のうち，${date.slice(0,4)}年${Number(date.slice(4,6))}月${Number(date.slice(6))}日に開催された交通安全講習会を受講していない従業員の従業員番号を表示する。次のSQL文の[[]]に入れる正しい答えを，解答群の中から選べ。`;}
  const value=sourceProse[String(number)]?.[index];if(value===undefined)throw Error('FIGURE_PROFILE');return value;
}
export const autumn2016Pm2GrammarRows = [
  [['符号なし浮動小数点定数','小数点定数［指数部］｜数字列 指数部'],['小数点定数','［数字列］. 数字列｜数字列 .'],['指数部','e［符号］数字列'],['数字列','数字｜数字列 数字'],['符号','+｜−'],['数字','0｜1｜2｜3｜4｜5｜6｜7｜8｜9']],
  [['式','項｜[[c]]'],['項','因子｜項 op1 因子'],['因子','名前'],['名前','v｜w｜x｜y｜z']],
  [['因子','名前｜([[d]])']],
] as const;
export const autumn2016Pm3Queries = [
  'SELECT 通勤費表.従業員番号, 交通機関表.交通機関名\n  FROM 通勤費表, 交通機関表\n WHERE 通勤費表.交通機関コード = 交通機関表.交通機関コード AND\n       [[e]]',
  'SELECT 通勤費表.従業員番号\n  FROM 通勤費表\n WHERE [[f]]',
  "SELECT 通勤費表.従業員番号\n  FROM 通勤費表\n WHERE 通勤費表.交通機関コード = 'C01' AND\n       [[g]]",
] as const;
export const autumn2016PmBlankAlt=(text:string)=>text.replace(/\[\[([a-g]?)\]\]/g,(_,label)=>label?'［'+label+'］':'空欄');

const prefix = 'legacy-2016-autumn-pm-';
export const autumn2016Pm0104Profiles = {
  network:prefix+'1-network', rules:prefix+'1-rules', cia:prefix+'1-cia-table', prose1:prefix+'1-prose', prose2:prefix+'2-prose', prose3:prefix+'3-prose', prose4:prefix+'4-prose', lexical:prefix+'2-lexical-rules', expression:prefix+'2-expression-rules', factor:prefix+'2-factor-rule', queryE:prefix+'3-query-e', queryF:prefix+'3-query-f', queryG:prefix+'3-query-g', dfa:prefix+'2-dfa', example:prefix+'2-example-tree', tree:prefix+'2-syntax-tree',
  before:prefix+'3-before-tables', after:prefix+'3-after-tables', training:prefix+'3-training-table', transfers:prefix+'4-transfer-table', inequality:prefix+'4-transfer-inequality',
} as const;
export function autumn2016Pm0104FigureAlt(profile: string, values: number[]): string {
  const i = autumn2016Pm0104Case(values,profile===autumn2016Pm0104Profiles.prose3?8:4), c = autumn2016Pm3Cases[i];
  switch(profile) {
    case autumn2016Pm0104Profiles.prose1: return autumn2016PmBlankAlt(autumn2016Pm0104Prose(1,i));
    case autumn2016Pm0104Profiles.prose2: return autumn2016PmBlankAlt(autumn2016Pm0104Prose(2,i));
    case autumn2016Pm0104Profiles.prose3: return autumn2016PmBlankAlt(autumn2016Pm0104Prose(3,i));
    case autumn2016Pm0104Profiles.prose4: return autumn2016PmBlankAlt(autumn2016Pm0104Prose(4,i));
    case autumn2016Pm0104Profiles.cia: if(i)throw Error('PARAMETER_CONSTRAINT');return '表3 情報セキュリティの3要素との関連。3要素／対応。機密性／空欄a，完全性／空欄b，可用性／空欄c。';
    case autumn2016Pm0104Profiles.lexical: if(i)throw Error('PARAMETER_CONSTRAINT');return autumn2016PmBlankAlt(autumn2016Pm2GrammarRows[0].map(row=>row[0]+' → '+row[1]).join('\n'));
    case autumn2016Pm0104Profiles.expression: if(i)throw Error('PARAMETER_CONSTRAINT');return autumn2016PmBlankAlt(autumn2016Pm2GrammarRows[1].map(row=>row[0]+' → '+row[1]).join('\n'));
    case autumn2016Pm0104Profiles.factor: if(i)throw Error('PARAMETER_CONSTRAINT');return autumn2016PmBlankAlt(autumn2016Pm2GrammarRows[2].map(row=>row[0]+' → '+row[1]).join('\n'));
    case autumn2016Pm0104Profiles.queryE: if(i)throw Error('PARAMETER_CONSTRAINT');return autumn2016PmBlankAlt(autumn2016Pm3Queries[0]);
    case autumn2016Pm0104Profiles.queryF: if(i)throw Error('PARAMETER_CONSTRAINT');return autumn2016PmBlankAlt(autumn2016Pm3Queries[1]);
    case autumn2016Pm0104Profiles.queryG: if(i)throw Error('PARAMETER_CONSTRAINT');return autumn2016PmBlankAlt(autumn2016Pm3Queries[2]);
    case autumn2016Pm0104Profiles.network:
      if(i)throw Error('PARAMETER_CONSTRAINT');
      return 'A社のネットワーク構成。タブレットはインターネットにつながり，インターネットとA社のFWが接続する。FWはDMZのバスとLANのバスを接続する。DMZにはRPサーバとサーバ群Xがある。LANにはPCとサーバ群Yがある。各機器の接続点は黒い四角で示す。FWはファイアウォール。サーバ群XとYの内容は未指定。';
    case autumn2016Pm0104Profiles.rules:
      return `表2 FWにおけるフィルタリングの設定。条件は送信元，宛先，宛先ポート番号。項番1は任意，RPサーバ，443，許可。項番2は任意，DBサーバ，${autumn2016Pm1Cases[i].dbPort}，許可。項番3は任意，任意，任意，拒否。注記 項番が小さいものから順に突き合わせ，最初に一致したものが適用される。`;
    case autumn2016Pm0104Profiles.dfa:
      if(i)throw Error('PARAMETER_CONSTRAINT');
      return '図1 符号なし浮動小数点定数の状態遷移図。初期状態0。最終状態3と6は二重円。0から1へ数字，0から2へ空欄a，2から3へ数字，1から1へ数字，1から3へピリオド，1から4へ空欄b，3から3へ数字，3から4へe，4から5へ符号，4から6へ数字，5から6へ数字，6から6へ数字。文字列は左から右へ1文字ずつ読み，読み終わりで最終状態なら受理する。';
    case autumn2016Pm0104Profiles.example:
      if(i)throw Error('PARAMETER_CONSTRAINT');
      return '図2 式の構文木と演算順序の例。根opの左の子はop，右の子はx。左のopの左の子はv，右の子はw。深さ優先で左からたどり，帰り掛けで左部分木のop（vとw）を評価し，その結果とxに対して根のopを評価する矢印経路を示す。';
    case autumn2016Pm0104Profiles.tree:return '構文木。'+autumn2016PmTreeAlt(autumn2016Pm2Trees[i]);
    case autumn2016Pm0104Profiles.before:
      return `図1 変更前の表構成とデータ格納例。従業員表の列は従業員番号（主キー），氏名，住所，…，通勤手当。例の1行は00980125，情報太郎，東京都文京区○○○，…，${autumn2016Pm3Allowance(i)}。以下の行は縦の省略記号。`;
    case autumn2016Pm0104Profiles.after:
      return `図2 変更後の表構成とデータ格納例。従業員表：従業員番号（主キー），氏名，住所，…。00980125，情報太郎，東京都文京区○○○，…，以降省略。通勤費表：従業員番号と交通機関コードが組合せ主キー，交通費。00980125，B02，${c.costs[0]}。00980125，S01，${c.costs[1]}。以降省略。交通機関表：交通機関コード（主キー），交通機関名。B01，○○バス。B02，△△バス。省略行。C01，自家用車。省略行。`;
    case autumn2016Pm0104Profiles.training:
      return `図3 講習会受講表とデータ格納例。列は従業員番号，受講日で，二つの列が組合せ主キー。例は00980125，${c.date}。以降の行は省略。`;
    case autumn2016Pm0104Profiles.inequality:
      if(i)throw Error('PARAMETER_CONSTRAINT');
      return '［b］＋3×t＋［c］＋(3×t＋［d］)×n≦5';
    case autumn2016Pm0104Profiles.transfers:
      if(i)throw Error('PARAMETER_CONSTRAINT');
      return '表1 要求に対する結果の受信が完了するまでに掛かる時間。キャッシュされていない：要求はデータの転送，結果は当該データvバイトの受信，時間3×t＋v÷e秒。キャッシュされている：要求はデータの再転送の要否確認。再転送が不要な場合は再転送不要との応答を受信し，時間t秒。再転送が必要な場合は当該データvバイトを受信し，時間3×t＋v÷e秒。';
    default:throw Error('FIGURE_PROFILE');
  }
}
const staticProfiles = new Set<string>([autumn2016Pm0104Profiles.network,autumn2016Pm0104Profiles.dfa,autumn2016Pm0104Profiles.example,autumn2016Pm0104Profiles.transfers,autumn2016Pm0104Profiles.inequality,autumn2016Pm0104Profiles.cia,autumn2016Pm0104Profiles.lexical,autumn2016Pm0104Profiles.expression,autumn2016Pm0104Profiles.factor,autumn2016Pm0104Profiles.queryE,autumn2016Pm0104Profiles.queryF,autumn2016Pm0104Profiles.queryG]);
export const legacy2016AutumnPm0104Figures: BookletFigureDefinition[] = Object.values(autumn2016Pm0104Profiles).map(profile => ({
  profile,domain:[[0,profile===autumn2016Pm0104Profiles.prose3?7:profile===autumn2016Pm0104Profiles.prose1?0:profile===autumn2016Pm0104Profiles.prose2||profile===autumn2016Pm0104Profiles.prose4?2:staticProfiles.has(profile)?0:3]],
  validate(values){autumn2016Pm0104FigureAlt(profile,values);},
  alt(values){return autumn2016Pm0104FigureAlt(profile,values);},
}));
export function autumn2016Pm0104Diagram(number: number, profile: string, index: number, caption: string): Block {
  const attribution: Attribution = {origin:'adapted',sourceRefs:[{sourceId:`source-ipa-2016h28a-fe-pm-${number}-qs`,locator:{section:`平成28年度 秋期 基本情報技術者試験 午後 問${number}`,year:2016,period:'秋期',timeSlot:'午後',subject:'旧制度・午後',questionNumber:String(number)}}],rightsRefs:[`rights-ipa-2016h28a-fe-pm-${number}`,'rights-original'],creatorIds:['codex']};
  return {type:'diagram',id:'diagram-'+profile,rendererRef:{id:'renderer-source-figures',version:'1.0.0'},caption,alt:autumn2016Pm0104FigureAlt(profile,[index]),scene:{kind:'source_figure',profile,values:[index]},attribution};
}
