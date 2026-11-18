import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2005AutumnPm01To05Definitions as definitions } from '../../../src/core/generators/legacy-2005-autumn-pm-01-05';
import { legacy2005AutumnPm0105Figures as figures } from '../../../src/core/generators/legacy-2005-autumn-pm-01-05-figures';
import { legacy2005AutumnPm0105FigureRenderers as renderers } from '../../../src/ui/Legacy2005AutumnPm0105Figures';
import { autumn2005Pm01To05Specs as specs } from '../../../scripts/legacy-2005-autumn-pm-01-05-specs';

const marks='アイウエオカキクケコ', variants=[0,1,2,3];
const entries=(number:number)=>variants.map(index=>definitions[number-1].build([index]));
type Body=GeneratedBody;
const prompt=(body:Body)=>body.prompt.filter(block=>block.type==='paragraph').map(block=>block.text).join('\n');
const diagrams=(body:Body)=>body.prompt.filter(block=>block.type==='diagram');
const tables=(body:Body)=>body.prompt.filter(block=>block.type==='table');
function getDiagram(body:Body,name:string) {
  const found=diagrams(body).find(block=>block.scene.kind==='source_figure'&&block.scene.profile.endsWith('-'+name));
  assert(found);
  return found;
}
function field(body:Body,name:string) {
  const part=body.answerParts?.find(item=>item.id==='part-'+name);
  assert(part);
  return part;
}
function choiceText(body:Body,id:string) {
  const picked=body.choices[Number(id.slice('choice-value-'.length))-1];
  assert(picked.length===1);
  const [block]=picked;
  assert(block.type==='paragraph'||block.type==='code');
  return block.text;
}
function choices(body:Body,name:string){return field(body,name).choiceIds.map(id=>choiceText(body,id));}
function answer(body:Body,name:string) {
  const part=field(body,name);
  const record=body.partAnswers?.find(item=>item.kind==='choice'&&item.partId===part.id);
  assert(record?.kind==='choice');
  return choiceText(body,record.choiceId);
}
function oneOf(body:Body,name:string,predicate:(text:string,index:number)=>boolean) {
  assert.deepEqual(choices(body,name).filter(predicate),[answer(body,name)]);
}
function renderDiagram(block:Block) {
  assert(block.type==='diagram'&&block.scene.kind==='source_figure');
  const {profile,values}=block.scene, renderer=renderers.find(item=>item.profile===profile);
  assert(renderer);
  return renderToStaticMarkup(createElement(renderer.component,{caption:block.caption,values}));
}

test('問1〜5の原ページ・公式正答・解答欄・基準値と全4条件を照合する',()=>{
  assert.deepEqual(specs.map(spec=>spec.pages),[[4,5,6],[7,8,9,10],[11,12,13],[14,15,16,17,18],[19,20,21,22,23,24]]);
  const official=['エウウオ','エイキエ','オキア','アウエエイカ','イイウウオア'];
  const originalFields=[4,4,3,6,5];
  for(const [index,spec] of specs.entries()) {
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number),spec.pages);
    assert(spec.pages.every(page=>spec.originalPageAlt[page].length>100));
    assert(spec.original.partAnswers);
    const key=spec.original.partAnswers.flatMap(item=>{
      const partId=item.kind==='choice'?item.partId:item.kind==='unordered'?item.partIds[0]:null;
      const bank=spec.original.answerParts?.find(part=>part.id===partId)?.choiceIds;
      assert(bank);
      const ids=item.kind==='choice'?[item.choiceId]:item.kind==='unordered'?item.choiceIds:[];
      return ids.map(id=>marks[bank.indexOf(id)]);
    });
    assert.equal(key.join(''),official[index]);
    assert.equal(spec.original.partAnswers.length,originalFields[index]);
    const bodies=entries(spec.number);
    assert.equal(new Set(bodies.map(body=>JSON.stringify(body.prompt))).size,4);
    for(const [caseIndex,body] of bodies.entries()) {
      assert.deepEqual(spec.definition.build([caseIndex]),body);
      assert.equal(body.partAnswers?.length,originalFields[index]);
      assert(body.explanation.length>70);
      for(const part of body.answerParts!) {
        const text=part.choiceIds.map(id=>choiceText(body,id));
        assert.equal(new Set(text).size,text.length);
      }
    }
    for(const malformed of [[-1],[4],[0.5],[],[0,1],new Array(1)])assert.throws(()=>spec.definition.build(malformed),/PARAMETER_CONSTRAINT/);
  }
  assert.match(specs[0].originalPageAlt[4],/全問解答してください/);
  assert.match(specs[3].originalPageAlt[15],/添字は，0から始まる/);
  assert.deepEqual(specs[3].definition.fixedReferenceAssetIds,
    ['asset-ipa-2005h17a-fe-pm-page-002','asset-ipa-2005h17a-fe-pm-page-003']);
  const [checklist]=specs[4].original.partAnswers!.filter(item=>item.kind==='unordered');
  assert.deepEqual(checklist.partIds,['part-s3-1','part-s3-2']);
  assert.equal(checklist.presentation,'checklist');
  assert.equal(answer(specs[4].original,'a'),answer(specs[4].original,'b'));
  assert.match(specs[4].originalPageAlt[23],/重複して選んでもよい/);
  assert.match(specs[4].originalPageAlt[24],/二つ選べ/);
});

test('問1のNS・Aレコードをアドレス表と照合し、四欄の候補を全て独立に判定する',()=>{
  for(const body of entries(1)) {
    const description=prompt(body), records=body.prompt.filter(block=>block.type==='code').at(-1)!;
    const name=description.match(/\n([A-Z0-9]+)\.example\.co\.jpをネームサーバとする/)?.[1];
    assert(name&&records.text.includes('［a］.example.co.jp.'));
    const [,serverTable]=tables(body), authority=serverTable.rows.find(row=>row[0]===name+'.example.co.jp');
    assert(authority);
    const ip=authority[1].split('\n');
    assert(ip.length===2);
    const prefix=(value:string)=>value.split('.').slice(0,3).join('.');
    oneOf(body,'a',text=>text===name);
    oneOf(body,'b',text=>ip.includes(text)&&text!==ip[0]);
    const zones=new Map<string,string[]>();
    for(const line of records.text.split('\n')) {
      const match=line.match(/^([A-Z0-9-]+|localhost)\.example\.co\.jp\. IN A  (.+)$/);
      if(!match)continue;
      const [,host,raw]=match, value=raw==='［b］'?ip[1]:raw;
      zones.set(host,[...(zones.get(host)??[]),value]);
    }
    oneOf(body,'c',text=>new Set((zones.get(text)??[]).map(prefix)).size>1);
    oneOf(body,'d',text=>{
      const addresses=zones.get(text)??[];
      return new Set(addresses).size>1&&new Set(addresses.map(prefix)).size===1;
    });
    const [srv]=serverTable.rows.filter(row=>row[0]===answer(body,'d')+'.example.co.jp');
    assert(srv);
    const net=getDiagram(body,'dns-network');
    assert(net.alt.includes(answer(body,'a'))&&net.alt.includes(answer(body,'d')));
    assert(renderDiagram(net).includes('>'+answer(body,'d')+'<'));
  }
});

const parentEdges = [
  {P1:'P0',P2:'P0',P3:'P0'},
  {Q1:'Q0',Q2:'Q0',Q5:'Q0',Q3:'Q2',Q4:'Q2'},
  {R1:'R0',R2:'R0',R8:'R0',R3:'R2',R4:'R2',R5:'R2',R6:'R5',R7:'R5'},
] as const;

test('問2の三案の主記憶量・区間の読み込みを、表示した表と領域スロットの履歴から独立に求める',()=>{
  for(const body of entries(2)) {
    const [sizes,...allocations]=tables(body);
    const amounts=Object.fromEntries(sizes.columns.slice(1).map((name,i)=>[name,Number(sizes.rows[0][i+1])]));
    const order=getDiagram(body,'overlay-order').alt.match(/実行順序は(.+)。αは(.)の位置/);
    assert(order);
    const [,raw,alpha]=order, sequence=raw.split('→');
    assert(renderDiagram(getDiagram(body,'overlay-order')).includes('>α<'));
    const capacities:number[]=[], counts:number[]=[], until:number[]=[];
    for(const [i,allocation] of allocations.entries()) {
      const roots=parentEdges[i] as Record<string,string>;
      const paths = allocation.rows.map(([segment,modules])=>{
        const ancestors=[segment];
        while(roots[ancestors[0]])ancestors.unshift(roots[ancestors[0]]);
        return {ancestors, modules:modules.split('，'),segment};
      });
      const resident=new Map<number,string>();
      const bytes=new Map(paths.map(row=>[row.segment,row.modules.reduce((sum,m)=>sum+amounts[m],0)]));
      const lengths=paths.map(row=>row.ancestors.reduce((sum,segment)=>sum+bytes.get(segment)!,0));
      capacities.push(Math.max(...lengths));
      let reads=0;
      for(const module of sequence) {
        const locations=paths.find(row=>row.modules.includes(module))!.ancestors;
        for(const [slot,segment] of locations.entries()) {
          if(resident.get(slot)===segment)continue;
          for(const depth of resident.keys())if(depth>=slot)resident.delete(depth);
          resident.set(slot,segment);
          ++reads;
        }
        if(module===alpha)until[i]=reads;
      }
      counts.push(reads);
    }
    const expects={s1:capacities[0],a:capacities[0]-capacities[2],b:until[2],c:counts[1]-counts[0]};
    for(const [name,value] of Object.entries(expects))oneOf(body,name,text=>+text===value);
    assert.equal(counts[2]-counts[0],6);
    assert(prompt(body).includes('案1では'+(capacities[0]-capacities[1])+'Mバイト'));
    assert(prompt(body).includes('案1では合計'+until[1]+'回'));
  }
});

test('問3の公開値からの共有かぎを全指数の総当たりで照合し、計算の目的と運用対策を確かめる',()=>{
  const semantics=['同じ暗号かぎの使用期間の縮小','公開値交換の削減','公開かぎの交換','復号','秘密の共通かぎの共有','素数の拡大'];
  for(const body of entries(3)) {
    const values=prompt(body).match(/素数pが(\d+)，αが(\d+).+公開かぎYAが(\d+).+公開かぎYBが(\d+)/);
    assert(values);
    const [,p,g,a,b]=values.map(Number);
    const equations=body.prompt.filter(block=>block.type==='formula');
    assert.equal(equations.length,4);
    assert(equations.every(block=>block.format==='latex'&&block.text.endsWith('\\quad\\mathrm{mod}\\quad p')));
    const possible=(base:number,length:number)=>Array.from({length},()=>base).reduce((value,multiplier)=>value*multiplier%p,1);
    const range=Array.from({length:p-1},(_,i)=>i+1);
    const sharedA=range.filter(exp=>possible(g,exp)===a).map(exp=>possible(b,exp));
    const sharedB=range.filter(exp=>possible(g,exp)===b).map(exp=>possible(a,exp));
    const expected=[...new Set([...sharedA,...sharedB])];
    assert.equal(expected.length,1);
    assert(sharedA.length&&sharedB.length);
    oneOf(body,'b',text=>+text===expected[0]);
    const rank=choices(body,'a');
    assert.equal(rank.length,semantics.length);
    assert.deepEqual(rank.map(value=>value.replace(/K|YA，YB|p/g,'')),
      ['共通かぎの更新間隔の短縮','公開かぎの交換回数の削減','公開かぎの交換','秘密かぎによる情報の復号','秘密の共通かぎの共有','より大きな値の素数の使用']);
    oneOf(body,'a',(_,i)=>semantics[i]==='秘密の共通かぎの共有');
    oneOf(body,'c',(_,i)=>semantics[i]==='同じ暗号かぎの使用期間の縮小');
    assert(body.explanation.includes('素数pの大きさだけで安全性は決まらない'));
  }
});

type Tree = {value:string}|{operator:string;left:Tree;right:Tree};
function parseExpression(input:string) {
  let pointer=0;
  function atom():Tree {
    const token=input[pointer++];
    if(token==='(') {
      const nested=addition();
      assert.equal(input[pointer++],')');
      return nested;
    }
    assert(/\d/.test(token));
    return {value:token};
  }
  function product():Tree {
    let left=atom();
    while(['×','÷'].includes(input[pointer])) {
      const operator=input[pointer++];left={operator,left,right:atom()};
    }
    return left;
  }
  function addition():Tree {
    let left=product();
    while(['+','−'].includes(input[pointer])) {
      const operator=input[pointer++];left={operator,left,right:product()};
    }
    return left;
  }
  const root=addition();assert.equal(pointer,input.length);return root;
}
function emit(tree:Tree):string{return 'value' in tree?tree.value:emit(tree.left)+emit(tree.right)+tree.operator;}
function incompleteTail(tree:Tree):string {return 'value' in tree?tree.value:incompleteTail(tree.right)+tree.operator;}

test('問4の入力を構文木として解析し、αでの後置列・配列の境界・EOS・優先度を全候補で検算する',()=>{
  const symbols=['0','1','2','3','4','5','6','7','8','9','+','−','×','÷','(',')','EOS'];
  const expected=[3,3,3,3,3,3,3,3,3,3,1,1,2,2,4,0,-1];
  for(const body of entries(4)) {
    const panel=getDiagram(body,'postfix-input'), contents=panel.alt.match(/要素は(.+)。/)?.[1];
    assert(contents);
    const expression=contents.split('、').join('');
    assert(/\d$/.test(expression));
    const tree=parseExpression(expression), all=emit(tree), tail=incompleteTail(tree);
    assert(all.endsWith(tail));
    oneOf(body,'s2',text=>text===all.slice(0,-tail.length));
    const ownCode=body.prompt.filter(block=>block.type==='code');
    assert.match(ownCode[0].text,/getPriority\(Exptext\[i\]\).+\n│  │ {15}and top\(\) ≠/);
    assert.match(ownCode[1].text,/"7",\n {15}\"8\"/);
    const formula=ownCode[1].text.match(/priority\[0:16\] ← \{([\d,−]+)\}/)?.[1];
    assert.deepEqual(formula?.split(',').map(x=>+x.replace('−','-')),expected);
    oneOf(body,'a',text=>{
      const start=Number(text.match(/i：(\d)/)?.[1]), limit=expression.length+(text.includes('≦')?1:0);
      const visits=Array.from({length:limit-start},(_,i)=>i+start);
      return visits.length===expression.length&&visits.every((value,i)=>value===i);
    });
    oneOf(body,'b',text=>{
      const variable=text[0], delta=text.includes('＋')?1:-1;
      return Array.from({length:all.length},(_,i)=>i).every(i=>variable==='k'&&i+delta===i+1);
    });
    oneOf(body,'c',text=>{
      const doesWrite=(sentinel:boolean)=>text.includes('sflag')?text.endsWith('true'):
        text.includes('≠')?!sentinel:sentinel;
      return doesWrite(false)&&!doesWrite(true);
    });
    oneOf(body,'d',text=>(text.startsWith('k')?all.length:expression.length)+(text.includes('＋')?1:text.includes('−')?-1:0)===all.length);
    oneOf(body,'s3',text=>symbols.every((symbol,target)=>{
      let pointer=0;
      const predicate=(index:number)=>{
        if(text.includes('priority'))return false;
        const value=text.endsWith('EOS')?'EOS':symbols[index-(text.includes('i−1')?1:0)];
        return text.includes('≠')?symbol!==value:symbol===value;
      };
      while(pointer<symbols.length&&predicate(pointer))pointer++;
      return pointer===target;
    }));
  }
});

test('問5の突合せ、四つの処理順序、二つの変更箇所と旧社員表の意味を独立に照合する',()=>{
  for(const body of entries(5)) {
    const stem=prompt(body), rank=stem.match(/職務変更も昇格もしていない社員の階級を(\d)上げる/);
    const oldest=stem.match(/入社後(\d)年に満たない社員/);
    assert(rank&&oldest);
    const grade=Number(rank[1]), years=Number(oldest[1]);
    const [table]=tables(body);
    assert(table.rows[0][2].includes('許可フラグが1'));
    assert(table.rows[2][2].includes(years===1?'前年':years+'年前'));
    const sample=[
      {id:7,job:'営業',rank:12,years:years+1,candidate:true,changed:true,moves:false},
      {id:1,job:'事務',rank:13,years:years+1,candidate:true,changed:false,moves:true},
      {id:3,job:'営業',rank:18,years:years,candidate:false,changed:true,moves:true},
      {id:4,job:'技術',rank:10,years:years-1,candidate:false,changed:false,moves:true},
      {id:8,job:'技術',rank:14,years:years,candidate:false,changed:false,moves:false},
    ];
    const fileIds=new Map([
      ['S1',sample.filter(row=>row.changed).map(row=>row.id)],
      ['S2',sample.filter(row=>row.changed).map(row=>row.id).sort((a,b)=>a-b)],
      ['S3',sample.filter(row=>row.candidate).map(row=>row.id).sort((a,b)=>a-b)],
      ['昇格者',[1]],['職務変更',[7,3,8]],
    ]);
    for(const part of ['a','b'])oneOf(body,part,name=>{
      const ids=fileIds.get(name)!;
      return ids.every((value,i)=>!i||value>ids[i-1])&&ids.join(',')==='3,7';
    });
    const expected=sample.map(row=>[
      row.changed?'技術':row.job, row.candidate&&!row.changed?20:row.changed||row.years<years?row.rank:Math.max(1,row.rank-grade),
      row.moves?'部署B':'部署A',row.candidate&&!row.changed?'管理職':'一般職',
    ]);
    const applyOrder=(order:string)=>{
      const rows=sample.map(row=>({...row,group:'一般職',department:'部署A'}));
      for(const stage of [...order.matchAll(/\d/g)].map(n=>+n[0])) {
        for(const row of rows) {
          if(stage===5&&row.years>=years&&!row.changed)row.rank=Math.max(1,row.rank-grade);
          if(stage===6&&row.changed)row.job='技術';
          if(stage===7&&row.candidate&&!row.changed){row.rank=20;row.group='管理職';}
          if(stage===8&&row.moves)row.department='部署B';
        }
      }
      return rows.map(row=>[row.job,row.rank,row.department,row.group]);
    };
    assert.deepEqual(applyOrder('5→6→7→8'),expected);
    oneOf(body,'s2',text=>JSON.stringify(applyOrder(text))===JSON.stringify(expected));
    const [checklist]=body.partAnswers!.filter(item=>item.kind==='unordered');
    assert.deepEqual(checklist.partIds,['part-s3-1','part-s3-2']);
    assert.equal(checklist.presentation,'checklist');
    const relevant=table.rows.filter(([,operation,text])=>
      (operation==='抽出'&&text.includes('入社年月日'))||(operation==='更新'&&text.startsWith('階級更新ファイルから'))).map(([n])=>'処理'+n);
    assert.deepEqual(checklist.choiceIds.map(id=>choiceText(body,id)),relevant);
    assert.deepEqual(choices(body,'s3-1'),Array.from({length:8},(_,i)=>'処理'+(i+1)));
    oneOf(body,'s4',text=>text==='処理5の更新反映前の社員表');
    assert(getDiagram(body,'hr-report').alt.includes((14-grade)+'級'));
    const revised=getDiagram(body,'hr-revised');
    assert(revised.alt.includes('入社してから'+years+'年以上の社員は'));
    assert(revised.alt.includes('階級を'+grade+'上げる'));
    assert.equal((renderDiagram(revised).match(/data-revised-clause="yes"/g)??[]).length,2);
    assert(choices(body,'s4').every(text=>text.includes('社員表')));
  }
});

test('図の登録とレンダラーを一対一に保ち、全入力でSVGに実際の見出しと説明を出す',()=>{
  assert.deepEqual(renderers.map(item=>item.profile).sort(),figures.map(item=>item.profile).sort());
  for(const d of definitions)for(const i of variants)for(const block of diagrams(d.build([i]))) {
    assert(block.scene.kind==='source_figure');
    const {profile,values}=block.scene;
    const definition=figures.find(item=>item.profile===profile);
    assert(definition);
    assert.equal(block.alt,definition.alt(values));
    const markup=renderDiagram(block);
    for(const token of ['<title','<desc','role="img"','aria-describedby','aria-labelledby','tabindex="0"'])assert(markup.includes(token));
    assert(markup.includes(block.alt));
  }
});
