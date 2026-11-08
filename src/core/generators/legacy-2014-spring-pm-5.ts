import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field } from './definition';
import { q5Data, q5Events } from './legacy-2014-spring-pm-05-08-model';
import { q0508Answers, q0508Case, q0508Figure, q0508Prompt } from './legacy-2014-spring-pm-05-08-shared';

export const legacy2014SpringPm5Definition: AfternoonBookletDefinition = {
  source: '2014h26h-fe-pm-5', title: 'システム統合に伴うソフトウェア設計',
  version: '3.7.0', reference: [0], fields: [field('在庫更新を答える業務の組合せ', 0, 2)],
  sourceAnswer: 'イ／ア／キ／エ／カ／イ',
  notes: '物理25–30（冊子24–29）。原問a四択、b五択、c–f共有八択。C/D社の情報連携、C社システムにD社の固有機能を追加する方向、日次生産計画の違い、有効在庫と実在庫の更新時点及び在庫更新仕様を保持する。c–fの四つの対象行を動かし、同じ三列で原と同程度の候補を識別する。',
  publicNotes: 'システム統合の前提と在庫更新の仕様を保ち，在庫区分・入出庫区分・数量を答える更新タイミングを変更しました。',
  build(values) {
    const input = q0508Case(values), model = q5Data(input);
    return {
      prompt: q0508Prompt(25, 30, input),
      ...q0508Answers(['5a', '5b', model.choices.map((_, option) => [q0508Figure('q5-triple', [input, option])])],
        'abcdef', [0, 1, 2, 2, 2, 2], [1, 0, ...model.answers]),
      explanation: [
        'D社の販売管理では社員が端末から受注情報を入力する。C社の受注はEDIなので，D社の端末入力機能をC社の販売管理に追加する。D社製品の見込生産を継続するには，売掛情報と在庫情報から製品ごとの生産計画を日次で作成する機能が必要であり，追加先は生産管理となる（a，b）。',
        '手配や受注など将来分の確定は有効在庫を変える。製造・納品・出荷など物の移動は実在庫を変える。入庫は増加，出庫は減少であり，数量はそれぞれの業務で扱う予定数・現物数に対応させる。',
        ...model.positions.map((position, index) => {
          const [, event, stock, direction, quantity] = q5Events[position];
          return 'cdef'[index] + '：' + event + 'は' + stock + 'を' + direction + 'として更新し，数量は' + quantity + '。';
        }),
      ].join('\n'),
    };
  },
};
