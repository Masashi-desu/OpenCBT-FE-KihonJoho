/** Original numeric-only instruction text; unknown/character operations are rejected by tests. */
export const legacy2017AutumnPm12Program1=`BSRH START
     RPUSH
     LD GR0,=-1
     LD GR6,=#FFFF        ; マスク作成
     SRL GR6,0,GR3
     XOR GR6,=#FFFF
     LD GR4,0,GR1         ; αの取出し
     LD GR5,1,GR1
     LD GR1,=32
     SUBA GR1,GR3         ; GR1 ← 32 - n
     LD GR3,GR1           ; GR3 ← 32 - n
LP   LD GR7,GR4
     AND GR7,GR6
     [a]
     JZE FOUND            ; 一致あり
     SUBA GR1,=1
     JMI FIN              ; 一致なし
     SLL GR4,1            ; αを1ビット左シフト
     SLL GR5,1
     [b]
     JUMP LP
NEXT OR GR4,=#0001
     JUMP LP
FOUND SUBA GR3,GR1        ; pの算出
     LD GR0,GR3
FIN  RPOP
     RET
     END`;
export const legacy2017AutumnPm12Program2=`BREP START
     RPUSH
     CALL BSRH
     LD GR2,GR0
     JMI FIN
     LD GR6,=#FFFF        ; マスク作成
     SRL GR6,0,GR3
     XOR GR6,=#FFFF
     LD GR7,GR3           ; GR7 ← n
     LD GR3,=16
     SUBA GR3,GR2         ; GR3 ← 16 - p
     JMI ONL2             ; 一致する部分ビット列が2語目だけのとき
     JZE ONL2
     CPA GR3,GR7          ; (16 - p)とnの比較
     JMI NEXT             ; 2語にまたがる処理
     JUMP ONL1            ; 一致する部分ビット列が1語目だけのとき
NEXT LD GR5,GR4           ; γとマスクを退避
     LD GR7,GR6
     CALL S1              ; 1語目の処理
     LD GR4,GR5
     LD GR6,GR7
     SLL GR4,0,GR3        ; 2語目用γの調整
     SLL GR6,0,GR3        ; 2語目用マスクの調整
     LAD GR1,1,GR1
     CALL S2              ; 2語目の最終処理
     JUMP FIN
ONL1 CALL S1
     JUMP FIN
ONL2 [c]
     SUBA GR2,GR3         ; GR2 ← p - 16
     LAD GR1,1,GR1        ; 操作対象を2語目にして、
     CALL S1              ; 2語目の処理
FIN  RPOP
     RET
S1   SRL GR4,0,GR2        ; γの調整
     SRL GR6,0,GR2        ; マスクの調整
S2   LD GR2,0,GR1         ; 操作対象語の取出し
     XOR GR6,=#FFFF
     AND GR2,GR6
     [d]
     ST GR2,0,GR1
     RET
     END`;
