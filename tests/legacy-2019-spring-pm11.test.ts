import{spring2019TemporaryDirectory,writeSpring2019Evidence}from'./fixtures/legacy-2019-spring-test-workspace';
import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import path from'node:path';import{spawnSync}from'node:child_process';import{createElement as h}from'react';import{renderToStaticMarkup}from'react-dom/server';
import{legacy2019SpringPm11Definition as definition}from'../src/core/generators/legacy-2019-spring-pm11';
import{spring2019Pm11Maze as maze,spring2019Pm11Walk as walk,spring2019Pm11Programs as programs,spring2019Pm11Figure as model}from'../src/core/generators/legacy-2019-spring-pm11-model';
import{Legacy2019SpringPm11Figure as Figure}from'../src/ui/Legacy2019SpringPm11Figure';
import goldPrograms from'./fixtures/legacy-2019-spring-pm11-source-programs.json';
const names=['NORTH','EAST','SOUTH','WEST'];const sourceMaze=['*******','*..*..*','*S**.**','*.....*','*****.*','*G....*','*******'];
const sourceReduced=['SOUTH','EAST','EAST','EAST','EAST','SOUTH','SOUTH','WEST','WEST','WEST','WEST'];
function referenceMaze(a:number,b:number){const pass=new Set(['1,2','1,3','2,3','3,3','4,3','5,3','5,4','1,5','2,5','3,5','4,5','5,5']);if(a>=1)pass.add('1,1');if(a>=2)pass.add('2,1');if(b>=1)pass.add('4,2');if(b>=2)pass.add('4,1');if(b>=3)pass.add('5,1');return Array.from({length:7},(_,y)=>Array.from({length:7},(_,x)=>x===1&&y===2?'S':x===1&&y===5?'G':pass.has(`${x},${y}`)?'.':'*').join(''));}
function referenceHistory(rows:string[]){let point=[1,2],heading=[0,-1],history:string[]=[];for(let n=0;n<64;n++){if(rows[point[1]][point[0]]==='G')return history;const [dx,dy]=heading,options=[[dy,-dx],[dx,dy],[-dy,dx],[-dx,-dy]];const next=options.find(([x,y])=>rows[point[1]+y][point[0]+x]!=='*');assert(next);point=[point[0]+next[0],point[1]+next[1]];heading=next;history.push(names[next[0]===1?1:next[0]===-1?3:next[1]===1?2:0]);}throw Error('independent maze stalled');}
const values=Array.from({length:3},(_,a)=>Array.from({length:4},(_,b)=>[a,b])).flat();
const right={a:'*',b:'%',c:'location.x + direction.dx, location.y + direction.dy',d:'(ordinal() + 3) % 4',e:'1',f:'i - 1'};type Fill=typeof right;
const temporary=spring2019TemporaryDirectory('java-q11');let compiled=0,executed=0;const checks:unknown[]=[];
const probe=(rows:string[])=>String.raw`import java.util.*;
public class ContractProbe {
  public static void main(String[] args) {
    String data = "${rows.join('')}";
    Maze maze = new Maze(data, 7);
    if (maze.getStartLocation().x != 1 || maze.getStartLocation().y != 2) throw new AssertionError("start");
    for (int y=0; y<7; y++) for (int x=0; x<7; x++) {
      Location p = new Location(x,y);
      if (maze.isBlank(p) != (data.charAt(y*7+x)!='*')) throw new AssertionError("blank");
      if (maze.isGoal(p) != (x==1&&y==5)) throw new AssertionError("goal");
    }
    Direction[] ds=Direction.values();
    for(int i=0;i<4;i++) {
      if(ds[i].left()!=ds[(i+3)%4] || ds[i].right()!=ds[(i+1)%4]) throw new AssertionError("direction");
    }
    Piece p=new Piece(maze);p.turnRight();p.turnRight();
    if(!p.tryStepForward()) throw new AssertionError("step");
    List<Direction> copy=p.getHistory();if(copy.size()!=1||copy.get(0)!=Direction.SOUTH) throw new AssertionError("history");
    copy.remove(0);if(p.getHistory().size()!=1) throw new AssertionError("copy");
    System.out.println("OK");
  }
}`;
function compile(v:number[],fill:Fill,reduced:boolean,stress=false){const dir=path.join(temporary,'case-'+compiled++);fs.mkdirSync(dir,{recursive:true});const texts=programs(v).map(s=>s.replace(/［([a-f])］/g,(_,k)=>fill[k as keyof Fill])),classNames=['Maze','Piece','Direction','Location','PlayMaze'];let play=texts[4].replace(/^α$/m,reduced?texts[5]:'');
 play=play.replace('Piece piece = new Piece(maze);','Piece piece = new Piece(maze);\n        int testSteps=0, testTurns=0;').replace('while (!piece.isAtGoal()) {','while (!piece.isAtGoal()) {\n            if(++testSteps>128)throw new AssertionError("guard");').replace('while (!piece.tryStepForward()) {','while (!piece.tryStepForward()) {\n                if(++testTurns>512)throw new AssertionError("turn guard");');texts[4]=play;
 classNames.forEach((name,i)=>fs.writeFileSync(path.join(dir,name+'.java'),texts[i]));fs.writeFileSync(path.join(dir,'ContractProbe.java'),probe(referenceMaze(v[0],v[1])));
 const extra=stress?String.raw`import java.util.*;
public class ReductionProbe {
  static int count=0;
  static List<Direction> actual(List<Direction> input) {
    List<Direction> history = new ArrayList<>(input);
    ${texts[5]}
    return history;
  }
  static void visit(List<Direction> input) {
    List<Direction> expected=new ArrayList<>();
    for(Direction d:input) {
      if(!expected.isEmpty() && (expected.get(expected.size()-1).ordinal()+2)%4==d.ordinal())expected.remove(expected.size()-1);else expected.add(d);
    }
    if(!actual(input).equals(expected))throw new AssertionError(input.toString());
    count++;
    if(input.size()<7)for(Direction d:Direction.values()){input.add(d);visit(input);input.remove(input.size()-1);}
  }
  public static void main(String[] args){visit(new ArrayList<Direction>());System.out.println(count);}
}`:null;
 if(extra)fs.writeFileSync(path.join(dir,'ReductionProbe.java'),extra);
 const sourceNames=[...classNames,'ContractProbe',...(stress?['ReductionProbe']:[])].map(n=>path.join(dir,n+'.java'));
 const result=spawnSync('javac',['--release','8','-encoding','UTF-8','-d',dir,...sourceNames],{encoding:'utf8',timeout:20000});return{dir,result};
}
function run(dir:string,name='PlayMaze'){executed++;return spawnSync('java',['-cp',dir,name],{encoding:'utf8',timeout:3000});}
const output=(history:string[])=>'['+history.join(', ')+']\n';
test('Q11 all12 actual maze literals/figures and traversal work follow independent graph/heading oracles; the original reference is [2,3]',()=>{assert.deepEqual(maze([2,3]),sourceMaze);let signatures=new Set<string>();for(const v of values){const b=definition.build(v),rows=referenceMaze(v[0],v[1]),history=referenceHistory(rows);assert.deepEqual(maze(v),rows);assert.deepEqual(walk(v).moves.map(i=>names[i]),history);assert.deepEqual(walk(v).reduced.map(i=>names[i]),sourceReduced);assert.equal(history.length,11+2*(v[0]+v[1]));signatures.add(JSON.stringify(rows));assert.equal(b.choices.length,22);assert.deepEqual(b.answerParts!.map(p=>p.choiceIds.length),[8,8,4,4,3,3]);assert.deepEqual(b.answerParts![0].choiceIds,b.answerParts![1].choiceIds);assert.equal(b.answerParts!.length,6);assert.equal(b.partAnswers!.length,6);assert.equal(b.answerParts!.reduce((n,p)=>n+p.choiceIds.length,0),30);const source=b.prompt.filter(p=>p.type==='paragraph').map(p=>p.text).join('\n');for(const t of['非負整数','char型','引数に誤りはない','外周は壁','最初は，開始地点','北を向いている','それ以外はfalse','正反対','1升ずつ'])assert(source.includes(t),t);const play=programs(v)[4];for(const row of rows)assert(play.includes('"'+row+'"'));}assert.equal(signatures.size,12);assert.equal(definition.answerVariation,'fixed');});
test('Q11 every native maze49cells/legend and all source program text/blanks/alpha marker are visible and exact across all12 inputs',()=>{let cells=0;for(const v of values){const rows=referenceMaze(v[0],v[1]);const html=renderToStaticMarkup(h(Figure,{profile:'legacy-2019-spring-pm11-maze',values:[...v,0],caption:'図1 本問で扱う迷路'}));const found=[...html.matchAll(/data-maze-cell="(\d),(\d)" data-maze-kind="([^"]+)"/g)];assert.equal(found.length,49);for(const c of found){const cell=rows[Number(c[2])][Number(c[1])];assert.equal(c[3],cell==='*'?'wall':cell);cells++;}for(const t of['通路','壁','開始地点','ゴール地点','東','西','南','北'])assert(html.includes(t));for(let group=0;group<6;group++){const m=model('legacy-2019-spring-pm11-program',[...v,group]);assert(m.kind==='program');const s=renderToStaticMarkup(h(Figure,{profile:'legacy-2019-spring-pm11-program',values:[...v,group],caption:'プログラム'}));const pre=s.match(/<pre>([\s\S]*?)<\/pre>/)![1].replace(/<span[^>]*data-source-blank="([a-f])"[^>]*>[a-f]<\/span>/g,'［$1］').replace(/<span[^>]*data-source-insertion="alpha"[^>]*>← α<\/span>/g,'α').replace(/<[^>]*>/g,'').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&').replaceAll('&#x27;',"'").replaceAll('&quot;','"');assert.equal(pre,m.text);if(group===4)assert(s.indexOf('data-source-insertion')>s.indexOf('List&lt;Direction&gt; history'));}}assert.equal(cells,588);});
test('Q11 all6 full programs/control/non-hole text/comments/blank roles retain the independent original transcription; only the bound maze region varies',()=>{const normalize=(s:string)=>s.replace(/\s/g,'');for(const v of values)for(let i=0;i<6;i++){let text=programs(v)[i];assert.deepEqual([...text.matchAll(/［([a-f])］/g)].map(m=>m[1]),goldPrograms.holeSequences[i]);if(i===4){const part=text.match(/Maze maze = new Maze\(([\s\S]*?), 7\);/);assert(part);assert.deepEqual([...part[1].matchAll(/"([^"]*)"/g)].map(m=>m[1]),referenceMaze(v[0],v[1]));text=text.replace(part[0],'Maze maze = new Maze(@ROWS@, 7);');}assert.deepEqual(text.split('\n').filter(s=>s.trim()).map(normalize),goldPrograms.programs[i].map(normalize));}});
test('Q11 Java8 actual five classes and inserted source reducer match all12 independent raw/reduced histories and API/control facts',()=>{for(const v of values)for(const reduced of[false,true]){const c=compile(v,right,reduced);assert.equal(c.result.status,0,c.result.stderr);const result=run(c.dir);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,output(reduced?sourceReduced:referenceHistory(referenceMaze(v[0],v[1]))));const contract=run(c.dir,'ContractProbe');assert.equal(contract.status,0,contract.stderr);assert.equal(contract.stdout,'OK\n');} });
test('Q11 all30 option references have unique independent Java truth or compile/runtime/semantic counterexample, including left wrap and both remove calls',()=>{const b=definition.build([2,3]);let refs=0;for(let part=0;part<6;part++){const key='abcdef'[part]as keyof Fill,t=[];for(const id of b.answerParts![part].choiceIds){const option=b.choices[Number(id.replace('choice-value-',''))-1][0];assert(option.type==='paragraph');const fill={...right,[key]:option.text},reduced=part>=4,c=compile([2,3],fill,reduced);let valid=c.result.status===0,reason=valid?'':'compile';if(valid){const result=run(c.dir),expected=output(reduced?sourceReduced:referenceHistory(sourceMaze));if(result.status!==0||result.stdout!==expected){valid=false;reason=result.status!==0?'runtime':'history';}if(valid){const probe=run(c.dir,'ContractProbe');if(probe.status!==0||probe.stdout!=='OK\n'){valid=false;reason='API/control';}}}t.push(valid);checks.push({part:key,choiceId:id,option:option.text,valid,counterexample:valid?null:{maze:sourceMaze,reason,compileDiagnostic:c.result.status===0?null:c.result.stderr}});refs++;}assert.equal(t.filter(Boolean).length,1,`${key} ${t}`);const a=b.partAnswers![part];assert(a.kind==='choice');assert.equal(b.answerParts![part].choiceIds.indexOf(a.choiceId),t.indexOf(true));}assert.equal(refs,30);writeSpring2019Evidence('q11-option-witnesses.json',JSON.stringify({scope:'12 generated mazes separately verified; all30 option references here use explicit original maze and independent API/heading probes',compiled,executed,checks},null,2)+'\n');});
test('Q11 source adjacent-opposite deletion handles all21845 direction words up to length7 as independent algebra stress, not additional generated inputs',()=>{const c=compile([2,3],right,true,true);assert.equal(c.result.status,0,c.result.stderr);const result=run(c.dir,'ReductionProbe');assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'21845\n');});
test('Q11 all managed profiles reject unknown/wrong arity/noninteger/out-of-domain fields and groups',()=>{for(const p of['maze','program','bank','history'])for(const v of[[],[2,3],[-1,0,0],[3,0,0],[0,4,0],[0,.5,0],[NaN,0,0],[0,0,-1],[0,0,99]])assert.throws(()=>model('legacy-2019-spring-pm11-'+p,v));assert.throws(()=>model('legacy-2019-spring-pm11-unknown',[0,0,0]));});

test('Q11 inserted reducer retains a nonempty accessible name without adding a visible source caption',()=>{const b=definition.build([2,3]),block=b.prompt.find(x=>x.type==='diagram'&&x.scene.kind==='source_figure'&&x.scene.profile==='legacy-2019-spring-pm11-program'&&x.scene.values[2]===5);assert(block?.type==='diagram');assert.equal(block.caption,'プログラム5へ挿入する処理');assert.equal(block.captionPresentation,'accessible');const html=renderToStaticMarkup(h(Figure,{profile:'legacy-2019-spring-pm11-program',values:[2,3,5],caption:block.caption}));assert(!html.includes('<p>'));assert(html.includes('data-source-blank="e"'));});
