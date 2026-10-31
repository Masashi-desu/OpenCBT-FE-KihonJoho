/** Unregistered 2018 autumn AM candidates. Original literals and changed
 * conditions are kept separate. No reviewer fixture or runtime registry import. */
import {p,strings,table,field,type GenerationDefinition,type GeneratedBody} from './definition';
import {sha256} from '../hash';
const original:Record<number,{title:string;prompt:string;choices:(string|string[])[];officialKey:string;page:number;columns:string[]}>={
  "44": {
    "title": "公衆無線LANの対策と効果",
    "prompt": "公衆無線LANのアクセスポイントを設置するときのセキュリティ対策と効果の組みのうち，適切なものはどれか。",
    "choices": [
      [
        "MACアドレスフィルタリングを設定する。",
        "正規の端末のMACアドレスに偽装した攻撃者の端末からの接続を遮断し，利用者のなりすましを防止する。"
      ],
      [
        "SSIDを暗号化する。",
        "SSIDを秘匿して，SSIDの盗聴を防止する。"
      ],
      [
        "自社がレジストラに登録したドメインを，アクセスポイントのSSIDに設定する。",
        "正規のアクセスポイントと同一のSSIDを設定した，悪意のあるアクセスポイントの設置を防止する。"
      ],
      [
        "同一のアクセスポイントに無線で接続している端末同士の通信を，アクセスポイントで遮断する。",
        "同一のアクセスポイントに無線で接続している他の端末に，公衆無線LANの利用者がアクセスポイントを経由して無断でアクセスすることを防止する。"
      ]
    ],
    "officialKey": "エ",
    "page": 22,
    "columns": [
      "セキュリティ対策",
      "効果"
    ]
  },
  "45": {
    "title": "第三者中継を示すメールログ",
    "prompt": "自社の中継用メールサーバで，接続元IPアドレス，電子メールの送信者のメールアドレスのドメイン名，及び電子メールの受信者のメールアドレスのドメイン名から成るログを取得するとき，外部ネットワークからの第三者中継と判断できるログはどれか。ここで，AAA.168.1.5とAAA.168.1.10は自社のグローバルIPアドレスとし，BBB.45.67.89とBBB.45.67.90は社外のグローバルIPアドレスとする。a.b.cは自社のドメイン名とし，a.b.dとa.b.eは他社のドメイン名とする。また，IPアドレスとドメイン名は詐称されていないものとする。",
    "choices": [
      [
        "AAA.168.1.5",
        "a.b.c",
        "a.b.d"
      ],
      [
        "AAA.168.1.10",
        "a.b.c",
        "a.b.c"
      ],
      [
        "BBB.45.67.89",
        "a.b.d",
        "a.b.e"
      ],
      [
        "BBB.45.67.90",
        "a.b.d",
        "a.b.c"
      ]
    ],
    "officialKey": "ウ",
    "page": 23,
    "columns": [
      "接続元IPアドレス",
      "電子メールの送信者のメールアドレスのドメイン名",
      "電子メールの受信者のメールアドレスのドメイン名"
    ]
  },
  "55": {
    "title": "キャパシティ管理の傾向分析",
    "prompt": "キャパシティ管理における将来のコンポーネント，並びにサービスの容量・能力及びパフォーマンスを予想する活動のうち，傾向分析はどれか。",
    "choices": [
      "特定の資源の利用状況を時系列に把握して，将来における利用の変化を予測する。",
      "待ち行列理論などの数学的技法を利用して，サービスの応答時間及びスループットを予測する。",
      "模擬的にトランザクションを発生させて，サービスの応答時間及びスループットを予測する。",
      "モデル化の第一段階として，現在達成されているパフォーマンスを正確に反映したモデルを作成する。"
    ],
    "officialKey": "ア",
    "page": 27,
    "columns": []
  },
  "56": {
    "title": "コールドスタートと回復方式",
    "prompt": "システム障害が発生したときにシステムを初期状態に戻して再開する方法であり，更新前コピー又は更新後コピーの前処理を伴わないシステム開始のことであって，初期プログラムロードとも呼ばれるものはどれか。",
    "choices": [
      "ウォームスタート",
      "コールドスタート",
      "ロールバック",
      "ロールフォワード"
    ],
    "officialKey": "イ",
    "page": 27,
    "columns": []
  },
  "59": {
    "title": "外部保管媒体の引渡し監査",
    "prompt": "外部保管のために専門業者に機密情報を含むバックアップ媒体を引き渡す際の安全性について，情報セキュリティ監査を実施した。その結果として判明した状況のうち，監査人が指摘事項として監査報告書に記載すべきものはどれか。",
    "choices": [
      "委託元責任者が，一定期間ごとに，専門業者における媒体保管状況を確認する契約を結んだ上で引き渡している。",
      "委託元責任者が，専門業者との間で，機密保持条項を盛り込んだ業務委託契約を結んだ上で引き渡している。",
      "委託元担当者が，専用の記録簿に，引渡しの都度，日付と内容を記入し，専門業者から受領印をもらっている。",
      "委託元担当者が，バックアップ媒体を段ボール箱に入れ，それを専門業者に引き渡している。"
    ],
    "officialKey": "エ",
    "page": 28,
    "columns": []
  },
  "60": {
    "title": "上場企業の内部統制最終責任",
    "prompt": "我が国の証券取引所に上場している企業において，内部統制の整備及び運用に最終的な責任を負っている者は誰か。",
    "choices": [
      "株主",
      "監査役",
      "業務担当者",
      "経営者"
    ],
    "officialKey": "エ",
    "page": 28,
    "columns": []
  },
  "61": {
    "title": "IT投資の事前評価",
    "prompt": "IT投資評価を，個別プロジェクトの計画，実施，完了に応じて，事前評価，中間評価，事後評価を行う。事前評価について説明したものはどれか。",
    "choices": [
      "計画と実績との差異及び原因を詳細に分析し，投資額や効果目標の変更が必要かどうかを判断する。",
      "事前に設定した効果目標の達成状況を評価し，必要に応じて目標を達成するための改善策を検討する。",
      "投資効果の実現時期と評価に必要なデータ収集方法を事前に計画し，その時期に合わせて評価を行う。",
      "投資目的に基づいた効果目標を設定し，実施可否判断に必要な情報を上位マネジメントに提供する。"
    ],
    "officialKey": "エ",
    "page": 29,
    "columns": []
  }
};
const limits:Record<number,number[]>={44:[1,1,1],45:[1,1],55:[1],56:[2],59:[3],60:[1,1],61:[1,1,1]};
function checked(values:number[],maximum:number[]){
 if(!Array.isArray(values)||values.length!==maximum.length||Object.keys(values).length!==maximum.length||maximum.some((m,i)=>!Object.hasOwn(values,i)||!Number.isInteger(values[i])||values[i]<0||values[i]>m))throw Error('PARAMETER_CONSTRAINT');
}
export const legacy2018AM55ProposalNamespace='2018-autumn-AM55-native-discrete-events-v2-54844c4';
function build(number:number,values:number[]):GeneratedBody{
 checked(values,limits[number]);const o=original[number];let prompt=o.prompt,choices=structuredClone(o.choices),correctIndex='アイウエ'.indexOf(o.officialKey),explanation='';
 if(number===44){
  const rows=choices as string[][];
  if(values[0])rows[0][1]='無線区間で送受信するデータを暗号化し，通信内容の盗聴を防止する。';
  if(values[1])rows[1]=['SSIDを通知しない設定にする。','無線区間のSSIDの盗聴を完全に防止する。'];
  if(values[2])rows[2][1]='アクセスポイントの証明書による認証を成立させ，偽のアクセスポイントへの接続を防止する。';
  explanation='端末間通信をアクセスポイントで遮断すると，そのアクセスポイントを経由した他端末への無断アクセスを防ぐ。MACアドレスの許可リストは，許可された値への偽装や通信内容の暗号化を担わない。SSIDの設定・非通知は通信暗号化や盗聴の完全防止とは異なる。ドメイン名をSSIDに設定しても，同名の偽APの設置防止や証明書認証は成立しない。';
 }
 if(number===45){
  const rows=choices as string[][];if(values[0])rows[0][1]='a.b.d';if(values[1])rows[1][1]='a.b.e';
  explanation='第三者中継は，社外の接続元から，他社の送信者・他社の受信者を結ぶログに対応する。接続元が社外で，送信者・受信者のドメイン名も他社であるログが該当する。自社IPからの接続や，自社ドメイン宛ての受信とは区別する。ここでは原文の所属対応と詐称なしの条件から判断する。';
 }
 if(number===55){
  if(values[0]){prompt=prompt.replace('傾向分析はどれか。','離散事象シミュレーションはどれか。');choices[1]='待ち行列モデルの式を解析的に解いて，サービスの応答時間及びスループットを予測する。';choices[2]='モデル上でトランザクションの到着や処理完了のたびに状態を更新し，サービスの応答時間及びスループットを予測する。';correctIndex=2;
   explanation='モデル内のトランザクションの到着・処理完了という事象に応じて状態を更新し，性能を予測する活動が離散事象シミュレーションである。履歴からの利用推移の外挿，待ち行列モデルの式の解析的な求解，現在の性能を反映するモデルの作成とは，ここで述べた手順が異なる。離散事象モデルでも数式は用いられる。';
  }else explanation='傾向分析は，観測した資源利用の時系列から将来の変化を予測する活動である。待ち行列などの数学的技法による性能予測，模擬的なトランザクションによる性能予測，現在の性能を反映する初期モデルの作成は，ここで問う利用推移の外挿とは異なる。模擬的なトランザクションという記述だけから，モデル内の事象実行という特定の方法まで限定しない。';
 }
 if(number===56){
  if(values[0]===1){prompt='システム障害が発生したときに，更新前イメージを用いて未確定の更新を取り消し，更新前の状態に戻す回復処理はどれか。';correctIndex=2;}
  if(values[0]===2){prompt='システム障害が発生したときに，バックアップを復元した後，その後の更新記録を順に再適用して，障害直前の状態に戻す回復処理はどれか。';correctIndex=3;}
  explanation=values[0]===0?'原問の初期状態へ戻す開始方法はコールドスタートである。原文には更新前・更新後コピーの前処理を伴わず，初期プログラムロードとも呼ぶという条件がある。ロールバックは更新を取り消す後退回復，ロールフォワードは更新記録を再適用する前進回復であり，ウォームスタートと区別する。製品ごとのIPLの分類が全て同じという意味ではない。':values[0]===1?'更新前イメージを用いて未確定の更新を取り消す方向は，ロールバックである。更新を再適用するロールフォワードとは回復方向が逆である。初期状態からのシステム開始や，状態を引き継ぐ再開という開始方式の説明ではない。':'バックアップの復元後に更新記録を再適用して進める方向は，ロールフォワードである。更新前へ取り消すロールバックとは異なる。コールドスタートやウォームスタートというシステム開始方式を識別する条件でもない。';
 }
 if(number===59){
  const rows=choices as string[];
  if(values[0]){rows[3]='委託元担当者が，無断開封を防ぐ施錠容器に媒体を入れ，受渡しの担当者を確認するなど，定めた保護手順を満たして専門業者に引き渡している。';correctIndex=values[0]-1;}
  if(values[0]===1)rows[0]='委託元責任者が，専門業者における媒体保管状況の確認を契約にも手続にも定めず，確認を実施しないまま引き渡している。';
  if(values[0]===2)rows[1]='委託元責任者が，専門業者との間で，機密保持について契約等による取り決めをしないまま引き渡している。';
  if(values[0]===3)rows[2]='委託元担当者が，引渡しの日付や内容を記録せず，専門業者による受領の確認も残さずに引き渡している。';
  const faults=['原問の段ボール箱への収納と引渡しだけでは，無断開封などへの保護手順が確認できない','保管状況の確認を取り決めず実施もしない','機密保持の取り決めをしない','受渡記録と受領確認を残さない'];
  explanation=faults[values[0]]+'状況が指摘対象となる。保管状況の確認，機密保持の取り決め，記録と受領確認，物理保護の各観点を，表示された状況に照らして比較する。箱の材質だけで一律に違法・不適合とする判断ではなく，暗号化が常に法定義務だともしていない。';
 }
 if(number===60){if(values[0])choices[1]='会計監査人';if(values[1])choices[2]='内部監査人';explanation='内部統制を整備し運用する最終責任は経営者が負う。株主は出資者，監査役や会計監査人・内部監査人は監視・検証等の役割，業務担当者は担当業務を実行する役割であり，ここで問う最終責任とは区別する。';}
 if(number===61){
  if(values[0])choices[0]='実施中の調達実績や範囲の逸脱を計画と照合し，必要な是正措置を検討する。';
  if(values[1])choices[1]='稼働後の効果の実績を分析し，未達の原因と改善策を検討する。';
  if(values[2])choices[2]='稼働後に予定した効果測定の時期に，実績データを用いて達成した投資効果を評価する。';
  explanation='事前評価では投資の目的と効果目標を設定し，実施可否の判断に必要な情報を上位マネジメントへ提供する。実施中の計画と実績の比較は中間評価，完了・稼働後の効果達成状況の評価は事後評価である。データ収集を事前に計画したという語だけで，実際に効果を評価する時点まで事前評価と判断しない。';
 }
 return{prompt:[p(prompt)],choices:o.columns.length?(choices as string[][]).map(row=>[table('選択肢',o.columns,[row])]):strings(choices as string[]),correctIndex,explanation};
}
export const legacy2018AutumnRemainingAmDefinitions:GenerationDefinition[]=[44,45,55,56,59,60,61].map(n=>({source:'2018h30a-fe-am-'+n,title:original[n].title,fields:limits[n].map((max,i)=>field(n===55?'native-DES-v2-profile':`条件${i+1}`,0,max)),reference:limits[n].map(()=>0),sourceAnswer:original[n].officialKey,...([44,45,60,61].includes(n)?{answerVariation:'fixed' as const}:{}),...(n===55?{version:'3.5.0' as const}:{}),notes:'原の問い方向・判定・全前提・全4択の役割と文章/表形式を保持し，条件から本文・選択肢・正答・独自解説を一緒に確定する。'+(n===55?' '+legacy2018AM55ProposalNamespace+'専用profile0/1。profile0は原全文，profile1だけtarget/イ/ウの3slotを改変。旧analytic/generic simulation研究案のnumeric1を再解釈しない。':''),build:values=>build(n,values)}));
export function remainingAmValues(d:GenerationDefinition):number[][]{const out:number[][]=[];function visit(v:number[]){if(v.length===d.fields.length){d.build(v);out.push(v);return;}const f=d.fields[v.length];for(let n=f.minimum;n<=f.maximum;n++)visit([...v,n]);}visit([]);return out;}
export function remainingAmAnswerSignature(body:GeneratedBody){return body.choices[body.correctIndex!].map(b=>'text' in b?b.text:JSON.stringify(b)).join('\n');}
/** Finite private-source prototype, not normalApp/Run admission. */
export async function sampleRemainingAmValues(seed:string,d:GenerationDefinition,used:readonly number[][]=[],lastAnswer?:string){
 if(!/^[a-f0-9]{32}$/.test(seed))throw Error('SEED');used.forEach(v=>d.build(v));
 const excluded=new Set(used.map(v=>JSON.stringify(v))),eligible=remainingAmValues(d).filter(v=>!excluded.has(JSON.stringify(v))&&(d.answerVariation==='fixed'||lastAnswer===undefined||remainingAmAnswerSignature(d.build(v))!==lastAnswer));
 if(!eligible.length)throw Error('FINITE_CAPACITY_EXHAUSTED');const h=await sha256(seed+'\n'+d.source+'\n'+(d.version??'3.2.0')+'\n'+legacy2018AM55ProposalNamespace);return eligible[Number(BigInt('0x'+h.slice(0,16))%BigInt(eligible.length))];
}
