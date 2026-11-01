import {field,p,list,table,strings,figure,variableNotes,type GenerationDefinition,type GeneratedBody} from './definition';
import {am2016Source,am2016Case,am2016DomainCounts,am2016ImageSizes,am2016LanCounts,am2016PipelineOrders,am2016Profiles,am2016LogicKinds,am2016Circuit,am2016KnowledgeTargets,am2016KnowledgeAnswers,am2016KnowledgeExplanations,am2016FixedChoices,am2016FixedExplanations,am2016RelationCases,am2016TransferCases} from './legacy-2016-spring-am-09-32-models';
import {am2016FigureAlt} from './legacy-2016-spring-am-09-32-figure-models';
const source=(n:number)=>am2016Source[String(n) as keyof typeof am2016Source];
const fig=(profile:string,v:number[],caption:string)=>figure(profile,v,caption,am2016FigureAlt(profile,v));
const plain=(prompt:string,choices:readonly string[],correctIndex:number,explanation:string):GeneratedBody=>({prompt:[p(prompt)],choices:strings([...choices]),correctIndex,explanation});
const superscript=(n:number)=>String(n).replace(/[0-9]/g,d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
const decimal=(n:number)=>Number(n.toFixed(8)).toString();
function build(number:number,values:number[]):GeneratedBody {
 const c=am2016Case(number,values),s=source(number);
 if(am2016FixedChoices[number]){const prompt=s.prompt+(number===15&&c>0?' MTBF及びMTTRは正の値とする。':'');return plain(prompt,am2016FixedChoices[number][c],number===11?1:number===15||number===19?2:0,am2016FixedExplanations[number]);}
 if(am2016KnowledgeTargets[number]){
  const t=am2016KnowledgeTargets[number][c];let prompt:string=s.prompt;
  if(number===13)prompt=`${t}の評価尺度はどれか。`;
  if(number===16)prompt=`組込みリアルタイムOSで用いられる，${t}の利用方法として，適切なものはどれか。`;
  if(number===17)prompt=`入出力管理における${t}の機能として，適切なものはどれか。`;
  if(number===18)prompt=`UNIXにおいて，${t}機能はどれか。`;
  if(number===20)prompt=`${t}の機能として，適切なものはどれか。`;
  if(number===22)prompt=`${t}の活用事例として，適切なものはどれか。`;
  if(number===24)prompt=`${t}はどれか。`;
  if(number===25)prompt=`3次元グラフィックス処理における${t}の説明はどれか。`;
  if(number===28)prompt=`${t}を保証する特性はどれか。`;
  if(number===30)prompt=`DBMSにおいて，${t}ために用いる技法はどれか。`;
  if(number===32)prompt=`複数のLANを接続するために用いる装置で，OSI基本参照モデルの${t}装置はどれか。`;
  // Reference is an exact transcription; variants bind the target at the same role.
  if(c===0)prompt=s.prompt;
  return plain(prompt,s.choices,am2016KnowledgeAnswers[number][c],am2016KnowledgeExplanations[number]);
 }
 if(number===10){const circled=(n:number)=>'①②③④⑤'[n-1];return{prompt:[p(s.prompt),list([...am2016Source[10].list])],choices:strings(am2016PipelineOrders[c].map(row=>row.map(circled).join('，'))),correctIndex:2,explanation:'RISC（Reduced Instruction Set Computer，縮小命令セットコンピュータ）のこの5段構成では，命令フェッチ④，デコードとレジスタ読出し③，実行とアドレス生成②，メモリアクセス⑤，書込み①の順に進む。命令を読み出す前にデコードしたり，アドレス計算の前にその結果を用いるメモリアクセスを行ったりする順序は成立しない。定常時に複数の命令を重ねて処理することと，一つの命令の段階の順序を混同しない。'};}
 if(number===12){const[w,h,b]=am2016ImageSizes[c],answer=w*h*b/8/1e6;return plain(c===0?s.prompt:`表示解像度が${w.toLocaleString('en-US')}×${h.toLocaleString('en-US')}ドットで，色数が${(2**b).toLocaleString('en-US')}色（2${superscript(b)}色）の画像を表示するのに最低限必要なビデオメモリ容量は何Mバイトか。ここで，1Mバイト＝1,000kバイト，1kバイト＝1,000バイトとする。`,[1,2,4,8].map(x=>decimal(answer*x)),0,`1画素の色を表すには${b}ビット必要であり，画素数は${w}×${h}=${w*h}。したがって${w*h}×${b}÷8=${w*h*b/8}バイト，${decimal(answer)}Mバイトである。2倍，4倍，8倍の候補は，必要な記憶量をそれぞれ余分に計上した値である。8倍の候補はビットからバイトへの変換を省いた値にも一致する。圧縮や追加の管理領域は仮定せず，指定の十進単位で計算する。`);}
 if(number===14){const[n,m]=am2016LanCounts[c],pow=(x:string,k:number)=>x+superscript(k),cs=[`a${pow('b',n)}${pow('c',m)}`,`a(1−${pow('b',n)})(1−${pow('c',m)})`,`a${pow('(1−b)',n)}${pow('(1−c)',m)}`,`a(1−${pow('(1−b)',n)})(1−${pow('(1−c)',m)})`];return{prompt:[p(c===0?s.prompt:`図のように，1台のサーバ，${n}台のクライアント及び${m}台のプリンタがLANで接続されている。このシステムはクライアントからの指示に基づいて，サーバにあるデータをプリンタに出力する。各装置の稼働率が表のとおりであるとき，このシステムの稼働率を表す計算式はどれか。ここで，クライアントは${n}台のうち1台でも稼働していればよく，プリンタは${m}台のうち1台でも稼働していればよい。`),p('各装置の故障は互いに独立とする。'),fig(am2016Profiles.lan,[n,m],'LANで接続された装置'),table('装置の稼働率',['装置','稼働率'],[['サーバ','a'],['クライアント','b'],['プリンタ','c'],['LAN','1']])],choices:strings(cs),correctIndex:3,explanation:`サーバが稼働する確率はa。クライアント${n}台の全停止は(1−b)${superscript(n)}なので，少なくとも1台稼働する確率は1−(1−b)${superscript(n)}。プリンタも同じ考えで1−(1−c)${superscript(m)}となる。LAN（Local Area Network，局所的なネットワーク）は稼働率1であり，独立した必要条件の積は${cs[3]}。全台稼働の積や，全台稼働の補集合，全台停止の確率とは区別する。`};}
 if(number===23){const kinds=am2016LogicKinds[c],tt=[false,true].flatMap(a=>[false,true].map(b=>am2016Circuit(kinds,a,b))),truths=[[false,true,true,true],[false,false,false,true],[false,true,true,false],[true,false,false,false]],correct=truths.findIndex(x=>JSON.stringify(x)===JSON.stringify(tt));if(correct<0)throw Error('PARAMETER_CONSTRAINT');return{prompt:[p(s.prompt),fig(am2016Profiles.logic,[...kinds],'論理回路')],choices:[0,1,2,3].map(k=>[fig(am2016Profiles.gate,[k],'等価な回路の候補')]),correctIndex:correct,explanation:`入力(A,B)を(0,0)，(0,1)，(1,0)，(1,1)の順に変えて各ゲートの出力を追うと，最終出力Yは${tt.map(Number).join('，')}となる。ORは0，1，1，1，ANDは0，0，0，1，XORは0，1，1，0，NORは1，0，0，0なので，${['OR','AND','XOR','NOR'][correct]}回路と等価である。ANDは論理積，ORは論理和，NANDは否定論理積，NORは否定論理和，XORは排他的論理和である。出力端の小円は否定を表す。`};}
 if(number===27){const spec=am2016RelationCases[c],names=['山田太郎','情報一郎','鈴木花子','技術五郎','小林次郎','試験桃子'],dept=spec.target==='A'?'工学部':'情報学部',x=names.map((name,i)=>[String(i+1),name,spec.codes[i]]),z=x.filter(r=>r[2]===spec.target).map(r=>[dept,r[0],r[1]]);return{prompt:[p(s.prompt),table('X',['学生番号','氏名','学部コード'],x),table('Y',['学部コード','学部名'],[['A','工学部'],['B','情報学部'],['C','文学部']]),table('Z',['学部名','学生番号','氏名'],z)],choices:strings([...s.choices]),correctIndex:0,explanation:`XとYを学部コードで結合すると，学生番号，氏名，学部コード，学部名が得られる。このうち学部名が${dept}である${z.length}行を選択し，学部名，学生番号，氏名の3属性を射影すればZとなる。選択だけでは学部コードが残り，射影だけでは他の学部の学生が残る。和は同じ属性構成の関係を合わせる演算であり，不要な行や属性を除く操作ではない。`};}
 if(number===31){const[rate,mult]=am2016TransferCases[c],scale=mult*64/rate,seconds=mult*1e6*8/(rate*1000*.8),options=[19.6,100,125,156].map(n=>decimal(n*scale));return{...plain(c===0?s.prompt:`${rate}kビット／秒の回線を用いて${mult===1?'10⁶':mult+'×10⁶'}バイトのファイルを送信するとき，伝送におよそ何秒掛かるか。ここで，回線の伝送効率は80%とする。`,options,3,`実効伝送速度は${rate}×1,000×0.8=${rate*800}ビット／秒。ファイルの情報量は${mult}×10⁶×8=${mult*8}×10⁶ビットなので，時間は${mult*8}×10⁶÷${rate*800}=${decimal(seconds)}秒。最も近い候補は${options[3]}秒である。バイトとビットの変換漏れ，伝送効率の未考慮，伝送効率を逆方向に掛ける計算に注意する。原の4候補を${decimal(scale)}倍へ対応させたもので，19.6という原の近似値から著者の丸め手順を推定しない。`),prompt:[p(c===0?s.prompt:`${rate}kビット／秒の回線を用いて${mult===1?'10⁶':mult+'×10⁶'}バイトのファイルを送信するとき，伝送におよそ何秒掛かるか。ここで，回線の伝送効率は80%とする。`),p('1kビット＝1,000ビットとする。')]};}
 throw Error('UNKNOWN_2016_MORNING_QUESTION');
}
const titles=['クロック周波数と性能','5段パイプラインの実行順','キャッシュの効果','画像の必要記憶容量','性能の評価尺度','LAN構成の稼働率','MTBFとMTTR','優先度スケジューリング','入出力バッファ','UNIXのコマンド接続','コンパイラの最適化','リンカの機能','静的テストツール','RFIDの利用','論理回路の等価性','Web文書の視覚表現','クリッピング','関係モデルの対応','関係代数演算','トランザクションの特性','外部キーの目的','DBの同時更新制御','伝送効率と時間','ネットワーク中継装置'];
const keys='アウイアウエウウイアウウアエウイイアアイアエエイ';
const fixed=new Set([9,10,11,19,21,27,29]);
export const legacy2016SpringAm0932Definitions:GenerationDefinition[]=titles.map((title,i)=>{const number=i+9;return{source:`2016h28h-fe-am-${number}`,title,sourceAnswer:keys[i],version:'3.2.0',fields:[field('caseIndex',0,am2016DomainCounts[number]-1)],reference:[0],...(fixed.has(number)?{answerVariation:'fixed' as const}:{}),notes:variableNotes+' 候補0は原基準。有限caseIndexから実条件へ復号する。原問番号・4択・肯定の問い・文章/図/表/ステージ列挙の構成を維持。並べ替えや名称だけの差は容量に数えない。'+(number===14?'改変baseのみに故障独立を解答前へ明示。':number===31?'改変baseのみにkの十進定義を解答前へ明示。':number===15?'候補1〜3だけMTBF/MTTRの正値条件を解答前へ明示し，修復時間0の端点を無断で含めない。':''),build:v=>build(number,v)};});
