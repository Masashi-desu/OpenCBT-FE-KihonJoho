import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../../../src/core/types';
import { autumn2006Pm06To09Specs as specs } from '../../../scripts/legacy-2006-autumn-pm-06-09-specs';
import { legacy2006AutumnPm0609Figures as figures } from '../../../src/core/generators/legacy-2006-autumn-pm-06-09-figures';
import { legacy2006AutumnPm0609FigureRenderers as renderers } from '../../../src/ui/Legacy2006AutumnPm0609Figures';
import { assemble, candidateMatch, compactIndexedFile, expectedSplit, matchingDigits, packFields, runCasl, savedRegisters, withBlanks } from '../../fixtures/legacy-2006-autumn-pm-06-09-oracle';

const conditions=[0,1,2,3];
const text=(block:Block)=>{ assert('text' in block);return block.text; };
const codes=(blocks:Block[])=>blocks.filter(block=>block.type==='code').map(text);
const truth=(result:boolean[])=>result.flatMap((ok,i)=>ok?[i]:[]);
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
const body=(number:number,condition:number)=>specs.find(s=>s.number===number)!.definition.build([condition]);
function openParts(number:number,condition:number) {
  const {answerParts,partAnswers,choices}=body(number,condition);
  assert(answerParts&&partAnswers);
  return answerParts.map(part=>{
    const options=part.choiceIds!.map(id=>text(choices[Number(id.split('-').at(-1))-1][0]));
    const key=partAnswers.find(answer=>answer.kind==='choice'&&answer.partId===part.id)!;
    assert(key.kind==='choice'&&key.choiceId);
    return {options,expected:part.choiceIds!.indexOf(key.choiceId)};
  });
}
const selected=(parts:ReturnType<typeof openParts>)=>parts.map(part=>part.options[part.expected]);

test('公式15解答欄・共通解答群の選択範囲と全生成条件を保持する',()=>{
  const keys={6:'ウアウエエ',7:'イイエカエ',9:'ウイオウカ'};
  const counts={6:[4,4,5,6,6],7:[8,8,8,8,5],9:[6,6,6,8,8]};
  const pages={6:[21,22,23],7:[24,25,26,27],9:[31,32,33]};
  assert.deepEqual(specs.map(spec=>spec.number),[6,7,9]);
  for(const spec of specs) {
    const number=spec.number as keyof typeof keys;
    assert.deepEqual(spec.pages,pages[number]);
    assert.equal(new Set(conditions.map(c=>JSON.stringify(body(number,c).prompt))).size,4, String(number));
    assert.deepEqual(Object.keys(spec.originalPageAlt).map(Number),pages[number]);
    for(const page of pages[number]) assert(spec.originalPageAlt[page].length>100);
    const original=spec.original;
    assert(original.partAnswers?.length===5);
    const answerSignatures=new Set(conditions.map(condition=>selected(openParts(number,condition)).join('|')));
    assert.equal(answerSignatures.size,spec.definition.answerVariation==='fixed'?1:4);
    for(const condition of conditions) {
      const parts=openParts(number,condition);
      assert.deepEqual(parts.map(part=>part.options.length),counts[number]);
      assert.equal(parts.map(part=>'アイウエオカキク'[part.expected]).join(''),keys[number]);
      for(const part of parts) assert.equal(new Set(part.options).size,part.options.length);
    }
    for(const invalid of [[],[-1],[1.5],[4],[0,1]]) assert.throws(()=>spec.definition.build(invalid));
  }
  const p21=specs[0].originalPageAlt[21];
  assert.match(p21,/1問を選択.*2問以上選択.*はじめの1問/);
  assert.match(p21,/char\[\] target/);
  assert.match(body(6,0).prompt.filter(block=>block.type==='code').map(text)[0],/char target\[\]/);
  assert.match(specs[1].originalPageAlt[26],/重複して選んで/);
  assert.match(specs[2].originalPageAlt[33],/設問1[\s\S]*解答群[\s\S]*設問2[\s\S]*αを置換[\s\S]*解答群/);
  for(const condition of conditions) {
    const materials=body(9,condition).contexts;
    assert(materials?.length===1);
    assert.equal(materials[0].title,'CASL IIの仕様');
    const ids=materials[0].blocks.map(block=>{assert(block.type==='image');return block.assetId;});
    assert.deepEqual(ids.map(id=>id.match(/page-(\d{3})/)?.[1]),['055','056','057','058','059','060']);
    assert.match(ids[2],/-casl-excerpt$/);
  }
});

const example=(blocks:Block[])=>{
  const line=blocks.filter(block=>block.type==='paragraph').map(text).find(line=>line.startsWith('例えば'));
  const match=line?.match(/目標数が “([0-9]+)” で推測数が “([0-9]+)”.*Hit 数が (\d).*Blow 数が (\d)/);
  assert(match,line);
  return {target:match[1],guess:match[2],hit:Number(match[3]),blow:Number(match[4])};
};

test('問6は全180候補の一致処理と二つの反復条件を独立に選別する',()=>{
  for(const condition of conditions) {
    const parts=openParts(6,condition);
    const demo=example(body(6,condition).prompt);
    assert.deepEqual({hit:demo.hit,blow:demo.blow,matched:false},matchingDigits(demo.target,demo.guess));
    const {target}=demo;
    const stable=target.slice(0,-1)+[...'0123456789'].find(digit=>!target.includes(digit));
    const guesses=[target,demo.guess,stable,target.slice(1)+target[0],
      [...target].reverse().join(''),target[0]+target.slice(2)+target[1]];
    const solutions = parts[2].options.flatMap((c,i)=>parts[3].options.flatMap((d,j)=>parts[4].options.flatMap((e,k)=>
      guesses.every(guess=>same(candidateMatch(target,guess,c,d,e),matchingDigits(target,guess)))?[[i,j,k]]:[])));
    assert.deepEqual(solutions,[parts.slice(2).map(part=>part.expected)]);
    const kinds=['invalid','different','same'] as const;
    const evaluate=(condition:string,kind:typeof kinds[number])=>{
      const match=/^(isMatch\(target, num\)|isValidNumber\(num\)) == (TRUE|FALSE)$/.exec(condition);
      assert(match);
      return (match[1].startsWith('isMatch')?kind==='same':kind!=='invalid')===(match[2]==='TRUE');
    };
    assert.deepEqual(truth(parts[0].options.map(condition=>kinds.every(kind=>evaluate(condition,kind)===(kind==='invalid')))),[parts[0].expected]);
    const accepted=kinds.slice(1);
    assert.deepEqual(truth(parts[1].options.map(condition=>accepted.every(kind=>evaluate(condition,kind)===(kind==='different')))),[parts[1].expected]);
  }
});

test('問6は原版と4つの生成条件でC17コンパイルと入力を検証する',()=>{
  const work=mkdtempSync(join(tmpdir(),'s3-042-c-'));
  try {
    for(const condition of [-1,...conditions]) {
      const original=condition===-1;
      const output=original?specs.find(spec=>spec.number===6)!.original:body(6,condition);
      const {target,guess,hit,blow}=example(output.prompt);
      const answers=Object.fromEntries(selected(openParts(6,Math.max(0,condition))).map((entry,i)=>['abcde'[i],entry]));
      const [source] = codes(output.prompt).filter(program=>program.startsWith('#include <stdio.h>'));
      assert(source);
      const filled=withBlanks(source,answers);
      assert.match(filled,new RegExp('scanf\\("%'+target.length+'s", num\\);'));
      const cFile=join(work,'guess.c'), executable=join(work,'guess'+condition);
      writeFileSync(cFile,filled+
        '\n#include <string.h>\n#include <ctype.h>\n'+
        'void createRandomNumber(char target[]) { memcpy(target, "'+target+'", DIGITS+1); }\n'+
        'int isValidNumber(char num[]) {\n'+
        '    if (strlen(num) != DIGITS) return FALSE;\n'+
        '    int seen[10] = {0};\n'+
        '    for (int i = 0; i < DIGITS; i++) {\n'+
        '        unsigned char ch = (unsigned char)num[i];\n'+
        "        if (!isdigit(ch) || ++seen[ch-'0'] > 1) return FALSE;\n"+
        '    }\n'+
        '    return TRUE;\n'+
        '}\n'+
        'int main(void) { GuessNumber(); return 0; }\n');
      const historicalOptions=original?['-Wno-strict-prototypes']:[];
      const comp=spawnSync('cc',['-std=c17','-pedantic-errors',...historicalOptions,cFile,'-o',executable],{encoding:'utf8',timeout:15000});
      assert.equal(comp.status,0,String(comp.error??comp.stderr));
      const run=spawnSync(executable,[],{
        encoding:'utf8',timeout:5000,maxBuffer:128*1024,
        input:'1'.repeat(target.length)+'\n'+guess+'\n'+target+'\n',
      });
      assert.equal(run.status,0,String(run.error??run.stderr));
      assert.equal((run.stdout.match(/再度入力してください/g)??[]).length,1);
      assert.equal((run.stdout.match(/正解です/g)??[]).length,1);
      assert.match(run.stdout,/\[1回目\].*\[2回目\]/s);
      assert.equal((run.stdout.match(/\[\d+回目\]/g)??[]).length,2);
      assert(run.stdout.includes(guess+'は'+hit+'Hit,'+blow+'Blowです。'));
    }
  } finally {rmSync(work,{recursive:true,force:true});}
});

test('問7は索引ファイルの成功・失敗と限界番号・全消去位置・全操作列を対照する',()=>{
  for(const condition of conditions) {
    const output=body(7,condition),parts=openParts(7,condition);
    const limit=Number(output.prompt.filter(block=>block.type==='paragraph').map(text).map(line=>line.match(/(\d)人まで登録/)).find(Boolean)?.[1]);
    assert([5,7,8,9].includes(limit));
    const [addition,deletion]=codes(output.prompt);
    assert.match(addition,new RegExp('UNTIL W-BANGO > '+limit+' OR'));
    assert.match(addition,new RegExp('IF W-BANGO = '+limit+' THEN'));
    assert.match(deletion,new RegExp('MOVE '+(limit+1)+' TO W-BANGO'));
    const applicable=(phrase:string,exists:boolean)=>{
      if(phrase==='INVALID') return !exists;
      if(phrase==='NOT INVALID') return exists;
      return undefined;
    };
    for(const [i,neededOnSuccess] of [false,false,true].entries()) {
      const tests=parts[i].options.map(phrase=>applicable(phrase,true)===neededOnSuccess && applicable(phrase,false)===!neededOnSuccess);
      assert.deepEqual(truth(tests),[parts[i].expected]);
    }
    const shifted=(first:number,phrase:string,count:number)=>{
      const control=/^(?:(VARYING) W-BANGO FROM 1 BY 1 )?UNTIL W-BANGO (=|>) (\d+)$/.exec(phrase);
      if(!control) return undefined;
      const [,reset,comparison,max]=control, stop=Number(max);
      const reached=(key:number)=>comparison==='='?key===stop:key>stop;
      let key=reset?1:first;
      const desired:number[]=[];
      for(let step=0;step<=limit+1 && !reached(key);step++) {
        if(key<=count) desired.push(key);
        else key=limit+1;
        key++;
      }
      return reached(key)?desired:undefined;
    };
    const scenarios=Array.from({length:limit},(_,i)=>i+1).flatMap(count=>
      Array.from({length:count},(_,i)=>({count,removed:i+1})));
    const offset=parts[3].options.map(phrase=>scenarios.every(({count,removed})=>
      same(shifted(removed+1,phrase,count),Array.from({length:count-removed},(_,i)=>removed+1+i))));
    assert.deepEqual(truth(offset),[parts[3].expected]);
    const matches=parts[4].options.map(sequence=>scenarios.every(({count,removed})=>{
      const before=Array.from({length:count},(_,i)=>'0'+String(112345600+10*i));
      const after=before.filter((_,i)=>i+1!==removed).map((value,i)=>[i+1,value]);
      return same(compactIndexedFile(before,removed,sequence),after);
    }));
    assert.deepEqual(truth(matches),[parts[4].expected]);
    assert.equal(compactIndexedFile(['first','second'],1,'①→⑤→②→③'),'unavailable record area');
  }
});

test('問9では全長さ153組の結合・分割合致、レジスタ保存、全426候補組の一意性を検証する',()=>{
  const samples=[[0,0],[65535,65535],[0xaaaa,0x5555],[0x9138,0xc8de],[0xffff,0],[0,0xffff],[0x8001,0xeffe],[0xed63,0x3ae9]];
  const widths=Array.from({length:17},(_,m)=>Array.from({length:17-m},(_,n)=>[m,n])).flat();
  assert.equal(widths.length,153);
  for(const condition of conditions) {
    const output=body(9,condition);
    const [combine,divide]=codes(output.prompt);
    const replacements=output.prompt.find(block=>block.type==='diagram'&&block.caption==='α・βの置換内容');
    assert(replacements?.type==='diagram');
    const alternative=replacements.alt.split('\nαを置換：\n')[1];
    const [first,second]=alternative.split('\n\nβを置換：\n');
    const combining=(a:string,b:string)=>assemble(withBlanks(combine,{a,b}));
    const dividing=(c:string)=>assemble(withBlanks(divide,{c}));
    const retaining=(c:string,d:string,e:string)=>assemble(withBlanks(divide.split('\n')
      .map(line=>line.includes('← α')?first:line.includes('← β')?second:line).join('\n'),{c,d,e}));
    const [{options:as},{options:bs},{options:cs},{options:ds},{options:es}]=openParts(9,condition);
    const [a,b,c,d,e]=selected(openParts(9,condition));
    const inputs=widths.flatMap(([m,n])=>samples.map(([p,q])=>({m,n,p,q,word:packFields(p,q,m,n)})));
    const combineAgrees=(instructions:ReturnType<typeof assemble>)=>inputs.every(({m,n,p,q,word})=>{
      const result=runCasl(instructions,0,m,n,p,q);
      return result.registers[0]===word&&same(result.registers.slice(1),savedRegisters(m,n))&&same(result.words,[p,q]);
    });
    const divideAgrees=(instructions:ReturnType<typeof assemble>,preserve:boolean)=>inputs.every(({m,n,p,q,word})=>{
      const result=runCasl(instructions,word,m,n,p,q);
      return same(result.words,expectedSplit(word,m,n,p,q,preserve))&&same(result.registers.slice(1),savedRegisters(m,n));
    });
    assert.deepEqual(as.flatMap(a=>bs.flatMap(b=>combineAgrees(combining(a,b))?[[a,b]]:[])),[[a,b]]);
    assert.deepEqual(cs.filter(c=>divideAgrees(dividing(c),false)),[c]);
    assert.deepEqual(cs.flatMap(c=>ds.flatMap(d=>es.flatMap(e=>divideAgrees(retaining(c,d,e),true)?[[c,d,e]]:[]))),[[c,d,e]]);
  }
});

test('問9の図1・2と置換表の4状態で資料注記・語の幅・見出しを照合する',()=>{
  assert.equal(figures.length,3);
  assert.deepEqual(figures.map(figure=>figure.profile),renderers.map(renderer=>renderer.profile));
  for(const condition of conditions) {
    const diagrams=body(9,condition).prompt.filter(block=>block.type==='diagram');
    assert.equal(diagrams.length,3);
    for(const [i,block] of diagrams.entries()) {
      assert.equal(block.scene.kind,'source_figure');
      if(block.scene.kind!=='source_figure') throw Error('No source figure');
      const {values,profile}=block.scene;
      assert.equal(profile,figures[i].profile);
      assert.equal(figures[i].alt(values),block.alt);
      const markup=renderToStaticMarkup(createElement(renderers[i].component,{values,caption:block.caption}));
      assert(markup.includes('aria-description')&&markup.includes('tabindex="0"'));
      if(i===2) assert.match(markup,/αを置換[\s\S]*［d］[\s\S]*βを置換[\s\S]*［e］/);
      else {
        for(const group of markup.matchAll(/data-word="([^"]+)"[^>]+>([\s\S]*?)<\/g>/g)) {
          const widths=[...group[2].matchAll(/data-bits="(\d+)"/g)].map(match=>Number(match[1]));
          assert.equal(widths.reduce((a,b)=>a+b,0),16,group[1]);
        }
        if(i===1) assert.match(block.alt,/残りは元のデータを保持/);
      }
    }
  }
});
