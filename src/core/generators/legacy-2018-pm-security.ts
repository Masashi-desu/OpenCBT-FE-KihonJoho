/** Pure source-owned code/data. No fixture/runtime source imports. */
import type {Block} from '../types';
import {type GenerationDefinition,type GeneratedBody,figure,p} from './definition';
export const legacy2018SecuritySource='2018h30a-fe-pm-1';
export const legacy2018SecurityUnits = [
  {
    "id": "mandatory-notice",
    "physicalPage": 6,
    "printedPage": 5,
    "kind": "outlined_notice",
    "text": "次の問1は必須問題です。必ず解答してください。"
  },
  {
    "id": "heading",
    "physicalPage": 6,
    "printedPage": 5,
    "kind": "heading",
    "text": "問1 情報セキュリティ事故と対策に関する次の記述を読んで，設問1～3に答えよ。"
  },
  {
    "id": "system-setting",
    "physicalPage": 6,
    "printedPage": 5,
    "kind": "paragraph",
    "text": "自動車の販売代理店であるA社は，Webサイトで自動車のカタログ請求を受け付けている。Webサイトは，Webアプリケーションソフト（以下，Webアプリという）が稼働するWebサーバと，データベースが稼働するデータベースサーバ（以下，DBサーバという）で構成されている。WebサーバはA社のDMZに設置され，DBサーバはA社の社内LANに接続されている。Webサイトの管理はB氏が，A社の社内LANに接続されている保守用PCからアクセスして行っている。カタログ請求者は，Webブラウザからインターネット経由でHTTP over TLSによってWebサイトにアクセスする。"
  },
  {
    "id": "registration-heading",
    "physicalPage": 6,
    "printedPage": 5,
    "kind": "section_heading",
    "text": "〔カタログ請求者の情報の登録〕"
  },
  {
    "id": "consent-purpose-intro",
    "physicalPage": 6,
    "printedPage": 5,
    "kind": "paragraph",
    "text": "A社では，次の目的で，カタログ請求者の情報を保持し，利用することの同意を，カタログ請求者から得ている。"
  },
  {
    "id": "purpose-support",
    "physicalPage": 6,
    "printedPage": 5,
    "kind": "bullet",
    "text": "情報提供や購入支援を行う。"
  },
  {
    "id": "purpose-relogin",
    "physicalPage": 6,
    "printedPage": 5,
    "kind": "bullet",
    "text": "カタログ請求者が別のカタログを請求したいときなどに，登録した電子メールアドレスとパスワードを使用してログインできるようにする。"
  },
  {
    "id": "registration-storage-deletion",
    "physicalPage": 6,
    "printedPage": 5,
    "kind": "paragraph",
    "text": "同意が得られたときは，氏名，住所，電話番号，電子メールアドレス，パスワード，購入予定時期，購入予算，希望車種などの情報を，Webアプリに入力してもらい，データベースに登録している。パスワードはハッシュ化して，それ以外の情報は平文で，データベースに格納している。A社では，カタログ請求者から要求があったときにだけ，データベースからそのカタログ請求者の情報を消去する運用としている。"
  },
  {
    "id": "followup-heading",
    "physicalPage": 6,
    "printedPage": 5,
    "kind": "section_heading",
    "text": "〔カタログ請求者への対応〕"
  },
  {
    "id": "followup",
    "physicalPage": 6,
    "printedPage": 5,
    "kind": "paragraph",
    "text": "A社では，カタログ請求者へのカタログ送付後の購入支援を，データベースに登録されている情報を基に，電子メールと電話で行っている。"
  },
  {
    "id": "incident-heading",
    "physicalPage": 7,
    "printedPage": 6,
    "kind": "section_heading",
    "text": "〔情報セキュリティ事故の発生〕"
  },
  {
    "id": "discovery-response",
    "physicalPage": 7,
    "printedPage": 6,
    "kind": "paragraph",
    "text": "ある日，A社の社員から，“A社のカタログ請求者一覧と称する情報が，インターネットの掲示板に公開されている”とB氏に連絡があった。公開されている情報をB氏が確認したところ，データベースに登録されている情報の一部であったので，自社のデータベースから情報が流出したと判断して上司に報告した。B氏は上司からの指示を受けて，Webサイトのサービスを停止し，情報が流出した原因と流出した情報の範囲を特定することにした。"
  },
  {
    "id": "cause-heading",
    "physicalPage": 7,
    "printedPage": 6,
    "kind": "section_heading",
    "text": "〔情報セキュリティ事故の原因と流出した情報の範囲〕"
  },
  {
    "id": "cause-and-range",
    "physicalPage": 7,
    "printedPage": 6,
    "kind": "paragraph_with_underlined_clause_and_ruby",
    "underlinedClause": {
      "marker": "①",
      "literal": "インターネット経由でSQLインジェクション攻撃を行い，",
      "scope": "entireattackclause notjustSQLword"
    },
    "ruby": [
      {
        "base": "脆",
        "reading": "ぜい",
        "placement": "first 脆弱性 only"
      }
    ],
    "text": "B氏の調査の結果，WebアプリにSQLインジェクションの脆弱性があることが分かった。このことからB氏は，攻撃者が①インターネット経由でSQLインジェクション攻撃を行い，データベースに登録されているカタログ請求者の情報を不正に取得したと推測した。Webサーバとデータベースではアクセスログを取得しない設定にしていたこともあり，流出した情報の範囲は特定できなかった。そこで，データベースに登録されている全ての情報が流出したことを前提に，A社では，データベースに登録されている全てのカタログ請求者に情報の流出について連絡するとともに，対策を講じることにした。"
  },
  {
    "id": "measures-heading",
    "physicalPage": 7,
    "printedPage": 6,
    "kind": "section_heading",
    "text": "〔情報セキュリティ事故を踏まえたシステム面での対策〕"
  },
  {
    "id": "table-intro",
    "physicalPage": 7,
    "printedPage": 6,
    "kind": "paragraph",
    "text": "B氏は，今回の情報セキュリティ事故を踏まえたシステム面での対策案を，表1のようにまとめた。"
  },
  {
    "id": "table1",
    "physicalPage": 7,
    "printedPage": 6,
    "kind": "two_column_measures_table",
    "caption": "表1 情報セキュリティ事故を踏まえたシステム面での対策案",
    "header": [
      "目的",
      "対策"
    ],
    "rows": [
      {
        "purpose": "SQLインジェクション攻撃からの防御",
        "measures": [
          {
            "bullet": true,
            "text": "SQL文の組立てはプレースホルダで実装する。"
          },
          {
            "bullet": true,
            "blank": "a"
          }
        ]
      },
      {
        "purpose": "情報流出リスクの低減",
        "measures": [
          {
            "bullet": true,
            "blank": "b"
          }
        ]
      },
      {
        "purpose": "情報流出の原因と流出した情報の範囲の特定",
        "measures": [
          {
            "bullet": true,
            "blank": "c"
          }
        ]
      }
    ],
    "geometry": "3purpose rows; firstrow two bullets inside one measure cell; full2column header; abc outlinedboxes eachonce; no extra row splitting originalfirstpurpose"
  },
  {
    "id": "sub1",
    "physicalPage": 8,
    "printedPage": 7,
    "kind": "question",
    "text": "設問1 本文中の下線①について，この攻撃の説明として適切な答えを，解答群の中から選べ。"
  },
  {
    "id": "sub1-group-heading",
    "physicalPage": 8,
    "printedPage": 7,
    "kind": "choice_group_heading",
    "text": "解答群"
  },
  {
    "id": "sub2",
    "physicalPage": 8,
    "printedPage": 7,
    "kind": "question_with_unlabeled_box",
    "runs": [
      "設問2 表1中の",
      {
        "unlabeledOutlinedBox": true
      },
      "に入れる対策として最も適切な答えを，解答群の中から選べ。"
    ]
  },
  {
    "id": "a-group-heading",
    "physicalPage": 8,
    "printedPage": 7,
    "kind": "choice_group_heading",
    "text": "aに関する解答群"
  },
  {
    "id": "b-group-heading",
    "physicalPage": 8,
    "printedPage": 7,
    "kind": "choice_group_heading",
    "text": "bに関する解答群"
  },
  {
    "id": "c-group-heading",
    "physicalPage": 9,
    "printedPage": 8,
    "kind": "choice_group_heading",
    "text": "cに関する解答群"
  },
  {
    "id": "sub3",
    "physicalPage": 9,
    "printedPage": 8,
    "kind": "question_with_story",
    "text": "設問3 B氏は上司から，表1にまとめた対策案だけで十分なのか検討せよとの指示を受けた。そこで，社外のセキュリティコンサルタント会社に相談したところ，“Webアプリに脆弱性がないか調査をした方がよい”と助言され，Webアプリの一部について脆弱性の調査を依頼した。その結果，クロスサイトスクリプティングの脆弱性が存在することが判明した。また，“Webアプリの他の部分にも脆弱性があることが疑われるので，Webアプリ全体の調査を行うとともに，新たな対策を講じた方がよい”と助言された。新たな対策として適切な答えを，解答群の中から選べ。"
  },
  {
    "id": "sub3-group-heading",
    "physicalPage": 9,
    "printedPage": 8,
    "kind": "choice_group_heading",
    "text": "解答群"
  }
] as const;
export const legacy2018SecurityChoiceGroups = [
  {
    "id": "sub1",
    "physicalPage": 8,
    "printedPage": 7,
    "shared": false,
    "choices": [
      {
        "id": "choice-sub1-1",
        "label": "ア",
        "text": "攻撃者が，DNSに登録されているドメインの情報をインターネット経由で外部から改ざんすることによって，カタログ請求者を攻撃者のWebサイトに誘導し，カタログ請求者のWebブラウザで不正スクリプトを実行させる。"
      },
      {
        "id": "choice-sub1-2",
        "label": "イ",
        "text": "攻撃者が，インターネット経由でDBサーバに不正ログインする。"
      },
      {
        "id": "choice-sub1-3",
        "label": "ウ",
        "text": "攻撃者が，インターネット経由でWebアプリに，データベース操作の命令文を入力することによって，データベースを不正に操作する。"
      },
      {
        "id": "choice-sub1-4",
        "label": "エ",
        "text": "攻撃者が，インターネット経由で送信されている情報を盗聴する。"
      }
    ],
    "partIds": [
      "sub1"
    ]
  },
  {
    "id": "a",
    "physicalPage": 8,
    "printedPage": 7,
    "shared": false,
    "choices": [
      {
        "id": "choice-a-1",
        "label": "ア",
        "text": "Webアプリへの入力パラメタには，Webサーバ内のファイル名を直接指定できないようにする。"
      },
      {
        "id": "choice-a-2",
        "label": "イ",
        "text": "Webサーバのメモリを直接操作するような命令を記述できないプログラム言語を用いて，Webアプリを作り直す。"
      },
      {
        "id": "choice-a-3",
        "label": "ウ",
        "text": "Webページに出力する要素に対して，エスケープ処理を施す。"
      },
      {
        "id": "choice-a-4",
        "label": "エ",
        "text": "データベース操作の命令文の組立てを文字列連結によって行う場合は，連結する文字列にエスケープ処理を施す。"
      }
    ],
    "partIds": [
      "a"
    ]
  },
  {
    "id": "b",
    "physicalPage": 8,
    "printedPage": 7,
    "shared": false,
    "choices": [
      {
        "id": "choice-b-1",
        "label": "ア",
        "text": "カタログ請求者の情報の適切な保管期間を定め，カタログ請求者の同意を得た上で，保管期間を過ぎた時点でデータベースから消去する。"
      },
      {
        "id": "choice-b-2",
        "label": "イ",
        "text": "カタログ請求者の情報を，カタログ送付後に直ちに，データベースから消去する。"
      },
      {
        "id": "choice-b-3",
        "label": "ウ",
        "text": "カタログ請求者へ送付する電子メールにディジタル署名を付ける。"
      },
      {
        "id": "choice-b-4",
        "label": "エ",
        "text": "データベースに登録されている情報を定期的にバックアップする。"
      }
    ],
    "partIds": [
      "b"
    ]
  },
  {
    "id": "c",
    "physicalPage": 9,
    "printedPage": 8,
    "shared": false,
    "choices": [
      {
        "id": "choice-c-1",
        "label": "ア",
        "text": "Webサイトの管理に使用する保守用PCは，必要なときだけ起動する。"
      },
      {
        "id": "choice-c-2",
        "label": "イ",
        "text": "WebサーバとDBサーバにインストールするミドルウェアは，必要最小限にする。"
      },
      {
        "id": "choice-c-3",
        "label": "ウ",
        "text": "WebサーバとDBサーバのハードディスクのデフラグメンテーションを，定期的に行う。"
      },
      {
        "id": "choice-c-4",
        "label": "エ",
        "text": "データベースへのアクセスログを取得する。"
      }
    ],
    "partIds": [
      "c"
    ]
  },
  {
    "id": "sub3",
    "physicalPage": 9,
    "printedPage": 8,
    "shared": false,
    "choices": [
      {
        "id": "choice-sub3-1",
        "label": "ア",
        "text": "DBサーバを，Webサーバと同じく，DMZに設置する。"
      },
      {
        "id": "choice-sub3-2",
        "label": "イ",
        "text": "不正な通信を遮断するために，WAF（Web Application Firewall）を導入する。"
      },
      {
        "id": "choice-sub3-3",
        "label": "ウ",
        "text": "Webサーバを増設して冗長化した構成にする。"
      },
      {
        "id": "choice-sub3-4",
        "label": "エ",
        "text": "保守用PCのログインパスワードには英数字及び記号を使用し，推測が難しい複雑なものを設定する。"
      }
    ],
    "partIds": [
      "sub3"
    ]
  }
] as const;
export const legacy2018SecurityAvailability = [
  "データベースに登録されている情報を定期的にバックアップする。",
  "DBサーバを二重化し，障害時に待機系へ切り替えて処理を継続できるようにする。",
  "停電時にもDBサーバの処理を継続できるように，予備電源を設置する。",
  "DBサーバに接続する通信経路を二重化し，一方の経路が故障しても通信できるようにする。"
] as const;
export const legacy2018SecurityProfiles=['legacy-2018-security-mandatory-notice','legacy-2018-security-attack-evidence','legacy-2018-security-measure-table'] as const;
export function legacy2018SecurityFigureAllowed(profile:string,values:number[]){return Array.isArray(values)&&values.length===1&&Number.isInteger(values[0])&&((profile===legacy2018SecurityProfiles[1]&&(values[0]===0||values[0]===1))||((profile===legacy2018SecurityProfiles[0]||profile===legacy2018SecurityProfiles[2])&&values[0]===0));}
export function checkedLegacy2018SecurityValues(values:number[]){
 if(!Array.isArray(values)||Object.getPrototypeOf(values)!==Array.prototype)throw Error('PARAMETER_CONSTRAINT');
 const keys=Reflect.ownKeys(values);if(keys.length!==2||!keys.includes('0')||!keys.includes('length'))throw Error('PARAMETER_CONSTRAINT');
 const d=Object.getOwnPropertyDescriptor(values,'0');if(!d||!('value'in d)||!Number.isInteger(d.value)||d.value<0||d.value>3)throw Error('PARAMETER_CONSTRAINT');
 return d.value as number;
}
export function legacy2018SecurityUnitBlocks():Block[]{return legacy2018SecurityUnits.map(u=>{
 if(u.id==='mandatory-notice')return figure(legacy2018SecurityProfiles[0],[0],'必須問題',u.text);
 if(u.id==='cause-and-range')return figure(legacy2018SecurityProfiles[1],[0],'情報セキュリティ事故の原因と流出した情報の範囲',u.text);
 if(u.id==='sub2')return figure(legacy2018SecurityProfiles[1],[1],'設問2','設問2 表1中の空欄に入れる対策として最も適切な答えを，解答群の中から選べ。');
 if(u.id==='table1')return figure(legacy2018SecurityProfiles[2],[0],u.caption,'目的と対策の2列。SQLインジェクション攻撃からの防御はプレースホルダ実装と空欄a。情報流出リスクの低減は空欄b。情報流出の原因と流出した情報の範囲の特定は空欄c。');
 if(u.kind==='heading'||u.kind==='section_heading')return{type:'heading',text:u.text,level:2};
 if(u.kind==='bullet')return{type:'list',items:[u.text],ordered:false};
 return p(u.text);
 });}
export const legacy2018SecurityDefinitions:GenerationDefinition[]=[{
 source:legacy2018SecuritySource,title:'情報セキュリティ事故と対策',version:'3.2.0',sourceAnswer:'ウエアエイ',fields:[{name:'availabilityDistractorProfile',minimum:0,maximum:3}],reference:[0],answerVariation:'fixed',
 notes:'原25単位/4頁/20固有択/5ordered欄を保持。b第四誤答の可用性対策だけをバックアップ/サーバ待機系/予備電源/通信経路の4条件へバインドする。正答意味1/役割1。SQLi事故/全前提/a/c/設問3は固定。3profile/素材/通常Run/保存/配布admissionは未統合。有限4入力の枯渇を原問再利用で隠さない。',
 build(values):GeneratedBody{
  const v=checkedLegacy2018SecurityValues(values);
  const choices=legacy2018SecurityChoiceGroups.flatMap(g=>g.choices.map((x,i)=>[p(g.id==='b'&&i===3?legacy2018SecurityAvailability[v]:x.text)]));
  const answerParts=legacy2018SecurityChoiceGroups.map((g,i)=>({id:'part-'+g.id,label:g.id==='sub1'?'設問1 解答群':g.id==='sub3'?'設問3 解答群':g.id+'に関する解答群',choiceIds:Array.from({length:4},(_,k)=>'choice-value-'+(i*4+k+1))}));
  return{prompt:legacy2018SecurityUnitBlocks(),choices,answerParts,partAnswers:[2,3,0,3,1].map((n,i)=>({kind:'choice',partId:answerParts[i].id,choiceId:answerParts[i].choiceIds[n]})),explanation:
  '設問1は，外部入力を通じてSQL命令を実行させ，データベースを不正操作するSQLインジェクションである。DNS情報の改ざん，DBサーバへの不正ログイン，通信の盗聴とは攻撃の経路が異なる。空欄aでは，文字列連結でSQL命令文を組み立てる場合のSQL文脈に合うエスケープ処理を選ぶ。表1のプレースホルダによる命令と値の分離と併せて考え，Webページ出力用のエスケープをSQL対策として流用しない。空欄bは，購入支援と再ログインの目的も踏まえ，適切な保管期間と本人の同意を定め，期間後に消去する対策である。送付直後の一律消去は継続利用の目的に合わず，電子メールへの署名はDBの情報量を減らさない。今回の可用性対策「'+legacy2018SecurityAvailability[v]+'」も，その障害への備えであり，保管情報の削減やアクセス記録の取得にはならない。空欄cはDBへのアクセスログを取得する対策である。ログは今後の追跡に必要な記録を残すが，既に失われた過去の記録を復元せず，SQLインジェクション自体を防止したり流出範囲を必ず全て確定したりする保証でもない。設問3では，Webアプリ全体の調査と修正に加え，HTTP要求などを検査するWAFを導入する。WAFだけであらゆる脆弱性が解消するわけではない。DBをDMZへ移すこと，Webサーバの冗長化，保守用PCのパスワード強化は，本文で判明したWebアプリへの攻撃を防ぐ追加策の代わりにはならない。'
  };
 }
}];
