/** Reviewed literal facts. No imports of production generation/calculation. */
export const developmentPortFacts=[{server:80,pcMinimum:1024},{server:443,pcMinimum:1024},{server:80,pcMinimum:49152}];
export const developmentPlacementFacts=[
 [
  {text:'WebサーバとデータベースサーバをDMZに設置する。',web:'DMZ',database:'DMZ'},
  {text:'Webサーバとデータベースサーバを内部セグメントに設置する。',web:'internal',database:'internal'},
  {text:'WebサーバをDMZに、データベースサーバを内部セグメントに設置する。',web:'DMZ',database:'internal'},
  {text:'Webサーバを外部セグメントに、データベースサーバをDMZに設置する。',web:'external',database:'DMZ'},
 ],
 [
  {text:'Webサーバとデータベースサーバを外部セグメントに設置する。',web:'external',database:'external'},
  {text:'Webサーバとデータベースサーバを内部セグメントに設置する。',web:'internal',database:'internal'},
  {text:'WebサーバをDMZに、データベースサーバを内部セグメントに設置する。',web:'DMZ',database:'internal'},
  {text:'Webサーバを外部セグメントに、データベースサーバをDMZに設置する。',web:'external',database:'DMZ'},
 ],
 [
  {text:'WebサーバとデータベースサーバをDMZに設置する。',web:'DMZ',database:'DMZ'},
  {text:'Webサーバを内部セグメントに、データベースサーバを外部セグメントに設置する。',web:'internal',database:'external'},
  {text:'WebサーバをDMZに、データベースサーバを内部セグメントに設置する。',web:'DMZ',database:'internal'},
  {text:'Webサーバを外部セグメントに、データベースサーバを内部セグメントに設置する。',web:'external',database:'internal'},
 ],
];
export const developmentPurposeFacts=[
 {text:'Webサーバで稼働しているサービスを列挙して、不要なサービスが稼働していないことを確認する。',method:'network-service-enumeration',observed:'応答するポートと稼働サービス'},
 {text:'Webサーバの利用者IDの管理状況を運用者に確認して、情報セキュリティポリシからの逸脱がないことを調べる。',method:'operator-management-interview',observed:'運用者のID管理手順'},
 {text:'Webサーバのアクセス履歴を解析して、不正利用を検出する。',method:'recorded-access-log-analysis',observed:'記録されたアクセス履歴'},
 {text:'正規の利用者IDでログインし、Webサーバのコンテンツを直接確認して、コンテンツの脆弱性を検出する。',method:'authenticated-content-inspection',observed:'認証後のWebコンテンツ'},
];
export const developmentMethodFacts=[{name:'ポートスキャナ',purpose:'network-service-enumeration'},{name:'アクセスログ解析ツール',purpose:'recorded-access-log-analysis'}];
export const developmentArtifactFacts=[
 [{text:'画面レイアウト',role:'external-user-interface'},{text:'システム開発計画',role:'development-planning'},{text:'物理データベース仕様',role:'physical-storage-implementation'},{text:'プログラムの流れ図',role:'program-internal-logic'}],
 [{text:'帳票レイアウト',role:'external-user-interface'},{text:'開発要員計画',role:'development-planning'},{text:'物理インデックス仕様',role:'physical-storage-implementation'},{text:'モジュールの内部構造図',role:'program-internal-logic'}],
 [{text:'外部システムとの入出力項目仕様',role:'external-system-interface'},{text:'開発作業の工数見積り',role:'development-planning'},{text:'物理ファイル配置仕様',role:'physical-storage-implementation'},{text:'サブルーチンの詳細フロー',role:'program-internal-logic'}],
];
export const developmentConceptFacts=[
 [{text:'仮想化、構造化、投影、クラス',concepts:['仮想化','構造化','投影','クラス']},{text:'正規化、関数従属、射影、クラス',concepts:['正規化','関数従属','射影','クラス']}],
 [{text:'具体化、構造化、連続、クラス',concepts:['具体化','構造化','連続','クラス']},{text:'具体化、構造化、反復、クラス',concepts:['具体化','構造化','反復','クラス']}],
 [{text:'正規化、カプセル化、分割、クラス',concepts:['正規化','カプセル化','分割','クラス']},{text:'索引付け、カプセル化、結合、クラス',concepts:['索引付け','カプセル化','結合','クラス']}],
 [{text:'抽象化、カプセル化、継承、クラス',concepts:['抽象化','カプセル化','継承','クラス']}],
];
export const developmentBasicOOFacts={抽象化:'対象の共通する性質を取り出す',カプセル化:'データと操作をまとめ内部を隠す',継承:'既存クラスの性質を受け継ぐ',クラス:'共通する構造と振舞いを定める'};

/** Concrete data execution, not the producer's bitmask representation. All
 * cases reach both decisions; neither A nor B depends on the preceding X. */
export function developmentCoverageReference(multiple:boolean){
 const cases:{x:number;a:number;b:number;first:boolean;left:boolean;right:boolean;second:boolean;afterFirst:number;afterSecond:number;visited:string[];requirements:string[]}[]=[];for(const x of[0,2])for(const a of[0,2])for(const b of[0,1]){
  const first=x>1,left=a===2,right=b===0,second=left||right,afterFirst=first?x/2:x,afterSecond=second?afterFirst+1:afterFirst;
  const requirements=multiple?[`first:${first}`,`compound:${left},${right}`]:[`first:${first}`,`second:${second}`];
  cases.push({x,a,b,first,left,right,second,afterFirst,afterSecond,visited:['first','second'],requirements});
 }
 const required=new Set(cases.flatMap(c=>c.requirements));let minimum=Infinity;const witnesses:number[][]=[];
 for(let mask=1;mask<2**cases.length;mask++){
  const chosen=cases.map((_,i)=>i).filter(i=>(mask>>i)&1),covered=new Set(chosen.flatMap(i=>cases[i].requirements));
  if([...required].every(r=>covered.has(r))){if(chosen.length<minimum){minimum=chosen.length;witnesses.length=0;}if(chosen.length===minimum)witnesses.push(chosen);}
 }
 return{cases,required:[...required],minimum,witnesses};
}

/** Fixed original directed topology: the two zero-duration edges point down.
 * Enumerate complete paths and derive earliest events independently. */
export const developmentActivityTopology=[
 ['A',0,1],['B',1,2],['C',1,3],['D',1,4],['E',2,5],['F',3,5],['G',4,5],['H',5,6],['dummy1',2,3],['dummy2',3,4],
] as const;
export const developmentActivityVectors=[
 [30,5,30,20,40,25,30,30],
 [25,5,30,20,40,25,30,30],
 [35,5,30,20,40,25,30,30],
 [30,5,30,20,40,25,30,40],
];
export function developmentActivityReference(values:number[]){
 const weight=(name:string)=>name.startsWith('dummy')?0:values['ABCDEFGH'.indexOf(name)],paths:{tasks:string[];total:number}[]=[];
 const walk=(node:number,tasks:string[],total:number)=>{if(node===6){paths.push({tasks,total});return;}for(const[name,from,to]of developmentActivityTopology)if(from===node)walk(to,[...tasks,name],total+weight(name));};walk(0,[],0);
 const earliest=Array<number>(7).fill(0);for(let node=1;node<7;node++)earliest[node]=Math.max(...developmentActivityTopology.filter(([, ,to])=>to===node).map(([name,from])=>earliest[from]+weight(name)));
 return{paths,earliest,duration:Math.max(...paths.map(p=>p.total))};
}

export const developmentPrimaryFactReview=[
 {url:'https://www.rfc-editor.org/rfc/rfc6335.html',published:'2011-08',checkedOn:'2026-10-20',read:'web全文抽出/3と6、lines305–346/550–566',fact:'送受信ポートとアドレスの組が通信を区別する機能、0–1023/1024–49151/49152–65535の区分。原のPC側1024以上を全OSの既定値へ一般化しない。RFC本文や表は転載しない。'},
 {url:'https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-115.pdf',published:'2008-09',checkedOn:'2026-10-20',read:'webPDF抽出3.2/物理18、4.2/物理26–27',fact:'ポート/サービス列挙と記録済みログの検査対象の違い。番号だけで実サービスを断定せず、サービス確認には応答等の追加確認がある。ポートスキャンだけでコンテンツ脆弱性を実証したことにしない。本文・図表は転載しない。'},
];
