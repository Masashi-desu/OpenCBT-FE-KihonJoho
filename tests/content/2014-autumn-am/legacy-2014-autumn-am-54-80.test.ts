import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { legacy2014AutumnAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2014-autumn-am-54-80';
import { legacy2014AutumnAm5480Figures } from '../../../src/core/generators/legacy-2014-autumn-am-54-80-figures';
import { legacy2014AutumnAm5480Renderers } from '../../../src/ui/Legacy2014AutumnAm5480Figures';
import review from '../../fixtures/legacy-2014-autumn-am-54-80-review.json';

const definition = (n:number) => definitions.find(d=>d.source==='2014h26a-fe-am-'+n)!;
const count = (n:number) => definition(n).fields[0].maximum+1;
const body = (n:number,index:number) => definition(n).build([index]);
type Body=ReturnType<typeof body>;
const prompt = (item:Body) => item.prompt.flatMap(block=>block.type==='paragraph'?[block.text]:[]).join('\n');
const options = (item:Body) => item.choices.map(([option])=>{
  assert.equal(option.type,'paragraph');
  return option.text;
});
const table = (item:Body) => {
  const block=item.prompt.find(candidate=>candidate.type==='table');
  assert(block);
  return block;
};
const commaNumber=(text:string)=>Number(text.replaceAll(',',''));
function unique(item:Body, oracle:(candidate:string)=>boolean) {
  const visible=options(item);
  assert.deepEqual(visible.map(oracle),visible.map((_,i)=>i===item.correctIndex));
}

test('2014秋 午前問54〜80の掲載候補24問・原文・公式キー・116条件を照合する',()=>{
  assert.deepEqual(definitions.map(d=>Number(d.source.split('-').at(-1))),review.records.map(record=>record.number));
  for(const n of review.hold)assert.equal(definitions.some(d=>d.source.endsWith('-'+n)),false);
  let cases=0;
  for(const {number,key,statementHash} of review.records){
    const original=body(number,0),d=definition(number);
    assert.deepEqual(d.reference,[0]);
    assert.equal(d.sourceAnswer,key);
    assert.equal('アイウエ'[original.correctIndex!],key);
    const hash=createHash('sha256').update(JSON.stringify([prompt(original),options(original)])).digest('hex');
    assert.equal(hash,statementHash,'Q'+number);
    const stems=new Set(),answers=new Set();
    for(let index=0;index<count(number);index++){
      const item=body(number,index);
      assert.equal(item.contexts,undefined);
      assert.equal(new Set(options(item)).size,4);
      assert(options(item)[item.correctIndex!]);
      assert.ok(item.explanation.length>16);
      stems.add(JSON.stringify(item.prompt));
      answers.add(options(item)[item.correctIndex!]);
      cases++;
    }
    assert.equal(stems.size,count(number));
    assert.ok(answers.size>=2);
    for(const invalid of [[],[-1],[0.5],Array(1),[count(number)],[0,1]])assert.throws(()=>d.build(invalid));
  }
  assert.equal(cases,116);
});

type Roles=Record<string,RegExp>;
function meaning(text:string, roles:Roles) {
  const matches=Object.entries(roles).filter(([,expression])=>expression.test(text)).map(([role])=>role);
  assert.equal(matches.length,1,text);
  return matches[0];
}
const rolePairs:Record<number,[Roles,Roles]> = {
  56:[
    {shared:/除去すべきでない資産/,capacity:/割当てを解除し忘れた/,maintenance:/年間契約を更新対象から外し忘れた/,license:/利用権だけを回収しなかった/},
    {shared:/別のITサービスでのインシデント/,capacity:/磁気ディスク/,maintenance:/保守料金の過払い/,license:/ライセンスの無駄使い/}],
  62:[
    {bpo:/BPOを説明/,hosting:/ホスティング/,saas:/SaaS/,labor:/労働者派遣/},
    {bpo:/業務プロセス全般/,hosting:/サーバの処理能力/,saas:/ソフトウェアの機能をネットワーク/,labor:/派遣会社/}],
  63:[
    {grid:/スマートグリッド/,health:/パーソナルヘルスケア/,work:/テレワーク/,auto:/テレマティクス/},
    {grid:/発電と電力消費/,health:/類似した症例/,work:/様々な勤務形態/,auto:/自動車に設置/}],
  67:[
    {social:/CSR調達/,cheap:/必要な数量，品質，納期を満たしている.*発注額が予算を超える/,
      resilience:/工場が停止.*代替の在庫がなく.*組立てまで止まる/,edi:/品番や数量の照合.*注文書の入力ミス/},
    {social:/自然環境.*人権/,cheap:/最も安価/,resilience:/調達先を複数化/,edi:/EDIを利用/}],
  68:[
    {core:/コアコンピテンス/,mission:/経営理念/,target:/戦略目標/,environment:/SWOT分析.*OとT/},
    {core:/競争優位の源泉|競争相手が容易にまねできず/,mission:/基本精神や行動指針|立ち返る価値観/,
      target:/達成すべき到達目標|計画期間の終わりまでに実現/,environment:/機会と脅威|制度の変更や顧客動向/}],
  69:[
    {value:/主活動と支援活動/,three:/他社のサービスが選ばれている理由を利用者に聞いた.*自社で提供/,
      swot:/既存の販売網.*製造設備が足りない.*規制緩和.*海外企業/,
      forces:/価格競争.*大口顧客.*卸売業者.*外注をやめる.*業界全体/},
    {value:/バリューチェーン分析/,three:/^3C分析$/,swot:/^SWOT分析$/,forces:/^ファイブフォース分析$/}],
  70:[
    {intro:/導入期/,growth:/成長期/,mature:/成熟期/,decline:/衰退期/},
    {intro:/認知度を高める/,growth:/売上が急激に増加/,mature:/需要の伸びが鈍化/,decline:/売上と利益が徐々に減少/}],
  71:[
    {strategy:/戦略マップ/,position:/ポジショニングマップ/,portfolio:/事業ポートフォリオ/,domain:/事業ドメイン/},
    {strategy:/四つの視点.*因果関係|施策が別の観点の成果/,position:/X軸，Y軸.*ポジション|製品を比較.*二つの尺度.*平面/,
      portfolio:/市場の魅力度，自社の優位性|市場の将来性と自社の競争力.*事業/,
      domain:/顧客層.*経営資源.*提供|対象とする顧客.*活動範囲/}],
  72:[
    {concurrent:/コンカレント/,value:/バリューエンジニアリング/,sequential:/シーケンシャル/,reverse:/リバース/},
    {concurrent:/同時並行的/,value:/機能とコスト/,sequential:/プロセスを順に/,reverse:/システムを解析.*仕様/}],
  73:[
    {design:/^CAD/,evaluate:/^CAE/,resource:/^MRP/,manufacture:/^CAM/},
    {design:/製品設計図面を作成/,evaluate:/試作や実験を行わず/,resource:/資材の必要量と時期/,manufacture:/工程設計情報に変換/}],
  75:[
    {share:/ワークシェアリング/,balance:/ワークライフバランス/,choose:/社内公募/,benefit:/カフェテリアプラン/},
    {share:/勤務時間短縮.*雇用確保/,balance:/仕事と生活の調和/,choose:/職場や職務を選択/,benefit:/福利厚生サービス.*選択/}],
};
test('2014秋 午前の説明選択11問は、対象条件と全四択の役割が対応する',()=>{
  assert.equal(Object.keys(rolePairs).length,11);
  for(const [number,[targets,choices]] of Object.entries(rolePairs)){
    const n=Number(number);
    for(let index=0;index<count(n);index++){
      const item=body(n,index);
      const wanted=meaning(prompt(item),targets);
      unique(item,candidate=>meaning(candidate,choices)===wanted);
    }
  }
});

test('2014秋 午前問64は所有と利用目的を別々に判定して全四択を照合する',()=>{
  const ownershipInUse:Roles={company:/管理部に返す|会社の固定資産台帳/,personal:/家電店で代金を支払った|BYOD/};
  const purposeInUse:Roles={work:/見積書を送信|BYOD/,personal:/動画配信サービス/};
  const ownershipInChoice:Roles={company:/会社から貸与|会社所有/,personal:/個人で所有|個人所有/};
  const purposeInChoice:Roles={work:/業務/,personal:/私的/};
  for(let index=0;index<count(64);index++){
    const item=body(64,index);
    const owner=meaning(prompt(item),ownershipInUse);
    const purpose=meaning(prompt(item),purposeInUse);
    unique(item,choice=>{
      const choiceOwner=meaning(choice,ownershipInChoice);
      const choicePurpose=meaning(choice,purposeInChoice);
      return choiceOwner===owner&&choicePurpose===purpose;
    });
  }
});

test('2014秋 午前問64・67・69の生成条件に答えの言い換えや定義列挙を追加しない',()=>{
  const directClues:Record<number,RegExp>={
    64:/貸与|会社所有|個人所有|私的|自費購入|BYOD/,
    67:/購入単価|安価|調達先の複数化|EDI|自然環境|人権/,
    69:/三つの観点|強み|弱み|機会|脅威|交渉力|代替品|3C分析|SWOT分析|ファイブフォース分析/,
  };
  for(const [number,clue] of Object.entries(directClues)){
    const n=Number(number);
    for(let index=1;index<count(n);index++)assert.doesNotMatch(prompt(body(n,index)),clue,'Q'+n);
  }
});

const operationRules:Roles={
  縮退運転:/切り離し.*(?:機能を|主要機能)/,
  リストア:/(?:ファイルを.*復元する|ファイルを.*戻す)/,
  バックアップ:/(?:別.*媒体.*保存する|別.*媒体に保存する)/,
  リスタート:/チェックポイント.*(?:再開する|続ける)/,
  リブート:/OSを起動し直す/,
  トランザクションログ:/(?:トランザクション処理の記録|データベースの変更履歴|更新を記録|復旧用の更新記録)/,
};
test('2014秋 午前問57〜61は操作・通知・監査・計画を意味で分類する',()=>{
  const tests:Record<number,(choice:string)=>boolean>={
    57:choice=>{
      const [_,operation,label]=/^(.*)ことを，(.+)という。$/.exec(choice)??/^(.*記録を)，(.+)という。$/.exec(choice)??[];
      assert(operation&&label,choice);
      return meaning(operation,operationRules)===label;
    },
    58:choice=>/連動して.*(?:報知器|表示灯)|連動し.*(?:報知器|表示灯)|当番者の連絡端末へ通知/.test(choice),
    59:choice=>/専門的な立場.*保証又は助言|独立した意見を依頼者へ伝える|証拠として評価し.*助言|報告書を依頼者へ提出/.test(choice),
    60:choice=>/ライセンス証書|購入したライセンス数と照合|有効な契約と利用状況を照合|利用権の返却又は移管/.test(choice),
    61:choice=>/情報システム基盤の整備計画|認証基盤を統一|全拠点.*通信基盤.*整備|全部門.*基盤.*整備/.test(choice),
  };
  for(const [number,accept] of Object.entries(tests)){
    const n=Number(number);
    for(let i=0;i<count(n);i++) unique(body(n,i),accept);
  }
});

test('2014秋 午前問79・80は2014年時点の表現保護・注意義務を区別する',()=>{
  const copyrightCorrect:Roles={
    both:/ソースプログラムとオブジェクトプログラムの両方とも/,
    independentlyCreated:/創作的な表現を複製したこととは区別する/,
    machine:/機械語で表現された実行形式にも及び得る/,
    independentWorks:/それぞれの創作的な表現について保護/,
  };
  const contractRole:Roles={
    recompense:/成果物の対価として報酬|報酬の支払日を納品後/,
    complete:/(?:完成させる|完成する)義務/,
    service:/善管注意義務|法律行為でない事務|法律行為に当たらない定常|日常の監視と記録の事務/,
    command:/指揮命令下|直接命令|手順を直接指示/,
    legalAct:/法律行為をする事務|法律行為である第三者との契約/,
  };
  for(let i=0;i<count(79);i++){
    const copyright=body(79,i);
    const contract=body(80,i);
    assert.match(i?prompt(copyright):copyright.explanation,/2014年/);
    assert.match(i?prompt(contract):contract.explanation,/2014年/);
    const role79=meaning(prompt(copyright),{
      both:/^著作権法による/,independentlyCreated:/二人が別々に/,machine:/無償で配布/,independentWorks:/説明文を作成し/,
    });
    unique(copyright,choice=>copyrightCorrect[role79].test(choice));
    const role80=meaning(prompt(contract),{
      service:/準委任契約/,complete:/請負契約/,legalAct:/代理人に契約の締結/,
    });
    unique(contract,choice=>meaning(choice,contractRole)===role80);
  }
  assert.match(body(80,0).explanation,/2020年4月.*成果.*報酬/);
});

test('2014秋 午前問54は人日を積み、全候補の最低必要人数を検算する',()=>{
  const answers=new Set<string>();
  for(let index=0;index<count(54);index++){
    const item=body(54,index),stem=prompt(item);
    const days=Number(/(\d+)日間/.exec(stem)![1]);
    const additional=Number(/(\d+)倍/.exec(stem)![1]);
    const work=table(item);
    assert.deepEqual(work.columns,['','プログラムの本数','プログラム1本当たりのコーディング所要工数（人日）']);
    const parts=work.rows.map(([,units,time])=>Array.from({length:Number(units)},()=>Number(time)).reduce((a,b)=>a+b,0));
    const coding=parts.reduce((a,b)=>a+b,0);
    const total=coding+coding*additional;
    unique(item,candidate=>{
      const people=Number(candidate);
      return people*days>=total&&(people-1)*days<total;
    });
    const visible=options(item).map(Number);
    assert.deepEqual(visible,[...visible].sort((a,b)=>a-b));
    const smaller=[coding*additional, ...parts.map(part=>(coding-part)*(additional+1))];
    const alternatives=[...smaller.map(value=>Math.ceil(value/days)),Math.ceil(total/(days*3/4)),
      Math.ceil(total/(days*9/13)),Math.ceil((total+coding)/days)];
    const answer=options(item)[item.correctIndex!];
    answers.add(answer);
    assert(visible.every(value=>value===Number(answer)||alternatives.includes(value)));
    if(!index)assert.deepEqual(visible,[8,9,12,13]);
  }
  assert(answers.size>=4);
});

test('2014秋 午前問74と76は不足能力・累積閾値の等号を含め全条件を検算する',()=>{
  let exactSupply=false, exactCutoff=false;
  for(let i=0;i<count(74);i++){
    const item=body(74,i);
    const required=commaNumber(/([\d,]+)個作る/.exec(prompt(item))![1]);
    const rows=table(item).rows;
    unique(item,answer=>rows.some(([step,time,machines,hours])=>{
      assert.match(time,/^\d+\.\d$/);
      const ticks=Number(time.replace('.',''));
      const availableTicks=Number(machines)*Number(hours)*10;
      const available=Math.floor(availableTicks/ticks);
      exactSupply ||= availableTicks===required*ticks;
      return step===answer&&available<required;
    }));
  }
  for(let i=0;i<count(76);i++){
    const item=body(76,i);
    const threshold=Number(/A群は(\d+)％以上/.exec(prompt(item))![1]);
    const values=table(item).rows[0].slice(1).map(Number);
    const total=values.pop()!;
    assert.equal(values.length,9);
    assert.deepEqual(values,[...values].sort((a,b)=>b-a));
    assert.equal(values.reduce((a,b)=>a+b,0),total);
    const prefixes=values.map((_,k)=>values.slice(0,k+1).reduce((a,b)=>a+b,0)*100);
    exactCutoff ||= prefixes.includes(total*threshold);
    unique(item,choice=>prefixes[Number(choice)-1]>=total*threshold&&prefixes[Number(choice)-2]<total*threshold);
  }
  assert(exactSupply);
  assert(exactCutoff);
});

test('2014秋 午前問77は各戦略への最適応答の交点と結合見出しを検算する',()=>{
  const profile=legacy2014AutumnAm5480Figures[0];
  const renderer=legacy2014AutumnAm5480Renderers[0];
  assert.equal(renderer.profile,profile.profile);
  for(let index=0;index<count(77);index++){
    const item=body(77,index), diagram=item.prompt.find(block=>block.type==='diagram');
    assert(diagram);
    assert.equal(diagram.captionPresentation,'accessible');
    const rows=diagram.alt.split('\n').slice(1).map(line=>line.split('｜').slice(1).map(pair=>pair.split(', ').map(Number)));
    assert.equal(rows.length,2);
    assert(rows.every(row=>row.length===2));
    const bestB=rows.map(row=>row[0][1]>row[1][1]?1:2);
    const bestA=[0,1].map(column=>rows[0][column][0]>rows[1][column][0]?1:2);
    for(const row of rows)assert.notEqual(row[0][1],row[1][1]);
    for(const column of [0,1])assert.notEqual(rows[0][column][0],rows[1][column][0]);
    assert(rows.flat().every(pair=>pair.every(value=>value>=0&&value<=100)&&pair[0]+pair[1]<=100));
    unique(item,choice=>{
      const [_,a,b]=/戦略a([12])，B社が戦略b([12])/.exec(choice)!;
      return bestA[Number(b)-1]===Number(a)&&bestB[Number(a)-1]===Number(b);
    });
    const markup=renderToStaticMarkup(createElement(renderer.component,{values:[index],caption:'市場シェア'}));
    assert.match(markup,/<th scope="colgroup" colSpan="2"[^>]*>B社<\/th>/i);
    assert.match(markup,/<th scope="rowgroup" rowSpan="2"[^>]*>A社<\/th>/i);
    for(const pair of rows.flat())assert(markup.includes(pair.join(', ')));
  }
});

test('2014秋 午前問78はロットを先頭から払い出して単価と全誤答を照合する',()=>{
  for(let index=0;index<count(78);index++){
    const item=body(78,index);
    const [opening,buy,issue]=table(item).rows;
    assert.deepEqual(issue.slice(-2),['','']);
    assert.deepEqual([opening[0],buy[0],issue[0]],['4月1日','4月5日','4月10日']);
    const fifo=[opening,buy].flatMap(([, ,qty,price,amount])=>{
      assert.equal(commaNumber(qty)*Number(price),commaNumber(amount));
      return Array.from({length:commaNumber(qty)},()=>Number(price));
    });
    const size=commaNumber(issue[2]);
    const issued=fifo.slice(0,size);
    assert.equal(issued.length,size);
    assert(new Set(issued).size===2);
    const average=(costs:number[])=>costs.reduce((a,b)=>a+b,0)/costs.length;
    const correct=average(issued);
    const others=[fifo[0],average([...new Set(fifo)]),average(fifo)];
    unique(item,candidate=>Number(candidate)===correct);
    assert.deepEqual(options(item).map(Number),[correct,...others].sort((a,b)=>a-b));
    assert(Number.isSafeInteger(correct));
  }
});
