import facts from './legacy-2019-autumn-network-facts.json';
export const legacy2019AutumnNetworkReview=[
 {source:'2019r01a-fe-am-29',number:29,page:17,answer:'ウ',reference:[0],capacity:16,area:'technology',format:'2列8箱/6矢印/下向き時間軸と発行位置、S(W)とX/Y/Z専有注記、4候補×4処理。生成choiceごとの1行4列へ組版。',precision:'A列とデータ名固定。B各候補の実順序4bit、正答はA先/B先の2意味各8。'},
 {source:'2019r01a-fe-am-31',number:31,page:18,answer:'イ',reference:[0],capacity:2,area:'technology',format:'方式から適切なノード送信動作を選ぶ4説明。対象と競合機構をCD/CAへ同時変更。',precision:'計算なし。token一般へのflipは原二説明が正答になるので不採用。'},
 {source:'2019r01a-fe-am-32',number:32,page:18,answer:'イ',reference:[0],capacity:2,area:'technology',format:'4機器比較とL3だけの機能という問いを固定、4層/機構説明。',precision:'routingの固定正答。誤択のL2宛先転送/送信元学習は別機構で共にL2/L3がもつ。'},
 {source:'2019r01a-fe-am-33',number:33,page:19,answer:'イ',reference:[0],capacity:4,area:'technology',format:'1WAN公開IP/複数PCの宅内図、全5結線/PC省略/宅内境界/光ファイバ/ONU/Internetと4機能名。',precision:'sharing/configuration/PPP-over-Ethernet/admissionという実要件4条件。'},
 {source:'2019r01a-fe-am-35',number:35,page:20,answer:'イ',reference:[0],capacity:2,area:'technology',format:'A FQDN固定、cache汚染場所A/Bと各社員の自社resolver前提。4サイト×利用者の対応。',precision:'新しい図は解答前に追加しない。内部resolverモデルで全4経路を確認。'},
 {source:'2019r01a-fe-am-37',number:37,page:20,answer:'エ',reference:[0],capacity:4,area:'technology',format:'規格/技術名から説明を選ぶ4原領域。対象とmode/機構を対称bind。',precision:'TLS1.3/RFC8446、IPsec/RFC4301、X509v3/RFC5280、2018WPA3発表。暗号化必須/HTTP専用等の一般化なし。'},
 {source:'2019r01a-fe-am-38',number:38,page:21,answer:'ウ',reference:[0],capacity:2,area:'technology',format:'検証鍵と使用方法を固定。4 owner/type位置と2者を保ち、返送署名の検証対象は受領通知1通。元の役割を解答前に表示。',precision:'生成鍵へ変更しない。RSA-PSSはM/EMの整合性検証で、単純なdigest復元一般論へ拡張しない。'},
 {source:'2019r01a-fe-am-39',number:39,page:21,answer:'ア',reference:[0],capacity:4,area:'technology',format:'security対象から該当例を選ぶ4説明。対象とURL/port/監視方向/memory領域の実例を同時bind。',precision:'一般公開URL≠backdoor、scanner/monitorの正当用途、全overflowの停止保証でない限定。'},
] as const;
export const legacy2019AutumnNetworkSource={checkedOn:facts.checkedOn,collection:'2019r01a-fe-am',questionSha256:facts.questionPaper.sha256,answerSha256:facts.answerPaper.sha256,status:'prepared_annual_candidates_shared_registration_pending',rights:'8単独cropの原本文/全注記/四択/2図・1表を個別目視した。引用/第三者由来部分を特定しなかったという限定の確認で、出典の不在だけから第三者文言の許諾を推定しない。IPA FAQの教育利用条件、原出典/改変主体・内容の表示を伴うIPA部分の利用判断であり、RFC/Cisco/Wi-Fi Alliance/NISTの原文・図・コードは取り込まない。同じ冊子のJIS等保留へ拡張しない。',sourceOnlyManifest:facts.sourceDesignSha256,parentApproval:facts.parentApprovalSha256,sourceOnlyDesignLimits:facts.limits,limits:"8原/base/templateと36生成条件の年度準備を実装。共有profile/schema/Run/mix/用語統合は未完。sourceOnlyDesignLimitsは設計承認当時の記録である。"};
/** Reviewed polarity/scope sentences: removing a negation changes a fact. */
export const legacy2019AutumnNetworkExplanationLimits:Record<number,string[][]>={
29:[['ロック待ちになったトランザクションの後続処理が先に実行されるわけではない。','待機命令を飛ばして解放へ進むという扱いはできない。']],
31:[['全二重EthernetでCSMA/CDを用いるという意味ではない。'],['衝突を完全になくす保証ではなく、RTS/CTSの使用を全ての場合に必須とする説明でもない。']],
32:[['レイヤ3スイッチだけの機能ではない。']],
33:[['システム全体で複数の機能が併用されることはあるが、選ぶのは設問で指定した要件を実現する機能である。'],[],['全ての光回線でこの接続方式を必須と判断することはできず'],[]],
35:[['B社WebサーバのFQDNについては、サーバXへの対応が記憶されたという条件はない。','HTTPSの証明書検証まで突破して利用者認証が成功することを保証する説明ではない。']],
37:[['HTTPの暗号通信やIP層の保護、証明書の形式そのものとは区別する。'],['全ての通信が必ず暗号化されるという意味ではない。','AHは完全性や送信元の認証を提供し、暗号化の機能とは区別する。'],['証明書の形式そのものが通信データを暗号化するプロトコルという意味ではない。'],['HTTP専用ではない。']],
38:[['任意のRSA署名から単純にダイジェストそのものを取り出せるという一般的な手順を表すわけではない。']],
39:[['一般公開されていて認証が不要なURL全てを意味するものではない。','どのような長い入力でも必ずダウンするという一般化はしない。'],['UDPの応答がない場合に、開いていないと必ず断定できるという意味ではない。','どのような長い入力でも必ずダウンするという一般化はしない。'],['どのような長い入力でも必ずダウンするという一般化はしない。'],['どのような長い入力でも必ずダウンするという一般化はしない。']],
};
export function legacy2019AutumnNetworkLimits(n:number,v:number){const rows=legacy2019AutumnNetworkExplanationLimits[n];return rows.length===1?rows[0]:rows[v];}
