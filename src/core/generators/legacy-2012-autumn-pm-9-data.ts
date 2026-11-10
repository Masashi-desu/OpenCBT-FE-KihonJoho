export const lotteryCases = [
  { digits: 6, numbers: [['223692'], ['141421', '314159'], ['27182', '00145'], ['3301', '1028'], ['243', '101', '144'], ['03', '92']], example: '123456' },
  { digits: 5, numbers: [['63027'], ['49263', '70638'], ['1842', '0026'], ['594', '731'], ['26', '54', '47'], ['1', '7']], example: '21030' },
  { digits: 7, numbers: [['5103836'], ['3762821', '4301012'], ['771828', '000659'], ['21301', '83128'], ['1045', '5211', '0463'], ['301', '836']], example: '3512099' },
  { digits: 8, numbers: [['10270414'], ['30846317', '22596501'], ['1195242', '0028105'], ['709182', '510905'], ['16033', '04239', '30377'], ['1403', '0414']], example: '12345000' },
] as const;

export const firstLotteryChanges = [
  ['行番号5，6を変更', 'void check_winning_lot(char *[], char **[LOT_GNUM],\n                       int [LOT_GNUM], int [LOT_GNUM]);'],
  ['行番号8～10を変更', 'void check_winning_lot(char *lots[],\n                       char **win_list[LOT_GNUM],\n                       int winner[LOT_GNUM], int special[LOT_GNUM]) {'],
  ['行番号11と12の間に追加', '    int pflg, nflg, m;\n    char pnum[LOT_DNUM + 1], nnum[LOT_DNUM + 1];'],
  ['行番号13と14の間に追加', '        special[i] = 0;'],
  ['行番号14と15の間に追加', [
    '            /* 前後賞の当選確認用数字列の作成 */',
    '            pflg = nflg = 0;',
    '            for (m = [d]; m >= 0; m--) {',
    '                pnum[m] = nnum[m] = [e];',
    '                if (pflg == 0) {',
    '                    if (pnum[m] == [f1]) {',
    '                        pnum[m] = [f2];',
    '                    } else {',
    '                        pnum[m]--;',
    '                        pflg = 1;',
    '                    }',
  ].join('\n')],
];
export const secondLotteryChanges = [
  ['', [
    '                }',
    '                if (nflg == 0) {',
    '                    if (nnum[m] == [f2]) {',
    '                        nnum[m] = [f1];',
    '                    } else {',
    '                        nnum[m]++;',
    '                        nflg = 1;',
    '                    }',
    '                }',
    '            }',
    "            pnum[LOT_DNUM] = nnum[LOT_DNUM] = '\\0';",
  ].join('\n')],
  ['行番号16と17の間に追加', [
    '                if (strlen(win_list[i][k]) == LOT_DNUM) {',
    '                    special[i] += check_lot(pnum, win_list[i][k]);',
    '                    special[i] += check_lot(nnum, win_list[i][k]);',
    '                }',
  ].join('\n')],
];
