/** Independent manual source review: IPA QS physical63–71, ANS1.
 * Row0 is original. Rows1–7 are separately reviewed same-role numerical cases.
 * This fixture imports no production definition/model/table constants.
 */
export const pm13Inputs=[
 {weights:[460,720,1200],boxes:[135,260,415,870,1320],example:[12,6,4],shipping:[10,36,30],destination:'青森県',column:2},
 {weights:[480,700,1100],boxes:[140,250,420,880,1300],example:[10,8,5],shipping:[11,35,29],destination:'宮城県',column:3},
 {weights:[440,760,1240],boxes:[130,270,400,900,1340],example:[12,6,4],shipping:[10,34,28],destination:'沖縄県',column:12},
 {weights:[500,680,1160],boxes:[140,260,420,860,1320],example:[11,7,4],shipping:[12,32,27],destination:'北海道',column:1},
 {weights:[420,740,1220],boxes:[135,255,410,850,1300],example:[13,6,4],shipping:[11,35,30],destination:'福岡県',column:11},
 {weights:[460,700,1180],boxes:[140,270,430,890,1350],example:[12,8,4],shipping:[13,34,28],destination:'青森県',column:2},
 {weights:[480,760,1200],boxes:[130,250,400,860,1310],example:[10,7,4],shipping:[12,36,29],destination:'宮城県',column:3},
 {weights:[440,720,1260],boxes:[140,260,420,880,1340],example:[14,6,4],shipping:[10,33,31],destination:'福岡県',column:11},
];
export const pm13SourceRates=[[1188,864,756,1188,1296],[1458,1134,1026,1458,1836],[1728,1404,1296,1728,2376],[1998,1674,1566,1998,3186],[2268,1944,1836,2268,3996]];
export const pm13SourceColumns=[1,2,3,11,12];
export const pm13SourceChoices=[
 'IF(条件付個数(C3:C10, =料金計算!$A4)=0, 1, null)',
 'IF(条件付個数(C3:C10, =料金計算!$A4)=1, 1, null)',
 'IF(条件付個数(C3:C10, =料金計算!$A4)>1, null, 1)',
 'IF(条件付個数($C3:$C10, =料金計算!$A4)=0, null, 1)',
 'IF(条件付個数($C3:$C10, =料金計算!$A4)=1, null, 1)',
 'IF(条件付個数($C3:$C10, =料金計算!$A4)>1, 1, null)',
 "IF(E4>重量区分!E8, '×', 照合一致(E4, 重量区分!D4:D8, 1))",
 "IF(E4>重量区分!E8, '×', 照合一致(E4, 重量区分!D4:D8, −1))",
 "IF(E4>重量区分!E8, '×', 照合一致(E4, 重量区分!E4:E8, 1))",
 "IF(E4>重量区分!E8, '×', 照合一致(E4, 重量区分!E4:E8, −1))",
 "論理積(G4≠'−', A4≠null)","論理積(論理和(F4='−', F4='×'), A4=null)","論理和(G4='−', 合計(料金表!C16:N16)=0)","論理和(論理積(F4≠'−', F4≠'×'), 合計(料金表!C16:N16)=1)",
 '垂直照合(F4, 料金表!B11:N15, 照合一致(1, 料金表!C16:N16, 0), 0)',
 '垂直照合(照合一致(1, 料金表!C16:N16, 0), 料金表!B11:N15, F4, 0)',
 '表引き(料金表!C11:N15, F4, 照合一致(1, 料金表!C16:N16, 0))',
 '表引き(料金表!C11:N15, 照合一致(1, 料金表!C16:N16, 0), F4)',
 '論理積(work_weight<E9, E10>重量区分!E8)','論理積(work_weight<E10, E10≦重量区分!E8)','論理積(work_weight>E9, E10>重量区分!E8)','論理積(work_weight>E10, E10≦重量区分!E8)',
 '相対(B9, 0, i) ← 相対(B4, 0, i) − 相対(B10, 0, i)',
 '相対(B9, 0, i) ← 相対(B4, 0, i) − 相対(B15, package_no, i)',
 '相対(B9, 0, i) ← 相対(B9, 0, i) − 相対(B10, 0, i)',
 '相対(B9, 0, i) ← 相対(B9, 0, i) − 相対(B15, package_no, i)',
];
export const pm13SourceMacro=[
 '○マクロ：Package_count','○数値型：package_no, i, j, k, m, work_weight',
 '■i: 0, i≦2, 1','・相対(B9, 0, i) ← 相対(B4, 0, i)','■','・package_no ← 1',
 '■E9>0','・相対(A15, package_no, 0) ← package_no','・相対(F15, package_no, 0) ← F9','・相対(G15, package_no, 0) ← G9','・work_weight ← 0',
 '■i: 0, i≦B9, 1','・B10 ← i','■j: 0, j≦C9, 1','・C10 ← j','■k: 0, k≦D9, 1','・D10 ← k','▲［e］',
 '■m: 0, m≦3, 1','・相対(B15, package_no, m) ← 相対(B10, 0, m)','■','・work_weight ← E10','▼','■','■','■','■i: 0, i≦2, 1','・［f］','■','・package_no ← package_no + 1','■',
];
