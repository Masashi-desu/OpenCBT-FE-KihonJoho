import{figure,type GeneratedBody}from'./definition';
import type{Block}from'../types';
import characters from'./legacy-2019-spring-pm9-characters.json';
export const spring2019Pm9Profiles=['legacy-2019-spring-pm9-example','legacy-2019-spring-pm9-program','legacy-2019-spring-pm9-changes','legacy-2019-spring-pm9-bank','legacy-2019-spring-pm9-character-reference','legacy-2019-spring-pm9-reference-notice']as const;
export const spring2019Pm9CharacterFacts=characters;
export function spring2019Pm9Character(code:number){if(!Number.isInteger(code)||code<0||code>255)throw Error('PARAMETER_CONSTRAINT');return characters.find(r=>r.byte===code)?.character??null;}
/** 0 is the source's partial observation, not a reconstructed sample.c file.
 * 1..16 are full admissible input histograms; no hidden source count is inferred. */
export function spring2019Pm9Histogram(scenario:number):number[]|null{
 if(!Number.isInteger(scenario)||scenario<0||scenario>16)throw Error('PARAMETER_CONSTRAINT');if(scenario===0)return null;
 const style=Math.floor((scenario-1)/4),scale=(scenario-1)%4+1;
 return Array.from({length:256},(_,i)=>scale*(style===0?i%13:style===1?(i*7+3)%17:style===2?(i%5===0?20:0):(255-i)%19));
}
type Cell={code:number;count:number};
const sourceOne:Cell[][]=[
 [{code:0,count:0},{code:64,count:0},{code:128,count:0},{code:192,count:0}],
 [{code:1,count:0},{code:65,count:15},{code:129,count:0},{code:193,count:0}],
 [{code:2,count:0},{code:66,count:0},{code:130,count:0},{code:194,count:0}],
 [{code:3,count:0},{code:67,count:20},{code:131,count:0},{code:195,count:0}],
 [{code:32,count:3620},{code:96,count:0},{code:160,count:0},{code:224,count:0}],
 [{code:33,count:8},{code:97,count:103},{code:161,count:0},{code:225,count:0}],
 [{code:34,count:76},{code:98,count:10},{code:162,count:0},{code:226,count:0}],
 [{code:62,count:18},{code:126,count:0},{code:190,count:0},{code:254,count:0}],
 [{code:63,count:0},{code:127,count:0},{code:191,count:0},{code:255,count:0}]
];
const sourceTwo:Cell[][]=[
 [{code:32,count:3620},{code:75,count:12},{code:128,count:0},{code:192,count:0}],
 [{code:105,count:404},{code:76,count:12},{code:129,count:0},{code:193,count:0}],
 [{code:10,count:329},{code:87,count:12},{code:130,count:0},{code:194,count:0}],
 [{code:13,count:329},{code:77,count:11},{code:131,count:0},{code:195,count:0}],
 [{code:101,count:299},{code:88,count:10},{code:132,count:0},{code:196,count:0}],
 [{code:114,count:295},{code:98,count:10},{code:133,count:0},{code:197,count:0}],
 [{code:54,count:14},{code:126,count:0},{code:190,count:0},{code:254,count:0}],
 [{code:52,count:12},{code:127,count:0},{code:191,count:0},{code:255,count:0}]
];
export function spring2019Pm9Example(scenario:number,sorted:boolean){const histogram=spring2019Pm9Histogram(scenario);if(!histogram)return{total:10000,observedOnly:true,rows:structuredClone(sorted?sourceTwo:sourceOne),omissionsAfter:sorted?[5]:[3,6]};const codes=Array.from({length:256},(_,n)=>n);if(sorted)codes.sort((a,b)=>histogram[b]-histogram[a]||a-b);const visible=sorted?[0,1,2,3,4,5,62,63]:[0,1,2,3,32,33,34,62,63];return{total:histogram.reduce((a,b)=>a+b,0),observedOnly:false,rows:visible.map(i=>[0,1,2,3].map(column=>({code:codes[i+column*64],count:histogram[codes[i+column*64]]}))),omissionsAfter:sorted?[5]:[3,6]};}
export const spring2019Pm9Program1=String.raw`#include <stdio.h>

#define InName "sample.c"    /* 入力ファイル名 */

int main() {
    FILE *infile;
①   int chr, i;
    long cnt;
    long freq[256];    /* freq[i]: 文字コードiの出現回数 */

    for (chr = 0; chr <= 255; chr++)
        freq[chr] = 0;

    infile = fopen(InName, "rb");
    cnt = 0;
    while ((chr = fgetc(infile)) != EOF) {
        cnt++;
        freq[chr]++;
    }

    printf(" %10ld bytes processed\n\n", ［a］);
    for (i = 0; i < 64; i++) {
        for (chr = i; chr <= ［b］; chr += ［c］) {
            if ((0x20 <= chr) && (chr <= 0x7E))
                printf(" %10ld %02X '%c'", freq[chr], chr, chr);
            else
                printf(" %10ld %02X    ", freq[chr], chr);
        }
        printf("\n");
    }
②
}`;
export const spring2019Pm9Declaration='int ih, ix, code[256];';
export const spring2019Pm9SortProgram=String.raw`    for (i = 0; i <= 255; i++)
        code[i] = i;
③   ih = 255;
④   while (ih > 0) {
⑤       for (i = 0; i < ih; i++) {
⑥           if (freq[i] < freq[i+1]) {
                Swap(code[i], code[i+1]);
                Swap(freq[i], freq[i+1]);
⑦
            }
        }
⑧       ih--;
    }
    printf("\n");
    for (i = 0; i < 64; i++) {
        for (chr = i; chr <= ［b］; chr += ［c］) {
            if ((0x20 <= code[chr]) && (code[chr] <= 0x7E))
                printf(" %10ld %02X '%c'", freq[chr], code[chr], code[chr]);
            else
                printf(" %10ld %02X    ", freq[chr], code[chr]);
        }
        printf("\n");
    }`;
export const spring2019Pm9Banks=[['cnt - 1','cnt','cnt + 1'],['4','64','256','i + 4','i + 64','i + 192'],['253','254','255','256'],['256 - ix','ix - 1','ix','ix + 1'],['行③','行④','行⑤'],['ih = ix - 1','ih = ix','ih = ix + 1','ix = ih']];
export const spring2019Pm9BankCaptions=['aに関する解答群','b，cに関する解答群','dに関する解答群','eに関する解答群','fに関する解答群','gに関する解答群'];
export const spring2019Pm9ReferenceNote='この問題に添付する文字の参考資料は，必要な95個の対応を別の一次データから独立編集したものです。本文の「末尾のアセンブラ言語の仕様の1.3」に代わる参考として参照してください。原の付属文字表・規格の説明文は収録していません。';
export function spring2019Pm9ReferenceBlock():Extract<Block,{type:'diagram'}>{const b=figure(spring2019Pm9Profiles[4],[0],'独立参考：この問題で印字に用いる文字と符号値',characters.map(r=>`${r.hex} ${r.byte===32?'空白':r.character} ${r.scalar}`).join('。'));if(b.type!=='diagram')throw Error('SOURCE_FORMAT');b.attribution={origin:'adapted',sourceRefs:[{sourceId:'source-unicode-2019h31h-fe-pm9-jis-archive',locator:{section:'table2.0/2015header、20〜7Dの93共通値と5C円'}},{sourceId:'source-unicode-2019h31h-fe-pm9-cp932-archive',locator:{section:'table2.01/1998、7E TILDE'}},{sourceId:'source-unicode-17-2019h31h-fe-pm9-ucd',locator:{section:'UnicodeData17.0.0の関連scalar名'}}],rightsRefs:['rights-unicode-2019h31h-fe-pm9','rights-original'],creatorIds:['unicode','codex']};return b;}
export function spring2019Pm9ReferenceNoticeBlock():Extract<Block,{type:'diagram'}>{const b=spring2019Pm9ReferenceBlock();return{...b,id:'diagram-'+spring2019Pm9Profiles[5],scene:{kind:'source_figure',profile:spring2019Pm9Profiles[5],values:[0]},caption:'参考資料の編集注',alt:spring2019Pm9ReferenceNote};}
export function spring2019Pm9Figure(profile:string,values:number[]){if(!spring2019Pm9Profiles.includes(profile as typeof spring2019Pm9Profiles[number])||values.some(n=>!Number.isInteger(n)))throw Error('PARAMETER_CONSTRAINT');if(profile.endsWith('-reference-notice')){if(values.length!==1||values[0]!==0)throw Error('PARAMETER_CONSTRAINT');return{kind:'note' as const,text:spring2019Pm9ReferenceNote};}if(profile.endsWith('-character-reference')){if(values.length!==1||values[0]!==0)throw Error('PARAMETER_CONSTRAINT');return{kind:'characters' as const,rows:characters};}if(values.length!==2)throw Error('PARAMETER_CONSTRAINT');const [scenario,group]=values;spring2019Pm9Histogram(scenario);if(profile.endsWith('-example')){if(group<0||group>1)throw Error('PARAMETER_CONSTRAINT');return{kind:'example' as const,...spring2019Pm9Example(scenario,group===1),sorted:group===1};}if(profile.endsWith('-program')){if(group<0||group>2)throw Error('PARAMETER_CONSTRAINT');return{kind:'program' as const,text:group===0?spring2019Pm9Program1:group===1?spring2019Pm9Declaration:spring2019Pm9SortProgram};}if(profile.endsWith('-changes')){if(group!==0)throw Error('PARAMETER_CONSTRAINT');return{kind:'changes' as const,rows:[['［f］の直後に追加','ix = 0;'],['行⑦の位置に追加','ix = i;'],['行⑧を置換え','［g］;']]};}if(group<0||group>=spring2019Pm9Banks.length)throw Error('PARAMETER_CONSTRAINT');return{kind:'bank' as const,caption:spring2019Pm9BankCaptions[group],entries:spring2019Pm9Banks[group]};}
