/** IPA H28 autumn afternoon Q3: preserve seven grouped/SQL fields. */
import { field,p,code,strings,variableNotes,type GeneratedBody } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { autumn2016Pm0104Case,autumn2016Pm3Cases,autumn2016Pm0104Diagram as draw,autumn2016Pm0104Profiles as profiles } from './legacy-2016-autumn-pm-figures-01-04';
export function autumn2016Pm3Banks(index:number){
 const c=autumn2016Pm3Cases[index];
 const targets="SELECT 交通機関表.交通機関コード FROM 交通機関表\nWHERE 交通機関表.交通機関名 IN ('情報都市線', '駒込バス')";
 return {
  ac:['交通機関表を交通機関コードで','従業員表を従業員番号で','通勤費表を交通機関コードで','通勤費表を従業員番号で'],bd:['AVG','COUNT','MAX','SUM'],
  e:["通勤費表.交通機関コード IN ('B00', 'B99')","通勤費表.交通機関コード LIKE 'B%'","通勤費表.交通機関コード LIKE 'B_'","通勤費表.交通機関コード LIKE ' B%'"],
  f:[`通勤費表.交通機関コード = (\n  ${targets}\n)`,`通勤費表.交通機関コード IN (\n  ${targets}\n)`,`通勤費表.交通機関コード IN (\n  ${targets}\n) GROUP BY 通勤費表.交通機関コード`,`通勤費表.交通機関コード IN (\n  ${targets}\n) GROUP BY 通勤費表.従業員番号`],
  g:[
   '通勤費表.従業員番号 = (SELECT 講習会受講表.従業員番号\n  FROM 講習会受講表 WHERE 受講日 IS NULL)',
   `通勤費表.従業員番号 IN (SELECT 講習会受講表.従業員番号\n  FROM 講習会受講表 WHERE 受講日 = '${c.date}')`,
   '通勤費表.従業員番号 IN (SELECT 講習会受講表.従業員番号\n  FROM 講習会受講表 WHERE 受講日 IS NULL)',
   `通勤費表.従業員番号 NOT IN (SELECT 講習会受講表.従業員番号\n  FROM 講習会受講表 WHERE 受講日 = '${c.date}')`,
  ],
 };
}
export const legacy2016AutumnPm3Definition:AfternoonBookletDefinition={
 source:'2016h28a-fe-pm-3',title:'従業員の通勤情報を管理する関係データベース',version:'3.2.0',sourceAnswer:'a=エ，b=エ，c=ウ，d=イ，e=イ，f=エ，g=エ',fields:[field('通勤手当の算定条件・交通費・講習会の日付',0,3)],reference:[0],
 publicNotes:'表の主キー，集計・SQLの空欄と全解答群を保ち，通勤手当の算定条件，例示する交通費，講習会の日付を変更しています。同じ従業員番号は一つだけ表示する条件，3文字の交通機関コード，未受講者のレコードが存在しない条件は維持しています。',
 notes:variableNotes+' 原物理14–17頁を全転記し，7欄20固有択28欄内参照。a/cは同じ4集計対象，b/dは同じAVG/COUNT/MAX/SUM，e/f/g各4SQL。従業員表/通勤費表/交通機関表/講習会受講表の原主キー下線と省略行を維持。4入力の通勤手当制度は合計/最大/平均/合計で，問方向は従業員ごとの通勤手当の集計のまま。交通費は4〜5桁の扱いやすい整数で，例の集計結果も整数とし，AVGの例は4000/8000→6000で端数なし。以外のSQLの肯否・解答対象・GROUP BY列・受講日の同時更新は固定。SQLiteは開発時の独立検算にだけ使用し，配布アプリで表示SQLを実行しない。',
 build(values){
  const i=autumn2016Pm0104Case(values),c=autumn2016Pm3Cases[i],banks=autumn2016Pm3Banks(i),date=`${c.date.slice(0,4)}年${Number(c.date.slice(4,6))}月${Number(c.date.slice(6))}日`;
  const bank=(label:string,options:string[],language?:string)=>[p(label+'に関する解答群'),...options.flatMap((text,k)=>language?[p('アイウエ'[k]),code(text,language)]:[p('アイウエ'[k]+'　'+text)])];
  const allowance=i===0?'従業員の1か月分の交通費の合計':i===1?'従業員の1か月分の各交通費のうち最大額':i===2?'従業員の1か月分の各交通費の平均額':'従業員の1か月分の交通費の合計';
  const prompt=[
   p('問3 従業員の通勤情報を管理する関係データベースに関する次の記述を読んで，設問1〜4に答えよ。'),
   p(`Y社では，${allowance}を通勤手当として支給している。交通費は，通勤に公共の交通機関を利用している場合は通勤経路の各区間運賃であり，自家用車を利用している場合は燃料費などの諸経費である。`),
   p('通勤手当は図1に示す表で管理していたが，より詳細に情報を管理するために，図2のように変更した。下線付きの項目は，主キーを表す。'),
   draw(3,profiles.before,i,'図1 変更前の表構成とデータ格納例'),draw(3,profiles.after,i,'図2 変更後の表構成とデータ格納例'),
   draw(3,profiles.prose3,0,'設問の本文'),
   draw(3,profiles.prose3,1,'設問の本文'),
   ...bank('a，c',banks.ac),...bank('b，d',banks.bd),
   draw(3,profiles.prose3,2,'設問の本文'),
   draw(3,profiles.queryE,0,'SQL文'),...bank('e',banks.e,'sql'),
   draw(3,profiles.prose3,3,'設問の本文'),
   draw(3,profiles.queryF,0,'SQL文'),...bank('f',banks.f,'sql'),
   p('設問4 Y社では，毎年4月に交通安全講習会を開催しており，通勤に自家用車（交通機関コード“C01”）を利用している従業員には受講を義務付けている。通勤に自家用車を利用していない従業員の受講は任意である。交通安全講習会を受講した従業員は，図3に示す講習会受講表で管理している。受講していない従業員のレコードは存在しない。'),
   draw(3,profiles.prose3,4+i,'設問の本文'),
   draw(3,profiles.training,i,'図3 講習会受講表とデータ格納例'),
   draw(3,profiles.queryG,0,'SQL文'),...bank('g',banks.g,'sql'),
  ];
  const choices=[...strings(banks.ac),...strings(banks.bd),...banks.e.map(text=>[code(text,'sql')]),...banks.f.map(text=>[code(text,'sql')]),...banks.g.map(text=>[code(text,'sql')])],parts=['a','b','c','d','e','f','g'],offsets=[0,4,0,4,8,12,16],indices=[3,banks.bd.indexOf(c.aggregate),2,1,1,3,3];
  const explanation=`a・b：通勤費表には同じ従業員の複数区間が別行で入る。従業員番号でグループ化し，本文で指定した${c.method}を表す${c.aggregate}を交通費に適用する。データ格納例の${c.costs[0]}円と${c.costs[1]}円も同じ規則で集計する。従業員表には交通費がなく，交通機関コードでまとめると別の従業員が混じる。AVGは平均，COUNTは件数，MAXは最大，SUMは合計である。\nc・d：交通機関ごとの利用者数は，通勤費表を交通機関コードでまとめて従業員の行をCOUNTする。従業員番号と交通機関コードの組合せが主キーなので，同じ従業員を同じ交通機関で二重には数えない。交通機関表自体の行数や交通費の合計・最大・平均では利用者数にならない。\ne：LIKEの%は0文字以上の任意の並び，_は任意の1文字。3文字のコードの先頭がBならB%である。B_は全体2文字しか表さず，先頭の空白を含む' B%'も一致しない。IN('B00','B99')は二つの端点だけで，他のB01などを含まない。\nf：二つの交通機関名からコードを複数求めるのでINを使う。両方を利用する従業員は元の行が二つになるため，従業員番号でGROUP BYして一つにまとめる。交通機関コードでまとめると別の従業員を同じグループへ押し込み，従業員番号を正しく一意に表示できない。=は複数行を返し得る副問合せへ一般には使えず，標準SQLでは誤りとなる。\ng：受講していない従業員の行は講習会受講表にないので，受講日IS NULLで探すことはできない。${c.date}の受講者番号を求め，自家用車利用者からNOT INで除く。他の日だけの受講者は今回の受講者として除かない。従業員番号・受講日は主キーの列でありNULLを許さない。\nSQLはStructured Query Language（関係データベースを操作する言語）。この設問では表示するコードや日付は文字列として比較し，受講済みと未受講を反転させない。`;
  return {prompt,choices,answerParts:parts.map((id,k)=>({id:'part-'+id,label:(k<4?'設問1 ':k===4?'設問2 ':k===5?'設問3 ':'設問4 ')+id,choiceIds:Array.from({length:4},(_,j)=>'choice-value-'+(offsets[k]+j+1))})),partAnswers:parts.map((id,k)=>({kind:'choice' as const,partId:'part-'+id,choiceId:'choice-value-'+(offsets[k]+indices[k]+1)})),explanation} satisfies GeneratedBody;
 }
};
