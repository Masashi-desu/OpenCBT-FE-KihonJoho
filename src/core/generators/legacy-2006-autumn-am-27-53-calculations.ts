import { p, strings, table } from './definition';
import { finite, original } from './legacy-2006-autumn-am-27-53-shared';

const show = (values: readonly (number | string)[]) => values.join('，');
const prompt = (n: number, substitute = original(n).prompt) => p(substitute);
const savedChoices = (n: number) => strings(original(n).choices);
const fifoCases = [
  {sequence:[1,4,2,4,1,3],choices:[[1,4,3],[2,3,4],[3,4,2],[4,1,3]]},
  {sequence:[2,7,4,2,4,1],choices:[[1,7,4],[1,4,7],[2,1,4],[2,4,1]]},
  {sequence:[3,5,6,3,6,7],choices:[[3,7,6],[7,5,6],[5,6,7],[3,6,7]]},
  {sequence:[7,1,5,1,2,6],choices:[[2,1,6],[2,5,6],[1,2,6],[2,6,5]]},
] as const;
const fifo = finite(27, '仮想ページ参照列', '初期3ページ枠と6参照を維持。格納順と参照順の混同、最後の参照3個、枠位置の移動を誤答に使い、重複を除く。', index => {
  const {sequence,choices:candidates} = fifoCases[index];
  const frames: (number|string)[] = ['—','—','—'];
  let replacement = 0;
  const rows = sequence.map((value, i) => {
    if (!frames.includes(value)) {
      frames[replacement] = value;
      replacement = (replacement + 1) % frames.length;
    }
    return [String(i + 1), String(value), ...(i < 3 ? frames.map(String) : i === 5 ? ['［解答欄］','',''] : ['','',''])];
  });
  const [first, second, third] = sequence;
  const correctIndex = candidates.findIndex(row => show(row) === show(frames));
  const stem = original(27).prompt.replace('1，4，2，4，1，3', show(sequence)).replace('最初の 1，4，2', '最初の ' + show([first,second,third]))
    .replace('太枠部分','［解答欄］');
  return {prompt:[p(stem),table('ページの割当て',['割当てステップ','参照する仮想ページ番号','実記憶ページの状態：左','中央','右'],rows)],
    choices:candidates.map(row => [table('実記憶ページの状態',['左','中央','右'],[row.map(String)])]), correctIndex,
    explanation:'FIFO（先入れ先出し）は実記憶へ入った順を使う。既に入っているページを参照しても，次の置換先は変わらない。参照列 ' + show(sequence) + ' を先頭から処理した結果，枠の左から ' + show(frames) + ' となる。'};
});

const availability = finite(33, '稼働率を比較する四つの変更倍率', '正のMTBFとMTTR、倍率の同率／交差という4択の役割を維持。生成では初期条件と候補の倍率を変え，常に稼働率を高める変更を選ぶ。', index => {
  const cases = [
    { base: [10,2], pairs: [[2,2],[0.5,0.5],[2,0.5],[0.5,2]] },
    { base: [8,2], pairs: [[3,2],[1.5,1.5],[0.5,0.5],[0.5,2]] },
    { base: [9,3], pairs: [[3,3],[0.5,0.25],[0.25,0.25],[0.5,2]] },
    { base: [16,4], pairs: [[3,3],[0.5,0.5],[0.5,0.75],[1.5,0.75]] },
  ];
  const {base: [bt,rt], pairs}=cases[index];
  const correctIndex=pairs.findIndex(([up,down])=>up>down);
  const choices=index===0 ? original(33).choices : pairs.map(([up,down])=>'MTBF を '+up+' 倍にし，MTTR を '+down+' 倍にする。');
  return {prompt:[p((index ? '現在の MTBF は '+bt+' 時間，MTTR は '+rt+' 時間である。' : '') + original(33).prompt)],choices:strings(choices),correctIndex,
    explanation:'稼働率は MTBF ÷（MTBF＋MTTR）である。MTBF と MTTR に同じ倍率を掛けても稼働率は変わらない。候補の中で MTBF の倍率が MTTR の倍率より大きいのは，'+choices[correctIndex]+' このとき稼働率が大きくなる。'};
});

const partitions = [
  [[-2,-1,0], [1,2,3,4,5], [6,7,8]],
  [[4,5,6], [7,8,9,10], [11,12,13]],
  [[-7,-6,-5], [-4,-3,-2,-1], [0,1,2]],
  [[10,11,12], [13,14,15,16,17], [18,19,20]],
] as const;
const equivalence = finite(43, '無効・有効・無効の同値クラス', '3クラスと最小性を維持。境界全列挙・1クラス重複・1クラスだけの誤答から区別。', index => {
  const values = partitions[index];
  const [low, valid, high] = values;
  const raw = [[low[0],low.at(-1)!,valid[0],valid.at(-1)!,high[0],high.at(-1)!],[low.at(-1)!,valid[0],valid.at(-1)!,high[0]],[low[1],valid[2],high[0]],[valid[0],valid.at(-1)!]];
  const candidates = raw.map(row=>show(row).replaceAll('-','−'));
  const correctIndex=raw.findIndex(row=>row.length===values.length && values.every(group=>row.some(item=>(group as readonly number[]).includes(item))));
  return {prompt:[prompt(43),table('入力データの同値クラス',['同値クラス','データ'],values.map((items,i)=>[i===1?'有効同値クラス':'無効同値クラス',show(items).replaceAll('-','−')]))],choices:strings(candidates),correctIndex,
    explanation:'有効・無効にかかわらず，各同値クラスには代表を1個ずつ選ぶ。'+candidates[correctIndex]+' は三つのクラスを一つずつ通り，重複する代表がない。'};
});

const truth = (x: number) => x ? '真' : '偽';
const branchCases = [
  {first:'OR',second:'AND',done:[[1,0,0],[0,1,1]],choices:[[0,0,1],[1,0,1],[1,1,0],[1,1,1]]},
  {first:'AND',second:'OR',done:[[0,1,0],[1,0,0]],choices:[[0,0,1],[1,0,1],[0,1,1],[0,0,0]]},
  {first:'AND',second:'AND',done:[[0,1,0],[1,1,0]],choices:[[0,0,1],[1,0,1],[1,1,1],[0,1,1]]},
  {first:'OR',second:'OR',done:[[1,0,0],[0,1,0]],choices:[[0,0,1],[1,0,1],[1,1,1],[0,0,0]]},
] as const;
const branch = finite(44, '複合判定と実施済みのテスト', '三条件の複合判定と4択を保持。全判定の真偽を判定条件網羅として扱い，各部分条件の条件網羅とは区別。', index => {
  const {first,second,done,choices}=branchCases[index];
  const apply=(op:string,a:number,b:number)=>op==='OR'?Boolean(a||b):Boolean(a&&b);
  const evaluate=([a,b,c]: readonly number[])=>apply(first,a,Number(apply(second,b,c)));
  const missing=!evaluate(done[0]);
  const correctIndex=choices.findIndex(row=>evaluate(row)===missing);
  const columns=['条件1','条件2','条件3'];
  return {prompt:[prompt(44),p('条件1 '+first+'（条件2 '+second+' 条件3）'),p('判定条件網羅（分岐網羅）に基づいてテストする場合，追加するテスト項目として，適切なものはどれか。'),
    p('〔終了したテスト項目〕'),...done.map((row,i)=>p('（'+(i+1)+'）'+columns.map((label,k)=>label+'が'+truth(row[k])).join('，')))],
    choices:choices.map(row=>[table('追加候補',columns,[row.map(truth)])]),correctIndex,
    explanation:'終了した二つのテストでは複合判定全体がいずれも'+truth(Number(!missing))+'である。追加する組合せ '+choices[correctIndex].map(truth).join('，')+' では全体が'+truth(Number(missing))+'になり，真と偽の両方の分岐を通る。'};
});

const fp = finite(46, '機能別個数と問題文で定める補正係数', '5種の個数・重み付けと小数2桁の係数を使う。未補正値、補正に誤った係数を使う場合を誤答とする。加重や補正の途中に端数が残らず，昇順を維持。', index=>{
  const values=[[1,2,1,0,0],[2,3,1,1,0],[3,1,2,1,0],[0,1,2,1,1]][index];
  const weights=[4,5,10,7,4];
  const kinds=['外部入力','外部出力','内部論理ファイル','外部インタフェースファイル','外部照会'];
  const adjusted = [0.75,1.25,0.75,1.25][index];
  const sums=weights.map((weight,i)=>weight*values[i]);
  const total=sums.reduce((sum,value)=>sum+value,0);
  const result=total*adjusted;
  const choices=index===0 ? original(46).choices : [total*0.5,total*0.75,total,total*1.25].map(String);
  return {prompt:[prompt(46,original(46).prompt.replace('0.75',String(adjusted))),table('ユーザファンクションの個数と係数',['ユーザファンクションタイプ','個数','重み付け係数'],kinds.map((kind,i)=>[kind,String(values[i]),String(weights[i])]))],
    choices:strings(choices),correctIndex:choices.indexOf(String(result)),
    explanation:'各タイプについて個数に重み付け係数を掛けて足すと '+sums.join('＋')+'＝'+total+' となる。問題の補正係数 '+adjusted+' を掛けるので '+result+' ファンクションポイントである。'};
});

const costs = finite(50, 'プログラム規模・不良率・分類と修正対象', '規模・kステップ当たり率・年率・二つの分類と単価・修正対象を維持。余計な分類を修正する、対象を取り違える、発見率を省く誤答とする。', index=>{
  const cases=[
    [2000,0.04,20,20,200,50,0],
    [1500,0.04,25,40,200,50,1],
    [2400,0.05,25,50,200,100,0],
    [1800,0.05,20,25,200,100,1],
  ] as const;
  const [size,rate,annual,major,majorCost,minorCost,target]=cases[index];
  const name=['大','小'][target], sizeText=size.toLocaleString('en-US');
  const all=size*rate*annual/100;
  const majorTotal=all*major/100*majorCost, minorTotal=all*(100-major)/100*minorCost;
  const targetTotal=[majorTotal,minorTotal][target];
  const choices=index===0 ? original(50).choices : [majorTotal,minorTotal,majorTotal+minorTotal,targetTotal*100/annual]
    .sort((a,b)=>a-b).map(value=>value.toLocaleString('en-US'));
  return {prompt:[prompt(50),p('〔条件〕'),p('（1）プログラム規模：'+sizeText+' k ステップ'),
    p('（2）プログラムの潜在不良率：'+rate+' 件/k ステップ'),p('（3）潜在不良の年間発見率：'+annual+'%／年'),
    p('（4）発生不良の分類　影響度大の不良：'+major+'%，影響度小の不良：'+(100-major)+'%'),
    p('（5）不良1件当たりの修正費用　影響度大の不良：'+majorCost+'万円，影響度小の不良：'+minorCost+'万円'),
    p('（6）修正するのは，影響度'+name+'の不良だけとする。')],choices:strings(choices),
    correctIndex:choices.indexOf(targetTotal.toLocaleString('en-US')),
    explanation:'潜在不良は '+sizeText+'×'+rate+'＝'+size*rate+' 件。初年度の発見件数の期待値は '+size*rate+'×'+annual+'%＝'+all+' 件である。影響度'+name+'だけに分類割合と1件当たり費用を掛けると '+targetTotal+'万円となる。'};
});

const subnet = finite(52, '親ネットワークと分割先マスク', '4択の割当可能なアドレス総数と昇順を維持。ネットワーク・一斉同報の2アドレスは各サブネットで除外する。原問のクラスCと現代のCIDRを区別し，生成では親プレフィックスを明記。', index=>{
  const cases=[
    ['192.168.31.0',24,29],['192.168.26.0',24,28],['192.168.56.0',24,27],['192.168.90.0',25,28],
  ] as const;
  const [network,parentPrefix,childPrefix]=cases[index];
  const bytes=2**(32-childPrefix), subnetCount=2**(childPrefix-parentPrefix);
  const total=subnetCount*(bytes-2), raw=2**(32-parentPrefix);
  const mask='255.255.255.'+(256-bytes);
  const stem=index ? original(52).prompt.replace('192.168.31.0',network+'/'+parentPrefix).replace('255.255.255.248',mask):original(52).prompt;
  const alternatives=index===0?original(52).choices:[raw-raw/4,raw-raw/8,raw-raw/16,raw-2].map(String);
  return {prompt:[p(stem)],choices:strings(alternatives),correctIndex:alternatives.indexOf(String(total)),explanation:
    (index===0?'原問は従来のクラス C のネットワークとして /24 と読む。CIDR で扱うときは親ネットワークのプレフィックスも指定する。':'親は /'+parentPrefix+' と指定されている。')+
    '分割先は /'+childPrefix+' なので '+subnetCount+' サブネットに分かれる。各 '+bytes+' アドレスからネットワーク・ブロードキャスト用の2個を引くと，全体で '+subnetCount+'×'+(bytes-2)+'＝'+total+' 個を割り当てられる。'};
});

const parity = finite(53, 'パリティ方式と例示するビット列', '垂直パリティ一列の説明選択を維持し、奇偶の設定・1ビット反転の位置・複数ビット時の条件を変える。単一のパリティビットで誤り位置を識別できない。', index=>{
  const cases = [
    {mode:'',bits:'',flips:[]},
    {mode:'偶数',bits:'10110010',flips:[1]},
    {mode:'奇数',bits:'01010001',flips:[2,5]},
    {mode:'偶数',bits:'11100100',flips:[1,5,8]},
  ];
  const {mode,bits,flips}=cases[index];
  const ones=[...bits].filter(bit=>bit==='1').length;
  const received=[...bits].map((bit,k)=>flips.includes(k+1)?String(1-Number(bit)):bit).join('');
  const detected=flips.length%2===1;
  const options=index===0? original(53).choices:[
    'この反転は検出できるが，どのビットが反転したかまでは特定できない。',
    'この反転は検出でき，反転したすべての位置もパリティだけで特定できる。',
    'この反転は，パリティビット以外の誤りがあっても検出できない。',
    'この反転では，受信語の1の個数の奇偶が変わらないため誤りを検出できない。',
  ];
  if (index === 2) options[2]='奇数パリティなので，2 ビットの反転を検出できる。';
  const stem=index===0?original(53).prompt:
    '垂直パリティの '+mode+'パリティを採用し，末尾をパリティビットとした '+bits+' を送る。左から '+show(flips)+' 番目のビットだけが反転した。受信側で行うパリティチェックに関する記述のうち，適切なものはどれか。';
  return {prompt:[p(stem)],choices:strings(options),correctIndex:index===0||detected?0:3,
    explanation:(index?'送信語 '+bits+' の1の個数は '+ones+'，受信語は '+received+'。'+flips.length+' ビットの反転で奇偶は'+(detected?'変わるので誤りが分かる。':'変わらないので誤りが分からない。'):'')+
    '1 ビットが反転すると1の個数の奇偶が変わる。反転位置にかかわらず変化は同じなので，奇偶の検査だけでは位置を特定・訂正できない。同じ列の偶数個の反転では奇偶が変わらない。'};

});

export const calculationDefinitions = [fifo, availability, equivalence, branch, fp, costs, subnet, parity];
