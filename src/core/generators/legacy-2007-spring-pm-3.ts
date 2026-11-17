import { p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2007-spring-pm-01-05-shared';
import { draw } from './legacy-2007-spring-pm-01-05-figures';
import { activities, durations, pathLength, paths } from './legacy-2007-spring-pm-3-model';

const pathChoices = paths.map(path=>path.map(n=>'①②③④⑤⑥⑦⑧⑨⑩'[n-1]).join(' → '));
const dependencyChoices = [
  '業務プログラムの詳細設計（G3）は，共通部品のコーディング・単体テスト（C2）が終了しないと開始できない。',
  '業務プログラムのコーディング・単体テスト（G4）は，共通部品のコーディング・単体テスト（C2）が終了しないと開始できない。',
  '業務プログラムの詳細設計（G3）は，業務プログラムの機能設計（G2）が終了すると開始できる。',
  '共通部品は実機がなくてもコーディング・単体テスト（C2）を開始できるが，業務プログラムは実機がなくてはコーディング・単体テスト（G4）を開始できない。',
  'ハードウェアの調達（H1）は，システム方式設計（S1）の完了後に行う。',
];
const changes = ['共通部品の設計（C1）','共通部品のコーディング・単体テスト（C2）','業務プログラムの機能設計（G2）','ハードウェアの調達（H1）'];
function evaluate(index:number) {
  const values = durations[index], steps = paths.map(path=>pathLength(path,values));
  const total = Math.max(...steps), winner = steps.indexOf(total);
  const choices = index === 0 ? [31,32,33,34,35,36] : [total - 3,total - 2,total - 1,total,total + 1,total + 2];
  const shortening = index === 1 ? ['業務プログラムの詳細設計（G3）', ...changes.slice(1)] : changes;
  return {values,steps,total,winner,choices,shortening};
}
export function spring2007Pm3Pages(index: number, print = true) {
  const {values,choices,shortening} = evaluate(index);
  const pages = [
    [p('システム開発の計画立案に関する次の記述を読んで，設問1，2に答えよ。'),
      p('X社では，業務システムを新規に構築することになった。この業務システムには，新たなハードウェアの導入とソフトウェアの開発が必要である。ソフトウェアの開発では，業務プログラム内で共通に利用するプログラム（以下，共通部品という）を業務プログラム本体と分離して，別チームで開発することにした。今回の開発に関する作業の一覧と必要な日数を表に示す。'),
      table('表　作業の一覧と必要な日数',['作業 ID','内容','日数'],activities.map(([id,,,name],i)=>[id,name,String(values[i])])),
      p('この作業の日程計画を立てるために，図のアローダイアグラムを作成した。図中の破線は，ダミー作業である。'),
      draw('network',0,'図　日程計画のアローダイアグラム')],
    [p('設問1　作業日程はアローダイアグラムに従うものとして，作業の依存関係に関する記述として正しい答えを，解答群の中から二つ選べ。')],
    [],
  ];
  if (print) pages[1].push(...bank('解答群',dependencyChoices));
  pages[1].push(p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
    p('この業務システムの開発におけるクリティカルパスは［a］，最短所要日数は［b］日である。また，全体の開発期間は，［c］を短縮することで短縮できる。'));
  if (print) {
    pages[1].push(...bank('aに関する解答群',pathChoices),...bank('bに関する解答群',choices));
    pages[2].push(...bank('cに関する解答群',shortening));
  }
  return pages;
}
export const spring2007Pm3 = define(3,'業務システム開発の依存関係とクリティカルパス','設問1=イ・オ／a=ア／b=カ／c=ア',
  '業務・共通部品・調達の必要日数','作業図の矢印とダミーを読み，必要日数と短縮対象を求める。',
  '矢印の方向、5→6の破線、同一5択から2選択する設問1、設問2のa/b/cを維持。4パスをそれぞれ最長とする条件。共有作業が正答と重ならないように，C2が最長経路となる条件ではC1に代えて詳細設計を比較する。順不同2マークは一採点欄。',index=>{
    const {total,winner,choices,steps,shortening} = evaluate(index);
    const selected=answers([strings(dependencyChoices),strings(pathChoices),strings(choices.map(String)),strings(shortening)],
      [{ids:['s1-1','s1-2'],labels:['設問1','設問1'],bank:0,correct:[1,4]},
        single('a','設問2 a',1,winner),single('b','設問2 b',2,choices.indexOf(total)),single('c','設問2 c',3,winner)]);
    return {prompt:spring2007Pm3Pages(index,false).flat(),...selected,
      partAnswers:selected.partAnswers!.map(answer=>answer.kind === 'unordered' ? {...answer,presentation:'checklist'} : answer),
      explanation:'G4の開始地点⑦にはC2が入り，H1の開始地点②にはS1が入る。G3はG2だけでなくC1後のダミー作業も待つ。4経路の所要日数は選択肢順に'+
        steps.join('，')+'日。最長の'+pathChoices[winner]+'が全体の最短日数'+total+'日を決める。候補の中でこの経路上にある'+shortening[winner]+'の短縮が全体に効く。',
    };
  });
