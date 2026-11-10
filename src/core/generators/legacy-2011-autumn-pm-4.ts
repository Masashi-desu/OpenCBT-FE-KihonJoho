import { p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2011-autumn-pm-01-04-shared';
import { draw } from './legacy-2011-autumn-pm-01-04-figures';
import { riskModel, riskNames, vulnerabilities } from './legacy-2011-autumn-pm-01-04-models';

const confidentiality = ['社外に開示できる。', '社内だけに開示できる。', '部門内だけに開示できる。', '必要最小限の関係者だけに開示できる。'];
const integrity = ['情報の完全性が失われても，業務への影響はない。', '情報の完全性が失われても，業務への影響は小さい。', '情報の完全性が失われると，業務への影響は大きい。'];
const downtime = ['24時間', '5時間', '1時間', '10分', '1分'];
const threats = ['発生の可能性が低い。', '発生の可能性が中程度である。', '発生の可能性が高い。'];
const policies = ['適切な管理と対策がなされている。', 'ある程度の管理と対策がなされている。', '管理と対策が不十分である。'];
const riskChoices = ['4', '6', '8', '9', '12', '16', '18', '24', '27', '36'];
const availabilityChoices = ['1', '2', '3', '4', '5'];
const countermeasures = ['IDS（侵入検知システム）を導入する。', 'ウイルス対策ソフトを導入する。', '公開鍵暗号を利用する。',
  '定期メンテナンスの回数を増やす。', 'パスワード管理を強化する。'];
const evaluation = (name: string, values: string[], column = '評価基準') =>
  table(name, [column, '値'], values.map((value, i) => [value, String(i + 1)]));

export function autumn2011Pm4Pages(index: number) {
  const { xC, xI, yC, yI, stop } = riskModel(index);
  return [[
    p('問4　情報セキュリティにおけるリスクに関する次の記述を読んで，設問1，2に答えよ。'),
    p('E君の所属するF社では，自社の情報セキュリティにおけるリスクを数値化して管理することになり，基準を設定して所有する情報資産のリスク評価を行うことになった。E君はこのうち，サーバX及びサーバYのリスク評価を担当した。'),
    p('なお，ここでは，試行のための仮の基準と値を扱うが，それぞれに“仮”を表す文言は用いない。'),
    p('〔リスクの値の算出〕'),
    p('F社では，機密性，完全性，可用性のそれぞれについて，情報資産のリスクの値を，次の式で算出する。'),
    p('リスクの値＝情報資産の価値×脅威×脆弱性'),
    p('〔情報資産の価値の評価基準〕'),
    p('F社では，機密性，完全性，可用性のそれぞれから見た情報資産の価値の評価基準と値を，表1〜3のとおりに設定した。'),
    evaluation('表1　機密性の評価基準と値', confidentiality),
    evaluation('表2　完全性の評価基準と値', integrity),
    evaluation('表3　可用性の評価基準と値', downtime.map(value => '定期メンテナンス以外で年間' + value + 'までの利用停止は容認される。')),
  ], [
    p('〔脅威と脆弱性の判断基準〕'),
    p('F社では，脅威と脆弱性の判断基準と値を，それぞれ表4，5のとおりに設定した。'),
    evaluation('表4　脅威の判断基準と値', threats, '判断基準'),
    evaluation('表5　脆弱性の判断基準と値', policies, '判断基準'),
    p('〔サーバX及びサーバY〕'),
    p('サーバXでは，調達先一般情報のデータベースが稼働している。調達先一般情報とは，調達先コード，調達先の正式な名称，略称，住所，電話番号などである。'),
    p('サーバYでは，取引情報のデータベースが稼働している。取引情報とは，調達先コード，購入品コード，単価，購入履歴などである。'),
    p('E君は，サーバX及びサーバYの機密性，完全性，可用性のそれぞれから見た価値を評価するために，調達先一般情報と取引情報に関して，社内関連部門から聴取し，その内容を次のようにまとめた。'),
    p('〔社内関連部門からの聴取内容〕'),
    p('（1）調達先一般情報'),
    p(xC === 2 ? '①　電話帳や各社のWebページで公開されている情報であるが，取引があることをF社の競合他社に知られたくない調達先もあるので，社外には公開できない。' :
      '①　電話帳や各社のWebページにも掲載されている情報であるが，F社では調達先との取引情報の扱いに合わせ，' + (xC === 3 ? 'この一覧は調達部門内だけに開示できる。' : 'この一覧は調達部門の中でも必要最小限の関係者だけに開示できる。')),
    p('②　この情報は，調達先との間で行っているEDI（電子データ交換）では利用していないので，' +
      (xI === 2 ? '誤りがあっても調達業務に与える影響は小さい。' : '誤りがあっても調達業務への影響はない。')),
    p('③　社員が，電話番号の確認や，挨拶状の宛先ラベルの印字に利用しているが，サーバXが利用できない場合には，代替手段での入手が可能である。'),
    p('（2）取引情報'),
    p(yC === 3 ? '①　競合する調達先をはじめ，F社の同業他社に知られてはならない情報である。また，社内でも，他部門には開示できない情報である。' :
      '①　競合する調達先をはじめ，F社の同業他社に知られてはならない情報である。' +
      (yC === 2 ? '社内の他部門にも開示できる。' : '部門内でも必要最小限の関係者だけに開示できる。')),
  ], [
    p(yI === 3 ? '②　情報に誤りがあれば，調達や支払などの業務に与える影響は大きい。' :
      '②　情報に誤りがあれば，調達や支払などの業務に与える影響は' + (yI === 2 ? '小さい。' : 'ない。')),
    p('③　営業時間内の調達オンライン入力処理，及び夜間のバッチ処理で利用されており，これらを処理するシステムは，メンテナンス以外では，年間' + stop + '以上停止することは許されない。'),
    p('〔脅威と脆弱性の状況〕'),
    p('E君は，各サーバがさらされている脅威とその脅威に対するF社の脆弱性を調査し，表4及び表5の判断基準に基づいて評価した。そのうちの主なものを，表6に示す。'),
    draw('riskTables', [index, 0], '表6　サーバX及びサーバYの主な脅威と脆弱性の値'),
    p('〔受容可能なリスク水準〕'),
    p('F社では，受容可能なリスク水準を，表7のとおりに設定した。情報資産について各リスクの値がこれらの値以下であれば，そのリスクを保有し，そうでなければ，リスク対応を行う。'),
    draw('riskTables', [index, 1], '表7　受容可能なリスク水準'),
    p('〔サーバX及びサーバYのリスク評価〕'),
    p('表1〜5の基準，聴取内容及びサーバXとサーバYの状況から，E君は，サーバX及びサーバYに関するリスク評価を行った。F社では，評価に当たって，表1〜3の'),
  ], [
    p('評価基準では，該当する基準の値のうちで最も小さいものを選ぶことにしている。'),
    p('評価結果の一部を表8に示す。'),
    draw('riskTables', [index, 2], '表8　サーバX及びサーバYのリスク評価（抜粋）'),
    p('注記　網掛けの部分は表示していない。“…”は表示の省略を示している。'),
    p('設問1　表8中の［a］〜［d］に入れる正しい答えを，解答群の中から選べ。'),
    ...bank('a〜cに関する解答群', riskChoices),
    ...bank('dに関する解答群', availabilityChoices),
  ], [
    p('設問2　表8のサーバXの完全性の破線で囲まれた部分に関し，F社の受容可能なリスク水準から判断されるリスク対応として適切なものを，解答群の中から選べ。'),
    ...bank('解答群', countermeasures),
  ]];
}

export const legacy2011AutumnPm4Definition = define(4, '情報資産の価値・脅威・脆弱性から求めるリスク', '1a=ウ・1b=キ・1c=ケ・1d=ウ・2=イ',
  '聴取内容・停止許容時間・脅威と脆弱性の値・リスク水準',
  '情報資産の開示範囲や停止の許容時間，脅威・脆弱性の値，対応が必要になるリスク水準を変えます。',
  'p.16〜20。仮の基準、機密性・完全性・可用性の分類、表8点・網掛け・省略・破線、同じ脅威と脆弱性の組、' +
    '該当する評価値の最小、停止時間の厳密な境界、受容水準以下と超過、選択肢数・並びを維持。',
  index => {
    const { xC, yC, yI, stop, riskValues, ratings, availability, acceptable, integrity: riskI, mitigation } = riskModel(index);
    const pages = autumn2011Pm4Pages(index);
    const last = pages[2].pop()!, first = pages[3].shift()!;
    if (last.type !== 'paragraph' || first.type !== 'paragraph') throw Error('ORIGINAL_PAGE_CONTINUATION');
    const risk = (i: number) => riskChoices.indexOf(String(riskValues[i]));
    const steps = [[xC, 3], [yC, 1], [yI, 0]].map(([asset, hazard], i) =>
      [asset, ...ratings[hazard]].join('×') + '＝' + riskValues[i]);
    return {
      prompt: [...pages[0], ...pages[1], ...pages[2], p(last.text + first.text), ...pages[3], ...pages[4]],
      ...answers([strings(riskChoices), strings(availabilityChoices), strings(countermeasures)], [
        single('1a', '設問1 a', 0, risk(0)), single('1b', '設問1 b', 0, risk(1)), single('1c', '設問1 c', 0, risk(2)),
        single('1d', '設問1 d', 1, availability - 1), single('2', '設問2', 2, mitigation),
      ]),
      explanation: '各サーバの価値は聴取結果を表1〜3に照らし，該当する最小値を選ぶ。aのXの機密性，bのYの機密性，cのYの完全性について，表6の対応する脅威・脆弱性と掛けると順に' +
        steps.join('，') + 'となる。Yは年間' + stop + '以上の停止が許されないので，その時間より短い許容停止のうち，最も緩い基準の値' + availability +
        'をdに選ぶ。表8の破線の値は' + riskI.join('，') + 'で，表7の完全性の受容水準' + acceptable[1] + 'を超えるのは' +
        riskNames[mitigation === 1 ? 0 : 3] + 'のみ。対応する脆弱性は' + vulnerabilities[mitigation === 1 ? 0 : 3] + 'なので，' +
        countermeasures[mitigation] + 'EDI（Electronic Data Interchange）は企業間などの電子データ交換，IDS（Intrusion Detection System）は不正な通信や挙動を検知する仕組みである。',
    };
  });
