type Finding = {focus:string;options:readonly (readonly [string,boolean])[]};
const finding=(focus:string,options:Finding['options']):Finding=>({focus,options});

const accuracy = [
  ['アンダフロー',false], ['打切り誤差',false], ['けた落ち',false], ['情報落ち',false],
] as const;
const memoryTypes = [['DRAM',false],['SRAM',false],['フラッシュメモリ',false],['マスクROM',false]] as const;
const storageUnits = [['磁気ディスク',false],['ディレクトリ',false],['ファイル',false],['論理ディスク',false]] as const;
const cachePurposes = [
  ['アドレス変換を高速',false],['ページング処理を高速',false],['プロセッサの処理速度の差',false],['プログラムを常駐',false],
] as const;
function only(focus:string,candidates:Finding['options'],truthful:number):Finding {
  return finding(focus,candidates.map(([phrase],i)=>[phrase,i===truthful]));
}

// 原題と改変条件を別査読し、判定に必要な各候補の意味を対応させた。
export const knowledgeFacts:Record<number,readonly Finding[]>={
  // 浮動小数点の指数合わせ、指数下限、有効数字の消失と有限項の打切りを区別する。
  4:[
    only('絶対値の小さなものから',accuracy,3),
    only('指数の下限を下回らない',accuracy,0),
    only('計算に使う項を増やす',accuracy,1),
    only('に式変形して計算',accuracy,2),
  ],
  // Newtonはf′を使う。区間を挟む二分法、二点の関数値を使う割線法の更新を区別する。
  5:[
    finding('近似値を求めるアルゴリズムとして知られているニュートン法',[
      ['微分不可能であっても',false],['接線を利用',true],['初期値を二つ',false],['必ず解の近似値',false],
    ]),
    finding('両端点で異なる符号',[
      ['符号が異なる側の半区間',true],['符号に関係なく左半分',false],['接線を計算',false],['符号が同じ側の半区間だけ',false],
    ]),
    finding('割線法に関する記述',[
      ['一点の接線',false],['二つの近似値の算術平均',false],['異なる二点を結ぶ直線',true],['常に収束',false],
    ]),
    finding('初期値1からニュートン法',[
      ['初期値のうち小さい方',false],['導関数の値はどの反復でも使わない',false],['固定値1を代入',false],['その接線のx切片',true],
    ]),
  ],
  // ソートの操作を名称と照合。ピボット区分、ギャップ、隣接交換、木の優先順の対応。
  14:[
    finding('データの整列方法',[
      ['クイックソートでは，ある一定間隔',false],['シェルソートでは，隣り合う',false],
      ['バブルソートでは，中間的な基準値',false],['ヒープソートでは，未整列の部分を順序木',true],
    ]),
    finding('基準値で区分',[
      ['クイックソートでは，中間的な基準値',true],['シェルソートでは，隣り合う',false],
      ['バブルソートでは，未整列の部分を順序木',false],['ヒープソートでは，一定間隔',false],
    ]),
    finding('間隔を変えながら部分列を整列',[
      ['クイックソートでは，未整列の部分を順序木',false],['シェルソートでは，一定間隔',true],
      ['バブルソートでは，中間的な基準値',false],['ヒープソートでは，隣り合う',false],
    ]),
    finding('隣接する要素の比較と交換',[
      ['クイックソートでは，一定間隔',false],['シェルソートでは，未整列の部分を順序木',false],
      ['バブルソートでは，隣り合う',true],['ヒープソートでは，中間的な基準値',false],
    ]),
  ],
  // DRAMの電荷補充、SRAMのラッチ、フラッシュ消去・書換え、マスクROM製造時固定。
  16:[
    only('電源を切っても内容を保持できる',memoryTypes,2),
    only('セルの電荷を補うリフレッシュ',memoryTypes,0),
    only('回路の状態でビットを保持',memoryTypes,1),
    only('製造時に内容が決まり',memoryTypes,3),
  ],
  // 要因、再開に必要な文脈、I/O通知、同時要求の優先度。
  19:[
    finding('割込みに関する記述',[
      ['情報を磁気ディスクの特定の領域',false],['常に割込みの発生を感知',false],
      ['動作完了の通知は，内部割込み',false],['個々の割込み原因には優先順位',true],
    ]),
    finding('中断した処理を再開',[
      ['復帰に必要な情報を保存',true],['例外なく割込み要因をポーリング',false],
      ['実行状態はどの場所にも保持しない',false],['プログラムを先頭から開始',false],
    ]),
    finding('入出力装置からの割込み',[
      ['命令に起因する内部割込み',false],['1命令ずつ自動的に取り消す',false],
      ['外部割込みとして扱う',true],['常に全装置を無効化',false],
    ]),
    finding('異なる優先度のマスクされていない割込み要求',[
      ['常に同じ優先度',false],['優先度が高いものから受け付ける',true],
      ['アプリケーションが優先度を検査',false],['必要な情報を保存する必要がなくなる',false],
    ]),
  ],
  // TLB、主記憶キャッシュ、補助記憶からのページ先読みのアドレスとデータを区別する。
  20:[
    only('キャッシュメモリの使用目的',cachePurposes,2),
    only('仮想ページ番号に対応する物理ページ番号',cachePurposes,0),
    finding('補助記憶から先読み',[
      ['ページテーブルの常駐を強制',false],['実際の参照時のページ待ちを減らす',true],
      ['プロセッサの処理速度の差',false],['プログラムを常駐',false],
    ]),
    only('主記憶のブロックを高速な小容量メモリに保持',cachePurposes,2),
  ],
  // DMAのデータ経路、書戻しのタイミング、キャッシュの複製、独立バンクの並行アクセス。
  21:[
    finding('メモリインタリーブ',[
      ['CPU経由でなく直接',false],['キャッシュがあふれたとき',false],
      ['キャッシュにコピー',false],['独立して動作するグループ',true],
    ]),
    ...['DMA（Direct Memory Access）','ライトバック方式','キャッシュメモリによる主記憶アクセス'].map((focus,slot)=>
      only(focus,[['CPU経由でなく直接',false],['置き換えられるときに主記憶に書き戻す',false],
        ['キャッシュにコピー',false],['独立して動作するグループ',false]],slot)),
  ],
  // ファイルの識別子とSANのボリュームを区別する。ディレクトリは階層・公開範囲の指定に使う。
  24:[
    only('NAS（Network Attached Storage）',storageUnits,2),
    only('NFSを用いて',storageUnits,2),
    only('SMBを用いて',storageUnits,2),
    only('ブロック番号を指定',storageUnits,3),
  ],
};
