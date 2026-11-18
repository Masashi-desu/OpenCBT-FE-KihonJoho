export const hashStrides = [1, 2, 3, 4] as const;

export const campaignCases = [
  { minimum: 3000, ids: ['400101','400102','400103','400104'], applicants: [0, 2], prices: [10500, 3150] },
  { minimum: 4000, ids: ['410201','410203','410206','410209'], applicants: [1, 2], prices: [18000, 4100] },
  { minimum: 5000, ids: ['420301','420305','420308','420310'], applicants: [0, 2], prices: [15000, 5000] },
  { minimum: 2500, ids: ['430501','430502','430507','430512'], applicants: [1, 2], prices: [7500, 2900] },
] as const;

export const salesColumns = ['購入日付', '顧客番号', '商品コード', '購入数量', '購入金額'];
export const customerColumns = ['顧客番号', '顧客住所', '顧客氏名'];
