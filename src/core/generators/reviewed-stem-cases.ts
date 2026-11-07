import { p, type GenerationDefinition } from "./definition";
import { reviewedStructuredStemCases } from "./reviewed-stem-structured";
import { reviewed2019StemCases } from "./reviewed-stem-2019";
import { reviewed2016AutumnStemCases } from "./reviewed-stem-2016-autumn";
import { reviewed2018AutumnStemCases } from "./reviewed-stem-2018-autumn";
import { reviewed2018SpringStemCases } from "./reviewed-stem-2018-spring";
import { reviewed2017SpringStemCases } from "./reviewed-stem-2017-spring";
import { reviewed2016SpringStemCases } from "./reviewed-stem-2016-spring";
import { reviewed2017AutumnStemCases } from "./reviewed-stem-2017-autumn";

export type StemCase = readonly [
  sources: readonly string[],
  focus: string,
  stem: string,
  choices: readonly (string | readonly string[])[] | null,
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string,
  promptChanges?: Readonly<Record<number, string | readonly string[]>>,
  fixedAnswer?: true,
];

export const reviewedCurrentStemCases: readonly StemCase[] = [
  [["sample-2022-dec-a-9","2018h30a-fe-am-7"],"配列を走査するループの安全性",
    "添字が0から始まる配列の全要素を、先頭から順に1回ずつ処理する。添字に関してコーディング規則に規定する事項のうち、適切なものはどれか。",
    ["添字は0から始め、要素数と等しくなるまで、その値も含めて処理する。","添字は0から始め、要素数より小さい範囲で処理する。","添字は1から始め、要素数より小さい範囲で処理する。","添字は0から始め、要素数より2小さい位置まで処理する。"],1,
    "要素数がnなら有効な添字は0以上n未満である。nを含めると範囲外にアクセスし、1から始めると先頭、n−2で止めると末尾を処理できない。"],
  [["sample-2022-dec-a-18","2018h30h-fe-am-17"],"ルート起点とカレント起点",
    "ファイルシステムの相対パス名を説明したものはどれか。ここで、パス名はプロセスがファイルを開くときに指定する文字列とし、シェルによる展開は考えない。",
    ["対象ファイルへ至る幾つかのパス名のうち、最短のパス名","プロセスのカレントディレクトリから対象ファイルへ至るパス名","利用者のホームディレクトリを固定の起点とするパス名","ルートディレクトリから対象ファイルへ至るパス名"],1,
    "相対パス名はプロセスのカレントディレクトリを起点に解決される。絶対パス名はルートを起点とし、ホームは固定の起点ではない。最短かどうかは区別の条件ではない。"],
  [["sample-2022-dec-a-21"],"ビューを使った公開列の制限",
    "RDBMSで、商品表のうち商品名と価格だけを照会担当者に公開したい。このときのビューに関する記述のうち、適切なものはどれか。",
    ["商品表から必要な二列を選ぶビューを作り、担当者にはそのビューの参照権限を与える。","担当者がビューを参照するには、商品表の全列を直接参照できる権限が必ず必要になる。","商品表にビューを定義すると、ビューで選ばなかった列が商品表から削除される。","同じ商品表に別のビューがある場合は、先にそのビューを削除する必要がある。"],0,
    "ビューは問合せで得られる名前付きの表である。権限設定で基底表への直接参照を認めず、必要な列だけを公開できる。ビューの作成で基底表の列が消えることはなく、一つの表に複数のビューを定義できる。RDBMSはRelational Database Management System（関係データベース管理システム）の略である。"],
  [["sample-2022-dec-a-23"],"格納後のデータの検索と解釈",
    "センサー記録と画像を蓄積したデータレイクを、複数の分析担当者が利用する。必要なデータを探して解釈できるようにする運用として、適切なものはどれか。",
    ["元のデータを保持しながら、取得元や形式、取得時刻などのメタデータを管理する。","全ての画像をセンサー記録と同じ数値列に変換し、元の画像は削除する。","取得元や形式の情報を省き、ファイル名の長さだけで利用目的を判断する。","分析目的を一つに固定し、別の分析で使える元データは蓄積しない。"],0,
    "多様な原データを保持したまま、取得元・形式・時刻などを検索や理解の手掛かりにできる。特定の表や分析目的に一律に変換する必要はない。"],
  [["sample-2022-dec-a-32","2019h31h-fe-am-38","2016h28a-fe-am-38"],"改ざん検知と機密性",
    "通信するメッセージを、認証機能をもたない共通鍵暗号で暗号化する。その利用目的に該当するものはどれか。",
    ["メッセージに改ざんがないことを、認証値の照合によって検証する。","暗号文を見て、使用された暗号方式を自動判定する。","メッセージを短い自然言語の要約に変換する。","通信を傍受した第三者が、メッセージの内容を理解できないようにする。"],3,
    "この暗号化の目的はメッセージの機密性である。認証機能がなければ改ざんの検証は提供しない。メッセージ認証符号は改ざん検知や送信元認証に使う。暗号化には方式推定や文章要約の機能はない。"],
  [["sample-2022-dec-a-33"],"復電までの時間と安全な終了",
    "サーバを運転している施設で長時間停電が発生し、非常用発電機は使えない。サーバ用UPSの導入によって期待できる効果はどれか。",
    ["UPSの蓄電池を使い切った後も、サーバを停電前と同じ状態で運転し続けられる。","商用電源が復旧するまで、停電前に発生したソフトウェア障害を自動で修正できる。","蓄電池が電力を供給できる間に、処理中のデータを保存してサーバを正常終了する時間を確保できる。","停電で破損済みのデータを、バックアップを使わずに復元できる。"],2,
    "UPSはUninterruptible Power Supply（無停電電源装置）の略である。蓄電池による給電が続く間に正常終了できる。蓄電池には持続時間の限界があり、ソフトウェアの修正やデータ復旧は別の機能である。"],
  [["sample-2022-dec-a-34"],"ファジングとポートスキャン",
    "ポートスキャンに該当するものはどれか。",
    ["サーバの複数のポートへ接続を試み、応答を調べて待受け中のサービスを列挙する。","OSの監査記録と操作履歴を照合し、ファイルの変更経緯を調べる。","プロトコル入力の長さや構造を変えて実装へ与え、異常終了を調べる。","通過する通信を監視し、既知の攻撃パターンに一致する通信を検出する。"],0,
    "ポートスキャンはポートごとの応答を調べ、稼働しているサービスを把握する。操作記録の分析、異常入力によるファジング、既知の攻撃パターンの照合とは処理が異なる。OSはOperating System（オペレーティングシステム）の略である。"],
  [["sample-2022-dec-a-39","2017h29a-fe-am-48","2019r01a-fe-am-46","2016h28h-fe-am-47"],"必要な項目と共有・制御依存",
    "照会モジュールは、呼出し側が管理する顧客情報のうち、顧客番号と取引日だけを使う。モジュール間の情報の受渡し方法のうち、結合度が最も弱くなるものはどれか。",
    ["照会に使わない氏名や住所も含め、顧客情報レコード全体を渡す。","顧客番号と取引日だけを独立したデータ引数として渡す。","両モジュールで同じ大域変数を参照し、顧客番号と取引日を共有する。","顧客番号と取引日に加え、照会モジュール内部の処理分岐を決める制御引数も渡す。"],1,
    "必要なデータ項目だけを引数とするデータ結合が最も弱い。レコード全体を渡すとその構造に依存し、大域変数を使うと共通領域に、制御引数を渡すと相手の処理分岐にも依存する。"],
  [["sample-2022-dec-a-41"],"スプリント中に判明した追加作業",
    "アジャイル開発のスクラムで、スプリント中に見積り時には分からなかった作業が判明した。スプリント中のルールとして、適切なものはどれか。",
    ["計画時に作成したスプリントバックログは、作業が判明した後も一切更新しない。","追加作業が発生した分だけ、進行中のスプリントを延長する。","スプリントゴールを危険にさらさない範囲で、必要に応じてプロダクトオーナーと作業範囲を明確にし、再交渉する。","追加作業の時間を確保するため、完了の定義を一時的に緩めて品質を下げる。"],2,
    "スプリント中に判明したことに応じて、ゴールを危うくしない範囲で作業範囲を明確にし、再交渉できる。期間を延長したり、品質を下げたりはしない。"],
  [["sample-2022-dec-a-42"],"成果物への影響と変更コストの時期",
    "プロジェクトの開始直後と完了直前を比較する。ステークホルダが成果物へ及ぼせる影響と、変更や誤りの修正に要するコストの一般的な傾向の組合せとして、適切なものはどれか。",
    ["成果物への影響は開始直後が大きく、修正コストは完了直前が大きい。","成果物への影響も修正コストも、開始直後の方が大きい。","成果物への影響も修正コストも、完了直前の方が大きい。","成果物への影響は完了直前が大きく、修正コストは開始直後が大きい。"],0,
    "成果物を形作る決定が少ない初期は、ステークホルダの影響を反映しやすい。後期になると変更の影響が既に作った成果物へ及び、修正コストは一般に高くなる。"],
  [["sample-2022-dec-a-47","2019h31h-fe-am-59"],"組織上の独立性と専門能力の維持",
    "経営者が、社内のシステム監査人に必要な監査技法の習得と継続的な向上を支援するために講じる措置として、最も適切なものはどれか。",
    ["監査対象部署から独立した内部監査部門に監査人を所属させる。","監査結果を、監査対象部署を経由せずに経営者へ報告できるようにする。","監査人が実務に対応した研修や継続学習を受け、習得した能力を確認する仕組みを設ける。","監査人が自ら運用を担当するシステムの監査を引き受けないようにする。"],2,
    "研修・継続学習と能力確認が、監査技法の維持と向上に直接対応する。所属の分離、報告経路の確保、自分の業務の監査回避は独立性を支える。"],
  [["sample-2022-dec-a-53"],"試作結果が事業仮説に反した場合",
    "新しい事業の試作を顧客に試してもらったところ、利用行動が当初の仮説と異なっていた。E.リースが提唱したリーンスタートアップでの進め方として、適切なものはどれか。",
    ["仮説を検証し直す前に、補助金を前提とした計画だけを確定する。","測定結果を基に仮説を見直し、修正又は方向転換のための次の小さな実験を行う。","先に大規模投資で生産量を増やし、利用行動の測定を打ち切る。","試作結果にかかわらず、当初の詳細計画を変えずに製品化する。"],1,
    "構築・計測・学習の循環では、実際の結果から仮説を評価し、改善や方向転換を試す。補助金や大規模投資は必須条件ではなく、計画を固定すると学習を次の試行に反映できない。"],
  [["sample-2022-dec-a-56","2019h31h-fe-am-72"],"消費者発信と投資家向け情報発信",
    "IR（Investor Relations）を目的としたWebサイトの例はどれか。",
    ["企業が投資家に経営状況や財務状況を公開する自社のWebサイト","企業が一般消費者に自社商品の特徴や使用方法を発信する自社のWebサイト","行政機関が市民に政策や行政サービスを公開する自組織のWebサイト","個人が使用した商品の評価を、不特定多数へ発信するブログやSNS"],0,
    "IRは、企業が株主や投資家に経営や財務に関する情報を伝える活動である。商品の販促、行政広報、消費者自身が発信するCGM（Consumer Generated Media）と区別する。SNSはSocial Networking Service（交流サービス）の略である。"],
  [["2024-a-8","2018h30a-fe-am-32"],"接続の目的とデータリンク層",
    "二つのイーサネット区間をつなぎ、宛先MACアドレスに基づいてフレームを転送する。LAN間接続装置の機能に関する記述のうち、この用途に適切なものはどれか。",
    ["リピータは、物理層の信号を再生して中継する。","ブリッジは、受信フレームの宛先を見てデータリンク層で転送先を選ぶ。","ルータは、IPアドレスに基づいて異なるネットワーク間でパケットを中継する。","ゲートウェイは、異なる上位プロトコル間の変換を行う。"],1,
    "データリンク層で宛先MACアドレス（Media Access Controlアドレス）を見てフレームを中継する用途にはブリッジを用いる。リピータは信号、ルータはネットワーク層のパケット、ここでのゲートウェイは上位プロトコル変換を扱う。LANはLocal Area Network（構内ネットワーク）、IPはInternet Protocol（インターネットプロトコル）の略である。"],
  [["2025-a-8"],"相互TLSのクライアント認証",
    "同じWebアプリケーションでHTTPとHTTPSを比較する。HTTPS側ではサーバがTLS接続時にクライアント証明書を要求する。この構成でHTTPSだけがもつ特徴を示したものはどれか。ここで、HTTPはTLSを使わない通信、HTTPSはTLSを用いる通信とする。",
    ["クライアントの接続相手を、アプリケーションのURLの文字列だけで認証する。","クライアントが提示する証明書をTLSの接続確立時に検証する。","Webフォームに入力された利用者名とパスワードをサーバ側で照合する。","応答にキャッシュ制御用のヘッダを付け、保存済みの内容を再利用させる。"],1,
    "このHTTPS構成ではTLS接続を確立するときにサーバがクライアント証明書を検証する。フォーム認証とキャッシュ制御はHTTPとHTTPSの両方で利用でき、URLの文字列だけで通信相手を認証することはできない。HTTPはHypertext Transfer Protocol、HTTPSはHTTP Secure、TLSはTransport Layer Security、URLはUniform Resource Locatorの略である。"],
  [["2026-a-9"],"知識と所持の組合せ",
    "知識・所持・生体のうち、知識と所持を組み合わせた2要素認証に該当する組はどれか。",
    ["パスワード認証、指紋認証","スマートカードによる認証、ハードウェアトークンによる認証","顔認証、スマートカードによる認証","パスワード認証、ハードウェアトークンによる認証"],3,
    "パスワードは知識、カードとトークンは所持、指紋と顔は生体の要素である。知識と所持を一つずつ含むのはパスワードとトークンの組である。"],
  [["2026-a-18"],"設備異常の検知で学習結果を使うか",
    "設備の異常を早期に検知したい。本問では、データからモデルや方策を学習し、その結果を判断へ利用するものを学習型AIとする。この設備の異常検知に学習型AIを用いる事例として、適切でないものはどれか。",
    ["正常時の振動の特徴を運転データから学習し、その特徴から外れた波形を検出する。","技術者が固定した振動のしきい値を用い、計測値がしきい値を超えたときだけ警報を出す。","故障例の音を学習した分類モデルで、運転音に故障の兆候があるかを判定する。","正常時の温度変化を学習した予測モデルを使い、観測値と予測値の差が大きい場合に警報を出す。"],1,
    "固定したしきい値だけで判定する例は、データから学習したモデルや方策を使わない。他の例は学習した正常時の特徴、故障時の分類、温度変化の予測を判断に使う。AIはArtificial Intelligence（人工知能）の略である。"],
];

export const reviewedStemCases = [...reviewedCurrentStemCases, ...reviewed2017AutumnStemCases, ...reviewed2017SpringStemCases, ...reviewed2016SpringStemCases, ...reviewed2018SpringStemCases, ...reviewed2018AutumnStemCases, ...reviewed2019StemCases, ...reviewed2016AutumnStemCases, ...reviewedStructuredStemCases];
const bySource = new Map(reviewedStemCases.flatMap(entry => entry[0].map(source => [source, entry] as const)));

export function addReviewedStemCase(definition: GenerationDefinition): GenerationDefinition {
  const entry = bySource.get(definition.source);
  if (!entry) return definition;
  const [, focus, stem, choices, correctIndex, explanation, promptChanges, fixedAnswer] = entry;
  const [first, ...rest] = definition.fields;
  const selector = first.maximum + 1;
  const { answerVariation: _previousPolicy, ...metadata } = definition;
  return {
    ...metadata,
    version: "3.7.0",
    ...(fixedAnswer ? { answerVariation: "fixed" as const } : {}),
    fields: [{ ...first, maximum: selector }, ...rest],
    notes: `${definition.notes} 原形式で本文の対象・条件を切り替える。追加条件は「${focus}」。`,
    build(values) {
      if (values[0] < selector) return definition.build(values);
      if (values[0] !== selector || values.length !== definition.reference.length ||
          rest.some((_, i) => values[i + 1] !== definition.reference[i + 1])) throw Error("PARAMETER_CONSTRAINT");
      const reference = definition.build(definition.reference);
      const prompt = reference.prompt.map((block, index) => {
        const replacement = index === 0 ? stem : promptChanges?.[index];
        if (replacement === undefined) return block;
        if ((block.type === "paragraph" || block.type === "code") && typeof replacement === "string") return { ...block, text: replacement };
        if (block.type === "list" && typeof replacement !== "string") return { ...block, items: [...replacement] };
        throw Error(`Incompatible stem case: ${definition.source}, block ${index}`);
      });
      const alternatives = choices?.map((choice, index) => {
        const blocks = reference.choices[index];
        if (blocks?.length === 1 && blocks[0].type === "paragraph" && typeof choice === "string") return [p(choice)];
        if (blocks?.length === 1 && blocks[0].type === "table" && typeof choice !== "string" &&
            blocks[0].columns.length === choice.length && blocks[0].rows.length === 1) return [{ ...blocks[0], rows: [[...choice]] }];
        throw Error(`Incompatible stem case: ${definition.source}, choice ${index}`);
      }) ?? reference.choices;
      return { ...reference, prompt, choices: alternatives, correctIndex, explanation };
    },
  };
}
