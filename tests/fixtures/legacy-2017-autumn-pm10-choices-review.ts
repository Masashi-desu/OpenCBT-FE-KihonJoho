/** Independently transcribed QS56–57 in original symbol order; no producer import.
 * First bank appends an existing indexed file sequentially; a returns the fee,
 * b subtracts entry hours, c rounds a started unit, d is one-based hour index,
 * shared e/f bank controls TEST BEFORE termination and midnight wrap. */
export const autumnPm10ReviewedChoiceBanks=[
 ['順呼出し（ACCESS MODE IS SEQUENTIAL）','動的呼出し（ACCESS MODE IS DYNAMIC）','乱呼出し（ACCESS MODE IS RANDOM）'],
 ['ADD PRM-FEE TO ACCT-FEE','MOVE ACCT-FEE TO PRM-FEE','MOVE PRM-FEE TO ACCT-FEE','MOVE PRM-NO TO ACCT-NO'],
 ['*','+','-','/'],
 ['ADD 1 TO W-HRS','ADD ACCT-O-HH TO W-HRS','SUBTRACT 1 FROM W-HRS','SUBTRACT ACCT-I-HH FROM W-HRS'],
 ['COMPUTE W-IDX = ACCT-I-HH + 1','COMPUTE W-IDX = ACCT-I-HH - 1','MOVE 1 TO W-IDX','MOVE ACCT-I-HH TO W-IDX'],
 ['W-CNT = W-HRS','W-CNT > W-HRS','W-HRS = W-IDX','W-IDX = 24','W-IDX = W-CNT','W-IDX > 24'],
];
