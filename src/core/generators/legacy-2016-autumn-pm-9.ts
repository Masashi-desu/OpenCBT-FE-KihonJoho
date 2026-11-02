/** IPA平成28年度秋期FE午後問9。表示用Cは実行しない。 */
import {field,p,code,table,variableNotes,type GeneratedBody} from './definition';
import type {AfternoonBookletDefinition} from './afternoon-booklet-extension-contract';
import {selectCase,sourceDiagram,panelAlt,heading,fixedReferences,answerBody,pageAlt,choiceBankText,selectionInstruction,type Panel,type SourcePage} from './legacy-2016-autumn-pm-09-13-support';
export type Job9={code:string;days:number;target:number};
const codes=['APL12339','GGL08001','MSO16101','CAN03022','ORA14031'];
export const q9Banks={a:['i + j','i + j - 1','i - j','i - j + 1'],b:['i + 1','i - 1','job_no','job_no + 1','job_no - 1'],c:['i + 1','i - 1','i++','i--','++i','--i'],d:['=','+=','-=']};
export const q9Program1=`typedef struct {
    char pr_code[9];    /* 開発コード */
    int job_term;      /* 開発作業日数 */
    int target_term;   /* 目標作業期間 */
} JOB;
void job_scheduling(int, JOB[], int[]);
void job_scheduling(int num_s, JOB job[num_s], int job_sch[num_s]) {
    int ft, ft_a, ft_b, wt_a, wt_b, job_no, i, j;
    for (i = 0; i < num_s; i++) {
        job_sch[i] = i;
    }
    ft = 0;
    i = 0;
    while (i < num_s - 1) {
        ft_a = ft;
        ft_b = ft;
        wt_a = 0;
        wt_b = 0;
        for (j = 0; j < 2; j++) { /* 遅延日数の合計wt_a，wt_bを求める */
            ft_a += job[job_sch[i + j]].job_term;
            if (ft_a > job[job_sch[i + j]].target_term) {
                wt_a += ft_a - job[job_sch[i + j]].target_term;
            }
            ft_b += job[job_sch[[a]]].job_term;
            if (ft_b > job[job_sch[[a]]].target_term) {
                wt_b += ft_b - job[job_sch[[a]]].target_term;
            }
        }
        if (wt_a > wt_b) {
            job_no = job_sch[i];
            job_sch[i] = job_sch[[b]];
            job_sch[[b]] = job_no;
            if (i > 0) {
                ft -= job[job_sch[[c]]].job_term;
            }
        } else {
            ft [d] job[job_sch[i++]].job_term;
        }
    }
}`;
export const q9Program2=`#include <stdio.h>
typedef struct {
    char pr_code[9];    /* 開発コード */
    int job_term;      /* 開発作業日数 */
    int target_term;   /* 目標作業期間 */
} JOB;
void print_schedule(int, JOB[], int[]);
void print_schedule(int num_s, JOB job[num_s], int job_sch[num_s]) {
    int ft, wt, wt_sum, i;
    ft = 0;
    wt_sum = 0;
    for (i = 0; i < num_s; i++) {
        ft += job[job_sch[i]].job_term;
        if (ft > job[job_sch[i]].target_term) {
            wt = ft - job[job_sch[i]].target_term;
            wt_sum += wt;
        } else {
            wt = 0;
        }
        printf("%3d  %10s  %10d  %10d\\n",
               i + 1, job[job_sch[i]].pr_code, wt, wt_sum);
    }
}`;
/** Source-shaped ft mutation; independent tests use immutable prefix recomputation. */
export function q9Schedule(jobs:readonly Job9[]){const order=jobs.map((_,i)=>i);let ft=0,i=0,guard=0;while(i<jobs.length-1){if(++guard>10000)throw Error('SCHEDULE_LIMIT');let fa=ft,fb=ft,wa=0,wb=0;for(let j=0;j<2;j++){const a=jobs[order[i+j]],b=jobs[order[i-j+1]];fa+=a.days;fb+=b.days;wa+=Math.max(0,fa-a.target);wb+=Math.max(0,fb-b.target);}if(wa>wb){[order[i],order[i+1]]=[order[i+1],order[i]];if(i>0)ft-=jobs[order[--i]].days;}else ft+=jobs[order[i++]].days;}let finish=0,total=0;const rows=order.map((id,index)=>{finish+=jobs[id].days;const late=Math.max(0,finish-jobs[id].target);total+=late;return{number:index+1,id,code:jobs[id].code,finish,late,total};});return{order,rows};}
const sourceTuple=[25,27,21];
function candidate(tuple:number[],source=false){const jobs=[...tuple,28,12].map((days,i)=>({code:codes[i],days,target:[27,29,30,77,93][i]}));const schedule=q9Schedule(jobs),r=schedule.rows[2];const numbers=source?[0,27,44,46,57,60,73,86]:[0,jobs[r.id].days,r.late,schedule.rows[1].finish,jobs[r.id].target,r.total,r.finish,schedule.rows[4].finish];return{jobs,...schedule,numbers};}
const candidates=[candidate(sourceTuple,true)];
for(const a of[20,25,30])for(const b of[24,27,30])for(const c of[18,21,24]){if(a===25&&b===27&&c===21)continue;const x=candidate([a,b,c]);if(new Set(x.numbers).size===8)candidates.push(x);}
export function q9Input(values:readonly number[]){return structuredClone(candidates[selectCase(values,candidates.length)]);}
export const q9Profiles=['program1','job-data','schedule-order','third-output-line','lateness-formula'];
export function q9Panel(suffix:string,values:number[]):Panel{const x=q9Input(values);if(suffix==='lateness-formula')return{kind:'piecewise',lhs:'wt',rows:[['ft + job_term - target_term','ft + job_term > target_term'],['0','ft + job_term ≦ target_term']]};if(suffix==='program1')return{kind:'code',text:q9Program1,language:'c'};if(suffix==='job-data')return{kind:'table',columns:['','pr_code','job_term','target_term'],rows:x.jobs.map((j,i)=>[`job[${i}]`,`"${j.code}"`,String(j.days),String(j.target)])};if(suffix==='schedule-order')return{kind:'table',header:false,columns:['',''],rows:x.order.map((id,i)=>[`job_sch[${i}]`,String(id)])};if(suffix==='third-output-line')return{kind:'output',fields:['3',x.rows[2].code,'[e]','[f]'],note:'枠線は，実際には出力されない。'};throw Error('FIGURE_PROFILE');}
const ref=fixedReferences([2]);
function pages(index:number,original=false):SourcePage[]{const fig=(s:string,c:string)=>sourceDiagram(9,s,index,c,panelAlt(q9Panel(s,[index])));return[
{page:41,blocks:[p(selectionInstruction),p('問9 次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),heading('〔プログラム1の説明〕'),p('U社では，半年ごとに社内システムの見直しを行い，4月と10月に新たに開発又は改修するサブシステム（以下，対象サブシステムという）を決定し，開発又は改修作業（以下，開発作業という）を実施している。対象サブシステムは複数あり，それぞれに対して目標作業終了日が設定される。二つ以上の対象サブシステムの開発作業を同時に実施することはない。各対象サブシステムについて，開発リソースの制約があるので，必ずしも目標作業終了日までに開発作業を終了できるとは限らない。しかし，開発作業の終了が目標作業終了日よりも遅れる日数（以下，遅延日数という）の合計はできるだけ少なくしたい。そこで，対象サブシステムの開発作業順序を求める関数job_schedulingを作成した。'),p('(1) 関数job_schedulingの仕様は次のとおりである。ここで，引数の値に誤りはないものとする。'),table('関数job_schedulingの仕様',['項目','内容'],[['機能','対象サブシステムの開発作業順序を求める。'],['引数 num_s','対象サブシステム数'],['引数 job','対象サブシステム情報（JOB型の配列）'],['引数 job_sch','開発作業順序（int型の配列）']]),p('(2) 構造体を使ったJOB型の定義は次のとおりである。'),code(q9Program1.slice(0,q9Program1.indexOf('void job_scheduling')),'c'),p('① 開発コードは，対象サブシステムごとに一意となる長さが8の文字列'),p('② 開発作業日数は，開発作業に掛かる日数'),p(`③ 目標作業期間は，${original?'今回の開発作業':'半年ごとの一連の開発作業'}を開始する日から，この対象サブシステムの目標作業終了日までの日数`)]},
{page:42,blocks:[p('(3) 対象サブシステム情報jobには，次の①〜③の順で，データが格納されている。① 目標作業期間の昇順。② 目標作業期間が同じならば，開発作業日数の昇順。③ 目標作業期間も開発作業日数も同じならば，開発コードの昇順。'),p('(4) (5)の手順で，開発作業順序を求めると，開発作業順序job_schの要素job_sch[i]には，i+1番目（i=0，1，…，num_s−1）に開発作業を実施する対象サブシステムの情報が格納されたjob[j]の添字の値j（j=0，1，…，num_s−1）が入る。'),p('(5) 開発作業順序を求める手順は，次のとおりである。'),p('① 開発作業順序job_schを，対象サブシステム情報jobの並び順に初期設定し，開発作業順序の添字iに初期値0を設定する。'),p('② i<num_s−1である間，③〜⑥の処理を行う。'),p('③ i+1番目に開発作業を実施する対象サブシステムjob[job_sch[i]]とi+2番目に開発作業を実施する対象サブシステムjob[job_sch[i+1]]の開発作業を，順序どおりに実施した場合の二つの対象サブシステムの遅延日数の合計wt_aと，順序を入れ替えて実施した場合の二つの対象サブシステムの遅延日数の合計wt_bを求める。'),p('④ 開発作業の実施順序を入れ替えることによって遅延日数の合計が減る場合（wt_a>wt_b）には，開発作業の実施順序を入れ替える。'),p('⑤ 開発作業の実施順序を入れ替えた場合，iが0でなければ，iを1減らす。'),p('⑥ 入れ替えなかった場合，iを1増やす。'),p(`(6) i番目の対象サブシステムの開発作業が終わるまでの開発作業日数の合計をftとしたとき，i+1番目の対象サブシステムの開発作業が終わったときの遅延日数${original?'の合計':''}wtは，次式で求められる。`),fig('lateness-formula','遅延日数wtの計算式'),p('ここで，job_termとtarget_termは，i+1番目に開発作業を実施する対象サブシステムの開発作業日数と目標作業期間である。')]},
{page:43,blocks:[heading('〔プログラム1〕'),fig('program1','プログラム1')]},
{page:44,blocks:[p('設問1 プログラム1中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),p('設問2 関数job_schedulingを実行したときに得られる対象サブシステムの開発作業順序などを出力する関数print_scheduleを作成した。次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。')],banks:Object.entries(q9Banks).map(([k,v])=>choiceBankText(k,v))},
{page:45,blocks:[p('(1) 関数print_scheduleの仕様は次のとおりである。ここで，引数の値に誤りはないものとする。'),table('関数print_scheduleの仕様',['項目','内容'],[['機能','対象サブシステムの開発作業順序などを出力する。'],['引数 num_s','対象サブシステム数'],['引数 job','対象サブシステム情報（JOB型の配列）'],['引数 job_sch','開発作業順序（int型の配列）']]),p('(2) 図1に示す五つの対象サブシステムの対象サブシステム情報に対して関数job_schedulingを実行した。このときに得られた開発作業順序を，図2に示す。'),fig('job-data','図1 対象サブシステム情報'),fig('schedule-order','図2 開発作業順序'),p('(3) 続けて，関数print_scheduleを実行した。その出力結果の3行目を図3に示す。'),fig('third-output-line','図3 関数print_scheduleの出力結果の3行目')]},
{page:46,blocks:[heading('〔プログラム2〕'),code(q9Program2,'c')],banks:[choiceBankText('e，f',q9Input([index]).numbers.map(String))]}
];}
export const q9OriginalPageAlt=()=>{const result=pageAlt(pages(0,true));const whole=panelAlt(q9Panel('program1',[0]));const split=whole.indexOf('        } else {');result[43]=result[43].replace(whole,whole.slice(0,split));result[44]=whole.slice(split)+'\n\n'+result[44];return result;};
export function q9Build(values:number[],original=false):GeneratedBody{const index=selectCase(values,candidates.length),x=q9Input(values),r=x.rows[2];const prompt=pages(index,original).flatMap(pg=>pg.blocks);const contexts=structuredClone(ref.contexts);if(!original)contexts.push({title:'公式訂正の適用について',blocks:[p('IPA公式訂正を反映：目標作業期間は半年ごとの一連の開発作業の開始日を基準とし，wtは各対象サブシステムの遅延日数を表す。原文と公式訂正は参照資料で確認できます。')]});return answerBody(prompt,[...(['a','b','c','d'] as const).map((n,i)=>({names:[n],labels:[`設問1 ${n}`],options:q9Banks[n],keys:[[3,0,5,1][i]],language:'c'})),{names:['e','f'],labels:['設問2 e','設問2 f'],options:x.numbers.map(String),keys:[x.numbers.indexOf(r.late),x.numbers.indexOf(r.total)]}],`a：j=0なら逆順の後側i+1，j=1なら前側iを参照するのでi−j+1。b：隣のi+1の要素と交換する。c：iを先に1減らした位置の作業日数をftから引くので--i。i--では減算前の要素を参照する。d：順序を変えずに進むとき，今の作業日数を累積時間ftに加えるので+=。この手順は与えられた隣接交換の局所改善であり，全順列の最適性を仮定しない。\n開発順序は${x.order.join('，')}。3行目は${r.code}で，終了まで${r.finish}日，目標${x.jobs[r.id].target}日なので遅延日数eは${r.late}日。ここまでの各行の遅延日数は${x.rows.slice(0,3).map(a=>a.late).join('，')}日で，累計fは${r.total}日。ftとwt_sumを混同しない。`,contexts);}
export const legacy2016AutumnPm9Definition:AfternoonBookletDefinition={source:'2016h28a-fe-pm-9',title:'旧制度・午後：Cによる開発作業順序の決定',fields:[field('条件の選択番号',0,candidates.length-1)],reference:[0],sourceAnswer:'設問1 a=エ，b=ア，c=カ，d=イ／設問2 e=ウ，f=カ',version:'3.6.0',publicNotes:'原問題のCプログラム・解答欄を維持し，開発作業日数と対応する図・数値選択肢を変更します。IPA公式訂正を反映しています。',notes:variableNotes+' 全6頁，6解答欄，26固有択／34参照。23有限候補，reference0は原値・原8数値択。値の衝突する候補を生成域から除外。C11コンパイルと独立prefix再計算で全有限域と境界を検算する。',fixedReferenceAssetIds:ref.assets,build:q9Build};
