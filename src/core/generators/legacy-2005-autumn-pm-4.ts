import { code, p, strings, table } from './definition';
import { answers, asCode, bank, bankBlocks, define, single } from './legacy-2005-autumn-pm-01-05-shared';
import { draw } from './legacy-2005-autumn-pm-01-05-figures';
import { postfix } from './legacy-2005-autumn-pm-01-05-models';
import { autumn2005PmPageAssetId, autumn2005PmReference } from './legacy-2005-autumn-pm-materials';

const aChoices=['i：0，i ＜ Textlen，1','i：0，i ≦ Textlen，1','i：1，i ＜ Textlen，1','i：1，i ≦ Textlen，1'];
const bChoices=['i ← i ＋ 1','i ← i − 1','k ← k ＋ 1','k ← k − 1'];
const cChoices=['sflag ＝ true','sflag ＝ false','work ＝ EOS','work ≠ EOS'];
const dChoices=['i','i ＋ 1','i − 1','k','k ＋ 1','k − 1'];
const priorityChoices=['element ＝ elem[i]','element ＝ elem[i−1]','element ＝ EOS','element ＝ priority[i]',
  'element ＝ priority[i−1]','element ≠ elem[i]','element ≠ elem[i−1]'];

function outputBank(index:number) {
  const {partial,full}=postfix(index);
  return [partial.slice(0,-2),partial,full.slice(0,-1),full];
}
const program = [
  '○ toPostfix(文字型：Exptext[], 整数型：Textlen,',
  '            文字型：Postfix[], 整数型：Postfixlen)',
  '○ 整数型：k, i',
  '○ 論理型：sflag',
  '○ 文字型：work',
  '',
  '・initStack()',
  '・k ← 0',
  '■ ［a］',
  '│  ■ getPriority(Exptext[i]) ≦ getPriority(top())',
  '│  │               and top() ≠ "("',
  '│  │  ・Postfix[k] ← pop()',
  '│  │  ・［b］',
  '│  ■',
  '│  ▲ Exptext[i] ≠ ")"',
  '│  │  ・push(Exptext[i])',
  '│  ├────',
  '│  │  ・pop()       /* 取り出した要素は使わない */',
  '│  ▼',
  '■',
  '                      ← α',
  '・sflag ← true',
  '■ sflag ＝ true',
  '│  ・work ← pop()',
  '│  ▲ ［c］',
  '│  │  ・Postfix[k] ← work',
  '│  │  ・［b］',
  '│  ├────',
  '│  │  ・sflag ← false',
  '│  ▼',
  '■',
  '・Postfixlen ← ［d］',
].join('\n');

const priorityProgram = [
  '○ 整数型：getPriority(文字型：element)',
  '/* 関数 getPriority は、数字、演算子、括弧又はスタック制御文字を',
  '   element で受け取り、その優先度を整数型で返す */',
  '',
  '/* 文字型の配列 elem を初期化する */',
  '/* 添字の範囲は 0〜16 である */',
  '○ 文字型：elem[0:16] ← {"0", "1", "2", "3", "4", "5", "6", "7",',
  '               "8", "9", "+", "−", "×", "÷", "(", ")", EOS}',
  '/* 整数型の配列 priority を elem の各要素の優先度で初期化する */',
  '/* 添字の範囲は 0〜16 である */',
  '○ 整数型：priority[0:16] ← {3,3,3,3,3,3,3,3,3,3,1,1,2,2,4,0,−1}',
  '',
  '○ 整数型：i',
  '',
  '・i ← 0',
  '■ ［設問3］',
  '│  ・i ← i ＋ 1',
  '■',
  '・return priority[i]    /* element の優先度を返す */',
].join('\n');

const refPages=[2,3];
export function autumn2005Pm4Pages(index:number,print=true) {
  return [
    [p('次のプログラムの説明及びプログラムを読んで，設問1〜3に答えよ。'),
      p('〔プログラムの説明〕'),
      p('中置表記法による正しい数式を，スタックを用いて後置表記法に変換する副プログラムtoPostfixである。'),
      p('（1）例えば，中置表記法による数式4×(9＋3)は，toPostfixの処理の結果，後置表記法による数式493＋×に変換される。'),
      p('（2）中置表記法によるここでの数式は，1けたの数字“0”〜“9”，演算子“＋”，“−”，“×”，“÷”及び括弧“(”，“)”の各要素からなる。各要素は表1に示す変換の優先度をもつ。ここで，数値が大きいほど優先度が高い。プログラムでは，各要素を文字として扱い，文字型の配列Exptextに1要素ずつ格納している。また，表1に示す要素以外に，スタックの底を示すスタック制御文字EOSを使用し，その優先度を−1とする。'),
      table('表1　変換の優先度',['数式の要素','優先度'],[['(','4'],['0，1，…，9','3'],['×，÷','2'],['＋，−','1'],[')','0']]),
      p('（3）変換結果の後置表記法の数式は，文字型の配列Postfixに1要素ずつ格納される。'),
      p('（4）toPostfixは，スタックを初期化して，Exptextの先頭の要素から順番に次の①，②の処理を繰り返し，Exptextの要素をすべて処理したら，スタックに残っているすべての数式の要素を順に取り出してPostfixに格納する。'),
      p('① Exptext[i]の優先度がスタックの先頭要素の優先度以下で，かつスタックの先頭要素が“(”でない間，スタックから要素を取り出してPostfixに格納する。')],
    [p('② Exptext[i]が“)”でなければ，Exptext[i]をスタックに積み，“)”であれば，スタックから要素を一つだけ取り出す。'),
      p('（5）toPostfixの引数の仕様を，表2に示す。すべての配列の添字は，0から始まる。'),
      table('表2　副プログラムtoPostfixの引数の仕様',['変数名','型','入力／出力','意味'],[
        ['Exptext[]','文字型','入力','中置表記法による数式が格納されている1次元配列'],
        ['Textlen','整数型','入力','中置表記法による数式の要素数'],
        ['Postfix[]','文字型','出力','後置表記法に変換後の数式が格納される1次元配列'],
        ['Postfixlen','整数型','出力','後置表記法に変換後の数式の要素数'],
      ]),
      p('（6）toPostfixは，スタックを初期化する手続initStack，数式の要素をスタックに積む手続push，スタックから取り出す関数pop，スタックの先頭要素の値を返却する関数top，及び引数で指定された要素の優先度を返す関数getPriorityを使用する。initStack，push，pop，top及びgetPriorityの仕様を表3に示す。'),
      table('表3　toPostfixで使用する手続／関数の仕様',['手続／関数','仕様'],[
        ['initStack()','スタックを初期化し，スタックにEOSを格納する。'],
        ['push(文字型：element)','スタックにelementを格納する。'],
        ['文字型：pop()','スタックから要素を取り出し，その要素を返却する。'],
        ['文字型：top()','スタックの先頭要素の値を返却する。'],
        ['整数型：getPriority(文字型：element)','引数で指定された要素elementの優先度を返却する。'],
      ])],
    [p('〔プログラム〕'),code(program)],
    [p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      ...(print?[...bankBlocks('aに関する解答群',asCode(aChoices)),...bankBlocks('bに関する解答群',asCode(bChoices)),
        ...bankBlocks('cに関する解答群',asCode(cChoices)),...bankBlocks('dに関する解答群',asCode(dChoices))]:[]),
      p('設問2　Exptextの内容が次の数式のとき，プログラム中のαで示す箇所でのPostfixの内容として正しい答えを，解答群の中から選べ。'),
      draw('postfix-input',index,'Exptextの内容'),
      ...(print?bank('解答群',outputBank(index)):[])],
    [p('設問3　引数で指定された要素の優先度を返す関数getPriorityのプログラムを次に示す。プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('〔プログラム〕'),code(priorityProgram),...(print?bankBlocks('解答群',asCode(priorityChoices)):[])],
  ];
}

export const autumn2005Pm4=define(
  4,'スタックを使った中置表記から後置表記への変換','a=ア／b=ウ／c=エ／d=エ／設問2=イ／設問3=カ','途中までたどる中置表記の数式',
  '優先度表と処理を維持し、設問2の数式と途中・最後の出力候補を変える。',
  '1桁数字、四則演算、括弧、項目の優先度とEOS＝−1、添字0、疑似言語の制御線・字下げ・折り返しと共通仕様を維持。途中の排出と最後の排出は常に別の選択肢にする。',
  index=>{
    const {partial,full}=postfix(index);
    return {
      prompt:autumn2005Pm4Pages(index,false).flat(),contexts:[autumn2005PmReference('共通に使用される擬似言語の記述形式',refPages)],
      ...answers([asCode(aChoices),asCode(bChoices),asCode(cChoices),asCode(dChoices),strings(outputBank(index)),asCode(priorityChoices)],[
        single('a','a',0,0),single('b','b',1,2),single('c','c',2,3),single('d','d',3,3),single('s2','設問2',4,1),single('s3','設問3',5,5),
      ]),explanation:'Exptextの添字は0からTextlen−1。Postfixに一要素を格納するたびにkを1増やすので，kは次に書く位置であり，処理後の出力要素数でもある。'+
        'スタックの底を示す制御文字EOSは書き込まない。αに着いた時点では'+partial+
        '。ここから残りの要素を取り出すと'+full+'になる。getPriorityではelementとelem[i]が異なる間だけ進め，一致した添字の優先度を返す。',
    };
  },{answerVariation:'fixed',fixedReferenceAssetIds:refPages.map(autumn2005PmPageAssetId)},
);
