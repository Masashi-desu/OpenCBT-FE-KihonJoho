import { code, p, strings, table } from './definition';
import { answers, bank, bankBlocks, define, format, single } from './legacy-2006-autumn-pm-01-05-shared';
import { draw } from './legacy-2006-autumn-pm-01-05-figures';

export const salesCases = [
  { threshold:10000, amount:'1万円', category:'ワイン', transactions:[4490,2000,12700], units:[230,230,2000] },
  { threshold:8000, amount:'8千円', category:'ビール', transactions:[3490,2400,8700], units:[260,300,2400] },
  { threshold:12000, amount:'1万2千円', category:'日本酒', transactions:[5780,3080,13900], units:[280,290,3080] },
  { threshold:6000, amount:'6千円', category:'ウイスキー', transactions:[2210,1950,6600], units:[275,315,1950] },
] as const;
const normalForm=[
 '会員表を作成し，データの重複をなくした。',
 '商品表を作成し，情報の独立性を高めた。',
 '販売明細表を作成し，販売情報から繰返し要素を排除した。',
];
const benefit=[
 '会員情報の集約によって，セキュリティが強化できる。',
 '表間の独立性が高まり，会員情報や商品情報を更新する際の影響を局所化できる。',
 '将来，OSやDBMSなどを変更する際，移行が容易になる。',
 '会員の購入歴など，複数の表を連結してデータを検索する際，処理性能が向上する。',
];

function where(index:number) {
 const { threshold,category }=salesCases[index];
 const join='会員表.会員ID = 販売表.会員ID';
 const details='販売明細表.商品コード = 商品表.商品コード';
 const condition="商品表.分類 = '"+category+"'";
 const amounts=[
  'MAX(販売表.販売額) >= '+threshold,
  'SUM(販売表.販売額) >= '+threshold,
  '販売表.販売額 >= '+threshold,
 ];
 return {
  threshold:[...amounts,join+' AND '+amounts[2],join+' AND '+amounts[0],join+' AND '+amounts[1]],
  product:[
   '会員表.会員ID IN (SELECT 販売表.会員ID FROM 販売表, 商品表\n  WHERE '+condition+')',
   '会員表.会員ID = (SELECT 販売表.会員ID FROM 販売表, 商品表\n  WHERE '+condition+')',
   join+'\n  AND '+details+'\n    AND '+condition,
   join+'\n  AND 販売表.伝票番号 = 販売明細表.伝票番号\n    AND '+details+'\n      AND '+condition,
  ],
 };
}
export function autumn2006Pm2Pages(index:number,print=true){
 const data=salesCases[index], options=where(index), categories=['ワイン','ワイン','日本酒','ウイスキー'];
 const sale=[
  [p('関係データベースに関する次の記述を読んで，設問1〜4に答えよ。'),
   p('ある酒屋では，次に示すファイル様式で管理していた会員への販売データをデータベース化することにした。'),
   draw('sales-format',0,'会員への販売データのファイル様式'),
   p('伝票番号は，1回の支払いに対して一つ割り振られる。管理すべき情報を精査し，情報を追加するとともに正規化を実施して，次に示す四つの表からなるデータベースを設計した。表の主キーは，会員表では会員ID，販売表では伝票番号，販売明細表では伝票番号と商品コードの組，商品表では商品コードである。'),
   table('会員表',['会員ID','氏名','電話番号','住所'],[['020001','山田太郎','03-0000-0001','東京都文京区…'],['020002','中村二郎','03-0000-0002','東京都新宿区…'],['⋮','⋮','⋮','⋮']]),
   table('販売表',['伝票番号','日付','会員ID','販売額'],data.transactions.map((sum,i)=>['0000000'+(i+1),'20061002',['020002','040027','020004'][i],String(sum)]).concat([['⋮','⋮','⋮','⋮']])),
   table('販売明細表',['伝票番号','商品コード','個数'],[['00000001','BE0001','3'],['00000001','NI0002','1'],['00000002','WI0001','1'],['⋮','⋮','⋮']]),
   table('商品表',['商品コード','分類','商品名','単価'],[['BE0001','ビール','Aビール',String(data.units[0])],['BE0002','ビール','Bビール',String(data.units[1])],['WI0001',categories[index],'C'+categories[index],String(data.units[2])],['⋮','⋮','⋮','⋮']])],
  [p('設問1　データベース設計における第1正規化の考えに基づいて実施した操作を，解答群の中から選べ。'),
   ...(print?bank('解答群',normalForm):[]),
   p('設問2　データベース設計における正規化による直接の効果として適切なものを，解答群の中から選べ。'),
   ...(print?bank('解答群',benefit):[]),
   p('設問3　作成したデータベースを利用して，販売促進のためのデータを抽出する。1回の支払いが'+data.amount+'以上の買物をした会員の氏名と住所を抽出したい。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。'),
   code('SELECT DISTINCT 会員表.氏名, 会員表.住所\n  FROM 会員表, 販売表 WHERE ［設問3］','sql'),
   ...(print?bankBlocks('解答群',options.threshold.map(option=>[code(option,'sql')])):[])],
  [p('設問4　過去に'+data.category+'の購入歴がある会員の氏名と住所を抽出したい。次のSQL文の空欄に入れる正しい答えを，解答群の中から選べ。'),
   code('SELECT DISTINCT 会員表.氏名, 会員表.住所\n  FROM 会員表, 販売表, 販売明細表, 商品表 WHERE ［設問4］','sql'),
   ...(print?bankBlocks('解答群',options.product.map(option=>[code(option,'sql')])):[])],
 ];
 return sale;
}
export const autumn2006Pm2 = define(2,'販売データの正規化と購入履歴のSQL', '設問1=ウ／設問2=イ／設問3=エ／設問4=エ',
  '販売金額の条件、商品の分類と例示するデータ',
  '繰返し項目を表へ分け，購入履歴を会員ID、伝票番号及び商品コードで結合する。',
  '第1正規化と更新局所化の発問を維持。表示とSQL条件に支払閾値・購入カテゴリを同時反映する。最初の二欄は正規化上の役割、後半二欄はSQLを比較する構文・結合上の役割に従い個別択順を維持。作品・店舗・固有商標の資料なし。',
  index=>{
   const { threshold, category } = salesCases[index], options=where(index);
   return {prompt:autumn2006Pm2Pages(index,false).flat(),...answers([strings(normalForm),strings(benefit),options.threshold.map(x=>[code(x,'sql')]),options.product.map(x=>[code(x,'sql')])],[
    single('s1','設問1',0,2),single('s2','設問2',1,1),single('s3','設問3',2,3),single('s4','設問4',3,3),
   ]),explanation:'設問1は伝票ごとに繰り返す商品名・個数を販売明細に分ける。設問2では独立した会員情報・商品情報の更新をそれぞれの表で行える。設問3は単一伝票の販売額を'+format(threshold)+'円と比較し、その伝票の会員IDで会員表と結合する。MAXやSUMで合計・最大を集計すると設問とは別の条件になる。設問4の'+category+'は会員表から伝票、明細、商品の順に対応するキーを全部結合して判定する。商品と伝票の対応がないと別の会員も抽出してしまう。'};
  },{answerVariation:'fixed'});
