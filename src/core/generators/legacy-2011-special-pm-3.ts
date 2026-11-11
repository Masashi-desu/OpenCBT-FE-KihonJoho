import { p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2011-special-pm-01-04-shared';
import { draw } from './legacy-2011-special-pm-01-04-figures';
import { positionLetters, transactionCase, waitingOptions } from './legacy-2011-special-pm-01-04-models';

const columns = ['トランザクション', '処理内容'];

export function special2011Pm3Pages(index: number) {
  const { stock, out, inbound, redOut, kinds, resources, groups, stockChoices } = transactionCase(index);
  const contents = { 照会: '白絵の具の在庫数照会', 入荷: '白絵の具' + inbound + '本の入荷', 出荷: '白絵の具' + out + '本の出荷' };
  const txRows = resources.map(([first, second], i) => {
    const kind = i % 2 === 0 ? '出荷' : '入荷';
    const amounts = [[out, out], [inbound, inbound], [2, out], [inbound, inbound]][i];
    return [kind + 'トランザクションT' + (i + 8), first + '絵の具' + amounts[0] + '本と' + second + '絵の具' + amounts[1] + '本の' + kind];
  });
  return [[
    p('問3　データベースのトランザクション管理に関する次の記述を読んで，設問1〜4に答えよ。'),
    p('個人向けに，画材をインターネット販売する会社が運営するWebサイトがある。'),
    p('このWebサイトが在庫管理に利用しているデータベースでは，絵の具の在庫数は色別に個々のデータとして管理されており，処理に応じて次の3種類のトランザクションが生成される。'),
    p('① 1回の商品注文に対して，一つの出荷トランザクションが生成される。'),
    p('② 1回の商品入荷に対して，一つの入荷トランザクションが生成される。'),
    p('③ 1回の在庫照会に対して，一つの照会トランザクションが生成される。'),
    p('なお，一つのトランザクションで，複数の色の絵の具を処理することができる。'),
    p('設問1　ACID特性に関する次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('ACID特性とは，データベースの一貫性を保証するために必要な特性で，原子性，一貫性，独立性，耐久性の四つがある。このうち，一貫性や独立性を保証するためにトランザクション管理では排他制御が必要となる。例えば，白絵の具の在庫数が' +
      stock + 'だった場合，表1に示すトランザクションT1とT2が同時に実行されたとき，排他制御を行わないと実行後の在庫数は' +
      (stock - out + inbound) + 'とならず，在庫数が［a］又は［b］となってしまう可能性がある。'),
    p('なお，各トランザクションは，図1の①〜③の順で在庫数データを処理する。'),
    table('表1　トランザクションT1，T2の処理内容', columns, [['出荷トランザクションT1', contents.出荷], ['入荷トランザクションT2', contents.入荷]]),
  ], [
    draw('updateSteps', index, '図1　トランザクションT1，T2の処理順序'),
    ...bank('解答群', stockChoices),
    p('設問2　入荷トランザクション及び出荷トランザクションを処理する場合は対象データを占有ロックし，照会トランザクションを処理する場合は共有ロックする。'),
    p('なお，このデータベースを管理するDBMSでは，あるトランザクションが共有ロックしているデータを，ほかのトランザクションからロックする場合，共有ロックの要求は成功するが，占有ロックの要求は共有ロックが解除されるまで待ち状態となる。'),
    p('表2に示すトランザクションT3〜T6を，図2に示すとおりに実行し，ロックを要求した場合，それぞれのトランザクションの状態について正しい説明を，解答群の中から選べ。'),
    table('表2　トランザクションT3〜T6の処理内容', columns,
      kinds.map((kind, i) => [kind + 'トランザクションT' + (i + 3), contents[kind]])),
  ], [
    draw('lockTimeline', 0, '図2　トランザクションT3〜T6の実行例'),
    p('注　“●→”はトランザクションの実行開始と時間経過を，“○”は白絵の具の在庫数データのロック要求を表す。' +
      (index ? '図に示された間は，取得したロックを解除しないものとする。' : '')),
    ...bank('解答群', waitingOptions),
    p('設問3　出荷トランザクションT7の処理内容を表3に示す。次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('なお，トランザクションT7は，図3の①〜⑧の順で在庫数データを処理する。'),
    table('表3　トランザクションT7の処理内容', columns, [['出荷トランザクションT7', '白絵の具' + out + '本と赤絵の具' + redOut + '本の出荷']]),
  ], [
    draw('lockSteps', index, '図3　トランザクションT7の処理順序'),
    p('データをロックしている時間を最も短くするためには，“赤絵の具の在庫数データをロックする。”を挿入すべき適切な位置は［c］で，“白絵の具の在庫数データのロックを解除する。”を挿入すべき適切な位置は［d］である。'),
    p('なお，ほかのトランザクションとのデッドロックの発生に対する考慮は不要とする。'),
    ...bank('解答群', positionLetters),
    p('設問4　表4に示すトランザクションT8〜T11のうち，解答群の組合せの中から，同時に処理された場合にデッドロックが発生する可能性のある組合せを選べ。'),
    p('なお，トランザクションT8〜T11では，各絵の具の在庫数データをどのような順番で処理するかは，分からないものとする。'),
  ], [
    table('表4　トランザクションT8〜T11の処理内容', columns, txRows),
    ...bank('解答群', groups.map(group => group.map(number => 'T' + number).join(', '))),
  ]];
}

export const legacy2011SpecialPm3Definition = define(3, 'トランザクション管理と排他制御',
  '1a=イ・1b=エ（順不同）・2=ウ・3c=イ・3d=エ・4=イ', '在庫数・ロックの種類と処理順・処理する色',
  '入出荷する本数、ロックの種類や手順、各トランザクションが処理する色を変えます。設問1のaとbは順不同です。',
  'p.13〜17。表1〜4、図1〜3、各設問を保持する。設問1のa,bは各々独立した欄で順不同，' +
  '共有／占有ロックと待ち順，最短ロック区間とα〜ε，デッドロックを起こし得る組合せを同じ意味で問う。', index => {
    const { stock, out, inbound, stockChoices, c, d, waiting, waits, groups, deadlock } = transactionCase(index);
    const groupChoices = groups.map(group => group.map(number => 'T' + number).join(', '));
    return {
      prompt: special2011Pm3Pages(index).flat(),
      ...answers([strings(stockChoices.map(String)), strings(waitingOptions), strings(positionLetters), strings(groupChoices)], [
        { ids: ['1a', '1b'], labels: ['設問1 a', '設問1 b'], bank: 0,
          correct: [stockChoices.indexOf(stock - out), stockChoices.indexOf(stock + inbound)] },
        single('2', '設問2', 1, waiting), single('3c', '設問3 c', 2, c), single('3d', '設問3 d', 2, d),
        single('4', '設問4', 3, deadlock),
      ]),
      explanation: '両方の読込みが書込みより先なら，同じ' + stock + '本を基に計算する。最後に書き込むのが出荷なら' +
        (stock - out) + '本，入荷なら' + (stock + inbound) + '本になり，もう一方の更新が失われる。aとbは順不同。' +
        '共有ロック同士は両立するが，どちらかが占有ロックなら両立しない。図2を時系列に追うと待ち状態となるのは' +
        waits.join('，') + 'である。赤のロックは最初に読み込む直前の' + positionLetters[c] +
        '，白の解放は最後に書き込んだ直後から選べる最初の' + positionLetters[d] +
        'とすると保持時間が短い。' + groupChoices[deadlock] +
        'では各トランザクションが一つの異なる色を先に占有し，次にほかが保持する色を要求すると，待ちが循環してデッドロックになり得る。',
    };
  });
