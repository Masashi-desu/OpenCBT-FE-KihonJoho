import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { field, p, strings, table, variableNotes } from './definition';
import { autumn2015Pm0104Diagram as diagram, autumn2015Pm0104Profiles as profiles } from './legacy-2015-autumn-pm-01-04-figures';
import { autumn2015Pm4Cases, autumn2015Pm4Cookies } from './legacy-2015-autumn-pm-01-04-models';
import { autumn2015PmAnswers, autumn2015PmBank as bank, autumn2015PmCase, autumn2015PmSingle as single } from './legacy-2015-autumn-pm-01-04-shared';
import { pm4Choices as choices, pm4Text as text } from './legacy-2015-autumn-pm-01-04-text';

function inDomain(host: string, domain: string) {
  return host === domain || host.endsWith('.' + domain);
}

export const legacy2015AutumnPm4Definition: AfternoonBookletDefinition = {
  source: '2015h27a-fe-pm-4',
  title: 'Webサイトにおけるセッション管理',
  sourceAnswer: '設問1 a=エ、設問2=ウ、設問3 b=ウ、設問4 c=ウ・d=ア',
  version: '3.2.0',
  fields: [field('クッキーを受け取るホスト・次に接続するホスト・ドメイン指定', 0, autumn2015Pm4Cases.length - 1)],
  reference: [0],
  publicNotes: '商品購入の流れとセッションIDを送受信する三方式を保ち、クッキーを受け取るホスト、次に接続するホスト、ドメイン指定を変えています。受け入れるクッキーと次のリクエストに記載するクッキーは、問題文の規則で別々に判定します。',
  notes: variableNotes + ' 物理・印刷p.17〜20、5欄24択。図の認証前後、矢印の接続と非接続交差、HTML例の下線、(A)〜(C)の順と1個の縦長bを保持。最初はクッキーなし。受信時の上位、送信時の下位、共用上位com/org除外、ドメインのラベル境界を分ける。本文にない現在の実ブラウザ規則を持ち込まない。',
  build(values) {
    const index = autumn2015PmCase(values, autumn2015Pm4Cases.length - 1);
    const c = autumn2015Pm4Cases[index];
    const cookies = autumn2015Pm4Cookies(index);
    const accepted = cookies.filter(cookie => !['com', 'org'].includes(cookie.domain) && inDomain(c.response, cookie.domain));
    const sent = accepted.filter(cookie => inDomain(c.next, cookie.domain)).map(cookie => cookie.name);
    const choiceSets = choices.d.map(item => item.join('と'));
    const sentIndex = choiceSets.indexOf(sent.join('と'));
    if (sentIndex === -1) throw Error('PARAMETER_CONSTRAINT');
    const methodChoices = choices.b.map(tuple => table('方法の組合せ', ['方法'], tuple.map(n => ['(' + n + ')'])));
    return {
      prompt: [
        p(text.heading), ...text.background.map(p), p(text.methods), p(text.cookie), p(text.url),
        diagram(profiles.html, [0], '例', true),
        p(text.hidden), diagram(profiles.html, [1], '例', true),
        p(text.s1), p(text['start-session']), diagram(profiles.purchase, [0], '図1 ショッピングサイトAでの商品購入の流れ'),
        ...bank('aに関する解答群', choices.a), p(text.s2), ...bank('解答群', choices.s2),
        p(text.s3), diagram(profiles.methods, [0], '特徴と方法', true),
        p('bに関する解答群'), table('方法の組合せ', ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ'],
          [0, 1, 2].map(row => choices.b.map(tuple => '(' + tuple[row] + ')'))),
        p(text.s4), ...text['cookie-background'].map(p), p(text['cookie-rules-a'] + text['cookie-rules-b']),
        ...text['cookie-send'].map(p),
        p(text['cookie-case'].replace(/www\.(foo|bar)\.example\.com/g, (_, part: string) => part === 'foo' ? c.response : c.next)),
        table('表1 クッキーの名前と送信先ドメイン名の指示', ['名前', '送信先ドメイン名の指示'],
          cookies.map(cookie => [cookie.name, cookie.domain])),
        ...bank('cに関する解答群', choices.c), ...bank('dに関する解答群', choiceSets),
      ],
      ...autumn2015PmAnswers([
        strings([...choices.a]), strings([...choices.s2]), methodChoices.map(block => [block]),
        strings(choices.c.map(String)), strings(choiceSets),
      ], [
        single('a', '設問1 a', 0, 3), single('s2', '設問2', 1, 2), single('b', '設問3 b', 2, 2),
        single('c', '設問4 c', 3, accepted.length - 1), single('d', '設問4 d', 4, sentIndex),
      ]),
      explanation: [
        'a：注文・決済用の情報をログインからログアウトまで同じセッションに結び付ける。ログイン成功で生成する。閲覧開始では認証前に生成し，閲覧や選択のたびに生成すると一連の処理を同じIDで管理できない。',
        '設問2：長くランダムな文字列は推測されにくい。会員IDや通し番号、両者を連結した値は予測可能である。',
        'b：(A) アドレスバーのURLは(2)、(B) ブラウザのクッキー設定は(1)、(C) リンクのクリックだけではフォームのhidden値が送られないため(3)。この順で並ぶ組合せだけが三つを満たす。',
        'c：応答元 ' + c.response + ' と同じかその上位を指定し，共用上位に該当しないクッキーは ' +
          accepted.map(cookie => cookie.name).join('、') + ' の' + accepted.length + '個。兄弟、文字列の末尾だけが似ている別のドメイン、共用上位は受け入れない。',
        'd：受け入れたものだけを ' + c.next + ' に照合する。指示と同じかその下位に当たる送信先へは ' +
          sent.join('、') + ' を送る。表の中で送信先に一致しても応答時に管理しなかったクッキーは送らない。',
      ].join('\n'),
    };
  },
};
