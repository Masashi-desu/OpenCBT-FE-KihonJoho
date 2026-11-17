import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { test } from 'node:test';
import type { GeneratedBody } from '../../../src/core/generators/definition';
import { legacy2006AutumnAm54To80Definitions as definitions } from '../../../src/core/generators/legacy-2006-autumn-am-54-80';
import { legacy2006AutumnAm5480FigureRenderers as chartRenderers } from '../../../src/ui/Legacy2006AutumnAm5480Figures';

const keys='イウイウエエウイイエエアエイイアエウエエイウイイウエア';
const q=(number:number,index:number)=>definitions.find(def=>def.source.endsWith('-'+number))!.build([index]);
const text=(item:GeneratedBody)=>item.prompt.filter(block=>block.type==='paragraph').map(block=>block.text).join('\n');
const table=(item:GeneratedBody)=>{
  const block=item.prompt.find(block=>block.type==='table');
  assert(block?.type==='table');
  return block;
};
const numbers=(s:string)=>Number(s.replaceAll(',',''));
const optionText=(item:GeneratedBody)=>item.choices.map(([choice])=>{
  assert(choice.type==='paragraph'||choice.type==='code');
  return choice.text;
});
const options=(item:GeneratedBody)=>optionText(item).map(numbers);
const verify=(item:GeneratedBody, truth:boolean[])=>{
  assert.equal(truth.filter(Boolean).length,1);
  assert.deepEqual(truth,item.choices.map((_,j)=>j===item.correctIndex));
};
test('問54〜80は原正答・原順・4条件・入力域を維持する',()=>{
  assert.equal(definitions.length,27);
  assert.equal(keys.length,27);
  for(const [j,def] of definitions.entries()) {
    assert.equal(def.source,'2006h18a-fe-am-'+(54+j));
    assert.deepEqual(def.reference,[0]);
    assert.equal(def.sourceAnswer,keys[j]);
    const bodies=Array.from({length:4},(_,i)=>def.build([i]));
    assert.equal('アイウエ'[bodies[0].correctIndex!],keys[j]);
    assert.equal(new Set(bodies.map(body=>JSON.stringify([body.prompt,body.choices.map(choice=>choice.filter(block=>block.type==='diagram'))]))).size,4);
    for(const body of bodies) {
      assert.equal(body.choices.length,4);
      assert.equal(new Set(body.choices.map(choice=>JSON.stringify(choice))).size,4);
      assert(body.explanation.length>=32);
    }
    for(const invalid of [[],[0,1],[-1],[4],[0.5],[Infinity],Array<number>(1)])
      assert.throws(()=>def.build(invalid),/範囲外/);
  }
});

const facts:Record<number,{valid:readonly number[];review:string}>={
  54:{valid:[1,0,3,1],review:'固定長セル＝ATM、内線＝PBX、初期の低速蓄積パケット、可変フレーム・網内再送なし＝Frame Relay'},
  56:{valid:[1,2,3,0],review:'ネットニュース/時刻同期/メール転送/ネットワーク管理をNNTP/NTP/SMTP/SNMPに対応'},
  57:{valid:[2,1,3,0],review:'物理信号の再生・MAC中継・IP転送・上位プロトコル変換をOSIの役割で判定'},
  58:{valid:[3,0,3,0],review:'物理格納と論理全体を区別。外部スキーマ・サブスキーマの同義域を出題条件に使わない'},
  59:{valid:[3,0,2,1],review:'関係＝組の集合、実現値＝単値、タプル＝属性値の組、定義域＝許容値集合'},
  61:{valid:[1,2,0,3],review:'独立した依存を別関係に置く。短縮・圧縮・高速化だけ・繰返し列固定では正規化の条件を満たさない'},
  63:{valid:[3,1,2,0],review:'カーソルを開いてFETCH、PREPAREは実行前、WHERE CURRENT OFは一行、INSERTにカーソルは不要'},
  64:{valid:[3,1,2,0],review:'鍵分離・公開鍵で共通鍵暗号・対応秘密鍵で復号・共通鍵でデータを暗号'},
  65:{valid:[0,2,1,3],review:'署名は完全性と署名元の真正性を検証、秘密保持・転送・容量・支払いを保証しない'},
  66:{valid:[3,0,1,2],review:'XSS/感染端末遠隔操作/秘匿収集/偽サイトへ誘導を識別'},
  67:{valid:[1,2,0,3],review:'RFC 2818 §3.1ではdNSName優先・なければCN。RFC 9525 §§1.3,4ではSAN DNS-ID使用'},
  68:{valid:[1,2,0,3],review:'通産省H7.11.15ソフトウェア管理ガイドライン1節・4–6節、法人等の適法利用と不正複製防止'},
  69:{valid:[0,1,2,3],review:'UMLはモデリング、IDLはインタフェース、SQLは関係DB、XMLはマークアップ'},
  70:{valid:[3,0,1,2],review:'QRは二方向、Code128はASCIIとコード集合、ITFは数字ペア、JANシンボルはGTIN13/8'},
  71:{valid:[2,0,1,3],review:'期限付きの横断組織、二重所属、同職能、利益責任単位を区別'},
  72:{valid:[3,0,1,3],review:'自己資本への収益・総資産への収益・自己資本と総資本の比率を区別'},
  76:{valid:[1,0,2,3],review:'管理限界と時系列、原因の枝、階級度数、降順項目と累積を区別'},
  79:{valid:[3,0,1,2],review:'口座即時・後払・カード内残高・事前支払を条件に照合'},
  80:{valid:[0,1,2,3],review:'サイト単位、台数、サーバとクライアント、ユーザ単位を切り分ける'},
};
// Each hash binds the manually assessed question and its ordered four options.
const reviewedText: Readonly<Record<number,string>> = {
  54: "3d0a713ed1f81b372e5f8cda5ce80fcc305a8852370483119b2ffa3c0fd485ed",
  56: "7e6404dd02c015f6110eaa0848303ac26c1a763dd41134de7980528f5bb65c03",
  57: "75bf155a3d8599dc8574032321f5db288de8b059ddbee2299d14a6accd05df88",
  58: "449b01fcb854c48b8c6ebd2249c56de54ba5faec384b90492782322ade79a5ef",
  59: "ef9cb32b05a61516cbe8218074ab1cdfa28c015ade52056e89aa26113b086d4f",
  61: "1e499041911b927f81477cd2815fb78c56acef9bf2c8f959b77736c5b99026f6",
  63: "51f64b0285bf3eec0a834c282af68986f28e2ab9f9e9545ae2bf9146b925ee73",
  64: "a6fb20e7fc9ba95c854481d8a9e182edb0fbeddb099f59e231129e2f3c5592e4",
  65: "f584da2b411238ffb4c808139e0d5a82c4ae77258c3e96f4931dcb229b7945c2",
  66: "4ec6ed1d44ea35d83c41e0e54e768e4ad35b77a15d7b9726414d63ecd3d8ffff",
  67: "5eca3f9575d2d3c828d7e4e74b8e544f2989fc3c631a3646c8ece97bcf21369d",
  68: "5e6c1e2e6f36f510395ecee71baba51bb9a5eebfcae648995c99c40547b5dafd",
  69: "080f8051e07f1c8c640ec876253c5b7ae9ccbe182614b031ee9674e180ad1b73",
  70: "36555b45b59df57a9045219cf2d032d940a8212925727dc700f1a701771c3b41",
  71: "1d9aa14b63d58f001701d96203cf74417a330a460da61250683889bbcb417807",
  72: "e29e599c666d945e5cf2b1b6e1f32b102cfcf090598fe75167600c0fc117162e",
  76: "ac5b7ef00e2ef6216cf358660d81cbdc761ec43ec7edae325e0775ab9240c367",
  79: "eff054b8da756513f2e12c17908d375606f82f8e4ea7b5a96b32159a4debe181",
  80: "8bd287fa41ae374f6c2b6a3074c22e501b26356219d13b7dcade82c176b51b07",
};
test('知識19問×四条件の全選択肢を独立査読済み真偽と照合する',()=>{
  for(const [number,{valid,review}] of Object.entries(facts)) {
    assert(review.length>20);
    const audited: [string,string[]][]=[];
    for(let i=0;i<4;i++) {
      const item=q(Number(number),i);
      const displayed=optionText(item);
      for (const choice of displayed) assert(choice.trim()===choice&&choice.length);
      verify(item,displayed.map((_,j)=>j===valid[i]));
      audited.push([text(item),displayed]);
    }
    assert.equal(createHash('sha256').update(JSON.stringify(audited)).digest('hex'),reviewedText[Number(number)]);
  }
});

test('問55の回線利用率と誤答3種を有理数で検算する',()=>{
  const decimal=(numerator:bigint,denominator:bigint)=>Number((numerator*20n+denominator)/(denominator*2n))/10;
  for(let i=0;i<4;i++) {
    const item=q(55,i), data=text(item);
    const [,speed,bytes,interval,pct]=/通信速度([\d,]+)ビット／秒.+平均([\d,]+)バイト.+，(\d+)秒.+転送量の(\d+)％/.exec(data)!;
    const transmitted=BigInt(numbers(bytes))*8n, total=BigInt(numbers(speed))*BigInt(interval);
    const payload=transmitted*100n, withControl=transmitted*(100n+BigInt(pct));
    const answers=[decimal(withControl,total*8n),decimal(payload,total),decimal(withControl,total),decimal(withControl*BigInt(interval)**2n,total)];
    assert.deepEqual(options(item),answers.sort((a,b)=>a-b));
    verify(item,options(item).map(value=>value===decimal(withControl,total)));
  }
});

test('問60の全依存列をすべての行対から検算する',()=>{
  for(let i=0;i<4;i++) {
    const item=q(60,i);
    const {rows,columns}=table(item);
    assert.equal(rows.length,10);
    verify(item,optionText(item).map(choice=>{
      const index=columns.indexOf(choice);
      assert(index>0);
      return rows.every(row=>rows.every(other=>row[0]!==other[0]||row[index]===other[index]));
    }));
  }
});

test('問62の全SQL文をSQLiteで実行する',()=>{
  for(let i=0;i<4;i++) {
    const item=q(62,i);
    const db=new DatabaseSync(':memory:');
    try {
      db.exec('CREATE TABLE 出庫記録(商品番号 TEXT, 日付 TEXT, 数量 INTEGER)');
      const insert=db.prepare('INSERT INTO 出庫記録 VALUES (?,?,?)');
      for(const [code,date,quantity] of table(item).rows) insert.run(code,date,Number(quantity));
      const outcomes=optionText(item).map(sql=>Number(Object.values(db.prepare(sql).get()!)[0]));
      assert.deepEqual(outcomes,[[2,4,3,3],[1.5,4,7,4],[2.5,4,4,7],[1,4,2,3]][i]);
      verify(item,outcomes.map(outcome=>outcomes.every(other=>other<=outcome)));
    } finally { db.close(); }
  }
});

test('問73の後入先出・先入先出・二種平均を1個ずつ追跡して検算する',()=>{
  for(let i=0;i<4;i++) {
    const item=q(73,i), rows=table(item).rows;
    const offers=rows.filter(row=>row[3]).flatMap(row=>Array<number>(Number(row[2])).fill(Number(row[3])));
    const units=offers.length, still:number[]=[], oldest:number[]=[];
    let lifo=0, fifo=0,moving=0,movingCount=0,movingValue=0,sold=0;
    for(const [,activity,countText,costText] of rows) {
      const count=Number(countText),cost=Number(costText);
      if(activity==='前月繰越'||activity==='仕入') {
        still.push(...Array<number>(count).fill(cost));
        oldest.push(...Array<number>(count).fill(cost));
        movingValue+=count*cost;movingCount+=count;
      } else if(activity==='売上') {
        for(let k=0;k<count;k++) {
          lifo+=still.pop()!;fifo+=oldest.shift()!;
          const charge=movingValue/movingCount;
          moving+=charge;movingValue-=charge;movingCount--;sold++;
        }
      } else assert.equal(Number(countText),still.length);
    }
    const periodicLifo=offers.slice(units-sold).reduce((sum,n)=>sum+n,0);
    assert.equal(lifo,periodicLifo);
    const mean=offers.reduce((sum,n)=>sum+n,0)*sold/units;
    assert.deepEqual(options(item),[lifo,fifo,Math.round(moving),Math.round(mean)].sort((a,b)=>a-b));
    verify(item,options(item).map(value=>value===lifo));
  }
});

test('問74の全商品と全候補について，売上上位を飛ばさない組だけを受け入れる',()=>{
  for(let i=0;i<4;i++) {
    const item=q(74,i), {rows}=table(item);
    const data=rows.slice(0,-1).map(row=>row.map(numbers));
    for(const [,count,price,sales] of data) assert.equal(count*price,sales);
    assert.equal(numbers(rows.at(-1)![3]),data.reduce((sum,row)=>sum+row[3],0));
    assert.equal(numbers(rows.at(-1)![1]),data.reduce((sum,row)=>sum+row[1],0));
    verify(item,optionText(item).map(choice=>{
      const chosen=choice.split('と').map(Number);
      return data.filter(row=>chosen.includes(row[0])).every(row=>data.filter(other=>!chosen.includes(other[0]))
        .every(excluded=>row[3]>excluded[3]));
    }));
  }
});

const markup=(body:GeneratedBody,n:number,index:number)=>{
  const block=n===75?body.prompt.find(block=>block.type==='diagram'):body.choices[index][0];
  assert(block?.type==='diagram'&&block.scene.kind==='source_figure');
  const scene=block.scene;
  const render=chartRenderers.find(renderer=>renderer.profile===scene.profile);
  assert(render);
  return renderToStaticMarkup(createElement(render.component,{values:scene.values,caption:block.caption}));
};

test('問75のSVGから境界3区間を読み，確率・補集合の四つの不等式を検算する',()=>{
  for(let i=0;i<4;i++) {
    const item=q(75,i), svg=markup(item,75,0);
    const path=/<path d="([^"]+)" data-oc-curve="true"/.exec(svg)![1];
    const parsed=path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    const raw=Array.from({length:parsed.length/2},(_,p)=>[parsed[p*2],parsed[p*2+1]]);
    const [top,p1,p2,base]=[raw[0],raw[3],raw[6],raw[9]];
    assert(top[0]<p1[0]&&p1[0]<p2[0]&&p2[0]<base[0]);
    assert(top[1]<p1[1]&&p1[1]<p2[1]&&p2[1]<base[1]);
    const normalized=(value:number)=>1-(value-top[1])/(base[1]-top[1]);
    const samples=raw.slice(1).filter((_,j)=>j%3===0).filter((_,j)=>j!==0);
    for(let segment=0;segment<3;segment++) for(let j=0;j<3;j++) {
      assert(raw[3*segment+j][0]<=raw[3*segment+j+1][0]);
      assert(raw[3*segment+j][1]<=raw[3*segment+j+1][1]);
    }
    const L1=normalized(p1[1]), L2=normalized(p2[1]);
    const justBeforeSecond=normalized(samples[0][1]);
    verify(item,[L2>=L1,1-normalized(top[1])>=1-L1,L2>=normalized(base[1]),1-justBeforeSecond<=L2]);
  }
});

function pearson(dots:number[][]) {
  const center=[0,1].map(k=>dots.reduce((sum,point)=>sum+point[k],0)/dots.length);
  const shifted=dots.map(([x,y])=>[x-center[0],y-center[1]]);
  return shifted.reduce((sum,[x,y])=>sum+x*y,0)/Math.sqrt(
    shifted.reduce((sum,[x])=>sum+x*x,0)*shifted.reduce((sum,[,y])=>sum+y*y,0));
}
test('問77の描画点は四候補すべてを表示し，明瞭な線形傾向は一つだけ該当する',()=>{
  for(let i=0;i<4;i++) {
    const item=q(77,i), sign=text(item).includes('負の相関')?-1:1;
    const correlations=item.choices.map((_,j)=>{
      const svg=markup(item,77,j);
      assert.match(svg,/viewBox="0 0 288 246"/);
      const dots=[...svg.matchAll(/<circle cx="([^"]+)" cy="([^"]+)"/g)].map(([,x,y])=>[Number(x),-Number(y)]);
      assert(dots.length>=24&&dots.length<=26);
      const r=pearson(dots);
      assert(Math.abs(r)>=0.65||Math.abs(r)<0.25,'clear separation of intended patterns');
      return r;
    });
    verify(item,correlations.map(r=>r*sign>0.65));
  }
});

test('問78は両資源の範囲内の全整数の箱数を数え上げて最大利益を検算する',()=>{
  for(let i=0;i<4;i++) {
    const item=q(78,i), [,capK,capL]=/Kの1日の最大製造能力は(\d+)個であり，Lの1日の最大製造能力は(\d+)個/.exec(text(item))!.map(Number);
    const [[mk,ml,pm],[nk,nl,pn]]=table(item).rows.map(row=>row.slice(1).map(numbers));
    let max=0,distinct=0;
    for(let m=0;mk*m<=capK&&ml*m<=capL;m++)
      for(let n=0;mk*m+nk*n<=capK&&ml*m+nl*n<=capL;n++){
        const value=m*pm+n*pn;
        if(value>max) {max=value;distinct=0;}
        if(value===max) distinct++;
      }
    assert.equal(distinct,1);
    verify(item,options(item).map(value=>value===max));
  }
});
