import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2007SpringPm01To05Definitions as definitions } from '../../../src/core/generators/legacy-2007-spring-pm-01-05';
import { legacy2007SpringPm0105Figures as figures } from '../../../src/core/generators/legacy-2007-spring-pm-01-05-figures';
import { legacy2007SpringPm0105FigureRenderers as renderers } from '../../../src/ui/Legacy2007SpringPm0105Figures';
import { spring2007Pm01To05Specs as specs } from '../../../scripts/legacy-2007-spring-pm-01-05-specs';
import review from '../../fixtures/legacy-2007-spring-pm-01-05-review.json';

const cases=[0,1,2,3];
const build=(question:number,index:number)=>definitions[question-1].build([index]);
const write=(blocks:readonly Block[])=>blocks.flatMap(b=>'text' in b?[b.text]:[]).join('\n');
const diagrams=(body:GeneratedBody)=>body.prompt.filter(b=>b.type==='diagram');
function choiceBank(body:GeneratedBody,index:number) {
  const part=body.answerParts?.[index]; assert(part);
  return part.choiceIds.map(id=>write(body.choices[Number(id.split('-').at(-1))-1]));
}
function check(body:GeneratedBody,index:number,predicate:(option:string)=>boolean){
  const part=body.answerParts?.[index]; assert(part);
  const answer=body.partAnswers?.find(key=>key.kind==='choice'&&key.partId===part.id);
  assert(answer?.kind==='choice');
  assert.deepEqual(choiceBank(body,index).flatMap((option,i)=>predicate(option)?[part.choiceIds[i]]:[]),[answer.choiceId],part.id);
}
const numeric=(value:string)=>Number(value.replaceAll(',',''));

test('原紙面17頁、27採点欄・28マーク、全条件の選択構造と公式キーを照合する',()=>{
  assert.equal(specs.length,5);
  assert.equal(review.questions.reduce((n,q)=>n+q.slots,0),27);
  assert.equal(review.questions.flatMap(q=>q.parts).length,28);
  for(const item of review.questions){
    const spec=specs[item.number-1], primary=build(item.number,0);
    assert.deepEqual(spec.pages,item.pages);
    for(const page of item.pages) assert(spec.originalPageAlt?.[page]?.length>80,String(page));
    assert.equal(primary.partAnswers?.length,item.slots);
    const marks=primary.partAnswers!.flatMap(answer=>{
      const part=primary.answerParts!.find(part=>part.id===(answer.kind==='choice'?answer.partId:answer.kind==='unordered'?answer.partIds[0]:''));
      assert(part);
      assert(answer.kind==='choice'||answer.kind==='unordered');
      if(answer.kind==='unordered') assert.equal(answer.presentation,'checklist');
      return (answer.kind==='choice'?[answer.choiceId]:answer.choiceIds).map(id=>'アイウエオカキク'[part.choiceIds.indexOf(id)]);
    }).join('');
    assert.equal(marks,item.marks);
    const shape=(body:GeneratedBody)=>[body.prompt.map(block=>block.type),body.answerParts,body.choices.map(option=>option.map(b=>b.type))];
    const rendered=cases.map(index=>build(item.number,index));
    assert.equal(new Set(rendered.map(body=>JSON.stringify(body.prompt))).size,4);
    for(const active of rendered) {
      assert.deepEqual(shape(active),shape(primary));
      assert.deepEqual(active.answerParts?.map(part=>part.id),item.parts.map(part=>'part-'+part));
      item.banks.forEach((size,index)=>{const bank=choiceBank(active,index); assert.equal(bank.length,size); assert.equal(new Set(bank).size,size);});
      assert(active.explanation.trim());
    }
    for(const invalid of [[],[-1],[4],[0.5],[0,1],Array<number>(1)]) assert.throws(()=>spec.definition.build(invalid),/PARAMETER_CONSTRAINT/);
  }
});

test('問1はレジスタのビットを個別操作して、全欄と倍率候補を検算する',()=>{
  const asBits=(n:number)=>n.toString(2).padStart(16,'0').slice(-16).split('').map(Number);
  const asValue=(bits:number[])=>bits.reduce((n,bit)=>2*n+bit,0);
  const parse=(n:string)=>Number.parseInt(n,16);
  for(const index of cases){
    const body=build(1,index),p=write(body.prompt);
    const initial=Array.from(diagrams(body)[1].alt.matchAll(/\d：([0-9A-F]+)/g),row=>parse(row[1]));
    function execute(commands:string[]){
      const bank=[0,...initial,0].map(asBits);
      for(const word of commands) {
        const cmd=word.slice(0,2),r=parse(word[2]),v=parse(word[3]),active=bank[r];
        if(cmd==='10') bank[r]=[...bank[v]];
        else if(cmd==='20') bank[r]=asBits(asValue(active)+asValue(bank[v]));
        else if(cmd==='30') bank[r]=active.map((bit,j)=>Math.max(bit,bank[v][j]));
        else if(cmd==='40') bank[r]=active.map((_,j)=>active[j+v]??0);
        else if(cmd==='50') bank[r]=active.map((_,j)=>active[j-v]??0);
      }
      return bank.map(asValue);
    }
    const pWords=Array.from(p.matchAll(/(?:命令語：|　{4})([\dA-F]{4})/g),row=>row[1]);
    assert.equal(pWords.length,8);
    check(body,0,o=>parse(o)===execute(pWords.slice(0,1))[2]);
    check(body,1,o=>parse(o)===execute(pWords.slice(1,5))[3]);
    check(body,2,o=>parse(o)===execute(pWords.slice(1,5))[4]);
    const target=parse(p.match(/→ ([0-9A-F]{4})）/)![1]);
    check(body,3,o=>execute([pWords[5],pWords[6],'40'+o,pWords[7]])[5]===target);
  }
});

test('問2は行保存の操作と主キー制約を部門および社員の関係に照合する',()=>{
  for(const index of cases){
    const body=build(2,index),p=write(body.prompt), [org,plans,assignment]=diagrams(body);
    const keyForests=Array.from(plans.alt.matchAll(/案[12] 組織：(.+?)。主キーの下線は(.+?)。/g),r=>[r[1],r[2]]);
    assert.equal(keyForests.length,2);
    const candidates=choiceBank(body,0);
    const assess=(fieldNames:string,key:string)=>{
      const employees=[{name:'山田',serial:'1234',department:'SD'},{name:'田中',serial:'6543',department:'EG'}];
      const isName=key==='氏名';
      const conflicts=(name:string,serial:string)=>employees.some(row=>isName?row.name===name:row.serial===serial);
      assert(fieldNames.includes('社員番号'));
      return [false,conflicts('鈴木','5555'),false,conflicts('山田','7890'),fieldNames.includes('氏名')&&fieldNames.includes('社員番号')];
    };
    const rules=keyForests.map(([fields,key])=>assess(fields,key));
    check(body,0,option=>rules.every(group=>group[candidates.indexOf(option)]));
    check(body,1,option=>rules[0][candidates.indexOf(option)]&&!rules[1][candidates.indexOf(option)]);
    const names=Array.from(org.alt.matchAll(/（\d{4}）([^、。]+)/g),r=>r[1]);
    const given=p.split('\n').find(line=>line.startsWith('このたび'))!;
    const staff=names.filter(name=>given.includes(name));
    check(body,2,option=>numeric(option)===staff.length);
    assert.match(assignment.alt,/兼務：［d］、［e］。主キーの下線は［d］/);
    const person=[{氏名:'山田',社員番号:'4321'},{氏名:'山田',社員番号:'6789'}];
    check(body,3,option=>person.every(row=>option in row)&&new Set(person.map(row=>row[option as keyof typeof row])).size===2);
    check(body,4,option=>/部門：部門コード/.test(assignment.alt)&&option==='部門コード');
  }
});

test('問3は矢印から先行集合・最早完了を求め、短縮の全候補を検証する',()=>{
  for(const i of cases) {
    const body=build(3,i), shown=body.prompt.find(b=>b.type==='table'); assert(shown);
    const table=Object.fromEntries(shown.rows.map(row=>[row[0],Number(row[2])]));
    const edges=Array.from(diagrams(body)[0].alt.matchAll(/(\d+)→(\d+) ([A-Z]\d)/g),m=>({from:Number(m[1]),to:Number(m[2]),name:m[3]}));
    edges.push({from:5,to:6,name:'dummy'});
    const arrive=(end:number,walked=new Set<number>()):number[][]=>{
      if(end===1) return [[1]];
      assert(!walked.has(end));
      return edges.filter(row=>row.to===end).flatMap(row=>arrive(row.from,new Set([...walked,end])).map(path=>[...path,end]));
    };
    const labelPath=(path:number[])=>path.map(n=>'①②③④⑤⑥⑦⑧⑨⑩'[n-1]).join(' → ');
    const complete=(path:number[],cut?:string)=>path.slice(1).reduce((step,to,index)=>{
      const name=edges.find(e=>e.from===path[index]&&e.to===to)!.name;
      return step+(table[name]??0)-Number(name===cut);
    },0);
    const allPaths=arrive(10), span=Math.max(...allPaths.map(path=>complete(path)));
    const best=allPaths.filter(path=>complete(path)===span); assert.equal(best.length,1);
    const need=(before:string,after:string)=>{
      const begin=edges.find(edge=>edge.name===after)!.from, finish=edges.find(edge=>edge.name===before)!.to;
      return arrive(begin).some(path=>path.includes(finish));
    };
    const facts=[need('C2','G3'),need('C2','G4'),
      edges.filter(edge=>edge.to===edges.find(e=>e.name==='G3')!.from).every(edge=>edge.name==='G2'),
      !need('H2','C2')&&need('H2','G4'),need('S1','H1')];
    const checklist=body.partAnswers?.find(a=>a.kind==='unordered');
    assert(checklist?.kind==='unordered'&&checklist.presentation==='checklist');
    assert.equal(checklist.partIds.length,2);
    const bank=body.answerParts?.[0].choiceIds; assert(bank);
    assert.deepEqual(checklist.choiceIds,bank.filter((_,index)=>facts[index]));
    check(body,2,value=>value===labelPath(best[0]));
    check(body,3,value=>numeric(value)===span);
    check(body,4,value=>Math.max(...allPaths.map(path=>complete(path,value.match(/（([A-Z]\d)）/)![1])))<span);
  }
});

test('問4はソートの全候補と移動、同値の比較、実行時間の比を参照方式で検証する',()=>{
  for(const i of cases) {
    const body=build(4,i),p=write(body.prompt),down=/挿入ソートで降順/.test(p);
    const initial=Number(p.match(/要素 A\[(\d)\]/)![1]);
    assert.match(p,/│  │  ▲ A\[Idx2\].+← α\n│  │  │  ・［b］  ← β/);
    const banks=[choiceBank(body,0),choiceBank(body,1),choiceBank(body,2)];
    const choices=[2,3,4];
    function simulate(input:number[],a:string,b:string,c:string,extra:boolean){
      const data=Array<number>(initial).fill(NaN).concat(input);
      let copies=0,valid=true;
      const idx=(s:string,k:number)=>k+Number(s.includes('＋'))-Number(s.includes('−'));
      const put=(line:string,k:number,tmp:number)=>{
        const [head,tail]=line.split(' ← ');
        const to=idx(head,k),from=idx(tail,k),value=tail==='Tmp'?tmp:data[from];
        if(to<initial||to>=data.length||!Number.isFinite(value)){valid=false;return;}
        data[to]=value;
      };
      for(let j=initial+1;j<data.length&&valid;j++){
        const temp=data[j],shift=idx(a,j);
        if(shift<initial||shift>=data.length) return {valid:false,copies,data:[]};
        let k=shift;
        for(;k>=initial;k--){
          const current=data[k];
          if(!(down?current<temp:current>temp)&&!(extra&&current===temp)) break;
          put(b,k,temp); copies++;
        }
        put(c,k,temp);
      }
      return {valid,copies,data:data.slice(initial)};
    }
    function solver(row:number[],answer=choices,extra=false) {
      return simulate(row,banks[0][answer[0]],banks[1][answer[1]],banks[2][answer[2]],extra);
    }
    const expected=(row:number[])=>[...row].sort((a,b)=>down?b-a:a-b);
    const exhaustive=Array.from({length:243},(_,s)=>s.toString(3).padStart(5,'0').split('').map(Number));
    for(const slot of [0,1,2]) check(body,slot,option=>{
      const attempt=choices.map((v,n)=>n===slot?banks[slot].indexOf(option):v);
      return exhaustive.every(values=>{
        const {valid,data}=solver(values,attempt);
        return valid&&String(data)===String(expected(values));
      });
    });
    const rows=Array.from(diagrams(body)[0].alt.matchAll(/例\d：([\d，]+)/g),m=>m[1].split('，').map(Number));
    const overtake=(row:number[])=>{
      const values=[...row]; let count=0;
      for(let pass=0;pass<values.length;pass++) for(let j=1;j<values.length;j++) {
        if(down?values[j-1]<values[j]:values[j-1]>values[j]) {
          [values[j-1],values[j]]=[values[j],values[j-1]];count++;
        }
      }
      return count;
    };
    check(body,3,value=>numeric(value)===overtake(rows[0]));
    check(body,4,value=>numeric(value)===overtake(rows[1]));
    const relaxed=solver(rows[2],choices,true), original=solver(rows[2]);
    const concepts=[String(relaxed.data)!==String(expected(rows[2])),relaxed.copies>original.copies,relaxed.copies===original.copies,relaxed.copies<original.copies];
    const f=choiceBank(body,5);
    check(body,5,value=>concepts[f.indexOf(value)]);
    const match=p.match(/ランダムな([\d,]+)個.*?1／(\d+).*?([\d,]+)個のデータを整列したとき.*?log₂ \d+ ≒ (\d+)，log₂ \d+ ≒ (\d+)/);
    assert(match);
    const [,small,ratio,large,logA,logB]=match;
    const estimate=(numeric(large)**2 /(numeric(small)**2))*numeric(ratio)/
      ((numeric(large)*numeric(logB))/(numeric(small)*numeric(logA)));
    check(body,6,value=>numeric(value)===estimate);
  }
});

test('問5は昇順・降順の逐次キー照合、削除の真理条件、全キーと実行順候補を検算する',()=>{
  type Row={id:number; at:number; name:string; level:number; op:string};
  for(const i of cases) {
    const body=build(5,i),p=write(body.prompt), down=/をキーとして，降順/.test(p);
    const [,update,remove]=p.match(/更新区分が“([A-Z])”の場合を新規登録及び変更とし，“([A-Z])”/)!.slice(0,3);
    const timeLabel=p.match(/レコード様式に([^，。\n]+日時)という項目を追加する。/)![1];
    const asc=(a:number,b:number)=>down?b-a:a-b;
    const make=(id:number,at:number,name:string,level:number,op=update):Row=>({id,at,name,level,op});
    const base=[make(10,0,'一',1),make(19,0,'二',2),make(31,0,'三',2)];
    const edits=[make(15,10,'四',7),make(10,8,'五',3),make(15,3,'三',6),make(10,5,'十',8),make(10,6,'',5),make(22,3,'六',1)];
    const expected=[make(10,8,'五',3),make(15,10,'四',7),base[1],edits[5],base[2]].sort((a,b)=>asc(a.id,b.id));
    const sort=(data:Row[],key1:string,key2:string)=>{
      const read=(row:Row,key:string)=>key==='会員番号'?row.id:key===timeLabel?row.at:key==='サービス等級'?row.level:row.op.charCodeAt(0);
      return [...data].sort((a,b)=>asc(read(a,key1),read(b,key1))||read(a,key2)-read(b,key2));
    };
    const coalesce=(data:Row[])=>{
      const groups:Row[]=[];
      for(const row of data){
        if(groups.at(-1)?.id===row.id) {
          const old=groups.at(-1)!;
          groups[groups.length-1]={...row,name:row.name||old.name};
        } else groups.push(row);
      }
      return groups;
    };
    function merge(master:Row[],transaction:Row[],a:string,b:string) {
      const left=[...master].sort((x,y)=>asc(x.id,y.id)),right=transaction;
      let m=0,t=0;
      const answer:Row[]=[];
      for(let step=0;step<16;step++){
        if(!left[m]&&!right[t]) return answer;
        const x=left[m],y=right[t],comparison=!x?1:!y?-1:asc(x.id,y.id);
        if(comparison===0) {answer.push({...y,name:y.name||x.name}); t++; if(a==='M入力処理')m++;else if(a==='T入力処理')t++;}
        if(comparison<0) {answer.push(x); if(a==='M入力処理')m++;else if(a==='T入力処理')t++;}
        if(comparison>0) {answer.push(y); if(b==='T入力処理')t++;else if(b==='M入力処理')m++;}
      }
      return [];
    }
    const validSorted=coalesce(sort(edits,'会員番号',timeLabel));
    const m='M入力処理',t='T入力処理';
    check(body,0,value=>JSON.stringify(merge(base,validSorted,value,t))===JSON.stringify(expected));
    check(body,1,value=>JSON.stringify(merge(base,validSorted,m,value))===JSON.stringify(expected));
    const cond=(value:string,op:string)=>{
      const groups=Array.from(value.matchAll(/(＝|≠)“([A-Z])”/g),tag=>tag[1]==='＝'?op===tag[2]:op!==tag[2]);
      return value.includes('AND')?groups.every(Boolean):groups.some(Boolean);
    };
    check(body,2,value=>[update,remove,'?'].every(op=>cond(value,op)===(op!==update&&op!==remove)));
    const missing=make(16,2,'',0,remove);
    const representative=[...base].sort((a,b)=>asc(a.id,b.id)).find(row=>asc(row.id,missing.id)>0);
    assert(representative&& !base.some(row=>row.id===missing.id));
    const validity=[false,missing.op===remove&&!base.some(row=>row.id===missing.id),
      ['?','!'].includes(missing.op),missing.op===update&&!base.some(row=>row.id===missing.id)];
    const bank=choiceBank(body,3);
    check(body,3,value=>validity[bank.indexOf(value)]);
    const run=(key1:string,key2:string)=>JSON.stringify(merge(base,coalesce(sort(edits,key1,key2)),m,t));
    check(body,4,value=>run(value,timeLabel)===JSON.stringify(expected));
    check(body,5,value=>run('会員番号',value)===JSON.stringify(expected));
    const programs:Record<string,(input:Row[])=>Row[]>={'整列プログラム':rows=>sort(rows,'会員番号',timeLabel),
      'レコード集約プログラム':coalesce,'更新プログラム':rows=>merge(base,rows,m,t)};
    check(body,6,value=>{
      // The input contract is also checked because the emitted result of the final stage must be a master file.
      const sequence=value.split(' → ');
      let source:Row[]=edits;
      let grouped=false, sorted=false, master=false;
      for(const step of sequence) {
        if(master||step==='レコード集約プログラム'&&!sorted||step==='更新プログラム'&&!grouped) return false;
        source=programs[step](source);
        sorted||=step==='整列プログラム';grouped||=step==='レコード集約プログラム';master||=step==='更新プログラム';
      }
      return master&&JSON.stringify(source)===JSON.stringify(expected);
    });
    const figures=diagrams(body);
    assert.match(figures[1].alt,down?/最小値.*＞ならM′/:/最大値.*＜ならM′/);
    assert.match(figures[2].alt,/条件X2はエラー処理1の後にT入力処理/);
  }
});

test('全22図をSSRし、図の代替説明・図中の境界や矢印・無効入力を照合する',()=>{
  let count=0;
  for(const {profile,component} of renderers){
    const definition=figures.find(item=>item.profile===profile);assert(definition);
    const [[first,last]]=definition.domain;
    assert.throws(()=>definition.alt([last+1]));
    for(let input=first;input<=last;input++){
      const markup=renderToStaticMarkup(createElement(component,{caption:'問題図',values:[input]}));
      assert.match(markup,/role="img"/);assert.match(markup,/aria-describedby=/);
      assert.match(markup,/tabindex="0"/i);assert(!markup.includes('NaN'));
      if(profile.endsWith('-network')){
        assert.equal((markup.match(/marker-end=/g)??[]).length,12);
        assert.match(markup,/stroke-dasharray="5 4"/);
      }
      if(profile.endsWith('-assignment')) assert.equal((markup.match(/text-decoration="underline"/g)??[]).length,4);
      count++;
    }
  }
  assert.equal(count,22);
});
