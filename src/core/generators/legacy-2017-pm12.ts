import{field,figure,p,programs,variableNotes,type GenerationDefinition}from'./definition';
import{legacy2017Pm12AddProgram as add,legacy2017Pm12MulProgram as mul,legacy2017Pm12Model as model,legacy2017Pm12Hex as hex,legacy2017Pm12Profiles as profiles,legacy2017Pm12Figure as drawing,legacy2017Pm12MaterialAssetIds as materials,legacy2017Pm12Ab as ab,legacy2017Pm12C as c,legacy2017Pm12Ef as ef}from'./legacy-2017-pm12-data';
export const legacy2017Pm12Definition:GenerationDefinition={
 source:'2017h29h-fe-pm-12',title:'旧制度・午後：CASL IIの多倍長加算と乗算',version:'3.2.0',fields:[field('加算する4語の数値条件',0,7)],reference:[0],sourceAnswer:'設問1 a=オ、b=ウ、c=イ／設問2 d=エ／設問3 e=ア、f=オ',
 notes:variableNotes+' 原58〜62頁、ADD64全24行（aを2箇所）とMUL32全命令/注釈、3図、全22固有択35参照6独立欄を保持。a/b共通5択、e/f共通8択。64bit加算は同一領域可、異なる領域は非重複・桁あふれなし、出力はGR1側、両手続でGR1〜7復元という原前提を保持。生成は4語の数値と同役割のd候補だけを変え、低位語の繰上がり有無を4条件ずつ含む。独立したBigInt加算/乗算とCOMET命令interpreterで全択を検算する。固定共通資料はp72/73/74上部/75/76/77のimage contextsで保持し、p74下部の1.3符号表は画像/抽出文/プログラムへ取り込まない。数値/番地/16bit演算のみで文字定数・DC文字列・IN/OUT・文字比較・符号値変換を導入しない。全解答群を本文にも表示するためshuffleは全種false。',
 build(values){
  if(values.length!==1)throw Error('PARAMETER_CONSTRAINT');const m=model(values[0]);
  const draw=(i:number)=>{const f=drawing(profiles[i],values);return figure(profiles[i],values,f.caption,f.alt);};
  const offsets=[0,0,5,8,14,14],counts=[5,5,3,6,8,8],answers=[4,2,1,m.carry?3:2,0,4];
  return{contexts:[{title:'アセンブラ言語の仕様（原p72〜77、符号表を除く抜粋）',presentation:'text_figure',blocks:[p('出典：平成29年度 春期 基本情報技術者試験 午後 付属資料。必要な数値演算・命令・COMET II仕様を抜粋。原p74は上部の命令と注記だけを切り出している。'),...materials.map((assetId,i)=>({type:'image' as const,assetId,caption:`アセンブラ言語の仕様 原p${72+i}${i===2?' 上部抜粋（命令と注記）':''}`}))]}],
   prompt:[p('選択した問題は、選択欄の（選）をマークしてください。マークがない場合は、採点されません。'),p('問12 次のアセンブラプログラムの説明及びプログラムを読んで、設問1〜3に答えよ。'),p('プログラム1の説明'),
    p('64ビット符号なし整数の加算を行う副プログラムADD64である。64ビット符号なし整数の主記憶への格納方法を、図1に示す。'),draw(0),
    p('(1) GR1及びGR2には、それぞれ次の内容が設定されて、主プログラムから渡される。'),p('GR1、GR2：加算の対象となる二つの64ビット符号なし整数を格納する領域の先頭アドレス。各領域はそれぞれ連続した4語から成る。'),
    p('ここで、GR1とGR2の値が等しい場合を除き、GR1とGR2が指し示す領域は重ならないものとする。'),p('(2) 副プログラムADD64は、GR1に設定されたアドレスから始まる連続した4語の領域に、加算の結果を格納する。このとき、桁あふれは発生しないものとする。'),p('(3) 副プログラムADD64から戻るとき、汎用レジスタGR1〜GR7の内容は元に戻す。'),
    draw(7),
    p('設問1 プログラム1中の［a］〜［c］に入れる正しい答えを、解答群の中から選べ。'),draw(3),draw(4),
    p('設問2 次の記述中の［d］に入れる正しい答えを、解答群の中から選べ。'),p('GR1及びGR2に設定したアドレスから始まる連続した4語の領域に、図2のとおりに値を格納して副プログラムADD64を実行したとき、行番号7の命令を2回目に実行した後のGR0の値は［d］である。'),draw(1),draw(5),
    p('設問3 副プログラムADD64を使用して、32ビット符号なし整数の乗算を行う副プログラムMUL32を作成した。プログラム2中の［e］、［f］に入れる正しい答えを、解答群の中から選べ。'),p('プログラム2の説明'),p('(1) 32ビット符号なし整数の主記憶への格納方法を、図3に示す。'),draw(2),
    p('(2) GR1〜GR3には、それぞれ次の内容が設定されて、主プログラムから渡される。'),p('GR1、GR2：乗算の対象となる二つの32ビット符号なし整数を格納する領域の先頭アドレス。各領域はそれぞれ連続した2語から成る。'),p('GR3：乗算結果となる64ビット符号なし整数を格納する領域の先頭アドレス。領域は連続した4語から成る。'),p('ここで、GR1、GR2及びGR3が指し示す領域は互いに重ならないものとする。'),p('(3) 副プログラムMUL32から戻るとき、汎用レジスタGR1〜GR7の内容は元に戻す。'),draw(8),draw(6),
   ],choices:[...programs(ab),...programs(c),...programs(m.d.map(hex)),...programs(ef)],
   answerParts:counts.map((n,i)=>({id:`part-${'abcdef'[i]}`,label:`設問${i<3?1:i===3?2:3} ${'abcdef'[i]}`,choiceIds:Array.from({length:n},(_,j)=>`choice-value-${offsets[i]+j+1}`)})),
   partAnswers:answers.map((n,i)=>({kind:'choice' as const,partId:`part-${'abcdef'[i]}`,choiceId:`choice-value-${offsets[i]+n+1}`})),
   explanation:`a：一つの語の二度のADDLのどちらで繰上がっても、次の上位語へ渡すGR5を1にするのでLD GR5,=1。同じaを行10と14の両方に入れる。ANDでは初期値0を1にできず、比較命令ではGR5を更新しない。b：GR3が結果側先頭GR1に戻ったかをCPL GR3,GR1で比較する。0や入力側GR2との比較では先頭を一般に検出できない。c：上位語が残る間は無条件のJUMP LOOP。SUBLの桁あふれやゼロ条件に依存しない。d：下位語${hex(m.left[3])}＋${hex(m.right[3])}の結果は${hex(m.lowResult)}、繰上がりは${m.carry}。2回目の行7では${hex(m.left[2])}にその${m.carry}を加えるので${hex(m.trace)}となる。入力相手側の語や単なる0/1を答えない。e：GR5が0〜15ならGR6=GR5−16の結果の符号ビットが1なのでJMI LOWORDで下位語を選ぶ。16〜31では上位語をGR5−16ビット右シフトする。JNZでは17〜31も下位語へ進み、JPL/JZEも分岐範囲を誤る。f：TEMPをそれ自身と加算して2倍にするので、二つの先頭アドレスを同じTEMPに設定するLAD GR2,TEMP。LD GR2,TEMPはそこに格納された値を読み、アドレス取得とは異なる。=1や結果領域GR3を加えても2倍にならない。32ビット全桁を低位から検査し、桁ごとにTEMPを2倍にする。ADD64はGR1〜GR7を保存するのでMUL32のループカウンタと退避レジスタを壊さない。`,
  };
 },
};
