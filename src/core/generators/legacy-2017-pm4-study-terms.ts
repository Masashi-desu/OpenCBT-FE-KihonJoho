import type{StudyTerm}from'../study-acronyms';
export const legacy2017Pm4StudyTerms:StudyTerm[]=[
  {
    "term": "LAN",
    "expansion": "Local Area Network",
    "meaning": "一定範囲内の機器を接続するネットワーク。ここでは無線区間の送信待ち時間を扱う。"
  },
  {
    "term": "ACK",
    "expansion": "Acknowledgement",
    "meaning": "受信確認。ここでのACKフレームは無線LANのフレーム受信への応答で，TCP自体のACKと区別する。"
  },
  {
    "term": "TCP/IP",
    "expansion": "Transmission Control Protocol / Internet Protocol",
    "meaning": "データフレーム内に格納するパケットの通信プロトコル群。パケットのヘッダは問題のデータ本体の長さに含めない。"
  },
  {
    "term": "W1・W2",
    "meaning": "問題が定義する待機時間の記号。W1は毎回決めるランダムな値でW2を超える。W2は固定。略語の正式名ではない。"
  },
  {
    "term": "Mビット／秒",
    "meaning": "単位時間のビット数で表す通信速度。バイト数をそのままビット数として計算しない。"
  },
  {
    "term": "伝送効率",
    "meaning": "データ送信速度を物理層の通信速度で割った比。データ送信速度の向上と同じ意味ではない。"
  }
].map(t=>({...t,sources:['2017h29h-fe-pm-4']}));
export const legacy2017Pm4StudyTermReview={source:'2017h29h-fe-pm-4',terms:legacy2017Pm4StudyTerms.map(t=>t.term),note:'LAN/ACK/TCP/IPの正式名とW1/W2の記号を区別。無線ACKとTCPACK、bit/byte、速度と効率の分母を補足。'};
