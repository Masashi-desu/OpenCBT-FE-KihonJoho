import type {StudyTerm} from '../study-acronyms';
const source='2017h29h-fe-pm-3';
export const legacy2017Pm3StudyTerms:StudyTerm[]=[
  {
    "term": "ID",
    "meaning": "識別子。ルールIDと区分ID・対象物IDを区別する。",
    "expansion": "Identifier"
  },
  {
    "term": "No",
    "meaning": "受付番号の表記。受付Noの一意性はルール参照の一意性ではない。",
    "expansion": "Number"
  },
  {
    "term": "DDL",
    "meaning": "データ定義言語。CREATE TABLEなどで表の列・データ型・整合性制約を定義する。",
    "expansion": "Data Definition Language"
  },
  {
    "term": "NULL",
    "meaning": "値が未定又は欠落していることを表すSQLのマーカ。未回答の問合せではルールIDにNULLを許し，後から既存のルールIDを設定できる。"
  },
  {
    "term": "PRIMARY KEY",
    "meaning": "主キー。行の識別に使う一意かつ非NULLのキー。複合主キーは組合せの一意性。"
  },
  {
    "term": "FOREIGN KEY / REFERENCES",
    "meaning": "外部キー/参照。非NULL値を参照先の既存キーへ対応させる。列のNULL許容と別。"
  },
  {
    "term": "UNIQUE",
    "meaning": "一意制約。ペアに適用すると組合せの重複を拒否する。"
  },
  {
    "term": "NOT NULL",
    "meaning": "非NULL制約。CHECK(IN...)単独のNULL挙動と区別する。"
  },
  {
    "term": "CHECK",
    "meaning": "行値の条件検査。許容状態の列挙はIN句、欠落拒否は既存NOT NULLが担う。"
  },
  {
    "term": "WHERE",
    "meaning": "データ検索等の対象を絞る条件句。このCREATE TABLEに追加する制約ではない。"
  },
  {
    "term": "DATE",
    "meaning": "日付を格納するための型。この問ではルールの更新日を表す。語そのものであり略語ではない。"
  },
  {
    "term": "SQL",
    "meaning": "データベースの定義/操作/検索に使う言語。DDLはその定義の部分。",
    "expansion": "Structured Query Language"
  },
  {
    "term": "CHAR",
    "meaning": "characterの別表記で、指定長の文字列型。",
    "expansion": "Character"
  },
  {
    "term": "VARCHAR",
    "meaning": "character varyingの別表記で、指定した上限長を持つ可変長の文字列型。",
    "expansion": "Character Varying"
  }
].map(t=>({...t,sources:[source]}));
export const legacy2017Pm3StudyTermReview={source,terms:legacy2017Pm3StudyTerms.map(t=>t.term),note:"局所問3。DDL/SQL/ID/Noの正式表記、NULL/CHECK/DATE等は略語展開しない。CHAR=character、VARCHAR=character varyingの別表記。主キーと外部キー/NULL/一意性/値域を区別。"};
