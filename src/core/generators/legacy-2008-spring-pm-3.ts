import { p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2008-spring-pm-01-05-shared';
import { draw } from './legacy-2008-spring-pm-01-05-figures';

import { backupCases } from './legacy-2008-spring-pm-3-model';
const gb = (size: number) => (size / 10).toFixed(1);
const count = ['1', '2', '6', '7', '8'];

function backup(index: number) {
  const { total, size, speed, exchange } = backupCases[index];
  const unit = size * 100 / (60 * speed), full = total * 1000 / (60 * speed);
  const largest = 7 * unit, daily = 2 * unit;
  const restore = full + largest + exchange;
  const times = [unit, daily, 6 * unit, largest, full - unit, full];
  const restoreOptions = [largest + exchange, full + 6 * unit + exchange, full + largest, restore, full + 8 * unit + exchange];
  return { times, restoreOptions, full, largest, daily, restore };
}
export function spring2008Pm3Pages(index: number) {
  const { total, size, speed, exchange, opening, closing } = backupCases[index];
  const { times, restoreOptions, full } = backup(index);
  return [[
    p('問3　データファイルのバックアップに関する次の記述を読んで，設問1，2に答えよ。'),
    p('Y社では，業務系システムが使用する業務データを磁気テープにバックアップすることを検討している。'),
    p('この業務系システムのサービス運用時間は，営業日（月曜日〜土曜日）の' + opening + '〜' + closing + 'である。全体で' +
      total + 'Gバイトからなる業務データは，共通ファイルと，月曜日〜土曜日の各曜日に利用する六つの曜日ファイル群からなる。各営業日には，共通ファイル全体（' +
      gb(size) + 'Gバイト）及びその曜日の曜日ファイル群の一部（場所は不定で' + gb(size) + 'Gバイト）の計' +
      gb(2 * size) + 'Gバイトを更新する。データの更新状況を図に示す。ここで，1Gバイト＝1,000Mバイトとする。'),
    draw('backup', index, '図　データの更新状況'),
    p('このシステムにおいて，バックアップ方式を次のとおり検討している。'),
    p('（1）週1回，日曜日にすべての業務データのバックアップ（フルバックアップ）を実施する。'),
    p('（2）月曜日〜土曜日に実施する部分バックアップは，次のいずれかの方式とする。'),
    p('① 方式A　日曜日のフルバックアップの時点以後に更新された業務データをすべてバックアップする。'),
    p('② 方式B　前日のバックアップの時点以後に更新された業務データだけをバックアップする。'),
  ], [
    p('（3）その他の条件は，次のとおりである。'),
    p('① バックアップは，その日の業務終了後に実施し，その日のうちに終了する。'),
    p('② 磁気ディスクから磁気テープへのバックアップの速度は' + speed + 'Mバイト／秒，磁気テープから磁気ディスクへのリストアの速度も同じく' + speed + 'Mバイト／秒である。'),
    p('③ フルバックアップと各営業日の部分バックアップはそれぞれ別の磁気テープに保存することとし，それぞれのバックアップデータは1本に収まるものとする。'),
    p('設問1　バックアップ時間に関する次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('日曜日のフルバックアップに要する時間は' + full + '分である。'),
    p('月曜日〜土曜日の部分バックアップは，方式Aの場合で最も時間がかかる曜日には［a］分，方式Bの場合で毎日［b］分かかる。'),
    p('なお，磁気テープはバックアップ開始までにセットされているものとする。'),
    ...bank('解答群', times),
  ], [
    p('設問2　障害発生時のデータ復旧に関する次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('障害発生時のデータ復旧に使用する磁気テープの最大本数は，フルバックアップした磁気テープを含めると，方式Aでは［c］本，方式Bでは［d］本である。'),
    p('方式Aを採用した場合，復旧には最長で［e］分かかる。'),
    p('なお，磁気テープの交換時間は' + exchange + '分とする。また，復旧の時間には，最初の磁気テープをセットする時間と最後の磁気テープを取り出す時間は含まない。'),
    ...bank('c，dに関する解答群', count), ...bank('eに関する解答群', restoreOptions),
  ]];
}

export const legacy2008SpringPm3Definition = define(3, '差分・増分バックアップと復旧時間', '設問1 a=エ・b=イ・設問2 c=イ・d=エ・e=エ',
  '更新領域・バックアップ速度・テープ交換時間', '全容量、日々の更新領域、磁気テープへの転送速度と交換時間を変更します。',
  'p.9〜11。日〜土の更新・十進のG/M換算・共通領域重複・1バックアップ1本・交換の除外条件を保持。共有の6択、5択、5択を原順で固定。', index => {
    const { times, restoreOptions, largest, daily, restore, full } = backup(index);
    return {
      prompt: spring2008Pm3Pages(index).flat(),
      ...answers([strings(times.map(String)), strings(count), strings(restoreOptions.map(String))], [
        single('a', '設問1 a', 0, 3), single('b', '設問1 b', 0, 1),
        single('c', '設問2 c', 1, 1), single('d', '設問2 d', 1, 3), single('e', '設問2 e', 2, 3),
      ]),
      explanation: '方式Aは土曜日までに更新した曜日別6領域と共通1領域を一度ずつ保存するため' + largest +
        '分。方式Bは直前の1日分で，共通とその曜日の2領域なので毎日' + daily +
        '分。Aの復旧に必要なのは日曜日と最新差分の2本，Bは日曜日と最大6日分の7本。Aの最長時間はフル復旧' + full +
        '分＋土曜日の差分復旧' + largest + '分＋2本間の交換' + backupCases[index].exchange + '分＝' + restore + '分。',
    };
  });
