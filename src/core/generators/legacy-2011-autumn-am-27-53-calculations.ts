import { figure,p,strings } from './definition';
import { finite2011AutumnAm2753 as finite, grouped, original } from './legacy-2011-autumn-am-27-53-shared';
import { dummy,multiplicities,multiplicityAt,orderAlt,profiles2011AutumnAm2753 as profiles,projectAlt,projectAt,projectCases,projectEdges,relationAlt } from './legacy-2011-autumn-am-27-53-figures';

const checks=[
  {question:original(28).prompt,answer:3,reason:'注文日の文字列が日付形式に合うだけでは足りず，入力日との前後関係と営業日という業務条件を確認するので論理チェックである。'},
  {question:'次のような注文データが入力されたとき，同じ伝票番号が既に登録済みかどうかを検査するために行うチェックはどれか。',answer:1,reason:'登録済みの伝票番号と突き合わせ，同じ値が既にあるかを調べるので重複チェックである。'},
  {question:'次のような注文データが入力されたとき，注文日が所定の西暦4桁，月2桁，日2桁を続けた8桁の数字という文字の並びに従うかどうかを検査するために行うチェックはどれか。',answer:2,reason:'日付の文字の種類・桁数・並びという書式を調べるのでフォーマットチェックである。'},
  {question:'次のような注文データが入力されたとき，同じ日の伝票番号が受付順に1ずつ増えているかどうかを検査するために行うチェックはどれか。',answer:0,reason:'同日の伝票番号を直前の伝票番号と比較して連続した順番になっているか調べるのでシーケンスチェックである。'},
];
export const orderRecord=finite(28,'注文データの検査条件',checks.length,
  '注文データの見出し・型・列順と四つの検査名を固定し，営業日，既登録，書式，連番のどの条件を照合するか変える。',index=>{
    const {question,answer,reason}=checks[index];
    return {prompt:[p(question),figure(profiles.order,[0],'注文データ',orderAlt([0]))],choices:strings(original(28).choices),correctIndex:answer,
      explanation:reason+' シーケンスは順番，重複は同じ値の再出現，フォーマットは書式，論理は業務上の整合性を検査する。'};
  });

const recordings=[[11_000,512],[12_000,480],[10_000,384],[16_000,768]] as const;
export const audio=finite(29,'標本化回数・メモリ容量',recordings.length,
  '8ビットを1バイトに換算し，10進容量，1分60秒，記録できる最大の整数分を維持。原候補と同じ倍率の誤答（容量の桁違い，8ビットを8バイトと誤る，使用量を8割と誤る）を保つ。',index=>{
    const [samples,capacity]=recordings[index], bytes=capacity*1_000_000, perMinute=samples*60;
    const correct=Math.floor(bytes/perMinute);
    const choices=[10,8,1,.8].map(factor=>String(Math.floor(bytes/(perMinute*factor))));
    const prompt=index===0?original(29).prompt:'音声のサンプリングを1秒間に'+grouped(samples)+
      '回行い，サンプリングした値をそれぞれ8ビットのデータとして記録する。このとき，'+capacity+
      '×10⁶バイトの容量をもつフラッシュメモリに記録できる音声の長さは，最大何分か。';
    return {prompt:[p(prompt)],choices:strings(choices),correctIndex:2,
      explanation:'1回の標本は8ビット＝1バイトであり，1分間には'+grouped(samples)+'×60＝'+grouped(perMinute)+
        'バイト必要となる。'+grouped(bytes)+'バイトをこれで割り，容量を超えない最大の整数分を取ると'+correct+'分である。'};
  });

const expressions=[
  {text:'R−(R−S)',description:'Rだけに属する要素をRから除くと，RとSの両方に属する要素だけが残る。',correct:0},
  {text:'R∪(S−R)',description:'Rの全要素と，Sだけに属する要素を合わせると，R又はSに属する全要素になる。',correct:1},
  {text:'S−(S−R)',description:'Sだけに属する要素をSから除くと，SとRの両方に属する要素だけが残る。',correct:0},
  {text:'S∪(R−S)',description:'Sの全要素と，Rだけに属する要素を合わせると，R又はSに属する全要素になる。',correct:1},
];
export const setAlgebra=finite(32,'関係演算で差集合を用いる式',expressions.length,
  '同じ属性・一部一致の前提，二つの演算，同じ記号定義と四候補を保持し，差で除く集合又は追加する集合を切り替える。',index=>{
    const e=expressions[index], source=original(32);
    return {prompt:[p(source.prompt.replace('R−(R−S)',e.text))],choices:strings(source.choices),correctIndex:e.correct,
      explanation:e.description+' よって'+source.choices[e.correct]+'に等しい。直積は要素の対を作る操作であり，商は除数側の全要素に対応する部分を求める操作である。'};
  });

export const multiplicity=finite(33,'納品と請求の関連端の多重度',multiplicities.length,
  '関連端の位置，納品・請求の2クラス，支払・実行時刻と多重度の区別を保持し，端の制約と件数を問う候補を切り替える。',index=>{
    const [delivery,billing]=multiplicityAt([index]);
    const source=original(33), choices=[...source.choices];
    if(index===2) choices[0]='納品があっても請求しなくてよい。';
    if(index===3) choices[3]='1件の請求が複数回の納品に対応する。';
    const answer=billing.endsWith('*')?0:3;
    const deliverText=delivery.endsWith('*')?'1件の請求に対応する納品は1回以上で，複数回をまとめられる。':'1件の請求に対応する納品は1回である。';
    const billText=billing.endsWith('*')?'1回の納品に複数の請求を対応させられる。':billing.startsWith('0')?'1回の納品に対応する請求は0件又は1件。':'1回の納品に対応する請求はちょうど1件。';
    return {prompt:[p(source.prompt),figure(profiles.relation,[index],'納品と請求のデータモデル',relationAlt([index]))],
      choices:strings(choices),correctIndex:answer,
      explanation:'UML（Unified Modeling Language、統一モデリング言語）の関連端の多重度は，反対側の1件から見た対応件数を表す。'+
        deliverText+billText+' この図は支払での相殺や処理の同時実行を規定していない。'};
  });

const roles=['物理層','データリンク層','ネットワーク層'] as const;
const orderByCase=[[0,1,2],[1,0,2],[1,2,0],[0,2,1]] as const;
export const osiLayers=finite(37,'中継装置を答える層の順序',orderByCase.length,
  '三層それぞれの装置を指定した順に答える元形式。層の並びを本文で変え，候補内の装置の並びは原資料どおり。',index=>{
    const requested=orderByCase[index], devices=['リピータ','ブリッジ','ルータ'];
    const originalRow=original(37);
    const prompt=index===0?originalRow.prompt:'OSI基本参照モデルの各層で中継する装置を，'+requested.map(i=>roles[i]+'で中継する装置').join('，')+'の順に並べたものはどれか。';
    const answer=requested.map(i=>devices[i]).join('，');
    return {prompt:[p(prompt)],choices:strings(originalRow.choices),correctIndex:originalRow.choices.indexOf(answer),
      explanation:'OSI（Open Systems Interconnection、開放型システム間相互接続）基本参照モデルでは，物理層で信号を中継するのはリピータ，データリンク層でフレームを中継するのはブリッジ，ネットワーク層でパケットを中継するのはルータである。指定順では'+answer+'となる。'};
  });

const designs=[
  original(45).details,
  '〔モジュール設計書（抜粋）〕\n同じ在庫データを扱う入庫登録，出庫登録，在庫照会の機能を備える。機能ごとに独立した入口点を持ち，呼出側は必要な入口点を直接指定する。',
  '〔モジュール設計書（抜粋）〕\n受注明細を読み込み，得られた明細を次の金額集計へ渡し，集計結果を参照して集計表を出力する。全処理をこの順に実行する。',
  '〔モジュール設計書（抜粋）〕\n相互に無関係な帳票のページ番号付与，時計の時刻表示，画像の縦横比計算を，同じ実装担当者が作業するという理由だけで一つにまとめている。',
];
export const cohesion=finite(45,'モジュールの機能同士の関係',designs.length,
  '設計書抜粋と強度・根拠・見直し方針の四候補を維持し，選択コード，共通データと独立入口，逐次受渡し，無関係な同居を検査する。',index=>{
    const row=original(45);
    const answers=[3,1,2,0], answersText=[
      '関連する複数の処理からコードによって一つを選択するので論理的強度である。機能別の分割又は独立した入口点によって処理コードの変更の影響を抑えられる。',
      '同一のデータに対する機能ごとに独立した入口点があるので情報的強度である。単一の制御コードでいずれかを選ぶ構造とも，各処理を逐次実行する構造とも異なる。',
      '読み込んだデータや集計結果を後続機能へ渡して順に実行するので連絡的強度である。入口点を機能ごとに使い分けたり，パラメタで処理を一つだけ選択したりする仕様ではない。',
      '処理の目的やデータに共通性がなく担当者が同じという理由だけなので暗合的強度である。機能ごとに責務を分けると相互に無関係な変更を切り離せる。',
    ];
    return {prompt:[p(row.prompt),p(designs[index])],choices:strings(row.choices),correctIndex:answers[index],explanation:answersText[index]};
  });

export const earliest=finite(51,'各作業の所要日数',projectCases.length,
  '結合点1〜6，作業A〜H，破線のダミー，作業名・日数の凡例と結合点5を保つ。0日開始で整数日，4〜7の昇順四候補を固定する。',index=>{
    const times=projectAt([index]), edges=projectEdges.map(({from,to},i)=>({from:Number(from),to:Number(to),days:Number(times[i])}));
    edges.push({...dummy,days:0});
    const arrivals=[0,0,0,0,0,0,0];
    for(const {from,to,days} of edges.sort((left,right)=>left.to-right.to))
      arrivals[to]=Math.max(arrivals[to],arrivals[from]+days);
    const through2=arrivals[2]+times[4], through3=arrivals[3]+times[5], through4=arrivals[4];
    const row=original(51);
    return {prompt:[p(row.prompt),figure(profiles.project,[index],'アローダイアグラム',projectAlt([index]))],
      choices:strings(row.choices),correctIndex:row.choices.indexOf(String(arrivals[5])),
      explanation:'各結合点はそこへ向かう全作業の完了を待つので，到達時刻の最大を取る。結合点2は'+arrivals[2]+
        '日，結合点3は'+arrivals[3]+'日，結合点4は'+arrivals[4]+'日。結合点5への到達はEで'+through2+
        '日，Fで'+through3+'日，結合点4からのダミー作業（所要0日）で'+through4+'日なので，最早結合点時刻は第'+arrivals[5]+'日である。'};
  });

const functionTypes=['外部入力','外部出力','内部論理ファイル','外部インタフェースファイル','外部照会'];
const weights=[4,5,10,7,4];
const counts=[[1,2,1,0,0],[3,2,0,2,0],[2,4,2,0,0],[3,4,0,4,0]] as const;
export const functionPoints=finite(52,'ファンクションタイプ別の個数',counts.length,
  '5行の表，個数と重み付け係数の列，補正係数0.75，0個と計算に使う3種類を保持。補正前・誤加算・誤除算の原候補相当の値も整数にする。',index=>{
    const pieces=counts[index].map((count,i)=>count*weights[i]);
    const raw=pieces.reduce((sum,value)=>sum+value,0), adjusted=raw*3/4;
    return {prompt:[p(original(52).prompt),{type:'table',caption:'機能と特性',captionPresentation:'accessible',
        columns:['ユーザファンクションタイプ','個数','重み付け係数'],
        rows:functionTypes.map((label,i)=>[label,String(counts[index][i]),String(weights[i])])}],
      choices:strings([adjusted,raw,raw*5/4,raw*4/3].map(String)),correctIndex:0,
      explanation:'各タイプの個数に重みを掛けた値は表の順に'+pieces.join('，')+'で，合計は'+raw+
        '。個数が0のタイプは合計に寄与しない。合計に複雑さの補正係数0.75を掛けるので，ファンクションポイント（FP、Function Point）値は'+adjusted+'である。'};
  });
