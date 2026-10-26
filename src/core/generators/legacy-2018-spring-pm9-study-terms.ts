import type {StudyTerm} from '../study-acronyms';
import {legacy2018CSummaryStudyTerms} from './legacy-2018-pm-c-summary-study-terms';
export const legacy2018SpringPm9StudyTerms:StudyTerm[]=[...legacy2018CSummaryStudyTerms,{term:'EOF',expansion:'End Of File',meaning:'入力の終わり。Cのfgetsは入力の終わりで文字を読み込めなかったときNULLを返す。この問では最初の読込みが成功した場合だけ群を作り、ループを抜けたあと最後の群を出力する。',sources:['2018h30h-fe-pm-9']}];
