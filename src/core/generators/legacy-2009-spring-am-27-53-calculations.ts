import { code, p, strings, table } from './definition';
import { finite, original } from './legacy-2009-spring-am-27-53-shared';
import { arrowCases, drawing, mailAt, normalizationCases } from './legacy-2009-spring-am-27-53-figures';

const orderMonths=[3,2,4,2] as const;
const orders=finite(29,'過去の受注額の粒度・担当者の履歴・集計期間',
  '四つのファイルと四種類の出力を保持し，顧客別・商品別の過去集計の粒度と担当者対応の保存を変更する。顧客と商品のクロス集計は復元できない。',index=>{
    const months=orderMonths[index];
    const history=['前月受注額',...Array.from({length:months-1},(_,i)=>(i+2)+'か月前受注額')].join('，');
    const productHistory=index===2?'担当者コード別の'+history:history;
    const customerHistory=index===1?'担当者コード（各月時点），'+history:history;
    const rows=[
      ['顧客マスタファイル','顧客コード，名称，担当者コード，'+customerHistory,
        index===0?'各顧客の担当者は1人':index===1?'各顧客について各月の担当者1人を保存':'各顧客の担当者は1人。担当者コードは当月分だけを保存'],
      ['商品マスタファイル','商品コード，名称，'+productHistory,index===2?'商品と担当者の組合せごとに保存':'―'],
      ['担当者マスタファイル','担当者コード，氏名'+(index===3?'，商品コード別の'+history:''),index===3?'担当者と商品の組合せごとに保存':'―'],
      ['当月受注ファイル','顧客コード，商品コード，受注額','当月の合計受注額'],
    ];
    const stem=index===0?original(29).prompt:'ある企業では，顧客マスタファイル，商品マスタファイル，担当者マスタファイル及び当月受注ファイルを使って月次の受注実績を把握している。'+
      (index===1?'顧客の担当者が月によって変わるので，各月に実際に担当した担当者の実績として集計する。':
        '顧客の担当者は月によって変わることがあり，各月に実際に担当した担当者の実績として集計する。')+
      '表の四つのファイルから当月分と直前の'+months+'か月分を出力できる受注実績はどれか。';
    return {
      prompt:[p(stem),table('ファイルの項目',['ファイル','項目','備考'],rows)],
      choices:strings(original(29).choices),correctIndex:index<2?3:2,
      explanation:index<2?'当月は受注ファイルの顧客コードで担当者を引き，過去分は顧客別の受注額を'+
        (index===1?'各月の':'各顧客の')+'担当者に対応付けられる。過去に顧客と商品を組み合わせた明細がないため，その粒度の出力はできない。':
        (index===2?'商品マスタ':'担当者マスタ')+'には過去の受注額が商品と担当者の組合せごとに残る。当月は顧客コードから当月の担当者を引ける。顧客マスタに過去の担当者対応がないので，担当者別の顧客別実績は復元できない。',
    };
  });

const normal=finite(32,'実体間の繰返しと属性を決定するキー',
  '四択の関係の枠と主キー下線を保持し，追加属性が一方の実体に従属する場合と組合せに従属する場合を切り替える。',index=>{
    const {relation,columns,owner,premise}=normalizationCases[index];
    const [left,leftName,right,rightName,extra]=columns;
    const stem=index===0?original(32).prompt:'“'+relation+'”表を第3正規形にしたものはどれか。'+premise+'ここで，下線部は主キーを表す。';
    const determinant=owner==='pair'?left+'と'+right+'の組合せ':owner==='left'?left:right;
    return {
      prompt:[p(stem),p(relation+'（'+left+'，'+leftName+'，{'+right+'，'+rightName+'，'+extra+'}）'),p('（{ } は繰返しを表す）')],
      choices:(['32-a','32-i','32-u','32-e'] as const).map(id=>[drawing(id,index)]),
      correctIndex:owner==='pair'?2:3,
      explanation:left+'から'+leftName+'，'+right+'から'+rightName+'が決まり，'+extra+'は'+determinant+
        'に従属する。二つの実体とその組合せを別表にし，各非キー属性をそれを決めるキーの表に置く。',
    };
  });

const views=[
  ['製品','売上','売上報告','製品番号','製品名','単価','納品数','売上年月日','売上金額'],
  ['部材','入庫','入庫報告','部材番号','部材名','単価','入庫数','入庫年月日','入庫金額'],
  ['備品','貸出','貸出報告','備品番号','備品名','日額','貸出日数','貸出年月日','貸出金額'],
  ['商品','発注','発注報告','商品番号','商品名','単価','発注数','発注年月日','発注金額'],
] as const;
const view=finite(33,'ビューの元となる二表と算出列',
  'CREATE VIEW・a空欄・SELECT候補4つ・表名と列名の表を保持し，結合するID，列，算出金額の単位を変える。',index=>{
    const [master,records,view,id,name,price,amount,date,total]=views[index];
    const stem=index===0?original(33).prompt:'関係データベースの “'+master+'” 表と “'+records+'” 表から，'+view+'のビュー表を定義するSQL文中のaに入るものはどれか。';
    const sql='CREATE VIEW '+view+'('+[id,name,amount,date,total].join(',')+')\n    AS ［a］ '+master+'.'+id+','+master+'.'+name+','+
      records+'.'+amount+','+records+'.'+date+',\n    '+records+'.'+amount+' * '+master+'.'+price+'\n        FROM '+master+','+
      records+'\n        WHERE '+master+'.'+id+' = '+records+'.'+id;
    return {
      prompt:[p(stem),code(sql,'sql'),table('表名と列名',['表名','列名'],[[master,[id,name,price].join('，')],[records,[id,amount,date].join('，')]])],
      choices:original(33).choices.map(choice=>[code(choice,'sql')]), correctIndex:3,
      explanation:'ビューはSELECTの問合せ結果として定義する。二表を'+id+'で結合し，'+amount+'×'+price+'を'+total+'として求める。',
    };
  },true);

const networkCases=[[1.5,12,50],[2,24,50],[3,12,50],[2.5,25,40]] as const;
const rate=finite(36,'伝送路の速度・データ量・回線利用率',
  '元の小数1桁の伝送速度，整数秒と昇順を保持する。バイトとビットの取り違え，回線利用率の無視と逆適用を誤答とする。',index=>{
    const [speed,megabytes,use]=networkCases[index];
    const bare=megabytes*8/speed, seconds=bare/(use/100);
    const values=index===0?[16,32,64,128]:[seconds/8,bare*(use/100),bare,seconds];
    return {
      prompt:[p(speed+' Mビット／秒の伝送路を用いて'+megabytes+' Mバイトのデータを転送するために必要な伝送時間は何秒か。ここで，回線利用率を'+use+'％とする。')],
      choices:strings(values.map(String)),correctIndex:3,
      explanation:'転送する量は'+megabytes+'×8＝'+megabytes*8+' Mビット。実効速度は'+speed+'×'+use+'％＝'+speed*use/100+
        ' Mビット／秒なので，割って'+seconds+'秒となる。',
    };
  });

const ips=['10.128.192.10','172.20.44.7','192.168.12.11','224.1.0.12'] as const;
const ipClass=finite(38,'クラス方式で分類するIPv4アドレス',
  '先頭オクテットの先頭ビット列で決まる旧IPv4クラスを，A〜Dすべての範囲から選ぶ。',index=>{
    const ip=ips[index], first=Number(ip.split('.')[0]);
    const correctIndex=first<128?0:first<192?1:first<224?2:3;
    const binary=first.toString(2).padStart(8,'0');
    const leading=['0','10','110','1110'][correctIndex];
    return {
      prompt:[p(index===0?original(38).prompt:'IPv4のクラス方式で，IPアドレス'+ip+'のアドレスクラスはどれか。')],
      choices:strings(original(38).choices),correctIndex,
      explanation:'先頭オクテット'+first+'は2進数で'+binary+'。先頭のビットが'+leading+'の範囲はクラス'+
        'ABCD'[correctIndex]+'である。クラスDはマルチキャストの範囲である。',
    };
  });

const mailPrompts=[
  original(39).prompt,
  '図の環境で，クライアントはメールをサーバ上のフォルダに残したまま参照し，フォルダ構成をサーバと同期する。図で利用される①～③のプロトコルの組合せとして，適切なものはどれか。',
  '図の環境で，複数の端末から同じ受信箱を開くため，メール本文と既読状態をサーバ上で管理する。図で利用される①～③のプロトコルの組合せとして，適切なものはどれか。',
  '図の環境で，受信箱のメールを端末に取り込む。端末とサーバ間でフォルダや既読状態を同期させる必要はない。図で利用される①～③のプロトコルの組合せとして，適切なものはどれか。',
] as const;
const mail=finite(39,'クライアントによるメールの受信・保存方法',
  '元の①送信②受信③転送の図と表を保持し，サーバ上の状態同期が必要か，端末への取込みかを変更する。',index=>{
    const {receive}=mailAt(index), send='SMTP';
    const rows=[[receive,receive,send],[receive,send,receive],[send,receive,send],[send,send,send]];
    return {
      prompt:[p(mailPrompts[index]),drawing('39-mail',index)],
      choices:rows.map(row=>[table('利用するプロトコル',['①','②','③'],[row])]),correctIndex:2,
      explanation:'①メール送信と③サーバ間の転送にはSMTP（Simple Mail Transfer Protocol）を用いる。②は'+
        (receive==='POP3'?'メールを取り込むPOP3（Post Office Protocol version 3）':'サーバ上のメールを扱うIMAP4（Internet Message Access Protocol version 4）')+'を用いる。',
    };
  });

const keyCases=[
  ['商店','顧客','注文',true],
  ['病院','検査機関','検査結果',false],
  ['書店','取次会社','在庫照会',true],
  ['倉庫','店舗','出荷予定',false],
] as const;
const privacy=finite(40,'メッセージの送信者・受信者と受信側の鍵',
  '鍵の種類の2×2表を維持し，左側と右側のどちらが受信者かを変える。秘密通信の暗号化と復号はどちらの条件でも受信者の鍵対。',index=>{
    const [first,second,message,firstReceives]=keyCases[index];
    const [sender,recipient]=firstReceives?[second,first]:[first,second];
    const stem=index===0?original(40).prompt:sender+'から'+recipient+'へネットワークを通じて'+message+'（メッセージ）を送る。'+
      '公開鍵暗号方式を利用して，'+message+'の内容が第三者に分からないようにしたい。'+first+'，'+second+'がそれぞれ利用する，'+recipient+'の公開鍵と秘密鍵の適切な組合せはどれか。';
    const rows=original(40).choices.map(option=>option.split('｜'));
    return {
      prompt:[p(stem)],choices:rows.map(row=>[table('利用する鍵',[first+'が利用する',second+'が利用する'],[row])]),
      correctIndex:firstReceives?2:1,
      explanation:sender+'が'+recipient+'の公開鍵で暗号化する。'+recipient+'は自分の秘密鍵で復号する。秘密鍵を'+sender+'に配布する必要はない。',
    };
  });

const arrow=finite(51,'工程の各矢線の日数と先行する経路',
  '節点A～Iと矢線・0日起点・凡例・パスとH開始日の2×2表を固定する。日数を変更し，Hへの遅い経路と全体の最長パスを独立に切り替える。',index=>{
    const [ab,ac,af,be,cd,de,dh,fg,gh,ei,hi]=arrowCases[index];
    const routes=[ab+be+ei,ac+cd+de+ei,ac+cd+dh+hi,af+fg+gh+hi];
    const path=routes.indexOf(Math.max(...routes));
    const predecessors=[ac+cd+dh,af+fg+gh];
    const days=[...predecessors].sort((a,b)=>a-b);
    const rows=['A−B−E−I','A−C−D−E−I'].flatMap(path=>days.map(day=>[path,String(day)]));
    return {
      prompt:[p(original(51).prompt),drawing('51-arrow',index)],
      choices:rows.map(row=>[table('パスと開始日',['クリティカルパス','Hの最早開始日'],[row])]),
      correctIndex:path*2+1,
      explanation:'Hへ至る二経路の日数は'+predecessors.join('日と')+'日。両方の完了を待つのでHは'+days[1]+
        '日から開始できる。Iまでの経路の日数を比べると，'+rows[path*2][0]+'が'+routes[path]+'日で最長である。',
    };
  });

const workCases=[
  {start:1,plan:[2,5,1,4,2,3],done:25},
  {start:8,plan:[3,3,2,4,2,2],done:50},
  {start:1,plan:[3,6,2,6,2,2],done:50},
  {start:1,plan:[4,7,2,6,1,2],done:50},
] as const;
const stages=['仕様書作成','プログラム設計','テスト計画書作成','コーディング','コンパイル','テスト'];
const weekdays='日月火水木金土';
function schedule(start:number,plan:readonly number[]) {
  let date=new Date(Date.UTC(2009,5,start));
  return plan.map(effort=>{
    let finish=date;
    for(let work=0;work<effort;) {
      const weekday=date.getUTCDay();
      if(weekday>0&&weekday<6) {finish=date;work++;}
      date=new Date(+date+86400000);
    }
    return finish;
  });
}
const label=(date:Date,weekday=false)=>(date.getUTCMonth()+1)+'月'+date.getUTCDate()+'日'+(weekday?'（'+weekdays[date.getUTCDay()]+'）':'');
const work=finite(53,'開発計画の工数・着手日・コーディングの実績',
  '1人・週5日・予定の工数と日付・実績の進捗割合を保持する。各期日を営業日で計算し，予定残量と実績の完了割合を区別する。',index=>{
    const {start,plan,done}=workCases[index], dates=schedule(start,plan);
    const cutoff=label(dates[3]);
    const total=plan.reduce((sum,days)=>sum+days,0);
    const complete=plan.slice(0,3).reduce((sum,days)=>sum+days,0)+plan[3]*done/100;
    const remaining=total-complete, answer=Math.round(100*remaining/total);
    const values=index===0?[30,47,52,53]:[
      Math.round(100*(plan[4]+plan[5])/total),answer,Math.floor(100*complete/total),Math.round(100*complete/total),
    ];
    return {
      prompt:[p(index===0?original(53).prompt:'表は，1人で行うプログラム開発の開始時点での計画表である。6月'+start+'日に作業を開始し，'+cutoff+
        'の終了時点でコーディング作業の'+done+'％が終了した。'+cutoff+'の終了時点で残っている作業は全体の約何％か。ここで，開発は，土日を除く週5日間に行うものとする。'),
      table('プログラム開発の計画表',['作業','計画工数','完了予定日'],stages.map((stage,i)=>[stage,plan[i]+'日',label(dates[i],true)]))],
      choices:strings(values.map(String)),correctIndex:1,
      explanation:'計画工数は合計'+total+'日分。コーディングを含む実績は'+complete+'日分で，残りは'+remaining+
        '日分である。残りを全体で割ると約'+answer+'％となる。',
    };
  });

export const calculationDefinitions=[orders,normal,view,rate,ipClass,mail,privacy,arrow,work];
