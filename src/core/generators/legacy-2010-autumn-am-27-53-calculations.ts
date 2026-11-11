import { code, p, strings, table } from './definition';
import { finite2010AutumnAm2753 as finite, original } from './legacy-2010-autumn-am-27-53-shared';
import { connections, dummy, ledgerAt, operations, optionIds, projectAt, recordsAt, renderFigure, subnetAt, treeAt } from './legacy-2010-autumn-am-27-53-figures';

const sql = 'CREATE TABLE 商品\n    (商品番号 CHAR(4), 商品名 CHAR(20), 仕入先番号 CHAR(6), 単価 INT,\n    PRIMARY KEY(商品番号))';
const productCases = [
  ['S',['A','B','C','D'],[18000,20000,35000,40000,38000]],
  ['P',['AA','BB','CC','DD'],[13000,22000,32000,41000,39000]],
  ['R',['X','Y','Z','W'],[16000,23000,31000,44000,37000]],
  ['T',['H','I','J','K'],[17000,24000,33000,46000,36000]],
] as const;
const ftthPrompts = [
  original(38).prompt,
  '図のように，LANに接続されている複数のPCを，FTTHを使ってインターネットへ接続する。装置Aは既にWAN接続とアドレス変換を行っている。追加したPCの設定を手作業で行わず，利用できるLAN内IPアドレスとデフォルトゲートウェイを自動で配布するのに必要となる装置Aの機能はどれか。',
  '図のように，LANに接続されている複数のPCを，FTTHを使ってインターネットへ接続する。接続事業者がEthernet上のPPPセッションによって利用者を認証する場合，事業者とそのセッションを確立するのに必要となる装置Aの機能はどれか。',
  '図のように，LANに接続されている複数のPCを，FTTHを使ってインターネットへ接続する。アドレスやポート番号で判定し，許可した通信だけを宅内LANとWANの間で通過させるのに必要となる装置Aの機能はどれか。',
];
const keys = [
  { prompt:original(39).prompt, columns:['ディジタル署名の作成に用いる鍵','ディジタル署名の検証に用いる鍵'],
    options:original(39).choices, correct:3, explanation:'ディジタル署名は署名者の秘密鍵で作り，署名者の公開鍵で検証する。共通鍵を使うアやウ，鍵の向きを反対にしたイは該当しない。' },
  { prompt:'機密性を目的に，公開鍵暗号方式でデータを受信者だけが復号できるようにする場合，用いる鍵の種別に関する組合せのうち，適切なものはどれか。', columns:['暗号化に用いる受信者の鍵','復号に用いる受信者の鍵'],
    options:original(39).choices, correct:1, explanation:'送信者は受信者の公開鍵で暗号化する。復号に用いるのは受信者が保持する秘密鍵である。ア・ウは共通鍵が混在し，エは暗号化と復号で使う鍵が逆である。' },
  { prompt:'送信者と受信者が同じ秘密の鍵を共有するメッセージ認証符号（MAC）で，用いる鍵の種別に関する組合せのうち，適切なものはどれか。ここで，選択肢の秘密鍵とは公開鍵暗号方式の鍵ペアに属する秘密鍵をいう。', columns:['MACの作成に用いる鍵','MACの検証に用いる鍵'],
    options:['共通鍵｜共通鍵','公開鍵｜秘密鍵','秘密鍵｜共通鍵','秘密鍵｜公開鍵'], correct:0, explanation:'MACは作成と検証の両方に共有した共通鍵を用いる。イ・ウ・エの公開鍵暗号方式の鍵ペアや混在する鍵の指定は使わない。' },
];
const mail = [
  { procedure:original(41).details, correct:3, explanation:'受信者の秘密鍵を持つ者が共通鍵を取り出し，本文を復号できる。この手順の暗号化だけでは送達の応答や送信者の認証，改ざんの検証をしていない。' },
  { procedure:'〔手順〕\n（1）送信者は，本文を平文のまま送信し，送信ごとに重複しない識別子をメールへ付ける。\n（2）受信者はメールを受け取ったら，識別子を含む受領通知を作成して，自分の秘密鍵で署名し，送信者へ返す。\n（3）送信者は，確認済みの受信者の公開鍵で受領通知の署名を検証し，通知中の識別子を自分が送った識別子と照合する。', correct:0,
    explanation:'受信者が対象メールを受領したことを，受領通知の署名と識別子で確認できる。通知は本文に署名していない。元のメールの送信者の認証や本文の暗号化も行わない。' },
  { procedure:'〔手順〕\n（1）送信者は，電子メールの本文を平文で送信する前に，本文のハッシュ値を，第三者による書換えが防止された共有台帳に登録する。台帳の閲覧者には登録者の氏名は分からない。\n（2）送信者は，本文と台帳内の参照番号を電子メールで送信する。参照番号は受信者にも事前に通知してある。\n（3）受信者は，事前に通知された参照番号のハッシュ値を台帳から取得し，受信した本文から計算したハッシュ値と比較する。', correct:2,
    explanation:'事前に確定したハッシュ値と受信本文の値を比較し，変更がある場合に検出できる。台帳からメールの送信者は特定できず，本文は平文で，送信者に受領通知も返さない。' },
];
const staffing = [
  { days:95,factor:8,rows:[[20,1],[10,3],[5,9]] },
  { days:90,factor:7,rows:[[24,1],[9,3],[5,7]] },
  { days:85,factor:8,rows:[[27,1],[10,3],[6,9]] },
  { days:80,factor:9,rows:[[22,1],[10,3],[6,8]] },
];

function networkPart(address:string,mask:string) {
  const bytes=address.split('.').map(Number);
  return mask.split('.').map((octet,i)=>Number(octet)&bytes[i]).join('.');
}

function finishDays(index:number) {
  const times=projectAt([index]), latest=Array<number>(8).fill(0);
  const links=[...connections.map(([from,to],i)=>({from,to,duration:times[i]})),...dummy.map(([from,to])=>({from,to,duration:0}))];
  for(let event=2;event<=7;event++)
    latest[event]=Math.max(...links.filter(({to})=>to===event).map(({from,duration})=>latest[from]+duration));
  return latest[7];
}

export const calculationDefinitions = [
  finite(29,'第3正規形に分解する台帳の対象',3,
    '台帳の括弧・主キーの下線と二段の行を保ち，二表の役割と注文単位の条件を対応させる。', index=>{
      const ledger=ledgerAt([index]), source=original(29);
      const prompt=index===0?source.prompt:'次の“'+ledger.name+'”表を“'+ledger.tables[0]+'”表と“'+ledger.tables[1]+
        '”表に分解し，第3正規形にしたとき，両方に必要な属性はどれか。ここで，'+ledger.premise+'ものとする。また，表の下線は主キーを表す。';
      return {prompt:[p(prompt),renderFigure('29-ledger',index)],
        choices:strings([ledger.shared,ledger.attribute,ledger.item,ledger.key]),correctIndex:0,
        explanation:ledger.shared+'は'+ledger.tables[1]+'表の主キーであり，'+ledger.tables[0]+'表から参照する外部キーにもなる。'+
          ledger.attribute+'は'+ledger.tables[1]+'表に置き，'+ledger.item+'と'+ledger.key+'は'+ledger.tables[0]+'表に置く。'};
    }),
  finite(31,'商品番号・商品名・単価の組',productCases.length,
    'CREATE文の継続行，4列5行の表，既存キー衝突・複数行衝突・NULL・非キー更新の4つの役割を維持する。', index=>{
      const [prefix,[a,b,c,d],prices]=productCases[index], keys=prices.map((_,i)=>prefix+'00'+(i+1));
      const names=[a,a,b,c,c], suppliers=['XX0001','YY0002','YY0002','ZZ0003','XX0001'];
      const choices=original(31).choices.map(query=>query.replaceAll("'S00","'"+prefix+"00")
        .replace("商品名 = 'C'","商品名 = '"+c+"'").replace("商品名 = 'D'","商品名 = '"+d+"'"));
      return {prompt:[p(original(31).prompt),code(sql,'sql'),table('商品',['商品番号','商品名','仕入先番号','単価'],
        keys.map((key,i)=>[key,names[i],suppliers[i],String(prices[i])]))],
        choices:choices.map(query=>[code(query,'sql')]),correctIndex:3,
        explanation:'主キーは重複もNULLも許さない。アは既存キー'+keys[0]+'への変更，イは商品名'+c+
          'の2行を同じ新キーへ変更，ウは主キーをNULLにする。エの非キー列である商品名の変更は主キー制約に影響しない。'};
    }),
  finite(33,'顧客番号と注文行の参照関係',3,
    '注文表と顧客表の列の順序を保ち，4つの操作の対象行を同じ枠形式で表示する。',index=>{
      const {orders,customers}=recordsAt([index]);
      const issues=operations.map(({table,action,row})=>table==='顧客'?
        orders.some(([,key])=>key===row[0]):action==='追加'&&!customers.some(([key])=>key===row[1]));
      return {prompt:[p(original(33).prompt),renderFigure('33-records',index)],
        choices:optionIds.map(id=>[renderFigure(id,index)]),correctIndex:issues.indexOf(true),
        explanation:'全ての注文の顧客番号には，顧客表に対応する主キーが必要である。参照されている顧客は削除できず，存在しない顧客の注文は追加できない。ア～エでは'+
          'アイウエ'[issues.indexOf(true)]+'の操作だけで参照の整合性を損なう。注文の削除は参照先に影響しない。'};
    }),
  finite(37,'共通のサブネットマスクと各端末のIPアドレス',4,
    '同じ二つのLANと四端末を保持し，共通マスクと全アドレスを連動させる。端末組合せの4選択肢を固定する。',index=>{
      const {mask,ports,hosts}=subnetAt([index]), source=original(37);
      const correct=hosts.flatMap((host,i)=>networkPart(host,mask)===networkPart(ports[Math.floor(i/2)],mask)?['ABCD'[i]]:[]).join('と');
      return {prompt:[...source.prompt.replace('255.255.255.128',mask).split('\n').map(p),renderFigure('37-network',index)],
        choices:strings(source.choices),correctIndex:source.choices.indexOf(correct),
        explanation:'IPアドレスとマスクの論理積を比較する。左右のルータポートのネットワークは順に'+
          ports.map(port=>networkPart(port,mask)).join('，')+'。端末A～Dは順に'+hosts.map(host=>networkPart(host,mask)).join('，')+
          'となり，自分のLANのルータと一致するのは'+correct+'である。'};
    }),
  finite(38,'宅内装置に必要な機能',ftthPrompts.length,
    '同じ宅内LAN・装置A・ONU・光回線の図を保持し，本文で必要な機能を切り替える。',index=>{
      const explanation=[
        'イ。NAPTは内部のIPアドレスとポートを，外部で共有するIPアドレスと別々のポートに対応付ける。DHCPは設定の配布，PPPoEは接続確立，パケットフィルタリングは通信の許可・拒否を担当する。',
        'ア。DHCPはIPアドレスやデフォルトゲートウェイをLAN内端末へ配布する。変換，事業者との接続確立，パケット通過の判定は別機能である。',
        'ウ。PPPoEはEthernet上でPPPのセッションを確立する。DHCPは設定配布，NAPTはアドレスとポートの変換，パケットフィルタリングは通信制御を行う。',
        'エ。パケットフィルタリングはアドレスやポートを許可規則と照合する。DHCP，NAPT，PPPoEはそれぞれ配布，変換，接続の機能である。',
      ][index];
      return {prompt:[p(ftthPrompts[index]),renderFigure('38-ftth',0)],choices:strings(original(38).choices),
        correctIndex:[1,0,2,3][index],explanation};
    }),
  finite(39,'署名・暗号化・MACで用いる鍵',keys.length,
    '鍵の種別を二列の組合せで問う形式を保ち，目的と二つの操作を切り替える。',index=>{
      const input=keys[index];
      return {prompt:[p(input.prompt)],choices:input.options.map(row=>[table('鍵の組合せ',input.columns,[row.split('｜')])]),
        correctIndex:input.correct,explanation:input.explanation};
    }),
  finite(41,'電子メールで行う三つの送受信手順',mail.length,
    '本文の手順を可変にする。暗号化，識別子付き受領通知，独立した台帳を使うハッシュ照合を区別する。',index=>{
      const input=mail[index];
      return {prompt:[p(original(41).prompt),...input.procedure.split('\n').map(p)],choices:strings(original(41).choices),
        correctIndex:input.correct,explanation:input.explanation};
    }),
  finite(51,'階層化するプロジェクトと作業項目',4,
    '段階的に分解する作業図を保ち，具体的な作業の範囲と親子を変える。CPMやPERTは所要日数・順序のネットワーク，EVMは進捗指標が必要であり，同じ階層図から選ぶ形式にする場合はWBSが固定される。',index=>{
      const [top,,branch]=treeAt([index]);
      return {prompt:[p(original(51).prompt),renderFigure('51-breakdown',index)],choices:strings(original(51).choices),correctIndex:3,
        explanation:'エ。'+top+'を上位の作業として，'+branch.replaceAll('\n','')+'などに分け，さらに細分化した階層はWBSである。CPM・PERTは工程の依存関係や日程を分析し，EVMは費用や進捗の実績を評価する。'};
    },true),
  finite(52,'各実作業の整数日数',4,
    '結合点1～7・実作業8本とダミー3→4・4→5を維持する。5日刻みの4候補は昇順のまま，最長経路が変わる。',index=>{
      const total=finishDays(index), source=original(52);
      return {prompt:[p(source.prompt),renderFigure('52-network',index)],choices:strings(source.choices),correctIndex:source.choices.indexOf(String(total)),
        explanation:'各結合点が発生するには，そこに入る全ての作業が終わっている必要がある。破線のダミー作業は日数を増やさず，先行条件を伝える。結合点1から最も早い時刻を順に計算すると，結合点7は'+total+'日となる。'};
    }),
  finite(53,'開発日数・追加工数倍率・種類別の本数と工数',staffing.length,
    '3種類の本数・整数の人日，コーディング以外の倍率，必要最少人数の切上げと昇順の選択肢を維持する。',index=>{
      const {days,factor,rows}=staffing[index], source=original(53);
      const codeEffort=rows.reduce((sum,[count,cost])=>sum+count*cost,0), total=codeEffort*(factor+1);
      const needed=Math.ceil(total/days);
      return {prompt:[p(source.prompt.replace('95日間',days+'日間').replace('8倍',factor+'倍')),
        table('プログラムの本数とコーディング所要工数',['','プログラム本数','プログラム1本当たりのコーディング所要工数（人日）'],
          rows.map(([count,cost],i)=>[['入力処理','出力処理','計算処理'][i],String(count),String(cost)]))],
        choices:strings(source.choices),correctIndex:source.choices.indexOf(String(needed)),
        explanation:'コーディングは'+rows.map(([count,cost])=>count+'×'+cost).join('＋')+'＝'+codeEffort+
          '人日。設計やテストは別に'+factor+'倍かかるので，合計は'+total+'人日である。'+
          (needed-1)+'人では'+(needed-1)*days+'人日で不足し，'+needed+'人なら'+needed*days+'人日となる。'};
    }),
];
