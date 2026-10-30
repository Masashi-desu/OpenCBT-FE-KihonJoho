import{field,p,figure,strings,type GenerationDefinition}from'./definition';
import{spring2019Pm9Profiles as profiles,spring2019Pm9Banks as banks,spring2019Pm9BankCaptions as captions,spring2019Pm9Histogram,spring2019Pm9Figure,spring2019Pm9ReferenceBlock,spring2019Pm9ReferenceNoticeBlock}from'./legacy-2019-spring-pm9-model';
export const legacy2019SpringPm9Definition:GenerationDefinition={source:'2019h31h-fe-pm-9',title:'旧制度・午後：C言語による文字出現回数の印字',version:'3.2.0',answerVariation:'fixed',fields:[field('印字例の出現回数条件',0,16)],reference:[0],sourceAnswer:'aイ bカ cイ dウ eエ fイ gイ',
 notes:'原5頁47〜51・2設問7欄/24固有択30参照を保持。binary全256値/64行×4列/EOF/int chr/long32/20〜7Eだけ文字併記/頻度降順同値コード昇順・stable bubbleと3変更を保持。0は原に表示されたpartial印字例のみで未表示freqを推定しない。1〜16は全256値の完全histogram4型×scale4に基づく実印字例で、両図の全表示値を同じhistogramから導く。一般算法の正答は固定で、変化は単なる名前/選択肢順ではない。原参照1.3文を保持し95文字の独立参考を解答前に明示、規範的JIS対応表とは呼ばない。原JIS表/文言は含めず、原Questionも参照資料置換だけisModifiedとする。独立95facts/newlayoutと当該年度のIPA本文/答はroot素材scope645dcb7b…の限定判断を受領。原JIS1.3は除外を維持し，95表示/通知/帰属と原source-unit/通常App/冊子配布は別受入。',
 build(values){if(values.length!==1)throw Error('PARAMETER_CONSTRAINT');const scenario=values[0];spring2019Pm9Histogram(scenario);
  const draw=(kind:number,group:number,caption:string)=>{const model=spring2019Pm9Figure(profiles[kind],[scenario,group]);const alt=model.kind==='program'?model.text:model.kind==='bank'?model.entries.join('。'):model.kind==='changes'?model.rows.map(r=>r.join('：')).join('。'):model.kind==='example'?model.rows.map(row=>row.map(c=>`${c.code.toString(16).toUpperCase().padStart(2,'0')} ${c.count}`).join('、')).join('。'):'';const b=figure(profiles[kind],[scenario,group],caption,caption+'。'+alt);return kind===1&&group===1&&b.type==='diagram'?{...b,captionPresentation:'accessible' as const}:b;};
  const bank=(i:number)=>draw(3,i,captions[i]);
  const prompt=[
   p('次の問9から問13までの5問については，この中から1問を選択し，選択した問題については，答案用紙の選択欄の選をマークして解答してください。なお，2問以上マークした場合には，はじめの1問について採点します。'),
   p('問9 次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
   p('入力ファイルを読み込んで，文字コードごとの出現回数を印字するプログラムである。'),p('〔プログラムの説明〕'),
   p('(1) 入力ファイルは，バイナリファイルとして読み込む。入力ファイル中の各バイトの内容（ビット構成）に制約はない。入力ファイル名は，#defineで指定する。'),
   p('(2) 入力ファイル中の各バイトについて，文字コード（16進数00〜FFで表示する）ごとの出現回数を求めて印字する。印字例を，図1に示す。'),
   p('(3) 印字様式を次に示す（記号❶，❷，❸は，図1中の記号を指している）。'),
   p('・1行目に，処理したバイト数を❶の形式で印字する。'),
   p('・3行目以降に，出現回数とその文字コードを❷の形式で印字する。ただし，文字コードが20〜7Eの場合は，文字コードの後にそれが表す文字（文字は，この冊子の末尾にあるアセンブラ言語の仕様の1.3で規定するもの）を❸の形式で印字する。文字コードは，64行×4列の範囲に，上から下，左から右に文字コードの昇順となるように並べる。'),
   p('(4) プログラム中で使用している関数fgetc(s)は，ストリームsから文字を読み込んで返す。ストリームsが入力ファイルの終わりに達しているときはEOFを返す。'),
   p('(5) 入力ファイルのサイズは，long型（32ビットとする）で表現できる数値の範囲を超えないものとする。'),
   spring2019Pm9ReferenceNoticeBlock(),draw(0,0,'図1 印字例（文字コード順）'),draw(1,0,'〔プログラム〕'),
   p('設問1 プログラム中の［空欄］に入れる正しい答えを，解答群の中から選べ。'),bank(0),bank(1),
   p('設問2 次の記述中の［空欄］に入れる正しい答えを，解答群の中から選べ。ここで，記述中の［b］と［c］には，設問1の正しい答えが入っているものとする。'),
   p('文字コードを出現回数の降順に並べて印字する処理を追加する。追加した処理による印字例を，図2に示す。印字の様式は，文字コードの並び順を除いて，図1の3行目以降の様式と同じである。同じ出現回数の文字コードは，それらを文字コードの昇順に並べる。'),
   draw(0,1,'図2 追加した処理による印字例（出現回数順）'),
   p('この処理のために，プログラムの行①の直後に，次の宣言を追加する。'),draw(1,1,'追加する宣言'),
   p('さらに，プログラムの行②の位置に，次の整列処理部を追加する。'),draw(1,2,'〔整列処理部〕'),
   p('ここで，整列処理部で使用しているSwap(x, y)は，xとyの内容を入れ替えるために用意したマクロである。'),
   p('整列処理部では，整列対象のデータ数が比較的少なく，また同じ出現回数の文字コードは元の並び順が維持されるので，バブルソートを使用している。'),
   p('行④のwhile文のブロックを1回実行すると，配列の走査範囲（要素番号0〜ih）中の出現回数の最小値とその文字コードが，要素番号ihの位置に置かれ，配列の走査範囲が1だけ狭められる。これを繰り返して整列を行う。この処理では，while文のブロックの実行回数は常に［d］回となる。'),
   p('ここで，while文のブロックの1回の繰返しにおいて，行⑥のif文のブロック内の処理が最後に実行されたときのiの値をixとすると，行⑤のfor文のブロックの実行が終了した時点で，配列freqの要素番号［e］以降の要素の値は整列済みとなっている。これを利用して，整列処理部を表1に示すように変更すれば，while文のブロックの実行回数を減らす可能性がある。'),
   draw(2,0,'表1 整列処理部の変更内容'),bank(2),bank(3),bank(4),bank(5)
  ];
  const offsets=[0,3,3,9,13,17,20],sizes=[3,6,6,4,4,3,4],answers=[1,5,1,2,3,1,1];
  return{prompt,contexts:[{title:'独立参考：この問題で印字に用いる文字と符号値',presentation:'text_figure',blocks:[spring2019Pm9ReferenceBlock()]}],choices:strings(banks.flat()),answerParts:sizes.map((size,i)=>({id:`part-${'abcdefg'[i]}`,label:`設問${i<3?1:2} ${'abcdefg'[i]}`,choiceIds:Array.from({length:size},(_,j)=>`choice-value-${offsets[i]+j+1}`)})),partAnswers:answers.map((a,i)=>({kind:'choice',partId:`part-${'abcdefg'[i]}`,choiceId:`choice-value-${offsets[i]+a+1}`})),explanation:'a：cntはEOFまでに読み込んだバイト数であり，入力が空なら0である。b/c：外側iは0〜63で，各行はi，i+64，i+128，i+192の4列を印字するので，上限はi+192，増分は64となる。freq[256]は範囲外であり，列間で配列の端を越えてはならない。d：初期ih=255を1ずつ減らし，ih>0の間反復するので255回。e：最後に交換した添字ixより後ろ，すなわちix+1以降は整列済みである。f/g：whileの各回でixを0に戻すため行④の直後にix=0を入れ，交換位置を記録した後はih=ixとする。交換がなければix=0のまま次のwhile条件で終了する。比較はfreq[i]<freq[i+1]なので，同数の文字コードを交換せず，初期のコード昇順を保つ。'};
 }};
