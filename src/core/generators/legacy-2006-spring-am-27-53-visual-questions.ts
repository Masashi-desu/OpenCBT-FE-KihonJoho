import { p,strings,table } from './definition';
import { finite,original } from './legacy-2006-spring-am-27-53-shared';
import { chargeNames,classCases,classRelations,codeCases,controlNames,dayCases,drawing,edges,qualityCases } from './legacy-2006-spring-am-27-53-figures';

const flow=finite(36,'図に表される制御構造','分岐・後判定反復・片側分岐・前判定反復の4図の形式、順序、戻り線を維持して問う構造を変える。',index=>{
  const structures=[
    original(36).prompt,
    'プログラムの制御構造のうち，処理を少なくとも1回行い，その後で繰返しの条件を判定する構造はどれか。',
    'プログラムの制御構造のうち，条件によって一つの処理を実行するか省略するかを選び，どちらも次の手順に進む構造はどれか。',
    'プログラムの制御構造のうち，条件に応じて異なる二つの処理のうち一方だけを行い，その後に合流する構造はどれか。',
  ];
  const why=[
    'while 型は処理の前に条件を判定し，処理を行った後には同じ条件へ戻る。初回から条件が満たされなければ，処理を実行せずに抜ける。',
    '最初は条件を通らずに処理する。処理後に条件を判定し，満たせば前へ戻る。繰返しが不要な場合でも初回の処理は行われる。',
    '条件から分かれる一方の経路だけに処理がある。どちらの経路も戻らず，その後は同じ処理へ進む。',
    '条件に続く二つの経路に一つずつ処理がある。一方の処理を行ったあとで合流し，判定には戻らない。',
  ];
  return {prompt:[p(structures[index])],choices:controlNames.map(name=>[drawing(name,index)]),correctIndex:[3,1,2,0][index],explanation:why[index]};
});

const uml=finite(39,'UMLクラス間の線の種類','4クラス・4つの線と同じ4対の選択肢を保持し、集約の白いひし形が付く関係を可変化する。',index=>{
  const model=classCases[index], [whole,part]=classRelations[model.indexOf(1)];
  return {prompt:[p(original(39).prompt),drawing('39-uml',index)],choices:strings(original(39).choices),
    correctIndex:model.indexOf(1),explanation:'共有集約では，全体を示す側に白いひし形を置く。この図ではクラス '+whole+' にひし形が付き，クラス '+part+' との関係が該当する。白い三角形の付く汎化や点線の依存とは記号が異なる。'};
});

const subtract=finite(42,'流れ図を通る番号と初期値の比','流れ図、正の整数a・b、四つの比例式を保持。要求する経路を変え，大小比較と終了条件を同時に満たす必要がある。',index=>{
  const traces=[
    '① → ② → ③ → ⑤ → ② → ③ → ④ → ② → ⑥',
    '① → ② → ③ → ④ → ② → ⑥',
    '① → ② → ③ → ⑤ → ② → ⑥',
    '① → ② → ③ → ④ → ② → ③ → ⑤ → ② → ⑥',
  ];
  const explanation=[
    '⑤の後は n＝b−a，m＝a。続く④の後は m＝a−(b−a)＝2a−b。②で m＝n なので 2a−b＝b−a，すなわち 3a＝2b。正の整数なら途中の大小条件も満たす。',
    '初めに④を通るため a＞b。次の②で m＝a−b と n＝b が等しくなるので，a＝2b。',
    '初めに⑤を通るため a＜b。次の②で m＝a と n＝b−a が等しくなるので，2a＝b。',
    '最初の④で m＝a−b，続く⑤で n＝b−(a−b)＝2b−a。最後の②で a−b＝2b−a が成立する必要があるので，2a＝3b。',
  ];
  return {prompt:[p(original(42).prompt),p(traces[index]),p('の順に実行させるために，①において m と n に与えるべき初期値 a と b の関係はどれか。ここで，a，b はともに正の整数とする。'),drawing('42-subtract',index)],
    choices:strings(original(42).choices),correctIndex:[3,0,1,2][index],explanation:explanation[index]};
});

const quality=finite(44,'テスト密度・未解決数・累積検出曲線','テスト表・aとbの規模と難度・2曲線・4択を保持。収束、伸び、終点の高さ、未解決の有無を区別して比較する。',index=>{
  const {density,sizes,testCounts,open}=qualityCases[index];
  const context=index===0?'':index===1?' 両図の縦軸の目盛は共通とする。':
    index===2?' 両図の縦軸の目盛は共通とする。同規模・同程度のテスト密度で両曲線が収束し，検出数と未解決数も同程度なら，この比較では品質を同程度と評価する。':
    ' 両図の縦軸の目盛は共通とする。基準密度以上で，終盤に検出が収束し，未解決が0件ならこの工程でのテストは十分とする。';
  const assessed=[
    original(44).choices,
    ['a のみ検出数が収束したので，品質は b よりも高い。','どちらも終盤までバグ検出数が増えているので，追加テストが必要である。','終盤の検出数が一致し，曲線も収束したので，品質は同程度である。','どちらも未解決バグは0件で，追加確認は不要である。'],
    ['a のみ収束しているため，品質は b よりも高い。','どちらも終盤まで検出数が増えているため，追加テストが必要である。','両方の検出が収束し，規模，テスト密度，検出数，未解決数が同程度なので，品質は同程度と評価する。','未解決数だけで十分なテストと判定し，検出傾向は評価に用いない。'],
    ['a の検出だけが収束したため，a のテストにだけ十分な根拠がある。','両方の検出数が最後まで増えており，テスト密度も基準未満なので追加テストが必要である。','バグの累積検出数はほぼ同じなので，開発規模を同一とみなせる。','両方とも基準密度以上で，検出数は終盤に収束し，未解決バグは0件なので，この工程のテストは十分である。'],
  ];
  const why=[
    '単位規模当たりのテスト項目数は，両方とも基準の10で未解決バグも0件。a の曲線は終盤にほぼ水平だが，b は終了時も増加中。この条件で a の方が収束しており，テスト結果の品質指標は良い。図だけで残存バグの有無を断定することはできない。',
    '両方とも検出数が終盤まで増え，未解決バグも残る。テスト項目数だけでは品質が安定したとは判断できない。',
    '同じ規模と密度でテストしており，終盤の収束，累積検出数，未解決数が一致する。この問題で定めた指標による評価は同程度になる。',
    '項目数を開発規模で割ると両方で基準以上。二つの線とも終盤で水平になり，未解決バグは0件。この工程で十分とする三条件を満たす。',
  ];
  return {prompt:[p(original(44).prompt.replace('10 項目',density+' 項目')+context),
    table('テストに関するデータ',['サブシステム名','開発規模','テスト項目数','未解決バグ数'],
      sizes.map((size,i)=>['ab'[i],size+' k ステップ',String(testCounts[i]),String(open[i])])),
    p('また，現在までのバグ検出状況は次のグラフで示される。'),drawing('44-quality',index),
    p('サブシステム a，b の難易度を同等とすると，現状を適切に評価している記述はどれか。')],
    choices:strings(assessed[index]),correctIndex:index,explanation:why[index]};
});

const critical=finite(46,'アローダイアグラムの作業日数','14作業の依存関係、日数、クリティカルパスの4経路を保持。提示外を含む全経路の最大が一意となる日数。',index=>{
  const days=dayCases[index];
  const sequences:{path:string;sum:number}[]=[];
  function follow(current:number,path:string[],sum:number){
    if(current===10) {sequences.push({path:path.join('－'),sum});return;}
    edges.forEach(([from,to],i)=>{if(from===current) follow(to,[...path,String.fromCharCode(65+i)],sum+days[i]);});
  }
  follow(0,[],0);
  const longest=sequences.reduce((best,route)=>route.sum>best.sum?route:best);
  return {prompt:[p(original(46).prompt),drawing('46-critical',index)],choices:strings(original(46).choices),
    correctIndex:original(46).choices.indexOf(longest.path),explanation:'起点から終点まで連続する作業の日数を足す。'+sequences.map(row=>row.path+' は '+row.sum+' 日').join('，')+'。最大の '+longest.sum+' 日となる '+longest.path+' がクリティカルパスである。'};
});

const jan=finite(48,'JANコードの左12けた','右から数える奇数・偶数の重み、1の位が0の例外、末尾付加を保持。12けたの数字列だけ変更し、図では検査数字を伏せる。',index=>{
  const digits=codeCases[index];
  const [odd,even]=[...digits].reverse().reduce(([a,b],digit,i)=>i%2?[a,b+Number(digit)]:[a+Number(digit),b],[0,0]);
  const sum=odd*3+even,check=(10-sum%10)%10,choices=original(48).choices;
  return {prompt:[p(original(48).prompt.replace('123456789012',digits)),p('〔JAN コードにおける検査数字の算出及び付加方式〕'),
    p('（1）検査数字を付加する前の右端の数字の位置を奇数けたとし，左に向かって交互に奇数けたと偶数けたとする。'),
    p('（2）偶数けたの数字の合計を求める。'),p('（3）奇数けたの数字の合計を求め，その値を3倍する。'),
    p('（4）（2）と（3）の合計を求める。'),p('（5）（4）の値の1の位の数字を10から引く。ただし，1の位が0のときは0とする。例えば，（4）の値が123のときは10−3＝7，120のときは0とする。'),
    p('（6）（5）で求めた数字を検査数字とし，右端けたの右に付加する。'),drawing('48-jan',index)],
    choices:strings(choices),correctIndex:choices.indexOf(String(check)),explanation:'右端から数えた奇数けたの和は '+odd+'，偶数けたの和は '+even+'。'+odd+'×3＋'+even+'＝'+sum+'。この合計の1の位から検査数字 '+check+' を求め，末尾に付ける。'};
});

const tariff=finite(49,'使用量と利用料金の関係','4グラフ・使用量と料金の軸・原点の0を保持。正の増分単価の逓減、課金上限、逓増、割引による総額減少を区別する。',index=>{
  const axes='ここで，横軸を使用量，縦軸を利用料金とする。';
  const stems=[original(49).prompt,
    'コンピュータシステムの利用料金を，従量単価は一定で，請求額が上限に達した後は追加料金がかからない方式にしたときのグラフはどれか。'+axes,
    'コンピュータシステムの利用料金を逓増課金方式にしたときのグラフはどれか。'+axes,
    'コンピュータシステムの利用料金を固定額から従量分の割引を差し引く方式にした。使用量が増えるほど割引後の請求額が下がるときのグラフはどれか。'+axes];
  const why=[
    '逓減課金では，使用量が大きくなるほど追加分の単価が低くなる。合計料金は増えるが，傾きは段階的に小さくなる。',
    '上限までは一定の単価で右上がりになる。上限に達してからは請求額が変わらないので水平になる。',
    '逓増課金では使用量が多い区間ほど増分単価が上がるため，グラフがだんだん急になる。',
    '使用量が0のときは固定額で，使用量に比例した割引が増えると総額は低下する。',
  ];
  return {prompt:[p(stems[index])],choices:chargeNames.map(name=>[drawing(name,index)]),
    correctIndex:[2,1,3,0][index],explanation:why[index]};
});
export const figureDefinitions=[flow,uml,subtract,quality,critical,jan,tariff];
