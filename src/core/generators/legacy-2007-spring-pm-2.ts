import { p, strings } from './definition';
import { answers, bank, define, single } from './legacy-2007-spring-pm-01-05-shared';
import { draw } from './legacy-2007-spring-pm-01-05-figures';
import { divisionCases, divisions } from './legacy-2007-spring-pm-2-model';

const phenomena = [
  '転属した社員の所属部門を，変更することができない','新入社員を，登録することができない',
  '退職した社員を，削除することができない','同姓同名の社員を，登録することができない','配属者未定の新設部門を，登録することができない',
];
const counts = ['1','2','3','8','9'];
const keys = ['氏名','社員番号','部門コード'];
export function spring2007Pm2Pages(index: number, print = true) {
  const {department,code,staff} = divisionCases[index];
  const employees = divisions.flatMap(part => part.staff.map(row => part.name + '（' + part.code + '）の' + row[1]));
  const assignment = index === 0 ? '本務が営業（EG）である綾瀬恵と本務が庶務（SM）である上戸満夫' : staff.map(i => employees[i]).join('，');
  const pages = [
    [p('関係データベースに関する次の記述を読んで，設問1，2に答えよ。'),
      p('ある情報システム開発会社は，顧客であるA社の組織情報を関係データベースにすることになり，まず，部門と所属についての設計を行った。'),
      p('A社の部門は，英字2文字からなる部門コードで一意に識別できる。A社の社員は，4けたの数字からなる社員番号で一意に識別でき，必ず一つの部門に所属しているものとする。'),
      p('図1にA社の部門と所属の情報を示す。括弧内は，部門コード又は社員番号である。'),
      draw('organization', 0, '図1　A社の部門と所属の情報'),
      p('設問1　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('情報システム開発会社の初級技術者B君は，案1と案2の二つの関係データベースの構造を考えた。しかし，上級技術者から，案1と案2の両方で，A社の組織を表すには不都合な［a］という現象が起こり，案1では，更に［b］という不都合な現象も起こることが指摘された。'),
      p('そこでB君は，指摘に基づき，案3を考えた。'), p('案1〜3を図2に示す。下線は，その項目が主キーであることを表す。'),
      draw('organization-plans', 0, '図2　案1〜3')],
    [p('設問2　次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      p('A社の制度が変更され，社員が本務として所属する部門に加え，その他の1部門までの兼務ができることになった。'),
      p('このたび，新設部門として' + department + '（' + code + '）が設置され，' + assignment +
        'が，兼務として' + department + '（' + code + '）に配属されることになった。'),
      p('B君は，これらに対応し，どの項目の内容も空にならない案4を考えた。'),
      p('案4のデータベース構造において，今回の制度の変更，部門の新設及び配属の後，兼務の登録件数（行数）は，［c］となる。'),
      p('案4を図3に示す。下線は，その項目が主キーであることを表す。'), draw('organization-assignment', 0, '図3　案4')],
  ];
  if (print) {
    pages[1].unshift(...bank('解答群', phenomena));
    pages[1].push(...bank('cに関する解答群', counts), ...bank('d，eに関する解答群',keys));
  }
  return pages;
}
export const spring2007Pm2 = define(2,'部門と社員・兼務の関係データベース設計','a=オ／b=エ／c=イ／d=イ／e=ウ',
  '新設部門の兼務者・兼務行の数','主キーを確認し，部門の登録・同姓同名・兼務の表を考える。',
  '両案に共通する未配属部門の挿入異常、案1だけの氏名重複、主キーの下線、兼務最大1と空項目なしを保持。実際に兼務する人数を1/2/3/8人で変える。',index=>{
    const count = divisionCases[index].staff.length;
    return {prompt:spring2007Pm2Pages(index,false).flat(),
      ...answers([strings(phenomena),strings(counts),strings(keys)],[single('a','設問1 a',0,4),single('b','設問1 b',0,3),
        single('c','設問2 c',1,counts.indexOf(String(count))),single('d','設問2 d',2,1),single('e','設問2 e',2,2)]),
      explanation:'案1と案2は社員と部門を同じ行に記録するため，未配属の部門を単独で登録できない。案1は氏名を主キーにするので同姓同名を登録できない。兼務は1社員につき高々1件で，今回の兼務者は'+count+
        '人なので'+count+'行。兼務表の主キーには同姓同名でも異なる社員番号を，その値に対応する配属先には部門コードを持たせる。',
    };
  });
