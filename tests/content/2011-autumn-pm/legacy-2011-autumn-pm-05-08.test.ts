import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { answerCanVary, answerSignature } from '../../../src/core/generation';
import { additionalContracts, additionalDefinitions, additionalVersion, definitionForVersion, registerAdditionalDefinitions } from '../../../src/core/generators/index';
import type { Block, Question } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2011AutumnPm05To08Definitions as definitions } from '../../../src/core/generators/legacy-2011-autumn-pm-05-08';
import { legacy2011AutumnPm0508Figures as figures } from '../../../src/core/generators/legacy-2011-autumn-pm-05-08-figures';
import { legacy2011AutumnPm0508FigureRenderers as renderers } from '../../../src/ui/Legacy2011AutumnPm0508Figures';
import { fixture } from '../../fixtures';

const paperKeys=['アカオキエアイ','イイオカウエオウ','アオウイコエキウ','イウアイエウイ'];
const bankSizes=[[6,6,6,7,5,4,5],[5,6,6,6,4,5,5,4],[6,6,6,6,10,10,10,10],[4,4,4,4,4,4,4]];
const cases=(major:number)=>[0,1,2,3].map(i=>definitions[major-5].build([i]));
const blocks=(body:GeneratedBody) => body.prompt.filter(block=>block.type==='diagram');
function diagram(body:GeneratedBody,id:string) {
  const block=blocks(body).find(block=>block.id==='diagram-legacy-2011-autumn-pm-'+id);
  assert(block, id);
  return block;
}
const textOf=(block:Block) => 'text' in block ? block.text : block.type==='table' ? block.rows[0].join('｜') : '';
const stem=(body:GeneratedBody) => body.prompt.filter(block=>block.type==='paragraph').map(textOf).join('\n');
function part(body:GeneratedBody,index:number) {
  const p=body.answerParts![index], a=body.partAnswers![index];
  assert.equal(a.kind,'choice');
  assert.equal(a.partId,p.id);
  const options=p.choiceIds.map(id=>textOf(body.choices[Number(id.slice('choice-value-'.length))-1][0]));
  assert.equal(new Set(options).size,options.length);
  return {options,index:p.choiceIds.indexOf(a.choiceId)};
}
function check(body:GeneratedBody,index:number,predicate:(s:string,i:number)=>boolean) {
  const p=part(body,index);
  assert.deepEqual(p.options.flatMap((option,i)=>predicate(option,i)?[i]:[]),[p.index],p.options.join('／'));
}
const expect=(body:GeneratedBody,index:number,text:string|number)=>check(body,index,option=>option===String(text));

test('4大問・30公式解答欄、全バンクと配布Block Schemaを照合する',()=>{
  const folder='docs/public/schemas', ajv=new Ajv2020({strict:false,allErrors:true});
  addFormats(ajv);
  for(const file of fs.readdirSync(folder).filter(file=>file.endsWith('.schema.json')))
    ajv.addSchema(JSON.parse(fs.readFileSync(folder+'/'+file,'utf8')));
  const validate=ajv.getSchema('https://opencbt-fe-kihonjoho.example/schemas/3.0.0/common.schema.json#/$defs/block');
  assert(validate);
  for(const [i,definition] of definitions.entries()){
    assert.equal(definition.source,'2011h23a-fe-pm-'+(5+i));
    assert.equal(definition.sourceAnswer,[...paperKeys[i]].join('／'));
    assert.deepEqual(definition.reference,[0]);
    const all=cases(5+i);
    assert.equal(new Set(all.map(body=>JSON.stringify(body.prompt))).size,4);
    for(const [j,body] of all.entries()){
      assert.deepEqual(body,definition.build([j]));
      assert.deepEqual(body.answerParts!.map(p=>p.choiceIds.length),bankSizes[i]);
      assert.equal(body.partAnswers!.length,paperKeys[i].length);
      assert(body.explanation.length>100);
      if(!j) assert.equal(body.answerParts!.map((_,k)=>'アイウエオカキクケコ'[part(body,k).index]).join(''),paperKeys[i]);
      for(const block of [...body.prompt,...body.choices.flat(),...(body.contexts??[]).flatMap(context=>context.blocks)])
        assert(validate(block),definition.source+' '+JSON.stringify(validate.errors));
      if(i===3) assert.deepEqual(body.contexts?.[0].blocks.map(block=>block.type==='image'?block.assetId:''),[
        'asset-ipa-2011h23a-fe-pm-p003','asset-ipa-2011h23a-fe-pm-p004',
      ]);
    }
    for(const invalid of [[],[0,0],[-1],[4],[0.5],[NaN]]) assert.throws(()=>definition.build(invalid),/PARAMETER_CONSTRAINT/);
  }
});

test('各系列の実正答内容の差が通常アプリの生成器の可変判定と一致する',()=>{
  const definitionsCount=additionalDefinitions.length, contractsCount=additionalContracts.length;
  const distribution=fixture(), carrier=distribution.questions[0], template=distribution.templates[0];
  try{
    registerAdditionalDefinitions(definitions.filter(d=>!additionalDefinitions.some(row=>row.source===d.source)));
    for(const [i,d] of definitions.entries()){
      const id='generator-source-'+d.source, version=additionalVersion(d);
      assert.equal(definitionForVersion(id,version)?.source,d.source);
      const signatures=new Set(cases(5+i).map(body=>{
        const question:Question={...carrier, answerParts:body.answerParts,
          choices:body.choices.map((blocks,index)=>({id:'choice-value-'+(index+1),content:{attribution:carrier.prompt.attribution,blocks}})),
          correctAnswer:{parts:body.partAnswers,attribution:carrier.correctAnswer.attribution},
        };
        return answerSignature(question);
      }));
      assert(signatures.size>=2,d.source);
      assert.equal(answerCanVary({...template,generatorRef:{id,version}}),signatures.size>1);
    }
  }finally{
    additionalDefinitions.splice(definitionsCount);
    additionalContracts.splice(contractsCount);
  }
});

test('問5の全候補と伝票計算を業務規則・オブジェクトの役割から照合する',()=>{
  for(const [i,body] of cases(5).entries()){
    const slip=diagram(body,'5-slip').alt, objects=diagram(body,'5-objects').alt;
    const terms=stem(body);
    const whole=terms.match(/ちょうど2種類|2種類以上/)?.[0];
    assert(whole);
    const rate=Number(terms.match(/合計から(\d+)％/)?.[1]);
    const maximum=Number(terms.match(/(\d+)種類を超える/)?.[1]);
    const nums=(line:string)=>line.replaceAll(',','').split('｜');
    const rows=slip.split('\n').filter(line=>/^[123]｜/.test(line)).map(nums);
    assert.equal(rows.length,3);
    const prices=[...objects.matchAll(/単価＝([\d,]+)/g)].map(m=>Number(m[1].replaceAll(',','')));
    assert.equal(prices.length,5);
    assert.equal(prices[2]*100,(prices[3]+prices[4])*(100-rate));
    assert.deepEqual(rows.map(r=>Number(r[3])),prices.slice(0,3));
    let total=0;
    for(const row of rows){
      const [,number,,price,qty,sub]=row;
      assert.match(objects,new RegExp('番号＝'+number));
      assert.equal(Number(price)*Number(qty),Number(sub));
      total+=Number(sub);
    }
    assert.equal(Number(slip.match(/合計 ([\d,]+)/)?.[1].replaceAll(',','')),total);
    if(i===0) assert.equal(total,12440);
    const analysis=diagram(body,'5-analysis').alt, design=diagram(body,'5-design').alt;
    assert(analysis.includes('（1..'+maximum+'）受注明細'));
    assert.match(analysis,/［b］と［c］から［a］への汎化。［b］（［d］）—（0\.\.\*，◇）［c］/);
    assert.match(design,/－［f］，＋［g］/);
    assert.match(design,/派生要素/);
    for(const [k,label] of ['商品','単独商品','セット商品',whole.startsWith('ちょうど')?'2':'2..*',
      '番号：数値','／小計：数値','小計取得()：数値'].entries()) expect(body,k,label);
  }
});

function staffMonths(efforts:number[],dev:number,offset:number) {
  const lengths=[3,3,dev,2,3];
  return Object.fromEntries(lengths.flatMap((length,stage)=>{
    const begin=offset+lengths.slice(0,stage).reduce((a,b)=>a+b,0);
    const demand=Number((BigInt(efforts[stage])+BigInt(length)-1n)/BigInt(length));
    return Array.from({length},(_,month)=>[month+begin,{stage,demand}]);
  }));
}
const monthText=(m:number)=>'平成'+(24+Math.floor(m/12))+'年'+(1+m%12)+'月';
test('問6の全候補を月別の工数・要員と工程内の移動制約で検算する',()=>{
  for(const [i,body] of cases(6).entries()){
    const terms=stem(body), size=Number(terms.match(/ともに(\d+)k/)?.[1]), staff=Number(terms.match(/通して(\d+)名/)?.[1]);
    const rows=diagram(body,'6-efforts').alt.split('\n').map(line=>line.split('｜'));
    const efficiencies=rows[1].slice(1).map(s=>Number(s.replace('.','')));
    const efforts=efficiencies.map(p=>{
      assert.equal((size*10)%p,0);
      return size*10/p;
    });
    assert.deepEqual(rows[2].slice(1),efforts.map((n,k)=>k===3?'［a］':String(n)));
    expect(body,0,efforts[3]);
    expect(body,1,staffMonths(efforts,5,0)[0].demand-staff);
    const roster=(one:number,two:number)=>{
      const a=staffMonths(efforts,one,0), b=staffMonths(efforts,two,6);
      return Array.from({length:Math.max(...Object.keys(b).map(Number))+1},(_,m)=>[a[m],b[m]]);
    };
    const noWork=(one:number,two:number)=>roster(one,two).flatMap((items,month)=>
      items.reduce((n,x)=>n+(x&&x.stage!==2?x.demand:0),0)<staff?[month]:[]);
    assert.equal(noWork(3,3).length,1);
    assert.equal(noWork(4,4).length,1);
    expect(body,2,monthText(noWork(3,3)[0]));
    expect(body,3,monthText(noWork(4,4)[0]));
    check(body,4,s=>{
      const [,a,b]=/第一期を(\d)に第二期を(\d)/.exec(s)!;
      return noWork(Number(a),Number(b)).length===0;
    });
    const months=roster(5,4);
    assert.equal(noWork(5,4).length,0);
    const schedule=diagram(body,'6-schedule').alt.split('\n').map(line=>line.split('｜'));
    assert.deepEqual(schedule[1].slice(1),months.map((_,m)=>String(1+m%12)));
    assert.deepEqual(schedule[4].slice(1).map((value,m)=>value===''?undefined:Number(value)),months.map(([a,b])=>!a?undefined:a.stage===2||b&&b.stage!==2?0:staff));
    assert.deepEqual(schedule[5].slice(1).map(value=>value===''?undefined:Number(value)),months.map(([,b])=>!b?undefined:b.stage===2?0:staff));
    const totals=months.map(([a,b])=>(a?.demand??0)+(b?.demand??0));
    const peak=Math.max(...totals), at=totals.indexOf(peak);
    assert.equal(totals.filter(n=>n===peak).length,1);
    if(i===0) assert.deepEqual([at,peak,totals[at-1],totals[at+1]],[12,70,57,56]);
    expect(body,5,monthText(at)); expect(body,6,peak);
    const [prev,curr,next]=totals.slice(at-1,at+2);
    const mean=(prev+curr+next)/3;
    assert(Number.isInteger(mean)&&mean>prev&&mean>next);
    const required=[mean-prev,mean-next];
    const p=months[at], before=months[at-1], after=months[at+1];
    check(body,7,(_choice,k)=>{
      const moves=[[-1,-1],[1,1],[-1,1],[1,-1]][k];
      return moves.includes(-1)&&moves.includes(1)&&moves.every((direction,t)=>{
        const target=direction===-1?before:after;
        return p[t].stage===target[t].stage&&p[t].demand>=required[direction===-1?0:1];
      });
    });
  }
});

function readCoordinates(alt:string) {
  return alt.split('\n\n').map(panel=>panel.split('\n').slice(1).map(line=>{
    const m=/^(?:(.*?)：)?(-?[\d.]+)，(-?[\d.]+)。バブルの大きさ ([\d.]+)％。$/.exec(line);
    assert(m,line);
    return {name:m[1],x:Number(m[2]),y:Number(m[3]),size:Number(m[4])};
  }));
}
test('問7の全候補を表の比率・バブルの位置と面積・指標の増減から検算する',()=>{
  const metrics=['売上金額','売上数量','売上単価','市場規模','市場占有率','当年構成比'];
  for(const [i,body] of cases(7).entries()){
    const rows=diagram(body,'7-data').alt.split('\n').map(line=>line.replaceAll(',','').split('｜'));
    const names=rows[0].slice(2);
    const period=(p:number)=>names.map((_,k)=>metrics.slice(0,5).map((m,j)=>Number(rows[1+j*2+p][k+2])));
    const before=period(0), after=period(1);
    const shares=(entries:number[][])=>entries.map(a=>a[0]*100/entries.reduce((n,v)=>n+v[0],0));
    const current=readCoordinates(diagram(body,'7-current').alt), previous=readCoordinates(diagram(body,'7-prior').alt);
    for(const [j,[x,y]] of [[1,2],[3,4]].entries()){
      const table=after.map((a,k)=>({x:a[x],y:a[y],size:shares(after)[k]}));
      assert.equal(current[j].length,6);
      for(const point of current[j]) assert(table.some(row=>row.x===point.x&&row.y===point.y&&Math.abs(row.size-point.size)<.051));
    }
    const findCurrentPoint=(label:string)=>{
      const [p,q]=current.map(chart=>chart.find(point=>point.name===label));
      assert(p&&q);
      const row=after.findIndex(item=>item[1]===p.x&&item[2]===p.y&&item[3]===q.x&&item[4]===q.y);
      assert(row>=0);
      return row;
    };
    const a=findCurrentPoint('［a］'), d=findCurrentPoint('［d］');
    expect(body,0,names[a]); expect(body,3,names[d]);
    check(body,1,choice=>{
      const col=metrics.indexOf(choice);
      const values=col===5?shares(after):after.map(row=>row[col]);
      return values[a]===Math.min(...values)&&values.filter(n=>n===values[a]).length===1;
    });
    check(body,2,choice=>{
      const col=metrics.indexOf(choice);
      const values=col===5?shares(after):after.map(row=>row[col]);
      return values[a]===Math.max(...values)&&values[d]===Math.min(...values);
    });
    const changes=after.map((row,k)=>row.map((value,j)=>100*(value-before[k][j])/before[k][j]));
    for(const [k,chart] of previous.entries()){
      assert.equal(chart.length,6);
      check(body,4+k,choice=>{
        const [x,y]=choice.split('｜').map(s=>metrics.indexOf(s.split('前年比')[0]));
        return chart.every(point=>{
          const index=names.indexOf(point.name);
          return index>=0&&Math.abs(point.x-changes[index][x])<.051&&Math.abs(point.y-changes[index][y])<.051;
        });
      });
      for(const point of chart) assert(Math.abs(point.size-shares(before)[names.indexOf(point.name)])<.051);
    }
    check(body,6,choice=>{
      const [one,two]=choice.split('｜').map(name=>changes[names.indexOf(name)]);
      return Math.abs(one[3]-20)<2&&Math.abs(one[4]+25)<2&&two[1]>=25&&two[2]<0;
    });
    const order=before.map((a,k)=>[a[0],k]).sort((a,b)=>b[0]-a[0]);
    check(body,7,choice=>choice.split('｜').every((clause,j)=>{
      const [a,b]=clause.split('などが')[0].split('，').map(name=>metrics.indexOf(name));
      const sign=clause.endsWith('増加')?1:-1;
      const row=changes[order[j][1]];
      return sign*row[a]>0&&sign*row[b]>0;
    }));
    if(i===0) assert.deepEqual([part(body,4).index,part(body,5).index,part(body,6).index],[9,3,6]);
  }
});

function grammarError(statement:string) {
  if(/[^A-Za-z0-9=+*/-]/.test(statement)) return -1;
  const [lhs,rhs]=statement.split('=');
  if(!/^[A-Za-z][A-Za-z0-9]*$/.test(lhs)) return 24;
  if(rhs.split(/[+*/-]/).some(term=>/^\d+[A-Za-z]/.test(term))) return 51;
  if(/[+*/-]{2}/.test(rhs)) return 64;
  if(/[+*/-]$/.test(rhs)) return 65;
  return 0;
}
function precedenceTransform(statement:string) {
  const [name,rhs]=statement.split('=');
  const terms=rhs.match(/[A-Za-z][A-Za-z0-9]*|\d+|[+*/-]/g)!;
  let first=0;
  const output:string[]=[];
  for(const band of ['*/','+-']){
    let k=terms.findIndex(token=>token.length===1&&band.includes(token));
    while(k>=0){
      if(!output.length) first=name.length+2+terms.slice(0,k).join('').length;
      const work='wk#'+(output.length+1);
      const captured=terms.splice(k-1,3,work);
      output.push(work+'='+captured.join(''));
      k=terms.findIndex(token=>token.length===1&&band.includes(token));
    }
  }
  return {first,output:[...output,name+'='+terms[0]]};
}
const testsForSearch=['X=A','X=B+C','X=A+B-C','X=A+B*C/D','Long1=B+C/D*E','X=9/2','X=01'];
function firstOperation(s:string,backward:boolean,k:number) {
  const compare=[(p:number,v:number)=>p<v,(p:number,v:number)=>p<=v,(p:number,v:number)=>p>=v,(p:number,v:number)=>p>v][k];
  const v=['«',...s,'»'].map(c=>c==='«'?0:c==='»'?1:/^[A-Za-z]$/.test(c)?2:/^\d$/.test(c)?3:c==='='?10:'+-'.includes(c)?11:12);
  let p=backward?11:10, next=0;
  for(let j=backward?v.length-2:1;v[j]!==Number(!backward);j+=backward?-1:1)
    if(compare(p,v[j])) {next=j;p=v[j];}
  return next;
}
function moveCopy(cells:string[],from:number,to:number,move:number,choice:number) {
  const output=[...cells];
  const order=[
    () => Array.from({length:to-from},(_,k)=>from+k),
    () => Array.from({length:to-from+1},(_,k)=>from+k),
    () => Array.from({length:to-from+1},(_,k)=>to-k),
    () => Array.from({length:to-from},(_,k)=>to-k),
  ][choice]();
  for(const j of order) output[j+move]=output[j];
  return output;
}
test('問8の全候補を字句解析・演算子の優先順位・非破壊コピーと照合する',()=>{
  for(const [i,body] of cases(8).entries()){
    const sample=diagram(body,'8-example').alt.split('\n'), statement=sample[1];
    const expected=precedenceTransform(statement);
    assert.deepEqual(sample.slice(3),expected.output);
    assert.match(diagram(body,'8-next').alt,new RegExp('next ← '+expected.first+'」$'));
    assert.match(diagram(body,'8-replace').alt,/①.*抜出し。②.*置換。/);
    const invalid=diagram(body,'8-invalid').alt.split('\n').map(line=>line.split('　')[1]);
    const errors=invalid.map(grammarError);
    assert.deepEqual([...errors].sort((a,b)=>a-b),[24,51,64,65]);
    if(i===0) assert.deepEqual(errors,[65,51,64,24]);
    check(body,0,(_,j)=>errors[j]===51);
    check(body,1,(_,j)=>errors[j]===64);
    const examples=[...testsForSearch,statement];
    check(body,2,(_,j)=>examples.every(s=>firstOperation(s,false,j)===precedenceTransform(s).first));
    check(body,3,(_,j)=>examples.every(s=>firstOperation(s,true,j)===precedenceTransform(s).first));
    check(body,4,(_,j)=>examples.every(s=>{
      const candidate=[1,2,s.indexOf('='),s.indexOf('=')+3][j];
      const start=s.indexOf('=')+3;
      return candidate===start;
    }));
    const moveAlt=diagram(body,'8-shift').alt.split('\n');
    const before=moveAlt[0].split('　')[1].split('｜');
    const after=moveAlt[2].split('　')[1].split('｜');
    const from=Number(moveAlt[1].match(/番号(\d+)/)?.[1]), to=before.length-1;
    assert.deepEqual(after,[...before.slice(0,from-3),...before.slice(from)]);
    check(body,5,(_,j)=>moveCopy(before,from,to,3,j).slice(from+3).join('')===before.slice(from).join(''));
    check(body,6,(_,j)=>moveCopy(before,from,to,-3,j).slice(from-3,to-2).join('')===before.slice(from).join(''));
  }
});

test('図の登録・全入力のalt・描画が一対一であり，空欄やマスクを保存する',()=>{
  assert.equal(figures.length,23);
  assert.deepEqual(figures.map(f=>f.profile),renderers.map(r=>r.profile));
  for(const major of [5,6,7,8]) for(const body of cases(major)) for(const block of blocks(body)){
    assert.equal(block.scene.kind,'source_figure');
    const scene=block.scene, i=figures.findIndex(f=>f.profile===scene.profile);
    assert(i>=0);
    const figure=figures[i], renderer=renderers[i];
    figure.validate(scene.values);
    assert.equal(figure.alt(scene.values),block.alt);
    const html=renderToStaticMarkup(createElement(renderer.component,{caption:block.caption,values:scene.values}));
    assert.match(html,/tabindex="0"/i);
    assert.match(html,/aria-description=/);
    for(const label of block.alt.matchAll(/［([a-h])］/g)) assert(html.includes('data-source-blank="'+label[1]+'"'),block.id);
    if(scene.profile.endsWith('7-current')||scene.profile.endsWith('7-prior')) assert.equal([...html.matchAll(/<circle/g)].length,12);
    if(scene.profile.endsWith('7-prior-axes')) assert.equal([...html.matchAll(/colSpan="2"/g)].length,2);
  }
});
