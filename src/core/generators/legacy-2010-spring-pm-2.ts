import { code, p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2010-spring-pm-01-04-shared';
import { draw } from './legacy-2010-spring-pm-01-04-figures';
import { bracketExpressions, firstTrees, parseExpression, postfix, postfixExpressions, postfixOptions,
  secondTrees, stackExpressions, stackOptions, syntaxExpressions, treeText } from './legacy-2010-spring-pm-01-04-syntax';

const marks = 'アイウエオ';
const choiceTree = (kind: 'firstTree' | 'secondTree', index: number) => draw(kind, index, '構文木 ' + marks[index], true);
const treeBank = (kind: 'firstTree' | 'secondTree') => [p('解答群'), ...Array.from(marks, (mark, index) => [p(mark), choiceTree(kind, index)]).flat()];
const heading = (number: number) => p('設問' + number + '　次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。');

export function spring2010Pm2Pages(index: number) {
  return [[
    p('問2　コンパイラの処理内容に関する次の記述を読んで，設問1〜4に答えよ。'),
    p('コンパイラとは，プログラム言語で記述された原始プログラムを翻訳して目的プログラムを生成するためのソフトウェアである。コンパイラの処理過程において，構文解析は字句解析が出力する字句を読み込みながら構文木を生成し，その字句の列が文法で許されているかどうかを解析する。'),
    heading(1),
    p('2項演算子から成る式の構文は，2分木で表現される。2分木から目的プログラムを生成するには，2分木を深さ優先で探索しながら，帰り掛けに節の演算子を評価する。式の構文木と探索順序の例を図に示す。'),
    draw('treeWalk', 0, '図　構文木と探索順序の例'),
    p('探索の結果，図の構文木の例は，aとbに対して演算opを施し，その結果とcに対して演算opを施すと解釈される。'),
    p('括弧を含む式では，演算の優先度は，括弧内の優先度が高く，それ以外は左から右に式を評価する。このとき，次の式に対する構文木は［空欄］である。'),
    p('式：　' + bracketExpressions[index]),
  ], [
    ...treeBank('firstTree'),
    heading(2),
    p('プログラム言語の文法は，構文規則で規定される。式の構文規則では式の構文を規定しているだけでなく，演算子の優先順位や結合規則も規定している。例として，優先順位が異なる演算子op1，op2と括弧を用いた式の構文規則を考える。'),
    p('〔式の構文規則〕'),
    code('（1） 式　 → 項 ｜ 式 op1 項\n（2） 項　 → 因子 ｜ 項 op2 因子\n（3） 因子 → 名前 ｜ ( 式 )\n（4） 名前 → a ｜ b ｜ c ｜ d ｜ e', 'text'),
    p('“→”は，左側の構文要素が右側で定義されることを示す。'),
    p('“｜”は，“又は”を意味する。'),
  ], [
    p('深さ優先で探索すると仮定すれば，与えられた式に含まれる演算子op1とop2の演算順序は，〔式の構文規則〕から生成可能な構文木で表現できる。例えば，次の式に対して〔式の構文規則〕を適用した構文木は［空欄］である。'),
    p('式：　' + syntaxExpressions[index]),
    ...treeBank('secondTree'),
  ], [
    heading(3),
    p('構文解析した結果は，構文木で表現する以外に，2分木と等価な表現の後置表記法（逆ポーランド表記法）で表現できる。後置表記法では，演算で使用する二つのオペランドを演算子の前に記述する。そして，後置表記法は，構文木を探索して得られる演算順序を表現したものであると考えることができる。例えば，設問1の図の例で，演算子opを加算＋とした場合，後置表記法では a b ＋ c ＋ となる。これは，aとbを加算し，その結果とcを加算することを表している。'),
    p('後置表記法を用いて式 ' + postfixExpressions[index] + ' を表現すると［空欄］になる。ここで，加算＋と乗算×は，それぞれ設問2の演算子op1とop2に対応し，演算の優先順位や結合規則は，〔式の構文規則〕に従うものとする。'),
    ...bank('解答群', postfixOptions),
  ], [
    heading(4),
    p('後置表記法で表現された式は，スタックを使って左から右に評価することができる。式 ' + stackExpressions[index] +
      ' を後置表記法に変換して評価する場合，スタックの操作順序は［空欄］である。ここで，スタックを操作する命令として次の種類がある。また，加算＋と乗算×は，それぞれ設問2の演算子op1とop2に対応し，演算の優先順位や結合規則は，〔式の構文規則〕に従うものとする。'),
    p('push(x)：スタックにxをプッシュする。'),
    draw('stack', 0, 'push(x)の動作', true),
    p('add：スタックからオペランドを二つポップして加算し，その結果をスタックにプッシュする。'),
    draw('stack', 1, 'addの動作', true),
    p('mul：スタックからオペランドを二つポップして乗算し，その結果をスタックにプッシュする。'),
    ...bank('解答群', stackOptions(index)),
  ]];
}

export const legacy2010SpringPm2Definition = define(2, 'コンパイラの構文解析とスタック', '設問1=オ・設問2=イ・設問3=ウ・設問4=ウ',
  '構文木に変換する式の括弧と演算子の配置',
  '式の括弧と演算子の位置を変え、構文木、後置表記、スタックでの操作順を求めます。',
  'p.12〜16。深さ優先の帰り掛け，括弧と左結合，op2優先の4構文規則，後置記法，push/add/mul，例図と5/5/4/4択を保持。', index => {
    const first = treeText(parseExpression(bracketExpressions[index])), second = treeText(parseExpression(syntaxExpressions[index]));
    const post = postfix(parseExpression(postfixExpressions[index])).join(' ');
    const stack = postfix(parseExpression(stackExpressions[index])).map(token =>
      token === '＋' ? 'add' : token === '×' ? 'mul' : 'push(' + token + ')').join(' → ');
    return {
      prompt: spring2010Pm2Pages(index).flat(),
      ...answers([firstTrees.map((_, i) => [choiceTree('firstTree', i)]), secondTrees.map((_, i) => [choiceTree('secondTree', i)]),
        strings(postfixOptions), strings(stackOptions(index))], [
        single('1', '設問1', 0, firstTrees.findIndex(tree => treeText(tree) === first)),
        single('2', '設問2', 1, secondTrees.findIndex(tree => treeText(tree) === second)),
        single('3', '設問3', 2, postfixOptions.indexOf(post)), single('4', '設問4', 3, stackOptions(index).indexOf(stack)),
      ]),
      explanation: '括弧の内部を先にまとめ，同じ優先度では左から結合する。設問1の木は' + first +
        '。設問2は「項」の中でop2が構成されてから，式にop1が現れるため，op2が先にまとまる。木は' + second +
        '。左右の子を処理してから節の演算子を置くと，設問3の後置列は「' + post + '」になる。' +
        '設問4は後置列を左から読み，値をpushし，演算子ごとに二つの値を取り出して計算し，結果を戻す。順序は「' + stack + '」。',
    };
  });
