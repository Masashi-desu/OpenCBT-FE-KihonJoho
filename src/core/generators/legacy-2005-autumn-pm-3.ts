import { p, strings } from './definition';
import { answers, bank, define, equation, single } from './legacy-2005-autumn-pm-01-05-shared';
import { draw } from './legacy-2005-autumn-pm-01-05-figures';
import { dhCases, modularPower } from './legacy-2005-autumn-pm-01-05-models';

const options=[
  '共通かぎKの更新間隔の短縮','公開かぎYA，YBの交換回数の削減','公開かぎの交換',
  '秘密かぎによる情報の復号','秘密の共通かぎの共有','より大きな値の素数pの使用',
];
const keys=Array.from({length:7},(_,i)=>String(i));
function exchange(index:number) {
  const {prime,base,keyA,keyB}=dhCases[index];
  const ya=modularPower(base,keyA,prime), yb=modularPower(base,keyB,prime);
  return {prime,base,keyA,keyB,ya,yb,shared:modularPower(yb,keyA,prime)};
}

export function autumn2005Pm3Pages(index:number,print=true) {
  const {prime,base,ya,yb}=exchange(index);
  return [
    [p('暗号通信に関する次の記述を読んで，設問に答えよ。'),
      p('安全でない通信経路を利用する2者が，秘密の共通かぎを安全に共有する方式としてDiffie-Hellman法（以下，DH法という）が知られている。DH法で利用者Aと利用者Bが共通かぎKを共有するまでの手順は，次のとおりである。'),
      p('（1）素数pと，pよりも小さいある自然数αが公開されていて，利用者Aと利用者Bがともに知ることができる。'),
      p('（2）利用者Aは，pよりも小さい任意の自然数XAを選び，秘密かぎとして保持するとともに，次の式で得られる公開かぎYAを利用者Bに送る。'),
      equation('Y_A=\\alpha^{X_A}\\quad\\mathrm{mod}\\quad p','YA＝αのXA乗 mod p'),
      p('ここで，x mod yは整数xを整数yで割った余り（剰余）である。'),
      p('（3）利用者Bは，pよりも小さい任意の自然数XBを選び，秘密かぎとして保持するとともに，次の式で得られる公開かぎYBを利用者Aに送る。'),
      equation('Y_B=\\alpha^{X_B}\\quad\\mathrm{mod}\\quad p','YB＝αのXB乗 mod p'),
      p('（4）利用者Aは，利用者Bの公開かぎYBを使って，次の式によって共通かぎKを得る。'),
      equation('K=Y_B^{X_A}\\quad\\mathrm{mod}\\quad p','K＝YBのXA乗 mod p'),
      p('（5）利用者Bは，利用者Aの公開かぎYAを使って，次の式によって利用者Aと同じ共通かぎKを得る。'),
      equation('K=Y_A^{X_B}\\quad\\mathrm{mod}\\quad p','K＝YAのXB乗 mod p'),
      p('DH法によるかぎ共有を利用して，図に示すように，安全でない通信経路を利用する2者間で機密情報を送信する仕組みを作る。まず，利用者Aと利用者BはDH法を使って，共通かぎKを共有する。次に，利用者Aは平文を共通かぎKを使って暗号化して送信する。利用者Bは受信した暗号文を共通かぎKを使って復号し，元の平文を得ることができる。')],
    [draw('dh-flow',0,'図　DH法を使った機密情報の通信'),
      p('設問　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('DH法は，目的が［a］に限定されたアルゴリズムであるが，この方式の安全性はほかの公開かぎ暗号と同じく計算の一方向性に基づいている。すなわち，DH法において，素数pの値が十分に大きい場合，秘密かぎから公開かぎを求めるのは容易であるが，公開かぎから秘密かぎを求めるのは非常に困難である。'),
      p('反対に，素数pの値が小さい場合には，かぎの値が小さくなるので公開かぎから秘密かぎを短時間で求めることも可能であり，安全性に問題がある。例えば，利用者Aと利用者Bが使う通信経路上に通信を傍受している第三者Cがいて，公開されている素数pが'+prime+'，αが'+base+'であることに加え，利用者Aが送った公開かぎYAが'+ya+'，利用者Bが送った公開かぎYBが'+yb+'であることを知ったとする。このとき，共通かぎKの値は，［b］であることが容易に分かる。'),
      p('また，DH法は，通信経路上の第三者Cが，利用者Aから送られる情報を，にせの情報にすりかえて利用者Bに送信する中間者攻撃に対して，弱いことが知られている。中間者攻撃を防ぐためには公開かぎに信頼できる第三者によるディジタル署名をつけるなどの対策が必要である。さらに，第三者Cが暗号文を傍受してそれを手掛かりとして共通かぎKを見つけるリスクもあるので，継続的な通信の安全性を高めるための対策として，共通かぎKの値が十分に大きいものを使うだけでなく，［c］も有効である。')],
    print?[...bank('a，cに関する解答群',options),...bank('bに関する解答群',keys)]:[],
  ];
}

export const autumn2005Pm3=define(
  3,'Diffie–Hellman法による共通かぎの共有','a=オ／b=キ／c=ア','素数・生成に使う自然数・両者の公開かぎ',
  '暗号通信の図と手順を維持し、計算例の素数・自然数と公開かぎを変える。',
  '原問の目的と運用対策、図、公開値からの離散対数と双方の合同計算、7択の順序を保持。計算例では適切な位数を持つ元を使う。大きいpだけでは安全性を保証しない点は解説に注記する。',
  i=>{
    const {prime,base,keyA,yb,ya,shared}=exchange(i);
    return {
      prompt:autumn2005Pm3Pages(i,false).flat(),
      ...answers([strings(options),strings(keys)],[single('a','a',0,4),single('b','b',1,shared),single('c','c',0,0)]),
      explanation:'DH（Diffie–Hellman、ディフィー・ヘルマン）法の目的は秘密の共通かぎの共有であり，平文の暗号化と復号は別の処理である。'+
        'α＝'+base+'を累乗して'+prime+'で割った剰余が'+ya+'になる指数を調べると，XA＝'+keyA+'。'+yb+'の'+keyA+
        '乗を'+prime+'で割った剰余が'+shared+'になる。共通かぎKの更新間隔を短くすると，同じ鍵で暗号化される通信の範囲を狭められる。'+
        '実際の安全性には十分大きい適切な群とその元を用い，公開値の検証や相手の認証も行う。素数pの大きさだけで安全性は決まらない。',
    };
  },
);
