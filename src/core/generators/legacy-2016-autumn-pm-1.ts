/** IPA H28 autumn afternoon Q1: retain all five fields and the official errata. */
import { field,p,table,list,strings,variableNotes,type GeneratedBody } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { autumn2016PmPageAssetId } from './legacy-2016-autumn-pm-materials';
import { autumn2016Pm0104Case,autumn2016Pm1Cases,autumn2016Pm0104Diagram as draw,autumn2016Pm0104Profiles as profiles } from './legacy-2016-autumn-pm-figures-01-04';
export const autumn2016Pm1EditorialTitle='原資料を読む際の補足';
const placement=[['サーバ群X','サーバ群X'],['サーバ群X','サーバ群Y'],['サーバ群Y','サーバ群X'],['サーバ群Y','サーバ群Y']];
export function autumn2016Pm1FirewallChoices(){return [
 '項番1の前に，送信元が“DBサーバ”，宛先が“Webサーバ”，宛先ポート番号が“80”で動作が“許可”という設定を追加する。',
 '項番1の前に，送信元が“任意”，宛先が“Webサーバ”，宛先ポート番号が“80”で動作が“許可”という設定を追加する。',
 '項番2の送信元を“Webサーバ”に変更する。',
 '項番2の動作を“拒否”に変更する。',
];}
export const legacy2016AutumnPm1Definition: AfternoonBookletDefinition={
 source:'2016h28a-fe-pm-1',title:'販売支援システムの情報セキュリティ',version:'3.2.0',fields:[field('通信ポートと情報セキュリティ対策の条件',0,3)],reference:[0],sourceAnswer:'設問1=イ／設問2=ウ／設問3 a=オ，b=エ，c=ウ',
 fixedReferenceAssetIds:[autumn2016PmPageAssetId(2)],
 publicNotes:'原のネットワーク配置，順序付きFW規則，機密性・完全性・可用性を対応付ける形式を保ち，DB用・監視用ポートと具体的な対策を変更しています。原資料の誤植は画像に残し，公式正誤表を併記して適用しています。',
 notes:variableNotes+' 原物理6–9頁と正誤表2頁を保持。正誤表は冊子7頁下から2行目と8頁表3表題の（一部）を削除するもの。生成本文は訂正を適用し，公式訂正文・原正誤表画像と独自の適用案内を別contextにする。5欄・14固有択・26欄内参照。設問1/2はラベルなし，a/b/cは同6択を同順で参照。FWはfirst-match，監視サーバとDBサーバは同じLAN。HTTP80/HTTPS443/DB専用/監視専用の役割を混同しない。4条件は対策の内容とポートを変え，単なる選択肢の置換ではない。全5欄は独立の到達性・順序規則・CIA対応資料から検証する。',
 build(values){
  const i=autumn2016Pm0104Case(values),c=autumn2016Pm1Cases[i],fw=autumn2016Pm1FirewallChoices(),roman=['i','ii','iii','iv','v','vi'];
  const prompt=[
   p('次の問1は必須問題です。必ず解答してください。'),
   p('問1 販売支援システムの情報セキュリティに関する次の記述を読んで，設問1〜3に答えよ。'),
   p('中堅の商社であるA社では，営業員が顧客先で営業活動を行い，自社に戻ってから見積書を作成している。'),
   p('この度，営業員がタブレット端末（以下，タブレットという）を携帯し，顧客先で要求を聞きながら，タブレットを使って見積書を作成し，その場で顧客に提示できる販売支援システムを構築することにした。'),
   p('営業員は，タブレットのWebブラウザからインターネット経由でHTTP over TLS（以下，HTTPSという）によって販売支援システムにアクセスする。このとき，営業員は，社員IDとパスワードを入力してログインする。'),
   p('〔販売支援システムの構成〕'),
   p('(1) 販売支援システムは次のサーバで構成され，A社のネットワークに設置される。'),
   list(['リバースプロキシサーバ（以下，RPサーバという）1台','アプリケーションソフトウェアが稼働するWebサーバ2台','見積書作成に必要なデータを格納するデータベースサーバ（以下，DBサーバという）1台'],true),
   p('(2) Webサーバ2台はクラスタリング構成にして，1台が故障してもサービスが継続できるようにする。'),
   p('(3) DBサーバへのアクセスの監視は，PCと同じLANにある監視サーバで行う。'),
   p('(4) インターネットから販売支援システムへの通信は，RPサーバを経由して行う。RPサーバは，HTTPSをHTTPに変換し，販売支援システムの他のサーバと，HTTPで通信する。'),
   p('A社のネットワーク構成を図1に示す。'),draw(1,profiles.network,0,'図1 A社のネットワーク構成'),
   p('販売支援システムに関わる通信経路について，通信経路で利用するプロトコル及び宛先ポート番号を表1に示す。また，FWにおけるフィルタリングの設定を表2に示す。'),
   table('表1 通信経路で利用するプロトコル及び宛先ポート番号',['通信経路','プロトコル','宛先ポート番号'],[['監視サーバからDBサーバ','監視専用',String(c.monitorPort)],['タブレットからRPサーバ','HTTPS','443'],['RPサーバからWebサーバ','HTTP','80'],['WebサーバからDBサーバ','DB専用',String(c.dbPort)]]),
   draw(1,profiles.rules,i,'表2 FWにおけるフィルタリングの設定'),
   p('設問1 WebサーバとDBサーバについて，図1中の配置場所の組合せとして適切な答えを，解答群の中から選べ。'),
   table('設問1 解答群',['記号','Webサーバ','DBサーバ'],placement.map((row,k)=>['アイウエ'[k],...row])),
   p('設問2 表2に示したFWにおけるフィルタリングの設定では，インターネットからDBサーバに直接アクセスされるおそれがある。そこで，FWのフィルタリングの設定を変更することにした。フィルタリングの設定を変更する内容として適切な答えを，解答群の中から選べ。'),
   p('設問2 解答群'),...fw.map((text,k)=>p('アイウエ'[k]+'　'+text)),
   draw(1,profiles.prose1,0,'設問の本文'),
   draw(1,profiles.cia,0,'表3 情報セキュリティの3要素との関連'),
   p('〔販売支援システムに関する対応〕'),...c.controls.map((text,k)=>p('('+roman[k]+') '+text)),
   table('a〜cに関する解答群',['記号','対応'],roman.map((text,k)=>['アイウエオカ'[k],'('+text+')'])),
  ];
  const choices=[...placement.map(row=>[table('配置場所の組合せ',['Webサーバ','DBサーバ'],[[...row]])]),...strings(fw),...strings(roman.map(text=>'('+text+')'))];
  const counts=[4,4,6,6,6],offsets=[0,4,8,8,8],ids=['q1','q2','a','b','c'],indices=[1,2,...c.cia];
  const answerParts=ids.map((id,k)=>({id:'part-'+id,label:k<2?'設問'+(k+1):'設問3 '+id,choiceIds:Array.from({length:counts[k]},(_,j)=>'choice-value-'+(offsets[k]+j+1))}));
  const partAnswers=ids.map((id,k)=>({kind:'choice' as const,partId:'part-'+id,choiceId:'choice-value-'+(offsets[k]+indices[k]+1)}));
  const cia=['機密性は，権限のない者に情報を利用・開示させない性質。','完全性は，情報の正確さ・完全さを保ち，不正な変更を防ぎ又は検知する性質。','可用性は，必要なときに情報・サービスを利用できる性質。'];
  const explanation='設問1：RPサーバとWebサーバ間はHTTP80を使う。WebサーバをLAN側に置くとFWの最後の拒否規則に当たり，RPサーバから通信できない。WebサーバはDMZ（DeMilitarized Zone，外部向けサーバを内部LANと分離するネットワーク）のサーバ群Xに置く。DBサーバはPCと同じLANの監視サーバから監視するため，サーバ群Yに置く。したがって組合せはイ。\n設問2：現在は送信元が任意のままDB専用ポート'+c.dbPort+'を許可しているので，外部からも一致する。項番2の送信元をWebサーバに限定すれば，必要なWeb→DBだけ許可し，外部→DBは項番3で拒否する。追加したHTTP80の許可はDBポートの穴を閉じず，DBポートを全面拒否すると必要なWeb→DBも止まる。監視用'+c.monitorPort+'は同じLAN内での監視に使い，DB用'+c.dbPort+'とは別である。\n設問3：'+cia.map((text,k)=>text+'この条件では('+roman[c.cia[k]]+')「'+c.controls[c.cia[k]]+'」が対応する。').join('\n')+'\n正規化・HTTPの利用・端末の形状変更だけで，これらのセキュリティ上の性質を一律に保証するとはいえない。FWはFirewall（通信を規則で制御するファイアウォール），RPはReverse Proxy（利用者に代わって内部サーバへ要求を中継するリバースプロキシ），DBはDatabase（データベース）。TLSはTransport Layer Security（通信路を保護するプロトコル），HTTPSはHTTP over TLSであり，HTTPはHypertext Transfer Protocolである。LANはLocal Area Network（構内のネットワーク），PCはPersonal Computer（パーソナルコンピュータ）。CIAはConfidentiality・Integrity・Availability（機密性・完全性・可用性）の頭文字である。';
  return {prompt,choices,answerParts,partAnswers,explanation,contexts:[
   {title:autumn2016Pm1EditorialTitle,presentation:'text_figure',blocks:[p('原資料の画像には訂正前の「関連（一部）」という記載があります。公式正誤表に従って「（一部）」を削除して読んでください。本アプリの本文表示には公式訂正を適用しています。')]},
   {title:'問1 公式正誤表と訂正文',presentation:'text_figure',blocks:[p('冊子7頁・下から2行目：「3要素との関連を表3にまとめた。」／冊子8頁・上から1行目：「表3 情報セキュリティの3要素との関連」。いずれも「（一部）」を削除する。'),{type:'image',assetId:autumn2016PmPageAssetId(2),caption:'平成28年度秋期 基本情報技術者試験 午後 正誤表（原冊子物理2頁）'}]},
  ]} satisfies GeneratedBody;
 }
};
