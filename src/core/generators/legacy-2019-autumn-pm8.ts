/** Autumn2019 PM8 whole major; unregistered annual preparation. */
import{p,table,figure,field,variableNotes,type GenerationDefinition}from './definition';
import{legacy2019BitapModel}from './legacy-2019-autumn-pm8-model';
const sourceText={
  "paragraphs": {
    "38": [
      "関数BitapMatchは、Bitap法を使って文字列検索を行うプログラムである。Bitap法は、検索対象の文字列（以下、対象文字列という）と検索文字列の照合に、個別の文字ごとに定義されるビット列を用いるという特徴をもつ。",
      "本問では、例えば2進数の16ビット論理型の定数0000000000010101は、上位の0を省略して\"10101\"Bと表記する。",
      "関数BitapMatchは、対象文字列をText[]に、検索文字列をPat[]に格納して呼び出す。配列の要素番号は1から始まり、Text[]のi番目の文字はText[i]と表す。Pat[]についても同様にi番目の文字はPat[i]と表す。対象文字列と検索文字列は、英大文字で構成され、いずれも最長16文字とする。",
      "対象文字列Text[]が\"AACBBAACABABAB\"、検索文字列Pat[]が\"ACABAB\"の場合の格納例を、図1に示す。",
      "関数BitapMatchは、関数GenerateBitMaskを呼び出す。関数GenerateBitMaskは、文字\"A\"〜\"Z\"の文字ごとに、検索文字列に応じたビット列（以下、ビットマスクという）を生成し、要素数26の16ビット論理型配列Mask[]に格納する。"
    ],
    "39": [
      "Mask[1]には文字\"A\"に対応するビットマスクを、Mask[2]には文字\"B\"に対応するビットマスクを格納する。このようにMask[1]〜Mask[26]に文字\"A\"〜\"Z\"に対応するビットマスクを格納する。",
      "関数GenerateBitMaskは、Mask[]の全ての要素を\"0\"Bに初期化した後、1以上でPat[]の文字数以下の全てのiに対して、Pat[i]の文字に対応するMask[]の要素であるMask[Index(Pat[i])]に格納されている値の、下位から数えてi番目のビットの値を1にする。",
      "関数Indexは、引数にアルファベット順でn番目の英大文字を設定して呼び出すと、整数n（1≦n≦26）を返す。",
      "図1で示した、Pat[]が\"ACABAB\"の例の場合、関数GenerateBitMaskを実行すると、Mask[]は図2のようになる。"
    ],
    "41": [
      "Text[]とPat[]を受け取り、Text[]の要素番号の小さい方からPat[]と一致する文字列を検索し、見つかった場合は、一致した文字列の先頭の文字に対応するText[]の要素の要素番号を返し、見つからなかった場合は、−1を返す。",
      "図1の例では、Text[7]〜Text[12]の文字列がPat[]と一致するので、7を返す。"
    ],
    "42": [
      "図1で示したように、Text[]とPat[]に値を格納し、関数BitapMatchを実行した。プログラム2の行βを実行した直後の変数iと配列要素Mask[Index(Text[i])]と変数Statusの値の遷移は、表3のとおりである。",
      "例えば、iが1のときに行βを実行した直後のStatusの値は\"1\"Bであることから、iが2のときに行αを実行した直後のStatusの値は、\"1\"Bを1ビットだけ論理左シフトした\"10\"Bと\"1\"Bとのビットごとの論理和を取った\"11\"Bとなる。次に、iが2のときに行βを実行した直後のStatusの値は、Mask[Index(Text[2])]の値が\"10101\"Bであることを考慮すると、[d]となる。",
      "同様に、iが8のときに行βを実行した直後のStatusの値が\"10\"Bであることに留意すると、iが9のときに行αを実行した直後の行βで参照するMask[Index(Text[9])]の値は[e]であるので、行βを実行した直後のStatusの値は[f]となる。"
    ],
    "43": [
      "関数GenerateBitMaskの拡張に関する、次の記述中の空欄に入る正しい答えを、解答群の中から選べ。ここで、プログラム3中の[b]には、設問1の[b]の正しい答えが入っているものとする。",
      "表4に示すような正規表現を検索文字列に指定できるようにするために、関数GenerateBitMaskを拡張し、関数GenerateBitMaskRegexを作成した。"
    ],
    "44": [
      "Pat[]に\"AC[BA]A[ABC]A\"を格納して、GenerateBitMaskRegexを呼び出した場合を考える。この場合、文字\"A\"に対応するビットマスクであるMask[1]は[g]となり、関数GenerateBitMaskRegexの返却値は[h]となる。",
      "Pat[]に格納する文字列中において[]を入れ子にすることはできないが、誤ってPat[]に\"AC[B[AB]AC]A\"を格納して関数GenerateBitMaskRegexを呼び出した場合、Mask[1]は[i]となる。"
    ]
  },
  "programs": {
    "1": [
      "○整数型関数: GenerateBitMask(文字型: Pat[], 16ビット論理型: Mask[])",
      "○整数型: i, PatLen",
      "・PatLen ← Pat[]の文字数",
      "■ i: 1, i ≦ 26, 1",
      "  ・Mask[i] ← [b]  /* 初期化 */",
      "■",
      "■ i: 1, i ≦ PatLen, 1",
      "  ・Mask[Index(Pat[i])] ← [c] と",
      "      Mask[Index(Pat[i])]とのビットごとの論理和",
      "■",
      "・return (PatLen)"
    ],
    "2": [
      "○整数型関数: BitapMatch(文字型: Text[], 文字型: Pat[])",
      "○16ビット論理型: Goal, Status, Mask[26]",
      "○整数型: i, TextLen, PatLen",
      "・TextLen ← Text[]の文字数",
      "・PatLen ← GenerateBitMask(Pat[], Mask[])",
      "・Status ← \"0\"B",
      "・Goal ← \"1\"Bを(PatLen − 1)ビットだけ論理左シフトした値",
      "■ i: 1, i ≦ TextLen, 1",
      "  ・Status ← Statusを1ビットだけ論理左シフトした値と  ← α",
      "      \"1\"Bとのビットごとの論理和",
      "  ・Status ← StatusとMask[Index(Text[i])]とのビットごとの論理積  ← β",
      "  ▲ StatusとGoalとのビットごとの論理積 ≠ \"0\"B",
      "    ・return (i − PatLen + 1)",
      "  ▼",
      "■",
      "・return (−1)"
    ],
    "3": [
      "○整数型関数: GenerateBitMaskRegex(文字型: Pat[],",
      "    16ビット論理型: Mask[])",
      "○整数型: i, OriginalPatLen, PatLen, Mode",
      "・OriginalPatLen ← Pat[]の文字数",
      "・PatLen ← 0",
      "・Mode ← 0",
      "■ i: 1, i ≦ 26, 1",
      "  ・Mask[i] ← [b]  /* 初期化 */",
      "■",
      "■ i: 1, i ≦ OriginalPatLen, 1",
      "  ▲ Pat[i] = \"[\"",
      "    ・Mode ← 1",
      "    ・PatLen ← PatLen + 1",
      "  ―",
      "    ▲ Pat[i] = \"]\"",
      "      ・Mode ← 0",
      "    ―",
      "      ▲ Mode = 0",
      "        ・PatLen ← PatLen + 1",
      "      ▼",
      "      ・Mask[Index(Pat[i])] ← \"1\"Bを(PatLen − 1)ビットだけ",
      "          論理左シフトした値とMask[Index(Pat[i])]とのビットごとの論理和",
      "    ▼",
      "  ▼",
      "■",
      "・return (PatLen)"
    ]
  },
  "table1": {
    "caption": "関数GenerateBitMaskの引数と返却値の仕様",
    "columns": [
      "引数／返却値",
      "データ型",
      "入力／出力",
      "説明"
    ],
    "rows": [
      [
        "Pat[]",
        "文字型",
        "入力",
        "検索文字列が格納されている1次元配列"
      ],
      [
        "Mask[]",
        "16ビット論理型",
        "出力",
        "文字A〜Zに対応するビットマスクが格納される1次元配列"
      ],
      [
        "返却値",
        "整数型",
        "出力",
        "検索文字列の文字数"
      ]
    ]
  },
  "table2": {
    "caption": "関数BitapMatchの引数と返却値の仕様",
    "columns": [
      "引数／返却値",
      "データ型",
      "入力／出力",
      "説明"
    ],
    "rows": [
      [
        "Text[]",
        "文字型",
        "入力",
        "対象文字列が格納されている1次元配列"
      ],
      [
        "Pat[]",
        "文字型",
        "入力",
        "検索文字列が格納されている1次元配列"
      ],
      [
        "返却値",
        "整数型",
        "出力",
        "対象文字列中に検索文字列が見つかった場合は、一致した文字列の先頭の文字に対応する対象文字列の要素の要素番号を、検索文字列が見つからなかった場合は、−1を返す。"
      ]
    ]
  },
  "table4": {
    "caption": "正規表現",
    "columns": [
      "記号",
      "説明"
    ],
    "rows": [
      [
        "[]",
        "[]内に記載されている文字のいずれか1文字に一致する文字を表す。例えば、\"A[XYZ]B\"は、\"AXB\"、\"AYB\"、\"AZB\"を表現している。"
      ]
    ]
  },
  "choices": {
    "a": {
      "labels": [
        "ア",
        "イ",
        "ウ",
        "エ"
      ],
      "bits16": [
        "0000000000010101",
        "0000000000101000",
        "0001010000000000",
        "1010000000000000"
      ]
    },
    "b": {
      "labels": [
        "ア",
        "イ",
        "ウ",
        "エ",
        "オ"
      ],
      "values": [
        "\"0\"B",
        "\"1\"B",
        "\"1\"BをPatLenビットだけ論理左シフトした値",
        "\"1\"Bを(PatLen − 1)ビットだけ論理左シフトした値",
        "\"1111111111111111\"B"
      ]
    },
    "c": {
      "labels": [
        "ア",
        "イ",
        "ウ",
        "エ",
        "オ"
      ],
      "values": [
        "\"1\"Bを(i − 1)ビットだけ論理左シフトした値",
        "\"1\"Bをiビットだけ論理左シフトした値",
        "\"1\"Bを(PatLen − 1)ビットだけ論理左シフトした値",
        "\"1\"BをPatLenビットだけ論理左シフトした値",
        "\"1\"B"
      ]
    },
    "def": {
      "labels": [
        "ア",
        "イ",
        "ウ",
        "エ",
        "オ",
        "カ",
        "キ"
      ],
      "bits": [
        "0",
        "1",
        "10",
        "11",
        "100",
        "101",
        "10101"
      ],
      "parts": [
        "d",
        "e",
        "f"
      ]
    },
    "gi": {
      "labels": [
        "ア",
        "イ",
        "ウ",
        "エ",
        "オ",
        "カ"
      ],
      "bits": [
        "1001101",
        "1010100001",
        "1011001",
        "101111",
        "110011",
        "111101"
      ],
      "parts": [
        "g",
        "i"
      ]
    },
    "h": {
      "labels": [
        "ア",
        "イ",
        "ウ",
        "エ"
      ],
      "values": [
        4,
        6,
        9,
        13
      ]
    }
  }
} as const;

export const legacy2019BitapPrograms=sourceText.programs;
export const legacy2019BitapCodeAlt=(n:number)=>`プログラム${n}。`+legacy2019BitapPrograms[String(n)as keyof typeof legacy2019BitapPrograms].join('\n')+'\n制御範囲：■の初期値・継続条件・増分から対応する■まで繰り返す。▲から対応する▼までが条件分岐。横線はそれ以外の分岐を表す。';
const bits=(n:number)=>'"'+n.toString(2)+'"B',bits16=(n:number)=>n.toString(2).padStart(16,'0');
export const legacy2019AutumnBitapDefinitions:GenerationDefinition[]=[{
 source:'2019r01a-fe-pm-8',title:'旧制度・午後：Bitap法による文字列検索',sourceAnswer:'aイ bア cア dイ eキ fカ gカ hイ iウ',version:'3.2.0',fields:[field('検索文字列の配置',0,3),field('照合前半の条件',0,2)],reference:[0,0],
 notes:variableNotes+' 原7頁/共通2頁、9欄31固有51参照、全3プログラムを保持。図1/2は原配列/Mask/全空欄を管理表へ組版。12条件のText14/Pat6/16bitと初回一致7を保ち、別の正規表現2例は固定。a誤答の数値対応は観察的で公式意図を断定しない。共通記法は原p3/4を参照可能にし、実容量/共有Runは別途検査。',
 build(values){
 const m=legacy2019BitapModel(values),paras=sourceText.paragraphs;
 const spec=(id:'table1'|'table2'|'table4')=>table('表'+id.at(-1)+' '+sourceText[id].caption,[...sourceText[id].columns],sourceText[id].rows.map(r=>[...r]));
 const program=(n:number)=>figure('legacy-2019-autumn-pm8-bitap-program'+n,[0],'プログラム'+n,legacy2019BitapCodeAlt(n));
 const def=m.def.map(bits),gi=sourceText.choices.gi.bits.map(v=>'"'+v+'"B'),a=m.a.map(bits16),all=[...a,...sourceText.choices.b.values,...sourceText.choices.c.values,...def,...gi,...sourceText.choices.h.values.map(String)],offsets=[0,4,9,14,14,14,21,27,21],counts=[4,5,5,7,7,7,6,4,6],correct=[1,0,0,m.def.indexOf(m.answers.d),m.def.indexOf(m.answers.e),m.def.indexOf(m.answers.f),5,1,2];
 return{prompt:[p('次の問8は必須問題です。必ず解答してください。'),p('旧制度・午後 問8。次のプログラムの説明及びプログラムを読んで、設問1〜3に答えよ。'),
 ...paras['38'].map((t,i)=>p(i===3?`対象文字列Text[]が"${m.text}"、検索文字列Pat[]が"${m.pattern}"の場合の格納例を、図1に示す。`:t)),
 figure('legacy-2019-autumn-pm8-bitap-text-array',[...values],'図1 対象文字列Text[]の格納例','対象文字列Text[]。'+[...m.text].map((c,i)=>`${i+1}:${c}`).join('、')+'。要素番号は1から14。'),table('図1 検索文字列Pat[]の格納例',Array.from({length:6},(_,i)=>String(i+1)),[[...m.pattern]]),
 ...paras['39'].slice(0,3).map(p),p(`図1で示した、Pat[]が"${m.pattern}"の例の場合、関数GenerateBitMaskを実行すると、Mask[]は図2のようになる。`),
 table('図2 図1で示したPat[]に対するMask[]の値',['配列要素','値','対応するビットマスク'],[['Mask[1]',bits16(m.masks[0]),'A'],['Mask[2]','［a］','B'],['Mask[3]',bits16(m.masks[2]),'C'],['Mask[4]',bits16(m.masks[3]),'D'],['…','…','…'],['Mask[26]',bits16(m.masks[25]),'Z']]),
 p('関数GenerateBitMaskの引数と返却値の仕様は、表1のとおりである。'),spec('table1'),program(1),p('設問1 プログラムの説明及びプログラム1中の空欄に入る正しい答えを、解答群の中から選べ。'),
 ...paras['41'].map(p),spec('table2'),program(2),p('設問2 次の記述中の空欄に入る正しい答えを、解答群の中から選べ。'),p(paras['42'][0]),
 p(paras['42'][1].replace('値が"10101"B',`値が${bits(m.trace[1].mask)}`).replace('[d]','［d］')),p(paras['42'][2].replace('[e]','［e］').replace('[f]','［f］')),
 table('表3 図1の格納例に対するプログラム2の行βを実行した直後の配列要素Mask[Index(Text[i])]と変数Statusの値の遷移',['i','1','2','…','8','9','…'],[['Mask[Index(Text[i])]',bits(m.trace[0].mask),bits(m.trace[1].mask),'…',bits(m.trace[7].mask),'［e］','…'],['Status','"1"B','［d］','…','"10"B','［f］','…']]),
 p('設問3 '+paras['43'][0]),p(paras['43'][1]),spec('table4'),program(3),...paras['44'].map(p)],
 choices:all.map(t=>[p(t)]),answerParts:counts.map((count,i)=>({id:'part-'+'abcdefghi'[i],label:'設問'+(i<3?1:i<6?2:3)+' '+'abcdefghi'[i],choiceIds:Array.from({length:count},(_,j)=>'choice-value-'+(offsets[i]+j+1))})),partAnswers:correct.map((index,i)=>({kind:'choice' as const,partId:'part-'+'abcdefghi'[i],choiceId:'choice-value-'+(offsets[i]+index+1)})),
 explanation:`aは検索文字列のBの位置${[...m.pattern].flatMap((c,i)=>c==='B'?[i+1]:[]).join('、')}のビットを立てた${bits16(m.answers.a)}である。${a[0]}はAの位置、${a[2]}はBの16ビット逆順、${a[3]}はBの6ビット列を上位へ寄せた値であり、求める下位からの位置と異なる。bは全26要素を0に初期化する。1、PatLen等をシフトした値又は全1では検索文字列にないZなどにも1が残る。cは下位からi番目なので1を(i−1)ビットだけ左シフトする。i、PatLen−1、PatLen、固定1の候補は位置又は各文字への適用が異なる。dは${bits(m.trace[1].alpha)}と${bits(m.trace[1].mask)}のANDで${bits(m.answers.d)}。eはText[9]=${m.text[8]}に対応する${bits(m.answers.e)}。fはStatus8=${bits(m.trace[7].status)}を左シフトして1をORした${bits(m.trace[8].alpha)}とeをANDして${bits(m.answers.f)}。他の共有候補はこの行の実状態又はマスク値と一致しない。各状態はその位置で終わるTextの接尾辞とPatの接頭辞との一致長を表す。初めて長さ6まで一致するのはi=12で、返す先頭は12−6+1=7。設問3は別の固定例でありbには正しい0を使う。AC[BA]A[ABC]AではAが位置1、3、4、5、6に対応し、gは"111101"B=61、hは実効長6。4はクラス外の文字数、9は括弧内も含めた英字数、13は記号も含めた元の文字数であって実効長ではない。誤入力AC[B[AB]AC]Aも手続をそのまま追う。内側の]でModeが0へ戻るのでAは位置1、4、5、7、Bは3、4、Cは2、6であり、iは"1011001"B=89となる。入れ子を修復したり深さを数えるスタックへ置き換えたりしない。gの他候補77、673、89、47、51は正しい61と異なり、iの他候補77、673、47、51、61も正しい89と異なる。`,
 };
 }}];
