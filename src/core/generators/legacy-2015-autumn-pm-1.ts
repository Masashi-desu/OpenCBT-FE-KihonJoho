import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, strings, table, variableNotes } from './definition';
import { autumn2015Pm0104Diagram as diagram, autumn2015Pm0104Profiles as profiles } from './legacy-2015-autumn-pm-01-04-figures';
import { autumn2015Pm1Limits } from './legacy-2015-autumn-pm-01-04-models';
import { autumn2015PmAnswers, autumn2015PmBank as bank, autumn2015PmCase, autumn2015PmSingle as single } from './legacy-2015-autumn-pm-01-04-shared';
import { pm1Choices as choices, pm1Text as text } from './legacy-2015-autumn-pm-01-04-text';

export const legacy2015AutumnPm1Definition: AfternoonBookletDefinition = {
  source: '2015h27a-fe-pm-1',
  title: 'ログ管理システム',
  sourceAnswer: '設問1 a=イ、b/c=イ・カ（順不同）、設問2=エ、設問3=イ、設問4=ア、設問5=ウ・オ',
  version: '3.2.0',
  fields: [field('1日当たりのダウンロード上限', 0, autumn2015Pm1Limits.length - 1)],
  reference: [0],
  publicNotes: 'ログ管理システムの構成を描き直し、同じ社員が1日に全業務システムからダウンロードできる量の上限を変えています。表中の二つの対策と、ログの異常条件を選ぶ設問は、それぞれ二つの答えを順不同で選びます。',
  notes: variableNotes + ' 物理・印刷p.5〜9。公式7行を8選択枠、32固有択44参照に対応させる。別々のb/cと設問5を一つの順不同群に結合しない。d1/d2は原表に表示する一つの組合せ。上限を同じ社員・同日・全業務へ適用し、上限ちょうどを違反としない。合法の切替では元業務への再ログイン時の参照ログを除外しない。',
  build(values) {
    const limit = autumn2015Pm1Limits[autumn2015PmCase(values, autumn2015Pm1Limits.length - 1)];
    const logFields = choices.s2.map(items => items.join('，'));
    const alertConditions = choices.s5.map(item => item.replace('5Mバイト', limit + 'Mバイト'));
    const permissionPairs = choices.s3.map(pair => [...pair]);
    return {
      prompt: [
        p(text.notice), p(text.heading), p(text.opening),
        diagram(profiles.network, [0], '図1 ネットワーク構成図'),
        p(text['use-heading']),
        p(text['use-a'] + text['use-b'].replace('5Mバイト', limit + 'Mバイト')),
        p(text['overview-heading']), p(text.overview),
        p(text['requirements-heading']), ...text.requirements.slice(0, 6).map(p),
        diagram(profiles.underlined, [0], 'ログ管理システムの要件（7）', true),
        p(text.bridge),
        table('表1 ログ管理システムの仕組み（抜粋）', ['No.', '要件', '仕組み'], [
          ['1', 'ログ管理システムのログ集積ファイルを基に，いつ，誰が，どの端末からどの業務システムをどのように操作したかが追跡できる。',
            '・業務システムに組み込まれた検知処理が，ログ管理システムのサーバ上のログファイルに書き込む。\n・ログファイルのログをログ集積ファイルに書き込む。\n・［a］。'],
          ['2', 'ログ管理システムから外部の機器に出力される外部ログ集積ファイルには，改ざんと漏えいを防止する対策を講じる。', '・［b］。\n・［c］。'],
        ]),
        diagram(profiles.permissions, [0], '表2 ログ管理システムへのアクセス権限表（抜粋）'),
        p(text.s1), ...bank('aに関する解答群', choices.a), ...bank('b，cに関する解答群', choices.bc),
        p(text.s2), ...bank('解答群', logFields),
        p(text.s3),
        table('解答群', ['', 'd1', 'd2'], permissionPairs.map((pair, i) => ['アイウエオカ'[i], ...pair])),
        p(text.s4), ...bank('解答群', choices.s4),
        diagram(profiles.underlined, [1], '設問5', true), ...bank('解答群', alertConditions),
      ],
      ...autumn2015PmAnswers([
        strings([...choices.a]), strings([...choices.bc]), strings(logFields),
        permissionPairs.map(pair => [table('組合せ', ['d1', 'd2'], [pair])]),
        strings(choices.s4.map(String)), strings(alertConditions),
      ], [
        single('a', '設問1 a', 0, 1),
        { ids: ['b', 'c'], labels: ['設問1 b', '設問1 c'], bank: 1, correct: [1, 5] },
        single('s2', '設問2', 2, 3),
        single('s3', '設問3（d1／d2）', 3, 1),
        single('s4', '設問4', 4, 0),
        { ids: ['s5-first', 's5-second'], labels: ['設問5 1つ目', '設問5 2つ目'], bank: 5, correct: [2, 4] },
      ]),
      explanation: [
        '設問1 a：時刻を同期すると、異なるサーバに記録された操作の時系列を比較できる。稼働・アクセスの監視や圧縮だけでは記録時刻のずれを解消できない。',
        '設問1 b・c：電子署名を検証して改ざんを検知し、暗号化によって内容の漏えいを抑える。複製、名前の工夫、個人情報の削除、圧縮だけでは二つの目的を満たせない。二つの対策を適用する順を問う空欄ではない。',
        '設問2：日時と操作種別のほか、固定IPの端末、業務システム、社員をそれぞれ識別する。サーバのIPは操作に使った端末のIPではなく、業務IDや社員IDを欠く組合せも要件を満たさない。',
        '設問3：検知処理はログ管理システムへログインした上で業務別ログファイルへ書き込む。従って「可／W」。ログ集積ファイルを参照又は出力する権限を求める設問ではない。',
        '設問4：受信側はログ管理システムのサーバ1台なので、四つの検知処理は同じ受信側公開鍵で暗号化できる。送信元の数や鍵ペアの鍵総数を数えない。',
        '設問5：同じ社員が別の業務を使って元の業務に戻るなら、再ログイン時に元の業務の「参照」が記録される。元の業務の連続する「更新」の間に別業務のログだけが入る流れは利用規程に合わない。また、同じ社員の全業務での1日合計が' + limit + 'Mバイトを超えれば規程違反。ちょうど上限、別日、別社員の量は超過の根拠にならない。参照だけ、更新の実施、参照に続く更新、15分間の参照の不在は、規程内でも起こり得る。',
      ].join('\n'),
    };
  },
};
