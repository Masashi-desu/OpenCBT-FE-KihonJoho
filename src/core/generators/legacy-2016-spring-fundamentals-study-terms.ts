import type {StudyTerm} from '../study-acronyms';
/** Own explanations from the explicit source rules; scoped to these eight only. */
export const legacy2016SpringStudyTerms:StudyTerm[]=[
 {term:'左シフト',meaning:'ビット列を左へ移す操作。この問では正の整数であふれが起きないので、1ビットごとに値が2倍になる。符号幅や算術右シフトの規則は追加しない。',sources:['2016h28h-fe-am-1']},
 {term:'オートマトン',meaning:'入力記号を順に読み、現在の状態から遷移規則に従って状態を変えるモデル。最後に受理状態にいるかを判定する。',sources:['2016h28h-fe-am-2']},
 {term:'正規表現',meaning:'文字列の集合を規則で表す表記。原に示された文字クラス、1回以上の+、0回以上の*の規則を使い、候補文字列全体の所属を調べる。',sources:['2016h28h-fe-am-3']},
 {term:'UNIX',meaning:'原問題で正規表現の文脈として示された名称。この問では本文に明示された四つの規則を用い、特定コマンドの検索オプションや部分一致を追加しない。',sources:['2016h28h-fe-am-3']},
 {term:'PCM',expansion:'Pulse Code Modulation',meaning:'パルス符号変調。音声などを標本化し、各標本をディジタル値で表す方式。この問では1標本のビット数と圧縮しない転送速度から時間間隔を求める。',sources:['2016h28h-fe-am-4']},
 {term:'2分探索木',meaning:'各節の左の子孫に小さい値、右の子孫に大きい値を置く木。この問は1から10を一意に使い、左・節・右の順に読むと昇順になる。',sources:['2016h28h-fe-am-5']},
 {term:'配列の添字',meaning:'配列の要素を指定する引数。入れ子の参照は内側の値を先に求め、外側の添字へ代入する。原は物理的な格納順を定めていない。',sources:['2016h28h-fe-am-6']},
 {term:'再帰',meaning:'関数が自分自身を呼ぶ定義。階乗では引数を減らして基底n=0へ到達させる。同じ正の引数を呼び続ける式とは停止性が異なる。',sources:['2016h28h-fe-am-7']},
 {term:'商と余り',meaning:'正整数で除算すると、被除数は除数×商+余りと表せ、余りは0以上で除数より小さい。原の自然数という語が0を含む場合の非停止境界は別に確認する。',sources:['2016h28h-fe-am-8']}
];
