import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { spring2007Pm06To09Specs as specs } from '../../../scripts/legacy-2007-spring-pm-06-09-specs';
import { compoundAnswerSignature, gradeAnswer, validateAnswerDefinition } from '../../../src/core/answers';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2007SpringPm0609Figures as figures } from '../../../src/core/generators/legacy-2007-spring-pm-06-09-figures';
import type { Attribution, Block, Question } from '../../../src/core/types';
import { legacy2007SpringPm0609FigureRenderers as renderers } from '../../../src/ui/Legacy2007SpringPm0609Figures';
import { prepareSymmetry, runVoteProgram, type Vote } from '../../fixtures/legacy-2007-spring-pm-06-09-oracle';

const indices = [0, 1, 2, 3];
const question = (number: number, index: number) => specs[number - 6].definition.build([index]);
const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const fill = (text: string, answers: readonly string[]) => text.replaceAll(/［([a-d])］/g, (_, part:string) => answers[part.charCodeAt(0) - 97]);
const listing = (body: GeneratedBody, language: string) => body.prompt.flatMap(block =>
  block.type === 'code' && block.language === language ? [block.text] : []);
const prose = (body: GeneratedBody) => body.prompt.flatMap(block => block.type === 'paragraph' ? [block.text] : []).join('\n');
function figure(body: GeneratedBody, suffix: string) {
  const found = body.prompt.find(block => block.type === 'diagram' && block.scene.kind === 'source_figure' &&
    block.scene.profile.endsWith('-' + suffix));
  assert(found?.type === 'diagram' && found.scene.kind === 'source_figure');
  return found;
}
const choices = (body: GeneratedBody, part: number) => body.answerParts![part].choiceIds.map(id => {
  const [item] = body.choices[Number(id.split('-').at(-1)) - 1];
  return item;
});
function text(block: Block) {
  assert(block.type === 'code' || block.type === 'paragraph');
  return block.text;
}
function key(body: GeneratedBody, field: number) {
  const answer = body.partAnswers![field];
  assert.equal(answer.kind,'choice');
  return body.answerParts![field].choiceIds.indexOf(answer.choiceId);
}
const answers = (body: GeneratedBody, fields: number) => Array.from({ length: fields }, (_, part) => text(choices(body, part)[key(body, part)]));
const replace = (all: readonly string[], index: number, value: string) => all.map((item, i) => i === index ? value : item);
function only(body: GeneratedBody, field: number, works: (item: Block) => boolean) {
  assert.deepEqual(choices(body,field).flatMap((item,i)=>works(item)?[i]:[]),[key(body,field)]);
}

test('4大問の公式12頁、16の欄、全択と原文の記号・順序・付属資料を照合する',()=>{
  const pages = [[22,23,24,25],[26,27,28],[29,30,31],[32,33]];
  const official = ['アエウエ','ウアオオ','エアイウ','エオイウ'];
  const count = [[8,8,5,5],[5,5,5,5],[4,4,4,4],[6,6,4,4]];
  assert.deepEqual(specs.map(spec => spec.number),[6,7,8,9]);
  for (const [i,spec] of specs.entries()) {
    assert.deepEqual(spec.pages,pages[i]);
    assert.equal(spec.original.answerParts!.map((_,field)=>'アイウエオカキク'[key(spec.original,field)]).join(''), official[i]);
    assert.deepEqual(spec.original.answerParts!.map(part=>part.choiceIds.length),count[i]);
    for(const alt of Object.values(spec.originalPageAlt)) assert(alt.length>100 && alt.length<=2000);
  }
  assert.match(specs[0].originalPageAlt[24], /void main\(\)[\s\S]*while\(\(curpos\[playerid\] < CELLS - 1\) && \(［a］\)/);
  assert.match(specs[0].originalPageAlt[25], /設問1[\s\S]*a，bに関する解答群[\s\S]*cに関する解答群[\s\S]*設問2/);
  assert.match(specs[1].originalPageAlt[27], /SEARCH S-TBL VARYING S-IDX[\s\S]*WHEN S-KOHOSHA-MEI\(S-IDX\)/);
  assert.match(specs[1].originalPageAlt[28], /設問1[\s\S]*オ　MOVE S-TBL\(W-J\) TO S-TBL\(W-I\)[\s\S]*設問2[\s\S]*候補者名/);
  assert.match(specs[2].originalPageAlt[30], /class ValueComparator implements ［a］[\s\S]*for \(int i = 0; ［b］; i\+\+\)/);
  assert.match(specs[2].originalPageAlt[31], /December", "July", "DEC", "June", "April", "May/);
  assert.match(specs[3].originalPageAlt[33], /設問1[\s\S]*JPL[\s\S]*設問2[\s\S]*0 0 0 0 0 0 0 0[\s\S]*設問3[\s\S]*▲/);
  assert(specs[2].original.contexts?.flatMap(context=>context.blocks).every(block=>block.type!=='image'));
  assert.deepEqual(specs[3].definition.fixedReferenceAssetIds,['055','056','057-casl-excerpt','058','059','060']
    .map(p=>'asset-ipa-2007h19h-fe-pm-page-'+p));
});

test('4条件の本文・正答署名・選択欄は安定し、全欄の別候補を誤答として採点する',()=>{
  const attribution: Attribution = { origin:'original',sourceRefs:[],rightsRefs:['rights-original'],creatorIds:['codex'] };
  for (const { definition } of specs) {
    assert.deepEqual(definition.reference,[0]);
    assert.deepEqual(definition.fields.map(field=>[field.minimum,field.maximum]),[[0,3]]);
    for(const bad of [[],[-1],[4],[0,1],[0.5],[NaN],Array<number>(1),Object.assign([0],{other:true})])
      assert.throws(()=>definition.build(bad),{code:'PARAMETER_CONSTRAINT'});
    const rendered = new Set(), signatures = new Set();
    const blockForm=definition.build([0]).prompt.map(block=>block.type);
    for(const index of indices){
      const body=definition.build([index]);
      assert.deepEqual(body,definition.build([index]));
      assert.deepEqual(body.prompt.map(block=>block.type),blockForm);
      rendered.add(JSON.stringify(body.prompt));
      const q={ id:definition.source,answerParts:body.answerParts,correctAnswer:{parts:body.partAnswers,attribution},
        choices:body.choices.map((blocks,i)=>({id:'choice-value-'+(i+1),content:{blocks,attribution}})) } as Question;
      validateAnswerDefinition(q);
      signatures.add(compoundAnswerSignature(q));
      const selected=Object.fromEntries(body.partAnswers!.map(part=>{assert.equal(part.kind,'choice');return [part.partId,part.choiceId];}));
      assert.equal(gradeAnswer(q,{selectedPartChoices:selected}).outcome,'correct');
      body.answerParts!.forEach(part=>{
        for(const choiceId of part.choiceIds.filter(id=>id!==selected[part.id]))
          assert.equal(gradeAnswer(q,{selectedPartChoices:{...selected,[part.id]:choiceId}}).outcome,'incorrect');
      });
    }
    assert.equal(rendered.size,4);
    assert.equal(signatures.size,4);
  }
});

const boards = [
  { players:4,moves:[[3,9],[5,0],[7,0],[8,2],[19,0],[21,6]],rest:[9,15] },
  { players:3,moves:[[3,8],[5,0],[7,0],[8,4],[19,0],[21,6]],rest:[9,14] },
  { players:5,moves:[[3,9],[5,0],[7,0],[8,4],[19,0],[21,1]],rest:[9,15] },
  { players:6,moves:[[3,7],[5,0],[7,0],[8,2],[19,0],[21,6]],rest:[9,16] },
];
const diceScripts = [
  [3,4,9,2,12,8,4,4,2,7,6,6],
  [12,12,12,12,12,12,11,12,12,12,12,12,9],
  [2,5,7,9,8,5,9,3,12,12,11,8,4,12,10],
  [9,5,3,6,15-3,3,6,5,6,3,11,12,9],
];
function boardTrace(board: typeof boards[number], seed: readonly number[], extra?: { cell: number; rolls: number }) {
  const position = Array<number>(board.players).fill(0), resting = new Set<number>();
  const move = new Map(board.moves.map(([from,to])=>[from,to]));
  let shift=0;
  const roll=(player:number)=>{
    const value=seed[shift++] ?? 12;
    return {value,output:'D '+player+' '+value};
  };
  const output:string[] = [];
  for(let round=0; round<300; round++) {
    const player=round%board.players;
    if(resting.delete(player)) continue;
    const play=roll(player);
    output.push(play.output);
    position[player]+=play.value;
    output.push('P '+player+' '+position[player]);
    for(let activity=0;activity<50;activity++){
      const current=position[player];
      if(current>=23) return [...output,'WIN '+player].join('\n');
      if(board.rest.includes(current)){resting.add(player);break;}
      if(extra?.cell===current){
        for(let i=0;i<extra.rolls;i++){const d=roll(player);output.push(d.output);position[player]+=d.value;}
      }else if(move.has(current)) position[player]=move.get(current)!;
      else break;
      output.push('P '+player+' '+position[player]);
    }
  }
  throw Error('No board winner');
}
function runC(folder:string, source:string, scripts: readonly number[][]){
  const fixture=`
static int next_roll = 0;
int dice(int playerid) {
   if (next_roll++ > 300) exit(69);
   const char *candidate = getenv("DICE");
   int value = 12, roll = 0;
   while (candidate && *candidate && roll < next_roll) {
      char *end;
      value = (int) strtol(candidate, &end, 10);
      if (end == candidate) exit(70);
      candidate = *end ? end + 1 : end;
      roll++;
   }
   if (roll < next_roll) value = 12;
   printf("D %d %d\\n", playerid, value);
   return value;
}
void prtpiece(int playerid) {
   printf("P %d %d\\n", playerid, curpos[playerid]);
}
`;
  writeFileSync(join(folder,'board.c'),'#include <stdlib.h>\n'+source+fixture);
  const build=spawnSync('cc',['-std=c17','-fsanitize=undefined','-fno-sanitize-recover=all','board.c','-o','board'],
    {cwd:folder,encoding:'utf8',timeout:15000});
  assert.ifError(build.error);
  if(build.status!==0) return null;
  const result:string[]=[];
  for(const input of scripts){
    const run=spawnSync('./board',[],{cwd:folder,env:{...process.env,DICE:input.join(',')},encoding:'utf8',timeout:1000,maxBuffer:120000});
    if(run.status!==0 || run.stderr) return null;
    result.push(run.stdout.trim().split('\n').slice(1).map(value=>value.replace(/^プレーヤID:(\d+)の勝ちです。$/,'WIN $1')).join('\n'));
  }
  return result;
}

test('問6を標準Cの入口で実行し、全候補を手番・連鎖・休み・勝利境界・追加のサイコロから検算する',()=>{
  const folder=mkdtempSync(join(tmpdir(),'opencbt-2007-spring-c-'));
  try{
    for(const index of indices){
      const body=question(6,index), candidate=answers(body,4), [,,main,extension]=listing(body,'c');
      assert.match(main,/int main\(void\)/);
      assert.match(prose(body),new RegExp('プレーヤは，'+boards[index].players+'人'));
      assert.match(prose(body),/ゴールを超えた位置では升の配列を参照せず/);
      const expected=diceScripts.map(seed=>boardTrace(boards[index],seed));
      assert.deepEqual(runC(folder,fill(main,candidate),diceScripts),expected,'C original candidates check '+index);
      for(const part of [0,1,2]) only(body,part, block=>same(runC(folder,fill(main,replace(candidate,part,text(block))),diceScripts),expected));
      const extra={cell:11,rolls:index+1};
      const extraScripts=[[11,2,5,7,9,3,3,3,12,12,11,2],[11,12,3,4,12,7,9,3,12,11]];
      const tests=extraScripts.map(seed=>boardTrace(boards[index],seed,extra));
      const enhanced=main.replace(/(static int actype\[CELLS\] = \{ )([\d, ]+)/,(_,lead:string,row:string)=>{
        const cells=row.split(', '); cells[11]='3'; return lead+cells.join(', ')+',';
      }).replace(/(playmode\[playerid\] = WAIT;\n                  break;)/,'$1\n               '+extension);
      only(body,3,block=>same(runC(folder,fill(enhanced,replace(candidate,3,text(block))),extraScripts),tests));
    }
    const original=listing(specs[0].original,'c')[2].replace('void main()', 'int main(void)');
    assert.deepEqual(runC(folder,fill(original,answers(specs[0].original,4)),diceScripts),diceScripts.map(seed=>boardTrace(boards[0],seed)));
  } finally { rmSync(folder,{recursive:true,force:true}); }
});

function unpack(table:Block):Vote[]{
  assert(table.type==='table');
  assert.deepEqual(table.columns,['地区コード','候補者名','得票数']);
  assert.equal(table.rows.length,6);
  return table.rows.map(([area,name,votes])=>[area,name,Number(votes)]);
}
test('問7を得票の集約とソートの独立解、五つのファイルの命令網羅で照合する',()=>{
  const commandPatterns=[/AT END\s+ADD 1 TO S-MAX/,/WHEN S-KOHOSHA-MEI\(S-IDX\) = K-KOHOSHA-MEI/,/MOVE S-TBL\(W-I\) TO W-TBL/];
  for(const index of indices){
    const body=question(7,index), selected=answers(body,3),[decl,program]=listing(body,'cobol');
    const direction=program.match(/IF S-TOKUHYO-SU\(W-I\) ([<>]) S-TOKUHYO-SU\(W-J\)/)![1] as '<'|'>';
    commandPatterns.forEach(pattern=>assert.match(program,pattern));
    assert.match(decl,new RegExp('OCCURS 0 TO '+[50,45,60,55][index]));
    const runs=choices(body,3).map(unpack);
    const stress:Vote[]=[['AAAAAA','A',100],['AAAAAA','B',500],['BBBBBB','A',30],['BBBBBB','C',600],['CCCCCC','B',7]];
    const expected=(rows:Vote[])=>{
      const unique=[...new Set(rows.map(row=>row[1]))];
      return unique.map(name=>[name,rows.filter(row=>row[1]===name).reduce((sum,row)=>sum+row[2],0)] as const);
    };
    for(const part of [0,1,2]) only(body,part, block=>[...runs,stress].every(rows=>{
      try{
        const {outputs}=runVoteProgram(rows,direction,replace(selected,part,text(block)));
        const sorted=direction==='<'?(a:number,b:number)=>b-a:(a:number,b:number)=>a-b;
        const oracle=expected(rows);
        return same(outputs.map(row=>row[1]),oracle.map(row=>row[1]).sort(sorted)) &&
          same([...outputs].sort(([a],[b])=>a.localeCompare(b)),[...oracle].sort(([a],[b])=>a.localeCompare(b)));
      }catch{return false;}
    }));
    only(body,3,block=>{
      const rows=unpack(block), values=expected(rows).map(row=>row[1]);
      const matched=rows.length>values.length;
      const swap=values.some((value,i)=>values.slice(i+1).some(other=>direction==='<'?other>value:other<value));
      const {visited}=runVoteProgram(rows,direction, selected);
      assert.equal(visited.includes(2),matched);
      assert.equal(visited.includes(3),swap);
      return rows.length>0 && matched && swap;
    });
  }
});

const englishMonths='January February March April May June July August September October November December'.split(' ');
const arrayString=(values:readonly string[])=>'['+values.join(', ')+']';
function monthOracle(data:string[], descending:boolean){
  const lower=(value:string)=>value.toLowerCase();
  const ordinal=(value:string)=>englishMonths.findIndex(month=>lower(month).startsWith(lower(value)));
  const stable=data.map((name,index)=>({name,index}));
  const byName=[...stable].sort((a,b)=>lower(a.name)===lower(b.name)?a.index-b.index:lower(a.name)<lower(b.name)?-1:1).map(item=>item.name);
  const byNumber=[...stable].sort((a,b)=>(descending?-1:1)*(ordinal(a.name)-ordinal(b.name))||a.index-b.index).map(item=>item.name);
  return [arrayString(data),arrayString(byName),arrayString(byNumber)].join('\n');
}
const monthProbe=`import java.util.*;
public class Probe {
    public static void main(String[] args) {
        String[] data=args.clone();
        System.out.println(Arrays.toString(data));
        Arrays.sort(data,new NameComparator());
        System.out.println(Arrays.toString(data));
        data=args.clone();
        Arrays.sort(data,new ValueComparator());
        System.out.println(Arrays.toString(data));
    }
}`;
function runJava(folder:string, name:string, value:string, main:string, inputs:string[]){
  for(const [id, source] of Object.entries({NameComparator:name,ValueComparator:value,MonthNameSorter:main,Probe:monthProbe}))
    writeFileSync(join(folder,id+'.java'),source);
  const built=spawnSync('javac',['-encoding','UTF-8','--release','8','NameComparator.java','ValueComparator.java','MonthNameSorter.java','Probe.java'],
    {cwd:folder,encoding:'utf8',timeout:20000});
  assert.ifError(built.error);
  if(built.status!==0) return null;
  return [['MonthNameSorter'],['Probe',...inputs]].map(args=>{
    const run=spawnSync('java',['-cp',folder,...args],{cwd:folder,encoding:'utf8',timeout:15000});
    assert.ifError(run.error);
    return run.status===0&&!run.stderr?run.stdout.trimEnd():null;
  });
}
test('問8をJava 8互換で実行し、各欄の候補、12か月と略記、同月の安定性を照合する',()=>{
  const folder=mkdtempSync(join(tmpdir(),'opencbt-2007-spring-month-'));
  const probe=englishMonths.flatMap((month,i)=>[month.toUpperCase(),i%2?month.slice(0,3).toLowerCase():month.slice(0,3)]).reverse();
  try{
    for(const index of indices){
      const body=question(8,index),[signature,name,value,main]=listing(body,'java'),selected=answers(body,4);
      assert.match(signature,/Arrays.sort\(Object\[\], java.util.Comparator\)/);
      const names=[...main.matchAll(/"([A-Za-z]+)"/g)].map(result=>result[1]);
      const need=[monthOracle(names,index===1||index===2),monthOracle(probe,index===1||index===2)];
      assert.equal(figure(body,'8-output').alt,need[0]);
      for(const part of [0,1,2,3]) only(body,part,block=>{
        const candidate=replace(selected,part,text(block));
        return same(runJava(folder,name,fill(value,candidate),fill(main,candidate),probe),need);
      });
    }
  }finally{rmSync(folder,{recursive:true,force:true});}
});

const bitString=(n:number)=>n.toString(2).padStart(16,'0');
const oneWord=(alt:string)=>Number.parseInt(alt.split('。')[0].replaceAll(/[^01]/g,''),2);
function symmetryOracle(word:number){
  const bits=bitString(word);
  let count=0;
  for(let i=0;i<8;i++){
    if(bits[i]==='1') count++;
    if(bits[i]!==bits[15-i]) return {symmetric:0,beforeRestore:word>>>(i+1),line10:count};
  }
  return {symmetric:1,beforeRestore:word>>>8,line10:count};
}
test('問9は全36分岐組を比較し、全65536語で対称性・RPOP直前・行10回数を照合する',()=>{
  for(const index of indices){
    const body=question(9,index),[program]=listing(body,'casl2'),selected=answers(body,4);
    const sample=oneWord(figure(body,'9-symmetric').alt), mismatch=oneWord(figure(body,'9-asymmetric').alt);
    const probes=[0,1,2,3,32768,32769,65535,0x3141,0xAEE7,0xb5ad,sample,mismatch];
    const branches=choices(body,0).flatMap(a=>choices(body,1).map(b=>[text(a),text(b)]));
    assert.equal(branches.length,36);
    assert.deepEqual(branches.filter(pair=>{
      try{const run=prepareSymmetry(fill(program,pair));return probes.every(input=>same(run(input),symmetryOracle(input)));}
      catch{return false;}
    }),[selected.slice(0,2)]);
    const run=prepareSymmetry(fill(program,selected));
    if(index===0) for(let word=0;word<65536;word++) assert.deepEqual(run(word),symmetryOracle(word));
    else assert.deepEqual(probes.map(run),probes.map(symmetryOracle));
    assert.equal(run(sample).symmetric,1);
    assert.equal(run(mismatch).symmetric,0);
    only(body,2,block=>oneWord(text(block))===symmetryOracle(sample).beforeRestore);
    only(body,3,block=>Number(text(block))===symmetryOracle(mismatch).line10);
  }
});

test('6種の24図状態の図形・表・位置と読み上げを保持する',()=>{
  assert.deepEqual(figures.map(item=>item.profile),renderers.map(item=>item.profile));
  let count=0;
  for(const index of indices) for(const {definition} of specs) for(const block of definition.build([index]).prompt){
    if(block.type!=='diagram'||block.scene.kind!=='source_figure') continue;
    const {profile,values}=block.scene;
    const checker=figures.find(item=>item.profile===profile)!;
    const renderer=renderers.find(item=>item.profile===profile)!;
    assert.equal(checker.alt(values),block.alt);
    assert.doesNotThrow(()=>checker.validate(values));
    assert.throws(()=>checker.validate([4]),{code:'PARAMETER_CONSTRAINT'});
    const html=renderToStaticMarkup(createElement(renderer.component,{values,caption:block.caption}));
    assert.match(html,/role="group".*aria-description=/);
    assert.match(html,/class="diagram-scroll" tabindex="0"/);
    if(profile.endsWith('6-course')){
      assert.equal([...html.matchAll(/<rect /g)].length,15);
      assert.match(html,/marker-end=/);
    }
    if(profile.endsWith('9-asymmetric')) assert.equal([...html.matchAll(/>▲<\/span>/g)].length,2);
    count++;
  }
  assert.equal(count,24);
});
