/** Fixed by source-image reading and primary factual references. No producer
 * import or generated expectation update. Technical sources are factual checks;
 * their prose/figures are not reprinted in the distribution assets. */
export const completionReview={
 questionSHA256:'55210d293f5fd96673cc1131acea3f8237209b4599d95d48bad02964abe62eb6',answerSHA256:'0f871ce45cf3824b208591be14f7898b21bf4109b59aa82833d3693302f033df',checkedOn:'2026-10-24',
 evidence:[
  {url:'https://journal.ntt.co.jp/article/1114',supports:'HVDC給電でも停電対策の蓄電池を使用。入力/給電電圧と最終負荷電圧は別。変換段数による損失。'},
  {url:'https://journal.ntt.co.jp/article/347',supports:'AC/DC相互変換の段数低減と変換損失、停電対策の外部エネルギー源を区別。'},
  {url:'https://ipsj-is.jp/isdic2012/1329.html',supports:'魚骨図=特性要因図。特性とその原因候補の関係。図の描画原本はIPAの2枠/矢印だけで、辞典の文章・図は転載しない。'},
 ],
 dc:{number:23,page:12,key:'ア',rawConditions:3,correctMeaningCount:1,roles:['変換損失','負荷電圧','停電バックアップ','トランス']},
 fishbone:{number:77,page:34,key:'ア',rawConditions:3,newSubordinateWrongPropositions:2,correctMeaningCount:1,roles:['原因','手段','属性','目的'],nodeLabels:['a','b'],boxes:[[275,35,80,40],[85,165,80,40]],edges:[[85,55,275,55],[125,165,190,55]]},
}as const;
export const dcCorrect='交流から直流への変換、直流から交流への変換で生じる電力損失を低減できる。';
export const dcWrongReview=[
 [
  {text:'受電設備からCPUなどのLSIまで、同じ電圧のまま給電できる。',truth:false,reason:'給電と最終負荷の必要電圧は異なる。'},
  {text:'停電の危険がないので、電源バックアップ用のバッテリを不要にできる。',truth:false,reason:'直流方式でも商用電源停電・故障に備える。'},
  {text:'トランスを用いて容易に昇圧、降圧ができる。',truth:false,reason:'一定直流の定常磁束では誘導起電力を連続発生しない。'},
 ],[
  {text:'整流後の直流を降圧せずに、CPUへそのまま供給できる。',truth:false,reason:'必要電圧へ変換するDC/DC段と整流段は別。'},
  {text:'停電しても、蓄電池や発電機を用いずに、直流給電装置だけで無期限に給電を続けられる。',truth:false,reason:'有限の蓄積エネルギーだけでは無期限の負荷電力を賄えない。'},
  {text:'直流電圧をトランスへ直接入力し、その巻数比だけで出力電圧を変えられる。',truth:false,reason:'巻数比の交流変圧式を一定直流へそのまま適用しない。'},
 ],[
  {text:'機器ごとの必要電圧をそろえずに、全て同じ直流電圧で動作させられる。',truth:false,reason:'電源方式の採用は各負荷の動作電圧を同一化しない。'},
  {text:'整流装置が全て停止しても、バックアップ電源なしでサーバの消費電力を供給し続けられる。',truth:false,reason:'全給電源を失えば消費電力を補充できない。'},
  {text:'直流だけをトランスに流すと磁束が変動し続けるので、容易に電圧を変えられる。',truth:false,reason:'定常直流では磁束の時間微分が0。スイッチングとは区別。'},
 ],
]as const;
export const dcExplanationClauses=[
 ['各機器やCPUに適した電圧への変換は必要','停電対策の蓄電池も必要','一定の直流をそのまま通して昇圧・降圧することはできない'],
 ['整流装置の出力とCPUの動作電圧は同一とは限らず','給電装置だけで無期限の電力を作ることはできない','磁束の時間変化が必要'],
 ['必要電圧は機器によって異なり','別の電源が要る','定常磁束は変化し続けず'],
]as const;
export const fishboneMeansReview=[
 {text:'bはaの手段である。',reason:'原因を、aを実現するための手段一般と取り違えない。',meaning:'手段一般の取り違え'},
 {text:'bはaの実現のための手段である。',reason:'aが生じる要因と、aを実現するために選ぶ手段とは別の関係である。',meaning:'結果実現のために選ぶ方法と原因の混同'},
 {text:'bはaの測定のための手段である。',reason:'aが生じる要因と、aの状態や値を測るための手段とは別の関係である。',meaning:'結果を観測する方法と原因の混同'},
]as const;
export const completionTermTruth=[
 {term:'直流給電',source:'2019h31h-fe-am-23',clauses:['直流で電力を供給する方式','相互変換を減らして変換損失を低減','停電のバックアップが不要になるわけではない']},
 {term:'CPU',source:'2019h31h-fe-am-23',clauses:['中央処理装置','プログラムの命令を実行','同じ電圧でそのまま動作するという意味ではない']},
 {term:'LSI',source:'2019h31h-fe-am-23',clauses:['大規模集積回路','多数の素子を集積','動作に必要な電圧条件へ合わせる']},
 {term:'トランス',source:'2019h31h-fe-am-23',clauses:['変圧器','磁束の時間変化','一定の直流をそのまま入力して巻数比だけで電圧を変えることはできない','スイッチング']},
 {term:'特性要因図',source:'2019h31h-fe-am-77',clauses:['結果である特性','要因の関係','魚の骨','実現する手段や測定する手段','結果の属性や目的とは区別する']},
 {term:'QC',source:'2019h31h-fe-am-77',clauses:['品質管理','特性要因図はQC七つ道具の一つ']},
]as const;
