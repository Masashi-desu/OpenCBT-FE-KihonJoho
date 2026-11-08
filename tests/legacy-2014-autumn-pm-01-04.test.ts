import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { gradeAnswer, validateAnswerDefinition } from '../src/core/answers';
import { readBookletFigure } from '../src/core/booklet-figure-extension-contract';
import type { GeneratedBody } from '../src/core/generators/definition';
import type { Block, Question } from '../src/core/types';
import { autumn2014Pm01To04Specs as specs } from '../scripts/legacy-2014-autumn-pm-01-04-specs';
import { legacy2014AutumnPm0104Figures as figures } from '../src/core/generators/legacy-2014-autumn-pm-01-04-figures';
import { legacy2014AutumnPm0104FigureRenderers as renderers } from '../src/ui/Legacy2014AutumnPm0104Figures';
import review from './fixtures/legacy-2014-autumn-pm-01-04-review.json';

const marks='アイウエオカキ';
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const blockText=(b:Block)=>b.type==='diagram'?b.alt:b.type==='table'?b.rows.flat().join(' '):'text' in b?b.text:'';
const text=(body:GeneratedBody)=>body.prompt.map(blockText).join('\n');
const all=(n:number)=>{
  const d=specs[n-1].definition;
  return Array.from({length:d.fields[0].maximum+1},(_,i)=>d.build([i]));
};
function group(body:GeneratedBody){
  assert(body.answerParts&&body.partAnswers);
  return body.partAnswers.map(answer=>{
    assert(answer.kind==='choice'||answer.kind==='unordered');
    const ids=answer.kind==='choice'?[answer.partId]:answer.partIds;
    const bank=body.answerParts!.find(p=>p.id===ids[0])!.choiceIds;
    assert(ids.every(id=>JSON.stringify(body.answerParts!.find(p=>p.id===id)!.choiceIds)===JSON.stringify(bank)));
    const correct=(answer.kind==='choice'?[answer.choiceId]:answer.choiceIds).map(id=>bank.indexOf(id));
    const options=bank.map(id=>body.choices[Number(id.slice('choice-value-'.length))-1].map(blockText).join('\n'));
    return {correct,options,slots:ids.length};
  });
}
function verify(g:ReturnType<typeof group>[number], truth:boolean[]){
  assert.equal(truth.length,g.options.length);
  assert.deepEqual(truth.flatMap((v,i)=>v?[i]:[]),[...g.correct].sort((a,b)=>a-b));
}
function match(s:string,re:RegExp){
  const result=re.exec(s);
  assert(result,re.toString());
  return result;
}
function render(b:Block){
  assert(b.type==='diagram'&&b.scene.kind==='source_figure');
  const {profile,values}=b.scene;
  const entry=figures.find(d=>d.profile===profile), renderer=renderers.find(r=>r.profile===profile);
  assert(entry&&renderer);
  assert.equal(readBookletFigure(entry,values),b.alt);
  const html=renderToStaticMarkup(createElement(renderer.component,{values,caption:b.caption}));
  assert.match(html,/<svg[^>]+viewBox=/);
  assert.match(html,/<desc\b/);
  assert.match(html,/var\(--image-scale, 1\)/);
  assert.match(html,/class="diagram-scroll"/);
  return html;
}
function drawing(body:GeneratedBody,suffix:string){
  const result=body.prompt.find(b=>b.type==='diagram'&&b.scene.kind==='source_figure'&&b.scene.profile.endsWith(suffix));
  assert(result?.type==='diagram');
  return result;
}
function table(body:GeneratedBody, caption:string){
  const result=body.prompt.find(b=>b.type==='table'&&b.caption.startsWith(caption));
  assert(result?.type==='table');
  return result;
}

test('原19頁・公式20行・21選択枠、原順と全12条件の構成を検査する',()=>{
  assert.deepEqual(figures.map(d=>d.profile),renderers.map(r=>r.profile));
  let rows=0, slots=0, originalOptions=0, variedOptions=0;
  const profiles=new Set<string>();
  for(const [i,s] of specs.entries()){
    const audit=review.questions[i], variants=all(s.number), baseline=group(s.original);
    assert.equal(s.definition.source,'2014h26a-fe-pm-'+s.number);
    assert.deepEqual(s.pages,audit.physicalPages);
    assert.deepEqual(s.pages,audit.printedPages);
    assert.deepEqual(Object.keys(s.originalPageAlt).map(Number),s.pages);
    assert(Object.values(s.originalPageAlt).every(alt=>alt.length>=150&&!alt.includes('choice-value-')));
    assert.deepEqual(baseline.map(g=>g.correct.map(index=>marks[index])),audit.keys);
    assert.deepEqual(baseline.map(g=>hash(g.options)),audit.bankHashes);
    assert.equal(s.original.answerParts?.length,audit.slots);
    assert.equal(variants.length,audit.cases);
    assert.equal(new Set(variants.map(text)).size,variants.length);
    assert(new Set(variants.map(v=>JSON.stringify(v.partAnswers))).size>1);
    rows+=audit.officialRows; slots+=audit.slots;
    originalOptions+=baseline.reduce((n,g)=>n+g.options.length*g.slots,0);
    for(const body of variants){
      assert.deepEqual(body.prompt.map(b=>b.type),s.original.prompt.map(b=>b.type));
      assert.deepEqual(body.choices.map(c=>c.map(b=>b.type)),s.original.choices.map(c=>c.map(b=>b.type)));
      const groups=group(body);
      for(const [k,g] of groups.entries()){
        assert(g.correct.every(index=>index>=0&&index<g.options.length));
        assert.equal(g.slots,baseline[k].slots);
        assert.equal(g.options.length,baseline[k].options.length);
        assert.equal(g.options.length,new Set(g.options).size);
        variedOptions+=g.options.length*g.slots;
      }
      for(const b of body.prompt)if(b.type==='diagram'&&b.scene.kind==='source_figure'){render(b);profiles.add(b.scene.profile);}
      assert(body.explanation.length>150);
    }
    for(const bad of [[],[-1],[variants.length],[0.5],[NaN],[0,1],Array(1),Object.assign([0],{extra:1}),Object.defineProperty([0],'0',{get:()=>0})])
      assert.throws(()=>s.definition.build(bad),/PARAMETER_CONSTRAINT/);
  }
  assert.equal(rows,20);assert.equal(slots,21);assert.equal(originalOptions,114);assert.equal(variedOptions,342);assert.equal(profiles.size,15);
});

test('問1は登録可能性・通信の方向と宛先・公開鍵認証を全択で確認する',()=>{
  type Packet={source:string;destination:string;incoming:string;outgoing:string;port:number};
  const pass=(line:string,flow:Packet)=>{
    const [src,dst,port]=line.split(',');
    return (src===flow.source||src===flow.incoming)&&(dst===flow.destination||dst===flow.outgoing)&&Number(port)===flow.port;
  };
  for(const body of all(1)){
    const [purpose,a,b,c,key]=group(body), visible=text(body);
    const network=drawing(body,'network');
    const host=(name:string)=>match(network.alt,new RegExp(name+'（([\\d.]+)）'))[1];
    const web=host('Webサーバ'), dbName=match(visible,/(会員管理サーバ|メールマガジン送信サーバ)上で稼働しているデータベース/)[1];
    const db=host(dbName), service=table(body,'表1').rows;
    const https=Number(service.find(row=>row[1]==='HTTPS')?.[2]), dbPort=Number(service.find(row=>row[0]==='会員情報DB')?.[2]);
    const ssh=Number(match(visible,/待受けポート番号(\d+)でSSH/)[1]), client=match(visible,/送信元IPアドレスは，([\d.]+)となっている/)[1];
    const reqWeb={source:'198.51.100.240',destination:web,incoming:'if0',outgoing:'if1',port:https};
    const reqDb={source:web,destination:db,incoming:'if1',outgoing:'if2',port:dbPort};
    const reqSsh={...reqWeb,source:client,port:ssh};
    verify(a,a.options.map(t=>pass('if0,'+t,reqWeb)&&!pass('if0,'+t,{...reqWeb,destination:db})));
    verify(b,b.options.map(t=>pass(web+','+t,reqDb)&&!pass(web+','+t,{...reqDb,source:'203.0.113.77'})));
    verify(c,c.options.map(t=>pass(t,reqSsh)&&!pass(t,{...reqSsh,source:'198.51.100.240'})));
    assert.match(visible,/入力されたメールアドレス宛てに送信/);
    const advance=(entered:string,mailbox:string)=>entered===mailbox;
    assert(advance('self','self')&&!advance('other','self')&&!advance('misspelled','self'));
    verify(purpose,purpose.options.map(t=>t.startsWith('他人のメールアドレスや間違ったメールアドレス')));
    const sent=new Set(['署名','公開鍵']);
    assert.match(visible,/対応する公開鍵をサーバに送る/);
    verify(key,key.options.map(t=>t.split('及び').every(x=>!sent.has(x))));
  }
});

function checkUnordered(body:GeneratedBody, length:number){
  assert(body.answerParts&&body.partAnswers);
  const unordered=body.partAnswers.find(a=>a.kind==='unordered');
  assert(unordered?.kind==='unordered'&&unordered.partIds.length===length);
  const q={choices:body.choices.map((_,i)=>({id:'choice-value-'+(i+1)})),answerParts:body.answerParts,
    correctAnswer:{parts:body.partAnswers}} as Question;
  validateAnswerDefinition(q);
  const fixed=Object.fromEntries(body.partAnswers.flatMap(a=>a.kind==='choice'?[[a.partId,a.choiceId]]:[]));
  const perms=(values:string[]):string[][]=>values.length<=1?[values]:values.flatMap((x,i)=>
    perms(values.filter((_,j)=>i!==j)).map(t=>[x,...t]));
  for(const order of perms(unordered.choiceIds)){
    const picks:Record<string,string>={...fixed,...Object.fromEntries(unordered.partIds.map((id,i)=>[id,order[i]]))};
    assert.equal(gradeAnswer(q,{selectedPartChoices:picks}).outcome,'correct');
  }
  const duplicates={...fixed,...Object.fromEntries(unordered.partIds.map(id=>[id,unordered.choiceIds[0]]))};
  assert.equal(gradeAnswer(q,{selectedPartChoices:duplicates}).outcome,'incorrect');
  delete duplicates[unordered.partIds[0]];
  assert.equal(gradeAnswer(q,{selectedPartChoices:duplicates}).outcome,'unanswered');
}
test('問2は表示した結線と全8状態を読み、三つのカウンタ解の全順列を採点する',()=>{
  const inputs=(b:Block)=>[...render(b).matchAll(/data-jk-input="([^"]+)"/g)].map(m=>m[1]);
  const from=(wire:string,q:number)=>wire==='Q'?q:wire==='Q̅'?1-q:Number(wire);
  const waveAlternatives=['0000','1111','1000','1010'];
  for(const body of all(2)){
    const [a,b,c,counter]=group(body), truth=table(body,'表1').rows;
    const excitation=render(drawing(body,'excitation-table'));
    assert.deepEqual([...excitation.matchAll(/data-excitation-blank="([^"]+)"/g)].map(m=>m[1]),['［b］','［c］']);
    assert.deepEqual([...excitation.matchAll(/data-excitation-transition="([^"]+)"/g)].map(m=>m[1]),['0→0','1→0','0→1','1→1']);
    assert.equal(truth.length,8);
    for(const [j,k,q,next] of truth.map(r=>r.map(Number)))assert.equal(next,[q,0,1,1-q][j*2+k]);
    const clock=(wires:string[],q:number)=>{
      let out='';
      for(let i=0;i<4;i++){
        q=[q,0,1,1-q][from(wires[0],q)*2+from(wires[1],q)];
        out+=q;
      }
      return out;
    };
    const circuit=drawing(body,'feedback');
    assert.match(render(circuit),/data-wave-values="010101010"/);
    verify(a,a.options.map((_,j)=>waveAlternatives[j]===clock(inputs(circuit),0)));
    const possible=(before:string,after:string)=>truth.filter(r=>r[2]===before&&r[3]===after).map(r=>r[0]+r[1]).sort().join(',');
    const expansion=(option:string)=>{
      const [j,k]=option.split('，'), spread=(v:string)=>v==='任意'?['0','1']:[v];
      return spread(j).flatMap(x=>spread(k).map(y=>x+y)).sort().join(',');
    };
    verify(b,b.options.map(option=>expansion(option)===possible('0','0')));
    verify(c,c.options.map(option=>expansion(option)===possible('1','1')));
    const example=inputs(drawing(body,'counter-example'));
    assert.equal(clock(example,0),'1010');
    assert.equal(clock(example,1),'0101');
    verify(counter,counter.options.map(option=>{
      const terms=option.split('，');
      return option!==example.join('，')&&clock(terms,0)==='1010'&&clock(terms,1)==='0101';
    }));
    checkUnordered(body,3);
  }
});

test('問3は独立した1ms進行で状態遷移・量子・残余時間と図5を検算する',()=>{
  for(const body of all(3)){
    const [s1,s2,a,b,c]=group(body);
    const flow=[...render(drawing(body,'process-steps')).matchAll(/data-process-io="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(flow.length,5);
    const transitions=[1,0,0,0];
    for(const mode of flow)if(mode==='yes'){transitions[2]++;transitions[3]++;transitions[0]++;}
    verify(s1,s1.options.map(option=>option===transitions.join('，')));
    const work=table(body,'表1').rows.map(([name,start,duration])=>({name,start:Number(start),duration:Number(duration)}));
    const quantum=Number(match(text(body),/タイムクウォンタムが(\d+)ミリ秒/)[1]);
    const rr=work.map(x=>({...x,remaining:x.duration})), queue:typeof rr=[];
    let current:typeof rr[number]|undefined,slice=0,queueOnD:string[]=[];
    for(let now=0;now<500;now++){
      const newly=rr.filter(p=>p.start===now);
      if(current&&(current.remaining===0||slice===quantum)){
        assert.equal(newly.length,0,'到着と交替を同時にしない');
        if(current.remaining>0)queue.push(current);
        current=undefined;
      }
      queue.push(...newly);
      if(!current){current=queue.shift();slice=0;}
      if(current?.name==='D'){queueOnD=queue.map(p=>p.name);break;}
      assert(current);
      current.remaining--;slice++;
    }
    assert.equal(queueOnD.length,3);
    verify(s2,s2.options.map(option=>option===queueOnD.join(', ')));
    const sr=work.map(x=>({...x,left:x.duration,end:-1})), prefix=sr.map(()=>''), runLog:string[]=[];
    let selected:typeof sr[number]|undefined;
    for(let t=0;t<500&&sr.some(p=>p.left);t++){
      if(t%10===0){
        const available=sr.filter(p=>p.start<=t&&p.left>0);
        const minimum=Math.min(...available.map(p=>p.left));
        const next=available.filter(p=>p.left===minimum);
        assert.equal(next.length,1);
        selected=next[0];
        runLog.push(selected.name);
        if(t<90)for(const [j,p] of sr.entries())prefix[j]+=p===selected?'○':p.start<=t&&p.left>0?'－':'.';
      }
      assert(selected&&selected.left>0);
      if(--selected.left===0)selected.end=t+1;
    }
    assert.equal(runLog.length*10,sr.reduce((n,p)=>n+p.duration,0));
    assert(sr.slice(0,3).every(p=>p.end>90));
    const html=render(drawing(body,'timeline'));
    assert.deepEqual([...html.matchAll(/data-process-states="([^"]+)"/g)].map(m=>m[1]),prefix);
    for(const [i,g] of [a,b,c].entries())verify(g,g.options.map(option=>Number(option)===sr[i].end-sr[i].start));
  }
});

test('問4は旧表の情報喪失、SQLのNULL・期日境界・集計と索引を別解法で検算する',()=>{
  type Loan=[number,number,string,string,string,string|null];
  const books=[[21,'Book A'],[22,'Book B'],[23,'Book C'],[24,'Book D']] as const;
  const loans:Loan[]=[
    [101,21,'008','2014-08-20','2014-08-29','2014-08-31'],
    [102,21,'002','2014-09-01','2014-09-10','2014-09-10'],
    [103,21,'004','2014-09-30','2014-10-10','2014-10-09'],
    [104,21,'001','2014-10-16','2014-10-20',null],
    [105,22,'003','2014-09-05','2014-09-12','2014-09-13'],
    [106,22,'005','2014-10-06','2014-10-15',null],
    [107,23,'006','2014-10-10','2014-10-24',null],
  ];
  const current='2014-10-20', pending=(l:Loan)=>l[5]===null;
  for(const body of all(4)){
    const [s1,a,b,index]=group(body), visible=text(body);
    const oldFields=['書籍番号','書籍名','著者','出版社','貸出日','返却予定日','社員番号'];
    assert(drawing(body,'old-books').alt.includes(oldFields.join('、')));
    assert.match(visible,/返却されたら，貸出日，返却予定日及び社員番号にはnull/);
    const present=(history:Loan[])=>history.filter(pending).map(row=>row.slice(1,5));
    assert.deepEqual(present(loans),present(loans.filter(row=>row[0]!==101)));
    verify(s1,s1.options.map(option=>option.includes('累積貸出回数')||option.includes('貸出履歴')));
    checkUnordered(body,2);
    assert.match(render(drawing(body,'new-books')),/data-primary-key="貸出番号"/);
    const condition=body.prompt.find(x=>x.type==='code'&&x.text.includes('［a］'));
    const summary=body.prompt.find(x=>x.type==='code'&&x.text.includes('［b］'));
    assert(condition?.type==='code'&&summary?.type==='code');
    const openOnly=visible.includes('現在返却されていない貸出'), closedOnly=visible.includes('返却済みで，返却予定日より後');
    const independentLate=(loan:Loan)=>{
      if(pending(loan))return !closedOnly&&loan[4]<current;
      return !openOnly&&loan[5]!>loan[4];
    };
    const expectedLate=loans.filter(independentLate).map(row=>[row[2],books.find(book=>book[0]===row[1])![1]])
      .sort((l,r)=>l[0].localeCompare(r[0]));
    const countSeptember=visible.includes('2014年9月1日から9月30日まで');
    const countClosed=visible.includes('返却済みの行だけを対象');
    const eligibleCount=loans.filter(l=>countSeptember?'2014-09-01'<=l[3]&&l[3]<='2014-09-30':!countClosed||!pending(l));
    const expectedCounts=books.map(([id,name])=>[id,name,eligibleCount.filter(row=>row[1]===id).length])
      .filter(row=>Number(row[2])>0);
    const unorderedRows=(rows:unknown[][])=>rows.map(row=>JSON.stringify(row)).sort();
    const db=new DatabaseSync(':memory:');
    try{
      db.exec('CREATE TABLE 書籍表 (書籍番号 INTEGER PRIMARY KEY, 書籍名 TEXT);'+
        'CREATE TABLE 貸出表 (貸出番号 INTEGER PRIMARY KEY, 書籍番号 INTEGER, 社員番号 TEXT, 貸出日 TEXT, 返却予定日 TEXT, 返却日 TEXT);');
      for(const book of books)db.prepare('INSERT INTO 書籍表 VALUES (?,?)').run(...book);
      for(const loan of loans)db.prepare('INSERT INTO 貸出表 VALUES (?,?,?,?,?,?)').run(...loan);
      function actual(sql:string){
        const statement=db.prepare(sql.replaceAll('CURRENT_DATE',"'"+current+"'").replace(/DATE '(\d{4}-\d{2}-\d{2})'/g,"'$1'"));
        (statement as typeof statement&{setReturnArrays(value:boolean):void}).setReturnArrays(true);
        return statement.all() as unknown as unknown[][];
      }
      verify(a,a.options.map(choice=>JSON.stringify(actual(condition.text.replace('［a］',choice)))===JSON.stringify(expectedLate)));
      verify(b,b.options.map(choice=>{
        const rows=actual(summary.text.replace('［b］',choice));
        return rows.every((row,j)=>j===0||Number(rows[j-1][2])>=Number(row[2]))&&
          JSON.stringify(unorderedRows(rows))===JSON.stringify(unorderedRows(expectedCounts));
      }));
    }finally{db.close();}
    const activity=visible.includes('ログイン情報から1人')?'employee':visible.includes('当日の返却は40件以下')?'returned':'book';
    const counts=match(visible,/書籍表(?:が|は)([\d,]+)件，貸出表(?:が|は)([\d,]+)件/).slice(1).map(v=>Number(v.replaceAll(',','')));
    const [bookCount,loanCount]=counts;
    assert(loanCount>bookCount*10);
    const candidateCost=(option:string)=>{
      if(option==='貸出表.社員番号'&&activity==='employee')return 30;
      if(option==='貸出表.返却日'&&activity==='returned')return 40;
      if(option==='貸出表.書籍番号'&&activity==='book')return bookCount+loans.filter(l=>l[1]===21).length;
      if(option==='書籍表.書籍名'&&activity==='book')return 1+loanCount;
      return activity==='book'?bookCount+loanCount:loanCount;
    };
    const costs=index.options.map(candidateCost);
    verify(index,costs.map(cost=>cost===Math.min(...costs)));
  }
});
