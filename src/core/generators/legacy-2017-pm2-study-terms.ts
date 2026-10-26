import type{StudyTerm}from"../study-acronyms";
export const legacy2017Pm2StudyTerms:StudyTerm[]=[
  {
    "term": "A/D変換器",
    "expansion": "Analog-to-Digital Converter",
    "meaning": "アナログの検出値を有限個のディジタル値へ対応付ける。本問の3ビット出力は000～111で，レベル1～8とは1ずれる。"
  },
  {
    "term": "LED",
    "expansion": "Light-Emitting Diode",
    "meaning": "発光ダイオード。本問では7本の字形セグメントと小数点の点灯状態をビットへ対応させる。"
  },
  {
    "term": "CPU",
    "expansion": "Central Processing Unit",
    "meaning": "中央処理装置。本問ではタイマ割込みでプログラムを動かし，表3の命令で機器と入出力する。"
  },
  {
    "term": "I/O",
    "expansion": "Input/Output",
    "meaning": "入力と出力。本問のINPUTは機器からGRへの読込み，OUTPUTはGRから機器への書込みで，宛先ポートと方向を区別する。"
  },
  {
    "term": "GR",
    "meaning": "本問で使うCPUの8ビットのレジスタ名。INPUTで受け取ったデータやOUTPUTする形状データを保持する。"
  },
  {
    "term": "形状データ",
    "meaning": "数字の各セグメントの点灯状態を示す8ビットの値。ビット7を最上位とする2桁16進表記で，小数点のビット0は0。"
  },
  {
    "term": "量子化",
    "meaning": "連続的な検出温度を離散的な基準値に近似する。本問では中点を高い側へ移すので，各内側基準値の区間は下端を含み上端を含まない。"
  },
  {
    "term": "タイマ割込み",
    "meaning": "一定間隔のタイマによって割込みプログラムが起動される。本問は処理完了が割込み間隔より十分短いと仮定する。"
  },
  {
    "term": "ポーリング",
    "meaning": "機器の状態を読み返して完了を待つ動作。図3ではI/Oポート2が0の間INPUT2へ戻り，非0になった後に出力値を読む。"
  }
].map(t=>({...t,sources:["2017h29h-fe-pm-2"]}));
export const legacy2017Pm2StudyTermReview={
  "source": "2017h29h-fe-pm-2",
  "terms": [
    "A/D変換器",
    "LED",
    "CPU",
    "I/O",
    "GR",
    "形状データ",
    "量子化",
    "タイマ割込み",
    "ポーリング"
  ],
  "formalAbbreviations": [
    [
      "A/D変換器",
      "Analog-to-Digital Converter"
    ],
    [
      "LED",
      "Light-Emitting Diode"
    ],
    [
      "CPU",
      "Central Processing Unit"
    ],
    [
      "I/O",
      "Input/Output"
    ]
  ],
  "note": "原の検出/表/配線/ポートの範囲。GRはレジスタ名で正式名や符号解釈を追加しない。タイマ起動と状態ポーリングを区別する。"
};
