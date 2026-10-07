import {
  field,
  p,
  strings,
  variableNotes,
  type GenerationDefinition,
} from "./definition";

type Form = {
  prompt: string;
  answers?: "term" | "purpose" | "statements" | "audit" | "comparison";
  prefix?: string[];
  context?: string[];
};
// Each scaffold is reviewed against the original question. Only its subject or
// condition is bound; asking in reverse or changing polarity is not a variant.
export const knowledgeForms: Record<string, Form> = {
  "2023-a-3": {
    prompt:
      "コンピュータの処理を高速化する技術の一つである{term}に関する記述として、適切なものはどれか。",
  },
  "2023-a-4": { prompt: "{term}の説明として、最も適切なものはどれか。" },
  "2023-a-5": {
    prompt: "3次元グラフィックス処理における{term}の説明はどれか。",
  },
  "2023-a-7": {
    prompt:
      "データベースのトランザクション処理において、{meaning}ことを保証する特性はどれか。",
    answers: "term",
  },
  "2023-a-8": {
    prompt: "IPv4ネットワークにおいて、{meaning}ものはどれか。",
    answers: "term",
  },
  "2023-a-9": { prompt: "{term}に該当するものはどれか。" },
  "2023-a-12": {
    prompt: "スクラムにおいて、{meaning}イベントはどれか。",
    prefix: [
      "開発チームは毎日決まった時間と場所で、前回からの進捗、これからの作業、作業を妨げる問題を共有する。",
      "",
      "",
      "",
    ],
    answers: "term",
  },
  "2023-a-14": {
    prompt:
      "A社は、自宅のPCから自社のネットワークへ接続するテレワークを計画している。運用規程を情報セキュリティ管理基準（平成28年）に照らして監査した。判明した事項のうち、監査人が指摘事項として監査報告書に記載すべきものはどれか。",
    answers: "audit",
  },
  "2023-a-15": { prompt: "{term}の説明はどれか。" },
  "2023-a-16": { prompt: "{term}の説明はどれか。" },
  "2023-a-17": { prompt: "{term}を説明したものはどれか。" },
  "2023-a-18": {
    prompt:
      "イノベータ理論では、新製品を受け入れる時期によって消費者をイノベータ、アーリーアダプタ、アーリーマジョリティ、レイトマジョリティ、ラガードの五つに分類する。この分類における{term}の説明として、適切なものはどれか。",
  },
  "2023-a-19": { prompt: "{term}の説明はどれか。" },
  "2023-a-20": {
    prompt: "ソフトウェアの利用契約における{term}の説明はどれか。",
  },
  "2024-a-5": {
    prompt: "{context}{term}の例はどれか。",
    context: [
      "複数のWebサービスを組み合わせる",
      "複数のWebサービスを組み合わせる",
      "複数のWebサービスを組み合わせる",
      "Webページにおける",
    ],
    prefix: [
      "ロジックマッシュアップは、複数のWebサービスの入出力処理を連結して新たなサービスを提供する。",
      "",
      "",
      "",
    ],
  },
  "2024-a-6": {
    prompt: "画像の表示において、{meaning}手法はどれか。",
    answers: "term",
  },
  "2024-a-7": { prompt: "DBMSに実装すべき{term}を説明したものはどれか。" },
  "2024-a-8": {
    prompt: "LAN間接続装置に関する記述のうち、適切なものはどれか。",
    answers: "statements",
  },
  "2024-a-9": { prompt: "{term}に該当するものはどれか。" },
  "2024-a-10": { prompt: "{term}ための対策として、有効なものはどれか。" },
  "2024-a-11": {
    prompt:
      "階層構造のモジュール群から成るソフトウェアの結合テストにおいて、{meaning}テスト用のモジュールはどれか。",
    answers: "term",
  },
  "2024-a-12": {
    prompt:
      "スクラムで定義され、スプリントで実施するイベントのうち、{meaning}ものはどれか。",
    answers: "term",
    prefix: [
      "開発チームの全員が毎日決まった時間と場所で、前回からの進捗と今後の作業計画を共有する。",
      "",
      "",
      "",
    ],
  },
  "2024-a-14": {
    prompt:
      "システムの開発部門と運用部門が別々に組織化されている。新規サービスの設計及び移行で、{term}ための方法として、適切なものはどれか。",
  },
  "2024-a-15": {
    prompt:
      "ビッグデータ分析の前段階として、{term}の処理を記述している事例はどれか。",
  },
  "2024-a-16": { prompt: "{term}を説明したものはどれか。" },
  "2024-a-17": {
    prompt:
      "マーケティング戦略における{term}の説明として、適切なものはどれか。",
  },
  "2024-a-18": { prompt: "{term}の説明はどれか。" },
  "2025-a-1": {
    prompt:
      "大規模言語モデルを用いた自然言語処理において、{context}{term}に関する記述として、最も適切なものはどれか。",
    context: [
      "事前学習済みのモデルに対して行う",
      "モデルの基礎となる表現や規則を学ぶ段階で行う",
      "事前学習済みのモデルに対して行う",
      "モデルの利用時に行う",
    ],
  },
  "2025-a-2": {
    prompt: "浮動小数点形式で表現した数値の演算における{term}の説明はどれか。",
  },
  "2025-a-5": {
    prompt: "{term}を用いた{context}の説明はどれか。",
    context: [
      "ソフトウェア開発",
      "ソフトウェア開発",
      "ソフトウェア開発",
      "業務の自動化",
    ],
  },
  "2025-a-8": {
    prompt:
      "HTTPとHTTPSを比較した場合において、HTTPSだけがもつ特徴を示したものはどれか。ここではHTTPはTLSを使わない通信、HTTPSはTLSを用いる通信とする。",
    answers: "comparison",
  },
  "2025-a-9": { prompt: "{term}に該当するものはどれか。" },
  "2025-a-10": { prompt: "{term}の説明はどれか。" },
  "2025-a-11": { prompt: "E-Rモデルにおける{term}の特徴はどれか。" },
  "2025-a-12": {
    prompt:
      "オブジェクト指向プログラミングにおいて、{meaning}ことを何と呼ぶか。",
    answers: "term",
  },
  "2025-a-13": {
    prompt: "スクラムにおいて、{meaning}役割をもつのは誰か。",
    answers: "term",
  },
  "2025-a-15": {
    prompt:
      "サーバ室の物理的な安全対策を情報セキュリティ管理基準（平成28年）に照らして監査した。判明した状況のうち、監査人が指摘事項として監査報告書に記載すべきものはどれか。",
    answers: "audit",
  },
  "2025-a-16": {
    prompt: "マーケティングにおいて、{meaning}分析手法はどれか。",
    answers: "term",
  },
  "2025-a-17": {
    prompt:
      "インターネット上の生成AIサービスで、{meaning}。この対応が有効な目的はどれか。",
    answers: "purpose",
  },
  "2025-a-18": {
    prompt:
      "物販事業において、「{term}」という目的を実現するために必要な施策はどれか。",
  },
  "2025-a-20": { prompt: "{term}の説明として、適切なものはどれか。" },
  "2026-a-2": { prompt: "{term}の処理方法を説明したものはどれか。" },
  "2026-a-3": {
    prompt: "計算装置の一つである{term}の特徴として、適切なものはどれか。",
  },
  "2026-a-4": {
    prompt: "{context}サービスの提供形態としての{term}の説明はどれか。",
    context: ["クラウド", "クラウド", "クラウド", "データセンタ"],
  },
  "2026-a-5": {
    prompt:
      "主記憶又は仮想記憶の管理において、{meaning}。このような処理又は現象を何というか。",
    answers: "term",
    prefix: [
      "仮想記憶方式のコンピュータシステムで処理の多重度を増やしたところ、システムの応答速度が急激に遅くなった。",
      "",
      "",
      "",
    ],
  },
  "2026-a-8": {
    prompt: "無線通信において、次の用途に適したものはどれか。{meaning}。",
    prefix: [
      "無線LANでは、複数の端末から送信した同じ周波数の電波が衝突すると、干渉によって信号を復調できないことがある。",
      "",
      "",
      "",
    ],
    answers: "term",
  },
  "2026-a-10": {
    prompt:
      "情報セキュリティに関する専門組織のうち、{term}の説明として、最も適切なものはどれか。",
  },
  "2026-a-11": {
    prompt:
      "あるシステム開発で、{term}必要がある。このための対策として、最も適切なものはどれか。",
  },
  "2026-a-12": { prompt: "{term}の使い方として、適切なものはどれか。" },
  "2026-a-13": {
    prompt:
      "システム開発プロジェクトの管理又は人材支援で、{meaning}。このとき適用した手法を何と呼ぶか。",
    answers: "term",
    prefix: [
      "あるシステム開発プロジェクトの進捗が遅延したので、クリティカルパス上の作業への投入工数を増やして遅延の解消を図った。",
      "",
      "",
      "",
    ],
  },
  "2026-a-15": {
    prompt:
      "内部監査部門が情報システム部門へのシステム監査を経営者から指示された。{term}ための行為として、適切なものはどれか。",
  },
  "2026-a-16": {
    prompt: "小売事業者が、{term}を実現するためのIT活用事例はどれか。",
  },
  "2026-a-19": { prompt: "{term}の説明はどれか。" },
};

export const httpSharedFeatures = [
  "cookieの情報とサーバ側の状態を対応させてセッションを管理する",
  "入力されたIDとパスワードを照合して利用者を認証する",
  "Webブラウザで取得済みの資源を再利用して通信量を減らす",
];

export const auditFailures: Record<string, string[]> = {
  "2023-a-14": [
    "業務端末のマルウェア対策の導入・更新を利用者の判断だけに任せ、組織では管理しない",
    "業務端末を、業務に認められた本人以外の家族にも使用させる",
    "端末の登録や許可を確認せず、どの端末からも業務ネットワークへの接続を認める",
    "運用規程や利用条件を利用者へ説明せずにテレワークを開始させる",
  ],
  "2025-a-15": [
    "外部からのドアを施錠せず、許可を確認せずにサーバ室へ入室させる",
    "無人領域の警報装置を停止したままにし、侵入を検知できない",
    "非常口や避難器具の前に物品を置き、非常時に利用できない",
    "施設の機密区画の位置や用途を、不特定の人へ必要なく公開する",
  ],
};

export function knowledgeDefinition(
  source: string,
  title: string,
  sourceAnswer: string,
  bank: [string, string][],
): GenerationDefinition {
  const form = knowledgeForms[source];
  if (!form) throw Error(`Missing source question form: ${source}`);
  return {
    source,
    title,
    sourceAnswer,
    reference: [0, 0],
    version: "3.2.0",
    fields: [
      field("問う対象・判定する条件", 0, bank.length - 1),
      field("選択肢の配置", 0, 2),
    ],
    notes:
      variableNotes +
      " 知識問題の問いの方向・判定条件は原問題で固定し、登録した対象・状況を変更する。",
    build: ([target, rotation]) => {
      const [term, meaning] = bank[target];
      const prompt =
        (form.prefix?.[target] ?? "") +
        form.prompt
          .replaceAll("{context}", form.context?.[target] ?? "")
          .replaceAll("{term}", term)
          .replaceAll("{meaning}", meaning);
      const options =
        form.answers === "comparison"
          ? [meaning, ...httpSharedFeatures]
          : bank.map(([name, description], i) => {
              if (form.answers === "term" || form.answers === "purpose")
                return name;
              if (form.answers === "audit")
                return i === target ? auditFailures[source][i] : description;
              if (form.answers === "statements")
                return `${name}は、${bank[i === target ? i : (i + 1) % bank.length][1]}。`;
              return description;
            });
      const rotated = [
        ...options.slice(rotation),
        ...options.slice(0, rotation),
      ];
      const explanation =
        form.answers === "comparison"
          ? `${term}は、${meaning}。これはTLSを使うHTTPSの特徴である。他の三つはTLSを使わないHTTPでも利用でき、HTTPSだけの特徴には該当しない。`
          : form.answers === "audit"
            ? `「${auditFailures[source][target]}」が指摘事項である。${term}ためには、${meaning}必要がある。他の状況はそれぞれの安全対策を実施している。`
            : `${term}は、${meaning}。${bank
                .filter((_, i) => i !== target)
                .map(([name, description]) => `${name}は${description}`)
                .join("。")}。`;
      return {
        prompt: [p(prompt)],
        choices: strings(rotated),
        correctIndex:
          ((form.answers === "comparison" ? 0 : target) -
            rotation +
            bank.length) %
          bank.length,
        explanation,
      };
    },
  };
}
