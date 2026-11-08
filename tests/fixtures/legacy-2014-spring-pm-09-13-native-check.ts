import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { legacy2014SpringPm9Definition as c,legacy2014SpringPm11Definition as java } from '../../src/core/generators/legacy-2014-spring-pm-09-13';
import { cExamples, codeBlocks, complete, javaInputs, javaReference } from './legacy-2014-spring-pm-09-13-displayed';

const root=mkdtempSync(join(tmpdir(),'ipa-2014-spring-9-13-'));
const write=(name:string,data:string)=>writeFileSync(join(root,name),data);
const run=(command:string,args:string[])=>execFileSync(command,args,{cwd:root,encoding:'utf8',timeout:15000});
try{
  const cc=run('cc',['--version']).split('\n')[0],javac=run('javac',['-version']).trim();
  const functions:string[]=[], javaFiles:string[]=[];
  const cRuns:{fn:string;input:string;output:string;width:number}[]=[];
  const javaRuns:{pkg:string;lines:string[]}[]=[];
  for(let index=0;index<8;index++){
    const cBody=c.build([index]);
    const [source]=codeBlocks(cBody,'c');
    const {width,edits,examples}=cExamples(cBody);
    for(const [modified,example] of examples.entries()){
      const filename='format_text_'+index+'_'+modified;
      const patches=modified?new Map<number,string>([[8,edits[0][1]],[26,edits[1][1]],[28,edits[2][1]],[34,edits[3][1]]]):new Map();
      const code=source.split('\n').map(line=>{
        const [,label,code]=/^\s*(\d+) (.*)$/.exec(line)!;
        return code+(patches.has(Number(label))?'\n'+patches.get(Number(label)):'');
      }).join('\n');
      functions.push(complete(code,cBody).replaceAll('format_text',filename));
      cRuns.push({fn:filename,...example,width});
      if(index===0)for(const [input,output] of [
        ['',''],['\n','\n'],['end',modified?' end':'end'],
        [' '.repeat(width+2),modified?'':' '.repeat(width)+'\n  '],
        ['First.'+' '.repeat(width-6)+'\nNext.\n',modified?' First.'+' '.repeat(width-7)+'\n\n Next.\n':'First.'+' '.repeat(width-6)+'\nNext.\n'],
      ])cRuns.push({fn:filename,input,output,width});
    }

    const javaBody=java.build([index]),{articles,changed}=javaInputs(javaBody);
    const classes=codeBlocks(javaBody,'java').join('\n');
    const imports=classes.match(/^import [^;]+;/gm)!.join('\n');
    const body=complete(classes.replaceAll(/^import [^;]+;\n?/gm,''),javaBody);
    for(const modified of [false,true]){
      const pkg='question_'+index+'_'+(modified?'changed':'initial');
      const changedFlag=new RegExp('(Article.create\\("'+changed+'", [^\\n]+), true\\);');
      const compiled=modified?body.replace(changedFlag,'$1, false);'):body;
      if(modified)assert.notEqual(compiled,body);
      mkdirSync(join(root,pkg));
      const javaFile=pkg+'/SubscriptionSite.java';
      write(javaFile,'package '+pkg+';\n'+imports+'\n'+compiled);
      javaFiles.push(javaFile);
      javaRuns.push({pkg,lines:javaReference(articles,modified?changed:undefined)});
    }
  }
  const calls=cRuns.map(({fn,width},i)=>`case ${i}: ${fn}(argv[2], argv[3], ${width}); return 0;`).join('\n');
  write('question.c','#include <stdlib.h>\n'+functions.join('\n')+`\nint main(int argc, char **argv) {
  if (argc != 4) return 2;
  switch (atoi(argv[1])) {
    ${calls}
    default: return 3;
  }
}\n`);
  run('cc',['-std=c11','-Wall','-Wextra','-Werror','question.c','-o','question']);
  for(const [i,{input,output}] of cRuns.entries()){
    write('Input',input);
    run('./question',[String(i),'Input','Output']);
    assert.equal(readFileSync(join(root,'Output'),'utf8'),output,'C11 run '+i);
  }
  run('javac',['--release','8','-Xlint:-options','-encoding','UTF-8',...javaFiles]);
  for(const {pkg,lines} of javaRuns)
    assert.equal(run('java',['-Duser.timezone=Asia/Tokyo',pkg+'.SubscriptionSite']),lines.join('\n')+'\n',pkg);
  console.log('C11 '+cRuns.length+'実行成功。'+cc);
  console.log('Java SE 8 対象 '+javaRuns.length+'実行成功。'+javac);
}finally{
  rmSync(root,{recursive:true,force:true});
}
