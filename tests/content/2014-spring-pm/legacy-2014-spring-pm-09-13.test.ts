import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import {
  legacy2014SpringPm9Definition as q9,legacy2014SpringPm10Definition as q10,
  legacy2014SpringPm11Definition as q11,legacy2014SpringPm12Definition as q12,
  legacy2014SpringPm13Definition as q13,spring2014Pm0913OriginalPageAlt,
} from '../../../src/core/generators/legacy-2014-spring-pm-09-13';
import { spring2014Pm13Model } from '../../../src/core/generators/legacy-2014-spring-pm-09-13-models';
import { legacy2014SpringPm0913Figures as figures } from '../../../src/core/generators/legacy-2014-spring-pm-09-13-figures';
import { legacy2014SpringPm0913FigureRenderers as renderers } from '../../../src/ui/Legacy2014SpringPm0913Figures';
import { executeSpringCasl } from '../../fixtures/legacy-2014-spring-pm-09-13-casl';
import {
  choice, choices, visiblePrompt, complete, codeBlocks, panel, cExamples, javaInputs, javaReference, textWithoutMarks,
} from '../../fixtures/legacy-2014-spring-pm-09-13-displayed';

const definitions=[q9,q10,q11,q12,q13];
const official=['アイアカウウ','アオイアウウエ','イウウキキカエ','イカカエエオ','エイイウオケ'];
const ranges=[[46,51],[52,57],[58,64],[65,69],[70,77]];
const allCases=Array.from({length:8},(_,i)=>i);
function accepts(body:GeneratedBody,name:string,oracle:(candidate:string,index:number)=>boolean){
  const bank=choices(body,name);
  assert.deepEqual(bank.choices.filter(oracle),[bank.selected],name+' — '+bank.choices.join('｜'));
}

test('2014春 午後問9〜13の原ページ・公式キー・32欄・40条件を保つ',()=>{
  for(const [i,definition] of definitions.entries()){
    const [start,end]=ranges[i];
    const alt=spring2014Pm0913OriginalPageAlt(9+i);
    assert.deepEqual(Object.keys(alt).map(Number),Array.from({length:end-start+1},(_,offset)=>start+offset));
    assert(Object.values(alt).every(text=>text.length>100));
    const baseline=definition.build([0]);
    assert.equal(baseline.answerParts!.map(part=>choices(baseline,part.id.slice(5)).key).join(''),official[i]);
    const prompts=new Set<string>(),answers=new Set<string>();
    for(const index of allCases){
      const body=definition.build([index]);
      prompts.add(visiblePrompt(body));
      answers.add(body.answerParts!.map(part=>choices(body,part.id.slice(5)).selected).join('｜'));
      assert.deepEqual(body.answerParts,baseline.answerParts);
      for(const {id,choiceIds} of body.answerParts!){
        assert.equal(new Set(choiceIds.map(id=>choice(body,id))).size,choiceIds.length);
        if(!['part-c','part-s2'].includes(id)||i!==4&&id==='part-c') {
          if(id!=='part-s2')assert.match(visiblePrompt(body),new RegExp('[\\[［]'+id.slice(5)+'[\\]］]'));
        }
      }
    }
    assert.equal(prompts.size,8);
    assert.equal(answers.size,definition.answerVariation==='fixed'?1:i===1?8:3);
    for(const values of [[],[-1],[8],[1.5],Array(1),[0,1]])assert.throws(()=>definition.build(values));
  }
  assert.equal(definitions.reduce((sum,definition)=>sum+definition.build([0]).answerParts!.length,0),32);
  assert.deepEqual(q11.build([0]).contexts?.map(x=>x.title),['問11 Java APIの参考資料（編集資料）']);
  assert(q12.fixedReferenceAssetIds?.[2].endsWith('p082-casl-excerpt'));
  assert.deepEqual(q13.fixedReferenceAssetIds?.map(id=>Number(id.slice(-3))),[2,4,5,86,87,88,89,90,91]);
  assert.match(spring2014Pm0913OriginalPageAlt(13)[73],/L\$2:M\$41/);
  assert.equal(spring2014Pm0913OriginalPageAlt(13)[73].match(/K\$2:K\$10/g)?.length,8);
  assert.match(visiblePrompt(q13.build([0])),/L\$2～M\$41/);
  assert(choices(q13.build([0]),'b').choices.every(value=>!value.includes(':')));
});

function wrapReference(input:string,width:number,punctuation:string|undefined){
  let remaining=input,result='',line='',previous=punctuation;
  while(remaining.length){
    const match=/^[^\n ]+/.exec(remaining);
    const next=match?.[0]??remaining[0];
    remaining=remaining.slice(next.length);
    if(next==='\n'||line.length+next.length>width){result+=line+'\n';line='';}
    if(next==='\n')continue;
    if(next===' '){if(line.length||punctuation===undefined)line+=' ';continue;}
    if(!line.length&&punctuation!==undefined&&previous===punctuation)line+=' ';
    line+=next;
    previous=next.at(-1);
  }
  return result+line;
}
test('2014春 午後問9は改行・空白・終端と全択の文の効果を照合する',()=>{
  for(const index of allCases){
    const body=q9.build([index]),{width,punctuation,examples}=cExamples(body);
    for(const [i,{input,output}] of examples.entries())assert.equal(wrapReference(input,width,i?punctuation:undefined),output);
    if(!index){
      const sourceExpected='The    Information   Technology   Engineers\n'+
        '   Examination   was  first  administered  in  \n1969. In 1970,\n'+
        ' it became a national examination. \n'+
        '       Since its commencement, the examination has\n played   \n'+
        '    an important role   in the development of IT  \n  engineers. \n';
      assert.equal(examples[0].output,sourceExpected);
      assert.equal(examples[1].output,' The    Information   Technology   Engineers\n'+
        'Examination   was  first  administered  in  1969. \n In 1970,\n'+
        'it became a national examination. \n Since its commencement, the examination has \n'+
        'played   \nan important role   in the development of IT    \nengineers. \n');
    }
    const states=[[0,0],[1,0],[7,2],[width-1,0],[width-1,1],[width-2,2],[0,20]];
    const lposValues=(line:number,sp:number)=>[0,sp,width,line+1,line+sp];
    accepts(body,'a',(_,i)=>states.every(([line,sp])=>lposValues(line,sp)[i]===0));
    accepts(body,'b',value=>value===String.raw`'\n'`);
    accepts(body,'c',(_,i)=>states.every(([line,sp])=>[0,line,sp+1,sp,sp+1][i]===0));
    accepts(body,'d',(_,i)=>states.every(([line,sp])=>
      [line>0,line>=width,line>sp,sp>0,line+sp>0,line+sp>=width][i]===(line+sp+1>width)));
    accepts(body,'e',(_,i)=>states.every(([line,sp])=>
      [line===0,line===sp,line!==0,line!==sp,sp===0,sp!==0][i]===(line>0)));
    accepts(body,'f',(_,i)=>['x',punctuation,'C'].every(ch=>[ ' ',punctuation,ch,'old','old'][i]===ch));
  }
});

function repeatedIndexes(candidate:string):number[]{
  const match=/VARYING W-CNT FROM (\d+|ZERO) BY (-?\d+) UNTIL W-CNT ([>=]) (\d+|ZERO)/.exec(candidate);
  if(!match)return [];
  const value=(text:string)=>text==='ZERO'?0:Number(text);
  const initial=value(match[1]),step=value(match[2]),limit=value(match[4]),test=(n:number)=>match[3].trim()==='>'?n>limit:n===limit;
  const result:number[]=[];
  for(let n=initial;result.length<20;n+=step){
    if(result.length||candidate.startsWith('TEST BEFORE')){if(test(n))break;}
    result.push(n);
  }
  return result;
}
type ScoreRow = readonly [number,number];
function verifyScoreUpdate(history:number,values:readonly ScoreRow[],newScore:ScoreRow,order:number[],predicate:string,indexChoice:string) {
  const copy=[...values];
  let sum=newScore[1],n=1;
  for(const pos of order){
    if(pos<1||pos>=history)return undefined;
    const row=copy[pos-1];
    copy[pos]=row;
    const measured=row[predicate.includes('MST-DATE')?0:1];
    if(predicate.includes('NOT')?measured!==0:measured===0){sum+=row[1];n++;}
  }
  const slot=indexChoice==='HST-NUM'?n-1:indexChoice==='W-CNT'?0:Number(indexChoice);
  if(slot<1||slot>history)return undefined;
  copy[slot-1]=newScore;
  return {copy,avg:Math.floor(sum/n)};
}
function rank(values:number[],limit:number,condition:number,update:number){
  let previous=0,position=1;
  const shown=[];
  for(const score of [...values].sort((a,b)=>b-a)){
    if([position===limit&&score===previous,position===limit&&score>previous,
      position>limit&&score<previous,position>limit&&score===previous][condition])break;
    shown.push(update===2?previous:score);
    if(update===0)position++;
    if(update===1)previous+=score;
    if(update===3)previous=score;
    position++;
  }
  return shown;
}

test('2014春 午後問10は順ファイル更新、0点と欠日、切捨て平均と同点を別計算する',()=>{
  for(const index of allCases){
    const body=q10.build([index]);
    const history=Number(/OCCURS (\d+)/.exec(visiblePrompt(body))![1]);
    const limit=Number(/上位(\d+)名/.exec(visiblePrompt(body))![1]);
    assert.match(panel(body,'master').notes![0],new RegExp(String(history)));
    const a=choices(body,'a').selected,b=choices(body,'b').selected,c=choices(body,'c').selected,d=choices(body,'d').selected;
    const rows=Array.from({length:history},(_,i)=>[20140320-i,i%2===0?0:85] as const);
    const probes=[rows,rows.map((row,i)=>i<2?row:[0,0] as const),rows.map(()=>[0,0] as const)];
    const next=[20140420,73] as const;
    function matches(candidateB:string,candidateC:string,candidateD:string){
      return probes.every(previous=>{
        const expected=[next,...previous.slice(0,-1)];
        const scores=expected.flatMap(([date,score])=>date?[score]:[]);
        const reference={copy:expected,avg:Math.trunc(scores.reduce<number>((sum,score)=>sum+score,0)/scores.length)};
        return JSON.stringify(verifyScoreUpdate(history,previous,next,repeatedIndexes(candidateB),candidateC,candidateD))===JSON.stringify(reference);
      });
    }
    accepts(body,'a',candidate=>candidate.startsWith('TEST AFTER UNTIL')&&candidate.includes('SCR-ENUM = MST-ENUM'));
    assert(a.endsWith('MST-ENUM'));
    accepts(body,'b',candidate=>matches(candidate,c,d));
    accepts(body,'c',candidate=>matches(b,candidate,d));
    accepts(body,'d',candidate=>matches(b,c,candidate));
    const attempted=[1,4,5],master=[1,2,3,4,5];
    const repeats=master.filter(id=>id>attempted[0]&&id<=attempted.at(-1)!).length+1;
    accepts(body,'e',(_,i)=>[1,repeats,attempted.length,attempted.length*(history-1)][i]===attempted.length);
    const scores=[Array.from({length:limit-1},(_,i)=>100-i).concat([50,50,50,34,21,0]),
      Array.from({length:limit+2},(_,i)=>99-i),[100,90,1,0]];
    const f=choices(body,'f').choices.indexOf(choices(body,'f').selected);
    const g=choices(body,'g').choices.indexOf(choices(body,'g').selected);
    const expected=(items:number[])=>items.filter(score=>items.filter(other=>other>score).length<limit).sort((a,b)=>b-a);
    accepts(body,'f',(_,i)=>scores.every(items=>JSON.stringify(rank(items,limit,i,g))===JSON.stringify(expected(items))));
    accepts(body,'g',(_,i)=>scores.every(items=>JSON.stringify(rank(items,limit,f,i))===JSON.stringify(expected(items))));
  }
});

test('2014春 午後問11は記事順・閲覧拒否と全択の型及び状態条件を検算する',()=>{
  for(const index of allCases){
    const body=q11.build([index]),{articles,changed}=javaInputs(body);
    assert.equal(articles.length,3);
    assert.equal(articles.find(article=>article.id===changed)?.free,true);
    assert.deepEqual(panel(body,'subscription').tables[0].rows.flat(),javaReference(articles));
    const count=javaReference(articles,changed).filter(line=>line.endsWith('＜閲覧不可＞')).length;
    accepts(body,'a',(_,i)=>[true,false].every(free=>
      [!free,free,false,undefined,undefined,undefined,true][i]===free));
    accepts(body,'b',candidate=>candidate.startsWith('super(')&&candidate.includes('name'));
    accepts(body,'c',(_,i)=>[-1,0,1].every(previousDay=>
      [previousDay!==0,previousDay<0,previousDay===0,previousDay>0,undefined][i]===(previousDay===0)));
    accepts(body,'d',(_,i)=>[true,false].every(free=>
      [!free,free,false,undefined,undefined,undefined,true][i]===true));
    accepts(body,'e',candidate=>/^User reader : readers$/.test(candidate));
    accepts(body,'f',candidate=>/^String id : Article.getIds\(\)$/.test(candidate));
    accepts(body,'s2',candidate=>candidate===count+'回');
  }
});

function tokenReference(input:string,base:number){
  const tokens=[...input.matchAll(/[^ .]+/g)];
  return {result:[...tokens.flatMap(token=>[base+token.index!,token[0].length,/^\d+$/.test(token[0])?0:1]),-1],
    nextChars:tokens.flatMap(token=>{const match=/\D/.exec(token[0]);return match?[match[0]]:[];})};
}

test('2014春 午後問12はCOMET IIの独立実行と正規表現で全択を検算する',()=>{
  for(const index of allCases){
    const body=q12.build([index]),[get,one,two]=codeBlocks(body,'casl2');
    const exercise=panel(body,'get-tokens'),[text,shown]=exercise.tables.map(table=>table.rows[0]);
    const base=Number(/(\d+)番地/.exec(exercise.notes![0])![1]);
    const sample=textWithoutMarks(text.join(''));
    const trace=textWithoutMarks(panel(body,'trace-tokens').tables[0].rows[0].join(''));
    const inputs=[sample,trace,'.','   .',' 00019 .',' 0 9 0A2 A1 + .','2  B1 9 .'];
    const normalized=shown.map(value=>Number(value.replace('−','-')));
    assert.deepEqual(normalized,tokenReference(sample,base).result);
    const checksTokens=(alternatives:Record<string,string>)=>inputs.every(input=>{
      try{
        const actual=executeSpringCasl(complete(get,body,alternatives),complete(one+'\n'+two,body),'tokens',input,base);
        const expected=tokenReference(input,base);
        assert.deepEqual(actual.result,expected.result);
        assert.deepEqual(actual.nextChars,expected.nextChars);
        assert.deepEqual(actual.registers,[0,base,400,0,0,0,0,0]);
        return true;
      }catch{return false;}
    });
    accepts(body,'a',candidate=>checksTokens({a:candidate}));
    accepts(body,'b',candidate=>checksTokens({b:candidate}));
    accepts(body,'s2',candidate=>tokenReference(trace,base).nextChars[1]===candidate);
    const checksCalc=(alternatives:Record<string,string>)=>(
      [[0,'*',0,0],[0,'*',65535,0],[217,'*',0,0],[33,'*',17,561],[0,'+',65535,65535],
        [41,'+',201,242],[65535,'-',1,65534],[9,'-',9,0],[1,'*',65535,65535]] as const
    ).every(([left,operator,right,result])=>{
      try{
        const actual=executeSpringCasl(complete(get,body),complete(one+'\n'+two,body,alternatives),'calc',`${left} ${operator} ${right} .`,base);
        return actual.registers[0]===result&&actual.registers.slice(1).join(',')===[base,400,0,0,0,0,0].join(',');
      }catch{return false;}
    });
    for(const field of ['c','d','e'])accepts(body,field,candidate=>checksCalc({[field]:candidate}));
  }
});

type Tuple=readonly [number,number,number];
function groupedReference(tuples:readonly Tuple[],minimum:number) {
  const byKey=new Map<string,number>();
  for(const tuple of tuples){
    const key=tuple.map((value,index)=>String(value).padStart(index===2?3:2,'0')).join('/');
    byKey.set(key,(byKey.get(key)??0)+1);
  }
  return [...byKey].filter(([,count])=>count>=minimum).sort(([a],[b])=>a<b?-1:1).map(([key,count])=>{
    const [post,age,job]=key.split('/').map(Number);
    return [post,age,job,count];
  });
}

function simulateMacro(tuples:readonly Tuple[],minimum:number,chosen:{d:number;e:number;f:number}){
  const evalKey=([post,age,job]:Tuple)=>Number(String(post).padStart(2,'0')+String(age).padStart(2,'0')+String(job).padStart(3,'0'));
  const rows=new Map<number,number[]>();
  const used=new Set<number>();
  let current=0,nextRow=1,count=0;
  let i=1,steps=0;
  const apply=(option:number)=>{
    if(option===0)i++;
    if(option===1)i+=nextRow;
    if(option===2)i+=count;
    if(option===3)nextRow=i;
    if(option===4)nextRow++;
    if(option===5)nextRow+=count;
    if(option===6)nextRow=count+1;
    if(option===7)count=nextRow;
    if(option===8)count++;
    if(option===9)count+=nextRow;
  };
  while(i<=tuples.length){
    if(++steps>tuples.length)return undefined;
    const scores=tuples.map((tuple,index)=>evalKey(tuple)+(used.has(index)?10_000_000:0));
    const min=Math.min(...scores),max=Math.max(...scores);
    const ascending=scores.every((score,j)=>j===0||scores[j-1]<=score);
    const options=[scores.filter(score=>score>scores[i-1]).length-1,scores.filter(score=>score<scores[i-1]).length-1,
      scores.indexOf(min),ascending?scores.lastIndexOf(min):-1,scores.indexOf(max),ascending?scores.lastIndexOf(max):-1,
      scores[i-1]-1,(scores[nextRow-1]??0)-1];
    const next=options[chosen.d];
    if(next<0||next>=tuples.length||used.has(next))return undefined;
    used.add(next);
    const evaluation=scores[next]+10_000_000;
    if(evaluation!==current){
      if(count>=minimum)apply(chosen.e);
      count=1;
      rows.set(nextRow,[...tuples[next],count]);
      current=evaluation;
    }else{
      apply(chosen.f);
      const row=rows.get(nextRow);
      if(!row)return undefined;
      row[3]=count;
    }
    i++;
  }
  const last=rows.get(nextRow);
  if(!last||used.size!==tuples.length)return undefined;
  if(last[3]<minimum)rows.delete(nextRow);
  const ordered=[...rows].sort(([a],[b])=>a-b);
  return ordered.every(([row],index)=>row===index+1)?ordered.map(([,row])=>row):undefined;
}

test('2014春 午後問13は修正後の全式、シートの配置、集計の全択を独立検算する',()=>{
  for(const index of allCases){
    const body=q13.build([index]);
    const ages=panel(body,'ages').tables[0].rows.map(([,age])=>Number(age));
    const anonymous=panel(body,'anonymous').tables[0];
    const minimum=Number(anonymous.rows[1].at(-1));
    const displayedJobs=anonymous.rows.flatMap(row=>/^\d+$/.test(row[12])?[[Number(row[12]),row[13]] as const]:[]);
    assert.deepEqual(anonymous.columns,['',...'ABCDEFGHIJKLMN']);
    assert.deepEqual(anonymous.rows.slice(1,10).map(row=>Number(row[11])),[...ages,1000]);
    assert.equal(anonymous.rows[1][14],String(minimum));
    for(const post of [0,109996,1070062,2099981,4099010,9999999]){
      const leading=Number(String(post).padStart(7,'0').slice(0,2));
      if(post===0)continue;
      assert.equal(Math.trunc(post/100000),leading);
    }
    const posts=[109996,1070062,2099981,4099010,9999999];
    accepts(body,'a',(_,candidate)=>posts.every(post=>{
      const options=[100000%post,post%100000,Math.trunc((post/10)**5),Math.trunc(post/100000),Math.trunc(post/10)**5];
      return options[candidate]===Number(String(post).padStart(7,'0').slice(0,2));
    }));
    const sentinels=[...ages,1000];
    const floorAge=(value:number)=>ages.filter(boundary=>value>=boundary).at(-1)!;
    const approx=(value:number)=>sentinels.filter(boundary=>value>=boundary).at(-1);
    const ageValues=[0,1,...ages.flatMap(age=>age>0?[age-1,age,age+1]:[]),99];
    accepts(body,'b',(_,candidate)=>ageValues.every(age=>{
      // A -1 match assumes a descending range, but K is ascending.
      const values=[sentinels.find(x=>x===age),approx(age),sentinels.find(x=>x===age+1),approx(age+1),undefined,approx(age+1)];
      return values[candidate]===floorAge(age);
    }));
    const jobInputs=Array.from({length:999},(_,i)=>i+1).filter(job=>/^[1-9]{3}$/.test(String(job)));
    const alternatives=(job:number)=>[
      [job-job%10,job],[job-job%100,job-job%10],[job-job%100,job],[job,job-job%10],[job,job-job%100],
    ];
    accepts(body,'c',(_,candidate)=>jobInputs.every(job=>{
      const [major,middle]=alternatives(job)[candidate];
      return major===Number(String(job)[0]+'00')&&middle===Number(String(job).slice(0,2)+'0');
    }));
    const full=anonymous.rows.filter(row=>/^\d{4}$/.test(row[1]));
    for(const row of full)assert.deepEqual(row.slice(8,11),['','','']);
    const convert=(job:number,marked:number[])=>{
      const candidate=String(job);
      return [candidate[0]+'00',candidate.slice(0,2)+'0',candidate].map(Number).find((value,i)=>i===2||marked.includes(value))!;
    };
    const visibleInput=panel(body,'customers').tables[0].rows.filter(row=>/^\d{4}$/.test(row[1]));
    const model=spring2014Pm13Model(index);
    assert(displayedJobs.every(([code,marker])=>marker===(model.marked.includes(code)?'*':'')));
    for(const [,id,,post,,,age,job] of visibleInput){
      const row=full.find(row=>row[1]===id)!;
      assert.deepEqual([Number(row[3]),Number(row[6]),Number(row[7])],
        [Number(post.slice(0,2)),floorAge(Number(age)),convert(Number(job),model.marked)]);
    }
    if(index){
      assert.equal(model.customers.length,5000);
      const source=model.customers.map(({post,age,job})=>{
        const digits=String(post).padStart(7,'0');
        const major=Number(String(job)[0]+'00'),middle=Number(String(job).slice(0,2)+'0');
        assert(model.jobs.includes(major)&&model.jobs.includes(middle),'both code lookups have an exact key');
        return [Number(digits.slice(0,2)),floorAge(age),convert(job,model.marked)] as const;
      });
      const provided=panel(body,'published').tables[0].rows.slice(1).filter(row=>/^\d+$/.test(row[0]));
      const expected=groupedReference(source,minimum);
      for(const [row,...values] of provided)assert.deepEqual(values.map(Number),expected[Number(row)-2]);
      assert(expected.length<groupedReference(source,1).length,'the threshold removes some groups');
      assert.equal(expected.length,model.groupCount);
    }else{
      assert.deepEqual(panel(body,'published').tables[0].rows.at(-1),['207','99','60','500','3']);
    }
    const replicate=(size:number,tuple:Tuple)=>Array<Tuple>(size).fill(tuple);
    const tuples=[
      [...replicate(minimum+2,[80,60,420]),...replicate(minimum-1,[90,60,430]),
        ...replicate(minimum,[1,20,100]),...replicate(minimum+1,[50,50,300]),[0,0,100],[99,60,500] as const],
      [[99,60,420],[5,20,100],[12,20,420],[0,0,100],[12,20,420],[5,20,100],[12,20,420],
        [0,0,100],[5,20,100],[12,20,420],[5,20,100],[0,0,100],[0,0,100],[12,20,420]],
      [[1,0,100],[0,0,100],[1,0,100],[1,0,100]],
      [[99,60,420],[8,20,120],[8,20,120],[8,20,120],[8,20,120],[8,20,120],[8,20,120]],
    ] as const;
    const fields=['d','e','f'] as const;
    const selected=Object.fromEntries(fields.map(field=>{
      const bank=choices(body,field);
      return [field,bank.choices.indexOf(bank.selected)];
    })) as Record<typeof fields[number],number>;
    for(const field of fields)accepts(body,field,(_,candidate)=>tuples.every(items=>
      JSON.stringify(simulateMacro(items,minimum,{...selected,[field]:candidate}))===JSON.stringify(groupedReference(items,minimum))));
  }
});

test('2014春 午後問9〜13の全18プロフィールはHTML描画と代替説明を対応させる',()=>{
  assert.equal(figures.length,18);
  assert.deepEqual(renderers.map(r=>r.profile),figures.map(f=>f.profile));
  for(const [i,figure] of figures.entries()){
    for(const index of allCases){
      const caption='図表';
      const escape=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
      const html=renderToStaticMarkup(createElement(renderers[i].component,{values:[index],caption}));
      assert(html.includes('role="group"')&&html.includes('aria-label="'+caption+'"'));
      assert(html.includes('aria-description="'+escape(figure.alt([index]))+'"'));
      assert(html.includes('<table')&&html.includes('data-spring-2014-language-figure="'+figure.profile+'"'));
    }
  }
});

test('2014春 午後問9と問11は完成C11・Java SE 8対象の実行を照合する',async()=>{
  await import('../../fixtures/legacy-2014-spring-pm-09-13-native-check');
});
