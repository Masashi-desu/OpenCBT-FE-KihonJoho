// Spaces are fixed to the source roles. The frame glyphs distinguish loops
// (filled square) from branches (filled triangle), including the source's
// alternate-arm separator. Blank tokens and alpha are painted separately.
export const autumn2013Pm5Program = (numbered: boolean) => {
  const row = (guide: string, number: string, text: string) =>
    guide + (numbered && number ? number : '') + text;
  return [
    '○プログラム（整数型：x，整数型：a，整数型：b，整数型：c，整数型：d）',
    row('■ ', '① ', 'x ＞ 10'),
    row('│  ', '② ', '• func1()'),
    row('│  ▲ ', '③ ', '(a ＜ 10) or ' + (numbered ? '④ ' : '') + '(b ＜ 20)'),
    row('│  │  ', '⑤ ', '• func2()'),
    '│  ├─',
    row('│  │  ', '⑥ ', '• func3()'),
    '│  ▼',
    row('│  ▲ ', '⑦ ', '(c ＞ 10) and ' + (numbered ? '⑧ ' : '') + '(d ＞ 10)'),
    row('│  │  ', '⑨ ', '• func4()'),
    '│  │     • exit      /* 繰返しを抜ける */',
    '│  ├─',
    row('│  │  ', '⑩ ', '• func5()'),
    '│  ▼',
    row('│  ', '⑪ ', '• func6()'),
    '■',
  ].join('\n');
};

export const autumn2013Pm8CompressSignature = [
  '○副プログラム：Compress（文字型：Plaindata[]，整数型：Plength，',
  '                          文字型：Compresseddata[]，整数型：Clength）',
  '○文字型：Esym',
  '○整数型：Pindex，Cindex',
  '○整数型：Maxfitnum，Maxdistance，Distance，Fitnum',
].join('\n');

export const autumn2013Pm8CompressProgram = [
  '▲ Plength ≥ 1',
  '│  • Esym ← "$"                 /* 制御記号の設定 */',
  '│  • Pindex ← 0                 /* 圧縮前の文字列の文字位置を初期化 */',
  '│  • Cindex ← 0                 /* 圧縮後の文字列の文字位置を初期化 */',
  '│  ■ (Pindex ＜ Plength) and (Pindex ＜ 4)',
  '│  │  • Compresseddata[Cindex] ← Plaindata[Pindex]',
  '│  │  • Cindex ← Cindex + 1',
  '│  │  • Pindex ← Pindex + 1',
  '│  ■',
  '│  ■ Pindex ＜ Plength',
  '│  │  • Maxfitnum ← −1',
  '│  │  • Maxdistance ← −1',
  '│  │  • Distance ← 4',
  '│  │  ■ (Distance ≤ 26) and (［a］)',
  '│  │  │  • Fitnum ← 0',
  '│  │  │  /* 同じ文字並びの文字数を調べる */',
  '│  │  │  ■ (Fitnum ＜ Distance) and ((Pindex + Fitnum) ＜ Plength)',
  '│  │  │  │  /* 文字が一致するかどうかを調べる */',
  '│  │  │  │  ▲ Plaindata[Pindex + Fitnum] ≠ ［b］',
  '│  │  │  │  │  • break   /* 最も内側の繰返し処理を終了する */',
  '│  │  │  │  ▼',
  '│  │  │  │  • Fitnum ← Fitnum + 1',
  '│  │  │  ■',
  '│  │  │  /* 文字数が4以上，かつ，最も多いかどうかを調べる */',
  '│  │  │  ▲ (Fitnum ≥ 4) and (Maxfitnum ＜ Fitnum)',
  '│  │  │  │  • Maxfitnum ← Fitnum',
  '│  │  │  │  • Maxdistance ← Distance',
  '│  │  │  ▼',
  '│  │  │  • ［c］',
  '│  │  ■',
  '│  │  ▲ Maxfitnum ＝ −1',
  '│  │  │  • Compresseddata[Cindex] ← Plaindata[Pindex]',
  '│  │  │  • Cindex ← Cindex + 1',
  '│  │  │  • Pindex ← Pindex + 1',
  '│  │  ├─',
  '│  │  │  • Compresseddata[Cindex] ← Esym',
  '│  │  │  • Compresseddata[Cindex + 1] ← IntToAlphabet(Maxdistance)',
  '│  │  │  • Compresseddata[Cindex + 2] ← IntToAlphabet(Maxfitnum)',
  '│  │  │  • Cindex ← Cindex + 3',
  '│  │  │  • ［d］',
  '│  │  ▼',
  '│  ■',
  '│  • Clength ← Cindex',
  '▼',
].join('\n');

export const autumn2013Pm8DecompressSignature = [
  '○副プログラム：Decompress（文字型：Compresseddata[]，整数型：Clength，',
  '                            文字型：Plaindata[]，整数型：Plength）',
  '○文字型：Esym',
  '○整数型：Pindex，Cindex',
  '○整数型：Num，Fitcnt，Start',
].join('\n');
export const autumn2013Pm8DecompressHead = [
  '▲ Clength ≥ 1',
  '│  • Esym ← "$"',
  '│  • Cindex ← 0',
  '│  • Pindex ← 0',
  '│  ■ Cindex ＜ Clength',
  '│  │  ▲ Compresseddata[Cindex] ≠ Esym',
].join('\n');
export const autumn2013Pm8Alpha = [
  '│  │  │  • Plaindata[Pindex] ← Compresseddata[Cindex]',
  '│  │  │  • Pindex ← Pindex + 1',
  '│  │  │  • Cindex ← Cindex + 1',
].join('\n');
export const autumn2013Pm8DecompressTail = [
  '│  │  ├─',
  '│  │  │  • Num ← AlphabetToInt(Compresseddata[Cindex + 2])',
  '│  │  │  • Start ← AlphabetToInt(Compresseddata[Cindex + 1])',
  '│  │  │  ■ Fitcnt：0，Fitcnt ＜ Num，1',
  '│  │  │  │  • Plaindata[Pindex + Fitcnt] ← ［e］',
  '│  │  │  ■',
  '│  │  │  • Pindex ← Pindex + Num',
  '│  │  │  • Cindex ← Cindex + 3',
  '│  │  ▼',
  '│  ■',
  '│  • Plength ← Pindex',
  '▼',
].join('\n');
