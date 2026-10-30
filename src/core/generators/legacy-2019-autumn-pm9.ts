import{code,field,p,table,strings,type GenerationDefinition}from'./definition';
export const autumnDumpExample='int main() {\r\n   /* for testing dump() */\r\n   dump("main.c", 0L, -1L);\r\n   dump("main.c", 17L, 40L);\r\n}\r\n';
export function autumnDumpOutput(bytes:readonly number[],from:number,to:number){if(!Number.isInteger(from)||from<0||!Number.isInteger(to)||bytes.some(v=>!Number.isInteger(v)||v<0||v>255))throw Error('INVALID_DUMP');const stop=to<0?bytes.length:Math.min(bytes.length,to+1),selected=bytes.slice(from,stop),lines:string[]=[];for(let start=0;start<selected.length;start+=60){const group=selected.slice(start,start+60),hex=group.map(v=>v.toString(16).toUpperCase().padStart(2,'0'));lines.push(String(from+start).padStart(10)+'  '+group.map(v=>v>=32&&v<=126?String.fromCharCode(v):'.').join(''),' '.repeat(12)+hex.map(s=>s[0]).join(''),' '.repeat(12)+hex.map(s=>s[1]).join(''),'');}const eof=bytes.length===0||to<0||to>=bytes.length-1,count=bytes.length===0?-from:selected.length;lines.push(`END OF ${eof?'DATA':'DUMP'} ... ${count} byte(s)`);return lines.join('\n')+'\n';}
export const autumnDumpCode=`#include <stdio.h>
#define WIDTH 60       /* 行当たり表示バイト数 */
#define MASKCHR '.'    /* 16進数表示で20〜7E以外の場合の表示用文字 */
void dump(char *filename, long from, long to) {
    FILE *infile;
    int chr, pos = 0;
    long cnt = 0;
    char tblC[256], bufC[WIDTH + 1];
    char tblH[256], bufH[WIDTH + 1];
    char tblL[256], bufL[WIDTH + 1];
    char hex[] = "0123456789ABCDEF";
    for (chr = 0x00; chr <= 0xFF; chr++) {
        if ((0x20 <= chr) && (chr <= 0x7E)) tblC[chr] = chr;
        else tblC[chr] = MASKCHR;
        tblH[chr] = hex[chr >> 4];
        tblL[chr] = hex[[a]];
    }
    bufC[WIDTH] = bufH[WIDTH] = bufL[WIDTH] = '\\0';
    infile = fopen(filename, "rb");
    while (((chr = fgetc(infile)) != EOF) [b1] ((to < 0) [b2] (cnt <= to))) {
        cnt++;
        if ([c]) {
            bufC[pos] = tblC[chr]; bufH[pos] = tblH[chr]; bufL[pos] = tblL[chr];
            pos++;
            if ([d]) {
                printf("%10ld  %s\\n%12s%s\\n%12s%s\\n\\n", cnt - WIDTH, bufC, "", bufH, "", bufL);
                pos = 0;
            }
        }
    }
    if (pos > 0) {
        bufC[pos] = bufH[pos] = bufL[pos] = '\\0';
        printf("%10ld  %s\\n%12s%s\\n%12s%s\\n\\n", cnt - pos, bufC, "", bufH, "", bufL);
    }
    if (chr == EOF) printf("END OF DATA ... %ld byte(s)\\n", cnt - from);
    else printf("END OF DUMP ... %ld byte(s)\\n", cnt - from);
    fclose(infile);
}`;
export const autumnDumpSource='2019r01a-fe-pm-9';
export const legacy2019AutumnDumpDefinitions:GenerationDefinition[]=[{source:autumnDumpSource,title:'旧制度・午後：C言語のファイルダンプ',version:'3.2.0',fields:[field('excerptOffset',0,31),field('lastByteCase',0,2),field('emptyFileFrom',0,1)],reference:[0,0,0],sourceAnswer:'設問1 aア bイ（&&,||） cア dオ／設問2 eオ fウ',notes:'原45〜49ページのC全プログラム、表引数、入出力例、WIDTH60、1組3行/0〜255全バイト/マスク/上位下位桁/0始まりfrom-to包含/to負/2^31未満/EOF-intと短絡評価、6欄と4/4組合せ/3/6/6/6択を保持。元105bytesは各行CRLFと3字下げで再構成した。原参照値では17〜40の24bytesと公式6欄に一致。生成は抜粋位置32条件、EOF直前/末尾境界3条件、空ファイルの範囲外from0/1で192条件。空ファイルだけは原どおり通常入力条件を満たさない例外を問う。b1/b2を二欄に分割しない。C本文は表示用で任意コード実行をアプリへ追加しない。全バイトと境界は独立したC実行で照合する。',build:values=>{if(values.length!==3||values.some((v,i)=>!Number.isInteger(v)||v<0||v>[31,2,1][i]))throw Error('PARAMETER_CONSTRAINT');const[offset,edge,emptyFrom]=values,from=17+offset,to=40+offset,edgeFrom=edge===0?99:98,edgeTo=edge===1?98:99,edgeCount=edge===2?2:1,counts=[-1,0,edgeCount],bank=counts.flatMap(count=>[`END OF DATA ... ${count} byte(s)`,`END OF DUMP ... ${count} byte(s)`]),e=edge===1?5:4,f=emptyFrom===0?2:0,bytes=[...autumnDumpExample].map(c=>c.charCodeAt(0)),banks=[['chr & 0x0F','chr & 0xF0','chr && 0x0F','chr && 0xF0'],['&&, &&','&&, ||','||, &&','||, ||'],['cnt > from','cnt >= from','cnt >= from - 1'],['cnt == WIDTH - 1','cnt == WIDTH','cnt == WIDTH + 1','pos == WIDTH - 1','pos == WIDTH','pos == WIDTH + 1'],bank],offsets=[0,4,8,11,17];
 return{prompt:[p('問9 次のCプログラムの説明及びプログラムを読んで、設問1、2に答えよ。入力ファイルの内容を文字及び16進数で表示する。'),table('関数dumpの引数',['型と名前','意味'],[['char *filename','入力ファイル名'],['long from','表示を開始するバイト位置'],['long to','表示を終了するバイト位置。負ならファイル末尾']]),p('バイト位置はファイル先頭から0、1、…と数える。入力はバイナリとして読み、各バイトのビット構成に制限はない。fromから60バイトずつを3行1組で表示する。第1行は文字、第2行は16進上位桁、第3行は下位桁を表示する。20〜7E以外のバイトは文字の代わりに.を表示する。第1行の行頭には最初のバイト位置を10進数で表示する。最終行に、ファイル終端ならEND OF DATA、指定位置で終わるならEND OF DUMPと、表示バイト数を示す。'),p('通常の入力条件は、to<0なら0≦from<ファイルサイズ<2^31、to≧0なら0≦from≦to<ファイルサイズ<2^31である。fgetcは1バイトをintとして返し、ファイル終端ではEOFを返す。'),code(autumnDumpExample.replaceAll('\r\n','\n'),'c'),p('図1 入力ファイルの例。各行末は復帰文字0x0Dと改行文字0x0A、行頭の字下げは3個の半角空白で、合計105バイトである。'),code(autumnDumpOutput(bytes,0,-1),'text'),p('図2 図1のファイル全体の表示例。文字iは16進69となり、改行などは.で表示される。'),code(autumnDumpOutput(bytes,from,to),'text'),p(`図3 同じファイルの位置${from}から${to}までの表示例。`),code(autumnDumpCode,'c'),p('設問1 プログラム中a、b、c、dに入れる正しい答えを各解答群から選べ。b1とb2はbの解答群から組合せを一つ選ぶ。bの各候補は左からb1、b2の順である。'),p(`設問2 最終行の表示について次の二つのケースを考え、e、fを共通解答群から選べ。ケース1：ファイルサイズ100、from=${edgeFrom}、to=${edgeTo}のとき、最終行は［e］となる。ケース2：ファイルサイズ0、from=${emptyFrom}、to<0のとき、最終行は［f］となる。ケース2は説明の通常入力条件を満たさないが、この関数をそのまま実行した場合を問う。`)],choices:[...strings(banks[0]),...banks[1].map(s=>[table('空欄の組合せ',['b1','b2'],[s.split(', ')])]),...strings(banks[2]),...strings(banks[3]),...strings(bank)],answerParts:[4,4,3,6,6,6].map((count,i)=>({id:'part-'+'abcdef'[i],label:`設問${i<4?1:2} ${'abcdef'[i]}`,choiceIds:Array.from({length:count},(_,j)=>'choice-value-'+([0,4,8,11,17,17][i]+j+1))})),partAnswers:[0,1,0,4,e,f].map((v,i)=>({kind:'choice'as const,partId:'part-'+'abcdef'[i],choiceId:'choice-value-'+([0,4,8,11,17,17][i]+v+1)})),explanation:`aは下位4ビットを取り出すchr & 0x0F。b1はEOFで停止する&&、b2は末尾指定又はcnt<=toのどちらかを認める||。cntは読み取った直後に1増えるので、位置fromを含める条件cはcnt>from。1組のバイト数posがWIDTHに達したら表示する。ケース1は${edge===1?'指定範囲の次のバイトを読んだ時点でtoの条件が偽となり':'最後のバイトの次にfgetcがEOFを返すため'}${bank[e]}。ケース2は最初のfgetcでEOFとなりcnt=0のままなので、cnt-from=${-emptyFrom}、${bank[f]}。ファイル終端の判定はwhileの左側で先に評価される。`};}}];
