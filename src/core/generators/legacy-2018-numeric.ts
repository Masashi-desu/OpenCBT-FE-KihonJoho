import { field, p, table, strings, variableNotes, type GenerationDefinition } from "./definition";

// Annual candidates stay unregistered until the parent integration review.
// This module uses no OCR, review fixtures or data-supplied executable code.
const reject = () => { throw Error("PARAMETER_CONSTRAINT"); };
const fmt = (n:number) => Number.isInteger(n) ? String(n) : String(Number(n.toFixed(1)));
const gcd = (a:number,b:number):number => b ? gcd(b,a%b) : a;
const fraction = (a:number,b:number) => { const d=gcd(a,b); return `${a/d}/${b/d}`; };
function define(period:"h"|"a", number:number,title:string,sourceAnswer:string, fields:GenerationDefinition["fields"],reference:number[],build:GenerationDefinition["build"],notes:string):GenerationDefinition {
  return {source:`2018h30${period}-fe-am-${number}`,title,sourceAnswer,fields,reference,notes:variableNotes+" "+notes,build:values=>{
    if(values.length!==fields.length || values.some((v,i)=>!Number.isInteger(v)||v<fields[i].minimum||v>fields[i].maximum))reject();
    const body=build(values);
    const valuesText=body.choices.map(c=>JSON.stringify(c));
    if(new Set(valuesText).size!==valuesText.length)reject();
    return body;
  }};
}
export const legacy2018NumericDefinitions: GenerationDefinition[] = [
  define("h",32,"サブネット内でPCに割り振れないIPv4アドレス","エ",[field("ホスト部のビット数",4,6),field("サブネットの番号",1,2),field("割り振れないアドレスの種類",0,1)],[4,1,1],([hostBits,block,endpoint])=>{
    const size=2**hostBits,start=size*block,prefix="200.170.70.",options=[start+1,start+4,start+size-2,endpoint?start+size-1:start].map(n=>prefix+n);
    return {prompt:[p("次のネットワークアドレスとサブネットマスクをもつネットワークがある。このネットワークをあるPCが利用する場合、そのPCに割り振ってはいけないIPアドレスはどれか。"),p(`ネットワークアドレス：${prefix}${start}`),p(`サブネットマスク：255.255.255.${256-size}`)],choices:strings(options),correctIndex:3,explanation:`このマスクではホスト部が下位${hostBits}ビットとなり、${size}個のアドレスを含む。ネットワークアドレスは${prefix}${start}、ブロードキャストアドレスは${prefix}${start+size-1}。両端はPCのホストアドレスに割り振れないので、選択肢では${options[3]}となる。他の三つはこの二つの間にある利用可能なホストアドレス。IPv4は32ビットのIPアドレスである。`};
  },"ネットワークアドレス・マスクの二行、否定の問い、同一サブネットの4アドレス択を保持。ホスト部4〜6ビット・二つのサブネット・禁止端点の種類を変えた全12入力を、表示マスクのビット演算と利用可能ホストの列挙で独立検算。/31や/32を含めず、原問の通常のホスト割当の条件を保つ。"),
  define("h",1,"2の補数の下位ビットと剰余","ア",[field("最下位ビット数",2,3),field("奇数剰余の番号",0,3)],[2,1],([width,index])=>{
    const divisor=2**width,r=2*index+1;if(r>=divisor)reject();
    return {prompt:[p(`ある整数値を、負数を2の補数で表現する2進表記法で表すと最下位${width}ビットは“${r.toString(2).padStart(width,"0")}”であった。10進表記法の下で、その整数値を${divisor}で割ったときの余りに関する記述として、適切なものはどれか。ここで、除算の商は、絶対値の小数点以下を切り捨てるものとする。`)],choices:strings([`その整数値が正ならば${r}`,`その整数値が負ならば−${r}`,`その整数値が負ならば${r}`,"その整数値の正負にかかわらず0"]),correctIndex:0,explanation:`正の整数の余りは下位${width}ビットが表す${r}になる。負数で同じ下位ビットをもつ場合、商を0方向へ切り捨てるので余りは${r}−${divisor}＝${r-divisor}。下位ビットを単純に符号反転した−${r}や、正の${r}にはならない。`};
  },"奇数剰余だけを許して正負の二つの記述が同時に真になる半分の値を除く。2/3下位ビットの全6入力を、符号付き8ビット全整数の除算で独立照合。"),
  define("h",52,"工程工数による進捗加重平均","ウ",[field("完成プログラムの五分率",1,4),field("プログラミング工数の百分率を5で割った値",4,6)],[2,5],([completed,fifth])=>{
    const ratio=fifth*5,answer=44+completed*fifth;
    return {prompt:[p(`あるプロジェクトの工数配分は表のとおりである。基本設計からプログラム設計までは計画どおり終了した。現在はプログラミング段階であり、3,000本のプログラムのうち${(completed*600).toLocaleString("en-US")}本が完成したところである。プロジェクト全体の進捗度は何％か。ここで、各プログラムの開発工数は、全て等しいものとする。`),table("工数配分",["基本設計","詳細設計","プログラム設計","プログラミング","テスト"],[["0.08","0.16","0.20",(ratio/100).toFixed(2),((56-ratio)/100).toFixed(2)]])],choices:strings([completed*20,44,answer,answer+fifth].map(String)),correctIndex:2,explanation:`完了した工程は8＋16＋20＝44%。プログラミングの完成割合は${completed*600}÷3000＝${completed}/5なので、全体への寄与は${ratio}×${completed}/5＝${completed*fifth}ポイント。合計は${answer}%。単にプログラムの完成割合だけを答えたり、未完成の次の五分の一まで計上したりしない。`};
  },"全12候補中11有効。完成割合3/5・工程重み20%では誤答同士が60で一致するため拒否。工数配分合計1、全プログラム等工数、5工程と表の形式を保持し、完成数と現在工程の重みを連動。整数%以外を生成しない。"),
  define("h",53,"工数の三乗根による開発期間","イ",[field("三乗根の平方根",2,4),field("期間係数の2倍",4,6)],[4,5],([k,c])=>{
    const root=k*k,work=root**3,square=k**3,multiplier=c/2,options=[root,root*multiplier,square,square*multiplier];
    if(options.some(n=>!Number.isInteger(n)))reject();
    return {prompt:[p(`システム開発において、工数（人月）と期間（月）の関係が次の近似式で示されるとき、工数が${work.toLocaleString("en-US")}人月のときの期間は何か月か。`),p(`期間＝${multiplier}×工数の1/3乗`)],choices:strings(options.map(String)),correctIndex:1,explanation:`${root}×${root}×${root}＝${work}なので、工数の三乗根は${root}。期間は${multiplier}×${root}＝${root*multiplier}か月。${square}は工数の平方根であり、1/3乗とは異なる。`};
  },"基準4096・係数2.5・4整数択を保持。平方根との混同と係数漏れを誤答にする。全9候補のうち6有効、非整数又は重複の3候補は拒否。"),
  define("h",54,"ファンクションポイントの補正","ア",[field("外部入力の個数",1,3),field("外部出力の個数",2,4),field("内部論理ファイルの個数",1,2),field("補正係数の4倍",2,3)],[1,2,1,3],([input,output,files,c])=>{
    const raw=4*input+5*output+10*files,factor=c/4,options=[raw*factor,raw,raw*(2-factor),raw/factor];
    if(options.some(n=>!Number.isInteger(n)))reject();
    return {prompt:[p(`あるソフトウェアにおいて、機能の個数と機能の複雑度に対する重み付け係数は表のとおりである。このソフトウェアのファンクションポイント値は幾らか。ここで、ソフトウェアの全体的な複雑さの補正係数は${factor}とする。`),table("機能の個数と重み付け係数",["ユーザファンクションタイプ","個数","重み付け係数"],[["外部入力",String(input),"4"],["外部出力",String(output),"5"],["内部論理ファイル",String(files),"10"]])],choices:strings(options.map(String)),correctIndex:0,explanation:`補正前は${input}×4＋${output}×5＋${files}×10＝${raw}。これに補正係数${factor}を掛けて${options[0]}。補正を省く${raw}、別の倍率${2-factor}を掛ける${options[2]}、逆に係数で割る${options[3]}は異なる。FP（Function Point、ファンクションポイント）は利用者から見た機能の量を測る尺度である。`};
  },"原表3行の個数と補正係数0.5/0.75を変更。丸めなしで4整数択を区別できる組だけを許可。全36候補を別の重み展開で検査。"),
  define("h",67,"規模の経済と範囲の経済","イ",[field("スケールメリットの有無",0,1),field("シナジー効果の有無",0,1),field("基本費用の100万円単位の加算",0,2)],[0,1,0],([scale,synergy,shift])=>{
    const a=1500+100*shift,c=500+100*shift,b=2*a+(scale?-300:300),d=2*c+(scale?-100:100),e=a+c+(synergy?-100:100),f=b+d+(synergy?-200:200);
    const rows=[["A",20,0,a],["B",40,0,b],["C",0,10,c],["D",0,20,d],["E",20,10,e],["F",40,20,f]].map(r=>r.map(String));
    return {prompt:[p("あるメーカがビールと清涼飲料水を生産する場合、表に示すように6種類のケース（A〜F）によって異なるコストが掛かる。このメーカの両製品の生産活動におけるスケールメリットとシナジー効果に関する記述のうち、適切なものはどれか。"),table("生産量とコスト",["ケース","ビール（万本）","清涼飲料水（万本）","コスト（万円）"],rows)],choices:strings(["スケールメリットはあるが、シナジー効果はない。","スケールメリットはないが、シナジー効果はある。","スケールメリットとシナジー効果がともにある。","スケールメリットとシナジー効果がともにない。"]),correctIndex:scale?(synergy?2:0):(synergy?1:3),explanation:`生産量を2倍にしたBの費用${b}はAの2倍${2*a}より${scale?"小さく":"大きく"}、Dの費用${d}もCの2倍${2*c}より${scale?"小さい":"大きい"}。よって単位コストが下がるスケールメリットは${scale?"ある":"ない"}。共同生産Eの${e}はA＋Cの${a+c}より${synergy?"小さく":"大きく"}、Fでも${f}とB＋Dの${b+d}で同じ関係なので、シナジー効果は${synergy?"ある":"ない"}。`};
  },"数量6ケース・表・二効果の有無を組み合わせる4記述を保持。両規模で結論を一致させるコスト制約。全12入力を単位コストと別生産合計から独立検算。"),
  define("h",78,"先入先出法の月末在庫評価","エ",[field("全数量の倍率",1,3),field("全単価の10円単位の加算",0,2)],[1,0],([scale,shift])=>{
    const prices=[100,120,130,110].map(n=>n+10*shift),qty=[10,40,30,30,10,30].map(n=>n*scale),remaining=30*scale,weighted=(10*prices[0]+40*prices[1]+30*prices[2]+10*prices[3])/90,moving=((10*prices[0]+40*prices[1])*20/50+30*prices[2]+10*prices[3])/60,answer=20*scale*prices[2]+10*scale*prices[3];
    return {prompt:[p("商品Aの当月分の全ての受払いを表に記載した。商品Aを先入先出法で評価した場合、当月末の在庫の評価額は何円か。"),table("当月の受払い",["日付","摘要","受入個数","払出個数","単価（円）"],[["1","前月繰越",String(qty[0]),"",String(prices[0])],["4","仕入",String(qty[1]),"",String(prices[1])],["5","売上","",String(qty[2]),"—"],["7","仕入",String(qty[3]),"",String(prices[2])],["10","仕入",String(qty[4]),"",String(prices[3])],["30","売上","",String(qty[5]),"—"]])],choices:strings([remaining*prices[3],remaining*weighted,remaining*moving,answer].map(String)),correctIndex:3,explanation:`先入先出法では古い在庫から払い出す。二回の払出し後は7日の仕入れが${20*scale}個、10日の仕入れが${10*scale}個残る。評価額は${20*scale}×${prices[2]}＋${10*scale}×${prices[3]}＝${answer}円。全てを直近の単価にしたり、総平均単価${weighted}円や移動平均単価${moving}円を使ったりしない。`};
  },"全6受払い・日付・先入先出・末日在庫という解答対象を保持。数量倍率と全価格への10円加算の全9入力。単価平均は常に整数、在庫不足を生じない。"),
  define("a",1,"16進小数の分数化","エ",[field("16進小数の第1桁",1,2),field("16進小数の第2桁",0,4)],[2,4],([a,b])=>{
    const hexadecimal=`${a}${b}8`,decimal=100*a+10*b+8,actual=256*a+16*b+8,wrongNumerator=decimal/gcd(decimal,256);
    return {prompt:[p(`16進数の小数0.${hexadecimal}を10進数の分数で表したものはどれか。`)],choices:strings([fraction(decimal,256),fraction(decimal,1000),fraction(wrongNumerator,512),fraction(actual,4096)]),correctIndex:3,explanation:`16進小数の各桁の重みは1/16、1/256、1/4096。${a}/16＋${b}/256＋8/4096＝${actual}/4096＝${fraction(actual,4096)}。数字の並びをそのまま十進整数${decimal}とみなして分子に使うのは誤り。`};
  },"3桁・末尾8・分数四択を保持。第1桁1/2、第2桁0〜4の全10入力。分母の役割は256/1000/512/4096、全択を既約分数で表示し有理数として別検算。"),
  define("a",9,"命令出現率によるMIPS","エ",[field("命令構成",0,1),field("動作クロックの倍率",1,3)],[0,2],([variant,scale])=>{
    const cycles=variant?[2,4,6]:[4,8,10],rates=variant?[25,50,25]:[30,60,10],clock=(variant?200:350)*scale,answer=50*scale;
    return {prompt:[p(`動作クロック周波数が${clock}MHzのCPUで、命令実行に必要なクロック数及びその命令の出現率が表に示す値である場合、このCPUの性能は約何MIPSか。`),table("命令の種別と出現率",["命令の種別","命令実行に必要なクロック数","出現率（%）"],["レジスタ間演算","メモリ・レジスタ間演算","無条件分岐"].map((name,i)=>[name,String(cycles[i]),String(rates[i])]))],choices:strings([answer/10,answer/2,answer*7/10,answer].map(String)),correctIndex:3,explanation:`1命令の平均必要クロックは${cycles.map((n,i)=>`${n}×${rates[i]}/100`).join("＋")}＝${variant?4:7}。毎秒${clock}百万クロックをこの平均で割り、${clock}÷${variant?4:7}＝${answer}MIPS。MIPS（Million Instructions Per Second）は毎秒百万命令の単位。CPU（Central Processing Unit）は中央処理装置、MHz（メガヘルツ）は毎秒百万周期を表す。`};
  },"三命令種・クロック数・百分率表と四数値択を維持。6入力の平均クロックと整数MIPSを独立検算。誤答は原選択肢比率を保存した候補であり、一般の誤り公式とは主張しない。"),
  define("a",11,"データバス幅と冗長ビット","ウ",[field("指数n",4,9)],[7],([n])=>({prompt:[p(`メモリのエラー検出及び訂正にECCを利用している。データバス幅2のn乗ビットに対して冗長ビットがn＋2ビット必要なとき、${2**n}ビットのデータバス幅に必要な冗長ビットは何ビットか。`)],choices:strings([n,n+1,n+2,n+3].map(String)),correctIndex:2,explanation:`${2**n}＝2の${n}乗なのでn＝${n}。与えられた関係に代入すると${n}＋2＝${n+2}ビット。ECC（Error Correcting Code）は誤り訂正符号を表す。ここでは問題文で与えられた必要ビット数の式を使う。`}),"幅16〜512の全6入力。2の整数乗と原問のn＋2の関係を固定する。原問どおり自然な隣接整数4択とし、ECC全方式に共通する実装式とはしない。"),
  define("a",37,"AESの全鍵探索の最大試行回数","エ",[field("AESの鍵長の種類",0,2)],[2],([kind])=>{
    const bits=[128,192,256][kind],options=[String(bits),`2^${bits/2}`,`2^${bits-1}`,`2^${bits}`];
    return {prompt:[p(`AES-${bits}で暗号化されていることが分かっている暗号文が与えられているとき、ブルートフォース攻撃で鍵と解読した平文を得るまでに必要な試行回数の最大値はどれか。`)],choices:strings(options),correctIndex:3,explanation:`AES-${bits}の鍵長は${bits}ビット。各ビットの0/1の組合せは2^${bits}通りあり、ブルートフォース攻撃で全ての鍵候補を試す最大回数は2^${bits}回となる。鍵長の数値${bits}そのものを試行回数にせず、最大値を平均的な探索回数に置き換えない。AES（Advanced Encryption Standard）は共通鍵暗号方式である。`};
  },"暗号文・方式が分かっている条件、ブルートフォースの最大試行回数、数値と2の指数の4択を保持。AESの正式な128/192/256ビットを用い、原択の鍵長自体・半分の指数・最大の半分・全鍵数の区別を保存。NIST FIPS197の方式名と鍵長の事実のみ参照し、規格文言や図表を転載しない。全3入力をBigIntで鍵候補数と比較。"),
  define("a",54,"FP・導入教育・管理を含む総工数","エ",[field("機能規模の100FP単位",3,8),field("導入教育の10人月単位",1,2),field("管理率の10%単位",1,2)],[5,1,1],([size,onboard,rate])=>{
    const dev=size*10,training=onboard*10,total=(dev+training)*(10+rate)/10,options=[dev+training*rate/10,dev+training,dev*(10+rate)/10+training,total];
    return {prompt:[p(`ある新規システムの機能規模を見積もったところ、${size*100}FP（ファンクションポイント）であった。このシステムを構築するプロジェクトには、開発工数のほかに、システム導入と開発者教育の工数が、合計で${training}人月必要である。また、プロジェクト管理に、開発と導入・教育を合わせた工数の${rate*10}%を要する。このプロジェクトに要する全工数は何人月か。ここで、開発の生産性は1人月当たり10FPとする。`)],choices:strings(options.map(String)),correctIndex:3,explanation:`開発工数は${size*100}÷10＝${dev}人月。導入・教育を加えると${dev}＋${training}＝${dev+training}人月で、管理はこの合計の${rate*10}%、すなわち${(dev+training)*rate/10}人月。総工数は${total}人月。開発だけを管理率の対象とする${options[2]}人月では、導入・教育に対応する管理を落としている。FP（Function Point）は利用者から見た機能の量を表す尺度。`};
  },"三つの工数区分・率の対象・生産性の前提を保持。全24入力は整数人月で正確。4択は原問と同じ工数計上漏れの役割。"),
  define("a",57,"SLA可用性から停止上限","イ",[field("営業日数の10日単位",2,3),field("不稼働率の0.5%単位",1,2)],[3,1],([daysUnit,rate])=>{
    const days=daysUnit*10,perMille=rate*5,availability=100-perMille/10,options=[2,14,20,24].map(hours=>hours*days*perMille/1000),answer=options[1];
    return {prompt:[p(`次の条件でITサービスを提供している。SLAを満たすことができる、1か月のサービス時間帯中の停止時間は最大何時間か。ここで、1か月の営業日数は${days}日とし、サービス時間帯中は、保守などのサービス計画停止は行わないものとする。`),p("〔SLAの条件〕"),{type:"list",ordered:false,items:["サービス時間帯は、営業日の午前8時から午後10時までとする。",`可用性を${availability.toFixed(1)}%以上とする。`]}],choices:strings(options.map(n=>n.toFixed(1))),correctIndex:1,explanation:`1日のサービスは22−8＝14時間、月間は14×${days}＝${14*days}時間。停止割合は最大${perMille/10}%なので、${14*days}×${perMille}/1000＝${fmt(answer)}時間。1日24時間を分母にした${fmt(options[3])}時間は、指定されたサービス時間帯の可用性ではない。SLA（Service Level Agreement）はサービス水準についての合意。`};
  },"日付・サービス時間・以上・最大・計画停止なしの条件を保持。全4入力の全選択肢を小数第1位で正確に表示。原選択肢の2/14/20/24時間比を保持するQA-04の限定調整。"),
  define("a",68,"一次需要曲線の内挿","エ",[field("需要0となる価格の500円単位",4,8),field("既知需要の価格の500円単位",1,3),field("問う価格の500円単位",2,5),field("既知需要の10000個単位",4,8)],[6,2,3,6],([zero,low,query,amount])=>{
    if(!(low<query&&query<zero))reject();const answer=amount*10000*(zero-query)/(zero-low);if(!Number.isInteger(answer/5000)||answer<20000)reject();
    return {prompt:[p("ある製品の設定価格と需要との関係が1次式で表せるとき、aに入れる適切な数値はどれか。"),{type:"list",ordered:true,items:[`設定価格を${zero*500}円にすると、需要は0個になる。`,`設定価格を${low*500}円にすると、需要は${amount*10000}個になる。`,`設定価格を${query*500}円にすると、需要は空欄a個になる。`]}],choices:strings([answer-15000,answer-10000,answer-5000,answer].map(String)),correctIndex:3,explanation:`価格が${low*500}円から${zero*500}円へ上がると需要は${amount*10000}個から0個へ一次的に減る。${query*500}円では、需要0の価格までの差が${(zero-query)*500}円なので、需要は${amount*10000}×${zero-query}/${zero-low}＝${answer}個。端数の四捨五入はしていない。`};
  },"3条件の文章形式と4数値択・原選択肢の5000個間隔を保持。300候補のうち順序、正の需要、5000個単位の整数解を満たすものだけ許可。全候補を二点を通る一次方程式で検算。"),
  define("a",75,"廃棄費用を含む仕入期待利益","ウ",[field("1個当たり利益の100円単位",6,14),field("1個当たり廃棄損失の100円単位",1,18)],[10,3],([profit,loss])=>{
    const gains=[4,5,6,7].map(stock=>[3,3,3,1].reduce((sum,weight,i)=>sum+weight*(Math.min(stock,i+4)*profit-Math.max(0,stock-i-4)*loss),0));
    const maximum=Math.max(...gains);if(gains.filter(n=>n===maximum).length!==1)reject();const index=gains.indexOf(maximum);
    return {prompt:[p(`商品の1日当たりの販売個数の予想確率が表のとおりであるとき、1個当たりの利益を${profit*100}円とすると、利益の期待値が最大になる仕入個数は何個か。ここで、仕入れた日に売れ残った場合、1個当たり${loss*100}円の廃棄ロスが出るものとする。`),table("仕入個数別の販売個数の予想確率",["仕入個数＼販売個数","4","5","6","7"],[["4","100%","—","—","—"],["5","30%","70%","—","—"],["6","30%","30%","40%","—"],["7","30%","30%","30%","10%"]])],choices:strings(["4","5","6","7"]),correctIndex:index,explanation:`各行について、売れた個数×${profit*100}円から売れ残り個数×${loss*100}円を引き、表示された確率を掛けて合計する。仕入4、5、6、7個の順に期待利益は${gains.map(n=>`${n*10}円`).join("、")}。最大は${index+4}個である。表で仕入個数以上の需要がある場合は、販売個数が仕入個数までに限られる。`};
  },"4×4の元の確率表・利益と廃棄費・最大を選ぶ4択を保持。全162候補を独立した各行の期待値で検算。同率最大は制約違反。100円刻みで丸めなし。"),
  define("a",77,"先入先出法による売上原価","イ",[field("受払個数の倍率",1,3),field("単価の5円単位の加算",0,2)],[1,0],([scale,shift])=>{
    const delta=shift*5,p0=200+delta,p1=215+delta,p2=223+delta,answer=(100*p0+30*p1)*scale,moving=(70*(100*p0+50*p1)/150+60*(80*(100*p0+50*p1)/150+100*p2)/180)*scale,monthly=130*(100*p0+50*p1+100*p2)/250*scale;
    const options=[answer-160*scale,answer,moving,monthly];
    return {prompt:[p("ある商品の前月繰越と受払いが表のとおりであるとき、先入先出法によって算出した当月度の売上原価は何円か。"),table("商品の受払い",["日付","摘要","受入個数","払出個数","単価（円）"],[["1日","前月繰越",String(100*scale),"",String(p0)],["5日","仕入",String(50*scale),"",String(p1)],["15日","売上","",String(70*scale),""],["20日","仕入",String(100*scale),"",String(p2)],["25日","売上","",String(60*scale),""],["30日","翌月繰越","",String(120*scale),""]])],choices:strings(options.map(n=>n.toLocaleString("en-US"))),correctIndex:1,explanation:`先入先出法では古い受入分から払い出す。15日の売上は${70*scale}×${p0}、25日の売上は前月分の残り${30*scale}×${p0}と5日仕入分の${30*scale}×${p1}である。合計の売上原価は${100*scale}×${p0}＋${30*scale}×${p1}＝${answer}円。${moving}円は移動平均法、${monthly}円は月次総平均法で評価した候補であり、指定された先入先出法とは異なる。`};
  },"原6行の受払表、先入先出で当月売上原価を選ぶ方向、5桁整数4択を保持。全受払個数を1〜3倍、全3単価を0/5/10円加算する9入力。移動平均・月次総平均の誤択は各評価法から連動する。下側の原比較値26290は一般の在庫評価式と断定せず、原選択肢との差160円を数量倍率に比例させて保持する限定調整（QA-04）。小数の計算・追加丸めを要求しない。"),
];
