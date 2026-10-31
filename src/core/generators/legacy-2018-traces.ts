import {field,p,table,strings,variableNotes,type GenerationDefinition} from "./definition";

function def(number:number,title:string,sourceAnswer:string,fields:GenerationDefinition["fields"],reference:number[],build:GenerationDefinition["build"],notes:string):GenerationDefinition{
  return {source:`2018h30a-fe-am-${number}`,title,sourceAnswer,fields,reference,notes:variableNotes+" "+notes,build:values=>{
    if(values.length!==fields.length||values.some((v,i)=>!Number.isInteger(v)||v<fields[i].minimum||v>fields[i].maximum))throw Error("PARAMETER_CONSTRAINT");return build(values);
  }};
}
export const legacy2018TraceDefinitions:GenerationDefinition[]=[
  def(4,"ハフマン符号の欠落符号語","エ",[field("空欄の符号長",0,1),field("符号木の左右方向",0,3),field("長い二符号の出現率の差",0,4)],[0,0,2],([shortTarget,mask,adjustment])=>{
    const frequency=[26,25,24,13+adjustment-2,12-adjustment+2],words=["00","01","10","110","111"];
    if(shortTarget){[frequency[0],frequency[3]]=[frequency[3],frequency[0]];[words[0],words[3]]=[words[3],words[0]];}
    const codes=words.map(s=>(parseInt(s.slice(0,2),2)^mask).toString(2).padStart(2,"0")+s.slice(2)),answer=codes[3];
    const options=shortTarget?["00","01","10","11"]:[codes[0]+"1",codes[1]+"0",codes[2]+"1",answer];
    return {prompt:[p("出現頻度の異なるA、B、C、D、Eの5文字で構成される通信データを、ハフマン符号化を使って圧縮するために、符号表を作成した。aに入る符号として、適切なものはどれか。"),table("符号表",["文字","出現頻度（%）","符号"],["A","B","C","D","E"].map((name,i)=>[name,String(frequency[i]),i===3?"空欄a":codes[i]]))],choices:strings(options),correctIndex:options.indexOf(answer),explanation:`aは${answer}。他の四文字の符号と合わせると、一つの符号語が別の符号語の先頭部分にならずに区別できる。他の候補は、既知の符号と同じか、既知の符号と先頭部分が重なって復号できなくなる。ハフマン符号化では出現率の小さい文字をまとめていき、この表では出現率の小さい二文字だけが3ビット、それ以外が2ビットとなる。表示された出現率での平均符号長は2.25ビットである。`};
  },"5文字の出現率表・Dの単一空欄・ビット列の4択を保持。長い符号を必要とする文字をA/D間で切り替え、Dの符号長2/3、木の左右、長い二符号の出現率を連動する。単なる文字名変更にしない。全40入力で接頭語条件と独立した最小重み併合から最適長を検算し、各誤答の復号衝突を確認。"),
  def(5,"待ち行列の操作追跡","ウ",[field("9番目の操作",0,1),field("最初のデータ",1,3),field("データ間隔",1,2)],[0,1,1],([extra,first,step])=>{
    const v=Array.from({length:7},(_,i)=>first+step*i),sequence=[`ENQ ${v[0]}`,`ENQ ${v[1]}`,`ENQ ${v[2]}`,"DEQ",`ENQ ${v[3]}`,`ENQ ${v[4]}`,"DEQ",`ENQ ${v[5]}`,extra?`ENQ ${v[6]}`:"DEQ","DEQ"],head=extra?3:4;
    return {prompt:[p("待ち行列に対する操作を、次のとおり定義する。"),p("ENQ n：待ち行列にデータnを挿入する。"),p("DEQ：待ち行列からデータを取り出す。"),p(`空の待ち行列に対し、${sequence.join("、")}の操作を行った。次にDEQ操作を行ったとき、取り出されるデータはどれか。`)],choices:strings([v[0],v[1],v[head],v[head+1]].map(String)),correctIndex:2,explanation:`待ち行列は先に挿入したデータから取り出す。指定した十操作にはDEQが${extra?3:4}回含まれ、先頭からその個数を取り出す。次のDEQでは、${head+1}番目に挿入した${v[head]}を取り出す。その次の${v[head+1]}や、既に取り出した${v[0]}・${v[1]}ではない。`};
  },"ENQ/DEQの定義、空の開始、十操作の文章列、次のDEQのデータを選ぶ四択を保持。9番目を取出し又は追加に変えて待ち行列の状態を変えるため、名前・データ値の置換だけではない。全12入力を表示された操作列の独立したFIFO実行で検算。"),
];
