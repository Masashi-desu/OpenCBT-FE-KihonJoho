// Labels and causes fixed by paper review and the relevant definitions, separately from the generator.
export const paperSha256 = '6dbc8cdb473d255894482c6b2761f23ca530fd9cd672a761b34a98a6ec923068';
export const answerSha256 = 'b52d656c3ad4ea1748e6121ecceff26b6709b020f8ae1d12e6a257f864cb3dba';
export const paperAnswers = 'ウアエイウエアウエアアエイウイエウアエアエエエウエエ';
export const paperPages = [3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 9, 9, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13];

interface Fact {
  target: RegExp;
  correct: RegExp;
  cause: RegExp;
  reject: readonly RegExp[];
}
export const concepts: Record<number, readonly Fact[]> = {
  4: [
    { target: /丸め誤差/, correct: /四捨五入/, cause: /端数/, reject: [/最大値/, /乗除算/, /上位の有効数字/] },
    { target: /情報落ち/, correct: /小さい方の有効数字/, cause: /指数をそろえる/, reject: [/最大値/, /四捨五入/, /上位の有効数字/] },
    { target: /桁落ち/, correct: /上位の有効数字/, cause: /打ち消され/, reject: [/最大値/, /四捨五入/, /小さい方の有効数字/] },
    { target: /オーバフロー/, correct: /最大値/, cause: /有限の最大値/, reject: [/四捨五入/, /小さい方の有効数字/, /上位の有効数字/] },
  ],
  7: [
    { target: /適切なもの/, correct: /正の傾き.*＋1/, cause: /ピアソン/, reject: [/線形.*0/, /非線形.*負/, /無相関.*−1/] },
    { target: /負の傾き/, correct: /−1になる/, cause: /負の定数倍/, reject: [/0になる/, /＋1になる/, /決まらない/] },
    { target: /共分散が0/, correct: /0になる/, cause: /分母の標準偏差/, reject: [/−1になる/, /＋1になる/, /決まらない/] },
    { target: /正の傾き/, correct: /＋1になる/, cause: /正の定数倍/, reject: [/−1になる/, /0になる/, /決まらない/] },
  ],
  16: [
    { target: /フリップフロップ/, correct: /^SRAM$/, cause: /Static Random Access Memory/, reject: [/^DRAM$/, /^RDRAM$/, /^SDRAM$/] },
    { target: /コンデンサ.*総称/, correct: /^DRAM$/, cause: /Dynamic Random Access Memory/, reject: [/^SRAM$/, /^RDRAM$/, /^SDRAM$/] },
    { target: /Rambus社/, correct: /^RDRAM$/, cause: /Rambus Dynamic Random Access Memory/, reject: [/^DRAM$/, /^SRAM$/, /^SDRAM$/] },
    { target: /外部クロック.*総称/, correct: /^SDRAM$/, cause: /Synchronous Dynamic Random Access Memory/, reject: [/^DRAM$/, /^RDRAM$/, /^SRAM$/] },
  ],
  20: [
    { target: /外部割込み/, correct: /インターバルタイマ/, cause: /外部の経過時間/, reject: [/演算結果/, /ページ/, /割込み命令/] },
    { target: /算術演算の異常/, correct: /演算結果/, cause: /算術命令/, reject: [/インターバルタイマ/, /ページ/, /割込み命令/] },
    { target: /仮想ページ/, correct: /ページへのアクセス/, cause: /ページフォールト/, reject: [/インターバルタイマ/, /演算結果/, /割込み命令/] },
    { target: /明示的/, correct: /ソフトウェア割込み命令/, cause: /プログラムが意図/, reject: [/インターバルタイマ/, /演算結果/, /ページ/] },
  ],
  22: [
    { target: /メモリインタリーブ/, correct: /幾つかの区画/, cause: /異なるバンク/, reject: [/キャッシュ.*書き込む/, /ギャップ/, /更新と同時/] },
    { target: /ライトバック/, correct: /追い出す際/, cause: /追い出す際/, reject: [/論理アドレス空間/, /更新と同時/, /幾つかの区画/] },
    { target: /仮想記憶/, correct: /論理アドレス空間/, cause: /論理アドレスを物理アドレスに/, reject: [/追い出す際/, /更新と同時/, /幾つかの区画/] },
    { target: /ライトスルー/, correct: /更新と同時/, cause: /書込みで主記憶にも/, reject: [/追い出す際/, /論理アドレス空間/, /幾つかの区画/] },
  ],
  23: [
    { target: /2ビットの誤り検出/, correct: /ハミング符号/, cause: /拡張ハミング/, reject: [/奇数パリティ/, /水平パリティ/, /チェックサム/] },
    { target: /1の個数が奇数/, correct: /奇数パリティ/, cause: /奇数個の反転/, reject: [/ハミング符号/, /水平パリティ/, /チェックサム/] },
    { target: /同じビット位置/, correct: /水平パリティ/, cause: /同じビット位置の検査結果/, reject: [/ハミング符号/, /奇数パリティ/, /チェックサム/] },
    { target: /方法で加算/, correct: /チェックサム/, cause: /再計算/, reject: [/ハミング符号/, /奇数パリティ/, /水平パリティ/] },
  ],
  24: [
    { target: /ブロックに分割/, correct: /ストライピング/, cause: /並列/, reject: [/アットワンス/, /キャッシュ/, /ミラーリング/] },
    { target: /リードインからリードアウト/, correct: /アットワンス/, cause: /最終化/, reject: [/ストライピング/, /キャッシュ/, /ミラーリング/] },
    { target: /高速なメモリに一時保持/, correct: /キャッシュ/, cause: /ディスクを読まず/, reject: [/ストライピング/, /アットワンス/, /ミラーリング/] },
    { target: /同じデータを複数台/, correct: /ミラーリング/, cause: /同一データの複製/, reject: [/ストライピング/, /キャッシュ/, /アットワンス/] },
  ],
  25: [
    { target: /^USB/, correct: /三つのデータ転送/, cause: /Universal Serial Bus.*480 Mbit/, reject: [/パラレルインタフェース/, /FireWire/, /モデム/] },
    { target: /^パラレルSCSI/, correct: /パラレルインタフェース/, cause: /Small Computer System Interface/, reject: [/三つのデータ転送/, /FireWire/, /モデム/] },
    { target: /^IEEE 1394/, correct: /FireWire/, cause: /アイソクロナス転送/, reject: [/パラレルインタフェース/, /三つのデータ転送/, /モデム/] },
    { target: /^RS-232C/, correct: /モデム/, cause: /Recommended Standard/, reject: [/パラレルインタフェース/, /FireWire/, /三つのデータ転送/] },
  ],
  26: [
    { target: /CPUが順次/, correct: /プログラム記憶方式/, cause: /中央処理装置/, reject: [/アドレス方式/, /直接プログラム制御/, /仮想記憶方式/] },
    { target: /準備状態をCPUが/, correct: /直接プログラム制御/, cause: /データの転送を自分/, reject: [/割込み入出力/, /プログラム記憶方式/, /仮想記憶方式/] },
    { target: /論理的な記憶領域/, correct: /仮想記憶方式/, cause: /物理アドレス/, reject: [/割込み入出力/, /直接プログラム制御/, /プログラム記憶方式/] },
    { target: /配線の変更/, correct: /プログラム記憶方式/, cause: /命令列を書き換え/, reject: [/割込み入出力/, /直接プログラム制御/, /仮想記憶方式/] },
  ],
};
