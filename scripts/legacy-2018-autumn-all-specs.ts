/** Pure complete source-local specs. No registration, file I/O or public admission. */
import{autumn2018OwnerSpecs}from'./legacy-2018-autumn-owner-specs';import{legacy2018AutumnPm5To7Specs}from'./legacy-2018-autumn-pm5-7-specs';import{autumn2018LanguageSpecs}from'./legacy-2018-autumn-language-specs';import type{Autumn2018PreparedSpec}from'./import-legacy-2018-autumn-pm-preparation';
export const autumn2018AllSpecs:Autumn2018PreparedSpec[]=[...autumn2018OwnerSpecs,...legacy2018AutumnPm5To7Specs,...autumn2018LanguageSpecs].sort((a,b)=>a.number-b.number);
