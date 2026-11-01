import assert from 'node:assert/strict';
import type {Block} from '../../src/core/types';
import type {GeneratedBody} from '../../src/core/generators/definition';
import review from './legacy-2016-spring-am-09-32-review.json';
const r=(n:number)=>review.rows.find(x=>x.number===n)!;
function para(blocks:Block[]){assert.equal(blocks.length,1);assert.equal(blocks[0].type,'paragraph');return (blocks[0] as {text:string}).text;}
function choiceText(b:GeneratedBody){return b.choices.map(para);}
const knowledgeConcepts:Record<number,string[]>={
 13:['million-instructions','response-latency','completed-jobs-per-time','turnaround'],
 16:['time-quantum','arrival-order','priority-preemption','shortest-job'],
 17:['interrupt-notification','temporary-storage','device-independence','uniform-file-interface'],
 18:['pipe','background','brace-expansion','redirection'],
 20:['library-management','loading','linking','tracing'],
 22:['optical-code','bluetooth-audio','infrared','radio-tag-identification'],
 24:['content-management','style-sheet','update-feed','collaborative-editing'],
 25:['rendering','clipping','antialiasing','shading'],
 28:['consistency','atomicity','durability','isolation'],
 30:['reorganization','normalization','integrity-constraints','concurrency-control'],
 32:['application-conversion','link-relay','signal-regeneration','network-routing'],
};
// Independently reviewed question targets; no production target table or answer function import.
const targetFacts:Record<number,{concept:string;terms:string[]}[]>={
 13:[{concept:'completed-jobs-per-time',terms:['単位時間','ジョブ']},{concept:'million-instructions',terms:['百万命令','1秒間']},{concept:'response-latency',terms:['最初の応答']},{concept:'turnaround',terms:['全ての処理結果']}],
 16:[{concept:'priority-preemption',terms:['優先度','プリエンプティブ']},{concept:'time-quantum',terms:['ラウンドロビン方式']},{concept:'arrival-order',terms:['FCFS方式']},{concept:'shortest-job',terms:['SJF方式']}],
 17:[{concept:'temporary-storage',terms:['バッファ']},{concept:'interrupt-notification',terms:['入出力割込み']},{concept:'device-independence',terms:['入出力ソフトウェアの階層化']},{concept:'uniform-file-interface',terms:['デバイスファイル']}],
 18:[{concept:'pipe',terms:['標準出力','別のコマンドの標準入力']},{concept:'background',terms:['非同期','終了を待たず']},{concept:'brace-expansion',terms:['a{b,c}','abとac']},{concept:'redirection',terms:['出力先をファイル']}],
 20:[{concept:'linking',terms:['リンカ']},{concept:'library-management',terms:['ライブラリアン']},{concept:'loading',terms:['ローダ']},{concept:'tracing',terms:['実行トレーサ']}],
 22:[{concept:'radio-tag-identification',terms:['RFID']},{concept:'optical-code',terms:['バーコード']},{concept:'bluetooth-audio',terms:['Bluetooth']},{concept:'infrared',terms:['IrDA']}],
 24:[{concept:'style-sheet',terms:['視覚表現','標準仕様']},{concept:'content-management',terms:['コンテンツの作成，管理，公開']},{concept:'update-feed',terms:['更新情報','XML']},{concept:'collaborative-editing',terms:['共同で編集']}],
 25:[{concept:'clipping',terms:['クリッピング']},{concept:'rendering',terms:['レンダリング']},{concept:'antialiasing',terms:['アンチエイリアシング']},{concept:'shading',terms:['シェーディング']}],
 28:[{concept:'atomicity',terms:['完全に行う','取り消す']},{concept:'consistency',terms:['整合性の規則']},{concept:'durability',terms:['完了を通知','失われない']},{concept:'isolation',terms:['途中状態の干渉']}],
 30:[{concept:'concurrency-control',terms:['同時に更新','矛盾']},{concept:'normalization',terms:['関数従属性','表を分解']},{concept:'integrity-constraints',terms:['範囲','参照関係','違反する更新を拒否']},{concept:'reorganization',terms:['格納領域','整理し直す']}],
 32:[{concept:'link-relay',terms:['データリンク層']},{concept:'signal-regeneration',terms:['物理層','整形・再生']},{concept:'network-routing',terms:['ネットワーク層','宛先']},{concept:'application-conversion',terms:['アプリケーション層','変換']}],
};
const fixedFacts:Record<number,{choices:RegExp[];truth:boolean[];reasons:string[]}[]>={
 19:[
 {choices:[/^オブジェクトコードを生成する代わりに，インタプリタ用の中間コードを生成する。$/,/^コンパイルを実施するコンピュータとは異なるアーキテクチャをもったコンピュータで動作するオブジェクトコードを生成する。$/,/^ソースコードを解析して，実行時の処理効率を高めたオブジェクトコードを生成する。$/,/^プログラムの実行時に，呼び出されたサブプログラム名やある時点での変数の内容を表示するようなオブジェクトコードを生成する。$/],truth:[false,false,true,false],reasons:['中間表現という出力形式','生成対象環境が異なるクロスコンパイル','実行効率を高める意味保存変換','デバッグ情報追加']},
 {choices:[/^ソースコードを実行順に1文ずつ解釈して処理を行う。$/,/^複数の目的モジュールの相互参照を解決して，ロードモジュールを生成する。$/,/^ソースコードを解析して，実行時の処理効率を高めたオブジェクトコードを生成する。$/,/^コンパイル時に検出した文法の誤りを報告する。$/],truth:[false,false,true,false],reasons:['逐次解釈実行はインタプリタ','結合処理はリンカ','実行効率を高める意味保存変換','文法診断は構文解析']},
 {choices:[/^プリプロセッサがマクロを展開したソースコードを生成する。$/,/^目的プログラムを主記憶に配置し，実行に必要なアドレスを調整する。$/,/^ソースコードを解析して，実行時の処理効率を高めたオブジェクトコードを生成する。$/,/^プログラムを実行し，ステップごとの変数の値を表示する。$/],truth:[false,false,true,false],reasons:['ソース前処理','ロード/再配置','実行効率を高める意味保存変換','実行時デバッグ']},
 {choices:[/^識別子や演算子などの文字列をトークンの列に分割する。$/,/^ソースコードの構文に従い，構文木を作成する。$/,/^ソースコードを解析して，実行時の処理効率を高めたオブジェクトコードを生成する。$/,/^実行時に，必要な共有ライブラリを動的に結合する。$/],truth:[false,false,true,false],reasons:['字句解析','構文解析','実行効率を高める意味保存変換','動的リンク']},
 ],
 9:[
 {choices:[/^CPUのクロック周波数と，主記憶を接続するシステムバスのクロック周波数は同一でなくてもよい。$/,/^CPUのクロック周波数の逆数が，1秒間に実行できる命令数を表す。$/,/^CPUのクロック周波数を2倍にすると，システム全体としての実行性能も2倍になる。$/,/^使用しているCPUの種類とクロック周波数が等しければ，2種類のPCのプログラム実行性能は同等になる。$/],truth:[true,false,false,false],reasons:['独立のクロック領域を使える','逆数は秒/周期','I/O待ちは周波数倍化で半減しない','キャッシュやメモリが違う反例']},
 {choices:[/同一でなくてもよい。$/,/^CPUのクロック周波数の逆数が，クロック信号の立上りから次の立上りまでに実行する命令数を表す。$/,/^CPUのクロック周波数を3倍にすると，ディスク入出力を含むシステム全体の性能も必ず3倍になる。$/,/^CPUの種類とクロック周波数だけで，キャッシュや主記憶構成が異なるPCの性能を一意に決められる。$/],truth:[true,false,false,false],reasons:['独立クロック','周期は命令数でない','ディスク待ちの反例','メモリアクセス待ちの反例']},
 {choices:[/同一でなくてもよい。$/,/^CPUのクロック周波数の単位Hzは，1命令の実行に掛かる秒数を表す。$/,/^CPUのクロック周波数を半分にすると，待ち時間を含めた全プログラムの実行時間は必ず2倍になる。$/,/^主記憶や入出力装置の性能は，PCのプログラム実行性能に影響しない。$/],truth:[true,false,false,false],reasons:['独立クロック','Hzは1/秒','待ち時間固定の反例','主記憶の速度差の反例']},
 {choices:[/同一でなくてもよい。$/,/^CPUのクロック周期を半分にすると，クロック周波数も半分になる。$/,/^CPUのクロック周波数を4倍にすると，すべてのプログラムの実行時間は必ず4分の1になる。$/,/^同じクロック周波数であれば，命令セットの異なるCPUでも毎秒実行できる命令数は必ず等しい。$/],truth:[true,false,false,false],reasons:['独立クロック','逆数なので2倍','I/O待ちの反例','CPIが異なる反例']},
 ],
 11:[
 {choices:[/^主記憶からキャッシュメモリへの命令の読出しと，主記憶からキャッシュメモリへのデータの読出しを同時に行うことによって，データ転送を高速に行う。$/,/^主記憶から読み出したデータをキャッシュメモリに保持し，CPUが後で同じデータを読み出すときのデータ転送を高速に行う。$/,/^主記憶から読み出したデータをキャッシュメモリに保持し，命令を並列に処理することによって演算を高速に行う。$/,/^主記憶から読み出した命令をキャッシュメモリに保持し，キャッシュメモリ上でデコードして実行することによって演算を高速に行う。$/],truth:[false,true,false,false],reasons:['同時読出し自体でなく局所性','再利用時のヒット','並列実行機構とは異なる','デコーダ/演算器でない']},
 {choices:[/^キャッシュを用いると，初めて読む全てのデータも主記憶へのアクセスなしで得られる。$/,/CPUが後で同じデータを読み出すときのデータ転送を高速に行う。$/,/^キャッシュメモリを設ければ，CPUの演算器がなくても命令を実行できる。$/,/^キャッシュの容量に関係なく，全てのプログラムとデータを常時キャッシュ内だけに保持できる。$/],truth:[false,true,false,false],reasons:['コールドミス','時間的局所性','演算器が必要','有限容量']},
 {choices:[/^キャッシュを用いると，入出力装置とCPUの処理速度は必ず同一になる。$/,/CPUが後で同じデータを読み出すときのデータ転送を高速に行う。$/,/^キャッシュに命令を格納すること自体が，複数のCPUを用いる並列処理である。$/,/^キャッシュを用いると，主記憶を必要とするプログラムは存在しなくなる。$/],truth:[false,true,false,false],reasons:['速度同一化ではない','時間的局所性','CPU数と無関係','容量ミス等に主記憶が必要']},
 {choices:[/^キャッシュの読出し時間は，必ず主記憶の読出し時間より長くなければならない。$/,/CPUが後で同じデータを読み出すときのデータ転送を高速に行う。$/,/^キャッシュに保持したデータは，プログラムの実行中には参照されない。$/,/^キャッシュがヒットしたときにも，必ず同じデータを主記憶から読み直してからCPUへ渡す。$/],truth:[false,true,false,false],reasons:['高速記憶を使用','時間的局所性','実行時に参照する','ヒットは再読出し不要']},
 ],
 15:[
 {choices:[/^MTBFが異なってもMTTRが等しければ，システムの稼働率は等しい。$/,/^MTBFとMTTRの和が等しければ，システムの稼働率は等しい。$/,/^MTBFを変えずにMTTRを短くできれば，システムの稼働率は向上する。$/,/^MTTRが変わらずMTBFが長くなれば，システムの稼働率は低下する。$/],truth:[false,false,true,false],reasons:['MTBFが比率を変える','分子が違う','修理時間を減らせば上昇','逆に上昇']},
 {choices:[/^MTBFが短くなってもMTTRが等しければ，稼働率は必ず等しい。$/,/^MTBFとMTTRを交換しても，稼働率は必ず等しい。$/,/^MTTRを変えずにMTBFを長くできれば，稼働率は向上する。$/,/^MTBFを変えずにMTTRを長くすれば，稼働率は向上する。$/],truth:[false,false,true,false],reasons:['分子が短くなる','例90/10と10/90','平均故障間隔が伸びる','平均修復時間が伸びれば低下']},
 {choices:[/^MTBFが等しければ，MTTRに関係なく稼働率は等しい。$/,/^MTBFとMTTRを同じ倍率で長くすると，稼働率はその倍率だけ向上する。$/,/^MTBFとMTTRを同じ正の倍率で変えても，稼働率は変わらない。$/,/^MTTRを短くすると，MTBFが同じでも稼働率は低下する。$/],truth:[false,false,true,false],reasons:['分母に修復時間を含む','倍率が相殺','倍率が相殺','逆に上昇']},
 {choices:[/^MTTRだけを短くすると，MTBFとMTTRが正の場合でも稼働率は変わらない。$/,/^MTBFを変えずにMTTRを2倍にすると，稼働率は必ず2倍になる。$/,/^MTBFがMTTRより大きければ，稼働率は50%より高い。$/,/^MTBFがMTTRより小さいとき，稼働率は50%より高い。$/],truth:[false,false,true,false],reasons:['分母が減る','分母が増える','b/(b+r)>1/2 iff b>r','逆の不等式']},
 ],
 21:[
 {choices:[/^ソースコードを解析して，プログラムの誤りを検出する。$/,/^テスト対象モジュールに必要なドライバ又はスタブを生成する。$/,/^テストによって実行した経路から網羅度を算出する。$/,/^プログラムの特定の経路をテストするためのデータを生成する。$/],truth:[true,false,false,false],reasons:['実行しない解析','テスト支援生成','実行を要する','入力生成支援']},
 {choices:[/^ソースコードの制御の流れを実行せずに解析し，到達不能な文を検出する。$/,/^実行中に選択した変数の値を逐次表示する。$/,/^実際に実行した文の数から文網羅率を求める。$/,/^プログラムを実行して得た出力を期待値と比較する。$/],truth:[true,false,false,false],reasons:['静的フロー解析','実行監視','実行測定','動的出力比較']},
 {choices:[/^ソースコードを実行せずに，未初期化の変数を使う可能性を解析する。$/,/^実行した分岐の履歴を保存する。$/,/^プログラムを実行して経過時間を測定する。$/,/^テスト実行時に読み込む入力データを自動生成する。$/],truth:[true,false,false,false],reasons:['静的データフロー','実行履歴','実行計測','入力生成']},
 {choices:[/^ソースコードを実行せずに，型の不整合や規約違反を検出する。$/,/^テスト対象を実行するドライバを生成する。$/,/^テストの実行結果を記録して期待結果と照合する。$/,/^実行中のメモリへの不正アクセスを監視する。$/],truth:[true,false,false,false],reasons:['静的型/規約検査','テスト支援','実行結果の動的比較','実行監視']},
 ],
 26:[
 {choices:[/^関係は，表に対応付けられる。$/,/^属性も列も，左から右に順序付けられる。$/,/^タプルも行も，ともに重複しない。$/,/^定義域は，文字型又は文字列型に対応付けられる。$/],truth:[true,false,false,false],reasons:['relation/table','モデルの属性順に意味なし','SQLに重複行あり','数値等もあり']},
 {choices:[/^属性は，列に対応付けられる。$/,/^関係の属性は，常に左から右への物理的な順序を意味する。$/,/^関係のタプルは，格納された物理アドレス順で識別する。$/,/^定義域は，文字列だけに限定される。$/],truth:[true,false,false,false],reasons:['attribute/column','順序に意味なし','物理格納と独立','数値等の域あり']},
 {choices:[/^タプルは，行に対応付けられる。$/,/^関係は，表の一つのセルに対応付けられる。$/,/^属性は，複数の行を順番に並べた列に対応付けられる。$/,/^定義域は，文字列以外の数値を扱えない。$/],truth:[true,false,false,false],reasons:['tuple/row','relationは表全体','属性と列の値の順番を混同','数値も可']},
 {choices:[/^定義域は，属性がとり得る値の集合に対応する。$/,/^関係のタプルには，必ず先頭からの通し番号という順序がある。$/,/^属性の順序だけを入れ替えると，必ず異なる関係になる。$/,/^SQLの表には，同じ値の組合せの行を格納することができない。$/],truth:[true,false,false,false],reasons:['domain/set of values','集合は順序なし','属性名による対応','SQLは重複可']},
 ],
 29:[
 {choices:[/^関係する相互のテーブルにおいて，レコード間の参照一貫性が維持される制約をもたせる。$/,/^関係する相互のテーブルの格納場所を近くに配置することによって，検索，更新を高速に行う。$/,/^障害によって破壊されたレコードを，テーブル間の相互の関係から可能な限り復旧させる。$/,/^レコードの削除，追加の繰返しによる，レコード格納エリアのフラグメンテーションを防止する。$/],truth:[true,false,false,false],reasons:['参照一貫性','格納配置でない','復旧でない','領域整理でない']},
 {choices:[/^参照先のキーに存在しない値が参照元へ登録されることを防ぐ制約を設ける。$/,/^参照する二つの表を必ず同じディスクブロックへ配置する。$/,/^参照先の内容から障害前の全データを必ず復元する。$/,/^行を削除するたびに格納領域を必ず連続化する。$/],truth:[true,false,false,false],reasons:['存在制約','論理制約であり物理配置でない','内容は復元不能','断片化は別機能']},
 {choices:[/^テーブル間の参照関係について，参照先の存在を保証する制約を定義する。$/,/^外部キーを定義するだけで，全ての結合問合せの実行時間を一定にする。$/,/^外部キーを定義するだけで，障害からの復旧用バックアップを不要にする。$/,/^外部キーを定義するだけで，ディスク上の空き領域をなくす。$/],truth:[true,false,false,false],reasons:['参照先の存在','実行時間の保証なし','バックアップ必要','物理領域でない']},
 {choices:[/^親のキーを参照する子の値について，参照一貫性を維持する。$/,/^親と子の表を必ず同じサーバ上の同じファイルへ配置する。$/,/^破損したレコードの内容を参照関係だけから全て再現する。$/,/^行の追加や削除に伴う領域の断片化を自動的に解消する。$/],truth:[true,false,false,false],reasons:['親キーの存在','論理制約で配置を指示しない','情報が失われれば復元不能','領域整理は別機能']},
 ],
};
const imageTuples=[[1000,800,16],...[1000,1200,1600].flatMap(w=>[500,800,1000].flatMap(h=>[8,16,24,32].map(b=>[w,h,b])))].filter((row,i,a)=>a.findIndex(x=>String(x)===String(row))===i).filter(([w,h,b])=>Number.isInteger(w*h*b/8/100000));
const transfers=[[64,1],[64,2],[64,4],[128,1],[128,2],[128,4],[256,2],[256,4]];
const relationInputs=[['ABABAA','B'],['ABABAA','A'],['BAABBA','B'],['BAABBA','A'],['AABABB','B'],['AABABB','A']];
export const oracleDomainSizes:Record<number,number>=Object.fromEntries(Array.from({length:24},(_,i)=>[i+9,i+9===12?28:i+9===14?6:i+9===27?6:i+9===31?8:4]));
const circuitKinds=[[1,1,1,1],[0,0,0,0],[2,2,2,2],[2,2,2,3]];
const lanCounts=[[3,2],[2,2],[2,3],[3,3],[4,2],[4,3]];
function diag(block:Block){assert.equal(block.type,'diagram');if(block.type!=='diagram'||block.scene.kind!=='source_figure')throw Error('EXPECTED_MANAGED_FIGURE');return block.scene;}
const unique=(truth:boolean[],b:GeneratedBody)=>{assert.equal(truth.filter(Boolean).length,1);assert.equal(b.correctIndex,truth.indexOf(true));};
function formula(s:string,a:number,b:number,c:number):number {
 // Small independent arithmetic parser for the displayed formulas; no eval.
 const text=s.replace(/[abc]/g,x=>'('+String({a,b,c}[x])+')').replace(/−/g,'-');let i=0;
 const atom=():number=>{let v:number;if(text[i]==='('){i++;v=sum();assert.equal(text[i++],')');}else{const m=/^(?:\d+(?:\.\d+)?)/.exec(text.slice(i));assert(m);v=Number(m[0]);i+=m[0].length;}if('²³⁴'.includes(text[i]??'!'))v**='²³⁴'.indexOf(text[i++])+2;return v;};
 const product=():number=>{let v=atom();while(i<text.length&&(text[i]==='('||/[0-9]/.test(text[i])))v*=atom();return v;};
 const sum=():number=>{let v=product();while(text[i]==='-'){i++;v-=product();}return v;};const out=sum();assert.equal(i,text.length);return out;
}
export function assertAm2016Body(n:number,c:number,b:GeneratedBody){
 assert.equal(b.choices.length,4);assert.equal(b.answerParts,undefined);assert.equal(b.partAnswers,undefined);assert(b.explanation.length>80);const prompt=b.prompt[0];assert.equal(prompt.type,'paragraph');if(prompt.type!=='paragraph')throw Error('PROMPT');const text=prompt.text;
 if(c===0){assert.equal(text,r(n).prompt);assert.equal(b.correctIndex,r(n).officialIndex);}
 if(knowledgeConcepts[n]){const facts=targetFacts[n][c];facts.terms.forEach(t=>assert(text.includes(t),`Q${n}/${c} premise ${t}`));assert.deepEqual(choiceText(b),r(n).choices);unique(knowledgeConcepts[n].map(x=>x===facts.concept),b);return;}
 if(fixedFacts[n]){assert.equal(text,r(n).prompt+(n===15&&c>0?' MTBF及びMTTRは正の値とする。':''));assert.equal(b.prompt.length,1);const facts=fixedFacts[n][c];choiceText(b).forEach((s,i)=>{assert.match(s,facts.choices[i]);assert(facts.reasons[i].length>2);});unique(facts.truth,b);if(n===9)for(const scale of[.5,2,3,4])assert.notEqual(50+50/scale,100/scale);if(n===15)for(const mtbf of[10,50,100])for(const mttr of[1,5,20]){const f=(b:number,r:number)=>b/(b+r);assert(f(mtbf,mttr/2)>f(mtbf,mttr));assert(f(mtbf*2,mttr)>f(mtbf,mttr));assert.equal(f(mtbf,mttr),f(mtbf*2,mttr*2));assert.equal(f(mtbf,mttr)>.5,mtbf>mttr);}return;}
 if(n===10){assert.equal(text,r(n).prompt);assert.equal(b.prompt[1].type,'list');assert.deepEqual((b.prompt[1] as {items:string[]}).items,r(n).list);const orders=choiceText(b).map(x=>{assert.match(x,/^[①②③④⑤](，[①②③④⑤]){4}$/);return [...x].filter(x=>'①②③④⑤'.includes(x)).map(x=>'①②③④⑤'.indexOf(x)+1);});orders.forEach(x=>assert.deepEqual([...x].sort(),[1,2,3,4,5]));unique(orders.map(order=>[[4,3],[3,2],[2,5],[5,1]].every(([a,z])=>order.indexOf(a)<order.indexOf(z))),b);return;}
 if(n===12){const m=/表示解像度が([0-9,]+)×([0-9,]+)ドットで，色数が([0-9,]+)色/.exec(text);assert(m);const w=Number(m[1].replaceAll(',','')),h=Number(m[2].replaceAll(',','')),colours=Number(m[3].replaceAll(',','')),bits=Math.log2(colours);assert.deepEqual([w,h,bits],imageTuples[c]);assert(text.includes('1Mバイト＝1,000kバイト，1kバイト＝1,000バイト'));let codes=1,needed=0;while(codes<colours){needed++;codes*=2;}const bytes=w*h*needed/8/1000000,opts=choiceText(b).map(Number);assert.deepEqual(opts,[bytes,bytes*2,bytes*4,bytes*8]);opts.forEach(x=>assert((String(x).split('.')[1]?.length??0)<=1));unique(opts.map(x=>x===bytes),b);assert(b.explanation.includes(String(bytes)));return;}
 if(n===14){const s=diag(b.prompt[2]);assert.deepEqual(s.values,lanCounts[c]);assert(text.includes(`${s.values[0]}台のクライアント及び${s.values[1]}台のプリンタ`));assert.match(para([b.prompt[1]]),/各装置の故障は互いに独立/);assert.equal(s.profile,'legacy-2016-spring-am-14-lan');assert.equal(b.prompt[3].type,'table');assert.deepEqual((b.prompt[3] as {rows:string[][]}).rows,[['サーバ','a'],['クライアント','b'],['プリンタ','c'],['LAN','1']]);const[nc,np]=s.values;const opts=choiceText(b),ok=opts.map(()=>true);
  // Tensor grid exceeds degree1 in a, degree4 in b and degree3 in c; dyadic probabilities are exact.
  for(const a of[.25,.75])for(const bv of[.125,.25,.375,.5,.625])for(const cv of[.125,.25,.375,.5]){let expected=0;for(let state=0;state<2**(1+nc+np);state++){const up=Array.from({length:1+nc+np},(_,i)=>(state>>i)&1);let probability=1;for(let i=0;i<up.length;i++){const rate=i===0?a:i<=nc?bv:cv;probability*=up[i]?rate:1-rate;}if(up[0]&&up.slice(1,1+nc).some(Boolean)&&up.slice(1+nc).some(Boolean))expected+=probability;}opts.forEach((f,i)=>{if(Math.abs(formula(f,a,bv,cv)-expected)>1e-12)ok[i]=false;});}unique(ok,b);return;}
 if(n===23){const scene=diag(b.prompt[1]);assert.equal(scene.profile,'legacy-2016-spring-am-23-logic');assert.deepEqual(scene.values,circuitKinds[c]);const optionScenes=b.choices.map(blocks=>{assert.equal(blocks.length,1);return diag(blocks[0]);});optionScenes.forEach((s,i)=>{assert.equal(s.profile,'legacy-2016-spring-am-23-gate');assert.deepEqual(s.values,[i]);});const gateTruth=[[0,0,0,1],[1,1,1,0],[0,1,1,1],[1,0,0,0]];const results:number[]=[];for(let A=0;A<=1;A++)for(let B=0;B<=1;B++){const k=scene.values,w=gateTruth[k[0]][2*A+B],u=gateTruth[k[1]][2*A+w],v=gateTruth[k[2]][2*B+w];results.push(gateTruth[k[3]][2*u+v]);}const options=[[0,1,1,1],[0,0,0,1],[0,1,1,0],[1,0,0,0]];unique(options.map(x=>String(x)===String(results)),b);assert(b.explanation.includes(results.join('，')));return;}
 if(n===27){assert.equal(text,r(n).prompt);const tables=b.prompt.slice(1);assert(tables.every(t=>t.type==='table'));const[x,y,z]=tables as Extract<Block,{type:'table'}>[];const[codes,target]=relationInputs[c];assert.deepEqual(x.rows.map(row=>row[2]),[...codes]);assert.deepEqual(x.rows.map(row=>row.slice(0,2)),r(n).tables![0].rows.map(row=>row.slice(0,2)));assert.deepEqual(y.columns,['学部コード','学部名']);assert.deepEqual(x.columns,['学生番号','氏名','学部コード']);assert.deepEqual(y.rows,[['A','工学部'],['B','情報学部'],['C','文学部']]);assert.deepEqual(z.columns,['学部名','学生番号','氏名']);const joined=x.rows.flatMap(student=>y.rows.filter(dept=>student[2]===dept[0]).map(dept=>[student[0],student[1],student[2],dept[1]])),selected=joined.filter(row=>row[2]===target),projected=selected.map(row=>[row[3],row[0],row[1]]);assert.deepEqual(z.rows,projected);assert(z.rows.length>0&&z.rows.length<joined.length);assert.deepEqual(choiceText(b),r(n).choices);unique([z.columns.length<4&&z.rows.length<joined.length,false,z.columns.length===4,false],b);return;}
 if(n===31){const m=/^(\d+)kビット／秒.*?(?:(\d+)×)?10⁶バイト/.exec(text);assert(m);const rate=Number(m[1]),files=Number(m[2]??1);assert.deepEqual([rate,files],transfers[c]);assert.match(text,/伝送効率は80%/);assert.match(para([b.prompt[1]]),/1kビット＝1,000ビット/);const bits=BigInt(files)*1000000n*8n,speed=BigInt(rate)*1000n*80n/100n;const exact=Number(bits)/Number(speed),options=choiceText(b).map(Number);const error=options.map(x=>Math.abs(x-exact));unique(error.map(x=>x===Math.min(...error)),b);assert(error[b.correctIndex!]/exact<.002);assert.deepEqual(options,[19.6,100,125,156].map(x=>Number((x*files*64/rate).toFixed(8))));options.forEach(x=>assert((String(x).split('.')[1]?.length??0)<=1));assert(b.explanation.includes(String(exact)));return;}
 throw Error('MISSING_INDEPENDENT_ORACLE_'+n);
}
