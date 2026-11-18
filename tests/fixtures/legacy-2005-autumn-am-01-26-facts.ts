type Fact = { prompt: RegExp; meaning: readonly [RegExp,RegExp,RegExp,RegExp]; accepted: readonly number[] };
const entry=(prompt:RegExp, meaning:Fact['meaning'], correct:number): Fact=>({prompt,meaning,accepted:[correct]});

// Each predicate identifies one reviewed proposition in the rendered choice. The
// accepted index names the proposition that satisfies the reviewed stem, including
// cases where a proposition is correct for a different medium or mechanism.
const floatMechanisms=[
  /最大値を超える/,
  /四捨五入/,
  /指数.*(?:仮数|下位桁)/,
  /上位.*(?:失われる|相殺)/,
] as const;
const interruptCauses=[
  /主記憶に存在しないページ/,
  /OSに対してサービス/,
  /(?:ハードウェアが異常|周辺装置自身が故障)/,
  /浮動小数点演算でオーバフロー/,
] as const;
const errorControlTerms=[/^CRC$/,/^ECC$/,/^チェックサム$/,/^パリティ$/] as const;
const recordingProcesses=[
  /レーザ光を当てて熱し.*磁気ヘッド/,
  /磁性体の磁化の方向を.*磁気ヘッド/,
  /レーザ光で記録層を相変化/,
  /有機色素.*(?:焦げ跡|反射信号)/,
] as const;
const metrics=[/1インチ.*1分間.*ページ数/,/縦横のドット数.*1秒間.*文字数/,/行の間隔.*1秒間.*行数/,/文字の種類.*1秒間.*文字数/] as const;
const architecture=[/^アドレス(?:指定)?方式$/,/^仮想記憶方式$/,/^直接プログラム制御方式$/,/^プログラム記憶方式$/] as const;

export const knowledgeFacts = new Map<number, readonly Fact[]>([
  // Quantization, exponent-range overflow, alignment loss and cancellation
  // differ by when and why information is lost.
  [6,[
    entry(/丸め誤差/,floatMechanisms,1),
    entry(/オーバフロー/,floatMechanisms,0),
    entry(/情報落ち/,floatMechanisms,2),
    entry(/桁落ち/,floatMechanisms,3),
  ]],
  // A one-node tree refutes a two-children requirement. Push A then B
  // refutes FIFO stack. Repeated inserts before a full contiguous array
  // require movement; a simple linked node obtains the next address.
  [13,[
    entry(/^データ構造/,[/木.*すべての節が二つ/,/スタック.*先入れ先出し/,/リスト.*次のデータ.*ポインタ/,/配列.*ポインタの付替えだけ/],2),
    entry(/編集履歴/,[/木は葉ノードをもたず/,/スタック.*最後に記録した操作から/,/リスト.*添字で直接/,/配列.*移動は常に不要/],1),
    entry(/階層構造/,[/木の節には高々二つ.*子がない/,/スタック.*最初に入れた/,/リスト.*すべての要素を連続/,/配列.*整列しないと添字/],0),
    entry(/レコードを参照/,[/木では全節を同じ深さ/,/スタック.*追加順と常に同じ/,/リスト.*任意位置へ直接/,/配列.*添字から目的要素の位置/],3),
  ]],
  // Binary search discards half according to its comparison order; linear
  // search examines one item at a time. Hashing can collide and still compares keys.
  [14,[
    entry(/^2分探索/,[/データ列は整列/,/常に速く/,/先頭から開始/,/n log₂ nに比例/],0),
    entry(/文字列.*2分探索/,[/比較規則が一致/,/先頭文字だけ/,/4件ずつ/,/先頭要素を最初/],0),
    entry(/^線形探索/,[/整列が必須/,/常に比較回数が少ない/,/先頭から開始し，順番/,/常に1回/],2),
    entry(/固定長.*ハッシュ探索/,[/整列し，中央/,/キーを照合する理由がなく/,/先頭から開始/,/格納位置にアクセスし，候補のキーを照合/],3),
  ]],
  // Event associated with the executing instruction versus a machine failure
  // reported independently (exam classification).
  [20,[
    entry(/^外部割込み/,interruptCauses,2),entry(/ページフォールト/,interruptCauses,0),
    entry(/システムコール命令/,interruptCauses,1),entry(/結果が表現可能な範囲/,interruptCauses,3),
  ]],
  // Standard memory ECC can correct errors in its supported error model. A
  // CRC uses polynomial remainder, checksum fixed-width sums, parity counts bits.
  [21,[
    entry(/自動訂正/,errorControlTerms,1),entry(/生成多項式.*余り/,errorControlTerms,0),
    entry(/語に分け.*整数.*和/,errorControlTerms,2),entry(/1の個数の偶奇/,errorControlTerms,3),
  ]],
  [24,[
    entry(/^CD-R/,recordingProcesses,3),entry(/^光磁気ディスク/,recordingProcesses,0),
    entry(/^磁気ディスク/,recordingProcesses,1),entry(/^相変化型/,recordingProcesses,2),
  ]],
  [25,[
    entry(/^レーザプリンタ/,metrics,0),entry(/単票印刷用インクジェット/,metrics,0),
    entry(/シリアル型のドットインパクト/,metrics,1),entry(/連続帳票用のライン/,metrics,2),
  ]],
  [26,[
    entry(/プログラムを主記憶に読み込んで/,architecture,3),entry(/アドレス部をどのように解釈/,architecture,0),
    entry(/別の大きなアドレス空間/,architecture,1),entry(/CPUが命令を実行してデータを読み書き/,architecture,2),
  ]],
]);
