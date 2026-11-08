import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field } from './definition';
import { q6Data } from './legacy-2014-spring-pm-05-08-model';
import { q6FunctionNames, q6Stages, spring2014Pm0508Banks as banks } from './legacy-2014-spring-pm-05-08-source';
import { q0508Answers, q0508Case, q0508Prompt } from './legacy-2014-spring-pm-05-08-shared';

export const legacy2014SpringPm6Definition: AfternoonBookletDefinition = {
  source: '2014h26h-fe-pm-6', title: 'ファンクションポイント法による工数見積り',
  version: '3.7.0', reference: [0], fields: [field('ファンクション規模と共通部品化の工程範囲', 0, 2)],
  sourceAnswer: 'ウ／エ／ウ／ウ／イ',
  notes: '物理31–35（冊子30–34）。a/b/e四択、c/d五択。A社独自簡易方式、三つの出力インタフェースとログ、規模・生産性の単位、上段と下段、工程の比率・対象範囲を保持する。0.1kステップ単位の重みと適用工程の範囲を変え、工数は原と同じ桁で比較する。',
  publicNotes: '処理フローと工数の求め方を保ち，ファンクションごとの開発規模と共通部品化の対象工程を変更しました。',
  build(values) {
    const input = q0508Case(values), data = q6Data(input);
    const b = input === 0 ? banks['6b'] : [
      data.weights[3] / 10, data.rowSizes[1] / 10, (data.rowSizes[1] - data.weights[3]) / 5, data.effort[1],
    ].map(value => value.toFixed(1));
    const extraction = data.effort[2], ratio = data.scope / 100;
    const e = input === 0 ? banks['6e'] : [extraction * ratio * 0.4, data.eligible, extraction * ratio ** 2, extraction * ratio]
      .sort((left, right) => left - right).map(value => String(Number(value.toFixed(3))));
    const target = q6FunctionNames[data.target], effort = data.effort[1].toFixed(1), eligible = String(Number(data.eligible.toFixed(3)));
    return {
      prompt: q0508Prompt(31, 35, input, line => line.replace('全工程の工数合計の80%', '全工程の工数合計の' + data.scope + '%')),
      ...q0508Answers(['6a', b, '6c', '6d', e], 'abcde', [0, 1, 2, 3, 4],
        [2, b.indexOf(effort), banks['6c'].indexOf(target), data.stageEnd, e.indexOf(eligible)]),
      explanation: [
        'a：データ抽出処理のファイル書込はオンラインストレージ，電子記憶媒体，ログの3件。授受リストは帳票作成。',
        'b：データ整備処理の各ファンクション数に規模を掛けた合計は' + (data.rowSizes[1] / 10).toFixed(1) +
          'kステップ。生産性0.5kステップ／人月で割ると' + effort + '人月。',
        'c：全処理で使うのはファイル読込とファイル書込。列を足すと読込が' + (data.totals[0] / 10).toFixed(1) +
          'kステップ，書込が' + (data.totals[1] / 10).toFixed(1) + 'kステップなので，対象は' + target + '。',
        'd：外部設計から工程比率を順に足し，' + data.scope + '%になる範囲は' + q6Stages.slice(0, data.stageEnd + 1).join('，') + '。',
        'e：抽出処理の' + target + 'の規模は' + (data.scales[2][data.target] / 10).toFixed(1) +
          'kステップ。これを0.5で割ったファンクションの全工程工数に' + data.scope + '%を掛けると' + eligible + '人月。',
      ].join('\n'),
    };
  },
};
