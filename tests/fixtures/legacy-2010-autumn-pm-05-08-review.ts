/** 紙面p21–38、公式解答欄、2010年当時の告示前提から手査読した全択の意味。生成器から生成しない。 */
export const fixedReview = {
  inventorySort:[
    '管理番号がまとまらない','管理番号がなく数量も不要','管理番号より日付を優先する',
    '管理番号内の受入順が決まらない','管理番号を最優先し同一番号内を日付順にする','単価順は先入先出と異なる',
  ],
  issueFields:[
    '管理番号がない','管理番号がなく日付も余計','受入日付が余計','管理番号がない','払出日付が余計','管理番号と全期払出数量だけを残す',
  ],
  issueGroup:['管理番号がない','管理番号がない','受入日付が余計','管理番号がない','払出日付が余計','管理番号単位で全期分を合計'],
  privacy:{
    ab:[
      {kind:'appointment',truth:false},{kind:'employee-supervision',truth:false},
      {kind:'contract',truth:true},{kind:'data-supervision',truth:true},
    ],
    c:[true,false,false,false],
    dKinds:['physical','technical','technical','technical'],
    riskPhysical:[true,false,false,false],
    riskMissingAudit:[false,true,false,false],
    basis:[
      '試験p26の試験当時の経産分野ガイドライン前提',
      'p27の安全管理措置の概要',
      'p28–29の①鍵，②特権操作記録，③参照権限，④アクセス記録',
      '採点講評p2 問6の委託先で実施される個人データの取扱状況の監督',
    ],
  },
  finance:{
    identity:[false,false,false,true],efficiency:[false,true,false,false],
    exchangeChanges:[false,true,false,false,false,false],
    exchangeInvariant:[false,false,false,false,false,true],
  },
  multiplication:{
    combinedShift:[false,false,true,false],
    negativeMinimum:5,negativeMaximum:3,runOfOnes:[7,15,6,14],
  },
  originals:{
    5:{keys:'オカカオウ',pages:[21,22,23,24,25],counts:[6,6,6,7,6]},
    6:{keys:'ウエアアアイ',pages:[26,27,28,29],counts:[4,4,4,4,4,4]},
    7:{keys:'エエイアイカウイ',pages:[30,31,32],counts:[4,4,4,3,6,6,5,5]},
    8:{keys:'エオイウオウア',pages:[34,35,36,37,38],counts:[4,6,6,4,6,6,4]},
  },
} as const;
