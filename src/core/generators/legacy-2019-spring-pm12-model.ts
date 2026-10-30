export const spring2019Pm12Profiles = ['legacy-2019-spring-pm12-region','legacy-2019-spring-pm12-program','legacy-2019-spring-pm12-bank'] as const;
export const spring2019Pm12Banks = [
  ['SLL GR2,0,GR3','SLL GR2,4','SLL GR2,4,GR3','SRL GR2,0,GR3','SRL GR2,4','SRL GR2,4,GR3'],
  ['ADDL GR5,GR2','ADDL GR5,GR3','ADDL GR5,GR4','SUBL GR5,GR2','SUBL GR5,GR3','SUBL GR5,GR4'],
  ['JNZ FIN','JNZ LOOP','JPL FIN','JPL LOOP','JZE FIN','JZE LOOP'],
  ['BITSON','BITSOP','SETOP'],
  ['0,GR5','BITSON,GR5','0,GR6','BITSON,GR6','0,GR7','BITSON,GR7'],
] as const;
export const spring2019Pm12BankCaptions = ['aに関する解答群','b，dに関する解答群','cに関する解答群','eに関する解答群','fに関する解答群'] as const;
export const spring2019Pm12Programs = [
` 1 BITSON START
 2        RPUSH
 3        LD    GR3,1,GR1      ; GR3: ビット位置
 4 ; ビット位置を，相対アドレス（GR2）と
 5 ; ビットインデックス（GR3）とに変換
 6        LD    GR2,GR3
 7        ［a］
 8        AND   GR3,=#000F
 9        LD    GR4,2,GR1      ; GR4: ビット長（初期値）
10 ; （ビットインデックス＋ビット長≧16の間，ビット操作を行う）
11 LOOP   LD    GR0,GR4
12        ADDL  GR0,GR3
13        CPL   GR0,BITSPW
14        JMI   BREAK
15        LD    GR5,BITSPW     ; GR5: 語内で対象となるビット数
16        LD    GR3,GR3
17        JZE   FULL
18        ［b］
19        SUBL  GR3,GR3        ; GR3←0
20 FULL   SUBL  GR4,GR5       ; 操作するビット数だけビット長を減らす
21        LD    GR0,=1
22        SLL   GR0,0,GR5
23        SUBL  GR0,=1         ; GR0: ビットマスク
24        CALL  SETOP
25        ADDL  GR2,=1         ; GR2: 次の語の相対アドレス
26        JUMP  LOOP
27 BREAK  LD    GR4,GR4        ; 操作の対象になる未処理のビットあり？
28        ［c］
29 ; 未操作のビット数分の右詰めのビットマスクを生成し，
30 ; 必要なビット数だけ左へシフト
31        LD    GR0,=1
32        SLL   GR0,0,GR4
33        SUBL  GR0,=1
34        LD    GR5,BITSPW
35        SUBL  GR5,GR3
36        ［d］
37        SLL   GR0,0,GR5      ; GR0: ビットマスク
38        CALL  SETOP
39 FIN    RPOP
40        RET
41 BITSPW DC    16             ; 1語のビット数
42        END`,
`1 SETOP START
2       RPUSH
3       LD    GR3,0,GR1
4       ADDL  GR3,GR2
5       OR    GR0,0,GR3
6       ST    GR0,0,GR3
7       RPOP
8       RET
9       END`,
`1 BITSON START
2        RPUSH
3        LAD   GR7,SETOP
4        CALL  BITSOP
5        RPOP
6        RET
7        END`,
] as const;
export function spring2019Pm12Example(values: number[]) {
  if (values.length !== 2 || values.some(v => !Number.isInteger(v)) || values[0] < 0 || values[0] > 3 || values[1] < 0 || values[1] > 3) throw Error('SPRING2019_PM12_DOMAIN');
  const firstIndex = 8 + values[0] * 2, finalBits = 2 + values[1] * 2;
  const position = 32 + firstIndex, length = 32 - firstIndex + finalBits;
  return {position, length, firstWord: 2, firstIndex, lastWord: 4, lastIndex: finalBits - 1,
    rows: Array.from({length: 6}, (_, relative) => Array.from({length: 16}, (_, bit) => relative * 16 + bit >= position && relative * 16 + bit < position + length))};
}
export function spring2019Pm12Figure(profile: string, values: number[]) {
  const index = spring2019Pm12Profiles.indexOf(profile as typeof spring2019Pm12Profiles[number]);
  if (index < 0 || values.length !== 3) throw Error('SPRING2019_PM12_PROFILE');
  const example = spring2019Pm12Example(values.slice(0, 2)), group = values[2];
  const maximum = index === 0 ? 0 : index === 1 ? 2 : 4;
  if (!Number.isInteger(group) || group < 0 || group > maximum) throw Error('SPRING2019_PM12_GROUP');
  if (index === 0) return {kind: 'region' as const, ...example};
  if (index === 1) return {kind: 'program' as const, text: spring2019Pm12Programs[group]};
  return {kind: 'bank' as const, entries: spring2019Pm12Banks[group], caption: spring2019Pm12BankCaptions[group]};
}
