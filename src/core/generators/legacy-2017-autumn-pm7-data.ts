import {DataError} from '../errors';
export const legacy2017AutumnPm7Pages=[33,34,35,36,37] as const;
export const legacy2017AutumnPm7Ids=['SYS901','SYS902','SYS903','SYS904','SYS905','SYS906','SYS907','SYS908'] as const;
export function legacy2017AutumnPm7Variant(values:number[]){if(!Array.isArray(values)||Object.getOwnPropertyNames(values).sort().join(',')!=='0,length'||Object.getOwnPropertySymbols(values).length)throw new DataError('GENERATION_PARAMETERS','秋午後問7の条件は整数1個です');const d=Object.getOwnPropertyDescriptor(values,'0');if(!d||!Object.hasOwn(d,'value')||!Number.isSafeInteger(d.value)||d.value<0||d.value>3)throw new DataError('GENERATION_PARAMETERS','秋午後問7の条件は0〜3です');return d.value as number;}
export function legacy2017AutumnPm7Model(values:number[]){const v=legacy2017AutumnPm7Variant(values),wage=[1400,1200,1600,1800][v],numerator=wage/200,before=((200+18)*5+18*10)*wage*240/60000,after=3*5*wage*240/60000,annual=before-after,costs=[5800,6200,1200,12400,2750,4300,1630,1800],benefits=[4800,7320,670,annual,1640,520,1280,2160],required=[true,true,false,true,false,false,false,false],sum=(ids:number[],xs:number[])=>ids.reduce((s,i)=>s+xs[i],0),base=[0,1,3,7],branch905=[...base,4],branch907=[...base,6,2];return {v,wage,numerator,before,after,annual,costs,benefits,required,budget:30000,base,cost905:sum(branch905,costs),benefit905:sum(branch905,benefits),cost907:sum(branch907,costs),benefit907:sum(branch907,benefits)};}
export const legacy2017AutumnPm7Format=(n:number)=>n.toLocaleString('en-US');
export function legacy2017AutumnPm7Banks(values:number[]){const m=legacy2017AutumnPm7Model(values),scale=(n:number)=>n*m.numerator/7;return {
 ab:['増加する','減少するがゼロにならない','不要になる','変わらない'],
 c:[[6608,84],[6608,6524],[7028,6524],[7112,84],[7112,7028]].map(r=>r.map(scale)),
 d:['SYS903もSYS907も採用できる','SYS903もSYS907も採用できない','SYS903は採用できるが，SYS907は採用できない','SYS907は採用できるが，SYS903は採用できない'],
 e:['SYS903もSYS905も採用できる','SYS903もSYS905も採用できない','SYS903は採用できるが，SYS905は採用できない','SYS905は採用できるが，SYS903は採用できない'],
 f:['SYS903とSYS905','SYS903とSYS907','SYS905','SYS907'],
 };}
export const legacy2017AutumnPm7ConditionRows=(wage:number)=>[
 ['注文に対して提出される注文請書枚数（枚／日）',200,200],
 ['注文請書の誤りの発生枚数（枚／日）',18,3],
 ['注文請書と注文書との目視での照合及び再照合の作業に要する時間（分／枚）',5,0],
 ['誤りが見つかった注文請書の再提出の依頼作業に要する時間（分／枚）',10,5],
 ['作業に要する人件費（円／時間）',wage,wage],
] as const;
export function legacy2017AutumnPm7Units(values:number[]){const m=legacy2017AutumnPm7Model(values),fmt=legacy2017AutumnPm7Format;return {
 selection:'選択した問題は，選択欄の（選）をマークしてください。マークがない場合は，採点されません。',
 instruction1:'設問1　システム要件を実現（以下，システム化という）するための開発費と年間効果の試算に関する次の記述中の［ ］に入れる正しい答えを，解答群の中から選べ。ここで，c1とc2に入れる答えは，cに関する解答群の中から組合せとして正しいものを選ぶものとする。',
 estimation:'(3) 表1の将来値を設定するに当たり，注文請書と注文書との目視での照合及び再照合の作業に要する時間は，システム化によって［a］と想定した。また，仕入先がWebを介して注文書の確認と注文請書の送信を行うことによって，注文請書の誤りの発生枚数は［b］と想定した。1年当たりの稼働日数を240日とすると，現状で注文請書の確認，再提出依頼及び再照合の作業に要する年間費用は［c1］千円であり，システム化された場合は［c2］千円となって，この差額が年間効果となる。',
 instruction2:'設問2　開発費と年間効果の評価に関する次の記述中の［ ］に入れる正しい答えを，解答群の中から選べ。',
 case905:`① SYS905を採用したとき，開発費の予算を考えると［d］。この場合，開発費の総額は${fmt(m.cost905)}千円となり，年間効果は${fmt(m.benefit905)}千円となる。`,
 case907:`② 一方，SYS907を採用したとき，開発費の予算を考えると［e］。この場合，開発費の総額は${fmt(m.cost907)}千円となり，年間効果は${fmt(m.benefit907)}千円となる。`,
 decision:'(1)，(2)の評価の結果，開発費が予算に収まり，年間効果を最大にするには，要望要件はSYS908に加えて［f］を採用すればよい。',
 };}
export const legacy2017AutumnPm7Profiles=[
 'legacy-2017-autumn-pm7-selection','legacy-2017-autumn-pm7-instruction1','legacy-2017-autumn-pm7-table1','legacy-2017-autumn-pm7-estimation','legacy-2017-autumn-pm7-table2','legacy-2017-autumn-pm7-bank-ab','legacy-2017-autumn-pm7-bank-c','legacy-2017-autumn-pm7-instruction2','legacy-2017-autumn-pm7-scatter','legacy-2017-autumn-pm7-case905','legacy-2017-autumn-pm7-case907','legacy-2017-autumn-pm7-decision','legacy-2017-autumn-pm7-bank-d','legacy-2017-autumn-pm7-bank-e','legacy-2017-autumn-pm7-bank-f',
] as const;
export function legacy2017AutumnPm7Figure(profile:string,values:number[]){const model=legacy2017AutumnPm7Model(values);if(!(legacy2017AutumnPm7Profiles as readonly string[]).includes(profile))throw new DataError('SOURCE_FIGURE','秋午後問7の未登録描画です');const kind=profile.slice('legacy-2017-autumn-pm7-'.length),banks=legacy2017AutumnPm7Banks(values),units=legacy2017AutumnPm7Units(values);const caption=kind==='table1'?'表1　年間効果を試算するための条件':kind==='table2'?'表2　システム要件に対する年間効果の試算と分類の結果':kind==='scatter'?'図1　要望要件に分類したシステム要件の年間効果と効果率':kind.startsWith('bank-')?kind==='bank-ab'?'a，bに関する解答群':kind.slice(5)+'に関する解答群':units[kind as keyof typeof units];let alt=caption;
 if(kind==='table1')alt+='。試算条件/現状値/将来値。'+legacy2017AutumnPm7ConditionRows(model.wage).map(r=>r.join('：')).join('。');
 if(kind==='table2')alt+='。単位 千円。'+legacy2017AutumnPm7Ids.map((id,i)=>id+'：'+(i===3?'仕入先からの注文請書を購買管理システムで処理できるようにする':'システム要件は網掛けで非表示')+'，開発費'+model.costs[i]+'，年間効果'+(i===3?'網掛けで非表示':model.benefits[i])+'，'+(model.required[i]?'必須要件':'要望要件')).join('。')+'。注記 網掛けの部分は表示していない。';
 if(kind==='scatter')alt+='。横軸は年間効果（千円）0〜3000，500刻みで0〜2500の数値を表示。縦軸は効果率0.00〜1.40，0.20刻み。5点のうちSYS906とSYS908の名称だけ表示，他3点の名称は網掛けで非表示。注記 網掛けの部分は表示していない。';
 if(kind.startsWith('bank-')){const key=kind.slice(5) as keyof typeof banks;alt+='。'+banks[key].map((x,i)=>'アイウエオ'[i]+' '+(Array.isArray(x)?x.map(legacy2017AutumnPm7Format).join('，'):x)).join('。');}
 return {kind,caption,alt,model,banks,units};}
