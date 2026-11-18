import { field, p, strings, variableNotes, type GenerationDefinition } from './definition';

// 問いと原4択の構成はIPA過去問題の利用条件に従う。
// 四択のガイダンス由来表現とその改変はCC BY-SA 2.1 JP。NOTICE.md参照。
const prompt = '非機能要件の定義で行う作業はどれか。';
const cases = [
  {
    prompt,
    choices: [
      '業務を構成する機能間の情報（データ）の流れを明確にする。',
      'システム開発で用いるプログラム言語に合わせた開発基準，標準を作成する。',
      'システム機能として実現する範囲を定義する。',
      '他システムとの情報授受などのインタフェースを明確にする。',
    ],
    correctIndex: 1,
    explanation: 'プログラムを書く担当者が共通で従う約束を定めるのがイである。アは内部でデータを誰から誰へ渡すか，ウはシステムがどの仕事を受け持つか，エは外部との情報交換で何を扱うかを決める。ア・ウ・エはいずれも業務処理の内容を定めている。',
  },
  {
    prompt: '倉庫の入出庫管理システムを開発する。非機能要件の定義で行う作業はどれか。',
    choices: [
      '入荷登録から棚入れの機能へ引き渡す品番や数量を定める。',
      '担当者とシステムのどちらが棚番の割当てを行うかを定める。',
      '実装言語で例外を記録するときのログの書式を開発標準として定める。',
      '配送システムへ引き渡す出荷情報の項目を定める。',
    ],
    correctIndex: 2,
    explanation: '例外ログの書式をそろえると，開発者が同じ方法で障害の記録を残せる。ログの書式を決めても，入出庫で扱う品番や数量，棚番を決める担当，配送側に渡すデータは決まらない。これら三つは倉庫の処理を決める作業である。',
  },
  {
    prompt: '修理受付システムを複数チームで開発する。非機能要件の定義で行う作業はどれか。',
    choices: [
      '受付から見積りの機能へ引き渡す故障内容の項目を定める。',
      '部品の取寄せを人が行い，システムは到着予定だけを管理するという分担を定める。',
      '会計システムへ渡す修理代金の項目と送信の契機を定める。',
      'ビルド時に有効にする言語処理系の警告を開発標準として定める。',
    ],
    correctIndex: 3,
    explanation: '警告の指定は，各チームがプログラムを検査して組み立てる際の共通条件である。故障情報の引渡し，部品調達の分担，会計への通知は，受付から修理・精算までの業務をどう処理するかという決定である。',
  },
  {
    prompt: '予約管理システムを共通ライブラリを使って開発する。非機能要件の定義で行う作業はどれか。',
    choices: [
      '実装言語の型の扱いと共通部品を呼び出す方法を開発規約として定める。',
      '予約受付と空き状況確認との間で引き渡す日程の情報を定める。',
      '利用者が変更を申し出てからシステムが変更を確定するまでの担当範囲を定める。',
      '決済サービスに渡す予約番号と金額を定める。',
    ],
    correctIndex: 0,
    explanation: '型と部品の使い方を統一するのは，開発者が実装で守る条件を定める作業である。ほかの選択肢が定めるのは，予約情報の引渡し，変更を処理する範囲，決済側に渡す情報という予約サービスの仕事である。',
  },
] as const;

export const legacy2014AutumnAm65Definition: GenerationDefinition = {
  source: '2014h26a-fe-am-65',
  title: '非機能要件の定義で行う作業',
  fields: [field('開発対象と開発上の共通条件', 0, cases.length - 1)],
  reference: [0],
  sourceAnswer: 'イ',
  version: '3.2.0',
  notes: variableNotes + ' 原PDF p.27の肯定の短問と作業を選ぶ四択を維持。開発対象に応じて実装時の取り決めと三つの業務作業を全て変える。当時のガイダンスの技術要件(c)(d)を参照する。',
  build(values) {
    if (values.length !== 1 || !Number.isInteger(values[0]) || values[0] < 0 || values[0] >= cases.length)
      throw Error('PARAMETER_CONSTRAINT');
    const row = cases[values[0]];
    return { prompt: [p(row.prompt)], choices: strings([...row.choices]), correctIndex: row.correctIndex, explanation: row.explanation };
  },
};
