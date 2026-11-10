import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure, table } from './definition';
import { autumn2012Pm0508Case, courseCases, railwayModel, stationPairs, stockModel, tapeState } from './legacy-2012-autumn-pm-05-08-model';

export const courseRecordFields = {
  '5-student': ['受講者コード','受講者名','住所','電話番号'],
  '5-course-file': ['講座番号','講座名称','開始年月日','終了年月日','受講期間の月数','答案1の提出期限','…','答案nの提出期限'],
  '5-result': ['受講者コード','講座番号','割引残存期間'],
} as const;
export const gradeFields = ['受講者コード','講座番号','判定区分','起算日'];
export const assignmentFields = ['提出日','点数','返送日'];
export const gradeNotes = ['下線はキー項目を表す。','判定区分の初期値には空白が設定されている。','提出日の初期値には提出期限の翌日の日付が設定されている。','点数の初期値には0点が設定されている。'];

export const courses = (index: number) => {
  const { advanced, intermediate, beginner } = courseCases[index];
  return table('表1 A社通信講座の概要', ['資格区分','受講期間','受講条件'],
    [['上級資格',advanced+'か月','中級資格を取得していること'],['中級資格',intermediate+'か月','なし'],['初級資格',beginner+'か月','なし']]);
};
export const courseModules = table('表2 主なモジュールの処理内容', ['モジュール名','処理内容'], [
  ['初期処理','各ファイルを開く（成績ファイルは順次アクセスする）。成績ファイルを読む（判定区分が空白以外のレコードは，読み飛ばす）。'],
  ['講座ファイル入力','成績レコードの講座番号をキーとして，講座ファイルを読む。'],
  ['成績ファイル出力','成績レコードを，成績ファイルに書き込む。'],
  ['成績ファイル入力','成績ファイルを読む（判定区分が空白以外のレコードは，読み飛ばす）。'],
  ['終了処理','各ファイルを閉じる。'],
]);

export const masked = '（網掛け）';
export function inventoryReport(index: number, current: boolean) {
  const s = tapeState(index);
  return {
    date: current ? '2012年10月17日' : '2012年7月18日', inspected: current ? '2012年10月12日' : '2012年7月13日',
    movement: [
      ['前回の棚卸本数',current ? masked : '1067'],['（＋）追加した本数',String(current ? s.purchase : 20)],
      ['（－）廃棄した本数',current ? '［a］' : '15'],['（＋）搬入した本数',current ? '0' : '12'],
      ['（－）搬出した本数',String(current ? s.shipped : 24)],['今回の棚卸本数',current ? '［e］' : '1060'],
    ],
    onSite: [
      ['所定テープラック内',String(current ? s.rack : 1036)],['未使用テープ保管箱',current ? '［b］' : '12'],
      ['使用済みテープ保管箱',current ? '［c］' : '8'],['社内部門（貸出中）',current ? '［d］' : '4'],['（合計）',current ? masked : '1060'],
    ],
    borrowers: current ? masked + '。なお，このうちの1本は所在を確認中。確認後，別途報告いたします。' : '調査部（2本），監査室（2本）。',
    witness: current ? '□□ □□' : '△△ △△',
  };
}

export const tapeMovements = (index: number) => {
  const s = tapeState(index);
  return table('図2 棚卸対象テープの移動状況', ['月－日','移動内容'], [
    ['07-17',`外部保管業者に保管を委託するためテープ${s.shipFirst}本を出庫・配送`],
    ['07-25',`不要となったテープ${s.moveFirst}本を使用済みテープ保管箱に移動`],
    ['08-15','使用済みテープ保管箱内の全テープについて記録内容を消去'],
    ['08-28',`調査部にテープ${s.loan}本を貸出し`],
    ['09-12',`期末処理用のテープ${s.purchase}本を新規購入`],
    ['09-21',`監査室から貸出中のテープ${s.returned}本を返却`],
    ['10-02',`不要となったテープ${s.moveSecond}本を使用済みテープ保管箱に移動`],
    ['10-06',`期末処理のため未使用テープ${s.use}本を使用`],
    ['10-10',`外部保管業者に保管を委託するためテープ${s.shipSecond}本を出庫・配送`],
  ]);
};

const count = (n: number) => n.toLocaleString('ja-JP');
export const stockColumns = ['','18日','19日','20日','21日'];
export const stockRowLabels = ['生産数','良品判定数','不良品判定数','返品数','破損数','廃棄数','出荷数','検品中在庫数','良品在庫数','不良品在庫数'];
export function stockRows(index: number, product: 'A'|'B') {
  const s = stockModel(index), isA = product === 'A';
  const day18 = isA ? s.openingA : s.openingB, day19 = isA ? s.day19A : s.day19B, day20 = isA ? s.day20A : s.day20B;
  const end19 = isA ? s.stock19A : s.stock19B, end20 = isA ? s.stock20A : s.stock20B;
  return stockRowLabels.map((label,i) => i < 7 ? [label,masked,isA && i===4?'［b］':count(day19[i]),
    isA&&i===6?masked:count(day20[i]),i===6?count(isA?s.plannedA:s.plannedB)+'¹⁾':'']
    : [label,isA&&i===7?'［a］':count(day18[i-7]),count(end19[i-7]),isA&&i===9?'［c］':count(end20[i-7]),'']);
}
export const stockNotes = ['網掛けの部分は表示していない。','注1）出荷予定数を表す。'];

export const railwayCode = {
  '8-program': [
    '○副プログラム：CalcDist(整数型：N, 整数型：Dist[][])',
    '○整数型：From, To, Via',
    '・ Print(N, Dist)',
    '■ Via: 1, Via ≦ N, 1',
    '│ ■ From: 1, From ≦ N, 1',
    '│ │ ■ To: 1, To ≦ N, 1',
    '│ │ │ ▲ Dist[From][To] ＞ Dist[From][Via] ＋ Dist[Via][To]',
    '│ │ │ │ ・ Dist[From][To] ← Dist[From][Via] ＋ Dist[Via][To]',
    '│ │ │ ▼',
    '│ │ ■',
    '│ ■',
    '│ ・ Print(N, Dist)',
    '■',
  ],
  '8-half-program': [
    '■ From: 1, From ≦ N － 1, 1',
    '│ ■ To: ［e］',
    '│ │ ▲ Dist[From][To] ＞ Dist[From][Via] ＋ Dist[Via][To]',
    '│ │ │ ・ Dist[From][To] ← Dist[From][Via] ＋ Dist[Via][To]',
    '│ │ │ ・ Dist[To][From] ← Dist[From][Via] ＋ Dist[Via][To]',
    '│ │ ▼',
    '│ ■',
    '■',
  ],
  '8-four-routes': [
    '・ D1 ← ToKL[i] ＋ Dist[KL[i]][KL[j]] ＋ ToKL[j]',
    '・ D2 ← ToKL[i] ＋ Dist[KL[i]][KH[j]] ＋ ToKH[j]',
    '・ D3 ← ToKH[i] ＋ Dist[KH[i]][KL[j]] ＋ ToKL[j]',
    '・ D4 ← ToKH[i] ＋ Dist[KH[i]][KH[j]] ＋ ToKH[j]',
  ],
  '8-minimum-program': [
    '▲ ［f］',
    '│ ・ Res ← min(abs(ToKL[i]－ToKL[j]), D1, D2, D3, D4)',
    '├ ・ Res ← min(D1, D2, D3, D4)',
    '▼',
  ],
} as const;

export const matrixNote = '“初期値”，“Via＝1”などは，説明のために付加してある。';
export function distanceTrace(index: number) {
  return railwayModel(index).stages.map((matrix, phase) => matrix.map((row,i) => row.map((value,j) => {
    if (phase===2 && i+j===2 && i!==j) return '［a］';
    if (phase===2 && i+j===6 && i!==j) return '［b］';
    return String(value);
  })));
}
export function stationData(index: number) {
  const [x,y,z] = railwayModel(index).segmentB;
  return table('表1 駅情報表の形式', ['駅番号','Sec','KL','ToKL','KH','ToKH'], [
    ...[1,2,3,4].map(n=>[n,'“'+n+'”',n,0,n,0].map(String)),
    ['5','“B”','1',String(x),'3',String(y+z)],
    ['6','“B”','1',String(x+y),'3',String(z)],
    ['︙','︙','︙','︙','︙','︙'],
  ]);
}

const reportAlt = (index: number, current: boolean) => {
  const r = inventoryReport(index,current);
  return ['宛先：システム部長　報告日：'+r.date,'磁気テープ棚卸結果報告書','(1) 棚卸実施日：'+r.inspected,
    '(2) 移動記録：',...r.movement.map(row=>row.join('｜')),'(3) 実地確認済み本数：',...r.onSite.map(row=>row.join('｜')),
    '(4) 貸出先：'+r.borrowers,'棚卸実施者：ライブラリアン ○○ ○○，立会者 '+r.witness,
    ...(current ? ['注記　網掛けの部分は表示していない。'] : [])].join('\n');
};
type Drawing = { caption: string; alt: (index: number) => string };
export const drawings = {
  '5-answer-flow': { caption:'図1 提出された答案の処理の流れ',alt:()=>[
    '提出された答案→添削と採点→添削済み答案→受講者に返送。模範解答も受講者に返送。',
    '受講管理システム（点線枠）：講座ファイル・受講者ファイルから入力。提出された答案から提出日入力へ、添削済み答案から点数・返送日入力へ。両入力を成績ファイルへ格納。',
  ].join('\n') },
  '5-student': { caption:'図2 受講者ファイルのレコード様式',alt:()=>courseRecordFields['5-student'].join('｜')+'。注記　下線はキー項目を表す。キーは受講者コード。' },
  '5-course-file': { caption:'図3 講座ファイルのレコード様式',alt:()=>courseRecordFields['5-course-file'].join('｜')+'。注記　下線はキー項目を表す。キーは講座番号。' },
  '5-grade': { caption:'図4 成績ファイルのレコード様式',alt:()=>[
    '受講者コード｜講座番号｜判定区分｜起算日｜答案1（提出日・点数・返送日）｜…｜答案n（提出日・点数・返送日）',
    ...gradeNotes.map((note,i)=>'注記'+(i+1)+'　'+note),'下線は受講者コードと講座番号。',
  ].join('\n') },
  '5-grade-flow': { caption:'図5 初級，中級資格向けの講座の修了判定プログラムの流れ',alt:(index:number)=>{
    const c=courseCases[index];
    return [
      '修了判定プログラム→初期処理→全成績レコードの処理（終了条件：成績ファイルの終わり）→講座ファイル入力。',
      `判定［a］→Yes：受講期間の月数≠${c.advanced}へ。どちらかがNoなら成績ファイル入力へ。`,
      'Yes：提出回数←0，合計点←0、提出回数と合計点の計算を呼び出す。',
      `（受講期間の月数＝${c.beginner}かつ提出回数≧${c.beginnerMinimum}）又は（受講期間の月数＝${c.intermediate}かつ提出回数≧${c.intermediateMinimum}）を判定。Yesなら平均点←合計点÷受講期間の月数。`,
      `平均点≧${c.pass}かつ提出回数の条件を満たせば［c］へ。どちらかがNoなら網掛け部分を経由して成績ファイル出力へ。`,
      '［c］と「提出回数＝受講期間の月数」がともにYesなら成績レコードの判定区分←［d］、どちらかがNoなら判定区分←［e］。いずれも成績ファイル出力へ。',
      '成績ファイル出力の後は成績ファイル入力→全成績レコードの処理の末尾→終了処理→終了。',
      '提出回数と合計点の計算：i←1、全課題の合計（終了条件：i＞受講期間の月数）。［b］がYesなら提出回数←提出回数＋1，合計点←合計点＋成績レコードの答案iの点数。Noなら加算しない。どちらもi←i＋1、全課題の合計の末尾→終了。',
      '注記　網掛けの部分は表示していない。',
    ].join('\n');
  } },
  '5-result': { caption:'図6 結果ファイルのレコード様式',alt:()=>courseRecordFields['5-result'].join('｜')+'。注記　下線はキー項目を表す。キーは受講者コードと講座番号。' },
  '5-discount-flow': { caption:'図7 割引残存期間抽出プログラムの流れ',alt:(index:number)=>{
    const c=courseCases[index];
    return [
      '割引残存期間抽出プログラム→各ファイルを開く（成績ファイルは順次アクセス）→成績ファイルを読む→割引残存期間抽出処理（終了条件：成績ファイルの終わり）→講座ファイル入力。',
      `受講期間の月数≠${c.advanced}なら判定区分を調べる。「優秀」の場合は割引対象期間←${c.honorMonths}。「不合格」の場合は割引対象期間←${c.retryMonths}。それ以外は成績ファイルを読む前へ進む。`,
      '割引残存期間計算→受講者コード，講座番号，割引残存期間を結果ファイルに書き込む→成績ファイルを読む→繰返しの末尾→各ファイルを閉じる→終了。',
      '割引残存期間計算：現在日付の年＝起算日の年なら変数m←現在日付の月、それ以外は変数m←［f］。割引残存期間←［g］－変数m。',
      '割引残存期間＜0なら割引残存期間←99を実行する。Noなら変更しない。終了。',
      '注記　講座ファイル入力は表2と同じ。',
    ].join('\n');
  } },
  '6-prior': { caption:'図1 前回の棚卸結果報告書',alt:(index:number)=>reportAlt(index,false) },
  '6-current': { caption:'図3 今回の棚卸結果報告書',alt:(index:number)=>reportAlt(index,true) },
  '7-stock-a': { caption:'表1 10月20日の手順①の終了時点における商品Aの在庫管理台帳',alt:(index:number)=>[stockColumns.join('｜'),...stockRows(index,'A').map(row=>row.join('｜')),...stockNotes].join('\n') },
  '7-stock-b': { caption:'表2 10月20日の手順①の終了時点における商品Bの在庫管理台帳',alt:(index:number)=>[stockColumns.join('｜'),...stockRows(index,'B').map(row=>row.join('｜')),...stockNotes].join('\n') },
  '8-route': { caption:'図1 鉄道の路線例（1）',alt:(index:number)=>{
    const { edges }=railwayModel(index);
    return ['5駅の路線。',...stationPairs.map((pair,i)=>pair.join('－')+'：'+edges[i]),
      '注記　○は駅を表し，その中の数字は駅番号を表す。また，経路に付した数字は2駅間の距離を表す。'].join('\n');
  } },
  '8-program': { caption:'CalcDistのプログラム',alt:()=>railwayCode['8-program'].join('\n')+'\nFromの繰返し開始から終了まで点線枠。' },
  '8-distance-trace': { caption:'図2 配列Distの内容の変化を印字した結果',alt:(index:number)=>
    [...distanceTrace(index).flatMap((matrix,i)=>[i?'Via＝'+i:'初期値',...matrix.map(row=>row.join('　'))]),'注記　'+matrixNote].join('\n') },
  '8-half-program': { caption:'点線枠の置換プログラム',alt:()=>railwayCode['8-half-program'].join('\n') },
  '8-extended-route': { caption:'図3 鉄道の路線例（2）',alt:(index:number)=>{
    const [x,y,z]=railwayModel(index).segmentB;
    return `経路は1－2、2－3、2－10－4、1－5－6－3、1－7－8－9－3。1－5の距離${x}、5－6の距離${y}、6－3の距離${z}。注記　2駅間の距離は一部だけを表示している。`;
  } },
  '8-trunk-route': { caption:'図4 鉄道の路線例（2）の基幹駅と区間名',alt:(index:number)=>{
    const length=railwayModel(index).segmentB.reduce((sum:number,n)=>sum+n,0);
    return `基幹駅1～4。A：1－2、B：1－3（距離${length}）、C：1－3、D：2－3、E：2－4。注記　A～Eは区間名を表す。`;
  } },
  '8-four-routes': { caption:'4通りの値D1～D4',alt:()=>railwayCode['8-four-routes'].join('\n') },
  '8-minimum-program': { caption:'最短距離Resを求める処理',alt:()=>railwayCode['8-minimum-program'].join('\n') },
} satisfies Record<string, Drawing>;
export type DrawingId = keyof typeof drawings;

export const autumn2012Pm0508Profile = (id: DrawingId) => 'legacy-2012-autumn-pm-' + id;
export const autumn2012Pm0508Figures: readonly BookletFigureDefinition[] = (Object.keys(drawings) as DrawingId[]).map(id=>({
  profile:autumn2012Pm0508Profile(id), domain:[[0,3]],
  validate: values=>{autumn2012Pm0508Case(values);},
  alt: values=>drawings[id].alt(autumn2012Pm0508Case(values)),
}));
export function autumn2012Pm0508Figure(id: DrawingId,index:number) {
  return figure(autumn2012Pm0508Profile(id),[index],drawings[id].caption,drawings[id].alt(index));
}
