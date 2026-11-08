import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { GeneratedBody } from '../../src/core/generators/definition';
import { legacy2014AutumnPm9Definition as c, legacy2014AutumnPm11Definition as java } from '../../src/core/generators/legacy-2014-autumn-pm-09-13';
import { legacy2014AutumnPm0913Figures as figures } from '../../src/core/generators/legacy-2014-autumn-pm-09-13-figures';

const root=mkdtempSync(join(tmpdir(),'ipa-2014-autumn-9-13-'));
const write=(name:string,content:string|Buffer)=>writeFileSync(join(root,name),content);
const run=(command:string,args:string[])=>execFileSync(command,args,{cwd:root,encoding:'utf8',timeout:15000});
const program=(body:GeneratedBody)=>body.prompt.flatMap(block=>block.type==='code'?[block.text]:[]);
function completed(code:string,body:GeneratedBody){
  return code.replaceAll(/\[([a-g])\]/g,(_,field:string)=>{
    const answer=body.partAnswers!.find(part=>part.kind==='choice'&&part.partId==='part-'+field);
    assert(answer?.kind==='choice');
    const block=body.choices[Number(answer.choiceId.split('-').at(-1))-1][0];
    assert.equal(block.type,'code');
    return block.text;
  });
}
const input=(lines:readonly (readonly string[])[])=>Buffer.from(lines.map(([id,name,attribute,date])=>
  [id,name,String.fromCharCode(parseInt(attribute,16)),date].join(' ')).join('\n')+(lines.length?'\n':''),'latin1');
const normalized=(value:string)=>value.trim().replace(/[^\S\n]+/gu,' ');
const picture=(number:number,name:string,index:number)=>figures.find(figure=>
  figure.profile==='legacy-2014-autumn-pm-'+number+'-'+name)!.panel([index]).tables;
const expectedLines=(name:string,index:number)=>normalized(picture(9,name,index)[0].rows.map(row=>row.map(cell=>cell.text).join(' ')).join('\n'));
try{
  const cc=run('cc',['--version']).split('\n')[0];
  const javac=run('javac',['-version']).trim();
  for(let index=0;index<8;index++){
    const cBody=c.build([index]);
    const [start,merge,usage]=program(cBody);
    const records=picture(9,'input',index).map(table=>table.rows.map(row=>row.map(cell=>cell.text)));
    write('NewFile',input(records[0]));
    write('OldFile',input(records[1]));
    for(const [mode,code] of [['differences',merge],['usage',merge.replace(/\/\* α 開始 \*\/[\s\S]+?\/\* α 終了 \*\//,usage)]] as const){
      const complete=completed(start+'\n'+code,cBody).replace('void main()','int main(void)').replace('    fclose(NewFile);','    fclose(NewFile);\n    return 0;');
      write('question.c',complete);
      run('cc',['-std=c11','question.c','-o','question']);
      assert.equal(normalized(run('./question',[])),expectedLines(mode,index),'C '+mode+' '+index);
      if(index===0){
        const next = [['AA001','Both','4C','00000000'],['AA003','New','41','20141015']];
        const old = [['AA001','Both','40','00000000'],['AA002','Old','4C','20141015']];
        const edges = [
          [[],[],'',''],
          [next,[],'AA001 Both 利用者 ID 追加 特権 S 付加 特権 O 付加\nAA003 New 利用者 ID 追加','AA003 New 現在使用不可'],
          [[],old,'AA001 Both 利用者 ID 削除\nAA002 Old 利用者 ID 削除 特権 S 解除 特権 O 解除',''],
          [next,old,'AA001 Both 特権 S 付加 特権 O 付加\nAA002 Old 利用者 ID 削除 特権 S 解除 特権 O 解除\nAA003 New 利用者 ID 追加',
            'AA001 Both 期間中未使用\nAA003 New 現在使用不可'],
        ] as const;
        for(const [fresh,previous,difference,status] of edges){
          write('NewFile',input(fresh));
          write('OldFile',input(previous));
          assert.equal(normalized(run('./question',[])),mode==='differences'?difference:status);
        }
        write('NewFile',input(records[0]));
        write('OldFile',input(records[1]));
      }
    }
    const javaBody=java.build([index]);
    const [period,testStart,testEnd,mutation]=program(javaBody).map(code=>completed(code,javaBody));
    for(const patched of [false,true]){
      const implementation=patched?period.replace('this.start = start;','this.start = new Date(start.getTime());')
        .replace('this.end = end;','this.end = new Date(end.getTime());')
        .replace('return start;','return (Date) start.clone();')
        .replace('return end;','return (Date) end.clone();'):period;
      write('Period.java',implementation);
      write('PeriodTest.java',testStart+'\n'+(patched?testEnd.replace('        /* α */',mutation):testEnd));
      run('javac',['--release','8','-Xlint:-options','-encoding','UTF-8','Period.java','PeriodTest.java']);
      assert.equal(run('java',['PeriodTest']),'','Java '+index+' '+patched);
    }
  }
  console.log('C11 24実行成功（8件は空入力などの境界）。'+cc);
  console.log('Java SE 8 API/バイトコード対象 16実行成功。'+javac);
}finally{
  rmSync(root,{recursive:true,force:true});
}
