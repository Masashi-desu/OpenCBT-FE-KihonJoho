import type{StudyTerm}from'../study-acronyms';
export const legacy2018AutumnPm9StudyTerms:StudyTerm[]=[
 {term:'C',meaning:'プログラミング言語の名称。構造体へのポインタ，固定長配列，再帰呼出しを用いて区間と列車を表す。略語の正式名称を推測しない。'},
 {term:'NULL（C）',meaning:'ヌルポインタ定数として使うマクロ。本問では列車がいない又は接続先区間がないことを表す。ポインタがNULLのときにその先のメンバへアクセスしてはならない。'},
 {term:'構造体へのポインタ',meaning:'構造体の位置を指す値。block->trainはblockが指す区間の列車，block->next[i]は接続先を指すポインタで，現在区間自身とは別のもの。'},
 {term:'閉塞区間',meaning:'同時に一つの列車だけを置ける路線の区間。全区間の信号を一斉に更新してから列車を動かすので，移動元が空になってもその回の信号は直ちに緑へ戻らない。'},
 {term:'break',meaning:'最も内側の繰返し又はswitchを抜ける文。本問では列車を一つの次区間へ移した後，接続先を調べる内側のforを抜ける。'},
 {term:'continue',meaning:'現在の繰返しの残りを飛ばして次の反復へ進む文。本問の内側forでは別の接続先へ進むので，移動後のbreakと同じ意味にならない。'},
 {term:'return',meaning:'現在の関数から呼出し元へ戻る文。proceedの残りの区間まで処理する必要があるため，移動後にreturnすることはbreakと異なる。'},
 {term:'再帰',meaning:'関数の中で同じ関数を呼ぶこと。find_blockは次区間を新しい探索起点とし，目的地destを変えずに探索を続ける。'}
].map(t=>({...t,sources:['2018h30a-fe-pm-9']}));
