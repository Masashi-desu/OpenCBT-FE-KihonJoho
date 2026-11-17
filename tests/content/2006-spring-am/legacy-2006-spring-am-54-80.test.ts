import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { test } from 'node:test';
import type { Block } from '../../../src/core/types';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2006SpringAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2006-spring-am-54-80';
import { legacy2006SpringAm5480FigureRenderers as renderers } from '../../../src/ui/Legacy2006SpringAm5480Figures';

const keys='ウエイエイイイイイアウエエエウアアイエイエアウウエイエ';
const q=(n:number,i:number)=>definitions[n-54].build([i]);
const texts=(body:GeneratedBody)=>body.prompt.flatMap(block=>block.type==='paragraph'?[block.text]:[]).join('\n');
const num=(value:string)=>Number(value.replaceAll(',','').replace('−','-'));
const table=(body:GeneratedBody)=>{
  const result=body.prompt.find(block=>block.type==='table');
  assert(result?.type==='table');
  return result;
};
const options=(body:GeneratedBody)=>body.choices.map(([block])=>{
  assert(block.type==='paragraph');
  return block.text;
});
const diagram=(block:Block|undefined)=>{
  assert(block?.type==='diagram'&&block.scene.kind==='source_figure');
  return {...block,scene:block.scene};
};
const figure=(body:GeneratedBody)=>diagram(body.prompt.find(block=>block.type==='diagram'));
const draw=(block:ReturnType<typeof diagram>)=>{
  const render=renderers.find(renderer=>renderer.profile===block.scene.profile);
  assert(render);
  return renderToStaticMarkup(createElement(render.component,{values:block.scene.values,caption:block.caption}));
};
function verify(body:GeneratedBody,truth:boolean[],label=''){
  assert.equal(truth.filter(Boolean).length,1,label);
  assert.deepEqual(truth,body.choices.map((_,i)=>i===body.correctIndex),label);
}
test('問54〜80の公式キー・一対一の系列・四条件・選択肢を保持する',()=>{
  assert.equal(definitions.length,27);
  assert.equal(keys.length,27);
  for(const [j,def] of definitions.entries()) {
    assert.equal(def.source,'2006h18h-fe-am-'+(54+j));
    assert.deepEqual(def.reference,[0]);
    assert.equal(def.sourceAnswer,keys[j]);
    const bodies=Array.from({length:4},(_,i)=>def.build([i]));
    assert.equal('アイウエ'[bodies[0].correctIndex!],keys[j]);
    assert.equal(new Set(bodies.map(body=>JSON.stringify(body.prompt))).size,4,def.source);
    for(const body of bodies) {
      assert.equal(body.choices.length,4);
      assert.equal(new Set(body.choices.map(choice=>JSON.stringify(choice))).size,4);
      assert(body.explanation.length>=30);
    }
    for(const invalid of [[],[0,1],[-1],[4],[0.5],[Infinity],Array<number>(1)]) assert.throws(()=>def.build(invalid),/範囲外/);
  }
});
test('全ての出題図に読み上げ名・代替説明があり，参照制約図のキー表示を読み取れる',()=>{
  const perProfile=new Map<string,Set<number>>();
  for(const def of definitions)for(const index of [0,1,2,3]){
    const body=def.build([index]);
    for(const block of [...body.prompt,...body.choices.flat()]){
      if(block.type!=='diagram')continue;
      const source=diagram(block), html=draw(source);
      const reached=perProfile.get(source.scene.profile)??new Set<number>();
      reached.add(index);
      perProfile.set(source.scene.profile,reached);
      if(source.scene.profile.endsWith('-63-keys')){
        assert.equal([...html.matchAll(/<li>/g)].length,3);
        assert.match(html,/role="group"[^>]+aria-description=/);
        assert.equal([...html.matchAll(/text-decoration-line:underline/g)].length,5);
        assert.equal([...html.matchAll(/text-decoration-style:dashed/g)].length,2);
      }else{
        const root=/<svg\b([^>]+)><title id="([^"]+)">([^<]+)<\/title><desc id="([^"]+)">([^<]+)<\/desc>/.exec(html);
        assert(root,source.scene.profile);
        const [,attributes,titleId,caption,descId,alt]=root;
        assert(attributes.includes('role="img"'));
        assert(attributes.includes('aria-labelledby="'+titleId+'"'));
        assert(attributes.includes('aria-describedby="'+descId+'"'));
        assert.equal(caption,block.caption);
        assert.equal(alt,block.alt);
      }
    }
  }
  assert.equal(perProfile.size,16);
  for(const variants of perProfile.values())assert.equal(variants.size,4);
});
const knowledgeFacts:Readonly<Record<number,{keys:number[];reason:string}>>={
  56:{keys:[1,0,2,3],reason:'CATVとケーブルモデム。光必須・スター限定・対称速度限定ではなく、帯域や機器に応じて同軸・上下差・共有がある。'},
  59:{keys:[1,2,0,3],reason:'読取りの共有・変更の占有、行ロックと粒度、循環待ちと一方ロールバック。'},
  60:{keys:[1,0,2,3],reason:'分離性・原子性・永続性・一貫性を処理例と制約から判定。'},
  62:{keys:[1,0,2,3],reason:'単一スレッドの並行は可能、複数コアの並列と区別、同じメモリの変更を同期。'},
  65:{keys:[3,0,1,2],reason:'署名は配布元の真正性と署名後の完全性を検証。利用許可、著作権者、保守責任は別途。'},
  66:{keys:[3,0,1,2],reason:'未感染媒体を実行、定義更新は未知感染までは防がず、利用者が明示的に起動しなくても弱点等で感染。'},
  67:{keys:[3,0,1,2],reason:'送受信IP・TCP宛先ポート・IP上位プロトコル番号を基準に通過可否。改ざんの修復やNATの書換えは別。'},
  68:{keys:[2,1,3,0],reason:'多数の資産から少しずつ取るサラミ法、通信傍受、残存情報、認証情報窃取を区別。'},
  69:{keys:[0,1,2,3],reason:'ASCII 7bit・EUC-JP・Unicode文字集合とUTF・シフトJISの1/2バイト。'},
  70:{keys:[0,1,2,3],reason:'モデル2の位置検出3個、バイトモード、容量を決める諸条件。'},
  71:{keys:[1,2,0,2],reason:'利用者の技能・データの更新品質・分析対象データの不足・操作負担と適切な改善策。'},
  72:{keys:[3,2,0,3],reason:'期末状態の貸借対照表、期間損益、期間の現金・現金同等物の増減を区別。'},
  74:{keys:[3,0,1,1],reason:'累計で重点を分けるABC。同時購入分析と格子状地域集計を他のケースで判別。'},
  78:{keys:[3,1,0,2],reason:'線形最適化、回帰予測、潜在因子、実験割付で判定。'},
  79:{keys:[1,2,0,3],reason:'MRPは部品表・手持ち・手配残・リードタイムを用いる。図面や人員管理と切り分け。'},
  80:{keys:[3,0,1,2],reason:'著作権法第10条3項・15条・17条2項・21条・61条・59条。発注者と著作者の区別、創作表現、無方式、人格権の専属性。'},
};
const reviewedText:Readonly<Record<number,string>>={
  // Hashes bind the independently audited prompt and the four positions for each scenario.
  56: "22b9ec22d97e245c26e9f638f98a9d1393f05f47c989c1791b478e46191fbba6",
  59: "4762350fb1cd66b29f98714379ea2cc521e3809fe0d3c76d604aa75fbec82806",
  60: "ea2bec08e126097de984cb5d9b445857299da29aade76c0bbd084e183d37d0a6",
  62: "06b23563869be4e7838a26fe484b7c7a3b8b6b2843f2ed2e7ac5667f5c17f1bf",
  65: "fcb153a064aa495ec2eeb30f3d225f9c4bd92da0ec14568fefcbac3380ec9b5e",
  66: "a4604cc1e447fe4937d3d7423b5989addf749a70ec8276c5e218de69d125bfb4",
  67: "a0f17dd2408a59dfbcc6fba9511b36c6cb7ff78e26c6d87e26ce28ea8ea48c74",
  68: "33b9b55dbf3cb29118270025da8e07c6a675bbd7845da80b5129c639b0471f7c",
  69: "4535b631b922bdee04d26477edf1f982eb49b2378ea64e4a2e9fd69ad0c44cb2",
  70: "042e73cf66a6c457dee9faabe358df112a1a5ef8f83a141f40cc16573145de62",
  71: "cb836909faccc40de4607cf846051592b41d1f20a6ba323b25fe9be254b53a2f",
  72: "4fab5afdfc911f3ed4f96681aeaaeb88c0878ca646de842acf64830376662603",
  74: "5e4a10efa2598bbae714d1e944885fe6251edcd9bc35bad3834621ad955f3247",
  78: "44ff0a27a3ef5fa852b2eb091fef61994a6f1c974978eb55bd6f3ffce8e5ed22",
  79: "4b27e9e0b146f3ed443880324bd99efd35c1df1bf3dcbc8dc68b1f4758a902a8",
  80: "96b61e4e89e679c8db7cab29fd5bc1f2c79c726670d3772ee83af3be2f98e4d0",
};
test('知識16問×4条件を査読済みの全肢真偽と照合する',()=>{
  for(const [number,entry] of Object.entries(knowledgeFacts)){
    assert(entry.reason.length>20);
    const serial=[0,1,2,3].map(i=>{
      const body=q(Number(number),i), bank=options(body);
      verify(body,bank.map((_,j)=>j===entry.keys[i]),number+' '+i);
      return [texts(body),bank];
    });
    assert.equal(createHash('sha256').update(JSON.stringify(serial)).digest('hex'),reviewedText[Number(number)]);
  }
});
test('問54の全選択肢でインターネットプロトコルの層を図から照合する',()=>{
  const transports=new Set(['TCP','UDP']), network=new Set(['IP','IPv4','IPv6']);
  for(let i=0;i<4;i++){
    const body=q(54,i);
    verify(body,body.choices.map(([block])=>{
      const {alt}=diagram(block);
      const formatting=/^(\S+層)に(\w+)，(\S+層)に(\w+)がある。$/.exec(alt)!;
      const [,top,one,bottom,two]=formatting;
      assert(texts(body).includes(one)&&texts(body).includes(two));
      assert.match(draw(diagram(block)),new RegExp('>'+one+'<'));
      return top==='トランスポート層'&&transports.has(one)&&bottom==='ネットワーク層'&&network.has(two);
    }));
  }
});
test('問55は上下双方の時間と各誤答を独立した整数比で確認する',()=>{
  const rounded=(n:bigint,d:bigint)=>Number((20n*n+d)/(2n*d))/10;
  for(let i=0;i<4;i++){
    const body=q(55,i), values=table(body).rows.map(row=>row[1]), integers=(text:string)=>text.match(/\d+/g)!.map(BigInt);
    const [rate]=integers(values[0]), [efficiency]=integers(values[1]), payload=integers(values[2]).reduce((a,b)=>a+b,0n);
    const processing=BigInt(Math.round((Number(values[3].match(/\d+\.\d+/)![0])+Number(values[4].match(/\d+\.\d+/)![0]))*10));
    const throughput=rate*efficiency;
    function withProcessing(n:bigint,d:bigint){return rounded(10n*n+processing*d,10n*d);}
    const answer=withProcessing(payload*800n,throughput);
    const expected=[withProcessing(payload*100n,throughput),withProcessing(payload*8n,rate),rounded(payload*800n,throughput),answer].sort((a,b)=>a-b);
    const actual=options(body).map(num);
    assert.deepEqual(actual,expected);
    verify(body,actual.map(value=>value===answer));
  }
});
test('問57は装置Aの図示された最上位層を全機器と照合する',()=>{
  const layerForDevice:Record<string,string>={'ゲートウェイ':'アプリケーション層','ブリッジ':'データリンク層','リピータハブ':'物理層','ルータ':'ネットワーク層'};
  for(let i=0;i<4;i++){
    const body=q(57,i), {alt}=figure(body);
    const listed=/装置Aの下からの層は([^。]+)。/.exec(alt)![1].split('、');
    assert(draw(figure(body)).includes('>'+listed.at(-1)+'<'));
    verify(body,options(body).map(device=>layerForDevice[device]===listed.at(-1)));
  }
});
type Row=Record<string,number>;
function projection(rows:Row[],keys:string[]){
  const unique=new Map<string,Row>();
  for(const row of rows){const match=Object.fromEntries(keys.map(key=>[key,row[key]]));unique.set(JSON.stringify(match),match);}
  return [...unique.values()];
}
function innerJoin(left:Row[],right:Row[]){
  return left.flatMap(a=>right.filter(b=>Object.keys(a).every(key=>!(key in b)||a[key]===b[key]))
    .map(b=>({...a,...b})));
}
const canonical=(rows:Row[])=>rows.map(row=>Object.entries(row).sort(([a],[b])=>a.localeCompare(b)).map(([,n])=>n).join(',')).sort();
test('問58は合成キーの従属消去と投影した関係の結合を全候補について検算する',()=>{
  for(let i=0;i<4;i++){
    const body=q(58,i), [,first,second,dependent,det]=/主キーは，項目([a-f])と([a-f])を組み合わせたもの[^。]*。また，項目([a-f])は項目([a-f])/.exec(texts(body))!;
    const others=[...'abcdef'].filter(name=>![first,second,dependent].includes(name));
    const relation=[0,1,2,3].map(index=>{
      const c=Math.floor(index/2)+1,d=index%2+1,position=(c+d)%2;
      return {[first]:c,[second]:d,[dependent]:(det===first?c:d)+8,...Object.fromEntries(others.map((name,j)=>[name,3+j+position]))};
    });
    verify(body,body.choices.map(([block])=>{
      const split=[...diagram(block).alt.matchAll(/（([a-f、]+)）/g)].map(([,items])=>items.split('、'));
      const reconstructed=split.map(attrs=>projection(relation,attrs)).reduce(innerJoin);
      const joinable=JSON.stringify(canonical(reconstructed))===JSON.stringify(canonical(relation));
      const carriesPartial=split.some(row=>row.includes(first)&&row.includes(second)&&row.includes(dependent));
      return joinable&&!carriesPartial;
    }));
  }
});
test('問61は処理図の読取りと書込みを時刻順に再現する',()=>{
  for(let i=0;i<4;i++){
    const body=q(61,i), start=num(/値が(\d+)であった/.exec(texts(body))![1]), final=[start,start,start,start,start];
    const steps=[...figure(body).alt.matchAll(/閲覧者(\d)：(\d)でアクセスカウンタ.*?，(\d)で処理(\d)の結果を書き込む。/g)];
    assert.equal(steps.length,2);
    for(let time=1;time<=4;time++){
      const writer=steps.find(row=>Number(row[3])===time);
      final[time]=writer?final[Number(writer[4])-1]+1:final[time-1];
    }
    verify(body,options(body).map(option=>num(option)===final[4]));
  }
});
test('問63は主キーと外部キーをSQLiteに設定し全操作・反例を実行する',()=>{
  for(let i=0;i<4;i++){
    const body=q(63,i), alt=figure(body).alt;
    const schemas=[...alt.matchAll(/([^。]+)（([^）]+)）/g)].map(([,name,content])=>({
      name,pk:/([^、]+)〔主キー・実線〕/.exec(content)![1],
      fk:[...content.matchAll(/([^、]+)〔外部キー・破線〕/g)].map(row=>row[1]),
    }));
    const db=new DatabaseSync(':memory:');
    try {
      db.exec('PRAGMA foreign_keys=ON;');
      for(const {name,pk,fk} of [...schemas].sort((a,b)=>a.fk.length-b.fk.length)){
        const columns=fk.map(key=>'"'+key+'" INT NOT NULL REFERENCES "'+schemas.find(row=>row.pk===key)!.name+'"("'+key+'")');
        db.exec('CREATE TABLE "'+name+'" ("'+pk+'" INTEGER PRIMARY KEY'+(columns.length?', '+columns.join(', '):'')+');');
        db.exec('INSERT INTO "'+name+'" VALUES ('+[1,...fk.map(()=>1)].join(',')+');');
      }
      const passes=options(body).map(choice=>{
        const [,name]=/“([^”]+)”/.exec(choice)!;
        const table=schemas.find(row=>row.name===name)!;
        const action=choice.includes('追加')?'INSERT INTO "'+name+'" VALUES ('+[2,...table.fk.map(()=>99)].join(',')+')':
          choice.includes('削除')?'DELETE FROM "'+name+'" WHERE "'+table.pk+'"=1':
            'UPDATE "'+name+'" SET "'+table.pk+'"=99 WHERE "'+table.pk+'"=1';
        db.exec('SAVEPOINT each_action');
        try {db.exec(action);return true;}
        catch (error) {assert.match(String(error),/FOREIGN KEY constraint failed/);return false;}
        finally {db.exec('ROLLBACK TO each_action; RELEASE each_action');}
      });
      verify(body,passes);
      const actual=draw(figure(body));
      assert.match(actual,/text-decoration-style:dashed/);
      assert.equal([...actual.matchAll(/text-decoration-style:dashed/g)].length,2);
    } finally {db.close();}
  }
});
test('問64は送信者・受信者の操作と図表の全候補を照合する',()=>{
  for(let i=0;i<4;i++){
    const body=q(64,i);
    const source=texts(body).includes('顧客から')?1:0;
    verify(body,body.choices.map(([choice])=>{
      assert(choice.type==='table');
      assert.deepEqual(choice.columns,['商店','顧客']);
      const [row]=choice.rows;
      return row[source]==='公開鍵'&&row[1-source]==='秘密鍵';
    }));
  }
});
test('問73は売上高を消去した二つの率からすべての数値候補を判定する',()=>{
  for(let i=0;i<4;i++){
    const body=q(73,i), [costRate,profitRate,profit]=table(body).rows.map(([,value])=>Number(value.replace(/[％万,円]/g,'')));
    const right=profit*costRate/profitRate, revenue=profit*100/profitRate;
    const numbers=options(body).map(num);
    assert.deepEqual(numbers,[right-profit,right,revenue-profit,revenue].sort((a,b)=>a-b));
    verify(body,numbers.map(choice=>choice*profitRate===profit*costRate));
  }
});
test('問75は描画した四図の構造から手法を一意に判定する',()=>{
  for(let i=0;i<4;i++){
    const body=q(75,i), prompt=texts(body), chart=prompt.includes('線形計画法')?'region':prompt.includes('特性要因図')?'spine':'branch';
    const kinds=body.choices.map(([choice])=>{
      const fragment=draw(diagram(choice)), kind=/data-chart="([^"]+)"/.exec(fragment)![1];
      return kind;
    });
    assert.deepEqual([...kinds].sort(),['bars','branch','region','spine']);
    verify(body,kinds.map(name=>name===chart));
  }
});
test('問76は各社の順序で相手利得の最悪値を全列・全行から検算する',()=>{
  for(let i=0;i<4;i++){
    const body=q(76,i), cells=table(body).rows.map(row=>row.slice(1).map(cell=>cell.split('，').map(num)));
    const aMin=cells.map(row=>row.slice().sort((a,b)=>a[0]-b[0])[0][0]);
    const bMin=[0,1].map(column=>[cells[0][column][1],cells[1][column][1]].sort((a,b)=>a-b)[0]);
    assert.equal(new Set(aMin).size,2); assert.equal(new Set(bMin).size,2);
    const a=aMin.indexOf(Math.max(...aMin)),b=bMin.indexOf(Math.max(...bMin));
    verify(body,options(body).map(option=>num(option)===cells[a][b][0]));
  }
});
test('問77は傾き・切片・非負の入力から得点傾向を検算し，全肢を区別する',()=>{
  for(let i=0;i<4;i++){
    const body=q(77,i), shown=texts(body);
    const slope=Number(/傾きは，([\d.]+)/.exec(shown)![1]), intercept=num(/切片の値は，([−\d]+)/.exec(shown)![1]);
    const expectedSign=Math.sign(intercept);
    const delta=[0,1,10,80,100].map(x=>Math.sign((slope*x+intercept)-x));
    assert(delta.every(sign=>sign===expectedSign));
    verify(body,options(body).map(choice=>{
      if(choice.includes('問題の質')||choice.includes('質が高い')) return false;
      if(choice.includes('平均点')) return intercept===0;
      if(choice.includes('得点が0点')) {
        // The x-intercept must solve slope*x+intercept = 0, not x=|intercept|.
        return Math.abs(intercept)*slope+intercept===0;
      }
      return choice.includes(expectedSign===1?'得点しやすい':'得点しにくい');
    }));
  }
});
