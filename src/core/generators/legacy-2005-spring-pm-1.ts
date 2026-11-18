import { p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2005-spring-pm-01-05-shared';
import { draw } from './legacy-2005-spring-pm-01-05-figures';
import { hex, listExample } from './legacy-2005-spring-pm-01-05-models';

const originalValues=['0099','00A1','00A3','00A4','00A5'];
const originalRemove=['0101','0102','0103','0104','0105','0113','0114','0115','0116','0117'];
const originalAttach=['0109','010B','010D','010F','0111','0113','0115','0117','0119','011B'];
function candidates(index:number) {
  if(index===0)return [originalValues,originalRemove,originalAttach];
  const {base,elements,unknown,remove,edits}=listExample(index);
  const bank=(required:number[],pool:number[])=>[...new Set([...required,...pool])].slice(0,10).sort((a,b)=>a-b).map(hex);
  return [
    [elements[6].value-1,unknown.value,elements[8].value+1,elements[8].value+2,elements[8].value+3].map(hex),
    bank(remove,Array.from({length:17},(_,i)=>base+i)),
    bank(edits,Array.from({length:15},(_,i)=>base+1+2*i)),
  ];
}
export function spring2005Pm1Pages(index:number,print=true) {
  const {base,root,unknown,deleteNode,linkTargets}=listExample(index);
  const [value,remove,attach]=candidates(index);
  return [
    [p('リストに関する次の記述を読んで，設問1～3に答えよ。'),
      p('リストの構造は図1のとおりとする。'),
      draw('list-shape',index,'図1　リストの構造'),
      p('（1）ROOTは，リストの先頭を指す。'),
      p('（2）リストの要素は連続する2語からなる。第1語には値が，第2語には次の要素へのポインタが格納されている。'),
      p('（3）リストの各要素は値の昇順に連結されていて，値はすべて異なる。最後の要素の第2語にはポインタとして0000が格納されている。'),
      p('（4）図1の構造をもつリストが，図2のとおりに主記憶の'+hex(root)+'番地から'+hex(base+23)+'番地までに格納されている。'+hex(root)+'番地はROOTである。'),
      p('（5）1語は16ビットからなり，語単位で番地が付いている。'),
      draw('list-memory',index,'図2　主記憶の状態')],
    [p('設問1　'+hex(unknown.address)+'番地の内容として正しい答えを，解答群の中から選べ。'),
      ...(print?bank('解答群',value):[]),
      p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p(hex(deleteNode.address)+'番地及び'+hex(deleteNode.address+1)+'番地からなる要素をリストから削除するには，［a］番地の内容を［b］に変えればよい。'),
      ...(print?bank('解答群',remove):[]),
      p('設問3　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p(hex(base+24)+'番地から'+hex(base+29)+'番地に格納されている3要素からなるサブリストと，設問2で要素を削除する前のリストを併合するには，'+
        ['c','d','e','f'].map((blank,i)=>'［'+blank+'］番地の内容を'+hex(linkTargets[i])+'に').join('，')+'それぞれ変えればよい。'),
      ...(print?bank('解答群',attach):[])],
  ];
}
export const spring2005Pm1=define(
  1,'単方向連結リストの読取り・削除・併合','設問1=イ／a=コ／b=イ／c=オ／d=コ／e=キ／f=ケ',
  '16ビット語の番地と要素値、削除位置、サブリスト併合の位置',
  '語番地と昇順の値を変更し、メモリ配置とポインタ、削除対象及びサブリストの挿入位置を同じ条件から更新する。',
  'ROOT、2語、語番地、昇順と全値相異、0000の終端を保持。設問3は削除前のリストを用いる。',
  index=>{
    const {unknown,remove,edits,linkTargets}=listExample(index), [value,removeBank,attach]=candidates(index);
    const keys=[value.indexOf(hex(unknown.value)),...remove.map(address=>removeBank.indexOf(hex(address))),
      ...edits.map(address=>attach.indexOf(hex(address)))];
    return {prompt:spring2005Pm1Pages(index,false).flat(),...answers([strings(value),strings(removeBank),strings(attach)],[
      single('s1','設問1',0,keys[0]),...['a','b'].map((name,i)=>single(name,name,1,keys[1+i])),
      ...['c','d','e','f'].map((name,i)=>single(name,name,2,keys[3+i])),
    ]),explanation:'ROOTからポインタを追うと，'+hex(unknown.address)+'番地の値は前後の値の間に入り，解答群で該当するのは'+
      hex(unknown.value)+'。削除では直前要素のポインタ'+hex(remove[0])+'番地を'+hex(remove[1])+'に変えて対象を飛ばす。'+
      '削除前のリストとサブリストの値を昇順に併合すると，'+edits.map((address,i)=>hex(address)+'→'+hex(linkTargets[i])).join('，')+'に付け替える。'};
  },
);
