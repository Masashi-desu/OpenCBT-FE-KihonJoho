import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2005SpringPm01To05Definitions as definitions } from '../../../src/core/generators/legacy-2005-spring-pm-01-05';
import { legacy2005SpringPm0105Figures as figures } from '../../../src/core/generators/legacy-2005-spring-pm-01-05-figures';
import { legacy2005SpringPm0105FigureRenderers as renderers } from '../../../src/ui/Legacy2005SpringPm0105Figures';
import { spring2005Pm01To05Specs as specs } from '../../../scripts/legacy-2005-spring-pm-01-05-specs';

const inputs=[0,1,2,3], marks='アイウエオカキクケコ';
const variants=(number:number)=>inputs.map(index=>definitions.find(item=>item.source.endsWith('-'+number))!.build([index]));
const stem=(body:GeneratedBody)=>body.prompt.filter(item=>item.type==='paragraph').map(item=>item.text).join(' ');
function part(body:GeneratedBody,id:string) {
  const answerPart=body.answerParts?.find(item=>item.id==='part-'+id);
  assert(answerPart);
  return answerPart;
}
function choiceText(body:GeneratedBody,id:string) {
  const option=body.choices[Number(id.slice('choice-value-'.length))-1];
  assert.equal(option.length,1);
  const [block]=option;
  assert(block.type==='paragraph'||block.type==='code');
  return block.text;
}
function choices(body:GeneratedBody,id:string) {
  return part(body,id).choiceIds.map(key=>choiceText(body,key));
}
function selected(body:GeneratedBody,id:string) {
  const answer=body.partAnswers?.find(item=>item.kind==='choice'&&item.partId===part(body,id).id);
  assert(answer?.kind==='choice');
  return choiceText(body,answer.choiceId);
}
function oneOf(body:GeneratedBody,id:string,qualifies:(option:string)=>boolean) {
  assert.deepEqual(choices(body,id).filter(qualifies),[selected(body,id)]);
}
function diagram(body:GeneratedBody,name:string) {
  const d=body.prompt.find(item=>item.type==='diagram'&&item.scene.kind==='source_figure'&&item.scene.profile.endsWith('-'+name));
  assert(d?.type==='diagram');
  return d;
}
function svg(block:Block) {
  assert(block.type==='diagram'&&block.scene.kind==='source_figure');
  const {profile,values}=block.scene, renderer=renderers.find(item=>item.profile===profile);
  assert(renderer);
  return renderToStaticMarkup(createElement(renderer.component,{caption:block.caption,values}));
}
const hex=(s:string)=>parseInt(s,16);
function codes(body:GeneratedBody,ids:string[]){return ids.map(id=>choices(body,id));}

test('配布候補の公式正答、原ページと参照、全4条件の選択肢、採点欄を照合する',()=>{
  const sourceKeys=new Map([[1,'イコイオコキケ'],[2,'オイオイ'],[4,'ウアキウエ'],[5,'イオカイイウア']]);
  assert.deepEqual(specs.map(s=>s.number),[1,2,4,5]);
  assert.deepEqual(specs.map(s=>s.pages),[[4,5],[6,7,8],[12,13,14,15,16],[17,18,19,20,21,22,23]]);
  for(const spec of specs) {
    const key=sourceKeys.get(spec.number);
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number),spec.pages);
    assert(spec.pages.every(page=>spec.originalPageAlt[page].length>75));
    function gradeKey(body:GeneratedBody) {
      assert(body.partAnswers);
      return body.partAnswers.map(answer=>{
        assert(answer.kind==='choice');
        const option=body.answerParts?.find(item=>item.id===answer.partId)?.choiceIds.indexOf(answer.choiceId);
        assert(option!==undefined&&option>=0);
        return marks[option];
      }).join('');
    }
    assert.equal(gradeKey(spec.original),key);
    const conditions=variants(spec.number);
    assert.equal(new Set(conditions.map(body=>JSON.stringify(body.prompt))).size,4);
    assert(new Set(conditions.map(gradeKey)).size>1||spec.definition.answerVariation==='fixed');
    for(const [index,body] of conditions.entries()) {
      assert.deepEqual(body,spec.definition.build([index]));
      assert.equal(body.partAnswers?.length,key?.length);
      for(const part of body.answerParts!) {
        const texts=part.choiceIds.map(id=>choiceText(body,id));
        assert.equal(new Set(texts).size,texts.length);
      }
      assert(body.explanation.length>=80);
    }
    for(const values of [[-1],[4],[0.5],[],[1,2],new Array(1)])assert.throws(()=>spec.definition.build(values),/PARAMETER_CONSTRAINT/);
  }
  assert.match(specs[0].originalPageAlt[4],/全問解答してください/);
  assert.doesNotMatch(specs[1].originalPageAlt[6],/照合文字列Sは1文字以上/);
  for(const spec of [specs[1],specs[2]])assert.deepEqual(spec.definition.fixedReferenceAssetIds,
    ['asset-ipa-2005h17h-fe-pm-page-002','asset-ipa-2005h17h-fe-pm-page-003']);
});

test('問1の空欄候補、削除と併合の全アドレス組合せを、紙面上の語番地を直接たどって検査する',()=>{
  for(const body of variants(1)) {
    const text=stem(body), graphic=diagram(body,'list-memory');
    const cells=new Map([...graphic.alt.matchAll(/([\dA-F]{4})：(\[\S+?\]|［空欄］|[\dA-F]{4})/g)]
      .map(([,address,value])=>[hex(address),hex(value)]));
    const blank=hex(text.match(/設問1　([\dA-F]{4})番地/)![1]), root=hex(text.match(/([\dA-F]{4})番地はROOT/)![1]);
    const start=cells.get(root)!;
    assert(cells.size===31&&Number.isNaN(cells.get(blank)));
    const viz=svg(graphic);
    for(const address of cells.keys())assert(viz.includes('data-memory-address="'+address.toString(16).toUpperCase().padStart(4,'0')+'"'));

    function follow(memory:Map<number,number>, first:number) {
      const visited=new Set<number>(), ordered:number[]=[];
      let position=first;
      while(position) {
        if(!memory.has(position)||!memory.has(position+1)||visited.has(position))return [];
        visited.add(position);ordered.push(position);
        position=memory.get(position+1)!;
      }
      return ordered;
    }
    const initial=follow(cells,start), pivot=initial.indexOf(blank);
    assert.equal(initial.length,12);
    assert(pivot>0&&pivot+1<initial.length);
    oneOf(body,'s1',option=>hex(option)>cells.get(initial[pivot-1])!&&hex(option)<cells.get(initial[pivot+1])!);
    cells.set(blank,hex(selected(body,'s1')));
    const gone=hex(text.match(/ ([\dA-F]{4})番地及び[\dA-F]{4}番地からなる要素/)![1]);
    const deletion=initial.filter(address=>address!==gone).join(',');
    const successfulDelete:string[][]=[];
    for(const a of choices(body,'a'))for(const b of choices(body,'b')){
      const after=new Map(cells).set(hex(a),hex(b));
      if(follow(after,start).join(',')===deletion)successfulDelete.push([a,b]);
    }
    assert.deepEqual(successfulDelete,[[selected(body,'a'),selected(body,'b')]]);

    const bounds=text.match(/([\dA-F]{4})番地から([\dA-F]{4})番地に格納されている3要素/);
    assert(bounds);
    const range=[hex(bounds[1]),hex(bounds[1])+2,hex(bounds[2])-1];
    assert(range.every(address=>cells.has(address)));
    const answerText=['c','d','e','f'];
    const targets=[...text.matchAll(/［[c-f]］番地の内容を([\dA-F]{4})に/g)].map(([,address])=>hex(address));
    assert.equal(targets.length,4);
    const ordered=[...initial,...range].sort((a,b)=>cells.get(a)!-cells.get(b)!).join(',');
    const successfulMerge:string[][]=[];
    function tryEvery(proposed:string[]) {
      if(proposed.length<4){
        for(const candidate of choices(body,answerText[proposed.length]))tryEvery([...proposed,candidate]);
      }else{
        const after=new Map(cells);
        for(const [i,position] of proposed.entries())after.set(hex(position),targets[i]);
        if(follow(after,start).join(',')===ordered)successfulMerge.push(proposed);
      }
    }
    tryEvery([]);
    assert.deepEqual(successfulMerge,[answerText.map(id=>selected(body,id))]);
  }
});

function sampleLetters(length:number) {
  return length===0?['']:Array.from({length:2**length},(_,i)=>i.toString(2).padStart(length,'0').replaceAll('0','a').replaceAll('1','b'));
}
function traceReplace(a:string,s:string,d:string,key:string[]) {
  const EOS='§';
  const A=[...a,EOS],S=[...s,EOS],D=[...d,EOS], B:string[]=[];
  const reg:Record<string,number>={Aidx:0,Bidx:0};
  function read(array:readonly string[],i:number){
    const value=array[i];
    if(value===undefined)throw Error('配列の範囲外');
    return value;
  }
  function assign(option:string) {
    const [target,value]=option.split(' ← ');
    if(target==='B[Bidx]')B[reg.Bidx]=value==='S[0]'?S[0]:read(A,reg.Aidx);
    else reg[target]=Number(value);
  }
  function compare(option:string) {
    const input=read(A,reg.Aidx);
    if(option==='A[Aidx] ≠ EOS')return input!==EOS;
    const search=read(S,reg.Sidx);
    if(option==='A[Aidx] ＝ S[Sidx]')return input===search;
    if(option==='A[Aidx] ≠ S[Sidx]')return input!==search;
    if(option==='A[Aidx] ≠ S[Sidx]  and  S[Sidx] ≠ EOS')return input!==search&&search!==EOS;
    if(option==='S[Sidx] ＝ EOS')return search===EOS;
    if(option==='S[Sidx] ≠ EOS')return search!==EOS;
    throw Error('比較式が未定義');
  }
  try {
    let budget=10*(a.length+1);
    while(read(A,reg.Aidx)!==EOS) {
      if(--budget===0)return undefined;
      if(A[reg.Aidx]===S[0]){
        reg.Idx=reg.Aidx;
        assign(key[0]);
        do {++reg.Sidx;++reg.Aidx;} while(compare(key[1])&&read(A,reg.Aidx)!==EOS);
        if(compare(key[2]))for(let i=0;read(D,i)!==EOS;i++)B[reg.Bidx++]=D[i];
        else { assign(key[3]);reg.Aidx=reg.Idx+1;reg.Bidx++; }
      }else B[reg.Bidx++]=A[reg.Aidx++];
    }
    B[reg.Bidx]=EOS;
    if(B.some(letter=>letter===EOS)&&B.indexOf(EOS)===reg.Bidx&&B.join('').length===B.length)return B.slice(0,-1).join('');
  } catch {return undefined;}
}

test('問2の全1296の穴埋めを、非空パターンの重なり・失敗・末尾を含む有限入力と標準置換で判定する',()=>{
  const sampleA=Array.from({length:6},(_,n)=>sampleLetters(n)).flat();
  const sampleS=Array.from({length:3},(_,n)=>sampleLetters(n+1)).flat();
  const sample=sampleA.flatMap(a=>sampleS.flatMap(s=>['','X','YZ'].map(d=>({a,s,d,result:a.replaceAll(s,d)}))));
  const fields=['a','b','c','d'];
  for(const body of variants(2)){
    assert(stem(body).includes('配列の添字は0から始まる')&&stem(body).includes('照合文字列Sは1文字以上'));
    const rows=diagram(body,'replace-arrays').alt.split('\n');
    const [a,s,d,b]=rows.map(line=>[...line.matchAll(/“(.)”/g)].map(([,char])=>char).join(''));
    assert.equal(b,a.replaceAll(s,d));
    assert(rows.every(line=>line.includes('EOS')));
    const candidates=codes(body,fields), good:string[][]=[];
    for(const c0 of candidates[0])for(const c1 of candidates[1])for(const c2 of candidates[2])for(const c3 of candidates[3]){
      const key=[c0,c1,c2,c3];
      if(sample.every(({a,s,d,result})=>traceReplace(a,s,d,key)===result))good.push(key);
    }
    assert.deepEqual(good,[fields.map(id=>selected(body,id))]);
    const code=body.prompt.find(item=>item.type==='code');
    assert(code);
    assert.match(code.text,/■ +\/\* 後判定繰返し.+\n│  │  │  ・Sidx.+\n│  │  │  ・Aidx.+\n│  │  ■ ［b］  and/);
    assert.match(code.text,/・B\[Bidx\] ← EOS$/);
  }
});

function codeHeap(source:number[],word:string[],stopAfterSetup=false) {
  const heap=[0,...source], swaps:number[][]=[];
  function read(i:number) {
    assert(i>=1&&i<heap.length);
    return heap[i];
  }
  function repair(top:number,last:number) {
    let index=top, stepCount=0;
    while(++stepCount<=heap.length){
      const left=word[0]==='L ← Top'?index:word[0]==='L ← Top ＋ 1'?index+1:
        word[0]==='L ← Top × 2'?index*2:index*2+1;
      const right=left+1;
      let child:number|undefined;
      if(right<=last)child=read(left)<read(right)?right:left;
      else {
        const qualifies=word[1]==='L ≦ Last'?left<=last:word[1]==='L ＜ Last'?left<last:
          word[1]==='R ≦ Last − 1'?right<=last-1:right<=last-2;
        if(qualifies)child=left;
      }
      if(child===undefined||read(index)>=read(child))return;
      swap(index,child);index=child;
    }
    throw Error('ヒープの再帰が終わらない');
  }
  function swap(i:number,j:number) {
    const before=read(i);
    heap[i]=read(j);heap[j]=before;swaps.push([i,j]);
  }
  try{
    const n=source.length, midpoint=Math.floor(n/2);
    const init=word[2];
    const loop=init==='Idx：1，Idx ≦ Last，2'?[1,n,2]:init==='Idx：1，Idx ≦ Last ÷ 2，1'?[1,midpoint,1]:
      init==='Idx：Last，Idx ≧ 1，−2'?[n,1,-2]:[midpoint,1,-1];
    const [start,end,step]=loop;
    for(let index=start;step>0?index<=end:index>=end;index+=step)repair(index,n);
    if(stopAfterSetup)return {heap:heap.slice(1),swaps};
    for(let last=n;last>1;last--){swap(1,last);repair(1,last-1);}
    return {heap:heap.slice(1),swaps};
  }catch{return undefined;}
}
test('問4の木を実SVGから読み、部分木の構成と実際の交換、全64の整列用穴埋めを検査する',()=>{
  const examples:number[][]=[];
  for(let width=2;width<=5;width++)for(let bits=0;bits<3**width;bits++) {
    examples.push([...bits.toString(3).padStart(width,'0')].map(x=>+x-1));
  }
  function isHeap(values:number[]) {
    return values.every((value,i)=>i===0||values[Math.floor((i-1)/2)]>=value);
  }
  for(const body of variants(4)){
    const readout=svg(diagram(body,'heap'));
    const values=[...readout.matchAll(/data-heap-index="(\d+)"[\s\S]*?<text[^>]*>(\d+)<\/text>/g)].map(([,i,value],position)=>{
      assert.equal(+i,position+1);return +value;
    });
    assert.equal(values.length,10);assert(isHeap(values));
    const before=values[values.length-1], active=values.slice();
    [active[0],active[active.length-1]]=[active[active.length-1],active[0]];
    active.pop();
    let index=0, swaps=1;
    for(;;) {
      const children=[2*index+1,2*index+2].filter(i=>i<active.length)
        .sort((a,b)=>active[b]-active[a]||a-b);
      const other=children[0];
      if(other===undefined||active[index]>=active[other])break;
      [active[index],active[other]]=[active[other],active[index]];
      swaps++;index=other;
    }
    assert.equal(active[index],before);assert(isHeap(active));
    oneOf(body,'c',candidate=>+candidate===index+1);
    oneOf(body,'d',candidate=>+candidate===swaps);
    assert(stem(body).includes('入っていた値'+before));
    const ids=['a','b','s3'], [as,bs,init]=codes(body,ids), good:string[][]=[];
    for(const a of as)for(const b of bs)for(const start of init){
      const typed=[a,b,start];
      if(examples.every(value=>{
        const prepared=codeHeap(value,typed,true)?.heap;
        const completed=codeHeap(value,typed)?.heap;
        return Boolean(prepared&&isHeap(prepared)&&completed?.join(',')===[...value].sort((x,y)=>x-y).join(','));
      }))good.push(typed);
    }
    assert.deepEqual(good,[ids.map(item=>selected(body,item))]);
    const program=body.prompt.filter(item=>item.type==='code');
    assert.match(program[0].text,/A\[1000000\] +\/\* 大域変数/);
    assert.match(program[0].text,/▲ R ≦ Last +\/\* 3個比較/);
    assert.match(program[0].text,/│  ▲ ［b］ +\/\* 2個比較/);
    assert.match(program[1].text,/^○ InitHeap[^\n]+\n○ 整数型：Idx\n■ ［設問3］/);
  }
});

test('問5の全欄を、実際に表示した時間割と階層順で付けたファイル、境界と順序エラーから検査する',()=>{
  for(const body of variants(5)){
    const title=stem(body), example=diagram(body,'file-example').alt;
    const inventory=diagram(body,'timetable').alt.split('\n').slice(1).map(line=>{
      const [year,day,period,order,subject, teacher]=line.split('／');
      return {key:[+year[0],day==='月曜'?2:3,+period[0],+order],subject,teacher:teacher.replace(/。$/,'')};
    });
    assert.equal(inventory.length,19);
    assert(inventory.every(record=>record.key.length===4));
    const scheduleRows=inventory.map(record=>[...record.key.slice(0,3),record.subject]);
    const target=title.match(/(\d)年次の(月|火)曜日(\d)時限の([^の]+)の入力レコード/);
    assert(target);
    const [,y,day,t,course]=target, sought=[+y,day==='月'?2:3,+t,course];
    const offset=scheduleRows.findIndex(record=>record.join(':')===sought.join(':'));
    assert(offset>=1);
    const [current,previous]=[scheduleRows[offset],scheduleRows[offset-1]];
    const changed:number[]=[];
    for(let level=0;level<3;level++)if(changed.length||current[level]!==previous[level])changed.push(level+1);
    oneOf(body,'c',option=>option===changed.map(level=>'処理'+level).join('，'));
    const recordTotals=scheduleRows.map((row,i)=>{
      const before=scheduleRows[i-1], firstChanged=before?row.findIndex((value,index)=>index<3&&value!==before[index]):0;
      return firstChanged===-1?2:5-firstChanged;
    });
    oneOf(body,'a',option=>+option===Math.min(...recordTotals));
    oneOf(body,'b',option=>+option===Math.max(...recordTotals));

    const commandFile=example.split('新システムへの入力。\n')[1].split('\n').map(value=>value.replace(/^\d+ /,'').replace(/。$/,''));
    let remembered='';
    const derived:string[]=[];
    for(const {key:[year,day,period],subject,teacher} of inventory.filter(record=>record.key[0]===1)){
      const current=''+year+day+period;
      ['G','D','T'].forEach((prefix,j)=>{if(remembered.slice(0,j+1)!==current.slice(0,j+1))derived.push(prefix+current[j]);});
      remembered=current;derived.push(subject,teacher);
    }
    assert.deepEqual(commandFile,derived);

    const processor=diagram(body,'main-flow').alt;
    assert(processor.includes('処理3でTに続けてI_JIGENを出力')&&processor.includes('HYOJJUN←0'));
    assert(svg(diagram(body,'main-flow')).includes('判定Y'));
    const validHierarchy=[1,2,5,9];
    oneOf(body,'d',candidate=>validHierarchy.every(period=>{
      let last=-1;
      for(const action of candidate.split('\n'))if(action.startsWith('JIGEN ← '))last=action.includes('I_JIGEN')?period:0;
      return last===period;
    }));
    oneOf(body,'e',candidate=>{
      const assignments=new Map(candidate.split('\n').map(line=>line.split(' ← ') as [string,string]));
      return assignments.get('ERROR')==='偽'&&assignments.get('NENJI')==='0'&&assignments.size===2;
    });
    const pairings:string[][]=[];
    for(const f of choices(body,'f'))for(const g of choices(body,'g')){
      const [left,right]=f.split('：'), operand=(text:string,value:number)=>value+(text.endsWith('＋1')?1:text.endsWith('−1')?-1:0);
      const actual=(a:number,b:number)=>g==='＝'?a===b:g==='≠'?a!==b:g==='＞'?a>b:g==='＜'?a<b:g==='≦'?a<=b:a>=b;
      const observations=Array.from({length:6},(_,old)=>Array.from({length:7},(_,k)=>{
        const next=k+1;
        return actual(operand(left,old),operand(right,next))===(next-old===1);
      })).flat();
      if(observations.every(Boolean))pairings.push([f,g]);
    }
    assert.deepEqual(pairings,[[selected(body,'f'),selected(body,'g')]]);
  }
});

test('生成図の全条件でSVGの識別子、可視見出し、読み上げに対応する説明を生成する',()=>{
  assert.deepEqual(renderers.map(item=>item.profile).sort(),figures.map(item=>item.profile).sort());
  const seen=new Set<string>();
  for(const d of definitions)for(const i of inputs)for(const block of d.build([i]).prompt){
    if(block.type!=='diagram'||block.scene.kind!=='source_figure')continue;
    const {profile,values}=block.scene, definition=figures.find(item=>item.profile===profile);
    assert(definition);
    const markup=svg(block);
    assert.equal(block.alt,definition.alt(values));
    assert(markup.includes('<title')&&markup.includes('<desc')&&markup.includes('role="img"')&&markup.includes('tabindex="0"'));
    assert(markup.includes(block.alt));
    seen.add(profile+'-'+values.join('-'));
  }
  assert.equal(seen.size,27);
});
