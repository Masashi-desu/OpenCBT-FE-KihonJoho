import {code, field, figure, p, programs, strings, table, variableNotes, type GenerationDefinition} from "./definition";
import {legacy2017Pm9Model as model, legacy2017Pm9Bits as bits, legacy2017Pm9Profiles as profiles, legacy2017Pm9Figure as drawing, legacy2017Pm9Abc as abc, legacy2017Pm9E as e} from "./legacy-2017-pm9-model";
export const legacy2017Pm9Program1 = `void marking(int numQ, int type[], unsigned int ansC[],
             unsigned int ansE[], int mark[]) {
    int i;
    /* α */

    for (i = 0; i < numQ; i++) {
        mark[i] = 0;
        if (type[i] == 1) {
            if (ansE[i] == ansC[i]) {
                mark[i] = 1;
            }
        }
        else if ((2 <= type[i]) && (type[i] <= 8)) {
            if (countMarkBits([a]) <= [b]) {
                mark[i] = countMarkBits([c]);
            }
        }
        /* β */
    }
}`;
export const legacy2017Pm9Program2 = `int countMarkBits(unsigned int ans) {
    int count = 0;
    unsigned int work = ans;

    while (work != 0) {
        count++;
        work = work & (work - 1);    /* γ */
    }
    return count;
}`;
export const legacy2017Pm9Extension = `else if ((11 <= type[i]) && (type[i] <= 13)) {
    if (type[i] == 11) {
        sumC = 0;
        sumE = 0;
    }
    sumC = sumC | ansC[i];
    if (countMarkBits(ansE[i]) == 1) {
        sumE = sumE | ansE[i];
    }
    if (type[i] == 13) {
        mark[i] = countMarkBits(sumC & sumE);
    }
}`;
export const legacy2017Pm9Definition: GenerationDefinition = {
  source: "2017h29h-fe-pm-9", title: "旧制度・午後：Cによるマークシート答案の採点", version: "3.2.0",
  fields: [field("ビット配置と順不同解答の条件", 0, 7)], reference: [0],
  sourceAnswer: "設問1 a=カ、b=キ、c=エ／設問2 d=イ、e=イ／設問3 f=ア、g=イ",
  notes: variableNotes + " 2017春午後問9の全6頁、16bit unsigned int、4図、引数表・採点表、2プログラム、α/β差替13行、7独立解答欄25固有選択肢41参照を保持。a/b/cは同じ8択、順不同という題材をこの大問自身の欄順不同と混同しない。原図3の地理的正答b岐阜/d滋賀/e奈良と図4のansCは全8条件で固定する。入力条件は設問2のビット配置と設問3の同役割の解答値へバインドする。0〜3では末尾の複数マークを除外、4〜7では末尾の一つのマークを加える。原本文のCの型幅や演算子・採点条件は変えない。fは末尾だけに合計を記録し、gはORで重複を一つにまとめた値。独立した16要素の真偽配列/集合モデルで全択と全条件を検算する。言語C専用の別付録はない。学習補足は解説だけに置く。",
  build(values) {
    if (!Array.isArray(values) || values.length !== 1) throw Error("PARAMETER_CONSTRAINT");
    const v = values[0], m = model(v);
    const draw = (i: number) => {const f = drawing(profiles[i], [v]); return figure(profiles[i], [v], f.caption, f.alt);};
    const offsets = [0, 0, 0, 8, 12, 15, 21], counts = [8, 8, 8, 4, 3, 6, 4];
    const answers = [5, 6, 3, 1, 1, 0, v < 4 ? 1 : 3];
    return {
      prompt: [
        p("次の問9から問13までの5問については、この中から1問を選択し、選択した問題については、答案用紙の選択欄の（選）をマークして解答してください。なお、2問以上マークした場合には、はじめの1問について採点します。"),
        p("問9 次のCプログラムの説明及びプログラムを読んで、設問1〜3に答えよ。"),
        p("マーク式試験の答案を採点するプログラムである。問題と受験者の解答の例を、図1に示す。"), draw(0),
        p("ここでは、unsigned int型のデータは、16ビットのビット列で表し、連続する8ビットが全て0のときは0…0、全て1のときは1…1と表記する。"),
        p("プログラムの説明"),
        p("(1) 関数markingは、1回の実行で受験者1人分の答案を採点する。"),
        p("(2) 関数markingの引数の仕様は、次のとおりである。ここで、引数の値に誤りはないものとする。"),
        table("関数markingの引数の仕様", ["引数", "データ型", "入出力", "説明"], [["numQ", "int", "入力", "問の数を格納した変数"], ["type[]", "int", "入力", "各問の解答形式を格納した配列"], ["ansC[]", "unsigned int", "入力", "各問の正答を格納した配列"], ["ansE[]", "unsigned int", "入力", "各問の受験者の解答を格納した配列"], ["mark[]", "int", "出力", "各問の採点結果を格納する配列"]]),
        p("① 問の数は、numQである。引数である各配列の要素数も、numQである。"),
        p("② 1問当たりの選択肢の個数は16個以下である。"),
        p("③ type[]の各要素には、答えを一つマークする問の場合は1、複数個マークする問の場合はマークする個数n（2≦n≦8）が格納されている。"),
        p("④ ansC[]の各要素は、16ビットのビット列で、図2の例に示すように、最上位のビットから1ビットずつ順に選択肢a、b、…に対応し、正答の選択肢に対応するビット位置に1が格納されている。他の全てのビットは0である。"),
        p("⑤ ansE[]の各要素は、ansC[]と同様の形式で、受験者の解答が格納されている。"), draw(1),
        p("(3) 関数markingは、各問（要素番号i：0、1、…、numQ−1）について、表1に示す解答形式に応じた採点方法で採点する。採点結果はmark[i]に格納する。"),
        table("表1 解答形式に応じた各問の採点方法", ["解答形式", "type[i]の値", "採点方法及びmark[i]に格納する値"], [["答えを一つマークする問", "1", "ansC[i]＝ansE[i]（正解）なら1、ansC[i]≠ansE[i]（不正解）なら0"], ["答えを複数個マークする問", "n（2≦n≦8）", "ansE[i]中の1のビットの個数がn＋1個以上なら0、n個以下なら、ansC[i]とansE[i]の対応するビットが共に1である個数"]]),
        p("(4) 関数markingから呼ばれる関数countMarkBitsは、引数の値に含まれる1のビットの個数を返却値として返す。"),
        p("プログラム1"), code(legacy2017Pm9Program1, "c"),
        p("設問1 プログラム1中の［a］〜［c］に入れる正しい答えを、解答群の中から選べ。"),
        draw(5),
        p("設問2 関数countMarkBitsのプログラムを、プログラム2に示す。次の記述中の［d］、［e］に入れる正しい答えを、解答群の中から選べ。"),
        p("プログラム2"), code(legacy2017Pm9Program2, "c"),
        p(`コメント/* γ */を付した行の代入式を実行するとき、実行前のworkの値が${bits(m.work)}であれば、実行後のworkの値は［d］となる。`),
        p("コメント/* γ */を付した行の代入式を、次のとおり変更して、プログラム2の実行を試みた場合、［e］。"), code("work = work && (work - 1);", "c"),
        draw(6), draw(7),
        p("設問3 次の記述中の［f］、［g］に入れる正しい答えを、解答群の中から選べ。"),
        p("解答形式に、順不同形式を追加する。順不同形式とは、答えを一つマークする問が2問以上連続していて、共通の解答群から答えを選んでいくが、その選択の順序は入れ替わってもよい形式である。図3の例では、問21、22、23の順に正答b、d、eが設定されているが、これを受験者の解答の例のように異なる順序で解答してもよい。正しい答えが幾つ選択されたかによって、採点結果が決まる。"), draw(2),
        p("順不同形式の問題に対する解答を含む答案を採点するために、プログラム1を次のとおり修正した。"),
        p("(1) プログラム1中のコメント/* α */の行を、次の1行で置き換える。"), code("unsigned int sumC, sumE;", "c"),
        p("(2) プログラム1中のコメント/* β */の行を、次の13行で置き換える。"), code(legacy2017Pm9Extension, "c"),
        p("順不同形式の問を表すtype[]の値は、11〜13である。一組の順不同形式の問題において、値11は先頭の問を表し、値13は末尾の問を表す。値12は3問以上から成る順不同形式の問題における中間の問を表す。"),
        p("図3の順不同形式の問題に対する解答を含む答案を、修正したプログラム1で採点する。ある受験者の解答の採点例として、関数markingに渡された各配列要素の内容、及びこれらの内容に基づく採点結果を、図4に示す。"), draw(3),
        p("また、図4に示す解答の採点が完了した時点で、変数sumEには値［g］が格納されている。"),
        draw(4), draw(8),
      ],
      choices: [...programs(abc), ...strings(m.d.map(bits)), ...strings(e), ...m.f.map(row => [table("採点結果（上からmark[20]、mark[21]、mark[22]）", ["値"], row.map(n => [String(n)]))]), ...strings(m.g.map(bits))],
      answerParts: counts.map((count, i) => ({id: `part-${"abcdefg"[i]}`, label: `設問${i < 3 ? 1 : i < 5 ? 2 : 3} ${"abcdefg"[i]}`, choiceIds: Array.from({length: count}, (_, j) => `choice-value-${offsets[i] + j + 1}`)})),
      partAnswers: answers.map((index, i) => ({kind: "choice" as const, partId: `part-${"abcdefg"[i]}`, choiceId: `choice-value-${offsets[i] + index + 1}`})),
      explanation: `a：過剰マークを検査する対象はansE[i]。b：許されるマーク数の上限はtype[i]。2や3の固定値、正答のビット列、type[i]+1では一般の指定数を検査できない。c：正答と受験者の解答の両方が1のビットを&で抽出する。|は和集合なので正答していない選択肢も数える。d：work−1では最下位の1が0になり、その下位が1になる。元のworkとの&で最下位の1だけを取り除くので${bits(m.work)}から${bits(m.d[1])}となる。下位の1だけを残す、1を引くだけ、上位の1を左へ移す値は該当しない。e：&&は両辺を真偽値として評価し0又は1を返す。&のビット積とは異なり、ans=4なら本来1個だが2を返し、ans=7なら本来3個だが2を返す。今回のworkの2bitだけでは2と偶然一致するが、一般の個数計算として正しくない。workは変化するので無限ループにもならない。f：markの各要素は先に0にされ、type=13の行だけに集計値を記録する。1bitの解答だけを集合へ加え、同じ解答の重複はORで一つにまとめる。図4の共通正答集合との一致は${m.score}個なので、markは0、0、${m.score}となる。g：sumEは${bits(m.sumE)}。${v < 4 ? "末尾の解答は2bitなので加えない。先頭2行は同じ1bitなので重複を数えない。" : "末尾も1bitなので先頭2行の重複1bitとORする。"}正答側の集合を答えたり、複数マークを無条件に加えたりしない。`,
    };
  },
};
