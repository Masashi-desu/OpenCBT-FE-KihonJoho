/** Unregistered source preparation only. Pure producer; no scripts/tests/UI/IO imports. */
import type{GeneratedBody,GenerationDefinition}from'./definition';import type{Block,Attribution}from'../types';import{DataError}from'../errors';
import{legacy2019NatSource as source,legacy2019NatFacts as facts,legacy2019NatNetworkProfiles,legacy2019NatPortProfiles,legacy2019NatProfiles}from'./legacy-2019-autumn-pm4-data';
function requireInput(ok:unknown,message='NAT_SOURCE_CONSTRAINT'):asserts ok{if(!ok)throw new DataError('PARAMETER_CONSTRAINT',message);}
export const units:any[]=facts.units;
export const reference=[0,0];
export function assertInput(v:unknown):asserts v is number[]{
 requireInput(Array.isArray(v)&&Object.getPrototypeOf(v)===Array.prototype&&v.length===2&&Reflect.ownKeys(v).length===3,'NAT_INPUT_ARITY');
 const slots=[0,1].map(i=>Object.getOwnPropertyDescriptor(v,String(i)));
 requireInput(slots.every(s=>s&&s.enumerable&&'value'in s),'NAT_INPUT_DATA_SLOTS');
 requireInput(v.every(n=>Number.isSafeInteger(n)&&!Object.is(n,-0))&&v[0]>=0&&v[0]<16&&v[1]>=0&&v[1]<6,'NAT_INPUT_DOMAIN');
}
export function condition(v:number[]){
 assertInput(v);const n=legacy2019NatNetworkProfiles[v[0]],p=legacy2019NatPortProfiles[v[1]],v4=(h:number)=>`192.168.0.${h}`,v6=(h:number)=>`fc00::${h}`,embed=(h:number)=>`64:ff9b::c0a8:${h.toString(16)}`;
 return {router4:v4(n.router4Host),server4:v4(n.server4Host),router6:v6(n.router6Host),client6:v6(n.client6Host),embeddedRouter:embed(n.router4Host),embeddedServer:embed(n.server4Host),serverPort:p.server,clientPort:p.client,mappedPort:p.mapped};
}
export const own:Attribution={origin:'original',sourceRefs:[],rightsRefs:['rights-original'],creatorIds:['codex']};
export const ref=(page:number,answer=false)=>({sourceId:`source-ipa-${source}-${answer?'ans':'qs'}`,locator:{section:`令和元年度 秋期 基本情報技術者試験 旧制度・午後 問4${answer?' 解答例':''}`,page,year:2019,period:'秋期',exam:'基本情報技術者試験',timeSlot:'午後',subject:'旧制度・午後',questionNumber:'4'}});
export const adapted:Attribution={origin:'adapted',sourceRefs:[20,21,22,23].map(p=>ref(p)),rightsRefs:[`rights-ipa-${source}`,'rights-original'],creatorIds:['codex']};
export const p=(text:string):Block=>({type:'paragraph',text});
export function packetData(v:number[]){const x=condition(v);return [
 {id:'outbound-v6',label:'IPv6パケット',values:[x.embeddedServer,String(x.serverPort),x.client6,String(x.clientPort)]},
 {id:'outbound-v4',label:'IPv4パケット',values:[{blank:'b'},String(x.serverPort),{blank:'c'},String(x.mappedPort)]},
 {id:'return-v4',label:'IPv4パケット',values:[{blank:'c'},String(x.mappedPort),{blank:'b'},String(x.serverPort)]},
 {id:'return-v6',label:'IPv6パケット',values:[x.client6,String(x.clientPort),{blank:'d'},String(x.serverPort)]}];}
export function packetAlt(v:number[]){const x=condition(v),f=units.find(u=>u.id==='figure-1'),names:Record<string,string>={client6:'IPv6機器',server4:'IPv4機器','outbound-v6':'送信するIPv6パケット','outbound-v4':'転送するIPv4パケット','return-v4':'返信のIPv4パケット','return-v6':'転送するIPv6パケット'};return `IPv6機器のIPアドレスは${x.client6}。NAT64ルータのIPv6のIPアドレスは${x.router6}，IPv4のIPアドレスは${x.router4}。IPv4機器のIPアドレスは${x.server4}。`+packetData(v).map(b=>b.label+'，'+b.values.map((a,i)=>f.packetFieldOrder[i]+' '+(typeof a==='object'?'空欄'+a.blank:a)).join('，')).join('。')+'。'+f.arrows.map((a:any)=>`${names[a.from]}から${names[a.to]}へ${a.label}`).join('。')+'。'+f.noteLiteral;}
export function fig(profile:string,v:number[],caption:string,alt:string):Block{return {type:'diagram',id:`diagram-${profile}`,rendererRef:{id:'renderer-source-figures',version:'1.0.0'},scene:{kind:'source_figure',profile,values:v},caption,alt,attribution:adapted};}
export function build(v:number[]):GeneratedBody{
 const x=condition(v),prompt:Block[]=[];
 for(const u of units){
  if(['subquestion-1-choices-heading','a-choices-heading','bcd-choices-heading'].includes(u.id))continue;
  if(u.id==='selection-notice'){prompt.push(fig('legacy-2019-autumn-pm4-nat-selection',[0],'選択した問題のマーク',u.runs.map((r:any)=>typeof r==='string'?r:'丸囲みの選').join('')));continue;}
  if(u.id==='heading'){prompt.push(p(u.text));continue;}
  if(u.id==='table-1'){prompt.push(fig('legacy-2019-autumn-pm4-nat-rewrite-table',[0],u.caption,u.rowGroups.map((g:any)=>g.label+'。'+g.rows.map((r:string[])=>r.join('，')).join('。')).join('。')));continue;}
  if(u.id==='subquestion-2'){prompt.push(fig('legacy-2019-autumn-pm4-nat-instruction',[0],'設問2',u.runs.map((r:any)=>typeof r==='string'?r:'空欄').join('')));continue;}
  if(u.id==='nat64-step1'){prompt.push(fig('legacy-2019-autumn-pm4-nat-dns64-statement',[0],'IPv6機器からIPv4機器へのアクセス (1)',u.text));continue;}
  if(u.id==='figure-1'){prompt.push(fig('legacy-2019-autumn-pm4-nat64-packets',v,u.caption,packetAlt(v)));continue;}
  requireInput(typeof u.text==='string');prompt.push(p(u.text));
 }
 const groups=facts.choiceGroups;const g1=groups.find((g:any)=>g.id==='sub1')! as {rows:string[]},ga=groups.find((g:any)=>g.id==='a')! as {rows:string[][]};
 const addresses=['192.168.0.0',x.router4,x.server4,'64:ff9b::',x.embeddedRouter,x.embeddedServer,'fc00::',x.router6,x.client6];
 const choices:Block[][]=[...g1.rows.map((t:string)=>[p(t)]),...ga.rows.map((r:string[])=>[{type:'table' as const,caption:'aに関する解答群',columns:['a1','a2','a3'],rows:[[...r]]}]),...addresses.map(t=>[p(t)])];
 const ids=(start:number,n:number)=>Array.from({length:n},(_,i)=>`choice-value-${start+i}`),shared=ids(11,9);
 const answerParts=[{id:'part-sub1',label:'設問1',choiceIds:ids(1,6)},{id:'part-a',label:'設問2 a',choiceIds:ids(7,4)},...['b','c','d'].map(id=>({id:`part-${id}`,label:`設問2 ${id}`,choiceIds:[...shared]}))];
 const correct=['choice-value-4','choice-value-10','choice-value-13','choice-value-12','choice-value-16'];
 const explanation=`独自解説。設問1は(2)だけ。LAN内から始める通信では，送信元のIPアドレスとポート番号に動的な対応を割り当て，返信を逆変換する。(1)の外部公開サービスと(3)の固定ポートによる相互通信は，あらかじめ対応を定める静的NATが適する。これは適性の比較であり，動的NATだけが通信できるという判定ではない。aはa1＝IPv6，a2＝IPv6，a3＝IPv4。本問のDNS64はIPv6機器へIPv6アドレスを返し，対応するIPv6アドレスがなくIPv4アドレスがあれば，12バイトのプレフィクスと4バイトのIPv4アドレスを結合して表す。bは${x.server4}。送信先${x.embeddedServer}の下位4バイトが示すIPv4機器のアドレスで，返信の送信元も同じである。cは${x.router4}。${x.client6}のポート${x.clientPort}と，ルータの${x.router4}のポート${x.mappedPort}を対応させ，返信はその逆対応で戻す。dは${x.embeddedServer}。返信の相手${x.server4}を，送信時と同じIPv6表現でIPv6機器へ示す。相手のポート${x.serverPort}は往復で保ち，返信先は${x.clientPort}へ戻す。アドレス末尾0を，マスクの指定なしに常にネットワークアドレスだと決め付けない。DNS64の配置とIP版の組合せは本問が示すモデルであり，全ネットワークでの配置を一律に定めるものではない。技術上の補足として，実運用のWell-Known Prefixにはprivate IPv4を表現・変換しない制約がある。本問は与えられた教材モデルで解き，この制約を暗黙に加えて正答を通信不可へ変更しない。`;
 const distractorExplanation=`共通の解答群では，192.168.0.0は図に指定された相手やルータのアドレスとは異なる。${x.embeddedRouter}はルータのIPv4側のアドレスを埋め込んだ表現であり，相手を示す${x.embeddedServer}と取り違えない。64:ff9b::は相手のIPv4アドレスを埋め込んだ値ではなく，fc00::も図で指定された機器のアドレスとは異なる。${x.router6}と${x.client6}はIPv6側のルータと機器のアドレスなので，IPv4パケットのb，cには入らず，返信元であるIPv4機器の表現dとも役割が異なる。aの他の組合せは，本問でIPv6機器が必要とするIP版と，その表現の合成元になるIPv4の役割を取り違えている。`;
 return {prompt,choices,answerParts,partAnswers:answerParts.map((a,i)=>({kind:'choice',partId:a.id,choiceId:correct[i]})),explanation:explanation+distractorExplanation};
}

export const legacy2019AutumnNatDefinitions:GenerationDefinition[]=[{source,title:'NATとNAT64によるアドレス及びポート番号の変換',version:'3.2.0',fields:[{name:'networkProfile',minimum:0,maximum:15},{name:'portProfile',minimum:0,maximum:5}],reference:[0,0],sourceAnswer:'設問1エ／設問2 aエ bウ cイ dカ',notes:'QS20–23全31単位・19固有候補37参照5欄と元の問い/注記/tupleを保持。IPv6機器→NAT64→IPv4機器の役割固定。16endpoint×6port=96条件、16具体的正答意味、1役割tuple。portは正答IPを変えない。私有IPv4/WKPは与えた教材モデルと実運用を区別する。',build}];
export function legacy2019NatFigureAllowed(profile:string,values:unknown){if(!legacy2019NatProfiles.includes(profile as typeof legacy2019NatProfiles[number]))return false;try{if(profile==='legacy-2019-autumn-pm4-nat64-packets')assertInput(values);else{requireInput(Array.isArray(values)&&Object.getPrototypeOf(values)===Array.prototype&&Reflect.ownKeys(values).length===2&&values.length===1);const slot=Object.getOwnPropertyDescriptor(values,'0');requireInput(slot&&slot.enumerable&&'value'in slot&&slot.value===0&&!Object.is(slot.value,-0));}return true;}catch{return false;}}
