import type { Block } from "../types";
import { field,figure,p,strings,table,variableNotes,type GenerationDefinition } from "./definition";

export const legacy2019PhysicalPageData=[
  ["E","A","D","G","B","F","C","H"],
  ["B","F","D","A","G","C","H","E"],
  ["H","C","A","F","B","E","G","D"],
  ["D","G","F","C","A","H","E","B"],
];
const originalReferences=[4,2,1,5,4,2,3,4,2,1,5,3,5];
// Rotation5 needs a five-fault decrease for FIFO3→4, beyond the source's nine
// response roles. Twelve other real access orders fit those same nine roles.
const rotations=[0,1,2,3,4,6,7,8,9,10,11,12];
export const legacy2019ReferenceOrders=rotations.map(r=>[...originalReferences.slice(r),...originalReferences.slice(0,r)]);
export function legacy2019PageFaults(order:readonly number[],frames:number,policy:"FIFO"|"LRU") {
  if(!Number.isInteger(frames)||frames<1||order.some(n=>!Number.isInteger(n)||n<1))throw Error("PARAMETER_CONSTRAINT");
  const queue:number[]=[];let faults=0;
  for(const page of order){const at=queue.indexOf(page);
    if(at<0){faults++;if(queue.length===frames)queue.shift();queue.push(page);}
    else if(policy==="LRU"){queue.splice(at,1);queue.push(page);}
  }return faults;
}
export function legacy2019MemoryFigureAlt(values:number[]) {
  const data=legacy2019PhysicalPageData[values[0]];if(!data)throw Error("PARAMETER_CONSTRAINT");
  return `仮想アドレス空間、ページテーブル、物理アドレス空間を横に並べる。仮想ページ1〜8のデータは順にA〜H。物理ページ1〜8のデータは順に${data.join("、")}。ページテーブルの仮想ページ1〜8の存在ビットはいずれも1、物理ページ番号欄の1〜4行は空欄a1〜a4、5〜8行は網掛けで省略。各列の下部は途中のページを点線で省略し、仮想側及びテーブルの末尾をm、物理側の末尾をnとする。網掛けの部分は表示していない。`;
}
const changes=["1回増える","1回減る","2回増える","2回減る","3回増える","3回減る","4回増える","4回減る","変わらない"];
const changeIndex=(difference:number)=>difference===0?8:difference>0?(difference-1)*2:(-difference-1)*2+1;
export const legacy2019AfternoonMemoryDefinitions:GenerationDefinition[]=[{
  source:"2019h31h-fe-pm-2",title:"旧制度・午後：ページング方式の仮想記憶",
  sourceAnswer:"設問1 a=ウ／設問2 b=エ、c=ア／設問3 d=ア、e=エ",
  fields:[field("physicalPageLayout",0,3),field("referenceOrder",0,11),field("initialFrameCount",2,3)],reference:[0,0,3],
  notes:variableNotes+" 原2019春午後問2の全4頁、a/b/c/d/eの5欄・5/4/4/9/9択を維持。a1〜a4は一つの組合せ回答欄a、b1/b2とc1/c2も各一つの組合せ欄。図の仮想/物理ページ番号・存在ビット・m/n・網掛けの省略注記を残す。実際の物理ページ配置4条件、13参照の実行順12条件、比較する物理ページ数2→3又は3→4を変える全96入力。参照順は単なるページ名置換ではない。元の9択の増減範囲を外れる回転5を入力条件から外す理由を明記する。全参照列の初期物理ページは空き。FIFOはhitで挿入順を更新せず、LRUはhitを含め直近参照順を更新。全生成入力を別のload/last-use時刻モデルで検算し、さらに3ページ・長さ0〜7の全参照列/容量1〜3を照合する。",
  build:v=>{
    const domains=[[0,3],[0,11],[2,3]];if(v.length!==3||v.some((n,i)=>!Number.isInteger(n)||n<domains[i][0]||n>domains[i][1]))throw Error("PARAMETER_CONSTRAINT");
    const [layout,orderCase,frames]=v,data=legacy2019PhysicalPageData[layout],order=legacy2019ReferenceOrders[orderCase],mapping=[..."ABCD"].map(letter=>data.indexOf(letter)+1);
    const candidates=[[1,2,3,4],[...mapping].sort((a,b)=>a-b),mapping,data.slice(0,4).map(letter=>"ABCDEFGH".indexOf(letter)+1),[mapping[1],mapping[0],mapping[2],mapping[3]]];
    const f0=legacy2019PageFaults(order,frames,"FIFO"),f1=legacy2019PageFaults(order,frames+1,"FIFO"),l0=legacy2019PageFaults(order,frames,"LRU"),l1=legacy2019PageFaults(order,frames+1,"LRU");
    const d=changeIndex(f1-f0),e=changeIndex(l1-l0);if(d<0||d>8||e<0||e>8)throw Error("PARAMETER_CONSTRAINT");
    const prompt:Block[]=[
      p("旧制度・午後 問2。仮想記憶方式に関する次の記述を読んで、設問1〜3に答えよ。"),
      p("仮想記憶方式は、OSが提供する論理的な記憶領域（以下、仮想記憶という）上のアドレスと物理的な主記憶上のアドレスを対応付けて管理する方式である。仮想記憶方式では、補助記憶装置を仮想記憶の実装媒体として用いることによって、プログラムが主記憶の容量を超える大きさであっても、これを仮想記憶上のデータとして格納し、実行することができる。仮想記憶上のアドレス空間を仮想アドレス空間、主記憶上のアドレス空間を物理アドレス空間と呼び、それぞれの空間における記憶場所は仮想アドレス、物理アドレスで指定する。"),
      p("仮想記憶方式の実現方法の一つにページング方式がある。この方式は、仮想アドレス空間と物理アドレス空間をそれぞれ仮想ページ、物理ページと呼ぶ固定長の領域に分割し、管理する。ページング方式では、プログラムの実行過程で、実行に必要な仮想ページのデータが物理アドレス空間に存在していないときは、そのデータが格納されている仮想ページからデータを物理ページに読み込んで利用する。"),
      p("ページング方式のページ管理方法の例を次の(1)〜(3)に示す。"),
      p("(1) 仮想アドレス空間及び物理アドレス空間の各ページには、1から順に番号を付け、それぞれ仮想ページ番号、物理ページ番号と呼ぶ。"),
      p("(2) 仮想ページと物理ページの対応は、ページテーブルで管理する。ページテーブルの各要素は仮想ページと1対1に対応付けられており、要素の個数は仮想ページの個数と同じである。"),
      p("(3) ページテーブルには、仮想ページのデータが物理アドレス空間に存在しているかどうかを示すビット（以下、存在ビットという）と、存在している場合に対応する物理ページ番号を登録する領域がある。存在ビットは、当該仮想ページのデータが物理アドレス空間に存在している場合は1、存在していない場合は0である。"),
      p("仮想アドレス空間の仮想ページと物理アドレス空間の物理ページの対応例を、図1に示す。ここで、図1中のA〜Hは、仮想ページ及び物理ページに格納されているデータを示す。"),
      figure("legacy-2019-page-mapping",[layout],"図1 仮想ページと物理ページの対応例",legacy2019MemoryFigureAlt([layout])),
      p("注記 網掛けの部分は表示していない。"),
      p("設問1 図1中の［a1］〜［a4］に入れる正しい答えを、aに関する解答群の中から組合せとして選べ。"),
      p("設問2 次の記述中の空欄に入れる適切な答えを、解答群の中から選べ。ここで、b1とb2、c1とc2に入れる答えは、それぞれb、cに関する解答群の中から組合せとして選ぶものとする。"),
      p("ページング方式では、プログラムの実行過程で、実行に必要なデータが物理アドレス空間に存在していないときには、ページフォールトという割込みが発生する。ページフォールトが発生すると、仮想ページに格納されているデータを物理ページに読み込む処理（以下、ページフォールト割込み処理という）を行う。"),
      p("［ページフォールト割込み処理］"),
      p("(1) 物理ページのうち、仮想ページと対応付けられていない物理ページ（以下、空きページという）を一つ探す。"),
      p("(2) 空きページがなかった場合、空きページにする［b1］ページを一つ選び、その選んだページに格納されているデータを［b2］。その後、対応するページテーブルの要素の存在ビットを0にする。これによって空きページを確保する。"),
      p("(3) 空きページがあった場合、又はなかった場合では(2)の処理後に、その空きページにプログラムの実行に必要な［c1］ページに格納されているデータを［c2］。その後、対応するページテーブルの要素に物理ページ番号を登録して、その存在ビットを1にする。"),
      p("設問3 次の記述中の［d］、［e］に入れる正しい答えを、各解答群の中から選べ。"),
      p("ページング方式において、ページフォールトの発生回数を少なくするためには、どの物理ページを空きページにするかが重要になる。一般的に知られているアルゴリズムであるFIFOとLRUについて、あるプログラムの実行過程で仮想ページが次の順で参照される場合を考える。ここで、プログラムの実行開始時点では、このプログラムの実行のために割り当てられた物理ページは全て空きページである。"),
      p(`［仮想ページの参照順］ ${order.join(" → ")}`),
      p(`FIFOを用いると、割り当てられた物理ページの個数が${frames}のときは、ページフォールトの発生回数は${f0}回である。物理ページの個数が${frames+1}ならば、物理ページの個数が${frames}のときと比べて、ページフォールトの発生回数は［d］。`),
      p(`一方、LRUを用いると、物理ページの個数が${frames}のときは、ページフォールトの発生回数は${l0}回である。物理ページの個数が${frames+1}ならば、物理ページの個数が${frames}のときと比べて、ページフォールトの発生回数は［e］。`),
    ];
    const pairs=(name:string)=>["仮想","物理"].flatMap(page=>["補助記憶装置から読み込む","補助記憶装置に書き出す"].map(operation=>[table("空欄の組合せ",[`${name}1`,`${name}2`],[[page,operation]])]));
    const choices:Block[][]=[...candidates.map(row=>[table("aに関する解答群",["a1","a2","a3","a4"],[row.map(String)])]),...pairs("b"),...pairs("c"),...strings(changes),...strings(changes)];
    const counts=[5,4,4,9,9],offsets=[0,5,9,13,22],labels=["設問1 a","設問2 b","設問2 c","設問3 d","設問3 e"];
    const delta=(n:number)=>n===0?"変わらない":`${Math.abs(n)}回${n>0?"増える":"減る"}`;
    return{prompt,choices,answerParts:counts.map((count,i)=>({id:`part-${"abcde"[i]}`,label:labels[i],choiceIds:Array.from({length:count},(_,j)=>`choice-value-${offsets[i]+j+1}`)})),
      partAnswers:[2,3,0,d,e].map((at,i)=>({kind:"choice" as const,partId:`part-${"abcde"[i]}`,choiceId:`choice-value-${offsets[i]+at+1}`})),
      explanation:`a：仮想ページ1〜4のデータA/B/C/Dと同じデータがある物理ページを図から探すと、${mapping.join("、")}となる。仮想ページ番号の順をそのまま物理ページ番号とすることや、対応の向きを逆に読むこととは異なる。b：追い出す対象は物理ページであり、格納データを補助記憶装置へ書き出し、その常駐を示す存在ビットを0にする。c：必要な仮想ページのデータを補助記憶装置から空き物理ページへ読み込み、物理ページ番号と存在ビット1を登録する。d：FIFOでは読み込んだ順に追い出し、hitだけでは順を更新しない。${frames}ページで${f0}回、${frames+1}ページで${f1}回なので${delta(f1-f0)}。e：LRUでは最後の参照が最も古いページを追い出す。${frames}ページで${l0}回、${frames+1}ページで${l1}回なので${delta(l1-l0)}。どちらも初期の全ページは空きとして、最初に読み込むときもページフォールトに数える。`};
  },
}];
