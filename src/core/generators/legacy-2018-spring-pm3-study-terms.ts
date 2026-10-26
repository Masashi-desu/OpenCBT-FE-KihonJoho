import type {StudyTerm} from '../study-acronyms';import {legacy2018MembersStudyTerms} from './legacy-2018-pm-members-study-terms';
export const legacy2018SpringPm3StudyTerms:StudyTerm[]=[...structuredClone(legacy2018MembersStudyTerms),{term:'SQL',expansion:'Structured Query Language',meaning:'関係データベースを操作する言語。本問では条件に合う行の抽出、児童数の集計、在籍児童がいない保護者の削除を扱う。',sources:['2018h30h-fe-pm-3']}];
