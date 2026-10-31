/** 原画像と業務/法の固定査読資料。生成器の配列・正答を参照しない。 */
export const businessMediaTargets=['CGM（Consumer Generated Media）','ネットオークション','オンラインショッピングモール','メールマガジン配信'];
export const businessMediaRoles=['individual-auction-intermediary','consumer-content-sharing','shops-common-settlement','opt-in-periodic-email'];
export const businessMediaRequired=['consumer-content-sharing','individual-auction-intermediary','shops-common-settlement','opt-in-periodic-email'];
export const businessAffiliateTargets=[5,1,2,4];
export const businessAffiliateActions=['click-advertisement','join-program','buy-product','pay-sales-commission'];
export const businessAffiliateRoutes=[['operator','advertiser','join-program'],['viewer','advertisement','click-advertisement'],['advertisement','sales-page','follow-link'],['viewer','sales-page','buy-product'],['advertiser','operator','pay-sales-commission']];
export const businessFacilitation=[
 [
  ['技術面や法律面など、自らが専門とする特定の領域の議論に対してだけ、助言を行う。','specialist-only'],
  ['議長となり、経営層の意向に合致した結論を導き出すように議論をコントロールする。','direct-conclusion'],
  ['中立公平な立場から、会議の参加者に発言を促したり、議論の流れを整理したりする。','neutral-discussion'],
  ['日程調整・資料準備・議事録作成など、会議運営の事務的作業に特化した支援を行う。','clerical-only'],
 ],[
  ['自らの専門分野に関する質問に回答し、その分野の技術的判断について助言を行う。','specialist-only'],
  ['議長の権限で採決を行い、会議で決定する事項を最終的に承認する。','decision-authority'],
  ['中立公平な立場から、会議の参加者に発言を促したり、議論の流れを整理したりする。','neutral-discussion'],
  ['出席者への案内、会場の手配、資料の配布と議事録の清書を担当する。','clerical-only'],
 ],[
  ['技術的な検討事項について専門知識に基づく意見だけを提示する。','specialist-only'],
  ['意思決定者として、あらかじめ定めた事業採算の基準で、会議で示された案の採否を決める。','decision-authority'],
  ['中立公平な立場から、会議の参加者に発言を促したり、議論の流れを整理したりする。','neutral-discussion'],
  ['会議日時と会場を調整し、配布資料や会議後の記録を整える。','clerical-only'],
 ],
];
export const businessAnalysisTargets=['PDPC','親和図法','連関図法','系統図法'];
export const businessAnalysisRoles=['future-response-process','group-associated-information','causal-relations','expand-means-for-goal'];
export const businessCashflows=[
 [ ['株式の発行による収入','financing','in'],['商品の仕入による支出','operating','out'],['短期借入金の返済による支出','financing','out'],['有形固定資産の売却による収入','investing','in'] ],
 [ ['社債の発行による収入','financing','in'],['商品の販売による収入','operating','in'],['長期借入金の返済による支出','financing','out'],['営業用建物の購入による支出','investing','out'] ],
 [ ['自己株式の取得による支出','financing','out'],['営業部門の従業員に対する給与の支払による支出','operating','out'],['社債の償還による支出','financing','out'],['土地の売却による収入','investing','in'] ],
];
export const businessCopyright=[
 [
  ['アプリケーションプログラムは著作権法によって保護されるが、OSなどの基本プログラムは権利の対価がハードウェアの料金に含まれるので、保護されない。','payment-excludes-os',false],
  ['アルゴリズムやプログラム言語は、著作権法によって保護される。','ideas-language-protected',false],
  ['アルゴリズムを記述した文書は著作権法で保護されるが、そのアルゴリズムを用いて作成されたプログラムは保護されない。','document-excludes-implementation',false],
  ['ソースプログラムとオブジェクトプログラムの両方とも著作権法によって保護される。','source-object-expression',true],
 ],[
  ['自作のアプリケーションプログラムは保護されるが、無償で公開したプログラムは著作権が発生しないので、保護されない。','gratis-excludes-copyright',false],
  ['プログラム言語や、その言語の用法についての特別の約束である規約は、著作権法によって保護される。','language-rules-protected',false],
  ['アルゴリズムの説明文は保護されるが、その説明に従って作成されたプログラムは表現ではないので、保護されない。','implementation-not-expression',false],
  ['ソースプログラムとオブジェクトプログラムの両方とも著作権法によって保護される。','source-object-expression',true],
 ],[
  ['著作権登録を済ませたプログラムは保護されるが、未登録のプログラムには著作権が発生しないので、保護されない。','registration-required',false],
  ['プログラムの処理手順である解法と、その解法を表すためのプログラム言語は、著作権法によって保護される。','algorithm-language-protected',false],
  ['アルゴリズムを記した文章には著作権が生じるが、そのアルゴリズムを実装したソースプログラムには著作権が生じない。','document-excludes-source',false],
  ['ソースプログラムとオブジェクトプログラムの両方とも著作権法によって保護される。','source-object-expression',true],
 ],
] as const;
export const businessSecretRequirements=['秘密として管理されていること','事業活動に有用な技術上又は営業上の情報であること','公然と知られていないこと'];
export const businessSecretMissing=[2,0,1];
/** 各解説に必要な対象と限定。完全一致hashの別固定も併用する。 */
export const businessExplanationFacts:Record<number,string[][]>={
 73:[['消費者自身','制作','発信・共有'],['個人売買','仲介'],['複数の店舗','ポイント発行','決済'],['希望して登録','電子メール','発信主体']],
 74:[['①はWebサイト運営者','②は閲覧者','③はリンク先','④は商品','⑤は広告主','成功報酬']],
 75:[['中立公平','議論','専門的助言','経営層','事務作業'],['中立公平','専門家','最終承認','会議事務','同じ人が複数'],['中立公平','採算基準','専門助言','意思決定','会議事務']],
 76:[['PDPC','進展','対策','プロセス'],['親和図法','言語情報','親和性','構造'],['連関図法','要因','因果関係'],['系統図法','目的','手段','階層']],
 77:[['仕入','営業活動','株式','借入金','財務活動','固定資産','投資活動','収入か支出かだけ'],['販売','営業活動','社債','借入金','財務活動','建物','投資活動','日常の営業取引'],['給与','営業活動','自己株式','社債','財務活動','土地','投資活動','資金の増減']],
 79:[['創作的','ソースプログラム','オブジェクトプログラム','対価','言語・規約・解法','説明文'],['創作的','無償','言語','規約','創作的な表現','説明文'],['登録','方式','解法','言語','それぞれの創作的表現','ソースとオブジェクト']],
 80:[['秘密管理性','有用性','非公知性','営業譲渡','10年','特許出願'],['秘密管理性','有用性','非公知性','営業譲渡','10年','特許出願'],['秘密管理性','有用性','非公知性','営業譲渡','10年','特許出願']],
};

/** 担当の実条件を明示。表記/並替えの差はこの容量へ数えない。 */
export const businessConditionFacts={75:[{advice:"specific-technical-and-law-only",conclusion:"steer-management-wish",office:"schedule-material-minutes"},{advice:"answer-specialist-questions",conclusion:"chair-vote-and-final-approval",office:"invitations-room-distribution-clean-minutes"},{advice:"technical-opinion-only",conclusion:"judge-proposals-by-business-profitability",office:"dates-room-materials-records"}],77:[{finance:["issue-stock","repay-short-loan"],operating:"purchase-goods",invest:"sell-fixed-asset"},{finance:["issue-bonds","repay-long-loan"],operating:"sell-goods",invest:"buy-office-building"},{finance:["buy-treasury-stock","redeem-bonds"],operating:"pay-sales-salary",invest:"sell-land"}],79:[{falseExclusion:"price-in-hardware",ideas:"algorithm-language",implementation:"document-only"},{falseExclusion:"free-publication",ideas:"language-rules",implementation:"implementation-not-expression"},{falseExclusion:"unregistered",ideas:"algorithm-language",implementation:"document-not-source"}]} as const;
