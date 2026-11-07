import cohort from "./reviewed-stem-cohort.json";

// Source-role review for the new current/sample cases. Notes are tested in
// rendered question content, without choices, explanations or diagram alt.
const forms: Record<string, { intent: RegExp; notes: string[] }> = {
  "2023-a-14": { intent: /監査.*指摘事項として報告すべき/, notes: ["自宅のPC.*テレワーク", "許可した端末", "情報セキュリティ管理基準（平成28年）"] },
  "2024-a-8": { intent: /LAN間接続装置の機能.*適切/, notes: ["宛先MACアドレス", "イーサネット"] },
  "2025-a-15": { intent: /監査.*指摘事項として報告すべき/, notes: ["夜間に無人になるサーバ室", "警報装置", "情報セキュリティ管理基準（平成28年）"] },
  "2025-a-8": { intent: /HTTPとHTTPSを比較.*HTTPSだけがもつ特徴/, notes: ["クライアント証明書を要求", "HTTPはTLSを使わない", "HTTPSはTLSを用いる"] },
  "2026-a-18": { intent: /学習型AIを用いる事例として、適切でない/, notes: ["データからモデルや方策を学習", "設備の異常"] },
  "2026-a-9": { intent: /2要素認証に該当する組/, notes: ["知識と所持を組み合わせた"] },
  "sample-2022-dec-a-9": { intent: /コーディング規則に規定する事項.*適切/, notes: ["添字が0から", "全要素", "先頭から順に1回ずつ"] },
  "sample-2022-dec-a-18": { intent: /相対パス名を説明したもの/, notes: ["プロセスがファイルを開く", "シェルによる展開は考えない"] },
  "sample-2022-dec-a-21": { intent: /ビューに関する記述.*適切/, notes: ["商品名と価格だけ", "照会担当者"] },
  "sample-2022-dec-a-23": { intent: /データを探して解釈できるようにする運用.*適切/, notes: ["センサー記録と画像", "データレイク", "複数の分析担当者"] },
  "sample-2022-dec-a-32": { intent: /共通鍵暗号で暗号化.*利用目的/, notes: ["認証機能をもたない", "メッセージ"] },
  "sample-2022-dec-a-33": { intent: /UPSの導入によって期待できる効果/, notes: ["長時間停電", "非常用発電機は使えない"] },
  "sample-2022-dec-a-34": { intent: /ポートスキャンに該当/, notes: ["ポートスキャン"] },
  "sample-2022-dec-a-39": { intent: /モジュール間の情報の受渡し方法.*結合度が最も弱く/, notes: ["顧客番号と取引日だけ", "呼出し側が管理"] },
  "sample-2022-dec-a-41": { intent: /スプリント中のルールとして、適切/, notes: ["スクラム", "見積り時には分からなかった作業"] },
  "sample-2022-dec-a-42": { intent: /影響と.*修正に要するコスト.*組合せ.*適切/, notes: ["開始直後と完了直前", "ステークホルダ", "一般的な傾向"] },
  "sample-2022-dec-a-47": { intent: /監査技法の習得と継続的な向上.*措置として.*適切/, notes: ["経営者", "社内のシステム監査人", "監査技法"] },
  "sample-2022-dec-a-53": { intent: /リーンスタートアップでの進め方.*適切/, notes: ["試作を顧客に", "利用行動が当初の仮説と異なって", "E.リース"] },
  "sample-2022-dec-a-56": { intent: /IR.*Webサイトの例はどれか/, notes: ["Investor Relations"] },
};

export function reviewedStemForm(source: string, values: readonly number[] = []) {
  const row = cohort.rows.find(row => row.source === source && row.outcome === "revised" && row.selector === values[0]);
  return row ? forms[source] : undefined;
}
