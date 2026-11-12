import { code, p, strings } from './definition';
import { answers, bank, bankBlocks, define, single } from './legacy-2008-autumn-pm-01-05-shared';
import { draw } from './legacy-2008-autumn-pm-01-05-figures';

const examples = [
  { year: 2007, role: '部長' }, { year: 2008, role: '課長' },
  { year: 2009, role: '主任' }, { year: 2010, role: '本部長' },
] as const;
const identifiers = ['研修コード', '研修実施表', '社員コード', '社員表', '部署コード', '部署表', '役職コード', '役職表'];

function sqlCase(index: number) {
  const { year, role } = examples[index];
  const start = year + '-04-01', end = (year + 1) + '-03-31';
  const query = 'SELECT 役職コード FROM 役職表';
  const selectConditions = [
    '研修実施表.研修コード = 受講表.研修コード', "研修実施表.年度 = '" + year + "'",
    '研修実施表.年度 = 受講表.年度', '研修日数 > 0', '受講日数 > 0', "受講表.年度 = '" + year + "'",
  ];
  const selectRoles = [
    query + " WHERE 役職名 = '" + role + "'",
    query + "\n    WHERE 役職名 = '" + role + "' OR 役職名 = '副" + role + "' OR 役職名 = '" + role + "代理'",
    query + "\n    WHERE 役職名 IN ('" + role + "', '副" + role + "', '" + role + "代理')",
    query + " WHERE 役職名 LIKE '%" + role + "%'",
    query + " WHERE 役職名 LIKE '" + role + "%'",
  ];
  return { year, role, start, end, conditionBank: selectConditions.map(text => [code(text, 'sql')]),
    roleBank: selectRoles.map(text => [code(text, 'sql')]) };
}

export function autumn2008Pm3Pages(index: number) {
  const { year, role, start, end, conditionBank, roleBank } = sqlCase(index);
  return [[
    p('問3　関係データベースに関する次の記述を読んで，設問1，2に答えよ。'),
    p('B社では，社員に関連する関係データベースを構築し，各部署からの問合せに対応している。B社の関係データベースの構造の一部を図に示す。'),
    draw('trainingSchema', 0, '図　B社の関係データベースの構造（一部）'),
    p('〔各表の概要〕'),
    p('（1）社員表は，社員（退職者を含む）の情報を管理する。在職中の社員の退職年月日はNULLとする。'),
    p('（2）部署表は，B社の部署名を管理する。'),
    p('（3）役職表は，B社の役職名を管理する。'),
    p('（4）研修実施表は，年度ごとにB社が実施した研修名と研修期間を管理する。'),
    p('（5）受講表は，各社員が受講した研修とその日数（受講日数）を管理する。社員は，本人が必要と思う研修だけに申し込み，受講する。受講予定の社員が受講しなかった場合，その研修の受講日数の値は0となる。'),
    p('（6）B社で規定する年度は，その年の4月1日から翌年の3月31日までである。' + year + '年度は，' + year + '年4月1日から' + (year + 1) + '年3月31日までとなる。'),
  ], [
    p('設問1　入社2年目の社員が，入社以来1日でも受講した研修にどのようなものがあるかを知りたい。'),
    p('次のSQL文中の［空欄］に入れる正しい答えを，解答群の中から三つ選べ。ここで，入社2年目の社員とは，入社した年度が' +
      year + '年度で，かつ在職中の社員とする。'),
    code([
      'SELECT DISTINCT 研修名 FROM 受講表, 研修実施表, 社員表',
      '    WHERE 受講表.社員コード = 社員表.社員コード AND',
      '          ［空欄］ AND', '          ［空欄］ AND', '          ［空欄］ AND',
      '          退職年月日 IS NULL AND',
      "          入社年月日 BETWEEN '" + start + "' AND '" + end + "'",
    ].join('\n'), 'sql'),
    ...bankBlocks('解答群', conditionBank),
  ], [
    p('設問2　B社では，研修を受講した社員に対して，本人の受講実績だけが照会できるSQL文が提供されている。しかし，役職名の中に“' + role + '”という文字列がある社員（“' +
      role + '”，“副' + role + '”，“' + role + '代理”など）は，自分の受講実績だけでなく，同じ所属部署にいるすべての社員の受講実績を照会できるようにしたい。この照会ができる社員を選択するSQL文の説明として［空欄］に入れる正しい答えを，解答群の中から選べ。'),
    p('役職表の役職名に“' + role + '”という文字列を含むすべての役職は［a］として検索する。同じ所属部署の社員を抽出するには，次のとおりにする。'),
    p('受講表には［b］という項目があるが，これだけではその社員が同じ所属部署であるかどうか分からない。同じ所属部署であるかどうかを知るためには［c］という項目が必要になる。したがって，受講表の項目［b］を用いて［d］を結合し，［c］の値を取り出せばよい。'),
    ...bankBlocks('aに関する解答群', roleBank),
    ...bank('b〜dに関する解答群', identifiers),
  ]];
}

export const legacy2008AutumnPm3Definition = define(3, '社員研修の複合キー結合とSQL',
  '設問1=ア・ウ・オ・設問2 a=エ・b=ウ・c=オ・d=エ',
  '入社年度と役職名に含む文字列', '入社2年目の対象年度と，照会を許可する役職名に含める文字列を変更します。',
  'p.10〜12。キー項目と日付境界，退職年月日のNULL，受講日数が0の場合，LIKEによる部分一致を維持。設問1は三つを順不同で選ぶ単一の採点欄。', index => {
    const { year, role, conditionBank, roleBank } = sqlCase(index);
    const selected = answers([conditionBank, roleBank, strings(identifiers)], [
      { ids: ['sub1', 'sub1-second', 'sub1-third'], labels: ['設問1', '設問1・選択2', '設問1・選択3'], bank: 0, correct: [0, 2, 4] },
      single('a', '設問2 a', 1, 3), single('b', '設問2 b', 2, 2),
      single('c', '設問2 c', 2, 4), single('d', '設問2 d', 2, 3),
    ]);
    return {
      prompt: autumn2008Pm3Pages(index).flat(),
      ...selected,
      partAnswers: selected.partAnswers!.map(answer => answer.kind === 'unordered' ? { ...answer, presentation: 'checklist' } : answer),
      explanation: '設問1：' + year + '年度に入社した在職者を対象とする。研修実施表のキーは年度と研修コードの組なので，両方を受講表の値に一致させる。受講日数が正なら，1日以上受講している。対象者の受講年度は入社年度より後でもよい。' +
        '設問2：LIKEの%は0文字以上の任意の文字列に一致するため，「%' + role + '%」で役職名の任意の位置に' + role +
        'を含む役職を選べる。受講表の社員コードを社員表のキーに対応させ，社員表から部署コードを取り出して同じ部署かどうかを判定する。',
    };
  });
