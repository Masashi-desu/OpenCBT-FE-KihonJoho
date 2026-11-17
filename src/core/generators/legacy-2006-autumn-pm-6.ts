import { code,p } from './definition';
import { bank,draftQuestion,type Page } from './legacy-2006-autumn-pm-06-09-support';

const samples=[
  {target:'1632',guess:'7613'},
  {target:'582',guess:'285'},
  {target:'76521',guess:'51327'},
  {target:'290637',guess:'209356'},
] as const;

const conditions=[
  'isMatch(target, num) == FALSE',
  'isMatch(target, num) == TRUE',
  'isValidNumber(num) == FALSE',
  'isValidNumber(num) == TRUE',
];
const comparisons=['num[i] == num[j]','target[i] == num[i]','target[i] == num[j]','target[i] == target[j]','target[j] == num[j]'];
const positions=['i != j','i < j','i <= j','i == j','i > j','i >= j'];
const success=['numHit != DIGITS','numHit + numBlow == DIGITS','numHit + numBlow >= DIGITS','numHit == DIGITS','numHit == numBlow','numHit > numBlow'];

export function cProgram(digits: number, original: boolean) {
  const parameters=original?'()':'(void)';
  return [
    '#include <stdio.h>',
    '#define DIGITS '+digits+'   /* けた数 */',
    '#define TRUE   1',
    '#define FALSE  0',
    '',
    'void createRandomNumber(char[]);',
    'int isValidNumber(char[]);',
    'void GuessNumber'+parameters+';',
    'int isMatch(char[], char[]);',
    '',
    'void GuessNumber'+parameters+'{',
    '    char target[DIGITS + 1];    /* 目標数の保存領域 */',
    '    char num[DIGITS + 1];       /* 推測数の保存領域 */',
    '    int count = 0;              /* 推測回数 */',
    '',
    '    createRandomNumber(target);    /* 目標数の生成 */',
    '    do{',
    '        printf("[%d回目] 各けたが異なる%dけたの数を入力してください:",',
    '                                                       ++count, DIGITS);',
    '        scanf("%'+digits+'s", num);',
    '        while(［a］){',
    '            printf("入力が正しくありません。再度入力してください:");',
    '            scanf("%'+digits+'s", num);',
    '        }',
    '    }while(［b］);',
    '}',
    '',
    'int isMatch(char target[], char num[]){',
    '    int i, j, numHit = 0, numBlow = 0;',
    '',
    '    for(i = 0; i < DIGITS; i++){',
    '        for(j = 0; j < DIGITS; j++){',
    '            if(［c］){',
    '                if(［d］){',
    '                    numHit++;',
    '                } else {',
    '                    numBlow++;',
    '                }',
    '            }',
    '        }',
    '    }',
    '    if(［e］){',
    '        printf("正解です。 \\n");',
    '        return TRUE;',
    '    }',
    '    printf("%sは%dHit,%dBlowです。 \\n\\n", num, numHit, numBlow);',
    '    return FALSE;',
    '}',
  ].join('\n');
}

const oneProgramLanguage = '次の問6から問9までの4問については，この中から1問を選択し，答案用紙の選択欄の（選）をマークして解答してください。なお，2問以上選択した場合には，はじめの1問について採点します。';

export const q6 = draftQuestion(6,'C：数当てゲームの Hit と Blow','目標数と推測数のけた数','a=ウ b=ア c=ウ d=エ e=エ',
  '入力検査、do-whileの終了条件、二重ループの文字一致・けた一致、一致数による終了判定の5空欄を保持。けた数を3〜6に変え、バッファ・scanfの幅・サンプルを同期。原紙p21の関数見出しの宣言順序は原問題に保持し、生成版はC構文へ整え、引数を取らない GuessNumber は (void) と明示する。原問のプログラムp22の宣言・関数定義は当時のC構文で有効。テストでは仕様の4けた等の入力単位を前提に、入力検査関数と目標生成関数の契約を実装して操作を検証する。', (index,original)=>{
    const {target,guess}=samples[index];
    const digits=target.length;
    const hits=[...target].filter((digit,i)=>guess[i]===digit);
    const blows=[...target].filter((digit,i)=>guess[i]!==digit && guess.includes(digit));
    const quote=(chars: string[])=>chars.map(digit=>'“'+digit+'”').join('と');
    const pages:Page[]=[
      {page:21,altPrefix:oneProgramLanguage,blocks:[
        p('問6　次の C プログラムの説明及びプログラムを読んで，設問に答えよ。'),
        p('〔プログラムの説明〕'),
        p('プログラムが生成した各けたの数字が異なる '+digits+' けたの目標数を，なるべく少ない回数の推測で当てるゲーム GuessNumber である。回答者は，各けたが異なる '+digits+' けたの推測数を入力し，当たらなかった場合，次の情報を得ることができる。'),
        p('①　目標数に含まれていて，けたも一致している数字の個数（以下，Hit 数という）'),
        p('②　目標数に含まれているが，けたが一致していない数字の個数（以下，Blow 数という）'),
        p('例えば，目標数が “'+target+'” で推測数が “'+guess+'” の場合，'+quote(hits)+' はけたも一致しているので Hit 数が '+hits.length+'，'+quote(blows)+' はけたが一致していないので Blow 数が '+blows.length+' となる。'),
        p('（1）目標数はプログラムが自動的に生成する。生成した数字列は char 型の配列 target に格納する。推測数を文字列として標準入力から読み込み，char 型の配列 num に格納したうえで照合する。目標数と完全に一致するまで繰り返す。'),
        p('（2）次の関数が用意されている。'),
        code(original?'void createRandomNumber(char[] target)':'void createRandomNumber(char target[])','c'),
        p('機能　'+digits+' けたの目標数を文字列として左のけたから順に配列 target に格納する。各けたの数字はすべて異なっている。'),
        code(original?'int isValidNumber(char[] num)':'int isValidNumber(char num[])','c'),
        p('機能　文字列 num 中の各文字がすべて異なる数字のとき TRUE を，それ以外のとき FALSE を返す。'),
      ]},
      {page:22,blocks:[p('〔プログラム〕'),code(cProgram(digits,original),'c')]},
      {page:23,blocks:[p('設問　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')],
        banks:[bank('ab',conditions,'ウア','c',undefined,'a，b に関する解答群'),
          bank('c',comparisons,'ウ','c'),bank('d',positions,'エ','c'),bank('e',success,'エ','c')]},
    ];
    return {pages,explanation:'a は推測数が無効な間だけ再入力する判定。b は一致しなかった間だけ推測を続ける。c の target[i] と num[j] が同じ文字なら，d の i と j の一致時に Hit，異なる場合に Blow を数える。各数字は一度しか現れないので，Hit 数が '+digits+' に達する条件 e が完全一致になる。本文例は '+hits.length+' Hit，'+blows.length+' Blow。'};
  }, 'fixed');
