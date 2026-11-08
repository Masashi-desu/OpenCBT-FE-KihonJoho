import { p, strings, table } from './definition';
import data from './legacy-2014-spring-pm-01-04-banks.json';
import { answers, bank, define, single } from './legacy-2014-spring-pm-01-04-shared';
import { hexWord, machineCases, machineWords } from './legacy-2014-spring-pm-01-04-models';
import { spring2014Pm0104Diagram as diagram, spring2014Pm0104Profiles as profiles } from './legacy-2014-spring-pm-01-04-figures';

const addressChoices=[[],[1,2,3,4,8,9],[1,2,3,4,6,8],[1,2,3,4,7,10]];
const registerRows=(r:readonly number[])=>r.map((value,number)=>[String(number),hexWord(value)]);
const mainMemory=(i:number)=>{
  const c=machineCases[i];
  return [...c.memory.map((value,j)=>[j+1,value] as const),...machineWords(c.branch).map((value,j)=>[j+16,value] as const)];
};
function decode(word:number,r:number[]) {
  const op=word>>>12, rm=(word>>>10)&3, x=(word>>>8)&3, b=(word>>>6)&3, d=word&63;
  return {op,rm,address:(x?r[x]:0)+(b?r[b]:0)+d};
}
function evaluate(i:number) {
  const c=machineCases[i], memory=new Map(mainMemory(i)), r:number[]=[...c.registers];
  const address=decode(c.instruction,r).address;
  let cc=0, pc=16;
  const trace:{pc:number;registers:number[];cc:number;taken:boolean}[]=[];
  while(pc<=22) {
    const instruction=memory.get(pc);
    if(instruction===undefined)throw Error('PARAMETER_CONSTRAINT');
    const {op,rm,address}=decode(instruction,r);
    const taken=op===4&&(rm&cc)!==0;
    if(op!==4){
      const operand=memory.get(address);
      if(operand===undefined)throw Error('PARAMETER_CONSTRAINT');
      r[rm]=op===1?r[rm]|operand:op===2?r[rm]&operand:r[rm]^operand;
      cc=r[rm]===0?2:1;
    }
    trace.push({pc,registers:[...r],cc,taken});
    pc=taken?address:pc+1;
  }
  return {address,trace};
}

export function spring2014Pm2Pages(i:number) {
  const c=machineCases[i], addresses=i===0?data.q2[0]:addressChoices[i].map(hexWord);
  const cells=mainMemory(i).map(([address,word])=>[hexWord(address),hexWord(word)]);
  return [
    [
      p('次の問2から問7までの6問については，この中から4問を選択し，選択した問題については，答案用紙の選択欄の（選）をマークして解答してください。なお，5問以上マークした場合には，はじめの4問について採点します。'),
      p('問2　機械語命令に関する次の記述を読んで，設問1，2に答えよ。'),
      p('命令語の形式を，図1に示す。'),
      diagram(profiles.word,0,'図1　命令語の形式'),
      p('図1で使用している記号の説明を，表1に示す。数字の末尾にhが付いているものは16進数表記である。'),
      table('表1　記号の説明',['記号','説明'],[
        ['op','命令コード'],['r','レジスタ番号'],['m','分岐命令で分岐の判定に使用する値'],
        ['x','指標レジスタとして使用するレジスタの番号'],['b','ベースレジスタとして使用するレジスタの番号'],
        ['d','00h〜3Fhで示されるアドレスの変位'],
      ]),
      p('（1）この命令語を実行するコンピュータの1語は16ビットであり，1語長のレジスタを4個（レジスタ番号0〜3）と，命令の実行結果によって値が設定される2ビットの条件コードレジスタ（以下，CCという）をもつ。\n（2）実効アドレスは，表2に示す式で算出される。ここで，（x）と（b）は，それぞれxとbで指定されるレジスタに設定されている内容（以下，レジスタの内容という）を示す。'),
    ],
    [
      table('表2　実効アドレスの算出式',['x','b','実効アドレス'],[
        ['0','0','d'],['0','0以外','(b)＋d'],['0以外','0','(x)＋d'],['0以外','0以外','(x)＋(b)＋d'],
      ]),
      p('（3）命令コード（一部）を表3に示す。'),
      table('表3　命令コード（一部）',['命令コード','機能','CCの設定'],[
        ...['論理和','論理積','排他的論理和'].map((operation,j)=>[String(j+1),'実効アドレスに格納されている内容とrで指定されるレジスタの内容の'+operation+'を，rで指定されるレジスタに設定する。','○']),
        ['4','mとCCの論理積を求め，結果が00でなければ実効アドレスに分岐する。結果が00であれば，何もしない。','−'],
      ]),
      p('注記　○：論理演算の結果が0（全てのビットが0）のときは2進数の10，それ以外のときは2進数の01が設定される。\n−：実行前の値が保持される。'),
    ],
    [
      p('設問1　レジスタの内容が図2に示す値のとき，次の命令の実効アドレスとして正しい答えを，解答群の中から選べ。'),
      p('命令：'+hexWord(c.instruction)),
      table('図2　レジスタの内容',['レジスタ番号','内容'],registerRows(c.registers)),
      ...bank('解答群',addresses),
      p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。ここで，レジスタと主記憶装置の内容は，図3と図4のとおりとする。なお，解答は重複して選んでもよい。'),
      table('図3　レジスタの内容',['レジスタ番号','内容'],registerRows(c.registers)),
      table('図4　主記憶装置の内容',['番地','内容'],[...cells.slice(0,4),['⋮','⋮'],...cells.slice(4),['⋮','⋮']]),
    ],
    [
      p('図3，4に示した状態で，主記憶装置に格納されているプログラムを0010h番地から実行する。\n0011h番地の命令を実行した直後のレジスタ番号0の内容は［a］になり，レジスタ番号1の内容は［b］になる。\n0013h番地の分岐命令では［c］。0016h番地の命令を実行した直後のレジスタ番号2の内容は［d］になる。'),
      ...bank('a，b，dに関する解答群',data.q2[1]),
      ...bank('cに関する解答群',data.q2[2]),
    ],
  ];
}

export const legacy2014SpringPm2Definition=define(2,'機械語命令','設問1=オ、設問2 a=キ・b=ア・c=ア・d=ア',
  '命令のビット配置・レジスタ・主記憶初期値',machineCases.length,
  '命令語と主記憶・レジスタの値を変え、実効アドレス、ビット演算、条件コードと分岐を追います。',
  '物理p12〜15、印刷p11〜14。16ビット語、x/b番号0は加算しない、CCと演算、3欄共通9択と重複可。',i=>{
    const {address,trace}=evaluate(i);
    const at=(pc:number)=>trace.find(row=>row.pc===pc)!;
    const a=at(17).registers[0], b=at(17).registers[1], d=at(22).registers[2];
    const addresses=i===0?data.q2[0]:addressChoices[i].map(hexWord);
    return {
      prompt:spring2014Pm2Pages(i).flat(),
      ...answers([addresses,data.q2[1],data.q2[2]].map(strings),[
        single('1','設問1',0,addresses.indexOf(hexWord(address))),
        single('a','設問2 a',1,a-1),single('b','設問2 b',1,b-1),
        single('c','設問2 c',2,Number(at(19).taken)),single('d','設問2 d',1,d-1),
      ]),
      explanation:'設問1：命令語をop、r/m、x、b、dに分ける。xとbが0以外のときだけ対応するレジスタを加えると'+hexWord(address)+'。\n'+
        '設問2：0011hまでのOR・ANDの結果，r0＝'+hexWord(a)+'、r1＝'+hexWord(b)+'。0012hのXORでCCは'+
        at(18).cc.toString(2).padStart(2,'0')+'となり，0013hのmとのANDの結果，'+(at(19).taken?'分岐する。':'分岐しない。')+
        '実行した命令の番地は'+trace.map(row=>hexWord(row.pc)).join('→')+'。0016hのAND後はr2＝'+hexWord(d)+'。',
    };
  });
