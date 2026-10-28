/** C source-local train scheduler. No code in question data is executed. */
import type{GenerationDefinition,GeneratedBody}from'./definition';
import{autumn2018Tuple}from'./legacy-2018-autumn-pm-input';
import{p,code,languageAnswers,languageDrawing,languageSelectionNotice,type LanguageFigure}from'./legacy-2018-autumn-language-common';
export const autumn2018Pm9Profiles=['legacy-2018-autumn-pm9-route','legacy-2018-autumn-pm9-program','legacy-2018-autumn-pm9-bank']as const;
export function autumn2018Pm9Input(values:number[]){const v=autumn2018Tuple(values,[[0,5],[0,2]]);return{v,ticks:v[0]+1,otherDestination:[5,6,8][v[1]]};}
export function autumn2018Pm9Initial(values:number[]){const x=autumn2018Pm9Input(values);return{next:[[2],[2],[3],[4,7],[5,6],[],[],[8],[]],trains:[{id:4,dest:8},{id:3,dest:x.otherDestination},null,{id:2,dest:6},{id:1,dest:5},null,null,null,{id:0,dest:8}]};}
export function autumn2018Pm9Schedule(values:number[]){const x=autumn2018Pm9Input(values),s=autumn2018Pm9Initial(values),signal=s.trains.map(t=>t===null);const canReach=(n:number,d:number):boolean=>n===d||s.next[n].some(k=>canReach(k,d)),trace=[];for(let t=0;t<x.ticks;t++){for(let i=8;i>=0;i--){const train=s.trains[i];if(!train)continue;if(i===train.dest){s.trains[i]=null;continue;}for(const n of s.next[i])if(signal[n]&&canReach(n,train.dest)){s.trains[n]=train;s.trains[i]=null;signal[n]=false;break;}}signal.splice(0,9,...s.trains.map(t=>t===null));trace.push(structuredClone(s.trains));}const at=s.trains.findIndex(t=>t?.id===4);if(![0,2,3,7].includes(at))throw Error('PARAMETER_CONSTRAINT');const next=s.next[at],green=next.filter(n=>signal[n]).length,description=next.length===1?(green===1?0:1):(green===2?2:green===0?3:4);return{...s,signal,trace,at,description};}
export const autumn2018Pm9Banks=[['block->next[0]->train == NULL','block->next[1]->train == NULL','block->next[0]->train == NULL || block->next[1]->train == NULL','block->next[0]->train == NULL && block->next[1]->train == NULL','block->signal == RED','block->train == NULL','block->train != NULL'],['block->train->dest == NULL','block->train->dest != NULL','block == block->train->dest','block != block->train->dest'],['break','continue','return'],['dest, block','dest, block->next[i]','block, dest','block, block->next[i]','block->next[i], dest','block->next[i], block'],['0','2','3','7'],['一つあり，その信号機は緑を表示している','一つあり，その信号機は赤を表示している','二つあり，それらの信号機はいずれも緑を表示している','二つあり，それらの信号機はいずれも赤を表示している','二つあり，それらの信号機は，一方が緑を，もう一方が赤を表示している']];
export function autumn2018Pm9Programs(values:number[]){const x=autumn2018Pm9Input(values);return[`#include <stddef.h>
#define RED (0)
#define GREEN (1)
struct train_info {
    int number;
    struct block_info* dest;
};
struct block_info {
    struct train_info* train;
    struct block_info* next[2];
    int signal;
};
void set_signals(struct block_info[], int);
void set_signals(struct block_info blocks[], int nblocks) {
    int i;
    struct block_info* block;
    for (i = 0; i < nblocks; i++) {
        block = &blocks[i];
        if (［a］) {
            block->signal = GREEN;
        } else {
            block->signal = RED;
        }
    }
}`,`#include <stddef.h>
void proceed(struct block_info[], int);
int find_block(struct block_info*, struct block_info*);
void proceed(struct block_info blocks[], int nblocks) {
    int i, j;
    struct block_info* block;
    for (i = nblocks - 1; i >= 0; i--) {
        block = &blocks[i];
        if (block->train == NULL) {
            continue;
        }
        if (［b］) {
            block->train = NULL;
            continue;
        }
        for (j = 0; j < 2; j++) {
            if (block->next[j] == NULL) {
                continue;
            }
            if (block->next[j]->signal == RED) {
                continue;
            }
            if (find_block(block->next[j], block->train->dest) == 1) {
                block->next[j]->train = block->train;
                block->next[j]->signal = RED;
                block->train = NULL;
                ［c］;
            }
        }
    }
}
int find_block(struct block_info* block, struct block_info* dest) {
    int i;
    if (block == dest) {
        return 1;
    }
    for (i = 0; i < 2; i++) {
        if (block->next[i] == NULL) {
            continue;
        }
        if (find_block(［d］) == 1) {
            return 1;
        }
    }
    return 0;
}`,`void start(struct block_info[], int);
void start(struct block_info blocks[], int nblocks) {
    int i;
    set_signals(blocks, nblocks);
    for (i = 0; i < ${x.ticks}; i++) {
        proceed(blocks, nblocks);
        set_signals(blocks, nblocks);
    }
}`];}
export function autumn2018Pm9Figure(profile:string,values:number[]):LanguageFigure{const z=autumn2018Tuple(values,[[0,5],[0,2],[0,5]]),v=z.slice(0,2),g=z[2];autumn2018Pm9Schedule(v);if(profile.endsWith('-route')&&profile===autumn2018Pm9Profiles[0]&&g<2)return{kind:'route',routePart:g===0?'graph':'table',caption:g===0?'図1 鉄道模型の路線構成及び列車位置':'表1 図1の説明',alt:g===0?'9区間、5列車、各出口の接続と行先。':'全9区間の接続先2列と区間内の列車・行先。',route:autumn2018Pm9Initial(v)};if(profile===autumn2018Pm9Profiles[1]&&g<3)return{kind:'program',caption:`〔プログラム${g+1}〕`,alt:`問9 プログラム${g+1}。空欄と全処理を保持。`,text:autumn2018Pm9Programs(v)[g]};if(profile===autumn2018Pm9Profiles[2])return{kind:'bank',caption:`${'abcdef'[g]}に関する解答群`,alt:'全選択肢を原順で保持。',rows:autumn2018Pm9Banks[g].map((t,i)=>['アイウエオカキ'[i],t]),columns:['記号','内容']};throw Error('PARAMETER_CONSTRAINT');}
const draw=(kind:string,v:number[],g=0)=>{const m=autumn2018Pm9Figure(`legacy-2018-autumn-pm9-${kind}`,[...v,g]);return languageDrawing(9,kind,v,g,m.caption,m.alt);};
export const legacy2018AutumnPm9Definition:GenerationDefinition={source:'2018h30a-fe-pm-9',title:'鉄道模型における列車の運行シミュレーション（C）',version:'3.2.0',fields:[{name:'反復回数（1〜6回）',minimum:0,maximum:5},{name:'列車3の到達可能な行先',minimum:0,maximum:2}],reference:[3,0],sourceAnswer:'カ・ウ・ア・オ・イ・ア',notes:'原7頁・6欄29択を保持。路線9区間と列車5本、逆走なし、一閉塞一列車、信号一斉更新→区間番号逆順進行、進行後赤/元NULL、終着除去、到達性/NULL/breakを保持。反復回数と列車3行先の有限18tuple（eが原bank内の条件のみ）で占有と信号の意味を変える。名称置換・択順だけの変化ではない。原referenceは4回/X。全有効条件と不正tuple、全bankの反例を独立占有map及び実C ASan/UBSanで検算。素材と通常登録は未受入。',build(values):GeneratedBody{const x=autumn2018Pm9Input(values),s=autumn2018Pm9Schedule(values),v=x.v;return{prompt:[
 p("次の問9から問13までの5問については，この中から1問を選択し，選択した問題については，解答用紙の選択欄の選をマークして解答してください。なお，2問以上マークした場合には，はじめの1問について採点します。"),
 p("問9 次のCプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。"),
 p("本問は，図1に示す路線構成の鉄道模型における列車の運行をシミュレーションするプログラムである。表1は，図1の説明である。"),
 draw('route',v,0),
 draw('route',v,1),
 p("〔列車を進行させるルール〕"),
 p("(1) 各列車は，あらかじめ決められた始発駅から，あらかじめ決められた終着駅を行先として，路線を後戻りすることなく進行する。"),
 p("(2) 一つの区間には，同時に一つの列車しかいることができない。"),
 p("(3) 各区間の入口には信号機があり，赤又は緑を表示する。"),
 p("(4) 各列車は，終着駅を出口とする区間にいるときは無条件に進行できる。終着駅を出口とする区間にいる列車が進行した場合，その列車は路線上から取り除かれる。"),
 p("(5) 各列車は，現在いる区間の出口で接続する区間（以下，次区間という）が次の条件をいずれも満たしたとき，次区間に進行できる。"),
 p("① 次区間の信号機の表示が緑である。"),
 p("② 次区間に進行すると，最終的には行先とする終着駅に到達できる。"),
 p("(6) 次の二つの処理を繰り返し実行して各列車を進行させる。"),
 p("① 路線を構成する全ての区間の信号機それぞれについて，区間内に列車がいるときは表示を赤に，列車がいないときは表示を緑にする。"),
 p("② 路線を構成する全ての区間それぞれについて，次の処理を行う。"),
 p("(ア) 終着駅を出口とする区間に列車がいる場合は，(4)に従って列車を進行させ，路線上から取り除く。"),
 p("(イ) (ア)で述べた以外の区間に列車がいる場合は，(5)に従って進行できる列車を進行させ，進行した区間の信号機の表示を赤にする。"),
 p("〔プログラム1の説明〕"),
 p("(1) 構造体block_infoは，鉄道模型の区間を表現する。"),
 code("struct block_info {\n    struct train_info* train;\n    struct block_info* next[2];\n    int signal;\n};","c"),
 p("train： 区間内にいる列車を表した，構造体train_infoへのポインタである。区間内に列車がいないとき，NULLを設定する。"),
 p("next： 次区間を表した，構造体block_infoへのポインタを格納する配列（配列の大きさは2）である。終着駅を出口とする区間では，いずれの要素にもNULLを設定する。次区間が一つしかなければ，そのポインタは最初の要素に設定し，2番目の要素にはNULLを設定する。"),
 p("signal： 信号機に表示する色を示す。次のいずれかの定数値をとる。"),
 code("RED       表示は赤\nGREEN     表示は緑","text"),
 p("(2) 構造体train_infoは，鉄道模型の列車を表現する。"),
 code("struct train_info {\n    int number;\n    struct block_info* dest;\n};","c"),
 p("number： 列車の番号である。"),
 p("dest： 列車の終着駅を出口とする区間を表した，構造体block_infoへのポインタである。"),
 p("(3) 関数set_signalsの仕様は，次のとおりである。"),
 p("機能： 全ての区間の信号機それぞれについて，区間内に列車がいるときは表示を赤に，列車がいないときは表示を緑にする。"),
 p("引数： blocks　全ての区間を表した，構造体block_infoの配列"),
 p("　　　nblocks　blocksの要素数"),
 draw('program',v,0),
 p("設問1 プログラム1中の［　］に入れる正しい答えを，解答群の中から選べ。"),
 draw('bank',v,0),
 p("設問2 関数proceedは，進行できる全ての列車を進行させるプログラムである。プログラム2中の［　］に入れる正しい答えを，解答群の中から選べ。"),
 p("〔プログラム2の説明〕"),
 p("(1) 関数proceedの仕様は，次のとおりである。"),
 p("機能： 全ての区間それぞれについて，進行できる列車がいるかどうかを判定し，進行できると判定された列車を進行させる。終着駅を出口とする区間にいる列車を進行させた場合，その列車を路線上から取り除く。出口で他の区間と接続する区間にいる列車を進行させた場合，進行した区間の信号機の表示を赤にする。"),
 p("引数： blocks　全ての区間を表した，構造体block_infoの配列"),
 p("　　　nblocks　blocksの要素数"),
 p("(2) 関数proceedから呼び出される関数find_blockの仕様は，次のとおりである。"),
 p("機能： 引数blockで示す区間が，引数destで示す区間に最終的に到達できる経路上にあるかどうかを判定する。"),
 p("引数： block　判定対象の区間を表した，構造体block_infoへのポインタ"),
 p("　　　dest　列車の終着駅を出口とする区間を表した，構造体block_infoへのポインタ"),
 p("返却値： 到達できるとき，1"),
 p("　　　　到達できないとき，0"),
 draw('program',v,1),
 draw('bank',v,1),
 draw('bank',v,2),
 draw('bank',v,3),
 p("設問3 図1に示した鉄道模型の路線構成及び列車位置を表した，構造体block_infoの配列を第1引数とし，その要素数9を第2引数として，プログラム3を実行した。プログラム3の実行が終了したときの状態について述べた次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。ここで，blocks[n]は区間nを示す。"),
 draw('program',v,2),
 p("列車4がいるのは区間［e］である。また，区間［e］の出口で接続する区間は［f］。"),
 draw('bank',v,4),
 draw('bank',v,5)
],...languageAnswers(autumn2018Pm9Banks,[{id:'a',bank:0,label:'設問1 a',answer:5},{id:'b',bank:1,label:'設問2 b',answer:2},{id:'c',bank:2,label:'設問2 c',answer:0},{id:'d',bank:3,label:'設問2 d',answer:4},{id:'e',bank:4,label:'設問3 e',answer:[0,2,3,7].indexOf(s.at)},{id:'f',bank:5,label:'設問3 f',answer:s.description}]),explanation:`aは区間自身のtrainがNULLかを調べる。bは現在区間と列車のdestが同じ場合。移動後は元trainがNULLなのでcは内側ループをbreakする。dは次区間と同じdestで再帰する。信号を一斉更新してから逆順走査する${x.ticks}回の結果，列車4は区間${s.at}にあり，出口の状態は「${autumn2018Pm9Banks[5][s.description]}」となる。独自解説。`};}};
