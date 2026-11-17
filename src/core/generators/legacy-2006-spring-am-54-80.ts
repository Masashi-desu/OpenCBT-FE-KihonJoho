import { DataError } from '../errors';
import { field, p, strings, table, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { spring2006Am5480Knowledge as knowledge } from './legacy-2006-spring-am-54-80-knowledge';
import { spring2006Am5480Source as source } from './legacy-2006-spring-am-54-80-source';
import { spring2006Am5480Figure as draw, spring2006AmLayers, spring2006AmDeviceDepth, spring2006AmNormalForm,
  spring2006AmVisit, spring2006AmSchema, spring2006AmAnalyses, layerNames } from './legacy-2006-spring-am-54-80-figures';

const kana='アイウエ';
const num=(value:number)=>value.toLocaleString('en-US');
function unique(conditions:boolean[]) {
  const index=conditions.indexOf(true);
  if(index<0||index!==conditions.lastIndexOf(true))throw new DataError('ANSWER_REF','2006年度春期旧午前の正答を一意に確定できません');
  return index;
}
function protocols(i:number):GeneratedBody {
  const reference=spring2006AmLayers(i,0).protocols;
  const options=Array.from({length:4},(_,j)=>spring2006AmLayers(i,j));
  const key=unique(options.map(option=>option.row===0&&option.labels[0]===reference[0]));
  return {prompt:[p(source[54].prompt.replace('TCP及びIP',reference.join('及び')))],
    choices:options.map((_,j)=>[draw('54-option-'+(j+1),i,'OSI階層とプロトコル')]),correctIndex:key,
    explanation:reference[0]+'はアプリケーション間でのデータ転送を受け持つ'+layerNames[0]+'。'+reference[1]+
      'はネットワーク間での宛先指定と転送を受け持つ'+layerNames[1]+'。その下でフレームを扱うのが'+layerNames[2]+'である。'};
}

const transfers=[
  [8,60,1,2,0.4,0.4],[8,50,1,1,0.4,0.6],[10,80,2,3,0.2,0.3],[16,75,2,4,0.3,0.5],
];
function response(i:number):GeneratedBody {
  const [speed,efficiency,up,down,client,server]=transfers[i], gross=(up+down)*8, effective=speed*efficiency/100;
  const communication=gross/effective, time=communication+client+server;
  const options=i===0?[...source[55].choices]:[(up+down)/effective+client+server,gross/speed+client+server,communication,time]
    .sort((a,b)=>a-b).map(v=>v.toFixed(1));
  return {prompt:[p(source[55].prompt),table('条件',['項目','値'],[
    ['クライアントとサーバ間の回線速度',speed+' Mビット／秒'],['伝送効率',efficiency+'％'],
    ['電文長','上り'+up+' Mバイト，下り'+down+' Mバイト'],
    ['クライアントの処理時間','送信，受信を合わせて'+client.toFixed(1)+'秒'],
    ['サーバの処理時間','送信，受信を合わせて'+server.toFixed(1)+'秒'],
  ])],choices:strings(options),correctIndex:unique(options.map(value=>value===time.toFixed(1))),
    explanation:'電文は上りと下りを合わせて'+(up+down)+' Mバイト、つまり'+gross+' Mビット。実効速度は'+speed+'×'+
      efficiency+'/100＝'+effective+' Mビット／秒なので、転送に'+communication.toFixed(1)+'秒掛かる。両端の処理'+
      client.toFixed(1)+'秒、'+server.toFixed(1)+'秒を加えると'+time.toFixed(1)+'秒になる。'};
}
function device(i:number):GeneratedBody {
  const depth=spring2006AmDeviceDepth(i), key=[3,2,1,0][i];
  return {prompt:[p(source[57].prompt),draw('57-osi',i,'二つのLANセグメントと装置A')],
    choices:strings([...source[57].choices]),correctIndex:key,
    explanation:'装置Aがデータを中継するときに使う最上位は図の第'+depth+'層である。'+
      ['ルータはネットワーク層でアドレスを見て転送する。','リピータハブは物理層の信号を中継する。',
        'ブリッジはデータリンク層のフレームを中継する。','この図ではアプリケーション層まで処理するので，上位プロトコルも変換できるゲートウェイが対応する。'][i]};
}
function normalize(i:number):GeneratedBody {
  const {key:[first,second],determinant,dependent,rows}=spring2006AmNormalForm(i);
  const item=source[58].prompt.replace('項目aとb','項目'+first+'と'+second).replace('項目fは項目b','項目'+dependent+'は項目'+determinant);
  const found=unique(rows.map(split=>split.length===2&&split.some(row=>row.length===2&&row.includes(determinant)&&row.includes(dependent))&&
    split.some(row=>row.length===5&&row.includes(first)&&row.includes(second)&&!row.includes(dependent))));
  return {prompt:[p(item),draw('58-dependencies',i,'項目の従属関係図')],
    choices:rows.map((_,j)=>[draw('58-option-'+(j+1),i,'正規化した表の組')]),correctIndex:found,
    explanation:'項目'+dependent+'は複合主キーの一部である項目'+determinant+'だけで決まる。'+
      '部分関数従属を取り除くため，'+determinant+'と'+dependent+'を一つの表へ分ける。残りは'+
      first+'と'+second+'を組み合わせた主キーと一緒に保持する。'};
}
function visit(i:number):GeneratedBody {
  const {initial,steps}=spring2006AmVisit(i);
  const updates=[0,0];
  let count=initial;
  for(let step=1;step<=4;step++) {
    const op=steps.indexOf(step), viewer=Math.floor(op/2);
    if(op%2===0)updates[viewer]=count+1;
    else count=updates[viewer];
  }
  const choices=[initial,initial+1,initial+2,initial+4];
  return {prompt:[p(source[61].prompt.replace('値が100','値が'+initial)),draw('61-access',i,'アクセスカウンタを更新する四つの処理')],
    choices:strings(choices.map(String)),correctIndex:unique(choices.map(value=>value===count)),
    explanation:'図の番号順に，読取りではその時点のカウンタに1を足した値を閲覧者ごとに一時的に保持し，書込みでその値を格納する。'+
      '閲覧者1の書込み値は'+updates[0]+'，閲覧者2は'+updates[1]+'。最後に書き込まれた'+count+'が答えである。'};
}
function references(i:number):GeneratedBody {
  const schema=spring2006AmSchema(i), [item,order,customer]=schema;
  const itemCode=item.fields[0].name;
  const [referenced,other]=i%2===0?[item,customer]:[customer,item];
  const operations=['“'+other.name+'”表への新規レコード追加','“'+referenced.name+'”表のレコード削除',
    '“'+referenced.name+'”表のレコードの'+(referenced===item?itemCode:customer.fields[0].name)+'の変更',
    '“'+order.name+'”表への新規レコード追加'];
  const permutation=[[0,1,2,3],[1,2,3,0],[2,0,3,1],[3,1,0,2]][i], key=permutation.indexOf(0);
  const prompt=source[63].prompt.replace('“商品”，“注文”，“顧客”',schema.map(row=>'“'+row.name+'”').join('，'));
  return {prompt:[p(prompt),draw('63-keys',i,'三つの表の主キーと外部キー')],
    choices:strings(permutation.map(n=>operations[n])),correctIndex:key,
    explanation:'“'+other.name+'”への追加は，外部キーの参照先を確認したり既存の参照を切ったりしない。'+
      '“'+referenced.name+'”の削除やキー変更は既存の“'+order.name+'”からの参照を壊す場合がある。また“'+order.name+'”へ追加するには参照先の行が必要である。'};
}
function encryption(i:number):GeneratedBody {
  const cases=[
    {prompt:source[64].prompt, sender:'顧客',receiver:'商店'},
    {prompt:'ある商店が，ネットワークを通じて顧客へ見積り（メッセージ）を送る。公開鍵暗号方式を利用して，見積りの内容を第三者に分からないようにするには，商店，顧客それぞれが利用する鍵の適切な組合せはどれか。',sender:'商店',receiver:'顧客'},
    {prompt:'ある商店が，顧客からネットワークを通じて情報（メッセージ）を受信する。公開鍵暗号方式を利用して，情報を受信者だけが読めるようにするには，商店，顧客それぞれが利用する鍵の適切な組合せはどれか。',sender:'顧客',receiver:'商店'},
    {prompt:'ある商店が，ネットワークを通じて顧客へ個別の回答（メッセージ）を送る。公開鍵暗号方式を利用して，回答の内容を第三者に分からないようにするには，商店，顧客それぞれが利用する鍵の適切な組合せはどれか。',sender:'商店',receiver:'顧客'},
  ];
  const {prompt,sender,receiver}=cases[i], rows=source[64].choices.map(choice=>choice.split('｜'));
  const receiverPosition=receiver==='商店'?0:1;
  return {prompt:[p(prompt)],choices:rows.map(row=>[table('使用鍵',['商店','顧客'],[row])]),
    correctIndex:unique(rows.map(row=>row[receiverPosition]==='秘密鍵'&&row[1-receiverPosition]==='公開鍵')),
    explanation:sender+'は受信する'+receiver+'の公開鍵でメッセージを暗号化する。' + receiver+
      'は自分の秘密鍵で復号する。表が示すのは使用する鍵の種類で，鍵の組は受信側のものである。'};
}

const finance=[[80,10,200],[75,10,240],[70,15,300],[85,5,200]];
function cost(i:number):GeneratedBody {
  const [costRate,margin,profit]=finance[i], sales=100*profit/margin, amount=sales*costRate/100;
  const values=i===0?[...source[73].choices]:[amount-profit,amount,sales-profit,sales].sort((a,b)=>a-b).map(num);
  return {prompt:[p(source[73].prompt),table('当期の分析結果',['項目','値'],[
    ['売上原価率',costRate+'％'],['売上高営業利益率',margin+'％'],['営業利益',num(profit)+'万円'],
  ])],choices:strings(values),correctIndex:unique(values.map(option=>option===num(amount))),
    explanation:'営業利益が売上高の'+margin+'％なので，売上高は'+num(profit)+'÷'+margin+'×100＝'+num(sales)+'万円。'+
      '売上原価率は'+costRate+'％なので，売上原価は'+num(sales)+'×'+costRate+'÷100＝'+num(amount)+'万円となる。'};
}
function analysisChart(i:number):GeneratedBody {
  const prompt=[source[75].prompt,'線形計画法における実行可能領域を表す図はどれか。','品質管理で用いる特性要因図はどれか。','階層型のクラスター分析の結果を表す図はどれか。'][i];
  const answer=[0,2,3,0][i], options=spring2006AmAnalyses(i);
  return {prompt:[p(prompt)],choices:options.map((_,j)=>[draw('75-option-'+(j+1),i,'分析結果の図')]),correctIndex:options.indexOf(answer),
    explanation:[
      '階層型のクラスター分析では，近いグループが順に合流する関係を樹形図（デンドログラム）で表す。',
      '複数の線形制約を満たす点の集まりは，各直線が作る境界の内側にある。該当する範囲が斜線で示されている。',
      '原因の候補を枝で追加し，矢印の先に結果を置く。全体が魚の骨のような形になる。',
      '樹形図で，個々の対象や小集団が組み合わさってより大きい集団になる関係を確認できる。',
    ][i]};
}
const games=[
  [[-15,20],[5,0]], [[10,-20],[-8,15]], [[12,20],[5,-5]], [[15,-12],[-4,30]],
];
const signed=(n:number)=>String(n).replace('-','−');
function game(i:number):GeneratedBody {
  const values=games[i], [best1,best2]=values.map(v=>Math.min(...v));
  const [worst1,worst2]=[0,1].map(col=>Math.min(...values.map(row=>-row[col])));
  const a=best1>best2?0:1,b=worst1>worst2?0:1,result=values[a][b];
  const options=values.flat().sort((a,b)=>a-b).map(signed);
  const rows=values.map((row,j)=>['戦略a'+(j+1),...row.map(n=>signed(n)+'，'+signed(-n))]);
  return {prompt:[p(source[76].prompt),table('両社の戦略と利得',['A社＼B社','戦略b1','戦略b2'],rows)],
    choices:strings(options),correctIndex:unique(options.map(option=>option===signed(result))),
    explanation:'A社の戦略ごとの最小利得は'+signed(best1)+'，'+signed(best2)+'なので戦略a'+(a+1)+'。B社の戦略ごとの最小利得は'+
      signed(worst1)+'，'+signed(worst2)+'なので戦略b'+(b+1)+'を選ぶ。組み合わさる欄のA社の利得は'+signed(result)+'。'};
}
const regressions=[[0.8,1.1,10],[0.75,1.2,5],[0.7,0.85,-3],[0.9,0.95,-2]];
function scores(i:number):GeneratedBody {
  const [correlation,slope,intercept]=regressions[i], easier=slope>1?'しやすい':'しにくい';
  const entries=[
    i===0?source[77].choices[0]:'回帰直線のy切片の絶対値は，今年度の問題の得点が0点に対応する昨年度の得点と正確に一致する。',
    source[77].choices[1].replace('1.1倍',slope+'倍'),
    source[77].choices[2].replace('しやすい',easier),
    source[77].choices[3],
  ];
  const order=[[0,1,2,3],[1,2,3,0],[2,0,3,1],[1,3,0,2]][i];
  return {prompt:[p(source[77].prompt),p('〔結果〕\n相関係数は，'+correlation+'であった。\n回帰直線の傾きは，'+slope+
    'であった。\n回帰直線のy切片の値は，'+signed(intercept)+'であった。')],
    choices:strings(order.map(j=>entries[j])),correctIndex:order.indexOf(2),
    explanation:'昨年度の得点xと予測した今年度の得点yの差は，y−x＝（'+slope+'−1）x＋（'+signed(intercept)+'）。'+
      '得点xは0以上なのでこの差は'+(slope>1?'正':'負')+'になる。相関係数や傾きだけで試験の質を評価することはできない。y切片は昨年度の得点が0のときの今年度の予測値で，逆向きの予測には使えない。'};
}

const numeric:Readonly<Record<number,{build:(index:number)=>GeneratedBody;notes:string;fixed?:boolean}>>={
  54:{build:protocols,notes:'3層と上下の順序をそろえた四図。TCP・UDPとIP版を可変にする。'},
  55:{build:response,notes:'距離遅延なし，上下の送受信量，伝送効率と端末処理を同じ表で可変化。一桁小数と昇順を維持。'},
  57:{build:device,notes:'ステーション・LANの二つのセグメント・装置の位置を保ち，データが到達する層数を変更する。'},
  58:{build:normalize,notes:'複合主キーから4属性，各一成分からの部分従属を可変にする。解答群の関係スキーマを置換し，分解の結合と従属を検算。'},
  61:{build:visit,notes:'閲覧者2人の読取・加算と書込の内訳を維持し，初期値と実行順を変更する。数値候補は昇順。'},
  63:{build:references,notes:'三つの表，実線の主キー・破線の外部キー，二つの親を保持。親子と操作対象を可変にしてSQLでも検証。'},
  64:{build:encryption,notes:'商店・顧客と二鍵型4組の表を維持し，受信側を可変にする。'},
  73:{build:cost,notes:'当期営業利益，営業利益率，原価率の表を可変にし，数値の昇順を保持する。'},
  75:{build:analysisChart,notes:'四種の図を維持し，求める方法・各図の形状と位置を変える。'},
  76:{build:game,notes:'二社，2×2セルの対になった利得とマキシミンの問を保持。符号付き整数と昇順選択肢を維持。'},
  77:{build:scores,notes:'軸の役割・相関・回帰直線の傾きと切片の結果欄を維持。推定差の符号と全肢を検算する。'},
};
export const legacy2006SpringAm54To80Definitions:GenerationDefinition[]=Object.entries(source).map(([n,item])=>{
  const number=Number(n), model=numeric[number];
  return {source:'2006h18h-fe-am-'+n,title:item.title,sourceAnswer:item.key,version:'3.7.0',fields:[field('対象・判断条件',0,3)],reference:[0],
    notes:variableNotes+' 原冊子p.'+item.page+'。'+(model?.notes??'原問の方向・四択と判断条件を保持し，対象・状況を可変にする。'),
    ...(model?.fixed?{answerVariation:'fixed' as const}:{}),
    build(values){
      const [i]=values;
      if(values.length!==1||!Number.isSafeInteger(i)||i<0||i>3)throw new DataError('PARAMETER_CONSTRAINT','2006年度春期旧午前の入力が範囲外です');
      if(model)return model.build(i);
      const selected=knowledge[number][i];
      return {prompt:[p(selected.prompt)],choices:strings([...selected.choices]),correctIndex:selected.correctIndex,explanation:selected.explanation};
    }};
});
