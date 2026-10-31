import { code,field,p,strings,table,variableNotes,type GenerationDefinition } from "./definition";

function define(number:number,title:string,answer:string,fields:GenerationDefinition["fields"],reference:number[],build:GenerationDefinition["build"],notes:string):GenerationDefinition {
  return {source:`2019h31h-fe-am-${number}`,title,sourceAnswer:answer,fields,reference,notes:variableNotes+" "+notes,build:v=>{
    if(v.length!==fields.length||v.some((n,i)=>!Number.isInteger(n)||n<fields[i].minimum||n>fields[i].maximum))throw Error("PARAMETER_CONSTRAINT");return build(v);
  }};
}
export const legacy2019DataQueryDefinitions:GenerationDefinition[]=[
  define(27,"SQLの集約と並べ替え","イ",[field("集約の条件",0,3),field("並べ替えの条件",0,3)],[0,0],([aggregate,sort])=>{
    const fn=["AVG","MIN","MAX","SUM"][aggregate],name=["平均点","最低点","最高点","合計点"][aggregate],first=sort&1?" DESC":"",second=sort&2?" DESC":"";
    const order=`クラス名${first}, 教科名${second}`;
    return {prompt:[p(`“中間テスト”表からクラスごと、教科ごとの${name}を求め、${sort===0?"クラス名、教科名の昇順":`クラス名の${sort&1?"降順":"昇順"}、教科名の${sort&2?"降順":"昇順"}`}に表示するSQL文中のaに入れる字句はどれか。`),
      p("中間テスト（クラス名、教科名、学生番号、名前、点数）"),code(`SELECT クラス名, 教科名, ${fn}(点数) AS ${name}\n  FROM 中間テスト\n  ［a］`,"sql")],
      choices:[`GROUP BY クラス名, 教科名 ORDER BY クラス名${first}, ${fn}(点数)${second}`,
        `GROUP BY クラス名, 教科名 ORDER BY ${order}`,
        `GROUP BY クラス名, 教科名, 学生番号 ORDER BY ${order}, ${name}`,
        `GROUP BY クラス名, ${name} ORDER BY ${order}`].map(s=>[code(s,"sql")]),correctIndex:1,
      explanation:`クラス名と教科名を同じ値にもつ行を一つのグループとし、${fn}(点数)で${name}を求める。GROUP BYにはこの二列を指定する。表示順はクラス名${sort&1?"降順":"昇順"}、同じクラス内は教科名${sort&2?"降順":"昇順"}なのでORDER BY ${order}。集計値の大小で教科を並べること、学生ごとにグループを細分すること、集約結果${name}をグループのキーとすることは指定を満たさない。`};
  },"原p13の二列のグループ・集計・SQL空欄・4コード択を維持。AVG/MIN/MAX/SUMと二列それぞれの昇降順条件を変える。誤答は集約値によるソート、学生ごとの余分なグループ、集約別名をGROUP BYキーとする三役。単なる列名差替えではなく処理を変え、全16条件を独立したSQL句解析と具体的な反例データで検査する。"),
  define(29,"SQLの結合と表を限定した条件","ウ",[field("学部の所在地条件",0,3),field("学生の住所条件",0,15)],[2,5],([facultyMask,addressMask])=>{
    const names=["応用花子","高度次郎","午前桜子","情報太郎"],faculties=["理","人文","経済","工"];
    const students=names.map((name,i)=>[name,faculties[i],addressMask&(1<<i)?"新宿":"渋谷"]);
    const facultyRows=[["工",facultyMask&2?"新宿":"渋谷"],["経済",facultyMask&1?"新宿":"渋谷"],["人文","渋谷"],["理","新宿"]];
    const result=students.filter(s=>facultyRows.some(f=>f[0]===s[1]&&f[1]==="新宿")).map(s=>s[0]);
    const choices=[[names[0]],[names[0],names[2]],[names[0],names[3]],[names[0],names[3],names[2]]];
    return {prompt:[p("“学生”表と“学部”表に対して次のSQL文を実行した結果として、正しいものはどれか。"),
      table("学生",["氏名","所属","住所"],students),table("学部",["学部名","住所"],facultyRows),
      code("SELECT 氏名 FROM 学生, 学部\n WHERE 所属 = 学部名 AND 学部.住所 = '新宿'","sql")],
      choices:choices.map(rows=>[table("実行結果",["氏名"],rows.map(n=>[n]))]),
      correctIndex:choices.findIndex(candidate=>candidate.length===result.length&&candidate.every(name=>result.includes(name))),
      explanation:`所属と学部名を一致させて結合し、学部側の住所が新宿である行を残す。新宿にある学部は${facultyRows.filter(r=>r[1]==="新宿").map(r=>r[0]).join("・")}で、該当者は${result.join("・")}。条件は『学部.住所』を指定しているため、学生自身の住所が新宿かどうかでは選別しない。ORDER BYは指定されていないので、結果表の行の並び順だけで候補を区別しない。`};
  },"原p14の二表（4行×3列/4行×2列）、同名住所列、所属＝学部名、学部.住所の限定、4結果表を維持。学部の所在地集合4条件と学生の住所16条件を独立に変える。誤って学生住所で絞る解法や住所を結合キーへ追加する解法を反例で検出する。全64入力を実表示の直積から独立検算。行順は原SQLが規定しないので集合として照合し、選択肢の人数・要素の違いを問う。"),
  define(32,"IPv4のホスト用アドレス数","エ",[field("prefixLength",22,27)],[23],([prefix])=>{
    const bits="1".repeat(prefix)+"0".repeat(32-prefix),mask=[0,8,16,24].map(i=>parseInt(bits.slice(i,i+8),2)).join(".");
    const hosts=2**(32-prefix)-2;
    return {prompt:[p(`192.168.0.0/${prefix}（サブネットマスク${mask}）のIPv4ネットワークにおいて、ホストとして使用できるアドレスの個数の上限はどれか。`),p("ここで、ホスト部が全て0のネットワークアドレス及び全て1のブロードキャストアドレスは、ホストには割り当てないものとする。")],
      choices:strings([prefix,prefix+1,2**(31-prefix)-2,hosts].map(String)),correctIndex:3,
      explanation:`IPv4は32ビットで、プレフィックス長が${prefix}なのでホスト部は${32-prefix}ビット。ホスト部の組合せは2^${32-prefix}=${hosts+2}個である。この範囲の通常のサブネットでは、ホスト部が全て0のネットワークアドレスと全て1のブロードキャストアドレスをホストには割り当てないので、上限は${hosts+2}−2=${hosts}個となる。`};
  },"原p15、/23、mask255.255.254.0、23/24/254/510の4整数択を維持。prefix22〜27に限定し、/31の特例等を含めない。ネットワークは境界上192.168.0.0で固定しmaskも連動。誤答はprefixを個数とする二候補と、ホスト部を1ビット少なく数える候補。全6入力のmask/ネットワーク/broadcast/各アドレスを別のビット比較で列挙し確認。丸めなし。"),
];
