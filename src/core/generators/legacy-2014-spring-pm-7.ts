import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field } from './definition';
import { q7Demand, q7Earliest, q7Work, type Job } from './legacy-2014-spring-pm-05-08-model';
import { q7ReductionPairs, q7VerticalBank, spring2014Pm0508Banks as banks } from './legacy-2014-spring-pm-05-08-source';
import { q0508Answers, q0508Case, q0508Figure, q0508Prompt } from './legacy-2014-spring-pm-05-08-shared';

function valid(jobs: readonly Job[], starts: number[], deadline: number) {
  return jobs.every(job => starts[job.id] + job.duration * 60 <= deadline &&
    job.previous.every(id => starts[id] + jobs[id - 1].duration * 60 <= starts[job.id]));
}

function minimumPeak(jobs: readonly Job[], earliest: ReturnType<typeof q7Earliest>) {
  const starts = [...earliest.start], adjustable = [5, 6, 11];
  function inspect(index: number): number {
    if (index === adjustable.length) {
      if (!valid(jobs, starts, earliest.length)) return Infinity;
      return Math.max(...Array.from({ length: earliest.length / 60 }, (_, hour) => q7Demand(jobs, starts, hour * 60)));
    }
    const id = adjustable[index], end = earliest.length - jobs[id - 1].duration * 60;
    let minimum = Infinity;
    for (let start = earliest.start[id]; start <= end; start += 60) {
      starts[id] = start;
      minimum = Math.min(minimum, inspect(index + 1));
    }
    return minimum;
  }
  return inspect(0);
}

export const legacy2014SpringPm7Definition: AfternoonBookletDefinition = {
  source: '2014h26h-fe-pm-7', title: 'システム移行の作業計画',
  version: '3.7.0', reference: [0], fields: [field('作業要員と一工程の所要時間', 0, 2)],
  sourceAnswer: 'ア／エ／エ／ウ／ア／ウ／ア・オ',
  notes: '物理36–39（冊子35–38）。a四、b六、c五、d五、e四、f六、設問3は五択から順不同二つ。元の13作業・依存関係・図の欠落矢線・朝6時起点・3作業のみの開始時刻見直し・30分短縮を保持し，必要人数と後段の作業時間を変える。最適人数は開始・終了の境界が正時の候補で確かめ，独立テストでは分刻みを用いる。',
  publicNotes: 'アローダイアグラムと作業の順序を保ち，一部の作業に必要な人数と所要時間を変更しました。',
  build(values) {
    const input = q0508Case(values), jobs = q7Work(input), early = q7Earliest(jobs);
    const hours = early.length / 60, morning = q7Demand(jobs, early.start, 3 * 60);
    const durationChoices = input === 2 ? ['9', '10', '13', '15', '19'] : banks['7c'];
    const afternoon = [7, 8, 9].map(hour => q7Demand(jobs, early.start, hour * 60));
    const move = [[5, 10], [5, 14], [6, 7], [6, 8]].findIndex(([job, time]) => {
      const starts = [...early.start]; starts[job] = (time - 6) * 60;
      return valid(jobs, starts, early.length) && q7Demand(jobs, starts, 180) < morning;
    });
    const staff = minimumPeak(jobs, early);
    const reductions = q7ReductionPairs.flatMap((pair, index) => q7Earliest(jobs, pair).length === early.length - 30 ? [index] : []);
    return {
      prompt: q0508Prompt(36, 39, input, line => line.replace('9〜10時の必要人数は12人', '9〜10時の必要人数は' + morning + '人')),
      ...q0508Answers(['7a', '7b', durationChoices, q7VerticalBank.map((_, option) => [q0508Figure('q7-vertical', [0, option])]),
        '7e', '7f', '73'], 'abcdef', [0, 1, 2, 3, 4, 5],
      [0, 3, durationChoices.indexOf(String(hours)), q7VerticalBank.findIndex(row => row.join() === afternoon.join()),
        move, banks['7f'].indexOf(String(staff))], { bank: 6, correct: reductions }),
      explanation: [
        'a，b：No8はNo4の直後に行い，No9の開始までに完了するのでノード5から6へ描く。No10とNo11はどちらもNo9の完了を待つので，ノード7から8と9へダミー矢線を描く。',
        'c，d：各作業の最早開始は先行作業の最も遅い終了時刻。最短所要時間は' + hours +
          '時間となる。13〜15時の各行は開始済みで未終了の作業を数え，必要人数は順に' + afternoon.join('，') + '人。',
        'e，f：No5を10時開始にすると9〜10時の作業を減らせる。No5を14時開始にすると後続が遅れ，No6を7時又は8時開始にはできない。No5，No6及びNo11だけを動かし，同時に行う作業の人数を時刻別に足すと，完了を遅らせずに必要な人数の最大を' + staff + '人まで抑えられる。',
        '設問3：No2とNo9の組又はNo12とNo13の組をそれぞれ15分ずつ短縮すると，並行して進む経路も含めて最遅の完了が30分早くなる。他の組では短縮されない経路が最遅の完了時刻を制約する。',
      ].join('\n'),
    };
  },
};
