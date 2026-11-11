import assert from 'node:assert/strict';
import { readdirSync,readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Block } from '../src/core/types';
import type { GeneratedBody } from '../src/core/generators/definition';
import { legacy2010AutumnAm27To53Definitions as definitions } from '../src/core/generators/legacy-2010-autumn-am-27-53';
import { legacy2010AutumnAm2753Figures as figures } from '../src/core/generators/legacy-2010-autumn-am-27-53-figures';
import { legacy2010AutumnAm2753FigureRenderers as renderers } from '../src/ui/Legacy2010AutumnAm2753Figures';
import source from '../src/core/generators/legacy-2010-autumn-am-27-53-source.json';
import { facts } from './fixtures/legacy-2010-autumn-am-27-53-facts';

const paperKeys = 'イアウエアウアイアイイエイエイイウエアイイアアエイイ';
const numbers=Array.from({length:26},(_,i)=>28+i);
const definition=(n:number)=>definitions[n-28];
const cases=(n:number)=>Array.from({length:definition(n).fields[0].maximum+1},(_,i)=>definition(n).build([i]));
function blockText(block:Block) {
  if(block.type==='diagram')return block.alt;
  if(block.type==='table')return block.rows.map(row=>row.join('｜')).join('。');
  assert.ok(block.type==='paragraph'||block.type==='code');
  return block.text;
}
const prompt=(body:GeneratedBody)=>body.prompt.filter(block=>block.type==='paragraph').map(blockText).join('\n');
const options=(body:GeneratedBody)=>body.choices.map(choice=>{
  assert.equal(choice.length,1);
  return blockText(choice[0]);
});
function compare(body:GeneratedBody,matches:readonly boolean[]) {
  assert.equal(matches.length,4);
  assert.deepEqual(matches.flatMap((yes,i)=>yes?[i]:[]),[body.correctIndex],prompt(body));
}
const verify=(body:GeneratedBody,fn:(option:string,index:number)=>boolean)=>compare(body,options(body).map(fn));

test('公式26問・原番号・基準選択肢・保留除外・有限入力と公開Schema',()=>{
  const folder='docs/public/schemas', ajv=new Ajv2020({strict:false,allErrors:true});
  addFormats(ajv);
  for(const file of readdirSync(folder).filter(file=>file.endsWith('.schema.json')))
    ajv.addSchema(JSON.parse(readFileSync(folder+'/'+file,'utf8')));
  const validate=ajv.getSchema('https://opencbt-fe-kihonjoho.example/schemas/3.0.0/common.schema.json#/$defs/block');
  assert(validate);
  assert.equal(paperKeys.length,numbers.length);
  assert.deepEqual(definitions.map(def=>Number(def.source.split('-').at(-1))),numbers);
  assert.ok(!Object.hasOwn(source,'27'));
  for(const [j,n] of numbers.entries()){
    const d=definition(n), raw=source[String(n) as keyof typeof source], all=cases(n);
    assert.equal(d.source,'2010h22a-fe-am-'+n);
    assert.equal(d.sourceAnswer,paperKeys[j]);
    assert.equal('アイウエ'[all[0].correctIndex!],paperKeys[j]);
    assert.deepEqual(options(all[0]),raw.choices);
    assert.equal(prompt(all[0]).split('\n')[0],raw.prompt.split('\n')[0]);
    assert.deepEqual(d.reference,[0]);
    assert.equal(new Set(all.map(q=>JSON.stringify(q.prompt))).size,all.length);
    const signatures=all.map(q=>blockText(q.choices[q.correctIndex!][0]));
    assert.equal(new Set(signatures).size>1,d.answerVariation!=='fixed',String(n));
    for(const [i,q] of all.entries()){
      assert.equal(q.choices.length,4);
      assert.equal(new Set(options(q)).size,4);
      assert.ok(q.explanation.length>=35);
      assert.deepEqual(q,d.build([i]));
      for(const block of [...q.prompt,...q.choices.flat()])assert.ok(validate(block),JSON.stringify(validate.errors));
    }
    for(const bad of [[],[-1],[all.length],[NaN],[.5],[0,0]])assert.throws(()=>d.build(bad),{code:'PARAMETER_CONSTRAINT'});
  }
});

assert.deepEqual([...Object.keys(facts).map(Number),29,31,33,37,38,39,41,51,52,53].sort((a,b)=>a-b),numbers);
for(const [n,record] of Object.entries(facts)){
  test('問'+n+'の全有限条件と四択の意味を固定査読資料で検証',()=>{
    const all=cases(Number(n)), seen=new Set<RegExp>();
    assert.equal(record.cases.length,all.length);
    assert.ok(record.basis.length&&record.basis.every(url=>url.startsWith('https://')));
    for(const q of all){
      const matching=record.cases.filter(([condition])=>condition.test(prompt(q)));
      assert.equal(matching.length,1,prompt(q));
      const [[condition,claims,correct]]=matching;
      seen.add(condition);
      const roles=new Set<number>();
      verify(q,option=>{
        const matched=claims.flatMap((claim,i)=>claim.test(option)?[i]:[]);
        assert.equal(matched.length,1,option);
        assert.ok(!roles.has(matched[0]),option);
        roles.add(matched[0]);
        return matched[0]===correct;
      });
    }
    assert.equal(seen.size,record.cases.length);
  });
}

test('問29の全候補について二表の関数従属性から結合属性を独立検証',()=>{
  const paper=[
    {ledger:'受注台帳',key:'注文番号',entityKey:'顧客ID',entityFields:['顧客名','顧客住所'],eventFields:['注文年月日','品目','数量','送付先','支払方法','受注金額']},
    {ledger:'貸出台帳',key:'貸出番号',entityKey:'利用者ID',entityFields:['利用者氏名','利用者住所'],eventFields:['貸出年月日','資料名','冊数','返却場所','返却予定日','貸出料']},
    {ledger:'発注台帳',key:'発注番号',entityKey:'仕入先ID',entityFields:['仕入先名','仕入先住所'],eventFields:['発注年月日','品目','数量','納品先','納入予定日','発注金額']},
  ];
  for(const [i,q] of cases(29).entries()){
    const {ledger,key,entityKey,entityFields,eventFields}=paper[i], diagram=q.prompt[1];
    assert.equal(diagram.type,'diagram');
    const written=diagram.alt.match(/^(.+)（([^）]+)）。(.+)に下線。$/s);
    assert(written);
    assert.equal(written[1],ledger);
    assert.equal(written[3],key);
    const listed=written[2].split('，').map(value=>value.trim());
    const entity=new Set([entityKey,...entityFields]), event=new Set([key,...eventFields,entityKey]);
    assert.deepEqual(new Set(listed),new Set([...entity,...event]));
    assert.match(prompt(q),/ごとに決めるものとする。また，表の下線は主キーを表す。/);
    verify(q,option=>event.has(option)&&entity.has(option));
  }
});

test('問31のCREATEと全UPDATEをSQLiteで実行し主キー制約・失敗時の原子性を検証',()=>{
  for(const [i,q] of cases(31).entries()){
    const [ddl,rows]=q.prompt.slice(1);
    assert.equal(ddl.type,'code');assert.equal(rows.type,'table');
    assert.match(ddl.text,/^CREATE TABLE 商品\n {4}\(商品番号 CHAR\(4\), 商品名 CHAR\(20\), 仕入先番号 CHAR\(6\), 単価 INT,\n {4}PRIMARY KEY\(商品番号\)\)$/);
    assert.deepEqual(rows.columns,['商品番号','商品名','仕入先番号','単価']);
    if(i===0)assert.deepEqual(rows.rows,[
      ['S001','A','XX0001','18000'],['S002','A','YY0002','20000'],['S003','B','YY0002','35000'],['S004','C','ZZ0003','40000'],['S005','C','XX0001','38000'],
    ]);
    verify(q,(statement,choice)=>{
      const db=new DatabaseSync(':memory:');
      try{
        // WITHOUT ROWID enforces the SQL primary key's NOT NULL semantics for text keys.
        db.exec(ddl.text+' WITHOUT ROWID');
        const insert=db.prepare('INSERT INTO 商品 VALUES (?,?,?,?)');
        rows.rows.forEach(row=>insert.run(...row));
        const data=()=>db.prepare('SELECT * FROM 商品 ORDER BY 商品番号').all();
        const before=data();
        try{
          const result=db.prepare(statement).run(), after=data();
          assert.equal(result.changes,1);
          assert.equal(after.length,before.length);
          assert.equal(after.filter((row,j)=>JSON.stringify(row)!==JSON.stringify(before[j])).length,1);
          return true;
        }catch(error){
          assert.ok(error instanceof Error);
          assert.match(error.message,choice===2?/NOT NULL constraint failed: 商品.商品番号/:/UNIQUE constraint failed: 商品.商品番号/);
          assert.deepEqual(data(),before);
          return false;
        }
      }finally{db.close();}
    });
  }
});

test('問33の参照整合性をSQLiteの外部キー制約で全候補を実行し照合',()=>{
  for(const [i,q] of cases(33).entries()){
    const [diagram]=q.prompt.slice(1);
    assert.equal(diagram.type,'diagram');
    const groups=diagram.alt.split('。');
    assert.deepEqual([groups[0],groups[1],groups[6],groups[7]],['注文','伝票番号｜顧客番号','顧客','顧客番号｜顧客名']);
    const [orders,customers]=[groups.slice(2,6),groups.slice(8,12)].map(lines=>lines.map(line=>line.split('｜')));
    if(i===0){
      assert.deepEqual(orders,[['0001','C005'],['0002','K001'],['0003','C005'],['0004','D010']]);
      assert.deepEqual(customers,[['C005','福島'],['D010','千葉'],['K001','長野'],['L035','宮崎']]);
    }
    verify(q,option=>{
      const found=/^“(注文|顧客)”表(?:に行|の行)（(.+)｜(.+)）を(追加|削除)する。$/.exec(option);
      assert(found);
      const [,table,key,second,verb]=found, db=new DatabaseSync(':memory:');
      try{
        db.exec('PRAGMA foreign_keys=ON; CREATE TABLE 顧客(顧客番号 TEXT PRIMARY KEY, 顧客名 TEXT); '+
          'CREATE TABLE 注文(伝票番号 TEXT PRIMARY KEY, 顧客番号 TEXT REFERENCES 顧客(顧客番号))');
        const insertCustomer=db.prepare('INSERT INTO 顧客 VALUES (?,?)'), insertOrder=db.prepare('INSERT INTO 注文 VALUES (?,?)');
        customers.forEach(row=>insertCustomer.run(...row));
        orders.forEach(row=>insertOrder.run(...row));
        try{
          const affected=verb==='追加'?db.prepare('INSERT INTO '+table+' VALUES (?,?)').run(key,second).changes:
            db.prepare('DELETE FROM '+table+(table==='顧客'?' WHERE 顧客番号=? AND 顧客名=?':' WHERE 伝票番号=? AND 顧客番号=?')).run(key,second).changes;
          assert.equal(affected,1);
          assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);
          return false;
        }catch(error){
          assert.ok(error instanceof Error);
          assert.match(error.message,/FOREIGN KEY constraint failed/);
          return true;
        }
      }finally{db.close();}
    });
  }
});

test('問37の両LANのサブネット範囲と四組をアドレス区間で照合',()=>{
  for(const [i,q] of cases(37).entries()){
    const m=/共通で255\.255\.255\.(\d+)とする/.exec(prompt(q));
    assert(m);
    const block=q.prompt.at(-1);
    assert.equal(block?.type,'diagram');
    const ips=block.alt.match(/\d+\.\d+\.\d+\.\d+/g);
    assert.equal(ips?.length,6);
    if(i===0)assert.deepEqual(ips,['172.16.0.1','172.16.0.10','172.16.0.130','172.16.1.5','172.16.1.140','172.16.1.20']);
    const span=256-Number(m[1]);
    const eligible=[0,3].flatMap((offset,side)=>{
      const prefix=ips![offset].split('.').slice(0,3).join('.'), port=Number(ips![offset].split('.').at(-1));
      const first=Math.floor(port/span)*span;
      return ips!.slice(offset+1,offset+3).flatMap((ip,j)=>{
        const tail=Number(ip.split('.').at(-1));
        return ip.startsWith(prefix+'.')&&tail>first&&tail<first+span-1?['ABCD'[side*2+j]]:[];
      });
    });
    assert.equal(eligible.length,2);
    verify(q,option=>option===eligible.join('と'));
  }
});

test('問38の宅内接続図と4種類の機能をIETF規格と目的で照合',()=>{
  const concepts=[[/1個のグローバルIPアドレス.*複数のPC/,'NAPT（IPマスカレード）'],[/IPアドレスとデフォルトゲートウェイを自動で配布/,'DHCP'],
    [/Ethernet上のPPPセッション.*確立/,'PPPoE'],[/アドレスやポート番号で判定.*通過/,'パケットフィルタリング']] as const;
  for(const q of cases(38)){
    const match=concepts.filter(([pattern])=>pattern.test(prompt(q)));
    assert.equal(match.length,1);
    assert.deepEqual(options(q),['DHCP','NAPT（IPマスカレード）','PPPoE','パケットフィルタリング']);
    assert.equal(blockText(q.prompt[1]),'利用者宅内。複数のPCがハブへ接続され，ハブから装置A，装置AからONUに接続される。ONUから宅外へ光ファイバケーブル（FTTH）が延びる。');
    verify(q,option=>option===match[0][1]);
  }
});

test('問39の作成・検証／暗号化・復号に用いる鍵を二列の表から独立判定',()=>{
  const purposes=[
    {match:/^ディジタル署名に用いる/,columns:['ディジタル署名の作成に用いる鍵','ディジタル署名の検証に用いる鍵'],pair:'秘密鍵｜公開鍵'},
    {match:/受信者だけが復号/,columns:['暗号化に用いる受信者の鍵','復号に用いる受信者の鍵'],pair:'公開鍵｜秘密鍵'},
    {match:/同じ秘密の鍵を共有するメッセージ認証符号/,columns:['MACの作成に用いる鍵','MACの検証に用いる鍵'],pair:'共通鍵｜共通鍵'},
  ];
  for(const q of cases(39)){
    const [mode,...other]=purposes.filter(mode=>mode.match.test(prompt(q)));
    assert.ok(mode&&other.length===0);
    verify(q,(value,i)=>{
      const block=q.choices[i][0];
      assert.equal(block.type,'table');
      assert.deepEqual(block.columns,mode.columns);
      assert.equal(block.rows.length,1);
      assert.ok(block.rows[0].every(key=>['公開鍵','秘密鍵','共通鍵'].includes(key)));
      return value===mode.pair;
    });
  }
});

test('問41の3手順を機密性・送達・改ざん・送信者認証の独立条件に照合',()=>{
  for(const q of cases(41)){
    const steps=prompt(q);
    assert.deepEqual(steps.match(/（[1-3]）/g),['（1）','（2）','（3）']);
    const evidence=new Map([
      ['送信者による電子メールの送達確認',/受領通知の署名を検証.*識別子を.*照合/.test(steps)],
      ['送信者のなりすましの検出',/送信者の公開鍵で本文の署名を検証/.test(steps)],
      ['電子メールの本文の改ざんの有無の検出',/書換えが防止された共有台帳/.test(steps)&&/本文から計算したハッシュ値と比較/.test(steps)],
      ['電子メールの本文の内容の漏えいの防止',/本文を共通鍵暗号方式で暗号化/.test(steps)&&/共通鍵を受信者の公開鍵を用いて.*暗号化/.test(steps)],
    ]);
    verify(q,option=>{assert.ok(evidence.has(option));return evidence.get(option)!;});
  }
});

test('問51の作業階層と4手法の適用条件を照合',()=>{
  const records=[['システム開発','要件定義プロセス','プロセス開始の準備'],
    ['業務移行','データ移行','移行対象の選定'],['機器更新','設置作業','設置場所の確保'],['教材制作','原稿作成','構成の決定']];
  for(const [i,q] of cases(51).entries()){
    const [root,branch,child]=records[i], alt=blockText(q.prompt[1]);
    assert.ok(alt.startsWith(root+'の下に')&&alt.includes(branch+'の下に'+child));
    const characteristics=new Map([
      ['CPM','日数と依存関係'],['EVM','計画工数と実績'],['PERT','作業の先行・後続と所要時間'],['WBS','作業の階層分解'],
    ]);
    verify(q,option=>{assert.ok(characteristics.has(option));return characteristics.get(option)==='作業の階層分解';});
  }
});

test('問52のダミー方向と全経路をDFSで列挙し四つの日数を独立検算',()=>{
  for(const [i,q] of cases(52).entries()){
    const alt=blockText(q.prompt[1]);
    const links=[...alt.matchAll(/([1-7])→([1-7])が(\d+)日/g)].map(match=>[+match[1],+match[2],+match[3]]);
    assert.deepEqual(links.map(row=>row.slice(0,2)),[[1,2],[2,3],[2,4],[2,5],[3,6],[4,6],[5,6],[6,7]]);
    assert.match(alt,/3→4と4→5の破線矢印はダミー作業/);
    if(i===0)assert.deepEqual(links.map(row=>row[2]),[30,5,30,20,40,25,30,30]);
    links.push([3,4,0],[4,5,0]);
    const walk=(from:number,total:number):number[]=>from===7?[total]:links.filter(row=>row[0]===from)
      .flatMap(([,to,time])=>walk(to,total+time));
    const paths=walk(1,0);
    assert.equal(paths.length,6);
    assert.deepEqual(options(q),['115','120','125','130']);
    const longest=Math.max(...paths);
    assert.equal(longest,[120,115,125,130][i]);
    verify(q,option=>Number(option)===longest);
  }
});

test('問53の工数を本数分だけ反復加算し最少要員を前後の人数で検算',()=>{
  for(const [i,q] of cases(53).entries()){
    const m=/(\d+)日間.*所要工数の(\d+)倍/.exec(prompt(q));
    assert(m);
    const [days,multiple]=[Number(m[1]),Number(m[2])], data=q.prompt[1];
    assert.equal(data.type,'table');
    assert.deepEqual(data.rows.map(row=>row[0]),['入力処理','出力処理','計算処理']);
    const perProgram=data.rows.flatMap(([,count,time])=>Array<number>(Number(count)).fill(Number(time)));
    const total=Array.from({length:multiple+1},()=>perProgram).flat().reduce((sum,time)=>sum+time,0);
    if(i===0)assert.equal(total,855);
    assert.deepEqual(options(q),['8','9','12','13']);
    verify(q,option=>Number(option)*days>=total&&(Number(option)-1)*days<total);
  }
});

test('10図・全状態のSSRと台帳の下線・ダミー矢印',()=>{
  assert.deepEqual(figures.map(figure=>figure.profile),renderers.map(renderer=>renderer.profile));
  assert.equal(figures.length,10);
  for(const [i,figure] of figures.entries()){
    const [[min,max]]=figure.domain;
    assert.equal(min,0);
    assert.throws(()=>figure.validate([-1]),{code:'FIGURE_PROFILE'});
    assert.throws(()=>figure.validate([max+1]),{code:'FIGURE_PROFILE'});
    for(let value=0;value<=max;value++){
      const html=renderToStaticMarkup(createElement(renderers[i].component,{values:[value],caption:'図の検証'}));
      if(html.includes('<svg')){
        const title=/<svg\b[^>]*role="img"[^>]*aria-labelledby="([^"]+)"[^>]*aria-describedby="([^"]+)"/.exec(html);
        assert.ok(title);
        assert.ok(html.includes('<title id="'+title[1]+'">図の検証</title>'));
        assert.ok(html.includes('<desc id="'+title[2]+'">'+figure.alt([value])+'</desc>'));
      }else{
        assert.match(html,/role="group".*aria-description=/s);
      }
      if(figure.profile.endsWith('29-ledger'))assert.match(html,/<u>[^<]+番号<\/u>/);
      if(figure.profile.endsWith('52-network')){
        assert.match(html,/data-dummy="3-4".*stroke-dasharray="5 4"/);
        assert.match(html,/data-dummy="4-5".*stroke-dasharray="5 4"/);
      }
    }
  }
});
