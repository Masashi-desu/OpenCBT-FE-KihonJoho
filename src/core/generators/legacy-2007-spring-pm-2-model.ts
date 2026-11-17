export const divisions = [
  { name:'営業', code:'EG', staff:[['8612','関利貞'],['9126','綾瀬恵'],['8905','松浦明夫'],['8604','石原里子']] },
  { name:'経理', code:'KR', staff:[['8713','平山実'],['9107','深田はじめ'],['9001','小林麻利']] },
  { name:'庶務', code:'SM', staff:[['8518','上戸満夫'],['9121','小出つかさ']] },
] as const;
export const divisionCases = [
  { department:'宣伝', code:'SD', staff:[1,7] },
  { department:'広報', code:'PR', staff:[2] },
  { department:'監査', code:'AU', staff:[0,4,6] },
  { department:'調達', code:'PB', staff:[0,1,2,3,4,5,6,7] },
] as const;
export const organizationColumns = [
  ['案1 組織','氏名','社員番号','部門名','部門コード'],
  ['案2 組織','社員番号','氏名','部門コード','部門名'],
  ['案3 部門','部門コード','部門名'],['案3 社員','社員番号','氏名','部門コード'],
] as const;
export const assignmentColumns = [
  ['部門','部門コード','部門名'],['社員','社員番号','氏名'],
  ['本務','社員番号','部門コード'],['兼務','［d］','［e］'],
] as const;
