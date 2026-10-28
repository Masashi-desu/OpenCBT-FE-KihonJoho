import type{StudyTerm}from'../study-acronyms';import type{Question}from'../types';
const term=(n:number,name:string,meaning:string,expansion?:string):StudyTerm=>({term:name,meaning,...(expansion?{expansion}:{}),sources:[`2018h30a-fe-pm-${n}`]});
export const autumn2018Pm2StudyTerms:StudyTerm[]=[
 term(2,'CPU','命令を実行する中央処理装置。本問のCPUは一つで，一度に実行できるプロセスも一つである。','Central Processing Unit'),
 term(2,'OS','プロセスの実行や入出力などの資源を管理する基本ソフトウェア。本問では状態遷移や割当てに伴う処理時間を無視する。','Operating System'),
 term(2,'ラウンドロビン','実行可能なプロセスに順番にCPU時間を割り当てる方式。割当て時間を使い切った場合と，入出力を開始した場合では，次に移る状態が異なる。'),
 term(2,'タイムクウォンタム','プロセスが連続してCPUを使用できる割当て時間の上限。実行を再開するたびに割当て時間の計測を始める。'),
 term(2,'プロセスの状態','実行はCPUを使用している状態，実行可能はCPUの割当てを待っている状態，待ちは入出力などの終了を待っている状態である。'),
 term(2,'入出力待ち','入出力の処理が終わるのを待つ期間。この期間はCPUを使用しない。本問では異なるプロセスの入出力待ちは並行して進む。'),
 term(2,'優先度','実行可能なプロセスのうち，どれを次に選ぶかを決める基準。本問では数値が大きいほど優先し，同じ優先度なら登録された順に割り当てる。')];
export const autumn2018Pm3StudyTerms:StudyTerm[]=[
 term(3,'SQL','関係データベースの定義，検索，更新などを記述する言語。本問に独自定義がある関数は，その定義に従って読む。','Structured Query Language'),
 term(3,'主キー','表の各行を一意に識別する列又は列の組合せ。重複した値及びNULLを許さない。図の下線は主キーを示す。'),
 term(3,'参照制約','参照する列の値と，参照先のキーの値との対応を保つ制約。参照先の列の組と参照元の列の組を区別する。'),
 term(3,'NULL','データベースで値が不明又は存在しないことを表す。0や空文字列とは異なり，通常の等号ではなくIS NULLなどで判定する。'),
 term(3,'左外部結合','左側の行を残して対応する右側の行を結合する。対応する行がない場合，右側の列はNULLとなる。結合条件と結合後の抽出条件は役割が異なる。'),
 term(3,'集約関数','複数行の値から合計や件数などを求める関数。表全体をまとめるか，GROUP BYで分けた各群をまとめるかを区別する。'),
 term(3,'FLOOR','引数の値を超えない最大の整数を返す関数。整数の金額に率を掛けた後で使うときは，掛け算と丸めの順序に注意する。'),
 term(3,'CASE','条件によって返す値を選ぶ式。複数の条件があるときは，上から判定する順序と，どの条件にも該当しない場合の値を確認する。')];
export const autumn2018Pm4StudyTerms:StudyTerm[]=[
 term(4,'DMZ','インターネット側と内部側の間で，公開又は中継用のサーバを配置する領域。本問ではスイッチAとプロキシサーバの配置を図で確認する。','Demilitarized Zone'),
 term(4,'LAN','建物内などの範囲で機器を接続するネットワーク。本問では各セグメントの機器をスイッチに接続する。','Local Area Network'),
 term(4,'SSH','通信を暗号化し，相手の認証を行いながら遠隔ログインなどを行うための仕組み。本問ではPCから別のPCへのログインに使う。','Secure Shell'),
 term(4,'ping','相手からの応答によってネットワーク上の到達性などを確認するコマンド。応答が返ることだけで，全てのアプリケーションの接続が正常とは判断できない。'),
 term(4,'リモートデスクトップ','手元のPCをクライアントとして，他のPCを遠隔操作する技術。操作される側のPCがサーバとなる。'),
 term(4,'パケットフィルタ','送信元・宛先のネットワーク，ポート番号などを基に通信の通過を制御する仕組み。本問は許可した通信の応答も通過させると明記している。'),
 term(4,'冗長化','機器や経路を複数用意して，一つの故障時に他方へ切り替えられるようにする。機器の台数だけでなく，接続先と切替えの設定を確認する。'),
 term(4,'負荷分散','処理や通信を複数の装置へ分担させること。故障に備える切替えとは目的が異なり，担当の分け方によって偏りが変わる。')];
export const autumn2018Pm13StudyTerms:StudyTerm[]=[
 term(13,'相対参照','式を別のセルへ複写するとき，複写元と複写先の位置の差に合わせて参照先も移す方法。表計算の相対(A2,行の位置,列の位置)は，基準セルから数えた位置のセル変数を表す。'),
 term(13,'絶対参照','式を複写しても指定した行番号又は列番号を変えない参照方法。$の付いた行又は列だけを固定し，付いていない側は相対的に移す。'),
 term(13,'空値','値が格納されていないセルの状態で，nullと表す。数値0とは役割が異なる。本問の条件付個数は空白セルを数えない。'),
 term(13,'条件付個数','指定した範囲の各セルを検索条件と比較して，条件を満たすセルの個数を返す関数。範囲の始端と終端，条件の不等号と等号の有無を確認する。'),
 term(13,'条件付合計','条件を判定する範囲で該当した位置と同じ位置にある，合計範囲の数値を足す関数。条件を調べる列と数値を足す列を区別する。'),
 term(13,'照合検索','検索のセル範囲で式の値と一致する最初のセルを探し，抽出のセル範囲の同じ位置の値を返す関数。二つの範囲の位置の対応を維持する。'),
 term(13,'待ち時間と待ち人数','待ち時間は受付からサービス開始までの時間であり，待ち人数はある受付時点にまだ開始していない先行する利用者の人数である。サービス中の利用者の人数とは異なる。'),
 term(13,'マクロ','ワークシート上の処理をまとめた手続。本問は受付番号の順で，最も早く空く窓口へ処理行を割り当て，開始・終了時刻を更新する。'),
 term(13,'切捨て','指定した桁位置で端数を切り捨てる関数。本問は分単位の整数値を計算に使い，時刻や時間を時:分の形式で表示する。')];
const ownerTerms:Record<string,StudyTerm[]>={'2':autumn2018Pm2StudyTerms,'3':autumn2018Pm3StudyTerms,'4':autumn2018Pm4StudyTerms,'13':autumn2018Pm13StudyTerms};
/** Proposed source gate for new owner modules only. Q1 keeps its existing
 * effective/canonical/inherited term path, Q8 its existing expression terms.
 * Global glossary selection stays root-owned. */
export function autumn2018OwnerStudyTerms(q:Question):StudyTerm[]|undefined{const refs=q.origin.sourceRefs,n=refs[0]?.locator.questionNumber;if(q.subject!=='B'||!n||!ownerTerms[n]||!refs.length||!refs.every(r=>r.sourceId===`source-ipa-2018h30a-fe-pm-${n}-qs`&&r.locator.year===2018&&r.locator.period==='秋期'&&r.locator.timeSlot==='午後'&&r.locator.questionNumber===n))return undefined;return structuredClone(ownerTerms[n]);}
