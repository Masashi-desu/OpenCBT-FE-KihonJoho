import assert from 'node:assert/strict';
import { readFileSync,readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2010SpringAm27To53Definitions as definitions } from '../../../src/core/generators/legacy-2010-spring-am-27-53';
import { legacy2010SpringAm2753Figures as figures,drawingCaption,drawingIds } from '../../../src/core/generators/legacy-2010-spring-am-27-53-figures';
import { legacy2010SpringAm2753FigureRenderers as renderers } from '../../../src/ui/Legacy2010SpringAm2753Figures';
import source from '../../../src/core/generators/legacy-2010-spring-am-27-53-source.json';
import { facts } from '../../fixtures/legacy-2010-spring-am-27-53-facts';
Object.assign(globalThis,{React});

const paperKeys='エイイウエウイエアエウエアウアイイアエウイエエエイアア';
const numbers=Array.from({length:27},(_,i)=>i+27);
const definition=(n:number)=>definitions[n-27];
const cases=(n:number)=>Array.from({length:definition(n).fields[0].maximum+1},(_,i)=>definition(n).build([i]));
const prompt=(body:GeneratedBody)=>body.prompt.filter(block=>block.type==='paragraph').map(block=>block.text).join('\n');
const diagrams=(body:GeneratedBody)=>body.prompt.filter(block=>block.type==='diagram').map(block=>block.alt);
function text(block:Block){
  if(block.type==='diagram')return block.alt;
  if(block.type==='formula')return block.alt;
  assert.ok(block.type==='paragraph'||block.type==='code');
  return block.text;
}
function options(body:GeneratedBody){
  return body.choices.map(choice=>{assert.equal(choice.length,1);return text(choice[0]);});
}
function compare(body:GeneratedBody,truth:readonly boolean[]){
  assert.equal(truth.length,4);
  assert.deepEqual(truth.flatMap((ok,i)=>ok?[i]:[]),[body.correctIndex],prompt(body));
}
const same=(left:unknown,right:unknown)=>JSON.stringify(left)===JSON.stringify(right);
const sorted=(values:readonly string[])=>[...values].sort();
const marks='アイウエ';

test('公式27問と全有限入力で正答・選択肢の原形式・公開Schema・決定性を確認する',()=>{
  const folder='docs/public/schemas', ajv=new Ajv2020({strict:false,allErrors:true});
  addFormats(ajv);
  for(const file of readdirSync(folder).filter(file=>file.endsWith('.schema.json')))
    ajv.addSchema(JSON.parse(readFileSync(folder+'/'+file,'utf8')));
  const validate=ajv.getSchema('https://opencbt-fe-kihonjoho.example/schemas/3.0.0/common.schema.json#/$defs/block');
  assert.ok(validate);
  assert.equal(paperKeys.length,27);
  assert.deepEqual(definitions.map(q=>Number(q.source.split('-').at(-1))),numbers);
  for(const [i,n] of numbers.entries()){
    const d=definition(n), all=cases(n), raw=source[String(n) as keyof typeof source];
    assert.equal(d.source,'2010h22h-fe-am-'+n);
    assert.equal(d.sourceAnswer,paperKeys[i]);assert.equal(raw.key,paperKeys[i]);
    assert.equal(marks[all[0].correctIndex!],paperKeys[i]);
    assert.equal(prompt(all[0]).split('\n')[0],raw.prompt);
    assert.deepEqual(options(all[0]).map(option=>n===30?option.split('\n').map(line=>line.split('。')[0]).join('\n'):option),raw.choices);
    assert.deepEqual(d.reference,[0]);
    assert.equal(new Set(all.map(q=>JSON.stringify(q.prompt))).size,all.length,String(n));
    assert.ok(new Set(all.map(q=>options(q)[q.correctIndex!])).size>1,String(n));
    for(const [j,q] of all.entries()){
      assert.equal(q.choices.length,4);assert.equal(new Set(options(q)).size,4);
      assert.ok(q.explanation.length>35);
      assert.deepEqual(q,d.build([j]));
      for(const block of [...q.prompt,...q.choices.flat()])assert.ok(validate(block),JSON.stringify(validate.errors));
    }
    for(const bad of [[],[-1],[all.length],[NaN],[.5],[0,0]])assert.throws(()=>d.build(bad),/PARAMETER_CONSTRAINT|指定条件/);
  }
});

for(const [number,rules] of Object.entries(facts)){
  test('問'+number+'の本文条件と四つの候補の意味を手査読対応に照合する',()=>{
    const all=cases(Number(number));
    assert.equal(all.length,rules.length);
    for(const q of all){
      const matching=rules.filter(rule=>rule.when.test(prompt(q)));
      assert.equal(matching.length,1,prompt(q));
      const [{options:roles,correct}]=matching;
      const values=options(q), truth=values.map((value,i)=>{
        assert.match(value,roles[i]);
        assert.equal(roles.filter(role=>role.test(value)).length,1);
        return i===correct;
      });
      compare(q,truth);
      if(number==='35')assert.match(diagrams(q)[0],/利用者宅内。.+―.+―装置Aと，.+―装置Aが接続される。/);
      if(number==='45')assert.match(diagrams(q)[0],/左の四角から左上の円へ.*平行線.*右の四角へ/);
    }
  });
}
type Relation={fields:string[];keys:string[]};
function relations(alt:string):Relation[]{
  return alt.split('\n').map(line=>{
    const match=/（(.+)）。主キーの下線：(.+)。$/.exec(line);
    assert.ok(match,line);
    return {fields:match[1].split('，'),keys:match[2].split('，')};
  });
}
test('問30の四候補を主キー一意性・関数従属・表結合で独立検算する',()=>{
  for(const q of cases(30)){
    const [{fields:[left,right,attribute,quantity],keys}]=relations(diagrams(q)[0]);
    assert.deepEqual(keys,[left,right]);
    const owner=prompt(q).includes(attribute+'は'+left+'で決まり')?left:right;
    const rows=[['A','X','4'],['A','Y','7'],['B','X','2'],['B','Y','5']].map(([a,b,v])=>
      ({[left]:a,[right]:b,[attribute]:owner===left?'名称'+a:'名称'+b,[quantity]:v}));
    const indexValues=(record:Record<string,string>,fields:readonly string[])=>fields.map(field=>record[field]).join('|');
    const tests=options(q).map(option=>{
      const [first,second]=relations(option);
      const cover=new Set([...first.fields,...second.fields]);
      const projected=[first,second].map(({fields})=>
        [...new Map(rows.map(row=>[indexValues(row,fields),Object.fromEntries(fields.map(field=>[field,row[field]]))])).values()]);
      if(cover.size!==4||[first,second].some(({keys},i)=>new Set(projected[i].map(row=>indexValues(row,keys))).size!==projected[i].length))return false;
      const shared=first.fields.filter(field=>second.fields.includes(field));
      const joined=projected[0].flatMap(a=>projected[1].filter(b=>shared.every(field=>a[field]===b[field])).map(b=>({...a,...b})));
      const restores=same(sorted(joined.map(row=>indexValues(row,[left,right,attribute,quantity]))),sorted(rows.map(row=>indexValues(row,[left,right,attribute,quantity]))));
      return restores&&[first,second].every(({fields,keys})=>
        (!fields.includes(attribute)||same(keys,[owner]))&&(!fields.includes(quantity)||same(keys,[left,right])));
    });
    compare(q,tests);
  }
});

test('問31の元SQLと全候補をSQLiteで照合し，NULLが入る反例を再現する',()=>{
  for(const q of cases(31)){
    const code=q.prompt.find(block=>block.type==='code');
    assert.equal(code?.type,'code');
    const parsed=/SELECT (\S+) FROM (\S+)\n\s+WHERE \S+ (NOT IN|IN) \(SELECT \S+ FROM (\S+)\)/.exec(code.text);
    assert.ok(parsed);
    const [,match,outer,operator,inner]=parsed, isNegative=operator==='NOT IN';
    assert.ok(prompt(q).includes(inner+'表の'+match+'にはNULLを含まない。'));
    assert.match(diagrams(q)[0],/主キーの下線/);
    const truths=[true,true,true,true];
    for(const internal of [[2,2,9],[],[1,3],[1,2,3]]){
      const db=new DatabaseSync(':memory:');
      try{
        db.exec('CREATE TABLE '+outer+' ('+match+' INTEGER PRIMARY KEY); CREATE TABLE '+inner+' (i INTEGER PRIMARY KEY, '+match+' INTEGER NOT NULL);');
        for(const id of [1,2,3])db.prepare('INSERT INTO '+outer+' VALUES (?)').run(id);
        for(const [i,id] of internal.entries())db.prepare('INSERT INTO '+inner+' VALUES (?,?)').run(i+1,id);
        const run=(sql:string)=>db.prepare(sql).all().map(row=>Number(row[match])).sort((a,b)=>a-b);
        const expected=[1,2,3].filter(id=>internal.includes(id)!==isNegative);
        assert.deepEqual(run(code.text),expected);
        options(q).forEach((sql,i)=>{truths[i]&&=same(run(sql),expected);});
      }finally{db.close();}
    }
    compare(q,truths);
  }
  const base=cases(31)[0], sql=base.prompt.find(block=>block.type==='code')!;
  assert.equal(sql.type,'code');if(sql.type!=='code')throw Error('SQL');
  const db=new DatabaseSync(':memory:');
  try{
    db.exec('CREATE TABLE 商品 (商品番号 INTEGER PRIMARY KEY); CREATE TABLE 在庫 (在庫番号 INTEGER PRIMARY KEY, 商品番号 INTEGER); INSERT INTO 商品 VALUES (1); INSERT INTO 在庫 VALUES (1, NULL);');
    assert.deepEqual(db.prepare(sql.text).all(),[]);
    assert.equal(db.prepare(options(base)[3]).all()[0].商品番号,1);
    assert.match(base.explanation,/原資料ではNULLの可否は明記されていない/);
  }finally{db.close();}
});

test('問34は実際の条件表のビット換算と両端処理を分数で検算する',()=>{
  for(const q of cases(34)){
    const table=q.prompt.find(block=>block.type==='table');
    assert.equal(table?.type,'table');
    const [speed,efficiency,packet,client,server]=table.rows.map(row=>row[1]);
    const number=(value:string)=>Number(value.match(/[\d.]+/)?.[0]);
    const packets=packet.match(/\d+/g)!.map(Number);
    const transferNumerator=packets.reduce((sum,value)=>sum+value,0)*8000;
    const denominator=number(speed)*number(efficiency);
    const cpuTenths=Math.round(10*(number(client)+number(server)));
    const candidates=options(q).map(Number);
    assert.deepEqual(candidates,[...candidates].sort((a,b)=>a-b));
    assert.match(prompt(q),/距離による遅延は考慮しない/);
    assert.match(client,/合わせて/);assert.match(server,/合わせて/);
    compare(q,candidates.map(value=>(Math.round(value*10)-cpuTenths)*denominator===transferNumerator));
  }
});

test('問38はRFC 1918の三つの範囲をクラスフル区分と数値境界で確認する',()=>{
  const privateNetworks:{[key:string]:[string,number]}={A:['10.0.0.0',8],B:['172.16.0.0',12],C:['192.168.0.0',16]};
  const ip=(value:string)=>value.split('.').reduce((sum,part)=>sum*256+Number(part),0);
  for(const q of cases(38)){
    const cls=/クラス([ABC])/.exec(prompt(q))![1];
    const [first,bits]=privateNetworks[cls], start=ip(first), end=start+2**(32-bits)-1;
    const parsed=options(q).map(value=>value.split(' ～ ').map(ip));
    assert.deepEqual(parsed.map(([start])=>start),[...parsed].map(([start])=>start).sort((a,b)=>a-b));
    compare(q,parsed.map(([lo,hi])=>lo===start&&hi===end));
  }
});

test('問41は列挙した文字列の同値類と全ての式を比較する',()=>{
  const factorial=(n:number)=>Array.from({length:n},(_,i)=>i+1).reduce((product,i)=>product*i,1);
  for(const q of cases(41)){
    const condition=prompt(q), repeated=condition.includes('再使用でき'), ordered=!condition.includes('順番だけが異なるものは同じ');
    const matches=[true,true,true,true];
    for(const [m,n] of [[4,2],[4,3],[5,3],[6,2]]){
      const words=new Set<string>();
      for(let id=0;id<m**n;id++){
        const digits=id.toString(m).padStart(n,'0').split('');
        if(repeated||new Set(digits).size===n)words.add((ordered?digits:[...digits].sort()).join(''));
      }
      const formulas:{[key:string]:number}={
        'Mⁿ':m**n,'M!／(M−n)!':factorial(m)/factorial(m-n),
        'M!／(n! (M−n)!)':factorial(m)/(factorial(n)*factorial(m-n)),
        '(M＋n−1)!／(n! (M−1)!)':factorial(m+n-1)/(factorial(n)*factorial(m-1)),
      };
      options(q).forEach((value,i)=>{matches[i]&&=formulas[value]===words.size;});
    }
    assert.ok(q.choices.every(choice=>choice[0].type==='formula'&&choice[0].format==='latex'));
    compare(q,matches);
  }
});

test('問43は独立ビットの全6対応を試行結果で絞り，各選択肢を検査する',()=>{
  const names=['読取り','書込み','実行'];
  const permutations=[1,2,4].flatMap(a=>[1,2,4].filter(b=>a!==b).map(b=>[a,b,7-a-b]));
  const decode=(mask:number,mapping:readonly number[])=>names.filter((_,i)=>Boolean(mask&mapping[i])).sort();
  for(const q of cases(43)){
    const content=prompt(q), observed=/② (\d)を設定したら，(.+)はできたが，(.+)ができなかった。/.exec(content);
    assert.ok(observed);
    const observedNames=names.filter(name=>observed[2].includes(name)).sort();
    const viable=permutations.filter(map=>same(decode(Number(observed[1]),map),observedNames));
    assert.equal(viable.length,2);
    assert.ok(content.includes('① 0')&&content.includes('③ 7'));
    const answers=options(q).map(text=>{
      const option=/^(\d)を設定すると，(.+)ができる。$/.exec(text);
      assert.ok(option);
      const expected=names.filter(name=>option[2].includes(name)).sort();
      return viable.every(map=>same(decode(Number(option[1]),map),expected));
    });
    assert.deepEqual(options(q).map(value=>Number(value[0])),[2,4,5,6]);
    compare(q,answers);
  }
});

test('問46は実際のE-R図の関係方向と多重度から全択を検算する',()=>{
  for(const q of cases(46)){
    const [legend,diagram]=diagrams(q);
    assert.match(legend,/A端 1―B端 0\.\.\*/);
    assert.match(legend,/A端 0\.\.\*―B端 1\.\.\*/);
    const links=diagram.split('。').filter(Boolean).map(link=>{
      const match=/^([^0-9]+)(1|0\.\.\*|1\.\.\*)―(0\.\.\*|1\.\.\*|1)([^0-9]+)$/.exec(link);
      assert.ok(match,link);return {from:match[1],to:match[4],left:match[2],right:match[3]};
    });
    assert.deepEqual(links.map(({from,to})=>from+'→'+to),[
      '商品→仕入先','商品→発注明細','発注明細→発注','仕入先→発注','仕入先→納品','発注→納品','納品→納品明細','商品→納品明細',
    ]);
    function max(from:string,to:string){
      const direct=links.find(edge=>edge.from===from&&edge.to===to), reverse=links.find(edge=>edge.from===to&&edge.to===from);
      if(direct)return direct.right==='1'?1:Infinity;
      if(reverse)return reverse.left==='1'?1:Infinity;
      return undefined;
    }
    compare(q,[
      max('商品','仕入先')===1,max('発注明細','納品明細')===1&&max('納品明細','発注明細')===1,
      max('発注','仕入先')===1,max('発注','発注明細')===1&&max('発注明細','商品')===1,
    ]);
  }
});

test('問50は毎回残りに割合を掛け，境界を整数分数で照合する',()=>{
  for(const q of cases(50)){
    const [settled,target]=[...prompt(q).matchAll(/(\d+)％/g)].map(match=>BigInt(match[1]));
    const met=(times:bigint)=>(100n-settled)**times*100n<=(100n-target)*100n**times;
    assert.deepEqual(options(q),['1','2','3','4']);
    compare(q,options(q).map(option=>met(BigInt(option))&&!met(BigInt(option)-1n)));
  }
});

test('問51の原図と全図で独立に全経路を列挙し，短縮前後の差を求める',()=>{
  for(const q of cases(51)){
    const changes=/所要日数を(\d+)日から(\d+)日に短縮/.exec(prompt(q));
    assert.ok(changes);
    const edges=[...diagrams(q)[0].matchAll(/([A-I]) (\d)→(\d) (\d+)日/g)].map(([,name,from,to,days])=>
      ({name,from:Number(from),to:Number(to),days:Number(days)}));
    assert.deepEqual(edges.map(({name,from,to})=>name+from+to),['A12','B23','C35','D24','E45','F46','G57','H67','I78']);
    assert.equal(edges.find(edge=>edge.name==='E')?.days,Number(changes[1]));
    const sums=(node:number,replace?:number):number[]=>node===8?[0]:edges.filter(edge=>edge.from===node).flatMap(edge=>
      sums(edge.to,replace).map(rest=>rest+(edge.name==='E'&&replace!==undefined?replace:edge.days)));
    assert.equal(sums(1).length,3);
    const difference=Math.max(...sums(1))-Math.max(...sums(1,Number(changes[2])));
    const candidates=options(q).map(value=>Number.parseInt(value,10));
    assert.deepEqual(candidates,[0,1,2,3]);compare(q,candidates.map(value=>value===difference));
  }
});

test('全図の有限入力，説明とSVG参照，問30の下線を実描画で照合する',()=>{
  assert.equal(figures.length,11);assert.equal(renderers.length,11);
  for(const [i,figure] of figures.entries()){
    const id=drawingIds[i];
    assert.equal(figure.profile,renderers[i].profile);
    for(let state=figure.domain[0][0];state<=figure.domain[0][1];state++){
      assert.doesNotThrow(()=>figure.validate([state]));
      const html=renderToStaticMarkup(React.createElement(renderers[i].component,{values:[state],caption:drawingCaption(id)}));
      assert.ok(html.includes('diagram-scroll'));
      assert.ok(html.includes('aria-description='));
      if(id.startsWith('30-')){
        const keyCount=relations(figure.alt([state])).flatMap(row=>row.keys).length;
        assert.equal((html.match(/<u>/g)??[]).length,keyCount);
      }else{
        assert.ok(html.includes('<svg'));
        const title=/aria-labelledby="([^"]+)"/.exec(html)?.[1], desc=/aria-describedby="([^"]+)"/.exec(html)?.[1];
        assert.ok(title&&desc&&html.includes('<title id="'+title+'"')&&html.includes('<desc id="'+desc+'"'));
      }
    }
    for(const input of [[],[-1],[figure.domain[0][1]+1],[0.5],[0,0]])assert.throws(()=>figure.validate(input));
  }
});
