import { code, field, list, p, strings, table, variableNotes, type GenerationDefinition, type GeneratedBody } from "./definition";

/** Unregistered staging definitions. Registration follows original/rights/UI review. */
function def(period: "spring" | "autumn", number: number, title: string, sourceAnswer: string,
  fields: GenerationDefinition["fields"], reference: number[], build: GenerationDefinition["build"], notes: string): GenerationDefinition {
  return {
    source: `${period === "spring" ? "2019h31h" : "2019r01a"}-fe-am-${number}`,
    title, sourceAnswer, fields, reference, notes: variableNotes + " " + notes,
    build: values => {
      if (values.length !== fields.length || values.some((v, i) => !Number.isInteger(v) || v < fields[i].minimum || v > fields[i].maximum))
        throw new Error("PARAMETER_CONSTRAINT");
      const result = build(values);
      if (new Set(result.choices.map(c => JSON.stringify(c))).size !== 4) throw new Error("PARAMETER_CONSTRAINT");
      return result;
    },
  };
}
function numeric(prompt: GeneratedBody["prompt"], choices: number[], correctIndex: number, explanation: string): GeneratedBody {
  if (choices.some(v => !Number.isFinite(v))) throw new Error("PARAMETER_CONSTRAINT");
  return { prompt, choices: strings(choices.map(String)), correctIndex, explanation };
}
function binaryFraction(numerator: number, denominator: number): string {
  let value = numerator, text = "0.";
  for (let weight = denominator / 2; weight >= 1; weight /= 2) {
    text += value >= weight ? "1" : "0";
    if (value >= weight) value -= weight;
  }
  return text.replace(/0+$/, "");
}
function rational(numerator: number, denominator: number): string {
  let a = numerator, b = denominator;
  while (b) [a, b] = [b, a % b];
  return numerator / a === denominator / a ? "1" : `${numerator / a}/${denominator / a}`;
}
const hex = (n: number) => n.toString(16).toUpperCase().padStart(2, "0");

export const legacy2019QuantitativeDefinitions: GenerationDefinition[] = [
  def("spring", 1, "二進小数への変換", "ウ", [field("numerator", 7, 9), field("denominatorExponent", 4, 6)], [7, 5], ([n, exponent]) => {
    const d = 2 ** exponent;
    const choices = [binaryFraction(n + 4, d * 2), binaryFraction(n + 6, d * 2), binaryFraction(n, d), binaryFraction(2 * n, d)];
    // The first digit remains 0: all values are positive proper fractions.
    if (2 * n >= d) throw new Error("PARAMETER_CONSTRAINT");
    return { prompt: [p(`10進数の演算式 ${n}÷${d} の結果を2進数で表したものはどれか。`)], choices: strings(choices), correctIndex: 2,
      explanation: `${n}÷${d}=${n}/${d}。分母が2の${exponent}乗なので、2進表現の小数点を${exponent}桁左へ移すと ${choices[2]} になる。` };
  }, "原値7/32、選択肢0.001011・0.001101・0.00111・0.0111。分母16〜64の二の冪、分子7〜9。真分数と一意性で制約し、最長7桁の二進有限小数。誤答の原位置の分子差・桁ずれを保持し、十進丸めなし。"),

  def("spring", 2, "ビットマスクによる抽出", "ウ", [field("keptBits", 5, 7), field("wrongMaskBits", 2, 4)], [7, 4], ([kept, wrong]) => ({
    prompt: [p(`最上位をパリティビットとする8ビット符号において、下位${kept}ビットだけを得て上位${8 - kept}ビットを0にするためのビット演算はどれか。`)],
    choices: strings([`16進数${hex(2 ** wrong - 1)}とのANDをとる。`, `16進数${hex(2 ** wrong - 1)}とのORをとる。`, `16進数${hex(2 ** kept - 1)}とのANDをとる。`, "16進数FFとのXOR（排他論理和）をとる。"]), correctIndex: 2,
    explanation: `残す下位${kept}ビットだけが1である${hex(2 ** kept - 1)}とのANDで、上位を0にして下位の値を保持する。ORは必要なビットも1にし、XORはビットを反転する。`,
  }), "原問の下位7ビット抽出を下位5〜7ビットへ変更し、パリティ位置を変えず抽出範囲を明示する。ANDの不足マスク、OR、正しいAND、反転という四役を保持。全256入力の関数等価性と誤答反例を独立テスト。"),

  def("spring", 6, "再帰呼出しと三つのスタック", "ア", [field("first", 1, 3), field("step", 1, 3)], [1, 1], ([first, step]) => {
    const values = [first, first + step, first + 2 * step], normal = values.join(", "), reverse = [...values].reverse().join(", ");
    return { prompt: [p(`三つのスタックA、B、Cのいずれの初期状態も[${normal}]であるとき、再帰的に定義された関数f()を呼び出して終了した後のBの状態はどれか。ここで、スタックが[a₁, a₂, …, aₙ₋₁]の状態のときにaₙをpushした後の状態は[a₁, a₂, …, aₙ₋₁, aₙ]で表す。`),
      code("f() {\n  Aが空ならば {\n    何もしない。\n  } そうでない場合 {\n    Aからpopした値をCにpushする。\n    f()を呼び出す。\n    Cからpopした値をBにpushする。\n  }\n}")],
      choices: strings([`[${normal}, ${normal}]`, `[${normal}, ${reverse}]`, `[${reverse}, ${normal}]`, `[${reverse}, ${reverse}]`]), correctIndex: 0,
      explanation: `AからCへ移した値は、再帰から戻るときにもう一度逆順になる。Bへ追加される順序は${normal}であり、Bの元の内容${normal}に続く。`,
    };
  }, "原スタック[1,2,3]、3段階の再帰、pushの末尾定義、全選択肢の前半・後半の役割を保持。異なる等差整数3要素を全9組検証。表示コードの処理を固定し、別の反復的フレームシミュレーションで検算。"),

  def("spring", 11, "ポイントとディスプレイのドット数", "エ", [field("dpiUnits", 4, 7), field("pointUnits", 1, 2)], [4, 1], ([du, pu]) => {
    const dpi = du * 24, points = pu * 12, dots = dpi * points / 72;
    return numeric([p(`${dpi}dpiのディスプレイに${points}ポイントの文字をビットマップで表示したい。正方フォントの縦は何ドットになるか。ここで、1ポイントは1/72インチとする。`)],
      [points * 2 / 3, points * 3 / 4, points, dots], 3,
      `${points}ポイントは${points}/72インチである。縦のドット数は${dpi}×${points}/72=${dots}ドットとなる。dpi（dots per inch）は1インチ当たりのドット数を表す。`);
  }, "原96dpi・12ポイント・選択肢8/9/12/16。dpiは24刻み96〜168、ポイント12又は24で、全候補を整数ドットに制限。誤答は原選択肢のフォント寸法比を維持し、丸めなし。"),

  def("spring", 25, "音声を記録できる時間", "ウ", [field("capacityUnits", 1, 4), field("sampleRateIndex", 0, 2)], [4, 1], ([capacityUnits, rateIndex]) => {
    const capacity = capacityUnits * 128, rate = [8000, 11000, 16000][rateIndex], minutes = capacity * 10 ** 6 / rate / 60;
    return numeric([p(`音声のサンプリングを1秒間に${rate.toLocaleString("en-US")}回行い、サンプリングした値をそれぞれ8ビットのデータとして記録する。このとき、${capacity}×10⁶バイトの容量をもつフラッシュメモリに記録できる音声の長さは、最大何分か。`) ],
      [Math.floor(minutes / 10), Math.floor(minutes / 8), Math.floor(minutes), Math.floor(minutes * 5 / 4)], 2,
      `8ビットは1バイトなので、1秒当たり${rate}バイト、1分当たり${rate * 60}バイトを記録する。${capacity}×10⁶÷${rate * 60}の整数部分は${Math.floor(minutes)}。${Math.floor(minutes) + 1}分では容量を超えるので、最大${Math.floor(minutes)}分である。`);
  }, "原512×10⁶バイト・11000回/秒・8ビット、選択肢77/96/775/969。容量は128刻み、標本化周波数8000/11000/16000。単位変換と最大整数分を保持。誤答は原選択肢に対応する1/10、1/8、5/4の容量換算比で補充（QA-04）、追加の四捨五入なし。"),

  def("spring", 49, "初年度修正費用の期待値", "ア", [field("sizeThousands", 1, 3), field("defectsHundredths", 2, 5), field("discoveryTenths", 1, 3), field("majorTenths", 2, 4), field("costHundreds", 1, 3)], [2, 4, 2, 2, 2], ([size, defect, discovery, major, cost]) => {
    const found = size * defect * discovery, answer = found * major * cost * 10;
    const allRepairs = found * cost * (major * 100 + (10 - major) * 25) / 10;
    return numeric([p("条件に従うとき、アプリケーションプログラムの初年度の修正費用の期待値は、何万円か。"),
      list([`プログラム規模：${size * 1000}kステップ`, `プログラムの潜在不良率：${(defect / 100).toFixed(2)}件/kステップ`, `潜在不良の年間発見率：${discovery * 10}%/年`, `発見した不良の分類：影響度大${major * 10}%、影響度小${100 - major * 10}%`, `不良1件当たりの修正費用：影響度大${cost * 100}万円、影響度小${cost * 25}万円`, "初年度は影響度大の不良だけを修正する"], true)],
      [answer, allRepairs, answer * 5 / 2, answer * 10], 0,
      `初年度に発見する不良は${size * 1000}×${(defect / 100).toFixed(2)}×${discovery / 10}=${found}件。そのうち影響度大だけを修正するので、期待費用は${found}×${major / 10}×${cost * 100}=${answer}万円となる。影響度小の修正費用は加えない。`);
  }, "原条件2000・0.04・20%・20%/80%・200/50万円、原選択肢640/1280/1600/6400。影響度大だけという限定を保持。誤答2は小の修正も加算、他は原値の費用倍率による候補補充。期待件数に端数を認め、金額は最大小数1桁で正確に表示し四捨五入しない。"),

  def("spring", 54, "開発に必要な最少要員", "イ", [field("programScale", 1, 3), field("daysIndex", 0, 2), field("otherWorkMultiplier", 7, 9)], [1, 1, 8], ([scale, dayIndex, other]) => {
    const days = [85, 95, 105][dayIndex], coding = 95 * scale, total = coding * (other + 1), people = Math.ceil(total / days);
    return numeric([p(`システムを構成するプログラムの本数とプログラム1本当たりのコーディング所要工数が表のとおりであるとき、システムを${days}日間で開発するには少なくとも何人の要員が必要か。ここで、システムの開発にはコーディングのほかに、設計及びテストの作業が必要であり、それらの作業にはコーディング所要工数の${other}倍の工数が掛かるものとする。`),
      table("プログラム別の工数", ["処理", "プログラムの本数", "1本当たりのコーディング所要工数（人日）"], [["入力処理", String(20 * scale), "1"], ["出力処理", String(10 * scale), "3"], ["計算処理", String(5 * scale), "9"]])],
      [people - 1, people, Math.ceil(people * 4 / 3), Math.ceil(people * 13 / 9)], 1,
      `コーディングは${20 * scale}×1+${10 * scale}×3+${5 * scale}×9=${coding}人日。設計・テストを加えた総工数は${coding}×(1+${other})=${total}人日である。${people - 1}人では${(people - 1) * days}人日で足りず、${people}人なら${people * days}人日を確保できる。`);
  }, "原20/10/5本、1/3/9人日、95日、追加8倍、選択肢8/9/12/13。日数85/95/105、追加7〜9倍、本数1〜3倍。最少整数人の切上げを維持。不足直前の人数と原選択肢12/9・13/9の工数比で誤答を設計。"),

  def("spring", 78, "需要不足による機会損失", "エ", [field("profitA", 1, 3), field("shortageA", 1, 3), field("shortageD", 1, 3), field("shortageE", 2, 4)], [1, 1, 2, 3], ([profitA, shortA, shortD, shortE]) => {
    const a = profitA * shortA * 100, d = 4 * shortD * 100, e = 5 * shortE * 100;
    return numeric([p("表の条件でA〜Eの商品を販売したときの機会損失は何千円か。"),
      table("商品の販売条件", ["商品", "1個当たり利益（千円）", "需要数（個）", "仕入数（個）"], [["A", String(profitA), "1500", String(1500 - 100 * shortA)], ["B", "2", "900", "1000"], ["C", "3", "800", "1000"], ["D", "4", "700", String(700 - 100 * shortD)], ["E", "5", "500", String(500 - 100 * shortE)]])],
      [d, e, a + e, a + d + e], 3,
      `需要に対して不足した商品の利益を合計する。Aは${a}千円、Dは${d}千円、Eは${e}千円で、合計${a + d + e}千円。B・Cの仕入超過を販売機会の損失として相殺しない。`);
  }, "原選択肢800/1500/1600/2400。需要、仕入、利益の五行表を保持。誤答はDだけ、Eだけ、A+E（Dの計上漏れ）、正答は全不足。A利益1〜3千円、不足100刻み、重複選択肢は明示的に拒否。"),

  def("autumn", 2, "全ビットの反転", "ウ", [field("nibbles", 1, 3)], [2], ([nibbles]) => {
    const width = nibbles * 4, zero = "0".repeat(nibbles), all = "F".repeat(nibbles);
    return { prompt: [p(`${width}ビットの値の全ビットを反転する操作はどれか。`)],
      choices: strings([`16進表記${zero}のビット列と排他的論理和をとる。`, `16進表記${zero}のビット列と論理積をとる。`, `16進表記${all}のビット列と排他的論理和をとる。`, `16進表記${all}のビット列と論理積をとる。`]), correctIndex: 2,
      explanation: `XOR（exclusive OR、排他的論理和）は相手が1のビットを反転する。全${width}ビットが1の${all}とのXORにより、0と1がそれぞれ1と0へ反転する。0とのXOR、0とのAND、1とのANDでは全反転にならない。` };
  }, "原8ビット、00/FF、XOR/ANDの四選択肢。4/8/12ビットを同じ位置へバインドし、各幅の全入力のビット対応を独立検査。全反転を別の演算の名称選択へ置換しない。"),

  def("autumn", 6, "一様乱数の差の確率", "ウ", [field("randomLimitIndex", 0, 2), field("difference", 0, 2)], [1, 0], ([limitIndex, difference]) => {
    const n = [8, 10, 12][limitIndex], right = rational(n - difference, n * n);
    return { prompt: [p(`Random(n)は、0以上n未満の整数を一様な確率で返す関数である。各呼出しは独立である。整数型の変数A、B及びCに対して次の一連の手続を実行したとき、Cの値が${difference}になる確率はどれか。`), code(`A = Random(${n})\nB = Random(${n})\nC = A - B`)],
      choices: strings([rational(1, n * n), rational(n - difference, 2 * n * n), right, rational(2 * (n - difference), n * n)]), correctIndex: 2,
      explanation: `AとBの組合せは等確率で${n}²=${n * n}通りある。A−B=${difference}となるのは${n - difference}通りなので、確率は${n - difference}/${n * n}=${right}である。` };
  }, "原Random(10)二呼出し、差0、選択肢1/100・1/20・1/10・1/5。上限8/10/12と差0〜2を変更し、全乱数対を全列挙。誤答は有利な組合せを一組だけ、半分、二倍と数えるもの。差が非零なら正答以外の分子も連動させ、正答だけ分子が1以外になる表記上の手掛かりを作らない。独立呼出しを明示した改変。分数は既約、丸めなし。"),

  def("autumn", 12, "クロック周波数と命令実行数", "エ", [field("clockGHz", 1, 3), field("cpiIndex", 0, 2)], [1, 1], ([frequency, cpiIndex]) => {
    const cpi = [0.5, 0.8, 1.25][cpiIndex], answer = frequency * 100000 / cpi;
    return numeric([p(`${frequency}GHzのクロックで動作するCPUがある。このCPUは、機械語の1命令を平均${cpi}クロックで実行できることが分かっている。このCPUは1秒間に平均何万命令を実行できるか。`)],
      [answer / 1000, answer / 500, frequency * 100000 * cpi, answer], 3,
      `1秒間のクロック数は${frequency}×10⁹回である。これを1命令当たり${cpi}クロックで割り、さらに1万=10⁴で割る。${frequency}×10⁹÷${cpi}÷10⁴=${answer}万命令となる。CPUはcentral processing unit（中央処理装置）である。`);
  }, "原1GHz・平均0.8クロック・選択肢125/250/80000/125000万命令。GHz1〜3、CPI0.5/0.8/1.25で全選択肢が有限整数。周波数にCPIを掛ける誤りと原選択肢の単位誤りを保持。追加丸めなし。"),

  def("autumn", 16, "並列と直列構成の稼働率差", "ウ", [field("availabilityTenths", 6, 9)], [9], ([tenths]) => {
    const pValue = tenths / 10, answer = 2 * pValue * (1 - pValue);
    const result = numeric([p(`2台の処理装置から成るシステムがある。少なくともいずれか一方が正常に動作すればよいときの稼働率と、2台とも正常に動作しなければならないときの稼働率の差は幾らか。ここで、処理装置の稼働率はいずれも${pValue}とし、故障は独立で、処理装置以外の要因は考慮しないものとする。`)],
      [pValue * (1 - pValue), 1 - pValue, answer, 1 - pValue ** 2].map(v => Number(v.toFixed(2))), 2,
      `並列構成は1−(1−${pValue})²、直列構成は${pValue}²である。その差は1−(1−${pValue})²−${pValue}²=${answer.toFixed(2)}。片方だけ稼働する二つの排反事象の確率の合計とも一致する。`);
    result.choices = strings(result.choices.map(choice => Number((choice[0] as { text: string }).text).toFixed(2)));
    return result;
  }, "原稼働率0.9、選択肢0.09/0.10/0.18/0.19。0.6〜0.9の一桁小数、結果は小数第2位までで正確。独立故障を改変の明示前提とし、二台の全状態を別計算で列挙。"),

  def("autumn", 30, "制御情報を含む回線利用率", "エ", [field("fileMegabytes", 1, 3), field("lineRateIndex", 0, 1), field("periodIndex", 0, 1)], [1, 0, 0], ([megabytes, lineIndex, periodIndex]) => {
    const rate = [10, 20][lineIndex], seconds = [10, 20][periodIndex], payload = megabytes * 8 / rate / seconds * 100;
    const result = numeric([p(`${rate}Mビット/秒の回線で接続された端末間で、平均${megabytes}Mバイトのファイルを、${seconds}秒ごとに転送するときの回線利用率は何%か。ここで、ファイル転送時には、転送量の20%が制御情報として付加されるものとし、1Mビット=10⁶ビット、1Mバイト=10⁶バイトとする。`)],
      [payload * 1.2 / 8, payload * 0.8, payload, payload * 1.2].map(v => Number(v.toFixed(1))), 3,
      `1ファイルは${megabytes}×8=${megabytes * 8}Mビットで、制御情報を加えるとその1.2倍。1周期の伝送可能量${rate}×${seconds}Mビットに対する割合は${megabytes * 8}×1.2÷(${rate}×${seconds})×100=${(payload * 1.2).toFixed(1)}%である。`);
    result.choices = strings(result.choices.map(choice => Number((choice[0] as { text: string }).text).toFixed(1)));
    return result;
  }, "原10Mbps・1MB・10秒ごと・制御20%追加・選択肢1.2/6.4/8.0/9.6%。誤答はビット化忘れ、制御分を減算、制御分計上漏れ。入力域で全値が小数第1位までで正確に収まり、丸めで正答を作らない。"),

  def("autumn", 54, "増員による一対一打合せの増加", "イ", [field("members", 8, 12), field("addedMembers", 2, 4)], [10, 2], ([members, added]) => {
    const extra = members * added + added * (added - 1) / 2;
    return numeric([p(`${members}人のメンバで構成されているプロジェクトチームにメンバ${added}人を増員する。次の条件でメンバ同士が打合せを行う場合、打合せの回数は何回増えるか。`), list(["打合せは1対1で行う。", "各メンバが、他の全てのメンバと1回ずつ打合せを行う。"], false)],
      [members + added, extra, added * (members + 1), extra * 2], 1,
      `元の${members}人と新しい${added}人との組合せは${members * added}組、新しいメンバ同士は${added}×${added - 1}/2=${added * (added - 1) / 2}組。元のメンバ同士の回数は変わらないので、増加は${extra}回である。`);
  }, "原10人+2人、選択肢12/21/22/42。元人数8〜12、増員2〜4のうち誤答と正答が衝突する3人増員は拒否。人数加算、新旧と新新の組合せ、各新メンバの相手を重複計上、順序付き対という役割。全組合せを独立列挙。"),
];
