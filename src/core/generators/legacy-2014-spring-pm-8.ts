import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field } from './definition';
import { interval, q8Answers, q8Example } from './legacy-2014-spring-pm-05-08-model';
import { spring2014Pm0508Banks as banks } from './legacy-2014-spring-pm-05-08-source';
import { q0508Answers, q0508Case, q0508Prompt } from './legacy-2014-spring-pm-05-08-shared';
import { spring2014PmPageAssetId, spring2014PmReference } from './legacy-2014-spring-pm-materials';

const title = '共通に使用される擬似言語の記述形式';
const pages = [4, 5];
const allocations = (ranges: ReturnType<typeof q8Example>['requests']) =>
  ranges.map(([start, end]) => 'Alloc（' + start + '，' + end + '）').join('と');

export const legacy2014SpringPm8Definition: AfternoonBookletDefinition = {
  source: '2014h26h-fe-pm-8', title: '空きリストを用いたセルの割当てと解放',
  version: '3.7.0', reference: [0], fields: [field('割当てと解放の例及び表の解答欄', 0, 2)],
  sourceAnswer: 'ア／エ／イ／ウ／ウ／ア／エ／イ',
  fixedReferenceAssetIds: pages.map(spring2014PmPageAssetId),
  notes: '物理40–45（冊子39–44）、共通擬似言語物理4–5。必須の注意、連続セル・番兵の仮定、整数除算、配列添字1〜N、配列容量、四つの独立した条件、増分と非実行条件を保持。Alloc/Freeの例とFree表の二つの解答欄が指す条件を変える。a/b・c/d・g/hは各々共有バンク。',
  publicNotes: '空きリストの更新方法と疑似言語の形式を保ち，割当て・解放の例と解放処理で答える二つの状況を変更しました。',
  build(values) {
    const input = q0508Case(values), example = q8Example(input), [a, b] = q8Answers(input);
    return {
      contexts: [spring2014PmReference(title, pages)],
      prompt: q0508Prompt(40, 45, input, (line, page) => {
        if (page === 40 && line.endsWith('並んでいるもの')) return line + 'とする。';
        if (page === 41 && line === 'とする。') return '';
        return line.replace('Alloc（1，2）とAlloc（6，8）', allocations(example.requests))
          .replace('Free（6，7）', 'Free（' + example.release.join('，') + '）')
          .replace('組{6，7}', '組' + interval(example.release))
          .replace('組{3，5}', '組' + interval(example.allocated[1]))
          .replace('組{3，7}', '組' + interval(example.merged));
      }),
      ...q0508Answers(['8ab', '8cd', '8e', '8f', '8gh'], 'abcdefgh', [0, 0, 1, 1, 2, 3, 4, 4],
        [banks['8ab'].indexOf(a), banks['8ab'].indexOf(b), 1, 2, 2, 0, 3, 1]),
      explanation: [
        'a，b：解放区間に接する既存の空き組があれば，そこまで含めた区間とする。両隣が接するなら両方を一つにまとめ，どちらも接しなければ解放区間だけを追加する。表2で指定された行の組は，aが' + a + '，bが' + b + '。',
        'c，d：左端から割り当てた場合，残る最初のセルは終点P＋1なので始点[I]を更新する。右端まで割り当てた場合，残る最後のセルは始点P−1なので終点[I]を更新する。各更新後には後続の条件式が偽となる。',
        'e：区間を分割する場合は旧I＋1〜N番目を一つ後ろに移す。まだ参照する要素を上書きしないように，L=NからL≧I＋1の間，−1ずつ減らしながらコピーする。I=Nならコピーは行わない。',
        'f，g，h：領域外は割り当てられないので番兵を含む空き組が残り，リストは空にならない。空きの組数は割当済みの連続区間数＋1。1セルの割当済みと1セルの空きを交互に置くと，最大の割当済み区間数は(E＋1)÷2。全セルが割当済みなら外側の二つだけが残る。',
      ].join('\n'),
    };
  },
};
