/** Unregistered native source35. Fixed LTE/three properties, with three
 * independently varied distractor mechanisms; no name/shuffle-only capacity. */
import{field,p,strings,variableNotes,type GenerationDefinition}from'./definition';
export const legacy2018AutumnLteDefinitions:GenerationDefinition[]=[{
 source:'2018h30a-fe-am-35',title:'携帯電話網の通信規格と媒体・端末・音声の機能',sourceAnswer:'ア',version:'3.2.0',reference:[0,0,0],answerVariation:'fixed',fields:[field('媒体アクセスの誤答機構',0,1),field('管理範囲の誤答機構',0,1),field('音声・セッションの誤答機構',0,1)],
 notes:variableNotes+' 原の携帯電話網の規格名を問う方向/番号付き3特性/正式名付き4名称/LTE正答を固定。MACという層機能とCSMA/CAという具体的アクセス方式、端末管理MDMとアプリ/データ管理MAM、音声のIP伝送VoIPとセッション制御SIPの実機能差を3軸8条件とする。MACをIEEE専用とせず、SIPが3GPPシステムで使われることとSIP自体の規約の対象を区別する。規格/外部図表本文は転載しない。',
 build:v=>{if(v.length!==3||v.some(n=>n!==0&&n!==1))throw Error('PARAMETER_CONSTRAINT');return{
  prompt:[p('携帯電話網で使用される通信規格の名称であり、次の三つの特徴をもつものはどれか。'),{type:'list',ordered:true,items:['全ての通信をパケット交換方式で処理する。','複数のアンテナを使用するMIMOと呼ばれる通信方式が利用可能である。','国際標準化プロジェクト3GPP（3rd Generation Partnership Project）で標準化されている。']}],
  choices:strings(['LTE（Long Term Evolution）',v[0]?'CSMA/CA（Carrier Sense Multiple Access with Collision Avoidance）':'MAC（Media Access Control）',v[1]?'MAM（Mobile Application Management）':'MDM（Mobile Device Management）',v[2]?'SIP（Session Initiation Protocol）':'VoIP（Voice over Internet Protocol）']),correctIndex:0,
  explanation:'LTEは、通信をパケット交換で扱い、複数アンテナのMIMOを利用できる、3GPPで標準化された携帯電話網の通信規格である。'+(v[0]?'CSMA/CAは、媒体を監視して送信機会を決め、衝突を避けるためのアクセス方式であり、携帯電話網の通信規格全体の名称ではない。':'MACは媒体アクセス制御という機能や階層を指す。LTEにもMACの階層があるが、MACという名称自体は携帯電話網の通信規格全体を表さない。')+(v[1]?'MAMはアプリケーションとその業務データを対象にした管理であり、無線通信規格ではない。':'MDMは端末の設定や利用などを対象にした管理であり、無線通信規格ではない。')+(v[2]?'SIPは通信セッションの開始・変更・終了などを制御するIETFのプロトコルである。3GPPのシステムで使われる場合があっても、SIP自体がMIMOを使う携帯電話無線規格の名称になるわけではない。':'VoIPはIPネットワークで音声を運ぶ技術の総称である。特定の携帯電話無線規格やアンテナ方式の名称とは異なる。'),
 };},
}];
