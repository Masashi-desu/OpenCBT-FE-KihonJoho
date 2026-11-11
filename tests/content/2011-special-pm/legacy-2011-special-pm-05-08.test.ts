import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2011SpecialPm05To08Definitions as definitions } from '../../../src/core/generators/legacy-2011-special-pm-05-08';
import { legacy2011SpecialPm0508Figures as figures } from '../../../src/core/generators/legacy-2011-special-pm-05-08-figures';
import { legacy2011SpecialPm0508FigureRenderers as renderers } from '../../../src/ui/Legacy2011SpecialPm0508Figures';

const officialKeys = ['ウカオウウ','ウウアイウイイイ','イエカキエアウ','アエエアイアイ'];
const labels = 'アイウエオカキクケコ';
const partIds = ['ab2cd','abcdefgh','abcdefg','abcdefg'];
const inputs = [0,1,2,3];
const cases = (major:number) => inputs.map(index=>definitions[major-5].build([index]));
const number = (text:string) => Number(text.replaceAll(',',''));
const text = (block:Block) => {
  assert.ok(block.type==='paragraph'||block.type==='diagram');
  return block.type==='paragraph'?block.text:block.alt;
};
const paragraphs = (body:GeneratedBody) => body.prompt.flatMap(block=>block.type==='paragraph'?[block.text]:[]).join('\n');
const tables = (body:GeneratedBody) => body.prompt.filter(block=>block.type==='table');
const answer = (body:GeneratedBody,id:string) => {
  const part=body.answerParts?.find(part=>part.id==='part-'+id);
  const selected=body.partAnswers?.find(part=>part.kind==='choice'&&part.partId==='part-'+id);
  assert.ok(part&&selected?.kind==='choice');
  const options=part.choiceIds.map(key=>{
    const choice=body.choices[Number(key.split('-').at(-1))-1];
    assert.equal(choice.length,1);
    return text(choice[0]);
  });
  return { options,selected:part.choiceIds.indexOf(selected.choiceId) };
};
function verify(body:GeneratedBody,id:string,rule:(option:string,index:number)=>boolean) {
  const {options,selected}=answer(body,id);
  assert.deepEqual(options.flatMap((option,i)=>rule(option,i)?[i]:[]),[selected],'欄 '+id+' '+JSON.stringify(options));
}
const value = (body:GeneratedBody,id:string,expected:number) =>
  verify(body,id,option=>number(option)===expected);

test('4大問27欄の公式正答・解答群・全有限入力・Schema・決定性を検証',()=>{
  const dir='docs/public/schemas', ajv=new Ajv2020({strict:false,allErrors:true});
  addFormats(ajv);
  for(const file of readdirSync(dir).filter(file=>file.endsWith('.schema.json')))
    ajv.addSchema(JSON.parse(readFileSync(dir+'/'+file,'utf8')));
  const validate=ajv.getSchema('https://opencbt-fe-kihonjoho.example/schemas/3.0.0/common.schema.json#/$defs/block');
  assert(validate);
  const seen = new Set<string>();
  for(const [i,d] of definitions.entries()){
    assert.equal(d.source,'2011h23tokubetsu-fe-pm-'+(i+5));
    assert.deepEqual(d.reference,[0]);
    assert.equal(d.sourceAnswer,[...officialKeys[i]].join('／'));
    for (const index of inputs) {
      const body=d.build([index]), semantic=JSON.stringify(body.prompt);
      assert.ok(!seen.has(semantic));
      seen.add(semantic);
      assert.deepEqual(body,d.build([index]));
      assert.equal(body.answerParts?.map(part=>part.id.slice(5)).join(''),partIds[i]);
      assert.equal(body.partAnswers?.length,partIds[i].length);
      for (const id of partIds[i]) {
        const {options,selected}=answer(body,id);
        assert.equal(new Set(options).size,options.length);
        assert.ok(selected>=0&&selected<options.length);
      }
      if(index===0) assert.equal([...partIds[i]].map(id=>labels[answer(body,id).selected]).join(''),officialKeys[i]);
      for(const block of [...body.prompt,...body.choices.flat(),...body.contexts?.flatMap(context=>context.blocks)??[]])
        assert.ok(validate(block),JSON.stringify(validate.errors));
    }
    for(const bad of [[],[-1],[4],[0.5],[NaN],[1,2],Array(1)]) assert.throws(()=>d.build(bad),/PARAMETER_CONSTRAINT/);
  }
});

test('問5 顧客別の範囲、二つの判定、蓄積式を全選択肢で独立検算',()=>{
  const expectedTotals=[[3,5],[6,6],[2,5],[4,5]];
  for(const [i,body] of cases(5).entries()){
    const prompt=paragraphs(body);
    const dates=/2011年(\d)月(\d+)日から(\d)月(\d+)日まで/.exec(prompt);
    const limits=/商品コード(A\d+)～(A\d+).*購入金額の合計が([\d.]+)万円/s.exec(prompt);
    assert(dates&&limits);
    const start=100*Number(dates[1])+Number(dates[2]), end=100*Number(dates[3])+Number(dates[4]);
    const threshold=Math.round(Number(limits[3])*10000);
    const data=tables(body).find(table=>table.caption.startsWith('表2'));
    assert(data);
    assert.deepEqual(data.columns,['購入日付 年','購入日付 月','購入日付 日','顧客番号','商品コード','購入個数','購入金額（円）']);
    assert.equal(data.rows.length,15);
    const totals = new Map<string,{purchases:number;items:number}>();
    for(const [year,month,day,id,sku,quantity,amount] of data.rows){
      const date=100*Number(month)+Number(day);
      if(year!=='2011'||date<start||date>end)continue;
      const previous=totals.get(id)??{purchases:0,items:0};
      totals.set(id,{purchases:previous.purchases+Number(amount),
        items:previous.items+(sku>=limits[1]&&sku<=limits[2]?Number(quantity):0)});
    }
    const customers=[...totals.values()];
    const invite=customers.filter(item=>item.purchases>=threshold).length;
    const post=customers.filter(item=>item.items>0||item.purchases>=threshold).length;
    assert.deepEqual([invite,post],expectedTotals[i]);
    value(body,'c',invite);
    value(body,'d',post);

    const states = Array.from({length:64},(_,mask)=>Array.from({length:6},(_,bit)=>Boolean(mask & (1<<bit))));
    const atom = (line:string,state:boolean[]) => {
      if(line.startsWith(limits[1]+' ≦ ')){assert.ok(line.endsWith(' ≦ '+limits[2]));return state[0];}
      if(line==='購入金額合計 ≧ '+threshold)return state[1];
      if(line==='作業ファイルレコードの購入金額 ≧ '+threshold)return state[2];
      if(line==='作業ファイルレコードの購入個数 ＞ 0')return state[3];
      if(line==='応募券枚数 ＞ 0')return state[4];
      if(line==='招待券枚数 ＞ 0')return state[5];
      throw Error(line);
    };
    const predicate=(option:string,state:boolean[])=>option.split('又は').some(disjunction=>
      disjunction.split('かつ').every(term=>atom(term.trim(),state)));
    verify(body,'a',option=>states.filter(state=>!state[5]).every(state=>predicate(option,state)===state[1]));
    verify(body,'b',option=>states.filter(state=>state[1]===state[5]).every(state=>predicate(option,state)===(state[4]||state[5])));
    const purchase='作業ファイルレコードの購入金額', quantity='作業ファイルレコードの購入個数';
    verify(body,'2',option=>[0,1,4,8].every(previous=>[1,2,5].every(q=>[threshold-1,threshold,2*threshold+1].every(price=>{
      const actual=option.split('＋').reduce((sum,term)=>{
        if(term==='応募券枚数')return sum+previous;
        if(term===quantity)return sum+q;
        if(term==='1')return sum+1;
        assert.equal(term,'['+purchase+'／'+threshold+']');
        return sum+Math.floor(price/threshold);
      },0);
      return actual===previous+q;
    }))));
  }
});

test('問6 表の完了数・標準／実績工数から独立にEVMの8欄を検算',()=>{
  const reference = [1200,1600,0,-60,125,1.02,795,5480];
  for(const [i,body] of cases(6).entries()){
    const [plan,actual,feb,march]=tables(body);
    assert.deepEqual(march.columns,['','PV','AC','EV']);
    const perStage = plan.rows.slice(0,4).map(row=>({
      name:row[0], rate:number(row[1]),
      scheduled:row.slice(2).filter((_,index)=>index%2===0).map(number),
      budget:row.slice(2).filter((_,index)=>index%2===1).map(number),
    }));
    const completions = actual.rows.map(row=>row.slice(1).map(number));
    const cost = (counts:number[],rate:number) => counts.reduce((total,n)=>total+n*rate,0);
    const totals = perStage.map(stage=>stage.scheduled.reduce((a,b)=>a+b,0));
    assert.ok(totals.every(n=>n===totals[0]));
    for(const stage of perStage)assert.deepEqual(stage.budget,stage.scheduled.map(n=>n*stage.rate));
    const a=cost(completions[0].slice(0,2),perStage[0].rate);
    const b=perStage[1].budget.slice(0,3).reduce((a,b)=>a+b,0);
    const sv = march.rows.map((row,index)=>cost(completions[index],perStage[index].rate)-
      perStage[index].budget.slice(0,3).reduce((a,b)=>a+b,0));
    const ac = march.rows.map(row=>number(row[2]));
    const ev = completions.map((counts,index)=>cost(counts,perStage[index].rate));
    assert.deepEqual(march.rows.map(row=>number(row[3])),ev);
    assert.equal(feb.rows[0][3],'［a］');
    assert.equal(march.rows[1][1],'［b］');
    const cv=ev.map((value,index)=>value-ac[index]);
    const cumulativeAC=ac.reduce((a,b)=>a+b,0), cumulativeEV=ev.reduce((a,b)=>a+b,0);
    const cpi=Number((200n*BigInt(cumulativeEV)+BigInt(cumulativeAC))/(2n*BigInt(cumulativeAC)))/100;
    const actualApril=ac.slice(1).reduce((total,inc,index)=>{
      const completed=completions[index+1].reduce((a,b)=>a+b,0);
      assert.equal(inc%completed,0);
      return total+(totals[index+1]-completed)*(inc/completed);
    },0);
    const entire=cumulativeAC+actualApril+perStage[3].budget[3]+perStage[3].budget[4];
    if(i===0)assert.deepEqual([a,b,sv[2],cv[1],cv[2],cpi,actualApril,entire],reference);
    assert.ok(entire<=perStage.reduce((total,stage)=>total+stage.budget.reduce((a,b)=>a+b,0),0));
    value(body,'a',a);value(body,'b',b);value(body,'f',cpi);value(body,'g',actualApril);value(body,'h',entire);
    verify(body,'c',option=>{
      if(option.includes('ともに0'))return sv[0]===0&&sv[2]===0;
      if(option.includes('ともに正'))return sv[0]>0&&sv[2]>0;
      const signs=/外部設計はSVが([0負正]).*実装はSVが([0負正])/.exec(option);
      assert(signs);
      return [signs[1],signs[2]].every((sign,j)=>'負0正'[Math.sign(sv[j*2])+1]===sign);
    });
    verify(body,'d',option=>cv[perStage.findIndex(stage=>stage.name===option)]<0);
    verify(body,'e',option=>cv[perStage.findIndex(stage=>stage.name===option)]>0);
  }
});

test('問7 利用店舗を集合として利得を別計算し7欄を検算',()=>{
  const names=['駅ビル内店舗','駅前商店街店舗','郊外ショッピングモール内店舗'];
  const pairs=[[0,1],[2,0],[2,1],[0,0]];
  for(const [index,body] of cases(7).entries()){
    const table=tables(body).find(table=>table.caption.startsWith('表2'));
    const result=tables(body).find(table=>table.caption.startsWith('表4'));
    assert(table&&result);
    const groups=names.map((_,i)=>new Set(table.rows.flatMap((row,j)=>row[i+2]==='○'?[j]:[])));
    groups.push(new Set());
    const forecast=table.rows.map(row=>number(row[1].slice(0,-2))/100);
    const earned=(shop:number,rival:number)=>[...groups[shop]].reduce((total,segment)=>
      total+forecast[segment]/(groups[rival].has(segment)?2:1),0);
    const base=[0,2].map(a=>[0,1,3].map(b=>[earned(a,b),earned(b,a)]));
    if(index===0)assert.deepEqual(base,[[[15,15],[25,15],[30,0]],[[20,30],[15,15],[20,0]]]);
    assert.deepEqual(result.columns,['A社＼B社',names[0],names[1],'出店しない']);
    assert.deepEqual(result.rows.map(row=>row.slice(1)),[
      ['（'+base[0][0].join('，')+'）','（［c］，'+base[0][1][1]+'）','（［d］，0）'],
      ['（'+base[1][0].join('，')+'）','（［e］，'+base[1][1][1]+'）','（'+base[1][2].join('，')+'）'],
    ]);
    const storePair = (option:string) => {
      if(option.includes('ともに')){assert.ok(option.includes(names[0]));return [0,0];}
      const [a,b]=option.split('，');
      const choice=[a,b].map(text=>names.findIndex(name=>text.includes(name)));
      assert.ok(choice.every(n=>n>=0));
      return choice;
    };
    assert.deepEqual(answer(body,'a').options.map(storePair),pairs);
    verify(body,'a',option=>{
      const [a,b]=storePair(option);
      return [0,1].every(segment=>groups[b].has(segment)&&!groups[a].has(segment))&&
        [2,3].every(segment=>groups[a].has(segment)&&!groups[b].has(segment));
    });
    verify(body,'b',option=>{
      const [a,b]=storePair(option);
      return [0,1].every(segment=>groups[a].has(segment)&&groups[b].has(segment));
    });
    value(body,'c',base[0][1][0]);value(body,'d',base[0][2][0]);value(body,'e',base[1][1][0]);
    const availableB=[0,1,3];
    const dominant=availableB.filter(b=>[0,2].every(a=>availableB.every(other=>earned(b,a)>=earned(other,a))));
    assert.equal(dominant.length,1);
    const strategy=(option:string)=>names.findIndex(name=>option.startsWith(name));
    verify(body,'f',option=>{const s=strategy(option);return (s<0?3:s)===dominant[0];});
    verify(body,'g',option=>{
      const s=strategy(option);
      return [0,2].includes(s)&&[0,2].every(a=>earned(s,dominant[0])>=earned(a,dominant[0]));
    });
  }
});

const bits=(num:number,length:number)=>Array.from({length},(_,i)=>(num>>i)&1);
const parseBits=(value:string)=>value.split('，').map(Number);
const readable=(arr:number[])=>arr.join('，');

test('問8 ビットマスクの独立全列挙・4つの印字コード実行と7欄を照合',()=>{
  for(const [index,body] of cases(8).entries()){
    const prompt=paragraphs(body);
    const dimensions=/N＝(\d)，K＝(\d).*?計(\d+)通り/.exec(prompt), sample=/開始時点で，配列Sの要素番号1～\dの内容が([01，]+)であった/.exec(prompt);
    assert(dimensions&&sample);
    const n=Number(dimensions[1]), k=Number(dimensions[2]);
    const all=Array.from({length:1<<n},(_,mask)=>bits(mask,n)).filter(arr=>arr.reduce((a,b)=>a+b,0)===k);
    assert.equal(all.length,Number(dimensions[3]));
    const sequence=all.map(readable), sampleIndex=sequence.indexOf(sample[1]);
    assert(sampleIndex>=0&&sampleIndex<sequence.length-1);
    verify(body,'d',option=>option===sequence[sampleIndex+1]);
    verify(body,'g',option=>option===sequence.at(-1));
    const diagram=body.prompt.find(block=>block.type==='diagram'&&block.scene.kind==='source_figure'&&block.scene.profile.endsWith('-8-code'));
    assert(diagram?.type==='diagram');
    assert.match(diagram.alt,new RegExp('S\\['+n+'\\], K, N, R'));
    assert.match(diagram.alt,new RegExp('K ← '+k+'[\\s\\S]*N ← '+n));
    assert.match(diagram.alt,/Init\(S, L-1, C\)/);
    assert.match(diagram.alt,/R = 0\n  ・R ← Next\(S, N\)\n■  （ここまでα）/);
    const runDump = (source:string) => {
      const rows=source.split('\n').map(row=>row.trim());
      const first=rows.indexOf('■ R = 0'), last=rows.indexOf('■',first+1);
      assert.ok(first>=0&&last>first);
      let offset=-1, running=false;
      const log:string[]=[];
      const execute=(lines:string[])=>{
        for(const line of lines) {
          if(line==='・R ← Init(S, N, K)'){offset=0;running=true;}
          else if(line==='・R ← Next(S, N)'){if(offset+1<sequence.length)offset++;else running=false;}
          else if(line==='・Dump(S, N)')log.push(sequence[offset]);
          else assert.fail(line);
        }
      };
      execute(rows.slice(0,first));
      for(let iteration=0;running&&iteration<=sequence.length;iteration++)execute(rows.slice(first+1,last));
      assert.equal(running,false);
      execute(rows.slice(last+1));
      return log;
    };
    verify(body,'a',option=>JSON.stringify(runDump(option))===JSON.stringify(sequence));
    const validStarts:number[]=[], prefixOnes:number[]=[];
    for(const [j,state] of all.slice(0,-1).entries()){
      const successor=all[j+1];
      const pivot=state.findIndex((bit,p)=>bit===1&&state[p+1]===0);
      assert.ok(pivot>=0);
      assert.deepEqual(successor.slice(pivot),[0,1,...state.slice(pivot+2)]);
      const count=state.slice(0,pivot).filter(Boolean).length;
      assert.deepEqual(successor.slice(0,pivot),bits((1<<count)-1,pivot));
      validStarts.push(pivot);
      prefixOnes.push(count);
    }
    verify(body,'b',option=>{
      const m=/^([01])，([01])で(最初|最後)$/.exec(option);assert(m);
      return all.slice(0,-1).every((state,j)=>{
        const positions=state.flatMap((bit,p)=>bit===Number(m[1])&&state[p+1]===Number(m[2])?[p]:[]);
        return (m[3]==='最初'?positions[0]:positions.at(-1))===validStarts[j];
      });
    });
    verify(body,'c',option=>validStarts.every(pivot=>{
      const affected=Array.from({length:n},(_,p)=>p).filter(p=>{
        if(option==='及びその後')return p>=pivot;
        if(option==='及びその前')return p<=pivot+1;
        if(option==='より後')return p>pivot+1;
        assert.equal(option,'より前');return p<pivot;
      });
      return affected.length===pivot&&affected.every((p,j)=>p===j);
    }));
    const range=(list:number[])=>Math.min(...list)+'～'+Math.max(...list);
    verify(body,'e',option=>option===range(validStarts));
    verify(body,'f',option=>option===range(prefixOnes));
    assert.equal(parseBits(sequence.at(-1)!).length,n);
    assert.equal(body.contexts?.[0].blocks.length,2);
    assert.ok(body.contexts?.[0].blocks.every((block,i)=>block.type==='image'&&block.assetId.endsWith('00'+(i+3))));
    if(index===0)assert.deepEqual([sequence.length,range(validStarts),range(prefixOnes),sequence.at(-1)],[10,'0～3','0～2','0，0，1，1，1']);
  }
});

test('図全11種・全条件のSSR，α・4本の分岐と3本の繰返しを検査',()=>{
  assert.deepEqual(figures.map(figure=>figure.profile),renderers.map(renderer=>renderer.profile));
  assert.equal(figures.length,11);
  for(const [i,figure] of figures.entries()){
    assert.throws(()=>figure.validate([-1]),{code:'FIGURE_PROFILE'});
    assert.throws(()=>figure.validate([4]),{code:'FIGURE_PROFILE'});
    for(const index of inputs){
      const html=renderToStaticMarkup(createElement(renderers[i].component,{values:[index],caption:'図'}));
      assert.match(html,/role="group".*aria-description=/s);
      assert.match(html,/class="diagram-scroll" tabindex="0"/);
      if(figure.profile.endsWith('-8-code')){
        assert.equal((html.match(/data-alpha=/g)??[]).length,1);
        assert.equal((html.match(/data-control="branch"/g)??[]).length,4);
        assert.equal((html.match(/data-control="loop"/g)??[]).length,3);
        assert.match(html,/data-start="7" data-end="14"/);
      }
    }
  }
});
