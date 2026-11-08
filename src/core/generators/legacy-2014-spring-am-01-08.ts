import { code, p, strings, table } from './definition';
import type { Block } from '../types';
import { define, marks, source, text } from './legacy-2014-spring-am-01-26-shared';
import { concatenationCases, spring2014Am0126Figure, spring2014Am0126Profiles as profiles, treeCases } from './legacy-2014-spring-am-01-26-figures';

const binaryDecimals=[
  ['0.05','0.125','0.375','0.5'], ['0.04','0.2','0.25','0.4'],
  ['0.125','0.25','0.35','0.5'], ['0.25','0.375','0.5','0.6'],
];
const decimalBases=[2,5,4,8];
function binaryFraction(decimal:string) {
  const digits=decimal.split('.')[1], denominator=10**digits.length;
  let numerator=Number(digits), divisor=denominator;
  while(divisor!==0)[numerator,divisor]=[divisor,numerator%divisor];
  return [Number(digits)/numerator,denominator/numerator] as const;
}

const parityPositions=[7,0,5,4];
const hex=(value:number)=>value.toString(16).toUpperCase().padStart(2,'0');
const powers=['最上位','最下位','下位から6番目','下位から5番目'];

const fixedLiterals=['C','A','B','C̄'];
const product=(letters:string[])=>letters.join('・');
function logicInput(i:number) {
  const fixed=fixedLiterals[i], free=[...'ABC'].filter(letter=>letter!==fixed[0]);
  return [[true,true],[false,true],[true,false],[false,false]]
    .map(negations=>product([...free.map((letter,j)=>letter+(negations[j]?'̄':'')),fixed].sort()))
    .join('＋');
}
function logicFormula(value:string):Block {
  return {
    type:'formula',format:'unicode',text:value,
    alt:value.replace(/([ABC])̄/g,'（$1の否定）').replaceAll('・',' と ').replaceAll('＋',' 又は '),
  };
}

const stateColumns=['空白','数字','符号','小数点','その他'];
const stateCases=[
  { rows:['abcde','abede','ebede','aeeee'], strings:['＋0010','－1','12.2','9.△'] },
  { rows:['abcde','abede','ebede','abeee'], strings:['1.2','7.△','－12','1＋2'] },
  { rows:['abcde','abede','abede','aeeee'], strings:['＋△10','3..','－12','4.△'] },
  { rows:['abcde','ebede','ebede','abeee'], strings:['12△3','0.5','－12','7.△'] },
];
function traceState(rows:string[],word:string) {
  let state='a';
  const trace=[state];
  for(const char of word) {
    const kind=char==='△'?0:/[0-9]/.test(char)?1:/[＋－]/.test(char)?2:char==='.'?3:4;
    state=rows['abcd'.indexOf(state)][kind];
    trace.push(state);
    if(state==='e')break;
  }
  return trace;
}

type Tree=(typeof treeCases)[number];
type Visit='pre'|'in'|'post';
function treeOutput(tree:Tree|undefined,order:Visit):string {
  if(!tree)return '';
  const [symbol,left,right]=tree, l=treeOutput(left,order), r=treeOutput(right,order);
  return order==='pre'?symbol+l+r:order==='in'?l+symbol+r:l+r+symbol;
}

const stackCases=[
  ['push(a)','push(b)','enq(pop())','enq(c)','push(d)','push(deq())','x ← pop()'],
  ['push(a)','push(b)','enq(c)','enq(pop())','push(d)','push(deq())','x ← pop()'],
  ['push(b)','push(a)','enq(pop())','enq(c)','push(d)','push(deq())','x ← pop()'],
  ['push(a)','push(b)','enq(pop())','enq(c)','push(deq())','push(d)','x ← pop()'],
];
function traceContainers(instructions:string[]) {
  const stack:string[]=[], queue:string[]=[];
  const invoke=(expression:string):string=>{
    const parenthesis=expression.indexOf('('), op=expression.slice(0,parenthesis);
    const value=expression.slice(parenthesis+1,-1);
    if(op==='pop')return stack.pop()!;
    if(op==='deq')return queue.shift()!;
    if(op==='push'||op==='enq')(op==='push'?stack:queue).push(value.includes('(')?invoke(value):value);
    return value;
  };
  return instructions.slice(0,-1).map(line=>{
    invoke(line);
    return '（'+(stack.join('，')||'空')+'／'+(queue.join('，')||'空')+'）';
  }).concat([invoke(instructions.at(-1)!.split(' ← ')[1])]);
}

const distributions=['正規分布','一様分布','指数分布','ポアソン分布'];
const distributionExplanations=[
  '正規分布は平均を中心とする左右対称な釣鐘形の連続分布。バスタブ形は故障率の説明で現れ、等確率と一定率の事象の計数は別の分布を表す。',
  'ここでの離散一様分布は、有限個の結果に等しい確率を割り当てる。連続の待ち時間・釣鐘形の密度・一定期間の件数の分布とは異なる。',
  '一定率で独立に生じる事象の次回までの時間は連続の指数分布に従う。時間を固定して数える場合はポアソン分布。',
  '一定率で独立に生じる事象を固定時間内に数えるので、値は非負の整数。次の発生までの時間を扱う指数分布とは区別する。',
];

export const spring2014Am01To08=[
  define(1,'昇順の10進小数4値',binaryDecimals.length,'小数桁は1〜3桁。表す基数と値を変え、無限小数を選ぶ方向と数の昇順を維持する。',i=>{
    const options=binaryDecimals[i];
    const ratios=options.map(binaryFraction);
    const base=decimalBases[i];
    const correct=ratios.findIndex(([,denominator])=>base**3%denominator!==0);
    const description=ratios.map(([n,d],j)=>marks[j]+'の'+options[j]+'＝'+n+'/'+d).join('、');
    return text(1,i,source[1].prompt.replace('2進数',base+'進数'),correct,
      description+'。有限小数の既約分母は基数の累乗を割り切る。'+marks[correct]+'だけ、約分しても分母に'+base+'の素因数ではない数が残る。',options);
  }),
  define(2,'8ビット符号のパリティ位置',parityPositions.length,'ビット演算四択。パリティ位置を0、残る7桁を元の位置のまま保持する。',i=>{
    const mask=255-(1<<parityPositions[i]);
    const wrong=i===0?15:[0,127,63,15][i];
    const options=[
      '16進数'+hex(wrong)+'とのANDをとる。','16進数'+hex(wrong)+'とのORをとる。',
      '16進数'+hex(mask)+'とのANDをとる。','16進数FFとのXOR（排他的論理和）をとる。',
    ];
    return text(2,i,powers[i]+'をパリティビットとする8ビット符号において，パリティビットの位置だけを0にし，残りの7ビットを元の位置のまま得るビット演算はどれか。',2,
      '16進数'+hex(mask)+'は2進で'+mask.toString(2).padStart(8,'0')+'。ANDは1の位置を保存し、0の位置を0にする。ほかのマスクとのANDは保存すべき位置も消す場合があり、ORは元の0を1にする位置がある。FFとのXORは全ビットを反転する。',options);
  }),
  define(3,'4積項で共通に取るリテラル',fixedLiterals.length,'二つの自由変数を全て列挙し、残る一変数を共通に持つ。選択肢は積、積和、積和、1リテラルの順。',i=>{
    const expression=logicInput(i);
    const options=['A・B・C','A・B・C＋Ā・B̄・C','A・B＋B・C',fixedLiterals[i]];
    return {
      prompt:[p('次の論理式と恒等的に等しいものはどれか。'),logicFormula(expression),
        p('ここで，・は論理積，＋は論理和，ĀはAの否定を表す。')],
      choices:options.map(option=>[logicFormula(option)]),correctIndex:3,
      explanation:'各積項に'+fixedLiterals[i]+'が共通する。残り二変数について、00、01、10、11のどの場合も四つの積項のうち一つを選べる。したがって式の真偽は共通する'+fixedLiterals[i]+'の値だけで決まる。ほかの積・積和は真になる入力組が異なる。',
    };
  }),
  define(4,'説明する確率分布',distributions.length,'確率分布を指定して説明を選ぶ。等確率・分布形・一定率の計数を区別。',i=>{
    const choices=i===0?source[4].choices:[
      '一定率で独立に生じる事象について，次の発生までの待ち時間を表す連続確率分布のこと',
      '有限個のどの結果も同じ確率で生じる離散確率分布のこと',
      source[4].choices[2],
      '一定率で独立に生じる事象について，固定時間内の発生回数を表す離散確率分布のこと',
    ];
    const name=i===1?'離散一様分布':distributions[i];
    return text(4,i,name+'の説明として，適切なものはどれか。',[2,1,0,3][i],distributionExplanations[i],choices);
  }),
  define(5,'文字種別の遷移と候補文字列',stateCases.length,'初期a、e到達時拒否、左端、△の注意を保持。状態の遷移先と検査候補を変える。',i=>{
    const {rows,strings:words}=stateCases[i];
    const traces=words.map(word=>traceState(rows,word));
    return {
      prompt:[p(source[5].prompt),table('文字別の状態遷移表',['現在の状態',...stateColumns],rows.map((row,j)=>['abcd'[j],...row]))],
      choices:strings(words),correctIndex:traces.findIndex(trace=>trace.at(-1)==='e'),
      explanation:'表を使ってaから左端の文字を順に調べると，'+traces.map((trace,j)=>marks[j]+' '+trace.join('→')).join('、')+'。eが現れた時点で不合格。それ以外は文字列の検査を終えてもeに到達しない。',
    };
  }),
  define(6,'二分木の枝と演算記号',treeCases.length,'ノード7個、根からの再帰、左右の子が存在するときだけ実行、処理後の出力。四つの走査順を比較する。',i=>{
    const tree=treeCases[i], answer=treeOutput(tree,'post');
    const options=[treeOutput(tree,'pre'),treeOutput(tree,'in'),answer,treeOutput(tree[2],'in')+tree[0]+treeOutput(tree[1],'in')];
    return {
      prompt:[p(source[6].prompt),code('Proc(n) {\n  nに左の子lがあればProc(l)を呼び出す。\n  nに右の子rがあればProc(r)を呼び出す。\n  nの記号を出力して終了する。\n}'),
        spring2014Am0126Figure(profiles.tree,i,'記号をもつ2分木')],
      choices:strings(options),correctIndex:2,
      explanation:'各ノードで左部分木の出力、右部分木の出力、そのノードの記号の順。根では左から'+treeOutput(tree[1],'post')+'、右から'+treeOutput(tree[2],'post')+'、最後に'+tree[0]+'が出る。根の記号を先に、又は左右の間に出す選択肢は実行順が異なる。',
    };
  }),
  define(7,'手続中の積み込み・挿入順',stackCases.length,'データa,b,c,dの選択肢順と関数定義を保持。7行の実行順を可変化。',i=>{
    const steps=stackCases[i], trace=traceContainers(steps);
    return {
      prompt:[p(source[7].prompt),p('〔関数の定義〕'),code('push(y)：データyをスタックに積む。\npop()：データをスタックから取り出して，その値を返す。\nenq(y)：データyをキューに挿入する。\ndeq()：データをキューから取り出して，その値を返す。'),
        p('〔手続〕'),code(steps.join('\n'))],
      choices:strings(source[7].choices),correctIndex:source[7].choices.indexOf(trace.at(-1)!),
      explanation:'スタックは後入れ先出し、キューは先入れ先出し。底から頂上／先頭から末尾の順で各手続直後を表すと'+
        trace.slice(0,-1).join('→')+'。最後はスタックの頂上の'+trace.at(-1)+'をxへ代入する。',
    };
  }),
  define(8,'連結順と格納先配列の開始位置',concatenationCases.length,'連続二ループとa・bの処理を維持。1始まりの添字で順序と書込み位置を変える。',i=>{
    const {first,second,start,ends}=concatenationCases[i];
    const initial='k'+(start===1?'':'＋'+(start-1)), offset=start===1?'':'＋'+(start-1);
    const options=[
      ['X(k)→Z('+initial+')','Y(k)→Z(m＋k'+offset+')'],
      ['X(k)→Z('+initial+')','Y(k)→Z(n＋k'+offset+')'],
      ['Y(k)→Z('+initial+')','X(k)→Z(m＋k'+offset+')'],
      ['Y(k)→Z('+initial+')','X(k)→Z(n＋k'+offset+')'],
    ];
    const prompt=source[8].prompt.replace('配列Xに格納した文字列の後ろに，配列Y', '配列'+first+'に格納した文字列の後ろに，配列'+second);
    return {
      prompt:[p(prompt+(start===1?'':' 配列Zへの書込みはZ('+start+')から始める。')),
        spring2014Am0126Figure(profiles.concatenation,i,'配列へ連結する流れ図')],
      choices:options.map(row=>[table('空欄の組合せ',['a','b'],[row])]),correctIndex:first==='X'?0:3,
      explanation:'最初のループで'+first+'の'+ends[0]+'文字を配列Zの'+start+'番目から書く。次のループは'+second+
        'の先頭をその直後に書くため、二つ目の格納先の添字は'+ends[0]+'＋k'+offset+'。最初の配列を逆にしたり、後ろの配列の長さを加えたりすると目的の連結にならない。',
    };
  }),
];
