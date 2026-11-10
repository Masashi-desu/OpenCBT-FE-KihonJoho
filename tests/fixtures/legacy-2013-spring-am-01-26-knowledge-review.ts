/** Independent reading of every option. Predicates identify the concepts, in official choice order.
 * The expected concept is selected from the stem and the cited fact, never from the generator. */
type ReviewedCase = {
  stem: RegExp;
  trueConcept: string;
  options: readonly (readonly [string, RegExp])[];
  explanation: RegExp;
};
const conditions = [
  ['fault_tolerant', /部分的に故障しても.*必要な機能/],
  ['remote', /災害.*遠隔地に予備/],
  ['distributed', /ネットワーク.*資源を共有/],
  ['compare', /並行して処理し.*結果を照合/],
] as const;
const times = [
  ['throughput', /^スループット$/],
  ['turnaround', /^ターンアラウンドタイム$/],
  ['slice', /^タイムスライス$/],
  ['response', /^レスポンスタイム$/],
] as const;
const replacement = [
  ['nru', /参照フラグと変更フラグ.*参照なしかつ変更なし/],
  ['random', /同一の確率でランダム/],
  ['lru', /最も長い間参照されていない/],
  ['fifo', /最も長い間主記憶にあった/],
] as const;
const testTools = [
  ['assertion', /^アサーションチェッカ$/],
  ['simulator', /^シミュレータ$/],
  ['static', /^静的コード解析$/],
  ['coverage', /^テストカバレージ分析$/],
] as const;
const graphics = [
  ['render', /最終段階.*描画.*映像化/],
  ['clip', /外側を除去し.*内側/],
  ['antialias', /画素数.*ギザギザ.*目立たなく/],
  ['shade', /立体感.*陰影/],
] as const;

export const knowledgeReview: Record<number, readonly ReviewedCase[]> = {
  11: [
    { stem: /MPU.*外部割込みの例/, trueConcept: 'outside', options: [
      ['internal_zero', /0で除算/], ['outside', /ウォッチドッグタイマのタイムアウト/],
      ['internal_opcode', /未定義命令/], ['internal_address', /存在しない領域にアクセス/],
    ], explanation: /タイマ.*命令自体から起きた例外ではない/ },
    { stem: /MPU.*内部割込みの例/, trueConcept: 'inside', options: [
      ['outside_io', /入出力装置が転送を完了/], ['outside_timer', /外部タイマ.*周期信号/],
      ['inside', /未定義命令/], ['outside_keyboard', /キーボード.*入力信号/],
    ], explanation: /命令を実行する過程.*内部割込み/ },
    { stem: /補助記憶装置から.*外部割込みの例/, trueConcept: 'outside', options: [
      ['internal_opcode', /不正な命令コード/], ['internal_address', /許可されていない主記憶領域/],
      ['internal_privilege', /特権命令を非特権状態/], ['outside', /ディスク装置が読出し処理の完了を通知/],
    ], explanation: /ディスク装置.*完了通知は外部割込み/ },
  ],
  13: [
    { stem: /^Bluetoothの説明/, trueConcept: 'radio', options: [
      ['usb_address', /最大127台のデバイス/], ['range', /1,000m以上.*定め/],
      ['infrared', /指向性.*向かい合わせ/], ['radio', /免許不要の2\.4GHz帯の電波/],
    ], explanation: /2\.4GHz帯.*最低1,000mを保証しない/ },
    { stem: /^USB 2\.0の説明/, trueConcept: 'usb_address', options: [
      ['usb_address', /ハブを含めて最大127台.*アドレス/], ['range', /1,000m以上.*定め/],
      ['infrared', /指向性.*赤外線/], ['radio', /免許不要の2\.4GHz帯の電波/],
    ], explanation: /7ビットのアドレス.*1〜127/ },
    { stem: /^IrDAの赤外線通信の説明/, trueConcept: 'infrared', options: [
      ['usb_address', /ハブを含めて最大127台.*アドレス/], ['range', /1,000m以上.*定め/],
      ['infrared', /赤外線.*送受光部を向かい合わせ/], ['radio', /免許不要の2\.4GHz帯の電波/],
    ], explanation: /指向性のある光を発光部から受光部/ },
  ],
  14: [
    { stem: /^フォールトトレラントシステム/, trueConcept: 'fault_tolerant', options: conditions, explanation: /故障しても必要なサービスを維持/ },
    { stem: /^遠隔バックアップサイト.*災害対策/, trueConcept: 'remote', options: conditions, explanation: /設備やデータを離れた拠点/ },
    { stem: /^ネットワークによる分散処理/, trueConcept: 'distributed', options: conditions, explanation: /複数のコンピュータが処理を分担/ },
  ],
  16: [
    { stem: /単位時間当たりに処理される仕事の量/, trueConcept: 'throughput', options: times, explanation: /単位時間当たりの処理量/ },
    { stem: /仕事の投入.*処理結果が全て/, trueConcept: 'turnaround', options: times, explanation: /投入してから処理結果が全て/ },
    { stem: /ラウンドロビン.*順番.*CPU時間の単位/, trueConcept: 'slice', options: times, explanation: /順番にタスクへ割り当てるCPU/ },
    { stem: /要求して最初の応答が返り始める/, trueConcept: 'response', options: times, explanation: /要求に対する最初の応答まで/ },
  ],
  20: [
    { stem: /LRU制御方式/, trueConcept: 'lru', options: replacement, explanation: /最後に参照された時点が最も古い/ },
    { stem: /FIFO制御方式/, trueConcept: 'fifo', options: replacement, explanation: /最も早く主記憶に入って/ },
    { stem: /ランダム置換え方式/, trueConcept: 'random', options: replacement, explanation: /全ページを同じ確率/ },
    { stem: /NRU制御方式/, trueConcept: 'nru', options: replacement, explanation: /参照・変更フラグ.*参照なし・変更なし/ },
  ],
  22: [
    { stem: /ホワイトボックステスト.*どれだけの割合/, trueConcept: 'coverage', options: testTools, explanation: /命令，分岐などの割合/ },
    { stem: /成立すべき条件が破られていないか/, trueConcept: 'assertion', options: testTools, explanation: /成立すると宣言した条件/ },
    { stem: /実機が使用できない.*動作を模擬/, trueConcept: 'simulator', options: testTools, explanation: /機器や環境のモデル/ },
    { stem: /コードを実行せず.*到達不能な文/, trueConcept: 'static', options: testTools, explanation: /実行せずに制御フロー/ },
  ],
  23: [
    { stem: /^DRAMの特徴/, trueConcept: 'density', options: [
      ['block', /書込み及び消去を一括又はブロック単位/], ['no_refresh', /リフレッシュ操作又はアクセス操作が不要/],
      ['nonvolatile', /電源が遮断.*情報を保持/], ['density', /セル構造が単純.*高集積化/],
    ], explanation: /電荷を保持する単純なセル.*高集積/ },
    { stem: /^SRAMの特徴/, trueConcept: 'no_refresh', options: [
      ['block', /書込み及び消去を一括又はブロック単位/], ['no_refresh', /給電中.*定期的なリフレッシュが不要/],
      ['nonvolatile', /電源が遮断.*情報を保持/], ['higher_density', /DRAMより.*単純.*高集積化/],
    ], explanation: /給電中に回路の状態を保持/ },
    { stem: /^NAND型フラッシュメモリの特徴/, trueConcept: 'block', options: [
      ['block', /書込みはページ単位.*消去はブロック単位/], ['needs_refresh', /周期的にセルをリフレッシュする必要/],
      ['volatile', /給電を停止.*直ちに失われる/], ['latch', /SRAMと同じラッチ回路/],
    ], explanation: /ページ単位の書込み.*ブロック単位の消去/ },
  ],
  25: [
    { stem: /クリッピングの説明/, trueConcept: 'clip', options: graphics, explanation: /範囲内にある部分だけを残す/ },
    { stem: /レンダリングの説明/, trueConcept: 'render', options: graphics, explanation: /最終的な画像を作る/ },
    { stem: /アンチエイリアシングの説明/, trueConcept: 'antialias', options: graphics, explanation: /階段状の輪郭を目立たなく/ },
    { stem: /シェーディングの説明/, trueConcept: 'shade', options: graphics, explanation: /物体の面に陰影を付け/ },
  ],
};
