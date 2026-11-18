import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block, Question } from '../../../src/core/types';
import { displayedAnswerParts, gradeAnswer } from '../../../src/core/answers';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2004AutumnPm01To05Definitions as definitions } from '../../../src/core/generators/legacy-2004-autumn-pm-01-05';
import { legacy2004AutumnPm0105Figures as figures } from '../../../src/core/generators/legacy-2004-autumn-pm-01-05-figures';
import { legacy2004AutumnPm0105FigureRenderers as renderers } from '../../../src/ui/Legacy2004AutumnPm0105Figures';
import { autumn2004Pm01To05Specs as specs } from '../../../scripts/legacy-2004-autumn-pm-01-05-specs';

const indices=[0,1,2,3], marks='アイウエオカキクケコ';
const variants=(q:number)=>indices.map(i=>definitions.find(item=>item.source.endsWith('-'+q))!.build([i]));
const prompt=(body:GeneratedBody)=>body.prompt.filter(item=>item.type==='paragraph').map(item=>item.text).join('\n');
function optionContent(body:GeneratedBody,id:string) {
  const blocks=body.choices[Number(id.slice('choice-value-'.length))-1];
  assert.equal(blocks.length,1);
  const [block]=blocks;
  assert(block.type==='paragraph'||block.type==='code'||block.type==='diagram');
  return block.type==='diagram'?block.alt:block.text;
}
function part(body:GeneratedBody,id:string) {
  const answerPart=body.answerParts?.find(item=>item.id==='part-'+id);
  assert(answerPart);
  return answerPart;
}
function choices(body:GeneratedBody,id:string) {
  return part(body,id).choiceIds.map(choice=>optionContent(body,choice));
}
function selected(body:GeneratedBody,id:string) {
  const answer=body.partAnswers?.find(item=>item.kind==='choice'&&item.partId===part(body,id).id);
  assert(answer?.kind==='choice');
  return optionContent(body,answer.choiceId);
}
function unique(body:GeneratedBody,id:string,condition:(choice:string)=>boolean){
  assert.deepEqual(choices(body,id).filter(condition),[selected(body,id)]);
}
function drawing(body:GeneratedBody,label:string) {
  const diagram=body.prompt.find(item=>item.type==='diagram'&&item.scene.kind==='source_figure'&&item.scene.profile.endsWith('-'+label));
  assert(diagram?.type==='diagram');
  return diagram;
}
function svg(block:Block) {
  assert(block.type==='diagram'&&block.scene.kind==='source_figure');
  const {profile,values}=block.scene, rendered=renderers.find(item=>item.profile===profile);
  assert(rendered);
  return renderToStaticMarkup(createElement(rendered.component,{caption:block.caption,values}));
}

test('原ページ、公式の解答欄、問4共通資料、各4条件の再現性を照合する',()=>{
  const official=new Map([[2,'ウカケオエ'],[3,'オイエエク'],[4,'ウオアクイ'],[5,'オアイウア']]);
  assert.deepEqual(specs.map(item=>item.number),[2,3,4,5]);
  assert.deepEqual(specs.map(item=>item.pages),[[8,9,10],[11,12,13],[14,15,16,17],[18,19,20,21,22]]);
  for(const spec of specs) {
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number),spec.pages);
    assert(spec.pages.every(page=>spec.originalPageAlt[page].length>=80));
    const keys=(body:GeneratedBody)=>body.partAnswers!.flatMap(item=>{
      const main=item.kind==='choice'?item.partId:item.kind==='unordered'?item.partIds[0]:undefined;
      const bank=body.answerParts?.find(node=>node.id===main)?.choiceIds;
      assert(bank);
      const ids=item.kind==='choice'?[item.choiceId]:item.kind==='unordered'?item.choiceIds:[];
      return ids.map(id=>marks[bank.indexOf(id)]);
    }).join('');
    assert.equal(keys(spec.original),official.get(spec.number));
    const cases=variants(spec.number);
    assert.equal(new Set(cases.map(body=>JSON.stringify(body.prompt))).size,4);
    assert(new Set(cases.map(keys)).size>1||spec.definition.answerVariation==='fixed');
    for(const [i,body] of cases.entries()){
      assert.equal(body.answerParts?.length,5);
      assert.deepEqual(body,spec.definition.build([i]));
      assert(body.explanation.length>=80);
      for(const field of body.answerParts!)assert.equal(new Set(field.choiceIds.map(id=>optionContent(body,id))).size,field.choiceIds.length);
    }
    for(const input of [[-1],[4],[0.5],[],[1,2],new Array(1)])assert.throws(()=>spec.definition.build(input),/PARAMETER_CONSTRAINT/);
  }
  assert.deepEqual(specs[2].definition.fixedReferenceAssetIds,['asset-ipa-2004h16a-fe-pm-page-002']);
  assert.doesNotMatch(specs[0].originalPageAlt[9],/自身の社外向けIPアドレスへ変換/);
  assert.doesNotMatch(specs[1].originalPageAlt[13],/個人辞書.+を読み書きし/);
  assert.doesNotMatch(specs[2].originalPageAlt[14],/少なくとも1文字/);
});

test('問2の候補IPv4をマスクで検査し、社内外の宛先IPと最初のMACを独立に計算する',()=>{
  const convert=(ip:string)=>ip.split('.').reduce((n,s)=>n*256+Number(s),0)>>>0;
  for(const body of variants(2)) {
    const layout=drawing(body,'network');
    const [
      ,eCore,gCore,eLocal,gLocal,
    ]=layout.alt.match(/基幹側([\d.]+)）とルータG（基幹側([\d.]+)）.+?Y部門側は([\d.]+)。.+?Z部門側は([\d.]+)。/)!;
    const used=[eCore,gCore,eLocal,gLocal].map(convert);
    const text=prompt(body), mask=convert(text.match(/サブネットマスクは，([\d.]+)/)![1].replace(/\.$/,''));
    const same=(left:string,right:string)=>(convert(left)&mask)===(convert(right)&mask);
    const allowed=(info:string,subnet:string)=>{
      const v=convert(info), host=v&~mask, end=(~mask)>>>0;
      return same(info,subnet)&&host!==0&&host!==end&&!used.includes(v);
    };
    for(const [label,known] of [['a',eCore],['b',eLocal],['c',gLocal]])unique(body,label,value=>allowed(value,known));
    const markup=svg(layout);
    for(const original of [eCore,gCore,eLocal,gLocal])assert(markup.includes('>'+original+'</text>'));
    const [h,p]=body.prompt.find(block=>block.type==='table')!.rows;
    assert.deepEqual(h.slice(0,2),['WebサーバH','WebサーバH']);
    assert.deepEqual(p.slice(0,2),['WebサーバP','WebサーバP']);
    assert(text.includes('Fが最初に送るパケット')&&text.includes('自身の社外向けIPアドレスへ変換'));
    const subnet=selected(body,'b'), ipH=selected(body,'c'), internet='198.51.100.8';
    const prefixInterface=(target:string)=>same(target,subnet)?'LAN上のホスト':'ルータE';
    const observed=[prefixInterface(ipH),'パソコンF',prefixInterface(internet),'関門サーバ'];
    unique(body,'s2',option=>{
      const values=[...option.matchAll(/場合 ([^｜]+)｜([^。]+)/g)].flatMap(([,link,source])=>[link,source]);
      return values.join(',')===observed.join(',');
    });
    assert(text.includes('FTPサーバQ')&&text.includes('pingコマンド'));
    unique(body,'s3',option=>option==='通過可能なポート番号');
  }
});

test('問3の最小権限と全てのd/eの組を独立評価し、実採点を順交換・重複・未回答で照合する',()=>{
  for(const body of variants(3)) {
    const story=prompt(body);
    const [file,event]=body.prompt.filter(block=>block.type==='table');
    assert(file&&event);
    const keywords=new Map(event.rows.map(([resource,key,meaning])=>[resource+'/'+key,meaning]));
    assert(keywords.get('inputevent/create')?.includes('生成')&&keywords.get('inputevent/listen')?.includes('受取り'));
    assert(keywords.get('network/accept')?.includes('からの')&&keywords.get('network/connect')?.includes('への'));
    assert(file.rows[2][2].includes('キーボード'));
    const game=story.slice(story.indexOf('あるサイトからダウンロード'),story.indexOf('同様に，かな漢字変換入力プログラム'));
    const wantEvents=game.includes('同じ装置の入力イベントの生成')?['create','listen']:['listen'];
    const wantNetwork=game.includes('双方から始められる')?['accept','connect']:
      game.includes('ネットワーク接続の受入れ')?['accept']:['connect'];
    const exact=(option:string,wants:string[])=>[...option.split(',')].sort().join(',')===wants.sort().join(',');
    unique(body,'a',option=>exact(option,wantEvents));unique(body,'b',option=>exact(option,wantNetwork));
    unique(body,'c',option=>exact(option,['create','listen']));
    const system=story.match(/とその辞書([\w.]+)をダウンロード/)?.[1];
    const personal=story.match(/個人辞書([\w.]+)を読み書き/)?.[1];
    assert(system&&personal);
    assert.notEqual(system,personal);
    const sensitive='other.'+system.split('.').at(-1);
    const resources=[system,personal,sensitive];
    const need=new Set([system+':read',personal+':read',personal+':write']);
    function coverage(examples:string[]) {
      const approvals=new Set<string>();
      for(const option of examples) {
        const [,filename,ops]=option.match(/^"([^"]+)" ([\w,]+)$/)!;
        const matching=resources.filter(resource=>filename.startsWith('*')?
          resource.endsWith(filename.slice(1)):resource===filename);
        for(const resource of matching)for(const action of ops.split(','))approvals.add(resource+':'+action);
      }
      return approvals.size===need.size&&[...approvals].every(value=>need.has(value));
    }
    const marks=body.partAnswers!.find(item=>item.kind==='unordered');
    assert(marks?.kind==='unordered');
    assert.deepEqual(marks.partIds,['part-d','part-e']);
    assert.equal(marks.presentation,undefined);
    const both=marks.choiceIds.map(id=>optionContent(body,id));
    const matches=choices(body,'d').flatMap(d=>choices(body,'e').map(e=>[d,e])).filter(coverage);
    assert.deepEqual(matches,[both,[...both].reverse()]);
    const app={
      id:'q3-s3-050-test', answerParts:body.answerParts,
      choices:body.choices.map((blocks,i)=>({id:'choice-value-'+(i+1),content:{blocks}})),
      correctAnswer:{parts:body.partAnswers},
    } as Question;
    assert.deepEqual(displayedAnswerParts(app).map(part=>part.id),['part-a','part-b','part-c','part-d','part-e']);
    const fixed=Object.fromEntries(body.partAnswers!.filter(item=>item.kind==='choice').map(item=>[item.partId,item.choiceId]));
    const [first,second]=marks.choiceIds;
    assert.equal(gradeAnswer(app,{selectedPartChoices:{...fixed,'part-d':first,'part-e':second}}).outcome,'correct');
    assert.equal(gradeAnswer(app,{selectedPartChoices:{...fixed,'part-d':second,'part-e':first}}).outcome,'correct');
    assert.equal(gradeAnswer(app,{selectedPartChoices:{...fixed,'part-d':first,'part-e':first}}).outcome,'incorrect');
    assert.equal(gradeAnswer(app,{selectedPartChoices:{...fixed,'part-d':first}}).outcome,'unanswered');
  }
});

test('問4の桁変換を、全基数の範囲・全候補と標準変換結果で検算する',()=>{
  const digits='0123456789ABCDEF';
  function intToString(value:number,base:number,words:string[]) {
    const slots:Record<string,number|string>={Val:value,Rdx:base,Tmp:''};
    const read=(name:string)=>{
      const val=slots[name];
      if(val===undefined)throw Error('未代入');
      return val;
    };
    const set=(statement:string)=>{
      const [dest,expr]=statement.split(' ← ');
      if(expr.includes(' ÷ ')){
        const [l,r]=expr.split(' ÷ ');
        const divisor=Number(read(r));
        if(!divisor)throw Error('零除算');
        slots[dest]=Math.floor(Number(read(l))/divisor);
      }else if(expr.startsWith('ToStr(')){
        const target=expr.includes('Quo')?'Quo':'Rem';
        const char=digits[Number(read(target))];
        if(char===undefined)throw Error('数字の範囲');
        slots[dest]=char+read('Tmp');
      }else slots[dest]=read(expr);
    };
    try{
      set(words[0]);slots.Tmp='';
      let cycles=48;
      while(Number(read('Quo'))>=base){
        if(--cycles===0)return undefined;
        slots.Rem=Number(read('Quo'))%base;
        slots.Tmp=digits[Number(slots.Rem)]+slots.Tmp;
        set(words[1]);
      }
      set(words[2]);return String(slots.Tmp);
    }catch{return undefined;}
  }
  const numbers=[0,1,2,3,9,15,16,17,32,33,48,125,126,127,128,255,256,4095,65535];
  for(const body of variants(4)){
    const text=prompt(body), r=text.match(/（(\d+) ≦ M ≦ (\d+)）を，N進数字列（(\d+) ≦ N ≦ (\d+)）/);
    assert(r&&text.includes('空白文字は含まない')&&text.includes('少なくとも1文字'));
    const [,m0,m1,n0,n1]=r.map(Number);
    const from=Array.from({length:m1-m0+1},(_,i)=>m0+i), to=Array.from({length:n1-n0+1},(_,i)=>n0+i);
    const tables=body.prompt.filter(item=>item.type==='table');
    assert(tables[1].rows[0][2].includes(m0+' ≦ Rdx ≦ '+m1));
    assert(tables[2].rows[1][2].includes(n0+' ≦ Rdx ≦ '+n1));
    unique(body,'a',choice=>from.every(base=>numbers.every(value=>{
      let current=0;
      const next=(stored:number)=>choice==='Rdx'?base:choice==='Val'?stored:choice==='Val × Rdx'?stored*base:Math.floor(stored/base);
      for(const char of value.toString(base).toUpperCase())current=next(current)+digits.indexOf(char);
      return current===value;
    })));
    const found:string[][]=[];
    for(const b of choices(body,'b'))for(const c of choices(body,'c'))for(const d of choices(body,'d')){
      if(to.every(base=>numbers.every(number=>intToString(number,base,[b,c,d])===number.toString(base).toUpperCase())))found.push([b,c,d]);
    }
    assert.deepEqual(found,[['b','c','d'].map(field=>selected(body,field))]);
    unique(body,'e',option=>[...digits].every((target,want)=>{
      let i=0;
      const compare=option.split(' ')[1];
      const compareTo=(probe:string)=>compare==='＞'?target>probe:compare==='＜'?target<probe:compare==='≧'?target>=probe:target<=probe;
      while(i<digits.length&&compareTo(digits[i]))i++;
      return i===want;
    }));
    const code=body.prompt.find(item=>item.type==='code');
    assert(code);
    assert.match(code.text,/Length\(Num\)，1  \/\* Length.+\n│  ・Val ←.+\n +\/\* Substr.+Idx番目（≧1）/);
    assert.match(code.text,/添字は0から始まる/);
    assert.match(code.text,/文字の値もこの順に大きくなる/);
  }
});

test('問5の必要項目、安定順位、同一キー順の照合と出力件数を、ゼロ売上と同額を含む別データで検算する',()=>{
  const products=['0011','0014','0020','0028','0031','0051'];
  const corpus=[
    [4,7,8,0,0,9],[10,5,4,7,0,3],[2,4,4,9,0,4],
  ].flatMap((row,i)=>row.map((sales,j)=>({branch:i+1,code:products[j],quantity:sales?1:0,sales})));
  const sorted=corpus.map(item=>item.code).filter((code,index,list)=>list.indexOf(code)===index).sort();
  function total(code:string){
    return corpus.filter(record=>record.code===code).reduce((value,row)=>value+row.sales,0);
  }
  const expectedRank=Object.fromEntries(sorted.map(code=>[code,sorted.filter(another=>total(another)>total(code)||
    (total(another)===total(code)&&another<code)).length+1]));
  assert(total('0011')===total('0014')&&expectedRank['0011']<expectedRank['0014']);
  assert(total('0031')===0&&expectedRank['0031']===products.length);
  const compare=(candidate:string,a:string,b:string,rankExists:boolean)=>{
    if(candidate.startsWith('商品コード'))return a.localeCompare(b)*(candidate.endsWith('昇順')?1:-1);
    if(candidate.startsWith('売上金額'))return (total(a)-total(b))*(candidate.endsWith('昇順')?1:-1);
    return rankExists?(expectedRank[a]-expectedRank[b])*(candidate.endsWith('昇順')?1:-1):0;
  };
  function merge(left:string[],right:string[]) {
    let i=0,j=0;
    const found=[];
    while(i<left.length&&j<right.length){
      if(left[i]===right[j]){found.push(right[j++]);}
      else if(left[i]<right[j])i++;
      else j++;
    }
    return found;
  }
  for(const body of variants(5)) {
    const question=prompt(body), m=question.match(/本社と(\d+)の支店.+/);
    const cut=question.match(/全支店での売上金額の多い順に(\d+)商品/);
    assert(m&&cut);
    const branches=+m[1], keep=+cut[1];
    assert(question.includes('売上金額が0として記録')&&question.includes('整列処理は安定'));
    assert(question.includes('各支店で売上金額の多い順に'+keep+'商品'));
    const joined=Array.from({length:branches},()=>Array.from({length:keep},()=>1)).flat().length;
    const minimum=new Set(['商品コード','販売数量合計','売上金額合計']);
    unique(body,'a',choice=>{
      const fields=choice.replace(/。$/,'').split('｜');
      return fields.length===minimum.size&&fields.every(field=>minimum.has(field));
    });
    unique(body,'b',choice=>Number(choice.replaceAll(',',''))===joined);
    unique(body,'e',choice=>Number(choice.replaceAll(',',''))===joined);
    unique(body,'c',choice=>[...sorted].sort((a,b)=>compare(choice,a,b,false)).every((code,i)=>expectedRank[code]===i+1));
    const ranked=[...sorted].sort((a,b)=>expectedRank[a]-expectedRank[b]);
    const selected=['0014','0020','0020','0031','0051'].sort();
    unique(body,'d',choice=>{
      const actual=[...ranked].sort((a,b)=>compare(choice,a,b,true));
      return actual.join(',')===sorted.join(',')&&merge(actual,selected).join(',')===selected.join(',');
    });
    assert(drawing(body,'report-all').alt.includes('｜'+keep+'｜'));
    assert(drawing(body,'report-branch').alt.includes('｜'+keep+'｜'));
    assert(drawing(body,'pipeline-all').alt.includes(keep+'商品'));
  }
});

test('入力条件と解答図の全図種をSVGの見出しと説明に対応づける',()=>{
  assert.deepEqual(renderers.map(item=>item.profile).sort(),figures.map(item=>item.profile).sort());
  const seen=new Set<string>();
  for(const def of definitions)for(const i of indices){
    const sample=def.build([i]);
    for(const block of [...sample.prompt,...sample.choices.flat()]){
      if(block.type!=='diagram'||block.scene.kind!=='source_figure')continue;
      const {profile,values}=block.scene, definition=figures.find(item=>item.profile===profile);
      assert(definition);
      const markup=svg(block);
      assert.equal(block.alt,definition.alt(values));
      for(const tag of ['<title','<desc','role="img"','aria-labelledby','aria-describedby','tabindex="0"'])assert(markup.includes(tag));
      assert(markup.includes(block.alt));
      seen.add(profile+'-'+values.join('-'));
    }
  }
  assert.equal(seen.size,29);
});
