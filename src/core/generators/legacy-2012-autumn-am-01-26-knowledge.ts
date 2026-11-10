import { choiceBody, define, source } from './legacy-2012-autumn-am-01-26-shared';

type KnowledgeCase = { prompt: string; explanation: string; correctIndex: number; choices?: readonly string[] };
type Variant = readonly [prompt: string, answer: number, why: string];

function knowledge(number: number, condition: string, review: string, original: string, variants: readonly KnowledgeCase[]) {
  const originalCase = { prompt: source[number].prompt, explanation: original, correctIndex: 'アイウエ'.indexOf(source[number].sourceKey) };
  const cases: readonly KnowledgeCase[] = [originalCase, ...variants];
  return define(number, condition, cases.length, review, index => {
    const current = cases[index], choices = current.choices ?? source[number].choices;
    return choiceBody(current.prompt, choices, choices[current.correctIndex], current.explanation);
  });
}

const terms = (base: string, variants: readonly Variant[]) => variants.map(([prompt, correctIndex, why]) => ({
  prompt, correctIndex, explanation: why + ' ' + base,
}));

const markupSummary = 'XML（Extensible Markup Language）は利用目的に応じてタグを定義できる文書記述言語で、SGML（Standard Generalized Markup Language）を基にする。HTML（HyperText Markup Language）はWeb文書の意味や構造を記述する。XSLT（XSL Transformations。XSLはExtensible Stylesheet Language）はXMLを別の構造へ変換する。';
const markup = knowledge(8, '特徴を判定する文書処理の言語', '用語から特徴を選ぶ向きを維持する。対象言語を変え、タグ定義・Web文書の構造・変換・画面表示の4記述を独立に対応付ける。',
  markupSummary + ' XMLをHTMLの表示性能の拡張とみなしたり、スタイル言語を一律にHTMLと同じとしたり、SGMLとの関係を否定したりできない。', [
    {
      prompt: 'HTMLの特徴として，最も適切なものはどれか。', correctIndex: 0,
      choices: ['Web文書の見出しや段落などを要素で表現する。', '任意に定義したタグの交換を主用途とする。', 'XML文書を入力として変換規則を適用する。', '文書の表示色を設定することだけを役割とする。'],
      explanation: markupSummary + ' 表示色などの装飾には別にCSS（Cascading Style Sheets）を使う。',
    },
    {
      prompt: 'SGMLの特徴として，最も適切なものはどれか。', correctIndex: 2,
      choices: ['XML文書を別の文書構造へ変換する規則を書く。', '文書を画素の集まりとして格納する。', '文書の種類ごとのマーク付け規則を定義できる。', 'HTMLだけを処理する通信プロトコルである。'],
      explanation: markupSummary + ' SGMLは特定の描画形式や通信手順に限定されない。',
    },
    {
      prompt: 'XSLTの特徴として，最も適切なものはどれか。', correctIndex: 3,
      choices: ['HTMLの表示速度を測定する。', 'ネットワークの通信経路を決定する。', '文書のタグ名の登録だけを行う。', 'テンプレート規則によってXML文書を変換する。'],
      explanation: markupSummary + ' 変換規則は文書を表示する性能の測定や通信経路の決定とは別の役割をもつ。',
    },
  ]);

const diskSummary = 'ディスクアットワンスは光ディスクを一連の操作で書き切る方式、ディスクキャッシュは一時記憶による読書きの効率化、ディスクストライピングはブロックの分散配置、ディスクミラーリングは同じデータの複製である。';
const disk = knowledge(11, 'ストレージに求める処理と配置', '処理の説明から名称を選ぶ四択を維持し、書込み手順・再読込み・分散配置・複製の対象を切り替える。',
  'ブロックを複数のディスクに割り当てて並列にアクセスするので、ストライピングである。' + diskSummary,
  terms(diskSummary, [
    ['ディスクを読む際、先に読み込んだデータを高速な一時記憶に残し、同じデータへの次のアクセスを高速化する手法はどれか。', 1, '繰返し参照に一時記憶を使う。'],
    ['一方の磁気ディスクに故障が起きても同じデータを参照できるよう、別のディスクにも全く同じ内容を記録する手法はどれか。', 3, 'データの複製を保持する。'],
    ['光ディスクへの書込みで、ディスク全体を一度に書き込み、書込みを完了させる手法はどれか。', 0, '書込みを一度に完了する。'],
  ]));

const webSummary = '3層構成では表示、業務処理、データ管理の役割を分ける。HTML（HyperText Markup Language）は文書の構造を記述し、HTTP（Hypertext Transfer Protocol）の要求と応答でWebブラウザがサーバとやり取りする。';
const web = knowledge(13, 'Webシステムで確認する層と処理', 'Webシステムの各層の説明から適切なものを選ぶ向きを維持する。表示、業務規則、データ管理を切り替える。',
  '業務処理をサーバ側に置き、クライアントは返されたHTMLを解釈して表示する。HTMLをサーバで実行するという説明や、業務プログラムの全端末への配布、ブラウザでのHTTP要求の待受けはこの構成に必要ない。' + webSummary, [
    {
      prompt: '3層クライアントサーバシステム構成のWebシステムで，表示の役割の説明として適切なものはどれか。',
      correctIndex: 1, choices: ['業務規則を全てデータベースから直接取り出して実行する。', 'ブラウザが受信したHTMLを解釈して画面を表示する。', '表示するたびに業務処理プログラムを端末に配布する。', 'データベース側が利用者のキーボード入力を直接取得する。'],
      explanation: '利用者と画面を仲介する表示の役割はブラウザ側にある。' + webSummary,
    },
    {
      prompt: '3層クライアントサーバシステム構成のWebシステムで，業務規則を変更する場合の説明として適切なものはどれか。',
      correctIndex: 3, choices: ['Webブラウザ全てに業務処理用の実行ファイルを再配布する。', 'データ管理層でブラウザの表示処理を置き換える。', 'HTTP要求の送受信方向を逆にする。', '業務処理を担当するサーバ側のプログラムを更新する。'],
      explanation: '業務規則の実装は業務処理層に集中するので、端末へ同じ業務プログラムを再配布しない。' + webSummary,
    },
    {
      prompt: '3層クライアントサーバシステム構成のWebシステムで，データ管理の役割の説明として適切なものはどれか。',
      correctIndex: 0, choices: ['業務処理層からの検索や更新の要求に応じて永続データを管理する。', 'ブラウザの画面描画を担当する。', '端末のHTML文書を業務用の実行ファイルに変換する。', 'ブラウザから受けたマウス操作を業務処理層を経ず全て実行する。'],
      explanation: 'データ管理層が永続データを扱い、業務規則と表示の責任を分ける。' + webSummary,
    },
  ]);

const redundantSummary = 'デュアル方式では二系統が同じ処理を同時に行って結果を照合する。待機方式は現用と待機の役割が異なり、切替え前の準備量によって分類できる。装置単位の冗長化は二つの独立した処理結果の照合と区別する。';
const standby = [...source[14].choices];
const duplex = knowledge(14, '比較するシステムの二重化方式', '名称から冗長構成の説明を選ぶ向きを維持する。両系の同時照合、切替え準備量、装置単位冗長の差を明確にする。',
  redundantSummary + ' 同時に処理を行って結果を照合する記述が、デュアルシステムの説明に該当する。', [
    {
      prompt: 'デュプレックスシステムのホットスタンバイ方式の説明として，最も適切なものはどれか。', correctIndex: 2,
      choices: [standby[0], '現用系の故障後に待機系の電源を入れ、環境設定とプログラムの準備を行ってから切り替える。', standby[2], standby[3]],
      explanation: 'ホットスタンバイでは待機系を起動し、オンライン処理をすぐ引き継げるよう事前に準備する。' + redundantSummary,
    },
    {
      prompt: 'デュプレックスシステムのコールドスタンバイ方式の説明として，最も適切なものはどれか。', correctIndex: 1,
      choices: [standby[0], '待機系は電源投入や環境設定をせずに備え、現用系の故障後に起動・準備して切り替える。', standby[2], standby[3]],
      explanation: 'コールドスタンバイでは起動と環境準備を切替え時に行うので、起動済みのホットスタンバイより時間を要する。' + redundantSummary,
    },
    {
      prompt: 'デュプレックスシステムのウォームスタンバイ方式の説明として，最も適切なものはどれか。', correctIndex: 1,
      choices: [standby[0], '待機系を起動して備え、現用系の故障後にオンライン処理の準備を完了してから切り替える。', standby[2], standby[3]],
      explanation: 'ウォームスタンバイは待機系が一部準備済みで、切替え前に残る作業を行う。即時切替えと電源投入からの切替えの中間である。' + redundantSummary,
    },
  ]);

const repairSummary = 'MTBF（Mean Time Between Failures）は平均故障間隔、MTTR（Mean Time To Repair）は平均修復時間。平均値でみた稼働率はMTBF／(MTBF＋MTTR)であり、MTBFを長くするかMTTRを短くすると高まる。';
const maintenance = knowledge(16, '信頼性評価で注目する保守の効果', 'コンピュータの信頼性に関する正しい記述を選ぶ。MTBF、MTTR、稼働率の関係を異なる条件で区別する。',
  repairSummary + ' 予防保守は故障を抑えて平均故障間隔を長くする。遠隔保守が修復を早める場合はMTTRが短くなる。',
  [
    {
      prompt: 'システムの平均故障間隔が変わらず，平均修復時間だけを短縮する保守を導入したときの記述として，適切なものはどれか。',
      correctIndex: 0, choices: ['MTTRが短くなり，稼働率が向上する。', 'MTTRが長くなり，稼働率が向上する。', 'MTBFが短くなり，稼働率が低下する。', 'MTBFが長くなり，稼働率は変わらない。'],
      explanation: repairSummary + ' 設問では平均故障間隔が一定なので、変わるのは分母の修復時間だけである。',
    },
    {
      prompt: 'システムの平均修復時間を変えずに予防保守で平均故障間隔を長くしたときの記述として，適切なものはどれか。',
      correctIndex: 2, choices: ['MTTRが長くなり，稼働率は低下する。', 'MTTRが短くなり，稼働率は変わらない。', 'MTBFが長くなり，稼働率が向上する。', 'MTBFが短くなり，稼働率が向上する。'],
      explanation: repairSummary + ' 同じ修復時間に対し稼働時間が長くなるので、全体に占める稼働の割合が増える。',
    },
    {
      prompt: 'システムの平均故障間隔と平均修復時間をいずれも同じ比率で長くしたときの記述として，適切なものはどれか。',
      correctIndex: 1, choices: ['稼働率が同じ比率で増える。', '稼働率は変化しない。', '故障から復旧する平均時間が短くなる。', '平均故障間隔だけが長くなる。'],
      explanation: repairSummary + ' 分子と分母が同じ比率で増えるので稼働率は変化しない。',
    },
  ]);

const schedulingSummary = 'CPU（Central Processing Unit）は中央処理装置。選択肢は順に、待ち時間で優先度を補正、ラウンドロビン、最短処理時間を先に選ぶ方式、到着順である。';
const scheduling = knowledge(17, '比較するCPU割当ての性質', '処理手順からどの方式が所定の待ち方・CPU割当てを生じさせるかを問う向きを保持。待ち続ける可能性、時分割、到着順、優先度補正を切り替える。',
  '短いタスクが到着し続けると長いタスクが選ばれない可能性がある。待ち時間で優先度を上げる方式や待ち行列の順番を使う方式は、この理由では先送りされない。' + schedulingSummary,
  terms(schedulingSummary, [
    ['タスクスケジューリング方式の説明のうち，一定時間ごとに実行中のタスクが別のタスクへCPUを譲るものはどれか。', 1, '時間片を使い切ったタスクを行列の最後尾へ戻す方式である。'],
    ['タスクスケジューリング方式の説明のうち，割当てを待つ時間が長いタスクほど優先度を上げるものはどれか。', 0, '待ち時間による優先度の補正に該当する。'],
    ['タスクスケジューリング方式の説明のうち，先に到着した長いタスクの処理が続く間は，後から到着した短いタスクを到着順のまま待たせるものはどれか。', 3, '処理予定時間では並べ替えず、到着順で先頭のタスクに割り当てる。'],
  ]));

const memorySummary = 'OS（Operating System）はオペレーティングシステム。コンパクションは使用領域を寄せて空きをまとめ、スワッピングは主記憶と補助記憶の間で退避・復帰させる。フラグメンテーションは空き領域などの断片化、ページングは固定長のページ単位で記憶を管理する方式である。';
const memory = knowledge(18, '記憶領域に生じる現象又は操作', '状況を説明し、その名称を4択から選ぶ。断片化と圧縮、退避と固定長割当てを別に問う。',
  '小さな空き領域が多数に分かれて連続した大きな領域を確保しにくくなる現象は、フラグメンテーションである。' + memorySummary,
  terms(memorySummary, [
    ['OSが主記憶内の使用領域を移動して，細切れの未使用領域を一つの連続した空きにまとめる操作を何というか。', 0, '領域を寄せて空きの連続性を回復する。'],
    ['OSが主記憶を空けるためにプロセスの記憶内容を補助記憶へ退避し，必要になったら主記憶に戻す方式を何というか。', 1, '主記憶の外との退避と復帰を行う。'],
    ['OSが仮想記憶を固定長の区画に分け，主記憶の同じ大きさの枠へ対応付ける方式を何というか。', 3, '固定長の区画とページ枠を対応付ける。'],
  ]));

const linkingSummary = 'インタプリタは命令を解釈しながら実行する。オーバレイは同じ領域に必要な部分を順次読み込む。静的リンキングは実行前に結合し、動的リンキングは実行時に結合する。';
const linking = knowledge(20, '説明する翻訳・結合・配置の方式', '処理の説明から方式名を選ぶ。結合時点と、解釈実行や主記憶での配置の違いを維持。',
  '実行時に外部のモジュールの参照を解決する方式は動的リンキングである。' + linkingSummary,
  terms(linkingSummary, [
    ['プログラムを構成するモジュールの結合を，実行可能ファイルを作成する時点で行う方式はどれか。', 2, '実行前に必要なモジュールを組み込む。'],
    ['同時には使わないプログラム部分を，同じ主記憶領域に必要に応じて入れ替えて読み込む方式はどれか。', 1, '同じ領域を複数の部分で重ねて利用する。'],
    ['ソースプログラムの命令を解釈しながら実行し，あらかじめ実行可能な機械語プログラムへ一括変換しない方式はどれか。', 0, '命令を実行時に解釈する方式である。'],
  ]));

const ossSummary = 'OSS（Open Source Software）はオープンソースソフトウェア。Eclipseは統合開発環境、GCC（GNU Compiler Collection）はコンパイラ集、LinuxはOS（Operating System）のカーネル、Apache TomcatはServletコンテナである。';
const oss = knowledge(21, 'OSSが担う開発・実行上の役割', 'ソフトウェアの役割から実在するOSSの名称を選ぶ。製品コード・ロゴ・画面は使用しない。',
  '編集・ビルド・デバッグを開発者向けに統合して提供するEclipseを選ぶ。' + ossSummary,
  terms(ossSummary, [
    ['CやC++などのソースコードを翻訳するコンパイラ集として提供されているOSSはどれか。', 1, 'ソースコードを目的コードへ翻訳する開発ツールである。'],
    ['プロセスや記憶資源を管理するオペレーティングシステムのカーネルとして提供されているOSSはどれか。', 2, 'OSの中核の処理を担う。'],
    ['Java Servletを実行するコンテナとして提供されているOSSはどれか。', 3, 'WebアプリケーションのServletを実行する環境である。'],
  ]));

const componentSummary = 'NAND（Not AND）ゲートは否定論理積、加算器は数値を加算する組合せ回路、コンデンサは電荷を蓄える受動素子、フリップフロップは二つの安定状態をもつ順序回路である。';
const components = knowledge(23, '電子素子や回路の役割', '回路や素子の性質から名称を選ぶ。記憶、論理演算、数値加算、蓄電を比較する。',
  'フリップフロップは回路の内部状態によって0又は1を保持できる。' + componentSummary,
  terms(componentSummary, [
    ['二入力がいずれも1のときだけ出力が0になる組合せ回路はどれか。', 0, '論理積の結果を反転する。'],
    ['2進数の各桁の入力と桁上がりを扱い，数値の和を求める組合せ回路はどれか。', 1, '入力の数を加える機能をもつ回路である。'],
    ['端子間の電圧に応じて電荷を蓄える受動素子はどれか。', 2, '端子に印加した電圧に応じて電荷を保持する部品である。'],
  ]));

const formatsSummary = 'CMS（Content Management System）はコンテンツ管理システム、CSS（Cascading Style Sheets）は文書の見た目を指定するスタイルシート、PNG（Portable Network Graphics）は可逆圧縮できるラスター画像形式、SVG（Scalable Vector Graphics）はベクター図形を記述する形式である。';
const formats = knowledge(24, 'Web制作で必要な仕組みとデータ形式', '機能を説明して略称を選ぶ4択。スタイル・管理・画素・ベクターを判別する。',
  '色、フォント、配置などの表示規則はCSSで指定する。' + formatsSummary,
  terms(formatsSummary, [
    ['Webサイトの記事を編集し，公開状態や更新作業を管理する仕組みはどれか。', 0, '表示形式だけではなくコンテンツの管理を担う。'],
    ['Webページに使用する画像を，画素の情報を失わず圧縮できるラスター形式で保存する仕組みはどれか。', 2, '画素を記録し、元の画素情報に戻せる形式である。'],
    ['Webページに使用する図を，座標や曲線で表して拡大できるベクター形式で記述する仕組みはどれか。', 3, '点や線の位置・形状をベクターとして記述する。'],
  ]));

const relationshipSummary = 'E-R（Entity-Relationship）図は、対象の種類をエンティティタイプ、対象間の結び付きをリレーションシップとして表す。属性はエンティティタイプなどの性質を記録し、1対多などの多重度は結び付く件数を表す。記号は記法により異なる。';
const relationships = knowledge(26, 'E-R図で説明する要素と観点', 'E-R図の適切な説明を選ぶ向きを維持し、多重度・属性・リレーションシップの観点を切り替える。',
  relationshipSummary + ' 矢印の向きによる参照表記や、名前を別のエンティティに列挙する表記はE-R図一般の規則ではない。エンティティタイプも属性をもつ。', [
    {
      prompt: 'E-R図で示す属性の説明として，適切なものはどれか。', correctIndex: 2,
      choices: ['属性はエンティティタイプ間の多重度だけを表す。', 'エンティティタイプに属性を定義することはできない。', '顧客の名称などの性質を顧客エンティティタイプの属性として記述できる。', '属性の値はエンティティタイプ名と常に等しい。'],
      explanation: relationshipSummary + ' 顧客の名称は顧客個々の性質を表す属性である。',
    },
    {
      prompt: 'E-R図で示すリレーションシップの説明として，適切なものはどれか。', correctIndex: 1,
      choices: ['リレーションシップは個々の属性のデータ型だけを表す。', '顧客と注文のように，エンティティタイプ間の関連を表す。', 'リレーションシップを使うと全ての関連が1対1になる。', '相互に関係のない属性名を一つの名前にまとめる。'],
      explanation: relationshipSummary + ' 顧客と注文は別のエンティティタイプであり、注文をした顧客との関係を表現できる。',
    },
    {
      prompt: 'E-R図で示す多重度の説明として，適切なものはどれか。', correctIndex: 3,
      choices: ['データベースの索引の段数を表す。', '属性の文字列の最大長を表す。', 'ファイルに配置するバイト数を表す。', 'あるエンティティに関連し得る相手側のエンティティの数を表す。'],
      explanation: relationshipSummary + ' 多重度は関係の件数に関するものであり、格納するデータの長さや索引とは別である。',
    },
  ]);

export const knowledge2012AutumnAm0126 = [
  markup, disk, web, duplex, maintenance, scheduling, memory, linking, oss, components, formats, relationships,
];
