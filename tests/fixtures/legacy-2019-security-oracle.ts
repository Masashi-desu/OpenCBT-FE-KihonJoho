/** Manually reviewed source propositions and predicates. No generator imports.
 * A sentence can be true while failing the question's set/scope (Q42/Q47). */
import assert from "node:assert/strict";
import type {GeneratedBody} from "../../src/core/generators/definition";
import {legacy2019SecurityExplanationReview} from "./legacy-2019-security-explanation-review";
export const legacy2019SecuritySourceStatements:Record<number,string[]>={
  37:["辞書にある単語をパスワードに設定している利用者がいる状況に着目して、攻撃対象とする利用者IDを一つ定め、辞書にある単語やその組合せをパスワードとして、ログインを試行する。","パスワードの文字数の上限が小さいWebサイトに対して、攻撃対象とする利用者IDを一つ定め、文字を組み合わせたパスワードを総当たりして、ログインを試行する。","複数サイトで同一の利用者IDとパスワードを使っている利用者がいる状況に着目して、不正に取得した他サイトの利用者IDとパスワードの一覧表を用いて、ログインを試行する。","よく用いられるパスワードを一つ定め、文字を組み合わせた利用者IDを総当たりして、ログインを試行する。"],
  39:["RSA暗号と比べて、短い鍵長で同レベルの安全性が実現できる。","共通鍵暗号方式であり、暗号化や復号の処理を高速に行うことができる。","総当たりによる解読が不可能なことが、数学的に証明されている。","データを秘匿する目的で用いる場合、復号鍵を秘密にしておく必要がない。"],
  40:["システムが被害を受けるリスクを想定して、保険を掛ける。","システムの被害につながるリスクの顕在化を抑える対策に資金を投入する。","リスクが大きいと評価されたシステムを廃止し、新たなセキュアなシステムの構築に資金を投入する。","リスクが顕在化した場合のシステムの被害を小さくする設備に資金を投入する。"],
  42:["“機会”とは、情報システムなどの技術や物理的な環境、組織のルールなど、内部者による不正行為の実行を可能又は容易にする環境の存在である。","“情報と伝達”とは、必要な情報が識別、把握及び処理され、組織内外及び関係者相互に正しく伝えられるようにすることである。","“正当化”とは、ノルマによるプレッシャなどのことである。","“動機”とは、良心のかしゃくを乗り越える都合の良い解釈や他人への責任転嫁など、内部者が不正行為を自ら納得させるための自分勝手な理由付けである。"],
  43:["IPsec","S/MIME","SSH","XML暗号"],44:["DMZ","SIEM","ハニーポット","ボットネット"],
  45:["ソフトウェアの脆弱性を自動的に修正できる。","ソフトウェアの脆弱性を検出できる。","複数のログデータを相関分析し、不正アクセスを検知できる。","利用者IDを統合的に管理し、統一したパスワードポリシーを適用できる。"],
  46:["ある振る舞いから次の振る舞いへの制御の流れを表現する。","オブジェクト間の相互作用を時系列で表現する。","システムが外部に提供する機能と、それを利用する者や外部システムとの関係を表現する。","一つのオブジェクトの状態がイベントの発生や時間の経過とともにどのように変化するかを表現する。"],
  47:["テストデータの作成基準として、プログラムの命令や分岐に対する網羅率を使用する。","被テストプログラムに冗長なコードがあっても検出できない。","プログラムの内部構造に着目し、必要な部分が実行されたかどうかを検証する。","分岐命令やモジュールの数が増えると、テストデータが急増する。"],
  48:["指定された条件のテストデータや、プログラムの入力ファイルを自動的に生成する。","テストの実行結果を基に、命令の網羅率や分岐の網羅率を自動的に計測し、分析する。","プログラム中に文法上の誤りや論理的な誤りなどがあるかどうかを、ソースコードを分析して調べる。","モジュールの呼出し回数や実行時間、実行文の実行回数などの、プログラム実行時の動作特性に関するデータを計測する。"],
};
type Fact={concept:string;trueStatement:boolean;triangleMember?:boolean;labelMatches?:boolean};
const facts=new Map<string,Fact>();
function register(texts:string[],concepts:string[],flags?:Partial<Fact>[]){assert.equal(texts.length,concepts.length);texts.forEach((t,i)=>{assert(!facts.has(t));facts.set(t,{concept:concepts[i],trueStatement:true,...flags?.[i]});});}
register(legacy2019SecuritySourceStatements[37],["dictionary","exhaust-password","leaked-pairs","exhaust-id"]);
register(legacy2019SecuritySourceStatements[39],["short-ecc","symmetric-error","impossible-error","secret-key-error"],[{}, {trueStatement:false},{trueStatement:false},{trueStatement:false}]);
register([
  "暗号化と復号の両方に同じ共通鍵を使う方式なので、通信相手と秘密の鍵を事前共有する。","公開鍵と秘密鍵を区別せず、参加者全員で一つの共通鍵を使い続ける暗号方式である。",
  "鍵を長くしても、総当たりで調べる候補の数は増加しない。","どのような計算機でも、解読は数学的に不可能と証明される。",
  "受信者以外の全員に復号用の秘密鍵を公開しても、復号できるのは受信者だけである。","署名の検証に使う公開鍵だけを秘密にし、復号に使う秘密鍵は誰にでも配布してよい。",
],["symmetric-error","symmetric-error","impossible-error","impossible-error","secret-key-error","secret-key-error"],Array.from({length:6},()=>({trueStatement:false})));
register(legacy2019SecuritySourceStatements[40],["loss-funds","prevention","avoidance","mitigation"]);
register(["システムの事故による復旧費用を自社で負担できるように、事故に備えた資金を積み立てる。","システム事故後の復旧資金に備えて、金融機関と融資枠を事前に契約する。"],["loss-funds","loss-funds"]);
register(legacy2019SecuritySourceStatements[42],["opportunity","info-communication","pressure-mislabel","justification-mislabel"],[{triangleMember:true,labelMatches:true},{triangleMember:false,labelMatches:true},{triangleMember:true,labelMatches:false,trueStatement:false},{triangleMember:true,labelMatches:false,trueStatement:false}]);
register([
  "“モニタリング”とは、内部統制が機能しているかを継続して評価し、必要な改善につなげることである。","“統制活動”とは、定められた指示が実行されるように承認や職務分担などの手続を設けることである。",
  "“正当化”とは、借金の返済に追われ、金銭を得なければならないという圧力のことである。","“正当化”とは、達成困難な営業成績を求められ、処分を恐れて感じる圧力のことである。",
  "“動機”とは、会社に十分に評価されていないので無断で持ち出してもよいと、良心のかしゃくを乗り越えるために自分に都合よく不正を理由付けすることである。","“動機”とは、他の人もやっているので自分が同じ行為をしても問題ないと自分に都合よく考え、不正に対する倫理的な抵抗を減らすために行う理由付けである。",
],["info-communication","info-communication","pressure-mislabel","pressure-mislabel","justification-mislabel","justification-mislabel"],[{triangleMember:false,labelMatches:true},{triangleMember:false,labelMatches:true},...Array.from({length:4},()=>({triangleMember:true,labelMatches:false,trueStatement:false}))]);
register(legacy2019SecuritySourceStatements[43],["packet","mail","remote-login","xml-parts"]);
register(legacy2019SecuritySourceStatements[44],["boundary-zone","log-correlation","decoy","controlled-bots"]);
register(legacy2019SecuritySourceStatements[45],["automatic-repair","fault-detection","log-detection","id-policy"]);
register(legacy2019SecuritySourceStatements[46],["control-flow","interaction-time","actor-functions","state-change"]);
register(legacy2019SecuritySourceStatements[47],["structure-coverage","redundancy-undetectable","internal-observation","structure-path-growth"]);
register([
  "プログラム内の各分岐が真と偽の両方になるように、内部の網羅率を基準にデータを選ぶ。","繰返しを含むプログラムの制御フローを解析し、内部経路を通過させることを基準にデータを選ぶ。",
  "ソースの各文が実際に実行されたかを計測する。","変数の定義から使用までの内部経路の実行を検証する。",
  "内部の分岐の組合せによる全実行経路を網羅することを、テストデータ作成の基準にする。","プログラム内部の分岐数から全ての経路の組合せを求め、その網羅に必要なデータを作成する。",
],["structure-coverage","structure-coverage","internal-observation","internal-observation","structure-path-growth","structure-path-growth"]);
register(legacy2019SecuritySourceStatements[48],["generate-input","runtime-coverage","static-source","runtime-profile"]);
const prompts:Record<number,string[]>={
  37:["パスワードリスト攻撃の手口に該当するものはどれか。","辞書攻撃の手口に該当するものはどれか。","パスワードの総当たり攻撃の手口に該当するものはどれか。"],
  39:["楕円曲線暗号の特徴はどれか。"],40:["リスク対応のうち、リスクファイナンシングに該当するものはどれか。"],
  42:["不正が発生する際には、“不正のトライアングル”の3要素全てが存在すると考えられている。“不正のトライアングル”の構成要素の説明として、適切なものはどれか。"],
  43:["OSI基本参照モデルのネットワーク層で動作し、“認証ヘッダ（AH）”と“暗号ペイロード（ESP）”の二つのプロトコルを含むものはどれか。","電子メールのMIME形式を拡張し、公開鍵暗号技術を使ってメールの暗号化や電子署名を行うものはどれか。","安全でないネットワーク上でも暗号化した通信路でリモートログインなどを行えるようにするプロトコルはどれか。","XML文書全体や、文書中の特定の要素などを暗号化するための、W3Cが定めた方式はどれか。"],
  44:["侵入者やマルウェアの挙動を調査するために、意図的に脆弱性をもたせたシステム又はネットワークはどれか。","外部へ公開するサーバを内部ネットワークから分離して配置するために、境界に設けるネットワークの区域はどれか。","複数の機器やソフトウェアからログやイベントを収集し、相関分析してセキュリティ上の異常を検出する仕組みはどれか。","マルウェアに感染した複数の端末などが、攻撃者の指令を受けて攻撃などに使われるネットワークはどれか。"],
  45:["ファジングで得られるセキュリティ上の効果はどれか。","SIEMを用いて得られるセキュリティ上の効果はどれか。","利用者IDの統合管理システムで得られるセキュリティ上の効果はどれか。"],
  46:["アクティビティ図","シーケンス図","ユースケース図","ステートマシン図"].map(x=>`UMLにおける振る舞い図の説明のうち、${x}のものはどれか。`),
  47:["ブラックボックステストに関する記述として、最も適切なものはどれか。"],
  48:["ソフトウェアのテストツールの説明のうち、静的テストを支援する静的解析ツールのものはどれか。","ソフトウェアのテストツールの説明のうち、テストデータの生成を支援するツールのものはどれか。","ソフトウェアのテストツールの説明のうち、動的テストでカバレッジを分析するツールのものはどれか。","ソフトウェアのテストツールの説明のうち、実行時の性能を分析するプロファイラのものはどれか。"],
};
const concepts:Record<number,string[]>={37:["leaked-pairs","dictionary","exhaust-password"],39:["short-ecc"],40:["loss-funds"],42:["opportunity"],43:["packet","mail","remote-login","xml-parts"],44:["decoy","boundary-zone","log-correlation","controlled-bots"],45:["fault-detection","log-detection","id-policy"],46:["control-flow","interaction-time","actor-functions","state-change"],47:["redundancy-undetectable"],48:["static-source","generate-input","runtime-coverage","runtime-profile"]};
const roles:Record<number,string[]>={37:["dictionary","exhaust-password","leaked-pairs","exhaust-id"],39:["short-ecc","symmetric-error","impossible-error","secret-key-error"],40:["loss-funds","prevention","avoidance","mitigation"],42:["opportunity","info-communication","pressure-mislabel","justification-mislabel"],43:["packet","mail","remote-login","xml-parts"],44:["boundary-zone","log-correlation","decoy","controlled-bots"],45:["automatic-repair","fault-detection","log-detection","id-policy"],46:["control-flow","interaction-time","actor-functions","state-change"],47:["structure-coverage","redundancy-undetectable","internal-observation","structure-path-growth"],48:["generate-input","runtime-coverage","static-source","runtime-profile"]};
export function assertLegacy2019Security(source:string,body:GeneratedBody,values:number[]){
  const n=Number(source.split("-").at(-1));assert(prompts[n]);assert.equal(body.prompt.length,1);assert.equal(body.prompt[0].type,"paragraph");
  assert.equal(body.answerParts,undefined);assert.equal(body.partAnswers,undefined);assert.equal(body.choices.length,4);
  assert.equal(body.prompt[0].type==="paragraph"?body.prompt[0].text:"",prompts[n][prompts[n].length===1?0:values[0]]);
  const actual=body.choices.map(bs=>{assert.equal(bs.length,1);assert.equal(bs[0].type,"paragraph");const text=bs[0].type==="paragraph"?bs[0].text:"",f=facts.get(text);assert(f,`unreviewed proposition ${source}: ${text}`);return f;});
  assert.deepEqual(actual.map(f=>f.concept),roles[n]);
  const target=concepts[n][concepts[n].length===1?0:values[0]],matches=actual.map(f=>n===42?f.triangleMember===true&&f.labelMatches===true&&f.trueStatement:f.concept===target);
  assert.equal(matches.filter(Boolean).length,1);assert.equal(body.correctIndex,matches.indexOf(true),"independent answer mismatch");
  if(n===39)assert(actual[0].trueStatement&&actual.slice(1).every(f=>!f.trueStatement));
  const e=legacy2019SecurityExplanationReview[n];assert(e);for(const clause of e.common)assert(body.explanation.includes(clause),`explanation missing/polarity: ${source}: ${clause}`);
  if(e.reasons){assert(body.explanation.startsWith(e.reasons[values[0]]),`explanation condition: ${source}`);for(let v=0;v<e.reasons.length;v++)if(v!==values[0])assert(!body.explanation.includes(e.reasons[v]),`explanation other condition: ${source}`);}
}
export function triangleOriginalFacts(){return legacy2019SecuritySourceStatements[42].map(t=>({...facts.get(t)!}));}
/** Exhaustively distinguish external behavior from internal dead/redundant work. */
export function redundantCodeCounterexample(){
  let samples=0;for(let x=-16;x<=16;x++){const direct=x*x;let redundant=0;for(let i=0;i<3;i++)redundant=x*x;assert.equal(direct,redundant);samples++;}return samples;
}
