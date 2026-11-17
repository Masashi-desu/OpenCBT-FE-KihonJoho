import { code, p } from './definition';
import { bank, draftQuestion } from './legacy-2007-spring-pm-06-09-support';
import { drawing } from './legacy-2007-spring-pm-06-09-figures';
import { boardCases } from './legacy-2007-spring-pm-06-09-model';

const note = '次の問6から問9までの4問については，この中から1問を選択し，答案用紙の選択欄の（選）をマークして解答してください。なお，2問以上選択した場合には，はじめの1問について採点します。';
const display = (name: string, values: number[]) => 'static int ' + name.padEnd(6) + '[CELLS] = { ' +
  values.slice(0,12).join(', ') + ',\n' + ' '.repeat(29) + values.slice(12).join(', ') + ' };';
function gameCode(index: number, original: boolean) {
  const { players, move, rest } = boardCases[index];
  const targets = new Map<number,number>(move);
  const types = Array.from({length:24},(_,i)=>targets.has(i)?1:rest.some(cell=>cell===i)?2:0);
  const dest = Array.from({length:24},(_,i)=>targets.get(i)??0);
  return `#include <stdio.h>
#define CELLS   24
#define PLAYERS ${players}
#define PLAY    1
#define WAIT    0

int dice(int);
void prtpiece(int);

${display('actype',types)}
${display('celinf',dest)}
static int curpos[PLAYERS], playmode[PLAYERS];

${original ? 'void main()' : 'int main(void)'}
{
   int gamestatus = 1, playerid;

   printf("双六を開始します。\\n");
   for(playerid = 0; playerid < PLAYERS; playerid++){
      curpos[playerid] = 0;
      playmode[playerid] = PLAY;
   }
   playerid = 0;
   while(gamestatus == 1){
      if(playmode[playerid] == PLAY){
         curpos[playerid] += dice(playerid);
         prtpiece(playerid);
         while((curpos[playerid] < CELLS - 1) && (［a］)
               && (playmode[playerid] == PLAY)){
            switch(actype[curpos[playerid]]){
               case 1:    /* 指示先の升へ飛ぶ。 */
                  curpos[playerid] = celinf[curpos[playerid]];
                  prtpiece(playerid);
                  break;
               case 2:    /* 1回休み */
                  playmode[playerid] = WAIT;
                  break;
            }
         }
         if(［b］) gamestatus = 0;
      }
      else playmode[playerid] = PLAY;
      if(gamestatus == 1) ［c］;
   }
   printf("プレーヤID:%dの勝ちです。\\n", playerid);${original ? '' : '\n   return 0;'}
}`;
}

export const q6 = draftQuestion(6, 'C：双六の升の移動・休み・手番と追加ルール',
  'プレーヤ数・移動先・休み升・追加指示で振るさいころの個数', '設問1 aア bエ cウ／設問2 dエ',
  '4欄と勝利境界、移動の連鎖、1回休み、短絡評価の順、表示関数と元の選択肢役割を維持。参加者数・升の指示と追加のさいころ条件を変える。原資料のC関数void mainを原紙では保持し、生成では標準ホストCの入口int main(void)にした。',
  (index, original) => {
    const { players } = boardCases[index];
    const extraRolls = index+1;
    const extra = Array.from({length:extraRolls},()=> 'dice(playerid)').join('; curpos[playerid] += ');
    const dices = index === 0 ? '続けてさいころを振り，駒を進める' : '続けてさいころを' + extraRolls + '回振り，出た目の合計だけ駒を進める';
    return {
      pages: [
        { page:22, altPrefix:note, blocks:[
          p('問6　次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),
          p('(1) 双六のプログラムである。双六とは，図のような一本道のコース上にある升を，“ふりだし”の位置からスタートして，プレーヤが順番にさいころ2個を振って，出た目の和だけ駒を進め，早く“上がり”（ゴール）の位置にたどり着いたプレーヤを勝ちとする遊びである。'),
          drawing('6-course',index),
          p('(2) 双六の進め方は，次のとおりである。'),
          p('① プレーヤは“ふりだし”の升に各自の駒を置き，さいころを振る順番を決める。'),
          p('② 順番にさいころを振って，出た目の和だけ“上がり”方向に駒を進める。'),
          p('③ “上がり”の升に到達すると，そのプレーヤの勝ちとなり，そこでプログラムが終了する。目の和だけ駒を進めた結果が“上がり”の升を超えた場合も，“上がり”とする。'),
          p('④ 升には順番に番号が割り当てられている。番号0の升が“ふりだし”であり，番号23の升が“上がり”である。'),
        ] },
        { page:23, blocks:[
          p('⑤ 升には番号のほかに，到達時の動作指示が割り当てられているものがある。動作指示には，次の2種類があり，その指示に従う。'),
          p('(a) 移動の指示：指示された番号の升に駒を移動する。移動先の升に動作指示がある場合は，その指示に従う。'),
          p('(b) 1回休みの指示：次に順番が回ってきたとき，“さいころを振る番”を1回休む。'),
          p('(3) プレーヤは，' + players + '人とする。' + (original ? '' : ' プレーヤ番号は0から順に手番を迎える。')),
          p('(4) 動作指示は，配列actype及びcelinfに設定されている。'),
          p('(5) 次の関数が，あらかじめ定義されているものとする。'),
          p('① 関数dice　機能：引数で指定されたプレーヤに対してさいころを振る番が来たことを示すメッセージを表示する。プレーヤが改行キーを入力すると，乱数によって2個のさいころの目の和を決めて，その値を表示し，返却値とする。'),
          code('int dice(int playerid);','c'),
          p('引数：playerid プレーヤ番号（0〜' + (players-1) + '）\n返却値：さいころの目の和（2〜12の整数値）'),
          p('② 関数prtpiece　機能：引数で指定されたプレーヤの駒が現在置かれている升の番号と，升に割り当てられている動作指示の内容を表示する。' +
            (original ? '' : ' ゴールを超えた位置では升の配列を参照せず，上がりとして表示する。')),
          code('void prtpiece(int playerid);','c'),
          p('引数：playerid プレーヤ番号（0〜' + (players-1) + '）\n返却値：なし'),
        ] },
        { page:24, blocks:[p('〔プログラム〕'),code(gameCode(index,original),'c')] },
        { page:25, banksAfter:[1,1,3], blocks:[
          p('設問1　プログラム中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2　到達時の動作指示として，“' + dices + '”を追加することにした。そのためにswitch文でのactype[curpos[playerid]]の値が3のときに，次の処理群を挿入する。空欄に入れる正しい答えを，解答群の中から選べ。'),
          code('case 3: /* ' + dices + '。 */\n   ［d］;\n   prtpiece(playerid);\n   break;','c'),
        ], banks:[
          bank('ab', ['actype[curpos[playerid]] != 0','actype[curpos[playerid]] <= 3','curpos[playerid] == 0',
            'curpos[playerid] >= CELLS - 1','gamestatus == 0','gamestatus == 1','playmode[playerid] == PLAY','playmode[playerid] == WAIT'],
            'アエ','c',1,'a，bに関する解答群'),
          bank('c', ['playerid = playerid % PLAYERS + 1','playerid = playerid % (PLAYERS + 1)','playerid = (playerid + 1) % PLAYERS',
            'playerid += 1','playerid += playerid / (PLAYERS - 1)'],'ウ','c',1),
          bank('d', ['curpos[playerid] = celinf[curpos[playerid]]','curpos[playerid] = celinf[curpos[playerid]] + dice(playerid)',
            'curpos[playerid] += celinf[curpos[playerid] + dice(playerid)]','curpos[playerid] += ' + extra,'playmode[playerid] = PLAY'],
            'エ','c',2,'解答群'),
        ] },
      ],
      explanation:[
        'a：上がり未満で動作指示があるときだけ動作を処理する。升の範囲を左の条件で先に確かめてから，配列actypeの要素を参照する。',
        'b：23にちょうど到達した場合と超えた場合の両方で終了する。',
        'c：次の番号は1加えてPLAYERSで割った余りなので，最後のプレーヤの次は0である。',
        'd：現在位置に，' + extraRolls + '回のdiceの返却値の和を加えてから駒の位置を表示する。',
        ...(original?['原紙のvoid mainは処理系が認める入口表記を想定する。標準ホストCのint main(void)に置き換えた検証でも，空欄の答えと処理の順は同じである。']:[]),
      ].join('\n'),
    };
  });
