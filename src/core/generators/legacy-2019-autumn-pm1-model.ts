/** Reviewed IPA2019 autumn PM1 facts. No executable content from question data. */
export const legacy2019TeleworkSource = {
  "source": "2019r01a-fe-pm-1",
  "title": "テレワークの導入",
  "checkedAtUTC": "2026-10-23T04:07:52.769394+00:00",
  "method": "原PDFの物理p1〜9及び公式解答p1をレンダリング画像で目視。本文は改行/空白を正規化した査読転記であり、原組版/字形はpixelsとPDFを正本とする。OCRだけでの確定ではない。",
  "pages": [
    5,
    6,
    7,
    8,
    9
  ],
  "page5": {
    "mandatoryNotice": "次の問1は必須問題です。必ず解答してください。",
    "paragraphs": [
      "問1 テレワークの導入に関する次の記述を読んで、設問1〜3に答えよ。",
      "ソフトウェア開発会社であるA社では、従業員が働き方を柔軟に選択できるように、場所や時間の制約を受けずに働く勤務形態であるテレワークを導入することにした。",
      "A社には、事務業務だけが行えるPC（以下、事務PCという）と、事務業務及びソフトウェア開発業務が行えるPC（以下、開発PCという）がある。開発部の従業員は開発PCを使用し、開発部以外の従業員は事務PCを使用している。",
      "A社には事務室、開発室及びサーバ室があり、各部屋のネットワークはファイアウォール（以下、A社FWという）を介して接続されている。A社のネットワーク構成を、図1に示す。"
    ],
    "figure": 1
  },
  "page6": {
    "paragraphs": [
      "事務室には、事務PCだけが設置されている。開発室には開発PCだけが設置されており、開発部の従業員だけが入室できる。サーバ室には、プロキシサーバが1台と、ソフトウェア開発業務に必要なソースコード管理、バグ管理、テストなどに利用するサーバ（以下、開発サーバという）が複数台設置されている。",
      "A社FWでは、開発室のネットワークだけから開発サーバにHTTP over TLS（以下、HTTPSという）又はSSHでアクセスできるように通信を制限している。また、A社ネットワークからのインターネットのWebサイト閲覧は、事務PC及び開発PCだけからプロキシサーバを経由してできるように通信を制限している。",
      "テレワークで働く従業員は、データを保存できないシンクライアント端末をA社から支給され、遠隔からインターネットを経由してA社のネットワークに接続し、業務を行う。そのために、安全にA社ネットワークに接続するVPN、及び仮想マシンの画面を転送して遠隔から操作できるようにする画面転送型の仮想デスクトップ環境（以下、VDIという）の導入を検討した。テレワーク導入後のA社のネットワーク構成案を、図2に示す。"
    ],
    "figure": 2
  },
  "page7": {
    "heading": "A社が検討したテレワークによる業務の開始までの流れ",
    "steps": [
      "利用者は、シンクライアント端末のVPNクライアントを起動して、VPNサーバに接続する。",
      "VPNサーバは、VPNクライアントが提示するクライアント証明書を検証する。検証に成功した場合、処理を継続する。",
      "VPNサーバは、利用者を認証する。認証が成功した場合、VPNクライアントに対して、192.168.16.0/24の範囲で使用されていないIPアドレスを一つ選択して割り当てる。",
      "VPNクライアントは、(3)で割り当てられたIPアドレスを使用して、VPNサーバ経由でA社ネットワークに接続する。",
      "利用者は、シンクライアント端末のVDIクライアントを起動して、VDIサーバに接続する。",
      "VDIサーバは、VPNサーバで認証された利用者が開発部以外の従業員であれば事務業務だけが行える仮想マシン（以下、事務VMという）を、開発部の従業員であれば事務業務及びソフトウェア開発業務が行える仮想マシン（以下、開発VMという）を割り当てる。また、VDIサーバは、事務VMには192.168.64.0/24、開発VMには192.168.65.0/24の範囲で使用されていないIPアドレスを一つ選択して割り当てる。",
      "利用者は、仮想マシンにログインして業務を開始する。VDIクライアントと仮想マシンの間では、画面データ、並びにキーボード及びマウスの操作データだけが送受信される。"
    ],
    "ending": "テレワーク導入後のA社FWに設定するパケットフィルタリングのルール案を、表1に示す。"
  },
  "page8": {
    "table": {
      "caption": "表1 A社FWに設定するパケットフィルタリングのルール案",
      "columns": [
        "ルール番号",
        "送信元",
        "宛先",
        "サービス",
        "動作"
      ],
      "rows": [
        [
          "1",
          "インターネット",
          "203.0.113.10",
          "VPN",
          "許可"
        ],
        [
          "2",
          "203.0.113.20",
          "インターネット",
          "HTTP, HTTPS, DNS",
          "許可"
        ],
        [
          "3",
          "192.168.16.0/24",
          "192.168.64.0/20",
          "VDI",
          "許可"
        ],
        [
          "4",
          "192.168.0.0/23",
          "203.0.113.20",
          "プロキシ",
          "許可"
        ],
        [
          "5",
          "192.168.64.0/23",
          "203.0.113.20",
          "プロキシ",
          "許可"
        ],
        [
          "6",
          "192.168.1.0/24",
          "192.168.128.0/20",
          "HTTPS, SSH",
          "許可"
        ],
        [
          "7",
          "192.168.64.0/23",
          "192.168.128.0/20",
          "HTTPS, SSH",
          "許可"
        ],
        [
          "8",
          "全て",
          "全て",
          "全て",
          "拒否"
        ]
      ],
      "notes": [
        "ルール番号の小さいものから順に、最初に一致したルールが適用される。",
        "許可された通信に対する戻りのパケットは、無条件に許可される。"
      ]
    },
    "afterTable": "ところが、表1のルール案ではルール番号7の条件に誤りがあり、［a］ことが分かった。そこで、開発サーバに対するアクセスを正しく制限するために、ルール番号7の条件について、送信元を［b］に変更した。",
    "subquestion1": "本文中の［ ］に入れる適切な答えを、解答群の中から選べ。"
  },
  "page9": {
    "subquestion2": "シンクライアント端末から開発サーバにアクセスするときの接続経路として適切な答えを、解答群の中から選べ。",
    "subquestion3Paragraphs": [
      "A社がテレワークの検討を進める過程で、“常に同一の業務環境を使用できるように、テレワークで働くときだけでなく、事務PC及び開発PCからも仮想マシンを使用したい”との要望が挙がった。検討した結果、この要望に応えてもセキュリティ上のリスクは変わらないと判断した。また、A社のネットワーク内からアクセスするのでVPNで接続する必要はなく、利用者認証をVPNサーバではなくVDIサーバで行えばよいことを確認した。",
      "この要望に応えるとき、表1のルール案に必要な変更として適切な答えを、解答群の中から選べ。ここで、表1のルール番号7の送信元には、設問1で選択した適切な答えが設定されているものとする。"
    ]
  },
  "parts": [
    {
      "id": "a",
      "label": "設問1 a",
      "page": 8,
      "choices": [
        "開発PCから開発サーバにアクセスできない",
        "開発VMから開発サーバにアクセスできない",
        "事務PCから開発サーバにアクセスできる",
        "事務VMから開発サーバにアクセスできる"
      ],
      "official": "エ"
    },
    {
      "id": "b",
      "label": "設問1 b",
      "page": 8,
      "choices": [
        "192.168.0.0/24",
        "192.168.1.0/24",
        "192.168.16.0/24",
        "192.168.64.0/24",
        "192.168.65.0/24",
        "192.168.128.0/20",
        "192.168.128.0/24",
        "203.0.113.0/24",
        "インターネット"
      ],
      "official": "オ"
    },
    {
      "id": "c",
      "label": "設問2",
      "page": 9,
      "choices": [
        "シンクライアント端末 → VDIサーバ → VPNサーバ → 開発PC → 開発サーバ",
        "シンクライアント端末 → VDIサーバ → VPNサーバ → 開発VM → 開発サーバ",
        "シンクライアント端末 → VDIサーバ → 開発VM → 開発PC → 開発サーバ",
        "シンクライアント端末 → VPNサーバ → VDIサーバ → 開発PC → 開発サーバ",
        "シンクライアント端末 → VPNサーバ → VDIサーバ → 開発VM → 開発サーバ",
        "シンクライアント端末 → VPNサーバ → 開発PC → 開発VM → 開発サーバ"
      ],
      "pathNodes": [
        [
          "シンクライアント端末",
          "VDIサーバ",
          "VPNサーバ",
          "開発PC",
          "開発サーバ"
        ],
        [
          "シンクライアント端末",
          "VDIサーバ",
          "VPNサーバ",
          "開発VM",
          "開発サーバ"
        ],
        [
          "シンクライアント端末",
          "VDIサーバ",
          "開発VM",
          "開発PC",
          "開発サーバ"
        ],
        [
          "シンクライアント端末",
          "VPNサーバ",
          "VDIサーバ",
          "開発PC",
          "開発サーバ"
        ],
        [
          "シンクライアント端末",
          "VPNサーバ",
          "VDIサーバ",
          "開発VM",
          "開発サーバ"
        ],
        [
          "シンクライアント端末",
          "VPNサーバ",
          "開発PC",
          "開発VM",
          "開発サーバ"
        ]
      ],
      "official": "オ"
    },
    {
      "id": "d",
      "label": "設問3",
      "page": 9,
      "choices": [
        "変更する必要はない。",
        "ルール番号3と4の間に、送信元を192.168.0.0/23、宛先を192.168.64.0/20、サービスをVDI、及び動作を許可とするルールを新たに挿入する必要がある。",
        "ルール番号3と4の間に、送信元を192.168.64.0/23、宛先を192.168.0.0/23、サービスをVDI、及び動作を許可とするルールを新たに挿入する必要がある。",
        "ルール番号3と4の間に、送信元をインターネット、宛先を192.168.64.0/20、サービスをVDI、及び動作を許可とするルールを新たに挿入する必要がある。"
      ],
      "official": "イ"
    }
  ],
  "shape": {
    "subquestions": 3,
    "answerSlots": 4,
    "counts": [
      4,
      9,
      6,
      4
    ],
    "uniqueChoices": 23,
    "choiceReferences": 23,
    "sharedGroups": [],
    "unorderedGroups": [],
    "unscored": [],
    "textFigures": 2,
    "nativeTables": 1,
    "programs": 0
  },
  "commonNotation": {
    "pages": [
      3,
      4
    ],
    "reviewed": true,
    "used": false,
    "reason": "本問に擬似言語/演算子表への参照又はプログラムはない。未使用の共通2頁を生成版へ盲目的に複製しない。"
  },
  "selection": {
    "pages": [
      1,
      2
    ],
    "durationMinutes": 150,
    "mandatory": [
      1,
      8
    ],
    "choose": [
      {
        "fromQuestions": [
          2,
          3,
          4,
          5,
          6,
          7
        ],
        "number": 4
      },
      {
        "fromQuestions": [
          9,
          10,
          11,
          12,
          13
        ],
        "number": 1
      }
    ],
    "available": 13,
    "answered": 7,
    "languageQuestionsRetained": [
      9,
      10,
      11,
      12,
      13
    ],
    "thisMajorMandatory": true,
    "wholeExamUI": "not implemented by this source-only design"
  }
} as const;
export const legacy2019TeleworkFigureAlts = [
  "図1 A社のネットワーク構成A社外枠の中に事務室、開発室、サーバ室の点線枠。中央の縦長A社FWに各LANが接続し、上方のインターネット楕円と縦線で接続。192.168.0.0/24の水平バスに事務PC、事務PCを線で接続。省略記号あり。192.168.1.0/24の水平バスに開発PC、開発PCを線で接続。省略記号あり。203.0.113.0/24の水平バスにプロキシサーバを線で接続。機器IPは203.0.113.20。192.168.128.0/20の水平バスに開発サーバ、開発サーバを線で接続。省略記号あり。黒い接続部、バス末端、端末間の省略記号を表示。矢印による処理順の追加はない。",
  "図2 テレワーク導入後のA社のネットワーク構成案A社外枠の中に事務室、開発室、サーバ室の点線枠。中央の縦長A社FWに各LANが接続し、上方のインターネット楕円と縦線で接続。192.168.0.0/24の水平バスに事務PC、事務PCを線で接続。省略記号あり。192.168.1.0/24の水平バスに開発PC、開発PCを線で接続。省略記号あり。203.0.113.0/24の水平バスにVPNサーバの外側NIC、プロキシサーバを線で接続。機器IPは203.0.113.10、203.0.113.20。192.168.16.0/24の水平バスにVPNサーバの内側NICを線で接続。機器IPは192.168.16.1。192.168.64.0/20の水平バスにVDIサーバを線で接続。省略記号あり。192.168.128.0/20の水平バスに開発サーバ、開発サーバを線で接続。省略記号あり。社外の重ね枠のシンクライアント端末にはVDIクライアントとVPNクライアントがあり、インターネットに接続。VPNサーバは外側203.0.113.10と内側192.168.16.1の二つのNICでそれぞれのバスに接続。VDIサーバの枠の中に二つの仮想マシン枠と省略記号。黒い接続部、バス末端、端末間の省略記号を表示。矢印による処理順の追加はない。"
] as const;
export const legacy2019TeleworkWrongSources=['192.168.64.0/23','192.168.16.0/24','192.168.1.0/24'] as const;
export function legacy2019TeleworkValues(values:readonly number[]){if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>2)throw Error('PARAMETER_CONSTRAINT: telework wrong source');return values[0];}
export function legacy2019TeleworkRows(values:readonly number[]):string[][]{const v=legacy2019TeleworkValues(values),rows=legacy2019TeleworkSource.page8.table.rows.map(r=>[...r]as string[]);rows[6][1]=legacy2019TeleworkWrongSources[v];return rows;}
function ip(s:string){const a=s.split('.').map(Number);if(a.length!==4||a.some(n=>!Number.isInteger(n)||n<0||n>255))throw Error('Invalid IPv4');return a.reduce((v,n)=>(v*256+n)>>>0,0);}
const company=['192.168.0.0/23','192.168.16.0/24','192.168.64.0/20','192.168.128.0/20','203.0.113.0/24'];
export function legacy2019TeleworkContains(cidr:string,address:string):boolean{if(cidr==='全て')return true;if(cidr==='インターネット')return !company.some(c=>legacy2019TeleworkContains(c,address));const [n,p='32']=cidr.split('/'),bits=Number(p);if(!Number.isInteger(bits)||bits<0||bits>32)throw Error('Invalid prefix');const mask=bits===0?0:(0xffffffff<<(32-bits))>>>0;return ((ip(n)&mask)>>>0)===((ip(address)&mask)>>>0);}
export type TeleworkPacket=readonly[source:string,destination:string,service:string];
export function legacy2019TeleworkDecision(rows:readonly(readonly string[])[],packet:TeleworkPacket,replyToAllowedCommunication=false){if(replyToAllowedCommunication)return{allow:true,rule:'established-return'};for(const row of rows)if(legacy2019TeleworkContains(row[1],packet[0])&&legacy2019TeleworkContains(row[2],packet[1])&&(row[3]==='全て'||row[3].split(', ').includes(packet[2])))return{allow:row[4]==='許可',rule:row[0]};return{allow:false,rule:'unmatched'};}
export function legacy2019TeleworkModel(values:readonly number[]){const v=legacy2019TeleworkValues(values),rows=legacy2019TeleworkRows(values),access=(source:string)=>legacy2019TeleworkDecision(rows,[source,'192.168.128.10','HTTPS']).allow;const truth=[!access('192.168.1.10'),!access('192.168.65.10'),access('192.168.0.10'),access('192.168.64.10')];if(truth.filter(Boolean).length!==1)throw Error('Nonunique error condition');return{v,rows,a:truth.indexOf(true)};}
