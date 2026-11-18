import { code, p, table } from './definition';
import { answers, asCode, bankBlocks, define, single } from './legacy-2005-spring-pm-01-05-shared';
import { draw } from './legacy-2005-spring-pm-01-05-figures';
import { replaceExample } from './legacy-2005-spring-pm-01-05-models';
import { spring2005PmPageAssetId, spring2005PmReference } from './legacy-2005-spring-pm-materials';

const assignment=['B[Bidx] ← A[Aidx]','B[Bidx] ← S[0]','Idx ← 0','Idx ← 1','Sidx ← 0','Sidx ← 1'];
const comparisons=['A[Aidx] ≠ EOS','A[Aidx] ＝ S[Sidx]','A[Aidx] ≠ S[Sidx]',
  'A[Aidx] ≠ S[Sidx]  and  S[Sidx] ≠ EOS','S[Sidx] ＝ EOS','S[Sidx] ≠ EOS'];
const program=[
  '○ Replace(文字型：A[], 文字型：S[], 文字型：D[], 文字型：B[])',
  '○ 整数型：Aidx, Sidx, Didx, Bidx, Idx',
  '・Aidx ← 0',
  '・Bidx ← 0',
  '■ A[Aidx] ≠ EOS',
  '│  ▲ A[Aidx] ＝ S[0]',
  '│  │  ・Idx ← Aidx',
  '│  │  ・［a］',
  '│  │  ■                        /* 後判定繰返し処理を示す */',
  '│  │  │  ・Sidx ← Sidx ＋ 1     /* 処理を実行する */',
  '│  │  │  ・Aidx ← Aidx ＋ 1     /* 条件式が真の間，処理を繰り返す */',
  '│  │  ■ ［b］  and  A[Aidx] ≠ EOS',
  '│  │  ▲ ［c］',
  '│  │  │  ・Didx ← 0',
  '│  │  │  ■ D[Didx] ≠ EOS',
  '│  │  │  │  ・B[Bidx] ← D[Didx]',
  '│  │  │  │  ・Didx ← Didx ＋ 1',
  '│  │  │  │  ・Bidx ← Bidx ＋ 1',
  '│  │  │  ■',
  '│  │  ├────',
  '│  │  │  ・［d］',
  '│  │  │  ・Aidx ← Idx ＋ 1',
  '│  │  │  ・Bidx ← Bidx ＋ 1',
  '│  │  ▼',
  '│  ├────',
  '│  │  ・B[Bidx] ← A[Aidx]',
  '│  │  ・Aidx ← Aidx ＋ 1',
  '│  │  ・Bidx ← Bidx ＋ 1',
  '│  ▼',
  '■',
  '・B[Bidx] ← EOS',
].join('\n');
const refs=[2,3];
export function spring2005Pm2Pages(index:number,print=true) {
  return [
    [p('次のプログラムの説明及びプログラムを読んで，設問に答えよ。'),
      p('〔プログラムの説明〕'),p('副プログラムReplaceは，文字列を置換するプログラムである。'),
      p('（1）Replaceは，文字列Aを先頭からコピーして文字列Bを作る。このとき，文字列A中に文字列Sと一致する文字列を見つけるたびに，文字列Dの内容に置き換える。'),
      p('（2）このプログラムで扱う文字列は，1文字ずつ文字型配列の要素に順に格納されていて，最後の文字の次に定数EOSが格納されている。配列の添字は0から始まる。'),
      ...(print?[]:[p('ここで，照合文字列Sは1文字以上とする。')]),
      p('（3）文字列A，S，Dは，それぞれ文字型配列A[]，S[]，D[]に格納されていて，文字列Bは文字型配列B[]に格納する。文字型配列B[]は十分に大きいものとする。'),
      p('（4）副プログラムの引数の仕様を表に，実行例を図に示す。'),
      table('表　Replaceの引数の仕様',['引数名','データ型','入力／出力','意味'],[
        ['A[]','文字型','入力','対象文字列'],['S[]','文字型','入力','照合文字列'],
        ['D[]','文字型','入力','置換文字列'],['B[]','文字型','出力','結果文字列']]),
      draw('replace-arrays',index,'図　Replaceの実行例')],
    [p('〔プログラム〕'),code(program),p('設問　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
      ...(print?bankBlocks('a，dに関する解答群',asCode(assignment)):[])],
    print?bankBlocks('b，cに関する解答群',asCode(comparisons)):[],
  ];
}
export const spring2005Pm2=define(
  2,'EOSで終わる文字列の先頭からの置換','a=オ／b=イ／c=オ／d=イ',
  '対象・照合・置換の文字列とEOSの添字',
  '対象・照合・置換文字列と結果配列の例を変更し、生成問題では照合文字列が1文字以上であることを示す。',
  'EOS、添字0、結果配列の容量、後判定繰返しの字下げと例を保持。原題は「最後の文字の次」を文字列の形式として読み、照合文字列を非空として検算。',
  index=>{
    const {a,s,d,ours}=replaceExample(index);
    return {prompt:spring2005Pm2Pages(index,false).flat(),contexts:[spring2005PmReference('共通に使用される擬似言語の記述形式',refs)],
      ...answers([asCode(assignment),asCode(comparisons)],[single('a','a',0,4),single('b','b',1,1),single('c','c',1,4),single('d','d',0,1)]),
      explanation:'先頭が一致した場所の添字をIdxに退避し，Sidxを0にする。次の文字を調べている間は照合する文字が等しく，AがEOSでなければ進む。'+
        'SがEOSなら一致を最後まで確認したのでDを出力する。途中で不一致なら，試した位置の文字S[0]だけを出してIdx＋1から再開する。'+
        a+'を左から走査し，'+s+'を'+d+'へ置き換えた結果は'+ours+'で，その直後にEOSを置く。'};
  },{answerVariation:'fixed',fixedReferenceAssetIds:refs.map(spring2005PmPageAssetId)},
);
