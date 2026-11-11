import { p, strings, table } from './definition';
import { answers, bank, define, single } from './legacy-2010-autumn-pm-01-04-shared';
import { draw } from './legacy-2010-autumn-pm-01-04-figures';
import { authenticationCase } from './legacy-2010-autumn-pm-01-04-models';

const sessionCT = 'C-T間のセッション鍵KEY_CT';
const sessionCS = 'C-S間のセッション鍵KEY_CS';
const issuerKey = 'チケット発行サーバTの鍵KEY_T';
const appKey = 'APサーバSの鍵KEY_S';
const userKey = '利用者の鍵KEY_C';
const columns = ['データ', 'データの暗号化に用いた鍵', 'データの説明'];
function authenticationBanks(index: number) {
  const { exchange, firstKey } = authenticationCase(index);
  return [
    [sessionCT, 'チケット発行サーバTのID ID_T', exchange ? appKey : issuerKey, '利用者ID ID_C'],
    ['APサーバSのID ID_S', appKey, sessionCS, sessionCT, issuerKey],
    [firstKey ? userKey : appKey, sessionCS, sessionCT, issuerKey],
  ];
}
export function autumn2010Pm4Pages(index: number) {
  const { target, exchange, firstKey } = authenticationCase(index);
  const tBlank = exchange ? '［c］' : '［a］', sBlank = exchange ? '［a］' : '［c］';
  const initialKey = firstKey ? '［d］' : userKey, finalKey = firstKey ? sessionCS : '［d］';
  const groups = authenticationBanks(index);
  return [[
    p('問4　認証システムに関する次の記述を読んで，設問に答えよ。'),
    p('複数のクライアントと複数のアプリケーションサーバ（以下，APサーバという）が接続されているネットワークにおいて，単純な認証システムを利用する場合について，ここでは二つの問題点を取り上げる。'),
    p('① 利用者は，使用するクライアントから各APサーバにログインするごとに，利用者IDとパスワードの入力操作を行わなければならない。'),
    p('② クライアントとAPサーバとの間の通信データの横取りと偽造によって，APサーバのサービスが不正に利用される危険性がある。'),
    p('ここで，これらの問題を改善するための認証システム（以下，新認証システムという）を考える。なお，ここでは，これらの問題に直接関連しない仕様については，その記述を省略する。'),
    p('〔新認証システムによる問題点の解消〕'),
    p('問題点①に対しては，利用者が一度，利用者IDとパスワードをクライアントに入力して認証を受ければ，そのクライアントと各APサーバ間での認証は，利用者を介さないで済むように改善する。'),
    p('このために，チケットと呼ぶ認証データを用いる。チケットは，クライアントに対して発行され，そのクライアントは，APサーバの認証を得るとき，発行されたチケットをAPサーバに送信する。'),
    p('問題点②に対しては，APサーバに送信されたチケットが，チケットの発行を受けたクライアントから送られてきたものであることを，APサーバが確認できるよう，チケットとは別に認証子と呼ぶ認証データを用いる。'),
    p('図1に新認証システムの構成を示す。'),
    draw('authenticationNetwork', 0, '図1　新認証システムの構成'),
  ], [
    p('〔新認証システムの構成と方式についての説明〕'),
    p('（1） 新認証システムでは，共通鍵暗号方式によって，通信データを暗号化する。以下，共通鍵を鍵という。'),
    p('（2） 認証サイトは，認証サーバ，鍵データベース及びチケット発行サーバで構成する。'),
    p('（3） チケット発行サーバの鍵は，チケット発行サーバ自体と鍵データベースに登録されている。'),
    p('（4） 各APサーバの鍵は，それぞれのAPサーバ自体と鍵データベースに登録されている。'),
    p('（5） 利用者の鍵は，利用者のパスワードから計算して決められ，鍵データベースに登録されている。クライアントには，利用者が入力したパスワードから計算した鍵が，利用者がクライアントの利用を終了するまで，一時的に保持される。'),
    p('〔認証のための通信の例〕'),
    p('図2は，利用者が，クライアントCから目的の' + target + 'APサーバSにアクセスする場合の認証の流れを示す。'),
    draw('authenticationFlow', 0, '図2　認証の流れの例'),
    p('注　通信Rは，鍵データベースを参照していることを表す。'),
  ], [
    p('認証は，次の3段階で行われる。ここで，enc(x)は，xを暗号化したものを表す。'),
    p('第1段階は，クライアントCがチケット発行サーバTにチケットを要求するためのチケット（以下，チケット発行サーバT用チケットという）の認証サーバAへの要求（図2中の通信①）と，その発行（図2中の通信②）である。'),
    p('通信①では，クライアントCは，次のデータを認証サーバAに送信する。'),
    table('通信①', ['データ', 'データの説明'], [
      ['ID_C', '利用者IDである。'], ['ID_T', 'チケット発行サーバTのIDである。'],
    ]),
    p('通信②では，認証サーバAは，次のデータをクライアントCに応答する。'),
    table('通信②', columns, [
      ['enc(KEY_CT)', initialKey, 'KEY_CTは，クライアントCとチケット発行サーバTとの間（以下，C-T間という）の通信データの暗号化に用いる鍵であり，C-T間のセッション鍵という。'],
      ['enc(TICKET_CT)', tBlank, 'TICKET_CTは，チケット発行サーバT用チケットである。TICKET_CTはKEY_CTを含む。これによって，チケット発行サーバTにクライアントC経由でKEY_CTを安全に渡すことができる。'],
    ]),
    p('第2段階は，クライアントCがAPサーバSにアクセスするためのチケット（以下，APサーバS用チケットという）のチケット発行サーバTへの要求（図2中の通信③）と，その発行（図2中の通信④）である。'),
    p('通信③では，クライアントCは，次のデータをチケット発行サーバTに送信する。'),
    table('通信③', columns, [
      ['enc(TICKET_CT)', tBlank, 'enc(TICKET_CT)は，クライアントCでは復号できない。クライアントCはチケット発行サーバTにそのまま送信し，チケット発行サーバTが復号する。'],
      ['enc(AUTH_C1)', '［b］', '認証子AUTH_C1は，クライアントCが生成する。'],
      ['enc(ID_S)', '［b］', 'ID_Sは，APサーバSのIDである。'],
    ]),
  ], [
    p('チケット発行サーバTは，TICKET_CTを送信したのが間違いなくクライアントCであることをTICKET_CTとAUTH_C1から確認する。確認ができたとき，通信④では，チケット発行サーバTは，次のデータをクライアントCに応答する。'),
    table('通信④', columns, [
      ['enc(KEY_CS)', '［b］', 'KEY_CSは，クライアントCとAPサーバSとの間（以下，C-S間という）の通信データの暗号化に用いる鍵であり，C-S間のセッション鍵という。データの暗号化に用いた鍵は，チケット発行サーバTが，通信③で受け取ったenc(TICKET_CT)から取り出したものである。'],
      ['enc(TICKET_CS)', sBlank, 'TICKET_CSは，APサーバS用チケットである。TICKET_CSは，KEY_CSを含む。これによって，APサーバSにKEY_CSをクライアントC経由で安全に渡すことができる。'],
    ]),
    p('第3段階は，APサーバS用チケットの提示である（図2中の通信⑤）。'),
    p('通信⑤では，クライアントCは，次のデータをAPサーバSに送信する。'),
    table('通信⑤', columns, [
      ['enc(TICKET_CS)', sBlank, 'enc(TICKET_CS)は，クライアントCでは復号できない。クライアントCはAPサーバSにそのまま送信し，APサーバSが復号する。'],
      ['enc(AUTH_C2)', finalKey, '認証子AUTH_C2は，クライアントCが生成する。'],
    ]),
    p('APサーバSは，TICKET_CSを送信したのが間違いなくクライアントCであることをTICKET_CSとAUTH_C2から確認する。確認ができたとき，利用者は，クライアントCから，APサーバSへのアクセスが許可される。'),
  ], [
    p('設問　本文中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    ...bank('aに関する解答群', groups[0]),
    ...bank('b，cに関する解答群', groups[1]),
    ...bank('dに関する解答群', groups[2]),
  ]];
}

export const legacy2010AutumnPm4Definition = define(4, '認証システム', 'a=ウ・b=エ・c=イ・d=イ',
  '利用サービスと，チケット・認証子・セッション鍵の暗号化について問う位置',
  '利用サービスを変え、T用とS用のチケット、およびセッション鍵の受渡しや認証子について空欄にする鍵を変えます。',
  'p.16〜20。共通鍵の保有者、IDと鍵の区別、利用者鍵の一時保持、五通信の方向、Cが復号できない二つのチケット、二つのセッション鍵と認証子を保持。原条件の三段階の選択形式を保ち，ラベルだけの並替えに終わらず，固定欄と解答欄のどちらで鍵をたどるかを変更する。', index => {
    const { exchange, firstKey } = authenticationCase(index);
    const groups = authenticationBanks(index);
    const targets = [exchange ? appKey : issuerKey, sessionCT, exchange ? issuerKey : appKey, firstKey ? userKey : sessionCS];
    return {
      prompt: autumn2010Pm4Pages(index).flat(),
      ...answers(groups.map(group => strings(group)), [
        single('a', 'a', 0, groups[0].indexOf(targets[0])), single('b', 'b', 1, groups[1].indexOf(targets[1])),
        single('c', 'c', 1, groups[1].indexOf(targets[2])), single('d', 'd', 2, groups[2].indexOf(targets[3])),
      ]),
      explanation: 'APはApplicationの略で，ここではアプリケーションを提供するサーバを表す。IDはIdentifierの略で識別子を意味し，暗号化に使う鍵とは役割が異なる。TICKET_CTはCが開けずTが復号するのでT自身の鍵KEY_Tで暗号化する。KEY_CTはCが利用者の鍵KEY_Cで復号して得る。Tはチケットから同じKEY_CTを取り出すため，CとTの認証子・サーバID・KEY_CSの受渡しはKEY_CTで暗号化する。' +
        'TICKET_CSもCが開けずSが復号するため，S自身の鍵KEY_Sで暗号化する。CはTからKEY_CSを得ており，Sもチケットから同じ鍵を得るので，通信⑤の認証子はKEY_CSで暗号化する。' +
        'したがってaは' + targets[0] + '，bは' + targets[1] + '，cは' + targets[2] + '，dは' + targets[3] + 'である。',
    };
  });
