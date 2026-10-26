import type{StudyTerm}from'../study-acronyms';
const source='2018h30h-fe-pm-1';
export const legacy2018PasswordStudyTerms:StudyTerm[]=[
 {term:'SHA',expansion:'Secure Hash Algorithm',meaning:'暗号学的ハッシュ関数の系列名。本問のSHA-256は入力長によらず256ビットの値を出力する。パスワードを秘密鍵で暗号化して保存する方式とは異なる。'},
 {term:'RSA',expansion:'Rivest–Shamir–Adleman（考案者の姓）',meaning:'考案者の姓に由来する公開鍵暗号方式の名称。暗号化や署名に用いる。署名の処理でハッシュを利用することと、RSA自体をハッシュ関数名とすることは区別する。'},
 {term:'Diffie-Hellman',meaning:'二者が共有する秘密の値を合意する鍵共有アルゴリズム。人名に由来する名称であり、架空の略語展開を加えない。ハッシュ関数そのものの名前ではない。'},
 {term:'暗号学的ハッシュ関数',meaning:'入力データから固定長の値を得る関数。同じ関数と同じ入力なら同じ値となる。異なる入力が同じ値になる衝突は理論上あり得るが、簡単に衝突や元の入力を求められることを目標とする関数ではない。'},
 {term:'ソルト',meaning:'パスワードに連結してハッシュ化するランダムな文字列。本問では保存の都度生成し、ハッシュ値とともに保存する。照合では保存したソルトを読み出す。秘密にすること自体を対策の理由とはしない。'},
 {term:'事前計算による辞書攻撃',meaning:'よく使われるパスワードを先にハッシュ化して一覧表を作り、漏えいしたハッシュ値から元の候補を検索する攻撃。本問のソルトは、ソルトごとの計算が必要となる点で一覧表の使い回しを難しくする。'},
 {term:'オフライン総当たり攻撃',meaning:'漏えいしたファイルを攻撃者の手元で調べ、候補を逐次ハッシュ化して保存値と照合する攻撃。サービスへのログイン試行だけを制限しても、この手元の計算を直接制限するわけではない。'},
 {term:'ストレッチング',meaning:'パスワードから照合用の値を得る計算を繰り返し、一つの候補を試す計算量を増やす考え方。本問は前のハッシュ値の後ろにソルトとパスワードを連結して再計算する当時の教材モデルで、候補長や出力長、ファイルとの比較回数を増やすものではない。'},
].map(t=>({...t,sources:[source]}));
export const legacy2018PasswordInheritedStudyTerms=['ID','AES','TLS'].map(term=>({source,term,canonicalModule:'src/core/study-acronyms.ts',canonicalSource:null}));
