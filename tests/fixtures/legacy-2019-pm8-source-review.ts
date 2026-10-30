/** Prepared annual candidate; shared distribution/runtime integration pending. All physical39–46,
 * cover1, common3–4 and official answer1 personally read as images. No OCR-only
 * transcription, no source clearance for unrelated appendices is inferred. */
export const legacy2019Pm8SourceReview={
 source:"2019h31h-fe-pm-8",checkedOn:"2026-10-20",status:"prepared_unregistered_shared_runtime_integration_pending",
 questionSha256:"bfd415139913f156ea36b5de5f3d8a6fba7efd721b67c1be12ec45cc693df0dd",
 answerSha256:"8085576c2b5d6db18c9b9ecb00c7b0b9b120eb2be8ac977961b4c81e8c3a52d8",
 pages:[39,40,41,42,43,44,45,46],commonPages:[3,4],coverPage:1,answerPage:1,
 title:"ハフマン符号による文字列圧縮",capacity:4,reference:[0],sourceAnswers:["ア","イ","ウ","エ","オ","イ"],choiceGroups:[4,4,7,7,5,4],compatibility:"旧制度・午後の長文/擬似言語/複数空欄。現行科目Bとは形式・範囲が異なる。",
 selection:"本冊子の問8は必須。150分は午後全体の時間。問1/8必須＋問2〜7から4問＋問9〜13から1問であり、13大問全部を必須回答としない。",
 parts:[{subquestion:1,id:"a",answer:"ア",choices:4},{subquestion:1,id:"b",answer:"イ",choices:4},{subquestion:2,id:"c",answer:"ウ",choices:7},{subquestion:2,id:"d",answer:"エ",choices:7},{subquestion:3,id:"e",answer:"オ",choices:5},{subquestion:3,id:"f",answer:"イ",choices:4}],
 sharedCdGroup:"c,dは同じ原7択群をそれぞれ選ぶ。6欄を維持し、1個の正答へ縮めない。",uniqueChoices:24,displayedChoiceReferences:31,
 example:{text:"AAAABBCDCDDACCAAAAA",characters:["A","B","C","D"],counts:[10,2,4,3],rootFrequency:19,parent:[6,4,5,4,5,6,-1],left:[-1,-1,-1,-1,1,2,5],right:[-1,-1,-1,-1,3,4,0],freq:[10,2,4,3,5,9,19],exampleBCode:"010"},
 question1:{text:"ABBBBBBBCCCDD",counts:[1,7,3,2],originalCodeTables:[["010","1","00","011"],["010","0","01","111"],["100","0","101","11"],["100","1","00","01"]],ratioChoices:[0.77,0.85,0.88,0.92],correctCodes:["010","1","00","011"],originalAlternativeWeightedBits:{third:23,fourth:20},unknownRatioMechanism:0.92,fixedBitsPerCharacter:2,compressedBits:22,uncompressedBits:26,roundedRatio:0.85,rounding:"小数第3位を四捨五入して小数第2位まで"},
 cdChoices:["nsize ≧ 0","nsize ≧ 1","nsize ≧ 2","parent[i] < 0","parent[i] > 0","size ≦ nsize","size ≧ nsize"],
 eChoices:["k ≧ 0","left[k] = −1","left[k] ≧ 0","parent[k] = −1","parent[k] ≧ 0"],
 fChoices:["left[k] = k","left[parent[k]] = k","parent[k] = k","parent[left[k]] = k"],
 premises:[
  "4文字A〜D、葉の出現回数、内部節は子2個とその値の和、根の値は全文字数。",
  "葉の値を先頭から格納し、未親の節を値の小さい順で2個選ぶ。同値なら配列先頭に近い要素を先に選ぶ。選択順に左/右へ置き親は最後に使う要素の次へ追加。未親が1個になるまで反復。",
  "左枝0/右枝1、根から葉へたどる順がビット列の左からの順。原図2は文字Bへ010。",
  "配列は0開始・十分な長さ・全要素−1で初期化。葉のleft/rightは−1、根のparentは−1。sizeは節数、Huffmanで増える。",
  "SortNodeはparent未作成の要素番号を昇順のiで抽出してnodeへ入れnsizeを出力する。Sortはfreq昇順、同値順は並替え前の順に従う。",
  "Encodeは葉から親へ再帰し、再帰から戻る順に枝をprintする。printは与えた文字列を表示する。",
  "共通記法は代入←、配列/引数の表記、単/双岐選択、前判定反復、変数:初期値/継続条件/増分、■開始終了を必要な範囲で解答前へ保持する。",
 ],
 materials:{status:"individual_source_images_reviewed_no_external_quote_identified_distribution_review_pending",notes:"原39〜46の8頁の本文/図/表/プログラム/全択に加え、共通p3の宣言・処理/手続呼出し・選択/反復の開始終了・注記、共通p4の演算子・配列/引数の表記と注意を原画像で個別確認し、第三者引用出所や規格/API本文の転載を特定しなかった。ハフマン法の事実とIPA作問文章・図を区別し、IPA教育利用条件を適用する対象素材として個別記録する。注記不在だけで外部説明文の許諾を推定せず、CASL/JIS符号表/Java API付録は使わない。",remaining:"原問題/基準/template/10素材と個別rights、管理済み4条件・独立oracle・6図/全コードalt・12語は年度候補として実体化済み。共有修正0c771bd後の新しい管理clientで、原1＋4条件の全155radio名（独立固定16表＋厳格本文139）/選択/JSON復元とコードAXを確認。プログラム1は25行×5個、2は8行×5個の5組/個別10個/計165行（原画像2個33行＋生成SVG8個132行）である。旧139成功＋16失敗の当時証跡は別に保持する。その他の原頁画像のgeneric altを全文読み上げ済みとはしない。共有registry/SourceFigure/実Run/mix/source別用語検索と年度全186の統合・配布は未完了。"},
 design:{status:"four_finite_conditions_independently_verified_shared_registration_pending",notes:"文字名だけの差替えや選択肢shuffleにせず、正の出現頻度を変え、説明例αの原文字列/表/木/4配列を固定し、設問1の対象文字列/符号表/総bit長/丸めだけを連動する4条件を設計。c/d/e/fは同じ原プログラム条件を完成する意味を保持し、コード空欄の正答を無理に変えるために別形式へ置換しない。",independentPlan:"安定tie規則付きの別優先queueで木とコードを検算し、4葉の全120順序付き完全二分木から最小weighted costも確認。c/dの49組、e/fの20組は管理済み構造で独立逐次実行し、未初期化参照/負添字/非停止/不正木/誤符号を反例にする。任意の問題コードをevalしない。",limits:"αは親の4倍画像も本人が確認して19文字/頻度一致を固定。原bの0.88/0.77はそれぞれ原aウ/エの符号長23/20を26で割った対応としてのみ記録、0.92の算出機構は不明のまま。αの表/図1〜3/四配列を固定し、設問1の対象文字列だけ13字の頻度4組へ変える。全比率は小数第2位、最小間隔0.03以上を全入力で検査。c/d/e/fの一般手続を完成する固定正答と、総bit長/圧縮率による大問全体の意味変化を保持。共有登録/実Run容量の検査は未完了。"},
}as const;
