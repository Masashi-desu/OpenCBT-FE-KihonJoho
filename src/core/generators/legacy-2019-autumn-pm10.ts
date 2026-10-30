import{code,field,p,table,strings,type GenerationDefinition}from'./definition';
export type AutumnSale={store:number;kind:number;discount:number};
export function autumnSalesAggregate(records:readonly AutumnSale[],low=20,high=50){if(!Number.isInteger(low)||!Number.isInteger(high)||low<=0||low>=high||high>=100)throw Error('INVALID_DISCOUNTS');const sorted=records.map(r=>{if(!Number.isInteger(r.store)||r.store<1||r.store>5||!Number.isInteger(r.kind)||r.kind<1||r.kind>9999||![0,low,high,100].includes(r.discount))throw Error('INVALID_SALE');return r;}).sort((a,b)=>a.store-b.store||a.kind-b.kind),result:{store:number;kind:number;sold:number;average:number;disposed:number;graph:string;counts:number[]}[]=[];let current:{store:number;kind:number;counts:number[]}|undefined;const flush=()=>{if(!current)return;const counts=current.counts,[full,first,second,disposed]=counts,sold=full+first+second;if(sold+disposed>50)throw Error('STOCK_LIMIT');result.push({store:current.store,kind:current.kind,sold,average:sold?Math.trunc((first*low+second*high)/sold):0,disposed,graph:'0'.repeat(full)+'o'.repeat(first)+'_'.repeat(second)+'*'.repeat(disposed),counts:[...counts]});};for(const r of sorted){if(!current||r.store!==current.store||r.kind!==current.kind){flush();current={store:r.store,kind:r.kind,counts:[0,0,0,0]};}current.counts[[0,low,high,100].indexOf(r.discount)]++;}flush();return result;}
export const autumnSalesSource='2019r01a-fe-pm-10';
export function autumnSalesModel(values:number[]){if(values.length!==2||values.some((v,i)=>!Number.isInteger(v)||v<0||v>[3,9][i]))throw Error('PARAMETER_CONSTRAINT');const[discountCase,stock]=values,[low,high]=[[20,50],[10,30],[15,40],[25,60]][discountCase],groups=[[1,1,12+stock,4,2,2],[1,10,8,1+stock,3,3],[2,1,17,2,5+stock,1]],records:AutumnSale[]=[];for(const[store,kind,...counts]of groups)counts.forEach((n,i)=>{for(let j=0;j<n;j++)records.push({store,kind,discount:[0,low,high,100][i]});});return{low,high,records,rows:autumnSalesAggregate(records,low,high)};}
export const autumnSalesCode=` 1 DATA DIVISION.
 2 FILE SECTION.
 3 SD SRT-FILE.
 4 01 SRT-REC.
 5    02 SRT-STOR       PIC 9(2).
 6    02 SRT-CODE       PIC 9(4).
 7    02 SRT-DSCT       PIC 9(3).
 8 FD SAL-FILE.
 9 01 SAL-REC           PIC X(9).
10 FD PRT-FILE.
11 01 PRT-REC.
12    02 PRT-STOR       PIC 9(2).
13    02 PRT-SP1        PIC X(8).
14    02 PRT-CODE       PIC 9(4).
15    02 PRT-SP2        PIC X(6).
16    02 PRT-SALNO      PIC Z9.
17    02 PRT-SP3        PIC X(8).
18    02 PRT-DSCT       PIC Z9.
19    02 PRT-SP4        PIC X(10).
20    02 PRT-DSPNO      PIC Z9.
21 WORKING-STORAGE SECTION.
22 77 SRT-FLAG          PIC X(1) VALUE SPACE.
23    88 SRT-EOF        VALUE "E".
24 77 CR-STOR           PIC 9(2) VALUE ZERO.
25 77 CR-CODE           PIC 9(4).
26 77 W-SALNO           PIC 9(2).
27 77 W-DSPNO           PIC 9(2).
28 77 W-TOTAL           PIC 9(4).
29 77 W-DSCT            PIC 9(2).
30 PROCEDURE DIVISION.
31 MAIN-PROC.
32    OPEN OUTPUT PRT-FILE.
33    SORT SRT-FILE ASCENDING KEY SRT-STOR SRT-CODE
34      USING SAL-FILE
35      OUTPUT PROCEDURE IS RET-PROC.
36    CLOSE PRT-FILE.
37    STOP RUN.
38 RET-PROC.
39    PERFORM UNTIL SRT-EOF
40      RETURN SRT-FILE AT END SET SRT-EOF TO TRUE
41          NOT AT END PERFORM CAL-PROC
42      END-RETURN
43    END-PERFORM.
44    PERFORM PRT-PROC.
45 CAL-PROC.
46    IF [a] THEN
47      PERFORM PRT-PROC
48      MOVE ZERO TO [b]
49      MOVE SRT-STOR TO CR-STOR
50      MOVE SRT-CODE TO CR-CODE
51    END-IF.
52    IF SRT-DSCT = 100 THEN
53      ADD 1 TO W-DSPNO
54    ELSE
55      ADD 1 TO W-SALNO
56      [c]
57    END-IF.
58 PRT-PROC.
59    IF [d] THEN
60      INITIALIZE PRT-REC
61      MOVE CR-STOR TO PRT-STOR
62      MOVE CR-CODE TO PRT-CODE
63      MOVE W-SALNO TO PRT-SALNO
64      IF W-SALNO NOT = ZERO THEN
65        COMPUTE W-DSCT = W-TOTAL / W-SALNO
66        MOVE W-DSCT TO PRT-DSCT
67      END-IF
68      MOVE W-DSPNO TO PRT-DSPNO
69      WRITE PRT-REC
70    END-IF.`;
export const legacy2019AutumnSalesDefinitions:GenerationDefinition[]=[{source:autumnSalesSource,title:'旧制度・午後：COBOLの販売集計',version:'3.2.0',answerVariation:'fixed',fields:[field('discountStageCase',0,3),field('salesDistributionCase',0,9)],reference:[0,0],sourceAnswer:'設問1 aエ bオ cイ dイ／設問2 eウ fア',notes:'原50〜56頁の3/印字例/70行/グラフ/変更表、a〜f6欄、4/5/5/4/4/5択を保持。全5店舗/店舗2桁/種別4桁/値引3桁、1種類50以内、廃棄100、SORT二キー、EOF後末尾処理、平均から廃棄を除外、PIC整数切捨て、Z9、グラフ0/o/_/*順・長さ50・参照修飾1始まりを保持。原の印字例は12/4/2/2、8/1/3/3、17/2/5/1で再構成。割引段階4条件と実売分布10条件の40条件で本文・EVALUATE・平均・グラフを同時変更する。空欄の命令の役割は固定なのでanswerVariation fixed。正答を変えるための別形式へ置換しない。COBOL処理系での実機実行は行っていない。',build:values=>{const m=autumnSalesModel(values),z=(v:number,width:number)=>String(v).padStart(width,'0'),rows=m.rows.map(r=>[z(r.store,2),z(r.kind,4),String(r.sold),String(r.average),String(r.disposed)]),banks=[['SRT-STOR = CR-STOR AND SRT-CODE = CR-CODE','SRT-STOR = CR-STOR OR SRT-CODE = CR-CODE','SRT-STOR NOT = CR-STOR AND SRT-CODE NOT = CR-CODE','SRT-STOR NOT = CR-STOR OR SRT-CODE NOT = CR-CODE'],['CR-STOR CR-CODE','PRT-SALNO PRT-DSPNO','PRT-STOR PRT-CODE','W-DSCT','W-SALNO W-DSPNO W-TOTAL'],['ADD 1 TO W-TOTAL','ADD SRT-DSCT TO W-TOTAL','MOVE SRT-DSCT TO W-TOTAL','MOVE ZERO TO SRT-DSCT','MOVE ZERO TO W-DSPNO'],['CR-STOR = ZERO','CR-STOR NOT = ZERO','NOT SRT-EOF','SRT-EOF'],['行番号50と51の間','行番号53と54の間','行番号56と57の間','行番号59と60の間'],['1','W-DSCT','W-DSPNO','W-SALNO','W-TOTAL']],offsets=[0,4,9,14,18,22],graphProgram=`MOVE 1 TO W-POS
IF W-DSCT00 > ZERO THEN
    MOVE ALL "0" TO PRT-GRAPH(W-POS:W-DSCT00)
    ADD W-DSCT00 TO W-POS
END-IF
IF W-DSCT20 > ZERO THEN
    MOVE ALL "o" TO PRT-GRAPH(W-POS:W-DSCT20)
    ADD W-DSCT20 TO W-POS
END-IF
IF W-DSCT50 > ZERO THEN
    MOVE ALL "_" TO PRT-GRAPH(W-POS:W-DSCT50)
    ADD W-DSCT50 TO W-POS
END-IF
IF W-DSPNO > ZERO THEN
    MOVE ALL "*" TO PRT-GRAPH(W-POS:W-DSPNO)
END-IF`;
 return{prompt:[p('問10 次のCOBOLプログラムの説明及びプログラムを読んで、設問1、2に答えよ。'),p(`W社は5店舗のスーパーマーケットで弁当を販売する。各店舗が1日に仕入れる個数は1種類50個以内である。売れ残りを減らすため18時以降は正価の${m.low}%引き、19時以降は${m.high}%引きで売り、閉店後は売れ残りを廃棄する。販売ファイルを読み、店舗ごとに販売リストを出力する。`),table('図1 販売ファイルのレコード様式',['店舗番号','弁当種別','値引率'],[['2桁','4桁','3桁']]),p(`SAL-FILEは全5店舗で1日に販売又は廃棄した弁当の順ファイルで、弁当1個に1レコードを作る。店舗番号は01〜05、種類に一意の弁当種別、正価の000・${m.low}%引きの${z(m.low,3)}・${m.high}%引きの${z(m.high,3)}・廃棄の100を格納する。`),table('図2 販売リストの印字様式（見出しは印刷済み）',['店舗番号','弁当種別','販売個数','平均値引率','廃棄個数'],[['99','9999','Z9','Z9','Z9']]),p('販売個数と平均値引率には廃棄した弁当を含めない。全部廃棄した場合の平均値引率は0を印字する。リストは店舗番号及び弁当種別の昇順で印字する。'),table('図3 販売リストの印字例（一部）',['店舗番号','弁当種別','販売個数','平均値引率','廃棄個数'],rows),p('ほかの店舗・種別の行は省略している。'),code(autumnSalesCode,'cobol'),p('設問1 プログラム中のa〜dへ入れる正しい答えを各解答群から選べ。行番号は変更位置を表す。'),p(`設問2 図4のように販売リストへ販売グラフを追加する。正価を0、${m.low}%引きをo、${m.high}%引きを_、廃棄を*として、該当個数だけこの順に印字する。`),table('図4 販売グラフを追加した印字例（一部）',['店舗番号','弁当種別','販売個数','平均値引率','廃棄個数','販売グラフ'],rows.map((r,i)=>[...r,m.rows[i].graph])),p('表1の変更内容中のe、fに入れる正しい答えを各解答群から選べ。変数W-DSCT20、W-DSCT50は変更後もそれぞれ第1、第2の値引段階の件数を表す。'),table('表1 プログラムの変更内容',['処置','変更内容'],[['行20と21の間へ追加','02 PRT-SP5 PIC X(8).\n02 PRT-GRAPH PIC X(50).'],['行29と30の間へ追加','77 W-DSCT00 PIC 9(2).\n77 W-DSCT20 PIC 9(2).\n77 W-DSCT50 PIC 9(2).\n77 W-POS PIC 9(2).'],['行47と48の間へ追加','MOVE ZERO TO W-DSCT00 W-DSCT20 W-DSCT50'],['［e］へ追加',`EVALUATE SRT-DSCT\n WHEN 0 ADD [f] TO W-DSCT00\n WHEN ${m.low} ADD [f] TO W-DSCT20\n WHEN ${m.high} ADD [f] TO W-DSCT50\nEND-EVALUATE`],['行68と69の間へ追加',graphProgram]])],choices:banks.flatMap(strings),answerParts:banks.map((b,i)=>({id:'part-'+'abcdef'[i],label:`設問${i<4?1:2} ${'abcdef'[i]}`,choiceIds:b.map((_,j)=>'choice-value-'+(offsets[i]+j+1))})),partAnswers:[3,4,1,1,2,0].map((v,i)=>({kind:'choice'as const,partId:'part-'+'abcdef'[i],choiceId:'choice-value-'+(offsets[i]+v+1)})),explanation:'aは店舗又は種類のどちらかが変わると前グループを出力するOR。bは販売数、廃棄数、値引率合計を全て0にする。cは販売分の値引率を合計し、廃棄100は合計しない。dは初期のCR-STOR=0では出力せず、実データのグループだけを出力する。EOF後にも最後のグループを出力する。eは各販売レコードを処理するELSE内の56と57の間であり、fは1個のレコードごとに1を加える。平均は値引率合計÷販売数をPIC 9(2)へ格納するので小数部を切り捨てる。'};}}];
