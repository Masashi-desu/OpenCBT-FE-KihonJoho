import { code, p } from './definition';
import { bank, createLanguageDefinition, page } from './legacy-2013-autumn-pm-09-13-support';
import { groupingSheet } from './legacy-2013-autumn-pm-13-sheet';
import { languageFigure } from './legacy-2013-autumn-pm-09-13-figures';
import { autumn2013PmPageAssetId, autumn2013PmReference } from './legacy-2013-autumn-pm-materials';

const pseudoPages = [3, 4];
const spreadsheetPages = [79, 80, 81, 82, 83, 84];
const groupFormula = `○マクロ：Grouping
○数値型：I, J, NumUsers, NumGroups
・NumUsers ← STUDENTS
・NumGroups ← 5
■ I：1, I ≦ NumGroups, 1
    ■ J：1, J ≦ NumUsers, 1
        ・相対(B2, J, I) ← 0
    ■
    ・［e］
■
■ I：1, I ≦ ［f］, 1
    ・［g］
■`;

export const autumn2013Pm13 = createLanguageDefinition(13, '受講学生のグループ分け（表計算）', '受講者数とグループの定員',
  'abcdefg', '設問1 a=ク，b=イ，c=ア，d=イ／設問2 e=カ，f=キ，g=イ',
  '受講者数と各グループ定員、グループ長、定員充足と類似度を変え、セル範囲、推薦結果、マクロを更新します。5グループと1人の長、同率時の受講者番号・グループ番号の優先順、数式の絶対参照と相対参照、マクロの入れ子・空欄順・共有解答群を保持します。',
  index => {
    const { students, capacity, lastRow, fullRow, recommendationRow, lastColumn, recommendation, groups } = groupingSheet(index);
    const full = 'C$' + fullRow, selectedStudent = 'C' + recommendationRow, selectedGroup = 'G' + recommendationRow;
    // Replace the three original row tokens together: new row 52, 53 or 55
    // can otherwise match another substitution.
    const rows = (options: string[]) => options.map(text =>
      text.replace(/(?<=[A-Z$])(52|55|53)\b/g, n => String(n === '52' ? lastRow : n === '55' ? recommendationRow : fullRow)));
    return {
      pages: [
        page(65, [
          p('問13　次の表計算のワークシート及びマクロの説明を読んで，設問1，2に答えよ。'),
          p('〔表計算の説明〕ある科目を受講する学生を、知人関係の情報に基づいてグループ分けするプログラムを表計算ソフトで作成した。対象の学生は' + students + '人、各グループは' + capacity + '人で、あらかじめ1人のグループ長が決められている。'),
          p('〔ワークシート：知人関係類似度行列〕任意の2学生の知人関係の情報を表現した“知人関係類似度行列”を作成した。その例を図1に示す。'),
          languageFigure(13, 'similarity-sheet', index, '図1　ワークシート“知人関係類似度行列”の例'),
          p('（1）各学生には1〜' + students + 'の受講者番号が振られている。A3〜A' + lastRow + 'に番号を1から順に、B3〜B' + lastRow + 'に対応する氏名を入力する。同様にC1〜' + lastColumn + '1には番号を、C2〜' + lastColumn + '2には氏名を入力する。'),
          p('（2）C3〜' + lastColumn + lastRow + 'には、対応する2人の知人関係の類似性をある指標に基づいて数値化した値（類似度）を格納する。類似度は0以上1以下で、学生2人の組合せが同じであれば同じ値である。例えば受講者番号1の佐藤一郎と受講者番号2の鈴木二郎の類似度に対応'),
        ]),
        page(66, [
          p('するセルC4，D3には同じ値が格納される。また、同一学生に当たるセルC3，D4，…，' + lastColumn + lastRow + 'には0を入力する。'),
          p('〔ワークシート：グループ分け〕“知人関係類似度行列”を基に、図2の“グループ分け”を作成した。'),
          languageFigure(13, 'grouping-sheet', index, '図2　ワークシート“グループ分け”'),
          p('（1）A3〜A' + lastRow + 'に番号を1から順に、B3〜B' + lastRow + 'に対応する氏名を入力する。（2）C1〜G1に1から順にグループ番号を入力する。（3）C2〜G2に各グループ長の受講者番号を入力する。'),
          p('（4）C3〜G' + lastRow + 'には各学生（グループ長を含む）が対応グループに割り当てられている場合は1、それ以外は0を入力する。（5）H3〜H' + lastRow + 'には既にいずれかのグループに割り当てられていれば1、そうでなければ0を表示する。（6）C' + fullRow + '〜G' + fullRow + 'には各グループの人数が' + capacity + '人なら1、そうでなければ0を表示する。（7）このシートには推薦機能がある。'),
        ]),
        page(67, [
          p('どのグループにも未割当の学生と、人数が' + capacity + '人に達していないグループのグループ長との組合せから、類似度が最大の組合せを抽出し、その学生の受講者番号とグループ番号を行' + recommendationRow + 'に表示する。同率の場合、①受講者番号が最も小さい組合せ、②その中でグループ番号が最も小さい組合せを優先する。（8）列JからQを計算領域に用いる。'),
          p('設問1　“グループ分け”の推薦機能に関する次の記述中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('（1）J3〜N' + lastRow + 'に各学生と対応するグループ長との類似度を入れる。ただし学生が既に割当済み、又はグループの人数が' + capacity + '人なら−1を入れる。次の式をJ3に入力し、J3〜N' + lastRow + 'に複写する。'),
          code('IF(［a］, −1, 表引き(知人関係類似度行列!$C$3〜$' + lastColumn + '$' + lastRow + ',\n   ［b］))', 'text'),
          p('（2）各学生の候補グループを選定するため、次の式をO3に入力し、O4〜O' + lastRow + 'に複写する。'),
          code('最大(J3〜N3)', 'text'),
          p('次の式をQ3に入力し、Q4〜Q' + lastRow + 'に複写する。'),
          code('照合一致(O3, J3〜N3, 0)', 'text'),
          p('（3）推薦する受講者番号を表示するため、次の式をP3に入力し、P4〜P' + lastRow + 'に複写する。'),
          code('順位(O3, O$3〜O$' + lastRow + ', 1)', 'text'),
          p('さらに、次の式をセル' + selectedStudent + 'に入力する。'), code('［c］', 'text'),
        ]),
        page(68, [
          p('（4）推薦する学生の割当先グループ番号を表示するために、次の式をセル' + selectedGroup + 'に入力する。'), code('［d］', 'text'),
        ], [
          bank(1, 'a', ['論理積', '論理和'].flatMap(op => [0, 1].flatMap(i =>
            [0, 1].map(j => op + '($H3＝' + i + ', ' + full + '＝' + j + ')'))), 'ク', 'text'),
          bank(1, 'b', ['$A3, C$1', '$A3, C$2', 'A$3, C$1', 'A$3, C$2'], 'イ', 'text'),
          bank(1, 'c', rows([
            '照合一致(1, P3〜P52, 0)', '照合一致(' + students + ', P3〜P52, 0)',
            '照合検索(1, P3〜P52, O3〜O52)', '照合検索(' + students + ', P3〜P52, O3〜O52)',
            '条件付個数(H3〜H52, ＝1)', '条件付個数(O3〜O52, ＝−1)', '条件付個数(O3〜O52, ≠−1)',
          ]), 'ア', 'text'),
          bank(1, 'd', rows([
            '整数(条件付個数(H3〜H52, ＝1)／' + capacity + ')＋1',
            '表引き(Q3〜Q52, C55, 1)', '照合一致(C55, P3〜P52, 0)',
            '照合検索(C55, P3〜P52, O3〜O52)', '照合検索(C55, Q3〜Q52, A3〜A52)',
            '条件付個数(C53〜G53, ＝1)＋1',
          ]), 'イ', 'text'),
        ]),
        page(69, [
          p('設問2　“グループ分け”のC2〜G2にグループ長の受講者番号を入力して実行すると、以後を自動化するマクロGroupingを同シートに格納した。'),
          p('①C3〜G' + lastRow + 'を全て0で初期化する。②5人のグループ長をそれぞれのグループに割り当てるため、C3〜G' + lastRow + 'の対応セルを1にする。③推薦する受講者番号は' + selectedStudent + '、グループ番号は' + selectedGroup + 'に表示されるので、対応するセルを1にする。④全員がいずれかのグループに割り当てられるまで③を繰り返す。'),
          p('マクロGrouping中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          p('〔マクロ：Grouping〕'), code(groupFormula.replace('STUDENTS', String(students)), 'pseudocode'),
        ]),
        page(70, [], [
          bank(2, 'eg', rows([
            '相対(B2, C55, I) ← 1', '相対(B2, C55, G55) ← 1', '相対(B2, I, G55) ← 1',
            '相対(B2, I, 相対(B2, 0, I)) ← 1', '相対(B2, I, 相対(B2, C55, I)) ← 1',
            '相対(B2, 相対(B2, 0, I), I) ← 1', '相対(B2, 相対(B2, C55, I), I) ← 1',
            '相対(B2, 相対(B2, 0, G55), I) ← 1',
          ]), 'カイ', 'text'),
          bank(2, 'f', ['NumGroups', 'NumGroups * NumGroups', 'NumUsers', 'NumUsers * (NumGroups − 1)',
            'NumUsers * NumGroups', 'NumUsers ＋ NumGroups', 'NumUsers − NumGroups', 'NumUsers ／ NumGroups'], 'キ', 'text'),
        ]),
      ],
      contexts: [
        autumn2013PmReference('共通に使用される擬似言語の記述形式', pseudoPages),
        autumn2013PmReference('表計算ソフトの機能・用語（基本情報技術者試験用）', spreadsheetPages),
      ],
      explanation: '割当済みの行か定員充足の列を論理和で除く。表引きの行には列Aの受講者番号、列には行2のグループ長番号を使うので、複写時にはA列と行2を固定する。行最大値とその最初の位置を求め、順位1の最初の行で受講者番号を決め、同じ行のQ列からグループ番号を読む。この例では受講者番号' + recommendation + '、グループ' + groups[recommendation - 1] + '。マクロはB2からグループ長番号だけ下、グループ番号だけ右のセルを先に1にし、残り' + (students - 5) + '人には推薦表示の行・列の相対位置を使う。',
    };
  }, [...pseudoPages, ...spreadsheetPages].map(autumn2013PmPageAssetId));
