import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { legacy2014SpringAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2014-spring-am-54-80';
import { legacy2014SpringAm5480Figures as figures } from '../../../src/core/generators/legacy-2014-spring-am-54-80-figures';
import { legacy2014SpringAm5480Renderers as renderers } from '../../../src/ui/Legacy2014SpringAm5480Figures';
import review from '../../fixtures/legacy-2014-spring-am-54-80-review.json';

const definition=(n:number)=>definitions.find(item=>item.source==='2014h26h-fe-am-'+n)!;
const count=(n:number)=>definition(n).fields[0].maximum+1;
const question=(n:number,index:number)=>definition(n).build([index]);
type Body=ReturnType<typeof question>;
const prompt=(body:Body)=>body.prompt.flatMap(block=>block.type==='paragraph'?[block.text]:[]).join('\n');
const choices=(body:Body)=>body.choices.map(([block])=>{
  assert(block.type==='paragraph');return block.text;
});
const choice=(body:Body)=>choices(body)[body.correctIndex!];
function unique(body:Body,oracle:(option:string,index:number)=>boolean){
  assert.deepEqual(choices(body).filter(oracle),[choice(body)]);
}
function figure(body:Body){
  const block=body.prompt.find(item=>item.type==='diagram');
  assert(block?.type==='diagram'&&block.scene.kind==='source_figure');
  return { ...block,scene:block.scene };
}
function table(body:Body){
  const block=body.prompt.find(item=>item.type==='table');
  assert(block?.type==='table');
  return block;
}
const integer=(value:string)=>Number(value.replaceAll(',',''));
const sum=(values:readonly number[])=>values.reduce((a,b)=>a+b,0);

test('2014春 午前問54〜80の基準原文・公式解答と全132条件を照合する',()=>{
  assert.deepEqual(definitions.map(item=>Number(item.source.split('-').at(-1))),review.records.map(item=>item.number));
  assert.deepEqual(review.holds,[56,61]);
  let total=0;
  for(const {number,key,statementHash} of review.records){
    const item=definition(number),original=item.build([0]);
    assert.equal(item.sourceAnswer,key);
    assert.equal('アイウエ'[original.correctIndex!],key);
    assert.deepEqual(item.reference,[0]);
    const hash=createHash('sha256').update(JSON.stringify([prompt(original),choices(original)])).digest('hex');
    assert.equal(hash,statementHash,'問'+number);
    const stems=new Set<string>(),answers=new Set<string>();
    for(let index=0;index<count(number);index++){
      const body=item.build([index]);
      assert.equal(new Set(choices(body)).size,4);
      assert.equal(body.contexts,undefined);
      assert(body.explanation.length>20);
      stems.add(JSON.stringify(body.prompt));
      answers.add(choice(body));
      total++;
    }
    assert.equal(stems.size,count(number),'問'+number);
    assert(answers.size>=2,'問'+number);
    for(const invalid of [[],[-1],[count(number)],[0,1],[0.1],[NaN],Array(1)])assert.throws(()=>item.build(invalid));
  }
  assert.equal(total,132);
});

test('2014春 午前問54は導入・教育を含む管理基準から工数を独立検算する',()=>{
  for(let index=0;index<count(54);index++){
    const body=question(54,index),text=prompt(body);
    const size=Number(/(\d+)FP（/.exec(text)![1]);
    const setup=Number(/工数が(\d+)人月/.exec(text)![1]);
    const rate=Number(/工数の(\d+)％/.exec(text)![1]);
    const perMonth=Number(/当たり(\d+)FP/.exec(text)![1]);
    assert.equal(size%perMonth,0);
    const setupCost=(size/perMonth+setup)*rate;
    unique(body,option=>(Number(option)-setup)*100*perMonth===100*size+setupCost*perMonth);
    const wrong=[size/perMonth+setup*rate/100,size/perMonth+setup,(size/perMonth)*rate/100+size/perMonth+setup];
    assert(choices(body).filter(option=>option!==choice(body)).every(option=>wrong.includes(Number(option))));
  }
});

test('2014春 午前問57は月間営業時間と可用性の境界を分単位で検算する',()=>{
  for(let index=0;index<count(57);index++){
    const body=question(57,index),text=prompt(body);
    const days=Number(/営業日は(\d+)日/.exec(text)![1]);
    const [_,start,end]=/午前(\d+)時から午後(\d+)時/.exec(text)!;
    const threshold=integer(/(\d+\.\d)％/.exec(text)![1].replace('.',''));
    const minutes=days*(12+Number(end)-Number(start))*60;
    assert.match(text,/サービス計画停止は行わない/);
    unique(body,option=>{
      const downtime=Number(option)*60;
      return Math.round((minutes-downtime)*1000)===threshold*minutes;
    });
    const known=Number(choice(body))*60;
    assert((minutes-known-1)*1000<threshold*minutes);
    const shown=choices(body).map(Number);
    assert.deepEqual(shown,[...shown].sort((a,b)=>a-b));
    assert(choices(body).every(value=>/^\d+\.\d$/.test(value)));
  }
});

test('2014春 午前問62は列の重み付けと案の順序を独立検算する',()=>{
  const winners=new Set<string>();
  for(let index=0;index<count(62);index++){
    const body=question(62,index),visual=figure(body);
    const inputs=visual.alt.split('\n').slice(1).map(line=>line.split('｜').slice(1).map(Number));
    const scores=Array.from({length:4},(_,plan)=>sum(inputs.flatMap(([weight,...points])=>
      Array<number>(weight).fill(points[plan]))));
    unique(body,(_,i)=>scores.every((value,j)=>j===i||scores[i]>value));
    assert.deepEqual(choices(body),['案1','案2','案3','案4']);
    winners.add(choice(body));
  }
  assert.equal(winners.size,4);
});

test('2014春 午前問69の需要量は三つの価格を使った交差積で一意になる',()=>{
  for(let index=0;index<count(69);index++){
    const body=question(69,index),text=prompt(body);
    const values=[...text.matchAll(/設定価格を([\d,]+)円にすると，需要は([\d,]+|［a］)個/g)];
    assert.equal(values.length,3);
    const [high,low,probe]=values.map(([,price])=>integer(price));
    const known=integer(values[1][2]);
    assert.equal(values[0][2],'0');
    assert(high>probe&&probe>low);
    unique(body,option=>integer(option)*(high-low)===known*(high-probe));
    const selected=choices(body).map(integer);
    assert.deepEqual(selected.slice(1).map((n,i)=>n-selected[i]),[5000,5000,5000]);
  }
});

test('2014春 午前問71は製造数の全実行可能範囲から最大利益を求める',()=>{
  for(let index=0;index<count(71);index++){
    const body=question(71,index),text=prompt(body),form=table(body);
    assert.match(text,/複数種類の製品を同時に並行して組み立てることはできない/);
    assert.deepEqual(form.columns,['','製品X','製品Y','製品Z']);
    const capacity=Number(/月間(\d+)時間/.exec(text)![1])*60;
    const [profits,times,limits]=form.rows.map(row=>row.slice(1).map(integer));
    const totals=new Set<number>();
    let optimum=0;
    for(let x=0;x<=limits[0]&&x*times[0]<=capacity;x++){
      for(let y=0;y<=limits[1]&&x*times[0]+y*times[1]<=capacity;y++){
        const remaining=capacity-x*times[0]-y*times[1];
        const z=Math.min(limits[2],Math.floor(remaining/times[2]));
        const value=x*profits[0]+y*profits[1]+z*profits[2];
        if(value>optimum)optimum=value;
        totals.add(value);
      }
    }
    unique(body,option=>integer(option)===optimum);
    assert(choices(body).map(integer).every(value=>totals.has(value)));
  }
});

test('2014春 午前問72は取引方向と代金・荷物の状態を照合する',()=>{
  const operations=['入金通知','商品の発送','商品受領','代金の支払'];
  const owners=[
    ['買い手 → エスクローサービス会社','商品代金の払込み'],
    ['エスクローサービス会社 → 売り手',''],
    ['売り手 → 買い手',''],
    ['買い手 → エスクローサービス会社',''],
    ['エスクローサービス会社 → 売り手',''],
  ];
  for(let index=0;index<count(72);index++){
    const body=question(72,index),visual=figure(body),text=prompt(body);
    const step='①②③④⑤⑥'.indexOf(/取引モデルの([③④⑤⑥])/.exec(text)![1])+1;
    const lines=visual.alt.split('\n').slice(1);
    assert.equal(lines[0],'① 売り手 ↔ 買い手：売買の成立');
    assert.deepEqual(lines.slice(1).map(line=>line.slice(2).split('：').concat('').slice(0,2)),owners);
    assert.match(text,/①〜⑥は取引の順序.*③〜⑥はア〜エ/);
    unique(body,value=>value.includes(operations[step-3]));
    assert(!visual.alt.includes(choice(body)));
  }
});

test('2014春 午前問76は冊子と使用権を満たす全購入方法から最安値を求める',()=>{
  for(let index=0;index<count(76);index++){
    const body=question(76,index),text=prompt(body),form=table(body);
    const [_,divisions,devices]=/([一二三四五六七])つの部署に合計(\d+)台/.exec(text)!;
    const manuals='一二三四五六七'.indexOf(divisions)+1;
    const need=Number(devices);
    const [box,single,bundle]=form.rows.map(row=>row.slice(1).map(integer));
    let minimum=Infinity;
    for(let a=0;a<=need+5;a++)for(let b=0;b<=need+5;b++)for(let c=0;c<=Math.ceil(need/5)+1;c++){
      const counts=[a,b,c];
      const options=[box,single,bundle];
      if(sum(options.map((r,i)=>r[0]*counts[i]))<need||sum(options.map((r,i)=>r[1]*counts[i]))<manuals)continue;
      minimum=Math.min(minimum,sum(options.map((r,i)=>r[2]*counts[i])));
    }
    unique(body,value=>integer(value)===minimum);
    const values=choices(body).map(integer);
    assert.deepEqual(values,[...values].sort((a,b)=>a-b));
  }
});

test('2014春 午前問77は33点の共分散の符号と回帰の区別を検算する',()=>{
  for(let index=0;index<count(77);index++){
    const body=question(77,index),drawing=figure(body);
    const points=[...drawing.alt.matchAll(/\((\d+),(\d+)\)/g)].map(([,x,y])=>[Number(x),Number(y)]);
    assert.equal(points.length,33);
    assert.equal(new Set(points.map(String)).size,33);
    let cross=0,dx2=0,dy2=0;
    for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
      const dx=points[i][0]-points[j][0],dy=points[i][1]-points[j][1];
      cross+=dx*dy;dx2+=dx*dx;dy2+=dy*dy;
    }
    assert(cross!==0&&cross*cross<dx2*dy2);
    unique(body,value=>value.endsWith(cross<0?'相関係数は負である。':'相関係数は正である。'));
    const [xmax,ymax]=points.reduce(([x,y],[nextX,nextY])=>[Math.max(x,nextX),Math.max(y,nextY)],[0,0]);
    assert(xmax<235&&ymax<180);
  }
});

test('2014春 午前問78は売上・変動費・固定費の損益ゼロを整数で検算する',()=>{
  for(let index=0;index<count(78);index++){
    const body=question(78,index),drawing=figure(body);
    const sales=integer(/売上高｜｜(\d+)/.exec(drawing.alt)![1]);
    const variables=[...drawing.alt.matchAll(/変動費 (\d+)/g)].map(match=>Number(match[1]));
    const fixed=[...drawing.alt.matchAll(/固定費 (\d+)/g)].map(match=>Number(match[1]));
    assert.equal(variables.length,2);
    assert.equal(fixed.length,2);
    const operating=Number(/営業利益｜｜(\d+)/.exec(drawing.alt)![1]);
    assert.equal(operating,sales-sum(variables)-sum(fixed));
    unique(body,value=>integer(value)*sales===sum(variables)*integer(value)+sum(fixed)*sales);
    if(index){
      const expected=[sum(fixed),fixed[0]*sales/(sales-sum(variables)),sum(fixed)*sales/(sales-variables[0])];
      assert.deepEqual(choices(body).filter(value=>value!==choice(body)).map(integer),expected.sort((a,b)=>a-b));
    }
  }
});

type Roles=Record<string,RegExp>;
function classify(value:string,roles:Roles) {
  const matches=Object.entries(roles).filter(([,pattern])=>pattern.test(value)).map(([role])=>role);
  assert.equal(matches.length,1,value);
  return matches[0];
}
const rolePairs:Record<number,[Roles,Roles]> = {
  55:[
    {interoperate:/段階移行/,parallel:/並行移行.*稼働切替えの手順/,instant:/一斉移行/,cost:/並行移行.*予算見積り/},
    {interoperate:/新旧システム間を接続|処理データを受け渡す/,parallel:/並行させて運用|両方に入力してから切り替える/,
      instant:/トラブルの影響|全拠点が同じ時点/,cost:/運用コスト|フル稼働させるための費用/}],
  59:[
    {program:/入出力処理が実装担当に伝わらない/,testing:/切替条件を試験で確かめられない/,
      standard:/ログや命名方法がばらつき/,design:/利用者要件が充足されない/},
    {program:/プログラム仕様書を作成/,testing:/テスト計画.*運用部門.*承認/,
      standard:/プログラミング.*定められた標準/,design:/利用部門.*設計書のレビュー/}],
  60:[
    {access:/不正な使用/,degrade:/集計を後回し/,tolerate:/中断せずに続けられる/,recovery:/停止後.*再開できる状態/},
    {access:/アクセス管理/,degrade:/フェールソフト/,tolerate:/フォールトトレラント/,recovery:/リカバリ/}],
  63:[
    {enterprise:/エンタープライズアーキテクチャ/,services:/^SOA/,analysis:/構造化分析/,control:/構造化プログラミング/},
    {enterprise:/業務体系.*適用処理体系/,services:/サービスというコンポーネント/,analysis:/データフローダイアグラム/,control:/連接，選択，反復/}],
  64:[
    {investment:/来期の予算.*稟議/,energy:/電気・燃料に関する排出/,divide:/ディジタルディバイド/,trace:/食品の一部ロット/},
    {investment:/効果目標ごとに目標達成/,energy:/エネルギー消費を削減/,divide:/情報リテラシの習得機会/,trace:/流通情報を追跡/}],
  65:[
    {development:/費用，スケジュール，開発体制/,continuity:/広域停電.*優先業務/,
      overall:/標準の統一.*組織全体/,operation:/月ごとの点検・バックアップ/},
    {development:/^開発計画$/,continuity:/^事業継続計画$/,overall:/^全体最適化計画$/,operation:/^年間運用計画$/}],
  66:[
    {customer:/^CRM/,sales:/^SFA/,resources:/^ERP/,supply:/^SCM/},
    {customer:/良好な顧客関係/,sales:/商談状況.*営業活動/,resources:/基幹業務.*経営効率/,supply:/複数の企業や組織.*納期短縮/}],
  67:[
    {challenge:/首位との差を縮め/,niche:/特定の製品・サービス.*独自の地位/,
      follow:/先行企業が成果を挙げた方式/,lead:/最大の市場占有率/},
    {challenge:/チャレンジャ$/,niche:/ニッチャ$/,follow:/フォロワ$/,lead:/リーダ$/}],
  68:[
    {grow:/成長期/,decline:/衰退期/,mature:/成熟期/,intro:/導入期/},
    {grow:/売上が急激に増加.*新規参入/,decline:/売上と利益が徐々に減少.*撤退/,
      mature:/需要の伸びが鈍化.*品質改良/,intro:/先進的な消費者.*認知度/}],
  70:[
    {cross:/同じ年の複数地域/,scenario:/異なる変化を仮定する/,delphi:/回答結果を集約してフィードバック|集計と意見の要旨を返し/},
    {cross:/^クロスセクション法$/,scenario:/^シナリオライティング法$/,affinity:/^親和図法$/,delphi:/^デルファイ法$/}],
  73:[
    {contents:/コンテンツ管理システム/,tail:/ロングテール/,affiliate:/アフィリエイト/,drop:/ドロップシッピング/},
    {contents:/統合的・体系的な管理/,tail:/あまり売れない商品群/,affiliate:/リンク.*紹介料/,drop:/直接発送.*在庫リスク/}],
  74:[
    {sim:/SIMロックを解除/,tether:/テザリング/,roam:/ローミング/,filter:/コンテンツフィルタリング/},
    {sim:/異なる通信事業者のSIMカード|他社の加入者用カードに差し替え/,tether:/モデム又はアクセスポイント|契約回線をPC/,
      roam:/サービスエリア外|別の網へ接続/,filter:/有害なサイト|サイトの表示を制限/}],
  75:[
    {division:/製品群ごとに収益と費用/,project:/所期の目的を達成すれば解散/,
      matrix:/二つの責任者から異なる面の指示/,staff:/専門担当は意思決定者に助言/},
    {division:/^事業部制組織$/,project:/^プロジェクト組織$/,matrix:/^マトリックス組織$/,staff:/^ラインアンドスタッフ組織$/}],
  79:[
    {defect:/納品後一定の期間内に発見された不具合/,care:/専門職に通常期待される水準で調査/,
      damages:/追加の外注費が生じた/,secret:/他社へ資料の内容を伝えない/},
    {defect:/^瑕疵担保責任$/,care:/^善管注意義務$/,damages:/^損害賠償責任$/,secret:/^秘密保持義務$/}],
};
test('2014春 午前の知識14系列は対象と全四択の意味の対応が一意になる',()=>{
  for(const [number,[target,candidates]] of Object.entries(rolePairs)){
    const n=Number(number);
    for(let index=0;index<count(n);index++){
      const body=question(n,index),wanted=classify(prompt(body).replaceAll('\n',''),target);
      unique(body,value=>classify(value,candidates)===wanted);
      if(n===70||n===75){
        const points=[...prompt(body).matchAll(/^\(\d\)/gm)];
        assert.equal(points.length,n===70?3:4);
      }
    }
  }
  assert.equal(Object.keys(rolePairs).length,14);
  assert.match(question(79,0).explanation,/2014年.*2020年4月/);
});

test('2014春 午前問58は報告、監査の独立性と専門家の責任を全択照合する',()=>{
  const acceptable:Roles={
    properReport:/監査依頼者が監査報告に基づく改善指示.*監査依頼者に報告する/,
    independent:/監査対象の業務を自ら担当していない|開発業務を担当していない監査人/,
    owner:/専門家の支援内容を監査人が評価.*判断の責任を負う/,
  };
  const isAcceptable=(option:string)=>Object.values(acceptable).some(rule=>rule.test(option));
  for(let index=0;index<count(58);index++)unique(question(58,index),isAcceptable);
});

test('2014春 午前問80は届出と日々の就業管理を別の当事者に割り当てる',()=>{
  const responsible:Roles={
    source:/法令上の届出|協定を締結し届け出る|有給休暇を付与|雇入れ時の一般健康診断|賃金を派遣労働者に支払う|割増賃金を派遣労働者へ支払う/,
    destination:/遂行状況の管理|休日や休憩時間の適切な取得|職場環境の整備|作業を指示し|設備を安全に保つ|当日の作業内容を指示|休憩を適切に取らせる|定められた休憩を取らせる/,
  };
  for(let index=0;index<count(80);index++){
    const body=question(80,index),text=prompt(body);
    const party=classify(text,{source:/派遣元の責任/,destination:/派遣先の(労働時間管理上の)?責任/});
    unique(body,value=>classify(value,responsible)===party);
    assert.match(index?text:body.explanation,/2014年/);
  }
});

test('2014春 午前問62・72・77・78の4図は全28条件を原形式で描画する',()=>{
  assert.deepEqual(renderers.map(item=>item.profile),figures.map(item=>item.profile));
  let total=0;
  for(const [i,renderer] of renderers.entries()){
    const item=figures[i];
    const n=Number(item.profile.split('-')[4]);
    for(let index=0;index<count(n);index++){
      const body=question(n,index),visual=figure(body);
      const html=renderToStaticMarkup(createElement(renderer.component,{values:[index],caption:visual.caption}));
      assert.equal(visual.captionPresentation,'accessible');
      assert.equal(visual.alt,item.alt([index]));
      assert.match(html,new RegExp('data-figure-profile="'+item.profile+'"'));
      if(n===62||n===78){
        const group=html.match(/^<figure[^>]*>/)?.[0];
        assert(group);
        assert(group.includes('role="group"'));
        assert(group.includes('aria-label="'+visual.caption+'"'));
        assert(group.includes('aria-description="'+visual.alt+'"'));
        assert.match(html,/<table\b/);
      }
      if(n===62){
        assert.match(html,/colSpan="4"[^>]*>改善案/i);
        assert.match(html,/border-inline-end:3px double var\(--diagram-border\)/);
      }
      if(n===72){
        assert.deepEqual([...html.matchAll(/data-transaction-step="(\d+)"/g)].map(match=>Number(match[1])),[1,2,3,4,5,6]);
        assert.equal([...html.matchAll(/marker-start=/g)].length,1);
      }
      if(n===77)assert.equal([...html.matchAll(/data-scatter-point=/g)].length,33);
      if(n===78){
        assert.match(html,/単位 百万円/);
        assert.equal([...html.matchAll(/rowSpan="2"/ig)].length,4);
      }
      total++;
    }
  }
  assert.equal(total,28);
});
